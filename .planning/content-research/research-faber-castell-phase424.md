# Phase 424：Faber-Castell 普通 Fine Writing 核心型号深化研究

## 范围

本批只深化已有实体，不新增品牌或型号：`Faber-Castell Ambition`、`Faber-Castell e-motion`、`Faber-Castell Ondoro`、`Faber-Castell NEO Slim`、`Faber-Castell LOOM`，以及品牌页 `辉柏嘉 Faber-Castell` 的系列导航。Graf von Faber-Castell Classic 不在本批重写，避免把普通 Fine Writing 与高端线混成一个身份。

## 身份与关系结论

- 五个型号的 `brand_entity_id` 都保持 `xVHzH0mMviM4`，不新建重复实体。
- 每个型号只保留一条指向 Faber-Castell 的 `made_by`，品牌页保留反向导航关系。
- Ambition 的拉丝不锈钢、树脂、木杆和 All Black 是材料/表面 variant；e-motion 的木杆、Pure Black/Pure Silver 与树脂同理。
- Ondoro 的 graphite black 珍贵树脂与 smoked oak 烟熏橡木共享六角轮廓，但不共享重量、触感、维护和照片。
- NEO Slim 是普通 Faber-Castell 的细身金属线，不属于 Graf von Faber-Castell；LOOM 的钢笔、圆珠和滚珠是不同书写模式。

## 官方资料

1. [Faber-Castell Fine Writing products](https://www.faber-castell.com/products)：系列导航，用于确认普通 Fine Writing 的分线。
2. [Ambition Stainless Steel 148390](https://www.faber-castell.com/products/AmbitionStainlessSteelfountainpenMsilver/148390)：拉丝不锈钢、镀铬帽/握位、弹簧夹、不锈钢尖和 cartridge/converter 的具体 SKU。
3. [e-motion collection](https://www.faber-castell.com/products/e-motion)：bulbous shape、弹簧夹和材料路线。
4. [e-motion Pure Black 148622](https://www.faber-castell.com/products/emotionPureBlackfountainpenEFblack/148622)：阳极氧化铝、黑色表面和黑色不锈钢尖。
5. [e-motion wood 148221](https://www.faber-castell.com/products/emotionwoodfountainpenFblack/148221)：染色梨木和 F 尖版本。
6. [Ondoro collection](https://www.faber-castell.com/products/ondoro)：六角树脂、graphite black 与 smoked oak 的系列边界。
7. [Ondoro graphite black 147812](https://www.faber-castell.com/products/OndorographiteblackfountainpenEFblack/147812)：树脂版 EF/F/M/B 与 cartridge/converter。
8. [Ondoro grey-brown 147840](https://www.faber-castell.com/products/OndorofountainpenMgreybrown/147840)：M 尖 SKU、可选尖幅和包装语境。
9. [NEO Slim collection](https://www.faber-castell.com/products/neo-slim/24-24-11-fountain-pen)：细身金属产品线。
10. [NEO Slim black 342300](https://www.faber-castell.com/products/NeoSlimmetalfountainpenMblack/342300)：黑色金属、黑色不锈钢 M 尖和墨囊/converter 组合。
11. [NEO Slim press note](https://www.faber-castell.com/service/press/pm-NEO-slim)：stainless、matt、polished、painted metal、rose details 及 EF/F/M/B 线索。
12. [LOOM collection](https://www.faber-castell.com/products/loom)：钢笔、圆珠、滚珠的模式边界。
13. [LOOM fountain pen filter](https://www.faber-castell.com/products/loom/24-24-11-fountain-pen)：Metallic、Gunmetal 和四种线宽的钢笔入口。
14. [Faber-Castell Fountain Pen FAQ](https://www.faber-castell.com/service/frequently-asked-questions/faq-fountain-pens)：墨囊、converter、清洁频率和室温清水维护。
15. [Faber-Castell instruction manual](https://www.faber-castell.com/-/media/Faber-Castell-new/PDF/en/Instruction_manual.ashx?sc_lang=en-Glob)：通用书写工具的清洁与使用说明，具体包装仍按 SKU 核对。

## 可靠二级资料

- [SBREBrown e-motion Pure Silver review](https://www.sbrebrown.com/2020/11/faber-castell-e-motion-pure-silver-fountain-pen-review/)：只用于样本的握持和重量观察，不把单支体验提升为统一规格。
- [Drop Ondoro measurements](https://drop.com/buy/faber-castell-ondoro/details?mode=shop_open)：区分树脂与 smoked oak 的单品实测范围，不覆盖全系列。
- [The Pen Addict LOOM review](https://www.penaddict.com/blog/faber-castell-loom-fountain-pen-review)：记录金属笔身、握位和随盒墨囊的样本体验，不替代官方型号字段。

## 内容与验收设计

- 每个型号正文以具体结构、材料 variant、笔尖/上墨、维护、购买核对和同品牌比较组成自然中文长文；正文不得出现内部实现字段。
- 复用 Phase 58 已有原创 factual SVG，明确示意图、非产品照片、非比例和非颜色证明。
- 每个型号至少八个独立来源组、三种以上 variant、九项以上规格证据；品牌页补充普通线与高端线的导航来源。
- 只在 owned checkpoint copy 中运行 `recordEntityContentReview` 与 `publishEntity` 的既有发布链路；首次应用后重放必须全部 `noop`。
- 定向测试检查身份、品牌关系、自然正文、来源组、spec evidence、媒体主图、审核 hash、publication/readiness 与真实数据库快照不变。
