import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { phase22MontblancPacks } from "./data/phase22-montblanc";
import {
  curatedId,
  loadCuratedEntityPack,
  packId,
  type CuratedEntityPack,
  type CuratedSource,
  type LoadedCuratedEntityPack,
  type SpecFieldKey,
} from "./lib/curated-content-pack";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
  setEntityPublicationStatus,
} from "../src/lib/publication";

export interface ApplyPhase22Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase22Result {
  entities: Array<{
    entityId: string;
    outcome: "published" | "blocked" | "noop";
    contentHash: string;
  }>;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 22 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase22Options,
): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile()) {
    throw new Error("Phase 22 owned catalog authority is not a regular local copy.");
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 22 owned catalog must not be a symlink.");
  }
  if (!isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 22 database must remain inside the caller-owned root.");
  }
  const ownedStat = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 22 refuses the protected catalog and hard-link aliases.");
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  const clientPath = main?.file ? fs.realpathSync.native(String(main.file)) : null;
  if (clientPath !== databasePath) {
    throw new Error("Phase 22 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 22 owned copy must be migrated through 032 before apply.");
  }
}

function localPublicFile(workspaceRoot: string, localPath: string): string {
  const relative = localPath.startsWith("public/")
    ? localPath.slice("public/".length)
    : localPath.slice(1);
  return path.join(workspaceRoot, "public", relative);
}

export function validatePack(workspaceRoot: string, pack: LoadedCuratedEntityPack): void {
  const publicationIntent = pack.publicationIntent ?? "publish";
  const publicationBlockers = pack.publicationBlockers ?? [];
  const summaryLength = Array.from(pack.summary).length;
  const minimumBody = pack.expectedType === "brand" ? 1_200 : 2_000;
  if (summaryLength < 60 || summaryLength > 160) {
    throw new Error(`${pack.key} summary must contain 60-160 Unicode characters.`);
  }
  if (Array.from(pack.bodyMd).length < minimumBody) {
    throw new Error(`${pack.key} reviewed body is shorter than ${minimumBody} characters.`);
  }
  if (pack.sources.length < 2 || pack.claims.length === 0) {
    throw new Error(`${pack.key} lacks the minimum sourced content graph.`);
  }
  const sourceKeys = new Set(pack.sources.map((source) => source.key));
  for (const source of pack.sources) {
    if (!source.archiveUrl?.trim() || !source.archiveLocator?.trim()) {
      throw new Error(`${pack.key} source ${source.key} lacks honest archive evidence.`);
    }
    if (source.archiveUrl.includes(".planning/")) {
      throw new Error(`${pack.key} source ${source.key} exposes an internal planning path.`);
    }
    if (source.archiveUrl.startsWith("/")) {
      const archiveFile = path.join(workspaceRoot, "public", source.archiveUrl.slice(1));
      if (!fs.existsSync(archiveFile) || !fs.statSync(archiveFile).isFile()) {
        throw new Error(`${pack.key} source ${source.key} evidence snapshot is missing.`);
      }
    } else {
      const archiveUrl = new URL(source.archiveUrl);
      if (!(archiveUrl.protocol === "https:" || archiveUrl.protocol === "http:")) {
        throw new Error(`${pack.key} source ${source.key} has an unsafe archive URL.`);
      }
    }
  }
  for (const claim of pack.claims) {
    if (!sourceKeys.has(claim.sourceKey) || claim.evidence.length === 0) {
      throw new Error(`${pack.key} claim ${claim.key} lacks its declared source/evidence.`);
    }
  }
  const primaryMedia = pack.media.filter((media) => media.usageStatus === "primary");
  if (publicationIntent === "publish" && primaryMedia.length !== 1) {
    throw new Error(`${pack.key} must declare exactly one primary image.`);
  }
  if (publicationIntent === "publish" && publicationBlockers.length > 0) {
    throw new Error(`${pack.key} cannot publish with declared blockers.`);
  }
  if (publicationIntent === "blocked-draft" && publicationBlockers.length === 0) {
    throw new Error(`${pack.key} blocked draft must declare at least one blocker.`);
  }
  if (
    publicationIntent === "blocked-draft" &&
    publicationBlockers.includes("missing_approved_primary_media") &&
    primaryMedia.length !== 0
  ) {
    throw new Error(`${pack.key} declares missing primary media but also supplies one.`);
  }
  for (const media of pack.media) {
    if (!sourceKeys.has(media.sourceKey)) {
      throw new Error(`${pack.key} media ${media.key} has an unknown source.`);
    }
    if (media.usageStatus === "primary") {
      if (!media.localPath?.trim()) {
        throw new Error(`${pack.key} primary image has no on-site path.`);
      }
      const publicFile = localPublicFile(workspaceRoot, media.localPath);
      if (!fs.existsSync(publicFile) || !fs.statSync(publicFile).isFile()) {
        throw new Error(`${pack.key} primary image is missing: ${media.localPath}`);
      }
    }
  }
  if (pack.expectedType === "brand" && (pack.timeline?.length ?? 0) < 2) {
    throw new Error(`${pack.key} brand requires at least two sourced timeline events.`);
  }
  if (pack.expectedType === "pen") {
    if (!pack.spec || Object.keys(pack.spec.values).length < 5) {
      throw new Error(`${pack.key} pen requires at least five evidenced spec fields.`);
    }
    const requiredFields = new Set<SpecFieldKey>([
      "brand_entity_id",
      ...(Object.keys(pack.spec.values) as Array<Exclude<SpecFieldKey, "brand_entity_id">>),
    ]);
    const evidencedFields = new Set(
      pack.spec.evidence.filter((evidence) => evidence.qualifies !== false).map((evidence) => evidence.fieldKey),
    );
    for (const field of requiredFields) {
      if (!evidencedFields.has(field)) {
        throw new Error(`${pack.key} spec field ${field} lacks qualifying evidence.`);
      }
    }
  }
}

