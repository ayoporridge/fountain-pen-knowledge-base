import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE329_NEXUS_ID,
  phase329DiplomatCurrentPacks,
} from "./phase329-diplomat-current";
import {
  PHASE83_AERO_ID,
  phase83DiplomatLeonardoPacks,
} from "./phase83-diplomat-leonardo";
import {
  PHASE325_HAMA_NO_MATSU_ID,
  phase325PlatinumIzumoPiz300000HamaNoMatsuPacks,
} from "./phase325-platinum-izumo-piz-300000-hama-no-matsu";

export const PHASE482_IDS = {
  nexus: PHASE329_NEXUS_ID,
  aero: PHASE83_AERO_ID,
  hamaNoMatsu: PHASE325_HAMA_NO_MATSU_ID,
} as const;

const RETRIEVED = "2026-08-03";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  title: string;
  url: string;
  summary: string;
  author: string;
  publishedAt?: string;
}): CuratedSource {
  const homepageUrl = input.url.startsWith("http")
    ? new URL(input.url).origin
    : "/";
  return {
    ...input,
    homepageUrl,
    itemType: "web_page",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 482 exact-model depth refresh`,
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: CuratedClaim["factClass"] = "core",
): CuratedClaim {
  const locator = sourceItem.summary;
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "editorial" ? 0.95 : 0.98,
    sourceKey: sourceItem.key,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator }],
  };
}

function basePack(entityId: string, label: string): CuratedEntityPack {
  const all = [
    ...phase329DiplomatCurrentPacks,
    ...phase83DiplomatLeonardoPacks({
      excellenceA2: "phase83-pen-diplomat-excellence-a2",
      elox: "phase83-pen-diplomat-elox",
      momentoZero: "phase83-pen-leonardo-momento-zero",
      mzgMosaico: "phase83-pen-leonardo-mzg-mosaico",
    }),
    ...phase325PlatinumIzumoPiz300000HamaNoMatsuPacks,
  ];
  const pack = all.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 482 ${label} base pack is missing.`);
  return pack;
}

