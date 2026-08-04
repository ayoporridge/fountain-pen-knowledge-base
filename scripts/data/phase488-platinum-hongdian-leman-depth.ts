import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE311_PIZ_ID,
  phase311PlatinumIzumoPiz150000PwPacks,
} from "./phase311-platinum-izumo-piz-150000pw";
import {
  PHASE205_VOYAGER_ID,
  phase205HongdianVoyagerPacks,
} from "./phase205-hongdian-voyager";
import { PHASE139_IDS, phase139AllPacks } from "./phase139-german-swiss-current-batch";

export const PHASE488_IDS = {
  platinumIzumoPiz150000pw: PHASE311_PIZ_ID,
  hongdianVoyager: PHASE205_VOYAGER_ID,
  caranDacheLeman: PHASE139_IDS.leman,
} as const;

const RETRIEVED = "2026-08-04";

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
  return {
    ...input,
    homepageUrl: input.url.startsWith("http") ? new URL(input.url).origin : "/",
    itemType: "web_page",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=Phase 488 exact-model depth refresh`,
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: CuratedClaim["factClass"] = "core",
  confidence = factClass === "editorial" ? 0.95 : 0.98,
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence,
    sourceKey: sourceItem.key,
    locator: sourceItem.summary,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator: sourceItem.summary }],
  };
}

function findPen(packs: CuratedEntityPack[], entityId: string, label: string): CuratedEntityPack {
  const pack = packs.find((candidate) => candidate.entityId === entityId && candidate.expectedType === "pen");
  if (!pack) throw new Error(`Phase 488 ${label} base pack is missing.`);
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
  ].filter((alias, index, all) => all.findIndex((candidate) => candidate.alias === alias.alias) === index);
  const sources = [...(pack.sources ?? []), input.primary, ...input.extras].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  const scopes = [...(pack.scopes ?? []), input.scope].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.scopeKey === item.scopeKey) === index,
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

const platinumOfficialEn = source({
  key: "phase488-platinum-piz-official-en",
  registryKey: "platinum-official-phase488-piz",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "platinum-official-phase488-piz",
  title: "IZUMO new series, Precious Wood — PIZ-150000PW",
  url: "https://www.platinum-pen.co.jp/en/news/detail/?pid=13050",
  summary: "官方英文发布稿确认 PIZ-150000PW、花梨瘤 Amboyna burl 木轴与笔盖、树脂握位、无笔夹、18K F/M/B、166 mm、18.4 mm、平均 26.7 g 及附件。",
  author: "Platinum Pen Co., Ltd.",
  publishedAt: "2025-08-19",
});
const platinumOfficialJp = source({
  key: "phase488-platinum-piz-official-jp",
  registryKey: "platinum-official-phase488-piz",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "platinum-official-phase488-piz",
  title: "出云品牌新系列銘木：花梨瘤 PIZ-150000PW",
  url: "https://www.platinum-pen.co.jp/news/13050/",
  summary: "官方日文发布稿列 2025-08-25 发售、世界限定 50 支、含税 ¥165,000，并说明花梨瘤自然纹理与木轴使用边界。",
  author: "Platinum Pen Co., Ltd.",
  publishedAt: "2025-08-19",
});
const platinumFamily = source({
  key: "phase488-platinum-piz-family",
  registryKey: "platinum-official-phase488-izumo-family",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "platinum-official-phase488-izumo-family",
  title: "Platinum IZUMO brand lineup",
  url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70",
  summary: "Izumo 品牌目录把 Precious Wood、Yakumonuri、Raden 和其它产品号分开；用于建立 PIZ-150000PW 的系列边界。",
  author: "Platinum Pen Co., Ltd.",
});
const platinumCare = source({
  key: "phase488-platinum-piz-care",
  registryKey: "platinum-official-phase488-izumo-care",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "platinum-official-phase488-izumo-care",
  title: "Common practices on how to ensure long-term use of Izumo",
  url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf",
  summary: "Izumo 手册支持取下墨囊／转换器、以清水清洗笔尖和正常供墨维护；不被扩写为木轴自行上漆或长期浸泡保证。",
  author: "Platinum Pen Co., Ltd.",
});
const platinumRetailer = source({
  key: "phase488-platinum-piz-goldspot",
  registryKey: "goldspot-phase488-platinum-piz",
  registryName: "Goldspot Pens",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "goldspot-phase488-platinum-piz",
  title: "Platinum Izumo Precious Wood Fountain Pen in Karin-Kobu",
  url: "https://goldspot.com/products/platinum-izumo-precious-wood-fountain-pen-in-karin-kobu",
  summary: "专业经销页以 PIZ-150000PW 和 Karin-Kobu/Amboyna burl 列出市场 SKU；用于交叉核对名称，不替代官方限量和规格。",
  author: "Goldspot Pens",
});

const hongdianOfficial = source({
  key: "phase488-hongdian-voyager-official",
  registryKey: "hongdian-official-phase488-voyager",
  registryName: "HongDian Pens",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "hongdian-official-phase488-voyager",
  title: "HongDian Fountain Pens Website",
  url: "https://hongdianpens.com/",
  summary: "HongDian 当前官网用于确认品牌、当代系列与通用供墨／清洁语境；当前首页未给出 1843 的完整官方规格，不将新款字段回填旧型号。",
  author: "HongDian Pens",
});
const hongdianEtsy = source({
  key: "phase488-hongdian-1843-etsy",
  registryKey: "etsy-phase488-hongdian-1843",
  registryName: "Etsy seller listing",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "etsy-phase488-hongdian-1843",
  title: "HongDian 1843 Stainless Fountain Pen Wave Pattern",
  url: "https://www.etsy.com/hk-en/listing/853576436/personalized-hongdian-1843-stainless",
  summary: "Etsy 商品标题直接列 1843、波纹金属、EF/F、3.4 mm 墨囊／转换器及约 138 mm、11 mm、35 g 的商品样本字段。",
  author: "Etsy seller listing",
});
const hongdianTsamsa = source({
  key: "phase488-hongdian-1843-tsamsa",
  registryKey: "tsamsa-phase488-hongdian-1843",
  registryName: "TSAMSA",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "tsamsa-phase488-hongdian-1843",
  title: "HongDian 1843 Fountain Pen",
  url: "https://tsamsa.com.bd/products/hongdian-1843-fountain-pen",
  summary: "另一商品页确认 1843 型号和 EF/F 选项；其材质字段与其它列表不一致，保留为冲突边界。",
  author: "TSAMSA",
});
const hongdianMysku = source({
  key: "phase488-hongdian-1843-mysku",
  registryKey: "mysku-phase488-hongdian-1843",
  registryName: "MySKU reviewer",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "mysku-phase488-hongdian-1843",
  title: "HongDian 1843 与 1861 Pro 评测",
  url: "https://mysku.club/blog/aliexpress/97103.html",
  summary: "独立评测把 1843 与 1861 Pro 分开，记录波纹金属外观、钢尖和 EF 样本的供墨观察；均为样本体验。",
  author: "MySKU reviewer",
  publishedAt: "2023-01-01",
});
const hongdianZhihu = source({
  key: "phase488-hongdian-1843-zhihu",
  registryKey: "zhihu-phase488-hongdian-family",
  registryName: "知乎钢笔使用者",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "zhihu-phase488-hongdian-family",
  title: "弘典相邻型号讨论",
  url: "https://www.zhihu.com/tardis/zm/ans/2057000903",
  summary: "长期使用者将 1866、T1 等相邻型号分开描述，为 1843 与其它 HongDian 型号的身份边界提供背景。",
  author: "知乎钢笔使用者",
});

const caranOfficialStandard = source({
  key: "phase488-caran-leman-standard-official",
  registryKey: "caran-official-phase488-leman-standard",
  registryName: "Caran d’Ache",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "caran-official-phase488-leman-standard",
  title: "Fountain Pen LÉMAN Bleu Marin",
  url: "https://www.carandache.com/gb/en/fountain-pen-fountain-pen-leman-bleu-marin-p-11384.htm",
  summary: "官方标准 Bleu Marin 页列 141 mm、14.8 mm、52 g、黄铜 guillochage 透明漆、18K 镀铑尖、piston pump 与两支墨囊。",
  author: "Caran d’Ache",
});
const caranOfficialSlim = source({
  key: "phase488-caran-leman-slim-official",
  registryKey: "caran-official-phase488-leman-slim",
  registryName: "Caran d’Ache",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "caran-official-phase488-leman-slim",
  title: "Grand Bleu LEMAN Slim Fountain Pen",
  url: "https://www.carandache.com/gb/en/fountain-pen-grand-bleu-leman-slim-fountain-pen-p-11462.htm",
  summary: "官方 Slim 页列 141 mm × 10.6 mm、38 g、波纹 guilloche、半透明蓝漆、18K 镀铑 EF/F/M/B 和相同的 converter／墨囊路线。",
  author: "Caran d’Ache",
});
const caranHistory = source({
  key: "phase488-caran-leman-history",
  registryKey: "caran-official-phase488-history",
  registryName: "Caran d’Ache",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "caran-official-phase488-history",
  title: "Caran d’Ache official history",
  url: "https://www.carandache.com/gb/en/notre-histoire",
  summary: "官方历史页用于 Caran d’Ache 的日内瓦企业背景和品牌时间线，不把 Léman 首发年从家族叙述中猜出。",
  author: "Caran d’Ache",
});
const caranReview = source({
  key: "phase488-caran-leman-gentleman-stationer",
  registryKey: "gentleman-stationer-phase488-leman",
  registryName: "The Gentleman Stationer",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "gentleman-stationer-phase488-leman",
  title: "Introducing the Caran d’Ache Léman Fountain Pen in Klein Blue Lacquer",
  url: "https://www.gentlemanstationer.com/blog/2021/2/6/introducing-the-caran-dache-lman-fountain-pen-in-klein-blue-lacquer",
  summary: "独立样笔文章记录黄铜漆面、标准比例、18K 镀铑尖、converter／短国际墨囊和个人书写感；不替代当前 Bleu Marin 或 Slim 的官方规格。",
  author: "The Gentleman Stationer",
  publishedAt: "2021-02-06",
});

const platinumBase = findPen(phase311PlatinumIzumoPiz150000PwPacks, PHASE488_IDS.platinumIzumoPiz150000pw, "Platinum Izumo PIZ-150000PW");
const hongdianBase = findPen(phase205HongdianVoyagerPacks, PHASE488_IDS.hongdianVoyager, "HongDian 1843 Voyager");
const caranBase = findPen(phase139AllPacks, PHASE488_IDS.caranDacheLeman, "Caran d’Ache Léman");

const platinumScope: CuratedScope = {
  key: "phase488-platinum-piz-150000pw-depth-scope",
  scopeKey: "phase488-platinum-piz-150000pw-depth-scope",
  productionState: "current",
  editionScope: "PIZ-150000PW Karin-Kobu；Precious Wood 首作、全球限定 50 支、无笔夹木轴、18K F/M/B、自然纹理与木轴护理边界，独立于其它 Izumo 材料路线。",
};
const hongdianScope: CuratedScope = {
  key: "phase488-hongdian-1843-voyager-depth-scope",
  scopeKey: "phase488-hongdian-1843-voyager-depth-scope",
  productionState: "historical",
  editionScope: "HongDian 1843 Voyager／远航者；波纹金属杆帽、旋帽、EF/F、约 3.4 mm 接口和零售样本尺寸，独立于 1861 Pro、1866 与 T1。",
};
const caranScope: CuratedScope = {
  key: "phase488-caran-leman-depth-scope",
  scopeKey: "phase488-caran-leman-depth-scope",
  productionState: "current",
  editionScope: "Caran d’Ache Léman 标准 Bleu Marin 与 Slim Grand Bleu 的尺寸、重量、guillochage、18K 尖与 converter／墨囊边界；Klein Blue 仅作独立样本。",
};

export const phase488PlatinumHongdianLemanDepthPacks: CuratedEntityPack[] = [
  refresh(platinumBase, {
    key: "phase488-platinum-piz-150000pw-depth-v1",
    markdownFile: ".planning/content-research/platinum-izumo-piz-150000pw-phase488.md",
    storyTitle: "Platinum Izumo PIZ-150000PW：花梨瘤木轴的 Precious Wood 首作",
    primary: platinumOfficialEn,
    extras: [platinumOfficialJp, platinumFamily, platinumCare, platinumRetailer],
    scope: platinumScope,
    claims: [
      claim(platinumOfficialEn, platinumScope.scopeKey, "phase488-platinum-piz-identity", "model_identity", "PIZ-150000PW 是 Platinum Izumo Precious Wood 第一作花梨瘤型号，不是 PIZ-80000N 或其它 Izumo 材料款的颜色别名。"),
      claim(platinumOfficialJp, platinumScope.scopeKey, "phase488-platinum-piz-release", "release_and_limit", "官方日文发布稿列 2025-08-25 发售、全球限定 50 支和含税 ¥165,000；这是发布时点快照。"),
      claim(platinumOfficialEn, platinumScope.scopeKey, "phase488-platinum-piz-material", "material_and_form", "胴轴与笔盖使用花梨瘤 Amboyna burl 油仕上木材，握位为树脂并刻意取消笔夹；官方接受木纹、节和使用痕迹的个体差异。"),
      claim(platinumOfficialEn, platinumScope.scopeKey, "phase488-platinum-piz-spec", "specification", "官方规格为大型 18K F/M/B、166 mm、最大径 18.4 mm、平均 26.7 g，附件含 Converter-800A、20 ml 墨水、墨囊、桐箱和布。"),
      claim(platinumFamily, platinumScope.scopeKey, "phase488-platinum-piz-family", "identity_boundaries", "PIZ-150000PW 与 Yakumonuri、Raden 和其它 Izumo 产品号保持独立，不能共享材料、尺寸或主图。"),
      claim(platinumCare, platinumScope.scopeKey, "phase488-platinum-piz-care", "maintenance_guidance", "正常换墨使用 Platinum 墨囊／Converter-800A 和常温清水；手册不支持木轴自行上漆、打磨、浸泡或溶剂处理。", "editorial"),
      claim(platinumRetailer, platinumScope.scopeKey, "phase488-platinum-piz-market", "market_sku_crosscheck", "Goldspot 以 PIZ-150000PW 与 Karin-Kobu/Amboyna burl 列出市场 SKU，用于名称交叉核对，不替代官方限量和规格。"),
    ],
    values: {
      series_name: "Platinum Izumo Precious Wood PIZ-150000PW 花梨瘤",
      release_year: "2025-08-25；官方日文发布时点",
      origin_country: "日本品牌；官方资料未把木轴加工厂另行拆出",
      nib: "大型 18K 金尖；F、M、B",
      fill_system: "Platinum 墨囊／Converter-800A 两用式",
      material: "花梨瘤 Amboyna burl 油仕上木轴与笔盖；树脂握位；无笔夹",
      dimensions: "全长 166 mm × 最大径 18.4 mm",
      weight: "平均 26.7 g；天然木材密度造成个体差异",
      price_range: "官方发布时含税 ¥165,000；全球限定 50 支",
      status: "Precious Wood 首作 #1 Karin-Kobu；附件、价格与库存按日期和 SKU 核对",
    },
    variants: [
      { key: "phase488-platinum-piz-karin-kobu", name: "#1 Karin-Kobu 花梨瘤（Phase 488 复核）", releaseYear: "2025-08-25", notes: "Precious Wood 首作；天然纹理不拆成多个型号。", sourceKey: platinumOfficialJp.key, variantKind: "material", productCode: "PIZ-150000PW", market: "日本；全球限定" },
      { key: "phase488-platinum-piz-nib", name: "大型 18K F／M／B（Phase 488 复核）", notes: "同一 PIZ-150000PW 下的尖幅选项，不另建实体。", sourceKey: platinumOfficialEn.key, variantKind: "nib", productCode: "PIZ-150000PW", market: "日本" },
    ],
    eventTitle: "Phase 488：PIZ-150000PW 花梨瘤木轴与护理边界深化",
    eventDescription: "补足 Precious Wood 首作身份、花梨瘤个体差异、无笔夹结构、官方尺寸附件、相邻 Izumo 边界与木轴清洁限制。",
  }),
  refresh(hongdianBase, {
    key: "phase488-hongdian-1843-voyager-depth-v1",
    markdownFile: ".planning/content-research/hongdian-voyager-phase488.md",
    storyTitle: "弘典 HongDian 1843 Voyager：波纹金属杆帽的型号边界",
    primary: hongdianEtsy,
    extras: [hongdianOfficial, hongdianTsamsa, hongdianMysku, hongdianZhihu],
    scope: hongdianScope,
    claims: [
      claim(hongdianEtsy, hongdianScope.scopeKey, "phase488-hongdian-1843-identity", "model_identity", "HongDian 1843 Voyager（远航者）是独立数字型号；Voyager／远航者保留为市场别名，不与 1861 Pro、1866 或 T1 合并。"),
      claim(hongdianEtsy, hongdianScope.scopeKey, "phase488-hongdian-1843-material", "material_boundary", "公开列表稳定指向波纹金属杆帽，但 stainless、brass 与泛称 metal 的字段存在差异；牌号和表面处理按实物核对。"),
      claim(hongdianEtsy, hongdianScope.scopeKey, "phase488-hongdian-1843-nib", "nib_boundary", "公开商品页常列 EF/F 钢尖；毫米数和 MySKU 的供墨观察属于卖家或单支样本，不外推全批次线宽。"),
      claim(hongdianEtsy, hongdianScope.scopeKey, "phase488-hongdian-1843-filling", "filling_system", "1843 走约 3.4 mm 墨囊／转换器路线；盒内转换器和配件按具体市场套装核对。"),
      claim(hongdianMysku, hongdianScope.scopeKey, "phase488-hongdian-1843-family", "series_boundary", "1843 与 1861 Pro、1866 苏木和 T1 保持独立；相邻型号可以互链比较，不能共享规格和图片。"),
      claim(hongdianOfficial, hongdianScope.scopeKey, "phase488-hongdian-1843-official-boundary", "source_boundary", "HongDian 当前官网承担品牌和当代系列语境，未给出 1843 的完整官方规格；不以新款页面回填旧型号。"),
      claim(hongdianTsamsa, hongdianScope.scopeKey, "phase488-hongdian-1843-selection", "selection_guidance", "选购核对 1843 刻字、波纹杆身、EF/F、接口和盒内转换器；只有泛称 HongDian 金属笔的页面身份未证实。", "editorial"),
    ],
    values: {
      series_name: "HongDian 1843 Voyager／远航者",
      release_year: "至少在公开评测与零售页面中出现；官方首发年未核实",
      origin_country: "中国 HongDian 品牌语境；具体批次不从卖家字段推断",
      nib: "钢尖；EF/F 常见市场选项，实际线宽按单支",
      fill_system: "约 3.4 mm 墨囊／转换器路线；套装配件按卖家",
      material: "波纹金属杆帽；stainless steel、brass 与泛称 metal 标注存在差异",
      dimensions: "某零售样本约 138 mm 合盖、约 11 mm 直径；不外推全批次",
      weight: "某零售样本约 35 g；不外推全批次",
      status: "历史／地区流通日用型号；颜色、尖幅和配件随渠道变化",
    },
    variants: [
      { key: "phase488-hongdian-1843-ef", name: "1843 EF 尖样本（Phase 488 复核）", notes: "公开商品页的细尖选项；线宽和供墨按单支试写。", sourceKey: hongdianEtsy.key, variantKind: "nib" },
      { key: "phase488-hongdian-1843-f", name: "1843 F 尖样本（Phase 488 复核）", notes: "零售页列出的常规尖幅；不把卖家毫米数字写成统一厂规。", sourceKey: hongdianTsamsa.key, variantKind: "nib" },
      { key: "phase488-hongdian-1843-alias", name: "Voyager／远航者市场别名（Phase 488 复核）", notes: "用于检索与品牌导航，不另建实体。", sourceKey: hongdianMysku.key, variantKind: "market_sku" },
    ],
    eventTitle: "Phase 488：1843 Voyager 波纹金属与证据边界深化",
    eventDescription: "补足 1843／Voyager 身份、材料字段冲突、EF/F 样本、约 3.4 mm 接口、相邻 HongDian 型号和当前官网覆盖边界。",
  }),
  refresh(caranBase, {
    key: "phase488-caran-leman-depth-v1",
    markdownFile: ".planning/content-research/caran-dache-leman-phase488.md",
    storyTitle: "Caran d’Ache Léman：标准 Bleu Marin 与 Slim 的两套比例",
    primary: caranOfficialStandard,
    extras: [caranOfficialSlim, caranHistory, caranReview],
    scope: caranScope,
    claims: [
      claim(caranOfficialStandard, caranScope.scopeKey, "phase488-caran-leman-standard", "model_identity", "标准 LÉMAN Bleu Marin 是 Caran d’Ache Léman 家族的独立配置，以 141 mm、14.8 mm、52 g 和黄铜 guillochage 漆面为当前规格锚点。"),
      claim(caranOfficialSlim, caranScope.scopeKey, "phase488-caran-leman-slim", "version_boundary", "Grand Bleu Léman Slim 同长 141 mm，却为 10.6 mm、38 g，并有独立 4791 货号；不能与标准款共用尺寸、重量或图片。"),
      claim(caranOfficialStandard, caranScope.scopeKey, "phase488-caran-leman-nib", "nib_boundary", "官方商品页列手工抛光 18K 镀铑金尖；标准英国页规格段列 F/M/B/BB，选择器和地区库存可能出现 EF。"),
      claim(caranOfficialStandard, caranScope.scopeKey, "phase488-caran-leman-filling", "filling_system", "标准款使用 piston pump 与两支蓝色墨囊，兼容 Chromatics refill；这里的 pump 是转换器，不是笔身内置活塞。"),
      claim(caranOfficialSlim, caranScope.scopeKey, "phase488-caran-leman-slim-material", "material_boundary", "Slim 采用波纹 guilloche、半透明蓝漆、银／铑镀层夹子和按钮，表面与标准 Bleu Marin 的尺寸和货号分开。"),
      claim(caranReview, caranScope.scopeKey, "phase488-caran-leman-sample", "sample_experience_boundary", "Klein Blue 独立样笔记录黄铜漆面、18K 尖、converter／短国际墨囊和个人平衡感；不替当前官方颜色和库存。"),
      claim(caranHistory, caranScope.scopeKey, "phase488-caran-leman-history", "history_boundary", "官方历史用于 Caran d’Ache 的品牌背景，不从系列宣传语猜测 Léman 的精确首发年份。"),
    ],
    values: {
      series_name: "Caran d’Ache LÉMAN fountain pen",
      release_year: "当前官方商品页可核实；系列首发年未断言",
      origin_country: "瑞士；官方商品页写 Designed and made in Switzerland",
      nib: "手工抛光 18K 镀铑金尖；标准英国页 F/M/B/BB，Slim 页 EF/F/M/B",
      fill_system: "活塞式转换器与短墨囊；兼容 Caran d’Ache Chromatics",
      material: "标准黄铜 guillochage 海军蓝透明漆；Slim 为波纹 guilloche 半透明蓝漆与银／铑饰件",
      dimensions: "标准 141 mm × 14.8 mm；Slim 141 mm × 10.6 mm",
      weight: "标准 52 g；Slim 38 g",
      status: "当前官方商品在列；标准、Slim、颜色、尖幅和货号按 SKU",
    },
    variants: [
      { key: "phase488-caran-leman-standard-bleu-marin", name: "标准 Bleu Marin（Phase 488 当前）", notes: "141 mm、14.8 mm、52 g 的标准比例；英国当前货号 4799 系列。", sourceKey: caranOfficialStandard.key, variantKind: "market_sku", productCode: "4799.159/169/179" },
      { key: "phase488-caran-leman-slim-grand-bleu", name: "Léman Slim Grand Bleu（Phase 488 当前）", notes: "141 mm、10.6 mm、38 g；英国当前货号 4791 系列，地区库存单独核对。", sourceKey: caranOfficialSlim.key, variantKind: "market_sku", productCode: "4791.148/158/168/178" },
      { key: "phase488-caran-leman-klein-blue-sample", name: "Klein Blue 独立样笔", notes: "The Gentleman Stationer 的 2021 年样笔与销售切片；不作为当前标准或 Slim SKU。", sourceKey: caranReview.key, variantKind: "color" },
    ],
    eventTitle: "Phase 488：Léman 标准与 Slim 比例、尖幅和漆面边界深化",
    eventDescription: "补足 Bleu Marin 与 Grand Bleu Slim 的尺寸重量差异、18K 镀铑尖、converter／墨囊、guillochage 漆面及独立评测样本范围。",
  }),
];
