import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase274LotusStudentContent } from "../../scripts/apply-phase274-lotus-student-content";
import {
  PHASE274_BRAND_ID,
  PHASE274_STUDENT_ID,
  phase274LotusStudentPacks,
} from "../../scripts/data/phase274-lotus-student";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 274 publishes Lotus Student on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase274-lotus-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase274-lotus-student-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
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
    assert.equal(phase274LotusStudentPacks.length, 2);
    const pack = phase274LotusStudentPacks.find(
      (item) => item.entityId === PHASE274_STUDENT_ID,
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
        applyPhase274LotusStudentContent(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase274LotusStudentContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE274_BRAND_ID, PHASE274_STUDENT_ID],
    );
    const row = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE274_STUDENT_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [row?.id, row?.type, row?.slug, row?.name],
      [PHASE274_STUDENT_ID, "pen", "lotus-student", "Lotus Student"],
    );
    const body = String(row?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /Lotus Student/i,
      /premium ebonite|硬橡胶/i,
      /Jowo|钢尖/i,
      /维护|清洁/,
      /购买|选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|market_sku|数据库|仓库|SKU/i);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
            args: [PHASE274_STUDENT_ID],
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
            args: [PHASE274_STUDENT_ID],
          })
        ).rows[0]?.value,
      ),
      11,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE274_STUDENT_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE274_STUDENT_ID, hash],
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
            args: [PHASE274_STUDENT_ID, PHASE274_BRAND_ID],
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
            args: [PHASE274_BRAND_ID, PHASE274_STUDENT_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.ok(
      (await applyPhase274LotusStudentContent(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
  } finally {
    client.close();
    assertCatalogSnapshotUnchanged(snapshot);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
