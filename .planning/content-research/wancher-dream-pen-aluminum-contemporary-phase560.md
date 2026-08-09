# Wancher Dream Pen Aluminum Contemporary：玫瑰金铝身的具体型号边界

## summary

Wancher Dream Pen Aluminum Contemporary 是 Dream Pen 下独立的玫瑰金铝制型号，使用 #6 JoWo 镀色不锈钢尖、EF/F/M/B、欧规供墨和气密帽；官方店铺列出 152.5 mm、15.3 mm、41 g。它与 Classic 同属集合，但不是同一型号。

## body_md

## 先把名称读完整：Contemporary 是独立商品，不是 Classic 的换色页

Dream Pen 是 Wancher 的系列入口，下面同时有乌木、树脂、铝、钛、漆艺和其他材料路线。**Dream Pen Aluminum Contemporary** 是官方商品页上的完整型号：Dream Pen 表示系列位置，Aluminum 表示笔身材料路线，Contemporary 表示玫瑰金色版本。官方还把 **Dream Pen Aluminum Classic** 单列为金色商品。两款轮廓相近、规格也有共同部分，但在官方 Aluminum 集合里是两张产品卡；知识图谱应保留两个型号实体，不能把它们合成一个“Dream Pen Aluminum”条目再用颜色字段代替身份。

这一区分对购买和二手核验都很实际。商品 JSON 的 `handle` 是 `dream-pen-aluminum-contemporary`，四个变体的 SKU 以 `WF-DREAM-ALU-RG-` 开头；日本 Wancher 官方店铺则使用商品编号 `WF-DREAM-ALU-RG`。如果页面只写 Dream Pen Aluminum，没有 Contemporary 或 RG 后缀，不能靠照片里的暖色反光判断版本。金色 Classic 的 `WF-DREAM-ALU-GL-` 也不能因为尖幅同为 M 或 B 就回填到本页。

官方英文页面在本次核验时显示 `$400.00 USD` 和 Sold out。售罄是访问时的库存状态，不是停产、限量数量或二手稀有度证明；价格、币种、税费、折扣和库存都会随地区和时间变化。产品 JSON 记录商品 ID `8096543015127`，`created_at` 为 2023-07-31、`published_at` 为 2023-08-01（日本标准时间）；这是当前电商目录元数据，不足以证明全球首发日或 Kickstarter 的完整历史。

## 铝制笔身与玫瑰金外观：记录材料，避免把颜色写成贵金属

Wancher 官方说明把这款笔描述为把铝材料带入 Dream Pen 造型的尝试。品牌强调铝相对许多制笔金属较轻，整支笔身采用铝材，刚拿起时可能带有金属的凉感，之后随手部热量变暖；这是官方的材料与热传导说明，不是编辑部对不同环境、握持时间或书写姿势的实测结论。对长时间书写是否舒适，仍应把温度、握径、帽体和重心作为到手后需要核对的项目。

Contemporary 的颜色故事是玫瑰金。官方页面把它和 Classic 的传统金色分开描述：玫瑰金在十九世纪以后成为一种与现代艺术、浪漫和女性气质相关的色彩。这个品牌叙述只能解释命名语境，不能推出笔身含金或使用贵金属。规格写的是 **Base material: Aluminum**；因此本页只称“铝制笔身、玫瑰金色外观”，不写成金制、整笔镀金或贵金属收藏品。

当前英文产品页没有公布铝材牌号、阳极氧化或其他表面处理工艺的工程名称，也没有给出涂层厚度、耐磨／盐雾测试、颜色色号或批次差异。商品照片的高光、反射和屏幕渲染不应当作颜色校样。日常若只需去除指纹，可用干净柔软布轻拭；因为表面处理范围未被官方说明，不建议自行使用金属抛光膏、酸性清洁剂、研磨剂或含溶剂清洁剂。

Wancher 官方 Rakuten 店铺给出更具体的尺寸口径：未使用时长度 152.5 mm，最大直径 15.3 mm，重量 41 g。这三个数字应连同“未使用时”“最大直径”和店铺规格表一起理解，不能改写成合盖、未合盖、插帽后的全部长度，也不能把最大直径当握位直径。41 g 是官方店铺列出的产品重量，并非本项目的手持称重；购买前若在意重量，应确认是否含转换器、墨囊或其他配件，再用自己的电子秤复核。

## 笔尖与 SKU：四个尖幅属于一个 Contemporary 型号

