# Opus 88 Jazz：内容制作前的身份与资料研究（2026-07-20）

## 结论

**Jazz 应当是 Opus 88 品牌下独立的全尺寸、雪茄形 Japanese-style eyedropper 型号；它既不是 Demonstrator/Demo 的透明版本，也不是 Koloro 的改名或配色，更不是 Opera 的低价版本。** 已有的 Demo 与 Koloro 页面不应被 Jazz 的资料污染；Jazz 应单建型号页，并且在品牌页与 Demo、Koloro、Omar 等并列导航。

当前可稳定取得的资料以 2021 年首发期的专业评测、零售目录和维护说明为主，未找到可公开访问、可长期引用的 Opus 88 官方 Jazz 产品页。因此实现时应：

- 以 Jazz 专属评测的型号、构造和尺寸作为第二级事实来源；不要把零售商的商品标题当官网。
- 对“容量”保留版本/测量边界：资料中既有接近 **2 ml**，也有约 **3 ml** 的说法；两者不应合成为一条精确规格。正文可写为“大容量滴入式墨仓”，除非后续拿到同一 SKU 的原厂说明书或产品页。
- 对笔尖写作“常见 #6 JoWo steel nib / screw-in unit”，并标示为首发及常见零售版本的证据；不要把它扩张成“所有 Jazz、所有年代均如此”。
- 若 checkpoint 中已有一条名为 `Opus 88 Jazz` 的 raw entity，须先核验它不是 Demo/Koloro/Omar 资料的错贴；无确证时保留 draft，不能为完成品牌页而替换它的身份。

## 本次资料边界与静态库存线索

本研究没有以任何方式读取或打开 `data/fpkg.db`，也不提供伪造的数据库 ID。只阅读了版本控制的文本和公开网页。

版本库中已经有完成的 Opus 88 品牌、Demonstrator 与 Koloro 内容包（Phase 57）。taxonomy 资料锁定：

| 已知页面 | 静态证据 | 对 Jazz 的限制 |
| --- | --- | --- |
| Opus 88 品牌 | `scripts/apply-phase57-opus88-leonardo-content.ts` 与 Phase 57 规划 | Jazz 必须指向该品牌；品牌公开页要列出所有已发布的 `made_by` 型号。 |
| Demonstrator / Demo | `src/lib/taxonomy/identity-plan.ts`、Phase 57 | 大型、透明视觉语言、常见 #6 路线是另一个稳定型号；不能把 Jazz 的雪茄形规格或图片塞入 Demo。 |
| Koloro | Phase 57 与 `.planning/content-research/opus88-koloro.md` | Koloro 常见 #5 / Opus #10 路线、扁平端盖与双色材料；不得将其笔尖、尺寸或图片用于 Jazz。 |
| 旧 `opus-88-demo-kolora` 混合路由 | `21-SPLIT-IDENTITY-LOCK.md` | 该旧路由固定 404、没有 redirect；Jazz 不是可把该旧路由“救活”的目标。 |

`V1.2-MODEL-COVERAGE.md` 把 Jazz 标为“非示范款雪茄造型”的 P2 候选。这是一条正确的定位线索，但不是具体规格或版本证据。

## 型号身份矩阵：必须分开写

| 名称 | 稳定身份 / 外形 | 上墨结构 | 笔尖线索 | 不可混写的边界 |
| --- | --- | --- | --- | --- |
| **Opus 88 Jazz** | 传统雪茄形、全尺寸；2021 年资料中的带帽长度约 151.2 mm、约 28 g | 滴入式填充，尾端旋钮控制止墨阀 | 首发/常见版本为 #6 JoWo steel nib | 不叫 Demo、Koloro 或 Opera；不要把其资料写成完全透明的 demonstrator。 |
| Opus 88 Demonstrator / Demo | 大号透明/半透明 demonstrator 家族 | Japanese-style eyedropper + shut-off | 常见 #6 JoWo | “透明、大墨仓、#6”不足以判定为 Jazz；Jazz 需要雪茄形本体和 SKU 证据。 |
| Opus 88 Koloro | 扁平端盖、双色或硬橡胶/树脂混材的独立型号 | 同为 Japanese-style eyedropper + shut-off | 常见 #5 / Opus #10 | Koloro 的小笔尖与较小笔形不能套给 Jazz。 |
| Opus 88 Omar | 不同笔形的大号型号 | 同类滴入式与止墨结构 | 常见 #6 JoWo | 不得把 Omar 的容量直接当 Jazz 精确容量；两者即使同为 #6 也不是同一笔。 |
| Opus 88 Opera | 更高阶、另有 Bock #6 资料线索的型号 | 同品牌止墨滴入路线 | 常见 Bock 250/#6 资料 | 不把 Opera 的笔尖 housing、装饰或售价版本塞给 Jazz。 |

