import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");

const PROMOTIONS = [
  {
    slug: "凌美-lamy-lamy-2000",
    mediaId: "media-commons-083109b569ff10",
    note: "Lamy 2000 whole-product photo",
  },
  {
    slug: "pilot-custom-823",
    mediaId: "media-commons-0e62ab801d9015",
    note: "Pilot Custom 823 whole-product photo",
  },
  {
    slug: "sailor-pro-gear",
    mediaId: "media-commons-c022ffa38969d0",
    note: "Sailor Professional Gear variant photo",
  },
  {
    slug: "万宝龙-montblanc-大班149-meisterst-ck",
    mediaId: "media-commons-6dad475c03371b",
    note: "Montblanc Meisterstuck 149 whole-product photo",
  },
  {
    slug: "派克-parker-51-经典-vintage",
    mediaId: "media-commons-a392b9fda981d0",
    note: "Parker 51 whole-product photo",
  },
  {
    slug: "白金-platinum-3776-century",
    mediaId: "media-commons-2ae3b935ddf9a5",
    note: "Platinum 3776 Century whole-product photo",
  },
  {
    slug: "维斯康蒂-visconti-homo-sapiens智人",
    mediaId: "media-commons-dfe6ab7e02d980",
    note: "Visconti Homo Sapiens whole-product photo",
  },
  {
    slug: "奥罗拉-aurora",
    mediaId: "media-commons-b0e37dd28d727c",
    note: "Aurora 88 whole-product photo",
  },
] as const;

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

async function main() {
  const db = getClient();
  let promoted = 0;
  let missing = 0;

  console.log(`${WRITE ? "Promoting" : "Dry run"} exact product media.`);

  for (const item of PROMOTIONS) {
    const result = await db.execute({
      sql: `SELECT ma.id, ma.entity_id, ma.title, ma.source_url, ma.license,
                   e.slug, e.name
            FROM media_assets ma
            JOIN entities e ON e.id = ma.entity_id
            WHERE ma.id = ? AND e.slug = ?
            LIMIT 1`,
      args: [item.mediaId, item.slug],
    });
    const row = result.rows[0];

    if (!row) {
      missing += 1;
      console.log(`- missing ${item.slug}: ${item.mediaId}`);
      continue;
    }

    if (WRITE) {
      await execute(
        db,
        `UPDATE media_assets
         SET usage_status = 'gallery', updated_at = datetime('now')
         WHERE entity_id = ?
           AND id <> ?
           AND asset_type = 'image'
           AND review_status = 'approved'
           AND image_url NOT LIKE '/images/library/warm-pen-atlas/%'`,
        [row.entity_id, item.mediaId],
      );
      await execute(
        db,
        `UPDATE media_assets
         SET review_status = 'approved',
             usage_status = 'primary',
             updated_at = datetime('now')
         WHERE id = ?`,
        [item.mediaId],
      );
      await execute(
        db,
        `UPDATE source_items
         SET review_status = 'approved',
             updated_at = datetime('now')
         WHERE url = ?`,
        [row.source_url],
      );
    }

    promoted += 1;
    console.log(
      `- ${WRITE ? "promoted" : "would promote"} ${row.name}: ${row.title} (${row.license || "license unknown"}) - ${item.note}`,
    );
  }

  console.log(`Done. ${promoted} matched, ${missing} missing.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
