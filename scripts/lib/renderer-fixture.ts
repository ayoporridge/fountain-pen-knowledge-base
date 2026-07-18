import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { migrateDatabase, resolveDatabaseConnection } from "../../src/lib/db";
import {
  publishEntity,
  recordEntityContentReview,
} from "../../src/lib/publication";

const ROOT = process.cwd();
const PROTECTED_CATALOG_PATH = path.join(ROOT, "data", "fpkg.db");
const TEMP_PREFIX = "fpkg-renderer-";
const FIXTURE_ENV_KEYS = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "FPKG_DATABASE_URL",
  "PUBLICATION_GATE_FIXTURE",
  "RENDERER_FIXTURE",
  "E2E_BASE_URL",
] as const;

type FixtureEnvKey = (typeof FIXTURE_ENV_KEYS)[number];

export interface RendererFixture {
  readonly tempRoot: string;
  readonly databasePath: string;
  readonly databaseUrl: string;
  readonly client: Client;
  readonly env: NodeJS.ProcessEnv;
}

export interface RendererFixtureSeed {
  readonly brandId: string;
  readonly brandSlug: string;
  readonly modelId: string;
  readonly modelSlug: string;
  readonly modelSlugs: readonly string[];
  readonly nonPublicSlug: string;
  readonly missingStorySlug: string;
  readonly duplicateStorySlug: string;
  readonly shortSummarySlug: string;
  readonly noBrandSlug: string;
  readonly duplicateBrandSlug: string;
  readonly secondBrandSlug: string;
  readonly topicSentinels: readonly string[];
  readonly forbiddenSentinels: readonly string[];
}

type ManagedRendererFixture = RendererFixture & {
  readonly previousEnvironment: Record<FixtureEnvKey, string | undefined>;
  cleaned: boolean;
};

type SeedEntityOptions = {
  id: string;
  type: "brand" | "pen";
  slug: string;
  name: string;
  summary: string;
  storyCount?: 0 | 1 | 2;
  storyBody?: string;
  madeByBrandIds?: readonly string[];
  complete?: boolean;
};

const knownFixtures = new WeakSet<ManagedRendererFixture>();
const ownedRoots = new Set<string>();

const QUALIFIED_PRIMARY_ITEM = "renderer-source-item-primary";
const QUALIFIED_SECONDARY_ITEM = "renderer-source-item-secondary";
const UNQUALIFIED_ITEM = "renderer-source-item-unqualified";

const BRAND_SUMMARY =
  "这是一个只用于 Renderer 合同测试的完整品牌摘要，覆盖历史脉络、产品谱系与资料边界，并以独立来源和明确归属验证公开页面只读取当前发布快照。";
const MODEL_SUMMARY =
  "这是一个只用于 Renderer 合同测试的完整型号摘要，概括产品定位、结构设计、书写体验与购买检查，并以字段证据和来源定位验证页面不会回退到旧正文。";

const TOPIC_SENTINELS = [
  "型号身份与产品线哨兵：Renderer One 属于测试品牌的核心产品线。",
  "历史沿革哨兵：该型号的演进节点由独立档案逐项记录。",
  "设计尺寸材质人体工学哨兵：尺寸、材质与握持重心均在本段完整说明。",
  "笔尖哨兵：十四金中尖的结构与调校边界在这里单独说明。",
  "署名书写体验哨兵：测试作者记录了纸面反馈与出墨节奏。",
  "上墨维护哨兵：活塞上墨、清洗周期与日常维护步骤保持完整。",
  "版本边界哨兵：地区版本、年份差异与适用范围不得混写。",
  "购买检查哨兵：购买前应核对笔尖、活塞、裂纹与来源凭据。",
] as const;

const FORBIDDEN_SENTINELS = [
  "LEGACY_BODY_SENTINEL_RENDERER",
  "DEPRECATED_STORY_SENTINEL_RENDERER",
  "WRONG_TYPE_STORY_SENTINEL_RENDERER",
  "UNQUALIFIED_SPEC_SENTINEL_RENDERER",
  "UNQUALIFIED_VARIANT_SENTINEL_RENDERER",
  "UNQUALIFIED_SOURCE_SENTINEL_RENDERER",
  "UNQUALIFIED_TIMELINE_SENTINEL_RENDERER",
  "GALLERY_MEDIA_SENTINEL_RENDERER",
  "REMOTE_MEDIA_SENTINEL_RENDERER",
  "MISSING_ATTRIBUTION_MEDIA_SENTINEL_RENDERER",
] as const;

