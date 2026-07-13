# Phase 17 Summary: 全量回归与生产发布

**Completed:** 2026-07-13  
**Production:** https://fountain-pen-graph.vercel.app  
**Deployment:** https://fountain-pen-graph-dsxfcg0q8-aljo233.vercel.app  
**Deployment ID:** `dpl_8PnKRwHhRmwfXTkw7u62cCKvAeqn`

## Outcome

- 当前版本已收束为分类资料馆：公开搜索、Chat、LLM 处理和对比功能退出，旧地址确定性回到分类或图书馆。
- 生产库 29 个 migration 全部显式执行并通过 checksum 校验；构建与运行时不自动写数据库。
- 公开边界稳定为 550 个实体，其中 231 支钢笔、242 篇文章；仅 9 组有来源支持的型号规格公开。
- 69 张审核媒体完成全量加载、重复、错配、白边/比例、alt 和代理边界检查。
- sitemap 共 569 个公开 URL；全部页面、文章、内部链接和 390px 移动端布局完成真实生产站遍历。
- 详情页 loading 骨架的固定 384px 宽度已改为响应式宽度，消除 65 个详情页在 390px 下短暂出现的 400px 横向溢出。

## Verification

- 数据契约、公开边界、Markdown、文章、图书馆和 migration 全量重放检查通过。
- 本地 production build 通过；本地 Playwright：`62 passed`，用时 4.6 分钟。
- 生产 Playwright：`62 passed`，单 worker、审计批次 3、零 retry，用时 36.9 分钟。
- 生产文章审计覆盖全部 242 篇；媒体、内部字段、站内链接和移动端审计覆盖全部 569 页。
- 正式域名与 deployment 首页 SHA-256、ETag 一致；最终验证窗口未发现 HTTP 500 日志。
- `/by/era` 返回 404；`/search`、`/chat`、`/compare` 分别确定性跳转到 `/browse`、`/library`、`/browse?type=pen`。
- 公开 browse API 返回 231 支钢笔，只包含 `type`、`slug`、`name`、`summary`、`classification`、`source_count`、`image_url`；公开维度仅保留笔尖类型、笔尖材质、上墨方式、产地和笔身材质。

## Reliability Notes

- Turso 在发布与早期线上验收期间出现过瞬时 HTTP 502 和慢 streaming response。
- 只读查询已采用有限并发、read micro-batching、仅瞬时错误重试和可恢复 readiness guard；写入与 migration 不自动重试。
- 外网全量测试为 streaming 和冷分页设置独立等待窗口，本地仍保留较短性能门槛；所有内容、状态和结构断言保持不变。

