import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE382_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE382_KAMAWANU_ID = "phase382-sailor-kamawanu-109895";
export const PHASE382_KAMAWANU_SLUG = "sailor-x-kamawanu-109895";

const RETRIEVED = "2026-08-03";
const PRODUCT = "https://en.sailor.co.jp/product/10-9895/";
const KAMAWANU_STORE = "https://kamawanu.com/en-us";
const KAMAWANU_STORY = "https://kamawanu.com/";
const APPELBOOM = "https://appelboom.com/sailor-pro-gear-slim-kamawanu-tsurumaru-ume-gt-fountain-pen/";
const NIB = "https://sailor.co.jp/topics/fountain-pen-type/";
const REFILL = "https://sailor.co.jp/topics/fountain-pen-refill-ink/";
const CARE = "https://sailor.co.jp/topics/fountain-pen-maintenance/";
const SVG = "/images/library/site-original/phase382/sailor/kamawanu-109895.svg";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup?: string;
  homepageUrl?: string;
  author?: string;
  itemType?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "retailer" ? "professional_secondary" : "primary"),
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://sailor.co.jp/" : "/"),
    itemType: input.itemType ?? (siteOriginal ? "image" : "web_page"),
    author: input.author ?? (sourceType === "official" ? "セーラー万年筆株式会社" : input.registryName),
    retrievedAt: RETRIEVED,
    allowedUse: siteOriginal ? "store_full" : "summary_only",
    license: siteOriginal ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
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

const SOURCES = {
  product: source({
    key: "phase382-kamawanu-product",
    title: "Sailor x Kamawanu — Sailor 官方产品页",
    url: PRODUCT,
    summary: "Sailor 官方英文页确认 10-9895、TSURUMARU-UME 与 FUGU-TATEOKE、每种设计全球 400 支、十个 EF/F/MF/M/B 代码、PMMA、C/C、φ18×129 mm 和 21.6 g。",
    locator: "title, description, item codes, JAN, filling, material, size, weight and edition statement",
    registryKey: "sailor-official-phase382-kamawanu",
    registryName: "The Sailor Pen Co., Ltd.",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
  }),
  kamawanuStore: source({
    key: "phase382-kamawanu-store",
    title: "KAMAWANU — Hand-dyed in Japan 官方全球店",
    url: KAMAWANU_STORE,
    summary: "Kamawanu 官方全球店说明其手拭巾在日本手染制作，用于联名品牌与手工背景，不改变钢笔由 Sailor 制造的关系。",
    locator: "brand description, hand-dyed in Japan and tenugui craft context",
    registryKey: "kamawanu-official-phase382",
    registryName: "Kamawanu",
    homepageUrl: "https://kamawanu.com/",
    author: "Kamawanu",
  }),
  kamawanuStory: source({
    key: "phase382-kamawanu-story",
    title: "Our Story — Kamawanu 官方",
    url: KAMAWANU_STORY,
    summary: "Kamawanu 官方故事页说明其自 1990 年起在东京制作原创手拭巾，结合传统与现代技术，并由工匠完成手染。",
    locator: "our story, Tokyo production, 1990 and artisan techniques",
    registryKey: "kamawanu-official-phase382",
    registryName: "Kamawanu",
    homepageUrl: "https://kamawanu.com/",
    author: "Kamawanu",
  }),
  retailer: source({
    key: "phase382-kamawanu-appelboom",
    title: "Sailor Pro Gear Slim Kamawanu Tsurumaru-ume — Appelboom",
    url: APPELBOOM,
    summary: "Appelboom 专业零售商页面列出两个图案、EF/F/MF/M/B、不锈钢尖、IP 金镀饰件、129 mm、18 mm、21.6 g 与 EUR 254.10 含税价；数量粒度与官方页面不同，均只作二级市场资料。",
    locator: "product title, description, options, technical specifications and displayed price",
    registryKey: "appelboom-phase382-kamawanu",
    registryName: "Appelboom",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "appelboom-phase382-kamawanu",
    homepageUrl: "https://appelboom.com/",
    author: "Appelboom",
  }),
  nib: source({
    key: "phase382-kamawanu-nib",
    title: "ペン先の種類と特長 — Sailor 官方",
    url: NIB,
    summary: "Sailor 官方笔尖知识页用于解释 EF/F/MF/M/B 的通用入口，不把通用线宽或材质说明外推为 10-9895 的单支检测。",
    locator: "official nib widths and general characteristics",
    registryKey: "sailor-official-phase382-kamawanu",
    registryName: "セーラー万年筆株式会社",
  }),
  refill: source({
    key: "phase382-kamawanu-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: REFILL,
    summary: "Sailor 官方说明墨囊和转换器的安装、吸墨、排空与保存，用于 10-9895 C/C 维护边界。",
    locator: "official cartridge and converter filling instructions",
    registryKey: "sailor-official-phase382-kamawanu",
    registryName: "セーラー万年筆株式会社",
  }),
  care: source({
    key: "phase382-kamawanu-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: CARE,
    summary: "Sailor 官方说明清洗、保存和避免强力清洁的方法；PMMA 与图案表面仍按保守边界处理。",
    locator: "official cleaning, storage and maintenance guidance",
    registryKey: "sailor-official-phase382-kamawanu",
    registryName: "セーラー万年筆株式会社",
  }),
  diagram: source({
    key: "phase382-kamawanu-svg",
    title: "Sailor x Kamawanu 10-9895 factual identity card",
    url: SVG,
    summary: "本站原创 factual SVG 概括两个图案、十个代码、PMMA、C/C、尺寸和重量，不是产品照片。",
    locator: "site-original factual SVG metadata",
    registryKey: "fountain-pen-graph-editorial-phase382-kamawanu",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    itemType: "image",
  }),
};

