import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase399Options,
  applyPhase399WatermanEdsonRefresh,
} from "../../scripts/apply-phase399-waterman-edson-refresh";
import {
  PHASE399_EDSON_ID,
  PHASE399_WATERMAN_BRAND_ID,
  phase399WatermanEdsonRefreshPacks,
} from "../../scripts/data/phase399-waterman-edson-refresh";
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

test("Phase 399 refreshes Waterman Edson on an owned copy", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase399-edson-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase399Options = {
    workspaceRoot: ROOT,
    reviewer: "phase399-waterman-edson-refresh-test",
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
    assert.equal(phase399WatermanEdsonRefreshPacks.length, 2);
    const pack = phase399WatermanEdsonRefreshPacks.find(
      (candidate) => candidate.entityId === PHASE399_EDSON_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        8_000,
    );
    assert.equal(pack.sources.length, 12);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >=
        10,
    );
    assert.equal(pack.variants?.length, 6);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      2,
    );
    assert.equal(
      pack.variants?.filter(
        (variant) => variant.variantKind === "edition_group",
      ).length,
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
    assert.match(svg, /非产品照片/);

    await assert.rejects(
      applyPhase399WatermanEdsonRefresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase399WatermanEdsonRefresh(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const state = (
      await rows(
        client,
        "SELECT entity.type,entity.slug,entity.name,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
        [PHASE399_EDSON_ID],
      )
    )[0];
    assert.equal(state?.type, "pen");
    assert.equal(state?.slug, "waterman-edson");
    assert.equal(state?.name, "威迪文 Waterman Edson");
    assert.equal(state?.status, "published");
    assert.equal(Number(state?.is_public), 1);

    const body = String(
      (
        await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
          PHASE399_EDSON_ID,
        ])
      )[0]?.body_md ?? "",
    );
    assert.ok(body.length >= 8_000);
    for (const pattern of [
      /1990–92|1990-92/,
      /Diamond Black/,
      /S2 210 172/,
      /S2 210 173/,
      /18K/,
      /铑镀|rhodium/i,
      /twin-shell|双层树脂/i,
      /cartridge.*converter/i,
      /155 mm/,
      /15 mm/,
      /43 g/,
      /Sapphire/,
      /Ruby/,
      /Emerald/,
      /125 ans/,
      /凉水|清洁|收纳|维护/,
      /Expert/,
      /Hémisphère/,
      /Carène/,
      /Allure/,
      /Exception/,
      /二手|选购|购买/,
      /当前主目录|当前.*未列|历史高端/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|仓库/i);

    const contentHash = await computePublicationContentHash(
      client,
      PHASE399_EDSON_ID,
    );
    const reviews = await rows(
      client,
      "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
      [PHASE399_EDSON_ID, contentHash],
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
      [PHASE399_EDSON_ID],
    );
    assert.deepEqual(readiness, [
      { blocker_count: 0, blockers_json: "[]", publishable: 1 },
    ]);

    const spec = (
      await rows(
        client,
        "SELECT brand_entity_id,nib,fill_system,material,dimensions,status FROM model_specs WHERE entity_id=?",
        [PHASE399_EDSON_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE399_WATERMAN_BRAND_ID);
    assert.match(String(spec?.nib), /18K|gold/i);
    assert.match(String(spec?.fill_system), /cartridge.*converter/i);
    assert.match(String(spec?.material), /resin|树脂|SAN/i);
    assert.match(String(spec?.dimensions), /155.*15.*43/);
    assert.match(String(spec?.status), /历史|未列/);

    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE399_EDSON_ID, PHASE399_WATERMAN_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE399_WATERMAN_BRAND_ID, PHASE399_EDSON_ID],
      ),
      1,
    );

    const beforeReplay = await rows(
      client,
      "SELECT entity_id,status,content_revision,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE399_EDSON_ID],
    );
    const replay = await applyPhase399WatermanEdsonRefresh(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const afterReplay = await rows(
      client,
      "SELECT entity_id,status,content_revision,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE399_EDSON_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
