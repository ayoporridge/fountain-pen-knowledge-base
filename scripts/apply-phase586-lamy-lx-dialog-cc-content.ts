import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
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
  PHASE586_IDS,
  PHASE586_LAMY_BRAND_ID,
  PHASE586_SLUGS,
  phase586LamyPacks,
} from "./data/phase586-lamy-lx-dialog-cc";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export {
  PHASE586_IDS,
  PHASE586_LAMY_BRAND_ID,
  PHASE586_SLUGS,
} from "./data/phase586-lamy-lx-dialog-cc";

export type ApplyPhase586Options = ApplyPhase22Options;
export type ApplyPhase586Result = ApplyPhase22Result;

const TARGETS = [
  {
    id: PHASE586_IDS.lx,
    slug: PHASE586_SLUGS.lx,
    name: "LAMY Lx",
  },
  {
    id: PHASE586_IDS.dialogCc,
    slug: PHASE586_SLUGS.dialogCc,
    name: "LAMY dialog cc",
  },
] as const;

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 586 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function queryRows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase586Options,
): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) {
    throw new Error("Phase 586 reviewer must not be empty.");
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const databaseLstat = fs.lstatSync(options.databasePath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    databaseLstat.isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error(
      "Phase 586 requires a non-symlink catalog file inside the caller-owned root.",
    );
  }

  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.nlink !== BigInt(1)) {
    throw new Error("Phase 586 refuses catalog files with more than one hard link.");
  }
  if (
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 586 refuses the protected catalog or a hard-link alias.");
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 586 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 586 owned copy must be migrated through 032.");
  }
  return workspaceRoot;
}

function loadAndValidatePackSet(workspaceRoot: string): LoadedCuratedEntityPack[] {
  const packs = phase586LamyPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  const expected = [PHASE586_LAMY_BRAND_ID, ...TARGETS.map((target) => target.id)];
  if (
    packs.length !== expected.length ||
    packs.some((pack, index) => pack.entityId !== expected[index]) ||
    packs[0]?.expectedType !== "brand" ||
    packs.slice(1).some((pack) => pack.expectedType !== "pen")
  ) {
    throw new Error("Phase 586 requires the exact LAMY brand plus two pen packs.");
  }
  for (const target of TARGETS) {
    const pack = packs.find((candidate) => candidate.entityId === target.id);
    if (
      !pack ||
      pack.expectedSlug !== target.slug ||
      pack.canonicalName !== target.name
    ) {
      throw new Error(`Phase 586 pack identity mismatch: ${target.id}.`);
    }
  }
  return packs;
}

async function assertIdentityPreflight(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  const brandPack = packs[0];
  const brand = await queryRows(
    client,
    `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,
            publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
     FROM entities entity
     JOIN entity_publications publication ON publication.entity_id=entity.id
     LEFT JOIN public_entities public ON public.id=entity.id
     WHERE entity.id=? OR entity.slug='lamy'`,
    [PHASE586_LAMY_BRAND_ID],
  );
  if (
    !brandPack ||
    brand.length !== 1 ||
    brand[0]?.id !== PHASE586_LAMY_BRAND_ID ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "lamy" ||
    brand[0]?.name !== brandPack.canonicalName ||
    brand[0]?.source !== brandPack.sourceMarker ||
    brand[0]?.status !== "published" ||
    Number(brand[0]?.is_public) !== 1
  ) {
    throw new Error(`Phase 586 LAMY brand identity mismatch: ${JSON.stringify(brand)}.`);
  }

  for (const target of TARGETS) {
    const rows = await queryRows(
      client,
      `SELECT id,type,slug,name FROM entities
       WHERE id=? OR slug=? OR lower(name)=lower(?) ORDER BY id`,
      [target.id, target.slug, target.name],
    );
    if (
      rows.length > 1 ||
      (rows.length === 1 &&
        (rows[0]?.id !== target.id ||
          rows[0]?.type !== "pen" ||
          rows[0]?.slug !== target.slug ||
          rows[0]?.name !== target.name))
    ) {
      throw new Error(`Phase 586 entity, slug, or name collision: ${target.slug}.`);
    }
    const pack = packs.find((candidate) => candidate.entityId === target.id);
    if (!pack) throw new Error(`Phase 586 missing loaded pack: ${target.id}.`);
    for (const alias of pack.aliases) {
      const collisions = await queryRows(
        client,
        `SELECT entity.id,entity.type,entity.slug,alias.alias
         FROM entity_aliases alias
         JOIN entities entity ON entity.id=alias.entity_id
         WHERE lower(alias.alias)=lower(?) AND entity.id<>?`,
        [alias.alias, target.id],
      );
      if (collisions.length > 0) {
        throw new Error(
          `Phase 586 alias collision for ${alias.alias}: ${JSON.stringify(collisions)}.`,
        );
      }
    }
  }
}

