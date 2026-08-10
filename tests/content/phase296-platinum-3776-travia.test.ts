import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase296Platinum3776TraviaContent } from "../../scripts/apply-phase296-platinum-3776-travia-content";
import {
  PHASE296_TRAVIA_ID,
  phase296Platinum3776TraviaPacks,
} from "../../scripts/data/phase296-platinum-3776-travia";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 296 refuses to downgrade the newer Platinum brand pack", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase296-travia-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    const model = phase296Platinum3776TraviaPacks.find(
      (pack) => pack.entityId === PHASE296_TRAVIA_ID,
    );
    assert.ok(model);
    assert.ok(model.claims.length >= 13);
    assert.equal(model.variants?.length, 3);
    await assert.rejects(
      applyPhase296Platinum3776TraviaContent(client, {
        workspaceRoot: ROOT,
        reviewer: "phase296-platinum-travia-test",
        databasePath: copy.destinationPath,
        ownedRoot,
        protectedCatalogPath: REAL,
        protectedCatalogSnapshot: protectedSnapshot,
        env: {
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "",
          TURSO_AUTH_TOKEN: "",
          FPKG_DATABASE_URL: "",
        },
      }),
      /obsolete after the newer brand-depth pack/,
    );
    const state = (
      await client.execute({
        sql: "SELECT e.type,e.slug,e.name,e.summary,e.body_md,p.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities e JOIN entity_publications p ON p.entity_id=e.id LEFT JOIN public_entities public ON public.id=e.id WHERE e.id=?",
        args: [PHASE296_TRAVIA_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [
        state?.type,
        state?.slug,
        state?.name,
        state?.status,
        Number(state?.is_public),
      ],
      [
        "pen",
        "platinum-3776-century-travia",
        "Platinum #3776 CENTURY Travia",
        "published",
        1,
      ],
    );
    assert.ok(String(state?.summary).length >= 60);
    assert.ok(String(state?.body_md).length >= 2_000);
    assert.match(
      String(state?.body_md),
      /FLAF[\s\S]*29\.3 g[\s\S]*Converter-700A/,
    );
    const counts = (
      await client.execute({
        sql: "SELECT (SELECT count(*) FROM claims WHERE subject_entity_id=?) claims,(SELECT count(*) FROM model_variants WHERE model_entity_id=?) variants,(SELECT count(*) FROM entity_references WHERE entity_id=?) refs,(SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary') media",
        args: [
          PHASE296_TRAVIA_ID,
          PHASE296_TRAVIA_ID,
          PHASE296_TRAVIA_ID,
          PHASE296_TRAVIA_ID,
        ],
      })
    ).rows[0];
    assert.equal(Number(counts?.claims), 14);
    assert.equal(Number(counts?.variants), 3);
    assert.equal(Number(counts?.refs), 6);
    assert.equal(Number(counts?.media), 1);
    const makers = await client.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE296_TRAVIA_ID],
    });
    assert.deepEqual(
      makers.rows.map((row) => String(row.target_id)),
      ["e51tJpejEkXY"],
    );
    const brand = (
      await client.execute({
        sql: "SELECT source,length(body_md) AS body_chars FROM entities WHERE id='e51tJpejEkXY'",
      })
    ).rows[0];
    assert.match(
      String(brand?.source),
      /^curated-content:phase447-platinum-brand-depth-v1:/,
    );
    assert.equal(Number(brand?.body_chars), 2612);
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