function canonicalizePotentialPath(inputPath: string): string {
  let ancestor = path.resolve(inputPath);
  const missing: string[] = [];
  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    missing.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  const canonicalAncestor = fs.existsSync(ancestor)
    ? fs.realpathSync.native(ancestor)
    : ancestor;
  return path.join(canonicalAncestor, ...missing);
}

function fileUrlPath(databaseUrl: string): string | null {
  if (!databaseUrl.startsWith("file:") || /[?#]/.test(databaseUrl)) return null;
  const rawPath = databaseUrl.startsWith("file://")
    ? fileURLToPath(databaseUrl)
    : decodeURIComponent(databaseUrl.slice("file:".length));
  return rawPath ? canonicalizePotentialPath(rawPath) : null;
}

function isExternalBaseUrl(value: string | undefined): boolean {
  const candidate = value?.trim();
  if (!candidate) return false;
  try {
    const hostname = new URL(candidate).hostname;
    return hostname !== "127.0.0.1" && hostname !== "localhost" && hostname !== "::1";
  } catch {
    return true;
  }
}

export function assertRendererFixtureEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (env.RENDERER_FIXTURE !== "1") {
    throw new Error("Renderer fixture requires RENDERER_FIXTURE=1.");
  }
  if (env.TURSO_DATABASE_URL?.trim() || env.TURSO_AUTH_TOKEN?.trim()) {
    throw new Error("Renderer fixture forbids remote database credentials.");
  }
  if (isExternalBaseUrl(env.E2E_BASE_URL)) {
    throw new Error("Renderer fixture forbids an external E2E_BASE_URL.");
  }
  const configuredPath = env.FPKG_DATABASE_URL?.trim()
    ? fileUrlPath(env.FPKG_DATABASE_URL.trim())
    : null;
  if (
    configuredPath &&
    configuredPath === canonicalizePotentialPath(PROTECTED_CATALOG_PATH)
  ) {
    throw new Error("Renderer fixture forbids the protected data/fpkg.db catalog.");
  }
}

function snapshotEnvironment(): Record<FixtureEnvKey, string | undefined> {
  return Object.fromEntries(
    FIXTURE_ENV_KEYS.map((key) => [key, process.env[key]]),
  ) as Record<FixtureEnvKey, string | undefined>;
}

function applyEnvironment(env: NodeJS.ProcessEnv): void {
  for (const key of FIXTURE_ENV_KEYS) {
    const value = env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function restoreEnvironment(
  previous: Record<FixtureEnvKey, string | undefined>,
): void {
  for (const key of FIXTURE_ENV_KEYS) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

export async function createRendererFixture(
  inputEnv: NodeJS.ProcessEnv = process.env,
): Promise<RendererFixture> {
  assertRendererFixtureEnvironment(inputEnv);

  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), TEMP_PREFIX)),
  );
  ownedRoots.add(tempRoot);
  const databasePath = path.join(tempRoot, "renderer.db");
  const databaseUrl = `file:${databasePath}`;
  const env: NodeJS.ProcessEnv = {
    ...inputEnv,
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: databaseUrl,
    PUBLICATION_GATE_FIXTURE: "1",
    RENDERER_FIXTURE: "1",
    E2E_BASE_URL: "",
  };
  const previousEnvironment = snapshotEnvironment();
  applyEnvironment(env);

  let client: Client | undefined;
  try {
    const connection = resolveDatabaseConnection(env);
    if (connection.localPath !== canonicalizePotentialPath(databasePath)) {
      throw new Error("Renderer fixture database escaped its owned root.");
    }
    client = createClient({ url: databaseUrl });
    await migrateDatabase(client);
    const fixture: ManagedRendererFixture = {
      tempRoot,
      databasePath,
      databaseUrl,
      client,
      env,
      previousEnvironment,
      cleaned: false,
    };
    knownFixtures.add(fixture);
    return fixture;
  } catch (error) {
    client?.close();
    restoreEnvironment(previousEnvironment);
    if (ownedRoots.delete(tempRoot)) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
    throw error;
  }
}

