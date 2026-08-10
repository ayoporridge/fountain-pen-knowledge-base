import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase559WancherDreamPenAluminumClassic } from "../../scripts/apply-phase559-wancher-dream-pen-aluminum-classic";
import { applyPhase560WancherDreamPenAluminumContemporary } from "../../scripts/apply-phase560-wancher-dream-pen-aluminum-contemporary";
import { applyPhase561WancherDreamPenTimelessSilkBlack } from "../../scripts/apply-phase561-wancher-dream-pen-timeless-silk-black";
import { applyPhase562WancherJadeFountainPen } from "../../scripts/apply-phase562-wancher-jade-fountain-pen";
import { applyPhase563CaranDache849FountainPen } from "../../scripts/apply-phase563-caran-dache-849-fountain-pen";
import {
  applyPhase564WancherZoganSwanUrushiBlack,
  PHASE564_TARGET_ID,
} from "../../scripts/apply-phase564-wancher-zogan-swan-urushi-black";
import {
  applyPhase565WancherKyotoUrushiAsagao,
  PHASE565_TARGET_ID,
} from "../../scripts/apply-phase565-wancher-kyoto-urushi-asagao";
import {
  applyPhase566WancherOitaUrushiKurozan,
  PHASE566_DUPLICATE_ID,
  PHASE566_TARGET_ID,
} from "../../scripts/apply-phase566-wancher-oita-urushi-kurozan";
import { applyPhase578WancherTsuikinKanhizakura } from "../../scripts/apply-phase578-wancher-tsuikin-kanhizakura-depth";
import { applyPhase579PilotMetropolitan } from "../../scripts/apply-phase579-pilot-metropolitan-depth";
import { applyPhase581WancherZoganMomijiGreenTamamushi } from "../../scripts/apply-phase581-wancher-zogan-momiji-green-tamamushi-depth";
import { PHASE559_ALUMINUM_CLASSIC_ID } from "../../scripts/data/phase559-wancher-dream-pen-aluminum-classic";
import { PHASE560_ALUMINUM_CONTEMPORARY_ID } from "../../scripts/data/phase560-wancher-dream-pen-aluminum-contemporary";
import { PHASE561_TIMELESS_ID } from "../../scripts/data/phase561-wancher-dream-pen-timeless-silk-black";
import { PHASE562_JADE_ID } from "../../scripts/data/phase562-wancher-jade-fountain-pen";
import { PHASE563_849_ID } from "../../scripts/data/phase563-caran-dache-849-fountain-pen";
import { PHASE578_TARGET_ID } from "../../scripts/data/phase578-wancher-tsuikin-kanhizakura-depth";
import { PHASE579_TARGET_ID } from "../../scripts/data/phase579-pilot-metropolitan-depth";
import {
  PHASE581_DUPLICATE_ID,
  PHASE581_TARGET_ID,
} from "../../scripts/data/phase581-wancher-zogan-momiji-green-tamamushi-depth";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

type AppliedEntity = {
  entityId: string;
  outcome: string;
  contentHash: string;
};

type BatchResult = {
  entities?: AppliedEntity[];
  entityId?: string;
  outcome?: string;
  contentHash?: string;
  retiredDuplicate?: { entityId: string; outcome: string };
};

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function makeOptions(
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  ownedRoot: string,
  databasePath: string,
  reviewer: string,
) {
  return {
    workspaceRoot: ROOT,
    reviewer,
    databasePath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    } as NodeJS.ProcessEnv,
  };
}

function outcomes(result: BatchResult): string[] {
  return [
    ...(result.entities?.map((entity) => entity.outcome) ?? []),
    ...(result.entityId && result.outcome ? [result.outcome] : []),
    ...(result.retiredDuplicate ? [result.retiredDuplicate.outcome] : []),
  ];
}

async function runStack(
  client: Client,
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  ownedRoot: string,
  databasePath: string,
  runLabel: string,
): Promise<Array<{ phase: string; result: BatchResult }>> {
  const apply = async (
    phase: string,
    fn: (
      client: Client,
      options: ReturnType<typeof makeOptions>,
    ) => Promise<BatchResult>,
  ) => ({
    phase,
    result: await fn(
      client,
      makeOptions(
        protectedSnapshot,
        ownedRoot,
        databasePath,
        `phase582-${runLabel}-${phase}`,
      ),
    ),
  });

  return [
    await apply("559", applyPhase559WancherDreamPenAluminumClassic),
    await apply("560", applyPhase560WancherDreamPenAluminumContemporary),
    await apply("561", applyPhase561WancherDreamPenTimelessSilkBlack),
    await apply("562", applyPhase562WancherJadeFountainPen),
    await apply("563", applyPhase563CaranDache849FountainPen),
    await apply("564", applyPhase564WancherZoganSwanUrushiBlack),
    await apply("565", applyPhase565WancherKyotoUrushiAsagao),
    await apply("566", applyPhase566WancherOitaUrushiKurozan),
    await apply("578", applyPhase578WancherTsuikinKanhizakura),
    await apply("579", applyPhase579PilotMetropolitan),
    await apply("581", applyPhase581WancherZoganMomijiGreenTamamushi),
  ];
}

