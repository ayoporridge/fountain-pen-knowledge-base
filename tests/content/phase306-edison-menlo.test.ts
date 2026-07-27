import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase306EdisonMenloContent } from "../../scripts/apply-phase306-edison-menlo-content";
import {
  PHASE306_EDISON_BRAND_ID,
  PHASE306_MENLO_ID,
  PHASE306_MENLO_SLUG,
  phase306EdisonMenloPacks,
} from "../../scripts/data/phase306-edison-menlo";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 306 publishes Edison Menlo only on an owned checkpoint copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase306-edison-menlo-")),
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
    reviewer: "phase306-edison-menlo-test",
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
    const pack = phase306EdisonMenloPacks.find(
      (candidate) => candidate.entityId === PHASE306_MENLO_ID,
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
    for (const marker of [
      /non-photo/i,
      /non-logo/i,
      /not-to-scale/i,
      /non-colour-proof/i,
    ])
      assert.match(svg, marker);
    await assert.rejects(
      applyPhase306EdisonMenloContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    assert.deepEqual(
      (await applyPhase306EdisonMenloContent(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["published", "published"],
    );
    const publicRow = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE306_MENLO_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [publicRow?.id, publicRow?.type, publicRow?.slug, publicRow?.name],
      [PHASE306_MENLO_ID, "pen", PHASE306_MENLO_SLUG, "Edison Menlo"],
    );
    const body = String(publicRow?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /Menlo/,
      /Pump Filler/,
      /Draw Filler/,
      /cartridge\/converter/i,
      /1\.7 ml/,
      /维护/,
      /选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|market_sku|数据库|仓库/i);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
            args: [PHASE306_MENLO_ID],
          })
        ).rows[0]?.value,
      ),
      4,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
            args: [PHASE306_MENLO_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
            args: [PHASE306_MENLO_ID, localPath],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE306_MENLO_ID, PHASE306_EDISON_BRAND_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE306_EDISON_BRAND_ID, PHASE306_MENLO_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    const hash = await computePublicationContentHash(client, PHASE306_MENLO_ID);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE306_MENLO_ID, hash],
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
      (await applyPhase306EdisonMenloContent(client, options)).entities.map(
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
