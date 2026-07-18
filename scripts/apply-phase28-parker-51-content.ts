import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Row, Transaction } from "@libsql/client";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { phase28Parker51Packs } from "./data/phase28-parker-51";
import type {
  CuratedEntityPack,
  CuratedMedia,
  CuratedSource,
} from "./lib/curated-content-pack";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";

export type ApplyPhase28Parker51Options = ApplyPhase22Options;
export type ApplyPhase28Parker51Result = ApplyPhase22Result;

const PARKER_ID = "vhqNYqDChhiN";
const VINTAGE_ID = "i_XH37icAI5C";
const DUPLICATE_VINTAGE_ID = "jY3SP5ZX8Hwx";
const MODERN_ID = "jy_bRVs1hdMo";
const VINTAGE_SLUG = "派克-parker-51-经典-vintage";
const DUPLICATE_SLUG = "parker-51-vintage";
const MODERN_SLUG = "派克-parker-51复刻";

const SOURCE_TYPES = new Set<CuratedSource["sourceType"]>([
  "official",
  "wikimedia",
  "book",
  "patent",
  "blog",
  "forum",
  "reddit",
  "retailer",
  "user_submission",
]);
const SOURCE_TIERS = new Set<CuratedSource["tier"]>([
  "primary",
  "contemporary_archive",
  "professional_secondary",
  "retailer",
  "community",
  "search",
]);
const ALLOWED_USES = new Set<CuratedSource["allowedUse"]>([
  "store_full",
  "store_excerpt",
  "summary_only",
  "metadata_only",
  "link_only",
]);
const ALIAS_KINDS = new Set([
  "alias",
  "regional_name",
  "former_name",
  "licensed_name",
  "producer_name",
] as const);
const REUSABLE_MEDIA_LICENSES = new Set([
  "cc0",
  "cc0-1.0",
  "public domain",
  "public-domain",
  "cc-by",
  "cc-by-2.0",
  "cc-by-3.0",
  "cc-by-4.0",
  "cc-by-sa",
  "cc-by-sa-2.0",
  "cc-by-sa-3.0",
  "cc-by-sa-4.0",
  "site-original",
  "own-work",
  "permission-granted",
]);

function text(row: Row, key: string): string {
  return String(row[key] ?? "").trim();
}

function nullable(row: Row, key: string): string | null {
  const value = text(row, key);
  return value || null;
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
}

function safeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function loadDuplicateSources(client: Client): Promise<Row[]> {
  const result = await client.execute({
    sql: `WITH donor_source_items(source_item_id) AS (
            SELECT source_item_id FROM entity_references
             WHERE entity_id = ? AND review_status = 'approved'
            UNION
            SELECT source_item_id FROM entity_aliases
             WHERE entity_id = ? AND review_status = 'approved'
               AND source_item_id IS NOT NULL
            UNION
            SELECT source_item_id FROM media_assets
             WHERE entity_id = ? AND review_status = 'approved'
               AND source_item_id IS NOT NULL
          )
          SELECT donor.source_item_id,
                 item.source_id, item.title, item.url, item.item_type,
                 item.license, item.author, item.published_at,
                 item.retrieved_at, item.summary, item.allowed_use,
                 item.source_tier, item.independence_group,
                 item.archive_url, item.archive_locator,
                 registry.name AS registry_name,
                 registry.source_type, registry.homepage_url
            FROM donor_source_items donor
            JOIN source_items item ON item.id = donor.source_item_id
            JOIN source_registry registry ON registry.id = item.source_id
           WHERE item.review_status = 'approved'
           ORDER BY item.id`,
    args: [
      DUPLICATE_VINTAGE_ID,
      DUPLICATE_VINTAGE_ID,
      DUPLICATE_VINTAGE_ID,
    ],
  });
  return result.rows;
}

