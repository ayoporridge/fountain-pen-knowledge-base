# Roadmap: Fountain Pen Knowledge Graph

**Created:** 2026-05-27
**Granularity:** Fine (10 phases)
**Mode:** MVP (vertical slices)
**Total v1 Requirements:** 36

---

## Phase Summary

| Phase | 名称 | 核心交付 | Requirements |
|-------|------|----------|--------------|
| 1 | 单词条可浏览 | 创建词条 → 浏览器中查看，语义化 URL | FOUND-01, FOUND-02, FOUND-04, CONT-01, UI-01, UI-03 |
| 2 | 富内容录入 | Markdown 编辑器 + 标签体系 + 富文本渲染 | FOUND-03, CONT-02, CONT-06 |
| 3 | 关联漫游 | 双向链接 + 局部关系图可视化 | CONT-03, CONT-04, BROW-03 |
| 4 | 内容冷启动 | 批量导入已有素材，内容密度达到可用 | ING-01, ING-02, ING-05 |
| 5 | 多维筛选与搜索 | 交叉维度筛选 + 全文搜索 + 多入口 | BROW-01, BROW-02, BROW-05 |
| 6 | 漫游体验增强 | 悬停预览 + 对比 + 推荐 + 全方位信息 | BROW-04, BROW-06, BROW-07, BROW-08, CONT-05, UI-02 |
| 7 | 标签概念涌现 | 标签组合自动映射概念 + 层级 + 自定义 | TAG-01, TAG-02, TAG-03 |
| 8 | 外部内容导入 | 网站抓取 + PDF 解析 | ING-03, ING-04 |
| 9 | AI 标注 | 自动标注 + 置信度 + 质量控制 | AITAG-01, AITAG-02, AITAG-03, AITAG-04 |
| 10 | AI 对话查询 | 自然语言问答 + 来源引用 + 上下文 | AICHAT-01, AICHAT-02, AICHAT-03 |

---

## Phase 1: 单词条可浏览

**Goal:** 用户可以通过 Web 界面创建一个钢笔实体词条，并在浏览器中通过语义化 URL 访问它。系统基础骨架搭建完成。

**Mode:** mvp

**Requirements:** FOUND-01, FOUND-02, FOUND-04, CONT-01, UI-01, UI-03

### Tasks

| # | Task | 产出 | 验证方式 |
|---|------|------|----------|
| 1.1 | 初始化 Next.js 15 项目 (App Router) + TypeScript + Tailwind CSS + Docker 开发环境 | `package.json`, `Dockerfile`, `docker-compose.yml`, `next.config.ts` | `docker compose up` 后访问 localhost:3000 看到欢迎页 |
| 1.2 | 集成 better-sqlite3，创建数据库初始化脚本和迁移框架 | `src/lib/db.ts`, `migrations/001_init.sql` | 应用启动时自动创建 `data/fpkg.db` |
| 1.3 | 定义核心 Schema：entities 表（type, slug, name, summary, body_md）+ entity_attributes 表（钢笔专属属性：nib_size, fill_system, body_material, origin_country, price_range, writing_style 等） | `migrations/002_schema.sql` | 可通过 SQLite CLI 查看表结构 |
| 1.4 | 实现 Entity CRUD API Routes (`/api/entities`) | `src/app/api/entities/route.ts`, `src/app/api/entities/[slug]/route.ts` | curl 测试创建/读取/更新/删除 |
| 1.5 | 实现词条详情页 `/[type]/[slug]` 渲染（展示名称、摘要、结构化属性） | `src/app/[type]/[slug]/page.tsx` | 访问 `/pen/pilot-custom-823` 看到完整词条 |
| 1.6 | 实现基础布局：Header 导航 + 侧边栏 + 内容区，支持 dark mode 切换 | `src/app/layout.tsx`, `src/components/ThemeToggle.tsx` | 点击切换按钮，界面在亮/暗模式间切换 |
| 1.7 | 创建 seed 脚本，插入 5 个示例词条（3 支笔 + 1 个品牌 + 1 个概念） | `scripts/seed.ts` | 运行 seed 后可逐一访问 5 个词条页面 |
| 1.8 | 编写 E2E 冒烟测试（创建词条 → 访问 URL → 验证渲染） | `tests/e2e/entity-basic.spec.ts` | `npm run test:e2e` 通过 |

