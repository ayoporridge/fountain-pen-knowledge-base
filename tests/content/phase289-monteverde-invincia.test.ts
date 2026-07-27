import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase289MonteverdeInvinciaContent } from "../../scripts/apply-phase289-monteverde-invincia-content";
import {
  PHASE289_INVINCIA_ID,
  PHASE289_INVINCIA_SLUG,
  PHASE289_MONTEVERDE_ID,
} from "../../scripts/data/phase289-monteverde-invincia";
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

test("Phase 289 publishes Monteverde Invincia and updates owned brand navigation", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase289-monteverde-")),
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
    reviewer: "phase289-monteverde-invincia-test",
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
    const first = await applyPhase289MonteverdeInvinciaContent(client, options);
    assert.ok(
      first.entities.every(
        (entity) => entity.outcome === "published" || entity.outcome === "noop",
      ),
      JSON.stringify(first),
    );
    const pages = await client.execute({
      sql: "SELECT id,type,slug,summary,body_md FROM public_entities WHERE id IN (?,?) ORDER BY id",
      args: [PHASE289_MONTEVERDE_ID, PHASE289_INVINCIA_ID],
    });
    assert.equal(pages.rows.length, 2);
    const brand = pages.rows.find(
      (page) => String(page.id) === PHASE289_MONTEVERDE_ID,
    );
    const model = pages.rows.find(
      (page) => String(page.id) === PHASE289_INVINCIA_ID,
    );
    assert.equal(String(brand?.slug), "monteverde");
    assert.match(String(brand?.body_md), /monteverde-invincia/);
    assert.match(String(brand?.body_md), /Ritma/);
    assert.match(String(brand?.body_md), /Invincia/);
    assert.equal(String(model?.slug), PHASE289_INVINCIA_SLUG);
    assert.ok(String(model?.summary).length >= 60);
    assert.ok(String(model?.body_md).length >= 2_000);
    assert.match(String(model?.body_md), /JoWo #6/);
    assert.match(String(model?.body_md), /Omniflex/);
    assert.match(
      String(model?.body_md),
      /标准国际墨囊或随附的 piston ink converter/,
    );
    assert.doesNotMatch(String(model?.body_md), /Ritma 的尺寸、磁吸帽/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE289_INVINCIA_ID, PHASE289_MONTEVERDE_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE289_MONTEVERDE_ID, PHASE289_INVINCIA_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
        [PHASE289_INVINCIA_ID],
      ),
      1,
    );
    const asset = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id=? AND usage_status='primary'",
      args: [PHASE289_INVINCIA_ID],
    });
    assert.equal(asset.rows.length, 1);
    assert.match(
      String(asset.rows[0]?.local_path),
      /phase289\/monteverde\/invincia\.svg$/,
    );
    assert.match(
      fs.readFileSync(
        path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)),
        "utf8",
      ),
      /product-photo=false/,
    );
    const replay = await applyPhase289MonteverdeInvinciaContent(
      client,
      options,
    );
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
