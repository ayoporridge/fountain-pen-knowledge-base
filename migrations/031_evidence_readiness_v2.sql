-- Phase 19: normalized evidence and fail-closed publication contract v2.
-- Source-registry defaults are ingestion hints only. Publication qualification
-- always reads explicit provenance persisted on the individual source item.

ALTER TABLE source_registry ADD COLUMN default_source_tier TEXT CHECK (
  default_source_tier IS NULL OR default_source_tier IN (
    'primary',
    'contemporary_archive',
    'professional_secondary',
    'retailer',
    'community',
    'search'
  )
);
ALTER TABLE source_registry ADD COLUMN default_independence_group TEXT CHECK (
  default_independence_group IS NULL
  OR (
    trim(default_independence_group) != ''
    AND default_independence_group = lower(trim(default_independence_group))
    AND default_independence_group NOT GLOB '*[^a-z0-9._:-]*'
  )
);

ALTER TABLE source_items ADD COLUMN source_tier TEXT CHECK (
  source_tier IS NULL OR source_tier IN (
    'primary',
    'contemporary_archive',
    'professional_secondary',
    'retailer',
    'community',
    'search'
  )
);
ALTER TABLE source_items ADD COLUMN independence_group TEXT CHECK (
  independence_group IS NULL OR (
    trim(independence_group) != ''
    AND independence_group = lower(trim(independence_group))
    AND independence_group NOT GLOB '*[^a-z0-9._:-]*'
  )
);
ALTER TABLE source_items ADD COLUMN archive_url TEXT CHECK (
  archive_url IS NULL OR trim(archive_url) != ''
);
ALTER TABLE source_items ADD COLUMN archive_locator TEXT CHECK (
  archive_locator IS NULL OR trim(archive_locator) != ''
);

ALTER TABLE claims ADD COLUMN fact_class TEXT NOT NULL DEFAULT 'unclassified'
CHECK (fact_class IN ('core', 'editorial', 'unclassified'));

CREATE TABLE fact_scopes (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES model_variants(id) ON DELETE SET NULL,
  scope_key TEXT NOT NULL CHECK (trim(scope_key) != ''),
  market TEXT CHECK (market IS NULL OR trim(market) != ''),
  valid_from TEXT CHECK (valid_from IS NULL OR trim(valid_from) != ''),
  valid_to TEXT CHECK (valid_to IS NULL OR trim(valid_to) != ''),
  production_state TEXT CHECK (
    production_state IS NULL OR production_state IN (
      'current', 'historical', 'prototype', 'unknown'
    )
  ),
  nib_scope TEXT CHECK (nib_scope IS NULL OR trim(nib_scope) != ''),
  material_scope TEXT CHECK (material_scope IS NULL OR trim(material_scope) != ''),
  edition_scope TEXT CHECK (edition_scope IS NULL OR trim(edition_scope) != ''),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (valid_from IS NULL OR valid_to IS NULL OR valid_from <= valid_to),
  UNIQUE(entity_id, scope_key)
);

CREATE INDEX idx_fact_scopes_entity
  ON fact_scopes(entity_id, scope_key);
CREATE INDEX idx_fact_scopes_variant
  ON fact_scopes(variant_id);

ALTER TABLE citations ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending'
CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_review'));
ALTER TABLE citations ADD COLUMN evidence_locator TEXT CHECK (
  evidence_locator IS NULL OR trim(evidence_locator) != ''
);
ALTER TABLE citations ADD COLUMN scope_id TEXT REFERENCES fact_scopes(id)
ON DELETE SET NULL;

CREATE TABLE spec_field_evidence (
  id TEXT PRIMARY KEY NOT NULL,
  model_spec_id TEXT NOT NULL REFERENCES model_specs(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL CHECK (
    field_key IN (
      'brand_entity_id',
      'series_name',
      'release_year',
      'origin_country',
      'nib',
      'fill_system',
      'material',
      'dimensions',
      'weight',
      'price_range',
      'status'
    )
  ),
  citation_id TEXT NOT NULL REFERENCES citations(id) ON DELETE CASCADE,
  scope_id TEXT NOT NULL REFERENCES fact_scopes(id) ON DELETE CASCADE,
  evidence_locator TEXT NOT NULL CHECK (trim(evidence_locator) != ''),
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    review_status IN ('pending', 'approved', 'rejected', 'needs_review')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(model_spec_id, field_key, citation_id, scope_id)
);

CREATE INDEX idx_spec_field_evidence_spec_field
  ON spec_field_evidence(model_spec_id, field_key);
CREATE INDEX idx_spec_field_evidence_citation
  ON spec_field_evidence(citation_id);
CREATE INDEX idx_spec_field_evidence_scope
  ON spec_field_evidence(scope_id);

CREATE TABLE claim_evidence (
  id TEXT PRIMARY KEY NOT NULL,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  citation_id TEXT NOT NULL REFERENCES citations(id) ON DELETE CASCADE,
  scope_id TEXT NOT NULL REFERENCES fact_scopes(id) ON DELETE CASCADE,
  evidence_locator TEXT NOT NULL CHECK (trim(evidence_locator) != ''),
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    review_status IN ('pending', 'approved', 'rejected', 'needs_review')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(claim_id, citation_id, scope_id)
);

CREATE INDEX idx_claim_evidence_claim ON claim_evidence(claim_id);
CREATE INDEX idx_claim_evidence_citation ON claim_evidence(citation_id);
CREATE INDEX idx_claim_evidence_scope ON claim_evidence(scope_id);

CREATE TABLE fact_conflicts (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL CHECK (trim(field_key) != ''),
  scope_id TEXT REFERENCES fact_scopes(id) ON DELETE SET NULL,
  conflict_kind TEXT NOT NULL CHECK (
    conflict_kind IN ('field', 'identity', 'made_by')
  ),
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'resolved', 'dismissed')
  ),
  resolution_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (
    status = 'open'
    OR (resolution_note IS NOT NULL AND trim(resolution_note) != '')
  ),
  UNIQUE(entity_id, field_key, scope_id, conflict_kind)
);

CREATE INDEX idx_fact_conflicts_entity_status
  ON fact_conflicts(entity_id, status, conflict_kind);
CREATE INDEX idx_fact_conflicts_scope ON fact_conflicts(scope_id);
CREATE UNIQUE INDEX idx_fact_conflicts_semantic_unique
  ON fact_conflicts(
    entity_id,
    field_key,
    coalesce(scope_id, ''),
    conflict_kind
  );

CREATE TABLE fact_conflict_members (
  id TEXT PRIMARY KEY NOT NULL,
  conflict_id TEXT NOT NULL REFERENCES fact_conflicts(id) ON DELETE CASCADE,
  citation_id TEXT NOT NULL REFERENCES citations(id) ON DELETE CASCADE,
  asserted_value TEXT NOT NULL CHECK (trim(asserted_value) != ''),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(conflict_id, citation_id, asserted_value)
);

CREATE INDEX idx_fact_conflict_members_conflict
  ON fact_conflict_members(conflict_id);
CREATE INDEX idx_fact_conflict_members_citation
  ON fact_conflict_members(citation_id);

CREATE TABLE entity_content_reviews (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  review_kind TEXT NOT NULL CHECK (
    review_kind IN ('fact', 'language', 'media', 'publication')
  ),
  content_hash TEXT NOT NULL CHECK (
    length(content_hash) = 74
    AND substr(content_hash, 1, 10) = 'sha256:v2:'
    AND substr(content_hash, 11) NOT GLOB '*[^0-9a-f]*'
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'revoked')
  ),
  reviewer TEXT,
  reviewed_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (
    status != 'approved'
    OR (
      reviewer IS NOT NULL
      AND trim(reviewer) != ''
      AND reviewed_at IS NOT NULL
      AND trim(reviewed_at) != ''
    )
  ),
  UNIQUE(entity_id, review_kind, content_hash)
);

CREATE INDEX idx_entity_content_reviews_lookup
  ON entity_content_reviews(entity_id, content_hash, review_kind, status);

-- Remove publication views before rebuilding their underlying lifecycle table.
DROP VIEW IF EXISTS public_entities;
DROP VIEW IF EXISTS public_entity_readiness;
DROP VIEW IF EXISTS publication_blockers;
DROP VIEW IF EXISTS publication_public_brands;
DROP VIEW IF EXISTS publication_base_blockers;
DROP VIEW IF EXISTS publication_v2_qualified_primary_media;
DROP VIEW IF EXISTS publication_v2_current_reviews;
DROP VIEW IF EXISTS publication_v2_unresolved_conflicts;
DROP VIEW IF EXISTS publication_v2_missing_core_claim_evidence;
DROP VIEW IF EXISTS publication_v2_required_spec_fields;
DROP VIEW IF EXISTS publication_v2_source_group_counts;
DROP VIEW IF EXISTS publication_v2_source_groups;
DROP VIEW IF EXISTS publication_v2_qualified_core_claims;
DROP VIEW IF EXISTS publication_v2_field_evidence;
DROP VIEW IF EXISTS publication_v2_qualified_source_items;
DROP VIEW IF EXISTS publication_source_item_entities;
DROP VIEW IF EXISTS publication_invalidation_citation_entities;
DROP VIEW IF EXISTS publication_evidence_citation_entities;
DROP VIEW IF EXISTS publication_payload_claim_entities;
DROP VIEW IF EXISTS publication_citation_entities;
DROP VIEW IF EXISTS publication_claim_entities;

