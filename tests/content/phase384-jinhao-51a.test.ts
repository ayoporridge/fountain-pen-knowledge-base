import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase384Options,
  applyPhase384Jinhao51AContent,
} from "../../scripts/apply-phase384-jinhao-51a-content";
import {
  PHASE384_51A_ID,
  PHASE384_51A_NAME,
  PHASE384_51A_SLUG,
  PHASE384_JINHAO_BRAND_ID,
  phase384Jinhao51APacks,
} from "../../scripts/data/phase384-jinhao-51a";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function rows(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

test("Phase 384 publishes Jinhao 51A on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase384-jinhao-51a-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase384Options = {
    workspaceRoot: ROOT,
    reviewer: "phase384-jinhao-51a-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
  try {
    await migrateDatabase(client);
    assert.equal(phase384Jinhao51APacks.length, 2);
    const pack = phase384Jinhao51APacks.find(
      (candidate) => candidate.entityId === PHASE384_51A_ID,
    );
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 5_000);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 6,
    );
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "material")
        .length,
      2,
    );
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "nib").length,
      2,
    );
    const media = pack.media[0];
    assert.ok(media?.localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", media.localPath.replace(/^\//, "")),
      "utf8",
    );
    for (const marker of [
      /non-photo/i,
      /non-logo/i,
      /not-to-scale/i,
      /non-colour-proof/i,
    ])
      assert.match(svg, marker);

    await assert.rejects(
      applyPhase384Jinhao51AContent(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase384Jinhao51AContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    for (const candidate of phase384Jinhao51APacks) {
      const state = (
        await rows(
          client,
          "SELECT entity.type,entity.slug,entity.name,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
          [candidate.entityId],
        )
      )[0];
      assert.equal(state?.type, candidate.expectedType, candidate.entityId);
      assert.equal(state?.slug, candidate.expectedSlug, candidate.entityId);
      assert.equal(state?.name, candidate.canonicalName, candidate.entityId);
      assert.equal(state?.status, "published", candidate.entityId);
      assert.equal(Number(state?.is_public), 1, candidate.entityId);
      const contentHash = await computePublicationContentHash(
        client,
        candidate.entityId,
      );
      const reviews = await rows(
        client,
        "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        [candidate.entityId, contentHash],
      );
      assert.deepEqual(
        reviews.map(
          (row) => `${String(row.review_kind)}:${String(row.status)}`,
        ),
        [
          "fact:approved",
          "language:approved",
          "media:approved",
          "publication:approved",
        ],
      );
    }

    const entity = (
      await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
        PHASE384_51A_ID,
      ])
    )[0];
    const body = String(entity?.body_md ?? "");
    assert.ok(body.length >= 3_500);
    for (const pattern of [
      /Jinhao 51A/,
      /Parker 51/,
      /hooded/,
      /open #5|exposed/i,
      /墨囊／转换器|cartridge[\s\S]*converter/i,
      /139 mm/,
      /20 g/,
      /维护/,
      /选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|仓库/i);
    assert.equal(
      String(
        (
          await rows(
            client,
            "SELECT brand_entity_id FROM model_specs WHERE entity_id=?",
            [PHASE384_51A_ID],
          )
        )[0]?.brand_entity_id,
      ),
      PHASE384_JINHAO_BRAND_ID,
    );
    const spec = (
      await rows(
        client,
        "SELECT nib,fill_system,material,dimensions,weight,price_range,status FROM model_specs WHERE entity_id=?",
        [PHASE384_51A_ID],
      )
    )[0];
    assert.match(String(spec?.nib), /hooded.*open|open.*hooded/i);
    assert.match(
      String(spec?.fill_system),
      /墨囊.*转换器|cartridge.*converter/i,
    );
    assert.match(String(spec?.material), /acrylic|plastic|wood|树脂|木/i);
    assert.match(String(spec?.dimensions), /139/);
    assert.match(String(spec?.weight), /20/);
    assert.match(String(spec?.status), /51A/);
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) n FROM model_variants WHERE model_entity_id=?",
            [PHASE384_51A_ID],
          )
        )[0]?.n,
      ),
      4,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) n FROM entity_references WHERE entity_id=?",
            [PHASE384_51A_ID],
          )
        )[0]?.n,
      ),
      pack.sources.length,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) n FROM media_assets WHERE entity_id=? AND review_status='approved' AND usage_status='primary'",
            [PHASE384_51A_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    const groups = (
      await rows(
        client,
        "SELECT primary_archive_group_count,professional_secondary_group_count FROM publication_v2_source_group_counts WHERE entity_id=?",
        [PHASE384_51A_ID],
      )
    )[0];
    assert.ok(Number(groups?.primary_archive_group_count) >= 1);
    assert.ok(Number(groups?.professional_secondary_group_count) >= 4);
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) n FROM fact_conflicts WHERE entity_id=?",
            [PHASE384_51A_ID],
          )
        )[0]?.n,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            [PHASE384_51A_ID, PHASE384_JINHAO_BRAND_ID],
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
            [PHASE384_JINHAO_BRAND_ID, PHASE384_51A_ID],
          )
        )[0]?.n,
      ),
      1,
    );

    const replay = await applyPhase384Jinhao51AContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT id,type,slug,name FROM entities WHERE id=?",
          [PHASE384_51A_ID],
        )
      )[0],
      {
        id: PHASE384_51A_ID,
        type: "pen",
        slug: PHASE384_51A_SLUG,
        name: PHASE384_51A_NAME,
      },
    );
    assertCatalogSnapshotUnchanged(
      protectedSnapshot,
      snapshotCatalogFiles(REAL),
    );
  } finally {
    clearInterval(keepAlive);
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot, snapshotCatalogFiles(REAL));
});
