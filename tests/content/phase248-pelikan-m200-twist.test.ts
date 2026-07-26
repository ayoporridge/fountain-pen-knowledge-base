import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase248PelikanM200TwistContent } from "../../scripts/apply-phase248-pelikan-m200-twist";
import {
  PHASE248_M200_ID,
  PHASE248_PELIKAN_ID,
  PHASE248_TWIST_ID,
  PHASE248_TWIST_OLD_SLUG,
  PHASE248_TWIST_SLUG,
} from "../../scripts/data/phase248-pelikan-m200-twist";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getCanonicalEntityPath } from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 248 separates Pelikan M200 and Twist content and canonicalizes the Twist route", {
  timeout: 600_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase248-pelikan-")),
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
    reviewer: "phase248-pelikan-m200-twist-test",
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
    // Force the owned fixture through the write/review path even when the
    // protected real catalog already contains this pack from a prior replay.
    await client.execute({
      sql: "UPDATE entities SET source=NULL WHERE id IN (?,?)",
      args: [PHASE248_M200_ID, PHASE248_TWIST_ID],
    });
    assert.ok(
      [PHASE248_TWIST_OLD_SLUG, PHASE248_TWIST_SLUG].includes(
        String(
          (
            await client.execute({
              sql: "SELECT slug FROM entities WHERE id=?",
              args: [PHASE248_TWIST_ID],
            })
          ).rows[0]?.slug,
        ),
      ),
    );
    await assert.rejects(
      applyPhase248PelikanM200TwistContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection/,
    );
    assert.deepEqual(
      (
        await applyPhase248PelikanM200TwistContent(client, options)
      ).entities.map((item) => item.outcome),
      ["published", "published"],
    );

    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT slug,name FROM entities WHERE id=?",
          args: [PHASE248_TWIST_ID],
        })
      ).rows[0],
      { slug: PHASE248_TWIST_SLUG, name: "百利金 Pelikan Twist" },
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
          args: [`/pen/${PHASE248_TWIST_OLD_SLUG}`],
        })
      ).rows[0],
      {
        target_path: `/pen/${PHASE248_TWIST_SLUG}`,
        redirect_kind: "permanent",
      },
    );
    assert.equal(
      getCanonicalEntityPath("pen", PHASE248_TWIST_OLD_SLUG),
      `/pen/${PHASE248_TWIST_SLUG}`,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entities WHERE type='pen' AND (slug=? OR slug=?)",
          args: [PHASE248_TWIST_OLD_SLUG, PHASE248_TWIST_SLUG],
        })
      ).rows[0]?.value,
      1,
    );

    const m200 = (
      await client.execute({
        sql: "SELECT summary,body_md FROM public_entities WHERE id=?",
        args: [PHASE248_M200_ID],
      })
    ).rows[0];
    const twist = (
      await client.execute({
        sql: "SELECT summary,body_md FROM public_entities WHERE id=?",
        args: [PHASE248_TWIST_ID],
      })
    ).rows[0];
    const m200Body = String(m200?.body_md ?? "");
    const twistBody = String(twist?.body_md ?? "");
    assert.ok(m200Body.length >= 2_000);
    assert.ok(twistBody.length >= 2_000);
    assert.match(m200Body, /Classic 200/);
    assert.match(m200Body, /活塞/);
    assert.doesNotMatch(m200Body, /## Pelikan Twist P457：/);
    assert.doesNotMatch(m200Body, /2022 官方 PBS 目录列出 P457/);
    assert.match(twistBody, /扭转三角/);
    assert.match(twistBody, /P457/);
    assert.doesNotMatch(twistBody, /## M200 的身份：/);
    assert.doesNotMatch(
      twistBody,
      /Pelikan Collectibles 的型号档案把 M200 的起点/,
    );
    assert.notEqual(m200?.summary, twist?.summary);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE248_M200_ID, PHASE248_PELIKAN_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE248_TWIST_ID, PHASE248_PELIKAN_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=?",
          args: [PHASE248_TWIST_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.deepEqual(
      (
        await applyPhase248PelikanM200TwistContent(client, options)
      ).entities.map((item) => item.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
