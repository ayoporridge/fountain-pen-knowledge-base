-- Remove one remaining import label from a public-facing article summary.
UPDATE entities
SET summary = '这则 Esterbrook 圣诞广告刊登于 1952 年 12 月的《星期六晚邮报》。底部展示的钢笔从左至右依次为：一支 J 型、一支 LJ 型、两支 SJ 型、另一支 J 型、两支 SM Deluxe 型以及两支 CH 型手袋钢笔。',
    updated_at = datetime('now')
WHERE type = 'article'
  AND slug = 'the-esterbrook-model-j-family';

-- Remove only semantically identical reference rows. Different notes or
-- relation types may legitimately cite the same URL and are deduplicated only
-- at render time, without destroying their provenance.
DELETE FROM entity_references
WHERE review_status = 'approved'
  AND id NOT IN (
    SELECT MIN(er.id)
    FROM entity_references er
    WHERE er.review_status = 'approved'
    GROUP BY er.entity_id, er.source_item_id, er.relation_type, COALESCE(er.note, '')
  );
