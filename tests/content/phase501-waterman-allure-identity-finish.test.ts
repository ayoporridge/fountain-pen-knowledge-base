import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase501WatermanAllureIdentityFinish } from "../../scripts/apply-phase501-waterman-allure-identity-finish";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = fs.realpathSync.native("/Users/xz/CodeBuddy/fountain-pen-graph");
const REAL = path.join(ROOT, "data", "fpkg.db");
const DONOR_ID = "p244WatermanAllure";
const CANONICAL_ID = "phase83-pen-waterman-allure";
const DONOR_MEDIA_ID = "curated-media-0af25cd3e41db964d69131c1";
const CANONICAL_MEDIA_ID = "curated-media-8ff31e6bb42a5ccfe10aa6fd";
const ALLURE_PATH =
  "/images/library/site-original/phase244/waterman/allure.svg";

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 501 finishes the Waterman Allure identity merge on an owned checkpoint", {
  timeout: 420_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase501-waterman-")),
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
    reviewer: "phase501-waterman-allure-identity-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    const canonicalMediaBefore = await client.execute({
      sql: "SELECT entity_id,local_path,source_item_id,review_status,usage_status FROM media_assets WHERE id=?",
      args: [CANONICAL_MEDIA_ID],
    });
    const canonicalHashBefore = await computePublicationContentHash(
      client,
      CANONICAL_ID,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE local_path=? AND review_status='approved' AND usage_status='primary'",
        [ALLURE_PATH],
      ),
      2,
    );
    await assert.rejects(
      applyPhase501WatermanAllureIdentityFinish(client, {
        ...options,
        env: {
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "libsql://remote",
          TURSO_AUTH_TOKEN: "",
          FPKG_DATABASE_URL: "",
        },
      }),
      /refuses inherited remote database selection: TURSO_DATABASE_URL/,
    );

    const first = await applyPhase501WatermanAllureIdentityFinish(
      client,
      options,
    );
    assert.equal(first.changed, true);
    assert.equal(first.donorId, DONOR_ID);
    assert.equal(first.canonicalId, CANONICAL_ID);
    assert.equal(first.donorMediaUsage, "hidden");
    assert.equal(first.canonicalContentHash, canonicalHashBefore);

    assert.equal(
      (
        await client.execute({
          sql: "SELECT status,blockers_json FROM entity_publications WHERE entity_id=?",
          args: [DONOR_ID],
        })
      ).rows[0]?.status,
      "retired",
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT id FROM public_entities WHERE id=?",
          args: [DONOR_ID],
        })
      ).rows.length,
      0,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT entity_id,local_path,source_item_id,review_status,usage_status FROM media_assets WHERE id=?",
          args: [DONOR_MEDIA_ID],
        })
      ).rows[0]?.usage_status,
      "hidden",
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE local_path=? AND review_status='approved' AND usage_status='primary'",
        [ALLURE_PATH],
      ),
      1,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT entity_id,local_path,source_item_id,review_status,usage_status FROM media_assets WHERE id=?",
          args: [CANONICAL_MEDIA_ID],
        })
      ).rows,
      canonicalMediaBefore.rows,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_lineage WHERE id=? AND source_entity_id=? AND target_entity_id=? AND lineage_kind='merge'",
        ["phase247-lineage-b50b6a78fe19abc0fe0ced06", DONOR_ID, CANONICAL_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE source_path='/pen/waterman-allure-fountain-pen' AND target_path='/pen/waterman-allure' AND redirect_kind='permanent'",
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id=?",
        [DONOR_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? OR target_id=?",
        [DONOR_ID, DONOR_ID],
      ),
      0,
    );
    assert.equal(
      await computePublicationContentHash(client, CANONICAL_ID),
      canonicalHashBefore,
    );

    const second = await applyPhase501WatermanAllureIdentityFinish(
      client,
      options,
    );
    assert.equal(second.changed, false);
    assert.equal(second.canonicalContentHash, first.canonicalContentHash);
    assert.equal(
      (await client.execute("PRAGMA integrity_check")).rows[0]?.integrity_check,
      "ok",
    );
    assert.equal(
      (await client.execute("PRAGMA foreign_key_check")).rows.length,
      0,
    );
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
