import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase163HongdianPacks } from "./phase163-hongdian-models";

export const PHASE176_HONGDIAN_BRAND_ID = "4yRpvovXFoWh";
export const PHASE176_IDS = {
  model516: "BbfCEIAkG7C_",
  model517s: "3Rkby4EUNPt0",
} as const;

const RETRIEVED = "2026-07-25";

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

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    title,
    url,
    registryKey: "fountain-pen-graph-editorial-phase176",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase176",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG；示意图，非产品照片，不作为真实比例、颜色、库存或特定批次品质证明。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const official = source({
  key: "phase176-hongdian-brand-site",
  title: "HongDian 品牌产品与清洁说明页",
  url: "https://hongdianpens.com/",
  registryKey: "hongdianpens-site-phase176",
  registryName: "HongDian Pens product site",
  sourceType: "official",
  tier: "contemporary_archive",
  summary:
    "品牌型产品站展示 HongDian 的日用钢笔、converter 与常温水清洁建议；本批次只把它用于品牌与保养语境，不据此补写创立年份、法人或工厂史。",
  locator: "product overview; converter and room-temperature-water cleaning guidance",
});

const fpc516 = source({
  key: "phase176-hongdian-516-fpc",
  title: "Fountain Pen Companion：Hongdian 516 型号索引",
  url: "https://www.fountainpencompanion.com/pen_brands/79-hongdian/pen_models/3-516",
  registryKey: "fountainpencompanion-hongdian-516-phase176",
  registryName: "Fountain Pen Companion",
  sourceType: "blog",
  tier: "professional_secondary",
  summary:
    "结构化型号索引把 516 作为 Hongdian 的独立型号记录；用于交叉确认型号身份和变体存在，不把用户录入字段当作官方公差或全批次规格。",
  locator: "Hongdian brand; model 516; model identity and variant index",
});

const retailer516 = source({
  key: "phase176-hongdian-516-etsy",
  title: "Etsy HongDian 516 Stainless Steel Fountain Pen 商品记录",
  url: "https://www.etsy.com/hk-en/listing/726826787/hongdian-516-stainless-steel-fountain",
  registryKey: "etsy-hongdian-516-phase176",
  registryName: "Etsy marketplace listing",
  sourceType: "retailer",
  tier: "retailer",
  summary:
    "商品记录列出 516、不锈钢、Fine 约 0.4 mm、按压帽、约 140 mm、约 10 mm、约 30 g 和 converter；这是一个渠道样本，颜色、包装和批次公差不外推。",
  locator: "model 516; stainless steel; Fine 0.4 mm; push cap; 140 mm; 10 mm; 30 g; converter",
});

const fpn3016 = source({
  key: "phase176-hongdian-516-fpn",
  title: "Fountain Pen Network：Hong Dian 3016 讨论中的 516 旁证",
  url: "https://www.fountainpennetwork.com/forum/topic/350220-hong-dian-3016/",
  registryKey: "fpn-hongdian-516-phase176",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "community",
  summary:
    "玩家讨论把 516 与 517S、Black Forest 并列为不同 HongDian 实物；只用于型号边界和市场存在的旁证，不承担当批次规格。",
  locator: "516 mentioned as separate HongDian model alongside 517S and Black Forest",
});

const fpc517s = source({
  key: "phase176-hongdian-517s-fpc",
  title: "Fountain Pen Companion：Hongdian 517S 型号与变体索引",
  url: "https://www.fountainpencompanion.com/pen_brands/79-hongdian/pen_models/1543-517s",
  registryKey: "fountainpencompanion-hongdian-517s-phase176",
  registryName: "Fountain Pen Companion",
  sourceType: "blog",
  tier: "professional_secondary",
  summary:
    "结构化索引将 517S 单列，并记录银色不锈钢、converter／cartridge 等常见变体字段；用于交叉确认型号身份，不升级为官方目录。",
  locator: "Hongdian 517S; silver stainless steel; cartridge/converter variant records",
});

