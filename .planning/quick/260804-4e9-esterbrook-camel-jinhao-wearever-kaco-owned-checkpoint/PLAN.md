# Phase441：五个薄品牌页深化

## 目标

在不写入真实 `data/fpkg.db` 的前提下，深化 Esterbrook、Camel Pen Company、Jinhao、Wearever、KACO 五个已有品牌实体。沿用 canonical identity、已有公开型号、来源包和原创事实图，只刷新品牌级自然中文导航正文，并通过项目既有审核—发布路径。

## 范围

- 新增五份 Phase441 品牌正文副本：
  - `.planning/content-research/esterbrook-brand-phase441.md`
  - `.planning/content-research/camel-brand-phase441.md`
  - `.planning/content-research/jinhao-brand-phase441.md`
  - `.planning/content-research/wearever-brand-phase441.md`
  - `.planning/content-research/kaco-brand-phase441.md`
- 新增 `scripts/data/phase441-brand-depth-refresh.ts`，从既有 Esterbrook Dollar Pen、Camel Pen、Jinhao 159/X159、Wearever Zenith、KACO Master 14K 内容包复用来源、claims、媒体、时间线和身份关系；Jinhao 品牌额外复用同包 159 历史讨论作为第四个品牌参考。
- 新增窄范围 `scripts/apply-phase441-brand-depth-refresh.ts`：只接受 caller-owned、非 symlink／非 hard-link checkpoint copy；拒绝继承远程环境变量；用事实、语言、媒体三项审核后调用 `publishEntity`。
- 新增 `tests/content/phase441-brand-depth-refresh.test.ts`，覆盖远程环境拒绝、身份、正文长度、来源独立性、媒体、审核—发布、品牌反向导航、幂等重放和真实目录保护。

## 执行顺序

1. 从 Phase440 owned checkpoint 复制 checkpoint 文件，不触碰真实资料库。
2. 在 owned copy 应用五品牌包，回读正文、来源、媒体、publication 和型号反向导航。
3. 运行定向测试、Biome、TypeScript 基线检查、`git diff --check`。
4. 运行 SQLite integrity、实体质量审计和资料契约审计。
5. 只提交本批明确拥有的正文、脚本、测试和本记录；不提交 checkpoint 数据库，不触碰其它 agent 的 research、`.next-phase*` 或受保护 quick 目录。

## 非目标

- 不迁移真实 `data/fpkg.db`。
- 不同步 Turso、不部署生产、不做线上复查。
- 不扩建通用 AI／LLM 验收、Playwright 或 readiness 框架。
