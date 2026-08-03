import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase388Options,
  applyPhase388WancherTsuikinKanhizakuraContent,
} from "../../scripts/apply-phase388-wancher-tsuikin-kanhizakura-content";
import {
  PHASE388_TSUIKIN_KANHIZAKURA_ID,
  PHASE388_WANCHER_BRAND_ID,
  phase388WancherTsuikinKanhizakuraPacks,
} from "../../scripts/data/phase388-wancher-tsuikin-kanhizakura";
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

test("Phase 388 publishes Wancher Tsuikin Kanhizakura on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase388-wancher-tsuikin-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase388Options = {
    workspaceRoot: ROOT,
    reviewer: "phase388-wancher-tsuikin-kanhizakura-test",
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
    assert.equal(phase388WancherTsuikinKanhizakuraPacks.length, 2);
    const pack = phase388WancherTsuikinKanhizakuraPacks.find(
      (candidate) => candidate.entityId === PHASE388_TSUIKIN_KANHIZAKURA_ID,
    );
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 8_000);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 6,
    );
    assert.equal(pack.variants?.length, 6);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "nib").length,
      3,
    );
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "variant")
        .length,
      3,
    );
    assert.equal(pack.conflicts?.length, 1);
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
      applyPhase388WancherTsuikinKanhizakuraContent(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase388WancherTsuikinKanhizakuraContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    for (const candidate of phase388WancherTsuikinKanhizakuraPacks) {
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
        PHASE388_TSUIKIN_KANHIZAKURA_ID,
      ])
    )[0];
    const body = String(entity?.body_md ?? "");
    assert.ok(body.length >= 6_500);
    for (const pattern of [
      /Dream Pen/,
      /Tsuikin/,
      /Kanhizakura/,
      /寒绯樱|カンヒザクラ/,
      /Cerasus campanulata/,
      /Ebonite/,
      /堆锦|堆錦/,
      /水牛角/,
      /JoWo #6/,
      /Shogun 18K/,
      /Keiryu/,
      /plastic feed|plastic/,
      /ebonite black/,
      /European International Standard/,
      /气密|air-tight/,
      /70–80%|70-80%/,
      /一至二月|一月至二月/,
      /未公布/,
      /选购|下单/,
      /[¥￥]132,000/,
      /\$1,000/,
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
            [PHASE388_TSUIKIN_KANHIZAKURA_ID],
          )
        )[0]?.brand_entity_id,
      ),
      PHASE388_WANCHER_BRAND_ID,
    );
    const spec = (
      await rows(
        client,
        "SELECT nib,fill_system,material,dimensions,weight,price_range,status FROM model_specs WHERE entity_id=?",
        [PHASE388_TSUIKIN_KANHIZAKURA_ID],
      )
    )[0];
    assert.match(String(spec?.nib), /JoWo.*Shogun.*Keiryu/i);
    assert.match(String(spec?.fill_system), /cartridge.*converter/i);
    assert.match(String(spec?.material), /Ebonite.*Tsuikin/i);
    assert.match(String(spec?.material), /conflict/i);
    assert.match(String(spec?.dimensions), /未公布|Size & Shape/);
    assert.match(String(spec?.weight), /未公布/);
    assert.match(String(spec?.price_range), /132,000|1,000/);

    const variants = await rows(
      client,
      "SELECT variant_name AS name,variant_kind FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE388_TSUIKIN_KANHIZAKURA_ID],
    );
    assert.equal(variants.length, 6);
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "nib").length,
      3,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "variant").length,
      3,
    );

    const conflicts = await rows(
      client,
      "SELECT field_key,status,resolution_note FROM fact_conflicts WHERE entity_id=?",
      [PHASE388_TSUIKIN_KANHIZAKURA_ID],
    );
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0]?.field_key, "material");
    assert.equal(conflicts[0]?.status, "resolved");
    assert.match(String(conflicts[0]?.resolution_note), /Ebonite.*Tsuikin/);
    const members = await rows(
      client,
      "SELECT asserted_value FROM fact_conflict_members member JOIN fact_conflicts conflict ON conflict.id=member.conflict_id WHERE conflict.entity_id=? ORDER BY asserted_value",
      [PHASE388_TSUIKIN_KANHIZAKURA_ID],
    );
    assert.equal(members.length, 2);
    assert.match(
      members.map((row) => String(row.asserted_value)).join(" "),
      /水牛角/,
    );

    const links = await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? AND target_id=?) OR (source_id=? AND target_id=?) ORDER BY link_type",
      [
        PHASE388_TSUIKIN_KANHIZAKURA_ID,
        PHASE388_WANCHER_BRAND_ID,
        PHASE388_WANCHER_BRAND_ID,
        PHASE388_TSUIKIN_KANHIZAKURA_ID,
      ],
    );
    assert.deepEqual(
      links.map((row) => `${row.source_id}:${row.target_id}:${row.link_type}`),
      [
        `${PHASE388_TSUIKIN_KANHIZAKURA_ID}:${PHASE388_WANCHER_BRAND_ID}:made_by`,
        `${PHASE388_WANCHER_BRAND_ID}:${PHASE388_TSUIKIN_KANHIZAKURA_ID}:reverse`,
      ],
    );

    const replay = await applyPhase388WancherTsuikinKanhizakuraContent(
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
