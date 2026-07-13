# Phase 13 Summary: 图片资产全量修复

**Completed:** 2026-07-13
**Requirements:** MEDIA-01, MEDIA-02, MEDIA-03, MEDIA-04

## Delivered

- 建立统一 `publicMediaFilter`：结构化主图必须已审核、有明确可复用许可并位于站内，远程电商、官方和博客图片只保留为资料记录。
- 268 条按索引轮换的 Warm Pen Atlas 随机卡片图全部改为 hidden，并停用会再次生成这些错配图的脚本入口。
- 保留 75 张各自明确绑定的站内原创馆藏图；公开实体中实际覆盖 60 个品牌、1 个概念和 8 支型号，其余页面使用中性类型资料卡。
- 详情页只保留一次主图，删除 `ModelArchive` 中的第二次重复渲染；没有合格图片时不再轮换其他实体的氛围图。
- 公开卡片、详情页和图片代理共用同一媒体策略；修复数据库 `public/...` 本地路径未生效的问题。
- 25 个硬失败资产逐项处理：无效产品图隐藏，HTTP Richard's Pens 链接规范化为 HTTPS，真实 404、占位域名、追踪像素和 HTML 伪图片不再输出。
- 修复 Richard's Pens 两张 `/repair/plush/` 错路径为 `/repair/plunger/`，保留当前可用的 Parker 75 工具图。
- `info`、`caution`、`warning`、`q`、`rx` 五类低清重复图标改为中文 CSS 徽章。
- Markdown 图片恢复 caption 输出，空 alt 使用 caption 或安全说明；同一正文内的重复图片只保留第一次。
- 客户端对未来加载失败的正文图自动隐藏，作为数据审计之外的最后兜底。
- 两篇维修文章中泄漏的翻译指令块已从数据库正文移除。

## Product Boundary

- 237 支公开钢笔中，8 支有站内托管的对应示意图，229 支显示明确的无图资料卡。
- Wikimedia CC 图片继续保留许可、作者和来源数据，但实测同轮即出现 429，因此当前不作为结构化主图公开。
- 该取舍优先保证稳定、授权清晰和不误认；后续只有在图片合法落到站内后才进入公开主图集合。

## Verification

- `pnpm audit:public-media`：75/75 健康，0 失败
- `pnpm check:public-boundary`：69 条公开实体媒体通过策略
- 全量 sitemap HTML 图片检查：无空 alt、HTTP 图片、占位图、跟踪像素、内部页面伪图片和同页重复 src
- 图片代理：随机 placeholder、无公开许可和远程结构化媒体均返回 404；站内批准媒体可稳定读取
- Pilot Custom 823：页首仅 1 张对应示意图，档案区不重复
- 无合格图片型号：显示类型资料卡，不显示破图或随机封面
- 桌面与手机关键路径：0 broken image、0 浏览器错误、0 横向溢出
- `pnpm lint`：通过，保留 1 条既有 CSS `!important` 警告
- `pnpm build`：通过
