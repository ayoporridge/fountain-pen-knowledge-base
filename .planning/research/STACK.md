# Stack Research: Fountain Pen Knowledge Graph

> Research date: 2026-05-27 (REWRITE — supersedes previous version)
> Purpose: Prescriptive technology selection for roadmap creation

---

## Executive Summary

| Layer | Choice | Confidence |
|-------|--------|-----------|
| Framework | Next.js 15 (App Router) | **HIGH** (95%) |
| Database | SQLite (single-file) + Drizzle ORM | **HIGH** (90%) |
| Vector Search | sqlite-vec | **MEDIUM** (75%) |
| Full-text Search | SQLite FTS5 | **HIGH** (95%) |
| Graph Visualization | react-force-graph-2d | **HIGH** (90%) |
| UI | Tailwind CSS 4 + shadcn/ui | **HIGH** (95%) |
| Content Rendering | @tailwindcss/typography + remark/rehype | **HIGH** (90%) |
| AI/LLM | Vercel AI SDK 5 (TypeScript-native) | **HIGH** (90%) |
| Content Ingestion | Docling (Python) + TS tagging script | **MEDIUM** (80%) |
| Deployment | Docker (single container) or Fly.io | **MEDIUM** (80%) |

**Architecture change from v1 of this doc**: Neo4j dropped in favor of SQLite. See Section 1 for detailed rationale.

---

## 1. Database Layer

### Decision: SQLite + Drizzle ORM (NOT Neo4j)

**Versions:**
- `better-sqlite3` latest
- `drizzle-orm` ^0.44.6
- `drizzle-kit` (migration tooling)

**Why SQLite wins for this project:**

| Factor | SQLite | Neo4j |
|--------|--------|-------|
| 远程 Agent 部署 | `npm install` 即用，零配置 | 需要 Docker + 端口映射 + auth 配置 |
| 数据规模 | 几千实体 + 几万关系 = 微秒级查询 | 为百万级节点设计，overkill |
| 学习曲线 | SQL（所有开发者都会） | Cypher（额外语言，Agent 需要学） |
| 备份 | cp database.db backup.db | 导出/导入 dump |
| 全文搜索 | FTS5 内置 | 需要额外配置 |
| 向量搜索 | sqlite-vec 扩展 | 需要 plugin |
| 运维 | 零（单文件） | 进程管理 + 内存调优 |

**Graph traversal at personal scale:**
```sql
-- 获取某词条的 1-2 跳关联（局部图）—— 递归 CTE
WITH RECURSIVE related AS (
  SELECT target_id, relation_type, 1 as depth
  FROM entity_links WHERE source_id = ?
  UNION ALL
  SELECT el.target_id, el.relation_type, r.depth + 1
  FROM entity_links el JOIN related r ON el.source_id = r.target_id
  WHERE r.depth < 2
)
SELECT DISTINCT e.* FROM entities e JOIN related r ON e.id = r.target_id;
```

对于 < 10,000 节点的图，此查询 < 5ms。远超用户体感需求。

**Schema 设计（核心表）:**
```sql
-- 实体（笔、品牌、工艺、材质...）
entities (
  id TEXT PRIMARY KEY,   -- nanoid
  type TEXT NOT NULL,    -- 'pen' | 'brand' | 'material' | 'mechanism' | 'concept'
  title TEXT NOT NULL,
  slug TEXT UNIQUE,      -- URL-friendly
  content_md TEXT,       -- Markdown 正文
  metadata JSON,         -- 灵活字段（价位、产地等）
  created_at INTEGER,
  updated_at INTEGER
)

-- 原子标签
tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dimension TEXT NOT NULL,  -- 'nib_type' | 'fill_system' | 'price_range' | 'origin' | ...
  parent_id TEXT REFERENCES tags(id)  -- 允许层级（如 日本 > 写乐）
)

-- 实体-标签关联
entity_tags (
  entity_id TEXT REFERENCES entities(id),
  tag_id TEXT REFERENCES tags(id),
  confidence REAL DEFAULT 1.0,  -- AI 标注置信度
  PRIMARY KEY (entity_id, tag_id)
)

-- 实体间关系（图的边）
entity_links (
  source_id TEXT REFERENCES entities(id),
  target_id TEXT REFERENCES entities(id),
  relation_type TEXT NOT NULL,  -- 'produced_by' | 'similar_to' | 'uses_material' | ...
  weight REAL DEFAULT 1.0,
  PRIMARY KEY (source_id, target_id, relation_type)
)

-- 向量嵌入（语义搜索用）
embeddings (
  entity_id TEXT PRIMARY KEY REFERENCES entities(id),
  vector BLOB  -- sqlite-vec format
)
```

