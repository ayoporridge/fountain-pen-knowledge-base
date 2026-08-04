import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE99_GLIDER_ID,
  phase99ConklinHistoricPacks,
} from "./phase99-conklin-historic";
import {
  PHASE59_TRUE_UNICORN_ID,
  phase59BenuNahvalurPacks,
} from "./phase59-benu-nahvalur";
import {
  PHASE93_DESIGN07_ID,
  phase93OttoHuttDesign07Packs,
} from "./phase93-otto-hutt-design07";

export const PHASE486_IDS = {
  conklinGlider: PHASE99_GLIDER_ID,
  benuTrueUnicorn: PHASE59_TRUE_UNICORN_ID,
  ottoHuttDesign07: PHASE93_DESIGN07_ID,
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
  publishedAt?: string;
}): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url.startsWith("http") ? new URL(input.url).origin : "/",
    itemType: "web_page",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 486 exact-model depth refresh`,
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: CuratedClaim["factClass"] = "core",
  confidence = factClass === "editorial" ? 0.95 : 0.98,
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence,
    sourceKey: sourceItem.key,
    locator: sourceItem.summary,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey: sourceItem.key,
        scopeKey,
        locator: sourceItem.summary,
      },
    ],
  };
}

function basePack(entityId: string, label: string): CuratedEntityPack {
  const all = [
    ...phase99ConklinHistoricPacks,
    ...phase59BenuNahvalurPacks,
    ...phase93OttoHuttDesign07Packs,
  ];
  const pack = all.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 486 ${label} base pack is missing.`);
  return pack;
}

