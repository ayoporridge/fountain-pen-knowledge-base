---
phase: quick
plan: 260719-b0o
status: complete
completed_at: 2026-07-19T09:11:13+08:00
commits:
  - cb6504b
  - 13edbd6
  - 490fd6d
---

# Quick Task 260719-b0o Summary

## Outcome

- Parker：发布 2023+ Ingenuity、现行 Urban、经典 Vector 与独立 Vector XL；保留 2213726 官方 F／M 冲突，Vector XL 的尺寸只绑定 2159746，旧 Vector 不再混入 XL 资料。
- Sailor：发布 full-size Professional Gear 21K、Profit 14 `11-1214` 与 Profit 18 `11-2218`；退役混名 Pro Gear 重复条目，补齐完整商品代码、现行规格、日期化价格与品牌反向链接。
- Pelikan：发布 M1000、跨两代平台的 M600 与独立 2012 M600 Tortoiseshell-White；退役误标“M605 白乌龟”，保留永久跳转并清除其正反向品牌关系。
- 顺手清理此前 Sailor 品牌／1911 Standard 与 Pelikan M800 正文中的 `canonical`、`made_by`、数据库／仓库等工程措辞，并用定向断言防止回流。

## Evidence and identity fixes

- M1000 同时保留 2025 官方目录 14.7 cm 与现行 Black PDP 14.6 cm；M600 同时保留 13.4 cm 与 13.3 cm，均明确为 1 mm 官方口径差异，而不是擅选单值。
- 2012 White Tortoise 不再把通用 M600 平台表的 133 mm／18 g 当成该配色精确测量；正文改为白色 M6xx 家族级近似 134.1 mm／12.45 mm／15.9 g／1.30 ml，并披露两组资料冲突。
- Professional Gear 使用站内事实卡作主图，两张 CC BY-SA 2.0 家族历史照片只作 gallery；Profit 14／18、Parker 四款和 Pelikan M600／White Tortoise 均使用明确标注“非产品照片”的原创事实图。
- M1000 使用可确认型号的 Wikimedia Commons CC BY 2.0 实拍；所有新增媒体哈希互不重复。
- 视觉复核修复经典 Vector SVG 因未设 `fill="none"` 而出现的黑色三角块，并移除图中的内部工程术语。

## Verification

- `tests/content/phase27-pelikan.test.ts` — PASS
- `tests/content/phase29-sailor.test.ts` — PASS
- `tests/content/phase30-parker-p0.test.ts` — PASS
- `tests/content/phase31-sailor-p0.test.ts` — PASS
- `tests/content/phase32-pelikan-p0.test.ts` — PASS
- `pnpm exec tsc --noEmit --pretty false` — PASS
- scoped Biome — PASS
- all nine new SVG files via `xmllint --noout` — PASS
- `pnpm build` — PASS（Next.js 15.5.18，18 个静态页面）
- 每轮验证前后真实 `data/fpkg.db` SHA-256 均为 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`；WAL／SHM 均不存在。
- 三组重复应用均返回 `noop`，此前 Parker 51、Sailor 1911 Standard 与 Pelikan M800 的发布状态／revision 保持不变。

## Task commits

- `cb6504b feat(content): publish Parker Ingenuity Urban and Vector lines`
- `13edbd6 feat(content): publish Sailor Pro Gear and Profit 14 18`
- `490fd6d feat(content): publish Pelikan M1000 M600 and 2012 White Tortoise`

## Scope boundary

- 没有连接或部署生产，没有恢复搜索或 LLM，也没有新增 runner、Playwright、AI／通用验收或 readiness 基础设施。
- 本批完成的是十个型号内容包及相关身份修复，不代表 305 个既有实体已经全量补完；正式迁移、全量页面遍历、生产部署和线上逐条复查仍在总 `/goal` 内。
- `.planning/quick/260719-665-montblanc-writers-edition-patron-of-art-/` 未修改、未暂存、未提交。

## Next content wave

- Sailor 2026 current：Professional Gear Slim 21 `11-2151`、Profit Realo 18 `11-1853`、Professional Gear Anchor。
- Parker Duofold 边界：vintage family、Geometric、Striped／Duovac 与现代 Duofold Classic Centennial 分页互链。
- Pelikan：M1005 Stresemann、M400、真正的 M605 与 M815；随后 M200 与 Twist P457。

## Self-check: PASSED

三个内容提交只包含各自品牌的研究、媒体、data／wrapper／test 及必要的旧文案清理／重定向；GSD 文件留到独立文档提交，遗留 Quick 665 未进入任何提交。