async function insertSharedSources(client: Client): Promise<void> {
  for (const registry of [
    ["renderer-registry-primary", "Renderer primary registry", "official"],
    ["renderer-registry-secondary", "Renderer secondary registry", "book"],
    ["renderer-registry-unqualified", "Renderer unqualified registry", "blog"],
  ] as const) {
    await client.execute({
      sql: `INSERT INTO source_registry (
        id, name, source_type, allowed_use, reliability, license, attribution,
        homepage_url, fetch_method, last_checked_at
      ) VALUES (?, ?, ?, 'summary_only', 'medium', 'CC0', ?, ?, 'manual', '2026-07-18')`,
      args: [registry[0], registry[1], registry[2], registry[1], `https://renderer.invalid/${registry[0]}`],
    });
  }

  const items = [
    {
      id: QUALIFIED_PRIMARY_ITEM,
      registry: "renderer-registry-primary",
      title: "Renderer 官方档案",
      tier: "primary",
      group: "renderer-origin",
      review: "approved",
    },
    {
      id: QUALIFIED_SECONDARY_ITEM,
      registry: "renderer-registry-secondary",
      title: "Renderer 独立专业资料",
      tier: "professional_secondary",
      group: "renderer-secondary",
      review: "approved",
    },
    {
      id: UNQUALIFIED_ITEM,
      registry: "renderer-registry-unqualified",
      title: FORBIDDEN_SENTINELS[5],
      tier: null,
      group: null,
      review: "pending",
    },
  ] as const;
  for (const item of items) {
    await client.execute({
      sql: `INSERT INTO source_items (
        id, source_id, title, url, item_type, license, author, published_at,
        retrieved_at, summary, raw_metadata_json, allowed_use, review_status,
        source_tier, independence_group, archive_url, archive_locator
      ) VALUES (?, ?, ?, ?, 'web_page', 'CC0', 'Renderer fixture', '2026-01-01',
        ?, 'Renderer source summary', '{}', 'summary_only', ?, ?, ?, ?, ?)`,
      args: [
        item.id,
        item.registry,
        item.title,
        `https://renderer.invalid/items/${item.id}`,
        item.review === "approved" ? "2026-07-18" : null,
        item.review,
        item.tier,
        item.group,
        item.review === "approved" ? `https://archive.invalid/${item.id}` : null,
        item.review === "approved" ? `snapshot:${item.id}` : null,
      ],
    });
  }
}

