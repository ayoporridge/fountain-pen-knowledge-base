import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase47PilotCustom823Content } from "../../scripts/apply-phase47-pilot-custom-823-content";
import {
  PHASE47_PILOT_823_DUPLICATE_ID,
  PHASE47_PILOT_823_ID,
  PHASE47_PILOT_BRAND_ID,
} from "../../scripts/data/phase47-pilot-custom-823";
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

test("Phase 47 upgrades Pilot Custom 823 and retires the duplicate on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase47-pilot823-")),
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
    reviewer: "phase47-pilot-custom-823",
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
    const result = await applyPhase47PilotCustom823Content(client, options);
    assert.deepEqual(
      result.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?)",
        [PHASE47_PILOT_BRAND_ID, PHASE47_PILOT_823_ID],
      ),
      2,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id = ?",
        [PHASE47_PILOT_823_DUPLICATE_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_publications WHERE entity_id = ? AND status = 'retired'",
        [PHASE47_PILOT_823_DUPLICATE_ID],
      ),
      1,
    );
    const redirect = await client.execute({
      sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
      args: ["/pen/百乐-pilot-custom-823"],
    });
    assert.deepEqual(redirect.rows, [
      { target_path: "/pen/pilot-custom-823", redirect_kind: "permanent" },
    ]);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE47_PILOT_823_ID, PHASE47_PILOT_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id = ? AND alias IN ('Pilot Custom 823', 'PILOT CUSTOM823', '百乐 Custom 823', '百乐 823')",
        [PHASE47_PILOT_823_ID],
      ),
      4,
    );
    const media = await client.execute({
      sql: "SELECT local_path, usage_status FROM media_assets WHERE entity_id = ?",
      args: [PHASE47_PILOT_823_ID],
    });
    assert.equal(media.rows.length, 1);
    assert.equal(media.rows[0]?.usage_status, "primary");
    assert.match(
      fs.readFileSync(
        path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
        "utf8",
      ),
      /示意图，非产品照片/,
    );
    const before = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?) ORDER BY entity_id",
      args: [PHASE47_PILOT_BRAND_ID, PHASE47_PILOT_823_ID],
    });
    const replay = await applyPhase47PilotCustom823Content(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const after = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?) ORDER BY entity_id",
      args: [PHASE47_PILOT_BRAND_ID, PHASE47_PILOT_823_ID],
    });
    assert.deepEqual(after.rows, before.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
