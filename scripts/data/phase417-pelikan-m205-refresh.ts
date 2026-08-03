import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE281_M205_ID,
  PHASE281_PELIKAN_ID,
  phase281PelikanM205M215Packs,
} from "./phase281-pelikan-m205-m215";

export const PHASE417_PELIKAN_BRAND_ID = PHASE281_PELIKAN_ID;
export const PHASE417_M205_ID = PHASE281_M205_ID;
export const PHASE417_M205_SLUG = "pelikan-m205";
export const PHASE417_M205_NAME = "Pelikan M205";

const RETRIEVED = "2026-08-03";

function web(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  author?: string;
  publishedAt?: string;
  itemType?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: sourceType === "official" ? "https://www.pelikan.com/" : input.url.startsWith("/") ? "/" : new URL(input.url).origin,
    itemType: input.itemType ?? (input.url.toLowerCase().includes(".pdf") ? "pdf" : "web_page"),
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const EXTRA_SOURCES: CuratedSource[] = [
  web({
    key: "phase417-pelikan-m205-black-mam",
    registryKey: "pelikan-mam-m205-black-971986-phase417",
    registryName: "Pelikan MAM product archive",
    title: "Classic M205 Black M — product 971986",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/971986",
    summary: "官方 MAM 资料把 971986 记录为 Classic M205 Black、M 尖、活塞结构、银色装饰和抛光不锈钢尖。",
  }),
  web({
    key: "phase417-pelikan-m205-rose-quartz",
    registryKey: "pelikan-mam-m205-rose-quartz-823845-phase417",
    registryName: "Pelikan MAM product archive",
    title: "Classic M205 Rose Quartz M — product 823845",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/823845",
    summary: "官方特别版产品页确认 Rose Quartz 仍是 M205 活塞平台，采用银色装饰、抛光不锈钢 M 尖和半透明玫瑰色材料。",
    publishedAt: "2023",
  }),
  web({
    key: "phase417-pelikan-m205-moonstone",
    registryKey: "pelikan-mam-m205-moonstone-816748-phase417",
    registryName: "Pelikan MAM product archive",
    title: "Classic M205 Moonstone M — product 816748",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/816748",
    summary: "官方 Moonstone 产品页提供银灰色材料、银色装饰、抛光不锈钢尖与活塞结构的 SKU 级证据。",
    publishedAt: "2020",
  }),
  web({
    key: "phase417-pelikan-m205-catalog-2025",
    registryKey: "pelikan-fine-writing-catalog-2025-m205-phase417",
    registryName: "Pelikan Fine Writing current catalogue",
    title: "Fine Writing Instruments catalogue 2025",
    url: "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf",
    publishedAt: "2025",
    summary: "官方当前目录用于 Classic 200 的 M205 活塞／P205 墨囊分界、银色饰件、钢尖选项与当前尺寸口径。",
  }),
  web({
    key: "phase417-pelikan-m205-classic-folder",
    registryKey: "pelikan-classic-205-folder-1067385-phase417",
    registryName: "Pelikan Fine Writing official",
    title: "Classic 205 product information",
    url: "https://mam.pelikan.com/en/pelikan/media/1067385/download",
    publishedAt: "2023",
    summary: "官方 Classic 205 资料说明银色装饰、抛光不锈钢尖、墨窗和活塞机制，并以 Rose Quartz 作为具体样本。",
  }),
  web({
    key: "phase417-pelikan-m205-fine-writing",
    registryKey: "pelikan-fine-writing-m205-1030028-phase417",
    registryName: "Pelikan Fine Writing official",
    title: "Fine Writing M205 and P205 product information",
    url: "https://mam.pelikan.com/en/pelikan/media/1030028/download",
    summary: "官方资料同时出现 M205 活塞与 P205 墨囊，用于记录相邻型号的机械边界；M205 为抛光钢尖和银色高光饰件。",
  }),
  web({
    key: "phase417-pelikan-m205-collectibles",
    registryKey: "pelikan-collectibles-m205-phase417",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    author: "Pelikan Collectibles editorial archive",
    title: "Pelikan M205 Colours and Variants",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Classic-Series/M200-Basis/index.html",
    summary: "专业档案记录 M205 自 2005 年透明款、2009 年黑红白系列，到 2023 Rose Quartz 的生产年、颜色、饰件、钢尖与历史尺寸。",
  }),
  web({
    key: "phase417-pelikan-m205-perch",
    registryKey: "the-pelikans-perch-m205-phase417",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    author: "Joshua Danley",
    title: "Pelikan M205 model database",
    url: "https://thepelikansperch.com/database/fountain-pens/m2xx/m205/",
    summary: "专业型号档案补充 M205 的 crown cap、单帽环、铑色饰件、活塞旋钮环和与 M200 的结构识别边界。",
  }),
  web({
    key: "phase417-pelikan-m205-rose-review",
    registryKey: "the-pelikans-perch-m205-rose-quartz-review-phase417",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    author: "Joshua Danley",
    title: "M205 Rose Quartz (2023)",
    url: "https://thepelikansperch.com/2023/12/14/pelikan-m205-rose-quartz-review/",
    publishedAt: "2023",
    summary: "专业评述把 Rose Quartz 放入 M205 银色饰件和 Edelstein 特别版序列，补充包装与特别版语境，不外推写感为全系结论。",
  }),
  web({
    key: "phase417-pelikan-m205-specials",
    registryKey: "pure-pens-m205-special-editions-phase417",
    registryName: "Pure Pens Pelikan reference",
    sourceType: "retailer",
    tier: "retailer",
    author: "Pure Pens editorial team",
    title: "M200 and M205 Special Editions",
    url: "https://www.pelikanpens.co.uk/blogs/news/m200-and-m205-special-editions",
    summary: "可靠零售编辑列出 2009–2023 的 M205 特别色和年份，作为版本索引，不替代官方产品号与地区库存。",
  }),
  web({
    key: "phase417-pelikan-m205-care",
    registryKey: "pelikan-official-care-m205-phase417",
    registryName: "Pelikan official care",
    title: "Pelikan writing instruments care instructions",
    url: "https://www.pelikan.com/int/products/writing-instruments/care-instructions.html",
    summary: "官方护理页用于冷水吸排、避免热水／肥皂／酒精、长期存放前排空等建议，不把日常护理写成拆解教程。",
  }),
  web({
    key: "phase417-pelikan-m205-faq",
    registryKey: "pelikan-official-faq-m205-phase417",
    registryName: "Pelikan official FAQ",
    title: "FAQ: piston filling and cleaning",
    url: "https://www.pelikan.com/int/products/writing/145-international/services/541-faq.html",
    summary: "官方 FAQ 说明活塞笔从瓶中吸墨、排空和清水清洗的基本流程，支持 M205 的维护边界。",
  }),
  web({
    key: "phase417-pelikan-m205-nib-units",
    registryKey: "pelikan-collectibles-nib-units-m205-phase417",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    author: "Pelikan Collectibles editorial archive",
    title: "Pelikan nib units since 1929",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Nibs/Nib-units-since-1929/index.html",
    summary: "专业零件档案用于说明兼容尖单元可更换，但换尖不自动改变 M205 的笔杆、饰件或生产身份。",
  }),
  web({
    key: "phase417-pelikan-m205-goulet",
    registryKey: "goulet-pelikan-classic-200-comparison-phase417",
    registryName: "Goulet Pens",
    sourceType: "retailer",
    tier: "retailer",
    title: "Pelikan Classic and Souverän family comparison",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/pelikan-souveran-fountain-pen-comparison",
    summary: "可靠零售编辑用于 Classic 200 与 M400/M600 的尺寸、活塞和家族导航；不把相邻系列规格回填为 M205。",
  }),
  web({
    key: "phase417-pelikan-m205-2016-demo",
    registryKey: "the-pelikan-perch-m205-demo-reissue-phase417",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    author: "The Pelikan's Perch",
    title: "M205 Demonstrator special-edition reissue",
    url: "https://thepelikansperch.com/2018/04/23/pelikan-classic-m205-demonstrator-reissue/",
    publishedAt: "2018",
    summary: "专业新闻记录 2018 透明 M205 reissue 与 2005 透明路线的时间间隔，用于区分复刻版本，不外推地区库存。",
  }),
  web({
    key: "phase417-pelikan-m205-svg",
    registryKey: "fountain-pen-graph-editorial-m205-phase417",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    title: "Pelikan M205 identity boundary factual SVG",
    url: "/images/library/site-original/phase281/pelikan/m205.svg",
    summary: "本站原创 factual SVG，只表达银色／铑色饰件、抛光钢尖、透明墨窗和活塞边界；非产品照片、非 Logo、非比例图、非颜色校样。",
    itemType: "image",
  }),
];

const EXTRA_VARIANTS: CuratedVariant[] = [
  { key: "m205-clear-2005", name: "M205 Clear transparent（2005）", releaseYear: "2005", notes: "最早档案透明 demonstrator；银色饰件和钢尖，包装可能出现 M200 transparent Japan 字样，不能单靠盒标判断。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-black-series", name: "M205 Black series", releaseYear: "2009 起", notes: "黑色笔杆与笔帽、银色／铑色饰件；971986 M 尖是官方 SKU 样本，不代表所有黑色款尖幅。", sourceKey: "phase417-pelikan-m205-black-mam", variantKind: "color", parentVariantKey: "m205-colors", productCode: "971986" },
  { key: "m205-red-series", name: "M205 Red series", releaseYear: "2009–2013", notes: "红色系列档案；仍是钢尖活塞路线，生产范围按专业档案保留。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-white-series", name: "M205 White series", releaseYear: "2009 起", notes: "白色系列档案；颜色不改写银色饰件、钢尖和活塞边界。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-light-blue-2009", name: "M205 Light-blue transparent（2009）", releaseYear: "2009", notes: "浅蓝透明特别版；与 2016 透明复出分开记录，帽顶环细节可能不同。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-duo-yellow", name: "M205 DUO Highlighter Yellow", releaseYear: "2010", notes: "黄色透明高亮路线，档案注明 BB 尖与特殊高亮墨水；不能扩展为普通 M205 的通用配置。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-taupe", name: "M205 Taupe", releaseYear: "2012", notes: "Taupe 特别色；银色饰件和钢尖平台不变。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-shiny-green", name: "M205 DUO Highlighter Shiny Green", releaseYear: "2013", notes: "绿色透明高亮路线，档案注明 BB 尖与特殊高亮墨水。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-amethyst", name: "M205 Amethyst", releaseYear: "2015", notes: "紫色半透明特别版；属于颜色 variant，不新增基础实体。", sourceKey: "phase417-pelikan-m205-specials", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-neptunes-blue", name: "M205 Neptunes Blue", releaseYear: "2015", notes: "可靠档案标记为少量渠道特别色，具体数量和市场范围不扩写为全球结论。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-aquamarine", name: "M205 Aquamarine", releaseYear: "2016", notes: "蓝绿色半透明特别版；仍是银饰钢尖活塞。", sourceKey: "phase417-pelikan-m205-specials", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-light-blue-2016", name: "M205 Light-blue transparent（2016）", releaseYear: "2016", notes: "透明复出版本；档案指出顶环与 2009 版本存在视觉差异，不能按颜色合并。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-demonstrator-2018", name: "M205 Demonstrator（2018）", releaseYear: "2018", notes: "透明特别版复刻；专业报道用于确认与 2005 透明路线的时间间隔。", sourceKey: "phase417-pelikan-m205-2016-demo", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-olivine", name: "M205 Olivine", releaseYear: "2018", notes: "深绿半透明特别版；颜色与包装需按 SKU 核对。", sourceKey: "phase417-pelikan-m205-specials", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-star-ruby", name: "M205 Star Ruby", releaseYear: "2019", notes: "红色透明特别版；钢尖、银色饰件和活塞平台保持不变。", sourceKey: "phase417-pelikan-m205-specials", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-moonstone", name: "M205 Moonstone", releaseYear: "2020", notes: "银灰半透明特别版；官方 SKU 816748 是 M 尖样本。", sourceKey: "phase417-pelikan-m205-moonstone", variantKind: "color", parentVariantKey: "m205-colors", productCode: "816748" },
  { key: "m205-petrol", name: "M205 Petrol / Petrol Marbled", releaseYear: "2021", notes: "Petrol 色特别版；零售清单与档案名称略有差异，保留为同一版本导航，不臆造统一产品号。", sourceKey: "phase417-pelikan-m205-specials", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-apatite", name: "M205 Apatite", releaseYear: "2022", notes: "绿松石半透明特别版；可靠清单标为 POTY 语境，不能当作尖材升级。", sourceKey: "phase417-pelikan-m205-specials", variantKind: "color", parentVariantKey: "m205-colors" },
  { key: "m205-rose-quartz", name: "M205 Rose Quartz", releaseYear: "2023", notes: "玫瑰色半透明特别版；823845 是官方 M 尖产品样本，可有单笔和配套墨水礼盒。", sourceKey: "phase417-pelikan-m205-rose-quartz", variantKind: "color", parentVariantKey: "m205-colors", productCode: "823845" },
  { key: "m205-ef", name: "M205 stainless steel EF", releaseYear: "按 SKU", notes: "EF 是尖幅，不是独立型号；实写线宽还受纸张、墨水和调校影响。", sourceKey: "phase417-pelikan-m205-classic-folder", variantKind: "nib", parentVariantKey: "m205-silver" },
  { key: "m205-f", name: "M205 stainless steel F", releaseYear: "按 SKU", notes: "F 是常见尖幅选项；二手笔须确认是否原装或换尖。", sourceKey: "phase417-pelikan-m205-classic-folder", variantKind: "nib", parentVariantKey: "m205-silver" },
  { key: "m205-m", name: "M205 stainless steel M", releaseYear: "按 SKU", notes: "MAM 971986、823845、816748 是 M 尖样本；不要外推所有年份颜色。", sourceKey: "phase417-pelikan-m205-black-mam", variantKind: "nib", parentVariantKey: "m205-silver", productCode: "971986 / 823845 / 816748" },
  { key: "m205-b", name: "M205 stainless steel B", releaseYear: "按 SKU", notes: "B 是尖幅选项；DUO Highlighter 的 BB 属于特定高亮版本。", sourceKey: "phase417-pelikan-m205-classic-folder", variantKind: "nib", parentVariantKey: "m205-silver" },
  { key: "m200-boundary", name: "M200 gold trim boundary", releaseYear: "Classic 200 family", notes: "金色饰件和镀金钢尖路线；不能把 M200 的颜色、尖和容量覆盖到 M205。", sourceKey: "phase417-pelikan-m205-fine-writing", variantKind: "edition_group" },
  { key: "m215-boundary", name: "M215 brass barrel boundary", releaseYear: "2005 起档案", notes: "黄铜内层与约 20 g 参考重量使 M215 成为不同 sibling；银色夹子不是足够证据。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "material" },
  { key: "m250-boundary", name: "M250 gold nib boundary", releaseYear: "1997 后历史路线", notes: "相近比例的 14 ct 金尖路线；换上金尖的 M205 不自动变成 M250。", sourceKey: "phase417-pelikan-m205-collectibles", variantKind: "nib" },
  { key: "p205-boundary", name: "P205 cartridge boundary", releaseYear: "Classic 200 cartridge route", notes: "墨囊／转换器路线；判断重点是墨囊接口而不是银色饰件。", sourceKey: "phase417-pelikan-m205-fine-writing", variantKind: "edition_group" },
];

const EXTRA_SCOPES: CuratedScope[] = [
  { key: "phase417-m205-current", scopeKey: "pelikan-m205-current-classic-200", market: "global", productionState: "current", nibScope: "polished stainless steel; EF/F/M/B by SKU", materialScope: "resin body, ink window and silver/rhodium trim", editionScope: "M205 platform; colors and gift sets remain variants" },
  { key: "phase417-m205-2005", scopeKey: "pelikan-m205-clear-2005", variantKey: "m205-clear-2005", validFrom: "2005", validTo: "2008", productionState: "historical", nibScope: "steel", materialScope: "clear transparent resin", editionScope: "early demonstrator/export record" },
  { key: "phase417-m205-2009", scopeKey: "pelikan-m205-series-2009", variantKey: "m205-black-series", validFrom: "2009", productionState: "historical", nibScope: "steel", materialScope: "black, red or white resin", editionScope: "series colors with silver trim" },
  { key: "phase417-m205-highlighter", scopeKey: "pelikan-m205-duo-highlighter", variantKey: "m205-duo-yellow", validFrom: "2010", productionState: "historical", nibScope: "BB and special highlighter ink for named SKU", materialScope: "transparent colored resin", editionScope: "DUO Highlighter special route" },
  { key: "phase417-m205-2016", scopeKey: "pelikan-m205-light-blue-2016", variantKey: "m205-light-blue-2016", validFrom: "2016", productionState: "historical", materialScope: "light-blue transparent resin", editionScope: "transparent reissue; top ring detail differs from 2009 record" },
  { key: "phase417-m205-2018", scopeKey: "pelikan-m205-demonstrator-2018", variantKey: "m205-demonstrator-2018", validFrom: "2018", productionState: "historical", materialScope: "clear transparent resin", editionScope: "demonstrator special edition" },
  { key: "phase417-m205-edelstein", scopeKey: "pelikan-m205-edelstein-colors", variantKey: "m205-rose-quartz", validFrom: "2015", productionState: "historical", materialScope: "translucent color-specific resin", editionScope: "Amethyst, Aquamarine, Olivine, Star Ruby, Moonstone, Apatite, Rose Quartz and related editions" },
  { key: "phase417-m205-nibs", scopeKey: "pelikan-m205-nib-options", variantKey: "m205-m", productionState: "current", nibScope: "EF/F/M/B stainless steel; BB only where named by special SKU", editionScope: "nib width variants, not separate models" },
  { key: "phase417-m205-spec-history", scopeKey: "pelikan-m205-historical-measurements", validFrom: "2005", productionState: "historical", materialScope: "archive measurement table", editionScope: "125 mm, 12 mm, 14 g and 1.20 ml reference values" },
  { key: "phase417-m205-spec-current", scopeKey: "pelikan-m205-current-measurements", validFrom: "2025", productionState: "current", materialScope: "current catalogue measurement convention", editionScope: "approximately 14.7 cm, 12.3 mm, 14 g and 1.3–1.4 ml" },
  { key: "phase417-m205-m200", scopeKey: "pelikan-m205-versus-m200", variantKey: "m200-boundary", productionState: "current", editionScope: "gold trim and gold-plated steel neighboring route" },
  { key: "phase417-m205-m215", scopeKey: "pelikan-m205-versus-m215", variantKey: "m215-boundary", productionState: "historical", materialScope: "brass inner barrel and resin shell", editionScope: "heavier Classic 200 sibling" },
  { key: "phase417-m205-m250", scopeKey: "pelikan-m205-versus-m250", variantKey: "m250-boundary", productionState: "historical", nibScope: "14 ct gold nib neighboring route", editionScope: "gold-nib sibling; do not copy M205 steel values" },
  { key: "phase417-m205-p205", scopeKey: "pelikan-m205-versus-p205", variantKey: "p205-boundary", productionState: "current", editionScope: "cartridge/converter sibling; not piston" },
  { key: "phase417-m205-care", scopeKey: "pelikan-m205-care-2026", validFrom: RETRIEVED, productionState: "current", editionScope: "cold-water flushing and repair boundary" },
  { key: "phase417-m205-media", scopeKey: "pelikan-m205-factual-svg-2026", validFrom: RETRIEVED, productionState: "current", editionScope: "site-original factual SVG; non-product photo and not to scale" },
];

const EXTRA_CLAIMS: CuratedClaim[] = [
  {
    key: "phase417-identity",
    predicate: "model_identity",
    objectText: "Pelikan M205 是 Classic 200 的银色／铑色饰件活塞钢笔，配抛光不锈钢尖和透明墨窗；颜色特别版不改变基础型号。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase417-pelikan-m205-black-mam",
    locator: "971986 M205 Black M product identity, piston and silver trim",
    evidence: [{ key: "phase417-identity-mam", sourceKey: "phase417-pelikan-m205-black-mam", scopeKey: "phase417-m205-current", locator: "official M205 product fields" }, { key: "phase417-identity-folder", sourceKey: "phase417-pelikan-m205-classic-folder", scopeKey: "phase417-m205-current", locator: "Classic 205 product identity" }],
  },
  {
    key: "phase417-history",
    predicate: "production_history",
    objectText: "M205 名称的透明 demonstrator 记录始于 2005 年，2009 年出现黑、红、白系列款；2015–2023 又有多项透明与 Edelstein 相关特别版。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: "phase417-pelikan-m205-collectibles",
    locator: "M205 2005, 2009 series and special-edition chronology",
    evidence: [{ key: "phase417-history-archive", sourceKey: "phase417-pelikan-m205-collectibles", scopeKey: "phase417-m205-2005", locator: "2005 clear transparent record" }, { key: "phase417-history-specials", sourceKey: "phase417-pelikan-m205-specials", scopeKey: "phase417-m205-edelstein", locator: "2015–2023 special-edition list" }],
  },
  {
    key: "phase417-fill",
    predicate: "filling_system",
    objectText: "M205 由尾部旋钮驱动差动活塞，从墨水瓶吸入钢笔墨；P205 的墨囊接口不能写入 M205。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase417-pelikan-m205-fine-writing",
    locator: "M205 piston versus P205 cartridge product information",
    evidence: [{ key: "phase417-fill-official", sourceKey: "phase417-pelikan-m205-fine-writing", scopeKey: "phase417-m205-current", locator: "M205 piston and P205 cartridge distinction" }],
  },
  {
    key: "phase417-measurements",
    predicate: "measurement_scope",
    objectText: "历史档案约列闭帽 125 mm、直径 12 mm、14 g、1.20 ml；2025 当前目录采用约 14.7 cm、12.3 mm、14 g、1.3–1.4 ml 的另一测量口径，页面按来源分层。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase417-pelikan-m205-collectibles",
    locator: "M205 historical measurement table",
    evidence: [{ key: "phase417-measurements-history", sourceKey: "phase417-pelikan-m205-collectibles", scopeKey: "phase417-m205-spec-history", locator: "125 mm, 12 mm, 14 g and 1.20 ml" }, { key: "phase417-measurements-current", sourceKey: "phase417-pelikan-m205-catalog-2025", scopeKey: "phase417-m205-spec-current", locator: "current Classic 200 catalogue measurement row" }],
  },
  {
    key: "phase417-trim",
    predicate: "trim_boundary",
    objectText: "M205 的银色／铑色饰件是与金色饰件 M200 的主要视觉边界；M215 和 P205 也可能有银色饰件，因此仍需结合供墨和笔杆结构。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: "phase417-pelikan-m205-perch",
    locator: "M205 crown cap, single cap band and rhodium trim comparison",
    evidence: [{ key: "phase417-trim-perch", sourceKey: "phase417-pelikan-m205-perch", scopeKey: "phase417-m205-current", locator: "M205 versus M200 trim cues" }, { key: "phase417-trim-p205", sourceKey: "phase417-pelikan-m205-fine-writing", scopeKey: "phase417-m205-p205", locator: "silver trim does not decide piston/cartridge identity" }],
  },
  {
    key: "phase417-nib",
    predicate: "nib_scope",
    objectText: "M205 以抛光不锈钢尖为主，常见 EF、F、M、B；DUO Highlighter 的 BB 属于特定 SKU。可换尖不等于整支笔换型号。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: "phase417-pelikan-m205-classic-folder",
    locator: "polished stainless nib and width options",
    evidence: [{ key: "phase417-nib-folder", sourceKey: "phase417-pelikan-m205-classic-folder", scopeKey: "phase417-m205-nibs", locator: "official stainless nib fields" }, { key: "phase417-nib-units", sourceKey: "phase417-pelikan-m205-nib-units", scopeKey: "phase417-m205-current", locator: "replaceable nib units do not rename pen" }],
  },
  {
    key: "phase417-specials",
    predicate: "special_edition_scope",
    objectText: "Apatite、Rose Quartz、Moonstone、Olivine、Star Ruby 等名称是颜色或发行版本导航；礼盒、配套墨水和市场库存不改变 M205 的钢尖活塞身份。",
    factClass: "editorial",
    confidence: 0.97,
    sourceKey: "phase417-pelikan-m205-specials",
    locator: "M205 special-edition list 2015–2023",
    evidence: [{ key: "phase417-specials-pure", sourceKey: "phase417-pelikan-m205-specials", scopeKey: "phase417-m205-edelstein", locator: "special-edition chronology" }, { key: "phase417-specials-rose", sourceKey: "phase417-pelikan-m205-rose-review", scopeKey: "phase417-m205-edelstein", locator: "Rose Quartz and earlier Edelstein sequence" }],
  },
  {
    key: "phase417-care",
    predicate: "care_boundary",
    objectText: "官方日常维护以排空后冷水吸排为主，避免热水、肥皂和酒精；活塞卡滞、漏墨、裂纹或尖座松动时停止强拆并送专业维修。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: "phase417-pelikan-m205-care",
    locator: "official care instructions: cold water and no hot water/soap/alcohol",
    evidence: [{ key: "phase417-care-official", sourceKey: "phase417-pelikan-m205-care", scopeKey: "phase417-m205-care", locator: "official cleaning boundary" }, { key: "phase417-care-faq", sourceKey: "phase417-pelikan-m205-faq", scopeKey: "phase417-m205-care", locator: "piston filling and rinsing FAQ" }],
  },
  {
    key: "phase417-buying",
    predicate: "second_hand_identification",
    objectText: "二手 M205 应同时检查活塞尾钮、透明墨窗、银色饰件、帽顶和帽环、尖刻字、产品号、维修史和是否换尖；照片不足时保留待核。",
    factClass: "editorial",
    confidence: 0.97,
    sourceKey: "phase417-pelikan-m205-perch",
    locator: "M205 structure and trim identification cues",
    evidence: [{ key: "phase417-buying-perch", sourceKey: "phase417-pelikan-m205-perch", scopeKey: "phase417-m205-current", locator: "crown cap, cap band and piston knob ring" }, { key: "phase417-buying-mam", sourceKey: "phase417-pelikan-m205-black-mam", scopeKey: "phase417-m205-current", locator: "SKU and nib verification" }],
  },
  {
    key: "phase417-variants",
    predicate: "variant_recording",
    objectText: "颜色、透明度、年份、尖幅和礼盒应作为 M205 的 variant 与 SKU 证据记录，不为每个颜色新建公开基础实体。",
    factClass: "editorial",
    confidence: 0.97,
    sourceKey: "phase417-pelikan-m205-collectibles",
    locator: "M205 color and variant table",
    evidence: [{ key: "phase417-variants-archive", sourceKey: "phase417-pelikan-m205-collectibles", scopeKey: "phase417-m205-edelstein", locator: "color, production and trim records" }, { key: "phase417-variants-retailer", sourceKey: "phase417-pelikan-m205-specials", scopeKey: "phase417-m205-edelstein", locator: "retailer special-edition index" }],
  },
  {
    key: "phase417-media",
    predicate: "editorial_media_scope",
    objectText: "本站原创 SVG 只解释 M205 银色饰件、抛光钢尖、透明墨窗、活塞与 M200／M250／P205 边界，明确非产品照片、非 Logo、非真实比例和非颜色校样。",
    factClass: "editorial",
    confidence: 0.99,
    sourceKey: "phase417-pelikan-m205-svg",
    locator: "SVG title, description and footer disclaimer",
    evidence: [{ key: "phase417-media-svg", sourceKey: "phase417-pelikan-m205-svg", scopeKey: "phase417-m205-media", locator: "site-original factual SVG" }],
  },
];

const EXTRA_SPEC_EVIDENCE: CuratedSpecEvidence[] = [
  { key: "phase417-brand", fieldKey: "brand_entity_id", sourceKey: "phase417-pelikan-m205-black-mam", scopeKey: "phase417-m205-current", locator: "official Pelikan M205 product identity" },
  { key: "phase417-series", fieldKey: "series_name", sourceKey: "phase417-pelikan-m205-classic-folder", scopeKey: "phase417-m205-current", locator: "Classic 205 family heading" },
  { key: "phase417-release", fieldKey: "release_year", sourceKey: "phase417-pelikan-m205-collectibles", scopeKey: "phase417-m205-2005", locator: "2005 first M205 clear transparent record" },
  { key: "phase417-origin", fieldKey: "origin_country", sourceKey: "phase417-pelikan-m205-black-mam", scopeKey: "phase417-m205-current", locator: "Pelikan product context; no unsupported factory inference" },
  { key: "phase417-nib", fieldKey: "nib", sourceKey: "phase417-pelikan-m205-classic-folder", scopeKey: "phase417-m205-nibs", locator: "polished stainless steel and SKU widths" },
  { key: "phase417-fill", fieldKey: "fill_system", sourceKey: "phase417-pelikan-m205-fine-writing", scopeKey: "phase417-m205-current", locator: "M205 piston versus P205 cartridge" },
  { key: "phase417-material", fieldKey: "material", sourceKey: "phase417-pelikan-m205-rose-quartz", scopeKey: "phase417-m205-edelstein", locator: "translucent resin and silver decorative elements" },
  { key: "phase417-dimensions", fieldKey: "dimensions", sourceKey: "phase417-pelikan-m205-catalog-2025", scopeKey: "phase417-m205-spec-current", locator: "current catalogue measurement convention" },
  { key: "phase417-weight", fieldKey: "weight", sourceKey: "phase417-pelikan-m205-collectibles", scopeKey: "phase417-m205-spec-history", locator: "14.0 g historical table" },
  { key: "phase417-status", fieldKey: "status", sourceKey: "phase417-pelikan-m205-collectibles", scopeKey: "phase417-m205-current", locator: "current and historical M205 variant records" },
];

const BASE_M205 = phase281PelikanM205M215Packs.find(
  (pack) => pack.entityId === PHASE417_M205_ID && pack.expectedType === "pen",
);
if (!BASE_M205) throw new Error("Phase 417 requires the existing Phase 281 Pelikan M205 pack.");

const refreshedM205: CuratedEntityPack = {
  ...structuredClone(BASE_M205),
  key: "phase417-pelikan-m205-refresh-v1",
  canonicalName: PHASE417_M205_NAME,
  markdownFile: ".planning/content-research/pelikan-m205-phase417.md",
  storyTitle: "Pelikan M205：2005 透明起点、银色饰件与 Classic 200 版本边界",
  primarySourceKey: "phase417-pelikan-m205-black-mam",
  sources: [...BASE_M205.sources, ...EXTRA_SOURCES],
  aliases: [
    ...BASE_M205.aliases,
    { alias: "Pelikan Classic M205", language: "en", sourceKey: "phase417-pelikan-m205-classic-folder" },
    { alias: "M 205", language: "en", sourceKey: "phase417-pelikan-m205-black-mam" },
    { alias: "百利金 M205 银色饰件活塞", language: "zh", sourceKey: "phase417-pelikan-m205-fine-writing" },
  ],
  variants: [
    ...(BASE_M205.variants ?? []).map((variant) =>
      variant.key === "m205-colors" ? { ...variant, variantKind: "edition_group" as const } : variant,
    ),
    ...EXTRA_VARIANTS,
  ],
  scopes: [...BASE_M205.scopes, ...EXTRA_SCOPES],
  claims: [...BASE_M205.claims, ...EXTRA_CLAIMS],
  spec: BASE_M205.spec
    ? {
        ...BASE_M205.spec,
        values: {
          ...BASE_M205.spec.values,
          series_name: "Pelikan Classic 200",
          release_year: "2005 透明 demonstrator；2009 起黑／红／白系列；特别版按具体档案",
          origin_country: "德国品牌；具体制造地按官方产品页、包装或实物核对",
          nib: "抛光不锈钢尖；常见 EF/F/M/B，特殊 DUO SKU 另核",
          fill_system: "内置差动活塞；瓶装钢笔墨；不可写成 P205 墨囊接口",
          material: "树脂笔杆、透明或半透明墨窗、银色／铑色饰件；颜色按版本核对",
          dimensions: "历史档案约闭帽 125 mm、直径 12 mm；2025 目录约 14.7 cm、12.3 mm",
          weight: "历史档案约 14.0 g；当前目录约 14 g，测量口径须注明",
          status: "Classic 200 银色／铑色饰件活塞型号；颜色、地区 SKU 与库存随时期变化",
        },
        evidence: [...BASE_M205.spec.evidence, ...EXTRA_SPEC_EVIDENCE],
      }
    : undefined,
  media: BASE_M205.media,
  timeline: [
    ...(BASE_M205.timeline ?? []),
    { key: "phase417-m205-2005", title: "M205 透明 demonstrator 进入 Classic 200 记录", eventType: "model_released", startDate: "2005", circa: false, description: "专业档案将 M205 名称用于透明、银色饰件和钢尖路线。", sourceKey: "phase417-pelikan-m205-collectibles" },
    { key: "phase417-m205-2009", title: "黑、红、白系列款出现", eventType: "model_released", startDate: "2009", circa: false, description: "系列颜色在银色饰件和钢尖活塞平台内扩展。", sourceKey: "phase417-pelikan-m205-collectibles" },
    { key: "phase417-m205-2023", title: "Rose Quartz 特别版记录", eventType: "model_released", startDate: "2023", circa: false, description: "Rose Quartz 作为 M205 银色饰件、抛光钢尖和活塞特别版出现。", sourceKey: "phase417-pelikan-m205-rose-quartz" },
  ],
};

export const phase417PelikanM205RefreshPacks: CuratedEntityPack[] = [refreshedM205];
