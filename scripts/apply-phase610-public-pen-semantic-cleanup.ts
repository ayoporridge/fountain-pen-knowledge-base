import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient } from "@libsql/client";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  applyPhase610TextReplacements,
  phase610SemanticCleanupPatches,
  sha256Text,
} from "./phase610/semantic-cleanup-patches";
import { phase610TerminalBodySha256ByEntityId } from "./phase610/semantic-cleanup-terminal-hashes";
import type { Phase610SemanticPatch } from "./phase610/semantic-cleanup-types";

export const PHASE610_REVIEWER = "phase610-public-pen-semantic-cleanup";

export interface ApplyPhase610Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogs: readonly {
    path: string;
    snapshot: CatalogSnapshot;
  }[];
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase610Result {
  entities: Array<{
    entityId: string;
    slug: string;
    outcome: "published" | "noop";
    contentHash: string;
  }>;
}

interface LoadedTarget {
  patch: Phase610SemanticPatch;
  currentName: string;
  currentBody: string;
  nextName: string;
  nextBody: string;
  storyId: string;
  currentStoryTitle: string;
  nextStoryTitle: string;
}

interface CatalogBaseline {
  publicPens: number;
  publishedPens: number;
  nonTargetPayloadDigest: string;
  targetAuxiliaryPayloadDigest: string;
}

const REMOTE_KEYS = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "FPKG_DATABASE_URL",
] as const;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of REMOTE_KEYS) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 610 refuses inherited remote selector ${key}.`);
    }
  }
}

function assertNoSidecars(databasePath: string): void {
  for (const suffix of ["-wal", "-shm"] as const) {
    const companion = `${databasePath}${suffix}`;
    if (fs.existsSync(companion) && fs.statSync(companion).size > 0) {
      throw new Error(`Phase 610 refuses non-empty SQLite companion ${companion}.`);
    }
  }
}

async function assertOwnedAuthority(
  client: Client,
  options: ApplyPhase610Options,
): Promise<string> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 610 reviewer is required.");
  if (options.protectedCatalogs.length < 2) {
    throw new Error("Phase 610 requires source and real protected catalog families.");
  }
  for (const protectedCatalog of options.protectedCatalogs) {
    assertCatalogSnapshotUnchanged(protectedCatalog.snapshot);
  }
  assertNoSidecars(options.databasePath);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const databaseLstat = fs.lstatSync(options.databasePath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    databaseLstat.isSymbolicLink() ||
    !inside(databasePath, ownedRoot)
  ) {
    throw new Error("Phase 610 requires a non-symlink catalog inside caller-owned root.");
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  if (owned.nlink !== BigInt(1)) {
    throw new Error("Phase 610 refuses catalog files with multiple hard links.");
  }
  for (const protectedCatalog of options.protectedCatalogs) {
    const protectedPath = fs.realpathSync.native(protectedCatalog.path);
    const protectedStat = fs.statSync(protectedPath, { bigint: true });
    if (
      databasePath === protectedPath ||
      (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
    ) {
      throw new Error("Phase 610 refuses protected catalogs and hard-link aliases.");
    }
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 610 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 610 owned copy must be migrated through 032.");
  }
  return workspaceRoot;
}

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
    .join(",")}}`;
}

