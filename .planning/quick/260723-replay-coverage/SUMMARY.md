# Replay coverage summary

截至 2026-07-23，以下既有内容包已在 caller-owned checkpoint copy 复跑通过：

| 包 | 结果 |
| --- | --- |
| Phase 60 Pilot Custom/Elite P0 | 6 个实体首次 published，重放 noop；旧 slug redirect 与 maker 关系通过 |
| Phase 128 Wancher Urushi SKUs | passed |
| Phase 129 Wancher Tokiwa/Bokashi | passed |
| Phase 130 Pilot Capless Fermo | passed |
| Phase 134 Wancher True Ebonite Silk Black | passed |
| Phase 135 Wancher True Ebonite Marble Green | passed |

这些包使用原有 canonical IDs，不重复建实体。真实 `data/fpkg.db` 仍保持未迁移状态。
