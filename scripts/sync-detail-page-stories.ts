import { createClient, type Client, type InArgs, type InStatement } from "@libsql/client";

type StorySyncRow = {
  id: string;
  title: string;
  summary: string | null;
  bodyMd: string;
  status: string;
  slug: string;
};

const CHUNK_SIZE = 40;

function getLocalClient() {
  return createClient({ url: "file:data/fpkg.db" });
}

function getRemoteClient() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is required for remote sync");
  }

  return createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

async function getLocalStories(db: Client) {
  const result = await db.execute(
    `SELECT s.id, s.title, s.summary, s.body_md AS bodyMd, s.status, e.slug
     FROM stories s
     JOIN entities e ON e.id = s.entity_id
     WHERE e.type IN ('brand', 'pen')
     ORDER BY e.type, e.slug`,
  );

  return result.rows.map((row) => row as unknown as StorySyncRow);
}

function updateStatement(row: StorySyncRow): InStatement {
  return {
    sql: `UPDATE stories
          SET title = ?, summary = ?, body_md = ?, status = ?, updated_at = datetime('now')
          WHERE id = ?`,
    args: [
      row.title,
      row.summary,
      row.bodyMd,
      row.status === "published" ? "published" : "reviewed",
      row.id,
    ] as InArgs,
  };
}

async function runBatch(db: Client, rows: StorySyncRow[]) {
  if (rows.length === 0) return;
  await db.batch(rows.map(updateStatement), "write");
}

async function main() {
  const local = getLocalClient();
  const remote = getRemoteClient();
  const rows = await getLocalStories(local);

  console.log(`Syncing detail stories: ${rows.length}`);

  let synced = 0;
  for (let index = 0; index < rows.length; index += CHUNK_SIZE) {
    const chunk = rows.slice(index, index + CHUNK_SIZE);
    await runBatch(remote, chunk);
    synced += chunk.length;
    console.log(`Synced ${synced}/${rows.length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
