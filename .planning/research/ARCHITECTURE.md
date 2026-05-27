---
title: Architecture Research
date: 2026-05-27
type: research
question: How should this system be structured?
---

# Architecture: Fountain Pen Knowledge Graph

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Web Frontend                         │
│            (Next.js — SSR wiki pages)                    │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Wiki Page│  │ Local Graph  │  │ Multi-dim Filter │  │
│  │ Renderer │  │ Visualizer   │  │ & Search UI      │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬─────────┘  │
└───────┼────────────────┼───────────────────┼────────────┘
        │                │                   │
        ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                     Content API                          │
│               (Next.js API Routes)                       │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Page CRUD│  │ Graph Query  │  │ NL Query Proxy   │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬─────────┘  │
└───────┼────────────────┼───────────────────┼────────────┘
        │                │                   │
        ▼                ▼                   ▼
┌───────────────────────────────┐   ┌─────────────────────┐
│        Graph Database         │   │   AI Services       │
│    (Neo4j / SQLite+JSON)      │   │                     │
│                               │   │ ┌─────────────────┐ │
│  Nodes: Entity, Tag, Page     │   │ │ Tag Extraction  │ │
│  Edges: HAS_TAG, LINKS_TO,   │   │ │ (LLM-based)     │ │
│         RELATED_TO, PART_OF   │   │ └─────────────────┘ │
│                               │   │ ┌─────────────────┐ │
└───────────────────────────────┘   │ │ NL Query Engine │ │
                                    │ │ (LLM + Graph)   │ │
        ▲                           │ └─────────────────┘ │
        │                           └─────────────────────┘
        │
┌───────┴─────────────────────────────────────────────────┐
│                  Ingestion Pipeline                       │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ File     │  │ Web Scraper  │  │ AI Annotator     │  │
│  │ Importer │  │ (targeted)   │  │ (tag + link)     │  │
│  └──────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Component Definitions

### 1. Graph Database (数据层)

**职责**: 存储所有实体、标签、关系；提供图遍历查询。

**边界**:
- 只负责数据持久化和查询
- 不含业务逻辑
- 所有访问通过 Content API 进行

**核心数据模型** (LEGO 三层映射):

```
(:Tag {name, category, level:"atomic"})
  ← 原子标签：活塞上墨、14K金尖、弹性、树脂材质

(:Chunk {name, description, level:"chunk"})
  -[:COMPOSED_OF]->(:Tag)
  ← 组块：日系三金、潜艇上墨系统

(:Entity {name, type, description, level:"entity"})
  -[:HAS_TAG]->(:Tag)
  -[:BELONGS_TO]->(:Chunk)
  ← 实体：百利金M800、写乐长刀研

(:Page {slug, title, content_md, created, updated})
  -[:ABOUT]->(:Entity | :Chunk | :Tag)
  -[:LINKS_TO]->(:Page)
  ← Wiki 页面：围绕任何节点的富文本内容
```

**技术选型考量**:
- **Neo4j**: 图查询性能最优，但部署较重（需 JVM）
- **SQLite + JSON 关系表**: 轻量、单文件、远程 Agent 开发友好，对单用户足够
- **建议**: 从 SQLite 起步（开发速度快），数据模型设计为图友好（adjacency list），未来可迁移 Neo4j

### 2. Content API (服务层)

**职责**: 提供前端所需的所有数据操作接口。

**边界**:
- 所有数据库操作的唯一入口
- 处理业务逻辑（如自动双向链接、标签继承）
- 不负责 UI 渲染

**核心接口**:

| Endpoint | 功能 | 数据流方向 |
|----------|------|-----------|
| `GET /api/pages/:slug` | 获取页面 + 关联标签 + 邻居节点 | DB → Frontend |
| `GET /api/graph/:slug` | 获取节点的局部图数据 | DB → Frontend |
| `GET /api/tags` | 标签列表 + 分面筛选 | DB → Frontend |
| `POST /api/pages` | 创建/更新页面 | Frontend → DB |
| `POST /api/ingest` | 提交内容到导入管线 | Frontend → Pipeline |
| `POST /api/query` | 自然语言查询 | Frontend → AI → DB |

### 3. Web Frontend (展示层)

**职责**: 渲染 Wiki 页面、局部图、导航和筛选界面。

**边界**:
- 只做展示和交互
- 所有数据通过 Content API 获取
- 不直接访问数据库

**核心页面**:
- **Wiki 页面** (`/wiki/:slug`): Markdown 渲染 + 内联交叉链接 + 侧边栏关联
- **局部图** (页面内嵌): 当前节点 + 1-2 hop 邻居的力导向图
- **筛选探索** (`/explore`): 多维标签组合筛选
- **全文搜索** (`/search`): 关键词 → 页面结果

**技术选型**: Next.js (App Router)
- SSR 保证 SEO 和首屏速度
- 动态路由 `/wiki/[slug]` 对应任意节点
- D3.js 或 react-force-graph 做局部图可视化

### 4. Ingestion Pipeline (导入层)

**职责**: 将外部内容转化为结构化图谱数据。

**边界**:
- 独立于 Web 服务运行（可以是 CLI 脚本或后台任务）
- 输出标准化的 Node/Edge 数据写入 DB
- 调用 AI Annotator 进行标注

**数据流**:

```
原始内容 (MD/PDF/HTML)
    │
    ▼
┌─────────────┐
│ Parser      │ → 提取纯文本 + 元数据
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AI Annotator│ → 提取原子标签 + 关系 + 建议链接
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Graph Writer│ → 创建/更新 Node + Edge + Page
└─────────────┘
```

