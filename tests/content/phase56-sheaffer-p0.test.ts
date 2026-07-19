import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase56SheafferP0Content } from "../../scripts/apply-phase56-sheaffer-p0-content";
import {
  PHASE56_CRAFTSMAN_33T_ID,
  PHASE56_CRAFTSMAN_BALANCE_ID,
  PHASE56_CRAFTSMAN_TIP_DIP_ID,
  PHASE56_RAW_CRAFTSMAN_ID,
  PHASE56_RAW_TOUCHDOWN_TM_ID,
  PHASE56_SHEAFFER_ID,
  PHASE56_TOUCHDOWN_TM_ID,
} from "../../scripts/data/phase56-sheaffer-p0";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const CANONICAL_IDS = [
  PHASE56_CRAFTSMAN_BALANCE_ID,
  PHASE56_CRAFTSMAN_33T_ID,
  PHASE56_CRAFTSMAN_TIP_DIP_ID,
  PHASE56_TOUCHDOWN_TM_ID,
] as const;

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 56 splits generic Sheaffer identities and publishes concrete P0 pages on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase56-sheaffer-p0-")),
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
    reviewer: "phase56-sheaffer-p0",
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
    const rawStoriesBefore = await client.execute({
      sql: "SELECT entity_id, id, title, body_md FROM stories WHERE entity_id IN (?, ?) ORDER BY entity_id, id",
      args: [PHASE56_RAW_CRAFTSMAN_ID, PHASE56_RAW_TOUCHDOWN_TM_ID],
    });
    const first = await applyPhase56SheafferP0Content(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published", "published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?, ?)",
        [PHASE56_SHEAFFER_ID, ...CANONICAL_IDS],
      ),
      5,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?)",
        [PHASE56_RAW_CRAFTSMAN_ID, PHASE56_RAW_TOUCHDOWN_TM_ID],
      ),
      0,
    );

    const canonical = await client.execute({
      sql: "SELECT e.id, e.type, e.slug, length(e.summary) AS summary_length, length(e.body_md) AS body_length, ep.status FROM entities e JOIN entity_publications ep ON ep.entity_id = e.id WHERE e.id IN (?, ?, ?, ?) ORDER BY e.id",
      args: [...CANONICAL_IDS],
    });
    assert.equal(canonical.rows.length, 4);
    for (const row of canonical.rows) {
      assert.equal(String(row.type), "pen");
      assert.equal(String(row.status), "published");
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.body_length) >= 2000);
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id IN (?, ?, ?, ?) AND target_id = ? AND link_type = 'made_by'",
        [...CANONICAL_IDS, PHASE56_SHEAFFER_ID],
      ),
      4,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id IN (?, ?, ?, ?)",
        [...CANONICAL_IDS],
      ),
      4,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM timeline_events WHERE entity_id IN (?, ?, ?, ?)",
        [...CANONICAL_IDS],
      ),
      4,
    );

    const raw = await client.execute({
      sql: "SELECT e.id, e.slug, ep.status, ep.blockers_json FROM entities e JOIN entity_publications ep ON ep.entity_id = e.id WHERE e.id IN (?, ?) ORDER BY e.id",
      args: [PHASE56_RAW_CRAFTSMAN_ID, PHASE56_RAW_TOUCHDOWN_TM_ID],
    });
    assert.deepEqual(raw.rows, [
      {
        id: PHASE56_RAW_TOUCHDOWN_TM_ID,
        slug: "sheaffer-s-touchdown-tm",
        status: "retired",
        blockers_json: '["identity_canonicalized"]',
      },
      {
        id: PHASE56_RAW_CRAFTSMAN_ID,
        slug: "sheaffer-s-craftsman",
        status: "retired",
        blockers_json: '["identity_split"]',
      },
    ]);
    const redirects = await client.execute({
      sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path IN (?, ?) ORDER BY source_path",
      args: ["/pen/sheaffer-s-craftsman", "/pen/sheaffer-s-touchdown-tm"],
    });
    assert.deepEqual(redirects.rows, [
      {
        source_path: "/pen/sheaffer-s-craftsman",
        target_path: null,
        redirect_kind: "hard_404",
      },
      {
        source_path: "/pen/sheaffer-s-touchdown-tm",
        target_path: "/pen/touchdown-tm",
        redirect_kind: "permanent",
      },
    ]);
    const rawStoriesAfter = await client.execute({
      sql: "SELECT entity_id, id, title, body_md FROM stories WHERE entity_id IN (?, ?) ORDER BY entity_id, id",
      args: [PHASE56_RAW_CRAFTSMAN_ID, PHASE56_RAW_TOUCHDOWN_TM_ID],
    });
    assert.deepEqual(rawStoriesAfter.rows, rawStoriesBefore.rows);

    const media = await client.execute({
      sql: "SELECT entity_id, local_path, usage_status FROM media_assets WHERE entity_id IN (?, ?, ?, ?) ORDER BY entity_id",
      args: [...CANONICAL_IDS],
    });
    assert.equal(media.rows.length, 4);
    for (const row of media.rows) {
      assert.equal(String(row.usage_status), "primary");
      const asset = path.join(
        ROOT,
        "public",
        String(row.local_path).replace(/^\//, ""),
      );
      assert.match(fs.readFileSync(asset, "utf8"), /示意图|factual/i);
    }
    const specs = await client.execute({
      sql: "SELECT entity_id, series_name, fill_system, nib FROM model_specs WHERE entity_id IN (?, ?, ?, ?) ORDER BY entity_id",
      args: [...CANONICAL_IDS],
    });
    const byId = new Map(specs.rows.map((row) => [String(row.entity_id), row]));
    assert.match(
      String(byId.get(PHASE56_CRAFTSMAN_33T_ID)?.fill_system),
      /lever/,
    );
    assert.match(
      String(byId.get(PHASE56_CRAFTSMAN_TIP_DIP_ID)?.fill_system),
      /Touchdown/,
    );
    assert.match(
      String(byId.get(PHASE56_TOUCHDOWN_TM_ID)?.fill_system),
      /Touchdown/,
    );
    assert.doesNotMatch(
      String(byId.get(PHASE56_TOUCHDOWN_TM_ID)?.nib),
      /PFM|inlaid/i,
    );

    const second = await applyPhase56SheafferP0Content(client, options);
    assert.ok(second.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
