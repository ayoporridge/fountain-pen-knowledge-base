import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase494Options,
  applyPhase494MediaDedup,
  PHASE494_MEDIA_TARGETS,
} from "../../scripts/apply-phase494-media-dedup";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

function assertCatalogFilesUnchanged(
  snapshot: ReturnType<typeof snapshotCatalogFiles>,
): void {
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), snapshot);
}

test("Phase 494 separates scoped brand/model primary media through the review gate", {
  timeout: 300_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase494-media-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase494Options = {
    workspaceRoot: ROOT,
    reviewer: "phase494-media-dedup-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL_CATALOG,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };

  try {
    await migrateDatabase(client);
    const beforeEntities = await client.execute(
      "SELECT count(*) AS value FROM entities",
    );
    const beforeDuplicatePaths = await client.execute({
      sql: `SELECT local_path, count(*) AS value
            FROM media_assets
            WHERE review_status='approved' AND usage_status='primary' AND local_path IS NOT NULL
            GROUP BY local_path HAVING count(*) > 1 ORDER BY local_path`,
    });
    assert.ok(
      beforeDuplicatePaths.rows.some((row) =>
        String(row.local_path).includes("esterbrook-dollar-pen"),
      ),
    );
    assert.ok(
      beforeDuplicatePaths.rows.some((row) =>
        String(row.local_path).includes("phase106/sheaffer"),
      ),
    );
    assert.ok(
      beforeDuplicatePaths.rows.some((row) =>
        String(row.local_path).includes("phase107/wancher"),
      ),
    );
    assert.ok(
      beforeDuplicatePaths.rows.some((row) =>
        String(row.local_path).includes("phase279/opus88"),
      ),
    );

    await assert.rejects(
      applyPhase494MediaDedup(client, {
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
    const afterRejected = await client.execute(
      "SELECT count(*) AS value FROM entities",
    );
    assert.deepEqual(afterRejected.rows, beforeEntities.rows);

    const first = await applyPhase494MediaDedup(client, options);
    assert.equal(first.changed, true);
    assert.equal(first.entities.length, PHASE494_MEDIA_TARGETS.length);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      new Array(PHASE494_MEDIA_TARGETS.length).fill("published"),
    );

    for (const target of PHASE494_MEDIA_TARGETS) {
      const media = await client.execute({
        sql: `SELECT entity_id,local_path,image_url,thumbnail_url,source_url,source_item_id,
                     review_status,usage_status
              FROM media_assets WHERE id=?`,
        args: [target.mediaId],
      });
      assert.equal(media.rows.length, 1);
      assert.equal(String(media.rows[0]?.entity_id), target.entityId);
      assert.equal(String(media.rows[0]?.local_path), target.localPath);
      assert.equal(String(media.rows[0]?.image_url), target.localPath);
      assert.equal(String(media.rows[0]?.thumbnail_url), target.localPath);
      assert.equal(String(media.rows[0]?.source_url), target.localPath);
      assert.equal(String(media.rows[0]?.source_item_id), target.sourceItemId);
      assert.equal(String(media.rows[0]?.review_status), "approved");
      assert.equal(String(media.rows[0]?.usage_status), "primary");
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM source_items WHERE id=? AND source_id=? AND url=? AND review_status='approved'",
          [
            target.sourceItemId,
            "curated-source-registry-80bcb53d7086a809d0fdb6cf",
            target.localPath,
          ],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media')",
          [
            target.entityId,
            first.entities.find((entity) => entity.entityId === target.entityId)
              ?.contentHash ?? "",
          ],
        ),
        3,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_publications WHERE entity_id=? AND status='published' AND blockers_json='[]' AND reviewed_contract_version=3 AND reviewed_content_revision=content_revision",
          [target.entityId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM public_entities WHERE id=?",
          [target.entityId],
        ),
        1,
      );
      assert.ok(
        (await scalar(
          client,
          "SELECT count(*) AS value FROM entity_references WHERE entity_id=? AND source_item_id=? AND review_status='approved'",
          [target.entityId, target.sourceItemId],
        )) >= 1,
      );
      assert.ok(
        fs.existsSync(path.join(ROOT, "public", target.localPath.slice(1))),
      );
    }

    const scopedOldPaths = [
      "/images/library/site-original/esterbrook-dollar-pen/esterbrook-dollar-pen.svg",
      "/images/library/site-original/phase106/sheaffer/sheaffer-connaisseur-imperial-icon.svg",
      "/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg",
      "/images/library/site-original/phase279/opus88/premium-opera.svg",
    ];
    const expectedRemainingOnOldPath = new Map([
      [scopedOldPaths[0], 1], // the Esterbrook Dollar Pen keeps its model art
      [scopedOldPaths[1], 0], // all three Sheaffer models receive distinct art
      [scopedOldPaths[2], 1], // the Wancher True Ebonite model keeps its model art
      [scopedOldPaths[3], 1], // Premium Opera keeps its model art
    ]);
    for (const oldPath of scopedOldPaths) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE local_path=? AND review_status='approved' AND usage_status='primary'",
          [oldPath],
        ),
        expectedRemainingOnOldPath.get(oldPath),
        oldPath,
      );
    }
    const afterDuplicatePaths = await client.execute({
      sql: `SELECT local_path, count(*) AS value
            FROM media_assets
            WHERE review_status='approved' AND usage_status='primary' AND local_path IS NOT NULL
            GROUP BY local_path HAVING count(*) > 1`,
    });
    assert.ok(
      !afterDuplicatePaths.rows.some((row) =>
        scopedOldPaths.includes(String(row.local_path)),
      ),
    );

    const hashes = new Map(
      first.entities.map((entity) => [entity.entityId, entity.contentHash]),
    );
    const second = await applyPhase494MediaDedup(client, options);
    assert.equal(second.changed, false);
    assert.deepEqual(
      second.entities.map((entity) => entity.outcome),
      new Array(PHASE494_MEDIA_TARGETS.length).fill("noop"),
    );
    for (const entity of second.entities)
      assert.equal(entity.contentHash, hashes.get(entity.entityId));

    assert.deepEqual((await client.execute("PRAGMA integrity_check")).rows, [
      { integrity_check: "ok" },
    ]);
    assert.equal(
      (await client.execute("PRAGMA foreign_key_check")).rows.length,
      0,
    );
    assertCatalogFilesUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
