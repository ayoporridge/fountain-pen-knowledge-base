import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE79_KAWECO_PERKEO_FALLBACK_ID = "phase79-pen-kaweco-perkeo";
export const PHASE79_KAWECO_PERKEO_SLUG = "kaweco-perkeo";

const RETRIEVED = "2026-07-20";

function live(
  input: Omit<
    CuratedSource,
    | "retrievedAt"
    | "allowedUse"
    | "homepageUrl"
    | "archiveUrl"
    | "archiveLocator"
    | "independenceGroup"
  >,
): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
    independenceGroup: input.registryKey,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase79",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase79",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创事实示意图：仅用于标出 All Black SKU 的全尺寸、卡扣帽、14 g 和 Standard Converter 路线，不作为产品照片、比例图或外观证据。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false`,
  };
}

const SOURCES = {
  product: live({
    key: "phase79-kaweco-perkeo-all-black-official",
    registryKey: "kaweco-official-phase79",
    registryName: "Kaweco official product",
    sourceType: "official",
    tier: "primary",
    title: "Kaweco PERKEO Fountain Pen All Black",
    url: "https://www.kaweco-pen.com/en/Kaweco-PERKEO-Fountain-Pen-All-Black/99000070/",
    summary:
      "当前 All Black 商品页将其列为塑料钢笔，给出闭合 14 cm、插帽 15.9 cm、无夹直径 15 mm、14 g、F/M 钢尖、皇家蓝墨囊与 Kaweco Standard Converter 可选配件。",
  }),
  series: live({
    key: "phase79-kaweco-perkeo-series-official",
    registryKey: "kaweco-catalogue-phase79",
    registryName: "Kaweco official catalogue",
    sourceType: "official",
    tier: "contemporary_archive",
    title: "Kaweco PERKEO series",
    url: "https://www.kaweco-pen.com/en/Series/PERKEO/",
    summary:
      "官方 PERKEO 系列页描述八角笔帽、十六面笔杆、人体工学握位和卡扣帽，并并列钢笔、滚珠与书法套装；本页面只承接钢笔，不把同名其他品类并入。",
  }),
  history: live({
    key: "phase79-kaweco-history-official",
    registryKey: "kaweco-history-phase79",
    registryName: "Kaweco official history",
    sourceType: "official",
    tier: "contemporary_archive",
    title: "Kaweco History",
    url: "https://www.kaweco-pen.com/en/About-Kaweco/History/",
    summary:
      "官方年表将 Perkeo 列在 1889 年使用的历史名称之中；该记录只证明名称语境，不能推出今天的塑料 Perkeo 于 1889 年推出。",
  }),
  yoseka: live({
    key: "phase79-kaweco-perkeo-yoseka",
    registryKey: "yoseka-phase79",
    registryName: "Yoseka Stationery",
    sourceType: "retailer",
    tier: "retailer",
    title: "Kaweco Perkeo Fountain Pen – All Black",
    url: "https://yosekastationery.com/products/kaweco-perkeo-fountain-pen-all-black",
    summary:
      "Yoseka 的 All Black 零售页交叉列出卡扣帽、钢尖、标准国际墨囊和 Kaweco Standard Converter 兼容性；它用于补充交叉核验，不替代官方 SKU 规格。",
  }),
  penChalet: live({
    key: "phase79-kaweco-perkeo-pen-chalet",
    registryKey: "pen-chalet-phase79",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "retailer",
    title: "Kaweco Perkeo Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/kaweco_perkeo_fountain_pen/Peony%2BBlossom",
    summary:
      "Pen Chalet 的系列商品资料也记录塑料笔身、卡扣帽和供墨路线，可用于核对不同配色／地区页面不应被当作同一 SKU 的库存或尖号承诺。",
  }),
  review: live({
    key: "phase79-kaweco-perkeo-pencilcase-review",
    registryKey: "pencilcase-blog-phase79",
    registryName: "The Pencilcase Blog",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "KAWECO PERKEO FOUNTAIN PEN REVIEW",
    url: "https://www.pencilcaseblog.com/2017/08/kaweco-perkeo-fountain-pen-review.html",
    summary:
      "独立评测将 2017 年的 Perkeo 作为全尺寸入门款讨论，实测 F/M 两支样笔，并记录三角握位与钢尖书写感；它只支撑样笔体验和当时产品定位，不替代现行 All Black SKU 规格。",
  }),
  care: live({
    key: "phase79-kaweco-manual",
    registryKey: "kaweco-manual-phase79",
    registryName: "Kaweco official manual",
    sourceType: "official",
    tier: "contemporary_archive",
    title: "Kaweco HOW TO REFILL, CHANGE & USE",
    url: "https://www.kaweco-pen.com/media/pdf/b1/4f/c2/Kaweco_Manual_All-Pens_ENG_Prozess_122023_01.pdf",
    summary:
      "Kaweco 使用说明书说明墨囊、converter 和日常清洁的基本操作；具体配件适配仍必须回到正在购买的笔款与配件 SKU。",
  }),
  svg: diagram(
    "phase79-kaweco-perkeo-svg",
    "Kaweco Perkeo All Black facts",
    "/images/library/site-original/kaweco-perkeo/kaweco-perkeo-all-black-facts.svg",
  ),
} satisfies Record<string, CuratedSource>;

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

export function createPhase79KawecoPerkeoPacks(
  brandId: string,
  penId: string,
): CuratedEntityPack[] {
  const scopeKey = "phase79-kaweco-perkeo-all-black-scope";
  return [
    {
      key: "phase79-kaweco-perkeo-v1",
      entityId: penId,
      expectedType: "pen",
      expectedSlug: PHASE79_KAWECO_PERKEO_SLUG,
      canonicalName: "Kaweco Perkeo",
      publicationIntent: "publish",
      publicationBlockers: [],
      markdownFile: ".planning/content-research/kaweco-perkeo.md",
      storyTitle: "Kaweco Perkeo：全尺寸卡扣笔，不是拉长的 Sport",
      primarySourceKey: SOURCES.product.key,
      depthTier: "A",
      aliases: [
        { alias: "Kaweco Perkeo", language: "en", sourceKey: SOURCES.product.key },
        { alias: "Kaweco PERKEO", language: "en", sourceKey: SOURCES.series.key },
      ],
      sources: [
        SOURCES.product,
        SOURCES.series,
        SOURCES.history,
        SOURCES.yoseka,
        SOURCES.penChalet,
        SOURCES.review,
        SOURCES.care,
        SOURCES.svg,
      ],
      scopes: [
        {
          key: scopeKey,
          scopeKey,
          productionState: "current",
          editionScope:
            "规格锚点仅为当前 All Black 钢笔 SKU；其他颜色、滚珠、书法套装、配件和地区库存不自动继承其 F/M、重量或随附墨囊信息。",
        },
      ],
      claims: [
        {
          key: "phase79-kaweco-perkeo-identity",
          predicate: "model_identity",
          objectText:
            "Kaweco Perkeo 是一支独立的现代全尺寸入门钢笔，采用八角笔帽、十六面笔杆、人体工学握位和卡扣帽；它不是 Sport 的材质支线，也不包含同系列滚珠或书法套装。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.series.key,
          locator: SOURCES.series.summary,
          evidence: [
            {
              key: "phase79-kaweco-perkeo-identity-official",
              sourceKey: SOURCES.series.key,
              scopeKey,
              locator: SOURCES.series.summary,
            },
            {
              key: "phase79-kaweco-perkeo-identity-product",
              sourceKey: SOURCES.product.key,
              scopeKey,
              locator: SOURCES.product.summary,
            },
            {
              key: "phase79-kaweco-perkeo-identity-independent-review",
              sourceKey: SOURCES.review.key,
              scopeKey,
              locator: "独立评测对全尺寸入门定位、三角握位与 F/M 样笔的观察；不替代官方 SKU 规格。",
            },
          ],
        },
        {
          key: "phase79-kaweco-perkeo-sku-boundary",
          predicate: "version_boundary",
          objectText:
            "All Black 的塑料、14 cm、15.9 cm、15 mm、14 g、F/M 和皇家蓝墨囊是该 SKU 的资料锚点，不承诺所有 Perkeo 颜色或地区销售页使用同一规格与配置。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.product.key,
          locator: SOURCES.product.summary,
          evidence: [
            {
              key: "phase79-kaweco-perkeo-sku-official",
              sourceKey: SOURCES.product.key,
              scopeKey,
              locator: SOURCES.product.summary,
            },
            {
              key: "phase79-kaweco-perkeo-sku-retailer",
              sourceKey: SOURCES.penChalet.key,
              scopeKey,
              locator: SOURCES.penChalet.summary,
            },
          ],
        },
        {
          key: "phase79-kaweco-perkeo-history-boundary",
          predicate: "history_boundary",
          objectText:
            "官方历史资料中的 1889 年 Perkeo 名称记录是商标／产品名称语境，不能被改写为今日塑料 Perkeo 的首发年份或复刻声明。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.history.key,
          locator: SOURCES.history.summary,
          evidence: [
            {
              key: "phase79-kaweco-perkeo-history-evidence",
              sourceKey: SOURCES.history.key,
              scopeKey,
              locator: SOURCES.history.summary,
            },
          ],
        },
        {
          key: "phase79-kaweco-perkeo-care",
          predicate: "maintenance_boundary",
          objectText:
            "换墨或长期闲置前后，以室温清水缓慢冲洗前端并充分晾干；不以沸水、酒精、漂白剂、强清洁剂或金属工具处理笔尖和塑料前端。接口渗墨、持续断墨或摔尖时停止强拆，按售后或专业维修建议处理。",
          factClass: "core",
          confidence: 0.98,
          sourceKey: SOURCES.care.key,
          locator: SOURCES.care.summary,
          evidence: [
            {
              key: "phase79-kaweco-perkeo-care-evidence",
              sourceKey: SOURCES.care.key,
              scopeKey,
              locator: SOURCES.care.summary,
            },
          ],
        },
      ],
      variants: [
        {
          key: "phase79-kaweco-perkeo-all-black",
          name: "Perkeo All Black",
          releaseYear: "当前 SKU",
          productCode: "10001817",
          notes:
            "本页规格锚点：塑料、约 14 g、F/M、皇家蓝墨囊与 Standard Converter 路线；不替代其他配色或同名非钢笔产品。",
          sourceKey: SOURCES.product.key,
          variantKind: "market_sku",
        },
        {
          key: "phase79-kaweco-perkeo-colors",
          name: "Perkeo 其他颜色与同系列品类",
          releaseYear: "当前系列",
          notes:
            "官方系列页还列出其他颜色，并有滚珠与书法套装；它们不自动沿用 All Black 的库存、尖号、重量或配件。",
          sourceKey: SOURCES.series.key,
          variantKind: "edition_group",
        },
      ],
      spec: {
        brandEntityId: brandId,
        values: {
          series_name: "Kaweco Perkeo",
          release_year: "现代 Perkeo 系列；当前资料未把 All Black SKU 的首发年份定为 1889 年",
          origin_country:
            "德国 Kaweco 当前产品线；具体工厂、批次与市场信息以当期商品页、包装和实物为准",
          nib: "当前 All Black SKU：钢尖，当前页面列 F/M；其他 SKU 的尖号另核",
          fill_system:
            "标准国际短墨囊；当前 All Black 商品页列 Kaweco Standard Converter 可选，具体兼容性以正在购买的笔款与配件 SKU 为准",
          material: "当前 All Black SKU：塑料笔身与黑色饰件；其他颜色或同名非钢笔产品不互相代填",
          dimensions:
            "当前 All Black SKU：闭合约 14 cm；插帽约 15.9 cm；无夹直径约 15 mm",
          weight: "当前 All Black SKU：约 14 g",
          status: "当前系列；颜色、尖号、随附墨囊、converter 和地区库存按具体 SKU 确认",
        },
        evidence: [
          evidence("brand_entity_id", "phase79-kaweco-perkeo-brand", SOURCES.product.key, scopeKey, "official Kaweco product context"),
          evidence("series_name", "phase79-kaweco-perkeo-series", SOURCES.series.key, scopeKey, "official PERKEO series title"),
          evidence("release_year", "phase79-kaweco-perkeo-release", SOURCES.history.key, scopeKey, "official history naming boundary"),
          evidence("origin_country", "phase79-kaweco-perkeo-origin", SOURCES.product.key, scopeKey, "official Kaweco product context"),
          evidence("nib", "phase79-kaweco-perkeo-nib", SOURCES.product.key, scopeKey, "official All Black SKU current nib options"),
          evidence("fill_system", "phase79-kaweco-perkeo-fill", SOURCES.product.key, scopeKey, "official All Black SKU Standard Converter note"),
          evidence("material", "phase79-kaweco-perkeo-material", SOURCES.product.key, scopeKey, "official All Black SKU material"),
          evidence("dimensions", "phase79-kaweco-perkeo-dimensions", SOURCES.product.key, scopeKey, "official All Black SKU dimensions"),
          evidence("weight", "phase79-kaweco-perkeo-weight", SOURCES.product.key, scopeKey, "official All Black SKU weight"),
          evidence("status", "phase79-kaweco-perkeo-status", SOURCES.series.key, scopeKey, "official current PERKEO series listing"),
        ],
      },
      media: [
        {
          key: "phase79-kaweco-perkeo-media",
          title: "Kaweco Perkeo All Black 事实卡（非产品照片）",
          sourceKey: SOURCES.svg.key,
          localPath: SOURCES.svg.url,
          author: "Fountain Pen Graph editorial",
          license: "site-original",
          attributionText:
            "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存、材料纹理、特别版或具体笔尖配置。",
          sourceUrl: SOURCES.svg.url,
          usageStatus: "primary",
        },
      ],
      timeline: [
        {
          key: "phase79-kaweco-perkeo-current-sku",
          title: "Perkeo All Black 的当前官方 SKU 资料窗口",
          eventType: "model_released",
          startDate: "2026",
          circa: true,
          description:
            "当前官方商品页可见；检索年份不是该型号、每个颜色或历史 Perkeo 名称的首发年份。",
          sourceKey: SOURCES.product.key,
        },
      ],
    },
  ];
}