### Success Criteria

1. 用户在浏览器中访问 `/pen/pilot-custom-823` 能看到结构化词条页面
2. 词条 URL 语义化、稳定（slug 不变则 URL 不变）
3. 界面支持亮色/暗色模式切换
4. Docker 一键启动，远程 Agent 无需额外配置
5. 5 个 seed 词条全部可正常浏览

---

## Phase 2: 富内容录入

**Goal:** 用户可以通过 Web 表单编辑词条，支持 Markdown 富文本（图片、表格、引用）+ 结构化字段，标签体系（原子标签 → 组块 → 实体）基础建立。

**Mode:** mvp

**Requirements:** FOUND-03, CONT-02, CONT-06

### Tasks

| # | Task | 产出 | 验证方式 |
|---|------|------|----------|
| 2.1 | 定义标签系统 Schema：tags 表（id, name, dimension, level[atom/chunk/entity]）+ entity_tags 关联表 + tag_compositions（chunk 由哪些 atom 组成） | `migrations/003_tags.sql` | 数据库中可查看标签表结构 |
| 2.2 | 实现标签 CRUD API + 批量打标签接口 | `src/app/api/tags/route.ts` | 可创建标签并关联到实体 |
| 2.3 | 创建词条编辑页面 `/[type]/[slug]/edit`：结构化字段表单（name, type, attributes）+ Markdown 编辑区 | `src/app/[type]/[slug]/edit/page.tsx`, `src/components/EntityEditor.tsx` | 修改词条内容后保存，刷新详情页看到变化 |
| 2.4 | 集成 Markdown 渲染引擎（remark/rehype），支持图片、表格、blockquote、代码块 | `src/lib/markdown.ts`, `src/components/MarkdownRenderer.tsx` | 编辑包含图片和表格的 Markdown，详情页正确渲染 |
| 2.5 | 实现图片上传（本地文件系统存储 + 缩略图生成） | `src/app/api/upload/route.ts`, `public/uploads/` | 在编辑器中上传图片后，详情页显示图片 |
| 2.6 | 编辑页面集成标签选择器（按维度分组展示 atom 标签，支持搜索/创建新标签） | `src/components/TagSelector.tsx` | 为词条添加/移除标签后，详情页标签列表更新 |
| 2.7 | 创建新词条页面 `/new`（type 选择 + slug 自动生成 + 编辑表单） | `src/app/new/page.tsx` | 点击"新建词条"→ 填写 → 保存 → 自动跳转到新词条页 |
| 2.8 | 定义初始原子标签维度种子数据（8-12 个维度：笔尖类型、上墨方式、笔身材质、产地、价位、用途、尺寸、年代、品牌定位） | `scripts/seed-tags.ts` | 运行后数据库中有 50+ 预定义原子标签 |

### Success Criteria

1. 用户点击"编辑"按钮可修改任意词条的 Markdown 内容和结构化字段
2. Markdown 中的图片、表格、引用块在详情页正确渲染
3. 用户可为词条添加多个原子标签，标签按维度分组显示
4. 用户可从零创建新词条（选择类型 → 填写内容 → 保存）

---

## Phase 3: 关联漫游

**Goal:** 词条之间建立双向链接关系，用户可以在词条页面看到关联的其他词条，并通过局部关系图进行可视化漫游。"漫游"体验初步成立。

**Mode:** mvp

**Requirements:** CONT-03, CONT-04, BROW-03

### Tasks

