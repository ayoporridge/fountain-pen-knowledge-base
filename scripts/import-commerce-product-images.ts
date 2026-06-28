import { createHash } from "node:crypto";
import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");
const REPAIR_ONLY = process.argv.includes("--repair-only");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : Number.POSITIVE_INFINITY;
const SLUG_ARG = process.argv.find((arg) => arg.startsWith("--slug="));
const ONLY_SLUG = SLUG_ARG ? SLUG_ARG.slice("--slug=".length) : "";
const USER_AGENT =
  "Mozilla/5.0 fountain-pen-graph-library/0.1 commerce-product-image-metadata";

type PenRow = {
  entityId: string;
  slug: string;
  name: string;
  brandName: string | null;
  seriesName: string | null;
};

type CommerceSite = {
  id: string;
  name: string;
  searchUrl(query: string): string;
};

type ProductCandidate = {
  url: string;
  title: string;
  score: number;
};

type ImageCandidate = {
  url: string;
  score: number;
  reason: string;
};

type BrokenCommerceMedia = {
  mediaId: string;
  entityId: string;
  slug: string;
  name: string;
  brandName: string | null;
  seriesName: string | null;
  title: string;
  sourceUrl: string;
};

const SITES: CommerceSite[] = [
  {
    id: "goldspot",
    name: "Goldspot Pens",
    searchUrl: (query) => `https://www.goldspot.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "goulet",
    name: "Goulet Pens",
    searchUrl: (query) => `https://www.gouletpens.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "cultpens",
    name: "Cult Pens",
    searchUrl: (query) => `https://cultpens.com/search?q=${encodeURIComponent(query)}`,
  },
];

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
  "line",
  "pending",
  "identity",
  "read",
  "separate",
  "entry",
  "brand",
  "generic",
]);

const BAD_IMAGE_PATTERN =
  /logo|wordmark|ogp|ogimage|icon|favicon|sprite|placeholder|avatar|payment|banner|menu|navi_|header|search|footer|sns|pinterest|facebook|instagram|button|arrow|spacer|pixel|loading|calendar|cart|badge|swatch|newsletter|converter|refill|accessory|apps\.js|core\.js|hover-intent|shopifycloud/i;

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

function mediaId(entityId: string, productUrl: string, imageUrl: string) {
  return `media-commerce-${createHash("sha1")
    .update(`${entityId}:${productUrl}:${imageUrl}`)
    .digest("hex")
    .slice(0, 14)}`;
}

function sourceRegistryId(site: CommerceSite) {
  return `retailer-${site.id}`;
}

function sourceItemId(site: CommerceSite, productUrl: string) {
  return `source-commerce-${site.id}-${createHash("sha1")
    .update(productUrl)
    .digest("hex")
    .slice(0, 14)}`;
}

