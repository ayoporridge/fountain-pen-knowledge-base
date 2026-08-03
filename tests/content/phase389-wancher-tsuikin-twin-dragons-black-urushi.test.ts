import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase389Options,
  applyPhase389WancherTwinDragonsBlackContent,
} from "../../scripts/apply-phase389-wancher-tsuikin-twin-dragons-black-urushi-content";
import {
  PHASE389_TWIN_DRAGONS_BLACK_ID,
  PHASE389_WANCHER_BRAND_ID,
  phase389WancherTwinDragonsBlackPacks,
} from "../../scripts/data/phase389-wancher-tsuikin-twin-dragons-black-urushi";
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

test("Phase 389 publishes Wancher Twin Dragons Black Urushi on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase389-wancher-twin-dragons-"),
    ),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase389Options = {
    workspaceRoot: ROOT,
    reviewer: "phase389-wancher-twin-dragons-black-test",
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
    assert.equal(phase389WancherTwinDragonsBlackPacks.length, 2);
    const pack = phase389WancherTwinDragonsBlackPacks.find(
      (candidate) => candidate.entityId === PHASE389_TWIN_DRAGONS_BLACK_ID,
    );
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 8_000);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 5,
    );
    assert.equal(pack.variants?.length, 7);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "nib").length,
      2,
    );
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "variant")
        .length,
      3,
    );
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      2,
    );
    assert.equal(pack.conflicts?.length ?? 0, 0);
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
    ]) {
      assert.match(svg, marker);
    }

    await assert.rejects(
      applyPhase389WancherTwinDragonsBlackContent(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase389WancherTwinDragonsBlackContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    for (const candidate of phase389WancherTwinDragonsBlackPacks) {
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

    const body = String(
      (
        await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
          PHASE389_TWIN_DRAGONS_BLACK_ID,
        ])
      )[0]?.body_md ?? "",
    );
    assert.ok(body.length >= 6_200);
    for (const pattern of [
      /Twin Dragons/,
      /Black Urushi/,
      /双龙/,
      /琉球|Ryukyu/,
      /Tsuikin/,
      /Ebonite/,
      /Urushi/,
      /铂粉|铂.*金粉|platinum.*gold/i,
      /JoWo/,
      /Wancher 18K/,
      /plastic feed|plastic/,
      /ebonite black/,
      /European International Standard/,
      /气密|air-tight/,
      /Type A/,
      /Type B/,
      /Sold out/,
      /\$1,000/,
      /未公布/,
      /维护|护理/,
      /选购|下单|购买/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|仓库/i);

    assert.equal(
      String(
        (
          await rows(
            client,
            "SELECT brand_entity_id FROM model_specs WHERE entity_id=?",
            [PHASE389_TWIN_DRAGONS_BLACK_ID],
          )
        )[0]?.brand_entity_id,
      ),
      PHASE389_WANCHER_BRAND_ID,
    );
    const spec = (
      await rows(
        client,
        "SELECT nib,fill_system,material,dimensions,weight,price_range,status FROM model_specs WHERE entity_id=?",
        [PHASE389_TWIN_DRAGONS_BLACK_ID],
      )
    )[0];
    assert.match(String(spec?.nib), /JoWo.*18K/i);
    assert.match(String(spec?.fill_system), /cartridge.*converter/i);
    assert.match(String(spec?.material), /Ebonite.*Urushi.*Tsuikin/i);
    assert.match(String(spec?.dimensions), /未公布|Size & Shape/);
    assert.match(String(spec?.weight), /未公布/);
    assert.match(String(spec?.price_range), /1,000/);
    assert.match(String(spec?.status), /Sold out/i);

    const variants = await rows(
      client,
      "SELECT variant_name AS name,variant_kind FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE389_TWIN_DRAGONS_BLACK_ID],
    );
    assert.equal(variants.length, 7);
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "nib").length,
      2,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "variant").length,
      3,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "market_sku")
        .length,
      2,
    );

    const conflicts = await rows(
      client,
      "SELECT count(*) n FROM fact_conflicts WHERE entity_id=?",
      [PHASE389_TWIN_DRAGONS_BLACK_ID],
    );
    assert.equal(Number(conflicts[0]?.n), 0);
    const links = await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? AND target_id=?) OR (source_id=? AND target_id=?) ORDER BY link_type",
      [
        PHASE389_TWIN_DRAGONS_BLACK_ID,
        PHASE389_WANCHER_BRAND_ID,
        PHASE389_WANCHER_BRAND_ID,
        PHASE389_TWIN_DRAGONS_BLACK_ID,
      ],
    );
    assert.deepEqual(
      links.map((row) => `${row.source_id}:${row.target_id}:${row.link_type}`),
      [
        `${PHASE389_TWIN_DRAGONS_BLACK_ID}:${PHASE389_WANCHER_BRAND_ID}:made_by`,
        `${PHASE389_WANCHER_BRAND_ID}:${PHASE389_TWIN_DRAGONS_BLACK_ID}:reverse`,
      ],
    );

    const replay = await applyPhase389WancherTwinDragonsBlackContent(
      client,
      options,
    );
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    clearInterval(keepAlive);
    client.close();
  }
});
