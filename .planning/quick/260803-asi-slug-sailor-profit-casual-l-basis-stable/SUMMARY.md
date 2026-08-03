# Summary

本 quick 用于 Sailor Profit Casual L 11-0820、Basis 11-0822、Stable 11-0825。三者同属 1911／Profit Casual L 新平台，但结构不同，不能合并成一个颜色页：Basis 有帽环，Stable 使用黄铜 Gold IP 大先且空笔 23.9 g，普通 11-0820 为 PMMA 大先且 19.8 g。

尚未执行真实资料库写入或线上部署。持久 checkpoint 为
`.planning/quick/260803-asi-slug-sailor-profit-casual-l-basis-stable/checkpoint/fpkg-copy.db`。

证据（2026-08-03）：

- 首轮 apply：品牌、11-0820、11-0822、11-0825 均 `published`；第二轮 replay 四者均 `noop`。
- 每个型号：4 个颜色变体、9 条来源、fact/language/media/publication 四项审核均 `approved`；主媒体为本批原创 factual SVG；`made_by` 唯一指向 Sailor，品牌 reverse 链接 3 条。
- 上市时间回读：11-0820=`2025-10-04`，11-0822=`2026-05-16`，11-0825=`2026-02-28`。
- 受保护真实库 SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；checkpoint 写入后 SHA-256：`4c8fe9771dc2c5a13c8fe746de78e2e895c990cddac3d83771431a6ac518969a`。
- `pnpm exec tsx --test tests/content/phase375-sailor-profit-casual-l.test.ts`：1/1 passed（约 56 秒）。
- `pnpm exec tsc --noEmit`：仅仓库既有 `tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022 与 `tests/migration/sync-local-catalog-to-turso.test.ts` 一个 TS2741；本批无新增诊断。
- `pnpm exec biome check --write` 已检查本批 TypeScript 文件；`git diff --check` 在提交前复核。

本批仍未迁移到真实 `data/fpkg.db`、Turso 或线上站点；全量 goal 继续保持 active。
