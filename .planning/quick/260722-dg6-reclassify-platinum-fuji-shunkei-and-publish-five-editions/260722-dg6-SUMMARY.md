---
phase: 124-platinum-fuji-shunkei-five-editions
plan: 01
subsystem: content
tags: [platinum, fuji-shunkei, identity, publication, checkpoint]
status: complete
requirements_completed:
  - QUICK-260722-DG6
completed: 2026-07-22
product_commit: 0b5d93f
---

# Phase 124: Platinum Fuji Shunkei 五款精确型号 Summary

## Outcome

把错误复合身份 `白金 Platinum 富士旬景PNB-13000` 原位改成系列导航 `Platinum Fuji Shunkei 富士旬景系列`，并发布五个有独立型号、证据和正文的 canonical pen：

- Shungyo `PNB-25000SY`
- Kumpoo `PNB-25000SK`
- Rokka `PNB-30000SR`
- Shiun `PNB-35000SS`
- Kinshu `PNB-36000SK`

产品提交：`0b5d93f feat(content): reclassify Platinum Fuji Shunkei and publish five editions`。

## Identity and Route Repair

- 既有 ID `ogo1UmxmcXJT` 保持不变，由错误单型号 `pen` 改为 `article`，canonical slug 为 `platinum-fuji-shunkei`。
- 旧 `/pen/白金-platinum-富士旬景pnb-13000` 通过静态 reclassified-article mapping 永久转向 `/article/platinum-fuji-shunkei`；没有绕过 migration-032 的 redirect CHECK。
- 只保留真实 alias `Platinum Fuji Shunkei`；删除错误的 `Platinum PNB-13000`、`白金 富士旬景 PNB-13000` 及复合旧名，不让错误 SKU 继续污染系列身份。
- Platinum 官方资料证明 `PNB-13000` 是普通 #3776 Century 的 Chenonceau White／Laurel Green 品番，并非富士旬景；现有 canonical #3776 Century 未重建、未改写。
- 富士旬景系列边界锁定为 2017–2021 五款；2023 起的 Fuji Unkei 是后继系列，不并入本 article、variants 或 topology。

## Content Delivered

- 新增 6 份 reviewed natural-Chinese copy：系列导航一份、五个精确型号各一份。
- 六份 summary 均在 60–160 Unicode 字符内，body 为 2,991–3,361 Unicode 字符，覆盖可核实介绍、规格、历史顺序、版本与尖号差异、使用维护、购买核验、样笔披露和来源边界。
- 系列页与五个型号页双向链接；系列只负责导航，不把不同年份的限量、尖号、附件或样笔观察共享给 sibling。
- 新增 6 张 1600×900 unique site-original factual SVG；均明确为 non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof，未复制官方摄影或商标。

## Sources and Evidence Boundaries

- Platinum official `pid=8638`：Shungyo `PNB-25000SY` 的首款身份、2017 年、3,776 支及 exact product specs。
- Platinum official `pid=7505`：Kumpoo `PNB-25000SK` 的第二款身份、2018 年、2,500 支及 exact product specs。
- Platinum official `pid=7506`：Rokka `PNB-30000SR` 的第三款身份、2019 年、2,500 支及 exact product specs。
- Platinum official `pid=9605`：Shiun `PNB-35000SS` 的第四款身份、2020 年、3,776 支及 exact product specs。
- Platinum official `pid=10162`：Kinshu `PNB-36000SK` 的第五／最终款身份、2021 年、订单量限定及 exact product specs。
- Platinum official `pid=8807`：只作 `PNB-13000` 普通 #3776 Century 身份反证。
- Platinum official Fuji Unkei PDF：只支撑 Fuji Shunkei 2017–2021 闭合与 Fuji Unkei 后继系列边界。
- The Pen Addict 的 Shungyo／Kumpoo／Rokka exact samples 与 Journals & Jottings 的 Shiun exact sample 均限于各自样笔观察。
- Rachel's Reflections 2024 year-in-review 提供一支二手 Kinshu EF owner sample，记录为 `professional_secondary`，只支持该样笔；Bertram's Inkwell 保持 retailer／non-core／rejected，不参与 publication readiness。

所有 source item 均有 document-specific locator、scope 和 owner；官方稳定事实、dated snapshot、professional sample、owner sample 与 retailer material 不能跨接。

