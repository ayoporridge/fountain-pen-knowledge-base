---
status: complete
created: 2026-09-07
---

# Quick plan: Nettuno 1911 coverage gap

## Scope

基于 Phase 611 已冻结的品牌目录证据和当前可重放的官方／专业零售资料，新增 Nettuno 品牌及一个身份边界清晰的代表性现行钢笔型号；正文必须为自然中文并明确 1911 历史、现行品牌归属、产品系列与维护／选购边界。若资料不足以安全建立 maker／品牌关系，则保留为阻断审计，不制造身份。

所有试写只发生在 caller-owned checkpoint copy；真实 `data/fpkg.db` 仅在全部本地门禁、replay、构建和路由回读通过后做一次原子迁移。Turso 仍不得在配额阻断时写入；线上状态必须以部署后的真实回读为准，不把部署 READY 等同于内容可用。不得改搜索、LLM、Playwright 或通用 readiness 验收基础设施。

## Acceptance

- [x] 外部来源至少包含品牌历史／现行官方来源、产品规格来源和独立专业零售或评测来源；每个事实 claim／spec 有 scope 与 evidence。
- [x] 新身份无 entity／slug／alias 冲突；型号唯一 `made_by` Nettuno 且有反向导航；原有 public membership、links、payload 不变（目标新增除外）。
- [x] 品牌正文 >=1200 Unicode chars，型号正文 >=2000；各自恰有一个 approved primary media，来源快照和版权边界真实可复核。
- [x] owned copy 通过 032、integrity、evidence、publication、entity-quality、public-media、markdown、build 与实际本地路由回读；apply replay 为 noop。
- [x] 正式安装前后有 hash／备份／全量回归证据；代码已推送 `master` 并完成 Vercel production 部署。
- [ ] Turso 迁移／catalog sync：生产环境 SQL read、快照 export 均被账户 rows-read 配额阻断；本任务未执行任何远端写入。
- [ ] 线上内容验收：1196 条 URL 已逐条回读但 1177 条动态实体页均是 error digest/loading shell，18 条静态/展览页为 HTTP 500；需先恢复 Turso 读权限再重跑。
- [x] 本地正式库的浏览器级逐页回读已覆盖 1,196/1,196；全部为 HTTP 200、唯一 H1、非空正文且无 loading shell／可见错误。
- [ ] 线上真人全页面遍历仍未完成；本地浏览器级回读不替代生产回读或人工可视化审阅。
- [ ] lint 全局门禁：`pnpm lint` 在扫描源码前即因既有 quick 证据目录中的嵌套 `biome.json` 配置退出；限定 `src scripts tests` 的 `biome check` 仍报告 73 个既有 errors、3 个 warnings，本 quick 未改动这些 legacy 文件。

## Owned files

- `.planning/content-research/nettuno-*`
- `scripts/data/phase621-nettuno-1911.ts`
- `scripts/apply-phase621-nettuno-1911.ts`
- `tests/content/phase621-nettuno-1911.test.ts`
- `public/images/library/site-original/phase621/nettuno/*`
- 本 quick 目录的 PLAN/SUMMARY/evidence

## Protected files

保留所有既有 tracked/untracked research、`.next-phase*`、其它 quick 目录及 `.planning/content-research/research-skb-penton-2026-07-20.md` 的已有修改；每次提交只暂存本任务拥有文件。
