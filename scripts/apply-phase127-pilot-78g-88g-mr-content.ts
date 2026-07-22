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
  loadPhase127Packs,
  PHASE127_78G_ID,
  PHASE127_78G_MADE_BY_ID,
  PHASE127_78G_NAME,
  PHASE127_78G_RAW_NAME,
  PHASE127_78G_RAW_SLUG,
  PHASE127_78G_REVERSE_ID,
  PHASE127_78G_SLUG,
  PHASE127_88G_ARTICLE_ID,
  PHASE127_88G_ARTICLE_NAME,
  PHASE127_88G_ARTICLE_SLUG,
  PHASE127_88G_LEGACY_MADE_BY_ID,
  PHASE127_88G_LEGACY_REVERSE_ID,
  PHASE127_88G_RAW_NAME,
  PHASE127_88G_RAW_SLUG,
  PHASE127_LINES,
  PHASE127_MR_LINES,
  PHASE127_NEW_MADE_BY_IDS,
  PHASE127_NEW_MR_IDS,
  PHASE127_NEW_REVERSE_IDS,
  PHASE127_PILOT_ID,
  phase127Article,
} from "./data/phase127-pilot-78g-88g-mr";
import {
  curatedId,
  type CuratedSource,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export type ApplyPhase127Options = ApplyPhase22Options;
export type ApplyPhase127Result = ApplyPhase22Result;

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
      throw new Error(`Phase 127 refuses inherited remote selection: ${key}.`);
}

async function authority(client: Client, options: ApplyPhase127Options) {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim())
    throw new Error("Phase 127 reviewer must not be empty.");
  if (!ALLOWED_REPOS.has(options.workspaceRoot))
    throw new Error("Phase 127 requires the verified CodeBuddy/Documents repo pair.");
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const gitRoot = fs.realpathSync.native(
    execFileSync(
      "git",
      ["-C", options.workspaceRoot, "rev-parse", "--show-toplevel"],
      { encoding: "utf8" },
    ).trim(),
  );
  if (workspaceRoot !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO)
    throw new Error("Phase 127 verified repo aliases must resolve identically.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink())
    throw new Error("Phase 127 owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !inside(databasePath, ownedRoot))
    throw new Error("Phase 127 requires a database inside caller-owned root.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  )
    throw new Error("Phase 127 refuses protected catalog or hard-link aliases.");
  const main = (await client.execute("PRAGMA database_list")).rows.find(
    (row) => String(row.name) === "main",
  );
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath)
    throw new Error("Phase 127 client/path mismatch.");
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1)
    throw new Error("Phase 127 owned copy must be migrated through 032.");
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
    .readFileSync(path.resolve(workspaceRoot, phase127Article.markdown), "utf8")
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
    throw new Error("Phase 127 guide copy is incomplete.");
  for (const line of PHASE127_MR_LINES)
    if (!bodyMd.includes(`/pen/${line.slug}`) || !bodyMd.includes(line.model))
      throw new Error("Phase 127 guide lost an exact MR product link.");
  const digest = hash(
    JSON.stringify({
      summary,
      bodyMd,
      targets: [PHASE127_78G_ID, ...PHASE127_NEW_MR_IDS],
    }),
  );
  return {
    summary,
    bodyMd,
    marker: `${phase127Article.sourceMarkerPrefix}${digest}`,
  };
}

