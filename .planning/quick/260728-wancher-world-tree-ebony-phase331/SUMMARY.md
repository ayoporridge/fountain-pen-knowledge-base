---
name: Wancher World Tree Ebony phase 331
completed: 2026-07-28
status: complete
---

# 结果

- 新增 Wancher World Tree – Ebony 具体 SKU 内容包：天然乌木、可拆 925 银夹、国际墨胆/转换器、尖材与 feed 选项、系列尺寸重量、维护和版本边界。
- 复用既有 Wancher 品牌实体与品牌内容包；没有新建重复品牌或把 World Tree 系列误写成单一统一规格。
- 使用 Wancher 官方商品/系列页、Sekai/Sekai Ai 边界页、Appelboom 专业零售交叉资料和本站原创 factual SVG；SVG 明确标注非产品照片、非 Logo、非比例图、非颜色校样。
- 发布脚本只允许 owned checkpoint copy，拒绝远程环境、真实资料库、符号链接和硬链接别名；身份、made_by、品牌反向导航和 032 migration 均有守门检查。

# 验证

- `pnpm exec tsx --test tests/content/phase331-wancher-world-tree-ebony.test.ts`：通过。
- 定向测试验证内容长度、来源独立组、professional secondary、审核发布、规格、媒体、身份关系、回放幂等以及真实 `data/fpkg.db` 快照未改变。
- `pnpm exec tsc --noEmit --pretty false`：通过。
- 后续提交前仍需执行 Biome 定向检查与 `git diff --check`，并只暂存本 Phase 文件。

# 迁移边界

本 Phase 没有写入真实 `data/fpkg.db`，也没有声明线上已部署；正式迁移、全量审计、真人遍历、部署和线上复查仍属于总 goal 的后续工作。
