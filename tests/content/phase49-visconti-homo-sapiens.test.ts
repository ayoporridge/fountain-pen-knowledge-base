import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase49ViscontiHomoSapiensContent } from "../../scripts/apply-phase49-visconti-homo-sapiens-content";
import {
  PHASE49_CRYSTAL_DREAM_ID,
  PHASE49_DARK_CRYSTAL_ID,
  PHASE49_LAVA_BRONZE_ID,
  PHASE49_LAVA_COLOR_ID,
  PHASE49_LAVA_DARK_AGE_ID,
  PHASE49_VISCONTI_BRAND_ID,
  PHASE49_VISCONTI_OLD_HOMO_ID,
} from "../../scripts/data/phase49-visconti-homo-sapiens";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PEN_IDS = [
  PHASE49_LAVA_BRONZE_ID,
  PHASE49_LAVA_DARK_AGE_ID,
  PHASE49_LAVA_COLOR_ID,
  PHASE49_CRYSTAL_DREAM_ID,
  PHASE49_DARK_CRYSTAL_ID,
];
async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 49 publishes five concrete Visconti Homo Sapiens siblings and retires the generic page on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase49-visconti-homo-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase49-visconti-homo-sapiens",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL_CATALOG,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    const result = await applyPhase49ViscontiHomoSapiensContent(
      client,
      options,
    );
    assert.deepEqual(
      result.entities.map((entity) => entity.outcome),
      [
        "published",
        "published",
        "published",
        "published",
        "published",
        "published",
      ],
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value FROM public_entities WHERE id IN (${[PHASE49_VISCONTI_BRAND_ID, ...PEN_IDS].map(() => "?").join(",")})`,
        [PHASE49_VISCONTI_BRAND_ID, ...PEN_IDS],
      ),
      6,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id = ?",
        [PHASE49_VISCONTI_OLD_HOMO_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_publications WHERE entity_id = ? AND status = 'retired'",
        [PHASE49_VISCONTI_OLD_HOMO_ID],
      ),
      1,
    );
    const redirect = await client.execute({
      sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
      args: ["/pen/维斯康蒂-visconti-homo-sapiens智人"],
    });
    assert.deepEqual(redirect.rows, [
      { target_path: "/brand/visconti", redirect_kind: "permanent" },
    ]);
    for (const id of PEN_IDS) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, PHASE49_VISCONTI_BRAND_ID],
        ),
        1,
      );
      const media = await client.execute({
        sql: "SELECT local_path, usage_status FROM media_assets WHERE entity_id = ?",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.equal(media.rows[0]?.usage_status, "primary");
      assert.match(
        fs.readFileSync(
          path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
          "utf8",
        ),
        /示意图，非产品照片/,
      );
    }
    const before = await client.execute({
      sql: `SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (${[PHASE49_VISCONTI_BRAND_ID, ...PEN_IDS].map(() => "?").join(",")}) ORDER BY entity_id`,
      args: [PHASE49_VISCONTI_BRAND_ID, ...PEN_IDS],
    });
    const replay = await applyPhase49ViscontiHomoSapiensContent(
      client,
      options,
    );
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const after = await client.execute({
      sql: `SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (${[PHASE49_VISCONTI_BRAND_ID, ...PEN_IDS].map(() => "?").join(",")}) ORDER BY entity_id`,
      args: [PHASE49_VISCONTI_BRAND_ID, ...PEN_IDS],
    });
    assert.deepEqual(after.rows, before.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
