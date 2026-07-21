import fs from "node:fs";
import path from "node:path";
import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE109_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE109_CAVALIER_ID = "BM2fNJ2-fP0T";
export const PHASE109_PRERA_ID = "UrbBB-onjGnF";
export const PHASE109_KAKUNO_ID = "U6w1BK0N4u0f";
export const PHASE109_COCOON_ID = "1dtEi80xLCZ1";
export const PHASE109_CAVALIER_RAW_SLUG = "百乐-pilot-cavalier";
export const PHASE109_PRERA_RAW_SLUG = "百乐-pilot-prera";
export const PHASE109_KAKUNO_RAW_SLUG = "百乐-pilot-笑脸-kakuno";
export const PHASE109_COCOON_RAW_SLUG = "百乐-pilot-贵妃-cocoon";
export const PHASE109_CAVALIER_SLUG = "pilot-cavalier";
export const PHASE109_PRERA_SLUG = "pilot-prera";
export const PHASE109_KAKUNO_SLUG = "pilot-kakuno";
export const PHASE109_COCOON_SLUG = "pilot-cocoon";

const RETRIEVED = "2026-07-21";
const CONTENT_DIR = "phase109-content";

type ModelKey = "cavalier" | "prera" | "kakuno" | "cocoon";

function liveSource(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator"
  > & { locator: string },
): CuratedSource {
  const { locator, ...source } = input;
  return {
    ...source,
    homepageUrl: new URL(source.url).origin,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};http=200;readable=true;external_archive=false;locator=${locator}`,
  };
}

function editorialSource(key: ModelKey, localPath: string): CuratedSource {
  return {
    key: `phase109-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase109-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase109-${key}`,
    title: `Pilot ${key} 本站原创事实示意图`,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创事实示意图，非产品照片，不复刻品牌标识、颜色或表面。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;dimensions=1600x900`,
  };
}

