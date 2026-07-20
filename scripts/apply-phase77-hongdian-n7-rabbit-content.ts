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
  PHASE77_HONGDIAN_BRAND_FALLBACK_ID,
  PHASE77_N7_RABBIT_FALLBACK_ID,
  PHASE77_N7_RABBIT_SLUG,
  phase77HongdianN7RabbitPacks,
} from "./data/phase77-hongdian-n7-rabbit";

export type ApplyPhase77Options = ApplyPhase22Options;
export type ApplyPhase77Result = ApplyPhase22Result;

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
      throw new Error(`Phase 77 refuses inherited remote selection: ${key}.`);
    }
  }
}

async function assertOwned(
  client: Client,
  options: ApplyPhase77Options,
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
    throw new Error("Phase 77 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (
    database === protectedCatalog ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 77 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (
    !main?.file ||
    fs.realpathSync.native(String(main.file)) !== database
  ) {
    throw new Error("Phase 77 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 77 owned copy must be migrated through 032.");
  }
}

async function resolveHongdianBrand(tx: Transaction): Promise<string> {
  const matches = await tx.execute({
    sql: `SELECT id, type, slug, name
          FROM entities
          WHERE type = 'brand'
            AND (lower(slug) IN ('hongdian', 'hong-dian')
              OR lower(name) IN ('hongdian', 'hong dian')
              OR name = '弘典')
          ORDER BY id`,
    args: [],
  });
  if (matches.rows.length > 1) {
    throw new Error("Phase 77 HongDian brand lookup is ambiguous.");
  }
  if (matches.rows.length === 1) {
    const row = matches.rows[0];
    if (String(row?.type) !== "brand") {
      throw new Error("Phase 77 HongDian lookup has invalid type.");
    }
    const collision = await tx.execute({
      sql: "SELECT id FROM entities WHERE slug = 'hongdian' AND id <> ?",
      args: [String(row?.id)],
    });
    if (collision.rows.length) {
      throw new Error("Phase 77 HongDian canonical slug is occupied.");
    }
    await tx.execute({
      sql: "UPDATE entities SET slug = 'hongdian', name = 'HongDian' WHERE id = ?",
      args: [String(row?.id)],
    });
    return String(row?.id);
  }
  const collision = await tx.execute({
    sql: "SELECT id, type FROM entities WHERE slug = 'hongdian'",
    args: [],
  });
  if (collision.rows.length) {
    throw new Error("Phase 77 cannot create HongDian brand: slug is occupied.");
  }
  await tx.execute({
    sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'brand', 'hongdian', 'HongDian')",
    args: [PHASE77_HONGDIAN_BRAND_FALLBACK_ID],
  });
  return PHASE77_HONGDIAN_BRAND_FALLBACK_ID;
}

async function resolveN7Rabbit(tx: Transaction): Promise<string> {
  const matches = await tx.execute({
    sql: `SELECT id, type, slug, name
          FROM entities
          WHERE type = 'pen'
            AND (slug = ?
              OR lower(name) IN ('hongdian n7 grey rabbit', 'hongdian n7 rabbit', 'hongdian n7 moon rabbit')
              OR name IN ('弘典 N7 灰兔', '弘典 N7 兔子'))
          ORDER BY id`,
    args: [PHASE77_N7_RABBIT_SLUG],
  });
  if (matches.rows.length > 1) {
    throw new Error("Phase 77 N7 Rabbit lookup is ambiguous; do not merge themes.");
  }
  if (matches.rows.length === 1) {
    const row = matches.rows[0];
    const id = String(row?.id);
    const collision = await tx.execute({
      sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?",
      args: [PHASE77_N7_RABBIT_SLUG, id],
    });
    if (collision.rows.length) {
      throw new Error("Phase 77 N7 Rabbit canonical slug is occupied.");
    }
    await tx.execute({
      sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?",
      args: [PHASE77_N7_RABBIT_SLUG, "HongDian N7 Grey Rabbit", id],
    });
    return id;
  }
  const collision = await tx.execute({
    sql: "SELECT id, type FROM entities WHERE slug = ?",
    args: [PHASE77_N7_RABBIT_SLUG],
  });
  if (collision.rows.length) {
    throw new Error("Phase 77 cannot create N7 Rabbit: slug is occupied.");
  }
  await tx.execute({
    sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)",
    args: [
      PHASE77_N7_RABBIT_FALLBACK_ID,
      PHASE77_N7_RABBIT_SLUG,
      "HongDian N7 Grey Rabbit",
    ],
  });
  return PHASE77_N7_RABBIT_FALLBACK_ID;
}

async function ensureTopology(
  client: Client,
): Promise<{ brandId: string; penId: string }> {
  const tx = await client.transaction("write");
  try {
    const brandId = await resolveHongdianBrand(tx);
    const penId = await resolveN7Rabbit(tx);
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
      args: [penId, brandId],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
      args: [
        stableId("phase77-made-by", `${penId}:${brandId}`),
        penId,
        brandId,
        "Phase 77 exact-match HongDian N7 Grey Rabbit maker topology",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
      args: [
        stableId("phase77-reverse", `${brandId}:${penId}`),
        brandId,
        penId,
        "Phase 77 HongDian-to-N7 Grey Rabbit navigation",
      ],
    });
    const makers = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
      args: [penId],
    });
    if (
      makers.rows.length !== 1 ||
      String(makers.rows[0]?.target_id) !== brandId
    ) {
      throw new Error("Phase 77 N7 Rabbit maker topology remains ambiguous.");
    }
    await tx.commit();
    return { brandId, penId };
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase77HongdianN7RabbitContent(
  client: Client,
  options: ApplyPhase77Options,
): Promise<ApplyPhase77Result> {
  await assertOwned(client, options);
  const { brandId, penId } = await ensureTopology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    structuredClone(phase77HongdianN7RabbitPacks(brandId, penId)),
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
      "Usage: tsx scripts/apply-phase77-hongdian-n7-rabbit-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase77HongdianN7RabbitContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase77-hongdian-n7-rabbit",
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
