# 中世纪手抄本风格 × 钢笔知识图谱：设计分析与实施方案

> 基于 Stephen(@stephenbtl) 的 "Training a LoRA on FLUX.2 [klein] with Hermes Agent" 文章分析
> 日期：2026-06-12

---

## 一、文章核心内容提取

### 这篇文章在讲什么

Stephen 用 Hermes Agent 自动化训练了一个 **medieval marginalia（中世纪边注）** 风格的 LoRA，挂载在 FLUX.2 [klein] 上。核心流程：

1. **选题**：让 Agent 搜索 FLUX 基础模型弱但视觉区分度高的风格 → 候选包括浮世绘、苏联技术图、粗野主义混凝土纹理、中世纪边注
2. **数据集**：从 Wikimedia Commons 抓取 199 张图 → 过滤到 104 张 → Agent 用 VLM 打分筛选 → 最终 30 张
3. **Captioning**：风格 LoRA 的关键原则——**caption 只描述内容，不描述风格**。模型从像素中学风格，caption 里写 "medieval" 会分裂信号
4. **训练**：RTX 4090 跑 2000 步，最佳 checkpoint 在 step 1000（过拟合后质量反而下降）
5. **成果**：LoRA + 训练集都公开在 HuggingFace，触发词 `MRGN_DRLR`

### 文章中展示的视觉元素

从截图中可以识别的关键图像：

| 图像位置 | 内容 | 设计元素 |
|----------|------|----------|
| 文章顶部 banner | 中世纪手抄本风格的 LoRA 训练封面 | 羊皮纸底色、墨水线条、装饰性边框 |
| 训练集示例（9宫格） | 13-15 世纪手抄本边注 | 奇异生物、兔子骑士、蜗牛、绿色地面线、墨迹 |
| base vs LoRA 对比 | 同一 prompt 两种输出 | LoRA 版有更真实的羊皮纸纹理、墨迹渗透、页面折痕 |
| 被过滤的图像（5张） | 不合格样本 | 包括装饰首字母、科普特手稿、重复裁剪、签名花体、劳动场景 |
| 最终 30 张 contact sheet | 精选数据集 | 混合了：孤立生物、完整页面布局、混合生物 |
| checkpoint 进度对比 | step 0/500/1000/1500/2000 | 风格逐步强化→过拟合过程 |
| 过拟合示例 | step 1000 vs 2000 | 2000 步出现伪文字、色彩浑浊 |

### 关键设计语言提取

中世纪手抄本边注的视觉 DNA：

```
1. 材质层：
   - 羊皮纸/犊皮纸底色（暖黄/米色，非纯白）
   - 墨水线条（棕褐色 sepia，非纯黑）
   - 金箔/彩色装饰（红、蓝、绿为主）
   - 页面折痕、污渍、边缘磨损

2. 构图层：
   - 装饰性边框（交织藤蔓、几何图案）
   - 首字母装饰（Illuminated Initial）
   - 边注生物（Drollery/Grotesque）
   - 地面线（绿色或红色装饰性地面）
   - 文字区域 + 插图区域的明确分界

3. 比例层：
   - 小人物 + 大装饰
   - 奇怪的比例（人物头大身小）
   - 生物混种（兔子穿盔甲、蜗牛举武器）

4. 色彩层：
   - 主色：暖黄（羊皮纸）、棕褐（墨水）
   - 强调色：朱红、群青蓝、铜绿
   - 金色装饰
   - 整体偏暖、低饱和度
```

---

## 二、如何应用到钢笔知识图谱

### 核心洞察

钢笔与中世纪手抄本有天然联系：
- 钢笔是书写工具，手抄本是书写的产物
- 笔尖（nib）的金工工艺与手抄本的金箔装饰同源
- 钢笔收藏圈本身就有一种"复古工艺"审美

### 三个层次的实现方案

#### 层次 1：CSS 纯实现（无需图片生成，立即可做）

**目标**：用 CSS 模拟手抄本的材质感和排版节奏

