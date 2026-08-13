import type {
  Phase610SemanticPatch,
  Phase610TextReplacement,
} from "./semantic-cleanup-types";

function replacement(
  oldText: string,
  newText: string,
  evidenceLocators: readonly string[],
  researchUrls?: readonly string[],
): Phase610TextReplacement {
  return { oldText, newText, evidenceLocators, researchUrls };
}

export const phase610GroupCPatches: readonly Phase610SemanticPatch[] = [
  {
    manifestIndex: 2,
    entityId: "cVCGtVIb8WBd",
    brandEntityId: "phase66-brand-4021dffad5ea8c4af6d7692b",
    slug: "asvine-p36",
    expectedName: "Asvine P36 Titanium Piston-Filling Fountain Pen",
    expectedStoryTitle: "Asvine P36：活塞，不是真空",
    expectedSourceMarker:
      "curated-content:phase66-asvine-p36-v1:bcbe52dab6e4fa70bd4c0ab72746acf610fb14ce99996678611652582fe4c137",
    expectedBodySha256:
      "b31b8e5600d79e12b4153156b83f490157eb54ae556b2aef7808db9a368fe3e0",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "本站暂不把销售站的自述当作可核实的法人沿革或工厂史；这里把 Asvine 当作公开市场中可辨认的品牌入口，并以已获得两类来源交叉支持的 P36 开始建立型号导航。这个入口不是“全系列已经补齐”的承诺",
        "销售站的品牌自述不足以证明法人沿革或工厂史；目前可以确认 Asvine 是公开市场中可辨认的品牌，P36 也有两类来源交叉支持。P36 的资料不能代表全系列",
        ["entity.body_md:L1-L1"],
      ),
      replacement(
        "本站主视觉采用原创事实示意图，并明确写明不是产品照片，因此不暗示某个颜色、笔尖、Logo、库存或真实比例。未来若取得可正确归属且许可明确的 P36 实物图，会以型号和版本为单位加入，而不是用相似产品“补图”",
        "随页主视觉是原创事实示意图，不是产品照片，也不代表某个颜色、笔尖、Logo、库存或真实比例。判断具体版本时应查看归属明确、许可清楚的 P36 实物图，不能用相似产品代替",
        ["entity.body_md:L13-L13"],
      ),
      replacement(
        "对已有旧中文入口的读者，旧路由会指向这张经过改名和关系修正的页面；YiSiHua 只保留为历史错误归属所需的资料边界，不再作为 P36 的制造品牌",
        "YiSiHua 曾被错误地写成 P36 的制造品牌；这一名称只用于解释旧资料中的误归属，不代表实际制造关系",
        ["entity.body_md:L15-L15"],
      ),
    ],
  },
  {
    manifestIndex: 33,
    entityId: "phase563-caran-dache-849-fountain-pen",
    brandEntityId: "phase139-brand-caran-dache",
    slug: "caran-dache-849-fountain-pen",
    expectedName: "Caran d’Ache 849 Fountain Pen",
    expectedStoryTitle:
      "Caran d’Ache 849 Fountain Pen：六角铝身、钢尖与墨囊日用路线",
    expectedSourceMarker:
      "curated-content:phase563-caran-dache-849-fountain-pen-v1:e57afb31dbca161aa4eb425583ba6df3053ab3447bdccb72333367561d3a6c37",
    expectedBodySha256:
      "b2932288e251414ef960843292a496fd7150185fe9277425d9246e5a55e9fe4c",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "当前资料库原本没有 Caran d’Ache 849 Fountain Pen 的独立实体。这里新增的是一个型号入口",
        "Caran d’Ache 849 Fountain Pen 是独立的钢笔型号",
        ["entity.body_md:L5-L5"],
      ),
      replacement(
        "颜色、表面、尖幅和商品参考号应留在 variant 层",
        "颜色、表面、尖幅和商品参考号属于同一型号下的不同版本",
        ["entity.body_md:L5-L5"],
      ),
    ],
  },
  {
    manifestIndex: 39,
    entityId: "phase137-pen-conklin-1898-misto",
    brandEntityId: "9UPHCybD7qAX",
    slug: "conklin-1898-misto",
    expectedName: "Conklin 1898 Misto",
    expectedStoryTitle: "Conklin 1898 Misto：混色树脂、金尖选项与样笔 QC 分开读",
    expectedSourceMarker:
      "curated-content:phase137-conklin-1898-misto-v1:4cdc57c848c871846604241e511296711a34d52b71fdb478cd38b0e3182e8439",
    expectedBodySha256:
      "beb179fe10de3c007451cb934b970b3cc91e73d00021990f03ce3fac536ab716",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "因此结构化 weight 留作“按 SKU／样本核对”",
        "因此重量应按 SKU 或具体样本核对",
        ["entity.body_md:L11-L11"],
      ),
      replacement(
        "知识图谱把这两面都保留",
        "这两项事实需要同时保留",
        ["entity.body_md:L23-L23"],
      ),
      replacement(
        "不进入长期价格字段",
        "不能视为长期价格",
        ["entity.body_md:L25-L25"],
      ),
    ],
  },
  {
    manifestIndex: 41,
    entityId: "phase136-pen-conklin-duragraph",
    brandEntityId: "9UPHCybD7qAX",
    slug: "conklin-duragraph",
    expectedName: "Conklin Duragraph",
    expectedStoryTitle: "Conklin Duragraph：当前家族、具体材质与旧评测样笔分开读",
    expectedSourceMarker:
      "curated-content:phase136-conklin-duragraph-v1:cdbbfa2857b8ab6df0fc1422a296f6605550d364f557a7c09a0c2278053171d8",
    expectedBodySha256:
      "340c3a99cdbbffe36dbde169a4b0e74cefd5527569c407e397d6dbd8fd32122a",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "### 为什么不把每个颜色都建成一支新型号",
        "### 颜色与版本怎么区分",
        ["entity.body_md:L9-L9"],
      ),
      replacement(
        "本站因此把它们保留为当前家族中的版本线索，不为每个颜色复制相同正文，也不根据商品图推断未写明的重量、树脂配方或产地",
        "这些名称代表当前家族中的不同版本；商品图不能证明未写明的重量、树脂配方或产地",
        ["entity.body_md:L11-L11"],
      ),
      replacement(
        "所以本页的结构化重量字段明确留作“按 SKU 核对”",
        "所以重量需要按具体 SKU 核对",
        ["entity.body_md:L13-L13"],
      ),
      replacement(
        "它们在数据库里只作为当前选项名称记录",
        "它们只是官网列出的当前选项名称",
        ["entity.body_md:L31-L31"],
      ),
    ],
  },
  {
    manifestIndex: 42,
    entityId: "phase137-pen-conklin-endura-deco-crest",
    brandEntityId: "9UPHCybD7qAX",
    slug: "conklin-endura-deco-crest",
    expectedName: "Conklin Endura Deco Crest",
    expectedStoryTitle: "Endura Deco Crest：树脂、金属外罩与冲突商品页分开读",
    expectedSourceMarker:
      "curated-content:phase137-conklin-endura-deco-crest-v1:c6f0ab2387835da154f1449b3d03cbdce6217119ecfc3a4e298eb03a2cb941fa",
    expectedBodySha256:
      "ce4e8c6a16f2b7da97e5ada1c6fc460b8ed32e4f0d6c7c2e8143a29b684ce748",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "本页 `/pen/conklin-endura-deco-crest` 只承载 fountain pen 基础型号；同名 rollerball、ballpoint、颜色和饰件作为书写模式或 SKU 区分，不复制成同一实体",
        "这里讨论的是 fountain pen 基础型号；同名 rollerball、ballpoint、颜色和饰件需要按书写模式或 SKU 分开辨认",
        ["entity.body_md:L1-L1"],
      ),
      replacement(
        "冲突被记录为 resolved-by-rejection，而不是悄悄选择一边",
        "遇到这种冲突，应保留 Blue SKU 的身份线索，同时拒绝套用明显复制错位的 Orange 参数",
        ["entity.body_md:L7-L7"],
      ),
      replacement(
        "官方未给统一重量，结构化字段就应保持“按 SKU 核对”",
        "官方未给统一重量，购买时应按具体 SKU 核对",
        ["entity.body_md:L13-L13"],
      ),
      replacement(
        "又不让错误商品文案和包装字段进入知识图谱",
        "又不把错误商品文案和包装字段当成钢笔规格",
        ["entity.body_md:L37-L37"],
      ),
    ],
  },
  {
    manifestIndex: 45,
    entityId: "p243ConwayStewartSeries100",
    brandEntityId: "p243ConwayStewartBrand",
    slug: "conway-stewart-series-100",
    expectedName: "Conway Stewart Series 100",
    expectedStoryTitle: "Conway Stewart Series 100：Classic Black 的金尖与现代复兴边界",
    expectedSourceMarker:
      "curated-content:phase243-conway-stewart-series-100-v1:bb0bcdbcb2f5a05bb9c22a11f7f36e7c3d8e8e19f301d89ad2005ddc1d7203c9",
    expectedBodySha256:
      "59befe6d05d546777cc3b6b1f86df2dce1c931cd40dbda7894e4338efa1c0fe4",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "Series 100 的颜色和 finish 适合建成一个产品下的 variant 层",
        "Series 100 的颜色和表面处理属于同一产品下的不同版本",
        ["entity.body_md:L11-L11"],
      ),
      replacement(
        "应以 exact product type 和套装范围落到 variant 或 edition",
        "应按确切的产品类型和套装范围区分版本或特别版",
        ["entity.body_md:L11-L11"],
      ),
      replacement(
        "随页原创 SVG 只画出 Series 100 的历史年份、C/C 路线、18ct 尖、尺寸和 variant 层级。它明确是 factual diagram、非商品照片、非 Conway Stewart logo、非比例图、非颜色校样",
        "随页原创 SVG 只说明 Series 100 的历史年份、C/C 路线、18ct 尖、尺寸和版本层级。它是事实示意图，不是商品照片、Conway Stewart 标志、比例图或颜色校样",
        ["entity.body_md:L17-L17"],
      ),
    ],
  },
  {
    manifestIndex: 49,
    entityId: "p301CrossCenturyII",
    brandEntityId: "AcglIcVOba3Y",
    slug: "cross-century-ii",
    expectedName: "高仕 Cross Century II",
    expectedStoryTitle: "Cross Century II：更宽的现代 Classic Century 家族",
    expectedSourceMarker:
      "curated-content:phase301-cross-century-ii-v1:b5cb60232f7402e547b96d00db795efeffe19280d8227eb5ebbb10edc5c17aa1",
    expectedBodySha256:
      "41bc697e73ba55c814378f50e5303724ce32f05f14ded045d743dd3e95ceda29",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "本站只建立一个 Century II 型号页，并把这些项目作为具体版本线索，不把每个颜色另建为钢笔实体",
        "这些货号都属于 Century II；颜色、饰件和尖幅是具体版本线索，不是彼此独立的钢笔型号",
        ["entity.body_md:L7-L7"],
      ),
      replacement(
        "主图必须和 AT0086 货号及 finish 对得上",
        "验货图片必须和 AT0086 货号及表面处理对得上",
        ["entity.body_md:L31-L31"],
      ),
    ],
  },
  {
    manifestIndex: 51,
    entityId: "phase140-current-delta-dolcevita-mid-size",
    brandEntityId: "phase140-brand-current-delta",
    slug: "current-delta-dolcevita-mid-size",
    expectedName: "当代 Delta Dolcevita Mid-Size",
    expectedStoryTitle: "当代 Dolcevita Mid-Size：steel C/C 与 14K piston 分流",
    expectedSourceMarker:
      "curated-content:phase140-dolcevita-v1:c83b68ba0f5c9cca669013267a7738ec7c5a3b5fb3609feeecffc0c38a651fe9",
    expectedBodySha256:
      "1cd6868255b17f6f97174d4fbc0023c5467a0724119b065a5f909796fbba04c1",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "这页采用“商品身份先于故事”的写法。",
        "判断这支笔时，商品身份比相似的品牌故事更可靠。",
        ["entity.body_md:L5-L5"],
      ),
      replacement("Official primary:", "官方一手资料：", ["entity.body_md:L37-L37"]),
      replacement(
        "Professional secondary:",
        "专业二手资料：",
        ["entity.body_md:L38-L38"],
      ),
      replacement(
        "Site-original factual SVG: non-photo, non-logo, not-to-scale, non-colour-proof; it is media evidence only and never an independent product-fact source.",
        "随页原创事实示意图不是产品照片、品牌标志、比例图或颜色校样，也不能独立证明产品事实。",
        ["entity.body_md:L39-L39"],
      ),
      replacement(
        "- Rejected/qualified evidence: steel C/C/direct 与 14K piston 不交叉拼装为一套。旧 Delta 的 Medium、Piston、Oversize、Slim、Soirée 与 Fusion nib 档案只能做历史 sibling；旧样笔重量与手感不回填复兴款。",
        "- 不适用或受限资料：steel C/C/direct 与 14K piston 不可交叉拼装成一套规格。旧 Delta 的 Medium、Piston、Oversize、Slim、Soirée 与 Fusion nib 档案只能用来理解相邻历史型号；旧样笔重量与手感不能回填复兴款。",
        ["entity.body_md:L40-L40"],
      ),
    ],
  },
  {
    manifestIndex: 52,
    entityId: "phase140-current-omas-ogiva",
    brandEntityId: "phase140-brand-current-omas",
    slug: "current-omas-ogiva",
    expectedName: "当代 OMAS Ogiva",
    expectedStoryTitle: "当代 OMAS Ogiva：复兴后 demonstrator 的独立规格",
    expectedSourceMarker:
      "curated-content:phase140-ogiva-v1:5e846e55abbcbac0ecbd16de17ac4566746e2bccac6f659ae56c4c663464cef2",
    expectedBodySha256:
      "3b76ff2f5cc2cf6882420af401f2d6ae74573abb3345a5f8a710ffd71e86ff95",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "这页采用“商品身份先于故事”的写法。",
        "判断这支笔时，商品身份比相似的品牌故事更可靠。",
        ["entity.body_md:L5-L5"],
      ),
      replacement("Official primary:", "官方一手资料：", ["entity.body_md:L37-L37"]),
      replacement(
        "Professional secondary:",
        "专业二手资料：",
        ["entity.body_md:L38-L38"],
      ),
      replacement(
        "Site-original factual SVG: non-photo, non-logo, not-to-scale, non-colour-proof; it is media evidence only and never an independent product-fact source.",
        "随页原创事实示意图不是产品照片、品牌标志、比例图或颜色校样，也不能独立证明产品事实。",
        ["entity.body_md:L39-L39"],
      ),
      replacement(
        "Rejected/qualified evidence:",
        "不适用或受限资料：",
        ["entity.body_md:L40-L40"],
      ),
    ],
  },
  {
    manifestIndex: 68,
    entityId: "phase257-eboya-houju-m-black",
    brandEntityId: "phase257-brand-eboya",
    slug: "eboya-houju-m-black",
    expectedName: "Eboya HOUJU M size (BLACK)",
    expectedStoryTitle: "Eboya HOUJU M 黑色款：日兴硬橡胶工坊的传统圆润造型",
    expectedSourceMarker:
      "curated-content:phase257-eboya-houju-m-v1:f919ee1c4379fb362ad019ec9ce39ccf2bfe4d343c8f79c5a31ef516bbd5f6ae",
    expectedBodySha256:
      "c2bc62696c578a1ba10c13a81de4fc7abab985175856d57bd1797b9eb01e967c",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "正文不把“轻”“暖”“顺滑”写成全批次统一结论",
        "“轻”“暖”“顺滑”只是具体样本的观察，不能当作全批次统一结论",
        ["entity.body_md:L23-L23"],
      ),
      replacement(
        "## 品牌、型号与版本关系",
        "## HOUJU 与 Eboya 其他型号",
        ["entity.body_md:L25-L25"],
      ),
      replacement(
        "品牌页与 HOUJU 型号页应以明确的制造者关系连接",
        "HOUJU 由 Eboya 制作，Eboya 又由 Nikko Ebonite 的制作体系运营",
        ["entity.body_md:L27-L27"],
      ),
      replacement(
        "品牌导航只列出可核对的家族入口，不能把所有 ebonite 钢笔压成 HOUJU 的变体",
        "Hakobune、Houga、Kyouka、Natsume、Ricchiku、Yatate 和 Yuzen 等家族各有造型或供墨路线，不能都当成 HOUJU 的版本",
        ["entity.body_md:L27-L27"],
      ),
    ],
  },
  {
    manifestIndex: 69,
    entityId: "phase267-edison-collier",
    brandEntityId: "phase267-brand-edison",
    slug: "edison-collier",
    expectedName: "Edison Collier",
    expectedStoryTitle: "Edison Collier：美国小批量制笔的圆润大号树脂笔",
    expectedSourceMarker:
      "curated-content:phase267-edison-collier-v1:0587625c9490a89027a65e4b4f9c931727cffbb7a6dbed0f9064c078bea0981f",
    expectedBodySha256:
      "3564e87670e453da39a8623af132cf1d052f7067df9b2215c600eeb3fc2679fe",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "图谱因此只建立一个 Collier 型号，把 Signature／Production 作为路线 variant，而不拆成两个互相重复的型号",
        "Signature 与 Production 是 Collier 的两条产品路线，不是两个彼此重复的基础型号",
        ["entity.body_md:L7-L7"],
      ),
      replacement(
        "应进入另一型号页面或作为明确的 sibling 链接",
        "应作为明确的相邻型号分开核对",
        ["entity.body_md:L31-L31"],
      ),
    ],
  },
  {
    manifestIndex: 70,
    entityId: "phase306-edison-menlo",
    brandEntityId: "phase267-brand-edison",
    slug: "edison-menlo",
    expectedName: "Edison Menlo",
    expectedStoryTitle: "Edison Menlo：Pump Filler 与定制上墨路线的美国手工钢笔",
    expectedSourceMarker:
      "curated-content:phase306-edison-menlo-v1:0e70d5f176f5babf85cd10eb5c6633449540ab5dd52b85bb2772004bc40467ce",
    expectedBodySha256:
      "b1ce9860c146a964569d8601bbe3fb04de529a39ca3c7433aed87f81a9c935f2",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "因此本页把 Menlo 作为型号入口，把每支定制笔的材料、尖号和机构留在 variant／单支记录里",
        "因此 Menlo 应作为基础型号理解，每支定制笔的材料、尖号和上墨机构还要按具体成品核对",
        ["entity.body_md:L1-L1"],
      ),
      replacement(
        "它们是同一 Menlo 型号下的机构变体，不应拆成三个互相重复的品牌型号；真正需要拆分的是有明确产品代码、材质或限量命名的独立商品，而不是单纯的颜色",
        "它们是同一 Menlo 型号下的三种机构选择。只有具备明确产品代码、材质或限量命名的独立商品才需要分开辨认，单纯颜色变化不构成新型号",
        ["entity.body_md:L27-L27"],
      ),
    ],
  },
  {
    manifestIndex: 86,
    entityId: "TDLhXLvIOq6p",
    brandEntityId: "xVHzH0mMviM4",
    slug: "faber-castell-loom",
    expectedName: "Faber-Castell LOOM",
    expectedStoryTitle:
      "LOOM：金属表面与钢尖体验的入门进阶线：官方 SKU、材料与使用边界深化",
    expectedSourceMarker:
      "curated-content:phase424-faber-castell-TDLhXLvIOq6p-refresh-v1:bb4037cbbce7dc55f3c8cfe870dfc2aa3e9244237e98392122de3fe02451ef22",
    expectedBodySha256:
      "d66d9cce5d42d336718aa3e32dc722f29ea28603df99329467dce5d80cb3db64",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "本站原创 factual SVG 以金属筒、宽握位、钢尖和 Metallic/Gunmetal/Piano 边界作说明，示意图，非产品照片，不表现真实比例、颜色、涂层反光、Logo 或具体库存。圆珠、滚珠和自动铅笔兄弟产品共享外观语言，却不是本页的钢笔身份；图片审核时要以露出的钢尖和笔舌为准",
        "随页原创事实示意图说明金属筒、宽握位、钢尖和 Metallic、Gunmetal、Piano 的版本边界，不代表真实比例、颜色、涂层反光、Logo 或库存。圆珠笔、滚珠笔和自动铅笔虽共享外观语言，却不能代替钢笔；验货时应看清钢尖和笔舌",
        ["entity.body_md:L25-L25"],
      ),
      replacement(
        "本站原创 factual SVG 只画出钢笔版本的金属筒、宽握位、钢尖和 finish 分支，示意图，非产品照片，不表现真实比例、颜色、涂层反光、Logo、刻字或库存。图片复核时先看是否有钢笔尖，再看颜色和表面；没有钢笔尖的素材不能作为本页主图",
        "随页原创事实示意图只说明钢笔版本的金属筒、宽握位、钢尖和表面处理分支，不代表真实比例、颜色、涂层反光、Logo、刻字或库存。核对实物图时应先确认钢尖，再确认颜色和表面",
        ["entity.body_md:L53-L53"],
      ),
      replacement(
        "本站原创 factual SVG 只说明 fountain pen 的金属筒、宽握位、钢尖与 finish 分支。它不是产品照片，不显示真实比例、颜色、涂层反光、Logo、刻字或市场库存。后续主图仍应优先使用不重复、能露出钢尖和完整笔身的素材，避免让同一张 Metallic 图同时承担圆珠和钢笔身份",
        "随页原创事实示意图只说明 fountain pen 的金属筒、宽握位、钢尖与表面处理分支，不显示真实比例、颜色、涂层反光、Logo、刻字或市场库存。核对图片时应选择能露出钢尖和完整笔身的素材，不能用同一张 Metallic 图同时代表圆珠笔和钢笔",
        ["entity.body_md:L75-L75"],
      ),
    ],
  },
  {
    manifestIndex: 87,
    entityId: "O4AI01LTE75r",
    brandEntityId: "xVHzH0mMviM4",
    slug: "faber-castell-neo-slim",
    expectedName: "Faber-Castell NEO Slim",
    expectedStoryTitle:
      "NEO Slim：普通 Faber-Castell 的细身铝杆路线：官方 SKU、材料与使用边界深化",
    expectedSourceMarker:
      "curated-content:phase424-faber-castell-O4AI01LTE75r-refresh-v1:d430fe2380a5284a7784845aae1fd398a281ea3b69ee6325707087b22c9842eb",
    expectedBodySha256:
      "4c8ac92e67eeaf987967090cc89e061251b040d113de90b72a03dca5fea496af",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "如果未来官方改变尖型或供墨附件，应新增版本说明并保留旧证据，而不是覆盖现有页面。当前页面只对已经查到的系列边界负责，价格和库存不作为稳定事实",
        "如果官方日后改变尖型或供墨附件，新旧版本应按时间分开说明。现有资料只支持当前查到的系列边界，价格和库存会随市场变化",
        ["entity.body_md:L29-L29"],
      ),
      replacement(
        "本站原创 factual SVG 只表现细杆铝筒、黑尖、弹簧夹和可套尾帽，示意图，非产品照片。它不证明真实比例、颜色、阳极纹理、Logo、产地或库存。若未来出现新的金属 finish 或尖号，应保留旧版本证据并在同一型号下增加 variant；只有官方明确改变结构或名称，才需要另行判断身份关系",
        "随页原创事实示意图只说明细杆铝筒、黑尖、弹簧夹和可套尾帽，不代表真实比例、颜色、阳极纹理、Logo、产地或库存。新的金属表面或尖号仍属于同一型号的版本变化；只有官方明确改变结构或名称，才需要重新判断型号身份",
        ["entity.body_md:L53-L53"],
      ),
      replacement(
        "页面不把轻量写成人人舒适，也不把细杆限制写成缺陷，而是让读者在真实场景里做取舍",
        "轻量并不保证人人舒适，细杆也不是天然缺陷，最终仍要结合握姿和使用场景取舍",
        ["entity.body_md:L55-L55"],
      ),
      replacement(
        "NEO Slim 的正式身份因此保持稳定：普通 Faber-Castell Fine Writing 的细身金属钢笔系列，颜色和市场库存是可变轴，尖号和附件是 SKU 轴，清洁方法受官方 FAQ 约束。任何后续更新都应继续沿这三条轴补证据，避免让一个新颜色覆盖旧货号的资料",
        "NEO Slim 是普通 Faber-Castell Fine Writing 的细身金属钢笔系列。颜色和市场库存会变化，尖号和附件随 SKU 区分，清洁方法以官方 FAQ 为准；新颜色不能覆盖旧货号的版本资料",
        ["entity.body_md:L57-L57"],
      ),
      replacement(
        "图片审核要特别防止普通 Faber-Castell 与 Graf von Faber-Castell 混用。NEO Slim 只应使用普通 Fine Writing 的钢尖、金属杆和产品图；Classic 的 18K 尖、贵重木材和铂金件属于另一条高端线。本站 factual SVG 只是识别提示，不代替真实产品照片，也不证明地区库存和颜色准确度",
        "核对图片时要防止普通 Faber-Castell 与 Graf von Faber-Castell 混用。NEO Slim 对应普通 Fine Writing 的钢尖和金属杆；Classic 的 18K 尖、贵重木材和铂金件属于另一条高端线。随页事实示意图只供识别，不代替产品照片，也不证明地区库存和颜色",
        ["entity.body_md:L77-L77"],
      ),
    ],
  },
  {
    manifestIndex: 88,
    entityId: "wMSXKOxA9s2X",
    brandEntityId: "xVHzH0mMviM4",
    slug: "faber-castell-ondoro",
    expectedName: "Faber-Castell Ondoro",
    expectedStoryTitle:
      "Ondoro：六角树脂与烟熏橡木的材料分界：官方 SKU、材料与使用边界深化",
    expectedSourceMarker:
      "curated-content:phase424-faber-castell-wMSXKOxA9s2X-refresh-v1:39b2dd627b3f5457797037991236e9ff39a5eaaa886625645df012dcf28a4400",
    expectedBodySha256:
      "32c74f62d357ab6a5dafe52cad07f8f204440b63083de13c395500668378b131",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "从内容关系上，Ondoro 应与 Ambition、e-motion 建立“同品牌比较”而不是“同型号替代”关系",
        "Ondoro 与 Ambition、e-motion 是同品牌下可供比较的不同型号，不能相互代替",
        ["entity.body_md:L25-L25"],
      ),
      replacement(
        "本站原创 factual SVG 以树脂/木材两条路径和六角截面做边界提示，示意图，非产品照片，不表现真实比例、木纹、颜色、Logo 或具体 SKU",
        "随页原创事实示意图说明树脂、木材两条路线和六角截面，不代表真实比例、木纹、颜色、Logo 或具体 SKU",
        ["entity.body_md:L25-L25"],
      ),
      replacement(
        "未来如果官方恢复旧色或发布新的木材，应在现有型号下增加有来源的 variant，并写明市场与时间；除非结构和名称明确改变，不应再建同名空壳",
        "官方若恢复旧色或发布新木材，应注明对应市场和时间；只要结构和名称没有明确改变，它们仍是 Ondoro 的不同版本",
        ["entity.body_md:L49-L49"],
      ),
      replacement(
        "页面最终要让读者回答",
        "选购时需要回答",
        ["entity.body_md:L51-L51"],
      ),
      replacement(
        "品牌关系维护同样重要。Ondoro 应挂在 Faber-Castell 普通 Fine Writing 下，并与 Ambition、e-motion、NEO Slim、LOOM 形成比较链接；不应链接到 Graf von Faber-Castell Classic 的 18K 尖或贵重木材说明。每个 variant 都应保留自己的来源和主图，避免一张烟熏橡木照片在多个型号页重复出现",
        "Ondoro 属于 Faber-Castell 普通 Fine Writing，与 Ambition、e-motion、NEO Slim、LOOM 同品牌但型号不同；Graf von Faber-Castell Classic 的 18K 尖和贵重木材资料不能套用。不同版本应分别核对来源和图片，不能让一张烟熏橡木照片代表多个型号",
        ["entity.body_md:L69-L69"],
      ),
      replacement(
        "本页深度内容的目的不是给 Ondoro 增加更多颜色，而是让读者能从六角结构、材料、尖号、供墨和维护条件推回一支真实的笔。只要证据仍明确属于具体 SKU，就可以持续补充；如果证据只说“Ondoro 系列”，则保持在系列层，不擅自填入长度、重量或制造地",
        "理解 Ondoro 的关键是六角结构、材料、尖号、供墨和维护条件，而不是颜色数量。具体 SKU 的资料只能用于相应版本；只写“Ondoro 系列”的资料不能证明某一版本的长度、重量或制造地",
        ["entity.body_md:L71-L71"],
      ),
    ],
  },
  {
    manifestIndex: 89,
    entityId: "phase605-ferris-wheel-press-carousel-feathered-flight",
    brandEntityId: "phase605-brand-ferris-wheel-press",
    slug: "ferris-wheel-press-carousel-feathered-flight",
    expectedName: "Ferris Wheel Press Carousel Feathered Flight",
    expectedStoryTitle: "Ferris Wheel Press Carousel Feathered Flight：规格、版本、维护与选购",
    expectedSourceMarker:
      "curated-content:phase605-ferris-model-v1:279620eb3ddafe47b2e5961f134020786243ee9c52beacd83363dfaaccbb3a51",
    expectedBodySha256:
      "e6a058032bee3cbf95a005027947f4c1537a57af88097dd830d2adb536847e2a",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "型号身份应落在 `Carousel`，颜色故事属于 variant；若以后出现同结构的新故事配色，不应再复制一个完整型号节点",
        "Carousel 是基础型号，Feathered Flight 是其中的颜色故事版本；同结构的新配色仍属于 Carousel，不构成新的基础型号",
        ["entity.body_md:L1-L1"],
      ),
      replacement(
        "本站只接受收合尺寸，并把后插长度标为未确认，不用零售数字悄悄覆盖官网，也不虚构“笔帽不能后插”",
        "现有资料只能确认收合尺寸；后插长度仍待核实，不能用零售数字覆盖官网冲突，也不能据此断言笔帽无法后插",
        ["entity.body_md:L7-L7"],
      ),
    ],
  },
  {
    manifestIndex: 95,
    entityId: "iDvM2_w62N0C",
    brandEntityId: "phase307-brand-graf-von-faber-castell",
    slug: "graf-von-faber-castell-classic",
    expectedName: "Graf von Faber-Castell Classic",
    expectedStoryTitle: "Graf von Faber-Castell Classic：贵重材料与 18K 尖的高端线",
    expectedSourceMarker:
      "curated-content:phase307-gvfc-classic-relinked-v1:346d90a20a3dbc10c0c646203554ba1c64f59343f1f8ad06d820eaa867df4061",
    expectedBodySha256:
      "715afea0da2725f7962dce0fca997961a39eb55a03b450a881e9b8c2884589f3",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "Classic 的 canonical identity 是 Graf von Faber-Castell 高端线",
        "Classic 属于 Graf von Faber-Castell 高端线",
        ["entity.body_md:L3-L3"],
      ),
      replacement(
        "仓库里的旧实体曾以“辉柏嘉 Faber-Castell 伯爵经典 GVFC”命名，本次保留现有身份锁，但正文把品牌边界写清楚，避免用户把它和普通 Fine Writing 的钢尖、重量、converter 附件或产品图混为一谈",
        "旧中文资料曾把它写作“辉柏嘉 Faber-Castell 伯爵经典 GVFC”，但应以 Graf von Faber-Castell Classic 的品牌身份为准，不能套用普通 Fine Writing 的钢尖、重量、converter 附件或产品图",
        ["entity.body_md:L3-L3"],
      ),
      replacement(
        "本站保留“系列层”和“具体 variant 层”的分工，后续新增产品时可以沿用同一结构，不再为颜色复制大段无来源文案",
        "系列共性与具体版本需要分开核对，不能只因颜色不同就复制一套没有独立来源的参数",
        ["entity.body_md:L27-L27"],
      ),
    ],
  },
  {
    manifestIndex: 96,
    entityId: "phase307-graf-von-faber-castell-intuition",
    brandEntityId: "phase307-brand-graf-von-faber-castell",
    slug: "graf-von-faber-castell-intuition",
    expectedName: "Graf von Faber-Castell Intuition",
    expectedStoryTitle:
      "Graf von Faber-Castell Intuition：厚实树脂与 Platino Wood 的 18K 金尖路线",
    expectedSourceMarker:
      "curated-content:phase307-gvfc-intuition-v1:1a5528d6d60da3b15b94f914a41c6d03a782b5be4bb4d47735de2572e9d4ffdc",
    expectedBodySha256:
      "e85c6d59fcce009a637c6332e49bb9e65c6cd99908f34953b051c87202feae72",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "它与普通 Faber-Castell 的 Ambition、e-motion、Ondoro、LOOM、NEO Slim 不是同一个品牌节点；本页的品牌关系固定为 Graf von Faber-Castell，普通 Faber-Castell 只保留企业集团与相邻产品线的编辑链接",
        "它属于 Graf von Faber-Castell，不是普通 Faber-Castell 的 Ambition、e-motion、Ondoro、LOOM 或 NEO Slim。两者同属一个企业集团，但产品线和规格不能混用",
        ["entity.body_md:L1-L1"],
      ),
    ],
  },
  {
    manifestIndex: 105,
    entityId: "phase148-hongdian-n12",
    brandEntityId: "4yRpvovXFoWh",
    slug: "hongdian-n12",
    expectedName: "HongDian N12",
    expectedStoryTitle: "HongDian N12：亚克力、活塞与 N 系列身份边界",
    expectedSourceMarker:
      "curated-content:phase148-hongdian-n12-v1:008f3ae8d1ff2a0f0eea1becbfdd8b3e9718f5f2abcf475e0d8ee4f564101820",
    expectedBodySha256:
      "45f84b543aef1a2d3aebb364c250fd60d3f9410f51e4a68637ce57d19cb36aec",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "N12 应作为一个独立型号页，颜色、笔尖和包装则放进版本或市场 SKU",
        "N12 是独立型号，颜色、笔尖和包装随具体版本或市场 SKU 区分",
        ["entity.body_md:L1-L1"],
      ),
      replacement(
        "因而本页的 canonical identity 是 **HongDian N12**",
        "因此它的准确型号是 **HongDian N12**",
        ["entity.body_md:L5-L5"],
      ),
      replacement(
        "N12 可以在品牌页与两者并列导航，但不继承它们的帽顶、重量、笔尖、图片或维护说明",
        "N12 与 N7、N23 是相邻型号，但不能继承它们的帽顶、重量、笔尖、图片或维护说明",
        ["entity.body_md:L7-L7"],
      ),
    ],
  },
  {
    manifestIndex: 106,
    entityId: "phase383-hongdian-n23",
    brandEntityId: "4yRpvovXFoWh",
    slug: "hongdian-n23",
    expectedName: "HongDian N23（2023 Year of the Rabbit）",
    expectedStoryTitle: "HongDian N23：先核对兔年主题，再核对供墨与笔尖",
    expectedSourceMarker:
      "curated-content:phase383-hongdian-n23-v1:4c308587409244a61197be04b7cab382cb96d50905669fcda09f1a956cce4977",
    expectedBodySha256:
      "e7bcb45660cd293480591ecc4bde129fc7923e8fbc0ebedd291fe59747f539b5",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "N23 需要单独的型号页",
        "N23 是独立型号",
        ["entity.body_md:L3-L3"],
      ),
      replacement(
        "两份资料足以支持一个独立 N23 实体，但不能把数据库中每个颜色和每枚尖都误拆成独立型号",
        "两份资料足以确认 N23 的独立型号身份，但每种颜色和尖幅仍只是该型号的选项",
        ["entity.body_md:L5-L5"],
      ),
      replacement(
        "因此，本站把 Black、Blue、Red、White 建为 N23 的 `color` 变体，而不把每个颜色拆成品牌或系列节点",
        "Black、Blue、Red、White 是 N23 的颜色选项，不是四个独立型号",
        ["entity.body_md:L13-L13"],
      ),
    ],
  },
  {
    manifestIndex: 107,
    entityId: "phase77-pen-hongdian-n7-rabbit",
    brandEntityId: "4yRpvovXFoWh",
    slug: "hongdian-n7-rabbit",
    expectedName: "HongDian N7 Grey Rabbit",
    expectedStoryTitle: "HongDian N7 Grey Rabbit：先确认这是一支活塞主题版",
    expectedSourceMarker:
      "curated-content:phase77-hongdian-n7-rabbit-v1:4cbd0e31c03905f030af4b9989fefb36cd01bdfe2fca9d53dd22eab443b55d86",
    expectedBodySha256:
      "c66eba6cefcdc3dccabe5e82ebf31ac7faf3ad8cb190ef2c1d6beca8808c2392",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "却足以支持一个谨慎的型号页：这里讨论的是带兔子帽顶的灰色 N7",
        "却足以确认这里讨论的是带兔子帽顶的灰色 N7",
        ["entity.body_md:L3-L3"],
      ),
      replacement(
        "若未来两种主题都有可核对的独立实体，应让它们在品牌页并列，而不是让任意一页跳转到另一页",
        "Rabbit 与 Peacock 若都有可核实资料，应作为 N7 下的不同主题分别辨认，不能相互代替",
        ["entity.body_md:L5-L5"],
      ),
      replacement(
        "最后再回到品牌导航的原则：HongDian 页面应链接所有已经公开并完成内容核验的型号，而不是只因品牌相同就把一串未确认名字塞进去。N7 Rabbit 是一个已可核对的入口；N7 Peacock、N12、N23 和其他编号应在各自资料、图片和结构齐备后并列出现。这样做会比“一个品牌一张空白页，所有名字互相跳转”慢一些，却能保证读者点击到每支笔时，看到的是能帮助下单、使用和维护的具体信息",
        "N7 Rabbit 已有可核实的型号资料；N7 Peacock、N12、N23 和其他编号仍须分别核对资料、图片和结构。品牌相同不代表这些笔可以共享规格，每个编号都应提供能帮助下单、使用和维护的具体信息",
        ["entity.body_md:L23-L23"],
      ),
    ],
  },
  {
    manifestIndex: 124,
    entityId: "phase141-iwi-laureate",
    brandEntityId: "phase141-brand-iwi",
    slug: "iwi-laureate",
    expectedName: "IWI Laureate",
    expectedStoryTitle: "IWI Laureate：镀贵金属装饰与定制 EF 尖",
    expectedSourceMarker:
      "curated-content:phase454-iwi-laureate-depth-v1:2177dec2696bb2ec9f20e762470a57495e1a2765698b8a924d206e66b0fa965f",
    expectedBodySha256:
      "ffb17f9c470bb6bab10546723db815c28e0c70fec6510b0ec39197a7c3b9387b",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "不同贵金属色和雕刻图案属于 Laureate 的 finish variants；钢笔与滚珠笔是同名集合中的 sibling。它们可以在品牌导航层互相链接，但不能共享尺寸、重量或维护说明。页面没有可靠首发年份，因此时间轴只记录当前资料窗口，不写一个推测性的上市年",
        "不同贵金属色和雕刻图案是 Laureate 的表面版本；同名钢笔与滚珠笔属于不同书写工具，不能共享尺寸、重量或维护说明。现有资料没有可靠首发年份，因此不能推测上市时间",
        ["entity.body_md:L11-L11"],
      ),
      replacement(
        "型号页保留未公开字段，正是为了让后续可靠目录更新可以精确补齐，而不是用相邻工具的资料填空",
        "没有公开的字段应保持未知，等待可靠目录补充，不能用同名滚珠笔或其他相邻产品的资料填空",
        ["entity.body_md:L27-L27"],
      ),
      replacement(
        "本批原创图只承担结构和字段提示",
        "随页原创图只提示结构与已核实信息",
        ["entity.body_md:L35-L35"],
      ),
      replacement(
        "若只有集合页而没有单支货号，仍可发布系列级介绍，但不要把某个颜色的照片或滚珠笔配件写成钢笔的确定规格。这样的记录既保留 Laureate 的台湾 IWI 身份，也为未来补充可靠目录留下清晰的字段入口",
        "若只有集合页而没有单支货号，只能介绍系列共性，不能把某个颜色的照片或滚珠笔配件写成钢笔的确定规格。这样既保留 Laureate 的台湾 IWI 身份，也便于日后用可靠目录补充",
        ["entity.body_md:L57-L57"],
      ),
      replacement(
        "这也是公开内容审核的必要边界",
        "这也是避免误认型号与规格的必要边界",
        ["entity.body_md:L65-L65"],
      ),
    ],
  },
  {
    manifestIndex: 126,
    entityId: "phase384-jinhao-51a",
    brandEntityId: "Yulxwu7PuQAU",
    slug: "jinhao-51a",
    expectedName: "金豪 Jinhao 51A",
    expectedStoryTitle: "Jinhao 51A：先分清 Parker 51-style 外形，再核对两种笔尖",
    expectedSourceMarker:
      "curated-content:phase384-jinhao-51a-v1:fc29558af31edf5119d02030df0bea15a1dfbb0f3e4c6db60a4d20f54465630e",
    expectedBodySha256:
      "f6f0731c564c8524f1c2fe45109ee158bc033513a1c8761b1797c405e66e81bf",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "也不能在图谱中建立 Parker 作为制造者或授权方",
        "也不能据此外推 Parker 是制造者或授权方",
        ["entity.body_md:L3-L3"],
      ),
      replacement(
        "因此，本站把 wood、acrylic／plastic、transparent 和不同颜色放在 `variant` 层",
        "wood、acrylic／plastic、transparent 和不同颜色属于 51A 的不同版本",
        ["entity.body_md:L11-L11"],
      ),
      replacement(
        "图谱把这些差异保留在变体层，是为了让读者看到相邻版本而不误以为每一个颜色都有独立的工程型号",
        "这些差异属于相邻版本，不能把每一种颜色误认成独立的工程型号",
        ["entity.body_md:L15-L15"],
      ),
    ],
  },
  {
    manifestIndex: 132,
    entityId: "BTrjxhx1ByXM",
    brandEntityId: "sBV7J5ZK4msi",
    slug: "kaco-master大师14k",
    expectedName: "KACO Master 大师 14K 金尖钢笔",
    expectedStoryTitle: "KACO Master 大师 14K：不能用当代普通 Master 的规格覆盖它",
    expectedSourceMarker:
      "curated-content:phase96-kaco-master14k-v1:a01067f24fc80978b588ecfcc3fcd11165a63b9b2fd9037f83a66a54a7fe4341",
    expectedBodySha256:
      "90b21e78c9bf3de02a9c1939158e9ef39f865e6bcc110435eebcb8ea406c6d39",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "这支笔值得保留在图谱中，正因为它让人看到 KACO 在 2019 年前后尝试金尖路线的一个明确节点。最好的介绍不是把它吹成“国产神笔”，而是清楚告诉读者它是什么、与什么不同、哪些事实还需要看实物确认",
        "KACO Master 大师 14K 记录了品牌在 2019 年前后尝试金尖路线的一个明确节点。理解它的关键不是“国产神笔”之类的评价，而是它与当代普通 Master 的差异，以及仍需通过实物确认的事实",
        ["entity.body_md:L27-L27"],
      ),
    ],
  },
  {
    manifestIndex: 153,
    entityId: "s45LAMYCP1",
    brandEntityId: "ySwGGq4bhvOA",
    slug: "lamy-cp1",
    expectedName: "LAMY cp1",
    expectedStoryTitle: "LAMY cp1：细长金属标准款与 aquamarine 特别版",
    expectedSourceMarker:
      "curated-content:phase456-lamy-cp1-depth-v1:eb432bccdd30ab798597a9b67b40925bc1bf1e048239a77e77c26bb6e2efa311",
    expectedBodySha256:
      "2756824b1ac7f92cb6e6e8d12a12109840948e1d515f2b4313ebac716b9e1149",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "页面把黑色标准款与 aquamarine 限量的官方数据分开，品牌反向链接就能回答“我看到的到底是哪支 cp1”，而不是把不同商品页的尺寸平均成一个看似精确的错误数字",
        "黑色标准款与 aquamarine 限量的官方数据需要分开核对，这样才能判断具体是哪支 cp1，而不会把不同商品页的尺寸平均成一个看似精确的错误数字",
        ["entity.body_md:L23-L23"],
      ),
    ],
  },
  {
    manifestIndex: 174,
    entityId: "phase298-majohn-c1",
    brandEntityId: "TfXerdAZ5iWg",
    slug: "majohn-c1",
    expectedName: "末匠 Majohn C1",
    expectedStoryTitle: "末匠 Majohn C1：透明直灌笔的型号边界",
    expectedSourceMarker:
      "curated-content:phase298-majohn-c1-v1:cfec7e994f8f60c15b5c362aae458b638dc765bd3ed33ddd488a13dad45c6d20",
    expectedBodySha256:
      "ed180430bf951c973b86ee9649c9e0c0340009df2c72dc7ae193f68f338dbf36",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "# 末匠 Majohn C1：透明直灌笔的型号边界（Phase 298）",
        "# 末匠 Majohn C1：透明直灌笔的型号边界",
        ["entity.body_md:L1-L1"],
      ),
      replacement(
        "## 实施边界\n\n- 新建 `majohn-c1` 一个 pen entity，唯一 `made_by` 指向现有 Majohn 品牌；保留 `Moonman C1` alias，不创建 Moonman 第二品牌。\n- 只写 C1 的 138 mm／14.7 mm／21 g 样本字段，容量不填未经可靠来源确认的精确数值。\n- 不修改已发布 Q1、M2、P140、P141、V1/V60/Wancai 等实体；品牌页新增 C1 反向链接后重新审核品牌导航。",
        "## 型号与资料边界\n\nC1 属于 Majohn，Moonman C1 是同一型号的旧英文名称。现有样本支持 138 mm、14.7 mm 和 21 g；储墨容量仍缺少可靠来源，不能凭相邻直灌笔推测。Q1、M2、P140、P141、V1、V60 和 Wancai 是同品牌的其他型号，其规格不能套用到 C1。",
        ["entity.body_md:L38-L42"],
      ),
    ],
  },
  {
    manifestIndex: 177,
    entityId: "nOIr_Up5WcyJ",
    brandEntityId: "CJM8uLY0LmIX",
    slug: "montblanc-no-22-1960s",
    expectedName: "Montblanc No. 22（1960–1970，中文市场常称“学生龙 22”）",
    expectedStoryTitle: "Montblanc No. 22：被误称“学生龙”的 1960 年代中档短尺寸钢笔",
    expectedSourceMarker:
      "curated-content:phase103-montblanc-no-22-v1:7151f6317c769ed4c810052c9e6bc2e019fdd4be462d27b54ff1e8887813e1bc",
    expectedBodySha256:
      "6af620fcfcdefdc9b0208f59fc249db9032547c2f03ef308034c6a0187f20d7c",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "数据库沿用中文市场常见的“学生龙 22”名称，便于检索，但正文应把正式型号放在前面：Montblanc No. 22",
        "中文市场常把它称作“学生龙 22”，但正式型号应写在前面：Montblanc No. 22",
        ["entity.body_md:L3-L3"],
      ),
    ],
  },
  {
    manifestIndex: 208,
    entityId: "rf4xDTwosdya",
    brandEntityId: "lMGfoMjegnv8",
    slug: "namiki-rising-dragon-95th-anniversary",
    expectedName: "Namiki Rising Dragon 95th Anniversary",
    expectedStoryTitle: "Namiki Rising Dragon：Pilot 95 周年限量与飞升龙身份边界",
    expectedSourceMarker:
      "curated-content:phase167-namiki-rising-dragon-v1:772ca2368b933e67ce7a178c491639e6f60dee0b4ae1c628e2ff01110cdfd125",
    expectedBodySha256:
      "4a347e244ce1666e03ea25ee26079456e425743e760a0de79605f9f075d48dbc",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "本站原创图只画上升龙主题、周年窗口、编号核验和与 Emperor Dragon 的分界，明确为 factual SVG、非产品照片。未来若找到 Pilot 官方档案或另一件有完整证书的实物，应把它作为本实体的新增来源；若发现题材、限量数或笔尖属于另一款，则应建立 sibling 页面，不能为了保持旧 URL 而强行合并",
        "随页原创事实示意图只说明上升龙主题、周年窗口、编号核验和与 Emperor Dragon 的区别，不是产品照片。Pilot 官方档案或带完整证书的实物可以补充这款笔的资料；若题材、限量数或笔尖实际属于另一款，则必须分开辨认，不能强行合并",
        ["entity.body_md:L23-L23"],
      ),
    ],
  },
  {
    manifestIndex: 212,
    entityId: "6nwjVw9OWbpw",
    brandEntityId: "vkvhr34TkrUy",
    slug: "online-campus",
    expectedName: "ONLINE Campus",
    expectedStoryTitle: "ONLINE Campus：把 Color Line 当作变体，不当作第二支钢笔",
    expectedSourceMarker:
      "curated-content:phase64-online-campus-v1:3f6c06109de52678509b70587f23592986829a838d56817cd2316501f0c55278",
    expectedBodySha256:
      "be8a4d9688b6e71574c7d85c02db739abe1da74c0cafe6b1d3476f956c60742b",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "清楚区分这四层，才能让品牌页的反向链接真正有用，也让学校场景下的选择围绕握位、手性、线宽和补给，而不是围绕模糊的“校园系列”名称",
        "清楚区分这四层，才能让学校场景下的选择围绕握位、手性、线宽和补给，而不是模糊的“校园系列”名称",
        ["entity.body_md:L15-L15"],
      ),
    ],
  },
  {
    manifestIndex: 216,
    entityId: "0CNmbxM54-GA",
    brandEntityId: "I6tjleAZx9RU",
    slug: "opus-88-koloro",
    expectedName: "Opus 88 Koloro",
    expectedStoryTitle: "Opus 88 Koloro：扁平端盖、双色树脂与 #5 止墨阀",
    expectedSourceMarker:
      "curated-content:phase448-opus-koloro-depth-v1:6730691224bfae45c408b1a942ac38f7f89635f89dce523314e92354415c9e59",
    expectedBodySha256:
      "7959d0f234d2a7f600d1eb85d5634fb896f2184656cc5b5f23042c1c4012aa7a",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "Koloro 的规范拼写是 Koloro，旧库存或玩家讨论里出现的 Kolora 只能作为 alias。它不应该再和 Demonstrator 共用“Demo/Kolora”页面",
        "Koloro 是规范拼写，旧库存或玩家讨论里的 Kolora 是同一型号的别名。它与 Demonstrator 不是同一款笔",
        ["entity.body_md:L1-L1"],
      ),
      replacement(
        "品牌页应把它链接为独立 canonical，并在 sibling 说明中明确 Demo 的 #6/#12 边界；这样用户才不会因旧“Kolora”拼写和重复图片误把两支结构不同的钢笔当成同一个型号",
        "Koloro 与 Demo 应作为两个独立型号辨认，并明确 Demo 的 #6/#12 边界；旧“Kolora”拼写和重复图片不能把两支结构不同的钢笔混成一款",
        ["entity.body_md:L11-L11"],
      ),
      replacement(
        "旧标题可以作为 alias 保留，不能据此生成第三个“Koloro Demonstrator”实体",
        "旧标题只是别名，不能据此推断还存在第三个“Koloro Demonstrator”型号",
        ["entity.body_md:L23-L23"],
      ),
    ],
  },
  {
    manifestIndex: 223,
    entityId: "s55PAIDICENT1",
    brandEntityId: "qpcW25Dw0fxW",
    slug: "paidi-century-1",
    expectedName: "英雄派迪 Paidi Century 1",
    expectedStoryTitle: "Paidi Century 1：整片钢尖与 aerometric 自填充",
    expectedSourceMarker:
      "curated-content:phase55-paidi-century-1-v1:849a2e06b1d3d27b17030cffcec1acc0eb6642e7124abadc5303818a57897176",
    expectedBodySha256:
      "11148dd314144fb18dfbe5dc216dec89cccf18441eda5ac396505382c4f1cf6e",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "本页因此把 canonical identity 固定为 Paidi Century 1，品牌归属只保留一个 made_by：Hero Paddy／Paidi",
        "因此准确型号应写作 Paidi Century 1，品牌归属为 Hero Paddy／Paidi",
        ["entity.body_md:L3-L3"],
      ),
      replacement(
        "对资料库来说，integral nib 应作为结构概念链接到相关页面，而 Century 1 仍然需要自己的 slug、规格、历史和维护说明。这样读者既能理解相似设计，也不会把不同厂家当成同一支笔",
        "integral nib 是多款钢笔共享的结构概念，但 Century 1 有自己的规格、历史和维护边界。相似的前端设计不代表不同厂家的笔属于同一型号",
        ["entity.body_md:L7-L7"],
      ),
      replacement(
        "旧混名路线永久跳转到本页后，读者仍可访问原入口，但新的图谱不会再让一支 pen 同时拥有两个 made_by，也不会把结构词伪装成型号",
        "旧称“英雄派迪 一体尖”把品牌、型号和结构词混在一起；准确名称 Paidi Century 1 能避免把两个品牌归属或结构词误当成型号",
        ["entity.body_md:L19-L19"],
      ),
    ],
  },
  {
    manifestIndex: 237,
    entityId: "uLrDh27Q5Xne",
    brandEntityId: "VXUULuCOLOB1",
    slug: "pelikan-m200",
    expectedName: "百利金 Pelikan M200",
    expectedStoryTitle: "Pelikan M200：1985 Old Style、1997 改款与现行 Classic 200 边界",
    expectedSourceMarker:
      "curated-content:phase416-pelikan-m200-refresh-v1:1d97d09215a153133149bc240049e9b61d1ece3639cadf489026d965427efc70",
    expectedBodySha256:
      "16c5835efdbed080f55efff53d711ffbc14d8863bddec2da41475f2af9c0fe0f",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "本站原创 SVG 仅承担编辑说明：左侧 Old Style、右侧 1997 年后改款，下方活塞、钢尖和约 1.2–1.3 ml 参考值。它不是实物照片、不是颜色校样、不是尺寸测量工具，也不是 Pelikan 官方商标图。日后增加 M205、M250 或具体特别版时，应沿用同样的分层方法，在独立 variant 和来源范围内添加，而不是把未经核验的网图复制到 M200 基础页",
        "随页原创 SVG 用左侧 Old Style、右侧 1997 年后改款，以及下方的活塞、钢尖和约 1.2–1.3 ml 参考值说明版本差异。它不是实物照片、颜色校样、尺寸测量工具或 Pelikan 官方商标图。M205、M250 和具体特别版应分别核对版本与来源，不能用未经核验的图片代替 M200",
        ["entity.body_md:L89-L89"],
      ),
    ],
  },
  {
    manifestIndex: 238,
    entityId: "phase281-pelikan-m205",
    brandEntityId: "VXUULuCOLOB1",
    slug: "pelikan-m205",
    expectedName: "Pelikan M205",
    expectedStoryTitle: "Pelikan M205：2005 透明起点、银色饰件与 Classic 200 版本边界",
    expectedSourceMarker:
      "curated-content:phase417-pelikan-m205-refresh-v1:5f18c5f21e078e30efae0c9903245bab4a105e9aa22624ab22a9116cd37dd56c",
    expectedBodySha256:
      "e726e31449d27eadbcf7c8d5ab669c5be6fe3c25b2849b32af76edde321af1f8",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "当前 pack 将颜色和特别版分成可追溯的 variant",
        "有来源的颜色和特别版可以按时间逐项核对",
        ["entity.body_md:L31-L31"],
      ),
      replacement(
        "没有足够照片时，资料库应保留原始销售用语并标记待核，而不是为了让列表看起来整齐而替销售者做身份决定",
        "没有足够照片时，应保留原始销售用语并注明待核，不能替销售者猜测型号身份",
        ["entity.body_md:L67-L67"],
      ),
      replacement(
        "但资料库要把它们拆成可核对的事实",
        "但颜色、墨水和包装需要分别核对",
        ["entity.body_md:L77-L77"],
      ),
      replacement(
        "### 资料库中应保留什么",
        "### 二手验货应保留什么",
        ["entity.body_md:L104-L104"],
      ),
      replacement(
        "如果未来新增 M205 的具体货号，优先挂到本页的 variant，并在其 notes 中写清产品号、尖幅、颜色、市场和生产年份；只有来源同时证明它有独立机制、独立规格或独立历史，才考虑新增 sibling 实体。品牌页的反向链接应保持一条 Pelikan → M205 导航，不为每个颜色重复生成品牌关系。旧的错误路由如果仍有访问量，应保留 redirect 或 alias，但不让它成为第二个公开型号",
        "具体货号应写清产品号、尖幅、颜色、市场和生产年份。只有来源证明某款具有独立机构、规格或历史时，才可把它视为相邻型号；颜色变化本身不改变 Pelikan M205 的型号身份。旧称或旧链接只是检索别名，不能成为第二个公开型号",
        ["entity.body_md:L108-L108"],
      ),
    ],
  },
  {
    manifestIndex: 239,
    entityId: "phase281-pelikan-m215",
    brandEntityId: "VXUULuCOLOB1",
    slug: "pelikan-m215",
    expectedName: "Pelikan M215",
    expectedStoryTitle: "Pelikan M215：黄铜内层、四种图案与 Classic 200 重量边界",
    expectedSourceMarker:
      "curated-content:phase418-pelikan-m215-refresh-v1:93be4a6b9563f215952e918a5cb87483382d188ba80c8c35158925ba1aba559c",
    expectedBodySha256:
      "2b7a91a94aa7e75e5327cc78bc8a58571d3a9ecd24b9c718b0c6effa9b05e33e",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "资料库应同时保留两个来源用词，并通过同一 variant 的别名或 notes 说明它们指向同一图案家族，不为拼写差异制造第五个实体",
        "Orthogons 与 Rectangles 都是来源中使用的名称，指向同一图案家族；拼写差异不代表还存在第五种 M215",
        ["entity.body_md:L13-L13"],
      ),
      replacement(
        "页面应使用“官方资料库曾列出／档案记录”这类范围词",
        "描述这类记录时应明确写作“官方资料曾列出”或“档案记录”",
        ["entity.body_md:L19-L19"],
      ),
      replacement(
        "### 品牌页与资料库中的关系",
        "### M215 与相邻型号",
        ["entity.body_md:L78-L78"],
      ),
      replacement(
        "Pelikan 品牌页应把 M215 作为独立 sibling 链接，并在相邻型号导航中解释四种图案和黄铜内层；M200、M205、M250、P200/P205 和 Twist P457 则分别说明金色饰件、银色树脂、金尖、墨囊和学生路线。不要把 Blue-Striped、Rings、Lozenges、Rectangles 各建成一个公开基础页，也不要让品牌反向导航出现四条重复的“同一型号”。颜色和图案用 variant，真正独立的产品号可挂 `market_sku` 或 edition group",
        "M215 是独立型号，四种图案共享黄铜内层；M200、M205、M250、P200/P205 和 Twist P457 则分别对应金色饰件、银色树脂、金尖、墨囊和学生路线。Blue-Striped、Rings、Lozenges、Rectangles 是 M215 的版本，不是四个基础型号；独立产品号仍需按具体市场或特别版核对",
        ["entity.body_md:L80-L80"],
      ),
      replacement(
        "资料库可以记录“已送修”“换尖”“换帽”或“待核”，但不把修复前后的个体自动拆为两个型号",
        "维修记录可以注明“已送修”“换尖”“换帽”或“待核”，但同一支笔不会因维修前后状态不同而变成两个型号",
        ["entity.body_md:L108-L108"],
      ),
      replacement(
        "### 页面和图谱中的最小充分关系",
        "### 图案、品牌与相邻型号",
        ["entity.body_md:L116-L116"],
      ),
      replacement(
        "M215 与 Pelikan 品牌应保留一条“生产者”关系和一条品牌反向导航；它与 M200、M205、M250、P205 的关系用正文、variant 或相关型号链接表达，不为每个相邻型号复制品牌关系。四种图案属于 M215 的版本导航，不能让品牌页看见四个同名模型。若未来发现确有独立产品号、独立包装和独立规格的 M215 商品，可追加 `market_sku` variant，并沿用同一基础实体",
        "M215 由 Pelikan 生产，与 M200、M205、M250、P205 是相邻但不同的型号。四种图案都属于 M215；若发现具备独立产品号、包装和规格的商品，应作为同一基础型号下的具体市场版本核对",
        ["entity.body_md:L118-L118"],
      ),
    ],
  },
  {
    manifestIndex: 308,
    entityId: "phase140-pineider-avatar-ur",
    brandEntityId: "phase140-brand-pineider",
    slug: "pineider-avatar-ur",
    expectedName: "Pineider Avatar UR",
    expectedStoryTitle: "Pineider Avatar UR：PP2101／600 与二十四个当前 child SKU",
    expectedSourceMarker:
      "curated-content:phase594-pineider-avatar-ur-v1:3d007f4a6bd2f29163006e79728582482ec0cee9ba9ce03c37d5290b829b0d8f",
    expectedBodySha256:
      "1f7b147450f18dd86086b56bba242db2b8ae8a9677ed2b01d5bd35c75cb5786b",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      replacement(
        "本站早已有 [[Pineider Avatar UR]]，因此 Phase 594 不再建一个“新 Avatar”。这次沿用实体 `phase140-pineider-avatar-ur` 与 `/pen/pineider-avatar-ur`，把 canonical identity 收紧到 Pineider 当前 exact 页面上的 **PP2101／600**",
        "Pineider 当前官方商品页把 Avatar UR 对应到 **PP2101／600**；这是区分当前型号与相近 Avatar 产品的关键编号",
        ["entity.body_md:L5-L5"],
      ),
      replacement(
        "代码前缀混用 `SPP` 与 `SSA…XPP` 是官网 HTML 的实际结果，本站原样保存，不自行“修正”为统一格式。E／F／M 对应 EF／F／M；颜色和尖幅的组合才是 child SKU，不能把颜色名当成独立型号",
        "官网 HTML 实际混用 `SPP` 与 `SSA…XPP` 前缀，不能擅自改成统一格式。E、F、M 对应 EF、F、M；颜色与尖幅组合后才构成具体商品代码，颜色名本身不是独立型号",
        ["entity.body_md:L22-L22"],
      ),
      replacement(
        "本页把三组尾码记为 rejected unresolved selector evidence，不把它们塞进当前二十四个 SKU，也不给它们猜颜色",
        "这三组尾码目前只能视为未解决的页面残留，不能列入已确认的二十四个 SKU，也不能猜测对应颜色",
        ["entity.body_md:L24-L24"],
      ),
    ],
  },
  {
    manifestIndex: 345,
    entityId: "phase123-platinum-izumo-piz-80000n",
    brandEntityId: "e51tJpejEkXY",
    slug: "platinum-izumo-piz-80000n",
    expectedName: "Platinum Izumo PIZ-80000N 八云涂",
    expectedStoryTitle: "Platinum Izumo PIZ-80000N：#91／#92 与 evidence boundaries",
    expectedSourceMarker:
      "curated-content:phase123-platinum-izumo-piz-80000n-v1:501ee35400713f536f995ce0cb28f6445b0e38d4bd1caf00cd2cafa51520b26d",
    expectedBodySha256:
      "42875ade033906af9d6583f0a0e831bc46a508462f8909bcbd66b09976d2c21b",
    dimensions: ["introduction"],
    defectCodes: ["public_data_structure_residue"],
    replacements: [
      replacement(
        "## 五层证据为什么不能拼接",
        "## 不同资料各自能证明什么",
        ["entity.body_md:L39-L39"],
      ),
      replacement(
        "current JP 与 EN 产品页同属 `platinum-official` independence group，是两个 document items，而不是两个独立机构；它们不能被双算成两份独立来源。2019–2020 catalog 仍来自同一官方 group，只增加带日期的文档旁证。maintenance PDF 只覆盖清洁步骤。Leigh 是独立 professional/personal sample；FPN 是 community sample。每条 claim、spec evidence 与 citation 都必须同时指向自己的 source item、locator 和 fact scope，不能拿 maintenance 的权威补产品价格，也不能拿社区写感补官方尖幅",
        "日文与英文产品页都来自 Platinum 官方，不能当成两个独立机构；2019–2020 目录也只是同一官方来源的带日期旁证。维护 PDF 只证明清洁步骤，Leigh 的资料属于独立样本，FPN 则是社区样本。每项事实都要回到对应资料和适用范围：维护说明不能证明产品价格，社区写感也不能证明官方尖幅",
        ["entity.body_md:L41-L41"],
      ),
      replacement(
        "零售商与顾客评价没有进入本 pack。它们可能帮助发现线索，但不参与 publication readiness，不拥有 current identity、variant set 或 stable specs。尤其不能用店铺仍可下单来证明官网在售，也不能用顾客照片证明漆层颜色一致",
        "零售商与顾客评价可以帮助发现线索，却不能独立证明当前型号、完整版本范围或稳定规格。店铺仍可下单不等于官网在售，顾客照片也不能证明每支笔的漆层颜色一致",
        ["entity.body_md:L43-L43"],
      ),
    ],
  },
  {
    manifestIndex: 350,
    entityId: "a1t4DNomp4Ge",
    brandEntityId: "e51tJpejEkXY",
    slug: "platinum-president-ptb-20000p",
    expectedName: "Platinum President PTB-20000P",
    expectedStoryTitle: "Platinum President PTB-20000P：当前三色、文档时态与样笔边界",
    expectedSourceMarker:
      "curated-content:phase606-platinum-president-ptb-20000p-care-refresh-v1:ed2863a970e0ec4c20823e022d2cf7af1fe77a06a7a028f57774b715316a6f5e",
    expectedBodySha256:
      "1ef45a831a6be792880991d8e1752e0c4124135493f6cd7bf842940a555a85c1",
    dimensions: ["introduction"],
    defectCodes: ["public_data_structure_residue"],
    replacements: [
      replacement(
        "PTB-25000PR、Kaga Maki-e、ballpoints、PTB-28000P、PTW-15000P 与历史 colour editions 全部以 `qualifies:false` 保存在 rejected/sibling/history evidence 中，不生成第二个 President entity，也不进入 current variants、alias 或稳定 spec",
        "PTB-25000PR、Kaga Maki-e、ballpoints、PTB-28000P、PTW-15000P 与历史 colour editions 都不属于当前 PTB-20000P 的通用规格。它们是相邻产品或历史版本，不能并入当前颜色、别名或稳定参数",
        ["entity.body_md:L61-L61"],
      ),
    ],
  },
  {
    manifestIndex: 402,
    entityId: "phase140-santini-libra-intenso",
    brandEntityId: "phase140-brand-santini-italia",
    slug: "santini-libra-intenso",
    expectedName: "Santini Italia Libra Intenso",
    expectedStoryTitle: "Libra Intenso：acrylic 当前 SKU 与 ebonite 样本分离",
    expectedSourceMarker:
      "curated-content:phase140-libra-v1:db58795c97c5cb64736731c8055f422884e08605a923a49109cb08a9f2f25b75",
    expectedBodySha256:
      "04614b99d3771cb3f766a2b489da4fd4b609733ae8abb4afaec3549b2e6edc92",
    dimensions: ["maintenance"],
    defectCodes: ["generic_cross_model_maintenance_template"],
    replacements: [
      replacement(
        "首次使用先用室温清水温和吸排，确认运输残留被清除，再装入性质温和、易清洗的 fountain-pen ink。更换不同颜色或高饱和墨水时重复吸排至基本无色，并让 nib 朝下在无绒纸上排水；不要用热水、酒精、超声波或家用溶剂处理未知 resin、ebonite、镀层和 adhesive。piston、captured converter 或复杂 valve 出现阻滞时，应交由品牌/专业维修，不以钳具强拆。",
        "Libra Intenso 使用活塞上墨。Santini 官方说明的动作是：把笔尾逆时针转到停止位置，不要继续用力；将笔尖和笔舌完全浸入墨水，再顺时针转动笔尾直至吸满，最后擦去笔尖与握位上的余墨。换墨时用凉水反复吸排；堵塞时可让笔尖与握位在凉水中浸泡一晚。活塞异常紧涩、漏墨或无法吸墨时应停手送修，不自行强拆。",
        ["entity.body_md:L27-L27"],
        ["https://www.santini-italia.com/faqs.html"],
      ),
      replacement(
        "长期不用应排空、清洗、阴干后收纳。透明或浅色材料更需要及时处理 ink staining；ebonite feed 避免长时间曝晒和高热；silver/bronze/plate 的氧化、patina 与镀层磨损要分开判断。旋帽和磁吸帽都应先清除砂粒，避免带颗粒反复开合。任何维护建议都以具体版本说明书和保修条件为先。",
        "长期不用时应排空墨水、用凉水洗净并充分晾干，笔尖朝上收纳。Intenso 的 acrylic 笔身与 ebonite 笔舌都应远离高热、强光、酒精和溶剂；若出水异常或有泄漏，按 Santini 的建议联系维修服务。",
        ["entity.body_md:L29-L29"],
        ["https://www.santini-italia.com/faqs.html"],
      ),
    ],
  },
  {
    manifestIndex: 405,
    entityId: "phase140-scribo-feel",
    brandEntityId: "phase140-brand-scribo",
    slug: "scribo-feel",
    expectedName: "SCRIBO FEEL",
    expectedStoryTitle: "SCRIBO FEEL：十二面笔身与两条金尖路线",
    expectedSourceMarker:
      "curated-content:phase140-feel-v1:39b322ec9fb144a0413156b860ae2d782587e7e761873d2b1c51a9529376b1d7",
    expectedBodySha256:
      "320a9e7b3c075663a140f58248b3c4a4296d40ed08bc06dd3b067ede2b2e9da4",
    dimensions: ["maintenance"],
    defectCodes: ["generic_cross_model_maintenance_template"],
    replacements: [
      replacement(
        "首次使用先用室温清水温和吸排，确认运输残留被清除，再装入性质温和、易清洗的 fountain-pen ink。更换不同颜色或高饱和墨水时重复吸排至基本无色，并让 nib 朝下在无绒纸上排水；不要用热水、酒精、超声波或家用溶剂处理未知 resin、ebonite、镀层和 adhesive。piston、captured converter 或复杂 valve 出现阻滞时，应交由品牌/专业维修，不以钳具强拆。",
        "FEEL 是容量约 1.42 ml 的活塞笔，配 ebonite 笔舌。上墨时让笔尖和笔舌完全浸入墨水，缓慢转动笔尾完成吸墨，再擦净握位与笔尖。换墨时用常温清水反复吸排到排水基本无色；不要把它当作 cartridge/converter 笔拔取上墨器，也不要用钳具拆活塞。",
        ["entity.body_md:L27-L27"],
        [
          "https://www.scritturabolognese.com/en/negozio/fountain-pens/feel-en/feel-blue-black-2/",
          "https://www.fountainpennetwork.com/forum/topic/375576-my-search-for-an-omas-worthy-nib-a-review-of-the-scribo-feel-melograno/",
        ],
      ),
      replacement(
        "长期不用应排空、清洗、阴干后收纳。透明或浅色材料更需要及时处理 ink staining；ebonite feed 避免长时间曝晒和高热；silver/bronze/plate 的氧化、patina 与镀层磨损要分开判断。旋帽和磁吸帽都应先清除砂粒，避免带颗粒反复开合。任何维护建议都以具体版本说明书和保修条件为先。",
        "长期不用时应排空墨水、洗净并自然晾干。树脂笔身和 ebonite 笔舌应避开高温、酒精与家用溶剂；活塞转动突然变紧、无法吸墨或出现泄漏时不要继续加力，应联系 SCRIBO 或销售方检修。",
        ["entity.body_md:L29-L29"],
        [
          "https://www.scritturabolognese.com/en/negozio/fountain-pens/feel-en/feel-blue-black-2/",
          "https://www.fountainpennetwork.com/forum/topic/353003-scribo-feel-piston-problem/",
        ],
      ),
    ],
  },
  {
    manifestIndex: 423,
    entityId: "phase140-stipula-etruria-magnifica",
    brandEntityId: "phase140-brand-stipula",
    slug: "stipula-etruria-magnifica",
    expectedName: "Stipula Etruria Magnifica",
    expectedStoryTitle: "Etruria Magnifica：variant、笔尖与供墨逐支确认",
    expectedSourceMarker:
      "curated-content:phase140-etruria-v1:66cbaa15297a2f9048b2d985a38f5bc31257bbe67a0b13b512b2522bad3307dc",
    expectedBodySha256:
      "e461597f77f09228c1fd9c4d09792e10d879efbc53147940eedf0021ec6deb3d",
    dimensions: ["maintenance"],
    defectCodes: ["generic_cross_model_maintenance_template"],
    replacements: [
      replacement(
        "首次使用先用室温清水温和吸排，确认运输残留被清除，再装入性质温和、易清洗的 fountain-pen ink。更换不同颜色或高饱和墨水时重复吸排至基本无色，并让 nib 朝下在无绒纸上排水；不要用热水、酒精、超声波或家用溶剂处理未知 resin、ebonite、镀层和 adhesive。piston、captured converter 或复杂 valve 出现阻滞时，应交由品牌/专业维修，不以钳具强拆。",
        "当前 Etruria Magnifica 使用可拆 converter 或墨囊，不是活塞笔。用瓶装墨时把 converter 稳妥装入握位，将笔尖和笔舌完全浸入墨水后缓慢吸墨；换色时拆下墨囊或 converter，用常温清水冲洗握位，并用 converter 反复吸排至清澈。",
        ["entity.body_md:L27-L27"],
        ["https://www.stipula.com/en/product-page/etruria-magnifica-avorio-stilo"],
      ),
      replacement(
        "长期不用应排空、清洗、阴干后收纳。透明或浅色材料更需要及时处理 ink staining；ebonite feed 避免长时间曝晒和高热；silver/bronze/plate 的氧化、patina 与镀层磨损要分开判断。旋帽和磁吸帽都应先清除砂粒，避免带颗粒反复开合。任何维护建议都以具体版本说明书和保修条件为先。",
        "长期不用时取下墨囊或 converter，洗净并晾干后收纳。Avorio 是树脂配金色处理青铜件，蓝黑款则使用 ebonite 与镀钯青铜件；清洁和抛光前必须先确认具体版本，避免酒精、溶剂和金属抛光剂接触笔身或镀层。",
        ["entity.body_md:L29-L29"],
        [
          "https://www.stipula.com/en/product-page/etruria-magnifica-avorio-stilo",
          "https://www.stipula.com/product-page/etruria-magnifica-stilo-ebanite-blu-nero",
        ],
      ),
    ],
  },
  {
    manifestIndex: 466,
    entityId: "V9IvGskSYan0",
    brandEntityId: "YTHuH8c3R9zl",
    slug: "twsbi-diamond-580",
    expectedName: "三文堂 TWSBI Diamond 580",
    expectedStoryTitle: "TWSBI Diamond 580：标准旋钮活塞、可拆结构与 ALR 边界",
    expectedSourceMarker:
      "curated-content:phase490-twsbi-diamond-580-depth-v1:38af65fffec6d4172c91217fba0f56d15ddd038a0e7c945bb264a3e4c7f64a99",
    expectedBodySha256:
      "4d242393cf3e495fd7c5d865ad3431b1659237c556a4973719022c4821a39b33",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      replacement(
        "本页只处理标准 580，不把商品标题中的 Diamond 580、580AL、580ALR 或颜色简称混成一个型号",
        "标准 580 与 580AL、580ALR 结构不同，不能因商品标题或颜色简称相似而混成一个型号",
        ["entity.body_md:L3-L3"],
      ),
      replacement(
        "标准 580 是现有实体的 canonical 身份，不是另建一个与旧 raw 条目重叠的页面",
        "标准 Diamond 580 是这里讨论的准确型号，旧资料中的同名条目不代表还有第二款笔",
        ["entity.body_md:L5-L5"],
      ),
      replacement(
        "正文保留产品代际关系，不把网页更新日期冒充上市日期",
        "这些代际事实可以保留，但网页更新日期不能冒充上市日期",
        ["entity.body_md:L5-L5"],
      ),
      replacement(
        "它们是同一钢笔平台的尖幅选择，不表示每种尖幅在所有颜色、地区和库存中同时存在",
        "这些是同一钢笔平台的尖幅选择，但不保证每种尖幅在所有颜色、地区和库存中同时存在",
        ["entity.body_md:L9-L9"],
      ),
      replacement(
        "其他透明色、烟色和金属饰件属于市场 SKU。颜色会改变视觉和某些饰件，但不应成为重新建立型号的理由。若商品页同时出现 RoseGold、AL、ALR 或 Mini，应把饰件和尺寸变化记录在对应兄弟实体，而不是在普通 580 的材料字段里写入铝制握位",
        "其他透明色、烟色和金属饰件随市场 SKU 区分，颜色变化本身不构成新型号。RoseGold、AL、ALR 或 Mini 的饰件和尺寸需要按相邻型号分别核对，普通 580 不能套用它们的铝制握位",
        ["entity.body_md:L15-L15"],
      ),
    ],
  },
  {
    manifestIndex: 472,
    entityId: "phase140-visconti-divina-elegance",
    brandEntityId: "5BZDt2fQusMf",
    slug: "visconti-divina-elegance",
    expectedName: "Visconti Divina Elegance",
    expectedStoryTitle: "Divina Elegance：螺旋比例与历史 nib/sample 分界",
    expectedSourceMarker:
      "curated-content:phase140-divina-v1:af72a02de26d27272560a641c96bd9f2bfe3fcf9a6c9b14aef9421f17d6fe6df",
    expectedBodySha256:
      "e5a127e3bd78b8a1020f3664ae712794db872509cd64d00270a9bb5535a8c61b",
    dimensions: ["maintenance"],
    defectCodes: ["generic_cross_model_maintenance_template"],
    replacements: [
      replacement(
        "首次使用先用室温清水温和吸排，确认运输残留被清除，再装入性质温和、易清洗的 fountain-pen ink。更换不同颜色或高饱和墨水时重复吸排至基本无色，并让 nib 朝下在无绒纸上排水；不要用热水、酒精、超声波或家用溶剂处理未知 resin、ebonite、镀层和 adhesive。piston、captured converter 或复杂 valve 出现阻滞时，应交由品牌/专业维修，不以钳具强拆。",
        "现行 Divina Elegance KP18 使用 Pull & Turn 活塞。上墨前拉出笔尾活塞，逆时针转动排空储墨腔；让笔尖完全浸入墨水，再顺时针吸墨。轻轻回排一至两滴后，笔尖朝上把活塞转回并压回原位，最后用吸水纸擦净笔尖和笔舌。",
        ["entity.body_md:L27-L27"],
        [
          "https://www.visconti.it/en/shop/1-luxury-pens/73-divina-elegance-fountain-pen.html?sc=45",
          "https://www.visconti.it/en/pen-filling-systems.html",
        ],
      ),
      replacement(
        "长期不用应排空、清洗、阴干后收纳。透明或浅色材料更需要及时处理 ink staining；ebonite feed 避免长时间曝晒和高热；silver/bronze/plate 的氧化、patina 与镀层磨损要分开判断。旋帽和磁吸帽都应先清除砂粒，避免带颗粒反复开合。任何维护建议都以具体版本说明书和保修条件为先。",
        "长期不用或换墨时，用清水反复吸入、排出，直至排水清澈，再让笔自然干燥。现行款是 acrylic resin、Ag925 嵌条与 bayonet 笔帽；清洁时避免酒精、家用溶剂和银器抛光剂接触树脂或嵌条。活塞异常紧涩、漏墨或无法复位时应停手送修。",
        ["entity.body_md:L29-L29"],
        [
          "https://www.visconti.it/en/shop/1-luxury-pens/73-divina-elegance-fountain-pen.html?sc=45",
          "https://www.visconti.it/en/pen-filling-systems.html",
        ],
      ),
    ],
  },
  {
    manifestIndex: 478,
    entityId: "phase140-visconti-mirage-original",
    brandEntityId: "5BZDt2fQusMf",
    slug: "visconti-mirage-original",
    expectedName: "Visconti Mirage 原始款",
    expectedStoryTitle: "原始 Mirage：2019 soft hexagonal 版本，不是 Mythos",
    expectedSourceMarker:
      "curated-content:phase140-mirage-v1:e701e8ec669dadcda974ff75caf1d3abb9edfb9b4eb7e65e508208a8a53cf6d2",
    expectedBodySha256:
      "7d71fdacb1762921260d563d604ab537b70af0a017f08c4f1e7ef5c900503834",
    dimensions: ["maintenance"],
    defectCodes: ["generic_cross_model_maintenance_template"],
    replacements: [
      replacement(
        "首次使用先用室温清水温和吸排，确认运输残留被清除，再装入性质温和、易清洗的 fountain-pen ink。更换不同颜色或高饱和墨水时重复吸排至基本无色，并让 nib 朝下在无绒纸上排水；不要用热水、酒精、超声波或家用溶剂处理未知 resin、ebonite、镀层和 adhesive。piston、captured converter 或复杂 valve 出现阻滞时，应交由品牌/专业维修，不以钳具强拆。",
        "原始 Mirage 使用 cartridge/converter。用瓶装墨时先确认 converter 已稳妥装入，将笔尖完全浸入墨水后顺时针转动 converter 吸墨，轻轻回排一至两滴，再让笔尖朝上转回并擦净余墨；也可以取下 converter，改用匹配的墨囊。",
        ["entity.body_md:L27-L27"],
        [
          "https://www.visconti.it/en/pen-filling-systems.html",
          "https://www.visconti.it/it/shop/7-accessori/188-converter-standard-stilografica.html",
        ],
      ),
      replacement(
        "长期不用应排空、清洗、阴干后收纳。透明或浅色材料更需要及时处理 ink staining；ebonite feed 避免长时间曝晒和高热；silver/bronze/plate 的氧化、patina 与镀层磨损要分开判断。旋帽和磁吸帽都应先清除砂粒，避免带颗粒反复开合。任何维护建议都以具体版本说明书和保修条件为先。",
        "换墨或长期不用时，取下墨囊或 converter，用清水反复冲洗笔尖、笔舌和 converter，直至排水清澈，再充分晾干。原始款的 vegetal resin 与磁吸旋帽应避开酒精、家用溶剂和高热；磁吸帽内若有砂粒，应先清除再开合。",
        ["entity.body_md:L29-L29"],
        [
          "https://www.visconti.it/en/pen-filling-systems.html",
          "https://www.visconti.it/it/shop/7-accessori/188-converter-standard-stilografica.html",
        ],
      ),
    ],
  },
  {
    manifestIndex: 688,
    entityId: "2wR-Ix08dC-F",
    brandEntityId: "TfXerdAZ5iWg",
    slug: "末匠-majohn-80mini-e",
    expectedName: "末匠 Majohn 80mini-E",
    expectedStoryTitle: "末匠 Majohn 80mini-E：把短杆当作使用条件",
    expectedSourceMarker:
      "curated-content:phase185-majohn-80mini-e:90ee855a3c355d6163204708c13ae3fedf80a032c2cbfbc5e7f5574e7ba7bd30",
    expectedBodySha256:
      "f1246c88312371fbb4373f0a7e4e538edf3e476701cf7a50f9097e3b7e7e38b9",
    dimensions: ["introduction"],
    defectCodes: [
      "public_internal_editorial_residue",
      "public_internal_editorial_language",
    ],
    replacements: [
      replacement(
        "## 核验范围\n\n这次内容包只处理已有条目 `末匠-majohn-80mini-e`，不新建实体，也不把普通 Moonman 80 Mini 的资料直接冒充为 80mini-E 的工厂规格。Everything Calligraphy 的产品集合页使用了 “Majohn 80 Mini -E Short (Moonman) Fountain Pen” 这一独立标题，因此可以确认 80 Mini-E Short 是零售渠道采用的具体型号名称。官方 Majohn 站点只作为品牌当代语境使用，不承担本型号的尺寸、笔尖和上墨器细节。\n\nFountain Pen Network 的《Moonman 80 Mini》主题和 mini review 提供的是 80 Mini 家族的使用旁证：参与者描述了约 100 mm 的合盖长度、Parker 风格的短墨囊/上墨器路线、偏细且可能偏干的原装尖，以及短笔在握持和储墨方面的限制。这些资料没有把每个 E 版本拆开测量，所以正文会明确写成“家族样本”或“玩家观察”，不把它们升级成 80mini-E 的统一工厂参数。Reddit 上关于该型号可能停产的讨论同样只是状态线索，不能替代品牌公告。\n\n## 内容边界\n\n- 身份：零售页的完整标题、Majohn/Moonman 双名称和 Short 后缀可以确认型号入口。\n- 关系：条目已有 Majohn 品牌，内容包只修正型号正文和品牌反向导航，不新建品牌或系列。\n- 尺寸：短杆和家族约 100 mm 合盖观察可用于解释便携性；没有可靠的 E 版本开盖、插帽和笔重统一表，故保留待核对状态。\n- 上墨：Parker 风格 mini cartridge/converter 是家族讨论中的路线；具体 E 版本是否随笔附带哪一种配件，要按实物或卖家清单确认。\n- 笔尖：家族样本常被描述为 EF/F、偏干或线条很细；不能写成每支 E 都是某个固定尖号。\n- 材料：只能说零售实物图和家族样本呈现树脂/塑料件与金属饰件的组合感，不写未经证实的树脂配方或金属牌号。\n- 库存：零售页显示售罄只代表渠道状态；没有可靠的官方停产日期。\n\n## 资料卡\n\n1. Everything Calligraphy，`Majohn 80 Mini -E Short (Moonman) Fountain Pen`，产品集合页和直达产品页，核对名称、Short 后缀及该渠道库存状态。\n2. Fountain Pen Network，`Moonman 80 Mini`，主题 338618，核对家族短尺寸、Parker 风格耗材和细线观察。\n3. Fountain Pen Network，`Moonman 80 Mini mini review`，主题 339227，核对原装 EF 偏干、握持、笔身和装配的单支体验边界。\n4. Reddit，`r/fountainpens` 主题 199pf1g，记录玩家对 80 mini-E 生产状态的非正式讨论，只作“可能停产”的不确定线索。\n5. Majohn 官方站，`majohnpen.com`，确认品牌当代产品语境，不从导航页推导本型号规格。\n\n## 正文草稿",
        "## 型号与资料边界\n\nEverything Calligraphy 使用 “Majohn 80 Mini -E Short (Moonman) Fountain Pen” 这一完整标题，可以确认 80 Mini-E Short 是零售渠道采用的具体型号名称。普通 Moonman 80 Mini 的资料只能帮助理解家族，不能直接当成 80mini-E 的工厂规格。\n\nFountain Pen Network 的家族样本记录了约 100 mm 合盖长度、Parker 风格的短墨囊或上墨器路线，以及偏细、可能偏干的原装尖；这些数字和体验未覆盖所有 E 版本。具体尺寸、配件、笔尖、材料和库存仍须按实物或卖家清单核对，渠道售罄也不能证明官方已经停产。\n\n## 为什么短杆是关键",
        ["entity.body_md:L1-L25"],
      ),
    ],
  },
  {
    manifestIndex: 723,
    entityId: "RWv0fTpEcwuL",
    brandEntityId: "u872EQEhnTzA",
    slug: "金星-jinxing-双尖钢笔",
    expectedName: "金星 JinXing 双尖钢笔（历史线索）",
    expectedStoryTitle: "金星双尖钢笔：历史称呼与实物核验边界",
    expectedSourceMarker:
      "curated-content:phase229-jinxing-double-nib:5b93287975f93bb841ad2f34b6863f0063e7022497cd8fc965dcafcf820186bd",
    expectedBodySha256:
      "93c0cc8b2e8150e3e5ad2b49ba0645232a480410bb0c8aed3710b5eb7915120f",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "页面不把其他金星型号的 28、8000 或老式吸墨结构填入这些字段；“双尖”也只作为现有条目的名称，不作为结构断言。后续更新应优先采用博物馆目录、厂志、商标档案、原包装和多角度实物照片，并记录来源定位",
        "其他金星型号的 28、8000 或老式吸墨结构不能填补这些未知项；“双尖”目前只是流传名称，不能直接断言具体结构。若要进一步确认，应优先查博物馆目录、厂志、商标档案、原包装和多角度实物照片，并记录明确出处",
        ["entity.body_md:L27-L27"],
      ),
    ],
  },
  {
    manifestIndex: 740,
    entityId: "NjUsoC-HoMM_",
    brandEntityId: "AcglIcVOba3Y",
    slug: "高仕-cross-莎士比亚",
    expectedName: "高仕 Cross Stratford（中国渠道称“莎士比亚”）",
    expectedStoryTitle: "Cross Stratford（中国渠道称“莎士比亚”）：渠道身份边界",
    expectedSourceMarker:
      "curated-content:phase172-cross-stratford-alias-v1:87af6b35354e244ee828ade7ed2ddea741af76d349619dc96e82528fda68d19d",
    expectedBodySha256:
      "e87cfbb97ccecf6c07a3a43e6c9e1a28bf4826ad62b240b4ff302d6344106155",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      replacement(
        "为什么还要保留这个条目？因为它在中文市场确实形成了可检索的商品入口，读者可能会拿着“莎士比亚系列”包装或商品页来寻找信息；简单删除会让旧链接失去解释。保留并不等于为它补造一个完整的 Cross 历史。图谱采用“Cross Stratford（中国渠道称‘莎士比亚’）”的名称，继续沿用原有中文路径，同时在别名、摘要和正文中说明：",
        "“莎士比亚系列”在中文市场确实作为商品名称流通过，但这不足以补造一段 Cross 官方历史。更准确的写法是“Cross Stratford（中国渠道称‘莎士比亚’）”：",
        ["entity.body_md:L3-L3"],
      ),
    ],
  },
];
