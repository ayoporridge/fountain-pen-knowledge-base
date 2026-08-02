import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-02";
export const PHASE352_DANITRIO_BRAND_ID = "phase352-danitrio-brand";
export const PHASE352_DENSHO_ID = "phase352-danitrio-densho";
export const PHASE352_DENSHO_SLUG = "danitrio-densho";
const BRAND_SCOPE = "Danitrio Maki-e and Urushi fountain pen brand, collection navigation, artist and origin boundaries";
const MODEL_SCOPE = "Danitrio Densho ebonite eyedropper Maki-e collection, DE design variants, sample nib/feed and care boundaries";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.independenceGroup,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase352",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase352",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }],
  };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const home = web({
  key: "danitrio-official-home",
  title: "Danitrio official Maki-e Pen Collection",
  url: "https://danitrio.com/",
  registryKey: "danitrio-official-home-phase352",
  registryName: "Danitrio Maki-e Collection official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "danitrio-official-home-phase352",
  summary: "官方导航列出 Genkai、Sho-Genkai、Mikado、Kaijin、Takumi、Densho、Hanryo、Hyotan、Yokozuna、Chinkin，并介绍 Maki-e 技法背景。",
  locator: "official collection navigation and Maki-e background",
});

const densho = web({
  key: "danitrio-official-densho",
  title: "Danitrio official Densho collection",
  url: "https://danitrio.com/htmlPages/Densho.html",
  registryKey: "danitrio-official-densho-phase352",
  registryName: "Danitrio Maki-e Collection official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "danitrio-official-densho-phase352",
  summary: "官方 Densho 页写 ebonite ED pen、Hira/Togidashi/Taka/Shishiai Togidashi、Raden/Hyomon/Kawari-nuri，并列出艺师与 DE 编号。",
  locator: "Densho description, technique list, artists and DE designs",
});

const interview = web({
  key: "danitrio-pen-design",
  title: "Pen&Design interview with Bernard Lyn of Danitrio",
  url: "https://www.penanddesign.com/post/57209070996/pendesign-interview-bernard-lyn-of-danitrio",
  registryKey: "pen-design-danitrio-bernard-lyn-phase352",
  registryName: "Pen&Design",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pen-design-danitrio-bernard-lyn-phase352",
  summary: "对 Dani International Corp. CEO Bernard Lyn 的访谈记述 1982 台湾早期生产、1998 转向 Maki-e、ebonite 起点、Mikado/Genkai/Yokozuna 和 raw Densho 历史语境。",
  locator: "Bernard Lyn answers on company history, ebonite, Maki-e and Densho",
});

const fpn = web({
  key: "danitrio-fpn-review",
  title: "Fountain Pen Network：Densho Raw Ebonite Eyedropper Review",
  url: "https://www.fountainpennetwork.com/forum/topic/21683-danitrio-densho-raw-ebonite-eyedropper-review/",
  registryKey: "fountain-pen-network-danitrio-densho-phase352",
  registryName: "Fountain Pen Network participant",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fountain-pen-network-danitrio-densho-phase352",
  summary: "2006 单支评测描述 raw ebonite、黑色 torpedo、eyedropper、18K gold nib、ebonite feed 和大容量体验；所有感受均为样本。",
  locator: "Densho review appearance, filling, nib and feed sections",
});

const urushipen = web({
  key: "danitrio-urushipen",
  title: "UrushiPen：Are Urushi Pens Works of Art or Writing Instruments?",
  url: "https://www.urushipen.com/blogs/resource/are-urushi-pens-works-of-art-or-writing-instruments",
  registryKey: "urushipen-danitrio-filling-phase352",
  registryName: "UrushiPen.com",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "urushipen-danitrio-filling-phase352",
  summary: "专业经销商教育页把 Densho 列入六款 eyedropper-fill Danitrio，说明 blind cap 调节墨流，并把其它系列区分为 cartridge/converter。",
  locator: "Danitrio eyedropper list and blind-cap ink-flow explanation",
});

const video = web({
  key: "danitrio-video",
  title: "Blake’s Broadcast：Danitrio Densho review",
  url: "https://www.youtube.com/watch?v=JZIbXR8igsQ",
  registryKey: "blakes-broadcast-danitrio-densho-phase352",
  registryName: "Blake’s Broadcast",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "blakes-broadcast-danitrio-densho-phase352",
  summary: "独立视频把 Densho 描述为 ebonite-bodied、black urushi lacquer、eyedropper 和 18K JoWo nib；仅作样本交叉。",
  locator: "video description and Densho construction summary",
});

