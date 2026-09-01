import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { type Client, createClient } from "@libsql/client";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  type ApplyPhase22Result,
  applyCuratedContentPacks,
  validatePack,
} from "./apply-phase22-content";
import {
  type CuratedEntityPack,
  type LoadedCuratedEntityPack,
  loadCuratedEntityPack,
} from "./lib/curated-content-pack";

export const PHASE612_BATCH_KEYS = ["A", "B", "C", "D", "E"] as const;
export type Phase612BatchKey = (typeof PHASE612_BATCH_KEYS)[number];

export const PHASE612_EXPECTED_SOURCE_SHA256 =
  "92d3d9512efdd00505c3314957729c1889cd9baf3485d2afa4a66ca5874addd4";
export const PHASE612_EXPECTED_REAL_SHA256 =
  "acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a";
export const PHASE612_EXPECTED_TOTALS = {
  groups: 23,
  packs: 57,
  existingBrands: 12,
  newBrands: 11,
  newPens: 34,
} as const;

type Phase612Group = {
  brand: CuratedEntityPack;
  pens: CuratedEntityPack[];
};

type Phase612BatchDefinitions = {
  groups: Phase612Group[];
  packs: CuratedEntityPack[];
  baseBrands: CuratedEntityPack[];
};

function preparedSource(pack: Pick<CuratedEntityPack, "key">): string {
  return `phase612-prepared:${pack.key}`;
}

export interface ApplyPhase612Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogs: readonly {
    path: string;
    snapshot: CatalogSnapshot;
  }[];
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase612Result {
  batch: Phase612BatchKey;
  entities: ApplyPhase22Result["entities"];
  publicDelta: { brands: number; pens: number };
}

const REMOTE_KEYS = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "FPKG_DATABASE_URL",
] as const;

const EXPECTED_SHAPES: Record<
  Phase612BatchKey,
  { groups: number; packs: number; brands: number; pens: number }
> = {
  A: { groups: 5, packs: 11, brands: 5, pens: 6 },
  B: { groups: 6, packs: 12, brands: 6, pens: 6 },
  C: { groups: 5, packs: 12, brands: 5, pens: 7 },
  D: { groups: 5, packs: 11, brands: 5, pens: 6 },
  E: { groups: 2, packs: 11, brands: 2, pens: 9 },
};

const EXPECTED_PREFIX_COUNTS = [
  { prefix: 0, brands: 121, pens: 740 },
  { prefix: 1, brands: 126, pens: 746 },
  { prefix: 2, brands: 132, pens: 752 },
  { prefix: 3, brands: 132, pens: 759 },
  { prefix: 4, brands: 132, pens: 765 },
  { prefix: 5, brands: 132, pens: 774 },
] as const;

const PHASE609_PUBLIC_MEMBERSHIP_SHA256 =
  "5b2d8cd5bf2e6b1374b49ac44b570a9a73ec8a4adfe6d882de0c77a8c79131ea";
const PHASE609_PUBLIC_PEN_TOPOLOGY_SHA256 =
  "10bed47be34a9965b7119e9152d307936ebb2b4fe54c363fa65f7f818da25a42";

const ISOLATED_MEDIA_SOURCES = [
  {
    brandId: "Zt-PbXkE7UHM",
    priorKey: "pilot-vanishing-point-commons",
    phase612Key: "phase612-c-pilot-pilot-vanishing-point-commons",
    registryKey: "phase612-c-pilot-pilot-vanishing-point-commons-registry",
  },
  {
    brandId: "ce2dcqixqSCx",
    priorKey: "sailor-brand-site-original",
    phase612Key: "phase612-c-sailor-sailor-brand-site-original",
    registryKey: "phase612-c-sailor-sailor-brand-site-original-registry",
  },
  {
    brandId: "mRz7MvzUYwVF",
    priorKey: "kaweco-commons-special-media",
    phase612Key: "phase612-c-kaweco-kaweco-commons-special-media",
    registryKey: "phase612-c-kaweco-kaweco-commons-special-media-registry",
  },
  {
    brandId: "5BZDt2fQusMf",
    priorKey: "phase49-visconti-brand-svg",
    phase612Key: "phase612-d-visconti-phase49-brand-svg",
    registryKey: "phase612-d-visconti-editorial-registry",
  },
  {
    brandId: "tVXnzDSFCcPP",
    priorKey: "phase62-sheaffer-brand-svg",
    phase612Key: "phase612-e-sheaffer-phase62-brand-svg",
    registryKey: "phase612-e-sheaffer-editorial-registry",
  },
] as const;

const ALLOWED_BRAND_COPY_REFRESHES = new Map([
  [
    "tVXnzDSFCcPP",
    {
      priorMarkdownFile:
        ".planning/content-research/sheaffer-brand-phase446.md",
      currentMarkdownFile:
        ".planning/content-research/phase612-e-sheaffer-brand-navigation.md",
    },
  ],
]);

const EXISTING_BRAND_PRIOR_SOURCES = new Map<string, string>([
  [
    "Zt-PbXkE7UHM",
    "curated-content:phase425-pilot-brand-depth-refresh-v1:1d681d3bcfba1b76b7c0cb05139e2b1cc1c270964fb24c49908754ee8ceeb301",
  ],
  [
    "lMGfoMjegnv8",
    "curated-content:phase439-namiki-brand-depth-refresh-v1:49e08038a2e740af354fcffd2c771112077607274b30e1000c5c5004a527bda0",
  ],
  [
    "ce2dcqixqSCx",
    "curated-content:phase425-sailor-brand-depth-refresh-v1:bbf12e9a2547a91b1fcc2c694b584cd020e90d9bde9a990fb5717fc4b1634a2f",
  ],
  [
    "phase307-brand-graf-von-faber-castell",
    "curated-content:phase430-graf-von-faber-castell-brand-depth-refresh-v1:ba3705b958cd24dcaddb9ae200fc35f0f9273be33278baa2e2849269e1363620",
  ],
  [
    "mRz7MvzUYwVF",
    "curated-content:phase139-kaweco-brand-v2:588af59f72976e3fba259acfa269394940517073581a1248c685683c56b5ee85",
  ],
  [
    "5BZDt2fQusMf",
    "curated-content:phase427-visconti-brand-depth-refresh-v1:5672f220e45ccc795b185009e62bc8e61063653646e5deb633f040fd73b07fae",
  ],
  [
    "phase145-waldmann-brand",
    "curated-content:phase437-waldmann-brand-depth-refresh-v1:6b07f11812ac70a4c095b04f24a5a6ec1f3ed53106cf4e45a5418b17e396c296",
  ],
  [
    "phase140-brand-stipula",
    "curated-content:phase428-stipula-brand-depth-refresh-v1:28be815d8da40fa45266c0dcce1a2c15d141639fe800567fdcf2640144d95bfe",
  ],
  [
    "b6DYMF38zz1B",
    "curated-content:phase441-esterbrook-brand-depth-refresh-v1:8ba21a088bc73f4142bbe59efc08eb82374b984b8f2860cc114ec9e3e1787a6b",
  ],
  [
    "phase605-brand-ferris-wheel-press",
    "curated-content:phase605-ferris-brand-v1:3183e87afcd892d9d06dfd2be8f0d9015a230fee4dfc37bdefb0b51fd64949bb",
  ],
  [
    "2OpQMjam65SM",
    "curated-content:phase433-monteverde-brand-depth-refresh-v1:e17a0815c33f62c174580aba2b1a902b015a52840cb065c03232f8795763cbd3",
  ],
  [
    "tVXnzDSFCcPP",
    "curated-content:phase446-sheaffer-brand-depth-v1:723213d023da062f8acf564050b0829adb2d0d05ac903725a234a17236e1f7ee",
  ],
]);

