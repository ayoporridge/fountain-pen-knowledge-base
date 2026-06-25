import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs } from "@libsql/client";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
const WRITE = process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));

type SourceRegistrySeed = {
  id: string;
  name: string;
  sourceType?: "official" | "wikimedia" | "book" | "patent" | "blog" | "forum" | "reddit" | "retailer" | "user_submission";
  reliability?: "high_for_basic_facts" | "high_for_model_history" | "official_marketing" | "community_opinion" | "bibliographic" | "technical_primary" | "medium" | "unknown";
  attribution: string;
  homepageUrl: string;
  notes: string;
};

type ModelSeed = {
  slug: string;
  brandSlug: string;
  referenceRelationType?: "reference" | "review" | "history" | "repair" | "official" | "community";
  source: SourceRegistrySeed;
  sourceItem: {
    id: string;
    title: string;
    url: string;
    itemType: string;
    summary: string;
  };
  spec: {
    id: string;
    seriesName: string;
    releaseYear: string;
    originCountry: string;
    nib: string;
    fillSystem: string;
    material: string;
    dimensions: string;
    weight: string;
    priceRange: string;
    status: string;
    reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
  };
  story: {
    id: string;
    title: string;
    summary: string;
    bodyMd: string;
    sourceNotes: string;
  };
  claims: Array<{
    id: string;
    predicate: string;
    text: string;
    evidenceLocator?: string;
    confidence: number;
    reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
  }>;
  variants: Array<{
    id: string;
    name: string;
    releaseYear?: string | null;
    notes: string;
    reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
  }>;
  timeline?: {
    id: string;
    title: string;
    eventType: "model_released" | "design_milestone";
    startDate: string;
    circa?: boolean;
    description: string;
    reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
  };
};

