import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase35PelikanSouveranVariantPacks } from "./phase35-pelikan-souveran-variants";

/**
 * These three IDs were checked against the 2026-07-19 checkpoint copy and the
 * repository inventory before being reserved. They intentionally do not reuse
 * the existing M200, M800 or P457 identities.
 */
export const PHASE54_PELIKAN_ID = "VXUULuCOLOB1";
export const PHASE54_TOLEDO_ID = "s54PELTOLEDO";
export const PHASE54_PURA_ID = "s54PELPURA";
export const PHASE54_P200_P205_ID = "s54PELP200";

const RETRIEVED = "2026-07-19";

function live(input: {
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
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.url,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const SOURCES = {
  toledoM700: live({
    key: "phase54-pelikan-collectibles-m700-m710",
    title: "Pelikan Collectibles: M700 & M710 Toledo",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M700-Basis/index.html",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "型号档案把 M700/M710 Toledo 分为金色金属套雕与银色金属套雕，记录 Old Style、生产年份、18 ct 尖、尺寸和 1.30/1.40 ml 参考容量。",
    locator: "M700 Old Style 1986–1997, M700 since 1997, M710 Old Style 1992–1999 and M710 2009–2011 tables",
  }),
  toledoM900: live({
    key: "phase54-pelikan-collectibles-m900-m910",
    title: "Pelikan Collectibles: M900 & M910 Toledo",
    url: "https://www.pen-collectibles.de/en/Pelikan/Models/Souveraen-Series/M900-M910/index.html",
    registryKey: "pen-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "M900/M910 档案区分 1991–2002 Old Style 与 2003 起 M900，记录北美 500 支首发、大尺寸和金/银套雕边界。",
    locator: "M900/M910 Old Style tables, 500-piece North American launch and 2003-present hand-engraved Toledo section",
  }),
  toledoM700Mam: live({
    key: "phase54-pelikan-mam-m700",
    title: "Pelikan MAM product record 927806: Toledo M700",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/927806",
    registryKey: "pelikan-mam",
    registryName: "Pelikan Media Asset Management",
    sourceType: "official",
    tier: "primary",
    summary: "Pelikan 官方 MAM 的 M700 Toledo 商品记录，用于官方产品身份、德国制造与套雕金属笔杆语境；具体页面字段按官方记录读取。",
    locator: "product record 927806, Toledo M700 category and product identity",
  }),
  toledoM900Mam: live({
    key: "phase54-pelikan-mam-m900",
    title: "Pelikan MAM product record 924712: Toledo M900",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/924712",
    registryKey: "pelikan-mam",
    registryName: "Pelikan Media Asset Management",
    sourceType: "official",
    tier: "primary",
    summary: "官方 MAM 记录 M900 Toledo 的 sterling silver 单体笔杆、gold-plated 套雕、黑色树脂部件、18K EF 尖和 Made in Germany。",
    locator: "product information: Toledo M900, sterling silver barrel, gold overlay, black resin, 18K EF nib and Made in Germany",
  }),
  puraArchive: live({
    key: "phase54-pelikan-collectibles-pura",
    title: "Pelikan Collectibles: Pura (P40)",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Cartridge-filler/Pura/index.html",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "Pura 档案记录 2008 初始版本、2011 Black-Silver、2020 Mocha 复产颜色，铝制笔身、钢尖、墨囊与转换器兼容及 140 mm/33 g 参考值。",
    locator: "Pura overview and P40 Blue-Silver, Silver, Black-Silver and Mocha variant tables",
  }),
  puraMam: live({
    key: "phase54-pelikan-mam-pura",
    title: "Pelikan MAM product record 822657: Pura",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/822657",
    registryKey: "pelikan-mam",
    registryName: "Pelikan Media Asset Management",
    sourceType: "official",
    tier: "primary",
    summary: "Pelikan 官方 MAM Pura 商品记录，用于铝制表面、P40 cartridge pen 身份及官方产品媒体语境。",
    locator: "product record 822657, Pura/P40 product identity and material description",
  }),
  p200Archive: live({
    key: "phase54-pelikan-collectibles-p200-p205",
    title: "Pelikan Collectibles: P200 & P205",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Classic-Series/P200-Basis/index.html",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "档案明确 P200 金色饰件、P205 银色饰件自 2014 年起是 M200 外观的墨囊笔，笔尖单元与活塞笔不兼容，尺寸 126 mm/12 g/约 1.4 ml giant cartridge。",
    locator: "P200/P205 introduction, cartridge-piercing feed boundary and 2014 specification tables",
  }),
  p200Mam: live({
    key: "phase54-pelikan-mam-p200",
    title: "Pelikan MAM product record 820646: Classic P200",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/820646",
    registryKey: "pelikan-mam",
    registryName: "Pelikan Media Asset Management",
    sourceType: "official",
    tier: "primary",
    summary: "Pelikan 官方 MAM P200 商品记录，用于金色饰件 Classic 200 cartridge fountain pen 身份和官方产品分类。",
    locator: "product record 820646, Classic P200 product identity and cartridge-fountain-pen category",
  }),
  p205Mam: live({
    key: "phase54-pelikan-mam-p205",
    title: "Pelikan MAM product record 930727: Classic P205",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/930727",
    registryKey: "pelikan-mam",
    registryName: "Pelikan Media Asset Management",
    sourceType: "official",
    tier: "primary",
    summary: "官方 MAM P205 记录黑色高光树脂、银色镀铬饰件、抛光不锈钢尖、EF/F/M/B 和 cartridge filling system；货号 930727。",
    locator: "product information: P205, high-gloss resin, silver chrome trim, polished stainless nib and cartridge filling system",
  }),
  toledoSvg: diagram(
    "phase54-pelikan-toledo-svg",
    "Pelikan Toledo M700/M900 尺寸与金银套雕事实卡",
    "/images/library/site-original/pelikan-toledo-pura/toledo.svg",
    "本站原创事实图，区分 M700/M710 小尺寸、M900/M910 大尺寸与金/银套雕；示意图，非产品照片。",
  ),
  puraSvg: diagram(
    "phase54-pelikan-pura-svg",
    "Pelikan Pura P40 材料与供墨事实卡",
    "/images/library/site-original/pelikan-toledo-pura/pura.svg",
    "本站原创事实图，标出铝制笔身、钢尖、墨囊/转换器和 2008–2020 版本边界；示意图，非产品照片。",
  ),
  p200Svg: diagram(
    "phase54-pelikan-p200-svg",
    "Pelikan P200/P205 cartridge 边界事实卡",
    "/images/library/site-original/pelikan-toledo-pura/p200-p205.svg",
    "本站原创事实图，区分金/银饰件和 cartridge/converter 与 M200 piston 的机制边界；示意图，非产品照片。",
  ),
};

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePack(input: {
  key: string;
  id: string;
  slug: string;
  name: string;
  title: string;
  summary: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extras: CuratedSource[];
  svg: CuratedSource;
  aliases: string[];
  release: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  status: string;
  boundary: string;
  variants: Array<{ key: string; name: string; releaseYear?: string; notes: string; sourceKey: string }>;
}): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  const allSources = [input.primary, input.secondary, ...input.extras, input.svg];
  const sources = allSources.filter((source, index) => allSources.findIndex((candidate) => candidate.key === source.key) === index);
  return {
    key: `phase54-${input.key}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : input.secondary.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, productionState: input.status.includes("历史") ? "historical" : "current", editionScope: "Pelikan 具体 family；生产年份、饰件、材料和供墨结构按 variant 记录" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "official/archive model identity", evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: "model overview or official product record" }] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.99, sourceKey: input.secondary.key, locator: "family and mechanism boundary", evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "archive family tables and explicit model boundary" }, { key: `${input.key}-official-boundary`, sourceKey: input.primary.key, scopeKey, locator: "official product identity" }] },
      { key: `${input.key}-care`, predicate: "maintenance_boundary", objectText: "先用室温清水排空并自然干燥；Toledo 不拆手工套雕和活塞总成，Pura/P200/P205 也不使用酒精、热水或金属抛光剂接触漆面、铝材、树脂和密封件。", factClass: "core", confidence: 0.95, sourceKey: input.primary.key, locator: "Pelikan product construction and conservative care boundary", evidence: [{ key: `${input.key}-care-evidence`, sourceKey: input.primary.key, scopeKey, locator: "official construction and filling system context" }] },
    ],
    variants: input.variants.map((variant) => ({ ...variant, variantKind: "edition_group" as const })),
    spec: {
      brandEntityId: PHASE54_PELIKAN_ID,
      values: { series_name: input.name, release_year: input.release, origin_country: "Pelikan 德国制造语境；具体批次按官方记录或实物包装核对", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, status: input.status },
      evidence: [
        evidence(`${input.key}-brand`, "brand_entity_id", input.primary.key, scopeKey, "Pelikan maker identity"),
        evidence(`${input.key}-series`, "series_name", input.primary.key, scopeKey, "official/archive model title"),
        evidence(`${input.key}-release`, "release_year", input.secondary.key, scopeKey, "production-period table"),
        evidence(`${input.key}-origin`, "origin_country", input.primary.key, scopeKey, "official product context; no unsupported factory inference"),
        evidence(`${input.key}-nib`, "nib", input.primary.key, scopeKey, "nib field or product description"),
        evidence(`${input.key}-fill`, "fill_system", input.primary.key, scopeKey, "filling system field"),
        evidence(`${input.key}-material`, "material", input.primary.key, scopeKey, "material/construction field"),
        evidence(`${input.key}-dimensions`, "dimensions", input.secondary.key, scopeKey, "archive dimension table"),
        evidence(`${input.key}-status`, "status", input.secondary.key, scopeKey, "current/historical archive boundary"),
      ],
    },
    media: [{ key: `${input.key}-factual-primary`, title: `${input.name} 事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制 Pelikan 官方摄影，不表现真实比例、颜色、Logo 或刻字。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-release`, title: `${input.name} 进入 Pelikan 产品路线`, eventType: "model_released", startDate: input.release.match(/\d{4}/)?.[0] ?? "2000", circa: true, description: input.summary, sourceKey: input.primary.key }],
  };
}

const pelikanBrand = structuredClone(
  phase35PelikanSouveranVariantPacks.find(
    (pack) => pack.entityId === PHASE54_PELIKAN_ID && pack.expectedType === "brand",
  ),
);
if (!pelikanBrand) throw new Error("Phase 54 Pelikan brand pack missing.");
pelikanBrand.key = "phase54-pelikan-brand-v1";

export const phase54PelikanToledoPuraPacks: CuratedEntityPack[] = [
  pelikanBrand,
  makePack({
    key: "toledo", id: PHASE54_TOLEDO_ID, slug: "pelikan-toledo", name: "百利金 Pelikan Toledo", title: "Pelikan Toledo：M700/M710 与 M900/M910 的金银套雕谱系", summary: "Pelikan Toledo 是以西班牙 damascening 工艺为核心的 Souverän 套雕 family；M700/M710 是较小尺寸，M900/M910 是较大尺寸，金色与银色 overlay 不是同一件笔。", markdownFile: ".planning/content-research/pelikan-toledo-m700-m900.md", primary: SOURCES.toledoM900Mam, secondary: SOURCES.toledoM700, extras: [SOURCES.toledoM900, SOURCES.toledoM700Mam], svg: SOURCES.toledoSvg, aliases: ["Pelikan Toledo", "Pelikan M700 Toledo", "Pelikan M710 Toledo", "Pelikan M900 Toledo", "Pelikan M910 Toledo", "百利金 Toledo 套雕"], release: "1931 工艺传统；M700 1986/1997；M900 1991/2003", nib: "18 ct 金尖；早期 M900 Old Style 首批可见 20 ct，后改 18 ct；实际尖号按年份/商品核对", fill: "Pelikan differential piston filling; reference capacity about 1.30 ml (M700/M900 modern tables) or 1.40 ml (Old Style)", material: "一体 sterling silver barrel with hand-engraved damascening and gold or palladium surface; black resin cap/section/end", dimensions: "M700/M710 about 125 mm, 12 mm, 23.4/21.6 g; M900/M910 about 141 mm, 13 mm, 38.6–39.0 g; capacities are reference tables", status: "M700/M900 family current/archival records coexist; M710/M910 and Old Style years are historical variants", boundary: "Toledo 是独立套雕 family，不是把任何金色或银色 M700/M900 都当作普通 M800。M700/M710 的小尺寸不能用 M900/M910 的 141 mm 和 39 g 回填；gold overlay、silver/palladium surface、Old Style、2003 后 one-piece hand-engraved construction 与尖材年份必须分开。", variants: [
      { key: "m700-old-gold", name: "M700 Toledo Old Style 金色套雕", releaseYear: "1986–1997", notes: "小尺寸 125 mm；18 ct 金尖；档案列金色笔杆、黑帽、金色镀层与两道帽环线索。", sourceKey: SOURCES.toledoM700.key },
      { key: "m700-gold", name: "M700 Toledo 金色套雕", releaseYear: "1997–", notes: "小尺寸现代表格约 23.4 g、约 1.30 ml；品牌徽标和生产标记按年份，不把图标变化当换型号。", sourceKey: SOURCES.toledoM700.key },
      { key: "m710-old-silver", name: "M710 Toledo Old Style 银色套雕", releaseYear: "1992–1999", notes: "与 M700 同级尺寸，但笔杆为银色/银饰路线；18 ct 金尖，不是 M700 金色套雕的颜色别名。", sourceKey: SOURCES.toledoM700.key },
      { key: "m710-special", name: "M710 Toledo Black/Yellow/Red 特别色", releaseYear: "2009–2011", notes: "档案列银色套雕笔杆、黑/黄/红帽色特别版；货号、帽色和尖刻字需按实物核对。", sourceKey: SOURCES.toledoM700.key },
      { key: "m900-old", name: "M900 Toledo Old Style 金色套雕", releaseYear: "1991–2002", notes: "大尺寸；北美首发 500 支并见 W-GERMANY 帽刻；首批可见 20 ct，后期 18 ct。", sourceKey: SOURCES.toledoM900.key },
      { key: "m910-old", name: "M910 Toledo Old Style 银色套雕", releaseYear: "1992–1999", notes: "大尺寸银色/Ag 路线，18 ct 金尖；不要用 M900 金色 overlay 的重量和饰件来描述。", sourceKey: SOURCES.toledoM900.key },
      { key: "m900-modern", name: "M900 Toledo 现代手工套雕", releaseYear: "2003–", notes: "一体 sterling silver 套雕，金层覆盖手工图案；档案称每月产量受手工限制，MAM 记录具体黑金商品。", sourceKey: SOURCES.toledoM900.key },
    ],
  }),
  makePack({
    key: "pura", id: PHASE54_PURA_ID, slug: "pelikan-pura", name: "百利金 Pelikan Pura (P40)", title: "Pelikan Pura P40：铝制笔身、钢尖与可换墨水系统", summary: "Pelikan Pura（P40）是铝制 cartridge/converter 现代设计线，2008 首发、2011 Black-Silver 与 2020 Mocha 复产颜色并存；它不是活塞 Souverän。", markdownFile: ".planning/content-research/pelikan-pura-p40.md", primary: SOURCES.puraMam, secondary: SOURCES.puraArchive, extras: [], svg: SOURCES.puraSvg, aliases: ["Pelikan Pura", "Pelikan P40", "Pelikan PURA", "百利金 Pura", "百利金 P40"], release: "2008；2011 Black-Silver；2020 Mocha 复产", nib: "钢尖；字幅按具体 P40 商品与市场核对", fill: "standard cartridge filler; suitable for ink converter", material: "aluminum barrel with matt silver and shiny surfaces; cap/trim colours by P40 variant", dimensions: "档案参考闭帽 140 mm、直径 12 mm、33 g、约 2 × 0.8 ml cartridge；不可替代每支实测", status: "首批至 2012，2020 起新颜色复产；颜色和库存按市场/商品核对", boundary: "Pura 的核心是铝制外壳与墨囊/转换器，不是 P200 的树脂 Classic 外壳，也不是 M200/M400 等差动活塞。P40 既有蓝银、银色、黑银，也有 2020 Mocha；颜色是 variant，不把 ballpoint P=、rollerball R= 当成此 fountain pen 页面。", variants: [
      { key: "p40-blue-silver", name: "P40 Blue-Silver", releaseYear: "2008", notes: "银色铝制笔身、蓝色帽、银色饰件；档案明确 steel nib 与 Pura cartridge identity。", sourceKey: SOURCES.puraArchive.key },
      { key: "p40-silver", name: "P40 Silver", releaseYear: "2008", notes: "银色铝制笔身与帽；哑光/亮面组合是设计语言，不应写成纯银金属。", sourceKey: SOURCES.puraArchive.key },
      { key: "p40-black-silver", name: "P40 Black-Silver", releaseYear: "2011", notes: "银色笔身、黑帽、银色饰件；生产年份来自档案表。", sourceKey: SOURCES.puraArchive.key },
      { key: "p40-mocha", name: "P40 Mocha", releaseYear: "2020", notes: "棕色/银色表面组合，档案标为 2020 复产色；不要用 2008 初版年份覆盖它。", sourceKey: SOURCES.puraArchive.key },
    ],
  }),
  makePack({
    key: "p200-p205", id: PHASE54_P200_P205_ID, slug: "pelikan-p200-p205", name: "百利金 Pelikan P200 / P205", title: "Pelikan P200/P205：Classic M200 外观下的 cartridge 兄弟", summary: "Pelikan P200 与 P205 自 2014 年起以 Classic M200 比例提供墨囊钢笔；P200 是金色饰件、P205 是银色饰件，二者都不是 piston filler。", markdownFile: ".planning/content-research/pelikan-p200-p205.md", primary: SOURCES.p200Mam, secondary: SOURCES.p200Archive, extras: [SOURCES.p205Mam], svg: SOURCES.p200Svg, aliases: ["Pelikan P200", "Pelikan P205", "Pelikan Classic 200 cartridge", "百利金 P200", "百利金 P205"], release: "2014–至今（档案生产线）", nib: "抛光不锈钢尖；常见 EF/F/M/B；P200 版本可见 gold-plated steel，P205 以银色饰件路线记录", fill: "cartridge filling system; compatible converter context; about 1.4 ml giant cartridge reference", material: "high-grade black resin barrel, gold-plated trim for P200 or silver chrome-plated trim for P205", dimensions: "闭帽约 126 mm、直径 12 mm、12 g、约 1.4 ml giant cartridge；比 M200 略短", status: "2014 起的 Classic cartridge family；黑色标准款与市场/尖号 SKU 并存", boundary: "P200/P205 不能被写成 M200/M205 的另一种颜色。它们的 feed tip 需要刺穿墨囊，因此 nib unit 与 piston fillers 的单元不兼容；M200 的差动活塞、约 1.2–1.3 ml 瓶装墨水和旧式年代不能回填。P200 与 P205 共享主体 family，只以金/银饰件和具体商品区分。", variants: [
      { key: "p200-black-gold", name: "P200 Black / gold trim", releaseYear: "2014–", notes: "黑色高光树脂、金色镀层饰件、钢尖；档案把 P200 与 P205 明确拆为两种 trim。", sourceKey: SOURCES.p200Archive.key },
      { key: "p205-black-silver", name: "P205 Black / silver trim", releaseYear: "2014–", notes: "黑色高光树脂、银色镀铬环和夹、抛光不锈钢尖；MAM 930727 列 EF 商品记录。", sourceKey: SOURCES.p205Mam.key },
      { key: "p200-nib", name: "P200/P205 EF/F/M/B steel nib options", releaseYear: "市场 SKU", notes: "MAM P205 记录 EF/F/M/B；不要把具体 F 商品推断为所有地区都同时有库存。", sourceKey: SOURCES.p205Mam.key },
    ],
  }),
];
