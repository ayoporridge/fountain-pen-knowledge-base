# Phase 395 Summary — Refresh Waterman Carène canonical content

## Outcome

刷新已有 `qsuRSNYKpI6-`（`/pen/waterman-carene`）内容，没有新建 Waterman 或 Carène 实体。新正文把 Carène 的 1997 年官方历史锚点、当前 collection、嵌入式／包覆式 18K 尖、七种字幅边界、Blue CT item 2214210、Black Sea GT S0700300 的限定尺寸、法国手工组装、Waterman cartridge/converter、冷水清洗、饰面／主题／礼盒 SKU、二手检查和 Expert/Hémisphère/Allure/Edson 边界写成读者可用的自然中文。

Waterman 品牌与 Carène 的 `made_by`、品牌反向导航各保持唯一；没有旧重复 slug 需要新增跳转，也没有把 rollerball 或 ballpoint 合并到钢笔型号。

## Sources

- [Waterman Carène luxury pens collection](https://www.waterman.com/carene-pens.html)：integrated nib、七种字幅、Carène finishes 与 fountain/rollerball/ballpoint 分列。
- [Waterman Carène Blue CT item 2214210](https://www.waterman.com/pens/car%C3%A8ne/car%C3%A8ne-fountain-pen/SAP_2214210.html)：rhodium-coated 18K gold Inset nib、深蓝 lacquer、palladium trims、brass cap、法国手工组装和两年保修语境。
- [Waterman Heritage](https://www.waterman.com/waterman-history.html)：1997 Carène、1990–92 Expert、1994 Hémisphère 与 nautical/yachting 设计时间锚点。
- [Waterman fountain pen ink filling instructions](https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions)：墨囊、converter、笔尖浸没、回滴三滴、擦拭和上墨步骤。
- [Waterman 2021 Trade Catalogue](https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021)：Carène/Expert collection、18K 尖和档案饰面语境。
- [Waterman 2014 brochure](https://www.watermanromania.ro/cataloage1/Waterman/Waterman-2014Brochure.pdf)：Carène 18-carat solid-gold nib、嵌入设计和游艇线条历史表达。
- [Atlas Stationers：Carène Black Sea GT](https://www.atlasstationers.com/products/waterman-carene-fountain-pen-black-sea-gold-trim)：S0700300 的 C/C、18kt、5.6/5.0/5.8 in、34 g、brass/lacquer 具体样本。
- [Tenpen：Waterman Carène history](https://www.tenpen.it/node/1695)：专业历史和 1997–98 家族边界补充。

## Owned files

- `.planning/content-research/waterman-carene-phase395.md`
- `scripts/data/phase395-waterman-carene-refresh.ts`
- `scripts/apply-phase395-waterman-carene-refresh.ts`
- `tests/content/phase395-waterman-carene-refresh.test.ts`
- `.planning/quick/260803-i4b-refresh-waterman-carene-canonical-source/PLAN.md`
- `.planning/quick/260803-i4b-refresh-waterman-carene-canonical-source/SUMMARY.md`

Checkpoint database is disposable evidence only and is intentionally not staged:

- `.planning/quick/260803-i4b-refresh-waterman-carene-canonical-source/checkpoint/fpkg.db`

## Verification evidence

- `pnpm exec tsx --test tests/content/phase395-waterman-carene-refresh.test.ts` — pass; the test uses an owned migrated copy, rejects remote env selection, checks 9 sourced groups, 4 variants, one nib variant, review → publish, readiness, public membership, unique maker/reverse links and noop replay.
- Persistent checkpoint apply — Waterman brand and existing Carène both returned `published`; Carène body readback was 8,190 characters; `PRAGMA integrity_check` = `ok`; `public_entity_readiness` reported `blocker_count=0`, `publishable=1`.
- Persistent checkpoint SQL readback — Carène had 5 primary/archive source groups and 1 professional-secondary group, 4 variants, approved current fact/language/media/publication reviews, and unique Waterman maker/reverse links. Entity/public/published totals remained 950/904/642.
- `pnpm exec biome check` on owned TypeScript/test files — pass.
- `git diff --check` on owned files — pass.
- `pnpm exec tsc --noEmit` — no Phase 395 diagnostics; only the pre-existing Phase 346 implicit-any pair and migration test `NODE_ENV` diagnostic remain.
- Protected real catalog SHA-256 before/after checkpoint work: `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`.

No formal migration to `data/fpkg.db`, Turso, deployment or online page review was performed in this phase. The full content goal remains open.
