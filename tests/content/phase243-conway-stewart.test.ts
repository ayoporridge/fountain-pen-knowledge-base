import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase243Options,
  applyPhase243ConwayStewartContent,
} from "../../scripts/apply-phase243-conway-stewart-content";
import {
  PHASE243_BRAND_ID,
  PHASE243_PEN_ID,
  PHASE243_PEN_SLUG,
  phase243ConwayStewartSeries100Packs,
} from "../../scripts/data/phase243-conway-stewart-series-100";
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

test("Phase 243 publishes Conway Stewart Series 100 with explicit current identity", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase243-conway-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase243Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase243-conway-stewart-test",
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
    assert.equal(phase243ConwayStewartSeries100Packs.length, 2);
    for (const pack of phase243ConwayStewartSeries100Packs) {
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
      const localPath = pack.media[0]?.localPath;
      assert.ok(localPath, pack.entityId);
      const svg = fs.readFileSync(
        path.join(ROOT_CANONICAL, "public", localPath.replace(/^\//, "")),
        "utf8",
      );
      assert.match(svg, /non-photo/);
      assert.match(svg, /non-logo/);
      assert.match(svg, /not-to-scale/);
      assert.match(svg, /non-colour-proof/);
    }
    await assert.rejects(
      () =>
        applyPhase243ConwayStewartContent(client, {
          ...options,
          reviewer: " ",
        }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      () =>
        applyPhase243ConwayStewartContent(client, {
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

    const first = await applyPhase243ConwayStewartContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const publicRows = await rows(
      client,
      "SELECT id,type,slug,name,length(summary) summary_length,length(body_md) body_length FROM public_entities WHERE id IN (?,?) ORDER BY CASE id WHEN ? THEN 0 ELSE 1 END",
      [PHASE243_BRAND_ID, PHASE243_PEN_ID, PHASE243_BRAND_ID],
    );
    assert.deepEqual(
      publicRows.map((row) => [
        String(row.id),
        String(row.type),
        String(row.slug),
      ]),
      [
        [PHASE243_BRAND_ID, "brand", "conway-stewart"],
        [PHASE243_PEN_ID, "pen", PHASE243_PEN_SLUG],
      ],
    );
    assert.ok(Number(publicRows[0]?.body_length) >= 1_700);
    assert.ok(Number(publicRows[1]?.body_length) >= 2_000);
    assert.equal(String(publicRows[0]?.name), "Conway Stewart");
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE243_PEN_ID, PHASE243_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE243_BRAND_ID, PHASE243_PEN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM model_variants WHERE model_entity_id=?",
        [PHASE243_PEN_ID],
      ),
      5,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM model_specs WHERE entity_id=?",
        [PHASE243_PEN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
        [PHASE243_PEN_ID],
      ),
      11,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
        [
          PHASE243_PEN_ID,
          "/images/library/site-original/phase243/conway-stewart/series-100.svg",
        ],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entities WHERE type='pen' AND slug=?",
        [PHASE243_PEN_SLUG],
      ),
      1,
    );
    for (const pack of phase243ConwayStewartSeries100Packs) {
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
    const replay = await applyPhase243ConwayStewartContent(client, options);
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
