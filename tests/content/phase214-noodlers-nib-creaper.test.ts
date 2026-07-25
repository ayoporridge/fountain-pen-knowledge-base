import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase214NoodlersNibCreaperContent } from "../../scripts/apply-phase214-noodlers-nib-creaper-content";
import {
  PHASE214_CANONICAL_SLUG,
  PHASE214_NIB_CREAPER_ID,
  PHASE214_NOODLERS_BRAND_ID,
  PHASE214_OLD_SLUG,
} from "../../scripts/data/phase214-noodlers-nib-creaper";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 214 canonicalizes and publishes Noodler's Nib Creaper on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase214-noodlers-"),
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
    reviewer: "phase214-noodlers-nib-creaper-test",
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
      () =>
        applyPhase214NoodlersNibCreaperContent(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase214NoodlersNibCreaperContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE214_NOODLERS_BRAND_ID, PHASE214_NIB_CREAPER_ID],
    );
    assert.ok(
      first.entities.every((item) => item.outcome === "published"),
      JSON.stringify(first),
    );

    const identity = await client.execute({
      sql: "SELECT type,slug,name,source FROM entities WHERE id=?",
      args: [PHASE214_NIB_CREAPER_ID],
    });
    assert.equal(identity.rows[0]?.type, "pen");
    assert.equal(identity.rows[0]?.slug, PHASE214_CANONICAL_SLUG);
    assert.equal(identity.rows[0]?.name, "Noodler's Nib Creaper");
    assert.match(
      String(identity.rows[0]?.source ?? ""),
      /curated-content:phase214-noodlers-nib-creaper/,
    );
    const redirect = await client.execute({
      sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      args: [`/pen/${PHASE214_OLD_SLUG}`],
    });
    assert.deepEqual(redirect.rows[0], {
      target_path: `/pen/${PHASE214_CANONICAL_SLUG}`,
      redirect_kind: "permanent",
    });

    for (const entityId of [
      PHASE214_NOODLERS_BRAND_ID,
      PHASE214_NIB_CREAPER_ID,
    ]) {
      const publicRow = await client.execute({
        sql: "SELECT body_md,source FROM public_entities WHERE id=?",
        args: [entityId],
      });
      const body = String(publicRow.rows[0]?.body_md ?? "");
      assert.ok(
        Array.from(body).length >=
          (entityId === PHASE214_NIB_CREAPER_ID ? 2000 : 1200),
      );
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.match(
        String(publicRow.rows[0]?.source ?? ""),
        /curated-content:phase214/,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
              args: [entityId],
            })
          ).rows[0]?.value,
        ),
        1,
      );
    }
    assert.match(
      String(
        (
          await client.execute({
            sql: "SELECT body_md FROM public_entities WHERE id=?",
            args: [PHASE214_NIB_CREAPER_ID],
          })
        ).rows[0]?.body_md ?? "",
      ),
      /活塞|墨窗|flex|维护|选购/,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE214_NIB_CREAPER_ID, PHASE214_NOODLERS_BRAND_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    const replay = await applyPhase214NoodlersNibCreaperContent(
      client,
      options,
    );
    assert.ok(
      replay.entities.every((item) => item.outcome === "noop"),
      JSON.stringify(replay),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
