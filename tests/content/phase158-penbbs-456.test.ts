import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase158PenBbs456Content } from "../../scripts/apply-phase158-penbbs-456-content";
import {
  PHASE158_PENBBS_456_ID,
  PHASE158_PENBBS_456_OLD_SLUG,
  PHASE158_PENBBS_BRAND_ID,
} from "../../scripts/data/phase158-penbbs-456";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 158 canonicalizes and publishes the existing PenBBS 456 draft on an owned copy", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase158-penbbs-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(root, "catalog.db"),
    root,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase158-penbbs-456-test",
    databasePath: copy.destinationPath,
    ownedRoot: root,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: snapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT slug FROM entities WHERE id=?",
          args: [PHASE158_PENBBS_456_ID],
        })
      ).rows[0]?.slug,
      PHASE158_PENBBS_456_OLD_SLUG,
    );
    await assert.rejects(
      applyPhase158PenBbs456Content(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    assert.deepEqual(
      (await applyPhase158PenBbs456Content(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["published", "published"],
    );
    const row = await client.execute({
      sql: "SELECT slug,name FROM entities WHERE id=?",
      args: [PHASE158_PENBBS_456_ID],
    });
    assert.deepEqual(row.rows[0], { slug: "penbbs-456", name: "PenBBS 456" });
    const redirect = await client.execute({
      sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      args: [`/pen/${PHASE158_PENBBS_456_OLD_SLUG}`],
    });
    assert.deepEqual(redirect.rows[0], {
      target_path: "/pen/penbbs-456",
      redirect_kind: "permanent",
    });
    const publicRow = await client.execute({
      sql: "SELECT body_md FROM public_entities WHERE id=?",
      args: [PHASE158_PENBBS_456_ID],
    });
    assert.equal(publicRow.rows.length, 1);
    const body = String(publicRow.rows[0]?.body_md ?? "");
    assert.ok(Array.from(body).length >= 2_000);
    assert.match(body, /真空上墨/);
    assert.match(body, /268[\s\S]*308[\s\S]*355/);
    assert.ok(!/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body));
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE158_PENBBS_456_ID, PHASE158_PENBBS_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE158_PENBBS_BRAND_ID, PHASE158_PENBBS_456_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
        [PHASE158_PENBBS_456_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE entity_id=?",
        [PHASE158_PENBBS_456_ID],
      ),
      1,
    );
    assert.deepEqual(
      (await applyPhase158PenBbs456Content(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
