import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase273StDupontInitialContent } from "../../scripts/apply-phase273-st-dupont-initial-content";
import {
  PHASE273_BRAND_ID,
  PHASE273_INITIAL_ID,
  phase273StDupontInitialPacks,
} from "../../scripts/data/phase273-st-dupont-initial";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 273 publishes S.T. Dupont D-Initial on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase273-st-dupont-")),
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
    reviewer: "phase273-st-dupont-initial-test",
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
    assert.equal(phase273StDupontInitialPacks.length, 2);
    const pack = phase273StDupontInitialPacks.find(
      (item) => item.entityId === PHASE273_INITIAL_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        2_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    const svgPath = pack.media[0]?.localPath;
    assert.ok(svgPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", svgPath.replace(/^\//, "")),
      "utf8",
    );
    for (const marker of [
      /non-photo/i,
      /non-logo/i,
      /not-to-scale/i,
      /非产品照片/,
    ])
      assert.match(svg, marker);
    await assert.rejects(
      () =>
        applyPhase273StDupontInitialContent(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase273StDupontInitialContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE273_BRAND_ID, PHASE273_INITIAL_ID],
    );
    const row = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE273_INITIAL_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [row?.id, row?.type, row?.slug, row?.name],
      [
        PHASE273_INITIAL_ID,
        "pen",
        "st-dupont-initial",
        "S.T. Dupont D-Initial",
      ],
    );
    const body = String(row?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /D-Initial|Initial/i,
      /Wings|钢/i,
      /漆面|lacquer/i,
      /维护|清洁/,
      /购买|选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|market_sku|数据库|仓库|SKU/i);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
            args: [PHASE273_INITIAL_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
            args: [PHASE273_INITIAL_ID],
          })
        ).rows[0]?.value,
      ),
      11,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE273_INITIAL_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE273_INITIAL_ID, hash],
        })
      ).rows.map((item) => [String(item.review_kind), String(item.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE273_INITIAL_ID, PHASE273_BRAND_ID],
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
            args: [PHASE273_BRAND_ID, PHASE273_INITIAL_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.ok(
      (
        await applyPhase273StDupontInitialContent(client, options)
      ).entities.every((item) => item.outcome === "noop"),
    );
  } finally {
    client.close();
    assertCatalogSnapshotUnchanged(snapshot);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