function refresh(
  pack: CuratedEntityPack,
  input: {
    key: string;
    markdownFile: string;
    storyTitle: string;
    primary: CuratedSource;
    extras: CuratedSource[];
    scope: CuratedScope;
    claims: CuratedClaim[];
    values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
    variants: NonNullable<CuratedEntityPack["variants"]>;
    eventTitle: string;
    eventDescription: string;
    eventType?: NonNullable<CuratedEntityPack["timeline"]>[number]["eventType"];
  },
): CuratedEntityPack {
  const aliases = [
    ...(pack.aliases ?? []),
    { alias: pack.canonicalName, language: "en", sourceKey: input.primary.key },
  ].filter(
    (alias, index, all) =>
      all.findIndex((candidate) => candidate.alias === alias.alias) === index,
  );
  const sources = [...(pack.sources ?? []), input.primary, ...input.extras].filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  const scopes = [...(pack.scopes ?? []), input.scope].filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.scopeKey === item.scopeKey) === index,
  );
  const variants = [...(pack.variants ?? []), ...input.variants].filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  return {
    ...pack,
    key: input.key,
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    aliases,
    sources,
    scopes,
    claims: [...(pack.claims ?? []), ...input.claims],
    variants,
    spec: pack.spec
      ? {
          ...pack.spec,
          values: { ...pack.spec.values, ...input.values },
          evidence: [
            ...(pack.spec.evidence ?? []),
            ...Object.keys(input.values).map((fieldKey) => ({
              key: `${input.key}-${fieldKey}-evidence`,
              fieldKey: fieldKey as SpecFieldKey,
              sourceKey: input.primary.key,
              scopeKey: input.scope.scopeKey,
              locator: input.primary.summary,
              qualifies: true,
            })),
          ],
        }
      : undefined,
    timeline: [
      ...(pack.timeline ?? []),
      {
        key: `${input.key}-current-review`,
        title: input.eventTitle,
        eventType: input.eventType ?? "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: input.eventDescription,
        sourceKey: input.primary.key,
      },
    ],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const conklinOfficial = source({
  key: "phase486-conklin-official",
  registryKey: "conklin-official-phase486",
  registryName: "Conklin official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "conklin-official-phase486",
  title: "About The Brand",
  url: "https://conklinpens.com/pages/about-us",
  summary:
    "官方品牌史区分 Toledo 旧公司、1930 年代末资产转移和 2000 年后 Yafa 复兴；现代 converter、钢尖和保固不能回填历史 Glider。",
  author: "Conklin Pens",
});
const conklinChronology = source({
  key: "phase486-conklin-glider-chronology",
  registryKey: "fountainpenit-conklin-phase486",
  registryName: "Fountain Pen.it",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountainpenit-conklin-phase486",
  title: "Conklin",
  url: "https://www.fountainpen.it/Conklin/en",
  summary:
    "品牌年表把 Glider 放在指标性的 1938–1948 窗口，并记录 1938 资产转给 Chicago 投资者、1939 转移生产语境；这些是时期线索，不是每支笔的精确制造年。",
  author: "Fountain Pen.it",
});
const conklinPenhero = source({
  key: "phase486-conklin-glider-penhero",
  registryKey: "penhero-conklin-glider-phase486",
  registryName: "PenHero",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penhero-conklin-glider-phase486",
  title: "Conklin Glider 1944-1946",
  url: "https://www.penhero.com/PenGallery/Conklin/ConklinGlider1944.htm",
  summary:
    "广告和资料呈现 1944–1946 Glider 线索，并提醒广告、清仓和库存年份不能直接等同于单支实物的首发年。",
  author: "Jim Mamoulides / PenHero",
});
const conklinSample = source({
  key: "phase486-conklin-glider-sample",
  registryKey: "peyton-street-conklin-glider-phase486",
  registryName: "Peyton Street Pens",
  sourceType: "retailer",
  tier: "contemporary_archive",
  independenceGroup: "peyton-street-conklin-glider-phase486",
  title: "Conklin Glider Green Striped restored sample",
  url: "https://www.peytonstreetpens.com/conklin-glider-fountain-pen-39-to-late-40s-green-striped-medium-fine-flexible-cushon-nib-excellent-restored.html",
  summary:
    "已修复绿条纹单支样本展示 Chicago 刻印、杠杆、新墨囊和 14K Cushon 尖；修复与尖型只代表该实物，不能外推全系。",
  author: "Peyton Street Pens",
});
const conklinCatalog = source({
  key: "phase486-conklin-catalog",
  registryKey: "conklin-catalog-phase486",
  registryName: "Conklin catalog archive",
  sourceType: "blog",
  tier: "contemporary_archive",
  independenceGroup: "conklin-catalog-phase486",
  title: "Conklin catalog 2020",
  url: "https://www.conklin.ro/cataloage1/Conklin/conklin_catalog_2020.pdf",
  summary:
    "现代目录把复兴产品和旧型号放在同一品牌叙事中；用于现代／历史边界和目录语境，不用于替代老 Glider 的杠杆、墨囊或尖型物证。",
  author: "Conklin catalog archive",
});

const benuOfficial = source({
  key: "phase486-benu-talisman-official",
  registryKey: "benu-official-phase486-talisman",
  registryName: "BENU official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "benu-official-phase486-talisman",
  title: "Talisman collection",
  url: "https://www.benupens.com/shop/collection/talisman-zodiac",
  summary:
    "BENU 官方将 Talisman 作为独立 collection，并以树脂、手工装饰和各自主题区分设计；当前 Zodiac 商品不能替代 Gourmet Pens 的 True Unicorn 联名身份。",
  author: "BENU Pens",
});
const benuSize = source({
  key: "phase486-benu-size-chart",
  registryKey: "benu-official-phase486-size",
  registryName: "BENU official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "benu-official-phase486-size",
  title: "Pen Size Comparison Chart",
  url: "https://www.benupens.com/pens-size-comparison-chart",
  summary:
    "官方尺寸图把 Briolette、Talisman 与 Euphoria 分开；用于系列边界和相对结构，不把其它 Talisman 的数值复制到 True Unicorn。",
  author: "BENU Pens",
});
const benuGourmet = source({
  key: "phase486-benu-true-unicorn-gourmet",
  registryKey: "gourmet-pens-phase486-benu",
  registryName: "Gourmet Pens",
  sourceType: "retailer",
  tier: "contemporary_archive",
  independenceGroup: "gourmet-pens-phase486-benu",
  title: "BENU Talisman True Unicorn fountain pen",
  url: "https://gourmetpensshop.com/products/benu-talisman-true-unicorn-fountain-pen-gourmet-pens-exclusive",
  summary:
    "联名商品页给出 Gourmet Pens Exclusive 身份、约 13.8 cm、21 g、可 post、#6 Schmidt、F/M/B/Flex、国际大号转换器与 Sold out 状态。",
  author: "Gourmet Pens",
});
const benuRachel = source({
  key: "phase486-benu-true-unicorn-rachel",
  registryKey: "rachel-delafuente-phase486-benu",
  registryName: "Rachel de la Fuente",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "rachel-delafuente-phase486-benu",
  title: "BENU Unicorn",
  url: "https://racheldelafuente.com/blog/pen-porn-benu-unicorn/",
  summary:
    "收藏评测记录 Unicorn 闪粉树脂、Talisman 造型和实物纹理差异；用于联名色与普通 Briolette 的边界，不外推每支颜色。",
  author: "Rachel de la Fuente",
});
const benuFpc = source({
  key: "phase486-benu-talisman-fpc",
  registryKey: "fountainpencompanion-phase486-benu",
  registryName: "Fountain Pen Companion",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountainpencompanion-phase486-benu",
  title: "BENU Talisman model record",
  url: "https://www.fountainpencompanion.com/pen_brands/19-benu/pen_models/29-talisman",
  summary:
    "型号记录以树脂、银色饰件和标准国际转换器／墨囊作为 Talisman 旁证；不能取代联名商品页的 True Unicorn 尖号、重量和库存。",
  author: "Fountain Pen Companion",
});

const ottoProject = source({
  key: "phase486-otto-design07-project",
  registryKey: "otto-hutt-official-phase486-project",
  registryName: "Otto Hutt official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "otto-hutt-official-phase486-project",
  title: "design07 project",
  url: "https://oldwww.ottohutt.com/en/projects/design07/",
  summary:
    "官方项目页把 design07 分成 sterling silver 与黄铜镀铂黑漆两条材料路线，并区分 fountain pen 与 rollerball；黑漆为两层半透明黑漆加七层透明漆。",
  author: "Otto Hutt",
});
const ottoBlackSku = source({
  key: "phase486-otto-design07-black",
  registryKey: "otto-hutt-official-phase486-black",
  registryName: "Otto Hutt official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "otto-hutt-official-phase486-black",
  title: "design07 fountain pen Schwarz transparent",
  url: "https://www.ottohutt.com/produkt/design07-fuellfederhalter-schwarz-transparent/",
  summary:
    "德文当前 SKU 列黑透明黄铜／镀铂、18K gold XL nib、EF/F/M/B、约 14 cm、约 65.6 g、converter、五支蓝色墨囊、皮套、布和证书；数值只属于该 SKU。",
  author: "Otto Hutt",
});
const ottoCategory = source({
  key: "phase486-otto-design07-category",
  registryKey: "otto-hutt-official-phase486-category",
  registryName: "Otto Hutt official",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "otto-hutt-official-phase486-category",
  title: "design07 category",
  url: "https://oldwww.ottohutt.com/product-category/designs-en/design07-en/?lang=en",
  summary:
    "官方分类页并列 silver、black transparent、PVD black 等 finish；用于当前产品线导航，不把分类名当成统一重量或统一笔尖。",
  author: "Otto Hutt",
});
const ottoPencilcase = source({
  key: "phase486-otto-design07-pencilcase",
  registryKey: "pencilcase-phase486-otto",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcase-phase486-otto",
  title: "Review: Otto Hutt Design 07 Fountain Pen",
  url: "https://www.pencilcaseblog.com/2020/08/review-otto-hutt-design-07-fountain-pen.html",
  summary:
    "镀铂黄铜灰透明漆样本约 139 mm／124 mm、约 62 g、#6 JoWo 18K 和 cartridge/converter；是样本数据，不替代当前黑透明 SKU。",
  author: "The Pencilcase Blog",
  publishedAt: "2020-08-17",
});
const ottoSbre = source({
  key: "phase486-otto-design07-sbrebrown",
  registryKey: "sbrebrown-phase486-otto",
  registryName: "SBRE Brown",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "sbrebrown-phase486-otto",
  title: "Otto Hutt Design 07 Fountain Pen Review",
  url: "https://www.sbrebrown.com/2022/09/otto-hutt-design-07-fountain-pen-review/",
  summary:
    "925 sterling silver cartridge/converter 样本约 139.4 mm／124.2 mm、套帽 162.4 mm、67.0 g；用于银质样本边界。",
  author: "SBRE Brown",
  publishedAt: "2022-09-12",
});
const ottoStationer = source({
  key: "phase486-otto-design07-stationer",
  registryKey: "gentleman-stationer-phase486-otto",
  registryName: "The Gentleman Stationer",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "gentleman-stationer-phase486-otto",
  title: "Pen Review: Otto Hutt design07",
  url: "https://www.gentlemanstationer.com/blog/2021/3/26/pen-review-otto-hutt-design07",
  summary:
    "银质样本记录明显帽重、偏好不套帽书写和银质氧化语境；属于作者样本体验，不写成所有 design07 的强制使用规则。",
  author: "The Gentleman Stationer",
  publishedAt: "2021-03-27",
});

const conklinBase = basePack(PHASE486_IDS.conklinGlider, "Conklin Glider");
const benuBase = basePack(PHASE486_IDS.benuTrueUnicorn, "BENU True Unicorn");
const ottoBase = basePack(PHASE486_IDS.ottoHuttDesign07, "Otto Hutt design07");

const conklinScope: CuratedScope = {
  key: "phase486-conklin-glider-depth-scope",
  scopeKey: "phase486-conklin-glider-depth-scope",
  productionState: "historical",
  editionScope:
    "Phase 486 Glider 深化；Chicago 时期、广告年份、杠杆上墨、笔尖与修复样本分别按证据记录，不把现代 Conklin 规格回填。",
};
const benuScope: CuratedScope = {
  key: "phase486-benu-true-unicorn-depth-scope",
  scopeKey: "phase486-benu-true-unicorn-depth-scope",
  productionState: "historical",
  editionScope:
    "Phase 486 Talisman True Unicorn 深化；联名渠道、Talisman 结构、树脂叙事与商品 SKU 分开，普通 Talisman 和 Briolette 不回填。",
};
const ottoScope: CuratedScope = {
  key: "phase486-otto-design07-depth-scope",
  scopeKey: "phase486-otto-design07-depth-scope",
  productionState: "current",
  editionScope:
    "Phase 486 design07 深化；官方黑透明 SKU、银质样本和黑漆样本保持材料与时间边界，rollerball 不混入。",
};

export const phase486ConklinGliderBenuUnicornOttoHuttDepthPacks: CuratedEntityPack[] = [
  refresh(conklinBase, {
    key: "phase486-conklin-glider-depth-v1",
    markdownFile: ".planning/content-research/conklin-glider-phase486.md",
    storyTitle: "Conklin Glider：晚期 Chicago 资料里的杠杆笔，先看实物再谈年份",
    primary: conklinPenhero,
    extras: [conklinOfficial, conklinChronology, conklinSample, conklinCatalog],
    scope: conklinScope,
    claims: [
      claim(
        conklinOfficial,
        conklinScope.scopeKey,
        "phase486-conklin-glider-brand-boundary",
        "brand_boundary",
        "官方品牌史中的 Toledo 旧公司、Chicago 晚期资产语境和 2000 年后现代复兴必须分开；现代 converter、钢尖和保固不能成为历史 Glider 的规格。",
      ),
      claim(
        conklinChronology,
        conklinScope.scopeKey,
        "phase486-conklin-glider-window",
        "historical_window",
        "Glider 可安全写作 Chicago 时期、约 1940 年代；1938–1948 是年表的指标性窗口，1944–1946 是广告线索，不为每支存世笔指定唯一首发年。",
      ),
      claim(
        conklinPenhero,
        conklinScope.scopeKey,
        "phase486-conklin-glider-ad-boundary",
        "evidence_granularity",
        "广告年份回答市场展示时间，不能直接证明制造、装配或库存流通时间；清仓广告和旧盒装必须与笔身刻印、笔尖及实物状态分开记录。",
      ),
      claim(
        conklinSample,
        conklinScope.scopeKey,
        "phase486-conklin-glider-mechanism",
        "filling_boundary",
        "Glider 的识别核心是杠杆挤压橡胶墨囊的 lever-filler 结构；J-bar、墨囊和杠杆状态必须逐支检查，不能把有杠杆等同于可立即使用。",
      ),
      claim(
        conklinSample,
        conklinScope.scopeKey,
        "phase486-conklin-glider-nib-specimen",
        "nib_boundary",
        "14K Cushon／Cushion Point 只由明确的修复样本支持；钢尖、替换尖和其它刻印可能并存，尖型、柔软度和原装状态不由 Glider 名称自动推导。",
      ),
      claim(
        conklinSample,
        conklinScope.scopeKey,
        "phase486-conklin-glider-restoration",
        "maintenance_boundary",
        "老墨囊硬化、J-bar 锈蚀、赛璐珞裂纹和笔握变形决定能否安全试写；未知状态不要强掰杠杆、热水浸泡或用通用清洗液长时间浸泡，应先让熟悉历史 lever-filler 的维修者检查。",
        "editorial",
      ),
      claim(
        conklinCatalog,
        conklinScope.scopeKey,
        "phase486-conklin-glider-modern-separation",
        "selection_boundary",
        "现代目录可以帮助读者理解 Conklin 名称的复兴，却不能将现售型号的墨囊、converter、材料和保固回填到历史 Glider；二手购买应分别核对刻印、结构、尖端与维修记录。",
      ),
    ],
    values: {
      series_name: "The Conklin Glider（Chicago 时期历史型号）",
      release_year: "约 1938–1948 的指标性窗口；1944–1946 广告线索，不指定单支制造年",
      origin_country: "美国 Conklin；Chicago 时期生产语境，具体刻印与装配按实物",
      nib: "部分样本为 14K Cushon／Cushion Point；钢尖、替换尖和尖号按实物核对",
      fill_system: "杠杆上墨、橡胶墨囊与 J-bar；墨囊和内部金属件状态按单支维修记录",
      material: "条纹赛璐珞及金属五金；颜色、帽环、褪色和缩变按实物，不建立统一材料公式",
      dimensions: "历史家族无可靠统一尺寸；以具体样本闭帽、去帽长度和笔径记录",
      weight: "无可核实全系统一克重；按样本和是否装配零件量测",
      status: "历史流通型号；现代 Conklin 复兴产品和同名复刻另立",
    },
    variants: [
      {
        key: "phase486-conklin-glider-green-restored",
        name: "绿条纹 Chicago 修复样本",
        releaseYear: "约 1939–1940 年代语境",
        notes:
          "Peyton Street 单支样本的 Chicago 刻印、杠杆、新墨囊和 14K Cushon 尖；只表示该实物，不代表所有 Glider。",
        sourceKey: conklinSample.key,
        variantKind: "market_sku",
      },
      {
        key: "phase486-conklin-glider-ad-window",
        name: "1944–1946 广告资料窗口",
        releaseYear: "1944–1946",
        notes:
          "用于历史广告和清仓线索，不作为单支笔首发年或固定颜色、尖型的证明。",
        sourceKey: conklinPenhero.key,
        variantKind: "edition_group",
      },
    ],
    eventTitle: "Phase 486：Conklin Glider 的 Chicago 年代与修复边界",
    eventDescription:
      "补足 Glider 的广告窗口、杠杆／墨囊结构、Cushon 单支样本、现代品牌分界和历史笔购买检查。",
  }),
  refresh(benuBase, {
    key: "phase486-benu-true-unicorn-depth-v1",
    markdownFile: ".planning/content-research/benu-talisman-true-unicorn-phase486.md",
    storyTitle: "BENU Talisman True Unicorn：独家树脂、可 post 与普通 Talisman 的边界",
    primary: benuGourmet,
    extras: [benuOfficial, benuSize, benuRachel, benuFpc],
    scope: benuScope,
    claims: [
      claim(
        benuGourmet,
        benuScope.scopeKey,
        "phase486-benu-unicorn-identity",
        "model_identity",
        "True Unicorn 是 Gourmet Pens Exclusive 的 BENU Talisman 联名配置；完整商品渠道、Talisman 造型和树脂配方共同构成身份，不能简写为普通 BENU Unicorn。",
      ),
      claim(
        benuOfficial,
        benuScope.scopeKey,
        "phase486-benu-unicorn-series",
        "series_boundary",
        "BENU 官方把 Talisman、Briolette 与 Euphoria 分为不同 collection；True Unicorn 继承 Talisman 语境，不继承 Briolette 的 #5 尖、不可 post 或 19–20 g 参考值。",
      ),
      claim(
        benuGourmet,
        benuScope.scopeKey,
        "phase486-benu-unicorn-spec",
        "specification_boundary",
        "联名商品页给出约 13.8 cm、21 g、旋帽可 post、#6 Schmidt F/M/B 和可选 Flex、国际大号转换器与长墨囊；重量和附件按商品 SKU 记录。",
      ),
      claim(
        benuRachel,
        benuScope.scopeKey,
        "phase486-benu-unicorn-material",
        "material_boundary",
        "闪粉树脂、色带和所谓 true unicorn root 是联名设计叙事与实物纹理差异，不是功效证明；每支浇注和切削纹理不同，普通 Talisman 图片不能冒充 True Unicorn。",
      ),
      claim(
        benuFpc,
        benuScope.scopeKey,
        "phase486-benu-unicorn-filling",
        "filling_boundary",
        "标准国际大号 converter／72 mm 长墨囊是低风险日用路径；eyedropper 只能在确认树脂、螺纹和密封后逐支测试，不把改装可能写成开箱配置。",
      ),
      claim(
        benuGourmet,
        benuScope.scopeKey,
        "phase486-benu-unicorn-stock",
        "market_boundary",
        "Sold out 只表示联名商品页在检索时无现货，不证明全球永久停产、限量数量或未来是否再版；库存、价格和二手来源应带日期保存。",
      ),
      claim(
        benuOfficial,
        benuScope.scopeKey,
        "phase486-benu-unicorn-selection",
        "selection_boundary",
        "选购应先确认 Gourmet Pens Exclusive、Talisman 造型、#6 尖与转换器，再评估闪粉纹理；希望金尖、活塞或真空大容量的人不应从独角兽主题推断不存在的配置。",
      ),
      claim(
        benuRachel,
        benuScope.scopeKey,
        "phase486-benu-unicorn-care",
        "use_and_care",
        "树脂笔以室温清水缓慢吸排、自然干燥和软布收纳为宜；避免酒精、热水、硬刷和瞬间胶，航空或高温环境携带满墨笔前先确认密封。",
        "editorial",
      ),
    ],
    values: {
      series_name: "BENU Talisman True Unicorn（Gourmet Pens Exclusive）",
      release_year: "联名限量；公开商品页未稳定给出首发年",
      origin_country: "BENU 亚美尼亚制造语境；Gourmet Pens 独家销售配置",
      nib: "Schmidt #6 不锈钢尖；商品 F/M/B，Flex 为可选 SKU，不等同于普通尖弹性",
      fill_system: "标准国际大号 converter 与 72 mm 长墨囊；eyedropper 仅为谨慎改装可能",
      material: "Talisman 多色闪粉树脂；植物粉末为联名方设计叙事，纹理随浇注和打磨变化",
      dimensions: "闭帽约 13.8 cm；旋帽可 post；其它长度和直径按实物或 SKU",
      weight: "商品页约 21 g；饰件、转换器和称量条件会造成差异",
      status: "联名／限量配置；商品页检索时 Sold out，后续库存和再版未确认",
    },
    variants: [
      {
        key: "phase486-benu-unicorn-exclusive",
        name: "Gourmet Pens Exclusive True Unicorn 联名身份复核",
        releaseYear: "联名限量",
        notes:
          "完整独家渠道和树脂身份；不能合并为普通 Talisman 颜色或 Briolette。",
        sourceKey: benuGourmet.key,
        variantKind: "edition_group",
      },
      {
        key: "phase486-benu-unicorn-flex",
        name: "Flex 尖可选 SKU（非默认尖）",
        releaseYear: "市场 SKU",
        notes:
          "Flex 是明确商品选项；普通 #6 Schmidt F/M/B 不应被描述成可压弯尖。",
        sourceKey: benuGourmet.key,
        variantKind: "nib",
      },
    ],
    eventTitle: "Phase 486：BENU True Unicorn 的联名与 Talisman 边界",
    eventDescription:
      "补足 Gourmet Pens 独家身份、Talisman／Briolette 分流、#6 尖、国际耗材、树脂叙事和 Sold out 状态。",
  }),
  refresh(ottoBase, {
    key: "phase486-otto-design07-depth-v1",
    markdownFile: ".planning/content-research/otto-hutt-design07-phase486.md",
    storyTitle: "Otto Hutt design07：把官方材料路线和当期黑漆 SKU 分开核对",
    primary: ottoBlackSku,
    extras: [ottoProject, ottoCategory, ottoPencilcase, ottoSbre, ottoStationer],
    scope: ottoScope,
    claims: [
      claim(
        ottoProject,
        ottoScope.scopeKey,
        "phase486-otto-design07-identity",
        "model_identity",
        "design07 是 Otto Hutt 独立编号的 fountain-pen design line，不是 design04 的大号或银色别名；rollerball 与 ballpoint 另属工具类型。",
      ),
      claim(
        ottoProject,
        ottoScope.scopeKey,
        "phase486-otto-design07-material",
        "material_boundary",
        "银质路线使用 sterling silver 笔杆与笔帽；黑漆路线从实心黄铜、镀铂开始，叠加两层半透明黑漆和七层透明漆。银质氧化和黑漆研磨风险不能互换。",
      ),
      claim(
        ottoBlackSku,
        ottoScope.scopeKey,
        "phase486-otto-design07-current-sku",
        "market_sku",
        "官方黑透明 SKU 列 18K gold XL nib、EF/F/M/B、约 14 cm、约 65.6 g 和 converter、五支蓝色墨囊、皮套、布与证书；这些只属于该页面的当前配置。",
      ),
      claim(
        ottoPencilcase,
        ottoScope.scopeKey,
        "phase486-otto-design07-brass-sample",
        "sample_specification",
        "镀铂黄铜灰透明漆评测样本约 139／124 mm、62 g、#6 JoWo 18K、cartridge/converter；不能拿它覆盖银质或新的黑透明 XL SKU。",
      ),
      claim(
        ottoSbre,
        ottoScope.scopeKey,
        "phase486-otto-design07-silver-sample",
        "sample_specification",
        "925 sterling silver 评测样本约 139.4／124.2 mm、套帽 162.4 mm、67.0 g；样本重量与官方黑透明 65.6 g 并列保存，不合并成单一规格。",
      ),
      claim(
        ottoStationer,
        ottoScope.scopeKey,
        "phase486-otto-design07-balance",
        "use_and_care",
        "银质评测样本帽重明显，部分作者偏好不套帽；这是样本体验而非所有人的规则。换墨用室温清水吸排，银质和漆面分别按温和方式保养。",
        "editorial",
      ),
      claim(
        ottoCategory,
        ottoScope.scopeKey,
        "phase486-otto-design07-finish",
        "version_boundary",
        "官方分类并列 silver、black transparent、PVD black 等 finish；颜色名称不能证明材质、尖型、重量或附件，需回到具体 SKU 和清楚的实物照片。",
      ),
      claim(
        ottoBlackSku,
        ottoScope.scopeKey,
        "phase486-otto-design07-filling",
        "filling_boundary",
        "design07 的公开样本和当前黑透明 SKU 都属于 cartridge/converter 路径，不是 piston 或 vacuum；converter、墨囊长度和容量按当期产品页确认。",
      ),
    ],
    values: {
      series_name: "Otto Hutt design07 fountain pen",
      release_year: "当前产品线；官方项目页和各 SKU 年份不等同于统一首发年",
      origin_country: "德国 Otto Hutt 制造语境；批次和销售地区按 SKU",
      nib: "当前黑透明 SKU：18K gold XL，EF/F/M/B；旧评测样本多见 #6 18K JoWo 双色尖，按具体笔核对",
      fill_system: "cartridge/converter；当前黑透明 SKU 随附 converter 与五支蓝色墨囊",
      material: "银质款 sterling silver；黑漆款实心黄铜镀铂、两层半透明黑漆和七层透明漆；均有 guilloché 语汇",
      dimensions: "当前黑透明约 14 cm 闭帽、12.5 cm 去帽、约 16 mm；旧样本约 139／124 mm，按 SKU",
      weight: "当前黑透明约 65.6 g；镀铂黄铜旧样本约 62 g，925 银质旧样本约 67 g",
      status: "当前 design07 线；finish、尖型、附件和库存随官方 SKU 更新",
    },
    variants: [
      {
        key: "phase486-otto-design07-black-transparent-xl",
        name: "Black transparent current XL SKU",
        releaseYear: "当前商品页",
        notes:
          "黄铜／镀铂黑透明 finish，18K gold XL nib，EF/F/M/B，约 65.6 g；含 converter、墨囊和套装附件。",
        sourceKey: ottoBlackSku.key,
        variantKind: "market_sku",
      },
      {
        key: "phase486-otto-design07-silver-sample",
        name: "Sterling silver fountain pen sample",
        releaseYear: "评测样本",
        notes:
          "925 银质笔杆与笔帽，评测约 67 g；帽重与氧化观察只代表样本。",
        sourceKey: ottoSbre.key,
        variantKind: "material",
      },
      {
        key: "phase486-otto-design07-lacquer-sample",
        name: "Platinum-plated brass lacquer sample",
        releaseYear: "评测样本",
        notes:
          "镀铂黄铜灰透明漆，评测约 62 g、#6 18K JoWo；不能覆盖当前 XL SKU。",
        sourceKey: ottoPencilcase.key,
        variantKind: "material",
      },
    ],
    eventTitle: "Phase 486：design07 当前黑透明 SKU 与历史样本分层",
    eventDescription:
      "补足官方材料工艺、黑透明 XL SKU、银质与黄铜评测差异、cartridge/converter 和重心保养边界。",
  }),
];
