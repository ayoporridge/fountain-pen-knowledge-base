import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase419Options,
  applyPhase419PelikanM300Refresh,
  PHASE419_M300_ID,
  PHASE419_M300_NAME,
  PHASE419_M300_SLUG,
  PHASE419_PELIKAN_BRAND_ID,
} from "../../scripts/apply-phase419-pelikan-m300-refresh";
import { phase419PelikanM300RefreshPacks } from "../../scripts/data/phase419-pelikan-m300-refresh";
import { loadCuratedEntityPack } from "../../scripts/lib/curated-content-pack";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function rows(
  client: Client,
  sql: string,
  args: (string | number | null)[] = [],
) {
  return (await client.execute({ sql, args })).rows.map((row) =>
    Object.fromEntries(Object.entries(row)),
  );
}

async function scalar(
  client: Client,
  sql: string,
  args: (string | number | null)[] = [],
) {
  const row = (await rows(client, sql, args))[0];
  return Number(row?.value ?? 0);
}

test("Phase 419 deepens the existing Pelikan Souverän M300 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const protectedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase419-pelikan-protected-")),
  );
  const protectedCopy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(protectedRoot, "protected.db"),
    protectedRoot,
    { expectedSourceSnapshot: realSnapshot },
  );
  const snapshot = protectedCopy.destinationSnapshot;
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase419-pelikan-owned-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    protectedCopy.destinationPath,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase419Options = {
    workspaceRoot: ROOT,
    reviewer: "phase419-pelikan-m300-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: protectedCopy.destinationPath,
    protectedCatalogSnapshot: snapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
  try {
    await migrateDatabase(client);
    const definition = phase419PelikanM300RefreshPacks[0];
    assert.ok(definition);
    const pack = loadCuratedEntityPack(ROOT, definition);
    assert.ok(
      Array.from(pack.summary).length >= 60 &&
        Array.from(pack.summary).length <= 160,
    );
    assert.ok(Array.from(pack.bodyMd).length >= 8_000);
    assert.ok(pack.sources.length >= 15);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >=
        12,
    );
    assert.ok((pack.variants ?? []).length >= 10);
    assert.equal(
      pack.media.filter((media) => media.usageStatus === "primary").length,
      1,
    );
    const mediaPath = pack.media.find(
      (media) => media.usageStatus === "primary",
    )?.localPath;
    assert.ok(mediaPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", mediaPath.replace(/^\//, "")),
      "utf8",
    );
    for (const marker of [
      /Pelikan Souverän M300/,
      /非产品照片/,
      /非品牌 Logo/,
      /非比例图/,
      /非颜色校样/,
    ])
      assert.match(svg, marker);

    await assert.rejects(
      () =>
        applyPhase419PelikanM300Refresh(client, { ...options, reviewer: " " }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      () =>
        applyPhase419PelikanM300Refresh(client, {
          ...options,
          env: {
            ...options.env,
            NODE_ENV: options.env?.NODE_ENV ?? "test",
            TURSO_DATABASE_URL: "https://remote.invalid/catalog",
          },
        }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase419PelikanM300Refresh(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published"],
    );
    const page = (
      await rows(
        client,
        "SELECT type,slug,name,body_md FROM public_entities WHERE id=?",
        [PHASE419_M300_ID],
      )
    )[0];
    assert.equal(page?.type, "pen");
    assert.equal(page?.slug, PHASE419_M300_SLUG);
    assert.equal(page?.name, PHASE419_M300_NAME);
    const body = String(page?.body_md ?? "");
    assert.ok(Array.from(body).length >= 8_000);
    for (const pattern of [
      /M300/,
      /1998/,
      /2008/,
      /2020/,
      /Black/,
      /Green-striped/,
      /M320/,
      /M350/,
      /14K|14 ct|585/,
      /差动活塞/,
      /0\.65|0\.7/,
      /110/,
      /9\.9/,
      /11\.0|10\.7/,
      /清洗/,
      /维护/,
      /选购/,
      /非产品照片/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const referenceCounts = (
      await rows(
        client,
        "SELECT count(*) AS total,count(DISTINCT source.independence_group) AS groups FROM entity_references reference JOIN source_items source ON source.id=reference.source_item_id WHERE reference.entity_id=?",
        [PHASE419_M300_ID],
      )
    )[0];
    assert.ok(Number(referenceCounts?.total) >= 15);
    assert.ok(Number(referenceCounts?.groups) >= 12);
    const spec = (
      await rows(
        client,
        "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
        [PHASE419_M300_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE419_PELIKAN_BRAND_ID);
    assert.match(String(spec?.nib), /14.*(?:ct|C|585).*金尖/);
    assert.match(String(spec?.fill_system), /活塞/);
    assert.match(String(spec?.material), /树脂|条纹|镀金/);
    assert.match(String(spec?.dimensions), /110|9\.9/);
    assert.match(String(spec?.weight), /11|10\.7/);
    assert.match(String(spec?.status), /M300|M3xx/);

    const variants = await rows(
      client,
      "SELECT variant_name,variant_kind,parent_variant_id FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE419_M300_ID],
    );
    assert.ok(variants.length >= 10);
    assert.ok(
      variants.filter((row) => String(row.variant_kind) === "color").length >=
        2,
    );
    assert.ok(
      variants.filter((row) => String(row.variant_kind) === "nib").length >= 4,
    );
    assert.ok(
      variants.filter((row) => String(row.variant_kind) === "edition_group")
        .length >= 3,
    );
    assert.ok(
      variants.filter((row) => row.parent_variant_id !== null).length >= 7,
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT blocker_count,blockers_json,publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
        [PHASE419_M300_ID],
      ),
      [{ blocker_count: 0, blockers_json: "[]", publishable: 1 }],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE419_M300_ID, PHASE419_PELIKAN_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE419_PELIKAN_BRAND_ID, PHASE419_M300_ID],
      ),
      1,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT status FROM entity_publications WHERE entity_id=?",
          [PHASE419_M300_ID],
        )
      )[0]?.status,
      "published",
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT status FROM entity_publications WHERE entity_id=?",
          [PHASE419_PELIKAN_BRAND_ID],
        )
      )[0]?.status,
      "published",
    );
    const hash = await computePublicationContentHash(client, PHASE419_M300_ID);
    const publication = (
      await rows(
        client,
        "SELECT status,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version FROM entity_publications WHERE entity_id=?",
        [PHASE419_M300_ID],
      )
    )[0];
    assert.equal(publication?.approved_content_hash, hash);
    assert.equal(
      Number(publication?.content_revision),
      Number(publication?.reviewed_content_revision),
    );
    assert.equal(Number(publication?.reviewed_contract_version), 3);
    assert.deepEqual(
      await rows(
        client,
        "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        [PHASE419_M300_ID, hash],
      ),
      ["fact", "language", "media", "publication"].map((review_kind) => ({
        review_kind,
        status: "approved",
      })),
    );
    assert.deepEqual(await rows(client, "PRAGMA integrity_check"), [
      { integrity_check: "ok" },
    ]);

    const beforeReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE419_M300_ID],
    );
    const replay = await applyPhase419PelikanM300Refresh(client, options);
    assert.deepEqual(replay.entities, [
      { entityId: PHASE419_M300_ID, outcome: "noop", contentHash: hash },
    ]);
    const afterReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE419_M300_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
  } finally {
    client.close();
    try {
      assertCatalogSnapshotUnchanged(protectedCopy.destinationSnapshot);
      assert.deepEqual(snapshotCatalogFiles(REAL).main, realSnapshot.main);
      assert.deepEqual(snapshotCatalogFiles(REAL).wal, realSnapshot.wal);
    } finally {
      fs.rmSync(protectedRoot, { recursive: true, force: true });
      fs.rmSync(ownedRoot, { recursive: true, force: true });
    }
  }
});
