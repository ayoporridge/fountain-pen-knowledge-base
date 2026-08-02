import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase50WatermanCareneExpertPacks } from "./phase50-waterman-carene-expert";

export const PHASE358_WATERMAN_BRAND_ID = "zkAu9PePDdqJ";
export const PHASE358_TARGET_ID = "phase358-waterman-edson";
export const PHASE358_TARGET_SLUG = "waterman-edson";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase358-waterman-edson-historical";
const SVG_PATH = "/images/library/site-original/phase358/waterman/edson.svg";

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
  const isSiteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl ?? (isSiteOriginal ? "/" : input.url),
    itemType: isSiteOriginal ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: isSiteOriginal ? "store_full" : "summary_only",
    license: isSiteOriginal ? "site-original" : undefined,
    archiveUrl: input.url,
    archiveLocator: isSiteOriginal
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
  scopeKey: string = SCOPE,
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
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
  scopeKey: string = SCOPE,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const S = {
  history: source({
    key: "phase358-waterman-edson-official-history",
    registryKey: "waterman-official-heritage-phase358",
    registryName: "Waterman official heritage",
    title: "Waterman heritage timeline — Expert and Edson",
    url: "https://www.waterman.fr/waterman-history.html",
    independenceGroup: "waterman-official-heritage-phase358",
    summary:
      "法国官方历史把 Expert 放在 1990–92，并写明椭圆、未来感的 Edson 随后出现；它支持早期 1990s 的系列时间窗，不替代具体颜色商品号。",
  }),
  koreanHistory: source({
    key: "phase358-waterman-edson-korean-heritage",
    registryKey: "waterman-korean-official-heritage-phase358",
    registryName: "Waterman Korea official",
    title: "Waterman heritage — Expert and Edson 1990–92",
    url: "https://www.waterman.co.kr/m/page.html?id=9",
    independenceGroup: "waterman-korean-official-heritage-phase358",
    summary:
      "Waterman 韩国官方 heritage 将 Expert 与 Edson 并列在 1990–92，强调 Edson 的独特椭圆未来感设计；这是地区官方历史页，不承诺今天库存。",
  }),
  catalogue: source({
    key: "phase358-waterman-edson-trade-catalogue",
    registryKey: "waterman-trade-catalogue-2015-phase358",
    registryName: "Waterman trade catalogue archive",
    title: "Waterman 2015 trade catalogue — Edson legendary design",
    url: "https://www.watermanromania.ro/cataloage1/Waterman/2015.pdf",
    sourceType: "retailer",
    tier: "contemporary_archive",
    independenceGroup: "waterman-trade-catalogue-2015-phase358",
    homepageUrl: "https://www.watermanromania.ro/",
    publishedAt: "2015",
    summary:
      "贸易目录镜像记录 Edson 的 twin-shell precious resin、18K gold（Diamond Black 铑镀）、F/M 常规字幅、透明蓝／黑颜色和 31 个部件语境；目录事实不等于当前在售。",
  }),
  japaneseCatalogue: source({
    key: "phase358-waterman-edson-diamond-black-catalogue",
    registryKey: "waterman-pen-jp-edson-phase358",
    registryName: "Waterman Pen Catalogue Japan",
    title: "Edson Diamond Black — Japanese professional catalogue",
    url: "https://waterman-pen.jp/edson/%E3%82%A8%E3%83%89%E3%82%BD%E3%83%B3-%E3%83%80%E3%82%A4%E3%83%A4%E3%83%A2%E3%83%B3%E3%83%89%E3%83%BB%E3%83%96%E3%83%A9%E3%83%83%E3%82%AF/",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "waterman-pen-jp-edson-phase358",
    homepageUrl: "https://waterman-pen.jp/",
    publishedAt: "2012-02-28",
    summary:
      "日本专业目录给出 Diamond Black 的 S2 210 172 F、S2 210 173 M、18K 铑镀尖、SAN 漆面、黄铜帽与 cartridge/converter，以及套帽 155 mm、轴径 15 mm、43 g。",
  }),
  care: source({
    key: "phase358-waterman-edson-care",
    registryKey: "waterman-official-care-phase358",
    registryName: "Waterman official support",
    title: "Fountain pen storage and cleaning recommendations",
    url: "https://www.waterman.com/support?cfid=fountain-pen-storage-and-cleaning-recommendations",
    independenceGroup: "waterman-official-care-phase358",
    summary:
      "Waterman 官方维护建议要求换墨时用冷水清洗、必要时浸泡并自然干燥，储存时让笔尖朝上；用于维护动作，不替 Edson 提供尺寸或材料。",
  }),
  penAddict: source({
    key: "phase358-waterman-edson-pen-addict",
    registryKey: "pen-addict-edson-phase358",
    registryName: "The Pen Addict",
    title: "Old but new to me: the Waterman Edson Sapphire",
    url: "https://www.penaddict.com/blog/2019/3/22/old-but-new-to-me-the-waterman-edson-sapphire",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict-edson-phase358",
    author: "The Pen Addict",
    publishedAt: "2019-03-22",
    summary:
      "专业评测以 Sapphire 实物补充 Edson 的透明蓝树脂、18K 尖、帽夹和日常使用观察；个人样本不升级为所有颜色的统一尺寸、墨流或库存结论。",
  }),
  fpn: source({
    key: "phase358-waterman-edson-fpn",
    registryKey: "fountain-pen-network-edson-phase358",
    registryName: "Fountain Pen Network",
    title: "Waterman Edson review and filling discussion",
    url: "https://www.fountainpennetwork.com/forum/topic/37182-waterman-edson-review/",
    sourceType: "forum",
    tier: "professional_secondary",
    independenceGroup: "fountain-pen-network-edson-phase358",
    summary:
      "钢笔专业论坛记录 Sapphire 等 Edson 样本的 18K 尖、透明树脂和 C/C 体验；论坛内容用于颜色与使用边界，不替目录给出统一商品规格。",
  }),
  diagram: source({
    key: "phase358-waterman-edson-svg",
    registryKey: "fountain-pen-graph-editorial-phase358",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase358",
    title: "Waterman Edson factual diagram",
    url: SVG_PATH,
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    summary:
      "本站原创 factual SVG，表达 Edson 的早期 1990s 时间锚点、椭圆双层树脂、18K 铑镀尖、C/C 与 Diamond Black 目录尺寸；非产品照片和颜色校样。",
  }),
} as const;

