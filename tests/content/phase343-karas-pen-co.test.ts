import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase343KarasPenCoContent } from "../../scripts/apply-phase343-karas-pen-co-content";
import {
  PHASE343_KARAS_BRAND_ID,
  PHASE343_KARAS_IDS,
  PHASE343_KARAS_SLUGS,
  phase343KarasPenCoPacks,
} from "../../scripts/data/phase343-karas-pen-co";
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
    id: PHASE343_KARAS_IDS.ink,
    slug: PHASE343_KARAS_SLUGS.ink,
    name: "Karas Pen Co INK Fountain Pen",
    patterns: [
      /2024 relaunch|2024/,
      /Bock/i,
      /Schmidt K5|短国际墨囊/,
      /Sta-Fast|triple-start/i,
    ],
  },
  {
    id: PHASE343_KARAS_IDS.vertex,
    slug: PHASE343_KARAS_SLUGS.vertex,
    name: "Karas Pen Co Vertex Fountain Pen",
    patterns: [/Vertex/, /o-ring/i, /eyedropper|滴入/, /133\.3 mm/],
  },
  {
    id: PHASE343_KARAS_IDS.decograph,
    slug: PHASE343_KARAS_SLUGS.decograph,
    name: "Karas Pen Co Decograph Fountain Pen",
    patterns: [
      /Signature Series/,
      /semi-retirement|半退休/,
      /Bock #6|Bock/,
      /137\.27 mm/,
    ],
  },
] as const;

test("Phase 343 publishes Karas Pen Co and three fountain pen routes on an owned copy", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const protectedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase343-karas-protected-")),
  );
  const protectedCopy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(protectedRoot, "protected.db"),
    protectedRoot,
    { expectedSourceSnapshot: realSnapshot },
  );
  const snapshot = protectedCopy.destinationSnapshot;
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase343-karas-owned-")),
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
    reviewer: "phase343-karas-pen-co-test",
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
    assert.equal(phase343KarasPenCoPacks.length, 4);
    for (const pack of phase343KarasPenCoPacks) {
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
        applyPhase343KarasPenCoContent(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /inherited remote database selection/,
    );
    const first = await applyPhase343KarasPenCoContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE343_KARAS_BRAND_ID, ...TARGETS.map((target) => target.id)],
    );
    assert.ok(first.entities.every((item) => item.outcome === "published"));
    const brand = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE343_KARAS_BRAND_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [brand?.id, brand?.type, brand?.slug, brand?.name],
      [PHASE343_KARAS_BRAND_ID, "brand", "karas-pen-co", "Karas Pen Co"],
    );
    assert.ok(String(brand?.body_md ?? "").length >= 2_000);
    assert.match(String(brand?.body_md ?? ""), /Mesa/);
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
              args: [target.id, PHASE343_KARAS_BRAND_ID],
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
              args: [PHASE343_KARAS_BRAND_ID, target.id],
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
      (await applyPhase343KarasPenCoContent(client, options)).entities.map(
        (item) => item.outcome,
      ),
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
