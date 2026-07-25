import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase245Options,
  applyPhase245WatermanExceptionContent,
} from "../../scripts/apply-phase245-waterman-exception-content";
import {
  PHASE245_PEN_ID,
  PHASE245_PEN_SLUG,
  PHASE245_WATERMAN_ID,
  phase245WatermanExceptionPacks,
} from "../../scripts/data/phase245-waterman-exception";
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

test("Phase 245 publishes Waterman Exception with square-body and 18K-nib boundaries", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase245-waterman-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase245Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase245-waterman-exception-test",
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
    assert.equal(phase245WatermanExceptionPacks.length, 2);
    const pack = phase245WatermanExceptionPacks.find(
      (candidate) => candidate.entityId === PHASE245_PEN_ID,
    );
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT_CANONICAL, pack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 2_000);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    const localPath = pack.media[0]?.localPath;
    assert.ok(localPath);
    const svg = fs.readFileSync(
      path.join(ROOT_CANONICAL, "public", localPath.replace(/^\//, "")),
      "utf8",
    );
    assert.match(svg, /non-photo/i);
    assert.match(svg, /non-logo/i);
    assert.match(svg, /not-to-scale/i);
    assert.match(svg, /non-colour-proof/i);
    await assert.rejects(
      () =>
        applyPhase245WatermanExceptionContent(client, {
          ...options,
          reviewer: " ",
        }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      () =>
        applyPhase245WatermanExceptionContent(client, {
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
    const first = await applyPhase245WatermanExceptionContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const publicRows = await rows(
      client,
      "SELECT id,type,slug,name,length(body_md) body_length FROM public_entities WHERE id=?",
      [PHASE245_PEN_ID],
    );
    assert.deepEqual(
      publicRows.map((row) => [
        String(row.id),
        String(row.type),
        String(row.slug),
      ]),
      [[PHASE245_PEN_ID, "pen", PHASE245_PEN_SLUG]],
    );
    assert.ok(Number(publicRows[0]?.body_length) >= 2_000);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE245_PEN_ID, PHASE245_WATERMAN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE245_WATERMAN_ID, PHASE245_PEN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM model_variants WHERE model_entity_id=?",
        [PHASE245_PEN_ID],
      ),
      3,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM model_specs WHERE entity_id=?",
        [PHASE245_PEN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
        [PHASE245_PEN_ID],
      ),
      11,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
        [
          PHASE245_PEN_ID,
          "/images/library/site-original/phase245/waterman/exception.svg",
        ],
      ),
      1,
    );
    const hash = await computePublicationContentHash(client, PHASE245_PEN_ID);
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          [PHASE245_PEN_ID, hash],
        )
      ).map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    const replay = await applyPhase245WatermanExceptionContent(client, options);
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
