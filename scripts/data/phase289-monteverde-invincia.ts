import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE74_MONTEVERDE_BRAND_ID,
  phase74MonteverdeRitmaPacks,
} from "./phase74-monteverde-ritma";

const RETRIEVED = "2026-07-27";
export const PHASE289_MONTEVERDE_ID = PHASE74_MONTEVERDE_BRAND_ID;
export const PHASE289_INVINCIA_ID = "phase289-entity-monteverde-invincia";
export const PHASE289_INVINCIA_SLUG = "monteverde-invincia";
const SCOPE = "phase289-monteverde-invincia";

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

const collection = web({
  key: "phase289-invincia-collection",
  title: "Monteverde USA Invincia Collection",
  url: "https://www.monteverdepens.com/collections/invincia",
  registryKey: "monteverde-official-phase289",
  registryName: "Monteverde USA official",
  summary:
    "官方集合页把 Invincia 的 fountain pen、GEL rollerball 与 ballpoint 分开列出，并展示 Chrome、Color Fusion、Nebula、Rose Gold Carbon Fiber、Stealth Black 等表面和当前 SKU。",
});
const guide = web({
  key: "phase289-invincia-guide",
  title: "Invincia Design, Materials & Writing Modes Guide",
  url: "https://www.monteverdepens.com/pages/invincia-regular",
  registryKey: "monteverde-official-phase289",
  registryName: "Monteverde USA official",
  summary:
    "官方说明以 solid brass 为基础，fountain-pen 版本使用 JoWo #6 stainless-steel nib，尖幅和 cartridge/converter 选项随供货变化；其它书写模式使用各自 refill。",
});
const chrome = web({
  key: "phase289-invincia-chrome",
  title: "Monteverde USA Invincia Chrome Fountain Pen with JoWo Nib",
  url: "https://www.monteverdepens.com/collections/invincia/products/monteverde-usa%C2%AE-invincia%E2%84%A2-chrome-fountain-pen-w-jowo-nib",
  registryKey: "monteverde-official-phase289",
  registryName: "Monteverde USA official",
  summary:
    "当前 Chrome fountain-pen SKU MV41498，页面列 EF/F/M/B/Stub/Omniflex、标准国际墨囊或随附 converter，并将 Chrome 表面与 solid brass 结构分开描述。",
});
const nebula = web({
  key: "phase289-invincia-nebula",
  title: "Monteverde USA Invincia Nebula Fountain Pen with JoWo Nib",
  url: "https://www.monteverdepens.com/products/monteverde-usa%C2%AE-invincia%E2%84%A2-nebula-fountain-pen-w-jowo-nib",
  registryKey: "monteverde-official-phase289",
  registryName: "Monteverde USA official",
  summary:
    "当前 Nebula fountain-pen SKU MV42527；官方页面说明蓝紫渐变高光漆面、solid brass body 与标准国际墨囊／converter，并列 EF/F/M/B/Stub/Omniflex。",
});
const penAddict = web({
  key: "phase289-invincia-penaddict",
  title: "Monteverde Invincia Nebula with Omniflex Nib Review",
  url: "https://www.penaddict.com/blog/2022/3/23/monteverde-invincia-nebula-with-omniflex-nib-fountain-pen-review",
  registryKey: "penaddict-phase289",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  summary:
    "独立评测记录 Invincia 的长期清洗、螺纹帽约四分之一圈、converter 与两支短国际墨囊，以及 Omniflex 轻压线宽变化；这些是样本观察，不扩写成必然表现。",
});
const goulet = web({
  key: "phase289-invincia-goulet",
  title: "Monteverde Invincia Color Fusion Fountain Pen",
  url: "https://www.gouletpens.com/products/monteverde-invincia-color-fusion-fountain-pen-stealth-black",
  registryKey: "goulet-pens-phase289",
  registryName: "Goulet Pen Company",
  sourceType: "retailer",
  tier: "professional_secondary",
  summary:
    "专业零售商提供 converter 安装与清洗的一般说明，并将该页面明确标为 Invincia fountain pen；不替代官方 SKU 的材料和尖幅证据。",
});
const diagram: CuratedSource = {
  key: "phase289-invincia-diagram",
  registryKey: "fountain-pen-graph-editorial-phase289",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase289",
  title: "Monteverde Invincia identity factual SVG",
  url: "/images/library/site-original/phase289/monteverde/invincia.svg",
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  allowedUse: "store_full",
  license: "site-original",
  summary:
    "本站原创 factual SVG；非产品照片、非比例图、非颜色校样或品牌 Logo。",
  archiveUrl: "/images/library/site-original/phase289/monteverde/invincia.svg",
  archiveLocator:
    "project-public-asset:/images/library/site-original/phase289/monteverde/invincia.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
};

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
) {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey: SCOPE }],
  };
}

