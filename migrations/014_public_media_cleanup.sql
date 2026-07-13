-- Retire the rotating Warm Pen Atlas placeholders. These rows assigned a
-- finite image set to unrelated articles and concepts, creating repeated and
-- misleading public cards. Keep the rows for research history, but never
-- select them as public media.
UPDATE media_assets
SET usage_status = 'hidden', updated_at = datetime('now')
WHERE id LIKE 'warm-pen-atlas-card-%';

-- Known hard failures from the full public image audit. Hiding is reversible
-- and lets the UI fall back to an honest type card instead of a broken image.
UPDATE media_assets
SET usage_status = 'hidden', updated_at = datetime('now')
WHERE id IN (
  'media-commerce-17bd4022734d00',
  'media-commerce-5432bf80034489',
  'media-commerce-5b30ac3afb8f60',
  'media-commerce-655bb8f26c384e',
  'media-commerce-b7110f8db39036',
  'media-source-93e686ac8fdc26',
  'media-warm-pen-atlas-douwan-placeholder-cover',
  'media-warm-pen-atlas-hero-paddy-placeholder-cover',
  'media-warm-pen-atlas-jinxing-placeholder-cover',
  'media-warm-pen-atlas-lily-placeholder-cover',
  'media-warm-pen-atlas-zhangjiang-placeholder-cover'
);
