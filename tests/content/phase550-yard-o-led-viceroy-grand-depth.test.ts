import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase550YardOLedViceroyGrandDepthContent } from "../../scripts/apply-phase550-yard-o-led-viceroy-grand-depth";
import {
  PHASE550_YOL_BRAND_ID,
  PHASE550_YOL_VICEROY_GRAND_ID,
  phase550YardOLedViceroyGrandDepthPacks,
} from "../../scripts/data/phase550-yard-o-led-viceroy-grand-depth";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const BASE_CHECKPOINT = path.join(
  ROOT,
  ".planning/quick/260806-kyq-owned-checkpoint-phase-505-544-wancher-p/checkpoint/catalog-2.db",
);

test("Phase 550 refreshes the existing YARD-O-LED Viceroy Grand on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const baseSnapshot = snapshotCatalogFiles(BASE_CHECKPOINT);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase550-yard-o-led-viceroy-grand-"),
    ),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    BASE_CHECKPOINT,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: baseSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase550-yard-o-led-viceroy-grand-depth-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: realSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    assert.equal(phase550YardOLedViceroyGrandDepthPacks.length, 2);
    const pack = phase550YardOLedViceroyGrandDepthPacks.find(
      (candidate) => candidate.entityId === PHASE550_YOL_VICEROY_GRAND_ID,
    );
    assert.ok(pack);
    assert.equal(pack.entityId, PHASE550_YOL_VICEROY_GRAND_ID);
    assert.equal(pack.expectedType, "pen");
    assert.equal(pack.expectedSlug, "yard-o-led-viceroy-grand");
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        5_000,
    );
    for (const key of [
      "phase550-yol-viceroy-grand-victorian-current",
      "phase550-yol-viceroy-grand-barley-current",
      "phase550-yol-grand-collection-current",
      "phase550-yol-care-current",
    ]) {
      assert.ok(pack.sources.some((source) => source.key === key));
    }
    assert.ok(
      pack.claims.some(
        (claim) => claim.key === "phase550-viceroy-grand-current-specs",
      ),
    );
    assert.ok(
      pack.claims.some(
        (claim) => claim.key === "phase550-viceroy-grand-image-simulation",
      ),
    );

    await assert.rejects(
      applyPhase550YardOLedViceroyGrandDepthContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase550YardOLedViceroyGrandDepthContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE550_YOL_BRAND_ID, PHASE550_YOL_VICEROY_GRAND_ID],
    );
    assert.ok(first.entities.every((item) => item.outcome === "published"));

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
        args: [PHASE550_YOL_VICEROY_GRAND_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug],
      [PHASE550_YOL_VICEROY_GRAND_ID, "pen", "yard-o-led-viceroy-grand"],
    );
    const body = String(entity?.body_md ?? "");
    assert.ok(Array.from(body).length >= 4_000);
    for (const phrase of [
      "Viceroy Grand",
      "925 sterling silver",
      "148 mm",
      "13.0 mm",
      "66 g",
      "18 carat gold",
      "screw cap",
      "Victorian",
      "Barley",
      "3,000",
      "converter",
      "维护",
      "怎么选",
    ]) {
      assert.match(
        body,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }
    assert.doesNotMatch(body, /made_by|数据库|仓库/i);

    const references = (
      await client.execute({
        sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=? AND review_status='approved'",
        args: [PHASE550_YOL_VICEROY_GRAND_ID],
      })
    ).rows[0];
    assert.ok(Number(references?.n) >= 9);

    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
            args: [PHASE550_YOL_VICEROY_GRAND_ID],
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
            args: [PHASE550_YOL_VICEROY_GRAND_ID],
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
            args: [PHASE550_YOL_VICEROY_GRAND_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );

    const madeBy = (
      await client.execute({
        sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        args: [PHASE550_YOL_VICEROY_GRAND_ID],
      })
    ).rows;
    assert.deepEqual(
      madeBy.map((row) => String(row.target_id)),
      [PHASE550_YOL_BRAND_ID],
    );

    const hash = await computePublicationContentHash(
      client,
      PHASE550_YOL_VICEROY_GRAND_ID,
    );
    const reviews = (
      await client.execute({
        sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        args: [PHASE550_YOL_VICEROY_GRAND_ID, hash],
      })
    ).rows.map((row) => [String(row.review_kind), String(row.status)]);
    assert.deepEqual(reviews, [
      ["fact", "approved"],
      ["language", "approved"],
      ["media", "approved"],
      ["publication", "approved"],
    ]);

    const publication = (
      await client.execute({
        sql: "SELECT status,reviewed_content_revision,content_revision,reviewed_contract_version,approved_content_hash FROM entity_publications WHERE entity_id=?",
        args: [PHASE550_YOL_VICEROY_GRAND_ID],
      })
    ).rows[0];
    assert.equal(String(publication?.status), "published");
    assert.equal(
      Number(publication?.reviewed_content_revision),
      Number(publication?.content_revision),
    );
    assert.equal(Number(publication?.reviewed_contract_version), 3);
    assert.equal(String(publication?.approved_content_hash), hash);

    const replay = await applyPhase550YardOLedViceroyGrandDepthContent(
      client,
      options,
    );
    assert.ok(replay.entities.every((item) => item.outcome === "noop"));
    assertCatalogSnapshotUnchanged(realSnapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