const fpn517s = source({
  key: "phase176-hongdian-517s-fpn",
  title: "Fountain Pen Network：HongDian 517S 长期使用评测",
  url: "https://www.fountainpennetwork.com/forum/topic/360748-hongdian-517s/",
  registryKey: "fpn-hongdian-517s-phase176",
  registryName: "Arcticart, Fountain Pen Network",
  sourceType: "forum",
  tier: "community",
  summary:
    "长期使用评测记录 517S 的全不锈钢结构、螺纹帽、可插帽、#5 尖、EF/F/Fude 选项与 converter 样本问题；体验和个体调校不外推为全批次结论。",
  locator: "body, cap and section stainless steel; screw cap; postable; #5 nib; EF/F/Fude; converter sample",
});

const fpnFamily = source({
  key: "phase176-hongdian-family-fpn",
  title: "Fountain Pen Network：HongDian 系列讨论（517D／517S 边界）",
  url: "https://www.fountainpennetwork.com/forum/topic/359847-hongdian/",
  registryKey: "fpn-hongdian-family-phase176",
  registryName: "Fountain Pen Network community",
  sourceType: "forum",
  tier: "community",
  summary:
    "系列讨论把 517D 的橡胶化涂层与按压帽和 517S 的银色螺纹帽分开描述；用于确认相邻版本边界，不替代具体产品规格。",
  locator: "517D rubberized snap cap versus 517S stainless screw cap distinction",
});

const svg516 = diagram(
  "phase176-hongdian-516-svg",
  "HongDian 516 structure factual diagram",
  "/images/library/site-original/phase176/hongdian/516.svg",
);
const svg517s = diagram(
  "phase176-hongdian-517s-svg",
  "HongDian 517S structure factual diagram",
  "/images/library/site-original/phase176/hongdian/517s.svg",
);

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

const baseBrand = phase163HongdianPacks.find(
  (pack) => pack.expectedType === "brand",
);
if (!baseBrand) throw new Error("Phase 176 HongDian brand prerequisite is missing.");
const brand = structuredClone(baseBrand);
brand.entityId = PHASE176_HONGDIAN_BRAND_ID;
brand.key = "phase176-hongdian-brand-navigation-v1";

