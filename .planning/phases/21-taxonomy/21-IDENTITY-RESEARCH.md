---
phase: 21-taxonomy
document: identity-research
date: 2026-07-18
status: complete
scope: read-only
---

# Phase 21：钢笔品牌与型号身份核验

## 研究目的

本文件为 Phase 21 的外部身份与 taxonomy 决策输入，只回答 6 个会直接影响品牌、型号、别名、版本和变体归属的问题：

1. Pilot Metropolitan、MR、Cocoon 是否是同一条目，以及地区与版本边界；
2. Pilot Elabo、Falcon 是否是同一型号；
3. Moonman、Majohn 的改名关系，以及 A1 的 canonical 归属；
4. Wing Sung、JunLai 与 630 的制造、授权和命名关系；
5. Sailor Professional Gear Slim 与普通色、四季织、限量色的层级；
6. Asvine P36 的 canonical 名称和可接受别名。

研究范围是 **read-only**：核验外部资料并提出迁移建议，不在本文件中执行数据库、slug、页面或关系迁移。

## 证据等级

| 等级 | 定义 | 使用边界 |
|---|---|---|
| **T1** | 品牌/厂商官网、官方目录、官方 brochure；或可直接归因给厂商负责人的一手声明、原始产品文档 | 可直接支撑 canonical、型号同一性、官方层级和授权关系；若一手材料仅有第三方镜像，会明确标注镜像风险 |
| **T2** | 专业钢笔媒体、展会、专业零售商、长期维护的独立研究或对比文章 | 用来补足地区差异、历史包装、实际销售命名和配置差异，不单独覆盖与 T1 冲突的事实 |
| **T3** | 社区帖子、未验证所有权的品牌域名、商城镜像、一般零售页 | 只用于 alias、旧标识、市场用法和 provenance；不能单独决定 canonical |

> 原则：名称相同不自动等于同一型号；同一底层产品在不同地区使用不同名称，也不应重复建成多个型号。规格字段若随地区或年份变化，必须带市场/时间范围，不能把某一市场配置写成全局事实。

## 决策总览

| 议题 | 决策 | 实体层级 | 置信度 |
|---|---|---|---|
| Pilot MR / Metropolitan / Cocoon / 88G | 同一基础产品家族的地区名与地区 SKU；**Cocoon 绝不等于“贵妃”** | 一个 model family；地区名为 alias，MR1/MR2/MR3 等为地区/SKU variant | 高 |
| Pilot Elabo / Falcon | 同一型号在日本与海外的名称 | 一个 model family；树脂、金属、颜色和 nib 为 variant | 高 |
| Moonman / Majohn + A1 | Majohn 是 Moonman 后续英文商标；A1 是同一型号 | 一个 canonical brand + 历史 alias；A1 一个 model | 中高 |
| Wing Sung / JunLai 630 | 上海格林生产的同一 630；JunLai/君来是自有标，Wing Sung/永生是 6 系授权标 | 一个 model；品牌以 JunLai 为主，Wing Sung 为带时限的 licensed marketing relation | **中** |
| Sailor Professional Gear Slim | Professional Gear 家族下的独立 Slim 型号；普通色、四季织、主题色和限量色是 edition/variant | family → model → edition group → color variant | 高 |
| Asvine P36 | 官方市场名稳定为 Asvine P36，无第二个独立型号名 | 一个 model；Titanium、nib unit、nib width 为描述或 option/variant | 中高 |

---

## 1. Pilot MR / Metropolitan / Cocoon / 88G

### Canonical 与别名

| 字段 | 建议值 |
|---|---|
| canonical key | `pilot-mr-metropolitan-cocoon` |
| canonical 中文名 | `百乐 MR／Metropolitan（日本名 Cocoon，中国名 88G）` |
| canonical English | `Pilot MR / Metropolitan Fountain Pen (Cocoon in Japan)` |
| 合法 aliases | `Pilot MR`、`Pilot Metropolitan`、`Metropolitan`、`Pilot Cocoon`、`Cocoon`、`Pilot 88G`、`百乐 88G` |
| 地区/SKU variants | `88G MR1`、`88G MR2`、`88G MR3`，以及地区限定饰面、颜色和随市场变化的上墨配置 |
| 明确排除 | `贵妃`、`卡利贵妃`、`FP-60R`、`Prera` 均不得作为 Cocoon alias |

