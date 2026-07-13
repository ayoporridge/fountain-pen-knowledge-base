-- Phase 15: make public concept pages factual, sourced, and pen-only.
-- Internal rule IDs and conditions remain editorial data and are not public API.

-- Rules without a matching concept page were abandoned editorial experiments.
DELETE FROM concept_rules
WHERE NOT EXISTS (
  SELECT 1
  FROM entities e
  WHERE e.type = 'concept' AND e.slug = concept_rules.slug
);

-- These drafts either have no matching examples or conflate distinct terms.
-- The records stay in the database for later editorial recovery; their rules
-- are removed so they cannot enter the public match cache.
DELETE FROM concept_rules
WHERE slug IN ('italic-nib', 'music-nib', 'rotary-filler');

UPDATE concept_rules
SET conditions = '[{"dimension":"nib_material","tag_slug":"nibmat-gold"}]',
    description = '笔尖主体使用金合金；实际软硬和反馈还取决于合金、厚度、形状与调校。',
    updated_at = datetime('now')
WHERE slug = 'gold-nib';

UPDATE concept_rules
SET conditions = '[{"dimension":"nib_material","tag_slug":"nibmat-steel"}]',
    description = '笔尖主体使用钢材；材质名称本身不能判断顺滑度、软硬或出墨表现。',
    updated_at = datetime('now')
WHERE slug = 'steel-nib';

UPDATE concept_rules
SET conditions = '[{"dimension":"nib_material","tag_slug":"nibmat-titanium"}]',
    description = '笔尖主体使用钛合金；不同产品的形状、厚度和调校会带来不同反馈。',
    updated_at = datetime('now')
WHERE slug = 'titanium-nib';

UPDATE concept_rules
SET description = '笔尖的大部分与部分笔舌被笔握前端包覆；具体密封和书写表现仍取决于整笔结构。',
    updated_at = datetime('now')
WHERE slug = 'hooded-nib';

UPDATE concept_rules
SET description = '笔尖主体外露，便于观察轮廓与刻印；外露结构不等同于柔软或弹性。',
    updated_at = datetime('now')
WHERE slug = 'open-nib';

UPDATE concept_rules
SET description = '笔尖根部有一部分被笔握包覆；“半包尖”的划分在不同资料中可能略有差异。',
    updated_at = datetime('now')
WHERE slug = 'semi-hooded-nib';

UPDATE concept_rules
SET description = '笔杆内部的活塞随旋钮移动，在笔杆墨仓中吸入或排出墨水。',
    updated_at = datetime('now')
WHERE slug = 'piston-filler';

INSERT OR IGNORE INTO concept_rules
  (id, name, slug, description, conditions, created_at, updated_at)
VALUES
  ('conceptPiston', '活塞上墨', 'piston-filler',
   '笔杆内部的活塞随旋钮移动，在笔杆墨仓中吸入或排出墨水。',
   '[{"dimension":"fill_system","tag_slug":"fill-piston"}]',
   datetime('now'), datetime('now'));

UPDATE concept_rules
SET description = '推拉柱塞改变笔杆内的压力，柱塞越过墨仓扩张处时，墨水被吸入笔杆。',
    updated_at = datetime('now')
WHERE slug = 'vacuum-filler';

UPDATE concept_rules
SET description = '拧开笔杆后，用滴管或注射器把墨水直接注入笔杆墨仓；密封方式与容量因型号而异。',
    updated_at = datetime('now')
WHERE slug = 'eyedropper-filler';

INSERT OR IGNORE INTO concept_rules
  (id, name, slug, description, conditions, created_at, updated_at)
VALUES
  ('conceptIridium', '铱粒点尖', 'iridium-nib',
   '笔尖尖端焊接耐磨硬质合金点；“铱粒”是沿用称呼，并不表示笔尖主体由铱制成。',
   '[{"dimension":"nib_material","tag_slug":"nibmat-iridium-tipped"}]',
   datetime('now'), datetime('now'));

