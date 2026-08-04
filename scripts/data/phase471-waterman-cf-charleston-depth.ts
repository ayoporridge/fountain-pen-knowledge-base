import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE157_IDS,
  phase157WatermanCfPacks,
} from "./phase157-waterman-cf";
import {
  PHASE48_WATERMAN_CHARLESTON_ID,
  phase48WatermanAuroraPacks,
} from "./phase48-waterman-aurora";

const RETRIEVED = "2026-08-04";

export const PHASE471_IDS = {
  cf: PHASE157_IDS.cf,
  charleston: PHASE48_WATERMAN_CHARLESTON_ID,
} as const;

function claim(
  sourceKey: string,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: "core" | "editorial" = "core",
): CuratedEntityPack["claims"][number] {
  const locator = `${key}: source-backed Phase 471 editorial boundary`;
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
  startDate: string,
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
        productionState: "historical",
        editionScope,
      },
    ],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
  };
}

const cfBase = phase157WatermanCfPacks.find(
  (pack) => pack.entityId === PHASE157_IDS.cf,
);
const charlestonBase = phase48WatermanAuroraPacks.find(
  (pack) => pack.entityId === PHASE48_WATERMAN_CHARLESTON_ID,
);
if (!cfBase || !charlestonBase) {
  throw new Error("Phase 471 Waterman C/F and Charleston base packs are missing.");
}

const cfScope = "phase471-waterman-cf-depth";
const charlestonScope = "phase471-waterman-charleston-depth";

const cf = deepen(
  cfBase,
  "phase471-waterman-cf-depth-v1",
  ".planning/content-research/waterman-cf-phase157.md",
  cfScope,
  "Waterman’s C/F; 1953 plastic-cartridge launch, US/UK/France/Canada production, metal piercing tube, demonstrator and economy/gold-nib variants remain separately scoped.",
  [
    claim(
      "phase157-waterman-official-history",
      cfScope,
      "phase471-cf-identity",
      "model_identity",
      "Waterman’s C/F 是 1953 年推出的 Cartridge Filler；官方年表把它与塑料墨囊同时列为产品节点，Richard’s Pens 与 Vintage Pens 将其定位为首个广泛成功的现代卡水型号，而不是世界第一支卡水笔。",
    ),
    claim(
      "phase157-waterman-cf-richard",
      cfScope,
      "phase471-cf-mechanism",
      "filling_system",
      "C/F 使用金属穿刺管、橡胶密封圈和可锁定的前置尖组；早期硬橡胶笔舌与后期塑料笔舌是生产和维修边界，不能把普通国际墨囊直接视为原装兼容。",
    ),
    claim(
      "phase157-waterman-cf-richard",
      cfScope,
      "phase471-cf-design",
      "design_history",
      "C/F 的流线造型由 Harley Earl Associates 参与设计，金属围裙的腐蚀是比外观磨损更直接的结构和价值风险；这一造型语境不等于每个地区版本拥有相同饰件。",
    ),
    claim(
      "phase157-waterman-cf-vintage",
      cfScope,
      "phase471-cf-production",
      "version_boundary",
      "美国、英国、法国和加拿大生产约延续三十年；美国线约 1957 年结束，法国后期漆面、金属帽和经济钢尖款不能回填成美国早期单一规格。",
    ),
    claim(
      "phase157-waterman-cf-richard",
      cfScope,
      "phase471-cf-demonstrator",
      "sample_boundary",
      "透明 demonstrator 是展示卡水结构的特殊样本；875 等经济型号、金尖款、法国金属版本和 demonstrator 的尖材、饰件、生产地与状态都应依刻字和照片分开记录。",
    ),
    claim(
      "phase157-waterman-cf-richard",
      cfScope,
      "phase471-cf-care",
      "maintenance_boundary",
      "日用前先检查穿刺管居中、密封圈弹性、围裙腐蚀、帽内衬和笔舌供墨；缺少原装墨囊时，把刺穿、密封和连续供墨分别做低风险清水验证，不用针扩孔或强压替代件。",
      "editorial",
    ),
    claim(
      "phase157-waterman-cf-vintage",
      cfScope,
      "phase471-cf-selection",
      "selection_guidance",
      "想日用优先选择接口完整、密封已修、尖端健康的普通色样本；想收藏再比较法国漆面、金属饰件、demonstrator 与原包装，不能用卖家“cartridge pen”泛称确认 C/F 身份。",
      "editorial",
    ),
  ],
  [
    event(
      "phase157-waterman-official-history",
      "phase471-cf-launch",
      "C/F 与塑料墨囊进入 Waterman 年表",
      "Waterman 官方年表把 1953 年 C/F 与塑料墨囊并列记录；页面保留早期玻璃墨囊、LUS Atomica 和后续地区生产的比较边界。",
      "1953",
    ),
    event(
      "phase157-waterman-cf-vintage",
      "phase471-cf-regional-production",
      "C/F 的跨地区生产线",
      "美国、英国、法国和加拿大的生产与型号变体形成同一历史家族，但停产时间和材料、尖材、饰件并不统一。",
      "1957",
    ),
  ],
);

