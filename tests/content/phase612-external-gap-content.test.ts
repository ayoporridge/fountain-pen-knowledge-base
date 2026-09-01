import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { type Client, createClient } from "@libsql/client";
import { validatePack } from "../../scripts/apply-phase22-content";
import {
  type ApplyPhase612Options,
  applyPhase612ExternalGapBatch,
  PHASE612_BATCH_KEYS,
  type Phase612BatchKey,
} from "../../scripts/apply-phase612-external-gap-content";
import {
  phase612BatchAGroups,
  phase612BatchAPacks,
} from "../../scripts/data/phase612-external-gap-batch-a";
import {
  phase612BatchBGroups,
  phase612BatchBPacks,
} from "../../scripts/data/phase612-external-gap-batch-b";
import {
  phase612BatchCGroups,
  phase612BatchCPacks,
} from "../../scripts/data/phase612-external-gap-batch-c";
import {
  type CuratedEntityPack,
  loadCuratedEntityPack,
} from "../../scripts/lib/curated-content-pack";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

type Phase612Group = {
  brand: CuratedEntityPack;
  pens: CuratedEntityPack[];
};

type Phase612BatchDefinition = {
  groups: Phase612Group[];
  packs: CuratedEntityPack[];
};

type OwnedCopy = {
  ownedRoot: string;
  databasePath: string;
};

const ROOT = process.cwd();
const SOURCE = path.join(
  ROOT,
  ".planning/quick/260813-hhf-740-manifest/checkpoint-final/catalog.db",
);
const REAL = path.join(ROOT, "data", "fpkg.db");
const EXPECTED_SOURCE_SHA256 =
  "92d3d9512efdd00505c3314957729c1889cd9baf3485d2afa4a66ca5874addd4";
const EXPECTED_REAL_SHA256 =
  "acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a";

const REMOTE_KEYS = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "FPKG_DATABASE_URL",
] as const;

const EXPECTED_BATCH_SHAPES: Record<
  Phase612BatchKey,
  {
    groups: number;
    packs: number;
    brands: number;
    pens: number;
    visuals: number;
  }
> = {
  A: { groups: 5, packs: 11, brands: 5, pens: 6, visuals: 11 },
  B: { groups: 6, packs: 12, brands: 6, pens: 6, visuals: 12 },
  C: { groups: 5, packs: 12, brands: 5, pens: 7, visuals: 7 },
  D: { groups: 5, packs: 11, brands: 5, pens: 6, visuals: 6 },
  E: { groups: 2, packs: 11, brands: 2, pens: 9, visuals: 9 },
};

const EXPECTED_PUBLIC_DELTAS: Record<
  Phase612BatchKey,
  { brands: number; pens: number }
> = {
  A: { brands: 5, pens: 6 },
  B: { brands: 6, pens: 6 },
  C: { brands: 0, pens: 7 },
  D: { brands: 0, pens: 6 },
  E: { brands: 0, pens: 9 },
};

const EXPECTED_BASELINE_PUBLIC_COUNTS = { brands: 121, pens: 740 } as const;
const EXPECTED_FINAL_PUBLIC_COUNTS = { brands: 132, pens: 774 } as const;

const EXISTING_BRAND_IDS = new Set([
  "Zt-PbXkE7UHM",
  "lMGfoMjegnv8",
  "ce2dcqixqSCx",
  "phase307-brand-graf-von-faber-castell",
  "mRz7MvzUYwVF",
  "5BZDt2fQusMf",
  "phase145-waldmann-brand",
  "phase140-brand-stipula",
  "b6DYMF38zz1B",
  "phase605-brand-ferris-wheel-press",
  "2OpQMjam65SM",
  "tVXnzDSFCcPP",
]);

const EXPECTED_NEW_BRAND_SLUGS = new Set([
  "jacques-herbin",
  "kakimori",
  "kolo",
  "travelers-company",
  "wearingeul",
  "endless",
  "leboeuf",
  "marlen",
  "sensa",
  "tom-hessin",
  "zebra",
]);

const EXPECTED_PEN_SLUGS = new Set([
  "jacques-herbin-transparent-pump-action-22000t",
  "kakimori-aluminium-fountain-pen",
  "kakimori-frost",
  "kolo-tino",
  "travelers-company-brass-fountain-pen",
  "wearingeul-preface",
  "endless-phantom-retractable",
  "leboeuf-pilgrim-heritage",
  "marlen-m20",
  "sensa-sensagraph",
  "tom-hessin-charles",
  "zebra-fountain-pen",
  "pilot-precise-varsity",
  "pilot-explorer",
  "namiki-aya",
  "sailor-fude-de-mannen-12-0150",
  "graf-von-faber-castell-guilloche",
  "graf-von-faber-castell-tamitio",
  "kaweco-titan-sport",
  "visconti-mirage-mythos",
  "waldmann-tango",
  "stipula-gladiator",
  "esterbrook-niblet",
  "ferris-wheel-press-bijou",
  "ferris-wheel-press-marquise",
  "monteverde-axis",
  "monteverde-dakota",
  "monteverde-innova-formula-m",
  "monteverde-innova-ombre-fusion",
  "monteverde-mp1",
  "monteverde-mvp",
  "sheaffer-100",
  "sheaffer-300",
  "sheaffer-vfm",
]);

const DATA_MODULE_PATHS: Record<Phase612BatchKey, string> = {
  A: path.join(ROOT, "scripts/data/phase612-external-gap-batch-a.ts"),
  B: path.join(ROOT, "scripts/data/phase612-external-gap-batch-b.ts"),
  C: path.join(ROOT, "scripts/data/phase612-external-gap-batch-c.ts"),
  D: path.join(ROOT, "scripts/data/phase612-external-gap-batch-d.ts"),
  E: path.join(ROOT, "scripts/data/phase612-external-gap-batch-e.ts"),
};

const PRELOADED_BATCHES: Partial<
  Record<Phase612BatchKey, Phase612BatchDefinition>
> = {
  A: { groups: phase612BatchAGroups, packs: phase612BatchAPacks },
  B: { groups: phase612BatchBGroups, packs: phase612BatchBPacks },
  C: { groups: phase612BatchCGroups, packs: phase612BatchCPacks },
};

const FULL_MANIFEST_READY = PHASE612_BATCH_KEYS.every((key) =>
  fs.existsSync(DATA_MODULE_PATHS[key]),
);

function sha256(file: string): string {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function cleanEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: "test",
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: "",
  };
}