const MODEL_SEEDS: ModelSeed[] = [
  {
    slug: "sailor-pro-gear",
    brandSlug: "sailor",
    source: {
      id: "sailor-official",
      name: "Sailor official site",
      attribution: "The Sailor Pen Co., Ltd.",
      homepageUrl: "https://en.sailor.co.jp/",
      notes:
        "Use for official company history and product-line facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-sailor-pro-gear-official",
      title: "Sailor: Professional Gear Series",
      url: "https://en.sailor.co.jp/topics/professional-gear-series/",
      itemType: "official_product",
      summary:
        "Official Sailor Professional Gear series page used for nib range, converter/cartridge filling context, and flat-top design cues.",
    },
    spec: {
      id: "spec-sailor-pro-gear",
      seriesName: "Professional Gear",
      releaseYear: "待核验",
      originCountry: "日本",
      nib: "21K 或 14K 金尖，随尺寸和版本变化",
      fillSystem: "上墨器/墨囊",
      material: "PMMA 树脂等，随版本变化",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中高端",
      status: "在产/版本供应需核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-sailor-pro-gear-library",
      title: "把平顶外形和写乐笔尖反馈放在一起看",
      summary:
        "Pro Gear 的型号档案先围绕平顶外形、21K/14K 笔尖和上墨器/墨囊系统组织，后续再拆 Slim、Standard、King 等尺寸线。",
      bodyMd:
        "Sailor Pro Gear 适合放在“品牌馆”和“型号档案”的交界处阅读：它不像 1911/Profit 那样走经典雪茄外形，而是用平顶笔帽、顶部 anchor 标识和写乐笔尖反馈建立辨识度。\n\n官方 Professional Gear 系列页面提供了几个可以先落地的结构点：这个系列有 21K 或 14K 金尖版本，也使用上墨器/墨囊系统。后续扩写时，应继续把 Slim、Standard、King of Pen、Demonstrator 等尺寸和版本拆开，并用官方产品页或目录逐项核验尺寸、重量、笔尖选择和地区供应。",
      sourceNotes:
        "Draft based on Sailor official Professional Gear series page and existing brand/Wikidata sources. Size variants need product-specific sources.",
    },
    claims: [
      {
        id: "claim-sailor-pro-gear-official-series",
        predicate: "official_series",
        text:
          "Sailor official material presents Professional Gear as a fountain-pen series with a cut-away cap and anchor-logo design cue.",
        evidenceLocator: "Professional Gear Series",
        confidence: 0.78,
        reviewStatus: "pending",
      },
      {
        id: "claim-sailor-pro-gear-nib-range",
        predicate: "material",
        text:
          "The official Professional Gear page describes 21K or 14K gold nib options, depending on model and version.",
        evidenceLocator: "Professional Gear / 21K or 14K gold nibs",
        confidence: 0.82,
        reviewStatus: "pending",
      },
      {
        id: "claim-sailor-pro-gear-fill-system",
        predicate: "fill_system",
        text:
          "The official Professional Gear page describes converter and cartridge filling for listed models.",
        evidenceLocator: "Filling system",
        confidence: 0.8,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-sailor-pro-gear-standard",
        name: "Professional Gear Standard / 常规尺寸",
        notes: "站内先作为主线型号；具体尺寸、颜色和地区供应待产品页核验。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-sailor-pro-gear-slim",
        name: "Professional Gear Slim",
        notes: "较小尺寸线，需补官方尺寸和笔尖规格来源。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-sailor-pro-gear-king",
        name: "King Professional Gear",
        notes: "官方系列页列出的更大尺寸线；需继续拆出独立型号档案。",
        reviewStatus: "pending",
      },
    ],
  },
  {
    slug: "白金-platinum-3776-century",
    brandSlug: "platinum",
    source: {
      id: "platinum-official",
      name: "Platinum official site",
      attribution: "Platinum Pen Co., Ltd.",
      homepageUrl: "https://www.platinum-pen.co.jp/en/",
      notes:
        "Use for official company background and product facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-platinum-3776-century-official",
      title: "Platinum Pen USA: #3776 Century Collection",
      url: "https://platinumpenusa.com/luxury-writing/3776-collection/",
      itemType: "official_product",
      summary:
        "Official Platinum Pen USA #3776 Century collection page used for nib material, basic dimensions, cartridge/converter support, and collection context.",
    },
    spec: {
      id: "spec-platinum-3776-century",
      seriesName: "#3776 Century",
      releaseYear: "待核验",
      originCountry: "日本",
      nib: "14K 金尖，常见 UEF 到 BB 等规格",
      fillSystem: "上墨器/墨囊",
      material: "树脂笔身，部分版本材质不同",
      dimensions: "约 139.5 mm 全长，最大直径约 14.5 mm（需按版本核验）",
      weight: "约 18.8 g（需按版本核验）",
      priceRange: "中高端",
      status: "在产/版本供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-platinum-3776-century-library",
      title: "把 #3776 Century 当作白金现代主线来读",
      summary:
        "#3776 Century 的档案先围绕 14K 金尖、Slip & Seal 语境、透明/经典配色和上墨器/墨囊系统组织。",
      bodyMd:
        "白金 #3776 Century 适合作为“日系三金入门到中高端”的一条主线来读。它的重点不只是价格，而是白金如何把相对克制的外形、14K 金尖和密封笔帽语境组合成长期日用型号。\n\n官方 #3776 Century collection 页面能先支撑几类基础字段：14K 金尖、上墨器/墨囊支持、部分版本的尺寸和重量。后续扩写时，应继续拆 Chartres Blue、Bourgogne、Chenonceau White、celluloid、木杆和莳绘/出云相关支线，避免把整个 #3776 家族写成一个单一型号。",
      sourceNotes:
        "Draft based on official Platinum Pen USA #3776 Century collection page. Version-specific materials and release years need follow-up sources.",
    },
    claims: [
      {
        id: "claim-platinum-3776-century-nib",
        predicate: "material",
        text:
          "Official Platinum Pen USA material lists #3776 Century nibs as 14K gold for the referenced collection.",
        evidenceLocator: "#3776 CENTURY / Pen nib",
        confidence: 0.84,
        reviewStatus: "pending",
      },
      {
        id: "claim-platinum-3776-century-fill",
        predicate: "fill_system",
        text:
          "Official Platinum Pen USA material lists cartridge ink and converter accessories for #3776 Century models.",
        evidenceLocator: "#3776 CENTURY / Refill and Accessories",
        confidence: 0.8,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-platinum-3776-chartres-blue",
        name: "Chartres Blue",
        notes: "常见透明蓝配色；颜色、笔尖和地区供应需继续按产品页核验。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-platinum-3776-bourgogne",
        name: "Bourgogne",
        notes: "常见酒红透明配色；需要补版本来源和细节规格。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-platinum-3776-chenonceau-white",
        name: "Chenonceau White",
        notes: "官方 collection 页面列出的白色版本之一；需核验地区供应。",
        reviewStatus: "pending",
      },
    ],
  },
  {
    slug: "kaweco-sport",
    brandSlug: "kaweco",
    source: {
      id: "kaweco-official",
      name: "Kaweco official site",
      attribution: "Kaweco",
      homepageUrl: "https://www.kaweco-pen.com/en/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-kaweco-classic-sport-official",
      title: "Kaweco: Classic Sport",
      url: "https://www.kaweco-pen.com/en/Series/CLASSIC-SPORT/",
      itemType: "official_product",
      summary:
        "Official Kaweco Classic Sport series page used for pocket-pen positioning, 1911 Sport origin context, and compact capped length.",
    },
    spec: {
      id: "spec-kaweco-sport",
      seriesName: "Classic Sport",
      releaseYear: "1911 语境，现代版本待核验",
      originCountry: "德国",
      nib: "钢尖，常见 EF/F/M/B/BB 等规格需按版本核验",
      fillSystem: "墨囊，短上墨器兼容性需按版本核验",
      material: "塑料/树脂，其他 Sport 支线材质另列",
      dimensions: "闭合约 10.5 cm，插帽后接近标准长度",
      weight: "轻量级，具体重量待核验",
      priceRange: "入门到中端",
      status: "在产",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-kaweco-sport-library",
      title: "口袋笔为什么能成为一个系列",
      summary:
        "Kaweco Sport 的档案先围绕 pocket-sized、10.5 cm 闭合长度和 Sport 系列分支组织。",
      bodyMd:
        "Kaweco Sport 的核心不是参数堆叠，而是一个非常明确的使用场景：**口袋笔**。官方 Classic Sport 页面把 Sport 的源流放回 1911，并强调闭合时约 10.5 cm、插帽后接近标准长度的形态，这正好解释了它为什么适合做成一条独立阅读路径。\n\n后续扩写时，Sport 不应该只写 Classic Sport。AL Sport、Brass Sport、Steel Sport、Frosted Sport、Skyline Sport 等支线需要分别补材质、重量和触感差异；当前档案先把 Classic Sport 的基本结构立起来。",
      sourceNotes:
        "Draft based on official Kaweco Classic Sport page. Nib options, converter compatibility, and branch-specific weights need version-level sources.",
    },
    claims: [
      {
        id: "claim-kaweco-sport-pocket-size",
        predicate: "official_series",
        text:
          "Kaweco official Classic Sport material describes the Sport as a pocket-sized fountain pen that measures about 10.5 cm when closed.",
        evidenceLocator: "Classic Sport / pocket-sized",
        confidence: 0.84,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-kaweco-classic-sport",
        name: "Classic Sport",
        notes: "塑料/树脂主线版本；当前档案以此作为 Sport 系列入口。",
        reviewStatus: "pending",
      },
      {
        id: "variant-kaweco-al-sport",
        name: "AL Sport",
        notes: "铝合金支线，已有独立站内词条，后续应迁移到单独型号档案。",
        reviewStatus: "needs_source",
      },
    ],
    timeline: {
      id: "timeline-kaweco-sport-1911-context",
      title: "Kaweco Sport pocket-pen origin context",
      eventType: "design_milestone",
      startDate: "1911",
      circa: 1,
      description:
        "Official Kaweco material places the Sport idea in a 1911 pocket-pen context; modern version chronology still needs catalog verification.",
      reviewStatus: "pending",
    },
  },
  {
    slug: "kaweco-al-sport",
    brandSlug: "kaweco",
    source: {
      id: "kaweco-official",
      name: "Kaweco official site",
      attribution: "Kaweco",
      homepageUrl: "https://www.kaweco-pen.com/en/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-kaweco-al-sport-official",
      title: "Kaweco: AL Sport",
      url: "https://www.kaweco-pen.com/en/Series/AL-SPORT/",
      itemType: "official_product",
      summary:
        "Official Kaweco AL Sport series page used for aluminium material, CNC production context, Sport-family positioning, and finish notes.",
    },
    spec: {
      id: "spec-kaweco-al-sport",
      seriesName: "AL Sport",
      releaseYear: "现代铝合金支线年份待核验",
      originCountry: "德国",
      nib: "钢尖，常见 EF/F/M/B/BB 等规格需按版本核验",
      fillSystem: "墨囊，短上墨器兼容性需按版本核验",
      material: "铝合金笔身，CNC 加工与表面处理语境",
      dimensions: "Sport 家族口袋笔比例，具体尺寸待型号页核验",
      weight: "比 Classic Sport 更有金属重量感，具体重量待核验",
      priceRange: "中端",
      status: "在产/颜色供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-kaweco-al-sport-library",
      title: "把 Sport 的口袋比例换成金属触感",
      summary:
        "AL Sport 的档案把 Sport 家族的短小比例、铝合金材料和 CNC 加工语境放在一起读。",
      bodyMd:
        "Kaweco AL Sport 可以看作 Sport 家族从轻量塑料走向金属日用笔的一条支线。它仍然保留 Sport 的口袋笔比例，但官方系列页把重点放在铝材、CNC 加工和表面处理上，因此读它时要把“携带性”和“触感重量”分开看。\n\n后续扩写时，AL Sport 应继续拆出 Raw、Stonewashed、Deep Red、限定色等版本；当前档案先建立材料和系列语境，不直接套用 Classic Sport 的重量、价格或颜色资料。",
      sourceNotes:
        "Draft based on the official Kaweco AL Sport series page. Version-specific dimensions, weights, colors, and converter compatibility need product-level sources.",
    },
    claims: [
      {
        id: "claim-kaweco-al-sport-material",
        predicate: "material",
        text:
          "Kaweco official AL Sport material frames the series around aluminium construction and CNC machining/finish context.",
        evidenceLocator: "AL Sport / aluminium / CNC",
        confidence: 0.8,
        reviewStatus: "pending",
      },
      {
        id: "claim-kaweco-al-sport-family",
        predicate: "official_series",
        text:
          "Kaweco presents AL Sport as a Sport-family series rather than as a standalone non-Sport model.",
        evidenceLocator: "AL Sport series page",
        confidence: 0.78,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-kaweco-al-sport-raw",
        name: "AL Sport Raw / Silver",
        notes: "铝合金本色语境；具体命名和地区供应需按官方商品页核验。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-kaweco-al-sport-stonewashed",
        name: "AL Sport Stonewashed",
        notes: "做旧表面处理支线；需补单品页验证颜色、重量与价格。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "kaweco-liliput",
    brandSlug: "kaweco",
    source: {
      id: "kaweco-official",
      name: "Kaweco official site",
      attribution: "Kaweco",
      homepageUrl: "https://www.kaweco-pen.com/en/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-kaweco-liliput-official",
      title: "Kaweco: LILIPUT",
      url: "https://www.kaweco-pen.com/en/Series/LILIPUT/",
      itemType: "official_product",
      summary:
        "Official Kaweco LILIPUT series page used for 1908 origin context, minimal three-part construction, and material-family overview.",
    },
    spec: {
      id: "spec-kaweco-liliput",
      seriesName: "LILIPUT",
      releaseYear: "1908 语境，现代版本待核验",
      originCountry: "德国",
      nib: "钢尖，常见 EF/F/M/B/BB 等规格需按版本核验",
      fillSystem: "墨囊；极小笔身的上墨器兼容性需按版本核验",
      material: "铝、铜、黄铜、不锈钢等版本；早期语境提到 ebonite",
      dimensions: "超短口袋笔比例，具体尺寸待核验",
      weight: "随金属材料显著变化，具体重量待核验",
      priceRange: "中端",
      status: "在产/材质版本供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-kaweco-liliput-library",
      title: "极小笔身里的 Kaweco 老型号语境",
      summary:
        "LILIPUT 的档案先围绕 1908 语境、三段式极简结构和多金属材质组织。",
      bodyMd:
        "Kaweco LILIPUT 是图书馆里很适合做“结构观察”的型号：它不是靠装饰建立记忆点，而是靠极短笔身、旋盖结构和材料版本形成差异。官方 LILIPUT 系列页把这个名字放回 1908 的历史语境，并提到早期 ebonite 版本；现代档案则应区分铝、铜、黄铜、不锈钢等不同材质的重量和触感。\n\n后续扩写时，可以把 LILIPUT 和 Sport 放在同一个“口袋笔”展览里比较：Sport 更像插帽后变成正常长度的日用笔，LILIPUT 则更接近极简随身工具。",
      sourceNotes:
        "Draft based on the official Kaweco LILIPUT series page. Material-specific dimensions, weights, and current availability need product-level sources.",
    },
    claims: [
      {
        id: "claim-kaweco-liliput-1908-context",
        predicate: "design_milestone",
        text:
          "Kaweco official LILIPUT material places the model name in a 1908 historical context.",
        evidenceLocator: "LILIPUT / 1908",
        confidence: 0.82,
        reviewStatus: "pending",
      },
      {
        id: "claim-kaweco-liliput-material-range",
        predicate: "material",
        text:
          "Kaweco official LILIPUT material describes modern material variants including aluminium, brass, copper, and stainless steel.",
        evidenceLocator: "LILIPUT / materials",
        confidence: 0.8,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-kaweco-liliput-aluminium",
        name: "LILIPUT Aluminium",
        notes: "轻量金属版本；需补单品页验证尺寸、重量和颜色。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-kaweco-liliput-brass",
        name: "LILIPUT Brass",
        notes: "黄铜版本；氧化与重量信息需要产品页或官方资料核验。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-kaweco-liliput-copper",
        name: "LILIPUT Copper",
        notes: "铜版本；具体供应和重量需逐页核验。",
        reviewStatus: "needs_source",
      },
    ],
    timeline: {
      id: "timeline-kaweco-liliput-1908-context",
      title: "Kaweco LILIPUT historical naming context",
      eventType: "design_milestone",
      startDate: "1908",
      circa: 1,
      description:
        "Official Kaweco material links LILIPUT to a 1908 historical context; modern production chronology still needs catalog verification.",
      reviewStatus: "pending",
    },
  },
  {
    slug: "kaweco-student",
    brandSlug: "kaweco",
    source: {
      id: "kaweco-official",
      name: "Kaweco official site",
      attribution: "Kaweco",
      homepageUrl: "https://www.kaweco-pen.com/en/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-kaweco-student-official",
      title: "Kaweco: STUDENT",
      url: "https://www.kaweco-pen.com/en/Series/STUDENT/",
      itemType: "official_product",
      summary:
        "Official Kaweco STUDENT series page used for education/history positioning, acrylic material context, and vintage-shaped design cues.",
    },
    spec: {
      id: "spec-kaweco-student",
      seriesName: "STUDENT",
      releaseYear: "现代版本待核验；官方叙事连接 1883 学生用品语境",
      originCountry: "德国",
      nib: "钢尖，常见 EF/F/M/B/BB 等规格需按版本核验",
      fillSystem: "墨囊/上墨器兼容性需按版本核验",
      material: "亚克力/树脂语境，具体版本待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中端",
      status: "在产/颜色供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-kaweco-student-library",
      title: "从学生用品叙事读 Kaweco 的复古日用笔",
      summary:
        "STUDENT 的档案先把教育用品历史语境、复古造型和现代亚克力版本分开组织。",
      bodyMd:
        "Kaweco STUDENT 不应该只被归类成“普通树脂笔”。官方系列页把它放进学生用品和 Heidelberg 大学周边的品牌叙事里，这让它更像一支带有复古校园语境的现代日用笔。\n\n当前档案先保留两个层次：第一层是官方叙事中 1883 以来的学生用品语境，第二层是现代 STUDENT 系列的亚克力/树脂笔身和颜色版本。后续扩写时，需要把 20s Jazz、30s Blues、50s Rock 等主题版本单独拆开，避免只用一个故事覆盖所有颜色线。",
      sourceNotes:
        "Draft based on the official Kaweco STUDENT series page. Current version dimensions, weights, nib options, and theme names need product-level checks.",
    },
    claims: [
      {
        id: "claim-kaweco-student-education-context",
        predicate: "design_milestone",
        text:
          "Kaweco official STUDENT material connects the series to the company's historical student-stationery context.",
        evidenceLocator: "STUDENT / students / 1883",
        confidence: 0.78,
        reviewStatus: "pending",
      },
      {
        id: "claim-kaweco-student-material",
        predicate: "material",
        text:
          "Kaweco official STUDENT material presents the modern series in an acrylic/resin product context.",
        evidenceLocator: "STUDENT / acrylic",
        confidence: 0.76,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-kaweco-student-20s-jazz",
        name: "20's Jazz",
        notes: "主题配色线之一；命名、供应和规格需按官方商品页核验。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-kaweco-student-50s-rock",
        name: "50's Rock",
        notes: "主题配色线之一；需继续补颜色、笔尖和地区供应来源。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "凌美-lamy-safari-狩猎者",
    brandSlug: "lamy",
    source: {
      id: "lamy-official",
      name: "LAMY official site",
      attribution: "LAMY",
      homepageUrl: "https://www.lamy.com/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-lamy-safari-official",
      title: "LAMY: safari fountain pen",
      url: "https://www.lamy.com/en-us/p/lamy-safari-fountain-pen",
      itemType: "official_product",
      summary:
        "Official LAMY safari fountain pen page used for 1980s design context, robust plastic body, ergonomic grip, steel nib, and cartridge/converter support.",
    },
    spec: {
      id: "spec-lamy-safari",
      seriesName: "safari",
      releaseYear: "1980s 语境，具体年份待核验",
      originCountry: "德国",
      nib: "抛光钢尖；规格随版本/地区供应变化",
      fillSystem: "T10 墨囊；Z28 上墨器兼容性需按官方版本核验",
      material: "坚固塑料/ASA 语境",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "入门到中端",
      status: "在产/颜色供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-lamy-safari-library",
      title: "设计课、校用笔和现代钢笔入口",
      summary:
        "LAMY safari 的档案先围绕 1980s 设计语境、ABS/ASA 塑料、三角握位和钢尖系统组织。",
      bodyMd:
        "LAMY safari 是图书馆里必须单独成档的“现代入口笔”：它的意义不只是便宜耐用，而是把清晰的工业设计语言、三角握位、可替换钢尖和高可见度颜色变成了一整代人的钢笔入口。\n\n官方 safari 页面能支撑几个基础层：1980s 以来的设计语境、坚固塑料笔身、人体工学握位、抛光钢尖，以及 T10 墨囊/Z28 上墨器相关配件。后续扩写应继续拆 AL-star、Vista、限定色年份和笔尖兼容表。",
      sourceNotes:
        "Draft based on official LAMY safari fountain pen product page. Exact release year, dimensions, weight, and annual color chronology need follow-up sources.",
    },
    claims: [
      {
        id: "claim-lamy-safari-1980s-context",
        predicate: "design_milestone",
        text:
          "LAMY official product material frames the safari fountain pen as a design from the 1980s context.",
        evidenceLocator: "LAMY safari / 1980s",
        confidence: 0.78,
        reviewStatus: "pending",
      },
      {
        id: "claim-lamy-safari-grip-and-nib",
        predicate: "design_feature",
        text:
          "LAMY official product material describes safari with an ergonomic grip area and polished steel nib.",
        evidenceLocator: "LAMY safari / grip / steel nib",
        confidence: 0.82,
        reviewStatus: "pending",
      },
      {
        id: "claim-lamy-safari-fill-system",
        predicate: "fill_system",
        text:
          "LAMY official product material lists T10 cartridge use and Z28 converter compatibility for the safari fountain pen context.",
        evidenceLocator: "LAMY safari / T10 / Z28",
        confidence: 0.8,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-lamy-safari-standard-colors",
        name: "Standard color line",
        notes: "常规色线；具体颜色与地区供应需按官方页面核验。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-lamy-safari-special-editions",
        name: "Special editions / annual colors",
        notes: "限定色和年度色需要按年份建立单独时间线。",
        reviewStatus: "needs_source",
      },
    ],
    timeline: {
      id: "timeline-lamy-safari-1980s-context",
      title: "LAMY safari 1980s design context",
      eventType: "design_milestone",
      startDate: "1980",
      circa: 1,
      description:
        "Official LAMY material places safari in a 1980s design context; exact model launch chronology should be verified with catalog or brand-history sources.",
      reviewStatus: "pending",
    },
  },
  {
    slug: "三文堂-twsbi-eco",
    brandSlug: "twsbi",
    source: {
      id: "twsbi-official",
      name: "TWSBI official site",
      attribution: "TWSBI",
      homepageUrl: "https://www.twsbi.com/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-twsbi-eco-official",
      title: "TWSBI: ECO Black Fountain Pen",
      url: "https://www.twsbi.com/products/twsbi-eco-black-fountain-pen",
      itemType: "official_product",
      summary:
        "Official TWSBI ECO product page used for piston-filling context, nib options, entry-level positioning, and demonstrator body cues.",
    },
    spec: {
      id: "spec-twsbi-eco",
      seriesName: "ECO",
      releaseYear: "待核验",
      originCountry: "台湾",
      nib: "钢尖，官方商品页常列 EF/F/M/B/Stub 1.1 等规格",
      fillSystem: "活塞上墨",
      material: "透明/彩色塑料笔身语境，具体版本待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "入门到中端",
      status: "在产/颜色供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-twsbi-eco-library",
      title: "把活塞上墨带进入门透明示范笔",
      summary:
        "TWSBI ECO 的档案先围绕活塞上墨、透明笔身、钢尖规格和入门定位组织。",
      bodyMd:
        "TWSBI ECO 是很适合作为“现代透明示范笔”入口的型号：它把活塞上墨、可见墨量和相对亲民的价格放在一起，让新用户不需要先进入老式活塞笔或高端德系笔的语境。\n\n官方 ECO 商品页能先支撑活塞上墨、钢尖规格和颜色版本这些基础字段。后续扩写时，应把 ECO、ECO-T、Diamond 580、VAC700R 分别拆开，并比较它们的上墨机构、握位、笔帽结构和维护方式。",
      sourceNotes:
        "Draft based on official TWSBI ECO Black product page. Release year, material wording, dimensions, and color chronology need follow-up sources.",
    },
    claims: [
      {
        id: "claim-twsbi-eco-piston-filler",
        predicate: "fill_system",
        text:
          "TWSBI official ECO product material identifies the model as a piston-filling fountain pen.",
        evidenceLocator: "ECO product page / piston filler",
        confidence: 0.82,
        reviewStatus: "pending",
      },
      {
        id: "claim-twsbi-eco-nib-options",
        predicate: "nib",
        text:
          "TWSBI official ECO product material lists steel nib options such as EF, F, M, B, and Stub 1.1 for the referenced product.",
        evidenceLocator: "ECO product page / nib options",
        confidence: 0.8,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-twsbi-eco-black",
        name: "ECO Black",
        notes: "官方商品页锚点版本；颜色和地区供应需继续按产品页核验。",
        reviewStatus: "pending",
      },
      {
        id: "variant-twsbi-eco-clear",
        name: "ECO Clear",
        notes: "透明版本；需补对应官方商品页或 collection 来源。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-twsbi-eco-t",
        name: "ECO-T",
        notes: "握位不同的相关支线；应建立独立档案或作为变体进一步核验。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "三文堂-twsbi-580-580al",
    brandSlug: "twsbi",
    source: {
      id: "twsbi-official",
      name: "TWSBI official site",
      attribution: "TWSBI",
      homepageUrl: "https://www.twsbi.com/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-twsbi-diamond-580-official",
      title: "TWSBI: Diamond 580 Clear Fountain Pen",
      url: "https://www.twsbi.com/products/twsbi-diamond-580-clear-fountain-pen",
      itemType: "official_product",
      summary:
        "Official TWSBI Diamond 580 product page used for piston-filling context, detachable-parts language, and modern industrial design positioning.",
    },
    spec: {
      id: "spec-twsbi-diamond-580",
      seriesName: "Diamond 580 / 580AL",
      releaseYear: "530/540/580 演进语境，具体年份待核验",
      originCountry: "台湾",
      nib: "钢尖，官方商品页常列 EF/F/M/B/Stub 1.1 等规格",
      fillSystem: "活塞上墨",
      material: "透明笔身；580AL/580ALR 金属部件版本需另页核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中端",
      status: "在产/版本供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-twsbi-diamond-580-library",
      title: "把可拆维护和活塞示范笔放在一起读",
      summary:
        "Diamond 580 的档案先围绕活塞上墨、透明笔身、可拆结构和 580AL/580ALR 支线组织。",
      bodyMd:
        "TWSBI Diamond 580 比 ECO 更适合放进“维护与结构”阅读路径：官方页面强调它是带活塞上墨系统的经典钢笔，并把现代工业设计、可拆部件和可重新组装的维护语境放在同一段叙事里。\n\n当前档案先用 Diamond 580 Clear 官方页作为锚点。580、580AL、580ALR 应继续拆开：Clear 侧重透明示范和维护，AL/ALR 则需要补铝制握位、连接件、活塞杆和表面纹理等单品页证据。",
      sourceNotes:
        "Draft based on official TWSBI Diamond 580 Clear product page. 580AL/580ALR materials and release chronology need product-specific sources.",
    },
    claims: [
      {
        id: "claim-twsbi-diamond-580-piston-system",
        predicate: "fill_system",
        text:
          "TWSBI official Diamond 580 material describes the model as a fountain pen with a piston ink-filling system.",
        evidenceLocator: "Diamond 580 / piston ink-filling system",
        confidence: 0.84,
        reviewStatus: "pending",
      },
      {
        id: "claim-twsbi-diamond-580-detachable",
        predicate: "design_feature",
        text:
          "TWSBI official Diamond 580 material describes detachable parts and user disassembly/reassembly as part of the product context.",
        evidenceLocator: "Diamond 580 / detachable parts",
        confidence: 0.8,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-twsbi-diamond-580-clear",
        name: "Diamond 580 Clear",
        notes: "当前官方来源锚点版本；尺寸、重量和地区供应需继续核验。",
        reviewStatus: "pending",
      },
      {
        id: "variant-twsbi-diamond-580al",
        name: "Diamond 580AL / 580ALR",
        notes: "铝制部件支线；需补 580AL/580ALR 单品页验证材质与版本差异。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "三文堂-twsbi-vac700r",
    brandSlug: "twsbi",
    source: {
      id: "twsbi-official",
      name: "TWSBI official site",
      attribution: "TWSBI",
      homepageUrl: "https://www.twsbi.com/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-twsbi-vac700r-official",
      title: "TWSBI: Vac700R Iris Fountain Pen",
      url: "https://www.twsbi.com/products/twsbi-vac700r-iris-fountain-pen",
      itemType: "official_product",
      summary:
        "Official TWSBI Vac700R product page used for vacuum-filler context, shut-off valve wording, ink-flow note, and nib-size range.",
    },
    spec: {
      id: "spec-twsbi-vac700r",
      seriesName: "VAC700R",
      releaseYear: "待核验",
      originCountry: "台湾",
      nib: "钢尖，官方商品页常列 EF/F/M/B/Stub 1.1/Stub 1.5 等规格",
      fillSystem: "真空上墨，带 ink shut off valve 语境",
      material: "透明/阳极氧化或限定色版本需按单品页核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中端",
      status: "在产/颜色供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-twsbi-vac700r-library",
      title: "从活塞示范笔走向真空上墨的大容量路线",
      summary:
        "VAC700R 的档案先围绕真空上墨、锁墨阀、墨流语境和 TWSBI 透明结构路线组织。",
      bodyMd:
        "TWSBI VAC700R 是透明示范笔路线里的另一个入口：如果 Diamond 580 和 ECO 代表活塞上墨，那么 VAC700R 更适合放在真空上墨和大容量旅行笔的路径下阅读。\n\n官方 VAC700R Iris 页面明确使用 vacuum filler type fountain pen 的语境，并提到打开阀门后的墨流一致性与 ink shut off valve。当前档案先以 Iris 页面作为锚点，后续应继续补 Clear、Kyanite、Vac Mini 等相关页面，把尺寸、重量、颜色和旅行携带场景分开核验。",
      sourceNotes:
        "Draft based on official TWSBI Vac700R Iris product page. Color variants, dimensions, and release chronology need follow-up sources.",
    },
    claims: [
      {
        id: "claim-twsbi-vac700r-vacuum-filler",
        predicate: "fill_system",
        text:
          "TWSBI official Vac700R material identifies the referenced model as a vacuum-filler type fountain pen.",
        evidenceLocator: "Vac700R / Vacuum filler type fountain pen",
        confidence: 0.84,
        reviewStatus: "pending",
      },
      {
        id: "claim-twsbi-vac700r-shutoff-valve",
        predicate: "design_feature",
        text:
          "TWSBI official Vac700R material describes an ink shut-off valve for carry and spill-control context.",
        evidenceLocator: "Vac700R / ink shut off valve",
        confidence: 0.82,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-twsbi-vac700r-iris",
        name: "VAC700R Iris",
        notes: "当前官方来源锚点版本；颜色工艺和供应需继续核验。",
        reviewStatus: "pending",
      },
      {
        id: "variant-twsbi-vac700r-kyanite",
        name: "VAC700R Kyanite",
        notes: "官方 sitemap 与商品页可见的另一个颜色版本；应补独立来源卡或变体细节。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "wancher万佳-dream-pen",
    brandSlug: "wancher",
    source: {
      id: "wancher-official",
      name: "Wancher official site",
      attribution: "Wancher",
      homepageUrl: "https://www.wancherpen.com/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-wancher-dream-pen-official",
      title: "Wancher: Dream Pen Collection",
      url: "https://www.wancherpen.com/collections/dream-pen",
      itemType: "official_collection",
      summary:
        "Official Wancher Dream Pen collection page used for ebonite, urushi, maki-e, and handmade/traditional-craft positioning.",
    },
    spec: {
      id: "spec-wancher-dream-pen",
      seriesName: "Dream Pen",
      releaseYear: "待核验",
      originCountry: "日本工艺语境/品牌与制造细节待核验",
      nib: "随版本变化，钢尖、18K 或品牌自有笔尖配置需逐单品核验",
      fillSystem: "待核验；部分商品页语境需逐项确认",
      material: "日本 ebonite、Urushi、Maki-e 等版本语境",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中高端到高端",
      status: "在产/版本供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-wancher-dream-pen-library",
      title: "把材质实验和日本传统工艺放进同一条型号线",
      summary:
        "Dream Pen 的档案先围绕 ebonite、Urushi、Maki-e 和手工艺语境组织，避免把所有版本写成单一规格。",
      bodyMd:
        "Wancher Dream Pen 适合在图书馆里作为“现代材质与传统工艺结合”的入口阅读。官方 collection 页面把 Dream Pen 放在 ebonite、Urushi、Maki-e 和传统工匠手作的语境中，同时又出现钛、ABS、铝等不同材料支线。\n\n这意味着 Dream Pen 不能只写成一个统一规格型号。当前档案先登记 collection 级来源，用来支撑系列定位；后续应把 True Ebonite、Urushi、Maki-e、Primo 等单品逐项拆开，分别核验笔尖、上墨、尺寸、重量和工艺出处。",
      sourceNotes:
        "Draft based on official Wancher Dream Pen collection page. Version-specific specs and manufacturing details need product-level sources.",
    },
    claims: [
      {
        id: "claim-wancher-dream-pen-ebonite-material",
        predicate: "material",
        text:
          "Wancher official Dream Pen material describes Japanese ebonite as a base material in the collection context.",
        evidenceLocator: "Dream Pen / Finest Material / Ebonite",
        confidence: 0.78,
        reviewStatus: "pending",
      },
      {
        id: "claim-wancher-dream-pen-craft-context",
        predicate: "design_feature",
        text:
          "Wancher official Dream Pen material frames the collection around traditional craftsmen and Japanese craft finishes such as urushi and maki-e.",
        evidenceLocator: "Dream Pen / True Craftsmanship / Urushi / Maki-e",
        confidence: 0.76,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-wancher-dream-pen-true-ebonite",
        name: "Dream Pen True Ebonite",
        notes: "需要补单品页核验笔尖、上墨、尺寸和重量。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-wancher-dream-pen-urushi",
        name: "Dream Pen Urushi / Maki-e",
        notes: "漆艺和莳绘支线；需逐款核验工艺、作者/工坊和材料。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "并木-namiki-emperor",
    brandSlug: "namiki",
    source: {
      id: "namiki-official",
      name: "Namiki official site",
      attribution: "Namiki / Pilot Corporation",
      homepageUrl: "https://www.pilot-namiki.com/en/",
      notes:
        "Use for official Namiki collection and maki-e positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-namiki-emperor-official",
      title: "Namiki: Emperor Collection",
      url: "https://www.pilot-namiki.com/en/collection/emperor/",
      itemType: "official_collection",
      summary:
        "Official Namiki Emperor collection page used for highest-ranking series context, No.50 jumbo nib wording, ink-stopping function, ebonite body, and Togidashi-Taka Maki-e technique.",
    },
    spec: {
      id: "spec-namiki-emperor",
      seriesName: "Emperor",
      releaseYear: "历史语境待核验",
      originCountry: "日本",
      nib: "No.50 (Jumbo) pen nib 语境，具体材质与规格待核验",
      fillSystem: "带 ink stopping function；具体上墨方式待核验",
      material: "Ebonite 笔身与 Togidashi-Taka Maki-e 语境",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "高端/收藏级",
      status: "在产/作品供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-namiki-emperor-library",
      title: "把 Emperor 当作 Namiki 顶级莳绘入口来读",
      summary:
        "Emperor 的档案先围绕最高等级系列、No.50 大型笔尖、止墨功能、ebonite 和 Togidashi-Taka Maki-e 组织。",
      bodyMd:
        "Namiki Emperor 不适合只按“超大钢笔”来读。官方 collection 页面把它放在 Namiki 的最高等级系列里，并同时强调 No.50 大型笔尖、止墨功能、ebonite 笔身和 Togidashi-Taka Maki-e 技法。\n\n当前档案先建立 collection 级入口：Emperor 是一组工艺与尺寸共同定义的系列。后续扩写时，应继续拆 clip/no clip、具体图案、限定款、笔尖材质、上墨结构和艺师/工艺说明，不用一个页面概括所有作品。",
      sourceNotes:
        "Draft based on official Namiki Emperor collection page. Nib material, filling details, dimensions, and individual artworks need follow-up sources.",
    },
    claims: [
      {
        id: "claim-namiki-emperor-highest-ranking",
        predicate: "official_series",
        text:
          "Namiki official material describes Emperor as the brand's highest-ranking collection.",
        evidenceLocator: "Emperor Collection / highest ranking series",
        confidence: 0.84,
        reviewStatus: "pending",
      },
      {
        id: "claim-namiki-emperor-ebonite-makie",
        predicate: "material",
        text:
          "Namiki official material describes the Emperor body as shaped with ebonite and using Togidashi-Taka Maki-e.",
        evidenceLocator: "Emperor Collection / ebonite / Togidashi-Taka Maki-e",
        confidence: 0.82,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-namiki-emperor-clip",
        name: "Emperor with clip",
        notes: "官方页面提到带夹与无夹两类；具体作品需逐项核验。",
        reviewStatus: "pending",
      },
      {
        id: "variant-namiki-emperor-no-clip",
        name: "Emperor no-clip",
        notes: "无夹版本强调完整笔身图案；需补具体作品来源。",
        reviewStatus: "pending",
      },
    ],
  },
  {
    slug: "并木-namiki-yukari-royale皇家缘",
    brandSlug: "namiki",
    source: {
      id: "namiki-official",
      name: "Namiki official site",
      attribution: "Namiki / Pilot Corporation",
      homepageUrl: "https://www.pilot-namiki.com/en/",
      notes:
        "Use for official Namiki collection and maki-e positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-namiki-yukari-royale-official",
      title: "Namiki: Yukari Royale Collection",
      url: "https://www.pilot-namiki.com/en/collection/yukari-royale/",
      itemType: "official_collection",
      summary:
        "Official Namiki Yukari Royale collection page used for graceful motif positioning, name meaning, and Togidashi-Taka Maki-e context.",
    },
    spec: {
      id: "spec-namiki-yukari-royale",
      seriesName: "Yukari Royale",
      releaseYear: "待核验",
      originCountry: "日本",
      nib: "待核验",
      fillSystem: "待核验",
      material: "Urushi/Maki-e 系列语境，具体作品需核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "高端/收藏级",
      status: "在产/作品供应需核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-namiki-yukari-royale-library",
      title: "从“缘”的名字理解优雅题材的莳绘系列",
      summary:
        "Yukari Royale 的档案先围绕 graceful motifs、Yukari 名义和 Togidashi-Taka Maki-e 语境组织。",
      bodyMd:
        "Namiki Yukari Royale 适合和 Emperor 放在同一条 Namiki 工艺路径里比较。官方页面把它与 Emperor 的厚重设计相对照，强调更优雅的 motif，并解释 Yukari 来自日语中人与人之间连接和关系的含义。\n\n当前档案先记录这个系列的命名和工艺语境。后续应继续补具体作品、尺寸、笔尖、上墨方式、漆艺工序和图案题材，避免只用一段宏观介绍覆盖所有 Yukari Royale。",
      sourceNotes:
        "Draft based on official Namiki Yukari Royale collection page. Technical specs and individual artworks need follow-up sources.",
    },
    claims: [
      {
        id: "claim-namiki-yukari-royale-name",
        predicate: "official_series",
        text:
          "Namiki official material explains Yukari as a Japanese word connected with relationships between people.",
        evidenceLocator: "Yukari Royale Collection / name comes from",
        confidence: 0.82,
        reviewStatus: "pending",
      },
      {
        id: "claim-namiki-yukari-royale-makie",
        predicate: "design_feature",
        text:
          "Namiki official material frames Yukari Royale around graceful motifs and Togidashi-Taka Maki-e expression.",
        evidenceLocator: "Yukari Royale Collection / graceful motifs / Togidashi-Taka Maki-e",
        confidence: 0.8,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-namiki-yukari-royale-collection",
        name: "Yukari Royale Collection",
        notes: "collection 级入口；具体作品、图案和规格需单独建档。",
        reviewStatus: "pending",
      },
    ],
  },
  {
    slug: "万宝龙-montblanc-大班149-meisterst-ck",
    brandSlug: "montblanc",
    source: {
      id: "montblanc-official",
      name: "Montblanc official site",
      attribution: "Montblanc",
      homepageUrl: "https://www.montblanc.com/",
      notes:
        "Use for official product pages and brand positioning; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-montblanc-origin-149-official",
      title: "Montblanc: Meisterstück The Origin Collection 149 Fountain Pen",
      url: "https://www.montblanc.com/en-ro/meisterstuck-the-origin-collection-149-fountain-pen-MB131336.html",
      itemType: "official_product",
      summary:
        "Official Montblanc product page for a Meisterstück Origin Collection 149 fountain pen, used as a cautious source for the 149/Meisterstück official product context.",
    },
    spec: {
      id: "spec-montblanc-149",
      seriesName: "Meisterstück 149",
      releaseYear: "历史型号年份待核验",
      originCountry: "德国",
      nib: "金尖，具体材质和尺寸随版本变化",
      fillSystem: "活塞上墨（具体版本需核验）",
      material: "树脂/贵金属装饰，随版本变化",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "高端",
      status: "在产/纪念版本与常规版本需区分",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-montblanc-149-library",
      title: "149 作为 Meisterstück 符号的入口",
      summary:
        "Montblanc 149 的档案先把常规 149 与 The Origin Collection 149 分开处理，避免用纪念款资料覆盖所有历史版本。",
      bodyMd:
        "Montblanc 149 很容易被写成一句“旗舰大班”，但图书馆里需要更谨慎：149 是 Meisterstück 语境中的核心符号，具体年份、笔尖、笔杆、活塞机构和版本变化横跨很长时间，不能用一个当前商品页概括所有历史版本。\n\n这版档案先使用 Montblanc 官方 The Origin Collection 149 页面作为官方产品语境锚点，只确认它属于 149/Meisterstück 的官方叙事范围。后续需要继续补常规 149 产品页、历史目录、可靠收藏资料和维修资料，再拆出年代、笔尖、feed、活塞和树脂细节。",
      sourceNotes:
        "Draft based on official Montblanc Origin Collection 149 product page. Historical 149 claims intentionally remain needs_source.",
    },
    claims: [
      {
        id: "claim-montblanc-149-official-context",
        predicate: "official_series",
        text:
          "Montblanc official product material presents The Origin Collection 149 as part of the Meisterstück 149 fountain-pen context.",
        evidenceLocator: "Product title",
        confidence: 0.72,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-montblanc-149-origin-collection",
        name: "The Origin Collection 149",
        notes: "官方当前纪念/特别版本之一；不能直接代表所有历史 149 版本。",
        reviewStatus: "pending",
      },
    ],
  },
];

MODEL_SEEDS.push(
  {
    slug: "diplomat迪波曼-aero太空梭",
    brandSlug: "diplomat",
    source: {
      id: "diplomat-official",
      name: "Diplomat official site",
      attribution: "DIPLOMAT",
      homepageUrl: "https://www.diplomat-pen.com/",
      notes:
        "Use for official Diplomat history and current product facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-diplomat-aero-official",
      title: "DIPLOMAT: Aero Fountain Pen",
      url: "https://www.diplomat-pen.com/en/product/aero-fountain-pen/",
      itemType: "official_product",
      summary:
        "Official Aero product page used for Zeppelin-inspired design context, aluminium body, stainless-steel nib, converter/cartridge filling, and listed dimensions/weight.",
    },
    spec: {
      id: "spec-diplomat-aero",
      seriesName: "Aero",
      releaseYear: "待核验",
      originCountry: "德国",
      nib: "不锈钢明尖；14 ct 金尖版本需另页核验",
      fillSystem: "上墨器/墨囊",
      material: "铝制笔身",
      dimensions: "约 140 mm 闭合，约 160 mm 戴帽，直径约 15 mm",
      weight: "约 42 g",
      priceRange: "中高端",
      status: "在产/版本供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-diplomat-aero-library",
      title: "把 Zeppelin 流线和金属笔身放在一起读",
      summary:
        "Aero 的档案先围绕 Zeppelin 灵感、铝制笔身和上墨器/墨囊系统组织，再把钢尖、14K 金尖和不同表面处理拆开。",
      bodyMd:
        "Diplomat Aero 不是普通圆柱金属笔。它最适合从外形开始读：官方 Aero 页面把流线外观和 Zeppelin 遗产放在一起，这解释了它为什么会有连续沟槽、锥形笔帽和相对强的工业感。\n\n这版型号档案先只落地官网当前页能支撑的事实：Aero 使用铝制笔身，当前钢尖页列出不锈钢笔尖、上墨器和短墨囊，页面还给出约 140 mm 闭合长度、约 160 mm 戴帽长度、约 15 mm 直径和约 42 g 重量。后续扩写要继续拆 Aero Anodised、Aero Flame、Aero Oxyd、Aero Rhomb 和 14 ct 金尖版本，不能把某一个 SKU 的价格和配置套到全系列。",
      sourceNotes:
        "Draft based on the official Diplomat Aero fountain-pen product page. Variant release years and regional availability need follow-up sources.",
    },
    claims: [
      {
        id: "claim-diplomat-aero-zeppelin",
        predicate: "design_reference",
        text:
          "Diplomat official material describes the Aero fountain pen with smooth streamlined lines and a Zeppelin legacy reference.",
        evidenceLocator: "Smooth lines / legacy of the Zeppelin",
        confidence: 0.82,
        reviewStatus: "pending",
      },
      {
        id: "claim-diplomat-aero-material",
        predicate: "material",
        text:
          "The official Aero product page lists aluminium as the material for the referenced fountain pen.",
        evidenceLocator: "Material: Aluminium",
        confidence: 0.86,
        reviewStatus: "pending",
      },
      {
        id: "claim-diplomat-aero-fill",
        predicate: "fill_system",
        text:
          "The official Aero product page lists a converter inside the barrel and two cartridges for the referenced steel-nib fountain pen.",
        evidenceLocator: "converter inside the barrel / 2 cartridges",
        confidence: 0.84,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-diplomat-aero-steel",
        name: "Aero steel nib / 钢尖版本",
        notes: "当前官方产品页可支撑的基础钢尖版本；颜色和表面处理需逐项核验。",
        reviewStatus: "pending",
      },
      {
        id: "variant-diplomat-aero-14ct",
        name: "Aero 14 ct gold nib / 14K 金尖版本",
        notes: "官网 sitemap 存在独立 14 ct 页面；后续应补独立来源和规格。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-diplomat-aero-rhomb",
        name: "Aero Rhomb",
        notes: "菱纹表面处理支线；需要独立产品页核验价格和配置。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "esterbrook-estie-oversized",
    brandSlug: "esterbrook",
    source: {
      id: "esterbrook-official",
      name: "Esterbrook official site",
      attribution: "Esterbrook",
      homepageUrl: "https://www.esterbrookpens.com/",
      notes:
        "Use for official modern Esterbrook product facts and brand-history anchors; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-esterbrook-estie-oversized-official",
      title: "Esterbrook: Estie Oversized",
      url: "https://www.esterbrookpens.com/products/esterbrook-estie-nouveau-blue",
      itemType: "official_product",
      summary:
        "Official Estie product page used for Oversized product-type option, Jowo nib note, interchangeable nib system, and standard international cartridge/converter refill context.",
    },
    spec: {
      id: "spec-esterbrook-estie-oversized",
      seriesName: "Estie Oversized",
      releaseYear: "待核验",
      originCountry: "美国品牌/现代生产链需核验",
      nib: "德国 Jowo 笔尖，规格随版本变化",
      fillSystem: "标准国际墨囊/上墨器；Button Piston 为另一路版本",
      material: "树脂/亚克力类材质，具体配色需逐项核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中高端",
      status: "在产/版本供应需核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-esterbrook-estie-oversized-library",
      title: "把 vintage 名字和现代加大日用笔分开读",
      summary:
        "Estie Oversized 的档案先把现代 Estie 产品线和老 Esterbrook 历史声誉分开，围绕 Oversized 尺寸、Jowo 笔尖和可替换笔尖系统组织。",
      bodyMd:
        "Esterbrook Estie Oversized 需要谨慎处理：它借用了 Esterbrook 的历史名字，但作为现代产品线，应和 vintage nib、Model J 等老体系分开写。\n\n官方 Estie 产品页提供了几条可以先落地的现代线索：页面的产品类型选项包含 Oversized，FAQ/说明区把 Estie 的笔尖描述为德国 Jowo 制造，并说明钢笔使用 standard international cartridge 或 converter。这个档案后续要继续补尺寸、不同树脂配色、Journaler/Needlepoint 等 specialty nib，以及 Button Piston 分支。",
      sourceNotes:
        "Draft based on an official Esterbrook Estie product page that exposes the Oversized option and modern nib/refill notes. Variant-specific dimensions need follow-up sources.",
    },
    claims: [
      {
        id: "claim-esterbrook-estie-oversized-option",
        predicate: "variant",
        text:
          "The official Estie product page lists Oversized as one of the product-type choices for the referenced Estie line.",
        evidenceLocator: "Product Type / Oversized",
        confidence: 0.78,
        reviewStatus: "pending",
      },
      {
        id: "claim-esterbrook-estie-jowo",
        predicate: "nib",
        text:
          "Esterbrook official material describes the Estie nib as German-manufactured by Jowo.",
        evidenceLocator: "The Nib / German-manufactured nib by Jowo",
        confidence: 0.84,
        reviewStatus: "pending",
      },
      {
        id: "claim-esterbrook-estie-refill",
        predicate: "fill_system",
        text:
          "Esterbrook official material says its fountain pens use a standard international cartridge or converter.",
        evidenceLocator: "What Refills does my Esterbrook take?",
        confidence: 0.82,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-esterbrook-estie-regular",
        name: "Estie Regular",
        notes: "现代 Estie 的常规尺寸线；需补独立尺寸和重量。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-esterbrook-estie-oversized",
        name: "Estie Oversized",
        notes: "官方产品页列出的加大尺寸选项；配色和笔尖需按 SKU 核验。",
        reviewStatus: "pending",
      },
      {
        id: "variant-esterbrook-estie-button-piston",
        name: "Button Piston Estie",
        notes: "同页出现的内置上墨版本，应与普通上墨器/墨囊版本分开记录。",
        reviewStatus: "pending",
      },
    ],
  },
  {
    slug: "leonardo-furore-momento-magico",
    brandSlug: "leonardo",
    source: {
      id: "leonardo-official",
      name: "Leonardo Officina Italiana official site",
      attribution: "Leonardo Officina Italiana",
      homepageUrl: "https://leonardopen.com/",
      notes:
        "Use for official Leonardo product facts and modern Italian craft positioning; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-leonardo-momento-magico-official",
      title: "Leonardo: Momento Magico Collection",
      url: "https://leonardopen.com/collections/momento-magico",
      itemType: "official_product",
      summary:
        "Official Momento Magico collection page used for special resins, steel/gold nib options, and workshop-produced piston filler notes.",
    },
    spec: {
      id: "spec-leonardo-furore-momento-magico",
      seriesName: "Furore / Momento Magico",
      releaseYear: "待核验",
      originCountry: "意大利",
      nib: "钢尖或 14kt 金尖，随系列和版本变化",
      fillSystem: "Momento Magico 为活塞上墨；Furore 常见上墨器版本需另页核验",
      material: "树脂材质，配色和材料供应随版本变化",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中高端",
      status: "在产/版本供应需核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-leonardo-furore-momento-magico-library",
      title: "把意大利树脂和上墨路线拆成两条线",
      summary:
        "Leonardo Furore / Momento Magico 先作为合并档案拆线：Furore 读树脂、造型与上墨器；Momento Magico 读特殊树脂、金属环装饰和活塞上墨。",
      bodyMd:
        "这个站内条目把 Furore 和 Momento Magico 放在一起，容易变成一团“意大利树脂笔”的概括。更好的处理方式是先在一个合并档案里拆线：Furore 作为颜色、地名灵感和上墨器路线的一侧；Momento Magico 则作为特殊树脂、装饰环和活塞上墨路线的一侧。\n\n官方 Momento Magico collection 页面能先支撑第二条线：页面描述了 special resins，列出钢尖和金尖选项，并把上墨系统写成 Leonardo 自家 workshop 设计生产的 piston filler，容量为 1.5 ml。后续需要补 Furore collection 和具体 SKU，把 Furore 的 converter、Furore Grande、金尖/钢尖分支另行拆出。",
      sourceNotes:
        "Draft based on Leonardo official Momento Magico collection page; Furore-specific claims intentionally remain needs_source until separately cited.",
    },
    claims: [
      {
        id: "claim-leonardo-momento-magico-piston",
        predicate: "fill_system",
        text:
          "Leonardo official material describes Momento Magico as using a workshop-designed piston filler with a 1.5 ml capacity.",
        evidenceLocator: "Filling system / Piston filler / capacity 1.5ml",
        confidence: 0.84,
        reviewStatus: "pending",
      },
      {
        id: "claim-leonardo-momento-magico-nibs",
        predicate: "nib",
        text:
          "The official Momento Magico collection page lists steel nib and gold nib options for the line.",
        evidenceLocator: "Steel nib / Gold nib options",
        confidence: 0.8,
        reviewStatus: "pending",
      },
      {
        id: "claim-leonardo-momento-magico-resin",
        predicate: "material",
        text:
          "Leonardo official material frames Momento Magico around selected special resins.",
        evidenceLocator: "special resins",
        confidence: 0.78,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-leonardo-furore",
        name: "Furore",
        notes: "需要独立补 Furore collection/product page 后再确认上墨、尺寸和配色。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-leonardo-furore-grande",
        name: "Furore Grande",
        notes: "更大尺寸支线；需补官方产品页。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-leonardo-momento-magico",
        name: "Momento Magico",
        notes: "当前来源可支撑活塞上墨、钢尖/金尖和特殊树脂语境。",
        reviewStatus: "pending",
      },
    ],
  },
  {
    slug: "opus-88-demo-kolora",
    brandSlug: "opus88",
    referenceRelationType: "reference",
    source: {
      id: "juspirit-retail",
      name: "JUSPIRIT retail catalog",
      sourceType: "retailer",
      reliability: "medium",
      attribution: "賈絲筆咧 JUSPIRIT",
      homepageUrl: "https://juspirit.com/",
      notes:
        "Use as a secondary catalog source for Taiwanese fountain-pen listings when first-party Opus 88 product pages are not publicly reachable.",
    },
    sourceItem: {
      id: "source-opus88-demo-juspirit",
      title: "Opus 88: Demo Colored JUSPIRIT listing",
      url: "https://juspirit.com/collections/ink-institute-taiwan-pen-discount/products/opus88-demo-colored",
      itemType: "retailer_catalog",
      summary:
        "Retail catalog page for Opus 88 Demo Colored used as a secondary source for transparent acrylic body, eyedropper context, ebonite ink stopper, Jowo #12 nib note, approximate size/weight, and Taiwan-made note.",
    },
    spec: {
      id: "spec-opus88-demo-kolora",
      seriesName: "Demo / Kolora",
      releaseYear: "待核验",
      originCountry: "中国台湾",
      nib: "德国 Jowo #12 笔尖线索；需以品牌或更多零售页复核",
      fillSystem: "滴入式上墨",
      material: "透明亚克力，部分版本材质/配色不同",
      dimensions: "闭合约 15 cm（Demo Colored 二级来源）",
      weight: "约 27 g（Demo Colored 二级来源）",
      priceRange: "中端",
      status: "在产/版本供应需核验",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-opus88-demo-kolora-library",
      title: "把滴入式大容量当作 Opus 88 的阅读入口",
      summary:
        "Opus 88 Demo / Kolora 先以滴入式大容量、透明笔杆和止墨结构作为阅读入口；规格暂用二级来源，等待官网或目录复核。",
      bodyMd:
        "Opus 88 在图书馆里应该先从上墨方式读，而不是只从配色读。Demo / Kolora 这一类透明或半透明型号，核心看点是滴入式上墨带来的大容量，以及止墨结构如何缓解随身携带和气压变化的问题。\n\n当前可访问资料里，JUSPIRIT 的 Opus 88 Demo Colored 页面提供了几个可先标注的二级线索：透明亚克力笔身、ebonite ink stopper、德国 Jowo #12 笔尖、约 15 cm 闭合长度、约 27 g 重量，以及 Made in Taiwan。因为这不是 Opus 88 官网产品页，所有规格先保留 needs_source，后续应补品牌目录、说明书或更多零售交叉核验，再把 Demo、Koloro/Kolora、Jazz、Omar 等滴入式支线拆开。",
      sourceNotes:
        "Draft based on JUSPIRIT secondary retail catalog page. Treat model specifications as needs_source until first-party Opus 88 material or multiple reliable catalog pages are added.",
    },
    claims: [
      {
        id: "claim-opus88-demo-eyedropper",
        predicate: "fill_system",
        text:
          "A Taiwanese retail catalog page presents Opus 88 Demo Colored as an eyedropper-style fountain pen.",
        evidenceLocator: "正統滴入式鋼筆 / Glass eydropper",
        confidence: 0.62,
        reviewStatus: "needs_source",
      },
      {
        id: "claim-opus88-demo-material",
        predicate: "material",
        text:
          "The same secondary catalog page lists transparent acrylic for the referenced Demo Colored body/cap material.",
        evidenceLocator: "Material: Transparent Acrylic",
        confidence: 0.62,
        reviewStatus: "needs_source",
      },
      {
        id: "claim-opus88-demo-nib",
        predicate: "nib",
        text:
          "The secondary catalog page lists a Germany Jowo #12 nib for the referenced Demo Colored listing.",
        evidenceLocator: "Nib: Germany JOWO #12",
        confidence: 0.58,
        reviewStatus: "needs_source",
      },
    ],
    variants: [
      {
        id: "variant-opus88-demo",
        name: "Demo",
        notes: "当前二级来源可支撑透明 Demo 线索；需补品牌资料或多来源复核。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-opus88-kolora",
        name: "Kolora / Koloro",
        notes: "站内原条目合并了 Kolora/Koloro；需核验官方英文命名和具体版本。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "施耐德-schneider-bk402",
    brandSlug: "schneider",
    referenceRelationType: "review",
    source: {
      id: "loxpo-blog",
      name: "LOXPO user review archive",
      sourceType: "blog",
      reliability: "community_opinion",
      attribution: "LOXPO / llj503",
      homepageUrl: "https://www.loxpo.com/",
      notes:
        "Use as a secondary community review source for legacy Chinese-entry fountain-pen experience; summarize only and mark facts for follow-up.",
    },
    sourceItem: {
      id: "source-schneider-bk402-loxpo",
      title: "Schneider: BK402 community review",
      url: "https://www.loxpo.com/article-608-1.html",
      itemType: "review_article",
      summary:
        "Chinese user review of Schneider BK402 used as secondary evidence for low-cost student-pen context, light plastic body, F nib observation, triangular grip, and cartridge use.",
    },
    spec: {
      id: "spec-schneider-bk402",
      seriesName: "BK402",
      releaseYear: "待核验",
      originCountry: "德国品牌/生产地需核验",
      nib: "F 尖线索；需产品目录核验",
      fillSystem: "墨囊",
      material: "塑料笔身线索；需产品目录核验",
      dimensions: "待核验",
      weight: "轻量，具体重量待核验",
      priceRange: "入门",
      status: "可能停产或地区供应不明",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-schneider-bk402-library",
      title: "把学生笔放回德国办公文具工业里",
      summary:
        "Schneider BK402 先以低价学生笔和中文用户经验作为入口，所有规格保留待核验，后续优先找 Schneider 目录或零售 SKU。",
      bodyMd:
        "BK402 不适合被写成“经典高端钢笔”。它在图书馆里的意义更像一支中文入门语境里的德国学生笔：价格低、塑料笔身、轻量、墨囊使用，和 LAMY safari、Pilot Kakuno、Hero 359 这类学生/入门笔处在同一个阅读区域。\n\n目前 Schneider 官网检索没有直接返回 BK402 产品页，所以这一版先使用 LOXPO 的中文用户评测作为二级来源：文章记录了 BK402 低价购买、笔杆轻、笔尖标 F、三角握位和上墨后试写体验。因为来源不是官网或目录，页面上的规格全部标为 needs_source。下一步要补 Schneider 老目录、包装图或可靠零售 SKU，才能把笔尖、墨囊兼容、材质和生产地写得更硬。",
      sourceNotes:
        "Draft based on LOXPO secondary user review. Schneider official/current product page was not found during this batch; keep structured facts as needs_source.",
    },
    claims: [
      {
        id: "claim-schneider-bk402-student-context",
        predicate: "market_position",
        text:
          "A Chinese user review frames Schneider BK402 as a low-cost pen bought for a school-age child, making it useful as an entry/student-pen archive candidate.",
        evidenceLocator: "给女儿买的 / 15元",
        confidence: 0.5,
        reviewStatus: "needs_source",
      },
      {
        id: "claim-schneider-bk402-f-nib",
        predicate: "nib",
        text:
          "The secondary review observes an F marking on the BK402 nib.",
        evidenceLocator: "笔尖上还有一个“F”",
        confidence: 0.52,
        reviewStatus: "needs_source",
      },
      {
        id: "claim-schneider-bk402-grip",
        predicate: "ergonomics",
        text:
          "The secondary review describes a triangular grip area intended to help holding posture.",
        evidenceLocator: "握笔处为三角形",
        confidence: 0.5,
        reviewStatus: "needs_source",
      },
    ],
    variants: [
      {
        id: "variant-schneider-bk402-color",
        name: "BK402 彩色学生款",
        notes: "中文用户评测中出现黄、粉、红等颜色；需目录或包装图核验。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-schneider-bk406",
        name: "BK406 sibling line",
        notes: "中文入门推荐常把 BK402 与 BK406 并列；不是同一型号，后续应拆独立档案。",
        reviewStatus: "needs_source",
      },
    ],
  },
);

MODEL_SEEDS.push(
  {
    slug: "万宝龙-montblanc-大班146",
    brandSlug: "montblanc",
    source: {
      id: "montblanc-official",
      name: "Montblanc official site",
      attribution: "Montblanc",
      homepageUrl: "https://www.montblanc.com/",
      notes:
        "Use for official Montblanc product pages and collection positioning; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-montblanc-legrand-146-official",
      title: "Montblanc: Meisterstück Gold-Coated LeGrand Fountain Pen",
      url: "https://www.montblanc.com/en-us/meisterstuck-gold-coated-legrand-fountain-pen-MB132460.html",
      itemType: "official_product",
      summary:
        "Official Meisterstück LeGrand product page used for current LeGrand dimensions, precious resin, Au 585 / 14 K nib, and product-context boundaries for the 146 archive.",
    },
    spec: {
      id: "spec-montblanc-146-legrand",
      seriesName: "Meisterstück LeGrand / 146",
      releaseYear: "历史型号年份待核验",
      originCountry: "德国",
      nib: "Au 585 / 14 K 金尖，具体年代和尖型随版本变化",
      fillSystem: "活塞上墨（历史版本需核验）",
      material: "黑色 precious resin，镀金装饰；随版本变化",
      dimensions: "当前 LeGrand 页约 145.8 mm * 15.5 mm",
      weight: "当前 LeGrand 页约 25.42 g",
      priceRange: "高端",
      status: "在产/历史 146 版本需分期整理",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-montblanc-146-library",
      title: "把 146 当作 LeGrand 尺寸线来读",
      summary:
        "146 档案先用当前 Meisterstück LeGrand 官方页建立尺寸、笔尖和材质锚点，再把历史 146 的年代、feed、活塞和笔尖变化留给后续来源。",
      bodyMd:
        "Montblanc 146 很容易被直接写成“小 149”或“LeGrand”，但图书馆里要更细：146 是长期历史型号，当前官网的 Meisterstück LeGrand 页面只能作为现代产品锚点，不能覆盖所有年代。\n\n这版先记录当前官方页能确认的内容：Meisterstück LeGrand 使用黑色 precious resin、Au 585 / 14 K 金尖，页面列出的尺寸约为 145.8 mm * 15.5 mm，重量约为 25.42 g。后续应继续补 vintage 146、现代 146、不同年代 feed、活塞结构、笔尖字样和序列号差异。",
      sourceNotes:
        "Draft based on the current official Montblanc Meisterstück LeGrand product page. Historical 146 facts remain needs_source.",
    },
    claims: [
      {
        id: "claim-montblanc-146-legrand-nib",
        predicate: "nib",
        text:
          "Montblanc official material lists the current Meisterstück LeGrand with a handcrafted Au 585 / 14 K gold nib.",
        evidenceLocator: "Nib Description / Handcrafted Au 585 / 14 K",
        confidence: 0.82,
        reviewStatus: "pending",
      },
      {
        id: "claim-montblanc-146-legrand-dimensions",
        predicate: "dimensions",
        text:
          "The official current LeGrand page lists physical weight and dimensions for one current SKU; these do not describe every historic 146.",
        evidenceLocator: "Physical Weight / Dimensions",
        confidence: 0.76,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-montblanc-146-modern-legrand",
        name: "Modern Meisterstück LeGrand",
        notes: "当前官网 LeGrand 产品页可作为现代规格锚点。",
        reviewStatus: "pending",
      },
      {
        id: "variant-montblanc-146-vintage",
        name: "Vintage 146",
        notes: "需要收藏资料、目录、维修资料和年代图示单独拆档。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "万宝龙-montblanc-144",
    brandSlug: "montblanc",
    source: {
      id: "montblanc-official",
      name: "Montblanc official site",
      attribution: "Montblanc",
      homepageUrl: "https://www.montblanc.com/",
      notes:
        "Use for official Montblanc product pages and collection positioning; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-montblanc-classique-144-official",
      title: "Montblanc: Meisterstück Gold-Coated Classique Fountain Pen",
      url: "https://www.montblanc.com/en-us/meisterstuck-gold-coated-classique-fountain-pen-MB132463.html",
      itemType: "official_product",
      summary:
        "Official current Meisterstück Classique product page used as a cautious modern comparison point for the vintage 144/Classique archive.",
    },
    spec: {
      id: "spec-montblanc-144-classique",
      seriesName: "Classique / 144",
      releaseYear: "vintage 144 年份待核验",
      originCountry: "德国",
      nib: "Au 585 / 14 K 金尖线索；vintage 144 需按年代核验",
      fillSystem: "piston converter / 可用墨囊（当前 Classique 页）；vintage 144 需核验",
      material: "黑色 precious resin；vintage 材质细节需核验",
      dimensions: "当前 Classique 页约 140 mm * 13.7 mm",
      weight: "当前 Classique 页约 21.73 g",
      priceRange: "高端/二手 vintage 价格需另查",
      status: "vintage 与现代 Classique 需分开整理",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-montblanc-144-library",
      title: "把 vintage 144 和现代 Classique 谨慎分开读",
      summary:
        "144 档案先用现代 Classique 官方页做谨慎对照，只确认 Classique 规格线索，不把它写成 vintage 144 全史。",
      bodyMd:
        "Montblanc 144 在中文收藏语境里常被当作 vintage 入门金尖，但当前 Montblanc 官网更容易找到的是 Meisterstück Classique。两者可以放在同一个档案里做对照，却不能直接画等号。\n\n当前 Classique 官方页能支撑的现代事实包括：piston converter，可选墨囊，Au 585 / 14 K 金尖，黑色 precious resin，以及约 140 mm * 13.7 mm、约 21.73 g 的当前规格。vintage 144 的年代、笔尖字样、feed、笔帽环、上墨器和二手市场版本需要用目录、收藏资料和维修资料继续补。",
      sourceNotes:
        "Draft based on current Montblanc Classique product page as a modern comparison. Vintage 144 facts remain needs_source.",
    },
    claims: [
      {
        id: "claim-montblanc-classique-converter",
        predicate: "fill_system",
        text:
          "Montblanc official material says the current Meisterstück Classique fountain pen is designed with a piston converter and optional cartridges.",
        evidenceLocator: "piston converter / optional use of ink cartridges",
        confidence: 0.78,
        reviewStatus: "pending",
      },
      {
        id: "claim-montblanc-classique-nib",
        predicate: "nib",
        text:
          "Montblanc official material lists an Au 585 / 14 K gold nib for the current Classique SKU.",
        evidenceLocator: "Nib Description / Au 585 / 14 K",
        confidence: 0.8,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-montblanc-classique-modern",
        name: "Modern Meisterstück Classique",
        notes: "当前官网规格锚点；不代表全部 vintage 144。",
        reviewStatus: "pending",
      },
      {
        id: "variant-montblanc-144-vintage",
        name: "Vintage 144",
        notes: "需要历史目录、维修资料和收藏资料补年代变化。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "万宝龙-montblanc-大文豪系列-writers-edition",
    brandSlug: "montblanc",
    source: {
      id: "montblanc-official",
      name: "Montblanc official site",
      attribution: "Montblanc",
      homepageUrl: "https://www.montblanc.com/",
      notes:
        "Use for official Montblanc product pages and collection positioning; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-montblanc-writers-edition-official",
      title: "Montblanc: Writers Edition",
      url: "https://www.montblanc.com/en-no/writing-instruments/collectables/writers-edition",
      itemType: "official_collection",
      summary:
        "Official Writers Edition collection page used for annual-series positioning since 1992 and author-homage framing.",
    },
    spec: {
      id: "spec-montblanc-writers-edition",
      seriesName: "Writers Edition",
      releaseYear: "1992 起年度系列",
      originCountry: "德国",
      nib: "随具体作家版本变化",
      fillSystem: "随具体作家版本变化",
      material: "随具体作家版本变化",
      dimensions: "需按单支版本核验",
      weight: "需按单支版本核验",
      priceRange: "限量/收藏级",
      status: "collection 级档案，需拆具体作家版本",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-montblanc-writers-edition-library",
      title: "把文学致敬系列作为可拆展柜来读",
      summary:
        "Writers Edition 先作为 collection 级档案处理：它不是单一型号，而是一组自 1992 年以来按作家拆分的限量书写工具。",
      bodyMd:
        "Montblanc Writers Edition 应该像一个可展开展柜，而不是一支固定规格的钢笔。官方 collection 页面写明 Issued annually since 1992，并把系列定位为向影响文学视野和文化运动的作家致敬。\n\n因此这版档案先只建立 collection 层级：作家主题、年度发行、collectable 定位。具体到 Robert Louis Stevenson、Jane Austen、Brothers Grimm、Bram Stoker 等版本时，还要逐个补材料、笔尖、限量数、图案引用和包装资料。",
      sourceNotes:
        "Draft based on Montblanc official Writers Edition collection page. Version-level specs intentionally remain needs_source.",
    },
    claims: [
      {
        id: "claim-montblanc-writers-edition-annual",
        predicate: "collection_scope",
        text:
          "Montblanc official material describes Writers Edition as issued annually since 1992.",
        evidenceLocator: "Issued annually since 1992",
        confidence: 0.84,
        reviewStatus: "pending",
      },
      {
        id: "claim-montblanc-writers-edition-homage",
        predicate: "design_reference",
        text:
          "The official collection page frames Writers Edition as homage to distinguished authors and literary eras.",
        evidenceLocator: "pays homage to the distinguished authors",
        confidence: 0.78,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-montblanc-writers-stevenson",
        name: "Homage to Robert Louis Stevenson",
        notes: "官网 collection 中出现的作家支线；需独立产品页。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-montblanc-writers-austen",
        name: "Homage to Jane Austen",
        notes: "官网 collection 中出现的作家支线；需独立产品页。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-montblanc-writers-stoker",
        name: "Homage to Bram Stoker",
        notes: "官网 collection 中出现的作家支线；需独立产品页。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "万宝龙-montblanc-patron-of-art-888",
    brandSlug: "montblanc",
    source: {
      id: "montblanc-official",
      name: "Montblanc official site",
      attribution: "Montblanc",
      homepageUrl: "https://www.montblanc.com/",
      notes:
        "Use for official Montblanc product pages and collection positioning; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-montblanc-patron-of-art-official",
      title: "Montblanc: Patron of Art",
      url: "https://www.montblanc.com/en-ro/writing-instruments/collectables/patron-of-art",
      itemType: "official_collection",
      summary:
        "Official Patron of Art collection page used for annual-series context and Limitation 4810 / Limitation 888 framing.",
    },
    spec: {
      id: "spec-montblanc-patron-of-art-888",
      seriesName: "Patron of Art 888",
      releaseYear: "1995 起 888/4810 双版本线索",
      originCountry: "德国",
      nib: "随具体赞助人版本变化",
      fillSystem: "随具体赞助人版本变化",
      material: "随具体赞助人版本变化",
      dimensions: "需按单支版本核验",
      weight: "需按单支版本核验",
      priceRange: "限量/收藏级",
      status: "collection 级档案，需拆具体赞助人版本",
      reviewStatus: "needs_source",
    },
    story: {
      id: "story-model-montblanc-patron-of-art-888-library",
      title: "把艺术赞助人系列和 888 限量拆开读",
      summary:
        "Patron of Art 888 先作为限量 collection 档案处理，重点区分 4810 与 888 两条限制数量线，再逐个拆具体赞助人主题。",
      bodyMd:
        "Patron of Art 888 不是普通型号名，而是 Montblanc 艺术赞助人系列中的一条限量规格线。官方 Patron of Art 页面把这个系列放在艺术运动的赞助者和推动者语境中，并说明自 1995 年起每个 Patron of Art Edition 都有 Limitation 4810 和 Limitation 888 两个版本。\n\n因此图书馆里先按 collection 处理：888 是限量级别，不是单一外形。后续应把 Moctezuma I 等具体版本拆成独立页面，逐个补图案、材质、笔尖、限量编号和发行年份。",
      sourceNotes:
        "Draft based on Montblanc official Patron of Art collection page. Individual 888 edition specs need product-specific sources.",
    },
    claims: [
      {
        id: "claim-montblanc-patron-888-limitation",
        predicate: "collection_scope",
        text:
          "Montblanc official material says Patron of Art editions since 1995 have been available as Limitation 4810 and Limitation 888.",
        evidenceLocator: "Limitation 4810 / Limitation 888",
        confidence: 0.84,
        reviewStatus: "pending",
      },
      {
        id: "claim-montblanc-patron-art-context",
        predicate: "design_reference",
        text:
          "The official Patron of Art page frames the collection around promoters and advocates of influential artistic movements.",
        evidenceLocator: "promoters and advocates",
        confidence: 0.76,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-montblanc-patron-4810",
        name: "Limitation 4810",
        notes: "官方 collection 页说明的另一限量线；需按具体年度版本拆分。",
        reviewStatus: "pending",
      },
      {
        id: "variant-montblanc-patron-888",
        name: "Limitation 888",
        notes: "当前档案关注的限量线；需补具体 Patron of Art 作品页。",
        reviewStatus: "pending",
      },
      {
        id: "variant-montblanc-patron-moctezuma",
        name: "Homage to Moctezuma I",
        notes: "官网 collection 中出现的具体支线；需独立产品页。",
        reviewStatus: "needs_source",
      },
    ],
  },
);

MODEL_SEEDS.push(
  {
    slug: "三文堂-twsbi-diamond-mini-al",
    brandSlug: "twsbi",
    source: {
      id: "twsbi-official",
      name: "TWSBI official site",
      attribution: "TWSBI",
      homepageUrl: "https://www.twsbi.com/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-twsbi-diamond-mini-al-official",
      title: "TWSBI: Diamond Mini AL Silver Fountain Pen",
      url: "https://www.twsbi.com/products/twsbi-diamond-mini-al-silver-fountain-pen",
      itemType: "official_product",
      summary:
        "Official TWSBI Diamond Mini AL Silver product page used for piston-filler context, aluminum-parts note, compact/postable sizing language, and steel nib range.",
    },
    spec: {
      id: "spec-twsbi-diamond-mini-al",
      seriesName: "Diamond Mini AL",
      releaseYear: "待核验",
      originCountry: "台湾",
      nib: "钢尖，官方商品页列 EF/F/M/B/Stub 1.1 等规格",
      fillSystem: "活塞上墨",
      material: "透明笔身加 Aluminum Parts；颜色/材质需按版本核验",
      dimensions: "约比 Diamond 580 短 1 inch；精确尺寸待核验",
      weight: "待核验",
      priceRange: "中端",
      status: "在产/版本供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-twsbi-diamond-mini-al-library",
      title: "把 580 的活塞示范笔缩成随身尺寸",
      summary:
        "Diamond Mini AL 的档案先围绕活塞上墨、可戴帽书写的短尺寸、铝制部件和 Diamond 580 的关系组织。",
      bodyMd:
        "TWSBI Diamond Mini AL 适合放在 Diamond 580 旁边读：它仍然是透明示范笔和活塞上墨路线，但官方页面把重点放在更短的随身尺寸、戴帽后书写长度，以及 Aluminum Parts 的触感差异。\n\n当前档案用 Diamond Mini AL Silver 官方页做锚点。页面说明它是 piston filler type fountain pen，提供 EF/F/M/B/Stub 1.1 等笔尖，并描述其收纳时尺寸接近 iPhone 5、戴帽后适合书写、约比 Diamond 580 短 1 inch。后续要继续补 Mini Clear、Mini Classic、AL Silver 与其他颜色的尺寸、重量和材料差异。",
      sourceNotes:
        "Draft based on official TWSBI Diamond Mini AL Silver product page. Exact dimensions, weight, and release chronology need follow-up sources.",
    },
    claims: [
      {
        id: "claim-twsbi-diamond-mini-al-piston",
        predicate: "fill_system",
        text:
          "TWSBI official material describes Diamond Mini AL Silver as a piston-filler type fountain pen.",
        evidenceLocator: "Piston filler type fountain pen",
        confidence: 0.84,
        reviewStatus: "pending",
      },
      {
        id: "claim-twsbi-diamond-mini-al-aluminum",
        predicate: "material",
        text:
          "TWSBI official material says the Mini now comes with Aluminum Parts for the referenced Diamond Mini AL Silver page.",
        evidenceLocator: "The Mini now comes with Aluminum Parts",
        confidence: 0.8,
        reviewStatus: "pending",
      },
      {
        id: "claim-twsbi-diamond-mini-al-compact",
        predicate: "design_feature",
        text:
          "The official page frames Diamond Mini AL around compact storage size and posted-cap writing length.",
        evidenceLocator: "same height as an iPhone 5 / cap is posted",
        confidence: 0.76,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-twsbi-diamond-mini-al-silver",
        name: "Diamond Mini AL Silver",
        notes: "当前官方来源锚点版本；颜色和地区供应需继续核验。",
        reviewStatus: "pending",
      },
      {
        id: "variant-twsbi-diamond-mini-clear",
        name: "Diamond Mini Clear",
        notes: "官网存在独立页面；需补清晰版材质、价格和规格来源。",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-twsbi-mini-classic",
        name: "Diamond Mini Classic",
        notes: "官网存在独立页面；应和 AL 版本分开标注。",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "三文堂-twsbi-go",
    brandSlug: "twsbi",
    source: {
      id: "twsbi-official",
      name: "TWSBI official site",
      attribution: "TWSBI",
      homepageUrl: "https://www.twsbi.com/",
      notes:
        "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    sourceItem: {
      id: "source-twsbi-go-official",
      title: "TWSBI: GO Clear Fountain Pen",
      url: "https://www.twsbi.com/products/twsbi-go-clear-fountain-pen",
      itemType: "official_product",
      summary:
        "Official TWSBI GO Clear product page used for affordable positioning, spring-loaded piston filling mechanism, simple press-and-release operation, and nib range.",
    },
    spec: {
      id: "spec-twsbi-go",
      seriesName: "GO",
      releaseYear: "待核验",
      originCountry: "台湾",
      nib: "钢尖，官方商品页列 EF/F/M/B/Stub 1.1 等规格",
      fillSystem: "Spring loaded piston filling mechanism",
      material: "透明/彩色塑料笔身语境，具体材质待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "入门",
      status: "在产/颜色供应需核验",
      reviewStatus: "pending",
    },
    story: {
      id: "story-model-twsbi-go-library",
      title: "把弹簧活塞做成入门透明实验笔",
      summary:
        "TWSBI GO 的档案先围绕低价、弹簧活塞和按压释放的上墨体验组织，和 ECO/580 的旋转活塞路线区分开。",
      bodyMd:
        "TWSBI GO 不是 ECO 的简单低配版。它的重点在上墨动作：官方页面把 GO 描述成 affordable fountain pen，并写明使用 Spring loaded piston filling mechanism，按下再释放即可完成上墨。\n\n这让 GO 很适合放进“上墨机制实验室”的入门区：ECO 和 580 让用户理解旋转活塞，GO 则用弹簧活塞把动作变得更直接。当前档案先用 GO Clear 官方页作为锚点，后续应补 Sapphire、Smoke 等颜色和实际拆解图，解释弹簧、活塞和墨仓如何互动。",
      sourceNotes:
        "Draft based on official TWSBI GO Clear product page. Materials, dimensions, and release chronology need follow-up sources.",
    },
    claims: [
      {
        id: "claim-twsbi-go-spring-piston",
        predicate: "fill_system",
        text:
          "TWSBI official material describes GO as using a spring-loaded piston filling mechanism.",
        evidenceLocator: "Spring loaded piston filling mechanism",
        confidence: 0.84,
        reviewStatus: "pending",
      },
      {
        id: "claim-twsbi-go-affordable",
        predicate: "market_position",
        text:
          "TWSBI official material frames GO as a new take on affordable fountain pens.",
        evidenceLocator: "A new take on affordable fountain pens",
        confidence: 0.78,
        reviewStatus: "pending",
      },
      {
        id: "claim-twsbi-go-nib-options",
        predicate: "nib",
        text:
          "The official GO Clear page lists EF, F, M, B, and Stub 1.1 nib options.",
        evidenceLocator: "Comes in EF, F, M, B, Stub1.1",
        confidence: 0.8,
        reviewStatus: "pending",
      },
    ],
    variants: [
      {
        id: "variant-twsbi-go-clear",
        name: "GO Clear",
        notes: "当前官方来源锚点版本；透明入门示范笔语境。",
        reviewStatus: "pending",
      },
      {
        id: "variant-twsbi-go-sapphire",
        name: "GO Sapphire",
        notes: "官网存在独立页面；需补颜色和供应信息。",
        reviewStatus: "needs_source",
      },
    ],
  },
);

const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : MODEL_SEEDS.length;

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

async function findEntity(
  db: Client,
  type: string,
  slug: string,
): Promise<EntityRow | null> {
  const result = await db.execute({
    sql: "SELECT id, slug, name FROM entities WHERE type = ? AND slug = ? LIMIT 1",
    args: [type, slug],
  });
  return (result.rows[0] as EntityRow | undefined) || null;
}

async function writeSourceRegistry(db: Client, source: SourceRegistrySeed) {
  await execute(
    db,
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (?, ?, ?, 'summary_only', ?, 'copyrighted; summary/link only', ?, ?, 'manual_verified_url', ?, date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      reliability = excluded.reliability,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [
      source.id,
      source.name,
      source.sourceType || "official",
      source.reliability || "official_marketing",
      source.attribution,
      source.homepageUrl,
      source.notes,
    ],
  );
}

async function writeSourceItem(db: Client, seed: ModelSeed) {
  await execute(
    db,
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, author, retrieved_at, summary, allowed_use, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, 'copyrighted; summary/link only', ?, date('now'), ?, 'summary_only', 'approved', datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      url = excluded.url,
      item_type = excluded.item_type,
      author = excluded.author,
      retrieved_at = excluded.retrieved_at,
      summary = excluded.summary,
      allowed_use = excluded.allowed_use,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      seed.sourceItem.id,
      seed.source.id,
      seed.sourceItem.title,
      seed.sourceItem.url,
      seed.sourceItem.itemType,
      seed.source.attribution,
      seed.sourceItem.summary,
    ],
  );
}

async function writeModelSeed(
  db: Client,
  model: EntityRow,
  brand: EntityRow | null,
  seed: ModelSeed,
) {
  await writeSourceRegistry(db, seed.source);
  await writeSourceItem(db, seed);

  await execute(
    db,
    `INSERT INTO entity_references
      (id, entity_id, source_item_id, relation_type, note, review_status)
     VALUES (?, ?, ?, ?, ?, 'approved')
     ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
      note = excluded.note,
      review_status = excluded.review_status`,
    [
      `reference-${seed.referenceRelationType || "official"}-model-${model.id}-${seed.sourceItem.id}`,
      model.id,
      seed.sourceItem.id,
      seed.referenceRelationType || "official",
      seed.referenceRelationType === "official" || !seed.referenceRelationType
        ? "Official product or series source registered for model archive expansion. Summary/link only."
        : "Reference source registered for model archive expansion. Summary/link only; facts require source-status awareness.",
    ],
  );

  await execute(
    db,
    `INSERT INTO model_specs
      (id, entity_id, brand_entity_id, series_name, release_year, origin_country, nib, fill_system, material, dimensions, weight, price_range, status, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(entity_id) DO UPDATE SET
      brand_entity_id = excluded.brand_entity_id,
      series_name = excluded.series_name,
      release_year = excluded.release_year,
      origin_country = excluded.origin_country,
      nib = excluded.nib,
      fill_system = excluded.fill_system,
      material = excluded.material,
      dimensions = excluded.dimensions,
      weight = excluded.weight,
      price_range = excluded.price_range,
      status = excluded.status,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      seed.spec.id,
      model.id,
      brand?.id || null,
      seed.spec.seriesName,
      seed.spec.releaseYear,
      seed.spec.originCountry,
      seed.spec.nib,
      seed.spec.fillSystem,
      seed.spec.material,
      seed.spec.dimensions,
      seed.spec.weight,
      seed.spec.priceRange,
      seed.spec.status,
      seed.spec.reviewStatus,
    ],
  );

  await execute(
    db,
    `INSERT INTO citations
      (id, target_type, target_id, source_item_id, note)
     VALUES (?, 'model_spec', ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      source_item_id = excluded.source_item_id,
      note = excluded.note`,
    [
      `cite-${seed.spec.id}-${seed.sourceItem.id}`.slice(0, 160),
      seed.spec.id,
      seed.sourceItem.id,
      "Model spec seed uses this official source as its first structured evidence anchor.",
    ],
  );

  await execute(
    db,
    `INSERT INTO stories
      (id, entity_id, title, story_type, summary, body_md, status, source_notes, updated_at)
     VALUES (?, ?, ?, 'model_story', ?, ?, 'draft', ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      body_md = excluded.body_md,
      source_notes = excluded.source_notes,
      updated_at = datetime('now')`,
    [
      seed.story.id,
      model.id,
      seed.story.title,
      seed.story.summary,
      seed.story.bodyMd,
      seed.story.sourceNotes,
    ],
  );

  await execute(
    db,
    `INSERT INTO citations
      (id, target_type, target_id, source_item_id, note)
     VALUES (?, 'story', ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      source_item_id = excluded.source_item_id,
      note = excluded.note`,
    [
      `cite-${seed.story.id}-${seed.sourceItem.id}`.slice(0, 160),
      seed.story.id,
      seed.sourceItem.id,
      "Model story draft uses this official source as a summary/link-only anchor.",
    ],
  );

  for (const claim of seed.claims) {
    await execute(
      db,
      `INSERT INTO claims
        (id, subject_entity_id, predicate, object_text, source_item_id, evidence_locator, confidence, review_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
        predicate = excluded.predicate,
        object_text = excluded.object_text,
        source_item_id = excluded.source_item_id,
        evidence_locator = excluded.evidence_locator,
        confidence = excluded.confidence,
        review_status = excluded.review_status,
        updated_at = datetime('now')`,
      [
        claim.id,
        model.id,
        claim.predicate,
        claim.text,
        seed.sourceItem.id,
        claim.evidenceLocator || null,
        claim.confidence,
        claim.reviewStatus,
      ],
    );

    await execute(
      db,
      `INSERT INTO citations
        (id, target_type, target_id, source_item_id, claim_id, note)
       VALUES (?, 'claim', ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        source_item_id = excluded.source_item_id,
        claim_id = excluded.claim_id,
        note = excluded.note`,
      [
        `cite-${claim.id}-${seed.sourceItem.id}`.slice(0, 160),
        claim.id,
        seed.sourceItem.id,
        claim.id,
        "Structured claim cites the official source item.",
      ],
    );
  }

  for (const variant of seed.variants) {
    await execute(
      db,
      `INSERT INTO model_variants
        (id, model_entity_id, variant_name, release_year, notes, source_item_id, review_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(model_entity_id, variant_name) DO UPDATE SET
        release_year = excluded.release_year,
        notes = excluded.notes,
        source_item_id = excluded.source_item_id,
        review_status = excluded.review_status`,
      [
        variant.id,
        model.id,
        variant.name,
        variant.releaseYear || null,
        variant.notes,
        seed.sourceItem.id,
        variant.reviewStatus,
      ],
    );
  }

  if (seed.timeline) {
    await execute(
      db,
      `INSERT INTO timeline_events
        (id, entity_id, title, event_type, start_date, circa, description, source_item_id, review_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        event_type = excluded.event_type,
        start_date = excluded.start_date,
        circa = excluded.circa,
        description = excluded.description,
        source_item_id = excluded.source_item_id,
        review_status = excluded.review_status,
        updated_at = datetime('now')`,
      [
        seed.timeline.id,
        model.id,
        seed.timeline.title,
        seed.timeline.eventType,
        seed.timeline.startDate,
        seed.timeline.circa ? 1 : 0,
        seed.timeline.description,
        seed.sourceItem.id,
        seed.timeline.reviewStatus,
      ],
    );

    await execute(
      db,
      `INSERT INTO citations
        (id, target_type, target_id, source_item_id, note)
       VALUES (?, 'timeline_event', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        source_item_id = excluded.source_item_id,
        note = excluded.note`,
      [
        `cite-${seed.timeline.id}-${seed.sourceItem.id}`.slice(0, 160),
        seed.timeline.id,
        seed.sourceItem.id,
        "Timeline event uses this official source as its first anchor.",
      ],
    );
  }
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  if (WRITE) await runMigrations(db);

  const seeds = MODEL_SEEDS.slice(0, LIMIT);
  console.log(
    WRITE
      ? "Official model source import: write mode"
      : "Official model source import: dry run",
  );

  for (const seed of seeds) {
    const model = await findEntity(db, "pen", seed.slug);
    if (!model) {
      console.warn(`Skip ${seed.slug}: local model entity not found`);
      continue;
    }
    const brand = await findEntity(db, "brand", seed.brandSlug);
    console.log(
      `${model.name} -> ${seed.sourceItem.title} | ${brand?.name || "brand missing"}`,
    );
    if (WRITE) await writeModelSeed(db, model, brand, seed);
  }

  if (!WRITE) {
    console.log("Dry run only. Re-run with --write to store model archives.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
