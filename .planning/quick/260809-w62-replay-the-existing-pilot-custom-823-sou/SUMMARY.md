# Summary: replay existing Pilot Custom 823 refresh

## Status

已完成在 Phase 554 owned checkpoint 上的离线回放。只复用既有 Phase 394 内容包，不创建新实体；真实 `data/fpkg.db` 与 Turso 不触碰。

## Evidence

- `evidence/first-run.json`: Pilot brand `Zt-PbXkE7UHM` 与 canonical `oJyaQy9bEc8V` 均 `published`。
- `evidence/replay.json`: 两个实体均 `noop`；canonical hash 为 `sha256:v3:9e3e65107850899da8e7c36d48cf5bf15f00adc303a849cec34913b0fca8ff2d`。
- `evidence/readback.txt`: canonical body 8,094 字符、revision 872/872、contract 3；duplicate `xQ-15uqtdMGA` 保持 retired 且不在 `public_entities`；旧路由永久跳转到 `/pen/pilot-custom-823`；12 个 market SKU / 12 个 distinct product codes、9 个 approved spec-field evidence、8 个 approved references、1 个 approved primary media、唯一 `made_by=Zt-PbXkE7UHM`、当前四项审核均 approved、`PRAGMA integrity_check=ok`；真实库 hash 保持 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。
- `evidence/quality-summary.txt`: 804 entities / 781 active / 23 retired lineage；active duplicate、suspicious、thin 与 `made_by` blocker 均为 0。
- `evidence/coverage-summary.txt`: 119 brands（115 ready、4 gap）与 685 models（666 ready、16 gap）；gap 是已退休 lineage 或待处理身份记录，不把退休 donor 重新公开。
- `evidence/readiness-summary.json`: owned disposable migrated copy 的 readiness 结果为 781 content-ready/public、23 backlog、published/public blockers 0；`inventory_complete=true`、`public_clean=true`、`content_complete=false`、`complete=false`。
- `check:library` passed：Library contract OK。

## Verification

- Existing `pnpm exec tsx --test tests/content/phase394-pilot-custom-823-refresh.test.ts` passed。
- `audit-entity-quality.ts` passed；`audit-library-coverage.ts` returned the explicit retired-lineage gaps above；`audit-readiness-v2.ts` correctly returned exit 1 because the locked inventory still has 23 retired lineage backlog records, while public blockers remain 0。
- This replay proves existing sourced packages can be integrated and audited offline while preserving canonical identity and retired duplicate lineage; formal migration, Turso readback, deployment and online review remain pending。
