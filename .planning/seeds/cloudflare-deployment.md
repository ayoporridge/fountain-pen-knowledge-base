---
title: Cloudflare 部署适配
trigger_condition: Phase 10 全部完成后
planted_date: 2026-05-27
priority: high
---

# Cloudflare 部署适配

## 背景

当前开发架构使用 SQLite (better-sqlite3) + Next.js + 本地文件存储。
用户需要跨设备访问，决定部署到 Cloudflare 生态。

## 迁移方案

### 基本对应关系

| 当前（开发） | 迁移目标（生产） | 改动量 |
|-------------|-----------------|--------|
| better-sqlite3 | Cloudflare D1 | 小 — D1 就是 SQLite，SQL 语法一致 |
| 本地文件系统（图片） | Cloudflare R2 | 中 — 改 upload/读取路径 |
| Next.js (Node runtime) | Next.js on Cloudflare (@cloudflare/next-on-pages) 或 重写为 Workers | 中-大 — 取决于 Node API 使用程度 |
| Drizzle ORM | Drizzle + D1 adapter (drizzle-orm/d1) | 小 — Drizzle 原生支持 D1 |
| better-sqlite3 FTS5 | D1 FTS5 | 小 — D1 支持 FTS5 |
| sqlite-vec | 需验证 D1 兼容性，可能需 Workers AI embeddings | 中 |

### 关键决策点（到时候再定）

1. **Next.js on Cloudflare vs 纯 Workers + Hono**
   - Next.js: @cloudflare/next-on-pages 支持，但有限制（no Node.js API）
   - Workers + Hono: 更轻量、更 Cloudflare-native，但需要改路由和组件

2. **图片存储**
   - R2 存储 + Workers 签名 URL 读取
   - 或 Cloudflare Images（付费但有变换能力）

3. **AI 相关**
   - LLM 调用：直接从 Workers 调 OpenAI/Anthropic API（无变化）
   - Embedding：可用 Workers AI 内置模型（免外部 API 费）

### 改动不大的原因

> Cloudflare D1 底层就是 SQLite。当前所有 SQL（建表、CTE 图遍历、FTS5 搜索）
> 几乎可以原封不动地跑在 D1 上。这是选 SQLite 的额外收益。

## 执行时机

远程 Agent 完成全部 10 个 Phase（本地开发模式验证功能正确）→ 然后做一次部署适配 Phase。
