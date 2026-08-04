import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase470WatermanIdealNo52No7Depth } from "../../scripts/apply-phase470-waterman-ideal-no52-no7-depth";
import {
  PHASE470_IDS,
  phase470WatermanIdealNo52No7DepthPacks,
} from "../../scripts/data/phase470-waterman-ideal-no52-no7-depth";
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
  ".planning/quick/260804-dkx-phase-469-deepen-existing-waterman-hundr/checkpoint.db",
);

test("Phase 470 deepens Waterman Ideal No.52 and No.7 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const baseSnapshot = snapshotCatalogFiles(BASE_CHECKPOINT);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase470-waterman-")),
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
    reviewer: "phase470-waterman-ideal-no52-no7-test",
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
    assert.equal(phase470WatermanIdealNo52No7DepthPacks.length, 2);
    for (const pack of phase470WatermanIdealNo52No7DepthPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(
        markdown.length >= 3_500,
        `${pack.expectedSlug} research copy is too short`,
      );
      assert.ok(
        (markdown.match(/## body_md\n([\s\S]*?)(?=\n## )/)?.[1] ?? "").length >=
          2_600,
        `${pack.expectedSlug} body is too short`,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          2,
      );
    }
    await assert.rejects(
      applyPhase470WatermanIdealNo52No7Depth(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase470WatermanIdealNo52No7Depth(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      Object.values(PHASE470_IDS),
    );
    for (const [label, modelId] of Object.entries(PHASE470_IDS)) {
      const pack = phase470WatermanIdealNo52No7DepthPacks.find(
        (item) => item.entityId === modelId,
      );
      assert.ok(pack);
      const entity = (
        await client.execute({
          sql: "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
          args: [modelId],
        })
      ).rows[0];
      assert.equal(String(entity?.id), modelId);
      assert.equal(String(entity?.type), pack.expectedType);
      assert.ok(
        String(entity?.body_md ?? "").length >= 2_400,
        `${label} published body is too short`,
      );
      assert.equal(
        String(entity?.body_md ?? "").match(/made_by|数据库|仓库/i),
        null,
      );
      const refs = (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=? AND review_status=?",
          args: [modelId, "approved"],
        })
      ).rows[0];
      assert.ok(Number(refs?.n) >= 4);
      const media = (
        await client.execute({
          sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND review_status=? AND usage_status=?",
          args: [modelId, "approved", "primary"],
        })
      ).rows[0];
      assert.equal(Number(media?.n), 1);
      assert.ok(pack.spec?.brandEntityId);
      const maker = (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type=?",
          args: [modelId, pack.spec.brandEntityId, "made_by"],
        })
      ).rows[0];
      assert.equal(Number(maker?.n), 1);
      const reverse = (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_links WHERE target_id=? AND link_type=?",
          args: [modelId, "reverse"],
        })
      ).rows[0];
      assert.equal(Number(reverse?.n), 1);
      const hash = await computePublicationContentHash(client, modelId);
      const reviews = (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [modelId, hash],
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
          args: [modelId],
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
    const replay = await applyPhase470WatermanIdealNo52No7Depth(
      client,
      options,
    );
    assert.ok(replay.entities.every((item) => item.outcome === "noop"));
    assertCatalogSnapshotUnchanged(realSnapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
