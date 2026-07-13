-- A reference cannot be publicly approved while its underlying source item is
-- still pending editorial review.
UPDATE entity_references
SET review_status = 'pending'
WHERE review_status = 'approved'
  AND source_item_id IN (
    SELECT id FROM source_items WHERE review_status != 'approved'
  );
