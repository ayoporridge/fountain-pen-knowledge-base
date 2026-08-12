---
quick_id: 260812-nxs
status: in_progress
phase_number: 599
scope: direct-content-repair
source_checkpoint: .planning/quick/260811-tzr-ikkaku-by-nahvalur-phase-597-owned-check/checkpoint/catalog.db
---

# Phase 599 Plan：BENU 当前与重要历史系列收口

## Goal

基于 BENU 官方目录、官方产品／兼容性资料与可靠钢笔资料站，刷新 BENU 品牌页并补齐当前目录中缺失的 Minima、Pixie、AstroGem、Tessera、Haute、Tribute、Cocktail Hour，以及重要历史系列 Scepter、Grand Scepter。保持现有 Briolette、Euphoria、Talisman 与 True Unicorn canonical identity，不重复建实体。

Hidden Gems 与 BENU Exclusive 先按商店聚合／渠道集合处理；Euphoria Autograph 按 Euphoria 的个性化版本范围处理。除非来源证明存在独立产品身份，不把这些导航标签误建为新型号。

## Safety boundary

- 所有首次写入、失败路径与 replay 只写 Phase 598 checkpoint 的 caller-owned copy。
- 不打开或写入真实 `data/fpkg.db`，不访问 Turso；所有 remote selector 显式清空并在 wrapper 中 fail closed。
- 不扩建通用 runner、Playwright、AI 或 readiness 基础设施，只增加 Phase 599 定向回归。
- 不修改、删除或提交任何既有未跟踪 research、`.next-phase*`、其他 quick checkpoint/evidence，尤其保护 `260719-665-montblanc-writers-edition-patron-of-art-`。

## Tasks and verification

1. **Identity and research**
   - 核实九个家族的官方名称、当前／历史状态、供墨、笔尖、尺寸／形态与系列边界。
   - 为导航集合、拼写差异和版本冲突保存 rejected/conflict evidence。
   - verify：每篇研究稿列出官方主来源与至少一个适用的可靠二级来源，事实不越过来源范围。

2. **Content and media**
   - 写九篇自然中文型号正文与一篇 BENU 品牌刷新正文，覆盖介绍、规格、历史／版本、使用维护和选购建议。
   - 为新增家族制作九张独立 1600×900 本站原创事实示意图，明确非产品照片。
   - verify：正文合同、链接、SVG 尺寸、可访问性、`xmllint` 与媒体 hash uniqueness 全部通过。

3. **Curated pack and publication path**
   - 复用 `CuratedEntityPack`、`recordEntityContentReview` 与 `publishEntity`，建立唯一 `made_by BENU` 和正确的系列／版本关系。
   - wrapper 对实体 ID、slug、名称、alias collision 与 remote selectors fail closed。
   - verify：first apply 只新增／刷新计划内实体，九个家族发布；完整 replay 全部 `noop`，既有 BENU 实体 digest 不变。

4. **Offline acceptance**
   - 在持久 owned checkpoint 上执行首次 apply、完整 replay、SQLite integrity/FK、entity quality、library/media audit、TypeScript、Biome、生产构建和品牌／九型号 URL readback。
   - verify：公开 blocker、thin、duplicate、broken relationship、媒体失败、primary-path duplicate 均为 0；页面和媒体 HTTP 200，品牌页链接全部新增家族。

5. **Atomic handoff**
   - 提交前重新检查 `git status --short`，只暂存 Phase 599 明确 owned 实现文件；checkpoint/evidence 保持不提交。
   - 写 quick SUMMARY，明确本批不等于 full-corpus goal 完成，并继续下一个外部覆盖差集。

