# Phase 423：Wancher World Tree / Sekai 木材型号深化

## 目标

在 owned checkpoint copy 上深化五个已有 Wancher 木材钢笔实体，不新增重复实体，不改变真实 `data/fpkg.db`，并沿用项目既有的审核—发布链路。

## 范围

- 品牌：Wancher（`eOfD77nOeENN`）
- 型号：World Tree – Ebony、Sekai Ai、World Tree – Teak Wood、World Tree – Verawood、World Tree – Sandalwood
- 内容：自然中文正文、木种/工艺边界、夹件、尖材、feed、C/C、维护、选购、来源和 SVG 媒体声明
- 关系：每个型号唯一 `made_by` → Wancher；Wancher 唯一 `reverse` → 每个型号
- 禁止：新建同名型号、直接写真实数据库、把集合页数字伪装逐支实测、复制官方商品照片、扩建通用验收设施

## 执行步骤

1. 读取官方 exact product/collection 页面和可靠零售交叉页，完成五篇研究正文与来源包。
2. 复用 phase331–335 基础实体和 variants，附加独立来源组与身份/维护 claims。
3. 复制真实目录到本 quick 目录的 checkpoint-final，执行首次 apply。
4. 回读正文、来源、spec、variants、media、关系、审核 hash、revision 和 readiness。
5. 重放同一命令，确认所有目标 `noop`，再确认真实目录 snapshot/hash 不变。
6. 运行定向测试、Biome、TypeScript、diff 检查；仅提交本批次拥有的文件。

## 验收阈值

- pack 数：6（1 品牌 + 5 型号）
- 每个型号正文：至少 5,000 Unicode 字符
- 每个型号来源及独立组：至少 10
- 每个型号 variants：至少 3
- 每个型号 primary media：恰好 1，且为带免责声明的原创 SVG
- 每个型号 `made_by` / 品牌 `reverse`：各恰好 1
- 当前 hash 下 fact/language/media/publication：全部 approved
- `content_revision = reviewed_content_revision`，contract version 3，`publishable=1`、`blocker_count=0`
- 首次发布后重放：五个型号均 `noop`
- 真实资料库前后 snapshot/hash：完全不变

## 证据位置

- 研究总表：`.planning/content-research/research-wancher-world-tree-phase423.md`
- 五篇正文：`.planning/content-research/*phase423.md`
- 应用脚本：`scripts/apply-phase423-wancher-world-tree-refresh.ts`
- 强制数据包：`scripts/data/phase423-wancher-world-tree-refresh.ts`
- 定向测试：`tests/content/phase423-wancher-world-tree-refresh.test.ts`
- owned copy：`.planning/quick/260803-uwk-wancher-world-tree-refresh-owned-checkpoint/checkpoint-final-r5/fpkg.db`
