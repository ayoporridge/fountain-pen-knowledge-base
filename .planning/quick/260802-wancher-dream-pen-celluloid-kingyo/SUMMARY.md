# Phase 360 结果摘要

## 内容

- 新增 `.planning/content-research/wancher-dream-pen-celluloid-kingyo-phase360.md`：KINGYO 的独立身份、Traditional Celluloid 金红卷纹、京都 roll-up、钛螺纹、925 银环、family 尖材边界、供墨核对、维护与选购。
- 新增 `.planning/content-research/wancher-brand-phase360.md`：Wancher 品牌导航增加 KINGYO，保留与 SAKURA、Bekko、Momiji、Seto 和其他材料系列的分流。
- 新增原创 factual SVG、`scripts/data/phase360-wancher-dream-pen-celluloid-kingyo.ts`、apply 脚本与定向测试。

## 预期 checkpoint 证据

- 真实 `data/fpkg.db` 只做源快照；迁移与 apply 只操作本批 checkpoint 下的副本。
- 首次 apply 应发布 Wancher 品牌与 KINGYO；第二次 replay 应为 noop。
- KINGYO 应有一个 `made_by`、一个品牌 reverse、5 个 variants、至少 8 个引用、至少 8 个 approved spec evidence、1 个 primary media 和四类 approved review。

## 实际 checkpoint 证据

- 真实 `data/fpkg.db` 与保护快照 SHA-256 均为 `526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`；apply 后只改变 checkpoint 副本，副本 SHA-256 为 `6bd846455cf8b41515cad7e87989f1e82a718bbe494bd8d37c5d0f8eec85af90`。
- 第一次 apply：Wancher 品牌与 KINGYO 均为 `published`；KINGYO 内容 hash 为 `sha256:v3:a70e1f130887dade23a90628c3b3cc8bc531a8151ab9bb06df9ac1894c29e117`。
- 第二次 replay：品牌与 KINGYO 均为 `noop`，内容 hash 不变。
- checkpoint SQL：KINGYO 正文 3833 字符、品牌正文 1645 字符；`made_by=1`、reverse=1、variants=5、approved spec evidence=9、references=8、approved primary media=1；fact/language/media/publication 四项均 approved。
- 定向测试 `pnpm exec tsx --test tests/content/phase360-wancher-dream-pen-celluloid-kingyo.test.ts`：1/1 通过；真实库保护快照未变化。

## 未完成事项

本批不等于全量 goal 完成；仍需继续补齐真正未覆盖的品牌／型号，最后才进行正式迁移、全量检查、真人遍历、部署和线上逐条复查。
