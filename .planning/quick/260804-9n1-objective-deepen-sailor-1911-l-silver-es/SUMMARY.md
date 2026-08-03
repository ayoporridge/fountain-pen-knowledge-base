# Phase 461 完成记录

## 本批范围

本批深化三个已有 canonical pen entity，没有新建重复型号：

- `p305Sailor1911LDemoSilver` / `sailor-1911-l-demonstrator-11-9223`：锁定 11-9223 银／铑饰、21K 铑镀尖、透明 PMMA、C/C、尖幅货号和 plating 过渡。
- `phase139-faber-castell-essentio` / `faber-castell-essentio`：按 148420、148481、148820、148821 exact SKU 分开 Aluminium／Carbon、尖幅、附件和维护边界。
- `s40PVICTORY` / `parker-victory-vintage`：补足英国 Newhaven、Mk I–V、button filler／aerometric、Eversharp 混淆和修复风险。

正文使用可靠官方页面、官方目录／公告、专业资料站、独立评测与本站原创事实图；没有把产品照片或单支评测体验冒充全系列事实。

## 交付文件

- `.planning/content-research/sailor-1911-l-demonstrator-11-9223-phase305.md`
- `.planning/content-research/faber-castell-essentio-phase139.md`
- `.planning/content-research/parker-victory-vintage.md`
- `scripts/data/phase461-sailor-essentio-victory-depth.ts`
- `scripts/apply-phase461-sailor-essentio-victory-depth.ts`
- `tests/content/phase461-sailor-essentio-victory-depth.test.ts`
- 本目录 `PLAN.md`

Pack 证据规模：Sailor 8 sources / 8 independence groups / 13 claims；Essentio 8 / 4 / 16；Victory 5 / 4 / 8。每个 pack 1 张 primary site-original factual SVG，沿用原有品牌关系。

## 验证结果

- 定向测试：`pnpm exec tsx --test tests/content/phase461-sailor-essentio-victory-depth.test.ts` 通过，1/1，约 35 秒。
- apply 使用受保护的 owned copy：三项均 `published`；重放返回 `noop`。
- checkpoint：`.planning/quick/260804-9n1-objective-deepen-sailor-1911-l-silver-es/checkpoint.db`，SHA-256 `6ed3110ba0b388fd3f00f1c704e412c1dbe6862881e1585e50db18877e840245`。
- 真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本批未写入真实资料库。
- 真实 catalog snapshot 前后相同；远程环境变量注入被 apply 拒绝。
- checkpoint `PRAGMA integrity_check`：`ok`；`PRAGMA foreign_key_check`：0 行。
- library contract：`sources=2733`、`sourceItems=4477`、`claims=4343`、`citations=11326`、`stories=718`、`events=936`、`diagrams=9`、`media=986`、`community=2`、`exhibits=6`、`externalIds=61`、`aliases=2405`、`commonsMedia=4`，通过。
- readiness：`inventory=690`、`published/public=668`、`backlog=22`、`published_blockers=0`；quality：`duplicateGroups=0`、`suspiciousPenArticles=0`、`thinEntities=0`、`brokenLinks=0`。
- 三个目标行均 `publication=published`、`content_ready=true`、`blocker_count=0`、`made_by_status=exactly_one`、`reverse_model_diff_ids=[]`；数据库正文长度分别为 3328、3379、3177 字符，审核引用分别为 8、8、5，primary media 各 1。
- `pnpm exec tsc --noEmit` 仍只有既有 3 个基线错误：`tests/content/phase346-jinhao-x450-x750.test.ts` 的 TS7022 两处、`tests/migration/sync-local-catalog-to-turso.test.ts` 的 TS2741；本批未新增 TypeScript 错误。
- Biome 对本批定向测试通过；`git diff --check` 通过。

## 未完成边界

Phase 461 只完成一批已有型号的内容深化，不代表全量 goal 完成。仍需继续处理其余 backlog／低信息条目、未覆盖的重要品牌与型号，之后才可在受控流程中正式迁移真实数据库，执行全站自动检查、真人遍历、部署和线上逐条复查。整体 goal 保持 active。
