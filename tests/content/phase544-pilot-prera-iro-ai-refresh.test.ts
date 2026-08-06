import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase544Options,
  applyPhase544PilotPreraIroAiRefresh,
} from "../../scripts/apply-phase544-pilot-prera-iro-ai-refresh";
import {
  PHASE544_PILOT_ID,
  PHASE544_PRERA_ID,
  phase544PilotPreraIroAiRefreshPack,
} from "../../scripts/data/phase544-pilot-prera-iro-ai-refresh";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

const IRO_AI_SKUS = [
  "P-FPR-1-TB-F",
  "P-FPR-1-TB-M",
  "P-FPR-1-TB-CM",
  "P-FPR-1-TR-F",
  "P-FPR-1-TR-M",
  "P-FPR-1-TR-CM",
  "P-FPR-1-TP-F",
  "P-FPR-1-TP-M",
  "P-FPR-1-TP-CM",
  "P-FPR-1-TO-F",
  "P-FPR-1-TO-M",
  "P-FPR-1-TO-CM",
  "P-FPR-1-TLG-F",
  "P-FPR-1-TLG-M",
  "P-FPR-1-TLG-CM",
  "P-FPR-1-TLB-F",
  "P-FPR-1-TLB-M",
  "P-FPR-1-TLB-CM",
  "P-FPR-1-TL-F",
  "P-FPR-1-TL-M",
  "P-FPR-1-TL-CM",
];

test("Phase 544 publishes Prera Iro-ai SKU coverage on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase544-prera-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase544Options = {
    workspaceRoot: ROOT,
    reviewer: "phase544-pilot-prera-iro-ai-test",
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
    const markdown = fs.readFileSync(
      path.join(ROOT, phase544PilotPreraIroAiRefreshPack.markdownFile),
      "utf8",
    );
    const summary =
      markdown
        .match(/## summary\n\n([\s\S]*?)\n\n## model_specs/)?.[1]
        ?.trim() ?? "";
    const bodyStart = markdown.indexOf("## body_md");
    const sourcesStart = markdown.indexOf("\n## 来源\n", bodyStart);
    assert.ok(
      Array.from(summary).length >= 60 && Array.from(summary).length <= 180,
    );
    assert.ok(Array.from(markdown).length >= 3_500);
    assert.ok(bodyStart >= 0 && sourcesStart > bodyStart);
    assert.ok(
      Array.from(markdown.slice(bodyStart + "## body_md".length, sourcesStart))
        .length >= 2_600,
    );
    for (const marker of [
      "P-FPR-1-TB-F",
      "P-FPR-1-TL-CM",
      "21 个",
      "CON-40",
      "13.4 mm",
      "120.4 mm",
      "15.4 g",
    ]) {
      assert.match(
        markdown,
        new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        marker,
      );
    }
    assert.doesNotMatch(markdown, /数据库|made_by|canonical/i);
    const svgPath = phase544PilotPreraIroAiRefreshPack.media[0]?.localPath;
    assert.ok(svgPath);
    assert.match(
      fs.readFileSync(
        path.join(ROOT, "public", svgPath.replace(/^\//, "")),
        "utf8",
      ),
      /本站原创事实示意图|非产品照片/,
    );

    await assert.rejects(
      applyPhase544PilotPreraIroAiRefresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        },
      }),
      /inherited remote database selection/,
    );
    const first = await applyPhase544PilotPreraIroAiRefresh(client, options);
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE544_PRERA_ID, "published"]],
    );

    const publicRow = (
      await client.execute({
        sql: "SELECT id,type,slug,summary,body_md FROM public_entities WHERE id=?",
        args: [PHASE544_PRERA_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [publicRow?.id, publicRow?.type, publicRow?.slug],
      [PHASE544_PRERA_ID, "pen", "pilot-prera"],
    );
    assert.match(String(publicRow?.body_md ?? ""), /P-FPR-1-TB-F/);
    assert.match(String(publicRow?.body_md ?? ""), /P-FPR-1-TL-CM/);
    assert.match(String(publicRow?.body_md ?? ""), /透明浅绿|透明蓝/);
    assert.doesNotMatch(
      String(publicRow?.body_md ?? ""),
      /数据库|made_by|canonical/i,
    );

    const variantRows = (
      await client.execute({
        sql: "SELECT id,variant_name,variant_kind,parent_variant_id,product_code,market FROM model_variants WHERE model_entity_id=? ORDER BY id",
        args: [PHASE544_PRERA_ID],
      })
    ).rows;
    assert.equal(
      variantRows.length,
      phase544PilotPreraIroAiRefreshPack.variants?.length,
    );
    const productCodes = new Set(
      variantRows.map((row) => String(row.product_code ?? "")).filter(Boolean),
    );
    for (const sku of IRO_AI_SKUS) assert.ok(productCodes.has(sku), sku);
    const iroGroup = variantRows.find(
      (row) => String(row.product_code) === "P-FPR-1-TB",
    );
    assert.equal(String(iroGroup?.variant_kind), "edition_group");
    assert.equal(String(iroGroup?.market), "Japan");
    const tbSku = variantRows.find(
      (row) => String(row.product_code) === "P-FPR-1-TB-CM",
    );
    assert.equal(String(tbSku?.variant_kind), "market_sku");
    assert.equal(String(tbSku?.parent_variant_id), String(iroGroup?.id));

    const maker = (
      await client.execute({
        sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        args: [PHASE544_PRERA_ID, PHASE544_PILOT_ID],
      })
    ).rows[0];
    assert.equal(Number(maker?.n), 1);
    const reverse = (
      await client.execute({
        sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        args: [PHASE544_PILOT_ID, PHASE544_PRERA_ID],
      })
    ).rows[0];
    assert.equal(Number(reverse?.n), 1);

    const publication = (
      await client.execute({
        sql: "SELECT status,reviewed_content_revision,content_revision,reviewed_contract_version,approved_content_hash FROM entity_publications WHERE entity_id=?",
        args: [PHASE544_PRERA_ID],
      })
    ).rows[0];
    assert.equal(String(publication?.status), "published");
    assert.equal(Number(publication?.reviewed_contract_version), 3);
    assert.equal(
      Number(publication?.reviewed_content_revision),
      Number(publication?.content_revision),
    );
    const hash = await computePublicationContentHash(client, PHASE544_PRERA_ID);
    assert.equal(String(publication?.approved_content_hash), hash);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE544_PRERA_ID, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [PHASE544_PRERA_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM source_items WHERE url=? AND retrieved_at=? AND review_status='approved'",
            args: [
              "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100004795&volumeName=00004",
              "2026-08-06",
            ],
          })
        ).rows[0]?.n,
      ),
      1,
    );

    const replay = await applyPhase544PilotPreraIroAiRefresh(client, options);
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
