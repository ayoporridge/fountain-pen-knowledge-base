import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase307GvfcIntuitionBrandSplitContent } from "../../scripts/apply-phase307-gvfc-intuition-brand-split-content";
import {
  PHASE307_GVFC_BRAND_ID,
  PHASE307_GVFC_CLASSIC_ID,
  PHASE307_INTUITION_ID,
  PHASE307_INTUITION_SLUG,
  phase307GvfcIntuitionBrandSplitPacks,
} from "../../scripts/data/phase307-gvfc-intuition-brand-split";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const OLD_FABER_BRAND_ID = "xVHzH0mMviM4";

test("Phase 307 splits Graf von Faber-Castell from ordinary Faber-Castell and publishes Intuition on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase307-gvfc-intuition-")),
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
    reviewer: "phase307-gvfc-intuition-test",
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
    const intuitionPack = phase307GvfcIntuitionBrandSplitPacks.find(
      (pack) => pack.entityId === PHASE307_INTUITION_ID,
    );
    assert.ok(intuitionPack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, intuitionPack.markdownFile), "utf8")
        .length >= 2_000,
    );
    assert.ok(
      new Set(intuitionPack.sources.map((source) => source.independenceGroup))
        .size >= 4,
    );
    const intuitionPath = intuitionPack.media[0]?.localPath;
    assert.ok(intuitionPath);
    const intuitionSvg = fs.readFileSync(
      path.join(ROOT, "public", intuitionPath.replace(/^\//, "")),
      "utf8",
    );
    for (const marker of [
      /non-photo/i,
      /non-logo/i,
      /not-to-scale/i,
      /non-colour-proof/i,
    ])
      assert.match(intuitionSvg, marker);
    await assert.rejects(
      applyPhase307GvfcIntuitionBrandSplitContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase307GvfcIntuitionBrandSplitContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE307_GVFC_BRAND_ID, PHASE307_GVFC_CLASSIC_ID, PHASE307_INTUITION_ID],
    );
    const firstOutcomes = first.entities.map((item) => item.outcome);
    assert.ok(
      firstOutcomes.every((outcome) => outcome === "published") ||
        firstOutcomes.every((outcome) => outcome === "noop"),
    );
    const brandRow = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE307_GVFC_BRAND_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [brandRow?.id, brandRow?.type, brandRow?.slug, brandRow?.name],
      [
        PHASE307_GVFC_BRAND_ID,
        "brand",
        "graf-von-faber-castell",
        "Graf von Faber-Castell",
      ],
    );
    assert.match(String(brandRow?.body_md ?? ""), /Classic/);
    assert.match(String(brandRow?.body_md ?? ""), /Intuition/);
    const intuitionRow = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE307_INTUITION_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [
        intuitionRow?.id,
        intuitionRow?.type,
        intuitionRow?.slug,
        intuitionRow?.name,
      ],
      [
        PHASE307_INTUITION_ID,
        "pen",
        PHASE307_INTUITION_SLUG,
        "Graf von Faber-Castell Intuition",
      ],
    );
    const body = String(intuitionRow?.body_md ?? "");
    for (const pattern of [
      /Intuition/,
      /Platino Wood/,
      /18K/,
      /cartridge\/converter/i,
      /维护/,
      /选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|market_sku|数据库|仓库/i);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
            args: [PHASE307_INTUITION_ID],
          })
        ).rows[0]?.value,
      ),
      3,
    );
    assert.equal(
      String(
        (
          await client.execute({
            sql: "SELECT brand_entity_id FROM model_specs WHERE entity_id=?",
            args: [PHASE307_GVFC_CLASSIC_ID],
          })
        ).rows[0]?.brand_entity_id,
      ),
      PHASE307_GVFC_BRAND_ID,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE307_GVFC_CLASSIC_ID, PHASE307_GVFC_BRAND_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE307_INTUITION_ID, PHASE307_GVFC_BRAND_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE307_GVFC_CLASSIC_ID, OLD_FABER_BRAND_ID],
          })
        ).rows[0]?.value,
      ),
      0,
    );
    for (const entityId of [
      PHASE307_GVFC_BRAND_ID,
      PHASE307_GVFC_CLASSIC_ID,
      PHASE307_INTUITION_ID,
    ]) {
      const hash = await computePublicationContentHash(client, entityId);
      assert.deepEqual(
        (
          await client.execute({
            sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            args: [entityId, hash],
          })
        ).rows.map((row) => [String(row.review_kind), String(row.status)]),
        [
          ["fact", "approved"],
          ["language", "approved"],
          ["media", "approved"],
          ["publication", "approved"],
        ],
      );
    }
    assert.deepEqual(
      (
        await applyPhase307GvfcIntuitionBrandSplitContent(client, options)
      ).entities.map((item) => item.outcome),
      ["noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
