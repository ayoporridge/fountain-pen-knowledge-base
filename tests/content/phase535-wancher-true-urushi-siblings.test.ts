import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase535Options,
  applyPhase535WancherTrueUrushiSiblings,
} from "../../scripts/apply-phase535-wancher-true-urushi-siblings";
import {
  PHASE535_TARGETS,
  PHASE535_WANCHER_BRAND_ID,
  phase535WancherTrueUrushiPacks,
} from "../../scripts/data/phase535-wancher-true-urushi-siblings";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 535 publishes three sourced Wancher True Urushi siblings on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase535-wancher-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase535Options = {
    workspaceRoot: ROOT,
    reviewer: "phase535-wancher-true-urushi-siblings-test",
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
    assert.equal(PHASE535_TARGETS.length, 3);
    assert.equal(phase535WancherTrueUrushiPacks.length, 3);
    const svgPaths = new Set<string>();
    for (const pack of phase535WancherTrueUrushiPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(
        Array.from(markdown).length >= 2_700,
        `${pack.entityId} article is too short`,
      );
      const bodyStart = markdown.indexOf("## body_md");
      const sourcesStart = markdown.indexOf("\n## 来源\n", bodyStart);
      assert.ok(
        bodyStart >= 0 &&
          sourcesStart > bodyStart &&
          Array.from(
            markdown.slice(bodyStart + "## body_md".length, sourcesStart),
          ).length >= 2_000,
      );
      assert.match(markdown, /## model_specs/);
      assert.match(markdown, /## 来源/);
      assert.doesNotMatch(markdown, /数据库|made_by|canonical/i);
      const localPath = pack.media[0]?.localPath;
      assert.ok(localPath);
      assert.equal(svgPaths.has(localPath), false);
      svgPaths.add(localPath);
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.replace(/^\//, "")),
        "utf8",
      );
      assert.match(svg, /非产品照片/);
      assert.match(svg, /本站原创事实示意图/);
      assert.match(svg, /Urushi|Tamenuri/);
    }
    await assert.rejects(
      applyPhase535WancherTrueUrushiSiblings(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        },
      }),
      /inherited remote database selection/,
    );
    const first = await applyPhase535WancherTrueUrushiSiblings(client, options);
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      phase535WancherTrueUrushiPacks.map((pack) => [
        pack.entityId,
        "published",
      ]),
    );
    for (const [index, pack] of phase535WancherTrueUrushiPacks.entries()) {
      const target = PHASE535_TARGETS[index];
      assert.ok(target);
      const publicRow = (
        await client.execute({
          sql: "SELECT id,type,slug,name,summary,body_md FROM public_entities WHERE id=?",
          args: [pack.entityId],
        })
      ).rows[0];
      assert.deepEqual(
        [publicRow?.id, publicRow?.type, publicRow?.slug],
        [pack.entityId, "pen", pack.expectedSlug],
      );
      assert.ok(String(publicRow?.summary ?? "").length >= 60);
      assert.ok(String(publicRow?.body_md ?? "").length >= 2_000);
      assert.match(String(publicRow?.body_md ?? ""), /Tamenuri|Urushi/);
      assert.match(String(publicRow?.body_md ?? ""), /Ebonite/);
      assert.match(String(publicRow?.body_md ?? ""), /18K|JoWo/);
      assert.match(
        String(publicRow?.body_md ?? ""),
        /Converter|converter|European International Standard/,
      );
      assert.doesNotMatch(
        String(publicRow?.body_md ?? ""),
        /数据库|made_by|canonical/i,
      );
      const publication = (
        await client.execute({
          sql: "SELECT status,reviewed_content_revision,content_revision,reviewed_contract_version,approved_content_hash FROM entity_publications WHERE entity_id=?",
          args: [pack.entityId],
        })
      ).rows[0];
      assert.equal(String(publication?.status), "published");
      assert.equal(Number(publication?.reviewed_contract_version), 3);
      assert.equal(
        Number(publication?.reviewed_content_revision),
        Number(publication?.content_revision),
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [pack.entityId, PHASE535_WANCHER_BRAND_ID],
          })
        ).rows[0]?.n,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE535_WANCHER_BRAND_ID, pack.entityId],
          })
        ).rows[0]?.n,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [pack.entityId],
          })
        ).rows[0]?.n,
        pack.variants?.length ?? 0,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_specs WHERE entity_id=?",
            args: [pack.entityId],
          })
        ).rows[0]?.n,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [pack.entityId],
          })
        ).rows[0]?.n,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM source_items WHERE url=? AND review_status='approved'",
            args: [target.jsonUrl],
          })
        ).rows[0]?.n,
        1,
      );
      const hash = await computePublicationContentHash(client, pack.entityId);
      assert.equal(String(publication?.approved_content_hash), hash);
      assert.deepEqual(
        (
          await client.execute({
            sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            args: [pack.entityId, hash],
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
    const replay = await applyPhase535WancherTrueUrushiSiblings(
      client,
      options,
    );
    assert.deepEqual(
      replay.entities.map((item) => item.outcome),
      ["noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(
      protectedSnapshot,
      snapshotCatalogFiles(REAL),
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