官方规格把笔尖写为 `#6 Jowo stainless steel plated in Gold and or Rose Gold`。Contemporary 的外观与玫瑰金路线相配，但这句话描述的是 JoWo 不锈钢尖的镀色语境，不是 14K 或 18K 金尖。产品页提供 EF、F、M、B 四个订单选项，产品 JSON 给出四个具体 SKU：

- `WF-DREAM-ALU-RG-EF`
- `WF-DREAM-ALU-RG-F`
- `WF-DREAM-ALU-RG-M`
- `WF-DREAM-ALU-RG-B`

它们应作为同一型号的 `market_sku` 变体，而不是四张型号页。EF、F、M、B 是商品选项名称，不能直接换算为某一地区统一毫米线宽，也不能从其他 JoWo #6 页面借入弹性、出墨量或纸面表现。官方当前资料也没有给出尖片厚度、铱粒规格、出厂线宽公差或每支笔的调校记录；到手后应以订单尖幅和实际尖片刻字为准。

产品说明同时列出 `plastic`、`ebonite black`、`ebonite red` 三种 feed 语境。这个列表说明 Wancher 的 Aluminum 路线存在不同 feed 材料／颜色组合，但页面没有把每个尖幅和某个 feed 一一绑定。本页因此只记录官方列表，不把 EF、F、M、B 各自硬配一种 feed。若要更换尖组或 feed，应先确认当前配置、螺纹和帽内间隙，不能因“#6”看起来通用就默认所有 aftermarket 单元都能无损互换。

## 供墨和气密帽：欧规路径清楚，但不是 eyedropper 承诺

官方规格写明 `Converter or Cartridge (European International Standard)`，也就是转换器和欧洲国际标准墨囊二选一。日本官方店铺的附件清单列出 converter、cartridge、保证书、说明书和专用桐箱，但具体订单、市场和库存仍应以销售页面为准。当前资料没有授权把铝制笔身当作 eyedropper 使用，故本页不把整笔灌墨列为推荐方案。

换色或长期收纳时，可以先取下墨囊或转换器，用室温清水短时吸排，待水色明显变淡，再让握位、feed 和尖部自然干燥。清洁供墨系统不等于把整支铝笔长时间浸泡。若出现启动慢、漏墨或帽内积墨，应先检查墨囊／转换器是否坐稳、尖端是否有干墨，再按 Wancher 通用护理页处理；不要为了追求快出墨而硬拧尖座或用工具夹金属表面。

官方列出 `Compact air-tight cap`，用途是帮助减少墨水过早干燥。它是帽内结构和设计目标，不是“永不干墨”的保证。长时间不写、墨水残留、帽口污染、气温变化和未完全旋紧都可能影响启动。存放时应把笔清空、擦干并旋紧帽，若准备长时间不用，优先按通用护理页清空转换器和供墨路径。

## 41 g 与 JSON 的 `weight: 200`：保留字段口径，不强行合并

Wancher 官方 Rakuten 店铺把 Contemporary 的重量列为 41 g；官方产品 JSON 的四个变体则带有 `weight: 200`。这两个数字不能并列写成“官方测得两种重量”。JSON 的 weight 是电商变体元数据，页面没有说明它是裸笔、含转换器、含包装还是模板运输值；Rakuten 的 41 g 出现在笔尖、尺寸、材质和附件的规格清单中，口径更接近产品重量。

本页把 41 g 作为有明确店铺规格表位置的重量，把 JSON 的 200 记录成未解释目录元数据，不用它改写手持重量。这样做不是挑一个“看起来合理”的数字，而是让读者知道两个来源的字段并不等价。以后若拿实物称重，应记录日期、是否含帽、是否含墨和是否装转换器；个人复核可以新增为用户观察，不应覆盖厂商字段。

## 2023 目录元数据、当前库存与日本店铺：不要猜发行史和全球 MSRP

产品 JSON 的创建和发布时间分别为 2023-07-31 与 2023-08-01，商品标题、handle、变体、图片和价格字段也都可供目录追踪。它能说明 Contemporary 至少在 Wancher 当前电商目录中留下了这段发布时间元数据，但没有说明各地区上架日、Kickstarter 关系、生产批次或是否曾经停产。因此正文把 2023 写作“官方产品 JSON 的创建／发布元数据”，不把它包装成完整全球发行史。

