# Quick Task Plan

## Objective

为真实数据库中尚未覆盖的 Wancher Hirota Byobu-e – Ume ni Hanasui 建立来源化内容包，区分 Hirota Byobu-e 编辑者系列与具体的一件梅花主题型号，补齐 24K 金箔、Urushi、Maki-e、Shogun 18K 与欧规墨囊/转换器等边界；只在 owned checkpoint copy 验证。

## Scope

- 新增一个 `pen` 型号，复用既有 Wancher 品牌，不创建重复的 Hirota 或 Byobu-e 品牌实体。
- 使用 Wancher 官方具体商品页、Hirota 系列页与工匠页，辅以大都会艺术博物馆的 Byobu 历史资料、京都国立博物馆的 Urushi 保存资料交叉核对。
- 写自然中文正文，覆盖艺术主题、历史语境、规格、尖材/饰面选择、供墨、维护、选购和未公开尺寸重量边界；添加原创 factual SVG。
- 复用现有 `CuratedEntityPack`、`recordEntityContentReview`、`publishEntity` 与本地 owned-copy guard；拒绝远程环境和真实 DB。

## Verification

1. 定向测试覆盖审核—发布、身份/拓扑、来源分组、媒体、冲突、replay noop 与真实 DB snapshot。
2. TypeScript、Biome、`git diff --check`。
3. 只暂存本包文件和本 quick PLAN/SUMMARY；不暂存 checkpoint DB/source snapshot 或其他未跟踪 research。
