import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase166ChiltonLateModels } from "../../scripts/apply-phase166-chilton-late-models-content";
import { PHASE165_CHILTON_BRAND_ID } from "../../scripts/data/phase165-eversharp-chilton";
import {
  PHASE166_CHILTONIAN_ID,
  PHASE166_GOLDEN_QUILL_ID,
} from "../../scripts/data/phase166-chilton-late-models";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 166 publishes Chiltonian and Golden Quill on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase166-")),
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
    reviewer: "phase166-chilton-late-models-test",
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
      applyPhase166ChiltonLateModels(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase166ChiltonLateModels(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [
        PHASE165_CHILTON_BRAND_ID,
        PHASE166_CHILTONIAN_ID,
        PHASE166_GOLDEN_QUILL_ID,
      ],
    );
    for (const target of [
      PHASE165_CHILTON_BRAND_ID,
      PHASE166_CHILTONIAN_ID,
      PHASE166_GOLDEN_QUILL_ID,
    ]) {
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
          (target === PHASE165_CHILTON_BRAND_ID ? 1_200 : 2_000),
      );
      assert.match(
        body,
        target === PHASE166_CHILTONIAN_ID
          ? /Chiltonian|Long Island/i
          : target === PHASE166_GOLDEN_QUILL_ID
            ? /Golden Quill|1939/i
            : /Chilton/i,
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
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE166_CHILTONIAN_ID, PHASE165_CHILTON_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE166_GOLDEN_QUILL_ID, PHASE165_CHILTON_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id IN (?,?)",
          args: [PHASE166_CHILTONIAN_ID, PHASE166_GOLDEN_QUILL_ID],
        })
      ).rows[0]?.value,
      2,
    );
    assert.ok(
      (await applyPhase166ChiltonLateModels(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
