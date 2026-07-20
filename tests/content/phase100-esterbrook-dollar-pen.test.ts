import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase69EsterbrookEstieContent } from "../../scripts/apply-phase69-esterbrook-estie-content";
import { applyPhase82EsterbrookJContent } from "../../scripts/apply-phase82-esterbrook-j-content";
import { applyPhase100EsterbrookDollarPenContent } from "../../scripts/apply-phase100-esterbrook-dollar-pen-content";
import { PHASE69_ESTERBROOK_BRAND_ID } from "../../scripts/data/phase69-esterbrook-estie";
import {
  PHASE100_ESTERBROOK_DOLLAR_PEN_ID,
  PHASE100_ESTERBROOK_DOLLAR_PEN_SLUG,
} from "../../scripts/data/phase100-esterbrook-dollar-pen";
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

test("Phase 100 publishes the existing Dollar Pen and retains every public Esterbrook model link", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase100-esterbrook-dollar-")),
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
    reviewer: "phase100-esterbrook-dollar-pen-test",
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
    await applyPhase69EsterbrookEstieContent(client, options);
    await applyPhase82EsterbrookJContent(client, options);
    await assert.rejects(
      applyPhase100EsterbrookDollarPenContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection: TURSO_DATABASE_URL/,
    );
    const first = await applyPhase100EsterbrookDollarPenContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const page = await client.execute({
      sql: "SELECT id, type, summary, body_md FROM public_entities WHERE slug = ?",
      args: [PHASE100_ESTERBROOK_DOLLAR_PEN_SLUG],
    });
    assert.equal(page.rows.length, 1);
    const dollar = page.rows[0];
    assert.ok(dollar);
    assert.equal(String(dollar.id), PHASE100_ESTERBROOK_DOLLAR_PEN_ID);
    assert.equal(String(dollar.type), "pen");
    assert.ok(Array.from(String(dollar.summary ?? "")).length >= 60);
    assert.ok(Array.from(String(dollar.summary ?? "")).length <= 160);
    const body = String(dollar.body_md ?? "");
    assert.ok(Array.from(body).length >= 2_000);
    assert.match(body, /B[／/]A[／/]H[\s\S]*1934[\s\S]*1942/);
    assert.match(body, /two-hole|两孔笔夹/i);
    assert.match(body, /lever filler/);
    assert.match(body, /Re-New-Point[\s\S]*Renew-Point/);
    assert.match(body, /Double Jewel[\s\S]*Model J[\s\S]*Estie[\s\S]*JR/);
    assert.match(body, /示意图，非产品照片/);
    assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE100_ESTERBROOK_DOLLAR_PEN_ID, PHASE69_ESTERBROOK_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [PHASE100_ESTERBROOK_DOLLAR_PEN_ID],
      ),
      1,
    );
    const reverse = await scalar(
      client,
      "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
      [PHASE69_ESTERBROOK_BRAND_ID, PHASE100_ESTERBROOK_DOLLAR_PEN_ID],
    );
    assert.equal(reverse, 1);
    const missingBackLinks = await client.execute({
      sql: `SELECT pen.slug FROM public_entities pen
            JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by'
            LEFT JOIN entity_links reverse ON reverse.source_id = ? AND reverse.target_id = pen.id AND reverse.link_type = 'reverse'
            WHERE pen.type = 'pen' GROUP BY pen.id, pen.slug HAVING count(reverse.id) <> 1`,
      args: [PHASE69_ESTERBROOK_BRAND_ID, PHASE69_ESTERBROOK_BRAND_ID],
    });
    assert.equal(
      missingBackLinks.rows.length,
      0,
      "every public Esterbrook model must retain exactly one brand navigation link",
    );
    const brand = await client.execute({
      sql: "SELECT body_md FROM public_entities WHERE id = ?",
      args: [PHASE69_ESTERBROOK_BRAND_ID],
    });
    assert.equal(brand.rows.length, 1);
    assert.match(
      String(brand.rows[0]?.body_md ?? ""),
      /Dollar Pen[\s\S]*J[\s\S]*Estie[\s\S]*Model J[\s\S]*JR/,
    );
    const redirects = await client.execute({
      sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = '/pen/the-esterbrook-dollar-pen'",
    });
    assert.equal(redirects.rows.length, 1);
    assert.equal(
      String(redirects.rows[0]?.target_path),
      `/pen/${PHASE100_ESTERBROOK_DOLLAR_PEN_SLUG}`,
    );
    assert.equal(String(redirects.rows[0]?.redirect_kind), "permanent");
    const asset = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [PHASE100_ESTERBROOK_DOLLAR_PEN_ID],
    });
    assert.equal(asset.rows.length, 1);
    assert.match(
      String(asset.rows[0]?.local_path),
      /esterbrook-dollar-pen\.svg$/,
    );
    assert.match(
      fs.readFileSync(
        path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)),
        "utf8",
      ),
      /not a product photograph/,
    );
    const replay = await applyPhase100EsterbrookDollarPenContent(
      client,
      options,
    );
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
