import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase175SailorClassicKo } from "../../scripts/apply-phase175-sailor-classic-ko-content";
import {
  PHASE175_CLASSIC_KO_ID,
  PHASE175_SAILOR_BRAND_ID,
} from "../../scripts/data/phase175-sailor-classic-ko";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 175 publishes Sailor Classic Ko Dot's on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase175-sailor-classic-ko-"),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase175-sailor-classic-ko-test",
    databasePath: copy.destinationPath,
    ownedRoot,
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
      applyPhase175SailorClassicKo(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase175SailorClassicKo(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE175_SAILOR_BRAND_ID, PHASE175_CLASSIC_KO_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE175_CLASSIC_KO_ID)
        ?.outcome,
      "published",
    );
    const row = await client.execute({
      sql: "SELECT body_md,source FROM public_entities WHERE id=?",
      args: [PHASE175_CLASSIC_KO_ID],
    });
    const body = String(row.rows[0]?.body_md ?? "");
    assert.ok(Array.from(body).length >= 2200, "Classic Ko body too short");
    assert.match(body, /Classic Ko|蒔絵|21K|Dot's|维护|选购/i);
    assert.ok(!/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body));
    assert.match(
      String(row.rows[0]?.source ?? ""),
      /curated-content:phase175-sailor-classic-ko/,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id=?",
          args: [PHASE175_CLASSIC_KO_ID],
        })
      ).rows[0]?.status,
      "published",
    );
    for (const [sourceId, targetId, linkType] of [
      [PHASE175_CLASSIC_KO_ID, PHASE175_SAILOR_BRAND_ID, "made_by"],
      [PHASE175_SAILOR_BRAND_ID, PHASE175_CLASSIC_KO_ID, "reverse"],
    ] as const) {
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type=?",
            args: [sourceId, targetId, linkType],
          })
        ).rows[0]?.value,
        1,
      );
    }
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
          args: [PHASE175_CLASSIC_KO_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.ok(
      (await applyPhase175SailorClassicKo(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
