import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import { getReclassifiedArticlePath } from "../src/lib/entity-redirects";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import type { ApplyPhase22Options, ApplyPhase22Result } from "./apply-phase22-content";
import {
  loadPhase116MontegrappaZeroPack,
  PHASE116_CATALOG_URL,
  PHASE116_CURRENT_SCOPE,
  PHASE116_CURRENT_URL,
  PHASE116_LAUNCH_SCOPE,
  PHASE116_LAUNCH_URL,
  PHASE116_MONTEGRAPPA_BRAND_ID,
  PHASE116_REVIEW_SCOPE,
  PHASE116_REVIEW_URL,
  PHASE116_ZERO_ID,
  PHASE116_ZERO_NAME,
  PHASE116_ZERO_SLUG,
  PHASE116_ZERO_SVG,
} from "./data/phase116-montegrappa-zero";
import {
  curatedId,
  packId,
  type CuratedSource,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export type ApplyPhase116Options = ApplyPhase22Options;
export type ApplyPhase116Result = ApplyPhase22Result;
export {
  PHASE116_MONTEGRAPPA_BRAND_ID,
  PHASE116_ZERO_ID,
  PHASE116_ZERO_SLUG,
};

const ALLOWED_REPO_INPUTS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  "/Users/xz/Documents/fountain-pen-graph",
]);
const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const BRAND_MARKER_PREFIX = "curated-content:phase87-montegrappa-brand-v3:";
const BASELINE = [
  [
    "phase85-pen-montegrappa-elmo-01",
    "montegrappa-elmo-01",
    "curated-content:phase85-montegrappa-elmo-01-v1:",
  ],
  [
    "phase86-pen-montegrappa-elmo-02",
    "montegrappa-elmo-02",
    "curated-content:phase86-elmo-02-v1:",
  ],
  [
    "phase86-pen-montegrappa-elmo-02-plus",
    "montegrappa-elmo-02-plus",
    "curated-content:phase86-elmo-02-plus-v1:",
  ],
  [
    "phase87-pen-montegrappa-extra-1930",
    "montegrappa-extra-1930",
    "curated-content:phase87-extra-1930-v1:",
  ],
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
      throw new Error(`Phase 116 refuses inherited remote database selection: ${key}.`);
    }
  }
}

function assertVerifiedRepoPair(input: string): string {
  if (!ALLOWED_REPO_INPUTS.has(input)) {
    throw new Error("Phase 116 requires the verified CodeBuddy/Documents repo pair.");
  }
  const real = fs.realpathSync.native(input);
  let gitRoot: string;
  try {
    gitRoot = fs.realpathSync.native(
      execFileSync("git", ["-C", input, "rev-parse", "--show-toplevel"], {
        encoding: "utf8",
      }).trim(),
    );
  } catch {
    throw new Error("Phase 116 could not resolve the verified CodeBuddy/Documents repo pair.");
  }
  if (real !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO) {
    throw new Error(
      "Phase 116 verified CodeBuddy/Documents repo pair must resolve to one canonical git root.",
    );
  }
  return real;
}

async function assertAuthority(
  client: Client,
  options: ApplyPhase116Options,
): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 116 reviewer must not be empty.");
  const workspaceRoot = assertVerifiedRepoPair(options.workspaceRoot);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 116 caller-owned database must not be a symlink.");
  }
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error("Phase 116 requires a regular database inside the caller-owned root.");
  }
  const protectedNames = new Set([
    protectedPath,
    `${protectedPath}-wal`,
    `${protectedPath}-shm`,
  ]);
  if (protectedNames.has(databasePath)) {
    throw new Error("Phase 116 refuses the protected catalog or sidecar path.");
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino) {
    throw new Error("Phase 116 refuses a hard-link alias of the protected catalog.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 116 client/path mismatch for caller-owned database.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 116 owned copy must be migrated through 032.");
  }
  return workspaceRoot;
}

async function jsonRows(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({
    ...row,
  }));
}

async function payloadDigest(
  client: Client,
  entityId: string,
  includeTopology: boolean,
): Promise<string> {
  const queries = [
    "SELECT * FROM entities WHERE id=?",
    "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
    "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
    "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    ...(includeTopology
      ? [
          "SELECT * FROM entity_publications WHERE entity_id=? ORDER BY entity_id",
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
        ]
      : []),
  ];
  const payload = [];
  for (const sql of queries) {
    payload.push(
      await jsonRows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  }
  return JSON.stringify(payload);
}

