import { createClient } from "@libsql/client";
import { publicEntityFilter } from "../src/lib/public-visibility";
import { publicMediaFilter } from "../src/lib/public-media";
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

  const unsupportedApprovedSpecs = await db.execute(
    `SELECT e.slug
     FROM model_specs ms
     JOIN entities e ON e.id = ms.entity_id
     WHERE ms.review_status = 'approved'
       AND ${publicEntityFilter("e")}
       AND NOT EXISTS (
         SELECT 1
         FROM citations citation
         LEFT JOIN source_items direct_source
           ON direct_source.id = citation.source_item_id
         LEFT JOIN claims claim
           ON claim.id = citation.claim_id
         LEFT JOIN source_items claim_source
           ON claim_source.id = claim.source_item_id
         WHERE citation.target_type = 'model_spec'
           AND citation.target_id = ms.id
           AND (
             direct_source.review_status = 'approved'
             OR (
               claim.review_status = 'approved'
               AND claim_source.review_status = 'approved'
             )
           )
       )`,
  );
  if (unsupportedApprovedSpecs.rows.length > 0) {
    failures.push(
      `approved specs lack an approved citation chain: ${unsupportedApprovedSpecs.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const publicSnapshotFields = await db.execute(
    `SELECT e.slug
     FROM model_specs ms
     JOIN entities e ON e.id = ms.entity_id
     WHERE ${publicEntityFilter("e")}
       AND (ms.price_range IS NOT NULL OR ms.status IS NOT NULL)`,
  );
  if (publicSnapshotFields.rows.length > 0) {
    failures.push(
      `${publicSnapshotFields.rows.length} public specs still expose undated price/status snapshots`,
    );
  }

  const placeholderAttributes = await db.execute(
    `SELECT COUNT(*) AS total
     FROM entity_attributes
     WHERE value IS NULL
        OR trim(value) = ''
        OR trim(value) IN ('—', '-', '待确认', '待核验')`,
  );
  if (Number(placeholderAttributes.rows[0]?.total || 0) > 0) {
    failures.push("entity_attributes still contains explicit placeholder values");
  }

  const invalidBrandRelations = await db.execute(
    `SELECT COUNT(*) AS total
     FROM entity_links relation
     JOIN entities source_entity ON source_entity.id = relation.source_id
     JOIN entities target_entity ON target_entity.id = relation.target_id
     WHERE relation.link_type = 'brand_model'
        OR (
          relation.link_type = 'made_by'
          AND NOT (
            source_entity.type = 'pen'
            AND target_entity.type = 'brand'
          )
        )`,
  );
  if (Number(invalidBrandRelations.rows[0]?.total || 0) > 0) {
    failures.push("legacy or directionally invalid brand relations remain");
  }

  const missingReverseRelations = await db.execute(
    `SELECT COUNT(*) AS total
     FROM entity_links relation
     WHERE relation.link_type != 'reverse'
       AND NOT EXISTS (
         SELECT 1
         FROM entity_links reverse_relation
         WHERE reverse_relation.id = 'rev-' || relation.id
           AND reverse_relation.source_id = relation.target_id
           AND reverse_relation.target_id = relation.source_id
           AND reverse_relation.link_type = 'reverse'
       )`,
  );
  if (Number(missingReverseRelations.rows[0]?.total || 0) > 0) {
    failures.push("forward entity relations are missing canonical reverse rows");
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

  const duplicatePublicReferences = await db.execute(
    `SELECT COUNT(*) AS total
     FROM (
       SELECT er.entity_id, er.source_item_id, er.relation_type,
              COALESCE(er.note, '') as note
       FROM entity_references er
       JOIN entities e ON e.id = er.entity_id
       WHERE ${publicEntityFilter("e")}
         AND er.review_status = 'approved'
       GROUP BY er.entity_id, er.source_item_id, er.relation_type, note
       HAVING COUNT(*) > 1
     ) duplicates`,
  );
  if (Number(duplicatePublicReferences.rows[0]?.total || 0) > 0) {
    failures.push("public entities contain duplicate semantic references");
  }

  const publicImportResidue = await db.execute(
    `SELECT e.slug
     FROM entities e
     WHERE ${publicEntityFilter("e")}
       AND (
         COALESCE(e.summary, '') LIKE '%参考资料索引%'
         OR COALESCE(e.body_md, '') LIKE '%参考资料索引%'
         OR COALESCE(e.body_md, '') LIKE '%以下是翻译结果%'
         OR COALESCE(e.body_md, '') LIKE '%[内容已截断]%'
         OR COALESCE(e.body_md, '') LIKE '%\`\`\`markdown%'
       )`,
  );
  if (publicImportResidue.rows.length > 0) {
    failures.push(
      `public copy contains import residue: ${publicImportResidue.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const publicMedia = await db.execute(
    `SELECT COUNT(*) AS total
     FROM media_assets ma
     JOIN entities e ON e.id = ma.entity_id
     WHERE ${publicMediaFilter("ma")}
       AND ${publicEntityFilter("e")}`,
  );

  if (failures.length > 0) {
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(
    `Public boundary OK: ${publicCount.rows[0]?.total} entities, ${publicCount.rows[0]?.pens} pens, ${approvedSpecs.rows.length} approved specs, ${publicMedia.rows[0]?.total} reusable media.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
