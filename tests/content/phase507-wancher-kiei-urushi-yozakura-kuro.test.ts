import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase507Options,
  applyPhase507WancherKieiUrushiYozakuraKuro,
} from "../../scripts/apply-phase507-wancher-kiei-urushi-yozakura-kuro";
import {
  PHASE507_KIEI_YOZAKURA_KURO_ID,
  PHASE507_KIEI_YOZAKURA_KURO_SLUG,
  PHASE507_WANCHER_BRAND_ID,
  phase507WancherKieiUrushiYozakuraKuroPacks,
} from "../../scripts/data/phase507-wancher-kiei-urushi-yozakura-kuro";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 507 publishes the sourced Wancher Kiei Yozakura Kuro SKU on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase507-wancher-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase507Options = {
    workspaceRoot: ROOT,
    reviewer: "phase507-wancher-kiei-yozakura-kuro-test",
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
    const pack = phase507WancherKieiUrushiYozakuraKuroPacks[0];
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 4_000);
    const bodyStart = markdown.indexOf("## body_md");
    const sourcesStart = markdown.indexOf("\n## 来源\n", bodyStart);
    assert.ok(
      bodyStart >= 0 &&
        sourcesStart > bodyStart &&
        markdown.slice(bodyStart + "## body_md".length, sourcesStart).length >=
          2_500,
    );
    assert.match(markdown, /## model_specs/);
    assert.match(markdown, /## 来源/);
    assert.doesNotMatch(markdown, /数据库|made_by|canonical/i);
    const localPath = pack.media[0]?.localPath;
    assert.equal(
      localPath,
      "/images/library/site-original/phase507/wancher/kiei-yozakura-kuro.svg",
    );
    assert.ok(localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", localPath.replace(/^\//, "")),
      "utf8",
    );
    assert.match(svg, /非产品照片/);
    assert.match(svg, /Sakura/);
    assert.match(svg, /JoWo/);

    await assert.rejects(
      applyPhase507WancherKieiUrushiYozakuraKuro(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: options.env?.NODE_ENV ?? "test",
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        },
      }),
      /inherited remote database selection/,
    );
    const first = await applyPhase507WancherKieiUrushiYozakuraKuro(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE507_KIEI_YOZAKURA_KURO_ID, "published"]],
    );
    const publicRow = (
      await client.execute({
        sql: "SELECT id,type,slug,name,summary,body_md FROM public_entities WHERE id=?",
        args: [PHASE507_KIEI_YOZAKURA_KURO_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [publicRow?.id, publicRow?.type, publicRow?.slug],
      [PHASE507_KIEI_YOZAKURA_KURO_ID, "pen", PHASE507_KIEI_YOZAKURA_KURO_SLUG],
    );
    assert.ok(String(publicRow?.summary ?? "").length >= 60);
    assert.ok(String(publicRow?.body_md ?? "").length >= 2_500);
    assert.match(String(publicRow?.body_md ?? ""), /Yozakura|夜樱/);
    assert.match(
      String(publicRow?.body_md ?? ""),
      /真实樱花花瓣|Sakura petals/,
    );
    assert.match(String(publicRow?.body_md ?? ""), /JoWo #6|JoWo/);
    assert.doesNotMatch(
      String(publicRow?.body_md ?? ""),
      /数据库|made_by|canonical/i,
    );
    const publication = (
      await client.execute({
        sql: "SELECT status,reviewed_content_revision,content_revision,reviewed_contract_version,approved_content_hash FROM entity_publications WHERE entity_id=?",
        args: [PHASE507_KIEI_YOZAKURA_KURO_ID],
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
          args: [PHASE507_KIEI_YOZAKURA_KURO_ID],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE507_KIEI_YOZAKURA_KURO_ID, PHASE507_WANCHER_BRAND_ID],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE507_WANCHER_BRAND_ID, PHASE507_KIEI_YOZAKURA_KURO_ID],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
          args: [PHASE507_KIEI_YOZAKURA_KURO_ID],
        })
      ).rows[0]?.n,
      7,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM model_specs WHERE entity_id=?",
          args: [PHASE507_KIEI_YOZAKURA_KURO_ID],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
          args: [PHASE507_KIEI_YOZAKURA_KURO_ID, localPath],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM source_items WHERE url=? AND review_status='approved'",
          args: [
            "https://www.wancherpen.com/products/kiei-urushi-yozakura-kuro",
          ],
        })
      ).rows[0]?.n,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS n FROM source_items WHERE source_tier='professional_secondary' AND url IN (?,?)",
          args: [
            "https://kyoto-museums.city.kyoto.lg.jp/en/feature-column/lacquer/",
            "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/shikko_20160830.html",
          ],
        })
      ).rows[0]?.n,
      2,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE507_KIEI_YOZAKURA_KURO_ID,
    );
    assert.equal(String(publication?.approved_content_hash), hash);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE507_KIEI_YOZAKURA_KURO_ID, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    const replay = await applyPhase507WancherKieiUrushiYozakuraKuro(
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
