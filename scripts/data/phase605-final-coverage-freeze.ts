import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-13";

export const PHASE605_BRANDS = {
  penlux: "phase605-brand-penlux",
  ferris: "phase605-brand-ferris-wheel-press",
  toms: "phase605-brand-toms-studio",
  radius: "phase605-brand-radius-1934",
  hinze: "phase605-brand-hinze-pen-company",
} as const;

export const PHASE605_MODELS = {
  penlux: "phase605-penlux-masterpiece-grande-deep-sea",
  ferris: "phase605-ferris-wheel-press-carousel-feathered-flight",
  toms: "phase605-toms-studio-studio-fountain-pen",
  radius: "phase605-radius-settimo-matte-black",
  hinze: "phase605-hinze-elementar",
} as const;

export const PHASE605_SLUGS = {
  penluxBrand: "penlux",
  penluxModel: "penlux-masterpiece-grande-deep-sea",
  ferrisBrand: "ferris-wheel-press",
  ferrisModel: "ferris-wheel-press-carousel-feathered-flight",
  tomsBrand: "toms-studio",
  tomsModel: "toms-studio-studio-fountain-pen",
  radiusBrand: "radius-1934",
  radiusModel: "radius-1934-settimo-matte-black",
  hinzeBrand: "hinze-pen-company",
  hinzeModel: "hinze-elementar",
} as const;

