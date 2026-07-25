import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase163HongdianPacks, PHASE163_HONGDIAN_BRAND_ID } from "./phase163-hongdian-models";

const RETRIEVED = "2026-07-25";
export const PHASE198_HONGDIAN_BRAND_ID = PHASE163_HONGDIAN_BRAND_ID;
export const PHASE198_6013_ID = "bTFoxeal7c7T";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase198", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase198", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实涂层、比例、重量、尖号、盖型或批次。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  video: live({ key: "phase198-hongdian-6013-video", title: "Bilibili：Fountain pen review 146 Hong Dian 弘典 文武黑将 6013", url: "https://www.bilibili.com/video/BV1X7411S7zJ/", registryName: "Bilibili uploader", sourceType: "blog", tier: "professional_secondary", summary: "视频标题直接标明弘典文武黑将 6013，作为型号与中文命名的独立评测线索。", locator: "video title and publication metadata: 2020-03-29 Hong Dian 6013 review" }),
  desertcart: live({ key: "phase198-hongdian-6013-desertcart", title: "Desertcart：HongDian 6013 Matte Black Fountain Pen", url: "https://www.desertcart.in/products/179444027-hongdian-6013-matte-black-fountain-pen-black-extra-fine-nib", registryName: "Desertcart", sourceType: "retailer", tier: "contemporary_archive", summary: "商品页列 6013 哑黑金属杆、树纹握位、extra-fine 约 0.38 mm、钢尖与 converter；评论补充重量和夹帽体验。", locator: "6013 matte black listing: 0.38 mm EF, metal body, tree texture, converter and review observations" }),
  rokomari: live({ key: "phase198-hongdian-6013-rokomari", title: "Rokomari：Hongdian 6013 Fountain Pen", url: "https://www.rokomari.com/product/541424/hongdian-6013-fountain-pen", registryName: "Rokomari", sourceType: "retailer", tier: "professional_secondary", summary: "技术栏列约 138 mm、铝制金属杆、钢尖、按盖样本、约 32 g 与 converter；作为特定商品样本，不泛化所有 6013。", locator: "technical specification: 138 mm, aluminum body, stainless nib, push cap and 32 g sample" }),
  reddit: live({ key: "phase198-hongdian-6013-reddit", title: "Reddit：Down the rabbit holes — new pens (Hongdians)", url: "https://www.reddit.com/r/fountainpens/comments/1lvftlo/down_the_rabbit_holes_new_pens_hongdians/", registryName: "Reddit r/fountainpens participants", sourceType: "reddit", tier: "community", summary: "用户长期使用讨论记录 6013 的偏重手感、帽夹开孔干燥风险和不同盖型；只作个体体验，不升级为全批次故障率。", locator: "2025 discussion: weight, cap clip opening, drying observation and screw/snap cap variation" }),
  brandSite: live({ key: "phase163-hongdian-brand-site", title: "Hongdian Pens product and care site", url: "https://hongdianpens.com/", registryName: "Hongdian Pens", sourceType: "official", tier: "contemporary_archive", summary: "品牌站提供 HongDian 产品和常温水清洁语境，用于品牌关系与维护边界，不补写 6013 未公开的厂规。", locator: "brand product context and room-temperature-water care guidance" }),
  svg: diagram("phase198-hongdian-6013-svg", "HongDian 6013 文武黑将结构示意", "/images/library/site-original/phase198/hongdian/6013.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.82, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "hongdian-6013-model";
const pen: CuratedEntityPack = {
  key: "phase198-hongdian-6013",
  entityId: PHASE198_6013_ID,
  expectedType: "pen",
  expectedSlug: "弘典-hongdian-6013文武黑将",
  canonicalName: "弘典 HongDian 6013 文武黑将",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/hongdian-6013-phase198.md",
  storyTitle: "弘典 HongDian 6013 文武黑将：金属重量、树纹握持与尖帽密封",
  primarySourceKey: S.desertcart.key,
  depthTier: "A",
  aliases: [{ alias: "HongDian 6013", language: "en", sourceKey: S.desertcart.key }, { alias: "HongDian 6013 Matte Black", language: "en", sourceKey: S.desertcart.key }, { alias: "HongDian 6013S", language: "en", sourceKey: S.reddit.key }, { alias: "弘典 6013", language: "zh", sourceKey: S.video.key }, { alias: "文武黑将", language: "zh", sourceKey: S.video.key }],
  sources: [S.video, S.desertcart, S.rokomari, S.reddit, S.brandSite, S.svg],
  scopes: [{ key: scope, scopeKey: "hongdian-6013-metal-body-and-care", productionState: "current", editionScope: "HongDian 6013 文武黑将当代渠道型号、金属杆、树纹握位、converter、钢尖、盖型与批次维护边界" }],
  claims: [
    claim("hongdian-6013-identity", "model_identity", "HongDian 6013（中文常称文武黑将）是独立的金属杆钢笔型号；视频标题、商品技术栏与用户讨论均将其与 Black Forest 等型号分开。", S.video.key, scope, "6013 model title and separate model discussion"),
    claim("hongdian-6013-material", "material_boundary", "公开商品样本记录金属／铝合金杆身、树纹防滑握位和金属帽；哑黑、钛黑、银色等涂层名称与盖型随 SKU 和批次变化。", S.rokomari.key, scope, "metal body, texture and finish sample"),
    claim("hongdian-6013-nib", "nib_boundary", "6013 渠道可见钢制 EF/F/M 与 bent/fude 等尖选项；0.38–0.5 mm 只代表特定列表，实际线宽按单支验收。", S.desertcart.key, scope, "EF 0.38 mm and market nib choices"),
    claim("hongdian-6013-fill", "filling_system", "商品资料常随附 converter，并可能兼容墨囊；接口、活塞和盖型按当前 SKU 确认，不能把 6013 写成内置活塞笔。", S.rokomari.key, scope, "converter and cartridge compatibility"),
    claim("hongdian-6013-weight", "sample_measurement", "公开样本约 32–55 g、约 138 mm；是否含墨、帽盖、尖型和测量条件会改变数值，不能当成统一厂规。", S.rokomari.key, scope, "138 mm/32 g listing and 55 g user sample boundary"),
    claim("hongdian-6013-care", "maintenance_guidance", "converter 用常温清水吸排，金属涂层避免强溶剂；部分用户报告帽夹开孔带来干燥风险，购买时应检查帽内密封和盖型。", S.reddit.key, scope, "cap opening, drying observation and cleaning boundary"),
    claim("hongdian-6013-selection", "selection_guidance", "选购时核对型号刻字、树纹握位、尖号、盖型、converter、夹子根部和退换条件；只写 Hongdian metal pen 的列表证据不足。", S.desertcart.key, scope, "SKU and physical inspection checklist"),
  ],
  variants: [{ key: "hongdian-6013-matte-black", name: "Matte Black／Titanium Black", notes: "常见哑黑市场名称；涂层与尖号按 SKU 核对。", sourceKey: S.desertcart.key, variantKind: "color" }, { key: "hongdian-6013-matte-silver", name: "Matte Silver", notes: "银色市场版本；不能把黑色重量和盖型直接回填。", sourceKey: S.rokomari.key, variantKind: "color" }, { key: "hongdian-6013-nib-options", name: "EF/F/M 与 bent/fude 尖选项", notes: "渠道选择器和用户讨论中的尖幅边界；不视为单一原厂公称规格。", sourceKey: S.desertcart.key, variantKind: "nib" }, { key: "hongdian-6013-cap-variants", name: "按盖／旋盖批次边界", notes: "用户讨论提示不同盖型存在；以实物密封和夹子检查为准。", sourceKey: S.reddit.key, variantKind: "edition_group" }],
  spec: {
    brandEntityId: PHASE198_HONGDIAN_BRAND_ID,
    values: { series_name: "HongDian 6013 / 文武黑将", origin_country: "中国；HongDian 当代渠道型号，具体生产主体按包装和 SKU 核对", nib: "不锈钢尖；渠道可见 EF/F/M 与 bent/fude 等选项，线宽按单支验收", fill_system: "converter／兼容墨囊路线；接口、活塞和盖型按 SKU 确认", material: "金属／铝合金杆身、树纹防滑握位和金属帽；涂层与批次按实物核验", dimensions: "公开零售样本约 138 mm；不同盖型、尖型和测量条件会改变数值", weight: "公开样本约 32–55 g；是否含墨、帽盖和 SKU 会影响单支测量", status: "当代渠道流通型号；颜色、尖号、盖型和库存按卖家与包装核对" },
    evidence: [ev("hongdian-6013", "brand_entity_id", S.brandSite.key, scope, "HongDian brand context"), ev("hongdian-6013", "series_name", S.video.key, scope, "6013 model title"), ev("hongdian-6013", "origin_country", S.rokomari.key, scope, "China origin field"), ev("hongdian-6013", "nib", S.desertcart.key, scope, "0.38 mm EF and nib options"), ev("hongdian-6013", "fill_system", S.rokomari.key, scope, "converter field"), ev("hongdian-6013", "material", S.rokomari.key, scope, "aluminum/metal body"), ev("hongdian-6013", "dimensions", S.rokomari.key, scope, "138 mm sample"), ev("hongdian-6013", "weight", S.rokomari.key, scope, "32 g sample and user 55 g boundary"), ev("hongdian-6013", "status", S.desertcart.key, scope, "current retail listing")],
  },
  media: [{ key: "hongdian-6013-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表真实涂层、比例、重量、尖号、盖型或生产批次。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const existingBrand = phase163HongdianPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE198_HONGDIAN_BRAND_ID);
if (!existingBrand) throw new Error("Phase 198 requires the existing curated HongDian brand pack.");
pen.sources = [...pen.sources, ...existingBrand.sources.filter((source) => source.sourceType === "official")];

export const phase198Hongdian6013Packs: CuratedEntityPack[] = [existingBrand, pen];
