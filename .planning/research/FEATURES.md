# Features Research: Knowledge Graph / Interactive Wiki

> Research date: 2026-05-27
> Scope: 知识图谱 / 个人 Wiki / 知识探索类产品的功能全景，聚焦于"漫游浏览"体验。
> 参考产品: Obsidian, Notion, Wikipedia, Heptabase, TiddlyWiki, Semantic MediaWiki, Are.na, Golden, MyMind

---

## Table Stakes (必须有，否则产品感觉残缺)

### TS-1: 词条页面 (Entry Page)

每个实体（笔、品牌、概念）有独立的结构化页面，展示核心属性和关联信息。

- **Complexity**: Low
- **Dependencies**: 数据模型定义
- **参考**: Wikipedia 词条页, Obsidian note
- **对本项目**: 一支笔的页面 = 基本参数 + 关联标签 + 相关内容块

### TS-2: 双向链接 (Bidirectional Links)

词条之间的链接是双向的——A 链接 B，B 也知道 A 链接了自己。

- **Complexity**: Low-Medium
- **Dependencies**: TS-1
- **参考**: Obsidian backlinks, Wikipedia "链入页面"
- **对本项目**: "百乐 Custom 823" 页面自动展示所有提到它的词条

### TS-3: 标签/分类体系 (Tagging & Taxonomy)

内容可被标记为多个维度的标签，标签本身可以有层级关系。

- **Complexity**: Medium
- **Dependencies**: 标签本体论设计（原子标签 → 组块）
- **参考**: Obsidian tags, Notion properties, PoolParty taxonomy
- **对本项目**: 乐高式原子标签是核心架构——这不只是 feature，是 foundation

### TS-4: 多维度筛选/过滤 (Faceted Filtering)

用户可以按多个维度交叉筛选（品牌 × 价位 × 笔尖类型 × 上墨方式）。

- **Complexity**: Medium
- **Dependencies**: TS-3
- **参考**: 电商 faceted search, Algolia, Document360
- **对本项目**: "活塞上墨 + 14K金尖 + ¥500以下" 这种组合查询是刚需

### TS-5: 全文搜索 (Full-text Search)

输入关键词能找到相关内容，支持模糊匹配和高亮。

- **Complexity**: Low-Medium
- **Dependencies**: 内容索引
- **参考**: 所有产品的基本功能
- **对本项目**: 虽然漫游优先于搜索，但"找不到东西"是致命的

### TS-6: 内容渲染 (Rich Content Rendering)

支持富文本、图片画廊、表格等内容的美观展示。

- **Complexity**: Low
- **Dependencies**: None
- **参考**: 任何现代 wiki
- **对本项目**: 钢笔是视觉产品，图片展示质量直接影响体验

### TS-7: 响应式 Web 界面

桌面端优先，但基本移动端可用。

- **Complexity**: Low-Medium
- **Dependencies**: None
- **对本项目**: PROJECT.md 明确 Web 优先，移动端后续。但响应式布局是 Web 基本功

### TS-8: 稳定 URL / 永久链接

每个词条有语义化、稳定的 URL，可书签/外部引用。

- **Complexity**: Low
- **Dependencies**: TS-1, 路由设计
- **参考**: Wikipedia permanent link, Cool URIs don't change
- **对本项目**: 即使不做社交功能，稳定 URL 也是个人收藏和外部引用的基础

---

## Differentiators (竞争优势 / 让产品独特的地方)

### D-1: 局部关系图可视化 (Local Graph View)

以当前词条为中心，展示其直接关联节点的交互式小图。用户可点击节点跳转。

- **Complexity**: Medium-High
- **Dependencies**: TS-2, 图数据库或图结构存储
- **参考**: Obsidian local graph, Heptabase canvas
- **与全局图的区别**: 全局图是毛线球（已明确排除），局部图是有意义的邻域探索
- **对本项目**: 核心漫游机制之一——"这支笔和什么有关系？"

### D-2: 漫游引导 (Serendipity Engine)

系统主动推荐"你可能想看的下一个词条"，基于当前浏览上下文而非协同过滤。

- **Complexity**: High
- **Dependencies**: TS-2, TS-3, 足够的内容密度
- **参考**: Wikipedia "Random Article" + 分类过滤, WikiStroll, Are.na "Adjacent Possible"
- **实现思路**:
  - 基于图距离的"相关但不相邻"推荐
  - "同标签下的其他词条"侧边栏
  - "你还没看过的关联词条"提示
  - 时间/地域维度的联想（"同时代的其他品牌在做什么？"）
  - 随机漫游入口（偏向高质量/未浏览的词条）
- **对本项目**: 这是"点进去就不想出来"的核心——不是用户自己找，是系统把下一站递过来

### D-3: 原子标签自动组合为高阶概念 (Tag Composition → Concepts)

原子标签不只是 flat list，它们的组合自动映射到更高层概念（"活塞上墨 + 德国制造 + ¥2000+" → "德系高端活塞笔"）。