-- SQLite reparses every trigger during ALTER TABLE RENAME. Drop the complete
-- publication trigger family while its dependency views/table are absent,
-- then recreate each original name after the v2 schema is coherent.
DROP TRIGGER IF EXISTS publication_entity_insert_draft;
DROP TRIGGER IF EXISTS publication_entity_type_reset;
DROP TRIGGER IF EXISTS publication_entity_content_update;
DROP TRIGGER IF EXISTS publication_entity_content_delete;
DROP TRIGGER IF EXISTS publication_story_insert;
DROP TRIGGER IF EXISTS publication_story_update;
DROP TRIGGER IF EXISTS publication_story_delete;
DROP TRIGGER IF EXISTS publication_model_spec_insert;
DROP TRIGGER IF EXISTS publication_model_spec_update;
DROP TRIGGER IF EXISTS publication_model_spec_delete;
DROP TRIGGER IF EXISTS publication_model_variant_insert;
DROP TRIGGER IF EXISTS publication_model_variant_update;
DROP TRIGGER IF EXISTS publication_model_variant_delete;
DROP TRIGGER IF EXISTS publication_claim_insert;
DROP TRIGGER IF EXISTS publication_claim_update_old;
DROP TRIGGER IF EXISTS publication_claim_update_new;
DROP TRIGGER IF EXISTS publication_claim_delete;
DROP TRIGGER IF EXISTS publication_citation_insert;
DROP TRIGGER IF EXISTS publication_citation_update_old;
DROP TRIGGER IF EXISTS publication_citation_update_new;
DROP TRIGGER IF EXISTS publication_citation_delete;
DROP TRIGGER IF EXISTS publication_source_item_insert;
DROP TRIGGER IF EXISTS publication_source_item_update;
DROP TRIGGER IF EXISTS publication_source_item_delete;
DROP TRIGGER IF EXISTS publication_source_registry_insert;
DROP TRIGGER IF EXISTS publication_source_registry_update;
DROP TRIGGER IF EXISTS publication_source_registry_delete;
DROP TRIGGER IF EXISTS publication_entity_reference_insert;
DROP TRIGGER IF EXISTS publication_entity_reference_update;
DROP TRIGGER IF EXISTS publication_entity_reference_delete;
DROP TRIGGER IF EXISTS publication_timeline_event_insert;
DROP TRIGGER IF EXISTS publication_timeline_event_update;
DROP TRIGGER IF EXISTS publication_timeline_event_delete;
DROP TRIGGER IF EXISTS publication_media_asset_insert;
DROP TRIGGER IF EXISTS publication_media_asset_update;
DROP TRIGGER IF EXISTS publication_media_asset_delete;
DROP TRIGGER IF EXISTS publication_made_by_link_insert;
DROP TRIGGER IF EXISTS publication_made_by_link_update;
DROP TRIGGER IF EXISTS publication_made_by_link_delete;
DROP TRIGGER IF EXISTS publication_publish_insert_guard;
DROP TRIGGER IF EXISTS publication_publish_transition_guard;

-- Contract-v1 approvals cannot be grandfathered into contract v2. Lifecycle
-- identity, revision and creation time survive; retired remains retired and
-- every other row returns to draft with its approval snapshot cleared.
CREATE TABLE entity_publications_v2 (
  entity_id TEXT PRIMARY KEY NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'in_review', 'published', 'retired')
  ),
  depth_tier TEXT CHECK (depth_tier IN ('A', 'B', 'C')),
  quality_score INTEGER CHECK (
    quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100)
  ),
  blockers_json TEXT NOT NULL DEFAULT '[]' CHECK (
    json_valid(blockers_json) AND json_type(blockers_json) = 'array'
  ),
  approved_content_hash TEXT CHECK (
    approved_content_hash IS NULL OR (
      length(approved_content_hash) = 74
      AND substr(approved_content_hash, 1, 10) = 'sha256:v2:'
      AND substr(approved_content_hash, 11) NOT GLOB '*[^0-9a-f]*'
    )
  ),
  content_revision INTEGER NOT NULL DEFAULT 0 CHECK (content_revision >= 0),
  reviewed_content_revision INTEGER CHECK (
    reviewed_content_revision IS NULL OR reviewed_content_revision >= 0
  ),
  reviewed_contract_version INTEGER CHECK (
    reviewed_contract_version IS NULL OR reviewed_contract_version > 0
  ),
  reviewed_by TEXT,
  reviewed_at TEXT,
  published_at TEXT,
  review_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO entity_publications_v2 (
  entity_id,
  status,
  depth_tier,
  quality_score,
  blockers_json,
  approved_content_hash,
  content_revision,
  reviewed_content_revision,
  reviewed_contract_version,
  reviewed_by,
  reviewed_at,
  published_at,
  review_notes,
  created_at,
  updated_at
)
SELECT
  entity_id,
  CASE WHEN status = 'retired' THEN 'retired' ELSE 'draft' END,
  depth_tier,
  quality_score,
  '["contract_v2_review_required"]',
  NULL,
  content_revision,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  review_notes,
  created_at,
  datetime('now')
FROM entity_publications;

DROP TABLE entity_publications;
ALTER TABLE entity_publications_v2 RENAME TO entity_publications;

CREATE INDEX idx_entity_publications_status
  ON entity_publications(status);
CREATE INDEX idx_entity_publications_review_contract
  ON entity_publications(reviewed_contract_version, reviewed_content_revision);

-- Owner maps are shared by invalidation and qualification. Exhibit citations
-- still have no entity owner and remain deliberately unowned.
CREATE VIEW publication_claim_entities (claim_id, entity_id) AS
SELECT id, subject_entity_id
FROM claims
WHERE subject_entity_id IS NOT NULL;

CREATE VIEW publication_citation_entities (citation_id, entity_id) AS
SELECT id, target_id
FROM citations
WHERE target_type = 'entity'
UNION
SELECT citation.id, story.entity_id
FROM citations citation
JOIN stories story
  ON citation.target_type = 'story' AND story.id = citation.target_id
WHERE story.entity_id IS NOT NULL
UNION
SELECT citation.id, event.entity_id
FROM citations citation
JOIN timeline_events event
  ON citation.target_type = 'timeline_event' AND event.id = citation.target_id
WHERE event.entity_id IS NOT NULL
UNION
SELECT citation.id, diagram.entity_id
FROM citations citation
JOIN diagrams diagram
  ON citation.target_type = 'diagram' AND diagram.id = citation.target_id
WHERE diagram.entity_id IS NOT NULL
UNION
SELECT citation.id, spec.entity_id
FROM citations citation
JOIN model_specs spec
  ON citation.target_type = 'model_spec' AND spec.id = citation.target_id
UNION
SELECT citation.id, owner.entity_id
FROM citations citation
JOIN publication_claim_entities owner
  ON citation.target_type = 'claim' AND owner.claim_id = citation.target_id
UNION
SELECT citation.id, owner.entity_id
FROM citations citation
JOIN publication_claim_entities owner ON owner.claim_id = citation.claim_id;

-- This projection matches the claim set read by the canonical publication
-- payload: direct subject claims plus every citation.claim_id pulled in by a
-- citation owned by that entity. Blockers, qualification and invalidation must
-- all use this expanded owner set.
CREATE VIEW publication_payload_claim_entities (claim_id, entity_id) AS
SELECT claim_id, entity_id
FROM publication_claim_entities
UNION
SELECT citation.claim_id, owner.entity_id
FROM citations citation
JOIN publication_citation_entities owner ON owner.citation_id = citation.id
WHERE citation.claim_id IS NOT NULL;

-- Evidence citations can belong to a payload owner even when their target
-- claim has no direct subject_entity_id. Keep this projection separate from
-- the canonical citation-read owner view to avoid a circular view definition.
CREATE VIEW publication_evidence_citation_entities (citation_id, entity_id) AS
SELECT evidence.citation_id, owner.entity_id
FROM claim_evidence evidence
JOIN publication_payload_claim_entities owner ON owner.claim_id = evidence.claim_id
UNION
SELECT evidence.citation_id, spec.entity_id
FROM spec_field_evidence evidence
JOIN model_specs spec ON spec.id = evidence.model_spec_id
UNION
SELECT member.citation_id, conflict.entity_id
FROM fact_conflict_members member
JOIN fact_conflicts conflict ON conflict.id = member.conflict_id;

CREATE VIEW publication_invalidation_citation_entities (citation_id, entity_id) AS
SELECT citation_id, entity_id
FROM publication_citation_entities
UNION
SELECT citation_id, entity_id
FROM publication_evidence_citation_entities;

CREATE VIEW publication_source_item_entities (source_item_id, entity_id) AS
SELECT claim.source_item_id, owner.entity_id
FROM claims claim
JOIN publication_payload_claim_entities owner ON owner.claim_id = claim.id
WHERE claim.source_item_id IS NOT NULL
UNION
SELECT citation.source_item_id, owner.entity_id
FROM citations citation
JOIN publication_invalidation_citation_entities owner
  ON owner.citation_id = citation.id
WHERE citation.source_item_id IS NOT NULL
UNION
SELECT variant.source_item_id, variant.model_entity_id
FROM model_variants variant
WHERE variant.source_item_id IS NOT NULL
UNION
SELECT event.source_item_id, event.entity_id
FROM timeline_events event
WHERE event.source_item_id IS NOT NULL AND event.entity_id IS NOT NULL
UNION
SELECT media.source_item_id, media.entity_id
FROM media_assets media
WHERE media.source_item_id IS NOT NULL AND media.entity_id IS NOT NULL
UNION
SELECT reference.source_item_id, reference.entity_id
FROM entity_references reference;

CREATE VIEW publication_v2_qualified_source_items AS
SELECT
  item.id AS source_item_id,
  item.source_id,
  item.source_tier,
  item.independence_group,
  item.retrieved_at,
  item.archive_url,
  item.archive_locator,
  item.allowed_use AS item_allowed_use,
  registry.allowed_use AS registry_allowed_use
