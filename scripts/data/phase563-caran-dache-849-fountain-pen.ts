import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { phase435BrandDepthRefreshPacks } from "./phase435-brand-depth-refresh";

const RETRIEVED = "2026-08-10";
export const PHASE563_CARAN_BRAND_ID = "phase139-brand-caran-dache";
export const PHASE563_849_ID = "phase563-caran-dache-849-fountain-pen";
export const PHASE563_849_SLUG = "caran-dache-849-fountain-pen";
export const PHASE563_849_NAME = "Caran d’Ache 849 Fountain Pen";
const SCOPE_KEY = "phase563-caran-dache-849-current";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  summary: string;
  locator: string;
  itemType?: string;
  publishedAt?: string;
  author?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.independenceGroup,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.itemType ?? "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt ?? null,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase563",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase563",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作颜色证明。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  blackCode: web({
    key: "phase563-caran-849-black-code",
    title: "Fountain Pen 849™ BLACK CODE | Caran d’Ache official",
    url: "https://www.carandache.com/us/en/fountain-pen/fountain-pen-849-black-code-p-11534.htm",
    registryKey: "caran-official-849-black-code-phase563",
    registryName: "Caran d’Ache official Black Code product page",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "caran-official-849-black-code",
    summary: "官方 Black Code 页面列出六角铝制笔身与笔帽、黑色表面、黑色塑料握位、黑色镀层不锈钢尖、Chromatics Cosmic Black 墨囊、ink pump、瑞士制造与 F/M product reference。",
    locator: "composition, nib, cartridge, ink pump, Swiss Made and product reference fields",
  }),
  metalBlue: web({
    key: "phase563-caran-849-metal-blue",
    title: "Fountain Pen 849™ Metal Blue | Caran d’Ache official",
    url: "https://www.carandache.com/us/en/fountain-pen/fountain-pen-849-metal-blue-p-10914.htm",
    registryKey: "caran-official-849-metal-blue-phase563",
    registryName: "Caran d’Ache official Metal Blue product page",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "caran-official-849-metal-blue",
    summary: "官方 Metal Blue 页面描述轻量且坚固的铝制笔身、瑞士制造和 849 钢笔路线，并在当前商品 JSON 文本中列出 EF/F/M/B 及对应参考号。",
    locator: "Metal Blue product description and EF/F/M/B product cards",
  }),
  metalBlack: web({
    key: "phase563-caran-849-metal-black",
    title: "Fountain Pen 849™ Metal Black | Caran d’Ache official",
    url: "https://www.carandache.com/us/en/fountain-pen/fountain-pen-849-metal-black-p-10912.htm",
    registryKey: "caran-official-849-metal-black-phase563",
    registryName: "Caran d’Ache official Metal Black product page",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "caran-official-849-metal-black",
    summary: "官方 Metal Black 商品页用于核对普通黑色彩色铝身版本与 Black Code 的版本边界；不把一个页面的价格或尖幅扩展为全系固定值。",
    locator: "Metal Black product identity and current market card",
  }),
  family: web({
    key: "phase563-caran-849-family",
    title: "849™ Family | Caran d’Ache official",
    url: "https://www.carandache.com/us/en/849-family-s-1247.htm",
    registryKey: "caran-official-849-family-phase563",
    registryName: "Caran d’Ache official 849 family navigation",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "caran-official-849-family",
    summary: "官方 849 Family 导航同时列出钢笔、圆珠笔、机械铅笔和滚珠笔，并展示 Fluo、Metal、Red 等钢笔颜色入口；它支持同系列导航，不证明不同工具共用零件。",
    locator: "849 Family product cards for fountain pen and other writing instruments",
  }),
  ecridor: web({
    key: "phase563-caran-ecridor-boundary",
    title: "ECRIDOR collection | Caran d’Ache official",
    url: "https://www.carandache.com/us/en/ecridor",
    registryKey: "caran-official-ecridor-boundary-phase563",
    registryName: "Caran d’Ache official Ecridor collection",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "caran-official-ecridor-boundary",
    summary: "官方 Ecridor 页面说明其六角家族、1947/1953 的 Ecridor 工具历史和金/钯涂层雕刻路线；仅用作与 849 的身份边界，不借入 Ecridor 规格。",
    locator: "Ecridor family history, hexagonal body and guilloché boundary",
  }),
  faq: web({
    key: "phase563-caran-writing-faq",
    title: "FAQ | Caran d’Ache official",
    url: "https://www.carandache.com/us/en/faq.cfm",
    registryKey: "caran-official-faq-phase563",
    registryName: "Caran d’Ache official FAQ",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "caran-official-faq",
    summary: "官方 FAQ 说明 849 钢笔随附蓝色墨囊，并要求按 owner’s guide 清洁、避免 aggressive products 和跳过拆装步骤；还说明官网库存随市场变化。",
    locator: "writing instrument cartridge, cleaning and maintenance answers",
  }),
  warranty: web({
    key: "phase563-caran-warranty",
    title: "General Terms and Conditions | Caran d’Ache official",
    url: "https://www.carandache.com/gb/en/cgv.cfm",
    registryKey: "caran-official-warranty-phase563",
    registryName: "Caran d’Ache official sales terms",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "caran-official-warranty",
    summary: "官方条款列出材料/制造缺陷保修、日常维护、正常磨损、误用、未经授权维修和不推荐墨水/组件等排除项；当前条款写两年并允许部分 Haute Écriture 延长。",
    locator: "section 3.10 warranty exclusions, duration and repair boundary",
  }),
  catalog: web({
    key: "phase563-caran-fine-writing-catalog",
    title: "Fine Writing catalogue 2024 | Caran d’Ache",
    url: "https://carandache.co.za/wp-content/uploads/2024/01/CDA_Catalogue_Fine-Writing_2024_EN_Light.pdf",
    registryKey: "caran-official-fine-writing-catalog-phase563",
    registryName: "Caran d’Ache official Fine Writing catalogue",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "caran-official-fine-writing-catalog",
    itemType: "pdf",
    summary: "官方 Fine Writing 目录用于交叉核对 849 与 Ecridor 的产品线分层、钢笔尖幅与墨囊/ink pump 术语；目录版本和地区字段必须保留时间边界。",
    locator: "849 fountain pen family and fine-writing line catalogue rows",
  }),
  penChalet: web({
    key: "phase563-caran-849-penchalet-review",
    title: "Caran d’Ache 849 Fountain Pen Review & Giveaway! | Pen Chalet",
    url: "https://www.penchalet.com/blog/caran-dache-849-fountain-pen-review/",
    registryKey: "penchalet-849-review-phase563",
    registryName: "Pen Chalet",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penchalet-849-review",
    publishedAt: "2017-11-03",
    summary: "署名评测使用 Sapphire Blue 样本，记录六角笔身、防滚、握位、插帽约 7 英寸、标准国际墨囊/转换器和一支样本的书写观察；不替代当前官方 SKU。",
    locator: "appearance, filling, posted length and sample-specific performance sections",
  }),
  penAddict: web({
    key: "phase563-caran-849-penaddict-review",
    title: "Caran d’Ache 849 Fountain Pen Review | The Pen Addict",
    url: "https://www.penaddict.com/blog/2017/10/25/caran-dache-849-fountain-pen-review",
    registryKey: "penaddict-849-review-phase563",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penaddict-849-review",
    publishedAt: "2017-10-25",
    summary: "署名评测以 EF 样本记录塑料握位、国际短墨囊/转换器、出墨、插帽稳定性、夹子和尺寸感；所有结论限定于该样本、日期和墨水条件。",
    locator: "EF sample, filling, grip, clip, posting and writing observations",
  }),
  svg: diagram(
    "phase563-caran-849-fountain-pen-svg",
    "Caran d’Ache 849 Fountain Pen identity and variant boundary diagram",
    "/images/library/site-original/phase563/caran-dache/849-fountain-pen.svg",
  ),
} satisfies Record<string, CuratedSource>;

