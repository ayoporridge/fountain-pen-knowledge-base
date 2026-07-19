import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase59BenuNahvalurContent } from "../../scripts/apply-phase59-benu-nahvalur-content";
import {
  PHASE59_BENU_BRAND_ID,
  PHASE59_BRIOLETTE_ID,
  PHASE59_NAHVALUR_BRAND_ID,
  PHASE59_ORIGINAL_PLUS_ID,
  PHASE59_SCHUYLKILL_ID,
  PHASE59_TRUE_UNICORN_ID,
} from "../../scripts/data/phase59-benu-nahvalur";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const BRAND_IDS = [PHASE59_BENU_BRAND_ID, PHASE59_NAHVALUR_BRAND_ID];
const PEN_IDS = [
  PHASE59_BRIOLETTE_ID,
  PHASE59_TRUE_UNICORN_ID,
  PHASE59_ORIGINAL_PLUS_ID,
  PHASE59_SCHUYLKILL_ID,
];

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 59 publishes BENU and Nahvalur canonical brands and models on an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase59-benu-nahvalur-")),
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
    reviewer: "phase59-benu-nahvalur-test",
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
        "SELECT count(*) AS value FROM entities WHERE id IN (?, ?, ?, ?, ?, ?)",
        [...BRAND_IDS, ...PEN_IDS],
      ),
      0,
    );
    await assert.rejects(
      applyPhase59BenuNahvalurContent(client, {
        ...baseOptions,
        env: { ...baseOptions.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection: TURSO_DATABASE_URL/,
    );
    const first = await applyPhase59BenuNahvalurContent(client, baseOptions);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      [
        "published",
        "published",
        "published",
        "published",
        "published",
        "published",
      ],
    );
    const rows = await client.execute({
      sql: `SELECT id, slug, length(body_md) AS body_length, body_md FROM public_entities WHERE id IN (?, ?, ?, ?, ?, ?) ORDER BY id`,
      args: [...BRAND_IDS, ...PEN_IDS],
    });
    assert.equal(rows.rows.length, 6);
    for (const row of rows.rows) {
      assert.ok(Number(row.body_length) >= 2_000);
      assert.doesNotMatch(
        String(row.body_md),
        /\b(?:canonical|made_by|market_sku|retired)\b|数据库|仓库/i,
      );
    }
    const briolette = String(
      rows.rows.find((row) => String(row.id) === PHASE59_BRIOLETTE_ID)
        ?.body_md ?? "",
    );
    assert.match(
      briolette,
      /Briolette[\s\S]*(?:Schmidt|国际)[\s\S]*(?:不可 post|不可post)/i,
    );
    const originalPlus = String(
      rows.rows.find((row) => String(row.id) === PHASE59_ORIGINAL_PLUS_ID)
        ?.body_md ?? "",
    );
    assert.match(
      originalPlus,
      /Original Plus[\s\S]*vacuum[\s\S]*(?:Original[\s\S]*piston|活塞)/i,
    );
    const schuylkill = String(
      rows.rows.find((row) => String(row.id) === PHASE59_SCHUYLKILL_ID)
        ?.body_md ?? "",
    );
    assert.match(
      schuylkill,
      /Schuylkill[\s\S]*(?:墨窗|ink window)[\s\S]*(?:活塞|piston)/i,
    );
    for (const [penId, brandId] of [
      [PHASE59_BRIOLETTE_ID, PHASE59_BENU_BRAND_ID],
      [PHASE59_TRUE_UNICORN_ID, PHASE59_BENU_BRAND_ID],
      [PHASE59_ORIGINAL_PLUS_ID, PHASE59_NAHVALUR_BRAND_ID],
      [PHASE59_SCHUYLKILL_ID, PHASE59_NAHVALUR_BRAND_ID],
    ] as const) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [penId, brandId],
        ),
        1,
      );
    }
    const replay = await applyPhase59BenuNahvalurContent(client, baseOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
