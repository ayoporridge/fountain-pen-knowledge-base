import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE428_BRAND_IDS,
  phase428BrandDepthRefreshPacks,
} from "./phase428-brand-depth-refresh";

export const PHASE588_PINEIDER_BRAND_ID = PHASE428_BRAND_IDS.pineider;

export const PHASE588_IDS = {
  arco: "phase588-pineider-arco",
  rock: "phase588-pineider-rock",
} as const;

export const PHASE588_SLUGS = {
  arco: "pineider-arco-fountain-pen",
  rock: "pineider-rock-fountain-pen",
} as const;

const RETRIEVED = "2026-08-11";

function web(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
  > & { locator: string },
): CuratedSource {
  const { locator, ...source } = input;
  return {
    ...source,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

function pineiderOfficial(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  publishedAt?: string;
}): CuratedSource {
  return web({
    ...input,
    registryKey: "pineider-official-phase588",
    registryName: "Pineider 1774",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pineider-official",
    homepageUrl: "https://www.pineider.com/",
    author: "Pineider 1774",
  });
}

function editorial(
  key: "arco" | "rock",
  title: string,
): CuratedSource {
  const localPath = `/images/library/site-original/phase588/pineider/pineider-${key}.svg`;
  return {
    key: `phase588-pineider-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase588-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase588-${key}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复刻品牌标识、真实树脂纹理、颜色、笔夹、机构剖面或比例。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
) {
  return {
    fieldKey,
    key,
    sourceKey,
    scopeKey,
    locator,
    qualifies,
  };
}

const common = {
  collections: pineiderOfficial({
    key: "phase588-pineider-writing-collections",
    title: "Pineider Writing Instruments Collections",
    url: "https://www.pineider.com/en/pens/collections",
    summary:
      "Pineider 当前书写工具集合把 Avatar UR、Arco、Rock 等作为各自产品线展示，不能跨系列继承尖、上墨或材料。",
    locator:
      "current writing-instrument collection navigation, including separate Avatar, Arco and Rock families",
  }),
  story: pineiderOfficial({
    key: "phase588-pineider-story",
    title: "Pineider: Discover the story",
    url: "https://www.pineider.com/en/discover-the-story",
    summary:
      "官方品牌故事从 1774 年佛罗伦萨的纸品与文具传统展开；该日期只作为品牌历史，不替代现代型号证据。",
    locator:
      "brand history beginning in Florence in 1774 and continuing through paper, stationery and writing culture",
  }),
  giftGuide: pineiderOfficial({
    key: "phase588-pineider-graduation-gift-guide",
    title: "Best personalized graduation gift pens",
    url: "https://magazine.pineider.com/en/best-personalized-graduation-gift-pens/",
    summary:
      "Pineider 自家礼赠文章描述 Arco Oak 的层叠色调，并把 Rock 写为车制树脂、No.6 钢尖和 converter；Rock 上墨说法与当前商品页冲突。",
    locator:
      "Arco Oak layered dark/light brown, gold and mother-of-pearl tones; Rock turned resin, No.6 steel nib and converter filling",
  }),
};

const arco = {
  official: pineiderOfficial({
    key: "phase588-pineider-arco-oak-official",
    title: "Pineider Arco Oak Fountain Pen",
    url: "https://www.pineider.com/en/products/arco-oak-fountain-pen-617",
    summary:
      "当前 Oak 商品页确认 Arco Fountain Pen、Model PP5901／617、EF/F/S/M/B、142 mm、直径 15.5 mm、Italy 与特殊材料产品线。",
    locator:
      "current product identity PP5901/617; EF/F/S/M/B selector; 142 mm length; 15.5 mm diameter; Origin Italy",
  }),
  collection: pineiderOfficial({
    key: "phase588-pineider-arco-collection",
    title: "Pineider Arco collection",
    url: "https://www.pineider.com/en/pens/collections/arco",
    summary:
      "当前 Arco collection 展示 Oak、Blue Bee、Desert Beetle、Firefox、Rainbow 等视觉版本；颜色名称不自动等于统一机械规格。",
    locator:
      "current Arco collection cards and distinct named material or colour variants",
  }),
  pencilcase: web({
    key: "phase588-pineider-arco-pencilcase-2019",
    registryKey: "pencilcaseblog-phase588-pineider-arco",
    registryName: "The Pencilcase Blog",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pencilcaseblog",
    title: "Review: Pineider La Grande Bellezza Arco",
    url: "https://www.pencilcaseblog.com/2019/10/review-pineider-la-grande-bellezza-arco.html",
    homepageUrl: "https://www.pencilcaseblog.com/",
    author: "Dries De Schepper",
    publishedAt: "2019-10-08",
    summary:
      "具名作者披露 Oak 借测样笔，记录层叠树脂并非 OMAS celluloid、磁吸帽、墨窗、活塞、14K Quill M、142/130 mm、42 g 与 888 支限量。",
    locator:
      "loan disclosure and reviewed Oak sample: Pineider layered resin rather than OMAS celluloid; magnetic cap, piston, ink window, 14K Quill M, 142 mm capped, 130 mm uncapped, 42 g and 888 pieces",
  }),
  penChalet: web({
    key: "phase588-pineider-arco-penchalet-2020",
    registryKey: "pen-chalet-phase588-pineider-arco",
    registryName: "Pen Chalet",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-chalet",
    title: "Pineider Arco Fountain Pen Review",
    url: "https://www.penchalet.com/blog/pineider-arco-fountain-pen-review/",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    publishedAt: "2020-01-28",
    summary:
      "有日期的专业零售评测交叉记录当时 Arco Oak 的磁吸帽、活塞、墨窗、14K 金尖与 888 支编号版。",
    locator:
      "dated review of the then-current numbered Arco: magnetic cap, piston filling, ink window, 14K gold nib and 888-piece edition",
  }),
  diagram: editorial(
    "arco",
    "Pineider Arco 当前身份、2019 Oak 与材料边界示意",
  ),
};

const rock = {
  official: pineiderOfficial({
    key: "phase588-pineider-rock-official",
    title: "Pineider Rock Fountain Pen",
    url: "https://www.pineider.com/en/products/rock-fountain-pen-426",
    summary:
      "当前商品页确认 Rock Fountain Pen、Model PP4901／426、车制树脂、钢尖、磁吸帽、活塞、142 mm、直径 15.5 mm 与 Italy。",
    locator:
      "current product PP4901/426: turned resin, steel nib, magnetic closure, piston filling system, 142 mm, 15.5 mm diameter and Origin Italy",
  }),
  collection: pineiderOfficial({
    key: "phase588-pineider-rock-collection",
    title: "Pineider Rock collection",
    url: "https://www.pineider.com/en/pens/collections/rock",
    summary:
      "当前 Rock collection 汇总多个颜色与饰件 SKU；颜色和库存不能替代上墨机构及完整商品代码。",
    locator: "current Rock collection navigation and colour/SKU cards",
  }),
  penChalet: web({
    key: "phase588-pineider-rock-penchalet",
    registryKey: "pen-chalet-phase588-pineider-rock",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "pen-chalet",
    title: "Pineider La Grande Bellezza Rocco / Rock Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/pineider_la_grande_beleza_rocco__fountain_pens.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary:
      "专业零售档案把 Rocco／Rock new release 写为活塞、墨窗、黑色镀层不锈钢尖、磁吸帽，并给 141.7/130/165.1 mm 与 37.42 g。",
    locator:
      "new-release piston filling system, ink window, black-plated stainless steel nib, magnetic snap cap, 141.7 mm capped, 130 mm body, 165.1 mm posted and 37.42 g",
  }),
  diagram: editorial(
    "rock",
    "Pineider Rock 当前活塞与旧 converter 文案冲突示意",
  ),
};

const arcoCurrent = "phase588-pineider-arco-current-pp5901-617";
const arcoOak2019 = "phase588-pineider-arco-oak-sample-2019";

export const phase588PineiderArcoPack: CuratedEntityPack = {
  key: "phase588-pineider-arco-v1",
  entityId: PHASE588_IDS.arco,
  expectedType: "pen",
  expectedSlug: PHASE588_SLUGS.arco,
  canonicalName: "Pineider Arco Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pineider-arco-phase588.md",
  storyTitle: "Pineider Arco：当前 family 与 2019 Oak 样本分开",
  primarySourceKey: arco.official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Arco",
      language: "en",
      sourceKey: arco.official.key,
    },
    {
      alias: "Pineider La Grande Bellezza Arco",
      language: "en",
      sourceKey: arco.pencilcase.key,
    },
    {
      alias: "Pineider Arco Oak",
      language: "en",
      sourceKey: arco.official.key,
    },
    {
      alias: "皮内德 Arco 钢笔",
      language: "zh",
      sourceKey: arco.official.key,
    },
  ],
  sources: [
    arco.official,
    arco.collection,
    common.giftGuide,
    arco.pencilcase,
    arco.penChalet,
    common.collections,
    arco.diagram,
  ],
  scopes: [
    {
      key: arcoCurrent,
      scopeKey: arcoCurrent,
      market: "current global Oak product and Arco collection",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Current PP5901/617 selector lists EF/F/S/M/B; the current page does not state nib metal, so the 2019 14K Quill sample is not inherited.",
      materialScope:
        "Pineider layered Arco resin/special-material scope; it is not OMAS Arco celluloid and exact colour composition remains SKU-specific.",
      editionScope:
        "Oak, Blue Bee, Desert Beetle, Firefox and Rainbow remain variants; 888 pieces belongs only to the documented 2019 Oak edition.",
    },
    {
      key: arcoOak2019,
      scopeKey: arcoOak2019,
      market: "2019-2020 reviewed Oak edition",
      validFrom: "2019-10-08",
      validTo: "2020-01-28",
      productionState: "historical",
      nibScope:
        "Reviewed Oak sample used a 14K Quill M nib with bounce and limited line variation; it was not a full-flex nib.",
      materialScope:
        "Layered Pineider resin with metal section; explicitly distinct from OMAS Arco bronze celluloid.",
      editionScope:
        "Piston, ink window, magnetic cap, 42 g and 888-piece numbering bind only to the documented Oak generation.",
    },
  ],
  claims: [
    {
      key: "phase588-pineider-arco-identity",
      predicate: "model_identity",
      objectText:
        "Pineider Arco Fountain Pen is anchored to current Oak product PP5901/617; other Arco colours are variants, while non-fountain writing modes remain separate products.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: arco.official.key,
      locator: arco.official.summary,
      evidence: [
        {
          key: "phase588-pineider-arco-identity-evidence",
          sourceKey: arco.official.key,
          scopeKey: arcoCurrent,
          locator: arco.official.summary,
        },
      ],
    },
    {
      key: "phase588-pineider-arco-material-boundary",
      predicate: "material_boundary",
      objectText:
        "The documented Pineider layered Arco resin must not be catalogued as OMAS Arco celluloid.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: arco.pencilcase.key,
      locator: arco.pencilcase.summary,
      evidence: [
        {
          key: "phase588-pineider-arco-material-boundary-evidence",
          sourceKey: arco.pencilcase.key,
          scopeKey: arcoOak2019,
          locator: arco.pencilcase.summary,
        },
      ],
    },
    {
      key: "phase588-pineider-arco-generation-boundary",
      predicate: "version_boundary",
      objectText:
        "The 2019 Oak sample's 14K Quill nib, piston, 42 g and 888-piece count do not define every current Arco colour or SKU.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: arco.pencilcase.key,
      locator: arco.pencilcase.summary,
      evidence: [
        {
          key: "phase588-pineider-arco-generation-boundary-evidence",
          sourceKey: arco.pencilcase.key,
          scopeKey: arcoOak2019,
          locator: arco.pencilcase.summary,
        },
        {
          key: "phase588-pineider-arco-current-selector-evidence",
          sourceKey: arco.official.key,
          scopeKey: arcoCurrent,
          locator: arco.official.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase588-pineider-arco-oak-current",
      name: "Arco Oak PP5901 / 617",
      notes:
        "Current exact product anchor; current page supplies identity, nib-width selector and dimensions, but does not restate nib metal, fill system or weight.",
      sourceKey: arco.official.key,
      variantKind: "market_sku",
      productCode: "PP5901 / 617",
      market: "global",
    },
    {
      key: "phase588-pineider-arco-current-colour-family",
      name: "Blue Bee / Desert Beetle / Firefox / Rainbow",
      notes:
        "Current collection names; each exact product must be checked before inheriting Oak's nib, fill, weight or edition count.",
      sourceKey: arco.collection.key,
      variantKind: "color",
      market: "global",
    },
    {
      key: "phase588-pineider-arco-oak-2019-edition",
      name: "2019 La Grande Bellezza Arco Oak sample generation",
      releaseYear: "2019",
      notes:
        "Reviewed 14K Quill, piston, magnetic-cap, 42 g and 888-piece configuration; retained as a historical sample scope.",
      sourceKey: arco.pencilcase.key,
      variantKind: "edition_group",
    },
  ],
  spec: {
    brandEntityId: PHASE588_PINEIDER_BRAND_ID,
    values: {
      series_name: "Pineider Arco Fountain Pen",
      release_year:
        "2019 Oak edition documented; current PP5901/617 verified 2026-08-11 without a universal family launch date",
      origin_country: "Italy for current PP5901/617 product scope",
      nib: "Current PP5901/617: EF/F/S/M/B selector, nib metal unstated; documented 2019 Oak sample: 14K Quill M",
      fill_system:
        "Documented 2019 Oak sample: piston with ink window; current PP5901/617 page does not restate filling system",
      material:
        "Pineider layered Arco resin/special material by exact SKU; not OMAS Arco celluloid",
      dimensions:
        "Current PP5901/617: 142 mm length, 15.5 mm diameter; 2019 Oak sample about 130 mm uncapped",
      weight: "Documented 2019 Oak sample: about 42 g; not universal current-family data",
      status:
        "Current Arco collection and PP5901/617 product verified 2026-08-11; stock and colour availability vary",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase588-arco-spec-brand",
        arco.official.key,
        arcoCurrent,
        "official Pineider product identity",
      ),
      specEvidence(
        "series_name",
        "phase588-arco-spec-series",
        arco.official.key,
        arcoCurrent,
        "exact Arco Fountain Pen title and PP5901/617 model",
      ),
      specEvidence(
        "release_year",
        "phase588-arco-spec-release",
        arco.pencilcase.key,
        arcoOak2019,
        "dated 2019 reviewed Oak edition; not a universal launch date",
      ),
      specEvidence(
        "origin_country",
        "phase588-arco-spec-origin",
        arco.official.key,
        arcoCurrent,
        "current product Origin Italy",
      ),
      specEvidence(
        "nib",
        "phase588-arco-spec-nib-current",
        arco.official.key,
        arcoCurrent,
        "current EF/F/S/M/B selector without published nib metal",
      ),
      specEvidence(
        "nib",
        "phase588-arco-spec-nib-2019",
        arco.pencilcase.key,
        arcoOak2019,
        "reviewed 2019 Oak 14K Quill M sample",
      ),
      specEvidence(
        "fill_system",
        "phase588-arco-spec-fill-2019",
        arco.pencilcase.key,
        arcoOak2019,
        "reviewed piston and ink-window configuration",
      ),
      specEvidence(
        "fill_system",
        "phase588-arco-reject-current-fill-inference",
        arco.official.key,
        arcoCurrent,
        "current page does not restate filling system",
        false,
      ),
      specEvidence(
        "material",
        "phase588-arco-spec-material",
        common.giftGuide.key,
        arcoCurrent,
        "official Oak layered dark/light brown, gold and mother-of-pearl colour description",
      ),
      specEvidence(
        "material",
        "phase588-arco-spec-not-omas-celluloid",
        arco.pencilcase.key,
        arcoOak2019,
        "review distinguishes Pineider layered resin from OMAS Arco celluloid",
      ),
      specEvidence(
        "dimensions",
        "phase588-arco-spec-dimensions",
        arco.official.key,
        arcoCurrent,
        "current 142 mm by 15.5 mm product dimensions",
      ),
      specEvidence(
        "weight",
        "phase588-arco-spec-weight",
        arco.pencilcase.key,
        arcoOak2019,
        "reviewed Oak sample 42 g",
      ),
      specEvidence(
        "status",
        "phase588-arco-spec-status",
        arco.official.key,
        arcoCurrent,
        "current exact product and collection retrieval window",
      ),
    ],
  },
  timeline: [
    {
      key: "phase588-pineider-arco-2019-sample",
      title: "Arco Oak reviewed edition documented",
      eventType: "design_milestone",
      startDate: "2019-10-08",
      circa: false,
      description:
        "The dated loan-sample review establishes the 2019 Oak generation, not a universal Arco family launch date.",
      sourceKey: arco.pencilcase.key,
    },
    {
      key: "phase588-pineider-arco-current-verified",
      title: "Current PP5901/617 product verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "The exact current Oak identity, selector and dimensions were verified; retrieval date is not a launch date.",
      sourceKey: arco.official.key,
    },
  ],
  conflicts: [
    {
      key: "phase588-pineider-arco-generation-spec-boundary",
      fieldKey: "nib",
      scopeKey: arcoCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Current PP5901/617 publishes nib widths but not nib metal; the 2019 Oak 14K Quill sample remains historical and is not projected across the current collection.",
      members: [
        {
          citationKey: "phase588-arco-spec-nib-current",
          assertedValue: "current EF/F/S/M/B selector; nib metal unstated",
        },
        {
          citationKey: "phase588-arco-spec-nib-2019",
          assertedValue: "2019 reviewed Oak sample used a 14K Quill M nib",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase588-pineider-arco-primary",
      title: "Pineider Arco 当前身份与历史样本边界图（非产品照片）",
      sourceKey: arco.diagram.key,
      localPath: arco.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、纹理、比例、商标、笔尖、编号或库存。",
      sourceUrl: arco.diagram.url,
      usageStatus: "primary",
    },
  ],
};

const rockCurrent = "phase588-pineider-rock-current-pp4901-426";
const rockGiftGuide = "phase588-pineider-rock-gift-guide-converter";

export const phase588PineiderRockPack: CuratedEntityPack = {
  key: "phase588-pineider-rock-v1",
  entityId: PHASE588_IDS.rock,
  expectedType: "pen",
  expectedSlug: PHASE588_SLUGS.rock,
  canonicalName: "Pineider Rock Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pineider-rock-phase588.md",
  storyTitle: "Pineider Rock：当前活塞版与旧 converter 文案分开",
  primarySourceKey: rock.official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Rock",
      language: "en",
      sourceKey: rock.official.key,
    },
    {
      alias: "Pineider Rocco",
      language: "en",
      sourceKey: rock.penChalet.key,
    },
    {
      alias: "Pineider La Grande Bellezza Rock",
      language: "en",
      sourceKey: rock.penChalet.key,
    },
    {
      alias: "Pineider La Grande Bellezza Rocco",
      language: "en",
      sourceKey: rock.penChalet.key,
    },
    {
      alias: "皮内德 Rock 钢笔",
      language: "zh",
      sourceKey: rock.official.key,
    },
  ],
  sources: [
    rock.official,
    rock.collection,
    common.giftGuide,
    rock.penChalet,
    common.collections,
    rock.diagram,
  ],
  scopes: [
    {
      key: rockCurrent,
      scopeKey: rockCurrent,
      market: "current global PP4901/426 product",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Current exact product states steel nib; Pen Chalet cross-checks a black-plated stainless-steel nib. Width and plating remain exact-SKU choices.",
      materialScope:
        "Turned resin body with metal section in the professional retail record; colours and trim remain SKU-specific.",
      editionScope:
        "Current PP4901/426 and Pen Chalet's new release use a piston; colour alone cannot identify the mechanism.",
    },
    {
      key: rockGiftGuide,
      scopeKey: rockGiftGuide,
      market: "undated Pineider gift-guide copy",
      productionState: "historical",
      nibScope: "Gift guide states a No.6 steel nib.",
      materialScope: "Gift guide states turned resin and lists a colour family.",
      editionScope:
        "Gift-guide converter wording conflicts with the current exact product and independently catalogued new-release piston; retained as non-current evidence.",
    },
  ],
  claims: [
    {
      key: "phase588-pineider-rock-identity",
      predicate: "model_identity",
      objectText:
        "Pineider Rock Fountain Pen is anchored to current exact product PP4901/426; Rocco is retained as a retail spelling alias rather than a second entity.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: rock.official.key,
      locator: rock.official.summary,
      evidence: [
        {
          key: "phase588-pineider-rock-identity-evidence",
          sourceKey: rock.official.key,
          scopeKey: rockCurrent,
          locator: rock.official.summary,
        },
        {
          key: "phase588-pineider-rock-rocco-alias-evidence",
          sourceKey: rock.penChalet.key,
          scopeKey: rockCurrent,
          locator: rock.penChalet.summary,
        },
      ],
    },
    {
      key: "phase588-pineider-rock-current-configuration",
      predicate: "current_configuration",
      objectText:
        "The current PP4901/426 configuration is turned resin, steel nib, magnetic closure and piston filling, independently cross-checked by a professional retail record of the new release.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: rock.official.key,
      locator: rock.official.summary,
      evidence: [
        {
          key: "phase588-pineider-rock-current-official-evidence",
          sourceKey: rock.official.key,
          scopeKey: rockCurrent,
          locator: rock.official.summary,
        },
        {
          key: "phase588-pineider-rock-current-retail-evidence",
          sourceKey: rock.penChalet.key,
          scopeKey: rockCurrent,
          locator: rock.penChalet.summary,
        },
      ],
    },
    {
      key: "phase588-pineider-rock-fill-conflict-boundary",
      predicate: "version_boundary",
      objectText:
        "Pineider's undated gift-guide converter wording is preserved as a conflicting older or ambiguous configuration and does not qualify the current PP4901/426 fill-system field.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.giftGuide.key,
      locator: common.giftGuide.summary,
      evidence: [
        {
          key: "phase588-pineider-rock-gift-guide-conflict-evidence",
          sourceKey: common.giftGuide.key,
          scopeKey: rockGiftGuide,
          locator: common.giftGuide.summary,
        },
        {
          key: "phase588-pineider-rock-current-resolution-evidence",
          sourceKey: rock.official.key,
          scopeKey: rockCurrent,
          locator: rock.official.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase588-pineider-rock-current-product",
      name: "Rock PP4901 / 426 current piston configuration",
      notes:
        "Current exact-product identity; steel nib, magnetic closure and piston filling. Colour/SKU availability is retrieval-window data.",
      sourceKey: rock.official.key,
      variantKind: "market_sku",
      productCode: "PP4901 / 426",
      market: "global",
    },
    {
      key: "phase588-pineider-rock-colour-family",
      name: "Rock colour and trim variants",
      notes:
        "Collection cards and the gift guide list multiple colours; colour alone does not prove piston or converter configuration.",
      sourceKey: rock.collection.key,
      variantKind: "color",
      market: "global",
    },
    {
      key: "phase588-pineider-rock-converter-copy",
      name: "Gift-guide converter configuration",
      notes:
        "Official but undated conflicting copy; retained for identification and rejected as evidence for the current PP4901/426 fill-system field.",
      sourceKey: common.giftGuide.key,
      variantKind: "edition_group",
    },
  ],
  spec: {
    brandEntityId: PHASE588_PINEIDER_BRAND_ID,
    values: {
      series_name: "Pineider Rock Fountain Pen",
      release_year:
        "Current PP4901/426 verified 2026-08-11; no universal launch year asserted",
      origin_country: "Italy for current PP4901/426 product scope",
      nib: "Current steel nib; professional retail record specifies black-plated stainless steel; width by exact SKU",
      fill_system:
        "Current PP4901/426 and independently catalogued new release: piston with ink window; undated gift-guide converter wording rejected for current scope",
      material:
        "Turned resin body by exact colour SKU; professional retail record also identifies a metal section",
      dimensions:
        "Official current: 142 mm length, 15.5 mm diameter; retail record: about 141.7 mm capped, 130 mm body, 165.1 mm posted",
      weight:
        "Professional retail record: about 37.42 g for its catalogued version; not universal historical data",
      status:
        "Current PP4901/426 and Rock collection verified 2026-08-11; stock and discounts vary",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase588-rock-spec-brand",
        rock.official.key,
        rockCurrent,
        "official Pineider product identity",
      ),
      specEvidence(
        "series_name",
        "phase588-rock-spec-series",
        rock.official.key,
        rockCurrent,
        "exact Rock Fountain Pen title and PP4901/426 model",
      ),
      specEvidence(
        "release_year",
        "phase588-rock-spec-release",
        rock.official.key,
        rockCurrent,
        "current retrieval window, not a launch date",
      ),
      specEvidence(
        "origin_country",
        "phase588-rock-spec-origin",
        rock.official.key,
        rockCurrent,
        "current product Origin Italy",
      ),
      specEvidence(
        "nib",
        "phase588-rock-spec-nib-official",
        rock.official.key,
        rockCurrent,
        "current exact product steel nib",
      ),
      specEvidence(
        "nib",
        "phase588-rock-spec-nib-retail",
        rock.penChalet.key,
        rockCurrent,
        "professional retail record black-plated stainless-steel nib",
      ),
      specEvidence(
        "fill_system",
        "phase588-rock-spec-fill-official",
        rock.official.key,
        rockCurrent,
        "current exact product piston filling system",
      ),
      specEvidence(
        "fill_system",
        "phase588-rock-spec-fill-retail",
        rock.penChalet.key,
        rockCurrent,
        "new-release piston filling system and ink window",
      ),
      specEvidence(
        "fill_system",
        "phase588-rock-rejected-gift-guide-converter",
        common.giftGuide.key,
        rockGiftGuide,
        "undated official gift-guide converter wording conflicts with current exact product",
        false,
      ),
      specEvidence(
        "material",
        "phase588-rock-spec-material",
        rock.official.key,
        rockCurrent,
        "current turned-resin product",
      ),
      specEvidence(
        "dimensions",
        "phase588-rock-spec-dimensions-official",
        rock.official.key,
        rockCurrent,
        "current 142 mm by 15.5 mm product dimensions",
      ),
      specEvidence(
        "dimensions",
        "phase588-rock-spec-dimensions-retail",
        rock.penChalet.key,
        rockCurrent,
        "professional retail record capped/body/posted measurements",
      ),
      specEvidence(
        "weight",
        "phase588-rock-spec-weight",
        rock.penChalet.key,
        rockCurrent,
        "professional retail record 37.42 g",
      ),
      specEvidence(
        "status",
        "phase588-rock-spec-status",
        rock.official.key,
        rockCurrent,
        "current exact product and collection retrieval window",
      ),
    ],
  },
  timeline: [
    {
      key: "phase588-pineider-rock-current-verified",
      title: "Current PP4901/426 product verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "The exact current product and independent new-release piston record were verified; retrieval date is not a launch date.",
      sourceKey: rock.official.key,
    },
  ],
  conflicts: [
    {
      key: "phase588-pineider-rock-fill-system-conflict",
      fieldKey: "fill_system",
      scopeKey: rockCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The current exact PP4901/426 page and an independent professional retail record of the new release both state piston filling, so piston qualifies for the current field. The undated Pineider gift-guide converter statement is retained as older, alternate or erroneous copy and is nonqualifying for current scope.",
      members: [
        {
          citationKey: "phase588-rock-spec-fill-official",
          assertedValue: "current exact PP4901/426: piston filling system",
        },
        {
          citationKey: "phase588-rock-spec-fill-retail",
          assertedValue: "independent new-release record: piston with ink window",
        },
        {
          citationKey: "phase588-rock-rejected-gift-guide-converter",
          assertedValue: "undated Pineider gift guide: converter filling system",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase588-pineider-rock-primary",
      title: "Pineider Rock 当前活塞与旧 converter 边界图（非产品照片）",
      sourceKey: rock.diagram.key,
      localPath: rock.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、纹理、比例、商标、笔尖、机构或库存。",
      sourceUrl: rock.diagram.url,
      usageStatus: "primary",
    },
  ],
};

function requirePineiderBrand(): CuratedEntityPack {
  const brand = phase428BrandDepthRefreshPacks.find(
    (pack) => pack.entityId === PHASE588_PINEIDER_BRAND_ID,
  );
  if (!brand || brand.expectedType !== "brand") {
    throw new Error("Phase 588 requires the canonical Phase 428 Pineider brand pack.");
  }
  return brand;
}

function mergeSources(
  base: readonly CuratedSource[],
  extras: readonly CuratedSource[],
): CuratedSource[] {
  const byKey = new Map(base.map((source) => [source.key, source]));
  for (const source of extras) {
    const previous = byKey.get(source.key);
    if (previous && JSON.stringify(previous) !== JSON.stringify(source)) {
      throw new Error(`Phase 588 conflicting source definition: ${source.key}.`);
    }
    byKey.set(source.key, source);
  }
  return [...byKey.values()];
}

const phase428PineiderBrand = requirePineiderBrand();
const brandScope = phase428PineiderBrand.scopes[0]?.scopeKey;
if (!brandScope) {
  throw new Error("Phase 588 Pineider brand pack requires a canonical scope.");
}

export const phase588PineiderBrandPack: CuratedEntityPack = {
  ...phase428PineiderBrand,
  key: "phase588-pineider-brand-depth-refresh-v1",
  markdownFile: ".planning/content-research/pineider-brand-phase588.md",
  storyTitle: "Pineider：Avatar UR、Arco 与 Rock 的独立产品线导航",
  publicationIntent: "publish",
  publicationBlockers: [],
  sources: mergeSources(phase428PineiderBrand.sources, [
    common.story,
    common.collections,
    arco.official,
    arco.pencilcase,
    rock.official,
    rock.penChalet,
  ]),
  claims: [
    ...phase428PineiderBrand.claims,
    {
      key: "phase588-pineider-brand-three-model-navigation",
      predicate: "series_navigation",
      objectText:
        "Pineider Avatar UR, Arco Fountain Pen and Rock Fountain Pen are separate model nodes whose nib, fill, material and edition fields must not be inherited across families.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.collections.key,
      locator: common.collections.summary,
      evidence: [
        {
          key: "phase588-pineider-brand-three-model-navigation-evidence",
          sourceKey: common.collections.key,
          scopeKey: brandScope,
          locator: common.collections.summary,
        },
        {
          key: "phase588-pineider-brand-arco-navigation-evidence",
          sourceKey: arco.official.key,
          scopeKey: brandScope,
          locator: arco.official.summary,
        },
        {
          key: "phase588-pineider-brand-rock-navigation-evidence",
          sourceKey: rock.official.key,
          scopeKey: brandScope,
          locator: rock.official.summary,
        },
      ],
    },
  ],
};

export const phase588PineiderPacks: CuratedEntityPack[] = [
  phase588PineiderBrandPack,
  phase588PineiderArcoPack,
  phase588PineiderRockPack,
];

if (
  phase588PineiderPacks.length !== 3 ||
  new Set(phase588PineiderPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 588 must contain one brand and two unique model packs.");
}
