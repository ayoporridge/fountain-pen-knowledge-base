import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase599Options,
  applyPhase599BenuCanonicalFamiliesContent,
} from "../../scripts/apply-phase599-benu-canonical-families-content";
import {
  PHASE599_BENU_BRAND_ID,
  PHASE599_IDS,
  phase599BenuPacks,
} from "../../scripts/data/phase599-benu-canonical-families";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE599_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE599_SOURCE_DATABASE)
  : path.join(
      ROOT,
      ".planning/quick/260811-tzr-ikkaku-by-nahvalur-phase-597-owned-check",
      "checkpoint/catalog.db",
    );
const EXPECTED_SOURCE_SHA256 =
  "2cfb3e760b286b3136730eefa8c15d0e2f1395f426da7f380744d0d91a5658eb";
const EXPECTED_REAL_SHA256 =
  "acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a";
const TARGET_PACKS = phase599BenuPacks.slice(1);

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
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase599-protected-")),
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
): ApplyPhase599Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase599-benu-canonical-families-test",
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
  for (const sql of queries)
    payload.push(
      await rows(
        client,
        sql,
        sql.includes(" OR target_id") ? [entityId, entityId] : [entityId],
      ),
    );
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
  const copy = createOwnedCopy(`fpkg-phase599-${label}-`, sourceSnapshot);
  const client = createClient({ url: `file:${copy.databasePath}` });
  const restore = bindOwnedDatabase(copy.databasePath);
  try {
    await mutate(client);
    await assert.rejects(
      () =>
        applyPhase599BenuCanonicalFamiliesContent(
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

test("Phase 599 publishes eleven BENU canonical families only on an owned checkpoint and replays as noop", {
  timeout: 1_200_000,
}, async () => {
  assert.equal(sha256(SOURCE), EXPECTED_SOURCE_SHA256);
  assert.equal(sha256(REAL), EXPECTED_REAL_SHA256);
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const sourceFingerprint = fingerprint(sourceSnapshot);
  const realFingerprint = fingerprint(realSnapshot);
  const guard = createProtectedGuard(realSnapshot);

  const first = TARGET_PACKS[0];
  assert.ok(first);
  await assertRejectedCollision(
    "id",
    sourceSnapshot,
    guard,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen','phase599-id-collision','Collision')",
        args: [first.entityId],
      });
    },
    /identity collision/,
  );
  await assertRejectedCollision(
    "slug",
    sourceSnapshot,
    guard,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES('phase599-slug-collision','pen',?,'Collision')",
        args: [first.expectedSlug],
      });
    },
    /identity collision/,
  );
  await assertRejectedCollision(
    "name",
    sourceSnapshot,
    guard,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES('phase599-name-collision','pen','phase599-name-collision',?)",
        args: [first.canonicalName],
      });
    },
    /identity collision/,
  );
  await assertRejectedCollision(
    "alias",
    sourceSnapshot,
    guard,
    async (client) => {
      await client.execute(
        "INSERT INTO entities(id,type,slug,name) VALUES('phase599-alias-owner','pen','phase599-alias-owner','Alias owner')",
      );
      await client.execute({
        sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,review_status) VALUES('phase599-alias-collision','phase599-alias-owner',?,'en','pending')",
        args: [first.aliases[0]?.alias ?? "Benu Minima"],
      });
    },
    /alias collision/,
  );

  const remoteCopy = createOwnedCopy("fpkg-phase599-remote-", sourceSnapshot);
  const remoteClient = createClient({ url: `file:${remoteCopy.databasePath}` });
  const remoteRestore = bindOwnedDatabase(remoteCopy.databasePath);
  try {
    const base = options(
      remoteCopy.ownedRoot,
      remoteCopy.databasePath,
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
          applyPhase599BenuCanonicalFamiliesContent(remoteClient, {
            ...base,
            env: {
              ...base.env,
              [key]:
                key === "TURSO_AUTH_TOKEN"
                  ? "secret"
                  : "libsql://remote.invalid",
            } as NodeJS.ProcessEnv,
          }),
        new RegExp(`refuses inherited remote database selection: ${key}`),
      );
    }
  } finally {
    remoteRestore();
    remoteClient.close();
    fs.rmSync(remoteCopy.ownedRoot, { recursive: true, force: true });
  }

  const main = createOwnedCopy("fpkg-phase599-main-", sourceSnapshot);
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
    const baselineBenu = Number(
      (
        await rows(
          client,
          "SELECT COUNT(*) AS count FROM entity_links WHERE source_id=? AND link_type='reverse'",
          [PHASE599_BENU_BRAND_ID],
        )
      )[0]?.count ?? 0,
    );
    assert.equal(baselineBenu, 4);
    const existingIds = (
      await rows(
        client,
        "SELECT source_id AS id FROM entity_links WHERE target_id=? AND link_type='made_by' ORDER BY source_id",
        [PHASE599_BENU_BRAND_ID],
      )
    ).map((row) => String(row.id));
    const protectedDigests = new Map<string, string>();
    for (const id of existingIds)
      protectedDigests.set(id, await digest(client, id));

    const applyOptions = options(
      main.ownedRoot,
      main.databasePath,
      guard.databasePath,
      guard.snapshot,
    );
    const firstApply = await applyPhase599BenuCanonicalFamiliesContent(
      client,
      applyOptions,
    );
    assert.equal(firstApply.entities.length, 12);
    assert.ok(
      firstApply.entities.every(({ outcome }) => outcome === "published"),
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT COUNT(*) AS count FROM public_entities WHERE type IN ('brand','pen')",
          )
        )[0]?.count ?? 0,
      ),
      baselinePublished + 11,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT COUNT(*) AS count FROM entity_links WHERE source_id=? AND link_type='reverse'",
            [PHASE599_BENU_BRAND_ID],
          )
        )[0]?.count ?? 0,
      ),
      baselineBenu + 11,
    );

    for (const pack of TARGET_PACKS) {
      const state = await rows(
        client,
        `SELECT entity.slug,entity.name,publication.status,readiness.blocker_count,readiness.publishable,public.summary,public.body_md FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3 JOIN public_entities public ON public.id=entity.id WHERE entity.id=?`,
        [pack.entityId],
      );
      assert.equal(state.length, 1);
      assert.equal(state[0]?.slug, pack.expectedSlug);
      assert.equal(state[0]?.name, pack.canonicalName);
      assert.equal(state[0]?.status, "published");
      assert.equal(Number(state[0]?.blocker_count), 0);
      assert.equal(Number(state[0]?.publishable), 1);
      assert.ok(Array.from(String(state[0]?.summary)).length >= 60);
      assert.ok(Array.from(String(state[0]?.body_md)).length >= 2_000);
      assert.match(String(state[0]?.body_md), /维护|清洁/);
      assert.match(String(state[0]?.body_md), /选购|购买/);
      const maker = await rows(
        client,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [pack.entityId],
      );
      assert.deepEqual(
        maker.map((row) => String(row.target_id)),
        [PHASE599_BENU_BRAND_ID],
      );
      assert.equal(
        Number(
          (
            await rows(
              client,
              "SELECT COUNT(*) AS count FROM model_specs WHERE entity_id=?",
              [pack.entityId],
            )
          )[0]?.count ?? 0,
        ),
        1,
      );
      assert.ok(
        Number(
          (
            await rows(
              client,
              "SELECT COUNT(*) AS count FROM model_variants WHERE model_entity_id=?",
              [pack.entityId],
            )
          )[0]?.count ?? 0,
        ) >= 1,
      );
      assert.equal(
        Number(
          (
            await rows(
              client,
              "SELECT COUNT(*) AS count FROM media_assets WHERE entity_id=? AND usage_status='primary'",
              [pack.entityId],
            )
          )[0]?.count ?? 0,
        ),
        1,
      );
      assert.equal(
        Number(
          (
            await rows(
              client,
              "SELECT COUNT(DISTINCT review_kind) AS count FROM entity_content_reviews WHERE entity_id=? AND status='approved'",
              [pack.entityId],
            )
          )[0]?.count ?? 0,
        ),
        4,
      );
    }

    const brandBody = String(
      (
        await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
          PHASE599_BENU_BRAND_ID,
        ])
      )[0]?.body_md ?? "",
    );
    for (const marker of [
      "Minima",
      "Pixie",
      "AstroGem",
      "Tessera",
      "Haute",
      "Tribute",
      "Cocktail Hour",
      "DailyMate",
      "Ambrosia",
      "Scepter",
      "Grand Scepter",
    ])
      assert.match(brandBody, new RegExp(marker));
    assert.match(brandBody, /BENU Exclusive/);
    assert.match(brandBody, /Euphoria Autograph/);

    for (const [id, before] of protectedDigests)
      assert.equal(
        await digest(client, id),
        before,
        `protected existing BENU digest changed: ${id}`,
      );
    const firstHashes = new Map(
      firstApply.entities.map((entity) => [
        entity.entityId,
        entity.contentHash,
      ]),
    );
    const replay = await applyPhase599BenuCanonicalFamiliesContent(
      client,
      applyOptions,
    );
    assert.equal(replay.entities.length, 12);
    assert.ok(replay.entities.every(({ outcome }) => outcome === "noop"));
    assert.deepEqual(
      new Map(
        replay.entities.map((entity) => [entity.entityId, entity.contentHash]),
      ),
      firstHashes,
    );
  } finally {
    restore();
    client.close();
    fs.rmSync(main.ownedRoot, { recursive: true, force: true });
  }

  const svgPaths = TARGET_PACKS.map((pack) =>
    path.join(
      ROOT,
      "public",
      pack.media[0]?.localPath?.replace(/^\//, "") ?? "missing",
    ),
  );
  assert.equal(new Set(svgPaths.map(sha256)).size, 11);
  for (const svgPath of svgPaths) {
    const svg = fs.readFileSync(svgPath, "utf8");
    assert.match(svg, /width="1600" height="900"/);
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title/);
    assert.match(svg, /<desc/);
  }

  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assert.deepEqual(
    fingerprint(snapshotCatalogFiles(SOURCE)),
    sourceFingerprint,
  );
  assert.deepEqual(fingerprint(snapshotCatalogFiles(REAL)), realFingerprint);
  assert.equal(sha256(SOURCE), EXPECTED_SOURCE_SHA256);
  assert.equal(sha256(REAL), EXPECTED_REAL_SHA256);
  fs.rmSync(guard.ownedRoot, { recursive: true, force: true });
});

assert.equal(Object.keys(PHASE599_IDS).length, 11);
