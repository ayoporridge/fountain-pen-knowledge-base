-- Phase 15 cleanup after knowledge-article reclassification.

-- Six model-family essays moved from pen to article. Their old structured model
-- rows no longer belong to a single purchasable pen and must not survive the
-- type change.
DELETE FROM model_specs
WHERE entity_id IN (
  SELECT id
  FROM entities
  WHERE type = 'article'
    AND slug IN (
      'the-esterbrook-model-j-family',
      'the-eversharp-fifth-avenue-and-sixty-four',
      'the-eversharp-skyline-family',
      'the-eversharp-symphony-family',
      'the-eversharp-ventura-family',
      'the-parker-parkette-and-writefine'
    )
);
