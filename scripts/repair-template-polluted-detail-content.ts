import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";

const WRITE = process.argv.includes("--write");

const POLLUTED_COPY =
  /使用体验要放到具体场景|公开信息主要来自|这些资料的价值不一样|关于销量、名人使用|更实用的比较方式|传闻不宜当成卖点|如果你正在考虑购买或收藏|不必只盯着某个参数|钢笔谱系中值得单独辨认的一支/;

type DetailCopy = {
  slug: string;
  entityType: "brand" | "article" | "nib" | "pen";
  name?: string;
  summary: string;
  bodyMd?: string;
  story?: {
    title: string;
    storyType: "brand_story" | "model_story" | "overview";
    summary: string;
    bodyMd: string;
    sourceNotes?: string;
  };
  spec?: {
    seriesName?: string;
    originCountry?: string;
    nib?: string;
    fillSystem?: string;
    material?: string;
    dimensions?: string;
    weight?: string;
    priceRange?: string;
    status?: string;
  };
  sourceItemIds?: string[];
};

type SourceDef = {
  source: {
    id: string;
    name: string;
    sourceType: "official" | "wikimedia" | "blog" | "retailer";
    allowedUse: "summary_only" | "link_only";
    reliability:
      | "official_marketing"
      | "high_for_basic_facts"
      | "community_opinion"
      | "medium";
    homepageUrl: string;
    attribution: string;
    notes: string;
  };
  item: {
    id: string;
    title: string;
    url: string;
    itemType: string;
    summary: string;
    reviewStatus?: "approved" | "needs_review";
  };
};

