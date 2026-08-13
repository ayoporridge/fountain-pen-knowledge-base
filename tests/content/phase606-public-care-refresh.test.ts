import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase606Options,
  applyPhase606PublicCareRefresh,
} from "../../scripts/apply-phase606-public-care-refresh";
import {
  PHASE606_TARGETS,
  phase606PublicCareRefreshPacks,
} from "../../scripts/data/phase606-public-care-refresh";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const SOURCE = path.join(
  ROOT,
  ".planning/quick/260813-8nd-freeze-external-brand-and-model-coverage/checkpoint-final/catalog.db",
);
const REAL = path.join(ROOT, "data", "fpkg.db");
const REMOTE_KEYS = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "FPKG_DATABASE_URL",
] as const;

function sha256(file: string): string {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function cleanEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: "test",
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: "",
  };
}

function ownedCopy(sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>) {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase606-care-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  return { ownedRoot, databasePath: copy.destinationPath };
}

function optionsFor(
  ownedRoot: string,
  databasePath: string,
  realSnapshot: ReturnType<typeof snapshotCatalogFiles>,
): ApplyPhase606Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase606-public-care-refresh-test",
    databasePath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: realSnapshot,
    env: cleanEnv(),
  };
}

async function checkpointAndClose(
  client: Client,
  databasePath: string,
): Promise<void> {
  await client
    .execute("PRAGMA wal_checkpoint(TRUNCATE)")
    .catch(() => undefined);
  client.close();
  const wal = `${databasePath}-wal`;
  if (fs.existsSync(wal)) assert.equal(fs.statSync(wal).size, 0);
  for (const suffix of ["-wal", "-shm"] as const) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true });
  }
}

async function adjacentDigests(client: Client): Promise<Map<string, string>> {
  const brands = PHASE606_TARGETS.map(({ brandEntityId }) => brandEntityId);
  const targets = PHASE606_TARGETS.map(({ entityId }) => entityId);
  const rows = await client.execute({
    sql: `
      SELECT DISTINCT public.id
      FROM public_entities public
      WHERE public.id IN (${brands.map(() => "?").join(",")})
         OR public.id IN (
           SELECT source_id FROM entity_links
           WHERE link_type='made_by'
             AND target_id IN (${brands.map(() => "?").join(",")})
             AND source_id NOT IN (${targets.map(() => "?").join(",")})
         )
      ORDER BY public.id
    `,
    args: [...brands, ...brands, ...targets],
  });
  const digests = new Map<string, string>();
  for (const row of rows.rows) {
    const id = String(row.id);
    digests.set(id, await computePublicationContentHash(client, id));
  }
  return digests;
}

test("Phase 606 rejects remote selectors without touching protected families", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const { ownedRoot, databasePath } = ownedCopy(sourceSnapshot);
  const candidateBefore = snapshotCatalogFiles(databasePath);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    for (const key of REMOTE_KEYS) {
      await assert.rejects(
        applyPhase606PublicCareRefresh(client, {
          ...optionsFor(ownedRoot, databasePath, realSnapshot),
          env: { ...cleanEnv(), [key]: "remote-selection-must-fail" },
        }),
        new RegExp(key),
      );
      assertCatalogSnapshotUnchanged(candidateBefore);
      assertCatalogSnapshotUnchanged(sourceSnapshot);
      assertCatalogSnapshotUnchanged(realSnapshot);
    }
  } finally {
    client.close();
  }
});

