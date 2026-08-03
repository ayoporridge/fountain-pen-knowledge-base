# Phase 464 完成记录

## 本批范围

继续复用既有 canonical 型号，未创建相邻型号、颜色或地区重复实体：

- `phase86-pen-montegrappa-elmo-02` / `montegrappa-elmo-02`：补足 C/C、142 mm／17 mm／30 g 的测量条件、EF/F/M/B/ST1/ST5、Elmo 01／02 Plus 分流和树脂／黄铜维护。
- `phase88-pen-asvine-v200` / `asvine-v200`：补足透明 acrylic、钛部件、真空杆和止墨动作的 SKU 边界，区分寄样评测／用户样本与固定规格，并补充购买和售后记录。
- `s39KOPST6001` / `sailor-king-profit-st-11-6001`：补足 11-6001-420／620、PMMA、21K 超大型尖、两用式、φ20×153.5 mm／32.8 g 的条件，分流 11-7002 与 10-9618。

Elmo 02 本批显式带入既有 Montegrappa 官方历史 source，修复其规格 evidence 与 source list 的映射缺口；没有新建来源或媒体。

## 交付文件

- `.planning/content-research/phase86-montegrappa-elmo-02.md`
- `.planning/content-research/phase88-asvine-v200.md`
- `.planning/content-research/sailor-king-profit-st-11-6001.md`
- `scripts/data/phase464-montegrappa-elmo-02-asvine-v200-sailor-k-depth.ts`
- `scripts/apply-phase464-montegrappa-elmo-02-asvine-v200-sailor-k-depth.ts`
- `tests/content/phase464-montegrappa-elmo-02-asvine-v200-sailor-k-depth.test.ts`
- 本目录 `PLAN.md` 与审计 artifacts

Pack 证据规模：Elmo 02 为 5 sources／3 independence groups／8 claims；V200 为 5／5／10；King Profit ST 为 5／3／9。三项各复用一张既有 primary site-original factual SVG。

## 验证结果

- 定向测试：`pnpm exec tsx --test tests/content/phase464-montegrappa-elmo-02-asvine-v200-sailor-k-depth.test.ts` 通过，1/1，约 34 秒；覆盖远程选择拒绝、既有身份、审核发布、来源、正文、媒体、品牌关系、hash、重放 noop 与真实库 snapshot 不变。
- apply 使用本批 owned copy：`.planning/quick/260804-ajc-montegrappa-elmo-02-asvine-v200-sailor-k/checkpoint.db`；三项均 `published`，content hashes：
  - Elmo 02：`sha256:v3:27e66e149ee3f6ca627ead9e2afdcbae6779762629bc604e16266c1886cdce57`
  - V200：`sha256:v3:f2f2228f568bae5b5625f168f7f9586038a484448ec92e0f63764d70a551aeb2`
  - King Profit ST：`sha256:v3:3d6462d0f150961d6d82f7fef2ec792f8e72924e9be7f8561d59321cf4baaee6`
- checkpoint SHA-256：`3ac24ba96b676ce48e21d770e3e5297caa8db2d13e6460c6659b0aca69afa6a6`；真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，本批未迁移真实资料库。
- `PRAGMA integrity_check`：`ok`；`PRAGMA foreign_key_check`：0 行；真实 catalog snapshot 前后不变；远程环境变量选择被拒绝。
- library contract：`sources=2734`、`sourceItems=4478`、`claims=4399`、`citations=11382`、`stories=718`、`events=945`、`diagrams=9`、`media=986`、`community=2`、`exhibits=6`、`externalIds=61`、`aliases=2405`、`commonsMedia=4`，通过。
- readiness：`inventory=690`（brand 119／pen 571）、`published/public=668`、`backlog=22`、`published_blockers=0`；quality：`duplicateGroups=0`、`suspiciousPenArticles=0`、`thinEntities=0`、`brokenLinks=0`；verdict 为 `inventory_complete=true`、`public_clean=true`、`content_complete=false`。
- 三个目标行均 `published`、`publishable=1`、`blocker_count=0`、`made_by` 恰好一条、品牌 reverse 恰好一条；数据库正文长度为 Elmo 02 `2869`、V200 `2918`、King Profit ST `2667`，approved references 各 `5`，primary media 各 `1`。
- `pnpm exec tsc --noEmit` 仍只有已知 3 个基线错误：`phase346-jinhao-x450-x750.test.ts` TS7022 两处、`sync-local-catalog-to-turso.test.ts` TS2741；本批无新增错误。
- 本批目标文件 Biome 检查通过；全局 Biome 的既有诊断未被修改；`git diff --check` 通过。

## 未完成边界

Phase 464 只是继续三条已有型号页的深化，不代表全量 goal 完成。仍需继续处理其他低信息公开页、缺失的重要品牌／型号，之后才进行真实数据库正式迁移、全站自动检查、真人遍历、生产部署与线上逐条复查。整体 goal 继续保持 active。
