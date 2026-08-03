import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase395Options,
  applyPhase395WatermanCareneRefresh,
} from "../../scripts/apply-phase395-waterman-carene-refresh";
import {
  PHASE395_CARENE_ID,
  PHASE395_WATERMAN_BRAND_ID,
  phase395WatermanCareneRefreshPacks,
} from "../../scripts/data/phase395-waterman-carene-refresh";
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

async function scalar(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args: args as never[] });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 395 refreshes Waterman Carène on an owned copy", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase395-carene-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase395Options = {
    workspaceRoot: ROOT,
    reviewer: "phase395-waterman-carene-refresh-test",
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
    assert.equal(phase395WatermanCareneRefreshPacks.length, 2);
    const pack = phase395WatermanCareneRefreshPacks.find(
      (candidate) => candidate.entityId === PHASE395_CARENE_ID,
    );
    assert.ok(pack);
    assert.ok(
      Array.from(fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8"))
        .length >= 8_000,
    );
    assert.equal(pack.sources.length, 9);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 8,
    );
    assert.equal(pack.variants?.length, 4);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "nib").length,
      1,
    );
    assert.equal(pack.conflicts?.length ?? 0, 0);
    assert.equal(
      pack.media.filter((media) => media.usageStatus === "primary").length,
      1,
    );
    const svg = fs.readFileSync(
      path.join(
        ROOT,
        "public",
        String(pack.media[0]?.localPath).replace(/^\//, ""),
      ),
      "utf8",
    );
    assert.match(svg, /示意图，非产品照片/);

    await assert.rejects(
      applyPhase395WatermanCareneRefresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase395WatermanCareneRefresh(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const state = (
      await rows(
        client,
        "SELECT entity.type,entity.slug,entity.name,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
        [PHASE395_CARENE_ID],
      )
    )[0];
    assert.equal(state?.type, "pen");
    assert.equal(state?.slug, "waterman-carene");
    assert.equal(state?.name, "威迪文 Waterman Carène");
    assert.equal(state?.status, "published");
    assert.equal(Number(state?.is_public), 1);

    const body = String(
      (
        await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
          PHASE395_CARENE_ID,
        ])
      )[0]?.body_md ?? "",
    );
    assert.ok(body.length >= 8_000);
    for (const pattern of [
      /1997/,
      /Carène/,
      /nautical|yachting|海洋|游艇/i,
      /integrated|inset|嵌入式|包覆式/i,
      /18K|18-carat/i,
      /七种|seven nib/i,
      /Waterman cartridge\/converter|墨囊|converter/i,
      /2214210/,
      /Blue CT/,
      /Black Sea/,
      /Marine Amber/,
      /Deluxe/,
      /L'Essence du Bleu/,
      /法国手工|hand[- ]assembled|France/i,
      /冷水|清水|清洗|维护/,
      /Expert/,
      /Hémisphère/,
      /Allure/,
      /二手|选购|购买/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|仓库/i);

    const contentHash = await computePublicationContentHash(
      client,
      PHASE395_CARENE_ID,
    );
    const reviews = await rows(
      client,
      "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
      [PHASE395_CARENE_ID, contentHash],
    );
    assert.deepEqual(
      reviews.map((row) => `${String(row.review_kind)}:${String(row.status)}`),
      [
        "fact:approved",
        "language:approved",
        "media:approved",
        "publication:approved",
      ],
    );

    const readiness = await rows(
      client,
      "SELECT blocker_count,blockers_json,publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
      [PHASE395_CARENE_ID],
    );
    assert.deepEqual(readiness, [
      { blocker_count: 0, blockers_json: "[]", publishable: 1 },
    ]);

    const spec = (
      await rows(
        client,
        "SELECT brand_entity_id,nib,fill_system,material,dimensions,status FROM model_specs WHERE entity_id=?",
        [PHASE395_CARENE_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE395_WATERMAN_BRAND_ID);
    assert.match(String(spec?.nib), /18K.*inset|inset.*18K/i);
    assert.match(String(spec?.fill_system), /cartridge.*converter/i);
    assert.match(String(spec?.material), /lacquer|漆面/i);
    assert.match(String(spec?.dimensions), /5\.6.*34|145/);
    assert.match(String(spec?.status), /现行/);

    const variants = await rows(
      client,
      "SELECT variant_name,variant_kind,product_code FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE395_CARENE_ID],
    );
    assert.equal(variants.length, 4);
    assert.equal(
      variants.filter((variant) => String(variant.variant_kind) === "nib")
        .length,
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE395_CARENE_ID, PHASE395_WATERMAN_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE395_WATERMAN_BRAND_ID, PHASE395_CARENE_ID],
      ),
      1,
    );

    const beforeReplay = await rows(
      client,
      "SELECT entity_id,status,content_revision,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE395_CARENE_ID],
    );
    const replay = await applyPhase395WatermanCareneRefresh(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const afterReplay = await rows(
      client,
      "SELECT entity_id,status,content_revision,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE395_CARENE_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
