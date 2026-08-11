---
quick_id: 260811-auq
status: complete
scope: offline-only
---

# 离线验证最新 canonical checkpoint 的 production build 与全部公开路由

## 边界

- 只读取 Phase 582 最新 caller-owned checkpoint；不得写入 `data/fpkg.db`，不得连接 Turso。
- 使用仓库已有构建、页面与内容契约；不新增 Playwright、通用 runner 或 readiness 基础设施。
- 记录真实页面数、失败路由与失败边界；若发现内容／身份／关系／图片问题，另起定向修复包。
- 本 quick 完成不代表全量 goal 完成，远端正式迁移、部署、真人遍历和线上复查仍保留。

## Task 1：production build 与本地服务

- **files:** `.next/`（生成物）、本 quick 的 `evidence/`
- **action:** 清空远端数据库选择，用 `FPKG_DATABASE_URL` 指向 Phase 582 owned checkpoint，执行 production build 并启动本地 production server。
- **verify:** build 退出码为 0；本地首页、sitemap 与健康页面返回 200；构建前后真实数据库 SHA-256 不变。
- **done:** evidence 中保存 build 日志、checkpoint/真实库哈希和本地服务信息。

## Task 2：全量公开路由遍历

- **files:** 本 quick 的 `evidence/`
- **action:** 从本地 sitemap 读取全部公开路由，逐条检查状态、唯一 H1、canonical、编辑态泄漏、内部链接与图片；复用现有 article-quality 契约检查所有公开文章。
- **verify:** 输出去重路由总数、类型分布、失败清单和测试日志；任何失败都保留精确 URL 与原因。
- **done:** 所有公开 sitemap 路由已实际请求，失败为 0 或已转入明确的定向修复任务。

## Task 3：离线候选结论

- **files:** `260811-auq-SUMMARY.md`、本 quick 的 `evidence/`
- **action:** 汇总本地构建、全量路由、文章结构、内部链接、媒体与数据库不变性证据；明确 Turso 恢复前还能完成和不能完成的边界。
- **verify:** 总数相互一致，日志可复核，`git status --short` 仅新增本 quick 明确拥有的证据文件。
- **done:** 形成可作为最终远端迁移前置输入的离线验收结论，但不把 quick 或单次检查写成全量 goal 完成。

## 执行结论

本轮已完成构建、article-quality 与 1,071 条 sitemap 路由遍历，并定位到 195 个公开实体正文中的 raw `model_specs` JSON 残留及前台原始媒体许可 slug。它们已转入独立定向修复，不在本 quick 中扩展通用验收代码。
