# Wancher World Tree / Sekai 木材型号深化研究（Phase 423）

检索日期：2026-08-03
范围：只深化已存在的五个钢笔实体，不新建同名型号，不触碰真实 `data/fpkg.db`。

## 研究问题

本批次的目标不是把 World Tree 写成一篇系列宣传，而是把五个已有 SKU 的身份、木材边界、夹件/尖/供墨配置、维护和当前商业状态分开写清：

1. `Wancher World Tree – Ebony`（乌木）；
2. `Wancher Sekai Ai`（Olive Wood + Aizome + Dove Zogan 选项）；
3. `Wancher World Tree – Teak Wood`（柚木）；
4. `Wancher World Tree – Verawood`（绿檀/Verawood）；
5. `Wancher World Tree – Sandalwood`（檀木，检索时售罄）。

五条路由都已有实体、品牌关系、基础内容包和原创 SVG。本批次只在现有 pack 上增加来源化正文与来源组，不改变 slug、canonical name、entity id 或图片路径。

## 来源与证据等级

主源使用 Wancher 官方全球商品页和集合页；集合页用于确认导航和相邻 SKU 并列关系，exact product page 用于确认单个木种、夹件、尖材、feed、供墨和包装。补充来源仍标为官方集合页，不把集合页的系列数字伪装成每支笔的实测值。

- Wancher World Tree collection：<https://www.wancherpen.com/collections/world-tree>
- Wancher Sekai collection：<https://jp.wancherpen.com/collections/sekai>
- Wancher Dream Pen collection（材料/工艺导航边界）：<https://www.wancherpen.com/collections/dream-pen>
- Wancher Japan Dream Pen collection（日本站导航边界）：<https://jp.wancherpen.com/collections/dream-pen>
- Ebony exact page：<https://www.wancherpen.com/products/world-tree-ebony>
- Sekai Ai exact page：<https://www.wancherpen.com/products/sekai-ai>
- Teak exact page：<https://www.wancherpen.com/products/world-tree-teak-wood>
- Verawood exact page：<https://www.wancherpen.com/products/world-tree-verawood>
- Sandalwood exact page：<https://www.wancherpen.com/products/world-tree-sandalwood>
- Appelboom 的 World Tree Teak 零售交叉页：<https://appelboom.com/wancher-sekai-world-tree-teak-wood-fountain-pen/>

来源包保留每条来源的 URL、检索日、`summary_only` 使用边界和独立组。Appelboom 只做专业零售语境交叉，不承担五个 SKU 的主规格；商品图和第三方照片也不写入本批次的主媒体。

## 关键事实与身份边界

### 系列参考，不是统一实测

World Tree 集合页给出家族参考：直径 13.2 mm、闭帽 140.1 mm、插帽 164.4 mm；含夹约 27 g、无夹约 21 g。Sandalwood 页面另说明 World Tree（Sekai）型号共享笔身尺寸。正文将这些数字标成系列参考，要求具体订单或实物称重说明是否含夹、套帽、converter、墨水和后配件，不把约数回填成五个型号的制造公差。

### 木种不可互换

Ebony、Teak、Verawood、Sandalwood 是四个不同材料 SKU；Sekai Ai 以 Olive Wood 为基础并加入 Aizome 蓝染与 Dove Zogan/夹件选项。天然色差、纹理、气味和光泽只能作为线索，不能替代 exact product title、订单和实物照片，也不能把相邻木种的颜色或密度复制到当前条目。

### 配置必须按订单核对

World Tree 商品页的通用配置语境包含 No Clip、925 Matte Silver Clip、925 Silver Clip；木夹件可拆，影响重量和携带方式。多数页面列出 #6 JoWo stainless、Wancher 18K、KEIRYU/Kodachi 以及 plastic/black ebonite/red ebonite feed；Sandalwood 基础正文只把页面明确列出的 JoWo、18K 和三种 feed 作为默认范围，图库中的周年 Keiryu Dragon Nib 不自动写入基础 SKU。Sekai Ai 额外记录 Dove Zogan 与蓝染尖图片不能代替订单装配证据。

五个页面均记录 European International Standard cartridge / converter 的 C/C 语境，正文提供清洗、阴干、避免酒精和研磨剂、木面裂线/起皮/夹件松动时停止强拆的维护建议。维护部分是使用边界，不把未有来源的耐久年限、木材等级、染色次数或制造地细节写成事实。

### 商业状态要带日期

Sandalwood 在检索日显示 Sold out；这是商业快照，不等于型号不存在、从未销售或未来不会补货。价格、库存、商品图和特殊尖选项都按读取日期记录；历史售罄与后续补货并列保存，不覆盖实体身份。

## 内容与媒体决策

五篇正文采用自然中文说明，而不是机器翻译字段堆叠。每页包含：身份与系列定位、木材/染色边界、夹件与尖材、C/C 供墨、系列尺寸的正确用法、维护、兄弟 SKU 对照、选购与来源证据卡。页面继续使用现有原创 factual SVG，并明确标注非产品照片、非 Logo、非比例图、非颜色校样；不下载或复制官方商品图。

## 实体与关系变更

实体 id、slug、canonical name 和品牌 id 全部保持：

| 实体 | id | slug |
| --- | --- | --- |
| Ebony | `phase331-pen-wancher-world-tree-ebony` | `wancher-world-tree-ebony` |
| Sekai Ai | `phase332-pen-wancher-sekai-ai` | `wancher-sekai-ai` |
| Teak | `phase333-pen-wancher-world-tree-teak` | `wancher-world-tree-teak` |
| Verawood | `phase334-pen-wancher-world-tree-verawood` | `wancher-world-tree-verawood` |
| Sandalwood | `phase335-pen-wancher-world-tree-sandalwood` | `wancher-world-tree-sandalwood` |

五个型号都只保留一个 `made_by` 指向 Wancher（`eOfD77nOeENN`），并确保品牌到型号的 `reverse` 导航各一条。旧错误关系由现有拓扑步骤清理；没有新建重复实体。

## 验证计划

在 owned checkpoint copy 上执行：

1. 迁移到当前 schema，确认数据库主文件位于 owned root 且不是真实资料库、硬链接或远程 URL；
2. 首次应用六个 pack（品牌 + 五个型号），走 `applyCuratedContentPacks`、`recordEntityContentReview` 和 `publishEntity` 的既有审核—发布路径；
3. 回读正文长度、10 个独立来源组、至少 3 个 variant、model spec evidence、primary SVG、关系、发布 revision、四类当前 hash 审核和 publishable readiness；
4. 重放同一批次，五个型号必须全部 `noop`；
5. 对真实 `data/fpkg.db` 做前后 snapshot/hash 校验，结果必须不变；
6. 运行定向 Vitest、Biome、TypeScript 与 `git diff --check`，TypeScript 只允许既有基线诊断。

## 未解决但刻意保留的边界

- 官方页面的当前价格、库存、图片和可选尖会变化，不能由本批次承诺长期不变；
- 天然木材的具体密度、颜色代码、染色次数和每支笔公差未有足够公开主源，正文明确写成未知或系列参考；
- 图片仍是原创示意图，真人遍历和生产线上图片逐条复查属于全量 goal 的后续阶段；
- 这批次只深化五个已存在 Wancher SKU，不能代表全部品牌、型号、品牌页覆盖或最终生产迁移已完成。
