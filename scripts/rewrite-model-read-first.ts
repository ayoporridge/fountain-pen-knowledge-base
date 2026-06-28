import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");

type PenRow = {
  entityId: string;
  slug: string;
  name: string;
  summary: string | null;
  storyId: string;
  storyTitle: string;
  storyBody: string;
  seriesName: string | null;
  releaseYear: string | null;
  originCountry: string | null;
  nib: string | null;
  fillSystem: string | null;
  material: string | null;
  dimensions: string | null;
  weight: string | null;
  priceRange: string | null;
  status: string | null;
  brandName: string | null;
  brandSlug: string | null;
};

type SourceRow = {
  title: string;
  sourceName: string;
  sourceType: string;
  itemType: string;
};

const INTERNAL_COPY =
  /待核验|资料补证|研究队列|待拆分|待重分类|当前草稿|待补来源|资料边界|来源边界|待合并|待归因|方便读者确认|公开来源没有直接支撑|未由来源支撑|写成确定事实|可以先放在|currently needs|verified facts|research-queue|brand[- ]?generic|Research index|identity pending|分开阅读|重命名|可能应拆|制造或品牌语境|页面只/i;

const BANNED_TEMPLATE_COPY =
  /使用体验要放到具体场景|公开信息主要来自|这些资料的价值不一样|关于销量、名人使用|更实用的比较方式|传闻不宜当成卖点|如果你正在考虑购买或收藏|不必只盯着某个参数|钢笔谱系中值得单独辨认的一支/;

const GENERIC_VALUES = new Set([
  "",
  "型号",
  "笔尖",
  "上墨",
  "上墨方式",
  "材料",
  "笔身材质",
  "价位",
  "尺寸",
  "重量",
  "取决于搭载笔款",
  "不适合按单一笔款填写",
  "产地/版本",
  "笔尖规格",
  "笔尖类型",
  "上墨方式",
  "笔身材质",
  "现代铝合金支线年份",
]);