```
具体改动：
┌─────────────────────────────────────────────────────┐
│ 1. 背景材质                                          │
│    - body 背景：暖黄羊皮纸色（#F5F0E8 → #EDE4D3）     │
│    - 用 CSS 渐变模拟纸张纹理（多层 radial-gradient）   │
│    - 添加微妙的 noise 纹理（CSS filter 或 SVG）        │
│                                                       │
│ 2. 文字排版                                          │
│    - 正文色：深棕褐（#3C2415）而非纯黑                 │
│    - 标题用衬线字体（Playfair Display / Cormorant）    │
│    - 正文用易读衬线（EB Garamond / Lora）              │
│    - 行间距加大（1.8-2.0）                            │
│    - 段落首字母可做 drop cap 装饰                      │
│                                                       │
│ 3. 边框装饰                                          │
│    - 页面容器用装饰性边框（CSS border-image 或 SVG）    │
│    - 卡片用交织藤蔓风格的边框                          │
│    - 分割线用装饰性花纹（而非简单 hr）                 │
│                                                       │
│ 4. 色彩系统                                          │
│    - 主背景：#F5F0E8（羊皮纸）                        │
│    - 文字：#3C2415（深棕）                            │
│    - 强调：#8B2500（朱红）                            │
│    - 辅助：#1E3A5F（群青蓝）                          │
│    - 装饰：#C4A35A（金色）                            │
│    - 链接：#5B3A1A（棕褐）                            │
└─────────────────────────────────────────────────────┘
```

**实现复杂度**：中等（改 CSS 变量 + 添加字体 + 调整排版）
**效果**：60-70% 的手抄本氛围
**可逆性**：高（CSS 变量切换即可回到现代风格）

#### 层次 2：AI 生成装饰元素（需要图片生成）

**目标**：用 FLUX + marginalia LoRA 生成网站专用装饰元素

```
需要生成的元素：
┌─────────────────────────────────────────────────────┐
│ 1. 边框装饰（Border Ornaments）                      │
│    - Prompt: "MRGN_DRLR. Decorative border corner     │
│      with intertwined vines and small creatures,      │
│      on parchment background, no text"                │
│    - 用途：页面四角装饰、卡片边角                      │
│    - 数量：4-8 个角装饰 + 4 条边装饰                  │
│                                                       │
│ 2. 分割线（Dividers）                                 │
│    - Prompt: "MRGN_DRLR. Horizontal decorative        │
│      divider with small drollery creatures,            │
│      on parchment, seamless tileable"                 │
│    - 用途：章节分隔                                   │
│    - 数量：3-5 个变体                                 │
│                                                       │
│ 3. 首字母装饰（Illuminated Initials）                 │
│    - Prompt: "MRGN_DRLR. Illuminated capital letter   │
│      with marginalia creatures, gold and red ink,      │
│      on parchment"                                    │
│    - 用途：文章首字母、品牌首字母                      │
│    - 数量：26 个字母（或只做常用的 10-15 个）          │
│                                                       │
│ 4. 空状态插图（Empty State Illustrations）             │
│    - Prompt: "MRGN_DRLR. A small creature sitting     │
│      alone on a blank parchment page, looking          │
│      puzzled, minimalist composition"                 │
│    - 用途：搜索无结果、关系图谱为空等场景              │
│    - 数量：3-5 个                                     │
│                                                       │
│ 5. 页面角落生物（Margin Creatures）                   │
│    - Prompt: "MRGN_DRLR. A rabbit in medieval         │
│      clothing holding a fountain pen, small            │
│      drollery style, on plain parchment"              │
│    - 用途：品牌吉祥物、404 页面、loading 状态          │
│    - 数量：5-8 个                                     │
└─────────────────────────────────────────────────────┘
```

**生成方式选项**：

| 方案 | 工具 | 成本 | 质量 | 适合场景 |
|------|------|------|------|----------|
| A | BFL API (FLUX.2 klein + marginalia LoRA) | ~$0.03/张 | 最佳 | 正式生产 |
| B | nanobanana (你提到的) | 免费/低成本 | 中等 | 快速原型 |
| C | image2 (你提到的) | 免费/低成本 | 中等 | 快速原型 |
| D | 本地 ComfyUI + LoRA | GPU 成本 | 最佳 | 批量生成 |

**推荐**：先用 B 方案快速出原型，确认方向后用 A 方案出正式素材。

#### 层次 3：完整体验重构（CSS + 图片 + 交互）

**目标**：打造"翻开一本钢笔百科手抄本"的沉浸体验