## 可直接用于页面的事实骨架

### 1. 定位与外观

2021 年的专业评测一致把 Jazz 描述为 Opus 88 较传统、全尺寸的雪茄形设计：圆润端头、渐收笔杆和明显笔帽；这与 Demo/Koloro 的外观语汇不同。Pen Addict 将它与 Demo、Fantasia、Koloro 并列后，明确把 Jazz 归为更传统的 full-size pen；Pencilcase Blog 也称它是品牌当时最“classic”的一类设计。

页面可自然地写：它的价值不在“又一支透明滴入笔”，而在把 Opus 88 的大墨仓和止墨结构放进了更接近传统雪茄笔的外形。应避免营销式的“优雅、极致、重新定义”等空泛词。

### 2. 上墨与止墨阀：应解释，而非神化

Jazz 是**手动滴入式**，不是活塞、真空或墨囊/转换器笔。正常步骤是旋下握位/前段，借随笔滴管或钝头注射器向笔杆加墨，再装回；尾端旋钮控制的是笔杆与笔舌之间的止墨阀，而不是用来抽墨的活塞。

这个结构的用户意义应准确写成：

1. 写长篇前可打开或略开阀门，让墨水持续供给笔舌；
2. 携带、长期收纳或飞机旅行前关阀可缩小笔舌侧可用墨量，并降低因温差/气压造成的渗漏风险；
3. 阀门关闭后，前端剩余的墨仍能写一段，具体页数、是否会断墨取决于笔尖宽度、墨水、书写方式和余墨，不能承诺固定页数；
4. 它不能保证“绝不 burp / 绝不漏墨”。大容量 eyedropper 在笔身升温、墨量很低或阀长期全开时仍可能有流量变化；阀门是管理工具，而非绝对保险。

官方可访问的通用 quick-start 说明（由经销商托管的 Opus 88 指引 PDF）也给出“开阀、旋下前段、用滴管加墨、装回”的操作顺序。页面中不要建议用户为了清洗而自行拆止墨阀总成；旧资料提到该操作需要专用扳手，除非后续获得官方对应手册，否则只写常规冲洗。

### 3. 规格：保留证据等级与版本边界

可使用的首发期交叉资料给出：

| 项目 | 可写的谨慎表述 | 证据与边界 |
| --- | --- | --- |
| 带帽长度 | 约 **151.2 mm** | Penquisition / Pengeek13 与零售目录相符；应标为早期/常见 Jazz 版本。 |
| 套帽长度 | 约 **174 mm** | Penquisition 的评测数值；套帽很长，适合只作信息，不鼓励当成默认书写方式。 |
| 最大直径 | 约 **15.2 mm** | Penquisition 的评测数值；不要误写为握位直径。 |
| 重量 | 约 **28 g** | Penquisition 与 Pencilcase Blog 相符的首发期量级；不同材质/饰件可能不同。 |
| 笔尖 | stainless-steel **#6 JoWo**，常见 EF/F/M/B/1.5 stub 选择 | 首发期评测与零售目录支持；不能替代对某一具体二手笔的实物核对。 |
| 容量 | “大容量滴入式墨仓”，**不放单一精确值** | 专业资料一处称 close to 2 ml，另一处称约 3 ml；若无 exact SKU 的厂家说明书，正文不裁决。 |
| 材料 / 可见墨量 | 树脂或 acrylic 主体；若为透明/半透明 SKU，有可见墨量区域 | 不同 Jazz（原始半透明配色、Clear、Holiday Clear、Solid Black 等）表面/透明度与饰件不同。 |

### 4. 版本与命名

