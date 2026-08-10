## summary

Wancher Zogan Momiji - Green Tamamushi-nuri 是一个以 `9322088038615` 和两个 Trim SKU 识别的独立商品；本次按 2026-08-10 官方记录补齐价格、版本、材料冲突、图片和身份边界。

## body_md

# Zogan Momiji - Green Tamamushi-nuri：把一片秋叶写成会变光的表面

Wancher Dream Pen 的 **Zogan Momiji - Green Tamamushi-nuri** 很容易在资料整理时被写成“绿色 Momiji”或“玉虫漆系列”。这两个说法都太宽。它首先是一条可以被订单记录识别的商品：官方英文标题是 `Zogan Momiji - Green Tamamushi-nuri`，handle 是 `zogan-momiji-green-tamamushi`，product id 是 `9322088038615`。Black 和 Silver 不是两个新型号，而是这个商品的 Trim 选项；真正用于区分订单的，是各自的 SKU。

## 先把这条商品记录钉住

2026-08-10 读取的官方 Shopify product JSON 仍以 product id `9322088038615` 返回这条商品，`created_at` 为 `2026-07-06T16:24:29+09:00`，`published_at` 为 `2026-07-07T16:03:23+09:00`，`updated_at` 为 `2026-08-10T15:46:19+09:00`。这些是商品系统的时间戳，不是工艺完成日，也不能直接写成“2026 年正式首发”。页面后来更新了变体和图片，所以旧的检索快照只能说明当时看到了什么，不能替今天的库存作保证。

当前 JSON 的 `Trim` 选项有两个值：`Black` 对应 `WF-ZOUR-DREAM-MOTAGR`，`Silver` 对应 `WF-ZOUR-DREAM-MOTAGR-SV`。两条变体在本次读取中都显示为 US$600；税费、运费、库存、促销和按钮状态仍由地区与页面实时决定。页面显示的金额是销售窗口，不是这件手工钢笔的永久定价，也不应把平台的 `grams: 200` 当成成品实测重量。

另一个旧商品记录 `zogan-momiji-urushi-tamamushi-nuri` 使用 product id `8485791596759` 和 SKU `WF-ZOUR-DREAM-MOTA`。它的标题、handle、product id 和 SKU 都不同，不能因为同样出现 Momiji、Zogan 或 Tamamushi-nuri 就合并进本条。相反，`Zogan Momiji - Urushi Red`、`Urushi Black`、`Urushi Blue`、`Aka Tamenuri` 以及 Celluloid MOMIJI 也各有自己的商品边界。本页只讨论 `9322088038615` 这一条记录。

## Momiji、Zogan 和 Green Tamamushi-nuri 各自说什么

品牌用 Momiji 指向日本秋季的红叶。商品说明不是在讲一张抽象的“绿色色卡”，而是在讲叶片图案如何落到笔身表面：先按图案切出珍珠母贝片，再在笔体上刻出相应位置，之后把切好的材料嵌入，完成具有装饰性的叶片。品牌还说明 Zogan 的观感会随观看角度和光线发生变化；这正是玉虫式光泽在照片中经常看起来不一样的原因。

“Green Tamamushi-nuri”是这条商品标题里的表面与色彩叙事。它可以帮助读者理解为什么绿色会出现青、黄、深绿或偏金的反光，但不能被扩写成固定色值、光谱测量、漆层数量或永不变化的外观承诺。自然反光、相机白平衡和不同 Trim 的金属反射都会改变照片观感；二手图中一支笔和另一支笔出现轻微差异，也不自动说明有隐藏版本。

Zogan 也不能简单等于“贝壳贴纸”。京都国立博物馆对东亚漆器母贝嵌入的说明可以帮助理解材料语境：贝壳内侧具有虹彩的珍珠层需要被切割、处理并嵌入漆面。这个背景资料不替 Wancher 补充贝种、厚度、片数、胶黏剂、工匠姓名或每支笔的施工时间。那些字段在当前商品记录里没有公开，就应保持为空，而不是用工艺常识填成产品规格。

## 材料字段为什么要保留两层说法

