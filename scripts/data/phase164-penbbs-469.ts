import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase72PenBbsPacks, PHASE72_PENBBS_BRAND_ID } from "./phase72-delike-duke-penbbs";

export const PHASE164_PENBBS_ID = "ZTVu5igxPOHe";
export const PHASE164_PENBBS_BRAND_ID = PHASE72_PENBBS_BRAND_ID;
const RETRIEVED = "2026-07-24";

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
  return {
    ...input,
    homepageUrl: new URL(input.url).origin,
    independenceGroup: input.registryKey,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const S = {
  penAddict: source({
    key: "phase164-penbbs-469-penaddict",
    title: "The Pen Addict: PenBBS 469 Double Ended Fountain Pen",
    url: "https://www.penaddict.com/blog/2023/1/11/penbbs-469-double-ended-fountain-pen",
    registryKey: "pen-addict-469-phase164",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2023 实物评测记录双端、双独立储墨腔、两枚帽和 F/M 尖；两端用 eyedropper，握位 O-ring 防渗，不能把双端结构当成普通 converter 或真空笔。",
    locator: "two separate cavities; two caps/nibs/feeds; F/M; eyedropper filling; O-rings",
  }),
  parka: source({
    key: "phase164-penbbs-469-parkablogs",
    title: "Parka Blogs: PENBBS 469 dual nib fountain pen",
    url: "https://www.parkablogs.com/content/review-penbbs-469-dual-nib-fountain-pen",
    registryKey: "parka-blogs-469-phase164",
    registryName: "Parka Blogs",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2020 评测交叉确认 469 两端笔尖、亚克力/塑料外观、随笔滴管和 rollerball section；记录样本可拆洗、储墨量约普通 converter、尖较硬。",
    locator: "dual nibs; acrylic/plastic body; eyedropper and rollerball section; no piston; sample cleaning and nib feel",
  }),
  gentleman: source({
    key: "phase164-penbbs-469-gentleman",
    title: "The Gentleman Stationer: PenBBS 469 review",
    url: "https://www.gentlemanstationer.com/blog/2019/6/15/penbbs-469",
    registryKey: "gentleman-stationer-469-phase164",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2019 独立评测记录双腔 eyedropper、玻璃滴管、O-ring、不同尖号和两个颜色储墨的使用价值；价格和颜色不作为永久规格。",
    locator: "two reservoirs; eyedropper; O-rings; glass dropper; broad/fine nib and colour switching",
  }),
  store: source({
    key: "phase164-penbbs-official-etsy",
    title: "PENBBSOfficialStore Etsy",
    url: "https://www.etsy.com/shop/PENBBSOfficialStore",
    registryKey: "penbbs-official-etsy-phase164",
    registryName: "PENBBSOfficialStore",
    sourceType: "official",
    tier: "primary",
    summary: "品牌自营 Etsy 店铺把 Model 469 作为独立筛选项并显示销售窗口；店铺首页不承担每种颜色、尖号和库存的统一规格。",
    locator: "Model 469 category and PENBBSOfficialStore identity",
  }),
  svg: {
    key: "phase164-penbbs-469-svg",
    registryKey: "fountain-pen-graph-editorial-phase164",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission" as const,
    tier: "primary" as const,
    independenceGroup: "fountain-pen-graph-editorial-phase164",
    title: "PenBBS 469 double-ended structure factual diagram",
    url: "/images/library/site-original/phase164/penbbs/469.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full" as const,
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片，不作为真实比例、颜色、库存或具体批次证明。",
    archiveUrl: "/images/library/site-original/phase164/penbbs/469.svg",
    archiveLocator: "project-public-asset:/images/library/site-original/phase164/penbbs/469.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  },
} satisfies Record<string, CuratedSource>;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

const brandBase = phase72PenBbsPacks().find((pack) => pack.expectedType === "brand");
if (!brandBase) throw new Error("Phase 164 PenBBS brand prerequisite is missing.");
const brand = structuredClone(brandBase);
brand.key = "phase164-penbbs-brand-navigation-v1";
brand.sources = [...brand.sources, S.penAddict, S.store].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index);
brand.claims = [
  ...brand.claims,
  {
    key: "phase164-penbbs-469-navigation",
    predicate: "series_navigation",
    objectText: "PenBBS 品牌页新增 469 双端滴灌型号入口；469 的双腔、F/M 尖和滚珠替换头不继承 268、308、355 或 456 的上墨和尺寸。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.penAddict.key,
    locator: S.penAddict.archiveLocator ?? S.penAddict.summary,
    evidence: [{ key: "phase164-penbbs-469-navigation-evidence", sourceKey: S.penAddict.key, scopeKey: "phase164-penbbs-navigation", locator: "independent 469 model identity" }],
  },
];
brand.scopes = [...brand.scopes, { key: "phase164-penbbs-navigation", scopeKey: "phase164-penbbs-navigation", validFrom: RETRIEVED, productionState: "current", editionScope: "PenBBS navigation adds the separately curated Model 469 double-ended eyedropper." }];

const scopeKey = "phase164-penbbs-469-scope";
export const phase164PenBbs469Pack: CuratedEntityPack = {
  key: "phase164-penbbs-469-v1",
  entityId: PHASE164_PENBBS_ID,
  expectedType: "pen",
  expectedSlug: "坛笔-penbbs-469",
  canonicalName: "坛笔 PenBBS 469",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/penbbs-469-phase164.md",
  storyTitle: "PenBBS 469：双端滴灌、两枚笔尖与两种墨水",
  primarySourceKey: S.penAddict.key,
  depthTier: "A",
  aliases: [
    { alias: "PenBBS 469", language: "en", sourceKey: S.penAddict.key },
    { alias: "PenBBS 469 Double Ended Fountain Pen", language: "en", sourceKey: S.penAddict.key },
    { alias: "坛笔 469", language: "zh", sourceKey: S.store.key },
  ],
  sources: [S.penAddict, S.parka, S.gentleman, S.store, S.svg],
  scopes: [{ key: scopeKey, scopeKey, validFrom: RETRIEVED, productionState: "historical", materialScope: "Acrylic/resin colour samples vary by finish and seller; not a universal colour proof.", nibScope: "F/M pairing is the common reviewed configuration; exact nib and rollerball options are SKU-scoped.", editionScope: "Model 469 double-ended eyedropper family; dimensions and weight remain sample-scoped." }],
  claims: [
    { key: "phase164-469-identity", predicate: "model_identity", objectText: "PenBBS 469 是双端型号：两个独立储墨腔、两枚笔帽、两套握位和笔尖背靠背连接；它不是 PenBBS 456、355 或 308 的换色版本。", factClass: "core", confidence: 0.99, sourceKey: S.penAddict.key, locator: S.penAddict.summary, evidence: [{ key: "phase164-469-identity-addict", sourceKey: S.penAddict.key, scopeKey, locator: "two independent cavities and two nib/feed systems" }, { key: "phase164-469-identity-parka", sourceKey: S.parka.key, scopeKey, locator: "dual nib and eyedropper model" }] },
    { key: "phase164-469-fill", predicate: "filling_material_boundary", objectText: "两端分别使用 eyedropper 滴灌；握位 O-ring 负责螺纹密封，中隔将两个储墨腔分开，不存在统一 piston 或 converter 上墨机构。", factClass: "core", confidence: 0.99, sourceKey: S.gentleman.key, locator: S.gentleman.summary, evidence: [{ key: "phase164-469-fill-gentleman", sourceKey: S.gentleman.key, scopeKey, locator: "two reservoirs, glass dropper and O-rings" }, { key: "phase164-469-fill-addict", sourceKey: S.penAddict.key, scopeKey, locator: "eyedropper filling and separated cavities" }] },
    { key: "phase164-469-nib", predicate: "nib_boundary", objectText: "常见组合是一端 F、一端 M 的钢尖；评测观察尖较硬、字幅差异取决于具体样本，不能写成 flex 或全批次统一尖号。", factClass: "core", confidence: 0.97, sourceKey: S.penAddict.key, locator: S.penAddict.summary, evidence: [{ key: "phase164-469-nib-addict", sourceKey: S.penAddict.key, scopeKey, locator: "fine and medium pairing" }, { key: "phase164-469-nib-parka", sourceKey: S.parka.key, scopeKey, locator: "M/F sample and stiff nib observation" }] },
    { key: "phase164-469-variant", predicate: "version_boundary", objectText: "透明、条纹和网纹亚克力是颜色/材料版本；rollerball point section 是随 SKU 或包装出现的替换件，不另建为 469 型号。", factClass: "core", confidence: 0.96, sourceKey: S.store.key, locator: S.store.summary, evidence: [{ key: "phase164-469-variant-store", sourceKey: S.store.key, scopeKey, locator: "Model 469 sales category" }, { key: "phase164-469-variant-parka", sourceKey: S.parka.key, scopeKey, locator: "different colours and rollerball section" }] },
    { key: "phase164-469-care", predicate: "maintenance_boundary", objectText: "两端分开清洗并检查 O-ring；用常温清水，不强拆 feed 或中隔，不把热胀冷缩、倒置 burp 和个体漏墨样本写成永不漏墨的保证。", factClass: "editorial", confidence: 0.96, sourceKey: S.penAddict.key, locator: "conservative eyedropper and O-ring care boundary", evidence: [{ key: "phase164-469-care", sourceKey: S.penAddict.key, scopeKey, locator: "O-ring sealing and two-reservoir handling" }] },
  ],
  variants: [
    { key: "phase164-469-fm", name: "F／M 双钢尖", notes: "The Pen Addict 与其他评测常见的一端 F、一端 M；具体包装和尖号以实物核对。", sourceKey: S.penAddict.key, variantKind: "nib" },
    { key: "phase164-469-rollerball", name: "rollerball point section", notes: "Parka Blogs 记录的随笔替换头；是否随 SKU 附送不能外推。", sourceKey: S.parka.key, variantKind: "market_sku" },
    { key: "phase164-469-acrylic", name: "透明／条纹亚克力颜色", notes: "Misty Mountains、Moon River 等是材料或颜色称呼，不是新的型号编号。", sourceKey: S.penAddict.key, variantKind: "color" },
  ],
  spec: {
    brandEntityId: PHASE164_PENBBS_BRAND_ID,
    values: {
      series_name: "PenBBS 469",
      release_year: "2018 年前后已有独立市场资料；精确首发档案未核实",
      origin_country: "PenBBS 品牌销售与资料指向中国；本页不扩写具体工厂",
      nib: "双端通常 F／M 钢尖；具体组合按 SKU，个体字幅不可外推",
      fill_system: "双端独立 eyedropper；中隔分开两个储墨腔",
      material: "透明或半透明树脂／亚克力与金属件",
      dimensions: "独立样本约合帽 149 mm；不是所有材料与配件的统一尺寸",
      weight: "独立样本约合墨 23.85 g；墨量、滚珠头和批次会改变重量",
      status: "历史／流通型号；自营店目录仍可见，库存和颜色随渠道变化",
    },
    evidence: [
      evidence("brand_entity_id", "phase164-469-brand", S.store.key, scopeKey, "PENBBSOfficialStore brand window"),
      evidence("series_name", "phase164-469-series", S.store.key, scopeKey, "Model 469 category"),
      evidence("release_year", "phase164-469-release", S.parka.key, scopeKey, "2020 review window; launch year withheld"),
      evidence("origin_country", "phase164-469-origin", S.parka.key, scopeKey, "Shanghai/China brand context"),
      evidence("nib", "phase164-469-nib-spec", S.penAddict.key, scopeKey, "F/M reviewed pairing"),
      evidence("fill_system", "phase164-469-fill-spec", S.gentleman.key, scopeKey, "two eyedropper reservoirs"),
      evidence("material", "phase164-469-material", S.penAddict.key, scopeKey, "clear acrylic and colour variants"),
      evidence("dimensions", "phase164-469-dimensions", S.penAddict.key, scopeKey, "balanced sample; exact universal dimensions withheld"),
      evidence("weight", "phase164-469-weight", S.parka.key, scopeKey, "sample-only weight boundary"),
      evidence("status", "phase164-469-status", S.store.key, scopeKey, "current shop category, mutable inventory"),
    ],
  },
  timeline: [{ key: "phase164-469-current", title: "469 双端型号市场资料核对", eventType: "model_released", startDate: RETRIEVED, circa: true, description: "本事件表示资料检索日的型号和销售记录，不是厂商首发年份。", sourceKey: S.store.key }],
  media: [{ key: "phase164-469-primary", title: "PenBBS 469 双端结构事实图（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

export const phase164PenBbsPacks: CuratedEntityPack[] = [brand, phase164PenBbs469Pack];
