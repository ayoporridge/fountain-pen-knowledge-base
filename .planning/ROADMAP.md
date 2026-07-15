# Roadmap: Fountain Pen Knowledge Graph

**Created:** 2026-07-13
**Updated:** 2026-07-15
**Current Milestone:** v1.2 内容百科化与型号扩容
**Granularity:** Fine
**v1.2 Requirements:** 50

## Overview

v1.1 的 Phase 11–17 已完成分类资料馆的全量修复，并作为历史保留。v1.2 从 Phase 18 继续编号：先把 publication、readiness、audit 与 evidence 变成唯一可信的公开契约，再开放 renderer；随后稳定 taxonomy，以 Montblanc 149 校准 A 档内容生产，再逐条清完现有 65 个品牌和 231 个型号，最后依次完成 P0 13 项、P1 54 项并在正式站做零抽样验收。

## Milestones

- ✅ **v1.0 初始知识图谱** — Phases 1–10（completed）
- ✅ **v1.1 分类资料馆全量修复** — Phases 11–17（completed 2026-07-13）
- 🚧 **v1.2 内容百科化与型号扩容** — Phases 18–26（planned）

## Phases

### v1.1 — 分类资料馆全量修复（历史）

- [x] **Phase 11: 去搜索与去 LLM** - 删除公开搜索/AI 能力，分类导航覆盖发现路径
- [x] **Phase 12: 链接、身份与分类纠错** - 清理 404/空壳、重复实体、错误类型和内部字段
- [x] **Phase 13: 图片资产全量修复** - 修复破图、重复图、白边低清图和错配封面
- [x] **Phase 14: 文章导入残留清理** - 清理链接、脚本、翻译标记、摘要和标题结构
- [x] **Phase 15: 内容可信度与信息契约** - 降低模板腔，规范型号、品牌、概念与分类信息
- [x] **Phase 16: 分类漫游与响应式体验** - 修复手机导航、分类页、对比、图谱与无障碍
- [x] **Phase 17: 全量回归与生产发布** - 全量链接/实体/图片检查、浏览器验收和线上验真

### v1.2 — 内容百科化与型号扩容（当前）

- [ ] **Phase 18: 统一发布门禁** - 建立唯一 publication/readiness/public 集合并关闭所有空壳公开路径
- [ ] **Phase 19: 真实审计与证据契约** - 生成 296 条真实台账并让逐字段证据、版本、冲突和审核状态可判定
- [ ] **Phase 20: 百科页面 Renderer** - 只把当前 hash 下已发布的完整内容渲染成桌面与手机均可用的品牌/型号页
- [ ] **Phase 21: Taxonomy 与身份归一** - 完成 alias、merge、split、rename、variant 和争议身份治理并重算扩容净量
- [ ] **Phase 22: Montblanc 149 A 档样板** - 以全新研究、正文、规格、版本、来源和主图验证完整生产链
- [ ] **Phase 23: 现有 296 条库存清账** - 逐条处理 65 个品牌与 231 个型号，达标发布或带理由退出公开面
- [ ] **Phase 24: P0 13 项扩容** - 在现有库存清零后完成全部 P0 身份、内容、证据、媒体与原子发布
- [ ] **Phase 25: P1 54 项分批扩容** - 按地区和产品梯级逐批完成 P1，并继续隔离 P2/P3
- [ ] **Phase 26: 全库生产验收** - 在本地、Turso 和正式域名重复零抽样、零 retry 的最终验收

## Phase Details

<details>
<summary>✅ v1.1 分类资料馆全量修复（Phases 11–17）— completed 2026-07-13</summary>

### Phase 11: 去搜索与去 LLM

**Goal**: 当前版本只保留分类展示与关系漫游，任何公开页面、路由和导航都不再依赖搜索或 LLM。
**Depends on**: Phase 10
**Requirements**: SCOPE-01, SCOPE-02, SCOPE-03
**Success Criteria** (what must be TRUE):
  1. Header、Footer、首页、图书馆、手机导航和快捷键不再出现搜索或问 AI
  2. `/search`、`/chat` 及对应 API 不再作为公开产品能力，旧链接安全回到分类浏览
  3. 首页首要入口改为类型、品牌、维度和专题分类
  4. 构建产物不包含生产端 LLM 调用路径或所需密钥
