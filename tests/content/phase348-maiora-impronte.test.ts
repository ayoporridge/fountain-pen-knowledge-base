import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase348MaioraImpronteContent } from "../../scripts/apply-phase348-maiora-impronte-content";
import {
  PHASE348_IMPRONTE_ID,
  PHASE348_IMPRONTE_OVERSIZE_ID,
  PHASE348_IMPRONTE_OVERSIZE_SLUG,
  PHASE348_IMPRONTE_SLUG,
  PHASE348_MAIORA_BRAND_ID,
  phase348MaioraImprontePacks,
} from "../../scripts/data/phase348-maiora-impronte";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 348 publishes Maiora and both Impronte routes on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase348-maiora-impronte-")),
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
    reviewer: "phase348-maiora-impronte-test",
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
    assert.equal(phase348MaioraImprontePacks.length, 3);
    for (const pack of phase348MaioraImprontePacks) {
      const minimum = pack.expectedType === "brand" ? 1_200 : 2_000;
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          minimum,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          5,
      );
    }
    const modelPack = phase348MaioraImprontePacks.find(
      (pack) => pack.entityId === PHASE348_IMPRONTE_ID,
    );
    assert.ok(modelPack);
    const localPath = modelPack.media[0]?.localPath;
    assert.ok(localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", localPath.replace(/^\//, "")),
      "utf8",
    );
    for (const marker of [
      /factual-svg/i,
      /product-photo="false"/i,
      /logo="false"/i,
      /to-scale="false"/i,
      /colour-proof="false"/i,
    ])
      assert.match(svg, marker);
    await assert.rejects(
      applyPhase348MaioraImpronteContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    assert.deepEqual(
      (await applyPhase348MaioraImpronteContent(client, options)).entities.map(
        (item) => [item.entityId, item.outcome],
      ),
      [
        [PHASE348_MAIORA_BRAND_ID, "published"],
        [PHASE348_IMPRONTE_ID, "published"],
        [PHASE348_IMPRONTE_OVERSIZE_ID, "published"],
      ],
    );
    const brand = (
      await client.execute({
        sql: "SELECT id,type,slug,name FROM public_entities WHERE id=?",
        args: [PHASE348_MAIORA_BRAND_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [brand?.id, brand?.type, brand?.slug, brand?.name],
      [PHASE348_MAIORA_BRAND_ID, "brand", "maiora", "Maiora 玛奥拉"],
    );
    for (const [id, slug, patterns] of [
      [
        PHASE348_IMPRONTE_ID,
        PHASE348_IMPRONTE_SLUG,
        [
          /Maiora/,
          /Impronte/,
          /树脂/,
          /#6/,
          /captured|captured converter/i,
          /转换器/,
          /三线/,
          /27/,
        ],
      ],
      [
        PHASE348_IMPRONTE_OVERSIZE_ID,
        PHASE348_IMPRONTE_OVERSIZE_SLUG,
        [
          /Maiora/,
          /Oversize/,
          /树脂/,
          /#6/,
          /JoWo/i,
          /转换器/,
          /145\.2|153\.7/,
          /32/,
        ],
      ],
    ] as const) {
      const row = (
        await client.execute({
          sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
          args: [id],
        })
      ).rows[0];
      assert.deepEqual([row?.id, row?.type, row?.slug], [id, "pen", slug]);
      const body = String(row?.body_md ?? "");
      assert.ok(body.length >= 2_000);
      for (const pattern of patterns) assert.match(body, pattern);
      assert.doesNotMatch(body, /数据库|canonical|made_by/i);
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [id, PHASE348_MAIORA_BRAND_ID],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
            args: [id],
          })
        ).rows[0]?.value,
        2,
      );
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
        10,
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
    }
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND link_type='reverse' AND target_id IN (?,?)",
          args: [
            PHASE348_MAIORA_BRAND_ID,
            PHASE348_IMPRONTE_ID,
            PHASE348_IMPRONTE_OVERSIZE_ID,
          ],
        })
      ).rows[0]?.value,
      2,
    );
    assert.deepEqual(
      (await applyPhase348MaioraImpronteContent(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
