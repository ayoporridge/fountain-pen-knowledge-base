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

同轮继续验证：

| 包 | 结果 |
| --- | --- |
| Phase 62 Sheaffer P0 | passed |
| Phase 76 Sailor Professional Gear | passed |
| Phase 83 Diplomat/Leonardo、Waterman current | passed |
| Phase 84 Platinum/Pilot P0 v3 | 初次发现品牌拓扑后的 replay bug；修复并复测 passed，7 个型号首次 published、replay 全 noop |
| Phase 108 Pilot Custom Heritage 91/92 | passed |
| Phase 109 Pilot Cavalier/Prera/Kakuno/Cocoon | passed |
| Phase 110 Pilot Justus 95、Silver、Grance | passed（含 collision/authority 负例） |
| Phase 111 Pilot Elabo Metal/Resin、Custom NS、Lightive | passed（含 collision/authority 负例） |

这些包使用原有 canonical IDs，不重复建实体。真实 `data/fpkg.db` 仍保持未迁移状态。
