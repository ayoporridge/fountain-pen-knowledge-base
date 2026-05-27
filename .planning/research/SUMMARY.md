# Research Summary: Fountain Pen Knowledge Graph

> Synthesized: 2026-05-27
> Sources: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## 四份研究的共识

| 维度 | 共识 |
|------|------|
| **技术栈** | Next.js 15 (App Router) + SQLite (FTS5 + 递归 CTE) + Vercel AI SDK |
| **开发策略** | Content-first — 先有内容密度，再做功能 |
| **交互核心** | 局部图漫游 + Faceted 筛选 + 双向链接 |
| **架构模式** | 前端 Wiki 页面 + 独立导入 Pipeline + 无状态 AI 服务 |
| **部署** | Docker 单容器，远程 Agent 友好 |
| **明确不做** | 全局图、社交、协作、原生 App、权限系统 |

---

## 关键冲突与决议

### SQLite vs Neo4j

- **STACK.md** 最终选择 SQLite（废弃 Neo4j），理由：数据规模 < 10万实体，递归 CTE 完全覆盖图遍历需求，运维零成本
- **ARCHITECTURE.md** 同意 SQLite 起步但留有"未来可迁移"措辞
- **决议**：直接面向 SQLite 建模，不预留迁移抽象层。个人项目不会遇到 Neo4j 的设计目标规模

### AI 标注可靠性

- **PITFALLS.md** 警告 AI 标注需要闭环验证（黄金标准集 + 置信度分档 + 冲突检测）
- **FEATURES.md** 将其列为 D-4（High complexity）
- **决议**：AI 标注 v1 只做辅助建议，所有标注经人工确认后才入库

---

## 最紧迫的 5 个技术决策

| # | 决策 | 影响范围 | 建议 |
|---|------|----------|------|
| 1 | 标签维度初始集合 | 数据模型、筛选、AI标注 | 先定 8-12 个核心维度（笔尖、上墨、材质、产地、价位、用途、尺寸、年代） |
| 2 | 中文全文搜索方案 | 搜索体验 | SQLite FTS5 + jieba 分词，或 simple tokenizer + trigram |
| 3 | 图片存储策略 | 部署复杂度、成本 | 本地文件系统 + 缩略图生成，后期可迁移 S3 |
| 4 | AI 标注审核流程 | 内容质量 | 置信度 > 0.8 自动入库，0.5-0.8 人工审核队列，< 0.5 丢弃 |
| 5 | 导入 Pipeline 语言选择 | 开发体验 | Python (Docling PDF 解析) + TypeScript (标签映射)，通过 CLI 调用 |

---

## 核心洞察

> **定位差异**：市面上大多数知识管理工具优化的是**写入体验**（编辑器、模板、自动化），
> 本项目优化的是**阅读/浏览体验**（漫游、发现、联想）。
> 不是"better Obsidian"，是"逛了就停不下来的钢笔 Wikipedia"。

> **最大风险**：内容冷启动。没有内容密度，漫游体验无从谈起。
> 缓解策略：Phase 1 就批量导入已有素材库（品牌款型库 + richardspens 知识库），
> 保证系统上线时至少有 200+ 可浏览词条。

---

## 建议 Build Order

```
Phase 0: 数据模型 + API + 基础页面渲染
  → 能手动创建和浏览词条
  
Phase 1: 批量导入 + 内容填充
  → 已有素材入库，内容密度达到可用水平
  
Phase 2: 标签体系 + 多维筛选 + 局部图
  → 基本漫游体验成立
  
Phase 3: AI 标注 + 自动入库
  → 内容规模化
  
Phase 4: 漫游引导 + 概念涌现 + 对比
  → "停不下来"的体验
  
Phase 5: NL 对话查询
  → AI 交互层
```

---

*Last updated: 2026-05-27*
