# Phase 611：四家公开钢笔目录覆盖冻结

## 审计目的

Phase 611 只回答一个问题：Goldspot、Goulet、Atlas Stationers 与 Pen Chalet 当前公开目录里的品牌和钢笔商品身份，是否已经落入候选库的 121 个公开品牌与 740 个公开钢笔型号；若未落入，哪些稳定身份必须在正式本地迁移前另开内容包。

这不是第二轮正文、规格、图片或 publication readiness 盘点。比较面限定为公开实体的 canonical name、alias、唯一 `made_by` 关系与已审核的 family／variant 线索。颜色、镀层、笔尖宽度、地区配色和零售 exclusive 默认不是独立型号。

## Phase 605 证据边界

旧 Phase 605 包留下四个目录入口 URL，但没有网页原始快照、规范化目录行或逐行 coverage ledger。它最终加入 10 个公开实体：PENLUX、Ferris Wheel Press、Tom's Studio、Radius 1934、Hinze Pen Company 五个品牌，以及每个品牌各一个代表型号。

旧研究稿明确列出 4 个具体 deferred 候选：Kakimori、TRAVELER'S COMPANY、Zebra、Nettuno 1911；另有“地区单人工作室与单店 exclusive”这一集合项。没有 explicit reject。Phase 605 资料源中的 `archive_locator` 明示 `live-source-not-frozen` 与 `external_archive=false`，因此不能把来源登记误当成目录存档。

旧基线还存在一处 off-by-one：Phase 604 实际是 116 个公开品牌、735 个公开 pen；Phase 605 增加 5+5 后成为 121／740。旧研究稿只修正这一行，不改写其余判断。

## 采集与完成性契约

- Goldspot、Goulet 与 Atlas 只接受 in-app browser 的真实 rendered DOM。HTTP 200 的 challenge、验证页、空壳或未加载完页面一律失败。
- Pen Chalet 可接受 in-app browser，也可接受普通 GET，但后者必须同时满足 HTTP 200、品牌目录标记、非空目录行且无 challenge signal。
- 每页保存 rendered HTML、visible text、逐行 `text/href/locator` NDJSON；Atlas 必须覆盖全部 41 页。截图固定保存目录起点和 exhaustion 终点，不用截图替代中间页 HTML／行级证据。
- 每个 raw 文件进入 capture manifest，记录 UTC 时间、起始／最终 URL、字节数与 SHA-256。规范化行保留零售原文、href、snapshot hash 与 DOM/text locator。

## 采集结果

四站均在 2026-08-13 通过 in-app browser 的真实 rendered DOM 冻结。Goldspot、Goulet 与 Pen Chalet 是单页目录；Atlas 的 41 页逐页保存 HTML、visible text 与行级 NDJSON，并以第 41 页不存在更高页码作为 exhaustion 证据。四站合计 1,433 行，规范化后仍为 1,433 行，没有在采集阶段合并同名品牌、颜色或套装。

| Retailer | 方法 | 页面 | 原始行 | 快照摘要 |
|---|---:|---:|---:|---|
| Goldspot | `iab_rendered_dom` | 1 | 70 | page-001 HTML `45bd4ea9…641c`；截图 `0c337b59…2a6` |
| Goulet | `iab_rendered_dom` | 1 | 69 | page-001 HTML `543b3e7a…45dd`；截图 `673995e1…3677` |
| Atlas Stationers | `iab_rendered_dom` | 41 | 1,202 | page-001 HTML `e6fa848c…c87b`；page-041 HTML `80e2e929…ab90`；首末页截图均已保存 |
| Pen Chalet | `iab_rendered_dom` | 1 | 92 | page-001 HTML `7d8389e5…0810`；截图 `bb9a5918…6921` |

关键冻结文件 SHA-256：

- `raw/capture-manifest.json`：`52c90141d3cc55af72fbe7473cc6f667ff97a53330958742adfab3f83c2934ea`
- `normalized/directory-rows.ndjson`：`2aaaef63dda6e6aa190a6b4c58d11dd34eb82dddcd8c0268750e8267822daf5d`
- `normalized/current-public-identities.ndjson`：`b2a048333d0dd41d4c0f811c99f75f5e98a173b48b7044946c43cf0736e21d08`
- `normalized/match-candidates.ndjson`：`4b50e2ac7399e5ae13744b459bb3f040bc799b4f9534df2eedbdcb96aa10afcd`

自动匹配只作为人工审读入口：1,433 行中有 101 行得到至少一个候选，共 173 个候选（canonical 59、alias 112、variant 2）；Atlas 的商品标题不能靠整串 exact matcher 自动签发。每个最终判断都回读原始 locator、当前 public identity 与 maker/family 边界。

## Coverage dispositions

1,433 行与 ledger 严格一一对应，`pending=0`。`covered_alias` 只接受当前 identity 已登记的 alias；IKKAKU、WAHL-EVERSHARP、OMAS／当代 OMAS、Narwhal／Nahvalur 等有主体或子品牌歧义的标签没有被强行签成 alias。

