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
  createPhase73FranklinChristophModel20Packs,
  PHASE73_BRAND_SLUG,
  PHASE73_MODEL20_SLUG,
} from "./data/phase73-franklin-christoph-model20";

export type ApplyPhase73Options = ApplyPhase22Options;
export type ApplyPhase73Result = ApplyPhase22Result;

const BRAND_CANDIDATES = {
  slugs: [PHASE73_BRAND_SLUG],
  names: [
    "Franklin-Christoph",
    "Franklin Christoph",
    "富兰克林-克里斯托弗",
    "富兰克林-克里斯托夫",
  ],
} as const;
const MODEL20_CANDIDATES = {
  slugs: [PHASE73_MODEL20_SLUG, "franklin-christoph-model-20"],
  names: [
    "Franklin-Christoph Model 20",
    "Franklin-Christoph Model 20 Marietta",
    "富兰克林-克里斯托弗 Franklin-Christoph Model 20",
    "富兰克林-克里斯托夫 Franklin-Christoph Model 20",
  ],
} as const;
const PHASE73_BRAND_ID = "p73FRCBRAND";
const PHASE73_MODEL20_ID = "p73FRCMODEL20";

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
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 73 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwned(
  client: Client,
  options: ApplyPhase73Options,
): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(database, root)
  ) {
    throw new Error("Phase 73 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (
    database === protectedCatalog ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 73 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (
    !main?.file ||
    fs.realpathSync.native(String(main.file)) !== database
  ) {
    throw new Error("Phase 73 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 73 owned copy must be migrated through 032.");
  }
}

type ResolvedIdentity = { id: string; slug: string; name: string };

async function resolveStrict(
  tx: Transaction,
  input: {
    label: string;
    type: "brand" | "pen";
    slugs: readonly string[];
    names: readonly string[];
  },
): Promise<ResolvedIdentity> {
  const matches = new Map<string, ResolvedIdentity>();
  for (const slug of input.slugs) {
    const result = await tx.execute({
      sql: "SELECT id, slug, name FROM entities WHERE type = ? AND slug = ? ORDER BY id",
      args: [input.type, slug],
    });
    for (const row of result.rows) {
      matches.set(String(row.id), {
        id: String(row.id),
        slug: String(row.slug),
        name: String(row.name),
      });
    }
  }
  for (const name of input.names) {
    const result = await tx.execute({
      sql: "SELECT id, slug, name FROM entities WHERE type = ? AND name = ? ORDER BY id",
      args: [input.type, name],
    });
    for (const row of result.rows) {
      matches.set(String(row.id), {
        id: String(row.id),
        slug: String(row.slug),
        name: String(row.name),
      });
    }
  }
  if (matches.size !== 1) {
    throw new Error(
      `Phase 73 strict ${input.label} identity lookup requires exactly one exact slug/title match; found ${matches.size}.`,
    );
  }
  return [...matches.values()][0]!;
}

async function resolveOrCreate(
  tx: Transaction,
  input: {
    label: string;
    type: "brand" | "pen";
    slugs: readonly string[];
    names: readonly string[];
    id: string;
    slug: string;
    name: string;
  },
): Promise<ResolvedIdentity & { created: boolean }> {
  const matches = new Map<string, ResolvedIdentity>();
  for (const slug of input.slugs) {
    const result = await tx.execute({ sql: "SELECT id, slug, name FROM entities WHERE type = ? AND slug = ? ORDER BY id", args: [input.type, slug] });
    for (const row of result.rows) matches.set(String(row.id), { id: String(row.id), slug: String(row.slug), name: String(row.name) });
  }
  for (const name of input.names) {
    const result = await tx.execute({ sql: "SELECT id, slug, name FROM entities WHERE type = ? AND name = ? ORDER BY id", args: [input.type, name] });
    for (const row of result.rows) matches.set(String(row.id), { id: String(row.id), slug: String(row.slug), name: String(row.name) });
  }
  if (matches.size > 1) throw new Error(`Phase 73 ${input.label} identity lookup is ambiguous: ${matches.size} exact matches.`);
  if (matches.size === 1) return { ...[...matches.values()][0]!, created: false };
  await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, ?, ?, ?)", args: [input.id, input.type, input.slug, input.name] });
  return { id: input.id, slug: input.slug, name: input.name, created: true };
}

function assertMariettaIdentity(model: ResolvedIdentity): void {
  const identity = `${model.name} ${model.slug}`.toLowerCase();
  if (
    !identity.includes("model-20") &&
    !identity.includes("model 20")
  ) {
    throw new Error("Phase 73 resolved pen is not an exact Model 20 candidate.");
  }
  if (identity.includes("pocket") || identity.includes("model-p20")) {
    throw new Error(
      "Phase 73 refuses to relabel pocket 20 as full-size Marietta without a separate identity migration.",
    );
  }
}

