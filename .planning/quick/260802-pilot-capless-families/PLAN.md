# Phase 367：Pilot Capless 絣、Stripe、SE 与特殊合金

## 目标

补齐 Pilot 官方目录中尚未独立来源化的四条 Capless SKU 路线：絣 `FCN-2MR`、Stripe `FC-3MS`、Capless SE `FCSE-3MR` 与特殊合金 `FCS-1`。它们与普通 18K Capless 共用按动结构背景，但工艺、尖材、颜色代码和价格边界不同，必须分别建模。

## 明确边界

- 只处理上述四个独立公开路线与 Pilot 品牌导航；不重复创建已有普通 Capless、Decimo、LS、Fermo、Custom 或 URUSHI 实体。
- 颜色、线宽和日本型号代码留在各自 `model_variants`，不把颜色当成新品牌或新系列节点。
- 所有试写只使用本目录 `checkpoint/fpkg-copy-source.db`；`data/fpkg.db` 只作受保护快照，未被写入。
- 不直接写 `entity_publications`；通过 `recordEntityContentReview` 与 `publishEntity` 所在的 `applyCuratedContentPacks` 发布路径。

## 验证

1. 官方 exact page、支持清单、Capless 护理页、价目表和独立评测形成分组来源。
2. 每页正文包含身份、工艺／材质、尖号、供墨、规格、版本差异、维护、选购和示意图边界；正文不把内部字段名写给读者。
3. 定向测试验证 owned copy、远程环境拒绝、四类 review、variants、spec evidence、references、primary media、maker／reverse 关系和 replay `noop`。
