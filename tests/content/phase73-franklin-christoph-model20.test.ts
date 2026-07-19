import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase73FranklinChristophModel20Content } from "../../scripts/apply-phase73-franklin-christoph-model20-content";
import {
  PHASE73_BRAND_SLUG,
  PHASE73_MODEL20_SLUG,
} from "../../scripts/data/phase73-franklin-christoph-model20";
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

test("Phase 73 publishes only the verified full-size Model 20 Marietta on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase73-franklin-christoph-")),
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
    reviewer: "phase73-franklin-christoph-model20",
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
    const first = await applyPhase73FranklinChristophModel20Content(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const pages = await client.execute({
      sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE slug IN (?, ?) ORDER BY type, slug",
      args: [PHASE73_BRAND_SLUG, PHASE73_MODEL20_SLUG],
    });
    assert.equal(pages.rows.length, 2);
    const bySlug = new Map(pages.rows.map((row) => [String(row.slug), row]));
    const brand = bySlug.get(PHASE73_BRAND_SLUG);
    const model = bySlug.get(PHASE73_MODEL20_SLUG);
    assert.ok(brand);
    assert.ok(model);
    assert.equal(String(brand?.type), "brand");
    assert.equal(String(model?.type), "pen");
    for (const page of [brand, model]) {
      assert.ok(
        String(page?.summary ?? "").length >= 60 &&
          String(page?.summary ?? "").length <= 160,
      );
      assert.ok(String(page?.body_md ?? "").length >= 2_000);
      assert.match(String(page?.body_md), /示意图，非产品照片/);
      assert.doesNotMatch(
        String(page?.body_md),
        /数据库|仓库|canonical|made_by/i,
      );
    }
    const body = String(model?.body_md);
    assert.match(body, /138\.43 mm[\s\S]*19\.28 g[\s\S]*converter/);
    assert.match(body, /119 mm[\s\S]*15\.3 g[\s\S]*pocket 20/);
    assert.match(body, /短国际墨囊[\s\S]*converter[\s\S]*滴入/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [String(model?.id), String(brand?.id)],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [String(brand?.id), String(model?.id)],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [String(model?.id)],
      ),
      1,
    );
    const media = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [String(model?.id)],
    });
    assert.equal(media.rows.length, 1);
    const localPath = String(media.rows[0]?.local_path);
    assert.match(localPath, /franklin-christoph-model20-marietta\.svg$/);
    assert.match(
      fs.readFileSync(path.join(ROOT, "public", localPath.slice(1)), "utf8"),
      /示意图，非产品照片/,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id = ? AND (lower(slug) LIKE '%pocket%' OR lower(name) LIKE '%pocket%' OR lower(name) LIKE '%p20%')",
        [String(model?.id)],
      ),
      0,
      "a pocket 20 row must never be relabelled and published as Marietta",
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE target_path = ? AND (lower(source_path) LIKE '%pocket%' OR lower(source_path) LIKE '%p20%')",
        [`/pen/${PHASE73_MODEL20_SLUG}`],
      ),
      0,
      "the full-size page must not absorb a pocket 20 route",
    );
    const replay = await applyPhase73FranklinChristophModel20Content(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
