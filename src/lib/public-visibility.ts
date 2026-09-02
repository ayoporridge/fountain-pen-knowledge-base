import { queryOne, queryOneUnchecked } from "@/lib/db";
import {
  HIDDEN_ARTICLE_SLUGS,
  HIDDEN_CONCEPT_SLUGS,
} from "@/lib/public-route-policy";

export {
  HIDDEN_ARTICLE_SLUGS,
  HIDDEN_CONCEPT_SLUGS,
} from "@/lib/public-route-policy";

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
  "parker-51-vintage",
  "写乐-sailor-21k-pro-gear-大鱼雷",
  "奥罗拉-aurora",
] as const;

/**
 * Imported pages that are incomplete, administrative, or still working notes.
 * They remain in the database for source recovery, but must not appear on any
 * public surface until an editor has restored and reviewed the full article.
 */
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

/**
 * Middleware-only variant that avoids the migration-directory readiness
 * check. The route page performs the full guarded read after middleware.
 */
export async function getPublicEntityBySlugForMiddleware(
  type: string,
  slug: string,
): Promise<PublicEntity | undefined> {
  return (await queryOneUnchecked(
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
