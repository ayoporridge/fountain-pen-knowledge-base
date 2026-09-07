import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type Transaction } from "@libsql/client";
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
  loadPhase140Packs,
  PHASE140_IDS,
} from "./data/phase140-italian-representative-models-batch";
import type { LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export const PHASE617_REVIEWER = "phase617-italian-model-copy-dedup";

export const PHASE617_TARGETS = [
  {
    entityId: PHASE140_IDS.feel,
    slug: "scribo-feel",
    name: "SCRIBO FEEL",
    previousSourceMarker:
      "curated-content:phase140-feel-v1:39b322ec9fb144a0413156b860ae2d782587e7e761873d2b1c51a9529376b1d7",
  },
  {
    entityId: PHASE140_IDS.etruria,
    slug: "stipula-etruria-magnifica",
    name: "Stipula Etruria Magnifica",
    previousSourceMarker:
      "curated-content:phase140-etruria-v1:66cbaa15297a2f9048b2d985a38f5bc31257bbe67a0b13b512b2522bad3307dc",
  },
  {
    entityId: PHASE140_IDS.ogiva,
    slug: "current-omas-ogiva",
    name: "当代 OMAS Ogiva",
    previousSourceMarker:
      "curated-content:phase140-ogiva-v1:5e846e55abbcbac0ecbd16de17ac4566746e2bccac6f659ae56c4c663464cef2",
  },
  {
    entityId: PHASE140_IDS.dolcevita,
    slug: "current-delta-dolcevita-mid-size",
    name: "当代 Delta Dolcevita Mid-Size",
    previousSourceMarker:
      "curated-content:phase140-dolcevita-v1:c83b68ba0f5c9cca669013267a7738ec7c5a3b5fb3609feeecffc0c38a651fe9",
  },
  {
    entityId: PHASE140_IDS.libra,
    slug: "santini-libra-intenso",
    name: "Santini Italia Libra Intenso",
    previousSourceMarker:
      "curated-content:phase140-libra-v1:db58795c97c5cb64736731c8055f422884e08605a923a49109cb08a9f2f25b75",
  },
  {
    entityId: PHASE140_IDS.divina,
    slug: "visconti-divina-elegance",
    name: "Visconti Divina Elegance",
    previousSourceMarker:
      "curated-content:phase140-divina-v1:af72a02de26d27272560a641c96bd9f2bfe3fcf9a6c9b14aef9421f17d6fe6df",
  },
  {
    entityId: PHASE140_IDS.mirage,
    slug: "visconti-mirage-original",
    name: "Visconti Mirage 原始款",
    previousSourceMarker:
      "curated-content:phase140-mirage-v1:e701e8ec669dadcda974ff75caf1d3abb9edfb9b4eb7e65e508208a8a53cf6d2",
  },
] as const;

export interface ApplyPhase617Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase617Result {
  affected: { entities: number; changed: number; noop: number };
  entities: Array<{
    entityId: string;
    slug: string;
    outcome: "published" | "noop";
    contentHash: string;
  }>;
}

type Target = (typeof PHASE617_TARGETS)[number] & {
  pack: LoadedCuratedEntityPack;
};

interface TargetState {
  target: Target;
  storyId: string;
  currentBody: string;
  currentSource: string;
  relationFingerprint: string;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 617 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(
  db: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await db.execute({ sql, args: args as never[] })).rows.map((row) => ({
    ...row,
  }));
}

async function assertOwnedAuthority(
  client: Client,
  options: ApplyPhase617Options,
): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 617 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const databaseLstat = fs.lstatSync(options.databasePath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(database).isFile() ||
    databaseLstat.isSymbolicLink() ||
    !inside(database, ownedRoot)
  ) {
    throw new Error("Phase 617 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    owned.nlink !== BigInt(1) ||
    database === protectedPath ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 617 refuses the protected catalog or hard-link aliases.");
  }

  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 617 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 617 owned copy must be migrated through 032.");
  }
}

