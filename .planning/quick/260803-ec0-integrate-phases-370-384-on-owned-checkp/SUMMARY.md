# Phase 370–384 owned checkpoint integration

## 结果

- 从当前真实 `data/fpkg.db` 建立新 checkpoint：`.planning/quick/260803-ec0-integrate-phases-370-384-on-owned-checkp/checkpoint/fpkg-copy.db`；源快照保存在同目录 `source-snapshot.json`，两者均不提交。
- 按 370、371、372、373、374、375、376、377、378、379、380、381、382、383、384 的顺序重放；全部终端 apply 成功并返回 `published`，没有身份冲突、远程选库或审核门禁绕过。
- 这一批新增 22 个可公开 pen：Sailor 370–382 共 20 个，HongDian N23 1 个，Jinhao 51A 1 个；品牌实体被既有品牌页导航 pack 更新，但没有重复建品牌。

## Checkpoint readback

- `PRAGMA integrity_check`：`ok`。
- 统计：972 entities、119 brands、562 pens、664 published publications、926 public entities；相对真实库 950 entities、904 public，增加 22 个公开型号。
- 批次目标实体：22/22 `published` 且 22/22 出现在 `public_entities`。
- 当前审核：88 条（22 × fact/language/media/publication）均 `approved`；primary media 22；open conflicts 0。历史冲突 2 条均为已解决的 Sailor Hiroshima Momiji material/weight 页面冲突，未形成公开 blocker。
- owned checkpoint 的 `scripts/audit-entity-quality.ts --database-path ...`：681 条品牌／型号 inventory audit rows（659 active、22 retired lineage），duplicate name groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by relationship blockers 0。
- `scripts/check-library-contract.ts --database-path ...`：sources 2,384、sourceItems 4,126、claims 3,674、citations 10,156、stories 709、events 843、media 977、aliases 2,327；`Library contract OK`。
- 真实库 SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；本 quick 没有正式迁移本地库或写入 Turso。

## 核心限制

- 本 quick 只验证 370–384 在 caller-owned copy 的合并结果，不等于全量内容目标完成，也不代表真实资料库或线上站点已经包含这 22 个型号。
- 仍需继续补齐真正缺失的品牌／型号，之后再做全量正式迁移、完整自动检查、真人遍历、部署和线上逐条复查。
