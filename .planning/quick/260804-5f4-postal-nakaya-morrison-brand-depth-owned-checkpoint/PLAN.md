# Phase 445：Postal、Nakaya、Morrison 品牌页深化

## 目标

在不写入真实 `data/fpkg.db`、不新增重复实体的前提下，深化已有 Postal Pen Company、Nakaya、Morrison 三个品牌页。利用现有型号包与来源，补足品牌历史／工艺／命名层级、代表型号导航、维护、选购和后续研究入口。

## 来源与身份边界

- Postal 复用 PenHero、Antique Digger、OneBid、World Radio History 与原创图，区分邮购公司、Postal Reservoir、Sager 和后世同名商品。
- Nakaya 复用官方品牌入口、尺寸表、产品页、订单与维修公告及既有专业旁证，区分 Cigar／Writer、Piccolo／Portable、漆面／装饰和产品号。
- Morrison 复用 Morse Museum、FountainPen.it、PenHero、Munson Pens、Peyton Street Pens、Vintage Pen Doctor 与原创图，区分纽约早期、Roxy 等关联名称和战时 Patriot。

## 实施边界

1. 只加载三个已有品牌实体，保持 canonical slug、已有公开型号、图片和 `made_by` 关系。
2. 通过 `recordEntityContentReview` 的 fact/language/media 审核，再调用 `publishEntity`；不直接修改 published 状态。
3. apply 脚本强制 owned copy、非 symlink、非 remote，并核验真实 catalog snapshot 不变。
4. 定向测试在 disposable copy 中运行；本目录的 `checkpoint.db` 只作阶段证据，不提交。

## 验收

- 三个 markdown 文件长度至少 3500 字符，发布正文至少 2600 字符；每个品牌至少四条 approved references、三组独立来源、一个 approved primary media。
- 只深化品牌正文和来源化 claims，不创建品牌或型号重复实体；已有 published 型号的反向导航恰好一条。
- 定向测试、Biome、`git diff --check`、TypeScript 基线检查完成；真实 `data/fpkg.db` SHA-256 保持不变。
