import { createClient } from "@libsql/client";

const REQUIRED_TABLES = [
  "source_registry",
  "source_items",
  "entity_aliases",
  "external_ids",
  "claims",
  "citations",
  "media_assets",
  "stories",
  "timeline_events",
  "model_specs",
  "model_variants",
  "diagrams",
  "community_summaries",
  "entity_references",
  "exhibits",
  "exhibit_sections",
] as const;

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:data/fpkg.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function scalar(sql: string) {
  const result = await db.execute(sql);
  return Number(result.rows[0]?.value || 0);
}

async function main() {
  const tableRows = await db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table'",
  );
  const tables = new Set(tableRows.rows.map((row) => String(row.name)));
  const missingTables = REQUIRED_TABLES.filter((table) => !tables.has(table));

  if (missingTables.length > 0) {
    console.error(`Missing library tables: ${missingTables.join(", ")}`);
    process.exit(1);
  }

  const problems: string[] = [];
  const warnings: string[] = [];

  const badSources = await scalar(`
    SELECT COUNT(*) as value
    FROM source_registry
    WHERE source_type IS NULL OR allowed_use IS NULL OR reliability IS NULL
  `);
  if (badSources > 0) {
    problems.push(`${badSources} source_registry rows are missing policy fields.`);
  }

  const badSourceItems = await scalar(`
    SELECT COUNT(*) as value
    FROM source_items si
    LEFT JOIN source_registry sr ON sr.id = si.source_id
    WHERE sr.id IS NULL OR si.url IS NULL OR si.title IS NULL
  `);
  if (badSourceItems > 0) {
    problems.push(`${badSourceItems} source_items rows have broken source links or missing titles.`);
  }

  const badExternalIds = await scalar(`
    SELECT COUNT(*) as value
    FROM external_ids ex
    LEFT JOIN entities e ON e.id = ex.entity_id
    WHERE e.id IS NULL
      OR length(trim(ex.provider)) = 0
      OR length(trim(ex.external_id)) = 0
  `);
  if (badExternalIds > 0) {
    problems.push(`${badExternalIds} external_ids rows have broken entity links or empty identifiers.`);
  }

  const badAliases = await scalar(`
    SELECT COUNT(*) as value
    FROM entity_aliases ea
    LEFT JOIN entities e ON e.id = ea.entity_id
    WHERE e.id IS NULL OR length(trim(ea.alias)) = 0
  `);
  if (badAliases > 0) {
    problems.push(`${badAliases} entity_aliases rows have broken entity links or empty aliases.`);
  }

  const badStories = await scalar(`
    SELECT COUNT(*) as value
    FROM stories
    WHERE length(trim(body_md)) < 40
  `);
  if (badStories > 0) {
    problems.push(`${badStories} stories are too short to be useful.`);
  }

  const badDiagrams = await scalar(`
    SELECT COUNT(*) as value
    FROM diagrams
    WHERE svg NOT LIKE '<svg%' OR license IS NULL OR length(trim(title)) = 0
  `);
  if (badDiagrams > 0) {
    problems.push(`${badDiagrams} diagrams have invalid SVG, title, or license data.`);
  }

  const badMedia = await scalar(`
    SELECT COUNT(*) as value
    FROM media_assets
    WHERE length(trim(title)) = 0
      OR review_status NOT IN ('pending', 'approved', 'rejected', 'needs_license')
      OR usage_status NOT IN ('candidate', 'primary', 'gallery', 'hidden')
  `);
  if (badMedia > 0) {
    problems.push(`${badMedia} media_assets rows have invalid title or status data.`);
  }

  const badMediaLinks = await scalar(`
    SELECT COUNT(*) as value
    FROM media_assets ma
    LEFT JOIN source_items si ON si.id = ma.source_item_id
    WHERE (ma.source_item_id IS NOT NULL AND si.id IS NULL)
      OR (ma.asset_type = 'image' AND (
        ma.source_url IS NULL
        OR ma.source_item_id IS NULL
        OR (ma.image_url IS NULL AND ma.thumbnail_url IS NULL)
      ))
  `);
  if (badMediaLinks > 0) {
    problems.push(`${badMediaLinks} media_assets rows have broken source links or missing image metadata.`);
  }

  const badCommunitySummaries = await scalar(`
    SELECT COUNT(*) as value
    FROM community_summaries cs
    LEFT JOIN entities e ON e.id = cs.entity_id
    LEFT JOIN source_registry sr ON sr.id = cs.source_id
    WHERE e.id IS NULL
      OR sr.id IS NULL
      OR length(trim(cs.summary_md)) < 40
      OR cs.status NOT IN ('draft', 'reviewed', 'published', 'deprecated')
  `);
  if (badCommunitySummaries > 0) {
    problems.push(
      `${badCommunitySummaries} community_summaries rows have invalid links, status, or summary text.`,
    );
  }

  const badExhibitSections = await scalar(`
    SELECT COUNT(*) as value
    FROM exhibit_sections es
    LEFT JOIN exhibits e ON e.id = es.exhibit_id
    WHERE e.id IS NULL OR length(trim(es.body_md)) < 40
  `);
  if (badExhibitSections > 0) {
    problems.push(`${badExhibitSections} exhibit sections are missing exhibit links or useful body text.`);
  }

  const pendingWithoutSource = await scalar(`
    SELECT COUNT(*) as value
    FROM claims
    WHERE review_status IN ('approved', 'pending') AND source_item_id IS NULL
  `);
  if (pendingWithoutSource > 0) {
    problems.push(`${pendingWithoutSource} claims have no source_item_id.`);
  }

  const badClaimLinks = await scalar(`
    SELECT COUNT(*) as value
    FROM claims c
    LEFT JOIN entities se ON se.id = c.subject_entity_id
    LEFT JOIN source_items si ON si.id = c.source_item_id
    WHERE se.id IS NULL
      OR (c.source_item_id IS NOT NULL AND si.id IS NULL)
      OR length(trim(c.predicate)) = 0
      OR (c.object_text IS NOT NULL AND length(trim(c.object_text)) = 0)
  `);
  if (badClaimLinks > 0) {
    problems.push(`${badClaimLinks} claims have broken links or empty fields.`);
  }

  const badCitations = await scalar(`
    SELECT COUNT(*) as value
    FROM citations c
    LEFT JOIN source_items si ON si.id = c.source_item_id
    LEFT JOIN claims cl ON cl.id = c.claim_id
    WHERE (c.source_item_id IS NOT NULL AND si.id IS NULL)
      OR (c.claim_id IS NOT NULL AND cl.id IS NULL)
      OR (c.target_type = 'entity' AND NOT EXISTS (
        SELECT 1 FROM entities e WHERE e.id = c.target_id
      ))
      OR (c.target_type = 'story' AND NOT EXISTS (
        SELECT 1 FROM stories s WHERE s.id = c.target_id
      ))
      OR (c.target_type = 'timeline_event' AND NOT EXISTS (
        SELECT 1 FROM timeline_events te WHERE te.id = c.target_id
      ))
      OR (c.target_type = 'diagram' AND NOT EXISTS (
        SELECT 1 FROM diagrams d WHERE d.id = c.target_id
      ))
      OR (c.target_type = 'model_spec' AND NOT EXISTS (
        SELECT 1 FROM model_specs ms WHERE ms.id = c.target_id
      ))
      OR (c.target_type = 'exhibit' AND NOT EXISTS (
        SELECT 1 FROM exhibits ex WHERE ex.id = c.target_id
      ))
      OR (c.target_type = 'claim' AND NOT EXISTS (
        SELECT 1 FROM claims tc WHERE tc.id = c.target_id
      ))
  `);
  if (badCitations > 0) {
    problems.push(`${badCitations} citations have broken targets, claims, or source links.`);
  }

  const counts = {
    sources: await scalar("SELECT COUNT(*) as value FROM source_registry"),
    sourceItems: await scalar("SELECT COUNT(*) as value FROM source_items"),
    claims: await scalar("SELECT COUNT(*) as value FROM claims"),
    citations: await scalar("SELECT COUNT(*) as value FROM citations"),
    stories: await scalar("SELECT COUNT(*) as value FROM stories"),
    events: await scalar("SELECT COUNT(*) as value FROM timeline_events"),
    diagrams: await scalar("SELECT COUNT(*) as value FROM diagrams"),
    media: await scalar("SELECT COUNT(*) as value FROM media_assets"),
    community: await scalar("SELECT COUNT(*) as value FROM community_summaries"),
    exhibits: await scalar("SELECT COUNT(*) as value FROM exhibits"),
    externalIds: await scalar("SELECT COUNT(*) as value FROM external_ids"),
    aliases: await scalar("SELECT COUNT(*) as value FROM entity_aliases"),
    commonsMedia: await scalar(`
      SELECT COUNT(*) as value
      FROM media_assets ma
      JOIN source_items si ON si.id = ma.source_item_id
      WHERE si.source_id = 'wikimedia-commons' AND ma.asset_type = 'image'
    `),
  };

  if (counts.sources < 9) warnings.push("source_registry has fewer than 9 sources.");
  if (counts.claims < 10) warnings.push("claims has fewer than 10 seed facts.");
  if (counts.citations < 15) warnings.push("citations has fewer than 15 source bindings.");
  if (counts.diagrams < 5) warnings.push("diagrams has fewer than 5 starter diagrams.");
  if (counts.media < 2) warnings.push("media_assets has fewer than 2 media candidates.");
  if (counts.community < 2) {
    warnings.push("community_summaries has fewer than 2 community summaries.");
  }
  if (counts.exhibits < 3) warnings.push("exhibits has fewer than 3 draft exhibits.");
  if (counts.externalIds < 5) {
    warnings.push("external_ids has fewer than 5 Wikidata brand IDs.");
  }
  if (counts.aliases < 20) {
    warnings.push("entity_aliases has fewer than 20 aliases.");
  }
  if (counts.commonsMedia < 1) {
    warnings.push("No file-level Wikimedia Commons media candidates imported yet.");
  }

  console.log("Library contract counts:");
  for (const [key, value] of Object.entries(counts)) {
    console.log(`  ${key}: ${value}`);
  }

  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }

  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`Problem: ${problem}`);
    }
    process.exit(1);
  }

  console.log("Library contract OK");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
