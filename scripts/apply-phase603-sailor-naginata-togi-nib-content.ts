import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, type Transaction, createClient } from "@libsql/client";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import { upsertSources } from "./apply-phase22-content";
import type { CuratedSource } from "./lib/curated-content-pack";

export const PHASE603_NIB_ID = "sDaEy32aebxE";
export const PHASE603_NIB_SLUG = "sailor-naginata-togi";
export const PHASE603_PEN_ID = "s39NAG7121";
const MARKDOWN = ".planning/content-research/sailor-naginata-togi-nib-phase603.md";
const SVG = "/images/library/site-original/phase603/sailor/naginata-togi.svg";
const RETRIEVED = "2026-08-12";
const ALIASES = [
  ["Sailor Naginata-Togi", "en"],
  ["Naginata Togi", "en"],
  ["長刀研ぎ", "ja"],
  ["长刀研", "zh"],
] as const;

const SOURCES: CuratedSource[] = [
  {
    key: "phase603-sailor-interview",
    registryKey: "official-sailor-jp",
    registryName: "Sailor Pen Japan",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "唯一無二のペン先「長刀研ぎ」とは",
    url: "https://sailor.co.jp/topics/interview_naginatatogi/",
    homepageUrl: "https://sailor.co.jp/",
    author: "Sailor Pen",
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary:
      "Official craft interview defines Naginata-Togi as a Special Nib, explains high/low angle line-width behavior, 1.5 mm tipping workflow, heritage interruption and the circa-1991 modern revival.",
    allowedUse: "summary_only",
    license: "all-rights-reserved",
    archiveUrl: "https://sailor.co.jp/topics/interview_naginatatogi/",
    archiveLocator: "長刀研ぎについて; ペン先職人の紹介",
  },
  {
    key: "phase603-sailor-107121",
    registryKey: "official-sailor-jp",
    registryName: "Sailor Pen Japan",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "長刀研ぎ 万年筆 10-7121",
    url: "https://sailor.co.jp/product/10-7121/",
    homepageUrl: "https://sailor.co.jp/",
    author: "Sailor Pen",
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary:
      "Official exact pen page lists F/MF/M/B item codes, 21K large nib, C/C system, PMMA body, size and weight; used only to separate the nib identity from the complete pen SKU.",
    allowedUse: "summary_only",
    license: "all-rights-reserved",
    archiveUrl: "https://sailor.co.jp/product/10-7121/",
    archiveLocator: "製品コード; ペン先; 方式; 本体仕様; 本体サイズ",
  },
  {
    key: "phase603-sailor-bespoke",
    registryKey: "official-sailor-jp",
    registryName: "Sailor Pen Japan",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "sailor-official",
    title: "SAILOR Bespoke 2021 announcement",
    url: "https://sailor.co.jp/news/20211208-02/",
    homepageUrl: "https://sailor.co.jp/",
    author: "Sailor Pen",
    publishedAt: "2021-12-08",
    retrievedAt: RETRIEVED,
    summary:
      "Official Bespoke announcement offered Naginata-Togi MF/M as a selectable nib on configurable pen bodies, proving the nib is not identical to one complete pen model.",
    allowedUse: "summary_only",
    license: "all-rights-reserved",
    archiveUrl: "https://sailor.co.jp/news/20211208-02/",
    archiveLocator: "長刀研ぎ; プロフェッショナルギア",
  },
  {
    key: "phase603-penaddict",
    registryKey: "pen-addict",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penaddict",
    title: "When One Nib is not Enough",
    url: "https://www.penaddict.com/blog/2021/6/21/when-one-nib-is-not-enough",
    homepageUrl: "https://www.penaddict.com/",
    author: "Andrew Coon / The Pen Addict",
    publishedAt: "2021-06-21",
    retrievedAt: RETRIEVED,
    summary:
      "Professional pen publication treats Naginata-Togi as the foundational angle-responsive nib grind in Sailor's broader specialty-nib history.",
    allowedUse: "summary_only",
    license: "all-rights-reserved",
    archiveUrl: "https://www.penaddict.com/blog/2021/6/21/when-one-nib-is-not-enough",
    archiveLocator: "Naginata-togi nib grind; Sailor Specialty line",
  },
  {
    key: "phase603-goulet",
    registryKey: "goulet-pens",
    registryName: "The Goulet Pen Company",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "goulet",
    title: "Sailor 1911L Naginata Togi product and writing guide",
    url: "https://www.gouletpens.com/products/sailor-1911l-fountain-pen-black-silver-naginata-togi",
    homepageUrl: "https://www.gouletpens.com/",
    author: "The Goulet Pen Company",
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary:
      "Retailer specimen context describes angle-based line variation and distinguishes Naginata-Togi nib behavior from the 1911L body specifications.",
    allowedUse: "summary_only",
    license: "all-rights-reserved",
    archiveUrl:
      "https://www.gouletpens.com/products/sailor-1911l-fountain-pen-black-silver-naginata-togi",
    archiveLocator: "Details; Nib Size; writing angle description",
  },
  {
    key: "phase603-svg",
    registryKey: "fpkg-site-original",
    registryName: "Fountain Pen Graph site-original",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fpkg-editorial",
    title: "Naginata-Togi angle and identity factual diagram",
    url: SVG,
    homepageUrl: SVG,
    author: "Fountain Pen Graph editorial",
    publishedAt: RETRIEVED,
    retrievedAt: RETRIEVED,
    summary:
      "Original factual SVG distinguishes higher-angle thinner and lower-angle broader lines and states that the nib identity is not a complete pen model.",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: SVG,
    archiveLocator: "local 1600x900 SVG",
  },
];

