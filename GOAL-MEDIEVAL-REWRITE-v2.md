# Goal 8：中世纪手抄本风格重写 v2（含动效 + 字体升级）

> 依赖：Goal 3（暗色模式统一）完成后执行
> 预计：15-20 轮，40-50 分钟
> 参考网站：https://bird.onethreenine.net/
> 参考分析：`/Users/xz/CodeBuddy/fountain-pen-graph/MEDIEVAL-DESIGN-ANALYSIS.md`

---

## 问题诊断

### 为什么之前的改版看不出来？

1. **`font-sans` 覆盖**：`layout.tsx` 中 body 有 `className="font-sans"`，Tailwind 的 `font-sans` 设置了系统无衬线字体栈，优先级高于 globals.css 中的 `font-family: var(--font-serif)`
2. **可能未部署**：commit `85969d4` 已提交，但 Vercel 可能未重新部署
3. **CSS 变量生效但视觉不明显**：颜色变了但字体没变，用户感知不到差异

### bird.onethreenine.net 设计分析

这个网站的设计语言：

| 特征 | 实现方式 | 可借鉴点 |
|------|----------|----------|
| 字体 | 系统 serif（`ui-serif, "Iowan Old Style", Georgia`） | 用衬线但不加载外部字体 |
| 色彩 | 极简暖色调（`#fcfcfb` 底 + `#1a1612` 文字） | 暖白底 + 深棕文字 |
| 深度感 | 三层阴影系统：`--edge`（边框）、`--recess`（凹陷）、`--raised`（凸起） | 用阴影代替边框创造层次 |
| 动效 | 无 CSS 动画，全靠 transitions：`cubic-bezier(.7,.05,.2,1)` | 流畅的贝塞尔曲线过渡 |
| 导航 | 滑动胶囊（sliding pill）：JS 动态计算位置 + CSS transform | 底部导航的高级实现 |
| 标签 | 等宽字体 + 超大字间距（`letter-spacing: 0.18em`） | 小标签的精致感 |
| 暗色模式 | `data-theme="dark"` + CSS 变量翻转 | 变量驱动的暗色切换 |

**核心洞察**：这个网站没有花哨的动画，它的"高级感"来自：
- 精确的阴影层次（不用边框，用 inset shadow + drop shadow 组合）
- 流畅的贝塞尔曲线过渡（不是 ease，是自定义 cubic-bezier）
- 字间距的精心控制（标题 0.06em，标签 0.18em）
- 暖色调的统一性（所有颜色都带暖色倾向）

---

## Goal Prompt（可直接粘贴到 `/goal`）

```text
/goal 对 /Users/xz/CodeBuddy/fountain-pen-graph 执行中世纪手抄本风格的全面重写，包含字体升级、动效系统、视觉层次三个维度。

背景：
之前的 CSS 改版（commit 85969d4）已经提交，但用户反馈"看不出区别"。
根本原因：
1. layout.tsx 中 body 的 `font-sans` 类覆盖了 globals.css 的衬线字体
2. 缺少动效和交互反馈，静态颜色变化用户感知弱
3. 字体缺乏设计感，需要更有风格的选择

目标：打造一个有"翻开古籍"质感的钢笔知识图谱网站。
参考网站：https://bird.onethreenine.net/ （学习其阴影层次和过渡动效）

---

## 第一部分：修复字体覆盖（必须先做）

### 1.1 移除 font-sans 覆盖
文件：`src/app/layout.tsx`
改动：body 的 className 从 `"min-h-full flex flex-col font-sans"` 改为 `"min-h-full flex flex-col"`

### 1.2 字体升级
替换 globals.css 中的字体加载，使用更有设计感的字体：

**英文标题字体**：Playfair Display
- 特点：高对比度衬线，粗细变化剧烈， editorial 风格
- 适合：h1, h2 等大标题
- Google Fonts: `Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400`

**正文字体**：EB Garamond（保留）
- 特点：经典 Garamond 风格，优雅易读
- 适合：正文、段落
- 已在 Google Fonts 中

**中文标题字体**：ZCOOL XiaoWei（站酷小薇体）
- 特点：纤细优雅，笔画有书法韵味
- 适合：中文标题、品牌名
- Google Fonts: `ZCOOL+XiaoWei`

**中文正文字体**：LXGW WenKai（霞鹜文楷）
- 特点：开源楷体，兼具书法美感和屏幕可读性
- 适合：中文正文
- Google Fonts: `LXGW+WenKai:wght@300;400;700`

**等宽字体**：JetBrains Mono（用于代码、标签）
- 特点：清晰的等宽字体，适合小字
- Google Fonts: `JetBrains+Mono:wght@400;500`

### 1.3 字体变量定义
在 globals.css 中更新：

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=ZCOOL+XiaoWei&family=LXGW+WenKai:wght@300;400;700&family=JetBrains+Mono:wght@400;500&display=swap');

@theme {
  --font-display: 'Playfair Display', 'ZCOOL XiaoWei', serif;
  --font-serif: 'EB Garamond', 'LXGW WenKai', serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-label: 'JetBrains Mono', monospace;  /* 小标签用等宽 */
}
```

