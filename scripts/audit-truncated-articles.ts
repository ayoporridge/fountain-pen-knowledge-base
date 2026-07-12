import { queryAll } from "@/lib/db";

type ArticleRow = {
  slug: string;
  name: string;
  source_url: string | null;
  source_file: string | null;
  body_len: number;
  summary_len: number;
  body_marker_pos: number;
  summary_marker_pos: number;
  body_tail: string;
  summary_tail: string;
};

const TRUNCATION_MARKER = "[内容已截断]";
const NEAR_EXPORT_LIMIT_MIN = 49_900;
const NEAR_EXPORT_LIMIT_MAX = 50_200;

async function main() {
  const database = process.env.TURSO_DATABASE_URL ? "remote Turso" : "local SQLite";
  const rows = (await queryAll(
    `SELECT slug,
            name,
            source_url,
            source_file,
            length(body_md) AS body_len,
            length(summary) AS summary_len,
            instr(body_md, ?) AS body_marker_pos,
            instr(summary, ?) AS summary_marker_pos,
            substr(body_md, -220) AS body_tail,
            substr(summary, -220) AS summary_tail
     FROM entities
     WHERE type = 'article'
     ORDER BY slug`,
    [TRUNCATION_MARKER, TRUNCATION_MARKER],
  )) as ArticleRow[];

  const marker = rows.filter(
    (row) => Number(row.body_marker_pos) > 0 || Number(row.summary_marker_pos) > 0,
  );
  const nearLimit = rows.filter((row) => {
    const len = Number(row.body_len);
    return len >= NEAR_EXPORT_LIMIT_MIN && len <= NEAR_EXPORT_LIMIT_MAX;
  });
  const longest = [...rows]
    .sort((a, b) => Number(b.body_len) - Number(a.body_len))
    .slice(0, 10)
    .map((row) => ({
      slug: row.slug,
      name: row.name,
      body_len: Number(row.body_len),
      summary_len: Number(row.summary_len),
      source_url: row.source_url,
    }));

  console.log(
    JSON.stringify(
      {
        database,
        articleCount: rows.length,
        markerCount: marker.length,
        marker,
        nearLimitCount: nearLimit.length,
        nearLimit,
        longest,
      },
      null,
      2,
    ),
  );

  if (marker.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