**输入源**:
- 本地 Markdown 文件（已有素材库）
- PDF/书籍（OCR → text → annotation）
- Web 页面（targeted scraping → clean text）

### 5. AI Services (智能层)

**职责**: 提供 LLM 驱动的标注和查询能力。

**边界**:
- 无状态服务（不持有数据）
- 通过 API 被 Pipeline 和 Frontend 调用
- 可替换（换模型不影响其他组件）

**子模块**:

| 模块 | 输入 | 输出 | 触发方 |
|------|------|------|--------|
| Tag Extraction | 纯文本 | 原子标签列表 + 置信度 | Ingestion Pipeline |
| Relation Suggestion | 实体 + 上下文 | 建议的关系边 | Ingestion Pipeline |
| NL Query | 用户自然语言 | 结构化查询 + 推荐结果 | Frontend (via API) |

---

## Data Flow Summary

```
【建设方向】(写入)
外部内容 → Ingestion → AI Annotation → Graph DB → 内容丰富度 ↑

【消费方向】(读取)
用户点击 → Frontend → Content API → Graph DB → 渲染页面 + 局部图

【对话方向】(查询)
用户提问 → Frontend → NL Query Engine → Graph Traversal → 推荐结果
```

**关键设计原则**:
- 建设流（写入）和消费流（读取）完全解耦
- AI Services 只在建设流中自动运行，消费流中按需触发
- 所有组件通过 API 通信，无直接数据库耦合（除 Content API）

---

## Build Order (依赖关系驱动)

### Phase 0: Foundation (数据模型 + 最小可运行)

```
依赖: 无
产出: 可以手动创建页面并浏览
```

1. **数据模型定义** — Schema (Tables/Nodes/Edges)
2. **Content API** — 基础 CRUD (Page, Tag, Entity)
3. **Frontend 骨架** — Wiki 页面渲染 + 交叉链接
4. **手动种子数据** — 5-10 个页面验证漫游体验

> 验证标准: 可以从一个页面点链接跳转到另一个页面

### Phase 1: Content Mass (内容批量导入)

```
依赖: Phase 0 (数据模型和 API 就绪)
产出: 图谱有足够密度的内容
```

5. **File Importer** — 解析本地 Markdown 素材库
6. **AI Tag Extraction** — LLM 自动标注原子标签
7. **Graph Writer** — 批量写入 + 去重 + 关系建立

> 验证标准: 素材库内容全部导入，标签数量 > 200，页面 > 50

### Phase 2: Browsing Experience (漫游增强)

```
依赖: Phase 1 (足够数据才有意义)
产出: 漫游体验成立
```

8. **局部图可视化** — 当前节点的邻居关系图
9. **多维筛选** — 标签组合过滤
10. **相关推荐** — 基于图距离的 "Related" 侧边栏

> 验证标准: 随机点击 5 次不会进入死胡同

### Phase 3: Intelligence (AI 交互层)

```
依赖: Phase 2 (图谱质量验证后才加 AI 交互)
产出: 自然语言查询可用
```

11. **NL Query Engine** — 自然语言 → 图谱导航
12. **Web Scraper** — 外部站点定向抓取
13. **增量导入** — 新内容自动入库

> 验证标准: "推荐一支弹性好的金尖笔" 返回合理结果

---

## Key Architecture Decisions

| 决策 | 理由 | 影响 |
|------|------|------|
| SQLite 起步而非 Neo4j | 单用户 + 远程 Agent 开发友好 + 零运维 | Phase 0-2 开发速度快；如需 Neo4j 后续可迁移 |
| Next.js 全栈 (Frontend + API) | 一个仓库搞定，部署简单 | 降低组件间通信复杂度 |
| Markdown 作为页面内容格式 | 易编辑、支持交叉链接语法、渲染生态成熟 | 链接解析需自定义 `[[wiki-link]]` 语法 |
| AI Services 外置 (API call) | 模型可换、不阻塞核心流程 | 需处理 API 限流和降级 |
| Ingestion 是独立脚本/CLI | 批量导入 ≠ 在线服务，运行时机不同 | 可在本地或 CI 中跑，不影响 Web 服务 |
| 建设流与消费流分离 | 导入失败不影响浏览体验 | 数据一致性靠写入时校验 |

---

## Component Communication Protocol

```
Frontend ←→ Content API:  HTTP (Next.js internal, same process)
Content API ←→ Database:  SQL (better-sqlite3, in-process)
Ingestion ←→ Database:    SQL (同一 DB 文件，但不同进程，需加锁)
Ingestion ←→ AI Service:  HTTP (OpenAI API / local LLM endpoint)
Frontend ←→ AI Service:   HTTP (via Content API proxy, 不直接调用)
```

**简洁性**: 单用户系统不需要消息队列、事件总线或微服务编排。直接 HTTP 调用 + SQLite 文件锁足矣。

---

## For Downstream: Build Order Implications on Roadmap

- Phase 0 是最小可用产品，**应在一个 milestone 内完成**
- Phase 1 的 AI Tag Extraction 需要先确定标签 taxonomy（可以从已有素材中归纳）
- Phase 2 的局部图可视化依赖数据密度——如果图太稀疏，可视化没有价值
- Phase 3 可以延后到内容体量 > 100 pages 后再开始
- 每个 Phase 的验证标准可直接作为 milestone 完成条件