function unwrapRuntimeModule<T extends object>(value: T): T {
  let current: T = value;
  const seen = new Set<object>();
  while (
    "default" in current &&
    (current as T & { default?: unknown }).default &&
    typeof (current as T & { default?: unknown }).default === "object" &&
    !seen.has(current)
  ) {
    seen.add(current);
    current = (current as T & { default: T }).default;
  }
  return current;
}

async function loadBatchDefinitions(
  batchKey: Phase612BatchKey,
): Promise<Phase612BatchDefinitions> {
  switch (batchKey) {
    case "A": {
      const module = unwrapRuntimeModule(
        await import("./data/phase612-external-gap-batch-a"),
      );
      return {
        groups: module.phase612BatchAGroups,
        packs: module.phase612BatchAPacks,
        baseBrands: [],
      };
    }
    case "B": {
      const module = unwrapRuntimeModule(
        await import("./data/phase612-external-gap-batch-b"),
      );
      return {
        groups: module.phase612BatchBGroups,
        packs: module.phase612BatchBPacks,
        baseBrands: [],
      };
    }
    case "C": {
      const module = unwrapRuntimeModule(
        await import("./data/phase612-external-gap-batch-c"),
      );
      return {
        groups: module.phase612BatchCGroups,
        packs: module.phase612BatchCPacks,
        baseBrands: module.phase612BatchCBaseBrands,
      };
    }
    case "D": {
      const module = unwrapRuntimeModule(
        await import("./data/phase612-external-gap-batch-d"),
      );
      return {
        groups: module.phase612BatchDGroups,
        packs: module.phase612BatchDPacks,
        baseBrands: module.phase612BatchDBaseBrands,
      };
    }
    case "E": {
      const module = unwrapRuntimeModule(
        await import("./data/phase612-external-gap-batch-e"),
      );
      return {
        groups: module.phase612BatchEGroups,
        packs: module.phase612BatchEPacks,
        baseBrands: module.phase612BatchEBaseBrands,
      };
    }
  }
}

async function loadAllBatchDefinitions(): Promise<
  Record<Phase612BatchKey, Phase612BatchDefinitions>
> {
  const entries = await Promise.all(
    PHASE612_BATCH_KEYS.map(
      async (key) => [key, await loadBatchDefinitions(key)] as const,
    ),
  );
  return Object.fromEntries(entries) as Record<
    Phase612BatchKey,
    Phase612BatchDefinitions
  >;
}

