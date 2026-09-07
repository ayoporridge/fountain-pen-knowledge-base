import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase621Options,
  applyPhase621Nettuno1911,
} from "../../scripts/apply-phase621-nettuno-1911";
import {
  PHASE621_NETTUNO_BRAND_ID,
  PHASE621_NETTUNO_PELAGOS_ID,
  phase621NettunoPacks,
} from "../../scripts/data/phase621-nettuno-1911";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

function createOwnedCopy(prefix: string) {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshotCatalogFiles(REAL) },
  );
  return { ownedRoot, databasePath: copy.destinationPath };
}

function options(
  ownedRoot: string,
  databasePath: string,
  env: Record<string, string | undefined> = {},
): ApplyPhase621Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase621-nettuno-1911-test",
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

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

test("Phase 621 publishes Nettuno 1911 and Pelagos Matte only on an owned copy", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);

  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    const copy = createOwnedCopy(`fpkg-phase621-remote-${key.toLowerCase()}-`);
    const client = createClient({ url: `file:${copy.databasePath}` });
    try {
      await assert.rejects(
        () =>
          applyPhase621Nettuno1911(
            client,
            options(copy.ownedRoot, copy.databasePath, {
              [key]: "libsql://remote.invalid",
            }),
          ),
        new RegExp(`refuses inherited remote database selection: ${key}`),
      );
    } finally {
      client.close();
      fs.rmSync(copy.ownedRoot, { recursive: true, force: true });
    }
  }

  const collision = createOwnedCopy("fpkg-phase621-collision-");
  const collisionClient = createClient({
    url: `file:${collision.databasePath}`,
  });
  try {
    await collisionClient.execute(
      "INSERT INTO entities(id,type,slug,name) VALUES('phase621-alias-owner','brand','phase621-alias-owner','Alias owner')",
    );
    await collisionClient.execute(
      "INSERT INTO entity_aliases(id,entity_id,alias,language,review_status) VALUES('phase621-alias-collision','phase621-alias-owner','Nettuno','en','pending')",
    );
    await assert.rejects(
      () =>
        applyPhase621Nettuno1911(
          collisionClient,
          options(collision.ownedRoot, collision.databasePath),
        ),
      /alias or name collision/,
    );
  } finally {
    collisionClient.close();
    fs.rmSync(collision.ownedRoot, { recursive: true, force: true });
  }

  const main = createOwnedCopy("fpkg-phase621-main-");
  const client = createClient({ url: `file:${main.databasePath}` });
  try {
    const before = {
      brands: Number(
        (
          await rows(
            client,
            "SELECT COUNT(*) AS count FROM public_entities WHERE type='brand'",
          )
        )[0]?.count ?? 0,
      ),
      pens: Number(
        (
          await rows(
            client,
            "SELECT COUNT(*) AS count FROM public_entities WHERE type='pen'",
          )
        )[0]?.count ?? 0,
      ),
    };
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT COUNT(*) AS count FROM entities WHERE id IN (?,?)",
            [PHASE621_NETTUNO_BRAND_ID, PHASE621_NETTUNO_PELAGOS_ID],
          )
        )[0]?.count ?? 0,
      ),
      0,
    );

    const applyOptions = options(main.ownedRoot, main.databasePath);
    const first = await applyPhase621Nettuno1911(client, applyOptions);
    assert.equal(first.entities.length, 2);
    assert.ok(first.entities.every(({ outcome }) => outcome === "published"));
    assert.deepEqual(
      {
        brands: Number(
          (
            await rows(
              client,
              "SELECT COUNT(*) AS count FROM public_entities WHERE type='brand'",
            )
          )[0]?.count ?? 0,
        ),
        pens: Number(
          (
            await rows(
              client,
              "SELECT COUNT(*) AS count FROM public_entities WHERE type='pen'",
            )
          )[0]?.count ?? 0,
        ),
      },
      { brands: before.brands + 1, pens: before.pens + 1 },
    );

    for (const pack of phase621NettunoPacks) {
      const state = await rows(
        client,
        `SELECT entity.type,entity.slug,entity.name,publication.status,
                  readiness.blocker_count,readiness.publishable,
                  CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
             FROM entities entity
             JOIN entity_publications publication ON publication.entity_id=entity.id
             LEFT JOIN public_entity_readiness readiness
               ON readiness.entity_id=entity.id AND readiness.contract_version=3
             LEFT JOIN public_entities public ON public.id=entity.id
            WHERE entity.id=?`,
        [pack.entityId],
      );
      assert.deepEqual(state, [
        {
          type: pack.expectedType,
          slug: pack.expectedSlug,
          name: pack.canonicalName,
          status: "published",
          blocker_count: 0,
          publishable: 1,
          is_public: 1,
        },
      ]);
      assert.deepEqual(
        (
          await rows(
            client,
            "SELECT review_kind FROM entity_content_reviews WHERE entity_id=? AND status='approved' ORDER BY review_kind",
            [pack.entityId],
          )
        ).map((row) => row.review_kind),
        ["fact", "language", "media", "publication"],
      );
      assert.equal(
        Array.from(
          String(
            (
              await rows(client, "SELECT body_md FROM entities WHERE id=?", [
                pack.entityId,
              ])
            )[0]?.body_md ?? "",
          ),
        ).length >= (pack.expectedType === "brand" ? 1200 : 2000),
        true,
      );
    }

    assert.deepEqual(
      await rows(
        client,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [PHASE621_NETTUNO_PELAGOS_ID],
      ),
      [{ target_id: PHASE621_NETTUNO_BRAND_ID }],
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT source_id FROM entity_links WHERE target_id=? AND link_type='reverse'",
        [PHASE621_NETTUNO_PELAGOS_ID],
      ),
      [{ source_id: PHASE621_NETTUNO_BRAND_ID }],
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT COUNT(*) AS count FROM model_specs WHERE entity_id=?",
            [PHASE621_NETTUNO_PELAGOS_ID],
          )
        )[0]?.count ?? 0,
      ),
      1,
    );

    const targetHashes = new Map<string, string>();
    for (const pack of phase621NettunoPacks) {
      targetHashes.set(
        pack.entityId,
        String(
          (
            await rows(
              client,
              "SELECT approved_content_hash FROM entity_publications WHERE entity_id=?",
              [pack.entityId],
            )
          )[0]?.approved_content_hash,
        ),
      );
    }
    const replay = await applyPhase621Nettuno1911(client, applyOptions);
    assert.equal(replay.entities.length, 2);
    assert.ok(replay.entities.every(({ outcome }) => outcome === "noop"));
    for (const pack of phase621NettunoPacks) {
      assert.equal(
        String(
          (
            await rows(
              client,
              "SELECT approved_content_hash FROM entity_publications WHERE entity_id=?",
              [pack.entityId],
            )
          )[0]?.approved_content_hash,
        ),
        targetHashes.get(pack.entityId),
      );
    }
  } finally {
    client.close();
    fs.rmSync(main.ownedRoot, { recursive: true, force: true });
  }

  const svgPaths = phase621NettunoPacks.map((pack) =>
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
  }
  assertCatalogSnapshotUnchanged(realSnapshot);
});
