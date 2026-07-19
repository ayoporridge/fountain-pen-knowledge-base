---
phase: quick
plan: 260719-c1p
status: complete
completed_at: 2026-07-19T11:02:05+08:00
commits:
  - 6ade8a4
  - 74a0672
  - c1f5088
  - 79e07f5
---

# Quick Task 260719-c1p Summary

## Outcome

- Sailor：发布 Professional Gear Slim 21 `11-2151`、Profit Realo 18 `11-1853` 与 Professional Gear Anchor `11-5080/5081/5082`；三页均按 2026 日本官网目录拆清笔尖、结构、尺寸与相邻型号边界。
- Parker：把 1921–1938 vintage Duofold family、1939–1940 Geometric、1940–1948 Striped／Duovac 与 1987/88 起的现代 Duofold Classic Centennial 拆成四个独立页面，并在品牌正文中明确代际导航。
- Pelikan：发布仅对应 2019 Special Edition 的 M1005 Stresemann、1982／1997 两代 M400、含八个银饰版本的真正 M605 家族，以及分列 2018 Black 与 2025 Blue 的 M815 Metal Striped。

## Evidence and identity fixes

- Sailor 三页使用当前日本官网产品号和发布日期，区分 PGS 21 与旧 PGS 14K／Mini、Profit Realo 18 与旧 21K／Pro Gear Realo，并把 Anchor 的三种饰件 SKU 作为同一结构的 variants。
- Parker 四页以 Parker 1939／1940 官方目录档案和可靠历史资料锁定年代、外形、上墨结构与现代 cartridge／converter 边界；不再用现代 Centennial 规格覆盖 vintage Duofold family。
- M1005 的 EF、F、M、B 四个尖号绑定八条官方 MAM 产品记录；德国制造、活塞家族、1.35 ml、发布日期、材料与停产状态分别绑定适用来源，单个 `810487` 不再冒充整款唯一产品号。
- 八条 MAM 记录只证明每个尖号各有两条产品记录；具体市场／包装差异不从总表外推，并有正反向回归断言防止恢复成“单笔／带盒”猜测。
- M400 的 Old Style 单色尖、1997 后双色尖、当前 EF/F/M/B、活塞、1.3 ml 与现行状态均逐值绑定来源；日本 `#500`／`M500` 只保留为特定市场标记。
- M605 分列 2003 Solid Dark Blue、2012 Black、2012 Blue Striated、2013 Marine Blue Transparent、2017 White-Transparent、2019 Stresemann、2021 Green-White、2022 Tortoiseshell-Black；White-Transparent 的材料收窄为“透明笔杆＋白色树脂”，不把无来源的 cellulose acetate 外推给该版。
- M605 的 2017／2019／2021／2022 笔尖证据全部进入 field evidence 与冲突成员；历史版本状态和 2025 仍在目录的 Stresemann 分别绑定收藏生产表与官方目录。
- M815 保留同版来源差异：2018 Black 38 g／约 37.1 g，2025 Blue 官方 36 g／公布资料 37.13 g；不同版本的重量不合并成家族共同值。

## Media review

- 十一页均使用本站原创、明确标注“非产品照片”的事实图；十一张 SVG 原文件及统一渲染 PNG 的哈希均互不重复。
- 1200×675 或 1600×900 逐张渲染复核无裁切、文字重叠、白边伪影或内容越界；M605 八个版本卡片完整可读。
- `xmllint` 对十一张 SVG 全部通过；自然中文微调后的 M1005、M605、M815 再次渲染通过。

## Verification

- `tests/content/phase33-sailor-2026-current.test.ts` — PASS
- `tests/content/phase34-parker-duofold.test.ts` — PASS
- `tests/content/phase35-pelikan-souveran-variants.test.ts` — PASS
- Phase 35 独立内容复审原先发现的六组证据阻断全部关闭，复审结果 6/6 PASS，并由复审者独立重跑测试通过。
- M1005 SKU 追加 live-source 复核发现的包装差异越界亦已关闭；修正后的 Phase 35 test 再次 PASS。
- `pnpm exec tsc --noEmit` — PASS
- scoped Biome — PASS
- eleven SVG files via `xmllint --noout` — PASS
- `pnpm build` — PASS（Next.js 15.5.18，18 个静态页面）
- 三组重复应用均返回 `noop`，各自保护的旧页面、来源注册表与发布 revision 保持不变。
- 验证前后真实 `data/fpkg.db` SHA-256 均为 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`；WAL／SHM 均不存在。

## Task commits

- `6ade8a4 feat(content): publish Sailor 2026 current models`
- `74a0672 feat(content): distinguish Parker Duofold generations`
- `c1f5088 feat(content): publish Pelikan Souveran variants`
- `79e07f5 fix(content): bound M1005 product records`

## Scope boundary

- 本批没有连接或部署生产，没有恢复搜索或 LLM，也没有新增 runner、Playwright、AI／通用验收或 readiness 基础设施。
- 本批完成十一页及相关身份修复，不代表 69 个品牌、236 个既有型号或最终扩充后的全库已经补完；正式迁移、全量页面自动检查、真人遍历、生产部署与线上逐条复查仍在总 `/goal` 内。
- `.planning/quick/260719-665-montblanc-writers-edition-patron-of-art-/` 未修改、未暂存、未提交。

## Next content wave

- Parker：Parker 25、T1、50 Falcon、100，随后 Frontier、Premier、Victory。
- Sailor：King of Pens 分型、Professional Gear／1911 导航节点、长刀研从钢笔型号改为 nib／concept，并清理剩余混名重复。
- Pelikan：M200 与 Twist P457；继续核对尚未来源化的历史／特别版条目。

## Self-check: PASSED

三个主内容提交与一个 M1005 来源边界修正只包含对应研究、媒体、data／wrapper／test；GSD 文件单独收口，遗留 Quick 665 未进入任何提交。
