import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs } from "@libsql/client";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
const WRITE = process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));

type BrandStorySeed = {
  slug: string;
  story: {
    id: string;
    title: string;
    summary: string;
    bodyMd: string;
    sourceNotes: string;
  };
  sourceItemIds: string[];
  claimIds: string[];
};

const BRAND_STORIES: BrandStorySeed[] = [
  {
    slug: "sailor",
    story: {
      id: "story-brand-sailor-library",
      title: "从金笔尖作坊进入日本笔尖谱系",
      summary:
        "Sailor 品牌馆先以 1911 年 Sakata-Manufactory 和金笔尖制造为入口，后续再展开 1911/Profit、Pro Gear、King of Pen 与长刀研等路径。",
      bodyMd:
        "Sailor 的品牌故事适合从一个很具体的入口开始：**金笔尖制造**。官方历史把 1911 年的 Sakata-Manufactory 作为起点，这让写乐在图书馆里不只是“日本三大”之一，而是一条围绕笔尖反馈、笔尖形制和书写触感展开的阅读路线。\n\n在站内结构里，Sailor 后续可以继续拆成几条路径：**1911/Profit 的经典雪茄线**、**Pro Gear 的平顶线**、**King of Pen 的旗舰尺寸线**，以及玩家更容易记住的长刀研、特殊笔尖和 21K 金尖讨论。当前这篇先只建立来源锚点，具体型号年代和笔尖差异还需要目录、官方产品页和社区评测继续补证。",
      sourceNotes:
        "Draft based on Sailor official history and Wikidata bootstrap. Model-line details remain local curation until product/catalog sources are added.",
    },
    sourceItemIds: [
      "source-sailor-official-history",
      "source-wikidata-Q11314885",
    ],
    claimIds: [
      "claim-sailor-official-history-anchor",
      "claim-wikidata-description-ce2dcqixqSCx",
    ],
  },
  {
    slug: "cross",
    story: {
      id: "story-brand-cross-library",
      title: "从 Providence 的金属工艺到美国书写品牌",
      summary:
        "Cross 品牌馆先以 1846 年 Providence 起源为锚点，把它放进美国书写工具工业与礼品笔文化的脉络里。",
      bodyMd:
        "Cross 的图书馆入口不应该只写“美国品牌”四个字。官方页面把 1846 年的 Providence, Rhode Island 作为品牌起点，这条线索能把 Cross 放回 19 世纪美国金属工艺、精密书写工具和礼品笔文化的交界处。\n\n后续扩写时，Cross 可以拆成两条并行路径：一条讲公司早期的工艺和专利传统，另一条讲现代 Cross 在签字笔、商务书写和礼赠场景里的品牌位置。钢笔部分还需要继续补 Townsend、Century、Peerless 等型号来源，避免把圆珠笔时代的品牌声誉直接套到所有钢笔型号上。",
      sourceNotes:
        "Draft based on A.T. Cross official about page and Wikidata bootstrap. Product-line claims need additional catalog/product sources.",
    },
    sourceItemIds: ["source-cross-official-about", "source-wikidata-Q4119347"],
    claimIds: [
      "claim-cross-official-history-anchor",
      "claim-wikidata-description-AcglIcVOba3Y",
    ],
  },
  {
    slug: "aurora",
    story: {
      id: "story-brand-aurora-library",
      title: "把 Turin 和 Made in Italy 放回品牌馆",
      summary:
        "Aurora 品牌馆先以 1919 年 Turin 起源为基础，把意大利书写工具、设计和工艺作为后续扩写方向。",
      bodyMd:
        "Aurora 的故事入口很适合从地点讲起：**Turin**。官方材料把 1919 年和 Turin 作为品牌起点，这让 Aurora 不只是“意大利老牌”的标签，而是可以继续展开成城市工业、意大利设计和书写工具工艺的一条路线。\n\n站内后续可以围绕两个方向扩展：一是 Optima、88 等代表型号的设计和材料变化；二是 Aurora 自家笔尖、活塞系统和限量系列如何形成玩家心中的品牌识别。当前草稿只建立品牌历史锚点，具体型号故事还需要官方目录、产品页和可靠评测继续补证。",
      sourceNotes:
        "Draft based on Aurora official site and Wikidata bootstrap. Model-specific claims need later official/catalog sources.",
    },
    sourceItemIds: ["source-aurora-official-home", "source-wikidata-Q1070672"],
    claimIds: [
      "claim-aurora-official-history-anchor",
      "claim-wikidata-description-CJXe8UpnkHLJ",
    ],
  },
  {
    slug: "schneider",
    story: {
      id: "story-brand-schneider-library",
      title: "从德国书写工业看入门钢笔语境",
      summary:
        "Schneider 品牌馆先以 1938 年公司源流为起点，把它作为德国现代书写工具工业的一部分来处理。",
      bodyMd:
        "Schneider 在钢笔图书馆里的位置和 Pilot、Sailor、Montblanc 不太一样：它更像是一扇通往德国现代书写工具工业的侧门。官方历史把 1938 年的 Blum & Schneider OHG 作为公司起点，后续又围绕 refill、塑料工艺和完整书写工具生产展开。\n\n这意味着 Schneider 页面不应该硬写成“传统高端钢笔品牌”。更合理的处理方式，是把它放在**学生笔、办公书写、入门钢笔和日常文具工业**的语境里。后续扩写 BK402 等型号时，需要同时看官方产品页、零售规格和玩家反馈，区分“品牌工业史”和“具体钢笔体验”。",
      sourceNotes:
        "Draft based on Schneider official history and Wikidata bootstrap. Fountain-pen model claims need product and review sources.",
    },
    sourceItemIds: [
      "source-schneider-official-history",
      "source-wikidata-Q1722637",
    ],
    claimIds: ["claim-schneider-official-history-anchor"],
  },
  {
    slug: "visconti",
    story: {
      id: "story-brand-visconti-library",
      title: "现代意大利奢华钢笔的一条入口",
      summary:
        "Visconti 品牌馆先以 1988 年现代品牌叙事为锚点，后续再拆 Homo Sapiens、材料实验和限量设计。",
      bodyMd:
        "Visconti 不是那种靠 19 世纪公司源流建立权威感的品牌。官方历史把 1988 年作为现代品牌故事的起点，这反而让它在图书馆里有一个清晰位置：**现代意大利高端钢笔、材料实验和强设计感限量系列**。\n\n后续扩写 Visconti 时，最值得拆的是 Homo Sapiens、Dreamtouch 笔尖、火山岩材料和限量版设计语言。但这些都需要单独来源，不能只靠品牌气质概括。当前草稿只把 1988 年和现代奢华书写工具这条主线立起来，具体型号档案要等官方产品页、评测和玩家长期反馈补齐。",
      sourceNotes:
        "Draft based on Visconti official history and Wikidata bootstrap. Homo Sapiens and material claims need product-specific sources.",
    },
    sourceItemIds: ["source-visconti-official-history", "source-wikidata-Q7935670"],
    claimIds: [
      "claim-visconti-official-history-anchor",
      "claim-wikidata-description-5BZDt2fQusMf",
    ],
  },
  {
    slug: "platinum",
    story: {
      id: "story-brand-platinum-library",
      title: "把 #3776 主线放进日本钢笔馆",
      summary:
        "Platinum 品牌馆先以日本钢笔制造、#3776 Century 和 14K 金尖型号档案为入口，后续再补公司年表、莳绘/出云和现代入门线。",
      bodyMd:
        "Platinum 在图书馆里的阅读入口，适合从两个层次展开：一层是**日本钢笔制造商**这个品牌身份，另一层是玩家更容易直接接触到的 **#3776 / #3776 Century** 主线。\n\n当前站内已经有 Platinum 官方 company 页、Wikidata 身份引导和 #3776 Century 官方 collection 页。基于这些来源，品牌馆可以先把 Platinum 放在“日系金尖、密封笔帽语境、#3776 现代主线”的阅读路径里；但公司年表、早期型号、莳绘/出云、Preppy/Prefounte/Plaisir 等入门线，还需要继续补官方历史页、目录和产品页，不能直接由 #3776 页面泛化。",
      sourceNotes:
        "Draft based on Platinum official company page, Wikidata bootstrap, and the official #3776 Century collection source. Company chronology and non-#3776 product lines need follow-up sources.",
    },
    sourceItemIds: [
      "source-platinum-official-company",
      "source-wikidata-Q11335482",
      "source-platinum-3776-century-official",
    ],
    claimIds: ["claim-wikidata-description-e51tJpejEkXY"],
  },
  {
    slug: "kaweco",
    story: {
      id: "story-brand-kaweco-library",
      title: "从 Sport 口袋笔进入 Kaweco",
      summary:
        "Kaweco 品牌馆先以 Sport 口袋笔和 Classic Sport 官方产品页为入口，再把 AL、Brass、Student、Liliput 等支线逐步拆档。",
      bodyMd:
        "Kaweco 的品牌馆入口，最容易从 **Sport 口袋笔**开始。官方 Classic Sport 页面已经能支撑一个清晰阅读点：闭合时短小、插帽后接近标准书写长度，这解释了为什么 Kaweco 在玩家记忆里常常不是先以“参数旗舰”出现，而是以口袋携带和材质支线出现。\n\n后续扩写 Kaweco 时，不应该只写一个 Sport。Classic、AL、Brass、Steel、Frosted、Student、Liliput 等系列需要分别补材质、重量、尺寸、笔尖和上墨兼容性来源。当前品牌故事先把 Sport 作为导览入口，具体公司年表与早期 Heidelberg/Kaweco 名称线索还需要找到稳定可读的官方历史来源后再落 claim。",
      sourceNotes:
        "Draft based on Kaweco official site, Wikidata bootstrap, and the official Classic Sport product source. Early company chronology is intentionally left for later source verification.",
    },
    sourceItemIds: [
      "source-kaweco-official-home",
      "source-wikidata-Q573333",
      "source-kaweco-classic-sport-official",
    ],
    claimIds: ["claim-wikidata-description-mRz7MvzUYwVF"],
  },
  {
    slug: "diplomat",
    story: {
      id: "story-brand-diplomat-library",
      title: "把德国精密书写放进 Diplomat 品牌馆",
      summary:
        "Diplomat 品牌馆先以 1922 年 Hennef 起源和德国精密书写工具语境为入口，后续再拆 Aero、Excellence、Traveller 等型号线。",
      bodyMd:
        "Diplomat 的图书馆入口很适合从一个明确的官方时间点开始：**1922 年 3 月，Hennef, Germany**。这条线索让 Diplomat 不只是“德国品牌”的标签，而是可以放进德国精密书写工具、金属加工和现代商务钢笔的阅读路径里。\n\n后续扩写 Diplomat 时，最值得单独拆档的是 Aero、Excellence、Traveller、Magnum 等型号。尤其 Aero 这种外形高度识别化的型号，应该用官方产品页、尺寸重量和玩家长期反馈补足，而不是只靠品牌故事概括。当前草稿先建立品牌历史锚点，型号体验和版本差异留给后续来源扩写。",
      sourceNotes:
        "Draft based on Diplomat official history. Product-line details need model-specific official pages and review/community sources.",
    },
    sourceItemIds: ["source-diplomat-official-history"],
    claimIds: ["claim-diplomat-official-history-anchor"],
  },
  {
    slug: "esterbrook",
    story: {
      id: "story-brand-esterbrook-library",
      title: "从 Camden 的钢笔工业到现代 Estie",
      summary:
        "Esterbrook 品牌馆先以 1858 年 Camden 起源为历史入口，再把 vintage nib、Model J 和现代 Estie 分开阅读。",
      bodyMd:
        "Esterbrook 的品牌故事不能只写成一个复古名字。官方品牌历史把 **1858 年、Richard Esterbrook、Camden, New Jersey** 放在开头，这让它天然适合在图书馆里拆成两层：一层是美国钢笔工业和可替换笔尖的 vintage 语境，另一层是现代品牌复兴后的 Estie、Estie Oversized 等新型号。\n\n后续扩写要特别注意分界：老 Esterbrook 的 nib 系统、Model J 和学校/办公书写文化是一条线；现代 Esterbrook 的材料、配色、Journaler nib 和 Estie 系列是另一条线。当前草稿先建立官方历史锚点，避免把 vintage 声誉和现代产品体验混成一段。",
      sourceNotes:
        "Draft based on Esterbrook official brand-history page. Vintage nib taxonomy and modern Estie product details need separate sources.",
    },
    sourceItemIds: ["source-esterbrook-official-history"],
    claimIds: ["claim-esterbrook-official-history-anchor"],
  },
  {
    slug: "conklin",
    story: {
      id: "story-brand-conklin-library",
      title: "从 Crescent Filler 读 Conklin",
      summary:
        "Conklin 品牌馆先以 Roy Conklin 和 1897 Crescent Filler 设计线索为入口，后续再区分早期历史与现代复刻/新产品。",
      bodyMd:
        "Conklin 在图书馆里的入口应该是一个机制和历史共同构成的节点：**Roy Conklin 与 Crescent Filler**。官方 About 页面把 1897 年 Toledo 的 Crescent Filler 线索作为早期设计故事来呈现，这比泛泛写“美国老牌”更有信息密度。\n\n后续扩写 Conklin 时，需要把几件事分开：早期 Crescent Filler 和 Mark Twain 相关叙事、历史公司与现代 Conklin 品牌运营、以及现代 All American、Duragraph、Endura 等产品线。当前草稿先把 1897 设计节点挂到品牌馆，具体专利、年代和现代复刻差异仍需继续补目录、专利和产品页。",
      sourceNotes:
        "Draft based on Conklin official About page. Patent-level and modern collection claims need follow-up sources.",
    },
    sourceItemIds: ["source-conklin-official-about"],
    claimIds: ["claim-conklin-official-history-anchor"],
  },
  {
    slug: "leonardo",
    story: {
      id: "story-brand-leonardo-library",
      title: "现代意大利家族工坊的一条线索",
      summary:
        "Leonardo 品牌馆先以官方“父子传承”和 50 年以上经验的定位为入口，后续再拆 Momento Zero、Furore、Momento Magico 等型号。",
      bodyMd:
        "Leonardo Officina Italiana 适合放在“现代意大利钢笔”这条阅读路径里。官方页面把品牌定位放在父子传承和 50 年以上钢笔经验上，这不是 19 世纪老牌叙事，而是更接近现代家族工坊、树脂材料、车削工艺和小批量审美的路线。\n\n后续扩写时，Leonardo 应该优先拆 Momento Zero、Furore、Momento Magico、Mosaico 等型号和材料线。当前草稿只建立品牌定位锚点，不把任何具体型号的笔尖、上墨或材料差异写成事实；这些需要官方产品页和玩家长期评测逐项补证。",
      sourceNotes:
        "Draft based on Leonardo official site positioning. Model-specific materials, filling systems, and nib details need product pages and review/community sources.",
    },
    sourceItemIds: ["source-leonardo-official-home"],
    claimIds: ["claim-leonardo-official-positioning-anchor"],
  },
  {
    slug: "twsbi",
    story: {
      id: "story-brand-twsbi-library",
      title: "从 OEM 经验读 TWSBI 的透明活塞笔",
      summary:
        "TWSBI 品牌馆先以 Ta Shin Precision 的 OEM 背景和 San Wen Tong 命名为入口，后续再拆 ECO、Diamond、Vac 等透明上墨系统型号。",
      bodyMd:
        "TWSBI 在图书馆里适合放在“现代透明示范笔”和“可负担活塞/真空上墨”两条路线上读。官方 About 页面把品牌放在 Ta Shin Precision 多年 OEM 制造经验之后，并解释 TWSBI 与 San Wen Tong 的命名关系，这能支撑一个很实用的品牌馆入口：它不是传统老牌叙事，而是现代制造、透明结构展示和高可玩性上墨系统的组合。\n\n后续扩写时，TWSBI 需要按 ECO、Diamond、580、Vac、Swipe 等型号分别补尺寸、上墨结构、易维护性和常见玩家反馈。当前草稿只建立品牌身份和制造背景，具体开裂争议、上墨器结构和版本差异仍需产品页、维修资料和社区长期反馈继续补证。",
      sourceNotes:
        "Draft based on TWSBI official About page. Product-line durability and mechanism claims need product pages and community sources.",
    },
    sourceItemIds: ["source-twsbi-official-about"],
    claimIds: ["claim-twsbi-official-about-anchor"],
  },
  {
    slug: "nakaya",
    story: {
      id: "story-brand-nakaya-library",
      title: "把手工定制和白金工艺背景放进 Nakaya",
      summary:
        "Nakaya 品牌馆先以 handmade fountain pens 和 Platinum 工厂匠人背景为入口，后续再拆笔形、漆面、定制笔尖与个人化订单。",
      bodyMd:
        "Nakaya 在钢笔图书馆里的位置，不应被简单写成“白金的高端线”。官方 About 页面强调 handmade fountain pens，以及具备 Platinum Pen 制造工厂经验的匠人背景，这给品牌馆提供了更准确的入口：**手工制作、漆面审美、定制书写体验**。\n\n后续扩写 Nakaya 时，需要把 Piccolo、Portable、Naka-ai、Long Cigar 等笔形，以及 urushi、tame-nuri、aka-tamenuri、writer/soft elastic 等定制选择分层处理。当前草稿先建立品牌定位锚点，不直接把任何漆面工艺或笔尖调整写成细节事实；这些需要官方产品页和订购说明逐项补证。",
      sourceNotes:
        "Draft based on Nakaya official About page. Shape, urushi, and nib customization details need product and ordering sources.",
    },
    sourceItemIds: ["source-nakaya-official-about"],
    claimIds: ["claim-nakaya-official-about-anchor"],
  },
  {
    slug: "wancher",
    story: {
      id: "story-brand-wancher-library",
      title: "现代日系材质实验的一条入口",
      summary:
        "Wancher 品牌馆先以 premium Japanese fountain pen 和 artisan/craft 语境为入口，后续再拆 Dream Pen、Sekai、木材和漆面材料线。",
      bodyMd:
        "Wancher 的品牌馆入口更适合从**现代日系材质实验**来读。官方页面把品牌放在 premium Japanese fountain pen 和 artisan/craft 语境里，这说明它的图书馆价值不只在某一个型号，而在材料、漆面、木材、限定主题和跨文化审美组合。\n\n后续扩写时，Wancher 应该优先拆 Dream Pen、Sekai、True Urushi、木材系列和联名/限定主题，同时逐项补充官方产品页、材料说明和玩家反馈。当前草稿只建立品牌定位锚点，不把具体材质、产地或工艺细节写成已审核事实。",
      sourceNotes:
        "Draft based on Wancher official site. Material-origin and model-specific claims need product pages and independent review sources.",
    },
    sourceItemIds: ["source-wancher-official-home"],
    claimIds: ["claim-wancher-official-positioning-anchor"],
  },
  {
    slug: "namiki",
    story: {
      id: "story-brand-namiki-library",
      title: "从 Maki-e 豪华钢笔读 Namiki",
      summary:
        "Namiki 品牌馆先以 Pilot/Namiki 官方 Maki-e 豪华钢笔定位为入口，后续再拆 Emperor、Yukari、Nippon Art 与 Kokkokai 工艺线。",
      bodyMd:
        "Namiki 在图书馆里应该和 Pilot 分开阅读。Pilot 是大规模现代书写工具和日系金尖的重要入口；Namiki 则更适合放在 **Maki-e 豪华钢笔、日本漆艺和高端收藏**这条路径里。官方 Namiki 页面把它定位为 luxury Maki-e fountain pen brand，并明确和 Pilot 语境相关，这可以作为品牌馆的第一层证据。\n\n后续扩写 Namiki 时，应该把 Emperor、Yukari、Nippon Art、Chinkin、Kokkokai 等系列和工艺逐项拆开。当前草稿只建立 Namiki/Pilot/Maki-e 的官方定位锚点，不直接写具体工艺流程、年份或艺术家谱系；这些需要官方系列页、展览资料和可靠收藏资料继续补证。",
      sourceNotes:
        "Draft based on the official Namiki site. Series, artist, and maki-e technique details need dedicated official/catalog sources.",
    },
    sourceItemIds: ["source-namiki-official-home"],
    claimIds: ["claim-namiki-official-makie-anchor"],
  },
  {
    slug: "opus88",
    story: {
      id: "story-brand-opus88-library",
      title: "把台湾滴入式钢笔放进现代馆",
      summary:
        "Opus 88 品牌馆先以 1975-2017 年 OEM/ODM 背景、台湾钢笔热和 eyedropper fountain pens 为入口，后续再拆 Omar、Koloro、Jazz、Demo 等型号。",
      bodyMd:
        "Opus 88 适合放在现代钢笔馆，而不是硬塞进传统老牌叙事。The Paper Mouse 的采访把它的前史放在 1975-2017 年 OEM/ODM 制造背景里，又提到台湾钢笔热之后，品牌在 **2017 年后聚焦 eyedropper fountain pens**。这能解释为什么 Opus 88 在玩家印象里常常和大容量、透明结构、Japanese eyedropper 与安全阀联系在一起。\n\n后续扩写时，Opus 88 应该按 Omar、Koloro、Jazz、Demo、Fantasia 等型号拆档，分别补尺寸、笔尖、容量、材质和上墨结构。当前这篇只建立品牌馆入口：台湾制造背景、现代 eyedropper 系统和玩家可视化结构感，具体型号体验仍需官方产品页、零售规格和长期评测继续补证。",
      sourceNotes:
        "Draft based on The Paper Mouse interview/article. Model-specific specifications and durability claims need product or review sources.",
    },
    sourceItemIds: ["source-paper-mouse-opus88-spotlight"],
    claimIds: ["claim-opus88-paper-mouse-eyedropper-focus"],
  },
  {
    slug: "eversharp",
    story: {
      id: "story-brand-eversharp-library",
      title: "从自动铅笔和 Skyline 进入 Eversharp",
      summary:
        "Eversharp 品牌馆先以 Skyline 和 Henry Dreyfuss 的 1940s 工业设计语境为入口，再回看自动铅笔、Wahl-Eversharp 和后续品牌变化。",
      bodyMd:
        "Eversharp 的图书馆入口不宜只写成一个老品牌名。更好读的入口是 **Skyline**：PenHero 的 Skyline 档案把 1940 年 Henry Dreyfuss 参与设计、1941 年 Skyline 推出放在一起，这让 Eversharp 可以进入 1940s 美国工业设计、流线型外观和大量生产钢笔的语境。\n\n后续扩写时，Eversharp 还要分清自动铅笔业务、Wahl-Eversharp 品牌线、Skyline、Fifth Avenue、Symphony 以及现代复兴名义下的产品。当前这篇只先建立 Henry Dreyfuss 与 Skyline 的阅读入口，避免把不同年代的 Eversharp 叙事混成一段。",
      sourceNotes:
        "Draft based on PenHero's Eversharp Skyline profile. Broader Wahl/Eversharp corporate history and non-Skyline models need separate sources.",
    },
    sourceItemIds: ["source-penhero-eversharp-skyline"],
    claimIds: ["claim-eversharp-penhero-skyline-dreyfuss"],
  },
  {
    slug: "moore",
    story: {
      id: "story-brand-moore-library",
      title: "把 Moore 放回 Boston 安全笔和二线老牌脉络",
      summary:
        "Moore 品牌馆先以 Boston、American Fountain Pen Company 和 1917 年 Moore Pen Company 名称变化为入口，后续再拆安全笔与 Fingertip。",
      bodyMd:
        "Moore 这种品牌，如果只写一句“美国老钢笔品牌”，会很快变成空标签。PenHero 的 Moore Fingertip 档案给了更清楚的入口：Moore 的前身 1900 年起于 Boston，使用 **American Fountain Pen Company** 名称，1917 年改为 Moore Pen Company。这个脉络能把 Moore 放回早期美国安全笔、二线老牌和战后设计实验的阅读路线里。\n\n后续扩写时，Moore 应该至少拆三层：早期安全笔、Moore Pen Company 的常规型号，以及 1946-1950 年 Fingertip 这类更有设计辨识度的后期产品。当前这篇先建立 Boston 和公司名称变化的历史锚点，具体型号年代、上墨结构和市场定位仍需继续补证。",
      sourceNotes:
        "Draft based on PenHero's Moore Fingertip profile. Earlier safety-pen details and model taxonomy need additional catalog or collector sources.",
    },
    sourceItemIds: ["source-penhero-moore-fingertip"],
    claimIds: ["claim-moore-penhero-boston-origin"],
  },
  {
    slug: "noodlers",
    story: {
      id: "story-brand-noodlers-library",
      title: "先把 Noodler's 当作墨水品牌来读",
      summary:
        "Noodler's 品牌馆先以 Nathan Tardif、Lowell, Massachusetts 和美国制造墨水语境为入口，再谨慎扩展到 Ahab、Konrad 等钢笔型号。",
      bodyMd:
        "Noodler's 在钢笔图书馆里要先按墨水品牌来读，再处理它的钢笔型号。Truly American Made 的品牌页把 Noodler's Ink 放在 Nathan Tardif、Lowell, Massachusetts 和 **100% made in the USA** 的制造语境中，这说明它的核心线索首先是墨水、颜色命名、供应链和玩家文化，而不是传统钢笔厂牌谱系。\n\n后续扩写时，Noodler's 的 Ahab、Konrad、Charlie 等钢笔应单独建型号档案，分别补材质、上墨、笔尖可调性和玩家常见反馈。当前这篇只建立品牌馆入口，并把来源等级标成二级制造资料；涉及争议、政治命名或社区分歧时，需要再用公开论坛、零售说明和可靠长期评测交叉核验。",
      sourceNotes:
        "Draft based on a secondary Truly American Made manufacturing profile. Product-line and controversy context require separate review/community sources.",
    },
    sourceItemIds: ["source-truly-american-made-noodlers"],
    claimIds: ["claim-noodlers-tam-made-usa"],
  },
  {
    slug: "wahl",
    story: {
      id: "story-brand-wahl-library",
      title: "从 Wahl Pen 读 Eversharp 之前的机械脉络",
      summary:
        "Wahl 品牌馆先以 Richard's Pens 的 The Wahl Pen profile 为入口，把早期轮夹、杠杆和 Tempoint-like silhouette 放进 Eversharp 之前的机械设计语境。",
      bodyMd:
        "Wahl 不应该只作为 Eversharp 的前缀出现。Richard's Pens 的 **The Wahl Pen** profile 把它放回更早的机械设计语境：Tempoint-like silhouette、**roller clip**、以及带有明显形体识别的 lever，都能帮助读者理解 Wahl 在并入后续 Wahl-Eversharp 叙事之前，本身已经是一条值得单独整理的设计线索。\n\n后续扩写 Wahl 时，应该继续拆 Art Deco ringtop、hard rubber pens、Personal Point、Equipoise、Doric 等路径。当前这篇先建立馆藏入口：早期 Wahl 的外形、夹子和杠杆细节，而不直接把 Doric 或 Skyline 的后续声誉倒推到所有 Wahl Pen 上。",
      sourceNotes:
        "Draft based on Richard's Pens profile. Broader Wahl-Eversharp company chronology and individual model claims need separate profiles or catalog sources.",
    },
    sourceItemIds: ["source-richardspens-a5372d5df28f3931"],
    claimIds: ["claim-wahl-richardspens-early-design-anchor"],
  },
  {
    slug: "chilton",
    story: {
      id: "story-brand-chilton-library",
      title: "把 Chilton 放进 pneumatic filler 的路线",
      summary:
        "Chilton 品牌馆先以 Chiltonian 和 second-generation pneumatic filling system 为入口，后续再补 Long Island City、Summit 和各代 pneumatic 机制。",
      bodyMd:
        "Chilton 的品牌馆入口，应该先从 filling system 读。Richard's Pens 的 **The Chilton Chiltonian** profile 把 Chiltonian 写成一支真正的 Chilton，并明确提到它使用 **second-generation pneumatic filling system**。这让 Chilton 在图书馆里不是一个空泛的 vintage 名字，而是一条围绕 pneumatic filler、晚期降本型号和公司地点变化展开的路线。\n\n后续扩写时，Chilton 应该继续把 Long Island City、Summit, New Jersey、早期 pneumatic system、Golden Quill、Wing-flow 和 Chiltonian 分开建档。当前这篇只先建立机制入口，避免把晚期 Chiltonian 的做工状态泛化到所有 Chilton 型号。",
      sourceNotes:
        "Draft based on Richard's Pens Chiltonian profile. Full Chilton mechanism history needs additional pneumatic-filler and model-specific profiles.",
    },
    sourceItemIds: ["source-richardspens-d5b75a1cd3d6ce43"],
    claimIds: ["claim-chilton-richardspens-pneumatic-anchor"],
  },
  {
    slug: "dunn",
    story: {
      id: "story-brand-dunn-library",
      title: "从 Little Red Pump-Handle 读 Dunn-Pen",
      summary:
        "Dunn 品牌馆先以 1921 年 New York City 的 Dunn-Pen Company 和 Charles Dunn 的 high-capacity pump filler 专利作为入口。",
      bodyMd:
        "Dunn 的图书馆入口很清楚：不是先讲品牌神话，而是先讲一个机制。Richard's Pens 的 **The Dunn-Pen** profile 说，**Dunn-Pen Company** 在 1921 年第一季度由投资者在 New York City 创建，Charles Dunn 的 1920 年 **high-capacity pump filler** 专利成为产品基础。广告中的 Little Red Pump-Handle 也让这支笔的记忆点从公司史直接连到上墨系统。\n\n后续扩写 Dunn 时，可以继续拆泵式上墨、Bakelite/celluloid 材料、Tattler、Dreadnaught 和短暂公司生命周期。当前这篇只先把 Dunn 放在“短命但机制识别度很高”的 vintage 品牌位置里。",
      sourceNotes:
        "Draft based on Richard's Pens Dunn-Pen profile. Detailed model variants and material chronology need follow-up profile/catalog sources.",
    },
    sourceItemIds: ["source-richardspens-579b2a500f7d4cb5"],
    claimIds: ["claim-dunn-richardspens-red-pump-anchor"],
  },
  {
    slug: "wearever",
    story: {
      id: "story-brand-wearever-library",
      title: "把 Wearever 放进大众化材料和注塑工艺语境",
      summary:
        "Wearever 品牌馆先以 David Kahn、Wearever Zenith 和 injection-molded pen production 为入口，再拆 De Luxe、Pacemaker、Zenith 等大众化型号。",
      bodyMd:
        "Wearever 的价值不在于把它写成高端收藏品牌，而在于它很适合解释美国大众化钢笔、材料和制造方式。Richard's Pens 的 **The Wearever Zenith** profile 把 **David Kahn**、Wearever fountain pens 和 injection-molded pen production 联系起来，这给品牌馆提供了一个很实用的入口：低价、大量生产、材料工艺和战时/战后市场。\n\n后续扩写 Wearever 时，应该把 De Luxe、Pacemaker、Zenith、Supreme、Pennant、Saber 等型号分层处理，并用广告、目录和维修资料区分玩家价值与历史价值。当前这篇先建立 David Kahn 和注塑工艺语境，不把所有 Wearever 都简单归为“便宜笔”。",
      sourceNotes:
        "Draft based on Richard's Pens Wearever Zenith profile. Individual Wearever model claims need additional profiles, ads, or catalogs.",
    },
    sourceItemIds: ["source-richardspens-9f946df0d470f8e5"],
    claimIds: ["claim-wearever-richardspens-injection-molding-anchor"],
  },
  {
    slug: "graphomatic",
    story: {
      id: "story-brand-graphomatic-library",
      title: "从战时 ink-making pen 读 Graphomatic",
      summary:
        "Graphomatic 品牌馆先以 Graph-O-Matic、Grieshaber Pen Company 和 Sager Pen Corporation 的战时 ink-making pen 语境作为入口。",
      bodyMd:
        "Graphomatic 这类品牌不适合硬写成完整厂牌史。Richard's Pens 的 **The Graphomatic Inkmaker & Colonel** profile 给了更好的入口：**Graph-O-Matic** 作为战时语境下的 ink-making pen 出现，并和 Grieshaber Pen Company、Sager Pen Corporation 这些制造/公司线索连在一起。\n\n后续扩写 Graphomatic 时，应该围绕 wartime writing、trench pen 后继、dry ink pellet、ink-making mechanism 和广告语境来读，而不是直接套用常规品牌馆模板。当前这篇先把它放进“战时便携供墨和特殊机制”的专题路线里。",
      sourceNotes:
        "Draft based on Richard's Pens Graphomatic Inkmaker & Colonel profile. Mechanism-specific details need dedicated diagram/source follow-up.",
    },
    sourceItemIds: ["source-richardspens-26f8de3b54f05142"],
    claimIds: ["claim-graphomatic-richardspens-inkmaker-anchor"],
  },
  {
    slug: "ingersoll",
    story: {
      id: "story-brand-ingersoll-library",
      title: "把 Ingersoll 的 dollar concept 放进钢笔馆",
      summary:
        "Ingersoll 品牌馆先以 Charles H. Ingersoll Dollar Pen Company、Newark 和一美元高质量钢笔定位作为入口。",
      bodyMd:
        "Ingersoll 的阅读入口，应该从“dollar concept”开始。Richard's Pens 的 **The Ingersoll Dollar Pen** profile 把它和 Robert H. Ingersoll Watch Company 的 dollar watch 背景联系起来，并写到 **Charles H. Ingersoll Dollar Pen Company** 在 Newark, New Jersey 把这一思路转化为一美元高质量 fountain pens。\n\n这让 Ingersoll 在图书馆里不是一个模糊的老牌名，而是可以进入 1920s 美国大众价格、14K nib、Bakelite pens 和市场定位的路线。当前这篇只先建立价格策略和公司入口，具体型号材料和 cap closure 差异留给后续档案补证。",
      sourceNotes:
        "Draft based on Richard's Pens Ingersoll Dollar Pen profile. Model material and cap-closure details need follow-up source claims.",
    },
    sourceItemIds: ["source-richardspens-19715bd140d8de5e"],
    claimIds: ["claim-ingersoll-richardspens-dollar-pen-anchor"],
  },
  {
    slug: "morrison",
    story: {
      id: "story-brand-morrison-library",
      title: "从 Patriot 读 Morrison 的战时钢笔",
      summary:
        "Morrison 品牌馆先以 Richard's Pens 的 Morrison's Patriot profile 为入口，把它放进 World War II、资源约束和爱国营销语境。",
      bodyMd:
        "Morrison 的品牌馆入口，可以先从 **Patriot** 读。Richard's Pens 的 **Morrison’s Patriot** profile 把这支笔放在 **World War II** 的资源约束、战时制造和爱国营销语境里，这比简单写“美国老牌”更有信息密度。\n\n后续扩写 Morrison 时，应该继续拆早期 overlay pens、Battleship Grey、Morrison Patriot、钢尖/金尖转换和维修资料。当前这篇只先建立战时型号入口，不把 Patriot 的语境倒推到 Morrison 的全部历史。",
      sourceNotes:
        "Draft based on Richard's Pens Morrison's Patriot profile. Broader Morrison company history and early overlay models need additional sources.",
    },
    sourceItemIds: ["source-richardspens-0fa236b38a59782d"],
    claimIds: ["claim-morrison-richardspens-patriot-wartime-anchor"],
  },
  {
    slug: "wasp",
    story: {
      id: "story-brand-wasp-library",
      title: "把 WASP 当作 Sheaffer 低价线索来读",
      summary:
        "WASP 品牌馆先以 W. A. Sheaffer Pen Company、lower-end market 和 Addipoint 作为入口，再拆 Clipper、Vacuum-Fil 与 Sheaffer 关系。",
      bodyMd:
        "WASP 不能只按一个孤立品牌来读。Richard's Pens 的 **The WASP Addipoint** profile 明确把 WASP 写成来自 **W. A. Sheaffer Pen Company** initials 的名称，并把它放进 Sheaffer 为 lower-end market 建立的产品线语境里。\n\n后续扩写时，WASP 应该同时看 Addipoint、Clipper、Vacuum-Fil、Trans-O-Meter 和 Fort Madison imprint 等线索。当前这篇先建立 WASP 与 Sheaffer 的关系入口，避免把它误读成和 Sheaffer 完全无关的独立厂牌。",
      sourceNotes:
        "Draft based on Richard's Pens WASP Addipoint profile. Clipper and Vacuum-Fil details need separate model/source expansion.",
    },
    sourceItemIds: ["source-richardspens-765c4e651bf3637e"],
    claimIds: ["claim-wasp-richardspens-sheaffer-lower-end-anchor"],
  },
  {
    slug: "monteverde",
    story: {
      id: "story-brand-monteverde-library",
      title: "把 Monteverde 放进现代 Yafa 品牌和色彩文具体系",
      summary:
        "Monteverde 品牌馆先以官方 Founded in 1999、现代 fine writing instruments、材料和墨水/替芯体系作为入口。",
      bodyMd:
        "Monteverde 的图书馆入口不该伪装成百年老牌。官方 About 页面把 Monteverde USA 放在 **Founded in 1999** 的现代 fine writing instruments 语境里，并强调色彩、材料、ergonomic grips、advanced ink systems、European-grade resins、durable metals 和 accessible quality。\n\n这意味着 Monteverde 后续扩写要优先拆现代产品线、墨水和 refills 生态，而不是套用 vintage 品牌叙事。当前这篇先建立 Yafa Brands 体系下的现代品牌入口，具体型号如 Innova、Invincia、Ritma、Regatta Sport 等还需要官方产品页和玩家评测继续补证。",
      sourceNotes:
        "Draft based on Monteverde USA official About page. Individual model and ink/refill claims need product-page or catalog sources.",
    },
    sourceItemIds: ["source-monteverde-official-about"],
    claimIds: ["claim-monteverde-official-1999-anchor"],
  },
  {
    slug: "skb",
    story: {
      id: "story-brand-skb-library",
      title: "把 SKB 放回台湾书写记忆和重启钢笔生产线",
      summary:
        "SKB 品牌馆先以 1955 年文明鋼筆、1959 年 830 钢笔、1960s 自制笔尖能力和 2012 年重启台湾制钢笔为入口。",
      bodyMd:
        "SKB 这一页适合从“台湾书写记忆”读，而不是只写成一个现代文具品牌。SKB 官方关于页把品牌起点放在 **1955 年**正式立名文明鋼筆股份有限公司，随后写到 1959 年第一支自有品牌 830 钢笔，以及 1960 年代自制笔尖和金尖生产的能力。华山1914的访谈文章则把 SKB 放在台湾文具史和老品牌转型的语境里，并明确写到 2012 年重启钢笔生产线。\n\n这给图书馆一个很清楚的入口：SKB 既有早期台湾钢笔制造史，也经历过原子笔、彩色笔和文创合作的转向。后续扩写时，应该优先拆 830、22 型、现代精品笔系列和派顿/SKB 型号关系；当前草稿先建立 1955 与 2012 两个锚点，不把所有型号细节直接写死。",
      sourceNotes:
        "Draft based on SKB official about page and Huashan 1914 interview/editorial material. Model-specific details still need product pages, catalog scans, or reliable collector sources.",
    },
    sourceItemIds: [
      "source-skb-official-about",
      "source-huashan1914-skb-writing-memory",
    ],
    claimIds: [
      "claim-skb-official-1955-2012-anchor",
      "claim-skb-huashan-2012-restart-anchor",
    ],
  },
  {
    slug: "penbbs",
    story: {
      id: "story-brand-penbbs-library",
      title: "把 PenBBS 当作社区驱动的现代钢笔品牌来读",
      summary:
        "PenBBS 品牌馆先以 Chinese Internet forum、Beini Zheng、Etsy/Taobao 渠道、彩色批次和现代平价钢笔玩家文化作为入口。",
      bodyMd:
        "PenBBS 不能按传统厂牌史模板硬写。The Gentleman Stationer 把 PenBBS 放在 **Chinese Internet forum** 的根源语境里，而 Narratess 的文章则把它描述为 Beini Zheng 相关的中国品牌，提到 Etsy、Taobao、彩色批次和较低价格这些玩家更容易感知的线索。\n\n因此，站内更适合把 PenBBS 放进“社区驱动的现代钢笔品牌”路线：论坛/玩家文化、颜色批次、可负担价格、多种上墨系统和跨境购买渠道。当前草稿只用二级英文博客建立入口；具体型号如 308、323、456、355 等，还需要逐个补官方店铺、产品页或长期评测，避免把单篇博客里的体验泛化到全部型号。",
      sourceNotes:
        "Draft based on The Gentleman Stationer and Narratess secondary blog/review sources. PenBBS still needs official shop/product-page and model-specific review expansion.",
    },
    sourceItemIds: [
      "source-gentleman-stationer-penbbs",
      "source-narratess-penbbs-fountain-pens",
    ],
    claimIds: [
      "claim-penbbs-gentleman-stationer-forum-anchor",
      "claim-penbbs-narratess-beini-colors-anchor",
    ],
  },
  {
    slug: "duke",
    story: {
      id: "story-brand-duke-library",
      title: "把 Duke 放进中国出口钢笔和制造商目录语境",
      summary:
        "Duke 品牌馆先以 Shanghai G. Crown Fountain Pen Co., Ltd. 的制造商档案和 Duke Pens Australia 的分销说明作为谨慎入口。",
      bodyMd:
        "Duke 这一页要先把证据边界讲清楚：目前能稳定落地的不是完整品牌官网史，而是制造商/分销商资料。GoldSupplier 的公司档案把 **Shanghai G. Crown Fountain Pen Co., Ltd.** 列为 1992 年成立、面向 writing instruments 的制造商；Duke Pens Australia 的 History 页则说 Tieco International 的 Duke Pens range 来自 Shanghai G. Crown Fountain Pen Co., Ltd.。\n\n所以 Duke 在图书馆里暂时更适合放进“中国出口钢笔、制造商目录和跨境分销”的语境，而不是直接写成一段漂亮的品牌神话。后续需要继续找官网、目录、包装、商标资料或可靠玩家拆解，才能把具体型号、德国 Duke Lux Pen GmbH 说法和上海 G. Crown 的关系讲得更稳。",
      sourceNotes:
        "Draft based on GoldSupplier manufacturer profile and Duke Pens Australia distributor history. Treat as cautious secondary manufacturer/distributor context, not full official brand history.",
    },
    sourceItemIds: [
      "source-goldsupplier-shanghai-g-crown",
      "source-duke-pens-australia-history",
    ],
    claimIds: [
      "claim-duke-goldsupplier-shanghai-g-crown-anchor",
      "claim-duke-australia-shanghai-g-crown-link",
    ],
  },
  {
    slug: "kaco",
    story: {
      id: "story-brand-kaco-library",
      title: "把 KACO 放进上海原创设计文具品牌语境",
      summary:
        "KACO 品牌馆先以 2011 年上海创立、原创设计文具定位和中国大宁钢笔礼盒作为入口，后续再拆 Master、Edge、Sky 等具体型号。",
      bodyMd:
        "KACO 的图书馆入口，不适合只写“国产钢笔品牌”。官方品牌介绍把它放在 **2011 年**中国上海创立的书写工具与文创精品品牌语境里，并强调简约现代的原创设计、品质追求和多个设计奖项。这说明 KACO 的阅读路线应当同时看文具设计、商务书写、日常书写和文创产品，而不是只看单个钢笔型号。\n\n官方公司新闻里提到「中国大宁钢笔礼盒」入围上海设计100+，这可以作为钢笔相关的设计锚点。后续扩写时，KACO Master、Edge、SKY、RETRO 等型号需要分别补产品页、规格和评测。当前草稿只建立品牌定位和中国大宁钢笔礼盒这两个入口，不把全部产品线都写成已审核型号档案。",
      sourceNotes:
        "Draft based on KACO official brand introduction and official China Daning fountain-pen gift-box news. Model-specific specifications still need product-page and review sources.",
    },
    sourceItemIds: [
      "source-kaco-official-brand-intro",
      "source-kaco-official-china-daning",
    ],
    claimIds: [
      "claim-kaco-official-2011-shanghai-anchor",
      "claim-kaco-official-china-daning-design-anchor",
    ],
  },
  {
    slug: "snowhite",
    story: {
      id: "story-brand-snowhite-library",
      title: "把白雪放进中国直液式书写工具和 OEM 文具工业",
      summary:
        "白雪品牌馆先以 Qingdao Changlong Stationery 的 May 1988 起点、Snowhite 文具品类和 free-ink-system fountain pen 作为入口。",
      bodyMd:
        "白雪在图书馆里更像是一条通向中国现代文具工业的路径。Snowhite Pen 官方英文站把 Qingdao Changlong Stationery 的起点写为 **May 1988**，并把产品放在 Snowhite 文具、直液式书写工具、free-ink-system fountain pen、gel pen、ballpoint pen、marker 等品类中。\n\n这意味着白雪页不应该硬写成传统高端钢笔品牌。更稳妥的入口是：直液式书写工具、学生/办公文具、OEM 制造和大规模文具品类。后续若要写具体钢笔型号，需要继续找官方产品页、中文目录或可靠零售规格；当前草稿只把白雪放进中国书写工具工业和 free-ink-system fountain pen 的来源语境里。",
      sourceNotes:
        "Draft based on Snowhite Pen official export-site company profile. Fountain-pen model specifics need product/catalog sources.",
    },
    sourceItemIds: ["source-snowhite-official-about"],
    claimIds: ["claim-snowhite-official-1988-fountain-pen-anchor"],
  },
  {
    slug: "delike",
    story: {
      id: "story-brand-delike-library",
      title: "把 Delike 放进口袋平价笔和 New Moon 评测语境",
      summary:
        "Delike 品牌馆先以 New Moon 3、低价中国钢笔生态、fude/Waverly nib 讨论和外观借鉴争议作为谨慎入口。",
      bodyMd:
        "Delike 这一页必须先承认来源边界：目前能稳定引用的是玩家/评测博客，而不是完整官网品牌史。Fountain Pen Chronicles 的 **New Moon 3** 评测把 Delike 放在 Shanghai Jingdian、Moonman/Majohn 与低价中国钢笔生态里，同时提到 New Moon 3 的 Sailor Pro Gear Slim-inspired design context。The Well-Appointed Desk 早在 2017 年也用 Delike New Moon 和 Sailor Pro Gear Slim 的相似性做过消费端比较。\n\n因此 Delike 适合先作为一个“现代中国平价/口袋笔与仿制争议”的馆藏入口：能帮助读者理解为什么 New Moon、Alpha、Element 等型号经常和外观借鉴、低价试错、fude/bent nib 体验放在一起讨论。当前草稿只保留评测语境，不写创立年、不写官方品牌史，也不把单篇评测体验泛化到全部 Delike 型号。",
      sourceNotes:
        "Draft based on secondary review sources only. No official founding-history claim is made; model and brand-relationship details remain pending until stronger sources are found.",
    },
    sourceItemIds: [
      "source-fpc-delike-new-moon-3",
      "source-wellappointed-delike-new-moon",
    ],
    claimIds: [
      "claim-delike-fpc-new-moon-jingdian-anchor",
      "claim-delike-wellappointed-new-moon-copycat-anchor",
    ],
  },
  {
    slug: "jinhao",
    story: {
      id: "story-brand-jinhao-library",
      title: "把 Jinhao 放进上海千古和入门钢笔生态",
      summary:
        "Jinhao 品牌馆先以 Shanghai Qiangu Stationery Co., Ltd. 的制造商目录、JINHAO/BAOER 品牌线和入门价位钢笔生态作为谨慎入口。",
      bodyMd:
        "Jinhao 是这类中国品牌里最适合“谨慎写”的页面之一：它在全球钢笔玩家那里很有能见度，但公开可核验资料更多来自制造商目录、零售页面和评测，而不是一条完整、稳定的官方品牌史。Alibaba 的 Shanghai Qiangu Stationery Co., Ltd. 公司页把 fountain pen 列入主要产品，并把 JINHAO 和 BAOER 写进公司品牌语境；这个来源可以帮我们确认制造商/品牌线关系，但不能直接替代独立品牌史。\n\n因此站内先把 Jinhao 放进**上海千古、入门价位、低成本试错和中国出口钢笔生态**来读。后续扩写 X159、82、9019、159 等型号时，需要分别补零售规格、玩家长期评测和版本差异，避免把“便宜好买”的社区印象写成未经证实的公司历史。",
      sourceNotes:
        "Draft based on Alibaba manufacturer-directory context only. Founding/company-line details are treated as directory claims; model history and community reputation need additional review/catalog sources.",
    },
    sourceItemIds: ["source-alibaba-qiangu-company-profile"],
    claimIds: ["claim-jinhao-alibaba-qiangu-manufacturer-anchor"],
  },
  {
    slug: "majohn",
    story: {
      id: "story-brand-majohn-library",
      title: "把 Majohn 放进 Moonman 改名和现代平价机制实验",
      summary:
        "Majohn 品牌馆先以 Moonman/Majohn 命名重叠、A1/A2 按动钢笔评测和现代中国平价机制实验作为入口。",
      bodyMd:
        "Majohn 这一页不适合一上来写成完整公司年表。当前更稳的入口，是玩家实际遇到的名字变化：**Moonman / Majohn**。Sketchy Wolf 的 A1 评测直接把 Majohn 和 Moonman 放在同一消费语境里，并围绕按动钢笔 A1 展开；The Poor Penman 则把 Majohn/Moonman 放进 A1、A2 和现代中国平价钢笔的比较场景里。\n\n所以 Majohn 在图书馆里可以先作为“现代中国平价机制实验”的入口：按动钢笔、透明示范笔、活塞/大容量上墨、外观借鉴争议和玩家愿意低成本尝试新机制的心理都可以在这里展开。但当前草稿只保留评测语境，不写官方创立年，也不把单个型号体验泛化到整个品牌。",
      sourceNotes:
        "Draft based on secondary review sources only. Moonman/Majohn naming and A1/A2 context are treated as consumer-facing review evidence, not official corporate history.",
    },
    sourceItemIds: [
      "source-sketchywolf-majohn-a1",
      "source-poorpenman-majohn-over-the-moon",
    ],
    claimIds: [
      "claim-majohn-sketchywolf-moonman-a1-anchor",
      "claim-majohn-poorpenman-a1-a2-context",
    ],
  },
  {
    slug: "wingsung",
    story: {
      id: "story-brand-wingsung-library",
      title: "把 Wing Sung 放进新永生复兴和 601 语境",
      summary:
        "Wing Sung 品牌馆先以 New Wing Sung 复兴解释、601/618/698 现代讨论和 601 的 Parker 51 式暗尖语境作为入口。",
      bodyMd:
        "Wing Sung 不能简单写成一个连续、干净的品牌线。FrankUnderwater 的 **New Wing Sung** 解释把旧永生、新永生、Hero 语境和 601、618、698 等型号放在一起讨论，正好说明这个页面最需要的是“关系边界”而不是一句品牌口号。它既有老中国钢笔名称的历史感，也有现代复兴、授权/生产关系和新型号讨论的复杂性。\n\n站内先把 Wing Sung 放进两条阅读路径：一条是老牌中文钢笔名称和上海/国产钢笔记忆，另一条是 601 这类现代产品如何借助 Parker 51 式暗尖、复古外形和低价体验进入玩家讨论。Rupert Arzeian 的 601 评测可以作为消费端入口，但 601 的设计来源、授权关系和具体版本仍需要更多资料交叉核验。",
      sourceNotes:
        "Draft based on FrankUnderwater's secondary explainer and a 601 review. Ownership, license, and old/new Wing Sung relationships remain source-sensitive and should not be overgeneralized.",
    },
    sourceItemIds: [
      "source-frankunderwater-new-wing-sungs",
      "source-rupertarzeian-wingsung-601",
    ],
    claimIds: [
      "claim-wingsung-frankunderwater-new-wing-sung-anchor",
      "claim-wingsung-rupertarzeian-601-context",
    ],
  },
  {
    slug: "hero",
    story: {
      id: "story-brand-hero-library",
      title: "把 Hero 放回华孚金笔厂、英雄金笔厂和国货钢笔记忆",
      summary:
        "Hero 品牌馆先以 1931 年华孚金笔厂、1966 年英雄金笔厂改名、英雄自来水笔和官方经典典藏目录作为入口。",
      bodyMd:
        "Hero 的品牌馆终于可以用官方来源建立清晰骨架。上海英雄（集团）的集团概况把英雄金笔厂的前身追溯到 **1931 年**周荆庭创立的华孚金笔厂，并写到 **1966 年**华孚金笔厂改名为英雄金笔厂；同一页面也把“英雄”自来水笔放在中国制笔行业、老字号和国货钢笔记忆里。\n\n这让 Hero 页面可以分成两条后续路线：一条讲华孚、英雄金笔厂、英雄赶派克和国货工业记忆；另一条讲 100、616、经典典藏和当代目录。当前草稿先建立官方历史锚点和目录锚点，具体型号年代、版本差异和玩家体验还需要型号页、目录页和评测继续补证。",
      sourceNotes:
        "Draft based on Hero Group official overview and official classic-product category. Model-specific claims for Hero 100/616 need additional catalog and review sources.",
    },
    sourceItemIds: [
      "source-hero-group-about",
      "source-hero-group-classic-products",
    ],
    claimIds: [
      "claim-hero-official-1931-huafu-anchor",
      "claim-hero-official-classic-products-anchor",
    ],
  },
  {
    slug: "hongdian",
    story: {
      id: "story-brand-hongdian-library",
      title: "把 HongDian 放进 Black Forest 和现代金属日用笔语境",
      summary:
        "HongDian 品牌馆先以 Dark Blue Forest / Black Forest 评测、金属杆身、低价日用和多笔尖选择作为谨慎入口。",
      bodyMd:
        "HongDian 目前公开可核验材料更像“产品和评测语境”，而不是完整公司史。dapprman 的 **Hong Dian Dark Blue Forest** 评测把 Hong Dian/HongDian 放在 Amazon/Etsy 等消费渠道和 Chinese firm 语境里；Everyday Scrawl 的早期评测则从颜色、Extra-Fine / Fine / Bent or Fude 笔尖、全金属杆身和 cartridge/converter 使用体验切入。\n\n所以这个页面先不写创立年，不写官方品牌史，也不把某个店铺页的营销文字当成硬事实。更稳妥的阅读入口是：**Black Forest / Dark Blue Forest 这类现代金属日用笔、低价试错、多笔尖选择和中文品牌在海外电商平台上的能见度**。后续如果能找到可靠官网或工商资料，再补公司层面的 claim。",
      sourceNotes:
        "Draft based on independent review sources only. No official founding-history claim is made; brand/company facts remain pending until stronger sources are found.",
    },
    sourceItemIds: [
      "source-dapprman-hong-dian-dark-blue-forest",
      "source-everyday-scrawl-hong-dian-dark-blue-forest",
    ],
    claimIds: [
      "claim-hongdian-dapprman-dark-blue-forest-anchor",
      "claim-hongdian-everyday-scrawl-forest-anchor",
    ],
  },
  {
    slug: "picasso",
    story: {
      id: "story-brand-picasso-library",
      title: "把 Picasso 放进上海帕弗洛和艺术钢笔礼品语境",
      summary:
        "Picasso 品牌馆先以 2003 年上海帕弗洛、毕加索品牌书写工具、艺术设计工艺和礼品/定制场景作为入口。",
      bodyMd:
        "Picasso 这一页可以先从公司简介入手，而不是只靠“艺术钢笔”印象。毕加索钢笔官方网站写明**上海帕弗洛文化用品有限公司成立于2003年**，并把业务放在研发、设计、生产和销售毕加索品牌书写工具的语境里，包括金笔、铱金笔、美工笔、宝珠笔以及配套产品。\n\n这让 Picasso 的馆藏入口更接近“艺术设计、商务礼品、定制服务和国产书写工具制造”，而不是传统高端钢笔年表。后续扩写时，可以继续拆官方提到的工艺能力、2016 年设计创新中心及钢笔实验室，以及具体型号线；但当前草稿只建立公司/品牌语境，不把营销荣誉泛化成型号体验。",
      sourceNotes:
        "Draft based on Picasso official Chinese and English company introductions. Model-level writing experience and chronology need product/catalog and review sources.",
    },
    sourceItemIds: [
      "source-picasso-official-company-cn",
      "source-picasso-official-company-en",
    ],
    claimIds: [
      "claim-picasso-official-2003-pafuluo-anchor",
      "claim-picasso-official-english-company-anchor",
    ],
  },
];