const model = {
  cavalier: {
    id: PHASE109_CAVALIER_ID,
    slug: PHASE109_CAVALIER_SLUG,
    name: "百乐 Pilot Cavalier",
    japanese: "カヴァリエ",
    image: "/images/library/site-original/phase109/pilot/pilot-cavalier.svg",
    summary:
      "Pilot Cavalier 是现行日本目录中的细杆黄铜钢尖万年笔；本页把官网规格与 2011 年修复旧笔样本严格分开，避免用 CON-20 旧经验覆盖现行 CON-40。",
    official: liveSource({
      key: "phase109-cavalier-pilot-catalog",
      registryKey: "pilot-webcatalog-phase109-cavalier",
      registryName: "PILOT web catalog",
      sourceType: "official",
      tier: "primary",
      independenceGroup: "pilot-official",
      title: "FCAN-5SR-BGYF｜カヴァリエ｜PILOTウェブカタログ",
      url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000127&volumeName=00004",
      summary:
        "现行目录给出 FCAN-5SR、F 尖、黄铜轴帽、CON-40、φ9.8×134.4 mm、16.5 g 与四色。",
      locator:
        "live lines 19-69: product identity, FCAN-5SR, slim positioning, F nib, brass, CON-40, dimensions, weight and four colours",
    }),
    review: liveSource({
      key: "phase109-cavalier-penaddict-2011",
      registryKey: "penaddict-cavalier-phase109",
      registryName: "The Pen Addict",
      sourceType: "blog",
      tier: "professional_secondary",
      independenceGroup: "penaddict",
      title: "Pilot Cavalier Fountain Pen Review",
      url: "https://www.penaddict.com/blog/2011/10/14/pilot-cavalier-fountain-pen-review.html",
      author: "Brian Gushikawa (guest post); hosted by Brad Dowdy",
      publishedAt: "2011-10-14",
      summary:
        "作者明确披露样本是修复至可写状态的二手笔；写感、平衡和旧 converter 观察只属于该样本。",
      locator:
        "live review disclosure and lines 910-920: used pen repaired to working condition, sample F nib, slender handling and pen-loop observations",
    }),
    current: {
      series_name: "Pilot Cavalier / FCAN-5SR",
      release_year: "current Japanese catalog scope verified 2026-07-21",
      origin_country: "Pilot Japan-market catalog",
      nib: "steel alloy F",
      fill_system: "Pilot cartridge or current CON-40 converter",
      material: "brass barrel and cap, painted finish",
      dimensions: "maximum diameter 9.8 mm; length 134.4 mm",
      weight: "16.5 g",
      price_range: "current page lists JPY 8,800 incl. tax at retrieval",
      status: "current official web catalog",
    },
  },
  prera: {
    id: PHASE109_PRERA_ID,
    slug: PHASE109_PRERA_SLUG,
    name: "百乐 Pilot Prera",
    japanese: "プレラ",
    image: "/images/library/site-original/phase109/pilot/pilot-prera.svg",
    summary:
      "Pilot Prera 是日本现行 120.4 mm 短尺寸树脂钢尖笔；本页将基础款、透明 Iro-ai sibling 与 2025 四种新色分层，并以官网 CON-40 取代旧评测的 CON-20／CON-50 语境。",
    official: liveSource({
      key: "phase109-prera-pilot-catalog",
      registryKey: "pilot-webcatalog-phase109-prera",
      registryName: "PILOT web catalog",
      sourceType: "official",
      tier: "primary",
      independenceGroup: "pilot-official",
      title: "P-FPR-1-DTQ-M｜プレラ｜PILOTウェブカタログ",
      url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100004704&volumeName=00004",
      summary:
        "现行基础款页面给出 P-FPR-1、F/M、树脂轴帽、CON-40、φ13.4×120.4 mm、15.4 g。",
      locator:
        "live product page: P-FPR-1 base Prera, F/M, resin, CON-40 supplied, 13.4 x 120.4 mm, 15.4 g and four solid colours",
    }),
    review: liveSource({
      key: "phase109-prera-penaddict-2026",
      registryKey: "penaddict-prera-2026-phase109",
      registryName: "The Pen Addict",
      sourceType: "blog",
      tier: "professional_secondary",
      independenceGroup: "penaddict",
      title: "Fresh Thoughts On The Pilot Prera",
      url: "https://www.penaddict.com/blog/2026/1/7/fresh-thoughts-on-the-pilot-prera",
      author: "Brad Dowdy",
      publishedAt: "2026-01-07",
      summary:
        "作者披露样本由朋友赠送，记录小型树脂笔、snap cap、posted 使用与 CON-40 个人评价。",
      locator:
        "live lines 912-920 and disclosure: current sample, CON-40 observation, posted handling and gifted-by-friend scope",
    }),
    current: {
      series_name: "Pilot Prera / P-FPR-1 base solid-colour family",
      release_year: "four current solid colours released 2025-03",
      origin_country: "Pilot Japan-market catalog",
      nib: "steel alloy F or M",
      fill_system: "Pilot cartridge; supplied current CON-40 converter",
      material: "resin barrel and cap",
      dimensions: "maximum diameter 13.4 mm; length 120.4 mm",
      weight: "15.4 g",
      price_range: "current page lists JPY 4,180 incl. tax at retrieval",
      status: "current official web catalog",
    },
  },
  kakuno: {
    id: PHASE109_KAKUNO_ID,
    slug: PHASE109_KAKUNO_SLUG,
    name: "百乐 Pilot Kakuno",
    japanese: "カクノ",
    image: "/images/library/site-original/phase109/pilot/pilot-kakuno.svg",
    summary:
      "Pilot Kakuno 是面向初次使用者、儿童与成人的轻量树脂钢尖笔；笑脸刻纹用于提示笔尖朝上，不是独立实体，现行供墨以官网 CON-40／CON-70N 为准。",
    official: liveSource({
      key: "phase109-kakuno-pilot-catalog",
      registryKey: "pilot-webcatalog-phase109-kakuno",
      registryName: "PILOT web catalog",
      sourceType: "official",
      tier: "primary",
      independenceGroup: "pilot-official",
      title: "FKA-1SR-SYEF｜カクノ｜PILOTウェブカタログ",
      url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000328&volumeName=00004",
      summary:
        "现行目录给出 FKA-1SR、EF/F/M、树脂、CON-40/CON-70N、φ16×131 mm、11 g 及 beginner positioning。",
      locator:
        "live product feature/spec and lines 91-148: beginner positioning, FKA-1SR, EF/F/M, resin, CON-40/CON-70N, dimensions, weight and family colours",
    }),
    review: liveSource({
      key: "phase109-kakuno-abetterdesk-2015",
      registryKey: "abetterdesk-kakuno-phase109",
      registryName: "A Better Desk",
      sourceType: "blog",
      tier: "professional_secondary",
      independenceGroup: "abetterdesk",
      title: "Pilot Kakuno Fountain Pen Review",
      url: "https://www.abetterdesk.com/blog/2015/11/13/pilot-kakuno-fountain-pen-review",
      author: "Chris",
      publishedAt: "2015-11-17",
      summary:
        "作者的灰轴橙帽样本用于记录轻量、握位、snap cap 与桌面防滚体验，不泛化成全系列保证。",
      locator:
        "live lines 21-44: named author/date and specific grey/orange sample handling, cap, grip and writing observations",
    }),
    current: {
      series_name: "Pilot Kakuno / FKA-1SR",
      release_year: "current Japanese catalog scope verified 2026-07-21",
      origin_country: "Pilot Japan-market catalog",
      nib: "steel alloy EF, F or M; smile engraving is an orientation feature",
      fill_system: "Pilot cartridge or current CON-40 / CON-70N converter",
      material: "resin barrel and cap; catalog PDF specifies recycled resin",
      dimensions: "maximum diameter 16.0 mm; length 131 mm",
      weight: "11.0 g",
      price_range: "current page lists JPY 1,100 incl. tax at retrieval",
      status: "current official web catalog",
    },
  },
  cocoon: {
    id: PHASE109_COCOON_ID,
    slug: PHASE109_COCOON_SLUG,
    name: "百乐 Pilot Cocoon",
    japanese: "コクーン",
    image: "/images/library/site-original/phase109/pilot/pilot-cocoon.svg",
    summary:
      "Pilot Cocoon 是日本 FCO-3SR 金属钢尖型号；Metropolitan／MR 只作地区 sibling 名称边界，欧洲 MR 的 standard-international 供墨不能覆盖日本 Cocoon 的现行 CON-40。",
    official: liveSource({
      key: "phase109-cocoon-pilot-catalog",
      registryKey: "pilot-webcatalog-phase109-cocoon",
      registryName: "PILOT web catalog",
      sourceType: "official",
      tier: "primary",
      independenceGroup: "pilot-official",
      title: "FCO-3SR-WM｜コクーン｜PILOTウェブカタログ",
      url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000162&volumeName=00004",
      summary:
        "日本现行目录给出 FCO-3SR、F/M、黄铜轴帽、CON-40、φ13.2×138 mm、24 g 与七色。",
      locator:
        "live lines 19-111: Cocoon FCO-3SR, F/M lineup, brass, CON-40, 13.2 x 138 mm, 24 g and Japan-market colours",
    }),
    review: liveSource({
      key: "phase109-cocoon-wellappointeddesk-2013",
      registryKey: "wellappointeddesk-cocoon-phase109",
      registryName: "The Well-Appointed Desk",
      sourceType: "blog",
      tier: "professional_secondary",
      independenceGroup: "wellappointeddesk",
      title: "Review: Pilot Cocoon Fountain Pen",
      url: "https://www.wellappointeddesk.com/2013/06/review-pilot-cocoon-fountain-pen/",
      author: "Ana Reinert",
      publishedAt: "2013-06-17",
      summary:
        "2013 年获赠样本与 Metropolitan 比较，CON-50、约 40 美元及写感仅属当时样本。",
      locator:
        "live article lines 35-49: gifted Cocoon sample, Metropolitan comparison, historical CON-50/price and sample writing observations",
    }),
    current: {
      series_name: "Pilot Cocoon / FCO-3SR Japan",
      release_year: "current Japanese catalog scope verified 2026-07-21",
      origin_country: "Pilot Japan-market FCO catalog",
      nib: "steel alloy F or M",
      fill_system: "Pilot cartridge or current CON-40; no European MR compatibility claim",
      material: "painted brass barrel and cap; painted resin middle barrel",
      dimensions: "maximum diameter 13.2 mm; length 138 mm",
      weight: "24 g",
      price_range: "current page lists JPY 4,400 incl. tax at retrieval",
      status: "current Japanese official web catalog",
    },
  },
} as const;

