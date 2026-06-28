import { createHash } from "node:crypto";
import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : Number.POSITIVE_INFINITY;
const USER_AGENT =
  "Mozilla/5.0 fountain-pen-graph-library/0.1 source-product-image-metadata";

type SourcePage = {
  entityId: string;
  slug: string;
  name: string;
  brandName: string | null;
  seriesName: string | null;
  sourceItemId: string;
  sourceTitle: string;
  url: string;
  itemType: string;
  sourceName: string;
  sourceType: string;
};

type ImageCandidate = {
  url: string;
  score: number;
  reason: string;
  alt: string;
};

const STOPWORDS = new Set([
  "the",
  "and",
  "with",
  "for",
  "pen",
  "pens",
  "fountain",
  "series",
  "family",
  "model",
  "official",
  "collection",
  "classic",
  "vintage",
  "limited",
  "edition",
  "gold",
  "silver",
  "black",
  "white",
  "blue",
  "green",
  "red",
  "brown",
  "clear",
  "steel",
  "review",
  "profile",
  "page",
  "site",
  "richard",
  "richards",
  "spens",
  "narratess",
  "blogmas",
  "blogma",
  "juspirit",
  "network",
]);

const BAD_IMAGE_PATTERN =
  /logo|wordmark|ogp|ogimage|icon|favicon|sprite|placeholder|avatar|photo-thumb|payment|banner|menu|navi_|bags|hd_nav|header|search|page-title|footer|sns|pinterest|facebook|instagram|button|arrow|dimmed|spacer|pixel|loading|calendar|cart|badge|swatch|newsletter|converter|refill|accessory/i;

const COMPONENT_IMAGE_PATTERN =
  /(^|[_/-])(nib|tube|filler|filling|blind_cap|shield|medallion|crown|catalog|sheet|pump_handle|ed_filler|feed|clip|section|patent|bldg|building)([_./-]|$)|pockette_band|US[D]?\d{5,}/i;

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function execute<T extends Record<string, unknown>>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  const result = await db.execute({ sql, args: args as InArgs });
  return result.rows.map((row) => row as T);
}

function mediaId(entityId: string, sourceItemId: string, imageUrl: string) {
  return `media-source-${createHash("sha1")
    .update(`${entityId}:${sourceItemId}:${imageUrl}`)
    .digest("hex")
    .slice(0, 14)}`;
}

function cleanHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function getBaseUrl(html: string, pageUrl: string) {
  const match = html.match(/<base[^>]+href=["']([^"']+)["'][^>]*>/i);
  if (!match) return pageUrl;
  try {
    return new URL(cleanHtml(match[1]), pageUrl).toString();
  } catch {
    return pageUrl;
  }
}

function absoluteUrl(raw: string, baseUrl: string) {
  const first = raw.split(",")[0]?.trim().split(/\s+/)[0] || raw;
  try {
    return new URL(cleanHtml(first), baseUrl).toString();
  } catch {
    return "";
  }
}

function normalizeText(value: string) {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }
  return decoded
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/s\b/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(page: SourcePage) {
  const brands = new Set(brandTokens(page));
  const raw = normalizeText(`${page.name} ${page.seriesName || ""}`);
  return [...new Set(raw.split(/\s+/))]
    .filter((word) => word.length >= 2 || /^[a-z]\d{2,}$/i.test(word))
    .filter((word) => !STOPWORDS.has(word))
    .filter((word) => !brands.has(word))
    .slice(0, 12);
}

function brandTokens(page: SourcePage) {
  return normalizeText(page.brandName || page.name)
    .split(/\s+/)
    .filter((word) => word.length >= 3)
    .filter((word) => !STOPWORDS.has(word));
}

