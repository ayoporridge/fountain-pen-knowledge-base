import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE105_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE105_URUSHI_ID = "s105PILOT_URUSHI";
export const PHASE105_URUSHI_SLUG = "pilot-custom-urushi";

const RETRIEVED = "2026-07-20";
const SCOPE = "phase105-custom-urushi-current";

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
}): CuratedSource {
  return {
    ...input,
    registryKey: "pilot-official-phase105",
    registryName: "PILOT official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    homepageUrl: "https://www.pilot.co.jp/",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const catalog = official({
  key: "phase105-pilot-catalog",
  title: "PILOT 万年筆产品目录",
  url: "https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004",
  summary:
    "PILOT 官方万年笔目录将 Custom URUSHI 作为独立在售型号；用于产品家族与当前目录身份定位。",
});
const release = official({
  key: "phase105-pilot-urushi-konjyo-release",
  title: "CUSTOM URUSHI 新色「紺青」发布",
  url: "https://www.pilot.co.jp/press_release/2024/10/23/urushi.html",
  summary:
    "PILOT 2024 年 10 月 23 日新闻稿列出硬橡胶笔身、蝋色漆、18K No.30 大型笔尖及既有漆黑／朱和新增紺青。",
});
const manual = official({
  key: "phase105-pilot-urushi-manual",
  title: "CUSTOM URUSHI FKV-88SR 使用说明与保修",
  url: "https://www.pilot.co.jp/support/warranty/jp/fountain/custom_urushi.html",
  summary:
    "PILOT 官方支持页绑定 FKV-88SR，说明墨囊、CON-40、CON-70N 兼容性及清洁、漆面与禁止自行维修等注意事项。",
});
const professionalReview: CuratedSource = {
  key: "phase105-gentleman-stationer-review",
  registryKey: "gentleman-stationer-custom-urushi",
  registryName: "The Gentleman Stationer",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "gentleman-stationer",
  title: "Ultra Luxury Options: The Pilot Custom Urushi Fountain Pen",
  url: "https://www.gentlemanstationer.com/blog/2021/7/3/ultra-luxury-options-the-pilot-custom-urushi-fountain-pen",
  homepageUrl: "https://www.gentlemanstationer.com/",
  author: "Joe Crace",
  publishedAt: "2021-07-03",
  retrievedAt: RETRIEVED,
  allowedUse: "summary_only",
  summary:
    "独立专业评测以实物交叉核对大型硬橡胶漆杆、18K No.30 笔尖与 cartridge/converter 结构，并把手感判断明确保留为作者体验。",
  archiveUrl:
    "https://www.gentlemanstationer.com/blog/2021/7/3/ultra-luxury-options-the-pilot-custom-urushi-fountain-pen",
  archiveLocator:
    "live-source-not-frozen;retrieved=2026-07-20;external_archive=false;locator=opening construction paragraph and cartridge-converter discussion",
};
const diagram: CuratedSource = {
  key: "phase105-custom-urushi-svg",
  registryKey: "fountain-pen-graph-editorial-phase105",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase105",
  title: "Pilot Custom URUSHI 事实示意图",
  url: "/images/library/site-original/pilot/custom-urushi.svg",
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  allowedUse: "store_full",
  license: "site-original",
  summary: "本站原创 factual SVG；示意图，非产品照片。",
  archiveUrl: "/images/library/site-original/pilot/custom-urushi.svg",
  archiveLocator:
    "project-public-asset:/images/library/site-original/pilot/custom-urushi.svg;site-original=true;factual-svg=true;product-photo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
};

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  locator: string,
) {
  return {
    fieldKey,
    key,
    sourceKey,
    scopeKey: SCOPE,
    locator,
    qualifies: true,
  };
}

