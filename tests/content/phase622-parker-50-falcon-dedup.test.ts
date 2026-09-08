import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase622Parker50Dedup } from "../../scripts/apply-phase622-parker-50-falcon-dedup";
import { PHASE36_PARKER_50_ID } from "../../scripts/data/phase36-parker-25-t1-50-falcon-100";
import { phase622Parker50Packs } from "../../scripts/data/phase622-parker-50-falcon-dedup";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

function headingCount(body: string, heading: string): number {
  return (body.match(new RegExp(`^${heading}$`, "gm")) ?? []).length;
}

test("Phase 622 removes the Parker 50 duplicate heading on an owned copy", async () => {
  const sourcePath = path.join(
    ROOT,
    ".planning",
    "content-research",
    "parker-50-falcon-publishable-content-2026-07-19.md",
  );
  const sourceMarkdown = fs.readFileSync(sourcePath, "utf8");
  assert.equal(headingCount(sourceMarkdown, "## 交易记录应如何写"), 1);
  assert.match(sourceMarkdown, /收藏记录最好把“50 Flighter”与“Falcon”分开存放/);
  assert.match(sourceMarkdown, /为了让后来的收藏者仍能复核/);

  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase622-parker-")),
  );
  const databasePath = path.join(ownedRoot, "catalog.db");
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    databasePath,
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase622-parker-50-falcon-dedup",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL_CATALOG,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;

  try {
    await migrateDatabase(client);
    const before = await client.execute({
      sql: "SELECT body_md FROM entities WHERE id = ?",
      args: [PHASE36_PARKER_50_ID],
    });
    assert.equal(before.rows.length, 1);
    assert.equal(
      headingCount(
        String(before.rows[0]?.body_md ?? ""),
        "## 交易记录应如何写",
      ),
      2,
    );

    const first = await applyPhase622Parker50Dedup(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    assert.equal(first.entities.length, phase622Parker50Packs.length);

    const after = await client.execute({
      sql: "SELECT body_md, source FROM entities WHERE id = ?",
      args: [PHASE36_PARKER_50_ID],
    });
    const body = String(after.rows[0]?.body_md ?? "");
    assert.equal(headingCount(body, "## 交易记录应如何写"), 1);
    assert.match(body, /收藏记录最好把“50 Flighter”与“Falcon”分开存放/);
    assert.match(body, /为了让后来的收藏者仍能复核/);
    assert.match(
      String(after.rows[0]?.source ?? ""),
      /phase622-parker-50-falcon-dedup-v1/,
    );
    assert.ok(Array.from(body).length >= 2_000);

    const story = await client.execute({
      sql: "SELECT body_md FROM stories WHERE entity_id = ? AND status = 'published'",
      args: [PHASE36_PARKER_50_ID],
    });
    assert.equal(story.rows.length, 1);
    assert.equal(
      headingCount(String(story.rows[0]?.body_md ?? ""), "## 交易记录应如何写"),
      1,
    );

    const publicationBeforeReplay = await client.execute({
      sql: "SELECT status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id = ?",
      args: [PHASE36_PARKER_50_ID],
    });
    const replay = await applyPhase622Parker50Dedup(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    const publicationAfterReplay = await client.execute({
      sql: "SELECT status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id = ?",
      args: [PHASE36_PARKER_50_ID],
    });
    assert.deepEqual(publicationAfterReplay.rows, publicationBeforeReplay.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
