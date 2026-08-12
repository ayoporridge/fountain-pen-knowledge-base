# Phase 604：五条 retired identity 的终态裁决

## 范围

本轮复核 Phase 603 之后仍被列为“待研究”的五条身份：Banju、YiSiHua、Shanghai、Saier，以及混合名称 `SKB派顿 F10 / F21`。目标不是把所有 retired 行重新公开，而是区分“已有正面证据的真实品牌／型号”“可以安全归并的旧名称”和“仍没有可验证 successor 的遗留壳”。

## Banju：恢复品牌并发布 Doer

`半句 (BanJu)` 不是空品牌。Made-in-China 上的苏州半句文化创意有限公司自述页把企业列为 Manufacturer/Factory，展示多支 fountain pen，并以 BANJU 作为品牌表达；该页面的 `Account Registered in: 2019` 只能作为平台账户时间锚点，不能写成品牌创立年份。

台湾专营文具零售商 TY Lee 明确列出 `半句 BANJU`、型号 `BANJU Doer`，并给出 139 × 14.8 mm、32 g、铝制金属笔身、不锈钢 F 尖、吸墨器和旋转笔帽等商品规格。Fountain Pen Network 的独立实物帖同时辨认 Doer，记录 #26／#5 双配色钢尖、2.6 mm 墨囊／转换器、三种颜色、两种表面纹理、可深度后插和偏细握位；体验与称量只代表该作者样本。

因此恢复既有 Banju brand ID，并新增 `banju-doer` canonical pen。Candy、White Sugar、Ferris Wheel、Star Shark／F-Plan 等只保留为后续覆盖线索，不在缺少同等来源深度时顺手批量建页。

## YiSiHua：归并到 Asvine

`意斯华` 不是需要并列公开的第二个品牌。现有数据库已经把旧 `/pen/意斯华-p36` 永久指向 `/pen/asvine-p36`；公开商品记录也直接使用“意斯华 Asvine P36”这一组合名称，而 Asvine 当前品牌资料把 P36、P20、V126、V200 等列在同一产品体系内。

因此保留 `yisihua` 实体为 retired lineage donor，但把 `/brand/yisihua` 从 hard-404 改为 `/brand/asvine` permanent redirect，并写入 `merge_into` taxonomy action。此动作只解决旧入口，不把不可靠的公司沿革或所有中文渠道商品描述写进 Asvine 正文。

## Shanghai：继续 terminal retired

`上海 (ShangHai)` 只有城市级宽泛名称，没有型号、反向关系或可验证的独立钢笔品牌目录。检索会混入上海牌手表、钢琴、香烟以及“上海制造”的其他钢笔企业；这些结果不能证明存在一个 canonical `ShangHai` 钢笔品牌，也不能安全指向 Hero、Jinxing、Duke、Jinhao 或其他上海企业。

因此 `/brand/shanghai` 继续 hard-404。未来若出现带商标、制造者和型号目录的正面档案，应新建精确 identity action，而不是把城市名当作品牌。

## Saier：继续 terminal retired

`塞尔 (Saier)` 没有可核实的品牌目录或整笔型号。数据库中的 `塞尔 3.0 EF 尖` 只是一个分离的 nib 研究线索；一个可能的笔尖商品名不能反向证明同名品牌，更不能推断制造商。外部检索未找到能与该 nib 同时对上的官方、目录或可靠零售档案。

因此品牌页继续 hard-404，nib 线索保持独立，不建立 made_by 或品牌反链。

## SKB派顿 F10／F21：继续 terminal retired

台湾 SKB 已经有独立品牌页和 RS-301N、ES-520、RS-501i 等具体型号内容；但 `SKB派顿 F10 / F21` 同时混入“派顿／Penton”与两个编号。现有唯一来源只是搜索索引，无法证明 F10、F21 是一支组合型号、两个 sibling、套装、颜色代码，或属于台湾 SKB。

因此该 mixed pen 继续 retired hard-404，不指向 SKB 品牌或任何现有型号。只有直接目录、包装、制造商页或可复核实物档案能同时证明品牌与编号关系时才重开。

## 来源

- [Suzhou Banju Cultural Creative Co., Ltd. manufacturer profile](https://www.made-in-china.com/showroom/banju-cultural/)
- [TY Lee：半句 BANJU DOER 实践家直条纹钢笔](https://www.tylee.tw/index.php?path=652&product_id=12599&route=product%2Fproduct)
- [TY Lee：半句 BANJU DOER 实践家菱格纹钢笔](https://www.tylee.tw/index.php?path=652&product_id=12596&route=product%2Fproduct)
- [Fountain Pen Network：Two Banju](https://www.fountainpennetwork.com/forum/topic/379481-two-banju/)
- [Asvine brand and product overview](https://asvinepens.com/)
- [意斯华 Asvine P36 商品记录](https://tao.hooos.com/goods_o2VkWZ3CrtdzeGXiDD7FntN-gQXnn3spX38jPV8Ta.html)
