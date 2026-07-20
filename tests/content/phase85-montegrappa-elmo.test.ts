import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase85MontegrappaElmoContent } from "../../scripts/apply-phase85-montegrappa-elmo-content";
import {
  PHASE85_ELMO_01_ID,
  PHASE85_ELMO_01_SLUG,
  PHASE85_MONTEGRAPPA_BRAND_ID,
} from "../../scripts/data/phase85-montegrappa-elmo";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 85 publishes Montegrappa and exact Elmo 01 on an owned catalog copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase85-montegrappa-elmo-")),
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
    reviewer: "phase85-montegrappa-elmo-test",
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
    const first = await applyPhase85MontegrappaElmoContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const pages = await client.execute({
      sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE id = ? OR id = ? ORDER BY type, slug",
      args: [PHASE85_MONTEGRAPPA_BRAND_ID, PHASE85_ELMO_01_ID],
    });
    assert.equal(pages.rows.length, 2);
    const brand = pages.rows.find(
      (row) => String(row.id) === PHASE85_MONTEGRAPPA_BRAND_ID,
    );
    const pen = pages.rows.find((row) => String(row.id) === PHASE85_ELMO_01_ID);
    assert.equal(String(brand?.type), "brand");
    assert.equal(String(pen?.type), "pen");
    assert.equal(String(pen?.slug), PHASE85_ELMO_01_SLUG);
    assert.ok(Array.from(String(brand?.body_md ?? "")).length >= 1_200);
    assert.ok(Array.from(String(pen?.summary ?? "")).length >= 60);
    assert.ok(Array.from(String(pen?.summary ?? "")).length <= 160);
    const body = String(pen?.body_md ?? "");
    assert.ok(Array.from(body).length >= 2_000);
    assert.match(body, /142 mm[\s\S]*14\.8 mm[\s\S]*26\.6 g/);
    assert.match(body, /Elmo 02[\s\S]*Elmo 02 Plus/);
    assert.match(body, /示意图，非产品照片/);
    assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE85_ELMO_01_ID, PHASE85_MONTEGRAPPA_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [PHASE85_MONTEGRAPPA_BRAND_ID, PHASE85_ELMO_01_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
        [PHASE85_ELMO_01_ID],
      ),
      1,
    );
    const replay = await applyPhase85MontegrappaElmoContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
