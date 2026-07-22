import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase139Options,
  applyPhase139GermanSwissCurrentBatchContent,
} from "../../scripts/apply-phase139-german-swiss-current-batch-content";
import {
  loadPhase139Packs,
  PHASE139_BRANDS,
  PHASE139_IDS,
  phase139Groups,
} from "../../scripts/data/phase139-german-swiss-current-batch";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

test("Phase 139 publishes a fourteen-pack German/Swiss current-model batch on one owned copy", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const realBefore = JSON.stringify(protectedSnapshot);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase139-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase139Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase139-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
  try {
    await migrateDatabase(client);
    const packs = loadPhase139Packs(ROOT_CANONICAL);
    assert.equal(packs.length, 14);
    assert.equal(
      packs.filter((pack) => pack.expectedType === "brand").length,
      5,
    );
    assert.equal(packs.filter((pack) => pack.expectedType === "pen").length, 9);
    assert.equal(new Set(packs.map((pack) => pack.entityId)).size, 14);
    assert.equal(
      new Set(packs.map((pack) => pack.media[0]?.localPath)).size,
      14,
    );
    for (const pack of packs) {
      assert.equal(
        Array.from(pack.bodyMd).length >=
          (pack.expectedType === "brand" ? 1_200 : 2_000),
        true,
        pack.entityId,
      );
      assert.equal(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          2,
        true,
        pack.entityId,
      );
      const mediaPath = pack.media[0]?.localPath;
      assert.ok(mediaPath);
      const mediaFile = path.join(
        ROOT_CANONICAL,
        "public",
        mediaPath.replace(/^\//, ""),
      );
      assert.equal(fs.statSync(mediaFile).size > 0, true);
      if (mediaPath.endsWith(".svg")) {
        const svg = fs.readFileSync(mediaFile, "utf8").toLowerCase();
        assert.match(svg, /1600/);
        assert.match(svg, /900/);
        if (!mediaPath.includes("/phase139/")) continue;
        assert.match(svg, /not a product photo|non-photo/);
        assert.match(svg, /not to scale|not-to-scale/);
      }
    }

    await assert.rejects(
      applyPhase139GermanSwissCurrentBatchContent(client, {
        ...options,
        reviewer: " ",
      }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase139GermanSwissCurrentBatchContent(client, {
        ...options,
        env: {
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "",
          TURSO_AUTH_TOKEN: "",
          FPKG_DATABASE_URL: "libsql://remote",
        },
      }),
      /refuses inherited remote/,
    );
    await assert.rejects(
      applyPhase139GermanSwissCurrentBatchContent(client, {
        ...options,
        workspaceRoot: os.tmpdir(),
      }),
      /verified CodeBuddy\/Documents repo pair|ENOENT/,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            `SELECT count(*) n FROM entities WHERE id IN (${Object.values(
              PHASE139_IDS,
            )
              .map(() => "?")
              .join(",")},?)`,
            [...Object.values(PHASE139_IDS), PHASE139_BRANDS.caran],
          )
        )[0]?.n,
      ),
      0,
    );

    const first = await applyPhase139GermanSwissCurrentBatchContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      packs.map((pack) => [pack.entityId, "published"]),
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            `SELECT count(*) n FROM public_entities WHERE id IN (${packs.map(() => "?").join(",")})`,
            packs.map((pack) => pack.entityId),
          )
        )[0]?.n,
      ),
      14,
    );

    for (const pack of packs) {
      const current = await computePublicationContentHash(
        client,
        pack.entityId,
      );
      assert.deepEqual(
        (
          await rows(
            client,
            "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            [pack.entityId, current],
          )
        ).map((row) => [row.review_kind, row.status]),
        [
          ["fact", "approved"],
          ["language", "approved"],
          ["media", "approved"],
          ["publication", "approved"],
        ],
      );
      assert.equal(
        String(
          (
            await rows(client, "SELECT source FROM entities WHERE id=?", [
              pack.entityId,
            ])
          )[0]?.source,
        ),
        pack.sourceMarker,
      );
    }
    for (const group of phase139Groups) {
      const reverseTargets = (
        await rows(
          client,
          "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
          [group.brand.entityId],
        )
      ).map((row) => String(row.target_id));
      for (const pen of group.pens) {
        assert.equal(
          reverseTargets.filter((target) => target === pen.entityId).length,
          1,
        );
      }
    }

    const second = await applyPhase139GermanSwissCurrentBatchContent(
      client,
      options,
    );
    assert.deepEqual(
      second.entities.map((item) => item.outcome),
      Array(14).fill("noop"),
    );
    assert.deepEqual(
      second.entities.map((item) => item.contentHash),
      first.entities.map((item) => item.contentHash),
    );

    await client.execute({
      sql: "UPDATE entities SET source='tampered' WHERE id=?",
      args: [PHASE139_IDS.essentio],
    });
    await assert.rejects(
      applyPhase139GermanSwissCurrentBatchContent(client, options),
      /partial or tampered/,
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    assert.equal(JSON.stringify(snapshotCatalogFiles(REAL)), realBefore);
  } finally {
    clearInterval(keepAlive);
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
