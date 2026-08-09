import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { phase426BrandDepthRefreshPacks } from "./phase426-brand-depth-refresh";
import {
  PHASE155_IDS,
  phase155ParkerHistoricTrioPacks,
} from "./phase155-parker-historic-trio";

const RETRIEVED = "2026-08-09";
export const ENTITY_ID = PHASE155_IDS.parker180;
const SLUG = "the-parker-180";
const base = phase155ParkerHistoricTrioPacks.find(
  (pack) => pack.entityId === ENTITY_ID,
);
if (!base) throw new Error("Phase 552 Parker 180 base pack is missing.");
const parkerBrand = phase426BrandDepthRefreshPacks.find(
  (candidate) => candidate.entityId === PHASE155_IDS.brand && candidate.expectedType === "brand",
);
if (!parkerBrand) throw new Error("Phase 552 Parker brand navigation pack is missing.");
export const PHASE552_PARKER_BRAND_ID = parkerBrand.entityId;

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
}): CuratedSource {
  return {
    ...input,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const S = {
  penography: web({
    key: "phase552-parker180-penography",
    title: "Parker Pens Penography: Parker 180",
    url: "https://parkerpens.net/parker180.html",
    registryKey: "parker-penography-phase552",
    registryName: "Parker Pens Penography",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "parker-penography-phase552",
    summary:
      "型号档案记录 1977—1985 范围、双面尖 XF/M 与 F/B、Parker cartridge/converter、finish 变体、14K 到钢尖及 1986 Classic 边界。",
    locator: "Parker 180 page; timeline, nib, filling, finishes and Classic transition",
  }),
  patentNarrow: web({
    key: "phase552-parker180-patent-3957379",
    title: "US Patent 3,957,379: Fountain pen",
    url: "https://patents.google.com/patent/US3957379A/en",
    registryKey: "uspto-phase552",
    registryName: "United States Patent and Trademark Office",
    sourceType: "patent",
    tier: "primary",
    independenceGroup: "uspto-phase552",
    summary:
      "Parker 相关专利说明双面平面尖和支撑结构的工程边界，不把专利图纸当作量产尺寸或每个 SKU 的目录。",
    locator: "abstract and claims on opposed flat nib faces supported against flexure",
  }),
  patentDesign: web({
    key: "phase552-parker180-patent-d243014",
    title: "US Design Patent D243,014",
    url: "https://patents.google.com/patent/USD243014/en",
    registryKey: "uspto-design-phase552",
    registryName: "United States Patent and Trademark Office",
    sourceType: "patent",
    tier: "primary",
    independenceGroup: "uspto-design-phase552",
    summary:
      "外观设计专利支持 Parker 180 的细长、棱角和前端设计背景；它不公开统一长度、重量或颜色目录。",
    locator: "design patent drawings and Parker Pen Company assignment",
  }),
  richards: web({
    key: "phase552-parker180-richards-pens",
    title: "Richard’s Pens: Parker 180 profile",
    url: "https://www.richardspens.com/ref/profiles/180.htm",
    registryKey: "richards-pens-phase552",
    registryName: "Richard’s Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "richards-pens-phase552",
    summary:
      "专业钢笔档案用于交叉核对 Parker 180 的细身、双面尖、Parker 上墨器和历史维护边界。",
    locator: "Parker 180 profile; nib support, filling and physical identification",
  }),
  officialHistory: web({
    key: "phase552-parker-official-history",
    title: "Parker official history timeline",
    url: "https://www.parkerpen.com/parker-history.html",
    registryKey: "parker-official-history-phase552",
    registryName: "Parker",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-official-history-phase552",
    summary:
      "Parker 官方年表只提供品牌在 1970 年代的产品与技术语境，本页不把其它型号日期回填为 Parker 180 的 SKU 事实。",
    locator: "official history timeline around 1970 and later product context",
  }),
} as const;

const scope: CuratedScope = {
  key: "phase552-parker180-historical-depth",
  scopeKey: "phase552-parker180-historical-depth",
  validFrom: RETRIEVED,
  productionState: "historical",
  market: "Parker historical model records and surviving samples",
  nibScope:
    "Parker 180 flat double-sided nib; common XF/M or F/B descriptions remain sample and version scoped",
  materialScope:
    "early 14K gold nib and later steel-nib boundary; Flighter, electroplated and lacquer finishes remain separate",
  editionScope:
    "1977–1985 Penography range with 1986 Classic integration boundary; regional production and finish variants are not one SKU",
};

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: CuratedClaim["factClass"] = "core",
  confidence = 0.98,
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence,
    sourceKey,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey: scope.key,
        locator,
      },
    ],
  };
}