| # | Task | 产出 | 验证方式 |
|---|------|------|----------|
| 3.1 | 定义关联 Schema：entity_links 表（source_id, target_id, link_type, created_at）+ 触发器自动维护反向链接记录 | `migrations/004_links.sql` | 创建 A→B 链接后，查询 B 的 backlinks 能找到 A |
| 3.2 | 实现关联 API：创建/删除链接、查询某实体的所有关联（正向+反向） | `src/app/api/links/route.ts` | API 返回双向链接列表 |
| 3.3 | Markdown 中支持 `[[entity-slug]]` wiki-link 语法解析，渲染为可点击链接 | `src/lib/markdown.ts` 扩展 | Markdown 中写 `[[pilot-custom-823]]` 渲染为链接 |
| 3.4 | 词条详情页底部展示"关联词条"区域：分类展示正向链接和反向链接（backlinks） | `src/components/RelatedEntities.tsx` | 词条页面底部列出所有关联词条 |
| 3.5 | 词条详情页展示标签/组块/所属关系区域（该实体的完整标签列表 + 所属组块 + 关联维度） | `src/components/EntityMeta.tsx` | 词条页显示所有标签和所属关系 |
| 3.6 | 实现局部关系图组件（D3.js force-directed graph），以当前实体为中心展示 1 跳内的关联节点 | `src/components/LocalGraph.tsx` | 词条页右侧/底部显示图形化关系图 |
| 3.7 | 关系图节点可点击跳转到对应词条 | `src/components/LocalGraph.tsx` 交互 | 点击图中节点，页面跳转到该词条 |
| 3.8 | 更新 seed 数据：为 5 个示例词条建立 8-10 条关联关系 | `scripts/seed-links.ts` | 每个 seed 词条都有至少 2 条关联，图可视化可见 |

### Success Criteria

1. 在词条 A 的编辑器中添加 `[[B]]` 链接后，B 的详情页自动显示"被 A 链接"
2. 词条页面展示完整的标签列表和所属维度信息
3. 局部关系图以当前实体为中心显示所有直接关联节点
4. 点击关系图中的节点可跳转到对应词条（实现"漫游"）

---

## Phase 4: 内容冷启动

**Goal:** 批量导入已有本地素材库（品牌款型库 CSV + richardspens Markdown 知识库），系统内容密度达到 200+ 词条，每条内容标注来源。漫游体验具备足够内容支撑。

**Mode:** mvp

**Requirements:** ING-01, ING-02, ING-05

### Tasks

| # | Task | 产出 | 验证方式 |
|---|------|------|----------|
| 4.1 | 实现 Markdown 批量导入 CLI：扫描目录 → 解析 frontmatter → 创建实体 + 正文入库 | `scripts/import-markdown.ts` | 指定目录运行后，所有 `.md` 文件变为词条 |
| 4.2 | Markdown 导入器自动提取 `[[links]]` 并创建关联关系 | 同上扩展 | 导入后词条间的 wiki-link 自动变为数据库关联 |
| 4.3 | 实现 CSV 导入 CLI：读取 CSV → 列名映射到 Schema 字段 → 批量创建实体 + 自动打标签 | `scripts/import-csv.ts` | 导入品牌款型库 CSV 后，数百个笔实体入库 |
| 4.4 | CSV 导入配置文件：定义列名 → Schema 字段的映射规则（支持多套配置） | `config/import-mappings/` | 不同 CSV 格式可用不同配置导入 |
| 4.5 | 为所有导入内容实现 source attribution：记录来源（文件路径/原始 URL/导入时间） | `migrations/005_sources.sql`, entity 增加 source 字段 | 词条详情页底部显示"来源: richardspens/nib-types.md" |
| 4.6 | 导入冲突处理：slug 重复时的合并/跳过/报错策略（配置化） | import CLI 增加 `--on-conflict` 参数 | 重复导入同一文件不产生重复词条 |
| 4.7 | 创建导入报告输出（成功/跳过/失败计数 + 错误详情） | CLI 标准输出 | 导入完成后终端显示统计信息 |
| 4.8 | 实际执行导入：将 `/Users/xz/CodeBuddy/AI内容生产/公众号/02-素材库` 中的品牌款型库 + richardspens 知识库导入系统 | 导入脚本 + 配置 | 系统中可浏览 200+ 词条 |

### Success Criteria

1. 本地 Markdown 文件夹一键导入为词条，frontmatter 映射为结构化字段
2. CSV 品牌款型库一键导入，自动打上对应的原子标签
3. 每条导入内容页面底部显示来源出处
4. 系统总词条数 ≥ 200，内容密度支撑基本漫游

---

## Phase 5: 多维筛选与搜索

**Goal:** 用户可以通过品牌、价位、笔尖类型、上墨方式等维度交叉筛选实体；支持中文全文搜索；同一实体可从不同维度入口进入。

**Mode:** mvp

**Requirements:** BROW-01, BROW-02, BROW-05

### Tasks

