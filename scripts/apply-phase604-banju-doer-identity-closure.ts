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
  PHASE604_ASVINE_BRAND_ID,
  PHASE604_BANJU_BRAND_ID,
  PHASE604_BANJU_BRAND_SLUG,
  PHASE604_BANJU_DOER_ID,
  PHASE604_BANJU_DOER_SLUG,
  PHASE604_YISIHUA_ID,
  phase604BanjuPacks,
} from "./data/phase604-banju-doer-identity-closure";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export {
  PHASE604_ASVINE_BRAND_ID,
  PHASE604_BANJU_BRAND_ID,
  PHASE604_BANJU_BRAND_SLUG,
  PHASE604_BANJU_DOER_ID,
  PHASE604_BANJU_DOER_SLUG,
  PHASE604_YISIHUA_ID,
} from "./data/phase604-banju-doer-identity-closure";

export type ApplyPhase604Options = ApplyPhase22Options;
export type ApplyPhase604Result = ApplyPhase22Result;

const SOURCE_KEY = "phase604-remaining-retired-identity-closure-v1";
const TERMINAL_RETIRED = [
  {
    id: "uppuHJzvuw5k",
    type: "brand",
    slug: "shanghai",
    name: "上海 (ShangHai)",
    path: "/brand/shanghai",
  },
  {
    id: "kBv3hmJfi366",
    type: "brand",
    slug: "saier",
    name: "塞尔 (Saier)",
    path: "/brand/saier",
  },
  {
    id: "6K7UhGOj7VrS",
    type: "pen",
    slug: "skb派顿-f10-f21",
    name: "SKB派顿 F10 / F21",
    path: "/pen/skb派顿-f10-f21",
  },
] as const;

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

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 604 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase604Options,
): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 604 reviewer must not be empty.");
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
      "Phase 604 requires a non-symlink catalog file inside the caller-owned root.",
    );
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.nlink !== BigInt(1)) {
    throw new Error("Phase 604 refuses catalog files with more than one hard link.");
  }
  if (
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 604 refuses the protected catalog or a hard-link alias.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 604 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 604 owned copy must be migrated through 032.");
  }
  return workspaceRoot;
}

function loadAndValidatePackSet(workspaceRoot: string): LoadedCuratedEntityPack[] {
  const packs = phase604BanjuPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  if (
    packs.length !== 2 ||
    packs[0]?.entityId !== PHASE604_BANJU_BRAND_ID ||
    packs[0]?.expectedType !== "brand" ||
    packs[0]?.expectedSlug !== PHASE604_BANJU_BRAND_SLUG ||
    packs[1]?.entityId !== PHASE604_BANJU_DOER_ID ||
    packs[1]?.expectedType !== "pen" ||
    packs[1]?.expectedSlug !== PHASE604_BANJU_DOER_SLUG
  ) {
    throw new Error("Phase 604 requires the exact Banju brand and Doer packs.");
  }
  const claimed = new Map<string, string>();
  for (const pack of packs) {
    for (const value of [pack.canonicalName, ...pack.aliases.map(({ alias }) => alias)]) {
      const normalized = value.trim().toLocaleLowerCase("en");
      const existing = claimed.get(normalized);
      if (existing && existing !== pack.entityId) {
        throw new Error(`Phase 604 pack-set name or alias collision: ${value}.`);
      }
      claimed.set(normalized, pack.entityId);
    }
  }
  return packs;
}