const SCOPE = "phase382-sailor-kamawanu-109895";
const brand = structuredClone(
  phase33Sailor2026CurrentPacks.find(
    (candidate) => candidate.entityId === PHASE382_SAILOR_BRAND_ID && candidate.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 382 Sailor brand pack missing.");
brand.key = "phase382-sailor-brand-v1";

const productCodes = [
  ["TSURUMARU-UME EF", "10-9895-117", "49-01680-61098-4"],
  ["TSURUMARU-UME F", "10-9895-217", "49-01680-61099-1"],
  ["TSURUMARU-UME MF", "10-9895-317", "49-01680-61000-4"],
  ["TSURUMARU-UME M", "10-9895-417", "49-01680-61001-1"],
  ["TSURUMARU-UME B", "10-9895-617", "49-01680-61002-8"],
  ["FUGU-TATEOKE EF", "10-9895-142", "49-01680-61103-5"],
  ["FUGU-TATEOKE F", "10-9895-242", "49-01680-61104-2"],
  ["FUGU-TATEOKE MF", "10-9895-342", "49-01680-61105-9"],
  ["FUGU-TATEOKE M", "10-9895-442", "49-01680-61106-6"],
  ["FUGU-TATEOKE B", "10-9895-642", "49-01680-61107-3"],
] as const;

const pack: CuratedEntityPack = {
  key: `${PHASE382_KAMAWANU_ID}-v1`,
  entityId: PHASE382_KAMAWANU_ID,
  expectedType: "pen",
  expectedSlug: PHASE382_KAMAWANU_SLUG,
  canonicalName: "写乐 Sailor x Kamawanu（10-9895）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-kamawanu-109895-phase382.md",
  storyTitle: "写乐 Sailor x Kamawanu 10-9895：两种手拭巾图案收在一个合作主型号",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor x Kamawanu", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Sailor Pro Gear Slim Kamawanu", language: "en", sourceKey: SOURCES.retailer.key },
    { alias: "Sailor Kamawanu Tsurumaru-ume", language: "en", sourceKey: SOURCES.retailer.key },
    { alias: "Sailor Kamawanu Fugu-tateoke", language: "en", sourceKey: SOURCES.retailer.key },
    { alias: "写乐 Kamawanu 联名", language: "zh", sourceKey: SOURCES.product.key },
    { alias: "10-9895", language: "en", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Sailor authorized market",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "EF/F/MF/M/B ten market SKUs; official current page does not state nib material",
      materialScope: "PMMA Resin; metal trim material and plating not fully listed on official current page",
      editionScope: "10-9895 Sailor x Kamawanu; each of two designs limited to 400 worldwide",
    },
    {
      key: `${SCOPE}-kamawanu-context`,
      scopeKey: `${SCOPE}-kamawanu-context`,
      productionState: "historical",
      editionScope: "Kamawanu tenugui brand background; not a pen material or manufacturing claim",
    },
    {
      key: `${SCOPE}-media-boundary`,
      scopeKey: `${SCOPE}-media-boundary`,
      productionState: "current",
      editionScope: "site-original factual SVG; no product photo, logo, scale or colour proof",
    },
  ],
  claims: [
    claim(SCOPE, `${SCOPE}-identity`, "model_identity", "10-9895 是 Sailor x Kamawanu 合作款的具体钢笔主型号；TSURUMARU-UME 与 FUGU-TATEOKE 是同页的图案变体，不能拆成两个普通透明笔实体。", SOURCES.product.key, "official title and 10-9895 product identity"),
    claim(SCOPE, `${SCOPE}-maker`, "collaboration_boundary", "Kamawanu 是日本手拭巾品牌和设计合作方，Sailor 仍是钢笔制造者；made_by 只指向 Sailor，不把 Kamawanu 建成制造商。", SOURCES.product.key, "official collaboration description and maker topology boundary"),
    claim(SCOPE, `${SCOPE}-quantity`, "edition_quantity", "Sailor 官方说明每种设计全球限量 400 支，因此 TSURUMARU-UME 与 FUGU-TATEOKE 各有 400 支的图案级数量边界；不能推导十个尖幅各自配额或未知总编号范围。", SOURCES.product.key, "official edition statement", "core"),
    claim(SCOPE, `${SCOPE}-tsurumaru`, "design_context", "TSURUMARU-UME 以鹤与梅花为主题；成对相向的鹤在官方叙事中联系好运、长寿、和谐与健康，这不是对实物颜色、印刷位置或笔夹朝向的照片鉴定。", SOURCES.product.key, "official TSURUMARU-UME description"),
    claim(SCOPE, `${SCOPE}-fugu`, "design_context", "FUGU-TATEOKE 结合河豚的 fuku（福）联想与立涌纹样，把上升水流或云改写成气泡；图案名不代表鱼皮材料、真实液体或浮雕结构。", SOURCES.product.key, "official FUGU-TATEOKE description"),
    claim(SCOPE, `${SCOPE}-nib`, "nib", "官方当前英文页列 EF/F/MF/M/B 十个市场 SKU，但未在该页明确列出尖材质。Appelboom 二级页面称为不锈钢尖，保留为交叉资料，不升级为官方字段。", SOURCES.product.key, "official item-code and absent-nib-material boundary"),
    claim(SCOPE, `${SCOPE}-filling`, "filling_system", "供墨为墨囊／转换器两用式（Converter & Cartridge type），没有证据把 10-9895 写成活塞或真空上墨。", SOURCES.product.key, "official filling type field"),
    claim(SCOPE, `${SCOPE}-material`, "material", "官方材料为 PMMA Resin；金属饰件材质和镀层没有在当前英文页完整列出，不从透明外观或零售同系列字段猜测。", SOURCES.product.key, "official material field and absent trim-detail boundary"),
    claim(SCOPE, `${SCOPE}-size`, "physical_specification", "官方给出 φ18×129 mm（含笔夹）与 21.6 g；两个图案共享这组共同规格。", SOURCES.product.key, "official size and weight fields"),
    claim(SCOPE, `${SCOPE}-retailer`, "market_status", "Appelboom 专业零售商展示 EUR 254.10 含税价，并列出不锈钢尖、IP 金镀饰件和 400 支系列说法；官方当前页未列 MSRP，且数量粒度不同，均只作市场参考。", SOURCES.retailer.key, "professional retailer price, specifications and quantity wording", "editorial"),
    claim(SCOPE, `${SCOPE}-kamawanu`, "brand_context", "Kamawanu 官方资料说明其自 1990 年起在东京制作原创手拭巾，结合传统与现代技术、工匠手染；钢笔主体仍是 Sailor 的 PMMA，不代表包覆棉布或使用手拭巾染料。", SOURCES.kamawanuStory.key, "Kamawanu official story and tenugui craft context"),
    claim(SCOPE, `${SCOPE}-care`, "maintenance_guidance", "换色或长期存放前用室温清水缓慢吸排并自然晾干；PMMA 与图案表面避开酒精、强溶剂、漂白剂、研磨膏和长时间浸泡，裂纹、白化、漏墨或尖片弯曲时联系授权服务。", SOURCES.care.key, "Sailor care guidance plus conservative PMMA and pattern boundary", "editorial"),
    claim(SCOPE, `${SCOPE}-selection`, "selection_guidance", "选购先核对 10-9895 主码、图案和 EF/F/MF/M/B 后缀，再核对 PMMA、C/C、φ18×129 mm、21.6 g 与授权来源；官方未列 MSRP 和尖材质，不用相邻型号补齐。", SOURCES.product.key, "model code, variant, specification and market checks", "editorial"),
    claim(SCOPE, `${SCOPE}-media`, "media_identity_boundary", "主图是本站原创 factual SVG，不复制 Sailor 或 Kamawanu 产品照片、Logo、真实颜色或比例，不证明图案印刷工艺和包装缺件。", SOURCES.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: productCodes.map(([name, productCode, jan]) => ({
    key: `${SCOPE}-${productCode}`,
    name,
    notes: `官方代码 ${productCode}，JAN ${jan}；与另一图案的四个后缀 SKU 共享 10-9895 合作主型号。`,
    sourceKey: SOURCES.product.key,
    variantKind: "market_sku" as const,
    productCode,
    market: "授权市场",
  })),
  spec: {
    brandEntityId: PHASE382_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor x Kamawanu（10-9895）",
      release_year: "官方当前英文页源码未给出单一首发年份",
      origin_country: "日本 Sailor 与 Kamawanu 合作；不外推具体工厂或染坊",
      nib: "官方当前英文页未列尖材质；EF/F/MF/M/B 十个市场 SKU",
      fill_system: "墨囊／转换器两用式（Converter & Cartridge type）",
      material: "PMMA Resin；金属饰件材质与镀层未在当前英文页完整列出",
      dimensions: "φ18×129 mm（含笔夹）",
      weight: "21.6 g",
      price_range: "官方英文产品页未列 MSRP；Appelboom 页面显示 EUR 254.10 含税价，仅作二级市场参考",
      status: "合作款；官方页面说明 TSURUMARU-UME 与 FUGU-TATEOKE 两种设计各限量全球 400 支",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", SOURCES.product.key, SCOPE, "official Sailor product identity"),
      evidence(`${SCOPE}-series`, "series_name", SOURCES.product.key, SCOPE, "official title and 10-9895 code"),
      evidence(`${SCOPE}-release`, "release_year", SOURCES.product.key, SCOPE, "official page does not state a single launch year"),
      evidence(`${SCOPE}-origin`, "origin_country", SOURCES.product.key, SCOPE, "Sailor and Kamawanu collaboration; no factory inference"),
      evidence(`${SCOPE}-nib`, "nib", SOURCES.product.key, SCOPE, "official item-code fields and absent nib-material field"),
      evidence(`${SCOPE}-fill`, "fill_system", SOURCES.product.key, SCOPE, "official filling field"),
      evidence(`${SCOPE}-material`, "material", SOURCES.product.key, SCOPE, "official PMMA field and absent trim detail"),
      evidence(`${SCOPE}-dimensions`, "dimensions", SOURCES.product.key, SCOPE, "official size field"),
      evidence(`${SCOPE}-weight`, "weight", SOURCES.product.key, SCOPE, "official weight field"),
      evidence(`${SCOPE}-price`, "price_range", SOURCES.retailer.key, SCOPE, "historical/current professional retailer display only"),
      evidence(`${SCOPE}-status`, "status", SOURCES.product.key, SCOPE, "official design-level edition statement"),
    ],
  },
  media: [
    {
      key: `${SCOPE}-primary-media`,
      title: "Sailor x Kamawanu 10-9895 事实卡（非产品照片）",
      sourceKey: SOURCES.diagram.key,
      localPath: SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样、非图案工艺证明。",
      sourceUrl: SVG,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: `${SCOPE}-current-page`,
      title: "Sailor 产品页确认 Sailor x Kamawanu 10-9895",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "截至 2026-08-03，Sailor 官方英文页展示 10-9895 的两种手拭巾图案、每种设计全球 400 支、十个尖幅代码、PMMA、C/C、尺寸和重量；页面未给出单一首发年份。",
      sourceKey: SOURCES.product.key,
    },
  ],
};

export const phase382SailorKamawanuPacks: CuratedEntityPack[] = [brand, pack];
