import { createHash } from "node:crypto";
import type { AuditReadClient } from "./audit-contracts";

export const LEGACY_PUBLIC_BASELINE_EXCLUSIONS = Object.freeze({
  brand: Object.freeze(["banju", "saier", "shanghai", "yongxu"]),
  pen: Object.freeze([
    "百乐-pilot-custom-823",
    "百利金-pelikan-m800",
    "派克-parker-51-经典-vintage",
    "写乐-sailor-21k-pro-gear-大鱼雷",
    "奥罗拉-aurora",
  ]),
});

export const LEGACY_PUBLIC_BASELINE_COUNTS = Object.freeze({
  brand: 65,
  pen: 231,
  total: 296,
});

export type AuditMigrationBoundary = {
  readonly max_migration: number;
  readonly migration_name: string;
  readonly migration_checksum: string;
};

export type SourceInventoryProvenance = {
  readonly source_inventory_snapshot_id: string;
  readonly source_schema_max_migration: number;
  readonly source_schema_migration_name: string;
  readonly source_schema_migration_checksum: string;
};

export type InventoryAuditProvenance = SourceInventoryProvenance & {
  readonly audit_schema_max_migration: number;
  readonly audit_schema_migration_name: string;
  readonly audit_schema_migration_checksum: string;
  readonly audit_database_kind: "owned_disposable_migrated_copy";
};

export type MadeByDisposition =
  | "not_applicable"
  | "exactly_one"
  | "missing"
  | "multiple"
  | "noncanonical";

export type AuditBlockerDetail = {
  readonly blocker_code: string;
  readonly subject_type: string;
  readonly subject_id: string;
  readonly detail_key: string;
};

export type CurrentReviewState = "approved_current" | "missing_current";

export type InventoryAuditRow = {
  readonly source_inventory_snapshot_id: string;
  readonly entity_id: string;
  readonly entity_type: "brand" | "pen";
  readonly slug: string;
  readonly name: string;
  readonly in_legacy_public_baseline: boolean;
  readonly publication_status: string;
  readonly readiness_contract_version: number;
  readonly is_public: boolean;
  readonly content_ready: boolean;
  readonly blocker_count: number;
  readonly blocker_codes: readonly string[];
  readonly blocker_details: readonly AuditBlockerDetail[];
  readonly story_count: number;
  readonly published_story_count: number;
  readonly backlog_story_count: number;
  readonly model_spec_count: number;
  readonly approved_model_spec_count: number;
  readonly backlog_model_spec_count: number;
  readonly claim_count: number;
  readonly qualified_core_claim_count: number;
  readonly approved_editorial_claim_count: number;
  readonly backlog_claim_count: number;
  readonly reference_count: number;
  readonly qualified_reference_count: number;
  readonly backlog_reference_count: number;
  readonly source_item_count: number;
  readonly qualified_source_item_count: number;
  readonly backlog_source_item_count: number;
  readonly primary_archive_source_group_count: number;
  readonly professional_secondary_source_group_count: number;
  readonly auxiliary_source_group_count: number;
  readonly required_spec_field_count: number;
  readonly qualified_spec_field_count: number;
  readonly missing_spec_field_count: number;
  readonly unresolved_field_conflict_count: number;
  readonly unresolved_identity_conflict_count: number;
  readonly fact_review: CurrentReviewState;
  readonly language_review: CurrentReviewState;
  readonly media_review: CurrentReviewState;
  readonly publication_review: CurrentReviewState;
  readonly primary_media_count: number;
  readonly qualified_primary_media_count: number;
  readonly disposition: string;
  readonly made_by_status: MadeByDisposition;
  readonly made_by_target_ids: readonly string[];
  readonly made_by_target_names: readonly string[];
  readonly made_by_target_types: readonly string[];
  readonly canonical_brand_id: string | null;
  readonly canonical_brand_slug: string | null;
  readonly raw_reverse_model_ids: readonly string[];
  readonly raw_reverse_model_slugs: readonly string[];
  readonly public_reverse_model_ids: readonly string[];
  readonly public_reverse_model_slugs: readonly string[];
  readonly reverse_model_diff_ids: readonly string[];
  readonly reverse_model_diff_slugs: readonly string[];
};

export type InventoryAuditSummary = {
  readonly inventory_audited: number;
  readonly brand_inventory_audited: number;
  readonly pen_inventory_audited: number;
  readonly legacy_public_baseline: number;
  readonly content_ready: number;
  readonly published: number;
  readonly public_entities: number;
  readonly published_blockers: number;
  readonly public_blockers: number;
  readonly backlog: number;
};

export type InventoryAuditResult = {
  readonly provenance: InventoryAuditProvenance;
  readonly rows: readonly InventoryAuditRow[];
  readonly summary: InventoryAuditSummary;
};

export type InventoryAuditVerdict = {
  readonly inventory_complete: boolean;
  readonly content_complete: boolean;
  readonly public_clean: boolean;
  readonly complete: boolean;
};

