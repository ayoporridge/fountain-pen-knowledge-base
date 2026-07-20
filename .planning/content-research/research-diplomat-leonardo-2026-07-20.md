# Diplomat 与 Leonardo：六个基础型号的内容制作研究卡（2026-07-20）

## 结论先行：这里有六条型号线，不是六个可以随意互换的“颜色名”

建议在知识图谱中将下列六条作为**独立的钢笔型号/系列实体**：

| 品牌 | 建议实体 | 2026-07-20 可见状态 | 最重要的身份边界 |
| --- | --- | --- | --- |
| Diplomat | Aero | 官网在售 | Zeppelin 灵感的长椭圆金属笔身；同一型号线内有铝、黄铜、钢及不同表面处理，不能用一个重量覆盖全线。 |
| Diplomat | Excellence A2 | 官网仍列售；同时已有升级线 Excellence A+ | A2 是按压式 Soft Sliding Click 帽的金属笔，不是 2026 年 A+ 的螺纹帽。 |
| Diplomat | Elox | 官网仍列售 | 基于 Aero DNA、双阳极氧化的铝笔身；名称来自德语 *eloxieren*，不是 Aero 的颜色版本。 |
| Leonardo | Momento Zero（MZ） | 官网在售 | 2017 年末的常规 cartridge/converter 型号；与更大的 Momento Zero Grande/MZG 及 MZG 2.0 不是同一供墨平台。 |
| Leonardo | Furore | 官网在售 | Amalfi/Furore 灵感的 cigar 轮廓；常规 Furore 为旋入 converter/cartridge，Furore Grande 则必须另拆。 |
| Leonardo | MZG Mosaico | 官网在售 | **Momento Zero Grande 的 Mosaico 支系**，编号但不限量、大活塞供墨；不能把它写成 Momento Zero/Furore 的普通 C/C 笔。 |

### 建模总原则

1. **型号、材质/表面和销售色分层**。例如 Aero Anodized、Aero Flame、Aero Oxyd、Aero Rhomb 是同一 Aero 架构下差异很大的完成品；若站点需要先有一个可读的入口，先建立 `Diplomat Aero` 基础页，再把精确材质/表面作为可点击 variation，不要把 Black/Orange、Marrakesh 等每个色都建成“新型号”。
2. **笔尖不是可随手合并的装饰项**。官网同时销售钢尖、14K 尖的 Aero、Excellence A2、Elox；Leonardo 又有钢尖、14K、Elastic、Stub 等 SKU。正文必须写“此页的基础型号可随 SKU 配不同尖”，不能把某一张金尖商品照说成所有版本的标准尖。
3. **只把 fountain pen 写进该型号页的规格表**。同系列的 rollerball、ballpoint、mechanical pencil 可以作为“系列还有这些书写类型”的导航，绝不能借用它们的重量、笔芯或转动机构。
4. **现售状态是访问日状态**。本卡的“在售”只说明官方网站于 2026-07-20 仍列有可购买 SKU/集合；不等于所有旧色、旧尖或地区库存持续供应。

---

## 1. Diplomat Aero

### 身份、状态与不该混入的对象

- **建议页名**：`Diplomat Aero` / “迪普洛玛 Aero”。它是当前官网集合中仍可直接购买的系列，不应写为停产古董。官网的 Aero 商品档案同时有钢尖、14K 尖、Anodized、Lacquered、Flame、Oxyd、Rhomb、Stripe 等钢笔 SKU。
- 其识别点是流线型、纵向凹槽的椭圆金属笔身；品牌文案明确把造型指向 20 世纪早期 Zeppelin，而不是航空铝材的“军用复刻”。
- **不要混入**：Elox（同属铝与阳极氧化，但有独立双阳极结构）、Excellence A2（圆柱金属笔、不同帽机制）、Nexus（独立封闭供墨）、Aero rollerball/ballpoint/mechanical pencil。

### 可写入正文的可靠事实

