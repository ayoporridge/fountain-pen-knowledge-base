---
phase: 134-wancher-dream-pen-true-ebonite-silk-black
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/content-research/wancher-dream-pen-true-ebonite-silk-black-phase134.md
  - scripts/data/phase134-wancher-dream-pen-true-ebonite-silk-black.ts
  - scripts/apply-phase134-wancher-dream-pen-true-ebonite-silk-black-content.ts
  - tests/content/phase134-wancher-dream-pen-true-ebonite-silk-black.test.ts
  - public/images/library/site-original/phase134/wancher/dream-pen-true-ebonite-silk-black.svg
autonomous: true
requirements:
  - QUICK-260722-HYB
must_haves:
  truths:
    - "新增一个 exact Silk Black SKU，不把它并入已发布 Matte Black，也不复制 Matte Sandblast Treatment 字段。"
    - "当前页以 Kanto repeated polishing、Japanese ebonite、European International C/C、current nib/feed/clip menu 为锚点。"
    - "无夹、chrome-plated clip 与 gold-plated clip 是当前配置 variants；页面的 sold-out option 状态只作 2026-07-22 snapshot。"
    - "2018 专业评测的 polished black True Ebonite 样笔、尺寸、重量、steel nib 和主观体验只留在 historical sample scope。"
    - "AS IS sale 的划痕／磕点案例只用于二手与瑕疵边界，不把瑕疵写成标准产品特征。"
    - "新 pen 只链接既有 Wancher brand 与 Dream Pen 系列导航；既有具体 SKU payload 不重放。"
    - "Wancher brand、Dream Pen navigation 与新 pen 只经 recordEntityContentReview 及 publishEntity 发布。"
    - "所有试验写入只发生在 caller-owned checkpoint copy，真实 data/fpkg.db 与他人文件保持不变。"
---

<objective>
新增 Wancher Dream Pen True Ebonite Silk Black 的 exact SKU 页面，写清抛光 finish、current configuration、样本评测与 Matte Black sibling 边界。

Excluded: Matte Black 重做、把整个 True Ebonite collection 合成一个规格、真实 DB 迁移、通用 runner/Playwright/readiness/search/LLM/schema/package 改动及任何 unrelated dirty/untracked 文件。Phase134 完成不等于全量 goal 完成。
</objective>

<tasks>
<task type="auto"><name>Task 1: 正文、证据包与原创事实图</name><files>.planning/content-research/wancher-dream-pen-true-ebonite-silk-black-phase134.md, scripts/data/phase134-wancher-dream-pen-true-ebonite-silk-black.ts, public/images/library/site-original/phase134/wancher/dream-pen-true-ebonite-silk-black.svg</files><action>按 current exact product、AS IS boundary 与 2018 professional sample 拆分事实范围。</action><verify><automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; xmllint --noout public/images/library/site-original/phase134/wancher/dream-pen-true-ebonite-silk-black.svg</automated></verify><done>2k+ 正文、可验证 pack 与唯一 SVG 通过结构校验。</done></task>
<task type="auto" tdd="true"><name>Task 2: guarded add-one、review/publish 与定向回归</name><files>scripts/apply-phase134-wancher-dream-pen-true-ebonite-silk-black-content.ts, tests/content/phase134-wancher-dream-pen-true-ebonite-silk-black.test.ts</files><action>在 owned checkpoint copy 建 stable-ID exact SKU，连接 Wancher brand 和 Dream Pen navigation；验证 publication gate、noop、tamper、collision、remote/hardlink 与真实库 snapshot。</action><verify><automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase134-wancher-dream-pen-true-ebonite-silk-black.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check tests/content/phase134-wancher-dream-pen-true-ebonite-silk-black.test.ts &amp;&amp; git diff --check</automated></verify><done>Silk Black 在 checkpoint public，既有 Wancher 实体与真实库不变并精确提交。</done></task>
</tasks>
