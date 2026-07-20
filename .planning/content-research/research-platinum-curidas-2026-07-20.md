# Platinum Curidas（PKN-7000）内容研究卡

检索与复核日期：2026-07-20。本文件只为后续内容包提供身份、写作和 checkpoint 核验边界；未读取或写入真实 `data/fpkg.db`，未改动任何代码、脚本、测试或既有内容。

## 结论先行

**Curidas 是 Platinum 的独立按动式钢笔型号，不是 Pilot Capless 的廉价版本，也不是 Preppy 的按动外壳。**应以 `PKN-7000` 作为当前基础型号，正文先说明它如何通过按键推出/收回笔尖，再解释透明 PMMA 笔身、可拆笔夹、钢尖和 Platinum 专用墨囊／上墨器的取舍。

截至本次访问，Platinum 日本官网仍有 Curidas 的产品页和系列页，列出五种常规轴色、EF/F/M 三种笔尖，标价 ¥7,700（含税）。因此**不得把它写成已停产**。2020 年 6 月官网的“暂时生产中止”仅由 COVID-19 造成，公告同时预告 2020 年 11 月恢复；那是一段历史供应事件，不是当前停产结论。不同国家零售商的清仓、缺货或“discontinued”标签只能说明当地库存／经销状态，不能覆盖日本官方当前目录。

## 静态库存与身份边界

以下身份来自仓库中既有的、以前生成的 inventory artifact，不是对真实目录的读取；实施前仍须在**唯一的 disposable checkpoint copy** 中再确认。

| 项目 | 预期值 | 后续动作 |
| --- | --- | --- |
| 现有型号实体 | `BoZ4C2WSqk0K` | 保留，重写为单一 **Platinum Curidas / PKN-7000** 页面 |
| 旧 slug | `白金-platinum-curidas` | checkpoint 确认后规范为可读的 Curidas slug；如改名才建立一次旧路由永久跳转 |
| 现有品牌关系 | 恰好一条 `made_by` → `e51tJpejEkXY`（Platinum） | 保留这条关系；不得重复插入，只在品牌发布时使其成为反向链接的一部分 |
| 系列范围 | Curidas / `PKN-7000` | 五种常规颜色与 EF/F/M 是同一型号的颜色／尖号选择，不另建为五支型号 |
| 历史上代 | 1965 Platinum Knock | 可做历史关联或正文时间线；不能重命名为 Curidas 变体，也不可宣称零部件互换 |

**不得混入的邻居：**

- **Pilot Capless/Vanishing Point/Decimo**：同为无笔帽、按动伸缩笔尖的使用场景，但 Pilot 现行 Capless 同时有 18K 和特殊合金尖版本，且是 Pilot 自己的笔尖单元／墨水体系。Curidas 是 Platinum 的 PMMA 笔身、ST-2 钢尖、Platinum 墨囊／converter 平台；两者只能以“按动场景相邻”互链，绝不当作同一型号、同一笔尖或同一上墨器。
- **Platinum Preppy**：同属 Platinum、也有钢尖和墨囊／converter 语境，但 Preppy 是有笔帽的入门系列，不具有 Curidas 的按动密封仓或可拆笔夹。不能把 Preppy 的价格、尖号、颜色、笔帽密封或零件兼容性套给 Curidas。
- **Procyon、#3776 Century、President**：可作为 Platinum 品牌页的传统有帽钢笔导航，但不能据此给 Curidas 安上 Slip & Seal、金尖或 14K/18K 规格。官方 Curidas 专题只陈述其收回笔尖时的独立密封设计。
- **Curidas Matte / 限定套装／地区版**：若未来发现确切 SKU，可作为版本层补充；在未获官方 SKU、颜色和时间证据前，不可用一个零售商的“Limited Edition”去改写普通 `PKN-7000` 的材料、附件、供墨或现行状态。

## 可直接落地的事实卡