const charleston = deepen(
  charlestonBase,
  "phase471-waterman-charleston-depth-v1",
  ".planning/content-research/waterman-charleston.md",
  charlestonScope,
  "Waterman Charleston; early Newell-era Art-Deco/Hundred Year Pen reference, plastic body, 18K sample and cartridge/converter system remain edition- and specimen-scoped.",
  [
    claim(
      "phase48-waterman-charleston-archive",
      charlestonScope,
      "phase471-charleston-identity",
      "model_identity",
      "Waterman Charleston 是 Newell 收购后早期的独立现代系列，借鉴 Lucite Hundred Year Pen 的中段装饰语汇，但不是精确复刻；它与 Hémisphère 的细长现行路线保持独立 canonical。",
    ),
    claim(
      "phase48-waterman-charleston-archive",
      charlestonScope,
      "phase471-charleston-specimen",
      "sample_boundary",
      "Ravens March 的样本约为合帽 13.9 cm、戴帽 14.7 cm、无帽 11.9 cm、18K 尖、塑料笔身与 cartridge/converter；这些数字和尖材属于档案样本，不是所有市场版本的硬规格。",
    ),
    claim(
      "phase48-waterman-charleston-catalog",
      charlestonScope,
      "phase471-charleston-catalog",
      "version_boundary",
      "GoPens Catalog 67 的 2004 ivory 样本记录 18K medium、cartridge/converter 与 converter；目录库存证明一个可识别 variant，不证明全系列只有 ivory 或统一尖幅。",
    ),
    claim(
      "phase48-waterman-charleston-archive",
      charlestonScope,
      "phase471-charleston-filler",
      "filling_system",
      "Charleston 的假盲帽可能造成活塞错觉，可靠档案把它列为 cartridge/converter；购买和维修应确认真实上墨器、接口密封与是否后配，不能按外形推断活塞机构。",
    ),
    claim(
      "phase48-waterman-history",
      charlestonScope,
      "phase471-charleston-status",
      "production_status",
      "官方历史页确认 Waterman 于 2001 年进入 Newell Brands；当前官方导航列出现行 Hémisphère、Carène、Expert、Exception、Allure 等入口而不列 Charleston，因此本页保持历史状态，不把旧目录库存写成 2026 在产。",
    ),
    claim(
      "phase48-waterman-charleston-archive",
      charlestonScope,
      "phase471-charleston-writing",
      "sample_boundary",
      "Ravens March 对样本写作感的描述是短尖、偏硬、适合轻手；书写干湿、尖幅、摩擦和启动表现仍受具体尖刻字、调校、墨水和纸张影响，不能回填为全系列保证。",
    ),
    claim(
      "phase48-waterman-charleston-catalog",
      charlestonScope,
      "phase471-charleston-selection",
      "selection_guidance",
      "选购先核对笔尖刻字、帽环与笔杆材料、上墨器型号、螺纹和维修史；颜色、ivory、金色或镀铂饰件应作为 variant，不能用 Hémisphère 的不锈钢尖和尺寸替换 Charleston。",
      "editorial",
    ),
  ],
  [
    event(
      "phase48-waterman-charleston-archive",
      "phase471-charleston-newell-design",
      "Charleston 进入 Newell 时期产品线",
      "档案把 Charleston 放在 Newell 收购 Waterman 后的早期设计，并以 Hundred Year Pen 的 Lucite 语汇为参照，但明确不是精确复刻。",
      "2001",
    ),
    event(
      "phase48-waterman-charleston-catalog",
      "phase471-charleston-ivory-sample",
      "2004 ivory 目录样本",
      "Catalog 67 保存了 ivory、18K medium、cartridge/converter 和 converter 的具体样本记录；它作为 variant 证据而非全系列规格。",
      "2004",
    ),
  ],
);

export const phase471WatermanCfCharlestonDepthPacks: CuratedEntityPack[] = [
  cf,
  charleston,
];