const preraRelease = liveSource({
  key: "phase109-prera-pilot-release-2025",
  registryKey: "pilot-prera-release-2025-phase109",
  registryName: "PILOT press release",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "pilot-official",
  title: "万年筆『プレラ』新色 発売",
  url: "https://www.pilot.co.jp/press_release/2025/03/07/post_140.html",
  publishedAt: "2025-03-07",
  summary:
    "官方新闻稿宣布红棕、米白、暖黄、深绿松石四种日本新色于 2025 年 3 月上市，附 CON-40。",
  locator:
    "live release title/date and product table: four colours, F/M, CON-40 supplied, cartridge compatible, release month 2025-03",
});

const preraIroAi = liveSource({
  key: "phase109-prera-pilot-iroai",
  registryKey: "pilot-webcatalog-phase109-prera-iroai",
  registryName: "PILOT web catalog",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "pilot-official",
  title: "P-FPR-1-TB-F｜プレラ 色彩逢い（いろあい）｜PILOTウェブカタログ",
  url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100004795&volumeName=00004",
  summary:
    "Iro-ai 是透明相邻 family/sibling，具有透明结构及 CM 等自身 SKU；不泛化到基础实色 Prera。",
  locator:
    "live Iro-ai product page: transparent sibling, F/M/CM lineup, CON-40, same compact dimensions; identity remains separate",
});