const SOURCE_DEFS: SourceDef[] = [
  {
    source: {
      id: "platinum-pen-usa",
      name: "Platinum Pen USA",
      sourceType: "official",
      allowedUse: "summary_only",
      reliability: "official_marketing",
      homepageUrl: "https://platinumpenusa.com/",
      attribution: "Platinum Pen USA",
      notes:
        "Official distributor page for Platinum product-family facts; summarize, do not copy marketing text.",
    },
    item: {
      id: "source-platinum-pen-usa-izumo-collection",
      title: "Platinum Pen USA: Izumo Collection",
      url: "https://platinumpenusa.com/luxury-writing/izumo-collection/",
      itemType: "official_product_family",
      summary:
        "Official Izumo collection page listing PIZ-55000 and PIZ-100000 variants with 18 kt gold nibs and F/M/B nib options.",
      reviewStatus: "approved",
    },
  },
  {
    source: {
      id: "endlesspens",
      name: "EndlessPens",
      sourceType: "retailer",
      allowedUse: "summary_only",
      reliability: "high_for_basic_facts",
      homepageUrl: "https://endlesspens.com/",
      attribution: "EndlessPens",
      notes:
        "Retail product specs are useful for dimensions, filling mechanism, material, and in-market product photos.",
    },
    item: {
      id: "source-endlesspens-platinum-izumo-18k",
      title: "EndlessPens: Platinum Fountain Pen - Izumo (18K)",
      url: "https://endlesspens.com/products/platinum-fountain-pen-izumo-18k-nib",
      itemType: "retailer_product_page",
      summary:
        "Retail spec page for Platinum Izumo 18K variants, including cartridge/converter filling, 18K gold nib, body materials, and dimensions.",
      reviewStatus: "approved",
    },
  },
  {
    source: {
      id: "clicky-post",
      name: "The Clicky Post",
      sourceType: "blog",
      allowedUse: "summary_only",
      reliability: "community_opinion",
      homepageUrl: "https://clickypost.com/",
      attribution: "The Clicky Post",
      notes:
        "Hands-on review source for usage impressions; use as secondary opinion, not definitive manufacturer data.",
    },
    item: {
      id: "source-clickypost-sailor-young-profit",
      title: "The Clicky Post: Sailor Young Profit Fountain Pen",
      url: "https://clickypost.com/blog/2015/4/19/sailor-young-profit-fountain-pen-m-nib-black-with-silver-trim",
      itemType: "review_article",
      summary:
        "Hands-on review identifying the Young Profit as a Sailor pen with a steel nib, Sailor cartridge use, and midrange daily-writing positioning.",
      reviewStatus: "approved",
    },
  },
  {
    source: {
      id: "pen-addict",
      name: "The Pen Addict",
      sourceType: "blog",
      allowedUse: "summary_only",
      reliability: "community_opinion",
      homepageUrl: "https://www.penaddict.com/",
      attribution: "The Pen Addict",
      notes:
        "Secondary review source for writing feel and quality-control impressions.",
    },
    item: {
      id: "source-penaddict-sailor-young-profit",
      title: "The Pen Addict: Sailor Young Profit",
      url: "https://www.penaddict.com/blog/2015/2/11/sailor-young-profit-a-tale-of-quality-control",
      itemType: "review_article",
      summary:
        "Review source for Sailor Young Profit writing feel; useful as one opinion source, not as a full product specification sheet.",
      reviewStatus: "approved",
    },
  },
  {
    source: {
      id: "wikipedia",
      name: "Wikipedia",
      sourceType: "wikimedia",
      allowedUse: "summary_only",
      reliability: "medium",
      homepageUrl: "https://www.wikipedia.org/",
      attribution: "Wikipedia contributors",
      notes:
        "Use only for broad background definitions; prefer official or specialist sources for model-specific facts.",
    },
    item: {
      id: "source-wikipedia-fountain-pen-nibs",
      title: "Wikipedia: Fountain pen - Nibs",
      url: "https://en.wikipedia.org/wiki/Fountain_pen#Nibs",
      itemType: "reference_article",
      summary:
        "General reference for fountain-pen nib materials, tipping, common sizes, and specialty nib shapes.",
      reviewStatus: "approved",
    },
  },
  {
    source: {
      id: "richardspens",
      name: "RichardsPens.com",
      sourceType: "blog",
      allowedUse: "summary_only",
      reliability: "high_for_basic_facts",
      homepageUrl: "https://richardspens.com/",
      attribution: "Richard Binder",
      notes:
        "Specialist fountain-pen reference site for nib basics and terminology.",
    },
    item: {
      id: "source-richardspens-nibs-basics",
      title: "RichardsPens.com: Nibs I - The Basics",
      url: "https://richardspens.com/ref/nibs/basics.htm",
      itemType: "reference_article",
      summary:
        "Specialist explanation of nib basics and nib shapes, used for general nib taxonomy context.",
      reviewStatus: "approved",
    },
  },
];

