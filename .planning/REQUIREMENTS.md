# Requirements: Fountain Pen Knowledge Graph v1.2

**Defined:** 2026-07-15
**Core Value:** 通过可信、完整且彼此关联的内容，让用户持续漫游钢笔知识网络，而不是打开只有标题和关系的空壳页。

## v1.2 Requirements

### 公开资格与边界

- [ ] **PUB-01**: 每个品牌和型号具有独立 publication 状态；新建实体默认 `draft`，不能因写入 `entities` 就自动公开
- [ ] **PUB-02**: 系统通过统一 readiness 契约计算正文、规格、证据、版本、媒体、中文审核与 blocker，只有全部硬门槛通过的实体才可 `published`
- [ ] **PUB-03**: 详情页、metadata、browse、facets、sitemap、graph、recommendations、品牌代表型号和公开 API 使用完全相同的 `public_entities` 集合
- [ ] **PUB-04**: 未达标、退休或身份未决的条目不出现在任何公开入口；直接访问返回 404，canonical 合并项使用明确 redirect
- [ ] **PUB-05**: 正文、摘要、规格、证据、版本或主图变化后，旧 content review 因 hash 变化自动失效，实体不能继续沿用旧审核公开
- [ ] **PUB-06**: 数据迁移只能建立 draft/backlog 与显式 publication 记录，不得批量恢复 313 篇 deprecated 旧故事或自动 grandfather 旧条目

### 证据、版本与审核模型

- [ ] **EVID-01**: 每个公开规格字段都有独立 approved citation、evidence locator 和适用范围；row-level queue anchor 不能解锁整份规格
- [ ] **EVID-02**: 来源记录包含 source kind/tier、independence group、allowed use、retrieved date 与必要的归档定位，镜像与转载只算一个独立来源组
- [ ] **EVID-03**: 现售、历史、地区、年代、笔尖、材料和特别版差异具有明确 variant/scope；型号家族事实不能由单一当前特别版反向证明
- [ ] **EVID-04**: 同一 scope 的冲突事实有 unresolved/resolved 状态与 resolution note；未解决的字段不进入规格卡，身份冲突阻止整条发布
- [ ] **EVID-05**: 事实、中文自然度、媒体相关性/许可和最终 publication review 分开记录，并绑定被审核内容的 hash
- [ ] **EVID-06**: 一手来源或同期档案与独立专业二手来源共同构成公开门槛；retailer、社区和搜索结果不能单独证明身份与核心规格

### 全量测量与质量门禁

- [ ] **AUD-01**: 为 2026-07-15 基线的 65 个公开品牌、231 个公开型号生成逐条 NDJSON/CSV 台账，记录所有可见内容、审核状态、证据与 blocker
- [ ] **AUD-02**: entity quality 与 library coverage 只统计真正可公开的状态和数据，不把 deprecated、pending、needs_source、candidate、draft 或不可复用媒体计为完成
- [ ] **AUD-03**: 任一硬 blocker 都必须让条目失败；审计不再要求同时出现两个薄弱理由，也不再用总分抵消缺正文、缺来源或缺图片
- [ ] **AUD-04**: readiness audit 同时输出 publication 结果和 backlog 原因，`--limit` 只能限制展示数量，不能改变全库判定
- [ ] **AUD-05**: CI 与生产发布门禁要求公开 blocker 为 0，且 sitemap/browse/API/graph 的实体集合与 `public_entities` 精确相等

### 品牌与型号页面

- [ ] **PAGE-01**: 品牌和型号页显示 60–160 字自然中文摘要，摘要能独立说明身份和最重要特征，且不替代正文
- [ ] **PAGE-02**: 页面只渲染当前 content hash 下已 `published` 的 `brand_story` 或 `model_story`，不使用 deprecated 旧稿或 legacy body 冒充正式正文
- [ ] **PAGE-03**: 型号页显示逐字段有证据的核心规格、版本差异、来源与主图；未知字段省略，不出现“暂无规格/来源/图片”等公开占位块
- [ ] **PAGE-04**: 品牌页显示正式品牌正文、至少两个已审核时间节点、至少一个已达标代表型号、来源与品牌相关主图
- [ ] **PAGE-05**: 公开主图必须确实对应当前实体、许可和 attribution 完整、具有稳定本地或受控托管路径；示意封面不能冒充实物图
- [ ] **PAGE-06**: 型号页正文覆盖身份与产品线、历史与重要性、设计/尺寸/材质/握持、笔尖与有归因的书写体验、上墨维护、版本边界和购买检查点
- [ ] **PAGE-07**: 页面在桌面与手机端均能阅读完整内容，章节导航、表格、来源、图片、版本和关系入口可用且无横向溢出

### 现有库存全量修复

- [ ] **CONT-01**: 基线 296 个品牌/型号全部逐条处理，不留未盘点项；每条最终为“达标 published”或“有明确理由的 draft/retired 且退出公开面”
- [ ] **CONT-02**: A 档经典型号正文 2000–3500 字、B 档主流型号 1000–1800 字、C 档长尾/入门型号 500–900 字；各档均执行同一事实、来源、图片和中文审核门槛
- [ ] **CONT-03**: 每个公开型号至少有五项逐字段核实的结构化规格，以及至少两个独立来源组，其中包含一手/档案和独立专业二手来源
- [ ] **CONT-04**: 每个公开品牌具有起源、公司/制造身份、发展节点、代表设计或技术、产品体系、当前状态和至少一个已达标代表型号
- [ ] **CONT-05**: 所有新写或重写正文通过全库重复句、模板段、AI 套话、机器翻译腔、模糊归因、第一人称归属、数字/单位和中英文排版检查
- [ ] **CONT-06**: 53 篇 Richard’s Pens legacy longform 逐篇核查版权、allowed use、来源独立性和事实适用范围；不具备站内全文权利的只作为研究材料
- [ ] **CONT-07**: 223 个缺严格公开型号图的条目逐条处理媒体来源、许可、落地文件、attribution 和实体匹配；无法取得合格图片的条目不公开
- [ ] **CONT-08**: Montblanc 149 作为首个 A 档精确回归样板，重新研究跨年代版本、规格、独立来源、主图和自然中文正文，不能仅恢复旧 story status

