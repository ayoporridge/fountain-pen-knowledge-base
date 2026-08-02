import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase366PilotSpecialRoutesContent } from "../../scripts/apply-phase366-pilot-special-routes-content";
import {
  PHASE366_KAEDE_ID,
  PHASE366_KAEDE_SLUG,
  PHASE366_PILOT_BRAND_ID,
  PHASE366_RADEN_ID,
  PHASE366_RADEN_SLUG,
  PHASE366_WOOD_ID,
  PHASE366_WOOD_SLUG,
  phase366PilotSpecialRoutePacks,
} from "../../scripts/data/phase366-pilot-special-routes";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const MODELS = [
  {
    id: PHASE366_KAEDE_ID,
    slug: PHASE366_KAEDE_SLUG,
    name: "百乐 Pilot Custom 楓（Kaede）",
    variants: 5,
    patterns: [
      /Custom 楓|Kaede|Maple/i,
      /FK-2000K/,
      /板屋楓|楓木|树脂浸渍|maple/i,
      /14K/,
      /10 号|No\.10/i,
      /F.*M|F[／/]M/i,
      /CON-40/,
      /CON-70N/,
      /143 mm/,
      /14\.5 mm/,
      /20 g/,
      /维护/,
      /选购/,
    ],
  },
  {
    id: PHASE366_WOOD_ID,
    slug: PHASE366_WOOD_SLUG,
    name: "百乐 Pilot Capless 木轴（Capless WOOD）",
    variants: 7,
    patterns: [
      /Capless 木轴|Capless WOOD/i,
      /FC-25SK|FC-2500RR/,
      /桦材|birch|树脂浸渍/i,
      /18K/,
      /EF.*F.*M|EF[／/]F[／/]M/i,
      /CON-40/,
      /按动|shutter|retract/i,
      /140 mm/,
      /14 mm/,
      /26 g/,
      /维护/,
      /选购/,
    ],
  },
  {
    id: PHASE366_RADEN_ID,
    slug: PHASE366_RADEN_SLUG,
    name: "百乐 Pilot Capless 螺鈿（Raden）",
    variants: 7,
    patterns: [
      /Capless 螺鈿|Raden/i,
      /FCN-5MP/,
      /螺鈿|蝋色漆|贝饰/i,
      /18K/,
      /F.*M|F[／/]M/i,
      /CON-40/,
      /RB|RM|RS/,
      /140 mm/,
      /13\.4 mm/,
      /30 g/,
      /维护/,
      /选购/,
    ],
  },
] as const;

test("Phase 366 publishes Pilot Custom 楓, Capless 木轴 and Capless 螺鈿 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase366-pilot-special-")),
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
    reviewer: "phase366-pilot-special-routes-test",
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
    for (const model of MODELS) {
      const pack = phase366PilotSpecialRoutePacks.find(
        (item) => item.entityId === model.id,
      );
      assert.ok(pack);
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          2_200,
      );
      assert.ok(
        new Set(pack.sources.map((item) => item.independenceGroup)).size >= 6,
      );
      const media = pack.media[0];
      assert.ok(media?.localPath);
      const svg = fs.readFileSync(
        path.join(ROOT, "public", media.localPath.replace(/^\//, "")),
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
    }
    await assert.rejects(
      applyPhase366PilotSpecialRoutesContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase366PilotSpecialRoutesContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [
        PHASE366_PILOT_BRAND_ID,
        PHASE366_KAEDE_ID,
        PHASE366_WOOD_ID,
        PHASE366_RADEN_ID,
      ],
    );
    for (const model of MODELS) {
      assert.equal(
        first.entities.find((item) => item.entityId === model.id)?.outcome,
        "published",
      );
      const entity = (
        await client.execute({
          sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
          args: [model.id],
        })
      ).rows[0];
      assert.deepEqual(
        [entity?.id, entity?.type, entity?.slug, entity?.name],
        [model.id, "pen", model.slug, model.name],
      );
      const body = String(entity?.body_md ?? "");
      for (const pattern of model.patterns) assert.match(body, pattern);
      assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
      const spec = (
        await client.execute({
          sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range,status FROM model_specs WHERE entity_id=?",
          args: [model.id],
        })
      ).rows[0];
      assert.equal(String(spec?.brand_entity_id), PHASE366_PILOT_BRAND_ID);
      assert.ok(String(spec?.nib).length > 4);
      assert.ok(String(spec?.fill_system).match(/CON-40/));
      assert.ok(String(spec?.material).length > 6);
      assert.ok(String(spec?.dimensions).match(/mm/));
      assert.ok(String(spec?.weight).match(/g/));
      assert.ok(String(spec?.price_range).match(/日元|55,000|44,000|110,000/));
      assert.ok(String(spec?.status).match(/Pilot|FC-|FK-/));
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
              args: [model.id],
            })
          ).rows[0]?.n,
        ),
        model.variants,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              args: [model.id, PHASE366_PILOT_BRAND_ID],
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
              args: [PHASE366_PILOT_BRAND_ID, model.id],
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
              args: [model.id],
            })
          ).rows[0]?.n,
        ) >= 6,
      );
      assert.ok(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=?",
              args: [model.id],
            })
          ).rows[0]?.n,
        ) >= 11,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary'",
              args: [model.id],
            })
          ).rows[0]?.n,
        ),
        1,
      );
      const hash = await computePublicationContentHash(client, model.id);
      assert.deepEqual(
        (
          await client.execute({
            sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            args: [model.id, hash],
          })
        ).rows.map((row) => [String(row.review_kind), String(row.status)]),
        [
          ["fact", "approved"],
          ["language", "approved"],
          ["media", "approved"],
          ["publication", "approved"],
        ],
      );
    }
    const brand = (
      await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [PHASE366_PILOT_BRAND_ID],
      })
    ).rows[0];
    assert.match(
      String(brand?.body_md ?? ""),
      /Custom 楓|Capless 木轴|Capless 螺鈿|FK-2000K|FC-25SK|FCN-5MP/,
    );
    const replay = await applyPhase366PilotSpecialRoutesContent(
      client,
      options,
    );
    for (const model of MODELS)
      assert.equal(
        replay.entities.find((item) => item.entityId === model.id)?.outcome,
        "noop",
      );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
