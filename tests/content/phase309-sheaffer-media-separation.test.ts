import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase309SheafferMediaSeparation,
  PHASE309_TARGETS,
} from "../../scripts/apply-phase309-sheaffer-media-separation";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 309 separates Sheaffer factual media on an owned checkpoint copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase309-sheaffer-media-")),
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
    reviewer: "phase309-sheaffer-media-separation-test",
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
    for (const target of PHASE309_TARGETS) {
      const svg = fs.readFileSync(
        path.join(ROOT, "public", target.localPath.replace(/^\//, "")),
        "utf8",
      );
      for (const marker of [/non-photo/i, /not-to-scale/i, /non-colour-proof/i])
        assert.match(svg, marker);
    }
    await assert.rejects(
      applyPhase309SheafferMediaSeparation(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const beforeBodies = new Map<string, string>();
    for (const target of PHASE309_TARGETS) {
      const row = (
        await client.execute({
          sql: "SELECT body_md FROM public_entities WHERE id=?",
          args: [target.entityId],
        })
      ).rows[0];
      beforeBodies.set(target.entityId, String(row?.body_md ?? ""));
    }

    const first = await applyPhase309SheafferMediaSeparation(client, options);
    assert.equal(first.changed, true);
    assert.deepEqual(
      first.outcomes.map((item) => item.outcome),
      ["published", "published", "published"],
    );

    const media = (
      await client.execute({
        sql: `
          SELECT entity_id,local_path,image_url,source_url,source_item_id,title
          FROM media_assets WHERE entity_id IN (?,?,?) ORDER BY entity_id
        `,
        args: PHASE309_TARGETS.map((target) => target.entityId),
      })
    ).rows;
    assert.equal(media.length, 3);
    assert.equal(new Set(media.map((row) => String(row.local_path))).size, 3);
    assert.equal(
      new Set(media.map((row) => String(row.source_item_id))).size,
      3,
    );
    for (const target of PHASE309_TARGETS) {
      const row = media.find(
        (item) => String(item.entity_id) === target.entityId,
      );
      assert.deepEqual(
        [
          row?.local_path,
          row?.image_url,
          row?.source_url,
          row?.source_item_id,
          row?.title,
        ],
        [
          target.localPath,
          target.localPath,
          target.localPath,
          target.sourceItemId,
          target.title,
        ],
      );
      assert.equal(
        String(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM publication_source_item_entities WHERE source_item_id=? AND entity_id=?",
              args: [target.sourceItemId, target.entityId],
            })
          ).rows[0]?.n,
        ),
        "1",
      );
      assert.equal(
        String(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=? AND source_item_id=?",
              args: [target.entityId, target.sourceItemId],
            })
          ).rows[0]?.n,
        ),
        "1",
      );
      const body = String(
        (
          await client.execute({
            sql: "SELECT body_md FROM public_entities WHERE id=?",
            args: [target.entityId],
          })
        ).rows[0]?.body_md ?? "",
      );
      assert.equal(body, beforeBodies.get(target.entityId));
      const hash = await computePublicationContentHash(client, target.entityId);
      const reviews = (
        await client.execute({
          sql: "SELECT review_kind FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved'",
          args: [target.entityId, hash],
        })
      ).rows.map((row) => String(row.review_kind));
      assert.deepEqual(
        new Set(reviews),
        new Set(["fact", "language", "media", "publication"]),
      );
    }

    const replay = await applyPhase309SheafferMediaSeparation(client, options);
    assert.equal(replay.changed, false);
    assert.deepEqual(
      replay.outcomes.map((item) => item.outcome),
      ["noop", "noop", "noop"],
    );
    const duplicatePathCount = (
      await client.execute({
        sql: "SELECT count(*) AS n FROM media_assets WHERE local_path=?",
        args: [
          "/images/library/site-original/phase106/sheaffer/sheaffer-connaisseur-imperial-icon.svg",
        ],
      })
    ).rows[0]?.n;
    assert.equal(Number(duplicatePathCount), 0);
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
