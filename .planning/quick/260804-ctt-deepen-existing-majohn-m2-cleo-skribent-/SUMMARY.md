# Phase 467 完成记录

## 本批范围

本批只深化已有 canonical 型号，没有创建重复实体：

- `f1DaQYtCJVMk` / `末匠-majohn-m2`：补足透明直灌容量的量测条件、O 形圈与气压边界、替换尖样本、交付检查和维护节奏。
- `phase341-cleo-classic-palladium` / `cleo-skribent-classic-palladium`：补足 Classic／Palladium 身份层、活塞与 cartridge/converter 分流、钢尖与 14K 变体、Bad Wilsnack 制造语境和选购检查。
- `p81bNOu9URb7` / `书乐-shule-2398`：补足编号与刻字身份、与 ShuLe 2212 的相邻型号边界、旧笔状态记录、维护和二手核验；2212 没有被并入 2398 规格。

## 验证结果

- 定向测试：`pnpm exec tsx --test tests/content/phase467-majohn-m2-cleo-palladium-shule-2398-depth.test.ts` 通过，1/1；覆盖远程选择拒绝、canonical identity、正文、来源、媒体、审核发布、品牌双向关系、hash、重放 `noop` 和真实库 snapshot 不变。
- owned checkpoint：`.planning/quick/260804-ctt-deepen-existing-majohn-m2-cleo-skribent-/checkpoint.db`；首次三项均 `published`，重放三项均 `noop`。
- content hashes：
  - Majohn M2：`sha256:v3:7795b17e3a3561459f5d7e62eb21ca00e1dbb1be807c11632934656d50472eca`
  - Cleo Classic Palladium：`sha256:v3:4ca55dfd6c028a5a36d9e863bc1cb7af3348306c4345f4bbc2c97998e003b0ab`
  - ShuLe 2398：`sha256:v3:17a363e9fa0adb75e6113795be55a5182aac39f8f4dcc3ca740962fbb76f0661`
- 目标行均 `published`、`publishable=1`、`blocker_count=0`；数据库正文长度分别为 `2888`、`2953`、`2979`；approved references 分别 `5`、`9`、`3`，primary media 各 `1`，`made_by` 和品牌 reverse 各 `1`。
- checkpoint SHA-256：`fe3813fd7e4425bd75e32c5a5163345ad3b1b0046b0b848d87bff0722d49ceb9`。
- 真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本批没有迁移真实资料库。
- `PRAGMA integrity_check`：`ok`；`PRAGMA foreign_key_check`：0 行；真实 catalog snapshot 未变化。
- library contract：`sources=2734`、`sourceItems=4478`、`claims=4466`、`citations=11449`、`stories=718`、`events=954`、`diagrams=9`、`media=986`、`community=2`、`exhibits=6`、`externalIds=61`、`aliases=2405`、`commonsMedia=4`，通过。
- readiness：`inventory=690`（brand 119／pen 571）、`published/public=668`、`backlog=22`、`published_blockers=0`；quality：`duplicateGroups=0`、`suspiciousPenArticles=0`、`thinEntities=0`、`brokenLinks=0`；verdict 仍为 `inventory_complete=true`、`public_clean=true`、`content_complete=false`。
- `pnpm exec tsc --noEmit` 仍只有既知 3 个基线错误：`phase346-jinhao-x450-x750.test.ts` 两处 TS7022，以及 `sync-local-catalog-to-turso.test.ts` 的 TS2741；本批无新增错误。
- 本批目标脚本／测试 Biome 检查通过，`git diff --check` 通过。

## 未完成边界

Phase 467 只是三条已有型号页的内容深化，不代表全量 goal 完成。仍需继续处理其余低信息公开页和缺失的重要品牌／型号；之后还要进行真实数据库正式迁移、全站自动检查、真人遍历、生产部署和线上逐条复查。整体 goal 保持 active。