const inheritedBrand = phase50WatermanCareneExpertPacks.find(
  (pack) => pack.entityId === PHASE358_WATERMAN_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 358 Waterman brand prerequisite is missing.");

const brand = structuredClone(inheritedBrand);
brand.key = "phase358-waterman-brand-navigation-v1";
brand.markdownFile = ".planning/content-research/waterman-brand-phase358.md";
brand.storyTitle = "Waterman：Carène、Expert、Hémisphère、Allure 与 Edson 导航";
brand.sources = [...brand.sources, S.history, S.koreanHistory, S.catalogue].filter(
  (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
);
const brandScope = brand.scopes[0]?.scopeKey ?? "phase358-waterman-brand-navigation";
brand.claims = [
  ...brand.claims,
  {
    key: "phase358-waterman-edson-navigation",
    predicate: "series_navigation",
    objectText:
      "Waterman 品牌页新增 Edson 独立入口；官方历史将其置于 1990–92 Expert 之后，Edson 的椭圆双层树脂与 18K 尖不能与 Carène、Expert、Hémisphère 或 Allure 合并。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.history.key,
    locator: "official heritage timeline and family boundary",
    evidence: [
      {
        key: "phase358-waterman-edson-navigation-evidence",
        sourceKey: S.history.key,
        scopeKey: brandScope,
        locator: "Expert 1990–92 followed by futuristic elliptical Edson",
      },
    ],
  } satisfies CuratedClaim,
];

const model: CuratedEntityPack = {
  key: "phase358-waterman-edson-v1",
  entityId: PHASE358_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE358_TARGET_SLUG,
  canonicalName: "威迪文 Waterman Edson",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/waterman-edson-phase358.md",
  storyTitle: "Waterman Edson：早期 1990s 的椭圆高端树脂与 18K 尖",
  primarySourceKey: S.history.key,
  depthTier: "A",
  aliases: [
    { alias: "Waterman Edson", language: "en", sourceKey: S.history.key },
    { alias: "Edson fountain pen", language: "en", sourceKey: S.catalogue.key },
    { alias: "Waterman Edson Diamond Black", language: "en", sourceKey: S.japaneseCatalogue.key },
    { alias: "Waterman Edson Sapphire", language: "en", sourceKey: S.penAddict.key },
    { alias: "威迪文 Edson", language: "zh", sourceKey: S.history.key },
    { alias: "威迪文 埃德森", language: "zh", sourceKey: S.koreanHistory.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Waterman Edson fountain pen family",
      validFrom: "1990–92",
      productionState: "historical",
      nibScope: "18K solid gold; Diamond Black rhodium-plated; catalogue F/M and ordered historical widths",
      materialScope: "twin-shell precious resin / SAN lacquer body; brass cap and plated trims by variant",
      editionScope: "Edson fountain pen only; rollerball and ballpoint siblings are excluded",
    },
    {
      key: `${SCOPE}-diamond-black`,
      scopeKey: `${SCOPE}-diamond-black`,
      validFrom: "2012",
      productionState: "historical",
      nibScope: "S2 210 172 F and S2 210 173 M in Japanese professional catalogue",
      materialScope: "double-layer black resin/SAN lacquer; satin platinum cap; platinum-plated brass trim",
      editionScope: "Diamond Black catalogue sample only; 155 mm posted, 15 mm diameter, 43 g",
    },
    {
      key: `${SCOPE}-media`,
      scopeKey: `${SCOPE}-media`,
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo, logo, scale drawing or colour proof",
    },
  ],
  claims: [
    claim("phase358-identity", "model_identity", "Waterman Edson 是 1990–92 年 Expert 之后出现的独立椭圆高端系列，不是 Carène、Expert 或 Exception 的别名。", S.history.key, "official heritage timeline"),
    claim("phase358-name", "name_origin", "Edson 使用创始人 Lewis Edson Waterman 的中间名；名称来源不改变钢笔、滚珠笔和圆珠笔之间的书写工具边界。", S.catalogue.key, "Edson catalogue introduction"),
    claim("phase358-design", "design_language", "trade catalogue 将 Edson 归为 streamline、generous cigar-shape，笔身为 twin-shell precious resin；颜色和透明度随 variant 与批次核对。", S.catalogue.key, "Edson product strengths and barrel fields"),
    claim("phase358-nib", "nib_material", "公开目录记录 18K solid gold；Diamond Black 为 rhodium-plated 18K，常规 F/M 商品号与其他订购字幅必须按具体 SKU 区分。", S.catalogue.key, "nib and nib-grade fields"),
    claim("phase358-diamond-spec", "sku_specification", "日本专业目录把 Diamond Black F/M 写成 S2 210 172 与 S2 210 173，并给出 SAN 漆面、黄铜帽、satin platinum、155 mm、15 mm、43 g。", S.japaneseCatalogue.key, "Diamond Black exact SKU and specification table"),
    claim("phase358-filling", "filling_system", "Edson fountain pen 使用 Waterman cartridge/converter 两用路线；滚珠笔和圆珠笔不共享该供墨结论。", S.japaneseCatalogue.key, "cartridge/converter function field"),
    claim("phase358-colours", "version_boundary", "Sapphire Blue、Diamond Black、Ruby Red、Emerald 等是 Edson 的颜色或 edition 线索；125 周年限量和特殊金属饰件不能回填普通款。", S.catalogue.key, "catalogue colour and limited-edition boundary"),
    claim("phase358-care", "maintenance_guidance", "按 Waterman 官方建议用冷水清洗、必要时浸泡并自然干燥，储存时让笔尖朝上；避免热水、酒精、溶剂和金属抛光剂。", S.care.key, "official fountain pen storage and cleaning recommendations"),
    claim("phase358-selection", "selection_guidance", "购买中古 Edson 要核对尖面刻字、颜色与帽夹是否同套、converter 接口、盒卡和商品号；目录尺寸只绑定到相应颜色样本。", S.japaneseCatalogue.key, "exact SKU and market boundary", SCOPE, "editorial"),
    claim("phase358-media", "media_identity_boundary", "本站原创 SVG 是事实示意图，非产品照片、非 Logo、非比例图、非颜色校样，不证明某支实物的库存或颜色分布。", S.diagram.key, "site-original SVG metadata", `${SCOPE}-media`, "editorial"),
  ],
  variants: [
    { key: "phase358-edson-diamond-black-f", name: "Edson Diamond Black F", releaseYear: "2012 catalogue", productCode: "S2 210 172", notes: "日本专业目录记录 18K rhodium-plated F 尖；尺寸与 43 g 绑定于该目录样本。", sourceKey: S.japaneseCatalogue.key, variantKind: "market_sku", market: "Japan catalogue" },
    { key: "phase358-edson-diamond-black-m", name: "Edson Diamond Black M", releaseYear: "2012 catalogue", productCode: "S2 210 173", notes: "日本专业目录记录 18K rhodium-plated M 尖；不能将 F/M 商品号外推到其他颜色。", sourceKey: S.japaneseCatalogue.key, variantKind: "market_sku", market: "Japan catalogue" },
    { key: "phase358-edson-sapphire", name: "Edson Sapphire Blue", releaseYear: "历史目录／专业样本", notes: "透明深蓝树脂路线；尖宽、饰件和 converter 以具体实物与目录核对。", sourceKey: S.penAddict.key, variantKind: "color", market: "historical market" },
    { key: "phase358-edson-ruby", name: "Edson Ruby Red", releaseYear: "历史市场", notes: "红色 Edson 颜色变体；不使用 Diamond Black 的铑层和尺寸结论。", sourceKey: S.fpn.key, variantKind: "color", market: "historical market" },
    { key: "phase358-edson-emerald", name: "Edson Emerald", releaseYear: "历史市场", notes: "绿色 Edson 颜色线索；二手页面需核对真伪、胶黏剂状态和尖宽。", sourceKey: S.fpn.key, variantKind: "color", market: "historical market" },
    { key: "phase358-edson-125", name: "Edson 125 ans limited edition", releaseYear: "2008", productCode: "Edson 125 ans", notes: "品牌 125 周年限量，目录记录 1,883 支；特殊 palladium/lacquer 边界不覆盖普通 Edson。", sourceKey: S.catalogue.key, variantKind: "edition_group", market: "trade catalogue" },
  ],
  spec: {
    brandEntityId: PHASE358_WATERMAN_BRAND_ID,
    values: {
      series_name: "Waterman Edson",
      release_year: "1990–92（官方历史将其置于 Expert 之后）",
      origin_country: "Waterman Paris 产品线；具体制造地按目录、包装与刻字核对",
      nib: "18K solid gold; Diamond Black rhodium-plated; F/M catalogue SKUs and other widths by order or vintage variant",
      fill_system: "Waterman cartridge/converter",
      material: "twin-shell precious resin / styrene-acrylonitrile lacquer body; brass cap and plated trim by variant",
      dimensions: "Diamond Black catalogue: 155 mm posted, 15 mm diameter, 43 g",
      status: "historical high-end series; colours, nib widths, stock and service vary by date and market",
    },
    evidence: [
      evidence("phase358-brand", "brand_entity_id", S.history.key, "Waterman official identity"),
      evidence("phase358-series", "series_name", S.history.key, "official Edson title"),
      evidence("phase358-release", "release_year", S.history.key, "1990–92 Expert and Edson timeline"),
      evidence("phase358-origin", "origin_country", S.history.key, "Waterman Paris heritage context; no factory inference"),
      evidence("phase358-nib", "nib", S.japaneseCatalogue.key, "18K rhodium-plated Diamond Black and F/M SKU rows"),
      evidence("phase358-fill", "fill_system", S.japaneseCatalogue.key, "cartridge/converter function field"),
      evidence("phase358-material", "material", S.japaneseCatalogue.key, "SAN lacquer body, brass cap and platinum trim fields"),
      evidence("phase358-dimensions", "dimensions", S.japaneseCatalogue.key, "Diamond Black capped/postable dimensions"),
      evidence("phase358-status", "status", S.catalogue.key, "historical catalogue and variant boundary"),
    ],
  },
  timeline: [
    {
      key: "phase358-edson-release",
      title: "Edson 进入 Waterman 产品史",
      eventType: "model_released",
      startDate: "1990",
      circa: true,
      description: "官方 heritage 把 Edson 放在 1990–92 Expert 之后；这里以早期 1990s 作为历史时间窗，不虚构具体颜色首发日。",
      sourceKey: S.history.key,
    },
    {
      key: "phase358-edson-125",
      title: "Edson 125 ans 限量",
      eventType: "design_milestone",
      startDate: "2008",
      circa: false,
      description: "贸易目录记录品牌 125 周年 Edson 125 ans 限量 1,883 支；其特殊漆面和金属边界独立于普通 Diamond Black。",
      sourceKey: S.catalogue.key,
    },
  ],
  media: [
    {
      key: "phase358-edson-primary-media",
      title: "Waterman Edson 事实图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export const phase358WatermanEdsonPacks: CuratedEntityPack[] = [brand, model];
