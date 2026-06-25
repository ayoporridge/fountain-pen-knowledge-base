# Warm Pen Atlas 批量图像记录（四）

日期：2026-06-25

用途：继续为已经扩写、已有来源支撑但还缺站内原创封面的现代中国与台湾品牌馆补图。第四批仍采用“每个品牌 1 张封面图”的策略；如果未来同一品牌需要多张历史场景、工坊、展柜或型号插图，需要重新规划更多视角、场景和构图。

执行方式：内置 image generation，一张资产一个 prompt。原始生成图保留在 Codex 默认生成目录；项目中使用压缩后的 JPEG。Snowhite、Delike、Duke、KACO 在初稿中出现过轻微伪文字或伪清单痕迹，最终只保留重生后的干净版本。

## 统一约束

- 风格：沿用 Warm Pen Atlas，暖纸色、手绘墨线、水彩质感、档案馆/编辑部图册气质。
- 画幅：16:9 landscape。
- 文字：不在图内放可读正文、标签、品牌名、数字或伪文字。
- 避免：品牌 logo、真实商标、精确产品复刻、随机乱码、水印、人物。
- 用途：站内原创插画，`license = site-original`。
- 事实边界：bitmap 插画只做封面/入口/氛围图；品牌史实仍由正文、claims 和来源卡承担。

## 第四批资产

| 文件 | 媒体标题 | 关联 | 用途 |
| --- | --- | --- | --- |
| `/images/library/warm-pen-atlas/skb-brand-cover.jpg` | Warm Pen Atlas: SKB 品牌馆封面 | `brand/skb` | SKB 品牌馆入口 |
| `/images/library/warm-pen-atlas/penbbs-brand-cover.jpg` | Warm Pen Atlas: PenBBS 品牌馆封面 | `brand/penbbs` | PenBBS 品牌馆入口 |
| `/images/library/warm-pen-atlas/duke-brand-cover.jpg` | Warm Pen Atlas: Duke 品牌馆封面 | `brand/duke` | Duke 品牌馆入口 |
| `/images/library/warm-pen-atlas/kaco-brand-cover.jpg` | Warm Pen Atlas: KACO 品牌馆封面 | `brand/kaco` | KACO 品牌馆入口 |
| `/images/library/warm-pen-atlas/snowhite-brand-cover.jpg` | Warm Pen Atlas: Snowhite 品牌馆封面 | `brand/snowhite` | Snowhite 品牌馆入口 |
| `/images/library/warm-pen-atlas/delike-brand-cover.jpg` | Warm Pen Atlas: Delike 品牌馆封面 | `brand/delike` | Delike 品牌馆入口 |

预览拼图：

- `docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-modern-cn-contact-sheet.jpg`

## Prompt Set

### SKB 品牌馆封面

Create a Warm Pen Atlas style editorial illustration for the SKB brand museum entry, focused on Taiwanese school and office writing culture without using any brand identity. Warm archive worktable, pale cream paper, soft daylight, hand-drawn ink lines with watercolor wash, anonymous school fountain pens and writing instruments, cartridge/converter parts, blank classroom notebook sheets, small stationery-store tray, material swatches, relation-map pins, and blank catalog cards. Three-quarter angled desk view, generous clean negative space across the upper left, richer objects clustered along the lower right and center. No readable text, no labels, no logos, no trademarks, no exact SKB product reproduction, no random glyphs, no people, no watermark.

### PenBBS 品牌馆封面

Create a Warm Pen Atlas style editorial illustration for the PenBBS brand museum entry, focused on community fountain-pen culture, ink testing, forum-born collecting, and Chinese enthusiast archives without using any brand identity. Warm archive table mixed with a hobbyist ink-testing bench, anonymous modern fountain pens, unlabeled ink sample vials, chromatography-like swatch strips, blank review cards, small nib/feed sketches, a relation-map board with pins, and stacks of blank forum printout pages with no text. Shallow diagonal tabletop with a small drawer pulled open at the lower edge, negative space on the upper right, dense color swatches and vials along the lower left and center. No readable text, no labels, no logos, no trademarks, no exact PenBBS product reproduction, no random glyphs, no people, no watermark.

