import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase620LabanModelDedup } from "../../scripts/apply-phase620-laban-model-dedup";
import { PHASE620_LABAN_325_ID } from "../../scripts/data/phase620-laban-model-dedup";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

function duplicateParagraphs(
  rows: Array<{ slug: string; body_md: string }>,
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const row of rows) {
    for (const paragraph of row.body_md
      .split(/\n\s*\n/)
      .map((value) => value.trim())) {
      if (paragraph.length < 100) continue;
      const key = paragraph.replace(/\s+/g, " ");
      groups.set(key, [...(groups.get(key) ?? []), row.slug]);
    }
  }
  return new Map([...groups].filter(([, slugs]) => slugs.length > 1));
}

test("Phase 620 replaces the Laban 325 brand-template paragraph on an owned copy", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase620-laban-dedup-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    const options = {
      workspaceRoot: ROOT,
      reviewer: "phase620-laban-model-dedup-test",
      databasePath: copy.destinationPath,
      ownedRoot,
      protectedCatalogPath: REAL,
      protectedCatalogSnapshot: snapshotCatalogFiles(REAL),
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
    } as const;

    const beforeModel = await client.execute({
      sql: "SELECT body_md, source FROM entities WHERE id=?",
      args: [PHASE620_LABAN_325_ID],
    });
    const beforeBrand = await client.execute({
      sql: "SELECT body_md, source FROM entities WHERE id=?",
      args: ["phase141-brand-laban"],
    });
    const beforePublicCount = await client.execute(
      "SELECT count(*) AS n FROM public_entities",
    );

    const first = await applyPhase620LabanModelDedup(client, options);
    assert.equal(first.entities.length, 1);
    assert.equal(first.entities[0]?.entityId, PHASE620_LABAN_325_ID);
    assert.equal(first.entities[0]?.outcome, "published");

    const afterModel = await client.execute({
      sql: "SELECT body_md, source FROM entities WHERE id=?",
      args: [PHASE620_LABAN_325_ID],
    });
    const afterBrand = await client.execute({
      sql: "SELECT body_md, source FROM entities WHERE id=?",
      args: ["phase141-brand-laban"],
    });
    assert.notDeepEqual(afterModel.rows, beforeModel.rows);
    assert.deepEqual(afterBrand.rows, beforeBrand.rows);
    assert.equal(
      (await client.execute("SELECT count(*) AS n FROM public_entities"))
        .rows[0]?.n,
      beforePublicCount.rows[0]?.n,
    );
    assert.ok(
      Array.from(String(afterModel.rows[0]?.body_md ?? "")).length >= 2_000,
    );
    assert.match(
      String(afterModel.rows[0]?.source ?? ""),
      /^curated-content:phase620-/,
    );

    const reviews = await client.execute({
      sql: "SELECT review_kind,status,content_hash FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind",
      args: [PHASE620_LABAN_325_ID],
    });
    const approvedReviews = reviews.rows.filter(
      (row) => row.review_kind !== "publication" && row.status === "approved",
    );
    assert.deepEqual(
      approvedReviews.map((row) => [row.review_kind, row.status]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
      ],
    );
    assert.ok(
      approvedReviews.every(
        (row) => String(row.content_hash) === first.entities[0]?.contentHash,
      ),
    );

    const publicRows = (
      await client.execute(
        "SELECT slug,body_md FROM public_entities WHERE type IN ('brand','pen') ORDER BY slug",
      )
    ).rows.map((row) => ({
      slug: String(row.slug),
      body_md: String(row.body_md ?? ""),
    }));
    assert.equal(duplicateParagraphs(publicRows).size, 0);

    const replay = await applyPhase620LabanModelDedup(client, options);
    assert.equal(replay.entities[0]?.outcome, "noop");
    assert.equal(
      replay.entities[0]?.contentHash,
      first.entities[0]?.contentHash,
    );
    assertCatalogSnapshotUnchanged(
      options.protectedCatalogSnapshot,
      snapshotCatalogFiles(REAL),
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
