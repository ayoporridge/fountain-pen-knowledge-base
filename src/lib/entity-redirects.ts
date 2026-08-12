import { queryOne } from "@/lib/db";

const FILLING_SYSTEM_ARTICLE_SLUGS = [
  "capillary-pens-the-perfect-filler",
  "cartridge-pens",
  "filling-systems-overview-of-how-they-work-and-how-to-fill-them",
  "getting-over-the-hump",
  "got-a-match",
  "here-s-mud-in-your-eye-dropper",
  "lever-look-back",
  "piston-pens",
  "pneumatic-pens",
  "syringes-pulls-and-the-reverend-post",
  "take-the-plunge",
  "the-bulb",
  "traveling-on-your-thumb",
  "wring-it-out",
] as const;

const NIB_ARTICLE_SLUGS = [
  "a-case-of-the-creeps",
  "alice-in-smoothnessland",
  "better-in-the-days-of-old",
  "feeds-revolution-evolution-and-devolution",
  "feeds-whatever-happened-to-the-lucky-curve",
  "flex-a-disaster-in-the-making",
  "go-with-the-flow",
  "hitting-the-sweet-spot",
  "ick-whatisthat-stuff",
  "interchangeable-nibs-get-the-point-personally",
  "ipg-nibs",
  "lighten-up",
  "making-music-with-a-pen",
  "nib-materials",
  "nib-tuning-for-beginners",
  "nibs-does-an-oblique-nib-give-line-variation",
  "nibs-i-the-basics",
  "nibs-ii-beyond-the-basics-with-specialty-nibs",
  "nibs-iii-flex-vs-italic",
  "nibs-pelikan-interchangeability-chart",
  "nibs-pelikan-nib-grade-markings",
  "nibs-the-renew-point-by-esterbrook",
  "nibs-the-triumph-point-by-w-a-sheaffer",
  "nibz-n-the-hood",
  "semi-random-thoughts-are-modern-pens-as-good-as-old-ones",
  "singing-a-new-tune",
  "special-nibs-for-lefties",
  "specialty-nibs-your-key-to-exciting-writing",
  "steal-the-steel",
  "super-size-me",
  "the-flexible-user",
  "waterman-s-nib-color-code",
  "what-s-the-point",
  "what-you-see-is-what-you-get-or-is-it",
] as const;

const PEN_FAMILY_ARTICLE_SLUGS = [
  "the-esterbrook-model-j-family",
  "the-eversharp-fifth-avenue-and-sixty-four",
  "the-eversharp-skyline-family",
  "the-eversharp-symphony-family",
  "the-eversharp-ventura-family",
  "the-parker-parkette-and-writefine",
] as const;

export const RECLASSIFIED_ARTICLE_PATHS: Record<string, string> =
  Object.fromEntries([
    ...FILLING_SYSTEM_ARTICLE_SLUGS.map((slug) => [
      `fill_system/${slug}`,
      `/article/${slug}`,
    ]),
    ...NIB_ARTICLE_SLUGS.map((slug) => [`nib/${slug}`, `/article/${slug}`]),
    ...PEN_FAMILY_ARTICLE_SLUGS.map((slug) => [
      `pen/${slug}`,
      `/article/${slug}`,
    ]),
    ["pen/aurora-88", "/article/aurora-88"],
    ["pen/aurora-optima", "/article/aurora-optima"],
    [
      "pen/万宝龙-montblanc-大文豪系列-writers-edition",
      "/article/montblanc-writers-edition",
    ],
    [
      "pen/万宝龙-montblanc-patron-of-art-888",
      "/article/montblanc-patron-of-art",
    ],
    ["pen/wancher万佳-dream-pen", "/article/wancher-dream-pen"],
    [
      "pen/弘典-hongdian-黑森林-黑森林pro",
      "/article/hongdian-black-forest-family",
    ],
    ["pen/写乐-sailor-1911-profit系列", "/article/sailor-1911-profit"],
    ["pen/百乐-pilot-88g", "/article/pilot-88g-mr-guide"],
    ["brand/graphomatic", "/article/graphomatic"],
    ["pen/白金-platinum-出云-izumo", "/article/platinum-izumo"],
    ["pen/白金-platinum-富士旬景pnb-13000", "/article/platinum-fuji-shunkei"],
    ["pen/白金-platinum-莳绘系列", "/article/platinum-maki-e-kanazawa-leaf"],
  ]);

