import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import { phase34ParkerDuofoldPacks } from "./phase34-parker-duofold";

const RETRIEVED = "2026-07-19";
export const PHASE36_PARKER_ID = "vhqNYqDChhiN";
export const PHASE36_PARKER_25_ID = "A-LJgmAC7hyl";
export const PHASE36_PARKER_T1_ID = "tYohGyB5d9Hp";
export const PHASE36_PARKER_50_ID = "emK8lqRk9z9b";
export const PHASE36_PARKER_100_ID = "IuVkqDL3cGcx";

function liveSource(input: {
  key: string; title: string; url: string; registryKey: string;
  registryName: string; sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"]; summary: string; locator: string;
}): CuratedSource {
  return {
    ...input,
    independenceGroup: input.registryKey,
    homepageUrl: input.url,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const prior = (key: string): CuratedSource => {
  for (const pack of phase34ParkerDuofoldPacks) {
    const found = pack.sources.find((source) => source.key === key);
    if (found) return structuredClone(found);
  }
  throw new Error(`Missing prior Parker source: ${key}`);
};

const SOURCES = {
  officialHistory: prior("parker-official-history"),
  care: prior("parker-care-guide"),
  p25: liveSource({
    key: "parker25-penography", title: "Parker 25 Penography", url: "https://parkerpens.net/parker25.html",
    registryKey: "parker-collector-penography", registryName: "Parker Pens Penography", sourceType: "blog", tier: "professional_secondary",
    summary: "记录 Parker 25 的 1975 首发、1978 哑黑 25B、笔尖、上墨、颜色和 Mark I–IV 识别边界。", locator: "Parker 25 range; 1975 launch; 1978 Matte Black; 1979 catalogue; Mark I-IV passages",
  }),
  pca1978: liveSource({
    key: "parker25-pca-catalogues", title: "Parker catalogue reference library", url: "https://pencollectorsofamerica.org/parker/",
    registryKey: "pen-collectors-of-america-parker-library", registryName: "Pen Collectors of America", sourceType: "official", tier: "contemporary_archive",
    summary: "PCA 索引列出 1978、1979 Parker 原始目录，作为同期版本核对入口。", locator: "Parker catalog 1978 parts 1/2; Parker catalog 1979 entries",
  }),
  t1: liveSource({
    key: "parker-t1-penography", title: "Parker T1 Penography", url: "https://parkerpens.net/parkert1.html",
    registryKey: "parker-collector-penography", registryName: "Parker Pens Penography", sourceType: "blog", tier: "professional_secondary",
    summary: "记录 1970 T1、钛制一体尖、尖下调节螺钉、停产原因、版本和 Parker 50 边界。", locator: "1970 launch; integrated nib; nib adjustment screw; 1971 discontinuation; 1978 Falcon passage",
  }),
  t1Vintage: liveSource({
    key: "parker-t1-vintagepens", title: "VintagePens Parker T1", url: "https://vintagepens.com/Parker_T1.shtml",
    registryKey: "vintagepens-reference", registryName: "VintagePens.com reference library", sourceType: "blog", tier: "professional_secondary",
    summary: "补充钛材加工、尖部修复困难、库存零件转入 Parker 75 书写工具等收藏边界。", locator: "Parker T1 history; titanium tooling; integrated nib repair; leftover parts",
  }),
  p50: liveSource({
    key: "parker50-penography", title: "Parker 50 Falcon Penography", url: "https://parkerpens.net/parker50.html",
    registryKey: "parker-collector-penography", registryName: "Parker Pens Penography", sourceType: "blog", tier: "professional_secondary",
    summary: "记录 1978–1982 Parker 50、钢制 unitary nib、Flighter、50B/TX、Signet 和 T1 边界。", locator: "Christmas 1978 launch; 1979 catalog; 1982 disappearance; finishes and nib passages",
  }),
  p50Catalog: liveSource({
    key: "parker50-1979-catalog", title: "Parker Product Information 1979", url: "https://drive.google.com/file/d/1LM2eMaT0bxKiu7qDo2XGTUYXS--Nji5D/view?usp=drive_open",
    registryKey: "pen-collectors-of-america-parker-library", registryName: "The Parker Pen Company", sourceType: "official", tier: "contemporary_archive",
    summary: "同期产品资料列 50 Flighter、unitary stainless nib、F/M/B、converter 与 washable blue cartridge。", locator: "PDF p.5 / printed p.4 50 FLIGHTER",
  }),
  p100: liveSource({
    key: "parker100-2004-catalog", title: "Parker UK Catalogue 2004", url: "https://drive.google.com/file/d/1qAz67mY2RPNH4BOspNaBuQMXRWqxepcp/view?usp=drive_link",
    registryKey: "pen-collectors-of-america-parker-library", registryName: "The Parker Pen Company", sourceType: "official", tier: "contemporary_archive",
    summary: "2004 同期目录列 Parker 100 的颜色、材料、18K hooded nib、墨囊／deluxe piston converter 和 Nib Guide。", locator: "PDF pp.8-9 / printed pp.6-7 Parker 100; pp.33-34 nib guide and trademark",
  }),
  p100History: liveSource({
    key: "parker100-penography", title: "Parker 100 Penography", url: "https://parkerpens.net/parker100.html",
    registryKey: "parker-collector-penography", registryName: "Parker Pens Penography", sourceType: "blog", tier: "professional_secondary",
    summary: "记录 Parker 100 的 2004–2007 年代、142 mm 参考值、51 设计遗产和颜色停产边界。", locator: "2004 catalogue introduction; 142 mm; 2007 discontinuation; finishes",
  }),
  hollington: liveSource({
    key: "parker100-hollington-interview", title: "Interview with Geoff Hollington", url: "https://parkerpens.net/geoff_hollington_interview.html",
    registryKey: "parker-collector-penography", registryName: "Parker Pens Penography interview archive", sourceType: "blog", tier: "professional_secondary",
    summary: "设计师访谈说明 Parker 100 的 brief 是 21 世纪 Parker 51，外观由 Hollington 设计、内部机械与流体设计由 Parker 完成。", locator: "Parker 100 brief; mechanical/fluidic design passages",
  }),
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES) => structuredClone(SOURCES[key]);

type ModelInput = {
  key: string; id: string; slug: string; name: string; title: string; summary: string;
  markdownFile: string; primary: keyof typeof SOURCES; secondary: keyof typeof SOURCES;
  aliases: string[]; release: string; nib: string; fill: string; material: string; status: string;
  dimensions?: string; variantName: string; variantNotes: string;
};

function makePack(input: ModelInput): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  const primary = source(input.primary);
  const secondary = source(input.secondary);
  const claimEvidence = (key: string, s: string, locator: string) => ({
    key, sourceKey: s, scopeKey, locator,
  });
  return {
    key: `phase36-${input.key}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug,
    canonicalName: input.name, publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile,
    storyTitle: input.title, primarySourceKey: primary.key, depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({ alias, language: "en", sourceKey: index === 0 ? primary.key : secondary.key })),
    sources: Array.from(new Map([primary, secondary, source("officialHistory"), source("care")].map((item) => [item.key, item])).values()),
    scopes: [{ key: scopeKey, scopeKey: `${input.key}-family`, validFrom: input.release, productionState: input.status.includes("历史") ? "historical" : "current", editionScope: "family facts only; SKU and market details remain variant-scoped" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.98, sourceKey: primary.key, locator: "model identity and chronology", evidence: [claimEvidence(`${input.key}-identity-evidence`, primary.key, "model identity and chronology")] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: `${input.name} 的材料、尖和年代不从相邻 Parker 型号外推。`, factClass: "editorial", confidence: 0.99, sourceKey: secondary.key, locator: "model-specific boundary", evidence: [claimEvidence(`${input.key}-boundary-evidence`, secondary.key, "model-specific boundary")] },
    ],
    variants: [{ key: `${input.key}-main`, name: input.variantName, releaseYear: input.release, notes: input.variantNotes, sourceKey: primary.key, variantKind: "edition_group" }],
    spec: { brandEntityId: PHASE36_PARKER_ID, values: { series_name: input.name, release_year: input.release, nib: input.nib, fill_system: input.fill, material: input.material, ...(input.dimensions ? { dimensions: input.dimensions } : {}), status: input.status }, evidence: [
      { key: `${input.key}-brand`, fieldKey: "brand_entity_id", sourceKey: primary.key, scopeKey, locator: "Parker maker identity", },
      { key: `${input.key}-series`, fieldKey: "series_name", sourceKey: primary.key, scopeKey, locator: "model name and family", },
      { key: `${input.key}-release`, fieldKey: "release_year", sourceKey: primary.key, scopeKey, locator: "release chronology", },
      { key: `${input.key}-nib`, fieldKey: "nib", sourceKey: primary.key, scopeKey, locator: "nib description", },
      { key: `${input.key}-material`, fieldKey: "material", sourceKey: primary.key, scopeKey, locator: "material and construction", },
      { key: `${input.key}-fill`, fieldKey: "fill_system", sourceKey: primary.key, scopeKey, locator: "filling system", },
      ...(input.dimensions ? [{ key: `${input.key}-dimensions`, fieldKey: "dimensions" as const, sourceKey: secondary.key, scopeKey, locator: "model-specific dimensions", }] : []),
      { key: `${input.key}-status`, fieldKey: "status", sourceKey: secondary.key, scopeKey, locator: "production status", },
    ] },
    media: [{ key: `${input.key}-diagram`, title: `${input.name} 资料边界示意图（非产品照片）`, sourceKey: secondary.key, localPath: `/images/library/site-original/parker-25-t1-50-falcon-100/${input.key}.svg`, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG。示意图，非产品照片；未复制或临摹产品照。", sourceUrl: `/images/library/site-original/parker-25-t1-50-falcon-100/${input.key}.svg`, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-launch`, title: `${input.name} 进入 Parker 产品线`, eventType: "model_released", startDate: input.release, circa: true, description: input.summary, sourceKey: primary.key }],
  };
}

