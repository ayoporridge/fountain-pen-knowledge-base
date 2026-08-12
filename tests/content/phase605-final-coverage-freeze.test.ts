import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase605Options,
  applyPhase605FinalCoverageFreezeContent,
} from "../../scripts/apply-phase605-final-coverage-freeze-content";
import {
  PHASE605_BRANDS,
  PHASE605_MODELS,
  phase605FinalCoveragePacks,
  phase605Groups,
} from "../../scripts/data/phase605-final-coverage-freeze";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE605_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE605_SOURCE_DATABASE)
  : path.join(
      ROOT,
      ".planning/quick/260812-u9i-resolve-remaining-retired-identities-in-",
      "checkpoint-final/catalog.db",
    );
const EXPECTED_SOURCE_SHA256 =
  "2ed0e5040e68167b529cc675793f5d8e1711e2de3605804355359256f0133ece";
const EXPECTED_REAL_SHA256 =
  "acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a";

async function rows(client: Client, sql: string, args: unknown[] = []) {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function createOwnedCopy(prefix: string) {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshotCatalogFiles(SOURCE) },
  );
  return { ownedRoot, databasePath: copy.destinationPath };
}

function options(
  ownedRoot: string,
  databasePath: string,
  env: Record<string, string | undefined> = {},
): ApplyPhase605Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase605-final-coverage-freeze-test",
    databasePath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: snapshotCatalogFiles(REAL),
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
      ...env,
    } as NodeJS.ProcessEnv,
  };
}

async function digest(client: Client, entityId: string): Promise<string> {
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
    "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
    "SELECT * FROM entity_publications WHERE entity_id=?",
    "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
  ];
  const payload = [];
  for (const sql of queries) {
    payload.push(
      await rows(
        client,
        sql,
        sql.includes(" OR target_id") ? [entityId, entityId] : [entityId],
      ),
    );
  }
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

async function assertCollision(
  label: string,
  mutate: (client: Client) => Promise<void>,
  pattern: RegExp,
) {
  const copy = createOwnedCopy(`fpkg-phase605-${label}-`);
  const client = createClient({ url: `file:${copy.databasePath}` });
  try {
    await mutate(client);
    await assert.rejects(
      () =>
        applyPhase605FinalCoverageFreezeContent(
          client,
          options(copy.ownedRoot, copy.databasePath),
        ),
      pattern,
    );
  } finally {
    client.close();
    fs.rmSync(copy.ownedRoot, { recursive: true, force: true });
  }
}