- 常规 **Aero Anodized 钢尖款**官网规格为：闭帽 **140 mm**、插帽 **160 mm**、直径 **15 mm**、净重 **42 g**，铝材，配 converter 与两支短国际墨胆。笔尖选项为 EF/F/M/B，保固五年。
- **Aero Anodized 14 ct** 同尺寸、同铝笔身规格，但官网明确为 14K 金尖，不能把它的价格或尖材推给钢尖款；同样有 converter 与两支短国际墨胆。
- Aero 不是单一材质的“42 g 笔”。官方系列页列为 aluminium / brass / stainless steel，官网的 **Aero Oxyd 14 ct** 标为黄铜、**72 g**。因此基础页应把 140×15 mm 作为多数现售款的几何参考，并显著注记“重量随材质/表面而变”。
- 帽机制为 Diplomat 的 **Soft Sliding Click**。不要误称螺纹帽或磁吸帽；“click”也不等于可以从任何角度暴力扣合。

### 版本/笔尖/供墨边界

| 需要区分 | 正确写法 |
| --- | --- |
| Aero Anodized / Lacquered | 多为铝材，同一尺寸基准，可有钢尖或 14K 尖 SKU；颜色与涂层不自动改变型号页身份。 |
| Aero Flame | 官网称为 heated/flamed steel 的特别表面；不能用铝款的“轻量”体验或 42g 重量冒充它。 |
| Aero Oxyd | 黄铜氧化完成，官方 14K 商品页为 72g；是必须单列材质差异的 variation。 |
| Aero Rhomb / Stripe | 仍属 Aero，但纹理与商品 SKU 单独存在；不是 Elox 的双阳极环。 |
| 钢尖与 14K 尖 | 同名钢笔可配两种尖材。页面需要按商品/SKU 列 EF/F/M/B；不要凭“Diplomat 高端”默认金尖。 |

### 维护与选购：可做成页面的实用信息

- 使用瓶装墨前先确认随笔 converter 在；其结构接受短国际墨胆，官网商品说明也随附两支。长期搁置、换色时经 converter 以清水冲洗，避免墨水在 feed 内干结。
- 帽/笔身的阳极、漆面或火焰/氧化表面不宜用研磨膏、酒精浸泡或金属抛光布反复擦拭；如表面、帽闭合或笔尖到手即异常，先走经销商/品牌售后。后半句是保守编辑建议，不应伪装成官网保固条款。
- 选购时先问材质和重量：想要常规铝 Aero 的人可按 42g 参考；看中 Oxyd/Flame/Rhomb 的人应向卖家确认精确 SKU、尖材和重量。对“按压帽”偏好敏感者，最好实物试拔插，不要只因 Zeppelin 外观购买。

### 图片准入

- 首选官网 **exact SKU** 图：图中须能确认是 Aero fountain pen，不是同色 rollerball、圆珠或 14K 尖的近似产品。
- 单张 Anodized 铝款图不能作为 Flame、Oxyd、Rhomb 的事实图；若正文谈到 72g 黄铜 Oxyd，应配 Oxyd 图或明确文字标识，不能把黑橙 Aero 当代用图。
- 没有版权与型号双重确认时，只使用站内原创编辑示意图，标注“示意图，非产品照片”。

### 最少三条资料源（访问于 2026-07-20）

