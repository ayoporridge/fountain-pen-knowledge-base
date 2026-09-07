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

function sharedCopy(key: Key): string {
  if (key === "metal") return `## 证据怎样分工

FE-25SR 这一页把金属轴的 current catalog facts 与两篇 dated sample 体验分开。Pilot 目录和保修页锁定 FE-25SR、黄铜轴帽、33.0g、14K soft nib、CON-40/CON-70N、尺寸和当前黑色；Brad Dowdy 借用的 SEF 与 Pencilcase 获赠的 M 样本，只说明各自纸墨和压力下的观察。样本能提示试写重点，却不能替整条 Elabo 系列补规格。

购买前先把盒标或轴帽上的 FE-25SR 抄完整，再核对 SEF、SF、SM、SB 尖宽和黑色尾缀。海外页面写 Falcon、Elabo 或 metal 时，若没有 FE-25SR，信息还不足以排除 FE-18SR；本页不创建 generic route，也不让 Custom NS、Lightive 或其它 Pilot 型号借用 33g 与 converter 字段。

价格和包装要带日期理解。执行日目录的 FE-25SR 建议价是 JPY 47,300（含税），2013/2015 评测中的美元价格、赠测关系、木盒或 CON-70 描述属于当年样本。库存、地区税费和包装会变；二手交易仍应索取完整 SKU、尖刻照片、converter 是否原配及卡帽螺纹状态。

## 写感不是可复制的规格

FE-25SR 的 soft 不是 traditional flex 保证。两篇样本分别提到金属的冷触感、33g 重量、SEF 或 M 尖的反馈和流量，但作者、纸张、墨水与是否借测都不同。试写应先以正常轻压完成一段，再记录回弹、转折和长写时的重量；不要为了复刻评测照片而过压撑尖。

## 维护边界

FE-25SR 的 CON-40 或 CON-70N 要沿直线装入，清洗后自然干燥；大 converter 兼容是本金属 sibling 的 current scope，不是邻近树脂版的默认配置。软尖若出现持续漏墨、尖片错位或异常阻力，应保留购买凭证并咨询 Pilot 服务渠道，不依据另一款 Falcon 的拆解图自行修理。

这四页的 Pilot 主图都是事实导航，不是商品照片。FE-25SR 图中黄铜轴帽和尖面层级用于解释结构，不承诺真实漆色、比例、冷触感或某一支的表面状态；购买判断仍以官网 exact page 和实物检查为准。

## 如何把页面用于实际选择

若目标是 FE-25SR，现场应带自己的纸，用同一墨水先写小字、快速笔记和连续段落，比较 33g 金属轴在握位和重心上的影响，再试 SEF/SF/SM/SB 的自然线宽。网购时让卖家同时确认 FE-25SR、尖宽、颜色、CON-40/CON-70N 和退换条件；规格用于排除错货，不替代到手验笔。

made_by 关系只把 FE-25SR 归到 Pilot 品牌导航，不意味着四个 Phase 111 页面共享 payload。每页都有自己的 current scope、source item、spec evidence 和 primary media；从 Pilot 品牌页返回时，读者会得到精确型号链接，而不是一个把 metal、resin、Custom NS、Lightive 混在一起的 Elabo 节点。

## 关于地区名与时间

Falcon、Elabo、Namiki 等词在不同地区可指向不同包装。FE-25SR 的金属轴、33g 与 CON-70N 兼容必须回到 exact code；若旧标题只写 Falcon，最多保留为背景，不能把它的重量、尖宽或价格写入本页 current fields。2013/2015 样本的作者关系和日期也应原样保留。

refresh 记录的是目录状态，不会改写借测文章。FE-25SR 的 current black 和四种 soft nib code 由执行日 PDF 负责，旧颜色、北美包装及历史价格由各自样本 scope 负责。未来目录再变时新增 retrieval 和 scope，避免把新页面静默套回旧作者的金属轴体验。

## 安全与诚实边界

FE-25SR 的软尖、金属重量和 converter 选择都会带来真实使用成本。本文不建议以过压测试 traditional flex，不承诺某种墨水永不干尖，也不把借测或赠测自动当成普遍结论。遇到产品号冲突、来源打不开或卖家只给“Falcon”简称时，正确动作是暂停发布，先补齐 exact SKU。

页面不授权自行拆解软尖、卡帽或 converter 密封。日常清洗按 Pilot care guide 处理；磨尖、拆卸或强行校正会改变 FE-25SR 的 stock 状态，使本页关于官方配置与 dated sample 的边界失效。`;
  if (key === "resin") return `## 证据怎样分工

FE-18SR 这一页先处理树脂轴的 current identity，再处理一篇 2024 自购 SEF 的体验。Pilot 目录和保修页锁定 18.0g、14.4mm、137mm、14K soft nib、CON-40 与黑色；fpen149 的卡利感、反馈和小插图来自作者自己的那支 FE-18SR SEF，不能替 stock 规格发言。

购买时要从盒标抄出 FE-18SR，并确认 SEF、SF、SM、SB 尖宽与颜色后缀。海外称 Falcon 或只写 Elabo 时，缺少 FE-18SR 就不能判断是树脂还是 FE-25SR 金属轴；本页也不把 Custom 742/743/Heritage 912 的 FA nib、CON-70N 或重量搬过来。

价格和包装只在各自时间范围内成立。执行日目录把 FE-18SR 黑色列为 JPY 35,200（含税），fpen149 文章的购买条件、CON-40、旧颜色和个人配件是 2024 样本。地区库存、税费和 converter 包装会变；二手核对仍需完整 code、尖刻照片、converter 原配情况和卡帽状态。

## 写感不是可复制的规格

18g 树脂轴只是一个 official weight，不等于每个人都觉得轻松。fpen149 的 SEF 细线、反馈和流量观察依赖作者的纸墨、握姿和自购样本，文章里的 custom Namiki Falcon 改尖视频也不代表 stock FE-18SR。试写要记录连续书写的重心和起笔，不要把“soft”改写成 flex 保证。

## 维护边界

FE-18SR 的 current filling scope 是 cartridge 或 CON-40；安装要保持直线，清洗后自然干燥。保修页没有给出 CON-70N 操作，因此不能因为金属 sibling 能装大 converter 就扩展树脂页。持续刮纸、断墨或树脂裂纹应交给服务渠道判断，不按相邻型号拆解。

这四页的 Pilot 主图是事实导航。FE-18SR 图中树脂轴、14.4mm 握位和 soft nib 只用于阅读层级，不是商品照片、重量实拍或色差证明；真实颜色、包装和库存仍要回到 exact 商品页与实物。

## 如何把页面用于实际选择

若要判断 FE-18SR 是否适合日用，先用自己的纸墨写小字、快速记录和连续段落，再比较 18g 无套帽重心与 SEF/SF/SM/SB 的反馈。网购要求卖家确认 FE-18SR、尖宽、黑色或地区尾缀、CON-40 与退换条件；页面能帮助排除把 FE-25SR 发来的错误，不替代到手检查。

made_by 只说明 FE-18SR 由 Pilot 品牌导航，不能让四个 Phase 111 页面共用内容。树脂页的 current scope、source item、spec evidence 和 primary media 都独立；品牌页返回的是 FE-18SR 精确 route，不会生成一个 generic Falcon 来吞掉 metal sibling。

## 关于地区名与时间

Falcon、Elabo 和 Namiki 在海外文章中可能并列出现。FE-18SR 只有在轴材、18g、CON-40 和尖宽都与 exact code 对上时才进入 current fields；若旧标题只写 Falcon，就保留为命名背景。2024 自购 SEF 的作者身份、纸墨与视频改尖范围不能被当前黑色目录覆盖。

FE-18SR 的执行日 PDF 负责现在的黑色和四种 soft nib code，fpen149 负责 2024 样本的反馈、旧价和配件。未来 refresh 应增加新的 retrieval 和 scope，而不是静默把新 converter 或颜色改写成作者当年的树脂体验。

## 安全与诚实边界

树脂轴、SEF 细尖和较小的 CON-40 都会影响真实使用成本。本文不鼓励压尖求线宽，不保证某种墨水在所有环境下不干，也不把自购文章里的改尖视频当出厂承诺。来源打不开、产品号冲突或只有“Falcon”简称时，先停止发布并补齐 FE-18SR 证据。

页面不授权拆开 FE-18SR 的尖、卡帽或 converter 密封。日常清洗按官方 care guide；自行磨尖、强拧螺纹或把树脂整支浸泡都可能改变 stock 状态，后续判断应转交熟悉 Pilot 的维修渠道。`;
  if (key === "customNs") return `## 证据怎样分工

FKNS-1 这一页的主线是“Custom 名称下的钢尖入口”。执行日 Pilot PDF 负责特殊合金钢尖、EF/F/M/B、22.6g、15.6mm、143.9mm、CON-70N 和四组当前颜色；Pencilcase 的 2020 Casa Della Stilografica 送测样本只回答当时的握持、钢尖和价格。两种来源并列，但不互相代替。

购买前抄完整 FKNS-1 code，再核对 L mystery blue、G nature green、R ruby red、BN adventure brown 与尖宽。旧文章里的 dark/light blue、beige、red、black 不能越过 refresh 日期覆盖 current table；Custom 74、92 或其它 Pilot 的金尖、重量和 converter 也不能写入 NS。

价格和包装需要分 scope 阅读。执行日目录的 FKNS-1 记录为 JPY 16,500（含税）并随附 CON-70N；2020 送测文章的欧洲、日本、美国价格、旧颜色和 CON-40 是当年样本。库存、税费和盒内配件可能变化，二手仍要核对尖刻、盒标、颜色后缀和退换条件。

## 写感不是可复制的规格

FKNS-1 的特殊合金钢尖不等于 Custom 金尖的替身。送测作者对塑料结构、长笔身、螺纹和钢尖反馈的描述属于 2020 样本，并不证明今日每支 NS 都相同。试写时请记录握位、起笔和连续文字，而不是把材料等级或作者与 Custom 74/92 的比较当成硬度、顺滑度或 flex 规格。

## 维护边界

FKNS-1 current scope 同时记录随附 CON-70N 与兼容 CON-40/CON-70N；converter 需直线装入，清洗后自然干燥。旧评测只写 CON-40，不足以撤销今日目录，也不代表所有旧包装都含同一配件。遇到持续漏墨、尖片错位或卡帽松动，应保留购买凭证并找 Pilot 服务渠道。

这四页的 Pilot 主图是事实导航而非产品照片。FKNS-1 图中钢尖、树脂轴和四组颜色用于解释 identity，不证明 2020 旧色仍在售，也不承诺真实比例、漆面或某支笔的磨损；当前货架与实物优先由 exact code 核对。

## 如何把页面用于实际选择

想比较 FKNS-1 的 EF/F/M/B，应在同一张常用纸上写小字、快速笔记和长句，记录 22.6g、15.6mm 握位与 CON-70N 后的重心。网购时让卖家确认 FKNS-1、L/G/R/BN 颜色、尖宽、盒内 CON-70N 和退换条件；页面规格帮助识别错货，不代替检查。

made_by 关系只负责把 FKNS-1 接到 Pilot 品牌，不能让 Custom NS 与 Elabo 或 Lightive 共享 payload。该页的 current refresh、2020 sample scope、source item、spec evidence 和 primary media 都有自己的证据链；从品牌页漫游会回到四个精确型号，而不是一个模糊 Custom route。

## 关于地区名与时间

“Custom”在不同市场常常连到不同尖材和颜色。FKNS-1 必须同时满足 exact code、特殊合金钢尖、22.6g、CON-70N 与当前四色条件；2020 文章只作为送测样本和旧市场语境。若卖家只写 Custom NS，先索取盒标、尖刻和颜色照片，不把旧文章的价格写成今天的报价。

refresh 日期决定 current FKNS-1 表，送测日期决定 historical sample scope。二者不互相“纠错”：未来 catalog 变更时新增 retrieval，保留 2020 作者对钢尖和握持的观察，也不把新颜色、价格或配件静默回填到旧文章。

## 安全与诚实边界

FKNS-1 的钢尖、长笔身和 CON-70N 会影响真实使用成本。本文不把钢尖贬为“低配”，也不承诺它比金尖更硬、更顺或永不干；遇到产品号冲突、颜色无法对应或来源打不开时，应停止发布，而不是从 Custom 74/92 补规格。

页面不授权自行拆解 FKNS-1 的卡帽、尖片或 converter 密封。日常清洗遵循官方 care guide；强行磨尖、过压或拆卸会改变 stock 状态。超出说明的维修应交给有经验的 Pilot 渠道，不能用作者的 2020 送测动作作教程。`;
  return `## 证据怎样分工

P-FLT-1 这一页把 Lightive 的 current refresh 与 active-yellow 长期样本分成两条证据链。Pilot 执行日 PDF 负责 F/M 特殊合金钢尖、12.3g、13.5mm、142mm、snap cap、CON-40/CON-70N 和六种当前颜色；kamitopen 的 2021 样本、2025/2026 更新及一年 dry test 只描述作者那支笔在特定墨水和环境中的表现。

购买时先核对 P-FLT-1 及 OW、NC、MB、COR、TQ、NV 尾缀。active yellow 是旧样本，不在 current variants；Lightive 也不能从 Custom NS、Cocoon、Kakuno 或 Elabo 借钢尖、颜色、重量或气密承诺。名称对上并不等于版本对上。

价格和包装必须标注时点。执行日目录的 P-FLT-1 价格为 JPY 2,750（含税），kamitopen 文章保留 active yellow、约 12.5g 旧样本、cartridge/CON-70 体验和 2021 年市场语境。库存、税费和 converter 配置会变；二手仍要让卖家提供完整 code、颜色、尖宽和卡帽照片。

## 写感不是可复制的规格

Lightive 的 12.3g current weight 与作者旧样本约 12.5g 可以并列，不能平均成一个新规格。一年停放后每月写一两毫米的 dry test 是作者方法下的个案，不是 Pilot warranty；snap cap 的轻重、拔合和偶发墨滴也要回到自己的纸墨和环境验证。

## 维护边界

P-FLT-1 的 cartridge、CON-40 和 CON-70N 兼容范围来自 current catalog；装入时保持直线，清洗后自然干燥。kamitopen 对 spring-loaded inner cap 的拆看和长期停放只作观察，不能授权读者拆帽或把“一年仍可写”扩成 universal dry-up guarantee。异常漏墨、卡帽或尖片问题应找 Pilot 服务渠道。

这四页的 Pilot 主图是事实导航，不是 Lightive 商品照片。P-FLT-1 图中的 snap cap、树脂轴和颜色名称用于区分 route，不证明 active yellow 仍在售、真实色差、气密程度或某支笔的旧磨损；官网 exact page 与实物检查优先。

## 如何把页面用于实际选择

若在意 Lightive 的轻量或 snap cap，先用自己的纸墨写小字、快速笔记和长句，再观察 12.3g、握位与 F/M 的起笔。网购时确认 P-FLT-1、OW/NC/MB/COR/TQ/NV、尖宽、converter 和退换条件；想复现 dry test 时要记录墨水、停放环境和日期，不能只看标题。

made_by 关系只把 P-FLT-1 接到 Pilot，不表示四个 Phase 111 页面可以共享 payload。Lightive 的 current refresh、2021 sample、author update、source item、spec evidence 和 primary media 均独立；品牌页返回的是精确 P-FLT-1 route，而非把旧 active yellow 变成第五个型号。

## 关于地区名与时间

Lightive、ライティブ 和 active yellow 在不同页面的时间语境不同。P-FLT-1 的 2025-12-02 refresh 与执行日 PDF 负责当前六色，kamitopen 的 2021 样本和 2025/2026 更新负责旧色、旧价与作者实验。资料只写 Lightive 时，先补 code、颜色和日期，不能用旧样本覆盖 current fields。

refresh 不是对作者记忆的“纠错”。官网回答现在的 F/M、12.3g 和 converter 范围，文章回答当年 active-yellow 的 snap cap、轻重和 dry test；未来目录再变时新增 retrieval 和 scope，保留这条时间线。

## 安全与诚实边界

Lightive 的 snap cap、converter 和长期停放都涉及真实使用成本。本文不承诺任何墨水在所有环境下永不干尖，不把 spring-loaded inner cap 的拆看变成维修教程，也不把旧 active yellow 的一年实验写成普遍保证。来源打不开、产品号冲突或颜色无法对应时，应暂停发布并补齐 exact P-FLT-1 证据。

页面不授权自行拆解卡帽、尖片或 converter 密封。日常清洗遵循 Pilot care guide；强行拔帽、过压或磨尖会改变 stock 状态。若出现持续漏墨、卡帽松脱或树脂裂纹，应交给有经验的维修渠道判断。`;
}