function entityReferenceId(entityId: string, itemId: string) {
  return `eref-commerce-${createHash("sha1")
    .update(`${entityId}:${itemId}`)
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

function normalizeText(value: string) {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }
  return decoded
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[’']s\b/g, "")
    .replace(/[’']/g, "")
    .replace(/([a-z0-9])([\u4e00-\u9fff])/gi, "$1 $2")
    .replace(/([\u4e00-\u9fff])([a-z0-9])/gi, "$1 $2")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((word) => word.length >= 2 || /^[a-z]\d{2,}$/i.test(word))
    .filter((word) => !STOPWORDS.has(word));
}

function brandTokens(row: PenRow) {
  const raw = row.brandName || row.name;
  return [...new Set(tokenize(raw))].slice(0, 4);
}

function modelTokens(row: PenRow) {
  const brands = new Set(brandTokens(row));
  const raw = `${row.name} ${row.seriesName || ""}`;
  return [...new Set(tokenize(raw))]
    .filter((word) => !brands.has(word))
    .filter((word) => !/^(按|分开|阅读|型号|身份|区分|待定)$/.test(word))
    .slice(0, 10);
}

function latinQuery(row: PenRow) {
  const required = requiredModelHits(row);
  const parts = [...brandTokens(row), ...(required.length > 0 ? required : modelTokens(row))]
    .filter((word) => /^[a-z0-9]+$/i.test(word) || /^\d+$/.test(word))
    .filter((word) => !["fp", "ef", "f", "m", "b", "14k", "18k", "21k"].includes(word));
  if (parts.length < 2) return "";
  return `${[...new Set(parts)].join(" ")} fountain pen`;
}

function requiredModelHits(row: PenRow) {
  const models = modelTokens(row);
  const numeric = models.filter(
    (word) => /^(?:[a-z]\d{2,}[a-z]?|\d{2,}[a-z]?)$/.test(word) && !/^\d{2}k$/.test(word),
  );
  if (numeric.length > 0) return numeric;
  const latin = models.filter((word) => /^[a-z0-9]+$/i.test(word) && word.length >= 2);
  return latin.slice(0, 2);
}

function tokenMatches(value: string, token: string) {
  const normalized = normalizeText(value);
  if (/^(?:[a-z]\d{2,}[a-z]?|\d{2,}[a-z]?|[a-z]{1,2})$/.test(token)) {
    return normalized.split(/\s+/).includes(token);
  }
  return normalized.includes(token);
}

function matchesProduct(row: PenRow, value: string) {
  const text = normalizeText(value);
  const brands = brandTokens(row);
  const required = requiredModelHits(row);
  const brandHit = brands.length === 0 || brands.some((token) => tokenMatches(text, token));
  const modelHit =
    required.length > 0 && required.every((token) => tokenMatches(text, token));
  return brandHit && modelHit;
}

function isInkLike(row: PenRow) {
  return /iroshizuku|ink|墨水|色彩雫/i.test(`${row.slug} ${row.name} ${row.seriesName || ""}`);
}

function matchesProductType(row: PenRow, value: string) {
  const text = normalizeText(value);
  if (isInkLike(row)) return /ink|bottle|iroshizuku/.test(text);
  return text.includes("fountain pen");
}

function absoluteUrl(raw: string, baseUrl: string) {
  const first = cleanHtml(raw).split(",")[0]?.trim().split(/\s+/)[0] || raw;
  try {
    const url = new URL(first.startsWith("//") ? `https:${first}` : first, baseUrl);
    if (url.protocol === "http:" && url.hostname === "cdn.shopify.com") {
      url.protocol = "https:";
    }
    return url.toString();
  } catch {
    return "";
  }
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,*/*",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractProductLinks(html: string, baseUrl: string, row: PenRow) {
  const links = new Map<string, ProductCandidate>();
  const anchorPattern = /<a\b([^>]+)>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorPattern)) {
    const attrs = match[1];
    const href = attrs.match(/\shref=["']([^"']+)["']/i)?.[1];
    if (!href || !/\/products?\//i.test(href)) continue;
    const url = absoluteUrl(href, baseUrl).replace(/\?.*$/, "");
    const text = cleanHtml(match[2].replace(/<[^>]+>/g, " "));
    const combined = `${url} ${text}`;
    if (!matchesProductType(row, combined)) continue;
    if (!matchesProduct(row, combined)) continue;
    const score =
      10 +
      requiredModelHits(row).filter((token) => tokenMatches(combined, token)).length *
        4;
    const existing = links.get(url);
    if (!existing || existing.score < score) {
      links.set(url, { url, title: text.slice(0, 180), score });
    }
  }
  return [...links.values()].sort((a, b) => b.score - a.score).slice(0, 3);
}

function extractImages(html: string, pageUrl: string, row: PenRow) {
  const images = new Map<string, ImageCandidate>();
  const add = (raw: string, reason: string, score = 0) => {
    const url = absoluteUrl(raw, pageUrl);
    if (!url || BAD_IMAGE_PATTERN.test(url)) return;
    if (!/\.(webp|jpe?g|png)(\?|$)/i.test(url)) return;
    if (!matchesProduct(row, url)) return;
    const hitCount = requiredModelHits(row).filter((token) =>
      tokenMatches(url, token),
    ).length;
    const candidate = {
      url,
      score: score + hitCount * 4 + (url.includes("cdn.shopify.com") ? 2 : 0),
      reason,
    };
    const existing = images.get(url);
    if (!existing || existing.score < candidate.score) images.set(url, candidate);
  };

  for (const match of html.matchAll(
    /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
  )) {
    add(match[1], "meta", 4);
  }
  for (const match of html.matchAll(
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]*>/gi,
  )) {
    add(match[1], "meta", 4);
  }
  for (const match of html.matchAll(
    /<(?:img|source)\b[^>]+(?:src|data-src|data-original|data-lazy-src|srcset|data-srcset)=["']([^"']+)["'][^>]*>/gi,
  )) {
    add(match[1], "image-tag", 2);
  }
  for (const match of html.matchAll(/"image"\s*:\s*"([^"]+)"/gi)) {
    add(match[1], "json-ld", 4);
  }

  return [...images.values()].sort((a, b) => b.score - a.score)[0] || null;
}

async function ensureCommerceSourceItem(
  db: Client,
  site: CommerceSite,
  pen: PenRow,
  product: ProductCandidate,
) {
  const sourceId = sourceRegistryId(site);
  const itemId = sourceItemId(site, product.url);
  await db.execute({
    sql: `INSERT INTO source_registry
            (id, name, source_type, allowed_use, reliability, license, attribution,
             homepage_url, fetch_method, notes, last_checked_at, updated_at)
          VALUES (?, ?, 'retailer', 'metadata_only', 'medium',
                  'copyrighted retailer content', ?, ?, 'html scrape',
                  'Used only for product-page metadata, source link, and externally hosted product image URL.',
                  datetime('now'), datetime('now'))
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
    args: [
      sourceId,
      site.name,
      site.name,
      new URL(product.url).origin,
    ] as InArgs,
  });
  await db.execute({
    sql: `INSERT INTO source_items
            (id, source_id, title, url, item_type, license, author, retrieved_at,
             summary, raw_metadata_json, allowed_use, review_status, updated_at)
          VALUES (?, ?, ?, ?, 'retailer_product_page', 'copyrighted retailer product page',
                  ?, datetime('now'), ?, ?, 'metadata_only', 'approved', datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            source_id = excluded.source_id,
            title = excluded.title,
            url = excluded.url,
            item_type = excluded.item_type,
            license = excluded.license,
            author = excluded.author,
            retrieved_at = excluded.retrieved_at,
            summary = excluded.summary,
            raw_metadata_json = excluded.raw_metadata_json,
            allowed_use = excluded.allowed_use,
            review_status = excluded.review_status,
            updated_at = datetime('now')`,
    args: [
      itemId,
      sourceId,
      product.title || pen.name,
      product.url,
      site.name,
      `Retailer product page matched to ${pen.name}.`,
      JSON.stringify({ site: site.name, productScore: product.score }),
    ] as InArgs,
  });
  await db.execute({
    sql: `INSERT INTO entity_references
            (id, entity_id, source_item_id, relation_type, note, review_status)
          VALUES (?, ?, ?, 'reference', ?, 'approved')
          ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
            note = excluded.note,
            review_status = excluded.review_status`,
    args: [
      entityReferenceId(pen.entityId, itemId),
      pen.entityId,
      itemId,
      `Retailer product page used for ${pen.name} product image.`,
    ] as InArgs,
  });
  return itemId;
}

