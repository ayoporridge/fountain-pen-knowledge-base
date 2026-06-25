# Warm Pen Atlas 批量图像记录

日期：2026-06-24

用途：用户确认两张 GPT image 小样后，按相同视觉方向制作第一批可进入项目的 bitmap 插画资产。

执行方式：内置 image generation，一张资产一个 prompt。原始生成图保留在 Codex 默认生成目录；项目中使用压缩后的 JPEG。

## 统一约束

- 风格：Warm Pen Atlas，暖纸色、手绘墨线、水彩质感、档案馆/编辑部图册气质。
- 画幅：16:9 landscape。
- 文字：不在图内放可读正文、标签或品牌名。
- 避免：品牌 logo、真实商标、精确产品复刻、随机乱码、水印、人物。
- 用途：站内原创插画，`license = site-original`。
- 事实边界：bitmap 插画只做氛围/入口图；机制事实仍以站内 SVG、正文说明和来源卡为准。

## 首批资产

| 文件 | 媒体标题 | 关联 | 用途 |
| --- | --- | --- | --- |
| `/images/library/warm-pen-atlas/library-hero.jpg` | Warm Pen Atlas: 图书馆入口封面 | 无 | `/library` hero |
| `/images/library/warm-pen-atlas/brand-museum-cover.jpg` | Warm Pen Atlas: 品牌馆封面 | 无 | 品牌馆/来源叙事入口 |
| `/images/library/warm-pen-atlas/mechanism-lab-cover.jpg` | Warm Pen Atlas: 机制实验室封面 | `concept/vacuum-filler` | 工艺/机制入口 |
| `/images/library/warm-pen-atlas/vacuum-filler-model-cover.jpg` | Warm Pen Atlas: 真空上墨型号封面 | `pen/pilot-custom-823` | 真空上墨型号档案氛围图 |
| `/images/library/warm-pen-atlas/school-design-model-cover.jpg` | Warm Pen Atlas: 现代校用设计型号封面 | `pen/凌美-lamy-safari-狩猎者` | 现代校用/设计入口 |
| `/images/library/warm-pen-atlas/piston-demonstrator-model-cover.jpg` | Warm Pen Atlas: 透明活塞示范笔封面 | `pen/三文堂-twsbi-eco` | 透明活塞示范笔入口 |
| `/images/library/warm-pen-atlas/pocket-pens-exhibit-cover.jpg` | Warm Pen Atlas: 口袋笔专题封面 | `pen/kaweco-liliput` | 口袋笔专题入口 |

## Prompt Set

### 图书馆入口封面

Create a wide editorial illustration in the same warm archival desk style as a fountain pen atlas cover. A quiet study desk with open notebooks, fountain pens, catalog cards, timeline strips, small relation-map strings, and archival drawers. Leave generous negative space on the left for website text, with the richer objects on the right and lower third. Warm paper background, wooden desk, soft library shelves, brass reading lamp, subtle map and diagram papers. Polished hand-drawn editorial illustration, warm ink-and-watercolor atlas style, clean linework, subtle paper texture. No text, no logos, no readable labels, no trademarks, no watermark.

### 品牌馆封面

Create a wide editorial illustration for the brand museum area of a fountain pen library. Show a curator's desk with brand-history folders, blank catalog tabs, fountain pen silhouettes, timeline cards, archival boxes, and thin red/blue relationship threads connecting anonymous maker cards. Warm paper wall, shallow shelves, wood table, archival drawers, soft brass lamp glow. No brand logos, no readable labels, no fake letters, no exact product reproduction.

### 机制实验室封面

Create a wide educational illustration for a fountain pen mechanism laboratory. Show a generic transparent fountain pen body, piston/vacuum filling components, converter parts, ink flow arrows, and small blank callout panels, but do not include any readable text. Warm paper drafting table, subtle grid paper, tools, diagram sheets. Educational but not a source of factual labels. No brand logos, no exact product copy.

### 真空上墨型号封面

Create a wide editorial model-archive illustration for a generic vacuum-filling fountain pen, inspired by the idea of a transparent barrel and red ink reservoir, without copying any real model. Show one elegant transparent fountain pen, a small vacuum mechanism sketch sheet, and archival catalog cards on a warm desk. No exact Pilot Custom 823 reproduction, no brand logos, no readable labels.

### 现代校用设计型号封面

Create a wide editorial model-archive illustration for a modern colorful school-friendly fountain pen system. Show several generic plastic fountain pens with triangular grip hints, interchangeable steel nib sketches, color swatches, and a notebook with design-study sketches, but no real brand identity. No exact LAMY safari reproduction, no readable labels.

### 透明活塞示范笔封面

Create a wide editorial model-archive illustration for a generic transparent piston demonstrator fountain pen. Show a clear barrel with visible piston mechanism, colored ink chamber, maintenance wrench silhouette, nib units, and color-version swatches on archive paper. No exact TWSBI ECO reproduction, no brand logos, no readable labels.

### 口袋笔专题封面

Create a wide editorial historical exhibit illustration about compact pocket fountain pens. Show small pocket-sized fountain pens, capped and posted length comparison silhouettes, brass and aluminum material samples, travel notebook, ticket stubs, and archive cards on a desk. No exact Kaweco product reproduction, no brand logos, no readable labels.