### Family / model / variant 判定

- MR、Metropolitan、Cocoon 与中国市场 88G 应归入同一个 **model family**。
- `Metropolitan` 是 MR 系列在部分海外市场形成的销售名称；日本目录使用 `Cocoon`；中国官网使用 `88G`，并继续细分 MR1、MR3 等 SKU。
- 地区名称是 alias/market name，不应生成彼此独立、内容重复的型号页面。
- MR1/MR2/MR3、颜色、饰面和地区上墨差异是 variant 或 market-specific configuration，不是独立基础型号。
- 若将来要做历史版本，应在 family 下建 version/timeline，而不是用新 brand 或新 model 规避冲突。

### 最关键纠错：Cocoon ≠ 贵妃

现有数据中的 `百乐 Pilot 贵妃 Cocoon` / `百乐 贵妃 Cocoon` 是错误合并。Pilot 中国官网把“卡利贵妃”用于独立产品 `FP-60R`，并把 88G 系列作为另一组产品展示。无论中文市场俗称如何，当前证据都不允许把“贵妃”作为 Cocoon 的 canonical 名或 alias。

### 证据

| 等级 | 来源 | 支撑事实 |
|---|---|---|
| T1 | Pilot Australia — [https://pilotpen.com.au/ranges/mr](https://pilotpen.com.au/ranges/mr) | 官方明确写明 MR range 也称 Metropolitan series；同时可作为当前澳洲市场上墨规格的证据 |
| T1 | Pilot Japan Cocoon `FCO-3SR` — [https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000151&volumeName=00004](https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000151&volumeName=00004) | 日本官方目录的 Cocoon 产品名和型号代码 |
| T1 | Pilot China 88G MR1 — [https://www.pilotpen.com.cn/p/104.html](https://www.pilotpen.com.cn/p/104.html) | 中国官方市场命名为 88G，并存在 MR1 SKU |
| T1 | Pilot China 88G MR3 — [https://www.pilotpen.com.cn/p/106.html](https://www.pilotpen.com.cn/p/106.html) | 中国官方市场存在 MR3 SKU，支持其为地区/SKU variant |
| T1 | Pilot USA Fine Writing Brochure — [https://pilotpen.us/Downloads/Fine_Writing_Brochure.pdf](https://pilotpen.us/Downloads/Fine_Writing_Brochure.pdf) | 美国官方产品资料中的 Metropolitan/MR 市场命名和产品定位 |
| T1 | Pilot China `FP-60R` 卡利贵妃 — [https://www.pilotpen.com.cn/p/100.html](https://www.pilotpen.com.cn/p/100.html) | “卡利贵妃”属于另一款官方产品，直接否定“贵妃 = Cocoon” |
| T1 | Pilot China 钢笔目录页 — [https://www.pilotpen.com.cn/product/6.html?page=4](https://www.pilotpen.com.cn/product/6.html?page=4) | 官方目录中 88G 与卡利贵妃分别出现，支持独立身份 |
| T2 | Pióromaniak MR / Metropolitan / Cocoon 对比 — [https://www.pioromaniak.pl/pilot-mr-metropolitan-czy-cocoon-roznice-porowananie/](https://www.pioromaniak.pl/pilot-mr-metropolitan-czy-cocoon-roznice-porowananie/) | 补足欧洲 MR 与日本 Cocoon 在上墨系统等方面的地区差异 |

### 冲突与未知

- 当前澳洲官方页将其描述为使用 Pilot proprietary cartridge/converter；欧洲旧版 MR 的独立对比资料则记录 standard international cartridge。两者并不必然互相否定，更可能是 **市场与年份差异**。
- `Metropolitan` 在不同市场可能既是系列营销名，也被用户当作具体型号名。数据层应保留 market-name 语义，不要强迫所有页面只显示 `MR`。
- 本轮不确认每个颜色、饰面和包装年份的完整 SKU 清单；这些应在后续产品级采集里按官方地区目录补全。

### 明确迁移建议

1. 建立 canonical family `pilot-mr-metropolitan-cocoon`，把 MR、Metropolitan、Cocoon、88G 搜索名全部指向该实体。
2. 将 88G MR1/MR2/MR3 设为 `regional_variant_of` 或 `sku_variant_of`，保留中国市场标签。
3. 删除 `贵妃` 与 `百乐 贵妃 Cocoon` 的 alias 关系；把 `FP-60R 卡利贵妃` 留作独立产品。
4. 将旧 slug `百乐-pilot-贵妃-cocoon` 301/永久重定向到新 canonical route，但重定向映射本身不能继续显示“贵妃 = Cocoon”。
5. 上墨系统、包装内容和可选 nib 等字段增加 `market` 与 `valid_from/valid_to`，不要写成全局 immutable spec。

---

## 2. Pilot Elabo / Falcon

### Canonical 与别名

| 字段 | 建议值 |
|---|---|
| canonical key | `pilot-elabo-falcon` |
| canonical 中文名 | `百乐 Elabo（海外名 Falcon）万年笔` |
| canonical English | `Pilot Falcon Fountain Pen (Elabo in Japan)` |
| 合法 aliases | `Pilot Elabo`、`Elabo`、`Pilot Falcon`、`Falcon`、`百乐 Falcon` |
| 明确排除 | Pilot Custom 系列中配置 `FA` / Falcon nib 的其他钢笔 |

### Family / model / variant 判定

- Pilot 官方日文内容直接说明 Elabo 在海外以 Falcon 名称销售，因此两者是同一型号家族的地区命名。
- 树脂杆 `FE-18SR` 与金属杆 `FE-25SR` 是同一 family 下的 material/body variant；颜色与 nib 规格继续作为子 variant。
- 历史代际、材料变化和停产/复产节点应作为 version/timeline，不应拆成两个互不关联的 Elabo 与 Falcon 型号。
- Pilot Custom 742/743 等型号即使装有 FA/Falcon nib，也只是 nib 技术关联，不能并入 Falcon 钢笔型号。

### 证据

| 等级 | 来源 | 支撑事实 |
|---|---|---|
| T1 | Pilot Japan 知识文章 — [https://www.pilot.co.jp/media/knowledge/022.html](https://www.pilot.co.jp/media/knowledge/022.html) | 官方明确说明 Elabo 的海外名称为 Falcon |
| T1 | Pilot 2026 官方历史文章 — [https://www.pilot.co.jp/media/story/018.html](https://www.pilot.co.jp/media/story/018.html) | Elabo/Falcon 的历史定位与时间线，可支持 version/timeline |
| T1 | Pilot Japan 金属杆 `FE-25SR` — [https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000192&volumeName=00004](https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000192&volumeName=00004) | 官方型号代码和金属杆产品身份 |
| T1 | Pilot Japan 树脂杆 `FE-18SR` — [https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000183&volumeName=00004](https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000183&volumeName=00004) | 官方型号代码和树脂杆产品身份 |
| T1 | Pilot USA Fine Writing Brochure — [https://pilotpen.us/Downloads/Fine_Writing_Brochure.pdf](https://pilotpen.us/Downloads/Fine_Writing_Brochure.pdf) | 美国官方资料同时展示 resin/metal Falcon，支持其为同一系列的材质版本 |
| T1 | Pilot Australia nib mechanics — [https://pilotpen.com.au/blog/how-do-fountain-pens-work-understanding-the-mechanics](https://pilotpen.com.au/blog/how-do-fountain-pens-work-understanding-the-mechanics) | 用于区分 Falcon 成品型号与其他钢笔上的 FA/Falcon nib 概念 |

### 冲突与未知

- `Falcon` 同时容易被用来泛指某类软弹 nib；站内需要区分 `model alias` 与 `nib/type relation`。
- 本轮没有锁定全部历史代际和各地区在售颜色；这些不影响 Elabo/Falcon 的同一性结论。

### 明确迁移建议

1. 合并所有 Elabo 与 Falcon 成品钢笔记录到 `pilot-elabo-falcon`。
2. 以 `FE-18SR`、`FE-25SR` 建 material/body variants；颜色、nib width 和软硬等级继续下挂。
3. 保留 `Elabo` 与 `Falcon` 两个可搜索展示名，并给各自标注市场范围，不做两个重复详情页。
4. 对 Custom 系列的 FA nib 只添加 `uses_nib_type` / `related_nib` 关系，禁止 `same_model_as`。

---

## 3. Moonman / Majohn 与 A1

### Canonical 与别名

| 字段 | 建议值 |
|---|---|
| canonical brand key | `majohn` |
| canonical brand 中文名 | `末匠 Majohn` |
| canonical brand English | `Majohn` |
| brand aliases | `Moonman`、`MOONMAN`、`末匠 Moonman` |
| canonical model key | `majohn-a1` |
| canonical model 中文名 | `末匠 Majohn A1 按动钢笔` |
| canonical model English | `Majohn A1 Retractable Fountain Pen` |
| model aliases | `Moonman A1`、`Majohn A1 Press Fountain Pen`、`A1 按动钢笔` |

### Family / model / variant 判定

- Majohn 是 Moonman 后续使用的英文商标/品牌名，不应在知识图谱中建立两个互不相干的厂商品牌。
- Moonman 应作为 `historic_alias` / `former_mark` 保留；历史产品图片上出现 MOONMAN logo 时，图片 caption 与 provenance 不应被改写。
- A1 是一个 model。带夹、无夹、颜色和 nib 规格是 configuration/variant，不应复制为 Moonman A1 与 Majohn A1 两个型号。

### 证据

| 等级 | 来源 | 支撑事实 |
|---|---|---|
| T1（原始声明镜像） | Moonman → Majohn 改名声明图片 — [https://i.imgur.com/rFvPNcB.jpg](https://i.imgur.com/rFvPNcB.jpg) | 可直接读取的品牌声明原始图像；支撑新旧英文商标关系，但托管在 Imgur，需保留镜像 provenance |
| T3 | Reddit 对声明的转录与来源讨论 — [https://www.reddit.com/r/fountainpens/comments/o8t71y/majohn_and_moonman/](https://www.reddit.com/r/fountainpens/comments/o8t71y/majohn_and_moonman/) | 补足声明的社区传播时间和文本 provenance，不单独作为 canonical 依据 |
| T2 | Budapest Pen Show A1 测试 — [https://budapestpenshow.hu/en/test-of-the-majohn-a1-fountain-pen-a-pilot-capless-clone/](https://budapestpenshow.hu/en/test-of-the-majohn-a1-fountain-pen-a-pilot-capless-clone/) | 专业内容同时记录 Majohn A1 与 Moonman 旧称，支持同一型号市场别名 |
| T2 | TTPen Majohn A1 产品页 — [https://www.ttpen.com/products/majohn-a1-press-fountain-pen-with-box-retractable-extra-fine-nib](https://www.ttpen.com/products/majohn-a1-press-fountain-pen-with-box-retractable-extra-fine-nib) | 支撑 Majohn A1 当前市场名，以及 clip/clipless 等 option/variant |
| T3 | moonmanpen.com 的 Moonman A1 过渡命名页 — [https://moonmanpen.com/products/moonman-a1-press-fountain-pen-white-metal-retractable-ink-pen-extra-fine-nib-with-converter-gift-box-golden-clip-version](https://moonmanpen.com/products/moonman-a1-press-fountain-pen-white-metal-retractable-ink-pen-extra-fine-nib-with-converter-gift-box-golden-clip-version) | 证明市场上仍存在 Moonman A1 过渡命名；站点所有权未验证，不能当厂商官网 |

### 冲突与未知

- 改名声明的可访问版本是图片镜像，而不是仍在线的厂商公告归档，因此法律主体、商标生效日和各市场切换日没有达到完全可审计状态。
- `moonmanpen.com` 不能被标为 manufacturer official；它只可作为 T3 市场命名证据。
- 旧库存、旧 logo 和新包装可能长期并存，不能因为图片写着 Moonman 就创建第二个 A1 实体。

### 明确迁移建议

1. 只保留一个 canonical brand `majohn`；将 Moonman 建为 `historic_alias`，禁止创建重复品牌详情页。
2. 只保留一个 A1 canonical model `majohn-a1`；所有 `Moonman A1` 路由和搜索项指向该实体。
3. clip/clipless、颜色、nib width 设为 variants/options，并保留各 variant 的真实图片和旧/新 logo provenance。
4. 历史正文可以写“Moonman（现 Majohn）”，当前标题统一采用 `末匠 Majohn A1 按动钢笔`。

---

## 4. Wing Sung / JunLai 630

### Canonical 与别名

| 字段 | 建议值 |
|---|---|
| canonical model key | `junlai-630` |
| canonical 中文名 | `君来 JunLai 630` |
| canonical English | `JunLai 630 Fountain Pen` |
| 合法 aliases | `Wing Sung 630`、`Wingsung 630`、`永生 630`、`君来 630`、`JunL 630`、`JunLai 630` |
| 安全的公开双名 | `君来／永生 630`（在授权边界尚未完全消歧的页面上） |
| 生产者关系 | `manufactured_by -> Shanghai Green / 上海格林` |
| 授权营销关系 | `marketed_under_licensed_brand -> Wing Sung / 永生`，仅限有证据的 6 系及相应时段 |

### Family / model / variant 判定

- JunL/JunLai 是上海格林自有标识；Wing Sung/永生是其获得许可后在 6 系产品上使用的品牌标识。
- 630 是同一基础 model，不应分裂成内容相同的 JunLai 630 与 Wing Sung 630。
- **不能把 JunLai 和 Wing Sung 两个品牌做全局 merge。** 当前证据只支持上海格林所生产、获授权的特定 6 系产品关系。
- 现阶段 canonical 建议以 JunLai/君来为主，Wing Sung/永生作为有时间范围的 licensed marketing alias/relation。

### 证据

| 等级 | 来源 | 支撑事实 |
|---|---|---|
| T1（一手访谈） | 上海格林负责人 Heming Zhang 访谈 — [https://shanghaiknifedude.blogspot.com/2024/04/review-junlai-wing-sung-630.html](https://shanghaiknifedude.blogspot.com/2024/04/review-junlai-wing-sung-630.html) | 负责人说明公司 2004 年成立、2013 年注册 JunL、2013 年首次获 Wing Sung 6 系授权、2018 年续约十年至 2028 年；虽托管在第三方博客，内容是一手采访 |
| T1（原始产品文档镜像） | FPN 帖内 630 产品说明书 — [https://www.fountainpennetwork.com/forum/topic/372338-ws630-a-mb149-size-piston-filler/](https://www.fountainpennetwork.com/forum/topic/372338-ws630-a-mb149-size-piston-filler/) | 说明书材料写明由上海英雄实业授权、上海格林生产；原始 artifact 托管于论坛，应保留镜像 provenance |
| T2 | FrankUnderwater：The New Wing Sungs Explained — [https://frankunderwater.com/2017/09/14/the-new-wing-sungs-explained/comment-page-1/](https://frankunderwater.com/2017/09/14/the-new-wing-sungs-explained/comment-page-1/) | 独立历史梳理，补充不同“新永生”生产与授权主体的背景，支持禁止全局品牌合并 |

### 冲突与未知

- 负责人访谈同一段落中出现疑似方向性笔误：一处说要以 Wing Sung 替换 JunL，另一处又说授权不会续签、Wing Sung 零件售完为止。后者与上下文及“自有标”叙述更一致，但不能擅自纠正原文。
- 2018 年十年授权意味着证据覆盖到 2028 年；到期后的实际续约、库存消化和 logo 切换需要在 2028 年或厂商发布新声明后复核。
- `JunL`、`JunLai`、`君来` 的具体商标拼写和不同批次 logo 需要按实物/包装保留，不能用文本标准化覆盖图片事实。
- 因上述冲突，本项总体置信度明确为 **中等**，低于其他五项。

### 明确迁移建议

1. 建立单一 model `junlai-630`，canonical 显示 `君来 JunLai 630`；旧 `wing-sung-630` 路由永久重定向到它。
2. 给该 model 增加 `manufactured_by: Shanghai Green`。
3. 增加 `marketed_under_licensed_brand: Wing Sung`，作用域限定 `series: 6xx`、`valid_from: 2013`、`valid_to: 2028`；不要把该关系外推到所有 Wing Sung 产品。
4. 在未完全确认具体批次品牌标识时，页面标题可以暂用 `君来／永生 630`，图片 caption 按实物 logo 写 `JunL` 或 `Wing Sung`。
5. 新增 taxonomy 规则：品牌 license relation 不等于 `same_brand_as`；禁止 JunLai 与 Wing Sung 全局 merge。

---

## 5. Sailor Professional Gear Slim

### Canonical 与别名

| 字段 | 建议值 |
|---|---|
| family | `Sailor Professional Gear` |
| canonical model key | `sailor-professional-gear-slim` |
| canonical 中文名 | `写乐 Professional Gear Slim（PGS）万年笔` |
| canonical English | `Sailor Professional Gear Slim Fountain Pen` |
| 合法 aliases | `Professional Gear Slim`、`Pro Gear Slim`、`PGS`、`プロフェッショナルギア スリム`、`写乐 PGS` |
| edition group 示例 | `SHIKIORI / 四季织 11-1224`、`Fairy Tale`、`Demonstrator`、`Red Supernova`、`Kaigetsu` |
| 独立 sibling models | Professional Gear full-size、Professional Gear Realo、Professional Gear Slim Mini、King of Pen，以及官方命名独立的 `Professional Gear Slim 21` |

### Family / model / variant 判定

- Professional Gear 是 family；Professional Gear Slim 是官方明确列出的独立 model/platform。
- Slim 的普通金/银配色、四季织、Fairy Tale、Demonstrator、Red Supernova 和限量主题色属于 edition group 或 color/finish variant，不应提升为新的基础型号。
- `SHIKIORI 11-1224` 应被建模为 PGS 下的 edition group；其页面中的四个配色是 child variants。
- `Professional Gear Slim Mini`、Realo、full-size 与 King of Pen 的结构/产品身份不同，均为 sibling model，不得当作 Slim 的普通色。
- 2026 年官方新列的 `Professional Gear Slim 21` 有独立正式名称和 21K platform，建议作为 PGS 下的 sibling model，而不是单一颜色 variant。

### 证据

| 等级 | 来源 | 支撑事实 |
|---|---|---|
| T1 | Sailor 官方 Professional Gear Series 层级页 — [https://en.sailor.co.jp/topics/professional-gear-series/](https://en.sailor.co.jp/topics/professional-gear-series/) | 官方把 Professional Gear、Realo、Slim、Slim Mini 分列；并在 Slim 下列出 Gold/Silver Colors、SHIKIORI、Fairy Tale、Demonstrator、Red Supernova 等 |
| T1 | Sailor English `SHIKIORI 11-1224` — [https://en.sailor.co.jp/product/11-1224/](https://en.sailor.co.jp/product/11-1224/) | 官方产品编号与 PGS/SHIKIORI edition 归属 |
| T1 | Sailor Japan `11-1224` — [https://sailor.co.jp/product/11-1224/](https://sailor.co.jp/product/11-1224/) | 日文官方产品名、系列与配色信息 |
| T1 | Sailor `Kaigetsu` 限量套装 — [https://sailor.co.jp/news/20241129/](https://sailor.co.jp/news/20241129/) | 官方明确为 PGS 的限定轴色/套装，支持限量色仍是 edition/variant |
| T1 | Sailor 2026 `Professional Gear Slim 21` — [https://sailor.co.jp/product/11-2151/](https://sailor.co.jp/product/11-2151/) | 官方独立产品名称与 21K platform，支持建为 sibling model |

### 冲突与未知

- 市场内容经常把某个配色系列直接简称为“型号”，例如“四季织 1224”；这是零售/社区用法，不应覆盖官方 family → model → edition 层级。
- 限量编号、销售地区和年份需要按 edition 单独记录；“限量”本身不会自动把颜色升级为 model。
- 本轮不把所有历史限定色穷举进 taxonomy，只确定它们的挂载规则。

### 明确迁移建议

1. 建立 canonical model `sailor-professional-gear-slim`，作为所有 PGS edition 的父节点。
2. 把现有 `写乐-sailor-四季织1224` 从基础 model 改为 edition group `sailor-pgs-shikiori-11-1224`，关系为 `edition_of -> sailor-professional-gear-slim`。
3. 按官方 `11-1224` 页面把四个配色建为 child color variants；四个颜色不得各自升级为 model。
4. Kaigetsu 等限定轴色使用 `limited_edition_of` / `color_variant_of`，并记录年份、地区和 product code。
5. 为 `Professional Gear Slim 21` 建独立 sibling model，关系为 `member_of -> Professional Gear family`，不要挂为普通 PGS 色号。
6. 给旧“四季织 1224”路由保留 redirect/alias，但页面面包屑必须显示 `Professional Gear → Professional Gear Slim → SHIKIORI 11-1224`。

---

## 6. Asvine P36

### Canonical 与别名

| 字段 | 建议值 |
|---|---|
| canonical model key | `asvine-p36` |
| canonical 中文名 | `意斯华 Asvine P36 钛合金活塞钢笔` |
| canonical English | `Asvine P36 Titanium Piston-Filling Fountain Pen` |
| 合法 aliases | `Asvine P36`、`Asvine P36 Titanium`、`P36 Titanium`、`意斯华 P36` |
| options / variants | Asvine nib unit、Bock-compatible/Bock nib option、不同 nib width，以及有来源支持的颜色/饰面 |
| 明确排除 | 不存在证据支持第二个独立的 P36 canonical 型号名 |

### Family / model / variant 判定

- 可核验市场资料持续使用 `Asvine P36`，因此它应是单一 model。
- `Titanium` 和 `Piston-Filling` 是材料/结构描述，可进入完整展示名和 facts，但不产生第二个 model。
- Asvine nib、Bock nib 或不同 nib width 是 option/variant；不能为每个 nib 建重复型号页面。
- 当前 `意斯华 P36` 的 slug/title 方向正确，只需补齐英文与描述性 aliases。

### 证据

| 等级 | 来源 | 支撑事实 |
|---|---|---|
| T1（厂商控制 storefront） | Amazon `Asvine Pen` storefront 产品页 — [https://www.amazon.com/Asvine-Titanium-Fountain-Transparent-Signature/dp/B0C6G422TD](https://www.amazon.com/Asvine-Titanium-Fountain-Transparent-Signature/dp/B0C6G422TD) | 由 Asvine Pen 销售的页面持续使用 Asvine P36，并列出 nib style options；平台为第三方，需保留 storefront 限定 |
| T2 | FPnibs Asvine P36 — [https://www.fpnibs.com/products/asvine-p36](https://www.fpnibs.com/products/asvine-p36) | 专业 nib 零售商对 P36 名称、活塞结构和 nib 配置的交叉验证 |
| T2 | TTPen Asvine P36 — [https://www.ttpen.com/products/asvine-p36-titanium-alloy-piston-filling-fountain-pen](https://www.ttpen.com/products/asvine-p36-titanium-alloy-piston-filling-fountain-pen) | 市场名、钛合金描述和活塞结构交叉验证 |
| T3 | 淘宝商品镜像 — [https://tao.hooos.com/goods_o2VkWZ3CrtdzeGXiDD7FntN-gQXnn3spX38jPV8Ta.html](https://tao.hooos.com/goods_o2VkWZ3CrtdzeGXiDD7FntN-gQXnn3spX38jPV8Ta.html) | 仅用于验证中文市场对 Asvine 的“意斯华”译名，不作为规格权威来源 |

### 冲突与未知

- 未找到能明确证明 `asvinepens.com` 由厂商法人直接运营的材料，因此该域名不能标为 T1 manufacturer official。
- Amazon storefront 虽由 `Asvine Pen` 销售，但仍托管在第三方平台；若未来出现品牌自有目录，应以自有目录替换/提升 canonical 证据。
- Bock 与 Asvine nib 的具体兼容性、随附配置和市场库存可能变化，必须按 option/SKU 记录，不能写成所有 P36 的恒定配置。

### 明确迁移建议

1. 保留现有 `意斯华-p36` 路由方向，内部 canonical key 统一为 `asvine-p36`。
2. 增加 `Asvine P36 Titanium`、`P36 Titanium`、`意斯华 P36` aliases，不创建新型号。
3. 把 Asvine/Bock nib unit 与 nib width 移到 option/variant 层，并给来源与市场范围。
4. 不把 `asvinepens.com` 自动写成官方站；来源 metadata 标记为 `ownership_unverified`，直到有可核验的厂商主体证据。

---

## Phase 21 执行约束

### 必须执行的 identity 规则

1. **alias 不产生重复详情页。** 地区名、旧品牌名和市场俗称应解析到 canonical entity。
2. **license 不等于品牌合并。** `marketed_under_licensed_brand` 必须有 product/series scope 和时间范围。
3. **edition/color 不等于 model。** 只有官方层级、结构平台或独立产品身份足以支撑新的 model。
4. **规格必须可限定市场与时间。** 尤其是 MR/Cocoon 上墨系统、Wing Sung 授权期限、P36 nib option。
5. **图片 provenance 不改写历史。** 旧 Moonman、JunL、Wing Sung logo 应按图片实物标注，不因 canonical 迁移而替换事实。
6. **canonical 迁移必须保留 redirect。** 旧 slug 可以继续可达，但页面标题、面包屑和实体关系必须反映新 taxonomy。

### 禁止的错误合并/拆分

- 禁止 `Cocoon same_as 贵妃`；这是本轮最高优先级负面约束。
- 禁止把 Elabo 与 Falcon 拆成两个重复型号。
- 禁止把 Moonman 与 Majohn 建成两个无关系品牌，或把 Moonman A1 与 Majohn A1 建成两个型号。
- 禁止把 Wing Sung 与 JunLai 做全局 `same_brand_as`；仅 630/有证据的 6 系使用 scoped license relation。
- 禁止把 PGS 普通色、四季织色或限量色全部升级为独立基础型号。
- 禁止按 P36 nib option 复制型号页。

## 研究结论

六项中，Pilot Elabo/Falcon 与 Sailor PGS 层级的官方证据最直接；Pilot MR/Metropolitan/Cocoon 的同一产品家族结论也明确，但配置必须按地区/年份建模。Moonman/Majohn 的品牌迁移有原始声明镜像和多方市场证据，足以支持 alias 合并。Asvine P36 可安全统一为单一型号。

唯一需要保留显著风险标记的是 Wing Sung/JunLai 630：现有一手访谈和产品文档足以证明上海格林、JunL 与 Wing Sung 6 系授权关系，但访谈存在方向性笔误，且授权在 2028 年面临到期边界。因此 Phase 21 应采用 **JunLai canonical + Wing Sung scoped licensed alias/relation + 中等置信度 + 2028 复核**，不能做不可逆的全局品牌合并。