const DETAIL_FIXES: DetailCopy[] = [
  {
    slug: "duke",
    entityType: "brand",
    summary: "中国钢笔品牌，现有资料主要指向上海 G. Crown 制造与海外分销线索。",
    story: {
      title: "Duke：从上海制造商到海外分销的中国钢笔线索",
      storyType: "brand_story",
      summary:
        "Duke 的可核对资料集中在 Shanghai G. Crown Fountain Pen Co., Ltd. 和 Duke Pens Australia 的分销说明上。",
      bodyMd:
        "公爵（Duke）适合放在中国出口钢笔和制造商目录的脉络里阅读。现有来源中，GoldSupplier 的企业档案把 Shanghai G. Crown Fountain Pen Co., Ltd. 列为 1992 年成立的书写工具制造商；Duke Pens Australia 的历史页则把 Duke Pens range 与这家公司联系起来。对普通读者来说，这意味着 Duke 不是一个可以用单支笔概括的页面，而是一组品牌、制造、分销和具体型号共同组成的线索。\n\n看 Duke 时，最有用的入口是具体型号：同一品牌下可能出现不同笔尖、上墨方式、金属件和外观语言。品牌页负责说明这些型号为什么会被放在同一品牌房间里；型号页则负责回答“这支笔好不好用、是什么笔尖、怎样上墨、适合什么场景”。如果只看到“Duke 公爵”这样的泛称，优先把它当作品牌或系列索引，不要直接推断为某一支确定产品。\n\nDuke 的收藏和使用价值更依赖实物细节：笔帽刻字、笔尖标识、包装、卖家型号、是否有官方或经销目录。把这些信息和品牌页下方来源一起核对，比只看一句“国产钢笔”或一张商品图更可靠。",
      sourceNotes:
        "Based on GoldSupplier manufacturer profile and Duke Pens Australia distributor history; treat as manufacturer/distributor context.",
    },
  },
  {
    slug: "公爵-duke",
    entityType: "article",
    name: "公爵 Duke 品牌索引",
    summary: "公爵 Duke 的品牌索引页，不代表单一钢笔型号。",
    bodyMd:
      "“公爵 Duke”在这里是品牌索引，不是一支具体钢笔。Duke 相关资料里常同时出现品牌名、制造商、海外分销和零售标题；如果把这些信息都塞进一个“型号档案”，读者会误以为公爵只有一支标准产品。这个页面的作用，是把旧资料里的 Duke 泛称收拢到一个入口，再把具体可辨认的型号拆到各自页面。\n\n阅读顺序可以很简单：想了解品牌背景，先看[公爵品牌馆](/brand/duke)；想判断某支笔是否适合日用，要看具体型号页里的笔尖、上墨、材质和实物图。遇到只有“公爵钢笔”“Duke fountain pen”而没有型号的资料，先核对笔帽、笔尖刻字、包装和卖家标题，再决定它是否能拆成独立词条。\n\n因此，这页不会展示单支笔的产品图，也不会把钢尖、金属笔身或某个价格段写成整个 Duke 品牌的固定事实。它更像图书馆里的索引卡：帮助读者从泛称进入品牌房间，再找到真正对应的那一支笔。",
    story: {
      title: "公爵 Duke 品牌索引",
      storyType: "overview",
      summary: "Duke 泛称页用于连接品牌馆和具体型号页，不作为单一产品介绍。",
      bodyMd:
        "“公爵 Duke”是品牌索引，不是单一钢笔型号。它保留旧资料中的 Duke 泛称，帮助读者进入[公爵品牌馆](/brand/duke)，再按具体型号查看笔尖、上墨、材质和实物图。\n\n如果资料只写“Duke fountain pen”而没有型号，最重要的是核对笔帽、笔尖刻字、包装和零售标题。只有这些信息足够清楚时，才适合拆成独立型号页面。",
    },
  },
  {
    slug: "塞尔-3-0-ef尖",
    entityType: "nib",
    name: "塞尔 3.0 EF 尖",
    summary: "塞尔相关笔尖规格条目，重点解释 EF 细尖和笔尖辨认方式。",
    bodyMd:
      "“塞尔 3.0 EF 尖”更适合作为笔尖规格条目阅读，而不是一支完整钢笔。EF 通常指 Extra Fine，也就是比 F、M、B 更细的日常细尖；它适合小字、批注、格线本和需要控制墨量的纸张，但也更容易暴露纸张粗糙、墨水偏干或笔尖调校不佳的问题。这里的“3.0”更像产品或部件命名，需要靠实物、包装或官方规格确认，不能直接理解成 3.0 mm 线宽。\n\n笔尖分类不能只写“标准尖、圆珠尖、弹性尖”三项。常见维度至少包括线宽（EF、F、MF、M、B、BB）、形状（圆尖、Stub、Italic、Oblique）、用途型打磨（Music、Zoom、Fude/弯尖）和结构样式（明尖、暗尖、嵌入式、一体尖）。材质也不只钢尖，常见还有 14K、18K、21K 金尖，少数品牌会出现钛尖或其他合金；所谓“铱金”更多时候指硬质耐磨铱粒或市场叫法，不等于整支金尖。\n\n判断这类笔尖是否适合自己，要看三件事：实际线宽是否适合你的字大小，供墨是否能跟上书写速度，以及纸张是否能承受细尖的触感。只有回到搭载它的具体钢笔，才能进一步判断握持、上墨和整体重量。",
    story: {
      title: "塞尔 3.0 EF 尖：把细尖当作部件来读",
      storyType: "overview",
      summary:
        "EF 是细尖维度，3.0 需要按实物和来源确认，不应当写成独立钢笔型号。",
      bodyMd:
        "塞尔 3.0 EF 尖是笔尖规格条目。EF 通常指 Extra Fine，适合小字、批注和格线本，但对纸张、墨水和调校更敏感。“3.0”需要按包装、产品页或实物刻字确认，不宜直接解释成线宽。\n\n更完整的笔尖分类应同时看线宽、形状、用途型打磨、结构样式和材质。圆尖、Stub、Italic、Oblique、Music、Zoom、Fude/弯尖、暗尖、嵌入式笔尖，以及钢尖、14K/18K/21K 金尖，都属于读者比较钢笔时会遇到的常见维度。",
    },
    sourceItemIds: [
      "source-wikipedia-fountain-pen-nibs",
      "source-richardspens-nibs-basics",
    ],
  },
  {
    slug: "写乐-sailor-0501铱金",
    entityType: "pen",
    name: "写乐 Sailor Young Profit 0501",
    summary: "写乐 Young Profit / 0501 入门钢笔，重点在 Sailor 钢尖、树脂笔身和墨囊/上墨器结构。",
    story: {
      title: "写乐 Young Profit 0501：把“铱金”从金尖误会里拆出来",
      storyType: "model_story",
      summary:
        "Sailor 0501 更接近 Young Profit / 1911 Young Profit 入门钢笔，中文“铱金”不应直接理解成金尖。",
      bodyMd:
        "写乐 Sailor 0501 铱金可以按 Young Profit / 1911 Young Profit 这一类入门写乐钢笔来读。现有零售标题里常见 11-0501、Young Profit、黑身金夹等写法；二级评测也把它描述为树脂笔身、Sailor 专用墨囊/上墨器结构和装饰性较强的钢尖。它不是写乐 14K 或 21K 金尖体系里的旗舰，而是让读者以较低门槛接触 Sailor 笔尖风格的日用笔。\n\n中文“铱金”很容易误导。钢笔语境里，iridium 常指笔尖端部的硬质耐磨铱粒或类似铂族金属 tipping，今天的实际合金未必含有铱；它不等于 14K、18K 或 21K 金尖。把 0501 写成“铱金/钢尖”时，最稳妥的理解是：它是钢尖或镀金钢尖，笔尖端部有硬质耐磨 tipping。购买时应看清卖家标注的尖号、笔夹颜色、包装和是否附转换器。\n\n从使用角度看，Young Profit 的价值在于轻、细、维护简单。它适合课堂笔记、日常签写、小字和想体验 Sailor 反馈感的用户；如果你期待的是大尺寸金尖、强弹性或收藏级材料，就应该转向 1911、Professional Gear 或 King of Pens 等更高阶产品线。",
      sourceNotes:
        "Based on Amazon/retailer identifiers and secondary hands-on reviews; treat writing feel as review context.",
    },
    spec: {
      seriesName: "Young Profit / 0501",
      originCountry: "日本",
      nib: "钢尖/镀金钢尖，硬质 tipping",
      fillSystem: "Sailor 专用墨囊/上墨器",
      material: "树脂笔身",
      priceRange: "入门到中端，随市场变化",
      status: "历史/在售状态随地区变化",
    },
    sourceItemIds: [
      "source-clickypost-sailor-young-profit",
      "source-penaddict-sailor-young-profit",
      "source-wikipedia-fountain-pen-nibs",
    ],
  },
  {
    slug: "白金-platinum-出云-izumo",
    entityType: "pen",
    name: "白金 Platinum Izumo 出云",
    summary: "白金 Izumo 出云是偏高端工艺线的日本钢笔，常见 18K 金尖、生漆或木材版本和墨囊/上墨器结构。",
    story: {
      title: "白金 Izumo 出云：把和风工艺做成日用钢笔",
      storyType: "model_story",
      summary:
        "Platinum Izumo 出云属于白金的高端工艺线，重点在 18K 金尖、生漆或木材版本和克制的日本工艺气质。",
      bodyMd:
        "白金 Platinum Izumo 出云不是靠复杂机械结构取胜的钢笔，而是把日本工艺材料、较大的笔身比例和白金金尖放在一起。Platinum Pen USA 的 Izumo Collection 页面列出多个 PIZ-55000 / PIZ-100000 版本，核心信息包括 18 kt 金尖以及 F、M、B 等常见尖号；零售资料还会把部分版本写作硬橡胶或木材笔身、生漆处理、墨囊/上墨器上墨。读这支笔，重点不只是“好不好写”，而是它如何把材料、漆面、握持尺寸和金尖反馈合成一种安静的高端感。\n\nIzumo 的优势在触感和气质。生漆或木材版本通常不会像透明示范笔那样展示内部结构，也不像金属笔那样强调冰冷重量；它更接近一支长期握在手里、会随着使用留下细微痕迹的工艺笔。18K 金尖给了它高端书写预期，但真实软硬和顺滑度仍要看尖号、年份、版本和单支调校。\n\n如果你在购买或收藏 Izumo，最值得核对的是版本名、材料、漆面工艺、笔尖刻字、是否附原盒和上墨器。它适合喜欢日系金尖、偏克制外观和工艺材料的人；如果你更需要超大储墨量、透明可视化或低维护成本，Pilot Custom 823、Platinum #3776 Century 或其他日用旗舰会更容易比较。",
      sourceNotes:
        "Based on Platinum Pen USA official collection page plus retailer product specifications.",
    },
    spec: {
      seriesName: "Izumo",
      originCountry: "日本",
      nib: "18K 金尖，常见 F/M/B",
      fillSystem: "白金墨囊/上墨器",
      material: "生漆/硬橡胶或木材等版本",
      dimensions: "约 155 mm 闭合长度（按版本确认）",
      priceRange: "高端工艺线",
      status: "在售版本随地区变化",
    },
    sourceItemIds: [
      "source-platinum-pen-usa-izumo-collection",
      "source-endlesspens-platinum-izumo-18k",
    ],
  },
];

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
  return db.execute({ sql, args: args as InArgs });
}

