import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase308SheafferLegacy9064Content } from "../../scripts/apply-phase308-sheaffer-legacy-9064-content";
import {
  PHASE308_LEGACY_9064_ID,
  PHASE308_LEGACY_9064_SLUG,
  PHASE308_SHEAFFER_ID,
  phase308SheafferLegacy9064Packs,
} from "../../scripts/data/phase308-sheaffer-legacy-9064";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 308 adds current Sheaffer Legacy 9064 on an owned checkpoint copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase308-sheaffer-legacy-9064-"),
    ),
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
    reviewer: "phase308-sheaffer-legacy-9064-test",
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
    const penPack = phase308SheafferLegacy9064Packs.find(
      (pack) => pack.entityId === PHASE308_LEGACY_9064_ID,
    );
    assert.ok(penPack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, penPack.markdownFile), "utf8").length >=
        2_000,
    );
    assert.ok(
      new Set(penPack.sources.map((source) => source.independenceGroup)).size >=
        4,
    );
    const mediaPath = penPack.media[0]?.localPath;
    assert.ok(mediaPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", mediaPath.replace(/^\//, "")),
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
      applyPhase308SheafferLegacy9064Content(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase308SheafferLegacy9064Content(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE308_SHEAFFER_ID, PHASE308_LEGACY_9064_ID],
    );
    const outcomes = first.entities.map((item) => item.outcome);
    assert.ok(
      outcomes.every((outcome) => outcome === "published") ||
        outcomes.every((outcome) => outcome === "noop"),
    );
    const row = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE308_LEGACY_9064_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [row?.id, row?.type, row?.slug, row?.name],
      [
        PHASE308_LEGACY_9064_ID,
        "pen",
        PHASE308_LEGACY_9064_SLUG,
        "Sheaffer Legacy 9064",
      ],
    );
    const body = String(row?.body_md ?? "");
    for (const pattern of [
      /9064/,
      /不锈钢/,
      /嵌入/,
      /converter/i,
      /Heritage/,
      /Touchdown/,
      /PFM/,
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
            args: [PHASE308_LEGACY_9064_ID],
          })
        ).rows[0]?.value,
      ),
      4,
    );
    assert.equal(
      String(
        (
          await client.execute({
            sql: "SELECT brand_entity_id FROM model_specs WHERE entity_id=?",
            args: [PHASE308_LEGACY_9064_ID],
          })
        ).rows[0]?.brand_entity_id,
      ),
      PHASE308_SHEAFFER_ID,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE308_LEGACY_9064_ID, PHASE308_SHEAFFER_ID],
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
            args: [PHASE308_SHEAFFER_ID, PHASE308_LEGACY_9064_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    for (const entityId of [PHASE308_SHEAFFER_ID, PHASE308_LEGACY_9064_ID]) {
      const hash = await computePublicationContentHash(client, entityId);
      assert.deepEqual(
        (
          await client.execute({
            sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            args: [entityId, hash],
          })
        ).rows.map((item) => [String(item.review_kind), String(item.status)]),
        [
          ["fact", "approved"],
          ["language", "approved"],
          ["media", "approved"],
          ["publication", "approved"],
        ],
      );
    }
    assert.deepEqual(
      (
        await applyPhase308SheafferLegacy9064Content(client, options)
      ).entities.map((item) => item.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
