import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { PHASE267_EDISON_BRAND_ID, phase267EdisonCollierPacks } from "./phase267-edison-collier";

const RETRIEVED = "2026-07-28";
export const PHASE306_EDISON_BRAND_ID = PHASE267_EDISON_BRAND_ID;
export const PHASE306_MENLO_ID = "phase306-edison-menlo";
export const PHASE306_MENLO_SLUG = "edison-menlo";
const SCOPE = "phase306-edison-menlo";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.registryKey, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase306/edison/menlo.svg";
  return { key: "phase306-edison-menlo-svg", registryKey: "fountain-pen-graph-editorial-phase306", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase306", title: "Edison Menlo factual diagram", url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG：区分 Menlo 的 Pump Filler、Draw Filler、C/C 与 Signature 定制边界；不是产品照片。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.97 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator }] };
}
function specEvidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  official: web({ key: "phase306-edison-menlo-official", title: "Edison Pen Co The Menlo", url: "https://edisonpen.com/menlo-main-page/", registryKey: "edison-official-menlo-phase306", registryName: "Edison Pen Co", sourceType: "official", tier: "primary", summary: "官方 Menlo 页将它列为独立 Signature Line 型号，要求按材料、钢／18K 尖和尖端大小订购，并列出 Draw Filler 加项。", locator: "The Menlo heading, pricing and order fields" }),
  pump: web({ key: "phase306-edison-menlo-pump", title: "Edison Pen Co Introducing the Menlo Pump Filler", url: "https://edisonpen.com/index.cfm/2013/08/01/introducing-the-menlo-pump-filler/", registryKey: "edison-official-menlo-pump-phase306", registryName: "Edison Pen Co", sourceType: "official", tier: "contemporary_archive", summary: "官方 2013 文章记录 Menlo Pump Filler 的推出、按压排气后释放吸墨、维护和换尖演示。", locator: "introduction, filling sequence and maintenance sections" }),
  signature: web({ key: "phase306-edison-signature", title: "Edison Pen Co Signature Line", url: "https://edisonpen.com/signature-line-main-page/", registryKey: "edison-official-signature-phase306", registryName: "Edison Pen Co", sourceType: "official", tier: "primary", summary: "官方 Signature Line 说明材料和尖号需按定制订单确认，Menlo 不应被当作固定颜色或统一尺寸 SKU。", locator: "Signature Line ordering boundary" }),
  penAddict: web({ key: "phase306-edison-menlo-penaddict", title: "The Pen Addict Edison Menlo Pump Filler Review", url: "https://www.penaddict.com/blog/2015/6/1/edison-menlo-pump-filler-fountain-pen-review", registryKey: "penaddict-edison-menlo-phase306", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", summary: "专业评测记录 Pump Filler 的按压吸墨、约 1.7 ml 单支样本容量、钢／18K 样本与清洗难度。", locator: "filling action, reservoir estimate and cleaning observations" }),
  gentleman: web({ key: "phase306-edison-menlo-gentleman", title: "The Gentleman Stationer Edison Menlo Draw Filler", url: "https://www.gentlemanstationer.com/blog/2018/7/21/edison-menlo-draw-filler", registryKey: "gentleman-edison-menlo-phase306", registryName: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", summary: "专业评测解释 Draw Filler 的抽拉机构、容量／重量平衡、JoWo 调校和特殊供墨路线的清洗边界。", locator: "Draw Filler mechanism, nib and maintenance sections" }),
  about: web({ key: "phase306-edison-about", title: "Edison Pen Co About Us", url: "https://edisonpen.com/about-us/", registryKey: "edison-official-about-phase306", registryName: "Edison Pen Co", sourceType: "official", tier: "primary", summary: "官方品牌页确认 Edison Pen Co 的美国独立制笔背景和 Brian Gray、Andrea Gray 的品牌沿革。", locator: "company history and team description" }),
  svg: diagram(),
} as const;

const inheritedBrand = phase267EdisonCollierPacks.find((pack) => pack.entityId === PHASE306_EDISON_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 306 Edison brand pack missing.");
const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase306-edison-brand-v1";

const model: CuratedEntityPack = {
  key: "phase306-edison-menlo-v1",
  entityId: PHASE306_MENLO_ID,
  expectedType: "pen",
  expectedSlug: PHASE306_MENLO_SLUG,
  canonicalName: "Edison Menlo",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/edison-menlo-phase306.md",
  storyTitle: "Edison Menlo：Pump Filler 与定制上墨路线的美国手工钢笔",
  primarySourceKey: S.official.key,
  depthTier: "A",
  aliases: [
    { alias: "The Menlo", language: "en", sourceKey: S.official.key },
    { alias: "Edison Menlo Fountain Pen", language: "en", sourceKey: S.penAddict.key },
    { alias: "Edison Menlo Pump Filler", language: "en", sourceKey: S.pump.key },
    { alias: "Edison Menlo Draw Filler", language: "en", sourceKey: S.gentleman.key },
    { alias: "Edison Menlo 美国手工钢笔", language: "zh", sourceKey: S.about.key },
  ],
  sources: [S.official, S.pump, S.signature, S.penAddict, S.gentleman, S.about, S.svg],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, productionState: "current", market: "Edison Signature Line; availability and price vary by order", nibScope: "Steel or 18K gold; tip size is selected per order.", materialScope: "Resin/acrylic and other custom materials; exact finish belongs to the individual order.", editionScope: "Edison Menlo only; Collier, Collier Grande and other Edison models excluded." }],
  claims: [
    claim("phase306-menlo-identity", "model_identity", "Menlo 是 Edison Pen Co Signature Line 的独立型号；Collier、Collier Grande 和其它 Edison 形制不能用 Menlo 的上墨或尺寸字段代替。", S.official.key, "The Menlo product identity"),
    claim("phase306-menlo-pump", "filling_system", "Pump Filler 版本把笔尖浸入墨水，按下泵排气，再释放泵吸入墨水；这是官方介绍的 Menlo 特色机构，不是 piston 或普通转换器。", S.pump.key, "filling sequence and pump-filler introduction"),
    claim("phase306-menlo-draw", "filling_variants", "Menlo 也可按订购选择 Draw Filler 或 cartridge/converter；官方当前页将 Draw Filler 列为加项，不能默认每支 Menlo 都有同一机构。", S.official.key, "Draw Filler add-on and order fields"),
    claim("phase306-menlo-capacity", "sample_capacity", "The Pen Addict 的 Pump Filler 样本约四次泵压装满约 1.7 ml；这是单支观察，不是所有材料与批次的固定容量。", S.penAddict.key, "single-sample reservoir estimate"),
    claim("phase306-menlo-nib", "nib", "官方列钢尖与 18K 尖并要求选择 tip size；专业评测中的 JoWo、调校和线宽属于订单或样本配置，不应回填成统一尖表。", S.official.key, "steel/18K and nib tip order fields"),
    claim("phase306-menlo-material", "material_finish", "材料由 Signature Line 订单选择，透明、旋纹亚克力等外观只是单支记录；不能把某篇评测的纹理扩展为整个 Menlo 系列。", S.signature.key, "custom material boundary"),
    claim("phase306-menlo-care", "maintenance_boundary", "Pump／Draw 的导管、泵膜、O-ring 和密封件需要按机构清洗与维修；若频繁换墨，C/C 版本更容易冲洗，特殊机构不要硬拆或猛拧。", S.penAddict.key, "cleaning difficulty and long-term seal maintenance", "editorial"),
    claim("phase306-menlo-selection", "selection_guidance", "喜欢大容量和机构观察可选 Pump，重视容量与较易理解的抽拉维护可选 Draw，频繁换色或依赖国际耗材则应确认 C/C 版本；购买二手笔必须核对笔尾机构、尖材和订单记录。", S.gentleman.key, "filling-route comparison and selection boundary", "editorial"),
  ],
  variants: [
    { key: "phase306-menlo-pump", name: "Pump Filler", notes: "按压排气、释放吸墨；约 1.7 ml 仅为专业评测单支样本估计。", sourceKey: S.pump.key, variantKind: "variant" },
    { key: "phase306-menlo-draw", name: "Draw Filler", notes: "抽拉式容量路线；需在订单或实物机构中确认。", sourceKey: S.gentleman.key, variantKind: "variant" },
    { key: "phase306-menlo-cc", name: "Cartridge / Converter", notes: "Edison 可制作的标准国际墨囊／转换器路线；不能假定所有 Menlo 默认附带。", sourceKey: S.gentleman.key, variantKind: "variant" },
    { key: "phase306-menlo-nibs", name: "Steel / 18K nib", notes: "钢尖或 18K 尖，尖端大小按具体订单。", sourceKey: S.official.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE306_EDISON_BRAND_ID,
    values: {
      series_name: "Menlo",
      release_year: "2013（官方 Pump Filler 介绍文章；具体配置持续变化）",
      origin_country: "美国；Edison Pen Co 官方品牌与 Menlo 页面确认美国独立制笔语境",
      nib: "钢尖或 18K gold；尖端大小按单支订单核对",
      fill_system: "Pump Filler、Draw Filler 或 cartridge/converter；以笔尾、订购记录和实物机构为准",
      material: "树脂／亚克力等定制材料；颜色和纹理按单支记录",
      status: "Edison Signature Line；具体配置、价格和库存随订单与批次变化",
    },
    evidence: [
      specEvidence("phase306-menlo-brand", "brand_entity_id", S.about.key, "Edison company identity"),
      specEvidence("phase306-menlo-series", "series_name", S.official.key, "The Menlo heading"),
      specEvidence("phase306-menlo-year", "release_year", S.pump.key, "2013 official introduction"),
      specEvidence("phase306-menlo-origin", "origin_country", S.about.key, "US independent maker context"),
      specEvidence("phase306-menlo-nib-spec", "nib", S.official.key, "steel/18K and tip-size order fields"),
      specEvidence("phase306-menlo-fill-spec", "fill_system", S.pump.key, "Pump Filler and maintenance introduction"),
      specEvidence("phase306-menlo-material-spec", "material", S.signature.key, "Signature custom material boundary"),
      specEvidence("phase306-menlo-status", "status", S.official.key, "current Signature Line order page"),
    ],
  },
  timeline: [{ key: "phase306-menlo-pump-launch", title: "Menlo Pump Filler 官方介绍", eventType: "model_released", startDate: "2013-08-01", circa: false, description: "Edison 官方文章在 2013 年介绍 Menlo Pump Filler 与其按压排气、释放吸墨的工作方式；不把这一天当作所有 Menlo 配置的统一首发日。", sourceKey: S.pump.key }],
  media: [{ key: "phase306-menlo-primary-media", title: "Edison Menlo factual diagram（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

export const phase306EdisonMenloPacks: CuratedEntityPack[] = [brand, model];