| # | Task | 产出 | 验证方式 |
|---|------|------|----------|
| 5.1 | 启用 SQLite FTS5 虚拟表，索引实体名称、摘要、正文内容（中文分词方案：simple tokenizer + trigram） | `migrations/006_fts.sql` | SQL 查询 `SELECT * FROM entities_fts WHERE entities_fts MATCH '活塞'` 返回结果 |
| 5.2 | 实现搜索 API `/api/search`：全文搜索 + 结果排序 + 匹配高亮 + 分页 | `src/app/api/search/route.ts` | 搜索"百利金"返回相关词条列表，关键词高亮 |
| 5.3 | 实现搜索页面 `/search`：搜索框 + 结果列表 + 搜索建议 | `src/app/search/page.tsx` | 输入关键词后实时显示搜索结果 |
| 5.4 | 实现 Faceted Filter API `/api/browse`：支持多维度参数组合查询（brand, price_range, nib_type, fill_system, origin, usage） | `src/app/api/browse/route.ts` | `?nib_type=弹性尖&origin=日本` 返回交叉筛选结果 |
| 5.5 | 实现浏览页面 `/browse`：左侧筛选面板（各维度 checkbox/radio）+ 右侧结果网格 | `src/app/browse/page.tsx`, `src/components/FacetPanel.tsx` | 勾选筛选条件后结果实时更新 |
| 5.6 | 筛选面板各维度显示可用计数（如"活塞上墨 (23)"） | `FacetPanel` 扩展 | 每个筛选项旁显示匹配数量 |
| 5.7 | 实现多维度入口页面：`/by/brand`, `/by/price`, `/by/nib`, `/by/origin` 等索引页 | `src/app/by/[dimension]/page.tsx` | 访问 `/by/brand` 列出所有品牌及其下属笔数量 |
| 5.8 | Header 导航增加搜索入口 + 浏览入口 + 维度入口快捷链接 | `src/components/Header.tsx` 更新 | 导航栏可快速进入搜索和各维度浏览 |

### Success Criteria

1. 用户输入"活塞"搜索，获得包含该词的所有词条，关键词高亮显示
2. 用户勾选"日本 + ¥1000-2000 + 活塞上墨"获得精确的交叉筛选结果
3. 用户可从 `/by/brand/sailor` 或 `/by/nib/弹性尖` 等不同入口发现同一支笔
4. 每个筛选维度显示当前可用数量

---

## Phase 6: 漫游体验增强

**Goal:** 用户浏览时享受"停不下来"的体验——悬停预览减少跳转摩擦、同类对比辅助决策、智能推荐引导深入、密度指标辅助建设。围绕单支笔展示全方位信息。

**Mode:** mvp

**Requirements:** BROW-04, BROW-06, BROW-07, BROW-08, CONT-05, UI-02

### Tasks

| # | Task | 产出 | 验证方式 |
|---|------|------|----------|
| 6.1 | 实现悬停预览 Popover：鼠标 hover 链接 300ms 后弹出词条摘要 + 缩略图 + 标签 | `src/components/HoverPreview.tsx` | 鼠标悬停在词条链接上弹出预览卡片 |
| 6.2 | 预览数据预加载 API `/api/entities/[slug]/preview`（返回精简数据） | `src/app/api/entities/[slug]/preview/route.ts` | API 返回 name + summary + thumbnail + top tags |
| 6.3 | 实现实体对比页面 `/compare?items=slug1,slug2,slug3`：2-4 个实体属性并排展示差异 | `src/app/compare/page.tsx`, `src/components/CompareTable.tsx` | 选择 3 支笔对比，属性差异一目了然 |
| 6.4 | 在浏览/详情页增加"加入对比"按钮 + 对比栏浮动条 | `src/components/CompareBar.tsx` | 点击多个"加入对比"后，底部浮动栏显示已选项 |
| 6.5 | 实现"你可能想看"推荐算法：基于图距离（2-hop 共同邻居）+ 标签相似度 + 未浏览状态 | `src/lib/recommend.ts`, `src/app/api/entities/[slug]/related/route.ts` | API 返回 5-8 个推荐词条 |
| 6.6 | 词条详情页底部展示推荐区域："你可能想看" 卡片列表 | `src/components/Recommendations.tsx` | 每个词条页底部显示推荐词条 |
| 6.7 | 实现关联密度指标：每个词条显示 link_count（连接数），标识 hub（>10 links）和孤岛（0-1 links）节点 | `src/components/DensityBadge.tsx` | 词条页面显示密度标签（如"Hub"或"需要补充关联"） |
| 6.8 | 围绕单支笔的全方位信息聚合视图：购买渠道、手感描述、测评链接、实拍图画廊、品牌故事（从关联实体聚合） | `src/components/PenFullProfile.tsx` | 笔词条页展示购买/手感/测评/图片/品牌故事各区块 |
| 6.9 | 性能优化：页面路由 prefetch + 图片懒加载 + 搜索结果虚拟滚动 | Next.js prefetch 配置 + `loading="lazy"` + virtualization | Lighthouse Performance score ≥ 80 |
| 6.10 | Client-side 路由切换动画（页面间无白屏闪烁） | Next.js loading states + transition | 页面切换流畅无白屏 |