test("Phase 606 rejects symlink, hard-link and non-empty SQLite companion inputs", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);

  {
    const { ownedRoot, databasePath } = ownedCopy(sourceSnapshot);
    const symlink = path.join(ownedRoot, "catalog-symlink.db");
    fs.symlinkSync(databasePath, symlink);
    const client = createClient({ url: `file:${symlink}` });
    try {
      await assert.rejects(
        applyPhase606PublicCareRefresh(
          client,
          optionsFor(ownedRoot, symlink, realSnapshot),
        ),
        /non-symlink/,
      );
    } finally {
      client.close();
    }
  }

  {
    const { ownedRoot, databasePath } = ownedCopy(sourceSnapshot);
    fs.linkSync(databasePath, path.join(ownedRoot, "catalog-hardlink.db"));
    const client = createClient({ url: `file:${databasePath}` });
    try {
      await assert.rejects(
        applyPhase606PublicCareRefresh(
          client,
          optionsFor(ownedRoot, databasePath, realSnapshot),
        ),
        /hard-link/,
      );
    } finally {
      client.close();
    }
  }

  for (const suffix of ["-wal", "-shm"] as const) {
    const { ownedRoot, databasePath } = ownedCopy(sourceSnapshot);
    const client = createClient({ url: `file:${databasePath}` });
    fs.writeFileSync(`${databasePath}${suffix}`, "phase606-stale-companion");
    try {
      await assert.rejects(
        applyPhase606PublicCareRefresh(
          client,
          optionsFor(ownedRoot, databasePath, realSnapshot),
        ),
        /non-empty SQLite companion/,
      );
    } finally {
      client.close();
    }
  }
  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(realSnapshot);
});

test("Phase 606 refuses id, slug, name, alias and source-ownership collisions", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const target = PHASE606_TARGETS[0];
  const mutations: Array<{
    label: string;
    sql: string;
    args: unknown[];
    expected: RegExp;
  }> = [
    {
      label: "id/type",
      sql: "UPDATE entities SET type='brand' WHERE id=?",
      args: [target.entityId],
      expected: /identity collision/,
    },
    {
      label: "slug",
      sql: `
        UPDATE entities SET slug=slug || '-moved' WHERE id=?;
        INSERT INTO entities(id,type,slug,name) VALUES('phase606-slug-collision','pen',?,'Phase 606 collision')
      `,
      args: [target.entityId, target.slug],
      expected: /identity collision/,
    },
    {
      label: "name",
      sql: "INSERT INTO entities(id,type,slug,name) VALUES('phase606-name-collision','pen','phase606-name-collision',?)",
      args: [target.canonicalName],
      expected: /identity collision/,
    },
    {
      label: "alias",
      sql: `
        INSERT INTO entity_aliases(
          id,entity_id,alias,language,source_id,alias_kind,market,source_item_id,review_status
        )
        SELECT 'phase606-alias-collision', ?, ?, language, source_id, alias_kind,
               market, source_item_id, review_status
        FROM entity_aliases WHERE entity_id=? LIMIT 1
      `,
      args: [target.brandEntityId, "Ipsilon Demo Colors", target.entityId],
      expected: /alias collision/,
    },
    {
      label: "source ownership",
      sql: "UPDATE entities SET source='curated-content:foreign-owner:deadbeef' WHERE id=?",
      args: [target.entityId],
      expected: /source ownership mismatch/,
    },
  ];

  for (const mutation of mutations) {
    const { ownedRoot, databasePath } = ownedCopy(sourceSnapshot);
    let client = createClient({ url: `file:${databasePath}` });
    if (mutation.label === "slug") {
      await client.execute({
        sql: "UPDATE entities SET slug=slug || '-moved' WHERE id=?",
        args: [target.entityId],
      });
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES('phase606-slug-collision','pen',?,'Phase 606 collision')",
        args: [target.slug],
      });
    } else {
      await client.execute({
        sql: mutation.sql,
        args: mutation.args as never[],
      });
    }
    await checkpointAndClose(client, databasePath);
    client = createClient({ url: `file:${databasePath}` });
    try {
      await assert.rejects(
        applyPhase606PublicCareRefresh(
          client,
          optionsFor(ownedRoot, databasePath, realSnapshot),
        ),
        mutation.expected,
        mutation.label,
      );
    } finally {
      client.close();
    }
  }
  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(realSnapshot);
});

