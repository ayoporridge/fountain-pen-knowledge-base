---
name: add-sourced-hero-8100-18k-content-pack-w
created: 2026-07-27
status: complete
---

# Add sourced Hero 8100 18K content pack

继续全量内容修复：为现有 Hero 品牌补充官方目录中的 8100 型 18K 金笔，严格区分官方已公布事实与尚未公开的尺寸、上墨和批次资料，不修改他人 research/quick 文件。

## Success criteria

1. 以 Hero 官方产品页为主、可靠产品目录/渠道页为辅，写出自然中文正文，说明型号身份、18K/花丝镶嵌工艺、与 8102 等 sibling 的边界，并明确未公开规格。
2. 新内容包只在 caller-owned checkpoint copy 回放，并通过 fact/language/media 审核与 publication gate；定向测试、TypeScript、Biome、diff 检查全部通过。
3. 只暂存本批拥有的 research、SVG、data/apply/test 文件；真实 local/remote migration、生产部署和线上直接检查/sitemap 全量复查有证据。
4. 全量 goal 继续 active；本批完成不等于总目标完成。

## Owned files

- `.planning/content-research/hero-8100-phase299.md`
- `public/images/library/site-original/phase299/hero/8100.svg`
- `scripts/data/phase299-hero-8100.ts`
- `scripts/apply-phase299-hero-8100-content.ts`
- `tests/content/phase299-hero-8100.test.ts`
- `scripts/check-audit-readiness.ts` 与 `scripts/lib/phase19-fixtures.ts` 仅在正式 local merge 后更新真实 DB fingerprint

## Verification loop

owned checkpoint → targeted replay test → tsc/Biome/diff → local formal merge → remote formal merge → deploy → direct model/brand/media/sitemap checks → robust sitemap sweep → commit/push。
