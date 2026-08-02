import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase341CleoSkribentClassicContent } from "../../scripts/apply-phase341-cleo-skribent-classic-content";
import {
  PHASE341_CLEO_BRAND_ID,
  PHASE341_CLEO_IDS,
  PHASE341_CLEO_SLUGS,
  phase341CleoSkribentClassicPacks,
} from "../../scripts/data/phase341-cleo-skribent-classic";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGETS = [
  {
    id: PHASE341_CLEO_IDS.gold,
    slug: PHASE341_CLEO_SLUGS.gold,
    name: "Cleo Skribent Classic Gold",
    patterns: [/14 K|14K/, /gold-plated|镀金/, /piston/, /cartridge|转换器/],
  },
  {
    id: PHASE341_CLEO_IDS.palladium,
    slug: PHASE341_CLEO_SLUGS.palladium,
    name: "Cleo Skribent Classic Palladium",
    patterns: [/Palladium|钯/, /stainless steel|钢尖/, /14 K|14K/, /墨窗|盲帽/],
  },
  {
    id: PHASE341_CLEO_IDS.metall,
    slug: PHASE341_CLEO_SLUGS.metall,
    name: "Cleo Skribent Classic Metall",
    patterns: [
      /Metall/,
      /brass cap|黄铜帽/,
      /stainless steel|钢尖/,
      /cartridge|转换器/,
    ],
  },
] as const;

test("Phase 341 publishes Cleo Skribent and three Classic routes on an owned copy", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const protectedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase341-cleo-protected-")),
  );
  const protectedCopy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(protectedRoot, "protected.db"),
    protectedRoot,
    { expectedSourceSnapshot: realSnapshot },
  );
  const snapshot = protectedCopy.destinationSnapshot;
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase341-cleo-owned-")),
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
    reviewer: "phase341-cleo-skribent-classic-test",
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
    assert.equal(phase341CleoSkribentClassicPacks.length, 4);
    for (const pack of phase341CleoSkribentClassicPacks) {
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          2_000,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          5,
      );
      const localPath = pack.media[0]?.localPath;
      assert.ok(localPath);
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.replace(/^\//, "")),
        "utf8",
      );
      for (const marker of [
        /factual-svg="true"/i,
        /product-photo="false"/i,
        /logo="false"/i,
        /to-scale="false"/i,
        /colour-proof="false"/i,
      ])
        assert.match(svg, marker);
    }
    await assert.rejects(
      () =>
        applyPhase341CleoSkribentClassicContent(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /inherited remote database selection/,
    );
    const first = await applyPhase341CleoSkribentClassicContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE341_CLEO_BRAND_ID, ...TARGETS.map((target) => target.id)],
    );
    assert.ok(first.entities.every((item) => item.outcome === "published"));
    const brand = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE341_CLEO_BRAND_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [brand?.id, brand?.type, brand?.slug, brand?.name],
      [PHASE341_CLEO_BRAND_ID, "brand", "cleo-skribent", "Cleo Skribent"],
    );
    assert.ok(String(brand?.body_md ?? "").length >= 2_000);
    assert.match(String(brand?.body_md ?? ""), /Bad Wilsnack/);
    for (const target of TARGETS) {
      const row = (
        await client.execute({
          sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
          args: [target.id],
        })
      ).rows[0];
      assert.deepEqual(
        [row?.id, row?.type, row?.slug, row?.name],
        [target.id, "pen", target.slug, target.name],
      );
      const body = String(row?.body_md ?? "");
      assert.ok(body.length >= 2_000);
      for (const pattern of target.patterns) assert.match(body, pattern);
      assert.doesNotMatch(body, /数据库|canonical|made_by/i);
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              args: [target.id, PHASE341_CLEO_BRAND_ID],
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
              args: [PHASE341_CLEO_BRAND_ID, target.id],
            })
          ).rows[0]?.value,
        ),
        1,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
              args: [target.id],
            })
          ).rows[0]?.value,
        ),
        1,
      );
      assert.ok(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
              args: [target.id],
            })
          ).rows[0]?.value,
        ) >= 10,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
              args: [target.id],
            })
          ).rows[0]?.value,
        ),
        1,
      );
      const hash = await computePublicationContentHash(client, target.id);
      assert.deepEqual(
        (
          await client.execute({
            sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            args: [target.id, hash],
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
            sql: "SELECT status FROM entity_publications WHERE entity_id=?",
            args: [target.id],
          })
        ).rows[0]?.status,
        "published",
      );
    }
    assert.deepEqual(
      (
        await applyPhase341CleoSkribentClassicContent(client, options)
      ).entities.map((item) => item.outcome),
      ["noop", "noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    try {
      assert.deepEqual(
        snapshotCatalogFiles(protectedCopy.destinationPath),
        snapshot,
      );
      assert.deepEqual(snapshotCatalogFiles(REAL).main, realSnapshot.main);
      assert.deepEqual(snapshotCatalogFiles(REAL).wal, realSnapshot.wal);
    } finally {
      fs.rmSync(protectedRoot, { recursive: true, force: true });
      fs.rmSync(ownedRoot, { recursive: true, force: true });
    }
  }
});
