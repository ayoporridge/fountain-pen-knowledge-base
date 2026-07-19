import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase52LamyPlatinumCoreContent } from "../../scripts/apply-phase52-lamy-platinum-core-content";
import {
  PHASE52_LAMY_2000_ID,
  PHASE52_LAMY_BRAND_ID,
  PHASE52_PLATINUM_3776_ID,
  PHASE52_PLATINUM_BRAND_ID,
} from "../../scripts/data/phase52-lamy-platinum-core";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 52 publishes canonical LAMY 2000 and Platinum #3776 Century with sibling boundaries", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase52-lamy-platinum-")),
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
    reviewer: "phase52-lamy-platinum-core",
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
    const result = await applyPhase52LamyPlatinumCoreContent(client, options);
    assert.deepEqual(
      result.entities.map((entity) => entity.outcome),
      ["published", "published", "published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?)",
        [
          PHASE52_LAMY_BRAND_ID,
          PHASE52_LAMY_2000_ID,
          PHASE52_PLATINUM_BRAND_ID,
          PHASE52_PLATINUM_3776_ID,
        ],
      ),
      4,
    );
    for (const [id, slug, brandId] of [
      [PHASE52_LAMY_2000_ID, "lamy-2000", PHASE52_LAMY_BRAND_ID],
      [
        PHASE52_PLATINUM_3776_ID,
        "platinum-3776-century",
        PHASE52_PLATINUM_BRAND_ID,
      ],
    ] as const) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entities WHERE id = ? AND slug = ?",
          [id, slug],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, brandId],
        ),
        1,
      );
      const media = await client.execute({
        sql: "SELECT local_path, usage_status FROM media_assets WHERE entity_id = ?",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.equal(media.rows[0]?.usage_status, "primary");
      const localPath = String(media.rows[0]?.local_path ?? "");
      assert.match(
        fs.readFileSync(path.join(ROOT, "public", localPath.slice(1)), "utf8"),
        /示意图，非产品照片/,
      );
    }
    const redirects = await client.execute({
      sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path IN (?, ?) ORDER BY source_path",
      args: ["/pen/凌美-lamy-lamy-2000", "/pen/白金-platinum-3776-century"],
    });
    assert.deepEqual(redirects.rows, [
      {
        source_path: "/pen/凌美-lamy-lamy-2000",
        target_path: "/pen/lamy-2000",
        redirect_kind: "permanent",
      },
      {
        source_path: "/pen/白金-platinum-3776-century",
        target_path: "/pen/platinum-3776-century",
        redirect_kind: "permanent",
      },
    ]);
    const variants = await client.execute({
      sql: "SELECT model_entity_id, variant_name, notes FROM model_variants WHERE model_entity_id IN (?, ?) ORDER BY model_entity_id, variant_name",
      args: [PHASE52_LAMY_2000_ID, PHASE52_PLATINUM_3776_ID],
    });
    assert.ok(
      variants.rows.some(
        (row) =>
          String(row.variant_name).includes("2000 M") &&
          String(row.notes).includes("54 g"),
      ),
    );
    assert.ok(
      variants.rows.some(
        (row) =>
          String(row.variant_name).includes("Ver.2.0") &&
          String(row.notes).includes("超过三年"),
      ),
    );
    assert.ok(
      variants.rows.some(
        (row) =>
          String(row.variant_name).includes("Travia") &&
          String(row.notes).includes("29.3 g"),
      ),
    );
    const before = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?) ORDER BY entity_id",
      args: [PHASE52_LAMY_2000_ID, PHASE52_PLATINUM_3776_ID],
    });
    const replay = await applyPhase52LamyPlatinumCoreContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const after = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?) ORDER BY entity_id",
      args: [PHASE52_LAMY_2000_ID, PHASE52_PLATINUM_3776_ID],
    });
    assert.deepEqual(after.rows, before.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