const AUXILIARY_PAYLOAD_QUERIES = [
  {
    key: "modelSpecs",
    sql: `SELECT id,entity_id,brand_entity_id,series_name,release_year,
                 origin_country,nib,fill_system,material,dimensions,weight,
                 price_range,status,review_status
          FROM model_specs WHERE entity_id IN (__IDS__)`,
  },
  {
    key: "modelVariants",
    sql: `SELECT id,model_entity_id,variant_name,release_year,notes,
                 source_item_id,review_status,variant_kind,parent_variant_id,
                 product_code,market
          FROM model_variants WHERE model_entity_id IN (__IDS__)`,
  },
  {
    key: "claims",
    sql: `SELECT DISTINCT owner.entity_id payload_entity_id,claim.id,
                 claim.subject_entity_id,claim.subject_text,claim.predicate,
                 claim.object_entity_id,claim.object_text,claim.source_item_id,
                 claim.evidence_locator,claim.confidence,claim.review_status,
                 claim.fact_class
          FROM claims claim
          JOIN publication_payload_claim_entities owner ON owner.claim_id=claim.id
          WHERE owner.entity_id IN (__IDS__)`,
  },
  {
    key: "citations",
    sql: `SELECT DISTINCT owner.entity_id payload_entity_id,citation.id,
                 citation.target_type,citation.target_id,citation.source_item_id,
                 citation.claim_id,citation.note,citation.review_status,
                 citation.evidence_locator,citation.scope_id
          FROM citations citation
          JOIN publication_invalidation_citation_entities owner
            ON owner.citation_id=citation.id
          WHERE owner.entity_id IN (__IDS__)`,
  },
  {
    key: "factScopes",
    sql: `SELECT id,entity_id,variant_id,scope_key,market,valid_from,valid_to,
                 production_state,nib_scope,material_scope,edition_scope
          FROM fact_scopes WHERE entity_id IN (__IDS__)`,
  },
  {
    key: "specFieldEvidence",
    sql: `SELECT spec.entity_id payload_entity_id,evidence.id,
                 evidence.model_spec_id,evidence.field_key,evidence.citation_id,
                 evidence.scope_id,evidence.evidence_locator,evidence.review_status
          FROM spec_field_evidence evidence
          JOIN model_specs spec ON spec.id=evidence.model_spec_id
          WHERE spec.entity_id IN (__IDS__)`,
  },
  {
    key: "claimEvidence",
    sql: `SELECT DISTINCT owner.entity_id payload_entity_id,evidence.id,
                 evidence.claim_id,evidence.citation_id,evidence.scope_id,
                 evidence.evidence_locator,evidence.review_status
          FROM claim_evidence evidence
          JOIN publication_payload_claim_entities owner
            ON owner.claim_id=evidence.claim_id
          WHERE owner.entity_id IN (__IDS__)`,
  },
  {
    key: "factConflicts",
    sql: `SELECT id,entity_id,field_key,scope_id,conflict_kind,status,
                 resolution_note
          FROM fact_conflicts WHERE entity_id IN (__IDS__)`,
  },
  {
    key: "factConflictMembers",
    sql: `SELECT conflict.entity_id payload_entity_id,member.id,
                 member.conflict_id,member.citation_id,member.asserted_value
          FROM fact_conflict_members member
          JOIN fact_conflicts conflict ON conflict.id=member.conflict_id
          WHERE conflict.entity_id IN (__IDS__)`,
  },
  {
    key: "entityReferences",
    sql: `SELECT id,entity_id,source_item_id,relation_type,note,review_status
          FROM entity_references WHERE entity_id IN (__IDS__)`,
  },
  {
    key: "timelineEvents",
    sql: `SELECT id,entity_id,title,event_type,start_date,end_date,circa,
                 description,source_item_id,review_status
          FROM timeline_events
          WHERE entity_id IN (__IDS__) AND review_status='approved'`,
  },
  {
    key: "primaryMedia",
    sql: `SELECT media.id,media.entity_id,media.title,media.asset_type,
                 media.image_url,media.thumbnail_url,media.local_path,
                 media.author,media.license,media.attribution_text,
                 media.source_url,media.source_item_id,media.review_status,
                 media.usage_status
          FROM media_assets media
          JOIN publication_v2_qualified_primary_media reusable
            ON reusable.media_id=media.id
          WHERE media.entity_id IN (__IDS__)`,
  },
  {
    key: "aliases",
    sql: `SELECT id,entity_id,alias,language,alias_kind,market,valid_from,
                 valid_to,source_item_id,review_status
          FROM entity_aliases
          WHERE entity_id IN (__IDS__) AND review_status='approved'`,
  },
  {
    key: "canonicalTags",
    sql: `SELECT entity_id,tag_id FROM entity_tags
          WHERE entity_id IN (__IDS__)`,
  },
  {
    key: "taxonomyLinks",
    sql: `SELECT id,source_id,target_id,link_type,reason
          FROM entity_links
          WHERE (source_id IN (__IDS__) OR target_id IN (__IDS_2__))
            AND link_type IN ('made_by','member_of_series',
                              'marketed_under_licensed_brand')`,
    duplicateIds: true,
  },
  {
    key: "sourceItems",
    sql: `SELECT DISTINCT owner.entity_id payload_entity_id,item.id,item.source_id,
                 item.title,item.url,item.item_type,item.license,item.author,
                 item.published_at,item.retrieved_at,item.summary,
                 item.raw_metadata_json,item.allowed_use,item.review_status,
                 item.source_tier,item.independence_group,item.archive_url,
                 item.archive_locator
          FROM source_items item
          JOIN publication_source_item_entities owner ON owner.source_item_id=item.id
          WHERE owner.entity_id IN (__IDS__)`,
  },
  {
    key: "sourceRegistries",
    sql: `SELECT DISTINCT owner.entity_id payload_entity_id,registry.id,
                 registry.name,registry.source_type,registry.allowed_use,
                 registry.reliability,registry.license,registry.attribution,
                 registry.homepage_url,registry.fetch_method,registry.notes,
                 registry.last_checked_at,registry.default_source_tier,
                 registry.default_independence_group
          FROM source_registry registry
          JOIN source_items item ON item.source_id=registry.id
          JOIN publication_source_item_entities owner ON owner.source_item_id=item.id
          WHERE owner.entity_id IN (__IDS__)`,
  },
] as const;

