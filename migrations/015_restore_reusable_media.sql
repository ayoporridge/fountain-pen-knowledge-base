-- The Visconti Commons image is CC BY 2.0 and the full asset is healthy. The
-- original audit failure came from a rate-limited 500px thumbnail, not the
-- reusable source image.
UPDATE media_assets
SET usage_status = 'primary',
    thumbnail_url = NULL,
    updated_at = datetime('now')
WHERE id = 'media-commons-dfe6ab7e02d980';

-- Remove two leaked translation-instruction blocks. The public article keeps
-- the translated repair content above this marker.
UPDATE entities
SET body_md = rtrim(substr(body_md, 1, instr(body_md, '请将以下英文 Markdown 内容翻译成中文。要求：') - 1)),
    updated_at = datetime('now')
WHERE slug IN (
  'how-to-disassemble-and-reassemble-a-parker-51',
  'how-to-repair-the-seal-in-a-waterman-retractable-safety-fountain-pen'
)
  AND instr(body_md, '请将以下英文 Markdown 内容翻译成中文。要求：') > 0;
