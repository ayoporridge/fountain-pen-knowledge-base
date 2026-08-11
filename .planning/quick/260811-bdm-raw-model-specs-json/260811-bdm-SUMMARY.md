---
status: complete
quick_id: 260811-bdm
scope: direct-content-repair
---

# 清除公开正文 raw model_specs JSON 并友好显示站内原创许可

本 quick 修复了上一轮全站遍历确认的两个真实前台问题，但不把本批次视为全量 goal 完成。

## 已完成

- 在 caller-owned checkpoint copy 上精确清除了 195 个当时公开实体的 `## model_specs` fenced JSON：180 个型号、15 个品牌。清理器只接受可解析 JSON，保留前后正文与结构化 `model_specs` 表。
- 每个被修改实体均重新记录 fact、language、media 三项 current-content review，并通过 `publishEntity` 恢复发布；未直接修改 publication 状态。
- 把 Phase 559–566、578、579、581 叠加到同一候选后，发现其中 6 个当前内容包会再次带入 raw JSON；Phase 583 随即清理并重新审核发布，最终重放为 0 条变更。
- 前台复用 `MEDIA_LICENSE_LABELS`，把内部许可值 `site-original` 显示为“站内原创”；CC 与 Public Domain 等既有许可仍按各自标签显示。

## 离线候选与验收

- 候选 SHA-256：`5006a8c3dfbbb2f3fcf6037ab80e2d37aad0535b05a65eea0b9347c969153a61`。
- 真实 `data/fpkg.db` SHA-256 始终为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`，没有真实库写入，也没有 Turso 请求。
- readiness：809 个品牌／型号库存进入审计；785 个当前公开实体全部 ready，公开阻断 0；24 个 retired lineage 保留且不重新发布。
- quality：重复名称组 0、article-like pen 0、薄内容实体 0、`made_by` 阻断 0。
- media：801/801 健康；Library contract 与 data contract 均通过；SQLite integrity 为 `ok`。
- production build 通过，255 篇公开 article 的定向契约 2/2 通过；785 个公开品牌／型号页全部实际返回并检查，状态、唯一 H1、canonical、raw `model_specs` 标题和 `许可：site-original` 失败均为 0。
- 页面检查中的两个 `model_specs` 命中是正常正文内联提及，不是标题或 JSON 块；13 个未显示“站内原创”的页面使用合法 CC／Public Domain 图片，不属于漏修。

完整数字见 `evidence/offline-verification.json`、readiness summary 与媒体报告。上一轮 Phase 582 已检查且本次没有改变的 1,636 个额外内链和 790 个本地图片变体不做第二次昂贵渲染；本轮重新跑了所有发生变化的品牌／型号页面、全部公开 article 和 801 项当前媒体审计。

## 仍未完成

Turso 不可用期间仍不能完成真实库正式迁移、远端迁移与回读、生产部署、真人全页面遍历和线上逐条复查。本 quick 的 `status: complete` 只代表这一项定向修复有离线证据，不代表全量 goal 完成。
