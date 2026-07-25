import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE220_POLLOCK_BRAND_ID = "phase220-brand-pollock-pen-co";
export const PHASE220_POLLOCK_BRAND_SLUG = "pollock-pen-co";
export const PHASE220_JOHN_HANCOCK_ID = "N1XKtz_Qen0w";
export const PHASE220_JOHN_HANCOCK_SLUG = "the-john-hancock-cartridge-pen";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
  independenceGroup: string;
}): CuratedSource {
  return {
    ...input,
    registryKey: `${input.key}-registry`,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase220",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase220",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；结构示意，非产品照片，不证明真实比例、刻字、金尖材质、专利图纸或完整目录。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  vintagePens: web({
    key: "phase220-john-hancock-vintage-pens",
    title: "Vintage Pens：Early Cartridge Pens",
    url: "https://vintagepens.com/early_cartridge_pens.shtml",
    registryName: "Vintage Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "phase220-vintagepens",
    summary: "早期墨囊史资料把 John Hancock 放在 1920 年代 Boston 案例中，说明薄铜管墨囊、流通量和短生产窗口。",
    locator: "John Hancock cartridge pen section; copper tubing; Boston; limited production window",
  }),
  doctor: web({
    key: "phase220-john-hancock-doctor",
    title: "Vintage Pen Doctor：John Hancock copper cartridge pen",
    url: "https://vintagependoctor.com/john-hancock-metal-cartridge-pen/",
    registryName: "Vintage Pen Doctor",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "phase220-vintagepen-doctor",
    summary: "记录薄铜管、section 穿刺、定位销、标准尺寸和两个较小尺寸，并给出拆解风险提醒。",
    locator: "thin copper cartridge; hollow section extension; locking pin; standard and smaller sizes",
  }),
  fpn: web({
    key: "phase220-john-hancock-fpn",
    title: "Fountain Pen Network：John Hancock",
    url: "https://www.fountainpennetwork.com/forum/topic/139541-john-hancock/",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "community",
    independenceGroup: "phase220-fpn-john-hancock",
    summary: "收藏实物记录抄录 Pollock Pen Co. Boston 刻字、黑色硬橡胶、约 141 mm 合盖和约 12.4 g 空重样本。",
    locator: "cap imprint; black hard rubber; 141 mm capped sample; 12.4 g sample; nib inscription",
  }),
  patent: web({
    key: "phase220-john-hancock-patent",
    title: "Google Patents：US1671125A self-filling writing instrument",
    url: "https://patents.google.com/patent/US1671125A/en",
    registryName: "United States patent record",
    sourceType: "patent",
    tier: "primary",
    independenceGroup: "phase220-google-patents-us1671125",
    summary: "Pollock Pen Co. 早期自填充书写工具专利记录；专利日期与商品销售日期分开处理。",
    locator: "US1671125A; J G Rider Pen Co. record is excluded from John Hancock maker claim; patent dates retained as patent evidence",
  }),
  brandSvg: diagram("phase220-pollock-brand-svg", "Pollock Pen Co. 与 John Hancock 关系示意", "/images/library/site-original/phase220/pollock/john-hancock-brand.svg"),
  modelSvg: diagram("phase220-john-hancock-svg", "John Hancock Cartridge Pen 结构示意", "/images/library/site-original/phase220/pollock/john-hancock-cartridge-pen.svg"),
} as const;

const brandScope = "pollock-brand-scope";
const modelScope = "john-hancock-cartridge-pen-scope";

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, extra: string[] = []): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.86,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extra].map((evidenceSource, index) => ({ key: `${key}-evidence-${index + 1}`, sourceKey: evidenceSource, scopeKey, locator })),
  };
}

function specEvidence(fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `phase220-john-hancock-${fieldKey}`, fieldKey, sourceKey, scopeKey: modelScope, locator };
}

