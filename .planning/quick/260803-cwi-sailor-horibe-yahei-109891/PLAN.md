# Phase 381：Sailor KOP Maki-e Ukiyo-e Horibe Yahei Kanemaru（10-9891）

## 目标

补齐 Sailor 当前官方目录中尚无实体的 KOP Maki-e Ukiyo-e “Horibe Yahei Kanemaru” 10-9891。以官方产品规格为主，博物馆资料解释 Utagawa Kuniyoshi 的题材背景，专业零售商只记录市场与海外限量说法，并显式保留官方未列数量的边界。

## 任务

- [x] 写完整中文正文、规格 JSON、M/B SKU、题材历史、维护和选购边界。
- [x] 新增原创非照片 factual SVG。
- [x] 建立官方、博物馆、专业零售商和维护来源。
- [x] 在 owned checkpoint copy 通过既有审核—发布链路，验证重放幂等和品牌关系。
- [x] 运行定向测试、TypeScript、Biome、diff 检查，确认真实 catalog 未变。
- [x] 只暂存本 phase 文件并提交，保留其他 agent 文件。

## 不在本 phase

- 不把零售商“30 支海外”直接升级为 Sailor 官方全球限量；不猜首发年份、MSRP、重量或工艺层次。
- 不把 Horibe Yahei Kanemaru 的历史人物或 Utagawa Kuniyoshi 作品建成钢笔型号。
- 不写真实 SQLite、Turso 或生产环境。
