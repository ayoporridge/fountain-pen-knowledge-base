import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase355ScriboFlowTempoContent } from "../../scripts/apply-phase355-scribo-flow-tempo-content";
import {
  PHASE355_FLOW_TEMPO_ID,
  PHASE355_FLOW_TEMPO_SLUG,
  PHASE355_SCRIBO_BRAND_ID,
  phase355ScriboFlowTempoPacks,
} from "../../scripts/data/phase355-scribo-flow-tempo";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 355 publishes SCRIBO FLOW Tempo on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase355-scribo-flow-tempo-")),
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
    reviewer: "phase355-scribo-flow-tempo-test",
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
    const pack = phase355ScriboFlowTempoPacks.find(
      (candidate) => candidate.entityId === PHASE355_FLOW_TEMPO_ID,
    );
    assert.ok(pack);
    const mediaPack = pack.media[0];
    assert.ok(mediaPack);
    assert.ok(mediaPack.localPath);
    assert.ok(mediaPack.sourceUrl);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        3_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 3,
    );
    const svg = fs.readFileSync(
      path.join(ROOT, "public", mediaPack.localPath.replace(/^\//, "")),
      "utf8",
    );
    for (const marker of [
      /non-photo/i,
      /non-logo/i,
      /not-to-scale/i,
      /non-colour-proof/i,
    ]) {
      assert.match(svg, marker);
    }
    await assert.rejects(
      applyPhase355ScriboFlowTempoContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase355ScriboFlowTempoContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE355_SCRIBO_BRAND_ID, PHASE355_FLOW_TEMPO_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE355_FLOW_TEMPO_ID)
        ?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE355_FLOW_TEMPO_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE355_FLOW_TEMPO_ID,
        "pen",
        PHASE355_FLOW_TEMPO_SLUG,
        "SCRIBO FLOW Tempo",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /FLOW Tempo/,
      /FEEL/,
      /Piuma/,
      /24/,
      /ebonite/,
      /活塞/,
      /150 mm/,
      /16\.20 mm/,
      /33\.50 g/,
      /18K/,
      /14K/,
      /1\.42 ml/,
      /维护/,
      /选购/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const brandEntity = (
      await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [PHASE355_SCRIBO_BRAND_ID],
      })
    ).rows[0];
    assert.match(String(brandEntity?.body_md ?? ""), /FLOW Tempo/);

    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        args: [PHASE355_FLOW_TEMPO_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE355_SCRIBO_BRAND_ID);
    assert.match(String(spec?.nib), /18K/);
    assert.match(String(spec?.nib), /14K/);
    assert.match(String(spec?.fill_system), /piston/);
    assert.match(String(spec?.material), /ebonite/);
    assert.match(String(spec?.dimensions), /150/);
    assert.equal(String(spec?.weight), "33.50 g");
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE355_FLOW_TEMPO_ID],
          })
        ).rows[0]?.n,
      ),
      3,
    );
    assert.ok(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE355_FLOW_TEMPO_ID],
          })
        ).rows[0]?.n,
      ) >= 5,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE355_FLOW_TEMPO_ID, PHASE355_SCRIBO_BRAND_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE355_SCRIBO_BRAND_ID, PHASE355_FLOW_TEMPO_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE355_FLOW_TEMPO_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), mediaPack.localPath);
    assert.equal(String(media?.source_url), mediaPack.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");

    const replay = await applyPhase355ScriboFlowTempoContent(client, options);
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE355_FLOW_TEMPO_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
