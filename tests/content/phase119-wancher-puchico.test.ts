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
import {
  type ApplyPhase119Options,
  applyPhase119WancherPuchicoContent,
} from "../../scripts/apply-phase119-wancher-puchico-content";
import {
  loadPhase119WancherPuchicoPack,
  PHASE119_COLLECTION_URL,
  PHASE119_KIMBERLY_URL,
  PHASE119_PUCHICO_ID,
  PHASE119_PUCHICO_SLUG,
  PHASE119_SARAH_URL,
  PHASE119_VARIANT_NAMES,
  PHASE119_WANCHER_ID,
} from "../../scripts/data/phase119-wancher-puchico";
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
const PROTECTED = [
  "2aoD07lwSYCV",
  "phase107-wancher-true-ebonite-matte-black",
  "phase112-wancher-dream-pen-titanium-black",
  "phase113-wancher-dream-pen-true-urushi-aka-tamenuri",
] as const;

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
    ...(topology
      ? [
          "SELECT * FROM entity_publications WHERE entity_id=? ORDER BY entity_id",
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
        ]
      : []),
  ];
  const result = [];
  for (const sql of queries) {
    result.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  }
  return JSON.stringify(result);
}

test("Phase 119 publishes one PuChiCo with exact variants and isolated sample scopes", {
  timeout: 240_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase119-")),
  );
  const outsideRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase119-outside-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const extraClients: Client[] = [];
  const options: ApplyPhase119Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase119-test",
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
    await applyPhase104WancherDreamPenNavigationContent(client, options);
    await applyPhase107WancherDreamPenTrueEboniteMatteBlackContent(
      client,
      options,
    );
    await applyPhase112WancherDreamPenTitaniumBlackContent(client, options);
    await applyPhase113WancherDreamPenAkaTamenuriContent(client, options);

    const protectedBefore = new Map<string, string>();
    for (const id of PROTECTED)
      protectedBefore.set(id, await digest(client, id));
    const brandPayloadBefore = await digest(client, PHASE119_WANCHER_ID, false);
    const brandHashBefore = await computePublicationContentHash(
      client,
      PHASE119_WANCHER_ID,
    );
    const reverseBefore = await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE119_WANCHER_ID],
    );

    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entities WHERE id=? OR slug=? OR lower(name)=lower('Wancher PuChiCo')",
          [PHASE119_PUCHICO_ID, PHASE119_PUCHICO_SLUG],
        )
      )[0]?.n,
      0,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entity_references reference JOIN source_items item ON item.id=reference.source_item_id WHERE item.url IN (?,?,?)",
          [PHASE119_COLLECTION_URL, PHASE119_SARAH_URL, PHASE119_KIMBERLY_URL],
        )
      )[0]?.n,
      0,
    );

    for (const [changed, expected] of [
      [
        { ...options, workspaceRoot: os.tmpdir() },
        /verified CodeBuddy\/Documents repo pair/,
      ],
      [{ ...options, reviewer: " " }, /reviewer must not be empty/],
      [
        {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "file:remote" },
        },
        /refuses inherited remote/,
      ],
      [{ ...options, ownedRoot: ROOT_CANONICAL }, /caller-owned root/],
    ] as Array<[ApplyPhase119Options, RegExp]>) {
      await assert.rejects(
        applyPhase119WancherPuchicoContent(client, changed),
        expected,
      );
      assert.equal(
        (
          await rows(client, "SELECT count(*) AS n FROM entities WHERE id=?", [
            PHASE119_PUCHICO_ID,
          ])
        )[0]?.n,
        0,
      );
    }

    await assert.rejects(
      applyPhase119WancherPuchicoContent(client, {
        ...options,
        databasePath: REAL,
      }),
      /caller-owned root|protected catalog or sidecar path/,
    );

    const symlinkPath = path.join(ownedRoot, "catalog-link.db");
    fs.symlinkSync(copy.destinationPath, symlinkPath);
    await assert.rejects(
      applyPhase119WancherPuchicoContent(client, {
        ...options,
        databasePath: symlinkPath,
      }),
      /must not be a symlink/,
    );

    const mismatchCopy = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(ownedRoot, "client-mismatch.db"),
      ownedRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    await assert.rejects(
      applyPhase119WancherPuchicoContent(client, {
        ...options,
        databasePath: mismatchCopy.destinationPath,
      }),
      /client\/path mismatch/,
    );

    const unmigratedCopy = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(ownedRoot, "unmigrated.db"),
      ownedRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const unmigratedClient = createClient({
      url: `file:${unmigratedCopy.destinationPath}`,
    });
    extraClients.push(unmigratedClient);
    await assert.rejects(
      applyPhase119WancherPuchicoContent(unmigratedClient, {
        ...options,
        databasePath: unmigratedCopy.destinationPath,
      }),
      /must be migrated through 032/,
    );

    const protectedStandIn = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(outsideRoot, "protected-stand-in.db"),
      outsideRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const hardLinkPath = path.join(ownedRoot, "protected-hard-link.db");
    fs.linkSync(protectedStandIn.destinationPath, hardLinkPath);
    const hardLinkClient = createClient({ url: `file:${hardLinkPath}` });
    extraClients.push(hardLinkClient);
    await assert.rejects(
      applyPhase119WancherPuchicoContent(hardLinkClient, {
        ...options,
        databasePath: hardLinkPath,
        protectedCatalogPath: protectedStandIn.destinationPath,
        protectedCatalogSnapshot: snapshotCatalogFiles(
          protectedStandIn.destinationPath,
        ),
      }),
      /hard-link alias/,
    );

    await client.execute({
      sql: "INSERT INTO entities(id,type,slug,name,source_url) VALUES('phase119-alt','pen','phase119-alt','PuChiCo',?)",
      args: [PHASE119_COLLECTION_URL],
    });
    await assert.rejects(
      applyPhase119WancherPuchicoContent(client, options),
      /alternate PuChiCo identity or source owner/,
    );
    await client.execute("DELETE FROM entities WHERE id='phase119-alt'");

    const first = await applyPhase119WancherPuchicoContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE119_PUCHICO_ID, "published"]],
    );

    const pack = loadPhase119WancherPuchicoPack(ROOT_ALIAS);
    assert.ok(
      Array.from(pack.summary).length >= 60 &&
        Array.from(pack.summary).length <= 160,
    );
    assert.ok(Array.from(pack.bodyMd).length >= 2_000);
    assert.deepEqual(
      new Set(pack.variants?.map((variant) => variant.name)),
      new Set(PHASE119_VARIANT_NAMES),
    );
    assert.equal(pack.variants?.length, 11);
    assert.doesNotMatch(JSON.stringify(pack.variants), /Petite Charm Case/);
    assert.deepEqual(
      new Set(pack.scopes.map((scope) => scope.productionState)),
      new Set(["current", "historical"]),
    );
    assert.match(
      JSON.stringify(pack.scopes),
      /Sarah Read[\s\S]*JetPens[\s\S]*Kimberly Lau[\s\S]*Black Chocolate Orange[\s\S]*Fine/i,
    );
    const stableSpecs = JSON.stringify(pack.spec?.values);
    for (const field of [/65 mm/i, /Eyedropper/i, /Acrylic/i, /stainless/i]) {
      assert.match(stableSpecs, field);
    }
    assert.doesNotMatch(
      stableSpecs,
      /0\.5|flight|burp|leak|\$|price|Black Chocolate Orange|60 mm|90 mm/i,
    );
    const rejected =
      pack.spec?.evidence.filter((item) => item.qualifies === false) ?? [];
    assert.ok(rejected.length >= 8);
    assert.match(
      JSON.stringify(rejected),
      /0\.5|flight|burp|leak|nib feel|posting|comfort|price|sample color/i,
    );

    assert.deepEqual(
      await rows(
        client,
        "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
        [PHASE119_PUCHICO_ID],
      ),
      [...PHASE119_VARIANT_NAMES]
        .sort()
        .map((variant_name) => ({ variant_name })),
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entities WHERE lower(name) IN ('lime sherbet','white snow','black chocolate orange')",
        )
      )[0]?.n,
      0,
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type",
        [PHASE119_PUCHICO_ID, PHASE119_PUCHICO_ID],
      ),
      [
        {
          source_id: PHASE119_PUCHICO_ID,
          target_id: PHASE119_WANCHER_ID,
          link_type: "made_by",
        },
        {
          source_id: PHASE119_WANCHER_ID,
          target_id: PHASE119_PUCHICO_ID,
          link_type: "reverse",
        },
      ],
    );
    assert.equal(
      await digest(client, PHASE119_WANCHER_ID, false),
      brandPayloadBefore,
    );
    assert.notEqual(
      await computePublicationContentHash(client, PHASE119_WANCHER_ID),
      brandHashBefore,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
          [PHASE119_WANCHER_ID],
        )
      ).filter((row) => row.target_id !== PHASE119_PUCHICO_ID),
      reverseBefore,
    );
    for (const [id, before] of protectedBefore)
      assert.equal(await digest(client, id), before);

    const svgPath = path.join(
      ROOT_CANONICAL,
      "public/images/library/site-original/phase119/wancher/wancher-puchico.svg",
    );
    const svg = fs.readFileSync(svgPath, "utf8");
    assert.match(
      svg,
      /1600[\s\S]*900[\s\S]*site-original[\s\S]*non-photo[\s\S]*non-logo/i,
    );
    const newHash = createHash("sha256").update(svg).digest("hex");
    for (const oldPath of [
      "public/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg",
      "public/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg",
      "public/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg",
    ])
      assert.notEqual(
        newHash,
        createHash("sha256")
          .update(fs.readFileSync(path.join(ROOT_CANONICAL, oldPath)))
          .digest("hex"),
      );

    const terminal = await digest(client, PHASE119_PUCHICO_ID);
    const replay = await applyPhase119WancherPuchicoContent(client, {
      ...options,
      workspaceRoot: ROOT_CANONICAL,
    });
    assert.deepEqual(
      replay.entities.map((item) => item.outcome),
      ["noop"],
    );
    assert.equal(await digest(client, PHASE119_PUCHICO_ID), terminal);
    await client.execute({
      sql: "DELETE FROM model_variants WHERE model_entity_id=? AND variant_name='Lime Sherbet'",
      args: [PHASE119_PUCHICO_ID],
    });
    const tampered = await digest(client, PHASE119_PUCHICO_ID);
    await assert.rejects(
      applyPhase119WancherPuchicoContent(client, options),
      /terminal.*invalid|variant/i,
    );
    assert.equal(await digest(client, PHASE119_PUCHICO_ID), tampered);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    clearInterval(keepAlive);
    client.close();
    for (const extraClient of extraClients) extraClient.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    fs.rmSync(outsideRoot, { recursive: true, force: true });
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
  }
});