async function relationFingerprint(
  client: Client,
  entityId: string,
): Promise<string> {
  const payload: Record<string, Array<Record<string, unknown>>> = {};
  const queries: Record<string, [string, unknown[]]> = {
    links: [
      `SELECT id,source_id,target_id,link_type,reason
         FROM entity_links
        WHERE source_id=? OR target_id=?
        ORDER BY id`,
      [entityId, entityId],
    ],
    references: [
      `SELECT id,entity_id,source_item_id,relation_type,note,review_status
         FROM entity_references WHERE entity_id=? ORDER BY id`,
      [entityId],
    ],
    media: [
      `SELECT id,title,asset_type,image_url,thumbnail_url,local_path,author,license,
              attribution_text,source_url,source_item_id,review_status,usage_status
         FROM media_assets WHERE entity_id=? ORDER BY id`,
      [entityId],
    ],
    specs: [
      `SELECT id,brand_entity_id,series_name,release_year,origin_country,nib,
              fill_system,material,dimensions,weight,price_range,status,review_status
         FROM model_specs WHERE entity_id=? ORDER BY id`,
      [entityId],
    ],
    variants: [
      `SELECT id,variant_name,release_year,notes,source_item_id,review_status,
              variant_kind,parent_variant_id,product_code,market
         FROM model_variants WHERE model_entity_id=? ORDER BY id`,
      [entityId],
    ],
    aliases: [
      `SELECT id,alias,language,alias_kind,market,valid_from,valid_to,
              source_item_id,review_status
         FROM entity_aliases WHERE entity_id=? ORDER BY id`,
      [entityId],
    ],
    scopes: [
      `SELECT id,variant_id,scope_key,market,valid_from,valid_to,production_state,
              nib_scope,material_scope,edition_scope
         FROM fact_scopes WHERE entity_id=? ORDER BY id`,
      [entityId],
    ],
    claims: [
      `SELECT id,subject_text,predicate,object_entity_id,object_text,source_item_id,
              evidence_locator,confidence,review_status,fact_class
         FROM claims WHERE subject_entity_id=? ORDER BY id`,
      [entityId],
    ],
    claimEvidence: [
      `SELECT evidence.id,evidence.claim_id,evidence.citation_id,evidence.scope_id,
              evidence.evidence_locator,evidence.review_status
         FROM claim_evidence evidence
         JOIN claims claim ON claim.id=evidence.claim_id
        WHERE claim.subject_entity_id=? ORDER BY evidence.id`,
      [entityId],
    ],
    timeline: [
      `SELECT id,title,event_type,start_date,end_date,circa,description,
              source_item_id,review_status
         FROM timeline_events WHERE entity_id=? ORDER BY id`,
      [entityId],
    ],
    conflicts: [
      `SELECT id,field_key,scope_id,conflict_kind,status,resolution_note
         FROM fact_conflicts WHERE entity_id=? ORDER BY id`,
      [entityId],
    ],
    conflictMembers: [
      `SELECT member.id,member.conflict_id,member.citation_id,member.asserted_value
         FROM fact_conflict_members member
         JOIN fact_conflicts conflict ON conflict.id=member.conflict_id
        WHERE conflict.entity_id=? ORDER BY member.id`,
      [entityId],
    ],
    tags: [
      `SELECT tag_id FROM entity_tags WHERE entity_id=? ORDER BY tag_id`,
      [entityId],
    ],
  };
  for (const [key, [sql, args]] of Object.entries(queries)) {
    payload[key] = await rows(client, sql, args);
  }
  return JSON.stringify(payload);
}

function loadTargets(workspaceRoot: string): Target[] {
  const packs = loadPhase140Packs(fs.realpathSync.native(workspaceRoot));
  const byId = new Map(packs.map((pack) => [pack.entityId, pack]));
  return PHASE617_TARGETS.map((target) => {
    const pack = byId.get(target.entityId);
    if (!pack || pack.expectedType !== "pen" || pack.expectedSlug !== target.slug) {
      throw new Error(`Phase 617 reviewed pack mismatch: ${target.entityId}.`);
    }
    if (pack.canonicalName !== target.name || pack.bodyMd.length < 2_000) {
      throw new Error(`Phase 617 reviewed copy identity/length mismatch: ${target.entityId}.`);
    }
    return { ...target, pack };
  });
}

