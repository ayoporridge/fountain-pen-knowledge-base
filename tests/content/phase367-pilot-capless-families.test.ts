import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase367PilotCaplessFamiliesContent } from "../../scripts/apply-phase367-pilot-capless-families-content";
import {
  PHASE367_KASURI_ID,
  PHASE367_KASURI_SLUG,
  PHASE367_PILOT_BRAND_ID,
  PHASE367_SE_ID,
  PHASE367_SE_SLUG,
  PHASE367_SPECIAL_ALLOY_ID,
  PHASE367_SPECIAL_ALLOY_SLUG,
  PHASE367_STRIPE_ID,
  PHASE367_STRIPE_SLUG,
  phase367PilotCaplessFamilyPacks,
} from "../../scripts/data/phase367-pilot-capless-families";
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
    id: PHASE367_KASURI_ID,
    slug: PHASE367_KASURI_SLUG,
    name: "百乐 Pilot Capless 絣（Kasuri）",
    variants: 5,
    patterns: [
      /Capless 絣|Kasuri/i,
      /FCN-2MR/,
      /絣|Kasuri/i,
      /18K/,
      /F.*M|F[／/]M/i,
      /CON-40/,
      /140 mm/,
      /13\.4 mm/,
      /30 g/,
      /维护|清水/i,
    ],
  },
  {
    id: PHASE367_STRIPE_ID,
    slug: PHASE367_STRIPE_SLUG,
    name: "百乐 Pilot Capless Stripe（条纹）",
    variants: 4,
    patterns: [
      /Capless Stripe|条纹/i,
      /FC-3MS/,
      /铑|rhodium/i,
      /18K/,
      /F.*M|F[／/]M/i,
      /CON-40/,
      /140 mm/,
      /13\.3 mm/,
      /32 g/,
      /维护|清水/i,
    ],
  },
  {
    id: PHASE367_SE_ID,
    slug: PHASE367_SE_SLUG,
    name: "百乐 Pilot Capless SE（大理石）",
    variants: 6,
    patterns: [
      /Capless SE|大理石/i,
      /FCSE-3MR/,
      /氨基甲酸酯|urethane|marble/i,
      /18K/,
      /F.*M|F[／/]M/i,
      /CON-40/,
      /MAB|MAL|MAG|MAR|MAO/,
      /140 mm/,
      /14 mm/,
      /26 g/,
      /维护|清水/i,
    ],
  },
  {
    id: PHASE367_SPECIAL_ALLOY_ID,
    slug: PHASE367_SPECIAL_ALLOY_SLUG,
    name: "百乐 Pilot Capless 特殊合金（FCS-1）",
    variants: 5,
    patterns: [
      /特殊合金|Special Alloy/i,
      /FCS-1/,
      /非 18K|非18K|黄铜|哑光/i,
      /F.*M|F[／/]M/i,
      /CON-40/,
      /MS|MCO|MDG|MAL/,
      /140 mm/,
      /13\.4 mm/,
      /30 g/,
      /维护|清水/i,
    ],
  },
] as const;

test("Phase 367 publishes four uncovered Pilot Capless families on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase367-pilot-capless-")),
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
    reviewer: "phase367-pilot-capless-families-test",
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
      const pack = phase367PilotCaplessFamilyPacks.find(
        (item) => item.entityId === model.id,
      );
      assert.ok(pack);
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          1_500,
      );
      assert.ok(
        new Set(pack.sources.map((item) => item.independenceGroup)).size >= 5,
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
      ])
        assert.match(svg, marker);
    }
    await assert.rejects(
      applyPhase367PilotCaplessFamiliesContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase367PilotCaplessFamiliesContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [
        PHASE367_PILOT_BRAND_ID,
        PHASE367_KASURI_ID,
        PHASE367_STRIPE_ID,
        PHASE367_SE_ID,
        PHASE367_SPECIAL_ALLOY_ID,
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
      assert.equal(String(spec?.brand_entity_id), PHASE367_PILOT_BRAND_ID);
      assert.ok(String(spec?.nib).length > 4);
      assert.match(String(spec?.fill_system), /CON-40/);
      assert.ok(String(spec?.material).length > 6);
      assert.match(String(spec?.dimensions), /mm/);
      assert.match(String(spec?.weight), /g/);
      assert.match(
        String(spec?.price_range),
        /日元|35,200|38,500|52,800|44,000|17,600/,
      );
      assert.match(String(spec?.status), /Pilot|FCN|FC-|FCS/);
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
              args: [model.id, PHASE367_PILOT_BRAND_ID],
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
              args: [PHASE367_PILOT_BRAND_ID, model.id],
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
        args: [PHASE367_PILOT_BRAND_ID],
      })
    ).rows[0];
    assert.match(
      String(brand?.body_md ?? ""),
      /Capless 絣|Stripe|Capless SE|FCS-1/,
    );
    const replay = await applyPhase367PilotCaplessFamiliesContent(
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
