import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase142Options,
  applyPhase142FranklinBirminghamContent,
} from "../../scripts/apply-phase142-franklin-birmingham-content";
import {
  loadPhase142Packs,
  PHASE142_BRANDS,
  PHASE142_IDS,
  PHASE142_SLUGS,
} from "../../scripts/data/phase142-franklin-birmingham-batch";
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

test("Phase 142 publishes Franklin-Christoph Model 20 and Birmingham Alumina on an owned copy", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase142-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase142Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase142-test",
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
    const packs = loadPhase142Packs(ROOT_CANONICAL);
    assert.equal(packs.length, 4);
    assert.equal(
      packs.filter((pack) => pack.expectedType === "brand").length,
      2,
    );
    assert.equal(packs.filter((pack) => pack.expectedType === "pen").length, 2);
    for (const pack of packs) {
      const markdown = fs.readFileSync(
        path.join(ROOT_CANONICAL, pack.markdownFile),
        "utf8",
      );
      assert.ok(
        Array.from(markdown).length >=
          (pack.expectedType === "brand" ? 1_600 : 2_400),
        pack.entityId,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          2,
        pack.entityId,
      );
      const media = pack.media[0];
      assert.ok(media?.localPath, pack.entityId);
      const mediaPath = path.join(
        ROOT_CANONICAL,
        "public",
        media.localPath.replace(/^\//, ""),
      );
      assert.ok(fs.statSync(mediaPath).size > 0, mediaPath);
      const svg = fs.readFileSync(mediaPath, "utf8");
      assert.match(svg, /1600/);
      assert.match(svg, /900/);
      assert.match(svg, /non-photo/);
      assert.match(svg, /non-logo/);
      assert.match(svg, /not-to-scale/);
      assert.match(svg, /non-colour-proof/);
    }
    await assert.rejects(
      () =>
        applyPhase142FranklinBirminghamContent(client, {
          ...options,
          reviewer: " ",
        }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      () =>
        applyPhase142FranklinBirminghamContent(client, {
          ...options,
          env: {
            NODE_ENV: "test",
            TURSO_DATABASE_URL: "",
            TURSO_AUTH_TOKEN: "",
            FPKG_DATABASE_URL: "libsql://remote",
          },
        }),
      /inherited remote/,
    );
    const first = await applyPhase142FranklinBirminghamContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published", "published"],
    );
    for (const pack of packs) {
      const state = (
        await rows(
          client,
          "SELECT entity.slug,entity.name,entity.type,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
          [pack.entityId],
        )
      )[0];
      assert.equal(state?.slug, pack.expectedSlug, pack.entityId);
      assert.equal(state?.name, pack.canonicalName, pack.entityId);
      assert.equal(state?.type, pack.expectedType, pack.entityId);
      assert.equal(state?.status, "published", pack.entityId);
      assert.equal(Number(state?.is_public), 1, pack.entityId);
      const hash = await computePublicationContentHash(client, pack.entityId);
      const reviews = await rows(
        client,
        "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        [pack.entityId, hash],
      );
      assert.deepEqual(
        reviews.map((row) => [row.review_kind, row.status]),
        [
          ["fact", "approved"],
          ["language", "approved"],
          ["media", "approved"],
          ["publication", "approved"],
        ],
      );
    }
    for (const [modelId, brandId] of [
      [PHASE142_IDS.model20, PHASE142_BRANDS.franklinChristoph],
      [PHASE142_IDS.aluminaModelC, PHASE142_BRANDS.birmingham],
    ]) {
      assert.equal(
        Number(
          (
            await rows(
              client,
              "SELECT count(*) n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              [modelId, brandId],
            )
          )[0]?.n,
        ),
        1,
      );
      assert.equal(
        Number(
          (
            await rows(
              client,
              "SELECT count(*) n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
              [brandId, modelId],
            )
          )[0]?.n,
        ),
        1,
      );
    }
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) n FROM entities WHERE slug IN (?,?)",
            [PHASE142_SLUGS.model20, PHASE142_SLUGS.aluminaModelC],
          )
        )[0]?.n,
      ),
      2,
    );
    const replay = await applyPhase142FranklinBirminghamContent(
      client,
      options,
    );
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    clearInterval(keepAlive);
    client.close();
  }
});
