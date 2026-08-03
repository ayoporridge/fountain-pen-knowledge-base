# Phase 464：深化 Montegrappa Elmo 02、Asvine V200 与 Sailor King Profit ST

## 目标

在 Phase 463 owned checkpoint copy 上继续修复三条公开但正文偏短的 canonical 型号页。补足自然中文的身份边界、规格证据、版本／地区差异、上墨维护与选购建议，严格复用既有实体、品牌关系和媒体，不把相邻型号或单支样本合并。

## 交付

- 更新 Elmo 02、V200、King Profit ST 研究文件，明确官方规格与独立样本边界。
- 以 `CuratedEntityPack` 追加来源化 claims、scope 和 timeline，沿用现有 source registry。
- 通过 `recordEntityContentReview` 的 fact/language/media 审核和 `publishEntity` 发布。
- 仅在本目录 owned checkpoint 上执行定向测试、完整性、library/readiness/quality 审计、类型与 diff 检查。

## 验收

1. 三个 id/slug 精确命中既有 canonical entity；每个型号恰好一条 `made_by` 与一条品牌反向导航。
2. 正文、来源独立组、approved references、primary media、审核 hash 与 publish 状态达到定向测试门槛。
3. 重放返回 `noop`，owned copy 通过 SQLite 与 library contract，真实 `data/fpkg.db` 快照不变。
4. 不修改本批以外的 research、`.next-phase*` 或其他 quick 目录。
