import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase552Options,
  applyPhase552Parker180DepthContent,
} from "../../scripts/apply-phase552-parker-180-depth";
import {
  ENTITY_ID,
  PHASE552_PARKER_BRAND_ID,
  phase552Parker180DepthPacks,
} from "../../scripts/data/phase552-parker-180-depth";
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

function hash(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

test("Phase 552 deepens the existing Parker 180 canonical on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = hash(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase552-parker180-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase552Options = {
    workspaceRoot: ROOT,
    reviewer: "phase552-parker180-depth-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
  try {
    await migrateDatabase(client);
    const pack = phase552Parker180DepthPacks.find(
      (candidate) => candidate.entityId === ENTITY_ID,
    );
    assert.ok(pack);
    assert.equal(pack.entityId, ENTITY_ID);
    assert.equal(pack.expectedSlug, "the-parker-180");
    assert.ok(
      Array.from(fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8"))
        .length >= 4_500,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    assert.ok(
      pack.claims.some(
        (claim) => claim.key === "phase552-parker180-nib-material-boundary",
      ),
    );
    assert.ok(
      pack.variants?.some(
        (variant) => variant.key === "phase552-parker180-classic-boundary",
      ),
    );

    await assert.rejects(
      applyPhase552Parker180DepthContent(client, {
        ...options,
        env: {
          ...(options.env ?? {}),
          TURSO_DATABASE_URL: "libsql://remote",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );

    const first = await applyPhase552Parker180DepthContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      [PHASE552_PARKER_BRAND_ID, ENTITY_ID],
    );
    assert.ok(first.entities.every((entity) => entity.outcome === "published"));

    const state = (
      await rows(
        client,
        `SELECT entity.type,entity.slug,entity.body_md,publication.status,
                publication.content_revision,publication.reviewed_content_revision,
                publication.reviewed_contract_version,publication.approved_content_hash
         FROM entities entity
         JOIN entity_publications publication ON publication.entity_id=entity.id
         WHERE entity.id=?`,
        [ENTITY_ID],
      )
    )[0];
    assert.equal(state?.type, "pen");
    assert.equal(state?.slug, "the-parker-180");
    assert.equal(state?.status, "published");
    assert.equal(
      Number(state?.reviewed_content_revision),
      Number(state?.content_revision),
    );
    assert.equal(Number(state?.reviewed_contract_version), 3);
    const body = String(state?.body_md ?? "");
    for (const phrase of [
      "1977",
      "3,957,379",
      "D243,014",
      "XF/M",
      "F/B",
      "14K",
      "steel",
      "Parker cartridge/converter",
      "1986",
      "Place Vendôme",
      "维护",
      "选购",
    ]) {
      assert.match(
        body,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }
    assert.doesNotMatch(body, /made_by|数据库|仓库/i);

    const references = (
      await rows(
        client,
        "SELECT count(*) AS n FROM entity_references WHERE entity_id=? AND review_status='approved'",
        [ENTITY_ID],
      )
    )[0];
    assert.ok(Number(references?.n) >= 6);
    const spec = (
      await rows(
        client,
        "SELECT review_status FROM model_specs WHERE entity_id=?",
        [ENTITY_ID],
      )
    )[0];
    assert.equal(spec?.review_status, "approved");
    const specEvidence = (
      await rows(
        client,
        `SELECT count(*) AS n FROM spec_field_evidence evidence
         JOIN model_specs model_spec ON model_spec.id=evidence.model_spec_id
         WHERE model_spec.entity_id=? AND evidence.review_status='approved'`,
        [ENTITY_ID],
      )
    )[0];
    assert.ok(Number(specEvidence?.n) >= 8);
    const media = (
      await rows(
        client,
        "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved'",
        [ENTITY_ID],
      )
    )[0];
    assert.equal(Number(media?.n), 1);
    const madeBy = await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [ENTITY_ID],
    );
    assert.deepEqual(
      madeBy.map((row) => String(row.target_id)),
      ["vhqNYqDChhiN"],
    );

    const contentHash = await computePublicationContentHash(client, ENTITY_ID);
    const reviews = await rows(
      client,
      "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
      [ENTITY_ID, contentHash],
    );
    assert.deepEqual(
      reviews.map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    assert.equal(String(state?.approved_content_hash), contentHash);
    assert.equal(
      (await rows(client, "PRAGMA integrity_check"))[0]?.integrity_check,
      "ok",
    );

    const replay = await applyPhase552Parker180DepthContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    assert.equal(hash(REAL), protectedHash);
    assertCatalogSnapshotUnchanged(
      protectedSnapshot,
      snapshotCatalogFiles(REAL),
    );
  } finally {
    client.close();
  }
});
