import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase583Options,
  applyPhase583PublicStoryResidueCleanup,
  stripRawModelSpecsSections,
} from "../../scripts/apply-phase583-public-story-residue-cleanup";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
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

test("Phase 583 strips only the raw model_specs JSON section", () => {
  const body = `## 正文

保留前文。

## model_specs

\`\`\`json
{
  "series_name": "示例型号",
  "fill_system": "converter"
}
\`\`\`

## 来源边界

保留后文。`;
  const cleaned = stripRawModelSpecsSections(body);
  assert.equal(cleaned.removedBlocks, 1);
  assert.equal(
    cleaned.bodyMd,
    "## 正文\n\n保留前文。\n\n## 来源边界\n\n保留后文。",
  );
  assert.deepEqual(
    stripRawModelSpecsSections("## 正文\n\nmodel_specs 只是普通词。"),
    {
      bodyMd: "## 正文\n\nmodel_specs 只是普通词。",
      removedBlocks: 0,
    },
  );
  assert.throws(
    () => stripRawModelSpecsSections("## model_specs\n\n没有 JSON fence"),
    /expected a JSON fence/,
  );
  assert.throws(
    () =>
      stripRawModelSpecsSections("## model_specs\n\n```json\n{invalid}\n```"),
    /invalid JSON/,
  );
});

test("Phase 583 cleans and republishes every affected public story on an owned copy", {
  timeout: 4_000_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase583-story-cleanup-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const reviewer = "phase583-public-story-residue-cleanup-test";
  const options: ApplyPhase583Options = {
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
             (SELECT count(*) FROM stories story
              JOIN entity_publications publication ON publication.entity_id=story.entity_id
              JOIN entities entity ON entity.id=story.entity_id
              WHERE story.status='published' AND publication.status='published'
                AND entity.type='pen' AND story.body_md LIKE '%## model_specs%') AS pens,
             (SELECT count(*) FROM stories story
              JOIN entity_publications publication ON publication.entity_id=story.entity_id
              JOIN entities entity ON entity.id=story.entity_id
              WHERE story.status='published' AND publication.status='published'
                AND entity.type='brand' AND story.body_md LIKE '%## model_specs%') AS brands,
             (SELECT count(*) FROM stories story
              JOIN entity_publications publication ON publication.entity_id=story.entity_id
              WHERE story.status='published' AND publication.status='retired'
                AND story.body_md LIKE '%## model_specs%') AS retired_residue`,
      )
    )[0];
    assert.equal(Number(beforeCounts?.pens), 180);
    assert.equal(Number(beforeCounts?.brands), 15);
    assert.ok(Number(beforeCounts?.retired_residue) >= 1);

    const beforeStructuredSpecs = Number(
      (
        await rows(
          client,
          `SELECT count(*) AS n FROM model_specs spec
             WHERE spec.entity_id IN (
               SELECT story.entity_id FROM stories story
               JOIN entity_publications publication
                 ON publication.entity_id=story.entity_id
               JOIN entities entity ON entity.id=story.entity_id
               WHERE story.status='published' AND publication.status='published'
                 AND entity.type='pen' AND story.body_md LIKE '%## model_specs%'
             )`,
        )
      )[0]?.n,
    );
    assert.ok(beforeStructuredSpecs >= 180);

    await assert.rejects(
      applyPhase583PublicStoryResidueCleanup(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );

    const first = await applyPhase583PublicStoryResidueCleanup(client, options);
    assert.deepEqual(first.affected, {
      entities: 195,
      pens: 180,
      brands: 15,
      removedBlocks: 195,
    });
    assert.equal(first.entities.length, 195);
    assert.ok(first.entities.every((entity) => entity.outcome === "published"));

    const afterCounts = (
      await rows(
        client,
        `SELECT
             (SELECT count(*) FROM entity_publications WHERE status='published') AS published,
             (SELECT count(*) FROM public_entities) AS public,
             (SELECT count(*) FROM stories story
              JOIN entity_publications publication ON publication.entity_id=story.entity_id
              WHERE story.status='published' AND publication.status='published'
                AND story.body_md LIKE '%## model_specs%') AS public_residue,
             (SELECT count(*) FROM stories story
              JOIN entity_publications publication ON publication.entity_id=story.entity_id
              WHERE story.status='published' AND publication.status='retired'
                AND story.body_md LIKE '%## model_specs%') AS retired_residue,
             (SELECT count(*) FROM public_entity_readiness readiness
              JOIN entity_publications publication ON publication.entity_id=readiness.entity_id
              WHERE publication.status='published' AND readiness.contract_version=3
                AND readiness.blocker_count>0) AS published_blockers`,
      )
    )[0];
    assert.equal(
      Number(afterCounts?.published),
      Number(beforeCounts?.published),
    );
    assert.equal(Number(afterCounts?.public), Number(beforeCounts?.public));
    assert.equal(Number(afterCounts?.public_residue), 0);
    assert.equal(
      Number(afterCounts?.retired_residue),
      Number(beforeCounts?.retired_residue),
    );
    assert.equal(Number(afterCounts?.published_blockers), 0);

    const afterStructuredSpecs = Number(
      (
        await rows(
          client,
          `SELECT count(*) AS n FROM model_specs spec
             WHERE spec.entity_id IN (${first.entities.map(() => "?").join(",")})`,
          first.entities.map((entity) => entity.entityId),
        )
      )[0]?.n,
    );
    assert.equal(afterStructuredSpecs, beforeStructuredSpecs);
    assert.equal(
      Number(
        (
          await rows(
            client,
            `SELECT count(*) AS n FROM entity_content_reviews review
               JOIN entity_publications publication
                 ON publication.entity_id=review.entity_id
                AND publication.approved_content_hash=review.content_hash
               WHERE review.reviewer=? AND review.status='approved'
                 AND review.review_kind IN ('fact','language','media')`,
            [reviewer],
          )
        )[0]?.n,
      ),
      195 * 3,
    );

    const preserved = (
      await rows(
        client,
        `SELECT story.body_md FROM stories story
           JOIN entities entity ON entity.id=story.entity_id
           WHERE entity.slug='wancher-tsuikin-kanhizakura'
             AND story.status='published'`,
      )
    )[0];
    assert.doesNotMatch(String(preserved?.body_md), /^## model_specs$/m);
    assert.match(String(preserved?.body_md), /Dream Pen Tsuikin Kanhizakura/);
    assert.match(String(preserved?.body_md), /^### 使用、维护和选购$/m);

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
    const replay = await applyPhase583PublicStoryResidueCleanup(
      client,
      options,
    );
    assert.deepEqual(replay, {
      affected: { entities: 0, pens: 0, brands: 0, removedBlocks: 0 },
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

    assertCatalogSnapshotUnchanged(protectedSnapshot);
    assert.equal(sha256(REAL), protectedHash);
  } finally {
    client.close();
  }
});
