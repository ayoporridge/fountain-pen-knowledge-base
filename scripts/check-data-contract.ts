import { createClient } from "@libsql/client";
import { shouldReclassifyPenArticle } from "../src/lib/entity-quality";

const ENTITY_TYPES = [
  "pen",
  "brand",
  "concept",
  "material",
  "nib",
  "fill_system",
  "article",
] as const;

const FACET_DIMENSIONS = [
  "nib_type",
  "nib_material",
  "fill_system",
  "origin",
  "price",
  "brand_tier",
  "era",
  "size",
  "usage",
  "style",
  "ink_type",
  "body_material",
] as const;

async function main() {
  const db = createClient({ url: "file:data/fpkg.db" });
  const expectedTypes = new Set<string>(ENTITY_TYPES);

  const typeRows = await db.execute(
    "SELECT type, COUNT(*) as cnt FROM entities GROUP BY type ORDER BY type",
  );
  const actualTypes = typeRows.rows.map((row) => String(row.type));
  const unknownTypes = actualTypes.filter((type) => !expectedTypes.has(type));

  const schemaRows = await db.execute(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'entities'",
  );
  const entitiesSql = String(schemaRows.rows[0]?.sql || "");
  const missingSchemaTypes = ENTITY_TYPES.filter(
    (type) => !entitiesSql.includes(`'${type}'`),
  );

  const dimensionRows = await db.execute(
    "SELECT DISTINCT dimension FROM tags ORDER BY dimension",
  );
  const actualDimensions = new Set(
    dimensionRows.rows.map((row) => String(row.dimension)),
  );
  const missingDimensions = FACET_DIMENSIONS.filter(
    (dimension) => !actualDimensions.has(dimension),
  );
  const penRows = await db.execute(
    "SELECT id, type, slug, name, source_file, source_url FROM entities WHERE type = 'pen' ORDER BY name",
  );
  const suspiciousPenArticles = penRows.rows
    .map((row) => ({
      type: String(row.type),
      slug: String(row.slug),
      name: String(row.name),
      source_file: row.source_file ? String(row.source_file) : null,
      source_url: row.source_url ? String(row.source_url) : null,
    }))
    .filter((entity) => shouldReclassifyPenArticle(entity));

  console.log("Entity types:");
  for (const row of typeRows.rows) {
    console.log(`  ${row.type}: ${row.cnt}`);
  }

  if (
    unknownTypes.length > 0 ||
    missingSchemaTypes.length > 0 ||
    missingDimensions.length > 0 ||
    suspiciousPenArticles.length > 0
  ) {
    if (unknownTypes.length > 0) {
      console.error(`Unknown entity types: ${unknownTypes.join(", ")}`);
    }
    if (missingSchemaTypes.length > 0) {
      console.error(
        `Entity schema CHECK is missing: ${missingSchemaTypes.join(", ")}`,
      );
    }
    if (missingDimensions.length > 0) {
      console.error(`Missing tag dimensions: ${missingDimensions.join(", ")}`);
    }
    if (suspiciousPenArticles.length > 0) {
      console.error(
        `Suspicious article-like pen entities: ${suspiciousPenArticles
          .slice(0, 10)
          .map((entity) => `${entity.slug} (${entity.name})`)
          .join(", ")}`,
      );
    }
    process.exit(1);
  }

  console.log("Data contract OK");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