当前 exact product JSON 的 `Material & art` 写的是 **ABS、Titanium（trim part）、Zogan**。其中 ABS 是基础材料字段，Titanium 只限定在 Trim 部位，Zogan 是装饰方法的商品化表述。官方商品正文在介绍 Momiji 的嵌入过程时又沿用了“珍珠母贝嵌入 ebonite 笔体”以及结合 Urushi 与 Zogan 的叙事。它们属于同一页面里的不同层级：一个是结构化规格，一个是工艺说明与系列文案。

这里不把两段文字强行改造成一套未经证实的配方。比较稳妥的写法是：以当前结构化字段记录 ABS、Titanium Trim 和 Zogan；同时保留正文出现的 Urushi／Ebonite 语境，并提醒读者页面没有公开漆层构成、底材厚度或逐组件产地。这样既不把一段营销叙述当作实验室检测，也不把字段差异悄悄抹掉。Trim 的 Black／Silver 只改变可选金属外观，不把 ABS 基体变成两种不同型号。

## 尖、feed 和供墨是配置菜单，不是四支笔

官方页面列出 `#6 JoWo stainless steel`、`Wancher 18K gold`、`KEIRYU/Kodachi`。在资料库中把 Keiryu 和 Kodachi 分开列成两个可选入口，便于记录订单；这不代表一支笔同时安装四种笔尖。JoWo 钢尖适合把它当作日常书写工具来理解，Wancher 18K gold 是升级选项，而 Keiryu／Kodachi 属于品牌另外命名的特殊书写取向。除非订单或实物明确写出尖幅、打磨和刻字，否则不能从“Keiryu”三个字推导一个统一线宽。

Feed 菜单为 Plastic、black ebonite、red ebonite。它们是供墨部件的选项，不应被误读为笔身材料。实际兼容组合要以当次商品页面、订单确认或品牌售后回复为准；尤其不能因为另一款 Wancher 漆艺笔写过某种 feed，就把那一项自动移植到 Green Tamamushi-nuri。供墨方式是 converter 或 European International Standard cartridge。页面没有授权把这支嵌入笔当作 eyedropper 使用，日常换墨仍应按握段、feed 和 converter 的正常清洗流程进行。

帽子被品牌描述为 compact air-tight cap，用意是减少笔尖中的墨水过早干涸。它是结构和使用提示，不是“绝对防漏”“长时间倒置也不会渗墨”或“无需清洁”的承诺。包装列 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Authenticity Certificate、Converter 与 Cartridge；包装附件属于销售配置，遇到地区或批次变化时应对照订单清单。

## 图片怎么读，哪些不能从图片读出来

官方当前 JSON 给出八张商品图片，其中一张与 Black 变体关联，另一张与 Silver 变体关联，其余图片展示笔身、叶片嵌入、金属 Trim 和包装语境。图片可以证明页面当时展示了这款商品，也能帮助二手买家核对叶片布局与饰件；它们不能证明每一支笔都完全相同，更不能成为固定绿色色卡、尺寸比例、重量或库存证明。

本站保留一张原创 factual SVG 作为页面主图，明确标注“非产品照片、不表示比例、色卡、Logo、库存或价格”；同时把当前官方商品照片作为带来源的图像证据记录。这样读者能看到可长期托管的身份卡，也能沿来源回到品牌当次照片，而不会把一张外部商品照误当成本站拥有的产品摄影。以后若品牌替换 CDN 图片，正文的产品身份仍由 product id、handle 和 SKU 维持。

## 版本差异应该怎样记

这条商品的两个 Trim 选项属于同一商品记录下的市场变体。Black 与 Silver 可以影响金属部件的视觉对比，也可能决定官方 JSON 关联哪一张图片，但它们不会自动改变笔尖家族、供墨方式或 ABS 基体。整理时应把颜色／Trim、尖、feed 和地区价格分成四个层次：Trim 是订单选项，nib 与 feed 是配置菜单，价格是当次销售窗口，商品 id 与 handle 才是稳定身份。把这四层揉成一句“黑银两款、各有一套配置”，很容易让读者误以为每种 Trim 都有独立结构或独立首发。

