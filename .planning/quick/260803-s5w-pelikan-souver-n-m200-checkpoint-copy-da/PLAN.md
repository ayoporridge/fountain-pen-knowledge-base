# Phase 416：在 checkpoint copy 深化 Pelikan Classic M200

## 目标

更新既有 `uLrDh27Q5Xne`（`pelikan-m200`）公开内容，不新增重复实体。正文把 1985 Old Style、1997 改款、现行 Classic M200、M250 金尖边界、P200/P205 与 Twist P457 上墨边界、颜色档案、活塞维护和二手选择写成可核查的中文内容。

## 约束

- 资料优先使用 Pelikan 官方目录、MAM 产品档案、Pelikan Collectibles、The Pelikan's Perch 和可靠零售编辑资料。
- 所有写入只在本阶段 owned checkpoint copy 进行；真实 `data/fpkg.db` 只做快照保护和回读。
- 通过 `recordEntityContentReview` 的 fact/language/media 与 `publishEntity` 发布；不绕过审核门槛。
- 不新增实体，不改动其他 agent 的 research、`.next-phase*` 或既有 quick/checkpoint 目录。

## 交付与验证

1. 研究记录、8,000 Unicode 字符以上正文和 14 个以上带来源的变体/边界。
2. Curated pack、owned-copy apply 脚本和定向测试。
3. 测试覆盖来源独立组、规格、品牌关系、readiness、完整性和 replay noop。
4. 通过 TypeScript（仅记录已知基线诊断）、Biome、diff 检查；只暂存本阶段文件并提交。