**NOT chosen:**
| Option | Why Not |
|--------|---------|
| **Neo4j** | 个人项目 overkill；需要独立进程 + Docker；Cypher 增加远程 Agent 认知负荷；数据量不到 Neo4j 设计目标的 0.01% |
| **PostgreSQL** | 需要数据库服务；pgvector 虽好但增加运维；个人项目不需要并发写入 |
| **Prisma** | 自有 schema DSL 不够 SQL-native；migration 行为黑盒；Drizzle 更贴近 SQL |
| **MongoDB** | 非结构化存储与"严格标签体系"反模式；$graphLookup 性能远不如原生图或 CTE |

---

## 2. Search Layer

### Full-text Search: SQLite FTS5 (built-in)

**Confidence: 95%**

- 零额外依赖，SQLite 原生 virtual table
- 创建：`CREATE VIRTUAL TABLE search_idx USING fts5(title, content_md, tokenize='unicode61');`
- 中文分词方案：编译时加载 `simple` tokenizer 或使用 jieba-wasm 预分词后存入
- 对数千条内容搜索延迟 < 1ms

### Semantic/Vector Search: sqlite-vec

**Package:** `sqlite-vec` (Alex Garcia, actively maintained)
**Confidence: MEDIUM (75%)**

- SQLite 扩展，C 实现，性能好
- 用途：语义搜索 + "相似笔推荐" + AI NL query 时的 context retrieval
- 单文件架构一致，不引入 Pinecone/Qdrant 等外部依赖
- **Risk**: 相比 pgvector 生态更年轻，但 personal scale 完全够用
- **Fallback**: 如果 sqlite-vec 不稳定，可退回到内存中 brute-force cosine（几千条向量在内存中搜索 < 10ms）

**NOT chosen:**
| Option | Why Not |
|--------|---------|
| Meilisearch | 额外服务进程；SQLite 项目中引入不必要复杂度 |
| Elasticsearch | 核弹打蚊子；运维重 |
| Pinecone/Qdrant | SaaS 依赖或额外进程；数据量不需要 |

---

## 3. Frontend Framework

### Decision: Next.js 15 (App Router)

**Version:** 15.x (latest stable, ~15.4 as of 2026-05)
**Confidence: HIGH (95%)**

**Why Next.js 15 for this project:**

1. **SSG + Dynamic 混合**：Wiki 词条页可静态生成（ISR），图可视化/筛选/AI chat 保持动态
2. **Layout 嵌套**：App Router 的 layout/loading 完美支持 wiki 导航（侧边栏保持，右侧内容切换 = 不丢上下文）
3. **Server Components**：重内容页面零 client JS，图可视化组件单独 `"use client"`
4. **Streaming**：Suspense + streaming SSR 天然支持 AI 流式回答
5. **API Routes**：ingestion pipeline POST 数据、AI 调用都在同一项目内
6. **生态第一**：shadcn/ui、react-force-graph、AI SDK 全部 first-class 支持
7. **远程 Agent 最熟**：Next.js 是 LLM coding agent 训练数据中占比最高的框架

**NOT chosen:**
| Option | Why Not |
|--------|---------|
| **Astro 5** | 内容站最优，但缺乏动态交互能力；多维筛选 + 图可视化 + AI chat 都需要 heavy client JS；Islands 架构交互密度不够 |
| **Remix / React Router 7** | 生态较小；静态内容生成弱于 Next.js |
| **SvelteKit** | react-force-graph 是 React 库；换框架 = 换整个组件生态 |
| **Vue / Nuxt** | 图可视化库 React 生态最强 |

---

## 4. UI Layer

### Decision: Tailwind CSS 4 + shadcn/ui

**Versions:**
- `tailwindcss` ^4.1 (Rust Oxide engine, released 2025-01-22)
- `shadcn/ui` latest (copy-paste 模式, 非 npm 依赖)
- `@tailwindcss/typography` (prose class for Markdown content rendering)

