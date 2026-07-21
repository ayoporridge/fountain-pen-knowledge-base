import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyCuratedContentPacks } from "../../scripts/apply-phase22-content";
import {
  applyPhase110PilotContent,
  PHASE110_GRANCE_ID,
  PHASE110_JUSTUS_ID,
  PHASE110_PILOT_ID,
  PHASE110_SILVERN_ID,
} from "../../scripts/apply-phase110-pilot-justus-95-silvern-grance-content";
import {
  phase84PlatinumPilotP0V3BrandPacks,
  phase84PlatinumPilotP0V3Packs,
} from "../../scripts/data/phase84-platinum-pilot-p0-v3";
import { loadPhase110PilotPacks } from "../../scripts/data/phase110-pilot-justus-95-silvern-grance";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = "/Users/xz/CodeBuddy/fountain-pen-graph";
const REAL = path.join(ROOT, "data", "fpkg.db");
const IDS = [PHASE110_JUSTUS_ID, PHASE110_SILVERN_ID, PHASE110_GRANCE_ID];

async function rows(client: Client, sql: string, args: unknown[] = []) {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

async function targetSummary(client: Client) {
  return {
    entities: await rows(
      client,
      "SELECT id,slug,name,summary,body_md FROM entities WHERE id IN (?,?,?) ORDER BY id",
      IDS,
    ),
    makers: await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id IN (?,?,?) ORDER BY source_id",
      IDS,
    ),
    variants: await rows(
      client,
      "SELECT model_entity_id,variant_name,notes FROM model_variants WHERE model_entity_id IN (?,?,?) ORDER BY model_entity_id,variant_name",
      IDS,
    ),
    publications: await rows(
      client,
      "SELECT entity_id,status,content_revision,approved_content_hash FROM entity_publications WHERE entity_id IN (?,?,?) ORDER BY entity_id",
      IDS,
    ),
  };
}

async function preparePilot(
  client: Client,
  database: string,
  ownedRoot: string,
) {
  const brand = phase84PlatinumPilotP0V3BrandPacks.find(
    (pack) => pack.entityId === PHASE110_PILOT_ID,
  );
  const pen = phase84PlatinumPilotP0V3Packs.find(
    (pack) => pack.spec?.brandEntityId === PHASE110_PILOT_ID,
  );
  assert.ok(brand && pen);
  await client.execute({
    sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
    args: [pen.entityId, pen.expectedSlug, pen.canonicalName],
  });
  await client.execute({
    sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by'",
    args: [pen.entityId],
  });
  await client.execute({
    sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by','Phase 110 fixture')",
    args: [`phase110-fixture-${pen.entityId}`, pen.entityId, PHASE110_PILOT_ID],
  });
  await applyCuratedContentPacks(
    client,
    {
      databasePath: database,
      ownedRoot,
      protectedCatalogPath: REAL,
      protectedCatalogSnapshot: snapshotCatalogFiles(REAL),
      workspaceRoot: ROOT,
      reviewer: "phase110-fixture",
      env: { NODE_ENV: "test" as const },
    },
    structuredClone([brand, pen]),
  );
}

