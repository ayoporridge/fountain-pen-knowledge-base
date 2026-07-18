import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  cleanupTaxonomyFixture,
  createTaxonomyFixture,
} from "../../scripts/lib/taxonomy-fixture";

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
    ["missing flag", {}],
    ["remote credentials", { TAXONOMY_FIXTURE: "1", TURSO_DATABASE_URL: "libsql://remote.invalid" }],
    ["external base URL", { TAXONOMY_FIXTURE: "1", E2E_BASE_URL: "https://example.com" }],
    ["protected catalog", { TAXONOMY_FIXTURE: "1", FPKG_DATABASE_URL: `file:${protectedCatalog}` }],
    ["outside destination", { TAXONOMY_FIXTURE: "1", FPKG_DATABASE_URL: `file:${harmlessFile}` }],
    ["symlink alias", { TAXONOMY_FIXTURE: "1", FPKG_DATABASE_URL: `file:${symlinkPath}` }],
    ["hardlink alias", { TAXONOMY_FIXTURE: "1", FPKG_DATABASE_URL: `file:${hardlinkPath}` }],
  ];

  try {
    for (const [label, env] of unsafeEnvironments) {
      await assert.rejects(
        createTaxonomyFixture(env),
        undefined,
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

  const fixture = await createTaxonomyFixture({ TAXONOMY_FIXTURE: "1" });
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