- **Complexity**: High
- **Dependencies**: TS-3, 标签本体论, 可能需要 AI 辅助
- **参考**: 无直接竞品——大多数产品的标签是 flat 的
- **对本项目**: 乐高模型的核心价值——让用户在任意抽象层级浏览

### D-4: AI 辅助标注 (AI Auto-tagging)

导入非结构化内容（测评文章、论坛帖子）时，AI 自动提取实体和标签。

- **Complexity**: High
- **Dependencies**: TS-3, LLM pipeline, 内容导入系统
- **参考**: MyMind auto-tagging, LLM-powered entity extraction
- **对本项目**: 内容优先的项目，手动标注不可扩展——AI 标注是内容规模化的前提

### D-5: 自然语言对话查询 (Conversational Query)

用户用自然语言描述需求（"推荐一支适合写小楷的软弹钢笔，预算300以内"），系统返回匹配结果。

- **Complexity**: High
- **Dependencies**: TS-3, TS-4, 语义理解层, RAG pipeline
- **参考**: Notion AI search, 各种 RAG 应用
- **对本项目**: 交互模式优先级第二。v2 功能（PROJECT.md 决策：AI v1 用于建设，v2 才面向用户）

### D-6: 多入口浏览路径 (Multiple Entry Points)

同一个实体可以从完全不同的维度进入——按品牌、按价位、按用途、按历史时期、按"写感相似的笔"。

- **Complexity**: Medium
- **Dependencies**: TS-3, D-3
- **参考**: 博物馆展览的多条参观路线
- **对本项目**: 打破"分类树只能从一个入口往下钻"的限制

### D-7: 内容导入 Pipeline (Content Ingestion)

支持批量导入已有素材（Markdown、网页抓取、PDF 解析），自动进入标注流程。

- **Complexity**: Medium-High
- **Dependencies**: D-4, 数据清洗
- **参考**: Notion import, Obsidian vault migration
- **对本项目**: 已有大量素材（品牌款型库、richardspens 知识库等），导入是 Day 1 需求

### D-8: 词条关联密度指标 (Link Density Signals)

展示词条的"连接丰富度"——哪些词条关联多（hub），哪些是孤岛（需要补充）。

- **Complexity**: Low-Medium
- **Dependencies**: TS-2
- **参考**: Obsidian graph view 的 orphan detection
- **对本项目**: 内容建设阶段的运营工具——帮助发现"还缺什么"

### D-9: 词条预览 (Hover / Inline Preview)

鼠标悬停链接时弹出词条摘要 + 缩略图，减少"跳转 → 返回"的导航摩擦。

- **Complexity**: Low-Medium
- **Dependencies**: TS-1, TS-2
- **参考**: Wikipedia popup preview, Obsidian page preview
- **对本项目**: 直接服务于漫游体验的流畅度——让用户不离开当前页就能"窥探"下一站

### D-10: 对比视图 (Comparison View)

选中 2-4 个同类实体并排展示属性对比表。

- **Complexity**: Medium
- **Dependencies**: TS-1, TS-3 (结构化属性)
- **参考**: GSMArena spec comparison, RTings side-by-side
- **对本项目**: 钢笔爱好者核心场景——"百乐 Custom 823 vs 写乐 Pro Gear 怎么选"

### D-11: 领域专属 Schema (Domain-Specific Schema)

预定义钢笔领域的属性框架——笔尖规格、上墨方式、笔身材质、产国、价格区间、书写风格等。不是通用 wiki 的空白模板。

- **Complexity**: Medium
- **Dependencies**: TS-3, D-3, 领域知识
- **参考**: Wikidata property 体系, boardgamegeek.com schema
- **对本项目**: 领域专属 schema 让数据一致性更高、筛选更精准、推荐更靠谱。通用工具做不到这一点。

---

## Anti-features (明确不做的事)

### AF-1: 全局图可视化

- **Why not**: 节点多了变毛线球，视觉噪音大于信息价值。CPU/内存开销大，移动端无法承受。
- **替代**: 局部图 (D-1) 足够

### AF-2: 社交功能（评论、分享、协作）

- **Why not**: 个人知识库，不是社区。协作功能的复杂度会吞噬开发资源。
- **替代**: 稳定 URL (TS-8) 允许外部分享即可

### AF-3: 实时协作编辑

- **Why not**: 单人使用。CRDT/OT 等实时同步技术复杂度极高，ROI 为零。

### AF-4: 移动端原生 App

- **Why not**: Web 优先。响应式网页足够覆盖移动场景。
- **替代**: PWA（如果需要离线）

### AF-5: 用户权限系统 / 多租户

- **Why not**: 个人项目。权限系统是复杂度黑洞。
- **替代**: 简单的认证保护（Cloudflare Access 或 basic auth）

### AF-6: 版本历史 / 变更追踪

- **Why not**: v1 不需要。内容以"当前正确状态"为主，不是协作文档。
- **替代**: Git 作为底层版本控制即可

### AF-7: 通知系统

- **Why not**: 单人使用 + 浏览型产品，没有需要通知的事件。

### AF-8: 过度复杂的编辑器

