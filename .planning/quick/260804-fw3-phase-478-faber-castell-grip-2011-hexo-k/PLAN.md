# Phase 478：Faber-Castell Grip 2011、HEXO 与 KACO SKY 百锋深化

## 目标

深化三个已有 canonical，不新建颜色、套装或代际重复实体：

- `phase139-faber-castell-grip-2011` / `faber-castell-grip-2011`；
- `phase139-faber-castell-hexo` / `faber-castell-hexo`；
- `WgPQyH1oYSEX` / `kaco-sky百锋`。

Grip 以官方 140900 Silver M 为规格锚点；HEXO 以官方 150540 Blue M 为规格锚点；SKY 以上海文采 2016-04-23 发布新闻和可靠礼盒规格为第一代锚点。三页均明确颜色、地区库存、礼盒附件和后续代际不应互相回填。

## 资料与正文

- Faber-Castell 官方 exact SKU、系列/Press 与 fountain-pen FAQ；Pencilcase Blog 的 Grip 样本评测；The Pen Addict 的 HEXO 样本评测；
- KACO 官方公司新闻、GeckoDesign 可靠零售规格、The Pen Addict 的 SKY/SKY II 代际观察；
- 正文增加自然中文的结构解释、书写场景、维护、故障排查、版本辨识和选购建议；图片复用既有 factual SVG，不冒充产品照片。

## 执行与验收

1. 以 Phase 477 checkpoint 为输入，复制到本批 caller-owned checkpoint；
2. 通过 `recordEntityContentReview` 的 fact/language/media 审核与 `publishEntity` 发布；
3. 核验每个型号唯一 `made_by` 与品牌反向 `reverse`；
4. 定向测试断言远程环境拒绝、正文/来源阈值、媒体、审核、publication gate、replay noop 和真实 DB 快照保护；
5. 运行 library contract、质量/覆盖审计与 SQLite 完整性检查；
6. 提交前只暂存本批研究、data/apply/test/PLAN/SUMMARY，排除 checkpoint、其他 research、`.next-phase*` 与受保护 Montblanc quick 目录。

## 明确边界

这是三条低信息量 canonical 的内容深化，不代表全量品牌/型号修复完成，也不执行真实 `data/fpkg.db` 迁移、生产部署或线上遍历。
