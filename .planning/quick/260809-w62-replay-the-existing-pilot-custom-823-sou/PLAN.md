# Plan: replay the existing Pilot Custom 823 refresh

## Goal

在不触碰 Turso 和真实 `data/fpkg.db` 的前提下，把已经存在的 Phase 394 Pilot Custom 823 来源化内容包回放到 Phase 554 owned checkpoint，验证旧 duplicate 路由、canonical、品牌关系和发布审核链路。

## Scope

- 复用 `scripts/data/phase394-pilot-custom-823-refresh.ts` 与其既有 apply/test，不创建新实体或重复内容包。
- 仅写入本 quick 的 owned checkpoint；保留 Pilot canonical `oJyaQy9bEc8V`、品牌 `Zt-PbXkE7UHM`，将旧 `xQ-15uqtdMGA` 维持为 retired lineage。
- 记录首次回放、replay noop、当前 content hash、规格、媒体、made_by 和真实库 hash。

## Verification

- existing Phase 394 targeted test
- owned checkpoint CLI first/replay
- `check:library`、`PRAGMA integrity_check` 与只读质量读回
