import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import { createClient, type Client, type InArgs } from "@libsql/client";

const execFileAsync = promisify(execFile);
const USER_AGENT = "fountain-pen-graph-library/0.1 local media metadata script";
const COMMONS_SOURCE_ID = "wikimedia-commons";
const WRITE = process.argv.includes("--write");

const DEFAULT_LIMIT = 2;
const MAX_LIMIT = 8;

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
};

type CommonsProfile = {
  search: string;
  entityType: string;
  entitySlugs: string[];
  nameLike: string;
  mustIncludeAny: string[];
  mustIncludeAll?: string[];
  titleMustIncludeAny?: string[];
  excludeAny?: string[];
};

type CommonsImageInfo = {
  url?: string;
  thumburl?: string;
  descriptionurl?: string;
  descriptionshorturl?: string;
  mime?: string;
  mediatype?: string;
  width?: number;
  height?: number;
  extmetadata?: Record<string, { value?: unknown }>;
};

type CommonsPage = {
  pageid: number;
  ns: number;
  title: string;
  index?: number;
  imageinfo?: CommonsImageInfo[];
};

type CommonsCandidate = {
  id: string;
  sourceItemId: string;
  entityId: string | null;
  title: string;
  sourceUrl: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  author: string | null;
  license: string | null;
  attributionText: string | null;
  reviewStatus: "pending" | "needs_license";
  summary: string | null;
  rawMetadata: Record<string, unknown>;
};

const DEFAULT_PROFILES: CommonsProfile[] = [
  {
    search: "LAMY 2000 fountain pen",
    entityType: "pen",
    entitySlugs: ["凌美-lamy-lamy-2000", "lamy-2000"],
    nameLike: "LAMY 2000",
    mustIncludeAny: ["lamy"],
    mustIncludeAll: ["lamy", "2000"],
    titleMustIncludeAny: ["lamy"],
  },
  {
    search: "Pilot Custom 823 fountain pen",
    entityType: "pen",
    entitySlugs: ["pilot-custom-823", "百乐-pilot-custom-823"],
    nameLike: "Custom 823",
    mustIncludeAny: ["pilot", "823"],
    mustIncludeAll: ["pilot", "823"],
    titleMustIncludeAny: ["pilot"],
  },
  {
    search: "Parker 51 fountain pen",
    entityType: "pen",
    entitySlugs: ["派克-parker-51-经典-vintage", "the-parker-51"],
    nameLike: "Parker 51",
    mustIncludeAny: ["parker"],
    mustIncludeAll: ["parker", "51"],
    titleMustIncludeAny: ["parker"],
    excludeAny: ["hero 100"],
  },
  {
    search: "Pelikan Souveran M800 fountain pen",
    entityType: "pen",
    entitySlugs: ["百利金-pelikan-m800", "pelikan-souveran-m800"],
    nameLike: "Pelikan M800",
    mustIncludeAny: ["pelikan"],
    mustIncludeAll: ["pelikan", "m800"],
    titleMustIncludeAny: ["pelikan"],
  },
  {
    search: "Sailor Pro Gear fountain pen",
    entityType: "pen",
    entitySlugs: ["sailor-pro-gear", "写乐-sailor-21k-pro-gear-大鱼雷"],
    nameLike: "Pro Gear",
    mustIncludeAny: ["sailor"],
    mustIncludeAll: ["sailor", "gear"],
    titleMustIncludeAny: ["sailor"],
    excludeAny: ["realo"],
  },
  {
    search: "Montblanc 149 fountain pen",
    entityType: "pen",
    entitySlugs: ["万宝龙-montblanc-大班149-meisterst-ck"],
    nameLike: "Montblanc 149",
    mustIncludeAny: ["montblanc"],
    mustIncludeAll: ["montblanc", "149"],
    titleMustIncludeAny: ["montblanc", "meister149"],
  },
  {
    search: "Kaweco Sport fountain pen",
    entityType: "pen",
    entitySlugs: ["kaweco-sport"],
    nameLike: "Kaweco Sport",
    mustIncludeAny: ["kaweco"],
    mustIncludeAll: ["kaweco", "sport"],
    titleMustIncludeAny: ["kaweco"],
  },
  {
    search: "Platinum 3776 Century fountain pen",
    entityType: "pen",
    entitySlugs: ["白金-platinum-3776-century"],
    nameLike: "Platinum 3776",
    mustIncludeAny: ["platinum", "3776"],
    mustIncludeAll: ["platinum", "3776"],
    titleMustIncludeAny: ["platinum"],
  },
  {
    search: "Visconti Homo Sapiens fountain pen",
    entityType: "pen",
    entitySlugs: ["维斯康蒂-visconti-homo-sapiens智人"],
    nameLike: "Visconti Homo Sapiens",
    mustIncludeAny: ["visconti"],
    mustIncludeAll: ["visconti", "homo"],
    titleMustIncludeAny: ["visconti"],
  },
  {
    search: "Aurora 88 fountain pen",
    entityType: "pen",
    entitySlugs: ["奥罗拉-aurora"],
    nameLike: "Aurora 88",
    mustIncludeAny: ["aurora"],
    mustIncludeAll: ["aurora", "88"],
    titleMustIncludeAny: ["aurora"],
  },
];

