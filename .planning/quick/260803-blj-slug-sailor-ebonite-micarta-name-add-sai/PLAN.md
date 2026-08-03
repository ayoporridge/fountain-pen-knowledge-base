---
quick_id: 260803-blj
slug: sailor-ebonite-micarta
status: complete
---

# Sailor Ebonite Eternal Flow 与 Black Micarta 内容包

## 目标

补齐真实资料库中缺失的 Sailor `10-6085` EBONITE ETERNAL FLOW 与 `10-5060` Black Micarta 两个具体型号；保留未来上市时态、日英市场尖幅差异和 ebonite／canvas micarta 材料边界。

## 任务

- [x] 核对真实库没有重复实体、slug 或型号代码。
- [x] 核对 Sailor 日文／英文产品页、官方目录、材料专题、补墨／维护页和专业零售页。
- [x] 写自然中文正文、完整规格、材料历史、版本差异、未来上市边界、维护和选购建议。
- [x] 添加原创 factual SVG；明确不是产品照片、Logo、比例图或颜色校样。
- [x] 经由 `recordEntityContentReview` 与 `publishEntity` 在 owned checkpoint copy 验证。
- [x] 跑定向测试、TypeScript、Biome 和 diff 检查。
- [x] 只暂存本包文件并提交；不迁移真实库或 Turso。

## 不在本 quick task 内

- 不写 `data/fpkg.db`，不执行 Turso 或生产迁移。
- 不把 2026-09-12／2026-10-17 写成已经发售，不把日英页面差异扩成第三个实体。
- 不删除或暂存其他 agent 的 research、`.next-phase*` 或旧 quick checkpoint。
