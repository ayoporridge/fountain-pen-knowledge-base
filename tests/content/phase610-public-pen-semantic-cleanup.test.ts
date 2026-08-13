import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase610Options,
  applyPhase610PublicPenSemanticCleanup,
} from "../../scripts/apply-phase610-public-pen-semantic-cleanup";
import {
  PHASE610_TARGET_COUNT,
  phase610SemanticCleanupPatches,
  sha256Text,
} from "../../scripts/phase610/semantic-cleanup-patches";
import { phase610TerminalBodySha256ByEntityId } from "../../scripts/phase610/semantic-cleanup-terminal-hashes";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = process.cwd();
const SOURCE = path.join(
  ROOT,
  ".planning/quick/260813-emg-aurora-ipsilon-demo-colors-sheaffer-impe/checkpoint-final/catalog.db",
);
const REAL = path.join(ROOT, "data", "fpkg.db");
const REMOTE_KEYS = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "FPKG_DATABASE_URL",
] as const;

function cleanEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: "test",
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: "",
  };
}

function ownedCopy(sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>) {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase610-semantic-cleanup-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  return { ownedRoot, databasePath: copy.destinationPath };
}

function optionsFor(
  ownedRoot: string,
  databasePath: string,
  sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  realSnapshot: ReturnType<typeof snapshotCatalogFiles>,
): ApplyPhase610Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase610-public-pen-semantic-cleanup-test",
    databasePath,
    ownedRoot,
    protectedCatalogs: [
      { path: SOURCE, snapshot: sourceSnapshot },
      { path: REAL, snapshot: realSnapshot },
    ],
    env: cleanEnv(),
  };
}

async function closeAndRemoveSidecars(
  client: Client,
  databasePath: string,
): Promise<void> {
  await client
    .execute("PRAGMA wal_checkpoint(TRUNCATE)")
    .catch(() => undefined);
  client.close();
  const wal = `${databasePath}-wal`;
  if (fs.existsSync(wal)) assert.equal(fs.statSync(wal).size, 0);
  for (const suffix of ["-wal", "-shm"] as const) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true });
  }
}

test("Phase 610 freezes 126 exact semantic patches and natural replacement text", () => {
  assert.equal(phase610SemanticCleanupPatches.length, PHASE610_TARGET_COUNT);
  assert.equal(
    new Set(phase610SemanticCleanupPatches.map((patch) => patch.entityId)).size,
    PHASE610_TARGET_COUNT,
  );
  assert.equal(
    Object.keys(phase610TerminalBodySha256ByEntityId).length,
    PHASE610_TARGET_COUNT,
  );
  const banned =
    /\bPhase\s*\d+|\bmade_by\b|\bmodel_specs\b|\bcontent pack\b|\bpayload\b|我们|让我们|我长期使用|本文没有第一人称|本页没有第一人称|本文|本页|(?<!日)本站/i;
  for (const patch of phase610SemanticCleanupPatches) {
    assert.match(patch.expectedBodySha256, /^[0-9a-f]{64}$/);
    assert.match(
      phase610TerminalBodySha256ByEntityId[patch.entityId] ?? "",
      /^[0-9a-f]{64}$/,
    );
    for (const replacement of patch.replacements) {
      assert.ok(replacement.oldText.trim());
      assert.ok(replacement.newText.trim());
      assert.doesNotMatch(replacement.newText, banned);
    }
  }
});

test("Phase 610 rejects remote selectors without touching either protected family", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const { ownedRoot, databasePath } = ownedCopy(sourceSnapshot);
  const candidateBefore = snapshotCatalogFiles(databasePath);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    for (const key of REMOTE_KEYS) {
      await assert.rejects(
        applyPhase610PublicPenSemanticCleanup(client, {
          ...optionsFor(ownedRoot, databasePath, sourceSnapshot, realSnapshot),
          env: { ...cleanEnv(), [key]: "remote-selection-must-fail" },
        }),
        new RegExp(key),
      );
      assertCatalogSnapshotUnchanged(candidateBefore);
      assertCatalogSnapshotUnchanged(sourceSnapshot);
      assertCatalogSnapshotUnchanged(realSnapshot);
    }
  } finally {
    client.close();
  }
});

