import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase604Options,
  applyPhase604BanjuDoerIdentityClosure,
} from "../../scripts/apply-phase604-banju-doer-identity-closure";
import {
  PHASE604_ASVINE_BRAND_ID,
  PHASE604_BANJU_BRAND_ID,
  PHASE604_BANJU_DOER_ID,
  PHASE604_YISIHUA_ID,
  phase604BanjuPacks,
} from "../../scripts/data/phase604-banju-doer-identity-closure";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { HARD_404_ENTITY_PATHS } from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE604_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE604_SOURCE_DATABASE)
  : path.join(
      ROOT,
      ".planning/quick/260812-tvl-sailor-naginata-togi-nib-recovery",
      "checkpoint-final/catalog.db",
    );
const EXPECTED_SOURCE_SHA256 =
  "1fca38d561e419c2583029779a78193a6bfe2faa61b5e7e12c1eae956afaba2b";
const EXPECTED_REAL_SHA256 =
  "acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a";
const TERMINAL = [
  ["uppuHJzvuw5k", "/brand/shanghai"],
  ["kBv3hmJfi366", "/brand/saier"],
  ["6K7UhGOj7VrS", "/pen/skb派顿-f10-f21"],
] as const;

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

function fingerprint(snapshot: ReturnType<typeof snapshotCatalogFiles>) {
  return Object.fromEntries(
    (["main", "wal", "shm"] as const).map((kind) => {
      const file = snapshot[kind];
      return [
        kind,
        {
          exists: file.exists,
          size: file.size,
          device: file.device,
          inode: file.inode,
          mode: file.mode,
          uid: file.uid,
          gid: file.gid,
          sha256: file.sha256,
        },
      ];
    }),
  );
}

function createProtectedGuard(
  realSnapshot: ReturnType<typeof snapshotCatalogFiles>,
) {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase604-protected-")),
  );
  const databasePath = path.join(ownedRoot, "protected.db");
  fs.copyFileSync(REAL, databasePath, fs.constants.COPYFILE_EXCL);
  const snapshot = snapshotCatalogFiles(databasePath);
  assert.equal(snapshot.main.sha256, realSnapshot.main.sha256);
  return { ownedRoot, databasePath, snapshot };
}

function createOwnedCopy(
  prefix: string,
  sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>,
) {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  return { ownedRoot, databasePath: copy.destinationPath };
}