function sourceReliability(source: CuratedSource): string {
  if (source.sourceType === "official") return "official_marketing";
  if (source.tier === "professional_secondary") return "high_for_model_history";
  return "medium";
}

function sourceItemId(sourceKey: string): string {
  return curatedId("source-item", sourceKey);
}

async function upsertPhase116Sources(
  transaction: Transaction,
  pack: LoadedCuratedEntityPack,
): Promise<void> {
  for (const source of pack.sources) {
    await transaction.execute({
      sql: `INSERT INTO source_registry(
              id,name,source_type,allowed_use,reliability,license,attribution,
              homepage_url,fetch_method,notes,last_checked_at,
              default_source_tier,default_independence_group
            ) VALUES(?,?,?,?,?,?,?,?,'manual',?,?,?,?)
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
        curatedId("source-registry", source.registryKey),
        source.registryName,
        source.sourceType,
        source.allowedUse,
        sourceReliability(source),
        source.license ?? null,
        source.author ?? null,
        source.homepageUrl,
        `Phase 116 curated source registry: ${source.registryKey}`,
        source.retrievedAt,
        source.tier,
        source.independenceGroup,
      ],
    });
    await transaction.execute({
      sql: `INSERT INTO source_items(
              id,source_id,title,url,item_type,license,author,published_at,
              retrieved_at,summary,raw_metadata_json,allowed_use,review_status,
              source_tier,independence_group,archive_url,archive_locator
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,'approved',?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET
              source_id=excluded.source_id,title=excluded.title,url=excluded.url,
              item_type=excluded.item_type,license=excluded.license,
              author=excluded.author,published_at=excluded.published_at,
              retrieved_at=excluded.retrieved_at,summary=excluded.summary,
              raw_metadata_json=excluded.raw_metadata_json,
              allowed_use=excluded.allowed_use,review_status=excluded.review_status,
              source_tier=excluded.source_tier,
              independence_group=excluded.independence_group,
              archive_url=excluded.archive_url,archive_locator=excluded.archive_locator,
              updated_at=datetime('now')`,
      args: [
        sourceItemId(source.key),
        curatedId("source-registry", source.registryKey),
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
}

async function installPhase116Pack(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await upsertPhase116Sources(transaction, pack);
    const updated = await transaction.execute({
      sql: `UPDATE entities SET name=?,summary=?,body_md=?,source=?,updated_at=datetime('now')
            WHERE id=? AND type='pen' AND slug=?`,
      args: [
        pack.canonicalName,
        pack.summary,
        pack.bodyMd,
        pack.sourceMarker,
        pack.entityId,
        pack.expectedSlug,
      ],
    });
    if (updated.rowsAffected !== 1) {
      throw new Error("Phase 116 target identity changed before payload install.");
    }
    const publication = await transaction.execute({
      sql: "UPDATE entity_publications SET depth_tier=?,updated_at=datetime('now') WHERE entity_id=?",
      args: [pack.depthTier, pack.entityId],
    });
    if (publication.rowsAffected !== 1) {
      throw new Error("Phase 116 target publication row is missing.");
    }
    await transaction.execute({
      sql: `INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes)
            VALUES(?,?,?,'model_story',?,?,'published',?)`,
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
      const relationType =
        source.sourceType === "official"
          ? "official"
          : source.tier === "professional_secondary"
            ? "review"
            : "reference";
      await transaction.execute({
        sql: `INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status)
              VALUES(?,?,?,?,?,'approved')`,
        args: [
          packId(pack, "reference", source.key),
          pack.entityId,
          sourceItemId(source.key),
          relationType,
          source.summary,
        ],
      });
    }
    for (const alias of pack.aliases) {
      const source = pack.sources.find((item) => item.key === alias.sourceKey);
      if (!source) throw new Error(`Phase 116 alias source missing: ${alias.sourceKey}`);
      await transaction.execute({
        sql: `INSERT INTO entity_aliases(
                id,entity_id,alias,language,source_id,alias_kind,market,
                source_item_id,review_status
              ) VALUES(?,?,?,?,?,?,?,?,'approved')`,
        args: [
          packId(pack, "alias", `${alias.language}:${alias.alias}`),
          pack.entityId,
          alias.alias,
          alias.language,
          curatedId("source-registry", source.registryKey),
          alias.kind ?? "alias",
          alias.market ?? null,
          sourceItemId(alias.sourceKey),
        ],
      });
    }
    for (const variant of pack.variants ?? []) {
      await transaction.execute({
        sql: `INSERT INTO model_variants(
                id,model_entity_id,variant_name,release_year,notes,source_item_id,
                review_status,variant_kind,parent_variant_id,product_code,market
              ) VALUES(?,?,?,?,?,?,'approved',?,?,?,?)`,
        args: [
          packId(pack, "variant", variant.key),
          pack.entityId,
          variant.name,
          variant.releaseYear ?? null,
          variant.notes,
          sourceItemId(variant.sourceKey),
          variant.variantKind ?? "variant",
          null,
          variant.productCode ?? null,
          variant.market ?? null,
        ],
      });
    }

    const scopeIds = new Map<string, string>();
    for (const scope of pack.scopes) {
      const scopeId = packId(pack, "scope", scope.key);
      scopeIds.set(scope.scopeKey, scopeId);
      await transaction.execute({
        sql: `INSERT INTO fact_scopes(
                id,entity_id,variant_id,scope_key,market,valid_from,valid_to,
                production_state,nib_scope,material_scope,edition_scope
              ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          scopeId,
          pack.entityId,
          null,
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
        sql: `INSERT INTO claims(
                id,subject_entity_id,predicate,object_text,source_item_id,
                evidence_locator,confidence,review_status,fact_class
              ) VALUES(?,?,?,?,?,?,?,'approved',?)`,
        args: [
          claimId,
          pack.entityId,
          claim.predicate,
          claim.objectText,
          sourceItemId(claim.sourceKey),
          claim.locator,
          claim.confidence,
          claim.factClass,
        ],
      });
      for (const item of claim.evidence) {
        const scopeId = scopeIds.get(item.scopeKey);
        if (!scopeId) throw new Error(`Phase 116 claim scope missing: ${item.scopeKey}`);
        const citationId = packId(pack, "claim-citation", item.key);
        await transaction.execute({
          sql: `INSERT INTO citations(
                  id,target_type,target_id,source_item_id,claim_id,note,
                  review_status,evidence_locator,scope_id
                ) VALUES(?,'claim',?,?,?,?,'approved',?,?)`,
          args: [
            citationId,
            claimId,
            sourceItemId(item.sourceKey),
            claimId,
            item.note ?? null,
            item.locator,
            scopeId,
          ],
        });
        await transaction.execute({
          sql: `INSERT INTO claim_evidence(
                  id,claim_id,citation_id,scope_id,evidence_locator,review_status
                ) VALUES(?,?,?,?,?,'approved')`,
          args: [
            packId(pack, "claim-evidence", item.key),
            claimId,
            citationId,
            scopeId,
            item.locator,
          ],
        });
      }
    }

    if (!pack.spec) throw new Error("Phase 116 target pack requires model specs.");
    const specId = packId(pack, "model-spec", "approved");
    const values = pack.spec.values;
    await transaction.execute({
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
    const specCitationIds = new Map<string, string>();
    for (const item of pack.spec.evidence) {
      const scopeId = scopeIds.get(item.scopeKey);
      if (!scopeId) throw new Error(`Phase 116 spec scope missing: ${item.scopeKey}`);
      const citationId = packId(pack, "spec-citation", item.key);
      specCitationIds.set(item.key, citationId);
      await transaction.execute({
        sql: `INSERT INTO citations(
                id,target_type,target_id,source_item_id,note,review_status,
                evidence_locator,scope_id
              ) VALUES(?,'model_spec',?,?,?,'approved',?,?)`,
        args: [
          citationId,
          specId,
          sourceItemId(item.sourceKey),
          item.note ?? null,
          item.locator,
          scopeId,
        ],
      });
      await transaction.execute({
        sql: `INSERT INTO spec_field_evidence(
                id,model_spec_id,field_key,citation_id,scope_id,
                evidence_locator,review_status
              ) VALUES(?,?,?,?,?,?,?)`,
        args: [
          packId(pack, "spec-evidence", item.key),
          specId,
          item.fieldKey,
          citationId,
          scopeId,
          item.locator,
          item.qualifies === false ? "rejected" : "approved",
        ],
      });
    }
    for (const conflict of pack.conflicts ?? []) {
      const conflictId = packId(pack, "conflict", conflict.key);
      await transaction.execute({
        sql: `INSERT INTO fact_conflicts(
                id,entity_id,field_key,scope_id,conflict_kind,status,resolution_note
              ) VALUES(?,?,?,?,?,?,?)`,
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
        if (!citationId) {
          throw new Error(`Phase 116 conflict citation missing: ${member.citationKey}`);
        }
        await transaction.execute({
          sql: `INSERT INTO fact_conflict_members(id,conflict_id,citation_id,asserted_value)
                VALUES(?,?,?,?)`,
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
        sql: `INSERT INTO timeline_events(
                id,entity_id,title,event_type,start_date,circa,description,
                source_item_id,review_status
              ) VALUES(?,?,?,?,?,?,?,?,'approved')`,
        args: [
          packId(pack, "timeline", event.key),
          pack.entityId,
          event.title,
          event.eventType,
          event.startDate,
          event.circa ? 1 : 0,
          event.description,
          sourceItemId(event.sourceKey),
        ],
      });
    }
    for (const media of pack.media) {
      await transaction.execute({
        sql: `INSERT INTO media_assets(
                id,entity_id,title,asset_type,image_url,thumbnail_url,local_path,
                author,license,attribution_text,source_url,source_item_id,
                review_status,usage_status
              ) VALUES(?,?,?,'image',?,?,?,?,?,?,?,?,'approved',?)`,
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
          sourceItemId(media.sourceKey),
          media.usageStatus,
        ],
      });
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function reviewAndPublishTarget(
  client: Client,
  pack: LoadedCuratedEntityPack,
  reviewer: string,
): Promise<string> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: pack.entityId,
      reviewKind,
      reviewer,
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of checked-in sourced copy.`,
    });
  }
  return (await publishEntity(client, { entityId: pack.entityId, reviewer })).contentHash;
}

async function assertBaseline(client: Client): Promise<void> {
  const ids = [PHASE116_MONTEGRAPPA_BRAND_ID, ...BASELINE.map(([id]) => id)];
  const result = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.source,publication.status,
                 CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id IN (?,?,?,?,?)`,
    args: ids,
  });
  const byId = new Map(result.rows.map((row) => [String(row.id), row]));
  const brand = byId.get(PHASE116_MONTEGRAPPA_BRAND_ID);
  if (
    !brand ||
    brand.type !== "brand" ||
    brand.slug !== "montegrappa" ||
    brand.status !== "published" ||
    Number(brand.is_public) !== 1 ||
    !String(brand.source).startsWith(BRAND_MARKER_PREFIX)
  ) {
    throw new Error("Phase 116 requires the exact Phase 87 terminal baseline for Montegrappa.");
  }
  for (const [id, slug, marker] of BASELINE) {
    const row = byId.get(id);
    if (
      !row ||
      row.type !== "pen" ||
      row.slug !== slug ||
      row.status !== "published" ||
      Number(row.is_public) !== 1 ||
      !String(row.source).startsWith(marker)
    ) {
      throw new Error(`Phase 116 requires the exact Phase 87 terminal baseline for ${id}.`);
    }
  }
}

async function inspectTarget(
  client: Client,
  sourceMarker: string,
): Promise<"absent" | "terminal"> {
  if (getReclassifiedArticlePath("pen", PHASE116_ZERO_SLUG) !== null) {
    throw new Error("Phase 116 static route collision for Montegrappa Zero.");
  }
  const routeOwners = await client.execute({
    sql: "SELECT source_path,target_path FROM entity_redirects WHERE source_path IN (?,?) OR target_path=?",
    args: [
      `/pen/${PHASE116_ZERO_SLUG}`,
      `/article/${PHASE116_ZERO_SLUG}`,
      `/pen/${PHASE116_ZERO_SLUG}`,
    ],
  });
  if (routeOwners.rows.length) {
    throw new Error(`Phase 116 database route collision: ${JSON.stringify(routeOwners.rows)}`);
  }
  const collisions = await client.execute({
    sql: `SELECT DISTINCT entity.id,entity.type,entity.slug,entity.name,entity.source
          FROM entities entity
          LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
          WHERE entity.id=? OR entity.slug=?
             OR lower(entity.name) IN (lower('Montegrappa Zero'),lower('Zero'))
             OR lower(COALESCE(alias.alias,'')) IN (
               lower('Montegrappa Zero'),lower('Montegrappa Zero Fountain Pen'),
               lower('蒙特格拉帕 Zero'),lower('Zero')
             )
             OR entity.source_url IN (?,?,?,?)
             OR entity.source LIKE 'curated-content:phase116-montegrappa-zero-v1:%'
          ORDER BY entity.id`,
    args: [
      PHASE116_ZERO_ID,
      PHASE116_ZERO_SLUG,
      PHASE116_CURRENT_URL,
      PHASE116_CATALOG_URL,
      PHASE116_LAUNCH_URL,
      PHASE116_REVIEW_URL,
    ],
  });
  const sourceOwners = await client.execute({
    sql: `SELECT DISTINCT reference.entity_id,item.url
          FROM entity_references reference
          JOIN source_items item ON item.id=reference.source_item_id
          WHERE item.url IN (?,?,?,?) AND reference.entity_id<>?
          ORDER BY item.url,reference.entity_id`,
    args: [
      PHASE116_CURRENT_URL,
      PHASE116_CATALOG_URL,
      PHASE116_LAUNCH_URL,
      PHASE116_REVIEW_URL,
      PHASE116_ZERO_ID,
    ],
  });
  const catalogAllowlist = new Set([
    PHASE116_MONTEGRAPPA_BRAND_ID,
    ...BASELINE.map(([id]) => id),
  ]);
  const unexpectedOwners = sourceOwners.rows.filter(
    (owner) =>
      owner.url !== PHASE116_CATALOG_URL ||
      !catalogAllowlist.has(String(owner.entity_id)),
  );
  if (unexpectedOwners.length) {
    throw new Error(
      `Phase 116 found an alternate official/reference source owner: ${JSON.stringify(unexpectedOwners)}`,
    );
  }
  if (collisions.rows.length === 0) return "absent";
  const alternate = collisions.rows.filter((row) => row.id !== PHASE116_ZERO_ID);
  if (alternate.length || collisions.rows.length !== 1) {
    throw new Error(
      `Phase 116 found an alternate Zero identity/source owner: ${JSON.stringify(collisions.rows)}`,
    );
  }
  const row = collisions.rows[0];
  if (
    row?.type !== "pen" ||
    row.slug !== PHASE116_ZERO_SLUG ||
    row.name !== PHASE116_ZERO_NAME ||
    row.source !== sourceMarker
  ) {
    throw new Error(
      "Phase 116 locked target exists without its exact identity/source marker; repair is forbidden.",
    );
  }
  return "terminal";
}

async function reviewAndPublishBrand(
  client: Client,
  reviewer: string,
): Promise<string> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE116_MONTEGRAPPA_BRAND_ID,
      reviewKind,
      reviewer,
      status: "approved",
      notes:
        "Phase 116 exact post-topology current hash; Phase 85/86/87 brand packs were not replayed.",
    });
  }
  return (
    await publishEntity(client, {
      entityId: PHASE116_MONTEGRAPPA_BRAND_ID,
      reviewer,
    })
  ).contentHash;
}

