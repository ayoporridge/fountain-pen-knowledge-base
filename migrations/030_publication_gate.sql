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
