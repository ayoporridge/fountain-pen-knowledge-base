import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase566Options,
  applyPhase566WancherOitaUrushiKurozan,
  PHASE566_DUPLICATE_ID,
  PHASE566_TARGET_ID,
} from "../../scripts/apply-phase566-wancher-oita-urushi-kurozan";
import {
  PHASE521_WANCHER_BRAND_ID,
  phase521WancherJapaneseLacquerPacks,
} from "../../scripts/data/phase521-wancher-japanese-lacquer-siblings";
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

test("Phase 566 deepens Wancher Oita Urushi Kurozan on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase566-wancher-kurozan-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase566Options = {
    workspaceRoot: ROOT,
    reviewer: "phase566-wancher-oita-urushi-kurozan-test",
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
    const pack = phase521WancherJapaneseLacquerPacks.find(
      (item) => item.entityId === PHASE566_TARGET_ID,
    );
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 5_000);
    assert.match(markdown, /## body_md/);
    assert.match(markdown, /## model_specs/);
    assert.match(markdown, /## 来源/);
    assert.ok(pack.sources.length >= 7);
    assert.ok((pack.variants?.length ?? 0) >= 8);
    for (const phrase of [
      "9241757057239",
      "oita-urushi-kurozan-fountain-pen",
      "WF-DR-OTA-KZ-BARA",
      "Radiant Black",
      "Ebonite",
      "Oita Urushi",
      "炭粉",
      "Shikake-bera",
      "JoWo",
      "Keiryu",
      "18K Shogun",
      "European International Standard",
      "converter",
      "购买",
      "维护",
    ]) {
      assert.match(
        markdown,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }
    assert.doesNotMatch(markdown, /数据库|made_by|canonical/i);
    const svg = fs.readFileSync(
      path.join(
        ROOT,
        "public",
        pack.media[0]?.localPath?.replace(/^\//, "") ?? "",
      ),
      "utf8",
    );
    assert.match(svg, /非产品照片/);
    assert.match(svg, /本站原创事实示意图/);
    assert.match(svg, /Kurozan/);

    const existing = await rows(
      client,
      "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
      [PHASE566_TARGET_ID, pack.expectedSlug],
    );
    assert.deepEqual(
      existing.map((row) => [row.id, row.type, row.slug, row.name]),
      [[PHASE566_TARGET_ID, "pen", pack.expectedSlug, pack.canonicalName]],
    );
    const duplicate = await rows(
      client,
      "SELECT status,blockers_json FROM entity_publications WHERE entity_id=?",
      [PHASE566_DUPLICATE_ID],
    );
    assert.deepEqual(
      duplicate.map((row) => [row.status, row.blockers_json]),
      [["retired", '["taxonomy_merged"]']],
    );
    await assert.rejects(
      applyPhase566WancherOitaUrushiKurozan(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );

    const first = await applyPhase566WancherOitaUrushiKurozan(client, options);
    assert.equal(first.entityId, PHASE566_TARGET_ID);
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
        [PHASE566_TARGET_ID],
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
    assert.ok(Array.from(body).length >= 4_000);
    for (const phrase of [
      "9241757057239",
      "WF-DR-OTA-KZ-BARA",
      "Oita Urushi",
      "炭粉",
      "JoWo",
      "Keiryu",
      "18K Shogun",
      "European International Standard",
      "购买",
      "维护",
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
            [PHASE566_TARGET_ID, PHASE521_WANCHER_BRAND_ID],
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
            [PHASE521_WANCHER_BRAND_ID, PHASE566_TARGET_ID],
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
            [PHASE566_TARGET_ID],
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
            [PHASE566_TARGET_ID],
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
            [PHASE566_TARGET_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE566_TARGET_ID,
    );
    const publication = (
      await rows(
        client,
        "SELECT approved_content_hash FROM entity_publications WHERE entity_id=?",
        [PHASE566_TARGET_ID],
      )
    )[0];
    assert.equal(String(publication?.approved_content_hash), hash);
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          [PHASE566_TARGET_ID, hash],
        )
      ).map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    const replay = await applyPhase566WancherOitaUrushiKurozan(client, options);
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
