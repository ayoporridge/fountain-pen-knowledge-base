-- Pen publication only needs to know whether its maker has passed the same
-- guarded publication lifecycle.  Re-expanding publication_base_blockers for
-- every brand while checking one pen creates a recursive, memory-heavy plan
-- on the production Turso instance.  Mutations demote a published brand
-- before its snapshot can become stale, and the publication transition guard
-- already checks the full blocker view, so this dependency projection can use
-- the compact lifecycle fields directly.
DROP VIEW IF EXISTS publication_public_brands;

CREATE VIEW publication_public_brands (entity_id) AS
SELECT entity.id
FROM entities entity
JOIN entity_publications publication ON publication.entity_id = entity.id
WHERE entity.type = 'brand'
  AND publication.status = 'published'
  AND publication.reviewed_contract_version = 3
  AND publication.reviewed_content_revision = publication.content_revision
  AND publication.approved_content_hash IS NOT NULL;
