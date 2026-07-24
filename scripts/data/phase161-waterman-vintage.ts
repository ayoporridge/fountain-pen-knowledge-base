import type {
  CuratedClaimEvidence,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  phase83WatermanCurrentPacks,
  PHASE83_WATERMAN_BRAND_ID,
} from "./phase83-waterman-current";

export const PHASE161_IDS = {
  hundredYear: "uv2i39w3bdq8",
  inkVue: "qARhZdSptc8L",
  xPen: "R-NhnAX3A7no",
} as const;
export const PHASE161_WATERMAN_BRAND_ID = PHASE83_WATERMAN_BRAND_ID;
export const PHASE161_RETRIEVED = "2026-07-24";
const SCOPE = "phase161-waterman-vintage";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    ...input,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: PHASE161_RETRIEVED,
    allowedUse: "summary_only",
    independenceGroup: input.registryKey,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${PHASE161_RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase161",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase161",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: PHASE161_RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  history: web({
    key: "phase161-waterman-history",
    title: "Waterman Heritage",
    url: "https://www.waterman.com/waterman-history.html",
    registryKey: "waterman-official-phase161",
    registryName: "Waterman",
    sourceType: "official",
    tier: "primary",
    summary: "Waterman 官方 heritage 页面提供品牌与历史产品线背景；历史型号的具体版本仍以档案和实物交叉核对。",
    locator: "heritage and brand timeline",
  }),
  care: web({
    key: "phase161-waterman-care",
    title: "Waterman fountain pen filling instructions",
    url: "https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions",
    registryKey: "waterman-official-phase161",
    registryName: "Waterman",
    sourceType: "official",
    tier: "primary",
    summary: "官方说明用于现代 Waterman 上墨与冷水清洁边界；历史杠杆、bulb 与毛细储墨笔不能照搬 cartridge/converter 步骤。",
    locator: "filling instructions and cold-water cleaning",
  }),
  hundred: web({
    key: "phase161-hundred-year-azahara",
    title: "Azahara Estilográficas：Waterman’s Hundred Year",
    url: "https://azaharaestilograficas.com/waterman/watermans-hundred-year/",
    registryKey: "azahara-phase161-hundred-year",
    registryName: "Azahara Estilográficas",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立历史资料记录 1939 年发布、Lucite/celluloid 材料转换、No.17/18、杠杆、Inkquaduct 与多种尺寸。",
    locator: "history, materials, nib numbers, lever and Inkquaduct sections",
  }),
  hundredPencil: web({
    key: "phase161-hundred-year-pencil",
    title: "Pencil Ponder：WW II and the Waterman 100 Year",
    url: "https://pencilponder.blogspot.com/2017/06/ww-ii-and-the-waterman-100-year.html",
    registryKey: "pencil-ponder-phase161-hundred-year",
    registryName: "Pencil Ponder",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "资料补充战争时期 Lucite/celluloid、军事材料语境和 Hundred Year/Emblem 的年代边界。",
    locator: "WWII material transition and model boundary",
  }),
  inkVue: web({
    key: "phase161-ink-vue-vintagepens",
    title: "Vintage Pens：Waterman Ink-Vue",
    url: "https://vintagepens.com/Waterman_Ink-Vue.shtml",
    registryKey: "vintagepens-phase161-ink-vue",
    registryName: "David Nishimura / Vintage Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "档案记录 1935 年推出、透明 barrel、横向压缩 bulb、一体/铰接杠杆、84、No.5、Tip-Fill、De Luxe、Lady Patricia 与 5116。",
    locator: "model history, filling mechanism, 84/De Luxe/Lady Patricia/5116 versions",
  }),
  inkVueFpn: web({
    key: "phase161-ink-vue-fpn",
    title: "Fountain Pen Network：Waterman Ink-Vue Pen Profile",
    url: "https://www.fountainpennetwork.com/forum/topic/110167-waterman-ink-vue-pen-profile/",
    registryKey: "fpn-phase161-ink-vue",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "professional_secondary",
    summary: "社区资料用于交叉核对 Ink-Vue 的历史样本、维修讨论和版本边界，不作为单一规格目录。",
    locator: "Ink-Vue profile and repair discussion",
  }),
  inkVueRavens: web({
    key: "phase161-ink-vue-ravens",
    title: "Ravens March：Ink-Vue Dissections",
    url: "https://dirck.delint.ca/beta/?page_id=304",
    registryKey: "ravens-march-phase161-ink-vue",
    registryName: "Ravens March Fountain Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "拆解资料帮助限定 bulb、washer、plug 和密封维修风险。",
    locator: "Ink-Vue dissection and repair details",
  }),
  xPen: web({
    key: "phase161-x-pen-vintagepens",
    title: "Vintage Pens：Waterman X-Pen",
    url: "https://vintagepens.com/Waterman_X-Pen.shtml",
    registryKey: "vintagepens-phase161-x-pen",
    registryName: "David Nishimura / Vintage Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "档案记录法国 X-Pen 与 Parker 61 的时代关系、织物 wick、笔尖浸入式填充、不可拆清洁与晚期可拆 barrel 例外。",
    locator: "X-Pen mechanism, filling and cleaning instructions",
  }),
  xPenPeyton: web({
    key: "phase161-x-pen-peyton",
    title: "Peyton Street Pens：Waterman X-Pen Junior, France 1957–1959",
    url: "https://www.peytonstreetpens.com/waterman-x-pen-junior-france-1957-9-black-w-chrome-plated-cap-capillary-filling-medium-steel-nib-excellent-in-box-works-well.html",
    registryKey: "peyton-phase161-x-pen",
    registryName: "Peyton Street Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "实物档案给出法国 1957–1959、5-3/16 英寸、capillary filler、hooded steel nib、织物吸墨、单墨建议和帽盖密封观察。",
    locator: "product description: manufacturer/year, length, capillary, nib and cap seal",
  }),
  xPenCapillary: web({
    key: "phase161-x-pen-capillary-instructions",
    title: "Vintage Pens：Capillary Filling Instructions",
    url: "https://vintagepens.com/filling_instructions_capillary.shtml",
    registryKey: "vintagepens-phase161-capillary",
    registryName: "David Nishimura / Vintage Pens",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "毛细上墨说明页作为时期档案，用于限定浸泡和清洁操作的历史边界。",
    locator: "capillary filling instructions",
  }),
  xPenRavens: web({
    key: "phase161-x-pen-ravens",
    title: "Ravens March：Waterman X-Pen",
    url: "https://dirck.delint.ca/beta/?page_id=3569",
    registryKey: "ravens-march-phase161-x-pen",
    registryName: "Ravens March Fountain Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立资料补充法国制造、毛细 wick 和有限清洁的收藏语境。",
    locator: "French X-Pen and capillary reservoir notes",
  }),
  hundredSvg: diagram("phase161-hundred-year-svg", "Waterman Hundred Year factual diagram", "/images/library/site-original/phase161/waterman/hundred-year.svg"),
  inkVueSvg: diagram("phase161-ink-vue-svg", "Waterman Ink-Vue factual diagram", "/images/library/site-original/phase161/waterman/ink-vue.svg"),
  xPenSvg: diagram("phase161-x-pen-svg", "Waterman X-Pen factual diagram", "/images/library/site-original/phase161/waterman/x-pen.svg"),
} as const;

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}
function claimEvidence(key: string, sourceKey: string, locator: string): CuratedClaimEvidence {
  return { key, sourceKey, scopeKey: SCOPE, locator };
}