async function installRedirect(
  tx: Transaction,
  input: { source: string; target: string; batchId: string; actionId: string },
): Promise<void> {
  if (input.source === input.target) return;
  const existing = await tx.execute({
    sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
    args: [input.source],
  });
  if (existing.rows.length > 0) {
    if (
      existing.rows.length !== 1 ||
      String(existing.rows[0]?.target_path) !== input.target ||
      String(existing.rows[0]?.redirect_kind) !== "permanent"
    ) {
      throw new Error(`Phase 73 redirect collision: ${input.source}`);
    }
    return;
  }
  await tx.execute({
    sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')",
    args: [
      stableId("phase73-redirect", input.source),
      input.batchId,
      input.actionId,
      input.source,
      input.target,
    ],
  });
}

async function prepareIdentity(
  client: Client,
): Promise<{ brandId: string; penId: string }> {
  const tx = await client.transaction("write");
  try {
    const brand = await resolveOrCreate(tx, {
      label: "Franklin-Christoph brand",
      type: "brand",
      ...BRAND_CANDIDATES,
      id: PHASE73_BRAND_ID,
      slug: PHASE73_BRAND_SLUG,
      name: "Franklin-Christoph",
    });
    const model = await resolveOrCreate(tx, {
      label: "Franklin-Christoph Model 20",
      type: "pen",
      ...MODEL20_CANDIDATES,
      id: PHASE73_MODEL20_ID,
      slug: PHASE73_MODEL20_SLUG,
      name: "Franklin-Christoph Model 20 Marietta",
    });
    assertMariettaIdentity(model);
    if (brand.id === model.id) {
      throw new Error("Phase 73 brand and Model 20 resolved to one entity.");
    }
    const batchKey = "phase73-franklin-christoph-model20-marietta-v1";
    const batchId = stableId("phase73-batch", batchKey);
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)",
      args: [
        batchId,
        batchKey,
        digest(batchKey),
        "Publish only the verified full-size Franklin-Christoph Model 20 Marietta; preserve pocket 20 as an independent sibling.",
      ],
    });
    const targets = [
      { entity: brand, slug: PHASE73_BRAND_SLUG, name: "Franklin-Christoph", route: "brand" },
      {
        entity: model,
        slug: PHASE73_MODEL20_SLUG,
        name: "Franklin-Christoph Model 20 Marietta",
        route: "pen",
      },
    ];
    for (const target of targets) {
      if (target.entity.created) continue;
      const actionId = stableId("phase73-action", target.entity.id);
      await tx.execute({
        sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)",
        args: [
          actionId,
          batchId,
          target.entity.slug,
          digest(`${target.entity.id}:${target.entity.slug}:${target.slug}`),
          target.entity.id,
          target.entity.id,
          `Verified Phase 73 exact title/slug identity rename to ${target.slug}.`,
        ],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)",
        args: [
          stableId("phase73-lineage", target.entity.id),
          batchId,
          actionId,
          target.entity.id,
          target.entity.id,
        ],
      });
      if (target.entity.slug !== target.slug) {
        await tx.execute({
          sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?",
          args: [target.slug, target.name, target.entity.id],
        });
      } else if (target.entity.name !== target.name) {
        await tx.execute({
          sql: "UPDATE entities SET name = ?, updated_at = datetime('now') WHERE id = ?",
          args: [target.name, target.entity.id],
        });
      }
      await installRedirect(tx, {
        source: `/${target.route}/${target.entity.slug}`,
        target: `/${target.route}/${target.slug}`,
        batchId,
        actionId,
      });
    }
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
      args: [model.id, brand.id],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
      args: [
        stableId("phase73-made-by", `${model.id}:${brand.id}`),
        model.id,
        brand.id,
        "Phase 73 verified Franklin-Christoph Model 20 Marietta maker relation",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
      args: [
        stableId("phase73-reverse", `${brand.id}:${model.id}`),
        brand.id,
        model.id,
        "Phase 73 Franklin-Christoph brand-to-Model 20 Marietta navigation",
      ],
    });
    const makers = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by' ORDER BY target_id",
      args: [model.id],
    });
    if (
      makers.rows.length !== 1 ||
      String(makers.rows[0]?.target_id) !== brand.id
    ) {
      throw new Error("Phase 73 Model 20 maker topology remains ambiguous.");
    }
    await tx.commit();
    return { brandId: brand.id, penId: model.id };
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase73FranklinChristophModel20Content(
  client: Client,
  options: ApplyPhase73Options,
): Promise<ApplyPhase73Result> {
  await assertOwned(client, options);
  const ids = await prepareIdentity(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    structuredClone(createPhase73FranklinChristophModel20Packs(ids)),
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
    throw new Error(
      "Usage: tsx scripts/apply-phase73-franklin-christoph-model20-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase73FranklinChristophModel20Content(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase73-franklin-christoph-model20",
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)),
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