当前英文站页面显示 $400 USD 和 Sold out；日本官方店铺搜索结果显示该商品编号为 `WF-DREAM-ALU-RG`，价格为日元并列出 EF/F/M/B、欧规转换器／墨囊、152.5 mm、15.3 mm、41 g 及桐箱等附件。不同站点的币种、税费和可售状态不能拼成固定 MSRP；国际订单还应读 Wancher 的 Duties & Taxes 说明，销售税、关税、经纪费和目的地税费不包含在一个页面数字的普遍结论里。

如果从二手渠道寻找，应同时核对商品全名、玫瑰金外观、`WF-DREAM-ALU-RG` 或四个 RG 尖幅 SKU、尖身刻字、转换器／墨囊、保证书、说明书和桐箱。只看到“Dream Pen Aluminum”或一张反光严重的照片，不能证明是 Contemporary。售罄也不能自动证明绝版、限量或价格必然上升。

## Classic 与 Contemporary：共同点用于导航，差异用于身份

两者都属于 Wancher 的 Dream Pen Aluminum 路线，都出现铝制笔身、欧规供墨、JoWo #6 语境、EF/F/M/B 选项和 Compact air-tight cap。官方 Aluminum collection 仍把它们列为两个产品；关键身份差异是 Classic 的金色与 Contemporary 的玫瑰金色，目录编号也分别使用 `GL` 与 `RG`。知识图谱应让两个实体共享系列与品牌导航，但各自保留产品 JSON、SKU、来源和媒体，不复制成一个“颜色变体”字段。

这个边界也意味着，Classic 的 41 g、152.5 mm、15.3 mm 不能因为数值相同就成为 Contemporary 的无来源继承；本页的数字来自 Contemporary 对应的官方 Rakuten 商品详情。相反，产品页的共同规格可以在各自来源中重复记录，但不能把 Classic 的金色说明写到玫瑰金页面，更不能把别的 Dream Pen 材料路线的维护要求混回来。

独立的 Kami to Pen 文章评测的是 Wancher Dream Pen Titanium Black，不是 Aluminum Contemporary。它可以作为相邻金属路线的专业二级资料，提醒读者比较金属笔时要核对重心、帽体和表面处理；文章中的 Titanium 尺寸、重量和书写感不能回填本型号。没有 Contemporary 的独立长期评测时，本页不声称“长时间一定不累”“玫瑰金一定不掉色”或“比 Classic 更平衡”。

## 适合谁：先接受金属触感，再决定玫瑰金外观是否值得

如果你想要 Dream Pen 的雪茄形轮廓，但不想选乌木、树脂或漆艺路线，Contemporary 提供了一个明确的全铝、玫瑰金外观入口。欧规墨囊／转换器让补墨路径容易理解，EF/F/M/B 也覆盖了常见订单选择，官方 41 g 规格可以作为携带感的核对起点。铝材初触偏凉、表面反光容易显出指纹和划痕，这些都应被视为金属路线的使用预期，而不是隐藏缺陷。

如果你需要很轻的塑料笔、对金属温度敏感、只接受金尖、偏好柔软的漆面，或希望得到日本细尖的线宽感，Contemporary 可能不是第一选择。购买前可按自己的纸张和墨水，把尖幅、握径、最大直径、裸笔重量、是否插帽、帽体触感和清洁方式列成清单，再和 Aluminum Classic、True Ebonite 或其他 Dream Pen 路线逐项比较。型号页只给有来源的事实，不替读者做未验证的书写感承诺。

## 保养与保修：保守处理表面，保留订单证据

Wancher Product Care 提供 converter／cartridge 的清洁路径和不同材质路线的通用提示；当前页面没有给出 Aluminum Contemporary 专属抛光剂、表面处理耐受表或维修拆解图。日常可用柔软干布去除灰尘和指纹，避免长时间浸泡、酸性／研磨性／含溶剂清洁剂以及自行抛光。螺纹、帽口和尖部若有积墨，应先清水短时冲洗可接触的供墨部位，完全干燥后再旋合。

Wancher Warranty 页面说明正常使用下材料和工艺缺陷通常有一年保修，同时排除日常维护、自然磨损、事故、误用、未经授权维修以及非合规墨水或填充物等情况。它是品牌当前保修边界，不等于二手交易自动继承全部原购买权益。出现掉色、白斑、划痕、漏墨或螺纹异常时，先拍照、保留订单和包装，向卖家或 Wancher 确认，不要先用金属工具或研磨膏改变证据。

## 尚未被资料证明的部分：留白是型号质量的一部分

