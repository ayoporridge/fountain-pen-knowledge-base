# 钢笔图书馆执行状态

更新时间：2026-06-25

本文用于长程 goal 续跑时快速判断 `library-00` 到 `library-12` 的当前落地状态。以仓库当前文件、数据库检查和页面渲染为准；不要仅凭本文判断完成。

## 状态总览

| 编号 | 目标 | 当前证据 | 状态 | 下一步 |
| --- | --- | --- | --- | --- |
| library-00 | 来源政策与版权边界 | `docs/content/source-policy.md` | 已落地 | 持续把新来源写入 `source_registry` |
| library-01 | 图书馆 schema | `migrations/011_library_schema.sql` | 已落地 | 后续迁移保持向前兼容 |
| library-02 | Wikidata 品牌引导 | `scripts/import-wikidata-brands.ts`，16 个品牌的 `external_ids`/`entity_aliases`/`entity_references`，详情页外部标识面板 | 已落地 | 对没有稳定 Wikidata 条目的中国/社区品牌改走官网、目录、论坛和中文资料来源 |
| library-03 | 品牌馆 | `BrandMuseum`，品牌页展示身份卡、别名、claims、故事、时间线、代表型号、来源；已补 69 个品牌故事/研究草稿，69 个品牌全部达到 ready，品牌 gap 为 0 | 已落地 | 继续补时间线与更深型号来源 |
| library-04 | 型号档案 | `ModelArchive`，型号页展示参数、claims、版本、图示、来源；`scripts/import-official-model-sources.ts` 已补 25 个结构化型号档案，`scripts/import-research-gap-sources.ts` 为 20 个低资料型号建立待核验档案，`scripts/import-model-gap-sources.ts` 为 84 个 0 分优先型号建立研究队列档案，`scripts/import-official-model-diagrams.ts` 已补 4 张型号图示 | 已落地 | 扩写型号规格、版本来源和更多证据型图示 |
| library-05 | 时间线 | `timeline_events`，`Timeline`，`/timeline` | 已落地 | 增加品牌/型号历史节点 |
| library-06 | 图示体系 | `diagrams`，`DiagramRenderer`，`/library/diagrams`，`diagram-plan.md`；当前 9 张 SVG 图示，其中 4 张为重点型号站内原创 SVG；75 张 Warm Pen Atlas bitmap 插画已生成并入媒体资产 | 已落地 | 证据型机制图继续优先用 SVG；按用户反馈，暂停继续生成 bitmap 插画 |
| library-07 | 媒体授权 | `media_assets`，`/library/media`，`scripts/import-commons-media.ts`，`scripts/import-warm-pen-atlas-media.ts`，来源政策；已扩展 10 个 Commons 搜索 profile 并收紧标题/关键词过滤，另有 75 张 `site-original` Warm Pen Atlas 插画和 5 个复用占位媒体绑定 | 已落地 | Commons 候选仍需人工复核；按用户反馈暂停继续生成 bitmap 图 |
| library-08 | 来源/参考索引 | `source_registry`，`source_items`，`entity_references`，`/library/sources` 支持按来源类型与具体来源筛选；`scripts/import-official-brand-sources.ts` 维护重点品牌官方来源；`scripts/import-official-brand-stories.ts` 写入来源支撑的品牌故事草稿；`scripts/import-brand-completion-sources.ts` 补齐品牌故事、别名和外部入口；`scripts/import-research-gap-sources.ts` 为低资料条目建立研究队列 | 已落地 | 增加按实体反查来源和审核队列 |
| library-09 | 玩家口碑 | `community_summaries`，`/library/community` | 已落地 | 用官方 API 元数据扩充 Reddit/论坛摘要 |
| library-10 | 策展展览 | `exhibits`，`exhibit_sections`，`/exhibits` | 已落地 | 把草稿展览推进到 reviewed/published |
| library-11 | 图书馆首页与导航 | `/library`，Header/MobileNav 入口 | 已落地 | 根据真实内容增长调整入口权重 |
| library-12 | 验证、数据契约与 rollout | `scripts/check-library-contract.ts`，`scripts/audit-library-coverage.ts`，`scripts/audit-entity-quality.ts`，`/library/coverage`，`tests/e2e/library.spec.ts` | 已落地 | 用覆盖审计和实体质量审计驱动后续批量扩写 |

## 当前交互修复

- 关系图谱：`LocalGraph` 关闭局部预览里的背景平移和节点拖拽，只保留节点点击与缩放，避免用户把图谱横向拖到右侧裁切边缘后只剩一条可见内容。
- 自动适配：`zoomToFit` padding 从 36 收紧到 18，让图谱在卡片内占用更合理的宽度。
- 回归测试：`tests/e2e/library.spec.ts` 增加 `/pen/永生-wingsung-601a` 横向拖拽测试，拖拽后 canvas 内可见图谱宽度必须保持大于 300px，且不能贴住右侧边界。
- 关联词条：详情页关联查询显式过滤旧 `reverse` 边，并按实体稳定分组；`RelatedEntities` 不再在外层标题下面重复渲染同名标题。
- 去重测试：`tests/e2e/library.spec.ts` 增加 `/pen/永生-wingsung-601a` 关联词条测试，确认“关联词条”标题只出现一次，永生品牌链接只出现一次。

## 当前数据基线

`npm run seed:library` 应至少写入：

- stories: 200（seed 基线为 4，含后续品牌/型号故事草稿和研究队列草稿）
- claims: 270（seed 基线为 12，含后续来源、故事、型号档案、图示引用和研究队列 claims）
- citations: 794（seed 基线为 26，含后续来源、故事、型号档案、图示引用和研究队列引用）
- timeline_events: 73（seed 基线为 5，含后续品牌/型号历史节点和研究队列节点）
- diagrams: 9（seed 基线为 5，含后续 4 张重点型号站内原创 SVG）
- media_assets: 110（seed 基线为 2，含后续 Commons 文件候选、75 张 Warm Pen Atlas 站内原创插画和 5 个复用占位媒体绑定）
- community_summaries: 2
- exhibits: 6
- source_items: 627（seed 基线为 15，含后续导入来源索引、官方/二级型号档案、二级品牌资料、研究缺口入口和 Warm Pen Atlas 图像来源项）