const kakunoManual = liveSource({
  key: "phase109-kakuno-pilot-manual",
  registryKey: "pilot-kakuno-manual-phase109",
  registryName: "PILOT support manual",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "pilot-official",
  title: "kakuno English Use and Care Guide",
  url: "https://www.pilot.co.jp/support/manual/fountain/kakuno_en.pdf",
  itemType: "pdf",
  summary:
    "说明书用图和步骤要求书写时让笑脸朝上，并给出 cartridge、清洗、儿童监护和安全边界。",
  locator:
    "PDF pages 1-2: insert cartridge, write with smiling face facing up, rinse with water, child supervision and Pilot ink cautions",
});

const preraHistory2011 = liveSource({
  key: "phase109-prera-penaddict-2011",
  registryKey: "penaddict-prera-2011-phase109",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penaddict",
  title: "Pilot Prera Fountain Pen Review",
  url: "https://www.penaddict.com/blog/2011/11/28/pilot-prera-fountain-pen-review.html",
  author: "Bryan Gushikawa (guest review); hosted by Brad Dowdy",
  publishedAt: "2011-11-28",
  summary:
    "旧样本文章记录当时 CON-20/CON-50、posted 平衡和作者写感；converter 信息仅为历史语境。",
  locator:
    "live lines 908-922 and review capacity section: 2011 sample, subjective handling, historical CON-20/CON-50",
});

const preraParka = liveSource({
  key: "phase109-prera-parka-2015",
  registryKey: "parka-prera-phase109",
  registryName: "Parka Blogs",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "parka-blogs",
  title: "Review: Pilot Prera Fountain Pen",
  url: "https://www.parkablogs.com/picture/review-pilot-prera-fountain-pen",
  author: "Teoh Yi Chie",
  publishedAt: "2015-02-27",
  summary:
    "作者实测短尺寸透明样本、click cap、钢尖与绘画体验；CON-50 仅对应 2015 样本。",
  locator:
    "live lines 36-74: author/date, 12 cm sample, demonstrator, historical CON-50, cap, nib and sketching experience",
});

const preraGentleman = liveSource({
  key: "phase109-prera-gentleman-2025",
  registryKey: "gentleman-prera-2025-phase109",
  registryName: "The Gentleman Stationer",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "gentleman-stationer",
  title: "Pen Review: The 2025 Pilot Prera Revamp",
  url: "https://www.gentlemanstationer.com/blog/2025/10/22/pen-review-the-2026-pilot-prera-revamp",
  author: "Joe Crace",
  publishedAt: "2025-10-22",
  summary:
    "作者记录黄色样本两周使用、posted 长写和美国市场命名；仅作为具体市场样本。",
  locator:
    "live lines 29-36 and review body: author/date, yellow sample, two-week use, posted handling and US colour names",
});

const kakunoPenAddict = liveSource({
  key: "phase109-kakuno-penaddict-2022",
  registryKey: "penaddict-kakuno-phase109",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penaddict",
  title: "Pilot Kakuno Transparent Green Fountain Pen Review",
  url: "https://www.penaddict.com/blog/2022/6/20/pilot-kakuno-transparent-green-fountain-pen-review",
  author: "Jeff Abbott",
  publishedAt: "2022-06-22",
  summary:
    "透明绿样本由 JetPens 免费提供；顺滑、握感、耐用印象与 converter 观察均限于该样本。",
  locator:
    "live lines 902-931: author, transparent green sample, handling/writing observations and no-charge disclosure",
});