function sourceFromDuplicate(row: Row): CuratedSource | null {
  const sourceType = text(row, "source_type") as CuratedSource["sourceType"];
  const tier = text(row, "source_tier") as CuratedSource["tier"];
  const allowedUse = text(row, "allowed_use") as CuratedSource["allowedUse"];
  const url = text(row, "url");
  const archiveUrl = text(row, "archive_url");
  const archiveLocator = text(row, "archive_locator");
  const independenceGroup = text(row, "independence_group");
  if (
    !SOURCE_TYPES.has(sourceType) ||
    !SOURCE_TIERS.has(tier) ||
    !ALLOWED_USES.has(allowedUse) ||
    !safeHttpUrl(url) ||
    !(safeHttpUrl(archiveUrl) || archiveUrl.startsWith("/images/")) ||
    archiveUrl.includes(".planning/") ||
    !archiveLocator ||
    !independenceGroup
  ) {
    return null;
  }
  const sourceItemId = text(row, "source_item_id");
  const sourceId = text(row, "source_id");
  const homepageUrl = text(row, "homepage_url");
  return {
    key: `phase28-donor-source-${sourceItemId}`,
    registryKey: `phase28-donor-registry-${sourceId}`,
    registryName: text(row, "registry_name") || "Migrated Parker 51 source",
    sourceType,
    tier,
    independenceGroup,
    title: text(row, "title") || url,
    url,
    homepageUrl: safeHttpUrl(homepageUrl)
      ? homepageUrl
      : new URL(url).origin,
    itemType: nullable(row, "item_type") ?? undefined,
    author: nullable(row, "author"),
    publishedAt: nullable(row, "published_at"),
    retrievedAt: text(row, "retrieved_at") || "2026-07-19",
    summary:
      text(row, "summary") ||
      "从重复 vintage Parker 51 行迁移的已审核来源；继续受原始来源范围约束。",
    allowedUse,
    license: nullable(row, "license"),
    archiveUrl,
    archiveLocator: `${archiveLocator};migrated_from=${DUPLICATE_VINTAGE_ID}`,
  };
}

async function augmentVintagePackWithDuplicatePayload(
  client: Client,
  packs: CuratedEntityPack[],
  workspaceRoot: string,
): Promise<void> {
  const vintage = packs.find((pack) => pack.entityId === VINTAGE_ID);
  if (!vintage) throw new Error("Phase 28 vintage Parker 51 pack is missing.");

  const sourceKeyByItemId = new Map<string, string>();
  const sourceKeyByUrl = new Map(
    vintage.sources.map((source) => [source.url, source.key]),
  );
  for (const row of await loadDuplicateSources(client)) {
    const sourceItemId = text(row, "source_item_id");
    const existingKey = sourceKeyByUrl.get(text(row, "url"));
    if (existingKey) {
      sourceKeyByItemId.set(sourceItemId, existingKey);
      continue;
    }
    const migrated = sourceFromDuplicate(row);
    if (!migrated) continue;
    vintage.sources.push(migrated);
    sourceKeyByUrl.set(migrated.url, migrated.key);
    sourceKeyByItemId.set(sourceItemId, migrated.key);
  }

  const aliasRows = await client.execute({
    sql: `SELECT alias, language, alias_kind, market, source_item_id
            FROM entity_aliases
           WHERE entity_id = ? AND review_status = 'approved'
           ORDER BY lower(alias), language, id`,
    args: [DUPLICATE_VINTAGE_ID],
  });
  const aliasKeys = new Set(
    vintage.aliases.map(
      (alias) => `${alias.language}\0${alias.alias.toLocaleLowerCase()}`,
    ),
  );
  for (const row of aliasRows.rows) {
    const alias = text(row, "alias");
    const language = text(row, "language") || "und";
    const sourceKey = sourceKeyByItemId.get(text(row, "source_item_id"));
    const aliasKind = text(row, "alias_kind") as (typeof ALIAS_KINDS extends Set<infer T>
      ? T
      : never);
    const market = nullable(row, "market");
    const aliasKey = `${language}\0${alias.toLocaleLowerCase()}`;
    if (
      !alias ||
      !sourceKey ||
      !ALIAS_KINDS.has(aliasKind) ||
      aliasKeys.has(aliasKey) ||
      ((aliasKind === "regional_name" || aliasKind === "licensed_name") &&
        !market)
    ) {
      continue;
    }
    vintage.aliases.push({
      alias,
      language,
      kind: aliasKind,
      sourceKey,
      market,
    });
    aliasKeys.add(aliasKey);
  }

  const mediaRows = await client.execute({
    sql: `SELECT title, image_url, thumbnail_url, local_path, author, license,
                 attribution_text, source_url, source_item_id
            FROM media_assets
           WHERE entity_id = ? AND review_status = 'approved'
           ORDER BY id`,
    args: [DUPLICATE_VINTAGE_ID],
  });
  const mediaKeys = new Set(
    vintage.media.map(
      (media) => media.localPath ?? media.imageUrl ?? media.sourceUrl,
    ),
  );
  for (const row of mediaRows.rows) {
    const sourceKey = sourceKeyByItemId.get(text(row, "source_item_id"));
    const localPath = nullable(row, "local_path");
    const imageUrl = nullable(row, "image_url");
    const sourceUrl = text(row, "source_url");
    const author = text(row, "author");
    const license = text(row, "license");
    const attributionText = text(row, "attribution_text");
    const identity = localPath ?? imageUrl ?? sourceUrl;
    const thumbnailUrl = nullable(row, "thumbnail_url");
    const localFile = localPath
      ? path.join(workspaceRoot, "public", localPath.slice(1))
      : null;
    const hasOnSiteAsset =
      (localPath?.startsWith("/images/") === true &&
        !localPath.includes("/warm-pen-atlas/") &&
        localFile !== null &&
        fs.existsSync(localFile) &&
        fs.statSync(localFile).isFile()) ||
      imageUrl?.startsWith("/") === true ||
      thumbnailUrl?.startsWith("/") === true;
    if (
      !sourceKey ||
      !identity ||
      mediaKeys.has(identity) ||
      !author ||
      !license ||
      !REUSABLE_MEDIA_LICENSES.has(license.toLocaleLowerCase()) ||
      !attributionText ||
      !safeHttpUrl(sourceUrl) ||
      !hasOnSiteAsset
    ) {
      continue;
    }
    const migrated: CuratedMedia = {
      key: `duplicate-gallery-${digest(identity).slice(0, 16)}`,
      title: text(row, "title") || "Migrated vintage Parker 51 media",
      sourceKey,
      imageUrl,
      thumbnailUrl,
      localPath,
      author,
      license,
      attributionText: `${attributionText} Migrated from retired duplicate ${DUPLICATE_VINTAGE_ID}.`,
      sourceUrl,
      usageStatus: "gallery",
    };
    vintage.media.push(migrated);
    mediaKeys.add(identity);
  }
}