function createOwnedCopy(prefix: string): OwnedCopy {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshotCatalogFiles(SOURCE) },
  );
  return { ownedRoot, databasePath: copy.destinationPath };
}

function removeOwnedCopy(copy: OwnedCopy): void {
  fs.rmSync(copy.ownedRoot, { recursive: true, force: true });
}

function optionsFor(
  copy: OwnedCopy,
  sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  realSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  env: NodeJS.ProcessEnv = cleanEnv(),
): ApplyPhase612Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase612-external-gap-content-test",
    databasePath: copy.databasePath,
    ownedRoot: copy.ownedRoot,
    protectedCatalogs: [
      { path: SOURCE, snapshot: sourceSnapshot },
      { path: REAL, snapshot: realSnapshot },
    ],
    env,
  };
}

async function checkpointAndClose(
  client: Client,
  databasePath: string,
): Promise<void> {
  const checkpoint = await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");
  const checkpointRow = checkpoint.rows[0];
  const busy = Number(checkpointRow?.busy ?? 0);
  if (busy !== 0) {
    throw new Error(
      `Phase 612 owned-copy WAL checkpoint is busy (${busy}); sidecars are retained.`,
    );
  }
  client.close();
  const walPath = `${databasePath}-wal`;
  if (fs.existsSync(walPath)) assert.equal(fs.statSync(walPath).size, 0);
  for (const suffix of ["-wal", "-shm"] as const) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true });
  }
}

async function withCheckpointedClient<T>(
  copy: OwnedCopy,
  run: (client: Client) => Promise<T>,
): Promise<T> {
  const client = createClient({ url: `file:${copy.databasePath}` });
  try {
    return await run(client);
  } finally {
    await checkpointAndClose(client, copy.databasePath);
  }
}

async function publicCounts(
  client: Client,
): Promise<{ brands: number; pens: number }> {
  const result = await client.execute(
    "SELECT type,count(*) AS count FROM public_entities WHERE type IN ('brand','pen') GROUP BY type",
  );
  const counts = new Map(
    result.rows.map((row) => [String(row.type), Number(row.count)]),
  );
  return {
    brands: counts.get("brand") ?? 0,
    pens: counts.get("pen") ?? 0,
  };
}

function placeholders(values: readonly unknown[]): string {
  return values.map(() => "?").join(",");
}

function assertProtectedCatalogsUnchanged(
  sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  realSnapshot: ReturnType<typeof snapshotCatalogFiles>,
): void {
  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(realSnapshot);
  assert.equal(sha256(SOURCE), EXPECTED_SOURCE_SHA256);
  assert.equal(sha256(REAL), EXPECTED_REAL_SHA256);
}

async function importBatchDefinition(
  key: Phase612BatchKey,
): Promise<Phase612BatchDefinition> {
  const preloaded = PRELOADED_BATCHES[key];
  if (preloaded) return preloaded;
  const imported = (await import(
    pathToFileURL(DATA_MODULE_PATHS[key]).href
  )) as {
    default?: unknown;
    [key: string]: unknown;
  };
  const namespace =
    imported.default && typeof imported.default === "object"
      ? (imported.default as Record<string, unknown>)
      : imported;
  const groups = namespace[`phase612Batch${key}Groups`];
  const packs = namespace[`phase612Batch${key}Packs`];
  assert.ok(
    Array.isArray(groups),
    `Phase 612 Batch ${key} groups export is missing.`,
  );
  assert.ok(
    Array.isArray(packs),
    `Phase 612 Batch ${key} packs export is missing.`,
  );
  return {
    groups: groups as Phase612Group[],
    packs: packs as CuratedEntityPack[],
  };
}

async function loadAvailableBatches(): Promise<
  Partial<Record<Phase612BatchKey, Phase612BatchDefinition>>
> {
  const batches: Partial<Record<Phase612BatchKey, Phase612BatchDefinition>> =
    {};
  for (const key of PHASE612_BATCH_KEYS) {
    if (fs.existsSync(DATA_MODULE_PATHS[key])) {
      batches[key] = await importBatchDefinition(key);
    }
  }
  return batches;
}

async function loadFullManifest(): Promise<
  Record<Phase612BatchKey, Phase612BatchDefinition>
> {
  assert.ok(
    FULL_MANIFEST_READY,
    "Phase 612 Batch D/E definitions must exist before full-manifest checks run.",
  );
  const entries = await Promise.all(
    PHASE612_BATCH_KEYS.map(
      async (key) => [key, await importBatchDefinition(key)] as const,
    ),
  );
  return Object.fromEntries(entries) as Record<
    Phase612BatchKey,
    Phase612BatchDefinition
  >;
}

function assertBatchShape(
  key: Phase612BatchKey,
  batch: Phase612BatchDefinition,
): void {
  const expected = EXPECTED_BATCH_SHAPES[key];
  assert.equal(
    batch.groups.length,
    expected.groups,
    `Batch ${key} group count`,
  );
  assert.equal(batch.packs.length, expected.packs, `Batch ${key} pack count`);
  assert.equal(
    batch.packs.filter(({ expectedType }) => expectedType === "brand").length,
    expected.brands,
    `Batch ${key} brand count`,
  );
  assert.equal(
    batch.packs.filter(({ expectedType }) => expectedType === "pen").length,
    expected.pens,
    `Batch ${key} pen count`,
  );
  assert.equal(
    new Set(batch.packs.map(({ entityId }) => entityId)).size,
    batch.packs.length,
    `Batch ${key} entity ids`,
  );
  const packIds = new Set(batch.packs.map(({ entityId }) => entityId));
  const groupedIds = batch.groups.flatMap(({ brand, pens }) => [
    brand.entityId,
    ...pens.map(({ entityId }) => entityId),
  ]);
  assert.equal(
    groupedIds.length,
    batch.packs.length,
    `Batch ${key} groups must reference every pack exactly once`,
  );
  assert.equal(
    new Set(groupedIds).size,
    groupedIds.length,
    `Batch ${key} groups contain a duplicate pack`,
  );
  assert.deepEqual(
    [...groupedIds].sort(),
    [...packIds].sort(),
    `Batch ${key} groups and packs must be a bijection`,
  );
  for (const { brand, pens } of batch.groups) {
    assert.equal(brand.expectedType, "brand");
    assert.ok(
      pens.length > 0,
      `${brand.expectedSlug} must own at least one pen.`,
    );
    assert.ok(packIds.has(brand.entityId));
    for (const pen of pens) {
      assert.equal(pen.expectedType, "pen");
      assert.equal(pen.spec?.brandEntityId, brand.entityId);
      assert.ok(packIds.has(pen.entityId));
    }
  }
}