### 当前型号与规格（以日本官网 PKN-7000 为锚）

| 字段 | 可写事实 | 边界 |
| --- | --- | --- |
| 名称／型号 | キュリダス / Curidas，`PKN-7000` | “Curidas”来自日语“繰り出す（推出笔尖）”与 *Curiosity* 的组合说法；不翻成生硬的“好奇推出”。 |
| 首发 | 2020-03-20 | 以官网 2020-02-17 发布稿的发售日为准；“55 年后”指相对 1965 Platinum Knock 的公司按动钢笔脉络。 |
| 当前常规颜色 | Prism Crystal、Graphite Smoke、Urban Green、Abyss Blue、Gran Red | 这是本次访问官网页所列颜色，不可保证所有市场或未来仍有库存。 |
| 笔尖 | 不锈钢 `ST-2`；EF、F、M | 不写“金尖手感”；也不要把独立评测对某支 F/M 的写感泛化成全部尖号。 |
| 笔身／五金 | 胴、前轴、knock bar、锥形部：PMMA；中螺纹为镀铬黄铜；笔夹为镀铬弹簧钢 | 透明 PMMA 让机构可见；不是金属笔身，也不是“示范笔”材料的通用同义词。 |
| 尺寸／重量 | 全长 153 mm；最大径 13.8 mm；标准重量 24.0 g | 这些是官方整笔规格，不再叠加第三方的“收回／推出后”测量值。 |
| 供墨 | Platinum cartridge；可另购 Converter 700A 或 800A | 官网当前明确随笔为蓝黑墨囊 1 支；converter 是另购，不写“标配上墨器”。 |
| 附件 | 蓝黑墨囊 1 支、笔夹拆装工具 | 附件可能随地区零售套装不同，正文要注明为官网日本常规说明。 |

### 结构、密封与日常维护

1. **收纳不是普通笔帽。**按下后笔尖收回，官方说明收纳仓的门会合上；柔软材料的笔尖仓和较小的气密空间用于降低水分蒸发。正确表述是“设计目标为降低干尖风险”，而不是承诺“放几个月绝不干”或套用 Platinum 其他有帽系列的 Slip & Seal 宣称。
2. **更换墨水比普通有帽笔多一个拆装步骤。**独立评测清楚记录：需打开笔杆后取出带弹簧的笔尖组件／金属遮罩，才能接触墨囊或 converter。正文可把它写成“为了按动机构而换来的操作复杂度”；不要把它描写成无需拆装的快捷补墨。
3. **日常清洗优先走常规墨路。**换色、长期停用或出墨不畅时，先用清水反复冲洗笔尖／供墨器与墨囊／converter 接口并自然晾干；不应在没有故障或官方维修指引时鼓励读者拆开密封门、弹簧或内部机构。第三方评测认为笔尖／feed 可以拆，但也明确说常规冲洗足够；这只能作为维护边界，不是要求用户拆尖。
4. **笔夹是可拆的握持选项，不是“缺件”。**官网说明用随附工具即可拆装。对于手指会顶住笔夹或前端凸起的人，这是可尝试的调整；依赖笔夹夹在口袋或笔记本上的人则应先保留。不能声称拆夹后仍有相同的随身固定能力。
5. **不要编造首发故障史。**早期独立评测和论坛确有对结构、握持凸起及拆装复杂度的讨论；但本研究未找到 Platinum 面向 Curidas feed 的正式召回／换新公告。除非后续拿到可核实的官方服务文件，正文不把“早期裂 feed 已全面修复”写成事实。

## 自然中文的写作方向

建议开头从一个明确动作进入，而不是用“颠覆”“重新定义”之类的广告语：

> Curidas 想解决的不是把传统钢笔做得更像 Capless，而是让你在一手拿着电话或站着开会时，按一下就能写。笔尖回到笔身后，门和柔软的收纳仓一起工作；代价是换墨时要面对一套比普通钢笔更复杂的内部结构。

