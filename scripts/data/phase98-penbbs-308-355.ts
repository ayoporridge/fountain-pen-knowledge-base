import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import {
  PHASE72_PENBBS_BRAND_ID,
  phase72PenBbsPacks,
} from "./phase72-delike-duke-penbbs";

export const PHASE98_PENBBS_308_ID = "s98PENBBS308";
export const PHASE98_PENBBS_355_ID = "s98PENBBS355";
export const PHASE98_PENBBS_308_SLUG = "penbbs-308";
export const PHASE98_PENBBS_355_SLUG = "penbbs-355";

const RETRIEVED = "2026-07-20";

function source(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator" | "independenceGroup"
  >,
): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    independenceGroup: input.registryKey,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase98",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase98",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  store: source({
    key: "phase98-penbbs-official-store",
    registryKey: "penbbsofficialstore-phase98",
    registryName: "PENBBSOfficialStore",
    sourceType: "official",
    tier: "primary",
    title: "PENBBSOfficialStore",
    url: "https://www.etsy.com/shop/PENBBSOfficialStore",
    summary: "店主 Long37 的品牌自营销售渠道，是品牌归属和当代销售窗口；店铺首页不是 308 或 355 的逐 SKU 规格页。",
  }),
  overview: source({
    key: "phase98-penbbs-overview",
    registryKey: "gentleman-stationer-phase98-overview",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "PenBBS",
    url: "https://www.gentlemanstationer.com/penbbs",
    summary: "独立品牌概览把 268、308、355、456、469 的上墨结构分开；不能互相移植规格或维护步骤。",
  }),
  review308: source({
    key: "phase98-penbbs-308-review",
    registryKey: "gentleman-stationer-phase98-308",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Pen Review: PenBBS 308 Fountain Pen",
    url: "https://www.gentlemanstationer.com/blog/2019/10/8/pen-review-penbbs-308-fountain-pen",
    summary: "2019 独立实测记录 308 的树脂材料、O-ring、剑形夹、批次材料和墨囊／转换器定位；滴灌只可作为特定实物的可选做法。",
  }),
  review308Second: source({
    key: "phase98-penbbs-308-penaddict",
    registryKey: "pen-addict-phase98-308",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "PenBBS 308 Fountain Pen in Pacific Review",
    url: "https://www.penaddict.com/blog/2021/9/22/penbbs-308-fountain-pen-in-pacific-review",
    summary: "2021 Pacific 样笔实测交叉记录树脂、O-ring、转换器及其非普通短国际墨囊接口提示；不外推到所有批次。",
  }),
  review355: source({
    key: "phase98-penbbs-355-review",
    registryKey: "gentleman-stationer-phase98-355",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Pen Review: PenBBS 355 (Syringe Filler)",
    url: "https://www.gentlemanstationer.com/blog/2019/6/12/pen-review-penbbs-355-syringe-filler",
    summary: "2019 独立实测记录 355 的杆式高容量结构、透明/半透明树脂样本、与 456 的笔尖边界及活塞脱开、回杆出墨等操作风险。",
  }),
  brandSvg: diagram("phase98-penbbs-brand-svg", "PenBBS 上墨结构导航事实图", "/images/library/site-original/penbbs/penbbs-brand-v2.svg"),
  svg308: diagram("phase98-penbbs-308-svg", "PenBBS 308 使用方式事实图", "/images/library/site-original/penbbs/penbbs-308.svg"),
  svg355: diagram("phase98-penbbs-355-svg", "PenBBS 355 杆式上墨事实图", "/images/library/site-original/penbbs/penbbs-355.svg"),
};

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, sourceItem: CuratedSource) {
  return [{
    key,
    title,
    sourceKey: sourceItem.key,
    localPath: sourceItem.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、材料、笔尖、零件兼容性、库存或包装。",
    sourceUrl: sourceItem.url,
    usageStatus: "primary" as const,
  }];
}

