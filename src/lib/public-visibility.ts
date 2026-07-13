type EntityVisibilityInput = {
  type?: string | number | null;
  slug?: string | number | null;
  name?: string | null;
  summary?: string | null;
  body_md?: string | null;
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

export const INDEX_ARTICLE_MARKERS = [
  "品牌资料索引",
  "品牌索引",
  "品牌泛称",
  "泛称页",
  "泛称引用",
  "不代表单一钢笔型号",
  "索引条目",
];

function quoteSqlLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

/**
 * SQL fragment for the site's public-entity policy.
 *
 * The alias is restricted to a plain SQL identifier so callers can safely use
 * the same policy in joins without copying (and eventually drifting from) the
 * hidden-content rules.
 */
export function publicEntityFilter(alias = "e"): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(alias)) {
    throw new Error(`Invalid entity SQL alias: ${alias}`);
  }

  const hiddenBrandSlugs = HIDDEN_BRAND_SLUGS.map(quoteSqlLiteral).join(", ");
  const hiddenDuplicateSlugs =
    HIDDEN_DUPLICATE_ENTITY_SLUGS.map(quoteSqlLiteral).join(", ");
  const articleMarkerSql = INDEX_ARTICLE_MARKERS.map((marker) => {
    const pattern = quoteSqlLiteral(`%${marker}%`);
    return `COALESCE(${alias}.name, '') LIKE ${pattern}
        OR COALESCE(${alias}.summary, '') LIKE ${pattern}
        OR COALESCE(${alias}.body_md, '') LIKE ${pattern}`;
  }).join("\n        OR ");

  return `NOT (
    ${alias}.slug IN (${hiddenDuplicateSlugs})
    OR (${alias}.type = 'brand' AND ${alias}.slug IN (${hiddenBrandSlugs}))
    OR (
      ${alias}.type = 'article'
      AND (
        ${articleMarkerSql}
      )
    )
  )`;
}

/** @deprecated Prefer publicEntityFilter(alias) in new queries. */
export const PUBLIC_ENTITY_FILTER_SQL = publicEntityFilter("e");

export function isPublicEntity(entity: EntityVisibilityInput): boolean {
  const type = String(entity.type || "");
  const slug = String(entity.slug || "");

  if ((HIDDEN_DUPLICATE_ENTITY_SLUGS as readonly string[]).includes(slug)) {
    return false;
  }

  if (
    type === "brand" &&
    (HIDDEN_BRAND_SLUGS as readonly string[]).includes(slug)
  ) {
    return false;
  }

  if (type === "article") {
    const text = [
      entity.name || "",
      entity.summary || "",
      entity.body_md || "",
    ].join("\n");
    return !INDEX_ARTICLE_MARKERS.some((marker) => text.includes(marker));
  }

  return true;
}