const scope: CuratedScope = {
  key: SCOPE_KEY,
  scopeKey: SCOPE_KEY,
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Caran d’Ache US official catalog and current 849 Family navigation",
  nibScope: "Stainless steel nib; Metal Blue page currently lists EF/F/M/B, while Black Code page exposes F/M references",
  materialScope: "Aluminium hexagonal body and cap, plastic grip, metal clip/button; finish varies by edition",
  editionScope: "One 849 Fountain Pen identity with color/market/nib variants; 849 ballpoint, roller and mechanical pencil remain sibling tools",
};

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: CuratedClaim["factClass"] = "core",
  confidence = factClass === "core" ? 0.98 : 0.93,
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE_KEY, locator }],
  };
}

function specEvidence(
  key: string,
  fieldKey: CuratedSpecEvidence["fieldKey"],
  sourceKey: string,
  locator: string,
  note?: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE_KEY, locator, qualifies: true, note };
}

const caranBrandPack = phase435BrandDepthRefreshPacks.find(
  (pack) => pack.entityId === PHASE563_CARAN_BRAND_ID && pack.expectedType === "brand",
);
if (!caranBrandPack) throw new Error("Phase 563 Caran d’Ache brand pack is missing.");

const pack: CuratedEntityPack = {
  key: "phase563-caran-dache-849-fountain-pen-v1",
  entityId: PHASE563_849_ID,
  expectedType: "pen",
  expectedSlug: PHASE563_849_SLUG,
  canonicalName: PHASE563_849_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/caran-dache-849-fountain-pen-phase563.md",
  storyTitle: "Caran d’Ache 849 Fountain Pen：六角铝身、钢尖与墨囊日用路线",
  primarySourceKey: S.metalBlue.key,
  depthTier: "A",
  aliases: [
    { alias: "Caran d’Ache 849 Fountain Pen", language: "en", sourceKey: S.metalBlue.key },
    { alias: "849 Fountain Pen", language: "en", sourceKey: S.family.key },
    { alias: "849™ Fountain Pen", language: "en", sourceKey: S.family.key },
    { alias: "Caran d’Ache 849 钢笔", language: "zh", sourceKey: S.metalBlue.key },
    { alias: "Caran d'Ache 849", language: "en", sourceKey: S.family.key },
    { alias: "2000109140032", language: "en", kind: "producer_name", sourceKey: S.metalBlue.key },
    { alias: "2000109140025", language: "en", kind: "producer_name", sourceKey: S.metalBlue.key },
    { alias: "2000109140018", language: "en", kind: "producer_name", sourceKey: S.metalBlue.key },
    { alias: "2000109140049", language: "en", kind: "producer_name", sourceKey: S.metalBlue.key },
    { alias: "840.496", language: "en", kind: "producer_name", sourceKey: S.blackCode.key },
    { alias: "841.496", language: "en", kind: "producer_name", sourceKey: S.blackCode.key },
  ],
  sources: Object.values(S),
  scopes: [scope],
  claims: [
    claim("849-identity", "model_identity", "849 Fountain Pen 是 Caran d’Ache 849 Family 中的独立钢笔型号；不与 849 圆珠笔、机械铅笔、滚珠笔合并。", S.family.key, "849 Family fountain pen card and separate writing instrument categories"),
    claim("849-brand", "made_by", "官方 849 商品页把该钢笔列为 Caran d’Ache 产品，并写明 Designed and made in Switzerland。", S.metalBlue.key, "Designed and made in Switzerland and product identity"),
    claim("849-material", "material", "Black Code 规格写六角铝制笔身与笔帽、黑色塑料握位、金属夹与按键；不同颜色页面的表面处理不能互相覆盖。", S.blackCode.key, "composition: pen body, grip, clip and button"),
    claim("849-family-boundary", "version_boundary", "849 钢笔与 Ecridor、Léman 保持独立：共同的瑞士制造和六角/书写工具语境不等于材料、笔尖或零件相同。", S.ecridor.key, "Ecridor material and family boundary compared with 849", "editorial"),
    claim("849-nib", "nib", "官方把笔尖写为不锈钢；Black Code 页面当前列 F/M，Metal Blue 页面当前列 EF/F/M/B，具体尖幅按市场与商品卡。", S.metalBlue.key, "nib choices and product cards"),
    claim("849-metal-black-nib", "nib_finish", "Black Code 版本的不锈钢尖有 black lacquer finish；不能把这一表面处理扩展到所有颜色。", S.blackCode.key, "stainless steel nib with black lacquer finish"),
    claim("849-market-skus", "market_sku", "Metal Blue 官方页面列出 EF 2000109140032、F 2000109140025、M 2000109140018、B 2000109140049；Black Code 当前列 F 841.496 与 M 840.496。", S.metalBlue.key, "variant product references and nib options"),
    claim("849-filling", "filling_system", "官方说明 849 钢笔随附钢笔墨囊，并兼容 Chromatics 墨囊和 ink pump；ink pump 在此作为转换器语境，不是内置活塞。", S.blackCode.key, "cartridge and ink pump fields", "core"),
    claim("849-faq-cartridge", "included_accessory", "Caran d’Ache FAQ 说明 849 钢笔随笔提供蓝色钢笔墨囊；Black Code exact page 的当前页面则列 Chromatics Cosmic Black，随附颜色按市场/页面核对。", S.faq.key, "849 cartridge answer and exact product accessory", "editorial"),
    claim("849-history", "catalog_history", "Pen Chalet 在 2017-11-03 的评测称 849 Fountain Pen 是当时推出的新钢笔；该日期证明公开销售/评测窗口，不断言官方全球首发日。", S.penChalet.key, "2017 review introduction and publication date"),
    claim("849-family-colors", "color_variants", "官方 849 Family 当前导航列 Fluo Green/Orange/Pink/Yellow、Metal Black/Blue/White、Red 等钢笔入口；颜色与库存是市场时态。", S.family.key, "current family fountain pen cards"),
    claim("849-dimensions-boundary", "dimensions", "官方当前 exact product pages 未给出一套统一全系合盖、插帽、握位和裸笔重量；不能把某个样本或包装字段写成固定规格。", S.blackCode.key, "absence of unified dimensions in current composition fields", "editorial"),
    claim("849-sample-posting", "usage_observation", "Pen Chalet 样本记录插帽约 7 英寸，The Pen Addict 的 EF 样本记录插帽偏长且略有摇晃；两者均是具体样本观察。", S.penChalet.key, "posted length and sample boundary", "editorial"),
    claim("849-sample-writing", "usage_observation", "The Pen Addict 的 EF 样本记录线条清晰、出墨连续、塑料握位虽细但实际握持舒适；不外推到全部尖幅和批次。", S.penAddict.key, "EF sample writing and grip observations", "editorial"),
    claim("849-care", "maintenance_guidance", "官方 FAQ 要求按 owner’s guide 清洁，避免 aggressive products 和跳过拆装步骤；本页据此采用清水、软布和不使用溶剂/研磨剂的保守维护。", S.faq.key, "cleaning and maintenance answer"),
    claim("849-warranty", "warranty", "官方条款覆盖材料/制造缺陷并排除日常维护、正常磨损、误用、未经授权维修和不推荐墨水/组件；当前条款写两年，部分 Haute Écriture 可注册延长。", S.warranty.key, "section 3.10 warranty scope and exclusions"),
    claim("849-price", "price_boundary", "Black Code 与 Metal Blue 官方美国页面的价格在本次读取时分别为 $131.75 与 $90.50；价格、税费、折扣和库存随市场与时间变化。", S.blackCode.key, "current US price and availability fields", "editorial"),
    claim("849-media-boundary", "media_boundary", "本站 SVG 只解释六角铝身、塑料握位、不锈钢尖、墨囊/ink pump 和版本边界；它是事实示意图，不是产品照片、Logo、比例图或颜色校样。", S.svg.key, "SVG metadata and visible labels", "editorial"),
  ],
  variants: [
    { key: "849-metal-blue-ef", name: "Metal Blue EF", notes: "Metal Blue 官方当前 EF 市场 SKU；不代表所有颜色都有 EF。", sourceKey: S.metalBlue.key, variantKind: "market_sku", productCode: "2000109140032", market: "US" },
    { key: "849-metal-blue-f", name: "Metal Blue F", notes: "Metal Blue 官方当前 F 市场 SKU。", sourceKey: S.metalBlue.key, variantKind: "market_sku", productCode: "2000109140025", market: "US" },
    { key: "849-metal-blue-m", name: "Metal Blue M", notes: "Metal Blue 官方当前 M 市场 SKU。", sourceKey: S.metalBlue.key, variantKind: "market_sku", productCode: "2000109140018", market: "US" },
    { key: "849-metal-blue-b", name: "Metal Blue B", notes: "Metal Blue 官方当前 B 市场 SKU。", sourceKey: S.metalBlue.key, variantKind: "market_sku", productCode: "2000109140049", market: "US" },
    { key: "849-black-code-f", name: "Black Code F", notes: "Black Code 官方当前 F 参考号；Black Code 的表面处理与 Metal Blue 分开记录。", sourceKey: S.blackCode.key, variantKind: "market_sku", productCode: "841.496", market: "US" },
    { key: "849-black-code-m", name: "Black Code M", notes: "Black Code 官方当前 M 参考号。", sourceKey: S.blackCode.key, variantKind: "market_sku", productCode: "840.496", market: "US" },
    { key: "849-color-family", name: "849 Fountain Pen color family", notes: "Fluo、Metal、Red 等颜色属于同一 849 钢笔型号的版本导航，不另建实体。", sourceKey: S.family.key, variantKind: "color", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE563_CARAN_BRAND_ID,
    values: {
      series_name: "Caran d’Ache 849 Fountain Pen",
      release_year: "至少 2017 年已有公开销售与独立评测；官方未给精确全球首发日",
      origin_country: "瑞士制造；官方商品页写 Designed and made in Switzerland",
      nib: "不锈钢尖；Metal Blue EF/F/M/B，Black Code F/M；具体尖幅按市场 SKU",
      fill_system: "Caran d’Ache 钢笔墨囊与 ink pump（转换器）语境；随笔墨囊颜色依页面",
      material: "六角铝制笔身与笔帽、塑料握位、金属夹/按键；颜色和表面依版本",
      dimensions: "官方当前 exact product pages 未列统一全系尺寸；独立评测样本插帽约 7 英寸",
      weight: "官方当前页面未列统一裸笔重量；不从包装重量推回手持规格",
      price_range: "美国页面读取时 Black Code $131.75、Metal Blue $90.50；随市场和时间变化",
      status: "官方 849 Family 与多个 849 Fountain Pen 页面当前可见；颜色、尖幅、库存按地区",
    },
    evidence: [
      specEvidence("849-brand", "brand_entity_id", S.metalBlue.key, "Caran d’Ache product identity and Swiss Made"),
      specEvidence("849-series", "series_name", S.family.key, "849 Family fountain pen card"),
      specEvidence("849-release", "release_year", S.penChalet.key, "2017 review publication and new-model wording", "This is a documented sales/review window, not a claimed official launch date"),
      specEvidence("849-origin", "origin_country", S.blackCode.key, "Designed and made in Switzerland"),
      specEvidence("849-nib", "nib", S.metalBlue.key, "EF/F/M/B current Metal Blue options"),
      specEvidence("849-fill", "fill_system", S.blackCode.key, "cartridge and ink pump fields"),
      specEvidence("849-material", "material", S.blackCode.key, "hexagonal aluminium body/cap, plastic writing block and metal clip/button"),
      specEvidence("849-dimensions", "dimensions", S.penChalet.key, "sample-specific approximately 7 inch posted observation", "No unified official dimension table is asserted"),
      specEvidence("849-weight", "weight", S.blackCode.key, "official page does not state a unified bare-pen weight", "Retained as an explicit unknown rather than inferred"),
      specEvidence("849-price", "price_range", S.blackCode.key, "current US Black Code price and mutable inventory"),
      specEvidence("849-status", "status", S.family.key, "current 849 Family and fountain pen cards"),
    ],
  },
  timeline: [
    {
      key: "849-2017-public-review",
      title: "849 Fountain Pen 至少在 2017 年进入公开评测窗口",
      eventType: "model_released",
      startDate: "2017-10-25",
      circa: true,
      description: "The Pen Addict 于 2017-10-25 发布 849 Fountain Pen 评测；这里记录公开销售与评测窗口，不把它扩展为官方全球首发日。",
      sourceKey: S.penAddict.key,
    },
    {
      key: "849-current-family-navigation",
      title: "849 Fountain Pen 保持在官方 849 Family 导航中",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 849 Family 页面仍将钢笔与圆珠笔、机械铅笔和滚珠笔分开列出；颜色与库存需按市场复查。",
      sourceKey: S.family.key,
    },
  ],
  media: [
    {
      key: "849-factual-svg",
      title: "Caran d’Ache 849 Fountain Pen 身份与版本边界事实图（非产品照片）",
      sourceKey: S.svg.key,
      localPath: S.svg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、不按比例、不作颜色校样，不代表库存、价格或具体颜色实物。",
      sourceUrl: S.svg.url,
      usageStatus: "primary",
    },
  ],
};

export const phase563CaranDache849FountainPenPacks: CuratedEntityPack[] = [
  structuredClone(caranBrandPack),
  pack,
];
