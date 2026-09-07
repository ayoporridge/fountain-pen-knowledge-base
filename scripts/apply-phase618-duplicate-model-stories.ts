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
import { loadPhase111PilotPacks } from "./data/phase111-pilot-elabo-metal-resin-custom-ns-lightive";
import {
  phase528WancherDreamPenCosmicRadenPacks,
} from "./data/phase528-wancher-dream-pen-cosmic-raden-siblings";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export const PHASE618_REVIEWER = "phase618-duplicate-model-stories";

const PILOT_TARGETS = [
  {
    family: "pilot",
    entityId: "phase111-pilot-elabo-metal-fe-25sr",
    slug: "pilot-elabo-metal-fe-25sr",
    name: "百乐 Pilot Elabo 金属轴 FE-25SR",
    previousSourceMarker:
      "curated-content:phase111-pilot-metal:d3b9fd13728b80a615fd3e7dcba40aa8ae6d8ecc6bf8aca683e170c28cd328a0",
  },
  {
    family: "pilot",
    entityId: "phase111-pilot-elabo-resin-fe-18sr",
    slug: "pilot-elabo-resin-fe-18sr",
    name: "百乐 Pilot Elabo 树脂轴 FE-18SR",
    previousSourceMarker:
      "curated-content:phase111-pilot-resin:ae90b72380a3584b3a27a1db51a7858e7da899fb7cd742e229afa2bfa14b7b33",
  },
  {
    family: "pilot",
    entityId: "phase111-pilot-custom-ns",
    slug: "pilot-custom-ns",
    name: "百乐 Pilot Custom NS",
    previousSourceMarker:
      "curated-content:phase111-pilot-customNs:ba30be30f54bd7ef0405b20d0f66655c1c011e96b340e884046cad2f96fc0f76",
  },
  {
    family: "pilot",
    entityId: "phase111-pilot-lightive",
    slug: "pilot-lightive",
    name: "百乐 Pilot Lightive",
    previousSourceMarker:
      "curated-content:phase111-pilot-lightive:d68245a4f370222bb591810154b299efb05acb2b0e6dcd4861a419120a9c4079",
  },
] as const;

const WANCHER_TARGETS = [
  {
    family: "wancher",
    entityId: "phase528-wancher-dream-raden-nebula",
    slug: "wancher-dream-pen-raden-nebula",
    name: "Wancher Dream Pen Raden - Nebula Fountain Pen",
    previousSourceMarker:
      "curated-content:phase528-wancher-dream-raden-nebula-v1:d140d69fb9206604dd3e0810dab001a515f33ed6eeccee88dcf64ec3f8738e98",
  },
  {
    family: "wancher",
    entityId: "phase528-wancher-dream-raden-meteor-shower",
    slug: "wancher-dream-pen-raden-meteor-shower",
    name: "Wancher Dream Pen Raden - Meteor Shower Fountain Pen",
    previousSourceMarker:
      "curated-content:phase528-wancher-dream-raden-meteor-shower-v1:30ee002bf5099f0a4c79b5a3b2e5e04a76d70e193e475a6734aa7c6112ba5a46",
  },
  {
    family: "wancher",
    entityId: "phase528-wancher-dream-raden-comets",
    slug: "wancher-dream-pen-raden-comets",
    name: "Wancher Dream Pen Raden - Comets Fountain Pen",
    previousSourceMarker:
      "curated-content:phase528-wancher-dream-raden-comets-v1:0041c9a71813f176c009b801506a1cca5dc58ae617bda54ad6051816479bcb1c",
  },
  {
    family: "wancher",
    entityId: "phase528-wancher-dream-raden-asteroid-belt",
    slug: "wancher-dream-pen-raden-asteroid-belt",
    name: "Wancher Dream Pen Raden - Asteroid Belt Fountain Pen",
    previousSourceMarker:
      "curated-content:phase528-wancher-dream-raden-asteroid-belt-v1:2b56382fefbbeaaa87112daca31a5cdaf1ea91a880c141e0b0e2ab5bb9c32484",
  },
  {
    family: "wancher",
    entityId: "phase528-wancher-dream-raden-supernova",
    slug: "wancher-dream-pen-raden-supernova",
    name: "Wancher Dream Pen Raden - Supernova Fountain Pen",
    previousSourceMarker:
      "curated-content:phase528-wancher-dream-raden-supernova-v1:d42484dc4ea8c7bf75337d7b459e96569a47979d0dc5ee8da56cfe565b50e053",
  },
] as const;

