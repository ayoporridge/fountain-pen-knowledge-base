import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase340PelikanM700ToledoContent } from "../../scripts/apply-phase340-pelikan-m700-toledo-content";
import {
  PHASE340_M700_ID,
  PHASE340_M700_SLUG,
  PHASE340_PELIKAN_ID,
  phase340PelikanM700ToledoPacks,
} from "../../scripts/data/phase340-pelikan-m700-toledo";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 340 publishes Pelikan Souverän M700 Toledo on an owned copy", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const protectedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase340-pelikan-protected-")),
  );
  const protectedCopy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(protectedRoot, "protected.db"),
    protectedRoot,
    { expectedSourceSnapshot: realSnapshot },
  );
  const snapshot = protectedCopy.destinationSnapshot;
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase340-pelikan-owned-")),
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
    reviewer: "phase340-pelikan-m700-toledo-test",
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
    assert.equal(phase340PelikanM700ToledoPacks.length, 2);
    const pack = phase340PelikanM700ToledoPacks.find(
      (item) => item.entityId === PHASE340_M700_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        2_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 6,
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
    const genericBefore = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE slug='pelikan-toledo'",
        args: [],
      })
    ).rows[0];
    assert.deepEqual(
      [genericBefore?.type, genericBefore?.slug, genericBefore?.name],
      ["pen", "pelikan-toledo", "百利金 Pelikan Toledo"],
    );
    await assert.rejects(
      () =>
        applyPhase340PelikanM700ToledoContent(client, {
          ...options,
          env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
        }),
      /inherited remote database selection/,
    );
    const first = await applyPhase340PelikanM700ToledoContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE340_PELIKAN_ID, PHASE340_M700_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE340_M700_ID)
        ?.outcome,
      "published",
    );
    assert.ok(["published", "noop"].includes(first.entities[0]?.outcome ?? ""));

    const row = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE340_M700_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [row?.id, row?.type, row?.slug, row?.name],
      [
        PHASE340_M700_ID,
        "pen",
        PHASE340_M700_SLUG,
        "Pelikan Souverän M700 Toledo",
      ],
    );
    const body = String(row?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /M700/,
      /M710/,
      /M900/,
      /18 ct/,
      /活塞/,
      /Old Style/,
      /维护/,
      /选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /数据库|canonical|made_by/i);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE340_M700_ID, PHASE340_PELIKAN_ID],
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
            args: [PHASE340_PELIKAN_ID, PHASE340_M700_ID],
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
            args: [PHASE340_M700_ID],
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
            args: [PHASE340_M700_ID],
          })
        ).rows[0]?.value,
      ) >= 10,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [PHASE340_M700_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    const hash = await computePublicationContentHash(client, PHASE340_M700_ID);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE340_M700_ID, hash],
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
          args: [PHASE340_M700_ID],
        })
      ).rows[0]?.status,
      "published",
    );
    const genericAfter = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE slug='pelikan-toledo'",
        args: [],
      })
    ).rows[0];
    assert.deepEqual(genericAfter, genericBefore);
    const replay = await applyPhase340PelikanM700ToledoContent(client, options);
    assert.ok(replay.entities.every((item) => item.outcome === "noop"));
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
