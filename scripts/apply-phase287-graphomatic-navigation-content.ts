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
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import type { ApplyPhase22Options } from "./apply-phase22-content";

export const PHASE287_GRAPHOMATIC_ID = "hxjmiofFHTMa";
export const PHASE287_GRAPHOMATIC_SLUG = "graphomatic";
export const PHASE287_GRAPHOMATIC_SOURCE =
  "curated-content:phase287-graphomatic-navigation:v1";

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 287 refuses remote database selection: ${key}.`);
    }
  }
}

async function assertOwned(client: Client, options: ApplyPhase22Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, root)
  ) {
    throw new Error("Phase 287 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (
    database === protectedCatalog ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 287 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 287 client is not bound to its owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 287 owned copy must be migrated through 032.");
  }
}

async function recordTaxonomyAction(tx: Transaction): Promise<void> {
  const sourcePath = `/brand/${PHASE287_GRAPHOMATIC_SLUG}`;
  const targetPath = `/article/${PHASE287_GRAPHOMATIC_SLUG}`;
  const key = `${PHASE287_GRAPHOMATIC_ID}:${sourcePath}->${targetPath}`;
  const batchId = `phase287-batch-${hash(key).slice(0, 24)}`;
  const actionId = `phase287-action-${hash(key).slice(0, 24)}`;
  const checksum = hash(key);
  await tx.execute({
    sql: `
      INSERT OR IGNORE INTO taxonomy_batches
        (id, source_key, source_checksum, status, note)
      VALUES (?, ?, ?, 'applied', ?)
    `,
    args: [
      batchId,
      "phase287-graphomatic-navigation-v1",
      checksum,
      "Same-ID Graphomatic brand-to-article navigation reclassification.",
    ],
  });
  await tx.execute({
    sql: `
      INSERT OR IGNORE INTO taxonomy_actions
        (id, batch_id, source_row_key, action_kind, action_checksum,
         source_entity_id, target_entity_id, status, note)
      VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)
    `,
    args: [
      actionId,
      batchId,
      PHASE287_GRAPHOMATIC_SLUG,
      checksum,
      PHASE287_GRAPHOMATIC_ID,
      PHASE287_GRAPHOMATIC_ID,
      "Graphomatic is a historical navigation article without a verified public model list.",
    ],
  });
}

export async function applyPhase287GraphomaticNavigationContent(
  client: Client,
  options: ApplyPhase22Options,
) {
  await assertOwned(client, options);
  const current = await client.execute({
    sql: `
      SELECT type, slug, source
      FROM entities
      WHERE id = ?
    `,
    args: [PHASE287_GRAPHOMATIC_ID],
  });
  if (current.rows.length !== 1) {
    throw new Error("Phase 287 Graphomatic identity is missing.");
  }
  const row = current.rows[0];
  const type = String(row.type);
  const slug = String(row.slug);
  const source = String(row.source ?? "");
  if (slug !== PHASE287_GRAPHOMATIC_SLUG) {
    throw new Error(`Phase 287 Graphomatic slug mismatch: ${slug}`);
  }
  if (
    type !== "brand" &&
    !(type === "article" && source === PHASE287_GRAPHOMATIC_SOURCE)
  ) {
    throw new Error(`Phase 287 unexpected Graphomatic state: ${type}/${source}`);
  }

  const alreadyApplied = type === "article";
  if (alreadyApplied) {
    const publication = await client.execute({
      sql: `
        SELECT status, reviewed_contract_version, reviewed_content_revision,
               content_revision
        FROM entity_publications
        WHERE entity_id = ?
      `,
      args: [PHASE287_GRAPHOMATIC_ID],
    });
    if (
      publication.rows.length !== 1 ||
      String(publication.rows[0]?.status) !== "published" ||
      Number(publication.rows[0]?.reviewed_contract_version) !== 3 ||
      Number(publication.rows[0]?.reviewed_content_revision) !==
        Number(publication.rows[0]?.content_revision)
    ) {
      throw new Error("Phase 287 Graphomatic article is not in a published noop state.");
    }
    const topology = await client.execute({
      sql: `
        SELECT count(*) AS value
        FROM entity_links
        WHERE (source_id = ? OR target_id = ?)
          AND link_type IN ('made_by', 'reverse')
      `,
      args: [PHASE287_GRAPHOMATIC_ID, PHASE287_GRAPHOMATIC_ID],
    });
    if (Number(topology.rows[0]?.value) !== 0) {
      throw new Error("Phase 287 Graphomatic noop found stale brand topology.");
    }
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      entities: [
        {
          entityId: PHASE287_GRAPHOMATIC_ID,
          outcome: "noop" as const,
          contentHash: await computePublicationContentHash(
            client,
            PHASE287_GRAPHOMATIC_ID,
          ),
        },
      ],
    };
  }

  const tx = await client.transaction("write");
  try {
      const collision = await tx.execute({
        sql: "SELECT id FROM entities WHERE type = 'article' AND slug = ? AND id <> ?",
        args: [PHASE287_GRAPHOMATIC_SLUG, PHASE287_GRAPHOMATIC_ID],
      });
      if (collision.rows.length > 0) {
        throw new Error("Phase 287 Graphomatic article slug collision.");
      }
      await tx.execute({
        sql: `
          DELETE FROM entity_links
          WHERE (source_id = ? OR target_id = ?)
            AND link_type IN ('made_by', 'reverse')
        `,
        args: [PHASE287_GRAPHOMATIC_ID, PHASE287_GRAPHOMATIC_ID],
      });
      const changed = await tx.execute({
        sql: `
          UPDATE entities
          SET type = 'article', source = ?, updated_at = datetime('now')
          WHERE id = ? AND type = 'brand' AND slug = ?
        `,
        args: [
          PHASE287_GRAPHOMATIC_SOURCE,
          PHASE287_GRAPHOMATIC_ID,
          PHASE287_GRAPHOMATIC_SLUG,
        ],
      });
      if (changed.rowsAffected !== 1) {
        throw new Error("Phase 287 Graphomatic changed before reclassification.");
      }
      await recordTaxonomyAction(tx);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }

  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE287_GRAPHOMATIC_ID,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: `phase287 graphomatic article navigation; ${reviewKind} review of preserved sourced copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: PHASE287_GRAPHOMATIC_ID,
    reviewer: options.reviewer,
  });
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: [
      {
        entityId: PHASE287_GRAPHOMATIC_ID,
        outcome: "published" as const,
        contentHash: published.contentHash,
      },
    ],
  };
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase287-graphomatic-navigation-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>",
    );
  }
  const { createClient } = await import("@libsql/client");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase287GraphomaticNavigationContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase287-graphomatic-navigation",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
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
