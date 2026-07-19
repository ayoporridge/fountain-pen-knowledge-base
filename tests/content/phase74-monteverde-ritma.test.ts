import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase74MonteverdeRitmaContent } from "../../scripts/apply-phase74-monteverde-ritma-content";
import {
  PHASE74_MONTEVERDE_BRAND_ID,
  PHASE74_RITMA_ID,
  PHASE74_RITMA_SLUG,
} from "../../scripts/data/phase74-monteverde-ritma";
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

test("Phase 74 publishes Monteverde/Ritma and safely retires the unknown raw page", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase74-monteverde-")),
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
    reviewer: "phase74-monteverde-ritma-test",
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
    const first = await applyPhase74MonteverdeRitmaContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const pages = await client.execute({
      sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE id IN (?, ?) ORDER BY id",
      args: [PHASE74_MONTEVERDE_BRAND_ID, PHASE74_RITMA_ID],
    });
    assert.equal(pages.rows.length, 2);
    for (const page of pages.rows) {
      const summary = String(page.summary ?? "");
      const body = String(page.body_md ?? "");
      assert.ok(summary.length >= 60 && summary.length <= 160);
      assert.ok(body.length >= (String(page.type) === "brand" ? 1_200 : 2_000));
      assert.match(body, /示意图，非产品照片/);
      assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
    }
    const ritma = pages.rows.find((page) => String(page.id) === PHASE74_RITMA_ID);
    assert.equal(String(ritma?.type), "pen");
    assert.equal(String(ritma?.slug), PHASE74_RITMA_SLUG);
    assert.match(String(ritma?.body_md), /151\.1 mm[\s\S]*37\.77 g[\s\S]*Walnut/);
    assert.match(String(ritma?.body_md), /JoWo #6[\s\S]*cartridge\/converter/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE74_RITMA_ID, PHASE74_MONTEVERDE_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [PHASE74_MONTEVERDE_BRAND_ID, PHASE74_RITMA_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id = ?",
        [PHASE74_RITMA_ID],
      ),
      1,
    );
    const asset = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [PHASE74_RITMA_ID],
    });
    assert.equal(asset.rows.length, 1);
    assert.match(String(asset.rows[0]?.local_path), /monteverde-ritma\.svg$/);
    assert.match(
      fs.readFileSync(
        path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)),
        "utf8",
      ),
      /示意图，非产品照片/,
    );
    const legacyArticle = await client.execute({
      sql: "SELECT type FROM entities WHERE id = ?",
      args: ["ehhBLnGu6Uav"],
    });
    assert.deepEqual(legacyArticle.rows, [{ type: "article" }]);
    const replay = await applyPhase74MonteverdeRitmaContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
