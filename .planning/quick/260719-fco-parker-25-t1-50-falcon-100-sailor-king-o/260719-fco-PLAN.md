---
phase: quick
plan: 260719-fco
status: complete
created_at: 2026-07-19T11:03:00+08:00
---

# Quick Task 260719-fco Plan

## Goal

沿用现有来源化内容流水线，只交付 Parker 25、T1、50 Falcon、100 四页。先在 caller-owned checkpoint copy 上确认真实身份，再实施内容、关系、别名修正和定向回归。Sailor 与 Pelikan 改由后续独立 Quick 承接，避免三品牌大包造成晚审查和重复验证。

## Success criteria

- Parker 四页在本 Quick 内完整交付；只修改 Parker research、phase36 data／wrapper／test 与 Parker media，不能改共享 helper 或其他品牌文件。
- 每个目标先全库核对 `entities`、aliases、lineage、redirects、`model_specs`、stories、media 与 `made_by`，再把 identity action 明确记录为 `keep`、`create`、`split`、`retire` 或 `reclassify`；旧审计 artifact 中的 ID 只能作为候选线索，禁止按名称猜 ID 或复用已退休 ID。
- 每个公开型号页都有自然中文介绍、规格、历史、版本差异、维护、选购与逐条引用；字段证据绑定具体年代、市场、SKU 或版本，不把家族资料外推给单一型号。
- 官网、原始目录／历史档案优先，可靠专业资料用于独立补证，零售商只证明在售 SKU／尺寸／包装等其实际覆盖的事实；搜索页、聚合摘要和旧站内正文不能充当最终核心证据。
- 精确且授权状态明确的型号实拍才能落为照片；否则使用本站原创 factual SVG，并在图中和媒体 metadata 明确“非产品照片”。近似型号、相邻尺寸或官方保留版权摄影不得冒充目标型号。
- 每个公开 pen 只有一个正确品牌 `made_by`，品牌页反向集合完整；系列导航与 nib／concept 不得冒充单支钢笔，也不得污染品牌的公开型号数。
- 仅复用 `applyCuratedContentPacks`、既有 identity／lineage／redirect schema、`member_of_series` 关系和 phase30–35 caller-owned checkpoint-copy 测试 seam；不新增 runner、Playwright、AI、readiness 或通用验收基础设施。
- Phase 36 定向测试、TypeScript、scoped Biome、SVG／媒体校验与 production build 通过；重复应用返回 `noop`；真实 `data/fpkg.db` main／WAL／SHM 的当次快照完全不变。
- 本 Quick 只完成列出的页面与 taxonomy，不宣称 69 个品牌、236 个既有型号、305 个实体或总 `/goal` 已完成。

## Execution order and ownership

| Wave | Priority | Task | Ownership |
|---|---:|---|---|
| 1 | 1 | Parker 25／T1／50 Falcon／100 | Parker research、phase36 data／wrapper／test、Parker media only |

两组外网研究可并行，但由 Root 统一写入和验证，避免多人同时改同一 content pack。

## Task 1 — Parker 25、T1、50 Falcon、100（第一优先）

**Files**

- `.planning/content-research/parker-25-publishable-content-2026-07-19.md`
- `.planning/content-research/parker-t1-publishable-content-2026-07-19.md`
- `.planning/content-research/parker-50-falcon-publishable-content-2026-07-19.md`
- `.planning/content-research/parker-100-publishable-content-2026-07-19.md`
- `scripts/data/phase36-parker-25-t1-50-falcon-100.ts`
- `scripts/apply-phase36-parker-25-t1-50-falcon-100-content.ts`
- `tests/content/phase36-parker-25-t1-50-falcon-100.test.ts`
- `public/images/library/site-original/parker-25-t1-50-falcon-100/**`
- `public/images/library/wikimedia/parker-25-t1-50-falcon-100/**`
- `public/images/library/licensed/parker-25-t1-50-falcon-100/**`

**Action**