**Plans**: Complete（historical milestone）
**UI hint**: yes

### Phase 12: 链接、身份与分类纠错

**Goal**: 所有公开对象有唯一、正确、可到达的身份，页面不暴露内部数据状态。
**Depends on**: Phase 11
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. 全部公开站内链接无 404、无 200 空壳目标
  2. Custom 823、Pelikan M800、Parker 51 等重复实体合并并保留规范跳转
  3. ballpoint、墨水、品牌入口和系列聚合不再伪装成单支钢笔
  4. identity pending、待映射、占位词和 snake_case 字段不再出现在公开页面
**Plans**: Complete（historical milestone）
**UI hint**: yes

### Phase 13: 图片资产全量修复

**Goal**: 图片稳定、对应、清晰，且每次出现都提供新的识别信息。
**Depends on**: Phase 12
**Requirements**: MEDIA-01, MEDIA-02, MEDIA-03, MEDIA-04
**Success Criteria** (what must be TRUE):
  1. 已知硬破图、HTML 伪图片、占位域名和代理异常全部修复或隐藏
  2. 型号页不再重复展示同一首图
  3. 高白边、低清和极端宽高比图片使用安全裁切、降级容器或替代图
  4. 不相关页面不再复用会导致误认的品牌氛围封面
**Plans**: Complete（historical milestone）
**UI hint**: yes

### Phase 14: 文章导入残留清理

**Goal**: 文章完成导入治理；经后续类型纠错后，当前 262 篇库内文章中 242 篇完整文章以资料馆形态公开，不再显示原站镜像或翻译中间产物。
**Depends on**: Phase 13
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-05
**Success Criteria** (what must be TRUE):
  1. 相对链接、javascript 链接和错误站内路径全部清理
  2. 翻译结果、原站操作说明、残缺 ref 和 Markdown 泄漏清零
  3. 每篇文章只有一个 H1，正文、图片说明和章节层级语义正确
  4. 来源卡只显示可理解且已审核的来源信息
**Plans**: Complete（historical milestone）
**UI hint**: yes

### Phase 15: 内容可信度与信息契约

**Goal**: 详情页以已核实事实回答用户问题，判断与体验表达自然、有边界、不批量套模板。
**Depends on**: Phase 14
**Requirements**: CONT-04, INFO-01, INFO-02, INFO-03, INFO-04, INFO-05
**Success Criteria** (what must be TRUE):
  1. 未核实规格不再伪装成完整档案，缺失值统一处理
  2. 核心型号只展示已有审核来源支持的规格；尺寸、重量、墨量、尖号、密封、兼容、状态和价格缺证时省略
  3. 品牌、笔尖、上墨和概念页使用中文可识别结构并提供来源和实例
  4. 批量模板措辞显著下降，典型病句、重复标题和夹生字段清零
**Plans**: Complete（historical milestone）
**UI hint**: yes

### Phase 16: 分类漫游与响应式体验

**Goal**: 无搜索模式下，桌面和手机用户都能通过分类与关系继续浏览。
**Depends on**: Phase 15
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05
**Success Criteria** (what must be TRUE):
  1. 手机导航完整可见并可键盘、触摸操作
  2. 分类切换、筛选、计数和继续加载在桌面手机均可用
  3. 依赖不完整规格的对比页退出当前版本，旧地址确定性回到钢笔分类
  4. 图谱节点、起点选择、标题、alt、焦点与对比度达到基本可用标准
**Plans**: Complete（historical milestone）
**UI hint**: yes

### Phase 17: 全量回归与生产发布

**Goal**: 用全量自动化与真实浏览器证明修复已落到生产站。
**Depends on**: Phase 16
**Requirements**: QA-01, QA-02, QA-03, QA-04
**Success Criteria** (what must be TRUE):
  1. 当前 sitemap 中全部 URL 与所有公开站内链接检查通过
  2. 550 个公开实体的数据、类型、字段与来源检查通过
  3. 全部公开图片的加载、重复、白边低清、比例和 alt 检查通过
  4. 桌面与手机关键路径通过，生产部署后的 URL、内容和媒体与本地一致