function makeBrand(): CuratedEntityPack {
  const pack = structuredClone(
    phase72PenBbsPacks().find((item) => item.expectedType === "brand"),
  );
  if (!pack) throw new Error("Phase 98 requires the PenBBS brand pack from phase 72.");
  const store = pack.sources.find((item) => item.sourceType === "official");
  const overview = pack.sources.find((item) => item.url === S.overview.url);
  if (!store || !overview) {
    throw new Error("Phase 98 requires the phase 72 PenBBS store and overview sources.");
  }
  const scopeKey = "phase98-penbbs-brand-scope";
  pack.key = "phase98-penbbs-brand-v2";
  pack.markdownFile = ".planning/content-research/penbbs-brand-v2.md";
  pack.storyTitle = "坛笔 PenBBS：按上墨结构而不是花色导航";
  pack.sources = [...pack.sources, S.review308, S.review355, S.brandSvg];
  pack.scopes = [{
    key: scopeKey,
    scopeKey,
    productionState: "unknown",
    editionScope: "品牌页只导航已有可靠资料的 268、308、355；456、469 等须按各自资料补全，不能由相邻结构代填。",
  }];
  pack.claims = [
    {
      key: "phase98-penbbs-brand-navigation",
      predicate: "brand_model_navigation",
      objectText: "PenBBS 的已核对型号按上墨结构导航：268 为较小真空上墨笔，308 为墨囊／转换器平台，355 为杆式大容量结构。它们不是同一笔的花色或尺寸变体；456、469 等保留各自独立页面和资料边界。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: overview.key,
      locator: "268/308/355/456/469 filling-system overview",
      evidence: [{
        key: "phase98-penbbs-brand-navigation-e",
        sourceKey: overview.key,
        scopeKey,
        locator: "model filling systems kept separate",
      }],
    },
    {
      key: "phase98-penbbs-brand-boundary",
      predicate: "brand_boundary",
      objectText: "PENBBSOfficialStore 可作为品牌归属与销售窗口，却不能替代旧型号的具体规格。308 的 O-ring 滴灌尝试、355 的杆式结构和测评中的材料样本都只绑定对应实物，不写成全品牌统一标准。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: store.key,
      locator: "self-operated brand sales window",
      evidence: [{
        key: "phase98-penbbs-brand-boundary-e",
        sourceKey: store.key,
        scopeKey,
        locator: "store is a brand window, not per-model specification",
      }, {
        key: "phase98-penbbs-brand-boundary-review-e",
        sourceKey: S.review308.key,
        scopeKey,
        locator: "308 observed O-ring and batch boundary",
      }],
    },
  ];
  pack.media = media("phase98-penbbs-brand-media", "PenBBS 上墨结构导航事实图（非产品照片）", S.brandSvg);
  pack.timeline = [
    {
      key: "phase98-penbbs-355-review-window",
      title: "355 的独立结构实测",
      eventType: "design_milestone",
      startDate: "2019",
      circa: false,
      description: "独立资料记录 355 的杆式高容量结构与操作边界。",
      sourceKey: S.review355.key,
    },
    {
      key: "phase98-penbbs-308-review-window",
      title: "308 的独立结构实测",
      eventType: "design_milestone",
      startDate: "2019",
      circa: false,
      description: "独立资料记录 308 的树脂、O-ring 与墨囊／转换器定位。",
      sourceKey: S.review308.key,
    },
  ];
  return pack;
}