**Confidence: HIGH (95%)**

**Key benefits for this project:**
- **Tailwind 4**: CSS-first config (`@theme` directive), 3.8x faster builds, zero-config content detection
- **shadcn/ui**: 代码 copy 进项目，完全可控；远程 Agent 改样式无需理解第三方库内部逻辑
- **Typography plugin**: `prose` class 一键美化 Markdown 渲染 — 对 wiki 内容页至关重要

### Content Rendering (v1: Read-only)

**Decision: Markdown → HTML via remark/rehype pipeline**

```
content_md (SQLite) → remark → rehype → React components
```

**Key plugins:**
- `remark-gfm` — 表格、任务列表
- `remark-wiki-link` — `[[双向链接]]` 解析
- `rehype-pretty-code` — 代码高亮（如有）
- `@tailwindcss/typography` — 排版

**Why NOT Tiptap/ProseMirror (for v1):**
- v1 不需要编辑能力 — 内容来自 pipeline 自动生成
- Tiptap 引入大量 client JS + 自定义 extension 开发量
- Markdown 渲染够用且 SSG 友好
- v2 如需编辑，再引入 Tiptap

---

## 5. Graph Visualization

### Decision: react-force-graph-2d

**Package:** `react-force-graph-2d`
**GitHub:** [vasturiano/react-force-graph](https://github.com/vasturiano/react-force-graph)
**Confidence: HIGH (90%)**

**Why react-force-graph over Cytoscape:**

| Factor | react-force-graph | Cytoscape.js |
|--------|-------------------|-------------|
| API 简洁度 | `graphData={{ nodes, links }}` 即可 | 需要 stylesheet + elements + layout 配置 |
| React 集成 | 原生 React 组件 | 需要 react-cytoscapejs wrapper |
| 性能 | Canvas 2D，几十节点丝滑 | 功能更全但 bundle 更大 |
| 学习曲线 | 30 分钟上手 | 需要理解 Cytoscape 数据模型 |
| 适合场景 | 局部图（< 100 nodes）| 中大规模分析图 |

**交互设计:**
- 当前词条 = 中心节点（高亮 + 放大）
- 1 跳关联 = 直接连线显示
- 2 跳关联 = 半透明/虚线（可选）
- 节点颜色 = entity type（品牌蓝、笔绿、工艺橙、材质紫）
- 节点大小 = 连接数（hub 节点更显眼）
- 点击节点 = client-side navigation 到对应词条页
- Hover = tooltip 显示 title + type

**NOT chosen:**
| Option | Why Not |
|--------|---------|
| **Cytoscape.js** | 功能过剩（生物网络分析场景）；API 更重 |
| **D3.js force** | 太底层，需要大量手写 bindging；react-force-graph 底层就是 D3 |
| **Sigma.js** | 针对万级节点大图优化，本项目 < 100 节点/视图 |
| **3D (react-force-graph-3d)** | 炫但增加认知负荷；违背"内容优先"原则；移动端体验差 |
| **Neo4j Bloom** | 商业产品，无法嵌入自定义前端 |

---

## 6. AI/LLM Integration

### Decision: Vercel AI SDK 5 (全栈 TypeScript，不引入 Python LLM 层)

**Package:** `ai` ^5.0 (stable, npm)
**Confidence: HIGH (90%)**

**Why keep AI in TypeScript (not Python LlamaIndex):**
- 项目已是全栈 TypeScript，AI 层留在同一语言减少上下文切换
- `generateObject` + Zod schema = structured output（标签提取）
- `useChat` hook = 开箱即用 streaming UI
- Provider-agnostic：同一代码切换 OpenAI / Anthropic / 本地模型
- 远程 Agent 在一个仓库内完成全部开发

### 用途一：AI 标注 Pipeline（面向内容建设）

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4o-mini'),  // 标注任务不需要最强模型
  schema: z.object({
    tags: z.array(z.object({
      name: z.string(),
      dimension: z.enum(['nib_type', 'fill_system', 'material', 'origin', 'price_range', 'brand']),
      confidence: z.number()
    })),
    relations: z.array(z.object({
      target_title: z.string(),
      relation_type: z.string()
    })),
    summary: z.string()
  }),
  prompt: `从以下钢笔相关文本中提取原子标签和实体关系：\n\n${rawContent}`
});
```

### 用途二：自然语言查询（面向用户）

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

// Route Handler: app/api/chat/route.ts
const result = streamText({
  model: anthropic('claude-sonnet-4-20250514'),
  system: `你是钢笔知识图谱助手。基于以下上下文回答问题。
  用户的知识图谱包含 ${entityCount} 个实体。
  可用工具：searchEntities, filterByTags, getRelatedEntities`,
  messages,
  tools: {
    searchEntities: { /* FTS5 search */ },
    filterByTags: { /* multi-dim filter */ },
    getRelatedEntities: { /* graph traversal */ }
  }
});
```

