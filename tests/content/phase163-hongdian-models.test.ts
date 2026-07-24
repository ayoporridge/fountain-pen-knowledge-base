import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase163HongdianModels } from "../../scripts/apply-phase163-hongdian-models-content";
import {
  PHASE163_HONGDIAN_BRAND_ID,
  PHASE163_IDS,
} from "../../scripts/data/phase163-hongdian-models";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGETS = [
  { id: PHASE163_HONGDIAN_BRAND_ID, slug: "hongdian", marker: /HongDian|弘典/ },
  {
    id: PHASE163_IDS.model1866,
    slug: "弘典-hongdian-1866",
    marker: /1866|木质|bubinga/i,
  },
  {
    id: PHASE163_IDS.n6,
    slug: "弘典-hongdian-n6云章",
    marker: /N6|活塞|piston/i,
  },
  {
    id: PHASE163_IDS.model620,
    slug: "弘典-hongdian-620鸡尾酒",
    marker: /620|鸡尾酒|Fude/i,
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

test("Phase 163 publishes HongDian 1866, N6 and 620 on an owned copy and replays as noop", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase163-hongdian-")),
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
    reviewer: "phase163-hongdian-test",
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
      applyPhase163HongdianModels(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase163HongdianModels(client, options);
    assert.equal(first.entities.length, 4);
    for (const target of TARGETS) {
      assert.equal(
        first.entities.find((item) => item.entityId === target.id)?.outcome,
        "published",
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT slug FROM entities WHERE id=?",
            args: [target.id],
          })
        ).rows[0]?.slug,
        target.slug,
      );
      const body = String(
        (
          await client.execute({
            sql: "SELECT body_md FROM public_entities WHERE id=?",
            args: [target.id],
          })
        ).rows[0]?.body_md ?? "",
      );
      assert.ok(
        Array.from(body).length >=
          (target.id === PHASE163_HONGDIAN_BRAND_ID ? 1_200 : 2_000),
      );
      assert.match(body, target.marker);
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      if (target.id !== PHASE163_HONGDIAN_BRAND_ID) {
        assert.equal(
          await scalar(
            client,
            "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            [target.id, PHASE163_HONGDIAN_BRAND_ID],
          ),
          1,
        );
        assert.equal(
          await scalar(
            client,
            "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            [PHASE163_HONGDIAN_BRAND_ID, target.id],
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
      }
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
    assert.ok(
      (await applyPhase163HongdianModels(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
