import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase104WancherDreamPenNavigationContent } from "../../scripts/apply-phase104-wancher-dream-pen-navigation-content";
import { applyPhase107WancherDreamPenTrueEboniteMatteBlackContent } from "../../scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content";
import { applyPhase112WancherDreamPenTitaniumBlackContent } from "../../scripts/apply-phase112-wancher-dream-pen-titanium-black-content";
import { applyPhase113WancherDreamPenAkaTamenuriContent } from "../../scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content";
import { applyPhase119WancherPuchicoContent } from "../../scripts/apply-phase119-wancher-puchico-content";
import { applyPhase120WancherShizukuContent } from "../../scripts/apply-phase120-wancher-shizuku-glass-nib-content";
import { applyPhase128WancherUrushiSkusContent } from "../../scripts/apply-phase128-wancher-dream-pen-urushi-skus-content";
import { applyPhase129WancherTokiwaBokashiContent } from "../../scripts/apply-phase129-wancher-dream-pen-tokiwa-bokashi-content";
import { applyPhase134WancherDreamPenTrueEboniteSilkBlackContent } from "../../scripts/apply-phase134-wancher-dream-pen-true-ebonite-silk-black-content";
import { applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent } from "../../scripts/apply-phase135-wancher-dream-pen-true-ebonite-marble-green-content";
import {
  type ApplyPhase138Options,
  applyPhase138WancherRegionalUrushiBatchContent,
} from "../../scripts/apply-phase138-wancher-regional-urushi-batch-content";
import {
  loadPhase138WancherRegionalUrushiPacks,
  PHASE138_PROTECTED_IDS,
  PHASE138_WANCHER_ID,
  phase138MadeById,
  phase138ReverseId,
} from "../../scripts/data/phase138-wancher-regional-urushi-batch";
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

test("Phase 138 publishes six exact Wancher regional urushi models on one owned copy", {
  timeout: 480_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const realBefore = JSON.stringify(protectedSnapshot);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase138-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase138Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase138-test",
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
    for (const apply of [
      applyPhase104WancherDreamPenNavigationContent,
      applyPhase107WancherDreamPenTrueEboniteMatteBlackContent,
      applyPhase112WancherDreamPenTitaniumBlackContent,
      applyPhase113WancherDreamPenAkaTamenuriContent,
      applyPhase119WancherPuchicoContent,
      applyPhase120WancherShizukuContent,
      applyPhase128WancherUrushiSkusContent,
      applyPhase129WancherTokiwaBokashiContent,
      applyPhase134WancherDreamPenTrueEboniteSilkBlackContent,
      applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent,
    ])
      await apply(client, options);

    const packs = loadPhase138WancherRegionalUrushiPacks(ROOT_CANONICAL);
    assert.equal(packs.length, 6);
    for (const pack of packs) {
      assert.equal(Array.from(pack.bodyMd).length >= 2_000, true);
      assert.equal(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          3,
        true,
      );
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
      const svg = fs
        .readFileSync(
          path.join(ROOT_CANONICAL, "public", mediaPath.replace(/^\//, "")),
          "utf8",
        )
        .toLowerCase();
      for (const token of [
        "1600",
        "900",
        "non-photo",
        "non-logo",
        "not-to-scale",
        "non-colour-proof",
      ])
        assert.match(svg, new RegExp(token));
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
    ] as Array<[ApplyPhase138Options, RegExp]>) {
      await assert.rejects(
        applyPhase138WancherRegionalUrushiBatchContent(client, changed),
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
        applyPhase138WancherRegionalUrushiBatchContent(hardlinkClient, {
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
    for (const id of PHASE138_PROTECTED_IDS)
      oldBefore.set(id, await digest(client, id));
    const brandPayloadBefore = await digest(client, PHASE138_WANCHER_ID, false);
    const reverseBefore = (
      await rows(
        client,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
        [PHASE138_WANCHER_ID],
      )
    ).map((item) => String(item.target_id));
    const first = await applyPhase138WancherRegionalUrushiBatchContent(
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
      6,
    );
    for (const pack of packs) {
      assert.deepEqual(
        (
          await rows(
            client,
            "SELECT id FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id",
            [pack.entityId, pack.entityId],
          )
        ).map((item) => String(item.id)),
        [
          phase138MadeById(pack.entityId),
          phase138ReverseId(pack.entityId),
        ].sort(),
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
          [PHASE138_WANCHER_ID],
        )
      ).map((item) => String(item.target_id)),
      reverseBefore.concat(packs.map((pack) => pack.entityId)).sort(),
    );
    for (const [id, before] of oldBefore)
      assert.equal(await digest(client, id), before);
    assert.equal(
      await digest(client, PHASE138_WANCHER_ID, false),
      brandPayloadBefore,
    );
    const second = await applyPhase138WancherRegionalUrushiBatchContent(
      client,
      options,
    );
    assert.deepEqual(
      second.entities.map((item) => item.outcome),
      Array(6).fill("noop"),
    );
    assert.deepEqual(
      second.entities.map((item) => item.contentHash),
      first.entities.map((item) => item.contentHash),
    );
    for (const [id, before] of oldBefore)
      assert.equal(await digest(client, id), before);
    assert.equal(
      await digest(client, PHASE138_WANCHER_ID, false),
      brandPayloadBefore,
    );
    const tamperTarget = packs[0];
    assert.ok(tamperTarget);
    await client.execute({
      sql: "UPDATE entities SET source='tampered' WHERE id=?",
      args: [tamperTarget.entityId],
    });
    await assert.rejects(
      applyPhase138WancherRegionalUrushiBatchContent(client, options),
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
