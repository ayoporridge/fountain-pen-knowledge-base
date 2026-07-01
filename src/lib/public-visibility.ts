type EntityVisibilityInput = {
  type?: string | number | null;
  slug?: string | number | null;
  name?: string | null;
  summary?: string | null;
  body_md?: string | null;
};

const HIDDEN_BRAND_SLUGS = ["banju", "yongxu"] as const;

const INDEX_ARTICLE_MARKERS = [
  "品牌资料索引",
  "品牌索引",
  "品牌泛称",
  "泛称页",
  "泛称引用",
  "不代表单一钢笔型号",
  "索引条目",
];

const quotedHiddenBrandSlugs = HIDDEN_BRAND_SLUGS.map(
  (slug) => `'${slug}'`,
).join(", ");

const articleMarkerSql = INDEX_ARTICLE_MARKERS.map(
  (marker) => `
        COALESCE(e.name, '') LIKE '%${marker}%'
        OR COALESCE(e.summary, '') LIKE '%${marker}%'
        OR COALESCE(e.body_md, '') LIKE '%${marker}%'`,
).join("\n        OR ");

export const PUBLIC_ENTITY_FILTER_SQL = `
  NOT (
    (e.type = 'brand' AND e.slug IN (${quotedHiddenBrandSlugs}))
    OR (
      e.type = 'article'
      AND (
        ${articleMarkerSql}
      )
    )
  )
`;

export function isPublicEntity(entity: EntityVisibilityInput): boolean {
  const type = String(entity.type || "");
  const slug = String(entity.slug || "");

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
