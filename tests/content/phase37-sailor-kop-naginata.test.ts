import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase37SailorKopNaginataContent } from "../../scripts/apply-phase37-sailor-kop-naginata-content";
import {
  PHASE37_KOP_ID,
  PHASE37_NAGINATA_ID,
  PHASE37_SAILOR_BRAND_ID,
} from "../../scripts/data/phase37-sailor-kop-naginata";
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

test("Phase 37 publishes KOP and reclassifies Naginata-Togi on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase37-sailor-")),
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
    reviewer: "phase37-sailor-kop-naginata",
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
    await applyPhase37SailorKopNaginataContent(client, options);
    const kop = await client.execute({
      sql: "SELECT type, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id = ?",
      args: [PHASE37_KOP_ID],
    });
    assert.equal(kop.rows.length, 1);
    assert.equal(String(kop.rows[0]?.type), "pen");
    assert.equal(String(kop.rows[0]?.slug), "sailor-king-of-pens");
    assert.ok(Number(kop.rows[0]?.summary_length) >= 60);
    assert.ok(Number(kop.rows[0]?.body_length) >= 2000);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id = ?",
        [PHASE37_KOP_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE37_KOP_ID, PHASE37_SAILOR_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [PHASE37_SAILOR_BRAND_ID, PHASE37_KOP_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id = ? AND alias = 'Sailor KOP'",
        [PHASE37_KOP_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
        [PHASE37_KOP_ID],
      ),
      1,
    );
    const media = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ?",
      args: [PHASE37_KOP_ID],
    });
    const svg = fs.readFileSync(
      path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
      "utf8",
    );
    assert.match(svg, /示意图，非产品照片/);
    const nib = await client.execute({
      sql: "SELECT type, slug, body_md FROM entities WHERE id = ?",
      args: [PHASE37_NAGINATA_ID],
    });
    assert.equal(String(nib.rows[0]?.type), "nib");
    assert.equal(String(nib.rows[0]?.slug), "sailor-naginata-togi");
    assert.equal(nib.rows[0]?.body_md, null);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? OR target_id = ?",
        [PHASE37_NAGINATA_ID, PHASE37_NAGINATA_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id = ?",
        [PHASE37_NAGINATA_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE source_path = ? AND redirect_kind = 'hard_404'",
        ["/pen/写乐-sailor-长刀研"],
      ),
      1,
    );
    const replay = await applyPhase37SailorKopNaginataContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