`npm run check:library` 应至少验证：

- 图书馆表均存在。
- `source_registry`、`source_items`、`claims`、`citations`、`stories`、`diagrams`、`media_assets`、`community_summaries`、`exhibit_sections` 没有断链或空字段。
- Wikidata 外部 ID 不少于 16 条。
- entity aliases 不少于 290 条。
- seed claims 不少于 10 条。
- source bindings 不少于 15 条。
- 文件级 Wikimedia Commons 媒体候选会显示为 `commonsMedia` 计数；缺失时仅警告，导入后图片行必须有来源页、source item 和预览 URL。
- `npm run audit:library-coverage` 会输出品牌/型号覆盖均分、ready/gap 数量，以及优先补全实体清单。
- `npm run audit:entity-quality` 会输出疑似误分类的文章型型号、重复名称组、内容过薄的品牌/型号，以及断链数量。
- `npm run fix:pen-articles` 默认 dry run；`npm run fix:pen-articles -- --write` 会把高置信度文章型 `pen` 改为 `article`。
- `npm run import:richardspens-references` 默认 dry run；`npm run import:richardspens-references -- --write` 会把已有 Richard's Pens URL 整理为来源索引和实体引用。
- `npm run verify:markdown` 会抽查最长的 80 篇正文，确认 Markdown 能渲染、图片 URL 安全、没有裸露的图片竖线行、没有残留粗体/双链语法。
- `npm run check:data-contract` 会把文章型 `pen` 视为数据契约错误，避免型号馆再次混入文章页。
- 公网页面默认只读：`/new` 和 `/:type/:slug/edit` 返回 404，内容写入 API 默认返回 403。只有设置 `CONTENT_WRITE_ENABLED=true` 且通过 `CONTENT_WRITE_TOKEN` 或 `ADMIN_TOKEN` 才允许维护写入。

## 当前实体质量

最近一次本地修复已把 18 个文章型 `pen` 重分类为 `article`。当前实体类型基线：

- article: 201
- brand: 69
- concept: 13
- fill_system: 14
- nib: 34
- pen: 251

最近一次 `npm run audit:entity-quality`：

- duplicate name groups: 0
- suspicious pen articles: 0
- thin brand/model entities: 62
- broken/self links: 0

详情页会校验 URL 类型和实体真实类型。不匹配时会跳转到 canonical 路径，例如旧的 `/pen/i-moore-evans-who-were-they` 会跳到 `/article/i-moore-evans-who-were-they`。

## 当前来源索引

最近一次本地/远端导入已把已有 Richard's Pens、Wikidata、重点品牌官方来源、品牌补全来源、新增二级品牌资料和优先型号研究队列整理进来源索引：

- source_registry: 67
- source_items: 627
- entity_references: 561
- stories: 200
- citations: 794
- claims: 270
- timeline_events: 73
- media_assets: 110
- external_ids: 61
- entity_aliases: 491
- commonsMedia: 28
- richardspens source_items: 309
- richardspens entity_references: 316
- wikidata source_items: 16
- wikidata entity_references: 16
- official source registries: 31（Pilot、LAMY、Sailor、Schneider、Visconti、Cross、Aurora、Platinum、Kaweco、Montblanc、Waterman、M&G、Parker、Sheaffer、Pelikan、Faber-Castell、Diplomat、Esterbrook、Conklin、Leonardo、TWSBI、Nakaya、Wancher、Namiki、Monteverde、SKB、KACO、Snowhite、Hero、Picasso、DareWorks）
- secondary model source registries: 2（JUSPIRIT retail catalog、LOXPO user review archive）
- Warm Pen Atlas generated source registry: 1
- new secondary brand source registries: 7（Alibaba Qiangu、Sketchy Wolf、The Poor Penman、FrankUnderwater、Rupert Arzeian、dapprman、Everyday Scrawl）
- research-gap source registries: 3（DareWorks official、Fountain Pen Network、Public web research index），其中 Public web research index 继续承载低资料条目和优先型号中的搜索型研究入口；Sailor/LAMY 第二批优先型号优先使用官方产品/系列页作为锚点。早前研究缺口批次对应 21 个 source_items、40 个故事/型号研究草稿、40 个研究队列/待核验 claims、5 个复用占位媒体绑定
- referenced entities: 508

