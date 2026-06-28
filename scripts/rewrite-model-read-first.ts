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
  /待核验|资料补证|研究队列|待拆分|待重分类|当前草稿|待补来源|资料边界|来源边界|待合并|待归因|方便读者确认|公开来源没有直接支撑|未由来源支撑|写成确定事实|可以先放在|currently needs|verified facts|research-queue|brand[- ]?generic|Research index/i;

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
]);

const CURATED_NOTES: Record<string, string[]> = {
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
    "149 的使用体验通常和“大尺寸”“重心”“大笔尖”联系在一起：握持空间充足，视觉仪式感强，长时间书写是否舒服则取决于手型和对笔身粗细的接受程度。它的故事性很强，既有 Meisterstuck 系列的品牌历史，也有大量版本、年代和笔尖差异形成的收藏语境。",
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

function sourceLabel(sources: SourceRow[]) {
  const official = sources.filter(
    (source) =>
      source.sourceType === "official" || source.itemType.startsWith("official"),
  );
  const community = sources.filter((source) =>
    /reddit|forum|review|blog|community/i.test(
      `${source.sourceName} ${source.sourceType} ${source.itemType}`,
    ),
  );
  const reference = sources.filter(
    (source) => !official.includes(source) && !community.includes(source),
  );

  const officialNames = join(
    official.map((source) => source.sourceName || source.title),
    2,
  );
  const communityNames = join(
    community.map((source) => source.sourceName || source.title),
    2,
  );
  const referenceNames = join(
    reference.map((source) => source.sourceName || source.title),
    2,
  );

  const parts = [
    officialNames ? `官方资料（${officialNames}）` : "",
    communityNames ? `社区讨论或评测（${communityNames}）` : "",
    referenceNames ? `资料索引（${referenceNames}）` : "",
  ].filter(Boolean);

  return parts.join("、");
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
      const text = usable(value);
      return text ? `${label}：${text}` : "";
    })
    .filter(Boolean);
}

function writingFeel(row: PenRow) {
  const nib = usable(row.nib);
  const fill = usable(row.fillSystem);
  const material = usable(row.material);
  const parts: string[] = [];

  if (/14K|18K|21K|金尖|gold/i.test(nib)) {
    parts.push(
      "金尖让它在纸面反馈和弹性上有更高期待，但真实软硬仍取决于尖号、年代和单支调校",
    );
  } else if (/钢尖|steel/i.test(nib)) {
    parts.push("钢尖通常更强调耐用、成本和日常维护，适合把重点放在稳定性和易用性上");
  } else if (nib) {
    parts.push(`笔尖信息可以从“${nib}”入手，重点看尖号、打磨和是否容易更换`);
  }

  if (/活塞|piston/i.test(fill)) {
    parts.push("活塞上墨带来较好的储墨量，也让清洗和换墨比普通上墨器更需要耐心");
  } else if (/真空|vacuum/i.test(fill)) {
    parts.push("真空上墨的吸墨动作和大容量是主要卖点，长写时优势明显");
  } else if (/墨囊|上墨器|converter|cartridge/i.test(fill)) {
    parts.push("墨囊/上墨器结构更容易维护，适合频繁换墨或通勤携带");
  } else if (fill) {
    parts.push(`上墨方式是“${fill}”，会直接影响储墨量、清洗难度和外出使用习惯`);
  }

  if (/Makrolon|聚碳酸酯|树脂|赛璐璐|金属|不锈钢|黄铜|铝|木|漆/i.test(material)) {
    parts.push(`笔身材料“${material}”决定了它的触感、重量和长期使用痕迹`);
  }

  if (parts.length === 0) {
    return "实际书写体验可以从握持粗细、笔尖反馈、供墨稳定性和清洗维护四件事判断；这些因素往往比型号名本身更影响日常使用。";
  }

  return `${parts.join("；")}。`;
}

function reputationParagraph(row: PenRow, sources: SourceRow[]) {
  const labels = sourceLabel(sources);
  const name = displayName(row.name);

  if (labels) {
    return `从已收录资料看，${name} 的公开信息主要来自${labels}。阅读评价时可以把“规格表”和“长期使用反馈”分开看：前者帮助确认版本、材料和上墨方式，后者才更接近真实手感、品控差异和维护成本。`;
  }

  return `${name} 的可核对资料还不算集中，因此阅读时更适合把它当作一个产品入口：先确认品牌、外观、笔尖和上墨方式，再把电商图、目录图、评测和用户实拍放在一起比较。`;
}

function buildStory(row: PenRow, sources: SourceRow[]) {
  const name = displayName(row.name);
  const brand = row.brandName ? displayName(row.brandName) : "";
  const series = usable(row.seriesName);
  const year = usable(row.releaseYear);
  const origin = usable(row.originCountry);
  const fields = fieldList(row);
  const curated = CURATED_NOTES[row.slug] || [];

  const contextParts = [
    brand ? `${brand} 的产品线` : "钢笔谱系",
    series && !name.includes(series) ? `${series} 系列` : "",
    year ? `${year} 年前后` : "",
    origin ? `${origin} 制造或品牌语境` : "",
  ].filter(Boolean);
  const contextText = contextParts.join("、") || "钢笔用途和外观设计";

  const intro =
    curated[0] ||
    `${name} 可以从${contextText}这个角度进入。它不是只看价格或外观就能判断的型号；更有用的读法，是把品牌背景、笔尖、上墨方式、材料和实际使用场景放在一起看。`;

  const specs =
    fields.length > 0
      ? `这支笔最值得先看的硬信息是 ${join(fields, 7)}。这些信息能帮助读者快速判断它偏向随身日用、长时间书写、收藏展示，还是作为某种上墨机制或笔尖体系的代表。`
      : `这支笔目前更适合从外观、品牌、笔尖和上墨方式进入。没有稳定规格时，读者应优先观察产品实拍、笔帽刻字、笔尖形态和包装目录，因为这些细节比二手转述更能区分版本。`;

  const design =
    curated[1] ||
    `设计上，${name} 的看点不只在单个参数，而在这些参数组合出来的使用性格。${writingFeel(row)}如果你正在考虑购买或收藏，最需要对照的是自己的握笔姿势、常用纸张、写字大小和是否愿意维护复杂上墨结构。`;

  const reputation = reputationParagraph(row, sources);

  const story =
    curated[2] ||
    `如果你关心销量、名人使用或特殊故事，最可靠的做法是把广告、目录、访谈和长期评测对应起来；在缺少材料时，不把传闻当成核心判断。对普通读者来说，更实用的判断方式是看它在同品牌相邻型号中的位置：如果它强调大容量、金尖或特殊材料，就适合和同价位的日用旗舰比较；如果它强调便携或入门价格，就应重点看维护成本和长期可靠性。`;

  return [intro, specs, design, reputation, story].join("\n\n");
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
    const internalMatch = body.match(INTERNAL_COPY) || title.match(INTERNAL_COPY);
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
