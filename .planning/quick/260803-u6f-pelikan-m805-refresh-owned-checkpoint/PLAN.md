# Phase 421：Pelikan Souverän M805 checkpoint refresh

## 目标

在不创建重复实体、不写入真实 `data/fpkg.db` 的前提下，深化既有 M805 页面，补足基础色与特别版边界、Stresemann 材料、尖幅、差动活塞、维护、二手验收和 M800/M815/M605/M405 身份边界。

## 执行与验证

1. 以 Pelikan 当前目录、2025 目录、MAM 产品记录和 M805 Stresemann 档案为主，结合 The Pelikan's Perch、FPN、Goldspot、Pencilcase 与 Nib & Barrel，形成来源化中文正文。
2. 复用既有 `phase283-pelikan-m805` 与 Pelikan 品牌实体，只在 owned checkpoint copy 应用 `recordEntityContentReview` + `publishEntity` 审核—发布路径。
3. 验证正文、来源独立组、variant 层级、primary SVG、身份关系、四类审核、publication、readiness、replay noop 和 SQLite integrity。
4. 记录真实库 main/WAL/SHM 快照，确保试验前后 SHA-256 不变。

## 回归门槛

- 正文 ≥ 8,000 Unicode 字符；来源 ≥ 15、独立组 ≥ 12、variant ≥ 10、primary media = 1。
- 基础色与 Stresemann/特别版作为 edition_group 或 color 版本，EF/F/M/B 为 nib 子版本；M800/M815/M605/M405 只作身份边界。
- publication = published；content/reviewed revision 对齐；fact/language/media/publication 均 approved；readiness blocker_count = 0。