FROM source_items item
JOIN source_registry registry ON registry.id = item.source_id
WHERE item.review_status = 'approved'
  AND item.source_tier IN (
    'primary',
    'contemporary_archive',
    'professional_secondary',
    'retailer',
    'community',
    'search'
  )
  AND item.independence_group IS NOT NULL
  AND trim(item.independence_group) != ''
  AND item.retrieved_at IS NOT NULL
  AND trim(item.retrieved_at) != ''
  AND item.archive_url IS NOT NULL
  AND trim(item.archive_url) != ''
  AND item.archive_locator IS NOT NULL
  AND trim(item.archive_locator) != ''
  AND item.allowed_use IS NOT NULL
  AND item.allowed_use IN (
    'store_full', 'store_excerpt', 'summary_only', 'metadata_only', 'link_only'
  )
  AND registry.allowed_use IN (
    'store_full', 'store_excerpt', 'summary_only', 'metadata_only', 'link_only'
  );

CREATE VIEW publication_v2_field_evidence AS
SELECT DISTINCT
  spec.entity_id,
  evidence.model_spec_id,
  evidence.field_key,
  evidence.id AS evidence_id,
  citation.id AS citation_id,
  evidence.scope_id,
  source.source_item_id,
  source.source_tier,
  source.independence_group
FROM spec_field_evidence evidence
JOIN model_specs spec ON spec.id = evidence.model_spec_id
JOIN fact_scopes scope
  ON scope.id = evidence.scope_id AND scope.entity_id = spec.entity_id
JOIN citations citation
  ON citation.id = evidence.citation_id
  AND citation.target_type = 'model_spec'
  AND citation.target_id = spec.id
  AND citation.scope_id = evidence.scope_id
JOIN publication_v2_qualified_source_items source
  ON source.source_item_id = citation.source_item_id
WHERE spec.review_status = 'approved'
  AND evidence.review_status = 'approved'
  AND citation.review_status = 'approved'
  AND trim(evidence.evidence_locator) != ''
  AND citation.evidence_locator IS NOT NULL
  AND trim(citation.evidence_locator) != ''
  AND NOT EXISTS (
    SELECT 1
    FROM fact_conflicts conflict
    WHERE conflict.entity_id = spec.entity_id
      AND conflict.conflict_kind = 'field'
      AND conflict.status = 'open'
      AND conflict.field_key = evidence.field_key
      AND (conflict.scope_id IS NULL OR conflict.scope_id = evidence.scope_id)
  )
  AND (
    scope.variant_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM model_variants variant
      WHERE variant.id = scope.variant_id
        AND variant.model_entity_id = scope.entity_id
    )
  );

CREATE VIEW publication_v2_qualified_core_claims AS
SELECT DISTINCT
  owner.entity_id,
  claim.id AS claim_id,
  evidence.id AS evidence_id,
  citation.id AS citation_id,
  evidence.scope_id,
  source.source_item_id,
  source.source_tier,
  source.independence_group
FROM claims claim
JOIN publication_payload_claim_entities owner ON owner.claim_id = claim.id
JOIN claim_evidence evidence ON evidence.claim_id = claim.id
JOIN fact_scopes scope
  ON scope.id = evidence.scope_id AND scope.entity_id = owner.entity_id
JOIN citations citation
  ON citation.id = evidence.citation_id
  AND citation.target_type = 'claim'
  AND citation.target_id = claim.id
  AND citation.scope_id = evidence.scope_id
JOIN publication_v2_qualified_source_items source
  ON source.source_item_id = citation.source_item_id
WHERE claim.review_status = 'approved'
  AND claim.fact_class = 'core'
  AND evidence.review_status = 'approved'
  AND citation.review_status = 'approved'
  AND trim(evidence.evidence_locator) != ''
  AND citation.evidence_locator IS NOT NULL
  AND trim(citation.evidence_locator) != ''
  AND (
    scope.variant_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM model_variants variant
      WHERE variant.id = scope.variant_id
        AND variant.model_entity_id = scope.entity_id
    )
  );

CREATE VIEW publication_v2_source_groups AS
SELECT DISTINCT
  entity_id,
  source_tier,
  independence_group
FROM publication_v2_field_evidence
UNION
SELECT DISTINCT
  entity_id,
  source_tier,
  independence_group
FROM publication_v2_qualified_core_claims;

CREATE VIEW publication_v2_source_group_counts AS
SELECT
  entity_id,
  count(DISTINCT CASE
    WHEN source_tier IN ('primary', 'contemporary_archive')
    THEN independence_group
  END) AS primary_archive_group_count,
  count(DISTINCT CASE
    WHEN source_tier = 'professional_secondary'
      AND NOT EXISTS (
        SELECT 1
        FROM publication_v2_source_groups primary_group
        WHERE primary_group.entity_id = publication_v2_source_groups.entity_id
          AND primary_group.independence_group = publication_v2_source_groups.independence_group
          AND primary_group.source_tier IN ('primary', 'contemporary_archive')
      )
    THEN independence_group
  END) AS professional_secondary_group_count,
  count(DISTINCT CASE
    WHEN source_tier IN ('retailer', 'community', 'search')
    THEN independence_group
  END) AS auxiliary_group_count
FROM publication_v2_source_groups
GROUP BY entity_id;

CREATE VIEW publication_v2_required_spec_fields AS
SELECT id AS model_spec_id, entity_id, 'brand_entity_id' AS field_key
FROM model_specs WHERE brand_entity_id IS NOT NULL
UNION ALL
SELECT id, entity_id, 'series_name' FROM model_specs
WHERE series_name IS NOT NULL AND trim(series_name) != ''
UNION ALL
SELECT id, entity_id, 'release_year' FROM model_specs
WHERE release_year IS NOT NULL AND trim(release_year) != ''
UNION ALL
SELECT id, entity_id, 'origin_country' FROM model_specs
WHERE origin_country IS NOT NULL AND trim(origin_country) != ''
UNION ALL
SELECT id, entity_id, 'nib' FROM model_specs
WHERE nib IS NOT NULL AND trim(nib) != ''
UNION ALL
SELECT id, entity_id, 'fill_system' FROM model_specs
WHERE fill_system IS NOT NULL AND trim(fill_system) != ''
UNION ALL
SELECT id, entity_id, 'material' FROM model_specs
WHERE material IS NOT NULL AND trim(material) != ''
UNION ALL
SELECT id, entity_id, 'dimensions' FROM model_specs
WHERE dimensions IS NOT NULL AND trim(dimensions) != ''
UNION ALL
SELECT id, entity_id, 'weight' FROM model_specs
WHERE weight IS NOT NULL AND trim(weight) != ''
UNION ALL
SELECT id, entity_id, 'price_range' FROM model_specs
WHERE price_range IS NOT NULL AND trim(price_range) != ''
UNION ALL
SELECT id, entity_id, 'status' FROM model_specs
WHERE status IS NOT NULL AND trim(status) != '';

-- One row per approved core claim and missing component. The public blocker
-- code remains deliberately low-cardinality; detail_key carries the component.
CREATE VIEW publication_v2_missing_core_claim_evidence AS
SELECT
  owner.entity_id,
  claim.id AS claim_id,
  'citation' AS missing_component,
  claim.id || ':citation' AS detail_key
FROM claims claim
JOIN publication_payload_claim_entities owner ON owner.claim_id = claim.id
WHERE claim.review_status = 'approved'
  AND claim.fact_class = 'core'
  AND NOT EXISTS (
    SELECT 1 FROM claim_evidence evidence
    JOIN citations citation ON citation.id = evidence.citation_id
    WHERE evidence.claim_id = claim.id
      AND evidence.review_status = 'approved'
      AND citation.review_status = 'approved'
      AND citation.target_type = 'claim'
      AND citation.target_id = claim.id
  )
UNION ALL
SELECT
  owner.entity_id,
  claim.id,
  'locator',
  claim.id || ':locator'
FROM claims claim
JOIN publication_payload_claim_entities owner ON owner.claim_id = claim.id
WHERE claim.review_status = 'approved'
  AND claim.fact_class = 'core'
  AND NOT EXISTS (
    SELECT 1 FROM claim_evidence evidence
    JOIN citations citation ON citation.id = evidence.citation_id
    WHERE evidence.claim_id = claim.id
      AND evidence.review_status = 'approved'
      AND citation.review_status = 'approved'
      AND citation.target_type = 'claim'
      AND citation.target_id = claim.id
      AND trim(evidence.evidence_locator) != ''
      AND citation.evidence_locator IS NOT NULL
      AND trim(citation.evidence_locator) != ''
  )
UNION ALL
SELECT
  owner.entity_id,
  claim.id,
  'scope',
  claim.id || ':scope'
FROM claims claim
JOIN publication_payload_claim_entities owner ON owner.claim_id = claim.id
WHERE claim.review_status = 'approved'
  AND claim.fact_class = 'core'
  AND NOT EXISTS (
    SELECT 1 FROM claim_evidence evidence
    JOIN citations citation ON citation.id = evidence.citation_id
    JOIN fact_scopes scope
      ON scope.id = evidence.scope_id
      AND scope.id = citation.scope_id
      AND scope.entity_id = owner.entity_id
    WHERE evidence.claim_id = claim.id
      AND evidence.review_status = 'approved'
      AND citation.review_status = 'approved'
      AND citation.target_type = 'claim'
      AND citation.target_id = claim.id
      AND (
        scope.variant_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM model_variants variant
          WHERE variant.id = scope.variant_id
            AND variant.model_entity_id = scope.entity_id
        )
      )
  )
