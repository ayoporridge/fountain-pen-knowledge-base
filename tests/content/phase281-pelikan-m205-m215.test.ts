import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase281PelikanM205M215Content } from "../../scripts/apply-phase281-pelikan-m205-m215-content";
import {
  PHASE281_M205_ID,
  PHASE281_M215_ID,
  PHASE281_PELIKAN_ID,
  phase281PelikanM205M215Packs,
} from "../../scripts/data/phase281-pelikan-m205-m215";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 281 publishes Pelikan M205 and M215 on an owned copy", {
  timeout: 1_200_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const protectedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase281-pelikan-protected-")),
  );
  const protectedCopy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(protectedRoot, "protected.db"),
    protectedRoot,
    { expectedSourceSnapshot: realSnapshot },
  );
  const snapshot = protectedCopy.destinationSnapshot;
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase281-pelikan-owned-")),
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
    reviewer: "phase281-pelikan-m205-m215-test",
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
    assert.equal(phase281PelikanM205M215Packs.length, 3);
    for (const id of [PHASE281_M205_ID, PHASE281_M215_ID]) {
      const pack = phase281PelikanM205M215Packs.find(
        (item) => item.entityId === id,
      );
      assert.ok(pack);
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          2_000,
      );
      assert.equal(
        new Set(pack.sources.map((source) => source.independenceGroup)).size,
        6,
      );
      const mediaPath = pack.media[0]?.localPath;
      assert.ok(mediaPath);
      const svg = fs.readFileSync(
        path.join(ROOT, "public", mediaPath.replace(/^\//, "")),
        "utf8",
      );
      for (const marker of [
        /非产品照片/,
        /非品牌 Logo/,
        /非比例图/,
        /非颜色校样/,
      ])
        assert.match(svg, marker);
    }
    await assert.rejects(
      () =>
        applyPhase281PelikanM205M215Content(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase281PelikanM205M215Content(client, options);
    const expectedOutcomes = [
      [PHASE281_PELIKAN_ID, "published"],
      [PHASE281_M205_ID, "published"],
      [PHASE281_M215_ID, "published"],
    ];
    if (
      JSON.stringify(
        first.entities.map((item) => [item.entityId, item.outcome]),
      ) !== JSON.stringify(expectedOutcomes)
    )
      throw new Error(
        `Unexpected Phase 281 outcomes: ${JSON.stringify(first)}`,
      );
    for (const [id, patterns] of [
      [PHASE281_M205_ID, [/M205/, /抛光不锈钢尖/, /活塞/, /P205/]],
      [PHASE281_M215_ID, [/M215/, /黄铜笔杆/, /20\.0 g|20 g/, /活塞/]],
    ] as const) {
      const row = (
        await client.execute({
          sql: "SELECT type,slug,name,body_md FROM public_entities WHERE id=?",
          args: [id],
        })
      ).rows[0];
      assert.equal(row?.type, "pen");
      assert.equal(
        row?.name,
        id === PHASE281_M205_ID ? "Pelikan M205" : "Pelikan M215",
      );
      const body = String(row?.body_md ?? "");
      assert.ok(body.length >= 2_000);
      for (const pattern of patterns) assert.match(body, pattern);
      assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
              args: [id],
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
              args: [id],
            })
          ).rows[0]?.value,
        ),
        9,
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
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              args: [id, PHASE281_PELIKAN_ID],
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
              args: [PHASE281_PELIKAN_ID, id],
            })
          ).rows[0]?.value,
        ),
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT status FROM entity_publications WHERE entity_id=?",
            args: [id],
          })
        ).rows[0]?.status,
        "published",
      );
    }
    assert.ok(
      (
        await applyPhase281PelikanM205M215Content(client, options)
      ).entities.every((item) => item.outcome === "noop"),
    );
  } finally {
    client.close();
    try {
      assert.deepEqual(
        snapshotCatalogFiles(protectedCopy.destinationPath),
        snapshot,
      );
      const realAfter = snapshotCatalogFiles(REAL);
      assert.deepEqual(realAfter.main, realSnapshot.main);
      assert.deepEqual(realAfter.wal, realSnapshot.wal);
    } finally {
      fs.rmSync(protectedRoot, { recursive: true, force: true });
      fs.rmSync(ownedRoot, { recursive: true, force: true });
    }
  }
});
