import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE63_159_ID,
  PHASE63_159_SLUG,
  PHASE63_JINHAO_BRAND_ID,
  PHASE63_MIXED_SLUG,
  PHASE63_X159_ID,
  PHASE63_X159_SLUG,
  phase63JinhaoPacks,
} from "./data/phase63-jinhao-split";

export type ApplyPhase63Options = ApplyPhase22Options;
export type ApplyPhase63Result = ApplyPhase22Result;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 63 refuses inherited remote selection: ${key}.`);
    }
  }
}

async function assertOwned(
  client: Client,
  options: ApplyPhase63Options,
): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(database, ownedRoot)
  ) {
    throw new Error("Phase 63 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 63 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 63 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 63 owned copy must be migrated through 032.");
  }
}

async function installHard404(
  tx: Transaction,
  input: { batchId: string; actionId: string },
): Promise<void> {
  const source = `/pen/${PHASE63_MIXED_SLUG}`;
  const existing = await tx.execute({
    sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
    args: [source],
  });
  if (existing.rows.length) {
    if (
      existing.rows.length !== 1 ||
      existing.rows[0]?.target_path !== null ||
      String(existing.rows[0]?.redirect_kind) !== "hard_404"
    ) {
      throw new Error("Phase 63 mixed-route redirect collision.");
    }
    return;
  }
  await tx.execute({
    sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, NULL, 'hard_404', ?)",
    args: [
      stableId("phase63-redirect", source),
      input.batchId,
      input.actionId,
      source,
      "The legacy slug conflated Jinhao 159 and X159. Neither canonical target is safe without knowing which product was intended.",
    ],
  });
}

async function ensureIdentity(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({
      sql: "SELECT type, slug FROM entities WHERE id = ?",
      args: [PHASE63_JINHAO_BRAND_ID],
    });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "jinhao") {
      throw new Error("Phase 63 Jinhao brand identity mismatch.");
    }
    const donor = await tx.execute({
      sql: "SELECT type, slug FROM entities WHERE id = ?",
      args: [PHASE63_X159_ID],
    });
    if (
      donor.rows.length !== 1 ||
      String(donor.rows[0]?.type) !== "pen" ||
      ![PHASE63_MIXED_SLUG, PHASE63_X159_SLUG].includes(String(donor.rows[0]?.slug))
    ) {
      throw new Error("Phase 63 mixed Jinhao donor identity mismatch.");
    }
    const historic = await tx.execute({
      sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id",
      args: [PHASE63_159_ID, PHASE63_159_SLUG],
    });
    if (historic.rows.length === 0) {
      await tx.execute({
        sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)",
        args: [PHASE63_159_ID, PHASE63_159_SLUG, "金豪 Jinhao 159"],
      });
    } else if (
      historic.rows.length !== 1 ||
      String(historic.rows[0]?.id) !== PHASE63_159_ID ||
      String(historic.rows[0]?.type) !== "pen" ||
      String(historic.rows[0]?.slug) !== PHASE63_159_SLUG
    ) {
      throw new Error("Phase 63 Jinhao 159 identity/slug collision.");
    }
    if (String(donor.rows[0]?.slug) === PHASE63_MIXED_SLUG) {
      await tx.execute({
        sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?",
        args: [PHASE63_X159_SLUG, "金豪 Jinhao X159", PHASE63_X159_ID],
      });
    }
    const batchKey = "phase63-jinhao-159-x159-split-v1";
    const batchId = stableId("phase63-batch", batchKey);
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)",
      args: [
        batchId,
        batchKey,
        digest(batchKey),
        "Split the mixed Jinhao 159/X159 donor. Reuse donor only for X159 and create historic metal-bodied 159 sibling.",
      ],
    });
    const actionId = stableId("phase63-action", "mixed-159-x159-split");
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'split', ?, ?, ?, 'applied', ?)",
      args: [
        actionId,
        batchId,
        PHASE63_MIXED_SLUG,
        digest(`${PHASE63_X159_ID}:${PHASE63_159_ID}`),
        PHASE63_X159_ID,
        PHASE63_X159_ID,
        "The old donor was retained only for the X159 canonical; historic 159 is a separately created sibling.",
      ],
    });
    for (const targetId of [PHASE63_X159_ID, PHASE63_159_ID]) {
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'split', ?)",
        args: [
          stableId("phase63-lineage", targetId),
          batchId,
          actionId,
          PHASE63_X159_ID,
          targetId,
          "Mixed 159/X159 donor split; legacy route remains hard 404 because no target is safe for an ambiguous request.",
        ],
      });
    }
    await installHard404(tx, { batchId, actionId });
    for (const penId of [PHASE63_159_ID, PHASE63_X159_ID]) {
      await tx.execute({
        sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
        args: [penId, PHASE63_JINHAO_BRAND_ID],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
        args: [stableId("phase63-made-by", penId), penId, PHASE63_JINHAO_BRAND_ID, "Phase 63 canonical Jinhao maker topology"],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
        args: [stableId("phase63-reverse", penId), PHASE63_JINHAO_BRAND_ID, penId, "Phase 63 brand-to-model navigation topology"],
      });
      const makers = await tx.execute({
        sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        args: [penId],
      });
      if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE63_JINHAO_BRAND_ID) {
        throw new Error(`Phase 63 maker topology ambiguous: ${penId}`);
      }
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase63JinhaoSplitContent(
  client: Client,
  options: ApplyPhase63Options,
): Promise<ApplyPhase63Result> {
  await assertOwned(client, options);
  await ensureIdentity(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    structuredClone(phase63JinhaoPacks),
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

async function main(): Promise<void> {
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error("Usage: tsx scripts/apply-phase63-jinhao-split-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase63JinhaoSplitContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase63-jinhao-split-content",
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
