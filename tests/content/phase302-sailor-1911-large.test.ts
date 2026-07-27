import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase302Sailor1911LargeContent } from "../../scripts/apply-phase302-sailor-1911-large-content";
import {
  PHASE302_1911_LARGE_ID,
  PHASE302_1911_LARGE_SLUG,
  PHASE302_SAILOR_BRAND_ID,
  phase302Sailor1911LargePacks,
} from "../../scripts/data/phase302-sailor-1911-large";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 302 publishes Sailor 1911 Large 11-2024 only on an owned checkpoint copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase302-sailor-1911-large-")),
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
    reviewer: "phase302-sailor-1911-large-test",
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
    const pack = phase302Sailor1911LargePacks.find(
      (candidate) => candidate.entityId === PHASE302_1911_LARGE_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        2_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    const localPath = pack.media[0]?.localPath;
    assert.ok(localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", localPath.replace(/^\//, "")),
      "utf8",
    );
    assert.match(svg, /non-photo/i);
    assert.match(svg, /non-logo/i);
    assert.match(svg, /not-to-scale/i);
    assert.match(svg, /non-colour-proof/i);
    await assert.rejects(
      applyPhase302Sailor1911LargeContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    assert.deepEqual(
      (await applyPhase302Sailor1911LargeContent(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["published", "published"],
    );
    const publicRow = (
      await client.execute({
        sql: "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
        args: [PHASE302_1911_LARGE_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [publicRow?.id, publicRow?.type, publicRow?.slug],
      [PHASE302_1911_LARGE_ID, "pen", PHASE302_1911_LARGE_SLUG],
    );
    const body = String(publicRow?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    assert.match(body, /11-2024/);
    assert.match(body, /21K/);
    assert.match(body, /PMMA/);
    assert.match(body, /converter/);
    assert.match(body, /不能把 1911 Realo 的活塞机构写到 11-2024/);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE302_1911_LARGE_ID, PHASE302_SAILOR_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE302_SAILOR_BRAND_ID, PHASE302_1911_LARGE_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
          args: [PHASE302_1911_LARGE_ID],
        })
      ).rows[0]?.value,
      2,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          args: [PHASE302_1911_LARGE_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
          args: [PHASE302_1911_LARGE_ID, localPath],
        })
      ).rows[0]?.value,
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE302_1911_LARGE_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE302_1911_LARGE_ID, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    assert.deepEqual(
      (await applyPhase302Sailor1911LargeContent(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