### 身份与 taxonomy

- [ ] **TAX-01**: Asvine P36、Pilot Metropolitan/Cocoon、Elabo/Falcon 等别名和地区名归一为单一 canonical entity，并保留可检索 alias
- [ ] **TAX-02**: Waterman Charleston/Hémisphère、Opus 88 Demo/Koloro、Leonardo Furore/Momento Magico 等混合页按稳定型号与购买差异拆分并迁移证据
- [ ] **TAX-03**: Sailor Pro Gear Slim 家族与四季织衍生款建立 family/variant 关系，配色和限定版不重复建型号页
- [ ] **TAX-04**: Aurora 泛称占位由 Aurora 88/Optima 等真实型号替换，品牌介绍不能伪装成型号
- [ ] **TAX-05**: 台湾 SKB 与 Penton/SIKIB、Wing Sung/JunLai 630 等身份争议在证据充分前保持 draft，不错误挂靠品牌
- [ ] **TAX-06**: merge、split、rename 和 retire 后，旧 URL、关系、标签、来源、媒体和引用均有可验证的迁移结果，不制造重复页或断链

### 品牌与型号扩容

- [ ] **EXP-01**: taxonomy 批次完成后重新计算 109 项矩阵中的 create、merge、split、rename、alias 和 retire 净数量，不把 109 误当作净新增页数
- [ ] **EXP-02**: 覆盖矩阵 13 个 P0 处理项全部完成身份、研究、内容、证据、图片与 publication 验收
- [ ] **EXP-03**: 覆盖矩阵 54 个 P1 处理项按地区和产品梯级分批完成，同一批次全量通过后才进入下一批
- [ ] **EXP-04**: 新品牌和型号先以 draft 入库，达到与现有条目相同的硬门槛后原子发布，不允许先公开空壳再补内容
- [ ] **EXP-05**: 颜色、镀层、普通尖宽和地区限定默认进入 variant；只有机制、笔尖系统、尺寸、定位或购买决策明显不同才建立独立型号页
- [ ] **EXP-06**: P2 的 40 项和 P3 的 2 项保留为 future/stretch；没有足够来源和身份结论时不得为增加数量而公开

### 发布与全量验收

- [ ] **QA-01**: 数据层 fixture 覆盖 deprecated story、pending claim、needs_source spec、镜像来源、无逐字段 citation、unresolved conflict 和完整合格实体
- [ ] **QA-02**: Montblanc 149、核心 A/B/C 型号、品牌页、draft 页面、canonical redirect 和 taxonomy split/merge 具有确定性浏览器回归
- [ ] **QA-03**: 对 sitemap 中每个品牌和型号逐条检查摘要、正文长度与主题、规格证据、独立来源、主图、版本、禁用文案、移动端布局和站内链接
- [ ] **QA-04**: 所有 draft/retired/unqualified 条目均不出现在 browse、sitemap、graph、recommendations 与 API，直接公开访问不返回可索引空壳 200
- [ ] **QA-05**: 本地 SQLite、远程 Turso migration 和数据契约全部通过后再部署生产，生产站重复同一套零抽样、零 retry 验收
- [ ] **QA-06**: 正式域名与 deployment 内容一致，运行日志无应用 HTTP 500，所有图片、来源链接和 canonical redirect 完成线上复查

## Future Requirements

### P2/P3 扩容

- **FUT-01**: 在 P0/P1 完成并稳定维护后，再评估覆盖矩阵 40 个 P2 型号
- **FUT-02**: Graphomatic Inkmaker、Duke 551 等 P3 条目只有在身份和来源门槛通过后才进入公开队列

### 检索与智能能力

- **FUT-03**: 在内容、来源与 publication gate 稳定后，重新评估是否需要全文搜索
- **FUT-04**: 在引用、质量控制和版本证据成熟后，重新评估面向用户的 AI 问答

## Out of Scope

| Feature | Reason |
|---------|--------|
| 批量复活 deprecated 旧故事 | 旧稿已因模板化、AI 味和证据不足被主动退役，只能作为研究线索 |
| 每个配色、镀层、尖宽和联名独立建页 | 它们默认属于 variant，独立建页会制造重复与维护负担 |
| 用 retailer、社区或搜索摘要单独证明核心规格 | 不满足可靠来源和独立性门槛 |
| P2/P3 全部强行纳入 v1.2 | 先完成现有库存与 P0/P1，避免再次以数量代替质量 |
| 全文搜索、搜索建议、在线 LLM/Chat | 当前版本继续以分类、品牌、维度和关系漫游为主 |

## Traceability

Roadmap 创建后填入；每条 requirement 必须且只能映射到一个 phase。

**Coverage:**
- v1.2 requirements: 50 total
- Mapped to phases: 0
- Unmapped: 50

---
*Requirements defined: 2026-07-15*
*Last updated: 2026-07-15 after v1.2 content research*