export async function loadPhase612BatchDefinitionsForTest(
  batchKey: Phase612BatchKey,
): Promise<{ groups: Phase612Group[]; packs: CuratedEntityPack[] }> {
  return loadBatchDefinitions(batchKey);
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of REMOTE_KEYS) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 612 refuses inherited remote selector ${key}.`);
    }
  }
}

function assertNoNonEmptySidecars(databasePath: string): void {
  for (const suffix of ["-wal", "-shm"] as const) {
    const companion = `${databasePath}${suffix}`;
    if (fs.existsSync(companion) && fs.statSync(companion).size > 0) {
      throw new Error(
        `Phase 612 refuses non-empty SQLite companion ${companion}.`,
      );
    }
  }
}

async function assertOwnedAuthority(
  client: Client,
  options: ApplyPhase612Options,
): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim())
    throw new Error("Phase 612 reviewer is required.");
  if (options.protectedCatalogs.length !== 2) {
    throw new Error("Phase 612 requires source and real protected catalogs.");
  }
  const [sourceCatalog, realCatalog] = options.protectedCatalogs;
  if (
    !sourceCatalog ||
    !realCatalog ||
    sourceCatalog.snapshot.sourcePath === realCatalog.snapshot.sourcePath ||
    sourceCatalog.snapshot.main.sha256 !== PHASE612_EXPECTED_SOURCE_SHA256 ||
    realCatalog.snapshot.main.sha256 !== PHASE612_EXPECTED_REAL_SHA256 ||
    sourceCatalog.snapshot.wal.exists ||
    sourceCatalog.snapshot.shm.exists ||
    realCatalog.snapshot.wal.exists ||
    realCatalog.snapshot.shm.exists
  ) {
    throw new Error(
      "Phase 612 requires the exact no-sidecar Phase 609 source and real catalog families.",
    );
  }
  for (const protectedCatalog of options.protectedCatalogs) {
    const protectedPath = fs.realpathSync.native(protectedCatalog.path);
    if (
      protectedPath !== protectedCatalog.snapshot.sourcePath ||
      protectedCatalog.snapshot.main.realPath !==
        protectedCatalog.snapshot.sourcePath
    ) {
      throw new Error(
        "Phase 612 protected catalog path does not match its frozen snapshot.",
      );
    }
    assertCatalogSnapshotUnchanged(protectedCatalog.snapshot);
  }
  assertNoNonEmptySidecars(options.databasePath);

  const lstat = fs.lstatSync(options.databasePath);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    lstat.isSymbolicLink() ||
    !inside(databasePath, ownedRoot)
  ) {
    throw new Error(
      "Phase 612 requires a non-symlink catalog inside caller-owned root.",
    );
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  if (owned.nlink !== BigInt(1)) {
    throw new Error(
      "Phase 612 refuses catalog files with multiple hard links.",
    );
  }
  for (const protectedCatalog of options.protectedCatalogs) {
    const protectedPath = fs.realpathSync.native(protectedCatalog.path);
    const protectedStat = fs.statSync(protectedPath, { bigint: true });
    if (
      databasePath === protectedPath ||
      (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
    ) {
      throw new Error(
        "Phase 612 refuses protected catalogs and hard-link aliases.",
      );
    }
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (
    !main?.file ||
    fs.realpathSync.native(String(main.file)) !== databasePath
  ) {
    throw new Error(
      "Phase 612 client is not bound to the authorized owned copy.",
    );
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 612 owned copy must be migrated through 032.");
  }
  return workspaceRoot;
}

function validateGlobalManifest(
  batches: Record<
    Phase612BatchKey,
    { groups: Phase612Group[]; packs: CuratedEntityPack[] }
  >,
): void {
  const allPacks = PHASE612_BATCH_KEYS.flatMap((key) => batches[key].packs);
  const allGroups = PHASE612_BATCH_KEYS.flatMap((key) => batches[key].groups);
  const uniqueIds = new Set(allPacks.map((pack) => pack.entityId));
  const brandIds = new Set(
    allPacks
      .filter((pack) => pack.expectedType === "brand")
      .map((pack) => pack.entityId),
  );
  const penIds = new Set(
    allPacks
      .filter((pack) => pack.expectedType === "pen")
      .map((pack) => pack.entityId),
  );
  const slugs = new Set(allPacks.map((pack) => pack.expectedSlug));
  const keys = new Set(allPacks.map((pack) => pack.key));
  const existingBrandIds = new Set(EXISTING_BRAND_PRIOR_SOURCES.keys());
  const newBrandIds = [...brandIds].filter((id) => !existingBrandIds.has(id));
  if (
    allGroups.length !== PHASE612_EXPECTED_TOTALS.groups ||
    allPacks.length !== PHASE612_EXPECTED_TOTALS.packs ||
    uniqueIds.size !== PHASE612_EXPECTED_TOTALS.packs ||
    slugs.size !== PHASE612_EXPECTED_TOTALS.packs ||
    keys.size !== PHASE612_EXPECTED_TOTALS.packs ||
    brandIds.size !==
      PHASE612_EXPECTED_TOTALS.existingBrands +
        PHASE612_EXPECTED_TOTALS.newBrands ||
    penIds.size !== PHASE612_EXPECTED_TOTALS.newPens ||
    newBrandIds.length !== PHASE612_EXPECTED_TOTALS.newBrands ||
    newBrandIds.some((id) => !id.startsWith("phase612-")) ||
    [...penIds].some((id) => !id.startsWith("phase612-")) ||
    [...EXISTING_BRAND_PRIOR_SOURCES.keys()].some((id) => !brandIds.has(id))
  ) {
    throw new Error(
      "Phase 612 requires exactly 23 brand groups, 12 existing brands and 34 new pens.",
    );
  }
  const claimed = new Map<string, string>();
  for (const pack of allPacks) {
    for (const surface of [
      pack.canonicalName,
      ...pack.aliases.map(({ alias }) => alias),
    ]) {
      const normalized = surface.trim().toLocaleLowerCase("en");
      const owner = claimed.get(normalized);
      if (owner && owner !== pack.entityId) {
        throw new Error(`Phase 612 manifest surface collision: ${surface}.`);
      }
      claimed.set(normalized, pack.entityId);
    }
  }
  for (const key of PHASE612_BATCH_KEYS) {
    const expected = EXPECTED_SHAPES[key];
    const batch = batches[key];
    const groupedPacks = batch.groups.flatMap((group) => [
      group.brand,
      ...group.pens,
    ]);
    const groupedIds = groupedPacks.map((pack) => pack.entityId);
    const packIds = batch.packs.map((pack) => pack.entityId);
    const packById = new Map(
      batch.packs.map((pack) => [pack.entityId, pack] as const),
    );
    const groupedBrandIds = batch.groups.map((group) => group.brand.entityId);
    if (
      batch.groups.length !== expected.groups ||
      batch.packs.length !== expected.packs ||
      batch.packs.filter((pack) => pack.expectedType === "brand").length !==
        expected.brands ||
      batch.packs.filter((pack) => pack.expectedType === "pen").length !==
        expected.pens ||
      groupedPacks.length !== batch.packs.length ||
      new Set(groupedIds).size !== groupedIds.length ||
      new Set(groupedBrandIds).size !== groupedBrandIds.length ||
      JSON.stringify([...groupedIds].sort()) !==
        JSON.stringify([...packIds].sort()) ||
      groupedPacks.some((pack) => packById.get(pack.entityId) !== pack) ||
      batch.groups.some(
        (group) =>
          group.brand.expectedType !== "brand" ||
          group.pens.length === 0 ||
          group.pens.some(
            (pen) =>
              pen.expectedType !== "pen" ||
              pen.spec?.brandEntityId !== group.brand.entityId,
          ),
      )
    ) {
      throw new Error(
        `Phase 612 batch ${key} shape or maker manifest mismatch.`,
      );
    }
  }
}

function cloneInvariant(pack: CuratedEntityPack): Record<string, unknown> {
  const copy = structuredClone(pack) as unknown as Record<string, unknown>;
  delete copy.key;
  delete copy.sources;
  delete copy.scopes;
  delete copy.claims;
  return copy;
}

function assertAppendOnly<T>(
  base: readonly T[],
  current: readonly T[],
  label: string,
): readonly T[] {
  if (
    current.length < base.length ||
    !isDeepStrictEqual(current.slice(0, base.length), base)
  ) {
    throw new Error(`Phase 612 existing brand ${label} is not append-only.`);
  }
  return current.slice(base.length);
}

function normalizedBaseForClone(
  base: CuratedEntityPack,
  current: CuratedEntityPack,
): CuratedEntityPack {
  const clone = structuredClone(base);
  const copyRefresh = ALLOWED_BRAND_COPY_REFRESHES.get(current.entityId);
  if (copyRefresh) {
    if (
      base.markdownFile !== copyRefresh.priorMarkdownFile ||
      current.markdownFile !== copyRefresh.currentMarkdownFile
    ) {
      throw new Error(
        `Phase 612 unexpected brand copy refresh: ${current.entityId}.`,
      );
    }
    clone.markdownFile = current.markdownFile;
  }
  for (const isolation of ISOLATED_MEDIA_SOURCES) {
    if (isolation.brandId !== current.entityId) continue;
    const currentSource = current.sources.find(
      (source) => source.key === isolation.phase612Key,
    );
    const source = clone.sources.find(
      (candidate) => candidate.key === isolation.priorKey,
    );
    if (
      !currentSource ||
      !source ||
      currentSource.registryKey !== isolation.registryKey ||
      currentSource.independenceGroup !== isolation.registryKey
    ) {
      throw new Error(
        `Phase 612 isolated media source mismatch: ${current.entityId}.`,
      );
    }
    source.key = currentSource.key;
    source.registryKey = currentSource.registryKey;
    source.independenceGroup = currentSource.independenceGroup;
    for (const media of clone.media) {
      if (media.sourceKey === isolation.priorKey) {
        media.sourceKey = currentSource.key;
      }
    }
  }
  return clone;
}

function uniqueSources(
  sources: readonly CuratedEntityPack["sources"][number][],
): CuratedEntityPack["sources"] {
  const unique: CuratedEntityPack["sources"] = [];
  const byKey = new Map<string, CuratedEntityPack["sources"][number]>();
  for (const source of sources) {
    const prior = byKey.get(source.key);
    if (prior && !isDeepStrictEqual(prior, source)) {
      throw new Error(`Phase 612 conflicting source key: ${source.key}.`);
    }
    if (!prior) {
      byKey.set(source.key, source);
      unique.push(source);
    }
  }
  return unique;
}

function assertExistingBrandClones(
  batchKey: Phase612BatchKey,
  batch: Phase612BatchDefinitions,
): void {
  if (batchKey === "A" || batchKey === "B") {
    if (batch.baseBrands.length !== 0) {
      throw new Error(
        `Phase 612 batch ${batchKey} must not declare base brands.`,
      );
    }
    return;
  }
  const currentById = new Map(
    batch.groups.map((group) => [group.brand.entityId, group] as const),
  );
  if (
    batch.baseBrands.length !== batch.groups.length ||
    new Set(batch.baseBrands.map((brand) => brand.entityId)).size !==
      batch.baseBrands.length
  ) {
    throw new Error(
      `Phase 612 batch ${batchKey} base brand map is incomplete.`,
    );
  }
  for (const rawBase of batch.baseBrands) {
    const group = currentById.get(rawBase.entityId);
    if (!group) {
      throw new Error(
        `Phase 612 base brand is not represented: ${rawBase.entityId}.`,
      );
    }
    const current = group.brand;
    const base = normalizedBaseForClone(rawBase, current);
    if (!isDeepStrictEqual(cloneInvariant(current), cloneInvariant(base))) {
      throw new Error(
        `Phase 612 existing brand changed canonical payload: ${current.entityId}.`,
      );
    }
    const sourceTail = assertAppendOnly(
      base.sources,
      current.sources,
      "sources",
    );
    const scopeTail = assertAppendOnly(base.scopes, current.scopes, "scopes");
    const claimTail = assertAppendOnly(base.claims, current.claims, "claims");
    const expectedTailCount = batchKey === "E" ? group.pens.length : 1;
    if (
      scopeTail.length !== expectedTailCount ||
      claimTail.length !== expectedTailCount ||
      claimTail.some(
        (claim) =>
          !["series_navigation", "brand_model_navigation"].includes(
            claim.predicate,
          ),
      ) ||
      group.pens.some(
        (pen) =>
          !claimTail.some((claim) =>
            claim.objectText.includes(pen.canonicalName),
          ),
      )
    ) {
      throw new Error(
        `Phase 612 existing brand navigation mismatch: ${current.entityId}.`,
      );
    }
    const expectedSourceKeys = new Set(
      group.pens.flatMap((pen) =>
        pen.sources
          .filter((source) =>
            batchKey === "E"
              ? source.sourceType === "official"
              : source.sourceType !== "user_submission",
          )
          .map((source) => source.key),
      ),
    );
    const baseKeys = new Set(base.sources.map((source) => source.key));
    const expectedSourceTail = uniqueSources(
      group.pens.flatMap((pen) =>
        pen.sources.filter((source) =>
          batchKey === "E"
            ? source.sourceType === "official"
            : source.sourceType !== "user_submission",
        ),
      ),
    ).filter((source) => !baseKeys.has(source.key));
    if (
      expectedSourceKeys.size < expectedSourceTail.length ||
      !isDeepStrictEqual(sourceTail, expectedSourceTail)
    ) {
      throw new Error(
        `Phase 612 existing brand appended unexpected model sources: ${current.entityId}.`,
      );
    }
  }
}

type LoadedPhase612Batch = {
  groups: Array<{
    brand: LoadedCuratedEntityPack;
    pens: LoadedCuratedEntityPack[];
  }>;
  packs: LoadedCuratedEntityPack[];
};

function curatedDefinition(pack: LoadedCuratedEntityPack): CuratedEntityPack {
  const {
    summary: _summary,
    bodyMd: _bodyMd,
    markdownSpecs: _markdownSpecs,
    digest: _digest,
    sourceMarker: _sourceMarker,
    ...definition
  } = pack;
  return definition;
}

async function loadBatch(
  workspaceRoot: string,
  batchKey: Phase612BatchKey,
): Promise<{
  groups: Array<{
    brand: LoadedCuratedEntityPack;
    pens: LoadedCuratedEntityPack[];
  }>;
  packs: LoadedCuratedEntityPack[];
  batches: Record<Phase612BatchKey, LoadedPhase612Batch>;
}> {
  const definitions = await loadAllBatchDefinitions();
  validateGlobalManifest(definitions);
  for (const key of ["C", "D", "E"] as const) {
    assertExistingBrandClones(key, definitions[key]);
  }
  const loaded = new Map<string, LoadedCuratedEntityPack>();
  for (const key of PHASE612_BATCH_KEYS) {
    for (const pack of definitions[key].packs) {
      const value = loadCuratedEntityPack(workspaceRoot, pack);
      validatePack(workspaceRoot, value);
      loaded.set(value.entityId, value);
    }
  }
  const loadedBatches = Object.fromEntries(
    PHASE612_BATCH_KEYS.map((key) => {
      const packs = definitions[key].packs.map((pack) => {
        const value = loaded.get(pack.entityId);
        if (!value) {
          throw new Error(
            `Phase 612 batch ${key} loaded pack map is incomplete.`,
          );
        }
        return value;
      });
      const groups = definitions[key].groups.map((group) => {
        const brand = loaded.get(group.brand.entityId);
        const pens = group.pens.map((pen) => loaded.get(pen.entityId));
        if (!brand || pens.some((pen) => !pen)) {
          throw new Error(
            `Phase 612 batch ${key} loaded group map is incomplete.`,
          );
        }
        return { brand, pens: pens as LoadedCuratedEntityPack[] };
      });
      return [key, { groups, packs }] as const;
    }),
  ) as Record<Phase612BatchKey, LoadedPhase612Batch>;
  return { ...loadedBatches[batchKey], batches: loadedBatches };
}

async function assertIdentityPreflight(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  for (const pack of packs) {
    const direct = await client.execute({
      sql: `SELECT id,type,slug,name,source FROM entities
            WHERE id=? OR slug=? OR lower(name)=lower(?) ORDER BY id`,
      args: [pack.entityId, pack.expectedSlug, pack.canonicalName],
    });
    if (direct.rows.length > 1) {
      throw new Error(`Phase 612 identity collision: ${pack.expectedSlug}.`);
    }
    const row = direct.rows[0];
    const existingBrandSource = EXISTING_BRAND_PRIOR_SOURCES.get(pack.entityId);
    if (existingBrandSource && !row) {
      throw new Error(`Phase 612 existing brand is missing: ${pack.entityId}.`);
    }
    if (row) {
      if (
        String(row.id) !== pack.entityId ||
        String(row.type) !== pack.expectedType ||
        String(row.slug) !== pack.expectedSlug ||
        String(row.name) !== pack.canonicalName
      ) {
        throw new Error(`Phase 612 identity collision: ${pack.expectedSlug}.`);
      }
      const actualSource = String(row.source ?? "");
      const allowedSources = existingBrandSource
        ? new Set([existingBrandSource, pack.sourceMarker])
        : new Set([preparedSource(pack), pack.sourceMarker]);
      if (!allowedSources.has(actualSource)) {
        throw new Error(
          `Phase 612 source ownership mismatch: ${pack.entityId}.`,
        );
      }
    }
    for (const surface of [
      { alias: pack.canonicalName, kind: "canonical name" },
      ...pack.aliases.map(({ alias }) => ({ alias, kind: "alias" })),
    ]) {
      const collision = await client.execute({
        sql: `SELECT id,'entity' AS surface FROM entities
              WHERE lower(name)=lower(?) AND id<>?
              UNION ALL
              SELECT entity_id AS id,'alias' AS surface FROM entity_aliases
              WHERE lower(alias)=lower(?) AND entity_id<>?`,
        args: [surface.alias, pack.entityId, surface.alias, pack.entityId],
      });
      if (collision.rows.length > 0) {
        throw new Error(
          `Phase 612 ${surface.kind} collision: ${surface.alias}.`,
        );
      }
    }
  }
}

async function assertTargetTopologyPreflight(
  client: Client,
  groups: LoadedPhase612Batch["groups"],
): Promise<void> {
  for (const { brand, pens } of groups) {
    for (const pen of pens) {
      const entity = await client.execute({
        sql: "SELECT 1 FROM entities WHERE id=?",
        args: [pen.entityId],
      });
      if (entity.rows.length === 0) continue;
      const topology = await client.execute({
        sql: `SELECT
                (SELECT count(*) FROM entity_links WHERE source_id=? AND link_type='made_by') AS maker_total,
                (SELECT count(*) FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by') AS maker,
                (SELECT count(*) FROM entity_links WHERE target_id=? AND link_type='reverse') AS reverse_total,
                (SELECT count(*) FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse') AS reverse`,
        args: [
          pen.entityId,
          pen.entityId,
          brand.entityId,
          pen.entityId,
          brand.entityId,
          pen.entityId,
        ],
      });
      const row = topology.rows[0];
      const makerTotal = Number(row?.maker_total);
      const reverseTotal = Number(row?.reverse_total);
      if (
        (makerTotal !== 0 && (makerTotal !== 1 || Number(row?.maker) !== 1)) ||
        (reverseTotal !== 0 &&
          (reverseTotal !== 1 || Number(row?.reverse) !== 1))
      ) {
        throw new Error(
          `Phase 612 target reverse topology is ambiguous: ${pen.entityId}.`,
        );
      }
    }
  }
}

