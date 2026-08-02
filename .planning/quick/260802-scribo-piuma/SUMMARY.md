# Phase 354 摘要

本包补入 SCRIBO Piuma，并更新 SCRIBO 品牌导航。Piuma 以官方 Utopia 页为规格锚点：天然树脂、国际卡水／转换器、144.5 mm、最大径 15.60 mm、30 g、18K 标准尖或 14K Extra-Flexible 尖、ebonite feed；FEEL 的 piston 规格不混入。颜色是 collection 内 variants，Urushi 与后续特别版不冒充基础树脂款。

## 回放记录

- 定向测试、TypeScript 与 Biome 通过。
- checkpoint source main SHA-256：`526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`；`protected.db` 与真实资料库一致。
- 第一次回放：SCRIBO 品牌与 `phase354-scribo-piuma` 均 `published`；型号内容 hash `sha256:v3:8067cfeda60a542a2aa0aeab4f5a8a032ffeff0b8161cc0d30d0e913149e0dfd`。
- 第二次回放：品牌与型号均 `noop`，hash 不变。
- SQL 证据：型号 revision 74；fact/language/media/publication 四项 review 均 `approved`；`made_by` 与品牌 `reverse` 各 1；source groups 为 primary 1 / professional secondary 1 / auxiliary 0；4 个 variants；10 项 approved spec evidence；1 个 approved primary media，qualified primary media 1；品牌正文已包含 Piuma 导航。
- 全部写入发生在 `.planning/quick/260802-scribo-piuma/checkpoint/fpkg-copy.db`；真实 `data/fpkg.db` SHA-256 仍为 `526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`。