export const phase105PilotCustomUrushiPack: CuratedEntityPack = {
  key: "phase105-pilot-custom-urushi-v1",
  entityId: PHASE105_URUSHI_ID,
  expectedType: "pen",
  expectedSlug: PHASE105_URUSHI_SLUG,
  canonicalName: "百乐 Pilot Custom URUSHI",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pilot-custom-urushi.md",
  storyTitle: "Pilot Custom URUSHI：30 号尖与漆杆的旗舰型号",
  primarySourceKey: release.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pilot Custom URUSHI",
      language: "en",
      sourceKey: catalog.key,
    },
    {
      alias: "カスタム URUSHI",
      language: "ja",
      sourceKey: release.key,
    },
    {
      alias: "FKV-88SR",
      language: "und",
      sourceKey: manual.key,
    },
  ],
  sources: [catalog, release, manual, professionalReview, diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      productionState: "current",
      nibScope: "18K No.30 大型笔尖；不从卖家描述推断未核实尖型。",
      materialScope: "硬橡胶笔身与蝋色漆仕上；颜色不是独立型号。",
      editionScope:
        "FKV-88SR 当前型号范围；黑、朱与 2024 紺青为颜色 variant，845／823 属于 sibling，不共享规格。",
    },
  ],
  claims: [
    {
      key: "phase105-identity",
      predicate: "model_identity",
      objectText:
        "Custom URUSHI 是产品号 FKV-88SR 的独立 Pilot 钢笔型号，使用 18K No.30 大型笔尖，不是 Custom 845 或 Custom 823 的配色版本。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: manual.key,
      locator: "支持页标题与适用产品号 FKV-88SR；新闻稿的 No.30 说明。",
      evidence: [
        {
          key: "phase105-identity-manual",
          sourceKey: manual.key,
          scopeKey: SCOPE,
          locator: "CUSTOM URUSHI／FKV-88SR 支持页标题与产品号。",
        },
        {
          key: "phase105-identity-release",
          sourceKey: release.key,
          scopeKey: SCOPE,
          locator: "新闻稿产品特长段的 18K 大型 30 号尖。",
        },
      ],
    },
    {
      key: "phase105-material-nib",
      predicate: "construction",
      objectText:
        "当前 Custom URUSHI 以硬橡胶为笔身基材，采用光泽蝋色漆仕上并搭配 18K No.30 大型笔尖。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: release.key,
      locator: "新闻稿产品特长与产品概要中的轴材、漆仕上和笔尖描述。",
      evidence: [
        {
          key: "phase105-material-nib-release",
          sourceKey: release.key,
          scopeKey: SCOPE,
          locator: "产品特长／产品概要：エボナイト、蝋色漆、18K 30 号尖。",
        },
        {
          key: "phase105-material-nib-independent-review",
          sourceKey: professionalReview.key,
          scopeKey: SCOPE,
          locator:
            "开篇实物描述交叉核对 oversized ebonite body、urushi lacquer 与 No.30 18K nib。",
          note: "仅用于结构交叉核对；作者的主观手感不写成通用规格。",
        },
      ],
    },
    {
      key: "phase105-fill-care",
      predicate: "fill_and_care",
      objectText:
        "FKV-88SR 使用 Pilot cartridge/converter，官方列出 CON-40 与 CON-70N；笔帽和笔杆不可浸洗，不使用酒精或含溶剂药剂，也不要自行维修。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: manual.key,
      locator: "支持页的适用墨囊／转换器表与使用注意事项。",
      evidence: [
        {
          key: "phase105-fill-care-manual",
          sourceKey: manual.key,
          scopeKey: SCOPE,
          locator: "适用 cartridge、CON-40、CON-70N 与清洁／漆制品注意段。",
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase105-urushi-black",
      name: "漆黑",
      notes: "官方新闻稿列为既有色；颜色不改变 FKV-88SR 型号身份。",
      sourceKey: release.key,
      variantKind: "color",
      market: "Japan",
    },
    {
      key: "phase105-urushi-vermilion",
      name: "朱",
      notes: "官方新闻稿列为既有色；颜色不改变 FKV-88SR 型号身份。",
      sourceKey: release.key,
      variantKind: "color",
      market: "Japan",
    },
    {
      key: "phase105-urushi-konjyo",
      name: "紺青",
      releaseYear: "2024",
      notes: "2024 年 11 月加入的颜色 variant，不是新笔身平台。",
      sourceKey: release.key,
      variantKind: "color",
      market: "Japan",
    },
  ],
  spec: {
    brandEntityId: PHASE105_PILOT_ID,
    values: {
      series_name: "Pilot Custom URUSHI / FKV-88SR",
      release_year: "当前 FKV-88SR；紺青于 2024 年 11 月加入",
      nib: "18K No.30 大型笔尖；具体尖宽按当期 SKU",
      fill_system: "Pilot cartridge/converter；CON-40、CON-70N",
      material: "硬橡胶笔身，蝋色漆仕上",
      dimensions: "当期资料未在本包建立统一尺寸；不从 845／823 回填",
      weight: "当期资料未在本包建立统一克重",
      status: "当前型号；漆黑、朱、紺青为颜色 variant",
    },
    evidence: [
      evidence("brand_entity_id", "phase105-spec-brand", catalog.key, "PILOT 官方目录中的型号归属。"),
      evidence("series_name", "phase105-spec-series", manual.key, "支持页标题与 FKV-88SR。"),
      evidence("release_year", "phase105-spec-release", release.key, "2024 年 11 月紺青上市说明。"),
      evidence("nib", "phase105-spec-nib", release.key, "产品特长：18K 大型 30 号尖。"),
      evidence("fill_system", "phase105-spec-fill", manual.key, "适用墨囊及 CON-40／CON-70N 表。"),
      evidence("material", "phase105-spec-material", release.key, "产品概要：轴材エボナイト与蝋色漆。"),
      evidence("dimensions", "phase105-spec-dimensions", catalog.key, "本包不借用 sibling 尺寸。"),
      evidence("weight", "phase105-spec-weight", catalog.key, "本包不补猜统一重量。"),
      evidence("status", "phase105-spec-status", release.key, "既有漆黑／朱与新增紺青的当前系列边界。"),
    ],
  },
  media: [
    {
      key: "phase105-custom-urushi-primary",
      title: "Pilot Custom URUSHI 事实示意图（非产品照片）",
      sourceKey: diagram.key,
      localPath: diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、漆色、光泽、刻字、笔尖或任何批次。",
      sourceUrl: diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase105-konjyo-release",
      title: "Custom URUSHI 新增紺青",
      eventType: "model_released",
      startDate: "2024-11",
      circa: false,
      description: "PILOT 发布紺青新色；它与漆黑、朱共享 Custom URUSHI 型号身份。",
      sourceKey: release.key,
    },
  ],
};

export const phase105PilotCustomUrushiPacks = [phase105PilotCustomUrushiPack];
