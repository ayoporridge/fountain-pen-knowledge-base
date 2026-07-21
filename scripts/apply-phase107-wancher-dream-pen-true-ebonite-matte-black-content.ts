import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client } from "@libsql/client";
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
  PHASE107_DREAM_ARTICLE_ID,
  PHASE107_TRUE_EBONITE_ID,
  PHASE107_TRUE_EBONITE_SLUG,
  PHASE107_WANCHER_ID,
  phase107WancherPacks,
} from "./data/phase107-wancher-dream-pen-true-ebonite-matte-black";

export {
  PHASE107_DREAM_ARTICLE_ID,
  PHASE107_TRUE_EBONITE_ID,
  PHASE107_TRUE_EBONITE_SLUG,
  PHASE107_WANCHER_ID,
} from "./data/phase107-wancher-dream-pen-true-ebonite-matte-black";

export type ApplyPhase107Options = ApplyPhase22Options;
export type ApplyPhase107Result = ApplyPhase22Result;

const ARTICLE_SLUG = "wancher-dream-pen";
const PRODUCT_URL =
  "https://www.wancherpen.com/products/true-ebonite-matte-black";

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase107Options,
): Promise<void> {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if ((options.env ?? process.env)[key]?.trim()) {
      throw new Error(
        `Phase 107 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
  if (!options.reviewer.trim()) {
    throw new Error("Phase 107 reviewer must not be empty.");
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 107 refuses the protected catalog or a hard-link alias.");
  }
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error(
      "Phase 107 requires a non-symlink catalog file inside the caller-owned root.",
    );
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 107 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 107 owned copy must be migrated through 032.");
  }
}

async function assertIdentityPreflight(client: Client): Promise<void> {
  const brand = await client.execute({
    sql: "SELECT id,type,slug FROM entities WHERE id=? OR slug='wancher' ORDER BY id",
    args: [PHASE107_WANCHER_ID],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.id) !== PHASE107_WANCHER_ID ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== "wancher"
  ) {
    throw new Error("Phase 107 requires the exact existing Wancher brand identity.");
  }

  const article = await client.execute({
    sql: "SELECT id,type,slug FROM entities WHERE id=? OR slug=? ORDER BY id",
    args: [PHASE107_DREAM_ARTICLE_ID, ARTICLE_SLUG],
  });
  if (
    article.rows.length !== 1 ||
    String(article.rows[0]?.id) !== PHASE107_DREAM_ARTICLE_ID ||
    String(article.rows[0]?.type) !== "article" ||
    String(article.rows[0]?.slug) !== ARTICLE_SLUG
  ) {
    throw new Error("Phase 107 requires the Phase 104 Dream Pen article identity.");
  }

  const reclassification = await client.execute({
    sql: `SELECT action_kind,status FROM taxonomy_actions
          WHERE source_entity_id=? AND target_entity_id=? AND source_row_key=?`,
    args: [PHASE107_DREAM_ARTICLE_ID, PHASE107_DREAM_ARTICLE_ID, "wancher万佳-dream-pen"],
  });
  if (
    reclassification.rows.length !== 1 ||
    String(reclassification.rows[0]?.action_kind) !== "rename" ||
    String(reclassification.rows[0]?.status) !== "applied"
  ) {
    throw new Error("Phase 107 requires the applied Phase 104 reclassification record.");
  }

  const target = await client.execute({
    sql: `SELECT id,type,slug,name,source_url FROM entities
          WHERE id=? OR slug=? OR lower(name) IN (
            lower('Wancher Dream Pen True Ebonite Matte Black'),
            lower('Dream Pen True Ebonite Matte Black'),
            lower('Wancher True Ebonite Matte Black')
          ) OR source_url=? ORDER BY id`,
    args: [PHASE107_TRUE_EBONITE_ID, PHASE107_TRUE_EBONITE_SLUG, PRODUCT_URL],
  });
  if (
    target.rows.length > 1 ||
    (target.rows.length === 1 &&
      (String(target.rows[0]?.id) !== PHASE107_TRUE_EBONITE_ID ||
        String(target.rows[0]?.type) !== "pen" ||
        String(target.rows[0]?.slug) !== PHASE107_TRUE_EBONITE_SLUG))
  ) {
    throw new Error(
      "Phase 107 exact True Ebonite product already exists under an alternate identity or collision.",
    );
  }
}

async function ensureTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    const target = await transaction.execute({
      sql: "SELECT id,type,slug FROM entities WHERE id=? OR slug=? ORDER BY id",
      args: [PHASE107_TRUE_EBONITE_ID, PHASE107_TRUE_EBONITE_SLUG],
    });
    if (target.rows.length === 0) {
      await transaction.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          PHASE107_TRUE_EBONITE_ID,
          PHASE107_TRUE_EBONITE_SLUG,
          "Wancher Dream Pen True Ebonite Matte Black",
        ],
      });
    } else if (
      target.rows.length !== 1 ||
      String(target.rows[0]?.id) !== PHASE107_TRUE_EBONITE_ID ||
      String(target.rows[0]?.type) !== "pen" ||
      String(target.rows[0]?.slug) !== PHASE107_TRUE_EBONITE_SLUG
    ) {
      throw new Error("Phase 107 target identity changed after preflight.");
    }

    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE107_TRUE_EBONITE_ID, PHASE107_WANCHER_ID],
    });
    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE target_id=? AND link_type='reverse' AND source_id<>?",
      args: [PHASE107_TRUE_EBONITE_ID, PHASE107_WANCHER_ID],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [
        stableId(
          "phase107-made-by",
          `${PHASE107_TRUE_EBONITE_ID}:${PHASE107_WANCHER_ID}`,
        ),
        PHASE107_TRUE_EBONITE_ID,
        PHASE107_WANCHER_ID,
        "Phase 107 exact Wancher maker relation",
      ],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        stableId(
          "phase107-reverse",
          `${PHASE107_WANCHER_ID}:${PHASE107_TRUE_EBONITE_ID}`,
        ),
        PHASE107_WANCHER_ID,
        PHASE107_TRUE_EBONITE_ID,
        "Phase 107 Wancher-to-True-Ebonite public model navigation",
      ],
    });
    const batchKey = "phase107-wancher-true-ebonite-topology-v1";
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [
        stableId("phase107-batch", batchKey),
        batchKey,
        createHash("sha256").update(batchKey).digest("hex"),
        "Create exact True Ebonite Matte Black identity beside the protected Dream Pen article.",
      ],
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase107WancherDreamPenTrueEboniteMatteBlackContent(
  client: Client,
  options: ApplyPhase107Options,
): Promise<ApplyPhase107Result> {
  await assertOwnedCatalog(client, options);
  await assertIdentityPreflight(client);
  await ensureTopology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    structuredClone(phase107WancherPacks),
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const databasePath = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalogPath = value("--protected-catalog");
  const reviewer = value("--reviewer") ?? "phase107-wancher-true-ebonite";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error(
      "Usage: tsx scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(databasePath);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtected = path.resolve(protectedCatalogPath);
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result =
      await applyPhase107WancherDreamPenTrueEboniteMatteBlackContent(client, {
        workspaceRoot: process.cwd(),
        reviewer,
        databasePath: resolvedDatabase,
        ownedRoot: resolvedOwnedRoot,
        protectedCatalogPath: resolvedProtected,
        protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