UNION ALL
SELECT
  owner.entity_id,
  claim.id,
  'source_provenance',
  claim.id || ':source_provenance'
FROM claims claim
JOIN publication_payload_claim_entities owner ON owner.claim_id = claim.id
WHERE claim.review_status = 'approved'
  AND claim.fact_class = 'core'
  AND NOT EXISTS (
    SELECT 1 FROM claim_evidence evidence
    JOIN citations citation
      ON citation.id = evidence.citation_id
      AND citation.target_type = 'claim'
      AND citation.target_id = claim.id
    JOIN publication_v2_qualified_source_items source
      ON source.source_item_id = citation.source_item_id
    WHERE evidence.claim_id = claim.id
      AND evidence.review_status = 'approved'
      AND citation.review_status = 'approved'
  )
UNION ALL
SELECT
  owner.entity_id,
  claim.id,
  'complete_chain',
  claim.id || ':complete_chain'
FROM claims claim
JOIN publication_payload_claim_entities owner ON owner.claim_id = claim.id
WHERE claim.review_status = 'approved'
  AND claim.fact_class = 'core'
  AND NOT EXISTS (
    SELECT 1
    FROM publication_v2_qualified_core_claims qualified
    WHERE qualified.entity_id = owner.entity_id
      AND qualified.claim_id = claim.id
  )
  AND EXISTS (
    SELECT 1 FROM claim_evidence evidence
    JOIN citations citation ON citation.id = evidence.citation_id
    WHERE evidence.claim_id = claim.id
      AND evidence.review_status = 'approved'
      AND citation.review_status = 'approved'
      AND citation.target_type = 'claim'
      AND citation.target_id = claim.id
  )
  AND EXISTS (
    SELECT 1 FROM claim_evidence evidence
    JOIN citations citation ON citation.id = evidence.citation_id
    WHERE evidence.claim_id = claim.id
      AND evidence.review_status = 'approved'
      AND citation.review_status = 'approved'
      AND citation.target_type = 'claim'
      AND citation.target_id = claim.id
      AND trim(evidence.evidence_locator) != ''
      AND citation.evidence_locator IS NOT NULL
      AND trim(citation.evidence_locator) != ''
  )
  AND EXISTS (
    SELECT 1 FROM claim_evidence evidence
    JOIN citations citation ON citation.id = evidence.citation_id
    JOIN fact_scopes scope
      ON scope.id = evidence.scope_id
      AND scope.id = citation.scope_id
      AND scope.entity_id = owner.entity_id
    WHERE evidence.claim_id = claim.id
      AND evidence.review_status = 'approved'
      AND citation.review_status = 'approved'
      AND citation.target_type = 'claim'
      AND citation.target_id = claim.id
      AND (
        scope.variant_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM model_variants variant
          WHERE variant.id = scope.variant_id
            AND variant.model_entity_id = scope.entity_id
        )
      )
  )
  AND EXISTS (
    SELECT 1 FROM claim_evidence evidence
    JOIN citations citation
      ON citation.id = evidence.citation_id
      AND citation.target_type = 'claim'
      AND citation.target_id = claim.id
    JOIN publication_v2_qualified_source_items source
      ON source.source_item_id = citation.source_item_id
    WHERE evidence.claim_id = claim.id
      AND evidence.review_status = 'approved'
      AND citation.review_status = 'approved'
  );

CREATE VIEW publication_v2_unresolved_conflicts AS
SELECT id AS conflict_id, entity_id, field_key, scope_id, conflict_kind
FROM fact_conflicts
WHERE status = 'open';

CREATE VIEW publication_v2_current_reviews AS
SELECT
  review.id AS review_id,
  review.entity_id,
  review.review_kind,
  review.content_hash,
  review.reviewer,
  review.reviewed_at
FROM entity_content_reviews review
JOIN entity_publications publication
  ON publication.entity_id = review.entity_id
  AND publication.approved_content_hash = review.content_hash
WHERE review.status = 'approved';

CREATE VIEW publication_v2_qualified_primary_media AS
SELECT id AS media_id, entity_id
FROM media_assets
WHERE entity_id IS NOT NULL
  AND review_status = 'approved'
  AND usage_status = 'primary'
  AND license IS NOT NULL
  AND trim(license) != ''
  AND lower(trim(license)) IN (
    'cc0',
    'cc0-1.0',
    'public domain',
    'public-domain',
    'cc-by',
    'cc-by-2.0',
    'cc-by-3.0',
    'cc-by-4.0',
    'cc-by-sa',
    'cc-by-sa-2.0',
    'cc-by-sa-3.0',
    'cc-by-sa-4.0',
    'site-original',
    'own-work',
    'permission-granted'
  )
  AND (
    (image_url IS NOT NULL AND trim(image_url) != '')
    OR (local_path IS NOT NULL AND trim(local_path) != '')
    OR (source_url IS NOT NULL AND trim(source_url) != '')
  );

-- Blocker rows are authorization truth. detail_key is deterministic diagnostic
-- identity; blockers_json below is only a sorted cache for operators.
CREATE VIEW publication_base_blockers (
  entity_id,
  contract_version,
  blocker_code,
  subject_type,
  subject_id,
  detail_key
) AS
WITH governed_entities AS (
  SELECT
    entity.id,
    entity.type,
    entity.summary,
    publication.entity_id AS publication_entity_id,
    publication.status AS publication_status,
    publication.approved_content_hash,
    publication.content_revision,
    publication.reviewed_content_revision,
    publication.reviewed_contract_version,
    publication.reviewed_by,
    publication.reviewed_at,
    publication.published_at
  FROM entities entity
  LEFT JOIN entity_publications publication ON publication.entity_id = entity.id
  WHERE entity.type IN ('brand', 'pen') OR publication.entity_id IS NOT NULL
)
SELECT id, 2, 'missing_publication', 'entity', id, id
FROM governed_entities
WHERE publication_entity_id IS NULL
UNION ALL
SELECT id, 2, 'missing_summary', 'entity', id, id
FROM governed_entities
WHERE summary IS NULL OR trim(summary) = ''
UNION ALL
SELECT governed.id, 2, 'missing_published_story', 'entity', governed.id, governed.id
FROM governed_entities governed
WHERE governed.type IN ('brand', 'pen')
  AND NOT EXISTS (
    SELECT 1
    FROM stories story
    WHERE story.entity_id = governed.id
      AND story.status = 'published'
      AND story.story_type = CASE
        WHEN governed.type = 'brand' THEN 'brand_story'
        ELSE 'model_story'
      END
  )
UNION ALL
SELECT governed.id, 2, 'multiple_published_stories', 'entity', governed.id, governed.id
FROM governed_entities governed
WHERE governed.type IN ('brand', 'pen')
  AND 1 < (
    SELECT count(*)
    FROM stories story
    WHERE story.entity_id = governed.id
      AND story.status = 'published'
      AND story.story_type = CASE
        WHEN governed.type = 'brand' THEN 'brand_story'
        ELSE 'model_story'
      END
  )
UNION ALL
SELECT story.entity_id, 2, 'deprecated_story_present', 'story', story.id, story.id
FROM stories story
JOIN governed_entities governed ON governed.id = story.entity_id
WHERE story.status = 'deprecated'
UNION ALL
SELECT id, 2, 'missing_approved_content_hash', 'publication', id, id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND approved_content_hash IS NULL
UNION ALL
SELECT id, 2, 'invalid_approved_content_hash', 'publication', id, id
FROM governed_entities
WHERE approved_content_hash IS NOT NULL
  AND (
    length(approved_content_hash) != 74
    OR substr(approved_content_hash, 1, 10) != 'sha256:v2:'
    OR substr(approved_content_hash, 11) GLOB '*[^0-9a-f]*'
  )
UNION ALL
SELECT id, 2, 'stale_reviewed_revision', 'publication', id, id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND (
    reviewed_content_revision IS NULL
    OR reviewed_content_revision != content_revision
  )
UNION ALL
SELECT id, 2, 'stale_contract_version', 'publication', id, id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND (
    reviewed_contract_version IS NULL
    OR reviewed_contract_version != 2
  )
UNION ALL
SELECT id, 2, 'missing_reviewer', 'publication', id, id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND (reviewed_by IS NULL OR trim(reviewed_by) = '')
UNION ALL
SELECT id, 2, 'missing_reviewed_at', 'publication', id, id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND (reviewed_at IS NULL OR trim(reviewed_at) = '')
UNION ALL
SELECT id, 2, 'missing_published_at', 'publication', id, id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND publication_status = 'published'
  AND (published_at IS NULL OR trim(published_at) = '')
UNION ALL
SELECT owner.entity_id, 2, 'pending_claim_present', 'claim', claim.id, claim.id
FROM claims claim
JOIN publication_payload_claim_entities owner ON owner.claim_id = claim.id
JOIN governed_entities governed ON governed.id = owner.entity_id
WHERE claim.review_status IN ('pending', 'needs_source')
UNION ALL
SELECT owner.entity_id, 2, 'approved_claim_unclassified', 'claim', claim.id, claim.id
FROM claims claim
JOIN publication_payload_claim_entities owner ON owner.claim_id = claim.id
JOIN governed_entities governed ON governed.id = owner.entity_id
WHERE claim.review_status = 'approved'
  AND claim.fact_class = 'unclassified'
UNION ALL
SELECT governed.id, 2, 'missing_approved_core_claim', 'claim', governed.id, governed.id
FROM governed_entities governed
WHERE governed.type IN ('brand', 'pen')
  AND NOT EXISTS (
    SELECT 1
    FROM claims claim
    JOIN publication_payload_claim_entities owner ON owner.claim_id = claim.id
    WHERE owner.entity_id = governed.id
      AND claim.review_status = 'approved'
      AND claim.fact_class = 'core'
  )