1. 先在一个从 `data/fpkg.db` 生成、caller-owned 且迁移到当前 schema 的 checkpoint copy 上依次应用 Parker phase28、phase30、phase34。随后按规范化名称、slug、alias、旧路由、lineage、source/spec/story 和 `made_by` 做全库碰撞矩阵。Phase 19 固定 artifact 未列出这四款，只能证明旧快照中没有同名行，不能直接授权 `create`；以当前 owned copy 结果为准，在每份研究文件的 `Identity decision` 段记录 exact row ID、证据和最终 action。若无候选才生成稳定新 ID；若有精确同义实体则 `keep`；混合了不同型号／年代则 `split`；重复项才 `retire` 并建立永久 redirect。任何歧义都要 fail closed，不能选第一个模糊命中。预检必须显式核对并修正三类已知风险：`Parker 100` 可能被错误挂成 Parker brand alias；裸 `T1` 会碰撞 HongDian T1；裸 `Falcon` 会碰撞 Pilot Elabo／Falcon。所有新 alias 与 lookup 必须 brand-qualified，错误 brand alias 若在当前 copy 存在，要先撤销／迁移并留下可审计 lineage，不能同时属于 brand 与 Parker 100 model。
2. 以 Parker 官方资料、年代目录／广告／档案和可靠钢笔史料分别研究 Parker 25、T1、50 Falcon、100，逐页锁定名称、生产年代、材料、笔尖结构、上墨方式、尺寸重量口径、版本／饰面、停产状态、已知维护风险与二手辨识点。现有 `birthday-pens-a-timeline`、`integral-nibs`、`nibz-n-the-hood` 等 article 只能作为检索 donor／关系入口，不能替代最终核心来源。四款不得彼此借规格；T1／T-1 是否同一官方身份、Parker 50 与欧洲市场 Falcon 命名、100 与早期编号体系都要写清证据和排除边界。
3. 按既有 curated pack 契约写四份完整中文正文与 field-level evidence，使用 phase36 data module 描述 sources、scopes、claims、spec evidence、variants、conflicts、timeline 和 media。wrapper 复用 phase30／34 的 owned-copy authority、slug collision、唯一 `made_by`、reverse link、publication lifecycle、identity lineage 和 redirect 做法，不修改共享 helper，也不直接打开真实 catalog。
4. 只在有精确型号且许可链完整时使用实拍；否则逐款制作内容和构图都不同的原创 factual SVG，标注非实物，并在测试中核对 local path、license、attribution、source scope 与图片不重复。Parker Frontier、Premier、Victory 只能在系列／年代导航中作为 sibling 名称出现，不新增其正文、data pack、媒体或发布动作。
5. Phase 36 test 从 protected snapshot 建 owned copy，迁移并应用 phase28／30／34 前置包，再测试碰撞 fail-closed、四个 action 的现库证据、四页正文模块、逐字段来源、版本边界、媒体精确性、唯一 Parker `made_by`、品牌完整反向集合、旧路由策略、前批 Parker 页面不变和 replay `noop`；finally 关闭 client、清理 owned root 并再次断言 main／WAL／SHM 快照不变。

**Verify**

```bash
pnpm exec tsx --test tests/content/phase36-parker-25-t1-50-falcon-100.test.ts
pnpm biome check scripts/data/phase36-parker-25-t1-50-falcon-100.ts scripts/apply-phase36-parker-25-t1-50-falcon-100-content.ts tests/content/phase36-parker-25-t1-50-falcon-100.test.ts
find public/images/library/site-original/parker-25-t1-50-falcon-100 public/images/library/wikimedia/parker-25-t1-50-falcon-100 public/images/library/licensed/parker-25-t1-50-falcon-100 -type f -name '*.svg' -exec xmllint --noout {} +
```

**Done**

- 当前 owned copy 对每款给出可追溯的 exact identity action，四个 canonical 页面互不合并、各有唯一 Parker `made_by`，品牌页能反向到四款。
- 四页均具备完整来源化正文、版本／年代边界、维护与选购信息及合规媒体；Frontier／Premier／Victory 未被扩写。
- 定向测试与 replay 通过，既有 Parker 51、P0 与 Duofold 页面 publication snapshot 不变，protected catalog 三件套不变。

## Root integration and final verification

1. 逐页人工复核中文正文、引用 scope、identity matrix、别名迁移、图片精确性与“非产品照片”标记；发现来源只覆盖 sibling／family 时必须收窄字段，不能补写推断。
2. 在来源审查通过后运行完整定向 gate：