最近一次 `npm run audit:library-coverage` 显示品牌覆盖均分为 96/100，品牌 ready 为 69/69，gap 为 0，品牌故事覆盖为 69/69（100%），品牌来源覆盖为 69/69（100%），品牌 claim 覆盖为 69/69（100%），品牌媒体覆盖为 69/69（100%），品牌时间线覆盖为 62/69（90%）；型号覆盖均分为 40/100，型号 ready 为 15，starter 为 116，gap 为 120，型号故事覆盖为 131/251（52%），型号 claim 覆盖为 131/251（52%），型号来源覆盖为 192/251（76%），型号媒体候选覆盖为 16/251（6%），型号规格覆盖为 131/251，型号图示覆盖为 6/251（2%），型号时间线覆盖为 7/251（3%）。`scripts/import-brand-completion-sources.ts` 已把 Montblanc、Waterman、M&G、Parker、Sheaffer、Pelikan、Faber-Castell 的品牌故事、官方来源、claims 与时间线补齐，并为剩余品牌补充别名与外部入口；对无现代官网的历史品牌，外部入口使用已登记资料站 profile，不冒充官方来源。`scripts/import-model-gap-sources.ts` 已把 KACO Master大师14K、KACO SKY百锋、Noodler鲶鱼 简易钢笔、SKB派顿 F10/F21、Montblanc 22、万特佳无型号页、Nakaya Housoge、Nakaya Portable/Portable Cigar、Nakaya Portable Writer 黑溜涂、公爵无型号页、Sailor 0501、Sailor 1029、Sailor 1219、Sailor 1911/Profit、Sailor 21K Pro Gear/大鱼雷、Sailor Classic Ko、Sailor King of Pen、Sailor Promenade、Sailor 四季织1224、Sailor 转运石、Sailor 长刀研、LAMY AL-star、LAMY dialog 3、LAMY logo、LAMY studio、PenBBS 268/456/469/494/金尖大明尖、Waterman Expert、Waterman Charleston/Hemisphere、Waterman Carène、Namiki 飞升龙、HongDian 1866/516/517/517s/6013/620/M2/N6/T1/秦/苏木/远航者/黑森林、Delike 元素系列、KACO Edge 刀锋、晨光按动钢笔、Majohn 80mini-E/A1/F9/M2/P140/P141/Q1/V1/V60/丸彩、Picasso 916、Wing Sung 236/3013/322/601/601A/618/698/699/729/840、Parker 51 复刻、Parker IM 丽雅、Parker Duofold/乔特/Sonnet/Vector、Sheaffer 品牌泛称/帝国元首、Platinum Curidas/Izumo/富士旬景 PNB-13000/小流星 PQ200/President/莳绘系列从 0 分空档案推进为研究队列型型号档案；这些页面保留 `needs_source` 和“待核验”边界，对 Sailor/LAMY 官方页面只写入来源可支撑的产品身份、系列位置或机制语境，不把 search index 当成事实来源。Richard's Pens 来源卡仍默认 `pending`，但 Wahl、Chilton、Dunn、Wearever、Graphomatic、Ingersoll、Morrison、WASP 八个品牌绑定的具体 profile 已作为人工核准来源进入品牌故事；Wikidata 品牌引导来源为 `approved`，但只用于基础身份、别名和外部 ID，不直接替代品牌故事审核。官方品牌/型号来源用于后续故事、时间线、规格和型号语境扩写；DareWorks/逗万目前使用官网 HTTP 页面作为官方营销来源；Fountain Pen Network 和 `public-web-research-index` 只用于待核验研究队列，特别是 Admok、Tramol、上海、东吴、书乐、英雄派迪、金星、铃兰、长江、依人、半句、唐月、塞尔、大公、意斯华、欧领、永续、派利、烂笔头这类低资料条目，不冒充官方事实。Paper Mouse、PenHero、Truly American Made、Huashan 1914、The Gentleman Stationer、Narratess、Fountain Pen Chronicles、The Well-Appointed Desk、GoldSupplier、Duke Pens Australia、Alibaba Qiangu、Sketchy Wolf、The Poor Penman、FrankUnderwater、Rupert Arzeian、dapprman、Everyday Scrawl、JUSPIRIT、LOXPO、Comfortable Shoes Studio、Pastor and Pen、Left Hook Pens、Scribble Jot、SBREBrown 这类二级来源只用于待核验或来源等级明确的草稿。Commons 图片仍是 `candidate`，需要逐张复核 license、作者、署名和画面相关性后才能进入正式图库；Warm Pen Atlas bitmap 插画是 `site-original`，用于封面/入口图，不替代机制事实图。按用户反馈，当前生图数量已足够，暂停继续生成新图；剩余缺图位置继续复用现有图片作为占位媒体，后续再逐张细调。

新增品牌故事草稿：

