# fountain-pen-graph Goal Prompts（整合终版）

> 两版对照整合，覆盖安全/数据/UI/图谱/代码质量/SEO 六个方向。
> 每个 prompt 可直接粘贴到 Claude Code `/goal` 或 Codex `/goal`。
> 日期：2026-06-10

---

## 完整问题清单

### 安全/架构（P0）

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| S1 | `runMigrations()` 异步不 await，每次请求可能触发重复迁移 | `db.ts:93` | 生产竞态 |
| S2 | DELETE /api/entities/[slug] 无鉴权，任何人可删词条 | `entities/[slug]/route.ts` | 数据安全 |
| S3 | /api/admin/* 端点无鉴权（fix-data, auto-tag, reclassify） | `api/admin/` | 管理接口裸奔 |
| S4 | upload 写本地文件系统，Vercel serverless 不持久化 | `upload/route.ts` | 图片丢失 |
| S5 | search FTS 查询未转义用户输入（特殊字符 " * AND OR NOT） | `search/route.ts` | SQL 注入风险 |

### 数据层（P0）

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| D1 | 品牌实体只有 1 个（百乐），其余品牌未从笔名提取为独立实体 | 数据库 | 首页品牌卡片只有 1 个词条 |
| D2 | 概念实体只有 1 个（活塞上墨），缺失旋转上墨/真空上墨等 | 数据库 | 概念分类空洞 |
| D3 | `getEntitiesForConcept()` 传入 slug 但查询用 concept_id，参数语义不匹配 | `concept-engine.ts:84` | 概念页实体列表可能为空 |
| D4 | entity 页面解析 `entity.attributes` 但 schema 中无此列（实际是 entity_attributes 表） | `[type]/[slug]/page.tsx:255` | 属性显示异常 |

### UI/UX（P1）

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| U1 | body_md 行距偏小（1.7），长段落阅读疲劳 | `[type]/[slug]/page.tsx:333` | 可读性差 |
| U2 | 关系图谱无关联时标题仍渲染，下方空白 | `[type]/[slug]/page.tsx:396` | 空状态体验差 |
| U3 | LocalGraph 无关联时返回 null | `LocalGraph.tsx:184` | 用户困惑 |
| U4 | 编辑按钮链接到 /new 而非 /[type]/[slug]/edit | `[type]/[slug]/page.tsx:482` | 功能错误 |
| U5 | 多组件硬编码灰色，暗色模式不一致 | 见下方文件清单 | 暗色模式颜色异常 |
| U6 | footer GitHub 链接可能 404 | `Footer.tsx` | 外链失效 |
| U7 | 暗色模式图片无 dimming，刺眼 | 多处 `<img>` | 视觉不适 |
| U8 | material 和 nib 图标都用 PenNib，不直观 | TYPE_ICONS | 类型辨识度低 |

### 代码质量（P1）

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| C1 | TYPE_LABELS/ICONS 在 6+ 文件中重复定义 | 全局 | 维护成本高 |
| C2 | markdown.ts wiki-link async/sync 不匹配，异步分支永远 fallback | `lib/markdown.ts:27` | wiki-link 失效 |
| C3 | 3 处 eslint-disable 硬编码 any | 多处 | 类型安全差 |
| C4 | Recommendations/HoverPreview 用硬编码颜色而非 CSS 变量 | 两组件 | 见 U5 |

### 性能/SEO（P2）

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| P1 | GET /api/entities N+1 查询 | `entities/route.ts` | 大数据集慢 |
| P2 | 无 sitemap.xml / robots.txt | 缺失 | 搜索引擎不可见 |
| P3 | 无 OG meta / generateMetadata | 所有页面 | 社交分享无预览 |
| P4 | 部分 pen summary 质量差（"XX产品线中的一员"） | 数据库 | 内容不专业 |

### 功能缺失（P2）

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| F1 | 无自定义 404 页面 | `app/not-found.tsx` 缺失 | 404 体验差 |
| F2 | 无全局 error boundary | 缺失 | 运行时白屏 |
| F3 | 搜索无分页 | `search/page.tsx` | 大结果集无法浏览 |

---

## 硬编码颜色需修复的文件清单

以下文件使用了 `text-gray-*` / `bg-gray-*` / `bg-white` / `text-blue-*` 等硬编码 Tailwind 颜色，暗色模式下会不一致：

- `src/components/Recommendations.tsx` — TYPE_COLORS 硬编码
- `src/components/HoverPreview.tsx` — bg-white, dark:bg-gray-800
- `src/components/FacetPanel.tsx` — text-gray-*
- `src/components/CompareBar.tsx` — gray-*
- `src/app/compare/page.tsx` — 全部硬编码灰色
- `src/app/[type]/[slug]/edit/page.tsx` — blue-600, gray-*
- `src/app/new/page.tsx` — blue-600, gray-*

---

## Goal 1：安全与架构加固（P0，最高优先级）

```text
/goal 对 /Users/xz/Documents/fountain-pen-graph 执行安全与架构加固。

验收标准：
1. `pnpm build` 退出码 0
2. runMigrations() 改为同步执行（await），或改为 app startup 一次性执行，
   解决每次请求触发重复迁移的竞态风险
3. API 端点安全加固：
   - DELETE /api/entities/[slug] 需要 header X-Admin-Token 验证
   - /api/admin/* 所有端点（fix-data, auto-tag, reclassify）需要同样验证
   - token 从环境变量 ADMIN_TOKEN 读取
   - 未设置 ADMIN_TOKEN 时，这些端点返回 403
4. search FTS 查询：用户输入经过 sanitize，移除 FTS 特殊字符（" * AND OR NOT - +）
5. upload 端点：检查 filename 防止 path traversal（不允许 ../ 或绝对路径）
6. entity_attributes schema 不匹配修复：
   entity 页面解析 entity.attributes 但实际数据在 entity_attributes 表中，
   改为从 entity_attributes 表查询
7. concept-engine 参数修复：
   getEntitiesForConcept() 的参数名 slug 实际语义是 concept_id，
   统一参数命名并确认查询逻辑正确

约束：
- 不修改 Turso 连接逻辑
- 不改变现有 API 的请求/响应格式（只增加鉴权 header）
- 不删除任何现有功能
- 鉴权方案保持简单（X-Admin-Token header），不引入 OAuth/JWT 库

暂停条件：
- 涉及数据库 schema 变更时暂停并列出影响范围
- 同一问题卡住 3 次 → 列出 blocker

预算：最多 20 轮，或 45 分钟。
```

---

## Goal 2：数据完整性——品牌与概念实体补全（P0）

```text
/goal 在 /Users/xz/Documents/fountain-pen-graph 中补全品牌和概念实体。

背景：
当前数据库中品牌(type=brand)只有百乐 1 个，概念(type=concept)只有活塞上墨 1 个。
但有 269 支笔，笔名中包含弘典(HongDian)、金豪(Jinhao)、末匠(Majohn)、
永生(WingSung)、万宝龙(Montblanc)、坛笔(PenBBS)、白金(Platinum)、
写乐(Sailor)、凌美(Lamy)、派克(Parker)、英雄(Hero)、百利金(Pelikan)、
威迪文(Waterman)、犀飞利(Sheaffer)等品牌。

任务：
1. 从现有 pen 实体的 name/summary 中提取所有品牌，为每个创建 brand 类型实体
2. brand slug 统一英文小写（pilot, jinhao, hongdian, majohn 等）
3. 每个 brand 有：name（中英文）、summary（一句话）、attributes.founded（创立年份，已知的）
4. 建立 pen → brand 的 entity_links（link_type = "made_by"）
5. 补充常见概念实体：旋转上墨、真空上墨、滴入式上墨、暗尖、明尖、半明尖、
   金尖、钢尖、钛尖、铱金尖、书法尖、音乐尖
6. 每个 concept 有 summary 和 concept_rules（如果适用）
7. 输出为 migration 文件 009_brands_and_concepts.sql

验证：
1. `SELECT COUNT(*) FROM entities WHERE type = 'brand'` ≥ 15
2. `SELECT COUNT(*) FROM entities WHERE type = 'concept'` ≥ 8
3. 每支 pen 有至少一条 link_type='made_by' 的出向链接
4. 首页"品牌"卡片不再只显示 1 个词条
5. `pnpm build` 无报错

约束：
- 不修改现有 pen 实体的 name/slug/summary
- 不删除任何现有数据
- 已上线的 URL 不变

暂停条件：
- 品牌归属有歧义（联名款、子品牌）→ 记录到 PLAN.md 并暂停
- 同一问题卡住 3 次 → 列出 blocker

预算：最多 25 轮，或 40 分钟。
```

---

## Goal 3：暗色模式设计系统统一（P1）

```text
/goal 对 /Users/xz/Documents/fountain-pen-graph 统一暗色模式设计系统。

验收标准：
1. `pnpm build` 退出码 0
2. `grep -rn "text-gray-\|bg-gray-\|bg-white\|text-blue-\|bg-blue-\|border-gray-" src/ --include="*.tsx" --include="*.ts"` 返回 0 结果
3. 所有组件使用 CSS 变量（var(--color-*)）或 Tailwind theme() 函数
4. 以下页面在暗色模式下无颜色异常：
   - /compare（对比页）
   - /new（新建词条）
   - /pen/[slug]/edit（编辑页）
   - 任意词条详情页的 HoverPreview 弹出框
   - 任意词条详情页的 Recommendations 区域

需修复的文件：
- src/components/Recommendations.tsx — TYPE_COLORS 硬编码 green/blue/purple/orange/yellow/teal/gray
- src/components/HoverPreview.tsx — bg-white, dark:bg-gray-800, border-gray-200
- src/components/FacetPanel.tsx — text-gray-*
- src/components/CompareBar.tsx — gray-*
- src/app/compare/page.tsx — 全部硬编码灰色
- src/app/[type]/[slug]/edit/page.tsx — blue-600, gray-*
- src/app/new/page.tsx — blue-600, gray-*

约束：
- 不修改 globals.css 中的 CSS 变量定义
- 不引入新的 CSS-in-JS 库
- 保持现有视觉风格不变（只统一实现方式，不重新设计）

暂停条件：
- CSS 变量命名与现有体系冲突时暂停
- 超过 15 轮时
```

---

## Goal 4：UI 排版与空状态打磨（P1）

```text
/goal 在 /Users/xz/Documents/fountain-pen-graph 中修复 UI 排版和空状态问题。

验收标准：
1. `pnpm build` 退出码 0

2. 行距优化：
   - body_md 渲染区域的 prose 行高调整为 leading-relaxed（1.625）
   - summary 区域行高保持 1.7 或调整为 1.8

3. 图谱空白修复：
   - 当实体无关联时，LocalGraph 不返回 null，而是渲染空状态组件：
     显示图标 + "暂无关联数据" + "可通过编辑添加关系"链接
   - 或：如果无关联，整个"关系图谱" section 不渲染（二选一，推荐前者）

4. 编辑链接修复：
   - 详情页侧边栏"编辑"按钮链接改为 /${entity.type}/${entity.slug}/edit

5. 图标区分：
   - TYPE_ICONS 中 material 从 PenNib 改为 Circle 或 Cube
   - nib 保持 PenNib

6. 图片回退：
   - image_url 无效时显示首字占位符（browse 页已有此逻辑，详情页需补）

7. footer GitHub 链接验证，404 则移除或替换

约束：
- 不改变页面信息架构和路由结构
- 不引入新的 CSS 框架或依赖
- LocalGraph 有数据时的渲染逻辑不变

暂停条件：
- Tailwind 4 的 prose 配置方式不确定时暂停
- 超过 15 轮时
```

---

## Goal 5：代码质量——消除重复与修复 bug（P1）

```text
/goal 在 /Users/xz/Documents/fountain-pen-graph 中提升代码质量。

验收标准：
1. `pnpm build` 退出码 0
2. `pnpm tsc --noEmit` 退出码 0

3. 提取共享常量：
   创建 src/lib/constants.ts，导出：
   - TYPE_LABELS: Record<string, string>
   - TYPE_ICONS: Record<string, React.ComponentType<Record<string, unknown>>>
   - TYPE_COLORS: Record<string, string>（图谱节点颜色）
   - ATTR_LABELS: Record<string, string>
   更新所有引用文件（6+ 个）改为 import from @/lib/constants

4. 修复 markdown.ts wiki-link bug：
   remark-wiki-link 的 hrefTemplate 是同步函数，但 resolveHref 是异步的。
   修复方案：在 renderMarkdown 调用前，用正则提取所有 [[slug]]，
   批量查数据库构建 slug→href Map，然后在 hrefTemplate 中同步查表。
   验证：详情页的 [[双向链接]] 能正确解析为 /{type}/{slug}

5. 消除 eslint-disable：
   - grep -r "eslint-disable" src/ 返回 0 结果
   - 逐个修复 any 类型（优先 api/ > lib/ > components/）

约束：
- 不改变任何功能行为，只重构
- 不引入新的依赖
- 每修复一个文件立即 commit

暂停条件：
- remark-wiki-link 的同步/异步问题没有好的解决方案时暂停
- 超过 20 轮时
```

---

## Goal 6：SEO 与性能优化（P2）

```text
/goal 对 /Users/xz/Documents/fountain-pen-graph 进行 SEO 和性能优化。

验收标准：
1. `pnpm build` 退出码 0

2. SEO 补全：
   - 每个页面添加 generateMetadata：
     - 详情页：title="{entity.name} - 钢笔知识图谱"，description=entity.summary 前 120 字
     - 首页：title="钢笔知识图谱 - 找一支适合你的钢笔"
     - 浏览页/搜索页：相应 title 和 description
   - 添加 app/sitemap.ts 生成 sitemap.xml（列出所有实体 URL）
   - 添加 app/robots.ts 生成 robots.txt

3. 性能优化：
   - GET /api/entities 消除 N+1 查询（改为 JOIN 查询）
   - 确认 `pnpm build` 输出中无 large chunk 警告

4. Summary 质量：
   - 查询所有 pen 实体，找出 summary 不合格的（< 20 字、太泛、与其他相同）
   - 为每个生成新 summary：品牌+型号+差异化特征，30-80 字
   - 输出为 migration 文件 010_fix_summaries.sql

约束：
- 不修改数据库 schema（migration 除外）
- 不改变 API 响应格式
- 不引入新的 npm 依赖

暂停条件：
- 超过 15 轮时
```

---

## Goal 7：综合审计——模拟用户视角（P2）

```text
/goal 在 /Users/xz/Documents/fountain-pen-graph 中扮演挑剔的新用户，
从头到尾审计所有页面，找出并修复隐藏问题。

审计清单：

A. 首页 (/)
   - 搜索框能不能回车搜索？（当前是 Link 不是 form，需检查）
   - BentoGrid 在手机上布局是否正常？
   - "值得一读"列表的推荐理由是否可读？

B. 浏览页 (/browse)
   - FacetPanel 在数据少时是否显示合理？
   - 空结果提示是否友好？
   - 卡片图片加载失败是否有 fallback？

C. 详情页 (/{type}/{slug})
   - body_md 为空时页面是否还有意义？
   - tags 为空时侧边栏是否合理？
   - 移动端两栏布局是否正确折叠？

D. 搜索页 (/search)
   - 搜索"万宝龙"能否找到大班149？
   - 搜索"金尖"能否找到相关笔？

E. 问 AI (/chat)
   - 功能是否可用？

F. 全局
   - 暗色模式切换是否流畅？
   - 404 页面是否友好？（如无则添加自定义 not-found.tsx）
   - Footer 链接是否都有效？

对每个发现的问题：
1. 记录到 PLAN.md（问题描述 + 复现步骤 + 严重程度）
2. P0 直接修，P1 尽量修，P2 记录不修
3. 修一个 commit 一个

验证：
1. PLAN.md 记录所有发现
2. P0 全部修复
3. `pnpm build` 无报错

预算：最多 30 轮，或 60 分钟。
```

---

## 执行顺序

```
Goal 1（安全加固） → Goal 2（数据补全） → Goal 3（暗色模式） → Goal 4（UI打磨） → Goal 5（代码质量） → Goal 6（SEO性能） → Goal 7（综合审计） → Goal 8（手抄本风格）
```

理由：先堵安全漏洞（P0），再补数据（内容是核心价值），然后统一视觉（用户直接感知），再重构代码（可持续性），最后补 SEO 和做兜底审计。手抄本风格重写放在最后，因为它依赖 Goal 3 的暗色模式统一，且是纯视觉改动，不影响功能和数据。

> **Goal 8（中世纪手抄本风格重写）** 的完整 prompt 见独立文件：
> `/Users/xz/Documents/fountain-pen-graph/GOAL-MEDIEVAL-REWRITE-v2.md`（v2 含字体升级 + 动效系统 + 阴影层次）
