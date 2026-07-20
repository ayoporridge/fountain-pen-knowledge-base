import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase80ViscontiRembrandtContent } from "../../scripts/apply-phase80-visconti-rembrandt-content";
import {
  PHASE80_REMBRANDT_ORIGINAL_SLUG,
  PHASE80_REMBRANDT_S_SLUG,
} from "../../scripts/data/phase80-visconti-rembrandt";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const RAW_ORIGINAL_SLUG = "维斯康蒂-visconti-rembrandt伦勃朗";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 80 separates original Visconti Rembrandt from 2022 Rembrandt-S", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase80-visconti-")),
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
    reviewer: "phase80-visconti-rembrandt-test",
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
    const first = await applyPhase80ViscontiRembrandtContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );
    const pages = await client.execute({
      sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE slug IN ('visconti', ?, ?) ORDER BY type, slug",
      args: [PHASE80_REMBRANDT_ORIGINAL_SLUG, PHASE80_REMBRANDT_S_SLUG],
    });
    assert.equal(pages.rows.length, 3);
    for (const page of pages.rows) {
      const body = String(page.body_md ?? "");
      assert.ok(Array.from(String(page.summary ?? "")).length >= 60);
      assert.ok(
        Array.from(body).length >=
          (String(page.type) === "brand" ? 1_200 : 2_000),
      );
      assert.match(body, /示意图，非产品照片/);
      assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
    }
    const original = pages.rows.find(
      (page) => String(page.slug) === PHASE80_REMBRANDT_ORIGINAL_SLUG,
    );
    const rembrandtS = pages.rows.find(
      (page) => String(page.slug) === PHASE80_REMBRANDT_S_SLUG,
    );
    assert.equal(String(original?.type), "pen");
    assert.equal(String(rembrandtS?.type), "pen");
    assert.notEqual(String(original?.id), String(rembrandtS?.id));
    assert.match(String(original?.body_md), /A66[\s\S]*A10/);
    assert.match(String(original?.body_md), /palladium/);
    assert.match(String(original?.body_md), /139\.5 mm/);
    assert.match(
      String(rembrandtS?.body_md),
      /2022[\s\S]*ruthenium[\s\S]*139\.8 mm[\s\S]*15\.4 mm[\s\S]*31\.3 g/,
    );
    assert.match(
      String(original?.body_md),
      /Homo Sapiens 的熔岩、Hook Safe 与 Power Filler 更不应出现在这张规格卡/,
    );
    const brand = pages.rows.find((page) => String(page.slug) === "visconti");
    for (const pen of [original, rembrandtS]) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [String(pen?.id), String(brand?.id)],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
          [String(pen?.id)],
        ),
        1,
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE source_path = ? AND target_path = ? AND redirect_kind = 'permanent'",
        [
          `/pen/${RAW_ORIGINAL_SLUG}`,
          `/pen/${PHASE80_REMBRANDT_ORIGINAL_SLUG}`,
        ],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE target_path IN (?, ?) AND source_path LIKE '%van-gogh%'",
        [
          `/pen/${PHASE80_REMBRANDT_ORIGINAL_SLUG}`,
          `/pen/${PHASE80_REMBRANDT_S_SLUG}`,
        ],
      ),
      0,
    );
    const asset = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [String(rembrandtS?.id)],
    });
    assert.equal(asset.rows.length, 1);
    const assetPath = path.join(
      ROOT,
      "public",
      String(asset.rows[0]?.local_path).slice(1),
    );
    assert.match(assetPath, /rembrandt-s-2022\.svg$/);
    assert.match(fs.readFileSync(assetPath, "utf8"), /示意图，非产品照片/);
    const replay = await applyPhase80ViscontiRembrandtContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