async function assertTerminal(client: Client, sourceMarker: string): Promise<string> {
  const row = (
    await client.execute({
      sql: `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,
                   entity.summary,entity.body_md,publication.status,
                   publication.approved_content_hash,
                   CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
            FROM entities entity
            LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
            LEFT JOIN public_entities public ON public.id=entity.id
            WHERE entity.id=?`,
      args: [PHASE116_ZERO_ID],
    })
  ).rows[0];
  const contentHash = await computePublicationContentHash(client, PHASE116_ZERO_ID);
  if (
    !row ||
    row.type !== "pen" ||
    row.slug !== PHASE116_ZERO_SLUG ||
    row.name !== PHASE116_ZERO_NAME ||
    row.source !== sourceMarker ||
    row.status !== "published" ||
    row.approved_content_hash !== contentHash ||
    Number(row.is_public) !== 1 ||
    Array.from(String(row.summary)).length < 60 ||
    Array.from(String(row.summary)).length > 160 ||
    Array.from(String(row.body_md)).length < 2_000
  ) {
    throw new Error("Phase 116 terminal content/publication is invalid; automatic repair is forbidden.");
  }

  const links = await client.execute({
    sql: `SELECT source_id,target_id,link_type FROM entity_links
          WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse')
          ORDER BY link_type`,
    args: [PHASE116_ZERO_ID, PHASE116_ZERO_ID],
  });
  if (
    links.rows.length !== 2 ||
    links.rows[0]?.source_id !== PHASE116_ZERO_ID ||
    links.rows[0]?.target_id !== PHASE116_MONTEGRAPPA_BRAND_ID ||
    links.rows[0]?.link_type !== "made_by" ||
    links.rows[1]?.source_id !== PHASE116_MONTEGRAPPA_BRAND_ID ||
    links.rows[1]?.target_id !== PHASE116_ZERO_ID ||
    links.rows[1]?.link_type !== "reverse"
  ) {
    throw new Error("Phase 116 terminal maker topology is invalid; automatic repair is forbidden.");
  }

  const counts = (
    await client.execute({
      sql: `SELECT
        (SELECT count(*) FROM fact_scopes WHERE entity_id=? AND scope_key IN (?,?,?)) AS scopes,
        (SELECT count(*) FROM fact_conflicts WHERE entity_id=? AND field_key='material') AS conflicts,
        (SELECT count(*) FROM fact_conflict_members member JOIN fact_conflicts conflict ON conflict.id=member.conflict_id WHERE conflict.entity_id=?) AS conflict_members,
        (SELECT count(*) FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='rejected') AS rejected,
        (SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved' AND local_path=?) AS media,
        (SELECT count(*) FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')) AS reviews`,
      args: [
        PHASE116_ZERO_ID,
        PHASE116_CURRENT_SCOPE,
        PHASE116_LAUNCH_SCOPE,
        PHASE116_REVIEW_SCOPE,
        PHASE116_ZERO_ID,
        PHASE116_ZERO_ID,
        PHASE116_ZERO_ID,
        PHASE116_ZERO_ID,
        PHASE116_ZERO_SVG,
        PHASE116_ZERO_ID,
        contentHash,
      ],
    })
  ).rows[0];
  if (
    Number(counts?.scopes) !== 3 ||
    Number(counts?.conflicts) !== 1 ||
    Number(counts?.conflict_members) !== 2 ||
    Number(counts?.rejected) < 6 ||
    Number(counts?.media) !== 1 ||
    Number(counts?.reviews) !== 4
  ) {
    throw new Error(
      "Phase 116 terminal scope/conflict/media/review state is invalid; automatic repair is forbidden.",
    );
  }

  const brandHash = await computePublicationContentHash(
    client,
    PHASE116_MONTEGRAPPA_BRAND_ID,
  );
  const brand = (
    await client.execute({
      sql: "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      args: [PHASE116_MONTEGRAPPA_BRAND_ID],
    })
  ).rows[0];
  if (brand?.status !== "published" || brand.approved_content_hash !== brandHash) {
    throw new Error(
      "Phase 116 Montegrappa post-topology publication is invalid; automatic repair is forbidden.",
    );
  }
  return contentHash;
}