随后可依次回答读者会真正在意的六件事：

1. **它是什么。**2020 年的 Platinum 按动钢笔，接续 1965 Platinum Knock 的公司内部历史线，而非 Pilot 产品家族。
2. **写起来会遇到什么。**EF 适合小格手帐，F/M 是普通书写选项；笔尖与具体写感应写成钢尖的选择，而非凭空下“顺滑／阻尼”的绝对判词。
3. **为什么笔身透明又粗。**透明 PMMA 把按动、密封和墨路组件公开出来；24 g 并不重，但 13.8 mm 最大径、笔夹位置和笔尖下方的机构凸起是否碰手，必须建议实际握持后判断。
4. **怎么上墨和维护。**墨囊最直接；想用瓶装墨必须另购 700A/800A converter，且补墨／清洗需要按正确顺序取出内部组件。不要承诺不拆就可直接从尾端灌墨。
5. **和 Capless 比，真正该比什么。**两者共享“频繁短记、无需拔帽”的场景；Curidas 的优势是透明机械感、可拆夹与较低价格定位，Capless 则应回到其自身 18K／特殊合金尖和版本梯度。不要把价格差写成性能结论。
6. **谁适合买。**每天大量短句、会议、巡场记事，且愿意接受复杂补墨的人；不适合只想要传统细笔杆、极简外观或喜欢频繁换色却不愿拆装的人。握得靠近笔尖者务必先实际试握，因为独立评测与用户讨论都反复提到前端凸起可能影响部分握法——这是体验分歧，不是全员缺陷。

## 来源清单与证据等级

访问日均为 2026-07-20；正式内容包中每一条核心 claim 都应以具体 source ID 接到下列来源，不能只把 URL 堆在末尾。

### A. 一手／官方（核心事实）

- **Platinum PKN-7000 当前产品页** — 型号、当前价格、PMMA、ST-2、EF/F/M、153 mm、13.8 mm、24 g、附带蓝黑墨囊、五种颜色：<https://www.platinum-pen.co.jp/products/fountain-pen/7848/>
- **Platinum Curidas 专题页（日）** — 名称由来、收回笔尖时的密封逻辑、可拆笔夹、1965 Platinum Knock → 2020 Curidas 的历史叙事、材料与 converter 700A/800A 兼容：<https://www.platinum-pen.co.jp/curidas_jp.html>
- **Platinum 2020-02-17 发布稿** — 首发日期 2020-03-20、55 年历史表述、规格与附件：<https://www.platinum-pen.co.jp/news/8910/>
- **Platinum 2020-06-12 临时停产公告** — COVID-19 导致临时中止、计划 2020 年 11 月恢复；只作历史供应事件，不作停产证据：<https://www.platinum-pen.co.jp/news/9553/>
- **Platinum Curidas 取扱説明书（PDF）** — 后续制作时优先人工核对墨囊／converter 安装、清洗和警示步骤；不能以搜索摘要替代阅读原图：<https://www.platinum-pen.co.jp/cms/wp-content/uploads/2023/05/2132623e0a9276d43ac296ba8a41609e.pdf>

### B. 独立、可署名的专业评测（体验与操作交叉核验）

- **The Gentleman Stationer，2020** — 评测作者对拆装次序、补墨复杂度、尺寸平衡与握持的现场观察；只用作体验和操作交叉核验：<https://www.gentlemanstationer.com/blog/2020/4/29/initial-thoughts-the-platinum-curidas>
- **Pencilcase Blog，2022** — 针对一支 F 样本的笔尖感受、推出后长度和前端凸起的体验；不外推为型号统一规格或品质承诺：<https://www.pencilcaseblog.com/2022/12/review-platinum-curidas-fountain-pen.html>
- **The Poor Penman，2020** — 对透明笔身、按键、可拆组件和“常规冲洗可完成清洁”的试用描述；不替代官方拆装／维修说明：<https://thepoorpenman.com/2020/05/10/platinum-curidas-review/>

