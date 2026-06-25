import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs } from "@libsql/client";

const DB_URL = process.env.TURSO_DATABASE_URL || "file:data/fpkg.db";
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

type DbValue = string | number | null;
type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
};

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: DB_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: DB_URL });
}

async function execute(db: Client, sql: string, args: DbValue[] = []) {
  await db.execute({ sql, args: args as InArgs });
}

async function runMigrations(db: Client) {
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  );

  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  const appliedRows = await db.execute("SELECT name FROM migrations");
  const applied = new Set(appliedRows.rows.map((row) => String(row.name)));
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const hasLegacySchema =
    (
      await db.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'entities'",
      )
    ).rows.length > 0;

  for (const file of files) {
    if (applied.has(file)) continue;
    if (hasLegacySchema && file !== "011_library_schema.sql") {
      await execute(
        db,
        "INSERT OR IGNORE INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
        [file],
      );
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await db.executeMultiple(sql);
    await execute(
      db,
      "INSERT INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
      [file],
    );
    console.log(`Applied migration: ${file}`);
  }
}

async function findEntity(
  db: Client,
  type: string,
  slugs: string[],
  nameLike: string,
): Promise<EntityRow | null> {
  for (const slug of slugs) {
    const row = await db.execute({
      sql: "SELECT id, type, slug, name FROM entities WHERE type = ? AND slug = ? LIMIT 1",
      args: [type, slug],
    });
    if (row.rows[0]) return row.rows[0] as EntityRow;
  }

  const fallback = await db.execute({
    sql: "SELECT id, type, slug, name FROM entities WHERE type = ? AND name LIKE ? LIMIT 1",
    args: [type, `%${nameLike}%`],
  });
  return (fallback.rows[0] as EntityRow | undefined) || null;
}

async function columnExists(db: Client, tableName: string, columnName: string) {
  const rows = await db.execute(`PRAGMA table_info(${tableName})`);
  return rows.rows.some((row) => String(row.name) === columnName);
}

async function upsertSourceRegistry(
  db: Client,
  row: {
    id: string;
    name: string;
    source_type: string;
    allowed_use: string;
    reliability: string;
    license: string | null;
    attribution: string | null;
    homepage_url: string;
    fetch_method: string;
    notes: string;
  },
) {
  await execute(
    db,
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      allowed_use = excluded.allowed_use,
      reliability = excluded.reliability,
      license = excluded.license,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      fetch_method = excluded.fetch_method,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [
      row.id,
      row.name,
      row.source_type,
      row.allowed_use,
      row.reliability,
      row.license,
      row.attribution,
      row.homepage_url,
      row.fetch_method,
      row.notes,
    ],
  );
}