### 1.4 字间距系统
参照 bird 网站的字间距控制：

```css
/* 标题字间距 */
h1 { letter-spacing: 0.04em; }
h2 { letter-spacing: 0.03em; }
h3 { letter-spacing: 0.02em; }

/* 标签/小字 */
.tag, .label, .mono {
  font-family: var(--font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.7em;
}
```

---

## 第二部分：阴影层次系统（参照 bird 网站）

### 2.1 定义阴影变量
在 globals.css 中添加：

```css
@theme {
  /* 阴影层次 - 参照 bird.onethreenine.net */
  --shadow-edge: inset 0 0 0 1px rgba(255,255,255,0.55), 0 0 0 1px rgba(60,36,21,0.04);
  --shadow-edge-lg: inset 0 0 0 1px rgba(255,255,255,0.6), 0 0 0 1px rgba(60,36,21,0.06), 0 8px 28px rgba(60,36,21,0.06);
  --shadow-recess: inset 0 1px 2px rgba(60,36,21,0.06), inset 0 0 0 1px rgba(60,36,21,0.04);
  --shadow-raised: inset 0 0 0 1px rgba(255,255,255,0.8), 0 0 0 1px rgba(60,36,21,0.05), 0 1px 2px rgba(60,36,21,0.07);
}

.dark {
  --shadow-edge: inset 0 0 0 1px rgba(255,255,255,0.05), 0 0 0 1px rgba(0,0,0,0.4);
  --shadow-edge-lg: inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 1px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5);
  --shadow-recess: inset 0 1px 2px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04);
  --shadow-raised: inset 0 0 0 1px rgba(255,255,255,0.07), 0 0 0 1px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5);
}
```

### 2.2 应用阴影到组件
- 卡片（BentoGrid）：`box-shadow: var(--shadow-raised)`
- 输入框/搜索框：`box-shadow: var(--shadow-recess)`
- 悬停状态：`box-shadow: var(--shadow-edge-lg)`
- 按钮：`box-shadow: var(--shadow-raised)` + active 时 `var(--shadow-recess)`

### 2.3 移除旧的边框样式
替换 `.manuscript-border` 和 `.manuscript-border-single` 为阴影系统。

---

## 第三部分：动效系统

### 3.1 过渡曲线
定义统一的贝塞尔曲线（参照 bird 网站）：

```css
@theme {
  --ease-out: cubic-bezier(0.7, 0.05, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 3.2 微交互
```css
/* 按钮按下 */
.btn-press {
  transition: transform 160ms var(--ease-out), box-shadow 160ms var(--ease-out);
}
.btn-press:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-recess);
}

/* 卡片悬停 */
.card-hover {
  transition: transform 320ms var(--ease-out), box-shadow 320ms var(--ease-out);
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-edge-lg);
}

/* 链接悬停 */
a {
  transition: color 140ms ease;
}
a:hover {
  color: var(--color-accent);
}
```

### 3.3 页面过渡
在 globals.css 中添加：

```css
/* 页面内容淡入 */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.4s var(--ease-out) forwards;
}

