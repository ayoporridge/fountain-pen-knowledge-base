import fs from "node:fs";
import path from "node:path";
import type { CuratedEntityPack, CuratedSource, CuratedSpecEvidence, LoadedCuratedEntityPack, SpecFieldKey } from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE110_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE110_JUSTUS_ID = "phase110-pilot-justus-95";
export const PHASE110_SILVERN_ID = "phase110-pilot-silvern";
export const PHASE110_GRANCE_ID = "phase110-pilot-grance";
export const PHASE110_JUSTUS_SLUG = "pilot-justus-95";
export const PHASE110_SILVERN_SLUG = "pilot-silvern";
export const PHASE110_GRANCE_SLUG = "pilot-grance";

const RETRIEVED = "2026-07-21";
const CONTENT_DIR = "phase110-content";
type Key = "justus" | "silvern" | "grance";

function source(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator"> & { locator: string }): CuratedSource {
  const { locator, ...rest } = input;
  return {
    ...rest,
    homepageUrl: new URL(rest.url).origin,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: rest.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};http=200;readable=true;external_archive=false;locator=${locator}`,
  };
}

function diagram(key: Key, localPath: string): CuratedSource {
  return {
    key: `phase110-${key}-diagram`, registryKey: `fpg-phase110-${key}`, registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission", tier: "primary", independenceGroup: `fpg-editorial-phase110-${key}`,
    title: `Pilot ${key} 本站原创事实示意图`, url: localPath, homepageUrl: "/", itemType: "image",
    author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED,
    summary: "本站原创事实示意图；非产品照片、非比例、非颜色或表面复刻。", allowedUse: "store_full",
    license: "site-original", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;dimensions=1600x900`,
  };
}

const warrantyIndex = source({
  key: "phase110-pilot-warranty-index", registryKey: "pilot-warranty-phase110", registryName: "PILOT International Warranty",
  sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "Fountain Pens Products covered by the warranty | PILOT",
  url: "https://www.pilot.co.jp/support/warranty/en/fountain/index.html", summary: "官方当前保修目录同时列出 Justus 95、Silvern 与 GRANCE 的对应产品号。",
  locator: "live covered-products list: Justus 95 FJ-3MR/FJ-3MRR; Silvern FK-5MS; GRANCE FGRC-12SR",
});

const catalogPdf = source({
  key: "phase110-pilot-current-catalog-pdf", registryKey: "pilot-catalog-phase110", registryName: "PILOT current web catalog PDF",
  sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "PILOT 万年筆 current catalog pages",
  url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016469&volumeName=00004", itemType: "pdf",
  summary: "当前目录 PDF 为 Silvern 等现行产品提供产品号、材料、供墨、尺寸、重量与标准纹样。",
  locator: "live PDF page 24; Silvern FK-5MS rows 57-76; current catalog edition served 2026-07-21",
});

