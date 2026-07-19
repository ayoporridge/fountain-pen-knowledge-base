import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase69EsterbrookEstieContent } from "../../scripts/apply-phase69-esterbrook-estie-content";
import {
  PHASE69_ESTERBROOK_BRAND_ID,
  PHASE69_ESTIE_OVERSIZED_ID,
  PHASE69_ESTIE_OVERSIZED_SLUG,
} from "../../scripts/data/phase69-esterbrook-estie";
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

test("Phase 69 publishes the sourced Estie Oversized page on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase69-esterbrook-")),
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
    reviewer: "phase69-esterbrook-estie",
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
    const redirectsBefore = await scalar(
      client,
      "SELECT count(*) AS value FROM entity_redirects WHERE target_path = ? AND source_path <> ?",
      [
        `/pen/${PHASE69_ESTIE_OVERSIZED_SLUG}`,
        `/pen/${PHASE69_ESTIE_OVERSIZED_SLUG}`,
      ],
    );
    const first = await applyPhase69EsterbrookEstieContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const pen = await client.execute({
      sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE id = ?",
      args: [PHASE69_ESTIE_OVERSIZED_ID],
    });
    assert.equal(pen.rows.length, 1);
    const row = pen.rows[0];
    assert.equal(String(row?.type), "pen");
    assert.equal(String(row?.slug), PHASE69_ESTIE_OVERSIZED_SLUG);
    assert.ok(
      String(row?.summary ?? "").length >= 60 &&
        String(row?.summary ?? "").length <= 160,
    );
    assert.ok(String(row?.body_md ?? "").length >= 2_000);
    assert.match(String(row?.body_md), /示意图，非产品照片/);
    assert.match(
      String(row?.body_md),
      /JoWo #6[\s\S]*button piston[\s\S]*MV Nib Adaptor/,
    );
    assert.doesNotMatch(String(row?.body_md), /数据库|仓库|canonical|made_by/i);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE69_ESTIE_OVERSIZED_ID, PHASE69_ESTERBROOK_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [PHASE69_ESTERBROOK_BRAND_ID, PHASE69_ESTIE_OVERSIZED_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id = ?",
        [PHASE69_ESTIE_OVERSIZED_ID],
      ),
      1,
    );
    const media = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [PHASE69_ESTIE_OVERSIZED_ID],
    });
    assert.equal(media.rows.length, 1);
    const localPath = String(media.rows[0]?.local_path);
    assert.match(localPath, /esterbrook-estie-oversized\.svg$/);
    assert.match(
      fs.readFileSync(path.join(ROOT, "public", localPath.slice(1)), "utf8"),
      /示意图，非产品照片/,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE target_path = ? AND source_path <> ?",
        [`/pen/${PHASE69_ESTIE_OVERSIZED_SLUG}`, `/pen/${PHASE69_ESTIE_OVERSIZED_SLUG}`],
      ),
      redirectsBefore,
      "the content phase must not redirect a color or unverified route to the generic Estie Oversized page",
    );
    const replay = await applyPhase69EsterbrookEstieContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
