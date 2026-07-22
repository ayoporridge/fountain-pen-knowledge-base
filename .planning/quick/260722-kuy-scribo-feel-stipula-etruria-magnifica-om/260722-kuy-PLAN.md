---
quick_id: 260722-kuy
status: complete
date: 2026-07-22
description: 批量发布意大利八个代表型号：SCRIBO Feel、Stipula Etruria Magnifica、当代 OMAS Ogiva、当代 Delta Dolcevita Mid-Size、Pineider Avatar UR、Santini Libra、Visconti Divina Elegance 与原始 Mirage
---

# Quick Task 260722-kuy：意大利八型号、七品牌、十五包批次

## Goal

沿用现有 `CuratedEntityPack`、content review 与 publication gate 路径，在一个 caller-owned checkpoint copy 上发布 SCRIBO Feel、Stipula Etruria Magnifica、当代 OMAS Ogiva、当代 Delta Dolcevita Mid-Size、Pineider Avatar UR、Santini Libra、Visconti Divina Elegance 与原始 Visconti Mirage；新增 SCRIBO、Stipula、OMAS、Delta、Pineider、Santini 六个品牌包，更新既有 Visconti 品牌包，形成恰好 15 个可重放 pack。不得修改真实 `data/fpkg.db`，不得改写任何既有 Visconti 型号。

## Scope and hard boundaries

- 新品牌：SCRIBO、Stipula、当代 OMAS、当代 Delta、Pineider、Santini Italia；每个品牌只承担来源化品牌史与本批型号导航，不能用旧公司、创始谱系或商标复兴叙事替代当前制造主体和当前商品证据。
- 既有品牌：复用 canonical Visconti identity 与当前已发布品牌包，只增加 Divina Elegance、原始 Mirage 的来源、导航 claim 与精确 reverse links；Homo Sapiens 五个 sibling、Rembrandt 原始款／Rembrandt-S 及其他既有公开 Visconti 型号的全表 digest 必须逐项保持不变。
- 八个型号各自使用自然中文正文，按 `Array.from(bodyMd).length >= 2_000` 计数；正文需覆盖身份、可核当前或历史规格、版本边界、书写／人体工学、维护、选购与验货，不得用模板化堆字满足长度。
- 每个型号至少包含一个官方 primary source 与一个独立 professional secondary source；每条尺寸、重量、笔尖、供墨、材质、年份和状态只落在其证据实际覆盖的 scope。来源冲突写入 `conflicts` 或 rejected evidence，不能用零售摘要覆盖官网，也不能将单支评测样本推广到全系列。
- 身份边界不可折叠：当代 OMAS Ogiva 与 2016 年前旧 OMAS／旧 Ogiva 分开；当前 Delta Dolcevita Mid-Size 的 steel-nib cartridge/converter SKU 与 14K piston SKU 分开；Etruria Magnifica 按具体 variant、笔尖与 filling system 限定，不能把 Ambra、Alter Ego、Volterra 或其他 Etruria 尺寸混成一套；Avatar UR 不吸收普通 Avatar、UR Deluxe、Black Edition 或 Twin Tank Touchdown；Santini Libra 的 acrylic 当前 SKU 不继承 ebonite sibling 或某支评测样笔的尺寸、重量和手感；Divina Elegance 的当前规格不继承历史 14K／23K palladium 等 nib/sample 记录；原始 Mirage 与 Mirage Mythos 保持独立，Mythos 的较大笔尖、黄铜中段与中环不能写回原始 Mirage。
- 八个新型号与六个新品牌各使用独立的 site-original factual SVG；既有 Visconti 品牌更新复用已发布的品牌事实图。全部媒体明确标注 `non-photo`、`non-logo`、`not-to-scale` 与 `non-colour-proof`；不得抓取、描摹或伪装成产品照片、品牌 Logo 或颜色证明。
- 不新增通用基础设施，不修改 search、LLM 或 public page 行为，不引入依赖，不运行或新增 Playwright；只创建本批 research/body、SVG、pack、apply entrypoint 与一个 caller-owned checkpoint test。

## Task 1: 核验七品牌／八型号并完成十五份正文与十四张新增原创事实图

