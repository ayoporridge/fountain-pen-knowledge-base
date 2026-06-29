import { createClient, type Client, type InArgs } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const WRITE = process.argv.includes("--write");
const batchArg = process.argv
  .filter((arg) => !arg.startsWith("--") && arg.endsWith(".ts"))
  .at(-1);

type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  humanizer: {
    directness: number;
    rhythm: number;
    trust: number;
    authenticity: number;
    concision: number;
    notes: string;
  };
};

type Batch = {
  label: string;
  reviewPath: string;
  minChars: number;
  maxChars: number;
  citationNote: string;
  articles: Article[];
};

const BANNED_PATTERNS: Array<[RegExp, string]> = [
  [/有人说.*有人说.*还有人说/s, "有人说三连"],
  [/不是[^。；\n]{0,80}而是/s, "不是而是"],
  [/不仅[^。；\n]{0,80}而且/s, "不仅而且"],
  [/型号档案记录了|现有来源包括|优先按实物图|日用性可以从这些结构入手/, "后台资料卡话术"],
  [/作为[^。；\n]{0,80}(体现|证明|提醒|标志)/, "作为体现类句式"],
  [/标志着|见证了|至关重要|关键作用|持久影响|复杂格局/, "AI 抽象意义词"],
  [/值得注意的是|此外|然而|总的来说|综上/, "AI 连接词"],
  [/很多人认为|行业专家指出|一些批评者认为|多个来源显示/, "模糊归因"],
  [/后续应|可以作为|应把它放在|方便读者确认|资料不足|当前档案|当前页面|研究队列/, "策展/维护提示语"],
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

function humanizerTotal(article: Article) {
  const score = article.humanizer;
  return score.directness + score.rhythm + score.trust + score.authenticity + score.concision;
}

function validateArticle(article: Article, batch: Batch) {
  const failures: string[] = [];
  for (const [pattern, label] of BANNED_PATTERNS) {
    if (pattern.test(article.body) || pattern.test(article.title) || pattern.test(article.summary)) {
      failures.push(label);
    }
  }
  const total = humanizerTotal(article);
  if (total < 45) failures.push(`humanizer score ${total}/50`);
  if (article.body.length < batch.minChars) {
    failures.push(`too short ${article.body.length}; expected at least ${batch.minChars}`);
  }
  if (article.body.length > batch.maxChars) {
    failures.push(`too long ${article.body.length}; expected at most ${batch.maxChars}`);
  }
  return failures;
}

async function findEntity(db: Client, slug: string) {
  const result = await execute(
    db,
    "SELECT id, name FROM entities WHERE slug = ? AND type = 'pen' LIMIT 1",
    [slug],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { id: String(row.id), name: String(row.name) };
}

async function getExistingSourceItems(db: Client, entityId: string) {
  const result = await execute(
    db,
    `SELECT si.id, sr.name AS source_name, sr.source_type, si.title, si.url
     FROM entity_references er
     JOIN source_items si ON si.id = er.source_item_id
     JOIN source_registry sr ON sr.id = si.source_id
     WHERE er.entity_id = ?
     ORDER BY
       CASE sr.source_type
         WHEN 'official' THEN 0
         WHEN 'blog' THEN 1
         WHEN 'forum' THEN 2
         WHEN 'reddit' THEN 3
         WHEN 'retailer' THEN 4
         ELSE 5
       END,
       sr.name,
       si.title`,
    [entityId],
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    sourceName: String(row.source_name),
    sourceType: String(row.source_type),
    title: String(row.title),
    url: String(row.url),
  }));
}