async function upsertSourceItem(
  db: Client,
  row: {
    id: string;
    source_id: string;
    title: string;
    url: string;
    item_type: string;
    license?: string | null;
    allowed_use?: string | null;
    summary?: string | null;
    review_status?: string;
  },
) {
  await execute(
    db,
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, allowed_use, summary, review_status, retrieved_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      source_id = excluded.source_id,
      title = excluded.title,
      url = excluded.url,
      item_type = excluded.item_type,
      license = excluded.license,
      allowed_use = excluded.allowed_use,
      summary = excluded.summary,
      review_status = excluded.review_status,
      retrieved_at = excluded.retrieved_at,
      updated_at = datetime('now')`,
    [
      row.id,
      row.source_id,
      row.title,
      row.url,
      row.item_type,
      row.license || null,
      row.allowed_use || null,
      row.summary || null,
      row.review_status || "approved",
    ],
  );
}

async function upsertAttr(
  db: Client,
  entity: EntityRow,
  key: string,
  value: string,
) {
  await execute(
    db,
    `INSERT INTO entity_attributes (id, entity_id, key, value)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(entity_id, key) DO UPDATE SET value = excluded.value`,
    [`library-attr-${entity.slug}-${key}`, entity.id, key, value],
  );
}

async function upsertStory(
  db: Client,
  row: {
    id: string;
    entity_id: string;
    title: string;
    story_type: string;
    summary: string;
    body_md: string;
    status: string;
    source_notes: string;
  },
) {
  await execute(
    db,
    `INSERT INTO stories
      (id, entity_id, title, story_type, summary, body_md, status, source_notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      entity_id = excluded.entity_id,
      title = excluded.title,
      story_type = excluded.story_type,
      summary = excluded.summary,
      body_md = excluded.body_md,
      status = excluded.status,
      source_notes = excluded.source_notes,
      updated_at = datetime('now')`,
    [
      row.id,
      row.entity_id,
      row.title,
      row.story_type,
      row.summary,
      row.body_md,
      row.status,
      row.source_notes,
    ],
  );
}

async function upsertClaim(
  db: Client,
  row: {
    id: string;
    subject_entity_id: string;
    predicate: string;
    object_text: string;
    source_item_id: string;
    confidence: number;
    review_status: string;
  },
) {
  await execute(
    db,
    `INSERT INTO claims
      (id, subject_entity_id, predicate, object_text, source_item_id, confidence, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      subject_entity_id = excluded.subject_entity_id,
      predicate = excluded.predicate,
      object_text = excluded.object_text,
      source_item_id = excluded.source_item_id,
      confidence = excluded.confidence,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      row.id,
      row.subject_entity_id,
      row.predicate,
      row.object_text,
      row.source_item_id,
      row.confidence,
      row.review_status,
    ],
  );
}

async function upsertCitation(
  db: Client,
  row: {
    id: string;
    target_type: string;
    target_id: string;
    source_item_id?: string | null;
    claim_id?: string | null;
    note: string;
  },
) {
  await execute(
    db,
    `INSERT INTO citations
      (id, target_type, target_id, source_item_id, claim_id, note)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      target_type = excluded.target_type,
      target_id = excluded.target_id,
      source_item_id = excluded.source_item_id,
      claim_id = excluded.claim_id,
      note = excluded.note`,
    [
      row.id,
      row.target_type,
      row.target_id,
      row.source_item_id || null,
      row.claim_id || null,
      row.note,
    ],
  );
}

async function upsertTimelineEvent(
  db: Client,
  row: {
    id: string;
    entity_id: string;
    title: string;
    event_type: string;
    start_date: string;
    circa?: number;
    description: string;
    source_item_id: string | null;
    review_status: string;
  },
) {
  await execute(
    db,
    `INSERT INTO timeline_events
      (id, entity_id, title, event_type, start_date, circa, description, source_item_id, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      entity_id = excluded.entity_id,
      title = excluded.title,
      event_type = excluded.event_type,
      start_date = excluded.start_date,
      circa = excluded.circa,
      description = excluded.description,
      source_item_id = excluded.source_item_id,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      row.id,
      row.entity_id,
      row.title,
      row.event_type,
      row.start_date,
      row.circa || 0,
      row.description,
      row.source_item_id,
      row.review_status,
    ],
  );
}

async function upsertModelSpec(
  db: Client,
  row: {
    id: string;
    entity_id: string;
    brand_entity_id: string | null;
    series_name: string;
    release_year: string;
    origin_country: string;
    nib: string;
    fill_system: string;
    material: string;
    dimensions: string;
    weight: string;
    price_range: string;
    status: string;
    review_status: string;
  },
) {
  await execute(
    db,
    `INSERT INTO model_specs
      (id, entity_id, brand_entity_id, series_name, release_year, origin_country, nib, fill_system, material, dimensions, weight, price_range, status, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(entity_id) DO UPDATE SET
      brand_entity_id = excluded.brand_entity_id,
      series_name = excluded.series_name,
      release_year = excluded.release_year,
      origin_country = excluded.origin_country,
      nib = excluded.nib,
      fill_system = excluded.fill_system,
      material = excluded.material,
      dimensions = excluded.dimensions,
      weight = excluded.weight,
      price_range = excluded.price_range,
      status = excluded.status,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      row.id,
      row.entity_id,
      row.brand_entity_id,
      row.series_name,
      row.release_year,
      row.origin_country,
      row.nib,
      row.fill_system,
      row.material,
      row.dimensions,
      row.weight,
      row.price_range,
      row.status,
      row.review_status,
    ],
  );
}

async function upsertVariant(
  db: Client,
  row: {
    id: string;
    model_entity_id: string;
    variant_name: string;
    release_year: string | null;
    notes: string;
    source_item_id: string | null;
    review_status: string;
  },
) {
  await execute(
    db,
    `INSERT INTO model_variants
      (id, model_entity_id, variant_name, release_year, notes, source_item_id, review_status)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(model_entity_id, variant_name) DO UPDATE SET
      release_year = excluded.release_year,
      notes = excluded.notes,
      source_item_id = excluded.source_item_id,
      review_status = excluded.review_status`,
    [
      row.id,
      row.model_entity_id,
      row.variant_name,
      row.release_year,
      row.notes,
      row.source_item_id,
      row.review_status,
    ],
  );
}

async function upsertDiagram(
  db: Client,
  row: {
    id: string;
    slug: string;
    title: string;
    diagram_type: string;
    svg: string;
    hotspots_json: string;
    source_note: string;
    license: string;
    review_status: string;
  },
) {
  await execute(
    db,
    `INSERT INTO diagrams
      (id, slug, title, diagram_type, svg, hotspots_json, source_note, license, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      diagram_type = excluded.diagram_type,
      svg = excluded.svg,
      hotspots_json = excluded.hotspots_json,
      source_note = excluded.source_note,
      license = excluded.license,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      row.id,
      row.slug,
      row.title,
      row.diagram_type,
      row.svg,
      row.hotspots_json,
      row.source_note,
      row.license,
      row.review_status,
    ],
  );
}

async function upsertReference(
  db: Client,
  row: {
    id: string;
    entity_id: string;
    source_item_id: string;
    relation_type: string;
    note: string;
    review_status: string;
  },
) {
  await execute(
    db,
    `INSERT INTO entity_references
      (id, entity_id, source_item_id, relation_type, note, review_status)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
      note = excluded.note,
      review_status = excluded.review_status`,
    [
      row.id,
      row.entity_id,
      row.source_item_id,
      row.relation_type,
      row.note,
      row.review_status,
    ],
  );
}

async function upsertMediaAsset(
  db: Client,
  row: {
    id: string;
    entity_id: string | null;
    title: string;
    asset_type: string;
    source_url: string;
    source_item_id: string;
    author: string | null;
    license: string;
    attribution_text: string;
    review_status: string;
    usage_status: string;
  },
) {
  await execute(
    db,
    `INSERT INTO media_assets
      (id, entity_id, title, asset_type, source_url, source_item_id, author, license, attribution_text, review_status, usage_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      entity_id = excluded.entity_id,
      title = excluded.title,
      asset_type = excluded.asset_type,
      source_url = excluded.source_url,
      source_item_id = excluded.source_item_id,
      author = excluded.author,
      license = excluded.license,
      attribution_text = excluded.attribution_text,
      review_status = excluded.review_status,
      usage_status = excluded.usage_status,
      updated_at = datetime('now')`,
    [
      row.id,
      row.entity_id,
      row.title,
      row.asset_type,
      row.source_url,
      row.source_item_id,
      row.author,
      row.license,
      row.attribution_text,
      row.review_status,
      row.usage_status,
    ],
  );
}

async function upsertCommunitySummary(
  db: Client,
  row: {
    id: string;
    entity_id: string;
    source_id: string;
    summary_md: string;
    metadata_json: string;
    status: string;
  },
) {
  await execute(
    db,
    `INSERT INTO community_summaries
      (id, entity_id, source_id, summary_md, metadata_json, status, refreshed_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, date('now'), datetime('now'))
     ON CONFLICT(entity_id, source_id) DO UPDATE SET
      summary_md = excluded.summary_md,
      metadata_json = excluded.metadata_json,
      status = excluded.status,
      refreshed_at = excluded.refreshed_at,
      updated_at = datetime('now')`,
    [
      row.id,
      row.entity_id,
      row.source_id,
      row.summary_md,
      row.metadata_json,
      row.status,
    ],
  );
}

async function upsertLink(
  db: Client,
  hasReason: boolean,
  source: EntityRow,
  target: EntityRow,
  linkType: string,
  reason: string,
) {
  const id = `library-link-${source.slug}-${target.slug}-${linkType}`
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 96);

  if (hasReason) {
    await execute(
      db,
      `INSERT INTO entity_links (id, source_id, target_id, link_type, reason)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(source_id, target_id, link_type) DO UPDATE SET reason = excluded.reason`,
      [id, source.id, target.id, linkType, reason],
    );
    return;
  }

  await execute(
    db,
    `INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
     VALUES (?, ?, ?, ?)`,
    [id, source.id, target.id, linkType],
  );
}

async function upsertExhibit(
  db: Client,
  row: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    status: string;
    hero_diagram_id: string | null;
  },
) {
  await execute(
    db,
    `INSERT INTO exhibits (id, slug, title, summary, status, hero_diagram_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      status = excluded.status,
      hero_diagram_id = excluded.hero_diagram_id,
      updated_at = datetime('now')`,
    [
      row.id,
      row.slug,
      row.title,
      row.summary,
      row.status,
      row.hero_diagram_id,
    ],
  );
}

async function upsertExhibitSection(
  db: Client,
  row: {
    id: string;
    exhibit_id: string;
    position: number;
    title: string;
    body_md: string;
    related_entity_slugs_json: string;
    diagram_slugs_json: string;
    source_item_ids_json: string;
  },
) {
  await execute(
    db,
    `INSERT INTO exhibit_sections
      (id, exhibit_id, position, title, body_md, related_entity_slugs_json, diagram_slugs_json, source_item_ids_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      position = excluded.position,
      title = excluded.title,
      body_md = excluded.body_md,
      related_entity_slugs_json = excluded.related_entity_slugs_json,
      diagram_slugs_json = excluded.diagram_slugs_json,
      source_item_ids_json = excluded.source_item_ids_json,
      updated_at = datetime('now')`,
    [
      row.id,
      row.exhibit_id,
      row.position,
      row.title,
      row.body_md,
      row.related_entity_slugs_json,
      row.diagram_slugs_json,
      row.source_item_ids_json,
    ],
  );
}

function svgFrame(title: string, body: string) {
  return `<svg viewBox="0 0 960 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
  <rect width="960" height="420" rx="24" fill="#fbf7ef"/>
  <rect x="24" y="24" width="912" height="372" rx="18" fill="#fffaf2" stroke="#d8c8aa" stroke-width="2"/>
  <text x="48" y="62" fill="#4b3422" font-family="system-ui, sans-serif" font-size="24" font-weight="700">${title}</text>
  ${body}
</svg>`;
}

const diagrams = [
  {
    id: "diagram-piston-filler",
    slug: "piston-filler-mechanism",
    title: "活塞上墨机制",
    diagram_type: "mechanism",
    svg: svgFrame(
      "活塞上墨机制",
      `<rect x="118" y="164" width="620" height="86" rx="43" fill="#f2dfbf" stroke="#7c5b3c" stroke-width="4"/>
  <rect x="156" y="181" width="360" height="52" rx="26" fill="#6f9fb5" opacity="0.65"/>
  <line x1="536" y1="154" x2="536" y2="260" stroke="#4b3422" stroke-width="8"/>
  <rect x="738" y="180" width="88" height="54" rx="16" fill="#d7b77a" stroke="#7c5b3c" stroke-width="4"/>
  <path d="M198 290 C270 326, 390 326, 468 290" fill="none" stroke="#a85f3d" stroke-width="5"/>
  <text x="164" y="142" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">墨仓</text>
  <text x="508" y="142" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">活塞</text>
  <text x="724" y="160" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">旋钮</text>`,
    ),
    hotspots_json: JSON.stringify([
      { label: "墨仓", x: 28, y: 50, explanation: "笔杆内部直接储墨，容量通常高于转换器。" },
      { label: "活塞", x: 56, y: 50, explanation: "旋转笔尾时前后移动，形成负压吸墨。" },
      { label: "旋钮", x: 80, y: 50, explanation: "驱动活塞杆的外部操作件。" },
    ]),
    source_note: "站内原创机制示意图，用于解释结构关系，不代表特定厂牌工程图。",
    license: "site-original",
    review_status: "reviewed",
  },
  {
    id: "diagram-vacuum-filler",
    slug: "vacuum-filler-mechanism",
    title: "真空上墨机制",
    diagram_type: "mechanism",
    svg: svgFrame(
      "真空上墨机制",
      `<rect x="112" y="164" width="650" height="86" rx="43" fill="#e7d1aa" stroke="#765234" stroke-width="4"/>
  <rect x="154" y="181" width="450" height="52" rx="26" fill="#6c8fb2" opacity="0.62"/>
  <line x1="612" y1="150" x2="612" y2="264" stroke="#4b3422" stroke-width="7"/>
  <line x1="612" y1="207" x2="816" y2="207" stroke="#4b3422" stroke-width="8"/>
  <circle cx="844" cy="207" r="22" fill="#d7b77a" stroke="#765234" stroke-width="4"/>
  <path d="M212 290 C288 324, 402 324, 512 290" fill="none" stroke="#a85f3d" stroke-width="5"/>
  <text x="142" y="142" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">大容量墨仓</text>
  <text x="584" y="140" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">密封垫</text>
  <text x="766" y="176" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">拉杆</text>`,
    ),
    hotspots_json: JSON.stringify([
      { label: "墨仓", x: 29, y: 50, explanation: "真空杆推到底时墨水快速进入笔杆。" },
      { label: "密封", x: 64, y: 50, explanation: "密封垫经过扩大段时释放负压。" },
      { label: "拉杆", x: 84, y: 50, explanation: "抽拉形成压差，常见于大容量日用笔。" },
    ]),
    source_note: "站内原创机制示意图，作为 Pilot Custom 823 等真空上墨型号的通用解释。",
    license: "site-original",
    review_status: "reviewed",
  },
  {
    id: "diagram-lever-filler",
    slug: "lever-filler-mechanism",
    title: "杠杆上墨机制",
    diagram_type: "mechanism",
    svg: svgFrame(
      "杠杆上墨机制",
      `<rect x="124" y="170" width="600" height="78" rx="39" fill="#eadcc4" stroke="#765234" stroke-width="4"/>
  <rect x="190" y="190" width="360" height="38" rx="19" fill="#8fb2a0" opacity="0.6"/>
  <path d="M462 166 L648 122 L670 146 L492 210 Z" fill="#d3ac6f" stroke="#765234" stroke-width="4"/>
  <line x1="556" y1="186" x2="556" y2="232" stroke="#4b3422" stroke-width="6"/>
  <text x="188" y="150" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">橡胶墨囊</text>
  <text x="548" y="106" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">外置杠杆</text>
  <text x="548" y="270" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">压片</text>`,
    ),
    hotspots_json: JSON.stringify([
      { label: "墨囊", x: 33, y: 50, explanation: "被压缩后回弹吸墨，是早期钢笔常见结构。" },
      { label: "杠杆", x: 65, y: 35, explanation: "外部操作件，抬起时带动压片。" },
      { label: "压片", x: 59, y: 56, explanation: "把杠杆动作转化为对墨囊的挤压。" },
    ]),
    source_note: "站内原创机制示意图，用于说明经典自来水笔结构。",
    license: "site-original",
    review_status: "reviewed",
  },
  {
    id: "diagram-cartridge-converter",
    slug: "cartridge-converter-map",
    title: "墨胆/转换器结构图",
    diagram_type: "structure",
    svg: svgFrame(
      "墨胆/转换器结构图",
      `<rect x="116" y="146" width="258" height="76" rx="38" fill="#e8c98c" stroke="#765234" stroke-width="4"/>
  <rect x="430" y="146" width="300" height="76" rx="38" fill="#d8e0d2" stroke="#765234" stroke-width="4"/>
  <rect x="476" y="164" width="164" height="40" rx="20" fill="#6f9fb5" opacity="0.55"/>
  <line x1="650" y1="150" x2="650" y2="218" stroke="#4b3422" stroke-width="6"/>
  <path d="M374 184 H430" stroke="#a85f3d" stroke-width="5" stroke-dasharray="10 8"/>
  <text x="182" y="132" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">墨胆</text>
  <text x="522" y="132" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">转换器</text>
  <text x="396" y="276" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">同一握位可接不同供墨件</text>`,
    ),
    hotspots_json: JSON.stringify([
      { label: "墨胆", x: 25, y: 44, explanation: "一次性或可复用墨水容器，换色方便。" },
      { label: "接口", x: 42, y: 44, explanation: "不同品牌标准不完全通用，是选购时需要注意的点。" },
      { label: "转换器", x: 60, y: 44, explanation: "让墨胆笔也能从瓶装墨水吸墨。" },
    ]),
    source_note: "站内原创结构示意图，不对应某一品牌接口尺寸。",
    license: "site-original",
    review_status: "reviewed",
  },
  {
    id: "diagram-nib-feed",
    slug: "nib-feed-anatomy",
    title: "笔尖与笔舌解剖图",
    diagram_type: "structure",
    svg: svgFrame(
      "笔尖与笔舌解剖图",
      `<path d="M186 276 C300 96, 476 96, 590 276 Z" fill="#e4c47f" stroke="#765234" stroke-width="4"/>
  <line x1="388" y1="124" x2="388" y2="276" stroke="#765234" stroke-width="4"/>
  <circle cx="388" cy="194" r="18" fill="#fffaf2" stroke="#765234" stroke-width="4"/>
  <rect x="642" y="144" width="152" height="148" rx="28" fill="#5a4638" opacity="0.88"/>
  <path d="M662 176 H774 M662 206 H774 M662 236 H774 M662 266 H774" stroke="#fbf7ef" stroke-width="5"/>
  <path d="M590 238 C620 220, 632 190, 642 166" fill="none" stroke="#a85f3d" stroke-width="5"/>
  <text x="230" y="118" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">铱粒/笔尖端</text>
  <text x="376" y="104" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">中缝</text>
  <text x="684" y="126" fill="#4b3422" font-family="system-ui, sans-serif" font-size="16">笔舌</text>`,
    ),
    hotspots_json: JSON.stringify([
      { label: "铱粒", x: 25, y: 65, explanation: "实际触纸的耐磨部位，决定打磨形态。" },
      { label: "气孔", x: 40, y: 46, explanation: "缓解应力并帮助稳定墨流。" },
      { label: "笔舌", x: 75, y: 51, explanation: "通过毛细结构调节墨水与空气交换。" },
    ]),
    source_note: "站内原创解剖示意图，适合作为所有型号页的基础图示。",
    license: "site-original",
    review_status: "reviewed",
  },
];

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  await runMigrations(db);

  const [pilot, lamy, pilot823, lamy2000] = await Promise.all([
    findEntity(db, "brand", ["pilot"], "Pilot"),
    findEntity(db, "brand", ["lamy"], "LAMY"),
    findEntity(db, "pen", ["pilot-custom-823"], "Custom 823"),
    findEntity(db, "pen", ["凌美-lamy-lamy-2000", "lamy-2000"], "LAMY 2000"),
  ]);

  const missing = [
    ["Pilot 品牌", pilot],
    ["LAMY 品牌", lamy],
    ["Pilot Custom 823", pilot823],
    ["LAMY 2000", lamy2000],
  ].filter(([, entity]) => !entity);
  if (missing.length > 0) {
    console.warn(`Skipped some sample links: ${missing.map(([name]) => name).join(", ")}`);
  }

  await upsertSourceRegistry(db, {
    id: "pilot-official",
    name: "PILOT official site",
    source_type: "official",
    allowed_use: "summary_only",
    reliability: "official_marketing",
    license: "copyrighted",
    attribution: "PILOT Corporation",
    homepage_url: "https://corp.pilot.co.jp/english/",
    fetch_method: "manual_or_allowed_fetch",
    notes: "Use for official product and company history facts; summarize rather than copy.",
  });
  await upsertSourceRegistry(db, {
    id: "lamy-official",
    name: "LAMY official site",
    source_type: "official",
    allowed_use: "summary_only",
    reliability: "official_marketing",
    license: "copyrighted",
    attribution: "C. Josef Lamy GmbH",
    homepage_url: "https://www.lamy.com/",
    fetch_method: "manual_or_allowed_fetch",
    notes: "Use for official product, design, and company background facts; summarize rather than copy.",
  });

  const sourceItems = [
    {
      id: "source-pilot-history",
      source_id: "pilot-official",
      title: "PILOT History",
      url: "https://corp.pilot.co.jp/english/company/history/",
      item_type: "official_history",
      license: "copyrighted",
      allowed_use: "summary_only",
      summary: "Official PILOT company history timeline.",
    },
    {
      id: "source-pilot-custom-series",
      source_id: "pilot-official",
      title: "PILOT CUSTOM series",
      url: "https://www.pilot-custom.jp/en/",
      item_type: "official_product",
      license: "copyrighted",
      allowed_use: "summary_only",
      summary: "Official overview of the CUSTOM fountain pen series.",
    },
    {
      id: "source-lamy-company",
      source_id: "lamy-official",
      title: "The company and the brand LAMY",
      url: "https://www.lamy.com/en-us/company",
      item_type: "official_history",
      license: "copyrighted",
      allowed_use: "summary_only",
      summary: "Official company and brand positioning page for LAMY.",
    },
    {
      id: "source-lamy-design",
      source_id: "lamy-official",
      title: "The LAMY Design",
      url: "https://www.lamy.com/en-us/company/design",
      item_type: "official_design",
      license: "copyrighted",
      allowed_use: "summary_only",
      summary: "Official design-language page, including the LAMY 2000 as a design milestone.",
    },
    {
      id: "source-lamy-2000-official",
      source_id: "lamy-official",
      title: "LAMY 2000 fountain pen",
      url: "https://www.lamy.com/en-us/p/lamy-2000-fountain-pen",
      item_type: "official_product",
      license: "copyrighted",
      allowed_use: "summary_only",
      summary: "Official product page for the LAMY 2000 fountain pen.",
    },
    {
      id: "source-reddit-fountainpens-home",
      source_id: "reddit-fountainpens",
      title: "r/fountainpens community index",
      url: "https://www.reddit.com/r/fountainpens/",
      item_type: "community_index",
      license: "user_generated_restricted",
      allowed_use: "metadata_only",
      summary: "Community source for aggregate sentiment and recurring questions only.",
    },
    {
      id: "source-richardspens-reference",
      source_id: "richardspens",
      title: "Richard's Pens reference pages",
      url: "https://www.richardspens.com/ref/00_refp.htm",
      item_type: "reference_index",
      license: "copyrighted",
      allowed_use: "summary_only",
      summary: "Independent fountain pen reference index for repair, filling systems, and model history.",
    },
    {
      id: "source-penhero-home",
      source_id: "penhero",
      title: "PenHero reference home",
      url: "https://www.penhero.com/",
      item_type: "reference_index",
      license: "copyrighted",
      allowed_use: "summary_only",
      summary: "Independent reference site for vintage and modern fountain pen articles.",
    },
    {
      id: "source-commons-pilot-custom-823-search",
      source_id: "wikimedia-commons",
      title: "Wikimedia Commons media search: Pilot Custom 823",
      url: "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=Pilot%20Custom%20823",
      item_type: "media_search",
      license: "varies_per_file",
      allowed_use: "metadata_only",
      summary:
        "Candidate media search, not a reviewed image. Individual files need license and attribution review.",
    },
    {
      id: "source-commons-lamy-2000-search",
      source_id: "wikimedia-commons",
      title: "Wikimedia Commons media search: LAMY 2000 fountain pen",
      url: "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=LAMY%202000%20fountain%20pen",
      item_type: "media_search",
      license: "varies_per_file",
      allowed_use: "metadata_only",
      summary:
        "Candidate media search, not a reviewed image. Individual files need license and attribution review.",
    },
  ];

  for (const item of sourceItems) {
    await upsertSourceItem(db, item);
  }

  if (pilot) {
    await upsertAttr(db, pilot, "founded", "1918");
    await upsertAttr(db, pilot, "origin_country", "日本");
    await upsertAttr(db, pilot, "design_keywords", "可靠、工业化、日用旗舰、漆艺支线");
    await upsertAttr(db, pilot, "signature_technology", "CUSTOM 系列、真空上墨、按动钢笔、Namiki 漆艺");
    await upsertStory(db, {
      id: "story-brand-pilot-library",
      entity_id: pilot.id,
      title: "从国产化钢笔到日用旗舰",
      story_type: "brand_story",
      summary: "Pilot 的馆藏入口先围绕 1918、CUSTOM 系列和 Namiki 漆艺支线组织。",
      status: "draft",
      source_notes: "Seed draft based on official history and CUSTOM series pages; needs deeper claim review.",
      body_md:
        "Pilot 的故事适合从“日本制造钢笔的现代化”讲起：它一边有面向日常书写的大规模产品线，一边又保留了 Namiki 漆艺等更偏收藏和工艺的支线。\n\n在图书馆结构里，Pilot 不只是一个品牌节点，而是可以继续展开成几条阅读路径：**CUSTOM 系列的日用旗舰路线**、**Capless/Vanishing Point 的机构创新路线**、**Namiki 的漆艺路线**，以及面向学生和入门用户的 Kakuno/Prera 路线。",
    });
    await upsertClaim(db, {
      id: "claim-pilot-1918",
      subject_entity_id: pilot.id,
      predicate: "history_milestone",
      object_text: "Pilot official history positions 1918 as a foundational year for its fountain pen history.",
      source_item_id: "source-pilot-history",
      confidence: 0.8,
      review_status: "approved",
    });
    await upsertCitation(db, {
      id: "cite-claim-pilot-1918-source",
      target_type: "claim",
      target_id: "claim-pilot-1918",
      source_item_id: "source-pilot-history",
      note: "Claim source for Pilot foundational year.",
    });
    await upsertCitation(db, {
      id: "cite-story-pilot-library-history",
      target_type: "story",
      target_id: "story-brand-pilot-library",
      source_item_id: "source-pilot-history",
      claim_id: "claim-pilot-1918",
      note: "Brand story seed uses official history as the first verified anchor.",
    });
    await upsertCitation(db, {
      id: "cite-story-pilot-library-custom-series",
      target_type: "story",
      target_id: "story-brand-pilot-library",
      source_item_id: "source-pilot-custom-series",
      note: "Brand story seed references the official CUSTOM series as a reading path.",
    });
    await upsertTimelineEvent(db, {
      id: "timeline-pilot-1918",
      entity_id: pilot.id,
      title: "品牌早期历史节点",
      event_type: "brand_founded",
      start_date: "1918",
      description: "作为 Pilot 品牌馆的起点，后续应继续拆分公司设立、早期产品和海外扩展等条目。",
      source_item_id: "source-pilot-history",
      review_status: "approved",
    });
    await upsertCitation(db, {
      id: "cite-timeline-pilot-1918",
      target_type: "timeline_event",
      target_id: "timeline-pilot-1918",
      source_item_id: "source-pilot-history",
      claim_id: "claim-pilot-1918",
      note: "Timeline event source anchor.",
    });
  }

  if (lamy) {
    await upsertAttr(db, lamy, "founded", "1930");
    await upsertAttr(db, lamy, "origin_country", "德国");
    await upsertAttr(db, lamy, "design_keywords", "包豪斯、功能主义、现代工业设计、Heidelberg");
    await upsertAttr(db, lamy, "signature_technology", "LAMY 2000、Safari、模块化笔尖生态");
    await upsertStory(db, {
      id: "story-brand-lamy-library",
      entity_id: lamy.id,
      title: "以设计语言建立品牌识别",
      story_type: "brand_story",
      summary: "LAMY 的馆藏入口适合围绕 Heidelberg、设计语言和 2000/Safari 两条代表线索展开。",
      status: "draft",
      source_notes: "Seed draft based on LAMY company, design, and product pages; needs fuller independent sourcing.",
      body_md:
        "LAMY 的资料馆可以先从两个关键词展开：**Heidelberg** 和 **设计语言**。它的品牌辨识度不主要来自装饰，而来自把握笔姿、材料触感、夹扣、上墨和量产的一整套系统。\n\n如果把 LAMY 做成一个展厅，LAMY 2000 是“现代主义旗舰”，Safari 是“学生笔如何变成设计符号”，Studio/Dialog 则适合放进“当代设计师合作”路径。",
    });
    await upsertClaim(db, {
      id: "claim-lamy-2000-design-language",
      subject_entity_id: lamy.id,
      predicate: "design_milestone",
      object_text: "LAMY official design material treats the LAMY 2000 as a key design-language milestone from 1966.",
      source_item_id: "source-lamy-design",
      confidence: 0.82,
      review_status: "approved",
    });
    await upsertCitation(db, {
      id: "cite-claim-lamy-design-language-source",
      target_type: "claim",
      target_id: "claim-lamy-2000-design-language",
      source_item_id: "source-lamy-design",
      note: "Claim source for LAMY design-language milestone.",
    });
    await upsertCitation(db, {
      id: "cite-story-lamy-library-company",
      target_type: "story",
      target_id: "story-brand-lamy-library",
      source_item_id: "source-lamy-company",
      note: "Brand story seed uses LAMY company material as identity anchor.",
    });
    await upsertCitation(db, {
      id: "cite-story-lamy-library-design",
      target_type: "story",
      target_id: "story-brand-lamy-library",
      source_item_id: "source-lamy-design",
      claim_id: "claim-lamy-2000-design-language",
      note: "Brand story seed uses official design material for the LAMY 2000 path.",
    });
    await upsertTimelineEvent(db, {
      id: "timeline-lamy-1930",
      entity_id: lamy.id,
      title: "品牌历史起点",
      event_type: "brand_founded",
      start_date: "1930",
      circa: 1,
      description: "作为 LAMY 品牌馆的早期节点，后续应继续补充 Orthos、Artus、公司更名和现代产品线资料。",
      source_item_id: "source-lamy-company",
      review_status: "needs_source",
    });
    await upsertCitation(db, {
      id: "cite-timeline-lamy-1930",
      target_type: "timeline_event",
      target_id: "timeline-lamy-1930",
      source_item_id: "source-lamy-company",
      note: "Early LAMY timeline source anchor; status remains needs_source.",
    });
    await upsertTimelineEvent(db, {
      id: "timeline-lamy-1966-design",
      entity_id: lamy.id,
      title: "LAMY 2000 建立现代设计语言",
      event_type: "design_milestone",
      start_date: "1966",
      description: "官方设计材料把 LAMY 2000 与品牌的现代设计语言相连，适合成为 LAMY 展厅的核心节点。",
      source_item_id: "source-lamy-design",
      review_status: "approved",
    });
    await upsertCitation(db, {
      id: "cite-timeline-lamy-1966-design",
      target_type: "timeline_event",
      target_id: "timeline-lamy-1966-design",
      source_item_id: "source-lamy-design",
      claim_id: "claim-lamy-2000-design-language",
      note: "LAMY design-language timeline source anchor.",
    });
  }

  if (pilot && pilot823) {
    await upsertLink(
      db,
      await columnExists(db, "entity_links", "reason"),
      pilot,
      pilot823,
      "made_by",
      "Pilot brand museum representative model.",
    );
  }
  if (lamy && lamy2000) {
    await upsertLink(
      db,
      await columnExists(db, "entity_links", "reason"),
      lamy,
      lamy2000,
      "made_by",
      "LAMY brand museum representative model.",
    );
  }

  if (pilot823) {
    await upsertStory(db, {
      id: "story-model-pilot-custom-823-library",
      entity_id: pilot823.id,
      title: "把大容量上墨做成日用旗舰",
      story_type: "model_story",
      summary: "Custom 823 的资料卡先围绕 CUSTOM 系列、真空上墨和长写作场景组织。",
      status: "draft",
      source_notes: "Seed draft; release-year and variant history need official catalog or book sources.",
      body_md:
        "Custom 823 在资料库里不应该只是一张参数卡。它适合放进“长时间书写”和“透明示范杆”两条路径：前者解释大容量真空上墨为什么被用户重视，后者解释透明笔身如何把工具变成可观察的对象。\n\n后续扩写时应优先核对：首次上市年份、地区限定颜色、笔尖规格、透明/琥珀/烟灰等颜色版本，以及维修维护注意事项。",
    });
    await upsertModelSpec(db, {
      id: "spec-pilot-custom-823",
      entity_id: pilot823.id,
      brand_entity_id: pilot?.id || null,
      series_name: "CUSTOM",
      release_year: "待核验",
      origin_country: "日本",
      nib: "14K 金尖，常见 F/M/B 等规格",
      fill_system: "真空上墨",
      material: "透明树脂",
      dimensions: "待核验",
      weight: "待核验",
      price_range: "中高端",
      status: "在产/地区供应需核验",
      review_status: "needs_source",
    });
    await upsertCitation(db, {
      id: "cite-story-custom823-series",
      target_type: "story",
      target_id: "story-model-pilot-custom-823-library",
      source_item_id: "source-pilot-custom-series",
      note: "Model story seed uses official CUSTOM series page as initial source.",
    });
    await upsertCitation(db, {
      id: "cite-spec-custom823-series",
      target_type: "model_spec",
      target_id: "spec-pilot-custom-823",
      source_item_id: "source-pilot-custom-series",
      note: "Model spec seed points to official series page; detailed specs remain partially unverified.",
    });
    await upsertClaim(db, {
      id: "claim-custom823-custom-series",
      subject_entity_id: pilot823.id,
      predicate: "official_series",
      object_text: "Pilot official CUSTOM series material lists Custom 823 as part of the CUSTOM line.",
      source_item_id: "source-pilot-custom-series",
      confidence: 0.78,
      review_status: "approved",
    });
    await upsertCitation(db, {
      id: "cite-claim-custom823-series",
      target_type: "claim",
      target_id: "claim-custom823-custom-series",
      source_item_id: "source-pilot-custom-series",
      note: "Claim source for Custom 823 series membership.",
    });
    await upsertClaim(db, {
      id: "claim-custom823-vacuum-filler",
      subject_entity_id: pilot823.id,
      predicate: "fill_system",
      object_text: "The library classifies Custom 823 as a vacuum-filling model; exact official wording still needs line-by-line review.",
      source_item_id: "source-pilot-custom-series",
      confidence: 0.72,
      review_status: "needs_source",
    });
    await upsertCitation(db, {
      id: "cite-claim-custom823-vacuum",
      target_type: "claim",
      target_id: "claim-custom823-vacuum-filler",
      source_item_id: "source-pilot-custom-series",
      note: "Claim source candidate for vacuum filling; wording needs review.",
    });
    await upsertVariant(db, {
      id: "variant-custom823-amber",
      model_entity_id: pilot823.id,
      variant_name: "Amber / 琥珀透明",
      release_year: null,
      notes: "常见透明琥珀色版本，具体地区供应和年代待核验。",
      source_item_id: "source-pilot-custom-series",
      review_status: "needs_source",
    });
    await upsertVariant(db, {
      id: "variant-custom823-smoke",
      model_entity_id: pilot823.id,
      variant_name: "Smoke / 烟灰透明",
      release_year: null,
      notes: "常见透明烟灰色版本，后续需要补充地区差异。",
      source_item_id: "source-pilot-custom-series",
      review_status: "needs_source",
    });
    await upsertTimelineEvent(db, {
      id: "timeline-custom823-library-entry",
      entity_id: pilot823.id,
      title: "CUSTOM 系列中的真空上墨代表",
      event_type: "design_milestone",
      start_date: "2000",
      circa: 1,
      description: "先作为馆藏结构节点展示；实际上市年份需继续从官方目录、书籍或可靠评测中确认。",
      source_item_id: "source-pilot-custom-series",
      review_status: "needs_source",
    });
    await upsertCitation(db, {
      id: "cite-timeline-custom823-library-entry",
      target_type: "timeline_event",
      target_id: "timeline-custom823-library-entry",
      source_item_id: "source-pilot-custom-series",
      note: "Custom 823 timeline placeholder source; date needs catalog verification.",
    });
  }

  if (lamy2000) {
    await upsertStory(db, {
      id: "story-model-lamy-2000-library",
      entity_id: lamy2000.id,
      title: "一支钢笔如何变成设计语言",
      story_type: "model_story",
      summary: "LAMY 2000 的资料卡先围绕 1966、Makrolon 质感、半包尖和活塞上墨展开。",
      status: "draft",
      source_notes: "Seed draft based on LAMY official product/design pages; material and spec details need line-by-line review.",
      body_md:
        "LAMY 2000 很适合作为“型号档案”的样板：它不是靠复杂装饰取胜，而是靠材质、比例、夹扣、半包尖和活塞系统形成整体感。\n\n后续扩写时，可以把它拆成三层：**1966 与品牌设计语言**、**Makrolon 与不锈钢的触感对比**、**半包尖和活塞上墨如何服务连续书写**。这些内容要配合结构图，而不是只堆评测文字。",
    });
    await upsertModelSpec(db, {
      id: "spec-lamy-2000",
      entity_id: lamy2000.id,
      brand_entity_id: lamy?.id || null,
      series_name: "2000",
      release_year: "1966",
      origin_country: "德国",
      nib: "半包 14K 金尖，镀铂外观",
      fill_system: "活塞上墨",
      material: "Makrolon 聚碳酸酯与不锈钢",
      dimensions: "待核验",
      weight: "待核验",
      price_range: "中高端",
      status: "在产",
      review_status: "needs_source",
    });
    await upsertCitation(db, {
      id: "cite-story-lamy2000-official",
      target_type: "story",
      target_id: "story-model-lamy-2000-library",
      source_item_id: "source-lamy-2000-official",
      note: "Model story seed uses official LAMY 2000 product page.",
    });
    await upsertCitation(db, {
      id: "cite-story-lamy2000-design",
      target_type: "story",
      target_id: "story-model-lamy-2000-library",
      source_item_id: "source-lamy-design",
      claim_id: "claim-lamy-2000-design-language",
      note: "Model story seed uses official design material.",
    });
    await upsertCitation(db, {
      id: "cite-spec-lamy2000-official",
      target_type: "model_spec",
      target_id: "spec-lamy-2000",
      source_item_id: "source-lamy-2000-official",
      note: "Model spec seed points to official product page; several details still need exact catalog review.",
    });
    await upsertClaim(db, {
      id: "claim-lamy2000-1966",
      subject_entity_id: lamy2000.id,
      predicate: "model_released",
      object_text: "LAMY official material presents LAMY 2000 as a 1966 model.",
      source_item_id: "source-lamy-2000-official",
      confidence: 0.86,
      review_status: "approved",
    });
    await upsertCitation(db, {
      id: "cite-claim-lamy2000-1966",
      target_type: "claim",
      target_id: "claim-lamy2000-1966",
      source_item_id: "source-lamy-2000-official",
      note: "Claim source for LAMY 2000 1966 model note.",
    });
    await upsertClaim(db, {
      id: "claim-lamy2000-material",
      subject_entity_id: lamy2000.id,
      predicate: "material",
      object_text: "LAMY 2000 is represented in this library as a Makrolon and stainless-steel design; material details still need exact catalog verification.",
      source_item_id: "source-lamy-2000-official",
      confidence: 0.74,
      review_status: "needs_source",
    });
    await upsertCitation(db, {
      id: "cite-claim-lamy2000-material",
      target_type: "claim",
      target_id: "claim-lamy2000-material",
      source_item_id: "source-lamy-2000-official",
      note: "Claim source candidate for material note; exact catalog wording needs review.",
    });
    await upsertClaim(db, {
      id: "claim-lamy2000-piston",
      subject_entity_id: lamy2000.id,
      predicate: "fill_system",
      object_text: "The LAMY 2000 archive classifies the fountain pen as a piston-filling model.",
      source_item_id: "source-lamy-2000-official",
      confidence: 0.76,
      review_status: "needs_source",
    });
    await upsertCitation(db, {
      id: "cite-claim-lamy2000-piston",
      target_type: "claim",
      target_id: "claim-lamy2000-piston",
      source_item_id: "source-lamy-2000-official",
      note: "Claim source candidate for piston-filling classification.",
    });
    await upsertVariant(db, {
      id: "variant-lamy2000-makrolon",
      model_entity_id: lamy2000.id,
      variant_name: "Makrolon 黑色经典款",
      release_year: "1966",
      notes: "品牌设计语言的核心样式；细节规格需继续逐项核验。",
      source_item_id: "source-lamy-2000-official",
      review_status: "approved",
    });
    await upsertTimelineEvent(db, {
      id: "timeline-lamy2000-1966",
      entity_id: lamy2000.id,
      title: "LAMY 2000 发布并成为设计语言核心",
      event_type: "model_released",
      start_date: "1966",
      description: "官方材料将 1966 年的 LAMY 2000 与品牌现代设计语言相连。",
      source_item_id: "source-lamy-2000-official",
      review_status: "approved",
    });
    await upsertCitation(db, {
      id: "cite-timeline-lamy2000-1966",
      target_type: "timeline_event",
      target_id: "timeline-lamy2000-1966",
      source_item_id: "source-lamy-2000-official",
      claim_id: "claim-lamy2000-1966",
      note: "LAMY 2000 timeline source anchor.",
    });
  }

  for (const diagram of diagrams) {
    await upsertDiagram(db, diagram);
  }

  const diagramCitations = [
    {
      id: "cite-diagram-piston-filler-reference",
      target_type: "diagram",
      target_id: "diagram-piston-filler",
      source_item_id: "source-richardspens-reference",
      note: "General filling-system reference index for educational redrawing.",
    },
    {
      id: "cite-diagram-vacuum-filler-custom823",
      target_type: "diagram",
      target_id: "diagram-vacuum-filler",
      source_item_id: "source-pilot-custom-series",
      claim_id: "claim-custom823-vacuum-filler",
      note: "Vacuum-filler diagram is used as a Custom 823 explanatory illustration; it is site-original, not a copied product drawing.",
    },
    {
      id: "cite-diagram-lever-filler-reference",
      target_type: "diagram",
      target_id: "diagram-lever-filler",
      source_item_id: "source-penhero-home",
      note: "General classic-filling-system reference index for educational redrawing.",
    },
    {
      id: "cite-diagram-cartridge-converter-reference",
      target_type: "diagram",
      target_id: "diagram-cartridge-converter",
      source_item_id: "source-richardspens-reference",
      note: "General converter/cartridge reference index for educational redrawing.",
    },
    {
      id: "cite-diagram-nib-feed-reference",
      target_type: "diagram",
      target_id: "diagram-nib-feed",
      source_item_id: "source-richardspens-reference",
      note: "General nib/feed terminology reference index for educational redrawing.",
    },
  ];

  for (const citation of diagramCitations) {
    await upsertCitation(db, citation);
  }

  if (pilot823) {
    await execute(
      db,
      "UPDATE diagrams SET entity_id = ?, updated_at = datetime('now') WHERE slug = 'vacuum-filler-mechanism'",
      [pilot823.id],
    );
  }
  if (lamy2000) {
    await execute(
      db,
      "UPDATE diagrams SET entity_id = ?, updated_at = datetime('now') WHERE slug = 'piston-filler-mechanism'",
      [lamy2000.id],
    );
  }

  if (pilot823) {
    await upsertMediaAsset(db, {
      id: "media-candidate-commons-pilot-custom-823",
      entity_id: pilot823.id,
      title: "Pilot Custom 823 Wikimedia Commons image candidates",
      asset_type: "external_link",
      source_url:
        "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=Pilot%20Custom%20823",
      source_item_id: "source-commons-pilot-custom-823-search",
      author: null,
      license: "varies_per_file",
      attribution_text:
        "Do not display until a specific Commons file, author, license, and attribution are reviewed.",
      review_status: "needs_license",
      usage_status: "candidate",
    });
  }

  if (lamy2000) {
    await upsertMediaAsset(db, {
      id: "media-candidate-commons-lamy-2000",
      entity_id: lamy2000.id,
      title: "LAMY 2000 Wikimedia Commons image candidates",
      asset_type: "external_link",
      source_url:
        "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=LAMY%202000%20fountain%20pen",
      source_item_id: "source-commons-lamy-2000-search",
      author: null,
      license: "varies_per_file",
      attribution_text:
        "Do not display until a specific Commons file, author, license, and attribution are reviewed.",
      review_status: "needs_license",
      usage_status: "candidate",
    });
  }

  if (pilot823) {
    await upsertCommunitySummary(db, {
      id: "community-reddit-pilot-custom-823",
      entity_id: pilot823.id,
      source_id: "reddit-fountainpens",
      status: "draft",
      metadata_json: JSON.stringify({
        source_policy: "metadata_only",
        body_storage: "not_stored",
        topics: "large ink capacity, daily writer, cleaning difficulty",
      }),
      summary_md:
        "社区讨论中，Custom 823 常被放在“只留一支日用金笔”的语境里：大容量真空上墨、稳定笔尖和长时间书写是主要优点。\n\n需要谨慎处理的是清洗维护、锁墨阀使用习惯、地区配色和价格波动。这些属于玩家体验信号，不直接等同于可发布事实。",
    });
  }

  if (lamy2000) {
    await upsertCommunitySummary(db, {
      id: "community-reddit-lamy-2000",
      entity_id: lamy2000.id,
      source_id: "reddit-fountainpens",
      status: "draft",
      metadata_json: JSON.stringify({
        source_policy: "metadata_only",
        body_storage: "not_stored",
        topics: "design classic, nib sweet spot, material texture",
      }),
      summary_md:
        "LAMY 2000 的社区口碑通常围绕三个点展开：现代主义外观、Makrolon 材料触感，以及半包尖的书写角度适应问题。\n\n这里的摘要只记录趋势。关于年份、材料、笔尖规格和版本变化，仍需回到 LAMY 官方资料、目录或可靠独立资料交叉核验。",
    });
  }

  for (const entity of [pilot, lamy, pilot823, lamy2000].filter(
    Boolean,
  ) as EntityRow[]) {
    const references =
      entity.slug === "pilot"
        ? ["source-pilot-history", "source-pilot-custom-series", "source-reddit-fountainpens-home"]
        : entity.slug === "lamy"
          ? ["source-lamy-company", "source-lamy-design", "source-reddit-fountainpens-home"]
          : entity.slug === "pilot-custom-823"
            ? ["source-pilot-custom-series", "source-reddit-fountainpens-home"]
            : ["source-lamy-2000-official", "source-lamy-design", "source-reddit-fountainpens-home"];

    for (const sourceItemId of references) {
      await upsertReference(db, {
        id: `ref-${entity.slug}-${sourceItemId}`,
        entity_id: entity.id,
        source_item_id: sourceItemId,
        relation_type: sourceItemId.includes("reddit") ? "community" : "reference",
        note: sourceItemId.includes("reddit")
          ? "只用于社区趋势与常见问题汇总，不保存评论全文。"
          : "用于馆藏条目的事实核验与延伸阅读。",
        review_status: "approved",
      });
    }
  }

  const exhibits = [
    {
      id: "exhibit-japanese-big-three",
      slug: "japanese-big-three",
      title: "日系三金：日用旗舰与笔尖性格",
      summary: "从 Pilot、Platinum、Sailor 的代表型号进入日本现代钢笔谱系。",
      status: "draft",
      hero_diagram_id: "diagram-nib-feed",
      sections: [
        {
          title: "先从书写感而不是品牌神话进入",
          body_md:
            "这个展览不急着给品牌排座次，而是把日系钢笔拆成笔尖反馈、上墨系统、透明示范杆、漆艺和日常书写几条路径。Pilot Custom 823 可先作为“大容量日用旗舰”样本。",
          related: ["brand/pilot", "pen/pilot-custom-823"],
          diagrams: ["vacuum-filler-mechanism", "nib-feed-anatomy"],
          sources: ["source-pilot-history", "source-pilot-custom-series"],
        },
      ],
    },
    {
      id: "exhibit-lamy-2000-modernism",
      slug: "lamy-2000-modernism",
      title: "LAMY 2000：现代主义如何落到手里",
      summary: "围绕 1966、材料、半包尖和品牌设计语言梳理 LAMY 2000。",
      status: "draft",
      hero_diagram_id: "diagram-piston-filler",
      sections: [
        {
          title: "不是装饰少，而是信息少",
          body_md:
            "LAMY 2000 的展览重点应放在材料、比例和结构如何共同降低视觉噪音。活塞上墨、半包尖和外露极少的接缝，都是这个故事的一部分。",
          related: ["brand/lamy", "pen/凌美-lamy-lamy-2000"],
          diagrams: ["piston-filler-mechanism", "nib-feed-anatomy"],
          sources: ["source-lamy-design", "source-lamy-2000-official"],
        },
      ],
    },
    {
      id: "exhibit-filling-system-history",
      slug: "filling-system-history",
      title: "上墨系统小史：从墨囊到活塞与真空",
      summary: "用机制图把杠杆、活塞、真空和墨胆/转换器串起来。",
      status: "draft",
      hero_diagram_id: "diagram-piston-filler",
      sections: [
        {
          title: "结构先行，型号随后",
          body_md:
            "上墨系统展览适合作为新用户的入口：先理解每种结构如何储墨、如何维护，再回到具体型号选择。这里的图示先用通用结构图，后续再补品牌专属工程细节。",
          related: ["concept/piston-filler", "pen/pilot-custom-823"],
          diagrams: [
            "lever-filler-mechanism",
            "piston-filler-mechanism",
            "vacuum-filler-mechanism",
            "cartridge-converter-map",
          ],
          sources: ["source-richardspens-reference", "source-penhero-home"],
        },
      ],
    },
    {
      id: "exhibit-parker-51-myth",
      slug: "parker-51-myth",
      title: "Parker 51：经典、复刻与神话",
      summary: "预留展览：后续补充 Parker 51 的年代、版本、材质和复刻争议。",
      status: "draft",
      hero_diagram_id: null,
      sections: [
        {
          title: "先建立问题清单",
          body_md:
            "这个展览需要先拆分 vintage 与复刻两个对象，避免把不同年代、结构和市场口碑混在一个词条里。",
          related: ["brand/parker"],
          diagrams: ["nib-feed-anatomy"],
          sources: ["source-penhero-home", "source-reddit-fountainpens-home"],
        },
      ],
    },
    {
      id: "exhibit-pelikan-piston-filler",
      slug: "pelikan-piston-filler",
      title: "Pelikan 与活塞上墨传统",
      summary: "预留展览：从活塞机制、Souveran 系列和尺寸体系进入 Pelikan。",
      status: "draft",
      hero_diagram_id: "diagram-piston-filler",
      sections: [
        {
          title: "机制图先把门打开",
          body_md:
            "Pelikan 展览后续应把 M200/M400/M600/M800/M1000 的尺寸、笔尖和定位做成可比较的系列树。",
          related: ["brand/pelikan"],
          diagrams: ["piston-filler-mechanism"],
          sources: ["source-richardspens-reference", "source-penhero-home"],
        },
      ],
    },
    {
      id: "exhibit-chinese-fountain-pen-memory",
      slug: "chinese-fountain-pen-memory",
      title: "中国钢笔记忆：英雄、永生与日常书写",
      summary: "预留展览：用品牌、型号、广告和用户记忆梳理国产钢笔谱系。",
      status: "draft",
      hero_diagram_id: null,
      sections: [
        {
          title: "先处理同名与重复",
          body_md:
            "国产品牌展览要特别注意同名、英文转写、复刻型号和不同厂系之间的重复。先建立别名表，再扩写故事。",
          related: ["brand/wingsung"],
          diagrams: ["cartridge-converter-map", "nib-feed-anatomy"],
          sources: ["source-reddit-fountainpens-home"],
        },
      ],
    },
  ];

  for (const exhibit of exhibits) {
    await upsertExhibit(db, exhibit);
    for (const [index, section] of exhibit.sections.entries()) {
      await upsertExhibitSection(db, {
        id: `${exhibit.id}-section-${index + 1}`,
        exhibit_id: exhibit.id,
        position: index + 1,
        title: section.title,
        body_md: section.body_md,
        related_entity_slugs_json: JSON.stringify(section.related),
        diagram_slugs_json: JSON.stringify(section.diagrams),
        source_item_ids_json: JSON.stringify(section.sources),
      });
    }
  }

  const counts = await db.execute(`
    SELECT 'stories' as name, COUNT(*) as count FROM stories
    UNION ALL SELECT 'claims', COUNT(*) FROM claims
    UNION ALL SELECT 'citations', COUNT(*) FROM citations
    UNION ALL SELECT 'timeline_events', COUNT(*) FROM timeline_events
    UNION ALL SELECT 'diagrams', COUNT(*) FROM diagrams
    UNION ALL SELECT 'media_assets', COUNT(*) FROM media_assets
    UNION ALL SELECT 'community_summaries', COUNT(*) FROM community_summaries
    UNION ALL SELECT 'exhibits', COUNT(*) FROM exhibits
    UNION ALL SELECT 'source_items', COUNT(*) FROM source_items
  `);
  console.log("Library sample seed complete:");
  for (const row of counts.rows) {
    console.log(`  ${row.name}: ${row.count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