function body(key: Key): string {
  if (key === "metal") return `## 重量首先把 sibling 分开

FE-25SR 的 canonical 起点是金属轴，而不是泛称 Falcon。current catalog 把它写成黄铜轴帽、33.0g、最大径 14.0mm、全长 140mm；14K 镀铑 soft nib 提供 SEF、SF、SM、SB。保修页同时给出 CON-40 和 CON-70N 的操作，所以大 converter 兼容是这支 metal sibling 的官方边界，不能反抄到 FE-18SR。

Brad Dowdy 2013 年写的是朋友 Thomas 的 SEF。他明确因为笔属于别人而不愿大力压尖，感受到金属重量和初触偏冷，也觉得当时美国价格高。这些句子很有用，因为它们告诉读者试写时要关注什么；但它们不是 FE-25SR 全体的重量偏好结论，更不是鼓励施压的教程。

Pencilcase 2015 年样本由 Pilot 免费提供。作者记录约 33g、较大的 CON-70、14K M 尖的反馈与流量，并直说它不是真正意义上的 flex。本文保留这项 disclosure，也把 semi-flex 视为作者词汇。官方只保证 soft nib 与书写用途；若过压造成尖片永久张开，那是损伤而不是功能解锁。

current variants 只保留 exact PDF 执行日列出的黑色 FE-25SR 与四种 soft nib code。历史颜色、北美 Falcon 包装和评测年代价格不进入 current table。Elabo/Falcon 可以解释地区命名关系，却不成为无条件 alias；只有完整 FE-25SR 才落到本页。

试写时建议先用正常轻压写一整段，再观察自然笔画变化、回弹、握位直径和 33g 在长写中的影响。若购买目标只是稳定日用，不应为了展示线宽而把尖压到评测图片的极限。${sharedCopy(key)}`;
  if (key === "resin") return `## 18g 的树脂 sibling

FE-18SR current catalog 记录树脂轴帽、18.0g、最大径 14.4mm、全长 137mm，14K 镀铑 soft nib 同样提供 SEF、SF、SM、SB。供墨范围却不同：随附并适配 CON-40，保修页也只展示 CON-40。这个差异足以说明它不是 FE-25SR 的轻量配色，而是必须独立维护的 canonical sibling。

fpen149 在 2024 年自购的是 FE-18SR SEF。作者写到用 CON-40、SEF 的细与反馈、自己的流量观察和画小插图的可能性。这些都保留在 self_purchased_2024_sef scope。文章前段引用的 custom Namiki Falcon video 已明确是改尖效果，不能拿来保证 stock SF，也不能把视频里的夸张线宽写成 FE-18SR 的产品能力。

同一篇文章提到 Elabo 在海外常见 Falcon 名称，也区分树脂 FE-18SR 与金属 FE-25SR。这里把它当地区命名说明，而不把 generic Falcon 绑定到任一页。另一个容易串线的词是 FA：Custom 742、743、Heritage 912 可选的 FA nib 不等于这支 Elabo 成品的 soft nib code，本页只做排除。

执行日 current variants 只收 exact PDF 可核对的黑色 FE-18SR 与四种 soft nib code；旧红色库存、商店残留与历史价格不进入 current list。读者若面对红色或其它地区包装，应继续查后缀和年代，不能用本页 current table 自动覆盖。

树脂轴较轻不等于所有人都更舒适。试写时要比较握持重心、无套帽长写与 SEF 在自己的纸墨上是否过细。作者的“卡利感”是个人样本，不是出厂缺陷判定；真正持续刮纸、尖片错位或断墨仍需要检查。${sharedCopy(key)}`;
  if (key === "customNs") return `## Custom 名称里的钢尖入口

FKNS-1 的 current identity 很明确：特殊合金钢尖，EF、F、M、B；树脂轴帽；最大径 15.6mm、全长 143.9mm、22.6g；随附 CON-70N，并兼容 CON-40 和 CON-70N。它属于 Custom 梯级，却不能因为名字里有 Custom 就借 Custom 74 或 92 的金尖规格。

执行日 PDF 列出 mystery blue、nature green、ruby red、adventure brown 四组 current variants，每组对应四种尖宽。页面只让 exact FKNS-1 code 进入 variants。2020 文章出现的 dark/light blue、beige、red、black 是当时市场语境；即使名称有重叠，也不能越过 refresh 日期覆盖 current PDF。

Pencilcase 披露样本由 Casa Della Stilografica 送测。作者记录较长笔身、塑料结构、握位、螺纹存在感、钢尖体验，也讨论当时欧洲、日本、美国价格和 CON-40。这些意见能形成试写清单，但不能推翻执行日目录的 CON-70N supplied 字段，更不能用作者与 Custom 74/92 的比较证明 NS 共享它们的金尖。

页面把该来源放在 professional_sample_2020_pre_refresh scope：送测关系、作者意见、旧颜色、旧价格和当时包装一起保留。current FKNS-1 scope 则只接 Pilot PDF 和 category。两条轨道并列，使读者知道为何旧评测仍值得读，又不会把六年前的 lineup 当今天货架。

购买时先确认 FKNS-1 后缀和尖宽，再检查盒内 CON-70N 是否与销售说明一致。若二手卖家只写“Custom NS”而没有 code，应索取笔身、尖刻、盒标和颜色照片。钢尖不天然低于金尖，也不保证更硬或更顺；目标应是自己的纸墨和手感，而不是材料等级想象。${sharedCopy(key)}`;
  return `## current refresh 与旧样本要分开

P-FLT-1 current PDF 给出 F/M 特殊合金钢尖、树脂轴帽、snap cap、最大径 13.5mm、全长 142mm、12.3g，以及 CON-40/CON-70N 兼容。执行日颜色是 off-white、non-color、matte black、coral、turquoise、navy。旧 active yellow 不在这张 current variants 表里。

kamitopen 的文章最初发布于 2021-12-04，主图和长期使用对象是 active yellow，后来加入 2025-12-02 refresh 与 2026 更新。本文因此拆成 review_sample_2021_active_yellow、author_update_2025_2026 与 independent_dry_test 三个 scope。旧价、旧色和旧样本重量不覆盖 current PDF。

作者拆看 spring-loaded inner cap，并让一支装墨样本停放一年，每月写一两毫米检查能否出墨。这是设计观察和独立实验，不是 Pilot warranty，也不是所有墨水、环境和个体都能复现的一年保证。页面只写“作者该样本在其方法下仍可书写”，不把结论升级为 universal dry-up claim。

文章还觉得 cartridge 状态偏轻、装 CON-70 后重量更合适，并提醒 snap cap 快速拔开可能带来墨滴。这些同样属于个人体验。12.3g current official weight 与作者旧样本约 12.5g 可以并列，不能平均成新规格；converter 容量的自行测量也不替代官方兼容字段。

购买时先决定需要透明观察墨量还是涂装外观，再核对 P-FLT-1 尾缀。旧 active yellow 库存可能仍在市场，但它应按旧时态理解。使用 snap cap 时平稳拔合、长期停用前清洗；若希望验证气密表现，应在自己的墨水与环境中谨慎观察，而不是把单篇一年实验当免维护承诺。${sharedCopy(key)}`;
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
