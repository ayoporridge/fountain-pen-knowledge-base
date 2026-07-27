import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase294Options,
  applyPhase294LamyImporiumDepthContent,
} from "../../scripts/apply-phase294-lamy-imporium-depth-content";
import {
  PHASE294_IMPORIUM_ID,
  phase294LamyImporiumDepthPacks,
} from "../../scripts/data/phase294-lamy-imporium-depth";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = "/Users/xz/CodeBuddy/fountain-pen-graph";
const CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(CANONICAL, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

test("Phase 294 deepens the existing LAMY imporium on an owned checkpoint copy", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase294-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase294Options = {
    workspaceRoot: ROOT,
    reviewer: "phase294-test",
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
    const modelPack = phase294LamyImporiumDepthPacks.find(
      (pack) =>
        pack.entityId === PHASE294_IMPORIUM_ID && pack.expectedType === "pen",
    );
    assert.ok(modelPack);
    assert.ok(modelPack.claims.length >= 10);
    assert.equal(modelPack.variants?.length, 4);
    const applied = await applyPhase294LamyImporiumDepthContent(
      client,
      options,
    );
    assert.equal(applied.entities.length, 2);
    assert.equal(
      applied.entities.find((item) => item.entityId === PHASE294_IMPORIUM_ID)
        ?.outcome,
      "published",
    );
    const state = (
      await rows(
        client,
        "SELECT e.type,e.slug,e.name,e.source,p.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities e JOIN entity_publications p ON p.entity_id=e.id LEFT JOIN public_entities public ON public.id=e.id WHERE e.id=?",
        [PHASE294_IMPORIUM_ID],
      )
    )[0];
    assert.deepEqual(
      [
        state?.type,
        state?.slug,
        state?.name,
        state?.status,
        Number(state?.is_public),
      ],
      ["pen", "lamy-imporium", "LAMY imporium", "published", 1],
    );
    assert.match(String(state?.source), /phase294-lamy-imporium-depth-v1/);
    const counts = (
      await rows(
        client,
        "SELECT (SELECT count(*) FROM claims WHERE subject_entity_id=?) claims,(SELECT count(*) FROM model_variants WHERE model_entity_id=?) variants,(SELECT count(*) FROM entity_references WHERE entity_id=?) refs,(SELECT count(*) FROM media_assets WHERE entity_id=?) media",
        [
          PHASE294_IMPORIUM_ID,
          PHASE294_IMPORIUM_ID,
          PHASE294_IMPORIUM_ID,
          PHASE294_IMPORIUM_ID,
        ],
      )
    )[0];
    assert.equal(Number(counts?.claims), modelPack.claims.length);
    assert.equal(Number(counts?.variants), 4);
    assert.equal(Number(counts?.refs), modelPack.sources.length);
    assert.equal(Number(counts?.media), 1);
    const hash = await computePublicationContentHash(
      client,
      PHASE294_IMPORIUM_ID,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          [PHASE294_IMPORIUM_ID, hash],
        )
      ).map((row) => [row.review_kind, row.status]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    const madeBy = await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [PHASE294_IMPORIUM_ID],
    );
    assert.equal(madeBy.length, 1);
    assert.equal(String(madeBy[0]?.target_id), "ySwGGq4bhvOA");
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
  } finally {
    client.close();
  }
});
