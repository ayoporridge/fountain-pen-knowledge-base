# S.T. Dupont 品牌反向关系修复（Phase278）

## 修复范围

这是身份关系修复，不新增型号，也不改写已经来源化的正文。只处理 S.T. Dupont 品牌 `phase254-brand-st-dupont` 与已公开的 `Line D Eternity`、`D-Initial` 型号之间的双向图关系。

只读审计发现：两支型号都已有唯一的 `made_by → S.T. Dupont`，但品牌页的 `reverse` 只包含 D-Initial，遗漏了 Line D Eternity。这样品牌页不能列出该品牌全部已公开型号，违反品牌反向导航契约。

## 预期终态

- `phase254-st-dupont-line-d-eternity`（`st-dupont-line-d-eternity`）保留现有 pen 身份、正文、来源和公开状态。
- `phase273-st-dupont-initial`（`st-dupont-initial`）保留现有 `made_by` 与 `reverse`。
- 品牌 `phase254-brand-st-dupont` 追加唯一的 `reverse → phase254-st-dupont-line-d-eternity`；不删除任何已有关系，不创建重复型号。
- 在 caller-owned checkpoint copy 中重放为 `noop`，真实库主/WAL/SHM 快照只在正式迁移时改变。

关系依据来自此前已审核的 Phase254 Line D Eternity 与 Phase273 D-Initial 内容包；本批不绕过 publication guard，也不把关系修复冒充成新内容发布。