const model = {
  justus: {
    id: PHASE110_JUSTUS_ID, slug: PHASE110_JUSTUS_SLUG, name: "百乐 Pilot Justus 95", image: "/images/library/site-original/phase110/pilot/pilot-justus-95.svg",
    summary: "Pilot Justus 95 以 H/S 控制器改变笔尖张力与书写感；本页只按 FJ-3MR/FJ-3MRR、CON-70N 与具体评测样本描述，不把可调弹性写成传统 flex 保证。",
    official: source({ key: "phase110-justus-warranty", registryKey: "pilot-justus-warranty-phase110", registryName: "PILOT International Warranty", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "Justus | International Warranty | PILOT", url: "https://www.pilot.co.jp/support/warranty/en/fountain/justus95.html", summary: "官方列出 FJ-3MR/FJ-3MRR，并说明 H 更硬、S 更软及 CON-70N/CON-40 操作。", locator: "live lines 15-69: FJ-3MR/FJ-3MRR, H/S adjustment and CON-70N/CON-40 instructions" }),
    catalog: source({ key: "phase110-justus-catalog", registryKey: "pilot-catalog-phase110-justus", registryName: "PILOT web catalog", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "FJ-3MR-SB-F｜ジャスタス95｜PILOTウェブカタログ", url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000295&volumeName=00004", summary: "目录列出 FJ-3MR、F/FM/M、树脂 engine-turn 轴帽、CON-70N、尺寸重量与两种纹理。", locator: "live product identity and catalog PDF: FJ-3MR, F/FM/M, 16 x 148 mm, 27 g, stripe/net black" }),
    reviews: [
      source({ key: "phase110-justus-tim", registryKey: "timhofmann-justus-phase110", registryName: "Tim Hofmann", sourceType: "blog", tier: "professional_secondary", independenceGroup: "timhofmann", title: "The Pilot Justus 95, which I like. A pen review.", url: "https://timhofmann.org/justus-95/", author: "Tim Hofmann", publishedAt: "2019-01-18", summary: "作者披露早期借测归还、后来自己购买；大尺寸、M 尖、偏湿与常用 S 只属于其个人笔。", locator: "live lines 13-33: author/date, loan-return then later purchase, own M nib, size, S preference and CON-70" }),
      source({ key: "phase110-justus-scrively", registryKey: "scrively-justus-phase110", registryName: "Scrively", sourceType: "blog", tier: "professional_secondary", independenceGroup: "scrively", title: "Video-Review: Pilot Justus 95", url: "https://scrively.org/video-review-pilot-justus-95/", author: "Scrively", publishedAt: "2019-08-29", summary: "视频页的 quick facts 记录其欧洲样本、树脂纹理、14K F/M 与可调弹性，均作为样本观察。", locator: "live lines 38-55: publication date and sample quick facts" }),
      source({ key: "phase110-justus-pencilcase", registryKey: "pencilcase-justus-phase110", registryName: "The Pencilcase Blog / FPN mirror", sourceType: "forum", tier: "professional_secondary", independenceGroup: "pencilcase", title: "Pilot Justus 95 Review", url: "https://www.fountainpennetwork.com/forum/topic/275990-pilot-justus-95-review/", author: "Dries / The Pencilcase Blog", publishedAt: "2014-10-12", summary: "作者的 M 尖样本用于记录尺寸、平衡、反馈与有限线宽变化；不作为 current SKU authority。", locator: "live search-accessible review body; direct page returned 403 on 2026-07-21, retained only as independently readable indexed review metadata and sample scope" }),
    ],
    current: { series_name: "Pilot Justus 95 / FJ-3MR and FJ-3MRR", release_year: "2013 revival; current catalog verified 2026-07-21", origin_country: "Pilot Japan catalog", nib: "14K F, FM or M with H/S tension controller", fill_system: "Pilot cartridge; supplied CON-70N; CON-40 compatible", material: "resin barrel and cap with engine-turned pattern", dimensions: "maximum diameter 16.0 mm; length 148 mm", weight: "27.0 g", price_range: "JPY 69,300 incl. tax at retrieval", status: "current official catalog" },
  },
  silvern: {
    id: PHASE110_SILVERN_ID, slug: PHASE110_SILVERN_SLUG, name: "百乐 Pilot Silvern", image: "/images/library/site-original/phase110/pilot/pilot-silvern.svg",
    summary: "Pilot Silvern FK-5MS 以 sterling silver 外壳、18K inset nib 与格子／つむぎ／石だたみ三种现行标准纹样为核心；Jaguar 等特殊版仅保留在独立样本范围。",
    official: source({ key: "phase110-silvern-catalog", registryKey: "pilot-catalog-phase110-silvern", registryName: "PILOT web catalog", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "FK-5MS-KO-F｜シルバーン｜PILOTウェブカタログ", url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000300&volumeName=00004", summary: "当前页给出 FK-5MS、18K F/M、sterling silver、CON-40、尺寸重量及三种标准纹样。", locator: "live lines 21-70: FK-5MS, 18K F/M, sterling silver, CON-40, 14 x 142.5 mm, 37 g, KO/TU/ID lineup" }),
    catalog: catalogPdf,
    reviews: [source({ key: "phase110-silvern-penaddict", registryKey: "penaddict-silvern-phase110", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", independenceGroup: "penaddict", title: "Pilot Silvern Fountain Pen Review", url: "https://www.penaddict.com/blog/2024/12/9/pilot-silvern-fountain-pen-review", author: "Brad Dowdy", publishedAt: "2024-12-09", summary: "Chatterly Luxuries 借出的 Jaguar 样本；图案、550 枚说法、价格、平衡与写感均不推广为 2026 标准款。", locator: "live lines 924-942: inset nib, Jaguar/Dragon/Turtle discussion, limited-edition claim, loan disclosure, author/date" })],
    current: { series_name: "Pilot Silvern / FK-5MS standard family", release_year: "current catalog verified 2026-07-21", origin_country: "Pilot Japan catalog", nib: "18K inset nib, F or M", fill_system: "Pilot cartridge or supplied CON-40", material: "sterling silver barrel and cap; etched and blackened recesses", dimensions: "maximum diameter 14.0 mm; length 142.5 mm", weight: "37.0 g", price_range: "JPY 132,000 incl. tax at retrieval", status: "current standard patterns: 格子, つむぎ, 石だたみ" },
  },
  grance: {
    id: PHASE110_GRANCE_ID, slug: PHASE110_GRANCE_SLUG, name: "百乐 Pilot Grance", image: "/images/library/site-original/phase110/pilot/pilot-grance.svg",
    summary: "Pilot Grance FGRC-12SR 是 14K No.3、CON-40 的现行细身黄铜系列；本页把当前珠光／黑／深蓝 variants 与旧 sterling、marbled 家族及评测样本分开。",
    official: source({ key: "phase110-grance-catalog", registryKey: "pilot-catalog-phase110-grance", registryName: "PILOT web catalog", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "FGRC-12SR-BM｜グランセ｜PILOTウェブカタログ", url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000289&volumeName=00004", summary: "当前页给出 FGRC-12SR、14K 3号 EF/F/FM/M、黄铜、CON-40、尺寸重量与现行颜色。", locator: "live product page lines 21-94: FGRC-12SR, 14K No.3, brass, CON-40, 11.5 x 136 mm, 25.3 g and current lineup" }),
    catalog: source({ key: "phase110-grance-warranty", registryKey: "pilot-grance-warranty-phase110", registryName: "PILOT International Warranty", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "GRANCE | International Warranty | PILOT", url: "https://www.pilot.co.jp/support/warranty/en-au/fountain/grance_2.html", summary: "官方保修页锁定 FGRC-12SR 并说明 CON-40 旋转式 converter 的使用。", locator: "live page: GRANCE FGRC-12SR and rotation type CON-40 instructions" }),
    reviews: [
      source({ key: "phase110-grance-penaddict", registryKey: "penaddict-grance-phase110", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", independenceGroup: "penaddict", title: "Pilot Grance Fountain Pen Review", url: "https://www.penaddict.com/blog/2018/8/22/pilot-grance-fountain-pen-review", author: "Jeff Abbott", publishedAt: "2018-08-22", summary: "JetPens 免费提供的 pearl sample；作者的 FM、cap、clip、握持和写感观察只属于该样本与当时市场。", locator: "live lines 910-941: sample handling and writing observations; lines 932-934 variants and no-charge disclosure" }),
      source({ key: "phase110-grance-wad", registryKey: "wad-grance-phase110", registryName: "The Well-Appointed Desk", sourceType: "blog", tier: "professional_secondary", independenceGroup: "well-appointed-desk", title: "Pen Review: Pilot Grance", url: "https://www.wellappointeddesk.com/2019/01/pen-review-pilot-grance/", author: "Jessica Coles", publishedAt: "2019-01-31", summary: "JetPens 免费提供的评测样本；25 g、9.5 mm grip、套帽平衡、包装与柔软写感均作为该样本记录。", locator: "live lines 35-69 plus disclosure: named author/sample, measured grip/weight, posting, nib and packaging" }),
    ],
    current: { series_name: "Pilot Grance / FGRC-12SR", release_year: "current catalog verified 2026-07-21", origin_country: "Pilot Japan catalog", nib: "14K No.3, EF/F/FM/M depending on colour", fill_system: "Pilot cartridge or CON-40", material: "painted brass barrel and cap", dimensions: "maximum diameter 11.5 mm; length 136 mm", weight: "25.3 g", price_range: "JPY 33,000 incl. tax at retrieval", status: "current FGRC-12SR; historical sterling/marbled Grance excluded" },
  },
} as const;

export const PHASE110_IDENTITY_MARKERS = {
  justus: { id: PHASE110_JUSTUS_ID, slug: PHASE110_JUSTUS_SLUG, names: ["Justus 95", "Pilot Justus 95", "百乐 Pilot Justus 95"], skus: ["FJ-3MR", "FJ-3MRR"], officialUrls: [model.justus.official.url, model.justus.catalog.url] },
  silvern: { id: PHASE110_SILVERN_ID, slug: PHASE110_SILVERN_SLUG, names: ["Silvern", "Pilot Silvern", "百乐 Pilot Silvern"], skus: ["FK-5MS"], officialUrls: [model.silvern.official.url] },
  grance: { id: PHASE110_GRANCE_ID, slug: PHASE110_GRANCE_SLUG, names: ["Grance", "Pilot Grance", "百乐 Pilot Grance"], skus: ["FGRC-12SR"], officialUrls: [model.grance.official.url, model.grance.catalog.url] },
} as const;

const sharedEditorial = `这不是一张把所有 Pilot 金尖都摊平比较的参数表。canonical 页面首先回答“眼前这支笔究竟是哪一个产品号、哪个时间层、哪些事实可以跨样本复用”。官方目录负责当前 identity、材料、笔尖、供墨与 variants；独立作者只负责自己实际接触的那一支。二者放在同一页，但证据角色不能互换。\n\n阅读这类页面时，最容易发生的误会，是把一个作者对某支样本的舒服、偏湿、弹或平衡，悄悄升级为整个系列的保证。钢笔的尖宽、墨水、纸张、调校、握姿与年代都会改变体验。因此本文保留作者、日期、样本来源与具体尖宽，主观句始终留在 sample scope；购买前仍应核对目标 SKU，并在可能时试写。\n\n## 如何核对你面前的那一支\n\n先抄下轴帽、保修卡或盒标上的完整产品号，再核对笔尖宽度、颜色或纹样后缀。只有名称相同而产品号不同，可能意味着地区 sibling、历史家族或特殊版；只有外观相近，也不能借用另一型号的 converter、材料和尺寸。官网目录说明“当前有哪些”，保修页说明对应身份和操作，专业评测则帮助提出试写问题。三类证据应当并列检查，而不是挑一个最顺眼的答案。\n\n价格同样需要时态。页面保存的是执行日可核验的官方建议零售价或评测当年的成交语境，不承诺今天仍能以该价格购得。二手市场还要加入笔尖是否调校、银件是否抛光、converter 是否原配、盒证是否对应等条件。把这些成本写清楚，比用一句“值得”替读者做决定更诚实。\n\n## 维护信息也要跟着型号走\n\n清洗、装 cartridge 或 converter 时，应优先使用该型号当前官方说明。不同 Pilot 系列能够装入的 converter、随盒附带的配件和地区包装并不总相同；评测作者多年前拿到的盒装内容，也不能覆盖今天的官网。清洗后让笔尖自然干燥，遇到旋钮、嵌入式尖、银壳或 snap cap 异常时，不把相邻型号的拆解经验直接套用。需要维修时保存购买凭证，并向所在地服务渠道确认保修条件。\n\n把维护边界放进正文不是为了增加“说明书感”，而是防止型号混写造成真实成本：买错 converter、过度抛光银件、把异常阻力当成可调机构特性，都会比参数表上的一处小错更昂贵。页面因此把操作事实和体验证词分开，读者可以沿 source locator 回到原页复核。\n\n## 页面没有替你保证什么\n\n即使官方字段完全相同，两支实体笔仍可能因制造公差、使用磨损和后期处理而不同。本文不保证顺滑度、湿度、弹性幅度、套帽平衡或长写舒适度，也不把一个作者的偏好合成为“玩家共识”。结构化 scope 的意义正是让读者看到：哪一句来自当前官方，哪一句来自某年某支样本，以及哪些相邻家族被明确排除。\n\n本站主图也是事实导航，不是商品照片。它只把当前结构和排除项放在一张图里，帮助读者先看清边界；它不复刻商标、颜色、纹路、尺寸比例或表面质感，不能代替官网图与实物检查。`;

function body(key: Key): string {
  if (key === "justus") return `## 一支把“手感”做成机械动作的笔\n\nJustus 95 最值得单独建页的地方，不是黑色树脂和金夹，而是握位前端那圈 H/S controller。Pilot 的用词很克制：转向 H，pen touch 变硬；转向 S，pen touch 变软。当前目录进一步说明 control plate 会前后滑动，改变笔尖弾力。也就是说，旋钮调的是支撑和书写张力，不是把一枚普通尖瞬间变成传统 dip nib 式 flex。\n\n## 当前 identity\n\n本页只认 FJ-3MR 与英文保修目录仍列出的 FJ-3MRR。现行日本目录列 F、FM、M，树脂轴帽和 engine-turned 的 Stripe Black／Net Black，最大径 16.0 mm、全长 148 mm、27.0 g。官方供墨说明以随附 CON-70N 为主，同时列 CON-40 compatible。2013 是 Justus 95 复兴进入当前谱系的时间锚，不把早期原版 Justus 自动并进来。\n\n## H 与 S 到底改变什么\n\n控制片靠近笔尖时提供更多支撑，书写感趋硬；退开时允许更多弹性，书写感趋软。这会影响下笔反馈、流量感受和部分使用者观察到的线条变化，但官方没有承诺任意压力、任意尖宽都产生固定幅度的 line variation。把 H/S 写成“软硬和张力调节”比一句“可调 flex”更准确，也更保护笔尖：它不是鼓励压尖的许可证。\n\n## 三个样本，三种证词\n\nTim Hofmann 2019 年写得很清楚：他早年收到 Dan Smith 借出的评测笔，归还后一直想念，后来才买到自己的笔。他那支是 M 尖，常放在 S，配 CON-70，偏湿、大尺寸和“像权杖”的愉悦属于他的自购样本。Scrively 的 2019 视频页列出欧洲可见样本、树脂纹理、14K F/M 和 adjustable semi-flex，但这仍是作者用来描述该样本的语言。Pencilcase 的 2014 M 尖记录了尺寸、配重、反馈与有限线宽变化；页面在本次核验中 direct fetch 返回 403，因此只保留可审计的 indexed review metadata 与样本边界，不让它承担 current spec。\n\n## 使用与购买检查\n\n第一次装 cartridge 要直插，不要旋拧；使用 CON-70N 时按官方步骤垂直浸入并按压数次。转 controller 时扶住握位，不要拿轴身硬拧。二手购买要检查旋钮是否顺畅、control plate 是否异常刮擦笔尖、尖是否被过度施压。想要明显书法式粗细变化的人，应把试写放在型号名之前；想要一支大尺寸 Pilot、希望在较稳和较弹之间改变反馈的人，才是更清楚的目标。\n\n${sharedEditorial}`;
  if (key === "silvern") return `## 银不是颜色，而是这条产品线的结构\n\nSilvern 的 canonical 边界从 FK-5MS 开始。Pilot 当前目录写的是 sterling silver 轴与帽，表面以蚀刻和凹部黑色处理形成纹样；握位前端是一枚 18K inset nib。它与普通树脂 Custom 的区别不是“银色 finish”，而是银壳、嵌入式尖和传统纹样共同构成的产品身份。\n\n## 2026 当前标准款\n\n执行日官网列出三组标准纹样：格子 KO、つむぎ TU、石だたみ ID；每组提供 F 与 M。规格是最大径 14.0 mm、全长 142.5 mm、37.0 g，供墨为 cartridge 或随附 CON-40。当前价格与库存会变，本文只记录本次目录读取时的 132,000 日元建议零售价，不把它当成全球成交价。\n\n## 为什么 Jaguar 必须单独放\n\nBrad Dowdy 在 2024 年评测的是 Chatterly Luxuries 借出的 Jaguar。文章谈到外部动物纹样、18K inset nib、价格、平衡与写感，也提到 Dragon、Turtle 以及过去的 Pokémon；这些都是理解 Silvern 特别版生态的有用材料，但不能反向证明 2026 日本标准目录仍把 Jaguar 列为常规 FK-5MS variant。文章里的 550 枚和美元价格也只属于当时特殊样本语境。\n\n因此本页的 variants 表只放 KO／TU／ID 的 F/M 组合。Jaguar 进入 special_sample_2024_jaguar scope；Dragon、Turtle、Pokémon 只作为“存在过其它 special editions”的边界提示，不创建 Phase 110 entity，不变成 alias，也不借其图案替代 current standard media。\n\n## 摸到实物时看什么\n\nSterling silver 会随时间产生氧化与使用痕迹，这不同于树脂表面的“掉漆”。目录要求的软布维护应与卖家的抛光历史一起询问，因为过度处理可能改变凹部黑化和细纹表现。37 g 是官方整笔重量，但手感还受到握位直径、套帽与个人持笔点影响。独立评测可提醒你关注平衡，不能替你判断自己的手。\n\n嵌入式尖是视觉和结构焦点，却不意味着所有 Silvern 都写成同一种宽度。当前标准款只有 F/M；特别版样本、不同地区库存与二手笔的调校都可能不同。购买时应把完整后缀、尖宽、纹样和照片逐项对上，而不是只看到“Silvern”就假定是本页某一标准 SKU。\n\n${sharedEditorial}`;
  return `## 现行 Grance 是一个具体系列，不是所有旧 Grance 的总篮子\n\n当前 canonical 锁定 FGRC-12SR。Pilot 目录给它 14K No.3 nib、黄铜轴帽、snap cap 与 CON-40，定位是细身而正式的现行万年笔。页面不会把旧 sterling、marbled 或其它历史 Grance 家族塞进同一 variants 表，也不会借 Cavalier、Metropolitan 的规格来填空。\n\n## 当前 variants\n\n珠光粉、珠光蓝、珠光白提供 EF/F/FM/M；黑与深蓝在当前目录列 F/M。共同规格是最大径 11.5 mm、全长 136 mm、25.3 g。官方目录是这些字段的 authority；保修页再确认 FGRC-12SR 与 CON-40 的旋转吸墨步骤。某个地区商店当下缺色，不等于 Pilot canonical family 已经改变。\n\n## 2018 与 2019 两支样本怎么读\n\nJeff Abbott 的 The Pen Addict 评测披露样本由 JetPens 免费提供。他写的是 pearl family 中一支 FM：细轴、snap cap、夹子、握位、连续书写与顺滑度都很具体，但仍只属于那支笔和当时北美销售语境。Jessica Coles 在 The Well-Appointed Desk 的 2019 文章同样披露 JetPens 免费提供样本；她记录 9.5 mm grip、约 25 g、套帽后更合手、包装里没有 converter，以及自己感受到的柔软和弹性。\n\n这些数字与官网 25.3 g 可以互相照明，却不能混成一套“人人如此”的保证。例如 9.5 mm 是作者对 grip 的记录，不覆盖官网的最大径；包装是否含 converter 受地区与年代影响，不推翻当前日本目录的 compatible converter 字段；作者的顺滑、柔软和更适合套帽是 sample experience，不是出厂逐支承诺。\n\n## 历史家族边界\n\nGrance 名称曾出现在 sterling、marbled 及其他设计上。它们可以在将来的历史实体中获得自己的时间、材料与型号证据，本页只把它们标作 historical-family boundary。它们不是 FGRC-12SR alias，不进入 current colours，也不能用旧家族照片当主图。这样处理，读者从品牌页点入时看到的是现在可核对的产品，而不是跨年代拼装的“Grance 印象”。\n\n## 使用前的现实检查\n\n细轴是否舒服高度依赖握姿；建议试写时分别测试不套帽和套帽、快速记字和较长段落。CON-40 容量与操作感是另一项个人取舍，装入时按官方说明直插 cartridge 或旋转 converter，不从旧评测推断包装一定随附。二手笔则核对完整 FGRC-12SR 后缀、尖宽和颜色，并询问是否调尖。\n\n${sharedEditorial}`;
}

function makePack(key: Key): CuratedEntityPack {
  const item = model[key];
  const currentScope = `phase110-${key}-current`;
  const sampleScope = key === "silvern" ? "special_sample_2024_jaguar" : `phase110-${key}-independent-samples`;
  const sources = [warrantyIndex, item.official, item.catalog, ...item.reviews, diagram(key, item.image)];
  const values = item.current;
  const evidence: CuratedSpecEvidence[] = (Object.keys(values) as Exclude<SpecFieldKey, "brand_entity_id">[]).map((fieldKey, index) => ({ key: `phase110-${key}-spec-${index}`, fieldKey, sourceKey: fieldKey === "series_name" ? warrantyIndex.key : item.official.key, scopeKey: currentScope, locator: item.official.archiveLocator ?? "live official product page" }));
  evidence.unshift({ key: `phase110-${key}-spec-brand`, fieldKey: "brand_entity_id", sourceKey: warrantyIndex.key, scopeKey: currentScope, locator: warrantyIndex.archiveLocator ?? "PILOT official warranty index" });
  const baseVariants = key === "justus"
    ? [{ name: "FJ-3MR Stripe Black / F-FM-M", code: "FJ-3MR" }, { name: "FJ-3MRR current international identity", code: "FJ-3MRR" }]
    : key === "silvern"
      ? [{ name: "FK-5MS KO 格子 / F-M", code: "FK-5MS" }, { name: "FK-5MS TU つむぎ / F-M", code: "FK-5MS" }, { name: "FK-5MS ID 石だたみ / F-M", code: "FK-5MS" }]
      : [{ name: "FGRC-12SR pearl / EF-F-FM-M", code: "FGRC-12SR" }, { name: "FGRC-12SR black-dark blue / F-M", code: "FGRC-12SR" }];
  return {
    key: `phase110-pilot-${key}`, entityId: item.id, expectedType: "pen", expectedSlug: item.slug, canonicalName: item.name,
    publicationIntent: "publish", markdownFile: `${CONTENT_DIR}/${key}.md`, storyTitle: `${item.name}：当前型号、来源与样本边界`, primarySourceKey: item.official.key, depthTier: "A",
    aliases: [{ alias: item.name.replace("百乐 ", ""), language: "en", sourceKey: item.official.key }], sources,
    scopes: [{ key: currentScope, scopeKey: currentScope, market: "Japan / international warranty", validFrom: RETRIEVED, productionState: "current", nibScope: values.nib, materialScope: values.material }, { key: sampleScope, scopeKey: sampleScope, productionState: "historical", editionScope: key === "silvern" ? "2024 loaned Jaguar special sample; excluded from current standard variants" : "named independent review samples only" }, ...(key === "grance" ? [{ key: "phase110-grance-historical-family", scopeKey: "historical_family_boundary", productionState: "historical" as const, editionScope: "sterling, marbled and other earlier Grance families; excluded from FGRC-12SR" }] : [])],
    claims: [
      { key: `phase110-${key}-identity`, predicate: "has_current_identity", objectText: values.series_name, factClass: "core", confidence: 1, sourceKey: item.official.key, locator: item.official.archiveLocator ?? "official page", evidence: [{ key: `phase110-${key}-identity-ev`, sourceKey: item.official.key, locator: item.official.archiveLocator ?? "official page", scopeKey: currentScope }] },
      { key: `phase110-${key}-boundary`, predicate: "keeps_sample_boundary", objectText: key === "justus" ? "H/S changes tension and feel; no traditional-flex guarantee" : key === "silvern" ? "Jaguar loaned sample and other special editions excluded from current standard variants" : "gifted review samples and historical sterling/marbled families excluded from current FGRC-12SR", factClass: "core", confidence: 1, sourceKey: item.reviews[0].key, locator: item.reviews[0].archiveLocator ?? "review", evidence: [{ key: `phase110-${key}-boundary-ev`, sourceKey: item.reviews[0].key, locator: item.reviews[0].archiveLocator ?? "review", scopeKey: sampleScope }] },
    ],
    variants: baseVariants.map((variant, index) => ({ key: `phase110-${key}-variant-${index}`, name: variant.name, notes: `Locked product code ${variant.code}; current official scope only.`, sourceKey: item.official.key, variantKind: "market_sku" as const, productCode: variant.code, market: "Japan" })),
    spec: { brandEntityId: PHASE110_PILOT_ID, values, evidence },
    timeline: [{ key: `phase110-${key}-verified`, title: "Current official scope live-verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Official identity and independent sample disclosures reopened before reviewed copy was written.", sourceKey: item.official.key }],
    media: [{ key: `phase110-${key}-primary`, title: `${item.name} 本站原创事实示意图（非产品照片）`, sourceKey: `phase110-${key}-diagram`, localPath: item.image, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创示意图；非产品照片；非比例、颜色或表面复刻；不含 Pilot Logo。", sourceUrl: item.image, usageStatus: "primary" }],
  };
}

export const phase110PilotPacks = (["justus", "silvern", "grance"] as const).map(makePack);

export function loadPhase110PilotPacks(ownedRoot: string): LoadedCuratedEntityPack[] {
  const contentRoot = path.join(ownedRoot, CONTENT_DIR);
  fs.mkdirSync(contentRoot, { recursive: true });
  for (const key of Object.keys(model) as Key[]) {
    const item = model[key];
    const markdown = `# ${item.name}\n\n## summary\n\n${item.summary}\n\n## model_specs\n\n\`\`\`json\n${JSON.stringify(item.current, null, 2)}\n\`\`\`\n\n## body_md\n\n${body(key)}\n\n## 来源\n\n来源由 CuratedEntityPack 的 source items、locators、scope 与 evidence 管理。\n`;
    fs.writeFileSync(path.join(contentRoot, `${key}.md`), markdown, "utf8");
  }
  const loaded = phase110PilotPacks.map((pack) => loadCuratedEntityPack(ownedRoot, pack));
  for (const pack of loaded) {
    if ([...pack.bodyMd].length < 2000) throw new Error(`${pack.key} body_md must contain at least 2,000 Unicode characters.`);
  }
  return loaded;
}