function specEvidence(
  key: string,
  fieldKey: CuratedSpecEvidence["fieldKey"],
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return {
    key,
    fieldKey,
    sourceKey,
    scopeKey: scope.key,
    locator,
    qualifies: true,
  };
}

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase552-parker180-depth-v1",
  expectedType: "pen",
  expectedSlug: SLUG,
  canonicalName: "The Parker 180",
  markdownFile: ".planning/content-research/parker-180-phase552.md",
  storyTitle: "Parker 180：双面尖、历史版本与细身上墨边界",
  primarySourceKey: S.penography.key,
  sources: [
    ...base.sources.filter(
      (source) => source.key !== "phase155-parker180-history",
    ),
    S.penography,
    S.patentNarrow,
    S.patentDesign,
    S.richards,
    S.officialHistory,
  ],
  scopes: [...base.scopes, scope],
  claims: [
    claim(
      "phase552-parker180-identity",
      "model_identity",
      "Parker 180 是 1977 年前后上市的细身历史钢笔；型号身份由扁平双面尖、细身笔体和 Parker cartridge/converter 路线共同构成，不能只凭金属外观确认。",
      S.penography.key,
      "1977–1985 model heading, flat two-sided nib and Parker filling",
    ),
    claim(
      "phase552-parker180-nib-support",
      "nib_engineering",
      "US 3,957,379 将 Parker 的双面尖描述为两个相对的平面，并由结构分别支撑以减少弯曲；这支持 180 的尖面工程背景，不等于每一支尖都保持相同线宽。",
      S.patentNarrow.key,
      "abstract and claims: opposed flat faces distinctly supported against flexure",
    ),
    claim(
      "phase552-parker180-line-grades",
      "reversible_line_width",
      "专业型号档案记录常见 XF/M 与 F/B 组合；正反面差异仍会受尖角、磨损、墨水、纸张和书写角度影响，不能把标签当作未经试写的固定倍数。",
      S.penography.key,
      "nib grades offered as XF/M or F/B and two-way writing description",
    ),
    claim(
      "phase552-parker180-historical-range",
      "historical_timeline",
      "Parker Penography 把 180 的主要型号范围标为 1977—1985；1986 年前后纳入 Classic 线路的记录另有尖和 feed 重设计，因此不能把 Classic 的后期结构回填到所有 180。",
      S.penography.key,
      "1977–1985 heading and 1986 Classic integration note",
    ),
    claim(
      "phase552-parker180-nib-material-boundary",
      "nib_material_transition",
      "档案记录早期高端版本的 14K gold nib，以及约 1983 年起部分版本改用 steel nib 的成本和产品调整；尖刻字与尖座必须按具体实物核对。",
      S.penography.key,
      "1983 gold-to-steel nib transition note",
    ),
    claim(
      "phase552-parker180-finish-boundary",
      "finish_variants",
      "Flighter 不锈钢、22K gold electroplated Imperial、漆面和 Place Vendôme 图案属于不同 finish 线；颜色名、镀层和尖材不能相互推断。",
      S.penography.key,
      "Flighter, Imperial, lacquer and Place Vendôme finish records",
    ),
    claim(
      "phase552-parker180-filling-boundary",
      "filling_system",
      "Parker 180 属于 Parker cartridge/converter 路线，不是 Vacumatic 或 Parker 51 的真空／毛细管填充；细身版本的转换器长度和直径仍需按接口与实物核对。",
      S.richards.key,
      "Parker 180 filling profile and converter compatibility boundary",
    ),
    claim(
      "phase552-parker180-design-patent-boundary",
      "design_evidence_boundary",
      "D243,014 只支持 Parker 180 的细长外观和前端设计背景；专利图纸不是量产目录，不能单独推出统一长度、重量、颜色或产地。",
      S.patentDesign.key,
      "design drawings and assignment to The Parker Pen Company",
    ),
    claim(
      "phase552-parker180-maintenance",
      "maintenance_guidance",
      "旧 180 清洁应从取下墨囊／转换器、室温清水和低压吸排开始；扁平尖、镀层、漆面和细螺纹不适合针捅、研磨剂、强溶剂或高温水。",
      S.richards.key,
      "professional profile used for conservative historical-pen care boundary",
      "editorial",
      0.94,
    ),
    claim(
      "phase552-parker180-selection",
      "selection_guidance",
      "二手 180 应优先确认双面出墨、尖座无裂、帽盖密封和转换器匹配，再比较 finish；卖家标题、金色外观或单张远景照片不足以证明尖材、年份和原装配件。",
      S.penography.key,
      "model, finish and nib distinctions used as buying checklist",
      "editorial",
      0.94,
    ),
    claim(
      "phase552-parker180-official-context",
      "official_context_boundary",
      "Parker 官方年表只用于确认品牌在 1970 年代的产品语境；它没有给出 180 的完整 SKU 表，因此本页不把官方年表中其它型号的日期写成 180 的型号事实。",
      S.officialHistory.key,
      "official timeline around 1970 and subsequent Parker product context",
    ),
  ],
  variants: [
    {
      key: "phase552-parker180-xf-m",
      name: "XF/M 双面尖",
      notes: "一面偏细、一面偏中；线宽仍按尖面、角度和实际磨损判断。",
      sourceKey: S.penography.key,
      variantKind: "nib",
    },
    {
      key: "phase552-parker180-f-b",
      name: "F/B 双面尖",
      notes: "一面偏细、一面偏宽；不把档案级别当作每支二手笔的试写结果。",
      sourceKey: S.penography.key,
      variantKind: "nib",
    },
    {
      key: "phase552-parker180-gold-nib",
      name: "早期 14K gold nib 版本",
      notes: "高端版本的尖材线索；需读取尖刻字和检查尖座，金色 finish 不是证据。",
      sourceKey: S.penography.key,
      variantKind: "nib",
    },
    {
      key: "phase552-parker180-steel-nib",
      name: "约 1983 年起的 steel nib 版本",
      notes: "部分后期版本的成本调整路线，不覆盖所有地区或所有库存。",
      sourceKey: S.penography.key,
      variantKind: "nib",
    },
    {
      key: "phase552-parker180-flighter",
      name: "Flighter 不锈钢 finish",
      notes: "拉丝不锈钢外观；不从 finish 推断尖材、生产地或转换器型号。",
      sourceKey: S.penography.key,
      variantKind: "material",
    },
    {
      key: "phase552-parker180-lacquer-place-vendome",
      name: "漆面与 Place Vendôme 图案线",
      notes: "1979–1982 档案中可见多种漆面、镀金和镀银图案；颜色和系列应按具体帽口、刻字和包装核对。",
      sourceKey: S.penography.key,
      variantKind: "edition_group",
    },
    {
      key: "phase552-parker180-classic-boundary",
      name: "1986 前后 Classic 线路边界",
      notes: "后期尖和 feed 略有重设计；Classic 的黑色护圈不能回填为所有 Parker 180 的原装结构。",
      sourceKey: S.penography.key,
      variantKind: "edition_group",
    },
  ],
  spec: {
    brandEntityId: PHASE155_IDS.brand,
    values: {
      series_name: "Parker 180",
      release_year: "1977 年前后上市；Penography 标记历史范围 1977–1985",
      origin_country:
        "美国 Parker 产品线；档案另记法国 Meru、英国等生产／finish 线索，具体实物待核",
      nib: "扁平双面尖；常见 XF/M 或 F/B；早期 14K gold、约 1983 年起部分版本 steel",
      fill_system: "Parker cartridge/converter；细身版本的转换器按接口与长度核对",
      material: "Flighter 不锈钢、镀金、漆面和图案金属 finish 按版本",
      status: "历史型号；1986 前后进入 Classic 线路的边界另行记录",
    },
    evidence: [
      specEvidence(
        "phase552-parker180-spec-brand",
        "brand_entity_id",
        S.penography.key,
        "Parker 180 model profile",
      ),
      specEvidence(
        "phase552-parker180-spec-series",
        "series_name",
        S.penography.key,
        "Parker 180 heading and model identity",
      ),
      specEvidence(
        "phase552-parker180-spec-release",
        "release_year",
        S.penography.key,
        "1977 launch context and 1977–1985 heading",
      ),
      specEvidence(
        "phase552-parker180-spec-origin",
        "origin_country",
        S.penography.key,
        "France, UK and US production/finish notes",
      ),
      specEvidence(
        "phase552-parker180-spec-nib",
        "nib",
        S.patentNarrow.key,
        "opposed flat faces supported against flexure; Penography XF/M, F/B and material transition",
      ),
      specEvidence(
        "phase552-parker180-spec-fill",
        "fill_system",
        S.richards.key,
        "Parker cartridge/converter profile",
      ),
      specEvidence(
        "phase552-parker180-spec-material",
        "material",
        S.penography.key,
        "Flighter, electroplated, lacquer and patterned-metal finish records",
      ),
      specEvidence(
        "phase552-parker180-spec-status",
        "status",
        S.penography.key,
        "historical 1977–1985 range and 1986 Classic boundary",
      ),
    ],
  },
  media: base.media,
};

export const phase552Parker180DepthPacks: CuratedEntityPack[] = [parkerBrand, pack];
