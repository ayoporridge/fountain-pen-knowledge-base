# Phase 348 研究：Maiora 与 Impronte 系列

## 研究边界

Maiora 在当前资料库没有品牌或型号实体。本包一次补入 Maiora 品牌、Impronte 标准款和 Impronte Oversize 两个独立型号。官方 2022 catalog 把 Impronte 的手工树脂、三线帽螺纹、金属件处理、钢尖字幅和系列尺寸写在同一资料里；专业评测与零售商进一步区分 standard／oversize，并给出不同测量口径。正文保留“目录规格”“评测样本”“零售规格”三个层级，不用任何一支笔的尺寸覆盖另一个型号。

## 主要来源

- Maiora 官方 2022 catalog PDF：<https://maiorapen.com/wp-content/uploads/2022/12/CATALOGO-MAIORA-.pdf>。公司页写“story born in 1978”、40 多年经验、made in Italy；Impronte 页写实心树脂棒手工车制、三线螺纹帽、黄铜实心加工夹、金／铑电镀、钢尖 EF/F/M/B 和目录尺寸 147/157 mm、直径 16 mm。
- The Pencilcase Blog：<https://www.pencilcaseblog.com/2020/10/review-maiora-impronte-fountain-pen.html>。独立标准款样本给出闭帽约 147 mm、开盖约 133 mm、直径约 16 mm、握位约 12 mm、总重约 27 g；记录树脂组合、captured converter、标准卡水／转换器和 JoWo 钢尖。
- The Gentleman Stationer：<https://www.gentlemanstationer.com/blog/2020/11/21/pen-review-maiora-impronte-oversize-fountain-pen>。说明 Oversize 是独立较大版本，评测 Capri acrylic、舒适的凹面握位、#6 JoWo 钢尖与 Delta 之后的品牌背景；不把评测手感变成全系保证。
- The Pen Addict：<https://penaddict.squarespace.com/blog/2021/9/27/maiora-impronte-oversized-fountain-pen-review>。记录 Oversize 的 Posillipo 样本、captured converter、#6 JoWo EF 尖和标准／Oversize 的选择边界。
- SBREBrown：<https://www.sbrebrown.com/?p=9633>。Mirror Black Oversize 样本测得闭帽 145.2 mm、开盖 143.4 mm、套帽 153.7 mm、全笔 32 g、笔身 23 g、帽 9 g，握位 11.5–12.9 mm；作为独立样本而非官方固定尺寸。
- Pen Chalet standard：<https://www.penchalet.com/fine_pens/fountain_pens/maiora_impronte_fountain_pen.html>。专业零售商列出标准 Impronte 的 142.9 mm 闭帽、152.4 mm 套帽、15.2 mm 桶径、树脂、#6 不锈钢尖、标准国际卡水／转换器和螺纹帽。
- Pen Chalet Oversize：<https://www.penchalet.com/fine_pens/fountain_pens/maiora_impronte_oversize_fountain_pen.html>。专业零售商确认 Oversize 是独立尺寸路线与 #6 不锈钢尖，库存和价格不写入正文。

## 身份结论

- 新增品牌 slug：`maiora`，名称“Maiora 玛奥拉”。
- 新增型号 slug：`maiora-impronte`，名称“Maiora Impronte”，代表标准尺寸路线。
- 新增型号 slug：`maiora-impronte-oversize`，名称“Maiora Impronte Oversize”，与标准款分开建实体。
- 黑／橙、Capri、Posillipo、Mirror Black 等为颜色／树脂版本；EF/F/M/B 是尖幅选项，不再拆成更多型号。
- Maiora 与已存在的 Leonardo、Tibaldi、Delta 只在正文中作历史或设计语境比较；本包只建立两个 Impronte → Maiora 的 `made_by` 与品牌反向导航。

## 未确认事项

- 官方 catalog 的 `length[1]`／`length[2]` 未在同一页明确标注闭帽、开盖还是套帽；正文只以“目录 147/157 mm”记录，不替它命名测量点。
- 标准款不同来源给出 142.9–147 mm 闭帽，Oversize 样本给出 145.2 mm 闭帽；这可能来自测量点、版本或样本差异，不能合并成单一精确值。
- 官方 catalog 说明钢尖 EF/F/M/B，但 JoWo 归属来自独立评测与零售资料；不写成 Maiora 自制尖。
