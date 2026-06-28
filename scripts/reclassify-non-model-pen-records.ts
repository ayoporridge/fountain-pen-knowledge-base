import { createClient, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");

type Correction = {
  slug: string;
  type: "article" | "nib";
  name: string;
  summary: string;
  bodyMd: string;
};

const CORRECTIONS: Correction[] = [
  {
    slug: "万特佳",
    type: "article",
    name: "万特佳品牌资料索引",
    summary: "品牌资料索引，不代表单一钢笔型号。",
    bodyMd:
      "这是一个品牌资料索引，用来承接旧资料里对“万特佳 / Monteverde”的泛称引用，不代表某一支具体钢笔。想了解品牌本身，可以从[万特佳品牌馆](/brand/monteverde)进入；想比较具体产品，则应阅读带有明确型号名的页面。这里保留为索引条目，是为了让旧来源、关系图谱和搜索结果仍然能找到对应品牌线索，而不是把品牌名误当成一支需要配实物图的钢笔。",
  },
  {
    slug: "公爵-duke",
    type: "article",
    name: "公爵品牌资料索引",
    summary: "品牌资料索引，不代表单一钢笔型号。",
    bodyMd:
      "这是一个品牌资料索引，用来承接旧资料里对“公爵 / Duke”的泛称引用，不代表某一支具体钢笔。公爵旗下有多个不同定位和外观的型号，不能用一张产品图概括整个品牌。想了解品牌本身，可以从[公爵品牌馆](/brand/duke)进入；想判断某支笔的笔尖、上墨方式和做工表现，应阅读具体型号页面。",
  },
  {
    slug: "半句",
    type: "article",
    name: "半句品牌资料索引",
    summary: "品牌资料索引，不代表单一钢笔型号。",
    bodyMd:
      "这是一个品牌资料索引，用来承接旧资料里对“半句 / BanJu”的泛称引用，不代表某一支具体钢笔。由于品牌名和型号名在旧资料中常被混用，这里不再显示型号档案或产品图，避免把单一图片误认为整个品牌的代表。想继续阅读品牌资料，可以从[半句品牌馆](/brand/banju)进入。",
  },
  {
    slug: "永续",
    type: "article",
    name: "永续品牌资料索引",
    summary: "品牌资料索引，不代表单一钢笔型号。",
    bodyMd:
      "这是一个品牌资料索引，用来承接旧资料里对“永续 / YongXu”的泛称引用，不代表某一支具体钢笔。品牌泛称页面不适合展示单支笔的笔尖、上墨方式或实物图；这些信息只有在具体型号页面上才有意义。想了解品牌关系和后续整理出的型号，可以从[永续品牌馆](/brand/yongxu)进入。",
  },
  {
    slug: "犀飞利-sheaffer-品牌泛称",
    type: "article",
    name: "犀飞利品牌资料索引",
    summary: "品牌资料索引，不代表单一钢笔型号。",
    bodyMd:
      "这是一个品牌资料索引，用来承接旧资料里对“犀飞利 / Sheaffer”的泛称引用，不代表某一支具体钢笔。Sheaffer 的历史型号很多，笔尖、上墨系统和价格区间差异很大，不能用一组型号档案概括。想了解品牌脉络，可以从[犀飞利品牌馆](/brand/sheaffer)进入；想看具体产品，应阅读帝国、胜利、Tuckaway 等明确型号页面。",
  },
  {
    slug: "坛笔-penbbs-金尖大明尖",
    type: "nib",
    name: "PenBBS 金尖 / 大明尖",
    summary: "笔尖与版本资料，不是独立钢笔型号。",
    bodyMd:
      "“PenBBS 金尖 / 大明尖”更适合作为笔尖和版本资料来读，而不是独立钢笔型号。它描述的是 PenBBS 部分产品或版本会涉及的笔尖配置、命名和用户辨认方式；真正决定外观、上墨结构和握持感的，仍然是它搭载在哪一支具体钢笔上。页面保留这个条目，是为了让读者在关系图谱里区分“笔尖配置”和“钢笔型号”，避免把一个笔尖版本误认为一支完整产品。",
  },
  {
    slug: "塞尔-3-0-ef尖",
    type: "nib",
    name: "塞尔 3.0 EF 尖",
    summary: "笔尖规格资料，不是独立钢笔型号。",
    bodyMd:
      "“塞尔 3.0 EF 尖”是一个笔尖规格资料条目，不是一支独立钢笔。它更适合用来说明某些塞尔相关产品中的笔尖口径、线宽和书写反馈，而不是展示产品图或型号档案。读者在比较具体钢笔时，可以把它理解为影响线条粗细和纸面触感的部件信息；要判断整支笔是否适合日用，还需要回到具体型号页面看笔身、上墨方式和握持尺寸。",
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

async function main() {
  const db = getClient();
  let changed = 0;

  for (const correction of CORRECTIONS) {
    const existing = await db.execute({
      sql: "SELECT id, type, name FROM entities WHERE slug = ?",
      args: [correction.slug] as InArgs,
    });
    const row = existing.rows[0];
    if (!row) {
      console.log(`- missing ${correction.slug}`);
      continue;
    }

    console.log(
      `- ${WRITE ? "reclassify" : "would reclassify"} ${correction.slug}: ${row.type} -> ${correction.type}`,
    );
    if (!WRITE) continue;

    await db.execute({
      sql: `UPDATE entities
            SET type = ?, name = ?, summary = ?, body_md = ?, updated_at = datetime('now')
            WHERE id = ?`,
      args: [
        correction.type,
        correction.name,
        correction.summary,
        correction.bodyMd,
        row.id,
      ] as InArgs,
    });
    await db.execute({
      sql: `DELETE FROM citations
            WHERE target_type = 'model_spec'
              AND target_id IN (SELECT id FROM model_specs WHERE entity_id = ?)`,
      args: [row.id] as InArgs,
    });
    await db.execute({
      sql: "DELETE FROM model_specs WHERE entity_id = ?",
      args: [row.id] as InArgs,
    });
    changed += 1;
  }

  if (WRITE) {
    await db.execute({
      sql: `DELETE FROM citations
            WHERE target_type = 'model_spec'
              AND NOT EXISTS (
                SELECT 1 FROM model_specs ms WHERE ms.id = citations.target_id
              )`,
    });
  }

  console.log(`Done. ${WRITE ? changed : CORRECTIONS.length} ${WRITE ? "updated" : "candidate"} record(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
