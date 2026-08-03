# Phase 418：在 owned checkpoint copy 深化 Pelikan M215

## 目标

更新既有 `phase281-pelikan-m215`（`pelikan-m215`）公开内容，不新增重复实体。正文覆盖黄铜内层与树脂外壳、2005–2008 四种图案、历史／当前规格口径、钢尖活塞、维护、二手验收和 M200/M205/M250/P205 边界。

## 约束

- 资料优先使用 Pelikan 官方 MAM、Fine Writing 目录与护理页、Pelikan Collectibles、The Pelikan’s Perch、Pen Addict 等可靠资料。
- 所有写入只在本 quick 自有 checkpoint copy 中进行；真实 `data/fpkg.db` 只做快照保护和只读回读。
- 通过 `recordEntityContentReview` 的 fact/language/media 与 `publishEntity` 发布，不直接置 published 绕过门禁。
- 不新增实体，不删除或提交其他 agent 的 research、`.next-phase*` 或既有 quick/checkpoint 目录。

## 交付与验证

1. 研究记录、8,000 Unicode 字符以上正文、20 以上来源／17 以上独立组和四种图案版本导航。
2. Curated pack、owned-copy apply 脚本和定向测试。
3. checkpoint 回读正文、来源、规格、版本、关系、readiness、四类 review、完整性和 replay noop。
4. 通过 TypeScript（仅记录仓库既有基线诊断）、Biome、diff 检查；只暂存本阶段文件并提交。
