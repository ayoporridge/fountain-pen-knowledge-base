import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase41IdentityCleanupPacks } from "./phase41-identity-cleanup";

export const PHASE292_PILOT_BRAND_ID = "Zt-PbXkE7UHM";
export const PHASE292_METROPOLITAN_ID = "phase292-pen-pilot-metropolitan";
export const PHASE292_METROPOLITAN_SLUG = "pilot-metropolitan";

const RETRIEVED = "2026-07-28";
const MODEL_SCOPE = "phase292-pilot-metropolitan";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase292/pilot/metropolitan.svg";
  return {
    key: "phase292-metropolitan-diagram",
    registryKey: "fountain-pen-graph-editorial-phase292",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase292",
    title: "Pilot MR Metropolitan factual diagram",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；表达漆面金属外壳、按扣帽、钢尖与 Pilot C/C 边界，不是产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false`,
  };
}

const S = {
  brochure: web({
    key: "phase292-pilot-mr-brochure",
    title: "Pilot Corporation of America: Fine Writing Brochure",
    url: "https://pilotpen.us/Downloads/Fine_Writing_Brochure.pdf",
    registryKey: "pilot-us-fine-writing-brochure-phase292",
    registryName: "Pilot Corporation of America",
    summary: "美国官方 brochure 把 MR Metropolitan 作为独立 collection，列经典色、黄铜笔身、钢尖和 Animal Collection 边界，但没有给出精确首发日。",
  }),
  cocoon: web({
    key: "phase292-pilot-cocoon-official",
    title: "Pilot Japan Web Catalog: Cocoon FCO-3SR-MGYF",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000155&volumeName=00004",
    registryKey: "pilot-japan-cocoon-catalog-phase292",
    registryName: "Pilot Corporation Japan Web Catalog",
    summary: "日本官方目录记录 Cocoon 的独立 FCO 商品号、特殊 F、CON-40、138 mm 和 24 g，用来维护 Cocoon 与北美 Metropolitan 的市场身份边界。",
  }),
  gouletBlack: web({
    key: "phase292-metropolitan-goulet-black",
    title: "Goulet Pens: Pilot Metropolitan Fountain Pen - Black Plain",
    url: "https://www.gouletpens.com/products/pilot-metropolitan-fountain-pen-black-plain",
    registryKey: "goulet-pilot-metropolitan-phase292",
    registryName: "The Goulet Pen Company",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "可靠零售商的 PN91111 页面给出漆面金属、钢尖、Pilot 墨囊／转换器、F/M/1.0 mm Stub、尺寸重量和该 SKU 的容量参考。",
  }),
  gouletAnimal: web({
    key: "phase292-metropolitan-goulet-animal",
    title: "Goulet Pens: Pilot Metropolitan Fountain Pen - Black Crocodile",
    url: "https://www.gouletpens.com/products/pilot-metropolitan-fountain-pen-black-crocodile",
    registryKey: "goulet-pilot-metropolitan-phase292",
    registryName: "The Goulet Pen Company",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "可靠零售商的 Animal SKU 交叉确认动物纹饰带、金属笔身、钢尖和 Pilot 墨囊／转换器；尖幅和库存仍按具体商品号。",
  }),
  desk: web({
    key: "phase292-metropolitan-desk-review",
    title: "The Well-Appointed Desk: Pilot Metropolitan Fountain Pen Review",
    url: "https://www.wellappointeddesk.com/2013/04/fountain-pen-review-pilot-metropolitan/",
    registryKey: "well-appointed-desk-pilot-metropolitan-phase292",
    registryName: "The Well-Appointed Desk",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测补充 Metropolitan 与 LAMY Safari 等入门笔的市场定位和长期使用观察；主观手感只归因于作者样本。",
  }),
  svg: diagram(),
} satisfies Record<string, CuratedSource>;

function ev(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
) {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: MODEL_SCOPE, locator }],
  } satisfies CuratedEntityPack["claims"][number];
}

const metropolitanPack: CuratedEntityPack = {
    key: "phase292-pilot-metropolitan-v1",
    entityId: PHASE292_METROPOLITAN_ID,
    expectedType: "pen",
    expectedSlug: PHASE292_METROPOLITAN_SLUG,
    canonicalName: "Pilot MR Metropolitan",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/pilot-metropolitan-phase292.md",
    storyTitle: "Pilot MR Metropolitan：金属入门款的身份、版本与使用边界",
    primarySourceKey: S.brochure.key,
    depthTier: "A",
    aliases: [
      { alias: "Pilot MR Metropolitan", language: "en", sourceKey: S.brochure.key },
      { alias: "Pilot Metropolitan", language: "en", sourceKey: S.gouletBlack.key },
      { alias: "Pilot MR", language: "en", sourceKey: S.brochure.key },
      { alias: "百乐 MR Metropolitan", language: "zh", sourceKey: S.brochure.key },
      { alias: "百乐 Metropolitan 钢笔", language: "zh", sourceKey: S.gouletBlack.key },
    ],
    sources: [S.brochure, S.cocoon, S.gouletBlack, S.gouletAnimal, S.desk, S.svg],
    scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, market: "Pilot MR Metropolitan in North American catalog and current retail SKUs", productionState: "current", nibScope: "steel nib; F/M/1.0 mm Stub or calligraphy options depend on SKU", materialScope: "lacquered metal/brass body with resin grip; trim and pattern vary", editionScope: "Classic and Animal finishes are variants; Japanese Cocoon and Pilot Kakuno remain separate market/model entities" }],
    claims: [
      claim("phase292-metropolitan-identity", "model_identity", "Pilot MR Metropolitan 是北美市场的金属笔身、按扣帽、钢尖入门钢笔；MR 是产品 collection 名称，不是 Pilot Custom 或 Capless 的别名。", S.brochure.key, "MR Metropolitan collection description"),
      claim("phase292-metropolitan-market-boundary", "market_boundary", "美国 MR Metropolitan 与日本官方目录中的 Cocoon 都是 Pilot 的独立商品语境；本页不因外观相近、地区改名或商品号相似而合并，也不把 Cocoon 的尺寸移入 MR。", S.cocoon.key, "Cocoon FCO-3SR-MGYF product code and specification"),
      claim("phase292-metropolitan-material", "material", "官方 brochure 将 MR Metropolitan 描述为黄铜笔身、抛光不锈钢饰件与钢尖；具体漆面、饰带和生产批次仍按 SKU 核对。", S.brochure.key, "MR Metropolitan material and finish description"),
      claim("phase292-metropolitan-fill", "filling_system", "使用 Pilot 自有墨囊或瓶装墨水配 Pilot 转换器；随盒转换器可能在 CON-B 与 CON-40 之间变化，不能承诺每盒固定型号。", S.gouletBlack.key, "current black plain SKU filling note"),
      claim("phase292-metropolitan-size", "dimensions", "Goulet 对 PN91111 的版本化测量约合盖 138 mm、套帽 153 mm、最大笔身直径 13 mm、总重 26 g；不视为所有花色和年份的工厂固定值。", S.gouletBlack.key, "PN91111 technical specifications"),
      claim("phase292-metropolitan-nib", "nib", "当前普通款零售规格列 F、M 与 1.0 mm Stub；部分动物纹或黑色亮面 SKU 的尖幅不同，Calligraphy/Stub 是尖幅选项而非新型号。", S.gouletBlack.key, "nib size field and current SKU options"),
      claim("phase292-metropolitan-variants", "version_boundary", "Classic MR 的亮面、圆点、锯齿饰带与 MR Animal 的动物纹是外观／市场版本；不按颜色拆成多个机械型号，也不拿 Animal 商品图覆盖 Classic。", S.brochure.key, "classic and Animal collection boundary"),
      claim("phase292-metropolitan-care", "maintenance_guidance", "换色时以室温清水吸排并充分干燥，长时间不用先排空；不要使用热水、酒精、强溶剂或尖锐工具自行撬动 Pilot 钢尖和笔舌。", S.gouletBlack.key, "retailer cleaning and cartridge guidance", "editorial"),
      claim("phase292-metropolitan-buying", "selection_guidance", "购买前先确认约 26 g 的金属重量、握位尺寸、F/M/Stub 尖幅、Classic/Animal 饰面和包装内转换器；想要轻量树脂或金尖大容量系统时应跳转 Kakuno 或 Custom。", S.desk.key, "independent beginner and sibling selection context", "editorial"),
    ],
    variants: [
      { key: "phase292-metropolitan-classic", name: "Classic MR Metropolitan finishes", notes: "官方 brochure 列黑色亮面、银色圆点、金色锯齿等经典饰面；颜色和饰带是 market SKU variant。", sourceKey: S.brochure.key, variantKind: "market_sku" },
      { key: "phase292-metropolitan-animal", name: "MR Animal Collection", notes: "黑鳄鱼、金蜥蜴、紫豹、银蟒、白虎等动物纹饰带；按商品号核对尖幅和地区库存。", sourceKey: S.brochure.key, variantKind: "edition_group" },
      { key: "phase292-metropolitan-stub", name: "1.0 mm Stub / Calligraphy options", notes: "部分黑色亮面或地区 SKU 的尖幅选择；不是所有颜色都持续供应，也不拆成独立型号。", sourceKey: S.gouletBlack.key, variantKind: "nib" },
      { key: "phase292-metropolitan-converter", name: "CON-B or CON-40 package variation", notes: "零售商提示 Pilot 会滚动更换随盒转换器；使用前以实物和商品说明为准。", sourceKey: S.gouletBlack.key, variantKind: "market_sku" },
    ],
    spec: {
      brandEntityId: PHASE292_PILOT_BRAND_ID,
      values: {
        series_name: "Pilot MR Metropolitan",
        release_year: "2010 年代已在北美公开销售；本轮未找到官方精确首发年份",
        origin_country: "Pilot 北美 MR 产品线；具体制造地按当期 SKU 与实物标记核对",
        nib: "钢尖；普通款 F/M/1.0 mm Stub，尖幅随 SKU／地区变化",
        fill_system: "Pilot 专用墨囊；Pilot CON-B 或 CON-40 转换器（随盒可能变化）",
        material: "漆面金属／黄铜笔身、树脂握位、不锈钢饰件",
        dimensions: "PN91111 参考：合盖约 138 mm、套帽约 153 mm、最大笔身直径约 13 mm、总重约 26 g",
        status: "现行北美 collection；Classic、Animal、Calligraphy 与地区库存按 SKU 记录",
      },
      evidence: [
        ev("phase292-metropolitan-brand", "brand_entity_id", S.brochure.key, "Pilot MR Metropolitan collection"),
        ev("phase292-metropolitan-series", "series_name", S.brochure.key, "official MR Metropolitan title"),
        ev("phase292-metropolitan-release", "release_year", S.desk.key, "2010s public review window; no exact official launch claim"),
        ev("phase292-metropolitan-origin", "origin_country", S.brochure.key, "Pilot Corporation of America catalog context"),
        ev("phase292-metropolitan-nib", "nib", S.gouletBlack.key, "PN91111 nib field"),
        ev("phase292-metropolitan-fill", "fill_system", S.gouletBlack.key, "Pilot cartridge and converter field"),
        ev("phase292-metropolitan-material", "material", S.brochure.key, "official brass body and steel trim description"),
        ev("phase292-metropolitan-dimensions", "dimensions", S.gouletBlack.key, "PN91111 technical specifications"),
        ev("phase292-metropolitan-status", "status", S.brochure.key, "current MR Metropolitan collection"),
      ],
    },
    media: [{
      key: "phase292-metropolitan-primary",
      title: "Pilot MR Metropolitan 事实示意图（非产品照片）",
      sourceKey: S.svg.key,
      localPath: S.svg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表现真实比例、颜色、Logo 或刻字。",
      sourceUrl: S.svg.url,
      usageStatus: "primary",
    }],
    timeline: [{ key: "phase292-metropolitan-timeline", title: "MR Metropolitan 进入 Pilot 北美 collection", eventType: "model_released", startDate: "2010", circa: true, description: "官方 brochure 与 2010 年代独立评测共同支持 MR Metropolitan 在该时期已进入北美公开销售；未将资料窗口冒充精确上市日。", sourceKey: S.brochure.key }],
  };

const pilotBrand = phase41IdentityCleanupPacks.find((pack) => pack.entityId === PHASE292_PILOT_BRAND_ID && pack.expectedType === "brand");
if (!pilotBrand) throw new Error("Phase 292 Pilot brand pack prerequisite is missing.");

export const phase292PilotMetropolitanPacks: CuratedEntityPack[] = [structuredClone(pilotBrand), metropolitanPack];