function body(key: ModelKey): string {
  const intros: Record<ModelKey, string> = {
    cavalier:
      "把 Cavalier 放在一排常见钢笔旁边，最先看到的不是装饰，而是它明显收窄的轮廓。现行 FCAN-5SR 最大直径只有 9.8 mm，黄铜轴帽把细杆做得有分量，却没有把它变成粗重礼品笔。它适合笔环、窄笔袋和需要快速取放的办公场景；但细并不天然等于人人舒适，手掌较大、习惯放松握持的人应先确认握位。",
    prera:
      "Prera 的识别点是短：现行基础款全长 120.4 mm，收在小笔袋和手帐旁边很自然。snap cap 合上时的动作和短平顶外形共同塑造了它的日常感。短身不等于传统意义上的 pocket pen，也不保证每只手都能长写；是否把笔帽套在尾端，会直接改变长度、重心和握持判断。",
    kakuno:
      "Kakuno 把“第一次拿钢笔”拆成可以看见的提示：较粗的树脂笔身、带方向感的握位、不会轻易滚走的外形，以及笔尖上的笑脸。笑脸最重要的作用不是卖萌，而是告诉使用者书写时让笔尖正面朝上。它是钢尖上的刻纹和方向提示，不是一枚可拆换的独立部件，更不是应当新建的图谱实体。",
    cocoon:
      "日本 Cocoon 的外形从两端向中部展开，黄铜轴帽带来 24 g 的重量和连续曲线。这里说的对象是 Pilot 日本目录中的 FCO-3SR，而不是把全球各地外观相近的 Metropolitan 或 MR 全部揉成一个 SKU。名字相邻、外观近似并不能自动推出内部供墨、包装和地区附件完全相同。",
  };
  const specifics: Record<ModelKey, string> = {
    cavalier:
      "Pilot 当前页面只列特殊 F 钢尖、四色与 CON-40。2011 年 Brian Gushikawa 的文章有很高的样本价值，因为作者首先说明那是一支修复到可写状态的二手笔。文章中的顺滑、平衡、线宽和 CON-20 只能帮助理解那支旧样本，不能替代 2026 年官网，也不能把作者对 CON-50、CON-70 的猜测写成兼容性结论。",
    prera:
      "基础实色款当前代码是 P-FPR-1，F/M 钢尖，附 CON-40。2025 年 3 月日本新闻稿列出红棕、米白、暖黄、深绿松石四种新色。透明的 Prera Iro-ai 是相邻 sibling，有自己的透明结构和 CM 等 SKU；它不是第五个 Phase 109 实体，也不能把透明轴或 CM 尖泛化给基础实色款。2011、2015 的 CON-20/CON-50 记录只是旧样本历史。",
    kakuno:
      "现行 FKA-1SR 页面列 EF、F、M，树脂轴帽，CON-40 与 CON-70N，尺寸 16×131 mm、11 g。英文说明书把笑脸朝上与 cartridge 安装、清洗、安全提示放在同一使用流程里。A Better Desk 的灰轴橙帽样本和 Pen Addict 的透明绿赠测样本可说明作者实际感受到的握位、snap cap 和写感，却不构成每一支都顺滑的保证。",
    cocoon:
      "日本现行 FCO-3SR 页面列 F/M、黄铜轴帽、树脂中间胴、CON-40、13.2×138 mm、24 g。2013 年 Well-Appointed Desk 收到的赠送样本配 CON-50，并以当时价格比较 Metropolitan；这些都要保留年份和样本属性。欧洲 MR 的 standard-international cartridge 体系属于另一地区商品边界，绝不能倒灌为日本 Cocoon 的 current compatibility。",
  };
  return `${intros[key]}}

## 结构与拿取

${specifics[key]} 规格表适合回答“它是什么”，却不能替代手的判断。直径、长度、重量只是可比较的锚点；笔帽是否套尾、握笔距离、纸面角度与书写时长都会改变体验。选择前应把日常动作想清楚：放在哪里、一次写多久、是否频繁开合、需不需要用瓶装墨水。对短笔或细杆笔，最好实际握一会儿，而不是只看正面照片。

## 供墨与第一次使用

当前兼容性只采用 2026-07-21 仍可读的 Pilot 官方目录和说明资料。安装 cartridge 时让笔尖朝上，直推到位后等待墨水进入 feed；使用 converter 时按对应说明吸墨，擦净握位和笔尖外侧。旧评测里出现的 CON-20 或 CON-50 是作者当年拿到的组件，不表示今天的日本在售包装，也不应覆盖现行 CON-40 或 CON-70N 说明。不同地区附件可能变化，购买时仍应以当地包装与 Pilot 支持信息为准。

更换颜色或出现供墨不畅时，先用清水处理 cartridge/converter 式钢笔的笔尖与 feed，完全排出旧墨，再装新墨。不要为了追求更大容量而把“能塞进去”“旧款曾经用过”当成官方兼容。墨水、密封和清洗习惯对启动表现的影响很大，单篇评测的顺滑或干湿感受只能代表作者那支笔、那种墨和那张纸。

## 笔尖、纸张与样本证据

这类 Pilot 日用钢尖的价值在稳定、容易理解和维护成本可控，而不是承诺柔软或变化线宽。F、M 或 EF 的字迹粗细必须和纸张、墨水、书写压力一起看。专业评测能补足官网不会描述的动作细节，例如开帽手感、套帽后的平衡、细杆或短身对特定手型的影响；但评测结论全部保留作者、日期、样本与赠测披露，不写成全系列必然表现。

写得细不等于 scratchy，写得顺也不等于没有反馈。使用者可以用自己常用的横线纸或方格纸试写连续中文、数字和快速记号，再判断是否合适。若样本需要调尖、曾维修或来源不明，更应把观察限制在该样本。Phase 109 不用旧评测修正官网 current specs，也不从零售页推导未公开的材料或兼容性。

## 清洁、携带与长期使用

日常携带时先确认笔帽完全扣合，避免把钢笔和钥匙、硬质金属件混放。黄铜涂装表面与透明树脂的划痕表现不同，本站示意图不承担颜色或表面复刻。长时间不用时先排空并清洗；再次启用时用熟悉、状态良好的 Pilot 钢笔墨水测试，比反复用力甩笔更安全。发现漏墨、松动或笔尖受撞击，应停止使用并交由合适的维修渠道检查。

一个可靠的日用选择并不意味着完全免维护。开帽频率、室温、纸屑与墨水沉积都会累积。把清洗周期和使用频率绑定比死守固定天数更实际：频繁换色时更勤清洗，长期使用同色且供墨稳定时无需过度拆卸。不要自行拔出 feed 或磨尖来解决尚未诊断的问题。

## 型号与地区边界

本条目的 canonical identity 只覆盖它在日本 Pilot 当前资料中的明确对象。相邻透明款、市场新色、地区 sibling 或钢尖刻纹都通过 variant、alias、scope 或正文解释，不额外制造重复型号。canonical route 用稳定英文 slug，旧中文 raw route 永久跳转到同一 entity ID；既有 made_by 关系保持原行、原 ID、原 target 和原 reason，不借内容发布重建拓扑。

这种边界让读者能从 Pilot 品牌页进入真实型号，又不会把“长得像”“曾经配过同一种 converter”误写成同一商品。后续若官方推出新 SKU，应新增带日期和市场的 scope，而不是悄悄改写旧评测。若其他地区使用不同名称或附件，也应单独记录地区证据，不反向污染日本 current spec。

## 适合谁，以及如何决定

如果你重视的是清楚的产品定位、可查的当前供墨、简单清洗和足够稳定的钢尖体验，这一型号值得进入候选。最终决定应基于手型、常写字幅、携带方式与当地实际包装。先确认官方 current SKU，再看独立作者与自己相近的使用动作，最后用实物试写；这个顺序比先被一条“神笔”评价说服更可靠。

本站把官方事实、独立样本和编辑判断分开：尺寸、材料、当前 converter 与 SKU 来自 Pilot；写感、握持和开帽动作来自具名作者的具体样本；场景建议是基于两类证据的编辑推论。这样既保留玩家经验，也不把十多年前的 CON-20／CON-50 或地区附件写成今天对所有市场都成立的产品承诺。`;
}

