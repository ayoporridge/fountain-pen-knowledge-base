# Phase 14 Summary: 文章导入残留清理

**Status:** Complete  
**Completed:** 2026-07-13

## 交付

- 对 208 篇库内文章重建确定性摘要，均来自原文事实段，未调用 LLM，长度 81–140 字。
- 隐藏 15 篇残缺文章、原站运营页和内部工作稿；记录保留在数据库以便回源，但站点、API 和 sitemap 不再公开。
- 清理 14 篇翻译过程泄漏、9 篇 Markdown 代码围栏、重复首标题、假链接和已知残片。
- 把正文标题统一到 H2 起步且不跳级，保证详情页全页只有一个 H1。
- 将原站 `javascript:` 弹窗链接降级为普通文本，相对资料链接规范到 RichardsPens HTTPS，并移除无效返回按钮、放大提示、邮件 CTA 和电子书推广。
- 图片只在有意义说明时输出 `figure/figcaption`；通用“钢笔/图片” alt 不冒充说明文字。

## 验证

- `pnpm check:articles`：188/188 公开文章通过摘要和导入残留门禁。
- `pnpm verify:markdown`：489/489 个公开正文完整渲染，0 个标题、链接或脚本残留问题。
- `article-quality.spec.ts`：188/188 公开文章浏览器全量通过；15/15 隐藏页返回真实 404。
- `site-quality.spec.ts`：全部 sitemap 内部链接和公开字段检查通过，图片回归与新语义标记同步更新。
- 本地 production build 通过。

## 边界

残缺文章没有猜测补写，而是退出公开面等待从已记录的 `source_url` 恢复。型号内容模板化、核心规格缺失和品牌/概念信息契约进入 Phase 15。