async function rows(
  client: Client,
  sql: string,
  args: (string | number)[] = [],
) {
  const result = await client.execute({ sql, args });
  return result.rows;
}

test("Phase 582 replays the current canonical content stack on one owned checkpoint", {
  timeout: 1_800_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase582-current-stack-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    const baselinePublished = Number(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entity_publications WHERE status='published'",
        )
      )[0]?.n,
    );
    const baselinePublicEntities = Number(
      (await rows(client, "SELECT count(*) AS n FROM public_entities"))[0]?.n,
    );
    const first = await runStack(
      client,
      protectedSnapshot,
      ownedRoot,
      copy.destinationPath,
      "first",
    );
    assert.equal(first.length, 11);
    assert.ok(
      first
        .flatMap((item) => outcomes(item.result))
        .every((outcome) => ["published", "retired"].includes(outcome)),
      JSON.stringify(first),
    );

    const targetIds = [
      PHASE559_ALUMINUM_CLASSIC_ID,
      PHASE560_ALUMINUM_CONTEMPORARY_ID,
      PHASE561_TIMELESS_ID,
      PHASE562_JADE_ID,
      PHASE563_849_ID,
      PHASE564_TARGET_ID,
      PHASE565_TARGET_ID,
      PHASE566_TARGET_ID,
      PHASE578_TARGET_ID,
      PHASE579_TARGET_ID,
      PHASE581_TARGET_ID,
      PHASE581_DUPLICATE_ID,
      PHASE566_DUPLICATE_ID,
    ];
    const entityRows = await rows(
      client,
      `SELECT id,type,slug FROM entities WHERE id IN (${targetIds.map(() => "?").join(",")})`,
      targetIds,
    );
    assert.equal(entityRows.length, targetIds.length);
    const publishedRows = await rows(
      client,
      `SELECT entity_id,status FROM entity_publications WHERE entity_id IN (${targetIds.map(() => "?").join(",")})`,
      targetIds,
    );
    const statusById = new Map(
      publishedRows.map((row) => [String(row.entity_id), String(row.status)]),
    );
    for (const id of targetIds.filter(
      (id) => id !== PHASE581_DUPLICATE_ID && id !== PHASE566_DUPLICATE_ID,
    )) {
      assert.equal(statusById.get(id), "published", id);
    }
    assert.equal(statusById.get(PHASE581_DUPLICATE_ID), "retired");
    assert.equal(statusById.get(PHASE566_DUPLICATE_ID), "retired");

    const replay = await runStack(
      client,
      protectedSnapshot,
      ownedRoot,
      copy.destinationPath,
      "replay",
    );
    assert.equal(replay.length, 11);
    assert.ok(
      replay
        .flatMap((item) => outcomes(item.result))
        .every((outcome) => outcome === "noop"),
      JSON.stringify(replay),
    );

    const published = await rows(
      client,
      "SELECT count(*) AS n FROM entity_publications WHERE status='published'",
    );
    const publicEntities = await rows(
      client,
      "SELECT count(*) AS n FROM public_entities",
    );
    const blockerRows = await rows(
      client,
      `SELECT count(*) AS n
       FROM public_entity_readiness readiness
       JOIN entity_publications publication ON publication.entity_id=readiness.entity_id
       WHERE readiness.contract_version=3
         AND readiness.blocker_count > 0
         AND publication.status='published'`,
    );
    assert.equal(Number(published[0]?.n), baselinePublished + 4);
    assert.equal(Number(publicEntities[0]?.n), baselinePublicEntities + 4);
    assert.equal(Number(blockerRows[0]?.n), 0);

    const redirects = await rows(
      client,
      "SELECT source_path,target_path,redirect_kind FROM entity_redirects WHERE source_path IN (?,?) ORDER BY source_path",
      [
        "/pen/wancher-dream-pen-zogan-momiji-green-tamamushi",
        "/pen/wancher-oita-urushi-kurozan",
      ],
    );
    assert.equal(redirects.length, 2);
    assert.equal(sha256(REAL), protectedHash);
  } finally {
    client.close();
  }
});
