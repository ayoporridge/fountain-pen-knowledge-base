import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-26";

type ModelDef = {
  brandId: string;
  brandSlug: string;
  brandName: string;
  penId: string;
  penSlug: string;
  penName: string;
  aliasBrand: string;
  aliasPen: string;
  reviewKey: string;
  reviewUrl: string;
  reviewTitle: string;
  svgKey: string;
  svgPath: string;
  markdownFile: string;
  short: string;
};

export const PHASE235_TARGETS: readonly ModelDef[] = [
  { brandId: "v303FVWUV9sR", brandSlug: "dongwu", brandName: "东吴 (DongWu)", penId: "dbp20JATzwzm", penSlug: "东吴-dongwu-948", penName: "东吴 DongWu 948", aliasBrand: "东吴", aliasPen: "Dong Wu 948", reviewKey: "phase235-dongwu-948-review", reviewUrl: "https://www.youtube.com/watch?v=u68jueCtYw8", reviewTitle: "白丁 Alan：Fountain pen review 159 Dong Wu 948", svgKey: "phase235-dongwu-948-svg", svgPath: "/images/library/site-original/phase235/dongwu/dongwu-948.svg", markdownFile: ".planning/content-research/dongwu-948-phase235.md", short: "东吴 948" },
  { brandId: "DnQI7CPpnewz", brandSlug: "shule", brandName: "书乐 (ShuLe)", penId: "p81bNOu9URb7", penSlug: "书乐-shule-2398", penName: "书乐 ShuLe 2398", aliasBrand: "书乐", aliasPen: "ShuLe 2398", reviewKey: "phase235-shule-2398-review", reviewUrl: "https://www.youtube.com/watch?v=NRqXXIWLwz4", reviewTitle: "白丁 Alan：Fountain pen review 179 ShuLe 2398", svgKey: "phase235-shule-2398-svg", svgPath: "/images/library/site-original/phase235/shule/shule-2398.svg", markdownFile: ".planning/content-research/shule-2398-phase235.md", short: "书乐 2398" },
  { brandId: "mZNUfRureJsC", brandSlug: "zhangjiang", brandName: "长江 (ZhangJiang)", penId: "fTRyXVmvdg58", penSlug: "长江-zhangjiang-988", penName: "长江 ZhangJiang 988", aliasBrand: "长江", aliasPen: "ZhangJiang 988", reviewKey: "phase235-zhangjiang-988-review", reviewUrl: "https://www.youtube.com/watch?v=12fu1Esgtu0", reviewTitle: "白丁 Alan：Fountain pen review 161 ZhangJiang 988", svgKey: "phase235-zhangjiang-988-svg", svgPath: "/images/library/site-original/phase235/zhangjiang/zhangjiang-988.svg", markdownFile: ".planning/content-research/zhangjiang-988-phase235.md", short: "长江 988" },
] as const;

