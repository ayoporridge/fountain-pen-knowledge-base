import fs from "node:fs";
import path from "node:path";
import type { CuratedEntityPack, CuratedSource, CuratedSpecEvidence, LoadedCuratedEntityPack, SpecFieldKey } from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE111_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE111_ELABO_METAL_ID = "phase111-pilot-elabo-metal-fe-25sr";
export const PHASE111_ELABO_RESIN_ID = "phase111-pilot-elabo-resin-fe-18sr";
export const PHASE111_CUSTOM_NS_ID = "phase111-pilot-custom-ns";
export const PHASE111_LIGHTIVE_ID = "phase111-pilot-lightive";
export const PHASE111_ELABO_METAL_SLUG = "pilot-elabo-metal-fe-25sr";
export const PHASE111_ELABO_RESIN_SLUG = "pilot-elabo-resin-fe-18sr";
export const PHASE111_CUSTOM_NS_SLUG = "pilot-custom-ns";
export const PHASE111_LIGHTIVE_SLUG = "pilot-lightive";

const RETRIEVED = "2026-07-21";
const CONTENT_DIR = "phase111-content";
type Key = "metal" | "resin" | "customNs" | "lightive";

function source(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator"> & { locator: string; archiveStatus?: string }): CuratedSource {
  const { locator, archiveStatus = "http=200;readable=true", ...rest } = input;
  return { ...rest, homepageUrl: new URL(rest.url).origin, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: rest.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};${archiveStatus};external_archive=false;locator=${locator}` };
}

function diagram(key: Key, localPath: string, title: string): CuratedSource {
  const normalizedKey = key.toLowerCase();
  return { key: `phase111-${key}-diagram`, registryKey: `fpg-phase111-${normalizedKey}`, registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: `fpg-editorial-phase111-${normalizedKey}`, title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "本站原创事实示意图；非产品照片、非比例、非颜色或表面复刻。", allowedUse: "store_full", license: "site-original", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;dimensions=1600x900` };
}

const category = source({ key: "phase111-pilot-category", registryKey: "pilot-catalog-phase111", registryName: "PILOT web catalog", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "万年筆 検索結果一覧｜PILOTウェブカタログ", url: "https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004", summary: "Pilot 当前万年笔目录入口，用于确认四个系列均属于执行日 catalog；型号字段仍由各自 exact fileID 页面承担。", locator: "live category page; catalog navigation verified 2026-07-21; shared evidence, never an identity-unique marker" });

