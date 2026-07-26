import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase264TacciaPinnacleCovenantContent } from "../../scripts/apply-phase264-taccia-pinnacle-covenant-content";
import {
  PHASE264_COVENANT_ID,
  PHASE264_PINNACLE_ID,
  PHASE264_TACCIA_BRAND_ID,
  phase264TacciaPinnacleCovenantPacks,
} from "../../scripts/data/phase264-taccia-pinnacle-covenant";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 264 publishes TACCIA Pinnacle and Covenant SE with exact topology", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase264-taccia-")),
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
    reviewer: "phase264-taccia-test",
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
    assert.equal(phase264TacciaPinnacleCovenantPacks.length, 3);
    for (const pack of phase264TacciaPinnacleCovenantPacks) {
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          2_000,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          4,
      );
      const localPath = pack.media[0]?.localPath;
      assert.ok(localPath);
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.replace(/^\//, "")),
        "utf8",
      );
      for (const marker of [
        /non-photo/i,
        /non-logo/i,
        /not-to-scale/i,
        /non-colour-proof/i,
      ])
        assert.match(svg, marker);
    }
    await assert.rejects(
      applyPhase264TacciaPinnacleCovenantContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    assert.deepEqual(
      (
        await applyPhase264TacciaPinnacleCovenantContent(client, options)
      ).entities.map((item) => [item.entityId, item.outcome]),
      [
        [PHASE264_TACCIA_BRAND_ID, "published"],
        [PHASE264_PINNACLE_ID, "published"],
        [PHASE264_COVENANT_ID, "published"],
      ],
    );
    for (const [id, slug, bodyPatterns] of [
      [
        PHASE264_PINNACLE_ID,
        "taccia-pinnacle",
        [
          /Pinnacle/,
          /anodized aluminum/i,
          /converter/i,
          /Japanese/i,
          /Music/,
          /139\.7/,
        ],
      ],
      [
        PHASE264_COVENANT_ID,
        "taccia-covenant-se",
        [
          /Covenant/,
          /inner sheath/i,
          /cartridge/i,
          /14K/,
          /MS/,
          /Parchment Swirl/,
        ],
      ],
    ] as const) {
      const row = (
        await client.execute({
          sql: "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
          args: [id],
        })
      ).rows[0];
      assert.deepEqual([row?.id, row?.type, row?.slug], [id, "pen", slug]);
      const body = String(row?.body_md ?? "");
      assert.ok(body.length >= 2_000);
      for (const pattern of bodyPatterns) assert.match(body, pattern);
      assert.doesNotMatch(body, /数据库|canonical|made_by/i);
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
            args: [id],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
            args: [id],
          })
        ).rows[0]?.value,
        9,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [id],
          })
        ).rows[0]?.value,
        1,
      );
      const hash = await computePublicationContentHash(client, id);
      assert.deepEqual(
        (
          await client.execute({
            sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            args: [id, hash],
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
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [id, PHASE264_TACCIA_BRAND_ID],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE264_TACCIA_BRAND_ID, id],
          })
        ).rows[0]?.value,
        1,
      );
    }
    assert.deepEqual(
      (
        await applyPhase264TacciaPinnacleCovenantContent(client, options)
      ).entities.map((item) => item.outcome),
      ["noop", "noop", "noop"],
    );
  } finally {
    client.close();
    assertCatalogSnapshotUnchanged(snapshot);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
