import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { createPhase73FranklinChristophModel20Packs } from "./phase73-franklin-christoph-model20";

export const PHASE293_FC_BRAND_ID = "p73FRCBRAND";
export const PHASE293_MODEL02_ID = "phase293-pen-franklin-christoph-model-02";
export const PHASE293_MODEL02_SLUG = "franklin-christoph-model-02-intrinsic";

const RETRIEVED = "2026-07-28";
const MODEL_SCOPE = "phase293-franklin-christoph-model02";

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
  const url = "/images/library/site-original/phase293/franklin-christoph/model-02.svg";
  return {
    key: "phase293-fc-model02-diagram",
    registryKey: "fountain-pen-graph-editorial-phase293",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase293",
    title: "Franklin-Christoph Model 02 Intrinsic factual diagram",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；表达中段收腰、深插帽、#6 笔尖与 C/C／eyedropper 边界，不是产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false`,
  };
}

const S = {
  product: web({
    key: "phase293-fc-model02-product",
    title: "Franklin-Christoph Model 02 Intrinsic Fountain Pen - Solid Black",
    url: "https://www.franklin-christoph.com/products/model-02-intrinsic-fp-solid-black",
    registryKey: "franklin-christoph-official-model02",
    registryName: "Franklin-Christoph official",
    summary: "官方 Model 02 页面给出中心收腰、深插帽、硬质 acrylic、尺寸重量、#6 笔尖、短国际墨囊／converter、约 3.8 ml eyedropper 与 Solid Black 当前 sold out 状态。",
  }),
  history: web({
    key: "phase293-fc-history",
    title: "Franklin-Christoph History",
    url: "https://www.franklin-christoph.com/pages/history",
    registryKey: "franklin-christoph-official-history-phase293",
    registryName: "Franklin-Christoph official",
    summary: "官方沿革页把 Franklin-Christoph 的品牌转型与 Model 02 2011 年旗舰定位分开叙述，不能用品牌年份替代型号首发年份。",
  }),
  nibs: web({
    key: "phase293-fc-nib-info",
    title: "Franklin-Christoph FP Nib Details and Info",
    url: "https://www.franklin-christoph.com/pages/fp-nib-details-and-info",
    registryKey: "franklin-christoph-official-nibs-phase293",
    registryName: "Franklin-Christoph official",
    summary: "官方笔尖资料按 #5、#6 单元分组并说明替换路线；具体尖宽和研磨随订单、库存与批次核对。",
  }),
  review: web({
    key: "phase293-fc-model02-review",
    title: "The Serial Doodler: Review — Franklin-Christoph Model 02 Intrinsic",
    url: "https://theserialdoodler.wordpress.com/2015/11/15/review-franklin-christoph-model-02-intrinsic/",
    registryKey: "serial-doodler-franklin-christoph-model02",
    registryName: "The Serial Doodler",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测补充 Model 02 的单一使用样本和深插帽体验；不替代官方尺寸、库存或每一批次的客观规格。",
  }),
  model20: web({
    key: "phase293-fc-model20-boundary",
    title: "Franklin-Christoph Model 20 Marietta",
    url: "https://www.franklin-christoph.com/collections/model-20-marietta",
    registryKey: "franklin-christoph-official-model20-phase293",
    registryName: "Franklin-Christoph official Model 20",
    summary: "官方 Model 20 Marietta 集合页作为同品牌边界来源；全尺寸 slip-cap、尺寸与供墨不回填给 Model 02。",
  }),
  pocket20: web({
    key: "phase293-fc-pocket20-boundary",
    title: "Franklin-Christoph Model P20 Classic Black",
    url: "https://www.franklin-christoph.com/products/model-p20-classic-black",
    registryKey: "franklin-christoph-official-pocket20-phase293",
    registryName: "Franklin-Christoph official pocket 20",
    tier: "contemporary_archive",
    summary: "官方 pocket 20 页面作为短笔形边界来源；不把 pocket 20 的尺寸、图片或不附 converter 的配置写入 Model 02。",
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

const model02Pack: CuratedEntityPack = {
  key: "phase293-franklin-christoph-model02-v1",
  entityId: PHASE293_MODEL02_ID,
  expectedType: "pen",
  expectedSlug: PHASE293_MODEL02_SLUG,
  canonicalName: "Franklin-Christoph Model 02 Intrinsic",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/franklin-christoph-model02-phase293.md",
  storyTitle: "Franklin-Christoph Model 02 Intrinsic：中段收腰、深插帽与 #6 供墨边界",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Franklin-Christoph Model 02 Intrinsic", language: "en", sourceKey: S.product.key },
    { alias: "Franklin-Christoph Model 02", language: "en", kind: "alias", sourceKey: S.history.key },
    { alias: "Model 02 Intrinsic", language: "en", sourceKey: S.product.key },
    { alias: "富兰克林-克里斯托弗 Model 02 Intrinsic", language: "zh", sourceKey: S.product.key },
    { alias: "富兰克林克里斯托弗 02 Intrinsic", language: "zh", sourceKey: S.history.key },
  ],
  sources: [S.product, S.history, S.nibs, S.review, S.model20, S.pocket20, S.svg],
  scopes: [{
    key: MODEL_SCOPE,
    scopeKey: MODEL_SCOPE,
    market: "Franklin-Christoph Model 02 Intrinsic official catalog and identified material variants",
    productionState: "current",
    nibScope: "#6 unit; factory/custom tip options depend on order and batch",
    materialScope: "durable hard acrylic; color and finial vary by SKU",
    editionScope: "Solid Black, maroon-finial black, and other acrylic batches are variants; Model 20, pocket 20, and Model 31 remain separate model identities",
  }],
  claims: [
    claim("phase293-model02-identity", "model_identity", "Model 02 Intrinsic 是 Franklin-Christoph 的独立旗舰笔形，以中段收腰让帽盖深插；不是 Model 20、pocket 20 或 Model 31 的别名。", S.product.key, "official product title and central taper/deep-posting description"),
    claim("phase293-model02-history", "release_history", "官方 History 将 Model 02 Intrinsic 记为 2011 年推出的新旗舰；该年份不替代品牌成立年份，也不移植给其他 Franklin-Christoph 型号。", S.history.key, "2011 Model 02 introduction in official history"),
    claim("phase293-model02-material", "material", "官方示例采用 durable hard acrylic；Solid Black 是较少见的生产示例，常见黑色可能带 maroon finial，其他颜色与树脂批次另行记录。", S.product.key, "official material and Solid Black production note"),
    claim("phase293-model02-dimensions", "dimensions", "官方当前页约合帽 146.05 mm、套帽 148.59 mm、笔身含尖 130.81 mm；帽径 15.49 mm、上杆 13.97 mm、下杆 11.30 mm、最细握位 11.18 mm。", S.product.key, "official dimensional table converted from inches"),
    claim("phase293-model02-weight", "weight", "官方当前页给出无墨约 20.71 g；树脂、笔尖、转换器和测量方法变化时，应把卖家实测作为版本信息，不扩写成固定公差。", S.product.key, "official uninked weight"),
    claim("phase293-model02-nib", "nib", "Model 02 使用 #6 笔尖单元，官方资料列出 factory/custom tip 路线；具体尖材、尖宽、研磨和库存须按 SKU 与订单核对。", S.nibs.key, "official #6 nib grouping and replacement information"),
    claim("phase293-model02-fill", "filling_system", "可使用短国际墨囊或 converter，也可在密封状态核对后 eyedropper；官方示例给出约 3.8 ml 滴入容量。", S.product.key, "official filling paths and eyedropper capacity"),
    claim("phase293-model02-secondary-identity", "secondary_identity_check", "独立评测以 Model 02 Intrinsic 为明确对象，补充了该笔形的长握位与深插帽使用语境；这只用于交叉确认型号身份，不把单一作者体验当成工厂规格。", S.review.key, "review title and model-specific sample", "core"),
    claim("phase293-model02-boundary", "model_boundary", "Model 20 Marietta 是独立全尺寸 slip-cap，pocket 20 是更短且供墨配置不同的独立笔形；二者的图片、尺寸和 converter 条件不能回填给 Model 02。", S.model20.key, "official Model 20 collection boundary", "editorial"),
    claim("phase293-model02-balance", "handling", "官方说明合帽或套帽书写都能保持平衡；独立评测只作为单一用户对长握位和深插帽的体验补充，不能升格为所有笔主观感受。", S.review.key, "independent review sample and official balance context", "editorial"),
    claim("phase293-model02-care", "maintenance_guidance", "换色应以室温清水吸排并晾干，避免热水、酒精、丙酮和硬物；发现裂纹、漏墨、松帽或笔尖错位时停止强拆并寻求品牌或专业维修。", S.product.key, "official durable acrylic, filling and warranty context", "editorial"),
    claim("phase293-model02-buying", "selection_guidance", "购买前应核对中段收腰、合帽/套帽长度、#6 尖型、converter 是否在、滴入密封和具体树脂批次；需要短尺寸或 Marietta slip-cap 时分别跳转 sibling 页面。", S.pocket20.key, "official sibling dimensions/configuration boundary", "editorial"),
  ],
  variants: [
    { key: "phase293-model02-solid-black", name: "Solid Black（官方示例 SKU）", notes: "官方当前产品页以 Solid Black 命名且显示 sold out；记录为颜色/库存版本，不等于所有 Model 02 都是纯黑。", sourceKey: S.product.key, variantKind: "color", market: "official catalog" },
    { key: "phase293-model02-maroon-finial", name: "Black with maroon finial（常见黑色端饰边界）", notes: "官方说明通常黑色 02 可能带 maroon finial；端饰用于区分批次，不能拆成新的机械型号。", sourceKey: S.product.key, variantKind: "edition_group" },
    { key: "phase293-model02-acrylic-batches", name: "其他 hard acrylic color / resin batches", notes: "颜色、树脂纹理和限量批次按商品页与检索日期记录；未验证的卖家颜色名不自动创建实体。", sourceKey: S.product.key, variantKind: "material" },
    { key: "phase293-model02-factory-custom-nib", name: "Factory or custom #6 tip options", notes: "尖材、尖宽和研磨随订单与库存变化；#6 单元路线不是某一固定尖型的保证。", sourceKey: S.nibs.key, variantKind: "nib" },
    { key: "phase293-model02-eyedropper", name: "Eyedropper configuration", notes: "官方示例约 3.8 ml；使用前确认密封、墨水兼容性和二手笔状态，不把容量当作无条件长期承诺。", sourceKey: S.product.key, variantKind: "variant" },
  ],
  spec: {
    brandEntityId: PHASE293_FC_BRAND_ID,
    values: {
      series_name: "Franklin-Christoph Model 02 Intrinsic",
      release_year: "2011（官方 History）",
      origin_country: "美国制造（官方当前 Model 02 页面）",
      nib: "#6 笔尖单元；factory/custom tip 选项按订单与批次",
      fill_system: "短国际墨囊／converter；可 eyedropper，官方示例约 3.8 ml",
      material: "durable hard acrylic；Solid Black 与 maroon finial 等颜色/端饰属于版本",
      dimensions: "约合帽 146.05 mm、套帽 148.59 mm、笔身含尖 130.81 mm；帽径 15.49 mm、上杆 13.97 mm、下杆 11.30 mm、最细握位 11.18 mm",
      weight: "约 20.71 g（无墨）",
      status: "官方型号页仍可核对；Solid Black 示例当前显示 sold out，库存按 SKU 变化",
    },
    evidence: [
      ev("phase293-model02-brand", "brand_entity_id", S.product.key, "official Franklin-Christoph product identity"),
      ev("phase293-model02-series", "series_name", S.product.key, "official Model 02 Intrinsic title"),
      ev("phase293-model02-release", "release_year", S.history.key, "official 2011 Model 02 history"),
      ev("phase293-model02-origin", "origin_country", S.product.key, "official Made in USA context"),
      ev("phase293-model02-nib", "nib", S.nibs.key, "official #6 unit information"),
      ev("phase293-model02-fill", "fill_system", S.product.key, "official cartridge/converter/eyedropper information"),
      ev("phase293-model02-material", "material", S.product.key, "official hard acrylic description"),
      ev("phase293-model02-dimensions", "dimensions", S.product.key, "official dimensional table"),
      ev("phase293-model02-weight", "weight", S.product.key, "official uninked weight"),
      ev("phase293-model02-status", "status", S.product.key, "official current sold-out SKU state"),
    ],
  },
  media: [{
    key: "phase293-model02-primary",
    title: "Franklin-Christoph Model 02 Intrinsic 事实示意图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表现真实比例、颜色、Logo、库存或具体批次。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [{ key: "phase293-model02-2011", title: "Model 02 Intrinsic 作为 Franklin-Christoph 新旗舰推出", eventType: "model_released", startDate: "2011", circa: false, description: "官方 History 将 Model 02 Intrinsic 记为 2011 年推出的新旗舰；年份只约束该型号，不替代品牌沿革。", sourceKey: S.history.key }],
};

const prerequisite = createPhase73FranklinChristophModel20Packs({ brandId: PHASE293_FC_BRAND_ID, penId: "p73FRCMODEL20" }).find((pack) => pack.expectedType === "brand");
if (!prerequisite) throw new Error("Phase 293 Franklin-Christoph brand pack prerequisite is missing.");

export const phase293FranklinChristophModel02Packs: CuratedEntityPack[] = [structuredClone(prerequisite), model02Pack];
