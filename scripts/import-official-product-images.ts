import { createHash } from "node:crypto";
import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");
const USER_AGENT =
  "Mozilla/5.0 fountain-pen-graph-library/0.1 product-image-metadata";

type SourcePage = {
  entityId: string;
  slug: string;
  name: string;
  sourceItemId: string;
  sourceTitle: string;
  url: string;
  itemType: string;
  sourceName: string;
};

type ImageCandidate = {
  url: string;
  score: number;
  reason: string;
};

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
  return `media-official-${createHash("sha1")
    .update(`${entityId}:${sourceItemId}:${imageUrl}`)
    .digest("hex")
    .slice(0, 14)}`;
}

function absoluteUrl(raw: string, pageUrl: string) {
  const first = raw.split(",")[0]?.trim().split(/\s+/)[0] || raw;
  try {
    return new URL(first, pageUrl).toString();
  } catch {
    return "";
  }
}

function cleanHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

function keywords(page: SourcePage) {
  const raw = `${page.name} ${page.sourceTitle}`
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ");
  return raw
    .split(/\s+/)
    .filter((word) => word.length >= 3)
    .filter(
      (word) =>
        ![
          "fountain",
          "pen",
          "official",
          "collection",
          "series",
          "with",
          "gold",
          "black",
          "clear",
        ].includes(word),
    )
    .slice(0, 8);
}

function scoreImage(url: string, page: SourcePage) {
  const lower = url.toLowerCase();
  if (!/^https?:\/\//.test(url)) return null;
  if (/\.(svg|gif)(\?|$)/.test(lower)) return null;
  if (
    /logo|wordmark|ogp|icon|favicon|sprite|placeholder|avatar|payment|banner|menu|navi_|bags|hd_nav|header|search|page-title|footer|sns|pinterest|facebook|instagram/.test(
      lower,
    )
  ) {
    return null;
  }

  let score = 0;
  const reasons: string[] = [];
  for (const keyword of keywords(page)) {
    if (lower.includes(keyword.replace(/\s+/g, "-")) || lower.includes(keyword)) {
      score += 3;
      reasons.push(keyword);
    }
  }
  if (/fountain|fp-|_fp|\/fp|pen/.test(lower)) {
    score += 2;
    reasons.push("pen");
  }
  if (/product|products|media|thumbnail|wp-content|collection/.test(lower)) {
    score += 1;
    reasons.push("product-path");
  }
  if (/\.(webp|jpe?g|png)(\?|$)/.test(lower)) {
    score += 1;
    reasons.push("bitmap");
  }

  return score >= 3 ? { url, score, reason: reasons.join(",") } : null;
}

function extractMetaImages(html: string, pageUrl: string) {
  const images: string[] = [];
  const metaPattern =
    /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(metaPattern)) {
    images.push(absoluteUrl(cleanHtml(match[1]), pageUrl));
  }
  const reverseMetaPattern =
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]*>/gi;
  for (const match of html.matchAll(reverseMetaPattern)) {
    images.push(absoluteUrl(cleanHtml(match[1]), pageUrl));
  }
  return images;
}

function extractJsonLdImages(html: string, pageUrl: string) {
  const images: string[] = [];
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
        if (typeof image === "string") images.push(absoluteUrl(image, pageUrl));
        if (Array.isArray(image)) {
          for (const value of image) {
            if (typeof value === "string") images.push(absoluteUrl(value, pageUrl));
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

function extractImgImages(html: string, pageUrl: string) {
  const images: string[] = [];
  const imgPattern =
    /<img[^>]+(?:src|data-src|data-original|data-lazy-src|srcset|data-srcset)=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(imgPattern)) {
    images.push(absoluteUrl(cleanHtml(match[1]), pageUrl));
  }
  return images;
}

function chooseImage(html: string, page: SourcePage) {
  const urls = [
    ...extractJsonLdImages(html, page.url),
    ...extractMetaImages(html, page.url),
    ...extractImgImages(html, page.url),
  ];
  const candidates = new Map<string, ImageCandidate>();
  for (const url of urls) {
    const scored = scoreImage(url, page);
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
            si.id AS sourceItemId, si.title AS sourceTitle, si.url, si.item_type AS itemType,
            sr.name AS sourceName
     FROM entities e
     JOIN entity_references er ON er.entity_id = e.id
     JOIN source_items si ON si.id = er.source_item_id
     JOIN source_registry sr ON sr.id = si.source_id
     WHERE e.type = 'pen'
       AND (
        si.item_type LIKE 'official_product%'
        OR si.item_type LIKE 'official_collection%'
        OR si.item_type LIKE 'official_series%'
       )
       AND NOT EXISTS (
        SELECT 1 FROM media_assets ma
        WHERE ma.entity_id = e.id
          AND ma.review_status = 'approved'
          AND ma.usage_status = 'primary'
          AND ma.image_url NOT LIKE '/images/library/warm-pen-atlas/%'
       )
     ORDER BY e.slug, si.item_type, si.title`,
  );
}

async function main() {
  const db = getClient();
  const pages = await getSourcePages(db);
  let imported = 0;
  let skipped = 0;
  let failed = 0;
  const importedEntities = new Set<string>();

  console.log(`${WRITE ? "Importing" : "Dry run"} official product images from ${pages.length} source pages.`);

  for (const page of pages) {
    if (importedEntities.has(page.entityId)) {
      skipped += 1;
      console.log(`- skip ${page.slug}: entity already has an imported image in this run`);
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
        console.log(`- skip ${page.slug}: no product-like image`);
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
            `官方产品图：${page.sourceTitle}`,
            image.url,
            image.url,
            page.sourceName,
            "official product page",
            `${page.sourceName}: ${page.sourceTitle}`,
            page.url,
            page.sourceItemId,
          ] as InArgs,
        });
      }
      imported += 1;
      importedEntities.add(page.entityId);
      console.log(`- ${WRITE ? "imported" : "would import"} ${page.slug}: ${image.url} (${image.reason})`);
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