**Plans**: Complete（historical milestone）
**UI hint**: yes

</details>

### Phase 18: 统一发布门禁

**Goal**: 公开页面只来自同一个可计算、可失效的 `public_entities` 真相集合，新建或未达标实体不会再以空壳形式泄漏。
**Depends on**: Phase 17
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06
**Success Criteria** (what must be TRUE):
  1. 新建实体默认保持 draft；未达标、retired 或身份未决条目从详情页及全部发现入口消失，直接访问为 404，canonical 合并项明确跳转
  2. 完整列表型 surface 与 `public_entities` 双向相等；detail/metadata 按 ID 可达性等价；facets/统计聚合等价；graph、recommendations、品牌代表型号等上下文结果严格为其子集
  3. 正文、摘要、规格、证据、版本或主图变化后，旧 content review 立即失效，条目重新审核前不能继续公开
  4. 迁移只建立显式 publication 记录和 draft/backlog，不会批量复活 313 篇 deprecated 旧故事或 grandfather 旧条目
**Plans**: TBD
**UI hint**: yes

### Phase 19: 真实审计与证据契约

**Goal**: 以真实可见状态而非 raw row 统计全库，并让每个公开事实的来源、适用版本、冲突和审核结果都可独立验证。
**Depends on**: Phase 18
**Requirements**: EVID-01, EVID-02, EVID-03, EVID-04, EVID-05, EVID-06, AUD-01, AUD-02, AUD-03, AUD-04, AUD-05, QA-01
**Success Criteria** (what must be TRUE):
  1. 2026-07-15 基线的 65 个品牌、231 个型号各有一条 NDJSON/CSV 台账记录，可逐条看到实际公开内容、证据、审核状态与 blocker；`--limit` 不改变全库判定
  2. 每个可公开规格字段都有 approved citation、evidence locator 与 variant/region/date scope；镜像只算一个独立来源组，retailer、社区或搜索结果不能独立解锁身份与核心规格
  3. 同一 scope 的冲突在解决前不进入规格卡，身份冲突阻止整条发布；内容、事实、中文和媒体审核分别绑定当前 hash
  4. audit 只统计真正可公开的数据，任一硬 blocker 都使条目失败；CI fixture 能确定性覆盖 deprecated、pending、needs_source、镜像、无逐字段 citation、unresolved conflict 与合格实体
  5. CI 和生产门禁报告 `published blockers = 0`，且 sitemap、browse、API、graph 与 `public_entities` 的集合差异为 0
**Plans**: TBD

### Phase 20: 百科页面 Renderer

**Goal**: 用户在品牌和型号页看到的是当前 content hash 下唯一已发布、证据充分且适合阅读的完整百科内容。
**Depends on**: Phase 19
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07
**Success Criteria** (what must be TRUE):
  1. 品牌和型号页显示 60–160 字自然中文摘要及唯一 published story，不再从 deprecated story 或 legacy body 拼出正式正文
  2. 型号页可阅读身份、历史、设计/尺寸/材质、笔尖与归因体验、上墨维护、版本边界和购买检查点，并显示逐字段有证据的规格、来源、版本与实体准确主图
  3. 品牌页可阅读正式正文、至少两个已审核时间节点、至少一个达标代表型号、来源及品牌相关主图
  4. 未知或未批准模块直接省略，页面不出现“暂无规格/来源/图片”等占位块，示意封面不冒充实物图
  5. 桌面与手机均可完整阅读章节导航、表格、来源、图片、版本和关系入口，无横向溢出或不可操作区域
**Plans**: TBD
**UI hint**: yes

### Phase 21: Taxonomy 与身份归一

