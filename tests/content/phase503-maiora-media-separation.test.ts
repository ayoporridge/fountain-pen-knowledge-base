import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase503Options,
  applyPhase503MaioraMediaSeparation,
  PHASE503_MAIORA_MEDIA_TARGETS,
} from "../../scripts/apply-phase503-maiora-media-separation";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const OLD_PATH = "/images/library/site-original/phase348/maiora/impronte.svg";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 503 gives the Maiora brand and two models distinct primary media", {
  timeout: 420_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase503-maiora-media-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase503Options = {
    workspaceRoot: ROOT,
    reviewer: "phase503-maiora-media-separation-test",
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
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE local_path=? AND review_status='approved' AND usage_status='primary'",
        [OLD_PATH],
      ),
      3,
    );
    await assert.rejects(
      applyPhase503MaioraMediaSeparation(client, {
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
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE local_path=? AND review_status='approved' AND usage_status='primary'",
        [OLD_PATH],
      ),
      3,
    );

    const first = await applyPhase503MaioraMediaSeparation(client, options);
    assert.equal(first.changed, true);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      new Array(PHASE503_MAIORA_MEDIA_TARGETS.length).fill("published"),
    );
    for (const target of PHASE503_MAIORA_MEDIA_TARGETS) {
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
      const entity = first.entities.find(
        (candidate) => candidate.entityId === target.entityId,
      );
      assert.ok(entity);
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media')",
          [target.entityId, entity.contentHash],
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
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE local_path=? AND review_status='approved' AND usage_status='primary'",
        [OLD_PATH],
      ),
      0,
    );
    for (const target of PHASE503_MAIORA_MEDIA_TARGETS)
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE local_path=? AND review_status='approved' AND usage_status='primary'",
          [target.localPath],
        ),
        1,
        target.localPath,
      );

    const duplicateRows = await client.execute({
      sql: "SELECT local_path,count(*) AS value FROM media_assets WHERE review_status='approved' AND usage_status='primary' GROUP BY local_path HAVING count(*)>1",
    });
    assert.ok(
      !duplicateRows.rows.some((row) => String(row.local_path) === OLD_PATH),
    );

    const second = await applyPhase503MaioraMediaSeparation(client, options);
    assert.equal(second.changed, false);
    assert.deepEqual(
      second.entities.map((entity) => entity.outcome),
      new Array(PHASE503_MAIORA_MEDIA_TARGETS.length).fill("noop"),
    );
    for (const entity of second.entities) {
      assert.equal(
        entity.contentHash,
        first.entities.find(
          (candidate) => candidate.entityId === entity.entityId,
        )?.contentHash,
      );
    }
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
