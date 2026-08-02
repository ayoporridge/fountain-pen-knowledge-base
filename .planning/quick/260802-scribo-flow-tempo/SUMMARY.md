# Phase 355 回放摘要

状态：已在 owned checkpoint copy 完成首回放、二次幂等回放和 SQL 检查；尚未正式迁移真实资料库。

## 验证记录

- 定向 `tsx --test tests/content/phase355-scribo-flow-tempo.test.ts`：1/1 通过；覆盖远程环境拒绝、审核发布路径、正文字段、品牌关系、三变体、五条引用、主媒体、二次回放 noop 与真实资料库 snapshot 不变。
- TypeScript 定向检查：`tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler --esModuleInterop --types node` 通过。
- Biome 定向检查：通过。
- checkpoint 首回放：`phase140-brand-scribo` 与 `phase355-scribo-flow-tempo` 均 `published`；FLOW Tempo digest 为 `sha256:v3:5cde938faebfc3a087ecf73b25d4d8c25b73fb7cb0f9cdc0b5aca2f9bfa821f8`。
- checkpoint 二次回放：两个实体均 `noop`，digest 不变。
- SQL：FLOW Tempo `published`、revision 72；fact/language/media/publication 四项审核均 `approved`；`made_by` 与品牌反向导航各 1；source groups 为 primary 1 / professional secondary 1 / auxiliary 0；3 variants；10 条 approved spec evidence；5 条 entity references；SVG 为 primary media。品牌正文 1550 字且含 FLOW Tempo，型号正文 2475 字。
- 保护 hash：真实 `data/fpkg.db` 与 `checkpoint/protected.db` 均为 `526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`；回放副本为 `232cd53eeefaac763e5b6a5ade4c0af7d1030fdd59f3ae627730ac0dc146d3fd5`（仅作副本结果，不作为真实库 hash）。

保护要求：真实 `data/fpkg.db` 只读；不得把本 checkpoint 当作正式迁移或线上发布证据。
