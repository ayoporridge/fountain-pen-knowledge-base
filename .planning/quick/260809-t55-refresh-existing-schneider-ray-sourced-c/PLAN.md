---
name: refresh-existing-schneider-ray
status: complete
created: 2026-08-09
---

# Refresh existing Schneider Ray

## Objective

在不新建实体的前提下，以 Schneider 当前美国官网 168213 商品页刷新已有 `phase139-schneider-ray`。锁定 Article No. 168213、GTIN、pistacchio、右手 M+、橡胶化握区、不锈钢 iridium 尖、标准墨囊、piston converter、随附可擦 royal-blue 墨囊、可替换前端和左手 L 边界；对当前页面的地区库存状态、未公布尺寸/重量和非产品照片边界保持诚实。

## Owned files

- `.planning/content-research/schneider-ray-current-depth-publishable-content-2026-08-09.md`
- `scripts/data/phase551-schneider-ray-current-depth.ts`
- `scripts/apply-phase551-schneider-ray-current-depth.ts`
- `tests/content/phase551-schneider-ray-current-depth.test.ts`
- 本 quick 目录下的 `PLAN.md`、`SUMMARY.md`、checkpoint；checkpoint 不提交。

## Explicit non-goals

- 不新建 Schneider 品牌、Ray 型号或颜色实体。
- 不把左手 L 前端、其它颜色、宣传页或其它 Schneider 型号的尺寸和尖材混入 168213。
- 不把官网商品图库当作许可的实拍照片；继续使用现有站内原创 factual SVG。
- 不直接写入 `data/fpkg.db`，不触碰 Turso。

## Verification contract

- 从 caller-owned checkpoint 复制，清空远端环境变量并确认真实库快照不变。
- 首次应用：品牌与 Ray 均 `published`，唯一 `made_by`、当前正文、来源、规格证据、媒体和四项审核通过。
- 重放应用：两条均 `noop`。
- 定向测试、`tsc --noEmit`、Biome、`git diff --check` 通过后，只暂存本批次六个 owned 文件。
