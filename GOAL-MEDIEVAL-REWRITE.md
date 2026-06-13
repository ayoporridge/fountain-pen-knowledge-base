# Goal 7：中世纪手抄本风格重写（CSS-only）

> 执行顺序：Goal 1→2→3→4→5→6→**7**
> 依赖：Goal 3（暗色模式统一）完成后才执行本 Goal
> 预计：12-15 轮，30-40 分钟
> 参考：`/Users/xz/CodeBuddy/fountain-pen-graph/MEDIEVAL-DESIGN-ANALYSIS.md`

---

## Goal Prompt（可直接粘贴到 `/goal`）

```text
/goal 对 /Users/xz/CodeBuddy/fountain-pen-graph 执行中世纪手抄本风格的 CSS 重写。

背景：
当前网站使用现代极简风格（白底 + Inter 字体 + 灰色系）。
目标是将视觉风格切换为中世纪手抄本（medieval manuscript）风格——
羊皮纸底色、棕褐墨线、衬线字体、装饰性边框——
让钢笔知识图谱看起来像一本翻开的古籍。

这是纯 CSS 实现（层次 1），不生成任何图片素材。
钢笔与手抄本有天然联系：钢笔是书写工具，手抄本是书写的产物。

---

## 验收标准

### 1. 构建通过
- `pnpm build` 退出码 0

### 2. 色彩系统替换
修改 globals.css 中的 CSS 变量，将现代色系替换为手抄本色系：

```
当前值                          → 目标值
--color-bg: #FAFAF9             → #F5F0E8 (羊皮纸暖黄)
--color-surface: #FFFFFF         → #F0E8D8 (卡片底色，略深于背景)
--color-surface-hover: #F5F5F4   → #E8DCC8 (悬停态)
--color-ink: #1C1917             → #3C2415 (深棕，非纯黑)
--color-muted: #78716C           → #7A6B5D (柔和棕)
--color-accent: #B45309          → #8B2500 (朱红，手抄本强调色)
--color-accent-hover: #92400E    → #A33000
--color-border: #E7E5E4          → #C4B89A (旧纸边色)
--color-tag-bg: #F5F5F4          → #E8DCC8 (标签底色)
--color-tag-text: #57534E        → #5B4A3A (标签文字)
```

暗色模式（保持可用但风格适配）：
```
--color-bg (dark): #1C1917       → #2A2218 (深色羊皮纸)
--color-surface (dark): #292524  → #3A3028 (深色卡片)
--color-ink (dark): #FAFAF9      → #E8DCC8 (浅棕文字)
--color-accent (dark): #F59E0B   → #C4A35A (金色强调)
--color-border (dark): #44403C   → #5A4E3E (深色边框)
```

### 3. 字体切换
在 globals.css 顶部或 layout.tsx 中加载 Google Fonts：

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
```

字体映射：
- 标题（h1, h2, h3）：`'Cormorant Garamond', 'Noto Serif SC', serif`，font-weight: 600-700
- 正文：`'EB Garamond', 'Noto Serif SC', serif`，font-weight: 400
- 代码/UI 小字：保持系统字体（不改）

具体修改位置：
- `globals.css`：body 和标题的 font-family
- 或 `layout.tsx`：在 `<html>` 上添加字体 class

### 4. 背景纹理
在 body 上添加微妙的羊皮纸纹理（纯 CSS，无图片）：

```css
body {
  background-color: var(--color-bg);
  background-image:
    radial-gradient(ellipse at 15% 25%, rgba(139, 69, 19, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 75%, rgba(139, 69, 19, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(139, 69, 19, 0.02) 0%, transparent 70%);
}
```

### 5. 排版调整
- body 行高从当前值调整为 `line-height: 1.8`
- 段落间距 `margin-bottom: 1.2em`
- 标题 letter-spacing: `0.02em`
- h1 font-size 不变，但 font-weight 调整为 700
- 引用块（blockquote）添加左侧朱红色竖线（3px solid var(--color-accent)）

### 6. 装饰性边框
为主要内容容器添加装饰性边框风格：

