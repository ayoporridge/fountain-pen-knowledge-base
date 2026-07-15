-- Phase 18: fail-closed publication lifecycle and canonical public universe.
-- blockers_json is a diagnostic snapshot only. Authorization is always derived
-- from the normalized views below and the current source rows.

CREATE TABLE IF NOT EXISTS entity_publications (
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
      AND substr(approved_content_hash, 1, 10) = 'sha256:v1:'
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

CREATE INDEX IF NOT EXISTS idx_entity_publications_status
  ON entity_publications(status);
CREATE INDEX IF NOT EXISTS idx_entity_publications_review_contract
  ON entity_publications(reviewed_contract_version, reviewed_content_revision);

-- Existing brand/pen rows enter the backlog as draft. The upsert also makes a
-- custom pre-030 fixture fail closed if it already created a provisional row.
INSERT INTO entity_publications (
  entity_id,
  status,
  blockers_json,
  content_revision
)
SELECT
  id,
  'draft',
  '["publication_draft"]',
  0
FROM entities
WHERE type IN ('brand', 'pen')
ON CONFLICT(entity_id) DO UPDATE SET
  status = 'draft',
  depth_tier = NULL,
  quality_score = NULL,
  blockers_json = '["publication_draft"]',
  approved_content_hash = NULL,
  reviewed_content_revision = NULL,
  reviewed_contract_version = NULL,
  reviewed_by = NULL,
  reviewed_at = NULL,
  published_at = NULL,
  review_notes = NULL,
  updated_at = datetime('now');

-- Every newly created brand/pen starts at its first unpublished revision.
CREATE TRIGGER IF NOT EXISTS publication_entity_insert_draft
AFTER INSERT ON entities
WHEN NEW.type IN ('brand', 'pen')
BEGIN
  INSERT INTO entity_publications (
    entity_id,
    status,
    blockers_json,
    content_revision
  ) VALUES (
    NEW.id,
    'draft',
    '["publication_draft"]',
    1
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

-- Entering brand/pen, switching brand<->pen, and leaving brand/pen all retain
-- an explicit non-public row and discard approval inherited from the old type.
CREATE TRIGGER IF NOT EXISTS publication_entity_type_reset
AFTER UPDATE OF type ON entities
WHEN OLD.type IS NOT NEW.type
  AND (
    OLD.type IN ('brand', 'pen')
    OR NEW.type IN ('brand', 'pen')
  )
BEGIN
  INSERT INTO entity_publications (
    entity_id,
    status,
    blockers_json,
    content_revision
  ) VALUES (
    NEW.id,
    'draft',
    '["entity_type_changed"]',
    1
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

DROP VIEW IF EXISTS public_entities;
DROP VIEW IF EXISTS public_entity_readiness;
DROP VIEW IF EXISTS publication_blockers;
DROP VIEW IF EXISTS publication_public_brands;
DROP VIEW IF EXISTS publication_base_blockers;
DROP VIEW IF EXISTS publication_source_item_entities;
DROP VIEW IF EXISTS publication_citation_entities;
DROP VIEW IF EXISTS publication_claim_entities;

-- Internal dependency maps keep hash reads and source/citation invalidation on
-- the same owner semantics. Exhibit citations have no entity owner in v1 and
-- are intentionally absent instead of being guessed.
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
JOIN stories story ON citation.target_type = 'story' AND story.id = citation.target_id
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

CREATE VIEW publication_source_item_entities (source_item_id, entity_id) AS
SELECT claim.source_item_id, owner.entity_id
FROM claims claim
JOIN publication_claim_entities owner ON owner.claim_id = claim.id
WHERE claim.source_item_id IS NOT NULL
UNION
SELECT citation.source_item_id, owner.entity_id
FROM citations citation
JOIN publication_citation_entities owner ON owner.citation_id = citation.id
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

-- Common blockers are independent of made_by, so a brand can become public
-- before a pen points to it. This breaks the otherwise circular pen->brand gate.
CREATE VIEW publication_base_blockers (
  entity_id,
  contract_version,
  blocker_code,
  subject_type,
  subject_id
) AS
WITH governed_entities AS (
  SELECT
    e.id,
    e.type,
    e.summary,
    ep.entity_id AS publication_entity_id,
    ep.status,
    ep.approved_content_hash,
    ep.content_revision,
    ep.reviewed_content_revision,
    ep.reviewed_contract_version,
    ep.reviewed_by,
    ep.reviewed_at,
    ep.published_at
  FROM entities e
  LEFT JOIN entity_publications ep ON ep.entity_id = e.id
  WHERE e.type IN ('brand', 'pen') OR ep.entity_id IS NOT NULL
)
SELECT id, 1, 'missing_publication', 'entity', id
FROM governed_entities
WHERE publication_entity_id IS NULL
UNION ALL
SELECT id, 1, 'missing_summary', 'entity', id
FROM governed_entities
WHERE summary IS NULL OR trim(summary) = ''
UNION ALL
SELECT ge.id, 1, 'missing_published_story', 'entity', ge.id
FROM governed_entities ge
WHERE ge.type IN ('brand', 'pen')
  AND NOT EXISTS (
    SELECT 1
    FROM stories s
    WHERE s.entity_id = ge.id
      AND s.status = 'published'
      AND s.story_type = CASE
        WHEN ge.type = 'brand' THEN 'brand_story'
        ELSE 'model_story'
      END
  )
UNION ALL
SELECT ge.id, 1, 'multiple_published_stories', 'entity', ge.id
FROM governed_entities ge
WHERE ge.type IN ('brand', 'pen')
  AND 1 < (
    SELECT count(*)
    FROM stories s
    WHERE s.entity_id = ge.id
      AND s.status = 'published'
      AND s.story_type = CASE
        WHEN ge.type = 'brand' THEN 'brand_story'
        ELSE 'model_story'
      END
  )
UNION ALL
SELECT id, 1, 'missing_approved_content_hash', 'publication', id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND approved_content_hash IS NULL
UNION ALL
SELECT id, 1, 'stale_reviewed_revision', 'publication', id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND (
    reviewed_content_revision IS NULL
    OR reviewed_content_revision != content_revision
  )
UNION ALL
SELECT id, 1, 'stale_contract_version', 'publication', id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND (
    reviewed_contract_version IS NULL
    OR reviewed_contract_version != 1
  )
UNION ALL
SELECT id, 1, 'missing_reviewer', 'publication', id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND (reviewed_by IS NULL OR trim(reviewed_by) = '')
UNION ALL
SELECT id, 1, 'missing_reviewed_at', 'publication', id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND (reviewed_at IS NULL OR trim(reviewed_at) = '')
UNION ALL
SELECT id, 1, 'missing_published_at', 'publication', id
FROM governed_entities
WHERE publication_entity_id IS NOT NULL
  AND status = 'published'
  AND (published_at IS NULL OR trim(published_at) = '');

-- A brand's publication decision never depends on whether it already has a
-- published pen. Pens may therefore use this set without recursive views.
CREATE VIEW publication_public_brands (entity_id) AS
SELECT e.id
FROM entities e
JOIN entity_publications ep ON ep.entity_id = e.id
WHERE e.type = 'brand'
  AND ep.status = 'published'
  AND NOT EXISTS (
    SELECT 1
    FROM publication_base_blockers blocker
    WHERE blocker.entity_id = e.id
      AND blocker.contract_version = 1
  );

CREATE VIEW publication_blockers (
  entity_id,
  contract_version,
  blocker_code,
  subject_type,
  subject_id
) AS
SELECT
  entity_id,
  contract_version,
  blocker_code,
  subject_type,
  subject_id
FROM publication_base_blockers
UNION ALL
SELECT e.id, 1, 'missing_made_by', 'entity_link', e.id
FROM entities e
WHERE e.type = 'pen'
  AND NOT EXISTS (
    SELECT 1
    FROM entity_links link
    WHERE link.source_id = e.id AND link.link_type = 'made_by'
  )
UNION ALL
SELECT e.id, 1, 'multiple_made_by', 'entity_link', e.id
FROM entities e
WHERE e.type = 'pen'
  AND 1 < (
    SELECT count(*)
    FROM entity_links link
    WHERE link.source_id = e.id AND link.link_type = 'made_by'
  )
UNION ALL
SELECT
  e.id,
  1,
  'made_by_brand_not_public',
  'entity_link',
  link.id
FROM entities e
JOIN entity_links link
  ON link.source_id = e.id AND link.link_type = 'made_by'
WHERE e.type = 'pen'
  AND 1 = (
    SELECT count(*)
    FROM entity_links candidate
    WHERE candidate.source_id = e.id AND candidate.link_type = 'made_by'
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
  SELECT e.id, e.type
  FROM entities e
  LEFT JOIN entity_publications ep ON ep.entity_id = e.id
  WHERE e.type IN ('brand', 'pen') OR ep.entity_id IS NOT NULL
)
SELECT
  governed.id,
  governed.type,
  1,
  (
    SELECT count(*)
    FROM publication_blockers blocker
    WHERE blocker.entity_id = governed.id
      AND blocker.contract_version = 1
  ),
  (
    SELECT json_group_array(ordered.blocker_code)
    FROM (
      SELECT blocker_code
      FROM publication_blockers blocker
      WHERE blocker.entity_id = governed.id
        AND blocker.contract_version = 1
      ORDER BY blocker_code, subject_type, subject_id
    ) ordered
  ),
  CASE WHEN NOT EXISTS (
    SELECT 1
    FROM publication_blockers blocker
    WHERE blocker.entity_id = governed.id
      AND blocker.contract_version = 1
  ) THEN 1 ELSE 0 END
FROM governed_entities governed;

-- Explicit columns prevent publication/review internals from leaking through
-- public readers. Strict and legacy branches are disjoint by construction.
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
  e.id,
  e.type,
  e.slug,
  e.name,
  e.summary,
  e.body_md,
  e.source,
  e.created_at,
  e.updated_at,
  e.source_url,
  e.source_file,
  e.imported_at
FROM entities e
JOIN entity_publications ep ON ep.entity_id = e.id
JOIN public_entity_readiness readiness ON readiness.entity_id = e.id
WHERE ep.status = 'published'
  AND readiness.contract_version = 1
  AND readiness.publishable = 1
  AND readiness.blocker_count = 0
  AND ep.reviewed_contract_version = 1
  AND ep.reviewed_content_revision = ep.content_revision
  AND ep.approved_content_hash IS NOT NULL
UNION ALL
SELECT
  e.id,
  e.type,
  e.slug,
  e.name,
  e.summary,
  e.body_md,
  e.source,
  e.created_at,
  e.updated_at,
  e.source_url,
  e.source_file,
  e.imported_at
FROM entities e
WHERE e.type NOT IN ('brand', 'pen')
  AND NOT EXISTS (
    SELECT 1 FROM entity_publications ep WHERE ep.entity_id = e.id
  )
  AND e.slug NOT IN (
    '百乐-pilot-custom-823',
    '百利金-pelikan-m800',
    '派克-parker-51-经典-vintage',
    '写乐-sailor-21k-pro-gear-大鱼雷',
    '奥罗拉-aurora'
  )
  AND NOT (
    e.type = 'concept'
    AND e.slug IN ('italic-nib', 'music-nib', 'rotary-filler')
  )
  AND NOT (
    e.type = 'article'
    AND e.slug IN (
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

-- Invalidation keeps the last approved hash as audit evidence. A monotonic
-- revision mismatch removes the entity immediately; only a published row moves
-- back to in_review so draft/retired workflow choices are preserved.
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

-- BEFORE captures the old subject and all citation owners; AFTER captures the
-- new topology. Unchanged owners may increment twice, which is conservatively
-- monotonic and required because SQLite row triggers have no statement scope.
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
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = OLD.subject_entity_id
     OR entity_id IN (
       SELECT owner.entity_id
       FROM citations citation
       JOIN publication_citation_entities owner ON owner.citation_id = citation.id
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
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id = NEW.subject_entity_id
     OR entity_id IN (
       SELECT owner.entity_id
       FROM citations citation
       JOIN publication_citation_entities owner ON owner.citation_id = citation.id
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
       JOIN publication_citation_entities owner ON owner.citation_id = citation.id
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
    SELECT entity_id
    FROM publication_citation_entities
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
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id
    FROM publication_citation_entities
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
BEGIN
  UPDATE entity_publications
  SET content_revision = content_revision + 1,
      status = CASE WHEN status = 'published' THEN 'in_review' ELSE status END,
      updated_at = datetime('now')
  WHERE entity_id IN (
    SELECT entity_id
    FROM publication_citation_entities
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
    SELECT entity_id
    FROM publication_citation_entities
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

-- A published row must first exist as a non-public review row so readiness can
-- be recomputed from committed-to-this-transaction metadata. Direct published
-- inserts cannot satisfy that two-step contract.
CREATE TRIGGER publication_publish_insert_guard
BEFORE INSERT ON entity_publications
WHEN NEW.status = 'published'
BEGIN
  SELECT RAISE(
    ABORT,
    'publication_guard: published insert requires an existing review row'
  );
END;

-- The database independently checks every transition into published. It cannot
-- reproduce the TypeScript SHA-256 calculation, but it enforces the canonical
-- format and all current revision/contract/reviewer/readiness invariants.
CREATE TRIGGER publication_publish_transition_guard
BEFORE UPDATE OF status ON entity_publications
WHEN NEW.status = 'published' AND OLD.status IS NOT 'published'
BEGIN
  SELECT CASE WHEN NEW.approved_content_hash IS NULL
    OR length(NEW.approved_content_hash) != 74
    OR substr(NEW.approved_content_hash, 1, 10) != 'sha256:v1:'
    OR substr(NEW.approved_content_hash, 11) GLOB '*[^0-9a-f]*'
    THEN RAISE(ABORT, 'publication_guard: invalid approved content hash')
  END;
  SELECT CASE WHEN NEW.reviewed_content_revision IS NULL
    OR NEW.reviewed_content_revision != NEW.content_revision
    THEN RAISE(ABORT, 'publication_guard: stale reviewed revision')
  END;
  SELECT CASE WHEN NEW.reviewed_contract_version IS NULL
    OR NEW.reviewed_contract_version != 1
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
      AND readiness.contract_version = 1
      AND readiness.blocker_count = 0
      AND readiness.publishable = 1
  ) THEN RAISE(ABORT, 'publication_guard: readiness blockers remain')
  END;
END;
