---
quick_id: 260722-j4w
status: complete
date: 2026-07-22
product_commit: 53756e2
---

# Wancher 地域漆艺六型号批次总结

一次发布六个此前缺失的 Wancher Dream Pen 地域漆艺具体型号：Aizu Urushi Aka Tamenuri、Aizu Urushi Ao、Echizen Urushi Sakura Zukiyo、Echizen Urushi Temari、Echizen Urushi Omoide Sakura 与 Kyoto Urushi Kasane no Iro Ume。每页都有超过 2,000 Unicode 字符的自然中文正文、当前配置、工艺边界、版本差异、维护与选购建议，以及明确标注为非产品照片的本站原创事实图。

## 关键身份与证据决策

- Aizu Aka 与既有 Wajima True Urushi Aka Tamenuri 分开；前者是 ABS 与会津漆工艺，后者是 ebonite 与轮岛体系。
- Aizu Ao 只采用 exact 商品页支持的深蓝配方；页面中的 Tamamushi-nuri 与银粉说明仅作背景，不冒充 Ao 的具体工艺。
- Sakura Zukiyo 与 Omoide Sakura 保持两个 canonical SKU；前者为 ABS／Kindai Maki-e，后者为 ebonite／Oshita Maki-e，并保留 2023 Kawazu Zakura 前身关系。
- Temari 按官网明确的 screen-print Kindai Maki-e 记录，不改写成全手绘传统高莳绘。
- Kyoto Ume 保留 ebonite feed 仅兼容 JoWo nib 的官方限制；平安时代配色灵感不被误写为型号发布年代。

## 发布与保护结果

Phase 138 在一个 caller-owned checkpoint 内回放既有 Wancher 品牌、Dream Pen 导航与十个已发布具体型号内容包，再新增六个 pen 与精确 `made_by`／reverse 关系。品牌非拓扑 payload、Dream Pen 导航及既有具体型号完整 digest 均受保护。六个新型号分别完成 fact、language、media review 后通过 `publishEntity` 发布。

定向回归覆盖 remote／reviewer／repo guard、hardlink、mixed terminal、alias/source collision、首次发布、noop、tamper、review hash、旧实体保护和真实数据库快照。真实数据库没有被试写或迁移。

## 验证

- Phase 138 定向测试：PASS 1/1（约 151 秒）
- TypeScript：PASS
- Biome：PASS
- 六张 SVG XML：PASS
- cached diff：PASS
- 真实 DB SHA-256：`85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`

该批次完成不代表全量 goal 完成；其余内容差集、正式迁移、全量自动检查、真人页面遍历、部署和线上复查仍未完成。