export interface ApplyPhase603Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase603Result {
  entityId: string;
  outcome: "published" | "noop";
  contentHash: string;
}

function id(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 603 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(client: Client, options: ApplyPhase603Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const relative = path.relative(root, database);
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    relative === "" ||
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    database === protectedPath ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 603 requires an owned non-alias catalog copy.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 603 client is not bound to the owned copy.");
  }
}

function reviewedCopy(workspaceRoot: string) {
  const markdown = fs
    .readFileSync(path.join(workspaceRoot, MARKDOWN), "utf8")
    .replace(/\r\n?/g, "\n");
  const summary = markdown.match(/^## summary\s*\n+([\s\S]*?)(?=^## body_md)/m)?.[1]?.trim();
  const body = markdown.match(/^## body_md\s*\n+([\s\S]*?)(?=^## 来源\s*$)/m)?.[1]?.trim();
  if (
    !summary ||
    !body ||
    Array.from(summary).length < 60 ||
    Array.from(summary).length > 180 ||
    Array.from(body).length < 1800
  ) {
    throw new Error("Phase 603 reviewed copy is incomplete.");
  }
  const svgPath = path.join(workspaceRoot, "public", SVG.slice(1));
  const svg = fs.readFileSync(svgPath, "utf8");
  if (
    !svg.includes('width="1600"') ||
    !svg.includes('height="900"') ||
    !svg.includes("<title") ||
    !svg.includes("<desc") ||
    !svg.includes("not a product photo")
  ) {
    throw new Error("Phase 603 factual SVG contract failed.");
  }
  const marker = `curated-content:phase603-sailor-naginata-togi-v1:${createHash("sha256")
    .update(JSON.stringify({ summary, body, sources: SOURCES.map((source) => source.url) }))
    .digest("hex")}`;
  return { summary, body, marker };
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function preflight(client: Client): Promise<void> {
  const entity = (await rows(client, "SELECT type,slug,name FROM entities WHERE id=?", [PHASE603_NIB_ID]))[0];
  const publication = (
    await rows(client, "SELECT status,blockers_json FROM entity_publications WHERE entity_id=?", [
      PHASE603_NIB_ID,
    ])
  )[0];
  const pen = (
    await rows(client, "SELECT type,slug FROM entities WHERE id=?", [PHASE603_PEN_ID])
  )[0];
  if (
    entity?.type !== "nib" ||
    entity.slug !== PHASE603_NIB_SLUG ||
    entity.name !== "写乐 Sailor Naginata-Togi（长刀研）" ||
    pen?.type !== "pen" ||
    pen.slug !== "sailor-naginata-togi-10-7121"
  ) {
    throw new Error("Phase 603 canonical nib or pen identity mismatch.");
  }
  const entityCollision = await rows(
    client,
    "SELECT id FROM entities WHERE id<>? AND (slug=? OR name=?)",
    [PHASE603_NIB_ID, PHASE603_NIB_SLUG, "写乐 Sailor Naginata-Togi（长刀研）"],
  );
  if (entityCollision.length > 0) {
    throw new Error("Phase 603 found a conflicting nib slug or canonical name.");
  }
  const aliasCollision = await rows(
    client,
    `SELECT entity_id,alias FROM entity_aliases WHERE entity_id<>?
      AND lower(trim(alias)) IN (${ALIASES.map(() => "?").join(",")})`,
    [PHASE603_NIB_ID, ...ALIASES.map(([alias]) => alias.toLowerCase())],
  );
  if (aliasCollision.length > 0) {
    throw new Error("Phase 603 found a conflicting Naginata-Togi alias.");
  }
  if (
    publication?.status !== "retired" &&
    publication?.status !== "published" &&
    publication?.status !== "draft"
  ) {
    throw new Error("Phase 603 unexpected nib publication state.");
  }
}

async function writeContent(
  tx: Transaction,
  copy: ReturnType<typeof reviewedCopy>,
  sourceItems: Map<string, string>,
): Promise<void> {
  await tx.execute({
    sql: "UPDATE entities SET summary=?,body_md=?,source=?,source_url=?,updated_at=datetime('now') WHERE id=? AND type='nib' AND slug=?",
    args: [
      copy.summary,
      copy.body,
      copy.marker,
      SOURCES[0]?.url ?? null,
      PHASE603_NIB_ID,
      PHASE603_NIB_SLUG,
    ],
  });
  await tx.execute({
    sql: "DELETE FROM entity_references WHERE entity_id=? AND id LIKE 'phase603-%'",
    args: [PHASE603_NIB_ID],
  });
  for (const source of SOURCES.filter((item) => item.sourceType !== "user_submission")) {
    const sourceItemId = sourceItems.get(source.key);
    if (!sourceItemId) throw new Error(`Phase 603 source mapping missing: ${source.key}`);
    await tx.execute({
      sql: `INSERT INTO entity_references
        (id,entity_id,source_item_id,relation_type,note,review_status)
        VALUES (?,?,?,?,?,'approved')`,
      args: [
        id("phase603-reference", source.key),
        PHASE603_NIB_ID,
        sourceItemId,
        source.tier === "professional_secondary" ? "reference" : "review",
        source.summary,
      ],
    });
  }
  await tx.execute({
    sql: "DELETE FROM media_assets WHERE entity_id=? AND id LIKE 'phase603-%'",
    args: [PHASE603_NIB_ID],
  });
  const svgItem = sourceItems.get("phase603-svg");
  if (!svgItem) throw new Error("Phase 603 SVG source mapping missing.");
  await tx.execute({
    sql: `INSERT INTO media_assets
      (id,entity_id,title,asset_type,local_path,author,license,attribution_text,
       source_url,source_item_id,review_status,usage_status)
      VALUES (?,?,?,'diagram',?,'Fountain Pen Graph editorial','site-original',?,?,?,'approved','primary')`,
    args: [
      id("phase603-media", PHASE603_NIB_ID),
      PHASE603_NIB_ID,
      "Sailor Naginata-Togi 角度与身份事实图（非产品照片）",
      SVG,
      "本站原创 factual SVG；非产品照片，不表示真实尖形、比例、刻字、镀层或具体笔身。",
      SVG,
      svgItem,
    ],
  });
  await tx.execute({
    sql: "DELETE FROM entity_aliases WHERE entity_id=? AND id LIKE 'phase603-%'",
    args: [PHASE603_NIB_ID],
  });
  const officialItem = sourceItems.get("phase603-sailor-interview");
  if (!officialItem) throw new Error("Phase 603 official source mapping missing.");
  for (const [alias, language] of ALIASES) {
    await tx.execute({
      sql: `INSERT INTO entity_aliases
        (id,entity_id,alias,language,alias_kind,source_item_id,review_status)
        VALUES (?,?,?,?,'alias',?,'approved')`,
      args: [id("phase603-alias", alias), PHASE603_NIB_ID, alias, language, officialItem],
    });
  }
  await tx.execute({
    sql: `INSERT INTO entity_links (id,source_id,target_id,link_type,reason)
      VALUES (?,?,?,'related_to',?)
      ON CONFLICT(id) DO UPDATE SET reason=excluded.reason`,
    args: [
      id("phase603-link", `${PHASE603_NIB_ID}:${PHASE603_PEN_ID}`),
      PHASE603_NIB_ID,
      PHASE603_PEN_ID,
      "10-7121 is one complete Sailor pen equipped with Naginata-Togi; nib and pen identities remain separate.",
    ],
  });
}

export async function applyPhase603SailorNaginataTogiNibContent(
  client: Client,
  options: ApplyPhase603Options,
): Promise<ApplyPhase603Result> {
  await assertAuthority(client, options);
  await preflight(client);
  const copy = reviewedCopy(fs.realpathSync.native(options.workspaceRoot));
  const current = (
    await rows(client, "SELECT source FROM entities WHERE id=?", [PHASE603_NIB_ID])
  )[0];
  const currentPublication = (
    await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [
      PHASE603_NIB_ID,
    ])
  )[0];
  if (current?.source === copy.marker && currentPublication?.status === "published") {
    const contentHash = await computePublicationContentHash(client, PHASE603_NIB_ID);
    if (currentPublication.approved_content_hash === contentHash) {
      return { entityId: PHASE603_NIB_ID, outcome: "noop", contentHash };
    }
  }

  const tx = await client.transaction("write");
  try {
    const sourceItems = await upsertSources(tx, SOURCES);
    await writeContent(tx, copy, sourceItems);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE603_NIB_ID,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: `${copy.marker}; Phase 603 sourced nib identity and media review.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: PHASE603_NIB_ID,
    reviewer: options.reviewer,
  });
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entityId: PHASE603_NIB_ID,
    outcome: "published",
    contentHash: published.contentHash,
  };
}

function value(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error("Phase 603 requires --database, --owned-root and --protected-catalog.");
  }
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase603SailorNaginataTogiNibContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase603-sailor-naginata-togi",
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: snapshotCatalogFiles(protectedCatalog),
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
