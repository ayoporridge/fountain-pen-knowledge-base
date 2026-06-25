# Warm Pen Atlas 批量图像记录（七）

日期：2026-06-25

用途：为已有故事、来源和 claim 支撑但还缺站内原创封面的核心设计/日系工艺/现代机制品牌馆补图。第七批继续采用“每个品牌 1 张封面图”的策略；如果未来同一品牌需要多张历史场景、工坊细节、型号陈列或玩家桌面图，需要重新规划更多视角、场景和构图。

执行方式：内置 image generation，一张资产一个 prompt。原始生成图保留在 Codex 默认生成目录；项目中使用压缩后的 JPEG。

## 统一约束

- 风格：沿用 Warm Pen Atlas，暖纸色、手绘墨线、水彩质感、档案馆/编辑部图册气质。
- 画幅：16:9 landscape。
- 文字：不在图内放可读正文、标签、品牌名、数字或伪文字。
- 避免：品牌 logo、真实商标、精确产品复刻、随机乱码、水印、人物。
- 用途：站内原创插画，`license = site-original`。
- 事实边界：bitmap 插画只做封面/入口/氛围图；品牌史实仍由正文、claims 和来源卡承担。

## 第七批资产

| 文件 | 媒体标题 | 关联 | 用途 |
| --- | --- | --- | --- |
| `/images/library/warm-pen-atlas/twsbi-brand-cover.jpg` | Warm Pen Atlas: TWSBI 品牌馆封面 | `brand/twsbi` | TWSBI 品牌馆入口 |
| `/images/library/warm-pen-atlas/nakaya-brand-cover.jpg` | Warm Pen Atlas: Nakaya 品牌馆封面 | `brand/nakaya` | Nakaya 品牌馆入口 |
| `/images/library/warm-pen-atlas/sailor-brand-cover.jpg` | Warm Pen Atlas: Sailor 品牌馆封面 | `brand/sailor` | Sailor 品牌馆入口 |
| `/images/library/warm-pen-atlas/lamy-brand-cover.jpg` | Warm Pen Atlas: LAMY 品牌馆封面 | `brand/lamy` | LAMY 品牌馆入口 |
| `/images/library/warm-pen-atlas/aurora-brand-cover.jpg` | Warm Pen Atlas: Aurora 品牌馆封面 | `brand/aurora` | Aurora 品牌馆入口 |
| `/images/library/warm-pen-atlas/namiki-brand-cover.jpg` | Warm Pen Atlas: Namiki 品牌馆封面 | `brand/namiki` | Namiki 品牌馆入口 |

预览拼图：

- `docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-core-design-brands-contact-sheet.jpg`

## Prompt Set

### TWSBI 品牌馆封面

Create a site-original cover artwork for the TWSBI fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style with a transparent-filling-system study mood. A clean modern mechanism archive desk with transparent pen barrels, piston components, ink reservoirs, unlabeled engineering cards, clear acrylic blocks, and neutral archive folders; no readable text. Generic transparent demonstrator fountain pens with piston and vacuum-filler inspired parts, loose nib units, converters, seals, and ink sample drops; no exact product copy, no logos. Wide 16:9 landscape cover, high oblique angle, translucent objects catching warm light across lower right and center, generous parchment negative space upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.

### Nakaya 品牌馆封面

Create a site-original cover artwork for the Nakaya fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style with a Japanese handcraft and lacquer mood. A quiet artisan desk with lacquer sample tiles, ebonite rods, soft cloth, blank order cards, small brush rest, neutral wooden tray, and filtered shoji-style light; no readable labels. Generic handmade-looking fountain pens in deep black, vermilion, dark brown, and subtle urushi-like finishes, with loose nibs and cap bands; no exact product copy, no logos. Wide 16:9 landscape cover, close top-down oblique view, pens and lacquer samples arranged calmly in lower right and center, open parchment negative space upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.

### Sailor 品牌馆封面

Create a site-original cover artwork for the Sailor fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style with a Japanese nib and nautical archive mood. A refined writing-instrument archive desk with blank nib-grading cards, a small brass loupe, navy cloth, sea-chart-like paper with no readable text, wooden drawers, and soft catalog folders. Generic Japanese fountain pens in navy, ivory, black, and deep burgundy, with a few gold nibs displayed in a tray; suggest nib craftsmanship and maritime heritage without logos or exact product copies. Wide 16:9 landscape cover, three-quarter desk view, nib tray and pens in lower right and center, open parchment area upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.

### LAMY 品牌馆封面

Create a site-original cover artwork for the LAMY fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style with a modern industrial design studio mood. A restrained design studio desk with blank sketch cards, matte material swatches, ergonomic grip studies drawn as simple unlabeled geometry, modular pen trays, a gray notebook, and clean desk tools; no readable text. Generic modern school and design fountain pens in matte charcoal, white, red, and blue finishes, with simple clips and grip-section studies; no exact Safari copy, no logos. Wide 16:9 landscape cover, high oblique view, organized modular clusters on lower right and center, large warm negative space upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.

### Aurora 品牌馆封面

Create a site-original cover artwork for the Aurora fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style with an Italian classic writing-instrument archive mood. An elegant Italian archive desk with walnut drawers, cream catalog folders with blank covers, a small brass lamp, marble-like material swatches, old city-map tones without readable text, and a dark velvet pen tray. Generic classic fountain pens in black, burgundy, deep green, and ivory with gold trim, several gold nibs and cap bands arranged as archival objects; no exact product copy, no logos. Wide 16:9 landscape cover, three-quarter desk view, dark velvet tray on lower right, archive folders and swatches behind, generous parchment negative space upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy.

### Namiki 品牌馆封面

Create a site-original cover artwork for the Namiki fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustration style with a luxury maki-e archive mood. A refined Japanese luxury pen archive desk with black lacquer sample panels, gold powder swatches, blank presentation folders, soft silk cloth, a wooden display box, and warm museum lighting; no readable labels. Generic large lacquer fountain pens in deep black, vermilion, dark blue, and muted gold accents; subtle abstract maki-e-like flecks and botanical motifs that do not copy any real artwork; loose gold nibs; no logos. Wide 16:9 landscape cover, low three-quarter display view, luxurious pen objects clustered on lower right and center, generous parchment negative space upper left. No readable words, no numbers, no labels, no logos, no watermark, no people, no photorealistic brand reproduction, no exact product copy, no direct copy of real maki-e artwork.