export function uniqueSources(packs: LoadedCuratedEntityPack[]): CuratedSource[] {
  const sources = new Map<string, CuratedSource>();
  for (const pack of packs) {
    for (const source of pack.sources) {
      const previous = sources.get(source.key);
      if (previous && JSON.stringify(previous) !== JSON.stringify(source)) {
        throw new Error(`Conflicting curated source definition: ${source.key}`);
      }
      sources.set(source.key, source);
    }
  }
  return [...sources.values()];
}

function reliability(source: CuratedSource): string {
  if (source.sourceType === "official") return "official_marketing";
  if (source.sourceType === "wikimedia") return "high_for_basic_facts";
  if (source.tier === "professional_secondary") return "high_for_model_history";
  return "medium";
}

export async function upsertSources(
  transaction: Transaction,
  sources: CuratedSource[],
): Promise<Map<string, string>> {
  const registrySources = new Map<string, CuratedSource[]>();
  for (const source of sources) {
    const group = registrySources.get(source.registryKey) ?? [];
    group.push(source);
    registrySources.set(source.registryKey, group);
  }
  for (const [registryKey, group] of registrySources) {
    const first = group[0];
    if (!first) continue;
    const tier = group.every((source) => source.tier === first.tier) ? first.tier : null;
    const independence = group.every(
      (source) => source.independenceGroup === first.independenceGroup,
    )
      ? first.independenceGroup
      : null;
    // Registry and source-item rows are shared evidence. A replayed pack must
    // not rewrite a snapshot owned by another pack and demote its publications.
    await transaction.execute({
      sql: `
        INSERT INTO source_registry (
          id, name, source_type, allowed_use, reliability, license,
          attribution, homepage_url, fetch_method, notes, last_checked_at,
          default_source_tier, default_independence_group
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING
      `,
      args: [
        curatedId("source-registry", registryKey),
        first.registryName,
        first.sourceType,
        first.allowedUse,
        reliability(first),
        first.license ?? null,
        first.author ?? null,
        first.homepageUrl,
        `Curated source registry: ${registryKey}`,
        first.retrievedAt,
        tier,
        independence,
      ],
    });
  }

  const sourceItemIds = new Map<string, string>();
  for (const source of sources) {
    const sourceRegistryId = curatedId("source-registry", source.registryKey);
    const existing = await transaction.execute({
      sql: "SELECT id FROM source_items WHERE source_id = ? AND url = ?",
      args: [sourceRegistryId, source.url],
    });
    const sourceItemId = existing.rows.length === 1
      ? String(existing.rows[0]?.id)
      : curatedId("source-item", source.key);
    sourceItemIds.set(source.key, sourceItemId);
    await transaction.execute({
      sql: `
        INSERT INTO source_items (
          id, source_id, title, url, item_type, license, author,
          published_at, retrieved_at, summary, raw_metadata_json,
          allowed_use, review_status, source_tier, independence_group,
          archive_url, archive_locator
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING
      `,
      args: [
        sourceItemId,
        sourceRegistryId,
        source.title,
        source.url,
        source.itemType ?? "web_page",
        source.license ?? null,
        source.author ?? null,
        source.publishedAt ?? null,
        source.retrievedAt,
        source.summary,
        JSON.stringify({
          curatedSourceKey: source.key,
          archiveLocator: source.archiveLocator,
        }),
        source.allowedUse,
        source.tier,
        source.independenceGroup,
        source.archiveUrl ?? null,
        source.archiveLocator ?? null,
      ],
    });
  }
  return sourceItemIds;
}

