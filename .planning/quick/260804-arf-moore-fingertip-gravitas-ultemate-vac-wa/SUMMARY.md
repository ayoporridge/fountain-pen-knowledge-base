# Phase 465 完成记录

## 本批范围

继续复用既有 canonical 型号，未创建相邻型号、颜色或地区重复实体：

- `BbRrESWOy_c1` / `the-moore-finger-tip`：补足大号／demi 量测条件、内嵌尖与杠杆上墨的鉴别、专利边界、修复风险和收藏检查清单。
- `phase260-gravitas-ultemate-vac` / `gravitas-ultemate-vac`：补足主仓／次级 chamber 状态、官方容量与重量条件、第三方 JoWo #6 风险、墨水限制以及 ULTEM／acrylic／Vac 2.0 分流。
- `kN4e-bTwsjSG` / `waterman-s-c-f`：补足 C/F 专用穿刺接口、地区与年代记录、替代墨囊验证、日用／展示边界和二手购买最低证据。

Gravitas pen pack 本身缺少其品牌官方 source；本批显式从已有 Gravitas brand pack 补入 `phase260-gravitas-official`，修复 spec evidence 的 source-item mapping 缺口。没有新建来源或媒体。

## 交付文件

- `.planning/content-research/moore-fingertip-phase168.md`
- `.planning/content-research/gravitas-ultemate-vac-phase260.md`
- `.planning/content-research/waterman-cf-phase157.md`
- `scripts/data/phase465-moore-fingertip-gravitas-ultemate-vac-waterman-cf-depth.ts`
- `scripts/apply-phase465-moore-fingertip-gravitas-ultemate-vac-waterman-cf-depth.ts`
- `tests/content/phase465-moore-fingertip-gravitas-ultemate-vac-waterman-cf-depth.test.ts`
- 本目录 `PLAN.md`、`SUMMARY.md` 与审计 artifacts

Pack 复用后的来源规模：Moore Fingertip 为 11 sources／10 independence groups／13 claims；Gravitas Ultemate Vac 为 7／7／16；Waterman C/F 为 5／5／13。三项各复用一张既有 primary site-original factual SVG。

## 验证结果

- 定向测试：`pnpm exec tsx --test tests/content/phase465-moore-fingertip-gravitas-ultemate-vac-waterman-cf-depth.test.ts` 通过，1/1；覆盖远程选择拒绝、既有身份、审核发布、来源、正文、媒体、品牌关系、hash、重放 noop 与真实库 snapshot 不变。
- apply 使用本批 owned copy：`.planning/quick/260804-arf-moore-fingertip-gravitas-ultemate-vac-wa/checkpoint.db`；三项首次均 `published`，重放均 `noop`，content hashes：
  - Moore Fingertip：`sha256:v3:05ba81f8b97364e85383cafff2e886694c2498042595b7f84fee7b87cd7608fb`
  - Gravitas Ultemate Vac：`sha256:v3:14366b5103d7fcbbc3dea69c26f5519ede12bd05a05f124b5474be337469b`
  - Waterman C/F：`sha256:v3:f7442689fc1ea869752c2b80e2eca9830b0a02eb5dd0e3c6344661a7308a4365`
- checkpoint SHA-256：`2fd754258eb2119a9cafd8cd22fca22334ff99787f0240bfca602ee50bc042de`；真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，本批未迁移真实资料库。
- `PRAGMA integrity_check`：`ok`；`PRAGMA foreign_key_check`：0 行；真实 catalog snapshot 前后不变；远程环境变量选择被拒绝。
- library contract：`sources=2734`、`sourceItems=4478`、`claims=4423`、`citations=11406`、`stories=718`、`events=948`、`diagrams=9`、`media=986`、`community=2`、`exhibits=6`、`externalIds=61`、`aliases=2405`、`commonsMedia=4`，通过。
- readiness：`inventory=690`（brand 119／pen 571）、`published/public=668`、`backlog=22`、`published_blockers=0`；quality：`duplicateGroups=0`、`suspiciousPenArticles=0`、`thinEntities=0`、`brokenLinks=0`；verdict 为 `inventory_complete=true`、`public_clean=true`、`content_complete=false`。
- 三个目标行均 `published`、`publishable=1`、`blocker_count=0`、`made_by` 恰好一条、品牌 reverse 恰好一条；正文长度 Moore Fingertip `2696`、Gravitas `2879`、Waterman C/F `3029`；approved references 分别 `11`、`7`、`5`，primary media 各 `1`。
- `pnpm exec tsc --noEmit` 仍只有已知 3 个基线错误：`phase346-jinhao-x450-x750.test.ts` TS7022 两处、`sync-local-catalog-to-turso.test.ts` TS2741；本批无新增错误。
- 本批目标文件 Biome 检查通过；`git diff --check` 通过。

## 未完成边界

Phase 465 只是继续三条已有型号页的深化，不代表全量 goal 完成。仍需继续处理其他低信息公开页、缺失的重要品牌／型号，之后才进行真实数据库正式迁移、全站自动检查、真人遍历、生产部署与线上逐条复查。整体 goal 继续保持 active。
