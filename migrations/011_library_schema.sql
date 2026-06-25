-- Library expansion schema: sources, claims, stories, diagrams, timelines, exhibits.
-- This layer keeps the existing entity/tag/link model intact and adds provenance
-- and editorial workflow tables for the "fountain pen library" direction.

CREATE TABLE IF NOT EXISTS source_registry (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (
    source_type IN (
      'official',
      'wikimedia',
      'book',
      'patent',
      'blog',
      'forum',
      'reddit',
      'retailer',
      'user_submission'
    )
  ),
  allowed_use TEXT NOT NULL CHECK (
    allowed_use IN (
      'store_full',
      'store_excerpt',
      'summary_only',
      'metadata_only',
      'link_only',
      'forbidden'
    )
  ),
  reliability TEXT NOT NULL DEFAULT 'medium' CHECK (
    reliability IN (
      'high_for_basic_facts',
      'high_for_model_history',
      'official_marketing',
      'community_opinion',
      'bibliographic',
      'technical_primary',
      'medium',
      'unknown'
    )
  ),
  license TEXT,
  attribution TEXT,
  homepage_url TEXT,
  fetch_method TEXT NOT NULL DEFAULT 'manual',
  notes TEXT,
  last_checked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS source_items (
  id TEXT PRIMARY KEY NOT NULL,
  source_id TEXT NOT NULL REFERENCES source_registry(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'web_page',
  license TEXT,
  author TEXT,
  published_at TEXT,
  retrieved_at TEXT,
  summary TEXT,
  raw_metadata_json TEXT,
  allowed_use TEXT CHECK (
    allowed_use IN (
      'store_full',
      'store_excerpt',
      'summary_only',
      'metadata_only',
      'link_only',
      'forbidden'
    )
  ),
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    review_status IN ('pending', 'approved', 'rejected', 'needs_review')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source_id, url)
);

CREATE TABLE IF NOT EXISTS entity_aliases (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'und',
  source_id TEXT REFERENCES source_registry(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entity_id, alias, language)
);

CREATE TABLE IF NOT EXISTS external_ids (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  url TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entity_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY NOT NULL,
  subject_entity_id TEXT REFERENCES entities(id) ON DELETE CASCADE,
  subject_text TEXT,
  predicate TEXT NOT NULL,
  object_entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  object_text TEXT,
  source_item_id TEXT REFERENCES source_items(id) ON DELETE SET NULL,
  evidence_locator TEXT,
  confidence REAL NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    review_status IN ('pending', 'approved', 'rejected', 'needs_source')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (subject_entity_id IS NOT NULL OR subject_text IS NOT NULL),
  CHECK (object_entity_id IS NOT NULL OR object_text IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_claims_subject_entity ON claims(subject_entity_id);
CREATE INDEX IF NOT EXISTS idx_claims_predicate ON claims(predicate);
CREATE INDEX IF NOT EXISTS idx_claims_source_item ON claims(source_item_id);
CREATE INDEX IF NOT EXISTS idx_claims_review_status ON claims(review_status);

CREATE TABLE IF NOT EXISTS citations (
  id TEXT PRIMARY KEY NOT NULL,
  target_type TEXT NOT NULL CHECK (
    target_type IN (
      'entity',
      'story',
      'timeline_event',
      'diagram',
      'model_spec',
      'exhibit',
      'claim'
    )
  ),
  target_id TEXT NOT NULL,
  source_item_id TEXT REFERENCES source_items(id) ON DELETE SET NULL,
  claim_id TEXT REFERENCES claims(id) ON DELETE SET NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (source_item_id IS NOT NULL OR claim_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_citations_target ON citations(target_type, target_id);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'image' CHECK (
    asset_type IN ('image', 'diagram', 'scan', 'video', 'external_link')
  ),
  image_url TEXT,
  thumbnail_url TEXT,
  local_path TEXT,
  author TEXT,
  license TEXT,
  attribution_text TEXT,
  source_url TEXT,
  source_item_id TEXT REFERENCES source_items(id) ON DELETE SET NULL,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    review_status IN ('pending', 'approved', 'rejected', 'needs_license')
  ),
  usage_status TEXT NOT NULL DEFAULT 'candidate' CHECK (
    usage_status IN ('candidate', 'primary', 'gallery', 'hidden')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_media_assets_entity ON media_assets(entity_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_review ON media_assets(review_status);

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT REFERENCES entities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story_type TEXT NOT NULL DEFAULT 'overview' CHECK (
    story_type IN ('brand_story', 'model_story', 'mechanism_story', 'community_summary', 'overview')
  ),
  summary TEXT,
  body_md TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'needs_sources', 'needs_media', 'reviewed', 'published', 'deprecated')
  ),
  source_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stories_entity ON stories(entity_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);

CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT REFERENCES entities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'brand_founded',
      'model_released',
      'patent_filed',
      'acquisition',
      'discontinued',
      'revival',
      'design_milestone',
      'community_event'
    )
  ),
  start_date TEXT NOT NULL,
  end_date TEXT,
  circa INTEGER NOT NULL DEFAULT 0 CHECK (circa IN (0, 1)),
  description TEXT,
  source_item_id TEXT REFERENCES source_items(id) ON DELETE SET NULL,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    review_status IN ('pending', 'approved', 'rejected', 'needs_source')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_timeline_entity ON timeline_events(entity_id);
CREATE INDEX IF NOT EXISTS idx_timeline_start ON timeline_events(start_date);

CREATE TABLE IF NOT EXISTS model_specs (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL UNIQUE REFERENCES entities(id) ON DELETE CASCADE,
  brand_entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  series_name TEXT,
  release_year TEXT,
  origin_country TEXT,
  nib TEXT,
  fill_system TEXT,
  material TEXT,
  dimensions TEXT,
  weight TEXT,
  price_range TEXT,
  status TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    review_status IN ('pending', 'approved', 'rejected', 'needs_source')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS model_variants (
  id TEXT PRIMARY KEY NOT NULL,
  model_entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  release_year TEXT,
  notes TEXT,
  source_item_id TEXT REFERENCES source_items(id) ON DELETE SET NULL,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    review_status IN ('pending', 'approved', 'rejected', 'needs_source')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(model_entity_id, variant_name)
);

CREATE TABLE IF NOT EXISTS diagrams (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  diagram_type TEXT NOT NULL CHECK (
    diagram_type IN ('structure', 'mechanism', 'timeline', 'family_tree', 'size_compare', 'relationship')
  ),
  svg TEXT NOT NULL,
  hotspots_json TEXT,
  source_note TEXT,
  license TEXT NOT NULL DEFAULT 'site-original',
  review_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    review_status IN ('draft', 'reviewed', 'published', 'deprecated')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS community_summaries (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES source_registry(id) ON DELETE CASCADE,
  summary_md TEXT NOT NULL,
  metadata_json TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'reviewed', 'published', 'deprecated')
  ),
  refreshed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entity_id, source_id)
);

CREATE TABLE IF NOT EXISTS entity_references (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  source_item_id TEXT NOT NULL REFERENCES source_items(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL DEFAULT 'reference' CHECK (
    relation_type IN ('reference', 'review', 'history', 'repair', 'official', 'community')
  ),
  note TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    review_status IN ('pending', 'approved', 'rejected')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entity_id, source_item_id, relation_type)
);

CREATE TABLE IF NOT EXISTS exhibits (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'reviewed', 'published', 'deprecated')
  ),
  hero_diagram_id TEXT REFERENCES diagrams(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exhibit_sections (
  id TEXT PRIMARY KEY NOT NULL,
  exhibit_id TEXT NOT NULL REFERENCES exhibits(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  related_entity_slugs_json TEXT,
  diagram_slugs_json TEXT,
  source_item_ids_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_exhibit_sections_exhibit ON exhibit_sections(exhibit_id, position);

-- Optional explanation field for graph edges. Existing code can ignore it.
ALTER TABLE entity_links ADD COLUMN reason TEXT;

INSERT OR IGNORE INTO source_registry
  (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at)
VALUES
  ('wikidata', 'Wikidata', 'wikimedia', 'store_full', 'high_for_basic_facts', 'CC0', 'Wikidata contributors', 'https://www.wikidata.org/', 'api', 'Use for entity bootstrap, aliases, external IDs, and basic structured facts.', '2026-06-24'),
  ('wikipedia', 'Wikipedia', 'wikimedia', 'summary_only', 'medium', 'CC BY-SA', 'Wikipedia contributors', 'https://www.wikipedia.org/', 'api', 'Use for background checking and source links; prefer original wording rather than close paraphrase.', '2026-06-24'),
  ('wikimedia-commons', 'Wikimedia Commons', 'wikimedia', 'metadata_only', 'medium', 'varies_per_file', 'File authors as listed on Commons', 'https://commons.wikimedia.org/', 'api', 'Import only metadata until individual file license and attribution are reviewed.', '2026-06-24'),
  ('reddit-fountainpens', 'Reddit r/fountainpens', 'reddit', 'metadata_only', 'community_opinion', 'user_generated_restricted', 'Reddit users', 'https://www.reddit.com/r/fountainpens/', 'official_api', 'Store metadata and aggregate summaries only; do not store comment bodies by default.', '2026-06-24'),
  ('penhero', 'PenHero', 'blog', 'summary_only', 'high_for_model_history', 'copyrighted', 'PenHero authors', 'https://www.penhero.com/', 'manual_or_allowed_fetch', 'Use as reference index and claim candidate source; do not copy text or images.', '2026-06-24'),
  ('richardspens', 'Richard''s Pens', 'blog', 'summary_only', 'high_for_model_history', 'copyrighted', 'Richard Binder / Richardspens.com', 'https://www.richardspens.com/', 'manual_or_allowed_fetch', 'Use as reference index and internal article source; do not copy external images without license review.', '2026-06-24'),
  ('internet-archive', 'Internet Archive', 'book', 'metadata_only', 'bibliographic', 'varies_per_item', 'Internet Archive contributors', 'https://archive.org/', 'api', 'Use for public domain scans, catalog metadata, and source links after item rights review.', '2026-06-24'),
  ('open-library', 'Open Library', 'book', 'metadata_only', 'bibliographic', 'varies_per_item', 'Open Library contributors', 'https://openlibrary.org/', 'api', 'Use for bibliography and book metadata, not full text ingestion.', '2026-06-24'),
  ('google-books', 'Google Books', 'book', 'metadata_only', 'bibliographic', 'copyrighted', 'Google Books / publishers', 'https://books.google.com/', 'api', 'Use for book metadata and previews only.', '2026-06-24');
