import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase241Options,
  applyPhase241PilotCustomHeritageSEContent,
} from "../../scripts/apply-phase241-pilot-custom-heritage-se-content";
import {
  PHASE241_PEN_ID,
  PHASE241_PEN_SLUG,
  PHASE241_PILOT_ID,
  phase241PilotCustomHeritageSEPacks,
} from "../../scripts/data/phase241-pilot-custom-heritage-se";
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

test("Phase 241 publishes Pilot Custom Heritage SE without duplicating Pilot identity", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase241-pilot-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase241Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase241-pilot-custom-heritage-se-test",
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
    assert.equal(phase241PilotCustomHeritageSEPacks.length, 2);
    for (const pack of phase241PilotCustomHeritageSEPacks) {
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
        applyPhase241PilotCustomHeritageSEContent(client, {
          ...options,
          reviewer: " ",
        }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      () =>
        applyPhase241PilotCustomHeritageSEContent(client, {
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

    const baselineReverse = await scalar(
      client,
      "SELECT count(*) value FROM entity_links WHERE source_id=? AND link_type='reverse'",
      [PHASE241_PILOT_ID],
    );
    const first = await applyPhase241PilotCustomHeritageSEContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );

    const publicRows = await rows(
      client,
      "SELECT id,type,slug,name,length(summary) summary_length,length(body_md) body_length FROM public_entities WHERE id IN (?,?) ORDER BY CASE id WHEN ? THEN 0 ELSE 1 END",
      [PHASE241_PILOT_ID, PHASE241_PEN_ID, PHASE241_PILOT_ID],
    );
    assert.deepEqual(
      publicRows.map((row) => [
        String(row.id),
        String(row.type),
        String(row.slug),
      ]),
      [
        [PHASE241_PILOT_ID, "brand", "pilot"],
        [PHASE241_PEN_ID, "pen", PHASE241_PEN_SLUG],
      ],
    );
    assert.ok(Number(publicRows[0]?.body_length) >= 1_700);
    assert.ok(Number(publicRows[1]?.body_length) >= 2_000);
    assert.equal(String(publicRows[0]?.name), "百乐 Pilot");

    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE241_PEN_ID, PHASE241_PILOT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE241_PILOT_ID, PHASE241_PEN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? AND link_type='reverse'",
        [PHASE241_PILOT_ID],
      ),
      baselineReverse + 1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM model_variants WHERE model_entity_id=?",
        [PHASE241_PEN_ID],
      ),
      10,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM model_specs WHERE entity_id=?",
        [PHASE241_PEN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
        [PHASE241_PEN_ID],
      ),
      11,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
        [
          PHASE241_PEN_ID,
          "/images/library/site-original/phase241/pilot/custom-heritage-se.svg",
        ],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entities WHERE type='pen' AND slug=?",
        [PHASE241_PEN_SLUG],
      ),
      1,
    );

    for (const pack of phase241PilotCustomHeritageSEPacks) {
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
    const replay = await applyPhase241PilotCustomHeritageSEContent(
      client,
      options,
    );
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