const inheritedBrand = phase74MonteverdeRitmaPacks.find(
  (pack) => pack.entityId === PHASE289_MONTEVERDE_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 289 Monteverde brand pack missing.");
const monteverdeBrandSource = inheritedBrand.sources.find(
  (source) => source.key === "phase74-monteverde-about",
);
if (!monteverdeBrandSource) throw new Error("Phase 289 Monteverde brand source missing.");

const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase289-monteverde-brand-v2";
brand.markdownFile = ".planning/content-research/monteverde-brand-phase289.md";
brand.storyTitle = "Monteverde：Ritma 与 Invincia 是两条不同的金属笔路线";
brand.sources.push(collection, guide, penAddict);
brand.scopes[0]!.editionScope =
  "品牌导航仅反向链接到已完成身份、内容和来源核验的 Ritma 与 Invincia；其它系列、颜色、滚珠或圆珠不因共享品牌而自动成为公开钢笔型号。";
const navigation = brand.claims.find(
  (item) => item.key === "phase74-monteverde-brand-navigation",
);
if (!navigation) throw new Error("Phase 289 Monteverde navigation claim missing.");
navigation.objectText =
  "Ritma 与 Invincia 是本馆已核对的两个具体钢笔系列；Ritma 的磁吸帽与材料分支、Invincia 的金属表面与笔尖选项分别属于各自型号边界，颜色、滚珠、圆珠和未核对系列不能伪装成新的钢笔型号。";
navigation.sourceKey = collection.key;
navigation.locator = collection.summary;
navigation.evidence = [
  { key: "phase289-brand-navigation-collection", sourceKey: collection.key, scopeKey: "phase74-monteverde-brand-scope", locator: collection.summary },
  { key: "phase289-brand-navigation-guide", sourceKey: guide.key, scopeKey: "phase74-monteverde-brand-scope", locator: guide.summary },
  { key: "phase289-brand-navigation-secondary", sourceKey: penAddict.key, scopeKey: "phase74-monteverde-brand-scope", locator: penAddict.summary },
];

const model: CuratedEntityPack = {
  key: "phase289-monteverde-invincia-v2",
  entityId: PHASE289_INVINCIA_ID,
  expectedType: "pen",
  expectedSlug: PHASE289_INVINCIA_SLUG,
  canonicalName: "Monteverde Invincia",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/monteverde-invincia-phase289.md",
  storyTitle: "Monteverde Invincia：厚重金属感与可替换笔尖的日用路线",
  primarySourceKey: collection.key,
  depthTier: "A",
  aliases: [
    { alias: "Monteverde Invincia", language: "en", sourceKey: collection.key },
    { alias: "Monteverde Invincia Fountain Pen", language: "en", sourceKey: chrome.key },
    { alias: "万特佳 Invincia", language: "zh", sourceKey: collection.key },
  ],
  sources: [monteverdeBrandSource, collection, guide, chrome, nebula, penAddict, goulet, diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Monteverde USA current Invincia fountain-pen collection and referenced Nebula review",
      productionState: "current",
      nibScope: "JoWo #6 stainless steel; EF/F/M/B/Stub/Omniflex are SKU-scoped options",
      materialScope: "solid brass is the official current design description; finishes and carbon-fiber treatment vary by SKU",
      editionScope: "Chrome, Color Fusion, Nebula, Rose Gold Carbon Fiber and Stealth Black remain finish/SKU boundaries; rollerball and ballpoint are separate writing modes",
    },
  ],
  claims: [
    claim("invincia-identity", "model_identity", "Monteverde Invincia 是 Monteverde USA 旗下独立的金属感钢笔系列；当前集合也销售同名滚珠和圆珠工具，但它们不是本页的 fountain pen 实体。", collection.key, "official Invincia collection categories"),
    claim("invincia-body", "material_finish", "官方设计说明以 solid brass 为基础，碳纤维、Chrome、Nebula、Rose Gold 和 Stealth Black 等表面随具体 SKU 变化；不写成全系列统一尺寸或重量。", guide.key, "official materials and finish guide"),
    claim("invincia-nib", "nib", "当前官方页面列 JoWo #6 stainless-steel nib；EF、F、M、B、Stub 与 Omniflex 为 SKU 和库存范围，Omniflex 仍是钢尖。", guide.key, "official nib FAQ and product options"),
    claim("invincia-fill", "filling_system", "钢笔使用标准国际墨囊或 piston ink converter；评测记录部分套装附 converter 和两支短国际墨囊，但包装需按购买地区核对。", chrome.key, "official cartridge/converter statement", "core"),
    claim("invincia-cap", "cap_mechanism", "独立评测的 Invincia 使用螺纹帽，约四分之一圈即可操作；它与 Ritma 的磁吸帽不同。", penAddict.key, "quarter-turn screw cap observation"),
    claim("invincia-care", "maintenance_guidance", "换色或久置前用清水冲洗 converter 和笔尖并充分干燥；不要用酒精、热水、研磨工具或蛮力处理漆面、镀层和螺纹。", goulet.key, "retailer cleaning guidance", "editorial"),
    claim("invincia-buying", "selection_guidance", "选购要确认 fountain pen 模式、精确表面、尖幅、商品号、converter/墨囊与库存；不能用 Ritma 的尺寸、磁吸帽或图片代替 Invincia。", collection.key, "current collection and model boundary", "editorial"),
  ],
  variants: [
    { key: "invincia-chrome", name: "Chrome", notes: "当前 Chrome fountain-pen SKU MV41498；镜面表面、尖幅与库存随地区变化。", sourceKey: chrome.key, variantKind: "market_sku", productCode: "MV41498" },
    { key: "invincia-color-fusion", name: "Color Fusion Stealth Black", notes: "官方当前集合中的表面/SKU；不是独立基础型号。", sourceKey: collection.key, variantKind: "color" },
    { key: "invincia-nebula", name: "Nebula", notes: "当前 Nebula fountain-pen SKU MV42527；蓝紫渐变高光漆面，官方页面列 EF/F/M/B/Stub/Omniflex。", sourceKey: nebula.key, variantKind: "market_sku", productCode: "MV42527" },
    { key: "invincia-rose-gold", name: "Rose Gold / Rose Gold Carbon Fiber", notes: "表面与饰件变化；不能把滚珠版本图片当钢笔主图。", sourceKey: collection.key, variantKind: "variant" },
    { key: "invincia-omniflex", name: "Omniflex nib option", notes: "Omniflex 是钢尖选项；评测中的线宽变化取决于压力、墨水和纸张，不是保证的金尖 flex。", sourceKey: penAddict.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE289_MONTEVERDE_ID,
    values: {
      series_name: "Monteverde Invincia",
      release_year: "当前官方 collection 与 SKU 页面可见；本包不断言具体首发年份",
      origin_country: "Monteverde USA 品牌入口位于 California；具体制造地以 exact SKU 与包装为准",
      nib: "JoWo #6 不锈钢尖；EF/F/M/B/1.1 mm Stub/Omniflex 按 SKU 与地区库存变化",
      fill_system: "标准国际墨囊或 piston ink converter；仅限 fountain-pen 版本",
      material: "官方设计说明以 solid brass 为基础；碳纤维、镀层与漆面随具体版本变化",
      status: "当前官方 collection 仍列出 fountain-pen SKU；颜色、尖幅与库存按访问日和市场变化",
    },
    evidence: [
      evidence("invincia-brand", "brand_entity_id", collection.key, "Monteverde Invincia collection"),
      evidence("invincia-series", "series_name", collection.key, "Invincia collection heading"),
      evidence("invincia-release", "release_year", collection.key, "current collection presence; no unsupported launch year"),
      evidence("invincia-origin", "origin_country", "phase74-monteverde-about", "Monteverde official brand context without factory inference"),
      evidence("invincia-nib-field", "nib", guide.key, "official JoWo #6 stainless-steel nib and options"),
      evidence("invincia-fill-field", "fill_system", chrome.key, "official cartridge/converter statement"),
      evidence("invincia-material-field", "material", guide.key, "official solid brass and finish guide"),
      evidence("invincia-status", "status", collection.key, "current collection and market-scoped SKU status"),
    ],
  },
  media: [
    {
      key: "invincia-primary",
      title: diagram.title,
      sourceKey: diagram.key,
      localPath: diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非比例图、非颜色校样或品牌 Logo。",
      sourceUrl: diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "invincia-current-collection",
      title: "Invincia 当前集合边界复核",
      eventType: "design_milestone",
      startDate: "2026",
      circa: true,
      description: "当前官方集合把 Invincia 钢笔、滚珠和圆珠模式，以及颜色、表面和尖幅选项分开列出；本事件不倒推具体首发年份。",
      sourceKey: collection.key,
    },
  ],
};

export const phase289MonteverdeInvinciaPacks: CuratedEntityPack[] = [brand, model];