### LLM Provider 选择

| 用途 | Model | 理由 |
|------|-------|------|
| 批量标注 | `gpt-4o-mini` | 便宜（$0.15/1M input）、速度快、structured output 质量好 |
| NL 查询 | `claude-sonnet-4-20250514` | 中文理解强、tool use 准确、streaming 体验好 |
| Embedding | `text-embedding-3-small` (1536d) | $0.02/1M tokens，性价比最高 |

**NOT chosen:**
| Option | Why Not |
|--------|---------|
| **LangChain** | 抽象过厚；debug 困难；对简单 tool-use 场景不需要 chain 概念；bundle 巨大 |
| **LlamaIndex (Python)** | 引入第二语言生态；API 迭代极快（月度 breaking change）；Vercel AI SDK 已满足全部需求 |
| **直接调 OpenAI SDK** | 失去 provider 切换灵活性；无 streaming UI hooks |
| **Text-to-Cypher** | 不使用 Neo4j，无需；Text-to-SQL 对简单 schema 也不需要（直接 tool use） |

---

## 7. Content Ingestion Pipeline

### Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Input Sources                         │
├────────────┬────────────┬───────────────┬──────────────┤
│ Local MD   │  PDF Books │  Web Scraping │  Structured  │
│ (素材库)   │ (钢笔圣经)│ (richardspens)│  (CSV/JSON)  │
└─────┬──────┴─────┬──────┴───────┬───────┴──────┬───────┘
      │            │              │              │
      ▼            ▼              ▼              ▼
┌────────────────────────────────────────────────────────┐
│        Step 1: Parse to Markdown                        │
│  - Local: 直接读取                                      │
│  - PDF: Docling (Python) → Markdown                     │
│  - Web: httpx + BeautifulSoup → Markdown                │
│  - Structured: 直接映射                                  │
└───────────────────────┬────────────────────────────────┘
                        ▼
┌────────────────────────────────────────────────────────┐
│        Step 2: AI Tagging (TypeScript)                   │
│  - Vercel AI SDK generateObject()                       │
│  - Input: raw markdown chunk                            │
│  - Output: { tags[], relations[], summary }             │
│  - Model: gpt-4o-mini (batch, cheap)                    │
└───────────────────────┬────────────────────────────────┘
                        ▼
┌────────────────────────────────────────────────────────┐
│        Step 3: Write to SQLite                          │
│  - Drizzle ORM insert entities/tags/links               │
│  - Generate embeddings → sqlite-vec                     │
│  - Build FTS5 index                                     │
└────────────────────────────────────────────────────────┘
```

### Python Sidecar (仅用于 PDF 解析)

**Tool:** Docling ^2.25 (IBM, MIT license)
**Why Docling:**
- 表格/布局保真度最高（优于 pdfplumber/PyMuPDF）
- 输出 clean Markdown，可直接存入 `content_md`
- 离线运行，无 SaaS 依赖
- MIT 许可

**Script pattern:**
```python
# pipeline/parse_pdf.py
from docling.document_converter import DocumentConverter
import json, sys