test("Phase 610 applies all targets once and replays as a byte-preserving noop", {
  timeout: 4_000_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const { ownedRoot, databasePath } = ownedCopy(sourceSnapshot);
  const options = optionsFor(
    ownedRoot,
    databasePath,
    sourceSnapshot,
    realSnapshot,
  );
  let client = createClient({ url: `file:${databasePath}` });
  const first = await applyPhase610PublicPenSemanticCleanup(client, options);
  assert.equal(first.entities.length, PHASE610_TARGET_COUNT);
  assert.ok(first.entities.every((entity) => entity.outcome === "published"));

  const placeholders = phase610SemanticCleanupPatches.map(() => "?").join(",");
  const targetIds = phase610SemanticCleanupPatches.map(
    (patch) => patch.entityId,
  );
  const rows = await client.execute({
    sql: `SELECT entity.id,entity.name,entity.body_md,story.title,story.body_md story_body,
                 publication.status,publication.blockers_json,
                 readiness.blocker_count,readiness.publishable
          FROM entities entity
          JOIN stories story ON story.entity_id=entity.id AND story.status='published'
          JOIN entity_publications publication ON publication.entity_id=entity.id
          JOIN public_entity_readiness readiness
            ON readiness.entity_id=entity.id AND readiness.contract_version=3
          WHERE entity.id IN (${placeholders})`,
    args: targetIds,
  });
  assert.equal(rows.rows.length, PHASE610_TARGET_COUNT);
  for (const row of rows.rows) {
    const id = String(row.id);
    const patch = phase610SemanticCleanupPatches.find(
      (candidate) => candidate.entityId === id,
    );
    assert.ok(patch);
    assert.equal(String(row.body_md), String(row.story_body));
    assert.equal(
      sha256Text(String(row.body_md)),
      phase610TerminalBodySha256ByEntityId[id],
    );
    assert.equal(String(row.name), patch.nextName ?? patch.expectedName);
    assert.equal(
      String(row.title),
      patch.nextStoryTitle ?? patch.expectedStoryTitle,
    );
    assert.equal(String(row.status), "published");
    assert.equal(String(row.blockers_json), "[]");
    assert.equal(Number(row.blocker_count), 0);
    assert.equal(Number(row.publishable), 1);
    for (const replacement of patch.replacements) {
      assert.equal(String(row.body_md).includes(replacement.oldText), false);
      assert.ok(String(row.body_md).includes(replacement.newText));
    }
  }
  const reviews = await client.execute({
    sql: `SELECT count(*) n FROM entity_content_reviews review
          JOIN entity_publications publication
            ON publication.entity_id=review.entity_id
           AND publication.approved_content_hash=review.content_hash
          WHERE review.reviewer=? AND review.status='approved'
            AND review.review_kind IN ('fact','language','media')`,
    args: [options.reviewer],
  });
  assert.equal(Number(reviews.rows[0]?.n), PHASE610_TARGET_COUNT * 3);
  await closeAndRemoveSidecars(client, databasePath);

  const beforeReplay = snapshotCatalogFiles(databasePath);
  client = createClient({ url: `file:${databasePath}` });
  const replay = await applyPhase610PublicPenSemanticCleanup(client, options);
  assert.equal(replay.entities.length, PHASE610_TARGET_COUNT);
  assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  await closeAndRemoveSidecars(client, databasePath);
  assertCatalogSnapshotUnchanged(beforeReplay);
  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(realSnapshot);
});

test("Phase 610 rejects one-snippet drift and a partially terminal target set", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const firstPatch = phase610SemanticCleanupPatches[0];
  assert.ok(firstPatch);

  {
    const { ownedRoot, databasePath } = ownedCopy(sourceSnapshot);
    const client = createClient({ url: `file:${databasePath}` });
    const row = (
      await client.execute({
        sql: "SELECT body_md FROM entities WHERE id=?",
        args: [firstPatch.entityId],
      })
    ).rows[0];
    const body = String(row?.body_md);
    const changed = body.replace(
      firstPatch.replacements[0].oldText,
      firstPatch.replacements[0].newText,
    );
    await client.batch(
      [
        {
          sql: "UPDATE entities SET body_md=? WHERE id=?",
          args: [changed, firstPatch.entityId],
        },
        {
          sql: "UPDATE stories SET body_md=? WHERE entity_id=? AND status='published'",
          args: [changed, firstPatch.entityId],
        },
      ],
      "write",
    );
    await closeAndRemoveSidecars(client, databasePath);
    const collisionClient = createClient({ url: `file:${databasePath}` });
    await assert.rejects(
      applyPhase610PublicPenSemanticCleanup(
        collisionClient,
        optionsFor(ownedRoot, databasePath, sourceSnapshot, realSnapshot),
      ),
      /old-body hash or terminal-body collision/,
    );
    collisionClient.close();
  }

  {
    const { ownedRoot, databasePath } = ownedCopy(sourceSnapshot);
    const client = createClient({ url: `file:${databasePath}` });
    const row = (
      await client.execute({
        sql: "SELECT body_md FROM entities WHERE id=?",
        args: [firstPatch.entityId],
      })
    ).rows[0];
    let terminalBody = String(row?.body_md);
    for (const replacement of firstPatch.replacements) {
      terminalBody = terminalBody.replace(
        replacement.oldText,
        replacement.newText,
      );
    }
    await client.batch(
      [
        {
          sql: "UPDATE entities SET name=?,body_md=? WHERE id=?",
          args: [
            firstPatch.nextName ?? firstPatch.expectedName,
            terminalBody,
            firstPatch.entityId,
          ],
        },
        {
          sql: "UPDATE stories SET title=?,body_md=? WHERE entity_id=? AND status='published'",
          args: [
            firstPatch.nextStoryTitle ?? firstPatch.expectedStoryTitle,
            terminalBody,
            firstPatch.entityId,
          ],
        },
      ],
      "write",
    );
    await closeAndRemoveSidecars(client, databasePath);
    const partialClient = createClient({ url: `file:${databasePath}` });
    await assert.rejects(
      applyPhase610PublicPenSemanticCleanup(
        partialClient,
        optionsFor(ownedRoot, databasePath, sourceSnapshot, realSnapshot),
      ),
      /partially applied target set/,
    );
    partialClient.close();
  }
  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(realSnapshot);
});