### Success Criteria

1. 鼠标悬停词条链接后 300ms 内弹出预览卡片，含摘要和缩略图
2. 用户可选择 2-4 支笔并排对比所有属性差异
3. 每个词条底部推荐 5+ 相关词条，点击可继续漫游
4. 笔词条页面展示全方位关联信息（购买/手感/测评/图片/品牌）
5. 页面切换快速流畅，无白屏，图片懒加载

---

## Phase 7: 标签概念涌现

**Goal:** 标签组合自动映射到更高层概念（"活塞 + 德国 + ¥2000+" → "德系高端活塞笔"），支持标签层级关系，用户可创建自定义标签组合并保存。

**Mode:** mvp

**Requirements:** TAG-01, TAG-02, TAG-03

### Tasks

| # | Task | 产出 | 验证方式 |
|---|------|------|----------|
| 7.1 | 扩展标签 Schema：增加 tag_hierarchy 表（parent_id, child_id）实现标签层级 | `migrations/007_tag_hierarchy.sql` | "笔尖类型"下可查到"弹性尖"、"硬尖"等子标签 |
| 7.2 | 实现标签层级 API + 树形展示组件 | `src/app/api/tags/tree/route.ts`, `src/components/TagTree.tsx` | 标签页面树形展示层级关系 |
| 7.3 | 定义 concept_rules 表：规则式概念映射（一组原子标签条件 → 概念名） | `migrations/008_concepts.sql` | 插入规则后，匹配条件的实体自动归属该概念 |
| 7.4 | 实现概念自动映射引擎：当实体标签变化时，自动计算其匹配的概念 | `src/lib/concept-engine.ts` | 给实体打上"活塞+德国+¥2000+"标签后，自动显示为"德系高端活塞笔" |
| 7.5 | 概念页面 `/concept/[slug]`：展示概念定义 + 匹配的所有实体列表 | `src/app/concept/[slug]/page.tsx` | 访问 `/concept/德系高端活塞笔` 列出所有匹配的笔 |
| 7.6 | 用户自定义组合功能：在筛选页面选择多个标签 → "保存为概念"按钮 → 命名并持久化 | `src/components/SaveConcept.tsx` | 用户筛选后保存为自定义概念，后续可快速访问 |
| 7.7 | 概念管理页面 `/admin/concepts`：查看所有概念规则、编辑、删除 | `src/app/admin/concepts/page.tsx` | 管理界面列出所有概念及其匹配实体数 |
| 7.8 | 预定义 10-15 个常用概念规则种子数据（日系三金、学生用钢笔、复古活塞笔等） | `scripts/seed-concepts.ts` | 运行后系统中有 10+ 概念，各有匹配实体 |

### Success Criteria

1. 给实体打上特定标签组合后，系统自动将其归类到对应概念
2. 标签有层级结构，子标签继承父标签的语义
3. 用户可在筛选界面保存自定义标签组合为新概念
4. 概念页面自动聚合所有匹配实体

---

## Phase 8: 外部内容导入

**Goal:** 支持从外部网站（如 richardspens.com）抓取内容，支持 PDF（如《钢笔圣经》）解析提取结构化内容，扩大内容规模。

**Mode:** mvp

**Requirements:** ING-03, ING-04

### Tasks

