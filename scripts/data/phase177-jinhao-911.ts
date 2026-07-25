import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase63JinhaoPacks } from "./phase63-jinhao-split";

export const PHASE177_JINHAO_BRAND_ID = "Yulxwu7PuQAU";
export const PHASE177_911_ID = "CVSvZoIPB42k";
const RETRIEVED = "2026-07-25";
const SCOPE = "phase177-jinhao-911-scope";

function source(input: {
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
  const absolute = input.url.startsWith("http");
  return {
    ...input,
    independenceGroup: input.registryKey,
    homepageUrl: absolute ? new URL(input.url).origin : "/",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const official = source({
  key: "phase177-jinhao-official-911",
  title: "Jinhao 官方产品站：911 护尖钢笔与附件",
  url: "https://jinhaoproducts.com/",
  registryKey: "jinhaoproducts-phase177-911",
  registryName: "Jinhao Products",
  sourceType: "official",
  tier: "contemporary_archive",
  summary:
    "Jinhao 产品站将 911 作为独立的轻量护尖型号展示，并写出墨囊与 converter 附件语境；本页只用于当代型号与附件边界，不据此扩写公司沿革。",
  locator: "911 product listing; hooded nib; lightweight; ink cartridge and converter context",
});

const retailer = source({
  key: "phase177-jinhao-911-ttpen",
  title: "TTpen：2PCS Jinhao 911 Extra Fine Matte Black",
  url: "https://www.ttpen.com/products/2pcs-jinhao-911-fountain-pen-extra-fine-nib-matte-black",
  registryKey: "ttpen-jinhao-911-phase177",
  registryName: "TTpen",
  sourceType: "retailer",
  tier: "retailer",
  summary:
    "商品页列 JH911-P2、黑色哑光、电镀金／银饰件、约 0.38 mm Extra Fine 护尖、按压帽、墨囊与 converter；双支是商品包装，不是两个型号实体。",
  locator: "JH911-P2; matte black; gold/silver trim; 0.38 mm hooded EF; push cap; cartridges and converters",
});

const pastor = source({
  key: "phase177-jinhao-911-pastor-and-pen",
  title: "Pastor and Pen：Jinhao 911 Fountain Pen Review",
  url: "https://www.pastorandpen.com/blog/2019/2/15/jinhao-911-fountain-pen-review",
  registryKey: "pastorandpen-jinhao-911-phase177",
  registryName: "Pastor and Pen",
  sourceType: "blog",
  tier: "professional_secondary",
  summary:
    "独立评测提供 911 的护尖结构、细字定位与日用取舍旁证；手感、起笔和品控只作为样本体验，不能升级为每支 911 的保证。",
  locator: "Jinhao 911 review; hooded nib; writing and daily-use sample observations",
});

const fpn = source({
  key: "phase177-jinhao-911-fpn",
  title: "Fountain Pen Network：Jinhao 911 review archive",
  url: "https://www.fountainpennetwork.com/forum/topic/319628-jinhao-911-review/",
  registryKey: "fpn-jinhao-911-phase177",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "community",
  summary:
    "长期玩家评测记录 911 的护尖、按压帽、细长金属笔身与个体笔尖体验；用于交叉验证型号存在和维护风险，不承担统一规格。",
  locator: "911 hooded nib, push cap, metal body and individual writing sample",
});

const family = source({
  key: "phase177-jinhao-911-family-boundary",
  title: "Fountain Pen Network：Jinhao 86／911 与其他护尖型号讨论",
  url: "https://www.fountainpennetwork.com/forum/topic/379522-all-new-jinhao-313/",
  registryKey: "fpn-jinhao-family-phase177",
  registryName: "Fountain Pen Network community",
  sourceType: "forum",
  tier: "community",
  summary:
    "型号讨论把 86、85、911 与 Hero 329 等护尖路线分开，并指出它们在帽型、笔身和密封方式上有差异；用于导航边界，不作为 911 规格来源。",
  locator: "Jinhao 86, 85, 911 and Hero 329 comparison boundary",
});

const svg: CuratedSource = {
  key: "phase177-jinhao-911-svg",
  title: "Jinhao 911 结构事实图（本站原创）",
  url: "/images/library/site-original/phase177/jinhao/911.svg",
  registryKey: "fountain-pen-graph-editorial-phase177",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase177",
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  allowedUse: "store_full",
  license: "site-original",
  summary: "本站原创 factual SVG；示意图，非产品照片，不证明比例、颜色、重量或库存。",
  archiveUrl: "/images/library/site-original/phase177/jinhao/911.svg",
  archiveLocator: "project-public-asset:/images/library/site-original/phase177/jinhao/911.svg;factual-svg=true;product-photo=false;not-to-scale=true",
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const baseBrand = phase63JinhaoPacks.find((pack) => pack.expectedType === "brand");
if (!baseBrand) throw new Error("Phase 177 Jinhao brand prerequisite is missing.");
const brand = structuredClone(baseBrand);
brand.entityId = PHASE177_JINHAO_BRAND_ID;
brand.key = "phase177-jinhao-brand-navigation-v1";

export const phase177Jinhao911Packs: CuratedEntityPack[] = [
  brand,
  {
    key: "phase177-jinhao-911-v1",
    entityId: PHASE177_911_ID,
    expectedType: "pen",
    expectedSlug: "金豪-jinhao-911",
    canonicalName: "金豪 Jinhao 911",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/jinhao-911-phase177.md",
    storyTitle: "Jinhao 911：带护尖的轻量细字日用笔",
    primarySourceKey: retailer.key,
    depthTier: "B",
    aliases: [
      { alias: "Jinhao 911", language: "en", sourceKey: retailer.key },
      { alias: "金豪 911", language: "zh", sourceKey: retailer.key },
      { alias: "Jinhao 911 Hooded Nib", language: "en", sourceKey: official.key },
    ],
    sources: [official, retailer, pastor, fpn, family, svg],
    scopes: [
      {
        key: SCOPE,
        scopeKey: SCOPE,
        validFrom: RETRIEVED,
        productionState: "current",
        materialScope: "金属哑光笔身与电镀饰件按当前商品样本记录；不同套装和批次不互相继承。",
        nibScope: "约 0.38 mm EF 护尖是商品样本字段；个体线宽和调校按实物核验。",
        editionScope: "当代零售型号；双支套装、金／银饰件与墨水附件是市场 SKU 边界。",
      },
    ],
    claims: [
      {
        key: "phase177-jinhao-911-identity",
        predicate: "model_identity",
        objectText: "Jinhao 911 是独立的黑色哑光金属护尖型号，常见按压帽、约 0.38 mm Extra Fine 尖与 converter／墨囊套装；它不与 Jinhao 86、85、Hero 329 或 Parker 51 合并。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: retailer.key,
        locator: retailer.summary,
        evidence: [
          { key: "phase177-jinhao-911-identity-retailer", sourceKey: retailer.key, scopeKey: SCOPE, locator: "911 title, SKU and product fields" },
          { key: "phase177-jinhao-911-identity-official", sourceKey: official.key, scopeKey: SCOPE, locator: "Jinhao site lists 911 separately" },
          { key: "phase177-jinhao-911-identity-review", sourceKey: pastor.key, scopeKey: SCOPE, locator: "independent 911 model review" },
        ],
      },
      {
        key: "phase177-jinhao-911-structure",
        predicate: "hooded_nib_filling_boundary",
        objectText: "911 的护尖、按压帽和轻量金属笔身构成主要结构边界；商品套装附 converter 与墨囊，但双支包装不代表新增型号。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: retailer.key,
        locator: retailer.summary,
        evidence: [
          { key: "phase177-jinhao-911-structure-retailer", sourceKey: retailer.key, scopeKey: SCOPE, locator: "hooded nib, push cap and included accessories" },
          { key: "phase177-jinhao-911-structure-fpn", sourceKey: fpn.key, scopeKey: SCOPE, locator: "long-term review of cap and metal body" },
        ],
      },
      {
        key: "phase177-jinhao-911-nib",
        predicate: "nib_boundary",
        objectText: "当前商品样本标 Extra Fine 护尖约 0.38 mm；Pastor and Pen 与论坛评测只提供个体书写体验，不能把顺滑、湿度或线宽承诺给所有 911。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: retailer.key,
        locator: retailer.summary,
        evidence: [
          { key: "phase177-jinhao-911-nib-retailer", sourceKey: retailer.key, scopeKey: SCOPE, locator: "0.38 mm Extra Fine hooded nib" },
          { key: "phase177-jinhao-911-nib-pastor", sourceKey: pastor.key, scopeKey: SCOPE, locator: "independent nib and writing sample" },
        ],
      },
      {
        key: "phase177-jinhao-911-boundary",
        predicate: "version_boundary",
        objectText: "911 的金／银饰件和双支套装属于市场 SKU；Jinhao 86、85、Hero 329 与 Parker 51 是相邻比较对象，不能用其帽型、尺寸或密封事实覆盖 911。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: family.key,
        locator: family.summary,
        evidence: [
          { key: "phase177-jinhao-911-boundary-family", sourceKey: family.key, scopeKey: SCOPE, locator: "86/85/911/Hero 329 model separation" },
          { key: "phase177-jinhao-911-boundary-retailer", sourceKey: retailer.key, scopeKey: SCOPE, locator: "gold/silver trim and two-pen pack fields" },
        ],
      },
      {
        key: "phase177-jinhao-911-care",
        predicate: "maintenance_boundary",
        objectText: "护尖与 converter 换墨以常温清水吸排为主，避免热水、酒精、研磨剂和硬针；遇到漏墨、断墨或护尖错位先停用并检查接口，不自行拆护尖或用胶水改变密封。",
        factClass: "editorial",
        confidence: 0.95,
        sourceKey: official.key,
        locator: official.summary,
        evidence: [{ key: "phase177-jinhao-911-care-evidence", sourceKey: official.key, scopeKey: SCOPE, locator: "brand accessory and conservative cleaning context" }],
      },
    ],
    variants: [
      { key: "phase177-jinhao-911-black-gold", name: "黑色哑光／金色饰件", notes: "TTpen 双支商品中的一个饰件版本；不作为新型号。", sourceKey: retailer.key, variantKind: "color", market: "Global" },
      { key: "phase177-jinhao-911-black-silver", name: "黑色哑光／银色饰件", notes: "TTpen 双支商品中的另一个饰件版本；套装数量不改变模型身份。", sourceKey: retailer.key, variantKind: "color", market: "Global" },
      { key: "phase177-jinhao-911-family-boundary", name: "Jinhao 86／85（相邻型号，不并入）", notes: "护尖路线相近但帽型、笔身和密封资料不同。", sourceKey: family.key, variantKind: "edition_group" },
    ],
    spec: {
      brandEntityId: PHASE177_JINHAO_BRAND_ID,
      values: {
        series_name: "Jinhao 911",
        release_year: "当代市场型号；首发年份未由可靠来源固定",
        origin_country: "Jinhao 中国产品线；具体批次按实物与渠道核对",
        nib: "Extra Fine 护尖，约 0.38 mm（商品样本）",
        fill_system: "converter／墨囊路线；套装附件按 SKU 核对",
        material: "金属笔身，黑色哑光表面与金／银电镀饰件版本",
        dimensions: "完整统一目录尺寸未在本批次固定",
        weight: "商品与评测均指向轻量路线；具体重量按实物核对",
        status: "当代市场可见；双支套装、饰件颜色与库存随渠道变化",
      },
      evidence: [
        evidence("brand_entity_id", "phase177-jinhao-911-brand", retailer.key, "Jinhao maker context"),
        evidence("series_name", "phase177-jinhao-911-series", retailer.key, "911 model title and SKU"),
        evidence("release_year", "phase177-jinhao-911-release", pastor.key, "dated review; launch year withheld"),
        evidence("origin_country", "phase177-jinhao-911-origin", official.key, "Jinhao product-line context"),
        evidence("nib", "phase177-jinhao-911-nib", retailer.key, "0.38 mm Extra Fine hooded nib"),
        evidence("fill_system", "phase177-jinhao-911-fill", retailer.key, "cartridges and converters included"),
        evidence("material", "phase177-jinhao-911-material", retailer.key, "matte black metal body and electroplated trim"),
        evidence("dimensions", "phase177-jinhao-911-dimensions", pastor.key, "review boundary; no universal catalog dimension"),
        evidence("weight", "phase177-jinhao-911-weight", pastor.key, "lightweight daily-use positioning"),
        evidence("status", "phase177-jinhao-911-status", retailer.key, "current retail snapshot"),
      ],
    },
    timeline: [
      { key: "phase177-jinhao-911-current", title: "911 当代型号记录", eventType: "model_released", startDate: RETRIEVED, circa: true, description: "资料检索日仍可见 911 商品与评测记录；不是首发年份声明。", sourceKey: retailer.key },
    ],
    media: [
      {
        key: "phase177-jinhao-911-primary-media",
        title: "Jinhao 911 结构事实图（非产品照片）",
        sourceKey: svg.key,
        localPath: svg.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText: "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。",
        sourceUrl: svg.url,
        usageStatus: "primary",
      },
    ],
  },
];
