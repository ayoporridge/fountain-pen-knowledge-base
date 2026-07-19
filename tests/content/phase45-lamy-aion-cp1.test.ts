import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase45LamyAionCp1Content } from "../../scripts/apply-phase45-lamy-aion-cp1-content";
import {
  PHASE45_AION_ID,
  PHASE45_CP1_ID,
  PHASE45_LAMY_BRAND_ID,
} from "../../scripts/data/phase45-lamy-aion-cp1";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}
test("Phase 45 publishes LAMY aion and cp1 with variant boundaries on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase45-lamy-aion-cp1-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase45-lamy-aion-cp1",
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
    const result = await applyPhase45LamyAionCp1Content(client, options);
    assert.deepEqual(
      result.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?)",
        [PHASE45_LAMY_BRAND_ID, PHASE45_AION_ID, PHASE45_CP1_ID],
      ),
      3,
    );
    for (const [id, slug] of [
      [PHASE45_AION_ID, "lamy-aion"],
      [PHASE45_CP1_ID, "lamy-cp1"],
    ] as const) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entities WHERE id = ? AND slug = ?",
          [id, slug],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, PHASE45_LAMY_BRAND_ID],
        ),
        1,
      );
      const media = await client.execute({
        sql: "SELECT local_path, usage_status FROM media_assets WHERE entity_id = ?",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.equal(media.rows[0]?.usage_status, "primary");
      const localPath = String(media.rows[0]?.local_path ?? "");
      assert.match(
        fs.readFileSync(path.join(ROOT, "public", localPath.slice(1)), "utf8"),
        /示意图，非产品照片/,
      );
    }
    const before = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?) ORDER BY entity_id",
      args: [PHASE45_LAMY_BRAND_ID, PHASE45_AION_ID, PHASE45_CP1_ID],
    });
    const replay = await applyPhase45LamyAionCp1Content(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const after = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?) ORDER BY entity_id",
      args: [PHASE45_LAMY_BRAND_ID, PHASE45_AION_ID, PHASE45_CP1_ID],
    });
    assert.deepEqual(after.rows, before.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
