const CANONICAL_ENTITY_PATHS: Record<string, string> = {
  "pen/百乐-pilot-custom-823": "/pen/pilot-custom-823",
  "pen/百利金-pelikan-m800": "/pen/pelikan-souveran-m800",
  "pen/the-parker-51": "/pen/parker-51-vintage",
  "pen/派克-parker-51-经典-vintage": "/pen/parker-51-vintage",
  "pen/写乐-sailor-21k-pro-gear-大鱼雷": "/pen/sailor-pro-gear",
  "pen/奥罗拉-aurora": "/brand/aurora",
  "pen/kimberly-the-pen-that-saved-eversharp":
    "/article/kimberly-pockette-ballpoint-history",
  "pen/百乐-pilot-iroshizuku色彩雫": "/article/pilot-iroshizuku-ink-guide",
};

export function getCanonicalEntityPath(type: string, slug: string) {
  return CANONICAL_ENTITY_PATHS[`${type}/${slug}`] || null;
}