function trustedSourceWeight(page: SourcePage) {
  const source = `${page.sourceName} ${page.sourceType} ${page.itemType}`;
  if (/official/i.test(source)) return 4;
  if (/retailer|catalog/i.test(source)) return 3;
  if (/Richard's Pens|model_profile|profile_article/i.test(source)) return 3;
  if (/review|blog|forum/i.test(source)) return 2;
  return 0;
}

function contentImageBonus(url: string) {
  const lower = url.toLowerCase();
  if (/\/coll\/|\/collection\/|\/product|products|media|wp-content|uploads|cdn|shopify|images\/ref\/profiles/.test(lower)) {
    return 3;
  }
  if (/ad[_-]|\bad\b|advert|vma\//.test(lower)) return -2;
  return 0;
}

function scoreImage(url: string, alt: string, page: SourcePage) {
  if (!/^https?:\/\//.test(url)) return null;
  const lower = url.toLowerCase();
  if (/\.(svg|gif)(\?|$)/.test(lower)) return null;
  if (BAD_IMAGE_PATTERN.test(lower) || BAD_IMAGE_PATTERN.test(alt)) return null;
  if (COMPONENT_IMAGE_PATTERN.test(lower) || COMPONENT_IMAGE_PATTERN.test(alt)) {
    return null;
  }

  const text = normalizeText(`${url} ${alt}`);
  const modelTokens = tokens(page);
  const brand = brandTokens(page);
  let score = trustedSourceWeight(page) + contentImageBonus(url);
  const reasons: string[] = [];

  for (const token of modelTokens) {
    if (text.includes(token)) {
      score += 4;
      reasons.push(`model:${token}`);
    }
  }
  for (const token of brand.slice(0, 3)) {
    if (text.includes(token)) {
      score += 2;
      reasons.push(`brand:${token}`);
    }
  }
  if (/fountain|pen|fp-|_fp|\/fp/.test(lower)) {
    score += 1;
    reasons.push("pen");
  }
  if (/\.(webp|jpe?g|png)(\?|$)/.test(lower)) {
    score += 1;
    reasons.push("bitmap");
  }
  if (/richardspens\.com\/images\/coll\//.test(lower)) {
    score += 2;
    reasons.push("collection-photo");
  }
  if (/richardspens\.com\/images\/ref\/profiles\//.test(lower)) {
    score += 2;
    reasons.push("profile-photo");
  }

  const hasModelHit = reasons.some((reason) => reason.startsWith("model:"));
  if (!hasModelHit) return null;
  return score >= 8 ? { url, score, reason: reasons.join(","), alt } : null;
}

function extractImageAttrs(html: string, baseUrl: string) {
  const images: Array<{ url: string; alt: string }> = [];
  const imgPattern = /<img\b([^>]+)>/gi;
  for (const match of html.matchAll(imgPattern)) {
    const attrs = match[1];
    const src =
      attrs.match(/\s(?:src|data-src|data-original|data-lazy-src)=["']([^"']+)["']/i)?.[1] ||
      attrs.match(/\s(?:srcset|data-srcset)=["']([^"']+)["']/i)?.[1];
    if (!src) continue;
    const alt =
      attrs.match(/\s(?:alt|title)=["']([^"']*)["']/i)?.[1] ||
      attrs.replace(/\s+/g, " ").slice(0, 160);
    images.push({
      url: absoluteUrl(src, baseUrl),
      alt: cleanHtml(alt),
    });
  }
  return images;
}

function extractMetaImages(html: string, baseUrl: string) {
  const images: Array<{ url: string; alt: string }> = [];
  const metaPattern =
    /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(metaPattern)) {
    images.push({ url: absoluteUrl(match[1], baseUrl), alt: "meta image" });
  }
  const reverseMetaPattern =
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]*>/gi;
  for (const match of html.matchAll(reverseMetaPattern)) {
    images.push({ url: absoluteUrl(match[1], baseUrl), alt: "meta image" });
  }
  return images;
}

function extractJsonLdImages(html: string, baseUrl: string) {
  const images: Array<{ url: string; alt: string }> = [];
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const match of scripts) {
    try {
      const parsed = JSON.parse(cleanHtml(match[1]));
      const queue = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item || typeof item !== "object") continue;
        const image = (item as { image?: unknown }).image;
        if (typeof image === "string") {
          images.push({ url: absoluteUrl(image, baseUrl), alt: "json-ld image" });
        }
        if (Array.isArray(image)) {
          for (const value of image) {
            if (typeof value === "string") {
              images.push({ url: absoluteUrl(value, baseUrl), alt: "json-ld image" });
            }
          }
        }
        for (const value of Object.values(item as Record<string, unknown>)) {
          if (value && typeof value === "object") queue.push(value);
        }
      }
    } catch {
      continue;
    }
  }
  return images;
}

function chooseImage(html: string, page: SourcePage) {
  const baseUrl = getBaseUrl(html, page.url);
  const allImages = [
    ...extractJsonLdImages(html, baseUrl),
    ...extractMetaImages(html, baseUrl),
    ...extractImageAttrs(html, baseUrl),
  ];
  const candidates = new Map<string, ImageCandidate>();
  for (const image of allImages) {
    const scored = scoreImage(image.url, image.alt, page);
    if (!scored) continue;
    const existing = candidates.get(scored.url);
    if (!existing || scored.score > existing.score) {
      candidates.set(scored.url, scored);
    }
  }
  return [...candidates.values()].sort((a, b) => b.score - a.score)[0] || null;
}

