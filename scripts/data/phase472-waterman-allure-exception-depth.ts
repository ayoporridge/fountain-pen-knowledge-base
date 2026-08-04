import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE398_ALLURE_ID,
  phase398WatermanAllureRefreshPacks,
} from "./phase398-waterman-allure-refresh";
import {
  PHASE131_EXCEPTION_ID,
  phase131WatermanExceptionPack,
} from "./phase131-waterman-exception";

const RETRIEVED = "2026-08-04";

export const PHASE472_IDS = {
  allure: PHASE398_ALLURE_ID,
  exception: PHASE131_EXCEPTION_ID,
} as const;

function claim(
  sourceKey: string,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: "core" | "editorial" = "core",
): CuratedEntityPack["claims"][number] {
  const locator = `${key}: source-backed Phase 472 editorial boundary`;
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.96,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  };
}

function event(
  sourceKey: string,
  key: string,
  title: string,
  description: string,
  startDate = RETRIEVED,
): NonNullable<CuratedEntityPack["timeline"]>[number] {
  return {
    key,
    title,
    eventType: "design_milestone",
    startDate,
    circa: true,
    description,
    sourceKey,
  };
}

function deepen(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  scopeKey: string,
  productionState: "current" | "historical",
  editionScope: string,
  claims: CuratedEntityPack["claims"],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
): CuratedEntityPack {
  return {
    ...base,
    key,
    markdownFile,
    scopes: [
      ...base.scopes,
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState,
        editionScope,
      },
    ],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
  };
}

const allureBase = phase398WatermanAllureRefreshPacks.find(
  (pack) => pack.entityId === PHASE398_ALLURE_ID && pack.expectedType === "pen",
);
if (!allureBase) throw new Error("Phase 472 Waterman Allure base pack is missing.");

const allureScope = "phase472-waterman-allure-depth";
const allure = deepen(
  allureBase,
  "phase472-waterman-allure-depth-v1",
  ".planning/content-research/waterman-allure-phase398.md",
  allureScope,
  "current",
  "Waterman Allure fountain pen family; S0037650 Stainless Steel is the current evidence anchor, while Black CT, Pastel, Deluxe, Chrome and other colors remain SKU- or market-scoped.",
  [
    claim(
      "phase244-waterman-allure-product",
      allureScope,
      "phase472-allure-identity",
      "model_identity",
      "Waterman Allure 是当前目录中的独立 fountain pen family；S0037650 是刷纹不锈钢笔身与帽、Waterman W 不锈钢 Fine 尖的当前规格锚点，同名 rollerball 与 ballpoint 不属于本页。",
    ),
    claim(
      "phase244-waterman-allure-collection",
      allureScope,
      "phase472-allure-catalog",
      "current_catalog_boundary",
      "Stainless Steel、Black CT 与其它颜色是 Allure family 下的商品或饰面变体；页面缺货、旧 Pastel/Deluxe 页面或零售商 Chrome 名称不能单独证明全系停产、统一材料或统一尖幅。",
    ),
    claim(
      "phase244-waterman-allure-product",
      allureScope,
      "phase472-allure-material",
      "material_and_nib",
      "S0037650 的证据只覆盖刷纹不锈钢笔身与帽、环形 W 不锈钢 Fine 尖和法国手工装配；Black CT、旧颜色和地区 SKU 必须按自己的商品号核对漆面、饰件与尖宽。",
    ),
    claim(
      "phase244-waterman-filling",
      allureScope,
      "phase472-allure-filling",
      "filling_system",
      "Allure 使用 Waterman cartridge/converter 工作流；是否随盒附 converter、墨胆颜色和替代件供应属于 SKU/市场字段，不能从一个零售包装推广为全系承诺。",
    ),
    claim(
      "phase398-waterman-allure-cleaning",
      allureScope,
      "phase472-allure-care",
      "maintenance_boundary",
      "换墨前排空并用凉水缓慢清洁尖端与握位，余水排出后自然干燥，收纳时尖朝上；热水、酒精、溶剂、研磨剂和自行拆尖会增加不锈钢、漆面和密封件风险。",
      "editorial",
    ),
    claim(
      "phase244-waterman-allure-review",
      allureScope,
      "phase472-allure-selection",
      "selection_guidance",
      "选购顺序应是写字类型、商品号、颜色、尖宽、上墨器与保修/退换条件，最后才比较尺寸与价格；Fine、Chrome 样本的尺寸和个人写感都不能替代当前 SKU 核验。",
      "editorial",
    ),
    claim(
      "phase398-waterman-allure-heritage",
      allureScope,
      "phase472-allure-sibling-boundary",
      "sibling_boundary",
      "Allure 与 Hémisphère、Expert、Carène、Charleston 是不同 Waterman canonical；共享 cartridge/converter 生态不意味着共享商品号、尖材、尺寸或版本史。",
    ),
  ],
  [
    event(
      "phase244-waterman-allure-collection",
      "phase472-allure-current-anchor",
      "S0037650 当前规格锚点",
      "当前 Allure collection 与 S0037650 商品页提供 fountain pen 身份、刷纹不锈钢、Waterman W Fine 钢尖和颜色/库存边界；页面日期与地区需一并保存。",
    ),
    event(
      "phase398-waterman-allure-catalogue",
      "phase472-allure-pastel-boundary",
      "Pastel/Deluxe 历史或地区商品线索",
      "官方旧商品页可帮助识别历史或地区名称，但 unavailable 不等于全系停产，旧饰面不回填为当前 S0037650 的统一规格。",
      "2020",
    ),
  ],
);