function refresh(
  pack: CuratedEntityPack,
  input: {
    key: string;
    markdownFile: string;
    storyTitle: string;
    primary: CuratedSource;
    extras: CuratedSource[];
    scope: CuratedScope;
    claims: CuratedClaim[];
    values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
    variants: NonNullable<CuratedEntityPack["variants"]>;
    eventTitle: string;
    eventDescription: string;
  },
): CuratedEntityPack {
  const aliases = [
    ...(pack.aliases ?? []),
    { alias: pack.canonicalName, language: "en", sourceKey: input.primary.key },
  ].filter(
    (alias, index, all) =>
      all.findIndex((candidate) => candidate.alias === alias.alias) === index,
  );
  const sources = [...(pack.sources ?? []), input.primary, ...input.extras].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  const scopes = [...(pack.scopes ?? []), input.scope].filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.scopeKey === item.scopeKey) === index,
  );
  const variants = [...(pack.variants ?? []), ...input.variants].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  return {
    ...pack,
    key: input.key,
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    aliases,
    sources,
    scopes,
    claims: [...(pack.claims ?? []), ...input.claims],
    variants,
    spec: pack.spec
      ? {
          ...pack.spec,
          values: { ...pack.spec.values, ...input.values },
          evidence: [
            ...(pack.spec.evidence ?? []),
            ...Object.keys(input.values).map((fieldKey) => ({
              key: `${input.key}-${fieldKey}-evidence`,
              fieldKey: fieldKey as SpecFieldKey,
              sourceKey: input.primary.key,
              scopeKey: input.scope.scopeKey,
              locator: input.primary.summary,
              qualifies: true,
            })),
          ],
        }
      : undefined,
    timeline: [
      ...(pack.timeline ?? []),
      {
        key: `${input.key}-current-review`,
        title: input.eventTitle,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: input.eventDescription,
        sourceKey: input.primary.key,
      },
    ],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const nexusOfficial = source({
  key: "phase482-diplomat-nexus-official",
  registryKey: "diplomat-official-phase482-nexus",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "diplomat-official-phase482",
  title: "Fountain pen Nexus Demo chrome — Diplomat",
  url: "https://www.diplomat-pen.com/en/product/nexus-demo-chrome-fountain-pen/",
  summary:
    "官方商品页核对 piston/pipette filling、帽与尖单元的密封分隔、超过七支墨胆的容量级别、145 mm、14 mm、55 g、EF/F/M/B 不锈钢尖和 filling kit。",
  author: "Diplomat",
});
const nexusCollections = source({
  key: "phase482-diplomat-nexus-collections",
  registryKey: "diplomat-official-phase482-collections",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "diplomat-official-phase482",
  title: "Diplomat collections — Nexus family",
  url: "https://www.diplomat-pen.com/en/collections/",
  summary:
    "官方集合把 Nexus、CLR、Traveller、Viper、Aero 和 Excellence 分列；支持高容量 Nexus 与邻近金属型号的身份边界。",
  author: "Diplomat",
});
const nexusHistory = source({
  key: "phase482-diplomat-history",
  registryKey: "diplomat-official-phase482-history",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "diplomat-official-phase482",
  title: "Our history — Diplomat",
  url: "https://www.diplomat-pen.com/en/our-company/our-history/",
  summary:
    "官方历史页记录 1922 年 Hennef 创牌、1958 年第一支学校墨胆钢笔以及后续生产与管理节点；不提供 Nexus 首发年份。",
  author: "Diplomat",
});
const nexusService = source({
  key: "phase482-diplomat-service",
  registryKey: "diplomat-official-phase482-service",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "diplomat-official-phase482",
  title: "DIPLOMAT Service Guide & Warranty",
  url: "https://www.diplomat-pen.com/wp-content/uploads/2025/07/DIPLOMAT-Service-Guide-Warranty.pdf",
  summary:
    "官方服务资料用于清水清洁、运输时的笔尖朝上和五年保修边界；不把 Nexus 专用机构改写成普通 converter。",
  author: "Diplomat",
});
const nexusReview = source({
  key: "phase482-sacrideo-nexus",
  registryKey: "sacrideo-phase482-nexus",
  registryName: "Sacrideo",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "sacrideo-phase482",
  title: "A Quick Review of the Diplomat Nexus",
  url: "https://www.sacrideo.us/a-quick-review-of-the-diplomat-nexus/",
  summary:
    "专业评测以样笔讨论大尺寸、重量、约 3 ml 级别个人测量和密封帽体验；样本口径不替代官方规格。",
  author: "Sacrideo",
});

const aeroOfficial = source({
  key: "phase482-diplomat-aero-official",
  registryKey: "diplomat-official-phase482-aero",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "diplomat-official-phase482-aero",
  title: "Fountain pen Aero Anodized — Diplomat",
  url: "https://www.diplomat-pen.com/en/product/aero-anodised-fountain-pen/",
  summary:
    "官方 Anodized 铝款商品页核对 Zeppelin 设计联想、converter、两支短国际墨胆、140/160/15 mm、42 g 和 EF/F/M/B 不锈钢尖。",
  author: "Diplomat",
});
const aeroCollections = source({
  key: "phase482-diplomat-aero-collections",
  registryKey: "diplomat-official-phase482-aero-collections",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "diplomat-official-phase482-aero",
  title: "Diplomat collections — Aero and adjacent families",
  url: "https://www.diplomat-pen.com/en/collections/",
  summary:
    "官方集合将 Aero 与 Elox、Excellence、Nexus 等分列，并展示 Anodized、Flame、Oxyd 等命名语境；不把颜色当基础型号。",
  author: "Diplomat",
});
const aeroGold = source({
  key: "phase482-diplomat-aero-14k",
  registryKey: "diplomat-official-phase482-aero-14k",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "diplomat-official-phase482-aero",
  title: "Aero Anodised 14 ct fountain pen — Diplomat",
  url: "https://www.diplomat-pen.com/en/product/aero-anodised-fountain-pen-14-ct/",
  summary:
    "官方 14 ct 商品页用于确认 Aero 同平台的金尖 SKU；不把 14K 尖或金属件自动回填给 Anodized 钢尖。",
  author: "Diplomat",
});
const aeroOxyd = source({
  key: "phase482-diplomat-aero-oxyd",
  registryKey: "diplomat-official-phase482-aero-oxyd",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "diplomat-official-phase482-aero",
  title: "Aero Oxyd 14 ct fountain pen — Diplomat",
  url: "https://www.diplomat-pen.com/en/product-2/aero-oxyd-14-ct-fountain-pen/",
  summary:
    "官方 Oxyd 14 ct 商品用于记录黄铜材质和 72 g 指定重量，作为 42 g 铝制 Anodized 的反例。",
  author: "Diplomat",
});
const aeroHistory = source({
  key: "phase482-diplomat-aero-history",
  registryKey: "diplomat-official-phase482-aero-history",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "diplomat-official-phase482-aero",
  title: "Our history — Diplomat",
  url: "https://www.diplomat-pen.com/en/our-company/our-history/",
  summary:
    "官方品牌历史提供 1922、1958、2001 和 2016 等背景节点；不为 Aero 补写未经档案确认的首发年份。",
  author: "Diplomat",
});
const aeroReview = source({
  key: "phase482-goulet-aero",
  registryKey: "goulet-phase482-aero",
  registryName: "Goulet Pens",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "goulet-phase482-aero",
  title: "Diplomat Aero fountain pens",
  url: "https://www.gouletpens.com/collections/diplomat-aero-fountain-pens",
  summary:
    "专业零售资料按钢尖、14K 尖和表面 SKU 分列 Aero 商品，适合交叉核对购买页面的型号边界；不替代官方数字。",
  author: "Goulet Pens",
});

const hamaCatalog = source({
  key: "phase482-platinum-hama-catalog",
  registryKey: "platinum-official-phase482-catalog",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "platinum-official-phase482",
  title: "Platinum Fine Writing catalog 2019–2020",
  url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf",
  summary:
    "官方目录把 PIZ-300000 #55 Hama no Matsu 列为 Hira Maki-e、ebonite、18K F/M/B、154 mm、18 mm、33.9 g。",
  author: "Platinum Pen Co., Ltd.",
  publishedAt: "2019-01-01",
});
const hamaPrice = source({
  key: "phase482-platinum-hama-price",
  registryKey: "platinum-official-phase482-price",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official",
  tier: "contemporary_archive",
  independenceGroup: "platinum-official-phase482",
  title: "Platinum 2023 price revision list",
  url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2022/12/52ea6d6214b3a3003e19c057c7f7fedf-1.pdf",
  summary:
    "官方价格表把 PIZ-300000 #55 的 55-2/3/4 F/M/B 代码与 #93 分列，并提供 2023 年未税价格快照。",
  author: "Platinum Pen Co., Ltd.",
  publishedAt: "2023-01-16",
});
const hamaIzumo = source({
  key: "phase482-platinum-izumo-detail",
  registryKey: "platinum-official-phase482-izumo",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "platinum-official-phase482",
  title: "Izumo brand detail — Platinum",
  url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70",
  summary:
    "Platinum 官方页面解释 Izumo 名称、岛根地域和品牌概念，用于说明系列背景而非补写 Hama no Matsu 的工匠信息。",
  author: "Platinum Pen Co., Ltd.",
});
const hamaMaintenance = source({
  key: "phase482-platinum-izumo-maintenance",
  registryKey: "platinum-official-phase482-maintenance",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "platinum-official-phase482",
  title: "Izumo 使用与维护手册",
  url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf",
  summary:
    "官方手册用于墨囊/转换器清洁、清水冲洗、阴干以及漆面不长时间浸泡和不使用强溶剂的边界。",
  author: "Platinum Pen Co., Ltd.",
});
const hamaUsa = source({
  key: "phase482-platinum-usa-izumo",
  registryKey: "platinum-pen-usa-phase482-hama",
  registryName: "Platinum Pen USA",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "platinum-pen-usa-phase482",
  title: "Izumo Collection — Platinum Pen USA",
  url: "https://platinumpenusa.com/luxury-writing/izumo-collection/",
  summary:
    "地区经销页面把 PIZ-300000 #55、#93 和 PIZ-500000 #55 相邻列出，补充 Hama no Matsu 题材、18K wide、154×18 mm、34.1 g 与桐木盒信息。",
  author: "Platinum Pen USA",
});

const nexus = refresh(basePack(PHASE482_IDS.nexus, "Nexus"), {
  key: "phase482-diplomat-nexus-depth-v1",
  markdownFile: ".planning/content-research/diplomat-nexus-phase482.md",
  storyTitle: "Diplomat Nexus：把高容量机构、密封帽和版本边界放在一起看",
  primary: nexusOfficial,
  extras: [nexusCollections, nexusHistory, nexusService, nexusReview],
  scope: {
    key: "phase482-diplomat-nexus-depth",
    scopeKey: "phase482-diplomat-nexus-depth",
    market: "Diplomat official Nexus current/archived SKU",
    productionState: "current",
    nibScope: "Demo Chrome EF/F/M/B stainless steel; separate 14K gold nib products",
    materialScope: "aluminium, brass or stainless steel by SKU; Chrome/Demo/Gold finish boundary",
    editionScope: "Nexus family; not CLR, Traveller, Viper or ordinary cartridge/converter models",
  },
  claims: [
    claim(nexusOfficial, "phase482-diplomat-nexus-depth", "phase482-nexus-identity", "model_identity", "Nexus 是 Diplomat 独立的高容量钢笔路线；Demo、Chrome、Gold 和 14K 尖是同一型号家族内的 SKU 变体。"),
    claim(nexusOfficial, "phase482-diplomat-nexus-depth", "phase482-nexus-filling", "filling_system", "官方商品页明确 piston system 与 pipette filling，并随笔提供 filling set；不可改写成普通国际墨胆或标准转换器型号。"),
    claim(nexusOfficial, "phase482-diplomat-nexus-depth", "phase482-nexus-seal", "cap_mechanism", "帽与尖单元之间的 locking/closure sealing 用于降低携带时的挥发与漏墨风险；不等于不受温差和气压影响的永久防漏。"),
    claim(nexusOfficial, "phase482-diplomat-nexus-depth", "phase482-nexus-capacity", "ink_capacity", "官方以相当于七支以上墨胆描述容量级别；专业样本约 3 ml 的测量保留为独立口径，不合成虚假的额定容量。"),
    claim(nexusOfficial, "phase482-diplomat-nexus-depth", "phase482-nexus-demo-spec", "specification", "官方 Demo Chrome 样本为闭帽 145 mm、直径 14 mm、55 g，随附蓝墨水、两支 pipette、盒和保修卡。"),
    claim(nexusOfficial, "phase482-diplomat-nexus-depth", "phase482-nexus-nibs", "nib_options", "Demo Chrome 商品提供 EF/F/M/B 不锈钢尖；Gold 14 ct gold nib 是另一个 SKU，不能默认安装到钢尖款。"),
    claim(nexusCollections, "phase482-diplomat-nexus-depth", "phase482-nexus-boundary", "identity_boundaries", "Nexus 的高容量机构与 CLR 可换内环、Traveller 纤细 C/C、Viper 前段和其他 Diplomat 金属型号分开；附件不另建成型号。"),
    claim(nexusHistory, "phase482-diplomat-nexus-depth", "phase482-nexus-history", "brand_history_context", "Diplomat 官方历史记录 1922 年 Hennef 创牌和 1958 年学校墨胆钢笔；该时间线是品牌背景，不证明 Nexus 首发年份。"),
    claim(nexusService, "phase482-diplomat-nexus-depth", "phase482-nexus-care", "maintenance", "清洁时用清水并按服务指南运输；尾部阻力、密封失效或 pipette 损坏时停止强拧和自行拆修，交由授权服务。"),
    claim(nexusReview, "phase482-diplomat-nexus-depth", "phase482-nexus-review", "professional_cross_check", "Sacrideo 的约 3 ml、重量和书写观察限定为评测样本，用于选购语境，不替代官方尺寸或容量级别。"),
  ],
  values: {
    series_name: "Diplomat Nexus",
    release_year: "当前官方集合与商品页可见；本包不虚构 Nexus 首发年份",
    origin_country: "德国 Diplomat 产品线；制造与地区 SKU 以具体商品资料为准",
    nib: "Demo Chrome EF/F/M/B 不锈钢尖；另有 14K gold nib 变体",
    fill_system: "piston/pipette 高容量机构；配套 filling kit；帽与尖单元之间有密封分隔",
    material: "aluminium、brass、stainless steel 按 SKU；Chrome、Demo、Gold 为外观/饰件变体",
    dimensions: "闭帽 145 mm、直径 14 mm（官方 Demo Chrome 样本）",
    weight: "55 g（官方 Demo Chrome 样本）",
    price_range: "官方商品页访问时约 €260；税费、地区、库存和金尖配置另核",
    status: "官方当前集合与商品页可见；颜色、饰件和尖材按精确 SKU",
  },
  variants: [
    { key: "phase482-nexus-demo-chrome", name: "Demo Chrome EF/F/M/B steel", notes: "145/14 mm、55 g、piston/pipette 与 filling kit 的官方参考商品。", sourceKey: nexusOfficial.key, variantKind: "market_sku", market: "EU/国际经销" },
    { key: "phase482-nexus-gold-14k", name: "Nexus Gold 14 ct gold nib", notes: "官方相关商品列出的金尖路线；不把金尖、饰件和价格外推给 Demo Chrome 钢尖。", sourceKey: nexusOfficial.key, variantKind: "nib", market: "EU/国际经销" },
  ],
  eventTitle: "Nexus 供墨与版本边界复核",
  eventDescription: "以官方 Demo Chrome 商品、集合、服务指南和独立样本复核 piston/pipette、高容量、密封帽及钢尖/14K、Chrome/Demo/Gold 的范围。",
});

const aero = refresh(basePack(PHASE482_IDS.aero, "Aero"), {
  key: "phase482-diplomat-aero-depth-v1",
  markdownFile: ".planning/content-research/diplomat-aero-phase482.md",
  storyTitle: "Diplomat Aero：同一纵槽外形下，材质和笔尖仍然不是一回事",
  primary: aeroOfficial,
  extras: [aeroCollections, aeroGold, aeroOxyd, aeroHistory, aeroReview],
  scope: {
    key: "phase482-diplomat-aero-depth",
    scopeKey: "phase482-diplomat-aero-depth",
    market: "Diplomat official Aero current/archived SKU",
    productionState: "current",
    nibScope: "Anodized steel EF/F/M/B; separate 14K gold nib products",
    materialScope: "aluminium, brass and stainless steel surfaces by exact SKU",
    editionScope: "Aero fountain pen family; not Elox, Excellence, or same-color rollerball/ballpoint",
  },
  claims: [
    claim(aeroOfficial, "phase482-diplomat-aero-depth", "phase482-aero-design", "design_language", "官方把 Aero 的流线凹槽外形与 Zeppelin 和早期 20 世纪设计联想相连；这不是航空复制品或制造方式声明。"),
    claim(aeroOfficial, "phase482-diplomat-aero-depth", "phase482-aero-anodized-spec", "specification", "Anodized 铝制钢尖商品为闭帽 140 mm、插帽 160 mm、直径 15 mm、42 g，含 converter、两支短国际墨胆和 EF/F/M/B 尖幅。"),
    claim(aeroGold, "phase482-diplomat-aero-depth", "phase482-aero-14k", "nib_options", "Aero 同平台存在 14 ct gold nib 商品；金尖是精确 SKU 配置，不能用商品主图替代钢尖资料。"),
    claim(aeroOxyd, "phase482-diplomat-aero-depth", "phase482-aero-oxyd", "material_finish", "Aero Oxyd 14 ct 是黄铜路线，官方 72 g；它直接说明 42 g 只适用于 Anodized 铝款。"),
    claim(aeroCollections, "phase482-diplomat-aero-depth", "phase482-aero-variants", "identity_boundaries", "Anodized、Flame、Lacquered、Oxyd、Rhomb、Stripe 是材质/表面或销售 SKU；Elox、Excellence 和同色其他书写工具保持独立身份。"),
    claim(aeroOfficial, "phase482-diplomat-aero-depth", "phase482-aero-cap", "cap_mechanism", "Aero 使用 Soft Sliding Click 按压帽；Click 说明闭合方式，不等于磁吸帽或终身不磨损。"),
    claim(aeroOfficial, "phase482-diplomat-aero-depth", "phase482-aero-care", "maintenance", "converter/短国际墨胆路线使用清水换墨；阳极、漆面和氧化表面不应使用酒精、热水、研磨膏或金属抛光布。"),
    claim(aeroHistory, "phase482-diplomat-aero-depth", "phase482-aero-history", "brand_history_context", "Diplomat 官方历史记录 1922 年创牌、1958 年墨胆学校钢笔、2001 年 Cunewalde 基地和 2016 年管理变更；不补写 Aero 首发年份。"),
    claim(aeroReview, "phase482-diplomat-aero-depth", "phase482-aero-purchase", "professional_cross_check", "专业零售页面按尖材、材质和表面区分 Aero 商品；购买时应确认 exact SKU，而非从颜色或外形推断重量。"),
  ],
  values: {
    series_name: "Diplomat Aero",
    release_year: "当前官方集合与商品页可见；本包不虚构 Aero 首发年份",
    origin_country: "德国 Diplomat 产品线；具体制造与地区 SKU 以商品页核对",
    nib: "Anodized 商品 EF/F/M/B 不锈钢尖；同平台另有 14K gold nib SKU",
    fill_system: "converter；Anodized 钢尖商品随两支短国际墨胆",
    material: "依 SKU 使用 aluminium、brass 或 stainless steel，并有阳极/漆面/氧化表面",
    dimensions: "Anodized 铝款闭帽 140 mm、插帽 160 mm、直径 15 mm",
    weight: "Anodized 铝款 42 g；Aero Oxyd 14 ct 黄铜 SKU 72 g",
    price_range: "官方 Anodized 页面访问时约 €199–207；地区、税费、尖材和库存另核",
    status: "官方当前集合与商品页可见；颜色、材质和尖材按精确 SKU",
  },
  variants: [
    { key: "phase482-aero-anodized", name: "Aero Anodized aluminium steel", notes: "140/160/15 mm、42 g、converter 与两支短国际墨胆的官方参考 SKU。", sourceKey: aeroOfficial.key, variantKind: "market_sku", market: "EU/国际经销" },
    { key: "phase482-aero-oxyd", name: "Aero Oxyd brass 14 ct", notes: "黄铜 72 g 的指定版本；不沿用铝制 Anodized 的轻量规格。", sourceKey: aeroOxyd.key, variantKind: "material", market: "EU/国际经销" },
  ],
  eventTitle: "Aero 材质、笔尖与帽机制复核",
  eventDescription: "以官方 Anodized、14 ct、Oxyd 商品和集合页复核 Aero 的 Zeppelin 设计语境、42/72 g 版本差异、上墨附件和钢尖/14K 边界。",
});

const hamaNoMatsu = refresh(basePack(PHASE482_IDS.hamaNoMatsu, "Hama no Matsu"), {
  key: "phase482-platinum-hama-no-matsu-depth-v1",
  markdownFile: ".planning/content-research/platinum-izumo-piz-300000-hama-no-matsu-phase482.md",
  storyTitle: "Platinum Izumo PIZ-300000 #55 滨之松：先认产品号，再谈漆艺",
  primary: hamaCatalog,
  extras: [hamaPrice, hamaIzumo, hamaMaintenance, hamaUsa],
  scope: {
    key: "phase482-platinum-hama-no-matsu-depth",
    scopeKey: "phase482-platinum-hama-no-matsu-depth",
    market: "Platinum Izumo Kaga Maki-e PIZ-300000 #55",
    productionState: "current",
    nibScope: "18K gold wide F/M/B; 55-2/3/4 product-code variants",
    materialScope: "ebonite body; Hon-Urushi Hira Maki-e; Platinum cartridge/converter",
    editionScope: "Independent from PIZ-300000 #93 Urokomon, PIZ-500000 #55 Hama no Matsu and PIZ-300000A #82 Aurora",
  },
  claims: [
    claim(hamaCatalog, "phase482-platinum-hama-no-matsu-depth", "phase482-hama-identity", "model_identity", "本页对象的完整身份是 Platinum Izumo PIZ-300000 #55 Hama no Matsu（浜の松／滨之松），不是只凭‘Hama no Matsu’标题判断的泛称。"),
    claim(hamaCatalog, "phase482-platinum-hama-no-matsu-depth", "phase482-hama-craft", "craft_process", "官方目录把 PIZ-300000 #55 列为 Hira Maki-e 平蒔绘；正文不为具体粉末配方、制作工时或工匠署名补写未证实细节。"),
    claim(hamaUsa, "phase482-platinum-hama-no-matsu-depth", "phase482-hama-subject", "design_subject", "Platinum Pen USA 将 #55 题材说明为松滨与海浪，并与 #93、PIZ-500000 #55 相邻列出；题材不改变产品号边界。"),
    claim(hamaCatalog, "phase482-platinum-hama-no-matsu-depth", "phase482-hama-spec", "specification", "官方目录规格为 ebonite、18K gold wide F/M/B、154 mm、最大径 18 mm、33.9 g。"),
    claim(hamaUsa, "phase482-platinum-hama-no-matsu-depth", "phase482-hama-weight", "measurement_conflict", "Platinum Pen USA 页面记录 34.1 g；与目录 33.9 g 作为不同来源口径保留，不能擅自合并成绝对批次重量。"),
    claim(hamaPrice, "phase482-platinum-hama-no-matsu-depth", "phase482-hama-price", "price_snapshot", "2023 官方价格表把 PIZ-300000 #55 F/M/B 的 55-2/3/4 代码列为未税 380,000 日元，并与 #93 分列；这是历史快照。"),
    claim(hamaPrice, "phase482-platinum-hama-no-matsu-depth", "phase482-hama-boundaries", "identity_boundaries", "PIZ-300000 #93 Urokomon、同名 PIZ-500000 #55 Taka Maki-e 和 PIZ-300000A #82 Aurora 具有不同图案编号、产品号或工艺，不共享图片和规格。"),
    claim(hamaIzumo, "phase482-platinum-hama-no-matsu-depth", "phase482-hama-izumo", "brand_context", "Platinum 官方以 Izumo 的地域、和纸与书写传统以及向天空升起的云为品牌概念；它不证明每支笔的制造地或未署名工匠。"),
    claim(hamaMaintenance, "phase482-platinum-hama-no-matsu-depth", "phase482-hama-care", "maintenance", "Izumo 手册用于墨囊/转换器清水清洁、阴干和漆面保护；不整支长时间浸泡、不使用强溶剂和研磨剂，也不自行拆修。"),
  ],
  values: {
    series_name: "Platinum Izumo PIZ-300000 #55 Hama no Matsu",
    release_year: "2019–2020 官方目录快照；本包不断言首发年份",
    origin_country: "日本 Platinum Izumo Kaga Maki-e 产品线",
    nib: "18K gold wide；F、M、B",
    fill_system: "Platinum 墨囊／转换器；附件按地区和实物核对",
    material: "ebonite 笔身；Hon-Urushi Hira Maki-e 平蒔绘表面",
    dimensions: "154 mm（书写时约 134 mm）× 最大径 18 mm",
    weight: "官方目录 33.9 g；Platinum Pen USA 当前页面 34.1 g，保留来源口径差异",
    price_range: "Platinum 2023 价格表未税新价 380,000 日元；当前价格与二手价格另核",
    status: "PIZ-300000 #55 Hama no Matsu；独立于 #93 Urokomon、PIZ-500000 #55 和 #82 Aurora",
  },
  variants: [
    { key: "phase482-hama-55", name: "PIZ-300000 #55 Hama no Matsu", notes: "Hira Maki-e 平蒔绘、18K F/M/B；本页的基础产品身份。", sourceKey: hamaCatalog.key, variantKind: "market_sku", productCode: "PIZ-300000 #55", market: "日本/国际经销" },
    { key: "phase482-hama-nibs", name: "55-2 / 55-3 / 55-4 F/M/B", notes: "官方价格表的尖幅代码；仍属于同一 PIZ-300000 #55，不拆成三个型号。", sourceKey: hamaPrice.key, variantKind: "nib", productCode: "PIZ-300000 55-2/3/4", market: "日本/国际经销" },
  ],
  eventTitle: "PIZ-300000 #55 工艺与邻近型号复核",
  eventDescription: "以官方目录、价格表、Izumo 品牌页、维护手册和 Platinum Pen USA 并列资料复核 Hira Maki-e、重量口径、18K 尖幅及 #93/PIZ-500000 #55 边界。",
});

export const phase482DiplomatNexusAeroHamaDepthPacks: CuratedEntityPack[] = [
  nexus,
  aero,
  hamaNoMatsu,
];
