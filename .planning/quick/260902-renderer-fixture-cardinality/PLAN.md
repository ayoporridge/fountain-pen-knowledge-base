---
status: complete
created: 2026-09-02
---

# Renderer fixture primary-media cardinality repair

## Scope

修复 `scripts/check-renderer.ts` 的 owned renderer fixture 资产回填：只更新
fixture 自己创建的 canonical primary media，保留 gallery、remote-only 和
missing-attribution 负例的原始字段，使页面 loader 能验证 exactly-one
qualified primary media。

## Acceptance

- renderer fixture 资产回填不会改写负例 media 行。
- `pnpm exec tsx scripts/check-renderer.ts --spec=renderer --project=desktop`
  通过并生成 brand/model 证据。
- 相关 TypeScript、Biome、diff 检查通过。
- 不访问或写入 `data/fpkg.db`、Turso、production；不修改通用 E2E 基础设施。

## Tasks

- [x] 收窄 fixture 资产 UPDATE 条件。
- [x] 运行定向 renderer 验证与静态检查。
- [x] 记录结果并只提交本 quick task 拥有的文件。