const model = {
  metal: {
    id: PHASE111_ELABO_METAL_ID, slug: PHASE111_ELABO_METAL_SLUG, name: "百乐 Pilot Elabo 金属轴 FE-25SR", image: "/images/library/site-original/phase111/pilot/pilot-elabo-metal-fe-25sr.svg",
    summary: "Pilot Elabo 金属轴 FE-25SR 以黄铜轴帽、约 33g、14K soft nib 与 CON-70N 兼容为边界；独立样本的 flex 用词不构成官方性能保证。",
    official: source({ key: "phase111-metal-catalog", registryKey: "pilot-catalog-phase111-metal", registryName: "PILOT current catalog PDF", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "PILOT current catalog — Elabo FE-25SR", url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016447&volumeName=00004", itemType: "pdf", summary: "exact fileID 目录正文列出 FE-25SR、黄铜轴帽、14K soft nib、CON-40/CON-70N、尺寸重量与当前黑色。", locator: "search-readable exact fileID t010000016447: FE-25SR, SEF/SF/SM/SB, brass painted body/cap, CON-40 and CON-70N, 14.0 x 140 mm, 33.0 g; direct automated fetch returned access-denied page", archiveStatus: "direct=access-denied;exact-fileID-index=readable" }),
    warranty: source({ key: "phase111-metal-warranty", registryKey: "pilot-warranty-phase111-metal", registryName: "PILOT International Warranty", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "ELABO FALCON NIB | International Warranty | PILOT", url: "https://www.pilot.co.jp/support/warranty/en/fountain/elabo.html", summary: "官方保修页锁定 FE-25SR，并分别给出 CON-40 与 CON-70N 操作及避免过度外力的保养边界。", locator: "live lines 6-75: FE-25SR, CON-40 and CON-70N; lines 78-97 care and excessive-force warning" }),
    reviews: [
      source({ key: "phase111-metal-penaddict", registryKey: "penaddict-metal-phase111", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", independenceGroup: "penaddict", title: "My Fountain Pen Education: The Pilot Metal Falcon", url: "https://www.penaddict.com/blog/2013/5/30/my-fountain-pen-education-the-pilot-metal-falcon", author: "Brad Dowdy", publishedAt: "2013-05-30", summary: "Thomas 借出的 SEF 样本；作者对重量、冷触感、线宽变化与价格的判断只属于这支他人所有的笔。", locator: "live lines 902-916: Thomas-owned pen, SEF, cautious pressure, metal weight/cold feel, author/date" }),
      source({ key: "phase111-metal-pencilcase", registryKey: "pencilcase-metal-phase111", registryName: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", independenceGroup: "pencilcase", title: "Pilot Metal Falcon", url: "https://www.pencilcaseblog.com/2015/01/pilot-metal-falcon.html", author: "Dries / The Pencilcase Blog", publishedAt: "2015-01", summary: "Pilot 免费提供的 metal sample；33g、CON-70、M 尖反馈与作者所谓 semi-flex 只作样本证词。", locator: "live lines 21-37: metal sample, 33 g, CON-70, soft 14K M, not true flex, free-of-charge disclosure" }),
    ],
    current: { series_name: "Pilot Elabo metal / FE-25SR", release_year: "current catalog verified 2026-07-21", origin_country: "Pilot Japan catalog", nib: "14K rhodium soft nib, SEF/SF/SM/SB", fill_system: "Pilot cartridge; CON-40 and CON-70N compatible", material: "painted brass barrel and cap; resin grip section", dimensions: "maximum diameter 14.0 mm; length 140 mm", weight: "33.0 g", price_range: "JPY 47,300 incl. tax at retrieval", status: "current FE-25SR black; exact catalog scope" },
  },
  resin: {
    id: PHASE111_ELABO_RESIN_ID, slug: PHASE111_ELABO_RESIN_SLUG, name: "百乐 Pilot Elabo 树脂轴 FE-18SR", image: "/images/library/site-original/phase111/pilot/pilot-elabo-resin-fe-18sr.svg",
    summary: "Pilot Elabo 树脂轴 FE-18SR 是 18g、CON-40、14K soft nib 的独立 sibling；自购 SEF 的写感与改尖视频不能覆盖 stock current spec。",
    official: source({ key: "phase111-resin-catalog", registryKey: "pilot-catalog-phase111-resin", registryName: "PILOT current catalog PDF", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "PILOT current catalog — Elabo FE-18SR", url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016450&volumeName=00004", itemType: "pdf", summary: "exact fileID 目录正文列出 FE-18SR、树脂轴帽、14K soft nib、CON-40、尺寸重量与当前黑色。", locator: "search-readable exact fileID t010000016450: FE-18SR, SEF/SF/SM/SB, resin body/cap, supplied and compatible CON-40, 14.4 x 137 mm, 18.0 g; direct automated fetch returned access-denied page", archiveStatus: "direct=access-denied;exact-fileID-index=readable" }),
    warranty: source({ key: "phase111-resin-warranty", registryKey: "pilot-warranty-phase111-resin", registryName: "PILOT International Warranty", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "ELABO FALCON NIB | International Warranty | PILOT", url: "https://www.pilot.co.jp/support/warranty/en/fountain/elabo_2.html", summary: "官方保修页分别列出 FE-18SR/FE-18SRG，并只给出 CON-40 操作。", locator: "live lines 6-58: FE-18SR and FE-18SRG, rotation type CON-40; no CON-70N instructions" }),
    reviews: [source({ key: "phase111-resin-fpen149", registryKey: "fpen149-resin-phase111", registryName: "万年筆愛好家 / fpen149", sourceType: "blog", tier: "professional_secondary", independenceGroup: "fpen149", title: "ペン先が柔らかいパイロットのエラボーを購入！", url: "https://www.fpen149.com/pilot-elabo-review/", author: "万年筆愛好家", publishedAt: "2024-06-18", summary: "作者自购 FE-18SR SEF 并使用 CON-40；个人卡利感、流量、线宽观察及 embedded customized Namiki video 都不作 stock 保证。", locator: "live lines 11-13 author/date; 54-64 customized video exclusion; 65-127 self-purchase, FE-18SR SEF, CON-40 and personal writing observations" })],
    current: { series_name: "Pilot Elabo resin / FE-18SR", release_year: "current catalog verified 2026-07-21", origin_country: "Pilot Japan catalog", nib: "14K rhodium soft nib, SEF/SF/SM/SB", fill_system: "Pilot cartridge or supplied CON-40; CON-70N excluded", material: "resin barrel and cap", dimensions: "maximum diameter 14.4 mm; length 137 mm", weight: "18.0 g", price_range: "JPY 35,200 incl. tax at retrieval", status: "current FE-18SR black; exact catalog scope" },
  },
  customNs: {
    id: PHASE111_CUSTOM_NS_ID, slug: PHASE111_CUSTOM_NS_SLUG, name: "百乐 Pilot Custom NS", image: "/images/library/site-original/phase111/pilot/pilot-custom-ns.svg",
    summary: "Pilot Custom NS FKNS-1 是现行特殊合金钢尖 Custom 入门线，附 CON-70N；2020 送测样本的旧颜色、价格与写感保持在 pre-refresh scope。",
    official: source({ key: "phase111-custom-ns-catalog", registryKey: "pilot-catalog-phase111-custom-ns", registryName: "PILOT current catalog PDF", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "PILOT current catalog — Custom NS FKNS-1", url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016458&volumeName=00004", itemType: "pdf", summary: "当前 PDF 直接列出 FKNS-1、EF/F/M/B、树脂轴帽、附 CON-70N、尺寸重量与四种 current variants。", locator: "live PDF page 36 lines 64-115: FKNS-1 L/G/R/BN, EF/F/M/B, resin, supplied CON-70N, compatible CON-40/CON-70N, 15.6 x 143.9 mm, 22.6 g" }),
    warranty: category,
    reviews: [source({ key: "phase111-custom-ns-pencilcase", registryKey: "pencilcase-custom-ns-phase111", registryName: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", independenceGroup: "pencilcase", title: "REVIEW: PILOT CUSTOM NS FOUNTAIN PEN", url: "https://www.pencilcaseblog.com/2020/01/review-pilot-custom-ns-fountain-pen.html", author: "Dries / The Pencilcase Blog", publishedAt: "2020-01", summary: "Casa Della Stilografica 送测的 2020 样本；旧颜色、价格、CON-40、握持与钢尖写感不覆盖执行日 current refresh。", locator: "live lines 21-57: 2020 design/colours/size/handling observations and Casa Della Stilografica sent-sample disclosure" })],
    current: { series_name: "Pilot Custom NS / FKNS-1", release_year: "current refreshed catalog verified 2026-07-21", origin_country: "Pilot Japan catalog", nib: "special-alloy steel nib, EF/F/M/B", fill_system: "Pilot cartridge; supplied CON-70N; CON-40 and CON-70N compatible", material: "resin barrel and cap", dimensions: "maximum diameter 15.6 mm; length 143.9 mm", weight: "22.6 g", price_range: "JPY 16,500 incl. tax at retrieval", status: "current FKNS-1: mystery blue, nature green, ruby red, adventure brown" },
  },
  lightive: {
    id: PHASE111_LIGHTIVE_ID, slug: PHASE111_LIGHTIVE_SLUG, name: "百乐 Pilot Lightive", image: "/images/library/site-original/phase111/pilot/pilot-lightive.svg",
    summary: "Pilot Lightive P-FLT-1 现行为 F/M、12.3g、snap cap 与 CON-40/CON-70N；2021 active-yellow 样本和一年 dry test 只作带日期的个案。",
    official: source({ key: "phase111-lightive-catalog", registryKey: "pilot-catalog-phase111-lightive", registryName: "PILOT current catalog PDF", sourceType: "official", tier: "primary", independenceGroup: "pilot-official", title: "PILOT current catalog — Lightive P-FLT-1", url: "https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016927&volumeName=00004", itemType: "pdf", summary: "当前 PDF 直接列出 P-FLT-1、F/M、树脂轴帽、CON-40/CON-70N、尺寸重量与六种 current variants。", locator: "live PDF page 39 lines 59-91: P-FLT-1, F/M, resin, CON-40/CON-70N, 13.5 x 142 mm, 12.3 g, OW/NC/MB/COR/TQ/NV" }),
    warranty: category,
    reviews: [source({ key: "phase111-lightive-kamitopen", registryKey: "kamitopen-lightive-phase111", registryName: "紙とペンのブログ", sourceType: "blog", tier: "professional_secondary", independenceGroup: "kamitopen", title: "ライティブ（LIGHTIVE）｜レビュー", url: "https://kamitopen.jp/fountain-pen/lightive-fountain-pen/", author: "紙とペンのブログ管理者", publishedAt: "2021-12-04", summary: "文章在 2025 refresh 后更新；主样本是 2021 active yellow，作者的一年 dry test、轻重和 cap 体验均为独立个案。", locator: "live lines 36-65 publication/update and 2021 sample; 118-169 author-run one-year dry test and handling; 170-190 dated old/current specs" })],
    current: { series_name: "Pilot Lightive / P-FLT-1", release_year: "2025-12-02 refresh; current catalog verified 2026-07-21", origin_country: "Pilot Japan catalog", nib: "special-alloy steel nib, F or M", fill_system: "Pilot cartridge; CON-40 and CON-70N compatible", material: "resin barrel and cap; NC unpainted, other current colours painted", dimensions: "maximum diameter 13.5 mm; length 142 mm", weight: "12.3 g", price_range: "JPY 2,750 incl. tax at retrieval", status: "current P-FLT-1: off-white, non-color, matte black, coral, turquoise, navy" },
  },
} as const;

export const PHASE111_IDENTITY_MARKERS = {
  metal: { id: PHASE111_ELABO_METAL_ID, slug: PHASE111_ELABO_METAL_SLUG, names: ["Pilot Elabo 金属轴 FE-25SR", "百乐 Pilot Elabo 金属轴 FE-25SR"], skus: ["FE-25SR"], officialUrls: [model.metal.official.url] },
  resin: { id: PHASE111_ELABO_RESIN_ID, slug: PHASE111_ELABO_RESIN_SLUG, names: ["Pilot Elabo 树脂轴 FE-18SR", "百乐 Pilot Elabo 树脂轴 FE-18SR"], skus: ["FE-18SR"], officialUrls: [model.resin.official.url] },
  customNs: { id: PHASE111_CUSTOM_NS_ID, slug: PHASE111_CUSTOM_NS_SLUG, names: ["Pilot Custom NS", "百乐 Pilot Custom NS"], skus: ["FKNS-1"], officialUrls: [model.customNs.official.url] },
  lightive: { id: PHASE111_LIGHTIVE_ID, slug: PHASE111_LIGHTIVE_SLUG, names: ["Pilot Lightive", "百乐 Pilot Lightive"], skus: ["P-FLT-1"], officialUrls: [model.lightive.official.url] },
} as const;
export const PHASE111_LEGACY_AMBIGUITY_MARKERS = { ids: ["elabopen0001"], slugs: ["pilot-elabo"], names: ["百乐 Pilot Elabo", "Pilot Elabo", "Elabo", "Falcon"] } as const;

const shared = `## 证据怎样分工

这一页把 current official facts 与 dated sample experience 分成两条轨道。Pilot catalog 和保修页回答产品号、材料、笔尖、供墨、尺寸、重量以及执行日 variants；独立作者只回答自己接触的那支笔在某种纸墨、尖宽和使用方式下呈现了什么。样本证词能提醒读者试写，却不能替换当前目录，也不能因为名称相近就跨型号借规格。

购买前先抄盒标、保修卡或轴帽上的完整 product code，再核对尾缀、尖宽和颜色。名称只有 Elabo 或 Falcon 时信息不够：本批次特意不创建 generic route，也不把 metal 与 resin 合并。Custom NS 和 Lightive 同样不能从 Custom 74、92、Kakuno 或 Cocoon 借用金尖、converter、重量和颜色。精确型号优先于“看起来像”。

价格与包装只保留时态。官方建议零售价是执行日目录记录，独立评测里的美元、欧元、随盒 converter 或赠测条件属于文章当年。不同地区库存、税费和 refresh 会改变实际成本。二手购买还应询问笔尖是否调校、converter 是否原配、卡帽或螺纹是否异常，并让卖家提供完整型号与尖刻照片。

## 写感不是可复制的规格

soft、smooth、feedback、dry、wet、balanced 都需要作者、样本、纸墨与日期。即使两支笔共享名义尖宽，制造公差、使用磨损、墨水流动性和握姿也会改变体验。页面不会把单一作者写成玩家共识，更不会把“软”扩写成 traditional flex 保证。想要明显书法式粗细变化，应先现场试写，并避免为了追求线宽而过压撑尖。

## 维护边界

cartridge 和 converter 应直线装入，清洗后自然干燥；具体可用型号按本页 current official scope，而不是按旧评测包装。snap cap 开合、长期停放与飞行时的气压变化都可能影响出墨。若出现持续漏墨、尖片错位、异常阻力或卡帽松脱，不从相邻 Pilot 型号的拆解经验推断，保留购买凭证并向当地服务渠道确认。

本站主图是事实导航，不是商品照片。图中轮廓、颜色和比例只服务于阅读层级，不复刻商标、漆面或真实色差，也不能替代官网图和实物检查。

## 如何把页面用于实际选择

先把“是否是这一个型号”解决，再谈喜不喜欢。到店试写可以准备一张自己常用的纸，用相同墨水条件依次写小字、快速笔记和一段连续文字。记录起笔、转折、回锋、握位压力与重心，而不是只画几条刻意撑开的粗细线。网购时要求卖家确认完整 SKU、尖宽、颜色后缀、converter 与退换条件；页面的规格能帮助排除错货，不能替代到手检查。

如果读者是从品牌页漫游而来，made_by 关系只说明制造者与导航归属，不意味着四页可以共享 payload。每一页的 current scope、source item、spec evidence 和 primary media 都归目标实体自己所有。反向导航增加的是四个精确页面，不会产生第五个 generic Elabo，也不会让一个 sibling 成为另一个的 redirect。

## 关于地区名与时间

Pilot、Namiki、Elabo、Falcon 等词在不同地区和年代可能同时出现。本文只在来源明确说明时描述地区命名，不用模糊 alias 解决 identity。一个标题写 Falcon 的旧评测，必须继续核对轴材、重量、converter 与尖宽，才能判断它提供的是 metal 还是 resin 样本证词；判断不了就只留作背景，不进入 current fields。

refresh 同样需要日期。官网执行日页面优先说明现在，旧文章负责保留当时的样本、包装、颜色与价格。二者不互相“纠错”，而是回答不同问题。未来 catalog 再更新时，应新增 retrieval 和 scope，而不是静默改写旧作者当年的观察。这样页面既能服务当下购买，也保留可追溯的产品变化。

## 安全与诚实边界

软尖、卡帽、converter 和长期停放都涉及真实使用成本。本文不建议超出官方写作用途的压力测试，不承诺任何墨水组合永不干尖，也不把赠测或借测自动视为不可信；关键是披露关系并把结论限制在样本。发现来源打不开、产品号冲突或规格无法落到 exact SKU 时，正确动作是停止发布，而不是从相邻型号或商店摘要补齐。

页面也不提供维修拆解授权。特别是软尖错位、卡帽内部结构、converter 密封和树脂裂纹，应由有经验的维修渠道判断。日常清洗可遵循官方 care guide；超出说明的拆卸、磨尖和改尖会改变原始状态，也会让本页关于 stock 产品的判断失效。`;

function body(key: Key): string {
  if (key === "metal") return `## 重量首先把 sibling 分开

FE-25SR 的 canonical 起点是金属轴，而不是泛称 Falcon。current catalog 把它写成黄铜轴帽、33.0g、最大径 14.0mm、全长 140mm；14K 镀铑 soft nib 提供 SEF、SF、SM、SB。保修页同时给出 CON-40 和 CON-70N 的操作，所以大 converter 兼容是这支 metal sibling 的官方边界，不能反抄到 FE-18SR。

Brad Dowdy 2013 年写的是朋友 Thomas 的 SEF。他明确因为笔属于别人而不愿大力压尖，感受到金属重量和初触偏冷，也觉得当时美国价格高。这些句子很有用，因为它们告诉读者试写时要关注什么；但它们不是 FE-25SR 全体的重量偏好结论，更不是鼓励施压的教程。

Pencilcase 2015 年样本由 Pilot 免费提供。作者记录约 33g、较大的 CON-70、14K M 尖的反馈与流量，并直说它不是真正意义上的 flex。本文保留这项 disclosure，也把 semi-flex 视为作者词汇。官方只保证 soft nib 与书写用途；若过压造成尖片永久张开，那是损伤而不是功能解锁。

current variants 只保留 exact PDF 执行日列出的黑色 FE-25SR 与四种 soft nib code。历史颜色、北美 Falcon 包装和评测年代价格不进入 current table。Elabo/Falcon 可以解释地区命名关系，却不成为无条件 alias；只有完整 FE-25SR 才落到本页。

试写时建议先用正常轻压写一整段，再观察自然笔画变化、回弹、握位直径和 33g 在长写中的影响。若购买目标只是稳定日用，不应为了展示线宽而把尖压到评测图片的极限。${shared}`;
  if (key === "resin") return `## 18g 的树脂 sibling

FE-18SR current catalog 记录树脂轴帽、18.0g、最大径 14.4mm、全长 137mm，14K 镀铑 soft nib 同样提供 SEF、SF、SM、SB。供墨范围却不同：随附并适配 CON-40，保修页也只展示 CON-40。这个差异足以说明它不是 FE-25SR 的轻量配色，而是必须独立维护的 canonical sibling。

fpen149 在 2024 年自购的是 FE-18SR SEF。作者写到用 CON-40、SEF 的细与反馈、自己的流量观察和画小插图的可能性。这些都保留在 self_purchased_2024_sef scope。文章前段引用的 custom Namiki Falcon video 已明确是改尖效果，不能拿来保证 stock SF，也不能把视频里的夸张线宽写成 FE-18SR 的产品能力。

同一篇文章提到 Elabo 在海外常见 Falcon 名称，也区分树脂 FE-18SR 与金属 FE-25SR。这里把它当地区命名说明，而不把 generic Falcon 绑定到任一页。另一个容易串线的词是 FA：Custom 742、743、Heritage 912 可选的 FA nib 不等于这支 Elabo 成品的 soft nib code，本页只做排除。

执行日 current variants 只收 exact PDF 可核对的黑色 FE-18SR 与四种 soft nib code；旧红色库存、商店残留与历史价格不进入 current list。读者若面对红色或其它地区包装，应继续查后缀和年代，不能用本页 current table 自动覆盖。

树脂轴较轻不等于所有人都更舒适。试写时要比较握持重心、无套帽长写与 SEF 在自己的纸墨上是否过细。作者的“卡利感”是个人样本，不是出厂缺陷判定；真正持续刮纸、尖片错位或断墨仍需要检查。${shared}`;
  if (key === "customNs") return `## Custom 名称里的钢尖入口

FKNS-1 的 current identity 很明确：特殊合金钢尖，EF、F、M、B；树脂轴帽；最大径 15.6mm、全长 143.9mm、22.6g；随附 CON-70N，并兼容 CON-40 和 CON-70N。它属于 Custom 梯级，却不能因为名字里有 Custom 就借 Custom 74 或 92 的金尖规格。

执行日 PDF 列出 mystery blue、nature green、ruby red、adventure brown 四组 current variants，每组对应四种尖宽。页面只让 exact FKNS-1 code 进入 variants。2020 文章出现的 dark/light blue、beige、red、black 是当时市场语境；即使名称有重叠，也不能越过 refresh 日期覆盖 current PDF。

Pencilcase 披露样本由 Casa Della Stilografica 送测。作者记录较长笔身、塑料结构、握位、螺纹存在感、钢尖体验，也讨论当时欧洲、日本、美国价格和 CON-40。这些意见能形成试写清单，但不能推翻执行日目录的 CON-70N supplied 字段，更不能用作者与 Custom 74/92 的比较证明 NS 共享它们的金尖。

页面把该来源放在 professional_sample_2020_pre_refresh scope：送测关系、作者意见、旧颜色、旧价格和当时包装一起保留。current FKNS-1 scope 则只接 Pilot PDF 和 category。两条轨道并列，使读者知道为何旧评测仍值得读，又不会把六年前的 lineup 当今天货架。

购买时先确认 FKNS-1 后缀和尖宽，再检查盒内 CON-70N 是否与销售说明一致。若二手卖家只写“Custom NS”而没有 code，应索取笔身、尖刻、盒标和颜色照片。钢尖不天然低于金尖，也不保证更硬或更顺；目标应是自己的纸墨和手感，而不是材料等级想象。${shared}`;
  return `## current refresh 与旧样本要分开

P-FLT-1 current PDF 给出 F/M 特殊合金钢尖、树脂轴帽、snap cap、最大径 13.5mm、全长 142mm、12.3g，以及 CON-40/CON-70N 兼容。执行日颜色是 off-white、non-color、matte black、coral、turquoise、navy。旧 active yellow 不在这张 current variants 表里。

kamitopen 的文章最初发布于 2021-12-04，主图和长期使用对象是 active yellow，后来加入 2025-12-02 refresh 与 2026 更新。本文因此拆成 review_sample_2021_active_yellow、author_update_2025_2026 与 independent_dry_test 三个 scope。旧价、旧色和旧样本重量不覆盖 current PDF。

作者拆看 spring-loaded inner cap，并让一支装墨样本停放一年，每月写一两毫米检查能否出墨。这是设计观察和独立实验，不是 Pilot warranty，也不是所有墨水、环境和个体都能复现的一年保证。页面只写“作者该样本在其方法下仍可书写”，不把结论升级为 universal dry-up claim。

文章还觉得 cartridge 状态偏轻、装 CON-70 后重量更合适，并提醒 snap cap 快速拔开可能带来墨滴。这些同样属于个人体验。12.3g current official weight 与作者旧样本约 12.5g 可以并列，不能平均成新规格；converter 容量的自行测量也不替代官方兼容字段。

购买时先决定需要透明观察墨量还是涂装外观，再核对 P-FLT-1 尾缀。旧 active yellow 库存可能仍在市场，但它应按旧时态理解。使用 snap cap 时平稳拔合、长期停用前清洗；若希望验证气密表现，应在自己的墨水与环境中谨慎观察，而不是把单篇一年实验当免维护承诺。${shared}`;
}

function makePack(key: Key): CuratedEntityPack {
  const item = model[key];
  const currentScope = `phase111-${key}-current`;
  const sampleScopes = key === "lightive" ? [
    { key: "review_sample_2021_active_yellow", scopeKey: "review_sample_2021_active_yellow", productionState: "historical" as const, editionScope: "2021 active-yellow sample; old colour and price excluded from current variants" },
    { key: "author_update_2025_2026", scopeKey: "author_update_2025_2026", productionState: "historical" as const, editionScope: "author update describing refresh; official PDF remains current authority" },
    { key: "independent_dry_test", scopeKey: "independent_dry_test", productionState: "historical" as const, editionScope: "one author-run sample test, not Pilot guarantee" },
  ] : (() => {
    const scopeKey = key === "customNs" ? "professional_sample_2020_pre_refresh" : key === "resin" ? "self_purchased_2024_sef" : "professional_samples_2013_2015";
    return [{ key: scopeKey, scopeKey, productionState: "historical" as const, editionScope: "named dated samples only; excluded from current variants and guarantees" }];
  })();
  const sources = [
    ...new Map(
      [category, item.official, item.warranty, ...item.reviews].map((entry) => [entry.key, entry]),
    ).values(),
    diagram(key, item.image, `${item.name} 本站原创事实示意图`),
  ];
  const evidence: CuratedSpecEvidence[] = (Object.keys(item.current) as Exclude<SpecFieldKey, "brand_entity_id">[]).map((fieldKey, index) => ({ key: `phase111-${key}-spec-${index}`, fieldKey, sourceKey: item.official.key, scopeKey: currentScope, locator: item.official.archiveLocator ?? "exact official catalog locator" }));
  evidence.unshift({ key: `phase111-${key}-spec-brand`, fieldKey: "brand_entity_id", sourceKey: category.key, scopeKey: currentScope, locator: category.archiveLocator ?? "Pilot category" });
  const variants = key === "metal" ? [{ name: "FE-25SR black / SEF-SF-SM-SB", code: "FE-25SR" }] : key === "resin" ? [{ name: "FE-18SR black / SEF-SF-SM-SB", code: "FE-18SR" }] : key === "customNs" ? ["L mystery blue", "G nature green", "R ruby red", "BN adventure brown"].map((name) => ({ name, code: "FKNS-1" })) : ["OW off-white", "NC non-color", "MB matte black", "COR coral", "TQ turquoise", "NV navy"].map((name) => ({ name, code: "P-FLT-1" }));
  return {
    key: `phase111-pilot-${key}`, entityId: item.id, expectedType: "pen", expectedSlug: item.slug, canonicalName: item.name, publicationIntent: "publish", markdownFile: `${CONTENT_DIR}/${key}.md`, storyTitle: `${item.name}：current identity、来源与样本边界`, primarySourceKey: item.official.key, depthTier: "A",
    aliases: key === "metal" || key === "resin" ? [] : [{ alias: item.name.replace("百乐 ", ""), language: "en", sourceKey: item.official.key }], sources,
    scopes: [{ key: currentScope, scopeKey: currentScope, market: "Japan current catalog", validFrom: RETRIEVED, productionState: "current", nibScope: item.current.nib, materialScope: item.current.material }, ...sampleScopes],
    claims: [
      { key: `phase111-${key}-identity`, predicate: "has_current_identity", objectText: item.current.series_name, factClass: "core", confidence: 1, sourceKey: item.official.key, locator: item.official.archiveLocator ?? "official", evidence: [{ key: `phase111-${key}-identity-ev`, sourceKey: item.official.key, locator: item.official.archiveLocator ?? "official", scopeKey: currentScope }] },
      { key: `phase111-${key}-boundary`, predicate: "keeps_sample_boundary", objectText: key === "metal" ? "soft nib is not a traditional-flex guarantee; loaned/free samples remain dated" : key === "resin" ? "custom Namiki video and FA nib are excluded from stock FE-18SR" : key === "customNs" ? "2020 sent sample, old colours/prices and Custom gold-nib comparisons excluded from current FKNS-1" : "2021 active-yellow, author updates and one-year dry test remain dated independent scopes", factClass: "core", confidence: 1, sourceKey: item.reviews[0].key, locator: item.reviews[0].archiveLocator ?? "review", evidence: [{ key: `phase111-${key}-boundary-ev`, sourceKey: item.reviews[0].key, locator: item.reviews[0].archiveLocator ?? "review", scopeKey: sampleScopes[0].scopeKey }] },
    ],
    variants: variants.map((variant, index) => ({ key: `phase111-${key}-variant-${index}`, name: variant.name, notes: `Locked current product code ${variant.code}; dated sample colours excluded.`, sourceKey: item.official.key, variantKind: "market_sku" as const, productCode: variant.code, market: "Japan" })),
    spec: { brandEntityId: PHASE111_PILOT_ID, values: item.current, evidence },
    timeline: [{ key: `phase111-${key}-verified`, title: "Current official scope live-verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact official identity and independent sample disclosures were reopened before reviewed copy was written.", sourceKey: item.official.key }],
    media: [{ key: `phase111-${key}-primary`, title: `${item.name} 本站原创事实示意图（非产品照片）`, sourceKey: `phase111-${key}-diagram`, localPath: item.image, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创示意图；非产品照片；非比例、颜色或表面复刻；不含 Pilot Logo。", sourceUrl: item.image, usageStatus: "primary" }],
  };
}

export const phase111PilotPacks = (["metal", "resin", "customNs", "lightive"] as const).map(makePack);

export function loadPhase111PilotPacks(ownedRoot: string): LoadedCuratedEntityPack[] {
  const contentRoot = path.join(ownedRoot, CONTENT_DIR);
  fs.mkdirSync(contentRoot, { recursive: true });
  for (const key of Object.keys(model) as Key[]) {
    const item = model[key];
    const markdown = `# ${item.name}\n\n## summary\n\n${item.summary}\n\n## model_specs\n\n\`\`\`json\n${JSON.stringify(item.current, null, 2)}\n\`\`\`\n\n## body_md\n\n${body(key)}\n\n## 来源\n\n来源由 CuratedEntityPack 的 source items、locators、scope 与 evidence 管理。\n`;
    fs.writeFileSync(path.join(contentRoot, `${key}.md`), markdown, "utf8");
  }
  const loaded = phase111PilotPacks.map((pack) => loadCuratedEntityPack(ownedRoot, pack));
  for (const pack of loaded) if ([...pack.bodyMd].length < 2_000) throw new Error(`${pack.key} body_md must contain at least 2,000 Unicode characters.`);
  return loaded;
}
