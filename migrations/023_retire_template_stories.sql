-- v1.1 is a source-led classification archive. The batch-generated brand and
-- model narratives are kept for internal history, but must not be published.
UPDATE stories
SET status = 'deprecated',
    updated_at = datetime('now')
WHERE story_type IN ('brand_story', 'model_story')
  AND status IN ('reviewed', 'published');
