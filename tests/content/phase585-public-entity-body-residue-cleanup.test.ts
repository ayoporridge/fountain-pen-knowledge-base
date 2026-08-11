import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase585Options,
  applyPhase585PublicEntityBodyResidueCleanup,
} from "../../scripts/apply-phase585-public-entity-body-residue-cleanup";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const EXISTING = process.env.FPKG_PHASE585_EXISTING_DATABASE?.trim() || null;
const SOURCE = fs.realpathSync.native(
  process.env.FPKG_PHASE585_SOURCE_DATABASE?.trim() || REAL,
);

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function createOwnedRoot(): string {
  const requested = process.env.FPKG_PHASE585_OWNED_ROOT?.trim();
  if (!requested) {
    return fs.realpathSync.native(
      fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase585-entity-cleanup-")),
    );
  }
  if (!path.isAbsolute(requested)) {
    throw new Error("FPKG_PHASE585_OWNED_ROOT must be an absolute path.");
  }
  fs.mkdirSync(requested, { recursive: true });
  return fs.realpathSync.native(requested);
}

async function rows(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (
    await client.execute({
      sql,
      args: args as never[],
    })
  ).rows.map((row) => ({ ...row }));
}

test("Phase 585 cleans and republishes public entity bodies on an owned copy", {
  timeout: 4_000_000,
  skip: EXISTING ? "validating an already-completed owned candidate" : false,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const sourceHash = sha256(SOURCE);
  const ownedRoot = createOwnedRoot();
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const reviewer = "phase585-public-entity-body-residue-cleanup-test";
  const options: ApplyPhase585Options = {
    workspaceRoot: ROOT,
    reviewer,
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };

  try {
    await migrateDatabase(client);
    const beforeCounts = (
      await rows(
        client,
        `SELECT
             (SELECT count(*) FROM entity_publications WHERE status='published') AS published,
             (SELECT count(*) FROM public_entities) AS public,
             (SELECT count(*) FROM entities entity
              JOIN entity_publications publication ON publication.entity_id=entity.id
              WHERE publication.status='published' AND entity.type='pen'
                AND entity.body_md LIKE '%## model_specs%') AS pens,
             (SELECT count(*) FROM entities entity
              JOIN entity_publications publication ON publication.entity_id=entity.id
              WHERE publication.status='published' AND entity.type='brand'
                AND entity.body_md LIKE '%## model_specs%') AS brands,
             (SELECT count(*) FROM stories story
              JOIN entity_publications publication ON publication.entity_id=story.entity_id
              WHERE story.status='published' AND publication.status='published'
                AND story.body_md LIKE '%## model_specs%') AS story_residue,
             (SELECT count(*) FROM entities entity
              JOIN entity_publications publication ON publication.entity_id=entity.id
              WHERE publication.status='retired'
                AND entity.body_md LIKE '%## model_specs%') AS retired_residue`,
      )
    )[0];
    assert.equal(Number(beforeCounts?.pens), 180);
    assert.equal(Number(beforeCounts?.brands), 15);
    assert.equal(Number(beforeCounts?.retired_residue), 4);

    const beforeStructuredSpecs = Number(
      (
        await rows(
          client,
          `SELECT count(*) AS n FROM model_specs spec
             WHERE spec.entity_id IN (
               SELECT entity.id FROM entities entity
               JOIN entity_publications publication
                 ON publication.entity_id=entity.id
               WHERE publication.status='published' AND entity.type='pen'
                 AND entity.body_md LIKE '%## model_specs%'
             )`,
        )
      )[0]?.n,
    );
    assert.equal(beforeStructuredSpecs, 180);

    const sampleBefore = (
      await rows(
        client,
        `SELECT entity.id,entity.body_md,story.body_md AS story_body_md
           FROM entities entity
           JOIN stories story ON story.entity_id=entity.id AND story.status='published'
           WHERE entity.slug='wancher-tsuikin-kanhizakura'`,
      )
    )[0];
    assert.ok(sampleBefore);
    assert.match(String(sampleBefore?.body_md), /^## model_specs$/m);

    const ownedHashBeforeRefusal = sha256(copy.destinationPath);
    await assert.rejects(
      applyPhase585PublicEntityBodyResidueCleanup(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );
    assert.equal(sha256(copy.destinationPath), ownedHashBeforeRefusal);

    const first = await applyPhase585PublicEntityBodyResidueCleanup(
      client,
      options,
    );
    assert.deepEqual(first.affected, {
      entities: 195,
      pens: 180,
      brands: 15,
      removedBlocks: 195,
      retiredResiduePreserved: 4,
    });
    assert.equal(first.entities.length, 195);
    assert.ok(first.entities.every((entity) => entity.outcome === "published"));

    const afterCounts = (
      await rows(
        client,
        `SELECT
             (SELECT count(*) FROM entity_publications WHERE status='published') AS published,
             (SELECT count(*) FROM public_entities) AS public,
             (SELECT count(*) FROM entities entity
              JOIN entity_publications publication ON publication.entity_id=entity.id
              WHERE publication.status='published'
                AND entity.body_md LIKE '%## model_specs%') AS public_residue,
             (SELECT count(*) FROM stories story
              JOIN entity_publications publication ON publication.entity_id=story.entity_id
              WHERE story.status='published' AND publication.status='published'
                AND story.body_md LIKE '%## model_specs%') AS story_residue,
             (SELECT count(*) FROM entities entity
              JOIN entity_publications publication ON publication.entity_id=entity.id
              WHERE publication.status='retired'
                AND entity.body_md LIKE '%## model_specs%') AS retired_residue,
             (SELECT count(*) FROM public_entity_readiness readiness
              JOIN entity_publications publication ON publication.entity_id=readiness.entity_id
              WHERE publication.status='published' AND readiness.contract_version=3
                AND (readiness.blocker_count<>0 OR readiness.publishable<>1))
                AS published_blockers`,
      )
    )[0];
    assert.equal(
      Number(afterCounts?.published),
      Number(beforeCounts?.published),
    );
    assert.equal(Number(afterCounts?.public), Number(beforeCounts?.public));
    assert.equal(Number(afterCounts?.public_residue), 0);
    assert.equal(
      Number(afterCounts?.story_residue),
      Number(beforeCounts?.story_residue),
    );
    assert.equal(
      Number(afterCounts?.retired_residue),
      Number(beforeCounts?.retired_residue),
    );
    assert.equal(Number(afterCounts?.published_blockers), 0);

    const afterStructuredSpecs = Number(
      (
        await rows(
          client,
          `SELECT count(*) AS n FROM model_specs
             WHERE entity_id IN (${first.entities.map(() => "?").join(",")})`,
          first.entities.map((entity) => entity.entityId),
        )
      )[0]?.n,
    );
    assert.equal(afterStructuredSpecs, beforeStructuredSpecs);

    if (Number(beforeCounts?.story_residue) === 0) {
      const unalignedBodies = Number(
        (
          await rows(
            client,
            `SELECT count(*) AS n FROM entities entity
               JOIN stories story
                 ON story.entity_id=entity.id AND story.status='published'
               WHERE entity.id IN (${first.entities.map(() => "?").join(",")})
                 AND entity.body_md<>story.body_md`,
            first.entities.map((entity) => entity.entityId),
          )
        )[0]?.n,
      );
      assert.equal(unalignedBodies, 0);
    }

    const currentReviews = Number(
      (
        await rows(
          client,
          `SELECT count(*) AS n FROM entity_content_reviews review
             JOIN entity_publications publication
               ON publication.entity_id=review.entity_id
              AND publication.approved_content_hash=review.content_hash
             WHERE review.reviewer=? AND review.status='approved'
               AND review.review_kind IN ('fact','language','media','publication')`,
          [reviewer],
        )
      )[0]?.n,
    );
    assert.equal(currentReviews, 195 * 4);

    const sampleAfter = (
      await rows(
        client,
        `SELECT entity.body_md,story.body_md AS story_body_md
           FROM entities entity
           JOIN stories story ON story.entity_id=entity.id AND story.status='published'
           WHERE entity.id=?`,
        [sampleBefore?.id],
      )
    )[0];
    assert.doesNotMatch(String(sampleAfter?.body_md), /^## model_specs$/m);
    assert.match(String(sampleAfter?.body_md), /Dream Pen 是跨材料/);
    assert.match(String(sampleAfter?.body_md), /Ryukyu Tsuikin/);
    assert.match(String(sampleAfter?.body_md), /Kanhizakura/);
    assert.match(String(sampleAfter?.body_md), /^### 供墨、气密帽与日常使用$/m);
    assert.equal(
      String(sampleAfter?.story_body_md),
      String(sampleBefore?.story_body_md),
    );
    if (Number(beforeCounts?.story_residue) === 0) {
      assert.equal(
        String(sampleAfter?.body_md),
        String(sampleAfter?.story_body_md),
      );
    }

    const revisionsBeforeReplay = Number(
      (
        await rows(
          client,
          `SELECT sum(content_revision) AS n FROM entity_publications
             WHERE entity_id IN (${first.entities.map(() => "?").join(",")})`,
          first.entities.map((entity) => entity.entityId),
        )
      )[0]?.n,
    );
    const replay = await applyPhase585PublicEntityBodyResidueCleanup(
      client,
      options,
    );
    assert.deepEqual(replay, {
      affected: {
        entities: 0,
        pens: 0,
        brands: 0,
        removedBlocks: 0,
        retiredResiduePreserved: 4,
      },
      entities: [],
    });
    const revisionsAfterReplay = Number(
      (
        await rows(
          client,
          `SELECT sum(content_revision) AS n FROM entity_publications
             WHERE entity_id IN (${first.entities.map(() => "?").join(",")})`,
          first.entities.map((entity) => entity.entityId),
        )
      )[0]?.n,
    );
    assert.equal(revisionsAfterReplay, revisionsBeforeReplay);

    assertCatalogSnapshotUnchanged(sourceSnapshot);
    assert.equal(sha256(SOURCE), sourceHash);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    assert.equal(sha256(REAL), protectedHash);
  } finally {
    client.close();
  }
});

test("Phase 585 verifies and replays an already-completed owned candidate", {
  timeout: 120_000,
  skip: EXISTING ? false : "no completed owned candidate was requested",
}, async () => {
  assert.ok(EXISTING);
  const databasePath = fs.realpathSync.native(EXISTING);
  const requestedRoot =
    process.env.FPKG_PHASE585_OWNED_ROOT?.trim() || path.dirname(databasePath);
  const ownedRoot = fs.realpathSync.native(requestedRoot);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const client = createClient({ url: `file:${databasePath}` });
  const reviewer = "phase585-public-entity-body-residue-cleanup-test";
  const options: ApplyPhase585Options = {
    workspaceRoot: ROOT,
    reviewer,
    databasePath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };

  try {
    await migrateDatabase(client);
    const targetRows = await rows(
      client,
      `SELECT DISTINCT entity.id,entity.type
       FROM entities entity
       JOIN entity_content_reviews review ON review.entity_id=entity.id
       WHERE review.reviewer=? AND review.review_kind='publication'
         AND review.status='approved'`,
      [reviewer],
    );
    const targetIds = targetRows.map((row) => String(row.id));
    assert.equal(targetIds.length, 195);
    assert.equal(
      targetRows.filter((row) => String(row.type) === "pen").length,
      180,
    );
    assert.equal(
      targetRows.filter((row) => String(row.type) === "brand").length,
      15,
    );

    const postconditions = (
      await rows(
        client,
        `SELECT
           (SELECT count(*) FROM entities entity
            JOIN entity_publications publication ON publication.entity_id=entity.id
            WHERE publication.status='published'
              AND entity.body_md LIKE '%## model_specs%') AS entity_residue,
           (SELECT count(*) FROM stories story
            JOIN entity_publications publication ON publication.entity_id=story.entity_id
            WHERE publication.status='published' AND story.status='published'
              AND story.body_md LIKE '%## model_specs%') AS story_residue,
           (SELECT count(*) FROM entities entity
            JOIN entity_publications publication ON publication.entity_id=entity.id
            WHERE publication.status='retired'
              AND entity.body_md LIKE '%## model_specs%') AS retired_residue,
           (SELECT count(*) FROM public_entity_readiness readiness
            JOIN entity_publications publication ON publication.entity_id=readiness.entity_id
            WHERE publication.status='published' AND readiness.contract_version=3
              AND (readiness.blocker_count<>0 OR readiness.publishable<>1))
              AS published_blockers,
           (SELECT count(*) FROM entity_content_reviews review
            JOIN entity_publications publication
              ON publication.entity_id=review.entity_id
             AND publication.approved_content_hash=review.content_hash
            WHERE review.reviewer=? AND review.status='approved'
              AND review.review_kind IN ('fact','language','media','publication'))
              AS current_reviews`,
        [reviewer],
      )
    )[0];
    assert.equal(Number(postconditions?.entity_residue), 0);
    assert.equal(Number(postconditions?.story_residue), 0);
    assert.equal(Number(postconditions?.retired_residue), 4);
    assert.equal(Number(postconditions?.published_blockers), 0);
    assert.equal(Number(postconditions?.current_reviews), 195 * 4);

    const targetReadback = (
      await rows(
        client,
        `SELECT
           count(*) AS targets,
           sum(CASE WHEN publication.status='published' THEN 1 ELSE 0 END)
             AS published,
           sum(CASE WHEN readiness.blocker_count=0 AND readiness.publishable=1
                     THEN 1 ELSE 0 END) AS ready,
           sum(CASE WHEN public.id IS NOT NULL THEN 1 ELSE 0 END) AS public,
           sum(CASE WHEN entity.body_md=story.body_md THEN 1 ELSE 0 END)
             AS aligned,
           sum(CASE WHEN spec.entity_id IS NOT NULL THEN 1 ELSE 0 END)
             AS structured_specs
         FROM entities entity
         JOIN entity_publications publication ON publication.entity_id=entity.id
         JOIN public_entity_readiness readiness
           ON readiness.entity_id=entity.id AND readiness.contract_version=3
         JOIN stories story ON story.entity_id=entity.id AND story.status='published'
         LEFT JOIN public_entities public ON public.id=entity.id
         LEFT JOIN model_specs spec ON spec.entity_id=entity.id
         WHERE entity.id IN (${targetIds.map(() => "?").join(",")})`,
        targetIds,
      )
    )[0];
    assert.equal(Number(targetReadback?.targets), 195);
    assert.equal(Number(targetReadback?.published), 195);
    assert.equal(Number(targetReadback?.ready), 195);
    assert.equal(Number(targetReadback?.public), 195);
    assert.equal(Number(targetReadback?.aligned), 195);
    assert.equal(Number(targetReadback?.structured_specs), 180);

    const sample = (
      await rows(
        client,
        `SELECT entity.body_md FROM entities entity
         WHERE entity.slug='wancher-tsuikin-kanhizakura'`,
      )
    )[0];
    assert.doesNotMatch(String(sample?.body_md), /^## model_specs$/m);
    assert.match(String(sample?.body_md), /Dream Pen 是跨材料/);
    assert.match(String(sample?.body_md), /Ryukyu Tsuikin/);
    assert.match(String(sample?.body_md), /Kanhizakura/);
    assert.match(String(sample?.body_md), /^### 供墨、气密帽与日常使用$/m);

    const revisionsBeforeReplay = Number(
      (
        await rows(
          client,
          `SELECT sum(content_revision) AS n FROM entity_publications
           WHERE entity_id IN (${targetIds.map(() => "?").join(",")})`,
          targetIds,
        )
      )[0]?.n,
    );
    const replay = await applyPhase585PublicEntityBodyResidueCleanup(
      client,
      options,
    );
    assert.deepEqual(replay, {
      affected: {
        entities: 0,
        pens: 0,
        brands: 0,
        removedBlocks: 0,
        retiredResiduePreserved: 4,
      },
      entities: [],
    });
    const revisionsAfterReplay = Number(
      (
        await rows(
          client,
          `SELECT sum(content_revision) AS n FROM entity_publications
           WHERE entity_id IN (${targetIds.map(() => "?").join(",")})`,
          targetIds,
        )
      )[0]?.n,
    );
    assert.equal(revisionsAfterReplay, revisionsBeforeReplay);

    assertCatalogSnapshotUnchanged(protectedSnapshot);
    assert.equal(sha256(REAL), protectedHash);
  } finally {
    client.close();
  }
});
