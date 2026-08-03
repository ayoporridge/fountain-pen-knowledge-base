import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase387Options,
  applyPhase387WancherHirotaByobuUmeContent,
} from "../../scripts/apply-phase387-wancher-hirota-byobu-e-ume-ni-hanasui-content";
import {
  PHASE387_HIROTA_BYOBU_UME_ID,
  PHASE387_WANCHER_BRAND_ID,
  phase387WancherHirotaByobuUmePacks,
} from "../../scripts/data/phase387-wancher-hirota-byobu-e-ume-ni-hanasui";
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

test("Phase 387 publishes Hirota Byobu-e Ume ni Hanasui on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase387-wancher-hirota-ume-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase387Options = {
    workspaceRoot: ROOT,
    reviewer: "phase387-wancher-hirota-ume-test",
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
    assert.equal(phase387WancherHirotaByobuUmePacks.length, 2);
    const pack = phase387WancherHirotaByobuUmePacks.find(
      (candidate) => candidate.entityId === PHASE387_HIROTA_BYOBU_UME_ID,
    );
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 8_000);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    assert.equal(pack.variants?.length, 11);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "nib").length,
      9,
    );
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "material")
        .length,
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
    ]) {
      assert.match(svg, marker);
    }

    await assert.rejects(
      applyPhase387WancherHirotaByobuUmeContent(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase387WancherHirotaByobuUmeContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    for (const candidate of phase387WancherHirotaByobuUmePacks) {
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
        PHASE387_HIROTA_BYOBU_UME_ID,
      ])
    )[0];
    const body = String(entity?.body_md ?? "");
    assert.ok(body.length >= 6_000);
    for (const pattern of [
      /Hirota Byobu-e/,
      /Ume ni Hanasui/,
      /梅花|梅に花吸/,
      /一支|singular piece/,
      /Ebonite/,
      /Urushi/,
      /24K/,
      /Maki-e/,
      /Byobu-e/,
      /EF/,
      /Keiryu Kodachi/,
      /Shogun 18K/,
      /European International Standard/,
      /塑料 feed|plastic feed/,
      /气密|air-tight/,
      /京都国立博物馆|紫外线/,
      /维护/,
      /选购/,
      /\$2,950 USD/,
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
            [PHASE387_HIROTA_BYOBU_UME_ID],
          )
        )[0]?.brand_entity_id,
      ),
      PHASE387_WANCHER_BRAND_ID,
    );
    const spec = (
      await rows(
        client,
        "SELECT nib,fill_system,material,dimensions,weight,price_range,status FROM model_specs WHERE entity_id=?",
        [PHASE387_HIROTA_BYOBU_UME_ID],
      )
    )[0];
    assert.match(String(spec?.nib), /EF.*F.*MF.*M.*B.*Kodachi.*Shogun/i);
    assert.match(String(spec?.fill_system), /cartridge.*converter/i);
    assert.match(String(spec?.material), /Ebonite.*Urushi.*24K.*Maki-e/i);
    assert.match(String(spec?.dimensions), /未公布|Size & Shape/);
    assert.match(String(spec?.weight), /未公布/);
    assert.match(String(spec?.price_range), /2,950|2950/);
    assert.match(String(spec?.status), /一支|一件|singular/i);

    const variants = await rows(
      client,
      "SELECT variant_name AS name,variant_kind FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE387_HIROTA_BYOBU_UME_ID],
    );
    assert.equal(variants.length, 11);
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "nib").length,
      8 + 1,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "material").length,
      2,
    );
    const links = await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? AND target_id=?) OR (source_id=? AND target_id=?) ORDER BY link_type",
      [
        PHASE387_HIROTA_BYOBU_UME_ID,
        PHASE387_WANCHER_BRAND_ID,
        PHASE387_WANCHER_BRAND_ID,
        PHASE387_HIROTA_BYOBU_UME_ID,
      ],
    );
    assert.deepEqual(
      links.map((row) => `${row.source_id}:${row.target_id}:${row.link_type}`),
      [
        `${PHASE387_HIROTA_BYOBU_UME_ID}:${PHASE387_WANCHER_BRAND_ID}:made_by`,
        `${PHASE387_WANCHER_BRAND_ID}:${PHASE387_HIROTA_BYOBU_UME_ID}:reverse`,
      ],
    );
    const conflicts = await rows(
      client,
      "SELECT count(*) n FROM fact_conflicts WHERE entity_id=?",
      [PHASE387_HIROTA_BYOBU_UME_ID],
    );
    assert.equal(Number(conflicts[0]?.n), 0);

    const replay = await applyPhase387WancherHirotaByobuUmeContent(
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
