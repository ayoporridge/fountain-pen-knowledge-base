---
phase: 125-platinum-small-meteor-pq-200
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/content-research/platinum-small-meteor-pq-200-phase125.md
  - scripts/data/phase125-platinum-small-meteor-pq-200.ts
  - scripts/apply-phase125-platinum-small-meteor-pq-200-content.ts
  - tests/content/phase125-platinum-small-meteor-pq-200.test.ts
  - public/images/library/site-original/phase125/platinum/platinum-small-meteor-pq-200.svg
autonomous: true
requirements:
  - QUICK-260722-ECD
must_haves:
  truths:
    - "既有 draft Er9lACPas9qm 原位规范为 Platinum Small Meteor PQ-200 小流星，不新建第二个 PQ-200；旧中文路由永久转向新 canonical pen route。"
    - "删除错误 alias Platinum Preppy；Platinum PQ200、白金 小流星 PQ200 与旧 canonical name只作为 PQ-200 aliases，不能把日本 Preppy PPQ/PSQ 产品合并进来。"
    - "PQ-200 是 2019 年上海白金制造的中国/亚洲市场 Small Meteor；Preppy、PQ-300、PQ-800、PQ-1500、联名与主题版本均保留 sibling/后继/edition 边界，不成为 target identity。"
    - "F 与 EF 的推出时态、八棱无夹杆帽、钢尖、ABS/PC、国产身份、Platinum 墨囊与 compatible converter均按来源独立归属；0.38 mm和13 g只能保留为retailer measurement，不冒充官方稳定规格。"
    - "正文为自然中文，summary 60-160 Unicode、body至少2,000 Unicode，含身份、规格、历史、版本差异、维护、购买核验、样笔观察和来源边界。"
    - "唯一 primary image 为1600x900 site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。"
    - "保留既有 made_by fIzZ7krBuptA 与 reverse row不变；Platinum brand topology/hash/publication不变，不重放 brand/Preppy pack。"
    - "目标只在 current hash 经 fact/language/media recordEntityContentReview 与 publishEntity 发布，不直接写 lifecycle tables。"
    - "apply只接受exact raw或exact terminal；identity/alias/redirect/source owner/scope/spec/variant/media/review/publication任一partial或tamper均fail closed，pristine replay为noop。"
    - "全部试验写入只发生在一个caller-owned checkpoint copy；真实data/fpkg.db main/WAL/SHM及Phase42/44/78/121-124 protected entities保持不变。"
  artifacts:
    - path: scripts/data/phase125-platinum-small-meteor-pq-200.ts
      provides: "locked identity、evidence ledger、F/EF dated variants、rejected sibling boundaries与CuratedEntityPack"
    - path: scripts/apply-phase125-platinum-small-meteor-pq-200-content.ts
      provides: "raw-or-terminal gate、same-ID canonicalization、DB redirect、review/publish与authority checks"
    - path: tests/content/phase125-platinum-small-meteor-pq-200.test.ts
      provides: "single-checkpoint identity/content/source/relationship/publication/noop/tamper/protected-catalog regression"
---

<objective>
修复 Platinum 小流星 raw 条目把 PQ-200 与 Preppy 混为同一型号的错误，并原位发布来源化的 Small Meteor PQ-200 页面。

Purpose: 保留中国/亚洲市场型号的独立身份和既有品牌关系，同时把官方/行业资料、专业对比与样笔观察拆成清楚的证据边界。
Output: 一份2k+自然中文正文、一个phase-local pack、一个guarded apply、一个single-checkpoint定向回归和一张原创事实图。
</objective>

<execution_context>
@/Users/xz/.codex/gsd-core/workflows/execute-plan.md
@/Users/xz/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/STATE.md
@.planning/content-research/research-platinum-p3776-2026-07-20.md
@.planning/quick/260722-dg6-reclassify-platinum-fuji-shunkei-and-publish-five-editions/260722-dg6-SUMMARY.md
@scripts/data/phase122-platinum-president-ptb-20000p.ts
@scripts/apply-phase122-platinum-president-ptb-20000p-content.ts
@tests/content/phase122-platinum-president-ptb-20000p.test.ts
@src/lib/publication.ts

<interfaces>
- Target raw: `Er9lACPas9qm`, pen, slug `白金-platinum-小流星pq200`, name `白金 Platinum 小流星PQ200`, summary/body Unicode 110/171, aliases `Platinum PQ200`、错误 `Platinum Preppy`、`白金 小流星 PQ200`。
- Existing topology: `fIzZ7krBuptA` target→Platinum `e51tJpejEkXY`, reverse `rev-fIzZ7krBuptA`; rows/reasons必须保持不变。
- Legacy payload: spec `spec-platinum-preppy-pq200-research`、claim `claim-platinum-preppy-pq200-source-boundary`、two references（search index + AwesomePens commercial image）、draft publication。
- Canonical: same ID, `Platinum Small Meteor PQ-200 小流星`, slug `platinum-small-meteor-pq-200`; old route写DB permanent redirect到新pen route。
- Preppy protected identity来自Phase44；不得把 alias、spec、variant、source或relationship写到PQ-200。
- Publication必须只调用`recordEntityContentReview`和`publishEntity`。
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 锁定raw identity、Preppy separation、evidence与publication regression</name>
  <files>tests/content/phase125-platinum-small-meteor-pq-200.test.ts</files>
  <action>