资料显示 Jazz 至少有以下可辨认的**表面或饰件版本**，但它们不是新的笔形：早期半透明/双色配色、Transparent/Clear、Holiday Clear（磨砂或暗色饰件）、Solid Black。每一个页面或图像的标题都必须明确对应的版本名称；不使用一张 Holiday Clear 的照片给“Jazz”泛称当实物代表。

页面的版本段落可写：“本文以 2021 年 Jazz 本体为中心，透明、磨砂、配色与饰件版本可能在零售命名、可选笔尖和图像上不同；购买二手品时应要求笔帽、笔杆和尾阀的实拍，而不是只根据‘Jazz’二字下单。”

不要声称 Jazz 目前仍在售、所有颜色仍可订，除非实施时取得当前官方或可信经销商的 live listing；2021 年的资料只证明其当时发布/销售。

## 使用、维护与选购段落建议

### 使用与清洗

- 首次加墨或换墨：先开阀、旋下前段，以普通钢笔墨水加注；装回后让阀门打开，等待笔舌润湿。若只短写，可按实际流量调节阀门，不把“必须全开”写死。
- 换色：倒出余墨，反复以清水冲洗前段、笔杆和笔舌；透明/半透明树脂更容易显示残色，因此深色、高饱和或亮片墨会增加清洗成本。
- 长期收纳与移动：清洗、晾干、关阀；航空旅行优先排空，不把关阀视作可带满墨上飞机的承诺。
- 不将 India ink、丙烯墨、绘图墨或可能沉积的重颜料墨写成推荐选项。普通钢笔墨也应按具体墨水可清洗性选择。
- 不建议自行拆尾阀总成、硬拧 O-ring 或以大量硅脂“堵漏”；如遇密封问题，应先查该批次说明或咨询品牌/经销商。

### 购买判断

适合：想长时间写作、能接受瓶装墨和滴入操作、希望在传统雪茄外形中得到大容量的人。相较普通墨囊笔，它减少反复补墨；相较 Demo/Koloro，它的决定因素是外观与握感，而不是“更高级”。

不一定适合：每天只作几行随手笔记、很在意快速开合（评测记录约 3.5 圈开帽）、不愿做换墨清洁、或只想用墨囊的人。套帽会显著增大长度和后部重量，建议以不套帽为默认，并把个人手型差异保留给试写。

二手检查清单：确认笔帽螺纹、前段 O-ring、尾端阀钮是否顺畅；拍摄开阀/关阀、笔尖与 feed、笔杆内壁和明显染色；确认实物是 Jazz 而不是 Omar/Demo/Koloro；询问笔尖 unit 是否仍为原装 JoWo #6。松动尾环、裂纹或自行换笔尖不是“正常版本差异”，需在交易描述中单独交代。

## 图片策略

1. 优先下载**同一版本、同一配色的官方/品牌授权产品图**，并记录源 URL、产品 SKU/标题、抓取日。若页面写的是 `Jazz Holiday Clear`，图注必须同样写 `Holiday Clear`。
2. 无法取得 current/exact 图时，用项目原创的结构示意图，图内及媒体 attribution 写清 **“示意图，非产品照片”**；可以画雪茄形笔身、尾阀、止墨位置和 #6 笔尖，但不要伪造 logo、纹理或配色。
3. 绝不使用 Demonstrator、Koloro、Omar 或 Opera 的照片作为 Jazz 正面主图；它们只可在“相邻型号”文内以清晰标题的链接/对照图片出现。
4. 二手照片只用于识别或使用者经验，不作为现行产品视觉规范，也不取代品牌图。

## 进入实现前：只可在 disposable checkpoint 执行的身份核验

实现者应在 owned checkpoint（不是 `data/fpkg.db`）逐项查询并记录结果：

