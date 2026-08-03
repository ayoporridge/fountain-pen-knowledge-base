import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase420Options,
  applyPhase420PelikanM815Refresh,
  PHASE420_M815_ID,
  PHASE420_M815_NAME,
  PHASE420_M815_SLUG,
  PHASE420_PELIKAN_BRAND_ID,
} from "../../scripts/apply-phase420-pelikan-m815-refresh";
import { phase420PelikanM815RefreshPacks } from "../../scripts/data/phase420-pelikan-m815-refresh";
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

test("Phase 420 deepens the existing Pelikan Souverän M815 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const protectedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase420-pelikan-protected-")),
  );
  const protectedCopy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(protectedRoot, "protected.db"),
    protectedRoot,
    { expectedSourceSnapshot: realSnapshot },
  );
  const snapshot = protectedCopy.destinationSnapshot;
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase420-pelikan-owned-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    protectedCopy.destinationPath,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase420Options = {
    workspaceRoot: ROOT,
    reviewer: "phase420-pelikan-m815-test",
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
    const definition = phase420PelikanM815RefreshPacks[0];
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
    for (const marker of [/Pelikan Souverän M815/, /非产品照片/, /不按比例/])
      assert.match(svg, marker);

    await assert.rejects(
      () =>
        applyPhase420PelikanM815Refresh(client, { ...options, reviewer: " " }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      () =>
        applyPhase420PelikanM815Refresh(client, {
          ...options,
          env: {
            ...options.env,
            NODE_ENV: options.env?.NODE_ENV ?? "test",
            TURSO_DATABASE_URL: "https://remote.invalid/catalog",
          },
        }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase420PelikanM815Refresh(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published"],
    );
    const page = (
      await rows(
        client,
        "SELECT type,slug,name,body_md FROM public_entities WHERE id=?",
        [PHASE420_M815_ID],
      )
    )[0];
    assert.equal(page?.type, "pen");
    assert.equal(page?.slug, PHASE420_M815_SLUG);
    assert.equal(page?.name, PHASE420_M815_NAME);
    const body = String(page?.body_md ?? "");
    assert.ok(Array.from(body).length >= 8_000);
    for (const pattern of [
      /M815/,
      /2018/,
      /2025/,
      /Black/,
      /Blue/,
      /Wall Street/,
      /M805/,
      /M800/,
      /黄铜|brass/,
      /镀钯|palladium/,
      /18K|18 ct|750/,
      /EF\/F\/M\/B/,
      /差动活塞/,
      /1\.35/,
      /14\.1|141/,
      /36|37\.13/,
      /38|37\.1/,
      /清洗|清水|冷水/,
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
        [PHASE420_M815_ID],
      )
    )[0];
    assert.ok(Number(referenceCounts?.total) >= 15);
    assert.ok(Number(referenceCounts?.groups) >= 12);
    const spec = (
      await rows(
        client,
        "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
        [PHASE420_M815_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE420_PELIKAN_BRAND_ID);
    assert.match(String(spec?.nib), /18.*(?:ct|K|750)/);
    assert.match(String(spec?.fill_system), /活塞/);
    assert.match(String(spec?.material), /树脂|条纹|黄铜|镀钯/);
    assert.match(String(spec?.dimensions), /141|14\.1|13/);
    assert.match(String(spec?.weight), /38|36|37/);
    assert.match(String(spec?.status), /M815|Special Edition/);

    const variants = await rows(
      client,
      "SELECT variant_name,variant_kind,parent_variant_id FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE420_M815_ID],
    );
    assert.ok(variants.length >= 10);
    assert.ok(
      variants.filter((row) => String(row.variant_kind) === "material")
        .length >= 2,
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
        [PHASE420_M815_ID],
      ),
      [{ blocker_count: 0, blockers_json: "[]", publishable: 1 }],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE420_M815_ID, PHASE420_PELIKAN_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE420_PELIKAN_BRAND_ID, PHASE420_M815_ID],
      ),
      1,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT status FROM entity_publications WHERE entity_id=?",
          [PHASE420_M815_ID],
        )
      )[0]?.status,
      "published",
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT status FROM entity_publications WHERE entity_id=?",
          [PHASE420_PELIKAN_BRAND_ID],
        )
      )[0]?.status,
      "published",
    );
    const hash = await computePublicationContentHash(client, PHASE420_M815_ID);
    const publication = (
      await rows(
        client,
        "SELECT status,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version FROM entity_publications WHERE entity_id=?",
        [PHASE420_M815_ID],
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
        [PHASE420_M815_ID, hash],
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
      [PHASE420_M815_ID],
    );
    const replay = await applyPhase420PelikanM815Refresh(client, options);
    assert.deepEqual(replay.entities, [
      { entityId: PHASE420_M815_ID, outcome: "noop", contentHash: hash },
    ]);
    const afterReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE420_M815_ID],
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