## Topology and Publication

- 一个 transaction 删除旧 article 的单一 `made_by`／reverse pair，并为五个新 pen 各建立一对 exact Platinum `made_by`／reverse links，brand reverse delta 精确为 remove-one/add-five。
- Platinum brand 的 non-topology payload 保持不变；topology 改变后重新计算 current hash，再通过既有 review/publication API 重审发布，没有重放 brand pack。
- article、五个 pen 与 post-topology Platinum brand 均只通过 `recordEntityContentReview` 的 fact/language/media 三项审核和 `publishEntity` 发布；没有直接写 `entity_publications`、reviews 或 `public_entities`。
- first apply 返回一个 article 与五个 pens published；pristine replay 精确返回六个 noop。current publication hashes 已由定向回归验证，本 SUMMARY 不复制易失的 checkpoint-local hash 值。

## Verification

- `node --import tsx --test tests/content/phase124-platinum-fuji-shunkei.test.ts` — PASS，约 140 秒，1 test passed。
- 单一 top-level caller-owned checkpoint copy 完成 Phase42 → 78 → 121 → 122 → 123 prerequisites、first write、noop、authority faults、hard-link fault、false-alias tamper、variant tamper 与 protected-catalog regression。
- `pnpm exec tsc --noEmit --pretty false` — PASS。
- repo 配置实际纳入的 owned files（test 与 `src/lib/entity-redirects.ts`）Biome — PASS；phase-local ignored files仍由 TypeScript检查。
- `xmllint --noout public/images/library/site-original/phase124/platinum/*.svg` — PASS。
- `git diff --check`、exact 16-path product stage/commit proof — PASS。
- 真实 `data/fpkg.db` main/WAL/SHM 快照前后不变；所有实验写入只发生在 owned checkpoint copy。

## Deviations and Issues

### Auto-fixed Issues

**1. Retailer reliability enum 使用 schema 已有值**

- 初始实现把 retailer reliability 写成 schema 不接受的 `retailer_context`。
- 修正为已有 enum `medium`；retailer tier、`qualifies:false` 与 rejected evidence 仍完整保存商业证据边界，没有提高其 publication 权重。

**2. Kinshu professional-secondary 缺口使用真实 exact sample 补齐**

- 首轮发布被 `missing_professional_secondary_group` 正确阻断。
- 没有把 retailer 伪装成独立专业资料；改为找到 Rachel's Reflections 的 2024 exact Kinshu EF owner sample，并继续保留 Bertram's Inkwell 为 non-core retailer。

**3. Publication tamper 回归服从 immutable guard**

- 直接篡改已发布 lifecycle row 被数据库 immutable publication guard 正确拒绝。
- 测试改用 false alias content tamper，并以 savepoint 恢复，继续证明 terminal mismatch fail closed，而不绕过 guard。

## Protected Scope

- Phase42 #3776 Century、Phase78 Curidas、Phase121 Procyon、Phase122 President、Phase123 Izumo/PIZ 的 identity、content、publication 与各自受保护 topology 未被改写。
- 未触碰其它 agents 的 untracked research、`.next-phase*`、`.planning/quick/260719-665-montblanc-writers-edition-patron-of-art-/` 或 Phase105 quick 目录。
- 未执行 production catalog migration、部署、全站自动验收或真人逐页遍历。

## Next Phase Readiness

Phase124 只是 Platinum/full-corpus 的一个 partial batch。下一步先查明 raw `Er9lACPas9qm` “小流星／PQ200”的地区命名、与 Preppy 的产品关系、可证 SKU 与 maker topology，再决定原位 canonicalize、重分类或拆分；其后继续处理 Platinum Maki-e 混合系列和其它真正未覆盖品牌／型号。

full-corpus goal remains active；生产资料库仍未迁移。

## Self-Check: PASSED

- 16 个 product files 已由 `0b5d93f` 精确提交。
- 本 prefixed SUMMARY 在产品提交之后创建。
- SUMMARY、PLAN 与 STATE 将作为独立 docs commit；不把 Phase124 误报为全量完成。

---
*Phase: 124-platinum-fuji-shunkei-five-editions*
*Completed: 2026-07-22*
