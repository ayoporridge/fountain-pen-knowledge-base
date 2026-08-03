import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase377SailorEboniteMicartaContent } from "../../scripts/apply-phase377-sailor-ebonite-micarta-content";
import {
  PHASE377_EBONITE_ID,
  PHASE377_EBONITE_SLUG,
  PHASE377_MICARTA_ID,
  PHASE377_MICARTA_SLUG,
  PHASE377_SAILOR_BRAND_ID,
  phase377SailorEboniteMicartaPacks,
} from "../../scripts/data/phase377-sailor-ebonite-micarta";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

const MODEL_CASES = [
  {
    id: PHASE377_EBONITE_ID,
    slug: PHASE377_EBONITE_SLUG,
    patterns: [
      /EBONITE ETERNAL FLOW/i,
      /10-6085/,
      /ebonite/i,
      /机器刻纹|机械刻纹/,
      /14K|14金/,
      /43\.1 g/,
      /2026-09-12/,
      /维护/,
      /选购/,
    ],
    nib: /14金.*大型/,
    material: /ebonite|硬橡胶/i,
    weight: /43\.1/,
    release: /2026-09-12/,
    variants: 3,
  },
  {
    id: PHASE377_MICARTA_ID,
    slug: PHASE377_MICARTA_SLUG,
    patterns: [
      /Black Micarta/i,
      /10-5060/,
      /canvas micarta/i,
      /21K|21金/,
      /33\.2 g/,
      /2026-10-17/,
      /维护/,
      /选购/,
    ],
    nib: /21金.*大型/,
    material: /canvas micarta/i,
    weight: /33\.2/,
    release: /2026-10-17/,
    variants: 3,
  },
] as const;

test("Phase 377 publishes Sailor Ebonite and Black Micarta on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase377-sailor-ebonite-")),
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
    reviewer: "phase377-sailor-ebonite-micarta-test",
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
    for (const pack of phase377SailorEboniteMicartaPacks.filter(
      (item) => item.expectedType === "pen",
    )) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(markdown.length >= 4_000);
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          6,
      );
      assert.equal(pack.variants?.length, 3);
      const localPath = pack.media[0]?.localPath;
      assert.ok(localPath);
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.replace(/^\//, "")),
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
    }
    await assert.rejects(
      applyPhase377SailorEboniteMicartaContent(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase377SailorEboniteMicartaContent(
      client,
      options,
    );
    for (const model of MODEL_CASES) {
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
      assert.equal(String(entity?.type), "pen");
      assert.equal(String(entity?.slug), model.slug);
      const body = String(entity?.body_md ?? "");
      for (const pattern of model.patterns) assert.match(body, pattern);
      assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
      const spec = (
        await client.execute({
          sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
          args: [model.id],
        })
      ).rows[0];
      assert.equal(String(spec?.brand_entity_id), PHASE377_SAILOR_BRAND_ID);
      assert.match(String(spec?.nib), model.nib);
      assert.match(String(spec?.fill_system), /墨囊／转换器/);
      assert.match(String(spec?.material), model.material);
      assert.match(String(spec?.dimensions), /18\.5.*134|19\.6.*164/);
      assert.match(String(spec?.weight), model.weight);
      assert.match(String(spec?.status), model.release);
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
      const pack = phase377SailorEboniteMicartaPacks.find(
        (item) => item.entityId === model.id,
      );
      assert.ok(pack);
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
              args: [model.id],
            })
          ).rows[0]?.n,
        ),
        pack.sources.length,
      );
      const media = (
        await client.execute({
          sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
          args: [model.id],
        })
      ).rows[0];
      assert.equal(String(media?.local_path), pack.media[0]?.localPath);
      assert.equal(String(media?.source_url), pack.media[0]?.sourceUrl);
      assert.equal(String(media?.usage_status), "primary");
      const reviewKinds = (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind",
          args: [model.id],
        })
      ).rows.map((row) => `${String(row.review_kind)}:${String(row.status)}`);
      assert.deepEqual(reviewKinds, [
        "fact:approved",
        "language:approved",
        "media:approved",
        "publication:approved",
      ]);
      const groupCounts = (
        await client.execute({
          sql: "SELECT primary_archive_group_count,professional_secondary_group_count FROM publication_v2_source_group_counts WHERE entity_id=?",
          args: [model.id],
        })
      ).rows[0];
      assert.ok(Number(groupCounts?.primary_archive_group_count) >= 1);
      assert.ok(Number(groupCounts?.professional_secondary_group_count) >= 1);
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM fact_conflicts WHERE entity_id=?",
              args: [model.id],
            })
          ).rows[0]?.n,
        ),
        0,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              args: [model.id, PHASE377_SAILOR_BRAND_ID],
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
              args: [PHASE377_SAILOR_BRAND_ID, model.id],
            })
          ).rows[0]?.n,
        ),
        1,
      );
    }
    const replay = await applyPhase377SailorEboniteMicartaContent(
      client,
      options,
    );
    for (const entityId of [
      PHASE377_SAILOR_BRAND_ID,
      PHASE377_EBONITE_ID,
      PHASE377_MICARTA_ID,
    ]) {
      assert.equal(
        replay.entities.find((item) => item.entityId === entityId)?.outcome,
        "noop",
      );
    }
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
