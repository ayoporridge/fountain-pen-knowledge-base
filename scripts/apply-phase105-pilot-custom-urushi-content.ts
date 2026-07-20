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
import type {
  ApplyPhase22Options,
  ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE105_PILOT_ID,
  PHASE105_URUSHI_ID,
  PHASE105_URUSHI_SLUG,
  phase105PilotCustomUrushiPack,
} from "./data/phase105-pilot-custom-urushi";
import {
  curatedId,
  loadCuratedEntityPack,
  packId,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export {
  PHASE105_PILOT_ID,
  PHASE105_URUSHI_ID,
  PHASE105_URUSHI_SLUG,
} from "./data/phase105-pilot-custom-urushi";

export type ApplyPhase105Options = ApplyPhase22Options;
export type ApplyPhase105Result = ApplyPhase22Result;

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
      throw new Error(`Phase 105 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase105Options,
): Promise<{ databasePath: string; workspaceRoot: string }> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 105 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error("Phase 105 requires a non-symlink catalog file inside the caller-owned root.");
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 105 refuses the protected catalog or a hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 105 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 105 owned copy must be migrated through 032.");
  }
  return { databasePath, workspaceRoot };
}

function validatePack(workspaceRoot: string): LoadedCuratedEntityPack {
  const pack = loadCuratedEntityPack(workspaceRoot, phase105PilotCustomUrushiPack);
  const summaryLength = Array.from(pack.summary).length;
  if (summaryLength < 60 || summaryLength > 160) {
    throw new Error("Phase 105 summary must contain 60-160 Unicode characters.");
  }
  if (Array.from(pack.bodyMd).length < 2_000) {
    throw new Error("Phase 105 reviewed body must contain at least 2,000 Unicode characters.");
  }
  if (!pack.spec || pack.claims.length === 0 || pack.scopes.length === 0) {
    throw new Error("Phase 105 pack lacks structured claims, scopes, or model specs.");
  }
  for (const source of pack.sources) {
    if (!source.archiveUrl?.trim() || !source.archiveLocator?.trim()) {
      throw new Error(`Phase 105 source lacks honest locator: ${source.key}`);
    }
  }
  const primary = pack.media.filter((media) => media.usageStatus === "primary");
  if (primary.length !== 1 || !primary[0]?.localPath) {
    throw new Error("Phase 105 requires exactly one local primary media item.");
  }
  const imagePath = path.join(workspaceRoot, "public", primary[0].localPath.slice(1));
  if (!fs.statSync(imagePath).isFile()) throw new Error("Phase 105 primary SVG is missing.");
  const image = fs.readFileSync(imagePath, "utf8");
  if (!image.includes("非产品照片") && !image.includes("非实物照片")) {
    throw new Error("Phase 105 primary SVG must state that it is not a product photo.");
  }
  return pack;
}

async function assertIdentityPreflight(client: Client): Promise<void> {
  const brand = await client.execute({
    sql: "SELECT id,type,slug FROM entities WHERE id=? OR slug='pilot' ORDER BY id",
    args: [PHASE105_PILOT_ID],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.id) !== PHASE105_PILOT_ID ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== "pilot"
  ) {
    throw new Error("Phase 105 requires the exact existing Pilot brand identity.");
  }
  const entity = await client.execute({
    sql: "SELECT id,type,slug FROM entities WHERE id=? OR slug=? ORDER BY id",
    args: [PHASE105_URUSHI_ID, PHASE105_URUSHI_SLUG],
  });
  if (
    entity.rows.length > 1 ||
    (entity.rows.length === 1 &&
      (String(entity.rows[0]?.id) !== PHASE105_URUSHI_ID ||
        String(entity.rows[0]?.type) !== "pen" ||
        String(entity.rows[0]?.slug) !== PHASE105_URUSHI_SLUG))
  ) {
    throw new Error("Phase 105 Custom URUSHI identity or slug collision.");
  }
}

async function isExactTerminalState(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<string | null> {
  const currentHash = await computePublicationContentHash(client, pack.entityId).catch(
    () => null,
  );
  if (!currentHash) return null;
  const row = await client.execute({
    sql: `
      SELECT entity.source, publication.status, publication.approved_content_hash,
             publication.reviewed_content_revision, publication.content_revision,
             publication.reviewed_contract_version, readiness.publishable,
             readiness.blocker_count,
             CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
      FROM entities entity
      JOIN entity_publications publication ON publication.entity_id=entity.id
      LEFT JOIN public_entity_readiness readiness
        ON readiness.entity_id=entity.id AND readiness.contract_version=3
      LEFT JOIN public_entities public ON public.id=entity.id
      WHERE entity.id=?
    `,
    args: [pack.entityId],
  });
  const state = row.rows[0];
  if (
    !state ||
    String(state.source ?? "") !== pack.sourceMarker ||
    String(state.status) !== "published" ||
    String(state.approved_content_hash ?? "") !== currentHash ||
    Number(state.reviewed_content_revision) !== Number(state.content_revision) ||
    Number(state.reviewed_contract_version) !== 3 ||
    Number(state.publishable) !== 1 ||
    Number(state.blocker_count) !== 0 ||
    Number(state.is_public) !== 1
  ) {
    return null;
  }
  const reviews = await client.execute({
    sql: `SELECT review_kind,count(*) AS total FROM entity_content_reviews
          WHERE entity_id=? AND content_hash=? AND status='approved'
          GROUP BY review_kind ORDER BY review_kind`,
    args: [pack.entityId, currentHash],
  });
  const exactReviews = new Map(
    reviews.rows.map((review) => [String(review.review_kind), Number(review.total)]),
  );
  if (
    ["fact", "language", "media", "publication"].some(
      (kind) => exactReviews.get(kind) !== 1,
    )
  ) {
    return null;
  }
  const maker = await client.execute({
    sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
    args: [pack.entityId],
  });
  return maker.rows.length === 1 && String(maker.rows[0]?.target_id) === PHASE105_PILOT_ID
    ? currentHash
    : null;
}

async function deleteOwnedPayload(tx: Transaction): Promise<void> {
  const id = PHASE105_URUSHI_ID;
  await tx.execute({
    sql: "DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)",
    args: [id],
  });
  await tx.execute({
    sql: "DELETE FROM spec_field_evidence WHERE model_spec_id IN (SELECT id FROM model_specs WHERE entity_id=?)",
    args: [id],
  });
  await tx.execute({
    sql: `DELETE FROM citations
          WHERE (target_type='entity' AND target_id=?)
             OR (target_type='story' AND target_id IN (SELECT id FROM stories WHERE entity_id=?))
             OR (target_type='timeline_event' AND target_id IN (SELECT id FROM timeline_events WHERE entity_id=?))
             OR (target_type='model_spec' AND target_id IN (SELECT id FROM model_specs WHERE entity_id=?))
             OR (target_type='claim' AND target_id IN (SELECT id FROM claims WHERE subject_entity_id=?))
             OR claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)`,
    args: [id, id, id, id, id, id],
  });
  for (const sql of [
    "DELETE FROM fact_conflicts WHERE entity_id=?",
    "DELETE FROM fact_scopes WHERE entity_id=?",
    "DELETE FROM entity_references WHERE entity_id=?",
    "DELETE FROM entity_aliases WHERE entity_id=?",
    "DELETE FROM timeline_events WHERE entity_id=?",
    "DELETE FROM media_assets WHERE entity_id=?",
    "DELETE FROM model_variants WHERE model_entity_id=?",
    "DELETE FROM model_specs WHERE entity_id=?",
    "DELETE FROM claims WHERE subject_entity_id=?",
    "DELETE FROM stories WHERE entity_id=?",
  ]) {
    await tx.execute({ sql, args: [id] });
  }
}

async function installPack(tx: Transaction, pack: LoadedCuratedEntityPack): Promise<void> {
  const existing = await tx.execute({
    sql: "SELECT id FROM entities WHERE id=?",
    args: [pack.entityId],
  });
  if (existing.rows.length === 0) {
    await tx.execute({
      sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
      args: [pack.entityId, pack.expectedSlug, pack.canonicalName],
    });
  }
  await tx.execute({
    sql: "UPDATE entity_publications SET status='draft', published_at=NULL, depth_tier=?, updated_at=datetime('now') WHERE entity_id=?",
    args: [pack.depthTier, pack.entityId],
  });
  await tx.execute({
    sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
    args: [pack.entityId, PHASE105_PILOT_ID],
  });
  await tx.execute({
    sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
    args: [
      packId(pack, "made-by", PHASE105_PILOT_ID),
      pack.entityId,
      PHASE105_PILOT_ID,
      "Phase 105 exact Pilot maker relation",
    ],
  });
  const maker = await tx.execute({
    sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
    args: [pack.entityId],
  });
  if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE105_PILOT_ID) {
    throw new Error("Phase 105 failed to normalize the unique Pilot maker relation.");
  }

  await deleteOwnedPayload(tx);
  const updated = await tx.execute({
    sql: "UPDATE entities SET name=?,summary=?,body_md=?,source=?,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=?",
    args: [
      pack.canonicalName,
      pack.summary,
      pack.bodyMd,
      pack.sourceMarker,
      pack.entityId,
      pack.expectedSlug,
    ],
  });
  if (updated.rowsAffected !== 1) throw new Error("Phase 105 entity identity changed during apply.");

  const sourceIds = new Map<string, string>();
  for (const source of pack.sources) {
    const registryId = curatedId("source-registry", source.registryKey);
    const sourceId = curatedId("source-item", source.key);
    sourceIds.set(source.key, sourceId);
    await tx.execute({
      sql: `INSERT INTO source_registry(
              id,name,source_type,allowed_use,reliability,license,attribution,
              homepage_url,fetch_method,notes,last_checked_at,
              default_source_tier,default_independence_group
            ) VALUES(?,?,?,?,?,?,?,?, 'manual',?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET
              name=excluded.name,source_type=excluded.source_type,
              allowed_use=excluded.allowed_use,reliability=excluded.reliability,
              license=excluded.license,attribution=excluded.attribution,
              homepage_url=excluded.homepage_url,notes=excluded.notes,
              last_checked_at=excluded.last_checked_at,
              default_source_tier=excluded.default_source_tier,
              default_independence_group=excluded.default_independence_group,
              updated_at=datetime('now')`,
      args: [
        registryId,
        source.registryName,
        source.sourceType,
        source.allowedUse,
        source.sourceType === "official" ? "official_marketing" : "medium",
        source.license ?? null,
        source.author ?? null,
        source.homepageUrl,
        `Phase 105 curated source: ${source.registryKey}`,
        source.retrievedAt,
        source.tier,
        source.independenceGroup,
      ],
    });
    await tx.execute({
      sql: `INSERT INTO source_items(
              id,source_id,title,url,item_type,license,author,published_at,
              retrieved_at,summary,raw_metadata_json,allowed_use,review_status,
              source_tier,independence_group,archive_url,archive_locator
            ) VALUES(?,?,?,?,?,?,?,?,?,?,? ,?,'approved',?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET
              source_id=excluded.source_id,title=excluded.title,url=excluded.url,
              item_type=excluded.item_type,license=excluded.license,
              author=excluded.author,published_at=excluded.published_at,
              retrieved_at=excluded.retrieved_at,summary=excluded.summary,
              raw_metadata_json=excluded.raw_metadata_json,
              allowed_use=excluded.allowed_use,review_status='approved',
              source_tier=excluded.source_tier,
              independence_group=excluded.independence_group,
              archive_url=excluded.archive_url,
              archive_locator=excluded.archive_locator,updated_at=datetime('now')`,
      args: [
        sourceId,
        registryId,
        source.title,
        source.url,
        source.itemType ?? "web_page",
        source.license ?? null,
        source.author ?? null,
        source.publishedAt ?? null,
        source.retrievedAt,
        source.summary,
        JSON.stringify({ curatedSourceKey: source.key }),
        source.allowedUse,
        source.tier,
        source.independenceGroup,
        source.archiveUrl ?? null,
        source.archiveLocator ?? null,
      ],
    });
  }
  const sourceId = (key: string) => {
    const value = sourceIds.get(key);
    if (!value) throw new Error(`Phase 105 source mapping missing: ${key}`);
    return value;
  };

  await tx.execute({
    sql: "INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES(?,?,?,'model_story',?,?,'published',?)",
    args: [
      packId(pack, "story", "published"),
      pack.entityId,
      pack.storyTitle,
      pack.summary,
      pack.bodyMd,
      pack.sourceMarker,
    ],
  });
  for (const source of pack.sources) {
    await tx.execute({
      sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')",
      args: [
        packId(pack, "reference", source.key),
        pack.entityId,
        sourceId(source.key),
        source.sourceType === "official" ? "official" : "reference",
        source.summary,
      ],
    });
  }
  for (const alias of pack.aliases) {
    const source = pack.sources.find((item) => item.key === alias.sourceKey);
    if (!source) throw new Error(`Phase 105 alias source missing: ${alias.sourceKey}`);
    await tx.execute({
      sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,market,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?, 'approved')",
      args: [
        packId(pack, "alias", `${alias.language}:${alias.alias}`),
        pack.entityId,
        alias.alias,
        alias.language,
        curatedId("source-registry", source.registryKey),
        alias.kind ?? "alias",
        alias.market ?? null,
        sourceId(alias.sourceKey),
      ],
    });
  }

  const variantIds = new Map<string, string>();
  for (const variant of pack.variants ?? []) {
    variantIds.set(variant.key, packId(pack, "variant", variant.key));
  }
  for (const variant of pack.variants ?? []) {
    await tx.execute({
      sql: `INSERT INTO model_variants(
              id,model_entity_id,variant_name,release_year,notes,source_item_id,
              review_status,variant_kind,parent_variant_id,product_code,market
            ) VALUES(?,?,?,?,?,?,'approved',?,?,?,?)`,
      args: [
        variantIds.get(variant.key) ?? null,
        pack.entityId,
        variant.name,
        variant.releaseYear ?? null,
        variant.notes,
        sourceId(variant.sourceKey),
        variant.variantKind ?? "variant",
        variant.parentVariantKey ? variantIds.get(variant.parentVariantKey) ?? null : null,
        variant.productCode ?? null,
        variant.market ?? null,
      ],
    });
  }

  const scopeIds = new Map<string, string>();
  for (const scope of pack.scopes) {
    const id = packId(pack, "scope", scope.key);
    scopeIds.set(scope.key, id);
    await tx.execute({
      sql: `INSERT INTO fact_scopes(
              id,entity_id,variant_id,scope_key,market,valid_from,valid_to,
              production_state,nib_scope,material_scope,edition_scope
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id,
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
    await tx.execute({
      sql: `INSERT INTO claims(
              id,subject_entity_id,predicate,object_text,source_item_id,
              evidence_locator,confidence,review_status,fact_class
            ) VALUES(?,?,?,?,?,?,?,'approved',?)`,
      args: [
        claimId,
        pack.entityId,
        claim.predicate,
        claim.objectText,
        sourceId(claim.sourceKey),
        claim.locator,
        claim.confidence,
        claim.factClass,
      ],
    });
    for (const evidence of claim.evidence) {
      const scopeId = scopeIds.get(evidence.scopeKey);
      if (!scopeId) throw new Error(`Phase 105 claim scope missing: ${evidence.scopeKey}`);
      const citationId = packId(pack, "claim-citation", evidence.key);
      await tx.execute({
        sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,claim_id,note,review_status,evidence_locator,scope_id) VALUES(?,'claim',?,?,?,?, 'approved',?,?)",
        args: [
          citationId,
          claimId,
          sourceId(evidence.sourceKey),
          claimId,
          evidence.note ?? null,
          evidence.locator,
          scopeId,
        ],
      });
      await tx.execute({
        sql: "INSERT INTO claim_evidence(id,claim_id,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,'approved')",
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

  if (!pack.spec) throw new Error("Phase 105 model spec missing.");
  const specId = packId(pack, "model-spec", "approved");
  const values = pack.spec.values;
  await tx.execute({
    sql: `INSERT INTO model_specs(
            id,entity_id,brand_entity_id,series_name,release_year,origin_country,
            nib,fill_system,material,dimensions,weight,price_range,status,review_status
          ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,'approved')`,
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
    if (!scopeId) throw new Error(`Phase 105 spec scope missing: ${evidence.scopeKey}`);
    const citationId = packId(pack, "spec-citation", evidence.key);
    await tx.execute({
      sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,note,review_status,evidence_locator,scope_id) VALUES(?,'model_spec',?,?,?,'approved',?,?)",
      args: [
        citationId,
        specId,
        sourceId(evidence.sourceKey),
        evidence.note ?? null,
        evidence.locator,
        scopeId,
      ],
    });
    await tx.execute({
      sql: "INSERT INTO spec_field_evidence(id,model_spec_id,field_key,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,?,?)",
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
  for (const event of pack.timeline ?? []) {
    await tx.execute({
      sql: "INSERT INTO timeline_events(id,entity_id,title,event_type,start_date,circa,description,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?,'approved')",
      args: [
        packId(pack, "timeline", event.key),
        pack.entityId,
        event.title,
        event.eventType,
        event.startDate,
        event.circa ? 1 : 0,
        event.description,
        sourceId(event.sourceKey),
      ],
    });
  }
  for (const media of pack.media) {
    await tx.execute({
      sql: `INSERT INTO media_assets(
              id,entity_id,title,asset_type,image_url,thumbnail_url,local_path,
              author,license,attribution_text,source_url,source_item_id,
              review_status,usage_status
            ) VALUES(?,?,?,'image',?,?,?,?,?,?,?,?, 'approved',?)`,
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
        sourceId(media.sourceKey),
        media.usageStatus,
      ],
    });
  }
}

export async function applyPhase105PilotCustomUrushiContent(
  client: Client,
  options: ApplyPhase105Options,
): Promise<ApplyPhase105Result> {
  const authority = await assertOwnedCatalog(client, options);
  const pack = validatePack(authority.workspaceRoot);
  await assertIdentityPreflight(client);
  const currentHash = await isExactTerminalState(client, pack);
  if (currentHash) {
    return {
      entities: [{ entityId: pack.entityId, outcome: "noop", contentHash: currentHash }],
    };
  }

  const transaction = await client.transaction("write");
  try {
    await installPack(transaction, pack);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: pack.entityId,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of checked-in sourced copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: pack.entityId,
    reviewer: options.reviewer,
  });
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: [
      {
        entityId: pack.entityId,
        outcome: "published",
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
  const databasePath = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalogPath = value("--protected-catalog");
  const reviewer = value("--reviewer") ?? "phase105-pilot-custom-urushi";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error(
      "Usage: tsx scripts/apply-phase105-pilot-custom-urushi-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(databasePath);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtected = path.resolve(protectedCatalogPath);
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase105PilotCustomUrushiContent(client, {
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
