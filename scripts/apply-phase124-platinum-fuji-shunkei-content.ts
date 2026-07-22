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
import type {
  ApplyPhase22Options,
  ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  loadPhase124Packs,
  PHASE124_3776_ID,
  PHASE124_ARTICLE_ID,
  PHASE124_ARTICLE_NAME,
  PHASE124_ARTICLE_SLUG,
  PHASE124_ARTICLE_SVG_PATH,
  PHASE124_BRAND_ID,
  PHASE124_CURIDAS_ID,
  PHASE124_EDITIONS,
  PHASE124_IZUMO_ARTICLE_ID,
  PHASE124_LEGACY_MADE_BY_ID,
  PHASE124_LEGACY_REVERSE_ID,
  PHASE124_NEW_MADE_BY_IDS,
  PHASE124_NEW_REVERSE_IDS,
  PHASE124_PIZ_ID,
  PHASE124_PRESIDENT_ID,
  PHASE124_PROCYON_ID,
  PHASE124_RAW_NAME,
  PHASE124_RAW_SLUG,
  PHASE124_TARGET_IDS,
  phase124FamilyArticle,
  phase124Packs,
  phase124PnbConflictSource,
  phase124SeriesSource,
} from "./data/phase124-platinum-fuji-shunkei";
import {
  curatedId,
  packId,
  type CuratedSource,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export type ApplyPhase124Options = ApplyPhase22Options;
export type ApplyPhase124Result = ApplyPhase22Result;
export {
  PHASE124_ARTICLE_ID,
  PHASE124_ARTICLE_SLUG,
  PHASE124_BRAND_ID,
  PHASE124_TARGET_IDS,
};

const ALLOWED_REPO_INPUTS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  "/Users/xz/Documents/fountain-pen-graph",
]);
const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const FAMILY_MARKDOWN =
  ".planning/content-research/platinum-fuji-shunkei-family-phase124.md";
const RETRIEVED = "2026-07-22";

function stableId(prefix: string, value: string) {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string) {
  const relative = path.relative(root, candidate);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv) {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim())
      throw new Error(
        `Phase 124 refuses inherited remote database selection: ${key}.`,
      );
  }
}

function assertVerifiedRepoPair(input: string) {
  if (!ALLOWED_REPO_INPUTS.has(input))
    throw new Error(
      "Phase 124 requires the verified CodeBuddy/Documents repo pair.",
    );
  const real = fs.realpathSync.native(input);
  let gitRoot: string;
  try {
    gitRoot = fs.realpathSync.native(
      execFileSync("git", ["-C", input, "rev-parse", "--show-toplevel"], {
        encoding: "utf8",
      }).trim(),
    );
  } catch {
    throw new Error(
      "Phase 124 could not resolve the verified CodeBuddy/Documents repo pair.",
    );
  }
  if (real !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO)
    throw new Error(
      "Phase 124 verified repo aliases must resolve to one canonical root.",
    );
  return real;
}

async function assertAuthority(client: Client, options: ApplyPhase124Options) {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim())
    throw new Error("Phase 124 reviewer must not be empty.");
  const workspaceRoot = assertVerifiedRepoPair(options.workspaceRoot);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink())
    throw new Error("Phase 124 caller-owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    !isInside(databasePath, ownedRoot)
  )
    throw new Error(
      "Phase 124 requires a regular database inside the caller-owned root.",
    );
  if (
    [protectedPath, `${protectedPath}-wal`, `${protectedPath}-shm`].includes(
      databasePath,
    )
  )
    throw new Error("Phase 124 refuses the protected catalog or sidecar path.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  )
    throw new Error(
      "Phase 124 caller-owned database must not be a hard-link alias.",
    );
  const main = (await client.execute("PRAGMA database_list")).rows.find(
    (row) => String(row.name) === "main",
  );
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath)
    throw new Error(
      "Phase 124 client/path mismatch for caller-owned database.",
    );
  let migration;
  try {
    migration = await client.execute({
      sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
      args: ["032_taxonomy_identity.sql"],
    });
  } catch {
    throw new Error("Phase 124 owned copy must be migrated through 032.");
  }
  if (migration.rows.length !== 1)
    throw new Error("Phase 124 owned copy must be migrated through 032.");
  return workspaceRoot;
}

