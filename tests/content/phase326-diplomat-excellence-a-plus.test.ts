import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  applyPhase326DiplomatExcellenceAPlusContent,
  PHASE326_DIPLOMAT_BRAND_ID,
  PHASE326_EXCELLENCE_A_PLUS_ID,
  PHASE326_EXCELLENCE_A_PLUS_SLUG,
} from "../../scripts/apply-phase326-diplomat-excellence-a-plus-content";
import { phase326DiplomatExcellenceAPlusPacks } from "../../scripts/data/phase326-diplomat-excellence-a-plus";
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

test("Phase 326 publishes Diplomat Excellence A+ on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase326-diplomat-a-plus-")),
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
    reviewer: "phase326-diplomat-excellence-a-plus-test",
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
    const pack = phase326DiplomatExcellenceAPlusPacks.find(
      (candidate) => candidate.entityId === PHASE326_EXCELLENCE_A_PLUS_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        3_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    const svg = fs.readFileSync(
      path.join(
        ROOT,
        "public/images/library/site-original/phase326/diplomat/excellence-a-plus.svg",
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
      applyPhase326DiplomatExcellenceAPlusContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase326DiplomatExcellenceAPlusContent(
      client,
      options,
    );
    assert.equal(first.entities.length, 2);
    assert.equal(
      first.entities.find(
        (entity) => entity.entityId === PHASE326_EXCELLENCE_A_PLUS_ID,
      )?.outcome,
      "published",
    );
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE326_EXCELLENCE_A_PLUS_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE326_EXCELLENCE_A_PLUS_ID,
        "pen",
        PHASE326_EXCELLENCE_A_PLUS_SLUG,
        "Diplomat Excellence A+",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /Excellence A\+/i,
      /A2/,
      /三分之一圈/,
      /螺纹帽/,
      /45 g/,
      /136 mm/,
      /155 mm/,
      /14.7 mm/,
      /Rhomb/,
      /Wave/,
      /14K/,
      /转换器/,
      /清水/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range FROM model_specs WHERE entity_id=?",
        args: [PHASE326_EXCELLENCE_A_PLUS_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE326_DIPLOMAT_BRAND_ID);
    assert.match(String(spec?.nib), /14K|不锈钢/);
    assert.match(String(spec?.fill_system), /converter|转换器/);
    assert.match(String(spec?.material), /金属|黄铜/);
    assert.match(String(spec?.dimensions), /136/);
    assert.match(String(spec?.weight), /45/);
    assert.match(String(spec?.price_range), /256|690/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
        [PHASE326_EXCELLENCE_A_PLUS_ID],
      ),
      3,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_references WHERE entity_id=?",
        [PHASE326_EXCELLENCE_A_PLUS_ID],
      ),
      9,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE326_EXCELLENCE_A_PLUS_ID, PHASE326_DIPLOMAT_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE326_DIPLOMAT_BRAND_ID, PHASE326_EXCELLENCE_A_PLUS_ID],
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE326_EXCELLENCE_A_PLUS_ID],
      })
    ).rows[0];
    assert.equal(
      String(media?.local_path),
      "/images/library/site-original/phase326/diplomat/excellence-a-plus.svg",
    );
    assert.equal(
      String(media?.source_url),
      "/images/library/site-original/phase326/diplomat/excellence-a-plus.svg",
    );
    assert.equal(String(media?.usage_status), "primary");
    const replay = await applyPhase326DiplomatExcellenceAPlusContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find(
        (entity) => entity.entityId === PHASE326_EXCELLENCE_A_PLUS_ID,
      )?.outcome,
      "noop",
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