- Montblanc：`story-brand-montblanc-library`，以 1906 年官方源流、Hamburg 书写工具工艺和 Meisterstück 经典线作为馆藏入口。
- Waterman：`story-brand-waterman-library`，以 1883 年 Lewis Edson Waterman、Three Fissure Feed 和可靠供墨叙事作为馆藏入口。
- M&G：`story-brand-mg-library`，以 1997 年 M&G 商标、上海文具制造体系和笔类工程能力作为馆藏入口。
- Parker：`story-brand-parker-library`，以 George Safford Parker、Lucky Curve、Duofold、Vacumatic 和 Parker 51 作为馆藏入口。
- Sheaffer：`story-brand-sheaffer-library`，以 1913 年 lever filler、Fort Madison 和 White Dot 作为馆藏入口。
- Pelikan：`story-brand-pelikan-library`，以 1838 传统日期、1878 商标、1929 第一支 Pelikan fountain pen 和 Pelikano 教育线索作为馆藏入口。
- Faber-Castell：`story-brand-faber-castell-library`，以 1761 年 Stein 起源、绘写材料工业和 Fine Writing 类目作为馆藏入口。
- Platinum：`story-brand-platinum-library`，以日本钢笔制造和 #3776 主线作为馆藏入口。
- Kaweco：`story-brand-kaweco-library`，以 Sport 口袋笔和 Classic Sport 官方产品页作为馆藏入口。
- Diplomat：`story-brand-diplomat-library`，以 1922 年 Hennef 起源和德国精密书写作为馆藏入口。
- Esterbrook：`story-brand-esterbrook-library`，以 1858 年 Camden 起源和 modern Estie 复兴作为馆藏入口。
- Conklin：`story-brand-conklin-library`，以 Roy Conklin 和 Crescent Filler 设计线索作为馆藏入口。
- Leonardo：`story-brand-leonardo-library`，以现代意大利家族工坊和父子传承定位作为馆藏入口。
- TWSBI：`story-brand-twsbi-library`，以 OEM 制造经验、San Wen Tong 命名和透明上墨系统作为馆藏入口。
- Nakaya：`story-brand-nakaya-library`，以 handmade fountain pens 和 Platinum 工厂匠人背景作为馆藏入口。
- Wancher：`story-brand-wancher-library`，以现代日系材质实验和 premium Japanese fountain pen 定位作为馆藏入口。
- Namiki：`story-brand-namiki-library`，以 Pilot/Namiki 官方 Maki-e 豪华钢笔定位作为馆藏入口。
- Opus 88：`story-brand-opus88-library`，以 1975-2017 年 OEM/ODM 背景、台湾钢笔热和 eyedropper fountain pens 作为馆藏入口。
- Eversharp：`story-brand-eversharp-library`，以 Skyline、Henry Dreyfuss 和 1940s 美国工业设计作为馆藏入口。
- Moore：`story-brand-moore-library`，以 Boston、American Fountain Pen Company 和 Moore Pen Company 名称变化作为馆藏入口。
- Noodler's：`story-brand-noodlers-library`，以 Nathan Tardif、Lowell, Massachusetts 和美国制造墨水语境作为馆藏入口。
- Wahl：`story-brand-wahl-library`，以 The Wahl Pen profile 中的 roller clip、lever 和早期设计细节作为馆藏入口。
- Chilton：`story-brand-chilton-library`，以 The Chilton Chiltonian 和 second-generation pneumatic filling system 作为馆藏入口。
- Dunn：`story-brand-dunn-library`，以 Dunn-Pen Company、Charles Dunn 的 high-capacity pump filler 和 Little Red Pump-Handle 作为馆藏入口。
- Wearever：`story-brand-wearever-library`，以 David Kahn、Wearever Zenith 和 injection-molded pen production 作为馆藏入口。
- Graphomatic：`story-brand-graphomatic-library`，以 Graph-O-Matic、Grieshaber Pen Company、Sager Pen Corporation 和战时 ink-making pen 作为馆藏入口。
- Ingersoll：`story-brand-ingersoll-library`，以 Charles H. Ingersoll Dollar Pen Company、Newark 和 dollar concept 作为馆藏入口。
- Morrison：`story-brand-morrison-library`，以 Morrison's Patriot、World War II 资源约束和战时爱国营销作为馆藏入口。
- WASP：`story-brand-wasp-library`，以 W. A. Sheaffer Pen Company、lower-end market 和 Addipoint 作为馆藏入口。
- Monteverde：`story-brand-monteverde-library`，以官方 Founded in 1999、现代 fine writing instruments、色彩和材料体系作为馆藏入口。
- SKB：`story-brand-skb-library`，以 1955 年文明鋼筆、1959 年 830 钢笔、1960s 自制笔尖能力和 2012 年重启台湾制钢笔作为馆藏入口。
- PenBBS：`story-brand-penbbs-library`，以 Chinese Internet forum、Beini Zheng、Etsy/Taobao 渠道、彩色批次和现代平价玩家文化作为馆藏入口。
- Duke：`story-brand-duke-library`，以 Shanghai G. Crown Fountain Pen Co., Ltd. 的制造商档案和 Duke Pens Australia 的分销说明作为谨慎入口。
- KACO：`story-brand-kaco-library`，以 2011 年上海创立、原创设计文具定位和中国大宁钢笔礼盒作为馆藏入口。
- Snowhite：`story-brand-snowhite-library`，以 Qingdao Changlong Stationery 的 May 1988 起点、Snowhite 文具品类和 free-ink-system fountain pen 作为馆藏入口。
- Delike：`story-brand-delike-library`，以 New Moon 3、低价中国钢笔生态、fude/Waverly nib 讨论和外观借鉴争议作为谨慎入口。
- Jinhao：`story-brand-jinhao-library`，以 Shanghai Qiangu Stationery Co., Ltd. 制造商目录、JINHAO/BAOER 品牌线和入门钢笔生态作为谨慎入口。
- Majohn：`story-brand-majohn-library`，以 Moonman/Majohn 命名重叠、A1/A2 按动钢笔评测和现代平价机制实验作为谨慎入口。
- Wing Sung：`story-brand-wingsung-library`，以 New Wing Sung 复兴解释、601/618/698 现代讨论和 601 的 Parker 51 式暗尖语境作为谨慎入口。
- Hero：`story-brand-hero-library`，以 1931 年华孚金笔厂、1966 年英雄金笔厂命名和英雄官方经典产品目录作为馆藏入口。
- HongDian：`story-brand-hongdian-library`，以 Black Forest/Dark Blue Forest、金属日用笔和二级评测边界作为谨慎入口。
- Picasso：`story-brand-picasso-library`，以 2003 年上海帕弗洛文化用品有限公司、毕加索书写工具和艺术礼品语境作为馆藏入口。

重点型号图示已本地和远端同步：

- Sailor Pro Gear：`sailor-pro-gear-family-map`
- Platinum #3776 Century：`platinum-3776-century-archive-map`
- Kaweco Sport：`kaweco-sport-size-map`
- Montblanc 149：`montblanc-149-evidence-boundary`

重点型号官方档案已本地和远端同步：

- Sailor Pro Gear：`story-model-sailor-pro-gear-library`
- Platinum #3776 Century：`story-model-platinum-3776-century-library`
- Kaweco Sport：`story-model-kaweco-sport-library`
- Montblanc Meisterstück 149：`story-model-montblanc-149-library`
- Kaweco AL Sport：`story-model-kaweco-al-sport-library`
- Kaweco LILIPUT：`story-model-kaweco-liliput-library`
- Kaweco STUDENT：`story-model-kaweco-student-library`
- LAMY safari：`story-model-lamy-safari-library`
- TWSBI ECO：`story-model-twsbi-eco-library`
- TWSBI Diamond 580/580AL：`story-model-twsbi-diamond-580-library`
- TWSBI VAC700R：`story-model-twsbi-vac700r-library`
- Wancher Dream Pen：`story-model-wancher-dream-pen-library`
- Namiki Emperor：`story-model-namiki-emperor-library`
- Namiki Yukari Royale：`story-model-namiki-yukari-royale-library`
- Diplomat Aero：`story-model-diplomat-aero-library`
- Esterbrook Estie Oversized：`story-model-esterbrook-estie-oversized-library`
- Leonardo Furore / Momento Magico：`story-model-leonardo-furore-momento-magico-library`
- Montblanc Meisterstück 146 / LeGrand：`story-model-montblanc-146-library`
- Montblanc Meisterstück 144 / Classique：`story-model-montblanc-144-library`
- Montblanc Writers Edition：`story-model-montblanc-writers-edition-library`
- Montblanc Patron of Art 888：`story-model-montblanc-patron-of-art-888-library`
- TWSBI Diamond Mini AL：`story-model-twsbi-diamond-mini-al-library`
- TWSBI GO：`story-model-twsbi-go-library`

重点二级来源型号档案已本地和远端同步，页面会明确保留 `needs_source`：

- Opus 88 Demo/Kolora：`story-model-opus88-demo-kolora-library`
- Schneider BK402：`story-model-schneider-bk402-library`

优先型号研究队列档案已本地和远端同步，页面会明确保留 `needs_source`、`待核验` 和来源边界：