async function entityIdentity(
  transaction: Transaction,
  entityId: string,
): Promise<{ type: string; slug: string }> {
  const result = await transaction.execute({
    sql: "SELECT type, slug FROM entities WHERE id = ?",
    args: [entityId],
  });
  const row = result.rows[0];
  if (!row) throw new Error(`Phase 28 entity is missing: ${entityId}`);
  return { type: text(row, "type"), slug: text(row, "slug") };
}

async function assertIdentity(
  transaction: Transaction,
  entityId: string,
  expectedType: string,
  expectedSlug: string,
): Promise<void> {
  const identity = await entityIdentity(transaction, entityId);
  if (identity.type !== expectedType || identity.slug !== expectedSlug) {
    throw new Error(
      `Phase 28 identity mismatch for ${entityId}: ${identity.type}/${identity.slug}`,
    );
  }
}

async function ensureExactlyOneParkerMaker(
  transaction: Transaction,
  entityId: string,
): Promise<void> {
  await transaction.execute({
    sql: `DELETE FROM entity_links
           WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?`,
    args: [entityId, PARKER_ID],
  });
  const result = await transaction.execute({
    sql: `SELECT count(*) AS total
            FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PARKER_ID],
  });
  if (Number(result.rows[0]?.total ?? 0) !== 1) {
    throw new Error(`Phase 28 ${entityId} must retain exactly one Parker made_by.`);
  }
}

async function installRedirect(
  transaction: Transaction,
  input: {
    id: string;
    batchId: string;
    actionId: string;
    sourcePath: string;
    targetPath: string;
  },
): Promise<void> {
  const existing = await transaction.execute({
    sql: `SELECT redirect_kind, target_path
            FROM entity_redirects WHERE source_path = ?`,
    args: [input.sourcePath],
  });
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (
      text(row, "redirect_kind") !== "permanent" ||
      text(row, "target_path") !== input.targetPath
    ) {
      throw new Error(`Conflicting redirect already owns ${input.sourcePath}.`);
    }
    return;
  }
  await transaction.execute({
    sql: `INSERT INTO entity_redirects (
            id, batch_id, action_id, source_path, target_path,
            redirect_kind, fallback_reason
          ) VALUES (?, ?, ?, ?, ?, 'permanent', NULL)`,
    args: [
      input.id,
      input.batchId,
      input.actionId,
      input.sourcePath,
      input.targetPath,
    ],
  });
}

async function retireDuplicateAndInstallRedirects(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  const batchId = stableId("taxonomy-batch", "phase28-parker-51-dedupe-v1");
  const actionId = stableId("taxonomy-action", "phase28-parker-51-dedupe-v1");
  const sourceChecksum = digest("phase28-parker-51-dedupe-v1");
  const actionChecksum = digest(
    `${DUPLICATE_VINTAGE_ID}\0${VINTAGE_ID}\0merge\0${DUPLICATE_SLUG}\0${VINTAGE_SLUG}`,
  );
  try {
    await assertIdentity(transaction, PARKER_ID, "brand", "parker");
    await assertIdentity(transaction, VINTAGE_ID, "pen", VINTAGE_SLUG);
    await assertIdentity(
      transaction,
      DUPLICATE_VINTAGE_ID,
      "pen",
      DUPLICATE_SLUG,
    );
    await assertIdentity(transaction, MODERN_ID, "pen", MODERN_SLUG);
    await ensureExactlyOneParkerMaker(transaction, VINTAGE_ID);
    await ensureExactlyOneParkerMaker(transaction, MODERN_ID);

    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
      args: [DUPLICATE_VINTAGE_ID],
    });
    await transaction.execute({
      sql: `UPDATE entity_publications
               SET status = 'retired', blockers_json = '["taxonomy_merged"]',
                   approved_content_hash = NULL,
                   reviewed_content_revision = NULL,
                   reviewed_contract_version = NULL,
                   reviewed_by = NULL, reviewed_at = NULL,
                   published_at = NULL, updated_at = datetime('now')
             WHERE entity_id = ?
               AND (status <> 'retired' OR blockers_json <> '["taxonomy_merged"]')`,
      args: [DUPLICATE_VINTAGE_ID],
    });

    await transaction.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_batches (
              id, source_key, source_checksum, status, note
            ) VALUES (?, 'phase28-parker-51-dedupe-v1', ?, 'applied', ?)`,
      args: [
        batchId,
        sourceChecksum,
        "Retire duplicate vintage Parker 51 after migrating usable payload.",
      ],
    });
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_actions (
              id, batch_id, source_row_key, action_kind, action_checksum,
              source_entity_id, target_entity_id, status, note
            ) VALUES (?, ?, ?, 'merge', ?, ?, ?, 'applied', ?)`,
      args: [
        actionId,
        batchId,
        DUPLICATE_VINTAGE_ID,
        actionChecksum,
        DUPLICATE_VINTAGE_ID,
        VINTAGE_ID,
        "Duplicate parker-51-vintage merges into the canonical vintage Parker 51; 2021 identity remains separate.",
      ],
    });
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO entity_lineage (
              id, batch_id, action_id, source_entity_id, target_entity_id,
              lineage_kind, fallback_reason
            ) VALUES (?, ?, ?, ?, ?, 'merge', NULL)`,
      args: [
        stableId("taxonomy-lineage", actionChecksum),
        batchId,
        actionId,
        DUPLICATE_VINTAGE_ID,
        VINTAGE_ID,
      ],
    });
    await installRedirect(transaction, {
      id: stableId("taxonomy-redirect", `${actionChecksum}:duplicate`),
      batchId,
      actionId,
      sourcePath: `/pen/${DUPLICATE_SLUG}`,
      targetPath: `/pen/${VINTAGE_SLUG}`,
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function applyPhase28Parker51Content(
  client: Client,
  options: ApplyPhase28Parker51Options,
): Promise<ApplyPhase28Parker51Result> {
  const packs = structuredClone(phase28Parker51Packs);
  await augmentVintagePackWithDuplicatePayload(
    client,
    packs,
    options.workspaceRoot,
  );
  await retireDuplicateAndInstallRedirects(client);
  const result = await applyCuratedContentPacks(client, options, packs);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