test("Phase 605 freezes five external brand/model gaps on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  assert.equal(sha256(SOURCE), EXPECTED_SOURCE_SHA256);
  assert.equal(sha256(REAL), EXPECTED_REAL_SHA256);
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);

  await assertCollision(
    "id",
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'brand','phase605-id-collision','Collision')",
        args: [PHASE605_BRANDS.penlux],
      });
    },
    /identity collision/,
  );
  await assertCollision(
    "slug",
    async (client) => {
      await client.execute(
        "INSERT INTO entities(id,type,slug,name) VALUES('phase605-slug-collision','brand','penlux','Collision')",
      );
    },
    /identity collision/,
  );
  await assertCollision(
    "name",
    async (client) => {
      await client.execute(
        "INSERT INTO entities(id,type,slug,name) VALUES('phase605-name-collision','brand','phase605-name-collision','PENLUX')",
      );
    },
    /identity collision/,
  );
  await assertCollision(
    "alias",
    async (client) => {
      await client.execute(
        "INSERT INTO entities(id,type,slug,name) VALUES('phase605-alias-owner','brand','phase605-alias-owner','Alias owner')",
      );
      await client.execute(
        "INSERT INTO entity_aliases(id,entity_id,alias,language,review_status) VALUES('phase605-alias-collision','phase605-alias-owner','Penlux','en','pending')",
      );
    },
    /alias collision/,
  );

  const remote = createOwnedCopy("fpkg-phase605-remote-");
  const remoteClient = createClient({ url: `file:${remote.databasePath}` });
  try {
    for (const key of [
      "TURSO_DATABASE_URL",
      "TURSO_AUTH_TOKEN",
      "FPKG_DATABASE_URL",
    ] as const) {
      await assert.rejects(
        () =>
          applyPhase605FinalCoverageFreezeContent(
            remoteClient,
            options(remote.ownedRoot, remote.databasePath, {
              [key]: "libsql://remote.invalid",
            }),
          ),
        new RegExp(`refuses inherited remote database selection: ${key}`),
      );
    }
  } finally {
    remoteClient.close();
    fs.rmSync(remote.ownedRoot, { recursive: true, force: true });
  }

  const main = createOwnedCopy("fpkg-phase605-main-");
  const client = createClient({ url: `file:${main.databasePath}` });
  try {
    const baseline = Number(
      (
        await rows(
          client,
          "SELECT COUNT(*) AS count FROM public_entities WHERE type IN ('brand','pen')",
        )
      )[0]?.count ?? 0,
    );
    const existingIds = (
      await rows(
        client,
        "SELECT id FROM public_entities WHERE type='pen' ORDER BY id LIMIT 5",
      )
    ).map((row) => String(row.id));
    const existingDigests = new Map<string, string>();
    for (const id of existingIds)
      existingDigests.set(id, await digest(client, id));

    const applyOptions = options(main.ownedRoot, main.databasePath);
    const first = await applyPhase605FinalCoverageFreezeContent(
      client,
      applyOptions,
    );
    assert.equal(first.entities.length, 10);
    assert.ok(first.entities.every(({ outcome }) => outcome === "published"));
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT COUNT(*) AS count FROM public_entities WHERE type IN ('brand','pen')",
          )
        )[0]?.count ?? 0,
      ),
      baseline + 10,
    );

    for (const pack of phase605FinalCoveragePacks) {
      const state = await rows(
        client,
        `SELECT entity.name,entity.slug,publication.status,readiness.blocker_count,
                  CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
             FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id
             LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3
             LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?`,
        [pack.entityId],
      );
      assert.deepEqual(state, [
        {
          name: pack.canonicalName,
          slug: pack.expectedSlug,
          status: "published",
          blocker_count: 0,
          is_public: 1,
        },
      ]);
      assert.equal(
        (
          await rows(
            client,
            "SELECT COUNT(*) AS count FROM entity_content_reviews WHERE entity_id=? AND status='approved'",
            [pack.entityId],
          )
        )[0]?.count,
        4,
      );
    }

    for (const { brand, pens } of phase605Groups) {
      for (const pen of pens) {
        assert.deepEqual(
          await rows(
            client,
            "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
            [pen.entityId],
          ),
          [{ target_id: brand.entityId }],
        );
        assert.deepEqual(
          await rows(
            client,
            "SELECT source_id FROM entity_links WHERE target_id=? AND link_type='reverse'",
            [pen.entityId],
          ),
          [{ source_id: brand.entityId }],
        );
      }
    }
    assert.equal(
      (
        await rows(
          client,
          "SELECT COUNT(*) AS count FROM model_specs WHERE entity_id IN (?,?,?,?,?)",
          Object.values(PHASE605_MODELS),
        )
      )[0]?.count,
      5,
    );
    for (const id of existingIds)
      assert.equal(await digest(client, id), existingDigests.get(id));

    const targetDigests = new Map<string, string>();
    for (const pack of phase605FinalCoveragePacks)
      targetDigests.set(pack.entityId, await digest(client, pack.entityId));
    const replay = await applyPhase605FinalCoverageFreezeContent(
      client,
      applyOptions,
    );
    assert.equal(replay.entities.length, 10);
    assert.ok(replay.entities.every(({ outcome }) => outcome === "noop"));
    for (const pack of phase605FinalCoveragePacks)
      assert.equal(
        await digest(client, pack.entityId),
        targetDigests.get(pack.entityId),
      );
  } finally {
    client.close();
    fs.rmSync(main.ownedRoot, { recursive: true, force: true });
  }

  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(realSnapshot);
  assert.equal(sha256(SOURCE), EXPECTED_SOURCE_SHA256);
  assert.equal(sha256(REAL), EXPECTED_REAL_SHA256);

  const svgPaths = phase605FinalCoveragePacks.map((pack) =>
    path.join(
      ROOT,
      "public",
      pack.media[0]?.localPath?.replace(/^\//, "") ?? "",
    ),
  );
  assert.equal(new Set(svgPaths.map(sha256)).size, 10);
  for (const svgPath of svgPaths) {
    const svg = fs.readFileSync(svgPath, "utf8");
    assert.match(svg, /width="1600" height="900"/);
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title/);
    assert.match(svg, /<desc/);
  }
});