export const PHASE618_TARGETS = [...PILOT_TARGETS, ...WANCHER_TARGETS] as const;

export interface ApplyPhase618Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase618Result {
  affected: { entities: number; changed: number; noop: number };
  entities: Array<{
    entityId: string;
    slug: string;
    outcome: "published" | "noop";
    contentHash: string;
  }>;
}

type Target = (typeof PHASE618_TARGETS)[number] & {
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
      throw new Error(`Phase 618 refuses inherited remote database selection: ${key}.`);
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
  options: ApplyPhase618Options,
): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 618 reviewer must not be empty.");
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
    throw new Error("Phase 618 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    owned.nlink !== BigInt(1) ||
    database === protectedPath ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 618 refuses the protected catalog or hard-link aliases.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 618 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 618 owned copy must be migrated through 032.");
  }
}

async function relationFingerprint(
  client: Client,
  entityId: string,
): Promise<string> {
  const payload: Record<string, Array<Record<string, unknown>>> = {};
  const queries: Record<string, [string, unknown[]]> = {
    links: [
      "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
      [entityId, entityId],
    ],
    references: [
      "SELECT id,entity_id,source_item_id,relation_type,note,review_status FROM entity_references WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    media: [
      "SELECT id,title,asset_type,image_url,thumbnail_url,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status FROM media_assets WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    specs: [
      "SELECT id,brand_entity_id,series_name,release_year,origin_country,nib,fill_system,material,dimensions,weight,price_range,status,review_status FROM model_specs WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    variants: [
      "SELECT id,variant_name,release_year,notes,source_item_id,review_status,variant_kind,parent_variant_id,product_code,market FROM model_variants WHERE model_entity_id=? ORDER BY id",
      [entityId],
    ],
    aliases: [
      "SELECT id,alias,language,alias_kind,market,valid_from,valid_to,source_item_id,review_status FROM entity_aliases WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    scopes: [
      "SELECT id,variant_id,scope_key,market,valid_from,valid_to,production_state,nib_scope,material_scope,edition_scope FROM fact_scopes WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    claims: [
      "SELECT id,subject_text,predicate,object_entity_id,object_text,source_item_id,evidence_locator,confidence,review_status,fact_class FROM claims WHERE subject_entity_id=? ORDER BY id",
      [entityId],
    ],
    claimEvidence: [
      "SELECT evidence.id,evidence.claim_id,evidence.citation_id,evidence.scope_id,evidence.evidence_locator,evidence.review_status FROM claim_evidence evidence JOIN claims claim ON claim.id=evidence.claim_id WHERE claim.subject_entity_id=? ORDER BY evidence.id",
      [entityId],
    ],
    timeline: [
      "SELECT id,title,event_type,start_date,end_date,circa,description,source_item_id,review_status FROM timeline_events WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    conflicts: [
      "SELECT id,field_key,scope_id,conflict_kind,status,resolution_note FROM fact_conflicts WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    conflictMembers: [
      "SELECT member.id,member.conflict_id,member.citation_id,member.asserted_value FROM fact_conflict_members member JOIN fact_conflicts conflict ON conflict.id=member.conflict_id WHERE conflict.entity_id=? ORDER BY member.id",
      [entityId],
    ],
    tags: [
      "SELECT tag_id FROM entity_tags WHERE entity_id=? ORDER BY tag_id",
      [entityId],
    ],
  };
  for (const [key, [sql, args]] of Object.entries(queries)) {
    payload[key] = await rows(client, sql, args);
  }
  return JSON.stringify(payload);
}

