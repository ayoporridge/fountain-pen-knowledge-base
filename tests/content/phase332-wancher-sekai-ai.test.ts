import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  applyPhase332WancherSekaiAiContent,
  PHASE332_SEKAI_AI_ID,
  PHASE332_SEKAI_AI_SLUG,
  PHASE332_WANCHER_BRAND_ID,
} from "../../scripts/apply-phase332-wancher-sekai-ai-content";
import { phase332WancherSekaiAiPacks } from "../../scripts/data/phase332-wancher-sekai-ai";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 332 publishes Wancher Sekai Ai on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase332-wancher-sekai-ai-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase332-wancher-sekai-ai-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: snapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    const pack = phase332WancherSekaiAiPacks.find(
      (item) => item.entityId === PHASE332_SEKAI_AI_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        2_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    assert.ok(
      pack.sources.some((source) => source.tier === "professional_secondary"),
    );
    const svg = fs.readFileSync(
      path.join(
        ROOT,
        "public",
        pack.media[0]?.localPath?.replace(/^\//, "") ?? "",
      ),
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
      applyPhase332WancherSekaiAiContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase332WancherSekaiAiContent(client, options);
    assert.equal(first.entities.length, 2);
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE332_SEKAI_AI_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [PHASE332_SEKAI_AI_ID, "pen", PHASE332_SEKAI_AI_SLUG, "Wancher Sekai Ai"],
    );
    assert.match(String(entity?.body_md ?? ""), /Olive Wood|橄榄木/);
    assert.match(String(entity?.body_md ?? ""), /Aizome|蓝染/);
    assert.match(String(entity?.body_md ?? ""), /非产品照片/);
    assert.doesNotMatch(
      String(entity?.body_md ?? ""),
      /canonical|made_by|数据库|仓库/i,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_references WHERE entity_id=?",
        [PHASE332_SEKAI_AI_ID],
      ),
      pack.sources.length,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
        [PHASE332_SEKAI_AI_ID],
      ),
      3,
    );
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range FROM model_specs WHERE entity_id=?",
        args: [PHASE332_SEKAI_AI_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE332_WANCHER_BRAND_ID);
    assert.match(String(spec?.nib), /Jowo|不锈钢|18K|KEIRYU/i);
    assert.match(String(spec?.fill_system), /converter|墨胆|国际/i);
    assert.match(String(spec?.material), /Olive|Aizome|橄榄|蓝染/i);
    assert.match(String(spec?.dimensions), /140\.1|164\.4|13\.2/);
    assert.match(String(spec?.weight), /27|21/);
    const media = (
      await client.execute({
        sql: "SELECT local_path,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE332_SEKAI_AI_ID],
      })
    ).rows[0];
    assert.equal(String(media?.usage_status), "primary");
    assert.match(String(media?.local_path), /phase332\/wancher\/sekai-ai\.svg/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE332_SEKAI_AI_ID, PHASE332_WANCHER_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE332_WANCHER_BRAND_ID, PHASE332_SEKAI_AI_ID],
      ),
      1,
    );
    const replay = await applyPhase332WancherSekaiAiContent(client, options);
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE332_SEKAI_AI_ID)
        ?.outcome,
      "noop",
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
