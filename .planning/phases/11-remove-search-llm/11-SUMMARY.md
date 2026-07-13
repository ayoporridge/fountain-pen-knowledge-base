# Phase 11 Summary: 去搜索与去 LLM

**Status:** Complete  
**Completed:** 2026-07-13

## Delivered

- 删除公开搜索页实现、搜索组件、搜索 API、搜索运行库和 `/` 快捷键。
- 删除问 AI 页面实现、聊天 API、OpenAI 客户端与运行时 prompt 管线。
- 历史 `/search` 永久跳转 `/browse`，`/chat` 永久跳转 `/library`；旧 API 明确返回 404。
- 首页和图书馆改为型号、品牌、笔尖、上墨、材质、产地、价位和专题入口。
- Header、Footer、MobileNav 统一为分类导航；九个维度入口共用一份配置。
- 手机抽屉通过 portal 渲染到 body，修复 sticky/backdrop-filter 造成的视觉空菜单。
- 首页 JSON-LD 移除 `SearchAction`，全站 metadata 移除 AI 产品定位。

## Verification

- `pnpm lint`：通过（保留一条既有 CSS `!important` warning）。
- `pnpm build`：通过。
- Phase 11 desktop Playwright：4/4 通过。
- Mobile navigation Playwright：1/1 通过，且验证抽屉高度、分类链接、焦点陷阱与恢复。
- 运行时引用扫描：无 SearchBox、SearchExplorer、GlobalShortcuts、SearchAction 或公开 OpenAI 路径。

## Boundaries

- 离线内容维护脚本与数据库历史 FTS 表不进入公开构建，暂不做破坏性数据结构删除。
- 对比页仍是浏览结果的可选阅读工具，不属于搜索或 LLM 能力。
