import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase500Options,
  applyPhase500FourBrandMedia,
  PHASE500_MEDIA_TARGETS,
  PHASE500_MODEL_MEDIA_TARGETS,
} from "../../scripts/apply-phase500-four-brand-media";
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

test("Phase 500 separates four additional brand primary media rows", {
  timeout: 420_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase500-media-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase500Options = {
    workspaceRoot: ROOT,
    reviewer: "phase500-four-brand-media-test",
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
  const oldPaths: string[] = PHASE500_MODEL_MEDIA_TARGETS.map(
    (target) => target[3],
  );
  try {
    await migrateDatabase(client);
    const beforeEntities = await scalar(
      client,
      "SELECT count(*) AS value FROM entities",
    );
    const modelBefore = await client.execute({
      sql: `SELECT ma.entity_id,ma.id,ma.local_path,ma.source_item_id,ma.title FROM media_assets ma WHERE ma.id IN (${PHASE500_MODEL_MEDIA_TARGETS.map(() => "?").join(",")}) ORDER BY ma.id`,
      args: PHASE500_MODEL_MEDIA_TARGETS.map((target) => target[2]),
    });
    for (const oldPath of oldPaths)
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE local_path=? AND review_status='approved' AND usage_status='primary'",
          [oldPath],
        ),
        2,
        oldPath,
      );
    await assert.rejects(
      applyPhase500FourBrandMedia(client, {
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
    assert.equal(
      await scalar(client, "SELECT count(*) AS value FROM entities"),
      beforeEntities,
    );
    const first = await applyPhase500FourBrandMedia(client, options);
    assert.equal(first.changed, true);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      new Array(PHASE500_MEDIA_TARGETS.length).fill("published"),
    );
    for (const target of PHASE500_MEDIA_TARGETS) {
      const media = await client.execute({
        sql: "SELECT entity_id,local_path,image_url,thumbnail_url,source_url,source_item_id,review_status,usage_status FROM media_assets WHERE id=?",
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
          "SELECT count(*) AS value FROM source_items WHERE id=? AND url=? AND review_status='approved'",
          [target.sourceItemId, target.localPath],
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
        fs.existsSync(path.join(ROOT, "public", target.localPath.slice(1))),
      );
    }
    const modelAfter = await client.execute({
      sql: `SELECT ma.entity_id,ma.id,ma.local_path,ma.source_item_id,ma.title FROM media_assets ma WHERE ma.id IN (${PHASE500_MODEL_MEDIA_TARGETS.map(() => "?").join(",")}) ORDER BY ma.id`,
      args: PHASE500_MODEL_MEDIA_TARGETS.map((target) => target[2]),
    });
    assert.deepEqual(modelAfter.rows, modelBefore.rows);
    for (const oldPath of oldPaths)
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE local_path=? AND review_status='approved' AND usage_status='primary'",
          [oldPath],
        ),
        1,
        oldPath,
      );
    const duplicateRows = await client.execute({
      sql: "SELECT local_path,count(*) AS value FROM media_assets WHERE review_status='approved' AND usage_status='primary' GROUP BY local_path HAVING count(*)>1",
    });
    assert.ok(
      !duplicateRows.rows.some((row) =>
        oldPaths.includes(String(row.local_path)),
      ),
    );
    const hashes = new Map(
      first.entities.map((entity) => [entity.entityId, entity.contentHash]),
    );
    const second = await applyPhase500FourBrandMedia(client, options);
    assert.equal(second.changed, false);
    assert.deepEqual(
      second.entities.map((entity) => entity.outcome),
      new Array(PHASE500_MEDIA_TARGETS.length).fill("noop"),
    );
    for (const entity of second.entities)
      assert.equal(entity.contentHash, hashes.get(entity.entityId));
    assert.equal(
      (await client.execute("PRAGMA integrity_check")).rows[0]?.integrity_check,
      "ok",
    );
    assert.equal(
      (await client.execute("PRAGMA foreign_key_check")).rows.length,
      0,
    );
    assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
  } finally {
    client.close();
  }
});