- KACO Master大师14K：`story-model-kaco-master-14k-research`
- KACO SKY百锋：`story-model-kaco-sky-research`
- Noodler鲶鱼 简易钢笔：`story-model-noodlers-simple-research`
- SKB派顿 F10 / F21：`story-model-skb-f10-f21-research`
- Montblanc 22 / 学生龙22：`story-model-montblanc-22-research`
- 万特佳无型号页：`story-model-monteverde-unspecified-research`
- Nakaya Housoge 高级定制：`story-model-nakaya-housoge-research`
- Nakaya Portable / Portable Cigar：`story-model-nakaya-portable-cigar-research`
- Nakaya Portable Writer 黑溜涂：`story-model-nakaya-portable-writer-kuro-research`
- Duke 公爵无型号页：`story-model-duke-unspecified-research`
- Sailor 0501 铱金：`story-model-sailor-0501-research`
- Sailor 1029 银夹鱼雷：`story-model-sailor-1029-research`
- Sailor 1219 标准鱼雷：`story-model-sailor-1219-research`
- Sailor 1911 / Profit 系列：`story-model-sailor-1911-profit-research`
- Sailor 21K Pro Gear / 大鱼雷：`story-model-sailor-21k-pro-gear-torpedo-research`，明确提示可能混淆 Pro Gear 平顶线和 1911/Profit 1521 雪茄线。
- Sailor Classic Ko：`story-model-sailor-classic-ko-research`
- Sailor King of Pen 笔王：`story-model-sailor-king-of-pen-research`
- Sailor Promenade 漫步1031：`story-model-sailor-promenade-1031-research`
- Sailor 四季织1224：`story-model-sailor-shikiori-1224-research`
- Sailor 转运石：`story-model-sailor-lucky-charm-research`
- Sailor 长刀研：`story-model-sailor-naginata-togi-research`，明确提示可能更适合重分类为笔尖/书写特性条目。
- LAMY AL-star 恒星：`story-model-lamy-al-star-research`
- LAMY Dialog 3 焦点3：`story-model-lamy-dialog-3-research`
- LAMY logo：`story-model-lamy-logo-research`
- LAMY Studio 演艺：`story-model-lamy-studio-research`
- PenBBS 268：`story-model-penbbs-268-research`
- PenBBS 456：`story-model-penbbs-456-research`，明确提示需要核验“活塞款”是否应归入活塞、真空或其他上墨机制。
- PenBBS 469：`story-model-penbbs-469-research`
- PenBBS 494：`story-model-penbbs-494-research`
- PenBBS 金尖大明尖：`story-model-penbbs-gold-nib-research`，明确提示可能更适合拆为笔尖/版本或搭载型号。
- Waterman Expert 权威：`story-model-waterman-expert-research`
- Waterman Charleston / Hemisphere：`story-model-waterman-charleston-hemisphere-research`，明确提示当前命名可能混合两个型号/系列。
- Waterman Carène 海韵：`story-model-waterman-carene-research`
- Namiki 飞升龙：`story-model-namiki-flying-dragon-research`，明确提示需要确认是作品名、主题还是具体系列条目。
- HongDian 1866：`story-model-hongdian-1866-research`
- HongDian 516：`story-model-hongdian-516-research`
- HongDian 517 / 517s：`story-model-hongdian-517-517s-research`
- HongDian 6013 文武黑将：`story-model-hongdian-6013-research`
- HongDian 620 鸡尾酒：`story-model-hongdian-620-cocktail-research`
- HongDian M2 迷你：`story-model-hongdian-m2-mini-research`
- HongDian N6 云章：`story-model-hongdian-n6-yunzhang-research`，明确提示“14K 观感”等强口碑只是待归因观点线索。
- HongDian T1 钛合金：`story-model-hongdian-t1-titanium-research`，明确提示材质、重量、软弹尖和价格都要直接来源。
- HongDian 秦：`story-model-hongdian-qin-research`
- HongDian 苏木：`story-model-hongdian-sumu-research`，明确提示 B 站开箱热度、气密性和首笔出水属于待归因体验线索。
- HongDian 远航者：`story-model-hongdian-yuanhangzhe-research`
- HongDian 黑森林 / 黑森林 Pro：`story-model-hongdian-black-forest-pro-research`，明确提示普通黑森林、Pro 与 1861 可能需要拆分。
- Delike 元素系列：`story-model-delike-element-research`
- KACO Edge 刀锋：`story-model-kaco-edge-research`
- 晨光按动钢笔：`story-model-mg-retractable-research`，明确提示 Capless 体验装是待归因比较，不是已核验事实。
- Majohn 80mini-E：`story-model-majohn-80mini-e-research`
- Majohn A1 按动：`story-model-majohn-a1-research`，明确提示 Capless 对比和品控评价需要具体评测来源。
- Majohn F9 法师：`story-model-majohn-f9-research`
- Majohn M2：`story-model-majohn-m2-research`
- Majohn P140：`story-model-majohn-p140-research`
- Majohn P141 钛合金：`story-model-majohn-p141-titanium-research`
- Majohn Q1：`story-model-majohn-q1-research`
- Majohn V1 负压上墨：`story-model-majohn-v1-vacuum-research`，明确提示负压/真空等机制词需要结构来源。
- Majohn V60：`story-model-majohn-v60-research`，明确提示“代餐文学”降级为待归因评论。
- Majohn 丸彩：`story-model-majohn-wancai-research`
- Picasso 916：`story-model-picasso-916-research`
- Wing Sung 236：`story-model-wingsung-236-research`，明确提示老库存、橡胶件和维修风险需要维修/收藏来源。
- Wing Sung 3013：`story-model-wingsung-3013-research`，明确提示负压/真空机制、透明材质和极低价格需要直接来源。
- Wing Sung 322：`story-model-wingsung-322-research`
- Wing Sung 601：`story-model-wingsung-601-research`，明确提示 601/601A、暗尖、上墨结构和 Parker 51 式比较都要分层核验。
- Wing Sung 601A：`story-model-wingsung-601a-research`，明确提示 601A 和 601 的结构边界需要来源。
- Wing Sung 618：`story-model-wingsung-618-research`
- Wing Sung 698：`story-model-wingsung-698-research`，明确提示金尖/钢尖、活塞和价格要按版本核验。
- Wing Sung 699：`story-model-wingsung-699-research`，明确提示真空/负压机制和竞品比较需要归因。
- Wing Sung 729：`story-model-wingsung-729-research`，明确提示可能是品牌/型号身份或误并条目问题。
- Wing Sung 840：`story-model-wingsung-840-research`
- Parker 51 复刻：`story-model-parker-51-reissue-research`，明确提示 modern reissue 和 vintage Parker 51 不能混写。
- Parker IM 丽雅：`story-model-parker-im-research`，明确提示商务日用定位需要产品来源与评测来源分层支撑。
- Parker Duofold / 世纪：`story-model-parker-duofold-modern-research`，明确提示百年名号、现代产品线和中文“大豆腐”昵称不能混写。
- Parker Jotter / 乔特：`story-model-parker-jotter-fp-research`，明确提示钢笔产品需要从圆珠笔家族名号里拆出。
- Parker Sonnet / 卓尔：`story-model-parker-sonnet-research`，明确提示商务外观、笔尖体验和同价位比较需要归因评测。
- Parker Vector / 威雅：`story-model-parker-vector-research`
- Sheaffer 品牌泛称：`story-model-sheaffer-generic-research`，明确提示该 `pen` 条目应优先考虑并入品牌馆或拆分为具体型号。
- Sheaffer 帝国元首：`story-model-sheaffer-imperial-legacy-research`，明确提示需要确认中文名对应 Imperial、Legacy 还是其他型号。
- Platinum Curidas：`story-model-platinum-curidas-research`，明确提示按动机制、密封性和几天不干等体验需要评测来源。
- Platinum Izumo 出云：`story-model-platinum-izumo-research`
- Platinum 富士旬景 PNB-13000：`story-model-platinum-fuji-shunkei-pnb13000-research`，明确提示它与 #3776 的关系和升级定位需要来源。
- Platinum 小流星 PQ200：`story-model-platinum-preppy-pq200-research`，明确提示小流星、PQ200 与 Preppy 的对应关系待核验。
- Platinum President 总统：`story-model-platinum-president-research`
- Platinum 莳绘系列：`story-model-platinum-makie-series-research`，明确提示这是系列/工艺入口，不应当作单支型号写死规格。

