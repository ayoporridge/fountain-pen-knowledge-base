---
quick_id: 260812-tvl
status: complete
phase_number: 603
scope: retired-nib-recovery
source_checkpoint: .planning/quick/260812-tt1-split-donor-navigation/checkpoint-final/catalog.db
---

# Phase 603 Plan：恢复 Sailor Naginata-Togi nib 条目

## Goal

依据 Sailor 官方工匠访谈、10-7121 产品页、Bespoke 与 KOP 产品证据，将 retired `sailor-naginata-togi` 恢复为独立 nib 条目。明确它是跨笔身出现的 Special Nib／研磨体系，不与 10-7121 整笔、KOP 限量笔或第三方 Naginata-style grind 合并。

## Safety and verification

- 只写 Phase 602 caller-owned checkpoint；不写真实库、不访问 Turso。
- 写自然中文正文、来源、历史、角度线宽、现行 F／MF／M／B、使用维护和选购边界，并制作独立 1600×900 事实示意图。
- 复用既有 nib ID／slug，不新建重复实体；10-7121 published pen digest 保持不变。
- 用 `recordEntityContentReview` 与 `publishEntity` 完成 fact/language/media 审核，不直接改 publication status。
- 覆盖 identity／slug／alias collision、remote selectors fail-closed、首次 publish、replay no-op、nib ↔ 10-7121 关系、source/real family 不变。
- 定向回归、TypeScript、Biome、xmllint、SQLite integrity/FK、媒体与页面 readback 后精确提交。