const parkerBrandPack = structuredClone(phase34ParkerDuofoldPacks[0]);
if (!parkerBrandPack) throw new Error("Phase 36 Parker brand pack is missing");
parkerBrandPack.key = "phase36-parker-brand-v1";
parkerBrandPack.aliases = parkerBrandPack.aliases.filter((alias) => alias.alias !== "Parker 100");

export const phase36ParkerPacks: CuratedEntityPack[] = [
  parkerBrandPack,
  makePack({ key: "parker-25", id: PHASE36_PARKER_25_ID, slug: "parker-25", name: "Parker 25", title: "Parker 25：英国制造的方正入门钢笔", summary: "Parker UK 在 1975 年推出的低价耐用钢笔，涵盖 Flighter、哑黑 25B 与不同年代的钢尖和饰件。", markdownFile: ".planning/content-research/parker-25-publishable-content-2026-07-19.md", primary: "p25", secondary: "pca1978", aliases: ["Parker 25", "Parker 25 Flighter", "Parker 25B"], release: "1975", nib: "钢制半包尖；早期 Mark I 可见呼吸孔，尖号依版本", fill: "Parker 墨囊／converter", material: "钢与塑料；哑黑 25B 为环氧树脂表面", status: "历史型号，约 1975–1994", variantName: "Flighter / Matte Black 25B", variantNotes: "Flighter、哑黑 25B 与颜色饰件按年代区分；不要共用单一 SKU 尺寸。" }),
  makePack({ key: "parker-t1", id: PHASE36_PARKER_T1_ID, slug: "parker-t-1", name: "Parker T-1（1970）", title: "Parker T-1：钛金属一体尖的短命实验", summary: "Parker 1970 年推出的钛制 Space Pen，以一体尖和尖下调节螺钉著称，约一年后停产。", markdownFile: ".planning/content-research/parker-t1-publishable-content-2026-07-19.md", primary: "officialHistory", secondary: "t1", aliases: ["Parker T-1", "Parker T1", "Parker Space Pen"], release: "1970", nib: "钛制一体尖；尖下调节螺钉，F/M 或 M/B 可调范围", fill: "墨囊／converter；以具体保存状态核对", material: "钛主体与一体尖壳，红色端饰和金色箭形夹", status: "历史型号，1970–1971 短期生产", variantName: "Brushed / smooth titanium", variantNotes: "表面深浅和拉丝状态存在差异；后续 Parker 75 零件不归入 T-1 钢笔。" }),
  makePack({ key: "parker-50-falcon", id: PHASE36_PARKER_50_ID, slug: "parker-50-falcon", name: "Parker 50（Falcon）", title: "Parker 50 Falcon：1978 年的细钢一体尖", summary: "Parker 1978 年前后推出的钢制 Falcon 近亲，继承 T-1 的一体尖轮廓但不使用钛材。", markdownFile: ".planning/content-research/parker-50-falcon-publishable-content-2026-07-19.md", primary: "p50Catalog", secondary: "p50", aliases: ["Parker 50", "Parker 50 Falcon", "Parker Falcon 50"], release: "1978", nib: "Brushed Stainless Steel Unitary Nib；F/M/B，后期资料另见 EF", fill: "Parker 墨囊／converter", material: "拉丝不锈钢 Flighter；饰件依版本", dimensions: "原厂约 5-1/8 in、1 oz；独立实测值需与样本绑定", status: "历史型号，约 1978–1982", variantName: "50 Flighter / 50B-TX / Signet", variantNotes: "Falcon 是常用昵称；裸 Falcon 不作为唯一品牌别名。" }),
  makePack({ key: "parker-100", id: PHASE36_PARKER_100_ID, slug: "parker-100", name: "Parker 100", title: "Parker 100：2004–2007 的 51 时代回声", summary: "Parker 2004 年推出的现代独立型号，借鉴 51 的流线轮廓，采用漆面黄铜、18K hooded nib 与 converter。", markdownFile: ".planning/content-research/parker-100-publishable-content-2026-07-19.md", primary: "p100", secondary: "hollington", aliases: ["Parker 100", "PARKER100"], release: "2004", nib: "18K gold 或 rhodium-plated 18K hooded nib；EF/F/M 及特殊尖号依目录", fill: "deluxe piston converter 或 Parker 墨囊", material: "黄铜基底多层 lacquer；镀金或镀钯饰件依 GT/ST", dimensions: "约 142 mm；具体样本约 36 g，需按版本标注", status: "历史型号，2004–2007；不是 Parker 51 复刻", variantName: "Smoke Bronze GT / Diamond Blue GT / Honey White GT / Opal Silver ST / Cobalt Black GT-ST", variantNotes: "官方颜色与 GT/ST 饰件组合按 2004 目录记录，不能与 Duofold Centennial 混名。" }),
];
