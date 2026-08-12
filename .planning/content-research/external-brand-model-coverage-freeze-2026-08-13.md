# 外部品牌与代表型号覆盖冻结（2026-08-13）

## 目的与边界

本清单不是声称收录世界上每一家做过钢笔的公司，而是给本轮正式迁移设定可复核的完成边界。参照 Goldspot、Goulet、Atlas Stationers 与 Pen Chalet 的现售品牌／钢笔目录，再回到品牌官网核对身份和稳定产品线。只有同时进入多家专业钢笔零售渠道，或兼具稳定官网产品线与显著历史身份的缺失品牌，才阻塞本轮迁移。

地区微型工作室、主要经营墨水或综合文具而只有边缘钢笔 SKU、单店短期上架、一次性产品、缺少稳定官方身份的候选，保留为后续扩展，不把“全量修复”变成没有终点的互联网品牌枚举。

冻结基线为 Phase 604 caller-owned checkpoint：115 个公开品牌、734 个公开 pen 节点、851 个公开且 content-ready 实体；公开 blocker 为 0。真实 `data/fpkg.db` 不参与本次差异试验。

## 本轮必须补入

| 品牌 | 纳入理由 | 代表型号 | 主要事实来源 |
|---|---|---|---|
| PENLUX | Goldspot、Atlas 等专业渠道可见；官网说明 1999 制造背景、2015 起自有品牌与台湾制造 | Masterpiece Grande Deep Sea | PENLUX About Us 与 exact product page |
| Ferris Wheel Press | Goldspot／Pen Chalet 等多渠道有多款现售钢笔，不只是墨水品牌 | Carousel Feathered Flight | 品牌 exact product page；Pen Chalet 系列页 |
| Tom's Studio | Goldspot／Atlas 等渠道有稳定钢笔系列，官网给出完整规格与维护边界 | Studio Fountain Pen | 官网 Studio FAQ 与产品页 |
| Radius 1934 | 1934 年历史身份、2019 年复兴、官网当前有 Settimo／Superior／Autarchica 三条稳定系列 | Settimo Matte Black | Radius 品牌历史页、exact product page 与 Pen Chalet |
| Hinze Pen Company | Atlas 与 Pen Chalet 均有现售，官网有 14 个标准 fountain-pen models；手工定制身份稳定 | Elementar | Hinze About Us、Elementar exact page、Atlas／Pen Chalet |

以上五个品牌各补一个能够解释品牌定位、且具稳定 exact scope 的代表型号。颜色、合作款、笔尖选项只作为 variant，不把每个颜色 SKU 误建成独立型号。

## 不阻塞本轮迁移的候选

| 候选 | disposition | 原因 |
|---|---|---|
| Kakimori | 后续扩展 | 官网确有 Aluminium Fountain Pen，但品牌主体为墨水、纸品和书写体验商店；当前缺失不造成主流钢笔品牌谱系断层。 |
| TRAVELER'S COMPANY | 后续扩展 | Brass Fountain Pen 是稳定且有趣的单品，但品牌主体是 notebook／travel stationery，单一附属钢笔不阻塞本轮。 |
| Zebra | 后续扩展 | 欧美市场有一次性 Fountain Pen；日本官网当前主产品导航未把钢笔列为核心系列，不能用海外一次性 SKU 推导完整品牌页。 |
| Nettuno 1911 | 后续研究 | 当前零售可见度有限，且与 Maiora／复兴主体关系需要单独身份研究；本轮不仓促复制一条营销页。 |
| 地区单人工作室与单店 exclusive | 后续扩展 | 没有跨渠道稳定型号或历史重要性证据，不作为正式迁移 blocker。 |

## 已有主流代表型号抽查

外部目录的主流推荐项已在 checkpoint 中存在，包括 Kaweco AL Sport／Classic Sport、Leonardo Momento Zero／Momento Magico、Noodler's Ahab、Edison 代表系列、Pilot／Sailor／Pelikan／Lamy／Parker／Waterman 等深度批次。它们不重复建实体；后续发现某个颜色或零售 exclusive 时，默认归入既有 family／variant，而不是新增同名型号。

## 冻结规则

本清单五组完成并通过 checkpoint 回放后，外部新增范围冻结。只有发现以下情况才允许在正式迁移前重开：现有公开页身份错误、公开品牌缺少任何有效型号反链、公开型号没有可核实正文／来源／主图，或有两个以上专业目录共同证明缺失的是市场主流且稳定的钢笔系列。其余候选进入上线后的增量 backlog，不再阻塞全站验收。

## 参照目录与官网

- Goldspot Brands: https://goldspot.com/collections/brands
- Goulet Shop by Brand: https://www.gouletpens.com/collections/shop-by-brand
- Atlas Fountain Pens: https://www.atlasstationers.com/collections/fountain-pens
- Pen Chalet Brands: https://www.penchalet.com/brand.aspx
- PENLUX About Us: https://www.penlux.com.tw/about-us/
- PENLUX Masterpiece Grande Deep Sea: https://www.penlux.com.tw/product/deep-sea/
- Ferris Wheel Press Carousel: https://ferriswheelpress.com/products/the-carousel-fountain-pen-feathered-flight
- Tom's Studio FAQ: https://tomsstudio.com/pages/studio-fountain-pen-faqs
- Radius brand history: https://www.radius1934.it/en/pages/il-brand
- Hinze About Us: https://hinzepens.com/pages/about-us
- Hinze Elementar: https://hinzepens.com/products/the-elementar