async function assertIdentityPreflight(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  const brandPack = packs[0];
  const brand = await rows(
    client,
    `SELECT entity.id,entity.type,entity.slug,entity.name,publication.status
     FROM entities entity
     JOIN entity_publications publication ON publication.entity_id=entity.id
     WHERE entity.id=? OR entity.slug=? OR lower(entity.name)=lower(?) ORDER BY entity.id`,
    [PHASE604_BANJU_BRAND_ID, PHASE604_BANJU_BRAND_SLUG, brandPack?.canonicalName],
  );
  if (
    !brandPack ||
    brand.length !== 1 ||
    brand[0]?.id !== PHASE604_BANJU_BRAND_ID ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== PHASE604_BANJU_BRAND_SLUG ||
    !["半句 (BanJu)", brandPack.canonicalName].includes(String(brand[0]?.name)) ||
    !["retired", "published"].includes(String(brand[0]?.status))
  ) {
    throw new Error(`Phase 604 Banju identity mismatch: ${JSON.stringify(brand)}.`);
  }

  const doerPack = packs[1];
  const doer = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? OR lower(name)=lower(?) ORDER BY id",
    [PHASE604_BANJU_DOER_ID, PHASE604_BANJU_DOER_SLUG, doerPack?.canonicalName],
  );
  if (
    !doerPack ||
    doer.length > 1 ||
    (doer.length === 1 &&
      (doer[0]?.id !== PHASE604_BANJU_DOER_ID ||
        doer[0]?.type !== "pen" ||
        doer[0]?.slug !== PHASE604_BANJU_DOER_SLUG ||
        doer[0]?.name !== doerPack.canonicalName))
  ) {
    throw new Error(`Phase 604 Doer identity collision: ${JSON.stringify(doer)}.`);
  }

  for (const pack of packs) {
    for (const alias of pack.aliases) {
      const collisions = await rows(
        client,
        `SELECT id,'entity' AS surface FROM entities WHERE lower(name)=lower(?) AND id<>?
         UNION ALL
         SELECT entity_id AS id,'alias' AS surface FROM entity_aliases
         WHERE lower(alias)=lower(?) AND entity_id<>?`,
        [alias.alias, pack.entityId, alias.alias, pack.entityId],
      );
      if (collisions.length > 0) {
        throw new Error(
          `Phase 604 alias collision for ${alias.alias}: ${JSON.stringify(collisions)}.`,
        );
      }
    }
  }

  const legacy = await rows(
    client,
    `SELECT entity.id,entity.type,entity.slug,entity.name,publication.status
     FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id
     WHERE entity.id IN (?,?) ORDER BY entity.id`,
    [PHASE604_YISIHUA_ID, PHASE604_ASVINE_BRAND_ID],
  );
  const yisihua = legacy.find((row) => row.id === PHASE604_YISIHUA_ID);
  const asvine = legacy.find((row) => row.id === PHASE604_ASVINE_BRAND_ID);
  if (
    legacy.length !== 2 ||
    yisihua?.type !== "brand" ||
    yisihua.slug !== "yisihua" ||
    yisihua.status !== "retired" ||
    asvine?.type !== "brand" ||
    asvine.slug !== "asvine" ||
    asvine.status !== "published"
  ) {
    throw new Error(`Phase 604 YiSiHua/Asvine identity mismatch: ${JSON.stringify(legacy)}.`);
  }

  for (const item of TERMINAL_RETIRED) {
    const identity = await rows(
      client,
      `SELECT entity.id,entity.type,entity.slug,entity.name,publication.status
       FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id
       WHERE entity.id=?`,
      [item.id],
    );
    const redirect = await rows(
      client,
      "SELECT target_path,redirect_kind,fallback_reason FROM entity_redirects WHERE source_path=?",
      [item.path],
    );
    if (
      identity.length !== 1 ||
      identity[0]?.type !== item.type ||
      identity[0]?.slug !== item.slug ||
      identity[0]?.name !== item.name ||
      identity[0]?.status !== "retired" ||
      redirect.length !== 1 ||
      redirect[0]?.target_path !== null ||
      redirect[0]?.redirect_kind !== "hard_404" ||
      !String(redirect[0]?.fallback_reason ?? "").trim()
    ) {
      throw new Error(`Phase 604 terminal retired identity mismatch: ${item.slug}.`);
    }
  }
}