converter = DocumentConverter()
result = converter.convert(sys.argv[1])
# 输出 JSON 到 stdout，由 TS 脚本消费
print(json.dumps({
    "title": result.document.title,
    "content_md": result.document.export_to_markdown(),
    "metadata": { "source": sys.argv[1], "type": "pdf" }
}))
```

TS 侧通过 `child_process.execFile('python', ['pipeline/parse_pdf.py', path])` 调用。

### Web Scraping

**Tools:** `httpx` + `beautifulsoup4` (Python) 或 `cheerio` (Node.js)
**Target:** richardspens.com 等已知结构化站点
**Strategy:** 针对每个站写 specific scraper（不用通用爬虫框架）

**NOT chosen:**
| Option | Why Not |
|--------|---------|
| Unstructured.io | 高级功能收费；Docling 免费同等能力 |
| LlamaParse | SaaS only，不能离线 |
| Crawlee | 通用爬虫框架太重；目标站点有限，手写 scraper 更可控 |
| Node.js PDF 库 | pdf-parse 等能力远弱于 Python 生态 |

---

## 8. Deployment

### Primary: Single Docker container (or direct process)

**Confidence: MEDIUM (80%)**

**开发阶段（推荐）:**
```bash
# 远程 Agent 执行
git clone <repo> && cd fountain-pen-graph
pnpm install
pnpm dev  # Next.js dev server，SQLite 文件在 ./data/
```

零配置，无 Docker 需求。SQLite 文件随项目走。

**生产部署选项:**

| Option | Pros | Cons |
|--------|------|------|
| **Fly.io** | 持久化 volume 支持 SQLite；自动 HTTPS；$5/mo | 需要 fly.toml 配置 |
| **Railway** | Git push 部署；持久化存储 | SQLite 需要 volume |
| **VPS (any)** | 完全控制；便宜 | 需要自己配 Nginx/SSL |
| **Vercel** | Next.js 原生平台 | SQLite 不支持（serverless 无状态）|

**推荐 Fly.io:**
```toml
# fly.toml
[mounts]
  source = "data"
  destination = "/app/data"  # SQLite lives here
```

**Backup strategy:** Litestream（SQLite → S3 持续复制）或定时 `cp` + upload

---

## 9. Development Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| TypeScript | ^5.x | 全栈类型安全 |
| pnpm | latest | 包管理（比 npm 快，磁盘省） |
| Biome | latest | Lint + Format 合一（比 ESLint + Prettier 快 30x） |
| Vitest | latest | 单元测试（兼容 Jest API，速度快 5-10x） |
| uv | latest | Python 包管理（仅 pipeline 部分） |

---

## 10. What NOT to Use

| Technology | Why NOT |
|-----------|---------|
| **Neo4j** | Overkill；需要额外进程；Cypher 学习成本；几千节点 SQLite CTE 足够 |
| **MongoDB** | 文档型不适合图遍历；$graphLookup 慢且语法复杂 |
| **Prisma** | Schema DSL 黑盒；migration 不可预测；Drizzle SQL-first 更透明 |
| **LangChain** | 抽象过厚，debug 地狱；本项目 AI 需求简单，SDK 直调足够 |
| **GraphQL** | 单人项目 API 层薄；Server Actions + API routes 足够 |
| **Elasticsearch** | 几千条内容用 FTS5 即可，不需要分布式搜索引擎 |
| **Redis** | 无高并发缓存需求；SQLite WAL 模式读性能已够 |
| **Kubernetes** | 单容器部署，Docker Compose 都嫌多 |
| **Supabase/PlanetScale** | 云数据库增加依赖 + 延迟；SQLite 本地性能更好 |
| **tRPC** | 单人项目 API 层极薄；直接 Server Actions 或 Route Handlers 足够 |
| **Tiptap (v1)** | v1 不需要编辑；Markdown 渲染 pipeline 足够；v2 再引入 |
| **Obsidian/Notion/Tana** | 无法自定义数据模型、标签体系、AI pipeline |

---

## 11. Complexity Budget (v1 约束)

**原则**: 每增加一个技术选择，远程 Agent 的认知负荷 +1。v1 严格控制总复杂度。

| Category | v1 包含 | v2 考虑 |
|----------|---------|---------|
| DB | SQLite only | 可能 + PostgreSQL if scale |
| AI | 标注 pipeline (offline batch) | NL 查询 (online streaming) |
| 编辑 | 无（pipeline 生成内容） | Tiptap 编辑器 |
| Auth | Basic auth / none | Cloudflare Access |
| 图可视化 | 1-hop force graph | 2-hop + 维度着色 |
| 搜索 | FTS5 关键词 | + 向量语义搜索 |

---

## Architecture Diagram (Final)

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js 15 (App Router)                 │
│                                                           │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Wiki Pages   │  │  Graph Viz   │  │  AI Chat     │  │
│  │  (SSG + ISR)  │  │  (force-2d)  │  │  (useChat)   │  │
│  │  prose layout │  │  "use client" │  │  streaming   │  │
│  └───────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │           Multi-dimension Filter UI                │   │
│  │     (Server Component + URL search params)         │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │      Server Actions / API Routes                   │   │
│  │  - CRUD entities/tags/links                        │   │
│  │  - Search (FTS5 + optional vector)                 │   │
│  │  - AI streaming (Vercel AI SDK 5)                  │   │
│  │  - Ingestion endpoint (receive parsed content)     │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │          Drizzle ORM → SQLite                      │   │
│  │  - entities / tags / entity_tags / entity_links    │   │
│  │  - FTS5 virtual table (full-text search)           │   │
│  │  - sqlite-vec (vector embeddings, v2)              │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           Content Ingestion (offline scripts)             │
│                                                           │
│  [Local MD / Web / PDF] → Python (Docling) → Markdown    │
│                ↓                                          │
│  [Markdown chunks] → TS script (AI SDK) → tagged JSON    │
│                ↓                                          │
│  [Tagged JSON] → Drizzle insert → SQLite                 │
└─────────────────────────────────────────────────────────┘
```

