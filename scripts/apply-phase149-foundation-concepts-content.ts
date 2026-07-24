import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import type { ApplyPhase22Options } from "./apply-phase22-content";
import { upsertSources } from "./apply-phase22-content";
import { phase149FoundationConcepts, type FoundationConceptDefinition } from "./data/phase149-foundation-concepts";

export type ApplyPhase149Options = ApplyPhase22Options;

type ReviewedConcept = FoundationConceptDefinition & {
  summary: string;
  bodyMd: string;
  sourceMarker: string;
};

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 149 refuses inherited remote database selection: ${key}.`);
  }
}

async function assertAuthority(client: Client, options: ApplyPhase149Options): Promise<void> {
  assertNoRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, ownedRoot)
  ) throw new Error("Phase 149 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 149 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 149 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 149 owned copy must be migrated through 032.");
}

function readReviewedCopy(workspaceRoot: string, definition: FoundationConceptDefinition): ReviewedConcept {
  const markdownPath = path.resolve(workspaceRoot, definition.markdownFile);
  const markdown = fs.readFileSync(markdownPath, "utf8").replace(/\r\n?/g, "\n");
  const summary = markdown.match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1]?.trim();
  const bodyMd = markdown.match(/^## body_md\s*\n+([\s\S]*?)(?=^## 来源)/m)?.[1]?.trim();
  if (!summary || !bodyMd || Array.from(summary).length < 60 || Array.from(summary).length > 180 || Array.from(bodyMd).length < 900) {
    throw new Error(`Phase 149 reviewed copy is incomplete: ${definition.markdownFile}`);
  }
  const digest = createHash("sha256")
    .update(JSON.stringify({ key: definition.key, summary, bodyMd, sources: definition.sources.map((source) => [source.key, source.url]) }))
    .digest("hex");
  return { ...definition, summary, bodyMd, sourceMarker: `curated-content:phase149-foundation-concepts-v1:${digest}` };
}

function localPublicFile(workspaceRoot: string, localPath: string): string {
  return path.join(workspaceRoot, "public", localPath.replace(/^\//, ""));
}

function validateDefinition(workspaceRoot: string, definition: ReviewedConcept): void {
  if (definition.sources.length < 3) throw new Error(`${definition.key} needs at least two references and one diagram source.`);
  const sourceKeys = new Set(definition.sources.map((source) => source.key));
  for (const source of definition.sources) {
    if (!source.archiveUrl?.trim() || !source.archiveLocator?.trim()) throw new Error(`${definition.key} source ${source.key} lacks archive evidence.`);
    if (source.archiveUrl.startsWith("/")) {
      const file = localPublicFile(workspaceRoot, source.archiveUrl);
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`${definition.key} media source is missing: ${source.archiveUrl}`);
    } else if (!/^https?:$/.test(new URL(source.archiveUrl).protocol)) {
      throw new Error(`${definition.key} source ${source.key} has an unsafe URL.`);
    }
  }
  if (definition.sources.filter((source) => source.sourceType !== "user_submission").length < 2) {
    throw new Error(`${definition.key} needs at least two non-editorial sources.`);
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function preflight(client: Client, definitions: ReviewedConcept[]): Promise<void> {
  for (const definition of definitions) {
    const entity = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [definition.entityId]);
    if (entity.length !== 1 || entity[0]?.type !== "concept" || entity[0]?.slug !== definition.expectedSlug || entity[0]?.name !== definition.expectedName) {
      throw new Error(`Phase 149 canonical concept identity mismatch: ${definition.entityId}`);
    }
  }
}

async function alreadyApplied(client: Client, definitions: ReviewedConcept[]): Promise<boolean> {
  for (const definition of definitions) {
    const entity = await rows(client, "SELECT source,summary,body_md FROM entities WHERE id=?", [definition.entityId]);
    const media = await rows(client, "SELECT id FROM media_assets WHERE entity_id=? AND id=? AND review_status='approved' AND usage_status='primary'", [definition.entityId, stableId("phase149-media", definition.entityId)]);
    const references = await rows(client, "SELECT count(*) AS count FROM entity_references WHERE entity_id=? AND id LIKE 'phase149-reference-%' AND review_status='approved'", [definition.entityId]);
    if (entity.length !== 1 || String(entity[0]?.source) !== definition.sourceMarker || String(entity[0]?.body_md) !== definition.bodyMd || media.length !== 1 || Number(references[0]?.count ?? 0) < 2) return false;
  }
  return true;
}

async function clearOwnedPayload(tx: Transaction, entityId: string): Promise<void> {
  await tx.execute({ sql: "DELETE FROM entity_references WHERE entity_id=? AND id LIKE 'phase149-reference-%'", args: [entityId] });
  await tx.execute({ sql: "DELETE FROM media_assets WHERE entity_id=? AND id LIKE 'phase149-media-%'", args: [entityId] });
}

async function insertConcept(tx: Transaction, definition: ReviewedConcept, sourceItemIds: Map<string, string>): Promise<void> {
  await clearOwnedPayload(tx, definition.entityId);
  const updated = await tx.execute({
    sql: "UPDATE entities SET summary=?, body_md=?, source=?, updated_at=datetime('now') WHERE id=? AND type='concept' AND slug=?",
    args: [definition.summary, definition.bodyMd, definition.sourceMarker, definition.entityId, definition.expectedSlug],
  });
  if (updated.rowsAffected !== 1) throw new Error(`Phase 149 failed to update ${definition.entityId}.`);
  for (const source of definition.sources) {
    const sourceItemId = sourceItemIds.get(source.key);
    if (!sourceItemId) throw new Error(`Phase 149 source mapping is missing: ${source.key}`);
    if (source.sourceType === "user_submission") continue;
    await tx.execute({
      sql: "INSERT INTO entity_references (id,entity_id,source_item_id,relation_type,note,review_status) VALUES (?,?,?,?,?,'approved')",
      args: [stableId("phase149-reference", `${definition.entityId}:${source.key}`), definition.entityId, sourceItemId, source.tier === "professional_secondary" ? "reference" : "review", source.summary],
    });
  }
  const diagram = definition.sources.find((source) => source.sourceType === "user_submission");
  if (!diagram) throw new Error(`Phase 149 diagram source is missing: ${definition.key}`);
  const diagramItemId = sourceItemIds.get(diagram.key);
  if (!diagramItemId) throw new Error(`Phase 149 diagram source mapping is missing: ${diagram.key}`);
  await tx.execute({
    sql: "INSERT INTO media_assets (id,entity_id,title,asset_type,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES (?,?,?,'diagram',?,'Fountain Pen Graph editorial','site-original',?,?,?,'approved','primary')",
    args: [stableId("phase149-media", definition.entityId), definition.entityId, definition.imageTitle, definition.imagePath, "本站原创事实示意图，非产品照片；不代表真实比例、颜色、库存或具体型号。", definition.imagePath, diagramItemId],
  });
}

export async function applyPhase149FoundationConceptsContent(client: Client, options: ApplyPhase149Options) {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const definitions = phase149FoundationConcepts.map((definition) => readReviewedCopy(workspaceRoot, definition));
  definitions.forEach((definition) => validateDefinition(workspaceRoot, definition));
  await preflight(client, definitions);
  if (await alreadyApplied(client, definitions)) {
    return { entities: definitions.map((definition) => ({ entityId: definition.entityId, outcome: "noop" as const })) };
  }
  const tx = await client.transaction("write");
  try {
    const allSources = [...new Map(definitions.flatMap((definition) => definition.sources).map((source) => [source.key, source])).values()];
    const sourceItemIds = await upsertSources(tx, allSources);
    for (const definition of definitions) await insertConcept(tx, definition, sourceItemIds);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities: definitions.map((definition) => ({ entityId: definition.entityId, outcome: "updated" as const })) };
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase149-foundation-concepts-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase149FoundationConceptsContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase149-foundation-concepts",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
