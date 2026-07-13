-- v1.1 public identity cleanup.
-- Historical duplicate entities remain in the research database so old source
-- relationships are reversible, but public queries hide them and old URLs
-- redirect to the canonical entities.

-- Parker 51: keep the clean canonical slug and the richer Chinese body copy.
UPDATE entities
SET body_md = COALESCE(
      (SELECT body_md FROM entities WHERE slug = '派克-parker-51-经典-vintage'),
      body_md
    ),
    name = '派克 Parker 51（经典款）',
    slug = 'parker-51-vintage',
    updated_at = datetime('now')
WHERE slug = 'the-parker-51';

-- Kimberly is a history article about the Eversharp Kimberly Pockette
-- ballpoint, not a fountain-pen model.
DELETE FROM citations
WHERE target_type = 'model_spec'
  AND target_id IN (
    SELECT ms.id
    FROM model_specs ms
    JOIN entities e ON e.id = ms.entity_id
    WHERE e.slug = 'kimberly-the-pen-that-saved-eversharp'
  );
DELETE FROM model_variants
WHERE model_entity_id = (
  SELECT id FROM entities WHERE slug = 'kimberly-the-pen-that-saved-eversharp'
);
DELETE FROM model_specs
WHERE entity_id = (
  SELECT id FROM entities WHERE slug = 'kimberly-the-pen-that-saved-eversharp'
);
DELETE FROM entity_attributes
WHERE entity_id = (
  SELECT id FROM entities WHERE slug = 'kimberly-the-pen-that-saved-eversharp'
);
DELETE FROM entity_tags
WHERE entity_id = (
  SELECT id FROM entities WHERE slug = 'kimberly-the-pen-that-saved-eversharp'
);
UPDATE entities
SET type = 'article',
    slug = 'kimberly-pockette-ballpoint-history',
    name = 'Eversharp Kimberly Pockette 圆珠笔史',
    updated_at = datetime('now')
WHERE slug = 'kimberly-the-pen-that-saved-eversharp';

-- Iroshizuku is a bottled-ink line. Until the site has a first-class ink
-- entity type, publish it as an article instead of inventing pen specs.
DELETE FROM citations
WHERE target_type = 'model_spec'
  AND target_id IN (
    SELECT ms.id
    FROM model_specs ms
    JOIN entities e ON e.id = ms.entity_id
    WHERE e.slug = '百乐-pilot-iroshizuku色彩雫'
  );
DELETE FROM model_variants
WHERE model_entity_id = (
  SELECT id FROM entities WHERE slug = '百乐-pilot-iroshizuku色彩雫'
);
DELETE FROM model_specs
WHERE entity_id = (
  SELECT id FROM entities WHERE slug = '百乐-pilot-iroshizuku色彩雫'
);
DELETE FROM entity_attributes
WHERE entity_id = (
  SELECT id FROM entities WHERE slug = '百乐-pilot-iroshizuku色彩雫'
);
DELETE FROM entity_tags
WHERE entity_id = (
  SELECT id FROM entities WHERE slug = '百乐-pilot-iroshizuku色彩雫'
);
UPDATE entities
SET type = 'article',
    slug = 'pilot-iroshizuku-ink-guide',
    name = '百乐 Pilot Iroshizuku 色彩雫墨水系列',
    updated_at = datetime('now')
WHERE slug = '百乐-pilot-iroshizuku色彩雫';

-- Fix a duplicated brand token in the public title.
UPDATE entities
SET name = '凌美 LAMY 2000', updated_at = datetime('now')
WHERE slug = '凌美-lamy-lamy-2000';

-- The research-only Aurora generic pen has a more useful brand introduction.
UPDATE stories
SET title = COALESCE(
      (SELECT source_story.title
       FROM stories source_story
       JOIN entities source_entity ON source_entity.id = source_story.entity_id
       WHERE source_entity.slug = '奥罗拉-aurora'
         AND source_story.status IN ('published', 'reviewed')
       LIMIT 1),
      title
    ),
    body_md = COALESCE(
      (SELECT source_story.body_md
       FROM stories source_story
       JOIN entities source_entity ON source_entity.id = source_story.entity_id
       WHERE source_entity.slug = '奥罗拉-aurora'
         AND source_story.status IN ('published', 'reviewed')
       LIMIT 1),
      body_md
    ),
    updated_at = datetime('now')
WHERE entity_id = (SELECT id FROM entities WHERE slug = 'aurora')
  AND story_type = 'brand_story';

-- Preserve useful tags on the four canonical fountain-pen entities.
INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id, created_at)
SELECT 'merge-823-' || et.tag_id,
       target.id,
       et.tag_id,
       et.created_at
FROM entity_tags et
JOIN entities source ON source.id = et.entity_id AND source.slug = '百乐-pilot-custom-823'
JOIN entities target ON target.slug = 'pilot-custom-823';

INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id, created_at)
SELECT 'merge-m800-' || et.tag_id,
       target.id,
       et.tag_id,
       et.created_at
FROM entity_tags et
JOIN entities source ON source.id = et.entity_id AND source.slug = '百利金-pelikan-m800'
JOIN entities target ON target.slug = 'pelikan-souveran-m800';

INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id, created_at)
SELECT 'merge-p51-' || et.tag_id,
       target.id,
       et.tag_id,
       et.created_at
FROM entity_tags et
JOIN entities source ON source.id = et.entity_id AND source.slug = '派克-parker-51-经典-vintage'
JOIN entities target ON target.slug = 'parker-51-vintage';

INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id, created_at)
SELECT 'merge-progear-' || et.tag_id,
       target.id,
       et.tag_id,
       et.created_at
FROM entity_tags et
JOIN entities source ON source.id = et.entity_id AND source.slug = '写乐-sailor-21k-pro-gear-大鱼雷'
JOIN entities target ON target.slug = 'sailor-pro-gear';

-- Preserve approved source references on the canonical entity without copying
-- research-only or pending references.
INSERT OR IGNORE INTO entity_references
  (id, entity_id, source_item_id, relation_type, note, review_status, created_at)
SELECT 'merge-823-' || er.id, target.id, er.source_item_id, er.relation_type,
       er.note, er.review_status, er.created_at
FROM entity_references er
JOIN entities source ON source.id = er.entity_id AND source.slug = '百乐-pilot-custom-823'
JOIN entities target ON target.slug = 'pilot-custom-823'
JOIN source_items si ON si.id = er.source_item_id
WHERE er.review_status = 'approved' AND si.review_status = 'approved';

INSERT OR IGNORE INTO entity_references
  (id, entity_id, source_item_id, relation_type, note, review_status, created_at)
SELECT 'merge-m800-' || er.id, target.id, er.source_item_id, er.relation_type,
       er.note, er.review_status, er.created_at
FROM entity_references er
JOIN entities source ON source.id = er.entity_id AND source.slug = '百利金-pelikan-m800'
JOIN entities target ON target.slug = 'pelikan-souveran-m800'
JOIN source_items si ON si.id = er.source_item_id
WHERE er.review_status = 'approved' AND si.review_status = 'approved';

INSERT OR IGNORE INTO entity_references
  (id, entity_id, source_item_id, relation_type, note, review_status, created_at)
SELECT 'merge-p51-' || er.id, target.id, er.source_item_id, er.relation_type,
       er.note, er.review_status, er.created_at
FROM entity_references er
JOIN entities source ON source.id = er.entity_id AND source.slug = '派克-parker-51-经典-vintage'
JOIN entities target ON target.slug = 'parker-51-vintage'
JOIN source_items si ON si.id = er.source_item_id
WHERE er.review_status = 'approved' AND si.review_status = 'approved';

INSERT OR IGNORE INTO entity_references
  (id, entity_id, source_item_id, relation_type, note, review_status, created_at)
SELECT 'merge-progear-' || er.id, target.id, er.source_item_id, er.relation_type,
       er.note, er.review_status, er.created_at
FROM entity_references er
JOIN entities source ON source.id = er.entity_id AND source.slug = '写乐-sailor-21k-pro-gear-大鱼雷'
JOIN entities target ON target.slug = 'sailor-pro-gear'
JOIN source_items si ON si.id = er.source_item_id
WHERE er.review_status = 'approved' AND si.review_status = 'approved';

-- Move approved/public media to the canonical entities. Phase 13 performs
-- visual duplicate and primary/gallery normalization after this merge.
UPDATE media_assets
SET entity_id = (SELECT id FROM entities WHERE slug = 'pilot-custom-823')
WHERE entity_id = (SELECT id FROM entities WHERE slug = '百乐-pilot-custom-823')
  AND review_status = 'approved';

UPDATE media_assets
SET entity_id = (SELECT id FROM entities WHERE slug = 'pelikan-souveran-m800')
WHERE entity_id = (SELECT id FROM entities WHERE slug = '百利金-pelikan-m800')
  AND review_status = 'approved';

UPDATE media_assets
SET entity_id = (SELECT id FROM entities WHERE slug = 'parker-51-vintage')
WHERE entity_id = (SELECT id FROM entities WHERE slug = '派克-parker-51-经典-vintage')
  AND review_status = 'approved';

UPDATE media_assets
SET entity_id = (SELECT id FROM entities WHERE slug = 'sailor-pro-gear')
WHERE entity_id = (SELECT id FROM entities WHERE slug = '写乐-sailor-21k-pro-gear-大鱼雷')
  AND review_status = 'approved';

UPDATE media_assets
SET entity_id = (SELECT id FROM entities WHERE slug = 'aurora')
WHERE entity_id = (SELECT id FROM entities WHERE slug = '奥罗拉-aurora')
  AND review_status = 'approved';

-- Public-facing aliases only; deliberately omit the erroneous Sailor 1911 S
-- alias attached to the old Pro Gear research entry.
INSERT OR IGNORE INTO entity_aliases
  (id, entity_id, alias, language, source_id, created_at)
SELECT 'alias-merge-pilot-823', id, '百乐 Pilot Custom 823', 'zh', NULL, datetime('now')
FROM entities WHERE slug = 'pilot-custom-823';

INSERT OR IGNORE INTO entity_aliases
  (id, entity_id, alias, language, source_id, created_at)
SELECT 'alias-merge-pelikan-m800', id, '百利金 Pelikan M800', 'zh', NULL, datetime('now')
FROM entities WHERE slug = 'pelikan-souveran-m800';

INSERT OR IGNORE INTO entity_aliases
  (id, entity_id, alias, language, source_id, created_at)
SELECT 'alias-merge-parker-51', id, '派克 Parker 51 经典款', 'zh', NULL, datetime('now')
FROM entities WHERE slug = 'parker-51-vintage';

INSERT OR IGNORE INTO entity_aliases
  (id, entity_id, alias, language, source_id, created_at)
SELECT 'alias-merge-sailor-pro-gear', id, '写乐 21K Pro Gear', 'zh', NULL, datetime('now')
FROM entities WHERE slug = 'sailor-pro-gear';
