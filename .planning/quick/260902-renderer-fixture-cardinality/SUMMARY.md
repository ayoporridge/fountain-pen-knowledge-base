---
status: complete
completed: 2026-09-02
---

# Renderer fixture primary-media cardinality repair

## Result

修复 `scripts/check-renderer.ts` 的 owned fixture 资产回填条件：现在只更新
`*-media-primary` 行，不会覆盖 gallery、remote-only 或 missing-attribution
负例。临时服务改为直接启动 Next CLI，避免嵌套包管理器进程在正常停止时把成功
的 renderer 检查留在 143 状态。

## Verification

- `./node_modules/.bin/tsx scripts/check-renderer.ts --spec=renderer --project=desktop`
  — 2 passed，exit 0。
- `./node_modules/.bin/tsx scripts/check-renderer.ts --spec=renderer --project=desktop,mobile`
  — 4 passed，exit 0。
- `./node_modules/.bin/tsx scripts/check-renderer.ts --spec=boundary --project=desktop`
  — 3 passed，exit 0。
- `pnpm exec tsc --noEmit --pretty false` — passed。
- `git diff --check` — passed。

所有数据库和图片均为临时 owned fixture；没有写入 `data/fpkg.db`、Turso 或
production，也没有修改通用 E2E 基础设施。
