import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase277PlatinumVer20Content } from "../../scripts/apply-phase277-platinum-3776-century-ver20-content";
import {
  PHASE277_PLATINUM_ID,
  PHASE277_VER20_ID,
  PHASE277_VER20_SLUG,
} from "../../scripts/data/phase277-platinum-3776-century-ver20";
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

test("Phase 277 publishes Platinum #3776 Century Ver.2.0 on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase277-platinum-ver20-")),
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
    reviewer: "phase277-platinum-ver20",
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
    const result = await applyPhase277PlatinumVer20Content(client, options);
    assert.deepEqual(
      result.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id=?",
        [PHASE277_VER20_ID],
      ),
      1,
    );
    const identity = await client.execute({
      sql: "SELECT type,slug,name FROM entities WHERE id=?",
      args: [PHASE277_VER20_ID],
    });
    assert.deepEqual(identity.rows, [
      {
        type: "pen",
        slug: PHASE277_VER20_SLUG,
        name: "Platinum #3776 Century Ver.2.0 Prism Crystal",
      },
    ]);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE277_VER20_ID, PHASE277_PLATINUM_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE277_PLATINUM_ID, PHASE277_VER20_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
        [PHASE277_VER20_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM spec_field_evidence WHERE model_spec_id IN (SELECT id FROM model_specs WHERE entity_id=?) AND review_status='approved'",
        [PHASE277_VER20_ID],
      ),
      10,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_content_reviews WHERE entity_id=? AND status='approved'",
        [PHASE277_VER20_ID],
      ),
      4,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
        [PHASE277_VER20_ID],
      ),
      1,
    );
    assert.match(
      fs.readFileSync(
        path.join(
          ROOT,
          "public/images/library/site-original/phase277/platinum/3776-century-ver20.svg",
        ),
        "utf8",
      ),
      /示意图，非产品照片/,
    );
    const body = String(
      (
        await client.execute({
          sql: "SELECT body_md FROM entities WHERE id=?",
          args: [PHASE277_VER20_ID],
        })
      ).rows[0]?.body_md ?? "",
    );
    assert.ok(body.length >= 2600);
    for (const keyword of [
      "PNB-450",
      "#6 Prism Crystal",
      "Slip & Seal",
      "50°C",
      "2,000",
      "139.5 mm",
      "20.0 g",
      "Converter-800A",
    ])
      assert.match(
        body,
        new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    assert.doesNotMatch(
      body,
      /(?:SKU|数据库|checkpoint|phase277|entityId|sourceKey|TODO)/i,
    );
    const before = await client.execute({
      sql: "SELECT status,content_revision,approved_content_hash FROM entity_publications WHERE entity_id=?",
      args: [PHASE277_VER20_ID],
    });
    const replay = await applyPhase277PlatinumVer20Content(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    const after = await client.execute({
      sql: "SELECT status,content_revision,approved_content_hash FROM entity_publications WHERE entity_id=?",
      args: [PHASE277_VER20_ID],
    });
    assert.deepEqual(after.rows, before.rows);
    await assert.rejects(
      () =>
        applyPhase277PlatinumVer20Content(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "file:remote" },
        }),
      /refuses inherited remote database selection/,
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