复用Phase122 single-target结构，在一个top-level setup中只创建一个caller-owned checkpoint copy并迁移到032；按Phase42、44、78、121、122、123、124 fixture链建立Platinum brand及protected models。首写前逐字段锁定target raw、aliases、maker/reverse、legacy spec/claim/references、draft publication和redirect absent。

断言same ID canonicalize、错误Preppy alias移除、旧route永久跳转、relationship rows完全不变、Preppy full digest不变。逐项验证来源locator/scope、F/EF dated variants、rejected siblings、summary/body、unique SVG、四项current-hash approvals和public visibility。first apply为published、pristine replay为noop；对alias、scope、variant、spec、media、review、publication、redirect及source owner做savepoint tamper并确认fail closed。
  </action>
  <verify><automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase125-platinum-small-meteor-pq-200.test.ts</automated></verify>
  <done>单一owned checkpoint证明PQ-200独立身份、Preppy保护、发布门禁、noop/tamper及真实catalog不变。</done>
</task>

<task type="auto">
  <name>Task 2: 编写来源化正文、evidence pack与原创事实图</name>
  <files>.planning/content-research/platinum-small-meteor-pq-200-phase125.md, scripts/data/phase125-platinum-small-meteor-pq-200.ts, public/images/library/site-original/phase125/platinum/platinum-small-meteor-pq-200.svg</files>
  <action>
正文固定`## summary`和`## body_md`。以上海白金官网钢笔目录、Paperworld China 2019 Best Stationery of China资料与台湾授权渠道exact product为身份/规格主证；老木曾雪菜2021-02-28全系实物对比只支持2019 F、2020 EF、中国制造、与Preppy相似但不同的书写组件及其样笔观察；晨莹2021-08-18仅支持一支Coral F样笔。AwesomePens只作retailer measurement/current listing，不解锁core facts。

明确Little Meteor/Small Meteor/Starlet是地区译名，canonical采用Small Meteor + 小流星 + exact PQ-200；不把商品平台的大量颜色/联名宣传写成完整variants。维护只使用Platinum general instructions与可拆洗常识，不写未经证实的多年不干承诺。SVG以身份分叉、F/EF时态、八棱无夹和墨水路径为信息主体。
  </action>
  <verify><automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; test -s .planning/content-research/platinum-small-meteor-pq-200-phase125.md &amp;&amp; xmllint --noout public/images/library/site-original/phase125/platinum/platinum-small-meteor-pq-200.svg</automated></verify>
  <done>自然中文正文、结构化证据、版本/样笔边界与唯一原创图完成。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现same-ID guarded apply、验证并精确提交</name>
  <files>scripts/apply-phase125-platinum-small-meteor-pq-200-content.ts</files>
  <action>
所有写入前验证repo/DB authority、protected snapshot、migration032、baseline、source/route/repo collisions和exact raw-or-terminal。raw transaction清理legacy payload、规范identity/aliases、安装loaded pack并写旧slug redirect；relationship rows不动。transaction后计算current hash，经review APIs记录fact/language/media并publish；terminal gate必须完整匹配后才允许noop。

完成定向test、tsc、owned-file Biome、SVG XML与diff检查。提交前检查status/index，只stage frontmatter五个产品文件；PLAN/SUMMARY/STATE另做docs commit。声明Phase125仍只是full-corpus partial batch。
  </action>
  <verify><automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase125-platinum-small-meteor-pq-200.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check tests/content/phase125-platinum-small-meteor-pq-200.test.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase125/platinum/platinum-small-meteor-pq-200.svg &amp;&amp; git diff --check</automated></verify>
  <done>same-ID published PQ-200、Preppy separation、unchanged topology、exact replay/tamper与allowlist提交全部成立。</done>
</task>

</tasks>

<source_audit>
- 上海白金制笔有限公司官网钢笔分类页：独立列出小流星产品线并同时列出PPQ-200，证明地区产品身份不能与Preppy alias合并；current page中的PQ-300只作后继/当前目录边界。
- Paperworld China / Messe Frankfurt `Best Stationery of China Awards`：2019 award material明确列出`Platinum PQ-200 Fountain Pen`，支撑产品代码与当年公开身份。
- 台湾授权渠道永昌：exact `STARLET 小流星 PQ-200（原PQ-180）`、F、七色、不锈钢/ABS/PC、中国、Platinum cartridge与日规converter；只作地区渠道文档，不外推全球当前状态。
- 老木曾雪菜／新浪众测，2021-02-28：购买并拆看同系列，支撑2019 F、2020 EF、上海制造、笔尖/杆帽比较；主观写感只属样笔。
- 晨莹／钢笔爱好者，2021-08-18：exact Coral F owner sample；包装、八棱、附带converter和写感只属该样笔。
- AwesomePens：retailer exact PQ-200 listing；13 g、0.38 mm、PQR-200与在售颜色仅作commercial snapshot，不作为official stable truth。
</source_audit>

Excluded: 新建第二PQ-200、修改Preppy正文/identity、把PQ-300/PQ-800/PQ-1500/联名扩成entities、真实DB迁移、通用runner/Playwright/readiness/search/LLM/schema/package改动及任何unrelated dirty/untracked文件。Phase125完成不等于全量goal完成。
