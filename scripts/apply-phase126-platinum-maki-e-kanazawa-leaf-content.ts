import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient, type Transaction } from "@libsql/client";
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
  insertPack,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
  uniqueSources,
  upsertSources,
  validatePack,
} from "./apply-phase22-content";
import {
  loadPhase126Packs,
  PHASE126_ARTICLE_ID,
  PHASE126_ARTICLE_NAME,
  PHASE126_ARTICLE_SLUG,
  PHASE126_ARTICLE_SVG,
  PHASE126_BRAND_ID,
  PHASE126_LEGACY_MADE_BY_ID,
  PHASE126_LEGACY_REVERSE_ID,
  PHASE126_LINES,
  PHASE126_NEW_MADE_BY_IDS,
  PHASE126_NEW_REVERSE_IDS,
  PHASE126_RAW_NAME,
  PHASE126_RAW_SLUG,
  PHASE126_TARGET_IDS,
  phase126Article,
} from "./data/phase126-platinum-maki-e-kanazawa-leaf";
import {
  curatedId,
  type CuratedSource,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export type ApplyPhase126Options = ApplyPhase22Options;
export type ApplyPhase126Result = ApplyPhase22Result;

const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const ALLOWED_REPOS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  CANONICAL_REPO,
]);
const RETRIEVED = "2026-07-22";

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string) {
  return `${prefix}-${hash(value).slice(0, 24)}`;
}

function sourceItemId(key: string) {
  return curatedId("source-item", key);
}

function inside(candidate: string, root: string) {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv) {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const)
    if (env[key]?.trim())
      throw new Error(`Phase 126 refuses inherited remote selection: ${key}.`);
}

async function authority(client: Client, options: ApplyPhase126Options) {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim())
    throw new Error("Phase 126 reviewer must not be empty.");
  if (!ALLOWED_REPOS.has(options.workspaceRoot))
    throw new Error("Phase 126 requires the verified CodeBuddy/Documents repo pair.");
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const gitRoot = fs.realpathSync.native(
    execFileSync(
      "git",
      ["-C", options.workspaceRoot, "rev-parse", "--show-toplevel"],
      { encoding: "utf8" },
    ).trim(),
  );
  if (workspaceRoot !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO)
    throw new Error("Phase 126 verified repo aliases must resolve identically.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink())
    throw new Error("Phase 126 owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !inside(databasePath, ownedRoot))
    throw new Error("Phase 126 requires a database inside caller-owned root.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  )
    throw new Error("Phase 126 refuses protected catalog or hard-link aliases.");
  const main = (await client.execute("PRAGMA database_list")).rows.find(
    (row) => String(row.name) === "main",
  );
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath)
    throw new Error("Phase 126 client/path mismatch.");
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1)
    throw new Error("Phase 126 owned copy must be migrated through 032.");
  return workspaceRoot;
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function entityDigest(client: Client, entityId: string, topology = true) {
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
    ...(topology
      ? [
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          "SELECT * FROM entity_publications WHERE entity_id=?",
          "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
        ]
      : []),
  ];
  const payload = [];
  for (const sql of queries)
    payload.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  return hash(JSON.stringify(payload));
}

function loadArticle(workspaceRoot: string) {
  const markdown = fs
    .readFileSync(path.resolve(workspaceRoot, phase126Article.markdownFile), "utf8")
    .replace(/\r\n?/g, "\n");
  const summary = markdown
    .match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1]
    ?.trim();
  const bodyMd = markdown.match(/^## body_md\s*\n+([\s\S]*)$/m)?.[1]?.trim();
  if (
    !summary ||
    !bodyMd ||
    Array.from(summary).length < 60 ||
    Array.from(summary).length > 160 ||
    Array.from(bodyMd).length < 2_000
  )
    throw new Error("Phase 126 guide copy is incomplete.");
  for (const line of PHASE126_LINES)
    if (!bodyMd.includes(`/pen/${line.slug}`) || !bodyMd.includes(line.model))
      throw new Error("Phase 126 guide lost an exact product link.");
  const digest = hash(
    JSON.stringify({ summary, bodyMd, targets: PHASE126_TARGET_IDS }),
  );
  return {
    summary,
    bodyMd,
    marker: `${phase126Article.sourceMarkerPrefix}${digest}`,
  };
}

