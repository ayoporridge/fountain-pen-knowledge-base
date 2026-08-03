# Quick Task Plan

## Objective

为当前资料中已公开但尚未入库的 Wancher Dream Pen Zogan Swan – Urushi Teal 建立一个来源化型号内容包，修正其与 Wancher 品牌及 Dream Pen 系列导航的身份关系，并只在 owned checkpoint copy 上验证审核—发布链路。

## Scope

- 新增一个 `pen` 型号，不重复创建 Wancher 品牌或 Dream Pen 系列导航。
- 使用 Wancher 官方商品页与集合页、独立专业评测/资料作为事实来源。
- 写自然中文正文、规格、工艺与版本边界、维护和选购建议。
- 添加标注为非产品照片的原创 factual SVG，并建立 primary media。
- 复用 `CuratedEntityPack`、`recordEntityContentReview` 和 `publishEntity` 路径；拒绝远程环境、真实库、符号链接和硬链接。

## Verification

1. 定向 Vitest/node test：owned copy 发布、审核、品牌关系、来源分组、媒体、冲突、重放 noop、真实 DB hash 不变。
2. `pnpm exec tsc --noEmit`，记录仅有已知基线诊断。
3. Biome 与 `git diff --check`。
4. 只暂存本包的研究、SVG、脚本、data、测试与本 quick 计划/总结；不碰其他 agent 未跟踪文件。
