# Warm Pen Atlas 批量图像记录（三）

日期：2026-06-25

用途：在用户确认两张 Warm Pen Atlas 小样风格可用后，继续为最近已扩写且有来源支撑的品牌馆补站内原创封面。第三批只采用“每个品牌 1 张图”的策略；如果后续为同一品牌制作多张图，需要重新规划更丰富的视角、场景和构图。

执行方式：内置 image generation，一张资产一个 prompt。原始生成图保留在 Codex 默认生成目录；项目中使用压缩后的 JPEG。

## 统一约束

- 风格：沿用 Warm Pen Atlas，暖纸色、手绘墨线、水彩质感、档案馆/编辑部图册气质。
- 画幅：16:9 landscape。
- 文字：不在图内放可读正文、标签或品牌名。
- 避免：品牌 logo、真实商标、精确产品复刻、随机乱码、水印、人物。
- 用途：站内原创插画，`license = site-original`。
- 事实边界：bitmap 插画只做封面/入口/氛围图；品牌史实仍由正文、claims 和来源卡承担。

## 第三批资产

| 文件 | 媒体标题 | 关联 | 用途 |
| --- | --- | --- | --- |
| `/images/library/warm-pen-atlas/wahl-brand-cover.jpg` | Warm Pen Atlas: Wahl 品牌馆封面 | `brand/wahl` | Wahl 品牌馆入口 |
| `/images/library/warm-pen-atlas/chilton-brand-cover.jpg` | Warm Pen Atlas: Chilton 品牌馆封面 | `brand/chilton` | Chilton 品牌馆入口 |
| `/images/library/warm-pen-atlas/dunn-brand-cover.jpg` | Warm Pen Atlas: Dunn 品牌馆封面 | `brand/dunn` | Dunn 品牌馆入口 |
| `/images/library/warm-pen-atlas/wearever-brand-cover.jpg` | Warm Pen Atlas: Wearever 品牌馆封面 | `brand/wearever` | Wearever 品牌馆入口 |
| `/images/library/warm-pen-atlas/graphomatic-brand-cover.jpg` | Warm Pen Atlas: Graphomatic 品牌馆封面 | `brand/graphomatic` | Graphomatic 品牌馆入口 |
| `/images/library/warm-pen-atlas/ingersoll-brand-cover.jpg` | Warm Pen Atlas: Ingersoll 品牌馆封面 | `brand/ingersoll` | Ingersoll 品牌馆入口 |
| `/images/library/warm-pen-atlas/morrison-brand-cover.jpg` | Warm Pen Atlas: Morrison 品牌馆封面 | `brand/morrison` | Morrison 品牌馆入口 |
| `/images/library/warm-pen-atlas/wasp-brand-cover.jpg` | Warm Pen Atlas: WASP 品牌馆封面 | `brand/wasp` | WASP 品牌馆入口 |
| `/images/library/warm-pen-atlas/monteverde-brand-cover.jpg` | Warm Pen Atlas: Monteverde 品牌馆封面 | `brand/monteverde` | Monteverde 品牌馆入口 |

预览拼图：

- `docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-vintage-brand-contact-sheet.jpg`

## Prompt Set

### Wahl 品牌馆封面

Create a wide editorial illustration for a Wahl fountain pen brand museum entry, focused on early 20th century American writing instruments and metal-overlay craft without using any brand identity. Warm archive desk with blank catalog cards, anonymous gold-filled overlay pattern swatches, lever-filler mechanism sketch sheets, mechanical pencil parts, hard-rubber material chips, brass calipers, and relation-map pins. 16:9 landscape, generous clean negative space on the left, richer objects on the right and lower third. No readable text, no labels, no logos, no trademarks, no exact Wahl or Eversharp model reproduction, no people, no watermark, no random glyphs.

### Chilton 品牌馆封面

