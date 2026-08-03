import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase394Options,
  applyPhase394PilotCustom823Refresh,
} from "../../scripts/apply-phase394-pilot-custom-823-refresh";
import {
  PHASE394_PILOT_823_DUPLICATE_ID,
  PHASE394_PILOT_823_ID,
  PHASE394_PILOT_BRAND_ID,
  phase394PilotCustom823RefreshPacks,
} from "../../scripts/data/phase394-pilot-custom-823-refresh";
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

test("Phase 394 refreshes Pilot Custom 823 on an owned copy without creating a new identity", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase394-pilot823-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase394Options = {
    workspaceRoot: ROOT,
    reviewer: "phase394-pilot-custom-823-refresh-test",
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
    assert.equal(phase394PilotCustom823RefreshPacks.length, 2);
    const pack = phase394PilotCustom823RefreshPacks.find(
      (candidate) => candidate.entityId === PHASE394_PILOT_823_ID,
    );
    assert.ok(pack);
    assert.equal(pack.entityId, PHASE394_PILOT_823_ID);
    assert.ok(
      Array.from(fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8"))
        .length >= 8_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 7,
    );
    assert.equal(pack.sources.length, 8);
    assert.equal(pack.variants?.length, 12);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      12,
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
      applyPhase394PilotCustom823Refresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase394PilotCustom823Refresh(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id=?",
        [PHASE394_PILOT_823_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id=?",
        [PHASE394_PILOT_823_DUPLICATE_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_publications WHERE entity_id=? AND status='retired'",
        [PHASE394_PILOT_823_DUPLICATE_ID],
      ),
      1,
    );
    const redirect = await rows(
      client,
      "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      ["/pen/百乐-pilot-custom-823"],
    );
    assert.deepEqual(redirect, [
      { target_path: "/pen/pilot-custom-823", redirect_kind: "permanent" },
    ]);

    const state = (
      await rows(
        client,
        "SELECT entity.type,entity.slug,entity.name,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
        [PHASE394_PILOT_823_ID],
      )
    )[0];
    assert.equal(state?.type, "pen");
    assert.equal(state?.slug, "pilot-custom-823");
    assert.equal(state?.name, "百乐 Pilot Custom 823");
    assert.equal(state?.status, "published");
    assert.equal(Number(state?.is_public), 1);

    const body = String(
      (
        await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
          PHASE394_PILOT_823_ID,
        ])
      )[0]?.body_md ?? "",
    );
    assert.ok(body.length >= 8_000);
    for (const pattern of [
      /FKK-3MRP/,
      /FKKE-3MRP/,
      /2000/,
      /vacuum plunger|真空活塞|真空柱塞/i,
      /14K.*No\.15/i,
      /1\.5\s*ml/,
      /148\.4\s*mm/,
      /15\.7\s*mm/,
      /29\.5\s*g/,
      /FKK-3MRP-NCF/,
      /透明黑/,
      /棕色/,
      /smoke.*amber|amber.*smoke/i,
      /INK-70/,
      /Tsuwairo/,
      /飞机|air-pressure|气压/i,
      /清水|清洗|维护/,
      /选购|二手/,
      /Custom 74/,
      /Custom 845/,
      /Heritage 912/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|仓库/i);

    const contentHash = await computePublicationContentHash(
      client,
      PHASE394_PILOT_823_ID,
    );
    const reviews = await rows(
      client,
      "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
      [PHASE394_PILOT_823_ID, contentHash],
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

    const spec = (
      await rows(
        client,
        "SELECT brand_entity_id,nib,fill_system,material,dimensions,status FROM model_specs WHERE entity_id=?",
        [PHASE394_PILOT_823_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE394_PILOT_BRAND_ID);
    assert.match(String(spec?.nib), /14K.*No\.15.*F\/M\/B\/S/);
    assert.match(String(spec?.fill_system), /vacuum.*plunger/i);
    assert.match(String(spec?.material), /树脂/);
    assert.match(String(spec?.dimensions), /148\.4.*15\.7.*29\.5/);
    assert.match(String(spec?.status), /现行型号/);

    const variants = await rows(
      client,
      "SELECT variant_name,variant_kind,product_code FROM model_variants WHERE model_entity_id=? ORDER BY product_code",
      [PHASE394_PILOT_823_ID],
    );
    assert.equal(variants.length, 12);
    assert.equal(
      variants.filter(
        (variant) => String(variant.variant_kind) === "market_sku",
      ).length,
      12,
    );
    assert.equal(
      new Set(variants.map((variant) => String(variant.product_code))).size,
      12,
    );

    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE394_PILOT_823_ID, PHASE394_PILOT_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE394_PILOT_BRAND_ID, PHASE394_PILOT_823_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id=? AND alias IN ('FKK-3MRP','FKKE-3MRP')",
        [PHASE394_PILOT_823_ID],
      ),
      2,
    );

    const beforeReplay = await rows(
      client,
      "SELECT entity_id,status,content_revision,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE394_PILOT_823_ID],
    );
    const replay = await applyPhase394PilotCustom823Refresh(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const afterReplay = await rows(
      client,
      "SELECT entity_id,status,content_revision,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE394_PILOT_823_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