const CANONICAL_ENTITY_PATHS: Record<string, string> = {
  "pen/wancher-oita-urushi-kurozan":
    "/pen/wancher-oita-urushi-kurozan-fountain-pen",
  "pen/百乐-pilot-78g-78g": "/pen/pilot-78g-fp-78g",
  "pen/百乐-pilot-custom-823": "/pen/pilot-custom-823",
  "pen/百利金-pelikan-m1000": "/pen/pelikan-souveran-m1000",
  "pen/百利金-pelikan-m600": "/pen/pelikan-souveran-m600",
  "pen/百利金-pelikan-m605白乌龟":
    "/pen/pelikan-souveran-m600-tortoiseshell-white-2012",
  "pen/百利金-pelikan-m800": "/pen/pelikan-souveran-m800",
  "pen/the-parker-51": "/pen/派克-parker-51-经典-vintage",
  "pen/parker-51-vintage": "/pen/派克-parker-51-经典-vintage",
  "pen/waterman-allure-fountain-pen": "/pen/waterman-allure",
  "pen/waterman-exception-fountain-pen": "/pen/waterman-exception",
  "pen/pelikan-twist-p457": "/pen/pelikan-twist",
  "pen/sheaffer-s-touchdown-tm": "/pen/touchdown-tm",
  "pen/写乐-sailor-21k-pro-gear-大鱼雷": "/pen/sailor-pro-gear",
  "pen/写乐-sailor-1219标准鱼雷": "/pen/sailor-1911-standard",
  "pen/弘典-hongdian-苏木": "/pen/弘典-hongdian-1866",
  "pen/百乐-pilot-capless-decimo": "/pen/pilot-capless-decimo",
  "pen/维斯康蒂-visconti-homo-sapiens智人": "/brand/visconti",
  "pen/英雄派迪-一体尖": "/pen/paidi-century-1",
  "pen/kimberly-the-pen-that-saved-eversharp":
    "/article/kimberly-pockette-ballpoint-history",
  "pen/百乐-pilot-iroshizuku色彩雫": "/browse?type=article",
  ...RECLASSIFIED_ARTICLE_PATHS,
};

/**
 * Retired identities with no safe successor. Keep these in the route layer so
 * the old URL is an actual HTTP 404 rather than a streamed 404 body with a
 * 200 status from the dynamic detail page.
 */
export const HARD_404_ENTITY_PATHS = new Set([
  "/brand/banju",
  "/brand/saier",
  "/brand/shanghai",
  "/brand/yisihua",
  "/pen/leonardo-furore-momento-magico",
  "/pen/opus-88-demo-kolora",
  "/pen/sheaffer-s-craftsman",
  "/pen/skb派顿-f10-f21",
  "/pen/犀飞利-sheaffer-帝国元首",
  "/pen/奥罗拉-aurora",
]);

export function getReclassifiedArticlePath(type: string, slug: string) {
  return RECLASSIFIED_ARTICLE_PATHS[`${type}/${slug}`] || null;
}

export function getCanonicalEntityPath(type: string, slug: string) {
  return CANONICAL_ENTITY_PATHS[`${type}/${slug}`] || null;
}

export async function getDatabaseCanonicalEntityPath(
  type: string,
  slug: string,
): Promise<string | null> {
  const row = (await queryOne(
    "SELECT target_path FROM entity_redirects WHERE source_path = ? AND redirect_kind = 'permanent'",
    [`/${type}/${slug}`],
  )) as { target_path?: unknown } | undefined;
  const targetPath =
    typeof row?.target_path === "string" ? row.target_path : "";
  return targetPath.startsWith("/") && !targetPath.startsWith("//")
    ? targetPath
    : null;
}
