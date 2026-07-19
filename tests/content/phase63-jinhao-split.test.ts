import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase63JinhaoSplitContent } from "../../scripts/apply-phase63-jinhao-split-content";
import {
  PHASE63_159_ID,
  PHASE63_JINHAO_BRAND_ID,
  PHASE63_MIXED_SLUG,
  PHASE63_X159_ID,
} from "../../scripts/data/phase63-jinhao-split";
import {
  assertCatalogSnapshotUnchanged,
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

test("Phase 63 splits Jinhao 159 from X159 on an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase63-jinhao-")),
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
    reviewer: "phase63-jinhao-split-test",
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
    await assert.rejects(
      applyPhase63JinhaoSplitContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection: FPKG_DATABASE_URL/,
    );
    const first = await applyPhase63JinhaoSplitContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );
    const pages = await client.execute({
      sql: "SELECT id, slug, length(summary) AS summary_length, length(body_md) AS body_length, body_md FROM public_entities WHERE id IN (?, ?, ?) ORDER BY id",
      args: [PHASE63_JINHAO_BRAND_ID, PHASE63_159_ID, PHASE63_X159_ID],
    });
    assert.equal(pages.rows.length, 3);
    for (const page of pages.rows) {
      assert.ok(Number(page.summary_length) >= 60);
      assert.ok(Number(page.body_length) >= 2_000);
      assert.doesNotMatch(
        String(page.body_md),
        /\b(?:canonical|made_by|retired)\b|数据库|仓库/i,
      );
    }
    const historic = String(
      pages.rows.find((row) => String(row.id) === PHASE63_159_ID)?.body_md ??
        "",
    );
    assert.match(historic, /金属[\s\S]*X159[\s\S]*(?:不能|不得)/);
    const x159 = String(
      pages.rows.find((row) => String(row.id) === PHASE63_X159_ID)?.body_md ??
        "",
    );
    assert.match(x159, /acrylic[\s\S]*#8[\s\S]*converter/i);
    for (const penId of [PHASE63_159_ID, PHASE63_X159_ID]) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [penId, PHASE63_JINHAO_BRAND_ID],
        ),
        1,
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'reverse' AND target_id IN (?, ?)",
        [PHASE63_JINHAO_BRAND_ID, PHASE63_159_ID, PHASE63_X159_ID],
      ),
      2,
    );
    const redirect = await client.execute({
      sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
      args: [`/pen/${PHASE63_MIXED_SLUG}`],
    });
    assert.deepEqual(redirect.rows, [
      { target_path: null, redirect_kind: "hard_404" },
    ]);
    const replay = await applyPhase63JinhaoSplitContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
