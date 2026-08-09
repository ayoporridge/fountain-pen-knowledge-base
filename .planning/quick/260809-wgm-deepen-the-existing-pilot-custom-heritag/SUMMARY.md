# Summary: deepen the existing Pilot Custom Heritage 91 canonical

## Status

已在 Phase 555 owned checkpoint 的副本上完成 Phase 556 离线深度刷新。只更新既有 pen `NpJibLHczSl9` / `pilot-custom-heritage-91`，没有创建新的 Pilot 或 Heritage 实体；真实 `data/fpkg.db` 与 Turso 未触碰。

## Content

- `.planning/content-research/pilot-custom-heritage-91-phase556.md`: 正文 body 5,332 Unicode 字符，补齐 FKVHN-12SR／BF SKU、14K No.5 九种笔种、树脂与铑色件、CON-40／CON-70N、历史 FKVH-1MR 代码边界、91/92/912/74/823/Elite 分型、维护、验货与选购。
- `scripts/data/phase556-pilot-custom-heritage-91-depth.ts`: 基于既有 Phase 108 canonical pack 增加 7 个来源、8 个 claims、1 个当前 scope、20 个 approved spec-field evidence；主图继续复用既有明确标注“非产品照片”的原创 SVG。
- `scripts/apply-phase556-pilot-custom-heritage-91-depth.ts`: 只接受 caller-owned migrated copy；共享 pack contract 所需的 Pilot 品牌包来自既有 Phase 425 canonical，修正其已过时的 source marker，但不创建品牌实体。
- `tests/content/phase556-pilot-custom-heritage-91-depth.test.ts`: 覆盖 remote-env fail-closed、首次发布、四类 current-hash review、唯一 `made_by`、证据图、重放 noop、Pilot 品牌正文保留与真实 catalog 快照不变。

## Evidence

- `evidence/first-run-v2.json`: Pilot brand `Zt-PbXkE7UHM` 与 Heritage 91 `NpJibLHczSl9` 均 `published`；Heritage 91 hash 为 `sha256:v3:130f0b6dd34479c3abf023ef0cd7ec2235585b7bd5465f457f59fe12058f2919`。
- `evidence/replay-v2.json`: 两个实体均 `noop`，hash 不变。
- `evidence/readback-v2.txt`: Heritage 91 body 5,332 字符、revision 233/233、contract 3、`publishable=1`、`blocker_count=0`、public；四项审核均对 current hash approved；唯一 `made_by=Zt-PbXkE7UHM`；1 个 variant／product code `FKVHN-12SR`、14 个 approved references、12 个 approved claims、20 个 approved spec-field evidence、1 个 approved primary media；`PRAGMA integrity_check=ok`。Pilot 品牌仍为已有 `pilot` 实体，body 2,917 字符，source marker 更新为 Phase 425 canonical。
- `evidence/quality-summary.txt`: 804 entities / 781 active / 23 retired lineage；active duplicate、suspicious、thin 与 `made_by` blockers 均为 0。
- `evidence/coverage-summary.txt`: 119 brands（115 ready、4 gap）与 685 models（666 ready、16 gap）；gap 仍是锁定库存中的退休 lineage，不把 donor 重新公开。
- `evidence/readiness-summary.json`: owned disposable migrated copy 为 781 content-ready/public、23 backlog、published/public blockers 0；`inventory_complete=true`、`public_clean=true`、`content_complete=false`、`complete=false`。

## Verification

- `pnpm exec tsx --test tests/content/phase556-pilot-custom-heritage-91-depth.test.ts` — PASS。
- `pnpm run check:library -- --database-path .../catalog-phase556-v2.db` — Library contract OK。
- `audit-entity-quality.ts` — PASS：duplicate、suspicious、thin、made_by blockers 均 0。
- `audit-library-coverage.ts` — 明确记录 115/119 brands、666/685 models ready 与退休 lineage gaps。
- `audit-readiness-v2.ts` — 正确以 exit 1 返回：锁定 inventory 仍有 23 条退休 lineage backlog；public blockers 0，不能把此 checkpoint 标为全量 complete。
- 真实库 SHA-256 仍为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。

## Remaining boundary

这是可迁移的离线内容批次，不是全量 goal 完成。Pilot 其它低深度型号、Wancher 具体 SKU、其它品牌新增/深化、正式迁移真实库、Turso 远端读回、生产部署和线上真人遍历仍未完成；在这些证据齐全前不得调用 `update_goal({status:"complete"})`。