UNION ALL
SELECT spec.entity_id, 2, 'spec_needs_source', 'model_spec', spec.id, spec.id
FROM model_specs spec
JOIN governed_entities governed ON governed.id = spec.entity_id
WHERE spec.review_status IN ('pending', 'needs_source')
UNION ALL
SELECT
  required.entity_id,
  2,
  'missing_field_evidence',
  'model_spec_field',
  required.model_spec_id,
  required.model_spec_id || ':' || required.field_key
FROM publication_v2_required_spec_fields required
JOIN governed_entities governed ON governed.id = required.entity_id
WHERE NOT EXISTS (
  SELECT 1
  FROM publication_v2_field_evidence evidence
  WHERE evidence.model_spec_id = required.model_spec_id
    AND evidence.field_key = required.field_key
)
UNION ALL
SELECT
  missing.entity_id,
  2,
  'approved_claim_missing_evidence',
  'claim',
  missing.claim_id,
  missing.detail_key
FROM publication_v2_missing_core_claim_evidence missing
JOIN governed_entities governed ON governed.id = missing.entity_id
UNION ALL
SELECT governed.id, 2, 'missing_primary_or_archive_group', 'source_group', governed.id, governed.id
FROM governed_entities governed
WHERE governed.type IN ('brand', 'pen')
  AND coalesce((
    SELECT counts.primary_archive_group_count
    FROM publication_v2_source_group_counts counts
    WHERE counts.entity_id = governed.id
  ), 0) < 1
UNION ALL
SELECT governed.id, 2, 'missing_professional_secondary_group', 'source_group', governed.id, governed.id
FROM governed_entities governed
WHERE governed.type IN ('brand', 'pen')
  AND coalesce((
    SELECT counts.professional_secondary_group_count
    FROM publication_v2_source_group_counts counts
    WHERE counts.entity_id = governed.id
  ), 0) < 1
UNION ALL
SELECT
  conflict.entity_id,
  2,
  CASE
    WHEN conflict.conflict_kind = 'field' THEN 'unresolved_field_conflict'
    ELSE 'unresolved_identity_conflict'
  END,
  'fact_conflict',
  conflict.conflict_id,
  conflict.conflict_id
FROM publication_v2_unresolved_conflicts conflict
JOIN governed_entities governed ON governed.id = conflict.entity_id
UNION ALL
SELECT governed.id, 2, 'missing_approved_primary_media', 'media_asset', governed.id, governed.id
FROM governed_entities governed
WHERE governed.type IN ('brand', 'pen')
  AND NOT EXISTS (
    SELECT 1
    FROM publication_v2_qualified_primary_media media
    WHERE media.entity_id = governed.id
  )
UNION ALL
SELECT governed.id, 2, 'missing_fact_review', 'content_review', governed.id, 'fact'
FROM governed_entities governed
WHERE governed.publication_entity_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM publication_v2_current_reviews review
    WHERE review.entity_id = governed.id AND review.review_kind = 'fact'
  )
UNION ALL
SELECT governed.id, 2, 'missing_language_review', 'content_review', governed.id, 'language'
FROM governed_entities governed
WHERE governed.publication_entity_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM publication_v2_current_reviews review
    WHERE review.entity_id = governed.id AND review.review_kind = 'language'
  )
UNION ALL
SELECT governed.id, 2, 'missing_media_review', 'content_review', governed.id, 'media'
FROM governed_entities governed
WHERE governed.publication_entity_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM publication_v2_current_reviews review
    WHERE review.entity_id = governed.id AND review.review_kind = 'media'
  )
UNION ALL
SELECT governed.id, 2, 'missing_publication_review', 'content_review', governed.id, 'publication'
FROM governed_entities governed
WHERE governed.publication_entity_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM publication_v2_current_reviews review
    WHERE review.entity_id = governed.id AND review.review_kind = 'publication'
  );

-- A brand has no made_by dependency, preventing a circular brand/pen gate.
CREATE VIEW publication_public_brands (entity_id) AS
SELECT entity.id
FROM entities entity
JOIN entity_publications publication ON publication.entity_id = entity.id
WHERE entity.type = 'brand'
  AND publication.status = 'published'
  AND NOT EXISTS (
    SELECT 1
    FROM publication_base_blockers blocker
    WHERE blocker.entity_id = entity.id
      AND blocker.contract_version = 2
  );

CREATE VIEW publication_blockers (
  entity_id,
  contract_version,
  blocker_code,
  subject_type,
  subject_id,
  detail_key
) AS
SELECT
  entity_id,
  contract_version,
  blocker_code,
  subject_type,
  subject_id,
  detail_key
FROM publication_base_blockers
UNION ALL
SELECT entity.id, 2, 'missing_made_by', 'entity_link', entity.id, entity.id
FROM entities entity
WHERE entity.type = 'pen'
  AND NOT EXISTS (
    SELECT 1
    FROM entity_links link
    WHERE link.source_id = entity.id AND link.link_type = 'made_by'
  )
UNION ALL
SELECT entity.id, 2, 'multiple_made_by', 'entity_link', entity.id, entity.id
FROM entities entity
WHERE entity.type = 'pen'
  AND 1 < (
    SELECT count(*)
    FROM entity_links link
    WHERE link.source_id = entity.id AND link.link_type = 'made_by'
  )
UNION ALL
SELECT
  entity.id,
  2,
  'made_by_brand_not_public',
  'entity_link',
  link.id,
  link.id
FROM entities entity
JOIN entity_links link
  ON link.source_id = entity.id AND link.link_type = 'made_by'
WHERE entity.type = 'pen'
  AND 1 = (
    SELECT count(*)
    FROM entity_links candidate
    WHERE candidate.source_id = entity.id AND candidate.link_type = 'made_by'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM publication_public_brands brand
    WHERE brand.entity_id = link.target_id
  );

CREATE VIEW public_entity_readiness (
  entity_id,
  entity_type,
  contract_version,
  blocker_count,
  blockers_json,
  publishable
) AS
WITH governed_entities AS (
  SELECT entity.id, entity.type
  FROM entities entity
  LEFT JOIN entity_publications publication
    ON publication.entity_id = entity.id
  WHERE entity.type IN ('brand', 'pen') OR publication.entity_id IS NOT NULL
)
SELECT
  governed.id,
  governed.type,
  2,
  (
    SELECT count(*)
    FROM publication_blockers blocker
    WHERE blocker.entity_id = governed.id
      AND blocker.contract_version = 2
  ),
  (
    SELECT json_group_array(ordered.blocker_code)
    FROM (
      SELECT blocker.blocker_code
      FROM publication_blockers blocker
      WHERE blocker.entity_id = governed.id
        AND blocker.contract_version = 2
      ORDER BY
        blocker.blocker_code,
        blocker.subject_type,
        blocker.subject_id,
        blocker.detail_key
    ) ordered
  ),
  CASE WHEN NOT EXISTS (
    SELECT 1
    FROM publication_blockers blocker
    WHERE blocker.entity_id = governed.id
      AND blocker.contract_version = 2
  ) THEN 1 ELSE 0 END
FROM governed_entities governed;

-- public_entities remains the sole authorization predicate. The strict branch
-- is contract v2; the legacy non-brand branch is byte-for-byte compatible with
-- migration 030's intentionally retained universe.
CREATE VIEW public_entities (
  id,
  type,
  slug,
  name,
  summary,
  body_md,
  source,
  created_at,
  updated_at,
  source_url,
  source_file,
  imported_at
) AS
SELECT
  entity.id,
  entity.type,
  entity.slug,
  entity.name,
  entity.summary,
  entity.body_md,
  entity.source,
  entity.created_at,
  entity.updated_at,
  entity.source_url,
  entity.source_file,
  entity.imported_at
FROM entities entity
JOIN entity_publications publication ON publication.entity_id = entity.id
JOIN public_entity_readiness readiness ON readiness.entity_id = entity.id
WHERE publication.status = 'published'
  AND readiness.contract_version = 2
  AND readiness.publishable = 1
  AND readiness.blocker_count = 0
  AND publication.reviewed_contract_version = 2
  AND publication.reviewed_content_revision = publication.content_revision
  AND publication.approved_content_hash IS NOT NULL
UNION ALL
SELECT
  entity.id,
  entity.type,
  entity.slug,
  entity.name,
  entity.summary,
  entity.body_md,
  entity.source,
  entity.created_at,
  entity.updated_at,
  entity.source_url,
  entity.source_file,
  entity.imported_at
FROM entities entity
WHERE entity.type NOT IN ('brand', 'pen')
  AND NOT EXISTS (
    SELECT 1 FROM entity_publications publication
    WHERE publication.entity_id = entity.id
  )
  AND entity.slug NOT IN (
    '百乐-pilot-custom-823',
    '百利金-pelikan-m800',
    '派克-parker-51-经典-vintage',
    '写乐-sailor-21k-pro-gear-大鱼雷',
    '奥罗拉-aurora'
  )
  AND NOT (
    entity.type = 'concept'
    AND entity.slug IN ('italic-nib', 'music-nib', 'rotary-filler')
  )
  AND NOT (
    entity.type = 'article'
    AND entity.slug IN (
      'about-us',
      'contact-us',
      'demonstrator-pens',
      'hommel-s-meteor-fountain-pen-and-its-descendants',
      'how-to-disassemble-and-reassemble-a-parker-51',
      'parker-ivorine-pastel-and-moire-oh-my',
      'personalized-pens-the-malarkey-pen',
      'pilot-iroshizuku-ink-guide',
      'preserving-your-pens-dos-and-don-ts',
      'privacy-policy',
      'readme',
      'soviet-pens',
      'tribute-pens-and-reboots',
      'world-war-ii-and-the-fountain-pen',
      '万特佳',
      '公爵-duke',
      '半句',
      '永续',
      '犀飞利-sheaffer-品牌泛称',
      '灵感提炼'
    )
  );