const exceptionScope = "phase472-waterman-exception-depth";
const exception = deepen(
  phase131WatermanExceptionPack,
  "phase472-waterman-exception-depth-v1",
  ".planning/content-research/waterman-exception-phase131.md",
  exceptionScope,
  "current",
  "Waterman Exception family; SAP_2214314 Blue CT is the current anchor, while Exception Slim, L’Essence du Bleu, Night & Day and older metal/trim samples remain edition- and specimen-scoped.",
  [
    claim(
      "phase131-waterman-exception-sap-2214314",
      exceptionScope,
      "phase472-exception-identity",
      "model_identity",
      "Waterman Exception 是独立的方形高端钢笔系列；SAP_2214314 Blue CT 是当前商品锚点，不是 Carène、Expert、Hémisphère 或 Allure 的别名。",
    ),
    claim(
      "phase131-waterman-exception-sap-2214314",
      exceptionScope,
      "phase472-exception-current-spec",
      "exact_sku_boundary",
      "SAP_2214314 的可核字段是深蓝漆面方形轮廓与 rhodium-plated 18K gold nib；官网未给可外推到全家族的统一长度、重量、尖幅或盒装配件。",
    ),
    claim(
      "phase131-scrively-exception-slim-review",
      exceptionScope,
      "phase472-exception-slim",
      "version_boundary",
      "Scrively 评测的 Exception Slim L’Essence du Bleu 是独立样本，漆面金属、银色调饰件、cartridge/converter 与 EF/F/M/B 只能绑定该版本，不能回填到 SAP_2214314。",
    ),
    claim(
      "phase131-fpn-exception-night-day-sample",
      exceptionScope,
      "phase472-exception-night-day",
      "sample_boundary",
      "Night & Day platinum-trim 样本报告的 57.4 g 和尺寸只用于说明体量差异；它不能成为所有 Exception 的重量、闭合结构或材料规格。",
    ),
    claim(
      "phase131-waterman-filling-care",
      exceptionScope,
      "phase472-exception-care",
      "maintenance_boundary",
      "Waterman cartridge/converter 的上墨与冷水清洁适用于保守维护；方形漆面、镀层、密封件和闭合机构不应接触热水、酒精、研磨剂或强行拆解。",
      "editorial",
    ),
    claim(
      "phase131-waterman-exception-collection",
      exceptionScope,
      "phase472-exception-selection",
      "selection_guidance",
      "购买先区分标准 Exception、Slim 与历史装饰，再核对商品号、市场、尖面刻字、尖幅、上墨器和四面闭合；卖家引用 57.4 g 或 bayonet 时必须说明对应版本和样本。",
      "editorial",
    ),
  ],
  [
    event(
      "phase131-waterman-exception-sap-2214314",
      "phase472-exception-blue-ct-anchor",
      "SAP_2214314 Blue CT 当前锚点",
      "官方商品语境把 Blue CT、方形轮廓与铑镀 18K 尖绑定到一个当前 SKU；缺少商品页的尺寸和包装不回填为全系列事实。",
    ),
    event(
      "phase131-scrively-exception-slim-review",
      "phase472-exception-slim-review",
      "Exception Slim L’Essence du Bleu 样本记录",
      "2024 年专业评测为 Slim 版本提供材料、供墨和尖幅选项的样本证据；这些字段保留在版本 scope。",
      "2024",
    ),
  ],
);

exception.aliases = [
  ...exception.aliases,
  {
    alias: "Waterman Exception Fountain Pen",
    language: "en",
    sourceKey: "phase131-waterman-exception-collection",
  },
  {
    alias: "Waterman Exception Ideal",
    language: "en",
    sourceKey: "phase131-waterman-exception-collection",
  },
  {
    alias: "威迪文 Exception 钢笔",
    language: "zh",
    sourceKey: "phase131-waterman-exception-collection",
  },
].filter(
  (alias, index, all) =>
    all.findIndex((candidate) => candidate.alias === alias.alias) === index,
);

export const phase472WatermanAllureExceptionDepthPacks: CuratedEntityPack[] = [
  allure,
  exception,
];