当前 JSON 的 `updated_at` 是 2026-08-10，说明品牌在商品记录上仍有更新动作；这并不表示之前的所有页面都失效，也不表示每一张旧照片都对应同一批次。更稳的做法是给每条来源保留检索日期，并在正文中把“当前记录”“历史快照”“页面持续变化”分别写清楚。这样今后再次读取到不同价格或库存时，可以更新销售窗口而不必重写型号身份，也不会把旧的 `available=true` 当成永久供货证明。

同样的边界适用于资料库中的相邻 Momiji 商品。旧的 `WF-ZOUR-DREAM-MOTA` 是另一条 product id 与 handle；Red、Black、Blue 和 Aka Tamenuri 有各自颜色和材质字段；Celluloid MOMIJI 的材料与工艺又属于另一个系列。它们可以互相链接到 Momiji 或 Zogan 的分类导航，但不能共享一套 SKU、价格、图片和尺寸。读者从一个页面跳到另一个页面时，最重要的不是看到更多“绿色”“秋叶”关键词，而是知道哪一个事实仍属于当前这支笔。

尺寸也要用同样的方法处理。官方商品页的 `Size & Shape` 章节主要依靠示意图片，没有公开可复核的总长、笔帽直径或握径；商品 JSON 的 `200 g` 是平台变体字段，不能替代未公开的成品测量。若未来出现品牌目录或实物测量，应为它建立独立来源窗口，注明是否含笔帽、是否含 converter、测量工具和样本，而不是把单支二手测量倒灌成所有 Black／Silver 变体的通用规格。

## 使用和维护：先保护表面，再清洗笔尖

Wancher Product Care 对 Zogan 的建议很直接：不要把带珍珠母贝嵌入的产品放在流水下冲洗，因为嵌入物可能松脱；外部清洁应使用拧干的软布轻拭。对 Urushi、Raden 和漆面装饰，品牌还要求避开强冲击、尖锐物、长时间直晒、干燥环境和极端天气。即使当前结构化材料字段写 ABS，也不应因此把它当成可以随便浸泡、抛光或用溶剂擦拭的塑料笔。

换墨时只让清水进入笔尖、feed、握段和 converter 的路径，笔身、帽口、珍珠母贝和 Titanium Trim 只做局部擦拭；不要用酒精、丙酮、漂白剂、强酸碱清洁剂、研磨膏或金属抛光剂处理表面，也不要把整支笔浸在水里。Ebonite feed 若被选中，更应避免长时间浸水和化学清洁剂。清洗后分开晾干，再装回 converter 和笔帽，不要用热风、暖气或暴晒加速干燥。

“每支手工制品都不完全相同”只能解释叶片位置、贝片反光和细小纹理的自然差异。若看到贝片翘起、边缘掉片、裂纹、漆面发白、Trim 松动、握段漏墨、尖座松动或螺纹异常，应停止使用并联系 Wancher 或熟悉漆艺钢笔的维修者。不要自行点胶、加热、重新打磨或用金属布抛光；这些操作可能把可修复的问题变成不可逆的外观损伤。

## 选购与二手核对清单

第一步核对标题、handle、product id 和 SKU 是否成套：`Zogan Momiji - Green Tamamushi-nuri`、`zogan-momiji-green-tamamushi`、`9322088038615`，以及 Black／`WF-ZOUR-DREAM-MOTAGR` 或 Silver／`WF-ZOUR-DREAM-MOTAGR-SV`。只写“Wancher Momiji”“绿色 Zogan”或只看一张照片，都不足以确认身份。

第二步核对结构和配置：ABS、Titanium（trim part）、Zogan；所选 nib 是否为 JoWo stainless steel、Wancher 18K gold 或 Keiryu／Kodachi；feed 是否写明 Plastic、black ebonite 或 red ebonite；供墨是否为 converter／欧规 cartridge；包装是否包含证书、木盒、Pen Kimono 和附件。页面正文的 Urushi／Ebonite 叙述要作为保留的字段差异阅读，而不是拿来编造漆层或产地。

