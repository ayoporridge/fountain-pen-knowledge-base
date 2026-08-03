# Phase 413：深化 Pelikan Souverän M1000

## 目标

深化既有 `pelikan-souveran-m1000` 实体，不新增重复型号。正文以标准黑色／黑绿条纹 M1000 为主体，补齐 1997 起点、18K/750 尖、差动活塞、尺寸容量、条纹材料、Renaissance Brown 与 M1005 边界、维护和选购。

## 边界

- 只更新现有实体 `6eXuisf9KiK5`，品牌关系保持现有 Pelikan 品牌。
- 实验数据库只使用本目录下的 owned checkpoint copy；不写 `data/fpkg.db`。
- 复用已经保存且有 Wikimedia CC BY 2.0 证据的 M1000 实物照片，不复制其他产品摄影。
- 通过 `recordEntityContentReview` 和 `publishEntity` 走审核—发布链路，不直接改 publication 状态。
- 不触碰其他 agent 的 research、`.next-phase*` 或 Montblanc quick 目录。

## 验证

1. 在 owned checkpoint copy 上跑 Phase 413 定向测试和重放。
2. 核对正文、来源独立组、变体、媒体、规格、关系、readiness 与 SQLite integrity。
3. 运行 TypeScript、测试文件 Biome 和 `git diff --check`。
4. 提交前只暂存本 Phase 文件，并确认真实数据库 SHA 不变。