### C. 相邻型号的官方边界来源

- **Pilot 2026 Capless 新色发布稿** — Capless 当前存在 18K 与特殊合金尖两种路线、各自尖号与 cartridge/converter 供墨；只用于比较边界：<https://www.pilot.co.jp/press_release/2026/03/05/post_150.html>
- **Platinum Preppy 系列页** — 用于确认 Preppy 是独立、带笔帽的 Platinum 系列；不要从此页导出 Curidas 参数：<https://www.platinum-pen.co.jp/brands/preppy/>

## 图片策略

1. **默认不搬运官网商品图。**官方网站的产品图片有展示用途，并不等于本站获准再发布；在无明确授权时，不下载、归档或裁切官网图。
2. **优先级：**有清楚授权的精确 Curidas 图片（例如明确许可的 Commons）＞本站原创编辑插画 ＞ 无图占位。若用插画，必须标注“示意图，非产品照片”，且不让插画承担精确颜色、磨砂／透明程度或 SKU 的证据。
3. **绝不跨型号代图。**Pilot Capless、Preppy、Procyon 或 Curidas 的某个稀有／Matte 套装都不能代表普通 PKN-7000。图片如果只能确认“Platinum 的按动笔”，就不应上 Curidas 页面。
4. **色版原则。**普通 Curidas 页面可在文字列出官网当前五色，但主图只能是确切的普通 PKN-7000 SKU；不能把单一绿色图片写成“五色的实拍证明”。

## 后续仅可在 disposable checkpoint copy 中进行的核验清单

1. 确认 `BoZ4C2WSqk0K` 的 `type` 为 `pen`、名称／slug 当前值、是否已有公开版本或 redirect；**不从真实目录读取**。
2. 确认仅有一条 `made_by` 到 Platinum `e51tJpejEkXY`；若不存在才补一条，若重复先做关系去重，不能用导航理由重复建立关系。
3. 确认 Platinum 品牌页在与 Curidas 同批发布后能反向链接 Curidas，并把 #3776 Century、Preppy、Procyon、Curidas、Izumo、President 保持为不同节点。
4. 若更换 slug，确认旧 `/pen/白金-platinum-curidas` 只永久跳到 Curidas 的规范页面，无自跳转、无品牌页跳转、无把它跳去 Capless／Preppy 的错误路线。
5. 确认 `PKN-7000` 作为一个型号，颜色和 EF/F/M 均为 variant／spec 事实，不错误生成五个独立型号或三张尖号页面。
6. 确认所有核心字段各有官方 evidence：brand、series/model number、fill system、material、nib、长度／直径／重量；独立评测须作为专业 secondary group 接入体验段落而非冒充规格。
7. 确认图片许可与 alt 文本；无精确许可图时用明确标注的本站编辑插画或不设主图，绝不把 Capless／Preppy／其他 Curidas 版本照片当普通 SKU。
8. 在 checkpoint 上跑**本批次定向**内容、品牌反向链接、redirect 与幂等重放检查；真实 `data/fpkg.db` 的 main/WAL/SHM 快照必须在整个过程前后不变。

## 实施顺序建议

1. 先将 Platinum 品牌页与 Curidas 放在同一来源化内容批次，确保品牌公开后能显示 Curidas 的型号链接；不要先单独公开一个孤立型号页。
2. 内容页以官方 PKN-7000 为规格锚，用一手来源支撑材料、尺寸、供墨、色版、密封原理和历史，用两篇独立评测写体验分歧与拆装成本。
3. 仅在 checkpoint 确认无精确图的许可问题后决定媒体方案；不因补内容而临时抓取官网图。
4. 该包通过定向回归后，再处理 Platinum 的 Procyon／President／Izumo 等原始条目；不要把它们合并成“白金全家桶”模板页。