function articleDiagram(): CuratedSource {
  return {
    key: "phase126-makie-guide-diagram",
    registryKey: "fountain-pen-graph-editorial-phase126",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase126",
    title: "Platinum Maki-e and Kanazawa Leaf product-line map",
    url: PHASE126_ARTICLE_SVG,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    publishedAt: RETRIEVED,
    retrievedAt: RETRIEVED,
    summary: "Original factual map separating three exact product lines.",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: PHASE126_ARTICLE_SVG,
    archiveLocator: `project-public-asset:${PHASE126_ARTICLE_SVG};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
  };
}

async function baseline(client: Client) {
  const brand = (
    await rows(
      client,
      "SELECT entity.type,entity.slug,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
      [PHASE126_BRAND_ID],
    )
  )[0];
  if (
    brand?.type !== "brand" ||
    brand?.slug !== "platinum" ||
    brand?.status !== "published" ||
    Number(brand?.is_public) !== 1
  )
    throw new Error("Phase 126 requires the published Platinum baseline.");
}

async function inspectState(
  client: Client,
  marker: string,
  packs: LoadedCuratedEntityPack[],
): Promise<"raw" | "terminal"> {
  const article = (
    await rows(client, "SELECT * FROM entities WHERE id=?", [PHASE126_ARTICLE_ID])
  )[0];
  if (!article) throw new Error("Phase 126 donor is missing.");
  const targets = await rows(
    client,
    `SELECT id,type,slug,name,source FROM entities WHERE id IN (${packs.map(() => "?").join(",")}) ORDER BY id`,
    packs.map((pack) => pack.entityId),
  );
  if (
    article.type === "pen" &&
    article.slug === PHASE126_RAW_SLUG &&
    article.name === PHASE126_RAW_NAME &&
    article.source == null &&
    targets.length === 0
  ) {
    const aliases = (
      await rows(
        client,
        "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
        [PHASE126_ARTICLE_ID],
      )
    ).map((row) => String(row.alias));
    const links = (
      await rows(
        client,
        "SELECT id FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
        [PHASE126_ARTICLE_ID, PHASE126_ARTICLE_ID],
      )
    ).map((row) => String(row.id));
    const raw = (
      await rows(
        client,
        `SELECT publication.status,publication.content_revision,
          (SELECT group_concat(id,'|') FROM (SELECT id FROM stories WHERE entity_id=entity.id ORDER BY id)) stories,
          (SELECT group_concat(id,'|') FROM (SELECT id FROM model_specs WHERE entity_id=entity.id ORDER BY id)) specs,
          (SELECT group_concat(id,'|') FROM (SELECT id FROM claims WHERE subject_entity_id=entity.id ORDER BY id)) claims,
          (SELECT group_concat(id,'|') FROM (SELECT id FROM entity_references WHERE entity_id=entity.id ORDER BY id)) refs,
          (SELECT group_concat(id,'|') FROM (SELECT id FROM media_assets WHERE entity_id=entity.id ORDER BY id)) media
          FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id WHERE entity.id=?`,
        [PHASE126_ARTICLE_ID],
      )
    )[0];
    if (
      Array.from(String(article.summary)).length !== 51 ||
      Array.from(String(article.body_md)).length !== 175 ||
      JSON.stringify(aliases) !==
        JSON.stringify(
          [
            "Platinum Maki-e fountain pen",
            "Platinum Maki-e series",
            "白金 莳绘系列",
          ].sort(),
        ) ||
      JSON.stringify(links) !==
        JSON.stringify(
          [PHASE126_LEGACY_REVERSE_ID, PHASE126_LEGACY_MADE_BY_ID].sort(),
        ) ||
      raw?.status !== "draft" ||
      Number(raw?.content_revision) !== 1 ||
      raw?.stories !== "story-model-platinum-makie-series-research" ||
      raw?.specs !== "spec-platinum-makie-series-research" ||
      raw?.claims !== "claim-platinum-makie-series-source-boundary" ||
      raw?.refs !==
        "eref-commerce-eb68155c4651bb|reference-model-gap-7dEIl-3axPwa-source-platinum-makie-series-public-search" ||
      raw?.media !== "media-commerce-77b6f17237ce0f"
    )
      throw new Error("Phase 126 raw payload is alternate; repair forbidden.");
    return "raw";
  }
  if (
    article.type !== "article" ||
    article.slug !== PHASE126_ARTICLE_SLUG ||
    article.name !== PHASE126_ARTICLE_NAME ||
    article.source !== marker ||
    targets.length !== packs.length
  )
    throw new Error("Phase 126 terminal state is partial or alternate.");
  const byId = new Map(targets.map((row) => [String(row.id), row]));
  for (const pack of packs) {
    const row = byId.get(pack.entityId);
    if (
      row?.type !== "pen" ||
      row?.slug !== pack.expectedSlug ||
      row?.name !== pack.canonicalName ||
      row?.source !== pack.sourceMarker
    )
      throw new Error("Phase 126 terminal pen identity is partial or alternate.");
  }
  return "terminal";
}

async function deletePayload(tx: Transaction, entityId: string) {
  await tx.execute({
    sql: "DELETE FROM fact_conflicts WHERE entity_id=?",
    args: [entityId],
  });
  await tx.execute({
    sql: "DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)",
    args: [entityId],
  });
  await tx.execute({
    sql: "DELETE FROM spec_field_evidence WHERE model_spec_id IN (SELECT id FROM model_specs WHERE entity_id=?)",
    args: [entityId],
  });
  await tx.execute({
    sql: "DELETE FROM citations WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?) OR (target_type='model_spec' AND target_id IN (SELECT id FROM model_specs WHERE entity_id=?))",
    args: [entityId, entityId],
  });
  for (const [table, column] of [
    ["entity_references", "entity_id"],
    ["entity_aliases", "entity_id"],
    ["timeline_events", "entity_id"],
    ["media_assets", "entity_id"],
    ["model_variants", "model_entity_id"],
    ["model_specs", "entity_id"],
    ["claims", "subject_entity_id"],
    ["fact_scopes", "entity_id"],
    ["stories", "entity_id"],
  ] as const)
    await tx.execute({ sql: `DELETE FROM ${table} WHERE ${column}=?`, args: [entityId] });
}

async function installArticle(
  tx: Transaction,
  copy: ReturnType<typeof loadArticle>,
  sources: CuratedSource[],
) {
  const primary = sources.find((source) => source.sourceType === "official");
  if (!primary) throw new Error("Phase 126 guide has no official source.");
  for (const alias of phase126Article.truthfulAliases)
    await tx.execute({
      sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,source_item_id,review_status) VALUES(?,?,?,?,?,'alias',?,'approved')",
      args: [
        stableId("phase126-guide-alias", alias),
        PHASE126_ARTICLE_ID,
        alias,
        alias.includes("白金") ? "zh" : "en",
        curatedId("source-registry", primary.registryKey),
        sourceItemId(primary.key),
      ],
    });
  for (const item of sources)
    await tx.execute({
      sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')",
      args: [
        stableId("phase126-guide-reference", item.key),
        PHASE126_ARTICLE_ID,
        sourceItemId(item.key),
        item.sourceType === "official"
          ? "official"
          : item.tier === "professional_secondary"
            ? "review"
            : "reference",
        item.summary,
      ],
    });
  const scopeId = stableId("phase126-guide-scope", "three-lines");
  await tx.execute({
    sql: "INSERT INTO fact_scopes(id,entity_id,scope_key,valid_from,production_state,edition_scope) VALUES(?,?,?,?,'current',?)",
    args: [
      scopeId,
      PHASE126_ARTICLE_ID,
      "phase126-three-exact-lines",
      RETRIEVED,
      PHASE126_LINES.map((line) => `${line.model}:${line.slug}`).join(" | "),
    ],
  });
  const claimId = stableId("phase126-guide-claim", "identity-boundary");
  const citationId = stableId("phase126-guide-citation", "identity-boundary");
  await tx.execute({
    sql: "INSERT INTO claims(id,subject_entity_id,predicate,object_text,source_item_id,evidence_locator,confidence,review_status,fact_class) VALUES(?,?,?,?,?,?,0.99,'approved','core')",
    args: [
      claimId,
      PHASE126_ARTICLE_ID,
      "collection_identity_boundary",
      "PNB-30000B, PNB-35000H and PTL-20000H are separate exact product lines, not one mixed 14K/18K model.",
      sourceItemId(primary.key),
      "exact product headings, product numbers, nib/material/dimension fields",
    ],
  });
  await tx.execute({
    sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,claim_id,review_status,evidence_locator,scope_id) VALUES(?,'claim',?,?,?,'approved',?,?)",
    args: [
      citationId,
      claimId,
      sourceItemId(primary.key),
      claimId,
      "exact product heading and product-number boundary",
      scopeId,
    ],
  });
  await tx.execute({
    sql: "INSERT INTO claim_evidence(id,claim_id,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,'approved')",
    args: [
      stableId("phase126-guide-evidence", "identity-boundary"),
      claimId,
      citationId,
      scopeId,
      "three exact product pages and dated official list",
    ],
  });
  await tx.execute({
    sql: "INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES(?,?,?,'overview',?,?,'published',?)",
    args: [
      stableId("phase126-guide-story", PHASE126_ARTICLE_ID),
      PHASE126_ARTICLE_ID,
      PHASE126_ARTICLE_NAME,
      copy.summary,
      copy.bodyMd,
      copy.marker,
    ],
  });
  const diagram = sources.find((source) => source.url === PHASE126_ARTICLE_SVG);
  if (!diagram) throw new Error("Phase 126 guide diagram source is missing.");
  await tx.execute({
    sql: "INSERT INTO media_assets(id,entity_id,title,asset_type,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES(?,?,?,'diagram',?,'Fountain Pen Graph editorial','site-original',?,?,?,'approved','primary')",
    args: [
      stableId("phase126-guide-media", PHASE126_ARTICLE_ID),
      PHASE126_ARTICLE_ID,
      "Platinum Maki-e and Kanazawa Leaf product-line map",
      PHASE126_ARTICLE_SVG,
      "site-original factual SVG; non-photo, non-logo, not-to-scale, not-colour-proof, not-finish-proof.",
      PHASE126_ARTICLE_SVG,
      sourceItemId(diagram.key),
    ],
  });
}

async function reviewPublish(
  client: Client,
  entityId: string,
  reviewer: string,
  note: string,
) {
  for (const reviewKind of ["fact", "language", "media"] as const)
    await recordEntityContentReview(client, {
      entityId,
      reviewKind,
      reviewer,
      status: "approved",
      notes: note,
    });
  return (await publishEntity(client, { entityId, reviewer })).contentHash;
}

async function terminal(
  client: Client,
  marker: string,
  packs: LoadedCuratedEntityPack[],
) {
  const ids = [PHASE126_ARTICLE_ID, ...packs.map((pack) => pack.entityId)];
  const entities = await rows(
    client,
    `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,publication.status,publication.approved_content_hash,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id IN (${ids.map(() => "?").join(",")})`,
    ids,
  );
  if (entities.length !== ids.length)
    throw new Error("Phase 126 terminal identities are incomplete.");
  const byId = new Map(entities.map((row) => [String(row.id), row]));
  const hashes = new Map<string, string>();
  for (const id of ids) {
    const expected =
      id === PHASE126_ARTICLE_ID
        ? {
            type: "article",
            slug: PHASE126_ARTICLE_SLUG,
            name: PHASE126_ARTICLE_NAME,
            source: marker,
          }
        : (() => {
            const pack = packs.find((item) => item.entityId === id)!;
            return {
              type: "pen",
              slug: pack.expectedSlug,
              name: pack.canonicalName,
              source: pack.sourceMarker,
            };
          })();
    const row = byId.get(id);
    const current = await computePublicationContentHash(client, id);
    hashes.set(id, current);
    const reviews = await rows(
      client,
      "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
      [id, current],
    );
    if (
      row?.type !== expected.type ||
      row?.slug !== expected.slug ||
      row?.name !== expected.name ||
      row?.source !== expected.source ||
      row?.status !== "published" ||
      row?.approved_content_hash !== current ||
      Number(row?.is_public) !== 1 ||
      JSON.stringify(reviews.map((review) => String(review.review_kind))) !==
        JSON.stringify(["fact", "language", "media", "publication"]) ||
      reviews.some((review) => review.status !== "approved")
    )
      throw new Error("Phase 126 terminal content/publication is invalid.");
  }
  const articleAliases = (
    await rows(
      client,
      "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
      [PHASE126_ARTICLE_ID],
    )
  ).map((row) => String(row.alias));
  if (
    JSON.stringify(articleAliases) !==
    JSON.stringify([...phase126Article.truthfulAliases].sort()) ||
    (
      await rows(
        client,
        "SELECT id FROM entity_links WHERE source_id=? OR target_id=?",
        [PHASE126_ARTICLE_ID, PHASE126_ARTICLE_ID],
      )
    ).length !== 0
  )
    throw new Error("Phase 126 terminal article alias/topology is invalid.");
  const articleCounts = (
    await rows(
      client,
      `SELECT
        (SELECT count(*) FROM stories WHERE entity_id=?) stories,
        (SELECT count(*) FROM entity_references WHERE entity_id=?) refs,
        (SELECT count(*) FROM fact_scopes WHERE entity_id=?) scopes,
        (SELECT count(*) FROM claims WHERE subject_entity_id=?) claims,
        (SELECT count(*) FROM model_specs WHERE entity_id=?) specs,
        (SELECT count(*) FROM model_variants WHERE model_entity_id=?) variants,
        (SELECT count(*) FROM media_assets WHERE entity_id=?) media`,
      Array(7).fill(PHASE126_ARTICLE_ID),
    )
  )[0];
  if (
    Number(articleCounts?.stories) !== 1 ||
    Number(articleCounts?.refs) !== 16 ||
    Number(articleCounts?.scopes) !== 1 ||
    Number(articleCounts?.claims) !== 1 ||
    Number(articleCounts?.specs) !== 0 ||
    Number(articleCounts?.variants) !== 0 ||
    Number(articleCounts?.media) !== 1
  )
    throw new Error("Phase 126 terminal article payload is not exact.");
  for (let index = 0; index < packs.length; index += 1) {
    const pack = packs[index]!;
    const line = PHASE126_LINES[index]!;
    const variants = (
      await rows(
        client,
        "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
        [pack.entityId],
      )
    ).map((row) => String(row.variant_name));
    const aliases = (
      await rows(
        client,
        "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
        [pack.entityId],
      )
    ).map((row) => String(row.alias));
    const topology = (
      await rows(
        client,
        "SELECT id FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id",
        [pack.entityId, pack.entityId],
      )
    ).map((row) => String(row.id));
    const counts = (
      await rows(
        client,
        `SELECT
          (SELECT count(*) FROM stories WHERE entity_id=?) stories,
          (SELECT count(*) FROM entity_references WHERE entity_id=?) refs,
          (SELECT count(*) FROM fact_scopes WHERE entity_id=?) scopes,
          (SELECT count(*) FROM claims WHERE subject_entity_id=?) claims,
          (SELECT count(*) FROM model_specs WHERE entity_id=?) specs,
          (SELECT count(*) FROM media_assets WHERE entity_id=?) media,
          (SELECT count(*) FROM timeline_events WHERE entity_id=?) timeline`,
        Array(7).fill(pack.entityId),
      )
    )[0];
    if (
      JSON.stringify(variants) !==
        JSON.stringify(line.variants.map((variant) => variant.name).sort()) ||
      JSON.stringify(aliases) !==
        JSON.stringify(pack.aliases.map((alias) => alias.alias).sort()) ||
      JSON.stringify(topology) !==
        JSON.stringify(
          [
            PHASE126_NEW_MADE_BY_IDS[index],
            PHASE126_NEW_REVERSE_IDS[index],
          ].sort(),
        ) ||
      Number(counts?.stories) !== 1 ||
      Number(counts?.refs) !== pack.sources.length ||
      Number(counts?.scopes) !== pack.scopes.length ||
      Number(counts?.claims) !== pack.claims.length ||
      Number(counts?.specs) !== 1 ||
      Number(counts?.media) !== pack.media.length ||
      Number(counts?.timeline) !== (pack.timeline?.length ?? 0)
    )
      throw new Error("Phase 126 terminal pen payload/topology is invalid.");
  }
  const brandHash = await computePublicationContentHash(client, PHASE126_BRAND_ID);
  const brand = (
    await rows(
      client,
      "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE126_BRAND_ID],
    )
  )[0];
  if (brand?.status !== "published" || brand?.approved_content_hash !== brandHash)
    throw new Error("Phase 126 terminal Platinum publication is stale.");
  return ids.map((id) => hashes.get(id)!);
}

export async function applyPhase126PlatinumMakiEContent(
  client: Client,
  options: ApplyPhase126Options,
): Promise<ApplyPhase126Result> {
  const workspaceRoot = await authority(client, options);
  const copy = loadArticle(workspaceRoot);
  const packs = loadPhase126Packs(workspaceRoot);
  for (const pack of packs) validatePack(workspaceRoot, pack);
  for (const svg of [PHASE126_ARTICLE_SVG, ...packs.map((pack) => pack.media[0]!.localPath!)])
    if (!fs.existsSync(path.join(workspaceRoot, "public", svg.slice(1))))
      throw new Error(`Phase 126 SVG is missing: ${svg}`);
  await baseline(client);
  const state = await inspectState(client, copy.marker, packs);
  if (state === "terminal") {
    const hashes = await terminal(client, copy.marker, packs);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      entities: [PHASE126_ARTICLE_ID, ...PHASE126_TARGET_IDS].map(
        (entityId, index) => ({
          entityId,
          outcome: "noop" as const,
          contentHash: hashes[index]!,
        }),
      ),
    };
  }

  const targetSlugs = [
    PHASE126_ARTICLE_SLUG,
    ...packs.map((pack) => pack.expectedSlug),
  ];
  const slugOwners = await rows(
    client,
    `SELECT id,slug FROM entities WHERE slug IN (${targetSlugs.map(() => "?").join(",")}) AND id<>?`,
    [...targetSlugs, PHASE126_ARTICLE_ID],
  );
  const targetAliases = [
    ...phase126Article.truthfulAliases,
    ...packs.flatMap((pack) => pack.aliases.map((alias) => alias.alias)),
  ];
  const targetIds = [PHASE126_ARTICLE_ID, ...PHASE126_TARGET_IDS];
  const aliasOwners = await rows(
    client,
    `SELECT entity_id,alias FROM entity_aliases WHERE alias IN (${targetAliases.map(() => "?").join(",")}) AND entity_id NOT IN (${targetIds.map(() => "?").join(",")})`,
    [...targetAliases, ...targetIds],
  );
  if (slugOwners.length > 0 || aliasOwners.length > 0)
    throw new Error("Phase 126 target slug/alias collision; repair forbidden.");

  const protectedIds = [
    "ekPMWnot9inz",
    "BoZ4C2WSqk0K",
    "phase121-platinum-procyon-pns-5000",
    "a1t4DNomp4Ge",
    "OOumUrtFoAqu",
    "phase123-platinum-izumo-piz-80000n",
    "ogo1UmxmcXJT",
    ...["shungyo", "kumpoo", "rokka", "shiun", "kinshu"].map(
      (key) => `phase124-platinum-fuji-shunkei-${key}`,
    ),
    "s44PLATPREP",
    "Er9lACPas9qm",
  ];
  const protectedBefore = new Map<string, string>();
  for (const id of protectedIds)
    protectedBefore.set(id, await entityDigest(client, id));
  const brandBefore = await entityDigest(client, PHASE126_BRAND_ID, false);
  const reverseBefore = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE126_BRAND_ID],
    )
  ).map((row) => String(row.target_id));

  const nonDiagramSources = uniqueSources(packs).filter(
    (source) => source.sourceType !== "user_submission",
  );
  const guideDiagram = articleDiagram();
  const allSources = [...uniqueSources(packs), guideDiagram];
  const tx = await client.transaction("write");
  try {
    await deletePayload(tx, PHASE126_ARTICLE_ID);
    const removed = await tx.execute({
      sql: "DELETE FROM entity_links WHERE id=?",
      args: [PHASE126_LEGACY_MADE_BY_ID],
    });
    const legacyRemaining = await tx.execute({
      sql: "SELECT id FROM entity_links WHERE id IN (?,?)",
      args: [PHASE126_LEGACY_MADE_BY_ID, PHASE126_LEGACY_REVERSE_ID],
    });
    if (removed.rowsAffected !== 1 || legacyRemaining.rows.length !== 0)
      throw new Error("Phase 126 legacy maker topology changed.");
    const changed = await tx.execute({
      sql: "UPDATE entities SET type='article',slug=?,name=?,summary=?,body_md=?,source=?,source_url=NULL,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND name=?",
      args: [
        PHASE126_ARTICLE_SLUG,
        PHASE126_ARTICLE_NAME,
        copy.summary,
        copy.bodyMd,
        copy.marker,
        PHASE126_ARTICLE_ID,
        PHASE126_RAW_SLUG,
        PHASE126_RAW_NAME,
      ],
    });
    if (changed.rowsAffected !== 1)
      throw new Error("Phase 126 donor changed before reclassification.");
    for (let index = 0; index < packs.length; index += 1) {
      const pack = packs[index]!;
      await tx.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [pack.entityId, pack.expectedSlug, pack.canonicalName],
      });
      await tx.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          PHASE126_NEW_MADE_BY_IDS[index],
          pack.entityId,
          PHASE126_BRAND_ID,
          `Phase 126 exact ${PHASE126_LINES[index]?.model} maker relation`,
        ],
      });
    }
    const batchKey = `${PHASE126_ARTICLE_ID}:pen->article:${PHASE126_TARGET_IDS.join(",")}`;
    const batchId = stableId("phase126-makie-batch", batchKey);
    await tx.execute({
      sql: "INSERT INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [
        batchId,
        batchKey,
        hash(batchKey),
        "Reclassify mixed Maki-e donor and materialize three exact product lines.",
      ],
    });
    await tx.execute({
      sql: "INSERT INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'rename',?,?,?,'applied',?)",
      args: [
        stableId("phase126-makie-action", `${batchKey}:rename`),
        batchId,
        PHASE126_RAW_SLUG,
        hash(`${batchKey}:rename`),
        PHASE126_ARTICLE_ID,
        PHASE126_ARTICLE_ID,
        "Preserve donor ID as a guide and remove the false single-model identity.",
      ],
    });
    for (const pack of packs) {
      const splitKey = `${batchKey}:split:${pack.entityId}`;
      await tx.execute({
        sql: "INSERT INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'split',?,?,?,'applied',?)",
        args: [
          stableId("phase126-makie-action", splitKey),
          batchId,
          `product:${pack.entityId}`,
          hash(splitKey),
          PHASE126_ARTICLE_ID,
          pack.entityId,
          "Materialize one exact official Platinum decorative product line.",
        ],
      });
    }
    const sourceIds = await upsertSources(tx, allSources);
    await installArticle(tx, copy, [...nonDiagramSources, guideDiagram]);
    for (const pack of packs) await insertPack(tx, pack, sourceIds);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }

  if ((await entityDigest(client, PHASE126_BRAND_ID, false)) !== brandBefore)
    throw new Error("Phase 126 changed Platinum non-topology payload.");
  const expectedReverse = reverseBefore
    .filter((id) => id !== PHASE126_ARTICLE_ID)
    .concat(PHASE126_TARGET_IDS)
    .sort();
  const reverseAfter = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE126_BRAND_ID],
    )
  ).map((row) => String(row.target_id));
  if (JSON.stringify(reverseAfter) !== JSON.stringify(expectedReverse))
    throw new Error("Phase 126 reverse delta is not exact remove-one/add-three.");
  for (const id of protectedIds)
    if ((await entityDigest(client, id)) !== protectedBefore.get(id))
      throw new Error(`Phase 126 changed protected entity ${id}.`);

  const reviewer = options.reviewer.trim();
  await reviewPublish(
    client,
    PHASE126_BRAND_ID,
    reviewer,
    "Phase 126 post-topology current hash; no Platinum pack replay.",
  );
  const articleHash = await reviewPublish(
    client,
    PHASE126_ARTICLE_ID,
    reviewer,
    `${copy.marker}; three-line guide and mixed-model correction.`,
  );
  const penHashes: string[] = [];
  for (const pack of packs)
    penHashes.push(
      await reviewPublish(
        client,
        pack.entityId,
        reviewer,
        `${pack.sourceMarker}; exact product, motif and sample boundaries.`,
      ),
    );
  await terminal(client, copy.marker, packs);
  if ((await entityDigest(client, PHASE126_BRAND_ID, false)) !== brandBefore)
    throw new Error("Phase 126 replayed Platinum non-topology payload.");
  for (const id of protectedIds)
    if ((await entityDigest(client, id)) !== protectedBefore.get(id))
      throw new Error(`Phase 126 changed protected entity ${id} after publication.`);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: [
      {
        entityId: PHASE126_ARTICLE_ID,
        outcome: "published",
        contentHash: articleHash,
      },
      ...packs.map((pack, index) => ({
        entityId: pack.entityId,
        outcome: "published" as const,
        contentHash: penHashes[index]!,
      })),
    ],
  };
}

function value(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main() {
  const databasePath = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalogPath = value("--protected-catalog");
  const reviewer = value("--reviewer") ?? "phase126-platinum-makie";
  if (!databasePath || !ownedRoot || !protectedCatalogPath)
    throw new Error(
      "Usage: tsx scripts/apply-phase126-platinum-maki-e-kanazawa-leaf-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>",
    );
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    process.stdout.write(
      `${JSON.stringify(
        await applyPhase126PlatinumMakiEContent(client, {
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
