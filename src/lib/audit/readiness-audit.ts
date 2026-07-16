import type { AuditReadClient } from "./audit-contracts";

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

export function captureSourceInventoryProvenance(
  _db: AuditReadClient,
): SourceInventoryProvenance {
  throw new Error("readiness audit source provenance is not implemented");
}

export function captureInventoryAuditProvenance(
  _db: AuditReadClient,
  _source: SourceInventoryProvenance,
): InventoryAuditProvenance {
  throw new Error("readiness audit schema provenance is not implemented");
}

export function runReadinessAudit(
  _db: AuditReadClient,
  _provenance: InventoryAuditProvenance,
): InventoryAuditResult {
  throw new Error("readiness audit ledger is not implemented");
}
