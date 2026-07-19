import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase61SkbTaiwanContent } from "../../scripts/apply-phase61-skb-taiwan-content";
import {
  PHASE61_ES520_ID,
  PHASE61_MIXED_OLD_SLUG,
  PHASE61_MIXED_PEN_ID,
  PHASE61_RS301N_ID,
  PHASE61_SKB_BRAND_ID,
} from "../../scripts/data/phase61-skb-taiwan";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PEN_IDS = [PHASE61_RS301N_ID, PHASE61_ES520_ID] as const;

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 61 publishes Taiwan SKB pages and retires the mixed Penton/F entry without a redirect", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase61-skb-taiwan-")),
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
    reviewer: "phase61-skb-taiwan-test",
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
    const preservedPayload = await client.execute({
      sql: "SELECT title, body_md FROM stories WHERE entity_id = ? ORDER BY id",
      args: [PHASE61_MIXED_PEN_ID],
    });
    const first = await applyPhase61SkbTaiwanContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?)",
        [PHASE61_SKB_BRAND_ID, ...PEN_IDS],
      ),
      3,
    );
    const pages = await client.execute({
      sql: "SELECT id, type, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id IN (?, ?, ?) ORDER BY id",
      args: [PHASE61_SKB_BRAND_ID, ...PEN_IDS],
    });
    assert.equal(pages.rows.length, 3);
    for (const page of pages.rows) {
      assert.ok(Number(page.summary_length) >= 60);
      assert.ok(
        Number(page.body_length) >=
          (String(page.type) === "brand" ? 1200 : 2000),
      );
    }
    for (const penId of PEN_IDS) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [penId, PHASE61_SKB_BRAND_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
          [penId],
        ),
        1,
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id = ?",
        [PHASE61_MIXED_PEN_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [PHASE61_MIXED_PEN_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE source_path = ?",
        [`/pen/${PHASE61_MIXED_OLD_SLUG}`],
      ),
      0,
    );
    const retired = await client.execute({
      sql: "SELECT status, blockers_json FROM entity_publications WHERE entity_id = ?",
      args: [PHASE61_MIXED_PEN_ID],
    });
    assert.deepEqual(retired.rows, [
      {
        status: "retired",
        blockers_json: '["identity_unresolved_not_taiwan_skb"]',
      },
    ]);
    const payloadAfter = await client.execute({
      sql: "SELECT title, body_md FROM stories WHERE entity_id = ? ORDER BY id",
      args: [PHASE61_MIXED_PEN_ID],
    });
    assert.deepEqual(payloadAfter.rows, preservedPayload.rows);
    const replay = await applyPhase61SkbTaiwanContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
