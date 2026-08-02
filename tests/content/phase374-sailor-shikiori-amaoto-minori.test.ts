import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase374SailorShikioriAmaotoMinoriContent } from "../../scripts/apply-phase374-sailor-shikiori-amaoto-minori-content";
import {
  PHASE374_AMAOTO_ID,
  PHASE374_AMAOTO_SLUG,
  PHASE374_MINORI_ID,
  PHASE374_MINORI_SLUG,
  PHASE374_SAILOR_BRAND_ID,
  phase374SailorShikioriAmaotoMinoriPacks,
} from "../../scripts/data/phase374-sailor-shikiori-amaoto-minori";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 374 publishes Sailor SHIKIORI Amaoto and Minori on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase374-sailor-shikiori-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    {
      expectedSourceSnapshot: snapshot,
    },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase374-sailor-shikiori-test",
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
    for (const pack of phase374SailorShikioriAmaotoMinoriPacks.filter(
      (item) => item.expectedType === "pen",
    )) {
      const localPath = pack.media[0]?.localPath;
      assert.ok(localPath);
      assert.ok(pack.media[0]?.sourceUrl);
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(markdown.length >= 4_000);
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          6,
      );
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.replace(/^\//, "")),
        "utf8",
      );
      for (const marker of [
        /non-photo/i,
        /non-logo/i,
        /not-to-scale/i,
        /non-colour-proof/i,
      ])
        assert.match(svg, marker);
    }
    await assert.rejects(
      applyPhase374SailorShikioriAmaotoMinoriContent(client, {
        ...options,
        env: {
          ...options.env,
          FPKG_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase374SailorShikioriAmaotoMinoriContent(
      client,
      options,
    );
    for (const entityId of [PHASE374_AMAOTO_ID, PHASE374_MINORI_ID]) {
      assert.equal(
        first.entities.find((item) => item.entityId === entityId)?.outcome,
        "published",
      );
      const entity = (
        await client.execute({
          sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
          args: [entityId],
        })
      ).rows[0];
      assert.equal(String(entity?.type), "pen");
      assert.equal(
        String(entity?.slug),
        entityId === PHASE374_AMAOTO_ID
          ? PHASE374_AMAOTO_SLUG
          : PHASE374_MINORI_SLUG,
      );
      const body = String(entity?.body_md ?? "");
      for (const pattern of entityId === PHASE374_AMAOTO_ID
        ? [
            /11-3059-301/,
            /11-3059-304/,
            /21K/,
            /MF/,
            /Gold IP/,
            /PMMA/,
            /124 mm/,
            /16\.8 g/,
            /维护/,
            /选购/,
          ]
        : [
            /10-1050-368/,
            /14K/,
            /MF/,
            /PMMA/,
            /20 ml/,
            /3,000/,
            /结束销售/,
            /135 mm/,
            /维护/,
            /选购/,
          ]) {
        assert.match(body, pattern);
      }
      assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
      const spec = (
        await client.execute({
          sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
          args: [entityId],
        })
      ).rows[0];
      assert.equal(String(spec?.brand_entity_id), PHASE374_SAILOR_BRAND_ID);
      assert.match(String(spec?.fill_system), /墨囊／转换器/);
      assert.match(
        String(spec?.material),
        entityId === PHASE374_AMAOTO_ID ? /PMMA/ : /PMMA/,
      );
      assert.match(String(spec?.dimensions), /135|124/);
      assert.match(String(spec?.weight), /16\.5|16\.6|16\.8/);
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
              args: [entityId],
            })
          ).rows[0]?.n,
        ),
        entityId === PHASE374_AMAOTO_ID ? 4 : 1,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
              args: [entityId],
            })
          ).rows[0]?.n,
        ),
        entityId === PHASE374_AMAOTO_ID ? 9 : 10,
      );
      const media = (
        await client.execute({
          sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
          args: [entityId],
        })
      ).rows[0];
      const pack = phase374SailorShikioriAmaotoMinoriPacks.find(
        (item) => item.entityId === entityId,
      );
      assert.equal(String(media?.local_path), pack?.media[0]?.localPath);
      assert.equal(String(media?.source_url), pack?.media[0]?.sourceUrl);
      assert.equal(String(media?.usage_status), "primary");
      const reviewKinds = (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind",
          args: [entityId],
        })
      ).rows.map((row) => `${String(row.review_kind)}:${String(row.status)}`);
      assert.deepEqual(reviewKinds, [
        "fact:approved",
        "language:approved",
        "media:approved",
        "publication:approved",
      ]);
    }
    for (const entityId of [PHASE374_AMAOTO_ID, PHASE374_MINORI_ID]) {
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              args: [entityId, PHASE374_SAILOR_BRAND_ID],
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
              args: [PHASE374_SAILOR_BRAND_ID, entityId],
            })
          ).rows[0]?.n,
        ),
        1,
      );
    }
    const replay = await applyPhase374SailorShikioriAmaotoMinoriContent(
      client,
      options,
    );
    for (const entityId of [
      PHASE374_SAILOR_BRAND_ID,
      PHASE374_AMAOTO_ID,
      PHASE374_MINORI_ID,
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