function sha256Lines(lines: readonly string[]): string {
  return createHash("sha256")
    .update(lines.length === 0 ? "" : `${lines.join("\n")}\n`)
    .digest("hex");
}

function fileSha256(file: string): string {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function prefixMarkerKey(batchKey: Phase612BatchKey): string {
  return `phase612-external-gap-batch-${batchKey}-v1`;
}

function prefixMarkerChecksum(
  batchKey: Phase612BatchKey,
  batch: LoadedPhase612Batch,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        batchKey,
        source: PHASE612_EXPECTED_SOURCE_SHA256,
        packs: batch.packs.map((pack) => [pack.entityId, pack.sourceMarker]),
      }),
    )
    .digest("hex");
}

async function baselinePublicMembershipHash(
  client: Client,
  allBatches: Record<Phase612BatchKey, LoadedPhase612Batch>,
): Promise<string> {
  const newIds = PHASE612_BATCH_KEYS.flatMap((key) =>
    allBatches[key].packs
      .filter(
        (pack) =>
          pack.expectedType === "pen" ||
          !EXISTING_BRAND_PRIOR_SOURCES.has(pack.entityId),
      )
      .map((pack) => pack.entityId),
  );
  const result = await client.execute({
    sql: `SELECT id,type FROM public_entities
          WHERE id NOT IN (${newIds.map(() => "?").join(",")})
          ORDER BY id,type`,
    args: newIds,
  });
  return sha256Lines(
    result.rows.map((row) => `${String(row.id)}\t${String(row.type)}`),
  );
}

