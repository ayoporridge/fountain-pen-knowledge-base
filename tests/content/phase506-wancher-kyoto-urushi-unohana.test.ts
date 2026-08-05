import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase506Options,
  applyPhase506WancherKyotoUrushiUnohana,
} from "../../scripts/apply-phase506-wancher-kyoto-urushi-unohana";
import {
  PHASE506_KYOTO_URUSHI_UNOHANA_ID,
  PHASE506_KYOTO_URUSHI_UNOHANA_SLUG,
  PHASE506_WANCHER_BRAND_ID,
  phase506WancherKyotoUrushiUnohanaPacks,
} from "../../scripts/data/phase506-wancher-kyoto-urushi-unohana";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 506 publishes the sourced Wancher Kyoto Urushi Unohana SKU on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase506-wancher-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase506Options = {
    workspaceRoot: ROOT,
    reviewer: "phase506-wancher-kyoto-urushi-unohana-test",
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
    const pack = phase506WancherKyotoUrushiUnohanaPacks[0];
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 3_800);
    const bodyStart = markdown.indexOf("## body_md");
    const sourcesStart = markdown.indexOf("\n## 来源\n", bodyStart);
    assert.ok(
      bodyStart >= 0 &&
        sourcesStart > bodyStart &&
        markdown.slice(bodyStart + "## body_md".length, sourcesStart).length >=
          2_400,
    );
    assert.match(markdown, /## model_specs/);
    assert.match(markdown, /## 来源/);
    assert.doesNotMatch(markdown, /数据库|made_by|canonical/i);
    const localPath = pack.media[0]?.localPath;
    assert.equal(
      localPath,
      "/images/library/site-original/phase506/wancher/kyoto-urushi-unohana.svg",
    );
    assert.ok(localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", localPath.replace(/^\//, "")),
      "utf8",
    );
    assert.match(svg, /非产品照片/);
    assert.match(svg, /Unohana/);
    assert.match(svg, /JoWo/);

    await assert.rejects(
      applyPhase506WancherKyotoUrushiUnohana(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: options.env?.NODE_ENV ?? "test",
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        },
      }),
      /inherited remote database selection/,
    );

    const first = await applyPhase506WancherKyotoUrushiUnohana(client, options);
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE506_KYOTO_URUSHI_UNOHANA_ID, "published"]],
    );

    const publicRow = (
      await client.execute({
        sql: "SELECT id,type,slug,name,summary,body_md FROM public_entities WHERE id=?",
        args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [publicRow?.id, publicRow?.type, publicRow?.slug],
      [
        PHASE506_KYOTO_URUSHI_UNOHANA_ID,
        "pen",
        PHASE506_KYOTO_URUSHI_UNOHANA_SLUG,
      ],
    );
    assert.ok(String(publicRow?.summary ?? "").length >= 60);
    assert.ok(String(publicRow?.body_md ?? "").length >= 2_400);
    assert.match(String(publicRow?.body_md ?? ""), /Kasane no Irome|重ね/);
    assert.match(String(publicRow?.body_md ?? ""), /Unohana|卯之花/);
    assert.match(String(publicRow?.body_md ?? ""), /ebonite feed|硬橡胶 feed/);
    assert.doesNotMatch(
      String(publicRow?.body_md ?? ""),
      /数据库|made_by|canonical/i,
    );

    const publication = (
      await client.execute({
        sql: "SELECT status,reviewed_content_revision,content_revision,reviewed_contract_version,approved_content_hash FROM entity_publications WHERE entity_id=?",
        args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID],
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
          args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID, PHASE506_WANCHER_BRAND_ID],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE506_WANCHER_BRAND_ID, PHASE506_KYOTO_URUSHI_UNOHANA_ID],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
          args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID],
        })
      ).rows[0]?.n,
      11,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM model_specs WHERE entity_id=?",
          args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
          args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID, localPath],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM source_items WHERE url=? AND review_status='approved'",
          args: ["https://www.wancherpen.com/products/kyoto-urushi-unohana"],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM source_items WHERE source_tier='professional_secondary' AND url=?",
          args: [
            "https://kyoto-museums.city.kyoto.lg.jp/en/feature-column/lacquer/",
          ],
        })
      ).rows[0]?.n,
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE506_KYOTO_URUSHI_UNOHANA_ID,
    );
    assert.equal(String(publication?.approved_content_hash), hash);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );

    const replay = await applyPhase506WancherKyotoUrushiUnohana(
      client,
      options,
    );
    assert.deepEqual(
      replay.entities.map((item) => item.outcome),
      ["noop"],
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
