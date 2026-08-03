# Phase 422：Wancher Dream Pen Tsugaru Urushi SKU refresh

## 目标

在不创建重复实体、不写入真实 `data/fpkg.db` 的前提下，深化既有 Wancher Dream Pen 津轻漆的 Nanako Nuri、Raden Kara-nuri Midori-age 与 Kara-nuri Shiro-age 三个 SKU；补足 exact product identity、工艺与历史边界、配置选项、维护、选购、图片用途和兄弟 SKU 身份关系。

## 执行与验证

1. 以 Wancher Japan exact product pages、Wancher global/Japan collections 为商品依据，结合青森县、青森漆器组织、青森官方旅游与东京传统工艺资料交叉解释津轻涂历史、技法和护理。
2. 复用现有 Wancher 品牌与三个 `phase364` 实体，只在 owned checkpoint copy 通过 `recordEntityContentReview` + `publishEntity` 路径应用更新。
3. 验证三 SKU 的自然中文正文、11 条来源/11 个独立组、变体、primary SVG、规格证据、品牌关系、四类审核、publication、readiness、replay noop 和 SQLite integrity。
4. 记录真实库快照，确保试验前后 SHA-256 不变。

## 回归门槛

- 三个 SKU 正文 ≥ 5,500 Unicode 字符；来源 ≥ 11、独立组 ≥ 11、primary media = 1。
- Nanako、Raden、Shiro-age 的工艺、材料与尖/feed 配置保持 SKU 边界，不跨商品继承尺寸、重量、年份或图片。
- `entity_publications.status = published`；content/reviewed revision 对齐；fact/language/media/publication 当前 hash 全部 approved；readiness blocker_count = 0。