Create a wide editorial illustration for a Chilton fountain pen brand museum entry, centered on pneumatic filling research and early American workshop archives without using any brand identity. Warm drafting desk with anonymous black hard-rubber and celluloid pen silhouettes, a generic pneumatic filler tube and plunger sketch, blank patent-like sheets, small pressure bulb diagrams with no readable labels, empty archive folders, brass ruler, and relation-map pins. No readable text, no labels, no logos, no trademarks, no exact Chilton model reproduction.

### Dunn 品牌馆封面

Create a wide editorial illustration for a Dunn fountain pen brand museum entry, focused on early 1920s pump-filling experimentation and repair-bench archive material without using any brand identity. Warm workbench with anonymous flat-top hard-rubber pen silhouettes, a generic pump-filler rod and packing unit, exploded parts tray, blank patent-style pages, small ink-flow arrows on unlabeled sketches, archive folders, brass tweezers, calipers, and relation-map pins. No exact Dunn model reproduction, no readable text, no labels, no logos.

### Wearever 品牌馆封面

Create a wide editorial illustration for a Wearever fountain pen brand museum entry, focused on mid-century mass-market American fountain pens, colorful celluloid, school and department-store writing culture, without using any brand identity. Warm archive desk with anonymous inexpensive fountain pen silhouettes in varied muted colors, blank price-tag cards with no numbers, empty store-counter trays, repair nib boxes with no text, catalog folders, swatch strips, relation-map pins, and a small ink bottle. No exact Wearever model reproduction, no readable text, no labels, no logos.

### Graphomatic 品牌馆封面

Create a wide editorial illustration for a Graphomatic fountain pen brand museum entry, centered on writing-instrument mechanics, drafting culture, and catalog research, without using any brand identity. Warm archive desk with anonymous streamlined pens and mechanical-pencil silhouettes, blank technical cards, a generic feed-and-nib sketch, graphite leads in a small tray, drafting compass, brass ruler, archive folders, relation-map pins, and ink swatch papers. No exact model reproduction, no readable text, no labels, no logos.

### Ingersoll 品牌馆封面

Create a wide editorial illustration for an Ingersoll fountain pen brand museum entry, focused on value-priced early 20th century writing goods, mail-order catalog culture, and everyday repair archives, without using any brand identity. Warm archive desk with anonymous simple fountain pen silhouettes, blank mail-order catalog pages, empty price cards with no numbers, small nib repair tray, inexpensive material swatches, folded envelopes with no addresses, archive folder box, relation-map pins, and an ink bottle. No exact Ingersoll model reproduction, no readable text, no labels, no logos.

### Morrison 品牌馆封面

Create a wide editorial illustration for a Morrison fountain pen brand museum entry, focused on New York-era colorful celluloid fountain pens and catalog-card research, without using any brand identity. Warm archive desk with anonymous streamlined celluloid pen silhouettes in marbled blue, burgundy, green, and black, blank catalog cards, material swatch strips, nib/feed sketches, city-map-like papers without readable place names, archive folders, brass magnifier, and relation-map pins. No exact Morrison model reproduction, no readable text, no labels, no logos.

### WASP 品牌馆封面

Create a wide editorial illustration for a WASP fountain pen brand museum entry, focused on 1930s American sub-brand production, colorful plastics, lever-filler mechanics, and catalog evidence, without using any brand identity. Warm archive desk with anonymous 1930s-style fountain pen silhouettes, marbled celluloid swatches, a generic lever-filler cutaway sketch, blank catalog cards, small anonymous factory route map with no readable names, repair tray, archive folders, relation-map pins. No exact WASP or Sheaffer model reproduction, no insects, no readable text, no labels, no logos.

### Monteverde 品牌馆封面

Create a wide editorial illustration for a Monteverde fountain pen brand museum entry, focused on modern accessible fountain pens, color variety, refill systems, and everyday desk use, without using any brand identity. Warm contemporary archive desk with anonymous modern fountain pen silhouettes in muted colors, blank refill/converter cards, ink swatch strips, small maintenance tools, unlabeled cartridge and converter parts, catalog folders, relation-map pins, and an ink bottle. No exact Monteverde product reproduction, no readable text, no labels, no logos.
