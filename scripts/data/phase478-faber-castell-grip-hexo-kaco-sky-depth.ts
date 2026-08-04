import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase139NewModelPacks } from "./phase139-german-swiss-current-batch";
import { phase170KacoSkyPacks } from "./phase170-kaco-sky";

export const PHASE478_IDS = {
  grip: "phase139-faber-castell-grip-2011",
  hexo: "phase139-faber-castell-hexo",
  kacoSky: "WgPQyH1oYSEX",
} as const;

const RETRIEVED = "2026-08-03";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  title: string;
  url: string;
  summary: string;
  author: string;
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
    homepageUrl:
      input.sourceType === "official" ? new URL(input.url).origin : input.url,
    itemType: "web_page",
    author: input.author,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 478 exact model, version, care or generation boundary`,
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: CuratedClaim["factClass"] = "core",
): CuratedClaim {
  const locator = sourceItem.archiveLocator ?? sourceItem.summary;
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "editorial" ? 0.96 : 0.98,
    sourceKey: sourceItem.key,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator }],
  };
}

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = [...phase139NewModelPacks, ...phase170KacoSkyPacks].find(
    (candidate) => candidate.entityId === entityId,
  );
  if (!pack) throw new Error(`Phase 478 ${label} base pack is missing.`);
  return pack;
}

function refresh(
  pack: CuratedEntityPack,
  key: string,
  markdownFile: string,
  primary: CuratedSource,
  extras: CuratedSource[],
  scope: CuratedScope,
  claims: CuratedClaim[],
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>,
  eventTitle: string,
  eventDescription: string,
): CuratedEntityPack {
  return {
    ...pack,
    key,
    markdownFile,
    primarySourceKey: primary.key,
    sources: [...pack.sources, primary, ...extras],
    scopes: [...pack.scopes, scope],
    claims: [...pack.claims, ...claims],
    spec: pack.spec
      ? {
          ...pack.spec,
          values: { ...pack.spec.values, ...values },
          evidence: [
            ...pack.spec.evidence,
            ...Object.keys(values).map((fieldKey) => ({
              key: `${key}-${fieldKey}-evidence`,
              fieldKey: fieldKey as SpecFieldKey,
              sourceKey: primary.key,
              scopeKey: scope.scopeKey,
              locator: primary.archiveLocator ?? primary.summary,
              qualifies: true,
            })),
          ],
        }
      : undefined,
    timeline: [
      ...(pack.timeline ?? []),
      {
        key: `${key}-current-review`,
        title: eventTitle,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: eventDescription,
        sourceKey: primary.key,
      },
    ],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const gripOfficial = source({
  key: "phase478-faber-grip-140900-current",
  registryKey: "faber-castell-official-phase478",
  registryName: "Faber-Castell official product and care pages",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "faber-castell-official-phase478",
  title: "Grip 2011 fountain pen M silver 140900 | Faber-Castell",
  url: "https://www.faber-castell.com/products/Grip2011fountainpenMsilver/140900",
  summary:
    "官方 140900 商品页以 Silver M 为具体 SKU，确认 Grip 2011 的三角握位、软点、塑料笔身、不锈钢尖与钢笔产品身份；颜色和尖幅按 SKU 区分。",
  author: "Faber-Castell",
});
const gripSeries = source({
  key: "phase478-faber-grip-series-current",
  registryKey: "faber-castell-official-phase478",
  registryName: "Faber-Castell official product and care pages",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "faber-castell-official-phase478",
  title: "Grip fountain pen series | Faber-Castell",
  url: "https://www.faber-castell.com/grip-fountain-pen",
  summary:
    "官方系列页用于核对 Grip 的颜色/产品线边界，并把钢笔与同名其他书写工具分开；不从系列页外推每个市场库存。",
  author: "Faber-Castell",
});
const gripCare = source({
  key: "phase478-faber-grip-care-current",
  registryKey: "faber-castell-official-phase478",
  registryName: "Faber-Castell official product and care pages",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "faber-castell-official-phase478",
  title: "Fountain pen FAQ | Faber-Castell",
  url: "https://www.faber-castell.com/service/frequently-asked-questions/faq-fountain-pens",
  summary:
    "官方 FAQ 提供墨囊、converter、换色清洗和温和冲洗语境；本页仅把它用于 Grip 的保守维护建议。",
  author: "Faber-Castell",
});
const gripReview = source({
  key: "phase478-faber-grip-pencilcase-review",
  registryKey: "pencilcase-phase478",
  registryName: "Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcase-phase478",
  title: "Grip 2011 Fountain Pen Review",
  url: "https://www.pencilcaseblog.com/2020/07/review-faber-castell-grip-2011-fountain.html",
  summary:
    "独立评测用于握位与日常书写观察，不替代官方 140900 的尖幅、材料或供货字段。",
  author: "Pencilcase Blog",
});

const hexoOfficial = source({
  key: "phase478-faber-hexo-150540-current",
  registryKey: "faber-castell-official-phase478",
  registryName: "Faber-Castell official product and care pages",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "faber-castell-official-phase478",
  title: "HEXO fountain pen M blue 150540 | Faber-Castell",
  url: "https://www.faber-castell.com/products/HexofountainpenMblue/150540",
  summary:
    "官方 150540 商品页以 Blue M 为规格锚点，确认 HEXO 的六角铝制笔身、钢尖和墨囊/converter 路线；颜色和尖幅按 SKU 处理。",
  author: "Faber-Castell",
});
const hexoPress = source({
  key: "phase478-faber-hexo-press-current",
  registryKey: "faber-castell-official-phase478",
  registryName: "Faber-Castell official product and care pages",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "faber-castell-official-phase478",
  title: "HEXO press information | Faber-Castell",
  url: "https://www.faber-castell.com/service/press/hexo",
  summary:
    "官方 Press 页面提供 HEXO 设计与产品线背景；颜色的地区时间窗口不被当成全球统一首发年。",
  author: "Faber-Castell",
});
const hexoReview = source({
  key: "phase478-faber-hexo-penaddict-review",
  registryKey: "pen-addict-phase478",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pen-addict-phase478",
  title: "Faber-Castell HEXO Fountain Pen Review",
  url: "https://www.penaddict.com/blog/2020/9/23/faber-castell-hexo-fountain-pen-review",
  summary:
    "独立样本评测用于六角笔杆、握持和日常书写观察，不替代 150540 的官方 SKU 字段。",
  author: "The Pen Addict",
});

const kacoOfficial = source({
  key: "phase478-kaco-sky-official-news-current",
  registryKey: "kaco-official-phase478",
  registryName: "上海文采 / KACO official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kaco-official-phase478",
  title: "KACO 2016 年 SKY 百锋新品发布会报道",
  url: "https://www.kaco.cc/en/list/29/",
  summary:
    "上海文采官方新闻记录 2016 年 4 月 23 日 SKY 百锋发布，并称其正式面向中国市场；这是型号时间线锚点。",
  author: "上海文采实业有限公司",
});
const kacoRetail = source({
  key: "phase478-kaco-sky-gecko-current",
  registryKey: "geckodesign-kaco-phase478",
  registryName: "GeckoDesign",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "geckodesign-kaco-phase478",
  title: "KACO SKY 百锋限定礼盒",
  url: "https://www.geckodesign.com.tw/en/products/kaco%EF%BC%9ASKY%E7%99%BE%E9%8B%92%E9%8B%BC%E7%AD%86%EF%BC%9A%E9%99%90%E5%AE%9A%E5%85%B8%E8%97%8F%E7%A6%AE%E7%9B%92-2%E8%89%B2",
  summary:
    "可靠零售商列出 PC 笔身、不锈钢 EF 明尖、约 0.4 mm 标称线迹、欧规墨囊/吸墨器和礼盒配件；这些是礼盒范围。",
  author: "GeckoDesign",
});
const kacoReview = source({
  key: "phase478-kaco-sky-penaddict-current",
  registryKey: "penaddict-kaco-phase478",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penaddict-kaco-phase478",
  title: "KACO SKY II fountain pen review",
  url: "https://www.penaddict.com/blog/2018/3/30/kaco-sky-ii-fountain-pen-review",
  summary:
    "专业评测用于 SKY 与 SKY II 的代际比较：后者使用 Makrolon 与黑色 Schmidt 尖，不能回填第一代 PC/不锈钢 EF 规格。",
  author: "The Pen Addict",
});

const gripScope: CuratedScope = {
  key: "phase478-grip-current-review",
  scopeKey: "phase478-grip-current-review",
  market: "Faber-Castell official 140900 Silver M product page",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope: "140900 is an M stainless-steel nib; other widths and colours remain exact-SKU questions.",
  materialScope: "Plastic body, triangular grip and soft-grip dots for 140900; finish and packaging do not generalise.",
  editionScope: "Grip 2011 fountain pen only; other Grip writing modes and colour/pearl versions remain siblings.",
};
const hexoScope: CuratedScope = {
  key: "phase478-hexo-current-review",
  scopeKey: "phase478-hexo-current-review",
  market: "Faber-Castell official 150540 Blue M product page",
  validFrom: RETRIEVED,
  productionState: "current",
  nibScope: "150540 is an M stainless-steel nib; EF/F/B and regional selectors require their own SKU evidence.",
  materialScope: "150540 blue aluminium six-sided body; Bronze and other surface treatments remain separate variants.",
  editionScope: "HEXO fountain pen; do not merge other writing modes, accessories or unrelated hexagonal models.",
};
const kacoScope: CuratedScope = {
  key: "phase478-kaco-sky-current-review",
  scopeKey: "phase478-kaco-sky-current-review",
  market: "Shanghai Wencai official launch and public gift-set specification",
  validFrom: RETRIEVED,
  productionState: "historical",
  nibScope: "First-generation public gift set lists a stainless-steel EF nib and approximate 0.4 mm line; individual tuning varies.",
  materialScope: "First-generation gift-set evidence says PC plastic; SKY II Makrolon and metal finishes are not inherited.",
  editionScope: "2016 SKY 百锋 first-generation route; SKY II, gift sets and collaborations remain separate boundaries.",
};

const gripBase = base(PHASE478_IDS.grip, "Grip 2011");
const hexoBase = base(PHASE478_IDS.hexo, "HEXO");
const kacoBase = base(PHASE478_IDS.kacoSky, "KACO SKY");

export const phase478FaberCastellGripHexoKacoSkyDepthPacks: CuratedEntityPack[] = [
  refresh(
    gripBase,
    "phase478-faber-grip-2011-depth-v1",
    ".planning/content-research/faber-castell-grip-2011-phase478.md",
    gripOfficial,
    [gripSeries, gripCare, gripReview],
    gripScope,
    [
      claim(gripOfficial, gripScope.scopeKey, "phase478-grip-140900-identity", "current_sku_identity", "官方 140900 页面把 Silver M 的 Grip 2011 钢笔与同系列其他书写工具分开；本页以该 SKU 为规格锚点。"),
      claim(gripSeries, gripScope.scopeKey, "phase478-grip-version-boundary", "version_boundary", "Grip 的颜色、图案、尖幅和套装是版本层；不能把 140900 的 M 尖、材料或库存直接扩展到所有 Grip。"),
      claim(gripReview, gripScope.scopeKey, "phase478-grip-grip-section", "handling_context", "独立评测用于三角握位和软点的样本使用观察；握姿舒适度仍受手型、压力、纸张和单支调校影响。", "editorial"),
      claim(gripCare, gripScope.scopeKey, "phase478-grip-care-boundary", "care_boundary", "现代 Grip 采用墨囊/converter 的保守清洗语境；常温水清洗，不用酒精、丙酮、热水或强力撬动握位。"),
    ],
    {
      series_name: "Faber-Castell Grip 2011 fountain pen",
      release_year: "系列年代不由 140900 产品号单独推断；140900 Silver M 页面于 2026-08-03 复核",
      origin_country: "Faber-Castell 官方商品页；不从品牌归属推断单支制造地",
      nib: "140900 Silver M：不锈钢 M 尖；EF/F 等按明确 SKU",
      fill_system: "Faber-Castell 墨囊／converter 路线；附件按市场包装核对",
      material: "140900 塑料笔身、三角握位与软点握胶",
      dimensions: "官方资料未给出可外推全系列的统一尺寸；以单支实物为准",
      weight: "官方资料未给出可外推全系列的统一重量；不把包装重量当笔重",
      status: "官方 Grip 系列与 140900 商品页可核对；地区颜色和库存会变化",
    },
    "Phase 478：Faber-Castell Grip 2011 的 140900 Silver M 版本深化",
    "以官方 SKU、系列页、维护 FAQ 与独立评测复核三角握位、软点、不锈钢 M 尖、C/C 上墨和版本边界，不把产品号当成首发年份。",
  ),
  refresh(
    hexoBase,
    "phase478-faber-hexo-depth-v1",
    ".planning/content-research/faber-castell-hexo-phase478.md",
    hexoOfficial,
    [hexoPress, hexoReview, gripCare],
    hexoScope,
    [
      claim(hexoOfficial, hexoScope.scopeKey, "phase478-hexo-150540-identity", "current_sku_identity", "官方 150540 页面把 Blue M 的 HEXO 钢笔、六角铝制笔身、不锈钢尖与墨囊/converter 路线作为具体 SKU 资料。"),
      claim(hexoPress, hexoScope.scopeKey, "phase478-hexo-series-boundary", "series_version_boundary", "HEXO 的颜色和表面处理按地区与 SKU 变化；Blue 150540 的材质和尖幅不能覆盖 Bronze 或其他版本。"),
      claim(hexoReview, hexoScope.scopeKey, "phase478-hexo-handling-context", "handling_context", "独立评测用于六角笔杆、防滚、握持与日常书写观察；它不替代当前官方商品字段。", "editorial"),
      claim(gripCare, hexoScope.scopeKey, "phase478-hexo-care-boundary", "care_boundary", "HEXO 的铝制表面与 C/C 供墨采用常温水清洗、避免溶剂和研磨剂的保守维护边界。"),
    ],
    {
      series_name: "Faber-Castell HEXO",
      release_year: "Blue/Bronze 地区资料窗口从 2021 年起可核对；不外推统一全球首发年",
      origin_country: "Faber-Castell 官方商品与 Press 页面；不从品牌归属推断单支制造地",
      nib: "150540 Blue M：不锈钢 M 尖；其他尖幅按明确 SKU",
      fill_system: "Faber-Castell 墨囊／converter 路线；附件按市场核对",
      material: "150540 蓝色铝制六角笔身；Bronze 与其他表面不跨 SKU 合并",
      dimensions: "官方 150540 页面未给出可外推全系列的统一尺寸；以单支实物为准",
      weight: "官方资料未给出可外推全系列的统一重量；不把评测样本或包装重量泛化",
      status: "官方产品与 Press 页面可核对；地区颜色、尖幅和库存会变化",
    },
    "Phase 478：Faber-Castell HEXO 150540 Blue M 版本深化",
    "以官方商品页、HEXO Press、维护 FAQ 和独立样本评测复核六角铝杆、150540 M 尖、C/C 上墨、防滚使用场景与颜色边界。",
  ),
  refresh(
    kacoBase,
    "phase478-kaco-sky-depth-v1",
    ".planning/content-research/kaco-sky-phase478.md",
    kacoOfficial,
    [kacoRetail, kacoReview],
    kacoScope,
    [
      claim(kacoOfficial, kacoScope.scopeKey, "phase478-kaco-sky-launch", "official_launch", "上海文采官方新闻把 SKY 百锋新品发布会放在 2016 年 4 月 23 日，并说明其正式面向中国市场。"),
      claim(kacoRetail, kacoScope.scopeKey, "phase478-kaco-sky-gift-spec", "gift_set_specification", "公开礼盒资料列第一代 PC 笔身、不锈钢 EF 明尖、约 0.4 mm 标称线迹、欧规墨囊/吸墨器和三角笔杆；配件与包装不代表散装全系。"),
      claim(kacoReview, kacoScope.scopeKey, "phase478-kaco-sky-generation", "generation_boundary", "专业评测把 SKY II 的 Makrolon 笔杆和黑色 Schmidt 尖作为后续升级，不能回填第一代 PC/不锈钢 EF 规格。"),
      claim(kacoRetail, kacoScope.scopeKey, "phase478-kaco-sky-care", "care_boundary", "第一代 SKY 的 PC 与 EF 尖采用常温水、轻柔吸排和避免溶剂/金属疏通的保守维护建议。", "editorial"),
    ],
    {
      series_name: "KACO SKY 百锋",
      release_year: "2016 年 4 月 23 日上海文采官方发布会；不外推后续 SKU 的生产年",
      origin_country: "中国；上海文采／KACO 官方品牌语境",
      nib: "第一代公开礼盒为不锈钢 EF 明尖，标称约 0.4 mm；实际按单支、墨水和纸张",
      fill_system: "欧规墨囊与吸墨器；礼盒版本范围，配件按市场核对",
      material: "第一代公开礼盒为 PC 塑料笔身；SKY II 的 Makrolon 与黑色 Schmidt 尖不回填",
      dimensions: "公开来源未给出可外推第一代全系的统一尺寸；按实物量测",
      weight: "零售资料的 500 g 是礼盒包装，不是单支净重；不作无来源推断",
      status: "历史发布型号；具体颜色、礼盒和地区供货按日期与 SKU 核对",
    },
    "Phase 478：KACO SKY 百锋第一代与 SKY II 代际边界深化",
    "以官方发布新闻、可靠礼盒规格与专业评测复核 2016 发布节点、PC/EF/C/C 第一代锚点和 SKY II 的 Makrolon/Schmidt 升级，不混写代际。",
  ),
];

if (
  new Set(phase478FaberCastellGripHexoKacoSkyDepthPacks.map((pack) => pack.entityId)).size !==
  3
) {
  throw new Error("Phase 478 Faber-Castell/KACO packs must contain three unique entities.");
}
