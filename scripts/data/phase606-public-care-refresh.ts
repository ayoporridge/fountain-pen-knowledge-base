import type {
  CuratedEntityPack,
  CuratedSource,
} from "../lib/curated-content-pack";
import {
  PHASE106_IMPERIAL_ID,
  PHASE106_IMPERIAL_SLUG,
  PHASE106_SHEAFFER_ID,
  phase106SheafferImperialPack,
} from "./phase106-sheaffer-connaisseur-imperial-icon";
import {
  PHASE115_AURORA_BRAND_ID,
  PHASE115_DEMO_ID,
  PHASE115_DEMO_SLUG,
  phase115AuroraIpsilonDemoColorsPack,
} from "./phase115-aurora-ipsilon-family-current-pens";
import {
  PHASE122_LEGACY_ALIASES,
  PHASE122_PLATINUM_BRAND_ID,
  PHASE122_PRESIDENT_ID,
  PHASE122_PRESIDENT_SLUG,
  PHASE122_RAW_NAME,
  phase122PlatinumPresidentPack,
} from "./phase122-platinum-president-ptb-20000p";

const RETRIEVED = "2026-08-13";

function officialSource(input: {
  key: string;
  registryKey: string;
  registryName: string;
  independenceGroup: string;
  title: string;
  url: string;
  homepageUrl: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    ...input,
    sourceType: "official",
    tier: "primary",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const auroraCare = officialSource({
  key: "phase606-aurora-faq-care",
  registryKey: "aurora-official-phase606",
  registryName: "Aurora official",
  independenceGroup: "aurora-official",
  title: "Aurora FAQ — fountain pen refilling",
  url: "https://aurorapen.it/faq/",
  homepageUrl: "https://aurorapen.it/",
  summary:
    "Aurora 官方 FAQ 说明 K/S cartridge 与活塞式 converter 的安装、完全浸没笔尖、吸墨后一滴回排、软布擦拭及原厂补充品建议。",
  locator:
    "FAQ fountain-pen cartridge/converter answers: K/S cartridge insertion; piston converter snap-in, full nib immersion, draw ink, expel one drop, wipe with soft cloth; original refills recommendation",
});

const sheafferCare = officialSource({
  key: "phase606-sheaffer-clean-refill-guide",
  registryKey: "sheaffer-official-phase606",
  registryName: "Sheaffer official",
  independenceGroup: "sheaffer-official",
  title: "How to Clean and Refill Your Fountain Pen",
  url: "https://sheaffer.com/blogs/news/how-to-clean-and-refill-your-fountain-pen-a-step-by-step-guide",
  homepageUrl: "https://sheaffer.com/",
  summary:
    "Sheaffer 官方指南说明 cartridge/converter 钢笔以冷水或微温水冲洗至清澈、轻按吸干、完全风干后再装墨，并拒绝热水与溶剂。",
  locator:
    "cleaning/refilling steps: remove cartridge or converter; flush nib and feed with cool or lukewarm water until clear; dab with soft cloth or tissue; air dry completely; reinstall cartridge/converter; avoid hot water and solvents",
});

const sheafferFaq = officialSource({
  key: "phase606-sheaffer-faq-service",
  registryKey: "sheaffer-official-phase606",
  registryName: "Sheaffer official",
  independenceGroup: "sheaffer-official",
  title: "Sheaffer FAQ — cleaning and service",
  url: "https://sheaffer.com/community/faq/",
  homepageUrl: "https://sheaffer.com/",
  summary:
    "Sheaffer FAQ 要求以冷水清洗并完全风干，避免热水和溶剂；需要维修时转交 Service Department。",
  locator:
    "FAQ cleaning answer: cool water, complete air drying, no hot water or solvents; service and repair answer routes repairs to Sheaffer Service Department",
});

const platinumCare = officialSource({
  key: "phase606-platinum-long-use-care",
  registryKey: "platinum-official-phase606",
  registryName: "Platinum Pen Co., Ltd.",
  independenceGroup: "platinum-official",
  title: "For long use — fountain pen care",
  url: "https://www.platinum-pen.co.jp/en/about-fountain-pen/detail/?pid=389",
  homepageUrl: "https://www.platinum-pen.co.jp/",
  summary:
    "Platinum 官方保养页说明每月、换色、出水不畅或长期停用后以温水浸泡、清水洗净和软干布处理，并拒绝湿布、金属抛光剂与化学品。",
  locator:
    "care sections: clean about monthly and when changing ink/poor flow/after long storage; soak nib section in lukewarm water for one day, rinse until clear and dry with soft cloth; do not shake; no wet cloth, metal polish or chemicals; severe dirt to manufacturer",
});

const platinumFaq = officialSource({
  key: "phase606-platinum-faq-storage-ink-change",
  registryKey: "platinum-official-phase606",
  registryName: "Platinum Pen Co., Ltd.",
  independenceGroup: "platinum-official",
  title: "Platinum FAQ — long storage and changing ink",
  url: "https://www.platinum-pen.co.jp/en/contact/faq/",
  homepageUrl: "https://www.platinum-pen.co.jp/",
  summary:
    "Platinum FAQ 要求长期不用前取下 cartridge/converter、清洗并干燥；更换墨色或墨水品牌时清洁笔尖与笔舌。",
  locator:
    "FAQ: before long non-use remove cartridge/converter, clean and dry; when changing ink colour or brand clean nib and feed",
});

const SHEAFFER_CURRENT_SVG =
  "/images/library/site-original/phase309/sheaffer/imperial.svg";
const sheafferCurrentDiagram: CuratedSource = {
  key: "phase606-sheaffer-imperial-current-svg",
  registryKey: "fountain-pen-graph-editorial-phase606",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase606",
  title: "Sheaffer Imperial factual boundary illustration",
  url: SHEAFFER_CURRENT_SVG,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary: "本站既有 Imperial 独立 factual SVG；示意图，非产品照片。",
  allowedUse: "store_full",
  license: "site-original",
  archiveUrl: SHEAFFER_CURRENT_SVG,
  archiveLocator: `project-public-asset:${SHEAFFER_CURRENT_SVG};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false`,
};

const auroraScope = "phase606-aurora-cartridge-converter-care";
export const phase606AuroraIpsilonDemoColorsCarePack: CuratedEntityPack = {
  ...structuredClone(phase115AuroraIpsilonDemoColorsPack),
  key: "phase606-aurora-ipsilon-demo-colors-care-refresh-v1",
  sources: [
    ...structuredClone(phase115AuroraIpsilonDemoColorsPack.sources),
    auroraCare,
  ],
  scopes: [
    ...structuredClone(phase115AuroraIpsilonDemoColorsPack.scopes),
    {
      key: auroraScope,
      scopeKey: auroraScope,
      validFrom: RETRIEVED,
      productionState: "unknown",
      editionScope:
        "Official Aurora cartridge/converter operating guidance; applies only after the installed Aurora filling component is identified and does not establish current Demo Colors specification availability.",
    },
  ],
  claims: [
    ...structuredClone(phase115AuroraIpsilonDemoColorsPack.claims),
    {
      key: "phase606-aurora-safe-refill-care",
      predicate: "official_refill_care_boundary",
      objectText:
        "For an identified Aurora cartridge or piston converter, follow Aurora's insertion/refilling sequence, return one drop after filling, wipe with a soft cloth, and stop rather than force an incompatible component.",
      factClass: "editorial",
      confidence: 0.99,
      sourceKey: auroraCare.key,
      locator: auroraCare.archiveLocator ?? auroraCare.summary,
      evidence: [
        {
          key: "phase606-aurora-safe-refill-care-evidence",
          sourceKey: auroraCare.key,
          scopeKey: auroraScope,
          locator: auroraCare.archiveLocator ?? auroraCare.summary,
        },
      ],
    },
  ],
};

const sheafferModernScope = "phase606-sheaffer-modern-cartridge-converter-care";
const sheafferVintageScope =
  "phase606-sheaffer-vintage-touchdown-service-boundary";
export const phase606SheafferImperialCarePack: CuratedEntityPack = {
  ...structuredClone(phase106SheafferImperialPack),
  key: "phase606-sheaffer-imperial-care-refresh-v1",
  sources: [
    ...structuredClone(
      phase106SheafferImperialPack.sources.filter(
        (source) => source.sourceType !== "user_submission",
      ),
    ),
    sheafferCare,
    sheafferFaq,
    sheafferCurrentDiagram,
  ],
  scopes: [
    ...structuredClone(phase106SheafferImperialPack.scopes),
    {
      key: sheafferModernScope,
      scopeKey: sheafferModernScope,
      validFrom: RETRIEVED,
      productionState: "unknown",
      editionScope:
        "Current official cartridge/converter cleaning guidance, applicable only after that filling system is positively identified.",
    },
    {
      key: sheafferVintageScope,
      scopeKey: sheafferVintageScope,
      productionState: "historical",
      editionScope:
        "Editorial safety boundary for vintage Touchdown pens: official current cartridge/converter instructions do not authorize pressure-system disassembly; abnormal resistance, leaks or seal work require qualified service.",
    },
  ],
  claims: [
    ...structuredClone(phase106SheafferImperialPack.claims),
    {
      key: "phase606-sheaffer-modern-cleaning",
      predicate: "official_cartridge_converter_cleaning",
      objectText:
        "An identified cartridge/converter Sheaffer may be flushed with cool or lukewarm water until clear, dabbed without pressure, air-dried completely, and then refilled; hot water and solvents are excluded.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: sheafferCare.key,
      locator: sheafferCare.archiveLocator ?? sheafferCare.summary,
      evidence: [
        {
          key: "phase606-sheaffer-modern-cleaning-evidence",
          sourceKey: sheafferCare.key,
          scopeKey: sheafferModernScope,
          locator: sheafferCare.archiveLocator ?? sheafferCare.summary,
        },
      ],
    },
    {
      key: "phase606-sheaffer-vintage-service-boundary",
      predicate: "vintage_touchdown_service_boundary",
      objectText:
        "A vintage Touchdown filling system is not covered by the current cartridge/converter cleaning sequence; abnormal resistance, air loss, leakage or seal work should be stopped and referred to qualified service.",
      factClass: "editorial",
      confidence: 0.97,
      sourceKey: sheafferFaq.key,
      locator: sheafferFaq.archiveLocator ?? sheafferFaq.summary,
      evidence: [
        {
          key: "phase606-sheaffer-vintage-service-boundary-evidence",
          sourceKey: sheafferFaq.key,
          scopeKey: sheafferVintageScope,
          locator: sheafferFaq.archiveLocator ?? sheafferFaq.summary,
          note: "The non-disassembly boundary is an editorial safety inference from the target's documented Touchdown identity and Sheaffer's official service routing.",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase606-sheaffer-imperial-primary",
      title: "Sheaffer Imperial factual boundary illustration（非产品照片）",
      sourceKey: sheafferCurrentDiagram.key,
      localPath: SHEAFFER_CURRENT_SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、笔尖、材质、包装、库存或具体 SKU。",
      sourceUrl: SHEAFFER_CURRENT_SVG,
      usageStatus: "primary",
    },
  ],
};

const platinumCareScope = "phase606-platinum-president-routine-care";
export const phase606PlatinumPresidentCarePack: CuratedEntityPack = {
  ...structuredClone(phase122PlatinumPresidentPack),
  key: "phase606-platinum-president-ptb-20000p-care-refresh-v1",
  aliases: [
    {
      alias: PHASE122_RAW_NAME,
      language: "zh",
      sourceKey: phase122PlatinumPresidentPack.primarySourceKey,
    },
    {
      alias: PHASE122_LEGACY_ALIASES[0],
      language: "en",
      sourceKey: phase122PlatinumPresidentPack.primarySourceKey,
    },
    {
      alias: PHASE122_LEGACY_ALIASES[1],
      language: "zh",
      sourceKey: phase122PlatinumPresidentPack.primarySourceKey,
    },
  ],
  sources: [
    ...structuredClone(phase122PlatinumPresidentPack.sources),
    platinumCare,
    platinumFaq,
  ],
  scopes: [
    ...structuredClone(phase122PlatinumPresidentPack.scopes),
    {
      key: platinumCareScope,
      scopeKey: platinumCareScope,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "Official routine-care guidance for an owned Platinum cartridge/converter fountain pen; it does not change PTB-20000P variants or current-product specification evidence.",
    },
  ],
  claims: [
    ...structuredClone(phase122PlatinumPresidentPack.claims),
    {
      key: "phase606-platinum-routine-care",
      predicate: "official_routine_care",
      objectText:
        "Clean about monthly and when changing ink, after poor flow or long non-use: remove cartridge/converter, use lukewarm water, rinse until clear, dry fully, avoid shaking, metal polish and chemicals, and refer severe blockage for service.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: platinumCare.key,
      locator: platinumCare.archiveLocator ?? platinumCare.summary,
      evidence: [
        {
          key: "phase606-platinum-routine-care-evidence",
          sourceKey: platinumCare.key,
          scopeKey: platinumCareScope,
          locator: platinumCare.archiveLocator ?? platinumCare.summary,
        },
        {
          key: "phase606-platinum-storage-care-evidence",
          sourceKey: platinumFaq.key,
          scopeKey: platinumCareScope,
          locator: platinumFaq.archiveLocator ?? platinumFaq.summary,
        },
      ],
    },
  ],
};

export const PHASE606_TARGETS = [
  {
    entityId: PHASE115_DEMO_ID,
    slug: PHASE115_DEMO_SLUG,
    canonicalName: "Aurora Ipsilon Demo Colors",
    brandEntityId: PHASE115_AURORA_BRAND_ID,
    primaryMediaPath:
      "/images/library/site-original/phase115/aurora/aurora-ipsilon-demo-colors.svg",
    primaryMediaSha256:
      "f1ae36fb394613162584a2b92601aadbc95ccc2fced330cb7e29a974a1222733",
    priorSourceMarker:
      "curated-content:phase115-aurora-ipsilon-demo-colors-v1:fc7eaca2f9ad0de526a64fe1dc114ad871a32380b3c7ecacad7ebc85b69b95fe",
  },
  {
    entityId: PHASE106_IMPERIAL_ID,
    slug: PHASE106_IMPERIAL_SLUG,
    canonicalName: "Sheaffer Imperial",
    brandEntityId: PHASE106_SHEAFFER_ID,
    primaryMediaPath: SHEAFFER_CURRENT_SVG,
    primaryMediaSha256:
      "4aae7c9a77b2ea286efe4e8b07ddb99443be5c09c8b2e1daaf600c9f1cb9ca13",
    priorSourceMarker:
      "curated-content:phase106-sheaffer-imperial-v1:ba4c954660e136efe9d48f8a9fe44ef5a41e653cb4371efcf1c0bf983f33ee8a",
  },
  {
    entityId: PHASE122_PRESIDENT_ID,
    slug: PHASE122_PRESIDENT_SLUG,
    canonicalName: "Platinum President PTB-20000P",
    brandEntityId: PHASE122_PLATINUM_BRAND_ID,
    primaryMediaPath:
      "/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg",
    primaryMediaSha256:
      "1f49b5db273fb210d7b147f7b483f92a66d6d5c628db9c24ce0abe77fb7f98ed",
    priorSourceMarker:
      "curated-content:phase122-platinum-president-ptb-20000p-v1:56069fd4a5a6f8f3e42f3e2c3aee39a7be3d80f3ce1bdf0029f0ec956cf91f27",
  },
] as const;

export const phase606PublicCareRefreshPacks: CuratedEntityPack[] = [
  phase606AuroraIpsilonDemoColorsCarePack,
  phase606SheafferImperialCarePack,
  phase606PlatinumPresidentCarePack,
];
