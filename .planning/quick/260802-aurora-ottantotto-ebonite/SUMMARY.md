# Phase 356 回放摘要

状态：已在 owned checkpoint copy 完成首回放、二次幂等回放和 SQL 检查；尚未正式迁移真实资料库。

## 验证记录

- 定向 `tsx --test tests/content/phase356-aurora-ottantotto-ebonite.test.ts`：1/1 通过；覆盖远程环境拒绝、审核发布路径、正文身份／版本／维护边界、四颜色变体、来源冲突、品牌关系、主媒体、二次回放 noop 与真实资料库 snapshot 不变。
- TypeScript 定向检查通过；Biome 对 apply/test 通过；`git diff --check` 通过。
- checkpoint 首回放：Aurora brand `CJXe8UpnkHLJ` 与 `phase356-aurora-ottantotto-ebonite` 均 `published`；型号 digest 为 `sha256:v3:b8a9bc93facac2b734bb164de43d7d0a2400398a6a59831ae8f134bb2daac170`。
- checkpoint 二次回放：两个实体均 `noop`，digest 不变。
- SQL：型号 `published`、revision 89；fact/language/media/publication 四项审核均 `approved`；`made_by` 与品牌反向导航各 1；source groups 为 primary 5 / professional secondary 1 / auxiliary 0；4 variants；11 条 approved spec evidence；8 条 entity references；1 条 resolved colour-count conflict；SVG 为 primary media。品牌正文 1204 字且含 Ebanite，型号正文 2822 字。
- 保护 hash：真实 `data/fpkg.db` 与 `checkpoint/protected.db` 均为 `526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`；回放副本为 `b234d2165e9a57571219c2aae9ea16ea1a61525cc2ec0bff78b2bdb5c2d65ef6`（仅作副本结果，不作为真实库 hash）。

保护要求：真实 `data/fpkg.db` 只读；不得把本 checkpoint 当作正式迁移或线上发布证据。
