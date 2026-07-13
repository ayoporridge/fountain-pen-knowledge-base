-- Two imported source pages still contained translator/code-wrapper text that
-- appeared as literal reader-facing copy.
UPDATE entities
SET body_md = REPLACE(
      REPLACE(body_md, '```markdown' || char(10), ''),
      char(10) || '```',
      ''
    ),
    updated_at = datetime('now')
WHERE slug = 'the-conklin-glider';

UPDATE entities
SET body_md = REPLACE(
      body_md,
      char(10) || '以下是翻译结果：' || char(10) || char(10) || '---' || char(10),
      char(10)
    ),
    updated_at = datetime('now')
WHERE slug = 'morrison-s-patriot';
