# Phase439：五个薄品牌页深化

## 目标

在不写入真实 `data/fpkg.db` 的前提下，深化 Danitrio、J. G. Rider、WASP、Edison Pen Co、Namiki 五个已有品牌实体。沿用 canonical identity、已有公开型号、来源包和原创事实图，只刷新品牌级自然中文导航正文，并通过项目既有审核—发布路径。

## 范围

- 新增五份 Phase439 品牌正文副本：
  - `.planning/content-research/danitrio-brand-phase439.md`
  - `.planning/content-research/rider-brand-phase439.md`
  - `.planning/content-research/wasp-brand-phase439.md`
  - `.planning/content-research/edison-brand-phase439.md`
  - `.planning/content-research/namiki-brand-phase439.md`
- 新增 `scripts/data/phase439-brand-depth-refresh.ts`，从既有 Danitrio Densho、J. G. Rider、WASP、Edison Collier、Namiki 内容包复用来源、claims、媒体、时间线和身份关系。
- 新增窄范围 `scripts/apply-phase439-brand-depth-refresh.ts`：只接受 caller-owned、非 symlink／非 hard-link checkpoint copy；拒绝继承远程环境变量；用事实、语言、媒体三项审核后调用 `publishEntity`。
- 新增 `tests/content/phase439-brand-depth-refresh.test.ts`，覆盖远程环境拒绝、身份、正文长度、来源独立性、媒体、审核—发布、品牌反向导航、幂等重放和真实目录保护。

## 执行顺序

1. 从 Phase438 owned checkpoint 复制 checkpoint 文件，不触碰真实资料库。
2. 在 owned copy 应用五品牌包，回读正文、来源、媒体、publication 和型号反向导航。
3. 运行定向测试、Biome、TypeScript 基线检查、`git diff --check`。
4. 运行 SQLite integrity、实体质量审计和资料契约审计。
5. 只提交本批明确拥有的正文、脚本、测试和本记录；不提交 checkpoint 数据库，不触碰其它 agent 的 research、`.next-phase*` 或受保护 quick 目录。

## 非目标

- 不迁移真实 `data/fpkg.db`。
- 不同步 Turso、不部署生产、不做线上复查。
- 不扩建通用 AI／LLM 验收、Playwright 或 readiness 框架。
