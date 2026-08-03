import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE109_CAVALIER_ID,
  phase109PilotCavalierPack,
} from "./phase109-pilot-cavalier-prera-kakuno-cocoon";
import {
  PHASE119_PUCHICO_ID,
  phase119WancherPuchicoPack,
} from "./phase119-wancher-puchico";
import {
  PHASE120_SHIZUKU_ID,
  phase120WancherShizukuPack,
} from "./phase120-wancher-shizuku-glass-nib";

export const PHASE462_IDS = {
  puchico: PHASE119_PUCHICO_ID,
  shizuku: PHASE120_SHIZUKU_ID,
  cavalier: PHASE109_CAVALIER_ID,
} as const;

const allBasePacks = [
  phase119WancherPuchicoPack,
  phase120WancherShizukuPack,
  phase109PilotCavalierPack,
];

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find((candidate) => candidate.entityId === entityId);
  if (!pack) throw new Error(`Phase 462 ${label} pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks.flatMap((pack) => pack.sources).find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 462 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string): CuratedScope {
  const key = `phase462-${slug}-depth`;
  return {
    key,
    scopeKey: key,
    productionState: "current",
    editionScope:
      "Phase 462 型号深化；官方 current、exact SKU、历史样品和颜色／地区边界分层记录，不把相邻型号或配件提升为新的 canonical entity。",
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  confidence = 0.96,
): CuratedEntityPack["claims"][number] {
  const locator = sourceItem.summary || sourceItem.title;
  return {
    key,
    predicate,
    objectText,
    factClass: ["use_and_care", "maintenance_guidance", "selection_boundary", "selection_guidance"].includes(predicate)
      ? "editorial"
      : "core",
    confidence,
    sourceKey: sourceItem.key,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator }],
  };
}

function refresh(
  basePack: CuratedEntityPack,
  key: string,
  depthScope: CuratedScope,
  claims: CuratedEntityPack["claims"],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
  markdownFile = basePack.markdownFile,
  extraSources: CuratedSource[] = [],
): CuratedEntityPack {
  return {
    ...basePack,
    key,
    markdownFile,
    sources: [...basePack.sources, ...extraSources].filter(
      (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
    ),
    scopes: [...basePack.scopes, depthScope],
    claims: [...basePack.claims, ...claims],
    timeline: [...(basePack.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const puchicoBase = base(PHASE462_IDS.puchico, "Wancher PuChiCo");
const shizukuBase = base(PHASE462_IDS.shizuku, "Wancher Shizuku");
const cavalierBase = base(PHASE462_IDS.cavalier, "Pilot Cavalier");

const puchicoOfficial = source("phase119-wancher-puchico-official-collection", "PuChiCo official collection");
const puchicoSarah = source("phase119-pen-addict-sarah-read-2024", "PuChiCo Sarah Read sample");
const puchicoKimberly = source("phase119-pen-addict-kimberly-lau-2025", "PuChiCo Kimberly Lau sample");

const shizukuFamily = source("phase120-wancher-shizuku-official-family-collection", "Shizuku official family");
const shizukuSolis = source("phase120-wancher-shizuku-solis-exact", "Shizuku Solis exact listing");
const shizukuEarth = source("phase120-pen-addict-susan-pigott-earth-2019", "Shizuku Earth sample");

const cavalierOfficial = source("phase109-cavalier-pilot-catalog", "Pilot Cavalier official catalog");
const cavalierReview = source("phase109-cavalier-penaddict-2011", "Pilot Cavalier independent review");
const cavalierCare: CuratedSource = {
  ...cavalierOfficial,
  key: "phase462-pilot-fountain-pen-care-manual",
  registryKey: "pilot-official-support-phase462",
  independenceGroup: "pilot-official-support",
  title: "PILOT fountain pen use and maintenance manual",
  url: "https://www.pilot.co.jp/support/manual/fountain/",
  homepageUrl: "https://www.pilot.co.jp/",
  summary:
    "Pilot official support page provides cartridge/converter filling and fountain pen maintenance guidance; it is used for conservative care steps, not Cavalier dimensions.",
  archiveUrl: "https://www.pilot.co.jp/support/manual/fountain/",
  archiveLocator:
    "live-source-not-frozen;retrieved=2026-08-04;external_archive=false;locator=official fountain pen manual page with converter, cartridge and maintenance sections",
};

const puchicoScope = scope("wancher-puchico");
const shizukuScope = scope("wancher-shizuku");
const cavalierScope = scope("pilot-cavalier");

export const phase462WancherPuchicoShizukuPilotCavalierDepthPacks: CuratedEntityPack[] = [
  refresh(
    puchicoBase,
    "phase462-wancher-puchico-depth-v1",
    puchicoScope,
    [
      claim(
        puchicoOfficial,
        puchicoScope.scopeKey,
        "phase462-puchico-structure",
        "model_identity",
        "Wancher PuChiCo 是同一 canonical model 的超短 acrylic eyedropper；官方 collection 记录合盖约 65 mm、需后插笔帽、普通尺寸 iridium-point stainless-steel nib，颜色 card 不创建重复型号。",
      ),
      claim(
        puchicoOfficial,
        puchicoScope.scopeKey,
        "phase462-puchico-variant-boundary",
        "variant_boundary",
        "2026-07-22 collection 去重得到十一张 PuChiCo pen cards；三张 Petite Charm Case 是配件，价格、库存、售罄和 EF/F filter 只属于检索日 commerce snapshot。",
      ),
      claim(
        puchicoSarah,
        puchicoScope.scopeKey,
        "phase462-puchico-sample-sarah",
        "sample_boundary",
        "Sarah Read 的 2024 JetPens 免费样品约 0.5 ml、数周未漏、螺纹／笔夹／写感与约 6.5 cm 测量只属于该样品，不能升级为全系容量或防漏保证。",
      ),
      claim(
        puchicoKimberly,
        puchicoScope.scopeKey,
        "phase462-puchico-sample-kimberly",
        "sample_boundary",
        "Kimberly Lau 自费购买的 Black Chocolate Orange／Fine 样品记录约 0.5 ml、航班使用、60／90 mm 和后插稳定性；作者、颜色、尖幅和日期必须与 Sarah 样品分开。",
      ),
      claim(
        puchicoOfficial,
        puchicoScope.scopeKey,
        "phase462-puchico-care",
        "use_and_care",
        "眼滴上墨要用滴管缓慢加入并擦干螺纹，先排空再用室温清水冲洗、自然阴干；避免热水、酒精、硬物捅 feed 和斜向强推笔帽，气压变化时先笔尖朝上稳定。",
      ),
      claim(
        puchicoKimberly,
        puchicoScope.scopeKey,
        "phase462-puchico-selection",
        "selection_boundary",
        "选购应分别记录 canonical model、颜色 card、EF/F 尖幅和附件；需要更长或更标准的日用供墨时转到 Shizuku、Dream Pen 等页面，不把 PuChiCo 的 65 mm 当作 Wancher 全系基准。",
      ),
    ],
    [
      {
        key: "phase462-puchico-depth",
        title: "Phase 462：PuChiCo 的眼滴维护、样品边界与配件分流",
        eventType: "design_milestone",
        startDate: "2026-08-04",
        circa: false,
        description:
          "重核官方十一色 collection、Sarah Read 与 Kimberly Lau 两支样品的取得方式及测量，补充眼滴上墨、后插、飞行与 Petite Charm Case 边界。",
        sourceKey: puchicoOfficial.key,
      },
    ],
  ),
  refresh(
    shizukuBase,
    "phase462-wancher-shizuku-depth-v1",
    shizukuScope,
    [
      claim(
        shizukuFamily,
        shizukuScope.scopeKey,
        "phase462-shizuku-family",
        "family_boundary",
        "Wancher Shizuku 的稳定身份是手工玻璃尖与 converter 机制的 family；2026-07-22 去重后的十四张颜色／名称 card 是同一 canonical model 的 variants，不是十四个 sibling entity。",
      ),
      claim(
        shizukuSolis,
        shizukuScope.scopeKey,
        "phase462-shizuku-solis",
        "sku_specification",
        "Solis exact listing 才支持 Duralumin、screw cap、clear/black glass nib、EF/F/M、154/128 mm、12 mm ring、约 25 g 与 international converter；这些字段不外推到 Earth 或其他 card。",
      ),
      claim(
        shizukuEarth,
        shizukuScope.scopeKey,
        "phase462-shizuku-earth",
        "historical_sample_boundary",
        "Susan M. Pigott 2019 年由 Wancher 免费提供的 Earth 样品记录 26.5/18 g、137/120 mm、10 mm grip、不能后插、段差和 glass-nib feel；日期和受赠关系限定了证据范围。",
      ),
      claim(
        shizukuFamily,
        shizukuScope.scopeKey,
        "phase462-shizuku-glass-care",
        "maintenance_guidance",
        "玻璃尖不按金属尖压弯或打磨；不出墨先检查 converter 和纸屑，再用清水冲洗，避免金属工具、热水、酒精和强力超声。Duralumin／阳极氧化表面用柔软无绒布维护。",
      ),
      claim(
        shizukuFamily,
        shizukuScope.scopeKey,
        "phase462-shizuku-listing",
        "variant_boundary",
        "Black Eye、Orion Nebula、Eclipse、Solis、Earth 等十四个名称是检索日 collection snapshot；sold-out、AS IS、outlet、价格与库存是 mutable commerce，不是持续生产清单。",
      ),
      claim(
        shizukuSolis,
        shizukuScope.scopeKey,
        "phase462-shizuku-selection",
        "selection_guidance",
        "购买先确认 Wancher Shizuku 而非 glass dip pen，再核对 exact card、Solis 尖幅、converter、笔帽螺纹与 Duralumin 表面；不能用原创 SVG 或 Earth 样品数字推断其他颜色。",
      ),
    ],
    [
      {
        key: "phase462-shizuku-depth",
        title: "Phase 462：Shizuku 玻璃尖、Solis 精确 SKU 与 Earth 样品分层",
        eventType: "design_milestone",
        startDate: "2026-08-04",
        circa: false,
        description:
          "补足十四张当前 card、Solis exact 字段、2019 Earth 受赠样品、玻璃尖清洁和阳极氧化表面维护边界。",
        sourceKey: shizukuFamily.key,
      },
    ],
  ),
  refresh(
    {
      ...cavalierBase,
      markdownFile: ".planning/content-research/pilot-cavalier-phase461.md",
    },
    "phase462-pilot-cavalier-depth-v1",
    cavalierScope,
    [
      claim(
        cavalierOfficial,
        cavalierScope.scopeKey,
        "phase462-cavalier-identity",
        "model_identity",
        "Pilot Cavalier 的日本现行 canonical SKU 是 FCAN-5SR；目录把它作为细杆黄铜轴帽、F 尖的独立型号，不因海外商品标题出现 Metropolitan／MR 就合并。",
      ),
      claim(
        cavalierOfficial,
        cavalierScope.scopeKey,
        "phase462-cavalier-spec",
        "sku_specification",
        "Pilot 日本 web catalog 记录 FCAN-5SR 的钢合金 F 尖、Pilot 墨囊／现行 CON-40、最大直径约 9.8 mm、长度约 134.4 mm、重量约 16.5 g 和四色目录。",
      ),
      claim(
        cavalierOfficial,
        cavalierScope.scopeKey,
        "phase462-cavalier-material",
        "material_boundary",
        "黄铜笔杆与笔帽及涂装是当前目录支持的材料边界；不能据此写成纯铜、整支无涂层金属或全颜色一致的耐磨等级，最大直径也不是握位直径。",
      ),
      claim(
        cavalierOfficial,
        cavalierScope.scopeKey,
        "phase462-cavalier-fill",
        "regional_fill_boundary",
        "现行日本 FCAN-5SR 以 Pilot 墨囊或 CON-40 为当前供墨路线；旧 CON-20 与海外 standard-international 说明属于历史或地区 sibling，不能覆盖日本 SKU。",
      ),
      claim(
        cavalierReview,
        cavalierScope.scopeKey,
        "phase462-cavalier-review",
        "historical_sample_boundary",
        "The Pen Addict 2011 评测明确使用修复后的二手 Cavalier；细杆、F 尖、平衡、笔环和写感只属于该历史样本，旧 converter 与当年价格不进入 current spec。",
      ),
      claim(
        cavalierCare,
        cavalierScope.scopeKey,
        "phase462-cavalier-care",
        "use_and_care",
        "换墨或久置用室温清水吸排并自然阴干，避免甩笔、重压 F 尖、针捅 feed、热水、酒精和金属抛光；二手笔先检查涂装、螺纹、笔夹与转换器。",
      ),
      claim(
        cavalierReview,
        cavalierScope.scopeKey,
        "phase462-cavalier-selection",
        "selection_guidance",
        "Cavalier 适合窄握位、轻量金属感和 Pilot 供墨生态；手大或偏好粗握应比较 Prera、Cocoon、Custom NS 等相邻页，但不共享它们的尺寸和附件规格。",
      ),
    ],
    [
      {
        key: "phase462-cavalier-depth",
        title: "Phase 462：Pilot Cavalier FCAN-5SR 的日本 SKU 与旧样本边界",
        eventType: "design_milestone",
        startDate: "2026-08-04",
        circa: false,
        description:
          "以 Pilot 日本目录与 The Pen Addict 2011 修复二手样本重核细杆黄铜、F 尖、CON-40、地区 sibling、维护和选购边界。",
        sourceKey: cavalierOfficial.key,
      },
    ],
    ".planning/content-research/pilot-cavalier-phase461.md",
    [cavalierCare],
  ),
];