export async function applyPhase116MontegrappaZeroContent(
  client: Client,
  options: ApplyPhase116Options,
): Promise<ApplyPhase116Result> {
  const workspaceRoot = await assertAuthority(client, options);
  const pack = loadPhase116MontegrappaZeroPack(workspaceRoot);
  await assertBaseline(client);
  const state = await inspectTarget(client, pack.sourceMarker);
  if (state === "terminal") {
    const contentHash = await assertTerminal(client, pack.sourceMarker);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      entities: [{ entityId: PHASE116_ZERO_ID, outcome: "noop", contentHash }],
    };
  }

  const protectedBefore = new Map<string, string>();
  for (const [id] of BASELINE) {
    protectedBefore.set(id, await payloadDigest(client, id, true));
  }
  const brandPayloadBefore = await payloadDigest(
    client,
    PHASE116_MONTEGRAPPA_BRAND_ID,
    false,
  );
  const brandHashBefore = await computePublicationContentHash(
    client,
    PHASE116_MONTEGRAPPA_BRAND_ID,
  );
  const reverseBefore = await jsonRows(
    client,
    "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
    [PHASE116_MONTEGRAPPA_BRAND_ID],
  );

  const transaction = await client.transaction("write");
  try {
    await transaction.execute({
      sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
      args: [PHASE116_ZERO_ID, PHASE116_ZERO_SLUG, PHASE116_ZERO_NAME],
    });
    await transaction.execute({
      sql: `INSERT INTO entity_links(id,source_id,target_id,link_type,reason)
            VALUES(?,?,?,'made_by',?)`,
      args: [
        stableId(
          "phase116-made-by",
          `${PHASE116_ZERO_ID}:${PHASE116_MONTEGRAPPA_BRAND_ID}`,
        ),
        PHASE116_ZERO_ID,
        PHASE116_MONTEGRAPPA_BRAND_ID,
        "Phase 116 exact standard Zero maker relation",
      ],
    });
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason)
            VALUES(?,?,?,'reverse',?)`,
      args: [
        stableId(
          "phase116-reverse",
          `${PHASE116_MONTEGRAPPA_BRAND_ID}:${PHASE116_ZERO_ID}`,
        ),
        PHASE116_MONTEGRAPPA_BRAND_ID,
        PHASE116_ZERO_ID,
        "Phase 116 Montegrappa-to-Zero public navigation",
      ],
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  if (
    (await payloadDigest(client, PHASE116_MONTEGRAPPA_BRAND_ID, false)) !==
    brandPayloadBefore
  ) {
    throw new Error("Phase 116 changed Montegrappa non-topology payload.");
  }
  const reverseAfter = await jsonRows(
    client,
    "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
    [PHASE116_MONTEGRAPPA_BRAND_ID],
  );
  const expectedReverse = reverseBefore
    .concat([
      {
        source_id: PHASE116_MONTEGRAPPA_BRAND_ID,
        target_id: PHASE116_ZERO_ID,
        link_type: "reverse",
      },
    ])
    .sort((left, right) => String(left.target_id).localeCompare(String(right.target_id)));
  if (JSON.stringify(reverseAfter) !== JSON.stringify(expectedReverse)) {
    throw new Error("Phase 116 Montegrappa topology delta is not exactly one reverse link.");
  }
  const brandHashAfter = await computePublicationContentHash(
    client,
    PHASE116_MONTEGRAPPA_BRAND_ID,
  );
  if (brandHashAfter === brandHashBefore) {
    throw new Error("Phase 116 expected the Montegrappa topology hash to change.");
  }
  const reviewedBrandHash = await reviewAndPublishBrand(
    client,
    options.reviewer.trim(),
  );
  if (reviewedBrandHash !== brandHashAfter) {
    throw new Error("Phase 116 brand review did not bind the exact post-topology hash.");
  }

  await installPhase116Pack(client, pack);
  const targetHash = await reviewAndPublishTarget(
    client,
    pack,
    options.reviewer.trim(),
  );
  const result: ApplyPhase116Result = {
    entities: [
      { entityId: PHASE116_ZERO_ID, outcome: "published", contentHash: targetHash },
    ],
  };
  await assertTerminal(client, pack.sourceMarker);
  for (const [id] of BASELINE) {
    if ((await payloadDigest(client, id, true)) !== protectedBefore.get(id)) {
      throw new Error(`Phase 116 changed protected entity ${id}.`);
    }
  }
  if (
    (await payloadDigest(client, PHASE116_MONTEGRAPPA_BRAND_ID, false)) !==
    brandPayloadBefore
  ) {
    throw new Error("Phase 116 replayed or changed Montegrappa non-topology payload.");
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
  const reviewer = value("--reviewer") ?? "phase116-montegrappa-zero";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error(
      "Usage: tsx scripts/apply-phase116-montegrappa-zero-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    process.stdout.write(
      `${JSON.stringify(
        await applyPhase116MontegrappaZeroContent(client, {
          workspaceRoot: process.cwd(),
          reviewer,
          databasePath: path.resolve(databasePath),
          ownedRoot: path.resolve(ownedRoot),
          protectedCatalogPath: path.resolve(protectedCatalogPath),
          protectedCatalogSnapshot: snapshotCatalogFiles(
            path.resolve(protectedCatalogPath),
          ),
          env: process.env,
        }),
        null,
        2,
      )}\n`,
    );
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
