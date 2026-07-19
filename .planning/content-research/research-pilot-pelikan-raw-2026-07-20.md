# Pilot／Pelikan 原始型号复核与下一批方案（2026-07-20）

## 结论先行

本次不应再把题目中列出的 Pelikan M1000、M1005、M200、M400、M600、M605、M815、P457 当作待补空壳。它们已经分别由 Phase 32、35、38 以来源化正文、canonical slug、`made_by` 反向关系和 checkpoint-copy 测试发布；再次制作会制造 duplicate。下一批应把 Pelikan 从“重做八支”改为“只回归这些 canonical 页面及品牌反向链接”，把实际写作额度投入 Pilot 的 14 个仍未来源化 raw 实体，以及官方当前目录中库内没有的代表型号。

Pilot 的现有 raw inventory 能覆盖 Custom／Elite 这条线的核心入口，但仍有明显缺口：Custom URUSHI、Justus 95、Elabo/Falcon、Silvern、Custom NS、Lightive 与 Grance 都在 PILOT 当前目录；它们不是 74／742／743／845 的颜色别名。建议先做两批：`Pilot Custom family`（845、742、743、912、Elite 95S，连同现有 74／823／91／92 的导航），随后做 `Pilot current missing models`（Custom URUSHI、Justus 95、Elabo、Silvern、Custom NS、Lightive、Grance）。

## 核对口径与资料可信度