-- Keep the entity copy concise and separate observable structure from writing
-- feel. Material or mechanism alone is not used as a quality verdict.
UPDATE entities
SET name = '活塞上墨',
    summary = '旋钮带动笔杆内活塞移动，以笔杆内腔储墨的上墨结构。',
    body_md = '活塞上墨把活塞和墨仓设在笔杆内部。转动尾部旋钮，活塞沿笔杆移动；笔尖浸入墨水时，活塞后退会把墨水吸入墨仓。储墨量、是否便于拆洗以及尾旋结构均因型号而异。',
    updated_at = datetime('now')
WHERE type = 'concept' AND slug = 'piston-filler';

UPDATE entities
SET summary = '柱塞在笔杆内移动并形成压力变化，将墨水吸入笔杆墨仓。',
    body_md = '真空上墨通常使用一根带密封件的柱塞杆。推拉柱塞时，笔杆内压力发生变化；柱塞越过墨仓的扩张部位后，墨水进入笔杆。不同结构可能需要一次或多次操作，储墨量也不能只凭“真空上墨”四个字判断。',
    updated_at = datetime('now')
WHERE type = 'concept' AND slug = 'vacuum-filler';

UPDATE entities
SET summary = '用滴管或注射器把墨水直接注入笔杆墨仓的上墨方式。',
    body_md = '滴入式上墨不依赖独立墨囊或转换器。使用时拧开笔杆，把墨水直接注入笔杆内腔，再按具体型号检查螺纹与密封。它可能提供较大的储墨空间，但实际容量、密封和温度变化下的表现取决于笔款。',
    updated_at = datetime('now')
WHERE type = 'concept' AND slug = 'eyedropper-filler';

UPDATE entities
SET summary = '笔尖的大部分与部分笔舌被笔握前端包覆的结构。',
    body_md = '暗尖的可见部分较短，笔握前端会包住笔尖的大部分与部分笔舌。派克 51 是这种结构的常见参照。包覆范围、密封设计和书写表现因型号而异，不能由“暗尖”直接推断顺滑度、弹性或容错角度。',
    updated_at = datetime('now')
WHERE type = 'concept' AND slug = 'hooded-nib';

UPDATE entities
SET summary = '笔尖主体外露，可以直接看到轮廓、开缝与刻印的结构。',
    body_md = '明尖指笔尖主体没有被笔握大面积包住。这个名称描述的是外观与装配方式，不是写感等级；笔尖是否柔软、是否有线条变化，仍要看材质、厚度、形状、开缝和调校。',
    updated_at = datetime('now')
WHERE type = 'concept' AND slug = 'open-nib';

UPDATE entities
SET summary = '笔尖根部部分被笔握包覆、前端仍明显外露的结构。',
    body_md = '半包尖位于明尖与暗尖之间：笔尖前部可见，根部有一部分进入或被笔握包覆。不同资料对包覆比例的界定并不完全一致，因此这里按数据库标签归类，不把它等同于某一种固定写感。',
    updated_at = datetime('now')
WHERE type = 'concept' AND slug = 'semi-hooded-nib';

UPDATE entities
SET summary = '笔尖主体使用金合金；常见标记包括 14K、18K 与 21K。',
    body_md = '金尖的主体由金合金制成，常见成色标记包括 14K、18K 和 21K。成色只说明合金中的金含量，不能单独决定软硬、顺滑或线条变化；这些表现还会受到笔尖形状、厚度、热处理、点尖与调校影响。',
    updated_at = datetime('now')
WHERE type = 'concept' AND slug = 'gold-nib';

UPDATE entities
SET summary = '笔尖主体使用钢材；具体写感取决于结构与调校。',
    body_md = '钢尖以钢材作为笔尖主体。它可以做成偏硬、偏软或带一定弹性的不同结构，价格和材质名称也不能直接代表顺滑度。判断一枚钢尖时，还要看厚度、形状、点尖、供墨和调校。',
    updated_at = datetime('now')
WHERE type = 'concept' AND slug = 'steel-nib';

UPDATE entities
SET summary = '笔尖主体使用钛合金；不同结构可能呈现不同程度的回弹。',
    body_md = '钛尖以钛合金作为笔尖主体。部分产品会呈现较明显的回弹，但这不是所有钛尖共有的固定写感；厚度、轮廓、开缝、供墨和调校都会影响实际表现。',
    updated_at = datetime('now')
WHERE type = 'concept' AND slug = 'titanium-nib';

