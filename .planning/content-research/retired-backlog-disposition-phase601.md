# Phase 601：retired backlog 处置清单

复核日期：2026-08-12。数据源是 Phase 600 caller-owned checkpoint；不读取或写入真实 `data/fpkg.db`，不重新盘点 873 个 brand／pen inventory。

## 口径

readiness 的 `24 backlog` 只计算 brand 与 pen。数据库另有一条 retired nib `sailor-naginata-togi`，因此本清单共处置 25 条 retired publication。retired donor 不是公开内容缺页；只有当它缺少可解释的 lineage／redirect，或者身份仍无法确认时，才是本阶段要继续工作的缺口。

## A. 已有唯一公开 successor 与旧路由（14）

| Retired donor | 处置 | 当前结论 |
| --- | --- | --- |
| `sheaffer-s-touchdown-tm` | redirect + retire lineage → `touchdown-tm` | terminal |
| `wancher-dream-pen-zogan-momiji-green-tamamushi` | redirect + lineage → `wancher-zogan-momiji-green-tamamushi` | terminal |
| `wancher-oita-urushi-kurozan` | redirect + merge → `wancher-oita-urushi-kurozan-fountain-pen` | terminal |
| `写乐-sailor-21k-pro-gear-大鱼雷` | redirect + merge → `sailor-pro-gear` | terminal |
| `waterman-allure-fountain-pen` | redirect + merge → `waterman-allure` | terminal |
| `waterman-exception-fountain-pen` | redirect + merge → `waterman-exception` | terminal |
| `弘典-hongdian-苏木` | redirect + merge → `弘典-hongdian-1866` | terminal |
| `parker-51-vintage` | redirect + merge → `派克-parker-51-经典-vintage` | terminal |
| `百乐-pilot-capless-decimo` | redirect → `pilot-capless-decimo` | terminal；split 详情由 canonical 页面承担 |
| `百乐-pilot-custom-823` | redirect + merge → `pilot-custom-823` | terminal |
| `百利金-pelikan-m605白乌龟` | redirect → `pelikan-souveran-m600-tortoiseshell-white-2012` | terminal |
| `百利金-pelikan-m800` | Phase 504 merge + redirect → `pelikan-souveran-m800` | Phase 600 链缺失；Phase 601 owned copy 首次重放为 `applied`，第二次为 `noop` |
| `维斯康蒂-visconti-homo-sapiens智人` | redirect → `/brand/visconti` | terminal；不把泛称强绑到任一具体 sibling |
| `英雄派迪-一体尖` | redirect + retire lineage → `paidi-century-1` | terminal |

这些 donor 应继续保持 retired；把它们重新发布会重新制造 duplicate 或混名。

## B. 一对多 split，不能任意选一个 sibling（3）

| Retired donor | Published outputs | 后续动作 |
| --- | --- | --- |
| `leonardo-furore-momento-magico` | `leonardo-furore`、`leonardo-momento-magico` | 保留 split lineage；旧混合路由需要双链接导航或明确 fallback，不能永久跳到其中一支 |
| `opus-88-demo-kolora` | `opus-88-demo`、`opus-88-koloro` | 保留 split lineage；旧混合路由需要双链接导航或明确 fallback |
| `sheaffer-s-craftsman` | `craftsman-balance`、`craftsman-33t-1949-lever`、`craftsman-tip-dip-touchdown` | 保留三向 split；旧泛称需要年代导航，不能假装只有一个 Craftsman |

三个 output 集合均已 published。这里缺的是旧混合入口的解释性导航，不是新建三个型号。

## C. 明确保持 hard-404 的 mixed donor（1）

`犀飞利-sheaffer-帝国元首` 同时混入 Imperial 与 Legacy 语义。Phase 106 已发布独立 `sheaffer-imperial`，并明确拒绝把旧 donor 重定向过去；在没有证据证明旧中文名只指 Imperial 前，保持 retired hard-404 比错误 redirect 更安全。

## D. 可确定的品牌 placeholder（1）

`奥罗拉-aurora` 是误建为 pen 的品牌占位符；canonical `aurora` 品牌已 published，原 taxonomy split 已产生 Aurora 88 与 Optima。Phase 41 已把旧 `/pen/奥罗拉-aurora` 设为带 `brand_generic_placeholder_retired` 原因的 hard-404；Phase 601 保留这一已审核路由，只补 donor → Aurora 品牌的 retire lineage，不把旧路径误导到品牌页或任一具体型号。

## E. 仍需外部身份研究（6）

| Entity | 缺口 |
| --- | --- |
| retired nib `sailor-naginata-togi` | “长刀研”可能是 nib craft／grind 泛称，不能仅因存在 `10-7121` 就合并成单一钢笔；需要决定恢复为 nib/concept 还是建立解释性入口 |
| brand `shanghai` | 品牌主体、年代与产品归属未锁定 |
| brand `banju` | 品牌主体与官方／档案来源未锁定 |
| brand `saier` | 品牌主体与产品归属未锁定 |
| brand `yisihua` | 品牌主体与 Asvine 等相似名称边界未锁定 |
| pen `skb派顿-f10-f21` | 现有研究提示并非台湾 SKB canonical，F10 与 F21 是否同厂／同系列仍需来源确认 |

这 6 条是 Phase 601 后真正的身份研究队列；不得为降低 backlog 数字而强行发布。

## 当前阶段结论

- 14 条是已有 canonical route 的 terminal donor，其中 Pelikan M800 的现成 Phase 504 修复确实未进入 Phase 600 链，已在新 owned copy 验证可重放。
- 3 条需要一对多导航，不能错误合并。
- 1 条 mixed donor 按既有研究继续 hard-404。
- 1 条 Aurora placeholder 保留既有 hard-404，并补可审计的品牌 lineage。
- 6 条需要新的可靠外部身份研究。

因此后续不能再笼统声称“24 条都未修”；真正未决的是三组 split 导航、Aurora 旧入口和六条身份研究，同时必须把 Phase 504 纳入最终 canonical replay 链。
