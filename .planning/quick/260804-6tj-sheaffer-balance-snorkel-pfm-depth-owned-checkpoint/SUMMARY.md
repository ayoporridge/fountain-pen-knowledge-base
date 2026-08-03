# Phase 450 验收摘要

## 结果

- 在 Phase 449 owned checkpoint 上深化既有 canonical 型号：Sheaffer Balance `usCp8x8GbG-9`、Sheaffer Snorkel `pcft_zIm9kP9`、Sheaffer PFM `DfCvXoVXPG_n`。
- 复用 Phase 62 的 PenHero、Richard’s Pens、Vintage Pens 与本站原创 factual SVG；没有新建旧身份、没有把 Balance/Craftsman、Snorkel/PFM 或 PFM/Imperial/Targa/Legacy 混为同一型号。
- 三页正文均超过 3500 字符：Balance 3700、Snorkel 3782、PFM 3723；发布后的 `body_md` 分别为 3177、3229、3165 字符。
- 三个型号均保持一个 `made_by` 和一个品牌反向 `reverse`，每页 4–5 条 approved references、4–5 个独立来源组、1 个 approved primary media；publication 均为 `published`。

## 应用与回放

首次 apply：

- Balance：`sha256:v3:1ebfb635d0759224ebecc7a10efce36417eb8369bd2b685183a32b711d99afca`
- Snorkel：`sha256:v3:dd5df64822b7f37674e05c35fdc021ce2be7f91566b3ea3497b2d43cbc733f3b`
- PFM：`sha256:v3:305f6a151dcdc2067734144b76d5772301f5288a42dc801eda0ed44c928fecdc`

同一命令 replay 三项均为 `noop`。apply 只在独立 checkpoint copy 中进行，使用 `recordEntityContentReview` 的 fact/language/media 审核与 `publishEntity` 发布；未直接改写 publication 状态。

## 验收证据

- 定向测试：`tests/content/phase450-sheaffer-balance-snorkel-pfm-depth.test.ts` 通过。
- `PRAGMA integrity_check`：`ok`。
- quality audit：690 entities；668 active；22 retired lineage excluded；duplicate name groups 0；suspicious pen articles 0；thin brand/model entities 0；made_by blockers 0。
- library contract：sources 2732、sourceItems 4476、claims 4147、citations 11130、stories 718、events 903、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2405、commonsMedia 4；`Library contract OK`。
- Biome 定向检查与 `git diff --check` 通过。
- `tsc --noEmit` 仍只有既有基线的 3 个错误：Phase346 Jinhao 测试 2 个 TS7022、Turso migration 测试 1 个 TS2741；本阶段没有新增 TypeScript 错误。
- 真实 `data/fpkg.db` SHA-256 前后均为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。

## 文件边界

本阶段拥有的代码与测试为：

- `scripts/data/phase450-sheaffer-balance-snorkel-pfm-depth.ts`
- `scripts/apply-phase450-sheaffer-balance-snorkel-pfm-depth.ts`
- `tests/content/phase450-sheaffer-balance-snorkel-pfm-depth.test.ts`
- 三份既有 Sheaffer 研究正文与本目录的 `PLAN.md` / `SUMMARY.md`

其他未跟踪 research、`.next-phase*` 目录、旧 quick 目录和真实数据库均未删除、未提交、未写入。
