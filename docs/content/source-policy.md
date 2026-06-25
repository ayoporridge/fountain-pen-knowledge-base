# 钢笔图书馆来源政策

本文定义内容扩充时的来源、授权和审核边界。目标是把公开资料沉淀为可追溯的馆藏，而不是搬运网页全文。

## 核心原则

1. 所有事实先进入 `claims`，通过来源和审核状态追踪，再进入正式故事。
2. 未审核内容只能作为 `draft` 或 `needs_sources`，不能作为 `published` 展示。
3. 公开可访问不等于可复制。论坛、Reddit、博客、品牌官网默认只做摘要、引用索引和外链。
4. 图片、扫描件、品牌素材必须逐项记录 license、author、attribution、source_url。
5. Reddit 和论坛内容只做元数据与聚合摘要，默认不保存评论正文。
6. AI 只能基于已登记来源和已审核 claims 生成草稿；草稿必须保留未确认事实清单。

## 来源类型

| type | 例子 | 默认用途 |
| --- | --- | --- |
| `official` | 品牌官网、新闻稿、用户手册 | 官方事实与产品信息，图片需单独授权 |
| `wikimedia` | Wikidata、Wikipedia、Wikimedia Commons | 结构化事实、背景链接、图片候选 |
| `book` | Internet Archive、Open Library、Google Books | 书目、目录、公开扫描件元数据 |
| `patent` | Google Patents、USPTO、Espacenet | 技术与结构事实，适合重绘教育图示 |
| `blog` | PenHero、Richard's Pens、The Pen Addict | 引用索引、摘要、claim candidates |
| `forum` | FPN、无忌玩主、FPGeeks | 经验索引、聚合口碑、问题信号 |
| `reddit` | r/fountainpens | 趋势与社区口碑聚合 |
| `retailer` | JetPens、Goulet、Cult Pens | 参数、规格、购买语境，避免价格抓取公开展示 |
| `user_submission` | 用户投稿图片/故事 | 需明确授权协议 |

## Allowed Use

| allowed_use | 含义 | 可用于 |
| --- | --- | --- |
| `store_full` | 可本地保存全文或完整媒体 | 自有原创、用户授权、CC0/公有领域且确认 |
| `store_excerpt` | 可保存短摘录 | 合规短引用、书目片段、审核证据 |
| `summary_only` | 只存原创摘要和来源链接 | Wikipedia、博客、评测、品牌官网文本 |
| `metadata_only` | 只存元数据和聚合标签 | Reddit、论坛、Commons 候选图片、书目 |
| `link_only` | 只展示外链 | 不确定许可的图片/视频/社区内容 |
| `forbidden` | 禁止采集或展示 | 付费书全文、未授权图片、禁止抓取内容 |

## 推荐来源策略

### Wikidata

用途：品牌/人物/公司基础事实、别名、外部 ID、Wikipedia sitelinks。

策略：Wikidata 数据可作为结构化事实引导来源，写入 `claims` 和 `external_ids`。脚本必须记录 `QID` 和 `source_id=wikidata`，并且可重复运行。

实现参考：Wikidata 官方 Data access 文档列出 API、Linked Data、Query Service 等访问方式；本项目首版用 `Special:EntityData/{QID}.json` 与 search API。

### Wikipedia

用途：背景资料核对、sitelink、进一步来源入口。

策略：不复制正文。可以抽取事实、写原创中文摘要，并记录 Wikipedia 页面 URL 与许可。接近原文的改写需要 CC BY-SA 署名与相同方式共享处理。

### Wikimedia Commons

用途：图片候选、历史图片、公开图示、专利图候选。

策略：只导入 license 明确的元数据，不自动设为主图。前台展示前必须 `review_status=approved`，并显示署名与 license。

执行入口：

- `npm run import:commons-media -- --limit=2`：dry run，查看每个 profile 会导入哪些 Commons 文件。
- `npm run import:commons-media -- --write --limit=2`：写入 `source_items` 与 `media_assets`，默认仍为 `usage_status=candidate`。
- `npm run import:commons-media -- --query="LAMY 2000 fountain pen" --entity="pen/凌美-lamy-lamy-2000" --write`：导入单个查询。

边界：Commons 单文件的作者、license、署名要求必须逐项复核；自动导入只代表“候选可审查”，不代表“可直接作为页面主图”。

### Reddit

用途：社区口碑趋势、常见问题、争议点、玩家搭配。

策略：必须使用官方 API 与唯一 User-Agent；只保存 post id、title、permalink、score、comment_count、flair、created_utc、matched_entities、topic tags、generated_summary。默认不保存评论正文，不用于训练模型。

### 专业博客与论坛

用途：品牌故事、型号历史、维修经验、版本差异。

策略：保存 `source_items` 索引、原创摘要和 claim candidates。不要复制全文，不复制图片。高价值 claim 进入 `pending`，人工审核后才能用于 `published` 内容。

Richard's Pens 已有本地译文实体时，只把已有 `source_url`/`source_file`
整理成来源索引和实体引用，不重新抓取原站正文：

- `npm run import:richardspens-references`：dry run，查看会登记哪些参考资料。
- `npm run import:richardspens-references -- --write`：写入 `source_items` 与 `entity_references`。

边界：该脚本只沉淀 URL、标题、来源类型、短摘要和本地实体关联；不复制原站图片，不镜像原站全文。

## 内容生产流程

1. `source_registry`：登记来源政策、授权、抓取方式和可信度。
2. `source_items`：登记具体网页、书籍、专利、帖子或目录。
3. `claims`：抽取事实断言，保留来源和审核状态。
4. `stories`：基于已审核 claims 生成故事草稿。
5. `citations`：把故事段落、图示、时间线事件和来源绑定。
6. `review`：人工检查事实、版权、图示和署名。
7. `publish`：只有 reviewed/published 内容进入正式页面。

## 草稿状态

| status | 含义 |
| --- | --- |
| `draft` | 自动或人工草稿，未审核 |
| `needs_sources` | 内容有缺口，需补来源 |
| `needs_media` | 缺图片或图示 |
| `reviewed` | 已人工审核，可用于页面样例 |
| `published` | 可前台正式展示 |
| `deprecated` | 过期或需重写 |

## 图示政策

优先使用站内原创 SVG。图示可以基于公开事实、专利结构、手册描述和实物观察重新绘制，但不得描摹或复制受版权保护的产品图、博客照片、论坛图片。

每张图示必须记录：

- 图示类型：结构图 / 机制图 / 时间线 / 系列树 / 尺寸对比 / 关系图
- 关联实体
- 数据来源或参考来源
- 绘制说明
- 许可：默认 `site-original`
- 审核状态

## 本政策引用的主要官方资料

- Wikidata Data access: https://www.wikidata.org/wiki/Wikidata:Data_access
- Wikibase JSON / Special:EntityData: https://doc.wikimedia.org/Wikibase/master/php/docs_topics_json.html
- Commons API: https://commons.wikimedia.org/wiki/Commons:API
- MediaWiki Imageinfo API: https://www.mediawiki.org/wiki/API:Imageinfo
- Reddit Data API Wiki: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki
- Reddit Data API Terms: https://redditinc.com/policies/data-api-terms
