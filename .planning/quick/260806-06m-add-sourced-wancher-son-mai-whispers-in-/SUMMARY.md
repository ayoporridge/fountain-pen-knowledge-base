---
status: complete
completed: 2026-08-06
---

# Phase 520 summary

完成 Wancher Son Mai “Whispers in Bloom” 四个 sibling 内容包：White Lotus、The Crimson Lotus、The Hoa Ban、The Crimson Hoa Ban。四篇中文研究稿写入官方 product id/handle、Type 与 SKU、Pham Chinh Trung、Sơn Mài/蛋壳工艺、尖/feed、欧规供墨、154.8/135.5 mm 尺寸、28/19 g 重量、包装、维护和选购边界，并用越南工贸部来源提供独立工艺背景。

交付内容包括四张原创 factual SVG、四包 `CuratedEntityPack`、审核—发布门槛保护的 checkpoint apply 脚本，以及定向发布/重放/关系/来源/媒体测试。所有实体都通过 Wancher maker/reverse topology，Type 选项和 craft context 保持独立，不合并 Lotus/Hoa Ban 或黑红底座。

验证证据：

- `pnpm exec tsx --test tests/content/phase520-wancher-son-mai-whispers-in-bloom.test.ts`：通过；四包首次发布、远程环境拒绝、审核—发布链路、来源/规格/媒体、品牌关系、重放 noop 和真实 catalog snapshot 保护均通过。
- `pnpm exec tsc --noEmit`：仅剩既有 baseline 错误：`tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022，以及 `tests/migration/sync-local-catalog-to-turso.test.ts` 的 NODE_ENV TS2741；本包无新增 TypeScript 错误。
- Biome 对新测试文件通过；提交前执行 staged diff 检查。

真实 `data/fpkg.db`、Turso 和生产站点没有写入；本批只在 disposable checkpoint copy 中验证，正式迁移和线上复查仍属于全量目标的后续工作。
