# Warm Pen Atlas 批量图像记录（二）

日期：2026-06-25

用途：用户确认两张 Warm Pen Atlas 小样风格后，继续制作第二批可进入项目的 bitmap 插画资产。第二批优先补刚扩写的品牌馆，以及近期已有型号档案但缺少站内原创入口图的页面。

执行方式：内置 image generation，一张资产一个 prompt。原始生成图保留在 Codex 默认生成目录；项目中使用压缩后的 JPEG。

## 统一约束

- 风格：沿用 Warm Pen Atlas，暖纸色、手绘墨线、水彩质感、档案馆/编辑部图册气质。
- 画幅：16:9 landscape。
- 文字：不在图内放可读正文、标签或品牌名。
- 避免：品牌 logo、真实商标、精确产品复刻、随机乱码、水印、人物。
- 用途：站内原创插画，`license = site-original`。
- 事实边界：bitmap 插画只做封面/入口/氛围图；机制事实仍以站内 SVG、正文说明和来源卡为准。

## 第二批资产

| 文件 | 媒体标题 | 关联 | 用途 |
| --- | --- | --- | --- |
| `/images/library/warm-pen-atlas/opus88-brand-cover.jpg` | Warm Pen Atlas: Opus 88 品牌馆封面 | `brand/opus88` | Opus 88 品牌馆入口 |
| `/images/library/warm-pen-atlas/eversharp-brand-cover.jpg` | Warm Pen Atlas: Eversharp 品牌馆封面 | `brand/eversharp` | Eversharp 品牌馆入口 |
| `/images/library/warm-pen-atlas/moore-brand-cover.jpg` | Warm Pen Atlas: Moore 品牌馆封面 | `brand/moore` | Moore 品牌馆入口 |
| `/images/library/warm-pen-atlas/noodlers-ink-brand-cover.jpg` | Warm Pen Atlas: Noodler's Ink 品牌馆封面 | `brand/noodlers` | Noodler's 品牌馆入口 |
| `/images/library/warm-pen-atlas/twsbi-diamond-mini-archive-cover.jpg` | Warm Pen Atlas: Diamond Mini 型号档案封面 | `pen/三文堂-twsbi-diamond-mini-al` | 透明活塞小尺寸型号档案入口 |
| `/images/library/warm-pen-atlas/twsbi-go-spring-piston-cover.jpg` | Warm Pen Atlas: TWSBI GO 弹簧活塞封面 | `pen/三文堂-twsbi-go` | 弹簧活塞型号档案入口 |
| `/images/library/warm-pen-atlas/namiki-makie-archive-cover.jpg` | Warm Pen Atlas: Namiki Maki-e 型号档案封面 | `pen/并木-namiki-emperor` | 大型日式漆艺钢笔型号档案入口 |
| `/images/library/warm-pen-atlas/literary-editions-archive-cover.jpg` | Warm Pen Atlas: 文学限量系列封面 | `pen/万宝龙-montblanc-大文豪系列-writers-edition` | 文学限量/收藏系列档案入口 |

预览拼图：

- `docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-contact-sheet.jpg`

## Prompt Set

### Opus 88 品牌馆封面

Create a wide editorial illustration for the Opus 88 brand museum entry in the same approved Warm Pen Atlas style. Warm archival desk, pale paper background, small catalog cards, a Taiwanese maker workshop mood, transparent eyedropper fountain pen components, ink bottle, blank timeline slips, and relation-map pins. Generic modern eyedropper fountain pens with transparent barrels and visible ink chambers. 16:9 landscape, generous negative space on the left, richer objects on the right and lower third. Warm cream paper, ink black, amber brass, muted blue-gray, deep red ink accents. No readable text, no labels, no logos, no trademarks, no exact product reproduction, no people, no watermark.

### Eversharp 品牌馆封面

Create a wide editorial illustration for an Eversharp / 1940s American industrial-design brand museum entry in the approved Warm Pen Atlas style. Warm archival desk with anonymous 1940s streamlined pen silhouettes, mechanical pencil parts, blank design sketches, curved aerodynamic profile cards, patent-like sheets without readable text, and a brass desk lamp. No exact Skyline reproduction, no logos, no readable labels.

### Moore 品牌馆封面

Create a wide editorial illustration for a Moore / Boston early American safety-pen brand museum entry in the approved Warm Pen Atlas style. Warm archive desk with anonymous early 1900s safety-pen silhouettes, Boston workshop mood, blank company folders, old map-like papers, hard rubber material swatches, eyedropper/safety cap parts, and a magnifying glass. No exact Moore model reproduction, no logos, no readable labels.

### Noodler's Ink 品牌馆封面

Create a wide editorial illustration for a Noodler's-style ink culture brand museum entry in the approved Warm Pen Atlas style, without using any brand identity. Warm archival desk with many unlabeled glass ink bottles, color swatch strips, chromatography-like ink wash papers, fountain pen nib tests, blank catalog cards, and small relation-map pins. No exact bottle or packaging reproduction, no readable labels, no logos, no watermark.

### Diamond Mini 型号档案封面

Create a wide editorial model-archive illustration for a compact transparent piston demonstrator fountain pen, in the approved Warm Pen Atlas style. Warm archival desk with one generic short transparent fountain pen, piston knob and barrel cutaway sketch sheets, small wrench silhouette, ink chamber color swatches, blank catalog cards, and measuring calipers. No exact TWSBI product reproduction, no logos, no readable labels.

### TWSBI GO 弹簧活塞封面

Create a wide editorial model-archive illustration for a spring-piston fountain pen filling concept, in the approved Warm Pen Atlas style. Warm drafting table with a generic chunky demonstrator fountain pen, spring mechanism sketch sheets, ink chamber thumbnails, an exploded-parts tray, blank catalog cards, and maintenance tools. No exact TWSBI GO reproduction, no logos, no readable labels.

### Namiki Maki-e 型号档案封面

Create a wide editorial model-archive illustration for a large luxury Japanese maki-e fountain pen archive entry, in the approved Warm Pen Atlas style. Warm museum desk with a generic oversized lacquer-like fountain pen silhouette, blank art-study cards, gold-powder texture samples, urushi-like swatches, soft cloth, display tray, and archive folders. No exact Namiki/Pilot product reproduction, no exact maki-e motif copy, no logos, no readable labels.

### 文学限量系列封面

Create a wide editorial archive illustration for a literary limited-edition fountain pen collection entry, in the approved Warm Pen Atlas style. Warm library desk with anonymous ornate fountain pen silhouettes, blank manuscript pages, book stacks, display tray, archival collection cards, fabric ribbon, and a magnifying glass. No white star emblem, no exact Montblanc product reproduction, no logos, no readable labels.
