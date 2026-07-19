import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase64DiplomatOnlineContent } from "../../scripts/apply-phase64-diplomat-online-content";
import {
  PHASE64_AERO_ID,
  PHASE64_AERO_SLUG,
  PHASE64_CAMPUS_ID,
  PHASE64_CAMPUS_SLUG,
  PHASE64_DIPLOMAT_ID,
  PHASE64_ONLINE_ID,
  PHASE64_ONLINE_SLUG,
} from "../../scripts/data/phase64-diplomat-online";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PENS = [
  [
    PHASE64_AERO_ID,
    PHASE64_AERO_SLUG,
    "diplomat迪波曼-aero太空梭",
    PHASE64_DIPLOMAT_ID,
  ],
  [
    PHASE64_CAMPUS_ID,
    PHASE64_CAMPUS_SLUG,
    "欧领-campus-校园系列",
    PHASE64_ONLINE_ID,
  ],
] as const;
async function scalar(client: Client, sql: string, args: string[] = []) {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 64 publishes Diplomat/Aero and ONLINE/Campus with canonical identity routes", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase64-diplomat-online-")),
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
    reviewer: "phase64-diplomat-online-test",
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
    const first = await applyPhase64DiplomatOnlineContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published", "published"],
    );
    const brands = await client.execute({
      sql: "SELECT id, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id IN (?, ?) ORDER BY id",
      args: [PHASE64_DIPLOMAT_ID, PHASE64_ONLINE_ID],
    });
    assert.equal(brands.rows.length, 2);
    for (const brand of brands.rows) {
      assert.ok(Number(brand.summary_length) >= 60);
      assert.ok(Number(brand.body_length) >= 1200);
    }
    assert.equal(
      String(
        brands.rows.find((row) => String(row.id) === PHASE64_ONLINE_ID)?.slug,
      ),
      PHASE64_ONLINE_SLUG,
    );
    for (const [id, slug, oldSlug, brandId] of PENS) {
      const pen = await client.execute({
        sql: "SELECT slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id = ?",
        args: [id],
      });
      assert.equal(String(pen.rows[0]?.slug), slug);
      assert.ok(Number(pen.rows[0]?.summary_length) >= 60);
      assert.ok(Number(pen.rows[0]?.body_length) >= 2000);
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, brandId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
          [id],
        ),
        1,
      );
      const route = await client.execute({
        sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
        args: [`/pen/${oldSlug}`],
      });
      assert.deepEqual(route.rows, [
        { target_path: `/pen/${slug}`, redirect_kind: "permanent" },
      ]);
      const asset = await client.execute({
        sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
        args: [id],
      });
      assert.equal(asset.rows.length, 1);
      assert.match(
        fs.readFileSync(
          path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)),
          "utf8",
        ),
        /示意图，非产品照片/,
      );
    }
    const brandRoute = await client.execute({
      sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
      args: ["/brand/campus"],
    });
    assert.deepEqual(brandRoute.rows, [
      {
        target_path: `/brand/${PHASE64_ONLINE_SLUG}`,
        redirect_kind: "permanent",
      },
    ]);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?)",
        [
          PHASE64_DIPLOMAT_ID,
          PHASE64_AERO_ID,
          PHASE64_ONLINE_ID,
          PHASE64_CAMPUS_ID,
        ],
      ),
      4,
    );
    const replay = await applyPhase64DiplomatOnlineContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
