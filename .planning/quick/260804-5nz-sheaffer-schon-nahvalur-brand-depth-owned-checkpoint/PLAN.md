# Phase 446：Sheaffer、Schon DSGN、Nahvalur 品牌页深化

## 目标

在 Phase 445 的 owned checkpoint 上继续深化三个已有品牌页，补足品牌历史、公开型号导航、版本边界、维护与选购入口；不新增重复品牌／型号，不触碰真实 `data/fpkg.db`。

## 资料与身份边界

- Sheaffer 复用已来源化的 Balance、Snorkel、PFM、Tuckaway、Targa 与现有公开型号包，并补读 Sheaffer 官方历史／当前目录；不把 White Dot、inlaid nib 或 Touchdown 机制误当作单一型号。
- Schon DSGN 复用官方 Pocket Six 产品／集合页和独立评测；Pocket Six 的铝、黄铜、阳极氧化和多色页面保留为版本／材料边界，不把圆珠、滚珠并入钢笔实体。
- Nahvalur 复用官方系列／集合页、Original Plus、Schuylkill、Nautilus 与别名资料，并补读当前官方系列首页；Original、Original Plus、Schuylkill、Nautilus、Nautilus Ti 只按已有 canonical 页面和 family 边界导航。

## 实施边界

1. 从 Phase 445 checkpoint 复制出本阶段唯一 owned `checkpoint.db`；apply 强制非 symlink、非 remote、真实 catalog snapshot 不变。
2. 三个 brand pack 均经 `recordEntityContentReview` 的 fact/language/media 审核后调用 `publishEntity`；不直接写 published 状态。
3. 只更新三个已有品牌实体的正文、来源化 claims、timeline 和品牌反向导航；不猜造实体 ID，不重复创建型号。

## 验收

- 三份 markdown 至少 3500 字符，发布正文至少 2600 字符；每个品牌至少四条 approved references、三组独立来源、一个 approved primary media。
- 已发布 `made_by` 型号的品牌反向链接恰好一条；身份、slug、公开状态和内容 hash 可回读，replay 为 noop。
- 定向测试、Biome、`git diff --check`、TypeScript 基线检查完成；本阶段不新增基线错误。
- checkpoint SHA-256 与真实 `data/fpkg.db` SHA-256 分开记录；真实库及其 WAL/SHM 快照保持不变。
