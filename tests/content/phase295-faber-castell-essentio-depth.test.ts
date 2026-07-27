import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase295Options,
  applyPhase295FaberCastellEssentioDepthContent,
} from "../../scripts/apply-phase295-faber-castell-essentio-depth-content";
import {
  PHASE295_ESSENTIO_ID,
  phase295FaberCastellEssentioDepthPacks,
} from "../../scripts/data/phase295-faber-castell-essentio-depth";
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

test("Phase 295 deepens the existing Faber-Castell Essentio on an owned checkpoint copy", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase295-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase295Options = {
    workspaceRoot: ROOT,
    reviewer: "phase295-test",
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
    const model = phase295FaberCastellEssentioDepthPacks.find(
      (pack) =>
        pack.entityId === PHASE295_ESSENTIO_ID && pack.expectedType === "pen",
    );
    assert.ok(model);
    assert.ok(model.claims.length >= 10);
    assert.equal(model.variants?.length, 4);
    const result = await applyPhase295FaberCastellEssentioDepthContent(
      client,
      options,
    );
    assert.equal(
      result.entities.find((item) => item.entityId === PHASE295_ESSENTIO_ID)
        ?.outcome,
      "published",
    );
    const state = (
      await rows(
        client,
        "SELECT e.type,e.slug,e.name,e.source,p.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities e JOIN entity_publications p ON p.entity_id=e.id LEFT JOIN public_entities public ON public.id=e.id WHERE e.id=?",
        [PHASE295_ESSENTIO_ID],
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
      [
        "pen",
        "faber-castell-essentio",
        "Faber-Castell Essentio",
        "published",
        1,
      ],
    );
    assert.match(
      String(state?.source),
      /phase295-faber-castell-essentio-depth-v1/,
    );
    const counts = (
      await rows(
        client,
        "SELECT (SELECT count(*) FROM claims WHERE subject_entity_id=?) claims,(SELECT count(*) FROM model_variants WHERE model_entity_id=?) variants,(SELECT count(*) FROM entity_references WHERE entity_id=?) refs",
        [PHASE295_ESSENTIO_ID, PHASE295_ESSENTIO_ID, PHASE295_ESSENTIO_ID],
      )
    )[0];
    assert.equal(Number(counts?.claims), model.claims.length);
    assert.equal(Number(counts?.variants), 4);
    assert.equal(Number(counts?.refs), model.sources.length);
    const hash = await computePublicationContentHash(
      client,
      PHASE295_ESSENTIO_ID,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          [PHASE295_ESSENTIO_ID, hash],
        )
      ).map((row) => [row.review_kind, row.status]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    const makers = await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [PHASE295_ESSENTIO_ID],
    );
    assert.equal(makers.length, 1);
    assert.equal(String(makers[0]?.target_id), "xVHzH0mMviM4");
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
  } finally {
    client.close();
  }
});