function makePen(input: {
  entityId: string;
  slug: string;
  name: string;
  markdownFile: string;
  storyTitle: string;
  summary: string;
  primary: CuratedSource;
  secondary: CuratedSource[];
  svg: CuratedSource;
  aliases: string[];
  scopeKey: string;
  identity: string;
  structure: string;
  nib: string;
  variant: string;
  care: string;
  specs: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  specEvidence: Array<{ fieldKey: SpecFieldKey; sourceKey: string; locator: string }>;
  variants: CuratedEntityPack["variants"];
}): CuratedEntityPack {
  const sources = [input.primary, ...input.secondary, input.svg];
  const sourceKeys = new Set(sources.map((item) => item.key));
  return {
    key: `phase176-hongdian-${input.slug}`,
    entityId: input.entityId,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    depthTier: "B",
    aliases: input.aliases.map((alias) => ({
      alias,
      language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
      sourceKey: input.primary.key,
    })),
    sources,
    scopes: [
      {
        key: input.scopeKey,
        scopeKey: input.scopeKey,
        validFrom: RETRIEVED,
        productionState: "current",
        materialScope:
          "规格绑定到本页型号与已命名市场样本；相邻 HongDian 型号和未核对批次不继承。",
        nibScope:
          "尖号按来源列出的 SKU 或评测样本记录；不把个体手感升级为全批次线宽保证。",
        editionScope:
          "当代零售与实物评测语境；库存、包装和颜色随渠道变化。",
      },
    ],
    claims: [
      {
        key: `${input.slug}-identity`,
        predicate: "model_identity",
        objectText: input.identity,
        factClass: "core",
        confidence: 0.98,
        sourceKey: input.primary.key,
        locator: input.primary.summary,
        evidence: [
          {
            key: `${input.slug}-identity-primary`,
            sourceKey: input.primary.key,
            scopeKey: input.scopeKey,
            locator: "model title and product-specific record",
          },
          {
            key: `${input.slug}-identity-secondary`,
            sourceKey: input.secondary[0]?.key ?? input.primary.key,
            scopeKey: input.scopeKey,
            locator: "independent model index or review",
          },
          {
            key: `${input.slug}-identity-archive`,
            sourceKey: official.key,
            scopeKey: input.scopeKey,
            locator: "HongDian product-site context; no factory-history inference",
          },
        ],
      },
      {
        key: `${input.slug}-structure`,
        predicate: "filling_material_boundary",
        objectText: input.structure,
        factClass: "core",
        confidence: 0.97,
        sourceKey: input.primary.key,
        locator: input.primary.summary,
        evidence: [
          {
            key: `${input.slug}-structure-evidence`,
            sourceKey: input.primary.key,
            scopeKey: input.scopeKey,
            locator: "material, cap and filling fields",
          },
        ],
      },
      {
        key: `${input.slug}-nib`,
        predicate: "nib_boundary",
        objectText: input.nib,
        factClass: "core",
        confidence: 0.96,
        sourceKey: input.primary.key,
        locator: input.primary.summary,
        evidence: [
          {
            key: `${input.slug}-nib-primary`,
            sourceKey: input.primary.key,
            scopeKey: input.scopeKey,
            locator: "nib field or documented sample",
          },
          {
            key: `${input.slug}-nib-secondary`,
            sourceKey: input.secondary[0]?.key ?? input.primary.key,
            scopeKey: input.scopeKey,
            locator: "independent nib description",
          },
        ],
      },
      {
        key: `${input.slug}-variant`,
        predicate: "version_boundary",
        objectText: input.variant,
        factClass: "core",
        confidence: 0.95,
        sourceKey: input.primary.key,
        locator: input.primary.summary,
        evidence: [
          {
            key: `${input.slug}-variant-evidence`,
            sourceKey: input.primary.key,
            scopeKey: input.scopeKey,
            locator: "named color, cap or nib boundary",
          },
        ],
      },
      {
        key: `${input.slug}-care`,
        predicate: "maintenance_boundary",
        objectText: input.care,
        factClass: "editorial",
        confidence: 0.95,
        sourceKey: official.key,
        locator: official.summary,
        evidence: [
          {
            key: `${input.slug}-care-evidence`,
            sourceKey: official.key,
            scopeKey: input.scopeKey,
            locator: "brand cleaning guidance plus filling/material boundary",
          },
        ],
      },
    ],
    variants: input.variants,
    spec: {
      brandEntityId: PHASE176_HONGDIAN_BRAND_ID,
      values: input.specs,
      evidence: [
        evidence("brand_entity_id", `${input.slug}-brand`, input.primary.key, input.scopeKey, "HongDian product context"),
        ...input.specEvidence.map((item) =>
          evidence(
            item.fieldKey,
            `${input.slug}-${item.fieldKey}`,
            sourceKeys.has(item.sourceKey) ? item.sourceKey : input.primary.key,
            input.scopeKey,
            item.locator,
          ),
        ),
      ],
    },
    timeline: [
      {
        key: `${input.slug}-current-record`,
        title: "当前型号记录核对",
        eventType: "model_released",
        startDate: RETRIEVED,
        circa: true,
        description: "该事件表示资料检索日仍可见型号记录，不是首发年份声明。",
        sourceKey: input.primary.key,
      },
    ],
    media: [
      {
        key: `${input.slug}-primary-media`,
        title: `${input.name} 结构事实图（非产品照片）`,
        sourceKey: input.svg.key,
        localPath: input.svg.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。",
        sourceUrl: input.svg.url,
        usageStatus: "primary",
      },
    ],
  };
}