-- Original Phase 18 trigger names are rebuilt after the generalized table
-- rebuild. Payload mutations monotonically advance content_revision and hide a
-- previously published row while retaining its old hash as audit evidence.
CREATE TRIGGER publication_entity_insert_draft
AFTER INSERT ON entities
WHEN NEW.type IN ('brand', 'pen')
BEGIN
  INSERT INTO entity_publications (
    entity_id, status, blockers_json, content_revision
  ) VALUES (
    NEW.id, 'draft', '["publication_draft"]', 1
  )
  ON CONFLICT(entity_id) DO UPDATE SET
    status = 'draft',
    depth_tier = NULL,
    quality_score = NULL,
    blockers_json = '["publication_draft"]',
    approved_content_hash = NULL,
    content_revision = entity_publications.content_revision + 1,
    reviewed_content_revision = NULL,
    reviewed_contract_version = NULL,
    reviewed_by = NULL,
    reviewed_at = NULL,
    published_at = NULL,
    review_notes = NULL,
    updated_at = datetime('now');
END;

CREATE TRIGGER publication_entity_type_reset
AFTER UPDATE OF type ON entities
WHEN OLD.type IS NOT NEW.type
  AND (
    OLD.type IN ('brand', 'pen')
    OR NEW.type IN ('brand', 'pen')
  )
BEGIN
  INSERT INTO entity_publications (
    entity_id, status, blockers_json, content_revision
  ) VALUES (
    NEW.id, 'draft', '["entity_type_changed"]', 1
  )
  ON CONFLICT(entity_id) DO UPDATE SET
    status = 'draft',
    depth_tier = NULL,
    quality_score = NULL,
    blockers_json = '["entity_type_changed"]',
    approved_content_hash = NULL,
    content_revision = entity_publications.content_revision + 1,
    reviewed_content_revision = NULL,
    reviewed_contract_version = NULL,
    reviewed_by = NULL,
    reviewed_at = NULL,
    published_at = NULL,
    review_notes = NULL,
    updated_at = datetime('now');
END;

CREATE TRIGGER publication_entity_content_update
AFTER UPDATE OF slug, name, summary, body_md, source, source_url, source_file, imported_at
ON entities
WHEN OLD.slug IS NOT NEW.slug
  OR OLD.name IS NOT NEW.name
  OR OLD.summary IS NOT NEW.summary
  OR OLD.body_md IS NOT NEW.body_md
  OR OLD.source IS NOT NEW.source
  OR OLD.source_url IS NOT NEW.source_url
  OR OLD.source_file IS NOT NEW.source_file
  OR OLD.imported_at IS NOT NEW.imported_at
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.id;
END;

CREATE TRIGGER publication_entity_content_delete
BEFORE DELETE ON entities
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.id;
END;

CREATE TRIGGER publication_story_insert
AFTER INSERT ON stories
WHEN NEW.entity_id IS NOT NULL
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.entity_id;
END;

CREATE TRIGGER publication_story_update
AFTER UPDATE ON stories
WHEN OLD.entity_id IS NOT NEW.entity_id
  OR OLD.title IS NOT NEW.title
  OR OLD.story_type IS NOT NEW.story_type
  OR OLD.summary IS NOT NEW.summary
  OR OLD.body_md IS NOT NEW.body_md
  OR OLD.status IS NOT NEW.status
  OR OLD.source_notes IS NOT NEW.source_notes
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (OLD.entity_id, NEW.entity_id);
END;

CREATE TRIGGER publication_story_delete
BEFORE DELETE ON stories
WHEN OLD.entity_id IS NOT NULL
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.entity_id;
END;

CREATE TRIGGER publication_model_spec_insert
AFTER INSERT ON model_specs
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.entity_id;
END;

CREATE TRIGGER publication_model_spec_update
AFTER UPDATE ON model_specs
WHEN OLD.entity_id IS NOT NEW.entity_id
  OR OLD.brand_entity_id IS NOT NEW.brand_entity_id
  OR OLD.series_name IS NOT NEW.series_name
  OR OLD.release_year IS NOT NEW.release_year
  OR OLD.origin_country IS NOT NEW.origin_country
  OR OLD.nib IS NOT NEW.nib
  OR OLD.fill_system IS NOT NEW.fill_system
  OR OLD.material IS NOT NEW.material
  OR OLD.dimensions IS NOT NEW.dimensions
  OR OLD.weight IS NOT NEW.weight
  OR OLD.price_range IS NOT NEW.price_range
  OR OLD.status IS NOT NEW.status
  OR OLD.review_status IS NOT NEW.review_status
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (OLD.entity_id, NEW.entity_id);
END;

CREATE TRIGGER publication_model_spec_delete
BEFORE DELETE ON model_specs
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.entity_id;
END;

CREATE TRIGGER publication_model_variant_insert
AFTER INSERT ON model_variants
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.model_entity_id;
END;

CREATE TRIGGER publication_model_variant_update
AFTER UPDATE ON model_variants
WHEN OLD.model_entity_id IS NOT NEW.model_entity_id
  OR OLD.variant_name IS NOT NEW.variant_name
  OR OLD.release_year IS NOT NEW.release_year
  OR OLD.notes IS NOT NEW.notes
  OR OLD.source_item_id IS NOT NEW.source_item_id
  OR OLD.review_status IS NOT NEW.review_status
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (OLD.model_entity_id, NEW.model_entity_id);
END;

CREATE TRIGGER publication_model_variant_delete
BEFORE DELETE ON model_variants
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.model_entity_id;
END;

CREATE TRIGGER publication_claim_insert
AFTER INSERT ON claims
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.subject_entity_id;
END;

CREATE TRIGGER publication_claim_update_old
BEFORE UPDATE ON claims
WHEN OLD.subject_entity_id IS NOT NEW.subject_entity_id
  OR OLD.subject_text IS NOT NEW.subject_text
  OR OLD.predicate IS NOT NEW.predicate
  OR OLD.object_entity_id IS NOT NEW.object_entity_id
  OR OLD.object_text IS NOT NEW.object_text
  OR OLD.source_item_id IS NOT NEW.source_item_id
  OR OLD.evidence_locator IS NOT NEW.evidence_locator
  OR OLD.confidence IS NOT NEW.confidence
  OR OLD.review_status IS NOT NEW.review_status
  OR OLD.fact_class IS NOT NEW.fact_class
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.subject_entity_id
     OR entity_id IN (
       SELECT owner.entity_id
       FROM citations citation
       JOIN publication_invalidation_citation_entities owner
         ON owner.citation_id = citation.id
       WHERE citation.claim_id = OLD.id
          OR (citation.target_type = 'claim' AND citation.target_id = OLD.id)
     );
END;

CREATE TRIGGER publication_claim_update_new
AFTER UPDATE ON claims
WHEN OLD.subject_entity_id IS NOT NEW.subject_entity_id
  OR OLD.subject_text IS NOT NEW.subject_text
  OR OLD.predicate IS NOT NEW.predicate
  OR OLD.object_entity_id IS NOT NEW.object_entity_id
  OR OLD.object_text IS NOT NEW.object_text
  OR OLD.source_item_id IS NOT NEW.source_item_id
  OR OLD.evidence_locator IS NOT NEW.evidence_locator
  OR OLD.confidence IS NOT NEW.confidence
  OR OLD.review_status IS NOT NEW.review_status
  OR OLD.fact_class IS NOT NEW.fact_class
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.subject_entity_id
     OR entity_id IN (
       SELECT owner.entity_id
       FROM citations citation
       JOIN publication_invalidation_citation_entities owner
         ON owner.citation_id = citation.id
       WHERE citation.claim_id = NEW.id
          OR (citation.target_type = 'claim' AND citation.target_id = NEW.id)
     );
END;

CREATE TRIGGER publication_claim_delete
BEFORE DELETE ON claims
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.subject_entity_id
     OR entity_id IN (
       SELECT owner.entity_id
       FROM citations citation
       JOIN publication_invalidation_citation_entities owner
         ON owner.citation_id = citation.id
       WHERE citation.claim_id = OLD.id
          OR (citation.target_type = 'claim' AND citation.target_id = OLD.id)
     );
END;

CREATE TRIGGER publication_citation_insert
AFTER INSERT ON citations
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id FROM publication_invalidation_citation_entities
    WHERE citation_id = NEW.id
  );
END;

CREATE TRIGGER publication_citation_update_old
BEFORE UPDATE ON citations
WHEN OLD.target_type IS NOT NEW.target_type
  OR OLD.target_id IS NOT NEW.target_id
  OR OLD.source_item_id IS NOT NEW.source_item_id
  OR OLD.claim_id IS NOT NEW.claim_id
  OR OLD.note IS NOT NEW.note
  OR OLD.review_status IS NOT NEW.review_status
  OR OLD.evidence_locator IS NOT NEW.evidence_locator
  OR OLD.scope_id IS NOT NEW.scope_id
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id FROM publication_invalidation_citation_entities
    WHERE citation_id = OLD.id
  );
END;