| # | Task | 产出 | 验证方式 |
|---|------|------|----------|
| 8.1 | 实现 Web Scraper 框架：配置驱动（target URL pattern + CSS selectors + field mapping） | `src/lib/scraper/index.ts`, `config/scrape-targets/` | 定义配置后可抓取目标页面 |
| 8.2 | 为 richardspens.com 编写抓取配置（文章列表页 + 详情页 selector mapping） | `config/scrape-targets/richardspens.json` | 抓取 richardspens 文章并入库 |
| 8.3 | Scraper 输出标准化：抓取结果 → 统一中间格式 → 走现有导入 pipeline 入库 | scraper pipeline 集成 | 抓取的内容以标准词条形式入库 |
| 8.4 | 抓取限流和礼貌策略：请求间隔、User-Agent、robots.txt 尊重 | scraper 配置项 | 抓取遵守 robots.txt，有请求间隔 |
| 8.5 | 集成 PDF 解析库（Docling 或 pdf-parse）：PDF → Markdown 文本提取 | `src/lib/pdf-parser.ts` | 输入 PDF 文件路径，输出 Markdown 文本 |
| 8.6 | PDF 导入 CLI：解析 PDF → 按章节/段落切分 → 创建多个词条 | `scripts/import-pdf.ts` | 导入《钢笔圣经》PDF 后产生多个章节词条 |
| 8.7 | PDF 导入支持图片提取（嵌入图片保存到本地） | pdf-parser 扩展 | PDF 中的图片提取并在词条中显示 |
| 8.8 | 导入 Dashboard 页面 `/admin/import`：查看所有导入任务的状态和历史 | `src/app/admin/import/page.tsx` | 页面展示导入历史记录和统计 |

### Success Criteria

1. 配置目标网站规则后，一键抓取内容并入库为标准词条
2. PDF 文件解析后自动切分为多个词条，保留结构和图片
3. 所有外部导入内容正确标注来源
4. 导入管理页面可查看历史和状态

---

## Phase 9: AI 标注

**Goal:** 导入非结构化内容时，AI 自动提取实体和原子标签；标注结果有置信度分档；维护黄金标准集评估质量；AI 建议潜在关联。

**Mode:** mvp

**Requirements:** AITAG-01, AITAG-02, AITAG-03, AITAG-04

### Tasks

| # | Task | 产出 | 验证方式 |
|---|------|------|----------|
| 9.1 | 集成 Vercel AI SDK + LLM provider（OpenAI/Anthropic），配置 API key 环境变量 | `src/lib/ai/client.ts`, `.env.example` | 调用 AI API 返回结果 |
| 9.2 | 实现实体/标签自动提取 prompt + 结构化输出解析（输入: 原始文本 → 输出: entities[] + tags[]） | `src/lib/ai/extract.ts` | 输入一段钢笔文本，返回提取的实体和标签 JSON |
| 9.3 | 实现置信度分档逻辑：AI 输出包含 confidence score → 分档（高>0.8/中0.5-0.8/低<0.5） | `src/lib/ai/confidence.ts` | 提取结果带置信度标签 |
| 9.4 | 实现人工审核队列：低置信度标注进入 `/admin/review` 审核页面 | `src/app/admin/review/page.tsx`, `migrations/009_review_queue.sql` | 审核页面列出待确认标注，可批准/拒绝 |
| 9.5 | 将 AI 标注集成到导入 pipeline：新内容导入时自动触发 AI 提取 + 结果入审核队列或直接入库 | import pipeline 扩展 | 导入 Markdown 后自动生成标签建议 |
| 9.6 | 建立黄金标准集框架：手动标注的 50+ 样本 + 评估脚本（precision/recall） | `data/golden-set/`, `scripts/evaluate-ai.ts` | 运行评估脚本输出 AI 标注的准确率 |
| 9.7 | 实现关联建议：AI 分析词条内容，建议与图谱中其他词条的潜在关联 | `src/lib/ai/suggest-links.ts`, `/admin/suggested-links` 页面 | 建议页面列出 AI 推荐的新关联，可一键确认 |
| 9.8 | AI 标注批量处理模式：对已有词条批量运行标注补全 | `scripts/batch-annotate.ts` | 对 200+ 词条批量运行，补全缺失标签 |

### Success Criteria

1. 导入新内容时 AI 自动提取实体和标签，高置信度直接入库
2. 低置信度标注进入审核队列，人工确认后才入库
3. 黄金标准集评估显示 AI 标注 precision ≥ 0.7
4. AI 能建议词条间的潜在关联，人工确认后创建链接

