import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-27";
export const PHASE267_EDISON_BRAND_ID = "phase267-brand-edison";
export const PHASE267_COLLIER_ID = "phase267-edison-collier";
const BRAND_SCOPE = "phase267-edison-brand";
const MODEL_SCOPE = "phase267-edison-collier";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; group: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.group, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase267", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase267", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey }] };
}
function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const about = web({ key: "phase267-edison-about", title: "Edison Pen Co About Us", url: "https://edisonpen.com/about-us/", registryKey: "edison-official-about-phase267", registryName: "Edison Pen Co", sourceType: "official", tier: "primary", group: "edison-official-about-phase267", summary: "官方 About Us 记录 Brian Gray 于 2007 年从车库手动金属车床开始制笔，以及 Andrea Gray 的早期共同参与。", locator: "company history and team description" });
const collierOfficial = web({ key: "phase267-edison-collier-official", title: "Edison Pen Co The Collier", url: "https://edisonpen.com/collier-main-page/", registryKey: "edison-official-collier-phase267", registryName: "Edison Pen Co", sourceType: "official", tier: "primary", group: "edison-official-collier-phase267", summary: "官方 Collier 页面区分 Signature Line 与 Production Line，并列材料、钢／18K 尖、尖端大小和可选 Draw Filler。", locator: "Collier product description and ordering options" });
const signature = web({ key: "phase267-edison-signature", title: "Edison Pen Co Signature Line", url: "https://edisonpen.com/signature-line-main-page/", registryKey: "edison-official-signature-phase267", registryName: "Edison Pen Co", sourceType: "official", tier: "primary", group: "edison-official-signature-phase267", summary: "官方 Signature Line 说明材料、笔尖和定制订单需要按具体订购沟通，不能当作固定 SKU 表。", locator: "Signature Line ordering and customization" });
const production = web({ key: "phase267-edison-production", title: "Edison Pen Co Production Line", url: "https://edisonpen.com/production-line-main-page/", registryKey: "edison-official-production-phase267", registryName: "Edison Pen Co", sourceType: "official", tier: "primary", group: "edison-official-production-phase267", summary: "官方 Production Line 作为固定生产路线，按当期材料、颜色、尖号和零售库存供货。", locator: "Production Line navigation and boundary" });
const penpaper = web({ key: "phase267-edison-penpaper", title: "PenPaperPencil Edison Collier Fountain Pen Review", url: "https://penpaperpencil.net/edison-collier-fountain-pen-review/", registryKey: "penpaper-edison-collier-phase267", registryName: "PenPaperPencil", sourceType: "blog", tier: "professional_secondary", group: "penpaper-edison-collier-phase267", summary: "专业评测记录 JoWo 尖、钢／18K 选择、标准国际墨囊／转换器、旋帽不 post 和凹形握位。", locator: "review specifications and filling-system sections" });
const pencilcase = web({ key: "phase267-edison-pencilcase", title: "The Pencilcase Blog Re-review Edison Collier", url: "https://www.pencilcaseblog.com/2017/11/re-review-edison-collier-fountain-pen.html", registryKey: "pencilcase-edison-collier-phase267", registryName: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", group: "pencilcase-edison-collier-phase267", summary: "复评给出一支亚克力 Collier 样本约 150 mm、最大直径约 16 mm、约 26 g，并记录 Burnished Gold 外观。", locator: "sample measurements, weight and finish description" });
const fpn = web({ key: "phase267-edison-fpn", title: "Fountain Pen Network Edison Collier", url: "https://www.fountainpennetwork.com/forum/topic/203536-edison-collier/", registryKey: "fpn-edison-collier-phase267", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", group: "fpn-edison-collier-phase267", summary: "社区长帖提供 Collier 的历史使用语境和独立样本旁证；不把帖子体验升级为全批次工厂规格。", locator: "Edison Collier discussion and sample context" });
const brandSvg = diagram("phase267-edison-brand-svg", "Edison Pen Co brand route factual diagram", "/images/library/site-original/phase267/edison/brand.svg");
const collierSvg = diagram("phase267-edison-collier-svg", "Edison Collier factual diagram", "/images/library/site-original/phase267/edison/collier.svg");

const brand: CuratedEntityPack = {
  key: "phase267-edison-brand-v1", entityId: PHASE267_EDISON_BRAND_ID, expectedType: "brand", expectedSlug: "edison-pen-co", canonicalName: "Edison Pen Co", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/edison-brand-phase267.md", storyTitle: "Edison Pen Co：从车库车床到美国独立制笔工作室", primarySourceKey: about.key, depthTier: "A",
  aliases: [{ alias: "Edison Pen Company", language: "en", sourceKey: about.key }, { alias: "Edison Pen Co", language: "en", sourceKey: collierOfficial.key }, { alias: "Edison Pens", language: "en", sourceKey: production.key }, { alias: "Edison 美国手工钢笔", language: "zh", sourceKey: about.key }],
  sources: [about, collierOfficial, signature, production, penpaper, pencilcase, fpn, brandSvg],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "current", editionScope: "Edison Pen Co 品牌、Signature Line、Production Line 与 Collier 导航；各型号材料、尖号和供墨逐项核对。" }],
  claims: [
    claim("edison-identity", "brand_identity", "Edison Pen Co 是 Brian Gray 于 2007 年从车库手动金属车床开始发展的美国独立制笔品牌；Andrea Gray 参与早期生产与运营。", about.key, "company history and team", BRAND_SCOPE),
    claim("edison-routes", "brand_model_navigation", "官方把 Signature Line 与 Production Line 分开，并另列定制、Draw Filler、笔尖调校和维修入口；两条路线不能互作统一 SKU 表。", signature.key, "line navigation and services", BRAND_SCOPE),
    claim("edison-collier-nav", "brand_model_navigation", "Collier 是官方独立型号入口，同时存在 Signature 与 Production 路线；Collier Grande、Menlo 等名称不以 Collier 规格回填。", collierOfficial.key, "Collier product navigation", BRAND_SCOPE),
    claim("edison-service", "service_scope", "官方将笔尖调校、发货与维修作为品牌服务栏目；购买二手定制笔时应保留材料、尖号和维修记录。", about.key, "team duties and service navigation", BRAND_SCOPE),
    claim("edison-secondary", "professional_secondary_boundary", "PenPaperPencil 与 Pencilcase 对 Collier 的尖、尺寸和上墨提供独立交叉样本；它们不替代官方路线边界。", penpaper.key, "review cross-reference", BRAND_SCOPE),
    claim("edison-care", "maintenance_guidance", "树脂／亚克力表面用软布、清水和温和皂液维护，避免强溶剂与研磨剂；裂纹、螺纹或漏墨应联系制作者或合格维修者。", signature.key, "conservative care guidance", BRAND_SCOPE, "editorial"),
  ],
  variants: [
    { key: "edison-line-routes", name: "Signature Line / Production Line", notes: "固定生产与定制订购路线；材料、尖号、颜色、价格和等待时间按具体记录核对。", sourceKey: signature.key, variantKind: "edition_group", market: "global" },
    { key: "edison-service-routes", name: "Custom Orders / Nib Adjustments / Repairs", notes: "官方服务入口，不拆为独立笔型号。", sourceKey: about.key, variantKind: "edition_group", market: "global" },
  ],
  timeline: [{ key: "edison-founded-2007", title: "Edison Pen Co 创立叙事", eventType: "brand_founded", startDate: "2007", circa: false, description: "官方 About Us 记载 Brian Gray 于 2007 年从车库手动金属车床开始制笔；不扩写为所有产品的统一制造地点。", sourceKey: about.key }, { key: "edison-current-routes", title: "Signature 与 Production 路线核实", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "官方当前目录把定制 Signature Line 与固定 Production Line 分开，并保留笔尖调校和维修入口。", sourceKey: signature.key }],
  media: [{ key: "edison-brand-svg", title: brandSvg.title, sourceKey: brandSvg.key, localPath: brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非工作室照片、Logo 或制造流程证明。", sourceUrl: brandSvg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase267-edison-collier-v1", entityId: PHASE267_COLLIER_ID, expectedType: "pen", expectedSlug: "edison-collier", canonicalName: "Edison Collier", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/edison-collier-phase267.md", storyTitle: "Edison Collier：美国小批量制笔的圆润大号树脂笔", primarySourceKey: collierOfficial.key, depthTier: "A",
  aliases: [{ alias: "The Collier", language: "en", sourceKey: collierOfficial.key }, { alias: "Edison Collier Fountain Pen", language: "en", sourceKey: penpaper.key }, { alias: "Edison Collier Production Line", language: "en", sourceKey: production.key }, { alias: "Edison Collier 圆润树脂钢笔", language: "zh", sourceKey: pencilcase.key }],
  sources: [about, collierOfficial, signature, production, penpaper, pencilcase, fpn, collierSvg],
  scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", editionScope: "标准 Edison Collier；Signature／Production、钢／18K 尖、树脂／亚克力 finish 与 Draw Filler 作为配置边界，不并入 Collier Grande。" }],
  claims: [
    claim("collier-identity", "model_identity", "Edison Collier 是 Edison Pen Co 的独立型号，不与更大的 Collier Grande、Menlo 或 Mira 合并。", collierOfficial.key, "Collier product identity", MODEL_SCOPE),
    claim("collier-routes", "edition_routes", "官方把 Collier 分为 Signature Line 与 Production Line；同一轮廓下材料、颜色、尖号和价格随路线与批次变化。", collierOfficial.key, "Signature and Production boundary", MODEL_SCOPE),
    claim("collier-material", "material_finish", "Collier 使用树脂／亚克力笔身；Burnished Gold 等 finish 是具体样本观察，不能回填所有 Collier 的统一纹理。", pencilcase.key, "acrylic sample and Burnished Gold finish", MODEL_SCOPE),
    claim("collier-nib", "nib", "官方列钢尖与 18K 尖选择；专业评测记录 JoWo 单元和 EF/F/M/B、1.1 mm stub、1.5 mm stub 等样本线宽。", penpaper.key, "JoWo nibs and width list", MODEL_SCOPE),
    claim("collier-fill", "filling_system", "常见配置使用标准国际墨囊／转换器；Draw Filler 是需订购确认的可选路线，不与普通转换器同时默认。", penpaper.key, "standard international cartridge/converter and Draw Filler boundary", MODEL_SCOPE),
    claim("collier-size", "dimensions", "Pencilcase 的亚克力样本约 150 mm 长、最大直径约 16 mm；这是单支测量，不代表所有材料和帽盖状态。", pencilcase.key, "sample measurements", MODEL_SCOPE),
    claim("collier-weight", "weight", "Pencilcase 的亚克力样本约 26 g；材料、帽盖和装墨状态会改变实物重量。", pencilcase.key, "sample weight", MODEL_SCOPE),
    claim("collier-shape", "cap_section", "专业评测记录旋帽不适合插在笔尾，凹形握位对大手较友好，小手用户应先试握。", penpaper.key, "cap posting and concave section", MODEL_SCOPE),
    claim("collier-secondary", "professional_secondary_boundary", "PenPaperPencil、Pencilcase 和 FPN 的样本可用于交叉核实尺寸、写感与历史语境，不升级为每一批次的工厂承诺。", penpaper.key, "independent sample boundary", MODEL_SCOPE),
    claim("collier-care", "maintenance_guidance", "树脂／亚克力用清水和温和皂液维护，换墨时按普通转换器或已确认的 Draw Filler 结构清洗；裂纹和螺纹问题停止拧紧并联系维修者。", signature.key, "conservative maintenance guidance", MODEL_SCOPE, "editorial"),
    claim("collier-selection", "selection_guidance", "Production Line 适合先比较固定颜色与标准钢尖；需要特殊材料、18K 尖或 Draw Filler 时选择 Signature，并保存订购单作为版本证据。", production.key, "route selection guidance", MODEL_SCOPE, "editorial"),
  ],
  variants: [
    { key: "collier-signature-production", name: "Signature Line / Production Line", notes: "同型号不同订购路线；具体材料、颜色、尖号和价格按记录核对。", sourceKey: collierOfficial.key, variantKind: "edition_group", market: "global" },
    { key: "collier-nib-material", name: "JoWo stainless steel / 18K gold", notes: "笔尖材质和线宽配置；不把评测中的样本线宽当作所有库存保证。", sourceKey: penpaper.key, variantKind: "nib", market: "global" },
    { key: "collier-acrylic-finishes", name: "Acrylic finishes including Burnished Gold", notes: "树脂／亚克力 finish；颜色和纹理按单支图片核对。", sourceKey: pencilcase.key, variantKind: "material", market: "global" },
    { key: "collier-draw-filler", name: "Optional Draw Filler", notes: "需在订购记录或实物机构中确认，不是所有 Production Line 笔的默认上墨器。", sourceKey: collierOfficial.key, variantKind: "market_sku", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE267_EDISON_BRAND_ID,
    values: {
      series_name: "Collier",
      origin_country: "美国；Edison Pen Co 官方 About Us 与 Collier 页面确认美国独立制笔语境",
      nib: "JoWo stainless steel 或 18K gold；EF/F/M/B、1.1/1.5 mm stub 等按路线与单支核对",
      fill_system: "标准国际墨囊／转换器；可选 Draw Filler 需订购记录或实物确认",
      material: "树脂／亚克力；颜色与 finish 随 Signature／Production Line 和批次变化",
      dimensions: "专业样本约 150 mm 长、最大直径约 16 mm；单支测量，不代表所有批次",
      weight: "亚克力评测样本约 26 g；帽盖、材料和装墨状态会改变实物重量",
    },
    evidence: [
      ev("collier", "brand_entity_id", collierOfficial.key, "official Collier identity"),
      ev("collier", "series_name", collierOfficial.key, "product title"),
      ev("collier", "origin_country", about.key, "official Edison company history"),
      ev("collier", "nib", penpaper.key, "JoWo steel and 18K width list"),
      ev("collier", "fill_system", penpaper.key, "standard international cartridge/converter"),
      ev("collier", "material", collierOfficial.key, "material ordering and acrylic/resin route"),
      ev("collier", "dimensions", pencilcase.key, "sample measurements"),
      ev("collier", "weight", pencilcase.key, "sample weight"),
    ],
  },
  timeline: [{ key: "collier-current", title: "Collier 当前路线核实", eventType: "model_released", startDate: RETRIEVED, circa: false, description: "官方 Collier、Signature 与 Production 页面核实型号边界和订购路线；不推断首发年份。", sourceKey: collierOfficial.key }],
  media: [{ key: "edison-collier-svg", title: collierSvg.title, sourceKey: collierSvg.key, localPath: collierSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表真实材料纹理、颜色、尺寸、尖材或某一条订购单。", sourceUrl: collierSvg.url, usageStatus: "primary" }],
};

export const phase267EdisonCollierPacks: CuratedEntityPack[] = [brand, model];