| disposition | count |
|---|---:|
| covered_exact | 3 |
| covered_alias | 104 |
| covered_family_or_variant | 850 |
| blocking_gap | 39 |
| deferred | 346 |
| rejected | 91 |

其中 850 个 `covered_family_or_variant` 都指向公开 pen，并且 `maker_entity_id` 与该 pen 当前唯一 `made_by` 关系一致。`rejected` 主要是 ink、ballpoint、rollerball、纸品或无法构成钢笔身份的目录项。`deferred` 包含两类：真正需要身份研究的模糊项，以及 102 条已有代表 blocker 的颜色、饰件、尖宽、套装或重复商店行；后者不会再制造一个内容任务。

## Blocking-gap handoff

第一轮 SKU 级 proposal 曾得到 141 条相关缺口行；逐行复核后，只保留 39 条代表性 `blocking_gap`，其余 102 条作为 supporting sibling 留在 ledger 的 `deferred`，理由中明确回指代表 row。39 条代表行再按品牌与型号合并为 33 个后续内容包。`blocking-gap-clusters.json` 保存每包的 representative rows、supporting rows、全部 source rows、官方 URL 与建议 package key；39 + 102 的并集恰好覆盖 141 条原始相关行，无重复、无遗失。

33 个后续包如下：

| 分组 | 后续内容包 |
|---|---|
| 新品牌与代表型号 | Endless + Phantom Retractable；Jacques Herbin + Transparent Pump-action 22000T；Kakimori + Aluminium/Frost；Kolo + Tino；LeBoeuf + Pilgrim Heritage；Marlen + M20；Sensa + Sensagraph；Tom Hessin + Charles；TRAVELER'S COMPANY + Brass Fountain Pen；Wearingeul + Preface；Zebra + Fountain Pen（48307 仅作 7 色套装 SKU） |
| Pilot／Namiki／Sailor | Precise Varsity（Varsity 为 alias）；Explorer；Namiki Aya；Sailor 基础 Fude de Mannen 12-0150 |
| 德国与欧洲系列 | Graf von Faber-Castell Guilloche；Tamitio；Kaweco Titan Sport；Visconti Mirage Mythos；Waldmann Tango；Stipula Gladiator |
| Monteverde | Innova Formula M；Innova Ombre Fusion；MVP；Dakota；MP1；Axis。generic Innova 是 umbrella，不另建一个笼统型号 |
| Sheaffer／Esterbrook／Ferris Wheel Press | Sheaffer 100、300、VFM；Esterbrook Niblet；Ferris Wheel Press Bijou、Marquise |

每条代表 blocker 都保存本目录的 `row:<row_id>` 与 exact 官方 `url:`，满足“一家专业目录 + 品牌官网稳定产品线”的独立来源门槛。值得保留的身份边界包括：

- Wearingeul 使用真实产品路径 `/shop_view/?idx=1577`，没有把带 `idx` 的首页当产品页；两个主题 SKU 归一个 Preface family。
- Zebra 48307 是官方 7 色 pack SKU，后续 canonical 是 Zebra Fountain Pen family，不建名为“48307”的型号。
- Sailor 只覆盖基础 12-0150，不吞并 Profit、Naginata 或 30th 限量版的 Fude de Mannen。
- Nettuno Superba、Nino Marino Columbus、Dominant Industry／Keyno、TACCIA Empress、Namiki Chinkin／Yukari、Kaweco Piston AL Sport、Visconti Homo Sapiens 等仍因 maker、系列层级或结构差异留在 deferred，不用弱证据提前建实体。
- 已有 The Studio、Eversharp Skyline、Delta Dolcevita Mid-Size、Diplomat Excellence A+ Waves 与 Radius Settimo 的零售行已纠回现有 family，不重复创建。

最终 ledger SHA-256 为 `a90e2bf33e25c124b03ad0b41f73381dc1c52a19bf4a7c19d18485c570408302`；39 行 blocker 投影为 `93002c76220fa292c67ff894cb15481fb708ca8a582cbf99d6abba269a1af6ca`；33 包 cluster handoff 为 `91d45b1ad0956dbdc415ac93739b3ebb6e49d73f8cac14b35beef1c1a04210db`。

Phase 611 不创建实体、不写 SQLite，也不访问 Turso。上述 33 包必须继续执行来源检索、自然中文正文、准确图片、`CuratedEntityPack`、三项内容审核、`publishEntity` 与定向回归。

## Freeze 结论

`verify-final` 在最终 artifact manifest 建立后连续两次通过：4 个 capture、1,433 个目录行、121 个公开品牌、740 个公开 pen、5 张身份 allowlist 表、`pending=0`。候选 checkpoint 与真实 `data/fpkg.db` 均通过 immutable read-only 路径检查，主文件前后不变，且没有留下 WAL／SHM sidecar；Turso selector 被显式撤下，远端未访问。

这次冻结只证明四个指定目录在 2026-08-13 的身份差异已经有可重放边界。由于 33 个来源化内容包尚未完成，正式本地资料库尚未迁移，生产站也尚未部署和逐页复查，full-corpus goal 继续保持 active，不能以 Phase 611 或任一单包完成冒充总目标完成。