### Duke 品牌馆封面

Create a clean Warm Pen Atlas style editorial illustration for the Duke fountain pen brand museum entry, focused on Chinese export-era fountain pens, gift-box presentation, metal trim, converter parts, and catalog research without using any brand identity. Warm museum archive desk, anonymous metal-trim fountain pen silhouettes, unlabeled gift-box inserts, converter and nib parts in a small tray, completely blank catalog cards, plain color and material swatches, archive folders with blank covers, brass magnifier, and relation-map pins. Low three-quarter side view across a display tray with a wide blank cream-paper zone in the upper center. Every paper, card, notebook, folder, box, tray, map, tag, and sheet must be blank or contain only plain ruled lines, color blocks, or simple unlabeled geometry. No letters, no numbers, no symbols, no handwriting, no calligraphy, no pseudo-text, no labels, no logos, no trademarks, no exact Duke product reproduction, no people, no watermark.

### KACO 品牌馆封面

Create a clean Warm Pen Atlas style editorial illustration for the KACO brand museum entry, focused on contemporary Chinese stationery design, minimal everyday writing tools, modular organization, and product-design research without using any brand identity. Bright warm modern archive desk, anonymous minimalist fountain pens and writing instruments, modular desk trays, blank design cards, plain color-chip strips, cartridge/converter parts, an unlabeled blank notebook, small maintenance tools, and relation-map pins. High oblique angle but not flat top-down, open desk surface with precise modular clusters and a large calm blank paper zone in the upper left and center. Every notebook, paper, card, tray, tool, ruler, folder, tag, and sheet must be blank or contain only plain ruled lines, color blocks, or unlabeled geometric marks. No letters, no numbers, no symbols, no handwriting, no pseudo-text, no labels, no logos, no trademarks, no exact KACO product reproduction, no people, no watermark.

### Snowhite 品牌馆封面

Create a clean Warm Pen Atlas style editorial illustration for the Snowhite brand museum entry, focused on Chinese school and office writing culture, everyday stationery, and the fountain-pen-adjacent writing ecosystem without using any brand identity. Warm classroom-office archive desk, anonymous simple fountain pens and everyday writing instruments, refill parts and cartridges in an unlabeled tray, blank exercise-book pages, completely blank office memo pads, plain color swatches, small repair tools, blank catalog cards, and relation-map pins. Slightly above the corner of a tidy school desk, objects arranged in broad bands from lower left to upper right, calm blank paper area near the upper left. Every paper, card, map, notebook, spine, label, and sheet must be blank or contain only simple ruled lines and plain color blocks. No letters, no numbers, no symbols, no handwriting, no pseudo-text, no labels, no logos, no trademarks, no exact Snowhite product reproduction, no people, no watermark.

### Delike 品牌馆封面

Create a clean Warm Pen Atlas style editorial illustration for the Delike brand museum entry, focused on compact pocket fountain pens, small-format everyday carry, brass and acrylic materials, and modern Chinese maker catalog research without using any brand identity. Warm travel desk and open archive drawer, anonymous compact pocket fountain pen silhouettes, short capped pens, brass material swatches, transparent acrylic barrel samples, cartridge/converter parts, plain calipers without numbers, pocket notebook with blank pages, completely blank catalog cards, small tray of nib units, and relation-map pins. Close three-quarter view with archive-tray feeling, central compact pen study, travel notebook lower left, open drawer lower right, quiet blank paper zone across the upper right. Every paper, map, card, notebook, tray, ruler, caliper, spine, tag, and sheet must be blank or contain only plain ruled lines, color blocks, or unlabeled geometric marks. No letters, no numbers, no symbols, no handwriting, no pseudo-text, no labels, no logos, no trademarks, no exact Delike or Kaweco product reproduction, no people, no watermark.
