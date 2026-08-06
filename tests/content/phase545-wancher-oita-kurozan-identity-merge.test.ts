import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase521Options,
  applyPhase521WancherJapaneseLacquerSiblings,
} from "../../scripts/apply-phase521-wancher-japanese-lacquer-siblings";
import {
  type ApplyPhase524Options,
  applyPhase524WancherYakumoChijimiOita,
} from "../../scripts/apply-phase524-wancher-yakumo-chijimi-oita";
import {
  type ApplyPhase545Options,
  applyPhase545WancherOitaKurozanIdentityMerge,
} from "../../scripts/apply-phase545-wancher-oita-kurozan-identity-merge";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const DUPLICATE_ID = "phase524-wancher-oita-urushi-kurozan";
const CANONICAL_ID = "phase521-wancher-oita-urushi-kurozan";
const BRAND_ID = "eOfD77nOeENN";

test("Phase 545 retires the duplicate Wancher Oita Kurozan identity", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase545-wancher-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const testEnv: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "test",
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: "",
  };
  const common = {
    workspaceRoot: ROOT,
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: testEnv,
  };
  try {
    await migrateDatabase(client);
    const packageOptions: ApplyPhase521Options & ApplyPhase524Options = {
      ...common,
      reviewer: "phase545-wancher-oita-kurozan-identity-merge-test",
    };
    await applyPhase521WancherJapaneseLacquerSiblings(client, packageOptions);
    await applyPhase524WancherYakumoChijimiOita(client, packageOptions);
    await assert.rejects(
      applyPhase545WancherOitaKurozanIdentityMerge(client, {
        ...common,
        reviewer: "phase545-wancher-oita-kurozan-identity-merge-test",
        env: { ...common.env, TURSO_DATABASE_URL: "libsql://remote.invalid" },
      } as ApplyPhase545Options),
      /inherited remote database selection/,
    );
    const first = await applyPhase545WancherOitaKurozanIdentityMerge(client, {
      ...common,
      reviewer: "phase545-wancher-oita-kurozan-identity-merge-test",
    });
    assert.deepEqual(first, {
      outcome: "retired",
      sourceId: DUPLICATE_ID,
      targetId: CANONICAL_ID,
      sourcePath: "/pen/wancher-oita-urushi-kurozan",
      targetPath: "/pen/wancher-oita-urushi-kurozan-fountain-pen",
    });
    const publications = await client.execute({
      sql: "SELECT entity_id,status,blockers_json FROM entity_publications WHERE entity_id IN (?,?) ORDER BY entity_id",
      args: [DUPLICATE_ID, CANONICAL_ID],
    });
    assert.deepEqual(
      publications.rows.map((row) => [
        String(row.entity_id),
        String(row.status),
        row.blockers_json ?? null,
      ]),
      [
        [CANONICAL_ID, "published", "[]"],
        [DUPLICATE_ID, "retired", '["taxonomy_merged"]'],
      ].sort((a, b) => a[0].localeCompare(b[0])),
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM public_entities WHERE id=?",
            args: [DUPLICATE_ID],
          })
        ).rows[0]?.n,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM public_entities WHERE id=?",
            args: [CANONICAL_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=?",
            args: [BRAND_ID, DUPLICATE_ID],
          })
        ).rows[0]?.n,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [BRAND_ID, CANONICAL_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const redirect = await client.execute({
      sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      args: ["/pen/wancher-oita-urushi-kurozan"],
    });
    assert.deepEqual(
      redirect.rows.map((row) => [
        String(row.target_path),
        String(row.redirect_kind),
      ]),
      [["/pen/wancher-oita-urushi-kurozan-fountain-pen", "permanent"]],
    );
    const lineage = await client.execute({
      sql: "SELECT target_entity_id,lineage_kind FROM entity_lineage WHERE source_entity_id=?",
      args: [DUPLICATE_ID],
    });
    assert.deepEqual(
      lineage.rows.map((row) => [
        String(row.target_entity_id),
        String(row.lineage_kind),
      ]),
      [[CANONICAL_ID, "merge"]],
    );
    const replay = await applyPhase545WancherOitaKurozanIdentityMerge(client, {
      ...common,
      reviewer: "phase545-wancher-oita-kurozan-identity-merge-test",
    });
    assert.equal(replay.outcome, "noop");
    assertCatalogSnapshotUnchanged(
      protectedSnapshot,
      snapshotCatalogFiles(REAL),
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
