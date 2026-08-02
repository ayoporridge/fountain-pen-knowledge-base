# Phase 374 — Sailor SHIKIORI 雨音与五周年穣

## Goal

在不修改 `data/fpkg.db` 的前提下，依据 Sailor 官方英文／日文／中文产品页、SHIKIORI 系列页、官方专题、新闻／发布资料和官方补墨维护说明，补齐两个当前品牌页公开但本地缺失的型号：

- `11-3059` SHIKIORI 雨音（The Sound of Rain；四个 21K MF 颜色 SKU）
- `10-1050-368` SHIKIORI 5 周年 穣（Minori；一支 MF 限量套装）

每个型号必须有自然中文正文、规格、历史／版本边界、使用维护、选购建议、来源和原创 factual SVG，并链接既有 Sailor 品牌；穣的瓶装墨水与专用转换器只作为官方套装组成，不另建钢笔型号。

## Owned files

- `scripts/data/phase374-sailor-shikiori-amaoto-minori.ts`
- `scripts/apply-phase374-sailor-shikiori-amaoto-minori-content.ts`
- `tests/content/phase374-sailor-shikiori-amaoto-minori.test.ts`
- `.planning/content-research/sailor-shikiori-amaoto-113059-phase374.md`
- `.planning/content-research/sailor-shikiori-minori-101050-phase374.md`
- `public/images/library/site-original/phase374/sailor/shikiori-amaoto-113059.svg`
- `public/images/library/site-original/phase374/sailor/shikiori-minori-101050-368.svg`
- this quick directory's `PLAN.md` and `SUMMARY.md`

## Verification contract

1. Targeted test uses a disposable owned copy, rejects remote environment selection, checks identity, variants, source/review/media/topology rows, replay idempotence and the protected catalogue snapshot.
2. CLI replay runs once for `published` and once for `noop` on a persistent checkpoint copy under this directory; SQL readback records exact counts and hashes.
3. TypeScript, formatting and staged diff checks run; unrelated baseline diagnostics are recorded rather than hidden.
4. Only owned Phase 374 files are staged. Checkpoint databases and all unrelated research/quick directories remain untracked.