- **Why not**: 这是知识浏览工具，不是写作工具。编辑是管理员行为，不需要 Notion 级别的 block editor。
- **替代**: 简洁的 Markdown 编辑 + 结构化字段表单

### AF-9: 自定义主题 / 外观可配置

- **Why not**: 一个好的默认主题足够。主题系统增加 CSS 复杂度和测试面。
- **替代**: 固定 design token，暗色模式可作为唯一额外选项

---

## Feature Dependencies Map

```
TS-3 (标签体系) ─── FOUNDATION
 ├── TS-4 (多维度筛选)
 ├── D-3 (标签组合 → 概念)
 │    ├── D-6 (多入口浏览)
 │    └── D-11 (领域Schema)
 ├── D-4 (AI 标注)
 │    └── D-7 (内容导入)
 └── D-2 (漫游引导)

TS-1 (词条页面) ─── FOUNDATION
 ├── TS-8 (稳定URL)
 ├── TS-2 (双向链接)
 │    ├── D-1 (局部图)
 │    ├── D-2 (漫游引导)
 │    ├── D-8 (密度指标)
 │    └── D-9 (词条预览)
 └── D-10 (对比视图) ← also depends on TS-3

D-5 (对话查询) depends on: TS-3, TS-4, 语义层, 足够内容密度 (v2)
```

---

## Priority & Phasing Suggestion

| Phase | Features | 目标 |
|-------|----------|------|
| **v0.1 — 内容骨架** | TS-1, TS-2, TS-3, TS-6, TS-8 | 有东西可以看，能点来点去 |
| **v0.2 — 可探索** | TS-4, TS-5, D-1, D-6, D-9, D-11 | 多维度筛选 + 局部图 + 预览 = 基本漫游 |
| **v0.3 — 内容规模化** | D-4, D-7, D-8 | AI 标注 + 批量导入 = 内容密度提升 |
| **v1.0 — 漫游体验** | D-2, D-3, D-10 | 漫游引导 + 概念涌现 + 对比 = "停不下来" |
| **v2.0 — AI 交互** | D-5 | 自然语言对话查询 |

---

## 竞品对比矩阵

| Feature | Wikipedia | Obsidian | Notion | Are.na | Golden | 本项目 |
|---------|-----------|----------|--------|--------|--------|--------|
| 双向链接 | ✗ (单向) | ✓ | 部分 | ✗ | ✓ | ✓ 核心 |
| 漫游推荐 | 弱(随机) | ✗ | ✗ | ✓(Adjacent) | ✗ | ✓ **核心差异** |
| 局部图 | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| 领域Schema | 通用 infobox | 通用 | 通用 | 通用 | 自动抽取 | ✓ 钢笔专属 |
| AI标注 | ✗ | 插件 | ✓(浅) | ✗ | ✓(核心) | ✓ 深度集成 |
| 对话查询 | ✗ | ✗ | ✓(浅) | ✗ | ✗ | ✓ (v2) |
| Faceted筛选 | 类目 | ✗ | 筛选器 | ✗ | ✓ | ✓ 多维组合 |
| Hover预览 | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| 对比视图 | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| 编辑体验 | 复杂 | 极好 | 极好 | 简单 | ✗(只读) | 简单即可 |
| **优化方向** | 阅读 | 写入 | 写入 | 收藏 | 阅读 | **阅读/漫游** |

---

## Key Insight

> 竞品分析的核心发现：大多数知识管理工具优化的是**写入体验**（编辑器、模板、自动化），
> 而本项目优化的是**阅读/浏览体验**（漫游、发现、联想）。
> 这是根本性的定位差异——不是"better Obsidian"，是"fountain pen Wikipedia that you can't stop browsing"。

> 第二个发现：领域专属性本身就是差异化。通用工具做不到精准 facet + 语义推荐，
> 因为它们没有领域 schema。窄而深 > 宽而浅。

---

## Sources

- [Obsidian Graph View features](https://obsidian.md)
- [Semantic MediaWiki browsing interfaces](https://www.semantic-mediawiki.org/wiki/Help:Browsing_interfaces)
- [Are.na — Adjacent Possible concept](https://www.are.na)
- [Golden knowledge graph](https://golden.com)
- [Wivi: Interactive visualization for opportunistic exploration](https://www.sciencedirect.com/science/article/pii/S0306437909001021)
- [SerenQA: Assessing LLMs for Serendipity Discovery in Knowledge Graphs](https://ar5iv.labs.arxiv.org/html/2511.12472)
- [SOL-Tool: Searching Linked Data with Serendipity](https://link.springer.com/chapter/10.1007/978-3-319-59536-8_31)
- [LLM-Powered Knowledge Graphs for Enterprise](https://arxiv.org/html/2503.07993v1)
- [Algolia Faceted Search Setup](https://docs.paligo.net/en/set-up-algolia-faceted-search.html)
- [Wikipedia Apps for Discovery](https://www.makeuseof.com/wikipedia-apps-discover-interesting-articles/)

---

*Last updated: 2026-05-27*
