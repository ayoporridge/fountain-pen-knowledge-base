import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase279Opus88PremiumOperaContent } from "../../scripts/apply-phase279-opus88-premium-opera-content";
import {
  PHASE279_OPERA_ID,
  PHASE279_OPERA_SLUG,
  PHASE279_OPUS88_BRAND_ID,
  phase279Opus88PremiumOperaPacks,
} from "../../scripts/data/phase279-opus88-premium-opera";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 279 publishes Opus 88 Premium Opera on an owned copy", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const protectedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase279-opus88-protected-")),
  );
  const protectedCopy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(protectedRoot, "protected.db"),
    protectedRoot,
    { expectedSourceSnapshot: realSnapshot },
  );
  const snapshot = protectedCopy.destinationSnapshot;
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase279-opus88-owned-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    protectedCopy.destinationPath,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase279-opus88-premium-opera-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: protectedCopy.destinationPath,
    protectedCatalogSnapshot: snapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    assert.equal(phase279Opus88PremiumOperaPacks.length, 2);
    const pack = phase279Opus88PremiumOperaPacks.find(
      (item) => item.entityId === PHASE279_OPERA_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        2_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    const svgPath = pack.media[0]?.localPath;
    assert.ok(svgPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", svgPath.replace(/^\//, "")),
      "utf8",
    );
    for (const marker of [
      /non-product|非产品照片/i,
      /非品牌 Logo/,
      /非比例图/,
      /非颜色校样/,
    ])
      assert.match(svg, marker);
    await assert.rejects(
      () =>
        applyPhase279Opus88PremiumOperaContent(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase279Opus88PremiumOperaContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [
        [PHASE279_OPUS88_BRAND_ID, "published"],
        [PHASE279_OPERA_ID, "published"],
      ],
    );
    const row = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE279_OPERA_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [row?.id, row?.type, row?.slug, row?.name],
      [PHASE279_OPERA_ID, "pen", PHASE279_OPERA_SLUG, "Opus 88 Premium Opera"],
    );
    const body = String(row?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /Premium Opera/i,
      /Bock.*250/i,
      /滴入式/,
      /止墨阀/,
      /不接受墨囊/,
      /维护|清洗/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
            args: [PHASE279_OPERA_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
            args: [PHASE279_OPERA_ID],
          })
        ).rows[0]?.value,
      ),
      11,
    );
    const hash = await computePublicationContentHash(client, PHASE279_OPERA_ID);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE279_OPERA_ID, hash],
        })
      ).rows.map((item) => [String(item.review_kind), String(item.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE279_OPERA_ID, PHASE279_OPUS88_BRAND_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE279_OPUS88_BRAND_ID, PHASE279_OPERA_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id=?",
          args: [PHASE279_OPUS88_BRAND_ID],
        })
      ).rows[0]?.status,
      "published",
    );
    assert.ok(
      (
        await applyPhase279Opus88PremiumOperaContent(client, options)
      ).entities.every((item) => item.outcome === "noop"),
    );
  } finally {
    client.close();
    try {
      const after = snapshotCatalogFiles(protectedCopy.destinationPath);
      assert.deepEqual(after, snapshot);
      const realAfter = snapshotCatalogFiles(REAL);
      assert.deepEqual(realAfter.main, realSnapshot.main);
      assert.deepEqual(realAfter.wal, realSnapshot.wal);
    } finally {
      fs.rmSync(protectedRoot, { recursive: true, force: true });
      fs.rmSync(ownedRoot, { recursive: true, force: true });
    }
  }
});
