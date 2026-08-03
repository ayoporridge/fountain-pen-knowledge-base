# Phase 417：在 owned checkpoint copy 深化 Pelikan M205

## 目标

更新既有 `phase281-pelikan-m205`（`pelikan-m205`）公开内容，不新增重复实体。正文覆盖 M205 的 2005 透明起点、2009 系列款、2015–2023 特别版、银色／铑色饰件与钢尖边界、活塞上墨、当前／历史规格口径、维护、二手识别和 M200/M215/M250/P205 相邻型号。

## 约束

- 资料优先使用 Pelikan 官方 MAM、目录与护理页、Pelikan Collectibles、The Pelikan’s Perch 和可靠零售编辑资料。
- 所有写入只在本 quick 自有 checkpoint copy 中进行；真实 `data/fpkg.db` 只做快照保护和只读回读。
- 通过 `recordEntityContentReview` 的 fact/language/media 与 `publishEntity` 发布；不直接置 published 绕过门禁。
- 不新增实体，不删除或提交其他 agent 的 research、`.next-phase*` 或既有 quick/checkpoint 目录。

## 交付与验证

1. 研究记录、8,000 Unicode 字符以上正文、20 以上来源／17 以上独立组和带来源版本导航。
2. Curated pack、owned-copy apply 脚本和定向测试。
3. checkpoint 回读正文、来源、规格、版本、关系、readiness、四类 review、完整性和 replay noop。
4. 通过 TypeScript（仅记录仓库既有基线诊断）、Biome、diff 检查；只暂存本阶段文件并提交。