function bindOwnedDatabase(databasePath: string): () => void {
  const keys = [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
    "PUBLICATION_GATE_FIXTURE",
  ] as const;
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  process.env.TURSO_DATABASE_URL = "";
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.FPKG_DATABASE_URL = `file:${databasePath}`;
  process.env.PUBLICATION_GATE_FIXTURE = "1";
  return () => {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
}

function options(
  ownedRoot: string,
  databasePath: string,
  protectedCatalogPath: string,
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
): ApplyPhase604Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase604-banju-doer-identity-closure-test",
    databasePath,
    ownedRoot,
    protectedCatalogPath,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
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

async function assertRejectedCollision(
  label: string,
  sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  guard: ReturnType<typeof createProtectedGuard>,
  mutate: (client: Client) => Promise<void>,
  pattern: RegExp,
) {
  const copy = createOwnedCopy(`fpkg-phase604-${label}-`, sourceSnapshot);
  const client = createClient({ url: `file:${copy.databasePath}` });
  const restore = bindOwnedDatabase(copy.databasePath);
  try {
    await mutate(client);
    await assert.rejects(
      () =>
        applyPhase604BanjuDoerIdentityClosure(
          client,
          options(
            copy.ownedRoot,
            copy.databasePath,
            guard.databasePath,
            guard.snapshot,
          ),
        ),
      pattern,
    );
  } finally {
    restore();
    client.close();
    fs.rmSync(copy.ownedRoot, { recursive: true, force: true });
  }
}

test("Phase 604 restores Banju/Doer, merges YiSiHua into Asvine, and preserves terminal retired identities", {
  timeout: 900_000,
}, async () => {
  assert.equal(sha256(SOURCE), EXPECTED_SOURCE_SHA256);
  assert.equal(sha256(REAL), EXPECTED_REAL_SHA256);
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const sourceFingerprint = fingerprint(sourceSnapshot);
  const realFingerprint = fingerprint(realSnapshot);
  const guard = createProtectedGuard(realSnapshot);

  await assertRejectedCollision(
    "id",
    sourceSnapshot,
    guard,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen','phase604-id-collision','Collision')",
        args: [PHASE604_BANJU_DOER_ID],
      });
    },
    /Doer identity collision/,
  );
  await assertRejectedCollision(
    "slug",
    sourceSnapshot,
    guard,
    async (client) => {
      await client.execute(
        "INSERT INTO entities(id,type,slug,name) VALUES('phase604-slug-collision','pen','banju-doer','Collision')",
      );
    },
    /Doer identity collision/,
  );
  await assertRejectedCollision(
    "name",
    sourceSnapshot,
    guard,
    async (client) => {
      await client.execute(
        "INSERT INTO entities(id,type,slug,name) VALUES('phase604-name-collision','pen','phase604-name-collision','Banju Doer 实践家')",
      );
    },
    /Doer identity collision/,
  );
  await assertRejectedCollision(
    "alias",
    sourceSnapshot,
    guard,
    async (client) => {
      await client.execute(
        "INSERT INTO entities(id,type,slug,name) VALUES('phase604-alias-owner','pen','phase604-alias-owner','Alias owner')",
      );
      await client.execute(
        "INSERT INTO entity_aliases(id,entity_id,alias,language,review_status) VALUES('phase604-alias-collision','phase604-alias-owner','BANJU Doer','en','pending')",
      );
    },
    /alias collision/,
  );

  const remote = createOwnedCopy("fpkg-phase604-remote-", sourceSnapshot);
  const remoteClient = createClient({ url: `file:${remote.databasePath}` });
  const remoteRestore = bindOwnedDatabase(remote.databasePath);
  try {
    const base = options(
      remote.ownedRoot,
      remote.databasePath,
      guard.databasePath,
      guard.snapshot,
    );
    for (const key of [
      "TURSO_DATABASE_URL",
      "TURSO_AUTH_TOKEN",
      "FPKG_DATABASE_URL",
    ] as const) {
      await assert.rejects(
        () =>
          applyPhase604BanjuDoerIdentityClosure(remoteClient, {
            ...base,
            env: {
              ...base.env,
              [key]: "libsql://remote.invalid",
            } as NodeJS.ProcessEnv,
          }),
        new RegExp(`refuses inherited remote database selection: ${key}`),
      );
    }
  } finally {
    remoteRestore();
    remoteClient.close();
    fs.rmSync(remote.ownedRoot, { recursive: true, force: true });
  }

  const main = createOwnedCopy("fpkg-phase604-main-", sourceSnapshot);
  const client = createClient({ url: `file:${main.databasePath}` });
  const restore = bindOwnedDatabase(main.databasePath);
  try {
    const baselinePublished = Number(
      (
        await rows(
          client,
          "SELECT COUNT(*) AS count FROM public_entities WHERE type IN ('brand','pen')",
        )
      )[0]?.count ?? 0,
    );
    const asvineDigest = await digest(client, PHASE604_ASVINE_BRAND_ID);
    const terminalDigests = new Map<string, string>();
    for (const [id] of TERMINAL)
      terminalDigests.set(id, await digest(client, id));
    const applyOptions = options(
      main.ownedRoot,
      main.databasePath,
      guard.databasePath,
      guard.snapshot,
    );
    const first = await applyPhase604BanjuDoerIdentityClosure(
      client,
      applyOptions,
    );
    assert.equal(first.entities.length, 2);
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
      baselinePublished + 2,
    );

    for (const pack of phase604BanjuPacks) {
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
      const media = await rows(
        client,
        "SELECT local_path,review_status,usage_status FROM media_assets WHERE entity_id=?",
        [pack.entityId],
      );
      assert.equal(media.length, 1);
      assert.equal(media[0]?.review_status, "approved");
      assert.equal(media[0]?.usage_status, "primary");
    }
    const maker = await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [PHASE604_BANJU_DOER_ID],
    );
    assert.deepEqual(maker, [{ target_id: PHASE604_BANJU_BRAND_ID }]);
    const spec = await rows(
      client,
      "SELECT series_name,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
      [PHASE604_BANJU_DOER_ID],
    );
    assert.equal(spec.length, 1);
    assert.match(String(spec[0]?.nib), /不锈钢 F 尖/);
    assert.match(String(spec[0]?.fill_system), /2.6 mm/);
    assert.match(String(spec[0]?.dimensions), /139/);

    const merge = await rows(
      client,
      `SELECT publication.status,redirect.target_path,redirect.redirect_kind,lineage.target_entity_id
         FROM entity_publications publication
         JOIN entity_redirects redirect ON redirect.source_path='/brand/yisihua'
         JOIN entity_lineage lineage ON lineage.source_entity_id=publication.entity_id AND lineage.lineage_kind='merge'
         WHERE publication.entity_id=?`,
      [PHASE604_YISIHUA_ID],
    );
    assert.deepEqual(merge, [
      {
        status: "retired",
        target_path: "/brand/asvine",
        redirect_kind: "permanent",
        target_entity_id: PHASE604_ASVINE_BRAND_ID,
      },
    ]);
    assert.equal(await digest(client, PHASE604_ASVINE_BRAND_ID), asvineDigest);
    assert.equal(
      (
        await rows(
          client,
          "SELECT COUNT(*) AS count FROM entity_redirects WHERE source_path='/brand/banju'",
        )
      )[0]?.count,
      0,
    );
    for (const [id, route] of TERMINAL) {
      assert.equal(await digest(client, id), terminalDigests.get(id));
      const retired = await rows(
        client,
        `SELECT publication.status,redirect.redirect_kind,redirect.target_path
           FROM entity_publications publication JOIN entity_redirects redirect ON redirect.source_path=?
           WHERE publication.entity_id=?`,
        [route, id],
      );
      assert.deepEqual(retired, [
        { status: "retired", redirect_kind: "hard_404", target_path: null },
      ]);
    }

    const replay = await applyPhase604BanjuDoerIdentityClosure(
      client,
      applyOptions,
    );
    assert.equal(replay.entities.length, 2);
    assert.ok(replay.entities.every(({ outcome }) => outcome === "noop"));
    assert.equal(await digest(client, PHASE604_ASVINE_BRAND_ID), asvineDigest);
  } finally {
    restore();
    client.close();
    fs.rmSync(main.ownedRoot, { recursive: true, force: true });
    fs.rmSync(guard.ownedRoot, { recursive: true, force: true });
  }

  assert.equal(HARD_404_ENTITY_PATHS.has("/brand/banju"), false);
  assert.equal(HARD_404_ENTITY_PATHS.has("/brand/yisihua"), false);
  for (const [, route] of TERMINAL)
    assert.equal(HARD_404_ENTITY_PATHS.has(route), true);
  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(realSnapshot);
  assert.deepEqual(
    fingerprint(snapshotCatalogFiles(SOURCE)),
    sourceFingerprint,
  );
  assert.deepEqual(fingerprint(snapshotCatalogFiles(REAL)), realFingerprint);
  assert.equal(sha256(SOURCE), EXPECTED_SOURCE_SHA256);
  assert.equal(sha256(REAL), EXPECTED_REAL_SHA256);

  const svgPaths = phase604BanjuPacks.map((pack) =>
    path.join(
      ROOT,
      "public",
      pack.media[0]?.localPath?.replace(/^\//, "") ?? "",
    ),
  );
  assert.equal(new Set(svgPaths.map(sha256)).size, 2);
  for (const svgPath of svgPaths) {
    const svg = fs.readFileSync(svgPath, "utf8");
    assert.match(svg, /width="1600" height="900"/);
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title/);
    assert.match(svg, /<desc/);
    assert.match(svg, /not a product photo/i);
  }
});
