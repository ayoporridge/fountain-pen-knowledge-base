---
quick_id: 260722-itm
status: complete
date: 2026-07-22
product_commit: 6386940
---

# Conklin 当代四型号批次总结

一次发布了四个此前缺失的 Conklin 当代基础型号：All American、Mark Twain Crescent Filler、Endura Deco Crest、1898 Misto。每个型号均有超过 2,000 Unicode 字符的自然中文正文、官方 primary、独立 professional secondary scope、当前规格、颜色 variants、维护与选购说明，以及一张明确标为非产品照片的本站原创事实图。

## 关键身份与证据决策

- All American 保留官方 5.5／5／6.75 in 长度，拒绝明显错误的 `Diameter: 2 in`；两篇评测的重量和毫米测量只属于各自样笔。
- Mark Twain Crescent Filler 作为现代 crescent／sac 型号发布，不与历史 Crescent 古董笔或 C/C 产品合并；`7.25 × 2 × 2.75 in` 作为包装式字段拒绝。
- Endura Deco Crest 以树脂芯和金属 filigree 为基础身份；Blue 商品页标题与复制的 Orange／Medium 正文冲突，保留 Blue SKU 身份但拒绝冲突描述。
- 1898 Misto 只覆盖 Misto Resin，Stabilized Wood 与 Spectra Fusion 不混入；混色纹理逐支变化，2025 自购样笔的 trim/stamping QC 观察不升级为全系故障率。

## 发布与保护结果

Phase 137 在一个 caller-owned checkpoint 中先重放 Phase 99 与 Phase 136，再一次新增四个 pen。每个 pen 建立精确 `made_by` 与 trigger-produced `reverse`，Conklin brand reverse 集合精确增加四项；Nozac、Glider、Duragraph 完整 digest 和品牌非拓扑 digest 前后不变。品牌与四个型号均按当前 content hash 完成 fact、language、media review，再经 `publishEntity` 发布。

定向测试覆盖 remote/reviewer/repo guard、hardlink、mixed/partial terminal、alias/source collision、首次发布、noop、tamper、review hash、旧实体保护和真实资料库快照。真实资料库未被 SQLite 打开写入或迁移。

## 验证

- `pnpm exec tsx --test tests/content/phase137-conklin-contemporary-batch.test.ts`：PASS 1/1（约 54 秒）
- `pnpm exec tsc --noEmit --pretty false`：PASS
- `pnpm exec biome check ...`：PASS（`scripts/data` 与 apply scripts 按仓库配置不纳入 Biome）
- 四张 SVG：`xmllint --noout` PASS
- `git diff --check`：PASS
- 真实 DB SHA-256：`85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`

该批次完成不代表全量 goal 完成；真实数据库正式迁移、全量页面检查、真人遍历、部署和线上复查仍在最终内容封板之后执行。
