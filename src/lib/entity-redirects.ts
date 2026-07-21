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
    [
      "pen/万宝龙-montblanc-大文豪系列-writers-edition",
      "/article/montblanc-writers-edition",
    ],
    [
      "pen/万宝龙-montblanc-patron-of-art-888",
      "/article/montblanc-patron-of-art",
    ],
    ["pen/wancher万佳-dream-pen", "/article/wancher-dream-pen"],
  ]);

const CANONICAL_ENTITY_PATHS: Record<string, string> = {
  "pen/百乐-pilot-custom-823": "/pen/pilot-custom-823",
  "pen/百利金-pelikan-m1000": "/pen/pelikan-souveran-m1000",
  "pen/百利金-pelikan-m600": "/pen/pelikan-souveran-m600",
  "pen/百利金-pelikan-m605白乌龟":
    "/pen/pelikan-souveran-m600-tortoiseshell-white-2012",
  "pen/百利金-pelikan-m800": "/pen/pelikan-souveran-m800",
  "pen/the-parker-51": "/pen/parker-51-vintage",
  "pen/派克-parker-51-经典-vintage": "/pen/parker-51-vintage",
  "pen/写乐-sailor-21k-pro-gear-大鱼雷": "/pen/sailor-pro-gear",
  "pen/写乐-sailor-1219标准鱼雷": "/pen/sailor-1911-standard",
  "pen/奥罗拉-aurora": "/brand/aurora",
  "pen/kimberly-the-pen-that-saved-eversharp":
    "/article/kimberly-pockette-ballpoint-history",
  "pen/百乐-pilot-iroshizuku色彩雫": "/browse?type=article",
  ...RECLASSIFIED_ARTICLE_PATHS,
};

export function getReclassifiedArticlePath(type: string, slug: string) {
  return RECLASSIFIED_ARTICLE_PATHS[`${type}/${slug}`] || null;
}

export function getCanonicalEntityPath(type: string, slug: string) {
  return CANONICAL_ENTITY_PATHS[`${type}/${slug}`] || null;
}
