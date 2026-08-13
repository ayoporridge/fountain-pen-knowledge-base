import type { Phase610SemanticPatch } from "./semantic-cleanup-types";

export const phase610GroupAPatches = [
  {
    manifestIndex: 113,
    entityId: "phase598-ikkaku-gradient-urushi",
    brandEntityId: "s59NAHVALUR",
    slug: "ikkaku-gradient-urushi",
    expectedName: "IKKAKU by Nahvalur Gradient Urushi Fountain Pen",
    expectedStoryTitle:
      "IKKAKU by Nahvalur Gradient Urushi Fountain Pen：身份、规格、版本与维护",
    expectedSourceMarker:
      "curated-content:phase598-gradient-sourced-v1:19c5781b06bd926cd96b9e138f788d5ca6d7f1fc4de5f46d283471d6a95972e6",
    expectedBodySha256: "76653c8ae36e612f00a17e5668bef95eaef673d046d7d7c58ad4b37b028aeea8",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "本站因此建立一张 `IKKAKU Gradient Urushi Fountain Pen` 型号页，三色作为 edition-group，再在各自下面记录 F／M 尖幅。这样既保留每色的限量身份，也避免出现三篇结构、维护和历史几乎完全相同的重复正文。只有颜色、商品代码或市场状态等确实不同的字段进入子版本。",
        newText:
          "Gradient Urushi 是一组由 Yan-Zhi、Zhu-Dan 与 Cong-Lü 构成的三色限量系列；每色 20 支，共享 No.6 14K F／M 与 cartridge/converter。三者的差异集中在颜色、商品代码和市场状态，F／M 是各配色下的尖幅选择，而不是三个结构、维护和历史都不同的基础型号。",
        evidenceLocators: ["entity.body_md:L5-L5"],
      },
    ],
  },
  {
    manifestIndex: 118,
    entityId: "phase598-ikkaku-rhinoceros-skin",
    brandEntityId: "s59NAHVALUR",
    slug: "ikkaku-rhinoceros-skin-lacquer",
    expectedName: "IKKAKU by Nahvalur Rhinoceros Skin Lacquer Special Edition Fountain Pen",
    expectedStoryTitle:
      "IKKAKU by Nahvalur Rhinoceros Skin Lacquer Special Edition Fountain Pen：身份、规格、版本与维护",
    expectedSourceMarker:
      "curated-content:phase598-rhinoceros-sourced-v1:74455f5ef57838457ef1082579d45d4002b3629430e49ebb6eff04968d8f6582",
    expectedBodySha256: "f0981cd0c3790d31349e6e7534b58f658d71301b41e986217a3430dc7d8d9e56",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "IKKAKU Rhinoceros Skin Lacquer Special Limited Edition 由两个正式 edition 构成：Qian-Tan 浅滩与 Shen-Hai 深海。Pen Chalet 将两者放在同一商品系列，Chatterley 则保留两张独立历史实物页。本站建立一张系列型号页，再把浅滩和深海作为 edition-group，避免把共享工艺、尺寸和维护内容复制成两个基础型号。",
        newText:
          "IKKAKU Rhinoceros Skin Lacquer Special Limited Edition 由两个正式 edition 构成：Qian-Tan 浅滩与 Shen-Hai 深海。Pen Chalet 将两者放在同一商品系列，Chatterley 则保留两张独立历史实物页。两者共享工艺、尺寸和维护方式，差别主要在具体漆色与实物身份，因此应视为同一系列下的两个正式版本。",
        evidenceLocators: ["entity.body_md:L3-L3"],
      },
      {
        oldText:
          "这类处理不是“资料不完整所以随便写”，而是保留冲突本身。知识图谱会让两个 asserted value 都连接各自 citation，并明确不让未决数字进入确定规格。",
        newText:
          "两份资料的冲突应原样保留：每个数值只在对应来源的范围内成立；争议未解决前，不把其中任何一个写成确定规格。",
        evidenceLocators: ["entity.body_md:L15-L15"],
      },
      {
        oldText:
          "若实物只写 Qian-Tan 或 Shen-Hai 而没有系列长名，也应通过盒证、漆纹和销售记录回连 Rhinoceros Skin Lacquer；不要因页面结构不同，把同一 edition 再建成第三个重复实体。",
        newText:
          "若实物只写 Qian-Tan 或 Shen-Hai 而没有系列长名，也可通过盒证、漆纹和销售记录识别其 Rhinoceros Skin Lacquer 身份；页面结构不同并不意味着同一 edition 又多出第三种型号。",
        evidenceLocators: ["entity.body_md:L39-L39"],
      },
    ],
  },
  {
    manifestIndex: 123,
    entityId: "phase598-ikkaku-yu-tu",
    brandEntityId: "s59NAHVALUR",
    slug: "ikkaku-yu-tu",
    expectedName: "IKKAKU by Nahvalur Yu-Tu Jade Rabbit Urushi Fountain Pen",
    expectedStoryTitle:
      "IKKAKU by Nahvalur Yu-Tu Jade Rabbit Urushi Fountain Pen：身份、规格、版本与维护",
    expectedSourceMarker:
      "curated-content:phase598-yuTu-sourced-v1:aabd81b9dc5da63dc6edca27b7bf8eaf1074731db1f7a91643e900baed6e4baf",
    expectedBodySha256: "bdcc2245be9b442102f7b7d05a04a38d48b075de77bf6cfa2e8e28ce1cf492ec",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Yu-Tu 玉兔是 IKKAKU by Nahvalur 的历史漆艺型号。旧 Shopify 商店索引保留完整商品名 `IKKAKU by Nahvalur 玉兔 Yu-Tu (Jade Rabbit) Urushi Pen`，并显示 Fine、Medium 两个选项；英国专业二手商 St John's Pens 的 sold-out archive 也保留同名实物记录。两条独立商业档案足以证明这支笔曾公开存在，不应因官网下架就从知识图谱消失。",
        newText:
          "Yu-Tu 玉兔是 IKKAKU by Nahvalur 的历史漆艺型号。旧 Shopify 商店索引保留完整商品名 `IKKAKU by Nahvalur 玉兔 Yu-Tu (Jade Rabbit) Urushi Pen`，并显示 Fine、Medium 两个选项；英国专业二手商 St John's Pens 的 sold-out archive 也保留同名实物记录。两条独立商业档案足以证明这支笔曾公开存在，官网下架并不等于这一型号不存在。",
        evidenceLocators: ["entity.body_md:L3-L3"],
      },
      {
        oldText:
          "全量知识图谱不仅要收录官网当前商品，也要保留有可靠存在证据的历史型号。删除 Yu-Tu 会让 IKKAKU 的早期产品史出现空洞；编造完整规格则会制造更严重的问题。当前页面采取可升级结构：先锁定身份和来源，未知字段明确留空，未来获得盒标或目录后再补证据。",
        newText:
          "可靠资料目前只足以确认 Yu-Tu 的历史身份与来源，具体规格仍有空白。官网不再展示不应抹去它在 IKKAKU 早期产品史中的位置，同样也不能用推测填满规格；未知项目应明确标为未公布，等待盒标、目录等一手材料补证。",
        evidenceLocators: ["entity.body_md:L35-L35"],
      },
      {
        oldText:
          "未来补全时，优先级依次是 Nahvalur 旧商品快照或目录、原盒标签与保修卡、同期授权零售商品页，最后才是持有者回忆。新增证据还要与具体 variant 和检索日期绑定，不能用一张无来源照片一次性填满所有空白规格。",
        newText:
          "核对 Yu-Tu 时，Nahvalur 旧商品快照或目录、原盒标签与保修卡、同期授权零售商品页的证明力依次高于持有者回忆。任何新增规格都应能对应具体版本、来源和检索日期；一张无来源照片不足以填满所有空白。",
        evidenceLocators: ["entity.body_md:L39-L39"],
      },
    ],
  },
  {
    manifestIndex: 189,
    entityId: "phase596-nahvalur-horizon",
    brandEntityId: "s59NAHVALUR",
    slug: "nahvalur-horizon",
    expectedName: "Nahvalur Horizon Fountain Pen",
    expectedStoryTitle: "Nahvalur Horizon：珠光树脂、传统墨窗与 Soleil 五个当前 SKU",
    expectedSourceMarker:
      "curated-content:phase596-nahvalur-horizon-v1:949dcc28c2b151d92a371a013477ce1aebe4c93d0cffd5ff25e7369ce81986fa",
    expectedBodySha256: "406e87317d3c614438ce47ac4416886475e87b92cf9b6a1401783c9d8679b7da",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Gaia 页给出的公称长度约为合帽 153 mm、开帽 137 mm、后插 168 mm，并列出透明墨窗、活塞和品牌自制钢尖。该 exact handle 的 Shopify JSON 已不再提供当前商品数据，因此本站将它当作历史／档案 edition，不给 Gaia 建造“当前可售”SKU。",
        newText:
          "Gaia 页给出的公称长度约为合帽 153 mm、开帽 137 mm、后插 168 mm，并列出透明墨窗、活塞和品牌自制钢尖。该 exact handle 的 Shopify JSON 已不再提供当前商品数据，因此 Gaia 只能确认为历史／档案 edition，不能描述成当前可售选项。",
        evidenceLocators: ["entity.body_md:L11-L11"],
      },
      {
        oldText:
          "2026-08-11 的官方 collection 列出 Pride 2026、Pearl、Nebula、Soleil。Shopify 当前数据中，前三款各六个完整 SKU 全部 unavailable；Soleil 的 Fine `07120111`、Medium `07120112`、Broad `07120113`、Stub `07120114`、Double Broad `07120117` available，Extra Fine `07120110` unavailable。本站因此只把五个 Soleil 组合写成 current market SKU，另外十九个完整代码留在 unavailable evidence。价格和库存会变化，这一结论只对应检索日。",
        newText:
          "2026-08-11 的官方 collection 列出 Pride 2026、Pearl、Nebula、Soleil。Shopify 当前数据中，前三款各六个完整 SKU 全部 unavailable；Soleil 的 Fine `07120111`、Medium `07120112`、Broad `07120113`、Stub `07120114`、Double Broad `07120117` available，Extra Fine `07120110` unavailable。检索日只有五个 Soleil 尖幅可下单，另外十九个完整代码均属 unavailable 记录；价格和库存变化后需要重新核对。",
        evidenceLocators: ["entity.body_md:L15-L15"],
      },
      {
        oldText:
          "Horizon collection 同时展示 Pride 2026、Pearl、Nebula 与 Soleil，只能证明这些 edition 被纳入当前集合页。真正判断检索日是否可下单，还要查看每个 variant 的 `available` 状态。本站保存十九个 unavailable 完整代码，是为了让未来核对有明确边界，不把它们删除，也不把它们伪装成 current SKU。",
        newText:
          "Horizon collection 同时展示 Pride 2026、Pearl、Nebula 与 Soleil，只能证明这些 edition 被纳入当前集合页。真正判断检索日是否可下单，还要查看每个 variant 的 `available` 状态；十九个 unavailable 完整代码可用于核对旧货和后续变化，但不能被当成 current SKU。",
        evidenceLocators: ["entity.body_md:L25-L25"],
      },
    ],
  },
  {
    manifestIndex: 193,
    entityId: "s59NAHVALUR_OP",
    brandEntityId: "s59NAHVALUR",
    slug: "nahvalur-original-plus",
    expectedName: "Nahvalur Original Plus（原 Narwhal）",
    expectedStoryTitle: "Nahvalur Original Plus：从 Narwhal Original 活塞到真空填充",
    expectedSourceMarker:
      "curated-content:phase59-original-plus-v1:3cfce9bfe6496b4eb7f1c237965d777d5622e887227fe54f30235c47fcaf41f6",
    expectedBodySha256: "9c45cb1f34b43be678074be85d160ea80e144ecb59881c204a5397fa3c867b17",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "透明 barrel 让墨量和气泡可见，也会暴露树脂划痕、墨水染色与光线反射。产品图只用于识别结构，颜色和透明度仍以实物为准。Original Plus 与 Schuylkill 的反向链接应保持清晰：前者是真空填充和透明杆，后者是传统活塞和不透明专属树脂；Narwhal 旧刻字只是品牌过渡证据。这样用户能从品牌页直接进入正确型号，而不会因同一鱼类命名误入另一种供墨系统。",
        newText:
          "透明 barrel 让墨量和气泡可见，也会暴露树脂划痕、墨水染色与光线反射。产品图只用于识别结构，颜色和透明度仍以实物为准。Original Plus 采用真空填充和透明杆，Schuylkill 则是传统活塞和不透明专属树脂；Narwhal 旧刻字只是品牌过渡证据。识别时应从供墨结构和笔杆透明度入手，不要因同属鱼类命名而误认型号。",
        evidenceLocators: ["entity.body_md:L27-L27"],
      },
    ],
  },
  {
    manifestIndex: 195,
    entityId: "phase597-nahvalur-pen-of-year-horse-2026",
    brandEntityId: "s59NAHVALUR",
    slug: "nahvalur-pen-of-the-year-horse-2026",
    expectedName: "Nahvalur Pen of the Year: Horse 2026 Fountain Pen",
    expectedStoryTitle: "Horse 2026：黑金 bronze 年度笔、999 零售证据与六个售罄代码",
    expectedSourceMarker:
      "curated-content:phase597-nahvalur-horse2026-v1:e9734f9c82a2b6183fb943fc68c8f263ed28b42daff00ef5029439cdbe080230",
    expectedBodySha256: "44d137c5346469787d9c31f44c93b7db9984aff030c02c667c0dc021def37b98",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "本次复核于 2026-08-11 读取官方商品 JSON：Extra Fine、Fine、Medium、Broad、Stub、Double Broad 六个变体全部 `available=false`，页面也逐项显示 Sold out。本站据此将 Horse 标为官方页面存在但当前售罄，不创建 available market-SKU child。未来若官网重新上架，必须重新读取 selector；不能因为 HTML 还在就继续写 current available。",
        newText:
          "2026-08-11 读取的官方商品 JSON 显示：Extra Fine、Fine、Medium、Broad、Stub、Double Broad 六个变体全部 `available=false`，页面也逐项标为 Sold out。这只能证明 Horse 在检索日有官方商品页但六个尖幅均已售罄；HTML 仍可打开不等于当前有货，下单前需重新核对每个选项的状态。",
        evidenceLocators: ["entity.body_md:L9-L9"],
      },
      {
        oldText:
          "黑金树脂的纹理会因浇注位置和切削方向变化。Atlas 将材料称 acrylic，官网写 resin；两者在零售语境可能指向相近透明聚合物，但数据库不能自行判定化学组成完全相同。canonical 规格采用官方 “resin”，同时把零售 “acrylic” 留作描述差异。商品图和实物受光线影响，买家应要求自然光转动视频，而不是以单张宣传图判断金色比例。",
        newText:
          "黑金树脂的纹理会因浇注位置和切削方向变化。Atlas 将材料称 acrylic，官网写 resin；两者在零售语境可能指向相近透明聚合物，但现有资料不足以断言化学组成完全相同。材料以官方 “resin” 为主要口径，Atlas 的 “acrylic” 作为零售描述差异保留。商品图和实物受光线影响，买家应要求自然光转动视频，而不是以单张宣传图判断金色比例。",
        evidenceLocators: ["entity.body_md:L17-L17"],
      },
      {
        oldText:
          "这组数据不能证明六个代码各自同时代表钢尖和 14K，也不能证明另有未公开的金尖代码。本站把六个代码记录为 sold-out selector evidence，不建立 current child；14K 只作为官方正文确认过的配置可能性。若二手卖家声称 14K 出厂版，应核对笔尖刻印、盒标、订单、原始发票和具体商品代码。",
        newText:
          "这组数据只能证明检索日存在六个售罄尖幅代码，不能证明每个代码同时代表钢尖和 14K，也不能证明另有未公开的金尖代码。14K 只是一种由官方正文确认过的配置可能性；若二手卖家声称是 14K 出厂版，应核对笔尖刻印、盒标、订单、原始发票和具体商品代码。",
        evidenceLocators: ["entity.body_md:L23-L23"],
      },
      {
        oldText:
          "本站采用官方 exact-product 的 149/133 mm 与 36.85 g 作为 canonical 值，同时保存 Atlas 的 150/131 mm 与 31 g 冲突，不平均、不删除。对于具体二手样品，最好让卖家用尺和电子秤重新测量，并说明是否含墨、是否装笔尖和内件。官方规格回答“品牌怎么定义”，实测回答“这一支现在是什么状态”，两者用途不同。",
        newText:
          "官方 exact-product 的 149/133 mm 与 36.85 g 可作为品牌公称规格，Atlas 的 150/131 mm 与 31 g 则是需要单独说明的冲突数据，不能平均或删去。对于具体二手样品，最好让卖家用尺和电子秤重新测量，并说明是否含墨、是否装笔尖和内件。官方规格回答“品牌怎么定义”，实测回答“这一支现在是什么状态”，两者用途不同。",
        evidenceLocators: ["entity.body_md:L31-L31"],
      },
    ],
  },
  {
    manifestIndex: 199,
    entityId: "s59NAHVALUR_SCHUYLKILL",
    brandEntityId: "s59NAHVALUR",
    slug: "nahvalur-schuylkill",
    expectedName: "Nahvalur Schuylkill（原 Narwhal）",
    expectedStoryTitle: "Nahvalur Schuylkill：费城河名、专属树脂与可视墨窗",
    expectedSourceMarker:
      "curated-content:phase480-nahvalur-schuylkill-depth-v1:73d32660dcd32203b5ec7498689026c7c4fe58b60acbe3ab2caadfb629efede2",
    expectedBodySha256: "8badef4a49d107a43f6644ce69e1d0978fe2d8f0e579c2b1c1a797f43c11e5a2",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "年度限定的价格或稀有感也不能证明它是不同型号。若商品标题混用 Nautilus、Original、Original Plus 或 Schuylkill，要求卖家给出尾端和墨窗照片；缺少这些结构证据时，应把页面标为待核。品牌页可以反向链接所有已核颜色，型号页则只在 variant 层写颜色、饰件和年份，不重复建立同一活塞平台。",
        newText:
          "年度限定的价格或稀有感也不能证明它是不同型号。若商品标题混用 Nautilus、Original、Original Plus 或 Schuylkill，要求卖家给出尾端和墨窗照片；缺少这些结构证据时，应保留待核。Schuylkill 的颜色、饰件和年份属于同一活塞平台下的版本差异，不应被误认成互不相关的基础型号。",
        evidenceLocators: ["entity.body_md:L23-L23"],
      },
    ],
  },
  {
    manifestIndex: 200,
    entityId: "phase597-nahvalur-triad",
    brandEntityId: "s59NAHVALUR",
    slug: "nahvalur-triad",
    expectedName: "Nahvalur Triad Fountain Pen",
    expectedStoryTitle: "Nahvalur Triad：轻量 ABS、八色十六个钢笔 SKU 与 RollerBall 排除",
    expectedSourceMarker:
      "curated-content:phase597-nahvalur-triad-v1:6603f0779c501fddbc7f782ce969291526d9cb8d5b2586448d04a52c6ad1bcb2",
    expectedBodySha256: "879ef2879dd5ee007e922e8dec02202c25d1084ce02a613360a43fa25591755b",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "商品页同时提供 Fine、Medium 与 RollerBall。这里最容易产生身份错误：Fine／Medium 是配 No.5 不锈钢尖的 fountain pen；RollerBall 是使用墨囊的滚珠书写单元，不是第三种钢笔尖幅。本站只把 F/M 组合建立为 Triad Fountain Pen 的 current market SKU，八个尾号 `8` 的 RollerBall code 作为拒绝证据保留，不让它们进入钢笔型号计数。",
        newText:
          "商品页同时提供 Fine、Medium 与 RollerBall。Fine／Medium 是配 No.5 不锈钢尖的 fountain pen；RollerBall 是使用墨囊的滚珠书写单元，不是第三种钢笔尖幅。因此八种颜色各有 F／M 两个钢笔 SKU，八个尾号 `8` 的 RollerBall code 只能用于排除误认，不能计入钢笔型号。",
        evidenceLocators: ["entity.body_md:L7-L7"],
      },
    ],
  },
  {
    manifestIndex: 201,
    entityId: "phase596-nahvalur-voyage",
    brandEntityId: "s59NAHVALUR",
    slug: "nahvalur-voyage",
    expectedName: "Nahvalur Voyage Fountain Pen",
    expectedStoryTitle: "Nahvalur Voyage：Hawaii 当前规格、五个 SKU 与 Nautilus 混名纠错",
    expectedSourceMarker:
      "curated-content:phase596-nahvalur-voyage-v1:26463c2a9ff2122884d8238701a0dc5afe833264c9a56e845a62958bb5cbeb38",
    expectedBodySha256: "774ffc6e6becd7d7000aa1caedcfdca6e136ebdbe9aaf66172aec024fe8af80d",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Voyage 与 [[Nahvalur Nautilus（原 Narwhal）]] 的体量、活塞和海洋装饰接近，合作宣传里甚至出现过混称。Penquisition 在 Nashville 样笔文章中说明：部分营销资料写 Nautilus，但包装写 Voyage；Nautilus 有环绕笔杆的圆形舷窗，Voyage 使用更传统的连续墨窗。本站以产品包装、官方 family 和结构为准，把 Voyage 建成独立 canonical 型号。",
        newText:
          "Voyage 与 [[Nahvalur Nautilus（原 Narwhal）]] 的体量、活塞和海洋装饰接近，合作宣传里甚至出现过混称。Penquisition 在 Nashville 样笔文章中说明：部分营销资料写 Nautilus，但包装写 Voyage；Nautilus 有环绕笔杆的圆形舷窗，Voyage 使用更传统的连续墨窗。产品包装、官方 family 和结构都支持把 Voyage 识别为独立型号。",
        evidenceLocators: ["entity.body_md:L5-L5"],
      },
      {
        oldText:
          "2026-08-11 的 Shopify 数据列出六个尖幅代码，其中 Fine `03060391`、Medium `03060392`、Broad `03060393`、Stub `03060394`、Double Broad `03060397` available；Extra Fine `03060390` 保留完整代码但 unavailable。页面 selector 出现 EF 不等于当天能下单，本站只建立五个 current market SKU，并把 EF 放进 unavailable evidence。",
        newText:
          "2026-08-11 的 Shopify 数据列出六个尖幅代码，其中 Fine `03060391`、Medium `03060392`、Broad `03060393`、Stub `03060394`、Double Broad `03060397` available；Extra Fine `03060390` 保留完整代码但 unavailable。页面 selector 出现 EF 不等于当天能下单，因此检索日只有五个尖幅属于 current market SKU，EF 只能作为 unavailable 选项理解。",
        evidenceLocators: ["entity.body_md:L13-L13"],
      },
    ],
  },
  {
    manifestIndex: 485,
    entityId: "phase521-wancher-aizu-urushi-tamamushi-midori",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-aizu-urushi-tamamushi-nuri-midori",
    expectedName: "Wancher Aizu Urushi - Tamamushi-nuri - Midori",
    expectedStoryTitle: "Aizu Urushi Tamamushi-nuri Midori：漆艺、配置与身份边界",
    expectedSourceMarker:
      "curated-content:phase521-wancher-aizu-tamamushi-midori-v1:f9c0b46feb19a647c4c127bfa49a1e447c0c226349c0e2dca2ffe69c4d00eaf6",
    expectedBodySha256: "0f39988eff320ff13f6af559ab64d2fa15673245c79cac3e353ce4ef93bfd2cb",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      {
        oldText:
          "二手核对要保存完整标题、产品编号 `9215401427159`、handle、SKU `WF-UR-DREAM-TMGR`、ABS、Aizu Urushi、Tamamushi-nuri、所选 nib/feed、欧规 cartridge、包装和实物照片。不要把 Midori 与 Phase 519 的 Zogan Momiji Green Tamamushi-nuri 合并；前者是 Aizu Urushi/银粉层，后者是 Zogan/珍珠母贝象嵌。",
        newText:
          "二手核对要保存完整标题、产品编号 `9215401427159`、handle、SKU `WF-UR-DREAM-TMGR`、ABS、Aizu Urushi、Tamamushi-nuri、所选 nib/feed、欧规 cartridge、包装和实物照片。不要把 Midori 与 Zogan Momiji Green Tamamushi-nuri 合并；前者是 Aizu Urushi/银粉层，后者是 Zogan/珍珠母贝象嵌。",
        evidenceLocators: ["entity.body_md:L19"],
      },
    ],
  },
  {
    manifestIndex: 499,
    entityId: "phase360-wancher-dream-pen-celluloid-kingyo",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-celluloid-kingyo",
    expectedName: "Wancher Dream Pen Celluloid KINGYO",
    expectedStoryTitle: "Wancher Dream Pen Celluloid KINGYO：传统金红 celluloid 的具体入口",
    expectedSourceMarker:
      "curated-content:phase360-wancher-dream-pen-celluloid-kingyo-v1:cc0135ec2552f1edd7aaf6bf98e3a516f89fe928ea05d22e5e66d9345cf4ada0",
    expectedBodySha256: "0814ac353ea3c06e1250c97c7bab475246873dbfb9f0a25eb2065db8ee54b664",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "KINGYO 的金红色并非涂在透明树脂上的平面印刷。Celluloid 卷料的层次在车削、抛光和切割后会有差异，深红区域的比例、金色亮度和细纹走向都可能不同。图谱中的颜色名是身份标签，不是 Pantone 色卡；如果卖家只写“red/gold Wancher”，先确认是否是 Celluloid KINGYO，再排除漆艺金鱼、Urushi-e 或旧款 Dream Pen。",
        newText:
          "KINGYO 的金红色并非涂在透明树脂上的平面印刷。Celluloid 卷料的层次在车削、抛光和切割后会有差异，深红区域的比例、金色亮度和细纹走向都可能不同。KINGYO 是产品身份名称，不是 Pantone 色卡；如果卖家只写“red/gold Wancher”，先确认是否是 Celluloid KINGYO，再排除漆艺金鱼、Urushi-e 或旧款 Dream Pen。",
        evidenceLocators: ["entity.body_md:L13-L13"],
      },
    ],
  },
  {
    manifestIndex: 506,
    entityId: "phase511-wancher-kiei-camellia-akatame",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-kiei-urushi-camellia-japonica-akatame",
    expectedName: "Wancher Dream Pen Kiei Urushi Camellia Japonica Akatame",
    expectedStoryTitle: "Wancher Kiei Camellia Akatame：自然叶片、天然漆与型号边界",
    expectedSourceMarker:
      "curated-content:phase511-wancher-kiei-camellia-akatame-v1:27c8a119575dfb349a7b9eca2f8ff865b8d2f6fc13ccad17b9f3320418a20964",
    expectedBodySha256: "1c93c13b1ab0e344f09ae926797baa87cbce6799c4ea261894e8388f2a9a6c57",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "官方页面在检索窗口标示 US$600，并显示 Sold out。价格、库存、重新制作和税费可能变化，因此只记录当时状态，不推断长期价值或永久停产。包装列 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Authenticity Certificate、Converter 和 Cartridge。网页图片未在本项目冻结授权与版本，本包用原创 factual SVG 示意，并写明不是产品照片、不是色准或比例证明。",
        newText:
          "官方页面在检索窗口标示 US$600，并显示 Sold out。价格、库存、重新制作和税费可能变化，因此只代表当时状态，不能据此推断长期价值或永久停产。包装列 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Authenticity Certificate、Converter 和 Cartridge。原创事实示意图不是产品照片，也不用于证明色准或比例；官方网页图片的授权与具体版本未能稳定核验，因此未直接采用。",
        evidenceLocators: ["entity.body_md:L5-L5"],
      },
    ],
  },
  {
    manifestIndex: 508,
    entityId: "phase510-wancher-kiei-camellia-blue",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-kiei-urushi-camellia-japonica-blue",
    expectedName: "Wancher Dream Pen Kiei Urushi Camellia Japonica Blue",
    expectedStoryTitle: "Wancher Kiei Camellia Blue：蓝色山茶花、天然漆与自然纹理边界",
    expectedSourceMarker:
      "curated-content:phase510-wancher-kiei-camellia-blue-v1:7f365effd10b9ff39753fd8ab00665b97569259c82551fb11f2ed684d0b41e68",
    expectedBodySha256: "1063d81b7a57791b85a5d79cda6c40795a34645e132002114d7dfc62df344927",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "检索窗口官方页面标示 US$600，并显示 Sold out。价格、库存、重新制作和国际结账税费都可能变化；这里的价格只记录页面当时的商品字段，不是历史均价、收藏估值或二手承诺。页面列出 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Authenticity Certificate、Converter 和 Cartridge。由于网页图片的授权和版本保真没有在本项目中冻结，本包使用本站原创 factual SVG 做主图，并写明它不是产品照片、不是蓝色色准，也不代表实际比例或库存。",
        newText:
          "检索窗口官方页面标示 US$600，并显示 Sold out。价格、库存、重新制作和国际结账税费都可能变化；这个金额只代表页面当时的状态，不是历史均价、收藏估值或二手承诺。页面列出 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Authenticity Certificate、Converter 和 Cartridge。原创事实示意图不是产品照片、蓝色色准或实物比例，也不表示库存；官方网页图片的授权与具体版本未能稳定核验，因此未直接采用。",
        evidenceLocators: ["entity.body_md:L5-L5"],
      },
      {
        oldText:
          "在图谱中，Blue 作为一条独立型号与 Wancher 品牌相连，并在品牌导航中与 Red、Yellow、Black、Akatame 和其他 Kiei 兄弟并列。这样读者可以沿着 Kiei nuri 的技法语境漫游，却不会把不同颜色、不同页面和不同自然图案压成一支含混的“季映漆钢笔”。",
        newText:
          "Blue 是 Wancher Kiei 系列中的独立型号，与 Red、Yellow、Black、Akatame 及其他 Kiei 作品并列。它们共享 Kiei nuri 的技法语境，但颜色、官方页面和自然图案各不相同，不能压成一支含混的“季映漆钢笔”。",
        evidenceLocators: ["entity.body_md:L31-L31"],
      },
    ],
  },
  {
    manifestIndex: 509,
    entityId: "phase509-wancher-kiei-camellia-red",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-kiei-urushi-camellia-japonica-red",
    expectedName: "Wancher Dream Pen Kiei Urushi Camellia Japonica Red",
    expectedStoryTitle: "Wancher Kiei Camellia Red：红色山茶花、天然漆与手工纹理边界",
    expectedSourceMarker:
      "curated-content:phase509-wancher-kiei-camellia-red-v1:cb08bb952d0c353b54b2ef000d047a17890687e98b90e7a571ea953255bb1845",
    expectedBodySha256: "df8899a5fa1c4395b9098a255d9f9e86a250b462634d5352d93a39100f6b9565",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "检索窗口的官方页面标示 US$600，并显示 Sold out。价格、库存、重新制作与结账税费都是会变化的商业字段，这个金额只记录页面当时可见的状态，不是长期价格区间、稀缺度或二手估值。国际订单的税费和关税由买家按目的地承担。页面有多张产品图，但在没有稳定授权、下载保真和长期存档核对前，本包采用本站原创 factual SVG 作为主图，并明确写出它不是产品照片、不是色准，也不表示实物比例或库存。",
        newText:
          "检索窗口的官方页面标示 US$600，并显示 Sold out。价格、库存、重新制作与结账税费都会变化，这个金额只代表页面当时可见的状态，不是长期价格区间、稀缺度或二手估值。国际订单的税费和关税由买家按目的地承担。原创事实示意图不是产品照片、色准或实物比例，也不表示库存；官方产品图的授权与具体版本未能稳定核验，因此未直接采用。",
        evidenceLocators: ["entity.body_md:L5-L5"],
      },
      {
        oldText:
          "在图谱中，Camellia Japonica Red 只与 Wancher 品牌建立一条明确关系，并在品牌导航中作为独立 SKU；Blue、Yellow、Black、Akatame、Holly Olive 和 Yozakura Kuro 都保留各自页面。这样既能展示 Kiei 系列的兄弟关系，又不会把自然材料和颜色差异压成一个含混的“季映漆钢笔”。",
        newText:
          "Camellia Japonica Red 是 Wancher Kiei 系列中的独立产品；Blue、Yellow、Black、Akatame、Holly Olive 和 Yozakura Kuro 也各有自己的官方页面。它们共享 Kiei 的工艺脉络，但自然材料和颜色差异不能压成一个含混的“季映漆钢笔”。",
        evidenceLocators: ["entity.body_md:L35-L35"],
      },
    ],
  },
  {
    manifestIndex: 512,
    entityId: "phase513-wancher-kiei-holly-olive-black",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-kiei-urushi-holly-olive-black",
    expectedName: "Wancher Dream Pen Kiei Urushi Holly Olive Holly Olive Black",
    nextName: "Wancher Dream Pen Kiei Urushi Holly Olive Black",
    expectedStoryTitle: "Wancher Kiei Holly Olive Black：自然材料、工艺与型号边界",
    nextStoryTitle:
      "Wancher Dream Pen Kiei Urushi Holly Olive Black：自然材料、工艺与型号边界",
    expectedSourceMarker:
      "curated-content:phase513-wancher-kiei-holly-black-v1:41a88b39e7cb05b3864ed3884850ca902e841ca2f9ca0ad6871f518088e6a767",
    expectedBodySha256: "b6f4f3ebfca9754217316d7becb7bbafea8e9609d3b4564b37d9ad4a9e44e4b1",
    dimensions: ["introduction"],
    defectCodes: ["duplicate_public_display_name"],
    replacements: [
      {
        oldText:
          "Wancher Dream Pen Kiei Urushi Holly Olive Black 在官方 Kiei Urushi 集合和 exact page 中都是独立条目。产品页标题为 “Kiei Urushi - Holly Olive Black”，集合页又把它和 Holly Olive Red、Akatame、Yellow、Dark Blue、Kurotame、Green 分开列出，并与 Camellia、Yozakura 作品区分。共享季映塗技法不改变页面身份；Black 只负责这个 exact title 和自己的变体、商业字段及实物边界。",
        newText:
          "Wancher Dream Pen Kiei Urushi Holly Olive Black 在官方 Kiei Urushi 集合和 exact page 中都是独立条目。产品页标题为 “Kiei Urushi - Holly Olive Black”，集合页又把它和 Holly Olive Red、Akatame、Yellow、Dark Blue、Kurotame、Green 分开列出，并与 Camellia、Yozakura 作品区分。共享季映塗技法不改变产品身份；Black 对应这个 exact title 及其自己的变体、商业信息和实物边界。",
        evidenceLocators: ["entity.name", "entity.body_md:L1-L1"],
      },
    ],
  },
  {
    manifestIndex: 518,
    entityId: "phase513-wancher-kiei-yozakura-akatame",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-kiei-urushi-yozakura-akatame",
    expectedName: "Wancher Dream Pen Kiei Urushi Yozakura Yozakura Akatame",
    nextName: "Wancher Dream Pen Kiei Urushi Yozakura Akatame",
    expectedStoryTitle: "Wancher Kiei Yozakura Akatame：自然材料、工艺与型号边界",
    nextStoryTitle:
      "Wancher Dream Pen Kiei Urushi Yozakura Akatame：自然材料、工艺与型号边界",
    expectedSourceMarker:
      "curated-content:phase513-wancher-kiei-yozakura-akatame-v1:e8cc5ee5098db72eddd9b6260c9599038893d75049579d60c32e0908b6ed9cd4",
    expectedBodySha256: "273952027d8a4cbd25e2b5c91ae74c4c93b763853fc635f4a56cb5bb28080c29",
    dimensions: ["introduction"],
    defectCodes: ["duplicate_public_display_name"],
    replacements: [
      {
        oldText:
          "Wancher Dream Pen Kiei Urushi Yozakura Akatame 是官方 Kiei Urushi 集合中的独立 Yozakura 页面。exact page 标题为 “Kiei Urushi - Yozakura - Akatame”，集合页将它与 Holly Olive、Camellia 和其他 Yozakura 条目分开；Akatame 在这里修饰夜樱主题，不能被合并为 Holly Olive Akatame 或 Camellia Akatame。保留完整英文标题，能避免同名颜色把不同花材和页面身份混在一起。",
        newText:
          "Wancher Dream Pen Kiei Urushi Yozakura Akatame 是官方 Kiei Urushi 集合中的独立 Yozakura 产品。exact page 标题为 “Kiei Urushi - Yozakura - Akatame”，集合页将它与 Holly Olive、Camellia 和其他 Yozakura 条目分开；Akatame 在这里修饰夜樱主题，不能被合并为 Holly Olive Akatame 或 Camellia Akatame。保留完整英文标题，能避免同名颜色把不同花材和产品身份混在一起。",
        evidenceLocators: ["entity.name", "entity.body_md:L1-L1"],
      },
    ],
  },
  {
    manifestIndex: 519,
    entityId: "phase507-wancher-kiei-yozakura-kuro",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-kiei-urushi-yozakura-kuro",
    expectedName: "Wancher Dream Pen Kiei Urushi Yozakura Kuro",
    expectedStoryTitle: "Wancher Kiei Yozakura Kuro：真实樱花花瓣、哑光漆与笔尖兼容边界",
    expectedSourceMarker:
      "curated-content:phase507-wancher-kiei-yozakura-kuro-v1:b5f743ce03b53435d5b138c8b51b29e9bfd3ad97e9e38e6be887e5647047a224",
    expectedBodySha256: "16ce39bc8a28f82af8b5341a5025627fc26b694b5355745c56841b67cebdf63a",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "检索窗口官方页面标示价格 US$600，并显示可加入购物车。价格、库存、交付和可订配置都可能变化；这里的价格只记录页面当时的状态，不是历史价格区间、收藏稀缺度或未来估值。页面提供八张产品媒体图，但本包不把网页图片直接复制成站内主图：在没有稳定授权和版本保真核对前，用原创 factual SVG 说明型号边界，并把“非产品照片”写清楚。",
        newText:
          "检索窗口官方页面标示价格 US$600，并显示可加入购物车。价格、库存、交付和可订配置都可能变化；这个金额只代表页面当时的状态，不是历史价格区间、收藏稀缺度或未来估值。原创事实示意图用于说明型号边界，并明确标注“非产品照片”；官方页面的八张产品图因授权与具体版本未能稳定核验而未直接采用。",
        evidenceLocators: ["entity.body_md:L5-L5"],
      },
      {
        oldText:
          "在图谱中，Kuro 只指向 Wancher，并反向出现在 Wancher 品牌导航；Yozakura 红色兄弟、其他 Kiei 颜色和普通樱花漆笔维持独立关系。页面没有公开尺寸、重量和现代首发年份，就明确写“未公布”，不借用同系列别的尺寸或顾客评论补空。",
        newText:
          "Kuro 是 Wancher Kiei 系列中的独立产品，不能与 Yozakura 红色版本、其他 Kiei 颜色或普通樱花漆笔混为一谈。官方页面没有公开尺寸、重量和现代首发年份，这些项目只能标为“未公布”，不能借用同系列别款尺寸或顾客评论补空。",
        evidenceLocators: ["entity.body_md:L43-L43"],
      },
    ],
  },
  {
    manifestIndex: 531,
    entityId: "phase112-wancher-dream-pen-titanium-black",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-titanium-black",
    expectedName: "Wancher Dream Pen Titanium Black",
    expectedStoryTitle: "Wancher Dream Pen Titanium Black：售罄页面与 2024 样本不能揉成一组规格",
    expectedSourceMarker:
      "curated-content:phase112-wancher-dream-pen-titanium-black-v1:273ab08637f3f85539073cb8dfe82f59aada49bb325161664a2e469b0c78080b",
    expectedBodySha256: "cb197c088c9469e238753fe51946ad5f9355759acbe08e83ddc57f1f70ae0b44",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "66.4 g 是非常具体的数字，也正因为具体，更需要问清楚测量对象：是否含 converter、是否装墨、笔帽是否包含在内、样本配置是否与今天商品页一致。现有证据不足以把这些条件全部锁死，所以结构化数据把它留在 dated sample scope。正文谈“偏重”时，也只归因给评测作者；手掌大小、握位、书写时间和是否携带笔帽都会改变个人判断。",
        newText:
          "66.4 g 是非常具体的数字，也正因为具体，更需要问清楚测量对象：是否含 converter、是否装墨、笔帽是否包含在内、样本配置是否与今天商品页一致。现有证据不足以锁定这些条件，因此 66.4 g 只能作为带日期的样本数据，不能当作当前产品公称重量。“偏重”也只是评测作者对该样本的判断；手掌大小、握位、书写时间和是否携带笔帽都会改变感受。",
        evidenceLocators: ["entity.body_md:L19-L19"],
      },
      {
        oldText:
          "“apparent original titanium nib”在本页始终带限定词。它意味着评测文字足以让我们保存一个待解释的样本线索，却不足以补猜笔尖供应商、尖幅、合金成分或生产批次。当前 JoWo 钢尖只由当前 listing 负责；2024 样本笔尖只由 dated review scope 负责。二者通过一条 unresolved conflict 相连，目的不是选出赢家，而是阻止数据库把两份不同时间的材料合并成一组看似完整、实际不存在的规格。",
        newText:
          "“apparent original titanium nib”必须保留限定词。这段评测足以留下一个待解释的样本线索，却不足以推测笔尖供应商、尖幅、合金成分或生产批次。当前 JoWo 钢尖只由当前 listing 支持，2024 样本笔尖只在当时评测的范围内成立；两份不同时期的材料存在未决冲突，不能合并成一组看似完整、实际不存在的规格。",
        evidenceLocators: ["entity.body_md:L27-L27"],
      },
      {
        oldText:
          "三层信息共同出现，不代表可以互相填空。当前库存与价格会变；历史样本不能代替当前规格；系列文章只负责导航。读者若沿正文进入 Dream Pen 系列，再回到具体 SKU、来源 locator 与实物检查，就能看见一支笔在不同时间留下的证据，而不是得到一张把所有年份揉平的参数表。",
        newText:
          "三层信息共同出现，不代表可以互相填空。当前库存与价格会变，历史样本不能代替当前规格，系列文章也只能说明产品脉络。阅读时应分别核对具体 SKU、原始来源与实物状态，才能看见这支笔在不同时间留下的证据，而不是得到一张把所有年份揉平的参数表。",
        evidenceLocators: ["entity.body_md:L51-L51"],
      },
    ],
  },
  {
    manifestIndex: 533,
    entityId: "phase531-wancher-true-ebonite-marble-blue",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-true-ebonite-marble-blue",
    expectedName: "Wancher Dream Pen True Ebonite Marble Blue",
    expectedStoryTitle: "True Ebonite Marble Blue：Ebonite 颜色身份与逐支差异",
    expectedSourceMarker:
      "curated-content:phase531-wancher-marble-blue-v1:1d201da364d67f5ba9067f010f7b4a9416d2f92d36eba0f523c83decd98bb746",
    expectedBodySha256: "ddf4e5fc07b30de876f2c344bcc06151df7da3750d17e52f2706bd9ddc3a822b",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "官方 exact page 没有发布可复核长度、直径、握径和可靠成品重量；JSON 里的 200 g 不是实测规格。零售商若给出尺寸、笔夹、金色钢尖或旧版本结构，保存为有时间范围的库存快照，不并入当前 model_specs。Marble Green 的实拍和 True Urushi Blue 的漆面都不是 Marble Blue 的证据。",
        newText:
          "官方 exact page 没有发布可复核长度、直径、握径和可靠成品重量；JSON 里的 200 g 不是实测规格。零售商给出的尺寸、笔夹、金色钢尖或旧版本结构只能作为带日期的库存资料，不能当作当前官方规格。Marble Green 的实拍和 True Urushi Blue 的漆面都不是 Marble Blue 的证据。",
        evidenceLocators: ["entity.body_md:L27-L27"],
      },
    ],
  },
  {
    manifestIndex: 534,
    entityId: "phase531-wancher-true-ebonite-marble-brown",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-true-ebonite-marble-brown",
    expectedName: "Wancher Dream Pen True Ebonite Marble Brown",
    expectedStoryTitle: "True Ebonite Marble Brown：Ebonite 颜色身份与逐支差异",
    expectedSourceMarker:
      "curated-content:phase531-wancher-marble-brown-v1:d3008468e7f345063af45533a217ea7d2631de5e007ce070c9f1d888ff54fef3",
    expectedBodySha256: "d5b45da5bee99707015331307a02199adcd4371cafea79946cc2e38d1c8b79ba",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "官方 exact page 没有发布可靠重量；JSON 的 200 g 字段不作为实测。零售商如果给出长度、笔夹、金色钢尖或不同帽结构，应保留 URL、检索日期和批次范围，不能覆盖 current model_specs。Marble Red、Marble Green 和木制 World Tree 的外观照片都不能证明 Marble Brown 的纹理、材料或尺寸。",
        newText:
          "官方 exact page 没有发布可靠重量；JSON 的 200 g 字段不作为实测。零售商给出的长度、笔夹、金色钢尖或不同帽结构必须与 URL、检索日期和批次范围一起理解，不能覆盖当前官方规格。Marble Red、Marble Green 和木制 World Tree 的外观照片都不能证明 Marble Brown 的纹理、材料或尺寸。",
        evidenceLocators: ["entity.body_md:L27-L27"],
      },
    ],
  },
  {
    manifestIndex: 535,
    entityId: "phase135-wancher-true-ebonite-marble-green",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-true-ebonite-marble-green",
    expectedName: "Wancher Dream Pen True Ebonite Marble Green",
    expectedStoryTitle: "Wancher True Ebonite Marble Green：自然花纹与零售版本不能混成统一规格",
    expectedSourceMarker:
      "curated-content:phase135-wancher-dream-pen-true-ebonite-marble-green-v1:3136c7f95da52edfff0e7591afb9c76d07353bddb226d2b65dfca63e26136791",
    expectedBodySha256: "12a154403a4d8d1126bcb35d00edaa3b3ba5b33f21b7ccdd1a51d07166892877",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "然而，当前 Wancher exact page 只列 #6 JoWo stainless steel／Wancher 18K、三种 feed 和 compact air-tight cap，并未在文字规格中确认 titanium threads、spring-loaded cap 或上述固定尺寸。两份资料不能被拼成“当前全系规格”。本页把零售字段留在 retailer inventory scope；看二手笔时可以用来提问，却不进入 current model_specs。",
        newText:
          "然而，当前 Wancher exact page 只列 #6 JoWo stainless steel／Wancher 18K、三种 feed 和 compact air-tight cap，并未在文字规格中确认 titanium threads、spring-loaded cap 或上述固定尺寸。两份资料不能被拼成“当前全系规格”；零售字段只代表对应库存与时期，看二手笔时可以用来提问，却不能当作当前官方规格。",
        evidenceLocators: ["entity.body_md:L31-L31"],
      },
    ],
  },
  {
    manifestIndex: 536,
    entityId: "phase531-wancher-true-ebonite-marble-purple-gray",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-true-ebonite-marble-purple-gray",
    expectedName: "Wancher Dream Pen True Ebonite Marble Purple Gray",
    expectedStoryTitle: "True Ebonite Marble Purple Gray：Ebonite 颜色身份与逐支差异",
    expectedSourceMarker:
      "curated-content:phase531-wancher-marble-purple-gray-v1:2f4a5282eca89204898b4296abeb775a60a754a6e86a5da885865b6205c17ca0",
    expectedBodySha256: "a8234fd6a6cfdf7f7c422f89bfeaafb59298785a25ef9742f9a0686642ded3e8",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "当前 exact page 没有公开可复核长度、直径、握径和可靠成品重量；JSON 的 200 g 不作为重量规格。外部零售商如果写出尺寸、笔夹、弹簧帽或其它尖组，保留为批次／库存证据，不能合并进当前 `model_specs`。Marble Red、Marble Blue、Marble Brown 的图片与价格也不能给本支补字段。",
        newText:
          "当前 exact page 没有公开可复核长度、直径、握径和可靠成品重量；JSON 的 200 g 不作为重量规格。外部零售商写出的尺寸、笔夹、弹簧帽或其他尖组只能代表对应批次与库存，不能合并进当前官方规格。Marble Red、Marble Blue、Marble Brown 的图片与价格也不能用来补全本款。",
        evidenceLocators: ["entity.body_md:L27-L27"],
      },
    ],
  },
  {
    manifestIndex: 538,
    entityId: "phase107-wancher-true-ebonite-matte-black",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-true-ebonite-matte-black",
    expectedName: "Wancher Dream Pen True Ebonite Matte Black",
    expectedStoryTitle: "Wancher Dream Pen True Ebonite Matte Black：两条时间线读同一个名字",
    expectedSourceMarker:
      "curated-content:phase107-wancher-true-ebonite-matte-black-v1:17dc492be6f06173a0d5421b10a5a1263b2a19522e47bbb9c8dac16a973fa6eb",
    expectedBodySha256: "690f59eda786e8e5bd8344f7e684a3ad0891ebc9a9b56b54151f8111e3dc0a35",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "作者还讨论 Kickstarter 与当时零售价，并对性价比作出判断。这是历史价格语境与作者意见，不进入稳定 model_specs。今天的价格、税费、运输、选配成本和二手行情都可能不同，本页不保存一个会迅速过期的数字。",
        newText:
          "作者还讨论 Kickstarter 与当时零售价，并对性价比作出判断。这些内容属于历史价格语境与作者意见，不是稳定的型号规格。今天的价格、税费、运输、选配成本和二手行情都可能不同，旧数字不能代表当前市场。",
        evidenceLocators: ["entity.body_md:L31-L31"],
      },
    ],
  },
  {
    manifestIndex: 540,
    entityId: "phase134-wancher-true-ebonite-silk-black",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-true-ebonite-silk-black",
    expectedName: "Wancher Dream Pen True Ebonite Silk Black",
    expectedStoryTitle: "Wancher True Ebonite Silk Black：当前抛光款、2018 样笔与 AS IS 边界",
    expectedSourceMarker:
      "curated-content:phase134-wancher-dream-pen-true-ebonite-silk-black-v1:a39d0faf745c11886ba6308ae7fc21d71ff76f3c11bccb3f6c13cbcc6d601bd3",
    expectedBodySha256: "d8af9e5ebf9f67ffceccff2493cb264be51e253b5fde69185b64a144ea16db5f",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "评测把精确尺寸和重量指向作者此前评测的 True Urushi prototype。那不是当前 Silk Black 官方规格，因此本页不搬运那些数字。可靠编辑不等于把每个可见数字都填入 model_specs；当数字属于 sibling prototype 或单一历史样品时，明确不采用比制造虚假的精确度更有价值。",
        newText:
          "评测把精确尺寸和重量指向作者此前评测的 True Urushi prototype。那不是当前 Silk Black 的官方规格，因此不能搬用这些数字。来自 sibling prototype 或单一历史样品的数值只适用于原样本；明确不采用，比制造虚假的精确度更可靠。",
        evidenceLocators: ["entity.body_md:L31-L31"],
      },
    ],
  },
  {
    manifestIndex: 542,
    entityId: "phase113-wancher-dream-pen-true-urushi-aka-tamenuri",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-dream-pen-true-urushi-aka-tamenuri",
    expectedName: "Wancher Dream Pen True Urushi Aka Tamenuri",
    expectedStoryTitle:
      "Wancher Dream Pen True Urushi Aka Tamenuri：品牌现售页、量产订单与 prototype 不能揉成一层证据",
    expectedSourceMarker:
      "curated-content:phase113-wancher-dream-pen-true-urushi-aka-tamenuri-v1:e9dc5df61a702748e825dd1eedc89ee1ea798bbb06261940313b30255bbff477",
    expectedBodySha256: "9b6beea92c1bc6544edfa79db5980ce979de497b3e27880d49651b5828fe1840",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Aka Tamenuri 在图谱中是一个 exact canonical pen，只通过 made_by 指向既有 Wancher brand。它不会新建一个含义模糊的 generic True Urushi series，也不会把其它漆色合并成自己的 alias 或 variant。已有 True Ebonite 是另一支具体 SKU，其内容与 topology 均不由本页改写。",
        newText:
          "Aka Tamenuri 是 Wancher Dream Pen True Urushi 的具体漆色型号。它与其他 True Urushi 漆色以及 True Ebonite 都是不同的具体产品；不能把别款漆色当成 Aka Tamenuri 的 alias 或 variant，也不能把 True Ebonite 的材料与规格移用过来。",
        evidenceLocators: ["entity.body_md:L42-L42"],
      },
      {
        oldText:
          "想比较 Dream Pen 的材料分支与具体产品，应回到 [Wancher Dream Pen 系列导航](/article/wancher-dream-pen)。这个链接只是正文导航：不会把 article 变成产品，不会给 article 制造 made_by／reverse，也不会把 article 中曾引用的 exact 商品 URL 当成可以复用的 SKU identity。系列页负责“从哪里继续逛”，本页负责“这一支具体 Aka 的证据到哪里为止”。",
        newText:
          "想比较 Dream Pen 的材料分支与具体产品，可参见 [Wancher Dream Pen 系列导航](/article/wancher-dream-pen)。系列文章用于梳理产品脉络；Aka Tamenuri 的具体配置、SKU 与来源仍应以本型号资料为准。系列文章曾引用同一个 exact 商品 URL，也不意味着其中其他产品可以沿用 Aka Tamenuri 的身份或规格。",
        evidenceLocators: ["entity.body_md:L44-L44"],
      },
    ],
  },
  {
    manifestIndex: 555,
    entityId: "phase387-pen-wancher-hirota-byobu-e-ume-ni-hanasui",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-hirota-byobu-e-ume-ni-hanasui",
    expectedName: "Wancher Hirota Byobu-e – Ume ni Hanasui",
    expectedStoryTitle: "Wancher Hirota Byobu-e：Ume ni Hanasui 把一折春意收进一支漆笔",
    expectedSourceMarker:
      "curated-content:phase387-pen-wancher-hirota-byobu-e-ume-ni-hanasui-v1:61b8e4bdc47d42ef5fc7d6a14333c7459dc2d8c77e2b0b82fb4c70905ffe5ef8",
    expectedBodySha256: "81dc7bd45dd01ddfac816224074a00002272a34c7b299ec200dc1f596c44a7a4",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "官方商品页还写明，Hirota Byobu-e Editor’s Collection 的每个设计都是 singular piece，只有一支。这里的“一支”描述的是作品设计与制作数量边界，不代表订单页面上的尖幅、Kodachi 或 Shogun 18K 选项会同时随笔附送，更不应把它解读为有一个公开的编号体系。若页面后来更换库存，数据库应保留这次检索的历史状态，并重新核对现货与配置。",
        newText:
          "官方商品页还写明，Hirota Byobu-e Editor’s Collection 的每个设计都是 singular piece，只有一支。这里的“一支”描述作品设计与制作数量边界，不代表订单页面上的尖幅、Kodachi 或 Shogun 18K 选项会同时随笔附送，也不能据此推断存在公开编号体系。页面库存变化后，旧状态仍只能代表原检索日，现货与配置需要重新核对。",
        evidenceLocators: ["entity.body_md:L7-L7"],
      },
      {
        oldText:
          "Hirota Urushi collection 里还有 Sabi-nuri、Chawan-iro、Kushime Tsuishitsu Nuri、Kinpaku Maki-e 等路线。它们可以在图谱中作为相关主题链接，但不是这支笔的别名。尤其不要将 `Kinpaku Maki-e` 系列名直接替换为 Byobu-e，也不要把其它页面的钛尖、Wancher 18K 或 ebonite feed 填入本型号。品牌关系只有一条：本型号由 Wancher 品牌公开销售；工艺创作者是 Master Yoko Hirota，二者不是两个品牌节点。",
        newText:
          "Hirota Urushi collection 里还有 Sabi-nuri、Chawan-iro、Kushime Tsuishitsu Nuri、Kinpaku Maki-e 等路线。它们是相关工艺主题，却不是这支笔的别名。尤其不要将 `Kinpaku Maki-e` 系列名直接替换为 Byobu-e，也不要把其他页面的钛尖、Wancher 18K 或 ebonite feed 填入本型号。Wancher 负责公开销售，Master Yoko Hirota 是工艺创作者，二者角色不同。",
        evidenceLocators: ["entity.body_md:L73-L73"],
      },
    ],
  },
  {
    manifestIndex: 556,
    entityId: "phase508-wancher-hirota-urushi-chawan-iro-ai",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-hirota-urushi-chawan-iro-ai",
    expectedName: "Wancher Hirota Urushi Chawan-iro Ai",
    expectedStoryTitle: "Wancher Hirota Chawan-iro Ai：茶碗渐变意象与一件手工漆艺 SKU",
    expectedSourceMarker:
      "curated-content:phase508-wancher-hirota-chawan-iro-ai-v1:600f57bf847cd750819883271f9a6fd8fefbfff63e962e93770330b56f536d9d",
    expectedBodySha256: "f9ddd7b67e605d889b236ae8802ae1e128cb3fec19f5e307a0b7a32d5f8df060",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "页面公开了四张产品媒体图，但本包只加入一张原创 factual SVG 作为站内主媒体，不把图片复制或变成颜色标准。漆面渐变、纹理和显示器白平衡可能改变观感；想核对二手笔时，应要求同一 Ai SKU 的实物近照、证书、原订单和包装信息，不要以“茶碗漆”或“蓝色漆笔”泛名直接合并。",
        newText:
          "页面公开了四张产品媒体图；这里采用原创事实示意图，不直接复制官方图片，也不把示意图当成颜色标准。漆面渐变、纹理和显示器白平衡可能改变观感；核对二手笔时，应要求同一 Ai SKU 的实物近照、证书、原订单和包装信息，不要用“茶碗漆”或“蓝色漆笔”等泛名直接合并。",
        evidenceLocators: ["entity.body_md:L7-L7"],
      },
    ],
  },
  {
    manifestIndex: 569,
    entityId: "phase119-wancher-puchico",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-puchico",
    expectedName: "Wancher PuChiCo",
    expectedStoryTitle: "Wancher PuChiCo：一个 65 mm 型号，十一种颜色与两支样品",
    expectedSourceMarker:
      "curated-content:phase462-wancher-puchico-depth-v1:5f0cf660fd10561346c93d13f361ef50c1c064a75df88b85603a71d6a11216ed",
    expectedBodySha256: "4acb5bb9589474f788249c5d663408ce8ee15fbf9793ed9773eb02244b9f6525",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "这些都是有价值的专业样品观察，却不是全系承诺。约 0.5 ml 不是官方 collection 给出的 current stable capacity；“数周未漏”只证明该样品在作者那段使用情境中没有发生泄漏；写感、螺纹、笔夹与舒适度也与具体样品和作者有关。文章提到的 JetPens 当时价格同样属于 retailer/time snapshot。数据包因此把它们保存在 Sarah Read／2024／JetPens-supplied sample scope，相关 spec evidence 明确标为 rejected，而不是把它们提升为所有颜色都共享的规格。",
        newText:
          "这些都是有价值的专业样品观察，却不是全系承诺。约 0.5 ml 不是官方 collection 给出的稳定容量；“数周未漏”只证明该样品在作者那段使用情境中没有发生泄漏；写感、螺纹、笔夹与舒适度也与具体样品和作者有关。文章提到的 JetPens 当时价格同样只属于零售商与检索时期。上述信息应限定在 Sarah Read／2024／JetPens-supplied sample 范围内，不能提升为所有颜色共享的规格。",
        evidenceLocators: ["entity.body_md:L21-L21"],
      },
      {
        oldText:
          "因此，航班不 burp 不能变成“PuChiCo 适合飞行”的全系结论；Fine 顺滑不能替 EF 或其他批次担保；60／90 mm 是作者对样品使用状态的测量，不覆盖官方 65 mm capped-before-posting 定义；笔帽稳定性、手型适配、颜色外观、耐久与购买价格也都不能跨到十一种 current variants。官方与评测恰好同时支持 eyedropper 这一结构时，我们可以把 eyedropper 写进 current model；评测独有的容量和体验则继续留在 sample scope。",
        newText:
          "因此，航班不 burp 不能变成“PuChiCo 适合飞行”的全系结论；Fine 顺滑不能替 EF 或其他批次担保；60／90 mm 是作者对样品使用状态的测量，不覆盖官方 65 mm capped-before-posting 定义；笔帽稳定性、手型适配、颜色外观、耐久与购买价格也不能推广到十一种 current variants。eyedropper 结构同时得到官方与评测支持，可以作为当前型号事实；评测独有的容量和体验仍只适用于那支样品。",
        evidenceLocators: ["entity.body_md:L29-L29"],
      },
      {
        oldText:
          "本页于是设置三个不可混用的 scope：2026-07-22 official current collection、Sarah Read 2024 JetPens-supplied sample、Kimberly Lau 2025 self-purchased Black Chocolate Orange／Fine sample。每条 claim 与 citation 都必须落到其中一个 scope；sample-only capacity、leak／burp、flight、nib feel、posting、hand fit、price、color 与 durability observation 不能进入 line-wide stable values。",
        newText:
          "阅读 PuChiCo 资料时，需要区分三个不可混用的证据范围：2026-07-22 official current collection、Sarah Read 2024 JetPens-supplied sample、Kimberly Lau 2025 self-purchased Black Chocolate Orange／Fine sample。样品专属的容量、leak／burp、flight、nib feel、posting、hand fit、price、color 与 durability observation 都只说明对应样品，不能推广成全系列稳定事实。",
        evidenceLocators: ["entity.body_md:L35-L35"],
      },
      {
        oldText:
          "十一种颜色是 2026-07-22 collection 的精确 pen-card set，不是永久目录承诺。读者在购买前仍应回到 Wancher 当前页面核对颜色、尖宽、价格与库存。页面未来新增、下架或恢复某种颜色，并不会自动创造或删除 canonical PuChiCo 型号；它只会改变检索日 variants／availability 记录。本站当前完成的是 full corpus goal 中的一次 partial batch：PuChiCo 页面与 Wancher 导航被安全补齐，不代表 Wancher 全产品或整个钢笔语料库已经完成。",
        newText:
          "十一种颜色是 2026-07-22 collection 的精确 pen-card set，不是永久目录承诺。购买前仍应回到 Wancher 当前页面核对颜色、尖宽、价格与库存。以后新增、下架或恢复某种颜色，只表示目录和供应状态发生变化，并不会让 PuChiCo 自动成为另一个型号或从产品史中消失。现有资料也不能代表 Wancher 的完整产品目录。",
        evidenceLocators: ["entity.body_md:L39-L39"],
      },
      {
        oldText:
          "PuChiCo 选购时建议把记录拆成“canonical model—颜色 card—尖幅—附件”四层。颜色名称只说明 official collection 在某个日期展示了什么；尖幅需要看商品卡或实物；滴管、保护套和 Petite Charm Case 是配件信息，不应因为同一 collection 页面相邻出现就写成钢笔规格。尤其是 Mocha Beige、Duck Blue、Pink Blossom Petite Charm Case，它们在官方页面中是 case card，不是 PuChiCo 颜色 variant。",
        newText:
          "选购 PuChiCo 时，应分开确认具体型号、颜色 card、尖幅和附件。颜色名称只说明 official collection 在某个日期展示了什么；尖幅需要看商品卡或实物；滴管、保护套和 Petite Charm Case 是配件，不应因为与钢笔出现在同一 collection 页面就被写成钢笔规格。尤其是 Mocha Beige、Duck Blue、Pink Blossom Petite Charm Case，它们是 case card，不是 PuChiCo 颜色 variant。",
        evidenceLocators: ["entity.body_md:L55-L55"],
      },
    ],
  },
  {
    manifestIndex: 572,
    entityId: "phase392-pen-wancher-ryukyu-tsuikin-bonsai",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-ryukyu-tsuikin-bonsai",
    expectedName: "Wancher Dream Pen Ryukyu Tsuikin Bonsai",
    expectedStoryTitle: "Wancher Ryukyu Tsuikin Bonsai：把盆景放进一支堆锦笔",
    expectedSourceMarker:
      "curated-content:phase392-pen-wancher-ryukyu-tsuikin-bonsai-v1:33685abafbfb3293594fe4fd4de8ea0f36c46c0bd10d8ca0bec19358e881d5f4",
    expectedBodySha256: "ab64750f747c268f676c575f0f76fb3840d07e1a05f48c5074364d97eeffd5a5",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Ryukyu Tsuikin Bonsai 是一支以盆栽枝叶花朵为主题的具体 Wancher 型号，Original 与 Tamesukashi 是 finishing 变体。官方明确给出 Ebonite、Aizu Urushi/Tamesukashi、Tsuikin Urushi、Keiryu/Kodachi/Jowo #6、Plastic/Ebonite feed 兼容关系、欧规 C/C、包装、$900 USD 起始价和 Keiryu 升级说明；尺寸、重量、树种、制作数量和独立首发年没有公开。把这些边界保留下来，才能让 Bonsai 与双龙、月桃、芙蓉和樱花等相邻产品在图谱中各自可查。",
        newText:
          "Ryukyu Tsuikin Bonsai 是一支以盆栽枝叶花朵为主题的具体 Wancher 型号，Original 与 Tamesukashi 是 finishing 变体。官方明确给出 Ebonite、Aizu Urushi/Tamesukashi、Tsuikin Urushi、Keiryu/Kodachi/Jowo #6、Plastic/Ebonite feed 兼容关系、欧规 C/C、包装、$900 USD 起始价和 Keiryu 升级说明；尺寸、重量、树种、制作数量和独立首发年没有公开。这些边界能把 Bonsai 与双龙、月桃、芙蓉和樱花等相邻产品清楚区分。",
        evidenceLocators: ["entity.body_md:L97-L97"],
      },
    ],
  },
  {
    manifestIndex: 575,
    entityId: "phase120-wancher-shizuku-glass-nib",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-shizuku-glass-nib",
    expectedName: "Wancher Shizuku Glass Nib Fountain Pen",
    expectedStoryTitle: "Wancher Shizuku：十四张当前卡片、Solis 精确规格与 2019 Earth 样品",
    expectedSourceMarker:
      "curated-content:phase462-wancher-shizuku-depth-v1:79548b85747ec74a82ccdb217b40ce5c13f548c05ef1b0c40716ee5738818f47",
    expectedBodySha256: "5b067f7a1678e26ab1010319d8250a57aaaa4ce238c18ee5d1d5948239958e12",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "同一个 Earth 名字可以同时出现在今天的 listing 和 2019 年样品里，但事实不能穿越时间线。这正是阅读 Wancher Shizuku Glass Nib Fountain Pen 时最重要的一条边界：本页只建立一个 canonical model，官网 collection 里的外观名称都是这个型号的 variants；Solis 商品页给出的尺寸属于 Solis；Susan M. Pigott 在 2019 年评测的 Earth，则是一支由 Wancher 免费提供的特定样品。三类证据可以并列，却不能互相补空白。",
        newText:
          "同一个 Earth 名字可以同时出现在今天的 listing 和 2019 年样品里，但事实不能穿越时间线。官网 collection 中的外观名称都属于 Shizuku 系列；Solis 商品页给出的尺寸只属于 Solis；Susan M. Pigott 在 2019 年评测的 Earth，则是一支由 Wancher 免费提供的特定样品。三类证据可以并列，却不能互相补空白。",
        evidenceLocators: ["entity.body_md:L1-L1"],
      },
      {
        oldText: `### 一支笔，而不是十四支 sibling

Shizuku 的识别核心不是某一种颜色，而是手工玻璃笔尖与 converter 上墨机制的组合。Wancher 的系列说明把玻璃尖、Duralumin 笔身与 anodization 放在同一设计语境里；这里把它们记录为 family scope，说明这个系列怎样形成，而不是宣称每张仍可见的商品卡都拥有完全相同的尺寸、重量或仍在持续生产。

在 2026-07-22 取回的官方 collection 页面中，按公开 product-card 名称去重后共有十四项：Black Eye、Orion Nebula、Eclipse、Solis、Blue Moon、Adrastea、Mars、Pluto、Andromeda、Gaia、Saturn、Jupiter、Earth 与 Venus。网页模板可能为同一卡片分别渲染图片和标题，那不是两款；带 AS IS 或 outlet 性质的重复卡也不是新的正式 variant。因此，这十四个名称都挂在同一个 canonical pen 下面，不另建 Solis pen、Earth pen 或任何颜色 sibling entity。

卡片可见性只是一次检索快照。页面在取回日显示的 sold-out、价格和库存会变化，不能被翻译成“已经停产”，也不能反过来证明“持续生产”。variant notes 因而只记录 retrieved listing 与 mutable availability。Black Eye、Orion Nebula 和 Adrastea 可放回官方 2025 年的系列语境来理解，但年份语境不等于十四款共享首发年，也不等于每一张卡今天都以相同状态供应。

### family scope 能说明什么

官方 family scope 支持的是系列层级事实：Shizuku 以 handmade glass nib 为特色，以 international converter 供墨，并在系列说明中谈到 Duralumin 与 anodization。玻璃尖和 converter 的搭配值得特别指出：它不是把蘸水玻璃笔尖简单装到普通笔杆上，而是让玻璃书写端进入可携带、可补墨的自来水笔结构。本站信息图用概念箭头表达这条机制，但不是剖面工程图，也不证明内部零件比例。

这些 family facts 仍有边界。Duralumin 与阳极氧化是官方对系列设计的描述，不足以推出十四个外观卡都使用同一表面配方、同一公差或同一批次结构；handmade 也不代表每支笔尖手感完全一致。颜色块只帮助读者定位卡片名称，不是色准、饰面或实物照片。页面没有把营销语境改写成逐款 exact spec。

### Solis：唯一可以逐字段读取的当前精确规格

Solis 的当前商品页提供了更细的数据，因此单独建立 Solis exact current scope。该页支持：Duralumin 笔身、screw cap、clear 或 black glass nib、EF／F／M 三种尖幅；合帽长度 154 mm，不合帽长度 128 mm，ring diameter 12 mm，重量约 25 g，并使用 international converter。

这里的限定词“仅 Solis”不是保守措辞，而是数据模型的一部分。154／128 mm、12 mm 与约 25 g 不会被写成十四个 variants 的共同规格；clear／black 和 EF／F／M 也只绑定 Solis 来源与 scope。商品页当日的价格、库存或 sold-out 属于 mutable commerce state，不进入 stable model spec。读者因此可以准确知道 Solis 页面说了什么，同时不会被引导去猜 Earth、Mars 或 Black Eye 具有同样数值。

family scope 与 Solis exact scope 可以互相校验概念，却不能互相扩张。官方 collection 说明 glass nib 与 converter 的系列思路，Solis 商品页才支持具体长度、重量、ring 与尖幅。日本官网若用于同字段佐证，也仍属于同一个 Wancher official independence group，不会被包装成第二个独立来源，更不会拿其他 sibling 的字段填充 Solis。`,
        newText: `### 十四个外观名称，仍是同一 Shizuku 系列

Shizuku 的识别核心不是某一种颜色，而是手工玻璃笔尖与 converter 上墨机制的组合。Wancher 的系列说明把玻璃尖、Duralumin 笔身与 anodization 放在同一设计语境里，用来解释系列怎样形成；它并未说明每张仍可见的商品卡都拥有完全相同的尺寸、重量或仍在持续生产。

在 2026-07-22 取回的官方 collection 页面中，按公开 product-card 名称去重后共有十四项：Black Eye、Orion Nebula、Eclipse、Solis、Blue Moon、Adrastea、Mars、Pluto、Andromeda、Gaia、Saturn、Jupiter、Earth 与 Venus。网页模板可能为同一卡片分别渲染图片和标题，那不是两款；带 AS IS 或 outlet 性质的重复卡也不是新的正式 variant。这十四个名称都是 Shizuku 的外观版本，并非十四种彼此无关的基础型号。

卡片可见性只是一次检索快照。页面在取回日显示的 sold-out、价格和库存会变化，不能被翻译成“已经停产”，也不能反过来证明“持续生产”。Black Eye、Orion Nebula 和 Adrastea 可放回官方 2025 年的系列语境来理解，但年份语境不等于十四款共享首发年，也不等于每一张卡今天都以相同状态供应。

### 系列资料能确认什么

官方系列资料确认 Shizuku 以 handmade glass nib 为特色，以 international converter 供墨，并谈到 Duralumin 与 anodization。玻璃尖和 converter 的搭配值得特别指出：它不是把蘸水玻璃笔尖简单装到普通笔杆上，而是让玻璃书写端进入可携带、可补墨的自来水笔结构。信息图用概念箭头表达这条机制，但不是剖面工程图，也不证明内部零件比例。

这些系列事实仍有边界。Duralumin 与阳极氧化是官方对系列设计的描述，不足以推出十四个外观卡都使用同一表面配方、同一公差或同一批次结构；handmade 也不代表每支笔尖手感完全一致。颜色块只帮助定位卡片名称，不是色准、饰面或实物照片，系列营销也不能代替逐款 exact spec。

### Solis：目前资料最完整的一款

Solis 的当前商品页提供了更细的数据：Duralumin 笔身、screw cap、clear 或 black glass nib、EF／F／M 三种尖幅；合帽长度 154 mm，不合帽长度 128 mm，ring diameter 12 mm，重量约 25 g，并使用 international converter。

这些数值和选项都只适用于 Solis。154／128 mm、12 mm 与约 25 g 不是十四个 variants 的共同规格，clear／black 和 EF／F／M 也不能套到其他外观版本。商品页当日的价格、库存或 sold-out 只是会变化的商业状态，不是稳定的产品规格。

官方 collection 说明 glass nib 与 converter 的系列思路，Solis 商品页才支持具体长度、重量、ring 与尖幅，两者可以相互校验但不能相互扩张。日本官网若佐证同一字段，仍属于同一个 Wancher 官方来源体系，不能包装成第二个独立来源，更不能拿其他 sibling 的字段补充 Solis。`,
        evidenceLocators: ["entity.body_md:L3-L23"],
      },
      {
        oldText: `Susan M. Pigott 的 The Pen Addict 文章发表于 2019-08-30。文章清楚披露 Wancher 免费提供评测用 Earth 样品，所以它是一条有价值、也有明确利益关系的 professional secondary evidence。她记录的 Duralumin、合帽 26.5 g、去帽 18 g、合帽 137 mm、去帽 120 mm、笔帽不能套在尾端、约 10 mm grip、段差与接缝，以及玻璃尖的触感、流量与没有跳笔等观察，都只属于那支受赠 Earth sample。

这些数字与 Solis 当前商品页不同并不构成“谁对谁错”。它们描述了不同名称、不同日期和不同证据范围。2019 Earth 的 137／120 mm 与 26.5／18 g 被保存为 sample/history claims，并在当前稳定规格资格中标记为不合格；它们不会覆盖 Solis 的 154／128 mm 与约 25 g。反过来，Solis 的数据也不会重写历史样品。

文章还保存了当时 preorder 的八个名称：Blue Moon、Saturn、Earth、Mars、Venus、Pluto、Eclipse 与 Jupiter，以及当时的价格语境。它们是一条 2019 timeline 记录，不是 2026 collection 枚举的来源。若其中一些名称今天仍出现在官网，只能说明名称重叠；当前 variant 的证据仍来自 2026-07-22 官方 collection，历史 preorder 的证据仍来自 2019 Pen Addict 文章。

### 怎样阅读同名 Earth

当前卡片里的 Earth 只表达“取回日的官方 collection 有一张 Earth public card”，并带 mutable availability 提醒。历史 scope 里的 Earth 则表达“Pigott 在 2019 年评测了 Wancher 免费提供的 Earth 样品”，并附样品尺寸、重量、结构和书写感受。两条记录共享显示名，却不共享 source、date、scope、availability、dimensions、weight 或体验结论。

这种拆分避免两种常见误读。第一种是把 2019 年八个 preorder 名称当成今天的完整产品表；第二种是把 Solis 商品页的精确数值套到所有卡片上。本站选择保留全部有用事实，同时让每个事实随 citation locator、scope 与 retrieved／published date 一起出现。信息越丰富，边界越需要清楚。`,
        newText: `Susan M. Pigott 的 The Pen Addict 文章发表于 2019-08-30。文章清楚披露 Wancher 免费提供评测用 Earth 样品，因此它是一份有价值、也有明确利益关系的专业二手来源。她记录的 Duralumin、合帽 26.5 g、去帽 18 g、合帽 137 mm、去帽 120 mm、笔帽不能套在尾端、约 10 mm grip、段差与接缝，以及玻璃尖的触感、流量与没有跳笔等观察，都只属于那支受赠 Earth sample。

这些数字与 Solis 当前商品页不同并不构成“谁对谁错”。它们描述不同名称、不同日期和不同证据范围。2019 Earth 的 137／120 mm 与 26.5／18 g 只属于历史样品，不能覆盖 Solis 的 154／128 mm 与约 25 g；反过来，Solis 的数据也不能重写历史样品。

文章还保存了当时 preorder 的八个名称：Blue Moon、Saturn、Earth、Mars、Venus、Pluto、Eclipse 与 Jupiter，以及当时的价格语境。它们说明 2019 年的预售情况，不是 2026 collection 名单的来源。若其中一些名称今天仍出现在官网，只能说明名称重叠；当前 variant 应以 2026-07-22 官方 collection 为准，历史 preorder 则以 2019 Pen Addict 文章为准。

### 怎样阅读同名 Earth

当前卡片里的 Earth 只说明取回日的官方 collection 有一张 Earth public card，供应状态会变化。2019 年的 Earth 则是 Pigott 评测的 Wancher 受赠样品，附有那支样品的尺寸、重量、结构和书写感受。两者共享显示名，却不共享来源、日期、供应状态、尺寸、重量或体验结论。

这样区分可以避免两种误读：一是把 2019 年八个 preorder 名称当成今天的完整产品表，二是把 Solis 商品页的精确数值套到所有卡片上。保留事实的同时也要保留每条事实的来源和日期；信息越丰富，边界越需要清楚。`,
        evidenceLocators: ["entity.body_md:L27-L37"],
      },
      {
        oldText:
          "读者可以从这里继续漫游到 Wancher 品牌与既有 Dream Pen、PuChiCo 页面，但这些既有页面的正文、媒体、来源与 publication 不因 Shizuku 上线而改变。图谱只新增 Shizuku 与 Wancher 的品牌归属和反向导航；对全库而言，这仍是 full corpus goal 中的一次 partial batch：它把一个缺失型号做完整，不声称所有 Wancher 或所有钢笔内容已经完成。",
        newText:
          "Shizuku 属于 Wancher，也可与 Dream Pen、PuChiCo 等产品继续比较；这些产品各有独立的正文、图片与来源，不能互相补用。这里列出的 Shizuku 资料也不代表 Wancher 的完整产品目录，更不能代表所有钢笔型号。",
        evidenceLocators: ["entity.body_md:L43-L43"],
      },
      {
        oldText:
          "Solis 当前商品页列 clear／black glass nib 和 EF／F／M，但这个选择只属于 Solis exact scope。它不能证明十四张 collection card 都提供同样尖幅，也不能把 Earth 的历史样品写成 clear 或 black 的当前选择。购买时应把商品标题、尖端颜色、完整 card 名称和 converter 附件一起保存；若卖家只写“Shizuku glass pen”，证据不足时应保留待核状态。",
        newText:
          "Solis 当前商品页列 clear／black glass nib 和 EF／F／M，这些选择只适用于 Solis，不能证明十四张 collection card 都提供同样尖幅，也不能把 Earth 的历史样品写成 clear 或 black 的当前选择。购买时应一起核对商品标题、尖端颜色、完整 card 名称和 converter 附件；若卖家只写“Shizuku glass pen”，证据不足时应保留待核。",
        evidenceLocators: ["entity.body_md:L49-L49"],
      },
      {
        oldText:
          "官方 family 资料把 Duralumin 和 anodization 放在系列设计语境中，Solis 商品页才给出当前 exact product 的 Duralumin、screw cap、尺寸和重量。阳极氧化表面应避免钥匙、拉链和金属笔夹的长期摩擦；清洁使用室温清水和柔软无绒布，不能用酒精、研磨剂或强力超声。若笔帽螺纹出现砂感，先排空墨水、冲洗并自然干燥，不能一边带墨一边强行拧紧。",
        newText:
          "官方系列资料说明 Shizuku 的 Duralumin 与 anodization 设计，Solis 商品页则进一步给出 Duralumin、screw cap、尺寸和重量。阳极氧化表面应避免钥匙、拉链和金属笔夹的长期摩擦；清洁使用室温清水和柔软无绒布，不能用酒精、研磨剂或强力超声。若笔帽螺纹出现砂感，先排空墨水、冲洗并自然干燥，不能一边带墨一边强行拧紧。",
        evidenceLocators: ["entity.body_md:L53-L53"],
      },
      {
        oldText:
          "2026-07-22 去重后的十四个名称应理解为 collection snapshot。Black Eye、Orion Nebula、Eclipse、Solis、Blue Moon、Adrastea、Mars、Pluto、Andromeda、Gaia、Saturn、Jupiter、Earth、Venus 可以作为 variants 导航，但 sold-out、AS IS、outlet、价格与库存都应留在 mutable commerce 记录。2019 preorder 中的八个名称与今天重叠时，也不能用旧文章证明当前仍有售；相反，当前 card 也不能重写 Pigott 当年的样品尺寸和价格。",
        newText:
          "2026-07-22 去重后的十四个名称只是一份 collection snapshot：Black Eye、Orion Nebula、Eclipse、Solis、Blue Moon、Adrastea、Mars、Pluto、Andromeda、Gaia、Saturn、Jupiter、Earth、Venus 都可作为 variants 浏览，但 sold-out、AS IS、outlet、价格与库存只是会变化的商业信息。2019 preorder 中的八个名称与今天重叠时，旧文章不能证明当前仍有售，当前 card 也不能重写 Pigott 当年的样品尺寸和价格。",
        evidenceLocators: ["entity.body_md:L59-L59"],
      },
    ],
  },
  {
    manifestIndex: 580,
    entityId: "phase533-wancher-taka-flowers-praying-mantis",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-taka-maki-e-flowers-praying-mantis",
    expectedName: "Wancher Dream Pen Taka Maki-e Flowers and Praying Mantis",
    expectedStoryTitle:
      "Taka Maki-e Flowers and Praying Mantis：Taka Maki-e、题材与市场变体边界",
    expectedSourceMarker:
      "curated-content:phase533-wancher-flowers-praying-mantis-v1:732c43a216a05f8d8ffc8071e793c0f5ce2c8f9131c018223d9aed9e2082e2ad",
    expectedBodySha256: "9a05de716a68d31fe5b8460366d3aed792bc6fb50aca5102ac56f5fa45b20c96",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "官方 page 只提供 Size & Shape 的标题和包装，没有公开可复核的长度、直径、握径或可靠成品重量。JSON 中平台的 200 g 不作为实测规格。Default Title 是市场变体，不代表还有一组隐藏尖宽或 feed 选项。若卖家引用零售旧库存的尺寸、笔夹、编号或不同尖材，应保留来源和检索日期，不写进当前 exact `model_specs`。",
        newText:
          "官方 page 只提供 Size & Shape 的标题和包装，没有公开可复核的长度、直径、握径或可靠成品重量。JSON 中平台的 200 g 不作为实测规格。Default Title 是市场变体，不代表还有一组隐藏尖宽或 feed 选项。若卖家引用零售旧库存的尺寸、笔夹、编号或不同尖材，应同时提供来源和检索日期，不能把它们当作当前 exact product 的官方规格。",
        evidenceLocators: ["entity.body_md:L27-L27"],
      },
    ],
  },
  {
    manifestIndex: 598,
    entityId: "phase391-pen-wancher-tsuikin-twin-dragons-black-sohari",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-tsuikin-twin-dragons-black-sohari",
    expectedName: "Wancher Dream Pen Ryukyu Tsuikin – Twin Dragons Black Sohari",
    expectedStoryTitle: "Wancher Twin Dragons Black Sohari：黑漆底上的琉球堆锦双龙",
    expectedSourceMarker:
      "curated-content:phase391-pen-wancher-tsuikin-twin-dragons-black-sohari-v1:f5ad1237d55942c5c6c8c90c841cfcc81e5e8577a1dde8e54250aaa7f2fe7ecf",
    expectedBodySha256: "d267a76eab2989682195a4474f46a9fc254eecf07fc40b47ea94e65802453913",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Twin Dragons Black Sohari 的身份重点是“黑色总贴/So-hari 路线”，不是一支普通黑漆双龙笔。官方明确给出了 Ebonite、Nashiji Tsuikin-mochi 基底、堆锦工艺、两类尖材、三类 feed、欧规 C/C、气密帽、包装、$1,600 USD 与 Sold out 状态；官方没有给出尺寸、重量、产量、独立首发年和隐藏选项解释。把已知和未公布分开写，才能让这支工艺笔在知识图谱中保持可复查的型号身份。",
        newText:
          "Twin Dragons Black Sohari 的身份重点是“黑色总贴/So-hari 路线”，不是一支普通黑漆双龙笔。官方明确给出了 Ebonite、Nashiji Tsuikin-mochi 基底、堆锦工艺、两类尖材、三类 feed、欧规 C/C、气密帽、包装、$1,600 USD 与 Sold out 状态；尺寸、重量、产量、独立首发年和隐藏选项解释则未公开。把已知和未公布分开，才能保持这支工艺笔可复查的型号身份。",
        evidenceLocators: ["entity.body_md:L97-L97"],
      },
    ],
  },
  {
    manifestIndex: 600,
    entityId: "phase390-pen-wancher-tsuikin-twin-dragons-red-urushi",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-tsuikin-twin-dragons-red-urushi",
    expectedName: "Wancher Dream Pen Ryukyu Tsuikin – Twin Dragons Red Urushi",
    expectedStoryTitle: "Wancher Twin Dragons Red Urushi：朱漆底上的琉球堆锦双龙",
    expectedSourceMarker:
      "curated-content:phase390-pen-wancher-tsuikin-twin-dragons-red-urushi-v1:921d27fb0a75b085e40aa756c70255bddb50b20870d465d94f62c190ca2cb9c4",
    expectedBodySha256: "c90f124d3aebe8c53304dcbddbd91a9bf205aae9a2f312d69c1463ff3be6d01b",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "## 资料冲突与后续更新规则\n\n国际站与日本站在币种、税费和商品状态上的差异是市场页面差异，不应被压成一个“统一价格”字段。国际 Red Urushi 页面在本次检索时显示 `$1,000.00 USD` 并可加入购物车，日本站集合页显示含税 `￥110,000 JPY`；两者都带有检索日期，后续库存变化时可以更新“当前状态”而不改写历史来源。若页面重新出现 Sold out，应该新增带日期的状态陈述，不能把旧的“可购买”当作永久事实。",
        newText:
          "## 两个市场页面怎样理解\n\n国际站与日本站在币种、税费和商品状态上的差异属于各自市场，不能压成一个“统一价格”。国际 Red Urushi 页面在本次检索时显示 `$1,000.00 USD` 并可加入购物车，日本站集合页显示含税 `￥110,000 JPY`；两个数字都只对应各自检索日。库存以后若变为 Sold out，应以新日期重新核对，旧的“可购买”不能当作永久事实。",
        evidenceLocators: ["entity.body_md:L79-L81"],
      },
    ],
  },
  {
    manifestIndex: 604,
    entityId: "phase331-pen-wancher-world-tree-ebony",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-world-tree-ebony",
    expectedName: "Wancher World Tree – Ebony",
    expectedStoryTitle:
      "Wancher World Tree – Ebony：天然乌木与可拆银夹：木材、夹件、供墨与版本边界深化",
    expectedSourceMarker:
      "curated-content:phase423-wancher-world-tree-phase331-pen-wancher-world-tree-ebony-refresh-v1:63772ebbd8deda6546f6e3767d43129e0f22895e3c039963301bd221e85b3c1d",
    expectedBodySha256: "89fc6ada398b13a240581ff958bf138c18214506a8285ea5a168ee80d4e30db6",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "后续若官方更新尺寸、尖或夹件，新增带日期的来源并注明市场；若只是商品图、价格或库存变化，更新商业快照，不修改 Ebony 的木种身份。这样品牌页可以继续跳转到五个木材入口，而不会因为一张黑色照片把木种和配置重新混合。",
        newText:
          "官方以后若更新尺寸、笔尖或夹件，应按来源日期和市场理解；若只是商品图、价格或库存变化，也不会改变 Ebony 的木种身份。World Tree 的五种木材各有独立入口，不能因为一张黑色照片就把木种和配置重新混合。",
        evidenceLocators: ["entity.body_md:L69-L69"],
      },
    ],
  },
  {
    manifestIndex: 606,
    entityId: "phase333-pen-wancher-world-tree-teak",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-world-tree-teak",
    expectedName: "Wancher World Tree – Teak Wood",
    expectedStoryTitle:
      "Wancher World Tree – Teak Wood：天然柚木与纵向纹理：木材、夹件、供墨与版本边界深化",
    expectedSourceMarker:
      "curated-content:phase423-wancher-world-tree-phase333-pen-wancher-world-tree-teak-refresh-v1:fba34c13170b83ddfe23c13ac4ee7e4827160deec8ef90892d73ac0e8b5bd46d",
    expectedBodySha256: "5892fb288872b445c2f5ff184669b820752546c09b957f6e5d94ac7c23702abe",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "一支具体 Teak 的证据卡应包含：完整商品名和 URL；检索日期；木纹与颜色照片；No Clip/哑银夹/银夹状态；尖材、尖幅、feed、converter；称重条件；木盒、发票、维修和保存环境。未知字段写“未知”，不从 Ebony、Sandalwood、Verawood 或 Sekai Ai 复制。后续官方更新商品图或库存时只更新快照，保留木种身份与历史读回。",
        newText:
          "核对一支具体 Teak 时，应确认完整商品名和 URL、检索日期、木纹与颜色照片、No Clip/哑银夹/银夹状态、尖材、尖幅、feed、converter、称重条件，以及木盒、发票、维修和保存环境。未知项目应明确写“未知”，不能从 Ebony、Sandalwood、Verawood 或 Sekai Ai 复制。官方以后更新商品图或库存，也不会改变已经确认的木种身份和历史状态。",
        evidenceLocators: ["entity.body_md:L75-L75"],
      },
    ],
  },
  {
    manifestIndex: 612,
    entityId: "phase523-wancher-yakumo-nuri-chijimi-black",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-yakumo-nuri-chijimi-black",
    expectedName: "Wancher Yakumo-nuri Chijimi - Black",
    expectedStoryTitle: "Yakumo-nuri Chijimi Black：漆艺、配置与身份边界",
    expectedSourceMarker:
      "curated-content:phase523-wancher-yakumo-chijimi-black-v1:57227cf2b74862d5a3e40ec49489bcc8cb8b14bc4c8416990be18cd4d2a8ebca",
    expectedBodySha256: "ac9b862ca839e44f9ad03a8657b90cc16a23a5daf65c5fe409e775efb1331b40",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "选购时先确定 Solid Gold 或 Rhodium-plated，再选择普通 Shogun 尖面或 Kodachi、尖幅和完整 SKU；不要只说“黑色 Chijimi”而省略 18K/铑饰差异。二手核对要保存 product id `9174850044119`、handle、变体 SKU、Ebonite、Yakumo-nuri、Chijimi、Plastic feed、Sailor Standard 供墨、木盒和 pen kimono。不要把 Chijimi Black 与 Phase 517 的 Chijimi Aodaisho、Nishikihebi、Shirohebi 合并，它们是同技法下的不同商品记录。",
        newText:
          "选购时先确定 Solid Gold 或 Rhodium-plated，再选择普通 Shogun 尖面或 Kodachi、尖幅和完整 SKU；不要只说“黑色 Chijimi”而省略 18K/铑饰差异。二手核对要保存 product id `9174850044119`、handle、变体 SKU、Ebonite、Yakumo-nuri、Chijimi、Plastic feed、Sailor Standard 供墨、木盒和 pen kimono。不要把 Chijimi Black 与 Chijimi Aodaisho、Nishikihebi、Shirohebi 合并，它们是同技法下的不同商品。",
        evidenceLocators: ["entity.body_md:L19-L19"],
      },
    ],
  },
  {
    manifestIndex: 614,
    entityId: "phase524-wancher-yakumo-nuri-chijimi-shirohebi",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-yakumo-nuri-chijimi-shirohebi",
    expectedName: "Wancher Yakumo-nuri Chijimi - Shirohebi Fountain Pen",
    expectedStoryTitle: "Yakumo-nuri Chijimi Shirohebi：漆艺、配置与身份边界",
    expectedSourceMarker:
      "curated-content:phase524-wancher-yakumo-shirohebi-v1:93d395d5aa8aef6361aed2bf50a0e62cd52c521502607a4c7612551db7e8c557",
    expectedBodySha256: "4f47504bd9aa88b6cadd910759f37154ef7ad0d58ea1af316700bb3f675558d2",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "这支笔的白蛇名称是设计主题，Chijimi 纹理才是表面工艺；两者都不能用来推断限量总数、开售日期或二手溢价。官方当前页面给出商品价格和标签，库存与税费会变，任何转售描述都应附检索日期。与 Shirohebi 同集合的 Nishikihebi、Aodaisho 和 Phase 523 的 Chijimi Black 是独立商品，不能以颜色或图案相似为理由共用 product id、SKU 或图片。",
        newText:
          "这支笔的白蛇名称是设计主题，Chijimi 纹理才是表面工艺；两者都不能用来推断限量总数、开售日期或二手溢价。官方当前页面给出商品价格和标签，库存与税费会变，任何转售描述都应附检索日期。与 Shirohebi 同集合的 Nishikihebi、Aodaisho 和 Chijimi Black 是独立商品，不能以颜色或图案相似为理由共用 product id、SKU 或图片。",
        evidenceLocators: ["entity.body_md:L23-L23"],
      },
    ],
  },
  {
    manifestIndex: 618,
    entityId: "phase525-wancher-yakumo-shibo-homura",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-yakumo-nuri-shibo-urushi-homura",
    expectedName: "Wancher Yakumo-nuri Shibo Urushi - Homura Fountain Pen",
    expectedStoryTitle: "Yakumo-nuri Shibo Urushi Homura：漆艺、配置与身份边界",
    expectedSourceMarker:
      "curated-content:phase525-wancher-yakumo-shibo-homura-v1:9fdc261e7b07093e063a513825ab362a5a6a0b64b1ae173a567914e1d3cfe8a3",
    expectedBodySha256: "f558ba2d7bcdd81ca217071652aa650ec251afc41e10775052cc806a09087529",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Homura 与 Sazanami、Shinra、Phase 523 的 Ryuusei 同属 Yakumo-nuri，但工艺主题和 exact product 记录不同；Chijimi 是另一套收缩漆过程，不能把 Shibo 的金属粉刮显纹样写成深线树皮。官方集合页有时显示售罄，JSON 的 `available now` 标签和页面库存应以检索时间为准，不能据此认定永久停产或假货。",
        newText:
          "Homura 与 Sazanami、Shinra、Ryuusei 同属 Yakumo-nuri，但工艺主题和 exact product 信息不同；Chijimi 是另一套收缩漆过程，不能把 Shibo 的金属粉刮显纹样写成深线树皮。官方集合页有时显示售罄，JSON 的 `available now` 标签和页面库存应以检索时间为准，不能据此认定永久停产或假货。",
        evidenceLocators: ["entity.body_md:L21-L21"],
      },
    ],
  },
  {
    manifestIndex: 620,
    entityId: "phase525-wancher-yakumo-shibo-sazanami",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-yakumo-nuri-shibo-urushi-sazanami",
    expectedName: "Wancher Yakumo-nuri Shibo Urushi - Sazanami Fountain Pen",
    expectedStoryTitle: "Yakumo-nuri Shibo Urushi Sazanami：漆艺、配置与身份边界",
    expectedSourceMarker:
      "curated-content:phase525-wancher-yakumo-shibo-sazanami-v1:dd1085f34725993558be5fb3f04a43cae12aa72ff4d21bd31c45f653502059db",
    expectedBodySha256: "0f2a42d415d9ed167c4a7514e286a7c822d95e23f80c6727d6eb1eefee580e5b",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Sazanami 的波纹主题与 Ryuusei、Homura、Shinra 的主题不同，不能共用 product id、SKU 或图片。它也不是 Phase 524 的 Chijimi 收缩漆：Shibo Urushi 通过金属粉、覆盖、刮显与抛光形成纹样，不能用 Chijimi 的深线和树皮触感描述。官方集合中的售罄标签可能滞后于 JSON，研究记录应保存检索日期，不把某次状态写成永久停产。",
        newText:
          "Sazanami 的波纹主题与 Ryuusei、Homura、Shinra 不同，不能共用 product id、SKU 或图片。它也不是 Chijimi 收缩漆：Shibo Urushi 通过金属粉、覆盖、刮显与抛光形成纹样，不能用 Chijimi 的深线和树皮触感描述。官方集合中的售罄标签可能滞后于 JSON，因此供应状态必须结合检索日期理解，不能把某次状态写成永久停产。",
        evidenceLocators: ["entity.body_md:L21-L21"],
      },
    ],
  },
  {
    manifestIndex: 621,
    entityId: "phase525-wancher-yakumo-shibo-shinra",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-yakumo-nuri-shibo-urushi-shinra",
    expectedName: "Wancher Yakumo-nuri Shibo Urushi - Shinra Fountain Pen",
    expectedStoryTitle: "Yakumo-nuri Shibo Urushi Shinra：漆艺、配置与身份边界",
    expectedSourceMarker:
      "curated-content:phase525-wancher-yakumo-shibo-shinra-v1:551a7ba980229143bc6b7df21cd050e8722cc2d9fba194c65ef56858b1d75686",
    expectedBodySha256: "2384cbf6e48a12e9f688020200128f5aed98fdb037ebebf3ee304ace4fa20d7c",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "购买和二手核对要保存完整标题、product id `8766019272919`、handle、SKU `WF-MOUR-DR-YAK-GR`、Ebonite、Yakumo-nuri、Shibo Urushi、尖面、feed、欧规 cartridge、木盒和 pen kimono。不要把绿色昵称当作身份字段，也不要以 Shinra 的“自然生命”文字推断某个官方色号。相邻的 Sazanami、Homura、Ryuusei 以及 Phase 524 的 Chijimi 三色都必须保留自己的 product id 和 SKU；Shibo 的金属粉刮显过程也不等于 Chijimi 的收缩纹理。",
        newText:
          "购买和二手核对要保存完整标题、product id `8766019272919`、handle、SKU `WF-MOUR-DR-YAK-GR`、Ebonite、Yakumo-nuri、Shibo Urushi、尖面、feed、欧规 cartridge、木盒和 pen kimono。不要把绿色昵称当作身份字段，也不要以 Shinra 的“自然生命”文字推断某个官方色号。相邻的 Sazanami、Homura、Ryuusei 以及 Chijimi 三色都有各自的 product id 和 SKU；Shibo 的金属粉刮显过程也不等于 Chijimi 的收缩纹理。",
        evidenceLocators: ["entity.body_md:L19-L19"],
      },
    ],
  },
  {
    manifestIndex: 634,
    entityId: "phase385-pen-wancher-zogan-swan",
    brandEntityId: "eOfD77nOeENN",
    slug: "wancher-zogan-swan-urushi-teal",
    expectedName: "Wancher Dream Pen Zogan Swan – Urushi Teal",
    expectedStoryTitle: "Wancher Zogan Swan：湖水色 Urushi 与珍珠母贝天鹅",
    expectedSourceMarker:
      "curated-content:phase385-pen-wancher-zogan-swan-v1:ccc6a4b1770d1ba62f446917facda61e22a3343248753e4cf56c9af891f1d235",
    expectedBodySha256: "5e7bfba556d363e3a8bd8146800773de2e6a897b50b8f269c37db6fc1ef0d941",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "很多 Dream Pen 页面会在不同商品或系列页出现尺寸数字，但这款 Swan 当前可核验的商品文字只显示 `Size & Shape` 图片，没有公开数值长、直径或重量。相邻 Zogan、World Tree 或 True Urushi 页面即使有尺寸，也可能使用不同的笔杆、帽体、夹件或尖组，不能拼成 Swan 的规格。缺失字段在知识图谱中保留为“未公布”，比把别款数字复制过来更能保护型号身份。",
        newText:
          "很多 Dream Pen 页面会在不同商品或系列页出现尺寸数字，但这款 Swan 当前可核验的商品文字只显示 `Size & Shape` 图片，没有公开长度、直径或重量数值。相邻 Zogan、World Tree 或 True Urushi 页面即使有尺寸，也可能使用不同的笔杆、帽体、夹件或尖组，不能拼成 Swan 的规格。缺失项目明确标为“未公布”，比复制别款数字更能保护型号身份。",
        evidenceLocators: ["entity.body_md:L57-L57"],
      },
    ],
  },
] as const satisfies readonly Phase610SemanticPatch[];