当前资料没有公布铝材牌号、表面处理工程名称、握位直径、合盖／未合盖／插帽长度、帽体重量、转换器容量、EF/F/M/B 的毫米线宽、出厂调校标准和每个 feed 的具体配对。官方店铺的 152.5 mm、15.3 mm、41 g 已经有明确来源，但仍要保留各自的字段口径；产品 JSON 的 `weight: 200` 仍然是未解释元数据。

资料也没有给出 Contemporary 的完整生产数量、每批次配色记录或停产公告。2023 目录元数据、当前售罄和过去的商品页只能支持“曾在目录中销售，当前库存不可保证”，不能写成限量、绝版或停止生产。若将来出现官方目录、维修手册或可信的 Contemporary 独立评测，应按市场、日期和型号重新挂接，不能把 Titanium、Classic 或普通 Dream Pen 的案例改名后回填。

## 到手后的真人核对清单

第一步核对身份：在自然光下确认玫瑰金外观、订单全名、`WF-DREAM-ALU-RG` 或相应尖幅 SKU、尖身刻字，并记录测量 152.5 mm 与 15.3 mm 时是否含帽。第二步核对配置：确认 EF/F/M/B 尖幅、feed 材料／颜色、转换器和墨囊、保证书、说明书与桐箱是否齐全。第三步做低风险书写：使用熟悉的欧规墨囊或转换器、平滑纸和已知墨水，记录启动时间、线条连续性、干湿、刮纸、重心和金属温度变化；一次异常只描述为这支笔的观察，不扩展成整个系列规则。第四步清洁和收纳：按 Wancher 通用护理路径清空供墨，柔软布轻拭，不用溶剂或研磨膏处理玫瑰金表面，保留包装、订单、照片和沟通记录。

这份清单是验收方法，不是已经完成的实测报告。本页没有声称编辑部拥有一支 Aluminum Contemporary，也没有把零售页、JSON 元数据和 Titanium 兄弟型号评论写成第一手体验。证据标签让读者知道哪些是官方商品事实、哪些是官方店铺规格、哪些是目录元数据、哪些只是相邻型号的比较边界。

## 来源边界

Wancher exact product page 负责 Contemporary 标题、铝材说明、玫瑰金／Classic 颜色语境、EF/F/M/B 选项、JoWo 镀色不锈钢尖、feed、欧规供墨、气密帽、当前价格与库存；官方 product JSON 负责商品 ID `8096543015127`、handle、创建／发布元数据、四个 `WF-DREAM-ALU-RG-*` SKU、图片和未解释的 `weight: 200`；Dream Pen 与 Aluminum 集合页负责系列和兄弟型号导航；Product Care 与 Warranty 负责清洁、保养、墨水和保修边界；Wancher 官方 Rakuten 店铺负责 `WF-DREAM-ALU-RG`、152.5 mm、15.3 mm、41 g 和包装清单。

Kami to Pen 的文章评测的是 Titanium Black，不是 Aluminum Contemporary；本页只把它作为相邻全金属型号的专业二级边界，不借用其尺寸、重量、重心或书写结论。页面上的原创 SVG 是 factual diagram，明确标注为非产品照片、非 Logo、不按比例、非颜色校样；它用于解释 Contemporary、四个 RG SKU 与 Classic 的边界，不作库存、价格或实物颜色证明。

## 来源

- [Dream Pen Aluminum Contemporary — Wancher official](https://www.wancherpen.com/products/dream-pen-aluminum-contemporary)
- [Dream Pen Aluminum Contemporary product JSON — Wancher official endpoint](https://www.wancherpen.com/products/dream-pen-aluminum-contemporary.js)
- [Dream Pen collection — Wancher official](https://www.wancherpen.com/collections/dream-pen)
- [Dream Pen Aluminum collection — Wancher official](https://www.wancherpen.com/collections/dream-pen-aluminum)
- [Wancher Product Care Guide](https://www.wancherpen.com/pages/product-care)
- [Wancher Warranty](https://www.wancherpen.com/pages/warranty)
- [Dream Pen Aluminum Contemporary WF-DREAM-ALU-RG — Wancher official Rakuten shop](https://item.rakuten.co.jp/wancher/wf-dream-alu-rg/)
- [Wancher Dream Pen Titanium Black review — Kami to Pen](https://kamitopen.jp/fountain-pen/wancher-dream-pen-titan-fountain-pen/)