async function deleteOwnedPayload(transaction: Transaction, entityId: string): Promise<void> {
  await transaction.execute({
    sql: `
      DELETE FROM claim_evidence
      WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id = ?)
    `,
    args: [entityId],
  });
  await transaction.execute({
    sql: `
      DELETE FROM spec_field_evidence
      WHERE model_spec_id IN (SELECT id FROM model_specs WHERE entity_id = ?)
    `,
    args: [entityId],
  });
  await transaction.execute({
    sql: `
      DELETE FROM citations
      WHERE (target_type = 'entity' AND target_id = ?)
         OR (target_type = 'story' AND target_id IN (SELECT id FROM stories WHERE entity_id = ?))
         OR (target_type = 'timeline_event' AND target_id IN (SELECT id FROM timeline_events WHERE entity_id = ?))
         OR (target_type = 'model_spec' AND target_id IN (SELECT id FROM model_specs WHERE entity_id = ?))
         OR (target_type = 'claim' AND target_id IN (SELECT id FROM claims WHERE subject_entity_id = ?))
         OR claim_id IN (SELECT id FROM claims WHERE subject_entity_id = ?)
    `,
    args: [entityId, entityId, entityId, entityId, entityId, entityId],
  });
  for (const sql of [
    "DELETE FROM fact_conflicts WHERE entity_id = ?",
    "DELETE FROM fact_scopes WHERE entity_id = ?",
    "DELETE FROM entity_references WHERE entity_id = ?",
    "DELETE FROM entity_aliases WHERE entity_id = ?",
    "DELETE FROM timeline_events WHERE entity_id = ?",
    "DELETE FROM media_assets WHERE entity_id = ?",
    "DELETE FROM model_variants WHERE model_entity_id = ?",
    "DELETE FROM model_specs WHERE entity_id = ?",
    "DELETE FROM claims WHERE subject_entity_id = ?",
    "DELETE FROM stories WHERE entity_id = ?",
  ]) {
    await transaction.execute({ sql, args: [entityId] });
  }
}

function sourceItem(
  sourceItemIds: Map<string, string>,
  sourceKey: string,
): string {
  const id = sourceItemIds.get(sourceKey);
  if (!id) throw new Error(`Missing source item mapping: ${sourceKey}`);
  return id;
}

