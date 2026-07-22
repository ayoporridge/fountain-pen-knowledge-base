import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase99ConklinHistoricContent } from "../../scripts/apply-phase99-conklin-historic-content";
import { applyPhase136ConklinDuragraphContent } from "../../scripts/apply-phase136-conklin-duragraph-content";
import {
  type ApplyPhase137Options,
  applyPhase137ConklinContemporaryBatchContent,
} from "../../scripts/apply-phase137-conklin-contemporary-batch-content";
import {
  loadPhase137ConklinPacks,
  PHASE137_CONKLIN_BRAND_ID,
  PHASE137_PROTECTED_PEN_IDS,
  phase137MadeById,
  phase137ReverseId,
} from "../../scripts/data/phase137-conklin-contemporary-batch";
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

async function digest(client: Client, entityId: string, topology = true) {
  const queries = [
    "SELECT * FROM entities WHERE id=?",
    "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
    "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
    "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    ...(topology
      ? [
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          "SELECT * FROM entity_publications WHERE entity_id=?",
          "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
        ]
      : []),
  ];
  const payload = [];
  for (const sql of queries)
    payload.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

test("Phase 137 publishes four contemporary Conklin models in one owned batch", {
  timeout: 240_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const realBefore = JSON.stringify(protectedSnapshot);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase137-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase137Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase137-test",
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
    await applyPhase99ConklinHistoricContent(client, options);
    await applyPhase136ConklinDuragraphContent(client, options);

    const packs = loadPhase137ConklinPacks(ROOT_CANONICAL);
    assert.equal(packs.length, 4);
    assert.deepEqual(
      packs.map((pack) =>
        pack.sources.some((source) => source.tier === "professional_secondary"),
      ),
      [true, true, true, true],
    );
    assert.deepEqual(
      packs.map((pack) => Array.from(pack.bodyMd).length >= 2_000),
      [true, true, true, true],
    );
    assert.deepEqual(
      packs.map((pack) => pack.media.length),
      [1, 1, 1, 1],
    );
    assert.deepEqual(
      packs.map((pack) => pack.scopes.length),
      [2, 2, 2, 2],
    );
    for (const pack of packs) {
      assert.match(pack.bodyMd, /\/brand\/conklin/);
      assert.equal(
        pack.spec?.evidence.some((item) => item.qualifies === false),
        true,
      );
      assert.equal(
        pack.conflicts?.every((item) => item.status === "resolved"),
        true,
      );
      const mediaPath = pack.media[0]?.localPath;
      assert.ok(mediaPath);
      const svg = fs.readFileSync(
        path.join(ROOT_CANONICAL, "public", mediaPath.replace(/^\//, "")),
        "utf8",
      );
      for (const token of [
        "1600",
        "900",
        "non-photo",
        "non-logo",
        "not-to-scale",
        "non-colour-proof",
      ])
        assert.match(svg.toLowerCase(), new RegExp(token));
    }

    for (const [changed, expected] of [
      [{ ...options, reviewer: " " }, /reviewer must not be empty/],
      [
        {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        },
        /refuses inherited remote/,
      ],
      [
        { ...options, workspaceRoot: os.tmpdir() },
        /verified CodeBuddy\/Documents repo pair/,
      ],
    ] as Array<[ApplyPhase137Options, RegExp]>) {
      await assert.rejects(
        applyPhase137ConklinContemporaryBatchContent(client, changed),
        expected,
      );
      assert.equal(
        Number(
          (
            await rows(
              client,
              `SELECT count(*) n FROM entities WHERE id IN (${packs.map(() => "?").join(",")})`,
              packs.map((pack) => pack.entityId),
            )
          )[0]?.n,
        ),
        0,
      );
    }

    const protectedControl = path.join(ownedRoot, "protected-control.db");
    const hardlink = path.join(ownedRoot, "protected-hardlink.db");
    fs.copyFileSync(REAL, protectedControl);
    fs.linkSync(protectedControl, hardlink);
    const hardlinkClient = createClient({ url: `file:${hardlink}` });
    try {
      await assert.rejects(
        applyPhase137ConklinContemporaryBatchContent(hardlinkClient, {
          ...options,
          databasePath: hardlink,
          protectedCatalogPath: protectedControl,
          protectedCatalogSnapshot: snapshotCatalogFiles(protectedControl),
        }),
        /hard-link aliases/,
      );
    } finally {
      hardlinkClient.close();
      fs.unlinkSync(hardlink);
      fs.unlinkSync(protectedControl);
    }

    const oldBefore = new Map<string, string>();
    for (const id of PHASE137_PROTECTED_PEN_IDS)
      oldBefore.set(id, await digest(client, id));
    const brandPayloadBefore = await digest(
      client,
      PHASE137_CONKLIN_BRAND_ID,
      false,
    );
    const reverseBefore = await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE137_CONKLIN_BRAND_ID],
    );

    const first = await applyPhase137ConklinContemporaryBatchContent(
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
      4,
    );
    for (const pack of packs) {
      assert.deepEqual(
        await rows(
          client,
          "SELECT id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id",
          [pack.entityId, pack.entityId],
        ),
        [
          { id: phase137MadeById(pack.entityId), link_type: "made_by" },
          { id: phase137ReverseId(pack.entityId), link_type: "reverse" },
        ].sort((a, b) => a.id.localeCompare(b.id)),
      );
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
        ).map((item) => [item.review_kind, item.status]),
        [
          ["fact", "approved"],
          ["language", "approved"],
          ["media", "approved"],
          ["publication", "approved"],
        ],
      );
    }
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
          [PHASE137_CONKLIN_BRAND_ID],
        )
      ).map((item) => String(item.target_id)),
      reverseBefore
        .map((item) => String(item.target_id))
        .concat(packs.map((pack) => pack.entityId))
        .sort(),
    );
    for (const [id, before] of oldBefore)
      assert.equal(await digest(client, id), before);
    assert.equal(
      await digest(client, PHASE137_CONKLIN_BRAND_ID, false),
      brandPayloadBefore,
    );

    const second = await applyPhase137ConklinContemporaryBatchContent(
      client,
      options,
    );
    assert.deepEqual(
      second.entities.map((item) => item.outcome),
      ["noop", "noop", "noop", "noop"],
    );
    assert.deepEqual(
      second.entities.map((item) => item.contentHash),
      first.entities.map((item) => item.contentHash),
    );
    for (const [id, before] of oldBefore)
      assert.equal(await digest(client, id), before);
    assert.equal(
      await digest(client, PHASE137_CONKLIN_BRAND_ID, false),
      brandPayloadBefore,
    );

    const tamperTarget = packs[0];
    assert.ok(tamperTarget);
    await client.execute({
      sql: "UPDATE entities SET source='tampered' WHERE id=?",
      args: [tamperTarget.entityId],
    });
    await assert.rejects(
      applyPhase137ConklinContemporaryBatchContent(client, options),
      /partial, alternate or colliding/,
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    assert.equal(JSON.stringify(snapshotCatalogFiles(REAL)), realBefore);
  } finally {
    clearInterval(keepAlive);
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