**Goal**: 用户只会遇到稳定的 canonical 品牌/型号身份，地区名、衍生款、混合页和争议归属不会制造重复或误导页面。
**Depends on**: Phase 20
**Requirements**: TAX-01, TAX-02, TAX-03, TAX-04, TAX-05, TAX-06, EXP-01, EXP-05
**Success Criteria** (what must be TRUE):
  1. Asvine P36、Metropolitan/Cocoon、Elabo/Falcon 等别名或地区名归入单一 canonical entity，并仍可通过 alias 到达
  2. Waterman、Opus 88、Leonardo 等混合页按稳定型号和购买差异拆分；旧 URL、关系、标签、证据、媒体和引用迁移后无重复页或断链
  3. Sailor Pro Gear Slim 家族与衍生款使用 family/variant，普通颜色、镀层、尖宽和地区限定不再独立建型号页；Aurora 泛称占位由真实型号替换
  4. SKB/Penton/SIKIB、Wing Sung/JunLai 630 等身份争议在证据充分前保持 draft，且不错误挂靠品牌
  5. taxonomy 批次完成后，109 项矩阵明确给出 create、merge、split、rename、alias、retire 的净数量，不再把处理项数当作新增页数
**Plans**: TBD
**UI hint**: yes

### Phase 22: Montblanc 149 A 档样板

**Goal**: Montblanc 149 成为首个从研究、证据、写作、媒体、审核到公开页面全部通过的 A 档精确回归样板。
**Depends on**: Phase 21
**Requirements**: CONT-08
**Success Criteria** (what must be TRUE):
  1. Montblanc 149 页面以全新研究形成 2000–3500 字自然中文正文，清楚区分跨年代版本、现售/历史规格和购买检查点
  2. 至少五项公开规格逐字段有证据，来源包含一手/档案与独立专业二手组，主图准确对应型号且许可、attribution 与落地路径完整
  3. 页面不依赖 deprecated story、needs_source spec 或 pending claim 获得资格；内容 hash、审核、readiness 和 publication 结果可被确定性复验
  4. 桌面与手机真实浏览器都能完整阅读正文、规格、版本、来源、图片和关系入口，且 Montblanc 149 回归 fixture 通过
**Plans**: TBD
**UI hint**: yes

### Phase 23: 现有 296 条库存清账

**Goal**: 2026-07-15 基线的 65 个品牌与 231 个型号全部有可信终态，不再有未盘点或靠低质量数据占据公开面的条目。
**Depends on**: Phase 22
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07
**Success Criteria** (what must be TRUE):
  1. 基线 296 条逐条清账完毕，每条最终为达标 published，或带明确 blocker 的 draft/retired 并完全退出公开面，未盘点数为 0
  2. 每个公开型号满足 A/B/C 对应正文篇幅与主题覆盖，至少五项逐字段核实规格、两个独立来源组和合格主图；每个公开品牌具备完整身份/时间线/产品体系及至少一个达标代表型号
  3. 53 篇 Richard’s Pens legacy longform 逐篇完成版权、allowed use、独立性和事实 scope 审查；无站内全文权利的内容只作研究材料
  4. 223 个缺严格公开型号图的条目逐条完成来源、许可、落地、attribution 和实体匹配，无法取得合格图片的条目保持不公开
  5. 全库重复句、模板段、AI 套话、机器翻译腔、模糊归因、第一人称归属、数字/单位和中英文排版检查对所有新写或重写正文零失败
**Plans**: TBD
**UI hint**: yes

### Phase 24: P0 13 项扩容

**Goal**: 在现有 296 条库存完成清账后，覆盖矩阵的 13 个 P0 处理项全部以同一硬门槛获得正确身份和公开结果。
**Depends on**: Phase 23
**Requirements**: EXP-02, EXP-04
**Success Criteria** (what must be TRUE):
  1. 13 个 P0 处理项全部完成身份、研究、正文、逐字段证据、版本、图片、中文审核和 publication 验收，不留未决处理项
  2. 已在 taxonomy 阶段纠正或拆分的 P0 项复用 canonical 结果，不创建重复页面；其余项只按重算后的净新增清单创建
  3. 每个新品牌或型号先以 draft 入库，只有整条 readiness 无 blocker 后才原子发布，任何公开入口都看不到“先上壳、后补内容”的页面
  4. P0 批次的 published 集合在桌面、手机与公开 API 中一致，未达标项仍保持隐藏且理由可审计
