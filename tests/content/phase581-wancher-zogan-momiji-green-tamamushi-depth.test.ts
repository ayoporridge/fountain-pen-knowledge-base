import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase581Options,
  applyPhase581WancherZoganMomijiGreenTamamushi,
} from "../../scripts/apply-phase581-wancher-zogan-momiji-green-tamamushi-depth";
import {
  PHASE581_CANONICAL_SLUG,
  PHASE581_DUPLICATE_ID,
  PHASE581_DUPLICATE_SLUG,
  PHASE581_TARGET_ID,
  PHASE581_WANCHER_BRAND_ID,
  phase581WancherZoganMomijiGreenTamamushiPacks,
} from "../../scripts/data/phase581-wancher-zogan-momiji-green-tamamushi-depth";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const OFFICIAL_PHOTO_URL =
  "https://cdn.shopify.com/s/files/1/0003/8371/3324/files/zogan-Momoji-tamamushi-green.png?v=1783407788";

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

test("Phase 581 deepens the canonical Green Tamamushi and retires its duplicate route", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase581-wancher-momiji-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase581Options = {
    workspaceRoot: ROOT,
    reviewer: "phase581-wancher-zogan-momiji-green-tamamushi-test",
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
    const pack = phase581WancherZoganMomijiGreenTamamushiPacks[0];
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 7_000);
    assert.match(markdown, /## body_md/);
    assert.match(markdown, /## model_specs/);
    assert.match(markdown, /## 来源/);
    assert.ok(pack.sources.length >= 13);
    assert.ok(pack.claims.length >= 30);
    assert.ok((pack.variants?.length ?? 0) >= 10);
    assert.equal(
      pack.media.filter((media) => media.usageStatus === "primary").length,
      1,
    );
    assert.equal(
      pack.media.filter((media) => media.usageStatus === "gallery").length,
      1,
    );
    for (const phrase of [
      "9322088038615",
      "zogan-momiji-green-tamamushi",
      "WF-ZOUR-DREAM-MOTAGR",
      "WF-ZOUR-DREAM-MOTAGR-SV",
      "ABS",
      "Titanium",
      "Zogan",
      "Tamamushi-nuri",
      "JoWo",
      "Keiryu",
      "Kodachi",
      "European International Standard",
      "US$600",
      "维护",
      "二手",
    ]) {
      assert.match(
        markdown,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }
    assert.doesNotMatch(markdown, /数据库|made_by|canonical/i);
    const primary = pack.media.find((media) => media.usageStatus === "primary");
    assert.ok(primary?.localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", primary.localPath.replace(/^\//, "")),
      "utf8",
    );
    assert.match(svg, /非产品照片/);
    assert.match(svg, /本站原创事实示意图/);
    assert.match(svg, /Momiji|Tamamushi/);
    const officialPhoto = pack.media.find(
      (media) => media.usageStatus === "gallery",
    );
    assert.equal(officialPhoto?.imageUrl, OFFICIAL_PHOTO_URL);
    assert.equal(
      officialPhoto?.sourceUrl,
      "https://www.wancherpen.com/products/zogan-momiji-green-tamamushi",
    );

    const beforeCanonical = await rows(
      client,
      "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
      [PHASE581_TARGET_ID, PHASE581_CANONICAL_SLUG],
    );
    assert.deepEqual(
      beforeCanonical.map((row) => [row.id, row.type, row.slug]),
      [[PHASE581_TARGET_ID, "pen", PHASE581_CANONICAL_SLUG]],
    );
    const beforeDuplicate = await rows(
      client,
      "SELECT id,type,slug FROM entities WHERE id=? OR slug=? ORDER BY id",
      [PHASE581_DUPLICATE_ID, PHASE581_DUPLICATE_SLUG],
    );
    assert.deepEqual(
      beforeDuplicate.map((row) => [row.id, row.type, row.slug]),
      [[PHASE581_DUPLICATE_ID, "pen", PHASE581_DUPLICATE_SLUG]],
    );
    await assert.rejects(
      applyPhase581WancherZoganMomijiGreenTamamushi(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );

    const first = await applyPhase581WancherZoganMomijiGreenTamamushi(
      client,
      options,
    );
    assert.equal(first.retiredDuplicate.entityId, PHASE581_DUPLICATE_ID);
    assert.equal(first.retiredDuplicate.outcome, "retired");
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [[PHASE581_TARGET_ID, "published"]],
    );

    const canonical = (
      await rows(
        client,
        `SELECT e.type,e.slug,e.name,e.source,e.body_md,p.status,p.content_revision,
                p.reviewed_content_revision,p.reviewed_contract_version,
                r.publishable,r.blocker_count,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
         FROM entities e JOIN entity_publications p ON p.entity_id=e.id
         LEFT JOIN public_entity_readiness r ON r.entity_id=e.id AND r.contract_version=3
         LEFT JOIN public_entities public ON public.id=e.id WHERE e.id=?`,
        [PHASE581_TARGET_ID],
      )
    )[0];
    assert.equal(canonical?.type, "pen");
    assert.equal(canonical?.slug, PHASE581_CANONICAL_SLUG);
    assert.equal(canonical?.status, "published");
    assert.match(
      String(canonical?.source),
      /^curated-content:phase581-wancher-zogan-momiji-green-tamamushi-depth-v1:/,
    );
    assert.equal(Number(canonical?.reviewed_contract_version), 3);
    assert.equal(
      Number(canonical?.reviewed_content_revision),
      Number(canonical?.content_revision),
    );
    assert.equal(Number(canonical?.publishable), 1);
    assert.equal(Number(canonical?.blocker_count), 0);
    assert.equal(Number(canonical?.is_public), 1);
    assert.ok(Array.from(String(canonical?.body_md ?? "")).length >= 5_500);
    for (const phrase of [
      "9322088038615",
      "WF-ZOUR-DREAM-MOTAGR",
      "US$600",
      "ABS",
      "Titanium",
      "Zogan",
      "维护",
      "二手",
    ]) {
      assert.match(
        String(canonical?.body_md ?? ""),
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }
    assert.doesNotMatch(
      String(canonical?.body_md ?? ""),
      /数据库|made_by|canonical/i,
    );

    const retired = (
      await rows(
        client,
        `SELECT e.type,e.slug,p.status,p.blockers_json,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
         FROM entities e JOIN entity_publications p ON p.entity_id=e.id
         LEFT JOIN public_entities public ON public.id=e.id WHERE e.id=?`,
        [PHASE581_DUPLICATE_ID],
      )
    )[0];
    assert.equal(retired?.type, "pen");
    assert.equal(retired?.slug, PHASE581_DUPLICATE_SLUG);
    assert.equal(retired?.status, "retired");
    assert.equal(retired?.blockers_json, '["canonical_redirect"]');
    assert.equal(Number(retired?.is_public), 0);
    assert.deepEqual(
      await rows(
        client,
        "SELECT source_path,target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
        [`/pen/${PHASE581_DUPLICATE_SLUG}`],
      ),
      [
        {
          source_path: `/pen/${PHASE581_DUPLICATE_SLUG}`,
          target_path: `/pen/${PHASE581_CANONICAL_SLUG}`,
          redirect_kind: "permanent",
        },
      ],
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entity_lineage WHERE source_entity_id=? AND target_entity_id=? AND lineage_kind='retire'",
            [PHASE581_DUPLICATE_ID, PHASE581_TARGET_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND link_type='made_by'",
            [PHASE581_DUPLICATE_ID],
          )
        )[0]?.n,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            [PHASE581_WANCHER_BRAND_ID, PHASE581_DUPLICATE_ID],
          )
        )[0]?.n,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            [PHASE581_TARGET_ID, PHASE581_WANCHER_BRAND_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            [PHASE581_WANCHER_BRAND_ID, PHASE581_TARGET_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            [PHASE581_TARGET_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND image_url=? AND usage_status='gallery'",
            [PHASE581_TARGET_ID, OFFICIAL_PHOTO_URL],
          )
        )[0]?.n,
      ),
      1,
    );
    assert.ok(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM source_items WHERE url=? AND review_status='approved'",
            [
              "https://www.wancherpen.com/products/zogan-momiji-green-tamamushi.json",
            ],
          )
        )[0]?.n,
      ) >= 2,
    );

    const brand = (
      await rows(
        client,
        "SELECT status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entity_publications p LEFT JOIN public_entities public ON public.id=p.entity_id WHERE p.entity_id=?",
        [PHASE581_WANCHER_BRAND_ID],
      )
    )[0];
    assert.equal(brand?.status, "published");
    assert.equal(Number(brand?.is_public), 1);

    const hash = await computePublicationContentHash(
      client,
      PHASE581_TARGET_ID,
    );
    const publication = (
      await rows(
        client,
        "SELECT approved_content_hash FROM entity_publications WHERE entity_id=?",
        [PHASE581_TARGET_ID],
      )
    )[0];
    assert.equal(String(publication?.approved_content_hash), hash);
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          [PHASE581_TARGET_ID, hash],
        )
      ).map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );

    const replay = await applyPhase581WancherZoganMomijiGreenTamamushi(
      client,
      options,
    );
    assert.equal(replay.retiredDuplicate.outcome, "noop");
    assert.equal(replay.entities[0]?.outcome, "noop");
    assert.equal(
      replay.entities[0]?.contentHash,
      first.entities[0]?.contentHash,
    );
    assert.equal(sha256(REAL), protectedHash);
    assertCatalogSnapshotUnchanged(
      protectedSnapshot,
      snapshotCatalogFiles(REAL),
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
