import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  applyPhase54PelikanToledoPuraContent,
  PHASE54_P200_P205_SLUG,
  PHASE54_PURA_SLUG,
  PHASE54_TOLEDO_SLUG,
} from "../../scripts/apply-phase54-pelikan-toledo-pura-content";
import {
  PHASE54_P200_P205_ID,
  PHASE54_PELIKAN_ID,
  PHASE54_PURA_ID,
  PHASE54_TOLEDO_ID,
} from "../../scripts/data/phase54-pelikan-toledo-pura";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const IDS = [PHASE54_TOLEDO_ID, PHASE54_PURA_ID, PHASE54_P200_P205_ID];

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 54 publishes Pelikan Toledo, Pura and P200/P205 on an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase54-pelikan-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const baseOptions = {
    workspaceRoot: ROOT,
    reviewer: "phase54-pelikan-toledo-pura-test",
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
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id IN (?, ?, ?)",
        IDS,
      ),
      0,
    );
    await assert.rejects(
      applyPhase54PelikanToledoPuraContent(client, {
        ...baseOptions,
        env: { ...baseOptions.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection: TURSO_DATABASE_URL/,
    );
    const first = await applyPhase54PelikanToledoPuraContent(
      client,
      baseOptions,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published", "published"],
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?, ?)
             ORDER BY CASE id WHEN ? THEN 0 WHEN ? THEN 1 ELSE 2 END`,
      args: [...IDS, PHASE54_TOLEDO_ID, PHASE54_PURA_ID],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => [String(row.id), String(row.slug)]),
      [
        [PHASE54_TOLEDO_ID, PHASE54_TOLEDO_SLUG],
        [PHASE54_PURA_ID, PHASE54_PURA_SLUG],
        [PHASE54_P200_P205_ID, PHASE54_P200_P205_SLUG],
      ],
    );
    assert.equal(publicRows.rows.length, 3);
    for (const row of publicRows.rows) {
      assert.ok(Number(row.body_length) >= 2_000);
      assert.doesNotMatch(
        String(row.body_md),
        /\b(?:canonical|made_by|market_sku|retired)\b|数据库|仓库/i,
      );
    }
    assert.match(
      String(publicRows.rows[0]?.body_md),
      /M700[\s\S]*M710[\s\S]*M900[\s\S]*M910/,
    );
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /铝制[\s\S]*cartridge[\s\S]*converter/,
    );
    assert.match(
      String(publicRows.rows[2]?.body_md),
      /P200[\s\S]*P205[\s\S]*(?:不是|不能)[\s\S]*(?:piston|活塞)/i,
    );

    for (const id of IDS) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, PHASE54_PELIKAN_ID],
        ),
        1,
      );
    }
    const replay = await applyPhase54PelikanToledoPuraContent(
      client,
      baseOptions,
    );
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