async function getSourcePages(db: Client) {
  return execute<SourcePage>(
    db,
    `SELECT e.id AS entityId, e.slug, e.name,
            ms.series_name AS seriesName,
            b.name AS brandName,
            si.id AS sourceItemId, si.title AS sourceTitle, si.url, si.item_type AS itemType,
            sr.name AS sourceName, sr.source_type AS sourceType
     FROM entities e
     JOIN entity_references er ON er.entity_id = e.id
     JOIN source_items si ON si.id = er.source_item_id
     JOIN source_registry sr ON sr.id = si.source_id
     LEFT JOIN model_specs ms ON ms.entity_id = e.id
     LEFT JOIN entities b ON b.id = ms.brand_entity_id
     WHERE e.type = 'pen'
       AND si.url NOT LIKE '%bing.com/search%'
       AND si.url NOT LIKE '%google.com/search%'
       AND si.item_type NOT IN ('research_index', 'community_index')
       AND si.item_type NOT LIKE '%accessory%'
       AND si.item_type NOT LIKE '%brand_site%'
       AND si.item_type NOT LIKE '%history%'
       AND (
        sr.source_type IN ('official', 'retailer', 'blog', 'forum')
        OR sr.name = 'Richard''s Pens'
       )
       AND NOT EXISTS (
        SELECT 1 FROM media_assets ma
        WHERE ma.entity_id = e.id
          AND ma.review_status = 'approved'
          AND ma.usage_status = 'primary'
          AND ma.image_url NOT LIKE '/images/library/warm-pen-atlas/%'
       )
     GROUP BY e.id, si.id
     ORDER BY
       CASE
         WHEN sr.source_type = 'official' THEN 0
         WHEN sr.source_type = 'retailer' THEN 1
         WHEN sr.name = 'Richard''s Pens' THEN 2
         ELSE 3
       END,
       e.slug,
       si.title`,
  );
}

async function main() {
  const db = getClient();
  const pages = await getSourcePages(db);
  let imported = 0;
  let skipped = 0;
  let failed = 0;
  const importedEntities = new Set<string>();

  console.log(
    `${WRITE ? "Importing" : "Dry run"} source-linked product images from ${pages.length} source pages.`,
  );

  for (const page of pages) {
    if (imported >= LIMIT) break;
    if (importedEntities.has(page.entityId)) {
      skipped += 1;
      continue;
    }

    try {
      const response = await fetch(page.url, {
        headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
      });
      if (!response.ok) {
        failed += 1;
        console.log(`- fail ${page.slug}: HTTP ${response.status} ${page.url}`);
        continue;
      }
      const html = await response.text();
      const image = chooseImage(html, page);
      if (!image) {
        skipped += 1;
        console.log(`- skip ${page.slug}: no high-confidence image from ${page.sourceName}`);
        continue;
      }

      const id = mediaId(page.entityId, page.sourceItemId, image.url);
      if (WRITE) {
        await db.execute({
          sql: `UPDATE media_assets
                SET usage_status = 'gallery', updated_at = datetime('now')
                WHERE entity_id = ?
                  AND usage_status = 'primary'
                  AND image_url NOT LIKE '/images/library/warm-pen-atlas/%'`,
          args: [page.entityId] as InArgs,
        });
        await db.execute({
          sql: `INSERT INTO media_assets
                  (id, entity_id, title, asset_type, image_url, thumbnail_url,
                   author, license, attribution_text, source_url, source_item_id,
                   review_status, usage_status, updated_at)
                VALUES (?, ?, ?, 'image', ?, ?, ?, ?, ?, ?, ?, 'approved', 'primary', datetime('now'))
                ON CONFLICT(id) DO UPDATE SET
                  entity_id = excluded.entity_id,
                  title = excluded.title,
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
          args: [
            id,
            page.entityId,
            `资料页实物图：${page.sourceTitle}`,
            image.url,
            image.url,
            page.sourceName,
            "source page image",
            `${page.sourceName}: ${page.sourceTitle}`,
            page.url,
            page.sourceItemId,
          ] as InArgs,
        });
      }
      imported += 1;
      importedEntities.add(page.entityId);
      console.log(
        `- ${WRITE ? "imported" : "would import"} ${page.slug}: ${image.url} (${image.reason}; score ${image.score})`,
      );
    } catch (error) {
      failed += 1;
      console.log(`- fail ${page.slug}: ${(error as Error).message}`);
    }
  }

  console.log(`Done. ${imported} imported, ${skipped} skipped, ${failed} failed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