async function jsonRows(client: Client, sql: string, args: unknown[]) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function payloadDigest(
  client: Client,
  entityId: string,
  includeTopology: boolean,
) {
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
    ...(includeTopology
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
      await jsonRows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  return JSON.stringify(payload);
}

function loadFamilyCopy(workspaceRoot: string) {
  const markdown = fs
    .readFileSync(path.resolve(workspaceRoot, FAMILY_MARKDOWN), "utf8")
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
    throw new Error("Phase 124 family reviewed copy is incomplete.");
  for (const edition of PHASE124_EDITIONS) {
    if (
      !bodyMd.includes(`/pen/platinum-fuji-shunkei-${edition.key}`) ||
      !bodyMd.includes(edition.productCode)
    )
      throw new Error("Phase 124 family copy lost its exact navigation.");
  }
  for (const token of ["PNB-13000", "Fuji Unkei", "2017—2021"])
    if (!bodyMd.includes(token))
      throw new Error("Phase 124 family copy lost its identity boundary.");
  const digest = createHash("sha256")
    .update(
      JSON.stringify({
        summary,
        bodyMd,
        editions: phase124FamilyArticle.editions,
      }),
    )
    .digest("hex");
  return {
    summary,
    bodyMd,
    sourceMarker: `${phase124FamilyArticle.sourceMarkerPrefix}${digest}`,
  };
}

async function assertBaseline(client: Client) {
  const expected = [
    [PHASE124_BRAND_ID, "brand", "platinum", "curated-content:phase78-platinum-brand-v1:"],
    [PHASE124_3776_ID, "pen", "platinum-3776-century", ""],
    [PHASE124_CURIDAS_ID, "pen", "platinum-curidas", "curated-content:phase78-platinum-curidas-v1:"],
    [PHASE124_PROCYON_ID, "pen", "platinum-procyon-pns-5000", "curated-content:phase121-platinum-procyon-pns-5000-v1:"],
    [PHASE124_PRESIDENT_ID, "pen", "platinum-president-ptb-20000p", "curated-content:phase122-platinum-president-ptb-20000p-v1:"],
    [PHASE124_IZUMO_ARTICLE_ID, "article", "platinum-izumo", "curated:phase123:platinum-izumo-family:"],
    [PHASE124_PIZ_ID, "pen", "platinum-izumo-piz-80000n", "curated-content:phase123-platinum-izumo-piz-80000n-v1:"],
  ] as const;
  const result = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.source,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id IN (${expected.map(() => "?").join(",")})`,
    args: expected.map(([id]) => id),
  });
  if (result.rows.length !== expected.length)
    throw new Error(
      "Phase 124 requires exact Phase 42/78/121/122/123 Platinum prerequisites.",
    );
  const byId = new Map(result.rows.map((row) => [String(row.id), row]));
  for (const [id, type, slug, marker] of expected) {
    const row = byId.get(id);
    if (
      !row ||
      row.type !== type ||
      row.slug !== slug ||
      row.status !== "published" ||
      Number(row.is_public) !== 1 ||
      (marker && !String(row.source).startsWith(marker))
    )
      throw new Error(`Phase 124 prerequisite mismatch for ${id}.`);
  }
}

function sourceItemId(key: string) {
  return curatedId("source-item", key);
}

function reliability(source: CuratedSource) {
  if (source.sourceType === "official") return "official_marketing";
  if (source.tier === "professional_secondary")
    return "high_for_model_history";
  if (source.tier === "community") return "community_opinion";
  if (source.tier === "retailer") return "medium";
  return "medium";
}

async function inspectState(
  client: Client,
  articleMarker: string,
  packs: LoadedCuratedEntityPack[],
): Promise<"raw" | "terminal"> {
  const ids = [PHASE124_ARTICLE_ID, ...PHASE124_TARGET_IDS];
  const target = await client.execute({
    sql: `SELECT id,type,slug,name,source,source_url,summary,body_md FROM entities WHERE id IN (${ids.map(() => "?").join(",")}) ORDER BY id`,
    args: ids,
  });
  const article = target.rows.find((row) => row.id === PHASE124_ARTICLE_ID);
  if (!article) throw new Error("Phase 124 donor article identity is missing.");
  const sourceUrls = [...new Set(phase124Packs.flatMap((pack) => pack.sources.map((source) => source.url)))];
  const urlOwners = await client.execute({
    sql: `SELECT DISTINCT reference.entity_id FROM entity_references reference JOIN source_items item ON item.id=reference.source_item_id WHERE item.url IN (${sourceUrls.map(() => "?").join(",")}) ORDER BY reference.entity_id`,
    args: sourceUrls,
  });
  const allowedOwners = new Set([
    PHASE124_ARTICLE_ID,
    PHASE124_3776_ID,
    PHASE124_BRAND_ID,
    PHASE124_CURIDAS_ID,
    PHASE124_PROCYON_ID,
    PHASE124_PRESIDENT_ID,
    PHASE124_IZUMO_ARTICLE_ID,
    PHASE124_PIZ_ID,
    ...PHASE124_TARGET_IDS,
  ]);
  if (
    urlOwners.rows.some((row) => !allowedOwners.has(String(row.entity_id)))
  )
    throw new Error("Phase 124 found alternate source URL owner.");

  const slugs = [PHASE124_RAW_SLUG, PHASE124_ARTICLE_SLUG, ...packs.map((pack) => pack.expectedSlug)];
  const names = [PHASE124_RAW_NAME, PHASE124_ARTICLE_NAME, ...packs.map((pack) => pack.canonicalName)];
  const collisions = await client.execute({
    sql: `SELECT DISTINCT entity.id FROM entities entity LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id WHERE entity.id IN (${ids.map(() => "?").join(",")}) OR entity.slug IN (${slugs.map(() => "?").join(",")}) OR lower(entity.name) IN (${names.map(() => "lower(?)").join(",")}) OR lower(COALESCE(alias.alias,'')) IN (${names.map(() => "lower(?)").join(",")}) OR entity.source LIKE 'curated%phase124%fuji%shunkei%'`,
    args: [...ids, ...slugs, ...names, ...names],
  });
  if (
    collisions.rows.some((row) => !ids.includes(String(row.id)))
  )
    throw new Error("Phase 124 found alternate Fuji Shunkei identity or alias.");

  const penRows = target.rows.filter((row) => row.id !== PHASE124_ARTICLE_ID);
  if (
    article.type === "pen" &&
    article.slug === PHASE124_RAW_SLUG &&
    article.name === PHASE124_RAW_NAME &&
    article.source == null &&
    penRows.length === 0
  ) {
    const raw = (
      await client.execute({
        sql: `SELECT publication.status,publication.approved_content_hash,
          (SELECT count(*) FROM public_entities WHERE id=entity.id) AS is_public,
          (SELECT group_concat(id||':'||alias||':'||language,'|') FROM (SELECT id,alias,language FROM entity_aliases WHERE entity_id=entity.id ORDER BY id)) AS aliases,
          (SELECT group_concat(id||':'||source_id||':'||target_id||':'||link_type,'|') FROM (SELECT id,source_id,target_id,link_type FROM entity_links WHERE source_id=entity.id OR target_id=entity.id ORDER BY id)) AS links,
          (SELECT group_concat(id,'|') FROM (SELECT id FROM stories WHERE entity_id=entity.id ORDER BY id)) AS stories,
          (SELECT group_concat(id,'|') FROM (SELECT id FROM model_specs WHERE entity_id=entity.id ORDER BY id)) AS specs,
          (SELECT group_concat(id,'|') FROM (SELECT id FROM claims WHERE subject_entity_id=entity.id ORDER BY id)) AS claims,
          (SELECT group_concat(id,'|') FROM (SELECT id FROM entity_references WHERE entity_id=entity.id ORDER BY id)) AS refs,
          (SELECT group_concat(id,'|') FROM (SELECT id FROM media_assets WHERE entity_id=entity.id ORDER BY id)) AS media
          FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id WHERE entity.id=?`,
        args: [PHASE124_ARTICLE_ID],
      })
    ).rows[0];
    const expectedAliases =
      "alias-ogo1UmxmcXJT-en-Platinum Fuji Shunkei:Platinum Fuji Shunkei:en|alias-ogo1UmxmcXJT-en-Platinum PNB-13000:Platinum PNB-13000:en|alias-ogo1UmxmcXJT-zh-白金 富士旬景 PNB-13000:白金 富士旬景 PNB-13000:zh";
    const expectedLinks = `${PHASE124_LEGACY_MADE_BY_ID}:${PHASE124_ARTICLE_ID}:${PHASE124_BRAND_ID}:made_by|${PHASE124_LEGACY_REVERSE_ID}:${PHASE124_BRAND_ID}:${PHASE124_ARTICLE_ID}:reverse`;
    if (
      Array.from(String(article.summary)).length !== 98 ||
      Array.from(String(article.body_md)).length !== 223 ||
      article.source_url != null ||
      raw?.status !== "draft" ||
      raw?.approved_content_hash != null ||
      Number(raw?.is_public) !== 0 ||
      raw?.aliases !== expectedAliases ||
      raw?.links !== expectedLinks ||
      raw?.stories !==
        "story-model-platinum-fuji-shunkei-pnb13000-research" ||
      raw?.specs !== "spec-platinum-fuji-shunkei-pnb13000-research" ||
      raw?.claims !==
        "claim-platinum-fuji-shunkei-pnb13000-source-boundary" ||
      raw?.refs !==
        "eref-commerce-ba2774006f0f97|reference-model-gap-ogo1UmxmcXJT-source-platinum-fuji-shunkei-pnb13000-public-search" ||
      raw?.media !== "media-commerce-b7110f8db39036"
    )
      throw new Error(
        "Phase 124 raw payload/topology inventory is alternate; automatic repair is forbidden.",
      );
    if (
      (
        await client.execute({
          sql: "SELECT 1 FROM entity_redirects WHERE source_path IN (?,?)",
          args: [
            `/pen/${PHASE124_RAW_SLUG}`,
            `/article/${PHASE124_ARTICLE_SLUG}`,
          ],
        })
      ).rows.length
    )
      throw new Error("Phase 124 raw redirect state is alternate.");
    const phaseSourceIds = [
      ...new Set(
        phase124Packs.flatMap((pack) =>
          pack.sources.map((source) => sourceItemId(source.key)),
        ),
      ),
    ];
    if (
      (
        await client.execute({
          sql: `SELECT 1 FROM source_items WHERE id IN (${phaseSourceIds.map(() => "?").join(",")})`,
          args: phaseSourceIds,
        })
      ).rows.length
    )
      throw new Error(
        "Phase 124 source items exist in raw state; repair is forbidden.",
      );
    return "raw";
  }

  if (
    article.type !== "article" ||
    article.slug !== PHASE124_ARTICLE_SLUG ||
    article.name !== PHASE124_ARTICLE_NAME ||
    article.source !== articleMarker ||
    penRows.length !== packs.length
  )
    throw new Error(
      "Phase 124 target is partial or alternate; automatic repair is forbidden.",
    );
  const byId = new Map(penRows.map((row) => [String(row.id), row]));
  for (const pack of packs) {
    const row = byId.get(pack.entityId);
    if (
      !row ||
      row.type !== "pen" ||
      row.slug !== pack.expectedSlug ||
      row.name !== pack.canonicalName ||
      row.source !== pack.sourceMarker
    )
      throw new Error(
        "Phase 124 target is partial or alternate; automatic repair is forbidden.",
      );
  }
  return "terminal";
}

async function upsertSource(tx: Transaction, source: CuratedSource) {
  await tx.execute({
    sql: `INSERT INTO source_registry(id,name,source_type,allowed_use,reliability,license,attribution,homepage_url,fetch_method,notes,last_checked_at,default_source_tier,default_independence_group) VALUES(?,?,?,?,?,?,?,?, 'manual',?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,last_checked_at=excluded.last_checked_at,updated_at=datetime('now')`,
    args: [
      curatedId("source-registry", source.registryKey),
      source.registryName,
      source.sourceType,
      source.allowedUse,
      reliability(source),
      source.license ?? null,
      source.author ?? null,
      source.homepageUrl,
      `Phase 124 source: ${source.registryKey}`,
      source.retrievedAt,
      source.tier,
      source.independenceGroup,
    ],
  });
  await tx.execute({
    sql: `INSERT INTO source_items(id,source_id,title,url,item_type,license,author,published_at,retrieved_at,summary,raw_metadata_json,allowed_use,review_status,source_tier,independence_group,archive_url,archive_locator) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,'approved',?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,url=excluded.url,summary=excluded.summary,archive_locator=excluded.archive_locator,review_status='approved',updated_at=datetime('now')`,
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
      JSON.stringify({ curatedSourceKey: source.key, phase: 124 }),
      source.allowedUse,
      source.tier,
      source.independenceGroup,
      source.archiveUrl ?? null,
      source.archiveLocator ?? null,
    ],
  });
}

async function deleteOwnedPayload(tx: Transaction, entityId: string) {
  await tx.execute({
    sql: "DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)",
    args: [entityId],
  });
  await tx.execute({
    sql: "DELETE FROM citations WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?) OR (target_type='model_spec' AND target_id IN (SELECT id FROM model_specs WHERE entity_id=?))",
    args: [entityId, entityId],
  });
  await tx.execute({
    sql: "DELETE FROM spec_field_evidence WHERE model_spec_id IN (SELECT id FROM model_specs WHERE entity_id=?)",
    args: [entityId],
  });
  for (const [table, column] of [
    ["entity_references", "entity_id"],
    ["stories", "entity_id"],
    ["entity_aliases", "entity_id"],
    ["claims", "subject_entity_id"],
    ["fact_scopes", "entity_id"],
    ["model_variants", "model_entity_id"],
    ["model_specs", "entity_id"],
    ["timeline_events", "entity_id"],
    ["media_assets", "entity_id"],
  ] as const)
    await tx.execute({
      sql: `DELETE FROM ${table} WHERE ${column}=?`,
      args: [entityId],
    });
}

async function installPenPack(
  tx: Transaction,
  pack: LoadedCuratedEntityPack,
) {
  for (const source of pack.sources) await upsertSource(tx, source);
  const changed = await tx.execute({
    sql: "UPDATE entities SET name=?,summary=?,body_md=?,source=?,source_url=NULL,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=?",
    args: [
      pack.canonicalName,
      pack.summary,
      pack.bodyMd,
      pack.sourceMarker,
      pack.entityId,
      pack.expectedSlug,
    ],
  });
  if (changed.rowsAffected !== 1)
    throw new Error(`Phase 124 could not install ${pack.entityId}.`);
  await tx.execute({
    sql: "UPDATE entity_publications SET depth_tier=? WHERE entity_id=?",
    args: [pack.depthTier, pack.entityId],
  });
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
  for (const source of pack.sources)
    await tx.execute({
      sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')",
      args: [
        packId(pack, "reference", source.key),
        pack.entityId,
        sourceItemId(source.key),
        source.sourceType === "official"
          ? "official"
          : source.tier === "professional_secondary"
            ? "review"
            : "reference",
        source.summary,
      ],
    });
  for (const alias of pack.aliases) {
    const source = pack.sources.find((item) => item.key === alias.sourceKey);
    if (!source)
      throw new Error(`Phase 124 alias source missing: ${alias.sourceKey}`);
    await tx.execute({
      sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,market,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?,'approved')",
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
  const variantIds = new Map<string, string>();
  for (const variant of pack.variants ?? []) {
    const id = packId(pack, "variant", variant.key);
    variantIds.set(variant.key, id);
    await tx.execute({
      sql: "INSERT INTO model_variants(id,model_entity_id,variant_name,release_year,notes,source_item_id,review_status,variant_kind,parent_variant_id,product_code,market) VALUES(?,?,?,?,?,?,'approved',?,?,?,?)",
      args: [
        id,
        pack.entityId,
        variant.name,
        variant.releaseYear ?? null,
        variant.notes,
        sourceItemId(variant.sourceKey),
        variant.variantKind ?? "variant",
        variant.parentVariantKey
          ? variantIds.get(variant.parentVariantKey) ?? null
          : null,
        variant.productCode ?? null,
        variant.market ?? null,
      ],
    });
  }
  const scopeIds = new Map<string, string>();
  for (const scope of pack.scopes) {
    const id = packId(pack, "scope", scope.key);
    scopeIds.set(scope.scopeKey, id);
    await tx.execute({
      sql: "INSERT INTO fact_scopes(id,entity_id,variant_id,scope_key,market,valid_from,valid_to,production_state,nib_scope,material_scope,edition_scope) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
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
      sql: "INSERT INTO claims(id,subject_entity_id,predicate,object_text,source_item_id,evidence_locator,confidence,review_status,fact_class) VALUES(?,?,?,?,?,?,?,'approved',?)",
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
      if (!scopeId)
        throw new Error(`Phase 124 claim scope missing: ${item.scopeKey}`);
      const citationId = packId(pack, "claim-citation", item.key);
      await tx.execute({
        sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,claim_id,note,review_status,evidence_locator,scope_id) VALUES(?,'claim',?,?,?,?,'approved',?,?)",
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
      await tx.execute({
        sql: "INSERT INTO claim_evidence(id,claim_id,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,'approved')",
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
  if (!pack.spec)
    throw new Error(`Phase 124 ${pack.entityId} requires model specs.`);
  const specId = packId(pack, "model-spec", "approved");
  const values = pack.spec.values;
  await tx.execute({
    sql: "INSERT INTO model_specs(id,entity_id,brand_entity_id,series_name,release_year,origin_country,nib,fill_system,material,dimensions,weight,price_range,status,review_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,'approved')",
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
  for (const item of pack.spec.evidence) {
    const scopeId = scopeIds.get(item.scopeKey);
    if (!scopeId)
      throw new Error(`Phase 124 spec scope missing: ${item.scopeKey}`);
    const citationId = packId(pack, "spec-citation", item.key);
    await tx.execute({
      sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,note,review_status,evidence_locator,scope_id) VALUES(?,'model_spec',?,?,?,'approved',?,?)",
      args: [
        citationId,
        specId,
        sourceItemId(item.sourceKey),
        item.note ?? null,
        item.locator,
        scopeId,
      ],
    });
    await tx.execute({
      sql: "INSERT INTO spec_field_evidence(id,model_spec_id,field_key,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,?,?)",
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
  for (const event of pack.timeline ?? [])
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
        sourceItemId(event.sourceKey),
      ],
    });
  for (const media of pack.media)
    await tx.execute({
      sql: "INSERT INTO media_assets(id,entity_id,title,asset_type,image_url,thumbnail_url,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES(?,? ,?,'image',?,?,?,?,?,?,?,?, 'approved',?)",
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

async function installArticle(
  tx: Transaction,
  copy: ReturnType<typeof loadFamilyCopy>,
) {
  await upsertSource(tx, phase124SeriesSource);
  await upsertSource(tx, phase124PnbConflictSource);
  const diagram: CuratedSource = {
    key: "phase124-family-boundary-svg",
    registryKey: "fountain-pen-graph-editorial-phase124",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase124",
    title: "Fuji Shunkei five-edition identity map",
    url: PHASE124_ARTICLE_SVG_PATH,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "Original factual SVG showing the exact five-edition chronology and the PNB-13000/Fuji Unkei boundaries.",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: PHASE124_ARTICLE_SVG_PATH,
    archiveLocator: `project-public-asset:${PHASE124_ARTICLE_SVG_PATH};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
  };
  await upsertSource(tx, diagram);
  await tx.execute({
    sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,source_item_id,review_status) VALUES(?,?,?,?,?,'alias',?,'approved')",
    args: [
      "alias-ogo1UmxmcXJT-en-Platinum Fuji Shunkei",
      PHASE124_ARTICLE_ID,
      "Platinum Fuji Shunkei",
      "en",
      curatedId("source-registry", phase124SeriesSource.registryKey),
      sourceItemId(phase124SeriesSource.key),
    ],
  });
  for (const source of [phase124SeriesSource, phase124PnbConflictSource])
    await tx.execute({
      sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')",
      args: [
        stableId("phase124-family-reference", source.key),
        PHASE124_ARTICLE_ID,
        sourceItemId(source.key),
        "official",
        source.summary,
      ],
    });
  const seriesScopeId = stableId("phase124-family-scope", "series");
  const conflictScopeId = stableId("phase124-family-scope", "pnb13000");
  await tx.execute({
    sql: "INSERT INTO fact_scopes(id,entity_id,scope_key,valid_from,valid_to,production_state,edition_scope) VALUES(?,?,?,'2017','2021-12-31','historical',?)",
    args: [
      seriesScopeId,
      PHASE124_ARTICLE_ID,
      "phase124-fuji-shunkei-series-2017-2021",
      phase124FamilyArticle.editions.join(" | "),
    ],
  });
  await tx.execute({
    sql: "INSERT INTO fact_scopes(id,entity_id,scope_key,valid_from,production_state,edition_scope) VALUES(?,?,?,'2018-11-10','historical',?)",
    args: [
      conflictScopeId,
      PHASE124_ARTICLE_ID,
      "phase124-pnb13000-standard-3776-conflict",
      "PNB-13000 is standard #3776 Century Chenonceau White / Laurel Green; rejected as Fuji Shunkei identity.",
    ],
  });
  for (const [key, predicate, objectText, source, scopeId, locator] of [
    [
      "lineup",
      "series_chronology",
      phase124FamilyArticle.editions.join(" | "),
      phase124SeriesSource,
      seriesScopeId,
      "PDF page 1: Fuji Shunkei 2017–2021 followed by Fuji Unkei in 2023",
    ],
    [
      "pnb13000",
      "identity_conflict",
      "PNB-13000 belongs to standard #3776 Century Chenonceau White / Laurel Green, not Fuji Shunkei.",
      phase124PnbConflictSource,
      conflictScopeId,
      "PNB-13000; #2 Chenonceau White / #41 Laurel Green; 2018-11-10",
    ],
  ] as const) {
    const claimId = stableId("phase124-family-claim", key);
    const citationId = stableId("phase124-family-citation", key);
    await tx.execute({
      sql: "INSERT INTO claims(id,subject_entity_id,predicate,object_text,source_item_id,evidence_locator,confidence,review_status,fact_class) VALUES(?,?,?,?,?,?,0.99,'approved','core')",
      args: [
        claimId,
        PHASE124_ARTICLE_ID,
        predicate,
        objectText,
        sourceItemId(source.key),
        locator,
      ],
    });
    await tx.execute({
      sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,claim_id,review_status,evidence_locator,scope_id) VALUES(?,'claim',?,?,?,'approved',?,?)",
      args: [
        citationId,
        claimId,
        sourceItemId(source.key),
        claimId,
        locator,
        scopeId,
      ],
    });
    await tx.execute({
      sql: "INSERT INTO claim_evidence(id,claim_id,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,'approved')",
      args: [
        stableId("phase124-family-evidence", key),
        claimId,
        citationId,
        scopeId,
        locator,
      ],
    });
  }
  await tx.execute({
    sql: "INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES(?,?,?,'overview',?,?,'published',?)",
    args: [
      stableId("phase124-family-story", PHASE124_ARTICLE_ID),
      PHASE124_ARTICLE_ID,
      PHASE124_ARTICLE_NAME,
      copy.summary,
      copy.bodyMd,
      copy.sourceMarker,
    ],
  });
  await tx.execute({
    sql: "INSERT INTO media_assets(id,entity_id,title,asset_type,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES(?,?,?,'diagram',?,'Fountain Pen Graph editorial','site-original',?,?,?,'approved','primary')",
    args: [
      stableId("phase124-family-media", PHASE124_ARTICLE_ID),
      PHASE124_ARTICLE_ID,
      "Fuji Shunkei five-edition identity map",
      PHASE124_ARTICLE_SVG_PATH,
      "site-original factual SVG; non-photo, non-logo, not-to-scale, not-colour-proof, not-finish-proof.",
      PHASE124_ARTICLE_SVG_PATH,
      sourceItemId(diagram.key),
    ],
  });
}

