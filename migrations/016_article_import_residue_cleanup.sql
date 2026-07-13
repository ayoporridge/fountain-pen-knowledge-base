-- Remove translation-stage headings and assistant narration without touching
-- the translated article content around them.
UPDATE entities
SET body_md = replace(body_md, '### 翻译结果：' || char(10) || char(10), ''),
    updated_at = datetime('now')
WHERE type = 'article';

UPDATE entities
SET body_md = replace(body_md, '# 翻译结果  ' || char(10) || char(10), ''),
    updated_at = datetime('now')
WHERE type = 'article';

UPDATE entities
SET body_md = replace(
      body_md,
      '请稍等，我将按照您的要求进行专业翻译。以下是翻译结果：' || char(10) || char(10),
      ''
    ),
    updated_at = datetime('now')
WHERE type = 'article';

UPDATE entities
SET body_md = replace(
      body_md,
      '（以下为符合要求的翻译结果，严格遵循所有注意事项）' || char(10) || char(10),
      ''
    ),
    updated_at = datetime('now')
WHERE type = 'article';

-- This late marker begins a site-maintenance footer rather than article
-- content, so remove the footer as a whole.
UPDATE entities
SET body_md = rtrim(substr(body_md, 1, instr(body_md, '# 翻译结果') - 1)),
    updated_at = datetime('now')
WHERE slug = 'the-dodecanese-surrender-pens'
  AND instr(body_md, '# 翻译结果') > 0;

-- Remove three assistant-authored compliance notes appended after otherwise
-- complete translations.
UPDATE entities
SET body_md = rtrim(substr(body_md, 1, instr(body_md, char(10) || char(10) || '（注：') - 1)),
    updated_at = datetime('now')
WHERE slug IN (
  'alan-turing-s-pens',
  'essay-pen-shows-why-bother',
  'xxv'
)
  AND instr(body_md, char(10) || char(10) || '（注：') > 0;

-- The page header already supplies the document H1. Remove a duplicated
-- leading Markdown H1 when it is exactly the entity name; substantive section
-- headings remain and are rendered from H2 downward.
UPDATE entities
SET body_md = ltrim(substr(body_md, instr(body_md, char(10)) + 1), char(10) || char(13)),
    updated_at = datetime('now')
WHERE type = 'article'
  AND body_md LIKE '# %'
  AND instr(body_md, char(10)) > 0
  AND trim(substr(body_md, 3, instr(body_md, char(10)) - 3)) = name;