async function seedEntity(client: Client, options: SeedEntityOptions): Promise<void> {
  const complete = options.complete !== false;
  const prefix = options.id;
  await client.execute({
    sql: `INSERT INTO entities (
      id, type, slug, name, summary, body_md, source, source_url, source_file, imported_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'renderer-fixture', ?, ?, '2026-07-18T00:00:00.000Z')`,
    args: [
      options.id,
      options.type,
      options.slug,
      options.name,
      options.summary,
      options.type === "pen" ? FORBIDDEN_SENTINELS[0] : "Renderer brand legacy body",
      `https://renderer.invalid/entities/${options.slug}`,
      `${options.slug}.md`,
    ],
  });

  const storyCount = options.storyCount ?? 1;
  for (let index = 0; index < storyCount; index += 1) {
    await client.execute({
      sql: `INSERT INTO stories (
        id, entity_id, title, story_type, summary, body_md, status, source_notes
      ) VALUES (?, ?, ?, ?, 'Renderer story summary', ?, 'published', 'Renderer qualified sources')`,
      args: [
        `${prefix}-story-${index + 1}`,
        options.id,
        `${options.name} 完整故事 ${index + 1}`,
        options.type === "brand" ? "brand_story" : "model_story",
        options.storyBody ?? `# ${options.name}\n\nRenderer complete story.`,
      ],
    });
  }
  if (!complete) return;

  const scopeId = `${prefix}-scope`;
  await client.execute({
    sql: `INSERT INTO fact_scopes (
      id, entity_id, scope_key, market, valid_from, production_state,
      nib_scope, material_scope, edition_scope
    ) VALUES (?, ?, 'global-current', 'global', '2026-01-01', 'current',
      'all nibs', 'all materials', 'standard edition')`,
    args: [scopeId, options.id],
  });

  for (const [kind, itemId] of [
    ["primary", QUALIFIED_PRIMARY_ITEM],
    ["secondary", QUALIFIED_SECONDARY_ITEM],
  ] as const) {
    const claimId = `${prefix}-claim-${kind}`;
    const citationId = `${prefix}-citation-${kind}`;
    await client.execute({
      sql: `INSERT INTO claims (
        id, subject_entity_id, predicate, object_text, source_item_id,
        evidence_locator, confidence, review_status, fact_class
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 'approved', 'core')`,
      args: [claimId, options.id, `${kind}_fact`, `${options.name} ${kind} fact`, itemId, `claim:${kind}`],
    });
    await client.execute({
      sql: `INSERT INTO citations (
        id, target_type, target_id, source_item_id, claim_id, note,
        review_status, evidence_locator, scope_id
      ) VALUES (?, 'claim', ?, ?, ?, 'Renderer citation', 'approved', ?, ?)`,
      args: [citationId, claimId, itemId, claimId, `citation:${kind}`, scopeId],
    });
    await client.execute({
      sql: `INSERT INTO claim_evidence (
        id, claim_id, citation_id, scope_id, evidence_locator, review_status
      ) VALUES (?, ?, ?, ?, ?, 'approved')`,
      args: [`${prefix}-claim-evidence-${kind}`, claimId, citationId, scopeId, `mapping:${kind}`],
    });
  }

  if (options.type === "pen") {
    const specId = `${prefix}-spec`;
    await client.execute({
      sql: `INSERT INTO model_specs (id, entity_id, nib, weight, review_status)
        VALUES (?, ?, '14k medium', ?, 'approved')`,
      args: [specId, options.id, options.id === "renderer-model-01" ? 0 : null],
    });
    for (const fieldKey of options.id === "renderer-model-01" ? ["nib", "weight"] : ["nib"]) {
      const citationId = `${prefix}-spec-citation-${fieldKey}`;
      await client.execute({
        sql: `INSERT INTO citations (
          id, target_type, target_id, source_item_id, note, review_status,
          evidence_locator, scope_id
        ) VALUES (?, 'model_spec', ?, ?, 'Renderer field citation', 'approved', ?, ?)`,
        args: [citationId, specId, QUALIFIED_PRIMARY_ITEM, `spec:${fieldKey}`, scopeId],
      });
      await client.execute({
        sql: `INSERT INTO spec_field_evidence (
          id, model_spec_id, field_key, citation_id, scope_id,
          evidence_locator, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, 'approved')`,
        args: [`${prefix}-spec-evidence-${fieldKey}`, specId, fieldKey, citationId, scopeId, `field:${fieldKey}`],
      });
    }
    for (const [index, brandId] of (options.madeByBrandIds ?? []).entries()) {
      await client.execute({
        sql: `INSERT INTO entity_links (id, source_id, target_id, link_type, reason)
          VALUES (?, ?, ?, 'made_by', 'Renderer canonical maker')`,
        args: [`${prefix}-made-by-${index + 1}`, options.id, brandId],
      });
    }
  }

  await client.execute({
    sql: `INSERT INTO media_assets (
      id, entity_id, title, asset_type, image_url, thumbnail_url, author,
      license, attribution_text, source_url, source_item_id, review_status, usage_status
    ) VALUES (?, ?, ?, 'image', ?, ?, 'Renderer fixture', 'CC0',
      'Renderer fixture · CC0', ?, ?, 'approved', 'primary')`,
    args: [
      `${prefix}-media-primary`,
      options.id,
      `${options.name} primary image`,
      `/renderer/${options.slug}.jpg`,
      `/renderer/${options.slug}-thumb.jpg`,
      `https://renderer.invalid/media/${options.slug}`,
      QUALIFIED_PRIMARY_ITEM,
    ],
  });
}

async function approveAndPublish(client: Client, entityId: string): Promise<void> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId,
      reviewKind,
      reviewer: "renderer-fixture",
      status: "approved",
      notes: "Renderer fixture approval",
    });
  }
  await publishEntity(client, {
    entityId,
    reviewer: "renderer-fixture",
    notes: "Renderer fixture publication",
  });
}