const CURATED_NOTES: Record<string, string[]> = {
  "上海-shanghai-97回归": [
    "英雄 1997型18K金笔 的重点不是普通日用参数，而是它和 1997 年香港回归这一历史场景的关系。英雄官网介绍，1997 年 7 月 1 日香港回归前后，英雄制笔工人历时半年设计铸造了这款纪念金笔；上观新闻也提到，这支笔属于英雄金笔见证香港回归、澳门回归和中国加入世贸组织等重要场合的叙事脉络。",
    "从产品角度看，它更像一支纪念限量笔，而不是单纯按价格或笔尖粗细来判断的日常书写工具。公开资料明确写到“英雄1997型18K金笔”共生产 1997 支，最后一个编号赠予时任香港特首董建华。对读者来说，这意味着它的价值主要来自纪念主题、限量编号、18K 金笔身份和英雄品牌历史，而不是普通在售钢笔的颜色、尖号或供墨规格。",
    "如果你在二手或收藏市场看到这类笔，最值得先核对的是外盒、编号、笔身刻字、笔尖标识和随附文件。纪念笔常见的问题不是“是否好写”这么简单，而是版本是否对应、附件是否完整、图片是否能看清关键标记。把它放回英雄品牌历史中阅读，比只把它当成“上海 97回归”这样的模糊型号名更准确。",
  ],
  "凌美-lamy-lamy-2000": [
    "LAMY 2000 的核心故事在于“现代设计”不是外观标签，而是整支笔的结构语言。它在 1966 年推出，常见资料会把它和设计师 Gerd A. Müller、包豪斯之后的德国工业设计联系在一起：笔身不靠装饰取胜，而靠一体化轮廓、半包式笔尖、活塞机构和磨砂 Makrolon 质感形成辨识度。",
    "这支笔的评价长期集中在两个方向：喜欢它的人看重低调、耐看、大容量和日常可靠；不适应的人往往会在意握位小耳朵、半包尖视线和笔尖甜区。也正因为这些特点，LAMY 2000 不像一支展示性很强的礼品笔，更像一件长期放在桌面上的工具。",
  ],
  "pilot-custom-823": [
    "Custom 823 在 Pilot 的 Custom 系列里常被当作“大容量日用旗舰”理解。它最醒目的不是装饰，而是真空上墨结构、透明或半透明笔身以及 14K 金尖组合：储墨量大，能直观看到墨水状态，也让它在长写场景里比普通墨囊/上墨器钢笔更有存在感。",
    "使用评价通常围绕稳定、顺滑和续航展开。真空上墨需要旋开尾钮才能获得持续供墨，这一点对初次使用者需要适应；但一旦熟悉，它的优势就是长时间书写时不用频繁补墨，适合笔记、手账、长文和希望体验日系金尖的人。",
  ],
  "万宝龙-montblanc-大班149-meisterst-ck": [
    "Meisterstuck 149 是万宝龙最有代表性的“大班”钢笔之一。它的辨识度来自雪峰标识、雪茄形笔身、大尺寸金尖和活塞上墨，也来自它长期被放在商务礼品、签字笔和收藏体系中讨论。读这支笔时，不宜只把它看成一支昂贵钢笔；它同时是一种品牌符号。",
    "149 的使用体验通常和“大尺寸”“重心”“大笔尖”联系在一起：握持空间充足，视觉仪式感强，长时间书写是否舒服则取决于手型和对笔身粗细的接受程度。它的故事性很强，既有 Meisterstuck 系列的品牌历史，也有大量版本、年代和笔尖差异形成的收藏体系。",
  ],
  "派克-parker-51-经典-vintage": [
    "Parker 51 是二十世纪钢笔史里绕不开的经典型号。它的标志不是外露大金尖，而是暗尖、流线型笔帽和接近现代书写工具的克制外形。正因为这种设计，它在老派钢笔和现代日用笔之间搭了一座桥：外观低调，结构却很有时代特征。",
    "阅读 Parker 51 时要注意版本和年代。Vacumatic、Aerometric、不同产地和不同笔帽材料都会影响收藏价值、维护难度和实际书写感。很多人喜欢它，是因为它不像展示性强的古董笔，更像一支还能稳定工作的老工具；这也是它长期被收藏者和修笔爱好者反复讨论的原因。",
  ],
  "白金-platinum-3776-century": [
    "Platinum #3776 Century 的关键词是“日系金尖”和密封笔帽。#3776 指向富士山高度，也让它从命名开始就带有日本品牌的象征意味。Century 版本被广泛讨论的重点，是 Slip & Seal 机制对防干的帮助，以及 14K 金尖提供的明确书写反馈。",
    "这支笔适合把“日用可靠”和“笔尖个性”放在一起看。它通常不会被描述成极端顺滑的笔，而是有更清楚的纸面反馈；这对喜欢控制感、写汉字或希望线条更稳定的人很有吸引力。",
  ],
  "sailor-pro-gear": [
    "Sailor Pro Gear 的标志是平顶外形和写乐金尖。它和 1911 系列经常被放在一起比较：1911 更接近雪茄形传统轮廓，Pro Gear 则通过平顶和尾端装饰显得更现代。写乐的 14K、21K 笔尖反馈也是这条产品线被反复讨论的核心。",
    "Pro Gear 的评价通常不是“大容量”或“机制复杂”，而是笔尖反馈、配色版本和尺寸家族。Slim、标准、King of Pen 等不同尺寸会明显改变握持和视觉比例；如果你在意纸面触感，它比单看外观更值得试写。",
  ],
  "百利金-pelikan-m800": [
    "Pelikan M800 属于 Souveran 系列里非常有代表性的大尺寸活塞钢笔。绿条纹笔身、活塞上墨、可旋出笔尖组件和较大的 18K 笔尖，让它在德系传统钢笔里有很强辨识度。",
    "M800 的使用感通常和稳定、储墨量、分量感联系在一起。它比 M400、M600 更有存在感，也更考验使用者是否喜欢偏大的笔身和较实的重心。对很多人来说，它是从中型日用笔进入高阶活塞钢笔时会认真比较的一支。",
  ],
  "kaweco-sport": [
    "Kaweco Sport 的故事在于“短小便携”变成了一种明确设计。它合盖时很短，插上笔帽后才变成正常书写长度，八角笔帽也让它和普通圆杆钢笔区别明显。",
    "这支笔的评价集中在便携、可玩性和版本多。它不是靠大容量或豪华材料取胜，而是适合放在口袋、笔袋或随身小本旁边。不同材质版本会显著改变重量和手感，因此阅读这个型号时要把塑料、铝、黄铜等版本分开理解。",
  ],
  "维斯康蒂-visconti-homo-sapiens智人": [
    "Visconti Homo Sapiens 的辨识点是熔岩材质叙事、意大利品牌风格和偏收藏向的外观。它常被讨论的不只是书写，而是材料故事、笔帽锁扣、金属件处理和整体气质。",
    "这支笔适合从“材料感”进入：它不像透明示范笔那样展示结构，也不像极简工具笔那样降低存在感。喜欢它的人往往看重触感、造型和品牌故事；购买时则需要特别关注版本、笔尖调校和售后体验。",
  ],
  "奥罗拉-aurora": [
    "Aurora 88 是意大利钢笔史里很重要的名称。它常被放在战后意大利设计、活塞上墨和经典日用金尖笔的脉络里理解。和很多只靠装饰吸引人的钢笔不同，Aurora 88 的魅力在于比例、笔尖反馈和长期产品线延续。",
    "使用评价里，Aurora 经常被提到的特点是有辨识度的反馈感。它不一定追求玻璃般顺滑，而是让纸面触感更清楚；这让它在喜欢欧系金尖、又想要一点书写个性的用户中有稳定吸引力。",
  ],
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

async function execute<T extends Record<string, unknown>>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  const result = await db.execute({ sql, args: args as InArgs });
  return result.rows.map((row) => row as T);
}

