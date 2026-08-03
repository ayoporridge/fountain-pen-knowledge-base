# Phase 463 完成记录

## 本批范围

继续复用既有 canonical Pilot 型号，没有新建 78G、MR1、MR2 的颜色或地区重复实体：

- `lOgSh4vuQsFK` / `pilot-78g-fp-78g`：补足 FP-78G 与 78G+ alias、EF/F/M/B 与十色 coded variants、CON-40 当前供墨、轻树脂维护和独立样本边界。
- `phase127-pilot-88g-mr1` / `pilot-88g-mr1-fp-mr1`：补足 MR1 五个 SIP/SID/GDP/GDZ/BP 编码、金属台阶、Metropolitan 地区名称、Pilot 供墨和附件差异。
- `phase127-pilot-88g-mr2` / `pilot-88g-mr2-fp-mr2`：补足 MR2 五个 LZD/LPD/WTG/CDL/PTN 图案代码、White Tiger variant 身份、中国 CON-40 与欧洲 DIN 地区边界、图案维护和选购分流。

## 交付文件

- `.planning/content-research/pilot-78g-fp-78g-phase127.md`
- `.planning/content-research/pilot-88g-mr1-phase127.md`
- `.planning/content-research/pilot-88g-mr2-phase127.md`
- `scripts/data/phase463-pilot-78g-88g-mr1-mr2-depth.ts`
- `scripts/apply-phase463-pilot-78g-88g-mr1-mr2-depth.ts`
- `tests/content/phase463-pilot-78g-88g-mr1-mr2-depth.test.ts`
- 本目录 `PLAN.md` 与审计 artifacts

Pack 证据规模：78G 为 5 sources／5 independence groups／8 claims；MR1 为 6／4／8；MR2 为 6／4／8。三项均复用既有 primary site-original factual media，追加 claims 与 timeline，不重复导入媒体。

## 验证结果

- 定向测试：`pnpm exec tsx --test tests/content/phase463-pilot-78g-88g-mr1-mr2-depth.test.ts` 通过，1/1，约 33 秒；覆盖远程环境拒绝、身份、审核发布、关系、媒体、hash、重放 noop 与真实库 snapshot 不变。
- apply 使用本批 owned copy：`.planning/quick/260804-a7z-deepen-existing-pilot-78g-88g-mr1-and-88/checkpoint.db`；三项均 `published`，输出 content hashes：
  - 78G：`sha256:v3:854dd92a891a349c296b50dce0539466dce95b5b633085d8e921a0f06562eb10`
  - MR1：`sha256:v3:e4b58524a9b6efaaece4dcb339d643a8864e1225acef74e56a5b0bcb4844e90a`
  - MR2：`sha256:v3:9e3b928548e5974d07c29ad7483f8ab471e63b51e791f9b4847351f006f00bb3`
- checkpoint SHA-256：`1ab453bddb730ed75a1358e8c9e1abb6801b2c4be54747c2afa071f8e2a6b3d8`；真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，本批未迁移真实资料库。
- `PRAGMA integrity_check`：`ok`；`PRAGMA foreign_key_check`：0 行；真实 catalog snapshot 前后不变；远程环境变量选择被拒绝。
- library contract：`sources=2734`、`sourceItems=4478`、`claims=4380`、`citations=11363`、`stories=718`、`events=942`、`diagrams=9`、`media=986`、`community=2`、`exhibits=6`、`externalIds=61`、`aliases=2405`、`commonsMedia=4`，通过。
- readiness：`inventory=690`（brand 119／pen 571）、`published/public=668`、`backlog=22`、`published_blockers=0`；quality：`duplicateGroups=0`、`suspiciousPenArticles=0`、`thinEntities=0`、`brokenLinks=0`；审计 verdict 为 `inventory_complete=true`、`public_clean=true`、`content_complete=false`（剩余 backlog 未被隐瞒）。
- 三个目标行均 `published`、`publishable=1`、`blocker_count=0`、`made_by` 恰好一条、brand reverse 恰好一条；数据库正文长度为 78G `3564`、MR1 `3471`、MR2 `3373`，approved references 为 `5/6/6`，primary media 各 `1`。
- `pnpm exec tsc --noEmit` 仍只有仓库已知 3 个基线错误：`phase346-jinhao-x450-x750.test.ts` 的 TS7022 两处、`sync-local-catalog-to-turso.test.ts` 的 TS2741；本批无新增错误。
- 本批目标文件 Biome 检查通过；全局 Biome 仍有既有 73 项诊断，未修改无关文件；`git diff --check` 通过。

## 未完成边界

Phase 463 只是继续一批已有 Pilot 型号深化，不代表全量 goal 完成。仍需继续覆盖其余 backlog／低信息条目、重要缺失品牌与型号，完成真实数据库正式迁移、全站自动检查、真人全页面遍历、生产部署与线上逐条复查。整体 goal 继续保持 active。
