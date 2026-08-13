import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase600Options,
  applyPhase600YstudioCanonicalFamiliesContent,
} from "../../scripts/apply-phase600-ystudio-canonical-families-content";
import {
  PHASE600_EXISTING_CLASSIC_ID,
  PHASE600_IDS,
  PHASE600_YSTUDIO_BRAND_ID,
  phase600YstudioPacks,
} from "../../scripts/data/phase600-ystudio-canonical-families";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE600_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE600_SOURCE_DATABASE)
  : path.join(
      ROOT,
      ".planning/quick/260812-nxs-benu-minima-scepter-canonical-family-pha",
      "checkpoint-final/catalog.db",
    );
const EXPECTED_SOURCE_SHA256 =
  "28db002449eae717eabdb81da75a37164b4da0cb62aab1344e22d96996a1e621";
const EXPECTED_REAL_SHA256 =
  "acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a";
const TARGET_PACKS = phase600YstudioPacks.slice(1);

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
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase600-protected-")),
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
): ApplyPhase600Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase600-ystudio-canonical-families-test",
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
  const copy = createOwnedCopy(`fpkg-phase600-${label}-`, sourceSnapshot);
  const client = createClient({ url: `file:${copy.databasePath}` });
  const restore = bindOwnedDatabase(copy.databasePath);
  try {
    await mutate(client);
    await assert.rejects(
      () =>
        applyPhase600YstudioCanonicalFamiliesContent(
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

test("Phase 600 publishes five YSTUDIO canonical families only on an owned checkpoint and replays as noop", {
  timeout: 900_000,
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
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen','phase600-id-collision','Collision')",
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
        sql: "INSERT INTO entities(id,type,slug,name) VALUES('phase600-slug-collision','pen',?,'Collision')",
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
        sql: "INSERT INTO entities(id,type,slug,name) VALUES('phase600-name-collision','pen','phase600-name-collision',?)",
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
        "INSERT INTO entities(id,type,slug,name) VALUES('phase600-alias-owner','pen','phase600-alias-owner','Alias owner')",
      );
      await client.execute({
        sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,review_status) VALUES('phase600-alias-collision','phase600-alias-owner',?,'en','pending')",
        args: [first.aliases[0]?.alias ?? "YSTUDIO Portable Fountain Pen"],
      });
    },
    /alias collision/,
  );

  const remoteCopy = createOwnedCopy("fpkg-phase600-remote-", sourceSnapshot);
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
          applyPhase600YstudioCanonicalFamiliesContent(remoteClient, {
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

  const main = createOwnedCopy("fpkg-phase600-main-", sourceSnapshot);
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
    const baselineYstudio = Number(
      (
        await rows(
          client,
          "SELECT COUNT(*) AS count FROM entity_links WHERE source_id=? AND link_type='reverse'",
          [PHASE600_YSTUDIO_BRAND_ID],
        )
      )[0]?.count ?? 0,
    );
    assert.equal(baselineYstudio, 1);
    const classicDigest = await digest(client, PHASE600_EXISTING_CLASSIC_ID);
    const applyOptions = options(
      main.ownedRoot,
      main.databasePath,
      guard.databasePath,
      guard.snapshot,
    );
    const firstApply = await applyPhase600YstudioCanonicalFamiliesContent(
      client,
      applyOptions,
    );
    assert.equal(firstApply.entities.length, 6);
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
      baselinePublished + 5,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT COUNT(*) AS count FROM entity_links WHERE source_id=? AND link_type='reverse'",
            [PHASE600_YSTUDIO_BRAND_ID],
          )
        )[0]?.count ?? 0,
      ),
      baselineYstudio + 5,
    );
    assert.equal(
      await digest(client, PHASE600_EXISTING_CLASSIC_ID),
      classicDigest,
    );

    for (const pack of TARGET_PACKS) {
      const state = await rows(
        client,
        `SELECT entity.slug,publication.status,readiness.blocker_count,
                  CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
           FROM entities entity
           JOIN entity_publications publication ON publication.entity_id=entity.id
           LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3
           LEFT JOIN public_entities public ON public.id=entity.id
           WHERE entity.id=?`,
        [pack.entityId],
      );
      assert.deepEqual(state, [
        {
          slug: pack.expectedSlug,
          status: "published",
          blocker_count: 0,
          is_public: 1,
        },
      ]);
      const makers = await rows(
        client,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [pack.entityId],
      );
      assert.deepEqual(makers, [{ target_id: PHASE600_YSTUDIO_BRAND_ID }]);
      const spec = await rows(
        client,
        "SELECT series_name,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=? AND review_status='approved'",
        [pack.entityId],
      );
      assert.equal(spec.length, 1);
      assert.ok(String(spec[0]?.series_name).includes("YSTUDIO"));
      const variants = await rows(
        client,
        "SELECT variant_name AS name,variant_kind FROM model_variants WHERE model_entity_id=? AND review_status='approved' ORDER BY id",
        [pack.entityId],
      );
      assert.ok(variants.length >= 1);
      const media = await rows(
        client,
        "SELECT local_path,review_status,usage_status FROM media_assets WHERE entity_id=? AND usage_status='primary'",
        [pack.entityId],
      );
      assert.equal(media.length, 1);
      assert.equal(media[0]?.review_status, "approved");
    }

    const resin = await rows(
      client,
      "SELECT fill_system FROM model_specs WHERE entity_id=? AND review_status='approved'",
      [PHASE600_IDS.resin],
    );
    assert.match(String(resin[0]?.fill_system), /K1/);
    assert.match(String(resin[0]?.fill_system), /K5/);
    const kazari = await rows(
      client,
      "SELECT weight FROM model_specs WHERE entity_id=? AND review_status='approved'",
      [PHASE600_IDS.kazariKanagu],
    );
    assert.match(String(kazari[0]?.weight), /套装/);
    assert.match(String(kazari[0]?.weight), /裸笔重量未拆分/);
    const conflict = await rows(
      client,
      "SELECT field_key,status,resolution_note FROM fact_conflicts WHERE entity_id=?",
      [PHASE600_IDS.kazariKanagu],
    );
    assert.equal(conflict.length, 1);
    assert.equal(conflict[0]?.field_key, "weight");
    assert.equal(conflict[0]?.status, "resolved");

    const replay = await applyPhase600YstudioCanonicalFamiliesContent(
      client,
      applyOptions,
    );
    assert.equal(replay.entities.length, 6);
    assert.ok(replay.entities.every(({ outcome }) => outcome === "noop"));
    assert.equal(
      await digest(client, PHASE600_EXISTING_CLASSIC_ID),
      classicDigest,
    );
  } finally {
    restore();
    client.close();
    fs.rmSync(main.ownedRoot, { recursive: true, force: true });
    fs.rmSync(guard.ownedRoot, { recursive: true, force: true });
  }

  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(realSnapshot);
  assert.deepEqual(
    fingerprint(snapshotCatalogFiles(SOURCE)),
    sourceFingerprint,
  );
  assert.deepEqual(fingerprint(snapshotCatalogFiles(REAL)), realFingerprint);
  assert.equal(sha256(SOURCE), EXPECTED_SOURCE_SHA256);
  assert.equal(sha256(REAL), EXPECTED_REAL_SHA256);

  const svgPaths = TARGET_PACKS.map((pack) =>
    path.join(
      ROOT,
      "public",
      pack.media[0]?.localPath?.replace(/^\//, "") ?? "",
    ),
  );
  assert.equal(new Set(svgPaths.map(sha256)).size, 5);
  for (const svgPath of svgPaths) {
    const svg = fs.readFileSync(svgPath, "utf8");
    assert.match(svg, /width="1600" height="900"/);
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title/);
    assert.match(svg, /<desc/);
    assert.match(svg, /not a product photo/i);
  }
  const yakihakuSvg = fs.readFileSync(
    path.join(
      ROOT,
      "public/images/library/site-original/phase600/ystudio/yakihaku.svg",
    ),
    "utf8",
  );
  for (const readableMarker of [
    "两种钢笔版本",
    "带帽版",
    "Desk 桌面版",
    "云龙箔表面怎么保养",
    "非产品实拍",
  ]) {
    assert.match(yakihakuSvg, new RegExp(readableMarker));
  }
});
