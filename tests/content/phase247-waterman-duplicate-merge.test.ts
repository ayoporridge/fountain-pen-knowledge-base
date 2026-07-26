import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase247WatermanDuplicateMerge } from "../../scripts/apply-phase247-waterman-duplicate-merge";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = fs.realpathSync.native("/Users/xz/CodeBuddy/fountain-pen-graph");
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 247 merges duplicate Waterman Allure and Exception routes", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase247-waterman-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase247-waterman-duplicate-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    const first = await applyPhase247WatermanDuplicateMerge(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      ["p244WatermanAllure", "p245WatermanException"],
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );

    for (const [oldId, canonicalId, oldSlug, canonicalSlug] of [
      [
        "p244WatermanAllure",
        "phase83-pen-waterman-allure",
        "waterman-allure-fountain-pen",
        "waterman-allure",
      ],
      [
        "p245WatermanException",
        "phase131-waterman-exception-sap-2214314",
        "waterman-exception-fountain-pen",
        "waterman-exception",
      ],
    ] as const) {
      assert.equal(
        (
          await client.execute({
            sql: "SELECT status FROM entity_publications WHERE entity_id=?",
            args: [oldId],
          })
        ).rows[0]?.status,
        "retired",
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT id FROM public_entities WHERE id=?",
            args: [oldId],
          })
        ).rows.length,
        0,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT id FROM entity_links WHERE source_id=? OR target_id=?",
            args: [oldId, oldId],
          })
        ).rows.length,
        0,
      );
      const redirect = await client.execute({
        sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
        args: [`/pen/${oldSlug}`],
      });
      assert.deepEqual(redirect.rows[0], {
        target_path: `/pen/${canonicalSlug}`,
        redirect_kind: "permanent",
      });
      assert.equal(
        (
          await client.execute({
            sql: "SELECT id FROM public_entities WHERE id=?",
            args: [canonicalId],
          })
        ).rows.length,
        1,
      );
    }
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_aliases WHERE entity_id='p244WatermanAllure' OR entity_id='p245WatermanException'",
          })
        ).rows[0]?.value,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_lineage WHERE source_entity_id IN ('p244WatermanAllure','p245WatermanException') AND lineage_kind='merge'",
          })
        ).rows[0]?.value,
      ),
      2,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT id FROM entity_aliases WHERE entity_id='phase83-pen-waterman-allure' AND alias='Waterman Allure Chrome'",
        })
      ).rows.length,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT id FROM entity_aliases WHERE entity_id='phase131-waterman-exception-sap-2214314' AND alias='Waterman Exception Ideal'",
        })
      ).rows.length,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id='zkAu9PePDdqJ'",
        })
      ).rows[0]?.status,
      "published",
    );

    const second = await applyPhase247WatermanDuplicateMerge(client, options);
    assert.deepEqual(
      second.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
