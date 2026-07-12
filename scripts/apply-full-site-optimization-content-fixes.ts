import { execute } from "@/lib/db";

const SUMMARY_FIXES = [
  {
    slug: "sailor",
    summary:
      "常与 Pilot、Platinum 并称日系三大钢笔品牌，以笔尖调校和特殊笔尖讨论闻名",
  },
  {
    slug: "platinum",
    summary:
      "常与 Pilot、Sailor 并称日系三大钢笔品牌，3776 Century 因密封结构和入门金尖定位常被讨论",
  },
  {
    slug: "montblanc",
    summary:
      "德国奢侈书写工具品牌，大班 Meisterstück 是正装钢笔讨论中的核心参照",
  },
  {
    slug: "parker",
    summary:
      "美国经典品牌，Parker 51 常被视为 20 世纪最重要、最成功的钢笔之一",
  },
  {
    slug: "majohn",
    summary:
      "中国品牌（原名 Moonman），A1 是现代低价国产按动钢笔的代表入口",
  },
  {
    slug: "mg",
    summary: "中国大型文具品牌，按动钢笔更接近学生和入门文具线",
  },
];

const TEXT_REPLACEMENTS = [
  [
    "写乐 (Sailor) 是日本三大钢笔品牌之一，以笔尖调教闻名，长刀研是旗舰系列。",
    "写乐 (Sailor) 常与 Pilot、Platinum 并称日系三大钢笔品牌，以笔尖调校和特殊笔尖讨论闻名。",
  ],
  [
    "白金 (Platinum) 是日本三大钢笔品牌之一，3776系列性价比突出。",
    "白金 (Platinum) 常与 Pilot、Sailor 并称日系三大钢笔品牌，3776 Century 因密封结构和入门金尖定位常被讨论。",
  ],
  [
    "派克 (Parker) 是美国经典品牌，51 是史上最成功的钢笔。",
    "派克 (Parker) 是美国经典品牌，Parker 51 常被视为 20 世纪最重要、最成功的钢笔之一。",
  ],
  [
    "末匠 (Majohn) 是中国品牌（原名 Moonman），A1 按动笔开创国产先河。",
    "末匠 (Majohn) 是中国品牌（原名 Moonman），A1 是现代低价国产按动钢笔的代表入口。",
  ],
  [
    "晨光 (M&G) 是中国最大文具品牌，按动钢笔是入门产品。",
    "晨光 (M&G) 是中国大型文具品牌，按动钢笔更接近学生和入门文具线。",
  ],
];

async function main() {
  for (const item of SUMMARY_FIXES) {
    await execute(
      "UPDATE entities SET summary = ?, updated_at = datetime('now') WHERE slug = ?",
      [item.summary, item.slug],
    );
  }

  for (const [from, to] of TEXT_REPLACEMENTS) {
    await execute(
      `UPDATE stories
       SET body_md = replace(body_md, ?, ?),
           summary = replace(COALESCE(summary, ''), ?, ?),
           updated_at = datetime('now')
       WHERE body_md LIKE '%' || ? || '%' OR summary LIKE '%' || ? || '%'`,
      [from, to, from, to, from, from],
    );
  }

  await execute(
    `UPDATE source_items
     SET review_status = 'needs_review',
         updated_at = datetime('now')
     WHERE url LIKE 'https://www.bing.com/search%'`,
  );

  console.log("Applied full-site optimization content fixes.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
