# Phase432：五个偏薄品牌页深化

## 目标

在不写入真实 `data/fpkg.db` 的前提下，深化 Kilk、Fine Writing International、YSTUDIO、大公 Dagong、唐月 TangMoon 五个已有品牌实体。沿用既有 canonical identity、公开型号、来源和原创事实图，只更新品牌导航正文并通过项目既有审核—发布路径。

## 范围

- 新增五份 Phase432 品牌研究／正文副本：
  - `.planning/content-research/kilk-brand-phase432.md`
  - `.planning/content-research/fwi-brand-phase432.md`
  - `.planning/content-research/ystudio-brand-phase432.md`
  - `.planning/content-research/dagong-brand-phase432.md`
  - `.planning/content-research/tangmoon-brand-phase432.md`
- 新增 `scripts/data/phase432-brand-depth-refresh.ts`，从既有 Kilk Orient、Fine Writing International Fenestro、YSTUDIO Classic Revolve、大公 Dagong 56、唐月 E5 packs 复用来源、claim、媒体、时间线和身份关系。
- 新增窄范围 `scripts/apply-phase432-brand-depth-refresh.ts`：只接受 caller-owned、非 symlink／非 hard-link checkpoint copy；使用 `recordEntityContentReview` 记录 fact、language、media，再用 `publishEntity` 发布。
- 新增 `tests/content/phase432-brand-depth-refresh.test.ts`，覆盖远程环境拒绝、身份、正文长度、来源独立性、媒体、审核—发布链路、品牌反向导航、幂等重放和真实目录保护。

## 执行顺序

1. 从 Phase431 owned checkpoint 复制 checkpoint 文件，不触碰真实资料库。
2. 在 owned copy 执行五品牌包并回读正文、来源、媒体、publication 和反向导航。
3. 运行定向测试、Biome、TypeScript 基线检查、`git diff --check`。
4. 运行 SQLite integrity、实体质量审计、资料契约审计和品牌导航查询。
5. 只提交本批明确拥有的正文、脚本、测试和本记录；不提交 checkpoint 数据库，也不触碰其它 agent 的 research、`.next-phase*` 或受保护 quick 目录。

## 非目标

- 不迁移真实 `data/fpkg.db`。
- 不同步 Turso、不部署生产、不做线上复查。
- 不扩建通用 AI／LLM 验收、Playwright 或 readiness 框架。
