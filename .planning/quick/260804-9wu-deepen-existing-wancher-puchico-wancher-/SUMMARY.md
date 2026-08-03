# Phase 462 完成记录

## 本批范围

继续复用已有 canonical pen entity，未创建颜色或地区重复型号：

- `phase119-wancher-puchico` / `wancher-puchico`：补足眼滴上墨、后插、气压、EF/F、颜色 card、Petite Charm Case 与两支独立样品边界。
- `phase120-wancher-shizuku-glass-nib` / `wancher-shizuku-glass-nib`：补足玻璃尖维护、Duralumin／阳极氧化、Solis exact、Earth 历史样品与十四张 collection snapshot。
- `BM2fNJ2-fP0T` / `pilot-cavalier`：新增自然中文正文，锁定日本 FCAN-5SR、CON-40、黄铜细杆、地区 sibling 与 2011 修复二手样本；维护引用 Pilot 官方使用说明页。

## 交付文件

- `.planning/content-research/wancher-puchico-phase119.md`
- `.planning/content-research/wancher-shizuku-glass-nib-phase120.md`
- `.planning/content-research/pilot-cavalier-phase461.md`
- `scripts/data/phase462-wancher-puchico-shizuku-pilot-cavalier-depth.ts`
- `scripts/apply-phase462-wancher-puchico-shizuku-pilot-cavalier-depth.ts`
- `tests/content/phase462-wancher-puchico-shizuku-pilot-cavalier-depth.test.ts`
- 本目录 `PLAN.md`

Pack 证据规模：PuChiCo 4 sources / 4 independence groups / 10 claims；Shizuku 4 / 3 / 10；Cavalier 4 / 4 / 10。三者各有 1 张 primary site-original factual SVG；Cavalier 的第四来源为 Pilot 官方 fountain-pen use/maintenance manual，和产品目录分开计 source group。

## 验证结果

- 定向测试：`pnpm exec tsx --test tests/content/phase462-wancher-puchico-shizuku-pilot-cavalier-depth.test.ts` 通过，1/1，约 34 秒（Biome 格式化后再次通过）。
- apply 使用 Phase 461 owned checkpoint 的副本；三项均 `published`，重放返回 `noop`。
- checkpoint：`.planning/quick/260804-9wu-deepen-existing-wancher-puchico-wancher-/checkpoint.db`，SHA-256 `68f17e4e00b179877640d61bca3383c2abc55b01ee5566c7f75ecb830b3881e7`。
- 真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本批未迁移真实资料库。
- `PRAGMA integrity_check`：`ok`；`PRAGMA foreign_key_check`：0 行；真实 catalog snapshot 前后不变；远程环境变量选择被拒绝。
- library contract：`sources=2734`、`sourceItems=4478`、`claims=4362`、`citations=11345`、`stories=718`、`events=939`、`diagrams=9`、`media=986`、`community=2`、`exhibits=6`、`externalIds=61`、`aliases=2405`、`commonsMedia=4`，通过。
- readiness：`inventory=690`、`published/public=668`、`backlog=22`、`published_blockers=0`；quality：`duplicateGroups=0`、`suspiciousPenArticles=0`、`thinEntities=0`、`brokenLinks=0`；coverage 为 brand `119/115/4`、pen `571/553/2 starter/16 gap`、平均 97。
- 三个目标行均 `publication=published`、`content_ready=true`、`blocker_count=0`、`made_by_status=exactly_one`、`reverse_model_diff_ids=[]`；数据库正文长度分别为 PuChiCo 5093、Shizuku 5224、Cavalier 3164，approved references 各 4，primary media 各 1。
- content hashes：PuChiCo `sha256:v3:fa8db93943bb81eb5e4306919fc8f1d0d2e66b7cb4a51e2ace4352a195c87f93`；Shizuku `sha256:v3:e34ad582ee838959f165a95b72c464fa9192b0777d028eb90f0467bf694cf39b`；Cavalier `sha256:v3:9697f237210432db92fb7de07e44f29eb47ef8ea860d568842737c5e9646a844`。三项 publication revision 与 reviewed revision 相同，contract version 3。
- `pnpm exec tsc --noEmit` 仍只有既有 3 个基线错误：Jinhao phase346 TS7022 两处、Turso sync test TS2741；本批无新增错误。
- Biome 对本批测试通过；`git diff --check` 通过。

## 未完成边界

Phase 462 只是继续一批已有型号深化，不代表全量 goal 完成。仍需继续覆盖其余 backlog／低信息条目、重要缺失品牌与型号，完成真实数据库正式迁移、全站自动检查、真人全页面遍历、生产部署与线上逐条复查。整体 goal 继续保持 active。
