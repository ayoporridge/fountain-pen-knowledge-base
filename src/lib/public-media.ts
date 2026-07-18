const PUBLIC_MEDIA_LICENSES = [
  "site-original",
  "CC0",
  "CC BY 2.0",
  "CC BY 4.0",
  "CC BY-SA 3.0 de",
  "CC BY-SA 4.0",
  "Public domain",
  "cc0",
  "cc0-1.0",
  "public-domain",
  "cc-by",
  "cc-by-2.0",
  "cc-by-3.0",
  "cc-by-4.0",
  "cc-by-sa",
  "cc-by-sa-2.0",
  "cc-by-sa-3.0",
  "cc-by-sa-4.0",
  "BSD",
] as const;

export const HIDDEN_PUBLIC_MEDIA_IDS = [
  "media-commerce-17bd4022734d00",
  "media-commerce-5432bf80034489",
  "media-commerce-5b30ac3afb8f60",
  "media-commerce-655bb8f26c384e",
  "media-commerce-b7110f8db39036",
  "media-source-93e686ac8fdc26",
  "media-warm-pen-atlas-douwan-placeholder-cover",
  "media-warm-pen-atlas-hero-paddy-placeholder-cover",
  "media-warm-pen-atlas-jinxing-placeholder-cover",
  "media-warm-pen-atlas-lily-placeholder-cover",
  "media-warm-pen-atlas-zhangjiang-placeholder-cover",
] as const;

function quoteSqlLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

/**
 * Public image policy for entity cards and detail pages.
 *
 * The research database intentionally retains licensed metadata and image
 * candidates that may not be republished. Public surfaces only use reviewed
 * media with an explicit reusable licence, and never use the old rotating
 * Warm Pen Atlas placeholders as if they depicted the current entity.
 */
export function publicMediaFilter(alias = "ma"): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(alias)) {
    throw new Error(`Invalid media SQL alias: ${alias}`);
  }

  const licenses = PUBLIC_MEDIA_LICENSES.map(quoteSqlLiteral).join(", ");
  const hiddenIds = HIDDEN_PUBLIC_MEDIA_IDS.map(quoteSqlLiteral).join(", ");

  return `${alias}.asset_type = 'image'
    AND ${alias}.review_status = 'approved'
    AND ${alias}.usage_status IN ('primary', 'gallery')
    AND ${alias}.license IN (${licenses})
    AND ${alias}.id NOT IN (${hiddenIds})
    AND ${alias}.id NOT LIKE 'warm-pen-atlas-card-%'
    AND (
      ${alias}.local_path IS NOT NULL
      OR ${alias}.image_url LIKE '/%'
      OR ${alias}.thumbnail_url LIKE '/%'
    )
    AND (
      ${alias}.local_path IS NOT NULL
      OR ${alias}.image_url IS NOT NULL
      OR ${alias}.thumbnail_url IS NOT NULL
    )`;
}
