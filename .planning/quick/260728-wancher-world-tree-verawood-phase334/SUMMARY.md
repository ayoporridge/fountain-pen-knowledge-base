---
name: Wancher World Tree Verawood phase 334
completed: 2026-07-28
status: complete
---

# 结果

- 新增 Wancher World Tree – Verawood 具体 SKU 内容包：天然 Verawood、自然色差、可拆 925 银夹、国际墨胆/转换器、尖材与 feed、包装、维护和版本边界。
- 复用既有 Wancher 品牌实体；没有把 Ebony、Teak、Sekai Ai、Dream Pen 或 Urushi 的材质和图片结论合并到 Verawood。
- 使用 Wancher 官方商品/集合页、同品牌 Ebony 边界页、Appelboom 专业零售家族交叉资料和本站原创 factual SVG；SVG 明确标注非产品照片、非 Logo、非比例图、非颜色校样。
- 发布脚本只允许 owned checkpoint copy，拒绝远程环境、真实资料库、符号链接和硬链接别名；身份、made_by、品牌反向导航和 032 migration 均有守门检查。

# 验证

- `pnpm exec tsx --test tests/content/phase334-wancher-world-tree-verawood.test.ts`：通过。
- 定向测试验证内容长度、来源独立组、professional secondary、审核发布、Verawood 规格、媒体、身份关系、回放幂等以及真实 `data/fpkg.db` 快照未改变。
- `pnpm exec tsc --noEmit --pretty false`：通过；提交前复核 Biome 与 `git diff --check`。

# 迁移边界

本 Phase 没有写入真实 `data/fpkg.db`，也没有声明线上已部署；正式迁移、全量审计、真人遍历、部署和线上复查仍属于总 goal 的后续工作。
