# Quick Task Plan: Wancher Dream Pen Aluminum Contemporary

## Goal

在不连接 Turso、且不改写 `data/fpkg.db` 的前提下，为 Wancher Dream Pen Aluminum Contemporary 建立来源化具体型号内容包，并在 owned checkpoint copy 上完成审核—发布路径与离线回归。

## Scope

- 使用 Wancher 官方产品页、官方 product JSON、官方系列／护理／保修页、Wancher 官方 Rakuten 店铺和一篇独立相邻型号评测。
- 保留 Aluminum Classic 与 Aluminum Contemporary 两个独立实体；不新建尖幅实体，不把颜色当作同一型号变体。
- 新增原创 factual SVG，明确非产品照片、非 Logo、不按比例、非颜色校样。
- 只暂存本 quick task 明确拥有的研究、脚本、数据包、测试、图片与证据文件。

## Verification

1. 定向 content test 在 owned checkpoint copy 通过，并包含 remote-env 拒绝、首次发布、重放 noop、身份关系和正文断言。
2. `pnpm exec tsc --noEmit`、Biome、SVG XML、`git diff --check` 通过。
3. owned checkpoint 上完成 coverage、quality、readiness-v2、library/data contract 审计；记录 backlog，不把离线审计当成全量完成。
4. 迁移前后真实 `data/fpkg.db` 的 SHA-256 不变。

## Explicit non-goals

- 不访问或写入 Turso。
- 不正式迁移、部署或声称线上完成。
- 不删除或提交其他 agent 的 research、`.next-phase*` 或受保护 quick 目录。
