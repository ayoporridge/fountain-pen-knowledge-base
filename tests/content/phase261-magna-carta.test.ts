import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase261MagnaCartaContent } from "../../scripts/apply-phase261-magna-carta-content";
import {
  PHASE261_MAG600_ID,
  PHASE261_MAGNA_BRAND_ID,
  phase261MagnaCartaPacks,
} from "../../scripts/data/phase261-magna-carta";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 261 publishes Magna Carta Mag 600 with exact topology", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase261-magna-carta-")),
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
    reviewer: "phase261-magna-carta-test",
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
    assert.equal(phase261MagnaCartaPacks.length, 2);
    for (const pack of phase261MagnaCartaPacks) {
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          2_000,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          4,
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
    }
    await assert.rejects(
      applyPhase261MagnaCartaContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    assert.deepEqual(
      (await applyPhase261MagnaCartaContent(client, options)).entities.map(
        (item) => [item.entityId, item.outcome],
      ),
      [
        [PHASE261_MAGNA_BRAND_ID, "published"],
        [PHASE261_MAG600_ID, "published"],
      ],
    );
    const row = (
      await client.execute({
        sql: "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
        args: [PHASE261_MAG600_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [row?.id, row?.type, row?.slug],
      [PHASE261_MAG600_ID, "pen", "magna-carta-mag-600"],
    );
    const body = String(row?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /Magna Carta/,
      /Mag 600/,
      /14K/,
      /True Flex/,
      /ebonite feed/i,
      /converter/i,
      /artisan resin/i,
      /PVD/i,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /数据库|canonical|made_by/i);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE261_MAG600_ID, PHASE261_MAGNA_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE261_MAGNA_BRAND_ID, PHASE261_MAG600_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          args: [PHASE261_MAG600_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
          args: [PHASE261_MAG600_ID],
        })
      ).rows[0]?.value,
      9,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
          args: [PHASE261_MAG600_ID],
        })
      ).rows[0]?.value,
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE261_MAG600_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE261_MAG600_ID, hash],
        })
      ).rows.map((item) => [String(item.review_kind), String(item.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    assert.deepEqual(
      (await applyPhase261MagnaCartaContent(client, options)).entities.map(
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
