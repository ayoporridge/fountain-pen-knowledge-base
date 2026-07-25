import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase159HeroPacks } from "./phase159-hero-100-616-329";

const RETRIEVED = "2026-07-25";
export const PHASE197_HERO_BRAND_ID = "LIfzzmbCfFPt";
export const PHASE197_HERO_1997_ID = "A-m4SlNs1MJd";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase197", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase197", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实图案、颜色、比例、编号、纯度、尺寸或礼盒配置。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  city: live({ key: "phase197-hero-1997-citynews", title: "City News Service：Hero 工匠与 1997 18K 金笔", url: "https://www.citynewsservice.cn/articles/craftsman-preserves-handmade-gold-nib-tradition-as-hero-pens-evolve-3k0eeben", registryName: "City News Service", sourceType: "blog", tier: "professional_secondary", summary: "报道记录 1996 年底接单、1997 香港回归 18K 金笔、大尺寸纪念纹样、模具和手工校准及逐支书写测试。", locator: "Hero workshop report: late-1996 order, 1997 handover pen, large commemorative nib and hand adjustment" }),
  shine: live({ key: "phase197-hero-1997-shine", title: "SHINE News：A pen mightier than the cellphone", url: "https://www.shine.cn/feature/art-culture/1904102756/", registryName: "SHINE News", sourceType: "blog", tier: "professional_secondary", summary: "上海工匠采访把 Hero 1997、1999、2001 纪念笔列入重要项目，支持事件与工匠语境，不提供统一 SKU 规格。", locator: "Hero 1997 handover pen and later commemorative projects" }),
  auction: live({ key: "phase197-hero-1997-collectionhero", title: "CollectionHero：Shanghai Hero 1997 Limited Commemorative Fountain Pen", url: "https://fountainpen.collectionhero.com/view_item.php?id=64765", registryName: "CollectionHero historical price reference", sourceType: "retailer", tier: "retailer", summary: "已成交收藏记录提到 18K 笔尖、24K 镀金、限量纪念和礼盒；只作为特定交易样本，不泛化数量和统一配置。", locator: "sold eBay listing: Shanghai Hero 1997, 18k nib, 24k gilding and limited commemorative description" }),
  carousell: live({ key: "phase197-hero-1997-carousell", title: "Carousell：HERO 1997 香港回归纪念金笔", url: "https://www.carousell.sg/p/hero-fountain-pen-limited-edition-1997%E9%A6%99%E6%B8%AF%E5%9B%9E%E5%BD%92%E7%BA%AA%E5%BF%B5%E9%87%91%E7%AC%94-61880391/", registryName: "Carousell seller listing", sourceType: "retailer", tier: "retailer", summary: "交易列表展示 1997 香港回归纪念、18K、24K 镀金和编号礼盒等市场描述；需以笔尖和证书实物复核。", locator: "market listing: 1997 Hong Kong return commemorative, 18K nib, 24K gilding and serial box" }),
  official: live({ key: "phase159-hero-official", title: "上海英雄（集团）有限公司官方首页", url: "https://www.hero.com.cn/", registryName: "上海英雄（集团）有限公司", sourceType: "official", tier: "primary", summary: "官方资料用于确认 Hero 品牌和上海英雄金笔厂语境；不把当前目录外的 1997 历史型号写成现售 SKU。", locator: "company profile and Hero brand context" }),
  svg: diagram("phase197-hero-1997-svg", "Hero 1997 型 18K 金笔纪念示意", "/images/library/site-original/phase197/hero/1997.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.86, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "hero-1997-model";
const pen: CuratedEntityPack = {
  key: "phase197-hero-1997",
  entityId: PHASE197_HERO_1997_ID,
  expectedType: "pen",
  expectedSlug: "上海-shanghai-97回归",
  canonicalName: "英雄 Hero 1997型18K金笔",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/hero-1997-phase197.md",
  storyTitle: "英雄 Hero 1997 型 18K 金笔：香港回归纪念笔的事件、工艺与收藏边界",
  primarySourceKey: S.city.key,
  depthTier: "A",
  aliases: [{ alias: "Hero 1997", language: "en", sourceKey: S.city.key }, { alias: "Hero 1997 commemorative fountain pen", language: "en", sourceKey: S.shine.key }, { alias: "英雄 1997 型", language: "zh", sourceKey: S.city.key }, { alias: "香港回归纪念金笔", language: "zh", sourceKey: S.carousell.key }],
  sources: [S.city, S.shine, S.auction, S.carousell, S.official, S.svg],
  scopes: [{ key: scope, scopeKey: "hero-1997-handover-commemorative-and-care", productionState: "historical", editionScope: "1997 香港回归纪念语境、18K 金尖、工匠手工校准、编号礼盒市场样本与收藏维护边界" }],
  claims: [
    claim("hero-1997-identity", "model_identity", "Hero 1997 型 18K 金笔是上海英雄为 1997 香港回归相关纪念场景制作的历史型号；1996 年底接单、1997 事件和笔尖纪念纹样共同构成身份线索。", S.city.key, scope, "late-1996 order and 1997 handover pen report"),
    claim("hero-1997-craft", "craft_process", "报道记录大尺寸 18K 金尖需要覆盖大面积纪念图案，工匠重新设计模具并以手工调整和逐支书写测试完成。", S.city.key, scope, "large commemorative nib, tooling and hand adjustment"),
    claim("hero-1997-market-boundary", "version_boundary", "收藏交易样本出现 24K 镀金、编号和礼盒，但这些属于特定列表，不能证明所有 Hero 1997 型都有相同装饰、产量或证书。", S.auction.key, scope, "sold listing details kept as specimen evidence"),
    claim("hero-1997-nib-boundary", "nib_boundary", "18K 只确认金含量语境，不自动确定 F/M/B 尖幅或柔软度；尖刻字、雕刻、铱粒和调校按单支验收。", S.city.key, scope, "18K gold nib and individual writing tests"),
    claim("hero-1997-filling-boundary", "filling_system_boundary", "公开新闻和收藏列表没有统一确认 1997 型上墨机构；吸墨器、墨囊或礼盒附件必须按实物确认，不能从 Hero 100 或 H70 回填。", S.shine.key, scope, "no public uniform filling specification"),
    claim("hero-1997-care", "maintenance_guidance", "清水低量试写、保存编号和盒证、避免强抛光与强溶剂；金色饰件、18K 尖和纪念刻纹异常时交由维修者。", S.auction.key, scope, "collector specimen and conservative care boundary"),
  ],
  variants: [{ key: "hero-1997-18k-nib", name: "18K 纪念金尖", notes: "报道确认的大尺寸 18K 尖和纪念纹样；尖幅、刻字和状态按实物核对。", sourceKey: S.city.key, variantKind: "nib" }, { key: "hero-1997-gilded-boxed", name: "24K 镀金／编号礼盒市场样本", notes: "收藏列表中的特定配置，不证明所有样本统一具备。", sourceKey: S.auction.key, variantKind: "edition_group" }, { key: "hero-1997-unboxed", name: "无盒单支待核样本", notes: "没有盒证时仍需检查尖刻字、编号和纪念纹样，证据强度较低。", sourceKey: S.carousell.key, variantKind: "variant" }],
  spec: {
    brandEntityId: PHASE197_HERO_BRAND_ID,
    values: { series_name: "Hero 1997 香港回归纪念型 18K 金笔", release_year: "1997 事件纪念；1996 年底接单制作", origin_country: "中国上海；上海英雄金笔厂语境", nib: "大尺寸 18K 金尖，带纪念纹样；尖幅、刻字和手感按单支核对", fill_system: "公开资料未确认统一机构；吸墨器、墨囊或礼盒附件按实物确认", material: "18K 金尖；外壳、帽盖、饰件和可能的 24K 镀金随样本核验", dimensions: "未找到可靠统一厂规尺寸；按合盖、未插帽和插帽状态测量", weight: "未找到可靠统一公开重量；金属饰件、礼盒附件和装墨状态会影响单支测量", status: "历史纪念型号；二手与收藏市场流通，现行生产和官方售后状态不明" },
    evidence: [ev("hero-1997", "brand_entity_id", S.official.key, scope, "Hero official brand context"), ev("hero-1997", "series_name", S.city.key, scope, "1997 handover commemorative pen identity"), ev("hero-1997", "release_year", S.city.key, scope, "late-1996 order and 1997 event"), ev("hero-1997", "origin_country", S.official.key, scope, "Shanghai Hero context"), ev("hero-1997", "nib", S.city.key, scope, "large 18K commemorative nib"), ev("hero-1997", "fill_system", S.shine.key, scope, "no uniform public filling specification"), ev("hero-1997", "material", S.auction.key, scope, "18K nib and 24K gilding specimen"), ev("hero-1997", "dimensions", S.city.key, scope, "no uniform public factory dimensions"), ev("hero-1997", "weight", S.city.key, scope, "no uniform public weight"), ev("hero-1997", "status", S.auction.key, scope, "historical collector circulation")],
  },
  media: [{ key: "hero-1997-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表真实图案、颜色、比例、编号、纯度、尺寸或礼盒配置。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const existingBrand = phase159HeroPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE197_HERO_BRAND_ID);
if (!existingBrand) throw new Error("Phase 197 requires the existing curated Hero brand pack.");
const officialSource = existingBrand.sources.find((source) => source.sourceType === "official") ?? S.official;
pen.sources = [...pen.sources, officialSource];

export const phase197Hero1997Packs: CuratedEntityPack[] = [existingBrand, pen];