async function baselinePublicPenTopologyHash(
  client: Client,
  allBatches: Record<Phase612BatchKey, LoadedPhase612Batch>,
): Promise<string> {
  const penIds = PHASE612_BATCH_KEYS.flatMap((key) =>
    allBatches[key].packs
      .filter((pack) => pack.expectedType === "pen")
      .map((pack) => pack.entityId),
  );
  const result = await client.execute({
    sql: `SELECT pen.id,
            COALESCE((
              SELECT group_concat(target_id,'|') FROM (
                SELECT target_id FROM entity_links
                WHERE source_id=pen.id AND link_type='made_by'
                ORDER BY target_id
              )
            ),'') AS makers,
            COALESCE((
              SELECT group_concat(source_id,'|') FROM (
                SELECT source_id FROM entity_links
                WHERE target_id=pen.id AND link_type='reverse'
                ORDER BY source_id
              )
            ),'') AS reverses
          FROM public_entities pen
          WHERE pen.type='pen'
            AND pen.id NOT IN (${penIds.map(() => "?").join(",")})
          ORDER BY pen.id`,
    args: penIds,
  });
  return sha256Lines(
    result.rows.map(
      (row) =>
        `${String(row.id)}\t${String(row.makers ?? "")}\t${String(row.reverses ?? "")}`,
    ),
  );
}