- 现行身份、产品号、是否仍在官方支持范围：PILOT 日本官网的[万年笔目录](https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004)、[保修产品索引](https://www.pilot.co.jp/support/warranty/jp/fountain/)和各型号保修／说明书页。
- Pilot 具体 845、742、743、912 页面可确认各自产品号以及 cartridge／CON-40／CON-70N 兼容边界：[845](https://www.pilot.co.jp/support/warranty/jp/fountain/custom845.html)、[742](https://www.pilot.co.jp/support/warranty/jp/fountain/custom742.html)、[743](https://www.pilot.co.jp/support/warranty/jp/fountain/custom743.html)、[912](https://www.pilot.co.jp/support/warranty/jp/fountain/custom_heritage912.html)。这些页面的通用维护说明不等于尺寸、笔尖或年代资料；尺寸和尖型必须回到 catalog／产品页逐项取证。
- Pelikan 的现行规格优先用官方 Fine Writing 产品页、当期 catalog PDF／产品页；历史型号、停产特殊版与版本时间线以[Pelikan Collectibles Souverän 总览](https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/index.html)、[M1000/M1005 档案](https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M1000-Basis/index.html)和 The Pelikan's Perch 交叉。收藏档案的旧款数值不得覆盖现行官方数字。

## 现有 Pilot 实体：ID、slug 与 identity 判定

下表来自 repository 的审计快照与已提交 Phase 26/41/43/47 数据，而非直接读取真实 `data/fpkg.db`。实施前在 owned checkpoint copy 再验证一次当前 type／slug；任何 legacy slug 只做 redirect，不回写成新的 canonical。

| entity ID | 审计快照 slug | 正确身份／行动 |
| --- | --- | --- |
| `Zt-PbXkE7UHM` | `pilot` | 品牌 canonical；品牌页要列出全部已公开 Pilot 型号。 |
| `gtneqw804HyP` | `百乐-pilot-custom-74` | Custom 74 已来源化；保留为 74，不与 742／743／91 合并。若 Phase 26 未统一 slug，实施批次只补 redirect／品牌导航。 |
| `oJyaQy9bEc8V` | `pilot-custom-823` | Custom 823 canonical，Phase 47 已完成。 |
| `xQ-15uqtdMGA` | `百乐-pilot-custom-823` | 823 duplicate，已应为 retired + redirect；绝不可重新发布。 |
| `fuB0SU-om1z5` | `百乐-pilot-capless-decimo` | 旧的 Capless／Decimo 混合 umbrella，Phase 43 已 retire；不能再当型号页。 |
| `s43PILOTCAP` / `s43PILOTDECI` / `s43PILOTLS` | `pilot-capless` / `pilot-capless-decimo` / `pilot-capless-ls` | 具体 Capless、Decimo、LS，均已来源化；三者是 sibling，不互为 finish。 |
| `2_L9OS-kqqQV` | `百乐-pilot-845-urushi` | Pilot Custom 845；应 canonicalize 为 `pilot-custom-845`。它是 No.15 尖、漆杆的独立型号，不能被 Custom URUSHI 或 823 吸收。 |
| `x9Ds3bsbFIx2` | `百乐-pilot-custom-742` | Custom 742；应为 `pilot-custom-742`。它与 912 共用部分大号笔尖／尖型语境，但 742 不是 Heritage 912 的别名。 |
| `qYCN9Mhl_0UC` | `百乐-pilot-custom-743` | Custom 743；应为 `pilot-custom-743`。与 823 同属 No.15 尺寸路线，但 743 是 cartridge/converter，823 是真空上墨，必须分页。 |
| `1Dcfc2GsaaV4` | `百乐-pilot-912` | Custom Heritage 912；应为 `pilot-custom-heritage-912`，不要写成“Custom 912 PO”单一型号。PO、FA、WA、SU 等为 nib option／SKU，只有在官方停产或独立发行时才另建 variant。 |
| `3bijtqhOXplP` | `百乐-pilot-elite-95s` | Elite 95S；应为 `pilot-elite-95s`。不是 1970s Elite 的无差别同义词；旧 Elite family 需另立历史导航／实体。 |
| `NpJibLHczSl9` | `百乐-pilot-heritage-91` | Custom Heritage 91；应为 `pilot-custom-heritage-91`。它是 5 号尖、c/c 的扁平顶路线。 |
| `-Oa7pDNi4UnI` | `百乐-pilot-heritage-92` | Custom Heritage 92；应为 `pilot-custom-heritage-92`。它是 5 号尖活塞型号，不能和 91 或 74 共享供墨。 |
| `lOgSh4vuQsFK` | `百乐-pilot-78g-78g` | 78G 与 78G+ 不能当作一个未分年代 SKU；先做“78G family（历史、停产／地区版待核）”页，78G+ 作为有证据的 sibling 或 regional revision。不能宣称仍是日本官方现行款。 |
| `2GM0UtshoSVw` | `百乐-pilot-88g` | 仅“88G”不足以安全等同于 Elite、Custom 或某个出口名。先以 archive/实物 catalog 建澄清页；若找不到 primary/archive 证据，不发布，保留 draft。 |
| `BM2fNJ2-fP0T` | `百乐-pilot-cavalier` | Cavalier；应为 `pilot-cavalier`。现行目录同列，独立于 Prera／Cocoon 的细杆 entry line。 |
| `UrbBB-onjGnF` | `百乐-pilot-prera` | Prera；应为 `pilot-prera`。`Prera Iro-ai` 是透明／配色 sibling，非另一个品牌或尖型。 |
| `U6w1BK0N4u0f` | `百乐-pilot-笑脸-kakuno` | Kakuno；应为 `pilot-kakuno`，笑脸尖是该儿童／入门结构特征，不应把“笑脸”写作独立型号。 |
| `1dtEi80xLCZ1` | `百乐-pilot-贵妃-cocoon` | Cocoon；应为 `pilot-cocoon`，`Metropolitan` 是市场 alias，不新增 duplicate。不同市场饰件／配色只能是 variant。 |

## Pilot Custom／Elite 的可实施内容边界

### P0：一次实施，保留既有 ID

1. **Custom 845 (`2_L9OS-kqqQV`)**
   - Canonical：`pilot-custom-845`；品牌为 `Zt-PbXkE7UHM`；旧中文 slug 永久 redirect。
   - 核心写作：845 是官方独立产品号 `FKV-5MR`，c/c，官方维护页明确 CON-40 与 CON-70N；漆面清洁、墨水和溶剂禁忌必须原样收束，不能把 Custom URUSHI 的 30 号尖、尺寸或旗帜定位借来。
   - 版本边界：黑／朱、漆色和市场库存是 variant；845 不等于 743，也不等于 Custom URUSHI。
   - 来源：上述官方 845 页；补当期 web catalog direct PDP 与一篇专业长测（如 The Pen Addict/Gentleman Stationer）用于握持和使用感，后者不作规格唯一来源。

2. **Custom 742 (`x9Ds3bsbFIx2`) 与 Custom 743 (`qYCN9Mhl_0UC`)**
   - 两张独立 canonical 页；均使用日本官方产品号、说明页及当前目录。
   - 742 是 No.10 系统，743 是 No.15 系统；两者可用相同 converter 家族，并不代表笔尖、尺寸、笔握、尖型清单相同。
   - 743 必须明确与 823 的上墨差别；不要把 823 真空机构写到 743。742 可与 912 建系列导航，但不要合并为“742/912”。

3. **Custom Heritage 912 (`1Dcfc2GsaaV4`)**
   - Canonical：`pilot-custom-heritage-912`；标题是型号，不把 PO 或 FA 拿来取代产品名。
   - 内容要逐项标注官方实际提供的 nib code；只有可由当期 catalog 或 archive 确认的尖型才进 variant，避免把经销商配尖或修磨当作厂设。
   - 与 742 写清：共享某些大号尖／c/c 系统是产品线关联，外形和 model identity 仍不同。

4. **Elite 95S (`3bijtqhOXplP`)**
   - Canonical：`pilot-elite-95s`；保留官方产品号 `FES-1MM` 与 current catalog 证据。
   - 必须给出“现代 Elite 95S 与旧 Elite family”的年代／构造范围，不能用任意老 Elite 图片代表现行 95S。
   - 版本表只列能核实的 14K 尖、外观／饰件和地区号；不要用“口袋笔”把尺寸或笔帽长度写成未核实常数。

### P1：现存 raw 的入门和历史清理

- **91／92**：先分别来源化。91=c/c，92=活塞，这是读者选购上最需要的差异；不要只写“同款透明版”。
- **Cocoon／Metropolitan**：只留 Cocoon canonical，Metropolitan 作为地区 alias；型号页需要列地区、饰件、尖号／色彩跟日本 Cocoon 不一定同 SKU 的警告。
- **Prera／Prera Iro-ai、Kakuno、Cavalier**：每支是独立型号；透明／色彩、儿童／成人版本使用 variant 表处理。可组成低价日用 batch，但各自规格不可互抄。
- **78G／78G+、88G**：先 archive research，不足以满足 primary-or-archive + professional-secondary 时不要装成“完整百科页”。78G 与 78G+ 的年代／出口销售边界必须在资料中被证实；88G 优先解决身份，不能为追求数量写假 history。

### P0：库外但官方当前目录的必要新增

| 新实体建议 | 为什么不能折进现有 raw | 最低来源与内容边界 |
| --- | --- | --- |
| Custom URUSHI | 30 号尖旗舰，与 845 的 No.15 漆杆不同。 | [官方目录](https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004)、[2024 新色新闻稿](https://www.pilot.co.jp/press_release/2024/10/23/urushi.html)、官方 PDP／说明书；颜色只是 variant。 |
| Justus 95 | 可调笔尖机构是独立功能，不是 742 的尖号。 | 官方目录和保修页 `FJ-3MR`，再配专业测评；不凭二手称呼外推机构版本。 |
| Elabo / Falcon | `Elabo` 与北美 `Falcon` 是地区名／alias；软尖是产品身份。 | 官方目录、保修页 `FE-25SR`/`FE-18SR`；金属／树脂笔杆为 sibling，不是任意色差。 |
| Silvern | 银杆、嵌入式尖与 Custom 系列不同。 | 官方目录、保修页 `FK-5MS`；图案／finish 为 variant，避免拿 Capless Raden 图片代替。 |
| Custom NS | 当前 catalog 中独立的 Custom 钢尖路线。 | 官方目录与日本 PDP；确认其供墨、材料、尖型后才写，不用 Custom 74 的金尖规格填空。 |
| Lightive | 现行入门线，与 Kakuno、Cocoon 的结构和目标人群不同。 | 官方目录与官方地区产品页；各市场名、颜色、尖号要分 SKU。 |
| Grance | 现行金属正装线，官方保修页列 `FGRC-12SR`。 | [官方保修页](https://www.pilot.co.jp/support/warranty/jp/fountain/grance_2.html) + catalog；不可当作 Cavalier 的金属 variant。 |

## Pelikan：实体复核与禁止重做清单

| canonical entity ID | canonical slug | 已完成身份边界／本轮行动 |
| --- | --- | --- |
| `6eXuisf9KiK5` | `pelikan-souveran-m1000` | Phase 32 已发布标准 M1000；M1005、Raden、Maki-e 与特别版不并入。仅回归品牌反链。 |
| `U1FyHpt9jaE4` | `pelikan-souveran-m1005-stresemann-2019` | Phase 35 已发布。M1005 是银色饰件且 2011 Demonstrator、2013 Black、2019 Stresemann 是不同特别版本；当前实体 scope 为 2019 Stresemann，不能泛称“全部 M1005”。 |
| `uLrDh27Q5Xne` | `pelikan-m200` | Phase 38 已发布。M200 为 Classic 活塞；M205 是银饰 sibling，M250 金尖 sibling，P200/P205 因 cartridge 另页。 |
| `EF34ulVg8PSK` | `pelikan-souveran-m400` | Phase 35 已发布。M400 不应吸收 M405/M415 或 historical 400/400NN。 |
| `MJHgkh3M-6MQ` | `pelikan-souveran-m600` | Phase 32 已发布标准 M600；1985–1997 Old Style 和 1997 后尺寸平台必须保持时间线。 |
| `7gmV0UJORvc7` | `pelikan-souveran-m605` | Phase 35 已发布 M605 family；旧 `M605 白乌龟`误标已经退役，不能复活。White Transparent、Green-White、Black Tortoise、Stresemann 必须按年份和实体证据写 variant。 |
| `2muSiS2rOSd7` | `pelikan-souveran-m815-metal-striped` | Phase 35 已发布 M815 Metal Striped；2018 Black 与 2025 Blue 两个版本，1995 Wall Street 不折入同一规格页。 |
| `wnzMt5lugvtc` | `pelikan-twist-p457` | Phase 38 已发布；Twist P457 是学生钢尖／墨囊型号，颜色和套装是 variant，绝非 Pelikano。 |

### Pelikan 的下一步只做两件事

1. 对上表九条以及品牌 `VXUULuCOLOB1` 执行定向回归：公开状态、正文、主图不重复、唯一 `made_by`、品牌页可到达、legacy redirect 是否仍然正确。不能以重新写一遍正文替代回归。
2. 若继续扩张 Pelikan，优先研究真正未覆盖而非清单中的型号：M300、M250、M405、M205／M215、M101N、M120、M400 historical 400/400NN、M805（标准银饰线）和 M7000 Majesty。它们需要各自的官方／archive scope，不能因为“同尺寸”从 M200/M400/M600/M800/M1000 页面复制内容。

## 推荐实现分批（不直接写真实 DB）

### Batch P-Pilot-1：Custom / Elite 现有实体

- 输入：845、742、743、912、Elite 95S，必要时 91／92 只做导航链接核验。
- schema：保留 existing entity ID；统一 canonical slug；每个 pen 一个 `made_by` 到 `Zt-PbXkE7UHM`；为每个旧中文 slug 安装 permanent redirect；品牌 pack 必须带全量已公开 Pilot 型号反向链接。
- 内容：每页至少有身份、当前／历史状态、笔尖、上墨、规格（逐项来源）、版本／市场差别、维护、选购和不少于 primary/archive + professional secondary 两类来源。媒体使用唯一型号实拍或标明“非产品照片”的 factual SVG。
- 禁止：把 742/912、743/823、845/Custom URUSHI、Elite 95S/旧 Elite family 合并；把 PO/FA 作为 912 的独立型号；直接在真实 DB 上验证。

### Batch P-Pilot-2：入门／历史 raw 与新增当前型号

- Part A：91、92、Cavalier、Prera、Kakuno、Cocoon/Metropolitan alias；按稳定的现有 ID 出版。
- Part B：78G／78G+／88G 只在身份史料足够时出版；否则记录为 audit backlog，不以 AI 补写。
- Part C：新增 Custom URUSHI、Justus 95、Elabo/Falcon、Silvern、Custom NS、Lightive、Grance；先生成稳定 ID，再与当前官方产品号一一对应。

### Batch P-Pelikan-regression

- 只串联 Phase 27、32、35、38、51、54 packs 到 owned checkpoint copy；检查上述 ID 的 public page、brand inverse link、redirect 和 unique media hash。
- 实测发现的断链／退役链接错误才做数据修补。无异常即 `noop`，不重建任何 Pelikan pack。

## 交付给实施 agent 的 source checklist

- 每个 Pilot 当前型号：日本官方 directory + 对应 warranty/PDP；`FKK`／`FKVH`／`FES` 等型号码写入 sources/variant，不凭零售商品标题推断。
- 每个 Pelikan historical/edition claim：官方 catalog/PDP 或明确的 Pelikan archive；Pelikan Collectibles/Perch 用于版本时间线和收藏识别时，应在 claim 中标明来源级别和适用年段。
- 媒体：不得拿相近型号图充数；无 exact-model 可许可图时使用原创 factual SVG，并在页面和 media attribution 明示不是实物照片。
- 每批先运行 disposable-copy test，再 TypeScript、Biome、build；测试期间不读取或改动真实 `data/fpkg.db`。

