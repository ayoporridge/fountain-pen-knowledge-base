import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase79KawecoPerkeoContent } from "../../scripts/apply-phase79-kaweco-perkeo-content";
import {
  PHASE79_KAWECO_PERKEO_SLUG,
} from "../../scripts/data/phase79-kaweco-perkeo";
import { PHASE71_KAWECO_BRAND_ID } from "../../scripts/data/phase71-kaweco-p0";
import {
  assertCatalogSnapshotUnchanged,
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

test("Phase 79 publishes Kaweco Perkeo without absorbing other Kaweco lines", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase79-kaweco-perkeo-")),
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
    reviewer: "phase79-kaweco-perkeo-test",
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
    const first = await applyPhase79KawecoPerkeoContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const perkeo = await client.execute({
      sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE slug = ?",
      args: [PHASE79_KAWECO_PERKEO_SLUG],
    });
    assert.equal(perkeo.rows.length, 1);
    const page = perkeo.rows[0]!;
    assert.equal(String(page.type), "pen");
    assert.ok(String(page.summary ?? "").length >= 60);
    assert.ok(String(page.summary ?? "").length <= 160);
    const body = String(page.body_md ?? "");
    assert.ok(body.length >= 2_000);
    assert.match(body, /14 cm[\s\S]*15.9 cm[\s\S]*15 mm[\s\S]*14 g/);
    assert.match(body, /Kaweco Standard Converter[\s\S]*SKU/);
    assert.match(body, /Sport[\s\S]*Liliput[\s\S]*Student/);
    assert.match(body, /1889[\s\S]*今日的塑料 Perkeo/);
    assert.match(body, /示意图，非产品照片/);
    assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
    const perkeoId = String(page.id);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [perkeoId, PHASE71_KAWECO_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [perkeoId],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [PHASE71_KAWECO_BRAND_ID, perkeoId],
      ),
      1,
    );
    const missingBackLinks = await client.execute({
      sql: `SELECT pen.slug
            FROM public_entities pen
            JOIN entity_links maker
              ON maker.source_id = pen.id
             AND maker.target_id = ?
             AND maker.link_type = 'made_by'
       LEFT JOIN entity_links reverse
              ON reverse.source_id = ?
             AND reverse.target_id = pen.id
             AND reverse.link_type = 'reverse'
           WHERE pen.type = 'pen'
           GROUP BY pen.id, pen.slug
          HAVING count(reverse.id) <> 1`,
      args: [PHASE71_KAWECO_BRAND_ID, PHASE71_KAWECO_BRAND_ID],
    });
    assert.equal(
      missingBackLinks.rows.length,
      0,
      "every public Kaweco model must retain one brand navigation link",
    );
    const asset = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [perkeoId],
    });
    assert.equal(asset.rows.length, 1);
    assert.match(
      String(asset.rows[0]?.local_path),
      /kaweco-perkeo-all-black-facts\.svg$/,
    );
    assert.match(
      fs.readFileSync(
        path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)),
        "utf8",
      ),
      /示意图，非产品照片/,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE source_path = ?",
        [`/pen/${PHASE79_KAWECO_PERKEO_SLUG}`],
      ),
      0,
    );
    const replay = await applyPhase79KawecoPerkeoContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
