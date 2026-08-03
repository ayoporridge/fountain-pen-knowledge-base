# Phase 380：Sailor King of Pen “Shakkyo”（10-8099）

## 目标

为 Sailor 当前官方目录中尚无实体的 King of Pen Japanese Classical Performing Arts “Shakkyo” 10-8099 建立来源化内容包。明确 Noh 石桥题材、Isshu Tamura、硬橡胶、KOP 双色 21K 尖和 Hakone marquetry 礼盒的边界，不把 KOP 家族、其他 Maki-e 款或艺术题材导航混为同一型号。

## 任务

- [x] 写完整中文正文、规格 JSON、M/B SKU、艺术背景、维护与选购边界。
- [x] 新增原创非照片 factual SVG，并登记媒体许可边界。
- [x] 使用 Sailor 官方产品／艺术家资料、Noh 文化资料和专业零售商二级来源。
- [x] 通过既有 `recordEntityContentReview` 与 `publishEntity` 路径在 owned checkpoint copy 发布并验证重放幂等。
- [x] 运行定向测试、TypeScript、Biome、diff 检查，确认真实 catalog 未改变。
- [x] 只暂存本 phase 拥有的文件并提交，保留其他 agent 的 research 与 checkpoint。

## 不在本 phase

- 不写未被官方声明的首发年份、限量数量、官方 MSRP、真实漆层或书写感受。
- 不把“Shakkyo”题材实体化为 Noh 剧目本身；本页是 Sailor 10-8099 具体钢笔。
- 不正式迁移真实 SQLite、Turso 或生产站点。
