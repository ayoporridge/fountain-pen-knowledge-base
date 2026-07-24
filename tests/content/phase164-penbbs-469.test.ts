import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase164PenBbs469 } from "../../scripts/apply-phase164-penbbs-469-content";
import {
  PHASE164_PENBBS_BRAND_ID,
  PHASE164_PENBBS_ID,
} from "../../scripts/data/phase164-penbbs-469";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 164 publishes PenBBS 469 on an owned copy and replays as noop", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase164-penbbs-")),
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
    reviewer: "phase164-penbbs-test",
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
      applyPhase164PenBbs469(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase164PenBbs469(client, options);
    assert.equal(first.entities.length, 2);
    for (const target of [PHASE164_PENBBS_BRAND_ID, PHASE164_PENBBS_ID]) {
      assert.equal(
        first.entities.find((item) => item.entityId === target)?.outcome,
        "published",
      );
      const body = String(
        (
          await client.execute({
            sql: "SELECT body_md FROM public_entities WHERE id=?",
            args: [target],
          })
        ).rows[0]?.body_md ?? "",
      );
      assert.ok(
        Array.from(body).length >=
          (target === PHASE164_PENBBS_BRAND_ID ? 1_200 : 2_000),
      );
      assert.match(
        body,
        target === PHASE164_PENBBS_ID ? /469|双端|eyedropper/i : /PenBBS|坛笔/,
      );
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT status FROM entity_publications WHERE entity_id=?",
            args: [target],
          })
        ).rows[0]?.status,
        "published",
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE164_PENBBS_ID, PHASE164_PENBBS_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE164_PENBBS_BRAND_ID, PHASE164_PENBBS_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE entity_id=?",
        [PHASE164_PENBBS_ID],
      ),
      1,
    );
    assert.ok(
      (await applyPhase164PenBbs469(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