export async function insertPack(
  transaction: Transaction,
  pack: LoadedCuratedEntityPack,
  sourceItemIds: Map<string, string>,
): Promise<void> {
  await deleteOwnedPayload(transaction, pack.entityId);
  const updated = await transaction.execute({
    sql: `
      UPDATE entities
      SET name = ?, summary = ?, body_md = ?, source = ?, updated_at = datetime('now')
      WHERE id = ? AND type = ? AND slug = ?
    `,
    args: [
      pack.canonicalName,
      pack.summary,
      pack.bodyMd,
      pack.sourceMarker,
      pack.entityId,
      pack.expectedType,
      pack.expectedSlug,
    ],
  });
  if (updated.rowsAffected !== 1) {
    throw new Error(`Phase 22 entity identity mismatch: ${pack.entityId}`);
  }
  const publication = await transaction.execute({
    sql: `UPDATE entity_publications SET depth_tier = ?, updated_at = datetime('now') WHERE entity_id = ?`,
    args: [pack.depthTier, pack.entityId],
  });
  if (publication.rowsAffected !== 1) {
    throw new Error(`Phase 22 publication row missing: ${pack.entityId}`);
  }

  const storyId = packId(pack, "story", "published");
  await transaction.execute({
    sql: `
      INSERT INTO stories (
        id, entity_id, title, story_type, summary, body_md, status, source_notes
      ) VALUES (?, ?, ?, ?, ?, ?, 'published', ?)
    `,
    args: [
      storyId,
      pack.entityId,
      pack.storyTitle,
      pack.expectedType === "brand" ? "brand_story" : "model_story",
      pack.summary,
      pack.bodyMd,
      pack.sourceMarker,
    ],
  });

  for (const source of pack.sources) {
    const relationType = source.sourceType === "official"
      ? "official"
      : source.tier === "professional_secondary"
        ? "review"
        : "reference";
    await transaction.execute({
      sql: `
        INSERT INTO entity_references (
          id, entity_id, source_item_id, relation_type, note, review_status
        ) VALUES (?, ?, ?, ?, ?, 'approved')
      `,
      args: [
        packId(pack, "reference", source.key),
        pack.entityId,
        sourceItem(sourceItemIds, source.key),
        relationType,
        source.summary,
      ],
    });
  }

  for (const alias of pack.aliases) {
    await transaction.execute({
      sql: `
        INSERT INTO entity_aliases (
          id, entity_id, alias, language, source_id, alias_kind,
          market, source_item_id, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved')
      `,
      args: [
        packId(pack, "alias", `${alias.language}:${alias.alias}`),
        pack.entityId,
        alias.alias,
        alias.language,
        curatedId(
          "source-registry",
          pack.sources.find((source) => source.key === alias.sourceKey)?.registryKey ?? "missing",
        ),
        alias.kind ?? "alias",
        alias.market ?? null,
        sourceItem(sourceItemIds, alias.sourceKey),
      ],
    });
  }

  const variantIds = new Map<string, string>();
  for (const variant of pack.variants ?? []) {
    variantIds.set(variant.key, packId(pack, "variant", variant.key));
  }
  for (const variant of pack.variants ?? []) {
    await transaction.execute({
      sql: `
        INSERT INTO model_variants (
          id, model_entity_id, variant_name, release_year, notes,
          source_item_id, review_status, variant_kind, parent_variant_id,
          product_code, market
        ) VALUES (?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?, ?)
      `,
      args: [
        variantIds.get(variant.key) ?? null,
        pack.entityId,
        variant.name,
        variant.releaseYear ?? null,
        variant.notes,
        sourceItem(sourceItemIds, variant.sourceKey),
        variant.variantKind ?? "variant",
        variant.parentVariantKey ? variantIds.get(variant.parentVariantKey) ?? null : null,
        variant.productCode ?? null,
        variant.market ?? null,
      ],
    });
  }

  const scopeIds = new Map<string, string>();
  for (const scope of pack.scopes) {
    const scopeId = packId(pack, "scope", scope.key);
    scopeIds.set(scope.key, scopeId);
    await transaction.execute({
      sql: `
        INSERT INTO fact_scopes (
          id, entity_id, variant_id, scope_key, market, valid_from,
          valid_to, production_state, nib_scope, material_scope, edition_scope
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        scopeId,
        pack.entityId,
        scope.variantKey ? variantIds.get(scope.variantKey) ?? null : null,
        scope.scopeKey,
        scope.market ?? null,
        scope.validFrom ?? null,
        scope.validTo ?? null,
        scope.productionState ?? null,
        scope.nibScope ?? null,
        scope.materialScope ?? null,
        scope.editionScope ?? null,
      ],
    });
  }

  for (const claim of pack.claims) {
    const claimId = packId(pack, "claim", claim.key);
    await transaction.execute({
      sql: `
        INSERT INTO claims (
          id, subject_entity_id, predicate, object_text, source_item_id,
          evidence_locator, confidence, review_status, fact_class
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?)
      `,
      args: [
        claimId,
        pack.entityId,
        claim.predicate,
        claim.objectText,
        sourceItem(sourceItemIds, claim.sourceKey),
        claim.locator,
        claim.confidence,
        claim.factClass,
      ],
    });
    for (const evidence of claim.evidence) {
      const scopeId = scopeIds.get(evidence.scopeKey);
      if (!scopeId) throw new Error(`Unknown claim scope: ${evidence.scopeKey}`);
      const citationId = packId(pack, "claim-citation", evidence.key);
      await transaction.execute({
        sql: `
          INSERT INTO citations (
            id, target_type, target_id, source_item_id, claim_id, note,
            review_status, evidence_locator, scope_id
          ) VALUES (?, 'claim', ?, ?, ?, ?, 'approved', ?, ?)
        `,
        args: [
          citationId,
          claimId,
          sourceItem(sourceItemIds, evidence.sourceKey),
          claimId,
          evidence.note ?? null,
          evidence.locator,
          scopeId,
        ],
      });
      await transaction.execute({
        sql: `
          INSERT INTO claim_evidence (
            id, claim_id, citation_id, scope_id, evidence_locator, review_status
          ) VALUES (?, ?, ?, ?, ?, 'approved')
        `,
        args: [
          packId(pack, "claim-evidence", evidence.key),
          claimId,
          citationId,
          scopeId,
          evidence.locator,
        ],
      });
    }
  }

  const specCitationIds = new Map<string, string>();
  if (pack.spec) {
    const specId = packId(pack, "model-spec", "approved");
    const values = pack.spec.values;
    await transaction.execute({
      sql: `
        INSERT INTO model_specs (
          id, entity_id, brand_entity_id, series_name, release_year,
          origin_country, nib, fill_system, material, dimensions, weight,
          price_range, status, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
      `,
      args: [
        specId,
        pack.entityId,
        pack.spec.brandEntityId,
        values.series_name ?? null,
        values.release_year ?? null,
        values.origin_country ?? null,
        values.nib ?? null,
        values.fill_system ?? null,
        values.material ?? null,
        values.dimensions ?? null,
        values.weight ?? null,
        values.price_range ?? null,
        values.status ?? null,
      ],
    });
    for (const evidence of pack.spec.evidence) {
      const scopeId = scopeIds.get(evidence.scopeKey);
      if (!scopeId) throw new Error(`Unknown spec scope: ${evidence.scopeKey}`);
      const citationId = packId(pack, "spec-citation", evidence.key);
      specCitationIds.set(evidence.key, citationId);
      await transaction.execute({
        sql: `
          INSERT INTO citations (
            id, target_type, target_id, source_item_id, note,
            review_status, evidence_locator, scope_id
          ) VALUES (?, 'model_spec', ?, ?, ?, 'approved', ?, ?)
        `,
        args: [
          citationId,
          specId,
          sourceItem(sourceItemIds, evidence.sourceKey),
          evidence.note ?? null,
          evidence.locator,
          scopeId,
        ],
      });
      await transaction.execute({
        sql: `
          INSERT INTO spec_field_evidence (
            id, model_spec_id, field_key, citation_id, scope_id,
            evidence_locator, review_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          packId(pack, "spec-evidence", evidence.key),
          specId,
          evidence.fieldKey,
          citationId,
          scopeId,
          evidence.locator,
          evidence.qualifies === false ? "rejected" : "approved",
        ],
      });
    }
  }

  for (const conflict of pack.conflicts ?? []) {
    const conflictId = packId(pack, "conflict", conflict.key);
    await transaction.execute({
      sql: `
        INSERT INTO fact_conflicts (
          id, entity_id, field_key, scope_id, conflict_kind, status, resolution_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        conflictId,
        pack.entityId,
        conflict.fieldKey,
        scopeIds.get(conflict.scopeKey) ?? null,
        conflict.conflictKind,
        conflict.status,
        conflict.resolutionNote,
      ],
    });
    for (const member of conflict.members) {
      const citationId = specCitationIds.get(member.citationKey);
      if (!citationId) throw new Error(`Unknown conflict citation: ${member.citationKey}`);
      await transaction.execute({
        sql: `
          INSERT INTO fact_conflict_members (
            id, conflict_id, citation_id, asserted_value
          ) VALUES (?, ?, ?, ?)
        `,
        args: [
          packId(pack, "conflict-member", `${conflict.key}:${member.citationKey}`),
          conflictId,
          citationId,
          member.assertedValue,
        ],
      });
    }
  }

  for (const event of pack.timeline ?? []) {
    await transaction.execute({
      sql: `
        INSERT INTO timeline_events (
          id, entity_id, title, event_type, start_date, circa,
          description, source_item_id, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved')
      `,
      args: [
        packId(pack, "timeline", event.key),
        pack.entityId,
        event.title,
        event.eventType,
        event.startDate,
        event.circa ? 1 : 0,
        event.description,
        sourceItem(sourceItemIds, event.sourceKey),
      ],
    });
  }

  for (const media of pack.media) {
    await transaction.execute({
      sql: `
        INSERT INTO media_assets (
          id, entity_id, title, asset_type, image_url, thumbnail_url,
          local_path, author, license, attribution_text, source_url,
          source_item_id, review_status, usage_status
        ) VALUES (?, ?, ?, 'image', ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
      `,
      args: [
        packId(pack, "media", media.key),
        pack.entityId,
        media.title,
        media.imageUrl ?? null,
        media.thumbnailUrl ?? null,
        media.localPath ?? null,
        media.author,
        media.license,
        media.attributionText,
        media.sourceUrl,
        sourceItem(sourceItemIds, media.sourceKey),
        media.usageStatus,
      ],
    });
  }
}

async function preflightEntityIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  for (const pack of packs) {
    const entity = await client.execute({
      sql: "SELECT type, slug FROM entities WHERE id = ?",
      args: [pack.entityId],
    });
    if (
      entity.rows.length !== 1 ||
      String(entity.rows[0]?.type) !== pack.expectedType ||
      String(entity.rows[0]?.slug) !== pack.expectedSlug
    ) {
      throw new Error(`Phase 22 canonical identity mismatch: ${pack.entityId}`);
    }
  }
  const pens = packs.filter((pack) => pack.expectedType === "pen");
  const brands = packs.filter((pack) => pack.expectedType === "brand");
  if (pens.length === 0 || brands.length !== 1) {
    throw new Error("Phase 22 requires exactly one brand and at least one pen pack.");
  }
  const brand = brands[0];
  if (!brand) throw new Error("Phase 22 brand pack is missing.");
  for (const pen of pens) {
    const madeBy = await client.execute({
      sql: `SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'`,
      args: [pen.entityId],
    });
    if (madeBy.rows.length !== 1 || String(madeBy.rows[0]?.target_id) !== brand.entityId) {
      throw new Error(`Phase 22 canonical made_by link is missing or ambiguous: ${pen.entityId}`);
    }
  }
}

async function alreadyApplied(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<boolean> {
  for (const pack of packs) {
    const row = await client.execute({
      sql: `
        SELECT entity.source, publication.status, readiness.blocker_count,
               readiness.blockers_json, readiness.publishable,
               CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
        FROM entities entity
        JOIN entity_publications publication ON publication.entity_id = entity.id
        LEFT JOIN public_entity_readiness readiness
          ON readiness.entity_id = entity.id AND readiness.contract_version = 3
        LEFT JOIN public_entities public ON public.id = entity.id
        WHERE entity.id = ?
      `,
      args: [pack.entityId],
    });
    const current = row.rows[0];
    if (!current || String(current.source ?? "") !== pack.sourceMarker) {
      return false;
    }
    const publicationIntent = pack.publicationIntent ?? "publish";
    if (publicationIntent === "publish") {
      if (
        String(current.status) !== "published" ||
        Number(current.blocker_count) !== 0 ||
        Number(current.publishable) !== 1 ||
        Number(current.is_public) !== 1
      ) {
        return false;
      }
      continue;
    }
    const blockers = new Set<string>(
      JSON.parse(String(current.blockers_json ?? "[]")) as string[],
    );
    if (
      String(current.status) !== "draft" ||
      Number(current.is_public) !== 0 ||
      !(pack.publicationBlockers ?? []).every((blocker) => blockers.has(blocker))
    ) {
      return false;
    }
  }
  return true;
}

export async function isCuratedContentPackSetApplied(
  client: Client,
  workspaceRoot: string,
  curatedPacks: CuratedEntityPack[],
): Promise<boolean> {
  const packs = curatedPacks.map((pack) =>
    loadCuratedEntityPack(fs.realpathSync.native(workspaceRoot), pack),
  );
  return alreadyApplied(client, packs);
}

async function preserveBlockedDraft(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<string> {
  await setEntityPublicationStatus(client, pack.entityId, "draft");
  const readiness = await client.execute({
    sql: `
      SELECT blockers_json
      FROM public_entity_readiness
      WHERE entity_id = ? AND contract_version = 3
    `,
    args: [pack.entityId],
  });
  const blockersJson = String(readiness.rows[0]?.blockers_json ?? "[]");
  const blockers = new Set<string>(JSON.parse(blockersJson) as string[]);
  for (const blocker of pack.publicationBlockers ?? []) {
    if (!blockers.has(blocker)) {
      throw new Error(`Phase 22 expected blocker is missing for ${pack.entityId}: ${blocker}`);
    }
  }
  await client.execute({
    sql: `
      UPDATE entity_publications
      SET blockers_json = ?, review_notes = ?, updated_at = datetime('now')
      WHERE entity_id = ? AND status = 'draft'
    `,
    args: [
      blockersJson,
      `${pack.sourceMarker}; blocked draft: ${(pack.publicationBlockers ?? []).join(", ")}`,
      pack.entityId,
    ],
  });
  return computePublicationContentHash(client, pack.entityId);
}

export async function applyCuratedContentPacks(
  client: Client,
  options: ApplyPhase22Options,
  curatedPacks: CuratedEntityPack[],
): Promise<ApplyPhase22Result> {
  await assertOwnedCatalog(client, options);
  const reviewer = options.reviewer.trim();
  if (!reviewer) throw new Error("Phase 22 reviewer must not be empty.");
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = curatedPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  for (const pack of packs) validatePack(workspaceRoot, pack);
  await preflightEntityIdentity(client, packs);

  if (await alreadyApplied(client, packs)) {
    const entities = [];
    for (const pack of packs) {
      entities.push({
        entityId: pack.entityId,
        outcome: "noop" as const,
        contentHash: await computePublicationContentHash(client, pack.entityId),
      });
    }
    return { entities };
  }

  const transaction = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(transaction, uniqueSources(packs));
    for (const pack of packs) {
      await insertPack(transaction, pack, sourceItemIds);
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  const entities: ApplyPhase22Result["entities"] = [];
  for (const pack of packs) {
    if ((pack.publicationIntent ?? "publish") === "blocked-draft") {
      entities.push({
        entityId: pack.entityId,
        outcome: "blocked",
        contentHash: await preserveBlockedDraft(client, pack),
      });
      continue;
    }
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: pack.entityId,
        reviewKind,
        reviewer,
        status: "approved",
        notes: `${pack.sourceMarker}; ${reviewKind} review of checked-in sourced copy.`,
      });
    }
    const published = await publishEntity(client, {
      entityId: pack.entityId,
      reviewer,
    });
    entities.push({
      entityId: pack.entityId,
      outcome: "published",
      contentHash: published.contentHash,
    });
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}

export async function applyPhase22MontblancContent(
  client: Client,
  options: ApplyPhase22Options,
): Promise<ApplyPhase22Result> {
  return applyCuratedContentPacks(client, options, phase22MontblancPacks);
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const databasePath = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  const reviewer = cliValue("--reviewer") ?? "phase22-curated-content";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error(
      "Usage: tsx scripts/apply-phase22-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const protectedCatalogSnapshot = snapshotCatalogFiles(protectedCatalogPath);
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    const result = await applyPhase22MontblancContent(client, {
      workspaceRoot,
      reviewer,
      databasePath: path.resolve(databasePath),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalogPath),
      protectedCatalogSnapshot,
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
