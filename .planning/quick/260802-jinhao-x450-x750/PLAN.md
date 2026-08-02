# Phase 346 — Jinhao X450 / X750

## Goal

在已有 Jinhao 品牌实体下新增两个当前库存缺失、身份可分辨且有交叉资料的型号页：X450 与 X750。复用已有 `Yulxwu7PuQAU` 品牌导航，不新建重复品牌，不把 159、X159、X450、X750 混成一个大笔页面。

## Source boundary

- X450：Truphae 2020 商品评测、Inks and Pens 2015 实物与仿品边界、The Gentleman Stationer 2014 评测、Goulet 当前商品页与 X450/X750 换尖说明、Fountain Pen Network 讨论。
- X750：Goulet 2013 评测与当前商品页、JetPens 商品规格、Peninkcillin 2012 实物评测、Stationery Wiki 社区摘要、Fountain Pen Network 讨论与 Goulet 换尖说明。
- 价格、库存、包装、颜色名称和单支书写感不写成全系不变事实。

## Owned files

- `.planning/content-research/jinhao-x450-phase346.md`
- `.planning/content-research/jinhao-x750-phase346.md`
- `.planning/quick/260802-jinhao-x450-x750/SOURCES.md`
- `public/images/library/site-original/phase346/jinhao/x450.svg`
- `public/images/library/site-original/phase346/jinhao/x750.svg`
- `scripts/apply-phase346-jinhao-x450-x750-content.ts`
- `scripts/data/phase346-jinhao-x450-x750.ts`
- `tests/content/phase346-jinhao-x450-x750.test.ts`

## Safety

- 只在本目录的 checkpoint copy 回放。
- `data/fpkg.db` 是 protected catalog，测试前后做 snapshot。
- wrapper 拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，并核对 `PRAGMA database_list`。
- 不触碰既有未跟踪 research、`.next-phase*` 或其它 quick 目录。

## Acceptance

- 两个型号均为 `pen`，slug 分别为 `jinhao-x450`、`jinhao-x750`，brand entity 为已有 `Yulxwu7PuQAU`。
- 两个型号各有来源化中文正文（至少 2,000 Unicode 字符）、至少 5 个独立来源组、10 项 approved spec evidence、4 个变体、唯一 primary factual SVG。
- `made_by` 仅指向已有 Jinhao 品牌，品牌到型号各有一个 `reverse` 导航关系。
- 首次回放为 `published`，第二次为 `noop`；fact/language/media/publication 四类 review 均 approved。
- 定向测试、定向 TypeScript、Biome、`git diff --check` 通过；真实 catalog snapshot 不变。

## Verification evidence

- `pnpm exec tsx --test tests/content/phase346-jinhao-x450-x750.test.ts`：1/1 passed，约 34 秒；测试确认远端环境变量拒绝、两个型号的正文／来源／SVG、身份、`made_by`／`reverse`、4 个变体、10 项 spec evidence、四类 review 和幂等重放。
- 定向 TypeScript：`pnpm exec tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler --esModuleInterop --types node scripts/data/phase346-jinhao-x450-x750.ts scripts/apply-phase346-jinhao-x450-x750-content.ts tests/content/phase346-jinhao-x450-x750.test.ts` 通过。
- Scoped Biome 检查通过；SVG 与 Markdown 均保留 factual SVG 和来源边界。
- owned checkpoint：`.planning/quick/260802-jinhao-x450-x750/checkpoint/fpkg-copy.db` 首次回放结果为 `Yulxwu7PuQAU=published`、`phase346-jinhao-x450=published`、`phase346-jinhao-x750=published`；第二次三者均 `noop`。型号 hash 分别为 `sha256:v3:132a64b3987e0750ccf81e2f8cee3b2c29034b0551c5f7e12e061aaedf7e4b70` 与 `sha256:v3:133726ec59326f16d9d498e62ff24139e506c32cd67c6fda0062ebeb517531d0`。
- checkpoint 查询确认两个型号各有一条指向既有 Jinhao 的 `made_by`、一条品牌 `reverse`，四类 review 均 `approved`；`protected.db` 与真实 `data/fpkg.db` 在捕获时一致，试验未写入真实 catalog。
- 复用品牌 pack 会刷新其当前内容标记，但测试对品牌 `body_md` 和 `summary` 做了前后快照，正文未被改写；未新增重复品牌实体。

Status: complete for this owned content package. The full-corpus goal remains active.