async function loadStates(client: Client, targets: Target[]): Promise<TargetState[]> {
  const states: TargetState[] = [];
  for (const target of targets) {
    const entity = (
      await rows(
        client,
        "SELECT id,type,slug,name,body_md,source FROM entities WHERE id=?",
        [target.entityId],
      )
    )[0];
    if (
      !entity ||
      String(entity.type) !== "pen" ||
      String(entity.slug) !== target.slug ||
      String(entity.name) !== target.name
    ) {
      throw new Error(`Phase 617 entity identity mismatch: ${target.slug}.`);
    }
    const stories = await rows(
      client,
      `SELECT id,title,summary,body_md,source_notes,story_type,status
         FROM stories WHERE entity_id=? AND story_type='model_story' AND status='published'`,
      [target.entityId],
    );
    if (stories.length !== 1) {
      throw new Error(`Phase 617 expected one published model story: ${target.slug}.`);
    }
    if (String(entity.body_md) !== String(stories[0]?.body_md)) {
      throw new Error(`Phase 617 refuses split entity/story body: ${target.slug}.`);
    }
    const currentSource = String(entity.source ?? "");
    const finalBody = target.pack.bodyMd;
    const finalSource = target.pack.sourceMarker;
    const previous = target.previousSourceMarker;
    if (
      !(
        (currentSource === previous && String(entity.body_md) !== finalBody) ||
        (currentSource === finalSource && String(entity.body_md) === finalBody)
      )
    ) {
      throw new Error(`Phase 617 found a partial or tampered target: ${target.slug}.`);
    }
    const publication = await rows(
      client,
      "SELECT status FROM entity_publications WHERE entity_id=?",
      [target.entityId],
    );
    if (publication.length !== 1) {
      throw new Error(`Phase 617 publication row missing: ${target.slug}.`);
    }
    states.push({
      target,
      storyId: String(stories[0]?.id),
      currentBody: String(entity.body_md),
      currentSource,
      relationFingerprint: await relationFingerprint(client, target.entityId),
    });
  }
  return states;
}

async function updateCopies(client: Client, states: TargetState[]): Promise<number> {
  const changed = states.filter((state) => state.currentSource !== state.target.pack.sourceMarker);
  if (changed.length === 0) return 0;
  const transaction = await client.transaction("write");
  try {
    for (const state of changed) {
      const pack = state.target.pack;
      const entityUpdate = await transaction.execute({
        sql: `UPDATE entities
                 SET summary=?,body_md=?,source=?,updated_at=datetime('now')
               WHERE id=? AND type='pen' AND slug=? AND body_md=? AND source=?`,
        args: [
          pack.summary,
          pack.bodyMd,
          pack.sourceMarker,
          state.target.entityId,
          state.target.slug,
          state.currentBody,
          state.target.previousSourceMarker,
        ],
      });
      if (entityUpdate.rowsAffected !== 1) {
        throw new Error(`Phase 617 entity changed concurrently: ${state.target.slug}.`);
      }
      const storyUpdate = await transaction.execute({
        sql: `UPDATE stories
                 SET title=?,summary=?,body_md=?,source_notes=?,updated_at=datetime('now')
               WHERE id=? AND entity_id=? AND story_type='model_story'
                 AND status='published' AND body_md=?`,
        args: [
          pack.storyTitle,
          pack.summary,
          pack.bodyMd,
          pack.sourceMarker,
          state.storyId,
          state.target.entityId,
          state.currentBody,
        ],
      });
      if (storyUpdate.rowsAffected !== 1) {
        throw new Error(`Phase 617 story changed concurrently: ${state.target.slug}.`);
      }
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  return changed.length;
}

async function reviewAndPublish(
  client: Client,
  options: ApplyPhase617Options,
  states: TargetState[],
): Promise<ApplyPhase617Result["entities"]> {
  const result: ApplyPhase617Result["entities"] = [];
  for (const state of states) {
    const contentHash = await computePublicationContentHash(client, state.target.entityId);
    const publication = (
      await rows(
        client,
        "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
        [state.target.entityId],
      )
    )[0];
    const reviews = await rows(
      client,
      `SELECT review_kind FROM entity_content_reviews
         WHERE entity_id=? AND content_hash=? AND status='approved'
           AND review_kind IN ('fact','language','media')`,
      [state.target.entityId, contentHash],
    );
    const reviewedKinds = new Set(reviews.map((row) => String(row.review_kind)));
    const needsPublish =
      String(publication?.status) !== "published" ||
      String(publication?.approved_content_hash ?? "") !== contentHash ||
      ["fact", "language", "media"].some((kind) => !reviewedKinds.has(kind));
    if (!needsPublish) {
      result.push({
        entityId: state.target.entityId,
        slug: state.target.slug,
        outcome: "noop",
        contentHash,
      });
      continue;
    }
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: state.target.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        contentHash,
        notes: `Phase 617 ${reviewKind} review of model-specific Italian copy; specs, variants, references and media retained.`,
      });
    }
    const published = await publishEntity(client, {
      entityId: state.target.entityId,
      reviewer: options.reviewer,
      contentHash,
    });
    result.push({
      entityId: state.target.entityId,
      slug: state.target.slug,
      outcome: "published",
      contentHash: published.contentHash,
    });
  }
  return result;
}