`/library/sources` 支持：

- `?type=blog`：按来源类型筛选。
- `?source=richardspens`：按具体来源筛选。
- 来源卡展示 `item_type`、授权用途、审核状态和引用次数。

非品牌/非型号详情页会在侧栏展示 `entity_references` 来源卡片，例如 article、nib、fill_system、concept 页面。品牌馆和型号档案仍使用各自的主内容区来源模块，避免重复展示。

`npm run test:library` 应至少验证：

- `/library` 暴露品牌馆、型号档案、来源索引、媒体授权、图示馆等主要入口。
- `/library/sources`、`/library/media`、`/library/community`、`/library/diagrams`、`/library/coverage`、`/exhibits`、`/timeline` 可渲染关键内容，图示馆可看到引用和重点型号图示。
- `/article/the-baguio-surrender-pens` 可看到正文主图、caption 和代理后的图片 URL，且不含 inline image event handler。
- article 详情页可看到来源卡片、Richard's Pens 和来源授权用途。
- `/new`、`/brand/pilot/edit` 和主要内容写入 API 在默认环境下不可公开编辑。
- 类型不匹配的详情页路径会跳转到 canonical URL。
- `/brand/pilot` 展示外部标识、claims、故事引用、时间线、代表型号和来源卡片。
- `/brand/platinum` 和 `/brand/kaweco` 展示新增品牌故事草稿和来源卡片。
- `/brand/diplomat`、`/brand/esterbrook`、`/brand/conklin`、`/brand/leonardo` 展示新增官方品牌故事草稿和来源卡片。
- `/brand/twsbi`、`/brand/nakaya`、`/brand/wancher`、`/brand/namiki` 展示新增官方品牌故事草稿和来源卡片。
- `/brand/opus88`、`/brand/eversharp`、`/brand/moore`、`/brand/noodlers` 展示新增二级来源品牌故事草稿、关键事实和来源卡片。
- `/brand/wahl`、`/brand/chilton`、`/brand/dunn`、`/brand/wearever` 展示新增 Richard's Pens 品牌故事草稿、关键事实和来源卡片。
- `/brand/graphomatic`、`/brand/ingersoll`、`/brand/morrison`、`/brand/wasp`、`/brand/monteverde` 展示新增品牌故事草稿、关键事实和来源卡片。
- `/brand/skb`、`/brand/penbbs`、`/brand/duke` 展示新增中文/台湾品牌故事草稿、关键事实和来源卡片，其中 Duke 明确保留制造商/分销商资料边界。
- `/brand/kaco`、`/brand/snowhite`、`/brand/delike` 展示新增现代中国文具品牌故事草稿、关键事实和来源卡片，其中 Delike 明确保留二级评测和外观借鉴争议边界。
- `/brand/jinhao`、`/brand/majohn`、`/brand/wingsung` 展示新增中国平价/复兴品牌故事草稿、关键事实和来源卡片，其中 Jinhao 明确保留制造商目录边界，Majohn/Wing Sung 明确保留评测和二级解释边界。
- `/brand/hero`、`/brand/hongdian`、`/brand/picasso` 展示新增传统国货/现代金属日用笔/艺术礼品品牌故事草稿、关键事实和来源卡片；Hero 与 Picasso 使用官网作为主来源，HongDian 明确保留二级评测边界。
- `/library/media` 展示第二批到第十二批 Warm Pen Atlas 站内原创插画标题。
- `/pen/pilot-custom-823` 展示型号档案、claims、故事引用、版本、图示引用和来源卡片；`/pen/sailor-pro-gear` 展示官方型号档案和新增 Pro Gear 系列关系图。
- `/pen/kaweco-al-sport`、`/pen/kaweco-liliput`、`/pen/kaweco-student`、`/pen/凌美-lamy-safari-狩猎者`、`/pen/三文堂-twsbi-eco` 展示新增官方型号档案、故事、规格和来源卡片。
- `/pen/三文堂-twsbi-580-580al`、`/pen/三文堂-twsbi-vac700r`、`/pen/wancher万佳-dream-pen`、`/pen/并木-namiki-emperor`、`/pen/并木-namiki-yukari-royale皇家缘` 展示新增官方型号档案、故事、规格和来源卡片。
- `/pen/diplomat迪波曼-aero太空梭`、`/pen/esterbrook-estie-oversized`、`/pen/leonardo-furore-momento-magico`、`/pen/opus-88-demo-kolora`、`/pen/施耐德-schneider-bk402` 展示新增型号档案、故事、规格和来源卡片；其中 Opus 88 与 Schneider 明确使用二级来源并保留待核验状态。
- `/pen/万宝龙-montblanc-大班146`、`/pen/万宝龙-montblanc-144`、`/pen/万宝龙-montblanc-大文豪系列-writers-edition`、`/pen/万宝龙-montblanc-patron-of-art-888` 展示新增 Montblanc 谨慎型号/collection 档案、故事、规格和来源卡片。
- `/pen/三文堂-twsbi-diamond-mini-al`、`/pen/三文堂-twsbi-go` 展示新增 TWSBI 官方型号档案、故事、规格和来源卡片。
- `/pen/kaco-master大师14k`、`/pen/noodler鲶鱼-简易钢笔`、`/pen/中屋-nakaya-portable-writer-黑溜涂`、`/pen/万宝龙-montblanc-学生龙22`、`/pen/写乐-sailor-0501铱金` 展示新增优先型号研究队列档案、待核验规格和来源边界。
- `/pen/写乐-sailor-1911-profit系列`、`/pen/写乐-sailor-21k-pro-gear-大鱼雷`、`/pen/写乐-sailor-长刀研`、`/pen/凌美-lamy-al-star-恒星`、`/pen/凌美-lamy-dialog-3-焦点3`、`/pen/凌美-lamy-logo` 展示第二批优先型号研究队列档案、官方来源锚点和命名/机制边界。
- `/pen/凌美-lamy-studio-演艺`、`/pen/坛笔-penbbs-456`、`/pen/威迪文-waterman-查尔斯顿-hemisphere`、`/pen/并木-namiki-飞升龙`、`/pen/弘典-hongdian-516` 展示第三批优先型号研究队列档案、来源锚点和待拆分/待核验边界。
- `/pen/弘典-hongdian-n6云章`、`/pen/弘典-hongdian-t1钛合金`、`/pen/弘典-hongdian-黑森林-黑森林pro`、`/pen/得力克-delike-元素系列`、`/pen/文采-kaco-edge刀锋` 展示第四批优先型号研究队列档案、来源入口和观点/材质/命名边界。
- `/pen/晨光-按动钢笔`、`/pen/末匠-majohn-a1-按动`、`/pen/末匠-majohn-v1-负压上墨`、`/pen/末匠-majohn-v60`、`/pen/毕加索-picasso-916` 展示第五批优先型号研究队列档案、来源入口和机制/口碑/命名边界。
- `/pen/永生-wingsung-3013`、`/pen/永生-wingsung-601`、`/pen/永生-wingsung-698`、`/pen/永生-wingsung-729`、`/pen/派克-parker-51复刻`、`/pen/派克-parker-im丽雅` 展示第六批优先型号研究队列档案、来源入口和机制/版本/身份边界。
- `/pen/派克-parker-世纪-duofold`、`/pen/派克-parker-卓尔-sonnet`、`/pen/犀飞利-sheaffer-品牌泛称`、`/pen/白金-platinum-curidas`、`/pen/白金-platinum-小流星pq200`、`/pen/白金-platinum-莳绘系列` 展示第七批优先型号研究队列档案、来源入口和历史/命名/重分类/系列边界。
- `/pen/永生-wingsung-601a` 的关系图谱横向拖拽后不会被推到右侧裁切区。
- `/pen/永生-wingsung-601a` 的关联词条不会重复显示内外层标题，也不会重复显示永生品牌链接。
- 上述页面没有 console error 或 page error。