1. Diplomat, [Aero collection/shop archive](https://www.diplomat-pen.com/en/shop/diplomat/aero/) — 当前在售 SKU、钢尖/14K 尖及材质/完成差异的一级证据。
2. Diplomat, [Aero Anodized fountain pen](https://www.diplomat-pen.com/en/product/aero-anodised-fountain-pen/) — 42g 铝款、140/160/15mm、converter/国际墨胆与钢尖规格。
3. Diplomat, [Aero Anodized 14 ct fountain pen](https://www.diplomat-pen.com/en/product/aero-anodised-fountain-pen-14-ct/) — 金尖可选的独立 SKU 证据。
4. Diplomat, [Aero Oxyd 14 ct fountain pen](https://www.diplomat-pen.com/en/product-2/aero-oxyd-14-ct-fountain-pen/) — 黄铜与 72g 的反例，防止正文错误泛化。
5. Diplomat, [collections overview](https://www.diplomat-pen.com/en/collections/) — Zeppelin 设计灵感、Soft Sliding Click 与系列层级。

---

## 2. Diplomat Excellence A2

### 身份、状态与关键代际边界

- **建议页名**：`Diplomat Excellence A2`。2026-07-20 官网仍同时列有其钢尖/14K 尖的 lacqured、guilloché 等钢笔 SKU，因此不能简单标成停产。
- 它是全金属、弹簧夹、**Soft Sliding Click 按压帽**的常规书写型号；官网称其为旗舰/标志性型号，但该营销词不能代替规格。
- **Excellence A+ 是独立的升级线**：官网明说它是 A2 的 evolution，并具有金属螺纹、约三分之一圈的 screw cap。A2 页绝不能使用 A+ 的螺纹帽、guilloché 黑漆或“只转 1/3 圈”描述。
- 不要把 Excellence A（早期）、A2、A+、滚珠/圆珠混成一个历史型号。若库存中有模糊 `Excellence` 条目，应在 checkpoint 副本中先确认帽机制、SKU、发布日期与图片后再归类。

### 可写入正文的可靠事实

- 当前官网的 Lapis Black Matt Chrome 钢尖商品页给出：黄铜、闭帽 **136 mm**、插帽 **155 mm**、直径 **14.7 mm**、净重 **47 g**，配不锈钢尖、converter 与两支蓝色短国际墨胆，保固五年。
- 钢尖与 14K 双色尖是可选的独立前段/商品：官网配件页明确 A2 chrome trims 的钢尖前段与 gold trims 的 14K 双色尖前段都可按 EF/F/M/B 购买。因此正文必须写“笔尖与金属件配色要按 SKU 核验”，不应许诺任意 A2 都可无条件互换。
- 官网集合页称 A2 有 18 个模型、13 种颜色、镀金或镀铬金属件、亮面/哑面/雕花版本；这是**销售变体的广度**，不是 18 个彼此无关钢笔型号。

### 版本/笔尖/供墨边界

| 容易误写 | 正确边界 |
| --- | --- |
| A2 与 A+ | A2 是 Soft Sliding Click；A+ 是螺纹帽升级款。它们可在“Excellence 系列”互链，但不能同页混表。 |
| Lapis/Laquered/Guilloché | 都可作为 A2 的完成/装饰 variation；每一种的金属件、尖材与重量应以 SKU 为准。 |
| Steel vs 14K | 不是只换一个“可选配件”那么简单：官网以不同 nib block/商品列售，且 chrome/gold trims 需要匹配。 |
| 系列其他书写工具 | rollerball/ballpoint 不能借用钢笔的 converter、笔尖和插帽长度。 |

### 维护与选购

- 以 converter 或短国际墨胆使用；换色、长期闲置前清水冲洗。金属笔身较重（此款 47g），对手感敏感者应试握，尤其是是否习惯插帽后 155mm 的长度。
- 购买或换 nib block 时，要同时确认：A2 而非 A+、原笔金属件是 chrome 还是 gold、尖材以及 EF/F/M/B。只拿“Excellence nib”关键词购买，最容易买到不匹配的前段。
- Soft Sliding Click 是帽闭合特征，不表示“无磨损”“绝不干尖”；没有找到官方的绝对耐久承诺，页面不应这样写。

### 图片准入

- A2 主图需要可识别的按压帽、A2 笔身与对应 SKU；不使用 A+ 的螺纹帽图。
- 钢尖图不能用作“14K 双色尖”图，反之亦然；图片 metadata 至少记录产品名、金属件色、尖材、抓取日与 URL。
- 任何只拍三支套装但无法判断书写类型的官网图，都不应作钢笔主图。

### 最少三条资料源（访问于 2026-07-20）

1. Diplomat, [Excellence A2 Lapis black matt chrome fountain pen](https://www.diplomat-pen.com/en/product/excellence-a2-lapis-chrome-fountain-pen/) — 47g、136/155/14.7mm、黄铜、钢尖与随附供墨件。
2. Diplomat, [Excellence A2 14 ct bi-colour nib block](https://www.diplomat-pen.com/en/product/excellence-nib-block-a2-gold-14-ct/) — 14K 版本及其与 gold trims 的边界。
3. Diplomat, [Excellence A2 steel nib block](https://www.diplomat-pen.com/en/product/excellence-a2-chrome-steel-nib/) — chrome trims 钢尖前段、EF/F/M/B 的边界。
4. Diplomat, [collections overview](https://www.diplomat-pen.com/en/collections/) — A2 的 Soft Sliding Click、色/版本广度，及 A+ 为演进且改用 screw cap 的一级说明。
5. Diplomat, [current shop](https://www.diplomat-pen.com/en/shop/) — A2 钢尖与 14K SKU 仍在官方商店列售的状态证据。

---

## 3. Diplomat Elox

### 身份、状态与准确规格

- **建议页名**：`Diplomat Elox`。官方集合仍包含 Elox，且 2025/2026 的经销商目录/日本总代理页面仍列钢笔 SKU；可写“现行产品线”，不应仅依据早年上市新闻判断停产。
- 名称来自德语 **eloxieren**（阳极氧化）。官网描述为：先将环全黑阳极化，再作橙色第二次阳极化；Elox 由 Aero DNA 出发，但被品牌明确定位为独立、未来感更强的型号。
- 在基础规格页可写：铝笔身、闭帽约 **139–140 mm**、直径 **15 mm**、约 **42 g**。日本总代理将 14K 款标为 139 mm×15 mm、42g、EF/F/M、两用式；Goulet 对 Ring Black/Purple 钢尖款实测为闭帽 139.5mm、插帽 159.3mm、33g。这两套重量不同，说明版本/尖材/测量条件存在差别，**不能把 42g 写成全系列不变真值**。
- 官网说有精细雕刻钢尖或 14K 尖、四种尖幅，Soft Sliding Click，钢笔随 converter 并兼容国际标准墨胆。官网英文集合中“nib is orange anodized aluminium”显然与同时列出的 steel/14K nib 冲突，不能逐字复述为“铝尖”；应以具体 SKU/尖面照片核验。

### 版本/笔尖/供墨边界

| 主题 | 应怎样写 |
| --- | --- |
| Elox vs Aero | 都可为 15mm 左右的金属流线笔，但 Elox 的核心是双阳极环与独立系列，不是 Aero Orange。 |
| Ring Black/Orange/Blue/Purple/Grey Orange | 颜色/环的版本名，要跟随精确 SKU；不能将一个颜色的产品图供所有颜色使用。 |
| 钢尖 vs 14K | 官网称二者均存在；日本代理的 14K 页面只列 EF/F/M，不能以此推断钢尖也只有三种。 |
| fountain pen vs rollerball/ballpoint/mechanical pencil | 系列确实有其他书写类型，但供墨、重量、按钮/转动机制不能移植。 |

### 维护与选购

- 用 converter 或国际标准墨胆，换墨时按普通 C/C 笔清水冲洗；避免用金属工具刮环或以溶剂浸泡阳极表面。
- 对“外观很像 Aero”的消费者，选购页应建议比较两件事：想要 Aero 的纵向凹槽与具体材质完成，还是 Elox 的双阳极几何环；再确认尖材与销售地区 SKU。
- 若是为了轻量买 Elox，不要只抄一个零售页重量：14K 官方代理样品 42g、Goulet 具体 Ring 钢尖 SKU 33g 的资料并存，应向卖家要 exact SKU/实称或官方包装标示。

### 图片准入

- 需要能看见黑色底环与第二次阳极颜色的精确 Elox fountain pen 图；普通 Aero 轮廓图不合格。
- 图片标题必须含 Elox 与 fountain pen；轮廓相近的 ballpoint/rollerball 不作为主图。
- 对官网视觉文案中“orange anodized aluminium nib”的冲突，不要以那段话制作铝尖示意图；先按 SKU 图片或经销商技术页核实。

### 最少三条资料源（访问于 2026-07-20）

1. Diplomat, [collections overview: Elox](https://www.diplomat-pen.com/en/collections/) — Elox 名称来源、双阳极工艺、与 Aero 的关系、笔尖/Soft Sliding Click/供墨的一级资料。
2. Diplomat Japan / Diamond, [Elox product page](https://diamond.gr.jp/brand_dia/diplomat/products/elox01/) — 14K 钢笔 139×15mm、42g、EF/F/M、两用式及 2024 Grey Orange 在售记录。
3. Goulet Pens, [Elox Ring Black/Purple](https://www.gouletpens.com/products/diplomat-elox-fountain-pen-ring-black-purple) — 指定钢尖 SKU 的 139.5/159.3mm、33g、墨胆/converter 容量交叉资料；属于零售商实测，不替代官网规格。
4. PBS Polska, [Elox black/orange 14ct product record](https://katalog.pbspolska.eu/en/writing-and-correction-products/fountain-pens/fountain-pen-diplomat-elox-f-14ct-black-orange-587683.html) — 14K、色名与地区 SKU 的辅助交叉证据。

---

## 4. Leonardo Momento Zero（MZ）

### 身份、状态与边界

- **建议页名**：`Leonardo Momento Zero`，可在中文显示“莱昂纳多 Momento Zero”。官网称其为品牌第一支笔、2017 年末设计并迅速成为 icon；2026 官方商店仍列有众多 MZ 钢尖/金尖商品，因此可标为持续在售。
- 它是普通尺寸、旋帽、树脂、**cartridge/converter** 的型号。官网 Black Matte 钢尖页面明确“converter supplied inside”，不可把 Momento Zero 写成内置活塞。
- **不要混入**：Momento Zero Grande（MZG）、MZG 2.0、MZG Mosaico、Momento Magico。这些具有更大体型、活塞/墨窗或不同笔尖/供墨边界。也不要将 Dolcevita® Momento Zero 特别装饰的规格自动推广给所有 MZ。

### 可写入正文的可靠事实

- Black Matte 官方页给出：闭帽 **142 mm**、帽 **65 mm**、笔身（含笔尖）**127 mm**、重量 **27 g**、帽径 **15.5 mm**、握位径 **10.6 mm**；黑色哑光、钌色金属件、converter/cartridge。
- 同页现售钢尖为 #6 的 EF/F/M/B/Stub 1.1，官网也列有相同尺寸的金尖版本。Blue Positano 官方页把基础 MZ 描述为从实心高品质 acrylic resin 车削而成、笔身编号，钢尖并列 EF/F/M/B/Stub 1.1、Fude、Architect、CSI，并有 14K #6 选项。
- “所有 Momento Zero 都只有 27g”不可写死：官网某些产品页缺少完整重量，并且材质/金属件/限量树脂可能不同。可把 Black Matte 的值写作“该现售基准 SKU”。

### 版本/笔尖/供墨边界

| 名称 | 正确关系 |
| --- | --- |
| Momento Zero（MZ） | 本页对象：普通尺寸 C/C 基础型号。 |
| MZ 金尖/钢尖 | 同一型号线的尖材/配置层，不新建为两支互不相干的钢笔；图片和规格要标 SKU。 |
| Dolcevita® Momento Zero | 可能沿用 MZ 尺寸/供墨，但为品牌/装饰合作版本；不拿其更大的 146mm 规格覆盖基础 MZ。 |
| Momento Zero Grande / MZG 2.0 | 独立大号/活塞平台；不能共享“converter supplied”或 #6 的基础笔尖叙述。 |

### 维护与选购

- 正常用法是随笔 converter 或合适的国际墨胆；换色/久置前清水冲洗。不会因为笔尾看似有金属装饰就变成活塞上墨。
- 买旧款时让卖家提供笔尖与握位近照、converter 是否在、帽螺纹/内帽状态和型号铭牌/包装；不同年代的 feed、钢尖供应商、特种尖/金尖不要凭一个销售标题判断。
- 想要大墨量、活塞可拆或 #8 尖的人，应跳转去看 MZG/MZG Mosaico，而不是在基础 MZ 页寻找不存在的功能。

### 图片准入

- 主图必须是 `Momento Zero`，而非 MZG、MZG 2.0、Momento Magico；后者体型相似，最容易被营销图混淆。
- 必须区分钢尖与金尖，图片中无法辨认尖材时不得把它当规格证明。
- 官方页面中的 Black Matte/Blue Positano exact SKU 图最安全；若只做编辑示意图，需标“示意图，非产品照片”。

### 最少三条资料源（访问于 2026-07-20）

1. Leonardo, [Momento Zero Black Matte — steel nib](https://leonardopen.com/products/momento-zero-black-matte-steel-nib) — 现售状态、142mm/27g、C/C、钢尖选项。
2. Leonardo, [Momento Zero Blue Positano — steel nib](https://leonardopen.com/products/momento-zero-blue-steel-nib-1) — 2017 年末首款、实心 acrylic、编号、钢尖/14K #6 的边界。
3. Leonardo, [official store home / Momento Zero collection](https://leonardopen.com/it) — 当前 MZ 系列的在售集合与 MZG 2.0 为另一集合的一级状态证据。
4. Leonardo, [Dolcevita Momento Zero Marmo Pompei](https://leonardopen.com/products/dolcevita-momento-zero-marmo-pompei-st) — 装饰支系与基础 MZ 规格不可混表的具体反例。

---

## 5. Leonardo Furore

### 身份、状态与边界

- **建议页名**：`Leonardo Furore`。官网集合和若干 2026 商品（Aquapetra、Ginger、Notte 等）仍可购买，故可标现售；**某一种颜色显示 unavailable 不等于 Furore 系列停产**。
- 基础 Furore 的灵感来自 Amalfi Coast 的 Furore/Fiordo di Furore 等海岸地貌，典型为两端收束的 cigar 轮廓。不能因其“海岸配色”而与 Momento Zero 的圆柱轮廓合并。
- **Furore Grande 必须独立建模**：官网单列 `FURORE GRANDE`；用户/零售记录也显示它存在不同的大号/活塞配置。普通 Furore 页不应承接 Grande 的尺寸、活塞或 #8 尖。

### 可写入正文的可靠事实

- 官方 Aquapetra/Ginger 页对常规 Furore 一致给出：闭帽 **146 mm**、帽 **66 mm**、笔身（含尖）**131 mm**、重量 **27 g**、帽径 **15.5 mm**、握位径 **10.6 mm**。
- 现行官方商品说明为 #6 钢尖或金尖（以具体 SKU 为准）；金尖商品列 EF/F/M/B/1.1 Stub，钢尖资料有 EF/F/M/B/1.1 Stub。不要用一个 SKU 的“金尖”标题抹掉钢尖常规款。
- 供墨为**旋入式 converter**或国际墨胆，converter 有定制金属尾帽；它不是固定活塞。Furore Aquapetra 钢尖页仍有库存/待补货选择，足以证明当前型号线存在，但不证明所有旧色都在产。
- 官方产品页常称可选 gold/silver/rose gold trim；颜色和金属件是 variation，不等于新型号。

### 版本/笔尖/供墨边界

| 需要拆开 | 原因 |
| --- | --- |
| Furore vs Furore Grande | 官网集合分列，结构/供墨和尺寸可能不同；不可共同使用 C/C 或活塞规格。 |
| C/C Furore vs 二手市场标“piston” | 普通官售 Furore 的证据为旋入 converter。二手标题要依据具体年款/SKU 再判断，不能反向改写基础页。 |
| Steel vs 14K / Elastic / Stub | 基础实体可有多个尖选择，须标 SKU 与日期；不把“Elastic”夸写为现代软弹尖或全系列通用体验。 |
| Furore 颜色/俱乐部版 | Aquapetra、Ginger、Smeraldo、Fiordo 等属于可验证变体；俱乐部合作/限量色要有独立发布与数量证据才拆。 |

### 维护与选购

- 旋入 converter 可从笔尾 blind cap 下的旋钮操作；换墨时不要硬拉 converter。若不确定哪一代的 converter，可卸下握位确认或咨询卖家。
- 清洗按 C/C 笔处理；墨水干涸时先用清水浸润、反复注排，不建议把尖舌强行拔出作为常规维护。
- 买家要分清“普通 Furore”还是“Furore Grande”，并要求闭帽长度、笔尖尺寸/材质、供墨照片与销售年；尤其不能只按颜色或“Furore”搜索词下单。

### 图片准入

- 主图允许使用官方 Aquapetra/Ginger/Fiordo 的 exact Furore fountain pen，但须在图注写准确颜色与尖材，不能说是全系唯一样貌。
- Furore ballpoint（官网另有集合）与 Furore Grande 一律不能作普通 Furore 钢笔主图。
- 俱乐部版或 retail exclusive 只在商品名、授权与型号都清楚时加入图库；否则用原创示意图并标注。

### 最少三条资料源（访问于 2026-07-20）

1. Leonardo, [Furore Aquapetra — steel nib](https://leonardopen.com/collections/all/products/furore-aquapetra-steel-nib) — 当前普通 Furore 尺寸、尖材、converter 与在售/缺货状态。
2. Leonardo, [Furore Ginger — gold nib](https://leonardopen.com/products/furore-ginger-gold-nib) — #6 14K、精确尺寸、金属件/旋入 converter。
3. Leonardo, [collections index](https://leonardopen.com/collections) — Furore、Furore Grande 和 Furore Ballpoint 为不同集合的一级结构证据。
4. Leonardo, [Furore White Salt — steel nib](https://leonardopen.com/products/furore-white-salt-steel-nib) — 某单一色已不可买的反例，防止将“某色 unavailable”推成全系停产。
5. Pen Venture, [Furore Fiordo di Furore](https://pen-venture.com/products/leonardo-furore-fiordo-di-furore) — 独立专业零售交叉记录：C/C、可插帽、重量与尺寸；二级来源，不取代官网。

---

## 6. Leonardo MZG Mosaico

### 必须明确的身份：Mosaico 不是“某个 MZ 配色”

- **建议页名**：`Leonardo Momento Zero Grande Mosaico`，短名可显示 `MZG Mosaico`。官网集合本身使用 `MZG MOSAICO`，明确它属于 Momento Zero Grande 的大号平台；不要仅以 `Leonardo Mosaico` 建一个与基础 MZ 混淆的实体。
- 官网称其材料为意大利产 **spaghetti resin**；通过对树脂块的**横向切割**形成方格马赛克侧纹，正/背面呈 ringed Arco 纹。该材料/加工是此型号的识别点，不等于任何“马赛克色”或 `Furore Mosaico Hawaii` 合作色。
- 2026 官方集合仍列 Baobab、Sea Anemone 等商品，写“编号、非限量的现售系列”较准确。不可因为每支有编号就写成“限量版”。
- 它是**大活塞**供墨，官网列为可用专用 wrench 拆装的 huge-capacity piston，并含墨水瓶；与 Momento Zero/Furore 的 cartridge/converter 是关键硬边界。

### 可写入正文的可靠事实与谨慎表述

- 官方系列页确认：意大利制造、编号非限量、五种颜色（页面访问时列 Sand/Hawaii/Mango/Baobab/Sea Anemone）、大容量活塞、立体雕刻金属件、可配金尖+黑色硬橡胶 feed 或钢尖+ABS feed。
- 部分官方 `MZG Mosaico` 商品写的是 **1.5 ml** piston、可拆活塞、日制 ebonite feed；但该页是特定组合/特别产品，制作基础页时可写“官方部分 MZG Mosaico 商品标为 1.5 ml，具体容量、尖/舌随 SKU 而定”，不要宣称所有 Mosaico 一律 1.5 ml。
- `MZG Mosaico Baobab` 页面可同时出现钢尖/金尖新版本。这说明不能将一支 14K 大尖照片当作全系列唯一配置，也不应根据论坛猜测其尖厂。

### 版本/笔尖/供墨边界

| 容易混淆对象 | 正确边界 |
| --- | --- |
| Momento Zero | 基础 MZ 是普通尺寸 C/C；MZG Mosaico 是大号活塞平台。 |
| Momento Zero Grande 2.0 | 同为 MZG 家族但 2.0 有墨窗/不同发布逻辑；要另页并互链，不合并。 |
| Furore Mosaico Hawaii | 是 Furore 的特定俱乐部/配色命名，普通 C/C Furore，不是 MZG Mosaico。 |
| Dodici Mosaico | “Mosaico”仅说明材料/纹理概念的一部分，不证明与 MZG 使用同一形制、尖或供墨。 |
| 钢尖/金尖、#6/#8 | 先按每个官方 SKU 写；不得把一个特殊 #8 产品推广给所有 MZG Mosaico。 |

### 维护与选购

- 活塞笔的第一原则是：不把 C/C 用法套进来，不插国际墨胆，不在没有原厂 wrench/说明的情况下拆解活塞。官方只说明可用其出售的 wrench 拆装，不能推演任何第三方工具都安全。
- 换色时以清水反复吸排；长期不用先清空与冲净，避免色彩饱和墨水沉积在 feed/活塞腔。若活塞阻力异常或漏墨，优先售后，不把自行润滑/拆活塞写成常规教程。
- 购买时确认是 **MZG Mosaico**，非 MZ、Furore 或 Dodici 的“mosaico”命名；再确认树脂色、钢/金尖、feed、活塞工具与墨水瓶是否随笔。二手页“编号”也要核对它指的是非限量编号，而非限量序号。

### 图片准入

- 精确图应当能显示 MZG Mosaico 的方格侧纹或官方商品名称；不要用 Furore Mosaico Hawaii、Dodici Mosaico 或任意花树脂 Leonardo 代替。
- 金尖与钢尖分别存图、分别标注；不要让黑色 ebonite feed 的近照成为钢尖款的证明。
- 官方商城商品图、品牌集合页是首选；第三方实物图需要许可和完整 SKU，二手平台仅作内部身份核验。

### 最少三条资料源（访问于 2026-07-20）

1. Leonardo, [MZG Mosaico collection](https://leonardopen.com/collections/mzg-mosaico/dup-review-publication) — 型号归属、spaghetti resin 横切工艺、编号非限量、活塞、尖/舌边界的核心一级来源。
2. Leonardo, [MZG Mosaico Minimalist Black and Mosaico Celluloid](https://leonardopen.com/products/mzg-minimalist-black-and-mosaico-celluloid-nib-8) — 特定 SKU 的 1.5 ml、可拆活塞与 #8 金尖案例；不能泛化到整线。
3. Leonardo, [official collections index](https://leonardopen.com/collections) — `MZG MOSAICO`、`Momento Zero collection`、`Momento Zero Grande 2.0`、`Furore collection` 分列的一级导航证据。
4. Galen Leather, [MZG Mosaico collection](https://www.galenleather.com/collections/mzg-mosaico) — 独立零售页对“意大利制造、编号非限量、大活塞、立体金属件”的交叉记录。
5. Vancouver Pen Club, [Furore Mosaico Hawaii](https://www.vancouverpenclub.com/2023/01/our-new-pen-club-pen-leonardo-furore.html) — 用于证明同名 Mosaico 在 Furore 上也可能出现，因而不能按颜色词合并实体。

---

## 跨六页的可靠中文写作禁区

1. 不写“德国制造/意大利手工制造”这种无 SKU/工厂证据的泛断言；品牌国别与个别部件产地是不同事实。
2. 不写“最顺滑”“永不干尖”“终身耐用”“软弹/半软”之类没有范围与来源的绝对体验词。
3. 不把价格当成型号属性；官网价格会随地区、VAT、尖材和配色变化。
4. 不把零售页面的实测容量、重量、上架时间改写为“品牌统一规格”。要标为对应 SKU/零售规格。
5. 不把 `Mosaico`、`Dolcevita`、`Flame`、`Rhomb` 等材料、饰面、合作或颜色词自动升格为基础型号；先看形制、供墨、系列位置和官网 SKU。

## 后续实现前的 checkpoint 核验清单

本研究**未读取、打开或修改**真实 `data/fpkg.db`、WAL、SHM。实现者仅可在 disposable checkpoint copy 中执行：

1. 全查 `Diplomat`、`迪普洛玛`、`Aero`、`Excellence`、`Elox`、`Leonardo`、`Momento Zero`、`MZG`、`Mosaico`、`Furore` 的 name/slug/alias/body；列出 type、public 状态与既有关系，避免只查第一条。
2. 特别识别 `article`/`brand` 与 `pen`：绝不把一篇文章、品牌介绍或滚珠笔 route 改造成 steel pen；只对确认同一钢笔的旧 pen route 建 redirect。
3. 核对已有 `Mosaico` 是否其实是 Furore/Dodici/MZG，已有 `Excellence` 是否为 A2/A+，已有 `Aero` 是否为钢笔而非其他书写类型；身份不明的先保留并列出待核，不靠模糊名称合并。
4. 若新建基础实体，品牌页反向关系必须包含所有公开钢笔型号；既有颜色/SKU 若只是 variation，不应创造重复 public model 页。
5. 每页必须有自然中文正文、精确来源链接、图片 attribution/说明与有效品牌链接；文本中的尺寸、容量、尖材都要标示适用版本。迁移重放应为 noop。
6. 做完 checkpoint 定向测试后，再对真实 main/WAL/SHM 做快照比较，确认研究和试验未触碰真实数据库；正式迁移、全量审计与上线验证另行进行。

