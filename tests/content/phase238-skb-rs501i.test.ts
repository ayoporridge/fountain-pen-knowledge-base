import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase238Options,
  applyPhase238SkbRs501iContent,
} from "../../scripts/apply-phase238-skb-rs501i-content";
import {
  PHASE238_BRAND_ID,
  PHASE238_LEGACY_ID,
  PHASE238_PEN_ID,
  PHASE238_SLUGS,
  phase238SkbRs501iPacks,
} from "../../scripts/data/phase238-skb-rs501i";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function scalar(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args: args as never[] });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 238 publishes SKB RS-501i as one model with sourced theme variants", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase238-skb-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase238Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase238-skb-rs501i-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
  try {
    await migrateDatabase(client);
    assert.equal(phase238SkbRs501iPacks.length, 2);
    for (const pack of phase238SkbRs501iPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT_CANONICAL, pack.markdownFile),
        "utf8",
      );
      assert.ok(
        Array.from(markdown).length >=
          (pack.expectedType === "brand" ? 1_700 : 2_000),
        pack.entityId,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          2,
        pack.entityId,
      );
      const media = pack.media[0];
      assert.ok(media?.localPath, pack.entityId);
      const svg = fs.readFileSync(
        path.join(ROOT_CANONICAL, "public", media.localPath.replace(/^\//, "")),
        "utf8",
      );
      assert.match(svg, /non-photo/);
      assert.match(svg, /non-logo/);
      assert.match(svg, /not-to-scale/);
      assert.match(svg, /non-colour-proof/);
    }
    await assert.rejects(
      () =>
        applyPhase238SkbRs501iContent(client, { ...options, reviewer: " " }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      () =>
        applyPhase238SkbRs501iContent(client, {
          ...options,
          env: {
            NODE_ENV: "test",
            TURSO_DATABASE_URL: "",
            TURSO_AUTH_TOKEN: "",
            FPKG_DATABASE_URL: "libsql://remote",
          },
        }),
      /inherited remote/,
    );

    const first = await applyPhase238SkbRs501iContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const publicRows = await rows(
      client,
      "SELECT id,type,slug,name,length(summary) summary_length,length(body_md) body_length FROM public_entities WHERE id IN (?,?) ORDER BY CASE id WHEN ? THEN 0 ELSE 1 END",
      [PHASE238_BRAND_ID, PHASE238_PEN_ID, PHASE238_BRAND_ID],
    );
    assert.deepEqual(
      publicRows.map((row) => [
        String(row.id),
        String(row.type),
        String(row.slug),
      ]),
      [
        [PHASE238_BRAND_ID, "brand", PHASE238_SLUGS.brand],
        [PHASE238_PEN_ID, "pen", PHASE238_SLUGS.pen],
      ],
    );
    assert.ok(
      Number(publicRows[0]?.summary_length) >= 60 &&
        Number(publicRows[0]?.summary_length) <= 160,
    );
    assert.ok(
      Number(publicRows[1]?.summary_length) >= 60 &&
        Number(publicRows[1]?.summary_length) <= 160,
    );
    assert.ok(Number(publicRows[0]?.body_length) >= 1_700);
    assert.ok(Number(publicRows[1]?.body_length) >= 2_000);
    assert.match(
      String(
        (
          await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
            PHASE238_BRAND_ID,
          ])
        )[0]?.body_md,
      ),
      /RS-501i/,
    );

    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE238_PEN_ID, PHASE238_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE238_BRAND_ID, PHASE238_PEN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM model_variants WHERE model_entity_id=?",
        [PHASE238_PEN_ID],
      ),
      6,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
          [PHASE238_PEN_ID],
        )
      )
        .map((row) => String(row.variant_name))
        .sort(),
      [
        "国旗钢笔",
        "海軍钢笔",
        "旅行郵件钢笔",
        "空軍钢笔",
        "環島臺灣钢笔",
        "濱線熊联名高雄名物钢笔",
      ].sort(),
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_references reference JOIN source_items source ON source.id=reference.source_item_id WHERE reference.entity_id=? AND source.url LIKE '%product_id%322%'",
        [PHASE238_PEN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
        [
          PHASE238_PEN_ID,
          "/images/library/site-original/phase238/skb/rs-501i.svg",
        ],
      ),
      1,
    );

    for (const pack of phase238SkbRs501iPacks) {
      const hash = await computePublicationContentHash(client, pack.entityId);
      assert.deepEqual(
        (
          await rows(
            client,
            "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            [pack.entityId, hash],
          )
        ).map((row) => [String(row.review_kind), String(row.status)]),
        [
          ["fact", "approved"],
          ["language", "approved"],
          ["media", "approved"],
          ["publication", "approved"],
        ],
      );
    }
    const legacy = (
      await rows(client, "SELECT type,slug,name FROM entities WHERE id=?", [
        PHASE238_LEGACY_ID,
      ])
    )[0];
    assert.deepEqual(
      [legacy?.type, legacy?.slug, legacy?.name],
      ["pen", PHASE238_SLUGS.legacy, "SKB派顿 F10 / F21"],
    );
    const replay = await applyPhase238SkbRs501iContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    clearInterval(keepAlive);
    client.close();
  }
});