test("Phase 110 publishes three exact-new Pilot pages on an owned checkpoint and replays as noop", async () => {
  const protectedBefore = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase110-")),
  );
  const database = path.join(ownedRoot, "catalog.db");
  copyCheckpointedCatalogToDisposableCopy(REAL, database, ownedRoot);
  const client = createClient({ url: `file:${database}` });
  await migrateDatabase(client);
  try {
    await preparePilot(client, database, ownedRoot);
    const brandHash = await computePublicationContentHash(
      client,
      PHASE110_PILOT_ID,
    );
    const brandPayload = await rows(
      client,
      "SELECT id,slug,name,summary,body_md FROM entities WHERE id=?",
      [PHASE110_PILOT_ID],
    );
    const nonTargets = await rows(
      client,
      "SELECT e.id,e.slug,e.name FROM entity_links l JOIN entities e ON e.id=l.source_id WHERE l.link_type='made_by' AND l.target_id=? ORDER BY e.id",
      [PHASE110_PILOT_ID],
    );
    const options = {
      databasePath: database,
      ownedRoot,
      protectedCatalogPath: REAL,
      protectedCatalogSnapshot: protectedBefore,
      workspaceRoot: ROOT,
      reviewer: "phase110-test",
      env: { NODE_ENV: "test" as const },
    };
    const first = await applyPhase110PilotContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.outcome),
      ["published", "published", "published"],
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT source_id,target_id FROM entity_links WHERE source_id IN (?,?,?) AND link_type='made_by' ORDER BY source_id",
        IDS,
      ),
      IDS.toSorted().map((id) => ({
        source_id: id,
        target_id: PHASE110_PILOT_ID,
      })),
    );
    const postTopologyBrandHash = await computePublicationContentHash(
      client,
      PHASE110_PILOT_ID,
    );
    assert.notEqual(postTopologyBrandHash, brandHash);
    assert.deepEqual(
      await rows(
        client,
        "SELECT id,slug,name,summary,body_md FROM entities WHERE id=?",
        [PHASE110_PILOT_ID],
      ),
      brandPayload,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT status FROM entity_publications WHERE entity_id=?",
          [PHASE110_PILOT_ID],
        )
      )[0]?.status,
      "published",
    );
    const packs = loadPhase110PilotPacks(ownedRoot);
    for (const pack of packs) {
      assert.ok([...pack.bodyMd].length >= 2000);
      assert.equal(
        pack.media.filter((media) => media.usageStatus === "primary").length,
        1,
      );
      assert.ok(
        pack.sources.some((source) => source.sourceType === "official"),
      );
      assert.ok(
        pack.sources.some((source) => source.tier === "professional_secondary"),
      );
    }
    const publicTargets = await rows(
      client,
      "SELECT e.id,e.slug FROM public_entities p JOIN entities e ON e.id=p.id WHERE e.id IN (?,?,?) ORDER BY e.id",
      IDS,
    );
    assert.equal(publicTargets.length, 3);
    const terminalBeforeReplay = await targetSummary(client);
    const second = await applyPhase110PilotContent(client, options);
    assert.deepEqual(
      second.entities.map((item) => item.outcome),
      ["noop", "noop", "noop"],
    );
    assert.deepEqual(await targetSummary(client), terminalBeforeReplay);
    assert.deepEqual(
      await rows(
        client,
        "SELECT e.id,e.slug,e.name FROM entity_links l JOIN entities e ON e.id=l.source_id WHERE l.link_type='made_by' AND l.target_id=? AND e.id NOT IN (?,?,?) ORDER BY e.id",
        [PHASE110_PILOT_ID, ...IDS],
      ),
      nonTargets,
    );
    await client.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE110_JUSTUS_ID],
    });
    assert.notEqual(
      await computePublicationContentHash(client, PHASE110_PILOT_ID),
      postTopologyBrandHash,
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT id,slug,name,summary,body_md FROM entities WHERE id=?",
        [PHASE110_PILOT_ID],
      ),
      brandPayload,
    );
    await assert.rejects(
      applyPhase110PilotContent(client, options),
      /exact made_by topology mismatch.*phase110-pilot-justus-95/i,
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedBefore);
  }
});

test("Phase 110 exact collision and authority failures happen before writes", async () => {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase110-collision-")),
  );
  const database = path.join(ownedRoot, "catalog.db");
  copyCheckpointedCatalogToDisposableCopy(REAL, database, ownedRoot);
  const client = createClient({ url: `file:${database}` });
  await migrateDatabase(client);
  try {
    await preparePilot(client, database, ownedRoot);
    await client.execute(
      "INSERT INTO entities(id,type,slug,name) VALUES('phase110-collision','pen','collision','Pilot Justus 95')",
    );
    const before = await targetSummary(client);
    const protectedCatalogSnapshot = snapshotCatalogFiles(REAL);
    await assert.rejects(
      applyPhase110PilotContent(client, {
        databasePath: database,
        ownedRoot,
        protectedCatalogPath: REAL,
        protectedCatalogSnapshot,
        workspaceRoot: ROOT,
        reviewer: "phase110-test",
        env: { NODE_ENV: "test" },
      }),
      /exact-name.*phase110-collision.*collision/i,
    );
    assert.deepEqual(await targetSummary(client), before);
    await assert.rejects(
      applyPhase110PilotContent(client, {
        databasePath: database,
        ownedRoot,
        protectedCatalogPath: REAL,
        protectedCatalogSnapshot,
        workspaceRoot: "/Users/xz/Documents/fountain-pen-graph",
        reviewer: "phase110-test",
        env: { NODE_ENV: "test" },
      }),
      /logical workspace/i,
    );
    await assert.rejects(
      applyPhase110PilotContent(client, {
        databasePath: database,
        ownedRoot,
        protectedCatalogPath: REAL,
        protectedCatalogSnapshot,
        workspaceRoot: ROOT,
        reviewer: "",
        env: { NODE_ENV: "test" },
      }),
      /reviewer/i,
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