UPDATE entities
SET name = '铱粒点尖',
    summary = '笔尖尖端焊接耐磨硬质合金点的结构，并非一种笔尖主体材质。',
    body_md = '“铱粒”是钢笔领域沿用的点尖称呼。现代点尖可能使用多种耐磨硬质合金，并不等于纯铱；金尖和钢尖都可能带有点尖。它描述的是笔尖尖端的耐磨部件，不能替代对笔尖主体材质的说明。',
    updated_at = datetime('now')
WHERE type = 'concept' AND slug = 'iridium-nib';

-- Cite only source items that were already reviewed and approved in the
-- database. No URL or source record is introduced by this migration.
INSERT OR IGNORE INTO entity_references
  (id, entity_id, source_item_id, relation_type, note, review_status)
SELECT 'concept-ref-piston', e.id, si.id, 'reference', '上墨结构说明', 'approved'
FROM entities e, source_items si
WHERE e.type = 'concept' AND e.slug = 'piston-filler'
  AND si.id = 'source-richardspens-c995d03855e0283c'
  AND si.review_status = 'approved';

INSERT OR IGNORE INTO entity_references
  (id, entity_id, source_item_id, relation_type, note, review_status)
SELECT 'concept-ref-vacuum', e.id, si.id, 'reference', '柱塞上墨结构说明', 'approved'
FROM entities e, source_items si
WHERE e.type = 'concept' AND e.slug = 'vacuum-filler'
  AND si.id = 'source-richardspens-8637ad4f121f4f4a'
  AND si.review_status = 'approved';

INSERT OR IGNORE INTO entity_references
  (id, entity_id, source_item_id, relation_type, note, review_status)
SELECT 'concept-ref-eyedropper', e.id, si.id, 'reference', '滴入式上墨说明', 'approved'
FROM entities e, source_items si
WHERE e.type = 'concept' AND e.slug = 'eyedropper-filler'
  AND si.id = 'source-richardspens-941e44640deb9e98'
  AND si.review_status = 'approved';

INSERT OR IGNORE INTO entity_references
  (id, entity_id, source_item_id, relation_type, note, review_status)
SELECT 'concept-ref-' || e.slug, e.id, si.id, 'reference', '笔尖结构说明', 'approved'
FROM entities e, source_items si
WHERE e.type = 'concept'
  AND e.slug IN ('hooded-nib', 'open-nib', 'semi-hooded-nib')
  AND si.id = 'source-richardspens-87a21e078fa7af31'
  AND si.review_status = 'approved';

INSERT OR IGNORE INTO entity_references
  (id, entity_id, source_item_id, relation_type, note, review_status)
SELECT 'concept-ref-' || e.slug, e.id, si.id, 'reference', '笔尖材质说明', 'approved'
FROM entities e, source_items si
WHERE e.type = 'concept'
  AND e.slug IN ('gold-nib', 'steel-nib', 'titanium-nib', 'iridium-nib')
  AND si.id = 'source-richardspens-a4ab16c32ca3be8e'
  AND si.review_status = 'approved';

-- Rebuild the cache from public pen entities only. Runtime recomputation uses
-- the same policy and additionally shares the central visibility predicate.
DELETE FROM concept_matches;

INSERT OR IGNORE INTO concept_matches (id, concept_id, entity_id)
SELECT
  'cm-' || cr.id || '-' || e.id,
  cr.id,
  e.id
FROM concept_rules cr
JOIN entities concept
  ON concept.type = 'concept' AND concept.slug = cr.slug
CROSS JOIN entities e
WHERE e.type = 'pen'
  AND e.slug NOT IN (
    '百乐-pilot-custom-823',
    '百利金-pelikan-m800',
    '派克-parker-51-经典-vintage',
    '写乐-sailor-21k-pro-gear-大鱼雷',
    '奥罗拉-aurora'
  )
  AND json_array_length(cr.conditions) > 0
  AND NOT EXISTS (
    SELECT 1
    FROM json_each(cr.conditions) condition
    WHERE NOT EXISTS (
      SELECT 1
      FROM entity_tags et
      JOIN tags t ON t.id = et.tag_id
      WHERE et.entity_id = e.id
        AND t.dimension = json_extract(condition.value, '$.dimension')
        AND t.slug = json_extract(condition.value, '$.tag_slug')
    )
  );