const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : BRAND_STORIES.length;

type EntityRow = {
  id: string;
  slug: string;
  name: string;
};

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function execute(db: Client, sql: string, args: unknown[] = []) {
  await db.execute({ sql, args: args as InArgs });
}

async function runMigrations(db: Client) {
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  );

  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  const appliedRows = await db.execute("SELECT name FROM migrations");
  const applied = new Set(appliedRows.rows.map((row) => String(row.name)));
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const hasLegacySchema =
    (
      await db.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'entities'",
      )
    ).rows.length > 0;

  for (const file of files) {
    if (applied.has(file)) continue;
    if (hasLegacySchema && file !== "011_library_schema.sql") {
      await execute(
        db,
        "INSERT OR IGNORE INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
        [file],
      );
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await db.executeMultiple(sql);
    await execute(
      db,
      "INSERT INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
      [file],
    );
    console.log(`Applied migration: ${file}`);
  }
}

async function findLocalEntity(db: Client, slug: string): Promise<EntityRow | null> {
  const result = await db.execute({
    sql: "SELECT id, slug, name FROM entities WHERE slug = ? AND type = 'brand' LIMIT 1",
    args: [slug],
  });
  return (result.rows[0] as EntityRow | undefined) || null;
}

async function existingIds(db: Client, table: string, ids: string[]) {
  if (ids.length === 0) return new Set<string>();
  const placeholders = ids.map(() => "?").join(", ");
  const result = await db.execute({
    sql: `SELECT id FROM ${table} WHERE id IN (${placeholders})`,
    args: ids,
  });
  return new Set(result.rows.map((row) => String(row.id)));
}

