-- Make the ONLINE/Campus identity correction independent of earlier ad-hoc
-- imports by registering the reviewed official source in the migration chain.
INSERT OR IGNORE INTO source_registry (
  id, name, source_type, allowed_use, reliability, license, attribution,
  homepage_url, fetch_method, notes, last_checked_at
)
VALUES (
  'onlinepen-official',
  'ONLINE 官方网站',
  'official',
  'metadata_only',
  'official_marketing',
  'copyrighted official product page',
  'ONLINE Schreibgeräte GmbH',
  'https://www.online-pen.de/',
  'manual',
  '仅保存来源链接与基本事实，不复制官网图片或正文。',
  '2026-07-13'
);

INSERT OR IGNORE INTO source_items (
  id, source_id, title, url, item_type, license, author, retrieved_at,
  summary, raw_metadata_json, allowed_use, review_status
)
VALUES (
  'source-online-campus-official-v2',
  'onlinepen-official',
  'ONLINE Campus 钢笔',
  'https://www.online-pen.de/fueller-campus-soft-black/61100-3d',
  'official_product_page',
  'copyrighted official product page',
  'ONLINE Schreibgeräte GmbH',
  '2026-07-13',
  'ONLINE 官方 Campus 产品页，用于确认 ONLINE 为品牌、Campus 为产品系列。',
  '{"site":"ONLINE official","reviewed":true}',
  'metadata_only',
  'approved'
);

DELETE FROM entity_references
WHERE id = 'ref-brand-campus-online-official';

INSERT INTO entity_references (
  id, entity_id, source_item_id, relation_type, note, review_status
)
SELECT
  'ref-brand-campus-online-official',
  e.id,
  'source-online-campus-official-v2',
  'official',
  'ONLINE 官方 Campus 产品页，用于区分品牌名与系列名。',
  'approved'
FROM entities e
WHERE e.type = 'brand' AND e.slug = 'campus';
