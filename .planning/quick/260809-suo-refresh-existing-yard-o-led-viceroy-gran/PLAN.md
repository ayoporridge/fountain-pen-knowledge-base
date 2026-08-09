---
name: refresh-existing-yard-o-led-viceroy-grand
status: complete
created: 2026-08-09
---

# Refresh existing YARD-O-LED Viceroy Grand

## Objective

在不新建实体的前提下，用 YARD-O-LED 当前 Viceroy Grand Victorian 与 Barley 商品页、Grand 目录和官方维护页刷新现有 `phase269-yard-o-led-viceroy-grand`。补入当前 SKU 的 148 mm、13.0 mm、66 g、18 carat gold nib F/M/B、screw cap、lifetime warranty 与 Victorian hand-chasing 边界；保留旧评测仅作为样本，不把历史样本的供墨、重量或笔尖写成所有年代的统一出厂规格。

## Owned files

- `.planning/content-research/yard-o-led-viceroy-grand-depth-publishable-content-2026-08-09.md`
- `scripts/data/phase550-yard-o-led-viceroy-grand-depth.ts`
- `scripts/apply-phase550-yard-o-led-viceroy-grand-depth.ts`
- `tests/content/phase550-yard-o-led-viceroy-grand-depth.test.ts`
- 本 quick 目录下的 `PLAN.md`、`SUMMARY.md`、checkpoint；checkpoint 不提交。

## Explicit non-goals

- 不新建 YARD-O-LED 品牌、Viceroy Grand 或其它 sibling 实体。
- 不把 Grand Martelé、Viceroy Standard、Pocket、rollerball 或铅笔的尺寸、帽机制、图片和供墨回填到本页。
- 不把官方商品页的数字模拟图当成真实产品照片；继续使用站内原创 factual SVG 并明确非实拍。
- 不直接写入 `data/fpkg.db`，不触碰 Turso。

## Verification contract

- checkpoint 从 caller-owned `catalog-2.db` 复制，试写前清空远端环境变量并验证真实库快照不变。
- 首次应用：现有 pen 身份、唯一 `made_by`、正文、来源、规格证据与 fact/language/media/publication 审核均通过。
- 重放应用：目标实体 `noop`。
- 定向测试、`tsc --noEmit`、Biome（测试文件）、`git diff --check` 通过后，只暂存本批次六个 owned 文件。