function loadTargets(options: ApplyPhase618Options): Target[] {
  const pilotById = new Map(
    loadPhase111PilotPacks(fs.realpathSync.native(options.ownedRoot)).map((pack) => [
      pack.entityId,
      pack,
    ]),
  );
  const wancherById = new Map(
    phase528WancherDreamPenCosmicRadenPacks.map((rawPack) => {
      const pack = loadCuratedEntityPack(
        fs.realpathSync.native(options.workspaceRoot),
        rawPack,
      );
      return [pack.entityId, pack] as const;
    }),
  );
  return PHASE618_TARGETS.map((target) => {
    const pack = (target.family === "pilot" ? pilotById : wancherById).get(
      target.entityId,
    );
    if (
      !pack ||
      pack.expectedType !== "pen" ||
      pack.expectedSlug !== target.slug ||
      pack.canonicalName !== target.name ||
      [...pack.bodyMd].length < 2_000
    ) {
      throw new Error(`Phase 618 reviewed pack identity/length mismatch: ${target.slug}.`);
    }
    return { ...target, pack };
  });
}

async function loadStates(
  client: Client,
  targets: Target[],
): Promise<TargetState[]> {
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
      throw new Error(`Phase 618 entity identity mismatch: ${target.slug}.`);
    }
    const stories = await rows(
      client,
      "SELECT id,title,summary,body_md,source_notes,story_type,status FROM stories WHERE entity_id=? AND story_type='model_story' AND status='published'",
      [target.entityId],
    );
    if (stories.length !== 1) {
      throw new Error(`Phase 618 expected one published model story: ${target.slug}.`);
    }
    if (String(entity.body_md) !== String(stories[0]?.body_md)) {
      throw new Error(`Phase 618 refuses split entity/story body: ${target.slug}.`);
    }
    const currentBody = String(entity.body_md);
    const currentSource = String(entity.source ?? "");
    const finalBody = target.pack.bodyMd;
    const finalSource = target.pack.sourceMarker;
    if (
      !(
        (currentSource === target.previousSourceMarker && currentBody !== finalBody) ||
        (currentSource === finalSource && currentBody === finalBody)
      )
    ) {
      throw new Error(`Phase 618 found a partial or tampered target: ${target.slug}.`);
    }
    const publication = await rows(
      client,
      "SELECT status FROM entity_publications WHERE entity_id=?",
      [target.entityId],
    );
    if (publication.length !== 1) {
      throw new Error(`Phase 618 publication row missing: ${target.slug}.`);
    }
    states.push({
      target,
      storyId: String(stories[0]?.id),
      currentBody,
      currentSource,
      relationFingerprint: await relationFingerprint(client, target.entityId),
    });
  }
  return states;
}