- **files:** `.planning/content-research/scribo-brand-phase140.md`, `.planning/content-research/scribo-feel-phase140.md`, `.planning/content-research/stipula-brand-phase140.md`, `.planning/content-research/stipula-etruria-magnifica-phase140.md`, `.planning/content-research/omas-brand-phase140.md`, `.planning/content-research/omas-ogiva-current-phase140.md`, `.planning/content-research/delta-brand-phase140.md`, `.planning/content-research/delta-dolcevita-mid-size-current-phase140.md`, `.planning/content-research/pineider-brand-phase140.md`, `.planning/content-research/pineider-avatar-ur-phase140.md`, `.planning/content-research/santini-brand-phase140.md`, `.planning/content-research/santini-libra-phase140.md`, `.planning/content-research/visconti-brand-italian-batch-phase140.md`, `.planning/content-research/visconti-divina-elegance-phase140.md`, `.planning/content-research/visconti-mirage-original-phase140.md`, `public/images/library/site-original/phase140/scribo/{scribo,feel}.svg`, `public/images/library/site-original/phase140/stipula/{stipula,etruria-magnifica}.svg`, `public/images/library/site-original/phase140/omas/{omas,ogiva-current}.svg`, `public/images/library/site-original/phase140/delta/{delta,dolcevita-mid-size-current}.svg`, `public/images/library/site-original/phase140/pineider/{pineider,avatar-ur}.svg`, `public/images/library/site-original/phase140/santini/{santini,libra}.svg`, `public/images/library/site-original/phase140/visconti/{divina-elegance,mirage-original}.svg`
- **action:** 先逐型号读取当前官方产品页、官方目录／品牌史以及独立专业评测或专业零售档案，记录 URL、retrieved date、SKU/variant、生产时态和可引用 locator；失效官网只能作为带 archive locator 的历史来源，当前状态必须有仍可核的官方证据。为八个型号撰写各不少于 2,000 Unicode 字符的自然中文正文，并为七个品牌撰写来源化品牌导航正文；品牌正文不能把 2016 年前 OMAS 或旧 Delta 法人历史直接等同于当前公司。按本计划的八项边界分别建立 current／historic／variant／sample scopes、qualified 与 rejected evidence。制作 14 张 1600×900 site-original SVG，每张只呈现文字、几何结构与已来源化对比事实，并在图内和 metadata 中声明非产品照片、非 Logo、非比例图、非颜色证明；Visconti 品牌沿用 `/images/library/site-original/visconti-homo-sapiens/brand.svg`。
- **verify:** `node -e "const fs=require('node:fs');const files=['scribo-feel','stipula-etruria-magnifica','omas-ogiva-current','delta-dolcevita-mid-size-current','pineider-avatar-ur','santini-libra','visconti-divina-elegance','visconti-mirage-original'].map(x=>'.planning/content-research/'+x+'-phase140.md');for(const f of files){const n=Array.from(fs.readFileSync(f,'utf8')).length;if(n<2000)throw new Error(f+': '+n)}"` 通过；15 个 research/body 文件均有正文，14 个新增 SVG 均可由 `xmllint --noout` 解析且包含四项非商品图声明，Visconti 复用媒体存在且保持不变。
- **done:** 七个品牌与八个型号拥有可审计的中文正文和互不冒充的原创事实图；每个型号的 official primary、professional secondary、时态、variant 与 sample 边界均可直接转录为 pack 数据。

## Task 2: 建立十五个 CuratedEntityPack 并锁定品牌—型号拓扑

- **files:** `scripts/data/phase140-italian-representative-models-batch.ts`
- **action:** 参照 `scripts/data/phase139-german-swiss-current-batch.ts` 与 `scripts/data/phase49-visconti-homo-sapiens.ts`，定义稳定的 `PHASE140_BRANDS`、`PHASE140_IDS`、`PHASE140_SLUGS`、分品牌 groups、all-packs loader，以及恰好 7 个 brand + 8 个 pen 的 `CuratedEntityPack`。六个新品牌使用新稳定 ID；Visconti 必须复用 `PHASE49_VISCONTI_BRAND_ID` 和 canonical slug，基于已发布 Visconti pack 做受控 clone/update，绝不创建第二个 Visconti。所有型号 pack 配置唯一 `made_by`、brand reverse、aliases、sources、scopes、claims、完整 `model_specs` evidence、必要 variants/conflicts/timeline 和 Task 1 的 media；当代 OMAS／Delta 名称、scope 与 claim 必须显式保留复兴后时态，另外六项按 Scope 中的 sibling/sample 边界保存 rejected evidence。每个型号至少两个独立 `independenceGroup`，其中一项为 official primary、一项为 professional secondary；不得把 site-original image source 算作产品事实的独立来源。
- **verify:** loader 返回 15 个唯一 entity ID、15 个有效 media path（其中 Visconti 品牌复用既有路径）、7 个 brand 与 8 个 pen；逐 pack 执行 `loadCuratedEntityPack`/`validatePack`，八个 pen 的 `bodyMd` 长度均达标、`spec.evidence` 覆盖每个已填写字段、每个边界至少有 resolved conflict 或 `qualifies: false` evidence，所有 pack 的 publication intent 可进入既有 review/publish gate。
- **done:** 15 个 pack 可由现有 `CuratedEntityPack` contract 加载，六个新品牌、既有 Visconti 和八个型号之间的 identity、maker 与 reverse 拓扑确定且无 slug/name/alias/source-marker collision。