function specEvidence(
  key: ModelKey,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
) {
  return {
    key: `phase109-${key}-spec-${fieldKey}`,
    fieldKey,
    sourceKey,
    scopeKey,
    locator,
    qualifies,
  };
}

function makePack(key: ModelKey): CuratedEntityPack {
  const item = model[key];
  const currentScope = `phase109-${key}-current`;
  const sampleScope = `phase109-${key}-sample`;
  const sources: CuratedSource[] = [
    item.official,
    item.review,
    editorialSource(key, item.image),
  ];
  if (key === "prera") {
    sources.push(
      preraRelease,
      preraIroAi,
      preraHistory2011,
      preraParka,
      preraGentleman,
    );
  }
  if (key === "kakuno") sources.push(kakunoManual, kakunoPenAddict);
  const claims = [
    {
      key: `phase109-${key}-identity`,
      predicate: "model_identity",
      objectText: `${item.name} 的 current identity 和规格只由 Pilot 日本现行页面支撑。`,
      factClass: "core" as const,
      confidence: 0.99,
      sourceKey: item.official.key,
      locator: item.official.archiveLocator ?? "live official product locator",
      evidence: [
        {
          key: `phase109-${key}-identity-official`,
          sourceKey: item.official.key,
          scopeKey: currentScope,
          locator: item.official.archiveLocator ?? "live official product locator",
        },
      ],
    },
    {
      key: `phase109-${key}-sample-boundary`,
      predicate:
        key === "cavalier"
          ? "historical_repaired_sample"
          : "independent_sample_boundary",
      objectText:
        key === "cavalier"
          ? "2011 年样本是作者修复至可写状态的二手笔；CON-20 与写感不能支撑 current spec。"
          : `${item.review.author ?? "具名作者"} 的观察只属于有日期的具体样本，不能覆盖 current compatibility。`,
      factClass: "core" as const,
      confidence: 0.96,
      sourceKey: item.review.key,
      locator: item.review.archiveLocator ?? "live review locator",
      evidence: [
        {
          key: `phase109-${key}-sample-review`,
          sourceKey: item.review.key,
          scopeKey: sampleScope,
          locator: item.review.archiveLocator ?? "live review locator",
          note: "Historical or sample evidence does not qualify current specification fields.",
        },
      ],
    },
    {
      key: `phase109-${key}-current-fill`,
      predicate: "current_fill_system",
      objectText: item.current.fill_system,
      factClass: "core" as const,
      confidence: 0.99,
      sourceKey: item.official.key,
      locator: item.official.archiveLocator ?? "live official product locator",
      evidence: [
        {
          key: `phase109-${key}-current-fill-official`,
          sourceKey: item.official.key,
          scopeKey: currentScope,
          locator:
            item.official.archiveLocator ?? "live official product locator",
        },
      ],
    },
  ];
  if (key === "prera") {
    claims.push({
      key: "phase109-prera-variant-boundary",
      predicate: "variant_sibling_boundary",
      objectText:
        "2025 四种实色是带发布日期的 market_sku；Prera Iro-ai 是透明 sibling，不是第五个实体。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: preraRelease.key,
      locator: preraRelease.archiveLocator ?? "release locator",
      evidence: [
        {
          key: "phase109-prera-variant-release",
          sourceKey: preraRelease.key,
          scopeKey: currentScope,
          locator: preraRelease.archiveLocator ?? "release locator",
        },
      ],
    });
  }
  if (key === "kakuno") {
    claims.push({
      key: "phase109-kakuno-smiley-feature",
      predicate: "nib_orientation_feature",
      objectText:
        "笑脸刻纹用于提示书写时让笔尖正面朝上，只是 feature，不是实体或关系。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: kakunoManual.key,
      locator: kakunoManual.archiveLocator ?? "manual locator",
      evidence: [
        {
          key: "phase109-kakuno-smiley-manual",
          sourceKey: kakunoManual.key,
          scopeKey: currentScope,
          locator: kakunoManual.archiveLocator ?? "manual locator",
        },
      ],
    });
  }
  if (key === "cocoon") {
    claims.push({
      key: "phase109-cocoon-region-boundary",
      predicate: "regional_sibling_boundary",
      objectText:
        "Cocoon 以日本 FCO-3SR 为 canonical；Metropolitan/MR 是地区 sibling，欧洲 standard-international 不进入 current Japanese claim。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: item.official.key,
      locator: item.official.archiveLocator ?? "official locator",
      evidence: [
        {
          key: "phase109-cocoon-region-official",
          sourceKey: item.official.key,
          scopeKey: currentScope,
          locator: item.official.archiveLocator ?? "official locator",
        },
      ],
    });
  }
  const values = item.current;
  const evidence = (
    ["brand_entity_id", ...Object.keys(values)] as SpecFieldKey[]
  ).map((fieldKey) =>
    specEvidence(
      key,
      fieldKey,
      item.official.key,
      currentScope,
      item.official.archiveLocator ?? "live official product locator",
    ),
  );
  return {
    key: `phase109-pilot-${key}-v1`,
    entityId: item.id,
    expectedType: "pen",
    expectedSlug: item.slug,
    canonicalName: item.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: `${CONTENT_DIR}/${key}.md`,
    storyTitle: `${item.name}：current 规格、样本经验与身份边界`,
    primarySourceKey: item.official.key,
    depthTier: "A",
    aliases: [
      {
        alias: item.name.replace("百乐 ", ""),
        language: "en",
        sourceKey: item.official.key,
      },
      {
        alias: item.japanese,
        language: "ja",
        sourceKey: item.official.key,
      },
      ...(key === "cocoon"
        ? [
            {
              alias: "Pilot Metropolitan / MR (regional sibling, not Japanese SKU)",
              language: "en",
              kind: "regional_name" as const,
              market: "outside Japan; sibling boundary only",
              sourceKey: item.review.key,
            },
          ]
        : []),
    ],
    sources,
    scopes: [
      {
        key: currentScope,
        scopeKey: currentScope,
        market: "Japan/current official catalog",
        productionState: "current",
        nibScope: values.nib,
        materialScope: values.material,
        editionScope: values.fill_system,
      },
      {
        key: sampleScope,
        scopeKey:
          key === "cavalier"
            ? "historical_repaired_sample"
            : key === "cocoon"
              ? "historical_sample_2013"
              : "dated_professional_sample",
        market: "review author's sample",
        productionState: "historical",
        editionScope:
          "CON-20/CON-50, price and subjective experience are sample history; not current compatibility.",
      },
    ],
    claims,
    variants:
      key === "prera"
        ? [
            ...["Red Brown", "Off White", "Warm Yellow", "Dark Turquoise"].map(
              (name, index) => ({
                key: `phase109-prera-2025-${index}`,
                name: `2025 ${name}`,
                releaseYear: "2025",
                notes:
                  "Japan-market solid-colour release; base Prera scope; not Iro-ai.",
                sourceKey: preraRelease.key,
                variantKind: "market_sku" as const,
                market: "Japan",
              }),
            ),
            {
              key: "phase109-prera-iroai-sibling",
              name: "Prera Iro-ai transparent sibling",
              notes:
                "Transparent adjacent family with its own F/M/CM SKUs; not a Phase 109 entity and not generalized to base Prera.",
              sourceKey: preraIroAi.key,
              variantKind: "variant",
              market: "Japan",
            },
          ]
        : [
            {
              key: `phase109-${key}-current-family`,
              name: values.series_name,
              notes: "Current Japan-market family verified at retrieval.",
              sourceKey: item.official.key,
              variantKind: "market_sku",
              market: "Japan",
            },
          ],
    spec: {
      brandEntityId: PHASE109_PILOT_ID,
      values,
      evidence,
    },
    timeline: [
      {
        key: `phase109-${key}-current-verified`,
        title: "Current official scope verified",
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description:
          "Live Pilot catalog and applicable support material were reopened; old converter claims remain historical only.",
        sourceKey: item.official.key,
      },
    ],
    media: [
      {
        key: `phase109-${key}-primary`,
        title: `${item.name} 本站原创事实示意图（非产品照片）`,
        sourceKey: `phase109-${key}-diagram`,
        localPath: item.image,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创示意图，非产品照片；非比例、非颜色或表面复刻；不含 Pilot Logo。",
        sourceUrl: item.image,
        usageStatus: "primary",
      },
    ],
  };
}

