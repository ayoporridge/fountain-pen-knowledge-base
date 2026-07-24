import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase165EversharpChilton } from "../../scripts/apply-phase165-eversharp-chilton-content";
import {
  PHASE165_CHILTON_BRAND_ID,
  PHASE165_DORIC_ID,
  PHASE165_EVERSHARP_BRAND_ID,
  PHASE165_WING_FLOW_ID,
} from "../../scripts/data/phase165-eversharp-chilton";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGETS = [
  PHASE165_EVERSHARP_BRAND_ID,
  PHASE165_DORIC_ID,
  PHASE165_CHILTON_BRAND_ID,
  PHASE165_WING_FLOW_ID,
] as const;

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 165 publishes Eversharp Doric and Chilton Wing-flow on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase165-")),
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
    reviewer: "phase165-eversharp-chilton-test",
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
    await assert.rejects(
      applyPhase165EversharpChilton(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase165EversharpChilton(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      TARGETS,
    );
    for (const target of TARGETS) {
      assert.equal(
        first.entities.find((item) => item.entityId === target)?.outcome,
        "published",
      );
      const row = await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [target],
      });
      const body = String(row.rows[0]?.body_md ?? "");
      assert.ok(
        Array.from(body).length >=
          (target === PHASE165_EVERSHARP_BRAND_ID ||
          target === PHASE165_CHILTON_BRAND_ID
            ? 1_200
            : 2_000),
      );
      assert.match(
        body,
        target === PHASE165_DORIC_ID
          ? /Doric|多面|Eversharp/i
          : target === PHASE165_WING_FLOW_ID
            ? /Wing-flow|环抱|Chilton/i
            : /Eversharp|Chilton/i,
      );
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT status FROM entity_publications WHERE entity_id=?",
            args: [target],
          })
        ).rows[0]?.status,
        "published",
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE165_DORIC_ID, PHASE165_EVERSHARP_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE165_WING_FLOW_ID, PHASE165_CHILTON_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE entity_id IN (?,?)",
        [PHASE165_DORIC_ID, PHASE165_WING_FLOW_ID],
      ),
      2,
    );
    const replay = await applyPhase165EversharpChilton(client, options);
    assert.ok(replay.entities.every((item) => item.outcome === "noop"));
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
