-- The publication trigger remains the blocker authorization gate.  The
-- public read view must not re-expand public_entity_readiness on every page
-- request: on the production Turso plan that view is a large diagnostic
-- projection and can exhaust the remote SQLite memory budget even for a
-- single slug lookup.
--
-- All content/relationship/review mutation triggers demote a published row
-- to in_review or draft before the next read, while publishEntity's guarded
-- transition requires the v3 snapshot fields below.  This lifecycle
-- projection therefore preserves the public contract without recomputing the
-- diagnostic blocker JSON on every read.
DROP VIEW IF EXISTS public_entities;

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
WHERE publication.status = 'published'
  AND publication.reviewed_contract_version = 3
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