async function reviewAndPublish(
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

async function assertTerminal(
  client: Client,
  articleMarker: string,
  packs: LoadedCuratedEntityPack[],
) {
  const identities = [
    {
      id: PHASE124_ARTICLE_ID,
      type: "article",
      slug: PHASE124_ARTICLE_SLUG,
      name: PHASE124_ARTICLE_NAME,
      marker: articleMarker,
    },
    ...packs.map((pack) => ({
      id: pack.entityId,
      type: "pen",
      slug: pack.expectedSlug,
      name: pack.canonicalName,
      marker: pack.sourceMarker,
    })),
  ];
  const rows = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,entity.summary,entity.body_md,publication.status,publication.approved_content_hash,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id IN (${identities.map(() => "?").join(",")}) ORDER BY entity.id`,
    args: identities.map((item) => item.id),
  });
  if (rows.rows.length !== identities.length)
    throw new Error("Phase 124 terminal identities are incomplete.");
  const byId = new Map(rows.rows.map((row) => [String(row.id), row]));
  const hashes = new Map<string, string>();
  for (const expected of identities) {
    const row = byId.get(expected.id);
    const hash = await computePublicationContentHash(client, expected.id);
    hashes.set(expected.id, hash);
    if (
      !row ||
      row.type !== expected.type ||
      row.slug !== expected.slug ||
      row.name !== expected.name ||
      row.source !== expected.marker ||
      row.status !== "published" ||
      row.approved_content_hash !== hash ||
      Number(row.is_public) !== 1 ||
      Array.from(String(row.summary)).length < 60 ||
      Array.from(String(row.summary)).length > 160 ||
      Array.from(String(row.body_md)).length < 2_000
    )
      throw new Error(
        "Phase 124 terminal identity/content/publication is invalid; automatic repair is forbidden.",
      );
    const reviews = await client.execute({
      sql: "SELECT count(*) AS count FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')",
      args: [expected.id, hash],
    });
    if (Number(reviews.rows[0]?.count) !== 4)
      throw new Error("Phase 124 terminal current-hash reviews are invalid.");
  }
  const articleBody = String(byId.get(PHASE124_ARTICLE_ID)?.body_md);
  for (const pack of packs) {
    if (
      !articleBody.includes(`/pen/${pack.expectedSlug}`) ||
      !String(byId.get(pack.entityId)?.body_md).includes(
        `/article/${PHASE124_ARTICLE_SLUG}`,
      )
    )
      throw new Error("Phase 124 canonical cross-links are invalid.");
  }
  const articleCounts = (
    await client.execute({
      sql: `SELECT (SELECT count(*) FROM entity_links WHERE source_id=? OR target_id=?) AS topology,(SELECT count(*) FROM model_specs WHERE entity_id=?) AS specs,(SELECT count(*) FROM model_variants WHERE model_entity_id=?) AS variants,(SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,(SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,(SELECT count(*) FROM entity_references WHERE entity_id=?) AS refs,(SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS media`,
      args: [
        PHASE124_ARTICLE_ID,
        PHASE124_ARTICLE_ID,
        PHASE124_ARTICLE_ID,
        PHASE124_ARTICLE_ID,
        PHASE124_ARTICLE_ID,
        PHASE124_ARTICLE_ID,
        PHASE124_ARTICLE_ID,
        PHASE124_ARTICLE_ID,
      ],
    })
  ).rows[0];
  if (
    Number(articleCounts?.topology) !== 0 ||
    Number(articleCounts?.specs) !== 0 ||
    Number(articleCounts?.variants) !== 0 ||
    Number(articleCounts?.scopes) !== 2 ||
    Number(articleCounts?.claims) !== 2 ||
    Number(articleCounts?.refs) !== 2 ||
    Number(articleCounts?.media) !== 1
  )
    throw new Error("Phase 124 terminal article payload is invalid.");
  const aliases = (
    await client.execute({
      sql: "SELECT alias,language FROM entity_aliases WHERE entity_id=? ORDER BY alias",
      args: [PHASE124_ARTICLE_ID],
    })
  ).rows.map((row) => [String(row.alias), String(row.language)]);
  if (
    JSON.stringify(aliases) !==
    JSON.stringify([["Platinum Fuji Shunkei", "en"]])
  )
    throw new Error(
      "Phase 124 terminal article retained false PNB-13000 aliases.",
    );

  for (let index = 0; index < packs.length; index += 1) {
    const pack = packs[index];
    const edition = PHASE124_EDITIONS[index];
    if (!pack || !edition)
      throw new Error("Phase 124 pack/edition ordering changed.");
    const topology = await client.execute({
      sql: "SELECT id,source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id",
      args: [pack.entityId, pack.entityId],
    });
    if (
      JSON.stringify(
        topology.rows.map((row) => [
          row.id,
          row.source_id,
          row.target_id,
          row.link_type,
        ]),
      ) !==
      JSON.stringify([
        [
          PHASE124_NEW_MADE_BY_IDS[index],
          pack.entityId,
          PHASE124_BRAND_ID,
          "made_by",
        ],
        [
          PHASE124_NEW_REVERSE_IDS[index],
          PHASE124_BRAND_ID,
          pack.entityId,
          "reverse",
        ],
      ])
    )
      throw new Error(`Phase 124 ${pack.entityId} topology is invalid.`);
    const variants = (
      await client.execute({
        sql: "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
        args: [pack.entityId],
      })
    ).rows.map((row) => String(row.variant_name));
    if (
      JSON.stringify(variants) !== JSON.stringify([...edition.nibs].sort())
    )
      throw new Error(`Phase 124 ${pack.entityId} variant set is invalid.`);
    const counts = (
      await client.execute({
        sql: `SELECT (SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,(SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,(SELECT count(*) FROM entity_references WHERE entity_id=?) AS refs,(SELECT count(*) FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='rejected') AS rejected,(SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS media`,
        args: [
          pack.entityId,
          pack.entityId,
          pack.entityId,
          pack.entityId,
          pack.entityId,
        ],
      })
    ).rows[0];
    const isKinshu = edition.key === "kinshu";
    if (
      Number(counts?.scopes) !== (isKinshu ? 5 : 4) ||
      Number(counts?.claims) !== 3 ||
      Number(counts?.refs) !== (isKinshu ? 6 : 5) ||
      Number(counts?.rejected) !== (isKinshu ? 4 : 3) ||
      Number(counts?.media) !== 1
    )
      throw new Error(
        `Phase 124 ${pack.entityId} scope/evidence/media is invalid.`,
      );
  }
  const brandHash = await computePublicationContentHash(
    client,
    PHASE124_BRAND_ID,
  );
  const brand = (
    await client.execute({
      sql: "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      args: [PHASE124_BRAND_ID],
    })
  ).rows[0];
  if (
    brand?.status !== "published" ||
    brand.approved_content_hash !== brandHash
  )
    throw new Error(
      "Phase 124 terminal Platinum post-topology publication is invalid.",
    );
  return identities.map((item) => hashes.get(item.id)!);
}

export async function applyPhase124PlatinumFujiShunkeiContent(
  client: Client,
  options: ApplyPhase124Options,
): Promise<ApplyPhase124Result> {
  const workspaceRoot = await assertAuthority(client, options);
  const family = loadFamilyCopy(workspaceRoot);
  const packs = loadPhase124Packs(workspaceRoot);
  await assertBaseline(client);
  const state = await inspectState(client, family.sourceMarker, packs);
  if (state === "terminal") {
    const hashes = await assertTerminal(client, family.sourceMarker, packs);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      entities: [PHASE124_ARTICLE_ID, ...packs.map((pack) => pack.entityId)].map(
        (entityId, index) => ({
          entityId,
          outcome: "noop" as const,
          contentHash: hashes[index]!,
        }),
      ),
    };
  }

  const protectedIds = [
    PHASE124_3776_ID,
    PHASE124_CURIDAS_ID,
    PHASE124_PROCYON_ID,
    PHASE124_PRESIDENT_ID,
    PHASE124_IZUMO_ARTICLE_ID,
    PHASE124_PIZ_ID,
  ];
  const protectedBefore = new Map<string, string>();
  for (const id of protectedIds)
    protectedBefore.set(id, await payloadDigest(client, id, true));
  const brandPayloadBefore = await payloadDigest(
    client,
    PHASE124_BRAND_ID,
    false,
  );
  const brandHashBefore = await computePublicationContentHash(
    client,
    PHASE124_BRAND_ID,
  );
  const reverseBefore = await jsonRows(
    client,
    "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
    [PHASE124_BRAND_ID],
  );

  const tx = await client.transaction("write");
  try {
    await deleteOwnedPayload(tx, PHASE124_ARTICLE_ID);
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE id IN (?,?)",
      args: [PHASE124_LEGACY_MADE_BY_ID, PHASE124_LEGACY_REVERSE_ID],
    });
    const changed = await tx.execute({
      sql: "UPDATE entities SET type='article',slug=?,name=?,summary=?,body_md=?,source=?,source_url=NULL,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND name=?",
      args: [
        PHASE124_ARTICLE_SLUG,
        PHASE124_ARTICLE_NAME,
        family.summary,
        family.bodyMd,
        family.sourceMarker,
        PHASE124_ARTICLE_ID,
        PHASE124_RAW_SLUG,
        PHASE124_RAW_NAME,
      ],
    });
    if (changed.rowsAffected !== 1)
      throw new Error(
        "Phase 124 donor changed before atomic reclassification.",
      );
    for (let index = 0; index < packs.length; index += 1) {
      const pack = packs[index];
      const madeById = PHASE124_NEW_MADE_BY_IDS[index];
      if (!pack || !madeById)
        throw new Error("Phase 124 pack/topology ordering changed.");
      await tx.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [pack.entityId, pack.expectedSlug, pack.canonicalName],
      });
      await tx.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          madeById,
          pack.entityId,
          PHASE124_BRAND_ID,
          `Phase 124 exact ${PHASE124_EDITIONS[index]?.productCode} maker relation`,
        ],
      });
    }
    const batchKey = `${PHASE124_ARTICLE_ID}:pen->article:${PHASE124_TARGET_IDS.join(",")}`;
    const batchChecksum = createHash("sha256")
      .update(batchKey)
      .digest("hex");
    const batchId = stableId("phase124-fuji-shunkei-batch", batchKey);
    await tx.execute({
      sql: "INSERT INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [
        batchId,
        batchKey,
        batchChecksum,
        "Same-ID Fuji Shunkei family article plus five exact official editions.",
      ],
    });
    const renameKey = `${batchKey}:rename`;
    await tx.execute({
      sql: "INSERT INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'rename',?,?,?,'applied',?)",
      args: [
        stableId("phase124-fuji-shunkei-action", renameKey),
        batchId,
        PHASE124_RAW_SLUG,
        createHash("sha256").update(renameKey).digest("hex"),
        PHASE124_ARTICLE_ID,
        PHASE124_ARTICLE_ID,
        "Preserve donor ID while removing false PNB-13000 aliases.",
      ],
    });
    for (const pack of packs) {
      const splitKey = `${batchKey}:split:${pack.entityId}`;
      await tx.execute({
        sql: "INSERT INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'split',?,?,?,'applied',?)",
        args: [
          stableId("phase124-fuji-shunkei-action", splitKey),
          batchId,
          `edition:${pack.entityId}`,
          createHash("sha256").update(splitKey).digest("hex"),
          PHASE124_ARTICLE_ID,
          pack.entityId,
          "Materialize one exact official Fuji Shunkei edition.",
        ],
      });
    }
    await installArticle(tx, family);
    for (const pack of packs) await installPenPack(tx, pack);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }

  if (
    (await payloadDigest(client, PHASE124_BRAND_ID, false)) !==
    brandPayloadBefore
  )
    throw new Error("Phase 124 changed Platinum non-topology payload.");
  for (const id of protectedIds)
    if ((await payloadDigest(client, id, true)) !== protectedBefore.get(id))
      throw new Error(`Phase 124 changed protected entity ${id}.`);
  const reverseAfter = await jsonRows(
    client,
    "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
    [PHASE124_BRAND_ID],
  );
  const expectedReverse = reverseBefore
    .map((row) => String(row.target_id))
    .filter((id) => id !== PHASE124_ARTICLE_ID)
    .concat(PHASE124_TARGET_IDS)
    .sort();
  if (
    JSON.stringify(reverseAfter.map((row) => String(row.target_id))) !==
    JSON.stringify(expectedReverse)
  )
    throw new Error(
      "Phase 124 Platinum reverse delta is not exact remove-one/add-five.",
    );
  const brandHashAfter = await computePublicationContentHash(
    client,
    PHASE124_BRAND_ID,
  );
  if (brandHashAfter === brandHashBefore)
    throw new Error("Phase 124 expected post-topology Platinum hash change.");
  await reviewAndPublish(
    client,
    PHASE124_BRAND_ID,
    options.reviewer.trim(),
    "Phase 124 post-topology current hash; no Platinum pack replay.",
  );
  const articleHash = await reviewAndPublish(
    client,
    PHASE124_ARTICLE_ID,
    options.reviewer.trim(),
    `${family.sourceMarker}; exact five-edition navigation and PNB-13000 correction.`,
  );
  const penHashes: string[] = [];
  for (const pack of packs)
    penHashes.push(
      await reviewAndPublish(
        client,
        pack.entityId,
        options.reviewer.trim(),
        `${pack.sourceMarker}; exact official edition and sample boundaries.`,
      ),
    );
  await assertTerminal(client, family.sourceMarker, packs);
  if (
    (await payloadDigest(client, PHASE124_BRAND_ID, false)) !==
    brandPayloadBefore
  )
    throw new Error(
      "Phase 124 replayed or changed Platinum non-topology payload.",
    );
  for (const id of protectedIds)
    if ((await payloadDigest(client, id, true)) !== protectedBefore.get(id))
      throw new Error(
        `Phase 124 changed protected entity ${id} after publication.`,
      );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: [
      {
        entityId: PHASE124_ARTICLE_ID,
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
  const reviewer = value("--reviewer") ?? "phase124-platinum-fuji-shunkei";
  if (!databasePath || !ownedRoot || !protectedCatalogPath)
    throw new Error(
      "Usage: tsx scripts/apply-phase124-platinum-fuji-shunkei-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  const resolvedDatabase = path.resolve(databasePath);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtected = path.resolve(protectedCatalogPath);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    process.stdout.write(
      `${JSON.stringify(
        await applyPhase124PlatinumFujiShunkeiContent(client, {
          workspaceRoot: process.cwd(),
          reviewer,
          databasePath: resolvedDatabase,
          ownedRoot: resolvedOwnedRoot,
          protectedCatalogPath: resolvedProtected,
          protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
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

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
)
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
