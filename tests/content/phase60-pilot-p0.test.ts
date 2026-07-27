import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase60PilotP0Content } from "../../scripts/apply-phase60-pilot-p0-content";
import {
  PHASE60_CUSTOM_742_ID,
  PHASE60_CUSTOM_743_ID,
  PHASE60_CUSTOM_845_ID,
  PHASE60_CUSTOM_912_ID,
  PHASE60_ELITE_95S_ID,
  PHASE60_PILOT_BRAND_ID,
} from "../../scripts/data/phase60-pilot-p0";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const TARGETS = [
  [PHASE60_CUSTOM_845_ID, "pilot-custom-845", "百乐-pilot-845-urushi"],
  [PHASE60_CUSTOM_742_ID, "pilot-custom-742", "百乐-pilot-custom-742"],
  [PHASE60_CUSTOM_743_ID, "pilot-custom-743", "百乐-pilot-custom-743"],
  [PHASE60_CUSTOM_912_ID, "pilot-custom-heritage-912", "百乐-pilot-912"],
  [PHASE60_ELITE_95S_ID, "pilot-elite-95s", "百乐-pilot-elite-95s"],
] as const;
async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
) {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 60 canonicalizes Pilot Custom/Elite P0 pages on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase60-pilot-")),
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
    reviewer: "phase60-pilot-p0",
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
    const first = await applyPhase60PilotP0Content(client, options);
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
    for (const [id, dimensions, weight, price] of [
      [
        PHASE60_CUSTOM_742_ID,
        "当前 FKK-2000R-B SKU：最大径 φ15.7 mm；全长 145.9 mm",
        "当前 FKK-2000R-B SKU：24 g",
        "日本官方 Web Catalog 当前建议零售价：含税 ¥49,500（税前 ¥45,000）；FKK-2000R-B",
      ],
      [
        PHASE60_CUSTOM_743_ID,
        "当前 FKK-3000R-B-M SKU：最大径 φ15.7 mm；全长 149 mm",
        "当前 FKK-3000R-B-M SKU：25 g",
        "日本官方 Web Catalog 当前建议零售价：含税 ¥60,500（税前 ¥55,000）；FKK-3000R-B-M",
      ],
    ] as const) {
      const spec = await client.execute({
        sql: "SELECT dimensions, weight, price_range FROM model_specs WHERE entity_id = ? AND review_status = 'approved'",
        args: [id],
      });
      assert.deepEqual(spec.rows, [{ dimensions, weight, price_range: price }]);
    }
    for (const [id, slug, oldSlug] of TARGETS) {
      const entity = await client.execute({
        sql: "SELECT slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id = ?",
        args: [id],
      });
      assert.equal(entity.rows.length, 1);
      assert.equal(String(entity.rows[0]?.slug), slug);
      assert.ok(Number(entity.rows[0]?.summary_length) >= 60);
      assert.ok(Number(entity.rows[0]?.body_length) >= 2000);
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, PHASE60_PILOT_BRAND_ID],
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
      const redirect = await client.execute({
        sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
        args: [`/pen/${oldSlug}`],
      });
      assert.deepEqual(redirect.rows, [
        { target_path: `/pen/${slug}`, redirect_kind: "permanent" },
      ]);
      const media = await client.execute({
        sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.match(
        fs.readFileSync(
          path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
          "utf8",
        ),
        /示意图，非产品照片/,
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?, ?, ?)",
        [PHASE60_PILOT_BRAND_ID, ...TARGETS.map(([id]) => id)],
      ),
      6,
    );
    const replay = await applyPhase60PilotP0Content(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
