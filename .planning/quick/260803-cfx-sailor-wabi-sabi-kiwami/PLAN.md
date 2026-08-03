# Phase 379：Sailor Wabi Sabi KIWAMI（10-2213）

## 目标

为现有库存中缺失的 Sailor Wabi Sabi KIWAMI 10-2213 建立可重放的来源化内容包。保持型号、KOP 尖、漆艺和海外限量边界，不把 Wabi Sabi 系列导航或同系列旧款误建成同一实体。

## 任务

- [x] 写完整中文正文、规格 JSON、版本差异、维护与选购边界。
- [x] 新增本站原创非照片 factual SVG，并登记媒体许可边界。
- [x] 用官方 Sailor 产品页、官方 Wabi Sabi 专题、专业零售商资料建立来源与证据。
- [x] 通过 `recordEntityContentReview` 与 `publishEntity` 路径在 owned checkpoint copy 发布并验证重放幂等。
- [x] 运行定向测试、TypeScript、Biome、diff 检查，确认真实 `data/fpkg.db` 未改变。
- [x] 只暂存本 phase 拥有的文件并提交；不触碰其他 agent 的 research 与 checkpoint 目录。

## 不在本 phase

- 不写真实 catalog、Turso 或生产环境。
- 不把 KIWAMI 的历史发布时间、官方 MSRP、实物颜色或书写感受猜成已证实事实。
- 不把 Wabi Sabi 1st/2nd/3rd 或 KOP 家族页拆成新的同名型号。