## 图像确认点

已生成两个 GPT image 小样，并已得到用户确认：

- 机制实验室风格样张：`docs/content/image-samples/warm-pen-atlas-vacuum-sample.png`。该图只确认视觉方向，结构更接近通用剖面示意，不能作为真空上墨事实图直接上线。
- 品牌展厅封面风格样张：`docs/content/image-samples/warm-pen-atlas-library-cover-sample.png`。该图可用于确认 `/library` 或品牌馆封面方向。

首批批量图片已生成、压缩并入库：

- `public/images/library/warm-pen-atlas/library-hero.jpg`
- `public/images/library/warm-pen-atlas/brand-museum-cover.jpg`
- `public/images/library/warm-pen-atlas/mechanism-lab-cover.jpg`
- `public/images/library/warm-pen-atlas/vacuum-filler-model-cover.jpg`
- `public/images/library/warm-pen-atlas/school-design-model-cover.jpg`
- `public/images/library/warm-pen-atlas/piston-demonstrator-model-cover.jpg`
- `public/images/library/warm-pen-atlas/pocket-pens-exhibit-cover.jpg`

入库命令：`npm run import:warm-pen-atlas-media -- --write`。

第二批批量图片已生成、压缩并入库：

- `public/images/library/warm-pen-atlas/opus88-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/eversharp-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/moore-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/noodlers-ink-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/twsbi-diamond-mini-archive-cover.jpg`
- `public/images/library/warm-pen-atlas/twsbi-go-spring-piston-cover.jpg`
- `public/images/library/warm-pen-atlas/namiki-makie-archive-cover.jpg`
- `public/images/library/warm-pen-atlas/literary-editions-archive-cover.jpg`

第二批记录：`docs/content/warm-pen-atlas-batch-2026-06-25.md`。
第二批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-contact-sheet.jpg`。

第三批批量图片已生成、压缩并入库；本批继续保持“每个品牌 1 张封面图”，不扩展为同品牌多图：

- `public/images/library/warm-pen-atlas/wahl-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/chilton-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/dunn-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/wearever-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/graphomatic-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/ingersoll-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/morrison-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/wasp-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/monteverde-brand-cover.jpg`

第三批记录：`docs/content/warm-pen-atlas-batch-2026-06-25-vintage-brands.md`。
第三批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-vintage-brand-contact-sheet.jpg`。

