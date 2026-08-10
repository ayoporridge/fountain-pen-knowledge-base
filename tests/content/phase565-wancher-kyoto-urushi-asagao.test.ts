import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase565Options,
  applyPhase565WancherKyotoUrushiAsagao,
  PHASE565_TARGET_ID,
} from "../../scripts/apply-phase565-wancher-kyoto-urushi-asagao";
import {
  PHASE519_WANCHER_BRAND_ID,
  phase519WancherDreamPenPacks,
} from "../../scripts/data/phase519-wancher-dream-pen-new-products";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

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

test("Phase 565 deepens Wancher Kyoto Urushi Kasane-iro Asagao on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase565-wancher-asagao-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    {
      expectedSourceSnapshot: protectedSnapshot,
    },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase565Options = {
    workspaceRoot: ROOT,
    reviewer: "phase565-wancher-kyoto-urushi-asagao-test",
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
    const pack = phase519WancherDreamPenPacks.find(
      (item) => item.entityId === PHASE565_TARGET_ID,
    );
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 4_000);
    assert.match(markdown, /## body_md/);
    assert.match(markdown, /## model_specs/);
    assert.match(markdown, /## 来源/);
    assert.ok(pack.sources.length >= 7);
    assert.ok((pack.variants?.length ?? 0) >= 12);
    for (const phrase of [
      "9324911526103",
      "WF-KYUR-DR-KAS-LB",
      "WF-KYUR-DR-KAS-LB-CHCL",
      "WF-KYUR-DR-KAS-LB-GDCL",
      "Kasane no Irome",
      "Ebonite",
      "Urushi",
      "JoWo",
      "Wancher 18K",
      "Keiryu",
      "Shogun 18K",
      "No Clip",
      "Chrome Clip",
      "Gold Clip",
      "converter",
      "购买前",
      "保养",
    ])
      assert.match(
        markdown,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    assert.doesNotMatch(markdown, /数据库|made_by|canonical/i);
    const media = pack.media[0];
    assert.ok(media?.localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", media.localPath.replace(/^\//, "")),
      "utf8",
    );
    assert.match(svg, /非产品照片/);
    assert.match(svg, /本站原创事实示意图/);
    assert.match(svg, /Asagao/);
    const existing = await rows(
      client,
      "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
      [PHASE565_TARGET_ID, pack.expectedSlug],
    );
    assert.deepEqual(
      existing.map((row) => [row.id, row.type, row.slug, row.name]),
      [[PHASE565_TARGET_ID, "pen", pack.expectedSlug, pack.canonicalName]],
    );
    await assert.rejects(
      applyPhase565WancherKyotoUrushiAsagao(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );

    const first = await applyPhase565WancherKyotoUrushiAsagao(client, options);
    assert.equal(first.entityId, PHASE565_TARGET_ID);
    assert.equal(first.outcome, "published");
    const state = (
      await rows(
        client,
        `SELECT e.type,e.slug,e.name,e.body_md,p.status,p.content_revision,
                p.reviewed_content_revision,p.reviewed_contract_version,
                r.publishable,r.blocker_count,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
         FROM entities e JOIN entity_publications p ON p.entity_id=e.id
         LEFT JOIN public_entity_readiness r ON r.entity_id=e.id AND r.contract_version=3
         LEFT JOIN public_entities public ON public.id=e.id WHERE e.id=?`,
        [PHASE565_TARGET_ID],
      )
    )[0];
    assert.equal(state?.type, "pen");
    assert.equal(state?.slug, pack.expectedSlug);
    assert.equal(state?.status, "published");
    assert.equal(Number(state?.reviewed_contract_version), 3);
    assert.equal(
      Number(state?.reviewed_content_revision),
      Number(state?.content_revision),
    );
    assert.equal(Number(state?.publishable), 1);
    assert.equal(Number(state?.blocker_count), 0);
    assert.equal(Number(state?.is_public), 1);
    const body = String(state?.body_md ?? "");
    assert.ok(Array.from(body).length >= 3_800);
    for (const phrase of [
      "9324911526103",
      "WF-KYUR-DR-KAS-LB",
      "Kasane no Irome",
      "Ebonite",
      "Urushi",
      "JoWo",
      "Wancher 18K",
      "Keiryu",
      "Shogun 18K",
      "购买前",
      "保养",
    ]) {
      assert.match(
        body,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }
    assert.doesNotMatch(body, /数据库|made_by|canonical/i);
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id=?",
            [PHASE565_TARGET_ID, PHASE519_WANCHER_BRAND_ID],
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
            [PHASE519_WANCHER_BRAND_ID, PHASE565_TARGET_ID],
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
            "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            [PHASE565_TARGET_ID],
          )
        )[0]?.n,
      ),
      pack.variants?.length ?? 0,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM model_specs WHERE entity_id=?",
            [PHASE565_TARGET_ID],
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
            [PHASE565_TARGET_ID],
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
            "SELECT count(*) AS n FROM source_items WHERE url=? AND review_status='approved'",
            ["https://www.wancherpen.com/products/kyoto-urushi-asagao.json"],
          )
        )[0]?.n,
      ),
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE565_TARGET_ID,
    );
    const publication = (
      await rows(
        client,
        "SELECT approved_content_hash FROM entity_publications WHERE entity_id=?",
        [PHASE565_TARGET_ID],
      )
    )[0];
    assert.equal(String(publication?.approved_content_hash), hash);
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          [PHASE565_TARGET_ID, hash],
        )
      ).map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    const replay = await applyPhase565WancherKyotoUrushiAsagao(client, options);
    assert.equal(replay.outcome, "noop");
    assert.equal(replay.contentHash, first.contentHash);
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
