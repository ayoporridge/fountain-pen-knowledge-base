import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase301CrossCenturyIIContent } from "../../scripts/apply-phase301-cross-century-ii-content";
import {
  PHASE301_CENTURY_II_ID,
  PHASE301_CENTURY_II_SLUG,
  PHASE301_CROSS_BRAND_ID,
  phase301CrossCenturyIIPacks,
} from "../../scripts/data/phase301-cross-century-ii";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 301 publishes Cross Century II only on an owned checkpoint copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase301-cross-century-ii-")),
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
    reviewer: "phase301-cross-century-ii-test",
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
    const pack = phase301CrossCenturyIIPacks.find(
      (candidate) => candidate.entityId === PHASE301_CENTURY_II_ID,
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
      applyPhase301CrossCenturyIIContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    assert.deepEqual(
      (await applyPhase301CrossCenturyIIContent(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["published", "published"],
    );
    const publicRow = (
      await client.execute({
        sql: "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
        args: [PHASE301_CENTURY_II_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [publicRow?.id, publicRow?.type, publicRow?.slug],
      [PHASE301_CENTURY_II_ID, "pen", PHASE301_CENTURY_II_SLUG],
    );
    const body = String(publicRow?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    assert.match(body, /Century II/);
    assert.match(body, /#8921/);
    assert.match(body, /#8756/);
    assert.match(body, /click-off/i);
    assert.doesNotMatch(body, /Townsend 536-FS 的规格/);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE301_CENTURY_II_ID, PHASE301_CROSS_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE301_CROSS_BRAND_ID, PHASE301_CENTURY_II_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
          args: [PHASE301_CENTURY_II_ID],
        })
      ).rows[0]?.value,
      3,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          args: [PHASE301_CENTURY_II_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
          args: [PHASE301_CENTURY_II_ID, localPath],
        })
      ).rows[0]?.value,
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE301_CENTURY_II_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE301_CENTURY_II_ID, hash],
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
      (await applyPhase301CrossCenturyIIContent(client, options)).entities.map(
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
