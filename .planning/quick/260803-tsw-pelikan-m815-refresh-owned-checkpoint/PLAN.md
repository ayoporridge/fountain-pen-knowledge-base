# Phase 420：Pelikan Souverän M815 Metal Striped checkpoint refresh

## 目标

在不创建重复实体、不写入真实 `data/fpkg.db` 的前提下，深化既有 M815 Metal Striped 页面，区分 2018 Black 与 2025 Blue，补足材料、版本、尖幅、上墨、维护、二手验收和 M800/M805/Wall Street 身份边界。

## 执行与验证

1. 使用官方 Pelikan Passion、Pelikan MAM、Pelikan 年报／新闻稿，结合 Pelikan Collectibles、The Pelikan's Perch、Scrively、FPN 和地区零售页，形成来源化正文。
2. 复用 `2muSiS2rOSd7` 与 `VXUULuCOLOB1`，只在 owned checkpoint copy 应用 `recordEntityContentReview` + `publishEntity` 审核—发布路径。
3. 验证正文、来源独立组、variant 层级、primary SVG、身份关系、四类审核、publication、readiness、replay noop 和 SQLite integrity。
4. 记录真实库 main/WAL/SHM 快照，确保试验前后 SHA-256 不变。

## 回归门槛

- 正文 ≥ 8,000 Unicode 字符；来源 ≥ 15、独立组 ≥ 12、variant ≥ 10、primary media = 1。
- Black/Blue 作为 material 子版本，父级为 edition_group；尖幅为 nib 子版本；M805/M800/Wall Street 为边界节点。
- publication = published；content/reviewed revision 对齐；fact/language/media/publication 均 approved；readiness blocker_count = 0。
