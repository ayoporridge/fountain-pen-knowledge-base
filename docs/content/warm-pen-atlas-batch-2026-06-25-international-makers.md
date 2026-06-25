# Warm Pen Atlas 批量图像记录（六）

日期：2026-06-25

用途：为已经扩写、已有来源支撑但还缺站内原创封面的国际历史与现代工坊品牌馆补图。第六批继续采用“每个品牌 1 张封面图”的策略；如果未来同一品牌需要多张历史场景、工坊细节、型号陈列或玩家桌面图，需要重新规划更多视角、场景和构图。

执行方式：内置 image generation，一张资产一个 prompt。原始生成图保留在 Codex 默认生成目录；项目中使用压缩后的 JPEG。

## 统一约束

- 风格：沿用 Warm Pen Atlas，暖纸色、手绘墨线、水彩质感、档案馆/编辑部图册气质。
- 画幅：16:9 landscape。
- 文字：不在图内放可读正文、标签、品牌名、数字或伪文字。
- 避免：品牌 logo、真实商标、精确产品复刻、随机乱码、水印、人物。
- 用途：站内原创插画，`license = site-original`。
- 事实边界：bitmap 插画只做封面/入口/氛围图；品牌史实仍由正文、claims 和来源卡承担。

## 第六批资产

| 文件 | 媒体标题 | 关联 | 用途 |
| --- | --- | --- | --- |
| `/images/library/warm-pen-atlas/conklin-brand-cover.jpg` | Warm Pen Atlas: Conklin 品牌馆封面 | `brand/conklin` | Conklin 品牌馆入口 |
| `/images/library/warm-pen-atlas/diplomat-brand-cover.jpg` | Warm Pen Atlas: Diplomat 品牌馆封面 | `brand/diplomat` | Diplomat 品牌馆入口 |
| `/images/library/warm-pen-atlas/esterbrook-brand-cover.jpg` | Warm Pen Atlas: Esterbrook 品牌馆封面 | `brand/esterbrook` | Esterbrook 品牌馆入口 |
| `/images/library/warm-pen-atlas/kaweco-brand-cover.jpg` | Warm Pen Atlas: Kaweco 品牌馆封面 | `brand/kaweco` | Kaweco 品牌馆入口 |
| `/images/library/warm-pen-atlas/leonardo-brand-cover.jpg` | Warm Pen Atlas: Leonardo 品牌馆封面 | `brand/leonardo` | Leonardo 品牌馆入口 |
| `/images/library/warm-pen-atlas/wancher-brand-cover.jpg` | Warm Pen Atlas: Wancher 品牌馆封面 | `brand/wancher` | Wancher 品牌馆入口 |

预览拼图：

- `docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-international-makers-contact-sheet.jpg`

## Prompt Set

### Conklin 品牌馆封面

Create a site-original cover artwork for the Conklin fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style. An early American patent-office archive desk with brass drafting tools, crescent-shaped filling-mechanism sketches without readable text, sepia folders, a small wooden parts drawer, and old catalog cards left blank. Generic vintage black hard-rubber style fountain pens with gold trim, a crescent-filler inspired silhouette without copying any exact product, loose nibs, rubber sacs, and repair tools; no logos. Wide 16:9 landscape cover, low three-quarter desk view, objects concentrated in the lower right and center, generous parchment negative space in upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.

### Diplomat 品牌馆封面

Create a site-original cover artwork for the Diplomat fountain pen brand museum entry, matching the approved Warm Pen Atlas warm archival illustration style with a German engineering desk mood. A precise engineering archive desk with brushed aluminum samples, anonymous pen barrel cross-sections, blank technical cards, a small caliper without numbers, a muted gray blueprint sheet with only simple unlabeled geometry, and a tidy tray of nibs. Generic streamlined metal fountain pens in matte silver, navy, black, and champagne finishes; one faceted aerodynamic barrel silhouette inspired by aircraft engineering but not copying any exact product; no logos. Wide 16:9 landscape cover, high oblique angle, precise modular object clusters on the right and lower center, open parchment area on left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.

### Esterbrook 品牌馆封面

Create a site-original cover artwork for the Esterbrook fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style. A Camden-era American stationery archive mixed with a modern revival display: wooden card trays, blank nib sample cards, vintage ledger pages with no readable text, a small glass ink bottle, and a soft fabric pen wrap. Generic vintage-inspired fountain pens in black, ivory, tortoise brown, and teal; loose interchangeable nib units arranged in a tray; no exact Estie copy, no logos. Wide 16:9 landscape cover, slightly top-down view, pen wrap and nib trays in lower center, archive boxes on right, open warm parchment space across upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.

### Kaweco 品牌馆封面

Create a site-original cover artwork for the Kaweco fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style. A compact pocket-pen display desk with travel notebook, small tin boxes with blank lids, brass and resin material swatches, blank size comparison cards, a folded map with no readable text, and a small wooden drawer. Generic short octagonal pocket fountain pens and tiny capped pens in black, burgundy, olive, brass, and clear demonstrator finishes; no exact Sport copy, no logos. Wide 16:9 landscape cover, close three-quarter view, compact objects clustered along the lower middle like a pocket-pen study, calm parchment negative space upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.

### Leonardo 品牌馆封面

Create a site-original cover artwork for the Leonardo fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style with an Italian workshop atmosphere. A warm Italian artisan workbench with resin rods, turned barrel blanks, blank workshop order cards, polishing cloth, small lathe-tool silhouettes, and a family-workshop archive box; no readable text. Generic oversized resin fountain pens with warm marbled finishes in blue, amber, green, and black; loose nibs and cap bands; no exact product copy, no logos. Wide 16:9 landscape cover, rich object cluster on lower right and center, resin rods leading diagonally, generous cream negative space upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.

### Wancher 品牌馆封面

Create a site-original cover artwork for the Wancher fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style with a Japanese material-research mood. A quiet Japanese craft desk with urushi-like lacquer sample tiles, ebonite and wood material swatches, blank archival cards, a small cloth, neutral pen tray, soft shoji-style light, and a few botanical shadow patterns; no readable labels. Generic premium fountain pens in deep black, vermilion, dark green, natural wood, and warm ebonite finishes; loose nibs and material samples; no exact product copy, no logos. Wide 16:9 landscape cover, top-down oblique view, material samples and pens arranged like a quiet study across the lower right, open parchment negative space upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.
