import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase72DelikeDukePenBbsContent } from "../../scripts/apply-phase72-delike-duke-penbbs-content";
import {
  PHASE72_DELIKE_BRAND_ID,
  PHASE72_DELIKE_ELEMENT_ID,
  PHASE72_DELIKE_ELEMENT_RAW_SLUG,
  PHASE72_DELIKE_ELEMENT_SLUG,
  PHASE72_DUKE_551_ID,
  PHASE72_DUKE_551_RAW_SLUG,
  PHASE72_DUKE_551_SLUG,
  PHASE72_DUKE_BRAND_ID,
  PHASE72_PENBBS_268_ID,
  PHASE72_PENBBS_268_RAW_SLUG,
  PHASE72_PENBBS_268_SLUG,
  PHASE72_PENBBS_BRAND_ID,
} from "../../scripts/data/phase72-delike-duke-penbbs";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const MODELS = [
  [
    PHASE72_DELIKE_ELEMENT_ID,
    PHASE72_DELIKE_ELEMENT_SLUG,
    PHASE72_DELIKE_BRAND_ID,
  ],
  [PHASE72_DUKE_551_ID, PHASE72_DUKE_551_SLUG, PHASE72_DUKE_BRAND_ID],
  [PHASE72_PENBBS_268_ID, PHASE72_PENBBS_268_SLUG, PHASE72_PENBBS_BRAND_ID],
] as const;

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 72 publishes Delike Element, Duke 551 and PenBBS 268 on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase72-chinese-")),
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
    reviewer: "phase72-delike-duke-penbbs",
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
    const first = await applyPhase72DelikeDukePenBbsContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      [
        "published",
        "published",
        "published",
        "published",
        "published",
        "published",
      ],
    );
    for (const [id, slug, brand] of MODELS) {
      const row = await client.execute({
        sql: "SELECT type, slug, summary, body_md FROM public_entities WHERE id = ?",
        args: [id],
      });
      assert.equal(row.rows.length, 1);
      assert.equal(String(row.rows[0]?.type), "pen");
      assert.equal(String(row.rows[0]?.slug), slug);
      assert.ok(Array.from(String(row.rows[0]?.summary ?? "")).length >= 60);
      assert.ok(Array.from(String(row.rows[0]?.body_md ?? "")).length >= 2_000);
      assert.match(String(row.rows[0]?.body_md), /示意图，非产品照片/);
      assert.doesNotMatch(
        String(row.rows[0]?.body_md),
        /数据库|仓库|canonical|made_by/i,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, brand],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM model_specs WHERE entity_id = ?",
          [id],
        ),
        1,
      );
    }
    const dukeArticle = await client.execute({
      sql: "SELECT type FROM entities WHERE slug = ?",
      args: [PHASE72_DUKE_551_RAW_SLUG],
    });
    assert.deepEqual(dukeArticle.rows, [{ type: "article" }]);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE source_path IN (?, ?, ?)",
        [
          `/pen/${PHASE72_DELIKE_ELEMENT_RAW_SLUG}`,
          `/pen/${PHASE72_DUKE_551_RAW_SLUG}`,
          `/pen/${PHASE72_PENBBS_268_RAW_SLUG}`,
        ],
      ),
      0,
    );
    for (const file of [
      "delike-element.svg",
      "duke-551-confucius.svg",
      "penbbs-268.svg",
    ])
      assert.match(
        fs.readFileSync(
          path.join(
            ROOT,
            "public/images/library/site-original/delike-duke-penbbs",
            file,
          ),
          "utf8",
        ),
        /示意图，非产品照片/,
      );
    const replay = await applyPhase72DelikeDukePenBbsContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