function getArg(name: string) {
  const prefix = `${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function getLimit() {
  const raw = getArg("--limit");
  const parsed = raw ? Number(raw) : DEFAULT_LIMIT;
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

function getProfiles() {
  const query = getArg("--query");
  if (!query) return DEFAULT_PROFILES;

  const entityArg = getArg("--entity");
  const [entityType, entitySlug] = entityArg?.split("/") || [];
  return [
    {
      search: query,
      entityType: entityType || "pen",
      entitySlugs: entitySlug ? [entitySlug] : [],
      nameLike: query,
      mustIncludeAny: query
        .split(/\s+/)
        .filter((term) => term.length >= 4)
        .slice(0, 3),
      mustIncludeAll: [],
      titleMustIncludeAny: [],
      excludeAny: [],
    },
  ];
}

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function execute(db: Client, sql: string, args: unknown[] = []) {
  await db.execute({ sql, args: args as InArgs });
}

async function assertSchema(db: Client) {
  const requiredTables = [
    "entities",
    "source_registry",
    "source_items",
    "media_assets",
  ];
  const tableRows = await db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table'",
  );
  const tables = new Set(tableRows.rows.map((row) => String(row.name)));
  const missing = requiredTables.filter((table) => !tables.has(table));

  if (missing.length > 0) {
    throw new Error(
      `Missing tables: ${missing.join(", ")}. Run migrations or seed:library first.`,
    );
  }
}

async function ensureCommonsSource(db: Client) {
  await execute(
    db,
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (
      ?, 'Wikimedia Commons', 'wikimedia', 'metadata_only', 'medium',
      'varies_per_file',
      'Per-file license and attribution required before display.',
      'https://commons.wikimedia.org/',
      'MediaWiki API imageinfo metadata',
      'Imported files remain media candidates until author, license, and attribution are reviewed.',
      date('now'),
      datetime('now')
     )
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      allowed_use = excluded.allowed_use,
      reliability = excluded.reliability,
      license = excluded.license,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      fetch_method = excluded.fetch_method,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [COMMONS_SOURCE_ID],
  );
}

async function findLocalEntity(
  db: Client,
  profile: CommonsProfile,
): Promise<EntityRow | null> {
  for (const slug of profile.entitySlugs) {
    const row = await db.execute({
      sql: "SELECT id, type, slug, name FROM entities WHERE type = ? AND slug = ? LIMIT 1",
      args: [profile.entityType, slug],
    });
    if (row.rows[0]) return row.rows[0] as EntityRow;
  }

  const fallback = await db.execute({
    sql: "SELECT id, type, slug, name FROM entities WHERE type = ? AND name LIKE ? LIMIT 1",
    args: [profile.entityType, `%${profile.nameLike}%`],
  });
  return (fallback.rows[0] as EntityRow | undefined) || null;
}

async function fetchJson(url: string) {
  const { stdout } = await execFileAsync(
    "curl",
    ["-fsSL", "--compressed", "--retry", "2", "-A", USER_AGENT, url],
    { maxBuffer: 20 * 1024 * 1024 },
  );
  return JSON.parse(stdout);
}

async function searchCommons(query: string, limit: number) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrlimit", String(limit));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|size|mediatype|extmetadata");
  url.searchParams.set("iiurlwidth", "480");

  const payload = (await fetchJson(url.toString())) as {
    query?: { pages?: Record<string, CommonsPage> };
  };
  return Object.values(payload.query?.pages || {}).sort(
    (a, b) => (a.index || 0) - (b.index || 0),
  );
}

function decodeBasicEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = decodeBasicEntities(String(value))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0 ? text : null;
}

function truncate(value: string | null, maxLength: number) {
  if (!value || value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function stableId(prefix: string, value: string) {
  return `${prefix}-${createHash("sha1").update(value).digest("hex").slice(0, 14)}`;
}

function fileTitle(pageTitle: string) {
  return pageTitle.replace(/^File:/, "").replace(/_/g, " ");
}

function pageUrl(page: CommonsPage, imageInfo: CommonsImageInfo) {
  if (imageInfo.descriptionurl) return imageInfo.descriptionurl;
  return `https://commons.wikimedia.org/wiki/${encodeURI(page.title.replace(/ /g, "_"))}`;
}

