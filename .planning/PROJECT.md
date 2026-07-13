# Fountain Pen Knowledge Graph

## What This Is

AI 时代的钢笔知识图谱——一个以原子化标签为基础、自由链接组合的钢笔百科全书。用户可以像逛维基百科一样漫游探索钢笔世界的一切：品牌、型号、工艺、文化、购买渠道、手感测评、实拍美图。面向钢笔爱好者（首先是自己）。

## Core Value

**漫游体验**：点进去就不想出来的知识网络——内容足够丰富、链接足够密，支持从任意维度自由跳转探索。

## Current Milestone: v1.1 分类资料馆全量修复

**Goal:** 把当前产品收敛为无需搜索和 LLM 的分类展示型钢笔资料馆，清除全站审计发现的内容、数据、图片、链接与移动端问题，使公开页面达到可阅读、可相信、可继续漫游的状态。

**Target features:**
- 完全移除公开搜索、问 AI、LLM 路由与入口，以分类、维度、品牌和关系链接承担发现任务
- 修复全量公开内容中的错误链接、重复实体、错误类型、占位字段、破图、重复图、白边低清图和导入残留
- 统一详情页、分类页、文章页、品牌页、对比与图谱的读者信息契约，并完成桌面、手机和生产环境全量验真

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 分类、维度、品牌、专题和关系链接构成完整的无搜索发现路径
- [ ] 全部公开链接有效，不再把原站相对链接错误解析为站内空壳或 404
- [ ] 每个公开实体只有一个规范身份、正确类型和稳定 URL
- [ ] 公开页面不再显示内部状态、snake_case 字段、占位值或待映射标记
- [ ] 图片真实对应词条，无硬破图、重复首图、白框套白框或低清强放大
- [ ] 文章完成链接、交互残留、翻译残留、摘要、标题层级和来源清洗
- [ ] 型号页优先显示已核实的尺寸、重量、墨量、笔尖、密封、兼容、状态和价格；缺失项不伪装成规格
- [ ] 手机导航、分类筛选、详情页、对比与图谱具备可用的响应式和无障碍体验

### Out of Scope

- 全局大图可视化 — 节点多了变毛线球，不实用
- 独立移动端 App — 本里程碑只完善响应式 Web
- 社交功能（评论、分享） — 个人知识库，不是社区
- 实时协作编辑 — 单人使用
- 全文搜索与搜索建议 — 当前版本用分类、维度、品牌与关系导航发现内容
- 面向用户的 AI 对话、推荐或 LLM 内容处理 — 当前版本只展示已整理和可追溯内容

## Context

**内容来源（已有）：**
- `/Users/xz/CodeBuddy/AI内容生产/公众号/02-素材库` — 品牌款型完整库、richardspens 知识库（14 个主题目录）、核心概念库、论坛素材、金句库
- 计划导入：《钢笔圣经》等经典出版物（用户提供文件）
- 计划聚合：老牌钢笔网站/BBS/Blog（如 richardspens.com）

**知识架构（乐高模型）：**
1. 原子标签（最小颗粒度）：活塞上墨、14K金尖、弹性、树脂材质、日本制造、¥200-300
2. 组块（标签组合）：日系三金、写乐长刀研、潜艇上墨系统、学生用钢笔
3. 可辨识实体（组块拼合）：一支具体的笔、一个品牌系列、一种文化流派

**交互模式优先级：**
1. 自由漫游（最高）— 像逛 Wikipedia，点进去就不想出来
2. 自然语言对话（其次）— 描述需求获取推荐
3. 自动入库（最低）— 新内容自动拆标签归入图谱

**开发模式：**
- 本机完成所有事前规划（设计、架构、数据模型、技术选型、任务拆解）
- 远程 24h Agent 执行具体代码撰写与测试
- 交付物 = 明确的 To-Do 列表，让执行 Agent 无需追问即可逐条执行

## Constraints

- **开发模式**: 规划在本机，执行在远程 — 所有 To-Do 必须足够明确、自包含
- **内容优先**: 先有丰富内容再有花哨功能 — 没有内容的图谱是空壳
- **标签颗粒度**: 宁可多不可粗 — 粗标签不可逆，细标签可组合
- **部署**: 需要远程 Agent 能方便部署和开发

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 漫游体验优先于搜索效率 | 用户核心需求是"逛"不是"查" | — Pending |
| 自由链接 > 固定分类树 | 分类树僵化，图谱灵活 | — Pending |
| 部署到 Cloudflare（Workers + D1 + R2） | 跨设备访问；D1 = edge SQLite，迁移成本低；全球 CDN 延迟极低 | — Pending（Phase 10 完成后执行） |
| AI 在 v1 主要用于建设（标注/连接），v2 才做面向用户交互 | 先有内容基础 | — Pending |
| 局部图 > 全局图 | 全局图节点多了变毛线球 | — Pending |
| v1.1 移除搜索与 LLM | 当前公开内容质量和分类漫游比检索、对话更重要 | ✓ 由用户明确决定 |
| 未核实字段不作为规格展示 | 占位字段会制造虚假完整感并损害可信度 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-13 after starting milestone v1.1 分类资料馆全量修复*
