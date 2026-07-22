---
phase: 132-lamy-studio-dialog
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/content-research/lamy-studio-phase132.md
  - .planning/content-research/lamy-dialog-phase132.md
  - scripts/data/phase132-lamy-studio-dialog.ts
  - scripts/apply-phase132-lamy-studio-dialog-content.ts
  - tests/content/phase132-lamy-studio-dialog.test.ts
  - public/images/library/site-original/phase132/lamy/lamy-studio.svg
  - public/images/library/site-original/phase132/lamy/lamy-dialog.svg
autonomous: true
requirements:
  - QUICK-260722-HEL
must_haves:
  truths:
    - "原位规范且只规范 raw LAMY studio 与旧 Dialog 3 实体；不重做 Phase68 Safari/AL-star，不新建 duplicate。"
    - "studio 当前 4000481/black steel-nib SKU 与 palladium gold-nib SKU 分 scope；Hannes Wettstein、13×13×140 mm、24 g 只按 exact SKU 陈述。"
    - "dialog 当前标题与 slug 规范为 LAMY dialog；Dialog 3 保留 former/market alias 与旧路由，Franco Clivio、旋转伸缩尖、夹子联动、球阀、13×13×140 mm、48 g 以当前官方 SKU 为锚点。"
    - "dialog cc 是独立 sibling，不能混入；专业评测的 45 g、Broad 样笔、四个月密封体验与 VP 比较只留在 2016 样本 scope。"
    - "每页 summary 60-160 Unicode、body 至少 2,000 Unicode，并各有 unique 1600×900 site-original factual SVG。"
    - "两支 pen 各有唯一 made_by/reverse 到 LAMY brand；既有 brand、Safari、AL-star 非拓扑 payload 不重放。"
    - "目标实体与 LAMY brand 只经 recordEntityContentReview 及 publishEntity 发布；first apply published、pristine replay noop、partial/tamper fail closed。"
    - "所有试验写入只发生在 caller-owned checkpoint copy，真实 data/fpkg.db 与他人文件保持不变。"
---

<objective>
把两个既有 raw LAMY 条目原位升级为来源化型号页：studio 与 dialog；保留旧路由并修正命名、设计者、版本与机制边界。

Excluded: Safari/AL-star 重做、dialog cc 合并、Logo、真实DB迁移、通用 runner/Playwright/readiness/search/LLM/schema/package 改动及任何 unrelated dirty/untracked 文件。Phase132 完成不等于全量 goal 完成。
</objective>

<tasks>
<task type="auto"><name>Task 1: 正文、证据包与原创事实图</name><files>.planning/content-research/lamy-studio-phase132.md, .planning/content-research/lamy-dialog-phase132.md, scripts/data/phase132-lamy-studio-dialog.ts, public/images/library/site-original/phase132/lamy/lamy-studio.svg, public/images/library/site-original/phase132/lamy/lamy-dialog.svg</files><action>按 LAMY 当前 exact SKU 与独立实物评测分离 steel/gold、current/reviewer sample 与 dialog/dialog 3/dialog cc 身份。</action><verify><automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; xmllint --noout public/images/library/site-original/phase132/lamy/lamy-studio.svg public/images/library/site-original/phase132/lamy/lamy-dialog.svg</automated></verify><done>两页 2k+ 正文、两个 pack 与两张唯一 SVG 通过结构校验。</done></task>
<task type="auto" tdd="true"><name>Task 2: 原位 identity migration、review/publish 与定向回归</name><files>scripts/apply-phase132-lamy-studio-dialog-content.ts, tests/content/phase132-lamy-studio-dialog.test.ts</files><action>在 owned checkpoint copy 动态锁定两个 raw ID；exact rename、redirect、maker/reverse 后安装 pack，不重放 LAMY brand/Safari/AL-star payload；验证 publication gate、noop、tamper、partial、remote/hardlink 与真实库 snapshot。</action><verify><automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase132-lamy-studio-dialog.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check tests/content/phase132-lamy-studio-dialog.test.ts &amp;&amp; git diff --check</automated></verify><done>两支 LAMY 在 checkpoint public，旧路由有效，既有实体与真实库不变并精确提交。</done></task>
</tasks>
