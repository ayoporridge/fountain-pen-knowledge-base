import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  cleanupTaxonomyFixture,
  createTaxonomyFixture,
} from "../../scripts/lib/taxonomy-fixture";
import {
  loadTaxonomyPlan,
  reconcileTaxonomyPlan,
} from "../../src/lib/taxonomy/identity-plan";

const MATRIX_SOURCE = path.join(
  process.cwd(),
  ".planning",
  "research",
  "V1.2-MODEL-COVERAGE.md",
);
const MANIFEST_PATH = path.join(
  process.cwd(),
  "data",
  "taxonomy",
  "v1.2-phase21.json",
);
const MATRIX_REGIONS = new Set([
  "日本",
  "德国与瑞士",
  "意大利",
  "法国、英国与美国",
  "台湾",
  "中国大陆",
  "印度与其他独立品牌",
]);

function expectedSourceRowKeys(): string[] {
  let region = "";
  const keys: string[] = [];
  for (const line of fs.readFileSync(MATRIX_SOURCE, "utf8").split(/\r?\n/)) {
    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim();
      region = MATRIX_REGIONS.has(heading) ? heading : "";
      continue;
    }
    if (!region || !line.startsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length === 6 && /^P[0-3]$/.test(cells[5] ?? "")) {
      keys.push(`${region}::${cells[0]}`);
    }
  }
  return keys;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function checksumMatrix(matrix: unknown): string {
  return `sha256:${createHash("sha256").update(stableJson(matrix)).digest("hex")}`;
}

test("taxonomy fixture safety", async () => {
  const unsafeRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-taxonomy-guard-input-"),
  );
  const harmlessFile = path.join(unsafeRoot, "outside.db");
  const symlinkPath = path.join(unsafeRoot, "outside-symlink.db");
  const hardlinkPath = path.join(unsafeRoot, "outside-hardlink.db");
  fs.writeFileSync(harmlessFile, "fixture guard sentinel");
  fs.symlinkSync(harmlessFile, symlinkPath);
  fs.linkSync(harmlessFile, hardlinkPath);

  const originalMkdtemp = fs.mkdtempSync;
  let fixtureAllocations = 0;
  fs.mkdtempSync = ((prefix: string, options?: unknown) => {
    if (prefix.includes("fpkg-taxonomy-")) fixtureAllocations += 1;
    return originalMkdtemp(prefix, options as never);
  }) as typeof fs.mkdtempSync;

  const protectedCatalog = path.join(process.cwd(), "data", "fpkg.db");
  const unsafeEnvironments: Array<[string, NodeJS.ProcessEnv]> = [
    ["missing flag", { NODE_ENV: "test" }],
    [
      "remote credentials",
      {
        NODE_ENV: "test",
        TAXONOMY_FIXTURE: "1",
        TURSO_DATABASE_URL: "libsql://remote.invalid",
      },
    ],
    [
      "external base URL",
      {
        NODE_ENV: "test",
        TAXONOMY_FIXTURE: "1",
        E2E_BASE_URL: "https://example.com",
      },
    ],
    [
      "protected catalog",
      {
        NODE_ENV: "test",
        TAXONOMY_FIXTURE: "1",
        FPKG_DATABASE_URL: `file:${protectedCatalog}`,
      },
    ],
    [
      "outside destination",
      {
        NODE_ENV: "test",
        TAXONOMY_FIXTURE: "1",
        FPKG_DATABASE_URL: `file:${harmlessFile}`,
      },
    ],
    [
      "symlink alias",
      {
        NODE_ENV: "test",
        TAXONOMY_FIXTURE: "1",
        FPKG_DATABASE_URL: `file:${symlinkPath}`,
      },
    ],
    [
      "hardlink alias",
      {
        NODE_ENV: "test",
        TAXONOMY_FIXTURE: "1",
        FPKG_DATABASE_URL: `file:${hardlinkPath}`,
      },
    ],
  ];

  try {
    for (const [label, env] of unsafeEnvironments) {
      await assert.rejects(
        () => createTaxonomyFixture(env),
        `${label} must fail closed`,
      );
    }
    assert.equal(
      fixtureAllocations,
      0,
      "unsafe environments must fail before fixture root allocation",
    );
  } finally {
    fs.mkdtempSync = originalMkdtemp;
    fs.rmSync(unsafeRoot, { recursive: true, force: true });
  }

  const fixture = await createTaxonomyFixture({
    NODE_ENV: "test",
    TAXONOMY_FIXTURE: "1",
  });
  assert.ok(fs.existsSync(fixture.databasePath));
  assert.equal(path.dirname(fixture.databasePath), fixture.tempRoot);
  const migrations = await fixture.client.execute(
    "SELECT name FROM migrations ORDER BY name",
  );
  assert.equal(migrations.rows.at(-1)?.name, "032_taxonomy_identity.sql");

  const ownedRoot = fixture.tempRoot;
  await cleanupTaxonomyFixture(fixture);
  assert.equal(fs.existsSync(ownedRoot), false);
});

