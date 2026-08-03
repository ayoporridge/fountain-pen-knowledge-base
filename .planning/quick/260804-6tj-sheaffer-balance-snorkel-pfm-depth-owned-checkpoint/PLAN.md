# Phase 450：Sheaffer Balance、Snorkel、PFM 三个历史型号页深化

## 目标

在 Phase 449 owned checkpoint 上加深已有的 Sheaffer Balance、Sheaffer Snorkel、Sheaffer PFM 三个 canonical 历史型号页。复用 Phase 62 的实体、来源、维修边界和原创事实图，不重新建立旧的 Craftsman／Touchdown 混名实体，也不触碰真实 `data/fpkg.db`。

## 资料与身份边界

- Balance 是 1929 年起的流线型产品家族，尺寸、等级、杠杆和 Vacuum-Fil 阶段并存；它不是 Craftsman 的同义词。
- Snorkel 是约 1952–1959 年的 Touchdown 加伸缩吸墨管家族；成员的尖、帽材和等级不统一，PFM 是相邻但独立的旗舰路线。
- PFM（Pen For Men）是 1959–1968 年的旗舰嵌入尖家族；PFM I/II 的钯银尖与 III–V 的 14K 尖必须分开，不能与 Imperial、Targa、Legacy 互填。
- PenHero、Richard’s Pens 与 Vintage Pens 等历史资料支持型号与维修边界；单一样本测量和玩家写感不扩展为全家族规格。

## 实施边界

1. 只从 Phase 449 checkpoint 复制本阶段 owned `checkpoint.db`；apply 拒绝 remote、符号链接、真实库和硬链接，并核验真实 catalog snapshot 不变。
2. 三个历史型号走 `CuratedEntityPack`、`recordEntityContentReview`（fact/language/media）与 `publishEntity`，不直接写 publication 状态。
3. 只更新正文、来源 claims、scope 与 timeline；保留 Sheaffer 品牌关系、既有 ID、维修边界和品牌反向导航。

## 验收

- 三份研究 markdown 至少 3500 字符，发布正文至少 2600 字符；每个型号至少四条 approved references、三组独立来源、一个 approved primary media。
- 三个型号 identity／slug／品牌关系正确，审核 hash 可回读，publication 为 published，replay 全部 noop；真实库 SHA-256 与阶段前一致。
- 定向测试、Biome、`git diff --check`、TypeScript 基线检查完成；quality audit 与 library contract 结果记录在 SUMMARY。
