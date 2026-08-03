# Quick 260803-dn8：HongDian N23 来源化内容包

## 目标

为当前真实目录中确认缺失的 HongDian N23（2023 Year of the Rabbit）建立一个可重放的来源化型号页，并把它接入既有 HongDian 品牌导航。只在 caller-owned checkpoint copy 试写，真实 `data/fpkg.db` 与 Turso 保持只读。

## 任务

- [x] 记录官方边界、专业零售资料、独立实物／评测资料与冲突，不把未核实网站当官方。
- [x] 写自然中文正文、规格、版本／颜色／笔尖差异、维护和选购建议，以及本站原创事实示意图。
- [x] 使用既有 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity` 审核—发布路径；建立唯一 HongDian `made_by` 与品牌反向导航。
- [x] 在新 checkpoint copy 运行定向测试、重放与回读；检查来源、媒体、审核、冲突、完整性和真实目录哈希。
- [x] 只提交本 quick 的研究／内容包／测试／示意图／PLAN、SUMMARY；不提交 checkpoint DB 或其他 agent 文件。

## 验收记录（2026-08-03）

- 资料边界：未找到可独立核验的 HongDian 官方钢笔 N23 产品页；`thehongdian.com` 未作为官方引用。正文使用 TTPEN、Makoba、Fountain Pen Companion、Penexchange 与 Rupert Arzeian，分别保留渠道／单支样本范围。
- 内容：`.planning/content-research/hongdian-n23-phase383.md`；本站原创示意图：`public/images/library/site-original/phase383/hongdian/n23.svg`。
- checkpoint：`.planning/quick/260803-dn8-add-hongdian-n23-sourced-content-package/checkpoint/fpkg-copy.db`；源真实库 SHA-256 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；checkpoint SHA-256 `ecbf118bcea497b318637e182f4a32fce65dfb8a3f33403f3e8d7eb4639ac31f`。
- 回放：HongDian 品牌重发、N23 新实体均 `published`；N23 正文长度 3,925 字符。
- 计数：checkpoint `entities=951`、`entity_publications=666`、`public_entities=905`；真实库保持 `950/665/904`。
- 身份：N23 `made_by` 唯一指向 HongDian `4yRpvovXFoWh`，品牌有唯一 `reverse` 入口；型号无同名／slug collision。
- 审核／来源：N23 的 fact、language、media、publication 四项当前 hash 均 `approved`；7 个 approved source items、6 个 source records；来源组为 1 个 primary/archive、3 个 professional_secondary、1 个 auxiliary。
- 媒体：1 条 `approved/primary` SVG；没有使用第三方产品照片。
- fact conflict：N23 `0`；不同渠道的尖材质、饰件、包装差异已写入范围说明，没有强行合并。
- 完整性：checkpoint 与真实库 `PRAGMA integrity_check` 均为 `ok`；真实 `data/fpkg.db` 哈希在回放前后不变；脚本拒绝继承 `TURSO_DATABASE_URL` 的远程选择。
- 定向测试：`pnpm exec tsx --test tests/content/phase383-hongdian-n23.test.ts` 两次通过；Biome 定向检查通过；全仓 `tsc --noEmit` 仅剩既有 phase346 两个 TS7022 与 Turso 测试缺 NODE_ENV，未新增 Phase 383 诊断。

## 资料边界

- HongDian 官方钢笔产品目录目前未找到可独立核验的 N23 官方产品页；不把 `thehongdian.com` 视为官方站。
- TTPEN、Makoba、Fountain Pen Companion、Penexchange 与 Rupert Arzeian 的公开页面只作相应层级资料；价格、库存、包装、单支写感和具体颜色／笔尖按页面或样本范围陈述。
- 3.4 mm 孔径、标准墨囊兼容、可替换笔尖和长期品控不在核心规格中断言，除非明确写为经验／待核对边界。

## 不在本 quick

- 不正式迁移 `data/fpkg.db` 或 Turso。
- 不删除或提交其他 agent 的 research、`.next-phase*`、旧 quick 目录。
- 不扩建通用验收、Playwright 或 AI/LLM 功能。
