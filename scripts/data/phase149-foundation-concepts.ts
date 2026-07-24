import type { CuratedSource } from "../lib/curated-content-pack";

export const PHASE149_RETRIEVED = "2026-07-24";

export interface FoundationConceptDefinition {
  key: string;
  entityId: string;
  expectedSlug: string;
  expectedName: string;
  markdownFile: string;
  sources: CuratedSource[];
  imagePath: string;
  imageTitle: string;
}

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
    ...input,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: PHASE149_RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${PHASE149_RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase149",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase149",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: PHASE149_RETRIEVED,
    summary: "本站原创 factual SVG；用于解释上墨结构，非产品照片，不作为真实比例、颜色、库存或型号证明。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const vintagePiston = web({
  key: "phase149-vintage-pens-piston",
  title: "Vintage Pens: Piston Fillers",
  url: "https://vintagepens.com/filling_instructions_piston-fillers.shtml",
  registryKey: "vintage-pens-phase149",
  registryName: "Vintage Pens",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "vintage-pens-phase149",
  summary: "专业钢笔资料站说明旋钮带动活塞从瓶中吸墨，并提醒卡住的活塞不应硬拧。",
  locator: "Piston fillers: turning the knob moves the piston; stuck piston maintenance warning",
});
const hamilton = web({
  key: "phase149-hamilton-filling-mechanisms",
  title: "Hamilton Pen Company: Fountain Pen Filling Mechanisms",
  url: "https://www.hamiltonpens.com/blogs/articles/fountain-pen-filling-mechanisms-get-filled-in",
  registryKey: "hamilton-pen-company-phase149",
  registryName: "Hamilton Pen Company",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "hamilton-pen-company-phase149",
  summary: "钢笔专业零售商的机制概览，用于比较活塞、真空、滴入式与墨囊／转换器的结构取舍。",
  locator: "Filling mechanism overview: piston, vacuum, eyedropper and cartridge/converter comparison",
});
const dayspring = web({
  key: "phase149-dayspring-vacuum",
  title: "Dayspring Pens: Types of Fountain Pen Filling Mechanisms",
  url: "https://dayspringpens.com/blogs/the-jotted-line/what-are-the-types-of-fountain-pens",
  registryKey: "dayspring-pens-phase149",
  registryName: "Dayspring Pens",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "dayspring-pens-phase149",
  summary: "专业钢笔商店以压差和近似真空解释抽拉式真空上墨的吸墨过程。",
  locator: "Vacuum filler mechanism: pushing air out and drawing ink back through pressure difference",
});
const vintageEyedropper = web({
  key: "phase149-vintage-pens-eyedropper",
  title: "Vintage Pens: Eyedropper Fillers",
  url: "https://vintagepens.com/filling_instructions_eyedroppers.shtml",
  registryKey: "vintage-pens-phase149",
  registryName: "Vintage Pens",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "vintage-pens-phase149",
  summary: "专业钢笔资料站将滴入式定义为直接把墨水装进中空笔杆，并说明螺纹密封与热量相关风险。",
  locator: "Eyedropper fillers: direct barrel filling and sealing/carrying precautions",
});
const penBoutique = web({
  key: "phase149-pen-boutique-eyedropper",
  title: "Pen Boutique: Fountain Pen Filling Mechanisms, Part Two",
  url: "https://www.penboutique.com/blogs/blog/fill-me-in-a-guide-to-fountain-pen-filling-mechanisms-part-two-1",
  registryKey: "pen-boutique-phase149",
  registryName: "Pen Boutique",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "pen-boutique-phase149",
  summary: "零售商机制指南补充滴入式的容量、密封、漏墨与金属腐蚀边界。",
  locator: "Eyedropper mechanism: full barrel reservoir, seal, leakage and metal-corrosion cautions",
});

const pistonDiagram = diagram(
  "phase149-piston-diagram",
  "Piston filler mechanism factual diagram",
  "/images/library/site-original/phase149/concepts/piston-filler.svg",
);
const vacuumDiagram = diagram(
  "phase149-vacuum-diagram",
  "Vacuum filler mechanism factual diagram",
  "/images/library/site-original/phase149/concepts/vacuum-filler.svg",
);
const eyedropperDiagram = diagram(
  "phase149-eyedropper-diagram",
  "Eyedropper filler mechanism factual diagram",
  "/images/library/site-original/phase149/concepts/eyedropper-filler.svg",
);

export const phase149FoundationConcepts: FoundationConceptDefinition[] = [
  {
    key: "phase149-piston-filler",
    entityId: "_7v4D-P_Knpe",
    expectedSlug: "piston-filler",
    expectedName: "活塞上墨",
    markdownFile: ".planning/content-research/concept-piston-filler-phase149.md",
    sources: [vintagePiston, hamilton, pistonDiagram],
    imagePath: "/images/library/site-original/phase149/concepts/piston-filler.svg",
    imageTitle: "活塞上墨结构事实示意图",
  },
  {
    key: "phase149-vacuum-filler",
    entityId: "nbElcAgDbRRU",
    expectedSlug: "vacuum-filler",
    expectedName: "真空上墨",
    markdownFile: ".planning/content-research/concept-vacuum-filler-phase149.md",
    sources: [dayspring, hamilton, vacuumDiagram],
    imagePath: "/images/library/site-original/phase149/concepts/vacuum-filler.svg",
    imageTitle: "真空上墨结构事实示意图",
  },
  {
    key: "phase149-eyedropper-filler",
    entityId: "b9V0JqOxpBPx",
    expectedSlug: "eyedropper-filler",
    expectedName: "滴入式上墨",
    markdownFile: ".planning/content-research/concept-eyedropper-filler-phase149.md",
    sources: [vintageEyedropper, hamilton, penBoutique, eyedropperDiagram],
    imagePath: "/images/library/site-original/phase149/concepts/eyedropper-filler.svg",
    imageTitle: "滴入式上墨结构事实示意图",
  },
];