test("109-row manifest preserves the exact reviewed denominator", () => {
  const plan = loadTaxonomyPlan();
  const report = reconcileTaxonomyPlan(plan);
  const expectedKeys = expectedSourceRowKeys();

  assert.equal(expectedKeys.length, 109);
  assert.deepEqual(
    plan.matrix.map((decision) => decision.sourceRowKey),
    expectedKeys,
  );
  assert.equal(new Set(expectedKeys).size, 109);
  assert.deepEqual(report.priorityCounts, { P0: 13, P1: 54, P2: 40, P3: 2 });
  assert.deepEqual(report.statusCounts, {
    A: 1,
    BM: 42,
    "BM/A": 1,
    "G/M": 1,
    M: 55,
    S: 5,
    "S/M": 4,
  });
  assert.equal(
    Object.values(report.primaryActionCounts).reduce(
      (total, count) => total + count,
      0,
    ),
    109,
  );
  assert.ok(plan.outOfMatrixActions.length > 0);
});

test("net action reconciliation uses exact stable ID sets and locked identities", () => {
  const plan = loadTaxonomyPlan();
  const report = reconcileTaxonomyPlan(plan);

  assert.deepEqual(report.net, { brand: 0, pen: 4, page: 4 });
  assert.deepEqual(report.net, report.declaredNet);

  const lockedOutputs = [
    ["gwKClNnwt3V3", "waterman-hemisphere", "zkAu9PePDdqJ"],
    ["4dcEbeUCjxH-", "waterman-charleston", "zkAu9PePDdqJ"],
    ["CqFpmT3l4Mtm", "opus-88-demo", "I6tjleAZx9RU"],
    ["0CNmbxM54-GA", "opus-88-koloro", "I6tjleAZx9RU"],
    ["ixul2gTcJ06B", "leonardo-furore", "g5r4udSOYhI5"],
    ["UE5otlwKUfp9", "leonardo-momento-magico", "g5r4udSOYhI5"],
    ["5CcEDOz9jiUg", "aurora-88", "CJXe8UpnkHLJ"],
    ["5waoVLPHU2Pt", "aurora-optima", "CJXe8UpnkHLJ"],
  ] as const;
  const actualOutputs = plan.matrix
    .filter((decision) => decision.executionState === "apply")
    .flatMap((decision) => (decision.canonical ? [decision.canonical] : []))
    .map((canonical) => [
      canonical.entityId,
      canonical.slug,
      canonical.makerId,
    ]);
  const actualOutputById = new Map(
    actualOutputs.map((output) => [output[0], output] as const),
  );
  assert.deepEqual(
    lockedOutputs.map(([entityId]) => actualOutputById.get(entityId)),
    lockedOutputs,
  );

  for (const [entityId, slug] of lockedOutputs.slice(1)) {
    const derived = createHash("sha256")
      .update(`phase21:pen:${slug}`)
      .digest("base64url")
      .slice(0, 12);
    assert.equal(entityId, derived);
  }

  assert.deepEqual(plan.lockedRoutes, [
    {
      sourcePath: "/pen/威迪文-waterman-查尔斯顿-hemisphere",
      policy: "redirect_if_target_public",
      targetPath: "/pen/waterman-hemisphere",
    },
    {
      sourcePath: "/pen/opus-88-demo-kolora",
      policy: "always_404",
      targetPath: null,
    },
    {
      sourcePath: "/pen/leonardo-furore-momento-magico",
      policy: "always_404",
      targetPath: null,
    },
    {
      sourcePath: "/pen/奥罗拉-aurora",
      policy: "redirect_if_target_public",
      targetPath: "/brand/aurora",
    },
  ]);

  const assignmentKeys = plan.payloadAssignments.map(
    (item) => item.itemId ?? item.slotKey,
  );
  assert.equal(new Set(assignmentKeys).size, assignmentKeys.length);
  assert.ok(
    plan.payloadAssignments.every(
      (item) =>
        (item.disposition === "retired_source" && item.itemId) ||
        (item.disposition === "pending_conflict" &&
          (item.itemId ||
            (item.slotKey && item.requiresOwnedCopyResolution))) ||
        (item.disposition === "supported_output" && item.targetId),
    ),
  );
  assert.ok(
    plan.payloadAssignments.some(
      (item) => item.slotKey && item.requiresOwnedCopyResolution,
    ),
    "unexposed Phase 19 row IDs must remain explicit unresolved slots",
  );
  assert.throws(
    () => reconcileTaxonomyPlan(plan, { requireResolvedPayloads: true }),
    /owned copy|payload.*unresolved/i,
  );
});