CREATE TRIGGER publication_citation_update_new
AFTER UPDATE ON citations
WHEN OLD.target_type IS NOT NEW.target_type
  OR OLD.target_id IS NOT NEW.target_id
  OR OLD.source_item_id IS NOT NEW.source_item_id
  OR OLD.claim_id IS NOT NEW.claim_id
  OR OLD.note IS NOT NEW.note
  OR OLD.review_status IS NOT NEW.review_status
  OR OLD.evidence_locator IS NOT NEW.evidence_locator
  OR OLD.scope_id IS NOT NEW.scope_id
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id FROM publication_invalidation_citation_entities
    WHERE citation_id = NEW.id
  );
END;

CREATE TRIGGER publication_citation_delete
BEFORE DELETE ON citations
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id FROM publication_invalidation_citation_entities
    WHERE citation_id = OLD.id
  );
END;

CREATE TRIGGER publication_source_item_insert
AFTER INSERT ON source_items
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id FROM publication_source_item_entities
    WHERE source_item_id = NEW.id
  );
END;

CREATE TRIGGER publication_source_item_update
AFTER UPDATE ON source_items
WHEN OLD.source_id IS NOT NEW.source_id
  OR OLD.title IS NOT NEW.title
  OR OLD.url IS NOT NEW.url
  OR OLD.item_type IS NOT NEW.item_type
  OR OLD.license IS NOT NEW.license
  OR OLD.author IS NOT NEW.author
  OR OLD.published_at IS NOT NEW.published_at
  OR OLD.retrieved_at IS NOT NEW.retrieved_at
  OR OLD.summary IS NOT NEW.summary
  OR OLD.raw_metadata_json IS NOT NEW.raw_metadata_json
  OR OLD.allowed_use IS NOT NEW.allowed_use
  OR OLD.review_status IS NOT NEW.review_status
  OR OLD.source_tier IS NOT NEW.source_tier
  OR OLD.independence_group IS NOT NEW.independence_group
  OR OLD.archive_url IS NOT NEW.archive_url
  OR OLD.archive_locator IS NOT NEW.archive_locator
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id FROM publication_source_item_entities
    WHERE source_item_id IN (OLD.id, NEW.id)
  );
END;

CREATE TRIGGER publication_source_item_delete
BEFORE DELETE ON source_items
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id FROM publication_source_item_entities
    WHERE source_item_id = OLD.id
  );
END;

CREATE TRIGGER publication_source_registry_insert
AFTER INSERT ON source_registry
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT owner.entity_id
    FROM source_items item
    JOIN publication_source_item_entities owner ON owner.source_item_id = item.id
    WHERE item.source_id = NEW.id
  );
END;

CREATE TRIGGER publication_source_registry_update
AFTER UPDATE ON source_registry
WHEN OLD.name IS NOT NEW.name
  OR OLD.source_type IS NOT NEW.source_type
  OR OLD.allowed_use IS NOT NEW.allowed_use
  OR OLD.reliability IS NOT NEW.reliability
  OR OLD.license IS NOT NEW.license
  OR OLD.attribution IS NOT NEW.attribution
  OR OLD.homepage_url IS NOT NEW.homepage_url
  OR OLD.fetch_method IS NOT NEW.fetch_method
  OR OLD.notes IS NOT NEW.notes
  OR OLD.last_checked_at IS NOT NEW.last_checked_at
  OR OLD.default_source_tier IS NOT NEW.default_source_tier
  OR OLD.default_independence_group IS NOT NEW.default_independence_group
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT owner.entity_id
    FROM source_items item
    JOIN publication_source_item_entities owner ON owner.source_item_id = item.id
    WHERE item.source_id IN (OLD.id, NEW.id)
  );
END;

CREATE TRIGGER publication_source_registry_delete
BEFORE DELETE ON source_registry
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT owner.entity_id
    FROM source_items item
    JOIN publication_source_item_entities owner ON owner.source_item_id = item.id
    WHERE item.source_id = OLD.id
  );
END;

CREATE TRIGGER publication_entity_reference_insert
AFTER INSERT ON entity_references
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.entity_id;
END;

CREATE TRIGGER publication_entity_reference_update
AFTER UPDATE ON entity_references
WHEN OLD.entity_id IS NOT NEW.entity_id
  OR OLD.source_item_id IS NOT NEW.source_item_id
  OR OLD.relation_type IS NOT NEW.relation_type
  OR OLD.note IS NOT NEW.note
  OR OLD.review_status IS NOT NEW.review_status
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (OLD.entity_id, NEW.entity_id);
END;

CREATE TRIGGER publication_entity_reference_delete
BEFORE DELETE ON entity_references
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.entity_id;
END;

CREATE TRIGGER publication_timeline_event_insert
AFTER INSERT ON timeline_events
WHEN NEW.entity_id IS NOT NULL
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.entity_id;
END;

CREATE TRIGGER publication_timeline_event_update
AFTER UPDATE ON timeline_events
WHEN OLD.entity_id IS NOT NEW.entity_id
  OR OLD.title IS NOT NEW.title
  OR OLD.event_type IS NOT NEW.event_type
  OR OLD.start_date IS NOT NEW.start_date
  OR OLD.end_date IS NOT NEW.end_date
  OR OLD.circa IS NOT NEW.circa
  OR OLD.description IS NOT NEW.description
  OR OLD.source_item_id IS NOT NEW.source_item_id
  OR OLD.review_status IS NOT NEW.review_status
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (OLD.entity_id, NEW.entity_id);
END;

CREATE TRIGGER publication_timeline_event_delete
BEFORE DELETE ON timeline_events
WHEN OLD.entity_id IS NOT NULL
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.entity_id;
END;

CREATE TRIGGER publication_media_asset_insert
AFTER INSERT ON media_assets
WHEN NEW.entity_id IS NOT NULL
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.entity_id;
END;

CREATE TRIGGER publication_media_asset_update
AFTER UPDATE ON media_assets
WHEN OLD.entity_id IS NOT NEW.entity_id
  OR OLD.title IS NOT NEW.title
  OR OLD.asset_type IS NOT NEW.asset_type
  OR OLD.image_url IS NOT NEW.image_url
  OR OLD.thumbnail_url IS NOT NEW.thumbnail_url
  OR OLD.local_path IS NOT NEW.local_path
  OR OLD.author IS NOT NEW.author
  OR OLD.license IS NOT NEW.license
  OR OLD.attribution_text IS NOT NEW.attribution_text
  OR OLD.source_url IS NOT NEW.source_url
  OR OLD.source_item_id IS NOT NEW.source_item_id
  OR OLD.review_status IS NOT NEW.review_status
  OR OLD.usage_status IS NOT NEW.usage_status
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (OLD.entity_id, NEW.entity_id);
END;

CREATE TRIGGER publication_media_asset_delete
BEFORE DELETE ON media_assets
WHEN OLD.entity_id IS NOT NULL
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.entity_id;
END;

CREATE TRIGGER publication_made_by_link_insert
AFTER INSERT ON entity_links
WHEN NEW.link_type = 'made_by'
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.source_id;
END;

CREATE TRIGGER publication_made_by_link_update
AFTER UPDATE ON entity_links
WHEN (OLD.link_type = 'made_by' OR NEW.link_type = 'made_by')
  AND (
    OLD.source_id IS NOT NEW.source_id
    OR OLD.target_id IS NOT NEW.target_id
    OR OLD.link_type IS NOT NEW.link_type
    OR OLD.reason IS NOT NEW.reason
  )
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (OLD.source_id, NEW.source_id);
END;

CREATE TRIGGER publication_made_by_link_delete
BEFORE DELETE ON entity_links
WHEN OLD.link_type = 'made_by'
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.source_id;
END;

-- Phase 19 normalized payload invalidation.
CREATE TRIGGER fact_scope_variant_insert_guard
BEFORE INSERT ON fact_scopes
WHEN NEW.variant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM model_variants variant
    WHERE variant.id = NEW.variant_id
      AND variant.model_entity_id = NEW.entity_id
  )
BEGIN
  SELECT RAISE(ABORT, 'fact_scope: variant entity mismatch');
END;

CREATE TRIGGER fact_scope_variant_update_guard
BEFORE UPDATE OF entity_id, variant_id ON fact_scopes
WHEN NEW.variant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM model_variants variant
    WHERE variant.id = NEW.variant_id
      AND variant.model_entity_id = NEW.entity_id
  )
BEGIN
  SELECT RAISE(ABORT, 'fact_scope: variant entity mismatch');
END;

CREATE TRIGGER publication_fact_scope_insert
AFTER INSERT ON fact_scopes
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.entity_id;
END;

CREATE TRIGGER publication_fact_scope_update_old
BEFORE UPDATE ON fact_scopes
WHEN OLD.entity_id IS NOT NEW.entity_id
  OR OLD.variant_id IS NOT NEW.variant_id
  OR OLD.scope_key IS NOT NEW.scope_key
  OR OLD.market IS NOT NEW.market
  OR OLD.valid_from IS NOT NEW.valid_from
  OR OLD.valid_to IS NOT NEW.valid_to
  OR OLD.production_state IS NOT NEW.production_state
  OR OLD.nib_scope IS NOT NEW.nib_scope
  OR OLD.material_scope IS NOT NEW.material_scope
  OR OLD.edition_scope IS NOT NEW.edition_scope
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.entity_id;
END;

CREATE TRIGGER publication_fact_scope_update_new
AFTER UPDATE ON fact_scopes
WHEN OLD.entity_id IS NOT NEW.entity_id
  OR OLD.variant_id IS NOT NEW.variant_id
  OR OLD.scope_key IS NOT NEW.scope_key
  OR OLD.market IS NOT NEW.market
  OR OLD.valid_from IS NOT NEW.valid_from
  OR OLD.valid_to IS NOT NEW.valid_to
  OR OLD.production_state IS NOT NEW.production_state
  OR OLD.nib_scope IS NOT NEW.nib_scope
  OR OLD.material_scope IS NOT NEW.material_scope
  OR OLD.edition_scope IS NOT NEW.edition_scope
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.entity_id;
END;

