import type {
  CuratedEntityPack,
  CuratedSource,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-14";

export const PHASE612_BATCH_A_IDS = {
  jacquesHerbinBrand: "phase612-brand-jacques-herbin",
  jacquesHerbinTransparent22000T:
    "phase612-pen-jacques-herbin-transparent-pump-action-22000t",
  kakimoriBrand: "phase612-brand-kakimori",
  kakimoriAluminiumFountainPen: "phase612-pen-kakimori-aluminium-fountain-pen",
  kakimoriFrost: "phase612-pen-kakimori-frost",
  koloBrand: "phase612-brand-kolo",
  koloTino: "phase612-pen-kolo-tino",
  travelersCompanyBrand: "phase612-brand-travelers-company",
  travelersCompanyBrassFountainPen:
    "phase612-pen-travelers-company-brass-fountain-pen",
  wearingeulBrand: "phase612-brand-wearingeul",
  wearingeulPreface: "phase612-pen-wearingeul-preface",
} as const;

export const PHASE612_BATCH_A_SLUGS = {
  jacquesHerbinBrand: "jacques-herbin",
  jacquesHerbinTransparent22000T:
    "jacques-herbin-transparent-pump-action-22000t",
  kakimoriBrand: "kakimori",
  kakimoriAluminiumFountainPen: "kakimori-aluminium-fountain-pen",
  kakimoriFrost: "kakimori-frost",
  koloBrand: "kolo",
  koloTino: "kolo-tino",
  travelersCompanyBrand: "travelers-company",
  travelersCompanyBrassFountainPen: "travelers-company-brass-fountain-pen",
  wearingeulBrand: "wearingeul",
  wearingeulPreface: "wearingeul-preface",
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

function image(input: {
  key: string;
  title: string;
  localPath: string;
}): CuratedSource {
  return {
    key: `phase612-a-${input.key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase612-a-${input.key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase612-a-${input.key}`,
    title: input.title,
    url: input.localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图；非产品照片，不表示真实颜色、纹理、比例、商标或包装。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: input.localPath,
    archiveLocator: `project-public-asset:${input.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
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
  jacquesStory: web({
    key: "phase612-a-jacques-herbin-story",
    title: "Jacques Herbin - Our story",
    url: "https://www.jacquesherbin.com/en/story/",
    registry: "jacques-herbin-official-phase612-a",
    name: "Jacques Herbin",
    summary:
      "官方历史区分1670年Maison Herbin起点、1798年书写墨水生产，以及2021年归入Clairefontaine Rhodia体系。",
  }),
  jacquesPen: web({
    key: "phase612-a-jacques-herbin-22000t",
    title: "Pump-action fountain pen, Transparent",
    url: "https://www.jacquesherbin.com/en/produit/stylo-plume-a-pompe-transparent/",
    registry: "jacques-herbin-official-phase612-a",
    name: "Jacques Herbin",
    summary:
      "exact page确认代码22000T、中号尖、从墨瓶吸墨后像墨囊装入的pump、通用规格墨囊兼容与透明笔身。",
  }),
  jacquesCatalog: web({
    key: "phase612-a-jacques-herbin-catalog-2024",
    title: "Herbin Catalogue 2024",
    url: "https://www.herbin.ro/cataloage1/Herbin/herbin2024.pdf",
    registry: "herbin-catalog-official-phase612-a",
    name: "Herbin",
    summary:
      "官方目录把22000T钢笔、22500T走珠、22200T替换pump与21900T紧凑墨囊钢笔分列，并确认中号钢尖。",
  }),
  jacquesHamilton: web({
    key: "phase612-a-jacques-herbin-hamilton",
    title: "J. Herbin Fountain Pen with Converter Clear",
    url: "https://www.hamiltonpens.com/products/j-herbin-fountain-pen-with-converter-clear",
    registry: "hamilton-pens-phase612-a",
    name: "The Hamilton Pen Company",
    summary:
      "专业零售页交叉确认透明钢笔、中号不锈钢尖、随附可吸墨储墨器与国际墨囊范围。",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
  kakimoriAbout: web({
    key: "phase612-a-kakimori-about",
    title: "Kakimori",
    url: "https://kakimori.com/en/pages/kakimori",
    registry: "kakimori-official-phase612-a",
    name: "Kakimori",
    summary:
      "官方介绍确认2010年在东京藏前开店，以愉快书写、定制笔记本、墨水与原创书写工具为核心。",
  }),
  kakimoriCompany: web({
    key: "phase612-a-kakimori-company",
    title: "Company Profile",
    url: "https://kakimori.com/en/pages/company",
    registry: "kakimori-official-phase612-a",
    name: "Kakimori",
    summary:
      "公司页区分1961年经营主体、2010年Kakimori开店、2014年Inkstand与2021年制造能力扩展。",
  }),
  kakimoriGuide: web({
    key: "phase612-a-kakimori-care",
    title: "Kakimori Use and care guides",
    url: "https://kakimori.com/en/blogs/guide",
    registry: "kakimori-official-phase612-a",
    name: "Kakimori",
    summary:
      "官方维护入口说明换色、供墨不畅与干结笔尖的清洗路径，特殊清洁液只按兼容产品说明使用。",
  }),
  kakimoriAluminium: web({
    key: "phase612-a-kakimori-aluminium-exact",
    title: "Aluminium pen - Fountain pen",
    url: "https://kakimori.com/en/collections/fp/products/k21pfp0fb9",
    registry: "kakimori-official-phase612-a",
    name: "Kakimori",
    summary:
      "exact page给出F/M、133×10 mm、16 g、铝笔身、不锈钢尖、转换器及日本笔身／德国笔尖转换器分工，并明确笔帽不可套尾。",
  }),
  kakimoriAluminiumStory: web({
    key: "phase612-a-kakimori-aluminium-story",
    title: "Aluminium pen",
    url: "https://kakimori.com/en/pages/aluminium-pen",
    registry: "kakimori-official-phase612-a",
    name: "Kakimori",
    summary:
      "官方系列页说明磨砂轻量铝、金属笔夹，以及ballpoint、rollerball与fountain pen三种书写方式的边界。",
  }),
  kakimoriYoseka: web({
    key: "phase612-a-kakimori-aluminium-yoseka",
    title: "Kakimori Aluminium Fountain Pen",
    url: "https://yosekastationery.com/products/kakimori-aluminium-fountain-pen",
    registry: "yoseka-stationery-phase612-a",
    name: "Yoseka Stationery",
    summary:
      "专业零售页交叉确认133 mm、10 mm、F/M钢尖、转换器、铝笔身与Kakimori产品身份。",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
  kakimoriFrost: web({
    key: "phase612-a-kakimori-frost-exact",
    title: "Frost",
    url: "https://kakimori.com/en/pages/frost",
    registry: "kakimori-official-phase612-a",
    name: "Kakimori",
    summary:
      "官方系列页给出134×14 mm、14 g、polycarbonate、F/M不锈钢尖、Schmidt转换器、四头螺纹、制造分工与颜色列表。",
  }),
  kakimoriFrostLaunch: web({
    key: "phase612-a-kakimori-frost-launch",
    title: "New Frost and Mini holder launching on 1 October",
    url: "https://kakimori.com/en/blogs/news/frost_miniholder20241001",
    registry: "kakimori-official-phase612-a",
    name: "Kakimori",
    summary:
      "官方公告确认Frost于2024-10-01推出，并说明它是早期透明钢笔／走珠设计的重新演绎。",
    publishedAt: "2024-09-20",
  }),
  kakimoriFrostReview: web({
    key: "phase612-a-kakimori-frost-pen-addict",
    title: "Kakimori Frost Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2025/4/3/kakimori-frost-fountain-pen-review-1",
    registry: "pen-addict-phase612-a",
    name: "The Pen Addict",
    summary:
      "独立专业评测交叉确认轻量polycarbonate、螺纹帽、钢尖、标准墨囊／转换器及非eyedropper边界，并把套帽感受限定为单支样本。",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2025-04-03",
  }),
  koloAbout: web({
    key: "phase612-a-kolo-about",
    title: "About Kolo",
    url: "https://kolo.com/pages/about-us",
    registry: "kolo-official-phase612-a",
    name: "Kolo",
    summary:
      "官网确认Kolo创立于1998年、早期以相册与journal著称，并于2016年被Topdrawer收购。",
  }),
  koloCollection: web({
    key: "phase612-a-kolo-tino-collection",
    title: "Tino Collection",
    url: "https://kolo.com/pages/tino-collection",
    registry: "kolo-official-phase612-a",
    name: "Kolo",
    summary:
      "官方系列页确认Tino由Tino Valentinitsch与Michael Bauchowitz构思，涵盖raw brass、raw aluminum、Italian acrylic以及钢笔／圆珠笔。",
  }),
  koloAcrylic: web({
    key: "phase612-a-kolo-tino-acrylic",
    title: "Tino Acrylic Fountain Pen",
    url: "https://kolo.com/products/tino-acrylic-foutain-pen",
    registry: "kolo-official-phase612-a",
    name: "Kolo",
    summary:
      "exact acrylic页给出捷克制造、短国际墨囊、21 g、105.5 mm收合、136.5 mm套帽与随附Kaweco墨囊。",
  }),
  koloReview: web({
    key: "phase612-a-kolo-tino-pen-addict",
    title: "Kolo Tino Brass Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2025/5/26/kolo-tino-brass-fountain-pen-review",
    registry: "pen-addict-phase612-a",
    name: "The Pen Addict",
    summary:
      "独立评测确认brass样本约69 g、常见Schmidt #5钢尖、短国际墨囊及材料对握位和重心的显著影响。",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2025-05-26",
  }),
  koloPenBoutique: web({
    key: "phase612-a-kolo-tino-pen-boutique",
    title: "Say Hello to Tino, a new Pen from Kolo",
    url: "https://www.penboutique.com/blogs/blog/say-hello-to-tino-a-new-pen-from-kolo-tino",
    registry: "pen-boutique-phase612-a",
    name: "Pen Boutique",
    summary:
      "专业零售文章说明短身套帽、摩擦帽、较长握位、Schmidt #5钢尖与不要强推套帽的使用边界。",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
  travelersAbout: web({
    key: "phase612-a-travelers-company-about",
    title: "About TRAVELER'S COMPANY",
    url: "https://www.travelers-company.com/travelers-company",
    registry: "travelers-company-official-phase612-a",
    name: "TRAVELER'S COMPANY",
    summary:
      "官网确认品牌为深化旅行主题于2015年从MIDORI更名为TRAVELER'S COMPANY，并列主要产品体系。",
  }),
  travelersPen: web({
    key: "phase612-a-travelers-company-brass-pen",
    title: "BRASS FOUNTAIN PEN",
    url: "https://www.travelers-company.com/products/brass/fountainpen-2020",
    registry: "travelers-company-official-phase612-a",
    name: "TRAVELER'S COMPANY",
    summary:
      "exact page确认实心黄铜、短身套帽、可拆ring/clip、Fine钢尖、欧洲规格墨囊、日本制造与自然patina。",
  }),
  travelersRelease: web({
    key: "phase612-a-travelers-company-brass-2017",
    title: "New Brass products 2017",
    url: "https://www.travelers-company.com/products/brass-renewal2017",
    registry: "travelers-company-official-phase612-a",
    name: "TRAVELER'S COMPANY",
    summary:
      "官方公告确认Brass Fountain Pen于2017年加入产品线；BRASS PRODUCTS本身始于2010年。",
  }),
  travelersPress: web({
    key: "phase612-a-travelers-company-press-2017",
    title: "BRASS FOUNTAIN PEN press release",
    url: "https://www.designphil.co.jp/presspdf/170214_brass_EN.pdf",
    registry: "designphil-official-phase612-a",
    name: "DESIGNPHIL",
    summary:
      "官方发布资料给出2017-03-24上市、solid brass、steel Fine、直径11×高102 mm与随附黑色墨囊。",
    publishedAt: "2017-02-14",
  }),
  travelersReview: web({
    key: "phase612-a-travelers-company-pen-addict",
    title: "Traveler's Company Brass Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2020/8/20/travelers-company-brass-fountain-pen-review",
    registry: "pen-addict-phase612-a",
    name: "The Pen Addict",
    summary:
      "独立评测交叉确认短身、摩擦帽、套帽使用、短国际墨囊，并记录未找到合适转换器的样本边界。",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2020-08-20",
  }),
  wearingeulBrand: web({
    key: "phase612-a-wearingeul-brand-story",
    title: "Wearingeul Brand Story",
    url: "https://wearingeul.kr/brand",
    registry: "wearingeul-official-phase612-a",
    name: "Wearingeul",
    summary:
      "官方品牌故事确认2016年起点、2018年Book Perfume与2019年末文学墨水项目，并定义通感式文学设计方法。",
  }),
  wearingeulLocations: web({
    key: "phase612-a-wearingeul-locations",
    title: "Wearingeul Global Locations",
    url: "https://www.wearingeul.com/Locations",
    registry: "wearingeul-official-phase612-a",
    name: "Wearingeul Global",
    summary:
      "全球站明确称Wearingeul为结合文学作品的stationery brand，并列授权销售渠道。",
  }),
  wearingeulPreface: web({
    key: "phase612-a-wearingeul-preface-exact",
    title: "Wearingeul Preface",
    url: "https://www.wearingeul.com/shop_view/?idx=1577",
    registry: "wearingeul-official-phase612-a",
    name: "Wearingeul Global",
    summary:
      "官方exact商品路径锁定idx=1577的Preface家族；The Glass Bead Game与A Dream Within a Dream归为初发主题variants。",
  }),
  wearingeulPenChalet: web({
    key: "phase612-a-wearingeul-preface-pen-chalet",
    title: "Wearingeul Literature Preface Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/wearingeul_literature_preface_fountain_pens.html",
    registry: "pen-chalet-phase612-a",
    name: "Pen Chalet",
    summary:
      "专业零售页给出cellulose acetate、F/M不锈钢尖、原配转换器、2.4 mm接口、螺纹帽与两个初发主题，并暴露接口命名矛盾。",
    sourceType: "retailer",
    tier: "professional_secondary",
  }),
  wearingeulPaperMouse: web({
    key: "phase612-a-wearingeul-paper-mouse",
    title: "Spotlight: Wearingeul",
    url: "https://www.thepapermouse.com/blogs/whats-new-at-the-paper-mouse/spotlight-wearingeul",
    registry: "paper-mouse-phase612-a",
    name: "The Paper Mouse",
    summary:
      "独立文具店专题交叉确认品牌2016年起发展，并以通感方法把文学作品转译为墨水与文具。",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2024-02-27",
  }),
};

type ModelSpecValues = Partial<
  Record<Exclude<SpecFieldKey, "brand_entity_id">, string>
>;

interface PenDefinition {
  key: string;
  entityId: string;
  slug: string;
  name: string;
  markdownFile: string;
  imagePath: string;
  aliases: string[];
  primary: CuratedSource;
  sources: CuratedSource[];
  professional: CuratedSource;
  claim: string;
  boundary: string;
  values: ModelSpecValues;
  fieldSources?: Partial<
    Record<Exclude<SpecFieldKey, "brand_entity_id">, CuratedSource>
  >;
  variants: CuratedVariant[];
  launch?: {
    date: string;
    title: string;
    source: CuratedSource;
    description: string;
  };
}

interface BrandDefinition {
  key: string;
  entityId: string;
  slug: string;
  name: string;
  markdownFile: string;
  imagePath: string;
  aliases: Array<{
    alias: string;
    language: string;
    kind?: "alias" | "former_name";
  }>;
  primary: CuratedSource;
  sources: CuratedSource[];
  professional: CuratedSource;
  claim: string;
  founded?: {
    date: string;
    title: string;
    source: CuratedSource;
    description: string;
  };
  pens: PenDefinition[];
}

const brandDefinitions: BrandDefinition[] = [
  {
    key: "jacques-herbin",
    entityId: PHASE612_BATCH_A_IDS.jacquesHerbinBrand,
    slug: PHASE612_BATCH_A_SLUGS.jacquesHerbinBrand,
    name: "Jacques Herbin",
    markdownFile:
      ".planning/content-research/phase612-a-jacques-herbin-brand.md",
    imagePath:
      "/images/library/site-original/phase612/batch-a/jacques-herbin/brand.svg",
    aliases: [
      { alias: "J. Herbin", language: "en" },
      { alias: "Herbin", language: "en" },
      { alias: "雅克·埃尔班", language: "zh" },
    ],
    primary: S.jacquesStory,
    sources: [
      S.jacquesStory,
      S.jacquesPen,
      S.jacquesCatalog,
      S.jacquesHamilton,
    ],
    professional: S.jacquesHamilton,
    claim:
      "Jacques Herbin的官方历史以1670年Maison Herbin为起点、1798年书写墨水生产为后续阶段；当前品牌同时经营墨水、封蜡与书写工具。",
    founded: {
      date: "1670-01-01",
      title: "Maison Herbin historical starting point",
      source: S.jacquesStory,
      description:
        "1670 is the official house-history starting point, not a launch date for current pens or inks.",
    },
    pens: [
      {
        key: "jacques-herbin-transparent-22000t",
        entityId: PHASE612_BATCH_A_IDS.jacquesHerbinTransparent22000T,
        slug: PHASE612_BATCH_A_SLUGS.jacquesHerbinTransparent22000T,
        name: "Jacques Herbin Transparent Pump-action 22000T",
        markdownFile:
          ".planning/content-research/phase612-a-jacques-herbin-transparent-22000t.md",
        imagePath:
          "/images/library/site-original/phase612/batch-a/jacques-herbin/transparent-22000t.svg",
        aliases: [
          "Jacques Herbin 22000T",
          "J. Herbin Clear Fountain Pen",
          "Herbin Transparent Pump Fountain Pen",
        ],
        primary: S.jacquesPen,
        sources: [
          S.jacquesPen,
          S.jacquesCatalog,
          S.jacquesStory,
          S.jacquesHamilton,
        ],
        professional: S.jacquesHamilton,
        claim:
          "22000T是透明笔身、中号钢尖的钢笔，可拆pump从墨瓶吸墨后像墨囊一样装入，并兼容通用规格墨囊。",
        boundary:
          "Pump是可拆式储墨器，不是笔杆一体活塞或真空机构；22500T走珠笔、22200T替换pump与21900T紧凑墨囊钢笔均为不同商品。",
        values: {
          series_name: "Jacques Herbin transparent writing instruments",
          release_year:
            "current official page and 2024 catalogue verified; launch year not asserted",
          origin_country:
            "French brand; whole-pen manufacturing country not stated on exact page",
          nib: "medium steel nib",
          fill_system:
            "removable pump filled from bottle; universal-format cartridges compatible",
          material:
            "transparent body; exact polymer not asserted from the official page",
          status: "current official exact product page; code 22000T",
        },
        variants: [
          {
            key: "phase612-a-jacques-herbin-22000t-exact",
            name: "Transparent Pump-action 22000T",
            notes:
              "Exact fountain-pen product code; rollerball and replacement pump remain separate products.",
            sourceKey: S.jacquesPen.key,
            variantKind: "market_sku",
            productCode: "22000T",
          },
        ],
      },
    ],
  },
  {
    key: "kakimori",
    entityId: PHASE612_BATCH_A_IDS.kakimoriBrand,
    slug: PHASE612_BATCH_A_SLUGS.kakimoriBrand,
    name: "Kakimori",
    markdownFile: ".planning/content-research/phase612-a-kakimori-brand.md",
    imagePath:
      "/images/library/site-original/phase612/batch-a/kakimori/brand.svg",
    aliases: [
      { alias: "カキモリ", language: "ja" },
      { alias: "Kakimori Tokyo", language: "en" },
      { alias: "柿守", language: "zh" },
    ],
    primary: S.kakimoriAbout,
    sources: [
      S.kakimoriAbout,
      S.kakimoriCompany,
      S.kakimoriAluminium,
      S.kakimoriFrost,
      S.kakimoriYoseka,
      S.kakimoriFrostReview,
    ],
    professional: S.kakimoriFrostReview,
    claim:
      "Kakimori于2010年在东京藏前开店，以定制笔记本、调色墨水和原创书写工具分享愉快书写，并与日本制造者协作开发产品。",
    founded: {
      date: "2010-01-01",
      title: "Kakimori opened in Kuramae, Tokyo",
      source: S.kakimoriAbout,
      description:
        "The 2010 shop opening is distinct from the older corporate history of Hotaka Co. Ltd.",
    },
    pens: [
      {
        key: "kakimori-aluminium-fountain-pen",
        entityId: PHASE612_BATCH_A_IDS.kakimoriAluminiumFountainPen,
        slug: PHASE612_BATCH_A_SLUGS.kakimoriAluminiumFountainPen,
        name: "Kakimori Aluminium Fountain Pen",
        markdownFile:
          ".planning/content-research/phase612-a-kakimori-aluminium-fountain-pen.md",
        imagePath:
          "/images/library/site-original/phase612/batch-a/kakimori/aluminium-fountain-pen.svg",
        aliases: [
          "Kakimori Aluminium pen - Fountain pen",
          "Kakimori Aluminum Fountain Pen",
          "カキモリ アルミニウム 万年筆",
        ],
        primary: S.kakimoriAluminium,
        sources: [
          S.kakimoriAluminium,
          S.kakimoriAluminiumStory,
          S.kakimoriGuide,
          S.kakimoriYoseka,
        ],
        professional: S.kakimoriYoseka,
        claim:
          "Aluminium Fountain Pen是133×10 mm、16 g的磨砂铝细杆钢笔，配德国F/M不锈钢尖和转换器，笔身在日本制造。",
        boundary:
          "Aluminium ballpoint与rollerball是同系列不同书写方式；Frost是14 mm polycarbonate快开帽平台，不能继承本笔的尺寸、材料或不可套帽规则。",
        values: {
          series_name: "Kakimori Aluminium pen",
          release_year: "current official product; launch year not asserted",
          origin_country:
            "body and other components Japan; nib and converter Germany",
          nib: "stainless steel F or M; made in Germany",
          fill_system:
            "converter included; cartridge compatibility should be checked at purchase",
          material: "aluminium body; stainless-steel nib; plastic converter",
          dimensions: "133 mm length; 10 mm diameter",
          weight: "16 g",
          status: "current official exact product page",
        },
        variants: [
          {
            key: "phase612-a-kakimori-aluminium-f",
            name: "Aluminium Fountain Pen F",
            notes: "Fine nib option on the same body platform.",
            sourceKey: S.kakimoriAluminium.key,
            variantKind: "nib",
          },
          {
            key: "phase612-a-kakimori-aluminium-m",
            name: "Aluminium Fountain Pen M",
            notes: "Medium nib option on the same body platform.",
            sourceKey: S.kakimoriAluminium.key,
            variantKind: "nib",
          },
        ],
      },
      {
        key: "kakimori-frost",
        entityId: PHASE612_BATCH_A_IDS.kakimoriFrost,
        slug: PHASE612_BATCH_A_SLUGS.kakimoriFrost,
        name: "Kakimori Frost",
        markdownFile: ".planning/content-research/phase612-a-kakimori-frost.md",
        imagePath:
          "/images/library/site-original/phase612/batch-a/kakimori/frost.svg",
        aliases: [
          "Kakimori Frost Fountain Pen",
          "カキモリ Frost 万年筆",
          "Kakimori Frost FP",
        ],
        primary: S.kakimoriFrost,
        sources: [
          S.kakimoriFrost,
          S.kakimoriFrostLaunch,
          S.kakimoriGuide,
          S.kakimoriFrostReview,
        ],
        professional: S.kakimoriFrostReview,
        claim:
          "Frost是134×14 mm、14 g的半透明polycarbonate书写工具平台，钢笔版配德国F/M不锈钢尖、转换器与四头螺纹笔帽。",
        boundary:
          "Frost rollerball replacement nib是另一书写端；Translucent、Graphite、Moss、Violet与Amber是颜色variants，不拆成独立型号；笔身不作eyedropper储墨。",
        values: {
          series_name: "Kakimori Frost",
          release_year: "2024-10-01",
          origin_country:
            "body and packaging designed, manufactured and assembled in Japan; nib and converter Germany",
          nib: "stainless steel F or M; Schmidt; replaceable unit",
          fill_system:
            "converter included; not intended for eyedropper filling",
          material:
            "polycarbonate body; stainless-steel nib; plastic converter",
          dimensions: "134 mm length; 14 mm diameter",
          weight: "14 g",
          status: "current Frost family with multiple colour variants",
        },
        variants: ["Translucent", "Graphite", "Moss", "Violet", "Amber"].map(
          (name) => ({
            key: `phase612-a-kakimori-frost-${name.toLowerCase()}`,
            name: `Frost - ${name}`,
            notes:
              "Colour variant on the same Frost fountain-pen platform; rollerball remains a separate writing mode.",
            sourceKey: S.kakimoriFrost.key,
            variantKind: "color" as const,
          }),
        ),
        launch: {
          date: "2024-10-01",
          title: "Kakimori Frost launched",
          source: S.kakimoriFrostLaunch,
          description:
            "Official launch date for the redesigned Frost writing-tool family.",
        },
      },
    ],
  },
  {
    key: "kolo",
    entityId: PHASE612_BATCH_A_IDS.koloBrand,
    slug: PHASE612_BATCH_A_SLUGS.koloBrand,
    name: "Kolo",
    markdownFile: ".planning/content-research/phase612-a-kolo-brand.md",
    imagePath: "/images/library/site-original/phase612/batch-a/kolo/brand.svg",
    aliases: [
      { alias: "KOLO", language: "en" },
      { alias: "Kolo New York", language: "en" },
    ],
    primary: S.koloAbout,
    sources: [S.koloAbout, S.koloCollection, S.koloAcrylic, S.koloReview],
    professional: S.koloReview,
    claim:
      "Kolo创立于1998年，以相册与journal起步，2016年被Topdrawer收购后继续发展纸品、包袋与精细书写工具。",
    founded: {
      date: "1998-01-01",
      title: "Kolo founded",
      source: S.koloAbout,
      description:
        "Official founding year for the brand; it is not the release date of Tino.",
    },
    pens: [
      {
        key: "kolo-tino",
        entityId: PHASE612_BATCH_A_IDS.koloTino,
        slug: PHASE612_BATCH_A_SLUGS.koloTino,
        name: "Kolo Tino",
        markdownFile: ".planning/content-research/phase612-a-kolo-tino.md",
        imagePath:
          "/images/library/site-original/phase612/batch-a/kolo/tino.svg",
        aliases: [
          "Kolo Tino Fountain Pen",
          "Tino Acrylic Fountain Pen",
          "Tino Brass Fountain Pen",
        ],
        primary: S.koloCollection,
        sources: [
          S.koloCollection,
          S.koloAcrylic,
          S.koloAbout,
          S.koloReview,
          S.koloPenBoutique,
        ],
        professional: S.koloReview,
        claim:
          "Tino是维也纳设计师构思的短身套帽钢笔家族，以圆角三边轮廓提供raw brass、raw aluminum与Italian acrylic等材料版本。",
        boundary:
          "Tino ballpoint是另一书写方式；重量和尺寸按材料版本取证；官方acrylic页只确认短国际墨囊，转换器兼容须按具体版本实测。",
        values: {
          series_name: "Kolo Tino Fountain Pen",
          release_year:
            "current family page verified; launch year not asserted",
          origin_country:
            "conceived by Vienna designers; produced across Austrian and Czech workshops; acrylic exact version made in Czech Republic",
          nib: "German-engineered steel nib/housing; common Schmidt no.5; size by current SKU",
          fill_system:
            "standard international short cartridges confirmed for acrylic; converter compatibility version-specific",
          material:
            "raw brass, raw aluminum or bespoke Italian acrylic material variants",
          dimensions: "acrylic exact version 105.5 mm capped; 136.5 mm posted",
          weight:
            "acrylic official 21 g; brass review sample about 69 g; aluminum review reference about 27 g",
          status: "current Tino family with material and limited variants",
        },
        fieldSources: {
          dimensions: S.koloAcrylic,
          weight: S.koloReview,
          fill_system: S.koloAcrylic,
        },
        variants: [
          {
            key: "phase612-a-kolo-tino-acrylic",
            name: "Tino Acrylic Fountain Pen",
            notes:
              "21 g exact acrylic scope using bespoke Italian acrylic; dimensions are not inherited by metal variants.",
            sourceKey: S.koloAcrylic.key,
            variantKind: "material",
          },
          {
            key: "phase612-a-kolo-tino-raw-brass",
            name: "Tino Raw Brass Fountain Pen",
            notes:
              "Raw-brass material variant with materially higher sample weight and natural patina.",
            sourceKey: S.koloCollection.key,
            variantKind: "material",
          },
          {
            key: "phase612-a-kolo-tino-raw-aluminum",
            name: "Tino Raw Aluminum Fountain Pen",
            notes:
              "Raw-aluminum material variant; exact dimensions and converter fit require its own SKU evidence.",
            sourceKey: S.koloCollection.key,
            variantKind: "material",
          },
        ],
      },
    ],
  },
  {
    key: "travelers-company",
    entityId: PHASE612_BATCH_A_IDS.travelersCompanyBrand,
    slug: PHASE612_BATCH_A_SLUGS.travelersCompanyBrand,
    name: "TRAVELER'S COMPANY",
    markdownFile:
      ".planning/content-research/phase612-a-travelers-company-brand.md",
    imagePath:
      "/images/library/site-original/phase612/batch-a/travelers-company/brand.svg",
    aliases: [
      { alias: "Travelers Company", language: "en" },
      { alias: "TRC", language: "en" },
      {
        alias: "MIDORI Traveler's Company",
        language: "en",
        kind: "former_name",
      },
      { alias: "旅行者公司", language: "zh" },
    ],
    primary: S.travelersAbout,
    sources: [
      S.travelersAbout,
      S.travelersPen,
      S.travelersRelease,
      S.travelersPress,
      S.travelersReview,
    ],
    professional: S.travelersReview,
    claim:
      "TRAVELER'S COMPANY是DESIGNPHIL旗下旅行记录品牌，2015年从MIDORI更名为现名，产品体系包括TRAVELER'S notebook与BRASS PRODUCTS。",
    founded: {
      date: "2015-01-01",
      title: "TRAVELER'S COMPANY name adopted",
      source: S.travelersAbout,
      description:
        "The 2015 name change is not the launch date of every notebook or Brass Product.",
    },
    pens: [
      {
        key: "travelers-company-brass-fountain-pen",
        entityId: PHASE612_BATCH_A_IDS.travelersCompanyBrassFountainPen,
        slug: PHASE612_BATCH_A_SLUGS.travelersCompanyBrassFountainPen,
        name: "TRAVELER'S COMPANY Brass Fountain Pen",
        markdownFile:
          ".planning/content-research/phase612-a-travelers-company-brass-fountain-pen.md",
        imagePath:
          "/images/library/site-original/phase612/batch-a/travelers-company/brass-fountain-pen.svg",
        aliases: [
          "Traveler's Company Brass Fountain Pen",
          "TRC Brass Fountain Pen",
          "Midori Traveler's Brass Fountain Pen",
        ],
        primary: S.travelersPen,
        sources: [
          S.travelersPen,
          S.travelersRelease,
          S.travelersPress,
          S.travelersAbout,
          S.travelersReview,
        ],
        professional: S.travelersReview,
        claim:
          "Brass Fountain Pen是2017年加入BRASS PRODUCTS的102×11 mm实心黄铜口袋钢笔，配Fine钢尖与短国际墨囊，并在日本制造。",
        boundary:
          "2020年的包装与clip等细节调整属于同一钢笔延续；2020 rollerball、ballpoint与pencil是不同书写工具；官方未承诺转换器兼容。",
        values: {
          series_name: "TRAVELER'S COMPANY BRASS PRODUCTS",
          release_year: "2017-03-24; detail and packaging update in 2020",
          origin_country: "Japan",
          nib: "stainless-steel Fine nib",
          fill_system:
            "European/standard international short cartridge; converter not officially specified",
          material: "solid brass body; iron-finish clip and related fittings",
          dimensions: "11 mm diameter; 102 mm capped length",
          status: "current BRASS PRODUCTS fountain pen",
        },
        fieldSources: {
          release_year: S.travelersPress,
          dimensions: S.travelersPress,
        },
        variants: [
          {
            key: "phase612-a-travelers-brass-2017",
            name: "Brass Fountain Pen 2017 release",
            releaseYear: "2017",
            notes:
              "Original documented release establishing the solid-brass, Fine-nib cartridge pen identity.",
            sourceKey: S.travelersPress.key,
            variantKind: "edition_group",
          },
          {
            key: "phase612-a-travelers-brass-2020",
            name: "Brass Fountain Pen 2020 detail update",
            releaseYear: "2020",
            notes:
              "Packaging and fitting detail continuation of the same fountain-pen family; not the 2020 rollerball.",
            sourceKey: S.travelersPen.key,
            variantKind: "edition_group",
          },
        ],
        launch: {
          date: "2017-03-24",
          title: "BRASS FOUNTAIN PEN released",
          source: S.travelersPress,
          description:
            "Official retail launch date for the fountain pen within BRASS PRODUCTS.",
        },
      },
    ],
  },
  {
    key: "wearingeul",
    entityId: PHASE612_BATCH_A_IDS.wearingeulBrand,
    slug: PHASE612_BATCH_A_SLUGS.wearingeulBrand,
    name: "Wearingeul",
    markdownFile: ".planning/content-research/phase612-a-wearingeul-brand.md",
    imagePath:
      "/images/library/site-original/phase612/batch-a/wearingeul/brand.svg",
    aliases: [
      { alias: "글입다", language: "ko" },
      { alias: "Wearingeul Global", language: "en" },
      { alias: "Different Reading, Wearingeul", language: "en" },
    ],
    primary: S.wearingeulBrand,
    sources: [
      S.wearingeulBrand,
      S.wearingeulLocations,
      S.wearingeulPreface,
      S.wearingeulPaperMouse,
    ],
    professional: S.wearingeulPaperMouse,
    claim:
      "Wearingeul是2016年起发展的韩国文学设计品牌，以通感方式把作品与人物转译为颜色、气味、墨水、纸品和书写工具。",
    founded: {
      date: "2016-01-01",
      title: "Wearingeul brand launched",
      source: S.wearingeulBrand,
      description:
        "Official brand-history year, preceding the 2018 book-perfume and late-2019 literature-ink projects.",
    },
    pens: [
      {
        key: "wearingeul-preface",
        entityId: PHASE612_BATCH_A_IDS.wearingeulPreface,
        slug: PHASE612_BATCH_A_SLUGS.wearingeulPreface,
        name: "Wearingeul Preface",
        markdownFile:
          ".planning/content-research/phase612-a-wearingeul-preface.md",
        imagePath:
          "/images/library/site-original/phase612/batch-a/wearingeul/preface.svg",
        aliases: [
          "Wearingeul Literature Preface",
          "Wearingeul Literary Preface Series",
          "Wearingeul Preface Fountain Pen",
        ],
        primary: S.wearingeulPreface,
        sources: [
          S.wearingeulPreface,
          S.wearingeulBrand,
          S.wearingeulPenChalet,
          S.wearingeulPaperMouse,
        ],
        professional: S.wearingeulPenChalet,
        claim:
          "Preface是Wearingeul的文学主题钢笔家族，初发The Glass Bead Game与A Dream Within a Dream两款cellulose-acetate主题variants，配F/M不锈钢尖和原配转换器。",
        boundary:
          "两个文学主题是同一Preface平台的variants，同名墨水是另一商品；2.4 mm接口的proprietary与广泛兼容说法冲突，备用件必须按原配和实物确认。",
        values: {
          series_name: "Wearingeul Literary Preface Series",
          release_year:
            "initial 2026 release documented; exact launch day not asserted",
          origin_country:
            "Korean brand; whole-pen manufacturing country not established by accessible evidence",
          nib: "plated stainless-steel F or M; slightly smaller than common no.5",
          fill_system:
            "cartridge/converter; converter included; 2.4 mm connection with compatibility to be checked physically",
          material:
            "cellulose-acetate/resin body with individual pattern variation; plated metal trim",
          status: "current Preface family with two initial literature themes",
        },
        fieldSources: {
          nib: S.wearingeulPenChalet,
          fill_system: S.wearingeulPenChalet,
          material: S.wearingeulPenChalet,
        },
        variants: [
          {
            key: "phase612-a-wearingeul-preface-glass-bead-game",
            name: "Preface - The Glass Bead Game",
            notes:
              "Initial literature-theme colour/material variant on the shared Preface platform.",
            sourceKey: S.wearingeulPenChalet.key,
            variantKind: "color",
          },
          {
            key: "phase612-a-wearingeul-preface-dream-within-dream",
            name: "Preface - A Dream Within a Dream",
            notes:
              "Initial literature-theme colour/material variant on the shared Preface platform.",
            sourceKey: S.wearingeulPenChalet.key,
            variantKind: "color",
          },
        ],
      },
    ],
  },
];

function brandPack(definition: BrandDefinition): CuratedEntityPack {
  const scopeKey = `phase612-a-${definition.key}-brand-scope`;
  const diagram = image({
    key: `${definition.key}-brand`,
    title: `${definition.name} 品牌事实示意图`,
    localPath: definition.imagePath,
  });
  const sources = [
    ...new Map(
      [...definition.sources, diagram].map((source) => [source.key, source]),
    ).values(),
  ];

  return {
    key: `phase612-a-${definition.key}-brand-v1`,
    entityId: definition.entityId,
    expectedType: "brand",
    expectedSlug: definition.slug,
    canonicalName: definition.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: definition.markdownFile,
    storyTitle: `${definition.name}：品牌历史、书写工具与型号导航`,
    primarySourceKey: definition.primary.key,
    depthTier: "A",
    aliases: definition.aliases.map(({ alias, language, kind }) => ({
      alias,
      language,
      kind,
      sourceKey: definition.primary.key,
    })),
    sources,
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope:
          "Only specifically sourced public fountain-pen families are linked; sibling writing modes and colour-only variants remain scoped separately.",
      },
    ],
    claims: [
      {
        key: `phase612-a-${definition.key}-brand-identity`,
        predicate: "brand_identity",
        objectText: definition.claim,
        factClass: "core",
        confidence: 0.99,
        sourceKey: definition.primary.key,
        locator: definition.primary.summary,
        evidence: [
          {
            key: `phase612-a-${definition.key}-brand-primary-evidence`,
            sourceKey: definition.primary.key,
            scopeKey,
            locator: definition.primary.summary,
          },
          {
            key: `phase612-a-${definition.key}-brand-professional-evidence`,
            sourceKey: definition.professional.key,
            scopeKey,
            locator: definition.professional.summary,
          },
          ...definition.pens.map((pen) => ({
            key: `phase612-a-${definition.key}-brand-model-${pen.key}`,
            sourceKey: pen.primary.key,
            scopeKey,
            locator: pen.primary.summary,
          })),
        ],
      },
    ],
    timeline: [
      ...(definition.founded
        ? [
            {
              key: `phase612-a-${definition.key}-brand-history`,
              title: definition.founded.title,
              eventType: "brand_founded" as const,
              startDate: definition.founded.date,
              circa: definition.founded.date.endsWith("01-01"),
              description: definition.founded.description,
              sourceKey: definition.founded.source.key,
            },
          ]
        : []),
      {
        key: `phase612-a-${definition.key}-brand-current-verified`,
        title: `${definition.name} current public identity verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: "Verification date; not a product launch date.",
        sourceKey: definition.primary.key,
      },
    ],
    media: [
      {
        key: `phase612-a-${definition.key}-brand-primary-media`,
        title: `${definition.name} 品牌事实示意图（非产品照片）`,
        sourceKey: diagram.key,
        localPath: diagram.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创事实示意图；非产品照片，不表示真实颜色、纹理、比例、商标或包装。",
        sourceUrl: diagram.url,
        usageStatus: "primary",
      },
    ],
  };
}