export async function seedRendererFixture(
  fixture: RendererFixture,
): Promise<RendererFixtureSeed> {
  if (!knownFixtures.has(fixture as ManagedRendererFixture)) {
    throw new Error("Renderer seed rejected an unmanaged fixture.");
  }
  const { client } = fixture;
  await insertSharedSources(client);

  const brandId = "renderer-brand";
  const brandSlug = "renderer-brand";
  const modelIds = Array.from({ length: 15 }, (_, index) =>
    `renderer-model-${String(index + 1).padStart(2, "0")}`,
  );
  const modelSlugs = modelIds.map((id) => id);
  const fullStory = TOPIC_SENTINELS.map((topic, index) => `## ${index + 1}. ${topic}\n\n${topic}`).join("\n\n");

  await seedEntity(client, {
    id: brandId,
    type: "brand",
    slug: brandSlug,
    name: "Renderer 测试品牌",
    summary: BRAND_SUMMARY,
    storyBody: "## 品牌历史\n\nRenderer 品牌历史正文。\n\n## 产品谱系\n\nRenderer 产品谱系正文。",
  });
  for (const [index, id] of modelIds.entries()) {
    await seedEntity(client, {
      id,
      type: "pen",
      slug: modelSlugs[index],
      name: `Renderer 型号 ${String(index + 1).padStart(2, "0")}`,
      summary: MODEL_SUMMARY,
      storyBody: index === 0 ? fullStory : `## 型号故事\n\nRenderer 型号 ${index + 1} 完整正文。`,
      madeByBrandIds: [brandId],
    });
  }

  for (const [index, itemId] of [QUALIFIED_PRIMARY_ITEM, QUALIFIED_SECONDARY_ITEM].entries()) {
    await client.execute({
      sql: `INSERT INTO timeline_events (
        id, entity_id, title, event_type, start_date, circa, description,
        source_item_id, review_status
      ) VALUES (?, ?, ?, 'design_milestone', ?, 0, ?, ?, 'approved')`,
      args: [
        `renderer-brand-timeline-${index + 1}`,
        brandId,
        `Renderer 品牌时间线 ${index + 1}`,
        `20${index + 1}0-01-01`,
        `Renderer 品牌时间线描述 ${index + 1}`,
        itemId,
      ],
    });
  }
  await client.execute({
    sql: `INSERT INTO timeline_events (
      id, entity_id, title, event_type, start_date, circa, description,
      source_item_id, review_status
    ) VALUES ('renderer-brand-timeline-unqualified', ?, ?, 'design_milestone',
      '2001-01-01', 0, 'Must remain hidden', ?, 'approved')`,
    args: [brandId, FORBIDDEN_SENTINELS[6], UNQUALIFIED_ITEM],
  });

  const modelId = modelIds[0];
  await client.execute({
    sql: `INSERT INTO stories (
      id, entity_id, title, story_type, summary, body_md, status, source_notes
    ) VALUES ('renderer-model-wrong-type-story', ?, 'Wrong type', 'overview',
      'Wrong type summary', ?, 'published', 'Must remain hidden')`,
    args: [modelId, FORBIDDEN_SENTINELS[2]],
  });
  await client.execute({
    sql: `INSERT INTO model_variants (
      id, model_entity_id, variant_name, release_year, notes, source_item_id, review_status
    ) VALUES ('renderer-model-variant-qualified', ?, 'Renderer 合格版本', '2026',
      '限定全球当前版本', ?, 'approved')`,
    args: [modelId, QUALIFIED_PRIMARY_ITEM],
  });
  await client.execute({
    sql: `INSERT INTO fact_scopes (
      id, entity_id, variant_id, scope_key, market, valid_from, production_state,
      edition_scope
    ) VALUES ('renderer-model-variant-scope', ?, 'renderer-model-variant-qualified',
      'qualified-variant', 'global', '2026-01-01', 'current', 'standard edition')`,
    args: [modelId],
  });
  await client.execute({
    sql: `INSERT INTO model_variants (
      id, model_entity_id, variant_name, release_year, notes, source_item_id, review_status
    ) VALUES ('renderer-model-variant-unqualified', ?, ?, '1900',
      'Must remain hidden', ?, 'approved')`,
    args: [modelId, FORBIDDEN_SENTINELS[4], UNQUALIFIED_ITEM],
  });
  await client.execute({
    sql: `INSERT INTO entity_references (
      id, entity_id, source_item_id, relation_type, note, review_status
    ) VALUES ('renderer-model-reference-unqualified', ?, ?, 'history',
      'Must remain hidden', 'approved')`,
    args: [modelId, UNQUALIFIED_ITEM],
  });

  for (const media of [
    {
      id: "renderer-model-media-gallery",
      title: FORBIDDEN_SENTINELS[7],
      image: "/renderer/gallery.jpg",
      attribution: "Renderer fixture · CC0",
      usage: "gallery",
    },
    {
      id: "renderer-model-media-remote",
      title: FORBIDDEN_SENTINELS[8],
      image: "https://remote.invalid/renderer.jpg",
      attribution: "Renderer fixture · CC0",
      usage: "primary",
    },
    {
      id: "renderer-model-media-no-attribution",
      title: FORBIDDEN_SENTINELS[9],
      image: "/renderer/no-attribution.jpg",
      attribution: null,
      usage: "primary",
    },
  ] as const) {
    await client.execute({
      sql: `INSERT INTO media_assets (
        id, entity_id, title, asset_type, image_url, author, license,
        attribution_text, source_url, source_item_id, review_status, usage_status
      ) VALUES (?, ?, ?, 'image', ?, 'Renderer fixture', 'CC0', ?,
        'https://renderer.invalid/media/negative', ?, 'approved', ?)`,
      args: [media.id, modelId, media.title, media.image, media.attribution, QUALIFIED_PRIMARY_ITEM, media.usage],
    });
  }

  const secondBrandId = "renderer-second-brand";
  const invalidEntities: SeedEntityOptions[] = [
    {
      id: "renderer-missing-story",
      type: "brand",
      slug: "renderer-missing-story",
      name: "Renderer Missing Story",
      summary: BRAND_SUMMARY,
      storyCount: 0,
    },
    {
      id: "renderer-duplicate-story",
      type: "brand",
      slug: "renderer-duplicate-story",
      name: "Renderer Duplicate Story",
      summary: BRAND_SUMMARY,
      storyCount: 2,
    },
    {
      id: "renderer-short-summary",
      type: "brand",
      slug: "renderer-short-summary",
      name: "Renderer Short Summary",
      summary: "过短摘要",
    },
    {
      id: secondBrandId,
      type: "brand",
      slug: "renderer-second-brand",
      name: "Renderer Second Brand",
      summary: BRAND_SUMMARY,
    },
    {
      id: "renderer-no-brand",
      type: "pen",
      slug: "renderer-no-brand",
      name: "Renderer No Brand",
      summary: MODEL_SUMMARY,
      madeByBrandIds: [],
    },
    {
      id: "renderer-duplicate-brand",
      type: "pen",
      slug: "renderer-duplicate-brand",
      name: "Renderer Duplicate Brand",
      summary: MODEL_SUMMARY,
      madeByBrandIds: [brandId, secondBrandId],
    },
    {
      id: "renderer-unqualified-spec",
      type: "pen",
      slug: "renderer-unqualified-spec",
      name: FORBIDDEN_SENTINELS[3],
      summary: MODEL_SUMMARY,
      complete: false,
    },
    {
      id: "renderer-deprecated-story",
      type: "pen",
      slug: "renderer-deprecated-story",
      name: "Renderer Deprecated Story",
      summary: MODEL_SUMMARY,
      complete: false,
      storyCount: 0,
    },
  ];
  for (const invalid of invalidEntities) await seedEntity(client, invalid);
  await client.execute({
    sql: `INSERT INTO stories (
      id, entity_id, title, story_type, summary, body_md, status, source_notes
    ) VALUES ('renderer-deprecated-story-sentinel', 'renderer-deprecated-story',
      'Deprecated sentinel', 'model_story', 'Deprecated summary', ?, 'deprecated',
      'Must remain hidden')`,
    args: [FORBIDDEN_SENTINELS[1]],
  });

  await approveAndPublish(client, brandId);
  for (const id of modelIds) await approveAndPublish(client, id);

  return {
    brandId,
    brandSlug,
    modelId,
    modelSlug: modelSlugs[0],
    modelSlugs,
    nonPublicSlug: "renderer-unqualified-spec",
    missingStorySlug: "renderer-missing-story",
    duplicateStorySlug: "renderer-duplicate-story",
    shortSummarySlug: "renderer-short-summary",
    noBrandSlug: "renderer-no-brand",
    duplicateBrandSlug: "renderer-duplicate-brand",
    secondBrandSlug: "renderer-second-brand",
    topicSentinels: TOPIC_SENTINELS,
    forbiddenSentinels: FORBIDDEN_SENTINELS,
  };
}

export async function cleanupRendererFixture(
  fixture: RendererFixture,
): Promise<void> {
  if (!knownFixtures.has(fixture as ManagedRendererFixture)) {
    throw new Error("Renderer cleanup rejected an unmanaged fixture.");
  }
  const managed = fixture as ManagedRendererFixture;
  if (managed.cleaned) return;
  if (!ownedRoots.has(managed.tempRoot)) {
    throw new Error("Renderer cleanup refused a non-owned temp root.");
  }
  managed.client.close();
  fs.rmSync(managed.tempRoot, { recursive: true, force: true });
  ownedRoots.delete(managed.tempRoot);
  managed.cleaned = true;
  restoreEnvironment(managed.previousEnvironment);
}
