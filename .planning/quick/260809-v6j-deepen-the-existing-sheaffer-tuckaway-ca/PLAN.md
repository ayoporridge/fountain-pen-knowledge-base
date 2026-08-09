# Plan: deepen the existing Sheaffer Tuckaway canonical

## Goal

在不连接 Turso、且不写入 `data/fpkg.db` 的前提下，补齐已有 `Sheaffer Tuckaway` canonical 的历史、版本、识别、维护与选购内容，并让品牌关系、审核—发布链路和回放幂等性可在 owned checkpoint copy 复核。

## Tasks

1. 以现有 Phase 62 Tuckaway 实体为基底，叠加 Phase 553 的来源、scope、claims、variants、spec evidence 与自然中文正文；使用 Phase 446 的 Sheaffer 品牌导航 pack，不创建重复实体。
2. 增加只接受 owned catalog copy 的 wrapper 与定向测试，验证远端环境拒绝、发布门、当前四项 review、made_by、来源/规格/媒体证据、完整性与二次回放 noop。
3. 在最新本地 checkpoint 上回放并运行定向测试、TypeScript、Biome、diff 检查；记录 readiness/quality 与真实数据库未变化证据。
4. 只提交本包拥有的 research、script、data、test 和 quick 证据文件；保护其它 agent 的未跟踪研究与 `.planning/quick/260719-665-montblanc-writers-edition-patron-of-art-/`。

## Constraints

- Turso 暂停使用；所有数据库试验只在 caller-owned checkpoint copy。
- 不修改通用验收/Playwright/AI 基础设施，不改变退休 donor backlog 政策。
- Tuckaway 的杠杆、Vacuum-Fil、Triumph、Touchdown、帽夹、材料和尺寸只在有来源的版本范围内表述；样本估计不提升为全族固定规格。

## Verification

- Phase 553 test: first publish, review/hash/readback, replay noop, protected real DB unchanged.
- `pnpm exec tsc --noEmit`, targeted Biome, `git diff --check`.
- checkpoint-local library/publication/evidence/readiness checks where practical.
