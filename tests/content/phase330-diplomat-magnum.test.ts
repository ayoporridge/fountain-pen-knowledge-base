import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  applyPhase330DiplomatMagnumContent,
  PHASE330_DIPLOMAT_BRAND_ID,
  PHASE330_MAGNUM_ID,
  PHASE330_MAGNUM_SLUG,
} from "../../scripts/apply-phase330-diplomat-content";
import { phase330DiplomatMagnumPacks } from "../../scripts/data/phase330-diplomat-magnum";
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

test("Phase 330 publishes Diplomat Magnum on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase330-diplomat-magnum-")),
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
    reviewer: "phase330-diplomat-magnum-test",
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
    const pack = phase330DiplomatMagnumPacks.find(
      (item) => item.entityId === PHASE330_MAGNUM_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        2_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    assert.ok(
      pack.sources.some((source) => source.tier === "professional_secondary"),
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
      applyPhase330DiplomatMagnumContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase330DiplomatMagnumContent(client, options);
    assert.equal(first.entities.length, 2);
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE330_MAGNUM_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [PHASE330_MAGNUM_ID, "pen", PHASE330_MAGNUM_SLUG, "Diplomat Magnum"],
    );
    assert.match(String(entity?.body_md ?? ""), /Magnum/);
    assert.match(String(entity?.body_md ?? ""), /非产品照片/);
    assert.doesNotMatch(
      String(entity?.body_md ?? ""),
      /canonical|made_by|数据库|仓库/i,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_references WHERE entity_id=?",
        [PHASE330_MAGNUM_ID],
      ),
      pack.sources.length,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
        [PHASE330_MAGNUM_ID],
      ),
      3,
    );
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range FROM model_specs WHERE entity_id=?",
        args: [PHASE330_MAGNUM_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE330_DIPLOMAT_BRAND_ID);
    assert.match(String(spec?.nib), /不锈钢/);
    assert.match(String(spec?.fill_system), /墨胆|converter/i);
    assert.match(String(spec?.dimensions), /135|153|12/);
    assert.match(String(spec?.weight), /14/);
    const media = (
      await client.execute({
        sql: "SELECT local_path,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE330_MAGNUM_ID],
      })
    ).rows[0];
    assert.equal(String(media?.usage_status), "primary");
    assert.match(String(media?.local_path), /phase330\/diplomat\/magnum\.svg/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE330_MAGNUM_ID, PHASE330_DIPLOMAT_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE330_DIPLOMAT_BRAND_ID, PHASE330_MAGNUM_ID],
      ),
      1,
    );
    const replay = await applyPhase330DiplomatMagnumContent(client, options);
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE330_MAGNUM_ID)
        ?.outcome,
      "noop",
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
