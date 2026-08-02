# Phase 357 — Visconti Opera Master Savanna

## 目标

把当前资料库中缺失的 Visconti Opera Master Savanna 建成独立 `pen` 条目，并把品牌页导航、`made_by`／反向关系、来源、规格、版本与原创事实图一次接齐。

## 不做什么

- 不重复建立已有的 Homo Sapiens、Rembrandt、Van Gogh、Opera Master Polynesia 或普通 Opera。
- 不把滚珠笔 SKU 当成钢笔实体，也不把 catalogue 的价格／库存写成当前事实。
- 不写入真实 `data/fpkg.db`，不连接 Turso，不改搜索、LLM 或通用验收基础设施。

## 验收

1. 官方 Savanna 页面、2023 catalogue、专业零售页和品牌资料形成可追溯 source set。
2. 正文自然中文不少于 3,000 字，覆盖身份、材料、规格、历史、版本、上墨、维护、选购与图片边界。
3. checkpoint copy 首次 replay 为 `published`，第二次为 `noop`。
4. `made_by` 与品牌反向链接各一条；六个版本记录、十个规格证据和主媒体落库。
5. 真实 catalog 的 checksum 前后不变；定向 test、TypeScript、Biome 与 diff check 通过。
