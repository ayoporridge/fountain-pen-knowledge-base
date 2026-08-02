import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase107WancherBrandPack } from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE364_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE364_TARGETS = {
  nanako: {
    id: "phase364-wancher-tsugaru-nanako",
    slug: "wancher-dream-pen-tsugaru-nanako",
    name: "Wancher Dream Pen Tsugaru Urushi Nanako Nuri",
  },
  raden: {
    id: "phase364-wancher-tsugaru-raden-midori-age",
    slug: "wancher-dream-pen-tsugaru-raden-midori-age",
    name: "Wancher Dream Pen Tsugaru Urushi Raden Kara-nuri Midori-age",
  },
  shiro: {
    id: "phase364-wancher-tsugaru-shiro-age",
    slug: "wancher-dream-pen-tsugaru-shiro-age",
    name: "Wancher Dream Pen Tsugaru Urushi Kara-nuri Shiro-age",
  },
} as const;

export const PHASE364_TARGET_IDS = Object.values(PHASE364_TARGETS).map(
  (target) => target.id,
);

const RETRIEVED = "2026-08-02";
const BRAND_SCOPE = "phase364-wancher-brand-tsugaru-scope";
const SVG_PATHS = {
  nanako:
    "/images/library/site-original/phase364/wancher/dream-pen-tsugaru-nanako.svg",
  raden:
    "/images/library/site-original/phase364/wancher/dream-pen-tsugaru-raden-midori-age.svg",
  shiro:
    "/images/library/site-original/phase364/wancher/dream-pen-tsugaru-shiro-age.svg",
} as const;

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType,
    tier:
      input.tier ??
      (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl ?? (siteOriginal ? "/" : input.url),
    itemType: siteOriginal ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: siteOriginal ? "store_full" : "summary_only",
    license: siteOriginal ? "site-original" : undefined,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  scopeKey: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey,
        locator,
      },
    ],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const S = {
  collection: source({
    key: "phase364-wancher-tsugaru-collection",
    registryKey: "wancher-japan-tsugaru-collection-phase364",
    registryName: "Wancher Japan official",
    title: "Dream Pen Tsugaru Urushi collection",
    url: "https://jp.wancherpen.com/collections/dream-pen-tsugaru",
    independenceGroup: "wancher-japan-tsugaru-collection-phase364",
    summary:
      "Wancher Japan collection 将常盤色、ななこ塗、螺鈿唐塗・緑上げ和唐塗・白上げ列为津轻漆 Dream Pen 的不同商品入口；用于品牌导航和 SKU 分流，不提供每支笔的统一尺寸。",
  }),
  federationAbout: source({
    key: "phase364-tsugaru-federation-about",
    registryKey: "tsugarunuri-federation-about-phase364",
    registryName: "Aomori Lacquerware Federation",
    title: "About Tsugaru Nuri",
    url: "https://www.tsugarunuri.org/en/about.html",
    sourceType: "official",
    tier: "professional_secondary",
    independenceGroup: "tsugarunuri-federation-about-phase364",
    homepageUrl: "https://www.tsugarunuri.org/en/",
    summary:
      "青森漆器组织说明津轻漆的青森／弘前地区与江户时代背景，以及四种代表技法和多次上漆、干燥、研磨的工艺边界；不替 Wancher 发布单支产品规格。",
  }),
  federationStyles: source({
    key: "phase364-tsugaru-federation-styles",
    registryKey: "tsugarunuri-federation-styles-phase364",
    registryName: "Aomori Lacquerware Federation",
    title: "Tsugaru Nuri styles and care",
    url: "https://www.tsugarunuri.org/en/styles.html",
    sourceType: "official",
    tier: "professional_secondary",
    independenceGroup: "tsugarunuri-federation-styles-phase364",
    homepageUrl: "https://www.tsugarunuri.org/en/",
    summary:
      "青森漆器组织解释 Kara-nuri 与 Nanako-nuri 的工艺差异，并建议保持适度湿度、出现崩漆裂纹或失光时交给专业修复；用于维护和术语背景。",
  }),
  aomori: source({
    key: "phase364-aomori-tsugaru-craft",
    registryKey: "aomori-prefecture-tsugaru-craft-phase364",
    registryName: "Aomori Prefecture official",
    title: "青森县传统工艺：津轻涂",
    url: "https://www.pref.aomori.lg.jp/soshiki/sangyo/chikikigyo/aomori_dento-kogei_tsugarunuri.html",
    sourceType: "official",
    tier: "professional_secondary",
    independenceGroup: "aomori-prefecture-tsugaru-craft-phase364",
    homepageUrl: "https://www.pref.aomori.lg.jp/",
    summary:
      "青森县官方页面提供津轻涂的地区、传统工艺认定和技法背景；用于交叉核对地区工艺，不将公开的漆器流程扩大成 Wancher 每支钢笔的逐支记录。",
  }),
  nanako: source({
    key: "phase364-wancher-tsugaru-nanako-exact",
    registryKey: "wancher-japan-tsugaru-nanako-phase364",
    registryName: "Wancher Japan official",
    title: "ドリームペン - 津軽漆・ななこ塗",
    url: "https://jp.wancherpen.com/products/nanako-nuri",
    independenceGroup: "wancher-japan-tsugaru-nanako-phase364",
    summary:
      "Exact 商品页给出 Nanako 的商品身份、ebonite 与 urushi、欧洲国际标准 cartridge/converter、#6 JoWo stainless／Wancher 18K 尖、feed、密封帽和包装菜单；未给出可核实的独立尺寸数字。",
  }),
  raden: source({
    key: "phase364-wancher-tsugaru-raden-exact",
    registryKey: "wancher-japan-tsugaru-raden-midori-age-phase364",
    registryName: "Wancher Japan official",
    title: "津軽塗・緑上げ 螺鈿",
    url: "https://jp.wancherpen.com/products/raden-kara-nuri-midori-age",
    independenceGroup: "wancher-japan-tsugaru-raden-midori-age-phase364",
    summary:
      "Exact 商品页给出緑上げ螺鈿的独立身份、ebonite／urushi／raden、Kara-nuri 与薄漆手工痕迹提示、欧洲 C/C、JoWo stainless／Wancher 18K／Shogun 18K 尖和 feed 菜单。",
  }),
  shiro: source({
    key: "phase364-wancher-tsugaru-shiro-exact",
    registryKey: "wancher-japan-tsugaru-shiro-age-phase364",
    registryName: "Wancher Japan official",
    title: "唐塗・白上げ",
    url: "https://jp.wancherpen.com/products/kara-nuri-shiro-age",
    independenceGroup: "wancher-japan-tsugaru-shiro-age-phase364",
    summary:
      "Exact 商品页给出白上げ的独立身份、白漆底 Kara-nuri、ebonite 与 urushi、欧洲 C/C、#6 JoWo stainless／Wancher 18K 尖、feed、密封帽和包装菜单。",
  }),
  nanakoDiagram: source({
    key: "phase364-wancher-tsugaru-nanako-svg",
    registryKey: "fountain-pen-graph-editorial-phase364",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase364",
    title: "Wancher Tsugaru Urushi Nanako factual diagram",
    url: SVG_PATHS.nanako,
    homepageUrl: "/",
    summary:
      "本站原创 factual SVG 表达 Nanako 的 ebonite／urushi、菜种圆环概念、欧洲 C/C 与尺寸未单列边界；非产品照片、Logo、比例图或颜色校样。",
  }),
  radenDiagram: source({
    key: "phase364-wancher-tsugaru-raden-svg",
    registryKey: "fountain-pen-graph-editorial-phase364",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase364",
    title: "Wancher Tsugaru Urushi Raden Midori-age factual diagram",
    url: SVG_PATHS.raden,
    homepageUrl: "/",
    summary:
      "本站原创 factual SVG 表达绿色底 Kara-nuri、raden 贝饰、薄漆与手工痕迹边界；非产品照片、Logo、比例图或颜色校样。",
  }),
  shiroDiagram: source({
    key: "phase364-wancher-tsugaru-shiro-svg",
    registryKey: "fountain-pen-graph-editorial-phase364",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase364",
    title: "Wancher Tsugaru Urushi Shiro-age factual diagram",
    url: SVG_PATHS.shiro,
    homepageUrl: "/",
    summary:
      "本站原创 factual SVG 表达白漆底 Kara-nuri、ebonite／urushi、欧洲 C/C 与尺寸未单列边界；非产品照片、Logo、比例图或颜色校样。",
  }),
} as const;