- 首页 hero 区域：添加双线边框（外粗内细，模拟手抄本页面边框）
  ```css
  border: 2px solid var(--color-border);
  outline: 1px solid var(--color-border);
  outline-offset: 4px;
  ```
- 词条详情页的内容区域：同上双线边框
- BentoGrid 卡片：单线边框 + 微妙的内阴影（模拟纸张厚度）
  ```css
  border: 1px solid var(--color-border);
  box-shadow: inset 0 1px 3px rgba(139, 69, 19, 0.06);
  ```

### 7. 装饰性分割线
替换所有 `<hr>` 或简单分割线为装饰性花纹：

在 globals.css 中添加：
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

### 8. 首字母装饰（Drop Cap）
在词条详情页的 body_md 渲染区域，为第一个段落的首字母添加装饰：

```css
.prose > p:first-of-type::first-letter {
  font-family: 'Cormorant Garamond', serif;
  font-size: 3.2em;
  float: left;
  line-height: 0.8;
  padding-right: 0.1em;
  padding-top: 0.05em;
  color: var(--color-accent);
  font-weight: 700;
}
```

### 9. 暗色模式适配
确保所有新增样式在 dark: 前缀下正确：
- 背景纹理在暗色模式下透明度降低（避免噪点过重）
- 边框在暗色模式下使用深色调
- drop cap 在暗色模式下使用金色（var(--color-accent) 已自动切换）

### 10. 响应式保持
- 移动端边框装饰简化（去掉 outline-offset，只保留单线边框）
- drop cap 在移动端不显示（避免破坏窄屏排版）
- 字体大小不变

---

## 需要修改的文件

| 文件 | 改动内容 |
|------|----------|
| `src/app/globals.css` | CSS 变量替换、字体、背景纹理、排版、边框、分割线、drop cap |
| `src/app/layout.tsx` | 如需加载字体则修改（或用 CSS @import） |
| `src/app/page.tsx` | 首页 hero 区域添加装饰性边框 class |
| `src/app/[type]/[slug]/page.tsx` | 详情页内容区域添加边框 class，确认 prose 样式 |
| `src/app/browse/page.tsx` | 卡片边框样式确认 |
| `src/components/BentoGrid.tsx` | 卡片边框和阴影 |
| `src/components/LocalGraph.tsx` | 图谱节点颜色确认使用 CSS 变量 |

---

## 约束

- 不修改任何组件的功能逻辑
- 不修改 API 端点
- 不修改数据库
- 不引入新的 npm 依赖（字体通过 CDN 加载）
- 不删除任何现有功能
- 所有颜色通过 CSS 变量控制，不硬编码色值
- 暗色模式必须同时可用

## 暂停条件

- CSS 变量名与现有体系冲突 → 暂停并列出冲突
- Google Fonts 在中国大陆无法加载 → 暂停，考虑用本地字体或 cdn.jsdelivr.net 镜像
- 超过 15 轮 → 列出已完成项和剩余项

## 验证步骤

1. `pnpm build` 成功
2. `pnpm dev` 启动后，首页视觉明显变化：
   - 背景从纯白变为暖黄色
   - 标题从无衬线变为衬线
   - 文字从黑色变为深棕色
3. 暗色模式切换正常，无颜色异常
4. 移动端（375px 宽度）布局正常
5. 详情页 drop cap 正常显示
6. 分割线显示为渐变装饰线
```

---

## 与其他 Goal 的关系

```
Goal 3（暗色模式统一）──必须先完成──→ Goal 7（手抄本风格）
                                              │
                                              ▼
                                       可选：Goal 8（AI 生成装饰素材）
```

**为什么依赖 Goal 3**：Goal 7 会大量使用 CSS 变量。如果 Goal 3 没有先把硬编码颜色清理干净，Goal 7 的变量替换会遗漏文件。

**后续可选**：Goal 7 完成后，网站已经有 60-70% 的手抄本氛围。如果需要进一步提升到 85-90%，可以启动 Goal 8（用 FLUX marginalia LoRA 生成边框、分割线、首字母等装饰素材）。
