# Phase 415 摘要

本阶段深化既有 Pelikan Souverän M400（`EF34ulVg8PSK`），不新增重复实体；真实 `data/fpkg.db` 未写入。正文 8,002 Unicode 字符，20 个来源、17 个独立组，14 个变体（4 color、4 nib、5 edition_group、1 market_sku）。现行黑绿产品号 994863、1982 Old Style、1997-09 后 New Style、1950 年代 Pelikan 400 前代边界、日本市场 `#500/M500` 和现行/历史尺寸冲突均分层记录。

## 验证证据

- 定向测试 `tests/content/phase415-pelikan-m400-refresh.test.ts`：1/1 通过，约 89 秒；拒绝空 reviewer 与继承远程 URL，发布后再次调用返回 `noop`。
- 持久 checkpoint：`.planning/quick/260803-rtu-raw-pelikan-souver-n-m400-checkpoint-onl/checkpoint/fpkg.db`；首次发布内容哈希 `sha256:v3:b670e8740a8ead68b4c92449672d7add30cdf92ef369e5eb938dda1dd287f750`，第二次 replay 同哈希 `noop`。
- checkpoint 回读：公开页 `pen/pelikan-souveran-m400`，正文 8,002；引用 20/17；readiness `0/[]/1`；当前哈希下 fact/language/media/publication 四项均 approved；`PRAGMA integrity_check` 为 `ok`；品牌关系 `made_by` 与反向导航各 1 条。
- checkpoint 发布后主文件 SHA-256：`5c3ef8761c4a676735e04a331e369cb279e6dea0e38e20373df2c600d55520b3`。
- 真实库回读 SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本阶段没有正式迁移。
- `pnpm exec tsc --noEmit` 仍只有仓库既有的 3 条诊断（phase346 TS7022 两条、Turso migration NODE_ENV TS2741）；无 Phase 415 新诊断。Biome 定向检查与 `git diff --check` 通过。

## 当前状态

- 研究与内容包：完成
- checkpoint 定向回归与 replay：完成
- 真实库迁移：本阶段不执行，等待全量内容包统一迁移
