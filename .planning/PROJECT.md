# Fountain Pen Knowledge Graph

## What This Is

AI 时代的钢笔知识图谱——一个以原子化标签为基础、自由链接组合的钢笔百科全书。用户可以像逛维基百科一样漫游探索钢笔世界的一切：品牌、型号、工艺、文化、购买渠道、手感测评、实拍美图。面向钢笔爱好者（首先是自己）。

## Core Value

**漫游体验**：点进去就不想出来的知识网络——内容足够丰富、链接足够密，支持从任意维度自由跳转探索。

## Current Milestone: v1.2 内容百科化与型号扩容

**Goal:** 让每个公开品牌和钢笔型号都具有可供普通用户真正了解产品的完整内容与可靠出处，并在权威资料支持下补齐重要品牌和代表型号。

**Target features:**
- 全量盘点所有公开品牌、型号和相关条目的正文长度、信息维度、来源、规格、图片与关系完整度，禁止空壳和短摘要页面继续公开
- 以品牌官网、官方产品目录和历史档案为首选证据，辅以可靠经销商、博物馆、拍卖档案和公认钢笔资料站，逐条补齐介绍、规格、历史、版本、使用与选购信息
- 建立全球钢笔品牌与代表型号覆盖矩阵，补充当前缺失的重要品牌、经典型号和仍在售主力型号，并完成本地、生产和真人浏览器全量验收

## Requirements

### Validated

- ✓ 分类、维度、品牌、专题和关系链接构成无需搜索或 LLM 的公开发现路径 — v1.1
- ✓ 公开实体具有规范身份、稳定 URL、清洁媒体和明确的内部/公开字段边界 — v1.1
- ✓ 全部 sitemap 页面、公开文章、图片和站内链接可被自动化与真实浏览器全量遍历 — v1.1
- ✓ 新建及未达标品牌/型号默认不可公开；详情、发现入口、API、图谱与品牌全部型号列表统一由 `public_entities` 授权，内容变化会使旧审核失效 — Phase 18

### Active

- [ ] 每个公开品牌和型号页都达到统一的最低内容门槛，不再出现只有标题、图片或泛化短摘要的空壳
- [ ] 每条事实与规格都有可追溯来源；冲突信息、版本差异和无法核实的字段被明确处理
- [ ] 型号页覆盖身份、定位、历史、设计、笔尖、上墨、尺寸材质、版本差异、书写与使用、购买维护等适用维度
- [ ] 品牌页覆盖起源、关键时间线、产品体系、全部已发布型号链接、辨识特征和可靠延伸阅读
- [ ] 建立现有品牌与型号的全量质量台账，并以机器门禁阻止低信息量条目再次公开
- [ ] 建立外部品牌/型号覆盖矩阵，补入资料充分且对钢笔爱好者有明显价值的重要缺失条目
- [ ] 新增及重写内容完成来源审查、去模板化、中文自然度、桌面与手机浏览器及生产环境逐条验收

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
| 公开资格由内容门槛决定，而不是由实体存在决定 | 200 状态和规范 URL 不能证明页面对用户有信息价值 | ✓ Phase 18 已以 `public_entities`、原子发布和硬 404 落地 |
| 型号扩容先做覆盖矩阵，再批量入库 | 避免随意堆型号，同时兼顾经典款、在售主力与地区代表性 | — Pending |

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
*Last updated: 2026-07-15 after completing Phase 18 统一发布门禁*
