import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase556Options,
  applyPhase556PilotCustomHeritage91Depth,
} from "../../scripts/apply-phase556-pilot-custom-heritage-91-depth";
import {
  PHASE556_HERITAGE_91_ID,
  PHASE556_HERITAGE_91_SLUG,
  PHASE556_PILOT_ID,
  phase556PilotCustomHeritage91DepthPacks,
} from "../../scripts/data/phase556-pilot-custom-heritage-91-depth";
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

test("Phase 556 deepens the existing Pilot Custom Heritage 91 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = hash(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase556-pilot-heritage91-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase556Options = {
    workspaceRoot: ROOT,
    reviewer: "phase556-pilot-heritage91-depth-test",
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
    const pack = phase556PilotCustomHeritage91DepthPacks.find(
      (candidate) => candidate.entityId === PHASE556_HERITAGE_91_ID,
    );
    assert.ok(pack);
    assert.equal(pack.entityId, PHASE556_HERITAGE_91_ID);
    assert.equal(pack.expectedSlug, PHASE556_HERITAGE_91_SLUG);
    assert.ok(
      Array.from(fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8"))
        .length >= 5_000,
    );
    assert.ok(
      pack.sources.some(
        (source) => source.key === "phase556-91-current-catalog",
      ),
    );
    assert.ok(pack.claims.some((claim) => claim.key === "phase556-91-filling"));
    assert.ok((pack.spec?.evidence.length ?? 0) >= 18);

    const brandBefore = await rows(
      client,
      `SELECT e.body_md,e.source,p.content_revision,p.reviewed_content_revision,p.approved_content_hash,p.status
       FROM entities e JOIN entity_publications p ON p.entity_id=e.id WHERE e.id=?`,
      [PHASE556_PILOT_ID],
    );

    await assert.rejects(
      applyPhase556PilotCustomHeritage91Depth(client, {
        ...options,
        env: {
          ...(options.env ?? {}),
          TURSO_DATABASE_URL: "libsql://remote",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );

    const first = await applyPhase556PilotCustomHeritage91Depth(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      [PHASE556_PILOT_ID, PHASE556_HERITAGE_91_ID],
    );
    assert.equal(
      first.entities.find(
        (entity) => entity.entityId === PHASE556_HERITAGE_91_ID,
      )?.outcome,
      "published",
    );

    const state = (
      await rows(
        client,
        `SELECT e.type,e.slug,e.body_md,p.status,p.content_revision,p.reviewed_content_revision,
                p.reviewed_contract_version,p.approved_content_hash,r.publishable,r.blocker_count,
                CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
         FROM entities e JOIN entity_publications p ON p.entity_id=e.id
         LEFT JOIN public_entity_readiness r ON r.entity_id=e.id AND r.contract_version=3
         LEFT JOIN public_entities public ON public.id=e.id WHERE e.id=?`,
        [PHASE556_HERITAGE_91_ID],
      )
    )[0];
    assert.equal(state?.type, "pen");
    assert.equal(state?.slug, PHASE556_HERITAGE_91_SLUG);
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
    for (const phrase of [
      "FKVHN-12SR",
      "14K No.5",
      "CON-40",
      "CON-70N",
      "14.7 mm",
      "15.7 g",
      "FKVH-1MR",
      "Custom Heritage 92",
      "维护",
      "验货",
    ]) {
      assert.match(
        body,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }
    assert.doesNotMatch(body, /made_by|数据库|仓库/i);

    const references = await rows(
      client,
      "SELECT count(*) AS n FROM entity_references WHERE entity_id=? AND review_status='approved'",
      [PHASE556_HERITAGE_91_ID],
    );
    assert.ok(Number(references[0]?.n) >= 12);
    const specEvidence = await rows(
      client,
      `SELECT count(*) AS n FROM spec_field_evidence evidence
       JOIN model_specs model_spec ON model_spec.id=evidence.model_spec_id
       WHERE model_spec.entity_id=? AND evidence.review_status='approved'`,
      [PHASE556_HERITAGE_91_ID],
    );
    assert.ok(Number(specEvidence[0]?.n) >= 18);
    const media = await rows(
      client,
      "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved'",
      [PHASE556_HERITAGE_91_ID],
    );
    assert.equal(Number(media[0]?.n), 1);
    const madeBy = await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [PHASE556_HERITAGE_91_ID],
    );
    assert.deepEqual(
      madeBy.map((row) => String(row.target_id)),
      [PHASE556_PILOT_ID],
    );

    const contentHash = await computePublicationContentHash(
      client,
      PHASE556_HERITAGE_91_ID,
    );
    assert.equal(String(state?.approved_content_hash), contentHash);
    const reviews = await rows(
      client,
      "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
      [PHASE556_HERITAGE_91_ID, contentHash],
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

    const second = await applyPhase556PilotCustomHeritage91Depth(
      client,
      options,
    );
    assert.deepEqual(
      second.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    const brandAfter = await rows(
      client,
      `SELECT e.body_md,e.source,p.status FROM entities e
       JOIN entity_publications p ON p.entity_id=e.id WHERE e.id=?`,
      [PHASE556_PILOT_ID],
    );
    assert.equal(brandAfter[0]?.body_md, brandBefore[0]?.body_md);
    assert.match(
      String(brandAfter[0]?.source ?? ""),
      /phase425-pilot-brand-depth-refresh-v1/,
    );
    assert.equal(brandAfter[0]?.status, "published");
    assert.equal(
      (await rows(client, "PRAGMA integrity_check"))[0]?.integrity_check,
      "ok",
    );
  } finally {
    client.close();
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    assert.equal(hash(REAL), protectedHash);
  }
});
