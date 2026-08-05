import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase511Options,
  applyPhase511WancherKieiCamelliaSiblings,
} from "../../scripts/apply-phase511-wancher-kiei-camellia-siblings";
import {
  PHASE511_TARGETS,
  PHASE511_WANCHER_BRAND_ID,
  phase511WancherKieiCamelliaSiblingPacks,
} from "../../scripts/data/phase511-wancher-kiei-camellia-siblings";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 511 publishes three sourced Wancher Kiei Camellia sibling SKUs on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase511-wancher-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase511Options = {
    workspaceRoot: ROOT,
    reviewer: "phase511-wancher-kiei-camellia-siblings-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
  try {
    await migrateDatabase(client);
    assert.equal(phase511WancherKieiCamelliaSiblingPacks.length, 3);
    for (const pack of phase511WancherKieiCamelliaSiblingPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(Array.from(markdown).length >= 2_700);
      const bodyStart = markdown.indexOf("## body_md");
      const sourcesStart = markdown.indexOf("\n## 来源\n", bodyStart);
      assert.ok(
        bodyStart >= 0 &&
          sourcesStart > bodyStart &&
          markdown.slice(bodyStart + "## body_md".length, sourcesStart)
            .length >= 2_000,
      );
      assert.match(markdown, /## model_specs/);
      assert.match(markdown, /## 来源/);
      assert.doesNotMatch(markdown, /数据库|made_by|canonical/i);
      const localPath = pack.media[0]?.localPath;
      assert.ok(localPath);
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.replace(/^\//, "")),
        "utf8",
      );
      assert.match(svg, /非产品照片/);
      assert.match(svg, /Camellia/);
      assert.match(svg, /Urushi/);
    }
    await assert.rejects(
      applyPhase511WancherKieiCamelliaSiblings(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: options.env?.NODE_ENV ?? "test",
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        },
      }),
      /inherited remote database selection/,
    );
    const first = await applyPhase511WancherKieiCamelliaSiblings(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      phase511WancherKieiCamelliaSiblingPacks.map((pack) => [
        pack.entityId,
        "published",
      ]),
    );
    for (const [
      index,
      pack,
    ] of phase511WancherKieiCamelliaSiblingPacks.entries()) {
      const target = PHASE511_TARGETS[index];
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
      assert.match(String(publicRow?.body_md ?? ""), /Camellia|山茶花/);
      assert.match(String(publicRow?.body_md ?? ""), /Urushi|天然漆/);
      assert.match(String(publicRow?.body_md ?? ""), /JoWo|18K/);
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
            sql: "SELECT count(*) AS n FROM public_entities WHERE id=?",
            args: [pack.entityId],
          })
        ).rows[0]?.n,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [pack.entityId, PHASE511_WANCHER_BRAND_ID],
          })
        ).rows[0]?.n,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE511_WANCHER_BRAND_ID, pack.entityId],
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
        5,
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
            args: [
              `https://www.wancherpen.com/products/kiei-urushi-camellia-${target.key}`,
            ],
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
    const replay = await applyPhase511WancherKieiCamelliaSiblings(
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