test("checksum and strict decoder fail closed without counting the addendum", () => {
  const raw = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as Record<
    string,
    unknown
  >;
  const plan = loadTaxonomyPlan(raw);
  assert.equal(plan.matrixChecksum, checksumMatrix(raw.matrix));

  const addendumOnly = structuredClone(raw);
  (addendumOnly.outOfMatrixActions as unknown[]).push(
    structuredClone((addendumOnly.outOfMatrixActions as unknown[])[0]),
  );
  const duplicateAddendum = (
    addendumOnly.outOfMatrixActions as Array<Record<string, unknown>>
  ).at(-1);
  assert.ok(duplicateAddendum);
  duplicateAddendum.key = "official-addendum::checksum-isolation-proof";
  assert.equal(
    loadTaxonomyPlan(addendumOnly).matrixChecksum,
    plan.matrixChecksum,
  );

  const drifted = structuredClone(raw);
  (drifted.matrix as Array<Record<string, unknown>>)[0].title =
    "checksum drift";
  assert.throws(() => loadTaxonomyPlan(drifted), /checksum/i);

  const duplicateRow = structuredClone(raw);
  (duplicateRow.matrix as unknown[]).push(
    structuredClone((duplicateRow.matrix as unknown[])[0]),
  );
  duplicateRow.matrixChecksum = checksumMatrix(duplicateRow.matrix);
  assert.throws(() => loadTaxonomyPlan(duplicateRow), /duplicate/i);

  const wrongLock = structuredClone(raw);
  const locked = (wrongLock.matrix as Array<Record<string, unknown>>).find(
    (decision) => decision.sourceRowKey === "台湾::Opus 88 Demo",
  );
  assert.ok(locked);
  locked.executionState = "defer";
  wrongLock.matrixChecksum = checksumMatrix(wrongLock.matrix);
  assert.throws(() => loadTaxonomyPlan(wrongLock), /locked/i);

  const duplicatePayload = structuredClone(raw);
  (duplicatePayload.payloadAssignments as unknown[]).push(
    structuredClone((duplicatePayload.payloadAssignments as unknown[])[0]),
  );
  assert.throws(
    () => loadTaxonomyPlan(duplicatePayload),
    /payload.*duplicate/i,
  );
});