/* 交错动画 */
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
```

### 3.4 导航胶囊（参照 bird 网站的 sliding pill）
如果底部导航需要升级，可以实现滑动胶囊效果：
- 当前选项卡下方有一个背景色胶囊
- 切换时胶囊平滑滑动到新位置
- 实现方式：JS 计算目标位置 + CSS transform + transition

---

## 第四部分：视觉细节打磨

### 4.1 Drop Cap（首字母装饰）
在词条详情页生效：

```css
.prose > p:first-of-type::first-letter {
  font-family: var(--font-display);
  font-size: 3.2em;
  float: left;
  line-height: 0.8;
  padding-right: 0.1em;
  padding-top: 0.05em;
  color: var(--color-accent);
  font-weight: 700;
}
```

### 4.2 装饰性分割线
```css
hr, .divider {
  border: none;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--color-border) 20%,
    var(--color-accent) 50%,
    var(--color-border) 80%,
    transparent
  );
  margin: 2rem 0;
}
```

### 4.3 引用块样式
```css
blockquote {
  border-left: 3px solid var(--color-accent);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--color-ink-light);
  font-style: italic;
}
```

---

## 需要修改的文件

| 文件 | 改动内容 |
|------|----------|
| `src/app/layout.tsx` | 移除 `font-sans` 类 |
| `src/app/globals.css` | 字体加载、字体变量、阴影变量、过渡曲线、微交互动画 |
| `src/components/BentoGrid.tsx` | 卡片阴影替换为 `var(--shadow-raised)` |
| `src/components/Header.tsx` | 导航链接悬停效果 |
| `src/components/Footer.tsx` | 链接悬停效果 |
| `src/app/page.tsx` | hero 区域阴影和动画 |
| `src/app/[type]/[slug]/page.tsx` | 详情页 drop cap、prose 样式 |
| `src/components/LocalGraph.tsx` | 图谱节点样式确认 |

---

## 验收标准

1. `pnpm build` 退出码 0
2. 字体明显变化：
   - 标题从无衬线变为 Playfair Display（高对比度衬线）
   - 中文标题变为站酷小薇体（纤细优雅）
   - 中文正文变为霞鹜文楷（书法质感）
3. 阴影层次生效：
   - 卡片有微妙的凸起感（raised shadow）
   - 搜索框有凹陷感（recess shadow）
   - 悬停时阴影加深
4. 动效流畅：
   - 按钮按下有反馈（translateY + shadow 变化）
   - 卡片悬停有抬升感
   - 页面加载有淡入动画
5. 暗色模式正常：
   - 阴影在暗色模式下适配（深色阴影）
   - 字体在暗色背景下清晰可读
6. 移动端正常：
   - 字体大小不变
   - 阴影在移动端正常显示

---

## 约束

- 不修改任何组件的功能逻辑
- 不修改 API 端点
- 不修改数据库
- 所有颜色通过 CSS 变量控制
- 字体通过 Google Fonts CDN 加载（不引入本地字体文件）
- 暗色模式必须同时可用

## 暂停条件

- Google Fonts 在中国大陆无法加载 → 暂停，考虑用 cdn.jsdelivr.net 镜像或本地字体
- 字体加载影响首屏性能 → 暂停，考虑 font-display: swap 策略
- 超过 20 轮 → 列出已完成项和剩余项
```

---

## 字体选择理由

| 字体 | 用途 | 为什么选它 |
|------|------|-----------|
| **Playfair Display** | 英文标题 | 高对比度衬线，笔画粗细变化剧烈，editorial 感强，适合"钢笔"这种精致工具的主题 |
| **EB Garamond** | 英文正文 | 经典 Garamond 风格，优雅易读，与 Playfair Display 搭配和谐 |
| **ZCOOL XiaoWei** | 中文标题 | 站酷小薇体，纤细优雅，笔画有书法韵味，不是常见的宋体/黑体 |
| **LXGW WenKai** | 中文正文 | 霞鹜文楷，开源楷体，兼具书法美感和屏幕可读性，比宋体有设计感 |
| **JetBrains Mono** | 标签/代码 | 清晰的等宽字体，用于小标签和数据展示 |

这些字体都不是最常见的宋体/黑体，每个都有鲜明的性格：
- Playfair Display：bold + 高对比 = 权威感
- ZCOOL XiaoWei：纤细 + 书法韵味 = 优雅感
- LXGW WenKai：楷体 + 现代 = 文化感