```bash
pnpm exec tsx --test tests/content/phase36-parker-25-t1-50-falcon-100.test.ts
pnpm exec tsc --noEmit --pretty false
pnpm biome check scripts/data/phase36-parker-25-t1-50-falcon-100.ts scripts/apply-phase36-parker-25-t1-50-falcon-100-content.ts tests/content/phase36-parker-25-t1-50-falcon-100.test.ts
pnpm build
```

3. 在第一次测试前与全部 gate 后用 filesystem snapshot 比较真实 `data/fpkg.db` main／WAL／SHM；不得为验证而 SQLite-open 真实 catalog。任何差异都阻断完成声明。

## Non-goals and hard boundaries

- 不重做 69 品牌／236 型号／305 实体盘点，不运行全量 readiness、全站浏览器验收、AI 验收或生产部署。
- 不新增 runner、Playwright、通用 checkpoint helper、验收框架、migration、搜索或 LLM；不直接或试验性写 `data/fpkg.db`。
- 不处理 Parker Frontier、Premier、Victory 或其他额外 Parker 型号；它们只可作为无正文扩建的 sibling navigation。
- Sailor KOP／系列导航／长刀研与 Pelikan M200／Twist P457 延后为独立 Quick，本批不修改这些文件。
- 不把本批页面完成称为全库完成，也不修改、暂存或提交 `.planning/quick/260719-665-montblanc-writers-edition-patron-of-art-/` 内任何内容。

## Threat model

| Threat ID | STRIDE | Boundary | Severity | Disposition | Mitigation |
|---|---|---|---|---|---|
| T-FCO-01 | Tampering | protected catalog → owned copy | high | mitigate | 只用既有 checkpoint-copy seam；copy 前后 snapshot main／WAL／SHM；所有 SQLite 读写仅在 caller-owned root；alias、journal、并发变化 fail closed。 |
| T-FCO-02 | Spoofing | raw name／slug → canonical identity | high | mitigate | 全库 exact ID／alias／redirect／lineage 碰撞矩阵；禁止名称推断；歧义阻断；retire/reclassify 均有一跳 redirect 与 lineage 测试。 |
| T-FCO-03 | Tampering | 外部来源 → claims／specs | medium | mitigate | 来源 tier、locator、scope 与 field evidence 逐项绑定；family／SKU／年代冲突显式记录，不做跨 scope 外推。 |
| T-FCO-04 | Repudiation | 媒体 → 页面 | medium | mitigate | 保存 source URL、作者、许可、attribution、exact-model scope 与本地 hash；原创图明确非实物，测试阻止近似型号冒充。 |

## Source coverage audit

| Source | Item | Plan coverage | Status |
|---|---|---|---|
| GOAL | Parker 25／T1／50 Falcon／100 | Task 1 | COVERED |
| REQ | Quick task 无 ROADMAP phase requirement IDs | — | N/A |
| RESEARCH | phase28／30／34 curated data、identity／redirect、checkpoint-copy、targeted test patterns | Task 1 | COVERED |
| CONTEXT | 外网可靠来源 → 完整中文正文 → identity／关系 → targeted regression | Task 1 | COVERED |
| CONTEXT | 不扩建 runner／Playwright／AI／readiness／通用验收，不恢复搜索／LLM | Success criteria、Non-goals | COVERED |
| CONTEXT | protected catalog 不可 SQLite-open 或写入，只用 caller-owned copy | Tasks 1–3、Root verification、T-FCO-01 | COVERED |
| CONTEXT | 精确授权媒体；否则原创 factual SVG；全库未完成声明 | Success criteria、Tasks 1–3、Non-goals | COVERED |
| CONTEXT | Frontier／Premier／Victory 不在本批扩写 | Task 1、Non-goals | COVERED |
| CONTEXT | 受保护 Quick 665 不触碰、不暂存、不提交 | Non-goals | COVERED |

## Pre-mortem checks

- **失败点：名称相近导致复用错误 ID。** 防线：每个 task 的第一步是 owned-copy 全库 identity matrix；测试注入 collision 并要求 fail closed。
- **失败点：Parker 家族资料被外推到单一版本。** 防线：每条 spec 绑定版本、市场或年代 scope；无法精确绑定的字段保持未知。
- **失败点：验证过程触碰真实 SQLite sidecar。** 防线：测试只消费 checkpoint copy，before/after filesystem snapshot 是完成硬门，任何差异阻断结果。