export const phase176Hongdian516517sPacks: CuratedEntityPack[] = [
  brand,
  makePen({
    entityId: PHASE176_IDS.model516,
    slug: "弘典-hongdian-516",
    name: "弘典 HongDian 516",
    markdownFile: ".planning/content-research/hongdian-516-phase176.md",
    storyTitle: "HongDian 516：不锈钢细身笔的型号边界",
    summary:
      "HongDian 516 是一支以不锈钢笔身、按压帽、约 0.4 mm Fine 尖和 converter 为识别点的细身日用笔。本页只记录 516，不把外形相近的 517S、Black Forest 或 516 的不同颜色误写成同一规格。",
    primary: retailer516,
    secondary: [fpc516, fpn3016, official],
    svg: svg516,
    aliases: ["HongDian 516", "Hong Dian 516", "弘典 516"],
    scopeKey: "phase176-hongdian-516-scope",
    identity:
      "HongDian 516 是独立的不锈钢细身日用型号，当前商品记录以 Fine 约 0.4 mm、按压帽和 converter 为识别组合；517S、517D 与 Black Forest 不并入本实体。",
    structure:
      "商品样本列不锈钢笔身、按压式笔帽、约 140 mm 长、约 10 mm 直径、约 30 g 与 converter；这些是渠道样本，不代表所有批次公差。",
    nib:
      "当前商品记录标 Fine、约 0.4 mm；线宽和反馈受纸张、墨水与个体调校影响，不继承其他 HongDian 的 EF、Fude 或软尖描述。",
    variant:
      "516 的颜色、电镀和包装按渠道变化；517S、517D 与 Black Forest 是相邻型号，不用同一外观照片互相证明。",
    care:
      "converter 用常温清水吸排并充分沥干；不长时间浸泡不锈钢笔身，不用酒精、研磨剂或硬物处理电镀和笔尖，接口松动时停止携带并检查密封。",
    specs: {
      series_name: "HongDian 516",
      release_year: "当代零售记录；首发年份未由可靠来源固定",
      origin_country: "商品记录标为中国制造；不据此推断企业沿革",
      nib: "Fine，约 0.4 mm（当前商品样本）",
      fill_system: "converter；墨囊兼容性按地区 SKU 核对",
      material: "不锈钢笔身与金属部件",
      dimensions: "约 140 mm 长、约 10 mm 直径（商品样本）",
      weight: "约 30 g（商品样本）",
      status: "当代零售可见；颜色、包装和库存随渠道变化",
    },
    specEvidence: [
      { fieldKey: "series_name", sourceKey: retailer516.key, locator: "516 product title" },
      { fieldKey: "release_year", sourceKey: retailer516.key, locator: "current retail snapshot; launch year withheld" },
      { fieldKey: "origin_country", sourceKey: retailer516.key, locator: "made in China product field" },
      { fieldKey: "nib", sourceKey: retailer516.key, locator: "Fine nib 0.4 mm" },
      { fieldKey: "fill_system", sourceKey: retailer516.key, locator: "converter included" },
      { fieldKey: "material", sourceKey: retailer516.key, locator: "stainless steel material field" },
      { fieldKey: "dimensions", sourceKey: retailer516.key, locator: "140 mm capped length and 10 mm diameter" },
      { fieldKey: "weight", sourceKey: retailer516.key, locator: "30 g weight field" },
      { fieldKey: "status", sourceKey: retailer516.key, locator: "channel availability snapshot" },
    ],
    variants: [
      { key: "phase176-516-fine", name: "516 Fine（当前商品样本）", notes: "商品页列约 0.4 mm Fine；颜色、包装与库存按渠道核对。", sourceKey: retailer516.key, variantKind: "nib", market: "Global" },
      { key: "phase176-516-adjacent-517s", name: "517S（相邻型号，不并入）", notes: "全不锈钢但采用不同型号和螺纹帽结构，另页记录。", sourceKey: fpn517s.key, variantKind: "edition_group" },
    ],
  }),
  makePen({
    entityId: PHASE176_IDS.model517s,
    slug: "弘典-hongdian-517-517s",
    name: "弘典 HongDian 517/517S",
    markdownFile: ".planning/content-research/hongdian-517s-phase176.md",
    storyTitle: "HongDian 517S：不锈钢螺纹帽与日用尖选项",
    summary:
      "HongDian 517S 是全不锈钢、螺纹帽、converter 两用的细身日用钢笔，常见 EF、F 与 Fude 尖选项。本页以 517S 的型号刻字和实物评测为边界，不把 517D、516 或 Black Forest 的材料、帽型和手感混入。",
    primary: fpn517s,
    secondary: [fpc517s, fpnFamily, official],
    svg: svg517s,
    aliases: ["HongDian 517S", "Hong Dian 517S", "弘典 517S", "HongDian 517/517S"],
    scopeKey: "phase176-hongdian-517s-scope",
    identity:
      "HongDian 517S 是独立的全不锈钢螺纹帽日用型号，评测与型号索引共同记录其 #5 尖、可插帽和 converter 路线；517D、516 与 Black Forest 不并入。",
    structure:
      "长期使用评测记录笔身、笔帽和握位均为不锈钢、螺纹帽可插帽、夹子较长；converter 与笔尖安装状态需要逐支验收。",
    nib:
      "评测样本为 #5 钢尖，市场常见 EF、F、Fude；钢尖偏硬，Fude 是弯尖选项，不自动等于软弹或稳定线宽变化。",
    variant:
      "517S 的银色不锈钢、尖号和包装按 SKU 变化；517D 是橡胶化涂层与按压帽路线，不能作为 517S 的黑色变体。",
    care:
      "换墨先用常温清水吸排 converter，擦干螺纹和握位；不锈钢和电镀件不使用酒精、研磨膏或金属刷，converter 松动或漏墨时停止携带并检查接口。",
    specs: {
      series_name: "HongDian 517S",
      release_year: "当代型号；首发年份未由可靠来源固定",
      origin_country: "实物与型号索引均指向中国制造语境；不扩写企业史",
      nib: "常见 EF、F、Fude；钢制 #5 尖，具体组合按 SKU 核对",
      fill_system: "Converter／cartridge 两用；converter 安装状态需验收",
      material: "不锈钢笔身、笔帽与握位；表面和电镀随版本变化",
      dimensions: "约同小型日用笔体量；完整目录尺寸未在本批次固定",
      weight: "金属结构偏有分量；具体重量以实物或 SKU 为准",
      status: "当代市场可见；不同颜色、尖号与库存随渠道变化",
    },
    specEvidence: [
      { fieldKey: "series_name", sourceKey: fpc517s.key, locator: "517S model index" },
      { fieldKey: "release_year", sourceKey: fpn517s.key, locator: "review date and current model record; launch year withheld" },
      { fieldKey: "origin_country", sourceKey: fpn517s.key, locator: "HongDian sample and manufacturing context" },
      { fieldKey: "nib", sourceKey: fpn517s.key, locator: "#5 nib; EF/F/Fude options in review" },
      { fieldKey: "fill_system", sourceKey: fpn517s.key, locator: "converter with agitator sample" },
      { fieldKey: "material", sourceKey: fpn517s.key, locator: "body, cap and section stainless steel" },
      { fieldKey: "dimensions", sourceKey: fpn517s.key, locator: "small daily-pen form; no universal catalog dimensions" },
      { fieldKey: "weight", sourceKey: fpn517s.key, locator: "review notes metal weight and balance" },
      { fieldKey: "status", sourceKey: fpc517s.key, locator: "current model and variant index" },
    ],
    variants: [
      { key: "phase176-517s-silver-steel", name: "517S 银色不锈钢", notes: "Fountain Pen Companion 记录的常见银色不锈钢版本；尖号与包装仍按 SKU 核对。", sourceKey: fpc517s.key, variantKind: "material", market: "Global" },
      { key: "phase176-517s-fude-boundary", name: "517S Fude（尖号选项）", notes: "评测提及 Fude 市场选项；不将弯尖写成软弹尖，也不并入 517D。", sourceKey: fpn517s.key, variantKind: "nib" },
      { key: "phase176-517d-boundary", name: "517D（相邻型号，不并入）", notes: "系列讨论记录橡胶化涂层和按压帽，不能作为 517S 黑色变体。", sourceKey: fpnFamily.key, variantKind: "edition_group" },
    ],
  }),
];