const brand: CuratedEntityPack = structuredClone(phase107WancherBrandPack);
brand.key = "phase364-wancher-brand-navigation-v1";
brand.markdownFile = ".planning/content-research/wancher-brand-phase364.md";
brand.storyTitle = "Wancher：Dream Pen 津轻漆的三个工艺入口";
brand.sources = [
  ...brand.sources,
  S.collection,
  S.federationAbout,
  S.federationStyles,
  S.aomori,
].filter(
  (item, index, all) =>
    all.findIndex((candidate) => candidate.key === item.key) === index,
);
const brandScope = brand.scopes[0]?.scopeKey ?? BRAND_SCOPE;
brand.claims = [
  ...brand.claims,
  claim(
    "phase364-wancher-tsugaru-navigation",
    "brand_model_navigation",
    "Wancher Japan 的 Dream Pen 津轻漆 collection 将 Nanako-nuri、Raden Kara-nuri Midori-age 与 Kara-nuri Shiro-age 作为三个可独立检索的商品入口；它们与 Tokiwa-iro、Aizu、Echizen、Kyoto 和 True Urushi 保持型号边界。",
    S.collection.key,
    "Dream Pen Tsugaru collection product cards",
    brandScope,
  ),
];

type ModelKey = keyof typeof PHASE364_TARGETS;
type ModelConfig = {
  key: ModelKey;
  exact: CuratedSource;
  diagram: CuratedSource;
  markdownFile: string;
  storyTitle: string;
  technique: string;
  material: string;
  nib: string;
  nibVariants: Array<{ name: string; notes: string; sourceKey: string }>;
  identityClaim: string;
  techniqueClaim: string;
  finishClaim: string;
  extraClaims: Array<{
    key: string;
    predicate: string;
    text: string;
    source: CuratedSource;
    locator: string;
  }>;
  aliases: string[];
  variantExtra?: CuratedVariant;
};