async function findEntity(db: Client, slug: string) {
  const result = await execute(
    db,
    "SELECT id, type, name FROM entities WHERE slug = ?",
    [slug],
  );
  return result.rows[0] as
    | { id: string; type: string; name: string }
    | undefined;
}

async function upsertSources(db: Client) {
  for (const item of SOURCE_DEFS) {
    await execute(
      db,
      `INSERT INTO source_registry
       (id, name, source_type, allowed_use, reliability, attribution, homepage_url, fetch_method, notes, last_checked_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'manual', ?, date('now'), datetime('now'), datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         source_type = excluded.source_type,
         allowed_use = excluded.allowed_use,
         reliability = excluded.reliability,
         attribution = excluded.attribution,
         homepage_url = excluded.homepage_url,
         notes = excluded.notes,
         last_checked_at = excluded.last_checked_at,
         updated_at = datetime('now')`,
      [
        item.source.id,
        item.source.name,
        item.source.sourceType,
        item.source.allowedUse,
        item.source.reliability,
        item.source.attribution,
        item.source.homepageUrl,
        item.source.notes,
      ],
    );

    await execute(
      db,
      `INSERT INTO source_items
       (id, source_id, title, url, item_type, summary, allowed_use, review_status, retrieved_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, date('now'), datetime('now'), datetime('now'))
       ON CONFLICT(source_id, url) DO UPDATE SET
         title = excluded.title,
         item_type = excluded.item_type,
         summary = excluded.summary,
         allowed_use = excluded.allowed_use,
         review_status = excluded.review_status,
         retrieved_at = excluded.retrieved_at,
         updated_at = datetime('now')`,
      [
        item.item.id,
        item.source.id,
        item.item.title,
        item.item.url,
        item.item.itemType,
        item.item.summary,
        item.source.allowedUse,
        item.item.reviewStatus || "needs_review",
      ],
    );
  }
}