---

## Phase 10: AI 对话查询

**Goal:** 用户可用自然语言描述需求（如"推荐一支适合日常书写的、出墨顺滑的日系钢笔，预算 500 以内"），系统从图谱中组合答案、引用具体词条、支持追问。

**Mode:** mvp

**Requirements:** AICHAT-01, AICHAT-02, AICHAT-03

### Tasks

| # | Task | 产出 | 验证方式 |
|---|------|------|----------|
| 10.1 | 设计 RAG pipeline：用户问题 → 意图解析 → 图谱查询（标签筛选 + 全文搜索）→ 上下文组装 → LLM 生成回答 | `src/lib/ai/chat-pipeline.ts` | 架构代码可运行 |
| 10.2 | 实现意图解析：从自然语言中提取筛选维度（品牌偏好、价位、用途等）转化为图谱查询条件 | `src/lib/ai/intent-parser.ts` | "500以内的日系活塞笔" → `{origin:"日本", fill:"活塞", price:"<500"}` |
| 10.3 | 实现图谱上下文检索：根据解析出的条件查询匹配实体 + 相关词条摘要 | `src/lib/ai/context-retrieval.ts` | 返回匹配的实体列表 + 详细信息 |
| 10.4 | 实现答案生成：将检索结果作为上下文，LLM 生成带引用的推荐回答 | `src/lib/ai/answer-generator.ts` | 回答中引用具体词条名 + 链接 |
| 10.5 | 实现对话 UI `/chat`：消息列表 + 输入框 + 流式输出 | `src/app/chat/page.tsx`, `src/components/ChatInterface.tsx` | 用户输入问题，流式显示 AI 回答 |
| 10.6 | 回答中的词条引用渲染为可点击链接（跳转到对应词条页面） | `src/components/CitedEntity.tsx` | 点击回答中的引用直接跳转词条 |
| 10.7 | 实现对话上下文跟踪：session 内多轮对话，支持追问和细化 | `src/lib/ai/chat-session.ts` | "有没有更便宜的？" 基于上文理解为同类笔 |
| 10.8 | 对话入口集成到主导航 + 词条页面增加"关于这支笔问 AI"快捷入口 | Header + 词条页更新 | 导航栏有"问 AI"入口，词条页有快捷提问按钮 |

### Success Criteria

1. 用户输入"推荐一支日常写字的活塞钢笔，500以内"获得具体推荐
2. AI 回答引用图谱中的具体词条，点击可跳转
3. 用户可追问"有没有金尖的？"系统理解上下文
4. 对话界面流式输出，响应流畅

---

## Dependency Graph

```
Phase 1 (骨架)
    ↓
Phase 2 (录入)
    ↓
Phase 3 (关联) ←──┐
    ↓              │
Phase 4 (导入) ────┘ (依赖关联系统来创建链接)
    ↓
Phase 5 (筛选搜索)
    ↓
Phase 6 (漫游增强)
    ↓
Phase 7 (概念涌现) ──→ Phase 8 (外部导入)
                              ↓
                       Phase 9 (AI 标注)
                              ↓
                       Phase 10 (AI 对话)
```

---

## Coverage Validation

| Category | Requirements | Phases | Count |
|----------|-------------|--------|-------|
| Foundation | FOUND-01, FOUND-02, FOUND-03, FOUND-04 | 1, 1, 2, 1 | 4 |
| Content | CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06 | 1, 2, 3, 3, 6, 2 | 6 |
| Browse | BROW-01~08 | 5, 5, 3, 6, 5, 6, 6, 6 | 8 |
| Tag | TAG-01, TAG-02, TAG-03 | 7, 7, 7 | 3 |
| Ingest | ING-01~05 | 4, 4, 8, 8, 4 | 5 |
| AI-Tag | AITAG-01~04 | 9, 9, 9, 9 | 4 |
| AI-Chat | AICHAT-01~03 | 10, 10, 10 | 3 |
| UI | UI-01, UI-02, UI-03 | 1, 6, 1 | 3 |
| **Total** | | | **36** |

**Coverage: 36/36 = 100%**

---

*Created: 2026-05-27*
*Last updated: 2026-05-27*