function assertUniqueSurfaceOwners(packs: CuratedEntityPack[]): void {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const canonicalNames = new Set<string>();
  const surfaceOwners = new Map<string, string>();
  for (const pack of packs) {
    assert.ok(!ids.has(pack.entityId), `duplicate id: ${pack.entityId}`);
    ids.add(pack.entityId);
    const slug = pack.expectedSlug.trim().toLocaleLowerCase("en");
    assert.ok(!slugs.has(slug), `duplicate slug: ${pack.expectedSlug}`);
    slugs.add(slug);
    const name = pack.canonicalName.trim().toLocaleLowerCase("en");
    assert.ok(
      !canonicalNames.has(name),
      `duplicate name: ${pack.canonicalName}`,
    );
    canonicalNames.add(name);
    assert.equal(
      new Set(pack.aliases.map(({ alias }) => alias.trim())).size,
      pack.aliases.length,
      `${pack.expectedSlug} has duplicate aliases.`,
    );
    for (const surface of [
      pack.canonicalName,
      ...pack.aliases.map(({ alias }) => alias),
    ]) {
      const normalized = surface.trim().toLocaleLowerCase("en");
      const owner = surfaceOwners.get(normalized);
      assert.ok(
        !owner || owner === pack.entityId,
        `${surface} is claimed by ${owner} and ${pack.entityId}.`,
      );
      surfaceOwners.set(normalized, pack.entityId);
    }
  }
}