function metaValue(
  imageInfo: CommonsImageInfo,
  key: string,
  fallback: string | null = null,
) {
  return stripHtml(imageInfo.extmetadata?.[key]?.value) || fallback;
}

function matchesProfile(profile: CommonsProfile, page: CommonsPage, info: CommonsImageInfo) {
  const description = metaValue(info, "ImageDescription") || "";
  const title = page.title.toLowerCase();
  const haystack = `${page.title} ${description}`.toLowerCase();
  if (
    profile.titleMustIncludeAny?.length &&
    !profile.titleMustIncludeAny.some((term) => title.includes(term.toLowerCase()))
  ) {
    return false;
  }
  if (
    profile.excludeAny?.some((term) => haystack.includes(term.toLowerCase()))
  ) {
    return false;
  }
  if (
    profile.mustIncludeAll?.length &&
    !profile.mustIncludeAll.every((term) => haystack.includes(term.toLowerCase()))
  ) {
    return false;
  }
  if (profile.mustIncludeAny.length === 0) return true;
  return profile.mustIncludeAny.some((term) => haystack.includes(term.toLowerCase()));
}

function buildCandidate(
  profile: CommonsProfile,
  entityId: string | null,
  page: CommonsPage,
): CommonsCandidate | null {
  const info = page.imageinfo?.[0];
  if (!info?.url) return null;
  if (info.mediatype && info.mediatype !== "BITMAP") return null;
  if (!matchesProfile(profile, page, info)) return null;

  const sourceUrl = pageUrl(page, info);
  const title = metaValue(info, "ObjectName", fileTitle(page.title)) || fileTitle(page.title);
  const author = metaValue(info, "Artist");
  const credit = metaValue(info, "Credit");
  const license = metaValue(info, "LicenseShortName") || metaValue(info, "UsageTerms");
  const licenseUrl = metaValue(info, "LicenseUrl");
  const attribution =
    metaValue(info, "Attribution") ||
    [author, credit, license].filter(Boolean).join(" · ") ||
    null;
  const reviewStatus = author && license ? "pending" : "needs_license";
  const description = truncate(metaValue(info, "ImageDescription"), 500);
  const id = stableId("media-commons", sourceUrl);
  const sourceItemId = stableId("source-commons-file", sourceUrl);

  return {
    id,
    sourceItemId,
    entityId,
    title,
    sourceUrl,
    imageUrl: info.url,
    thumbnailUrl: info.thumburl || null,
    author,
    license,
    attributionText: attribution,
    reviewStatus,
    summary: description,
    rawMetadata: {
      commons_pageid: page.pageid,
      commons_title: page.title,
      profile_search: profile.search,
      mime: info.mime || null,
      mediatype: info.mediatype || null,
      width: info.width || null,
      height: info.height || null,
      license_url: licenseUrl,
      description_short_url: info.descriptionshorturl || null,
    },
  };
}