test("Phase 606 target-only refresh publishes once and replays as a full noop", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const { ownedRoot, databasePath } = ownedCopy(sourceSnapshot);
  const options = optionsFor(ownedRoot, databasePath, realSnapshot);
  let client = createClient({ url: `file:${databasePath}` });
  const adjacentBefore = await adjacentDigests(client);
  assert.ok(
    adjacentBefore.size >= 6,
    "expected brands and public sibling digest coverage",
  );
  await checkpointAndClose(client, databasePath);
  client = createClient({ url: `file:${databasePath}` });

  for (const [index, target] of PHASE606_TARGETS.entries()) {
    const pack = phase606PublicCareRefreshPacks[index];
    assert.equal(pack?.entityId, target.entityId);
    assert.equal(pack?.spec?.brandEntityId, target.brandEntityId);
    assert.equal(pack?.media[0]?.localPath, target.primaryMediaPath);
    assert.equal(
      sha256(
        path.join(ROOT, "public", target.primaryMediaPath.replace(/^\//, "")),
      ),
      target.primaryMediaSha256,
    );
  }

  const first = await applyPhase606PublicCareRefresh(client, options);
  assert.deepEqual(
    first.entities.map(({ entityId, outcome }) => [entityId, outcome]),
    PHASE606_TARGETS.map(({ entityId }) => [entityId, "published"]),
  );
  assert.deepEqual(await adjacentDigests(client), adjacentBefore);

  const expectedBodyMarkers = [
    [
      "phase115-aurora-ipsilon-demo-colors",
      /使用与维护：先确认 cartridge 还是 converter/,
    ],
    ["phase106-sheaffer-imperial", /使用与维护：两条供墨路线，两套动作/],
    ["a1t4DNomp4Ge", /使用与维护：清洗发生在四个时点/],
  ] as const;
  for (const [entityId, bodyMarker] of expectedBodyMarkers) {
    const target = PHASE606_TARGETS.find((item) => item.entityId === entityId);
    const pack = phase606PublicCareRefreshPacks.find(
      (item) => item.entityId === entityId,
    );
    assert.ok(target && pack);
    const publicRow = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [entityId],
      })
    ).rows[0];
    assert.deepEqual(
      [publicRow?.id, publicRow?.type, publicRow?.slug, publicRow?.name],
      [entityId, "pen", target.slug, target.canonicalName],
    );
    assert.match(String(publicRow?.body_md), bodyMarker);
    const maker = await client.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [entityId],
    });
    assert.deepEqual(
      maker.rows.map((row) => String(row.target_id)),
      [target.brandEntityId],
    );
    const aliases = await client.execute({
      sql: "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
      args: [entityId],
    });
    assert.deepEqual(
      aliases.rows.map((row) => String(row.alias)).sort(),
      pack.aliases.map(({ alias }) => alias).sort(),
    );
    const publication = (
      await client.execute({
        sql: "SELECT status,blockers_json,approved_content_hash FROM entity_publications WHERE entity_id=?",
        args: [entityId],
      })
    ).rows[0];
    assert.equal(String(publication?.status), "published");
    assert.equal(String(publication?.blockers_json), "[]");
    const hash = await computePublicationContentHash(client, entityId);
    assert.equal(String(publication?.approved_content_hash), hash);
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' ORDER BY review_kind",
          args: [entityId, hash],
        })
      ).rows.map((row) => String(row.review_kind)),
      ["fact", "language", "media", "publication"],
    );
  }

  await checkpointAndClose(client, databasePath);
  const afterFirst = snapshotCatalogFiles(databasePath);
  client = createClient({ url: `file:${databasePath}` });
  const replay = await applyPhase606PublicCareRefresh(client, options);
  assert.deepEqual(
    replay.entities.map(({ outcome }) => outcome),
    ["noop", "noop", "noop"],
  );
  await checkpointAndClose(client, databasePath);
  assertCatalogSnapshotUnchanged(afterFirst);
  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(realSnapshot);
});
