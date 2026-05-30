# State: Fountain Pen Knowledge Graph

**Current Phase:** 3 ✅ (complete)
**Next Phase:** 4 — 内容冷启动
**Overall Progress:** 3/10 phases complete

---

## Phase Status

| Phase | 名称 | Status | Started | Completed |
|-------|------|--------|---------|-----------|
| 1 | 单词条可浏览 | `complete` | 2026-05-27 | 2026-05-27 |
| 2 | 富内容录入 | `complete` | 2026-05-27 | 2026-05-28 |
| 3 | 关联漫游 | `complete` | 2026-05-28 | 2026-05-30 |
| 4 | 内容冷启动 | `pending` | — | — |
| 5 | 多维筛选与搜索 | `pending` | — | — |
| 6 | 漫游体验增强 | `pending` | — | — |
| 7 | 标签概念涌现 | `pending` | — | — |
| 8 | 外部内容导入 | `pending` | — | — |
| 9 | AI 标注 | `pending` | — | — |
| 10 | AI 对话查询 | `pending` | — | — |

---

## Current Phase Detail

### Phase 3: 关联漫游

**Status:** `complete`
**Requirements:** CONT-03, CONT-04, BROW-03

| Task | Description | Status |
|------|-------------|--------|
| 3.1 | entity_links schema + reverse link triggers | `complete` |
| 3.2 | Links API (create/delete/query forward+backlinks) | `complete` |
| 3.3 | Wiki-link `[[entity-slug]]` syntax (remark-wiki-link) | `complete` |
| 3.4 | RelatedEntities component (forward + backlinks) | `complete` |
| 3.5 | EntityMeta component (tags by dimension, color-coded) | `complete` |
| 3.6 | LocalGraph component (react-force-graph-2d) | `complete` |
| 3.7 | Graph node click navigation | `complete` |
| 3.8 | Seed links script (8 relationships, 5 entities) | `complete` |

---

## Phase 3 Completion Summary

All 8 tasks completed and verified:
- ✅ 3.1: entity_links schema with trigger-based reverse link maintenance
- ✅ 3.2: Links CRUD API + bidirectional query
- ✅ 3.3: remark-wiki-link integration for [[slug]] syntax
- ✅ 3.4: RelatedEntities — forward links + backlinks grid
- ✅ 3.5: EntityMeta — tags grouped by dimension with color badges
- ✅ 3.6: LocalGraph — force-directed graph centered on current entity
- ✅ 3.7: Click graph nodes → navigate to entity page
- ✅ 3.8: 8 seed links across 5 entities (brand_of, uses, related, makes, implemented_in)

**Status:** `complete`
**Requirements:** FOUND-03, CONT-02, CONT-06

| Task | Description | Status |
|------|-------------|--------|
| 2.1 | 定义标签系统 Schema | `complete` |
| 2.2 | 标签 CRUD API | `complete` |
| 2.3 | 词条编辑页面 | `complete` |
| 2.4 | Markdown 渲染引擎 | `complete` |
| 2.5 | 图片上传 | `complete` |
| 2.6 | 标签选择器 | `complete` |
| 2.7 | 新建词条页面 | `complete` |
| 2.8 | 初始原子标签种子数据 | `complete` |

---

## Phase 2 Completion Summary

All 8 tasks completed and verified:
- ✅ 2.1: 标签系统 Schema (tags, entity_tags, tag_compositions)
- ✅ 2.2: 标签 CRUD API + 批量打标签接口
- ✅ 2.3: 词条编辑页面 /[type]/[slug]/edit
- ✅ 2.4: Markdown 渲染引擎 (remark + gfm)
- ✅ 2.5: 图片上传 (sharp thumbnails, POST /api/upload)
- ✅ 2.6: 标签选择器 (按维度分组, 搜索, 内联创建)
- ✅ 2.7: 新建词条页面 /new (类型选择 + slug 自动生成)
- ✅ 2.8: 原子标签种子数据 (77 tags, 12 dimensions)

---

## Phase 1 Completion Summary

All 8 tasks completed and verified:
- ✅ 1.1: Next.js 15 + Docker + Biome (替代 ESLint)
- ✅ 1.2: better-sqlite3 + Drizzle ORM + 迁移框架
- ✅ 1.3: entities + entity_attributes Schema
- ✅ 1.4: Entity CRUD API (GET/POST/PUT/DELETE)
- ✅ 1.5: 词条详情页 /[type]/[slug]
- ✅ 1.6: Header/Footer + dark mode (next-themes)
- ✅ 1.7: Seed 脚本 (5 entities: 3 笔 + 1 品牌 + 1 概念)
- ✅ 1.8: E2E 测试 (4/4 passed)

Tech decisions: 使用系统字体替代 Google Fonts (代理环境无法下载)；Biome 替代 ESLint。

---

## Blockers

(None)

---

## Decisions Log

| Date | Decision | Context |
|------|----------|---------|
| 2026-05-27 | 创建 10 phase roadmap | Fine granularity, MVP mode |
| 2026-05-27 | Phase 1 完成 | 8/8 tasks, 4/4 E2E tests passed |
| 2026-05-27 | 系统字体替代 Google Fonts | 代理环境无法下载 fonts.googleapis.com |
| 2026-05-28 | Phase 2 完成 | 8/8 tasks, all builds passing |
| 2026-05-28 | sharp 用于图片缩略图 | 原生 Node 图片处理库，无需外部依赖 |
| 2026-05-30 | Phase 3 完成 | 8/8 tasks, react-force-graph-2d for local graph |
| 2026-05-30 | react-force-graph-2d 替代 D3 原生 | API 更简洁，原生 React 集成，100节点内丝滑 |

---

*Last updated: 2026-05-30*
