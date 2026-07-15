import { createHash } from "node:crypto";
import type { InArgs, InStatement, ResultSet } from "@libsql/client";

export const PUBLICATION_CONTRACT_VERSION = 1 as const;
const PUBLICATION_HASH_PREFIX = `sha256:v${PUBLICATION_CONTRACT_VERSION}:`;

export interface PublicationDatabase {
  execute(statement: InStatement): Promise<ResultSet>;
}

type CanonicalPrimitive = null | boolean | number | string;
type CanonicalValue =
  | CanonicalPrimitive
  | CanonicalValue[]
  | { [key: string]: CanonicalValue };

function normalizeText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value).replace(/\r\n?/g, "\n").normalize("NFC");
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(
      `Publication payload contains a non-finite number: ${String(value)}`,
    );
  }
  return Object.is(number, -0) ? 0 : number;
}

function normalizeJson(value: unknown): CanonicalValue {
  const text = normalizeText(value);
  if (text === null) return null;
  try {
    return normalizeCanonicalValue(JSON.parse(text));
  } catch {
    return text;
  }
}

function stableStringify(value: CanonicalValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const entries = Object.entries(value).sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  return `{${entries
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
    .join(",")}}`;
}

function normalizeCanonicalValue(value: unknown): CanonicalValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return normalizeText(value) as string;
  if (typeof value === "number" || typeof value === "bigint") {
    return normalizeNumber(value) as number;
  }
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    const unique = new Map<string, CanonicalValue>();
    for (const item of value) {
      const normalized = normalizeCanonicalValue(item);
      unique.set(stableStringify(normalized), normalized);
    }
    return [...unique.entries()]
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([, item]) => item);
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, item]) => [
          normalizeText(key) as string,
          normalizeCanonicalValue(item),
        ]),
    );
  }
  throw new Error(`Unsupported publication payload value: ${typeof value}`);
}

async function rows(
  db: PublicationDatabase,
  sql: string,
  args: unknown[] = [],
): Promise<ResultSet["rows"]> {
  const result = await db.execute({ sql, args: args as InArgs });
  return result.rows;
}

function uniqueText(values: unknown[]): string[] {
  return [
    ...new Set(
      values
        .map(normalizeText)
        .filter((value): value is string => value !== null),
    ),
  ].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
}

async function rowsForIds(
  db: PublicationDatabase,
  selectSql: string,
  ids: string[],
): Promise<ResultSet["rows"]> {
  if (ids.length === 0) return [];
  return rows(
    db,
    `${selectSql} WHERE id IN (${ids.map(() => "?").join(", ")})`,
    ids,
  );
}

/**
 * Read every v1 publication-critical input with fixed keys and explicit nulls.
 * Created/updated timestamps are excluded because they are transport metadata,
 * not reviewed public content. Phase 19 adds source independence under v2.
 */