async function upsertStory(db: Client, entityId: string, article: Article, batch: Batch) {
  const existing = await execute(
    db,
    "SELECT id FROM stories WHERE entity_id = ? AND story_type = 'model_story' LIMIT 1",
    [entityId],
  );
  const storyId = existing.rows[0]?.id ? String(existing.rows[0].id) : randomUUID();
  const sourceNotes = `${batch.label}. Humanizer-zh self-review: ${humanizerTotal(article)}/50. ${article.humanizer.notes}`;

  if (existing.rows[0]?.id) {
    await execute(
      db,
      `UPDATE stories
       SET title = ?, summary = ?, body_md = ?, status = 'reviewed', source_notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [article.title, article.summary, article.body, sourceNotes, storyId],
    );
  } else {
    await execute(
      db,
      `INSERT INTO stories
       (id, entity_id, title, story_type, summary, body_md, status, source_notes, created_at, updated_at)
       VALUES (?, ?, ?, 'model_story', ?, ?, 'reviewed', ?, datetime('now'), datetime('now'))`,
      [storyId, entityId, article.title, article.summary, article.body, sourceNotes],
    );
  }

  return storyId;
}

async function citeExistingSources(db: Client, storyId: string, sourceItemIds: string[], batch: Batch) {
  for (const sourceItemId of sourceItemIds) {
    await execute(
      db,
      `INSERT INTO citations
       (id, target_type, target_id, source_item_id, note, created_at)
       SELECT ?, 'story', ?, ?, ?, datetime('now')
       WHERE NOT EXISTS (
         SELECT 1 FROM citations
         WHERE target_type = 'story' AND target_id = ? AND source_item_id = ?
       )`,
      [randomUUID(), storyId, sourceItemId, batch.citationNote, storyId, sourceItemId],
    );
  }
}

async function buildReviewReport(db: Client, batch: Batch) {
  const rows = batch.articles.map((article) => {
    const score = article.humanizer;
    return `| ${article.slug} | ${humanizerTotal(article)}/50 | ${score.directness} | ${score.rhythm} | ${score.trust} | ${score.authenticity} | ${score.concision} | ${article.body.length} | ${article.humanizer.notes} |`;
  }).join("\n");

  const sourceRows: string[] = [];
  for (const article of batch.articles) {
    const entity = await findEntity(db, article.slug);
    if (!entity) throw new Error(`Missing pen entity: ${article.slug}`);
    const sources = await getExistingSourceItems(db, entity.id);
    if (sources.length === 0) throw new Error(`Missing source references: ${article.slug}`);
    const labels = sources
      .map((source) => `[${source.sourceName}: ${source.title}](${source.url})`)
      .join("；");
    sourceRows.push(`| ${article.slug} | ${labels} |`);
  }

  return `# ${batch.label} humanizer-zh 审查

生成时间：${new Date().toISOString()}

## 评分

| slug | 总分 | 直接性 | 节奏 | 信任度 | 真实性 | 精炼度 | 字数 | 备注 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Source pack

| slug | sources |
| --- | --- |
${sourceRows.join("\n")}
`;
}

async function loadBatch() {
  if (!batchArg) {
    throw new Error("Usage: pnpm import:read-first-batch <batch-file.ts> [--write]");
  }
  const absolutePath = path.resolve(process.cwd(), batchArg);
  const mod = await import(pathToFileURL(absolutePath).href);
  return mod.default as Batch;
}

async function main() {
  const batch = await loadBatch();
  const failures = batch.articles.flatMap((article) =>
    validateArticle(article, batch).map((failure) => `${article.slug}: ${failure}`),
  );
  if (failures.length > 0) {
    throw new Error(`Article validation failed:\n${failures.join("\n")}`);
  }

  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");

  for (const article of batch.articles) {
    const entity = await findEntity(db, article.slug);
    if (!entity) throw new Error(`Missing pen entity: ${article.slug}`);
    const sources = await getExistingSourceItems(db, entity.id);
    if (sources.length === 0) throw new Error(`Missing source references: ${article.slug}`);
  }

  if (!WRITE) {
    console.log(`Validated ${batch.articles.length} article(s) for ${batch.label}.`);
    for (const article of batch.articles) {
      console.log(`- ${article.slug}: ${article.body.length} chars, humanizer ${humanizerTotal(article)}/50`);
    }
    console.log("Dry run only. Re-run with --write to update the database and review report.");
    return;
  }

  for (const article of batch.articles) {
    const entity = await findEntity(db, article.slug);
    if (!entity) throw new Error(`Missing pen entity: ${article.slug}`);
    const sources = await getExistingSourceItems(db, entity.id);
    const storyId = await upsertStory(db, entity.id, article, batch);
    await execute(
      db,
      "UPDATE entities SET summary = ?, updated_at = datetime('now') WHERE id = ?",
      [article.summary, entity.id],
    );
    await citeExistingSources(
      db,
      storyId,
      sources.map((source) => source.id),
      batch,
    );
    console.log(`Updated ${article.slug}: ${article.body.length} chars`);
  }

  const reviewPath = path.resolve(process.cwd(), batch.reviewPath);
  mkdirSync(path.dirname(reviewPath), { recursive: true });
  writeFileSync(reviewPath, await buildReviewReport(db, batch));
  console.log(`Wrote ${reviewPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
