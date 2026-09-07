import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase549ViscontiDarkCrystalDepthContent } from "../../scripts/apply-phase549-visconti-dark-crystal-depth";
import {
  PHASE549_DARK_CRYSTAL_ID,
  PHASE549_VISCONTI_BRAND_ID,
  phase549ViscontiDarkCrystalDepthPacks,
} from "../../scripts/data/phase549-visconti-dark-crystal-depth";
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

test("Phase 549 refreshes the existing Visconti Homo Sapiens Dark Crystal entity on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const baseSnapshot = snapshotCatalogFiles(BASE_CHECKPOINT);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase549-visconti-dark-crystal-"),
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
    reviewer: "phase549-visconti-dark-crystal-depth-test",
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
    assert.equal(phase549ViscontiDarkCrystalDepthPacks.length, 2);
    const pack = phase549ViscontiDarkCrystalDepthPacks.find(
      (candidate) => candidate.entityId === PHASE549_DARK_CRYSTAL_ID,
    );
    assert.ok(pack);
    assert.equal(pack.expectedType, "pen");
    assert.equal(pack.expectedSlug, "visconti-homo-sapiens-dark-crystal");
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        5_000,
    );
    assert.ok(
      pack.sources.some(
        (source) =>
          source.key === "phase549-visconti-dark-crystal-official-current",
      ),
    );
    assert.ok(
      pack.claims.some(
        (claim) => claim.key === "phase549-dark-crystal-nib-conflict",
      ),
    );
    const officialSource = pack.sources.find(
      (source) => source.key === "phase49-visconti-dark-crystal-official",
    );
    assert.ok(officialSource);
    assert.doesNotMatch(officialSource.summary, /Hook Safe/i);
    assert.match(officialSource.summary, /bayonet/i);
    assert.doesNotMatch(
      fs.readFileSync(
        path.join(
          ROOT,
          "public/images/library/site-original/visconti-homo-sapiens/dark-crystal.svg",
        ),
        "utf8",
      ),
      /Hook Safe/i,
    );

    await assert.rejects(
      applyPhase549ViscontiDarkCrystalDepthContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase549ViscontiDarkCrystalDepthContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE549_VISCONTI_BRAND_ID, PHASE549_DARK_CRYSTAL_ID],
    );
    assert.ok(first.entities.every((item) => item.outcome === "published"));

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
        args: [PHASE549_DARK_CRYSTAL_ID],
      })
    ).rows[0];
    assert.equal(String(entity?.id), PHASE549_DARK_CRYSTAL_ID);
    assert.equal(String(entity?.type), "pen");
    assert.equal(String(entity?.slug), "visconti-homo-sapiens-dark-crystal");
    const body = String(entity?.body_md ?? "");
    assert.ok(Array.from(body).length >= 3_600);
    for (const phrase of [
      "烟熏透明树脂",
      "Double Reservoir Power Filler",
      "bayonet",
      "18K",
      "Au 14K",
      "EF/F/M/B/S",
      "室温水",
      "Crystal Dream",
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
        args: [PHASE549_DARK_CRYSTAL_ID],
      })
    ).rows[0];
    assert.ok(Number(references?.n) >= 8);
    const madeBy = (
      await client.execute({
        sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        args: [PHASE549_DARK_CRYSTAL_ID],
      })
    ).rows;
    assert.deepEqual(
      madeBy.map((row) => String(row.target_id)),
      [PHASE549_VISCONTI_BRAND_ID],
    );
    const reverse = (
      await client.execute({
        sql: "SELECT source_id FROM entity_links WHERE target_id=? AND link_type='made_by'",
        args: [PHASE549_VISCONTI_BRAND_ID],
      })
    ).rows;
    assert.ok(
      reverse.some((row) => String(row.source_id) === PHASE549_DARK_CRYSTAL_ID),
    );

    const hash = await computePublicationContentHash(
      client,
      PHASE549_DARK_CRYSTAL_ID,
    );
    const reviews = (
      await client.execute({
        sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        args: [PHASE549_DARK_CRYSTAL_ID, hash],
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
        args: [PHASE549_DARK_CRYSTAL_ID],
      })
    ).rows[0];
    assert.equal(String(publication?.status), "published");
    assert.equal(
      Number(publication?.reviewed_content_revision),
      Number(publication?.content_revision),
    );
    assert.equal(Number(publication?.reviewed_contract_version), 3);
    assert.equal(String(publication?.approved_content_hash), hash);

    const replay = await applyPhase549ViscontiDarkCrystalDepthContent(
      client,
      options,
    );
    assert.ok(replay.entities.every((item) => item.outcome === "noop"));
    assertCatalogSnapshotUnchanged(realSnapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
