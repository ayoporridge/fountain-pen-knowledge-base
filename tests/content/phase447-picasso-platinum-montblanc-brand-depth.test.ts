import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase447BrandDepth } from "../../scripts/apply-phase447-picasso-platinum-montblanc-brand-depth";
import {
  PHASE447_BRAND_IDS,
  phase447PicassoPlatinumMontblancBrandPacks,
} from "../../scripts/data/phase447-picasso-platinum-montblanc-brand-depth";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const BASE_CHECKPOINT = path.join(
  ROOT,
  ".planning/quick/260804-5nz-sheaffer-schon-nahvalur-brand-depth-owned-checkpoint/checkpoint.db",
);

test("Phase 447 deepens Picasso, Platinum and Montblanc on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const baseSnapshot = snapshotCatalogFiles(BASE_CHECKPOINT);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase447-brand-depth-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    BASE_CHECKPOINT,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: baseSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase447-picasso-platinum-montblanc-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: realSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    assert.equal(phase447PicassoPlatinumMontblancBrandPacks.length, 3);
    for (const pack of phase447PicassoPlatinumMontblancBrandPacks) {
      assert.equal(pack.expectedType, "brand");
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          3_500,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          3,
      );
    }
    await assert.rejects(
      applyPhase447BrandDepth(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase447BrandDepth(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      Object.values(PHASE447_BRAND_IDS),
    );
    for (const [label, brandId] of Object.entries(PHASE447_BRAND_IDS)) {
      const entity = (
        await client.execute({
          sql: "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
          args: [brandId],
        })
      ).rows[0];
      assert.equal(String(entity?.id), brandId);
      assert.equal(String(entity?.type), "brand");
      assert.equal(String(entity?.slug), label);
      const body = String(entity?.body_md ?? "");
      assert.ok(
        Array.from(body).length >= 2_600,
        `${label} published body is too short`,
      );
      assert.equal(
        body.match(/made_by|数据库|仓库/i),
        null,
        `${label} contains internal wording`,
      );
      const references = (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=? AND review_status='approved'",
          args: [brandId],
        })
      ).rows[0];
      assert.ok(Number(references?.n) >= 4);
      const media = (
        await client.execute({
          sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND review_status='approved' AND usage_status='primary'",
          args: [brandId],
        })
      ).rows[0];
      assert.equal(Number(media?.n), 1);
      const models = (
        await client.execute({
          sql: `
              SELECT e.id
              FROM entities e
              JOIN entity_publications publication
                ON publication.entity_id=e.id AND publication.status='published'
              JOIN entity_links maker
                ON maker.source_id=e.id AND maker.target_id=? AND maker.link_type='made_by'
              WHERE e.type='pen'
            `,
          args: [brandId],
        })
      ).rows;
      for (const model of models) {
        const reverse = (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [brandId, String(model.id)],
          })
        ).rows[0];
        assert.equal(Number(reverse?.n), 1);
      }
      const hash = await computePublicationContentHash(client, brandId);
      const reviews = (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [brandId, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]);
      assert.deepEqual(reviews, [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ]);
      const publication = (
        await client.execute({
          sql: "SELECT status,reviewed_content_revision,content_revision,reviewed_contract_version,approved_content_hash FROM entity_publications WHERE entity_id=?",
          args: [brandId],
        })
      ).rows[0];
      assert.equal(String(publication?.status), "published");
      assert.equal(
        Number(publication?.reviewed_content_revision),
        Number(publication?.content_revision),
      );
      assert.equal(Number(publication?.reviewed_contract_version), 3);
      assert.equal(String(publication?.approved_content_hash), hash);
    }
    const replay = await applyPhase447BrandDepth(client, options);
    assert.ok(replay.entities.every((item) => item.outcome === "noop"));
    assertCatalogSnapshotUnchanged(realSnapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
