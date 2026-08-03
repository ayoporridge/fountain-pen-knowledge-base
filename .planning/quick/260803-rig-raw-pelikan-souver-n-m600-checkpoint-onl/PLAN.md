# Phase 414：深化 Pelikan Souverän M600

## 目标

深化既有 `pelikan-souveran-m600` 实体，不新增重复型号。正文区分 1985–1997 Old Style 与 1997 年 9 月后的加大平台，补齐现行规格、笔尖年代、颜色／特别版边界、活塞维护、二手鉴别与购买建议。

## 边界

- 只更新现有实体 `MJHgkh3M-6MQ`，保留 Pelikan 品牌和 2012 Tortoiseshell-White 独立实体。
- 实验数据库只使用本目录下的 owned checkpoint copy；不写 `data/fpkg.db`。
- 复用已经存在的本站原创 M600 factual SVG；明确它不是产品照片、机械图或比例参考。
- 通过 `recordEntityContentReview` 与 `publishEntity` 走审核—发布链路，不直接改 publication 状态。
- 不触碰其他 agent 的 research、`.next-phase*` 或 Montblanc quick 目录。

## 验证

1. 在 owned checkpoint copy 上运行 Phase 414 定向测试。
2. 核对正文、来源独立组、变体、媒体、规格、时间线、关系、readiness 与 SQLite integrity。
3. 运行 TypeScript、测试文件 Biome 和 `git diff --check`。
4. 持久 checkpoint 重放必须为 `noop`；提交前确认真实数据库 SHA 不变。