```
具体实现：
┌─────────────────────────────────────────────────────┐
│ 1. 首页 → 手抄本封面                                  │
│    - 打开动画：书本翻页效果                            │
│    - 首页模拟书本封面，有装饰性边框和标题                │
│    - 进入后是"翻开的书页"布局                          │
│                                                       │
│ 2. 词条详情页 → 单页手抄本                             │
│    - 左侧：词条内容（模拟手写体排版）                   │
│    - 右侧：边注区域（放属性、标签、小插图）             │
│    - 底部：脚注区域（放关联词条）                       │
│                                                       │
│ 3. 浏览页 → 图书馆目录                                 │
│    - 卡片模拟书脊或书页                                │
│    - 筛选器模拟书签                                    │
│                                                       │
│ 4. 搜索页 → 抄写员的工作台                             │
│    - 搜索框模拟墨水瓶 + 羽毛笔                        │
│    - 结果列表模拟手抄本目录                            │
│                                                       │
│ 5. 关系图谱 → 家谱图                                  │
│    - 用 SVG 绘制交织藤蔓风格的连线                     │
│    - 节点用装饰性圆圈（而非简单圆点）                   │
└─────────────────────────────────────────────────────┘
```

---

## 三、实施路线图

### Phase 1：CSS 重写（1-2 天，无需图片）

```css
/* 核心 CSS 变量替换 */
:root {
  /* 当前 → 目标 */
  --color-bg: #FAFAF9 → #F5F0E8;        /* 羊皮纸底色 */
  --color-surface: #FFFFFF → #F0E8D8;    /* 卡片底色 */
  --color-ink: #1C1917 → #3C2415;        /* 文字色：深棕 */
  --color-accent: #B45309 → #8B2500;     /* 强调色：朱红 */
  --color-link: #2563EB → #5B3A1A;       /* 链接色：棕褐 */
  --color-border: #E7E5E4 → #C4B89A;     /* 边框色：旧纸边 */
}

/* 字体加载 */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

body {
  font-family: 'EB Garamond', 'Noto Serif SC', serif;
  background-color: var(--color-bg);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(139,69,19,0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(139,69,19,0.02) 0%, transparent 50%);
  color: var(--color-ink);
}

h1, h2, h3 {
  font-family: 'Cormorant Garamond', 'Noto Serif SC', serif;
  font-weight: 700;
  letter-spacing: 0.02em;
}
```

### Phase 2：生成装饰素材（2-3 天，需要图片生成）

1. 用 BFL API 或 nanobanana 生成边框、分割线、首字母
2. 导出为 SVG 或 PNG（透明背景）
3. 集成到 CSS 中（background-image 或 <img>）

### Phase 3：交互重构（3-5 天）

1. 翻页动画（CSS perspective + transform）
2. 响应式布局调整（保持移动端可用）
3. 暗色模式适配（深色羊皮纸 + 金色文字）

---

## 四、关于图片生成的具体建议

### 你需要提供的

1. **风格参考图**：3-5 张你最喜欢的中世纪手抄本边注图片
2. **钢笔相关 prompt**：
   - 钢笔在手抄本边注风格中的表现
   - 笔尖、墨水瓶、书写场景的风格化
3. **品牌色**：如果有偏好的朱红/群青/金色色值

### 我可以帮你做的

1. **写 LoRA 训练的 caption**：针对钢笔主题的 caption 模板
2. **生成 prompt 工程**：为每个装饰元素写精确的 FLUX prompt
3. **CSS 集成**：将生成的素材无缝集成到网站
4. **响应式适配**：确保装饰元素在不同屏幕尺寸下正常显示

### 风险提示

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| LoRA 生成的中文文字变形 | 标题、品牌名不可读 | 只用图片做装饰，文字用 CSS 渲染 |
| 装饰元素过多导致加载慢 | 首屏性能差 | 用 SVG 而非 PNG，按需加载 |
| 风格过于强烈影响可读性 | 用户无法专注内容 | 装饰元素限制在边框、分割线，正文保持简洁 |
| 暗色模式下风格不兼容 | 切换后违和 | 准备两套素材（亮/暗）或用 CSS filter |

---

## 五、下一步行动

1. **确认方向**：你更倾向于哪个层次？（CSS-only / CSS+图片 / 完整重构）
2. **选择图片生成工具**：nanobanana 还是 image2？还是两个都试？
3. **提供风格参考**：发几张你最喜欢的中世纪手抄本图片给我
4. **我先做 CSS 重写**：改完后你可以立刻看到效果，再决定是否需要图片生成
