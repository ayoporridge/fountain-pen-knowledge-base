import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  applyPhase328OttoHuttDesignCContent,
  PHASE328_DESIGNC_ID,
  PHASE328_DESIGNC_SLUG,
  PHASE328_OTTO_HUTT_BRAND_ID,
} from "../../scripts/apply-phase328-otto-hutt-designc-content";
import { phase328OttoHuttDesignCPacks } from "../../scripts/data/phase328-otto-hutt-designc";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 328 publishes Otto Hutt designC on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase328-otto-hutt-designc-")),
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
    reviewer: "phase328-otto-hutt-designc-test",
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
    const pack = phase328OttoHuttDesignCPacks.find(
      (item) => item.entityId === PHASE328_DESIGNC_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        2_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    const svg = fs.readFileSync(
      path.join(
        ROOT,
        "public",
        pack.media[0]?.localPath?.replace(/^\//, "") ?? "",
      ),
      "utf8",
    );
    for (const marker of [
      /non-photo/i,
      /non-logo/i,
      /not-to-scale/i,
      /non-colour-proof/i,
    ])
      assert.match(svg, marker);
    await assert.rejects(
      applyPhase328OttoHuttDesignCContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase328OttoHuttDesignCContent(client, options);
    assert.equal(first.entities.length, 2);
    assert.equal(
      first.entities.find((entity) => entity.entityId === PHASE328_DESIGNC_ID)
        ?.outcome,
      "published",
    );
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE328_DESIGNC_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [PHASE328_DESIGNC_ID, "pen", PHASE328_DESIGNC_SLUG, "Otto Hutt designC"],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /Pull\+Twist/i,
      /925/,
      /sterling silver/i,
      /PVD/i,
      /18K/i,
      /真空/i,
      /design04/,
      /design07/,
      /非产品照片/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,weight,status FROM model_specs WHERE entity_id=?",
        args: [PHASE328_DESIGNC_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE328_OTTO_HUTT_BRAND_ID);
    assert.match(String(spec?.nib), /18/);
    assert.match(String(spec?.fill_system), /Pull\+Twist|真空/);
    assert.match(String(spec?.material), /925|silver/);
    assert.match(String(spec?.weight), /34|1/);
    assert.match(String(spec?.status), /官方|designC/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
        [PHASE328_DESIGNC_ID],
      ),
      3,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_references WHERE entity_id=?",
        [PHASE328_DESIGNC_ID],
      ),
      pack.sources.length,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE328_DESIGNC_ID, PHASE328_OTTO_HUTT_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE328_OTTO_HUTT_BRAND_ID, PHASE328_DESIGNC_ID],
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE328_DESIGNC_ID],
      })
    ).rows[0];
    assert.equal(String(media?.usage_status), "primary");
    assert.match(
      String(media?.local_path),
      /phase328\/otto-hutt\/designc\.svg/,
    );
    const replay = await applyPhase328OttoHuttDesignCContent(client, options);
    assert.equal(
      replay.entities.find((entity) => entity.entityId === PHASE328_DESIGNC_ID)
        ?.outcome,
      "noop",
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