async function upsertSourceItem(db: Client, candidate: CommonsCandidate) {
  await execute(
    db,
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, author, retrieved_at, summary, raw_metadata_json, allowed_use, review_status, updated_at)
     VALUES (?, ?, ?, ?, 'media_file', ?, ?, date('now'), ?, ?, 'metadata_only', 'pending', datetime('now'))
     ON CONFLICT(source_id, url) DO UPDATE SET
      title = excluded.title,
      license = excluded.license,
      author = excluded.author,
      retrieved_at = excluded.retrieved_at,
      summary = excluded.summary,
      raw_metadata_json = excluded.raw_metadata_json,
      allowed_use = excluded.allowed_use,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      candidate.sourceItemId,
      COMMONS_SOURCE_ID,
      candidate.title,
      candidate.sourceUrl,
      candidate.license,
      candidate.author,
      candidate.summary,
      JSON.stringify(candidate.rawMetadata),
    ],
  );

  const result = await db.execute({
    sql: "SELECT id FROM source_items WHERE source_id = ? AND url = ? LIMIT 1",
    args: [COMMONS_SOURCE_ID, candidate.sourceUrl],
  });
  return String(result.rows[0]?.id || candidate.sourceItemId);
}

async function upsertMediaAsset(
  db: Client,
  candidate: CommonsCandidate,
  sourceItemId: string,
) {
  await execute(
    db,
    `INSERT INTO media_assets
      (id, entity_id, title, asset_type, image_url, thumbnail_url, author, license, attribution_text, source_url, source_item_id, review_status, usage_status, updated_at)
     VALUES (?, ?, ?, 'image', ?, ?, ?, ?, ?, ?, ?, ?, 'candidate', datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      entity_id = excluded.entity_id,
      title = excluded.title,
      asset_type = excluded.asset_type,
      image_url = excluded.image_url,
      thumbnail_url = excluded.thumbnail_url,
      author = excluded.author,
      license = excluded.license,
      attribution_text = excluded.attribution_text,
      source_url = excluded.source_url,
      source_item_id = excluded.source_item_id,
      review_status = excluded.review_status,
      usage_status = excluded.usage_status,
      updated_at = datetime('now')`,
    [
      candidate.id,
      candidate.entityId,
      candidate.title,
      candidate.imageUrl,
      candidate.thumbnailUrl,
      candidate.author,
      candidate.license,
      candidate.attributionText,
      candidate.sourceUrl,
      sourceItemId,
      candidate.reviewStatus,
    ],
  );
}

async function main() {
  const db = getClient();
  const limit = getLimit();
  const profiles = getProfiles();
  let candidateCount = 0;
  let writeCount = 0;

  await assertSchema(db);
  if (WRITE) await ensureCommonsSource(db);

  console.log(
    `${WRITE ? "Writing" : "Dry run"} Commons media metadata for ${profiles.length} profile(s), limit ${limit}.`,
  );

  for (const profile of profiles) {
    const entity = await findLocalEntity(db, profile);
    const pages = await searchCommons(profile.search, limit);
    const candidates = pages
      .map((page) => buildCandidate(profile, entity?.id || null, page))
      .filter((candidate): candidate is CommonsCandidate => Boolean(candidate));

    candidateCount += candidates.length;
    console.log(
      `\n${profile.search}: ${candidates.length} candidate(s)${
        entity ? ` -> ${entity.type}/${entity.slug}` : " -> no local entity match"
      }`,
    );

    for (const candidate of candidates) {
      console.log(
        `- ${candidate.title} | ${candidate.license || "license missing"} | ${
          candidate.author || "author missing"
        }`,
      );

      if (WRITE) {
        const sourceItemId = await upsertSourceItem(db, candidate);
        await upsertMediaAsset(db, candidate, sourceItemId);
        writeCount += 1;
      }
    }
  }

  if (!WRITE) {
    console.log("\nDry run only. Re-run with --write to persist candidates.");
  } else {
    console.log(`\nWrote ${writeCount} Commons media candidate(s).`);
  }

  if (candidateCount === 0) {
    console.warn("No Commons media candidates matched the configured profiles.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