const brand: CuratedEntityPack = {
  key: "phase220-pollock-pen-co-brand",
  entityId: PHASE220_POLLOCK_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE220_POLLOCK_BRAND_SLUG,
  canonicalName: "Pollock Pen Co.",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pollock-pen-co-brand-phase220.md",
  storyTitle: "Pollock Pen Co.：John Hancock 铜管墨囊笔的制造者边界",
  primarySourceKey: S.vintagePens.key,
  depthTier: "B",
  aliases: [
    { alias: "Pollock Pen Co.", language: "en", sourceKey: S.fpn.key },
    { alias: "Pollock Pen Company", language: "en", sourceKey: S.doctor.key },
    { alias: "Boston Pollock Pen Co.", language: "en", sourceKey: S.fpn.key },
  ],
  sources: [S.vintagePens, S.doctor, S.fpn, S.patent, S.brandSvg],
  scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "historical", editionScope: "Pollock Pen Co. 品牌入口；John Hancock 是商品名／商标语境，不把同名人物或其它公司自动并入。" }],
  claims: [
    claim("pollock-brand-identity", "brand_identity", "可靠资料把 Pollock Pen Co. 与 Boston 制造的 John Hancock Cartridge Pen 相连；现有证据不足以补写完整公司史、产量或经营者名单。", S.fpn.key, brandScope, "Pollock Pen Co. Boston cap imprint", [S.vintagePens.key, S.doctor.key]),
    claim("pollock-john-hancock-name", "product_name_boundary", "John Hancock 是 Pollock 的商品命名／商标语境，不是美国政治人物本人创办的钢笔公司，也不是独立制造者。", S.fpn.key, brandScope, "John Hancock name and Pollock maker inscription", [S.doctor.key]),
    claim("pollock-cartridge-history", "technology_history", "Pollock 的 John Hancock 路线在约 1920 年代使用薄铜管墨囊和穿刺式供墨，属于塑料墨囊普及前的早期 cartridge 案例。", S.vintagePens.key, brandScope, "early cartridge history and copper tube", [S.doctor.key, S.patent.key]),
    claim("pollock-size-boundary", "variant_boundary", "资料记录标准尺寸以及两个较小尺寸；不同尺寸不能只凭外观比例合并，笔尖和墨囊也不能默认互换。", S.doctor.key, brandScope, "standard and two smaller sizes", [S.fpn.key]),
    claim("pollock-company-boundary", "identity_boundary", "Pollock Pen Co. 不吸收其它同名 John Hancock 公司或 Boston 小厂；未来须凭刻字、专利或目录建立新的来源化关系。", S.fpn.key, brandScope, "maker inscription and cautious company boundary", [S.patent.key]),
    claim("pollock-selection", "selection_guidance", "收藏或购买时应核对刻字、硬橡胶、铜管墨囊、穿刺部件、笔尖和修复记录；它首先是历史物件，其次才是日用笔。", S.doctor.key, brandScope, "restoration and condition cautions", [S.vintagePens.key, S.fpn.key]),
  ],
  variants: [{ key: "pollock-john-hancock-family", name: "John Hancock Cartridge Pen 家族", notes: "标准尺寸与两个较小尺寸均作为同一商品家族的尺寸变体；具体刻字和部件按实物核对。", sourceKey: S.doctor.key, variantKind: "edition_group" }],
  media: [{ key: "pollock-brand-primary", title: S.brandSvg.title, sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；品牌关系示意，非产品照片，不代表真实比例、Logo、完整目录或公司档案。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
  timeline: [
    { key: "pollock-1920s-cartridge", title: "John Hancock 铜管墨囊路线进入早期 cartridge 史料", eventType: "model_released", startDate: "1920", circa: true, description: "Vintage Pens、Vintage Pen Doctor 与收藏实物资料把 John Hancock 放在约 1920 年代；具体首发日未知。", sourceKey: S.vintagePens.key },
    { key: "pollock-patent-window", title: "Pollock 自填充结构进入专利记录", eventType: "patent_filed", startDate: "1923", circa: true, description: "US1671125A 作为结构与申请记录引用；专利日期不等于完整商品销售年表。", sourceKey: S.patent.key },
  ],
};

const model: CuratedEntityPack = {
  key: "phase220-john-hancock-cartridge-pen",
  entityId: PHASE220_JOHN_HANCOCK_ID,
  expectedType: "pen",
  expectedSlug: PHASE220_JOHN_HANCOCK_SLUG,
  canonicalName: "The John Hancock Cartridge Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/john-hancock-cartridge-pen-phase220.md",
  storyTitle: "John Hancock Cartridge Pen：薄铜管墨囊的早期实践",
  primarySourceKey: S.doctor.key,
  depthTier: "A",
  aliases: [
    { alias: "John Hancock Cartridge Pen", language: "en", sourceKey: S.fpn.key },
    { alias: "John Hancock cartridge pen", language: "en", sourceKey: S.vintagePens.key },
    { alias: "John Hancock Boston cartridge pen", language: "en", sourceKey: S.fpn.key },
    { alias: "John Hancock 铜管墨囊笔", language: "zh", sourceKey: S.doctor.key },
  ],
  sources: [S.vintagePens, S.doctor, S.fpn, S.patent, S.modelSvg],
  scopes: [{ key: modelScope, scopeKey: modelScope, productionState: "historical", materialScope: "黑色硬橡胶样本；薄铜管墨囊；金属饰件依单支核对。", editionScope: "John Hancock Cartridge Pen；标准尺寸与较小尺寸、刻字和修复状态分开记录，不套用现代塑料墨囊规格。" }],
  claims: [
    claim("john-hancock-identity", "model_identity", "John Hancock Cartridge Pen 是约 1920 年代 Boston Pollock Pen Co. 的早期墨囊型号；身份锚点包括 John Hancock／Pollock／Boston 刻字和薄铜管结构。", S.fpn.key, modelScope, "cap imprint and maker inscription", [S.doctor.key, S.vintagePens.key]),
    claim("john-hancock-mechanism", "filling_system", "笔使用薄铜管可替换墨囊；section 的中空延伸部刺穿金属封口，墨水进入导墨路径，内芯由定位部件限制旋转。", S.doctor.key, modelScope, "thin copper cartridge and hollow section extension", [S.vintagePens.key]),
    claim("john-hancock-history", "technology_history", "它是塑料墨囊普及前的重要 cartridge 案例，但不是所有墨囊笔的第一发明；Eagle 玻璃墨囊和后来的 Waterman 路线必须分开。", S.vintagePens.key, modelScope, "early cartridge chronology", [S.patent.key]),
    claim("john-hancock-material", "material_boundary", "收藏样本可见黑色硬橡胶、铜管墨囊和金属饰件；硬橡胶颜色、铜管状态和饰件并不能由单支样本外推到所有批次。", S.fpn.key, modelScope, "black hard rubber sample and copper cartridge", [S.doctor.key]),
    claim("john-hancock-dimensions", "dimensions", "Fountain Pen Network 的单支样本约 141 mm 合盖、约 12.4 g 空重；Vintage Pen Doctor 记录标准尺寸约 5 5/8 英寸以及两个较小尺寸。", S.fpn.key, modelScope, "141 mm and 12.4 g single sample", [S.doctor.key]),
    claim("john-hancock-nib", "nib_boundary", "收藏样本可见小比例金尖并有 John Hancock Boston 刻字；金含量、尖幅、弹性和是否原装必须按实物核对。", S.fpn.key, modelScope, "nib inscription and sample limitation", [S.doctor.key]),
    claim("john-hancock-maintenance", "maintenance_guidance", "铜管和硬橡胶应以低压、可逆方式清洁；不要强拆定位 section、热水浸泡、使用强溶剂或把现代国际墨囊胶粘改装进去。", S.doctor.key, modelScope, "do not remove section; restoration caution", [S.vintagePens.key]),
    claim("john-hancock-selection", "selection_guidance", "交易前看笔帽与笔尖刻字、铜管凹陷、硬橡胶裂纹、section 稳定性、原装度和修复记录；它更适合收藏与历史体验，不是无条件通勤笔。", S.fpn.key, modelScope, "collector condition and restoration checklist", [S.doctor.key, S.vintagePens.key]),
  ],
  variants: [
    { key: "john-hancock-standard", name: "John Hancock 标准尺寸", notes: "Vintage Pen Doctor 约 5 5/8 英寸；具体样本仍需看刻字和尺寸。", sourceKey: S.doctor.key, variantKind: "edition_group" },
    { key: "john-hancock-small", name: "John Hancock 较小尺寸", notes: "资料记录两个较小尺寸，但未给出可统一套用的长度或笔尖表。", sourceKey: S.doctor.key, variantKind: "edition_group" },
  ],
  spec: {
    brandEntityId: PHASE220_POLLOCK_BRAND_ID,
    values: {
      series_name: "John Hancock Cartridge Pen",
      release_year: "约 1920 年代；专利日期与实际销售年份分开处理",
      origin_country: "美国 Boston 语境；Pollock Pen Co. 制造者关系由刻字与收藏资料支持",
      nib: "收藏样本可见小比例金尖；金含量、尖幅和刻字按单支核对",
      fill_system: "薄铜管可替换墨囊；section 延伸部穿刺封口",
      material: "黑色硬橡胶样本；铜管墨囊；金属饰件依样本",
      dimensions: "约 141 mm 合盖、约 12.4 g 空重（FPN 单支样本）；标准尺寸约 5 5/8 英寸，另有两个较小尺寸",
      weight: "约 12.4 g 仅适用于 FPN 单支样本，不是统一批次规格",
      price_range: "历史收藏市场；价格随原装度、修复状态和尺寸变化，不给当前统一价",
      status: "历史小批量／低流通型号；原装度与修复状态决定可用性",
    },
    evidence: [
      specEvidence("brand_entity_id", S.fpn.key, "Pollock Pen Co. maker inscription"),
      specEvidence("series_name", S.fpn.key, "John Hancock Cartridge Pen cap name"),
      specEvidence("release_year", S.vintagePens.key, "1920s early cartridge window"),
      specEvidence("origin_country", S.fpn.key, "Boston USA imprint"),
      specEvidence("nib", S.fpn.key, "John Hancock Boston nib sample"),
      specEvidence("fill_system", S.doctor.key, "copper cartridge piercing mechanism"),
      specEvidence("material", S.fpn.key, "black hard rubber sample"),
      specEvidence("dimensions", S.fpn.key, "141 mm and 12.4 g single sample"),
      specEvidence("weight", S.fpn.key, "12.4 g single sample only"),
      specEvidence("price_range", S.vintagePens.key, "scarce historical circulation; no current price claim"),
      specEvidence("status", S.vintagePens.key, "limited production and early cartridge history"),
    ],
  },
  media: [{ key: "john-hancock-primary", title: S.modelSvg.title, sourceKey: S.modelSvg.key, localPath: S.modelSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；结构示意，非产品照片，不代表真实尺寸、刻字、金尖材质、专利比例或单支状态。", sourceUrl: S.modelSvg.url, usageStatus: "primary" }],
  timeline: [
    { key: "john-hancock-1920s", title: "John Hancock Cartridge Pen 进入公开销售与收藏记录窗口", eventType: "model_released", startDate: "1920", circa: true, description: "Vintage Pens、Vintage Pen Doctor 和收藏实物资料共同指向约 1920 年代；具体首发日未知。", sourceKey: S.vintagePens.key },
    { key: "john-hancock-patent", title: "Pollock 自填充结构专利记录", eventType: "patent_filed", startDate: "1923", circa: true, description: "US1671125A 作为结构和专利时间证据；不能单独推出全部商品年份。", sourceKey: S.patent.key },
  ],
};

export const phase220JohnHancockPacks: CuratedEntityPack[] = [brand, model];
