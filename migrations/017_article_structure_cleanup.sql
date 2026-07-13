-- Finish the remaining translation-stage cleanup without changing article facts.
UPDATE entities
SET body_md = rtrim(replace(
      body_md,
      char(10) || char(10) || '（注：根据翻译要求，保留原Markdown格式、链接结构及品牌名；"ebook"译为"电子书"；链接描述文字本地化；书名号采用中文规范；括号内网址保持原样）',
      ''
    )),
    updated_at = datetime('now')
WHERE slug = 'parker-s-date-coding-systems';

-- Nine repair guides were accidentally wrapped in a Markdown code fence.
-- Remove only fence lines; all instructions inside remain byte-for-byte intact.
UPDATE entities
SET body_md = replace(
      replace(
        replace(body_md, '```markdown' || char(13) || char(10), ''),
        '```markdown' || char(10),
        ''
      ),
      char(10) || '```' || char(10),
      char(10)
    ),
    updated_at = datetime('now')
WHERE slug IN (
  'basic-pen-repair-don-ts-and-dos',
  'how-to-build-a-nib-grinding-station',
  'how-to-disassemble-and-reassemble-japanese-pocket-pens',
  'how-to-remove-and-install-levers-in-lever-filling-pens',
  'how-to-repair-a-broken-sac-nipple-or-parker-51-aero-metric-coupler',
  'how-to-repair-shaft-seals-in-japanese-eyedropper-pens',
  'how-to-repair-the-piston-in-a-tibaldi-modello-60',
  'how-to-replace-an-ink-vue-sac-type-2',
  'how-to-sleeve-cracked-barrel-threads'
);

-- Remove three known importer fragments; none carries source information.
UPDATE entities
SET body_md = rtrim(replace(body_md, '[原文链接](https://example.com)', '')),
    updated_at = datetime('now')
WHERE slug = 'fountain-pens-and-pigtails';

UPDATE entities
SET body_md = rtrim(replace(body_md, '[](<ref/gloss/C.htm#capillary_action>)', '')),
    updated_at = datetime('now')
WHERE slug = 'xxxiv';

UPDATE entities
SET body_md = rtrim(substr(rtrim(body_md), 1, length(rtrim(body_md)) - 5)),
    updated_at = datetime('now')
WHERE slug = 'merlin-fountain-pen-colors'
  AND rtrim(body_md) LIKE '%* * *';

-- Decode HTML entities that were imported inside Google Books destinations.
UPDATE entities
SET body_md = replace(body_md, '&amp;', '&'),
    updated_at = datetime('now')
WHERE slug = 'jewelers-circular-and-horological-review-a-chronological-index-of-digitized-volumes';
