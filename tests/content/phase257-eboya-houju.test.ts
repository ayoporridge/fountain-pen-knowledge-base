import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase257EboyaHoujuContent } from "../../scripts/apply-phase257-eboya-houju-content";
import {
  PHASE257_EBOYA_BRAND_ID,
  PHASE257_HOUJU_ID,
  PHASE257_HOUJU_SLUG,
  phase257EboyaHoujuPacks,
} from "../../scripts/data/phase257-eboya-houju";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 257 publishes Eboya HOUJU M with isolated brand topology", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase257-eboya-houju-")),
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
    reviewer: "phase257-eboya-houju-test",
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
    assert.equal(phase257EboyaHoujuPacks.length, 2);
    for (const pack of phase257EboyaHoujuPacks) {
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
      applyPhase257EboyaHoujuContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    const firstApply = (
      await applyPhase257EboyaHoujuContent(client, options)
    ).entities.map((item) => [item.entityId, item.outcome]);
    assert.deepEqual(firstApply, [
      [PHASE257_EBOYA_BRAND_ID, "published"],
      [PHASE257_HOUJU_ID, "published"],
    ]);
    const rows = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id IN (?,?) ORDER BY id",
        args: [PHASE257_EBOYA_BRAND_ID, PHASE257_HOUJU_ID],
      })
    ).rows;
    assert.equal(rows.length, 2);
    const model = rows.find((row) => row.id === PHASE257_HOUJU_ID);
    assert.deepEqual(
      [model?.id, model?.type, model?.slug],
      [PHASE257_HOUJU_ID, "pen", PHASE257_HOUJU_SLUG],
    );
    const body = String(model?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /HOUJU/,
      /137/,
      /13\.5/,
      /14K/,
      /Bock/,
      /cartridge\/converter/i,
      /Pelikan/,
      /硬橡胶|ebonite/i,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /数据库|canonical|made_by/i);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE257_HOUJU_ID, PHASE257_EBOYA_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE257_EBOYA_BRAND_ID, PHASE257_HOUJU_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
          args: [PHASE257_HOUJU_ID],
        })
      ).rows[0]?.value,
      2,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          args: [PHASE257_HOUJU_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
          args: [PHASE257_HOUJU_ID],
        })
      ).rows[0]?.value,
      9,
    );
    const localPath = phase257EboyaHoujuPacks[1]?.media[0]?.localPath;
    assert.ok(localPath);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
          args: [PHASE257_HOUJU_ID, localPath],
        })
      ).rows[0]?.value,
      1,
    );
    const hash = await computePublicationContentHash(client, PHASE257_HOUJU_ID);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE257_HOUJU_ID, hash],
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
      (await applyPhase257EboyaHoujuContent(client, options)).entities.map(
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
