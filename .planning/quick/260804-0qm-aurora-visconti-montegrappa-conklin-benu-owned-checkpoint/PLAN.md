# Phase427：五个意大利／历史品牌页深化

## 目标

在不写入真实 `data/fpkg.db` 的前提下，补齐 Aurora、Visconti、Montegrappa、Conklin、BENU 五个仍偏薄的品牌导航页。沿用已有 canonical brand entities、可靠来源、图片和 `made_by` 身份关系，只更新可审核的中文正文与 publication content hash。

## 范围

- 新增五份 Phase427 研究／正文副本：
  - `.planning/content-research/aurora-brand-phase427.md`
  - `.planning/content-research/visconti-brand-phase427.md`
  - `.planning/content-research/montegrappa-brand-phase427.md`
  - `.planning/content-research/conklin-brand-phase427.md`
  - `.planning/content-research/benu-brand-phase427.md`
- 新增 `scripts/data/phase427-brand-depth-refresh.ts`，从既有 Aurora 88、Visconti Homo Sapiens、Montegrappa Extra 1930、Conklin Historic、BENU／Nahvalur packs 复用来源、claim、媒体和时间线。
- 新增窄范围 `scripts/apply-phase427-brand-depth-refresh.ts`：只接受 caller-owned、非 symlink／非 hard-link checkpoint copy；记录 fact、language、media 三项审核，再通过 `recordEntityContentReview` 与 `publishEntity` 发布。
- 新增 `tests/content/phase427-brand-depth-refresh.test.ts`，覆盖远程环境拒绝、身份、正文长度、来源独立性、媒体、审核—发布链路、品牌反向导航、幂等重放和真实目录保护。

## 执行顺序

1. 从 Phase426 owned checkpoint 复制 `checkpoint/fpkg.db`（不触碰真实资料库）。
2. 在 owned copy 执行 Phase427 五品牌包。
3. 运行定向测试、Biome、TypeScript 基线检查、`git diff --check`。
4. 运行 SQLite integrity、实体质量审计、资料契约审计和品牌导航查询。
5. 只提交本批明确拥有的正文、脚本、测试和本记录；不提交 checkpoint 数据库，也不触碰其它 agent 的 research、`.next-phase*` 或受保护 quick 目录。

## 非目标

- 不迁移真实 `data/fpkg.db`。
- 不同步 Turso、不部署生产、不做线上复查。
- 不扩建通用 AI／LLM 验收、Playwright 或 readiness 框架。
