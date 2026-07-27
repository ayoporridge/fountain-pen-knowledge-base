import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { PHASE43_CAPLESS_ID, phase43PilotCaplessPacks } from "./phase43-pilot-capless";
import { PHASE44_PLAISIR_ID, PHASE44_PREFOUNTE_ID, PHASE44_PREPPY_ID, phase44PlatinumLowPricePacks } from "./phase44-platinum-low-price";
import { PHASE47_PILOT_823_ID, phase47PilotCustom823Packs } from "./phase47-pilot-custom-823";
import { PHASE52_PLATINUM_3776_ID, phase52LamyPlatinumCorePacks } from "./phase52-lamy-platinum-core";
import { PHASE60_CUSTOM_912_ID, phase60PilotP0Packs } from "./phase60-pilot-p0";
import { PHASE42_PLATINUM_BRAND_ID } from "./phase42-lamy-platinum";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

const RETRIEVED = "2026-07-20";

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
  retrievedAt?: string;
}): CuratedSource {
  const retrievedAt = input.retrievedAt ?? RETRIEVED;
  return {
    ...input,
    independenceGroup: input.registryKey,
    homepageUrl: input.url,
    author: input.registryName,
    retrievedAt,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${retrievedAt};external_archive=false;locator=${input.locator}`,
  };
}

const S = {
  century: source({ key: "phase84-century-pnb15000", title: "Platinum #3776 Century PNB-15000", url: "https://www.platinum-pen.co.jp/products/fountain-pen/1464/", registryKey: "platinum-pnb15000-phase84", registryName: "Platinum official", sourceType: "official", tier: "primary", summary: "PNB-15000 标准树脂款：14K 14-26、UEF–C、139.5 mm、15.4 mm、20.5 g、Converter-800A 与蓝黑墨囊。", locator: "current PNB-15000 specifications and included accessories" }),
  centuryReview: source({ key: "phase84-century-review", title: "The Pen Addict: Platinum #3776 Century Chartres Blue review", url: "https://www.penaddict.com/blog/2015/12/14/platinum-3776-century-chartres-blue-fountain-pen-review", registryKey: "pen-addict-century-phase84", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", summary: "独立试写记录普通 Century 的笔尖反馈与日用表现；不替代官方 SKU 规格。", locator: "independent writing-feedback observation" }),
  preppy: source({ key: "phase84-preppy-psq400", title: "Platinum Preppy PSQ-400 02", url: "https://www.platinum-pen.co.jp/products/fountain-pen/2204/", registryKey: "platinum-psq400-phase84", registryName: "Platinum official", sourceType: "official", tier: "primary", summary: "PSQ-400 02 是现行极细 Preppy SKU；页面列 138 mm、13 mm、13 g、ST-27、同色墨囊及累计 1,500 万支。", locator: "PSQ-400 02 EF current product block" }),
  lowReview: source({ key: "phase84-platinum-low-price-review", title: "The Gentleman Stationer: Platinum Preppy and Plaisir", url: "https://www.gentlemanstationer.com/blog/2018/10/17/old-reliables-the-platinum-preppy-and-plaisir", registryKey: "gentleman-stationer-low-price-phase84", registryName: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", summary: "独立长期使用资料比较 Preppy 和 Plaisir 的共用低价生态与不同外壳。", locator: "platform relationship and use observations" }),
  prefounte: source({ key: "phase84-prefounte-ppf800", title: "Platinum Prefounte PPF-800", url: "https://www.platinum-pen.co.jp/products/fountain-pen/9055/", registryKey: "platinum-ppf800-phase84", registryName: "Platinum official", sourceType: "official", tier: "primary", summary: "PPF-800 为树脂笔身、金属夹、03/05 钢尖、138 mm、13 mm、13 g、蓝黑墨囊的现行型号。", locator: "PPF-800 current materials, nibs, dimensions and accessory" }),
  prefounteReview: source({ key: "phase84-prefounte-review", title: "The Pen Addict: Platinum Prefounte review", url: "https://www.penaddict.com/blog/2023/9/6/platinum-prefounte-fountain-pen", registryKey: "pen-addict-prefounte-phase84", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", summary: "独立试写用于交叉核对 Prefounte 与 Preppy/Plaisir 的平台亲缘和握持体验。", locator: "independent platform and writing observation" }),
  plaisir: source({ key: "phase84-plaisir-pgb1500", title: "Platinum Plaisir PGB-1500", url: "https://www.platinum-pen.co.jp/products/fountain-pen/9257/", registryKey: "platinum-pgb1500-phase84", registryName: "Platinum official", sourceType: "official", tier: "primary", summary: "现行 PGB-1500 列喷砂阳极氧化铝笔帽/笔身、PMMA 握位、ST-27 03/05、142.5 mm、15 mm、15.4 g。", locator: "current PGB-1500 product identity and specifications" }),
  capless: source({ key: "phase84-capless-fc18sr", title: "Pilot Capless FC-18SR support", url: "https://www.pilot.co.jp/support/warranty/jp/fountain/capless.html", registryKey: "pilot-capless-fc18sr-phase84", registryName: "Pilot official support", sourceType: "official", tier: "primary", summary: "日本 Capless 支持页给出按压收纳笔尖、笔尖组件、墨囊/CON-40 装填和 FC-18SR 的维护边界。", locator: "FC-18SR current Japan operation, cartridge and CON-40 guidance" }),
  caplessReview: source({ key: "phase84-capless-review", title: "The Pen Addict: Pilot Vanishing Point review", url: "https://www.penaddict.com/blog/2012/5/9/pilot-vanishing-point-fountain-pen-review.html", registryKey: "pen-addict-capless-phase84", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", summary: "独立评测记录单手按压的便利，以及前端夹对部分握姿会形成干扰。", locator: "one-hand operation and clip-placement observation" }),
  custom823: source({ key: "phase84-custom823-japan", title: "Pilot Custom 823 FKK-3MRP", url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000364&volumeName=00004", registryKey: "pilot-fkk3mrp-phase84", registryName: "Pilot Japan Web Catalog", sourceType: "official", tier: "primary", summary: "FKK-3MRP 当前目录列 14K No.15、透明/透明黑/棕、F/M/B/S、148.4 mm、15.7 mm、29.5 g 和 INK-70 提示。", locator: "FKK-3MRP current Japan product table" }),
  custom823Review: source({ key: "phase84-custom823-review", title: "The Gentleman Stationer: Pilot Custom 823 review", url: "https://www.gentlemanstationer.com/blog/2016/8/27/pen-review-pilot-custom-823", registryKey: "gentleman-stationer-823-phase84", registryName: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", summary: "独立评测明确其不是普通活塞或 c/c 结构，并区分市场颜色命名。", locator: "filling-system and regional-name boundary" }),
  custom912: source({ key: "phase84-custom912-catalog", title: "Pilot Custom Heritage 912 FKVH-2MR", url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000365&volumeName=00004", registryKey: "pilot-fkvh2mr-phase84", registryName: "Pilot Japan Web Catalog", sourceType: "official", tier: "primary", summary: "FKVH-2MR 为黑色平顶树脂、银色饰件、14K No.10 镀铑尖；140 mm、15.7 mm、20 g，可配 CON-40/CON-70N。", locator: "FKVH-2MR product specification and nib-option table" }),
  custom912Current: source({ key: "phase84-custom912-current-sku-2026", title: "Pilot Web Catalog: Custom Heritage 912 FKVH2MR-BF", url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000377&volumeName=00004", registryKey: "pilot-fkvh2mr-current-phase84-refresh", registryName: "Pilot Japan Web Catalog", sourceType: "official", tier: "primary", retrievedAt: "2026-07-27", summary: "2026-07-27 检索的日本官方 SKU 页列出 FKVH2MR-BF 的 14K 10号 F 尖、树脂笔轴/笔帽、CON-40/CON-70N、最大径 15.7 mm、全长 140 mm、重量 20 g 与含税建议零售价 49,500 日元。", locator: "FKVH2MR-BF current product features, nib options, filling, size, weight and price table" }),
  custom912Review: source({ key: "phase84-custom912-review", title: "The Pen Addict: Pilot Custom Heritage 912 review archive", url: "https://www.penaddict.com/", registryKey: "pen-addict-912-phase84", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", summary: "独立评测档案仅用来辅助理解特殊尖试写与 742/912 的选择边界。", locator: "professional special-nib and sibling comparison observations" }),
};

function required<T>(value: T | undefined, label: string): T {
  if (!value) throw new Error(`Phase 84 prerequisite missing: ${label}`);
  return value;
}

function base(packs: CuratedEntityPack[], id: string, label: string): CuratedEntityPack {
  return structuredClone(required(packs.find((pack) => pack.entityId === id), label));
}

function revise(input: {
  pack: CuratedEntityPack;
  key: string;
  title: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  identity: string;
  boundary: string;
  care: string;
  specs: Record<string, string>;
  variants: NonNullable<CuratedEntityPack["variants"]>;
}): CuratedEntityPack {
  const pack = input.pack;
  const scopeKey = required(pack.scopes[0], `${input.key} scope`).scopeKey;
  pack.key = `phase84-${input.key}-v3`;
  pack.storyTitle = input.title;
  pack.primarySourceKey = input.primary.key;
  pack.sources = [...pack.sources, input.primary, input.secondary].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
  pack.claims = [
    { key: `${input.key}-identity-v3`, predicate: "model_identity", objectText: input.identity, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "current official identity and specification", evidence: [{ key: `${input.key}-identity-official-v3`, sourceKey: input.primary.key, scopeKey, locator: "current official identity and specification" }, { key: `${input.key}-identity-secondary-v3`, sourceKey: input.secondary.key, scopeKey, locator: "independent model-level observation" }] },
    { key: `${input.key}-boundary-v3`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.98, sourceKey: input.secondary.key, locator: "independent comparison plus official current scope", evidence: [{ key: `${input.key}-boundary-secondary-v3`, sourceKey: input.secondary.key, scopeKey, locator: "independent comparison" }, { key: `${input.key}-boundary-official-v3`, sourceKey: input.primary.key, scopeKey, locator: "current official product scope" }] },
    { key: `${input.key}-care-v3`, predicate: "maintenance_boundary", objectText: input.care, factClass: "core", confidence: 0.98, sourceKey: input.primary.key, locator: "official usage and care boundary", evidence: [{ key: `${input.key}-care-official-v3`, sourceKey: input.primary.key, scopeKey, locator: "official usage and care boundary" }] },
  ];
  if (!pack.spec) throw new Error(`Phase 84 ${input.key} lacks a specification block.`);
  pack.spec.values = { ...pack.spec.values, ...input.specs };
  const revisedFields = new Set(Object.keys(input.specs) as SpecFieldKey[]);
  pack.spec.evidence = [
    ...pack.spec.evidence.filter((evidence) => !revisedFields.has(evidence.fieldKey)),
    ...(Object.keys(input.specs) as SpecFieldKey[]).map((fieldKey) => ({ key: `${input.key}-${fieldKey}-v3`, fieldKey, sourceKey: input.primary.key, scopeKey, locator: "current official product/support specification", qualifies: true })),
  ];
  pack.variants = input.variants;
  return pack;
}

const century = revise({ pack: base(phase52LamyPlatinumCorePacks, PHASE52_PLATINUM_3776_ID, "#3776 Century"), key: "platinum-3776-century", title: "Platinum #3776 Century：PNB-15000 标准款的准确边界", primary: S.century, secondary: S.centuryReview, identity: "本页主体是现行标准树脂 #3776 Century PNB-15000：14K 14-26、UEF 至 C、139.5 mm、15.4 mm、20.5 g，并随附 Converter-800A 与蓝黑墨囊。", boundary: "1978 是 #3776 家族起点、2011 是 Century 上市；PNB-450 Ver.2.0、Travia、Celluloid、Music 和限量材料款均不等同 PNB-15000，不能互用图片、密封年限或规格。", care: "换色、久置或出墨异常时按 Platinum 手册以清水冲洗；不强压笔尖，不混用未知墨水，也不把 Slip & Seal 的条件性设计目标写成无条件保证。", specs: { series_name: "Platinum #3776 Century PNB-15000", release_year: "1978（#3776 家族）；2011（Century）", nib: "14K 14-26；UEF、EF、F、SF、M、B、C", fill_system: "Platinum 墨囊／Converter-800A", material: "AS 树脂（PNB-15000 标准款）", dimensions: "139.5 mm × 15.4 mm，20.5 g", status: "PNB-15000 标准款现行；Ver.2.0、Travia 与特殊材料款分立" }, variants: [{ key: "phase84-century-pnb15000", name: "PNB-15000 标准树脂款", productCode: "PNB-15000", releaseYear: "2011–", notes: "标准款的尺寸、重量、14K 14-26 和 Converter-800A 以当前产品页为准。", sourceKey: S.century.key, variantKind: "market_sku" }] });

const preppy = revise({ pack: base(phase44PlatinumLowPricePacks, PHASE44_PREPPY_ID, "Preppy"), key: "platinum-preppy", title: "Platinum Preppy：PSQ-400 02 与同系列 SKU 的边界", primary: S.preppy, secondary: S.lowReview, identity: "Preppy 是 2007 年起的低价钢尖系列；本页以现行 PSQ-400 02 EF 为主锚，138 mm、13 mm、13 g、ST-27 和同色墨囊均须按具体 SKU 核对。", boundary: "PSQ-400 02、PSQ-300 03/05 与透明 PSQC-400 是同系列的不同 SKU；Preppy 的非钢笔附件、Prefounte 和 Plaisir 均不应混入本页规格或主图。", care: "Slip & Seal 有助于降低闲置干燥，但仍应在换色、久置或出墨异常时清水冲洗；不用未知接口墨囊或把玩家 eyedropper 改装写成原厂功能。", specs: { series_name: "Platinum Preppy（现行 PSQ-400 02 为主体）", release_year: "2007", nib: "ST-27 不锈钢尖；PSQ-400 为 02 EF，03/05 属其他 SKU", fill_system: "Platinum 专用墨囊；转换器按原厂附件核对", material: "PC 树脂", dimensions: "138 mm × 13 mm，13 g", status: "现行系列；PSQ-400、PSQ-300、PSQC-400 分立 SKU" }, variants: [{ key: "phase84-preppy-psq400", name: "PSQ-400 02 EF", productCode: "PSQ-400", releaseYear: "现行", notes: "低价透明彩色笔身、02 极细钢尖；不将 PSQ-300/PSQC-400 的尖号或外壳回填。", sourceKey: S.preppy.key, variantKind: "market_sku" }] });

const prefounte = revise({ pack: base(phase44PlatinumLowPricePacks, PHASE44_PREFOUNTE_ID, "Prefounte"), key: "platinum-prefounte", title: "Platinum Prefounte：PPF-800 的树脂、金属夹与尖号范围", primary: S.prefounte, secondary: S.prefounteReview, identity: "Prefounte PPF-800 是半透明树脂、金属夹、03 F/05 M 钢尖的成人向入门型号，约 138 mm × 13 mm、13 g，随蓝黑墨囊。", boundary: "Prefounte 共享部分低价平台特征，却不是 Preppy 改名，也不是 Plaisir 的塑料版；PPF-800 的树脂外壳和金属夹不能换成 Preppy 彩色壳或 Plaisir 铝壳。", care: "使用 Platinum 原厂墨囊和适配附件；长期不用或换色时清水冲洗，避免以 Slip & Seal 为由省略清洁，也不使用酒精、强溶剂或硬掰笔尖。", specs: { series_name: "Platinum Prefounte PPF-800", nib: "不锈钢尖；03 F／05 M", fill_system: "Platinum 专用墨囊；原厂转换器附件另核", material: "半透明树脂笔身、金属夹", dimensions: "138 mm × 13 mm，13 g", status: "PPF-800 现行；颜色和地区供货按 SKU" }, variants: [{ key: "phase84-prefounte-ppf800", name: "PPF-800 标准款", productCode: "PPF-800", releaseYear: "现行", notes: "03/05 与颜色须按官方现售组合核对。", sourceKey: S.prefounte.key, variantKind: "market_sku" }] });

const plaisir = revise({ pack: base(phase44PlatinumLowPricePacks, PHASE44_PLAISIR_ID, "Plaisir"), key: "platinum-plaisir", title: "Platinum Plaisir：现行 PGB-1500 与历史 PGB-1000 的分界", primary: S.plaisir, secondary: S.lowReview, identity: "本页主体是现行 Plaisir PGB-1500：喷砂阳极氧化铝笔帽/笔身、PMMA 握位、ST-27 03 F/05 M，142.5 mm × 15 mm、15.4 g。", boundary: "旧 PGB-1000、2017 Nova Orange 和现行 PGB-1500 不能互写 SKU、价格、现售颜色或主图；Plaisir 的铝外壳也不能回填 Preppy/Prefounte 的树脂身份。", care: "阳极氧化表面只做温和清洁，不用金属抛光剂、酒精或粗糙研磨；换色和久置时按 Platinum 流程清水冲洗，不夸大为永不磨损。", specs: { series_name: "Platinum Plaisir PGB-1500", release_year: "现行 PGB-1500；PGB-1000 为历史 SKU", nib: "ST-27 不锈钢尖；03 F／05 M", fill_system: "Platinum 专用墨囊；原厂转换器附件另核", material: "喷砂阳极氧化铝笔帽/笔身、PMMA 握位", dimensions: "142.5 mm × 15 mm，15.4 g", status: "PGB-1500 现行；PGB-1000 和历史色款分立" }, variants: [{ key: "phase84-plaisir-pgb1500", name: "PGB-1500 标准款", productCode: "PGB-1500", releaseYear: "现行", notes: "当前材料、尺寸、重量和尖号范围不再用旧 PGB-1000 回填。", sourceKey: S.plaisir.key, variantKind: "market_sku" }, { key: "phase84-plaisir-pgb1000-history", name: "PGB-1000 历史 SKU", productCode: "PGB-1000", releaseYear: "历史", notes: "历史产品号/发行资料仅作 sibling 参照，不作为现售款规格。", sourceKey: "phase44-platinum-plaisir-official", variantKind: "market_sku" }] });

const capless = revise({ pack: base(phase43PilotCaplessPacks, PHASE43_CAPLESS_ID, "Capless"), key: "pilot-capless", title: "Pilot Capless：FC-18SR 与 Vanishing Point 市场别名", primary: S.capless, secondary: S.caplessReview, identity: "本页主体是日本标准尺寸 Pilot Capless FC-18SR：18K 可收纳笔尖、按压机构、独立笔尖组件，可使用 Pilot 墨囊或 CON-40；海外常称 Vanishing Point。", boundary: "Capless、较细轻的 Decimo、knock & twist 的 LS、Raden 与特殊合金款不是同一型号；海外 Vanishing Point 名称和地区颜色/套装也不能无注释代表日版 FC-18SR。", care: "先确认笔尖已收回，再拆开笔身并按官方顺序装 Pilot 墨囊或 CON-40；不硬塞墨囊、不掰前夹、不自行拆笔尖组件，携带或清洗时遵守官方说明。", specs: { series_name: "Pilot Capless FC-18SR（海外名 Vanishing Point）", nib: "18K 可收纳笔尖；具体 F/M/B 等按当期地区 SKU", fill_system: "Pilot 墨囊或 CON-40，经独立笔尖组件装填", material: "标准尺寸机身；具体涂层/饰件按 FC-18SR 地区 SKU", dimensions: "约 140 mm、最大径约 12.8 mm、约 30 g（标准尺寸语境）", status: "FC-18SR 现行日本标准尺寸线；Decimo、LS 和特殊版本分立" }, variants: [{ key: "phase84-capless-fc18sr", name: "FC-18SR 标准尺寸 Capless", productCode: "FC-18SR", releaseYear: "现行", notes: "日本标准尺寸、18K、按压出尖；海外 Vanishing Point 为地区销售名称。", sourceKey: S.capless.key, variantKind: "market_sku" }] });

const custom823 = revise({ pack: base(phase47PilotCustom823Packs, PHASE47_PILOT_823_ID, "Custom 823"), key: "pilot-custom-823", title: "Pilot Custom 823：FKK-3MRP 真空上墨的现行日版范围", primary: S.custom823, secondary: S.custom823Review, identity: "Custom 823 FKK-3MRP 是 14K No.15 笔尖、旋帽和固定 vacuum/plunger 上墨机构的现行型号；日版目录列透明、透明黑、棕及 F/M/B/S 组合。", boundary: "它不能使用墨囊或转换器，也不是普通活塞笔；Custom 743、742、845 和 Heritage 912 不共享其真空机构或尺寸，海外颜色命名仅是市场 variant。", care: "按 Pilot 官方顺序使用 INK-70 等适配墨瓶完成真空吸墨；换色或久置依说明清洗，不拆尾端机构或自行润滑，书写供墨受限时先检查尾端位置。", specs: { series_name: "Pilot Custom 823 FKK-3MRP", nib: "14K No.15；F、M、B、S 按日本目录 SKU", fill_system: "固定 vacuum/plunger 真空上墨；不可用墨囊或转换器", material: "透明/半透明树脂机身，颜色按市场 SKU", dimensions: "148.4 mm × 15.7 mm，29.5 g", status: "FKK-3MRP 现行；地区颜色、尖号和包装为 variant" }, variants: [{ key: "phase84-custom823-fkk3mrp", name: "FKK-3MRP 日版", productCode: "FKK-3MRP", releaseYear: "现行", notes: "透明、透明黑、棕及 F/M/B/S 需按当前日版目录分列。", sourceKey: S.custom823.key, variantKind: "market_sku" }] });

const custom912 = revise({ pack: base(phase60PilotP0Packs, PHASE60_CUSTOM_912_ID, "Custom Heritage 912"), key: "pilot-custom-heritage-912", title: "Pilot Custom Heritage 912：FKVH-2MR 与 15 种笔尖选项", primary: S.custom912Current, secondary: S.custom912Review, identity: "Custom Heritage 912 FKVH-2MR 是黑色平顶树脂、银色饰件、14K No.10 镀铑尖的独立 c/c 型号，约 140 mm × 15.7 mm、20 g；PO、FA、WA、SU 等是笔尖选项而非另一支笔。", boundary: "912 不等于 Custom 742，也不能将 743/823 的 No.15 或真空结构填入；91 的 No.5 和 92 的透明活塞则是不同型号。当前 FKVH2MR-BF 价格只属于 2026-07-27 官方 SKU 快照，不外推到其他市场或未来库存。", care: "用 Pilot 墨囊、CON-40 或 CON-70N 按官方顺序装填；特殊尖不以极端压力测试弹性，遇到持续供墨问题不自行拔尖、磨尖或拆笔舌。", specs: { series_name: "Pilot Custom Heritage 912 FKVH-2MR", nib: "14K No.10 镀铑；EF/F/SF/FM/SFM/M/SM/B/BB/C/MS/PO/FA/WA/SU 按 SKU", fill_system: "Pilot 墨囊、CON-40 或 CON-70N", material: "黑色树脂笔身/笔帽、银色饰件、平顶外形", dimensions: "140 mm × 15.7 mm，20 g", price_range: "日本官方 Web Catalog 2026-07-27 快照：FKVH2MR-BF 含税 ¥49,500（税前 ¥45,000）", status: "FKVH-2MR 现行；尖型为同型号原厂 option，不拆为独立笔" }, variants: [{ key: "phase84-custom912-fkvh2mr", name: "FKVH-2MR 标准款与原厂尖型", productCode: "FKVH-2MR", releaseYear: "现行", notes: "十五种尖型应按当期日版目录核对；店铺改磨不是原厂 variant。", sourceKey: S.custom912Current.key, variantKind: "market_sku" }] });

export const phase84PlatinumPilotP0V3Packs: CuratedEntityPack[] = [century, preppy, prefounte, plaisir, capless, custom823, custom912];

export const phase84PlatinumPilotP0V3BrandPacks: CuratedEntityPack[] = [
  base(phase78PlatinumCuridasPacks, PHASE42_PLATINUM_BRAND_ID, "Platinum brand"),
  base(phase43PilotCaplessPacks, "Zt-PbXkE7UHM", "Pilot brand"),
];