async function updateCopies(
  client: Client,
  states: TargetState[],
): Promise<number> {
  const changed = states.filter(
    (state) => state.currentSource !== state.target.pack.sourceMarker,
  );
  if (changed.length === 0) return 0;
  const transaction = await client.transaction("write");
  try {
    for (const state of changed) {
      const pack = state.target.pack;
      const entityUpdate = await transaction.execute({
        sql: "UPDATE entities SET summary=?,body_md=?,source=?,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND body_md=? AND source=?",
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
        throw new Error(`Phase 618 entity changed concurrently: ${state.target.slug}.`);
      }
      const storyUpdate = await transaction.execute({
        sql: "UPDATE stories SET title=?,summary=?,body_md=?,source_notes=?,updated_at=datetime('now') WHERE id=? AND entity_id=? AND story_type='model_story' AND status='published' AND body_md=?",
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
        throw new Error(`Phase 618 story changed concurrently: ${state.target.slug}.`);
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
  options: ApplyPhase618Options,
  states: TargetState[],
): Promise<ApplyPhase618Result["entities"]> {
  const result: ApplyPhase618Result["entities"] = [];
  for (const state of states) {
    const contentHash = await computePublicationContentHash(
      client,
      state.target.entityId,
    );
    const publication = (
      await rows(
        client,
        "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
        [state.target.entityId],
      )
    )[0];
    const reviews = await rows(
      client,
      "SELECT review_kind FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media')",
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
        notes: `Phase 618 ${reviewKind} review of model-specific duplicate-copy repair; specs, variants, references and media retained.`,
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

function duplicateParagraphs(
  bodies: Array<{ slug: string; body: string }>,
  onlySlugs?: Set<string>,
): string[] {
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
  return [...groups.entries()]
    .filter(
      ([, pages]) =>
        pages.length > 1 &&
        (onlySlugs === undefined || pages.some((slug) => onlySlugs.has(slug))),
    )
    .map(([paragraph, pages]) => `${pages.join(",")}:${paragraph}`);
}

async function publicDuplicateParagraphs(
  client: Client,
  onlySlugs: Set<string>,
): Promise<string[]> {
  const publicRows = await rows(
    client,
    "SELECT slug,body_md FROM public_entities WHERE body_md IS NOT NULL",
  );
  return duplicateParagraphs(
    publicRows.map((row) => ({ slug: String(row.slug), body: String(row.body_md) })),
    onlySlugs,
  );
}

async function verify(
  client: Client,
  states: TargetState[],
  result: ApplyPhase618Result["entities"],
): Promise<void> {
  const targetBodies: Array<{ slug: string; body: string }> = [];
  for (const state of states) {
    const row = (
      await rows(
        client,
        "SELECT entity.body_md,entity.summary AS entity_summary,entity.source AS entity_source,story.body_md AS story_body,story.title AS story_title,story.summary AS story_summary,story.source_notes AS story_source,publication.status,publication.content_revision,publication.reviewed_content_revision,publication.approved_content_hash,readiness.blocker_count,readiness.publishable,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN stories story ON story.id=? AND story.entity_id=entity.id AND story.story_type='model_story' AND story.status='published' JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3 LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
        [state.storyId, state.target.entityId],
      )
    )[0];
    const hash = await computePublicationContentHash(client, state.target.entityId);
    const reviews = await rows(
      client,
      "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
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
      throw new Error(`Phase 618 post-publication verification failed: ${state.target.slug}.`);
    }
    targetBodies.push({ slug: state.target.slug, body: pack.bodyMd });
    const entry = result.find((item) => item.entityId === state.target.entityId);
    if (!entry || entry.contentHash !== hash) {
      throw new Error(`Phase 618 result hash mismatch: ${state.target.slug}.`);
    }
  }
  if (duplicateParagraphs(targetBodies).length > 0) {
    throw new Error("Phase 618 still found duplicate paragraphs in the scoped target pages.");
  }
  if (
    (await publicDuplicateParagraphs(
      client,
      new Set(states.map((state) => state.target.slug)),
    )).length > 0
  ) {
    throw new Error("Phase 618 still found duplicate paragraphs involving scoped public pages.");
  }
  const publicDuplicates = await rows(
    client,
    "SELECT body_md,count(*) AS count FROM public_entities GROUP BY body_md HAVING count(*)>1",
  );
  if (publicDuplicates.length > 0) {
    throw new Error(`Phase 618 found duplicate public bodies: ${publicDuplicates.length}.`);
  }
}

export async function applyPhase618DuplicateModelStories(
  client: Client,
  options: ApplyPhase618Options,
): Promise<ApplyPhase618Result> {
  await assertOwnedAuthority(client, options);
  const targets = loadTargets(options);
  const states = await loadStates(client, targets);
  const changed = await updateCopies(client, states);
  const entities = await reviewAndPublish(client, options, states);
  await verify(client, states, entities);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    affected: {
      entities: entities.length,
      changed,
      noop: entities.filter((item) => item.outcome === "noop").length,
    },
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
      "Usage: tsx scripts/apply-phase618-duplicate-model-stories.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase618DuplicateModelStories(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? PHASE618_REVIEWER,
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