function siteForProductUrl(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return SITES.find((site) => {
    const siteHost = new URL(site.searchUrl("")).hostname.replace(/^www\./, "");
    return host === siteHost || host.endsWith(`.${siteHost}`);
  });
}

async function repairExistingCommerceMedia(db: Client) {
  const rows = await execute<BrokenCommerceMedia>(
    db,
    `SELECT ma.id AS mediaId, ma.entity_id AS entityId, e.slug, e.name,
            b.name AS brandName, ms.series_name AS seriesName,
            ma.title, ma.source_url AS sourceUrl
     FROM media_assets ma
     JOIN entities e ON e.id = ma.entity_id
     LEFT JOIN model_specs ms ON ms.entity_id = e.id
     LEFT JOIN entities b ON b.id = ms.brand_entity_id
     WHERE ma.id LIKE 'media-commerce-%'
       AND ma.source_item_id IS NULL
       AND ma.source_url IS NOT NULL
     ORDER BY e.slug`,
  );
  let repaired = 0;
  for (const row of rows) {
    const site = siteForProductUrl(row.sourceUrl);
    if (!site) {
      console.log(`- repair skip ${row.slug}: unknown retailer ${row.sourceUrl}`);
      continue;
    }
    const product: ProductCandidate = {
      url: row.sourceUrl,
      title: row.title.replace(/^电商产品图：/, ""),
      score: 0,
    };
    const itemId = await ensureCommerceSourceItem(db, site, row, product);
    await db.execute({
      sql: `UPDATE media_assets
            SET source_item_id = ?,
                author = ?,
                license = 'retailer product page',
                attribution_text = ?,
                updated_at = datetime('now')
            WHERE id = ?`,
      args: [
        itemId,
        site.name,
        `${site.name}: ${product.title || row.name}`,
        row.mediaId,
      ] as InArgs,
    });
    repaired += 1;
    console.log(`- repaired ${row.slug}: ${itemId}`);
  }
  return repaired;
}

