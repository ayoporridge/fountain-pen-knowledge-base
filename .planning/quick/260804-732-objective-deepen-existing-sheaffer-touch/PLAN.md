# Sheaffer Touchdown TM、Craftsman Balance、Tip-Dip Touchdown 深化

## 目标

在 Phase 450 owned checkpoint 上深化三个已有 canonical Sheaffer 型号页：Touchdown TM `s56SHFTDTM`、Craftsman (Balance) `s56SHFCRBAL`、Craftsman Tip-Dip Touchdown `s56SHFCRTDTIP`。沿用 Phase 56 的研究包、来源和原创事实图，不建立新的 raw／混名实体，不触碰真实 `data/fpkg.db`。

## 内容边界

- Touchdown TM 是 1950–1952 年无 Snorkel 伸缩管的细身 Touchdown 家族；Sentinel、Valiant、Craftsman 等成员的尖、帽和价格不互填。
- Craftsman (Balance) 只承载 Balance-era 低价全尺寸命名；No. 3/33 尖、颜色和杠杆/Vacuum-Fil 证据必须与 33T、Tip-Dip、TM 分开。
- Tip-Dip Touchdown 是 1952 年后以 Touchdown 囊体和中心开口可换尖为特征的低价线；它不是 Snorkel，也不是普通 Craftsman Balance。
- 内容分别补足历史、结构、版本识别、维修、选购和证据粒度；单个卖家样本的长度、手感和价格不扩展为全家族规格。

## 实施与验收

1. 只在本目录 checkpoint copy 上 apply；脚本拒绝 remote、符号链接、硬链接和真实数据库，并核验 `032_taxonomy_identity.sql`。
2. 三个 `CuratedEntityPack` 通过 `recordEntityContentReview` 的 fact/language/media 审核，再由 `publishEntity` 发布；不直接写 publication 状态。
3. 三份正文各至少 3500 字符，发布 body 各至少 2600 字符；每个型号至少 4 条 approved references、3 组独立来源、1 个 approved primary media，恰好一条 maker 与一条 reverse。
4. 定向测试验证 canonical ID/slug、审核 hash、发布状态、回放 `noop` 和真实库快照不变；随后跑 integrity、quality audit、library contract、Biome、diff check 与 TypeScript 基线。
