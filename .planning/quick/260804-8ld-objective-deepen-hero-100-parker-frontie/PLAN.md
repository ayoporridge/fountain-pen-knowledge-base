---
phase: 457
quick_id: 260804-8ld
status: complete
---

# Phase 457：深化 Hero 100、Parker Frontier 与 Eversharp Doric

## 目标

在 Phase 456 的 owned checkpoint copy 上，复用已有来源化 `CuratedEntityPack`，补齐三个低信息量但身份已稳定的历史／日用型号：Hero 100、Parker Frontier、Eversharp Doric。只更新正文与追加来源化 claims/timeline，通过既有审核—发布链路，不创建重复实体，不写真实 `data/fpkg.db`。

## 验收

- 三个 canonical id/slug 不变，均保持唯一 `made_by` 与品牌反向导航。
- 三份正文自然中文总长度至少 3500，公开 body 至少 2600，并明确规格、历史、版本差异、维护和选购边界。
- 每个型号至少四条 approved references、一个 primary media，fact/language/media/publication 四项审核通过。
- checkpoint `PRAGMA integrity_check`、library contract、定向 test、TypeScript baseline、Biome、diff check 全部通过；真实数据库快照 SHA-256 不变。

## 不做

- 不迁移真实数据库、不调用远端 Turso、不改搜索或 LLM、不扩建通用验收设施。
- 不删除或暂存其他 research、`.next-phase*`、既有 quick checkpoint 或 Montblanc quick 目录。
