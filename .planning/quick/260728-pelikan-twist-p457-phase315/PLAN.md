# Phase315 — 修正并来源化 Pelikan Twist P457

现有 `wnzMt5lugvtc / pelikan-twist` 已是公开实体，本阶段不创建 duplicate；更新 canonical name、正文、来源与变体，使 P457 身份、R457 rollerball、P450/Pelikano、旧 Twist 与 M200/M400 的边界可核验。

Owned files:

- `.planning/content-research/pelikan-twist-p457-phase315.md`
- `scripts/data/phase315-pelikan-twist-p457.ts`
- `scripts/apply-phase315-pelikan-twist-p457-content.ts`
- `tests/content/phase315-pelikan-twist-p457.test.ts`

现有 `/images/library/site-original/pelikan-m200-p457/p457.svg` 已明确是 P457 事实示意图，本阶段仅重新挂载，不复制或改写图片。

Verification: caller-owned checkpoint copy only; replay must be `noop`, real catalog snapshot unchanged; run targeted test, TypeScript, Biome and diff checks.