const MODEL_CONFIGS: Record<ModelKey, ModelConfig> = {
  nanako: {
    key: "nanako",
    exact: S.nanako,
    diagram: S.nanakoDiagram,
    markdownFile:
      ".planning/content-research/wancher-dream-pen-tsugaru-nanako-phase364.md",
    storyTitle:
      "Wancher Dream Pen Tsugaru Urushi Nanako Nuri：菜种圆环如何成为身份线索",
    technique:
      "Nanako-nuri（ななこ塗）——在未干漆面撒菜种，干燥后取出并研磨显出细密圆环",
    material: "ebonite 与 urushi；Nanako-nuri 漆面工艺",
    nib: "#6 JoWo stainless 或 Wancher 18K；具体尖幅按订单和实物刻字核对",
    nibVariants: [
      {
        name: "#6 JoWo stainless",
        notes: "Exact 商品页列出的钢尖路线；不等于每支笔默认安装钢尖。",
        sourceKey: S.nanako.key,
      },
      {
        name: "Wancher 18K",
        notes: "Exact 商品页列出的金尖路线；尖幅和实际装配以订单为准。",
        sourceKey: S.nanako.key,
      },
    ],
    identityClaim:
      "Wancher Japan 的「ドリームペン - 津軽漆・ななこ塗」是独立的 Dream Pen 津轻漆商品，不是 Tokiwa-iro 或所有鱼子纹漆笔的聚合实体。",
    techniqueClaim:
      "Nanako-nuri 以菜种落在未干漆面，干燥后取出并研磨显出细小圆环；该技法说明来自 Wancher exact page 与津轻漆组织的交叉核对。",
    finishClaim:
      "Wancher exact page 将材料写为 ebonite 与 urushi；Nanako 的圆环是表面工艺身份线索，不证明漆层数量、每颗圆环比例或特定工匠履历。",
    extraClaims: [
      {
        key: "phase364-nanako-regional",
        predicate: "regional_craft_context",
        text: "青森津轻漆组织将 Nanako-nuri 列为津轻漆代表技法之一；地区工艺背景不替 Wancher 证明本支钢笔完整执行公开的漆器工序。",
        source: S.federationStyles,
        locator: "Nanako style description and traditional craft boundary",
      },
      {
        key: "phase364-nanako-care",
        predicate: "maintenance_guidance",
        text: "漆面与 ebonite 应避开热水、酒精、丙酮、强溶剂和研磨剂；青森津轻漆组织建议保持适度湿度，崩漆、裂纹或失光时寻求专业修复。",
        source: S.federationStyles,
        locator: "care guidance for lacquerware",
      },
    ],
    aliases: [
      "ドリームペン - 津軽漆・ななこ塗",
      "Dream Pen Tsugaru Urushi Nanako Nuri",
      "Nanako-nuri",
      "Wancher Nanako Urushi",
    ],
  },
  raden: {
    key: "raden",
    exact: S.raden,
    diagram: S.radenDiagram,
    markdownFile:
      ".planning/content-research/wancher-dream-pen-tsugaru-raden-midori-age-phase364.md",
    storyTitle:
      "Wancher Dream Pen Tsugaru Urushi Raden Midori-age：绿底与螺鈿的薄漆边界",
    technique:
      "Raden Kara-nuri Midori-age（緑上げ 螺鈿）——绿色底色的 Kara-nuri 层次叠加 raden 贝饰",
    material: "ebonite、urushi 与 raden；绿色底色的 Kara-nuri 漆面",
    nib: "#6 JoWo stainless、Wancher 18K 或 Shogun 18K；具体尖幅按订单和实物刻字核对",
    nibVariants: [
      {
        name: "#6 JoWo stainless",
        notes: "Exact 商品页列出的钢尖路线；不等于每支笔默认安装钢尖。",
        sourceKey: S.raden.key,
      },
      {
        name: "Wancher 18K",
        notes: "Exact 商品页列出的 Wancher 金尖路线；尖幅和实际装配以订单为准。",
        sourceKey: S.raden.key,
      },
      {
        name: "Shogun 18K",
        notes: "Exact 商品页列出的 Shogun 18K 路线；不能回填到 Nanako 或 Shiro-age。",
        sourceKey: S.raden.key,
      },
    ],
    identityClaim:
      "Wancher Japan 的「津軽塗・緑上げ 螺鈿」是独立商品；Raden、Midori-age 与 Kara-nuri 共同构成身份，不能简化为普通绿色漆笔。",
    techniqueClaim:
      "Raden Midori-age 将绿色底色 Kara-nuri 与贝饰结合；商品页提醒最终漆层较薄以保留螺鈿触感，手工刮痕可能出现。",
    finishClaim:
      "Exact 商品页把材料列为 ebonite、urushi、raden；薄漆和工具痕迹是工艺边界，不是缺陷豁免，也不证明贝片数量、天然宝石或逐支工匠姓名。",
    extraClaims: [
      {
        key: "phase364-raden-regional",
        predicate: "regional_craft_context",
        text: "青森津轻漆组织将 Kara-nuri 解释为反复上漆、干燥和研磨形成斑点的技法；该地区背景不扩大为 Wancher 每支笔完整执行传统 48 道工序。",
        source: S.federationStyles,
        locator: "Kara-nuri style description and process boundary",
      },
      {
        key: "phase364-raden-care",
        predicate: "maintenance_guidance",
        text: "螺鈿与薄漆面应避开热水、酒精、丙酮、研磨剂、硬刷和超声波；保持适度湿度，出现贝片松动、起泡、裂纹或失光时咨询 Wancher 或专业修复方。",
        source: S.federationStyles,
        locator: "lacquerware care and repair guidance",
      },
    ],
    aliases: [
      "津軽塗・緑上げ 螺鈿",
      "Dream Pen Tsugaru Urushi Raden Kara-nuri Midori-age",
      "Raden Midori-age",
      "Wancher Tsugaru Raden",
    ],
  },
  shiro: {
    key: "shiro",
    exact: S.shiro,
    diagram: S.shiroDiagram,
    markdownFile:
      ".planning/content-research/wancher-dream-pen-tsugaru-shiro-age-phase364.md",
    storyTitle:
      "Wancher Dream Pen Tsugaru Urushi Shiro-age：白底 Kara-nuri 的独立身份",
    technique:
      "Kara-nuri Shiro-age（唐塗・白上げ）——白漆底色上的津轻漆斑点层次",
    material: "ebonite 与 urushi；白漆底的 Kara-nuri 漆面",
    nib: "#6 JoWo stainless 或 Wancher 18K；具体尖幅按订单和实物刻字核对",
    nibVariants: [
      {
        name: "#6 JoWo stainless",
        notes: "Exact 商品页列出的钢尖路线；不等于每支笔默认安装钢尖。",
        sourceKey: S.shiro.key,
      },
      {
        name: "Wancher 18K",
        notes: "Exact 商品页列出的金尖路线；尖幅和实际装配以订单为准。",
        sourceKey: S.shiro.key,
      },
    ],
    identityClaim:
      "Wancher Japan 的「唐塗・白上げ」是 Dream Pen 津轻漆 collection 中独立商品；Shiro-age 的白底是工艺字段，不是 Raden Midori-age 的反色版本。",
    techniqueClaim:
      "Shiro-age 以白漆为底，主体技法仍是 Kara-nuri 的反复涂叠、干燥和研磨斑点层次；白上げ是底色与工艺组合的名称。",
    finishClaim:
      "Exact 商品页把材料列为 ebonite 与 urushi；白底、斑点密度和切削位置会影响观感，不能从页面名称推断统一色卡、层数、限量数量或品相。",
    extraClaims: [
      {
        key: "phase364-shiro-regional",
        predicate: "regional_craft_context",
        text: "青森县官方资料和津轻漆组织将 Kara-nuri 列为津轻漆代表路线，并说明反复涂、研、磨的工艺背景；这不证明本支钢笔采用公开流程的每一个步骤。",
        source: S.aomori,
        locator: "Aomori official Tsugaru Nuri techniques",
      },
      {
        key: "phase364-shiro-care",
        predicate: "maintenance_guidance",
        text: "白底漆面与 ebonite 应避开热水、酒精、丙酮、强溶剂和研磨剂；保持适度湿度，遇到崩漆、裂纹、帽口开裂或漆层翘起时停止加力并寻求专业修复。",
        source: S.federationStyles,
        locator: "lacquerware care and repair guidance",
      },
    ],
    aliases: [
      "唐塗・白上げ",
      "Dream Pen Tsugaru Urushi Kara-nuri Shiro-age",
      "Kara-nuri Shiro-age",
      "Wancher Shiro-age Urushi",
    ],
  },
};

