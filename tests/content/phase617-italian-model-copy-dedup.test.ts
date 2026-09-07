import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase617Options,
  applyPhase617ItalianModelCopyDedup,
  PHASE617_REVIEWER,
  PHASE617_TARGETS,
} from "../../scripts/apply-phase617-italian-model-copy-dedup";
import { loadPhase140Packs } from "../../scripts/data/phase140-italian-representative-models-batch";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

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
  args: readonly unknown[] = [],
) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function structuralFingerprint(
  client: Client,
  entityId: string,
): Promise<string> {
  const tables = [
    [
      "entity_links",
      "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
      [entityId, entityId],
    ],
    [
      "entity_references",
      "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    [
      "media_assets",
      "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    [
      "model_specs",
      "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    [
      "model_variants",
      "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
      [entityId],
    ],
    [
      "entity_aliases",
      "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    [
      "fact_scopes",
      "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    [
      "claims",
      "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
      [entityId],
    ],
    [
      "timeline_events",
      "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    [
      "fact_conflicts",
      "SELECT * FROM fact_conflicts WHERE entity_id=? ORDER BY id",
      [entityId],
    ],
    [
      "entity_tags",
      "SELECT * FROM entity_tags WHERE entity_id=? ORDER BY tag_id",
      [entityId],
    ],
  ] as const;
  const result: Record<string, unknown> = {};
  for (const [name, sql, args] of tables)
    result[name] = await rows(client, sql, args);
  return JSON.stringify(result);
}

function localEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: "test",
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: "",
  };
}

function duplicateParagraphs(
  bodies: Array<{ slug: string; body: string }>,
): string[] {
  const groups = new Map<string, string[]>();
  for (const item of bodies) {
    for (const paragraph of item.body
      .split(/\n\s*\n/)
      .map((value) => value.trim())
      .filter((value) => value.length >= 100)) {
      groups.set(paragraph, [...(groups.get(paragraph) ?? []), item.slug]);
    }
  }
  return [...groups.values()]
    .filter((pages) => pages.length > 1)
    .map((pages) => pages.join(","));
}

