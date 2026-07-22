---
phase: 127-pilot-78g-78gplus-88g-mr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/content-research/pilot-78g-fp-78g-phase127.md
  - .planning/content-research/pilot-88g-mr-guide-phase127.md
  - .planning/content-research/pilot-88g-mr1-phase127.md
  - .planning/content-research/pilot-88g-mr2-phase127.md
  - .planning/content-research/pilot-88g-mr3-phase127.md
  - scripts/data/phase127-pilot-78g-88g-mr.ts
  - scripts/apply-phase127-pilot-78g-88g-mr-content.ts
  - tests/content/phase127-pilot-78g-88g-mr.test.ts
  - src/lib/entity-redirects.ts
  - public/images/library/site-original/phase127/pilot/
autonomous: true
requirements:
  - QUICK-260722-FRG
must_haves:
  truths:
    - "既有 lOgSh4vuQsFK 保留为 pen 并规范为当前中国官网 FP-78G；Pilot 78G+ 是可检索 alias/后继称呼，2013 原版 78G 的 converter、尖型和颜色只作历史样本，不覆盖当前规格。"
    - "既有 2GM0UtshoSVw 不是一支可共享所有花纹的单型号；原位改为 Pilot 88G / MR 系列导览 article，旧中文 pen route永久转向 canonical article route。"
    - "新增且只新增三个 exact pen：88G MR1 Classic FP-MR1、MR2 Animal FP-MR2、MR3 Retro Pop FP-MR3；各自只拥有官网列出的图案组合。"
    - "MR1 保存官网逐项列出的 SIP/SID/GDP/GDZ/BP 五个组合，并披露官网‘3种花纹’与五个编码行的内部冲突，不擅自删减或改写计数。"
    - "MR2 保存 LZD/LPD/WTG/CDL/PTN 五个组合；MR3 保存 DT/WV/FL/MB/EP/HT 六个组合。"
    - "中国 88G exact pages 支撑 F/M、金属杆、Pilot 墨囊与 CON-40；欧洲 MR 的 DIN cartridge 只作地区差异，不能写进中国 exact specs。"
    - "Pilot Australia 官方支撑 MR range 又称 Metropolitan；The Pen Addict 的 Black Plain、White Tiger、Retro Pop 样本分别只支撑对应 MR1/MR2/MR3 外观与样笔观察，不将美国包装/上墨配置外推中国款。"
    - "五份自然中文正文 summary 均为60-160 Unicode、body至少2,000 Unicode；覆盖身份、规格、历史/地区命名、版本差异、维护、购买核验和来源边界。"
    - "五张 primary image 均为1600x900 unique site-original factual SVG，并声明non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。"
    - "78G maker pair原样保留；88G article移除legacy maker/reverse pair，新建三个MR pen的exact made_by/reverse pairs；Pilot brand非拓扑payload不变并按post-topology current hash重审发布。"
    - "78G、88G article、三个MR pens与Pilot brand只经recordEntityContentReview及publishEntity发布；不直接写lifecycle tables。"
    - "apply只接受两个exact raw donors或完整exact terminal；identity、aliases、redirect、source owner、scope、spec、variant、media、topology、review或publication的partial/tamper均fail closed，pristine replay为noop。"
    - "全部试验写入只发生在一个caller-owned checkpoint copy；真实data/fpkg.db与既有Pilot Phase26/41/43/47/60/84/105/108-111 protected entities保持不变。"
  artifacts:
    - path: scripts/data/phase127-pilot-78g-88g-mr.ts
      provides: "FP-78G与三个MR exact product packs、十色/十六个MR图案、地区/历史/样笔证据边界"
    - path: scripts/apply-phase127-pilot-78g-88g-mr-content.ts
      provides: "same-ID 78G canonicalization、88G pen-to-article reclassification、三MR topology与guarded review/publish"
    - path: tests/content/phase127-pilot-78g-88g-mr.test.ts
      provides: "single-checkpoint raw/content/identity/topology/publication/noop/tamper/protected-catalog regression"
---

<objective>
修复 Pilot 78G/78G+ 的代际混写，以及 88G 把 MR1/MR2/MR3 三个 exact product number 压成一支树脂笔的错误身份。

Purpose: 让读者能区分当前中国 FP-78G、历史原版 78G，以及中国 88G/MR 三条金属产品线和地区上墨差异。
Output: 一个规范化 FP-78G pen、一个 88G/MR 导览 article、三个 exact MR pen、十色/十六个图案 variants、五张原创事实图与 checkpoint-only 内容包。
</objective>

