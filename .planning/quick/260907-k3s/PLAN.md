---
status: complete
created: 2026-09-07
---

# Quick plan: Nettuno 1911 coverage gap

## Scope

基于 Phase 611 已冻结的品牌目录证据和当前可重放的官方／专业零售资料，新增 Nettuno 品牌及一个身份边界清晰的代表性现行钢笔型号；正文必须为自然中文并明确 1911 历史、现行品牌归属、产品系列与维护／选购边界。若资料不足以安全建立 maker／品牌关系，则保留为阻断审计，不制造身份。

所有试写只发生在 caller-owned checkpoint copy；真实 `data/fpkg.db` 仅在全部本地门禁、replay、构建和路由回读通过后做一次原子迁移。不得写入 Turso 或宣称线上完成；不得改搜索、LLM、Playwright 或通用 readiness 验收基础设施。

## Acceptance

- [x] 外部来源至少包含品牌历史／现行官方来源、产品规格来源和独立专业零售或评测来源；每个事实 claim／spec 有 scope 与 evidence。
- [x] 新身份无 entity／slug／alias 冲突；型号唯一 `made_by` Nettuno 且有反向导航；原有 public membership、links、payload 不变（目标新增除外）。
- [x] 品牌正文 >=1200 Unicode chars，型号正文 >=2000；各自恰有一个 approved primary media，来源快照和版权边界真实可复核。
- [x] owned copy 通过 032、integrity、evidence、publication、entity-quality、public-media、markdown、build 与实际本地路由回读；apply replay 为 noop。
- [x] 正式安装前后有 hash／备份／全量回归证据；远端迁移、部署、线上逐条复查继续明确标为未完成。

## Owned files

- `.planning/content-research/nettuno-*`
- `scripts/data/phase621-nettuno-1911.ts`
- `scripts/apply-phase621-nettuno-1911.ts`
- `tests/content/phase621-nettuno-1911.test.ts`
- `public/images/library/site-original/phase621/nettuno/*`
- 本 quick 目录的 PLAN/SUMMARY/evidence

## Protected files

保留所有既有 tracked/untracked research、`.next-phase*`、其它 quick 目录及 `.planning/content-research/research-skb-penton-2026-07-20.md` 的已有修改；每次提交只暂存本任务拥有文件。