function penPack(
  brand: BrandDefinition,
  definition: PenDefinition,
): CuratedEntityPack {
  const scopeKey = `phase612-a-${definition.key}-scope`;
  const diagram = image({
    key: definition.key,
    title: `${definition.name} 事实示意图`,
    localPath: definition.imagePath,
  });
  const sources = [
    ...new Map(
      [...definition.sources, brand.primary, diagram].map((source) => [
        source.key,
        source,
      ]),
    ).values(),
  ];
  const fields = Object.keys(definition.values) as Array<
    Exclude<SpecFieldKey, "brand_entity_id">
  >;
  const rejectedEvidenceKey = `phase612-a-${definition.key}-rejected-sibling-evidence`;

  return {
    key: `phase612-a-${definition.key}-v1`,
    entityId: definition.entityId,
    expectedType: "pen",
    expectedSlug: definition.slug,
    canonicalName: definition.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: definition.markdownFile,
    storyTitle: `${definition.name}：规格、版本边界、维护与选购`,
    primarySourceKey: definition.primary.key,
    depthTier: "A",
    aliases: definition.aliases.map((alias) => ({
      alias,
      language: /[\u3400-\u9fff]/.test(alias)
        ? "zh"
        : /[\u3040-\u30ff]/.test(alias)
          ? "ja"
          : "en",
      sourceKey: definition.primary.key,
    })),
    sources,
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope:
          "Only the documented fountain-pen nib and current SKU options apply; rollerball and ballpoint writing ends do not inherit.",
        materialScope:
          "Material, colour, weight and dimensions remain exact-version scoped where the family has multiple variants.",
        editionScope: definition.boundary,
      },
    ],
    claims: [
      {
        key: `phase612-a-${definition.key}-identity`,
        predicate: "model_identity",
        objectText: definition.claim,
        factClass: "core",
        confidence: 0.99,
        sourceKey: definition.primary.key,
        locator: definition.primary.summary,
        evidence: [
          {
            key: `phase612-a-${definition.key}-identity-primary`,
            sourceKey: definition.primary.key,
            scopeKey,
            locator: definition.primary.summary,
          },
          {
            key: `phase612-a-${definition.key}-identity-professional`,
            sourceKey: definition.professional.key,
            scopeKey,
            locator: definition.professional.summary,
          },
        ],
      },
      {
        key: `phase612-a-${definition.key}-boundary`,
        predicate: "version_boundary",
        objectText: definition.boundary,
        factClass: "core",
        confidence: 0.99,
        sourceKey: definition.professional.key,
        locator: definition.professional.summary,
        evidence: [
          {
            key: `phase612-a-${definition.key}-boundary-evidence`,
            sourceKey: definition.professional.key,
            scopeKey,
            locator: definition.professional.summary,
          },
        ],
      },
    ],
    variants: definition.variants,
    spec: {
      brandEntityId: brand.entityId,
      values: definition.values,
      evidence: [
        evidence(
          "brand_entity_id",
          `phase612-a-${definition.key}-spec-brand`,
          brand.primary.key,
          scopeKey,
          brand.claim,
        ),
        ...fields.map((field) => {
          const source = definition.fieldSources?.[field] ?? definition.primary;
          return evidence(
            field,
            `phase612-a-${definition.key}-spec-${field}`,
            source.key,
            scopeKey,
            source.summary,
          );
        }),
        evidence(
          "status",
          rejectedEvidenceKey,
          definition.professional.key,
          scopeKey,
          definition.boundary,
          false,
        ),
      ],
    },
    conflicts: [
      {
        key: `phase612-a-${definition.key}-identity-boundary-conflict`,
        fieldKey: "identity",
        scopeKey,
        conflictKind: "identity",
        status: "resolved",
        resolutionNote: definition.boundary,
        members: [
          {
            citationKey: `phase612-a-${definition.key}-spec-series_name`,
            assertedValue: "official exact family scope accepted",
          },
          {
            citationKey: rejectedEvidenceKey,
            assertedValue:
              "sibling writing mode or unsupported inheritance rejected",
          },
        ],
      },
    ],
    timeline: [
      ...(definition.launch
        ? [
            {
              key: `phase612-a-${definition.key}-released`,
              title: definition.launch.title,
              eventType: "model_released" as const,
              startDate: definition.launch.date,
              circa: false,
              description: definition.launch.description,
              sourceKey: definition.launch.source.key,
            },
          ]
        : []),
      {
        key: `phase612-a-${definition.key}-current-verified`,
        title: `${definition.name} exact public scope verified`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: "Verification date; not an asserted launch date.",
        sourceKey: definition.primary.key,
      },
    ],
    media: [
      {
        key: `phase612-a-${definition.key}-primary-media`,
        title: `${definition.name} 事实示意图（非产品照片）`,
        sourceKey: diagram.key,
        localPath: diagram.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创事实示意图；非产品照片，不表示真实颜色、纹理、比例、商标或包装。",
        sourceUrl: diagram.url,
        usageStatus: "primary",
      },
    ],
  };
}

export const phase612BatchAGroups: Array<{
  brand: CuratedEntityPack;
  pens: CuratedEntityPack[];
}> = brandDefinitions.map((definition) => ({
  brand: brandPack(definition),
  pens: definition.pens.map((pen) => penPack(definition, pen)),
}));

export const phase612BatchAPacks = phase612BatchAGroups.flatMap(
  ({ brand, pens }) => [brand, ...pens],
);