<context>
- Raw 78G target: `lOgSh4vuQsFK`, slug `百乐-pilot-78g-78g`, name `百乐 Pilot 78G/78G+`, summary/body 73/234 Unicode, three aliases, legacy spec/claim/two references/retailer primary media, maker `6IWV9yeB5Ppo` + reverse, protected-catalog draft revision 0.
- Raw 88G donor: `2GM0UtshoSVw`, slug `百乐-pilot-88g`, name `百乐 Pilot 88G`, summary/body 64/176 Unicode, two aliases, legacy spec/claim/two references/retailer primary media, maker `G2BD8Zsg8gp0` + reverse, protected-catalog draft revision 0.
- Official FP-78G page: EF/F/M/B, ten colors, resin body, included CON-40 and Pilot cartridge compatibility. The page calls it 78G; 78G+ remains an alternate-market name, not a second entity.
- Official China exact MR pages: FP-MR1, FP-MR2, FP-MR3; all state metal body, F/M and CON-40, with separate pattern lists.
- Canonical article: same 88G donor ID, slug `pilot-88g-mr-guide`, name `百乐 Pilot 88G / MR 系列导览`.
- New pens: `pilot-88g-mr1-fp-mr1`, `pilot-88g-mr2-fp-mr2`, `pilot-88g-mr3-fp-mr3`.
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: 锁定两个raw donor、代际/地区身份与Pilot topology regression</name>
  <files>tests/content/phase127-pilot-78g-88g-mr.test.ts</files>
  <action>在唯一caller-owned checkpoint copy建立现有Pilot prerequisites，锁定两个raw entity、aliases、legacy spec/claim/references/media、publication与maker pairs。断言78G same-ID canonicalize、88G same-ID article、旧route、三MR identities、十色/十六图案、五份copy/五SVG、remove-one/add-three topology、post-topology Pilot review/publication、first publish/noop以及partial/tamper fail-closed。保护全部既有Pilot canonical entities及真实catalog snapshot。</action>
  <verify><automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase127-pilot-78g-88g-mr.test.ts</automated></verify>
  <done>一个owned checkpoint证明两donor身份、四个public pens、系列article、品牌反链、审核发布与真实库不变。</done>
</task>

<task type="auto">
  <name>Task 2: 编写五份来源化正文、evidence packs与五张原创事实图</name>
  <files>.planning/content-research/pilot-78g-fp-78g-phase127.md, .planning/content-research/pilot-88g-mr-guide-phase127.md, .planning/content-research/pilot-88g-mr1-phase127.md, .planning/content-research/pilot-88g-mr2-phase127.md, .planning/content-research/pilot-88g-mr3-phase127.md, scripts/data/phase127-pilot-78g-88g-mr.ts, public/images/library/site-original/phase127/pilot/</files>
  <action>以Pilot中国 exact product pages锁定货号、尖号、材料、颜色/图案与上墨；以Pilot Australia/EU/Brazil官方资料只描述地区命名和兼容差异；以The Pen Addict及Il Pennofilo样本限制写感/尺寸/包装。正文明确78G代际、MR1官网计数冲突、MR/Metropolitan名称与China/EU cartridge边界。</action>
  <verify><automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; xmllint --noout public/images/library/site-original/phase127/pilot/*.svg</automated></verify>
  <done>五份2k+自然中文正文、结构化证据、26个variant边界与五张唯一原创图完成。</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: 实现guarded canonicalization/reclassification、发布、验证并精确提交</name>
  <files>scripts/apply-phase127-pilot-78g-88g-mr-content.ts, src/lib/entity-redirects.ts</files>
  <action>写入前验证repo/DB authority、migration032、protected snapshot、baseline、slug/alias/source/route collisions及exact raw-or-terminal。transaction规范78G、清理88G mixed payload并改article、删除旧88G maker pair、新建三MR pens和六条maker links、安装packs；之后逐entity审核并publish，再按拓扑后current hash重审Pilot brand。完成定向test、tsc、owned-file Biome、XML与diff；product与GSD docs分开精确提交。</action>
  <verify><automated>cd /Users/xz/CodeBuddy/fountain-pen-graph &amp;&amp; node --import tsx --test tests/content/phase127-pilot-78g-88g-mr.test.ts &amp;&amp; pnpm exec tsc --noEmit --pretty false &amp;&amp; pnpm exec biome check tests/content/phase127-pilot-78g-88g-mr.test.ts src/lib/entity-redirects.ts &amp;&amp; xmllint --noout public/images/library/site-original/phase127/pilot/*.svg &amp;&amp; git diff --check</automated></verify>
  <done>78G+article+三MR pens published、Pilot反链current、replay/tamper与allowlist提交全部成立。</done>
</task>

</tasks>

Excluded: 把原版78G与当前FP-78G规格合并、把88G写成树脂笔、把MR1/2/3压成颜色variant、把欧洲DIN cartridge写入中国款、复用无授权retailer图片、真实DB迁移、通用runner/Playwright/readiness/search/LLM/schema/package改动及任何unrelated dirty/untracked文件。Phase127完成不等于全量goal完成。
