# Phase 326 — Diplomat Excellence A+ 内容包

## 目标

在不重复已有 Diplomat Excellence A2/Elox 实体的前提下，新增官方当前目录中独立的 Excellence A+ 钢笔页，保留 A+ 三分之一圈螺纹帽、精确 SKU 规格、钢尖/14K 尖边界与 A2 身份边界。

## 范围

- 研究与正文：`.planning/content-research/diplomat-excellence-a-plus-phase326.md`
- 内容数据：`scripts/data/phase326-diplomat-excellence-a-plus.ts`
- checkpoint 应用脚本：`scripts/apply-phase326-diplomat-excellence-a-plus-content.ts`
- 定向回归：`tests/content/phase326-diplomat-excellence-a-plus.test.ts`
- 原创 factual SVG：`public/images/library/site-original/phase326/diplomat/excellence-a-plus.svg`

## 安全约束

- 只在测试创建的 owned checkpoint copy 中迁移、审核和发布。
- 脚本拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，并验证 checkpoint 不是 `data/fpkg.db` 或其 hard link。
- 保留其他 agent 的 research、`.next-phase*` 和受保护 quick 目录，不在本包中处理。

## 验收

1. 运行 Phase 326 定向 test，验证内容审核—发布、身份、maker/reverse topology、规格、来源、媒体、回放幂等与真实库快照不变。
2. 运行 TypeScript、Biome、`git diff --check`。
3. 只暂存本 Phase 326 明确拥有的文件，单独提交；本包不迁移真实资料库。