function modelPack(config: ModelConfig): CuratedEntityPack {
  const target = PHASE364_TARGETS[config.key];
  const scopeKey = `phase364-wancher-tsugaru-${config.key}`;
  const unknownScopeKey = `${scopeKey}-unknown-fields`;
  const mediaScopeKey = `${scopeKey}-media`;
  const sharedSources = [
    config.exact,
    S.collection,
    S.federationAbout,
    S.federationStyles,
    S.aomori,
    config.diagram,
  ];
  const variants: CuratedVariant[] = [
    {
      key: `${scopeKey}-technique`,
      name: config.technique,
      notes: "Exact 商品页工艺字段；不是可以跨 SKU 复用的泛称。",
      sourceKey: config.exact.key,
      variantKind: "material",
      market: "Wancher Japan",
    },
    ...config.nibVariants.map((variant, index) => ({
      key: `${scopeKey}-nib-${index + 1}`,
      name: variant.name,
      notes: variant.notes,
      sourceKey: variant.sourceKey,
      variantKind: "nib" as const,
      market: "Wancher Japan",
    })),
    {
      key: `${scopeKey}-feed`,
      name: "Plastic / black ebonite / red ebonite feed",
      notes:
        "Exact 商品页列出的 feed 选项；实际装配以订单、拆笔或实物核对，不把三者当作同时存在。",
      sourceKey: config.exact.key,
      variantKind: "variant",
      market: "Wancher Japan",
    },
    {
      key: `${scopeKey}-accessories`,
      name: "Converter / cartridge / pen kimono / box package",
      notes:
        "Exact 商品页的配件菜单；包装与赠品可能随地区和当期商品页变动，不是长期型号定义。",
      sourceKey: config.exact.key,
      variantKind: "edition_group",
      market: "Wancher Japan",
    },
  ];
  const modelClaims: CuratedClaim[] = [
    claim(
      `${scopeKey}-identity`,
      "model_identity",
      config.identityClaim,
      config.exact.key,
      "exact Wancher Japan product title",
      scopeKey,
    ),
    claim(
      `${scopeKey}-technique`,
      "craft_technique",
      config.techniqueClaim,
      config.exact.key,
      "exact product technique description",
      scopeKey,
    ),
    claim(
      `${scopeKey}-finish`,
      "material_finish",
      config.finishClaim,
      config.exact.key,
      "exact product material and finish fields",
      scopeKey,
    ),
    claim(
      `${scopeKey}-filling`,
      "filling_system",
      "Exact 商品页将供墨写为 European standard cartridge/converter（欧洲国际标准 C/C）；它是当前页面配置，不证明每支笔的 converter 品牌、容量或密封状态。",
      config.exact.key,
      "C/C specification field",
      scopeKey,
    ),
    claim(
      `${scopeKey}-nib`,
      "nib_options",
      `Exact 商品页列出 ${config.nib}；尖材是可选路线，尖幅和实际装配必须按订单、尖面刻字和实物确认。`,
      config.exact.key,
      "nib options field",
      scopeKey,
    ),
    claim(
      `${scopeKey}-feed-cap`,
      "feed_and_cap",
      "Exact 商品页列出 plastic、black ebonite、red ebonite feed 选项，并以 airtight cap 结构减少墨水干燥；这些是菜单和结构描述，不代表每支笔同时装配全部部件。",
      config.exact.key,
      "feed and airtight-cap fields",
      scopeKey,
    ),
    claim(
      `${scopeKey}-accessories`,
      "package_accessories",
      "Exact 商品页列出 converter、cartridge、笔着物、说明书、保修书和专用盒；附件与赠品可能随地区、批次和当期商品页变动。",
      config.exact.key,
      "package and accessory fields",
      scopeKey,
    ),
    claim(
      `${scopeKey}-unknown-dimensions`,
      "physical_specification",
      "本次检查的 exact 商品页只有尺寸与形状栏目，没有可复核的闭帽长、无帽长、直径或净重数字；不从 Tokiwa、Aizu 或其他 Dream Pen 型号回填。",
      config.exact.key,
      "Size & Shape section has no numeric measurements in checked copy",
      unknownScopeKey,
    ),
    ...config.extraClaims.map((item) =>
      claim(
        item.key,
        item.predicate,
        item.text,
        item.source.key,
        item.locator,
        scopeKey,
      ),
    ),
    claim(
      `${scopeKey}-selection`,
      "selection_guidance",
      "选购和验收时核对完整日文／英文商品名、工艺词、尖面刻字、feed、converter、盒卡、笔着物、漆面纹理和实物来源；价格、库存与赠品只按交易当日留档。",
      config.exact.key,
      "exact SKU and order verification boundary",
      scopeKey,
      "editorial",
    ),
  ];
  const specValues: CuratedEntityPack["spec"] = {
    brandEntityId: PHASE364_WANCHER_BRAND_ID,
    values: {
      series_name: `Wancher Dream Pen Tsugaru Urushi ${
        config.key === "nanako"
          ? "Nanako Nuri"
          : config.key === "raden"
            ? "Raden Kara-nuri Midori-age"
            : "Kara-nuri Shiro-age"
      }`,
      release_year:
        "Exact Wancher Japan product page verified 2026-08-02; launch year not asserted",
      origin_country:
        "Japan; Wancher Japan exact product page with Aomori Tsugaru Nuri regional context",
      nib: config.nib,
      fill_system: "European international standard cartridge/converter (C/C)",
      material: config.material,
      dimensions:
        "Exact page has a Size & Shape section but no numeric measurements in checked copy; do not inherit sibling values",
      weight:
        "Exact page has no independently verifiable net-weight number in checked copy; do not inherit sibling values",
      status:
        "Exact Wancher Japan product listing verified 2026-08-02; price and inventory are mutable",
    },
    evidence: [
      evidence(
        `${scopeKey}-spec-brand`,
        "brand_entity_id",
        config.exact.key,
        scopeKey,
        "Wancher Japan exact product maker context",
      ),
      evidence(
        `${scopeKey}-spec-series`,
        "series_name",
        config.exact.key,
        scopeKey,
        "exact product title and Dream Pen collection",
      ),
      evidence(
        `${scopeKey}-spec-release`,
        "release_year",
        config.exact.key,
        scopeKey,
        "current product page retrieval date; no launch year asserted",
      ),
      evidence(
        `${scopeKey}-spec-origin`,
        "origin_country",
        config.exact.key,
        scopeKey,
        "Wancher Japan page and Aomori regional context",
      ),
      evidence(
        `${scopeKey}-spec-nib`,
        "nib",
        config.exact.key,
        scopeKey,
        "nib options field",
      ),
      evidence(
        `${scopeKey}-spec-fill`,
        "fill_system",
        config.exact.key,
        scopeKey,
        "European standard cartridge/converter field",
      ),
      evidence(
        `${scopeKey}-spec-material`,
        "material",
        config.exact.key,
        scopeKey,
        "material and finish field",
      ),
      evidence(
        `${scopeKey}-spec-dimensions`,
        "dimensions",
        config.exact.key,
        unknownScopeKey,
        "Size & Shape section with no numeric dimensions in checked copy",
      ),
      evidence(
        `${scopeKey}-spec-weight`,
        "weight",
        config.exact.key,
        unknownScopeKey,
        "no net-weight number in checked exact product copy",
      ),
      evidence(
        `${scopeKey}-spec-status`,
        "status",
        config.exact.key,
        scopeKey,
        "exact product listing checked 2026-08-02; mutable commercial fields excluded",
      ),
    ],
  };
  return {
    key: `phase364-wancher-dream-pen-tsugaru-${config.key}-v1`,
    entityId: target.id,
    expectedType: "pen",
    expectedSlug: target.slug,
    canonicalName: target.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: config.markdownFile,
    storyTitle: config.storyTitle,
    primarySourceKey: config.exact.key,
    depthTier: "A",
    aliases: config.aliases.map((alias, index) => ({
      alias,
      language: index === 0 ? "ja" : index === 3 ? "zh" : "en",
      sourceKey: config.exact.key,
    })),
    sources: sharedSources,
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        market: "Wancher Japan Dream Pen Tsugaru Urushi exact product listing",
        validFrom: "2026-08-02",
        productionState: "current",
        nibScope: "exact product page option menu; actual width and installation by order / physical pen",
        materialScope: config.material,
        editionScope: `${target.name} only; excludes the other Tsugaru Urushi SKUs and sibling Dream Pen finishes`,
      },
      {
        key: unknownScopeKey,
        scopeKey: unknownScopeKey,
        productionState: "unknown",
        editionScope:
          "No numeric dimensions, net weight or launch year was stated in the checked exact product page; do not inherit sibling values",
      },
      {
        key: mediaScopeKey,
        scopeKey: mediaScopeKey,
        productionState: "current",
        editionScope:
          "site-original factual SVG; not a product photograph, logo, scale drawing or colour proof",
      },
    ],
    claims: modelClaims,
    variants,
    spec: specValues,
    media: [
      {
        key: `phase364-${config.key}-primary-media`,
        title: `${target.name} 事实图（非产品照片）`,
        sourceKey: config.diagram.key,
        localPath: SVG_PATHS[config.key],
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样，不代表具体一支笔的纹理、尺寸、价格或库存。",
        sourceUrl: SVG_PATHS[config.key],
        usageStatus: "primary",
      },
    ],
  };
}

export const phase364WancherDreamPenTsugaruPacks: CuratedEntityPack[] = [
  brand,
  modelPack(MODEL_CONFIGS.nanako),
  modelPack(MODEL_CONFIGS.raden),
  modelPack(MODEL_CONFIGS.shiro),
];