async function getMissingPens(db: Client) {
  return execute<PenRow>(
    db,
    `SELECT e.id AS entityId, e.slug, e.name,
            b.name AS brandName,
            ms.series_name AS seriesName
     FROM entities e
     LEFT JOIN model_specs ms ON ms.entity_id = e.id
     LEFT JOIN entities b ON b.id = ms.brand_entity_id
     WHERE e.type = 'pen'
       AND (
        NOT EXISTS (
          SELECT 1 FROM media_assets ma
          WHERE ma.entity_id = e.id
            AND ma.review_status = 'approved'
            AND ma.usage_status = 'primary'
            AND ma.image_url NOT LIKE '/images/library/warm-pen-atlas/%'
        )
        OR EXISTS (
          SELECT 1 FROM media_assets ma
          WHERE ma.entity_id = e.id
            AND ma.id LIKE 'media-commerce-%'
            AND ma.source_item_id IS NULL
        )
       )
     ORDER BY e.slug`,
  );
}

async function main() {
  const db = getClient();
  if (WRITE) {
    const repaired = await repairExistingCommerceMedia(db);
    if (repaired > 0) console.log(`Repaired ${repaired} existing commerce media source links.`);
    if (REPAIR_ONLY) return;
  }
  let pens = await getMissingPens(db);
  if (ONLY_SLUG) pens = pens.filter((pen) => pen.slug === ONLY_SLUG);
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  console.log(
    `${WRITE ? "Importing" : "Dry run"} commerce product images for ${pens.length} missing pens.`,
  );

  for (const pen of pens) {
    if (imported >= LIMIT) break;
    const query = latinQuery(pen);
    if (!query) {
      skipped += 1;
      continue;
    }

    let matched = false;
    for (const site of SITES) {
      const searchUrl = site.searchUrl(query);
      const searchHtml = await fetchText(searchUrl);
      if (!searchHtml) {
        failed += 1;
        continue;
      }
      const products = extractProductLinks(searchHtml, searchUrl, pen);
      for (const product of products) {
        const productHtml = await fetchText(product.url);
        if (!productHtml) {
          failed += 1;
          continue;
        }
        const image = extractImages(productHtml, product.url, pen);
        if (!image) continue;

        const id = mediaId(pen.entityId, product.url, image.url);
        const sourceItem = WRITE
          ? await ensureCommerceSourceItem(db, site, pen, product)
          : sourceItemId(site, product.url);
        if (WRITE) {
          await db.execute({
            sql: `UPDATE media_assets
                  SET usage_status = 'gallery', updated_at = datetime('now')
                  WHERE entity_id = ?
                    AND usage_status = 'primary'
                    AND image_url NOT LIKE '/images/library/warm-pen-atlas/%'`,
            args: [pen.entityId] as InArgs,
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
              pen.entityId,
              `电商产品图：${product.title || pen.name}`,
              image.url,
              image.url,
              site.name,
              "retailer product page",
              `${site.name}: ${product.title || pen.name}`,
              product.url,
              sourceItem,
            ] as InArgs,
          });
        }
        imported += 1;
        matched = true;
        console.log(
          `- ${WRITE ? "imported" : "would import"} ${pen.slug}: ${image.url} via ${site.name} (${image.reason}; ${product.url})`,
        );
        break;
      }
      if (matched) break;
    }
    if (!matched) {
      skipped += 1;
      console.log(`- skip ${pen.slug}: no commerce match for "${query}"`);
    }
  }

  console.log(`Done. ${imported} imported, ${skipped} skipped, ${failed} failed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
