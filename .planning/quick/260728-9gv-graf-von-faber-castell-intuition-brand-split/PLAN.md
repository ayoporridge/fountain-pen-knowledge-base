# Phase 307 — Graf von Faber-Castell 品牌拆分与 Intuition 内容包

## 目标

- 把现有 `Graf von Faber-Castell Classic` 从普通 `Faber-Castell` 的 `made_by` 关系中纠正出来。
- 新建独立的 `Graf von Faber-Castell` 品牌节点，并让品牌导航连接 Classic 与新 Intuition。
- 按官方与专业资料新增 `Graf von Faber-Castell Intuition` 系列页，区分树脂、Intuition Platino Wood、18K 双色尖与 cartridge/converter 边界。
- 试写只使用 owned checkpoint copy；通过现有 `recordEntityContentReview` / `publishEntity` 审核—发布路径。

## 实施范围

1. 新增品牌、Intuition 内容研究与原创 factual SVG。
2. 在 owned copy 中执行身份预检、拓扑修正、三项内容审核、发布与重放。
3. 删除 Classic 指向普通 Faber-Castell 的旧关系；重分类后重新审核普通 Faber-Castell 品牌，保持其导航及 8 个普通型号公开。
4. 通过本地迁移前备份、fingerprint 锁定和全量内容/媒体/关系检查。

## 验收条件

- Classic 与 Intuition 各只有一个 GvFC `made_by` 目标；普通 Faber-Castell 旧关系为 0。
- 品牌、Classic、Intuition 首次 apply 可发布，重放三项均为 `noop`。
- 新条目有来源化正文、版本、规格证据、维护与选购段落，以及标明非产品照片的原创图。
- 本地公开实体边界、evidence contract、readonly isolation、article、entity quality、media audit 均通过。
- 远端迁移与部署不在本包内；Turso 读权限恢复后另行正式迁移。
