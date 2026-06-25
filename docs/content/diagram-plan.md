# 钢笔图书馆绘图计划

目标：为“钢笔图书馆”建立可持续的图示体系，让品牌故事、型号档案和机制实验室都有清晰、统一、可复用的视觉材料。

## 图示分类

### 第一批机制图

1. 活塞上墨：旋钮、螺杆、活塞、墨仓、笔舌流路。
2. 真空上墨：推杆、密封圈、负压腔、锁墨阀。
3. 杠杆上墨：杠杆、压片、墨囊、回弹过程。
4. 墨囊/转换器：墨囊、转换器、接口、适配关系。
5. 笔尖与笔舌结构：铱粒、开缝、呼吸孔、肩部、笔舌鳍片、供墨通道。

### 第二批型号图

1. Pilot Custom 823：真空上墨与 Custom 系列位置。
2. LAMY 2000：包豪斯风格、半包尖、活塞结构。
3. Parker 51：暗尖、集成笔舌、Aerometric/Vacumatic 版本差异。
4. Pelikan Souveran：活塞上墨、条纹笔身、M 系列尺寸梯度。
5. Wing Sung 601：Parker 51 语境下的国产暗尖与泵式上墨路线。

### 第三批品牌/专题图

1. 日本三大厂关系图：Pilot / Sailor / Platinum 的设计路线。
2. LAMY 设计时间线：2000、Safari、Dialog 等节点。
3. Parker 51 神话路径：设计、广告、量产、复刻、玩家评价。
4. Pelikan 活塞路线：100 到 M 系列。
5. 中国国笔记忆：英雄、永生、金星、关勒铭的关系线索。

## 视觉风格

统一命名：`Warm Pen Atlas`。

- 背景：暖纸色，低纹理，不做羊皮纸装饰边。
- 线条：墨色细线，关键流向用暖金/铜色。
- 结构：等距或轻微剖面图，避免真实品牌产品外观复刻。
- 字体：站内 UI 字体，中文标签清晰可读。
- 信息密度：一张图只解释一个机制或一个关系。
- 色彩：墨黑、纸白、铜金、蓝灰、胭脂红少量点缀。
- 许可：默认站内原创，图示元数据写入 `diagrams.license = site-original`。

## 小样本测试流程

1. 先用站内 SVG 做 5 张机制图的 MVP，验证页面布局、热点标注和移动端缩放。
2. 再用 GPT image 模型生成 1 张“机制实验室风格样张”和 1 张“品牌展厅封面风格样张”。
3. 把样张展示给用户确认：
   - 是否更偏“技术图册”还是“编辑部插画”。
   - 是否需要更多真实感或更强抽象感。
   - 标签文字是否应该出现在图片内，还是全部由网页叠加。
4. 用户确认后才批量生成第二批型号图与第三批专题图。2026-06-24 用户已确认两张小样风格可用；2026-06-24 首批 bitmap 插画已进入项目；2026-06-25 第二批品牌/型号入口图和第三批 vintage/modern 品牌馆封面已进入项目。
5. 批量制作前，每张图都要有 `diagram brief`：
   - 关联实体
   - 要解释的知识点
   - 必须避免的品牌/商标误用
   - 参考来源
   - 输出尺寸与用途

## GPT Image 小样本计划

当前预览样张已保存到：

- `docs/content/image-samples/warm-pen-atlas-vacuum-sample.png`
- `docs/content/image-samples/warm-pen-atlas-library-cover-sample.png`

注意：GPT image 样张只用于确认视觉方向，不直接作为事实图上线。机制图上线前仍以站内 SVG 或人工复核后的 diagram brief 为准。

### 样张 A：机制实验室

主题：真空上墨机制教育图。

要求：暖纸背景、墨色剖面线、铜色流向箭头、中文标签留白区，不复刻任何具体品牌产品。

用途：机制页顶部插图或卡片封面。

### 样张 B：品牌展厅

主题：钢笔图书馆品牌馆封面。

要求：像编辑部图册封面，一张桌面上有钢笔、目录卡、时间线纸片、关系图线索；不出现真实品牌 logo。

用途：`/library` 和品牌馆入口。

## 首批批量图像

用户已确认整体风格可用。首批生成记录见 `docs/content/warm-pen-atlas-batch-2026-06-24.md`。

已进入项目的图片：