function assertHardIdentityBoundaries(
  packs: CuratedEntityPack[],
  groups: Phase612Group[],
): void {
  const bySlug = new Map(packs.map((pack) => [pack.expectedSlug, pack]));
  const precise = bySlug.get("pilot-precise-varsity");
  assert.equal(precise?.canonicalName, "Pilot Precise Varsity");
  assert.deepEqual(
    precise?.aliases
      .map(({ alias }) => alias)
      .filter((alias) => alias === "Pilot Varsity" || alias === "Varsity")
      .sort(),
    ["Pilot Varsity", "Varsity"],
  );

  const zebra = bySlug.get("zebra-fountain-pen");
  assert.ok(zebra);
  assert.ok(zebra.variants?.some(({ productCode }) => productCode === "48307"));
  assert.equal(
    packs.filter(
      ({ expectedType, expectedSlug }) =>
        expectedType === "pen" && /(?:48307|7-pack)/i.test(expectedSlug),
    ).length,
    0,
    "Zebra 48307 must remain a variant, not an entity.",
  );

  const sailor = bySlug.get("sailor-fude-de-mannen-12-0150");
  assert.ok(sailor);
  assert.ok(
    sailor.variants?.every(({ productCode }) =>
      String(productCode).startsWith("12-0150-"),
    ),
  );
  assert.equal(
    packs.filter(({ expectedSlug }) =>
      expectedSlug.startsWith("sailor-fude-de-mannen"),
    ).length,
    1,
  );

  const kakimori = groups.find(
    ({ brand }) => brand.expectedSlug === "kakimori",
  );
  assert.deepEqual(
    kakimori?.pens.map(({ expectedSlug }) => expectedSlug).sort(),
    ["kakimori-aluminium-fountain-pen", "kakimori-frost"],
  );

  const aya = bySlug.get("namiki-aya");
  assert.equal(aya?.spec?.brandEntityId, "lMGfoMjegnv8");
  assert.notEqual(aya?.spec?.brandEntityId, "Zt-PbXkE7UHM");
  for (const slug of [
    "graf-von-faber-castell-guilloche",
    "graf-von-faber-castell-tamitio",
  ]) {
    assert.equal(
      bySlug.get(slug)?.spec?.brandEntityId,
      "phase307-brand-graf-von-faber-castell",
    );
  }
  assert.equal(
    bySlug.get("tom-hessin-charles")?.spec?.brandEntityId,
    "phase612-brand-tom-hessin",
  );
  assert.ok(
    packs.every(
      (pack) =>
        ![pack.canonicalName, ...pack.aliases.map(({ alias }) => alias)].some(
          (surface) => /tom['’]?s studio/i.test(surface),
        ),
    ),
  );

  const titan = bySlug.get("kaweco-titan-sport");
  assert.equal(titan?.canonicalName, "Kaweco TITAN Sport");
  assert.ok(
    titan?.aliases.every(
      ({ alias }) => !/\b(?:AL|Piston|Brass|Bronze|Steel) Sport\b/i.test(alias),
    ),
  );

  const mythos = packs.find(
    ({ expectedType, canonicalName }) =>
      expectedType === "pen" && /Visconti Mirage Mythos/i.test(canonicalName),
  );
  assert.ok(mythos, "Mirage Mythos target is missing.");
  assert.ok(/mirage-mythos/.test(mythos.expectedSlug));
  assert.ok(
    mythos.aliases.every(
      ({ alias }) => alias.trim().toLocaleLowerCase("en") !== "visconti mirage",
    ),
  );

  assert.equal(
    packs.filter(
      ({ expectedType, canonicalName }) =>
        expectedType === "pen" &&
        canonicalName.trim().toLocaleLowerCase("en") === "monteverde innova",
    ).length,
    0,
    "Generic Monteverde Innova must not become an entity.",
  );
  assert.equal(
    packs.filter(
      ({ expectedType, canonicalName }) =>
        expectedType === "pen" && /Monteverde Innova/i.test(canonicalName),
    ).length,
    2,
  );

  const fwp = groups.find(
    ({ brand }) => brand.entityId === "phase605-brand-ferris-wheel-press",
  );
  assert.equal(fwp?.pens.length, 2);
  assert.deepEqual(fwp?.pens.map(({ expectedSlug }) => expectedSlug).sort(), [
    "ferris-wheel-press-bijou",
    "ferris-wheel-press-marquise",
  ]);
  assert.ok(
    fwp?.pens.every((pen) => (pen.variants?.length ?? 0) > 0),
    "Ferris Wheel Press literary colours must remain variants.",
  );
}

function bodyWithoutInternalConstructionLanguage(
  pack: CuratedEntityPack,
): void {
  const loaded = loadCuratedEntityPack(ROOT, pack);
  validatePack(ROOT, loaded);
  assert.doesNotMatch(
    `${loaded.summary}\n${loaded.bodyMd}`,
    /(?:phase\s*\d+|phase612|\.planning\/|checkpoint|CuratedEntityPack|content[- ]?pack|审核卡|待迁移|待接入|施工中|数据库写入|内部审稿|发布边界|身份冲突|\bTODO\b|\bTBD\b)/iu,
    `${pack.expectedSlug} exposes internal construction language.`,
  );
}

function tagText(svg: string, tag: "title" | "desc"): string {
  const match = svg.match(
    new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"),
  );
  return (match?.[1] ?? "").replace(/<[^>]+>/g, " ").trim();
}

function visibleSvgText(svg: string): string {
  return [
    ...svg.matchAll(
      /<(?:text|tspan|title|desc)\b[^>]*>([\s\S]*?)<\/(?:text|tspan|title|desc)>/gi,
    ),
  ]
    .map((match) => (match[1] ?? "").replace(/<[^>]+>/g, " "))
    .join(" ")
    .replace(/&(?:amp|lt|gt|quot|apos);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assertSafeReadableSvg(svgPath: string): void {
  const result = spawnSync("xmllint", ["--noout", svgPath], {
    encoding: "utf8",
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr || `${svgPath} is invalid XML.`);

  const svg = fs.readFileSync(svgPath, "utf8");
  const root = svg.match(/<svg\b[^>]*>/i)?.[0] ?? "";
  assert.match(root, /\bwidth=["']1600["']/i);
  assert.match(root, /\bheight=["']900["']/i);
  assert.match(root, /\bviewBox=["']0 0 1600 900["']/i);
  assert.match(root, /\brole=["']img["']/i);

  const title = tagText(svg, "title");
  const description = tagText(svg, "desc");
  assert.ok(title.length > 0, `${svgPath} has no title.`);
  assert.ok(description.length > 0, `${svgPath} has no desc.`);
  assert.match(
    `${title} ${description}`,
    /钢笔|fountain\s+pen/i,
    `${svgPath} title/desc does not identify a fountain-pen silhouette.`,
  );
  assert.match(svg, /<(?:g|path|rect)\b/i);

  const visible = visibleSvgText(svg);
  assert.match(visible, /[\u3400-\u9fff]/u);
  assert.match(visible, /本站原创/);
  assert.match(visible, /(?:事实|结构)示意/);
  assert.match(visible, /非产品照片/);
  assert.doesNotMatch(
    visible,
    /\b(?:phase(?:\s*\d+)?|audit|review|candidate|rejected)\b|审核卡|发布边界|身份冲突/iu,
    `${svgPath} exposes internal review language in visible text.`,
  );
  assert.doesNotMatch(
    svg,
    /<!DOCTYPE|<!ENTITY|<script\b|<foreignObject\b|<iframe\b|<object\b|<embed\b|<image\b|<a\b|\son[a-z]+\s*=|javascript:|data:text\/html|data:image|@import|url\(\s*["']?(?:https?:|data:)/iu,
    `${svgPath} contains an unsafe SVG element or external payload.`,
  );
  assert.doesNotMatch(
    svg,
    /(?:href|xlink:href)\s*=\s*["'](?!#)/iu,
    `${svgPath} contains a non-local href.`,
  );
}

test("Phase 612 pins the Phase 609 source and real catalog families", () => {
  assert.equal(sha256(SOURCE), EXPECTED_SOURCE_SHA256);
  assert.equal(sha256(REAL), EXPECTED_REAL_SHA256);
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  for (const snapshot of [sourceSnapshot, realSnapshot]) {
    assert.equal(snapshot.main.exists, true);
    assert.equal(snapshot.wal.exists, false);
    assert.equal(snapshot.shm.exists, false);
  }
  assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
});

test("Phase 612 rejects a protected catalog path paired with the wrong frozen snapshot", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const copy = createOwnedCopy("fpkg-phase612-protected-path-mismatch-");
  const candidateHash = sha256(copy.databasePath);
  const client = createClient({ url: `file:${copy.databasePath}` });
  try {
    const options = optionsFor(copy, sourceSnapshot, realSnapshot);
    await assert.rejects(
      applyPhase612ExternalGapBatch(
        client,
        {
          ...options,
          protectedCatalogs: [
            { path: REAL, snapshot: sourceSnapshot },
            { path: REAL, snapshot: realSnapshot },
          ],
        },
        "A",
      ),
      /protected catalog path does not match its frozen snapshot/,
    );
    assert.equal(sha256(copy.databasePath), candidateHash);
    assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
  } finally {
    client.close();
    removeOwnedCopy(copy);
  }
});

test("Phase 612 available batches load and validate every curated pack", async () => {
  const batches = await loadAvailableBatches();
  const availableKeys = PHASE612_BATCH_KEYS.filter((key) => batches[key]);
  assert.ok(availableKeys.length >= 3);
  for (const key of availableKeys) {
    const batch = batches[key];
    assert.ok(batch);
    assertBatchShape(key, batch);
    for (const pack of batch.packs)
      bodyWithoutInternalConstructionLanguage(pack);
  }
});

test("Phase 612 full manifest is exactly 57 packs in 23 brand groups", {
  skip: FULL_MANIFEST_READY ? false : "Batch D/E definitions are not ready.",
}, async () => {
  const batches = await loadFullManifest();
  const packs = PHASE612_BATCH_KEYS.flatMap((key) => batches[key].packs);
  const groups = PHASE612_BATCH_KEYS.flatMap((key) => batches[key].groups);
  for (const key of PHASE612_BATCH_KEYS) assertBatchShape(key, batches[key]);

  assert.equal(groups.length, 23);
  assert.equal(packs.length, 57);
  assert.equal(
    packs.filter(({ expectedType }) => expectedType === "brand").length,
    23,
  );
  assert.equal(
    packs.filter(({ expectedType }) => expectedType === "pen").length,
    34,
  );
  const existingBrands = packs.filter(
    (pack) =>
      pack.expectedType === "brand" && EXISTING_BRAND_IDS.has(pack.entityId),
  );
  const newBrands = packs.filter(
    (pack) =>
      pack.expectedType === "brand" && !EXISTING_BRAND_IDS.has(pack.entityId),
  );
  assert.equal(existingBrands.length, 12);
  assert.deepEqual(
    new Set(existingBrands.map(({ entityId }) => entityId)),
    EXISTING_BRAND_IDS,
  );
  assert.equal(newBrands.length, 11);
  assert.ok(
    newBrands.every(({ entityId }) => entityId.startsWith("phase612-")),
  );
  assert.deepEqual(
    new Set(newBrands.map(({ expectedSlug }) => expectedSlug)),
    EXPECTED_NEW_BRAND_SLUGS,
  );
  assert.deepEqual(
    new Set(
      packs
        .filter(({ expectedType }) => expectedType === "pen")
        .map(({ expectedSlug }) => expectedSlug),
    ),
    EXPECTED_PEN_SLUGS,
  );
  assert.ok(
    packs
      .filter(({ expectedType }) => expectedType === "pen")
      .every(({ entityId }) => entityId.startsWith("phase612-")),
  );
  assertUniqueSurfaceOwners(packs);
  assertHardIdentityBoundaries(packs, groups);
});

test("Phase 612 site-original SVGs are readable, safe and hash-unique", async () => {
  const batches = await loadAvailableBatches();
  const visualPaths: string[] = [];
  for (const key of PHASE612_BATCH_KEYS) {
    const batch = batches[key];
    if (!batch) continue;
    const visualPacks = batch.packs.filter(
      (pack) => !EXISTING_BRAND_IDS.has(pack.entityId),
    );
    assert.equal(visualPacks.length, EXPECTED_BATCH_SHAPES[key].visuals);
    for (const pack of visualPacks) {
      const primary = pack.media.filter(
        ({ usageStatus }) => usageStatus === "primary",
      );
      assert.equal(
        primary.length,
        1,
        `${pack.expectedSlug} primary media count`,
      );
      const localPath = primary[0]?.localPath ?? "";
      assert.match(
        localPath,
        new RegExp(
          `^/images/library/site-original/phase612/batch-${key.toLocaleLowerCase("en")}/`,
        ),
      );
      const svgPath = path.join(ROOT, "public", localPath.replace(/^\//, ""));
      assert.equal(fs.statSync(svgPath).isFile(), true);
      assertSafeReadableSvg(svgPath);
      visualPaths.push(svgPath);
    }
  }
  const expectedVisuals = PHASE612_BATCH_KEYS.reduce(
    (total, key) =>
      total + (batches[key] ? EXPECTED_BATCH_SHAPES[key].visuals : 0),
    0,
  );
  assert.equal(visualPaths.length, expectedVisuals);
  if (FULL_MANIFEST_READY) assert.equal(visualPaths.length, 45);
  assert.equal(new Set(visualPaths).size, visualPaths.length);
  assert.equal(
    new Set(visualPaths.map((svgPath) => sha256(svgPath))).size,
    visualPaths.length,
  );
});

test("Phase 612 rejects all remote selectors without changing protected catalogs", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const copy = createOwnedCopy("fpkg-phase612-remote-");
  const candidateHash = sha256(copy.databasePath);
  const client = createClient({ url: `file:${copy.databasePath}` });
  try {
    for (const key of REMOTE_KEYS) {
      await assert.rejects(
        applyPhase612ExternalGapBatch(
          client,
          optionsFor(copy, sourceSnapshot, realSnapshot, {
            ...cleanEnv(),
            [key]: "libsql://remote-selection-must-fail.invalid",
          }),
          "A",
        ),
        new RegExp(key),
      );
      assert.equal(sha256(copy.databasePath), candidateHash);
      assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
    }
  } finally {
    client.close();
    removeOwnedCopy(copy);
  }
});

test("Phase 612 rejects symlink, hard-link and non-empty SQLite companions", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);

  {
    const copy = createOwnedCopy("fpkg-phase612-symlink-");
    const symlinkPath = path.join(copy.ownedRoot, "catalog-symlink.db");
    fs.symlinkSync(copy.databasePath, symlinkPath);
    const symlinkCopy = { ...copy, databasePath: symlinkPath };
    const client = createClient({ url: `file:${symlinkPath}` });
    try {
      await assert.rejects(
        applyPhase612ExternalGapBatch(
          client,
          optionsFor(symlinkCopy, sourceSnapshot, realSnapshot),
          "A",
        ),
        /non-symlink/,
      );
    } finally {
      client.close();
      removeOwnedCopy(copy);
    }
  }

  {
    const copy = createOwnedCopy("fpkg-phase612-hardlink-");
    fs.linkSync(
      copy.databasePath,
      path.join(copy.ownedRoot, "catalog-hardlink.db"),
    );
    const client = createClient({ url: `file:${copy.databasePath}` });
    try {
      await assert.rejects(
        applyPhase612ExternalGapBatch(
          client,
          optionsFor(copy, sourceSnapshot, realSnapshot),
          "A",
        ),
        /hard links|hard-link/,
      );
    } finally {
      client.close();
      removeOwnedCopy(copy);
    }
  }

  for (const suffix of ["-wal", "-shm"] as const) {
    const copy = createOwnedCopy(`fpkg-phase612-${suffix.slice(1)}-`);
    const client = createClient({ url: `file:${copy.databasePath}` });
    fs.writeFileSync(
      `${copy.databasePath}${suffix}`,
      `phase612-non-empty-${suffix}`,
    );
    try {
      await assert.rejects(
        applyPhase612ExternalGapBatch(
          client,
          optionsFor(copy, sourceSnapshot, realSnapshot),
          "A",
        ),
        /non-empty SQLite companion/,
      );
    } finally {
      client.close();
      removeOwnedCopy(copy);
    }
  }

  assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
});

test("Phase 612 refuses representative id, slug, name and alias collisions", {
  timeout: 900_000,
  skip: FULL_MANIFEST_READY ? false : "Batch D/E definitions are not ready.",
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const target = phase612BatchAPacks.find(
    ({ expectedSlug }) => expectedSlug === "kakimori",
  );
  assert.ok(target);
  const alias = target.aliases.find(({ alias }) => alias === "Kakimori Tokyo");
  assert.ok(alias);

  const fixtures: Array<{
    label: string;
    mutate: (client: Client) => Promise<void>;
    expected: RegExp;
  }> = [
    {
      label: "id",
      mutate: async (client) => {
        await client.execute({
          sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen','phase612-id-collision','Phase 612 id collision')",
          args: [target.entityId],
        });
      },
      expected: /identity collision/,
    },
    {
      label: "slug",
      mutate: async (client) => {
        await client.execute({
          sql: "INSERT INTO entities(id,type,slug,name) VALUES('phase612-slug-collision','brand',?,'Phase 612 slug collision')",
          args: [target.expectedSlug],
        });
      },
      expected: /identity collision/,
    },
    {
      label: "name",
      mutate: async (client) => {
        await client.execute({
          sql: "INSERT INTO entities(id,type,slug,name) VALUES('phase612-name-collision','brand','phase612-name-collision',?)",
          args: [target.canonicalName],
        });
      },
      expected: /identity collision/,
    },
    {
      label: "alias",
      mutate: async (client) => {
        await client.execute(
          "INSERT INTO entities(id,type,slug,name) VALUES('phase612-alias-owner','brand','phase612-alias-owner','Phase 612 alias owner')",
        );
        await client.execute({
          sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,review_status) VALUES('phase612-alias-collision','phase612-alias-owner',?,'en','pending')",
          args: [alias.alias],
        });
      },
      expected: /alias collision/,
    },
  ];

  for (const fixture of fixtures) {
    const copy = createOwnedCopy(`fpkg-phase612-${fixture.label}-collision-`);
    let client = createClient({ url: `file:${copy.databasePath}` });
    try {
      await fixture.mutate(client);
      await checkpointAndClose(client, copy.databasePath);
      client = createClient({ url: `file:${copy.databasePath}` });
      await assert.rejects(
        applyPhase612ExternalGapBatch(
          client,
          optionsFor(copy, sourceSnapshot, realSnapshot),
          "A",
        ),
        fixture.expected,
        fixture.label,
      );
    } finally {
      client.close();
      removeOwnedCopy(copy);
    }
  }
  assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
});

test("Phase 612 rejects a missing existing Pilot brand or an empty prior source", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const pilotId = "Zt-PbXkE7UHM";
  const fixtures: Array<{
    label: string;
    mutate: (client: Client) => Promise<void>;
    expected: RegExp;
  }> = [
    {
      label: "missing",
      mutate: async (client) => {
        await client.execute("PRAGMA foreign_keys=OFF");
        await client.execute({
          sql: "DELETE FROM entities WHERE id=?",
          args: [pilotId],
        });
      },
      expected: /existing brand is missing: Zt-PbXkE7UHM/,
    },
    {
      label: "empty-source",
      mutate: async (client) => {
        await client.execute({
          sql: "UPDATE entities SET source='' WHERE id=?",
          args: [pilotId],
        });
      },
      expected: /source ownership mismatch: Zt-PbXkE7UHM/,
    },
  ];

  for (const fixture of fixtures) {
    const copy = createOwnedCopy(`fpkg-phase612-pilot-${fixture.label}-`);
    try {
      await withCheckpointedClient(copy, fixture.mutate);
      const candidateHash = sha256(copy.databasePath);
      await withCheckpointedClient(copy, async (client) => {
        await assert.rejects(
          applyPhase612ExternalGapBatch(
            client,
            optionsFor(copy, sourceSnapshot, realSnapshot),
            "C",
          ),
          fixture.expected,
          fixture.label,
        );
      });
      assert.equal(sha256(copy.databasePath), candidateHash);
    } finally {
      removeOwnedCopy(copy);
      assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
    }
  }
});

test("Phase 612 rejects a foreign reverse relation on a Batch A target pen", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const target = phase612BatchAPacks.find(
    ({ expectedType }) => expectedType === "pen",
  );
  assert.ok(target);
  const foreignBrandId = "Zt-PbXkE7UHM";
  const copy = createOwnedCopy("fpkg-phase612-foreign-reverse-");
  try {
    await withCheckpointedClient(copy, async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name,source) VALUES(?,'pen',?,?,?)",
        args: [
          target.entityId,
          target.expectedSlug,
          target.canonicalName,
          `phase612-prepared:${target.key}`,
        ],
      });
      await client.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
        args: [
          "phase612-test-foreign-reverse",
          foreignBrandId,
          target.entityId,
          "Phase 612 negative regression fixture",
        ],
      });
    });
    const candidateHash = sha256(copy.databasePath);
    await withCheckpointedClient(copy, async (client) => {
      await assert.rejects(
        applyPhase612ExternalGapBatch(
          client,
          optionsFor(copy, sourceSnapshot, realSnapshot),
          "A",
        ),
        /reverse topology is ambiguous/,
      );
      const topology = await client.execute({
        sql: `SELECT
                (SELECT count(*) FROM entity_links
                 WHERE source_id=? AND link_type='made_by') AS maker_count,
                (SELECT count(*) FROM entity_links
                 WHERE target_id=? AND link_type='reverse') AS reverse_count`,
        args: [target.entityId, target.entityId],
      });
      assert.equal(Number(topology.rows[0]?.maker_count), 0);
      assert.equal(Number(topology.rows[0]?.reverse_count), 1);
    });
    assert.equal(sha256(copy.databasePath), candidateHash);
  } finally {
    removeOwnedCopy(copy);
    assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
  }
});

test("Phase 612 rejects reverse-topology drift on an existing Batch C sibling pen", {
  timeout: 1_800_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const pilotGroup = phase612BatchCGroups.find(
    ({ brand }) => brand.entityId === "Zt-PbXkE7UHM",
  );
  assert.ok(pilotGroup);
  const targetIds = pilotGroup.pens.map(({ entityId }) => entityId);
  const copy = createOwnedCopy("fpkg-phase612-sibling-reverse-drift-");
  let siblingId = "";
  let foreignBrandId = "";
  try {
    await withCheckpointedClient(copy, async (client) => {
      const sibling = await client.execute({
        sql: `SELECT entity.id
              FROM entities entity
              JOIN entity_links maker
                ON maker.source_id=entity.id AND maker.link_type='made_by'
              WHERE entity.type='pen'
                AND maker.target_id=?
                AND entity.id NOT IN (${placeholders(targetIds)})
              ORDER BY entity.id
              LIMIT 1`,
        args: [pilotGroup.brand.entityId, ...targetIds],
      });
      siblingId = String(sibling.rows[0]?.id ?? "");
      assert.ok(siblingId, "Batch C Pilot must have a protected sibling pen.");

      const foreignBrand = await client.execute({
        sql: `SELECT brand.id
              FROM entities brand
              WHERE brand.type='brand'
                AND brand.id<>?
                AND NOT EXISTS (
                  SELECT 1 FROM entity_links reverse
                  WHERE reverse.source_id=brand.id
                    AND reverse.target_id=?
                    AND reverse.link_type='reverse'
                )
              ORDER BY brand.id
              LIMIT 1`,
        args: [pilotGroup.brand.entityId, siblingId],
      });
      foreignBrandId = String(foreignBrand.rows[0]?.id ?? "");
      assert.ok(foreignBrandId, "A foreign brand fixture must exist.");

      await client.execute({
        sql: `INSERT INTO entity_links(id,source_id,target_id,link_type,reason)
              VALUES('phase612-test-sibling-reverse-drift',?,?,'reverse',?)`,
        args: [
          foreignBrandId,
          siblingId,
          "Phase 612 negative regression fixture",
        ],
      });
    });
    await withCheckpointedClient(copy, async (client) => {
      await assert.rejects(
        applyPhase612ExternalGapBatch(
          client,
          optionsFor(copy, sourceSnapshot, realSnapshot),
          "C",
        ),
        /changed a protected sibling pen payload/,
      );
      const drift = await client.execute({
        sql: `SELECT count(*) AS count FROM entity_links
              WHERE id='phase612-test-sibling-reverse-drift'
                AND source_id=? AND target_id=? AND link_type='reverse'`,
        args: [foreignBrandId, siblingId],
      });
      assert.equal(Number(drift.rows[0]?.count), 1);
    });
  } finally {
    removeOwnedCopy(copy);
    assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
  }
});

test("Phase 612 applies A-E once and replays every batch as a byte-preserving noop", {
  timeout: 4_000_000,
  skip: FULL_MANIFEST_READY ? false : "Batch D/E definitions are not ready.",
}, async () => {
  const batches = await loadFullManifest();
  const packs = PHASE612_BATCH_KEYS.flatMap((key) => batches[key].packs);
  const groups = PHASE612_BATCH_KEYS.flatMap((key) => batches[key].groups);
  const targetIds = packs.map(({ entityId }) => entityId);
  const penIds = packs
    .filter(({ expectedType }) => expectedType === "pen")
    .map(({ entityId }) => entityId);
  const newPacks = packs.filter(
    (pack) =>
      pack.expectedType === "pen" || !EXISTING_BRAND_IDS.has(pack.entityId),
  );
  const newIds = newPacks.map(({ entityId }) => entityId);
  const expectedById = new Map(
    packs.map((pack) => {
      const loaded = loadCuratedEntityPack(ROOT, pack);
      return [loaded.entityId, loaded] as const;
    }),
  );
  const expectedMakerPairs = groups
    .flatMap(({ brand, pens }) =>
      pens.map((pen) => ({
        source_id: pen.entityId,
        target_id: brand.entityId,
      })),
    )
    .sort((left, right) => left.source_id.localeCompare(right.source_id));
  const expectedReversePairs = expectedMakerPairs
    .map(({ source_id, target_id }) => ({
      source_id: target_id,
      target_id: source_id,
    }))
    .sort((left, right) => left.target_id.localeCompare(right.target_id));

  assert.equal(targetIds.length, 57);
  assert.equal(newIds.length, 45);
  assert.equal(penIds.length, 34);
  assert.equal(expectedMakerPairs.length, 34);

  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
  const copy = createOwnedCopy("fpkg-phase612-all-batches-");
  const initialCopySnapshot = snapshotCatalogFiles(copy.databasePath);
  assert.equal(initialCopySnapshot.main.sha256, EXPECTED_SOURCE_SHA256);
  assert.equal(initialCopySnapshot.wal.exists, false);
  assert.equal(initialCopySnapshot.shm.exists, false);
  assert.notEqual(
    `${initialCopySnapshot.main.device}:${initialCopySnapshot.main.inode}`,
    `${sourceSnapshot.main.device}:${sourceSnapshot.main.inode}`,
  );
  assert.notEqual(
    `${initialCopySnapshot.main.device}:${initialCopySnapshot.main.inode}`,
    `${realSnapshot.main.device}:${realSnapshot.main.inode}`,
  );

  const applyOptions = optionsFor(copy, sourceSnapshot, realSnapshot);
  try {
    await withCheckpointedClient(copy, async (client) => {
      assert.deepEqual(
        await publicCounts(client),
        EXPECTED_BASELINE_PUBLIC_COUNTS,
      );
      const absent = await client.execute({
        sql: `SELECT count(*) AS count FROM entities WHERE id IN (${placeholders(newIds)})`,
        args: newIds,
      });
      assert.equal(Number(absent.rows[0]?.count), 0);
      const existing = await client.execute({
        sql: `SELECT count(*) AS count FROM public_entities WHERE id IN (${placeholders([...EXISTING_BRAND_IDS])})`,
        args: [...EXISTING_BRAND_IDS],
      });
      assert.equal(Number(existing.rows[0]?.count), EXISTING_BRAND_IDS.size);
    });

    let expectedCounts: { brands: number; pens: number } = {
      ...EXPECTED_BASELINE_PUBLIC_COUNTS,
    };
    for (const key of PHASE612_BATCH_KEYS) {
      await withCheckpointedClient(copy, async (client) => {
        const result = await applyPhase612ExternalGapBatch(
          client,
          applyOptions,
          key,
        );
        assert.equal(result.batch, key);
        assert.equal(result.entities.length, EXPECTED_BATCH_SHAPES[key].packs);
        assert.ok(
          result.entities.every(({ outcome }) => outcome === "published"),
          `Batch ${key} must publish every target on first apply.`,
        );
        assert.deepEqual(result.publicDelta, EXPECTED_PUBLIC_DELTAS[key]);
        expectedCounts = {
          brands: expectedCounts.brands + EXPECTED_PUBLIC_DELTAS[key].brands,
          pens: expectedCounts.pens + EXPECTED_PUBLIC_DELTAS[key].pens,
        };
        assert.deepEqual(await publicCounts(client), expectedCounts);
        assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
      });
      const checkpoint = snapshotCatalogFiles(copy.databasePath);
      assert.equal(checkpoint.wal.exists, false);
      assert.equal(checkpoint.shm.exists, false);
      assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
    }
    assert.deepEqual(expectedCounts, EXPECTED_FINAL_PUBLIC_COUNTS);

    await withCheckpointedClient(copy, async (client) => {
      assert.deepEqual(
        await publicCounts(client),
        EXPECTED_FINAL_PUBLIC_COUNTS,
      );

      const publicNewEntities = await client.execute({
        sql: `SELECT id,type FROM public_entities WHERE id IN (${placeholders(newIds)}) ORDER BY id`,
        args: newIds,
      });
      assert.equal(publicNewEntities.rows.length, 45);
      assert.deepEqual(
        new Set(publicNewEntities.rows.map((row) => String(row.id))),
        new Set(newIds),
      );
      assert.equal(
        publicNewEntities.rows.filter((row) => String(row.type) === "brand")
          .length,
        11,
      );
      assert.equal(
        publicNewEntities.rows.filter((row) => String(row.type) === "pen")
          .length,
        34,
      );

      const terminal = await client.execute({
        sql: `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,
                     publication.status,publication.blockers_json,
                     publication.approved_content_hash,
                     publication.content_revision,
                     publication.reviewed_content_revision,
                     publication.reviewed_contract_version,
                     publication.reviewed_by,publication.reviewed_at,
                     publication.published_at,
                     readiness.blocker_count,readiness.publishable,
                     CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
              FROM entities entity
              JOIN entity_publications publication
                ON publication.entity_id=entity.id
              JOIN public_entity_readiness readiness
                ON readiness.entity_id=entity.id AND readiness.contract_version=3
              LEFT JOIN public_entities public ON public.id=entity.id
              WHERE entity.id IN (${placeholders(targetIds)})
              ORDER BY entity.id`,
        args: targetIds,
      });
      assert.equal(terminal.rows.length, 57);
      for (const row of terminal.rows) {
        const pack = expectedById.get(String(row.id));
        assert.ok(pack, `Unexpected terminal entity ${String(row.id)}.`);
        assert.equal(String(row.type), pack.expectedType);
        assert.equal(String(row.slug), pack.expectedSlug);
        assert.equal(String(row.name), pack.canonicalName);
        assert.equal(String(row.source), pack.sourceMarker);
        assert.equal(String(row.status), "published");
        assert.equal(String(row.blockers_json), "[]");
        assert.match(
          String(row.approved_content_hash),
          /^sha256:v3:[0-9a-f]{64}$/,
        );
        assert.equal(
          Number(row.reviewed_content_revision),
          Number(row.content_revision),
        );
        assert.equal(Number(row.reviewed_contract_version), 3);
        assert.equal(String(row.reviewed_by), applyOptions.reviewer);
        assert.ok(String(row.reviewed_at).trim());
        assert.ok(String(row.published_at).trim());
        assert.equal(Number(row.blocker_count), 0);
        assert.equal(Number(row.publishable), 1);
        assert.equal(Number(row.is_public), 1);
      }

      const reviews = await client.execute({
        sql: `SELECT review.entity_id,review.review_kind,review.content_hash,
                     review.status,review.reviewer,review.reviewed_at,
                     publication.approved_content_hash
              FROM entity_content_reviews review
              JOIN entity_publications publication
                ON publication.entity_id=review.entity_id
               AND publication.approved_content_hash=review.content_hash
              WHERE review.entity_id IN (${placeholders(targetIds)})
                AND review.status='approved'
              ORDER BY review.entity_id,review.review_kind`,
        args: targetIds,
      });
      assert.equal(reviews.rows.length, 57 * 4);
      for (const id of targetIds) {
        const entityReviews = reviews.rows.filter(
          (row) => String(row.entity_id) === id,
        );
        assert.deepEqual(
          entityReviews.map((row) => String(row.review_kind)),
          ["fact", "language", "media", "publication"],
          `${id} current-hash reviews`,
        );
        assert.ok(
          entityReviews.every(
            (row) =>
              String(row.status) === "approved" &&
              String(row.reviewer) === applyOptions.reviewer &&
              String(row.reviewed_at).trim().length > 0 &&
              String(row.content_hash) === String(row.approved_content_hash),
          ),
          `${id} review provenance`,
        );
      }

      const media = await client.execute({
        sql: `SELECT count(*) AS count FROM media_assets
              WHERE entity_id IN (${placeholders(targetIds)})
                AND usage_status='primary'`,
        args: targetIds,
      });
      assert.equal(Number(media.rows[0]?.count), 57);
      const specs = await client.execute({
        sql: `SELECT count(*) AS count FROM model_specs
              WHERE entity_id IN (${placeholders(penIds)})
                AND review_status='approved'`,
        args: penIds,
      });
      assert.equal(Number(specs.rows[0]?.count), 34);

      const maker = await client.execute({
        sql: `SELECT source_id,target_id FROM entity_links
              WHERE link_type='made_by'
                AND source_id IN (${placeholders(penIds)})
              ORDER BY source_id`,
        args: penIds,
      });
      assert.deepEqual(
        maker.rows.map((row) => ({
          source_id: String(row.source_id),
          target_id: String(row.target_id),
        })),
        expectedMakerPairs,
      );
      const reverse = await client.execute({
        sql: `SELECT source_id,target_id FROM entity_links
              WHERE link_type='reverse'
                AND target_id IN (${placeholders(penIds)})
              ORDER BY target_id`,
        args: penIds,
      });
      assert.deepEqual(
        reverse.rows.map((row) => ({
          source_id: String(row.source_id),
          target_id: String(row.target_id),
        })),
        expectedReversePairs,
      );
      assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
    });

    const beforeReplay = snapshotCatalogFiles(copy.databasePath);
    assert.equal(beforeReplay.wal.exists, false);
    assert.equal(beforeReplay.shm.exists, false);
    assert.notEqual(beforeReplay.main.sha256, EXPECTED_SOURCE_SHA256);
    for (const key of PHASE612_BATCH_KEYS) {
      await withCheckpointedClient(copy, async (client) => {
        const replay = await applyPhase612ExternalGapBatch(
          client,
          applyOptions,
          key,
        );
        assert.equal(replay.batch, key);
        assert.equal(replay.entities.length, EXPECTED_BATCH_SHAPES[key].packs);
        assert.ok(
          replay.entities.every(({ outcome }) => outcome === "noop"),
          `Batch ${key} must be a replay noop.`,
        );
        assert.deepEqual(replay.publicDelta, { brands: 0, pens: 0 });
        assert.deepEqual(
          await publicCounts(client),
          EXPECTED_FINAL_PUBLIC_COUNTS,
        );
        assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
      });
      assertCatalogSnapshotUnchanged(beforeReplay);
      assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
    }
  } finally {
    removeOwnedCopy(copy);
    assertProtectedCatalogsUnchanged(sourceSnapshot, realSnapshot);
  }
});
