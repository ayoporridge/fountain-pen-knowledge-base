# Remote Agent 执行指令

## 项目概述

你是一个 24h 运行的开发 Agent，负责执行"钢笔知识图谱"项目的代码编写和测试。

## 工作方式

1. 读取 `.planning/ROADMAP.md` 了解当前要执行的 Phase
2. 读取 `.planning/STATE.md` 确认当前进度
3. 按 Phase 中的 Tasks 列表逐一执行
4. 每个 Task 完成后运行"验证方式"确认通过
5. 所有 Tasks 完成后，运行 Success Criteria 验收
6. 验收通过后，更新 `STATE.md` 状态，commit，推送

## 当前任务：执行 Phase 1 — 单词条可浏览

### Goal
用户可以通过 Web 界面创建一个钢笔实体词条，并在浏览器中通过语义化 URL 访问它。系统基础骨架搭建完成。

### 技术栈（严格遵循）
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** SQLite (better-sqlite3) + Drizzle ORM
- **UI:** Tailwind CSS 4 + shadcn/ui
- **包管理:** pnpm
- **Lint/Format:** Biome
- **测试:** Vitest + Playwright (E2E)
- **容器化:** Docker + docker-compose

### Tasks（按顺序执行）

| # | Task | 产出文件 | 验证方式 |
|---|------|----------|----------|
| 1.1 | 初始化 Next.js 15 项目 (App Router) + TypeScript + Tailwind CSS + Docker 开发环境 | `package.json`, `Dockerfile`, `docker-compose.yml`, `next.config.ts` | `docker compose up` 后访问 localhost:3000 看到欢迎页 |
| 1.2 | 集成 better-sqlite3，创建数据库初始化脚本和迁移框架 | `src/lib/db.ts`, `migrations/001_init.sql` | 应用启动时自动创建 `data/fpkg.db` |
| 1.3 | 定义核心 Schema：entities 表 + entity_attributes 表（钢笔专属属性：nib_size, fill_system, body_material, origin_country, price_range, writing_style 等） | `migrations/002_schema.sql` | 可通过 SQLite CLI 查看表结构 |
| 1.4 | 实现 Entity CRUD API Routes (`/api/entities`) | `src/app/api/entities/route.ts`, `src/app/api/entities/[slug]/route.ts` | curl 测试创建/读取/更新/删除 |
| 1.5 | 实现词条详情页 `/[type]/[slug]` 渲染（展示名称、摘要、结构化属性） | `src/app/[type]/[slug]/page.tsx` | 访问 `/pen/pilot-custom-823` 看到完整词条 |
| 1.6 | 实现基础布局：Header 导航 + 侧边栏 + 内容区，支持 dark mode 切换 | `src/app/layout.tsx`, `src/components/ThemeToggle.tsx` | 点击切换按钮，界面在亮/暗模式间切换 |
| 1.7 | 创建 seed 脚本，插入 5 个示例词条（3 支笔 + 1 个品牌 + 1 个概念） | `scripts/seed.ts` | 运行 seed 后可逐一访问 5 个词条页面 |
| 1.8 | 编写 E2E 冒烟测试（创建词条 → 访问 URL → 验证渲染） | `tests/e2e/entity-basic.spec.ts` | `npm run test:e2e` 通过 |

### Success Criteria（全部通过才算完成）

1. ✅ 用户在浏览器中访问 `/pen/pilot-custom-823` 能看到结构化词条页面
2. ✅ 词条 URL 语义化、稳定（slug 不变则 URL 不变）
3. ✅ 界面支持亮色/暗色模式切换
4. ✅ Docker 一键启动，无需额外配置
5. ✅ 5 个 seed 词条全部可正常浏览

### Commit 规范

- 每个 Task 完成后单独 commit
- Commit message 格式：`feat(phase-1): task 1.X - 简要描述`
- Phase 完成后 commit STATE.md 更新：`chore: complete phase 1, update STATE.md`

### 注意事项

- 所有技术选型在 CLAUDE.md 中已确定，不要自行更换
- 遇到不确定的设计决策，选择最简单的方案
- 不要添加 ROADMAP 中没有要求的功能
- 详细的技术栈信息参见 `CLAUDE.md` 的 Technology Stack 部分

## 完成后

更新 `.planning/STATE.md`：
- Phase 1 status: `pending` → `complete`
- Phase 2 status: `pending`（下一个要执行的）
- 更新 Current Phase Detail 为 Phase 2 的 Tasks

然后继续执行 Phase 2，直到所有 Phase 完成。
