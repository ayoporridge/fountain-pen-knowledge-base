import { createClient, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");

const STORY_BODY = [
  "英雄 1997型18K金笔 的重点不是普通日用参数，而是它和 1997 年香港回归这一历史场景的关系。英雄官网介绍，1997 年 7 月 1 日香港回归前后，英雄制笔工人历时半年设计铸造了这款纪念金笔；上观新闻也提到，这支笔属于英雄金笔见证香港回归、澳门回归和中国加入世贸组织等重要场合的叙事脉络。",
  "从产品角度看，它更像一支纪念限量笔，而不是单纯按价格或笔尖粗细来判断的日常书写工具。公开资料明确写到“英雄1997型18K金笔”共生产 1997 支，最后一个编号赠予时任香港特首董建华。对读者来说，这意味着它的价值主要来自纪念主题、限量编号、18K 金笔身份和英雄品牌历史，而不是普通在售钢笔的颜色、尖号或供墨规格。",
  "如果你在二手或收藏市场看到这类笔，最值得先核对的是外盒、编号、笔身刻字、笔尖标识和随附文件。纪念笔常见的问题不是“是否好写”这么简单，而是版本是否对应、附件是否完整、图片是否能看清关键标记。把它放回英雄品牌历史中阅读，比只把它当成“上海 97回归”这样的模糊型号名更准确。",
].join("\n\n");

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function main() {
  const db = getClient();
  const entityResult = await db.execute({
    sql: "SELECT id, name FROM entities WHERE slug = ?",
    args: ["上海-shanghai-97回归"] as InArgs,
  });
  const entity = entityResult.rows[0];
  if (!entity) throw new Error("Missing entity 上海-shanghai-97回归");

  const brandResult = await db.execute({
    sql: "SELECT id FROM entities WHERE slug = ? AND type = 'brand'",
    args: ["hero"] as InArgs,
  });
  const brand = brandResult.rows[0];
  if (!brand) throw new Error("Missing brand hero");

  console.log(
    `${WRITE ? "Fixing" : "Would fix"} 上海-shanghai-97回归: ${entity.name} -> 英雄 Hero 1997型18K金笔`,
  );
  if (!WRITE) return;

  await db.execute({
    sql: `UPDATE entities
          SET name = ?,
              summary = ?,
              body_md = ?,
              source_url = COALESCE(source_url, ?),
              updated_at = datetime('now')
          WHERE id = ?`,
    args: [
      "英雄 Hero 1997型18K金笔",
      "1997年香港回归纪念限量金笔；英雄官方资料称共生产1997支。",
      `# 英雄 Hero 1997型18K金笔\n\n${STORY_BODY}`,
      "https://hero.com.cn/news-detail/30.html",
      entity.id,
    ] as InArgs,
  });

  await db.execute({
    sql: `UPDATE model_specs
          SET brand_entity_id = ?,
              series_name = ?,
              release_year = ?,
              origin_country = ?,
              nib = ?,
              fill_system = ?,
              material = ?,
              price_range = ?,
              status = ?,
              review_status = 'approved',
              updated_at = datetime('now')
          WHERE entity_id = ?`,
    args: [
      brand.id,
      "1997型18K金笔",
      "1997",
      "中国",
      "18K金尖",
      null,
      "纪念金笔",
      "收藏市场价格随品相与附件浮动",
      "香港回归纪念限量1997支",
      entity.id,
    ] as InArgs,
  });

  await db.execute({
    sql: `UPDATE stories
          SET title = ?,
              summary = ?,
              body_md = ?,
              status = CASE WHEN status = 'published' THEN status ELSE 'reviewed' END,
              updated_at = datetime('now')
          WHERE entity_id = ? AND story_type = 'model_story'`,
    args: [
      "英雄 1997型18K金笔：香港回归纪念金笔",
      "英雄 1997型18K金笔是一支与香港回归相关的纪念限量金笔，公开资料明确提到共生产1997支。",
      STORY_BODY,
      entity.id,
    ] as InArgs,
  });

  await db.execute({
    sql: `DELETE FROM entity_links
          WHERE source_id = ? OR target_id = ?`,
    args: [entity.id, entity.id] as InArgs,
  });
  await db.execute({
    sql: `INSERT INTO entity_links (id, source_id, target_id, link_type, reason)
          VALUES
            (?, ?, ?, 'made_by', ?),
            (?, ?, ?, 'brand_model', ?)`,
    args: [
      "link-hero-1997-made-by-hero",
      entity.id,
      brand.id,
      "Corrected brand attribution for Hero 1997 Hong Kong handover commemorative pen.",
      "link-brand-model-hero-1997",
      brand.id,
      entity.id,
      "Hero brand model relation for the 1997 Hong Kong handover commemorative pen.",
    ] as InArgs,
  });

  await db.execute({
    sql: `DELETE FROM entity_tags
          WHERE entity_id = ?
            AND tag_id IN (
              SELECT id FROM tags
              WHERE slug IN ('nibmat-steel', 'nib-standard', 'nibmat-18k', 'nibmat-gold')
            )`,
    args: [entity.id] as InArgs,
  });
  await db.execute({
    sql: `INSERT INTO entity_tags (id, entity_id, tag_id)
          SELECT ?, ?, id FROM tags WHERE slug = 'nibmat-18k'
          UNION ALL
          SELECT ?, ?, id FROM tags WHERE slug = 'nibmat-gold'`,
    args: [
      "etag-hero-1997-nibmat-18k",
      entity.id,
      "etag-hero-1997-nibmat-gold",
      entity.id,
    ] as InArgs,
  });

  console.log("Done. 1 model record updated.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