- `public/images/library/warm-pen-atlas/library-hero.jpg`
- `public/images/library/warm-pen-atlas/brand-museum-cover.jpg`
- `public/images/library/warm-pen-atlas/mechanism-lab-cover.jpg`
- `public/images/library/warm-pen-atlas/vacuum-filler-model-cover.jpg`
- `public/images/library/warm-pen-atlas/school-design-model-cover.jpg`
- `public/images/library/warm-pen-atlas/piston-demonstrator-model-cover.jpg`
- `public/images/library/warm-pen-atlas/pocket-pens-exhibit-cover.jpg`

入库规则：

- `media_assets.review_status = approved`
- `media_assets.usage_status = gallery`
- `license = site-original`
- 来源登记为 `Warm Pen Atlas generated artwork`
- `/library` 首页使用 `library-hero.jpg` 作为 hero 背景
- 机制事实仍以站内 SVG 与来源卡为准，GPT image 插画只做入口和氛围图

## 第二批批量图像

用户已确认两张小样风格可用后，继续按同一视觉方向生成第二批品牌/型号入口图。第二批生成记录见 `docs/content/warm-pen-atlas-batch-2026-06-25.md`。

已进入项目的图片：

- `public/images/library/warm-pen-atlas/opus88-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/eversharp-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/moore-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/noodlers-ink-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/twsbi-diamond-mini-archive-cover.jpg`
- `public/images/library/warm-pen-atlas/twsbi-go-spring-piston-cover.jpg`
- `public/images/library/warm-pen-atlas/namiki-makie-archive-cover.jpg`
- `public/images/library/warm-pen-atlas/literary-editions-archive-cover.jpg`

第二批仍遵守同一事实边界：bitmap 插画只做封面/入口/氛围图；具体机制、型号差异和史实仍由 SVG、正文与来源卡承担。

## 第三批批量图像

用户确认如果“每个品牌只有 1 张封面图”，可以继续沿用当前 Warm Pen Atlas 风格；如果未来同一品牌要多张图，则需要重新规划更多视角、场景和构图。第三批因此只给最近扩写过、已有来源支撑的品牌馆各补 1 张封面图。第三批生成记录见 `docs/content/warm-pen-atlas-batch-2026-06-25-vintage-brands.md`。

已进入项目的图片：

- `public/images/library/warm-pen-atlas/wahl-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/chilton-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/dunn-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/wearever-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/graphomatic-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/ingersoll-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/morrison-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/wasp-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/monteverde-brand-cover.jpg`

第三批仍是一品牌一封面，不扩展到同品牌多图。后续如果为同一品牌制作历史场景、工坊、展柜、机制图或型号图，需要先写新的多构图 prompt brief，避免书桌构图重复。

## 第四批批量图像

用户指出当前系列如果继续一品牌一张封面图可以推进；如果同一品牌要多张图，需要重新规划视角、场景与构图。第四批因此继续只给缺图品牌各补 1 张封面，并在同一 Warm Pen Atlas 风格内轻微轮换构图。第四批生成记录见 `docs/content/warm-pen-atlas-batch-2026-06-25-modern-cn.md`。

已进入项目的图片：

- `public/images/library/warm-pen-atlas/skb-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/penbbs-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/duke-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/kaco-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/snowhite-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/delike-brand-cover.jpg`

第四批覆盖现代中国与台湾品牌入口：SKB、PenBBS、Duke、KACO、Snowhite、Delike。Snowhite、Delike、Duke、KACO 初稿中出现的伪文字或伪清单版本不进入项目，只保留重生后的干净版本。

## 后续批量制作确认点

已确认：

1. 图像风格方向：沿用 Warm Pen Atlas 小样。
2. 首批 bitmap 插画不在图中放可读中文标签；文字说明由网页承载。
3. 机制事实图继续以 SVG 为主，GPT image 插画作为封面/氛围图。
4. 首批覆盖图书馆入口、品牌馆、机制实验室、真空上墨型号、现代校用设计型号、透明活塞示范笔、口袋笔专题；第二批覆盖 Opus 88、Eversharp、Moore、Noodler's 品牌入口，以及 TWSBI Diamond Mini、TWSBI GO、Namiki Emperor、文学限量系列型号/专题入口；第三批覆盖 Wahl、Chilton、Dunn、Wearever、Graphomatic、Ingersoll、Morrison、WASP、Monteverde 品牌入口；第四批覆盖 SKB、PenBBS、Duke、KACO、Snowhite、Delike 品牌入口。
5. 图像默认 `site-original`，入媒体资产表时标注 AI-assisted/site-original 归属。

## 初始验收

- 5 张 SVG 机制图可在页面渲染。
- 每张图都有热点标注。
- 移动端不会撑破布局。
- GPT image 小样已经提交给用户确认。
- 未经确认不批量生成型号/品牌图片。
