# 审计报告：挑剔新用户视角全面检查

**审计日期**: 2026-06-10
**审计范围**: 首页、浏览页、详情页、搜索页、问AI、全局体验
**发现总数**: 10 个问题 (P0×2, P1×4, P2×4)

---

## P0 — 必须修复

### 1. 搜索页不读取 URL `?q=` 参数
- **页面**: `/search`
- **现象**: 首页 Hero 区域的问题链接（如 `500以内，日系金尖有哪些选择？`）指向 `/search?q=日系+金尖+500`，但搜索页打开后输入框为空，不执行搜索
- **复现**: 点击首页任意 Hero 问题 → 跳转到 /search → 输入框为空
- **原因**: SearchPage 组件初始化时只设了空 `query` state，没有从 `window.location.search` 读取 `q` 参数
- **严重程度**: P0 — 核心搜索流程断裂，用户从首页点问题链接完全无响应
- **修复**: 添加 `useEffect` 读取 URL 参数并触发搜索

### 2. 无自定义 404 页面
- **页面**: 任意不存在的路径（如 `/pen/nonexistent-slug`）
- **现象**: 显示 Next.js 默认英文 404 页面 "404: This page could not be found."
- **复现**: 访问 `/pen/montblanc-meisterstuck-149`（不存在的 slug）
- **严重程度**: P0 — 中文站展示英文 404，体验极差
- **修复**: 添加 `src/app/not-found.tsx` 自定义 404 页面

---

## P1 — 尽量修复

### 3. MarkdownRenderer 使用 `prose` 类但缺少 @tailwindcss/typography
- **页面**: 详情页 `/{type}/{slug}`
- **现象**: MarkdownRenderer className 包含 `prose dark:prose-invert prose-headings:text-ink prose-a:text-accent` 等，但 package.json 中没有 `@tailwindcss/typography` 依赖，这些类无实际效果
- **影响**: Markdown 正文（body_md）只靠浏览器默认样式渲染，缺少排版美化（标题间距、段落行高、引用样式等）
- **修复**: 将 MarkdownRenderer 的 `prose` 系列类替换为 globals.css 中已有的 `.prose-body` 自定义类

### 4. 浏览页卡片图片加载失败无 fallback
- **页面**: `/browse`
- **现象**: 卡片使用原生 `<img>` 标签，如果 `image_url` 指向的图片加载失败（404/网络问题），只显示破碎图标，无 fallback
- **复现**: 任何一个 image_url 失效的实体卡片
- **修复**: 添加 `onError` handler 回退到首字母占位

### 5. 搜索页不更新 URL 参数（不可分享/收藏）
- **页面**: `/search`
- **现象**: 用户搜索后 URL 始终是 `/search`，不带 `?q=...` 参数
- **影响**: 搜索结果无法 bookmark 或分享给他人
- **修复**: 搜索时用 `window.history.replaceState` 更新 URL

### 6. 浏览页无分页/无限滚动
- **页面**: `/browse`
- **现象**: API 支持 `page` + `limit` 参数，但前端只加载第一页（30条），无"加载更多"或分页控件
- **影响**: 582 个词条只能看到前 30 个
- **修复**: 添加"加载更多"按钮或无限滚动

---

## P2 — 记录不修

### 7. 详情页不验证 URL 中的 type 参数
- **页面**: `/{type}/{slug}`
- **现象**: 页面只按 slug 查询数据库，忽略 type。`/pen/pilot-823` 和 `/brand/pilot-823` 显示同一内容
- **影响**: SEO 重复内容，但不影响功能

### 8. 关系图谱节点显示原始 ID
- **页面**: 详情页关系图谱
- **现象**: 部分节点显示 `1fojl5ZRSeua` 等原始 ID 而非人类可读名称
- **影响**: 图谱可读性降低，属于数据质量问题

### 9. body_md 与属性卡片内容重复
- **页面**: 详情页
- **现象**: 部分词条的 body_md 内容与上方属性卡片（产地、笔尖材质等）完全重复
- **影响**: 用户看到重复信息，属于内容生成 pipeline 问题

### 10. 首页搜索框是 Link 不是 Input
- **页面**: 首页 `/`
- **现象**: Hero 区搜索框看起来像输入框，实际是 `<Link href="/search">`，不能直接输入
- **影响**: 用户第一次可能尝试点击输入，发现不能打字。但有 `/` 快捷键可用
- **决策**: 当前设计是有意为之（CTA 模式），暂不改

---

## 验证 Checklist
- [ ] PLAN.md 记录所有发现 ✓
- [ ] P0 全部修复
- [ ] `pnpm build` 无报错
