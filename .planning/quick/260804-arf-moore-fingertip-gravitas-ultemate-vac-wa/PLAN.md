# Phase 465：深化 Moore Fingertip、Gravitas Ultemate Vac 与 Waterman C/F

## 目标

在 Phase 464 owned checkpoint copy 上继续深化三条已存在的 canonical 型号页。补足自然中文的身份、规格条件、历史／地区或材料版本、上墨维护、试写边界和选购建议；复用现有实体、来源登记和原创示意图，不创建颜色、地区或样本重复实体。

## 交付

- 更新 Moore Fingertip、Gravitas Ultemate Vac、Waterman C/F 的研究文件。
- 以 `CuratedEntityPack` 追加来源化 claims、scope 与 timeline，修复必要的来源映射。
- 通过 `recordEntityContentReview` 的 fact/language/media 审核和 `publishEntity` 发布路径。
- 仅在本目录 owned checkpoint 上执行定向测试、完整性、library/readiness/quality 审计、类型与 diff 检查。

## 验收

1. 三个 id/slug 精确命中已有 canonical entity；每个型号恰好一条 `made_by` 与一条品牌反向导航。
2. 正文、来源独立组、approved references、primary media、审核 hash 与 publish 状态达到定向测试门槛。
3. 重放返回 `noop`，owned copy 通过 SQLite 与 library contract，真实 `data/fpkg.db` 快照不变。
4. 不修改本批以外的 research、`.next-phase*` 或其他 quick 目录。