const FULL_PAYLOAD_QUERIES = [
  {
    key: "entities",
    sql: `SELECT id,type,slug,name,summary,body_md,source,source_url,
                 source_file,imported_at
          FROM entities WHERE id IN (__IDS__)`,
  },
  {
    key: "stories",
    sql: `SELECT id,entity_id,title,story_type,summary,body_md,status,source_notes
          FROM stories
          WHERE entity_id IN (__IDS__) AND story_type='model_story'
            AND status='published'`,
  },
  ...AUXILIARY_PAYLOAD_QUERIES,
] as const;

async function snapshotPublicationPayloadRows(
  client: Client,
  ids: readonly string[],
  mode: "full" | "auxiliary",
): Promise<string> {
  if (ids.length === 0) throw new Error("Phase 610 payload scope is empty.");
  const placeholders = ids.map(() => "?").join(",");
  const snapshot: Record<string, string[]> = {};
  const queries =
    mode === "full" ? FULL_PAYLOAD_QUERIES : AUXILIARY_PAYLOAD_QUERIES;
  for (const query of queries) {
    const startedAt = process.env.PHASE610_PROFILE_PAYLOADS
      ? performance.now()
      : 0;
    const result = await client.execute({
      sql: query.sql
        .replaceAll("__IDS__", placeholders)
        .replaceAll("__IDS_2__", placeholders),
      args:
        "duplicateIds" in query && query.duplicateIds
          ? [...ids, ...ids]
          : [...ids],
    });
    snapshot[query.key] = result.rows.map((row) => canonical({ ...row })).sort();
    if (startedAt) {
      process.stderr.write(
        `phase610-payload ${mode} ${query.key} rows=${result.rows.length} ms=${Math.round(performance.now() - startedAt)}\n`,
      );
    }
  }
  return sha256Text(
    canonical({
      contract: "fpkg-publication-content-v3-bulk-snapshot",
      ids: [...ids].sort(),
      mode,
      tables: snapshot,
    }),
  );
}