第三步核对表面状态和交易窗口：价格、税费、库存和按钮状态按下单时页面读取；不要用旧截图要求卖家兑现历史价格。检查叶片嵌入边缘是否有翘起或缺片、Trim 是否松动、帽口螺纹是否顺畅、笔尖刻字和供墨部件是否与订单一致。若二手卖家把旧商品 `WF-ZOUR-DREAM-MOTA` 或另一个 Momiji handle 写进本条，应先暂停交易，要求补充清晰的 product id、SKU 和当支照片。

## 身份结论

这条资料页只覆盖 product id `9322088038615` 的 Green Tamamushi-nuri 商品。Black 与 Silver 是同一商品下的 Trim 变体；Momiji Red、Black、Blue、Aka Tamenuri、旧 `8485791596759` Tamamushi 记录以及 Celluloid MOMIJI 都保持自己的商品身份。公开资料可以支持秋叶主题、母贝 Zogan、ABS、Titanium Trim、Urushi 叙事、公开 nib/feed、欧规供墨、气密帽、包装和保守护理边界；不能支持固定色值、可靠尺寸重量、贝种片数、漆层数量、工匠署名、永久库存或隐藏 SKU。把这些未知边界写出来，才不会把一支漂亮的手工钢笔整理成一页看似完整、实际混名的商品说明。

## model_specs

```json
{
  "series_name": "Wancher Zogan Momiji Green Tamamushi-nuri",
  "release_year": "独立正式首发年份未公布；official created_at 2026-07-06、published_at 2026-07-07，只作商品记录语境",
  "origin_country": "Japanese Zogan and Urushi craft context；exact component-by-component origin not asserted",
  "nib": "#6 JoWo stainless steel；Wancher 18K gold；Keiryu；Kodachi",
  "fill_system": "Converter 或 European International Standard cartridge",
  "material": "当前 Material & art 字段为 ABS、Titanium（trim part）、Zogan；正文另写 Urushi 与 Ebonite 语境",
  "dimensions": "官方 exact product page 未公布可复核长度、直径和握径",
  "weight": "官方未公布可靠成品重量；JSON grams 字段不作为实测重量",
  "price_range": "2026-08-10 官方 JSON：Black WF-ZOUR-DREAM-MOTAGR US$600；Silver WF-ZOUR-DREAM-MOTAGR-SV US$600",
  "status": "官方 product record 当前仍可识别；库存、税费、促销与购买按钮按当次页面确认"
}
```

## 来源

- Wancher： [Zogan Momiji - Green Tamamushi-nuri 官方商品页](https://www.wancherpen.com/products/zogan-momiji-green-tamamushi)（当前标题、秋叶／Zogan 叙述、ABS／Titanium 字段、尖、feed、供墨、帽和包装；2026-08-10 读取）
- Wancher： [Green Tamamushi product JSON](https://www.wancherpen.com/products/zogan-momiji-green-tamamushi.json)（product id、handle、时间戳、Trim、SKU、价格、updated_at 和八张当前图片；2026-08-10 读取）
- Wancher： [Zogan Fountain Pen Collection](https://www.wancherpen.com/collections/zogan-fountain-pen)（Momiji、Sakura River、Yuki Zuki 等商品入口的分隔与 Zogan 工艺叙事；2026-08-10 读取）
- Wancher： [Product Care Guide](https://www.wancherpen.com/pages/product-care)（Zogan 不在流水下冲洗、母贝与漆面冲击／日晒边界、Ebonite 清洁边界；2026-08-10 读取）
- Wancher： [Nib Guide](https://www.wancherpen.com/pages/nib-guide)（JoWo、Wancher 18K、Keiryu／Kodachi 菜单的阅读语境；2026-08-10 读取）
- Kyoto National Museum： [From Land and from Sea: East Asian Lacquers with Mother-of-Pearl Inlay](https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/shikko_20160726.html)（母贝切割与嵌入漆面背景；不替本 SKU 证明贝种、厚度、供应链或工匠）
- 本站原创图：[Zogan Momiji Green Tamamushi-nuri factual SVG](/images/library/site-original/phase543-wancher-zogan-momiji-green-tamamushi.svg)（非产品照片、不表示比例、色卡、Logo、库存或价格）
