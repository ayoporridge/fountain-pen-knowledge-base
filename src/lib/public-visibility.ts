import { queryOne } from "@/lib/db";

type EntityVisibilityInput = {
  type?: string | number | null;
  slug?: string | number | null;
  name?: string | null;
  summary?: string | null;
  body_md?: string | null;
};

export type PublicEntity = {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  body_md: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
  source_url: string | null;
  source_file: string | null;
  imported_at: string | null;
};

export const HIDDEN_BRAND_SLUGS = [
  "banju",
  "saier",
  "shanghai",
  "yongxu",
] as const;

export const HIDDEN_DUPLICATE_ENTITY_SLUGS = [
  "百乐-pilot-custom-823",
  "百利金-pelikan-m800",
  "派克-parker-51-经典-vintage",
  "写乐-sailor-21k-pro-gear-大鱼雷",
  "奥罗拉-aurora",
] as const;

/**
 * Concept drafts with no reliable examples or a definition that still mixes
 * distinct mechanisms. Keep the records for editorial recovery, but do not
 * publish them as finished reference pages.
 */
export const HIDDEN_CONCEPT_SLUGS = [
  "italic-nib",
  "music-nib",
  "rotary-filler",
] as const;

/**
 * Imported pages that are incomplete, administrative, or still working notes.
 * They remain in the database for source recovery, but must not appear on any
 * public surface until an editor has restored and reviewed the full article.
 */
export const HIDDEN_ARTICLE_SLUGS = [
  "about-us",
  "contact-us",
  "demonstrator-pens",
  "hommel-s-meteor-fountain-pen-and-its-descendants",
  "how-to-disassemble-and-reassemble-a-parker-51",
  "parker-ivorine-pastel-and-moire-oh-my",
  "personalized-pens-the-malarkey-pen",
  "pilot-iroshizuku-ink-guide",
  "preserving-your-pens-dos-and-don-ts",
  "privacy-policy",
  "readme",
  "soviet-pens",
  "tribute-pens-and-reboots",
  "world-war-ii-and-the-fountain-pen",
  "万特佳",
  "公爵-duke",
  "半句",
  "永续",
  "犀飞利-sheaffer-品牌泛称",
  "灵感提炼",
] as const;

export const INDEX_ARTICLE_MARKERS = [
  "品牌资料索引",
  "品牌索引",
  "品牌泛称",
  "泛称页",
  "泛称引用",
  "不代表单一钢笔型号",
  "索引条目",
];

/**
 * SQL fragment for the canonical public-entity policy.
 *
 * The alias is restricted to a plain SQL identifier so callers can safely use
 * the same policy in joins without copying publication rules.
 */
export function publicEntityFilter(alias = "e"): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(alias)) {
    throw new Error(`Invalid entity SQL alias: ${alias}`);
  }

  return `EXISTS (
    SELECT 1
    FROM public_entities public_entity
    WHERE public_entity.id = ${alias}.id
  )`;
}

/** @deprecated Prefer publicEntityFilter(alias) in new queries. */
export const PUBLIC_ENTITY_FILTER_SQL = publicEntityFilter("e");

export async function getPublicEntityBySlug(
  type: string,
  slug: string,
): Promise<PublicEntity | undefined> {
  return (await queryOne(
    `SELECT
       id,
       type,
       slug,
       name,
       summary,
       body_md,
       source,
       created_at,
       updated_at,
       source_url,
       source_file,
       imported_at
     FROM public_entities
     WHERE type = ? AND slug = ?
     LIMIT 1`,
    [type, slug],
  )) as PublicEntity | undefined;
}

export function isPublicEntity(entity: EntityVisibilityInput): boolean {
  const type = String(entity.type || "");
  const slug = String(entity.slug || "");

  if (type === "brand" || type === "pen") {
    return false;
  }

  if ((HIDDEN_DUPLICATE_ENTITY_SLUGS as readonly string[]).includes(slug)) {
    return false;
  }

  if (
    type === "concept" &&
    (HIDDEN_CONCEPT_SLUGS as readonly string[]).includes(slug)
  ) {
    return false;
  }

  if (type === "article") {
    if ((HIDDEN_ARTICLE_SLUGS as readonly string[]).includes(slug)) {
      return false;
    }
    const text = [
      entity.name || "",
      entity.summary || "",
      entity.body_md || "",
    ].join("\n");
    return !INDEX_ARTICLE_MARKERS.some((marker) => text.includes(marker));
  }

  return true;
}
