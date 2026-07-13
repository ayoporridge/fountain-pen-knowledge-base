-- Clean import residue exposed by the Phase 15 article reclassification.

UPDATE entities
SET body_md = replace(replace(body_md, '```markdown', ''), '```', ''),
    updated_at = datetime('now')
WHERE slug IN (
  'nibs-does-an-oblique-nib-give-line-variation',
  'nibs-i-the-basics'
);

UPDATE entities
SET body_md = replace(body_md, '以下是翻译结果：' || char(10) || char(10), ''),
    updated_at = datetime('now')
WHERE slug = 'the-esterbrook-model-j-family';

UPDATE entities SET name = 'Esterbrook J 系列钢笔', updated_at = datetime('now')
WHERE slug = 'the-esterbrook-model-j-family';
UPDATE entities SET name = 'Eversharp Fifth Avenue 与 Sixty-Four 系列', updated_at = datetime('now')
WHERE slug = 'the-eversharp-fifth-avenue-and-sixty-four';
UPDATE entities SET name = 'Eversharp Skyline 系列钢笔', updated_at = datetime('now')
WHERE slug = 'the-eversharp-skyline-family';
UPDATE entities SET name = 'Eversharp Symphony 系列钢笔', updated_at = datetime('now')
WHERE slug = 'the-eversharp-symphony-family';
UPDATE entities SET name = 'Eversharp Ventura 系列钢笔', updated_at = datetime('now')
WHERE slug = 'the-eversharp-ventura-family';
UPDATE entities SET name = 'Parker Parkette 与 Writefine 钢笔', updated_at = datetime('now')
WHERE slug = 'the-parker-parkette-and-writefine';

-- The page shell owns the H1. Remove a matching imported title whether it is
-- the first line or immediately follows the source line.
UPDATE entities
SET body_md = ltrim(substr(body_md, instr(body_md, char(10)) + 1), char(10) || char(13)),
    updated_at = datetime('now')
WHERE type = 'article'
  AND body_md LIKE '# %'
  AND instr(body_md, char(10)) > 0
  AND trim(substr(body_md, 3, instr(body_md, char(10)) - 3)) = name;

UPDATE entities
SET body_md = replace(
      body_md,
      char(10) || '# ' || name || char(10),
      char(10)
    ),
    updated_at = datetime('now')
WHERE type = 'article'
  AND instr(body_md, char(10) || '# ' || name || char(10)) BETWEEN 1 AND 400;

UPDATE entities
SET body_md = replace(body_md, '# 钢笔档案：Esterbrook J系列' || char(10), ''),
    updated_at = datetime('now')
WHERE slug = 'the-esterbrook-model-j-family';

-- Six former family-level model specs were removed after becoming articles.
-- Their citations are not reusable at entity level and otherwise become orphans.
DELETE FROM citations
WHERE target_type = 'model_spec'
  AND NOT EXISTS (
    SELECT 1 FROM model_specs ms WHERE ms.id = citations.target_id
  );
