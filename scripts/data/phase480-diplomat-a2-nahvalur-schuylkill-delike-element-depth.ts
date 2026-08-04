import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE83_ELOX_FALLBACK_ID,
  PHASE83_EXCELLENCE_A2_FALLBACK_ID,
  PHASE83_MOMENTO_ZERO_FALLBACK_ID,
  PHASE83_MZG_MOSAICO_FALLBACK_ID,
  phase83DiplomatLeonardoPacks,
} from "./phase83-diplomat-leonardo";
import {
  PHASE59_SCHUYLKILL_ID,
  phase59BenuNahvalurPacks,
} from "./phase59-benu-nahvalur";
import {
  PHASE72_DELIKE_ELEMENT_ID,
  phase72DelikePacks,
} from "./phase72-delike-duke-penbbs";

export const PHASE480_IDS = {
  excellenceA2: PHASE83_EXCELLENCE_A2_FALLBACK_ID,
  schuylkill: PHASE59_SCHUYLKILL_ID,
  element: PHASE72_DELIKE_ELEMENT_ID,
} as const;

const RETRIEVED = "2026-08-04";

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
    ...input,
    homepageUrl:
      input.sourceType === "official" ? new URL(input.url).origin : input.url,
    itemType: "web_page",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 480 exact-model structure, version, care or sample boundary`,
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
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "editorial" ? 0.95 : 0.98,
    sourceKey: sourceItem.key,
    locator: sourceItem.archiveLocator ?? sourceItem.summary,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey: sourceItem.key,
        scopeKey,
        locator: sourceItem.archiveLocator ?? sourceItem.summary,
      },
    ],
  };
}

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = [
    ...phase83DiplomatLeonardoPacks({
      excellenceA2: PHASE83_EXCELLENCE_A2_FALLBACK_ID,
      elox: PHASE83_ELOX_FALLBACK_ID,
      momentoZero: PHASE83_MOMENTO_ZERO_FALLBACK_ID,
      mzgMosaico: PHASE83_MZG_MOSAICO_FALLBACK_ID,
    }),
    ...phase59BenuNahvalurPacks,
    ...phase72DelikePacks(),
  ].find((candidate) => candidate.entityId === entityId && candidate.expectedType === "pen");
  if (!pack) throw new Error(`Phase 480 ${label} base pack is missing.`);
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
  const aliases = [
    ...(pack.aliases ?? []),
    { alias: pack.canonicalName, language: "en" as const, sourceKey: primary.key },
  ].filter(
    (alias, index, all) =>
      all.findIndex((candidate) => candidate.alias === alias.alias) === index,
  );
  const sourceList = [...(pack.sources ?? []), primary, ...extras].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  const scopeList = [...(pack.scopes ?? []), scope].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.scopeKey === item.scopeKey) === index,
  );
  return {
    ...pack,
    key,
    markdownFile,
    primarySourceKey: primary.key,
    aliases,
    sources: sourceList,
    scopes: scopeList,
    claims: [...(pack.claims ?? []), ...claims],
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

const a2Official = source({
  key: "phase480-diplomat-a2-current-official",
  registryKey: "diplomat-official-phase480",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "diplomat-official-phase480",
  title: "Excellence A2 Lapis Black Matt Chrome — Diplomat",
  url: "https://www.diplomat-pen.com/en/product/excellence-a2-lapis-chrome-fountain-pen/",
  summary:
    "官方当前商品页核对 A2 的 Soft Sliding Click 按压帽、黄铜、136/155/14.7 mm、47 g、不锈钢尖、converter、两支蓝色短国际墨胆和五年保修。",
  author: "Diplomat",
});
const a2Collections = source({
  key: "phase480-diplomat-collections-current",
  registryKey: "diplomat-official-phase480",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "diplomat-official-phase480",
  title: "Diplomat collections — Excellence A2 and A+",
  url: "https://www.diplomat-pen.com/en/collections/",
  summary:
    "官方集合页将 Excellence A2、A+、Aero 和 Elox 分列；支持按压帽/螺纹帽及相邻型号边界。",
  author: "Diplomat",
});
const a2Nibs = source({
  key: "phase480-diplomat-a2-nib-blocks",
  registryKey: "diplomat-official-phase480",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "diplomat-official-phase480",
  title: "Excellence A2 steel and 14 ct nib blocks — Diplomat",
  url: "https://www.diplomat-pen.com/en/product/excellence-nib-block-a2-gold-14-ct/",
  summary:
    "官方配件资料把 A2 chrome trims 钢尖与 gold trims 14K bi-colour 前段分列，提醒尖材、饰件和尖幅必须按 SKU 匹配。",
  author: "Diplomat",
});
const a2Review = source({
  key: "phase480-diplomat-a2-review",
  registryKey: "vintagenikon-a2-phase480",
  registryName: "Vintage Nikon F F2",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "vintagenikon-a2-phase480",
  title: "Review Diplomat Excellence A2 Pen",
  url: "https://www.vintagenikon.com/review-diplomat-excellence-fountain-pen",
  summary:
    "独立评测补充 Excellence 的工作笔定位、金属重量与多纸张书写观察；样本体验不替代官方 SKU 数字。",
  author: "Vintage Nikon F F2",
});
const a2Penquisition = source({
  key: "phase480-diplomat-a2-penquisition",
  registryKey: "penquisition-a2-phase480",
  registryName: "Penquisition",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penquisition-a2-phase480",
  title: "Diplomat Excellence A2 Skyline Red Fountain Pen",
  url: "https://penquisition.com/blog/2018/04/17/diplomat-excellence-a%C2%B2-skyline-red-fountain-pen",
  summary:
    "独立样本用于 Skyline 表面与握持体验交叉，不把单支颜色、重量或尖宽外推给所有 A2。",
  author: "Penquisition",
});

const schuylkillOfficial = source({
  key: "phase480-nahvalur-schuylkill-current-official",
  registryKey: "nahvalur-official-phase480",
  registryName: "Nahvalur",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "nahvalur-official-phase480",
  title: "Schuylkill Cichlid Purple — Nahvalur",
  url: "https://nahvalur.com/products/nahvalur-schuylkill-cichlid-purple",
  summary:
    "官方产品页核对 2020 Philadelphia Pen Show 首发窗口、专属树脂、差动活塞、墨窗、No.6 尖、145/131/177 mm、约 19.8 g 与 wrench。",
  author: "Nahvalur",
});
const schuylkillCollection = source({
  key: "phase480-nahvalur-schuylkill-collection",
  registryKey: "nahvalur-official-phase480",
  registryName: "Nahvalur",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "nahvalur-official-phase480",
  title: "Nahvalur Schuylkill collection",
  url: "https://nahvalur.com/collections/nahvalur-schuylkill",
  summary:
    "官方集合入口核对 Schuylkill family 导航与当代 Narwhal/Nahvalur 名称边界；集合为空不等同于历史型号不存在。",
  author: "Nahvalur",
});
const schuylkillNibsmith = source({
  key: "phase480-nahvalur-schuylkill-nibsmith",
  registryKey: "nibsmith-schuylkill-phase480",
  registryName: "Nibsmith",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "nibsmith-schuylkill-phase480",
  title: "Nahvalur Schuylkill Fountain Pen — Nibsmith",
  url: "https://nibsmith.com/product/nahvalur-schuylkill-fountain-pen-asfur-bronze/",
  summary:
    "可靠零售资料交叉确认专属树脂、活塞填充、No.6 钢尖与墨窗；具体 Asfur Bronze 颜色不回填所有年度色。",
  author: "Nibsmith",
});
const schuylkillSbre = source({
  key: "phase480-nahvalur-schuylkill-sbre",
  registryKey: "sbrebrown-schuylkill-phase480",
  registryName: "SBRE Brown",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "sbrebrown-schuylkill-phase480",
  title: "Nahvalur Schuylkill Cichlid Fountain Pen Review",
  url: "https://www.sbrebrown.com/2024/04/navhalur-schuylkill-cichlid-fountain-pen-review/",
  summary:
    "独立评测记录 Cichlid 样本的树脂、No.6 钢尖、活塞和实际书写；样本体验只作选购检查线索。",
  author: "SBRE Brown",
});
const schuylkillChalet = source({
  key: "phase480-nahvalur-schuylkill-chalet",
  registryKey: "penchalet-schuylkill-phase480",
  registryName: "Pen Chalet",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "penchalet-schuylkill-phase480",
  title: "Nahvalur (Narwhal) Schuylkill Fountain Pens",
  url: "https://www.penchalet.com/fine_pens/fountain_pens/narwhal_schuylkill_fountain_pens.html",
  summary:
    "经销商档案用于 Narwhal/Nahvalur 过渡、活塞、树脂和颜色 sibling 的交叉核对，不替代官方尺寸。",
  author: "Pen Chalet",
});

const elementStore = source({
  key: "phase480-delike-element-current-store",
  registryKey: "delike-store-phase480",
  registryName: "Moonman Pen",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "delike-store-phase480",
  title: "Delike Element Carbon Black Fine 0.5 mm",
  url: "https://moonmanpen.com/products/delike-element-fountain-pen-carbon-black-fine-nib-0-5mm",
  summary:
    "品牌销售页面用于确认 Element Carbon Black、Fine 0.5 mm 与销售版本边界；不把当前库存或包装外推到所有颜色。",
  author: "Moonman Pen",
});
const elementMarmalade = source({
  key: "phase480-delike-element-marmalade",
  registryKey: "indian-marmalade-element-phase480",
  registryName: "The Indian Marmalade Company",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "indian-marmalade-element-phase480",
  title: "The Delike Element — Pocket Pen",
  url: "https://theindianmarmaladecompany.com/2019/08/18/the-delike-element-pocket-pen/",
  summary:
    "独立评测记录实心黄铜、约 120/112/152 mm、约 10 mm、无夹、旋帽后插、converter 与写感；均限定于样本。",
  author: "Charlie Rufus",
});
const elementFpn = source({
  key: "phase480-delike-element-fpn",
  registryKey: "fpn-element-phase480",
  registryName: "Fountain Pen Network participants",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fpn-element-phase480",
  title: "Delike Element and Kaweco Lilliput discussion",
  url: "https://www.fountainpennetwork.com/forum/topic/348270-delike-tn-element-a-clone-of-the-kaweco-liliput-brass/",
  summary:
    "社区讨论只用于相似短笔和 Element/Alpha 名称边界旁证，不作为品牌官方规格或兼容性保证。",
  author: "Fountain Pen Network participants",
});
const elementFpc = source({
  key: "phase480-delike-element-fpc",
  registryKey: "fountain-pen-companion-element-phase480",
  registryName: "Fountain Pen Companion",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountain-pen-companion-element-phase480",
  title: "Delike brand catalogue",
  url: "https://www.fountainpencompanion.com/pen_brands/37-delike",
  summary:
    "型号目录用于 Element 与 Alpha、New Moon 等相邻名称的目录边界，不替代精确商品号。",
  author: "Fountain Pen Companion",
});

const diplomatBase = base(PHASE480_IDS.excellenceA2, "Diplomat Excellence A2");
const schuylkillBase = base(PHASE480_IDS.schuylkill, "Nahvalur Schuylkill");
const elementBase = base(PHASE480_IDS.element, "Delike Element");

const a2Scope: CuratedScope = {
  key: "phase480-diplomat-a2-sku-scope",
  scopeKey: "phase480-diplomat-a2-sku-scope",
  productionState: "current",
  editionScope:
    "以官方 Lapis Black Matt Chrome 钢尖 SKU 为规格锚点；A+、早期 Excellence、14K 前段、颜色和金属件作为独立版本边界。",
};
const schuylkillScope: CuratedScope = {
  key: "phase480-nahvalur-schuylkill-family-scope",
  scopeKey: "phase480-nahvalur-schuylkill-family-scope",
  productionState: "current",
  editionScope:
    "覆盖 Schuylkill 主型号、Cichlid Purple 规格锚点、年度色和 Narwhal/Nahvalur 过渡刻字；不回填 Original Plus 或 Nautilus。",
};
const elementScope: CuratedScope = {
  key: "phase480-delike-element-pocket-scope",
  scopeKey: "phase480-delike-element-pocket-scope",
  productionState: "historical",
  editionScope:
    "覆盖 Element 短黄铜旋帽结构和公开销售/评测样本；Carbon Black、原色、尖幅和 converter 配置按版本核对。",
};

export const phase480DiplomatA2NahvalurSchuylkillDelikeElementDepthPacks: CuratedEntityPack[] = [
  refresh(
    diplomatBase,
    "phase480-diplomat-excellence-a2-depth-v1",
    ".planning/content-research/diplomat-excellence-a2-phase480.md",
    a2Official,
    [a2Collections, a2Nibs, a2Review, a2Penquisition],
    a2Scope,
    [
      claim(a2Official, a2Scope.scopeKey, "phase480-a2-cap", "cap_mechanism", "Excellence A2 使用 Soft Sliding Click 按压帽；A+ 的金属螺纹帽是独立型号路线。"),
      claim(a2Official, a2Scope.scopeKey, "phase480-a2-brass", "material_boundary", "官方 Lapis Black Matt Chrome 钢尖 SKU 的笔身为黄铜，47 g 只锚定该表面、尖材和商品配置。"),
      claim(a2Nibs, a2Scope.scopeKey, "phase480-a2-nib-block", "nib_configuration", "A2 chrome trims 的钢尖与 gold trims 的 14K bi-colour nib block 分列，尖幅和金属件需按 SKU 匹配。"),
      claim(a2Review, a2Scope.scopeKey, "phase480-a2-writing", "writing_context", "独立评测将 Excellence 视作具有工作笔重量感的日用路线；样本体验不替代官方尺寸和售后条款.", "editorial"),
      claim(a2Official, a2Scope.scopeKey, "phase480-a2-filling", "filling_boundary", "官方 Lapis SKU 随附 converter 与两支蓝色短国际墨胆；上墨方式不改写为活塞或真空。"),
      claim(a2Penquisition, a2Scope.scopeKey, "phase480-a2-selection", "selection_boundary", "Skyline 样本的表面、重量和手感只用于选购核验线索，不外推所有 A2 颜色。", "editorial"),
    ],
    {
      series_name: "Diplomat Excellence A2",
      dimensions: "官方 Lapis 锚点：闭帽约 136 mm、帽后插约 155 mm、直径约 14.7 mm",
      weight: "官方 Lapis 锚点约 47 g；其他表面、尖材和套装按 SKU",
      nib: "不锈钢 EF/F/M/B；A2 gold trims 另有 14K bi-colour nib block",
      fill_system: "converter 或短国际墨胆",
      status: "官方 collection 与 exact product page 可见；地区库存按 SKU",
    },
    "Phase 480：Diplomat Excellence A2 当前 SKU 与 A+ 边界复核",
    "把按压帽、黄铜 Lapis 锚点、尖材前段和办公书写取舍放回 A2 canonical 页面。",
  ),
  refresh(
    schuylkillBase,
    "phase480-nahvalur-schuylkill-depth-v1",
    ".planning/content-research/nahvalur-schuylkill-phase480.md",
    schuylkillOfficial,
    [schuylkillCollection, schuylkillNibsmith, schuylkillSbre, schuylkillChalet],
    schuylkillScope,
    [
      claim(schuylkillOfficial, schuylkillScope.scopeKey, "phase480-schuylkill-launch", "series_history", "Schuylkill 官方资料将系列首发放在 2020 Philadelphia Pen Show，名称来自费城 Schuylkill 河。"),
      claim(schuylkillOfficial, schuylkillScope.scopeKey, "phase480-schuylkill-fill", "fill_system", "Schuylkill 使用差动 piston filling 和可视墨窗，只从瓶装墨吸取；Original Plus 的 vacuum 路线不回填。"),
      claim(schuylkillOfficial, schuylkillScope.scopeKey, "phase480-schuylkill-spec", "platform_spec", "Cichlid Purple 官方锚点约为 145/131/177 mm、笔杆约 13 mm、空笔约 19.8 g。"),
      claim(schuylkillNibsmith, schuylkillScope.scopeKey, "phase480-schuylkill-nib", "nib_boundary", "可靠零售资料将 Schuylkill 归入 No.6 钢尖、专属树脂和墨窗路线；尖幅按具体 SKU。"),
      claim(schuylkillSbre, schuylkillScope.scopeKey, "phase480-schuylkill-sample", "sample_scope", "独立评测的 Cichlid 树脂、活塞和写感仅绑定该样本，不能推成所有年度色的质量结论。", "editorial"),
      claim(schuylkillChalet, schuylkillScope.scopeKey, "phase480-schuylkill-name", "brand_alias_boundary", "Narwhal 与 Nahvalur 刻字可在改名过渡库存中并存；不是第二笔型。"),
    ],
    {
      series_name: "Nahvalur Schuylkill（原 Narwhal）",
      release_year: "2020 Philadelphia Pen Show 首发；年度色按 SKU",
      fill_system: "差动 piston filling，仅瓶装墨；带可视墨窗",
      dimensions: "Cichlid Purple 参考：闭帽约 145 mm、去帽约 131 mm、帽后插约 177 mm",
      weight: "Cichlid Purple 空笔约 19.8 g；其他饰件和批次不共用定值",
      status: "年度色 family；颜色、刻字和库存按年份/市场核对",
    },
    "Phase 480：Nahvalur Schuylkill 活塞、墨窗与年度色复核",
    "把 Schuylkill 的专属树脂、活塞、No.6 尖和 Narwhal/Nahvalur 过渡边界集中到同一 canonical 页面。",
  ),
  refresh(
    elementBase,
    "phase480-delike-element-depth-v1",
    ".planning/content-research/delike-element-phase480.md",
    elementStore,
    [elementMarmalade, elementFpn, elementFpc],
    elementScope,
    [
      claim(elementStore, elementScope.scopeKey, "phase480-element-sku", "model_identity", "Element Carbon Black Fine 0.5 mm 是销售页核对的具体版本；不能以卖家泛称替代 Element 身份。"),
      claim(elementMarmalade, elementScope.scopeKey, "phase480-element-brass", "material_and_shape", "独立样本记录实心黄铜、无夹、旋帽和可后插，约 120/112/152 mm 与约 10 mm。"),
      claim(elementMarmalade, elementScope.scopeKey, "phase480-element-fill", "filling_boundary", "独立样本使用 Platinum-style converter；接口和配件不外推所有销售版本。"),
      claim(elementMarmalade, elementScope.scopeKey, "phase480-element-writing", "writing_context", "独立样本记录帖帽/不帖帽都能书写，但后插会改变重心，写感仅作样本观察。", "editorial"),
      claim(elementFpn, elementScope.scopeKey, "phase480-element-neighbor", "identity_boundary", "社区资料把 Element 与 Kaweco Lilliput、Delike Alpha 等相似短笔放在比较语境，不能共用品牌和零件。"),
      claim(elementFpc, elementScope.scopeKey, "phase480-element-catalog", "catalog_boundary", "型号目录用于 Element 与 Alpha、New Moon 等名称边界；颜色和涂层不能自动新建型号。"),
    ],
    {
      series_name: "Delike Element",
      nib: "Carbon Black 销售版本 Fine 0.5 mm；其他尖幅按 SKU",
      fill_system: "独立样本使用 Platinum-style converter；配件与接口不可外推",
      material: "实心黄铜；裸黄铜、涂层与表面变化按版本",
      dimensions: "样本参考：闭帽约 120 mm、无帽约 112 mm、后插约 152 mm、直径约 10 mm",
      weight: "Carbon Black 销售版本约 44 g；其他表面和套装不共用定值",
      status: "资料可核对的流通型号；当前库存和售后按商品页",
    },
    "Phase 480：Delike Element 黄铜口袋结构复核",
    "把 Element 的无夹、黄铜、旋帽后插、converter 和相邻型号边界集中到 canonical 页面。",
  ),
];