function web(input: {
  key: string;
  title: string;
  url: string;
  registry: string;
  name: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  publishedAt?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registry,
    registryName: input.name,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registry,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    author: input.name,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function image(key: keyof typeof PHASE605_BRANDS, kind: "brand" | "model") {
  const localPath = `/images/library/site-original/phase605/${key}/${kind}.svg`;
  return {
    key: `phase605-${key}-${kind}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase605-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase605-${key}`,
    title: `Phase 605 ${key} ${kind} factual diagram`,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片、Logo、颜色校样、纹理复刻或比例图。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  } satisfies CuratedSource;
}

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

const S = {
  penluxAbout: web({
    key: "phase605-penlux-about",
    title: "This is PENLUX",
    url: "https://www.penlux.com.tw/about-us/",
    registry: "penlux-official-phase605",
    name: "PENLUX Inc.",
    summary:
      "官网区分1999年制造业务、台湾内部生产与2015年起PENLUX自有品牌和自研活塞系统。",
  }),
  penluxModel: web({
    key: "phase605-penlux-deep-sea",
    title: "Masterpiece Grande Deep Sea",
    url: "https://www.penlux.com.tw/product/deep-sea/",
    registry: "penlux-official-phase605",
    name: "PENLUX Inc.",
    summary:
      "exact page给出Great Natural Collection、149 mm、33 g、18 mm、1.5 ml、RD #1.58活塞与JoWo #6钢尖，并列不同笔尖选项。",
  }),
  penluxCare: web({
    key: "phase605-penlux-maintenance",
    title: "PENLUX Maintenance",
    url: "https://www.penlux.com.tw/maintenance/",
    registry: "penlux-official-phase605",
    name: "PENLUX Inc.",
    summary:
      "官方清洗与维护页要求用清水、不用溶剂、不自行拆笔尖或活塞，并给出长期停用与航空携带边界。",
  }),
  penluxProfessional: web({
    key: "phase605-penlux-pen-world-2019",
    title: "A New Dynasty Rises: Taiwan's Penlux",
    url: "https://anyflip.com/bqpec/drxi/basic",
    registry: "pen-world-magazine-phase605",
    name: "Pen World Magazine",
    summary:
      "Pen World 2019独立专题确认PENLUX的台湾制造背景、Masterpiece Grande全尺寸金属活塞定位，并采访专业零售商评价其持续改良。",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2019-12-18",
  }),
  ferrisAbout: web({
    key: "phase605-ferris-about",
    title: "About Ferris Wheel Press",
    url: "https://ferriswheelpress.com/pages/about-ferris-wheel-press",
    registry: "ferris-wheel-press-official-phase605",
    name: "Ferris Wheel Press",
    summary:
      "品牌自述2010年从加拿大letterpress studio起步，后以Brush Fountain Pen和墨水进入书写工具。",
  }),
  ferrisModel: web({
    key: "phase605-ferris-carousel-feathered-flight",
    title: "The Carousel Fountain Pen - Feathered Flight",
    url: "https://ferriswheelpress.com/products/the-carousel-fountain-pen-feathered-flight",
    registry: "ferris-wheel-press-official-phase605",
    name: "Ferris Wheel Press",
    summary:
      "exact page给出improved acrylic blend、air-sealed click cap、128 mm、0.7/1.0 mm钢尖、标准国际转换器和清洗说明。",
  }),
  ferrisRetail: web({
    key: "phase605-ferris-penchalet",
    title: "Ferris Wheel Press Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/ferris_wheel_press/",
    registry: "pen-chalet-phase605",
    name: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "专业零售目录将Carousel、Aluminum Carousel与Joule分列，证明普通Carousel并非金属版本。",
  }),
  tomsAbout: web({
    key: "phase605-toms-about",
    title: "About Tom's Studio",
    url: "https://tomsstudio.com/en-au/pages/about",
    registry: "toms-studio-official-phase605",
    name: "Tom's Studio",
    summary:
      "品牌故事说明Tom从为Gemma制作Corian与黄铜书法笔起步，并在英国Dorset建立工作室。",
  }),
  tomsModel: web({
    key: "phase605-toms-studio-fountain-pen",
    title: "The Studio Fountain Pen",
    url: "https://tomsstudio.com/products/the-studio-fountain-pen-archive-colours",
    registry: "toms-studio-official-phase605",
    name: "Tom's Studio",
    summary:
      "exact page给出145/105/14 mm、30 g、阳极氧化铝、镀金尾饰和多种可换笔尖配置。",
  }),
  tomsFaq: web({
    key: "phase605-toms-studio-faq",
    title: "Studio Fountain Pen FAQs",
    url: "https://tomsstudio.com/pages/studio-fountain-pen-faqs",
    registry: "toms-studio-official-phase605",
    name: "Tom's Studio",
    summary:
      "FAQ确认标准国际长短墨囊／转换器、旋出式笔尖单元、首次冲洗、禁用书法墨与Pro-Flex维护边界。",
  }),
  tomsRetail: web({
    key: "phase605-toms-goldspot",
    title: "Tom's Studio Fountain Pens",
    url: "https://goldspot.com/collections/toms-studio-fountain-pens",
    registry: "goldspot-pens-phase605",
    name: "Goldspot Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "专业零售目录独立确认Tom's Studio钢笔产品身份，并将该品牌与Lamy Studio及同品牌其他书写工具分开。",
  }),
  radiusAbout: web({
    key: "phase605-radius-brand-history",
    title: "Radius 1934 - Il Brand",
    url: "https://www.radius1934.it/en/pages/il-brand",
    registry: "radius-1934-official-phase605",
    name: "Radius 1934",
    summary:
      "官网称Radius由都灵S.A.F.I.S.于1934年推向市场，2019年复兴，并列Settimo、Superior、Autarchica三条新系列。",
  }),
  radiusModel: web({
    key: "phase605-radius-settimo-matte-black",
    title: "Settimo - Nero opaco",
    url: "https://www.radius1934.it/en/products/settimo-nero-opaco",
    registry: "radius-1934-official-phase605",
    name: "Radius 1934",
    summary:
      "exact page给出树脂、钢尖、墨囊／转换器、143 mm、27.5 g、16.8 mm笔帽与11.6 mm握位。",
  }),
  radiusRetail: web({
    key: "phase605-radius-settimo-penchalet",
    title: "Radius 1934 Settimo Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/radius_1934_settimo_fountain_pens.html",
    registry: "pen-chalet-phase605",
    name: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "专业零售页交叉确认Settimo独立产品线和Matte/Glossy Black边界。",
  }),
  hinzeAbout: web({
    key: "phase605-hinze-about",
    title: "Hinze Pen Company About Us",
    url: "https://hinzepens.com/pages/about-us",
    registry: "hinze-official-phase605",
    name: "Hinze Pen Company",
    summary:
      "Jim Hinze自述从kit pens转向fully custom fountain pens，保留标准型号、定制、教学和逐支调校的手工生产。",
  }),
  hinzeModel: web({
    key: "phase605-hinze-elementar",
    title: "The Elementar",
    url: "https://hinzepens.com/products/the-elementar",
    registry: "hinze-official-phase605",
    name: "Hinze Pen Company",
    summary:
      "exact base-model page称Elementar是custom pen起点，收合略长于5.5英寸、最宽约0.582英寸、13 mm帽螺纹并可指定颜色。",
  }),
  hinzeRetail: web({
    key: "phase605-hinze-penchalet",
    title: "Hinze Pens Handmade in Texas",
    url: "https://www.penchalet.com/hinze/",
    registry: "pen-chalet-phase605",
    name: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "授权零售品牌页交叉确认Texas手工制作、常见#6钢尖与标准国际转换器，同时显示零售exclusive需逐SKU核对。",
  }),
};

interface Definition {
  key: keyof typeof PHASE605_BRANDS;
  brandSlug: string;
  brandName: string;
  brandFile: string;
  brandAliases: string[];
  brandClaim: string;
  modelSlug: string;
  modelName: string;
  modelFile: string;
  modelAliases: string[];
  primary: CuratedSource;
  secondary: CuratedSource;
  care: CuratedSource;
  additionalSources?: CuratedSource[];
  modelClaim: string;
  boundary: string;
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
}

const definitions: Definition[] = [
  {
    key: "penlux",
    brandSlug: PHASE605_SLUGS.penluxBrand,
    brandName: "PENLUX",
    brandFile: ".planning/content-research/penlux-brand-phase605.md",
    brandAliases: ["Penlux", "PENLUX Inc.", "派犀"],
    brandClaim:
      "PENLUX将1999年台湾书写工具制造背景与2015年起自有品牌产品分开说明。",
    modelSlug: PHASE605_SLUGS.penluxModel,
    modelName: "PENLUX Masterpiece Grande Deep Sea",
    modelFile:
      ".planning/content-research/penlux-masterpiece-grande-deep-sea-phase605.md",
    modelAliases: ["Penlux Masterpiece Grande Deep Sea", "Penlux Deep Sea"],
    primary: S.penluxAbout,
    secondary: S.penluxModel,
    care: S.penluxCare,
    additionalSources: [S.penluxProfessional],
    modelClaim:
      "Deep Sea是Masterpiece Grande Great Natural Collection下的exact版本。",
    boundary:
      "Koi、Snowflake和其他Masterpiece Grande版本不继承Deep Sea颜色、材料、价格或笔尖配置。",
    values: {
      series_name: "PENLUX Masterpiece Grande / Great Natural Collection",
      release_year: "current page verified 2026-08-13; launch year not asserted",
      origin_country: "Taiwan PENLUX current manufacturing scope",
      nib: "JoWo no.6 steel standard; F/M/Stub/14FX/18F/18M order options",
      fill_system: "RD #1.58 aluminium-alloy piston; about 1.5 ml",
      material: "Deep Sea exact resin appearance; sibling materials excluded",
      dimensions: "149 mm length; 18 mm maximum diameter",
      weight: "33 g",
      status: "current official exact product page",
    },
  },
  {
    key: "ferris",
    brandSlug: PHASE605_SLUGS.ferrisBrand,
    brandName: "Ferris Wheel Press",
    brandFile: ".planning/content-research/ferris-wheel-press-brand-phase605.md",
    brandAliases: ["FWP", "Ferris Wheel Press Canada", "摩天轮出版社"],
    brandClaim:
      "Ferris Wheel Press从2010年加拿大letterpress studio扩展到钢笔、墨水与收藏文具。",
    modelSlug: PHASE605_SLUGS.ferrisModel,
    modelName: "Ferris Wheel Press Carousel Feathered Flight",
    modelFile:
      ".planning/content-research/ferris-wheel-press-carousel-phase605.md",
    modelAliases: ["FWP Carousel Feathered Flight", "Carousel Feathered Flight"],
    primary: S.ferrisAbout,
    secondary: S.ferrisModel,
    care: S.ferrisRetail,
    modelClaim:
      "Feathered Flight是改良acrylic普通Carousel的小批量配色，不是Aluminum Carousel。",
    boundary:
      "Aluminum Carousel的金属笔身、螺纹帽与重量不得继承；同页posted length 128 mm有疑点，不作为合格尺寸。",
    values: {
      series_name: "Ferris Wheel Press Carousel",
      release_year: "small-batch page verified 2026-08-13; launch year not asserted",
      origin_country: "Canadian brand; exact manufacturing country not stated",
      nib: "custom-ground steel; 0.7 mm Fine or 1.0 mm Medium",
      fill_system: "standard international cartridge/converter; converter included",
      material: "improved acrylic blend with gloss finish",
      dimensions: "128 mm capped; posted length rejected as unresolved page inconsistency",
      status: "current small batch while stocks last",
    },
  },
  {
    key: "toms",
    brandSlug: PHASE605_SLUGS.tomsBrand,
    brandName: "Tom's Studio",
    brandFile: ".planning/content-research/toms-studio-brand-phase605.md",
    brandAliases: ["Toms Studio", "Tom’s Studio", "汤姆工作室"],
    brandClaim:
      "Tom's Studio是英国Dorset创意书写工具品牌，独立于Lamy Studio型号。",
    modelSlug: PHASE605_SLUGS.tomsModel,
    modelName: "Tom's Studio Studio Fountain Pen",
    modelFile: ".planning/content-research/toms-studio-fountain-pen-phase605.md",
    modelAliases: ["Tom's Studio Fountain Pen", "The Studio Fountain Pen"],
    primary: S.tomsAbout,
    secondary: S.tomsModel,
    care: S.tomsFaq,
    additionalSources: [S.tomsRetail],
    modelClaim:
      "全尺寸Studio Fountain Pen使用阳极氧化铝、标准国际上墨与旋出式可换尖系统。",
    boundary:
      "Studio Pocket Fountain Pen V2是兄弟型号，不继承145 mm、30 g；各笔尖材质与维护要求按订单区分。",
    values: {
      series_name: "Tom's Studio Studio Fountain Pen",
      release_year: "current page verified 2026-08-13; launch year not asserted",
      origin_country: "UK brand; whole-pen manufacturing country not asserted",
      nib: "interchangeable screw-out units; exact nib and feed by order",
      fill_system: "standard international long/short cartridge or converter",
      material: "anodised aluminium; gold-plated finial",
      dimensions: "145 mm capped; 105 mm uncapped; 14 mm barrel diameter",
      weight: "30 g",
      status: "current configurable full-size product",
    },
  },
  {
    key: "radius",
    brandSlug: PHASE605_SLUGS.radiusBrand,
    brandName: "Radius 1934",
    brandFile: ".planning/content-research/radius-1934-brand-phase605.md",
    brandAliases: ["Radius", "Radius Pens", "雷迪乌斯1934"],
    brandClaim:
      "Radius在1934年由S.A.F.I.S.推向市场，当前品牌称2019年复兴，历史与复兴产品分别取证。",
    modelSlug: PHASE605_SLUGS.radiusModel,
    modelName: "Radius Settimo Matte Black",
    modelFile: ".planning/content-research/radius-settimo-matte-black-phase605.md",
    modelAliases: ["Radius Settimo Nero opaco", "Radius Settimo Matte Black"],
    primary: S.radiusAbout,
    secondary: S.radiusModel,
    care: S.radiusRetail,
    modelClaim:
      "Settimo Matte Black是钢尖、墨囊／转换器的复兴款exact scope。",
    boundary:
      "Superior的14K金尖、硬橡胶笔舌与活塞不得继承；Glossy Black仅作表面兄弟版本。",
    values: {
      series_name: "Radius 1934 Settimo / Nero Essenza",
      release_year: "post-2019 revival; exact SKU launch year not asserted",
      origin_country: "current Italian revival-brand product scope",
      nib: "steel; EF/F/M/B/Stub 1.1 and Flex EF/F by current selector",
      fill_system: "cartridge/converter",
      material: "matte black resin",
      dimensions: "143 mm capped; 123 mm body with nib; cap 16.8 mm; grip 11.6 mm",
      weight: "27.5 g",
      status: "current official product; configurations may be backordered",
    },
  },
  {
    key: "hinze",
    brandSlug: PHASE605_SLUGS.hinzeBrand,
    brandName: "Hinze Pen Company",
    brandFile: ".planning/content-research/hinze-brand-phase605.md",
    brandAliases: ["Hinze Pens", "Hinze Pen Co.", "欣泽钢笔"],
    brandClaim:
      "Hinze Pen Company是Jim Hinze在Texas经营的手工钢笔品牌，保留标准型号、定制与逐支调校。",
    modelSlug: PHASE605_SLUGS.hinzeModel,
    modelName: "Hinze Elementar",
    modelFile: ".planning/content-research/hinze-elementar-phase605.md",
    modelAliases: ["The Elementar", "Hinze Pen Chalet Exclusive Elementar"],
    primary: S.hinzeAbout,
    secondary: S.hinzeModel,
    care: S.hinzeRetail,
    modelClaim:
      "Elementar是Hinze fully custom fountain pen体系的基础轮廓，颜色与具体配置按订单变化。",
    boundary:
      "用户样本与零售exclusive的#6 JoWo、转换器、材料和重量不得扩展到所有Elementar订单。",
    values: {
      series_name: "Hinze Elementar",
      release_year: "custom-pen starting form; universal launch year not asserted",
      origin_country: "Texas, United States current handmade scope",
      nib: "order-specific; #6 steel/JoWo appears in samples and retail SKUs only",
      fill_system: "order-specific; standard international C/C common but not universal",
      material: "handmade resin/custom material by order",
      dimensions: "a little over 5.5 in capped; about 0.582 in widest; 13 mm cap threads",
      status: "current configurable base model",
    },
  },
];

function brandPack(def: Definition): CuratedEntityPack {
  const scopeKey = `phase605-${def.key}-brand-scope`;
  const diagram = image(def.key, "brand");
  return {
    key: `phase605-${def.key}-brand-v1`,
    entityId: PHASE605_BRANDS[def.key],
    expectedType: "brand",
    expectedSlug: def.brandSlug,
    canonicalName: def.brandName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: def.brandFile,
    storyTitle: `${def.brandName}：品牌身份与代表型号导航`,
    primarySourceKey: def.primary.key,
    depthTier: "A",
    aliases: def.brandAliases.map((alias) => ({
      alias,
      language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
      sourceKey: def.primary.key,
    })),
    sources: [
      def.primary,
      def.secondary,
      def.care,
      ...(def.additionalSources ?? []),
      diagram,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope:
          "Phase 605 coverage-freeze brand navigation; only reviewed exact models are public.",
      },
    ],
    claims: [
      {
        key: `phase605-${def.key}-brand-identity`,
        predicate: "brand_identity",
        objectText: def.brandClaim,
        factClass: "core",
        confidence: 0.98,
        sourceKey: def.primary.key,
        locator: def.primary.summary,
        evidence: [
          {
            key: `phase605-${def.key}-brand-identity-evidence`,
            sourceKey: def.primary.key,
            scopeKey,
            locator: def.primary.summary,
          },
          {
            key: `phase605-${def.key}-brand-model-evidence`,
            sourceKey: def.secondary.key,
            scopeKey,
            locator: def.secondary.summary,
          },
          {
            key: `phase605-${def.key}-brand-care-evidence`,
            sourceKey: def.care.key,
            scopeKey,
            locator: def.care.summary,
          },
          ...(def.additionalSources ?? []).map((source) => ({
            key: `phase605-${def.key}-brand-professional-${source.key}`,
            sourceKey: source.key,
            scopeKey,
            locator: source.summary,
          })),
        ],
      },
    ],
    timeline: [
      {
        key: `phase605-${def.key}-brand-verified`,
        title: `${def.brandName} current identity verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: "Verification date is not a founding or launch date.",
        sourceKey: def.primary.key,
      },
      {
        key: `phase605-${def.key}-representative-model-verified`,
        title: `${def.modelName} representative model verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description:
          "Exact representative-model scope was verified separately from the brand history.",
        sourceKey: def.secondary.key,
      },
    ],
    media: [
      {
        key: `phase605-${def.key}-brand-primary`,
        title: `${def.brandName} 品牌导航事实图（非产品照片）`,
        sourceKey: diagram.key,
        localPath: diagram.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创事实图；非产品照片、Logo、颜色校样、纹理复刻或比例图。",
        sourceUrl: diagram.url,
        usageStatus: "primary",
      },
    ],
  };
}

function modelPack(def: Definition): CuratedEntityPack {
  const scopeKey = `phase605-${def.key}-model-scope`;
  const diagram = image(def.key, "model");
  const fields = Object.keys(def.values) as Array<
    Exclude<SpecFieldKey, "brand_entity_id">
  >;
  const boundaryEvidenceKey = `phase605-${def.key}-model-boundary-evidence`;
  return {
    key: `phase605-${def.key}-model-v1`,
    entityId: PHASE605_MODELS[def.key],
    expectedType: "pen",
    expectedSlug: def.modelSlug,
    canonicalName: def.modelName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: def.modelFile,
    storyTitle: `${def.modelName}：规格、版本、维护与选购`,
    primarySourceKey: def.secondary.key,
    depthTier: "A",
    aliases: def.modelAliases.map((alias) => ({
      alias,
      language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
      sourceKey: def.secondary.key,
    })),
    sources: [
      def.secondary,
      def.primary,
      def.care,
      ...(def.additionalSources ?? []),
      diagram,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: "Exact page/order scope; sibling nibs do not inherit.",
        materialScope: "Exact page/order scope; colour and material siblings remain separate.",
        editionScope: def.boundary,
      },
    ],
    claims: [
      {
        key: `phase605-${def.key}-model-identity`,
        predicate: "model_identity",
        objectText: def.modelClaim,
        factClass: "core",
        confidence: 0.99,
        sourceKey: def.secondary.key,
        locator: def.secondary.summary,
        evidence: [
          {
            key: `phase605-${def.key}-model-identity-evidence`,
            sourceKey: def.secondary.key,
            scopeKey,
            locator: def.secondary.summary,
          },
          ...(def.additionalSources ?? []).map((source) => ({
            key: `phase605-${def.key}-model-professional-${source.key}`,
            sourceKey: source.key,
            scopeKey,
            locator: source.summary,
          })),
        ],
      },
      {
        key: `phase605-${def.key}-model-boundary`,
        predicate: "version_boundary",
        objectText: def.boundary,
        factClass: "core",
        confidence: 0.99,
        sourceKey: def.care.key,
        locator: def.care.summary,
        evidence: [
          {
            key: boundaryEvidenceKey,
            sourceKey: def.care.key,
            scopeKey,
            locator: def.care.summary,
          },
        ],
      },
    ],
    variants: [
      {
        key: `phase605-${def.key}-exact-scope`,
        name: def.modelName,
        notes: def.boundary,
        sourceKey: def.secondary.key,
        variantKind: "market_sku",
      },
    ],
    spec: {
      brandEntityId: PHASE605_BRANDS[def.key],
      values: def.values,
      evidence: [
        evidence(
          "brand_entity_id",
          `phase605-${def.key}-spec-brand`,
          def.primary.key,
          scopeKey,
          def.brandClaim,
        ),
        ...fields.map((field) =>
          evidence(
            field,
            `phase605-${def.key}-spec-${field}`,
            def.secondary.key,
            scopeKey,
            `exact current scope: ${field}`,
          ),
        ),
        evidence(
          "dimensions",
          `phase605-${def.key}-rejected-sibling-spec`,
          def.care.key,
          scopeKey,
          def.boundary,
          false,
        ),
      ],
    },
    conflicts: [
      {
        key: `phase605-${def.key}-scope-conflict`,
        fieldKey: "identity",
        scopeKey,
        conflictKind: "identity",
        status: "resolved",
        resolutionNote: def.boundary,
        members: [
          {
            citationKey: `phase605-${def.key}-spec-brand`,
            assertedValue: "exact official scope accepted",
          },
          {
            citationKey: `phase605-${def.key}-rejected-sibling-spec`,
            assertedValue: "sibling/sample scope rejected",
          },
        ],
      },
    ],
    timeline: [
      {
        key: `phase605-${def.key}-model-verified`,
        title: `${def.modelName} exact scope verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: "Verification date is not a launch date.",
        sourceKey: def.secondary.key,
      },
      {
        key: `phase605-${def.key}-model-boundary-verified`,
        title: `${def.modelName} sibling boundary verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: def.boundary,
        sourceKey: def.care.key,
      },
    ],
    media: [
      {
        key: `phase605-${def.key}-model-primary`,
        title: `${def.modelName} 规格事实图（非产品照片）`,
        sourceKey: diagram.key,
        localPath: diagram.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创事实图；非产品照片、Logo、颜色校样、纹理复刻或比例图。",
        sourceUrl: diagram.url,
        usageStatus: "primary",
      },
    ],
  };
}

export const phase605Groups = definitions.map((definition) => ({
  brand: brandPack(definition),
  pens: [modelPack(definition)],
}));

export const phase605FinalCoveragePacks = phase605Groups.flatMap(
  ({ brand, pens }) => [brand, ...pens],
);