type RawIdentityRow = {
  id: string;
  type: "brand" | "pen";
  slug: string;
  name: string;
};

type MigrationRow = {
  name: string;
  applied_at: string;
  checksum: string | null;
};

type CountRow = {
  entity_id: string;
  value: number;
};

type PublicationRow = {
  entity_id: string;
  status: string;
  reviewed_contract_version: number | null;
};

type ReadinessRow = {
  entity_id: string;
  contract_version: number;
  blocker_count: number;
};

type BlockerRow = AuditBlockerDetail & {
  entity_id: string;
};

type MadeByRow = {
  pen_id: string;
  pen_slug: string;
  link_id: string;
  target_id: string;
  target_name: string;
  target_slug: string;
  target_type: string;
};

type ReviewRow = {
  entity_id: string;
  review_kind: "fact" | "language" | "media" | "publication";
};

type SourceGroupRow = {
  entity_id: string;
  primary_archive_group_count: number;
  professional_secondary_group_count: number;
  auxiliary_group_count: number;
};

type ConflictCountRow = {
  entity_id: string;
  field_count: number;
  identity_count: number;
};

type EntityCountPairRow = {
  entity_id: string;
  total_count: number;
  qualified_count: number;
};

const LEGACY_EXCLUSION_SETS = {
  brand: new Set<string>(LEGACY_PUBLIC_BASELINE_EXCLUSIONS.brand),
  pen: new Set<string>(LEGACY_PUBLIC_BASELINE_EXCLUSIONS.pen),
} as const;

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function asText(value: unknown, label: string): string {
  if (value === null || value === undefined) {
    throw new Error(`Readiness audit expected ${label}.`);
  }
  return String(value);
}

function asNumber(value: unknown, label: string): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new Error(`Readiness audit expected a non-negative integer for ${label}.`);
  }
  return number;
}

function rawInventory(db: AuditReadClient): RawIdentityRow[] {
  const rows = db.all<Record<string, unknown>>(`
    SELECT id, type, slug, name
    FROM entities
    WHERE type IN ('brand', 'pen')
    ORDER BY type, slug, id
  `);
  const inventory = rows.map((row) => {
    const type = asText(row.type, "entity type");
    if (type !== "brand" && type !== "pen") {
      throw new Error(`Readiness audit encountered unsupported entity type: ${type}.`);
    }
    const entityType: RawIdentityRow["type"] =
      type === "brand" ? "brand" : "pen";
    return {
      id: asText(row.id, "entity id"),
      type: entityType,
      slug: asText(row.slug, "entity slug"),
      name: asText(row.name, "entity name"),
    };
  });
  const identities = inventory.map((row) => row.id);
  if (new Set(identities).size !== identities.length) {
    throw new Error("Readiness audit raw universe contains duplicate identities.");
  }
  const sorted = [...inventory].sort(
    (left, right) =>
      compareText(left.type, right.type) ||
      compareText(left.slug, right.slug) ||
      compareText(left.id, right.id),
  );
  if (JSON.stringify(sorted) !== JSON.stringify(inventory)) {
    throw new Error("Readiness audit raw universe is not deterministically sorted.");
  }
  return inventory;
}