type Input = {
  key: string;
  id: string;
  slug: string;
  name: string;
  file: string;
  title: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra: CuratedSource[];
  art: CuratedSource;
  summary: string;
  boundary: string;
  care: string;
  values: Record<SpecFieldKey, string>;
  aliases: string[];
  variants: CuratedEntityPack["variants"];
};

function pen(input: Input): CuratedEntityPack {
  const sources = [S.history, S.care, input.primary, input.secondary, ...input.extra, input.art];
  return {
    key: `phase161-waterman-${input.key}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.file,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({
      alias,
      language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
      sourceKey: index === 0 ? input.primary.key : input.secondary.key,
    })),
    sources,
    scopes: [{
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: PHASE161_RETRIEVED,
      productionState: "historical",
      editionScope: `${input.name} 历史型号；材料、颜色、尖幅、制造地和维修状态按具体实物核对。`,
    }],
    claims: [
      {
        key: `phase161-${input.key}-identity`,
        predicate: "model_identity",
        objectText: input.summary,
        factClass: "core",
        confidence: 0.98,
        sourceKey: input.primary.key,
        locator: input.primary.summary,
        evidence: [
          claimEvidence(`phase161-${input.key}-identity-primary`, input.primary.key, input.primary.summary),
          claimEvidence(`phase161-${input.key}-identity-official`, S.history.key, S.history.summary),
          claimEvidence(`phase161-${input.key}-identity-secondary`, input.secondary.key, input.secondary.summary),
        ],
      },
      {
        key: `phase161-${input.key}-boundary`,
        predicate: "version_boundary",
        objectText: input.boundary,
        factClass: "core",
        confidence: 0.97,
        sourceKey: input.secondary.key,
        locator: input.secondary.summary,
        evidence: [
          claimEvidence(`phase161-${input.key}-boundary-secondary`, input.secondary.key, input.secondary.summary),
          claimEvidence(`phase161-${input.key}-boundary-extra`, input.extra[0]?.key ?? input.secondary.key, input.extra[0]?.summary ?? input.secondary.summary),
        ],
      },
      {
        key: `phase161-${input.key}-care`,
        predicate: "maintenance",
        objectText: input.care,
        factClass: "editorial",
        confidence: 0.96,
        sourceKey: S.care.key,
        locator: S.care.summary,
        evidence: [
          claimEvidence(`phase161-${input.key}-care-official`, S.care.key, S.care.summary),
          claimEvidence(`phase161-${input.key}-care-secondary`, input.secondary.key, input.secondary.summary),
        ],
      },
    ],
    variants: input.variants,
    spec: {
      brandEntityId: PHASE161_WATERMAN_BRAND_ID,
      values: input.values,
      evidence: [
        evidence(`phase161-${input.key}-brand`, "brand_entity_id", input.primary.key, "Waterman identity"),
        evidence(`phase161-${input.key}-series`, "series_name", input.primary.key, "model identity"),
        evidence(`phase161-${input.key}-release`, "release_year", S.history.key, "historical placement"),
        evidence(`phase161-${input.key}-origin`, "origin_country", input.secondary.key, "source and market boundary"),
        evidence(`phase161-${input.key}-nib`, "nib", input.secondary.key, "nib description and sample boundary"),
        evidence(`phase161-${input.key}-fill`, "fill_system", input.secondary.key, "filling system"),
        evidence(`phase161-${input.key}-material`, "material", input.secondary.key, "material and version boundary"),
        evidence(`phase161-${input.key}-dimensions`, "dimensions", input.secondary.key, "sample measurement boundary"),
        evidence(`phase161-${input.key}-weight`, "weight", input.secondary.key, "sample measurement boundary"),
        evidence(`phase161-${input.key}-status`, "status", input.primary.key, "historical circulation"),
        evidence(`phase161-${input.key}-price`, "price_range", input.secondary.key, "market condition boundary"),
      ],
    },
    media: [{
      key: `phase161-${input.key}-primary-media`,
      title: `${input.name} 事实示意图（非产品照片）`,
      sourceKey: input.art.key,
      localPath: input.art.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；示意图，非产品照片。",
      sourceUrl: input.art.url,
      usageStatus: "primary",
    }],
    timeline: [],
  };
}

const hundredYear = pen({
  key: "hundred-year",
  id: PHASE161_IDS.hundredYear,
  slug: "waterman-s-hundred-year-pen",
  name: "Waterman’s Hundred Year Pen",
  file: ".planning/content-research/waterman-hundred-year-phase161.md",
  title: "Waterman’s Hundred Year Pen：Lucite、百年保证与战时材料转换",
  primary: S.hundred,
  secondary: S.hundredPencil,
  extra: [],
  art: S.hundredSvg,
  summary: "Waterman’s Hundred Year Pen 是 1939 年历史型号，关联 Lucite/celluloid、No.17/18、Inkquaduct 与杠杆上墨，并经历战时材料和名称过渡。",
  boundary: "标准、Lady、De Luxe/Oversized、不同笔尾和材料世代不能合并；Emblem 是保证措辞变化后的相邻名称，不是 Hundred Year 的颜色变体。",
  care: "老 celluloid 与透明尾端避开热水、酒精和强力抛光；常温水缓慢清洁，检查 sac、压条、section、尾端晶化与裂纹，必要时交给 vintage Waterman 维修者。",
  values: {
    series_name: "Hundred Year Pen",
    release_year: "1939；1942 年后逐步转向 Emblem 名称",
    origin_country: "美国 Waterman 历史产品线；具体制造地按刻字和目录核对",
    nib: "Waterman No.17 标准款、No.18 De Luxe 语境；尖幅和原装程度按实物核对",
    fill_system: "Waterman 传统杠杆上墨与 Inkquaduct feed",
    material: "早期 Lucite；战时及后期多见 celluloid，透明尾端和颜色随版本变化",
    dimensions: "Lady、标准、De Luxe/Oversized 尺寸不同；Azahara 记录样本约 117.5–136.5 mm",
    weight: "公开来源未提供可外推的统一重量；按具体样本",
    status: "历史型号；原始名称寿命短，Emblem 为相邻后续名称，二手流通为主",
    price_range: "随 Lucite/celluloid、透明尾端、No.17/18、完整度和维修史变化",
    brand_entity_id: PHASE161_WATERMAN_BRAND_ID,
  },
  aliases: ["Waterman’s Hundred Year Pen", "Waterman's Hundred Year Pen", "Waterman Hundred Year", "威迪文百年笔"],
  variants: [
    { key: "phase161-hundred-lady", name: "Lady / demi", notes: "较短尺寸和不同装饰位置；不与标准款共用尺寸。", sourceKey: S.hundred.key, variantKind: "edition_group" },
    { key: "phase161-hundred-deluxe", name: "De Luxe / Oversized", notes: "较大比例，通常关联 No.18；尖幅和饰件仍按实物核对。", sourceKey: S.hundred.key, variantKind: "edition_group" },
    { key: "phase161-hundred-material", name: "Lucite 与 celluloid 材料世代", notes: "战争时期材料转换带来透明尾端、晶化和颜色差异。", sourceKey: S.hundredPencil.key, variantKind: "material" },
  ],
});

const inkVue = pen({
  key: "ink-vue",
  id: PHASE161_IDS.inkVue,
  slug: "waterman-s-ink-vue",
  name: "Waterman’s Ink-Vue",
  file: ".planning/content-research/waterman-ink-vue-phase161.md",
  title: "Waterman’s Ink-Vue：透明 barrel 与 Tip-Fill 的泵式路线",
  primary: S.inkVue,
  secondary: S.inkVueFpn,
  extra: [S.inkVueRavens],
  art: S.inkVueSvg,
  summary: "Waterman Ink-Vue 是 1935 年透明 barrel 泵式型号，标准款常标 No.84，配 No.5 与 Tip-Fill，后续有 De Luxe、Lady Patricia 和 5116。",
  boundary: "标准 84、De Luxe、Lady Patricia Ink-Vue 与 1939 年 5116 不能合并；一体/铰接杠杆、阶梯帽顶、颜色和 demonstrator 状态按具体样本核对。",
  care: "先确认 bulb、washer、plug 和密封，再以常温水分段清洁；不要用热水、酒精、现代 converter 或强力旋拧替代历史结构维修。",
  values: {
    series_name: "Ink-Vue",
    release_year: "1935；1936 年出现 De Luxe/Lady Patricia，1939 年有 5116 变体",
    origin_country: "美国 Waterman 历史产品线；具体制造地按刻字和目录核对",
    nib: "标准 84 常见 No.5；De Luxe 常见 No.7，尖幅和替换件按实物核对",
    fill_system: "横向压缩橡胶 bulb 的泵式上墨；Tip-Fill feed；5116 使用一体式 barrel/section 与 plug",
    material: "装饰 celluloid 与透明 barrel；Silver/Emerald/Copper Ray、Jet 等颜色和版本随年代变化",
    dimensions: "标准、De Luxe、Lady Patricia 与 desk pen 尺寸不同；公开资料无统一全线尺寸",
    weight: "公开来源未提供可外推的统一重量；按具体样本",
    status: "历史型号；二手收藏与维修流通为主",
    price_range: "随 84/De Luxe/Lady Patricia/5116、颜色、透明 barrel、机构完整度和维修史变化",
    brand_entity_id: PHASE161_WATERMAN_BRAND_ID,
  },
  aliases: ["Waterman’s Ink-Vue", "Waterman's Ink-Vue", "Waterman Ink-Vue", "威迪文 Ink-Vue"],
  variants: [
    { key: "phase161-ink-vue-84", name: "标准 Model 84", notes: "No.5 与 Tip-Fill feed 语境；不要把 84 的规格填给 De Luxe。", sourceKey: S.inkVue.key, variantKind: "edition_group" },
    { key: "phase161-ink-vue-deluxe", name: "De Luxe Ink-Vue", notes: "No.7、三道帽环、铣纹饰件和新增颜色的高定位版本。", sourceKey: S.inkVue.key, variantKind: "edition_group" },
    { key: "phase161-ink-vue-5116", name: "5116 一体式 barrel/section", notes: "1939 年结构变化；末端 plug 和 bulb 维修路径不同。", sourceKey: S.inkVue.key, variantKind: "edition_group" },
  ],
});

const xPen = pen({
  key: "x-pen",
  id: PHASE161_IDS.xPen,
  slug: "waterman-s-x-pen",
  name: "Waterman’s X-Pen",
  file: ".planning/content-research/waterman-x-pen-phase161.md",
  title: "Waterman’s X-Pen：法国毛细储墨与不可拆清洁边界",
  primary: S.xPen,
  secondary: S.xPenPeyton,
  extra: [S.xPenCapillary, S.xPenRavens],
  art: S.xPenSvg,
  summary: "Waterman’s X-Pen 是法国约 1957–1959 年的 capillary filler，以织物 wick 储墨、笔尖浸入填充，定位较简单的经济型路线。",
  boundary: "1957–1959 是已记录的法国制造窗口；X-Pen Junior、晚期可拆 barrel、颜色、帽环和尖幅按具体实物核对，不能把 Parker 61 的清洗流程直接套用。",
  care: "初次吸墨可能需数分钟；普通样本以常温水浸泡、倒空和纸巾导出，专用单一墨水，避免热水、酒精、超声波和强行拆 barrel。",
  values: {
    series_name: "X-Pen / X-Pen Junior",
    release_year: "法国约 1957–1959；与 Parker 61 的毛细上墨时代相邻",
    origin_country: "法国 Waterman；具体市场和制造标记按实物核对",
    nib: "常见 hooded steel nib；Peyton Street 样本为 Medium，其他尖幅按实物",
    fill_system: "capillary filler；笔尖端浸入墨水，内部织物 wick 吸收储墨",
    material: "黑色或其他塑料笔身、金属帽及内部织物储墨；晚期 demonstrator 结构可能可拆",
    dimensions: "X-Pen Junior 样本约 5-3/16 英寸；其他版本按具体实物",
    weight: "公开来源未提供可外推的统一重量；按具体样本",
    status: "法国历史型号；二手收藏与维修流通为主",
    price_range: "随法国制造、Junior 尺寸、原盒、帽盖、储墨材料和钢尖状态变化",
    brand_entity_id: PHASE161_WATERMAN_BRAND_ID,
  },
  aliases: ["Waterman’s X-Pen", "Waterman's X-Pen", "Waterman X-Pen", "Waterman X-Pen Junior", "威迪文 X-Pen"],
  variants: [
    { key: "phase161-x-pen-junior", name: "X-Pen Junior 法国样本", notes: "Peyton Street 记录约 1957–1959、5-3/16 英寸和 hooded steel nib。", sourceKey: S.xPenPeyton.key, variantKind: "edition_group" },
    { key: "phase161-x-pen-removable", name: "晚期可拆 barrel / demonstrator", notes: "少数后期结构例外；确认可拆前不要照 Parker 61 拆洗。", sourceKey: S.xPen.key, variantKind: "edition_group" },
  ],
});

const brandBase = phase83WatermanCurrentPacks("phase83-pen-waterman-allure").find((pack) => pack.expectedType === "brand");
if (!brandBase) throw new Error("Phase 161 requires the existing Waterman brand pack.");
const watermanBrand = structuredClone(brandBase);
watermanBrand.key = "phase161-waterman-brand-vintage-navigation";
watermanBrand.sources = [...watermanBrand.sources, S.hundred, S.inkVue, S.xPen].filter(
  (source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index,
);

export const phase161WatermanVintagePacks: CuratedEntityPack[] = [watermanBrand, hundredYear, inkVue, xPen];