test("Phase 617 gives seven Italian model pages model-specific copy on an owned catalog", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase617-italian-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    {
      expectedSourceSnapshot: protectedSnapshot,
    },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase617Options = {
    workspaceRoot: ROOT,
    reviewer: `${PHASE617_REVIEWER}-test`,
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: localEnv(),
  };

  try {
    await migrateDatabase(client);
    const packs = loadPhase140Packs(ROOT).filter((pack) =>
      PHASE617_TARGETS.some((target) => target.entityId === pack.entityId),
    );
    assert.equal(packs.length, PHASE617_TARGETS.length);
    const packById = new Map(packs.map((pack) => [pack.entityId, pack]));
    const beforeBodies = new Map<string, string>();
    const relationBefore = new Map<string, string>();
    const initialSources = new Map<string, string>();
    for (const target of PHASE617_TARGETS) {
      const row = (
        await rows(client, "SELECT body_md,source FROM entities WHERE id=?", [
          target.entityId,
        ])
      )[0];
      assert.ok(row);
      beforeBodies.set(target.entityId, String(row.body_md));
      initialSources.set(target.entityId, String(row.source ?? ""));
      relationBefore.set(
        target.entityId,
        await structuralFingerprint(client, target.entityId),
      );
    }
    const alreadyApplied = PHASE617_TARGETS.every(
      (target) =>
        initialSources.get(target.entityId) ===
          packById.get(target.entityId)?.sourceMarker &&
        beforeBodies.get(target.entityId) ===
          packById.get(target.entityId)?.bodyMd,
    );

    await assert.rejects(
      applyPhase617ItalianModelCopyDedup(client, {
        ...options,
        env: { ...localEnv(), TURSO_DATABASE_URL: "libsql://remote.invalid" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase617ItalianModelCopyDedup(client, options);
    assert.deepEqual(first.affected, {
      entities: 7,
      changed: alreadyApplied ? 0 : 7,
      noop: alreadyApplied ? 7 : 0,
    });
    assert.equal(first.entities.length, 7);
    assert.ok(
      first.entities.every((item) =>
        alreadyApplied ? item.outcome === "noop" : item.outcome === "published",
      ),
    );

    const finalBodies: Array<{ slug: string; body: string }> = [];
    for (const pack of packs) {
      const current = (
        await rows(
          client,
          `SELECT entity.body_md,entity.source,story.body_md AS story_body,
                  story.title AS story_title,story.summary AS story_summary,
                  story.source_notes AS story_source,publication.status,
                  publication.content_revision,publication.reviewed_content_revision,
                  publication.approved_content_hash,readiness.blocker_count,
                  readiness.publishable,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
             FROM entities entity
             JOIN stories story ON story.entity_id=entity.id
              AND story.story_type='model_story' AND story.status='published'
             JOIN entity_publications publication ON publication.entity_id=entity.id
             LEFT JOIN public_entity_readiness readiness
              ON readiness.entity_id=entity.id AND readiness.contract_version=3
             LEFT JOIN public_entities public ON public.id=entity.id
            WHERE entity.id=?`,
          [pack.entityId],
        )
      )[0];
      assert.ok(current);
      if (!alreadyApplied) {
        assert.notEqual(
          String(current.body_md),
          beforeBodies.get(pack.entityId),
        );
      }
      assert.equal(String(current.body_md), pack.bodyMd);
      assert.equal(String(current.story_body), pack.bodyMd);
      assert.equal(String(current.story_title), pack.storyTitle);
      assert.equal(String(current.story_summary), pack.summary);
      assert.equal(String(current.source), pack.sourceMarker);
      assert.equal(String(current.story_source), pack.sourceMarker);
      assert.equal(String(current.status), "published");
      assert.equal(
        Number(current.content_revision),
        Number(current.reviewed_content_revision),
      );
      assert.equal(Number(current.blocker_count), 0);
      assert.equal(Number(current.publishable), 1);
      assert.equal(Number(current.is_public), 1);
      assert.equal(
        String(current.approved_content_hash),
        await computePublicationContentHash(client, pack.entityId),
      );
      assert.deepEqual(
        await rows(
          client,
          "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          [
            pack.entityId,
            first.entities.find((item) => item.entityId === pack.entityId)
              ?.contentHash,
          ],
        ),
        [
          { review_kind: "fact", status: "approved" },
          { review_kind: "language", status: "approved" },
          { review_kind: "media", status: "approved" },
          { review_kind: "publication", status: "approved" },
        ],
      );
      assert.equal(
        await structuralFingerprint(client, pack.entityId),
        relationBefore.get(pack.entityId),
      );
      finalBodies.push({ slug: pack.expectedSlug, body: pack.bodyMd });
    }
    assert.deepEqual(duplicateParagraphs(finalBodies), []);
    assert.deepEqual(
      await rows(
        client,
        "SELECT body_md,count(*) AS count FROM public_entities GROUP BY body_md HAVING count(*)>1",
      ),
      [],
    );

    const revisions = new Map<string, number>();
    for (const target of PHASE617_TARGETS) {
      const row = (
        await rows(
          client,
          "SELECT content_revision FROM entity_publications WHERE entity_id=?",
          [target.entityId],
        )
      )[0];
      revisions.set(target.entityId, Number(row?.content_revision));
    }
    const replay = await applyPhase617ItalianModelCopyDedup(client, options);
    assert.deepEqual(replay.affected, { entities: 7, changed: 0, noop: 7 });
    assert.ok(replay.entities.every((item) => item.outcome === "noop"));
    for (const target of PHASE617_TARGETS) {
      const row = (
        await rows(
          client,
          "SELECT content_revision FROM entity_publications WHERE entity_id=?",
          [target.entityId],
        )
      )[0];
      assert.equal(
        Number(row?.content_revision),
        revisions.get(target.entityId),
      );
    }
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }

  assertCatalogSnapshotUnchanged(protectedSnapshot);
  assert.equal(sha256(REAL), protectedHash);
});