function clean(value: unknown) {
  return String(value || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>]/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/Research index:\s*/gi, "")
    .replace(/public[- ]web research index/gi, "公开资料")
    .replace(/^Research index$/gi, "公开资料")
    .replace(/\bidentity pending\b/gi, "")
    .replace(/；?\s*需[^，。；]*[核复][^，。；]*/g, "")
    .replace(/；?\s*需[^，。；]*$/g, "")
    .replace(/线索/g, "")
    .replace(/语境/g, "")
    .replace(/（）|\(\)|（\）/g, "")
    .replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

function displayName(value: string) {
  return clean(value).replace(/\s*[—-]\s*$/, "").trim() || clean(value);
}

function usable(value: unknown) {
  const text = clean(value);
  if (!text || GENERIC_VALUES.has(text)) return "";
  if (INTERNAL_COPY.test(text)) return "";
  return text;
}

function join(items: string[], limit = 4) {
  return [...new Set(items.map(usable).filter(Boolean))].slice(0, limit).join("、");
}

function phraseOrigin(value: string) {
  return value
    .replace(/（）|\(\)/g, "")
    .replace(/\s*制造或品牌背景\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function publicField(label: string, value: unknown) {
  const text = usable(value);
  if (!text) return "";
  if (label === "年份" && !/\d{3,4}/.test(text)) return "";
  if (/需|核验|复核|pending|待/.test(text)) return "";
  return text;
}

function fieldList(row: PenRow) {
  return [
    ["系列", row.seriesName],
    ["年份", row.releaseYear],
    ["产地", row.originCountry],
    ["笔尖", row.nib],
    ["上墨", row.fillSystem],
    ["材质", row.material],
    ["尺寸", row.dimensions],
    ["重量", row.weight],
    ["价位", row.priceRange],
  ]
    .map(([label, value]) => {
      const text = publicField(label, value);
      return text ? `${label}：${text}` : "";
    })
    .filter(Boolean);
}

function sentence(value: string) {
  const text = clean(value).replace(/[。；，、\s]+$/g, "");
  return text ? `${text}。` : "";
}

function featureList(row: PenRow) {
  return [
    usable(row.seriesName) ? `${usable(row.seriesName)} 系列` : "",
    publicField("年份", row.releaseYear)
      ? `${publicField("年份", row.releaseYear)} 年前后`
      : "",
    phraseOrigin(usable(row.originCountry)),
    usable(row.nib) ? `${usable(row.nib)}笔尖` : "",
    usable(row.fillSystem) ? `${usable(row.fillSystem)}上墨` : "",
    usable(row.material),
  ].filter(Boolean);
}

function identityParagraph(row: PenRow) {
  const name = displayName(row.name);
  const brand = row.brandName ? displayName(row.brandName) : "";
  const features = featureList(row);
  const relation =
    brand && !name.toLocaleLowerCase().includes(brand.toLocaleLowerCase())
      ? `${name} 是 ${brand} 体系下的钢笔型号`
      : `${name} 是一个钢笔型号`;
  const featureText =
    features.length > 0
      ? `目前可以确认的线索集中在${join(features, 5)}。`
      : "公开字段较少时，品牌关系、外观照片和来源卡片是辨认它的主要入口。";

  return `${relation}。${featureText}`;
}

function specParagraph(row: PenRow) {
  const name = displayName(row.name);
  const fields = fieldList(row);

  if (fields.length === 0) {
    return `${name} 的结构化规格还不完整，因此这页不把年份、材料、重量或价格写成确定结论。辨认这类条目时，最有用的信息通常是笔帽刻字、笔尖标识、上墨结构和包装目录。`;
  }

  const visibleFields = join(fields, 8);
  return `${name} 的型号档案记录了${visibleFields}。这些字段能帮助读者先建立基本印象：笔尖决定线条和纸面反馈，上墨方式影响储墨量与清洗难度，材料、尺寸和重量则会改变握持与携带感。`;
}

function usageParagraph(row: PenRow) {
  const nib = usable(row.nib);
  const fill = usable(row.fillSystem);
  const material = usable(row.material);
  const price = usable(row.priceRange);
  const parts: string[] = [];

  if (/14K|18K|21K|金尖|gold/i.test(nib)) {
    parts.push(
      "金尖配置通常让读者更关注弹性、回馈和长期书写的稳定性",
    );
  } else if (/钢尖|steel/i.test(nib)) {
    parts.push("钢尖配置把重点放在耐用、维护成本和日常可靠性");
  } else if (nib) {
    parts.push(`笔尖栏写作“${nib}”，说明阅读时应重点看尖号、打磨和是否容易替换`);
  }

  if (/活塞|piston/i.test(fill)) {
    parts.push("活塞上墨通常带来更高储墨量，适合长写，但清洗换墨需要更多耐心");
  } else if (/真空|vacuum/i.test(fill)) {
    parts.push("真空上墨的优势在大容量和长时间连续书写");
  } else if (/墨囊|上墨器|converter|cartridge/i.test(fill)) {
    parts.push("墨囊/上墨器结构方便清洗和换墨，也便于日常携带");
  } else if (fill) {
    parts.push(`上墨方式为“${fill}”，会影响储墨量、清洗难度和外出使用`);
  }

  if (/Makrolon|聚碳酸酯|树脂|赛璐璐|金属|不锈钢|黄铜|铝|木|漆/i.test(material)) {
    parts.push(`笔身材料“${material}”会改变触感、重量和长期磨损痕迹`);
  }

  if (price) {
    parts.push(`价位信息为“${price}”，适合和同品牌相近价格的型号放在一起比较`);
  }

  if (parts.length === 0) {
    return "实际书写表现主要取决于握持粗细、笔尖反馈、供墨稳定性和维护便利性；在缺少完整规格时，这四项比型号名本身更能说明日常体验。";
  }

  return `${displayName(row.name)} 的日用性可以从这些结构入手：${parts.join("；")}。`;
}

function comparisonParagraph(row: PenRow, sources: SourceRow[]) {
  const name = displayName(row.name);
  const brand = row.brandName ? displayName(row.brandName) : "";
  const names = join(
    sources
      .map((source) => source.sourceName || source.title)
      .filter((source) => !/Public web research index|Research index/i.test(source)),
    3,
  );
  const reference = names
    ? `现有来源包括 ${names} 等资料，可用来核对名称、实物图和规格。`
    : "现有来源有限时，这个条目更适合作为基础索引阅读。";
  const scope = brand
    ? `把它和 ${brand} 的相邻型号比较，最容易看清它在尺寸、笔尖、上墨和材料上的定位。`
    : "把它和相同上墨方式、相近价位或相似外形的条目比较，最容易看清定位。";

  return `${reference}${scope}${name} 如果有多个版本，优先按实物图、笔尖刻字、包装和卖家标注区分。`;
}

function assertReaderReady(slug: string, body: string) {
  const banned = body.match(BANNED_TEMPLATE_COPY);
  if (banned) {
    throw new Error(`Generated template copy for ${slug}: ${banned[0]}`);
  }
}

function buildStory(row: PenRow, sources: SourceRow[]) {
  const name = displayName(row.name);
  const series = usable(row.seriesName);
  const year = publicField("年份", row.releaseYear);
  const origin = phraseOrigin(usable(row.originCountry));
  const curated = CURATED_NOTES[row.slug] || [];

  const intro =
    curated[0] ||
    sentence(
      [
        identityParagraph(row),
        series && !name.includes(series) ? `它被归入 ${series} 系列` : "",
        year ? `年代信息记录为 ${year}` : "",
        origin ? `产地或品牌背景指向${origin}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );

  const specs =
    curated[1] || specParagraph(row);

  const design =
    curated[2] || usageParagraph(row);

  const story =
    curated[3] || comparisonParagraph(row, sources);

  const body = [intro, specs, design, story].join("\n\n");
  assertReaderReady(row.slug, body);
  return body;
}

async function getPens(db: Client) {
  return execute<PenRow>(
    db,
    `SELECT
       e.id AS entityId,
       e.slug,
       e.name,
       e.summary,
       s.id AS storyId,
       s.title AS storyTitle,
       s.body_md AS storyBody,
       ms.series_name AS seriesName,
       ms.release_year AS releaseYear,
       ms.origin_country AS originCountry,
       ms.nib,
       ms.fill_system AS fillSystem,
       ms.material,
       ms.dimensions,
       ms.weight,
       ms.price_range AS priceRange,
       ms.status,
       b.name AS brandName,
       b.slug AS brandSlug
     FROM entities e
     JOIN stories s ON s.entity_id = e.id AND s.story_type = 'model_story'
     LEFT JOIN model_specs ms ON ms.entity_id = e.id
     LEFT JOIN entities b ON b.id = ms.brand_entity_id
     WHERE e.type = 'pen'
     ORDER BY e.slug`,
  );
}

async function getSources(db: Client, row: PenRow) {
  return execute<SourceRow>(
    db,
    `SELECT DISTINCT si.title, sr.name AS sourceName, sr.source_type AS sourceType, si.item_type AS itemType
     FROM source_items si
     JOIN source_registry sr ON sr.id = si.source_id
     WHERE si.id IN (
       SELECT er.source_item_id FROM entity_references er WHERE er.entity_id = ? AND er.source_item_id IS NOT NULL
       UNION
       SELECT c.source_item_id FROM citations c WHERE c.target_id = ? AND c.source_item_id IS NOT NULL
       UNION
       SELECT cl.source_item_id FROM claims cl WHERE cl.subject_entity_id = ? AND cl.source_item_id IS NOT NULL
     )
     ORDER BY
       CASE WHEN sr.source_type = 'official' OR si.item_type LIKE 'official%' THEN 0 ELSE 1 END,
       sr.name,
       si.title
     LIMIT 8`,
    [row.entityId, row.storyId, row.entityId],
  );
}

async function main() {
  const db = getClient();
  const pens = await getPens(db);
  let changed = 0;
  let minLength = Number.POSITIVE_INFINITY;
  let internalCopyCount = 0;

  for (const pen of pens) {
    const sources = await getSources(db, pen);
    const body = buildStory(pen, sources);
    const title = `${displayName(pen.name)}：历史、设计与书写性格`;
    const summary = body.split(/\n\n/)[0].replace(/\*\*/g, "").slice(0, 180);
    minLength = Math.min(minLength, body.length);
    const internalMatch =
      body.match(INTERNAL_COPY) ||
      body.match(BANNED_TEMPLATE_COPY) ||
      title.match(INTERNAL_COPY);
    if (internalMatch) {
      internalCopyCount += 1;
      console.log(`internal-copy? ${pen.slug}: ${internalMatch[0]}`);
    }

    if (WRITE) {
      await db.execute({
        sql: `UPDATE stories
              SET title = ?, summary = ?, body_md = ?, status = CASE WHEN status = 'published' THEN status ELSE 'reviewed' END, updated_at = datetime('now')
              WHERE id = ?`,
        args: [title, summary, body, pen.storyId] as InArgs,
      });
    }
    changed += 1;
  }

  console.log(
    `${WRITE ? "Rewrote" : "Would rewrite"} ${changed} model Read first stories. Minimum length: ${minLength}. Internal-copy matches: ${internalCopyCount}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
