import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase546Parker512021DepthContent } from "../../scripts/apply-phase546-parker-51-2021-depth";
import {
  PHASE546_PARKER_51_2021_ID,
  PHASE546_PARKER_BRAND_ID,
  phase546Parker512021DepthPacks,
} from "../../scripts/data/phase546-parker-51-2021-depth";
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

test("Phase 546 deepens the existing Parker 51 (2021) entity on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const baseSnapshot = snapshotCatalogFiles(BASE_CHECKPOINT);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase546-parker-51-")),
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
    reviewer: "phase546-parker-51-2021-test",
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
    assert.equal(phase546Parker512021DepthPacks.length, 2);
    const pack = phase546Parker512021DepthPacks.find(
      (candidate) => candidate.entityId === PHASE546_PARKER_51_2021_ID,
    );
    assert.ok(pack);
    assert.equal(pack.entityId, PHASE546_PARKER_51_2021_ID);
    assert.equal(pack.expectedSlug, "派克-parker-51复刻");
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        4_200,
    );
    assert.ok(
      pack.sources.some(
        (source) => source.key === "parker-51-official-product-2123491",
      ),
    );
    assert.ok(
      pack.sources.some(
        (source) => source.key === "parker-51-modern-heritage-japan-2022",
      ),
    );

    await assert.rejects(
      applyPhase546Parker512021DepthContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase546Parker512021DepthContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE546_PARKER_BRAND_ID, PHASE546_PARKER_51_2021_ID],
    );
    assert.ok(first.entities.every((item) => item.outcome === "published"));

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
        args: [PHASE546_PARKER_51_2021_ID],
      })
    ).rows[0];
    assert.equal(String(entity?.id), PHASE546_PARKER_51_2021_ID);
    assert.equal(String(entity?.type), "pen");
    assert.equal(String(entity?.slug), "派克-parker-51复刻");
    const body = String(entity?.body_md ?? "");
    assert.ok(Array.from(body).length >= 3_500);
    for (const phrase of [
      "Core",
      "Deluxe",
      "Modern Heritage",
      "凉水",
      "vintage Parker 51",
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
        args: [PHASE546_PARKER_51_2021_ID],
      })
    ).rows[0];
    assert.ok(Number(references?.n) >= 6);
    const primaryMedia = (
      await client.execute({
        sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND review_status='approved' AND usage_status='primary'",
        args: [PHASE546_PARKER_51_2021_ID],
      })
    ).rows[0];
    assert.equal(Number(primaryMedia?.n), 1);

    const hash = await computePublicationContentHash(
      client,
      PHASE546_PARKER_51_2021_ID,
    );
    const reviews = (
      await client.execute({
        sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        args: [PHASE546_PARKER_51_2021_ID, hash],
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
        args: [PHASE546_PARKER_51_2021_ID],
      })
    ).rows[0];
    assert.equal(String(publication?.status), "published");
    assert.equal(
      Number(publication?.reviewed_content_revision),
      Number(publication?.content_revision),
    );
    assert.equal(Number(publication?.reviewed_contract_version), 3);
    assert.equal(String(publication?.approved_content_hash), hash);

    const replay = await applyPhase546Parker512021DepthContent(client, options);
    assert.ok(replay.entities.every((item) => item.outcome === "noop"));
    assertCatalogSnapshotUnchanged(realSnapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