async function assertCandidatePrefix(
  client: Client,
  databasePath: string,
  allBatches: Record<Phase612BatchKey, LoadedPhase612Batch>,
  selectedBatch: Phase612BatchKey,
): Promise<number> {
  const counts = await publicCounts(client);
  const candidates = EXPECTED_PREFIX_COUNTS.filter(
    (candidate) =>
      candidate.brands === counts.brands && candidate.pens === counts.pens,
  );
  if (candidates.length !== 1) {
    throw new Error("Phase 612 candidate is not a recognized batch prefix.");
  }
  const prefix = candidates[0]?.prefix;
  if (prefix === undefined) {
    throw new Error("Phase 612 candidate prefix is missing.");
  }
  const selectedIndex = PHASE612_BATCH_KEYS.indexOf(selectedBatch);
  if (selectedIndex > prefix) {
    throw new Error(
      `Phase 612 batch prefix gap: cannot apply ${selectedBatch} after prefix ${prefix}.`,
    );
  }
  if (
    prefix === 0 &&
    fileSha256(databasePath) !== PHASE612_EXPECTED_SOURCE_SHA256
  ) {
    throw new Error(
      "Phase 612 fresh candidate does not match the frozen source.",
    );
  }

  const phaseSources = await client.execute(
    `SELECT id,source FROM entities
     WHERE source LIKE 'phase612-prepared:%'
        OR source LIKE 'curated-content:phase612-%'
     ORDER BY id`,
  );
  const allowedTargetIds = new Set(
    PHASE612_BATCH_KEYS.flatMap((key) =>
      allBatches[key].packs.map((pack) => pack.entityId),
    ),
  );
  if (
    phaseSources.rows.some((row) => !allowedTargetIds.has(String(row.id))) ||
    phaseSources.rows.some((row) =>
      String(row.source ?? "").startsWith("phase612-prepared:"),
    )
  ) {
    throw new Error("Phase 612 candidate contains stray or prepared entities.");
  }

  const markers = await client.execute({
    sql: `SELECT source_key,source_checksum,status FROM taxonomy_batches
          WHERE source_key LIKE 'phase612-external-gap-batch-%'
          ORDER BY source_key`,
  });
  const expectedMarkers = PHASE612_BATCH_KEYS.slice(0, prefix).map((key) => ({
    sourceKey: prefixMarkerKey(key),
    checksum: prefixMarkerChecksum(key, allBatches[key]),
  }));
  if (
    markers.rows.length !== expectedMarkers.length ||
    expectedMarkers.some((expected) => {
      const row = markers.rows.find(
        (candidate) => String(candidate.source_key) === expected.sourceKey,
      );
      return (
        !row ||
        String(row.source_checksum) !== expected.checksum ||
        String(row.status) !== "applied"
      );
    })
  ) {
    throw new Error("Phase 612 candidate marker prefix is invalid.");
  }

  if (
    (await baselinePublicMembershipHash(client, allBatches)) !==
      PHASE609_PUBLIC_MEMBERSHIP_SHA256 ||
    (await baselinePublicPenTopologyHash(client, allBatches)) !==
      PHASE609_PUBLIC_PEN_TOPOLOGY_SHA256
  ) {
    throw new Error(
      "Phase 612 candidate changed baseline public membership or pen topology.",
    );
  }

  const expectedPublicNewIds = new Set(
    PHASE612_BATCH_KEYS.slice(0, prefix).flatMap((key) =>
      allBatches[key].packs
        .filter(
          (pack) =>
            pack.expectedType === "pen" ||
            !EXISTING_BRAND_PRIOR_SOURCES.has(pack.entityId),
        )
        .map((pack) => pack.entityId),
    ),
  );
  const allNewIds = PHASE612_BATCH_KEYS.flatMap((key) =>
    allBatches[key].packs
      .filter(
        (pack) =>
          pack.expectedType === "pen" ||
          !EXISTING_BRAND_PRIOR_SOURCES.has(pack.entityId),
      )
      .map((pack) => pack.entityId),
  );
  const allPacks = PHASE612_BATCH_KEYS.flatMap((key) => allBatches[key].packs);
  const allTargetIds = allPacks.map((pack) => pack.entityId);
  const publicTargets = await client.execute({
    sql: `SELECT id FROM public_entities
          WHERE id IN (${allTargetIds.map(() => "?").join(",")}) ORDER BY id`,
    args: allTargetIds,
  });
  const publicTargetIds = new Set(
    publicTargets.rows.map((row) => String(row.id)),
  );
  if (
    !isDeepStrictEqual(
      allNewIds.filter((id) => publicTargetIds.has(id)).sort(),
      [...expectedPublicNewIds].sort(),
    )
  ) {
    throw new Error("Phase 612 candidate public target membership is invalid.");
  }

  const states = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,
                 publication.status,publication.blockers_json,
                 publication.approved_content_hash,
                 publication.content_revision,
                 publication.reviewed_content_revision,
                 publication.reviewed_contract_version
          FROM entities entity
          LEFT JOIN entity_publications publication
            ON publication.entity_id=entity.id
          WHERE entity.id IN (${allTargetIds.map(() => "?").join(",")})
          ORDER BY entity.id`,
    args: allTargetIds,
  });
  const stateById = new Map(
    states.rows.map((row) => [String(row.id), row] as const),
  );
  const reviewCounts = await client.execute({
    sql: `SELECT review.entity_id,count(*) AS review_count,
                 count(DISTINCT review.review_kind) AS review_kinds
          FROM entity_content_reviews review
          JOIN entity_publications publication
            ON publication.entity_id=review.entity_id
           AND publication.approved_content_hash=review.content_hash
          WHERE review.entity_id IN (${allTargetIds.map(() => "?").join(",")})
            AND review.status='approved'
            AND review.review_kind IN ('fact','language','media','publication')
          GROUP BY review.entity_id`,
    args: allTargetIds,
  });
  const reviewById = new Map(
    reviewCounts.rows.map((row) => [
      String(row.entity_id),
      {
        count: Number(row.review_count),
        kinds: Number(row.review_kinds),
      },
    ]),
  );
  const allPenIds = allPacks
    .filter((pack) => pack.expectedType === "pen")
    .map((pack) => pack.entityId);
  const topologyRows = await client.execute({
    sql: `SELECT source_id,target_id,link_type FROM entity_links
          WHERE (link_type='made_by'
                 AND source_id IN (${allPenIds.map(() => "?").join(",")}))
             OR (link_type='reverse'
                 AND target_id IN (${allPenIds.map(() => "?").join(",")}))
          ORDER BY link_type,source_id,target_id,id`,
    args: [...allPenIds, ...allPenIds],
  });
  const makerTargets = new Map<string, string[]>();
  const reverseSources = new Map<string, string[]>();
  for (const row of topologyRows.rows) {
    if (String(row.link_type) === "made_by") {
      const id = String(row.source_id);
      makerTargets.set(id, [
        ...(makerTargets.get(id) ?? []),
        String(row.target_id),
      ]);
    } else {
      const id = String(row.target_id);
      reverseSources.set(id, [
        ...(reverseSources.get(id) ?? []),
        String(row.source_id),
      ]);
    }
  }

  for (const [index, key] of PHASE612_BATCH_KEYS.entries()) {
    const applied = index < prefix;
    const makerByPen = new Map(
      allBatches[key].groups.flatMap(({ brand, pens }) =>
        pens.map((pen) => [pen.entityId, brand.entityId] as const),
      ),
    );
    for (const pack of allBatches[key].packs) {
      const row = stateById.get(pack.entityId);
      const reviews = reviewById.get(pack.entityId) ?? { count: 0, kinds: 0 };
      const existingBrandSource = EXISTING_BRAND_PRIOR_SOURCES.get(
        pack.entityId,
      );
      if (!applied) {
        if (!existingBrandSource) {
          if (row) {
            throw new Error(
              `Phase 612 future target already exists: ${pack.entityId}.`,
            );
          }
          continue;
        }
        if (
          !row ||
          String(row?.source) !== existingBrandSource ||
          !publicTargetIds.has(pack.entityId)
        ) {
          throw new Error(
            `Phase 612 future existing brand state mismatch: ${pack.entityId}.`,
          );
        }
        continue;
      }
      if (
        !row ||
        String(row?.type) !== pack.expectedType ||
        String(row?.slug) !== pack.expectedSlug ||
        String(row?.name) !== pack.canonicalName ||
        String(row?.source) !== pack.sourceMarker ||
        String(row?.status) !== "published" ||
        String(row?.blockers_json ?? "[]") !== "[]" ||
        !String(row?.approved_content_hash ?? "").startsWith("sha256:v3:") ||
        Number(row?.reviewed_content_revision) !==
          Number(row?.content_revision) ||
        Number(row?.reviewed_contract_version) !== 3 ||
        !publicTargetIds.has(pack.entityId) ||
        reviews.count !== 4 ||
        reviews.kinds !== 4
      ) {
        throw new Error(
          `Phase 612 applied target state mismatch: ${pack.entityId}.`,
        );
      }
      const makerId = makerByPen.get(pack.entityId);
      if (makerId) {
        const makers = makerTargets.get(pack.entityId) ?? [];
        const reverses = reverseSources.get(pack.entityId) ?? [];
        if (
          makers.length !== 1 ||
          makers[0] !== makerId ||
          reverses.length !== 1 ||
          reverses[0] !== makerId
        ) {
          throw new Error(
            `Phase 612 applied target topology mismatch: ${pack.entityId}.`,
          );
        }
      }
    }
  }
  return prefix;
}

async function recordPrefixMarker(
  client: Client,
  batchKey: Phase612BatchKey,
  batch: LoadedPhase612Batch,
): Promise<void> {
  const sourceKey = prefixMarkerKey(batchKey);
  const checksum = prefixMarkerChecksum(batchKey, batch);
  await client.execute({
    sql: `INSERT INTO taxonomy_batches(
            id,source_key,source_checksum,status,note
          ) VALUES(?,?,?,'applied',?)
          ON CONFLICT(source_key) DO NOTHING`,
    args: [
      stableId("phase612-batch", sourceKey),
      sourceKey,
      checksum,
      `Phase 612 ${batchKey} owned-checkpoint provenance marker.`,
    ],
  });
}

async function prepareIdentitiesAndTopology(
  client: Client,
  groups: Array<{
    brand: LoadedCuratedEntityPack;
    pens: LoadedCuratedEntityPack[];
  }>,
): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    for (const { brand, pens } of groups) {
      for (const pack of [brand, ...pens]) {
        const existing = await transaction.execute({
          sql: "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
          args: [pack.entityId, pack.expectedSlug],
        });
        if (existing.rows.length === 0) {
          await transaction.execute({
            sql: "INSERT INTO entities(id,type,slug,name,source) VALUES(?,?,?,?,?)",
            args: [
              pack.entityId,
              pack.expectedType,
              pack.expectedSlug,
              pack.canonicalName,
              preparedSource(pack),
            ],
          });
        } else {
          const row = existing.rows[0];
          if (
            existing.rows.length !== 1 ||
            String(row?.id) !== pack.entityId ||
            String(row?.type) !== pack.expectedType ||
            String(row?.slug) !== pack.expectedSlug ||
            String(row?.name) !== pack.canonicalName
          ) {
            throw new Error(
              `Phase 612 conflicting identity: ${pack.expectedSlug}.`,
            );
          }
        }
      }
      for (const pen of pens) {
        let maker = await transaction.execute({
          sql: "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
          args: [pen.entityId],
        });
        if (maker.rows.length === 0) {
          await transaction.execute({
            sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
            args: [
              stableId("phase612-made-by", pen.entityId),
              pen.entityId,
              brand.entityId,
              "Phase 612 verified canonical maker relation",
            ],
          });
          maker = await transaction.execute({
            sql: "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
            args: [pen.entityId],
          });
        }
        if (
          maker.rows.length !== 1 ||
          String(maker.rows[0]?.target_id) !== brand.entityId
        ) {
          throw new Error(
            `Phase 612 maker topology is ambiguous: ${pen.entityId}.`,
          );
        }
        const reverse = await transaction.execute({
          sql: "SELECT id,source_id FROM entity_links WHERE target_id=? AND link_type='reverse' ORDER BY id",
          args: [pen.entityId],
        });
        if (
          reverse.rows.length !== 1 ||
          String(reverse.rows[0]?.source_id) !== brand.entityId
        ) {
          throw new Error(
            `Phase 612 reverse topology is ambiguous: ${pen.entityId}.`,
          );
        }
      }
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
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
  return { brands: counts.get("brand") ?? 0, pens: counts.get("pen") ?? 0 };
}

async function protectedSiblingDigests(
  client: Client,
  groups: Array<{
    brand: LoadedCuratedEntityPack;
    pens: LoadedCuratedEntityPack[];
  }>,
): Promise<Map<string, string>> {
  const brandIds = groups.map(({ brand }) => brand.entityId);
  const targetIds = new Set(
    groups.flatMap(({ pens }) => pens.map(({ entityId }) => entityId)),
  );
  const result = await client.execute({
    sql: `SELECT entity.id,
            entity.source,
            publication.status AS publication_status,
            publication.blockers_json,
            publication.approved_content_hash,
            publication.content_revision,
            publication.reviewed_content_revision,
            publication.reviewed_contract_version,
            (SELECT count(*) FROM entity_links
              WHERE source_id=entity.id AND link_type='made_by') AS maker_total,
            COALESCE((SELECT group_concat(target_id,'|') FROM (
              SELECT target_id FROM entity_links
              WHERE source_id=entity.id AND link_type='made_by'
              ORDER BY target_id
            )),'') AS makers,
            (SELECT count(*) FROM entity_links
              WHERE target_id=entity.id AND link_type='reverse') AS reverse_total,
            COALESCE((SELECT group_concat(source_id,'|') FROM (
              SELECT source_id FROM entity_links
              WHERE target_id=entity.id AND link_type='reverse'
              ORDER BY source_id
            )),'') AS reverses,
            CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          JOIN entity_publications publication
            ON publication.entity_id=entity.id
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.type='pen'
            AND EXISTS (
              SELECT 1 FROM entity_links maker
              WHERE maker.source_id=entity.id
                AND maker.link_type='made_by'
                AND maker.target_id IN (${brandIds.map(() => "?").join(",")})
            )
          ORDER BY entity.id`,
    args: brandIds,
  });
  const digests = new Map<string, string>();
  for (const row of result.rows) {
    const id = String(row.id);
    if (!targetIds.has(id)) {
      if (
        Number(row.maker_total) !== 1 ||
        Number(row.reverse_total) !== 1 ||
        String(row.makers) !== String(row.reverses) ||
        Number(row.is_public) !== 1
      ) {
        throw new Error(
          `Phase 612 changed a protected sibling pen payload or reverse topology: ${id}.`,
        );
      }
      digests.set(
        id,
        JSON.stringify({
          source: String(row.source ?? ""),
          publicationStatus: String(row.publication_status ?? ""),
          blockersJson: String(row.blockers_json ?? ""),
          approvedContentHash: String(row.approved_content_hash ?? ""),
          contentRevision: Number(row.content_revision),
          reviewedContentRevision: Number(row.reviewed_content_revision),
          reviewedContractVersion: Number(row.reviewed_contract_version),
          makers: String(row.makers),
          reverses: String(row.reverses),
          isPublic: Number(row.is_public),
        }),
      );
    }
  }
  return digests;
}

function assertSameDigests(
  before: Map<string, string>,
  after: Map<string, string>,
): void {
  if (JSON.stringify([...before]) !== JSON.stringify([...after])) {
    throw new Error(
      "Phase 612 changed a protected sibling pen payload or reverse topology.",
    );
  }
}

async function assertTerminalState(
  client: Client,
  groups: Array<{
    brand: LoadedCuratedEntityPack;
    pens: LoadedCuratedEntityPack[];
  }>,
  expectedContentHashes: Map<string, string> = new Map(),
): Promise<Map<string, string>> {
  const packs = groups.flatMap(({ brand, pens }) => [brand, ...pens]);
  const ids = packs.map((pack) => pack.entityId);
  const contentHashes = new Map(expectedContentHashes);

  const stateRows = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,
                 publication.status,publication.blockers_json,
                 publication.approved_content_hash,
                 publication.reviewed_contract_version,
                 publication.reviewed_content_revision,
                 publication.content_revision
          FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          WHERE entity.id IN (${ids.map(() => "?").join(",")})
          ORDER BY entity.id`,
    args: ids,
  });
  const stateById = new Map(
    stateRows.rows.map((row) => [String(row.id), row] as const),
  );
  for (const row of stateRows.rows) {
    const id = String(row.id);
    if (!contentHashes.has(id) && row.approved_content_hash) {
      contentHashes.set(id, String(row.approved_content_hash));
    }
  }
  const readinessRows = await client.execute({
    sql: `SELECT entity_id,blocker_count,publishable
          FROM public_entity_readiness
          WHERE contract_version=3
            AND entity_id IN (${ids.map(() => "?").join(",")})`,
    args: ids,
  });
  const readinessById = new Map(
    readinessRows.rows.map((row) => [String(row.entity_id), row] as const),
  );
  const publicRows = await client.execute({
    sql: `SELECT id FROM public_entities
          WHERE id IN (${ids.map(() => "?").join(",")})`,
    args: ids,
  });
  const publicIds = new Set(publicRows.rows.map((row) => String(row.id)));
  const reviewRows = await client.execute({
    sql: `SELECT review.entity_id,review.review_kind
          FROM entity_content_reviews review
          JOIN entity_publications publication
            ON publication.entity_id=review.entity_id
           AND publication.approved_content_hash=review.content_hash
          WHERE review.entity_id IN (${ids.map(() => "?").join(",")})
            AND review.status='approved'
          ORDER BY review.entity_id,review.review_kind`,
    args: ids,
  });
  const reviewsById = new Map<string, string[]>();
  for (const row of reviewRows.rows) {
    const id = String(row.entity_id);
    reviewsById.set(id, [
      ...(reviewsById.get(id) ?? []),
      String(row.review_kind),
    ]);
  }
  const mediaRows = await client.execute({
    sql: `SELECT entity_id,count(*) AS media,min(local_path) AS media_path
          FROM media_assets
          WHERE usage_status='primary'
            AND entity_id IN (${ids.map(() => "?").join(",")})
          GROUP BY entity_id`,
    args: ids,
  });
  const mediaById = new Map(
    mediaRows.rows.map((row) => [String(row.entity_id), row] as const),
  );
  const specRows = await client.execute({
    sql: `SELECT entity_id,count(*) AS specs FROM model_specs
          WHERE review_status='approved'
            AND entity_id IN (${ids.map(() => "?").join(",")})
          GROUP BY entity_id`,
    args: ids,
  });
  const specsById = new Map(
    specRows.rows.map((row) => [String(row.entity_id), Number(row.specs)]),
  );
  const penIds = groups.flatMap(({ pens }) => pens.map((pen) => pen.entityId));
  const topologyRows = await client.execute({
    sql: `SELECT source_id,target_id,link_type FROM entity_links
          WHERE (link_type='made_by'
                 AND source_id IN (${penIds.map(() => "?").join(",")}))
             OR (link_type='reverse'
                 AND target_id IN (${penIds.map(() => "?").join(",")}))
          ORDER BY link_type,source_id,target_id,id`,
    args: [...penIds, ...penIds],
  });
  const makersByPen = new Map<string, string[]>();
  const reversesByPen = new Map<string, string[]>();
  for (const row of topologyRows.rows) {
    if (String(row.link_type) === "made_by") {
      const id = String(row.source_id);
      makersByPen.set(id, [
        ...(makersByPen.get(id) ?? []),
        String(row.target_id),
      ]);
    } else {
      const id = String(row.target_id);
      reversesByPen.set(id, [
        ...(reversesByPen.get(id) ?? []),
        String(row.source_id),
      ]);
    }
  }
  const expectedMakerByPen = new Map(
    groups.flatMap(({ brand, pens }) =>
      pens.map((pen) => [pen.entityId, brand.entityId] as const),
    ),
  );

  for (const pack of packs) {
    const contentHash = contentHashes.get(pack.entityId);
    const row = stateById.get(pack.entityId);
    const readiness = readinessById.get(pack.entityId);
    if (
      !contentHash ||
      !row ||
      String(row.type) !== pack.expectedType ||
      String(row.slug) !== pack.expectedSlug ||
      String(row.name) !== pack.canonicalName ||
      String(row.source) !== pack.sourceMarker ||
      String(row.status) !== "published" ||
      String(row.blockers_json ?? "[]") !== "[]" ||
      String(row.approved_content_hash) !== contentHash ||
      Number(row.reviewed_contract_version) !== 3 ||
      Number(row.reviewed_content_revision) !== Number(row.content_revision) ||
      Number(readiness?.blocker_count) !== 0 ||
      Number(readiness?.publishable) !== 1 ||
      !publicIds.has(pack.entityId)
    ) {
      throw new Error(
        `Phase 612 terminal publication mismatch: ${pack.entityId}.`,
      );
    }
    if (
      (reviewsById.get(pack.entityId) ?? []).join(",") !==
      "fact,language,media,publication"
    ) {
      throw new Error(`Phase 612 review gate mismatch: ${pack.entityId}.`);
    }
    const primary = pack.media.find((media) => media.usageStatus === "primary");
    const media = mediaById.get(pack.entityId);
    if (
      Number(media?.media) !== 1 ||
      String(media?.media_path) !== primary?.localPath ||
      (specsById.get(pack.entityId) ?? 0) !== (pack.spec ? 1 : 0)
    ) {
      throw new Error(
        `Phase 612 terminal payload mismatch: ${pack.entityId}: mediaCount=${String(media?.media)} mediaPath=${String(media?.media_path)} expectedMediaPath=${String(primary?.localPath)} specs=${String(specsById.get(pack.entityId) ?? 0)} expectedSpecs=${pack.spec ? 1 : 0}.`,
      );
    }
    const makerId = expectedMakerByPen.get(pack.entityId);
    if (makerId) {
      const makers = makersByPen.get(pack.entityId) ?? [];
      const reverses = reversesByPen.get(pack.entityId) ?? [];
      if (
        makers.length !== 1 ||
        makers[0] !== makerId ||
        reverses.length !== 1 ||
        reverses[0] !== makerId
      ) {
        throw new Error(
          `Phase 612 terminal topology mismatch: ${pack.entityId}.`,
        );
      }
    }
  }
  return contentHashes;
}