function inventorySnapshotId(rows: readonly RawIdentityRow[]): string {
  const canonical = rows.map(({ id, type, slug }) => ({ id, type, slug }));
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(canonical))
    .digest("hex")}`;
}

function migrationBoundary(db: AuditReadClient): AuditMigrationBoundary {
  const rows = db.all<MigrationRow>(`
    SELECT name, applied_at, checksum
    FROM migrations
    WHERE name GLOB '[0-9][0-9][0-9]_*'
    ORDER BY CAST(substr(name, 1, 3) AS INTEGER), name
  `);
  if (rows.length === 0) {
    throw new Error("Readiness audit found no canonical three-digit migration provenance.");
  }
  const normalized = rows.map((row) => {
    const name = asText(row.name, "migration name");
    if (!/^\d{3}_/.test(name)) {
      throw new Error(`Readiness audit rejected non-canonical migration name: ${name}.`);
    }
    return {
      max_migration: Number(name.slice(0, 3)),
      migration_name: name,
      applied_at: row.applied_at,
      migration_checksum: row.checksum,
    };
  });
  const maxMigration = Math.max(...normalized.map((row) => row.max_migration));
  const boundaryRows = normalized.filter(
    (row) => row.max_migration === maxMigration,
  );
  if (boundaryRows.length !== 1) {
    throw new Error(
      `Readiness audit migration boundary ${maxMigration} is ambiguous: ${boundaryRows
        .map((row) => row.migration_name)
        .join(", ")}.`,
    );
  }
  const boundary = boundaryRows[0]!;
  if (!boundary.applied_at || String(boundary.applied_at).trim() === "") {
    throw new Error(
      `Readiness audit migration ${boundary.migration_name} has no applied_at provenance.`,
    );
  }
  if (
    !boundary.migration_checksum ||
    !/^[0-9a-f]{64}$/.test(String(boundary.migration_checksum))
  ) {
    throw new Error(
      `Readiness audit migration ${boundary.migration_name} has an invalid checksum.`,
    );
  }
  return {
    max_migration: boundary.max_migration,
    migration_name: boundary.migration_name,
    migration_checksum: String(boundary.migration_checksum),
  };
}

function assertExactSet(
  actualValues: readonly string[],
  expectedValues: readonly string[],
  label: string,
): void {
  if (new Set(actualValues).size !== actualValues.length) {
    throw new Error(`${label} contains duplicate identities.`);
  }
  const actual = new Set(actualValues);
  const expected = new Set(expectedValues);
  const actualOnly = [...actual]
    .filter((value) => !expected.has(value))
    .sort(compareText);
  const expectedOnly = [...expected]
    .filter((value) => !actual.has(value))
    .sort(compareText);
  if (actualOnly.length > 0 || expectedOnly.length > 0) {
    throw new Error(
      `${label} differs from the raw universe; actual-only=${actualOnly.join(",") || "none"}; expected-only=${expectedOnly.join(",") || "none"}.`,
    );
  }
}

function countMap(rows: readonly CountRow[]): Map<string, number> {
  return new Map(
    rows.map((row) => [
      asText(row.entity_id, "count entity id"),
      asNumber(row.value, "count value"),
    ]),
  );
}

function countPairMap(
  rows: readonly EntityCountPairRow[],
): Map<string, { total: number; qualified: number }> {
  return new Map(
    rows.map((row) => [
      asText(row.entity_id, "count entity id"),
      {
        total: asNumber(row.total_count, "total count"),
        qualified: asNumber(row.qualified_count, "qualified count"),
      },
    ]),
  );
}

function groupedRows<Row>(
  rows: readonly Row[],
  key: (row: Row) => string,
): Map<string, Row[]> {
  const grouped = new Map<string, Row[]>();
  for (const row of rows) {
    const group = grouped.get(key(row)) ?? [];
    group.push(row);
    grouped.set(key(row), group);
  }
  return grouped;
}

function legacyBaselineMember(row: RawIdentityRow): boolean {
  return !LEGACY_EXCLUSION_SETS[row.type].has(row.slug);
}

function currentReviewState(
  reviewKinds: ReadonlySet<string>,
  kind: ReviewRow["review_kind"],
): CurrentReviewState {
  return reviewKinds.has(kind) ? "approved_current" : "missing_current";
}

function rowDisposition(
  entityType: RawIdentityRow["type"],
  publicationStatus: string,
  contentReady: boolean,
  blockerCodes: readonly string[],
  madeByStatus: MadeByDisposition,
): string {
  const parts = [
    `publication=${publicationStatus}`,
    `readiness=${contentReady ? "ready" : "blocked"}`,
  ];
  if (entityType === "pen") parts.push(`made_by=${madeByStatus}`);
  if (blockerCodes.length > 0) {
    parts.push(`blockers=${blockerCodes.join("|")}`);
  }
  return parts.join(";");
}

export function captureSourceInventoryProvenance(
  db: AuditReadClient,
): SourceInventoryProvenance {
  const inventory = rawInventory(db);
  const migration = migrationBoundary(db);
  return {
    source_inventory_snapshot_id: inventorySnapshotId(inventory),
    source_schema_max_migration: migration.max_migration,
    source_schema_migration_name: migration.migration_name,
    source_schema_migration_checksum: migration.migration_checksum,
  };
}

export function captureInventoryAuditProvenance(
  db: AuditReadClient,
  source: SourceInventoryProvenance,
): InventoryAuditProvenance {
  const auditInventorySnapshotId = inventorySnapshotId(rawInventory(db));
  if (auditInventorySnapshotId !== source.source_inventory_snapshot_id) {
    throw new Error(
      "Readiness audit copy inventory differs from the pre-migration source snapshot.",
    );
  }
  const migration = migrationBoundary(db);
  if (migration.max_migration < 31) {
    throw new Error(
      `Readiness audit requires canonical migration 031 on the owned copy; found ${migration.migration_name}.`,
    );
  }
  for (const view of [
    "publication_v2_qualified_source_items",
    "publication_v2_field_evidence",
    "publication_v2_qualified_core_claims",
    "publication_v2_current_reviews",
    "public_entity_readiness",
    "public_entities",
  ]) {
    const found = db.get<{ name: string }>(
      "SELECT name FROM sqlite_schema WHERE type = 'view' AND name = ?",
      [view],
    );
    if (!found) {
      throw new Error(`Readiness audit copy is missing contract-v2 view: ${view}.`);
    }
  }
  return {
    ...source,
    audit_schema_max_migration: migration.max_migration,
    audit_schema_migration_name: migration.migration_name,
    audit_schema_migration_checksum: migration.migration_checksum,
    audit_database_kind: "owned_disposable_migrated_copy",
  };
}

export function runReadinessAudit(
  db: AuditReadClient,
  provenance: InventoryAuditProvenance,
): InventoryAuditResult {
  if (provenance.audit_database_kind !== "owned_disposable_migrated_copy") {
    throw new Error("Readiness audit requires an owned disposable migrated copy.");
  }
  const inventory = rawInventory(db);
  if (inventorySnapshotId(inventory) !== provenance.source_inventory_snapshot_id) {
    throw new Error("Readiness audit inventory no longer matches source provenance.");
  }
  const currentBoundary = migrationBoundary(db);
  if (
    currentBoundary.max_migration !== provenance.audit_schema_max_migration ||
    currentBoundary.migration_name !== provenance.audit_schema_migration_name ||
    currentBoundary.migration_checksum !==
      provenance.audit_schema_migration_checksum
  ) {
    throw new Error("Readiness audit schema provenance changed before the scan.");
  }

  const inventoryIds = inventory.map((row) => row.id);
  const publications = new Map(
    db
      .all<PublicationRow>(`
        SELECT entity_id, status, reviewed_contract_version
        FROM entity_publications
        ORDER BY entity_id
      `)
      .map((row) => [row.entity_id, row]),
  );
  const readinessRows = db.all<ReadinessRow>(`
    SELECT readiness.entity_id, readiness.contract_version, readiness.blocker_count
    FROM public_entity_readiness readiness
    JOIN entities entity ON entity.id = readiness.entity_id
    WHERE entity.type IN ('brand', 'pen')
    ORDER BY entity.type, entity.slug, entity.id
  `);
  assertExactSet(
    readinessRows.map((row) => row.entity_id),
    inventoryIds,
    "Readiness identities",
  );
  const readiness = new Map(readinessRows.map((row) => [row.entity_id, row]));
  const publicIds = new Set(
    db
      .all<{ id: string }>(`
        SELECT id
        FROM public_entities
        WHERE type IN ('brand', 'pen')
        ORDER BY type, slug, id
      `)
      .map((row) => row.id),
  );
  for (const publicId of publicIds) {
    if (!readiness.has(publicId)) {
      throw new Error(`Public identity is outside the raw audit universe: ${publicId}.`);
    }
  }

  const blockerRows = db.all<BlockerRow>(`
    SELECT blocker.entity_id, blocker.blocker_code, blocker.subject_type,
           blocker.subject_id, blocker.detail_key
    FROM publication_blockers blocker
    JOIN entities entity ON entity.id = blocker.entity_id
    WHERE entity.type IN ('brand', 'pen')
      AND blocker.contract_version = 2
    ORDER BY blocker.entity_id, blocker.blocker_code, blocker.subject_type,
             blocker.subject_id, blocker.detail_key
  `);
  const blockers = groupedRows(blockerRows, (row) => row.entity_id);

  const stories = countPairMap(
    db.all<EntityCountPairRow>(`
      SELECT entity.id AS entity_id,
             count(story.id) AS total_count,
             count(CASE
               WHEN story.status = 'published'
                AND story.story_type = CASE
                  WHEN entity.type = 'brand' THEN 'brand_story'
                  ELSE 'model_story'
                END
               THEN 1
             END) AS qualified_count
      FROM entities entity
      LEFT JOIN stories story ON story.entity_id = entity.id
      WHERE entity.type IN ('brand', 'pen')
      GROUP BY entity.id
      ORDER BY entity.id
    `),
  );
  const specs = countPairMap(
    db.all<EntityCountPairRow>(`
      SELECT entity.id AS entity_id,
             count(spec.id) AS total_count,
             count(CASE WHEN spec.review_status = 'approved' THEN 1 END)
               AS qualified_count
      FROM entities entity
      LEFT JOIN model_specs spec ON spec.entity_id = entity.id
      WHERE entity.type IN ('brand', 'pen')
      GROUP BY entity.id
      ORDER BY entity.id
    `),
  );
  const claimTotals = countMap(
    db.all<CountRow>(`
      SELECT entity.id AS entity_id, count(DISTINCT owner.claim_id) AS value
      FROM entities entity
      LEFT JOIN publication_payload_claim_entities owner
        ON owner.entity_id = entity.id
      WHERE entity.type IN ('brand', 'pen')
      GROUP BY entity.id
      ORDER BY entity.id
    `),
  );
  const qualifiedCoreClaims = countMap(
    db.all<CountRow>(`
      SELECT entity_id, count(DISTINCT claim_id) AS value
      FROM publication_v2_qualified_core_claims
      GROUP BY entity_id
      ORDER BY entity_id
    `),
  );
  const approvedEditorialClaims = countMap(
    db.all<CountRow>(`
      SELECT owner.entity_id, count(DISTINCT claim.id) AS value
      FROM publication_payload_claim_entities owner
      JOIN claims claim ON claim.id = owner.claim_id
      WHERE claim.review_status = 'approved' AND claim.fact_class = 'editorial'
      GROUP BY owner.entity_id
      ORDER BY owner.entity_id
    `),
  );
  const references = countPairMap(
    db.all<EntityCountPairRow>(`
      SELECT entity.id AS entity_id,
             count(reference.id) AS total_count,
             count(CASE
               WHEN reference.review_status = 'approved'
                AND qualified.source_item_id IS NOT NULL
               THEN 1
             END) AS qualified_count
      FROM entities entity
      LEFT JOIN entity_references reference ON reference.entity_id = entity.id
      LEFT JOIN publication_v2_qualified_source_items qualified
        ON qualified.source_item_id = reference.source_item_id
      WHERE entity.type IN ('brand', 'pen')
      GROUP BY entity.id
      ORDER BY entity.id
    `),
  );
  const sourceItems = countPairMap(
    db.all<EntityCountPairRow>(`
      SELECT entity.id AS entity_id,
             count(DISTINCT owner.source_item_id) AS total_count,
             count(DISTINCT CASE
               WHEN qualified.source_item_id IS NOT NULL THEN owner.source_item_id
             END) AS qualified_count
      FROM entities entity
      LEFT JOIN publication_source_item_entities owner
        ON owner.entity_id = entity.id
      LEFT JOIN publication_v2_qualified_source_items qualified
        ON qualified.source_item_id = owner.source_item_id
      WHERE entity.type IN ('brand', 'pen')
      GROUP BY entity.id
      ORDER BY entity.id
    `),
  );
  const sourceGroups = new Map(
    db
      .all<SourceGroupRow>(`
        SELECT entity_id, primary_archive_group_count,
               professional_secondary_group_count, auxiliary_group_count
        FROM publication_v2_source_group_counts
        ORDER BY entity_id
      `)
      .map((row) => [row.entity_id, row]),
  );
  const requiredFields = countMap(
    db.all<CountRow>(`
      SELECT entity_id, count(*) AS value
      FROM publication_v2_required_spec_fields
      GROUP BY entity_id
      ORDER BY entity_id
    `),
  );
  const qualifiedFields = countMap(
    db.all<CountRow>(`
      SELECT entity_id, count(*) AS value
      FROM (
        SELECT DISTINCT entity_id, model_spec_id, field_key
        FROM publication_v2_field_evidence
      ) qualified
      GROUP BY entity_id
      ORDER BY entity_id
    `),
  );
  const conflicts = new Map(
    db
      .all<ConflictCountRow>(`
        SELECT entity.id AS entity_id,
               count(CASE WHEN conflict.conflict_kind = 'field' THEN 1 END)
                 AS field_count,
               count(CASE
                 WHEN conflict.conflict_kind IN ('identity', 'made_by') THEN 1
               END) AS identity_count
        FROM entities entity
        LEFT JOIN publication_v2_unresolved_conflicts conflict
          ON conflict.entity_id = entity.id
        WHERE entity.type IN ('brand', 'pen')
        GROUP BY entity.id
        ORDER BY entity.id
      `)
      .map((row) => [row.entity_id, row]),
  );
  const reviews = new Map<string, Set<string>>();
  for (const row of db.all<ReviewRow>(`
    SELECT entity_id, review_kind
    FROM publication_v2_current_reviews
    ORDER BY entity_id, review_kind
  `)) {
    const kinds = reviews.get(row.entity_id) ?? new Set<string>();
    kinds.add(row.review_kind);
    reviews.set(row.entity_id, kinds);
  }
  const media = countPairMap(
    db.all<EntityCountPairRow>(`
      SELECT entity.id AS entity_id,
             count(CASE WHEN media.usage_status = 'primary' THEN 1 END)
               AS total_count,
             count(DISTINCT qualified.media_id) AS qualified_count
      FROM entities entity
      LEFT JOIN media_assets media ON media.entity_id = entity.id
      LEFT JOIN publication_v2_qualified_primary_media qualified
        ON qualified.media_id = media.id
      WHERE entity.type IN ('brand', 'pen')
      GROUP BY entity.id
      ORDER BY entity.id
    `),
  );

  const madeByRows = db.all<MadeByRow>(`
    SELECT pen.id AS pen_id, pen.slug AS pen_slug, link.id AS link_id,
           target.id AS target_id, target.name AS target_name,
           target.slug AS target_slug, target.type AS target_type
    FROM entities pen
    JOIN entity_links link
      ON link.source_id = pen.id AND link.link_type = 'made_by'
    JOIN entities target ON target.id = link.target_id
    WHERE pen.type = 'pen'
    ORDER BY pen.slug, pen.id, target.type, target.slug, target.id, link.id
  `);
  const madeBy = groupedRows(madeByRows, (row) => row.pen_id);
  const rawReverse = new Map<string, MadeByRow[]>();
  for (const row of madeByRows) {
    if (row.target_type !== "brand") continue;
    const models = rawReverse.get(row.target_id) ?? [];
    if (!models.some((model) => model.pen_id === row.pen_id)) models.push(row);
    rawReverse.set(row.target_id, models);
  }
  for (const models of rawReverse.values()) {
    models.sort(
      (left, right) =>
        compareText(left.pen_slug, right.pen_slug) ||
        compareText(left.pen_id, right.pen_id),
    );
  }

  const rows: InventoryAuditRow[] = inventory.map((entity) => {
    const publication = publications.get(entity.id);
    const readinessRow = readiness.get(entity.id);
    if (!readinessRow || Number(readinessRow.contract_version) !== 2) {
      throw new Error(`Contract-v2 readiness row missing for ${entity.id}.`);
    }
    const blockerDetails = (blockers.get(entity.id) ?? []).map((blocker) => ({
      blocker_code: blocker.blocker_code,
      subject_type: blocker.subject_type,
      subject_id: blocker.subject_id,
      detail_key: blocker.detail_key,
    }));
    if (asNumber(readinessRow.blocker_count, "readiness blocker count") !== blockerDetails.length) {
      throw new Error(`Readiness blocker count diverged for ${entity.id}.`);
    }
    const blockerCodes = [...new Set(blockerDetails.map((row) => row.blocker_code))].sort(
      compareText,
    );
    const contentReady = blockerDetails.length === 0;
    const storyCounts = stories.get(entity.id) ?? { total: 0, qualified: 0 };
    const specCounts = specs.get(entity.id) ?? { total: 0, qualified: 0 };
    const claimCount = claimTotals.get(entity.id) ?? 0;
    const coreClaimCount = qualifiedCoreClaims.get(entity.id) ?? 0;
    const editorialClaimCount = approvedEditorialClaims.get(entity.id) ?? 0;
    const referenceCounts = references.get(entity.id) ?? {
      total: 0,
      qualified: 0,
    };
    const sourceItemCounts = sourceItems.get(entity.id) ?? {
      total: 0,
      qualified: 0,
    };
    const groupCounts = sourceGroups.get(entity.id);
    const requiredFieldCount = requiredFields.get(entity.id) ?? 0;
    const qualifiedFieldCount = qualifiedFields.get(entity.id) ?? 0;
    if (qualifiedFieldCount > requiredFieldCount) {
      throw new Error(`Qualified spec fields exceed required fields for ${entity.id}.`);
    }
    const conflictCounts = conflicts.get(entity.id);
    const reviewKinds = reviews.get(entity.id) ?? new Set<string>();
    const mediaCounts = media.get(entity.id) ?? { total: 0, qualified: 0 };

    let madeByStatus: MadeByDisposition = "not_applicable";
    let canonicalBrandId: string | null = null;
    let canonicalBrandSlug: string | null = null;
    const penMadeBy = entity.type === "pen" ? (madeBy.get(entity.id) ?? []) : [];
    if (entity.type === "pen") {
      if (penMadeBy.length === 0) madeByStatus = "missing";
      else if (penMadeBy.length > 1) madeByStatus = "multiple";
      else if (penMadeBy[0]?.target_type !== "brand") madeByStatus = "noncanonical";
      else {
        madeByStatus = "exactly_one";
        canonicalBrandId = penMadeBy[0]!.target_id;
        canonicalBrandSlug = penMadeBy[0]!.target_slug;
      }
    }

    const rawModels = entity.type === "brand" ? (rawReverse.get(entity.id) ?? []) : [];
    const publicModels = rawModels.filter((model) => publicIds.has(model.pen_id));
    const publicModelIds = new Set(publicModels.map((model) => model.pen_id));
    const differenceModels = rawModels.filter(
      (model) => !publicModelIds.has(model.pen_id),
    );
    const publicationStatus = publication?.status ?? "missing";
    return {
      source_inventory_snapshot_id: provenance.source_inventory_snapshot_id,
      entity_id: entity.id,
      entity_type: entity.type,
      slug: entity.slug,
      name: entity.name,
      in_legacy_public_baseline: legacyBaselineMember(entity),
      publication_status: publicationStatus,
      readiness_contract_version: Number(readinessRow.contract_version),
      is_public: publicIds.has(entity.id),
      content_ready: contentReady,
      blocker_count: blockerDetails.length,
      blocker_codes: blockerCodes,
      blocker_details: blockerDetails,
      story_count: storyCounts.total,
      published_story_count: storyCounts.qualified,
      backlog_story_count: storyCounts.total - storyCounts.qualified,
      model_spec_count: specCounts.total,
      approved_model_spec_count: specCounts.qualified,
      backlog_model_spec_count: specCounts.total - specCounts.qualified,
      claim_count: claimCount,
      qualified_core_claim_count: coreClaimCount,
      approved_editorial_claim_count: editorialClaimCount,
      backlog_claim_count: Math.max(
        0,
        claimCount - coreClaimCount - editorialClaimCount,
      ),
      reference_count: referenceCounts.total,
      qualified_reference_count: referenceCounts.qualified,
      backlog_reference_count:
        referenceCounts.total - referenceCounts.qualified,
      source_item_count: sourceItemCounts.total,
      qualified_source_item_count: sourceItemCounts.qualified,
      backlog_source_item_count:
        sourceItemCounts.total - sourceItemCounts.qualified,
      primary_archive_source_group_count: Number(
        groupCounts?.primary_archive_group_count ?? 0,
      ),
      professional_secondary_source_group_count: Number(
        groupCounts?.professional_secondary_group_count ?? 0,
      ),
      auxiliary_source_group_count: Number(
        groupCounts?.auxiliary_group_count ?? 0,
      ),
      required_spec_field_count: requiredFieldCount,
      qualified_spec_field_count: qualifiedFieldCount,
      missing_spec_field_count: requiredFieldCount - qualifiedFieldCount,
      unresolved_field_conflict_count: Number(conflictCounts?.field_count ?? 0),
      unresolved_identity_conflict_count: Number(
        conflictCounts?.identity_count ?? 0,
      ),
      fact_review: currentReviewState(reviewKinds, "fact"),
      language_review: currentReviewState(reviewKinds, "language"),
      media_review: currentReviewState(reviewKinds, "media"),
      publication_review: currentReviewState(reviewKinds, "publication"),
      primary_media_count: mediaCounts.total,
      qualified_primary_media_count: mediaCounts.qualified,
      disposition: rowDisposition(
        entity.type,
        publicationStatus,
        contentReady,
        blockerCodes,
        madeByStatus,
      ),
      made_by_status: madeByStatus,
      made_by_target_ids: penMadeBy.map((row) => row.target_id),
      made_by_target_names: penMadeBy.map((row) => row.target_name),
      made_by_target_types: penMadeBy.map((row) => row.target_type),
      canonical_brand_id: canonicalBrandId,
      canonical_brand_slug: canonicalBrandSlug,
      raw_reverse_model_ids: rawModels.map((row) => row.pen_id),
      raw_reverse_model_slugs: rawModels.map((row) => row.pen_slug),
      public_reverse_model_ids: publicModels.map((row) => row.pen_id),
      public_reverse_model_slugs: publicModels.map((row) => row.pen_slug),
      reverse_model_diff_ids: differenceModels.map((row) => row.pen_id),
      reverse_model_diff_slugs: differenceModels.map((row) => row.pen_slug),
    };
  });

  assertExactSet(
    rows.map((row) => row.entity_id),
    inventoryIds,
    "Final ledger identities",
  );
  if (rows.some((row) => row.content_ready !== (row.blocker_count === 0))) {
    throw new Error("Readiness audit allowed a hard blocker to be offset.");
  }
  if (rows.some((row) => row.is_public && !row.content_ready)) {
    throw new Error("public_entities contains a blocked brand or pen.");
  }

  const summary: InventoryAuditSummary = {
    inventory_audited: rows.length,
    brand_inventory_audited: rows.filter((row) => row.entity_type === "brand")
      .length,
    pen_inventory_audited: rows.filter((row) => row.entity_type === "pen").length,
    legacy_public_baseline: rows.filter((row) => row.in_legacy_public_baseline)
      .length,
    content_ready: rows.filter((row) => row.content_ready).length,
    published: rows.filter((row) => row.publication_status === "published")
      .length,
    public_entities: rows.filter((row) => row.is_public).length,
    published_blockers: rows.filter(
      (row) => row.publication_status === "published" && row.blocker_count > 0,
    ).length,
    public_blockers: rows.filter((row) => row.is_public && row.blocker_count > 0)
      .length,
    backlog: rows.filter((row) => !row.content_ready).length,
  };
  return { provenance, rows, summary };
}

export function inventoryAuditVerdict(
  result: InventoryAuditResult,
): InventoryAuditVerdict {
  const identities = result.rows.map((row) => row.entity_id);
  const inventoryComplete =
    result.rows.length === result.summary.inventory_audited &&
    new Set(identities).size === identities.length &&
    result.summary.brand_inventory_audited +
      result.summary.pen_inventory_audited ===
      result.summary.inventory_audited;
  const contentComplete =
    inventoryComplete &&
    result.summary.backlog === 0 &&
    result.summary.content_ready === result.summary.inventory_audited;
  const publicClean =
    result.summary.published_blockers === 0 &&
    result.summary.public_blockers === 0;
  return {
    inventory_complete: inventoryComplete,
    content_complete: contentComplete,
    public_clean: publicClean,
    complete: inventoryComplete && contentComplete && publicClean,
  };
}

export function assertLockedInventoryBaseline(
  result: InventoryAuditResult,
): void {
  if (
    result.summary.inventory_audited !== 305 ||
    result.summary.brand_inventory_audited !== LEGACY_PUBLIC_BASELINE_COUNTS.brand +
      LEGACY_PUBLIC_BASELINE_EXCLUSIONS.brand.length ||
    result.summary.pen_inventory_audited !== LEGACY_PUBLIC_BASELINE_COUNTS.pen +
      LEGACY_PUBLIC_BASELINE_EXCLUSIONS.pen.length ||
    result.summary.legacy_public_baseline !== LEGACY_PUBLIC_BASELINE_COUNTS.total
  ) {
    throw new Error(
      `Locked inventory baseline mismatch: ${JSON.stringify(result.summary)}.`,
    );
  }
  const actualExclusions = result.rows
    .filter((row) => !row.in_legacy_public_baseline)
    .map((row) => `${row.entity_type}:${row.slug}`)
    .sort(compareText);
  const expectedExclusions = [
    ...LEGACY_PUBLIC_BASELINE_EXCLUSIONS.brand.map(
      (slug) => `brand:${slug}`,
    ),
    ...LEGACY_PUBLIC_BASELINE_EXCLUSIONS.pen.map((slug) => `pen:${slug}`),
  ].sort(compareText);
  if (JSON.stringify(actualExclusions) !== JSON.stringify(expectedExclusions)) {
    throw new Error(
      `Locked legacy exclusion identities mismatch; actual=${actualExclusions.join(",")}; expected=${expectedExclusions.join(",")}.`,
    );
  }
  const nonDraft = result.rows
    .filter((row) => row.publication_status !== "draft")
    .map((row) => `${row.entity_type}:${row.slug}:${row.publication_status}`);
  if (nonDraft.length > 0) {
    throw new Error(
      `Locked post-031 inventory must be all draft; found ${nonDraft.join(",")}.`,
    );
  }
}

export function serializeInventoryNdjson(result: InventoryAuditResult): string {
  if (result.rows.length === 0) return "";
  return `${result.rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
}

