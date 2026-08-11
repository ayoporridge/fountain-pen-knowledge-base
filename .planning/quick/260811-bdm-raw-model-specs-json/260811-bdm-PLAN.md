---
quick_id: 260811-bdm
status: complete
scope: direct-content-repair
---

# 清除公开正文 raw model_specs JSON 并友好显示站内原创许可

## 边界

- 只修全站遍历已证实的两个前台问题，不扩建通用 audit、runner 或 Playwright。
- 数据修复只能在 caller-owned checkpoint copy 试跑；真实 `data/fpkg.db` 只做哈希不变性校验。
- 正文更新后必须重新完成 fact、language、media 三项 review，并由 `publishEntity` 恢复发布；不得绕过 publication gate。
- 保留结构化 `model_specs` 表、正文其它段落和后续 H2；只移除 `## model_specs` 与紧随其后的 fenced JSON 块。

## Task 1：确定性正文清理器与 publication gate

- **files:** `scripts/apply-phase583-public-story-residue-cleanup.ts`、`tests/content/phase583-public-story-residue-cleanup.test.ts`
- **action:** 实现可重放的 Phase 583 cleanup，对 195 个当前公开实体的 raw 规格块做精确删除；拒绝 malformed block、远端环境、真实库、symlink／hardlink，并逐实体重新审核发布。
- **verify:** 在 owned copy 中首跑 195 条 changed、二跑 0 条；180 个型号结构化规格数不变，15 个品牌不新增规格；公开实体数不变、published blocker 为 0、真实库 SHA-256 不变。
- **done:** 所有当前公开 story 均不再包含 `## model_specs`，且仍在 `public_entities`。

## Task 2：媒体许可读者化

- **files:** `src/components/library/EncyclopediaShell.tsx`、`tests/renderer/components.test.tsx`
- **action:** 复用既有 `MEDIA_LICENSE_LABELS`，把 `site-original` 前台显示为“站内原创”，未知许可仍保持原值。
- **verify:** server renderer test 明确断言出现“许可：站内原创”且不出现“许可：site-original”。
- **done:** 站内原创媒体的内部 license slug 不再直接暴露给读者。

## Task 3：最新 canonical checkpoint 与全站复查

- **files:** 本 quick 的 `evidence/`、`260811-bdm-SUMMARY.md`
- **action:** 在 Phase 582 最新 checkpoint 的新 owned copy 应用 Phase 583，重跑定向测试、TypeScript、Biome、readiness/quality/library/data contracts、production build、article-quality 和 1,071 路由复查。
- **verify:** raw 规格残留为 0，正文中不再出现读者态 `许可：site-original`，所有公开页可达；任何真实失败转入下一个定向内容包。
- **done:** 形成正式迁移前可重放的离线修复包，但不把该包或单次遍历当作全量 goal 完成。

## 执行结论

三项任务均已完成。最终候选为 Phase 559–566、578、579、581 与 Phase 583 的可重放离线栈；公开 raw 规格块和 raw `site-original` 许可显示均为 0。真实库与 Turso 未写入，全量 goal 继续保持 active。
