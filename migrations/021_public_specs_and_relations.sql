-- Phase 15: make public model facts evidence-led and normalize brand relations.

-- These three records were marked approved while their only spec citation still
-- points at an unreviewed search-index source. Keep the draft data, but remove it
-- from the public contract until a reviewer reconnects each field to evidence.
UPDATE model_specs
SET review_status = 'needs_source',
    updated_at = datetime('now')
WHERE id IN (
  'spec-shanghai-1997-handover',
  'spec-sailor-0501-research',
  'spec-platinum-izumo-research'
);

-- Remove editorial qualifiers from the nine currently source-backed records.
-- Unknown values stay NULL instead of being rewritten as plausible facts.
UPDATE model_specs
SET origin_country = NULL,
    updated_at = datetime('now')
WHERE id = 'spec-esterbrook-estie-oversized';

UPDATE model_specs
SET release_year = NULL,
    weight = NULL,
    updated_at = datetime('now')
WHERE id = 'spec-kaweco-sport';

UPDATE model_specs
SET fill_system = '真空上墨',
    updated_at = datetime('now')
WHERE id = 'spec-twsbi-vac700r';

UPDATE model_specs
SET release_year = NULL,
    updated_at = datetime('now')
WHERE id = 'spec-lamy-safari';

-- price_range is a retailer snapshot, not a timeless specification; status has
-- no observed-at/region contract. Neither belongs on the current public page.
UPDATE model_specs
SET price_range = NULL,
    status = NULL,
    updated_at = datetime('now')
WHERE entity_id IN (
  SELECT id FROM entities WHERE type = 'pen'
);

-- entity_attributes has no review or citation columns. Purge only the explicit
-- placeholder rows; the public pen UI no longer treats this table as evidence.
DELETE FROM entity_attributes
WHERE value IS NULL
   OR trim(value) = ''
   OR trim(value) IN ('—', '-', '待确认', '待核验');

-- Correct four brand identities using already-reviewed sources in the library.
UPDATE entities
SET name = 'Noodler''s',
    summary = '美国墨水与钢笔品牌。',
    updated_at = datetime('now')
WHERE type = 'brand' AND slug = 'noodlers';

UPDATE entities
SET name = 'ONLINE（欧领）',
    summary = '德国 ONLINE 书写工具品牌；Campus 是其钢笔系列。',
    updated_at = datetime('now')
WHERE type = 'brand' AND slug = 'campus';

UPDATE entities
SET summary = '中国台湾书写工具品牌，1955 年创立。',
    updated_at = datetime('now')
WHERE type = 'brand' AND slug = 'skb';

UPDATE entities
SET summary = '美国历史钢笔品牌，与 1940 年代芝加哥的 Grieshaber 和 Sager 制笔体系有关。',
    updated_at = datetime('now')
WHERE type = 'brand' AND slug = 'graphomatic';

DELETE FROM entity_attributes
WHERE entity_id IN (SELECT id FROM entities WHERE slug IN ('campus', 'skb', 'graphomatic'))
  AND key = 'origin_country';

INSERT INTO entity_attributes (id, entity_id, key, value)
SELECT 'attr-brand-campus-origin-de', id, 'origin_country', '德国'
FROM entities WHERE type = 'brand' AND slug = 'campus';

INSERT INTO entity_attributes (id, entity_id, key, value)
SELECT 'attr-brand-skb-origin-tw', id, 'origin_country', '中国台湾'
FROM entities WHERE type = 'brand' AND slug = 'skb';

INSERT INTO entity_attributes (id, entity_id, key, value)
SELECT 'attr-brand-graphomatic-origin-us', id, 'origin_country', '美国'
FROM entities WHERE type = 'brand' AND slug = 'graphomatic';

INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
SELECT 'attr-brand-campus-founded-1991', id, 'founded', '1991'
FROM entities WHERE type = 'brand' AND slug = 'campus';

UPDATE entity_aliases
SET source_id = 'product-source-onlinepen'
WHERE entity_id = (SELECT id FROM entities WHERE type = 'brand' AND slug = 'campus')
  AND alias IN ('Campus', '欧领');

-- The reviewed official Campus product page establishes ONLINE as the maker and
-- Campus as the series. Reuse that source for the corrected brand entry.
INSERT OR IGNORE INTO entity_references (
  id, entity_id, source_item_id, relation_type, note, review_status
)
SELECT
  'ref-brand-campus-online-official',
  e.id,
  si.id,
  'official',
  'ONLINE 官方 Campus 产品页，用于区分品牌名与系列名。',
  'approved'
FROM entities e
JOIN source_items si
  ON si.id = 'source-product-onlinepen-820452c5caa20d'
WHERE e.type = 'brand' AND e.slug = 'campus';

-- A public pen has one canonical pen -> brand made_by relation. Convert legacy
-- brand_model rows before deleting redundant or directionally invalid records.
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason)
SELECT
  'canonical-made-by-' || el.id,
  el.target_id,
  el.source_id,
  'made_by',
  '规范化的型号与品牌关系'
FROM entity_links el
JOIN entities source_entity ON source_entity.id = el.source_id
JOIN entities target_entity ON target_entity.id = el.target_id
WHERE el.link_type = 'brand_model'
  AND source_entity.type = 'brand'
  AND target_entity.type = 'pen';

-- Preserve article/nib discovery as a neutral relation instead of saying that a
-- brand manufactured an article or that an article is a model.
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason)
SELECT
  'canonical-related-' || el.id,
  CASE WHEN source_entity.type IN ('article', 'nib', 'fill_system', 'concept') THEN el.source_id ELSE el.target_id END,
  CASE WHEN source_entity.type IN ('article', 'nib', 'fill_system', 'concept') THEN el.target_id ELSE el.source_id END,
  'related_to',
  '资料与品牌的主题关联'
FROM entity_links el
JOIN entities source_entity ON source_entity.id = el.source_id
JOIN entities target_entity ON target_entity.id = el.target_id
WHERE el.link_type IN ('made_by', 'brand_model')
  AND (
    (source_entity.type IN ('article', 'nib', 'fill_system', 'concept') AND target_entity.type = 'brand')
    OR
    (source_entity.type = 'brand' AND target_entity.type IN ('article', 'nib', 'fill_system', 'concept'))
  );

DELETE FROM entity_links
WHERE link_type = 'brand_model';

DELETE FROM entity_links
WHERE link_type = 'made_by'
  AND NOT (
    source_id IN (SELECT id FROM entities WHERE type = 'pen')
    AND target_id IN (SELECT id FROM entities WHERE type = 'brand')
  );

-- Some legacy reverse rows were shared by two forward relations. Deleting the
-- obsolete forward record can therefore remove the reverse row belonging to the
-- surviving canonical relation; restore the trigger invariant explicitly.
INSERT OR IGNORE INTO entity_links (
  id, source_id, target_id, link_type, created_at
)
SELECT
  'rev-' || el.id,
  el.target_id,
  el.source_id,
  'reverse',
  el.created_at
FROM entity_links el
WHERE el.link_type != 'reverse';
