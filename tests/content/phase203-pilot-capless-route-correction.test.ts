import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase43PilotCaplessContent } from "../../scripts/apply-phase43-pilot-capless-content";
import { applyPhase203PilotCaplessRouteCorrection } from "../../scripts/apply-phase203-pilot-capless-route-correction";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 203 corrects the retired Capless umbrella route to Decimo on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase203-capless-route-"),
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
    reviewer: "phase203-pilot-capless-route-test",
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
    await applyPhase43PilotCaplessContent(client, options);
    await assert.rejects(
      () =>
        applyPhase203PilotCaplessRouteCorrection(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    await applyPhase203PilotCaplessRouteCorrection(client, options);
    const redirect = await client.execute({
      sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      args: ["/pen/百乐-pilot-capless-decimo"],
    });
    assert.deepEqual(redirect.rows, [
      { target_path: "/pen/pilot-capless-decimo", redirect_kind: "permanent" },
    ]);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id=?",
          args: ["fuB0SU-om1z5"],
        })
      ).rows[0]?.status,
      "retired",
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id=?",
          args: ["s43PILOTDECI"],
        })
      ).rows[0]?.status,
      "published",
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM taxonomy_actions WHERE source_row_key=? AND action_kind='alias'",
            args: ["phase203-pilot-capless-decimo-route-correction"],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    await applyPhase203PilotCaplessRouteCorrection(client, options);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
          args: ["/pen/百乐-pilot-capless-decimo"],
        })
      ).rows,
      [
        {
          target_path: "/pen/pilot-capless-decimo",
          redirect_kind: "permanent",
        },
      ],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