async function loadTargets(client: Client): Promise<LoadedTarget[]> {
  const targets: LoadedTarget[] = [];
  for (const patch of phase610SemanticCleanupPatches) {
    const result = await client.execute({
      sql: `
        SELECT entity.id,entity.type,entity.slug,entity.name,entity.body_md,
               entity.source,spec.brand_entity_id,
               story.id AS story_id,story.title AS story_title,
               story.body_md AS story_body_md,
               publication.status,
               (SELECT count(*) FROM stories candidate
                WHERE candidate.entity_id=entity.id AND candidate.status='published')
                 AS published_story_count,
               (SELECT target_id FROM entity_links
                WHERE source_id=entity.id AND link_type='made_by') AS maker_id,
               (SELECT count(*) FROM entity_links
                WHERE source_id=entity.id AND link_type='made_by') AS maker_count
        FROM entities entity
        JOIN model_specs spec ON spec.entity_id=entity.id
        JOIN stories story ON story.entity_id=entity.id AND story.status='published'
        JOIN entity_publications publication ON publication.entity_id=entity.id
        WHERE entity.id=?
      `,
      args: [patch.entityId],
    });
    const row = result.rows[0];
    if (
      result.rows.length !== 1 ||
      String(row?.type) !== "pen" ||
      String(row?.slug) !== patch.slug ||
      ![patch.expectedName, patch.nextName].includes(String(row?.name)) ||
      String(row?.source) !== patch.expectedSourceMarker ||
      String(row?.brand_entity_id) !== patch.brandEntityId ||
      String(row?.maker_id) !== patch.brandEntityId ||
      Number(row?.maker_count) !== 1 ||
      Number(row?.published_story_count) !== 1 ||
      ![patch.expectedStoryTitle, patch.nextStoryTitle].includes(
        String(row?.story_title),
      ) ||
      String(row?.body_md) !== String(row?.story_body_md) ||
      !["published", "in_review"].includes(String(row?.status))
    ) {
      throw new Error(`Phase 610 identity or story collision: ${patch.slug}.`);
    }
    const currentBody = String(row?.body_md);
    const currentBodySha256 = sha256Text(currentBody);
    const expectedTerminalBodySha256 =
      phase610TerminalBodySha256ByEntityId[patch.entityId];
    const nextName = patch.nextName ?? patch.expectedName;
    const nextStoryTitle = patch.nextStoryTitle ?? patch.expectedStoryTitle;
    let nextBody: string;
    if (currentBodySha256 === patch.expectedBodySha256) {
      if (
        String(row?.name) !== patch.expectedName ||
        String(row?.story_title) !== patch.expectedStoryTitle
      ) {
        throw new Error(`Phase 610 partial name or story state: ${patch.slug}.`);
      }
      nextBody = applyPhase610TextReplacements(currentBody, patch.replacements);
      if (sha256Text(nextBody) !== expectedTerminalBodySha256) {
        throw new Error(`Phase 610 terminal body hash drift: ${patch.slug}.`);
      }
    } else if (currentBodySha256 === expectedTerminalBodySha256) {
      if (
        String(row?.name) !== nextName ||
        String(row?.story_title) !== nextStoryTitle
      ) {
        throw new Error(`Phase 610 partial terminal state: ${patch.slug}.`);
      }
      nextBody = currentBody;
    } else {
      throw new Error(`Phase 610 old-body hash or terminal-body collision: ${patch.slug}.`);
    }
    targets.push({
      patch,
      currentName: String(row?.name),
      currentBody,
      nextName,
      nextBody,
      storyId: String(row?.story_id),
      currentStoryTitle: String(row?.story_title),
      nextStoryTitle,
    });
  }

  const nextNames = targets
    .filter((target) => target.nextName !== target.currentName)
    .map((target) => target.nextName);
  for (const name of nextNames) {
    const owner = await client.execute({
      sql: "SELECT id FROM entities WHERE lower(name)=lower(?)",
      args: [name],
    });
    if (
      owner.rows.some(
        (row) =>
          !targets.some(
            (target) =>
              target.patch.entityId === String(row.id) && target.nextName === name,
          ),
      )
    ) {
      throw new Error(`Phase 610 next-name collision: ${name}.`);
    }
  }
  return targets;
}

async function loadBaseline(client: Client): Promise<CatalogBaseline> {
  const counts = (
    await client.execute(`
      SELECT
        (SELECT count(*) FROM public_entities WHERE type='pen') AS public_pens,
        (SELECT count(*) FROM entity_publications publication
         JOIN entities entity ON entity.id=publication.entity_id
         WHERE entity.type='pen' AND publication.status='published') AS published_pens
    `)
  ).rows[0];
  const targetIds = phase610SemanticCleanupPatches.map((patch) => patch.entityId);
  const nonTargets = await client.execute({
    sql: `SELECT id FROM public_entities WHERE type='pen'
          AND id NOT IN (${targetIds.map(() => "?").join(",")}) ORDER BY id`,
    args: targetIds,
  });
  return {
    publicPens: Number(counts?.public_pens),
    publishedPens: Number(counts?.published_pens),
    nonTargetPayloadDigest: await snapshotPublicationPayloadRows(
      client,
      nonTargets.rows.map((row) => String(row.id)),
      "full",
    ),
    targetAuxiliaryPayloadDigest: await snapshotPublicationPayloadRows(
      client,
      targetIds,
      "auxiliary",
    ),
  };
}

