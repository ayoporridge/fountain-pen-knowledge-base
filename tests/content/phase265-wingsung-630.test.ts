import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase265Wingsung630Content } from "../../scripts/apply-phase265-wingsung-630-content";
import {
  PHASE265_630_ID,
  PHASE265_WINGSUNG_BRAND_ID,
  phase265Wingsung630Packs,
} from "../../scripts/data/phase265-wingsung-630";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 265 publishes WingSung / JunLai 630 on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase265-wingsung-")),
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
    reviewer: "phase265-wingsung-630-test",
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
    assert.equal(phase265Wingsung630Packs.length, 2);
    const modelPack = phase265Wingsung630Packs.find(
      (pack) => pack.entityId === PHASE265_630_ID,
    );
    assert.ok(modelPack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, modelPack.markdownFile), "utf8").length >=
        2_000,
    );
    assert.ok(
      new Set(modelPack.sources.map((source) => source.independenceGroup))
        .size >= 4,
    );
    const mediaPath = modelPack.media[0]?.localPath;
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
      () =>
        applyPhase265Wingsung630Content(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase265Wingsung630Content(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE265_WINGSUNG_BRAND_ID, PHASE265_630_ID],
    );
    const row = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE265_630_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [row?.id, row?.type, row?.slug, row?.name],
      [PHASE265_630_ID, "pen", "永生-wingsung-630", "永生 WingSung 630"],
    );
    const body = String(row?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /JunLai/i,
      /piston/i,
      /14K/,
      /#8/,
      /维护|清洗/,
      /选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|market_sku|数据库|仓库/i);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
            args: [PHASE265_630_ID],
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
            args: [PHASE265_630_ID],
          })
        ).rows[0]?.value,
      ),
      8,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [PHASE265_630_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE id=? AND source_id=? AND target_id=? AND link_type='reverse'",
            args: [
              `rev-phase265-made-by-${PHASE265_630_ID}`,
              PHASE265_WINGSUNG_BRAND_ID,
              PHASE265_630_ID,
            ],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    const hash = await computePublicationContentHash(client, PHASE265_630_ID);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE265_630_ID, hash],
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
            args: [PHASE265_630_ID, PHASE265_WINGSUNG_BRAND_ID],
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
            args: [PHASE265_WINGSUNG_BRAND_ID, PHASE265_630_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.ok(
      (await applyPhase265Wingsung630Content(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
  } finally {
    client.close();
    assertCatalogSnapshotUnchanged(snapshot);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
