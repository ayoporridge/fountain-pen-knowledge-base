import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase298MajohnC1Content } from "../../scripts/apply-phase298-majohn-c1-content";
import {
  PHASE298_C1_ID,
  PHASE298_C1_SLUG,
  PHASE298_MAJOHN_BRAND_ID,
  phase298MajohnC1Packs,
} from "../../scripts/data/phase298-majohn-c1";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 298 publishes Majohn C1 only on an owned checkpoint copy", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase298-majohn-c1-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    const model = phase298MajohnC1Packs.find(
      (pack) => pack.entityId === PHASE298_C1_ID,
    );
    if (!model) throw new Error("Phase 298 C1 pack missing.");
    assert.ok(model.claims.length >= 8);
    assert.equal(model.variants?.length, 3);
    const markdown = fs.readFileSync(
      path.join(ROOT, model.markdownFile),
      "utf8",
    );
    assert.match(markdown, /## 身份与为什么值得单列/);
    assert.match(markdown, /## 结构、上墨与使用/);
    assert.ok(Array.from(markdown).length >= 2_000);
    const primaryMedia = model.media[0];
    if (!primaryMedia?.localPath)
      throw new Error("Phase 298 C1 media path missing.");
    const svg = fs.readFileSync(
      path.join(ROOT, "public", primaryMedia.localPath.replace(/^\//, "")),
      "utf8",
    );
    assert.match(svg, /data-factual-svg="true"/);
    assert.match(svg, /data-non-photo="true"/);
    const options = {
      workspaceRoot: ROOT,
      reviewer: "phase298-majohn-c1-test",
      databasePath: copy.destinationPath,
      ownedRoot,
      protectedCatalogPath: REAL,
      protectedCatalogSnapshot: protectedSnapshot,
      env: {
        NODE_ENV: "test" as const,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
    };
    const first = await applyPhase298MajohnC1Content(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.outcome),
      ["published", "published"],
    );
    const state = (
      await client.execute({
        sql: "SELECT e.type,e.slug,e.name,p.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities e JOIN entity_publications p ON p.entity_id=e.id LEFT JOIN public_entities public ON public.id=e.id WHERE e.id=?",
        args: [PHASE298_C1_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [
        state?.type,
        state?.slug,
        state?.name,
        state?.status,
        Number(state?.is_public),
      ],
      ["pen", PHASE298_C1_SLUG, "末匠 Majohn C1", "published", 1],
    );
    const links = await client.execute({
      sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
      args: [PHASE298_C1_ID, PHASE298_MAJOHN_BRAND_ID],
    });
    assert.equal(Number(links.rows[0]?.n), 1);
    const second = await applyPhase298MajohnC1Content(client, options);
    assert.deepEqual(
      second.entities.map((item) => item.outcome),
      ["noop", "noop"],
    );
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
  } finally {
    client.close();
  }
});