async function linkSources(
  db: Client,
  entityId: string,
  storyId: string | null,
  sourceItemIds: string[],
) {
  for (const sourceItemId of sourceItemIds) {
    await execute(
      db,
      `INSERT OR IGNORE INTO entity_references
       (id, entity_id, source_item_id, relation_type, note, review_status, created_at)
       VALUES (?, ?, ?, 'reference', 'Reader-facing content repair source', 'approved', datetime('now'))`,
      [randomUUID(), entityId, sourceItemId],
    );

    if (storyId) {
      await execute(
        db,
        `INSERT OR IGNORE INTO citations
         (id, target_type, target_id, source_item_id, note, created_at)
         VALUES (?, 'story', ?, ?, 'Reader-facing content repair source', datetime('now'))`,
        [randomUUID(), storyId, sourceItemId],
      );
    }
  }
}

async function upsertStory(
  db: Client,
  entityId: string,
  copy: NonNullable<DetailCopy["story"]>,
) {
  const existing = await execute(
    db,
    "SELECT id FROM stories WHERE entity_id = ? AND story_type = ? LIMIT 1",
    [entityId, copy.storyType],
  );
  const oldId = existing.rows[0]?.id;
  const storyId = oldId ? String(oldId) : randomUUID();

  if (oldId) {
    await execute(
      db,
      `UPDATE stories
       SET title = ?, summary = ?, body_md = ?, status = 'reviewed', source_notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        copy.title,
        copy.summary,
        copy.bodyMd,
        copy.sourceNotes || "Reader-facing copy repaired from public sources.",
        storyId,
      ],
    );
  } else {
    await execute(
      db,
      `INSERT INTO stories
       (id, entity_id, title, story_type, summary, body_md, status, source_notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'reviewed', ?, datetime('now'), datetime('now'))`,
      [
        storyId,
        entityId,
        copy.title,
        copy.storyType,
        copy.summary,
        copy.bodyMd,
        copy.sourceNotes || "Reader-facing copy repaired from public sources.",
      ],
    );
  }

  return storyId;
}

async function demoteNonDisplayedModelStories(db: Client) {
  const result = await execute(
    db,
    `SELECT s.id, e.name, e.summary, e.body_md
     FROM stories s
     JOIN entities e ON e.id = s.entity_id
     WHERE e.type IN ('article', 'nib')
       AND s.story_type = 'model_story'
       AND (
         s.body_md LIKE '%使用体验要放到具体场景%'
         OR s.body_md LIKE '%公开信息主要来自%'
         OR s.body_md LIKE '%关于销量、名人使用%'
         OR s.body_md LIKE '%更实用的比较方式%'
       )`,
  );

  for (const row of result.rows) {
    const name = String(row.name);
    const body = String(row.body_md || row.summary || `${name} 是资料索引条目。`);
    await execute(
      db,
      `UPDATE stories
       SET title = ?, story_type = 'overview', summary = ?, body_md = ?, status = 'reviewed',
           source_notes = 'Converted stale model story into overview copy.',
           updated_at = datetime('now')
       WHERE id = ?`,
      [name, String(row.summary || name), body, String(row.id)],
    );
  }

  return result.rows.length;
}

async function applyDetailFix(db: Client, copy: DetailCopy) {
  const entity = await findEntity(db, copy.slug);
  if (!entity) {
    console.warn(`Missing entity: ${copy.slug}`);
    return null;
  }

  if (copy.bodyMd || copy.name) {
    await execute(
      db,
      `UPDATE entities
       SET name = ?, summary = ?, body_md = COALESCE(?, body_md), updated_at = datetime('now')
       WHERE id = ?`,
      [copy.name || entity.name, copy.summary, copy.bodyMd || null, entity.id],
    );
  } else {
    await execute(
      db,
      "UPDATE entities SET summary = ?, updated_at = datetime('now') WHERE id = ?",
      [copy.summary, entity.id],
    );
  }

  let storyId: string | null = null;
  if (copy.story) {
    storyId = await upsertStory(db, entity.id, copy.story);
  }

  if (copy.spec) {
    await execute(
      db,
      `UPDATE model_specs
       SET series_name = COALESCE(?, series_name),
           origin_country = COALESCE(?, origin_country),
           nib = COALESCE(?, nib),
           fill_system = COALESCE(?, fill_system),
           material = COALESCE(?, material),
           dimensions = COALESCE(?, dimensions),
           weight = COALESCE(?, weight),
           price_range = COALESCE(?, price_range),
           status = COALESCE(?, status),
           review_status = 'approved',
           updated_at = datetime('now')
       WHERE entity_id = ?`,
      [
        copy.spec.seriesName || null,
        copy.spec.originCountry || null,
        copy.spec.nib || null,
        copy.spec.fillSystem || null,
        copy.spec.material || null,
        copy.spec.dimensions || null,
        copy.spec.weight || null,
        copy.spec.priceRange || null,
        copy.spec.status || null,
        entity.id,
      ],
    );
  }

  if (copy.sourceItemIds) {
    await linkSources(db, entity.id, storyId, copy.sourceItemIds);
  }

  return copy.slug;
}

async function countPolluted(db: Client) {
  const result = await execute(
    db,
    `SELECT COUNT(*) AS count FROM stories
     WHERE body_md LIKE '%使用体验要放到具体场景%'
        OR body_md LIKE '%公开信息主要来自%'
        OR body_md LIKE '%这些资料的价值不一样%'
        OR body_md LIKE '%关于销量、名人使用%'
        OR body_md LIKE '%更实用的比较方式%'
        OR body_md LIKE '%传闻不宜当成卖点%'
        OR body_md LIKE '%如果你正在考虑购买或收藏%'
        OR body_md LIKE '%不必只盯着某个参数%'
        OR body_md LIKE '%钢笔谱系中值得单独辨认的一支%'`,
  );
  return Number(result.rows[0]?.count || 0);
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");

  const before = await countPolluted(db);
  console.log(`Polluted stories before repair: ${before}`);

  for (const copy of DETAIL_FIXES) {
    const text = [copy.bodyMd, copy.story?.bodyMd].filter(Boolean).join("\n");
    if (POLLUTED_COPY.test(text)) {
      throw new Error(`Repair copy still contains banned template phrase: ${copy.slug}`);
    }
  }

  if (!WRITE) {
    console.log(`Would repair ${DETAIL_FIXES.length} focused detail page(s).`);
    console.log("Dry run only. Re-run with --write to update the database.");
    return;
  }

  await upsertSources(db);
  const demoted = await demoteNonDisplayedModelStories(db);
  const changed: string[] = [];
  for (const copy of DETAIL_FIXES) {
    const slug = await applyDetailFix(db, copy);
    if (slug) changed.push(slug);
  }

  const after = await countPolluted(db);
  if (after > 0) {
    throw new Error(`Polluted stories remain after repair: ${after}`);
  }

  console.log(`Demoted stale article/nib model stories: ${demoted}`);
  console.log(`Focused detail pages repaired: ${changed.join(", ")}`);
  console.log(`Polluted stories after repair: ${after}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
