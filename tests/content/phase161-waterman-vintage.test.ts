import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase161WatermanVintage } from "../../scripts/apply-phase161-waterman-vintage-content";
import {
  PHASE161_IDS,
  PHASE161_WATERMAN_BRAND_ID,
} from "../../scripts/data/phase161-waterman-vintage";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGETS = [
  {
    id: PHASE161_IDS.hundredYear,
    slug: "waterman-s-hundred-year-pen",
    marker: /Hundred Year|No\.17|Lucite|百年/,
  },
  {
    id: PHASE161_IDS.inkVue,
    slug: "waterman-s-ink-vue",
    marker: /Ink-Vue|Tip-Fill|透明 barrel|bulb/,
  },
  {
    id: PHASE161_IDS.xPen,
    slug: "waterman-s-x-pen",
    marker: /X-Pen|capillary|wick|毛细/,
  },
] as const;

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 161 publishes Waterman Hundred Year, Ink-Vue and X-Pen on an owned copy and replays as noop", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase161-waterman-")),
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
    reviewer: "phase161-waterman-test",
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
      applyPhase161WatermanVintage(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase161WatermanVintage(client, options);
    assert.equal(first.entities.length, 4);
    for (const target of TARGETS) {
      assert.equal(
        first.entities.find((item) => item.entityId === target.id)?.outcome,
        "published",
      );
      const entity = await client.execute({
        sql: "SELECT slug FROM entities WHERE id=?",
        args: [target.id],
      });
      assert.equal(entity.rows[0]?.slug, target.slug);
      const publicRow = await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [target.id],
      });
      assert.equal(publicRow.rows.length, 1);
      const body = String(publicRow.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2_000);
      assert.match(body, target.marker);
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          [target.id, PHASE161_WATERMAN_BRAND_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          [PHASE161_WATERMAN_BRAND_ID, target.id],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          [target.id],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE entity_id=?",
          [target.id],
        ),
        1,
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
    const second = await applyPhase161WatermanVintage(client, options);
    assert.ok(second.entities.every((item) => item.outcome === "noop"));
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
