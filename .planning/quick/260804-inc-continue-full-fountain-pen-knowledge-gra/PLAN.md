# Phase 486：继续全量内容修复

## 目标

在不新建重复实体的前提下，深化现有 Conklin Glider、BENU Talisman True Unicorn 和 Otto Hutt design07；用官方与可靠二手资料补齐型号身份、版本差异、规格边界、维护和选购信息，并在 owned checkpoint copy 走完整审核—发布回放。

## 执行任务

1. **资料与正文**
   - 为三条既有 canonical 型号写 Phase486 研究正文。
   - 每条正文总长度不少于 3,600，body 不少于 2,800；明确来源、时间窗口、样本边界和原创示意图属性。
2. **内容包与身份关系**
   - 复用 Phase99、Phase59、Phase93 的既有实体包，不创建新品牌或型号。
   - 追加独立来源、事实 claims、spec evidence、variants 和 timeline；校验每条型号恰有一个 `made_by`，补齐品牌到型号的 `reverse` 导航。
3. **审核—发布路径**
   - apply script 拒绝继承 Turso/远程环境。
   - 仅在 Phase486 owned checkpoint copy 中 upsert source、content、reviews，并通过 `recordEntityContentReview` + `publishEntity` 发布；禁止直接写 `data/fpkg.db`。
4. **验证与提交**
   - 定向测试覆盖正文、来源独立性、身份、审核、发布哈希、媒体、关系、重放幂等和真实资料库快照保护。
   - checkpoint 运行完整 library contract、实体质量、SQLite integrity/FK、Biome；记录既有 TypeScript 基线错误。
   - 只暂存 Phase486 自有文件并提交；不触碰其它 research、`.next-phase*` 或受保护 quick 目录。