CREATE TRIGGER publication_fact_scope_delete
BEFORE DELETE ON fact_scopes
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.entity_id;
END;

CREATE TRIGGER publication_spec_field_evidence_insert
AFTER INSERT ON spec_field_evidence
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = (
    SELECT entity_id FROM model_specs WHERE id = NEW.model_spec_id
  );
END;

CREATE TRIGGER publication_spec_field_evidence_update_old
BEFORE UPDATE ON spec_field_evidence
WHEN OLD.model_spec_id IS NOT NEW.model_spec_id
  OR OLD.field_key IS NOT NEW.field_key
  OR OLD.citation_id IS NOT NEW.citation_id
  OR OLD.scope_id IS NOT NEW.scope_id
  OR OLD.evidence_locator IS NOT NEW.evidence_locator
  OR OLD.review_status IS NOT NEW.review_status
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = (
    SELECT entity_id FROM model_specs WHERE id = OLD.model_spec_id
  );
END;

CREATE TRIGGER publication_spec_field_evidence_update_new
AFTER UPDATE ON spec_field_evidence
WHEN OLD.model_spec_id IS NOT NEW.model_spec_id
  OR OLD.field_key IS NOT NEW.field_key
  OR OLD.citation_id IS NOT NEW.citation_id
  OR OLD.scope_id IS NOT NEW.scope_id
  OR OLD.evidence_locator IS NOT NEW.evidence_locator
  OR OLD.review_status IS NOT NEW.review_status
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = (
    SELECT entity_id FROM model_specs WHERE id = NEW.model_spec_id
  );
END;

CREATE TRIGGER publication_spec_field_evidence_delete
BEFORE DELETE ON spec_field_evidence
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = (
    SELECT entity_id FROM model_specs WHERE id = OLD.model_spec_id
  );
END;

CREATE TRIGGER publication_claim_evidence_insert
AFTER INSERT ON claim_evidence
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id
    FROM publication_payload_claim_entities
    WHERE claim_id = NEW.claim_id
  );
END;

CREATE TRIGGER publication_claim_evidence_update_old
BEFORE UPDATE ON claim_evidence
WHEN OLD.claim_id IS NOT NEW.claim_id
  OR OLD.citation_id IS NOT NEW.citation_id
  OR OLD.scope_id IS NOT NEW.scope_id
  OR OLD.evidence_locator IS NOT NEW.evidence_locator
  OR OLD.review_status IS NOT NEW.review_status
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id
    FROM publication_payload_claim_entities
    WHERE claim_id = OLD.claim_id
  );
END;

CREATE TRIGGER publication_claim_evidence_update_new
AFTER UPDATE ON claim_evidence
WHEN OLD.claim_id IS NOT NEW.claim_id
  OR OLD.citation_id IS NOT NEW.citation_id
  OR OLD.scope_id IS NOT NEW.scope_id
  OR OLD.evidence_locator IS NOT NEW.evidence_locator
  OR OLD.review_status IS NOT NEW.review_status
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id
    FROM publication_payload_claim_entities
    WHERE claim_id = NEW.claim_id
  );
END;

CREATE TRIGGER publication_claim_evidence_delete
BEFORE DELETE ON claim_evidence
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id
    FROM publication_payload_claim_entities
    WHERE claim_id = OLD.claim_id
  );
END;

CREATE TRIGGER publication_fact_conflict_insert
AFTER INSERT ON fact_conflicts
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.entity_id;
END;

CREATE TRIGGER publication_fact_conflict_update_old
BEFORE UPDATE ON fact_conflicts
WHEN OLD.entity_id IS NOT NEW.entity_id
  OR OLD.field_key IS NOT NEW.field_key
  OR OLD.scope_id IS NOT NEW.scope_id
  OR OLD.conflict_kind IS NOT NEW.conflict_kind
  OR OLD.status IS NOT NEW.status
  OR OLD.resolution_note IS NOT NEW.resolution_note
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.entity_id;
END;

CREATE TRIGGER publication_fact_conflict_update_new
AFTER UPDATE ON fact_conflicts
WHEN OLD.entity_id IS NOT NEW.entity_id
  OR OLD.field_key IS NOT NEW.field_key
  OR OLD.scope_id IS NOT NEW.scope_id
  OR OLD.conflict_kind IS NOT NEW.conflict_kind
  OR OLD.status IS NOT NEW.status
  OR OLD.resolution_note IS NOT NEW.resolution_note
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.entity_id;
END;

CREATE TRIGGER publication_fact_conflict_delete
BEFORE DELETE ON fact_conflicts
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.entity_id;
END;

CREATE TRIGGER publication_fact_conflict_member_insert
AFTER INSERT ON fact_conflict_members
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = (
    SELECT entity_id FROM fact_conflicts WHERE id = NEW.conflict_id
  );
END;

CREATE TRIGGER publication_fact_conflict_member_update_old
BEFORE UPDATE ON fact_conflict_members
WHEN OLD.conflict_id IS NOT NEW.conflict_id
  OR OLD.citation_id IS NOT NEW.citation_id
  OR OLD.asserted_value IS NOT NEW.asserted_value
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = (
    SELECT entity_id FROM fact_conflicts WHERE id = OLD.conflict_id
  );
END;

CREATE TRIGGER publication_fact_conflict_member_update_new
AFTER UPDATE ON fact_conflict_members
WHEN OLD.conflict_id IS NOT NEW.conflict_id
  OR OLD.citation_id IS NOT NEW.citation_id
  OR OLD.asserted_value IS NOT NEW.asserted_value
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = (
    SELECT entity_id FROM fact_conflicts WHERE id = NEW.conflict_id
  );
END;

CREATE TRIGGER publication_fact_conflict_member_delete
BEFORE DELETE ON fact_conflict_members
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = (
    SELECT entity_id FROM fact_conflicts WHERE id = OLD.conflict_id
  );
END;

-- Reviews point to a hash and are intentionally excluded from the payload.
-- Their mutation never changes content_revision, but losing a current approval
-- immediately demotes an already-published lifecycle row.
CREATE TRIGGER publication_content_review_update
AFTER UPDATE ON entity_content_reviews
WHEN OLD.entity_id IS NOT NEW.entity_id
  OR OLD.review_kind IS NOT NEW.review_kind
  OR OLD.content_hash IS NOT NEW.content_hash
  OR OLD.status IS NOT NEW.status
  OR OLD.reviewer IS NOT NEW.reviewer
  OR OLD.reviewed_at IS NOT NEW.reviewed_at
BEGIN
  UPDATE entity_publications
  SET status = 'in_review', updated_at = datetime('now')
  WHERE entity_id IN (OLD.entity_id, NEW.entity_id)
    AND status = 'published'
    AND EXISTS (
      SELECT 1 FROM publication_blockers blocker
      WHERE blocker.entity_id = entity_publications.entity_id
        AND blocker.contract_version = 2
    );
END;

CREATE TRIGGER publication_content_review_delete
AFTER DELETE ON entity_content_reviews
BEGIN
  UPDATE entity_publications
  SET status = 'in_review', updated_at = datetime('now')
  WHERE entity_id = OLD.entity_id
    AND status = 'published'
    AND EXISTS (
      SELECT 1 FROM publication_blockers blocker
      WHERE blocker.entity_id = entity_publications.entity_id
        AND blocker.contract_version = 2
    );
END;

CREATE TRIGGER publication_publish_insert_guard
BEFORE INSERT ON entity_publications
WHEN NEW.status = 'published'
BEGIN
  SELECT RAISE(
    ABORT,
    'publication_guard: published insert requires an existing review row'
  );
END;

CREATE TRIGGER publication_publish_transition_guard
BEFORE UPDATE OF status ON entity_publications
WHEN NEW.status = 'published' AND OLD.status IS NOT 'published'
BEGIN
  SELECT CASE WHEN NEW.approved_content_hash IS NULL
    OR length(NEW.approved_content_hash) != 74
    OR substr(NEW.approved_content_hash, 1, 10) != 'sha256:v2:'
    OR substr(NEW.approved_content_hash, 11) GLOB '*[^0-9a-f]*'
    THEN RAISE(ABORT, 'publication_guard: invalid approved content hash')
  END;
  SELECT CASE WHEN NEW.reviewed_content_revision IS NULL
    OR NEW.reviewed_content_revision != NEW.content_revision
    THEN RAISE(ABORT, 'publication_guard: stale reviewed revision')
  END;
  SELECT CASE WHEN NEW.reviewed_contract_version IS NULL
    OR NEW.reviewed_contract_version != 2
    THEN RAISE(ABORT, 'publication_guard: stale contract version')
  END;
  SELECT CASE WHEN NEW.reviewed_by IS NULL OR trim(NEW.reviewed_by) = ''
    THEN RAISE(ABORT, 'publication_guard: reviewer is required')
  END;
  SELECT CASE WHEN NEW.reviewed_at IS NULL OR trim(NEW.reviewed_at) = ''
    THEN RAISE(ABORT, 'publication_guard: reviewed_at is required')
  END;
  SELECT CASE WHEN NEW.published_at IS NULL OR trim(NEW.published_at) = ''
    THEN RAISE(ABORT, 'publication_guard: published_at is required')
  END;
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1
    FROM public_entity_readiness readiness
    WHERE readiness.entity_id = NEW.entity_id
      AND readiness.contract_version = 2
      AND readiness.blocker_count = 0
      AND readiness.publishable = 1
  ) THEN RAISE(ABORT, 'publication_guard: readiness blockers remain')
  END;
END;