async function writeBrandStory(
  db: Client,
  local: EntityRow,
  seed: BrandStorySeed,
) {
  const presentSources = await existingIds(db, "source_items", seed.sourceItemIds);
  const presentClaims = await existingIds(db, "claims", seed.claimIds);

  await execute(
    db,
    `INSERT INTO stories
      (id, entity_id, title, story_type, summary, body_md, status, source_notes, updated_at)
     VALUES (?, ?, ?, 'brand_story', ?, ?, 'draft', ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      body_md = excluded.body_md,
      source_notes = excluded.source_notes,
      updated_at = datetime('now')`,
    [
      seed.story.id,
      local.id,
      seed.story.title,
      seed.story.summary,
      seed.story.bodyMd,
      seed.story.sourceNotes,
    ],
  );

  for (const sourceItemId of presentSources) {
    await execute(
      db,
      `INSERT INTO citations
        (id, target_type, target_id, source_item_id, note)
       VALUES (?, 'story', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        source_item_id = excluded.source_item_id,
        note = excluded.note`,
      [
        `cite-${seed.story.id}-${sourceItemId}`.slice(0, 160),
        seed.story.id,
        sourceItemId,
        "Brand story draft uses this source as a summary/link-only anchor.",
      ],
    );
  }

  for (const claimId of presentClaims) {
    await execute(
      db,
      `INSERT INTO citations
        (id, target_type, target_id, claim_id, note)
       VALUES (?, 'story', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        claim_id = excluded.claim_id,
        note = excluded.note`,
      [
        `cite-${seed.story.id}-${claimId}`.slice(0, 160),
        seed.story.id,
        claimId,
        "Brand story draft cites this structured claim.",
      ],
    );
  }
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  if (WRITE) await runMigrations(db);

  const rows = BRAND_STORIES.slice(0, LIMIT);
  console.log(
    WRITE
      ? "Official brand story import: write mode"
      : "Official brand story import: dry run",
  );

  for (const seed of rows) {
    const local = await findLocalEntity(db, seed.slug);
    if (!local) {
      console.warn(`Skip ${seed.slug}: local brand entity not found`);
      continue;
    }
    console.log(`${local.name} -> ${seed.story.title}`);
    if (WRITE) await writeBrandStory(db, local, seed);
  }

  if (!WRITE) {
    console.log("Dry run only. Re-run with --write to store brand stories.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