export const phase109PilotCavalierPack = makePack("cavalier");
export const phase109PilotPreraPack = makePack("prera");
export const phase109PilotKakunoPack = makePack("kakuno");
export const phase109PilotCocoonPack = makePack("cocoon");

export const phase109PilotDailyPacks = [
  phase109PilotCavalierPack,
  phase109PilotPreraPack,
  phase109PilotKakunoPack,
  phase109PilotCocoonPack,
];

export function loadPhase109PilotDailyPacks(
  ownedRoot: string,
): LoadedCuratedEntityPack[] {
  const contentRoot = path.join(ownedRoot, CONTENT_DIR);
  fs.mkdirSync(contentRoot, { recursive: true });
  for (const key of Object.keys(model) as ModelKey[]) {
    const item = model[key];
    const markdown = `# ${item.name}

## summary

${item.summary}

## model_specs

\`\`\`json
${JSON.stringify(item.current, null, 2)}
\`\`\`

## body_md

${body(key)}

## 来源

来源由 CuratedEntityPack 的 source items、locators 与 scope evidence 管理。
`;
    fs.writeFileSync(path.join(contentRoot, `${key}.md`), markdown, "utf8");
  }
  return phase109PilotDailyPacks.map((pack) =>
    loadCuratedEntityPack(ownedRoot, pack),
  );
}