export async function applyPhase612ExternalGapBatch(
  client: Client,
  options: ApplyPhase612Options,
  batchKey: Phase612BatchKey,
): Promise<ApplyPhase612Result> {
  const workspaceRoot = await assertOwnedAuthority(client, options);
  const { groups, packs, batches } = await loadBatch(workspaceRoot, batchKey);
  await assertIdentityPreflight(client, packs);
  await assertTargetTopologyPreflight(client, groups);
  const siblingBefore = await protectedSiblingDigests(client, groups);
  const prefixBefore = await assertCandidatePrefix(
    client,
    options.databasePath,
    batches,
    batchKey,
  );
  const countsBefore = await publicCounts(client);
  const publicBefore = await client.execute(
    "SELECT id,type FROM public_entities ORDER BY id,type",
  );
  const selectedIndex = PHASE612_BATCH_KEYS.indexOf(batchKey);
  const firstApply = prefixBefore === selectedIndex;
  let entities: ApplyPhase22Result["entities"] = [];
  const appliedContentHashes = new Map<string, string>();
  if (firstApply) {
    await prepareIdentitiesAndTopology(client, groups);
    const protectedSource = options.protectedCatalogs[0];
    if (!protectedSource) {
      throw new Error("Phase 612 protected source catalog is missing.");
    }
    for (const group of groups) {
      const result = await applyCuratedContentPacks(
        client,
        {
          workspaceRoot,
          reviewer: options.reviewer,
          databasePath: options.databasePath,
          ownedRoot: options.ownedRoot,
          protectedCatalogPath: protectedSource.path,
          protectedCatalogSnapshot: protectedSource.snapshot,
          env: options.env,
        },
        [group.brand, ...group.pens].map(curatedDefinition),
      );
      entities.push(...result.entities);
      for (const entity of result.entities) {
        appliedContentHashes.set(entity.entityId, entity.contentHash);
      }
    }
  }

  const terminalHashes = await assertTerminalState(
    client,
    groups,
    appliedContentHashes,
  );
  if (!firstApply) {
    entities = packs.map((pack) => ({
      entityId: pack.entityId,
      outcome: "noop" as const,
      contentHash: terminalHashes.get(pack.entityId) ?? "",
    }));
  }
  assertSameDigests(
    siblingBefore,
    await protectedSiblingDigests(client, groups),
  );
  if (firstApply) await recordPrefixMarker(client, batchKey, batches[batchKey]);
  const prefixAfter = firstApply ? prefixBefore + 1 : prefixBefore;
  const verifiedPrefix = await assertCandidatePrefix(
    client,
    options.databasePath,
    batches,
    batchKey,
  );
  if (verifiedPrefix !== prefixAfter) {
    throw new Error(
      `Phase 612 candidate advanced to unexpected prefix ${verifiedPrefix}.`,
    );
  }
  for (const protectedCatalog of options.protectedCatalogs) {
    assertCatalogSnapshotUnchanged(protectedCatalog.snapshot);
  }
  const countsAfter = await publicCounts(client);
  const publicAfter = await client.execute(
    "SELECT id,type FROM public_entities ORDER BY id,type",
  );
  const targetIds = new Set(packs.map((pack) => pack.entityId));
  const nonTargetBefore = publicBefore.rows
    .filter((row) => !targetIds.has(String(row.id)))
    .map((row) => [String(row.id), String(row.type)]);
  const nonTargetAfter = publicAfter.rows
    .filter((row) => !targetIds.has(String(row.id)))
    .map((row) => [String(row.id), String(row.type)]);
  if (!isDeepStrictEqual(nonTargetBefore, nonTargetAfter)) {
    throw new Error("Phase 612 changed non-target public membership.");
  }
  const expectedBefore = EXPECTED_PREFIX_COUNTS[prefixBefore];
  const expectedAfter = EXPECTED_PREFIX_COUNTS[prefixAfter];
  if (
    !expectedBefore ||
    !expectedAfter ||
    countsBefore.brands !== expectedBefore.brands ||
    countsBefore.pens !== expectedBefore.pens ||
    countsAfter.brands !== expectedAfter.brands ||
    countsAfter.pens !== expectedAfter.pens
  ) {
    throw new Error(
      "Phase 612 public count delta is not the expected prefix delta.",
    );
  }
  return {
    batch: batchKey,
    entities,
    publicDelta: {
      brands: countsAfter.brands - countsBefore.brands,
      pens: countsAfter.pens - countsBefore.pens,
    },
  };
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

function batchValue(input: string | null): Phase612BatchKey | null {
  const normalized = input?.trim().toUpperCase();
  return PHASE612_BATCH_KEYS.find((key) => key === normalized) ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const sourceCatalog = value("--source-catalog");
  const realCatalog = value("--protected-catalog");
  const batch = batchValue(value("--batch"));
  if (!database || !ownedRoot || !sourceCatalog || !realCatalog || !batch) {
    throw new Error(
      "Usage: tsx scripts/apply-phase612-external-gap-content.ts --batch <A-E> --database <owned-copy> --owned-root <root> --source-catalog <protected-source> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const databasePath = path.resolve(database);
  const sourcePath = path.resolve(sourceCatalog);
  const realPath = path.resolve(realCatalog);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase612ExternalGapBatch(
      client,
      {
        workspaceRoot: process.cwd(),
        reviewer: value("--reviewer") ?? `phase612-external-gap-batch-${batch}`,
        databasePath,
        ownedRoot: path.resolve(ownedRoot),
        protectedCatalogs: [
          { path: sourcePath, snapshot: snapshotCatalogFiles(sourcePath) },
          { path: realPath, snapshot: snapshotCatalogFiles(realPath) },
        ],
        env: process.env,
      },
      batch,
    );
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
