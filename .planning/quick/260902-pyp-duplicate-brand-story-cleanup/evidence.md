# Phase 614 evidence

验证时间：2026-09-02T20:08:32+08:00

## owned checkpoint replay

- 副本来源：受保护的 `data/fpkg.db` 只读快照，经 `copyCheckpointedCatalogToDisposableCopy` 复制到临时 caller-owned 目录；脚本拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN` 和 `FPKG_DATABASE_URL`。
- 回放前确认三组品牌／型号的 `public_entities.body_md` 各有两行，且 `brand_story` 只有一条、品牌和型号的 `made_by`／`reverse` 关系均存在。
- 第一次回放：`entities=3, changed=3, noop=0`；三个品牌均经 fact/language/media 审核和 `publishEntity` 转为 published。
- 回放后：三组品牌故事分别与对应型号故事不同；型号正文、`entity_references`、`entity_links` 未改变；三个品牌均 public、readiness `blocker_count=0`、当前 hash 有 fact/language/media/publication 四类 approved review；全量 `public_entities` 重复 body 组为 0。
- 第二次回放：`entities=3, changed=0, noop=3`；`content_revision` 不再增加。
- 真实库 SHA-256 在测试前后保持 `00ddd2dc6e1a9bde275920eed3d0d82e251be1e7d8b48bb1e27b6619e080d4c4`，真实库快照未改变。

## 定向质量门

- `pnpm exec tsx --test tests/content/phase614-duplicate-brand-story-cleanup.test.ts`：通过（1 test；约 86 秒，含 publication hash 展开）。
- `pnpm exec tsc --noEmit --pretty false`：通过。
- `pnpm exec biome check scripts/apply-phase614-duplicate-brand-story-cleanup.ts tests/content/phase614-duplicate-brand-story-cleanup.test.ts`：通过。
- `git diff --check`：通过。

## 范围边界

本批只清理三组已确认的逐字重复品牌故事，不宣称全量内容目标完成。Turso 当前 rows-read 仍超出 Starter 限额，远端同步、Vercel 动态页面回读、真人全页面遍历和线上复查仍待额度恢复后执行。
