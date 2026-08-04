# Phase 492 完成记录

## 本批范围

本批深化三个已有 canonical Sailor pen，没有新建重复型号：

- `s39NAG7121` / `sailor-naginata-togi-10-7121`：把 Naginata-Togi 作为笔尖 taxonomy，与 10-7121 的 PMMA 笔身、F/MF/M/B 货号、21K Gold IP、C/C 和角度书写边界分开。
- `9jIF6QOt8wGr` / `sailor-shikiori-setsugetsu-soraha-11-1224`：补足春空、万叶、名月、垂雪四种颜色和八个 EF/MF 后缀，14K、PMMA、金色 IP、批次过渡与其他 SHIKIORI 型号边界。
- `p302Sailor1911Large` / `sailor-1911-large-11-2024`：补足七组尖号、21K 铑色尖、PMMA、C/C、套帽重心、21.6 g 与 11-2021、Standard、Realo、demonstrator 的身份差异。

资料使用 Sailor 日本／英文／中国官方页面、官方系列和镀层公告，配合 Fountain PenArchy、Fountain Pen Network、Pen-House、Rakuten 和 The Pen Addict 的独立或零售记录；没有把单支评测体验当作全系列规格，也沿用了各原有 site-original factual SVG。

## 交付文件

- `.planning/content-research/sailor-naginata-togi-10-7121-phase492.md`
- `.planning/content-research/sailor-shikiori-setsugetsu-soraha-11-1224-phase492.md`
- `.planning/content-research/sailor-1911-large-11-2024-phase492.md`
- `scripts/data/phase492-sailor-special-and-1911-depth.ts`
- `scripts/apply-phase492-sailor-special-and-1911-depth.ts`
- `tests/content/phase492-sailor-special-and-1911-depth.test.ts`
- 本目录 `PLAN.md`

## 验证结果

- 定向测试：`pnpm exec tsx --test tests/content/phase492-sailor-special-and-1911-depth.test.ts` 通过，1/1；格式化后再次通过，约 40 秒。
- 受保护的 owned checkpoint 首次 apply 三项均 `published`，第二次 replay 三项均 `noop`。
- checkpoint：`.planning/quick/260804-kvw-continue-full-fountain-pen-knowledge-gra/checkpoint/checkpoint.db`；SHA-256 `514de715dec45e04e6447fe8db70f541802c1697e00339cfa900f874ae5263a5`。
- 真实 `data/fpkg.db` SHA-256 仍为 `d93136ec6e5f12812b795f59b549b74d889a8b6d4dbd2c9071304a8107964c77`；本批未写入真实资料库。
- checkpoint `PRAGMA integrity_check`：`ok`；foreign-key violations：0。
- 目标正文／审核引用／primary media：Naginata `2960/12/1`、SHIKIORI `2869/9/1`、1911 Large `3189/11/1`；三者 `published`、`content_ready=true`、`reviewed_contract_version=3`、`made_by=1`、brand reverse=1。
- library contract 通过；计数 `sources=2803`、`sourceItems=4568`、`claims=4659`、`citations=11875`、`stories=718`、`events=995`、`media=986`、`aliases=2407`。
- readiness／coverage（在已迁移 checkpoint 上读取，未写真实库）：`inventory=690`、119 brands、571 pens、`published/public=668`、`published_blockers=0`、`backlog=22`；`duplicateGroups=0`、`suspiciousPenArticles=0`、`thinEntities=0`、`brokenLinks=0`。coverage diagnostic averages：brands 97/100，models 97/100。
- `--verify-baseline` 仍因项目旧锁定基线 681 与当前 690 不一致而拒绝；这是既有基线漂移，不能被本批隐藏。
- 定向 Biome 通过。`pnpm exec tsc --noEmit` 仍只有既有基线错误：`tests/content/phase346-jinhao-x450-x750.test.ts:183-184` 的 TS7022 两处、`tests/migration/sync-local-catalog-to-turso.test.ts:76` 的 TS2741；本批未新增 TypeScript 错误。

## 未完成边界

Phase 492 只完成一批已有 Sailor 型号的内容深化，不代表全量 goal 完成。真实数据库仍未迁移本批内容，远端 Turso 也未同步；剩余 22 个 readiness backlog、未覆盖品牌／型号、全站自动检查、真人遍历、生产部署和线上逐条复查都必须继续完成后，才能考虑结束总 goal。