function makePen(input: {
  key: "308" | "355";
  id: string;
  slug: string;
  name: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  diagram: CuratedSource;
  fill: string;
  material: string;
  nib: string;
  dimensions: string;
  weight: string;
  identity: string;
  boundary: string;
  care: string;
  variants: CuratedEntityPack["variants"];
}): CuratedEntityPack {
  const scopeKey = `phase98-penbbs-${input.key}-scope`;
  return {
    key: `phase98-penbbs-${input.key}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.name,
    primarySourceKey: S.store.key,
    depthTier: "A",
    aliases: [
      { alias: input.name, language: "en", sourceKey: input.primary.key },
      { alias: `坛笔 ${input.key}`, language: "zh", sourceKey: input.primary.key },
    ],
    sources: [...new Map([S.store, S.overview, input.primary, input.secondary, input.diagram].map((item) => [item.key, item])).values()],
    scopes: [{
      key: scopeKey,
      scopeKey,
      productionState: "historical",
      editionScope: `仅覆盖 PenBBS ${input.key} 的有来源样本；材料、颜色、笔尖、转换器、零件和二手改装按具体批次，不与 268、456、469 或其它品牌共享规格。`,
    }],
    claims: [
      {
        key: `phase98-penbbs-${input.key}-identity`,
        predicate: "model_identity",
        objectText: input.identity,
        factClass: "core",
        confidence: 0.99,
        sourceKey: input.primary.key,
        locator: input.primary.summary,
        evidence: [{
          key: `phase98-penbbs-${input.key}-identity-e`,
          sourceKey: input.primary.key,
          scopeKey,
          locator: input.primary.summary,
        }],
      },
      {
        key: `phase98-penbbs-${input.key}-boundary`,
        predicate: "version_boundary",
        objectText: input.boundary,
        factClass: "core",
        confidence: 0.98,
        sourceKey: input.secondary.key,
        locator: input.secondary.summary,
        evidence: [{
          key: `phase98-penbbs-${input.key}-boundary-e`,
          sourceKey: input.secondary.key,
          scopeKey,
          locator: input.secondary.summary,
        }],
      },
      {
        key: `phase98-penbbs-${input.key}-care`,
        predicate: "use_and_care",
        objectText: input.care,
        factClass: "editorial",
        confidence: 0.97,
        sourceKey: input.primary.key,
        locator: input.primary.summary,
        evidence: [{
          key: `phase98-penbbs-${input.key}-care-e`,
          sourceKey: input.primary.key,
          scopeKey,
          locator: input.primary.summary,
        }],
      },
    ],
    variants: input.variants,
    spec: {
      brandEntityId: PHASE72_PENBBS_BRAND_ID,
      values: {
        series_name: input.name,
        release_year: "2019 年独立实测可见；准确首发年份待生产者档案核实",
        origin_country: "中国品牌；本页不由店铺或测评推断具体工厂和全部市场版本",
        nib: input.nib,
        fill_system: input.fill,
        material: input.material,
        dimensions: input.dimensions,
        weight: input.weight,
        status: "历史／流通型号资料可核对；品牌店铺首页不证明当前库存或全球供应",
      },
      evidence: [
        evidence("brand_entity_id", `phase98-${input.key}-brand`, S.store.key, scopeKey, "brand sales window"),
        evidence("series_name", `phase98-${input.key}-series`, input.primary.key, scopeKey, "reviewed model identity"),
        evidence("release_year", `phase98-${input.key}-release`, input.primary.key, scopeKey, "2019 review window"),
        evidence("origin_country", `phase98-${input.key}-origin`, S.store.key, scopeKey, "brand context only"),
        evidence("nib", `phase98-${input.key}-nib`, input.primary.key, scopeKey, "reviewed sample boundary"),
        evidence("fill_system", `phase98-${input.key}-fill`, input.primary.key, scopeKey, "reviewed filling system"),
        evidence("material", `phase98-${input.key}-material`, input.primary.key, scopeKey, "reviewed material sample"),
        evidence("dimensions", `phase98-${input.key}-dimensions`, input.primary.key, scopeKey, "no universal dimensions asserted"),
        evidence("weight", `phase98-${input.key}-weight`, input.primary.key, scopeKey, "no universal weight asserted"),
        evidence("status", `phase98-${input.key}-status`, S.store.key, scopeKey, "store is not SKU stock proof"),
      ],
    },
    media: media(`phase98-penbbs-${input.key}-media`, `${input.name} 事实图（非产品照片）`, input.diagram),
    timeline: [{
      key: `phase98-penbbs-${input.key}-review-window`,
      title: `${input.name} 的独立资料窗口`,
      eventType: "design_milestone",
      startDate: "2019",
      circa: false,
      description: "独立资料记录该型号的结构；资料日期不等同制造商首发日。",
      sourceKey: input.primary.key,
    }],
  };
}

export const phase98PenBbsPacks: CuratedEntityPack[] = [
  makeBrand(),
  makePen({
    key: "308",
    id: PHASE98_PENBBS_308_ID,
    slug: PHASE98_PENBBS_308_SLUG,
    name: "PenBBS 308",
    markdownFile: ".planning/content-research/penbbs-308.md",
    primary: S.review308,
    secondary: S.review308Second,
    diagram: S.svg308,
    fill: "墨囊／转换器为默认使用方式；部分实物在 O-ring 与螺纹状态确认后可尝试滴灌，不是全代原厂统一承诺",
    material: "独立样本为树脂／亚克力笔身；材料名、花色、五金和批次按实物确认",
    nib: "独立样本的钢尖与具体宽度按实物；不从 268、355 或其它 PenBBS 平台外推",
    dimensions: "缺少可交叉核对的统一尺寸；不以某个材料批次替代全系毫米数",
    weight: "缺少可交叉核对的统一克重；树脂材料与配件按实物确认",
    identity: "PenBBS 308 是树脂旋帽的墨囊／转换器钢笔。部分实物的 O-ring 允许在密封条件满足时尝试滴灌，但这种可选使用方式不会把它变成内置活塞、真空或杆式上墨笔。",
    boundary: "99 Manjusaka、Pacific 等是材料或销售批次，不是不同上墨型号。308 不与 268、355、456、469 合并；某支样笔的转换器接口、O-ring 或改装经验不能推广到所有批次。",
    care: "默认按墨囊／转换器清洗；若尝试滴灌，应先检查 O-ring、螺纹与密封，并在纸巾上短时观察。出现渗漏、转换器松动或密封圈损伤时停止滴灌，不要无资料强拆笔舌或用热水、酒精处理树脂和密封件。",
    variants: [
      { key: "phase98-penbbs-308-manjusaka", name: "99 Manjusaka 样本", notes: "2019 测评中的材料／外观样本，不把颜色、笔尖或配件回填到所有 308。", sourceKey: S.review308.key, variantKind: "color" },
      { key: "phase98-penbbs-308-pacific", name: "Pacific 样本", notes: "2021 独立实测的 Pacific 外观样本；转换器与接口观察只绑定该样本。", sourceKey: S.review308Second.key, variantKind: "color" },
    ],
  }),
  makePen({
    key: "355",
    id: PHASE98_PENBBS_355_ID,
    slug: PHASE98_PENBBS_355_SLUG,
    name: "PenBBS 355",
    markdownFile: ".planning/content-research/penbbs-355.md",
    primary: S.review355,
    secondary: S.overview,
    diagram: S.svg355,
    fill: "杆式大容量上墨（独立资料称 syringe filler）；需要处理推杆、活塞和收杆动作，不等同真空上墨",
    material: "透明／半透明树脂为独立样本观察；颜色、材料、五金和批次不作全系承诺",
    nib: "独立资料观察到与 456 相近的笔尖；这不等同所有 355 与所有 456 可互换或使用同一配置",
    dimensions: "缺少可交叉核对的统一尺寸；不以高容量结构伪造长度或直径",
    weight: "缺少可交叉核对的统一克重；树脂、墨量和批次都会影响实际重量",
    identity: "PenBBS 355 是采用杆式大容量上墨结构的型号。它追求接近笔杆容量的储墨空间，但必须完成推杆与活塞的相应动作；不是 456 的真空结构，也不是其它品牌的同一产品。",
    boundary: "可把 355 的思路与 Bulkfiller 类设计作结构理解，但不能把 Conid 的专利、零件、售后或尺寸归给 PenBBS。268、308、456、469 的上墨路径都不替代 355 的推杆操作。",
    care: "换墨时按完整上墨路径用清水循环；无可靠拆解资料不要强拆活塞、推杆或密封部件。回杆时的少量笔尖残墨、盲盖位置和供墨表现须逐笔观察；出现持续渗漏、阻力或无法回位时停止强拉强推，保留照片向卖家或维修者求助。",
    variants: [
      { key: "phase98-penbbs-355-clear", name: "透明／半透明树脂实测样本", notes: "资料所见材料样本，不代表所有颜色和批次。", sourceKey: S.review355.key, variantKind: "color" },
      { key: "phase98-penbbs-355-456-nib", name: "与 456 相近笔尖的实测观察", notes: "只作样本结构观察，不承诺笔尖、笔舌或零件通用。", sourceKey: S.review355.key, variantKind: "market_sku" },
    ],
  }),
];
