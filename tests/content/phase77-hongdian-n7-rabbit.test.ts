import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase77HongdianN7RabbitContent } from "../../scripts/apply-phase77-hongdian-n7-rabbit-content";
import { PHASE77_N7_RABBIT_SLUG } from "../../scripts/data/phase77-hongdian-n7-rabbit";
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

test("Phase 77 publishes only the exact HongDian N7 Grey Rabbit identity", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase77-hongdian-")),
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
    reviewer: "phase77-hongdian-n7-rabbit-test",
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
    const first = await applyPhase77HongdianN7RabbitContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const pages = await client.execute({
      sql: `SELECT id, type, slug, summary, body_md
            FROM public_entities
            WHERE slug IN ('hongdian', ?)
            ORDER BY type`,
      args: [PHASE77_N7_RABBIT_SLUG],
    });
    assert.equal(pages.rows.length, 2);
    for (const page of pages.rows) {
      const body = String(page.body_md ?? "");
      assert.ok(String(page.summary ?? "").length >= 60);
      assert.ok(body.length >= (String(page.type) === "pen" ? 2_000 : 1_200));
      assert.match(body, /示意图，非产品照片/);
      assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
    }
    const rabbit = pages.rows.find(
      (page) => String(page.slug) === PHASE77_N7_RABBIT_SLUG,
    );
    assert.equal(String(rabbit?.type), "pen");
    assert.match(
      String(rabbit?.body_md),
      /136 mm[\s\S]*15 mm[\s\S]*38 g[\s\S]*N7 Peacock/,
    );
    assert.match(
      String(rabbit?.body_md),
      /N12[\s\S]*N23[\s\S]*converter\/cartridge/,
    );
    const rabbitId = String(rabbit?.id);
    const brand = pages.rows.find((page) => String(page.type) === "brand");
    const brandId = String(brand?.id);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [rabbitId, brandId],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [rabbitId],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE target_path = ?",
        [`/pen/${PHASE77_N7_RABBIT_SLUG}`],
      ),
      0,
    );
    const asset = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [rabbitId],
    });
    assert.equal(asset.rows.length, 1);
    assert.match(String(asset.rows[0]?.local_path), /hongdian-n7-rabbit\.svg$/);
    assert.match(
      fs.readFileSync(
        path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)),
        "utf8",
      ),
      /示意图，非产品照片/,
    );
    const replay = await applyPhase77HongdianN7RabbitContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