async function prepareIdentitiesAndTaxonomy(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    const brandPack = phase604BanjuPacks[0];
    const doerPack = phase604BanjuPacks[1];
    if (!brandPack || !doerPack) throw new Error("Phase 604 packs vanished.");
    const batchId = stableId("phase604-batch", SOURCE_KEY);
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_batches
        (id,source_key,source_checksum,status,note)
        VALUES (?,?,?,'applied','Restore verified Banju identity and merge YiSiHua channel name into Asvine.')`,
      args: [batchId, SOURCE_KEY, digest(SOURCE_KEY)],
    });

    const banjuActionId = stableId("phase604-action", "banju-canonical-rename");
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_actions
        (id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note)
        VALUES (?,?,?,'rename',?,?,?,'applied','Normalize 半句 (BanJu) to 半句 Banju while retaining the same entity ID.')`,
      args: [
        banjuActionId,
        batchId,
        "banju-canonical-rename",
        digest("banju-canonical-rename"),
        PHASE604_BANJU_BRAND_ID,
        PHASE604_BANJU_BRAND_ID,
      ],
    });

    const doer = await rows(
      transaction,
      "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
      [PHASE604_BANJU_DOER_ID, PHASE604_BANJU_DOER_SLUG],
    );
    if (doer.length === 0) {
      await transaction.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [PHASE604_BANJU_DOER_ID, PHASE604_BANJU_DOER_SLUG, doerPack.canonicalName],
      });
    } else if (
      doer.length !== 1 ||
      doer[0]?.id !== PHASE604_BANJU_DOER_ID ||
      doer[0]?.type !== "pen" ||
      doer[0]?.slug !== PHASE604_BANJU_DOER_SLUG ||
      doer[0]?.name !== doerPack.canonicalName
    ) {
      throw new Error("Phase 604 refuses a conflicting Doer identity.");
    }

    const maker = await rows(
      transaction,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [PHASE604_BANJU_DOER_ID],
    );
    if (maker.length === 0) {
      await transaction.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          stableId("phase604-made-by", PHASE604_BANJU_DOER_ID),
          PHASE604_BANJU_DOER_ID,
          PHASE604_BANJU_BRAND_ID,
          "Phase 604 verified Banju Doer maker relation",
        ],
      });
    } else if (maker.length !== 1 || maker[0]?.target_id !== PHASE604_BANJU_BRAND_ID) {
      throw new Error("Phase 604 Doer maker topology is ambiguous.");
    }
    const reverse = await rows(
      transaction,
      "SELECT source_id FROM entity_links WHERE target_id=? AND link_type='reverse'",
      [PHASE604_BANJU_DOER_ID],
    );
    if (reverse.length === 0) {
      await transaction.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
        args: [
          stableId("phase604-reverse", PHASE604_BANJU_DOER_ID),
          PHASE604_BANJU_BRAND_ID,
          PHASE604_BANJU_DOER_ID,
          "Phase 604 Banju brand public model navigation",
        ],
      });
    } else if (reverse.length !== 1 || reverse[0]?.source_id !== PHASE604_BANJU_BRAND_ID) {
      throw new Error("Phase 604 Doer reverse topology is ambiguous.");
    }

    await transaction.execute({
      sql: "DELETE FROM entity_redirects WHERE source_path='/brand/banju' AND redirect_kind='hard_404'",
    });
    const banjuRoute = await rows(
      transaction,
      "SELECT 1 FROM entity_redirects WHERE source_path='/brand/banju'",
    );
    if (banjuRoute.length !== 0) {
      throw new Error("Phase 604 Banju canonical route remains shadowed by a redirect.");
    }

    const mergeActionId = stableId("phase604-action", "yisihua-merge-asvine");
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_actions
        (id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note)
        VALUES (?,?,?,'merge',?,?,?,'applied','YiSiHua/意斯华 is a channel name for Asvine, not an independent duplicate brand.')`,
      args: [
        mergeActionId,
        batchId,
        "yisihua-merge-asvine",
        digest("yisihua-merge-asvine"),
        PHASE604_YISIHUA_ID,
        PHASE604_ASVINE_BRAND_ID,
      ],
    });
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO entity_lineage
        (id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason)
        VALUES (?,?,?,?,?,'merge','YiSiHua/意斯华 is an Asvine channel identity.')`,
      args: [
        stableId("phase604-lineage", "yisihua-merge-asvine"),
        batchId,
        mergeActionId,
        PHASE604_YISIHUA_ID,
        PHASE604_ASVINE_BRAND_ID,
      ],
    });
    const changed = await transaction.execute({
      sql: `UPDATE entity_redirects
        SET batch_id=?,action_id=?,target_path='/brand/asvine',redirect_kind='permanent',
            fallback_reason='legacy_channel_name_merged_into_asvine'
        WHERE source_path='/brand/yisihua' AND
          (target_path IS NULL OR target_path='/brand/asvine')`,
      args: [batchId, mergeActionId],
    });
    if (changed.rowsAffected !== 1) {
      throw new Error("Phase 604 could not replace the reviewed YiSiHua redirect.");
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function entityDigest(client: Client, entityId: string): Promise<string> {
  const queries = [
    "SELECT * FROM entities WHERE id=?",
    "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
    "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
    "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
    "SELECT * FROM entity_publications WHERE entity_id=?",
    "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
  ];
  const payload: Array<Array<Record<string, unknown>>> = [];
  for (const sql of queries) {
    payload.push(await rows(client, sql, sql.includes(" OR target_id") ? [entityId, entityId] : [entityId]));
  }
  return digest(JSON.stringify(payload));
}

async function assertTerminalState(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  for (const pack of packs) {
    const state = await rows(
      client,
      `SELECT entity.type,entity.slug,entity.name,entity.source,publication.status,
              readiness.blocker_count,readiness.publishable,
              CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
       FROM entities entity
       JOIN entity_publications publication ON publication.entity_id=entity.id
       LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3
       LEFT JOIN public_entities public ON public.id=entity.id
       WHERE entity.id=?`,
      [pack.entityId],
    );
    const current = state[0];
    if (
      state.length !== 1 ||
      current?.type !== pack.expectedType ||
      current?.slug !== pack.expectedSlug ||
      current?.name !== pack.canonicalName ||
      current?.source !== pack.sourceMarker ||
      current?.status !== "published" ||
      Number(current?.blocker_count) !== 0 ||
      Number(current?.publishable) !== 1 ||
      Number(current?.is_public) !== 1
    ) {
      throw new Error(`Phase 604 terminal publication mismatch: ${pack.entityId}.`);
    }
    const reviews = await rows(
      client,
      `SELECT review_kind FROM entity_content_reviews
       WHERE entity_id=? AND content_hash=(SELECT approved_content_hash FROM entity_publications WHERE entity_id=?)
         AND status='approved' ORDER BY review_kind`,
      [pack.entityId, pack.entityId],
    );
    if (reviews.map((row) => String(row.review_kind)).join(",") !== "fact,language,media,publication") {
      throw new Error(`Phase 604 review gate mismatch: ${pack.entityId}.`);
    }
  }
  const maker = await rows(
    client,
    "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
    [PHASE604_BANJU_DOER_ID],
  );
  const reverse = await rows(
    client,
    "SELECT source_id FROM entity_links WHERE target_id=? AND link_type='reverse'",
    [PHASE604_BANJU_DOER_ID],
  );
  const merge = await rows(
    client,
    `SELECT lineage.target_entity_id,redirect.target_path,redirect.redirect_kind,publication.status
     FROM entity_lineage lineage
     JOIN entity_redirects redirect ON redirect.source_path='/brand/yisihua'
     JOIN entity_publications publication ON publication.entity_id=lineage.source_entity_id
     WHERE lineage.source_entity_id=? AND lineage.lineage_kind='merge' AND lineage.target_entity_id=?`,
    [PHASE604_YISIHUA_ID, PHASE604_ASVINE_BRAND_ID],
  );
  if (
    maker.length !== 1 || maker[0]?.target_id !== PHASE604_BANJU_BRAND_ID ||
    reverse.length !== 1 || reverse[0]?.source_id !== PHASE604_BANJU_BRAND_ID ||
    merge.length !== 1 || merge[0]?.target_path !== "/brand/asvine" ||
    merge[0]?.redirect_kind !== "permanent" || merge[0]?.status !== "retired"
  ) {
    throw new Error("Phase 604 terminal topology or merge mismatch.");
  }
}

export async function applyPhase604BanjuDoerIdentityClosure(
  client: Client,
  options: ApplyPhase604Options,
): Promise<ApplyPhase604Result> {
  const workspaceRoot = await assertOwnedCatalog(client, options);
  const packs = loadAndValidatePackSet(workspaceRoot);
  await assertIdentityPreflight(client, packs);
  const asvineBefore = await entityDigest(client, PHASE604_ASVINE_BRAND_ID);
  await prepareIdentitiesAndTaxonomy(client);
  const result = await applyCuratedContentPacks(client, options, phase604BanjuPacks);
  await assertTerminalState(client, packs);
  if ((await entityDigest(client, PHASE604_ASVINE_BRAND_ID)) !== asvineBefore) {
    throw new Error("Phase 604 changed the canonical Asvine entity.");
  }
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
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error(
      "Usage: tsx scripts/apply-phase604-banju-doer-identity-closure.ts --database <owned-copy> --owned-root <root> --protected-catalog <guard-copy> [--reviewer <name>]",
    );
  }
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase604BanjuDoerIdentityClosure(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase604-banju-doer-identity-closure",
      databasePath,
      ownedRoot,
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