第四批批量图片已生成、压缩并入库；本批继续保持“每个品牌 1 张封面图”，只在同一风格下做轻微构图轮换：

- `public/images/library/warm-pen-atlas/skb-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/penbbs-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/duke-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/kaco-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/snowhite-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/delike-brand-cover.jpg`

第四批记录：`docs/content/warm-pen-atlas-batch-2026-06-25-modern-cn.md`。
第四批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-modern-cn-contact-sheet.jpg`。

第五批批量图片已生成、压缩并入库；本批继续保持“每个品牌 1 张封面图”，并在老国货、现代金属日用笔、艺术礼品、入门钢笔、机制实验和复兴品牌之间做构图区分：

- `public/images/library/warm-pen-atlas/hero-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/hongdian-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/picasso-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/jinhao-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/majohn-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/wingsung-brand-cover.jpg`

第五批记录：`docs/content/warm-pen-atlas-batch-2026-06-25-chinese-legacy.md`。
第五批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-chinese-legacy-contact-sheet.jpg`。

第六批批量图片已生成、压缩并入库；本批继续保持“每个品牌 1 张封面图”，覆盖已有故事和来源支撑但还缺媒体的国际历史与现代工坊品牌：

- `public/images/library/warm-pen-atlas/conklin-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/diplomat-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/esterbrook-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/kaweco-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/leonardo-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/wancher-brand-cover.jpg`

第六批记录：`docs/content/warm-pen-atlas-batch-2026-06-25-international-makers.md`。
第六批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-international-makers-contact-sheet.jpg`。

第七批批量图片已生成、压缩并入库；本批继续保持“每个品牌 1 张封面图”，覆盖已有故事和来源支撑但还缺媒体的核心设计/日系工艺/现代机制品牌：

- `public/images/library/warm-pen-atlas/twsbi-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/nakaya-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/sailor-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/lamy-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/aurora-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/namiki-brand-cover.jpg`

第七批记录：`docs/content/warm-pen-atlas-batch-2026-06-25-core-design-brands.md`。
第七批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-core-design-brands-contact-sheet.jpg`。

第八批批量图片已生成、压缩并入库；本批继续保持“每个品牌 1 张封面图”，覆盖已有来源/事实基础但还缺媒体的经典参考品牌，其中 Montblanc 先作为谨慎奢华档案封面，不替代后续品牌故事扩写：

- `public/images/library/warm-pen-atlas/schneider-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/platinum-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/pilot-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/visconti-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/cross-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/montblanc-brand-cover.jpg`

第八批记录：`docs/content/warm-pen-atlas-batch-2026-06-25-classic-reference-brands.md`。
第八批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-classic-reference-brands-contact-sheet.jpg`。

第九批批量图片已生成、压缩并入库；本批继续保持“每个品牌 1 张封面图”，并刻意拉开镜头：窗边档案、现代文具工作台、旅行档案箱、维修台、墨水/活塞材料样本、绘图 atelier：

- `public/images/library/warm-pen-atlas/waterman-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/mg-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/parker-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/sheaffer-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/pelikan-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/faber-castell-brand-cover.jpg`

第九批记录：`docs/content/warm-pen-atlas-batch-2026-06-25-reference-heritage-brands.md`。
第九批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-reference-heritage-brands-contact-sheet.jpg`。

第十批批量图片已生成、压缩并入库；本批覆盖仍为 `0 story / 0 source / 0 claim / 0 timeline` 的 research-gap 品牌，只做资料缺口封面，不暗示具体历史结论：

- `public/images/library/warm-pen-atlas/admok-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/tramol-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/shanghai-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/dongwu-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/shule-brand-cover.jpg`

第十批记录：`docs/content/warm-pen-atlas-batch-2026-06-25-research-gap-brands-a.md`。
第十批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-research-gap-brands-a-contact-sheet.jpg`。

第十一批批量图片已生成、压缩并入库；本批继续覆盖 research-gap 品牌，YiRen 首版因微小伪标签弃用，最终使用返工后的空白卡片版本：

- `public/images/library/warm-pen-atlas/yiren-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/banju-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/tangyue-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/saier-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/dagong-brand-cover.jpg`

第十一批记录：`docs/content/warm-pen-atlas-batch-2026-06-25-research-gap-brands-b.md`。
第十一批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-research-gap-brands-b-contact-sheet.jpg`。

第十二批批量图片已生成、压缩并入库；本批继续覆盖 research-gap 品牌，均只作为资料缺口视觉入口：

- `public/images/library/warm-pen-atlas/yisihua-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/campus-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/yongxu-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/paili-brand-cover.jpg`
- `public/images/library/warm-pen-atlas/lanbitou-brand-cover.jpg`

第十二批记录：`docs/content/warm-pen-atlas-batch-2026-06-25-research-gap-brands-c.md`。
第十二批预览拼图：`docs/content/image-samples/warm-pen-atlas-batch-2026-06-25-research-gap-brands-c-contact-sheet.jpg`。

当前策略：

1. 图中不放可读中文标签，避免 AI 乱码；网页文字承载说明。
2. 机制事实图仍以 SVG 为主，GPT image 插画只做封面/入口氛围图。
3. 所有 Warm Pen Atlas bitmap 插画默认 `site-original`，`review_status=approved`，`usage_status=gallery`。
4. `/library` 首页已使用 `library-hero.jpg` 作为 hero 背景。
5. 当前品牌媒体覆盖为 `69/69`；按用户反馈，暂停继续生成新图，最后 5 个缺专属图品牌已复用现有品牌馆封面作为占位媒体。
6. 如果未来恢复同一品牌多图制作，先重新规划多构图 prompt，不沿用单一书桌构图批量复制。

## 推荐续跑顺序

1. 优先补内容证据层：claims、citations、source_items、entity_references。
2. 再扩写品牌/型号故事：只基于已登记来源和已审核 claims。
3. 然后补页面级验证：继续扩展 `tests/e2e/library.spec.ts`，优先覆盖新增品牌馆、型号档案和展览页。
4. Warm Pen Atlas 前十二批图像已完成；后续暂停新图生成，先集中处理来源、故事、规格、时间线、引用和页面验证等非图片内容。