---

## Version Pinning Table

| Package | Version | Verified Date | Ecosystem |
|---------|---------|---------------|-----------|
| next | ^15.4 | 2026-05 | Frontend |
| react | ^19.x | 2026-05 | Frontend |
| tailwindcss | ^4.1 | 2026-05 | Frontend |
| @tailwindcss/typography | latest | 2026-05 | Frontend |
| react-force-graph-2d | latest | 2026-05 | Frontend |
| drizzle-orm | ^0.44.6 | 2026-05 | DB |
| better-sqlite3 | latest | 2026-05 | DB |
| ai (Vercel AI SDK) | ^5.0 | 2026-05 | AI |
| @ai-sdk/openai | latest | 2026-05 | AI |
| @ai-sdk/anthropic | latest | 2026-05 | AI |
| zod | ^3.x | 2026-05 | Validation |
| typescript | ^5.x | 2026-05 | Tooling |
| pnpm | latest | 2026-05 | Tooling |
| biome | latest | 2026-05 | Tooling |
| vitest | latest | 2026-05 | Tooling |
| docling (Python) | ^2.25 | 2026-05 | Pipeline |
| uv (Python) | latest | 2026-05 | Pipeline |

---

## Open Questions for Roadmap

1. **中文分词方案**: FTS5 的 `unicode61` tokenizer 对中文按字切分（可用但粗糙）；是否需要 jieba 预分词？
   - 建议：v1 先用 unicode61（够用），v2 评估 jieba-wasm
2. **Embedding 模型**: OpenAI text-embedding-3-small（$0.02/1M）vs 本地 BGE-M3（零成本但需 GPU/CPU 推理）
   - 建议：v1 用 OpenAI（简单），内容稳定后考虑本地
3. **图片存储**: 笔的实拍图放 `public/images/` 随项目走，还是 Cloudflare R2？
   - 建议：v1 随项目走（简单），图片多了再迁移 R2
4. **Content-first vs Feature-first 开发顺序**:
   - 建议：先跑 pipeline 灌 50-100 条数据验证 schema → 再搭前端骨架

---

## Confidence Summary

| Layer | Confidence | Primary Risk |
|-------|-----------|------|
| Database (SQLite) | 90% | 中文 FTS 分词精度；并发写入（可控） |
| Frontend (Next.js 15) | 95% | 无显著风险 |
| UI (Tailwind 4 + shadcn) | 95% | 无显著风险 |
| Graph Viz (force-graph-2d) | 90% | 可能需要样式调优 |
| AI SDK (Vercel) | 90% | Provider API 变动（SDK 层屏蔽了大部分） |
| Content Rendering (remark) | 90% | wiki-link 插件可能需要自定义 |
| Ingestion (Docling) | 80% | Python 依赖管理；PDF 复杂度因书而异 |
| Vector Search (sqlite-vec) | 75% | 生态年轻；可能需要 fallback |
| Deployment (Fly.io) | 80% | SQLite + 持久化 volume 的运维细节 |

---

*This document supersedes the previous version (Neo4j-based).
Feeds into ROADMAP.md for milestone/task breakdown.
Each choice optimizes for: remote Agent execution simplicity + content richness priority.*
