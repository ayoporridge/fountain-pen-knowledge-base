import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase215SailorProGearDuplicateMerge } from "../../scripts/apply-phase215-sailor-pro-gear-duplicate-merge";
import { applyCuratedContentPacks } from "../../scripts/apply-phase22-content";
import { phase76SailorProfessionalGearPacks } from "../../scripts/data/phase76-sailor-professional-gear";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const OLD_ID = "ouSQi7nqLzH5";
const OLD_SLUG = "写乐-sailor-21k-pro-gear-大鱼雷";
const CANONICAL_ID = "uY3QLMSxlCoo";
const BRAND_ID = "ce2dcqixqSCx";

test("Phase 215 merges the duplicate Sailor 21K Pro Gear placeholder on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase215-sailor-"),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase215-sailor-duplicate-merge-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: snapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    await applyCuratedContentPacks(
      client,
      options,
      phase76SailorProfessionalGearPacks,
    );
    await assert.rejects(
      () =>
        applyPhase215SailorProGearDuplicateMerge(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase215SailorProGearDuplicateMerge(
      client,
      options,
    );
    assert.equal(
      first.entities.find((item) => item.entityId === OLD_ID)?.outcome,
      "noop",
    );
    assert.equal(
      first.entities.find((item) => item.entityId === CANONICAL_ID)?.outcome,
      "published",
    );
    const oldPublication = await client.execute({
      sql: "SELECT status,blockers_json FROM entity_publications WHERE entity_id=?",
      args: [OLD_ID],
    });
    assert.equal(oldPublication.rows[0]?.status, "retired");
    assert.deepEqual(
      JSON.parse(String(oldPublication.rows[0]?.blockers_json)),
      ["taxonomy_merged"],
    );
    const redirect = await client.execute({
      sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      args: [`/pen/${OLD_SLUG}`],
    });
    assert.deepEqual(redirect.rows[0], {
      target_path: "/pen/sailor-pro-gear",
      redirect_kind: "permanent",
    });
    const lineage = await client.execute({
      sql: "SELECT target_entity_id,lineage_kind FROM entity_lineage WHERE source_entity_id=?",
      args: [OLD_ID],
    });
    assert.deepEqual(lineage.rows[0], {
      target_entity_id: CANONICAL_ID,
      lineage_kind: "merge",
    });
    const aliases = await client.execute({
      sql: "SELECT alias FROM entity_aliases WHERE entity_id=? AND alias IN (?,?) ORDER BY alias",
      args: [CANONICAL_ID, "Sailor 21K Pro Gear", "写乐 21K Pro Gear / 大鱼雷"],
    });
    assert.deepEqual(
      aliases.rows.map((row) => row.alias),
      ["Sailor 21K Pro Gear", "写乐 21K Pro Gear / 大鱼雷"],
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [CANONICAL_ID, BRAND_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    const canonicalPublication = await client.execute({
      sql: "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      args: [CANONICAL_ID],
    });
    assert.equal(canonicalPublication.rows[0]?.status, "published");
    assert.ok(canonicalPublication.rows[0]?.approved_content_hash);
    const replay = await applyPhase215SailorProGearDuplicateMerge(
      client,
      options,
    );
    assert.ok(
      replay.entities.every((item) => item.outcome === "noop"),
      JSON.stringify(replay),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