const INVENTORY_CSV_COLUMNS = [
  "source_inventory_snapshot_id",
  "entity_id",
  "entity_type",
  "slug",
  "name",
  "in_legacy_public_baseline",
  "publication_status",
  "readiness_contract_version",
  "is_public",
  "content_ready",
  "blocker_count",
  "blocker_codes",
  "blocker_details",
  "story_count",
  "published_story_count",
  "backlog_story_count",
  "model_spec_count",
  "approved_model_spec_count",
  "backlog_model_spec_count",
  "claim_count",
  "qualified_core_claim_count",
  "approved_editorial_claim_count",
  "backlog_claim_count",
  "reference_count",
  "qualified_reference_count",
  "backlog_reference_count",
  "source_item_count",
  "qualified_source_item_count",
  "backlog_source_item_count",
  "primary_archive_source_group_count",
  "professional_secondary_source_group_count",
  "auxiliary_source_group_count",
  "required_spec_field_count",
  "qualified_spec_field_count",
  "missing_spec_field_count",
  "unresolved_field_conflict_count",
  "unresolved_identity_conflict_count",
  "fact_review",
  "language_review",
  "media_review",
  "publication_review",
  "primary_media_count",
  "qualified_primary_media_count",
  "disposition",
  "made_by_status",
  "made_by_target_ids",
  "made_by_target_names",
  "made_by_target_types",
  "canonical_brand_id",
  "canonical_brand_slug",
  "raw_reverse_model_ids",
  "raw_reverse_model_slugs",
  "public_reverse_model_ids",
  "public_reverse_model_slugs",
  "reverse_model_diff_ids",
  "reverse_model_diff_slugs",
] as const satisfies readonly (keyof InventoryAuditRow)[];

function csvCell(value: unknown): string {
  let display: string;
  if (value === null || value === undefined) display = "";
  else if (Array.isArray(value) || typeof value === "object") {
    display = JSON.stringify(value);
  } else {
    display = String(value);
  }
  if (/^[=+\-@]/.test(display)) display = `'${display}`;
  return `"${display.replaceAll('"', '""')}"`;
}

export function serializeInventoryCsv(result: InventoryAuditResult): string {
  const records = [
    INVENTORY_CSV_COLUMNS.map(csvCell).join(","),
    ...result.rows.map((row) =>
      INVENTORY_CSV_COLUMNS.map((column) => csvCell(row[column])).join(","),
    ),
  ];
  return `${records.join("\r\n")}\r\n`;
}

export function serializeInventorySummary(
  result: InventoryAuditResult,
): string {
  return `${JSON.stringify(
    {
      artifact_contract_version: 1,
      provenance: result.provenance,
      summary: result.summary,
      verdict: inventoryAuditVerdict(result),
    },
    null,
    2,
  )}\n`;
}
