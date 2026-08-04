# Phase 486 Summary

## 已完成

- 深化既有实体（没有建新实体）：
  - `_rGmelBGrtGm` / `the-conklin-glider`
  - `s59BENU_UNICORN` / `benu-talisman-true-unicorn`
  - `phase93-pen-otto-hutt-design07` / `otto-hutt-design07`
- 新增研究正文：
  - `.planning/content-research/conklin-glider-phase486.md`
  - `.planning/content-research/benu-talisman-true-unicorn-phase486.md`
  - `.planning/content-research/otto-hutt-design07-phase486.md`
- 新增可重放内容包和脚本：
  - `scripts/data/phase486-conklin-glider-benu-unicorn-otto-hutt-depth.ts`
  - `scripts/apply-phase486-conklin-glider-benu-unicorn-otto-hutt-depth.ts`
  - `tests/content/phase486-conklin-glider-benu-unicorn-otto-hutt-depth.test.ts`

## 验收证据

- 三份研究正文：总长度分别约 3,822、4,147、4,039；body 分别约 2,985、3,167、2,932。
- 定向测试：`pnpm exec tsx --test tests/content/phase486-conklin-glider-benu-unicorn-otto-hutt-depth.test.ts`，1/1 通过，覆盖远程拒绝、owned copy、identity、正文与来源、`made_by`/`reverse`、三项 content review、publication v3/hash、primary media、幂等 replay 和真实 DB 快照不变。
- Persistent checkpoint：`.planning/quick/260804-inc-continue-full-fountain-pen-knowledge-gra/checkpoint/checkpoint.db`。
- 首次回放结果：三条均 `published`；内容哈希：
  - `_rGmelBGrtGm`: `sha256:v3:f2dec13a12c28e9da43a819d7e992f036d9f05d05ddf00d439af4474badf73d5`
  - `s59BENU_UNICORN`: `sha256:v3:9c4971792dce72f6df6967d15b4d3961f702e13a5169ecfb67b34cb335d12c95`
  - `phase93-pen-otto-hutt-design07`: `sha256:v3:4053a45467dfb67cbb45b40e9125571b3493a41b9c4dbbfbb34adab374e855d3`
- 第二次回放：三条均 `noop`。
- checkpoint 直接查询：`PRAGMA integrity_check = ok`，FK violations = 0；三条 body 长度为 2,983、3,165、2,930，均 `published`、contract version 3、reviewed revision 与 content revision 相等；approved references 为 9、9、11，primary media 各 1。
- `check-library-contract.ts --database-path <checkpoint>` 通过：sources 2,804；sourceItems 4,569；claims 4,659；citations 11,870；stories 718；events 995；diagrams 9；media 986；aliases 2,407；commonsMedia 4。
- `audit-entity-quality.ts --database-path <checkpoint> --json` 通过：690 entities、668 active、22 retired、duplicateGroups 0、suspiciousPenArticles 0、thinEntities 0、brokenLinks 0、published blockers 0。
- 定向 Biome check 通过。全量 `tsc --noEmit` 仍只有既有基线三项：`phase346-jinhao-x450-x750.test.ts` 两个 TS7022，以及 `sync-local-catalog-to-turso.test.ts` 的 NODE_ENV TS2741；没有 Phase486 新错误。

## 未完成边界

本阶段只完成三条既有型号的 checkpoint 内容深化，不等于 Fountain Pen Knowledge Graph 全量 goal 完成。真实 `data/fpkg.db` 尚未迁入本包，Turso 正式迁移、生产部署、真人全页面遍历、线上逐条复查和其余低信息/缺失型号仍待后续批次处理。
