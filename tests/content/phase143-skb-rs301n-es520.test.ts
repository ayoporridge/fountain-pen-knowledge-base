import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase143Options,
  applyPhase143SkbRs301nEs520Content,
} from "../../scripts/apply-phase143-skb-rs301n-es520-content";
import {
  PHASE143_BRAND_ID,
  PHASE143_IDS,
  PHASE143_LEGACY_ID,
  PHASE143_SLUGS,
  phase143Packs,
} from "../../scripts/data/phase143-skb-rs301n-es520-batch";
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

test("Phase 143 publishes SKB RS-301N and ES-520 while retiring the mixed Penton page", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase143-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase143Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase143-test",
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
    assert.equal(phase143Packs.length, 3);
    for (const pack of phase143Packs) {
      const markdown = fs.readFileSync(
        path.join(ROOT_CANONICAL, pack.markdownFile),
        "utf8",
      );
      assert.ok(
        Array.from(markdown).length >=
          (pack.expectedType === "brand" ? 1_700 : 2_000),
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
      const svg = fs.readFileSync(mediaPath, "utf8");
      assert.ok(svg.length > 100, mediaPath);
      assert.match(svg, /non-photo/);
      assert.match(svg, /non-logo/);
      assert.match(svg, /not-to-scale/);
      assert.match(svg, /non-colour-proof/);
    }
    await assert.rejects(
      () =>
        applyPhase143SkbRs301nEs520Content(client, {
          ...options,
          reviewer: " ",
        }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      () =>
        applyPhase143SkbRs301nEs520Content(client, {
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
    const first = await applyPhase143SkbRs301nEs520Content(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );
    for (const pack of phase143Packs) {
      const state = (
        await rows(
          client,
          "SELECT entity.type,entity.slug,entity.name,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
          [pack.entityId],
        )
      )[0];
      assert.equal(state?.type, pack.expectedType, pack.entityId);
      assert.equal(state?.slug, pack.expectedSlug, pack.entityId);
      assert.equal(state?.name, pack.canonicalName, pack.entityId);
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
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            [PHASE143_IDS.rs301n, PHASE143_BRAND_ID],
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
            "SELECT count(*) n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            [PHASE143_IDS.es520, PHASE143_BRAND_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    const legacy = (
      await rows(
        client,
        "SELECT publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
        [PHASE143_LEGACY_ID],
      )
    )[0];
    assert.equal(legacy?.status, "retired");
    assert.equal(Number(legacy?.is_public), 0);
    const route = (
      await rows(
        client,
        "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
        [`/pen/${PHASE143_SLUGS.legacy}`],
      )
    )[0];
    assert.equal(route?.target_path, null);
    assert.equal(route?.redirect_kind, "hard_404");
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) n FROM entity_links WHERE source_id=? OR target_id=?",
            [PHASE143_LEGACY_ID, PHASE143_LEGACY_ID],
          )
        )[0]?.n,
      ),
      0,
    );
    const replay = await applyPhase143SkbRs301nEs520Content(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    clearInterval(keepAlive);
    client.close();
  }
});