function duplicateParagraphs(bodies: Array<{ slug: string; body: string }>): string[] {
  const groups = new Map<string, string[]>();
  for (const item of bodies) {
    for (const paragraph of item.body
      .split(/\n\s*\n/)
      .map((value) => value.trim())
      .filter((value) => value.length >= 100)) {
      const pages = groups.get(paragraph) ?? [];
      pages.push(item.slug);
      groups.set(paragraph, pages);
    }
  }
  return [...groups.values()].filter((pages) => pages.length > 1).map((pages) => pages.join(","));
}

async function verify(
  client: Client,
  states: TargetState[],
  result: ApplyPhase617Result["entities"],
): Promise<void> {
  const bodies: Array<{ slug: string; body: string }> = [];
  for (const state of states) {
    const row = (
      await rows(
        client,
        `SELECT entity.body_md,entity.summary AS entity_summary,
                entity.source AS entity_source,
                story.body_md AS story_body,story.title AS story_title,
                story.summary AS story_summary,story.source_notes AS story_source,
                publication.status,publication.content_revision,
                publication.reviewed_content_revision,publication.approved_content_hash,
                readiness.blocker_count,readiness.publishable,
                CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
           FROM entities entity
           JOIN stories story ON story.id=? AND story.entity_id=entity.id
            AND story.story_type='model_story' AND story.status='published'
           JOIN entity_publications publication ON publication.entity_id=entity.id
           LEFT JOIN public_entity_readiness readiness
            ON readiness.entity_id=entity.id AND readiness.contract_version=3
           LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id=?`,
        [state.storyId, state.target.entityId],
      )
    )[0];
    const hash = await computePublicationContentHash(client, state.target.entityId);
    const reviews = await rows(
      client,
      `SELECT review_kind,status FROM entity_content_reviews
         WHERE entity_id=? AND content_hash=? ORDER BY review_kind`,
      [state.target.entityId, hash],
    );
    const relationAfter = await relationFingerprint(client, state.target.entityId);
    const pack = state.target.pack;
    if (
      !row ||
      String(row.body_md) !== pack.bodyMd ||
      String(row.story_body) !== pack.bodyMd ||
      String(row.entity_summary ?? "") !== pack.summary ||
      String(row.entity_source) !== pack.sourceMarker ||
      String(row.story_title) !== pack.storyTitle ||
      String(row.story_summary ?? "") !== pack.summary ||
      String(row.story_source) !== pack.sourceMarker ||
      String(row.status) !== "published" ||
      Number(row.content_revision) !== Number(row.reviewed_content_revision) ||
      String(row.approved_content_hash) !== hash ||
      Number(row.blocker_count) !== 0 ||
      Number(row.publishable) !== 1 ||
      Number(row.is_public) !== 1 ||
      relationAfter !== state.relationFingerprint ||
      JSON.stringify(reviews) !==
        JSON.stringify([
          { review_kind: "fact", status: "approved" },
          { review_kind: "language", status: "approved" },
          { review_kind: "media", status: "approved" },
          { review_kind: "publication", status: "approved" },
        ])
    ) {
      throw new Error(`Phase 617 post-publication verification failed: ${state.target.slug}.`);
    }
    bodies.push({ slug: state.target.slug, body: pack.bodyMd });
    const entry = result.find((item) => item.entityId === state.target.entityId);
    if (!entry || entry.contentHash !== hash) {
      throw new Error(`Phase 617 result hash mismatch: ${state.target.slug}.`);
    }
  }
  if (duplicateParagraphs(bodies).length > 0) {
    throw new Error("Phase 617 still found duplicate paragraphs among the seven target pages.");
  }
  const publicDuplicates = await rows(
    client,
    `SELECT body_md,count(*) AS count FROM public_entities GROUP BY body_md HAVING count(*)>1`,
  );
  if (publicDuplicates.length > 0) {
    throw new Error(`Phase 617 found duplicate public bodies: ${publicDuplicates.length}.`);
  }
}

export async function applyPhase617ItalianModelCopyDedup(
  client: Client,
  options: ApplyPhase617Options,
): Promise<ApplyPhase617Result> {
  await assertOwnedAuthority(client, options);
  const targets = loadTargets(options.workspaceRoot);
  const states = await loadStates(client, targets);
  const changed = await updateCopies(client, states);
  const entities = await reviewAndPublish(client, options, states);
  await verify(client, states, entities);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    affected: { entities: entities.length, changed, noop: entities.filter((item) => item.outcome === "noop").length },
    entities,
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
      "Usage: tsx scripts/apply-phase617-italian-model-copy-dedup.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase617ItalianModelCopyDedup(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? PHASE617_REVIEWER,
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

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
