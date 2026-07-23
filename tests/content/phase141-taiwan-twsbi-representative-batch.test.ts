import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase141Options,
  applyPhase141TaiwanTwsbiRepresentativeContent,
} from "../../scripts/apply-phase141-taiwan-twsbi-representative-content";
import {
  loadPhase141Packs,
  PHASE141_BRANDS,
  PHASE141_IDS,
  PHASE141_SLUGS,
} from "../../scripts/data/phase141-taiwan-twsbi-representative-batch";
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

test("Phase 141 publishes Taiwan/TWSBI packs on an owned copy and resolves mixed 580 identity", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase141-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase141Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase141-test",
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
    const packs = loadPhase141Packs(ROOT_CANONICAL);
    assert.equal(
      packs.filter((pack) => pack.expectedType === "brand").length,
      6,
    );
    assert.equal(packs.filter((pack) => pack.expectedType === "pen").length, 8);
    assert.equal(packs.length, 14);
    for (const pack of packs) {
      assert.equal(
        pack.bodyMd.length >= (pack.expectedType === "brand" ? 900 : 1_500),
        true,
        pack.entityId,
      );
      assert.equal(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          2,
        true,
        pack.entityId,
      );
      const localPath = pack.media[0]?.localPath;
      if (!localPath)
        throw new Error(`Missing primary media path: ${pack.entityId}`);
      const mediaPath = path.join(
        ROOT_CANONICAL,
        "public",
        localPath.replace(/^\//, ""),
      );
      assert.equal(fs.statSync(mediaPath).size > 0, true, localPath);
      const svg = fs.readFileSync(mediaPath, "utf8");
      assert.match(svg, /1600/);
      assert.match(svg, /900/);
      assert.match(svg, /non-photo/);
      assert.match(svg, /non-logo/);
      assert.match(svg, /not-to-scale/);
      assert.match(svg, /non-colour-proof/);
    }
    await assert.rejects(
      applyPhase141TaiwanTwsbiRepresentativeContent(client, {
        ...options,
        reviewer: " ",
      }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase141TaiwanTwsbiRepresentativeContent(client, {
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
    const first = await applyPhase141TaiwanTwsbiRepresentativeContent(
      client,
      options,
    );
    assert.equal(first.cypress.status, "rejected");
    assert.match(first.cypress.reason, /do not establish Mr\. Cypress/);
    assert.equal(first.entities.length, 12);
    const newTargets = packs.filter(
      (pack) =>
        ![PHASE141_BRANDS.opus88, PHASE141_BRANDS.twsbi].includes(
          pack.entityId as never,
        ),
    );
    for (const pack of newTargets) {
      const state = (
        await rows(
          client,
          "SELECT entity.slug,entity.name,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
          [pack.entityId],
        )
      )[0];
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
    for (const brandId of [PHASE141_BRANDS.opus88, PHASE141_BRANDS.twsbi]) {
      const state = (
        await rows(
          client,
          "SELECT publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entity_publications publication LEFT JOIN public_entities public ON public.id=publication.entity_id WHERE publication.entity_id=?",
          [brandId],
        )
      )[0];
      assert.equal(state?.status, "published", brandId);
      assert.equal(Number(state?.is_public), 1, brandId);
    }
    const mixed = (
      await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [
        PHASE141_IDS.diamond580,
      ])
    )[0];
    assert.deepEqual(mixed, {
      id: PHASE141_IDS.diamond580,
      type: "pen",
      slug: PHASE141_SLUGS.diamond580,
      name: "三文堂 TWSBI Diamond 580",
    });
    const alr = (
      await rows(client, "SELECT type,slug,name FROM entities WHERE id=?", [
        PHASE141_IDS.diamond580alr,
      ])
    )[0];
    assert.deepEqual(alr, {
      type: "pen",
      slug: PHASE141_SLUGS.diamond580alr,
      name: "三文堂 TWSBI Diamond 580ALR",
    });
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) n FROM entity_redirects WHERE source_path=? AND target_path=?",
            [
              "/pen/三文堂-twsbi-580-580al",
              `/pen/${PHASE141_SLUGS.diamond580}`,
            ],
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
            [PHASE141_IDS.diamond580, PHASE141_BRANDS.twsbi],
          )
        )[0]?.n,
      ),
      1,
    );
    const replay = await applyPhase141TaiwanTwsbiRepresentativeContent(
      client,
      options,
    );
    assert.equal(replay.entities.length, 12);
    assert.equal(
      replay.entities.every((entity) => entity.outcome === "noop"),
      true,
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    clearInterval(keepAlive);
    client.close();
  }
});