**Plans**: TBD
**UI hint**: yes

### Phase 25: P1 54 项分批扩容

**Goal**: 54 个 P1 处理项按地区和产品梯级形成可独立验收的完整批次，同时不以 P2/P3 数量稀释质量门槛。
**Depends on**: Phase 24
**Requirements**: EXP-03, EXP-06
**Success Criteria** (what must be TRUE):
  1. 54 个 P1 处理项全部分配到明确地区/产品梯级批次，每一批的身份、内容、证据、媒体和 publication 全量通过后才开始下一批
  2. 每个公开 P1 品牌/型号达到与现有库存和 P0 完全相同的硬门槛；资料不足或身份未决项保持 draft，不能用其他合格项抵消
  3. P1 完成后处理项台账无遗漏、无重复、无错误 variant 独立页，所有 canonical URL、关系和品牌代表型号可继续漫游
  4. P2 的 40 项和 P3 的 2 项保留 future/stretch；Graphomatic Inkmaker、Duke 551 等不会为增加数量而降低身份或来源门槛
**Plans**: TBD
**UI hint**: yes

### Phase 26: 全库生产验收

**Goal**: 本地数据库、远程 Turso 与正式域名以同一套零抽样、零 retry 证据证明 v1.2 的全部公开内容和边界真实成立。
**Depends on**: Phase 25
**Requirements**: QA-02, QA-03, QA-04, QA-05, QA-06
**Success Criteria** (what must be TRUE):
  1. Montblanc 149、核心 A/B/C 型号、品牌页、draft 访问、canonical redirect 和 taxonomy split/merge 的确定性浏览器回归全部通过
  2. sitemap 中每个品牌和型号逐条通过摘要、正文长度/主题、规格证据、独立来源、主图、版本、禁用文案、移动端布局和站内链接检查，无抽样或跳过项
  3. 所有 draft、retired 和 unqualified 条目均不出现在 browse、sitemap、graph、recommendations 与 API，直接访问不会返回可索引空壳 200
  4. 本地 SQLite、远程 Turso migration 与数据契约全部通过后才部署；生产站重复同一套全量验收且零 retry
  5. 正式域名指向已验收 deployment，运行日志无应用 HTTP 500，全部图片、来源链接和 canonical redirect 在线复查通过
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:** Phase 18 → 19 → 20 → 21 → 22 → 23 → 24 → 25 → 26

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 11. 去搜索与去 LLM | v1.1 | Complete | Complete | 2026-07-13 |
| 12. 链接、身份与分类纠错 | v1.1 | Complete | Complete | 2026-07-13 |
| 13. 图片资产全量修复 | v1.1 | Complete | Complete | 2026-07-13 |
| 14. 文章导入残留清理 | v1.1 | Complete | Complete | 2026-07-13 |
| 15. 内容可信度与信息契约 | v1.1 | Complete | Complete | 2026-07-13 |
| 16. 分类漫游与响应式体验 | v1.1 | Complete | Complete | 2026-07-13 |
| 17. 全量回归与生产发布 | v1.1 | Complete | Complete | 2026-07-13 |
| 18. 统一发布门禁 | v1.2 | 0/TBD | Not started | - |
| 19. 真实审计与证据契约 | v1.2 | 0/TBD | Not started | - |
| 20. 百科页面 Renderer | v1.2 | 0/TBD | Not started | - |
| 21. Taxonomy 与身份归一 | v1.2 | 0/TBD | Not started | - |
| 22. Montblanc 149 A 档样板 | v1.2 | 0/TBD | Not started | - |
| 23. 现有 296 条库存清账 | v1.2 | 0/TBD | Not started | - |
| 24. P0 13 项扩容 | v1.2 | 0/TBD | Not started | - |
| 25. P1 54 项分批扩容 | v1.2 | 0/TBD | Not started | - |
| 26. 全库生产验收 | v1.2 | 0/TBD | Not started | - |
