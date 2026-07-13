import { createClient } from "@libsql/client";
import { publicEntityFilter } from "../src/lib/public-visibility";
import { cleanPublicText } from "../src/lib/publicText";

const RETIRED_DUPLICATE_SLUGS = [
  "百乐-pilot-custom-823",
  "百利金-pelikan-m800",
  "派克-parker-51-经典-vintage",
  "写乐-sailor-21k-pro-gear-大鱼雷",
  "奥罗拉-aurora",
];

const SPEC_FIELDS = [
  "series_name",
  "release_year",
  "origin_country",
  "nib",
  "fill_system",
  "material",
  "dimensions",
  "weight",
  "price_range",
  "status",
] as const;

async function main() {
  const db = createClient({ url: "file:data/fpkg.db" });
  const failures: string[] = [];

  const foreignKeys = await db.execute("PRAGMA foreign_key_check");
  if (foreignKeys.rows.length > 0) {
    failures.push(`foreign_key_check returned ${foreignKeys.rows.length} row(s)`);
  }

  const publicCount = await db.execute(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN type = 'pen' THEN 1 ELSE 0 END) AS pens
     FROM entities e
     WHERE ${publicEntityFilter("e")}`,
  );
  const retired = await db.execute({
    sql: `SELECT slug FROM entities e
          WHERE slug IN (${RETIRED_DUPLICATE_SLUGS.map(() => "?").join(",")})
            AND ${publicEntityFilter("e")}`,
    args: RETIRED_DUPLICATE_SLUGS,
  });
  if (retired.rows.length > 0) {
    failures.push(
      `retired duplicate slugs remain public: ${retired.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const typeErrors = await db.execute(
    `SELECT e.slug
     FROM entities e
     LEFT JOIN model_specs ms ON ms.entity_id = e.id
     WHERE e.type = 'pen'
       AND ${publicEntityFilter("e")}
       AND (
         lower(COALESCE(e.summary, '')) LIKE '%不是 fountain pen%'
         OR e.summary LIKE '%应按墨水线%'
         OR lower(COALESCE(ms.series_name, '')) LIKE '%brand-generic%'
       )`,
  );
  if (typeErrors.rows.length > 0) {
    failures.push(
      `known type errors remain public pens: ${typeErrors.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const nonPenSpecs = await db.execute(
    `SELECT e.slug
     FROM model_specs ms
     JOIN entities e ON e.id = ms.entity_id
     WHERE e.type != 'pen'`,
  );
  if (nonPenSpecs.rows.length > 0) {
    failures.push(
      `non-pen entities still own model specs: ${nonPenSpecs.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const approvedSpecs = await db.execute(
    `SELECT e.slug, ms.*
     FROM model_specs ms
     JOIN entities e ON e.id = ms.entity_id
     WHERE ms.review_status = 'approved'
       AND ${publicEntityFilter("e")}`,
  );
  for (const row of approvedSpecs.rows) {
    for (const field of SPEC_FIELDS) {
      const value = row[field];
      if (value && cleanPublicText(value) === null) {
        failures.push(`${row.slug}.${field} contains an internal placeholder`);
      }
    }
  }

  const badPublicReferences = await db.execute(
    `SELECT COUNT(*) AS total
     FROM entity_references er
     JOIN source_items si ON si.id = er.source_item_id
     JOIN entities e ON e.id = er.entity_id
     WHERE ${publicEntityFilter("e")}
       AND er.review_status = 'approved'
       AND si.review_status != 'approved'`,
  );
  if (Number(badPublicReferences.rows[0]?.total || 0) > 0) {
    failures.push("approved entity references include unapproved source items");
  }

  if (failures.length > 0) {
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(
    `Public boundary OK: ${publicCount.rows[0]?.total} entities, ${publicCount.rows[0]?.pens} pens, ${approvedSpecs.rows.length} approved specs.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