function articleDiagram(): CuratedSource {
  return {
    key: "phase127-pilot-88g-mr-guide-diagram",
    registryKey: "fountain-pen-graph-editorial-phase127",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase127",
    title: "Pilot 88G / MR exact-line map",
    url: phase127Article.svg,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    publishedAt: RETRIEVED,
    retrievedAt: RETRIEVED,
    summary: "Original factual map separating MR1, MR2 and MR3 exact product lines.",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: phase127Article.svg,
    archiveLocator: `project-public-asset:${phase127Article.svg};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
  };
}

async function baseline(client: Client) {
  const brand = (
    await rows(
      client,
      "SELECT entity.type,entity.slug,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
      [PHASE127_PILOT_ID],
    )
  )[0];
  if (
    brand?.type !== "brand" ||
    brand?.slug !== "pilot" ||
    brand?.status !== "published" ||
    Number(brand?.is_public) !== 1
  )
    throw new Error("Phase 127 requires the published Pilot baseline.");
}

async function rawEntityState(client: Client, entityId: string) {
  return (
    await rows(
      client,
      `SELECT publication.status,publication.content_revision,
        (SELECT group_concat(id,'|') FROM (SELECT id FROM stories WHERE entity_id=entity.id ORDER BY id)) stories,
        (SELECT group_concat(id,'|') FROM (SELECT id FROM model_specs WHERE entity_id=entity.id ORDER BY id)) specs,
        (SELECT group_concat(id,'|') FROM (SELECT id FROM claims WHERE subject_entity_id=entity.id ORDER BY id)) claims,
        (SELECT group_concat(id,'|') FROM (SELECT id FROM entity_references WHERE entity_id=entity.id ORDER BY id)) refs,
        (SELECT group_concat(id,'|') FROM (SELECT id FROM media_assets WHERE entity_id=entity.id ORDER BY id)) media
        FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id
        WHERE entity.id=?`,
      [entityId],
    )
  )[0];
}

async function rawAliases(client: Client, entityId: string) {
  return (
    await rows(
      client,
      "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
      [entityId],
    )
  ).map((row) => String(row.alias));
}

async function rawLinks(client: Client, entityId: string) {
  return (
    await rows(
      client,
      "SELECT id FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
      [entityId, entityId],
    )
  ).map((row) => String(row.id));
}

async function inspectState(
  client: Client,
  marker: string,
  packs: LoadedCuratedEntityPack[],
): Promise<"raw" | "terminal"> {
  const pen78 = (
    await rows(client, "SELECT * FROM entities WHERE id=?", [PHASE127_78G_ID])
  )[0];
  const article = (
    await rows(client, "SELECT * FROM entities WHERE id=?", [
      PHASE127_88G_ARTICLE_ID,
    ])
  )[0];
  if (!pen78 || !article) throw new Error("Phase 127 raw donor is missing.");
  const mrTargets = await rows(
    client,
    `SELECT id,type,slug,name,source FROM entities WHERE id IN (${PHASE127_NEW_MR_IDS.map(() => "?").join(",")}) ORDER BY id`,
    [...PHASE127_NEW_MR_IDS],
  );
  if (
    pen78.type === "pen" &&
    pen78.slug === PHASE127_78G_RAW_SLUG &&
    pen78.name === PHASE127_78G_RAW_NAME &&
    pen78.source == null &&
    article.type === "pen" &&
    article.slug === PHASE127_88G_RAW_SLUG &&
    article.name === PHASE127_88G_RAW_NAME &&
    article.source == null &&
    mrTargets.length === 0
  ) {
    const state78 = await rawEntityState(client, PHASE127_78G_ID);
    const state88 = await rawEntityState(client, PHASE127_88G_ARTICLE_ID);
    if (
      Array.from(String(pen78.summary)).length !== 73 ||
      Array.from(String(pen78.body_md)).length !== 234 ||
      JSON.stringify(await rawAliases(client, PHASE127_78G_ID)) !==
        JSON.stringify(["Pilot 78G", "Pilot 78G+", "百乐 78G/78G+"].sort()) ||
      JSON.stringify(await rawLinks(client, PHASE127_78G_ID)) !==
        JSON.stringify([PHASE127_78G_REVERSE_ID, PHASE127_78G_MADE_BY_ID].sort()) ||
      state78?.status !== "draft" ||
      Number(state78?.content_revision) !== 1 ||
      state78?.stories !== "story-model-pilot-78g-research" ||
      state78?.specs !== "spec-pilot-78g-research" ||
      state78?.claims !== "claim-pilot-78g-source-boundary" ||
      state78?.refs !==
        "eref-commerce-09760cf0b902b3|reference-model-gap-lOgSh4vuQsFK-source-pilot-78g-public-search" ||
      state78?.media !== "media-commerce-7786f694f16eb1" ||
      Array.from(String(article.summary)).length !== 64 ||
      Array.from(String(article.body_md)).length !== 176 ||
      JSON.stringify(await rawAliases(client, PHASE127_88G_ARTICLE_ID)) !==
        JSON.stringify(["Pilot 88G", "百乐 88G"].sort()) ||
      JSON.stringify(await rawLinks(client, PHASE127_88G_ARTICLE_ID)) !==
        JSON.stringify(
          [
            PHASE127_88G_LEGACY_REVERSE_ID,
            PHASE127_88G_LEGACY_MADE_BY_ID,
          ].sort(),
        ) ||
      state88?.status !== "draft" ||
      Number(state88?.content_revision) !== 1 ||
      state88?.stories !== "story-model-pilot-88g-research" ||
      state88?.specs !== "spec-pilot-88g-research" ||
      state88?.claims !== "claim-pilot-88g-source-boundary" ||
      state88?.refs !==
        "eref-commerce-2eed1a621c213f|reference-model-gap-2GM0UtshoSVw-source-pilot-88g-public-search" ||
      state88?.media !== "media-commerce-f1e70594377a43"
    )
      throw new Error("Phase 127 raw payload is alternate; repair forbidden.");
    return "raw";
  }

  const byId = new Map(
    (
      await rows(
        client,
        `SELECT id,type,slug,name,source FROM entities WHERE id IN (${packs.map(() => "?").join(",")}) ORDER BY id`,
        packs.map((pack) => pack.entityId),
      )
    ).map((row) => [String(row.id), row]),
  );
  if (
    article.type !== "article" ||
    article.slug !== PHASE127_88G_ARTICLE_SLUG ||
    article.name !== PHASE127_88G_ARTICLE_NAME ||
    article.source !== marker ||
    byId.size !== packs.length
  )
    throw new Error("Phase 127 terminal state is partial or alternate.");
  for (const pack of packs) {
    const row = byId.get(pack.entityId);
    if (
      row?.type !== "pen" ||
      row?.slug !== pack.expectedSlug ||
      row?.name !== pack.canonicalName ||
      row?.source !== pack.sourceMarker
    )
      throw new Error("Phase 127 terminal pen identity is partial or alternate.");
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
  const exactSources = PHASE127_MR_LINES.map((line) =>
    sources.find((source) => source.key === `phase127-${line.key}-official`),
  );
  if (exactSources.some((source) => !source))
    throw new Error("Phase 127 guide lacks an exact MR official source.");
  const primary = exactSources[0]!;
  for (const alias of phase127Article.aliases)
    await tx.execute({
      sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,source_item_id,review_status) VALUES(?,?,?,?,?,'alias',?,'approved')",
      args: [
        stableId("phase127-guide-alias", alias),
        PHASE127_88G_ARTICLE_ID,
        alias,
        /[\u3400-\u9fff]/u.test(alias) ? "zh" : "en",
        curatedId("source-registry", primary.registryKey),
        sourceItemId(primary.key),
      ],
    });
  for (const item of sources)
    await tx.execute({
      sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')",
      args: [
        stableId("phase127-guide-reference", item.key),
        PHASE127_88G_ARTICLE_ID,
        sourceItemId(item.key),
        item.sourceType === "official"
          ? "official"
          : item.tier === "professional_secondary"
            ? "review"
            : "reference",
        item.summary,
      ],
    });
  const scopeId = stableId("phase127-guide-scope", "mr-three-lines");
  await tx.execute({
    sql: "INSERT INTO fact_scopes(id,entity_id,scope_key,valid_from,production_state,edition_scope) VALUES(?,?,?,?,'current',?)",
    args: [
      scopeId,
      PHASE127_88G_ARTICLE_ID,
      "phase127-mr-three-exact-lines",
      RETRIEVED,
      PHASE127_MR_LINES.map((line) => `${line.model}:${line.slug}`).join(" | "),
    ],
  });
  const claimId = stableId("phase127-guide-claim", "identity-boundary");
  await tx.execute({
    sql: "INSERT INTO claims(id,subject_entity_id,predicate,object_text,source_item_id,evidence_locator,confidence,review_status,fact_class) VALUES(?,?,?,?,?,?,0.99,'approved','core')",
    args: [
      claimId,
      PHASE127_88G_ARTICLE_ID,
      "collection_identity_boundary",
      "FP-MR1, FP-MR2 and FP-MR3 are separate exact Pilot China product lines; 88G is retained only as a navigation name.",
      sourceItemId(primary.key),
      "three exact official product headings and product-number boundaries",
    ],
  });
  for (const item of exactSources) {
    const citationId = stableId("phase127-guide-citation", item!.key);
    await tx.execute({
      sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,claim_id,review_status,evidence_locator,scope_id) VALUES(?,'claim',?,?,?,'approved',?,?)",
      args: [
        citationId,
        claimId,
        sourceItemId(item!.key),
        claimId,
        item!.archiveLocator ?? item!.summary,
        scopeId,
      ],
    });
    await tx.execute({
      sql: "INSERT INTO claim_evidence(id,claim_id,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,'approved')",
      args: [
        stableId("phase127-guide-evidence", item!.key),
        claimId,
        citationId,
        scopeId,
        item!.archiveLocator ?? item!.summary,
      ],
    });
  }
  await tx.execute({
    sql: "INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES(?,?,?,'overview',?,?,'published',?)",
    args: [
      stableId("phase127-guide-story", PHASE127_88G_ARTICLE_ID),
      PHASE127_88G_ARTICLE_ID,
      PHASE127_88G_ARTICLE_NAME,
      copy.summary,
      copy.bodyMd,
      copy.marker,
    ],
  });
  const diagram = sources.find((source) => source.url === phase127Article.svg);
  if (!diagram) throw new Error("Phase 127 guide diagram source is missing.");
  await tx.execute({
    sql: "INSERT INTO media_assets(id,entity_id,title,asset_type,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES(?,?,?,'diagram',?,'Fountain Pen Graph editorial','site-original',?,?,?,'approved','primary')",
    args: [
      stableId("phase127-guide-media", PHASE127_88G_ARTICLE_ID),
      PHASE127_88G_ARTICLE_ID,
      "Pilot 88G / MR exact-line map（非产品照片）",
      phase127Article.svg,
      "site-original factual SVG; non-photo, non-logo, not-to-scale, not-colour-proof, not-finish-proof.",
      phase127Article.svg,
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
  const ids = [PHASE127_88G_ARTICLE_ID, ...packs.map((pack) => pack.entityId)];
  const entities = await rows(
    client,
    `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,publication.status,publication.approved_content_hash,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id IN (${ids.map(() => "?").join(",")})`,
    ids,
  );
  if (entities.length !== ids.length)
    throw new Error("Phase 127 terminal identities are incomplete.");
  const byId = new Map(entities.map((row) => [String(row.id), row]));
  const hashes = new Map<string, string>();
  for (const id of ids) {
    const expected =
      id === PHASE127_88G_ARTICLE_ID
        ? {
            type: "article",
            slug: PHASE127_88G_ARTICLE_SLUG,
            name: PHASE127_88G_ARTICLE_NAME,
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
      throw new Error("Phase 127 terminal content/publication is invalid.");
  }
  const articleAliases = (
    await rows(
      client,
      "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
      [PHASE127_88G_ARTICLE_ID],
    )
  ).map((row) => String(row.alias));
  if (
    JSON.stringify(articleAliases) !==
    JSON.stringify([...phase127Article.aliases].sort()) ||
    (
      await rows(
        client,
        "SELECT id FROM entity_links WHERE source_id=? OR target_id=?",
        [PHASE127_88G_ARTICLE_ID, PHASE127_88G_ARTICLE_ID],
      )
    ).length !== 0
  )
    throw new Error("Phase 127 terminal article alias/topology is invalid.");
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
      Array(7).fill(PHASE127_88G_ARTICLE_ID),
    )
  )[0];
  if (
    Number(articleCounts?.stories) !== 1 ||
    Number(articleCounts?.refs) !==
      uniqueSources(packs).filter(
        (source) => source.sourceType !== "user_submission",
      ).length + 1 ||
    Number(articleCounts?.scopes) !== 1 ||
    Number(articleCounts?.claims) !== 1 ||
    Number(articleCounts?.specs) !== 0 ||
    Number(articleCounts?.variants) !== 0 ||
    Number(articleCounts?.media) !== 1
  )
    throw new Error("Phase 127 terminal article payload is not exact.");
  for (let index = 0; index < packs.length; index += 1) {
    const pack = packs[index]!;
    const line = PHASE127_LINES[index]!;
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
          (index === 0
            ? [PHASE127_78G_MADE_BY_ID, PHASE127_78G_REVERSE_ID]
            : [
                PHASE127_NEW_MADE_BY_IDS[index - 1],
                PHASE127_NEW_REVERSE_IDS[index - 1],
              ]
          ).sort(),
        ) ||
      Number(counts?.stories) !== 1 ||
      Number(counts?.refs) !== pack.sources.length ||
      Number(counts?.scopes) !== pack.scopes.length ||
      Number(counts?.claims) !== pack.claims.length ||
      Number(counts?.specs) !== 1 ||
      Number(counts?.media) !== pack.media.length ||
      Number(counts?.timeline) !== (pack.timeline?.length ?? 0)
    )
      throw new Error("Phase 127 terminal pen payload/topology is invalid.");
  }
  const brandHash = await computePublicationContentHash(client, PHASE127_PILOT_ID);
  const brand = (
    await rows(
      client,
      "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE127_PILOT_ID],
    )
  )[0];
  if (brand?.status !== "published" || brand?.approved_content_hash !== brandHash)
    throw new Error("Phase 127 terminal Pilot publication is stale.");
  return ids.map((id) => hashes.get(id)!);
}

export async function applyPhase127Pilot78G88GContent(
  client: Client,
  options: ApplyPhase127Options,
): Promise<ApplyPhase127Result> {
  const workspaceRoot = await authority(client, options);
  const copy = loadArticle(workspaceRoot);
  const packs = loadPhase127Packs(workspaceRoot);
  for (const pack of packs) validatePack(workspaceRoot, pack);
  for (const svg of [
    phase127Article.svg,
    ...packs.map((pack) => pack.media[0]!.localPath!),
  ])
    if (!fs.existsSync(path.join(workspaceRoot, "public", svg.slice(1))))
      throw new Error(`Phase 127 SVG is missing: ${svg}`);
  await baseline(client);
  const state = await inspectState(client, copy.marker, packs);
  const allEntityIds = [
    PHASE127_88G_ARTICLE_ID,
    ...packs.map((pack) => pack.entityId),
  ];
  if (state === "terminal") {
    const hashes = await terminal(client, copy.marker, packs);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      entities: allEntityIds.map((entityId, index) => ({
        entityId,
        outcome: "noop" as const,
        contentHash: hashes[index]!,
      })),
    };
  }

  const targetSlugs = [
    PHASE127_88G_ARTICLE_SLUG,
    ...packs.map((pack) => pack.expectedSlug),
  ];
  const slugOwners = await rows(
    client,
    `SELECT id,slug FROM entities WHERE slug IN (${targetSlugs.map(() => "?").join(",")}) AND id NOT IN (${allEntityIds.map(() => "?").join(",")})`,
    [...targetSlugs, ...allEntityIds],
  );
  const targetAliases = [
    ...phase127Article.aliases,
    ...packs.flatMap((pack) => pack.aliases.map((alias) => alias.alias)),
  ];
  const aliasOwners = await rows(
    client,
    `SELECT entity_id,alias FROM entity_aliases WHERE alias IN (${targetAliases.map(() => "?").join(",")}) AND entity_id NOT IN (${allEntityIds.map(() => "?").join(",")})`,
    [...targetAliases, ...allEntityIds],
  );
  if (slugOwners.length > 0 || aliasOwners.length > 0)
    throw new Error("Phase 127 target slug/alias collision; repair forbidden.");

  const protectedIds = (
    await rows(
      client,
      `SELECT DISTINCT entity.id
       FROM entities entity
       JOIN entity_links link
         ON link.source_id=entity.id AND link.link_type='made_by'
       WHERE link.target_id=?
         AND entity.id NOT IN (${allEntityIds.map(() => "?").join(",")})
       ORDER BY entity.id`,
      [PHASE127_PILOT_ID, ...allEntityIds],
    )
  ).map((row) => String(row.id));
  const protectedBefore = new Map<string, string>();
  for (const id of protectedIds)
    protectedBefore.set(id, await entityDigest(client, id));
  const brandBefore = await entityDigest(client, PHASE127_PILOT_ID, false);
  const reverseBefore = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE127_PILOT_ID],
    )
  ).map((row) => String(row.target_id));

  const nonDiagramSources = uniqueSources(packs).filter(
    (source) => source.sourceType !== "user_submission",
  );
  const guideDiagram = articleDiagram();
  const allSources = [...uniqueSources(packs), guideDiagram];
  const tx = await client.transaction("write");
  try {
    const pen78Changed = await tx.execute({
      sql: "UPDATE entities SET slug=?,name=?,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND name=?",
      args: [
        PHASE127_78G_SLUG,
        PHASE127_78G_NAME,
        PHASE127_78G_ID,
        PHASE127_78G_RAW_SLUG,
        PHASE127_78G_RAW_NAME,
      ],
    });
    if (pen78Changed.rowsAffected !== 1)
      throw new Error("Phase 127 78G donor changed before canonicalization.");

    await deletePayload(tx, PHASE127_88G_ARTICLE_ID);
    const removed = await tx.execute({
      sql: "DELETE FROM entity_links WHERE id=?",
      args: [PHASE127_88G_LEGACY_MADE_BY_ID],
    });
    const legacyRemaining = await tx.execute({
      sql: "SELECT id FROM entity_links WHERE id IN (?,?)",
      args: [
        PHASE127_88G_LEGACY_MADE_BY_ID,
        PHASE127_88G_LEGACY_REVERSE_ID,
      ],
    });
    if (removed.rowsAffected !== 1 || legacyRemaining.rows.length !== 0)
      throw new Error("Phase 127 88G legacy maker topology changed.");
    const articleChanged = await tx.execute({
      sql: "UPDATE entities SET type='article',slug=?,name=?,summary=?,body_md=?,source=?,source_url=NULL,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND name=?",
      args: [
        PHASE127_88G_ARTICLE_SLUG,
        PHASE127_88G_ARTICLE_NAME,
        copy.summary,
        copy.bodyMd,
        copy.marker,
        PHASE127_88G_ARTICLE_ID,
        PHASE127_88G_RAW_SLUG,
        PHASE127_88G_RAW_NAME,
      ],
    });
    if (articleChanged.rowsAffected !== 1)
      throw new Error("Phase 127 88G donor changed before reclassification.");

    const mrPacks = packs.filter((pack) => pack.entityId !== PHASE127_78G_ID);
    for (let index = 0; index < mrPacks.length; index += 1) {
      const pack = mrPacks[index]!;
      await tx.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [pack.entityId, pack.expectedSlug, pack.canonicalName],
      });
      await tx.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          PHASE127_NEW_MADE_BY_IDS[index],
          pack.entityId,
          PHASE127_PILOT_ID,
          `Phase 127 exact ${PHASE127_MR_LINES[index]?.model} maker relation`,
        ],
      });
    }

    const batchKey = `${PHASE127_78G_ID}:rename|${PHASE127_88G_ARTICLE_ID}:pen->article|${PHASE127_NEW_MR_IDS.join(",")}`;
    const batchId = stableId("phase127-pilot-batch", batchKey);
    await tx.execute({
      sql: "INSERT INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [
        batchId,
        batchKey,
        hash(batchKey),
        "Canonicalize FP-78G and reclassify 88G into a guide with three exact MR lines.",
      ],
    });
    for (const action of [
      {
        key: "78g-rename",
        row: PHASE127_78G_RAW_SLUG,
        kind: "rename",
        source: PHASE127_78G_ID,
        target: PHASE127_78G_ID,
        note: "Canonicalize the existing donor to official FP-78G identity.",
      },
      {
        key: "88g-guide",
        row: PHASE127_88G_RAW_SLUG,
        kind: "rename",
        source: PHASE127_88G_ARTICLE_ID,
        target: PHASE127_88G_ARTICLE_ID,
        note: "Preserve the donor ID as an MR navigation guide.",
      },
    ] as const) {
      const actionKey = `${batchKey}:${action.key}`;
      await tx.execute({
        sql: "INSERT INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,?,?,?,?,'applied',?)",
        args: [
          stableId("phase127-pilot-action", actionKey),
          batchId,
          action.row,
          action.kind,
          hash(actionKey),
          action.source,
          action.target,
          action.note,
        ],
      });
    }
    for (const pack of mrPacks) {
      const splitKey = `${batchKey}:split:${pack.entityId}`;
      await tx.execute({
        sql: "INSERT INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'split',?,?,?,'applied',?)",
        args: [
          stableId("phase127-pilot-action", splitKey),
          batchId,
          `product:${pack.entityId}`,
          hash(splitKey),
          PHASE127_88G_ARTICLE_ID,
          pack.entityId,
          "Materialize one exact official Pilot MR product line.",
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

  if ((await entityDigest(client, PHASE127_PILOT_ID, false)) !== brandBefore)
    throw new Error("Phase 127 changed Pilot non-topology payload.");
  const expectedReverse = reverseBefore
    .filter((id) => id !== PHASE127_88G_ARTICLE_ID)
    .concat(PHASE127_NEW_MR_IDS)
    .sort();
  const reverseAfter = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE127_PILOT_ID],
    )
  ).map((row) => String(row.target_id));
  if (JSON.stringify(reverseAfter) !== JSON.stringify(expectedReverse))
    throw new Error("Phase 127 reverse delta is not exact remove-one/add-three.");
  for (const id of protectedIds)
    if ((await entityDigest(client, id)) !== protectedBefore.get(id))
      throw new Error(`Phase 127 changed protected Pilot entity ${id}.`);

  const reviewer = options.reviewer.trim();
  await reviewPublish(
    client,
    PHASE127_PILOT_ID,
    reviewer,
    "Phase 127 post-topology current hash; no Pilot pack replay.",
  );
  const articleHash = await reviewPublish(
    client,
    PHASE127_88G_ARTICLE_ID,
    reviewer,
    `${copy.marker}; MR1/MR2/MR3 guide and false-single-model correction.`,
  );
  const penHashes: string[] = [];
  for (const pack of packs)
    penHashes.push(
      await reviewPublish(
        client,
        pack.entityId,
        reviewer,
        `${pack.sourceMarker}; exact product, regional and sample boundaries.`,
      ),
    );
  await terminal(client, copy.marker, packs);
  if ((await entityDigest(client, PHASE127_PILOT_ID, false)) !== brandBefore)
    throw new Error("Phase 127 replayed Pilot non-topology payload.");
  for (const id of protectedIds)
    if ((await entityDigest(client, id)) !== protectedBefore.get(id))
      throw new Error(
        `Phase 127 changed protected Pilot entity ${id} after publication.`,
      );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: [
      {
        entityId: PHASE127_88G_ARTICLE_ID,
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
  const reviewer = value("--reviewer") ?? "phase127-pilot-78g-88g";
  if (!databasePath || !ownedRoot || !protectedCatalogPath)
    throw new Error(
      "Usage: tsx scripts/apply-phase127-pilot-78g-88g-mr-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>",
    );
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    process.stdout.write(
      `${JSON.stringify(
        await applyPhase127Pilot78G88GContent(client, {
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
