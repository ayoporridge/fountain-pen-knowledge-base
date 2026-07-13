# Phase 11 Plan: 去搜索与去 LLM

**Goal:** 当前公开版本只保留分类展示与关系漫游，不再提供搜索、问 AI 或 LLM 处理。

## Tasks

1. 删除 Header、Footer、MobileNav、首页和图书馆中的搜索/问 AI 入口。
2. 删除搜索与聊天组件、公开 API、运行时代码和搜索快捷键。
3. 将历史 `/search`、`/chat` 页面安全重定向到分类入口，避免旧链接形成死路。
4. 用品牌、型号、工艺、专题、维度入口补齐分类发现路径。
5. 更新测试：断言公开界面无搜索/AI，旧页面重定向，旧 API 不再提供能力。
6. 运行静态检查、构建和 Phase 11 定向浏览器验收。

## Verification

- 全仓运行时代码中无 `OPENAI_API_KEY`、`/api/chat`、`/api/search` 或搜索组件引用。
- 首页、图书馆、桌面导航、手机导航均能直接进入分类页。
- `/search` 重定向至 `/browse`，`/chat` 重定向至 `/library`。
- `pnpm lint`、`pnpm build` 与相关 Playwright 测试通过。
