import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase365PilotCustomEnjuContent } from "../../scripts/apply-phase365-pilot-custom-enju-content";
import {
  PHASE365_ENJU_ID,
  PHASE365_ENJU_SLUG,
  PHASE365_PILOT_BRAND_ID,
  phase365PilotCustomEnjuPacks,
} from "../../scripts/data/phase365-pilot-custom-enju";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 365 publishes Pilot Custom 槐 FKV-5MK on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase365-pilot-enju-")),
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
    reviewer: "phase365-pilot-custom-enju-test",
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
    const model = phase365PilotCustomEnjuPacks.find(
      (pack) => pack.entityId === PHASE365_ENJU_ID,
    );
    assert.ok(model);
    assert.ok(
      fs.readFileSync(path.join(ROOT, model.markdownFile), "utf8").length >=
        4_000,
    );
    assert.ok(
      new Set(model.sources.map((source) => source.independenceGroup)).size >=
        6,
    );
    const mediaPack = model.media[0];
    assert.ok(mediaPack?.localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", mediaPack.localPath.replace(/^\//, "")),
      "utf8",
    );
    for (const marker of [
      /non-photo/i,
      /non-logo/i,
      /not.?to.?scale/i,
      /non-colour-proof/i,
    ]) {
      assert.match(svg, marker);
    }
    await assert.rejects(
      applyPhase365PilotCustomEnjuContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase365PilotCustomEnjuContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE365_PILOT_BRAND_ID, PHASE365_ENJU_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE365_ENJU_ID)
        ?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE365_ENJU_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE365_ENJU_ID,
        "pen",
        PHASE365_ENJU_SLUG,
        "百乐 Pilot Custom 槐（Enju）",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /Custom 槐|Enju|Enjyu/i,
      /FKV-5MK/,
      /槐木|树脂浸渍|resin-impregnated/i,
      /18K/,
      /15号|No\.15/,
      /F.*M.*B|F[／/]M[／/]B/,
      /CON-40/,
      /CON-70N/,
      /147 mm/,
      /16\.7 mm/,
      /32 g/,
      /2013/,
      /维护/,
      /选购/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const brand = (
      await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [PHASE365_PILOT_BRAND_ID],
      })
    ).rows[0];
    assert.match(String(brand?.body_md ?? ""), /Custom 槐|Enju|FKV-5MK/i);

    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range,status FROM model_specs WHERE entity_id=?",
        args: [PHASE365_ENJU_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE365_PILOT_BRAND_ID);
    assert.match(String(spec?.nib), /18K.*15|No\.15/i);
    assert.match(String(spec?.fill_system), /CON-40|CON-70N/);
    assert.match(String(spec?.material), /槐|Enju|resin/i);
    assert.match(String(spec?.dimensions), /147.*16\.7|147 mm/);
    assert.match(String(spec?.weight), /32 g/);
    assert.match(String(spec?.price_range), /110,000/);
    assert.match(String(spec?.status), /FKV-5MK|Pilot/);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE365_ENJU_ID],
          })
        ).rows[0]?.n,
      ),
      5,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE365_ENJU_ID, PHASE365_PILOT_BRAND_ID],
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
            args: [PHASE365_PILOT_BRAND_ID, PHASE365_ENJU_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    assert.ok(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE365_ENJU_ID],
          })
        ).rows[0]?.n,
      ) >= 7,
    );
    assert.ok(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=?",
            args: [PHASE365_ENJU_ID],
          })
        ).rows[0]?.n,
      ) >= 11,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [PHASE365_ENJU_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const hash = await computePublicationContentHash(client, PHASE365_ENJU_ID);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE365_ENJU_ID, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    const replay = await applyPhase365PilotCustomEnjuContent(client, options);
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE365_ENJU_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