async function updateTargets(client: Client, targets: LoadedTarget[]): Promise<void> {
  const changed = targets.filter(
    (target) =>
      target.currentBody !== target.nextBody ||
      target.currentName !== target.nextName ||
      target.currentStoryTitle !== target.nextStoryTitle,
  );
  if (changed.length === 0) return;
  const transaction = await client.transaction("write");
  try {
    for (const target of changed) {
      const entity = await transaction.execute({
        sql: `UPDATE entities SET name=?,body_md=?,updated_at=datetime('now')
              WHERE id=? AND type='pen' AND slug=? AND name=? AND body_md=?`,
        args: [
          target.nextName,
          target.nextBody,
          target.patch.entityId,
          target.patch.slug,
          target.currentName,
          target.currentBody,
        ],
      });
      const story = await transaction.execute({
        sql: `UPDATE stories SET title=?,body_md=?,updated_at=datetime('now')
              WHERE id=? AND entity_id=? AND status='published'
                AND title=? AND body_md=?`,
        args: [
          target.nextStoryTitle,
          target.nextBody,
          target.storyId,
          target.patch.entityId,
          target.currentStoryTitle,
          target.currentBody,
        ],
      });
      if (entity.rowsAffected !== 1 || story.rowsAffected !== 1) {
        throw new Error(`Phase 610 target changed concurrently: ${target.patch.slug}.`);
      }
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function terminalState(
  client: Client,
  target: LoadedTarget,
  contentHash: string,
): Promise<string> {
  const result = await client.execute({
    sql: `
      SELECT entity.name,entity.body_md,story.title,story.body_md AS story_body_md,
             publication.status,publication.blockers_json,
             publication.approved_content_hash,publication.content_revision,
             publication.reviewed_content_revision,
             publication.reviewed_contract_version
      FROM entities entity
      JOIN stories story ON story.entity_id=entity.id AND story.status='published'
      JOIN entity_publications publication ON publication.entity_id=entity.id
      WHERE entity.id=?
    `,
    args: [target.patch.entityId],
  });
  const row = result.rows[0];
  if (
    result.rows.length !== 1 ||
    String(row?.name) !== target.nextName ||
    String(row?.body_md) !== target.nextBody ||
    String(row?.title) !== target.nextStoryTitle ||
    String(row?.story_body_md) !== target.nextBody ||
    String(row?.status) !== "published" ||
    String(row?.blockers_json) !== "[]" ||
    String(row?.approved_content_hash) !== contentHash ||
    Number(row?.content_revision) !== Number(row?.reviewed_content_revision) ||
    Number(row?.reviewed_contract_version) !== 3
  ) {
    throw new Error(`Phase 610 terminal publication mismatch: ${target.patch.slug}.`);
  }
  const reviews = await client.execute({
    sql: `SELECT review_kind FROM entity_content_reviews
          WHERE entity_id=? AND content_hash=? AND status='approved'
          ORDER BY review_kind`,
    args: [target.patch.entityId, contentHash],
  });
  if (
    reviews.rows.map((review) => String(review.review_kind)).join(",") !==
    "fact,language,media,publication"
  ) {
    throw new Error(`Phase 610 review gate mismatch: ${target.patch.slug}.`);
  }
  return contentHash;
}

async function verifyCatalog(
  client: Client,
  baseline: CatalogBaseline,
  targets: LoadedTarget[],
): Promise<void> {
  const counts = (
    await client.execute(`
      SELECT
        (SELECT count(*) FROM public_entities WHERE type='pen') AS public_pens,
        (SELECT count(*) FROM entity_publications publication
         JOIN entities entity ON entity.id=publication.entity_id
         WHERE entity.type='pen' AND publication.status='published') AS published_pens,
        (SELECT count(*) FROM publication_blockers blocker
         JOIN entities entity ON entity.id=blocker.entity_id
         JOIN entity_publications publication ON publication.entity_id=entity.id
         WHERE entity.type='pen' AND publication.status='published'
           AND blocker.contract_version=3) AS blockers
    `)
  ).rows[0];
  const targetIds = targets.map((target) => target.patch.entityId);
  const publicTargets = await client.execute({
    sql: `SELECT count(*) n FROM public_entities
          WHERE id IN (${targetIds.map(() => "?").join(",")})`,
    args: targetIds,
  });
  if (
    Number(counts?.public_pens) !== baseline.publicPens ||
    Number(counts?.published_pens) !== baseline.publishedPens ||
    Number(counts?.blockers) !== 0 ||
    Number(publicTargets.rows[0]?.n) !== targets.length
  ) {
    throw new Error("Phase 610 changed the public pen universe or readiness.");
  }
  const nonTargets = await client.execute({
    sql: `SELECT id FROM public_entities WHERE type='pen'
          AND id NOT IN (${targetIds.map(() => "?").join(",")}) ORDER BY id`,
    args: targetIds,
  });
  if (
    baseline.nonTargetPayloadDigest !==
    (await snapshotPublicationPayloadRows(
      client,
      nonTargets.rows.map((row) => String(row.id)),
      "full",
    ))
  ) {
    throw new Error("Phase 610 changed non-target publication payloads.");
  }
  if (
    baseline.targetAuxiliaryPayloadDigest !==
    (await snapshotPublicationPayloadRows(client, targetIds, "auxiliary"))
  ) {
    throw new Error(
      "Phase 610 changed target specifications, references, variants, relations or media.",
    );
  }
}

export async function applyPhase610PublicPenSemanticCleanup(
  client: Client,
  options: ApplyPhase610Options,
): Promise<ApplyPhase610Result> {
  await assertOwnedAuthority(client, options);
  const targets = await loadTargets(client);
  const baseline = await loadBaseline(client);
  const changed = targets.filter(
    (target) =>
      target.currentBody !== target.nextBody ||
      target.currentName !== target.nextName ||
      target.currentStoryTitle !== target.nextStoryTitle,
  );
  if (changed.length !== 0 && changed.length !== targets.length) {
    throw new Error(
      `Phase 610 refuses a partially applied target set (${changed.length}/${targets.length} original).`,
    );
  }
  const contentHashes = new Map<string, string>();
  if (changed.length > 0) {
    await updateTargets(client, targets);
    const targetIds = targets.map((target) => target.patch.entityId);
    for (const target of targets) {
      const contentHash = await computePublicationContentHash(
        client,
        target.patch.entityId,
      );
      contentHashes.set(target.patch.entityId, contentHash);
      for (const reviewKind of ["fact", "language", "media"] as const) {
        await recordEntityContentReview(client, {
          entityId: target.patch.entityId,
          reviewKind,
          reviewer: options.reviewer,
          status: "approved",
          contentHash,
          notes: `Phase 610 ${reviewKind} review for a frozen, source-backed semantic cleanup target.`,
        });
      }
    }
    const blockerRows = await client.execute({
      sql: `SELECT entity_id,blocker_code
            FROM publication_blockers
            WHERE contract_version=3
              AND entity_id IN (${targetIds.map(() => "?").join(",")})
            ORDER BY entity_id,blocker_code`,
      args: targetIds,
    });
    const reviewTransitionBlockers = new Set([
      "missing_fact_review",
      "missing_language_review",
      "missing_media_review",
      "missing_publication_review",
      "stale_reviewed_revision",
    ]);
    const structuralBlockers = blockerRows.rows.filter(
      (row) => !reviewTransitionBlockers.has(String(row.blocker_code)),
    );
    if (structuralBlockers.length !== 0) {
      throw new Error("Phase 610 target readiness gate failed.");
    }
    for (const target of targets) {
      const contentHash = contentHashes.get(target.patch.entityId);
      if (!contentHash) {
        throw new Error(`Phase 610 content hash missing: ${target.patch.slug}.`);
      }
      await publishEntity(client, {
        entityId: target.patch.entityId,
        reviewer: options.reviewer,
        contentHash,
        readiness: {
          blockerCount: 0,
          blockersJson: "[]",
          publishable: 1,
        },
        assertPublicMembership: false,
      });
    }
  }
  const entities: ApplyPhase610Result["entities"] = [];
  for (const target of targets) {
    const contentHash =
      contentHashes.get(target.patch.entityId) ??
      (await computePublicationContentHash(client, target.patch.entityId));
    entities.push({
      entityId: target.patch.entityId,
      slug: target.patch.slug,
      outcome: changed.length > 0 ? "published" : "noop",
      contentHash: await terminalState(client, target, contentHash),
    });
  }
  await verifyCatalog(client, baseline, targets);
  for (const protectedCatalog of options.protectedCatalogs) {
    assertCatalogSnapshotUnchanged(protectedCatalog.snapshot);
  }
  return { entities };
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

async function main(): Promise<void> {
  const databasePath = value("--database");
  const ownedRoot = value("--owned-root");
  const sourceCatalog = value("--source-catalog");
  const realCatalog = value("--real-catalog");
  if (!databasePath || !ownedRoot || !sourceCatalog || !realCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase610-public-pen-semantic-cleanup.ts --database <owned-copy> --owned-root <root> --source-catalog <source> --real-catalog <real> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(databasePath);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const protectedCatalogs = [sourceCatalog, realCatalog].map((catalog) => {
      const protectedPath = path.resolve(catalog);
      return { path: protectedPath, snapshot: snapshotCatalogFiles(protectedPath) };
    });
    const result = await applyPhase610PublicPenSemanticCleanup(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? PHASE610_REVIEWER,
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogs,
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
