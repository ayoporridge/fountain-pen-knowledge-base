---
status: complete
created_at: 2026-07-03
mode: gsd-quick
---

# Scan and Repair All Truncated Articles

## Objective

遍历全部 article 词条，确认是否还有类似 `/article/japanese-pocket-pens`
的截断错误，并修复会再次生成截断正文的导出入口。

## Plan

1. 审计本地 SQLite 中所有 `article` 正文和摘要，检查 `[内容已截断]`，
   并检查正文是否接近旧 50KB 截断边界。
2. 使用相同审计逻辑检查远程 Turso 数据库，确认线上内容状态。
3. 新增可复用审计脚本，方便后续导入或部署前复查。
4. 修复 D1-safe 导出脚本，避免 `entities.body_md` 被静默截断。
5. 验证 lint、build、临时 D1 导出结果。

## Success Criteria

- 本地和远程 206 篇 article 的正文和摘要均无 `[内容已截断]`。
- 本地和远程均无接近旧 50KB 边界的可疑 article。
- D1-safe 导出保留完整长正文，不再在 article 正文里写入截断标记。
- `pnpm lint` 和 `pnpm build` 通过。
