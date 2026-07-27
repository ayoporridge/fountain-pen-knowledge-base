# Phase 309 — Sheaffer 独立媒体分离

## 目标

将 Sheaffer Connaisseur、Imperial、ICON 9108 从同一张三栏合成 factual SVG 拆成三个独立、可追溯的站内示意图，保持正文、型号身份和公开路由不变。

## 实施

1. 新增三个非照片、非比例、非颜色校样 SVG。
2. 在 owned checkpoint copy 更新 `media_assets`、`source_items`、媒体引用与 publication owner 映射。
3. 通过 `recordEntityContentReview` 的 fact/language/media 审核和 `publishEntity` 发布，不直接改写 published 状态。
4. 回归检查三条媒体路径唯一、正文哈希内容不变、重放为 noop、真实数据库快照不变。