function review(def: ModelDef): CuratedSource {
  return { key: def.reviewKey, registryKey: `bai-ding-alan-${def.brandSlug}-phase235`, registryName: "白丁 Alan YouTube", sourceType: "user_submission", tier: "professional_secondary", independenceGroup: `bai-ding-alan-${def.brandSlug}-phase235`, title: def.reviewTitle, url: def.reviewUrl, homepageUrl: "https://www.youtube.com/@alan42443", author: "白丁 Alan", retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: `白丁 Alan 的具体实物评测提供 ${def.short} 的型号入口和单支观察；不把视频样本的字幅、流量、上墨或尺寸外推为全批次规格。`, archiveUrl: def.reviewUrl, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${def.reviewTitle}` };
}

function svg(def: ModelDef): CuratedSource {
  return { key: def.svgKey, registryKey: "fountain-pen-graph-editorial-phase235", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase235", title: `${def.short} 身份与规格边界事实图`, url: def.svgPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、库存或具体批次。", archiveUrl: def.svgPath, archiveLocator: `project-public-asset:${def.svgPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false` };
}

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) { return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true }; }
function media(def: ModelDef, source: CuratedSource) { return [{ key: `${def.svgKey}-media`, title: `${def.short} 身份与规格边界事实图（非产品照片）`, sourceKey: source.key, localPath: source.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存或具体批次。", sourceUrl: source.url, usageStatus: "primary" as const }]; }

function brandPack(def: ModelDef, reviewSource: CuratedSource, svgSource: CuratedSource): CuratedEntityPack {
  const scope = `phase235-${def.brandSlug}-brand-navigation`;
  return {
    key: `phase235-${def.brandSlug}-brand-v1`, entityId: def.brandId, expectedType: "brand", expectedSlug: def.brandSlug, canonicalName: def.brandName, publicationIntent: "publish", publicationBlockers: [], markdownFile: def.markdownFile, storyTitle: `${def.brandName}：小众国产型号的实物核验`, primarySourceKey: reviewSource.key, depthTier: "B",
    aliases: [{ alias: def.aliasBrand, language: "zh", sourceKey: reviewSource.key }, { alias: def.brandSlug === "dongwu" ? "DongWu" : def.brandSlug === "shule" ? "ShuLe" : "ZhangJiang", language: "en", sourceKey: reviewSource.key }],
    sources: [reviewSource, svgSource], scopes: [{ key: scope, scopeKey: scope, validFrom: RETRIEVED, productionState: "historical", editionScope: `${def.short} 是当前品牌页唯一完成来源化的具体入口；其余品牌史、型号、尺寸和上墨信息没有从本页外推。` }],
    claims: [
      { key: `phase235-${def.brandSlug}-editorial-boundary`, predicate: "identity_boundary", objectText: `本站原创示意图只标出 ${def.short} 的已知入口与待核字段；它是编辑边界图，不是产品照片、厂商目录或完整品牌史。`, factClass: "core", confidence: 0.99, sourceKey: svgSource.key, locator: svgSource.summary, evidence: [{ key: `phase235-${def.brandSlug}-editorial-boundary-evidence`, sourceKey: svgSource.key, scopeKey: scope, locator: "editorial factual SVG explicitly separates confirmed entry from unknown fields" }] },
      { key: `phase235-${def.brandSlug}-identity`, predicate: "brand_identity", objectText: `${def.brandName} 是公开评测中可辨认的国产钢笔品牌名称；资料主要来自具体实物评测，不能据此补写未经核实的法人、工厂、成立年份或完整目录。`, factClass: "core", confidence: 0.97, sourceKey: reviewSource.key, locator: reviewSource.summary, evidence: [{ key: `phase235-${def.brandSlug}-identity-evidence`, sourceKey: reviewSource.key, scopeKey: scope, locator: "specific model review title and sample" }] },
      { key: `phase235-${def.brandSlug}-navigation`, predicate: "brand_model_navigation", objectText: `品牌页仅公开链接已完成核验的 ${def.short}；其他相似国产旧笔不能因为名称、颜色或编号相近就并入。`, factClass: "core", confidence: 0.98, sourceKey: reviewSource.key, locator: reviewSource.summary, evidence: [{ key: `phase235-${def.brandSlug}-navigation-evidence`, sourceKey: reviewSource.key, scopeKey: scope, locator: "model-specific review remains separate from unsourced variants" }] },
    ],
    timeline: [{ key: `phase235-${def.brandSlug}-review-window`, title: `${def.short} 公开评测窗口`, eventType: "model_released", startDate: "2019", circa: true, description: `公开评测提供 ${def.short} 的当代访问窗口；不是品牌首发年份。`, sourceKey: reviewSource.key }, { key: `phase235-${def.brandSlug}-catalog-gap`, title: "品牌目录仍待补证", eventType: "community_event", startDate: RETRIEVED, circa: true, description: "当前资料只足以支持具体实物入口，后续目录、包装和多样本应逐条补来源。", sourceKey: reviewSource.key }],
    media: media(def, svgSource),
  };
}

function penPack(def: ModelDef, reviewSource: CuratedSource, svgSource: CuratedSource): CuratedEntityPack {
  const scope = `phase235-${def.brandSlug}-model-scope`;
  return {
    key: `phase235-${def.brandSlug}-model-v1`, entityId: def.penId, expectedType: "pen", expectedSlug: def.penSlug, canonicalName: def.penName, publicationIntent: "publish", publicationBlockers: [], markdownFile: def.markdownFile, storyTitle: `${def.short}：实物、评测与维护边界`, primarySourceKey: reviewSource.key, depthTier: "B",
    aliases: [{ alias: def.aliasPen, language: "en", sourceKey: reviewSource.key }, { alias: def.penName, language: "zh", sourceKey: reviewSource.key }], sources: [reviewSource, svgSource], scopes: [{ key: scope, scopeKey: scope, validFrom: RETRIEVED, productionState: "historical", nibScope: "评测样本处于钢尖语境；尖材、字幅和后配件按单支刻字核对。", materialScope: "材质、帽盖、笔杆和饰件按实物核验，不将相似国产旧笔的材料外推。", editionScope: `具体 ${def.short} 条目；不包含其他同名、相似编号或后配零件。` }],
    claims: [
      { key: `phase235-${def.brandSlug}-editorial-boundary`, predicate: "specification_boundary", objectText: `本站原创示意图只把 ${def.short} 的型号入口、已知评测来源和未知字段分开显示；它不把图形当成尺寸、颜色、材质或原厂配置证明。`, factClass: "core", confidence: 0.99, sourceKey: svgSource.key, locator: svgSource.summary, evidence: [{ key: `phase235-${def.brandSlug}-editorial-boundary-evidence`, sourceKey: svgSource.key, scopeKey: scope, locator: "editorial factual SVG explicitly marks non-photo and not-to-scale limits" }] },
      { key: `phase235-${def.brandSlug}-model-identity`, predicate: "model_identity", objectText: `${def.short} 是白丁 Alan 评测中的独立具体型号；评测样本不等于全部生产批次，编号之外仍需核对刻字、笔尖和帽盖。`, factClass: "core", confidence: 0.98, sourceKey: reviewSource.key, locator: reviewSource.summary, evidence: [{ key: `phase235-${def.brandSlug}-model-identity-evidence`, sourceKey: reviewSource.key, scopeKey: scope, locator: "review title and model-specific sample" }] },
      { key: `phase235-${def.brandSlug}-model-unknowns`, predicate: "specification_boundary", objectText: `公开资料不足以确认 ${def.short} 的统一尺寸、重量、上墨和首发年份；这些字段按单支实物和卖家说明核对，不用相似型号填空。`, factClass: "core", confidence: 0.99, sourceKey: reviewSource.key, locator: reviewSource.summary, evidence: [{ key: `phase235-${def.brandSlug}-model-unknowns-evidence`, sourceKey: reviewSource.key, scopeKey: scope, locator: "single sample review does not establish catalogue-wide specs" }] },
      { key: `phase235-${def.brandSlug}-model-care`, predicate: "maintenance_boundary", objectText: "收到旧笔先用常温清水短暂测试，再使用普通染料墨；不使用强溶剂、热水或硬拧未知结构，漏墨、歪尖和缺件交给熟悉国产旧笔的维修者。", factClass: "editorial", confidence: 0.98, sourceKey: reviewSource.key, locator: "conservative care guidance tied to uncertain vintage condition", evidence: [{ key: `phase235-${def.brandSlug}-model-care-evidence`, sourceKey: reviewSource.key, scopeKey: scope, locator: "sample-first maintenance boundary" }] },
      { key: `phase235-${def.brandSlug}-model-purchase`, predicate: "purchase_boundary", objectText: "选购应优先看刻字、笔尖近照、帽口、上墨件和试写；冷门或绝版说法不自动证明稀有、品相或价格合理。", factClass: "editorial", confidence: 0.98, sourceKey: reviewSource.key, locator: "model-specific purchase checklist", evidence: [{ key: `phase235-${def.brandSlug}-model-purchase-evidence`, sourceKey: reviewSource.key, scopeKey: scope, locator: "review sample and conservative buying advice" }] },
    ],
    variants: [{ key: `phase235-${def.brandSlug}-sample`, name: "评测样本", notes: "页面事实以白丁 Alan 的具体样本为入口；后配笔尖、清洗和维修状态需按手中实物复核。", sourceKey: reviewSource.key, variantKind: "edition_group" }],
    spec: { brandEntityId: def.brandId, values: { series_name: def.penName, release_year: "公开评测记录的访问窗口；首发年份未核实", origin_country: "中国市场品牌线索；法人、工厂和具体产地未核实", nib: "评测样本为钢尖语境；尖材、字幅和后配情况按单支核对", fill_system: "公开资料不足以确认统一上墨机构；按实物和卖家说明核对", material: "笔身、帽盖和饰件材质按单支实物核对", dimensions: "未见可核实的统一目录尺寸；按单支实测", weight: "未见可核实的统一目录克重；按未装墨状态实测", price_range: "无稳定可引用的当前价格；按品相、完整度和维修预算估价", status: "历史／小众国产型号；公开库存与配置不稳定" }, evidence: [evidence("brand_entity_id", `${def.penId}-brand`, reviewSource.key, scope, "model review brand context"), evidence("series_name", `${def.penId}-series`, reviewSource.key, scope, "review title"), evidence("release_year", `${def.penId}-release`, reviewSource.key, scope, "review window only; launch year withheld"), evidence("origin_country", `${def.penId}-origin`, reviewSource.key, scope, "Chinese market context without factory inference"), evidence("nib", `${def.penId}-nib`, reviewSource.key, scope, "sample nib context"), evidence("fill_system", `${def.penId}-fill`, reviewSource.key, scope, "unknown until sample verification"), evidence("material", `${def.penId}-material`, reviewSource.key, scope, "sample-first material boundary"), evidence("dimensions", `${def.penId}-dimensions`, reviewSource.key, scope, "no stable catalogue dimension"), evidence("weight", `${def.penId}-weight`, reviewSource.key, scope, "no stable catalogue weight"), evidence("price_range", `${def.penId}-price`, reviewSource.key, scope, "no stable current price"), evidence("status", `${def.penId}-status`, reviewSource.key, scope, "historical/small-batch context")] },
    timeline: [{ key: `${def.penId}-review`, title: `${def.short} 公开评测`, eventType: "model_released", startDate: "2019", circa: true, description: "公开视频提供可追踪的型号和单支观察窗口；不是首发年份。", sourceKey: reviewSource.key }],
    media: media(def, svgSource),
  };
}

export function phase235ObscureChineseTrioPacks(): CuratedEntityPack[] {
  const packs: CuratedEntityPack[] = [];
  for (const def of PHASE235_TARGETS) { const reviewSource = review(def); const svgSource = svg(def); packs.push(brandPack(def, reviewSource, svgSource), penPack(def, reviewSource, svgSource)); }
  return packs;
}
