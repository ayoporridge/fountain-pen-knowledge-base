# Warm Pen Atlas 批量图像记录（五）

日期：2026-06-25

用途：为已经扩写、已有来源支撑但还缺站内原创封面的中国传统/现代平价/礼品钢笔品牌馆补图。第五批继续采用“每个品牌 1 张封面图”的策略；如果未来同一品牌需要多张历史场景、型号细节、工坊或玩家桌面图，需要重新规划更多视角、场景和构图。

执行方式：内置 image generation，一张资产一个 prompt。原始生成图保留在 Codex 默认生成目录；项目中使用压缩后的 JPEG。

## 统一约束

- 风格：沿用 Warm Pen Atlas，暖纸色、手绘墨线、水彩质感、档案馆/编辑部图册气质。
- 画幅：16:9 landscape。
- 文字：不在图内放可读正文、标签、品牌名、数字或伪文字。
- 避免：品牌 logo、真实商标、精确产品复刻、随机乱码、水印、人物。
- 用途：站内原创插画，`license = site-original`。
- 事实边界：bitmap 插画只做封面/入口/氛围图；品牌史实仍由正文、claims 和来源卡承担。

## 第五批资产

| 文件 | 媒体标题 | 关联 | 用途 |
| --- | --- | --- | --- |
| `/images/library/warm-pen-atlas/hero-brand-cover.jpg` | Warm Pen Atlas: Hero 品牌馆封面 | `brand/hero` | Hero 品牌馆入口 |
| `/images/library/warm-pen-atlas/hongdian-brand-cover.jpg` | Warm Pen Atlas: HongDian 品牌馆封面 | `brand/hongdian` | HongDian 品牌馆入口 |
| `/images/library/warm-pen-atlas/picasso-brand-cover.jpg` | Warm Pen Atlas: Picasso 品牌馆封面 | `brand/picasso` | Picasso 品牌馆入口 |
| `/images/library/warm-pen-atlas/jinhao-brand-cover.jpg` | Warm Pen Atlas: Jinhao 品牌馆封面 | `brand/jinhao` | Jinhao 品牌馆入口 |
| `/images/library/warm-pen-atlas/majohn-brand-cover.jpg` | Warm Pen Atlas: Majohn 品牌馆封面 | `brand/majohn` | Majohn 品牌馆入口 |
| `/images/library/warm-pen-atlas/wingsung-brand-cover.jpg` | Warm Pen Atlas: Wing Sung 品牌馆封面 | `brand/wingsung` | Wing Sung 品牌馆入口 |

预览拼图：

- `docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-chinese-legacy-contact-sheet.jpg`

## Prompt Set

### Hero 品牌馆封面

Create a site-original cover artwork for the Hero fountain pen brand museum entry, in the same warm archival illustrated style as the approved Warm Pen Atlas samples. A 1930s-1960s Shanghai writing-instrument archive desk with wooden drawers, old workshop papers, simple factory ledger sheets, pen parts trays, and a muted red notebook suggesting Chinese domestic pen history without readable text. Several generic black and burgundy fountain pens with gold trim, one classic hooded-nib pen silhouette, a few nib sketches and repair tools; no exact product copy, no brand logo. Wide 16:9 landscape cover, desk seen at a three-quarter angle, generous open parchment area on the left for future webpage text, main pen archive objects on the right and lower center. No readable words, no Chinese characters, no logos, no watermark, no distorted text, no people, no photorealistic brand reproduction.

### HongDian 品牌馆封面

Create a site-original cover artwork for the HongDian fountain pen brand museum entry, matching the warm archival illustrated style of the approved Warm Pen Atlas samples while using a fresher modern desk composition. A contemporary pen-review desk with a dark metal pen tray, forest-green notebook, ink swatch cards without readable text, a loupe, and soft shelves in the background; suggest the Black Forest / Dark Blue Forest everyday-pen context without text. Several generic slim metal fountain pens in dark blue, forest green, matte black, and brushed steel; one pen uncapped with a nib visible; no exact product copy, no logos. Wide 16:9 landscape cover, slightly lower eye-level angle, pens arranged diagonally across the lower third, open parchment-toned negative space in upper left for future page text. No readable words, no Chinese characters, no logos, no watermark, no distorted text, no people, no photorealistic brand reproduction.

### Picasso 品牌馆封面

Create a site-original cover artwork for the Picasso fountain pen brand museum entry, matching the approved Warm Pen Atlas warm archival illustration style but with an art-studio gift-pen mood. A refined design studio desk with cream paper, abstract color studies, brushed metal pen stand, small lacquer gift box, art catalog folders, and neatly arranged nib sketches; no readable labels. Generic elegant fountain pens in black, ivory, burgundy, and brushed silver, with decorative trim but no logos; a capped pen resting near abstract ink washes and gift packaging materials. Wide 16:9 landscape cover, top-down diagonal composition, open warm parchment space on the left, focal cluster of pens and art materials on the right and lower center. No readable words, no Chinese characters, no logos, no watermark, no distorted text, no people, no photorealistic brand reproduction, no obvious Picasso artwork imitation.

### Jinhao 品牌馆封面

Create a site-original cover artwork for the Jinhao fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustrated style. A practical modern stationery workbench with simple kraft boxes, inventory cards without readable text, a dark pen tray, loose converters, nib units, ink sample cards, and a shipping-scale silhouette; suggest accessible entry-level fountain pen culture without text. Several generic fountain pens in black, deep blue, burgundy, and translucent smoke finishes; one larger cigar-shaped pen and one small colorful pen, no exact product copy, no logos. Wide 16:9 landscape cover, overhead three-quarter view, dense object cluster across the lower right, broad parchment negative space in upper left. No readable words, no Chinese characters, no logos, no watermark, no distorted text, no people, no photorealistic brand reproduction.

### Majohn 品牌馆封面

Create a site-original cover artwork for the Majohn fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustrated style with a modern mechanism-experiment feeling. A clean maker desk with translucent pens, capless-click mechanism sketches without readable text, small metal springs, converters, nib units, clear acrylic display blocks, and neutral archive folders; suggest modern Chinese mechanism experimentation without logos. Generic modern fountain pens including a capless-style click pen silhouette, a transparent demonstrator pen, and a compact pocket pen; no exact product copy, no logos. Wide 16:9 landscape cover, slightly top-down view, mechanisms and pens arranged in a diagonal from lower left to upper right, open parchment area on the upper left. No readable words, no Chinese characters, no logos, no watermark, no distorted text, no people, no photorealistic brand reproduction, no exact Vanishing Point copy.

### Wing Sung 品牌馆封面

Create a site-original cover artwork for the Wing Sung fountain pen brand museum entry, in the approved Warm Pen Atlas warm archival illustrated style. A layered Chinese fountain pen history archive desk with old catalog folders, school exercise paper without readable writing, muted teal and burgundy notebooks, a repair cloth, simple nib trays, and a few vintage-style pen silhouettes; suggest revival and classic hooded-nib context without logos or text. Generic hooded-nib fountain pens and slim classic pens in dark teal, black, burgundy, and warm ivory; one open pen with a hooded nib visible; no exact product copy, no logos. Wide 16:9 landscape cover, objects arranged as a loose timeline from lower left vintage papers to upper right modern tray, large open parchment area in upper left for future title overlay. No readable words, no Chinese characters, no logos, no watermark, no distorted text, no people, no photorealistic brand reproduction, no exact Parker 51 copy.
