import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase41IdentityCleanupContent } from "../../scripts/apply-phase41-identity-cleanup-content";
import { applyPhase48WatermanAuroraContent } from "../../scripts/apply-phase48-waterman-aurora-content";
import {
  type ApplyPhase90Options,
  applyPhase90JinhaoContent,
} from "../../scripts/apply-phase90-jinhao-82-9019-content";
import {
  PHASE48_AURORA_BRAND_ID,
  PHASE48_AURORA_OPTIMA_ID,
} from "../../scripts/data/phase48-waterman-aurora";
import { PHASE63_JINHAO_BRAND_ID } from "../../scripts/data/phase63-jinhao-split";
import {
  PHASE90_JINHAO_82_ID,
  PHASE90_JINHAO_82_SLUG,
  PHASE90_JINHAO_9019_ID,
  PHASE90_JINHAO_9019_SLUG,
} from "../../scripts/data/phase90-jinhao-82-9019";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

test("Phase 90 publishes Jinhao 82 and 9019 on an owned checkpoint and replays as noop", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase90-jinhao-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase90Options = {
    workspaceRoot: ROOT,
    reviewer: "phase90-jinhao-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL_CATALOG,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };

  try {
    await migrateDatabase(client);
    await applyPhase41IdentityCleanupContent(client, options);
    await applyPhase48WatermanAuroraContent(client, options);
    const auroraBefore = await client.execute({
      sql: `SELECT entity_id,status,approved_content_hash,
                   CASE WHEN public_entities.id IS NULL THEN 0 ELSE 1 END AS is_public
            FROM entity_publications
            LEFT JOIN public_entities ON public_entities.id=entity_publications.entity_id
            WHERE entity_id IN (?,?) ORDER BY entity_id`,
      args: [PHASE48_AURORA_BRAND_ID, PHASE48_AURORA_OPTIMA_ID],
    });
    assert.equal(auroraBefore.rows.length, 2);
    assert.ok(
      auroraBefore.rows.every(
        (row) => row.status === "published" && Number(row.is_public) === 1,
      ),
    );
    await assert.rejects(
      applyPhase90JinhaoContent(client, {
        ...options,
        reviewer: " ",
      }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase90JinhaoContent(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          FPKG_DATABASE_URL: "libsql://remote",
        } as NodeJS.ProcessEnv,
      }),
      /refuses remote selection: FPKG_DATABASE_URL/,
    );

    const first = await applyPhase90JinhaoContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );
    const auroraAfter = await client.execute({
      sql: `SELECT entity_id,status,approved_content_hash,
                   CASE WHEN public_entities.id IS NULL THEN 0 ELSE 1 END AS is_public
            FROM entity_publications
            LEFT JOIN public_entities ON public_entities.id=entity_publications.entity_id
            WHERE entity_id IN (?,?) ORDER BY entity_id`,
      args: [PHASE48_AURORA_BRAND_ID, PHASE48_AURORA_OPTIMA_ID],
    });
    assert.deepEqual(auroraAfter.rows, auroraBefore.rows);

    const pages = await client.execute({
      sql: "SELECT id,type,slug,length(summary) AS summary_length,length(body_md) AS body_length FROM public_entities WHERE id IN (?,?,?) ORDER BY id",
      args: [
        PHASE63_JINHAO_BRAND_ID,
        PHASE90_JINHAO_82_ID,
        PHASE90_JINHAO_9019_ID,
      ],
    });
    assert.equal(pages.rows.length, 3);
    for (const page of pages.rows) {
      assert.equal(
        String(page.type),
        String(page.id) === PHASE63_JINHAO_BRAND_ID ? "brand" : "pen",
      );
      assert.ok(Number(page.summary_length) >= 60);
      assert.ok(Number(page.body_length) >= 2_000);
    }
    const identity = await client.execute({
      sql: "SELECT id,slug FROM entities WHERE id IN (?,?) ORDER BY id",
      args: [PHASE90_JINHAO_82_ID, PHASE90_JINHAO_9019_ID],
    });
    assert.deepEqual(identity.rows, [
      { id: PHASE90_JINHAO_82_ID, slug: PHASE90_JINHAO_82_SLUG },
      { id: PHASE90_JINHAO_9019_ID, slug: PHASE90_JINHAO_9019_SLUG },
    ]);

    const makers = await client.execute({
      sql: "SELECT source_id,target_id FROM entity_links WHERE source_id IN (?,?) AND link_type='made_by' ORDER BY source_id",
      args: [PHASE90_JINHAO_82_ID, PHASE90_JINHAO_9019_ID],
    });
    assert.equal(makers.rows.length, 2);
    assert.ok(
      makers.rows.every(
        (row) => String(row.target_id) === PHASE63_JINHAO_BRAND_ID,
      ),
    );

    const replay = await applyPhase90JinhaoContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop"],
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
