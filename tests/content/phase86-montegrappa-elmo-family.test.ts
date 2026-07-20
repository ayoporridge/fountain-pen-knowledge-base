import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase85MontegrappaElmoContent } from "../../scripts/apply-phase85-montegrappa-elmo-content";
import { applyPhase86MontegrappaElmoFamilyContent } from "../../scripts/apply-phase86-montegrappa-elmo-family-content";
import { PHASE85_MONTEGRAPPA_BRAND_ID } from "../../scripts/data/phase85-montegrappa-elmo";
import {
  PHASE86_ELMO_02_ID,
  PHASE86_ELMO_02_PLUS_ID,
} from "../../scripts/data/phase86-montegrappa-elmo-family";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 86 publishes Elmo 02 and Elmo 02 Plus separately on an owned catalog copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase86-montegrappa-elmo-")),
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
    reviewer: "phase86-montegrappa-elmo-test",
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
    await applyPhase85MontegrappaElmoContent(client, {
      ...options,
      reviewer: "phase86-montegrappa-prerequisite",
    });
    const first = await applyPhase86MontegrappaElmoFamilyContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );
    const pages = await client.execute({
      sql: "SELECT id, slug, body_md FROM public_entities WHERE id IN (?, ?, ?)",
      args: [
        PHASE85_MONTEGRAPPA_BRAND_ID,
        PHASE86_ELMO_02_ID,
        PHASE86_ELMO_02_PLUS_ID,
      ],
    });
    assert.equal(pages.rows.length, 3);
    const standard = pages.rows.find(
      (row) => String(row.id) === PHASE86_ELMO_02_ID,
    );
    const plus = pages.rows.find(
      (row) => String(row.id) === PHASE86_ELMO_02_PLUS_ID,
    );
    assert.match(String(standard?.body_md), /142 mm[\s\S]*17 mm[\s\S]*30 g/);
    assert.match(String(standard?.body_md), /墨囊／转换器/);
    assert.match(String(plus?.body_md), /142 mm[\s\S]*17 mm[\s\S]*37 g/);
    assert.match(String(plus?.body_md), /活塞[\s\S]*14K Flex/);
    for (const row of [standard, plus]) {
      const body = String(row?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2_000);
      assert.match(body, /示意图，非产品照片/);
      assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [String(row?.id), PHASE85_MONTEGRAPPA_BRAND_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
          [PHASE85_MONTEGRAPPA_BRAND_ID, String(row?.id)],
        ),
        1,
      );
    }
    const replay = await applyPhase86MontegrappaElmoFamilyContent(
      client,
      options,
    );
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
