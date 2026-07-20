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
import { phase25KawecoPacks } from "./data/phase25-kaweco";
import {
  createPhase79KawecoPerkeoPacks,
  PHASE79_KAWECO_PERKEO_FALLBACK_ID,
  PHASE79_KAWECO_PERKEO_SLUG,
} from "./data/phase79-kaweco-perkeo";
import { PHASE71_KAWECO_BRAND_ID } from "./data/phase71-kaweco-p0";

export type ApplyPhase79Options = ApplyPhase22Options;
export type ApplyPhase79Result = ApplyPhase22Result;

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
      throw new Error(`Phase 79 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwned(
  client: Client,
  options: ApplyPhase79Options,
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
    throw new Error("Phase 79 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (
    database === protectedCatalog ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 79 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 79 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 79 owned copy must be migrated through 032.");
  }
}

type ResolvedPen = { id: string; slug: string; created: boolean };

async function resolveKawecoPerkeo(tx: Transaction): Promise<ResolvedPen> {
  const matches = await tx.execute({
    sql: `SELECT id, type, slug, name
          FROM entities
          WHERE type = 'pen'
            AND (slug = ? OR lower(name) IN (
              'kaweco perkeo',
              'kaweco perkeo fountain pen',
              '卡维克 kaweco perkeo',
              '卡维克 kaweco perkeo 钢笔'
            ))
          ORDER BY id`,
    args: [PHASE79_KAWECO_PERKEO_SLUG],
  });
  if (matches.rows.length > 1) {
    throw new Error("Phase 79 Perkeo lookup is ambiguous; do not merge same-name non-pen products.");
  }
  if (matches.rows.length === 0) {
    const collision = await tx.execute({
      sql: "SELECT id, type FROM entities WHERE slug = ?",
      args: [PHASE79_KAWECO_PERKEO_SLUG],
    });
    if (collision.rows.length) {
      throw new Error("Phase 79 cannot create Perkeo because its pen route is occupied by another entity type.");
    }
    await tx.execute({
      sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, 'Kaweco Perkeo')",
      args: [PHASE79_KAWECO_PERKEO_FALLBACK_ID, PHASE79_KAWECO_PERKEO_SLUG],
    });
    return {
      id: PHASE79_KAWECO_PERKEO_FALLBACK_ID,
      slug: PHASE79_KAWECO_PERKEO_SLUG,
      created: true,
    };
  }
  const row = matches.rows[0]!;
  const id = String(row.id);
  const currentSlug = String(row.slug);
  const collision = await tx.execute({
    sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?",
    args: [PHASE79_KAWECO_PERKEO_SLUG, id],
  });
  if (collision.rows.length) {
    throw new Error("Phase 79 Perkeo canonical pen route is occupied.");
  }
  return { id, slug: currentSlug, created: false };
}

async function installRenameRedirect(
  tx: Transaction,
  input: { penId: string; sourceSlug: string },
): Promise<void> {
  if (input.sourceSlug === PHASE79_KAWECO_PERKEO_SLUG) return;
  const source = `/pen/${input.sourceSlug}`;
  const target = `/pen/${PHASE79_KAWECO_PERKEO_SLUG}`;
  const key = `${input.penId}:${source}->${target}`;
  const batchId = stableId("phase79-batch", key);
  const actionId = stableId("phase79-action", key);
  const existing = await tx.execute({
    sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
    args: [source],
  });
  if (existing.rows.length === 1) {
    if (
      String(existing.rows[0]?.target_path) !== target ||
      String(existing.rows[0]?.redirect_kind) !== "permanent"
    ) {
      throw new Error(`Phase 79 Perkeo old pen route has a conflicting redirect: ${source}.`);
    }
  } else if (existing.rows.length > 1) {
    throw new Error(`Phase 79 Perkeo old pen route has duplicate redirects: ${source}.`);
  } else {
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)",
      args: [batchId, key, digest(key), "Phase 79 exact Perkeo pen route normalization."],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)",
      args: [
        actionId,
        batchId,
        input.sourceSlug,
        digest(key),
        input.penId,
        input.penId,
        "Canonicalized an exact pen entity only; no Sport, Liliput, Student, rollerball or calligraphy-set merge.",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)",
      args: [
        stableId("phase79-lineage", input.penId),
        batchId,
        actionId,
        input.penId,
        input.penId,
      ],
    });
    await tx.execute({
      sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')",
      args: [
        stableId("phase79-redirect", source),
        batchId,
        actionId,
        source,
        target,
      ],
    });
  }
}

async function ensureTopology(
  client: Client,
): Promise<{ brandId: string; penId: string }> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({
      sql: "SELECT type, slug, name FROM entities WHERE id = ?",
      args: [PHASE71_KAWECO_BRAND_ID],
    });
    if (
      brand.rows.length !== 1 ||
      String(brand.rows[0]?.type) !== "brand" ||
      String(brand.rows[0]?.slug) !== "kaweco" ||
      String(brand.rows[0]?.name) !== "Kaweco"
    ) {
      throw new Error("Phase 79 requires the exact pre-existing Kaweco brand identity.");
    }
    const perkeo = await resolveKawecoPerkeo(tx);
    if (!perkeo.created && perkeo.slug !== PHASE79_KAWECO_PERKEO_SLUG) {
      await tx.execute({
        sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?",
        args: [PHASE79_KAWECO_PERKEO_SLUG, "Kaweco Perkeo", perkeo.id],
      });
      await installRenameRedirect(tx, { penId: perkeo.id, sourceSlug: perkeo.slug });
    } else {
      await tx.execute({
        sql: "UPDATE entities SET name = ? WHERE id = ?",
        args: ["Kaweco Perkeo", perkeo.id],
      });
    }
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
      args: [perkeo.id, PHASE71_KAWECO_BRAND_ID],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
      args: [
        stableId("phase79-made-by", `${perkeo.id}:${PHASE71_KAWECO_BRAND_ID}`),
        perkeo.id,
        PHASE71_KAWECO_BRAND_ID,
        "Phase 79 exact Kaweco Perkeo maker topology",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
      args: [
        stableId("phase79-reverse", `${PHASE71_KAWECO_BRAND_ID}:${perkeo.id}`),
        PHASE71_KAWECO_BRAND_ID,
        perkeo.id,
        "Phase 79 Kaweco-to-Perkeo public navigation",
      ],
    });
    const maker = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
      args: [perkeo.id],
    });
    if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== PHASE71_KAWECO_BRAND_ID
    ) {
      throw new Error("Phase 79 Perkeo maker topology remains ambiguous.");
    }
    await tx.commit();
    return { brandId: PHASE71_KAWECO_BRAND_ID, penId: perkeo.id };
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function assertPublicKawecoModelLinks(client: Client): Promise<void> {
  const missing = await client.execute({
    sql: `SELECT pen.slug
          FROM public_entities pen
          JOIN entity_links maker
            ON maker.source_id = pen.id
           AND maker.target_id = ?
           AND maker.link_type = 'made_by'
     LEFT JOIN entity_links reverse
            ON reverse.source_id = ?
           AND reverse.target_id = pen.id
           AND reverse.link_type = 'reverse'
         WHERE pen.type = 'pen'
         GROUP BY pen.id, pen.slug
        HAVING count(reverse.id) <> 1
         ORDER BY pen.slug`,
    args: [PHASE71_KAWECO_BRAND_ID, PHASE71_KAWECO_BRAND_ID],
  });
  if (missing.rows.length) {
    throw new Error(
      `Phase 79 Kaweco is missing reverse links for public models: ${missing.rows.map((row) => String(row.slug)).join(", ")}.`,
    );
  }
}

export async function applyPhase79KawecoPerkeoContent(
  client: Client,
  options: ApplyPhase79Options,
): Promise<ApplyPhase79Result> {
  await assertOwned(client, options);
  const { brandId, penId } = await ensureTopology(client);
  const existingBrand = phase25KawecoPacks.find(
    (pack) => pack.entityId === brandId && pack.expectedType === "brand",
  );
  if (!existingBrand) {
    throw new Error("Phase 79 Kaweco brand content prerequisite pack is missing.");
  }
  const brand = structuredClone(existingBrand);
  brand.key = "phase79-kaweco-brand-v1";
  const result = await applyCuratedContentPacks(client, options, [
    brand,
    ...createPhase79KawecoPerkeoPacks(brandId, penId),
  ]);
  await assertPublicKawecoModelLinks(client);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase79-kaweco-perkeo-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase79KawecoPerkeoContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase79-kaweco-perkeo",
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: snapshotCatalogFiles(
        path.resolve(protectedCatalog),
      ),
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