## Task 3: 在一个 caller-owned checkpoint 上发布、保护 Visconti 存量并验证可重放性

- **files:** `scripts/apply-phase140-italian-representative-models-batch-content.ts`, `tests/content/phase140-italian-representative-models-batch.test.ts`
- **action:** 参照 Phase 139 的 batch orchestration，创建 Phase 140 apply entrypoint：拒绝 remote env、空 reviewer、symlink、hardlink、repo alias/path mismatch、client/path mismatch、非 owned-root 数据库、collision 以及 mixed empty/terminal 或 partial/tampered 状态；只在 caller-owned copy 内补齐所需既有 Visconti prerequisites。首次执行先验证 canonical Visconti baseline，记录所有既有公开 Visconti pen 的完整 digest 与品牌 reverse targets，再创建六个品牌和八个型号 topology，按 brand group 调用现有 `applyCuratedContentPacks`，经 `recordEntityContentReview`/`publishEntity` 路径产生 fact、language、media、publication 四类当前 hash approvals。验后要求 15 项全部 `published`，Visconti 品牌 reverse delta 恰为新增 Divina Elegance 与原始 Mirage，所有旧 Visconti pen digest 不变；重放必须 15 项全部 `noop` 且 hash 稳定。唯一 test 自己创建临时 owned root、从真实 catalog 制作 checkpoint copy、迁移并执行所需 prerequisites；覆盖首次发布、终态 shape/counts、15 个 pack、来源／正文／SVG contract、精确 maker/reverse、旧 Visconti 保护、重放、remote/symlink/hardlink/collision/partial/tamper fail-closed，并在开始与结束比较真实 catalog snapshot。不要建立第二个测试文件、通用测试 helper、search/LLM 代码或浏览器测试。
- **verify:** `node --import tsx --test tests/content/phase140-italian-representative-models-batch.test.ts`、`pnpm exec tsc --noEmit`、`pnpm exec biome check scripts/data/phase140-italian-representative-models-batch.ts scripts/apply-phase140-italian-representative-models-batch-content.ts tests/content/phase140-italian-representative-models-batch.test.ts` 与 14 个新增 SVG 的 `xmllint --noout` 全部通过；`git diff -- data/fpkg.db data/fpkg.db-shm data/fpkg.db-wal` 为空。
- **done:** 一个 caller-owned checkpoint test 证明首次精确发布 15 项、重放 15 项 noop、每项当前 content hash 有四类 approved review、六个新品牌与八个型号均公开可达、既有 Visconti 型号逐项未变、真实数据库未变。

## Source coverage audit

| Source | Requirement | Plan coverage | Status |
|---|---|---|---|
| GOAL | 8 个意大利代表型号、6 个新品牌、更新 Visconti、15 packs | Tasks 1–3 | COVERED |
| REQ | 每个型号自然中文正文不少于 2,000 Unicode 字符 | Tasks 1–3 | COVERED |
| REQ | 每个型号 official primary + professional secondary | Tasks 1–2 | COVERED |
| REQ | 8 组时态／variant／sample 身份边界 | Tasks 1–3 | COVERED |
| REQ | site-original non-product SVGs | Tasks 1–3 | COVERED |
| REQ | 单一 caller-owned checkpoint、现有 review/publish、真实 DB 不变 | Task 3 | COVERED |
| REQ | 既有 Visconti 型号受保护 | Tasks 2–3 | COVERED |
| REQ | 不做 generic infra/search/LLM/Playwright | Scope、Task 3 | COVERED |

## Completion boundary

本批完成仅核销上述八个型号、六个新品牌与一次 Visconti 导航更新；**它不代表 full corpus goal、305 条库存来源化、P0/P1 扩容、正式生产迁移、全量页面验收、部署或线上复查完成**。本 Quick 结束后 full-goal completion 必须继续保持 active，不能因 15 个 pack 通过 checkpoint 而宣告总体目标完成。
