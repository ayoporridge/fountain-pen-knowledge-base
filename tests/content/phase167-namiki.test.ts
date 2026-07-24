import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase167Namiki } from "../../scripts/apply-phase167-namiki-content";
import {
  PHASE167_IDS,
  PHASE167_NAMIKI_BRAND_ID,
  PHASE167_OLD_SLUGS,
  PHASE167_SLUGS,
} from "../../scripts/data/phase167-namiki";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 167 publishes Namiki collection entries on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase167-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(root, "catalog.db"),
    root,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase167-namiki-test",
    databasePath: copy.destinationPath,
    ownedRoot: root,
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
    await assert.rejects(
      applyPhase167Namiki(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase167Namiki(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [
        PHASE167_NAMIKI_BRAND_ID,
        PHASE167_IDS.emperor,
        PHASE167_IDS.yukariRoyale,
        PHASE167_IDS.risingDragon,
      ],
    );
    for (const [id, minLength, marker] of [
      [PHASE167_NAMIKI_BRAND_ID, 1200, /Namiki/i],
      [PHASE167_IDS.emperor, 2000, /Emperor|No\.50/i],
      [PHASE167_IDS.yukariRoyale, 2000, /Yukari Royale|Urushi/i],
      [PHASE167_IDS.risingDragon, 2000, /Rising Dragon|Nobori Ryu/i],
    ] as const) {
      assert.equal(
        first.entities.find((item) => item.entityId === id)?.outcome,
        "published",
      );
      const row = await client.execute({
        sql: "SELECT slug,body_md,source FROM public_entities WHERE id=?",
        args: [id],
      });
      const body = String(row.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= minLength, `${id} body too short`);
      assert.match(body, marker);
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.match(
        String(row.rows[0]?.source ?? ""),
        /curated-content:phase167-namiki/,
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
    assert.equal(
      (
        await client.execute({
          sql: "SELECT slug FROM entities WHERE id=?",
          args: [PHASE167_IDS.emperor],
        })
      ).rows[0]?.slug,
      PHASE167_SLUGS.emperor,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT slug FROM entities WHERE id=?",
          args: [PHASE167_IDS.yukariRoyale],
        })
      ).rows[0]?.slug,
      PHASE167_SLUGS.yukariRoyale,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT slug FROM entities WHERE id=?",
          args: [PHASE167_IDS.risingDragon],
        })
      ).rows[0]?.slug,
      PHASE167_SLUGS.risingDragon,
    );
    for (const [id, oldSlug, slug] of [
      [
        PHASE167_IDS.emperor,
        PHASE167_OLD_SLUGS.emperor,
        PHASE167_SLUGS.emperor,
      ],
      [
        PHASE167_IDS.yukariRoyale,
        PHASE167_OLD_SLUGS.yukariRoyale,
        PHASE167_SLUGS.yukariRoyale,
      ],
      [
        PHASE167_IDS.risingDragon,
        PHASE167_OLD_SLUGS.risingDragon,
        PHASE167_SLUGS.risingDragon,
      ],
    ] as const) {
      const redirect = await client.execute({
        sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
        args: [`/pen/${oldSlug}`],
      });
      assert.deepEqual(
        redirect.rows.map((row) => [
          String(row.target_path),
          String(row.redirect_kind),
        ]),
        [[`/pen/${slug}`, "permanent"]],
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [id, PHASE167_NAMIKI_BRAND_ID],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE167_NAMIKI_BRAND_ID, id],
          })
        ).rows[0]?.value,
        1,
      );
    }
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id IN (?,?,?,?) AND usage_status='primary'",
          args: [
            PHASE167_NAMIKI_BRAND_ID,
            PHASE167_IDS.emperor,
            PHASE167_IDS.yukariRoyale,
            PHASE167_IDS.risingDragon,
          ],
        })
      ).rows[0]?.value,
      4,
    );
    assert.ok(
      (await applyPhase167Namiki(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
