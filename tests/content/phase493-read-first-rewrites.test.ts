import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase493Options,
  applyPhase493ReadFirstRewrites,
} from "../../scripts/apply-phase493-read-first-rewrites";
import { PHASE493_REWRITE_TARGETS } from "../../scripts/data/phase493-read-first-rewrites";
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

test("Phase 493 rewrites the three flagged model stories through the review gate on a disposable copy", {
  timeout: 300_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase493-read-first-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase493Options = {
    workspaceRoot: ROOT,
    reviewer: "phase493-read-first-test",
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
    const before = await client.execute(
      "SELECT count(*) AS value FROM entities",
    );
    await assert.rejects(
      applyPhase493ReadFirstRewrites(client, {
        ...options,
        env: {
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "",
          TURSO_AUTH_TOKEN: "",
          FPKG_DATABASE_URL: "libsql://remote",
        },
      }),
      /refuses inherited remote database selection: FPKG_DATABASE_URL/,
    );
    const afterRejected = await client.execute(
      "SELECT count(*) AS value FROM entities",
    );
    assert.deepEqual(afterRejected.rows, before.rows);
    const brandIds = [
      ...new Set(
        PHASE493_REWRITE_TARGETS.map((target) => target.brandEntityId),
      ),
    ];
    const brandBefore = await client.execute({
      sql: `SELECT id, type, slug, name, summary, body_md, source
            FROM entities WHERE id IN (${brandIds.map(() => "?").join(",")}) ORDER BY id`,
      args: brandIds,
    });

    const first = await applyPhase493ReadFirstRewrites(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );
    assert.equal(first.entities.length, PHASE493_REWRITE_TARGETS.length);

    for (const target of PHASE493_REWRITE_TARGETS) {
      const entity = await client.execute({
        sql: "SELECT type, slug, source FROM public_entities WHERE id = ?",
        args: [target.entityId],
      });
      assert.equal(entity.rows.length, 1);
      assert.equal(String(entity.rows[0]?.type), "pen");
      assert.equal(String(entity.rows[0]?.slug), target.slug);
      assert.match(
        String(entity.rows[0]?.source),
        /^curated-content:phase493-/,
      );

      const story = await client.execute({
        sql: "SELECT body_md, source_notes, status FROM stories WHERE entity_id = ? AND story_type = 'model_story' AND status = 'published'",
        args: [target.entityId],
      });
      assert.equal(story.rows.length, 1);
      const body = String(story.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2_000);
      assert.doesNotMatch(
        body,
        /当前页面|可以作为|资料不足|研究队列|型号档案记录了|现有来源包括/i,
      );
      assert.match(
        String(story.rows[0]?.source_notes),
        /^curated-content:phase493-/,
      );

      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_content_reviews WHERE entity_id = ? AND content_hash = ? AND status = 'approved' AND review_kind IN ('fact','language','media')",
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
          "SELECT count(*) AS value FROM entity_publications WHERE entity_id = ? AND status = 'published' AND blockers_json = '[]' AND reviewed_contract_version = 3 AND reviewed_content_revision = content_revision",
          [target.entityId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE entity_id = ? AND review_status = 'approved'",
          [target.entityId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [target.entityId, target.brandEntityId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
          [target.entityId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
          [target.brandEntityId, target.entityId],
        ),
        1,
      );
    }
    const brandAfter = await client.execute({
      sql: `SELECT id, type, slug, name, summary, body_md, source
            FROM entities WHERE id IN (${brandIds.map(() => "?").join(",")}) ORDER BY id`,
      args: brandIds,
    });
    assert.deepEqual(brandAfter.rows, brandBefore.rows);

    const hashes = new Map(
      first.entities.map((entity) => [entity.entityId, entity.contentHash]),
    );
    const second = await applyPhase493ReadFirstRewrites(client, options);
    assert.deepEqual(
      second.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop"],
    );
    for (const entity of second.entities) {
      assert.equal(entity.contentHash, hashes.get(entity.entityId));
    }
    assertCatalogFilesUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});

function assertCatalogFilesUnchanged(
  snapshot: ReturnType<typeof snapshotCatalogFiles>,
): void {
  const current = snapshotCatalogFiles(REAL_CATALOG);
  assert.deepEqual(current, snapshot);
}