export async function readPublicationContentPayload(
  db: PublicationDatabase,
  entityId: string,
): Promise<CanonicalValue> {
  const entityRows = await rows(
    db,
    `
      SELECT id, type, slug, name, summary, body_md, source,
             source_url, source_file, imported_at
      FROM entities
      WHERE id = ?
    `,
    [entityId],
  );
  const entity = entityRows[0];
  if (!entity) throw new Error(`Publication entity not found: ${entityId}`);

  const storyType =
    entity.type === "brand"
      ? "brand_story"
      : entity.type === "pen"
        ? "model_story"
        : null;
  const storyRows = storyType
    ? await rows(
        db,
        `
          SELECT id, entity_id, title, story_type, summary, body_md, status,
                 source_notes
          FROM stories
          WHERE entity_id = ? AND story_type = ? AND status = 'published'
        `,
        [entityId, storyType],
      )
    : [];
  const specRows = await rows(
    db,
    `
      SELECT id, entity_id, brand_entity_id, series_name, release_year,
             origin_country, nib, fill_system, material, dimensions, weight,
             price_range, status, review_status
      FROM model_specs
      WHERE entity_id = ?
    `,
    [entityId],
  );
  const variantRows = await rows(
    db,
    `
      SELECT id, model_entity_id, variant_name, release_year, notes,
             source_item_id, review_status
      FROM model_variants
      WHERE model_entity_id = ?
    `,
    [entityId],
  );
  const citationRows = await rows(
    db,
    `
      SELECT DISTINCT citation.id, citation.target_type, citation.target_id,
             citation.source_item_id, citation.claim_id, citation.note
      FROM citations citation
      JOIN publication_citation_entities owner ON owner.citation_id = citation.id
      WHERE owner.entity_id = ?
    `,
    [entityId],
  );
  const citationClaimIds = uniqueText(citationRows.map((row) => row.claim_id));
  const claimRows = await rows(
    db,
    `
      SELECT DISTINCT claim.id, claim.subject_entity_id, claim.subject_text,
             claim.predicate, claim.object_entity_id, claim.object_text,
             claim.source_item_id, claim.evidence_locator, claim.confidence,
             claim.review_status
      FROM claims claim
      WHERE claim.subject_entity_id = ?
         OR claim.id IN (${citationClaimIds.length > 0 ? citationClaimIds.map(() => "?").join(", ") : "NULL"})
    `,
    [entityId, ...citationClaimIds],
  );
  const referenceRows = await rows(
    db,
    `
      SELECT id, entity_id, source_item_id, relation_type, note, review_status
      FROM entity_references
      WHERE entity_id = ?
    `,
    [entityId],
  );
  const timelineRows = await rows(
    db,
    `
      SELECT id, entity_id, title, event_type, start_date, end_date, circa,
             description, source_item_id, review_status
      FROM timeline_events
      WHERE entity_id = ? AND review_status = 'approved'
    `,
    [entityId],
  );
  const mediaRows = await rows(
    db,
    `
      SELECT id, entity_id, title, asset_type, image_url, thumbnail_url,
             local_path, author, license, attribution_text, source_url,
             source_item_id, review_status, usage_status
      FROM media_assets
      WHERE entity_id = ?
        AND review_status = 'approved'
        AND usage_status = 'primary'
    `,
    [entityId],
  );
  const madeByRows = await rows(
    db,
    `
      SELECT id, source_id, target_id, link_type, reason
      FROM entity_links
      WHERE source_id = ? AND link_type = 'made_by'
    `,
    [entityId],
  );

  const sourceItemIds = uniqueText([
    ...variantRows.map((row) => row.source_item_id),
    ...claimRows.map((row) => row.source_item_id),
    ...citationRows.map((row) => row.source_item_id),
    ...referenceRows.map((row) => row.source_item_id),
    ...timelineRows.map((row) => row.source_item_id),
    ...mediaRows.map((row) => row.source_item_id),
  ]);
  const sourceItemRows = await rowsForIds(
    db,
    `
      SELECT id, source_id, title, url, item_type, license, author,
             published_at, retrieved_at, summary, raw_metadata_json,
             allowed_use, review_status
      FROM source_items
    `,
    sourceItemIds,
  );
  const sourceRegistryIds = uniqueText(
    sourceItemRows.map((row) => row.source_id),
  );
  const sourceRegistryRows = await rowsForIds(
    db,
    `
      SELECT id, name, source_type, allowed_use, reliability, license,
             attribution, homepage_url, fetch_method, notes, last_checked_at
      FROM source_registry
    `,
    sourceRegistryIds,
  );

  return normalizeCanonicalValue({
    schema: "fpkg-publication-content",
    version: PUBLICATION_CONTRACT_VERSION,
    entity: {
      id: normalizeText(entity.id),
      type: normalizeText(entity.type),
      slug: normalizeText(entity.slug),
      name: normalizeText(entity.name),
      summary: normalizeText(entity.summary),
      bodyMd: normalizeText(entity.body_md),
      source: normalizeText(entity.source),
      sourceUrl: normalizeText(entity.source_url),
      sourceFile: normalizeText(entity.source_file),
      importedAt: normalizeText(entity.imported_at),
    },
    stories: storyRows.map((row) => ({
      id: normalizeText(row.id),
      entityId: normalizeText(row.entity_id),
      title: normalizeText(row.title),
      storyType: normalizeText(row.story_type),
      summary: normalizeText(row.summary),
      bodyMd: normalizeText(row.body_md),
      status: normalizeText(row.status),
      sourceNotes: normalizeText(row.source_notes),
    })),
    modelSpecs: specRows.map((row) => ({
      id: normalizeText(row.id),
      entityId: normalizeText(row.entity_id),
      brandEntityId: normalizeText(row.brand_entity_id),
      seriesName: normalizeText(row.series_name),
      releaseYear: normalizeText(row.release_year),
      originCountry: normalizeText(row.origin_country),
      nib: normalizeText(row.nib),
      fillSystem: normalizeText(row.fill_system),
      material: normalizeText(row.material),
      dimensions: normalizeText(row.dimensions),
      weight: normalizeText(row.weight),
      priceRange: normalizeText(row.price_range),
      status: normalizeText(row.status),
      reviewStatus: normalizeText(row.review_status),
    })),
    modelVariants: variantRows.map((row) => ({
      id: normalizeText(row.id),
      modelEntityId: normalizeText(row.model_entity_id),
      variantName: normalizeText(row.variant_name),
      releaseYear: normalizeText(row.release_year),
      notes: normalizeText(row.notes),
      sourceItemId: normalizeText(row.source_item_id),
      reviewStatus: normalizeText(row.review_status),
    })),
    claims: claimRows.map((row) => ({
      id: normalizeText(row.id),
      subjectEntityId: normalizeText(row.subject_entity_id),
      subjectText: normalizeText(row.subject_text),
      predicate: normalizeText(row.predicate),
      objectEntityId: normalizeText(row.object_entity_id),
      objectText: normalizeText(row.object_text),
      sourceItemId: normalizeText(row.source_item_id),
      evidenceLocator: normalizeText(row.evidence_locator),
      confidence: normalizeNumber(row.confidence),
      reviewStatus: normalizeText(row.review_status),
    })),
    citations: citationRows.map((row) => ({
      id: normalizeText(row.id),
      targetType: normalizeText(row.target_type),
      targetId: normalizeText(row.target_id),
      sourceItemId: normalizeText(row.source_item_id),
      claimId: normalizeText(row.claim_id),
      note: normalizeText(row.note),
    })),
    sourceItems: sourceItemRows.map((row) => ({
      id: normalizeText(row.id),
      sourceId: normalizeText(row.source_id),
      title: normalizeText(row.title),
      url: normalizeText(row.url),
      itemType: normalizeText(row.item_type),
      license: normalizeText(row.license),
      author: normalizeText(row.author),
      publishedAt: normalizeText(row.published_at),
      retrievedAt: normalizeText(row.retrieved_at),
      summary: normalizeText(row.summary),
      rawMetadata: normalizeJson(row.raw_metadata_json),
      allowedUse: normalizeText(row.allowed_use),
      reviewStatus: normalizeText(row.review_status),
    })),
    sourceRegistries: sourceRegistryRows.map((row) => ({
      id: normalizeText(row.id),
      name: normalizeText(row.name),
      sourceType: normalizeText(row.source_type),
      allowedUse: normalizeText(row.allowed_use),
      reliability: normalizeText(row.reliability),
      license: normalizeText(row.license),
      attribution: normalizeText(row.attribution),
      homepageUrl: normalizeText(row.homepage_url),
      fetchMethod: normalizeText(row.fetch_method),
      notes: normalizeText(row.notes),
      lastCheckedAt: normalizeText(row.last_checked_at),
      independenceGroup: null,
    })),
    entityReferences: referenceRows.map((row) => ({
      id: normalizeText(row.id),
      entityId: normalizeText(row.entity_id),
      sourceItemId: normalizeText(row.source_item_id),
      relationType: normalizeText(row.relation_type),
      note: normalizeText(row.note),
      reviewStatus: normalizeText(row.review_status),
    })),
    timelineEvents: timelineRows.map((row) => ({
      id: normalizeText(row.id),
      entityId: normalizeText(row.entity_id),
      title: normalizeText(row.title),
      eventType: normalizeText(row.event_type),
      startDate: normalizeText(row.start_date),
      endDate: normalizeText(row.end_date),
      circa: normalizeNumber(row.circa),
      description: normalizeText(row.description),
      sourceItemId: normalizeText(row.source_item_id),
      reviewStatus: normalizeText(row.review_status),
    })),
    primaryMedia: mediaRows.map((row) => ({
      id: normalizeText(row.id),
      entityId: normalizeText(row.entity_id),
      title: normalizeText(row.title),
      assetType: normalizeText(row.asset_type),
      imageUrl: normalizeText(row.image_url),
      thumbnailUrl: normalizeText(row.thumbnail_url),
      localPath: normalizeText(row.local_path),
      author: normalizeText(row.author),
      license: normalizeText(row.license),
      attributionText: normalizeText(row.attribution_text),
      sourceUrl: normalizeText(row.source_url),
      sourceItemId: normalizeText(row.source_item_id),
      reviewStatus: normalizeText(row.review_status),
      usageStatus: normalizeText(row.usage_status),
    })),
    madeBy: madeByRows.map((row) => ({
      id: normalizeText(row.id),
      sourceId: normalizeText(row.source_id),
      targetId: normalizeText(row.target_id),
      linkType: normalizeText(row.link_type),
      reason: normalizeText(row.reason),
    })),
  });
}

export async function computePublicationContentHash(
  db: PublicationDatabase,
  entityId: string,
): Promise<string> {
  const payload = await readPublicationContentPayload(db, entityId);
  return `${PUBLICATION_HASH_PREFIX}${createHash("sha256")
    .update(stableStringify(payload))
    .digest("hex")}`;
}
