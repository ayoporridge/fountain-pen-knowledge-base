-- RichardsPens long-form guides are articles, not atomic nib/filling-system
-- entities. The six family overview pages are likewise merged-topic articles,
-- rather than individual pen models.
BEGIN;

-- Repair only the direct source records attached to the 54 reclassified
-- entities. A URL must exactly match entities.source_url to be approved.
UPDATE source_items
SET review_status = 'approved',
    updated_at = datetime('now')
WHERE EXISTS (
  SELECT 1
  FROM entity_references er
  JOIN entities e ON e.id = er.entity_id
  WHERE er.source_item_id = source_items.id
    AND source_items.url = e.source_url
    AND (
      e.type = 'fill_system'
      OR (e.type = 'nib' AND e.source_url LIKE 'https://www.richardspens.com/%')
      OR e.slug IN (
        'the-esterbrook-model-j-family',
        'the-eversharp-fifth-avenue-and-sixty-four',
        'the-eversharp-skyline-family',
        'the-eversharp-symphony-family',
        'the-eversharp-ventura-family',
        'the-parker-parkette-and-writefine'
      )
    )
);

UPDATE entity_references
SET review_status = 'approved'
WHERE EXISTS (
  SELECT 1
  FROM entities e
  JOIN source_items si ON si.id = entity_references.source_item_id
  WHERE e.id = entity_references.entity_id
    AND si.url = e.source_url
    AND (
      e.type = 'fill_system'
      OR (e.type = 'nib' AND e.source_url LIKE 'https://www.richardspens.com/%')
      OR e.slug IN (
        'the-esterbrook-model-j-family',
        'the-eversharp-fifth-avenue-and-sixty-four',
        'the-eversharp-skyline-family',
        'the-eversharp-symphony-family',
        'the-eversharp-ventura-family',
        'the-parker-parkette-and-writefine'
      )
    )
);

-- This article alone retained an import-time Markdown fence around the whole
-- document. Remove only the outer fence lines.
UPDATE entities
SET body_md = replace(
      replace(
        replace(body_md, '```markdown' || char(13) || char(10), ''),
        '```markdown' || char(10),
        ''
      ),
      char(10) || '```',
      ''
    ),
    updated_at = datetime('now')
WHERE slug = 'making-music-with-a-pen';

-- The first Markdown heading is the translated title. Use it as the public
-- name for the 48 RichardsPens guides; the six pen-family names stay intact.
UPDATE entities
SET name = trim(ltrim(
      substr(body_md, 1, instr(body_md || char(10), char(10)) - 1),
      '# '
    )),
    updated_at = datetime('now')
WHERE type = 'fill_system'
   OR (type = 'nib' AND source_url LIKE 'https://www.richardspens.com/%');

UPDATE entities
SET type = 'article',
    updated_at = datetime('now')
WHERE type = 'fill_system'
   OR (type = 'nib' AND source_url LIKE 'https://www.richardspens.com/%')
   OR slug IN (
     'the-esterbrook-model-j-family',
     'the-eversharp-fifth-avenue-and-sixty-four',
     'the-eversharp-skyline-family',
     'the-eversharp-symphony-family',
     'the-eversharp-ventura-family',
     'the-parker-parkette-and-writefine'
   );

-- The page chrome supplies the H1. Reuse the existing exact-match cleanup so
-- only a duplicated leading heading is removed; section headings are kept.
UPDATE entities
SET body_md = ltrim(
      substr(body_md, instr(body_md, char(10)) + 1),
      char(10) || char(13)
    ),
    updated_at = datetime('now')
WHERE type = 'article'
  AND body_md LIKE '# %'
  AND instr(body_md, char(10)) > 0
  AND trim(substr(body_md, 3, instr(body_md, char(10)) - 3)) = name;

COMMIT;