const svg = diagram("danitrio-densho-svg", "Danitrio Densho ebonite eyedropper and Maki-e factual diagram", "/images/library/site-original/phase352/danitrio/densho.svg");

const brand: CuratedEntityPack = {
  key: "phase352-danitrio-brand-v1",
  entityId: PHASE352_DANITRIO_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "danitrio",
  canonicalName: "Danitrio 丹尼特里奥",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-danitrio-densho/brand.md",
  storyTitle: "Danitrio：把 Maki-e 放在一支真正能灌墨的笔上",
  primarySourceKey: home.key,
  depthTier: "A",
  aliases: [
    { alias: "Dani International Corp.", language: "en", sourceKey: interview.key },
    { alias: "Danitrio Maki-e pens", language: "en", sourceKey: home.key },
    { alias: "Danitrio 丹尼特里奥钢笔", language: "zh", sourceKey: densho.key },
  ],
  sources: [home, densho, interview, urushipen, video, fpn, svg],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "unknown", editionScope: "Danitrio Maki-e/Urushi collection navigation; Densho, Mikado, Genkai, Yokozuna and other routes remain separate. Official site is accessible, but current production and complete source table are not asserted." }],
  claims: [
    claim("danitrio-navigation", "brand_model_navigation", "官方导航列出 Genkai、Sho-Genkai、Mikado、Kaijin、Takumi、Densho、Hanryo、Hyotan、Yokozuna、Chinkin 等独立路线。", home.key, BRAND_SCOPE, "official collection navigation"),
    claim("danitrio-makie", "craft_process", "官方将 Maki-e 介绍为约 1,200 年前发展起来的日本漆器技法，并说明 Yamanaka/Wajima 的工艺传承处于学习者减少的背景。", home.key, BRAND_SCOPE, "official Maki-e history and artisan context"),
    claim("danitrio-history", "brand_history", "Bernard Lyn 访谈记述 1982 台湾早期生产、1998 看到 Maki-e 后转向自有 Maki-e fountain pens，并以 ebonite 起步；这是历史采访口径。", interview.key, BRAND_SCOPE, "company history answers in interview"),
    claim("danitrio-material", "material_scope", "访谈把 ebonite 作为 Maki-e 理想底材，官方 Densho 页确认 ebonite ED；其它系列的 celluloid、漆和金属按各自页面核对。", interview.key, BRAND_SCOPE, "ebonite design origin and Densho material boundary"),
    claim("danitrio-artists", "artist_scope", "官方 Densho 页列 Kogaku、Koho、Oohata，并把 DE 编号和技法分开；艺师和图案不外推为全品牌固定合作名单。", densho.key, BRAND_SCOPE, "Densho artists and design numbers"),
    claim("danitrio-filling", "filling_scope", "UrushiPen 将 Densho、Genkai、Junikaku、Mikado、Yokozuna、Sho-Genkai 列为 eyedropper，并与 Hakkaku、Hyotan、Sho-Hakkaku、Takumi 的 cartridge/converter 分开。", urushipen.key, BRAND_SCOPE, "brand filling-system comparison"),
    claim("danitrio-secondary", "professional_secondary_boundary", "Pen&Design 访谈和 UrushiPen 教育页提供独立历史／供墨交叉，但不替官方页面增加当前价格、尺寸或产地表。", interview.key, BRAND_SCOPE, "independent history and evidence boundary"),
    claim("danitrio-status", "availability_boundary", "官方 collection 页面可访问，但没有统一当前库存、生产总数或覆盖全部组件的产地表；品牌状态保留 unknown。", home.key, BRAND_SCOPE, "official catalogue availability boundary", "editorial"),
    claim("danitrio-care", "maintenance_guidance", "Urushi、Maki-e、ebonite 和 eyedropper/converter 需要按型号分别维护；品牌导航只提供工艺与供墨边界。", urushipen.key, BRAND_SCOPE, "conservative material and filling care", "editorial"),
  ],
  variants: [{ key: "danitrio-collections", name: "Densho / Mikado / Genkai / Sho-Genkai / Takumi / Hyotan / Yokozuna / Chinkin", notes: "官方 collection 导航中的独立路线；底材、技法、尖和供墨按型号页核验。", sourceKey: home.key, variantKind: "edition_group", market: "global" }],
  timeline: [
    { key: "danitrio-1982", title: "台湾早期生产的访谈记忆", eventType: "brand_founded", startDate: "1982", circa: false, description: "Bernard Lyn 在访谈中说早期笔于 1982 年在台湾制作；这是采访口径，不推断当前所有组件产地。", sourceKey: interview.key },
    { key: "danitrio-1998", title: "转向自有 Maki-e fountain pens", eventType: "design_milestone", startDate: "1998", circa: false, description: "访谈把 1998 作为看到 Maki-e 并决定制作自有 Maki-e fountain pens 的转折；不把它当作 Densho 上市年份。", sourceKey: interview.key },
    { key: "danitrio-densho", title: "官方 Densho collection 页面", eventType: "model_released", startDate: "2000", circa: true, description: "官方 Densho 页称其为 latest collection，但没有独立上市年份；时间线只记录页面系列顺序。", sourceKey: densho.key },
  ],
  media: [{ key: "danitrio-brand-svg", title: "Danitrio Densho 与 Maki-e collection 事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase352-danitrio-densho-v1",
  entityId: PHASE352_DENSHO_ID,
  expectedType: "pen",
  expectedSlug: PHASE352_DENSHO_SLUG,
  canonicalName: "Danitrio Densho",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/danitrio-densho-phase352.md",
  storyTitle: "Danitrio Densho：先是一支 ebonite eyedropper，再是一块可以写字的漆艺底板",
  primarySourceKey: densho.key,
  depthTier: "A",
  aliases: [
    { alias: "Danitrio Densho fountain pen", language: "en", sourceKey: densho.key },
    { alias: "Densho Raw Ebonite", language: "en", sourceKey: fpn.key },
    { alias: "Danitrio Densho 丹尼特里奥传承系列", language: "zh", sourceKey: densho.key },
  ],
  sources: [home, densho, interview, fpn, urushipen, video, svg],
  scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "unknown", materialScope: "Official Densho page confirms ebonite ED and Maki-e; raw ebonite, black urushi and specific layers/nib are sample or design scoped.", nibScope: "18K gold sample and 18K JoWo wording come from individual review/video; official Densho page does not publish one universal nib table.", editionScope: "Densho collection route; DE-103/106/122/124/202 are design numbers/artist variants, not separate mechanical entities." }],
  claims: [
    claim("densho-identity", "model_identity", "官方称 Densho 是 latest collection，以 ebonite ED pen 为底并覆盖 Maki-e designs；页面没有给独立上市年份。", densho.key, MODEL_SCOPE, "official Densho identity and latest collection wording"),
    claim("densho-techniques", "craft_process", "官方依次列 Hira、Togidashi、Taka、Shishiai Togidashi，并补充 Raden、Hyomon、Kawari-nuri；不是每支笔的统一漆法。", densho.key, MODEL_SCOPE, "Densho technique list"),
    claim("densho-artists", "artist_scope", "Densho 第一轮设计由 Kogaku、Koho、Oohata 参与，官方列 DE-103、DE-106、DE-122、DE-124、DE-202 等图案／编号。", densho.key, MODEL_SCOPE, "Densho artists and DE designs"),
    claim("densho-filling", "filling_system", "Densho 属于 eyedropper-fill 路线；UrushiPen 说明同类笔用 blind cap 调节墨流，而 Hakkaku、Hyotan、Sho-Hakkaku、Takumi 走 cartridge/converter。", urushipen.key, MODEL_SCOPE, "Densho in eyedropper list and blind cap guide"),
    claim("densho-ebonite", "material", "官方确认 Densho ebonite ED；FPN 单支评测进一步描述 raw ebonite 黑色 torpedo 样本，不把 raw finish 写成所有 Maki-e 版本的统一外观。", densho.key, MODEL_SCOPE, "official ebonite ED and sample raw ebonite boundary"),
    claim("densho-nib", "nib", "FPN 评测样本有 18K gold nib、ebonite feed；独立视频写 18K JoWo，具体尖号、尺寸和年份仍按单支刻字核对。", fpn.key, MODEL_SCOPE, "review nib and feed sample"),
    claim("densho-artist-variants", "variant_boundary", "DE-103 Houou、DE-106 Bottan-Karakusa、DE-122 Horaisan、DE-124 Hyakunin Isshu、DE-202 Pheasant & Rabbit 是 collection 内图案编号／艺师变体，不创建机械型号。", densho.key, MODEL_SCOPE, "official DE design examples"),
    claim("densho-size-boundary", "physical_specification", "官方 Densho 页未发布统一闭帽、套帽、桶径或重量；FPN 的“大笔”是单支评测体验，不能换算成标准值。", densho.key, MODEL_SCOPE, "absence of official dimensions and sample review boundary"),
    claim("densho-capacity-boundary", "ink_capacity_boundary", "FPN 评测认为 raw Densho 的 eyedropper 容量很大，但没有可复用的量筒数字；型号页保留容量未知。", fpn.key, MODEL_SCOPE, "single review large-capacity observation without measurement"),
    claim("densho-status", "production_status", "官方 collection 页面可访问且把 Densho 写作 latest collection，但没有库存、生产总数或独立年份；状态保留 unknown，不写停产或现售。", densho.key, MODEL_SCOPE, "official page status boundary", "editorial"),
    claim("densho-care", "maintenance_guidance", "eyedropper 先检查螺纹和盲帽，再用常规染料墨测试；Urushi、Maki-e、ebonite 避免酒精、研磨剂、硬刷和长时间浸泡。", urushipen.key, MODEL_SCOPE, "filling and conservative surface care", "editorial"),
    claim("densho-buying", "selection_guidance", "购买先核对 DE 编号、艺师、Maki-e 技法、ebonite／Urushi 状态、18K 尖刻字和来源照片；价格、库存与稀有度不代替身份。", interview.key, MODEL_SCOPE, "artist, material and provenance boundary", "editorial"),
  ],
  variants: [
    { key: "densho-technique-variants", name: "Hira / Togidashi / Taka / Shishiai Togidashi / Raden / Hyomon / Kawari-nuri", notes: "官方 Densho 页的工艺路线；每支设计可能只采用其中一部分。", sourceKey: densho.key, variantKind: "edition_group", market: "global" },
    { key: "densho-de-numbers", name: "DE-103 / DE-106 / DE-122 / DE-124 / DE-202", notes: "官方列出的图案编号／艺师例子；不等于总限量或全部 Densho 清单。", sourceKey: densho.key, variantKind: "market_sku", market: "global" },
    { key: "densho-filling", name: "Ebonite eyedropper with blind-cap ink-flow control", notes: "品牌教育页和单支评测的供墨路线；不与其它 Danitrio C/C 系列混用。", sourceKey: urushipen.key, variantKind: "variant", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE352_DANITRIO_BRAND_ID,
    values: {
      series_name: "Densho Maki-e Collection",
      release_year: "官方称 latest collection，但 Densho 页未发布独立上市年份",
      origin_country: "官方 Densho 页未给整支统一产地；品牌历史访谈分别记述台湾早期生产与日本 Maki-e 工艺语境",
      nib: "18K gold sample / 18K JoWo wording from independent review and video; universal size/options not published",
      fill_system: "Ebonite eyedropper (ED); blind cap controls ink flow in brand-level guide",
      material: "Ebonite base with Urushi/Maki-e designs; technique and finish vary by DE design",
      dimensions: "Official Densho page does not publish a unified size; individual review calls the sample large",
      weight: "Official Densho page does not publish weight; preserve unknown",
      status: "Official collection page accessible; current production, inventory and total edition count not verified",
    },
    evidence: [
      evidence("densho-brand", "brand_entity_id", home.key, MODEL_SCOPE, "Danitrio official brand navigation"),
      evidence("densho-series", "series_name", densho.key, MODEL_SCOPE, "official Densho page"),
      evidence("densho-release", "release_year", densho.key, MODEL_SCOPE, "latest collection wording without standalone year"),
      evidence("densho-origin", "origin_country", interview.key, MODEL_SCOPE, "historical Taiwan and Maki-e production boundary"),
      evidence("densho-nib-spec", "nib", fpn.key, MODEL_SCOPE, "single review 18K nib and ebonite feed"),
      evidence("densho-fill-spec", "fill_system", urushipen.key, MODEL_SCOPE, "eyedropper list and blind cap guide"),
      evidence("densho-material-spec", "material", densho.key, MODEL_SCOPE, "ebonite ED and Maki-e"),
      evidence("densho-dimensions", "dimensions", densho.key, MODEL_SCOPE, "no official unified dimensions"),
      evidence("densho-weight", "weight", densho.key, MODEL_SCOPE, "no official weight"),
      evidence("densho-status", "status", densho.key, MODEL_SCOPE, "official collection page availability boundary"),
    ],
  },
  timeline: [{ key: "densho-official-page", title: "Densho collection 官方页面", eventType: "model_released", startDate: "2000", circa: true, description: "官方页称 Densho 为 latest collection，但未给独立首发年份；时间线只记录当前可见系列页。", sourceKey: densho.key }],
  media: [{ key: "densho-svg", title: "Densho ebonite ED 与 Maki-e 技法事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase352DanitrioDenshoPacks: CuratedEntityPack[] = [brand, model];
