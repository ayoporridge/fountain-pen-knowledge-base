# Phase 422 research：Wancher Dream Pen Tsugaru Urushi 三个 SKU 深化

## 目标与实体边界

- 复用 `phase364-wancher-tsugaru-nanako`、`phase364-wancher-tsugaru-raden-midori-age`、`phase364-wancher-tsugaru-shiro-age`，不创建新实体。
- 保留 Wancher 品牌导航实体 `eOfD77nOeENN`，让三个 SKU 继续从品牌页反向可达。
- Dream Pen Tsugaru collection 是导航层；Nanako、Raden Midori-age、Shiro-age 的 exact product page 才是各自名称、材料、供墨、尖和附件的证据层。

## 可靠来源分层

### 商品与导航

1. Wancher Japan Nanako exact page：<https://jp.wancherpen.com/products/nanako-nuri>
2. Wancher Japan Raden Midori-age exact page：<https://jp.wancherpen.com/products/raden-kara-nuri-midori-age>
3. Wancher Japan Shiro-age exact page：<https://jp.wancherpen.com/products/kara-nuri-shiro-age>
4. Wancher Japan Tsugaru collection：<https://jp.wancherpen.com/collections/dream-pen-tsugaru>
5. Wancher global Tsugaru collection：<https://www.wancherpen.com/collections/dream-pen-tsugaru>
6. Wancher Japan Dream Pen collection：<https://jp.wancherpen.com/collections/dream-pen>

### 技法、历史与护理

7. Aomori Lacquerware Federation — About：<https://www.tsugarunuri.org/en/about.html>
8. Aomori Lacquerware Federation — Styles and Care：<https://www.tsugarunuri.org/en/styles.html>
9. Aomori Prefecture — Tsugaru Nuri：<https://www.pref.aomori.lg.jp/soshiki/sangyo/chikikigyo/aomori_dento-kogei_tsugarunuri.html>
10. Aomori official tourism guide：<https://aomori-tourism.com/en/gourmet/detail_9355.html>
11. Aomori Prefecture English process guide：<https://www.pref.aomori.lg.jp/soshiki/kenmin/ch-renkei/files/nuri-eng.pdf>
12. Tokyo Metropolitan Government traditional crafts guide：<https://www.dento-tokyo.metro.tokyo.lg.jp/english/items/66.html>

## 研究结论

- Nanako：exact page 给出 ebonite/urushi、Nanako 菜种圆环、欧洲 C/C、#6 JoWo stainless/Wancher 18K 与 feed 菜单；未给独立尺寸、重量、年份。
- Raden Midori-age：exact page 给出绿色底 Kara-nuri、raden、ebonite/urushi、欧洲 C/C、JoWo stainless/Wancher 18K/Shogun 18K 与 feed 菜单；薄漆与工具痕迹是工艺说明，不是缺陷豁免。
- Shiro-age：exact page 给出白漆底 Kara-nuri、ebonite/urushi、欧洲 C/C、JoWo stainless/Wancher 18K 与 feed 菜单；未给独立尺寸、重量、年份。
- 青森资料可支持津轻涂的青森弘前地域、江户时代背景、1873 年维也纳世界博览会节点、Kara-nuri/Nanako-nuri 技法和漆面护理；不可把公开漆器流程写成 Wancher 每支钢笔的逐支记录。
- 东京传统工艺与青森漆器资料支持避免极端干燥、直射光、骤温、磨蚀和浸泡，出现崩漆、裂纹或失光时交给专业修复方。

## 内容与质量门槛

- 每个 SKU 正文至少 5,500 Unicode 字符，包含身份、可核实字段、版本边界、技法历史、尖/feed、C/C 使用、清洗维护、选购验收、图片用途和未知字段。
- 每个 SKU 11 条来源、11 个独立组、至少 5 个已存在变体、1 个 primary site-original SVG；不人为添加无法从来源支持的尺寸、重量、年份、层数、工匠、贝片数量或限量结论。
- 首次 apply 必须在 owned checkpoint copy；replay 必须 `noop`；四类 review、publication revision/hash 和 contract 3 readiness 读回通过；真实 `data/fpkg.db` SHA-256 不变。