1. 查询 `Opus 88 Jazz`、`Jazz`、`opus-88-jazz` 及可能中文别名，确认是否已有 raw pen、article 或 duplicate；记录 ID、type、slug、status、正文、图片、source/relation。
2. 核验该条目是否由 Opus 88 品牌唯一 `made_by` 指向；品牌页面公开后反向列表必须同时包含已公开的 Demonstrator、Koloro 和 Jazz，不能只保留新建的 Jazz。
3. 如已存在 `Jazz` raw：逐项检查其图片、笔尖、长度、填充信息是否误取自 Demo/Koloro/Omar。若混名，创建明确的 retirement/reconciliation 决策；不得从 `opus-88-demo-kolora` 建 redirect。
4. 如不存在：新增 Opus 88 Jazz 品牌关系和独立 slug；不要以猜测的旧 slug 建 redirect。
5. 搜索 `Holiday Clear`、`Transparent`、`Solid Black` 等是否是独立商品、配色 alias 还是错误 duplicate。除非每个版本均有独立证据、正文和图，否则作为 Jazz 版本说明，不额外发布空壳 entity。
6. 执行内容包前后检查：品牌页中的公开型号链接可达；Jazz 的正文、来源、图像 attribution 都存在；replay 为 noop；真实主 catalog main/WAL/SHM 快照不变。

## 可靠来源清单（本次访问：2026-07-20）

| 证据等级 | 用途 | 来源 | URL |
| --- | --- | --- | --- |
| 专业实测 / 首发期资料 | 尺寸、重量、#6 JoWo、尾阀、开帽圈数、加墨流程 | Penquisition / Pengeek13, *OPUS 88 Jazz Fountain Pen*（2021-05-12） | https://penquisition.com/blog/2021/05/12/opus-88-jazz-fountain-pen |
| 专业评测 | 雪茄形定位、与 Demo/Omar 的容量/尺寸比较、约 3 ml 的**单一评测**数字、Jazz Clear 与 Holiday Clear | The Pencilcase Blog, *Review: Opus 88 Jazz Demonstrator Fountain Pen*（2021-05-21） | https://www.pencilcaseblog.com/2021/05/review-opus-88-jazz-demonstrator.html |
| 专业评测 | 传统全尺寸定位、约 2 ml 的**另一评测**数字、与 Demo/Koloro 对照 | The Pen Addict, *Opus 88 Jazz Fountain Pen Review*（2024-01-31） | https://www.penaddict.com/blog/2024/1/31/opus-88-jazz-fountain-pen-review |
| 专业编辑资料 | Omar/Jazz 的标准 JoWo No. 6 unit、同品牌产品线比较 | The Gentleman Stationer, *Workhorse Pens: Opus 88 Fountain Pens Offer Maximum Versatility*（2021-10-16） | https://www.gentlemanstationer.com/blog/2021/10/16/workhorse-pens-opus-88-fountain-pens-offer-maximum-versatility |
| 可靠零售目录 | Holiday Clear 的 #6 JoWo 与版本标题交叉核验 | Appelboom, *Opus 88 Jazz Holiday Clear Fountain Pen* | https://appelboom.com/opus-88-jazz-holiday-clear-fountain-pen/ |
| 通用使用说明（经销商托管） | 打开止墨阀、旋下前段、滴管加墨的操作顺序；不得当作 Jazz 专属规格页 | Opus 88 Eyedropper Fountain Pen Instructions PDF | https://feedbackfromalex.com/wp-content/uploads/2025/07/Opus88QuickStart.pdf |
| 社区视角，非规格证据 | 用户对 valve、套帽和 #6 可替换性体验；只作为“使用者报告” | r/fountainpens, *One month later... Opus 88 Jazz Holiday* | https://www.reddit.com/r/fountainpens/comments/ny4nhq/ |

## 给实现者的最小交付清单

1. 先完成 checkpoint 身份核验，再决定新建、修正或合并；不得直接猜 ID、关系或 redirect。
2. 发布 Jazz 时同步修正 Opus 88 品牌反向型号列表，保留 Demo 与 Koloro 的既有独立身份。
3. 正文至少覆盖：雪茄形定位、手动滴入/止墨阀、规格与容量争议、版本边界、维护、安全携带与二手检查；所有精确数字写明版本/来源边界。
4. 图片仅用 exact Jazz SKU 的产品图，或标记“示意图，非产品照片”的原创视觉；禁止近似型号替图。
5. 定向 checkpoint 回归需断言：Jazz 不与 Demo/Koloro/Omar 共用 entity；不存在旧 mixed route 到 Jazz 的 redirect；品牌公开页列出全部已公开 Opus 88 型号；真实 catalog 快照不变且 replay `noop`。
