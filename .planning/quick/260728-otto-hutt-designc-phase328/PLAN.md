# Phase 328 — Otto Hutt designC

## 目标

补齐官方独立的 Otto Hutt designC 钢笔实体，写明 925 银、PVD、18K 金尖与 Pull+Twist 真空上墨的型号边界；只在 owned checkpoint copy 审核发布，不触碰 `data/fpkg.db`。

## 文件边界

- `.planning/content-research/otto-hutt-designc-phase328.md`
- `scripts/data/phase328-otto-hutt-designc.ts`
- `scripts/apply-phase328-otto-hutt-designc-content.ts`
- `tests/content/phase328-otto-hutt-designc.test.ts`
- `public/images/library/site-original/phase328/otto-hutt/designc.svg`
- `.planning/quick/260728-otto-hutt-designc-phase328/{PLAN.md,SUMMARY.md}`

## 验证

1. 在真实库副本上跑定向测试：远程环境拒绝、身份/关系、审核—发布、来源、规格、主图、品牌反向导航、replay noop 与真实库快照不变。
2. 执行 TypeScript、Biome format/check、`git diff --check`。
3. 提交前只暂存本包文件，保护其他 agent 的 research、`.next-phase*` 和 quick 目录。
