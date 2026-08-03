# Phase 447：Picasso、Platinum、Montblanc 品牌页深化

## 目标

在 Phase 446 owned checkpoint 上深化三个已有品牌页，补足品牌历史、系列导航、版本边界、维护和选购入口；复用已有 Picasso 916、Platinum #3776 及 Montblanc 144／146／149／22 等内容包，不重复建实体，不触碰真实 `data/fpkg.db`。

## 资料与身份边界

- Picasso 以上海帕弗洛／毕加索官网、916 Malaga 产品页、官方售后和独立 916 样本为锚；品牌宣传的 1988／2003 时间线与 PS-916 SKU 保持不同层级。
- Platinum 以官方公司页、#3776 Century、Slip & Seal、历史时间线和现有低价／Izumo／Preppy 型号包为依据；#3776、Preppy、Plaisir、Prefounte、Izumo 不合并。
- Montblanc 以官方书写工具目录、Meisterstück 1924、工艺与服务资料及已有 144／146／149／学生龙 22 页面为依据；“大班”“学生龙”只作具体型号或旧称，不当作品牌同义词。

## 实施边界

1. 只从上一阶段 checkpoint 复制本阶段 owned `checkpoint.db`；apply 拒绝 remote、符号链接、真实库和硬链接，并核验真实 catalog snapshot 不变。
2. 三个 brand pack 走 `recordEntityContentReview` 的 fact/language/media 审核，再调用 `publishEntity`；不直接把 publication 状态写成 published。
3. 只更新已有品牌正文、来源 claims、timeline 与公开型号反向导航；不猜造 ID，不改写受保护的 Montblanc Writers Edition quick 目录。

## 验收

- 三份 markdown 至少 3500 字符，发布正文至少 2600 字符；每个品牌至少四条 approved references、三组独立来源、一个 approved primary media。
- 已发布 `made_by` 型号的品牌反向链接恰好一条，身份／slug／审核 hash 可回读，replay 为 noop。
- 定向测试、Biome、`git diff --check`、TypeScript 基线检查完成；真实库 SHA-256 与阶段前一致。