async function prepareIdentitiesAndTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    for (const target of TARGETS) {
      const existing = await queryRows(
        transaction,
        "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
        [target.id, target.slug],
      );
      if (existing.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
          args: [target.id, target.slug, target.name],
        });
      } else if (
        existing.length !== 1 ||
        existing[0]?.id !== target.id ||
        existing[0]?.type !== "pen" ||
        existing[0]?.slug !== target.slug ||
        existing[0]?.name !== target.name
      ) {
        throw new Error(`Phase 586 refuses a conflicting identity: ${target.slug}.`);
      }

      const maker = await queryRows(
        transaction,
        "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [target.id],
      );
      if (maker.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
          args: [
            stableId("phase586-made-by", target.id),
            target.id,
            PHASE586_LAMY_BRAND_ID,
            "Phase 586 verified exact LAMY maker relation",
          ],
        });
      } else if (
        maker.length !== 1 ||
        maker[0]?.target_id !== PHASE586_LAMY_BRAND_ID
      ) {
        throw new Error(`Phase 586 ${target.slug} maker topology is ambiguous.`);
      }

      const reverse = await queryRows(
        transaction,
        "SELECT id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE586_LAMY_BRAND_ID, target.id],
      );
      if (reverse.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
          args: [
            stableId("phase586-reverse", target.id),
            PHASE586_LAMY_BRAND_ID,
            target.id,
            "Phase 586 LAMY brand public model navigation",
          ],
        });
      } else if (reverse.length !== 1) {
        throw new Error(`Phase 586 ${target.slug} reverse topology is ambiguous.`);
      }

      const publication = await queryRows(
        transaction,
        "SELECT status FROM entity_publications WHERE entity_id=?",
        [target.id],
      );
      if (
        publication.length !== 1 ||
        !["draft", "in_review", "published"].includes(
          String(publication[0]?.status),
        )
      ) {
        throw new Error(`Phase 586 publication row is missing: ${target.id}.`);
      }
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function assertTerminalState(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  for (const pack of packs) {
    const state = await queryRows(
      client,
      `SELECT entity.source,publication.status,publication.content_revision,
              publication.reviewed_content_revision,
              publication.reviewed_contract_version,readiness.publishable,
              readiness.blocker_count,
              CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
       FROM entities entity
       JOIN entity_publications publication ON publication.entity_id=entity.id
       LEFT JOIN public_entity_readiness readiness
         ON readiness.entity_id=entity.id AND readiness.contract_version=3
       LEFT JOIN public_entities public ON public.id=entity.id
       WHERE entity.id=?`,
      [pack.entityId],
    );
    const current = state[0];
    if (
      state.length !== 1 ||
      current?.source !== pack.sourceMarker ||
      current?.status !== "published" ||
      Number(current?.content_revision) !==
        Number(current?.reviewed_content_revision) ||
      Number(current?.reviewed_contract_version) !== 3 ||
      Number(current?.publishable) !== 1 ||
      Number(current?.blocker_count) !== 0 ||
      Number(current?.is_public) !== 1
    ) {
      throw new Error(`Phase 586 terminal publication mismatch: ${pack.entityId}.`);
    }
    const reviews = await queryRows(
      client,
      `SELECT review_kind,count(*) AS total
       FROM entity_content_reviews
       WHERE entity_id=? AND status='approved'
       GROUP BY review_kind`,
      [pack.entityId],
    );
    const reviewCounts = new Map(
      reviews.map((review) => [String(review.review_kind), Number(review.total)]),
    );
    if (
      ["fact", "language", "media", "publication"].some(
        (kind) => (reviewCounts.get(kind) ?? 0) < 1,
      )
    ) {
      throw new Error(`Phase 586 approved review set is incomplete: ${pack.entityId}.`);
    }
  }

  for (const target of TARGETS) {
    const maker = await queryRows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [target.id],
    );
    const reverse = await queryRows(
      client,
      "SELECT id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      [PHASE586_LAMY_BRAND_ID, target.id],
    );
    if (
      maker.length !== 1 ||
      maker[0]?.target_id !== PHASE586_LAMY_BRAND_ID ||
      reverse.length !== 1
    ) {
      throw new Error(`Phase 586 terminal topology mismatch: ${target.id}.`);
    }
  }
}

export async function applyPhase586LamyLxDialogCcContent(
  client: Client,
  options: ApplyPhase586Options,
): Promise<ApplyPhase586Result> {
  const workspaceRoot = await assertOwnedCatalog(client, options);
  const packs = loadAndValidatePackSet(workspaceRoot);
  await assertIdentityPreflight(client, packs);
  await prepareIdentitiesAndTopology(client);
  const result = await applyCuratedContentPacks(client, options, phase586LamyPacks);
  await assertTerminalState(client, packs);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
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
      "Usage: tsx scripts/apply-phase586-lamy-lx-dialog-cc-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const databasePath = path.resolve(database);
  const protectedCatalogPath = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase586LamyLxDialogCcContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase586-lamy-lx-dialog-cc",
      databasePath,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath,
      protectedCatalogSnapshot: snapshotCatalogFiles(protectedCatalogPath),
      env: process.env,
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
