-- Keep the publication authorization contract unchanged while avoiding the
-- readiness view's JSON/count expansion in the hot publish trigger.  On the
-- production Turso plan, evaluating public_entity_readiness for one entity
-- materializes every blocker branch and can exhaust the remote SQLite budget.
-- publication_blockers is the authorization source of truth, so checking it
-- directly is equivalent to blocker_count = 0 AND publishable = 1.
DROP TRIGGER IF EXISTS publication_publish_transition_guard;

CREATE TRIGGER publication_publish_transition_guard
BEFORE UPDATE OF status ON entity_publications
WHEN NEW.status = 'published' AND OLD.status IS NOT 'published'
BEGIN
  SELECT CASE WHEN NEW.approved_content_hash IS NULL
    OR length(NEW.approved_content_hash) != 74
    OR substr(NEW.approved_content_hash, 1, 10) != 'sha256:v3:'
    OR substr(NEW.approved_content_hash, 11) GLOB '*[^0-9a-f]*'
    THEN RAISE(ABORT, 'publication_guard: invalid approved content hash')
  END;
  SELECT CASE WHEN NEW.reviewed_content_revision IS NULL
    OR NEW.reviewed_content_revision != NEW.content_revision
    THEN RAISE(ABORT, 'publication_guard: stale reviewed revision')
  END;
  SELECT CASE WHEN NEW.reviewed_contract_version IS NULL
    OR NEW.reviewed_contract_version != 3
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
  SELECT CASE WHEN EXISTS (
    SELECT 1
    FROM publication_blockers blocker
    WHERE blocker.entity_id = NEW.entity_id
      AND blocker.contract_version = 3
  ) THEN RAISE(ABORT, 'publication_guard: readiness blockers remain')
  END;
END;
