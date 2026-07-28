import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  applyPhase329DiplomatCurrentContent,
  PHASE329_CLR_ID,
  PHASE329_CLR_SLUG,
  PHASE329_DIPLOMAT_BRAND_ID,
  PHASE329_ESTEEM_ID,
  PHASE329_ESTEEM_SLUG,
  PHASE329_NEXUS_ID,
  PHASE329_NEXUS_SLUG,
  PHASE329_TRAVELLER_ID,
  PHASE329_TRAVELLER_SLUG,
} from "../../scripts/apply-phase329-diplomat-current-content";
import { phase329DiplomatCurrentPacks } from "../../scripts/data/phase329-diplomat-current";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const models = [
  [PHASE329_NEXUS_ID, PHASE329_NEXUS_SLUG, "Diplomat Nexus"],
  [PHASE329_CLR_ID, PHASE329_CLR_SLUG, "Diplomat CLR"],
  [PHASE329_ESTEEM_ID, PHASE329_ESTEEM_SLUG, "Diplomat Esteem"],
  [PHASE329_TRAVELLER_ID, PHASE329_TRAVELLER_SLUG, "Diplomat Traveller"],
] as const;

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 329 publishes four Diplomat current models on an owned checkpoint", {
  timeout: 1_200_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase329-diplomat-current-")),
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
    reviewer: "phase329-diplomat-current-test",
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
    for (const pack of phase329DiplomatCurrentPacks.filter((item) =>
      models.some(([id]) => item.entityId === id),
    )) {
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          2_000,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          4,
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
    }
    await assert.rejects(
      applyPhase329DiplomatCurrentContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase329DiplomatCurrentContent(client, options);
    assert.equal(first.entities.length, 5);
    for (const [id, slug, name] of models) {
      const entity = (
        await client.execute({
          sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
          args: [id],
        })
      ).rows[0];
      assert.deepEqual(
        [entity?.id, entity?.type, entity?.slug, entity?.name],
        [id, "pen", slug, name],
      );
      assert.match(String(entity?.body_md ?? ""), /官方|Diplomat/);
      assert.match(String(entity?.body_md ?? ""), /非产品照片/);
      assert.doesNotMatch(
        String(entity?.body_md ?? ""),
        /canonical|made_by|数据库|仓库/i,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_references WHERE entity_id=?",
          [id],
        ),
        phase329DiplomatCurrentPacks.find((pack) => pack.entityId === id)
          ?.sources.length,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
          [id],
        ),
        3,
      );
      const spec = (
        await client.execute({
          sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
          args: [id],
        })
      ).rows[0];
      assert.equal(String(spec?.brand_entity_id), PHASE329_DIPLOMAT_BRAND_ID);
      assert.match(String(spec?.nib), /不锈钢/);
      assert.match(
        String(spec?.fill_system),
        /converter|转换器|墨胆|piston|pipette/i,
      );
      assert.match(String(spec?.dimensions), /13[45]|14[05]|155/);
      assert.match(String(spec?.weight), /19|28|30|55/);
      const media = (
        await client.execute({
          sql: "SELECT local_path,usage_status FROM media_assets WHERE entity_id=?",
          args: [id],
        })
      ).rows[0];
      assert.equal(String(media?.usage_status), "primary");
      assert.match(
        String(media?.local_path),
        /phase329\/diplomat\/(nexus|clr|esteem|traveller)\.svg/,
      );
    }
    for (const [id] of models) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          [id, PHASE329_DIPLOMAT_BRAND_ID],
        ),
        1,
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id IN (?,?,?,?) AND link_type='reverse'",
        [PHASE329_DIPLOMAT_BRAND_ID, ...models.map(([id]) => id)],
      ),
      4,
    );
    const replay = await applyPhase329DiplomatCurrentContent(client, options);
    for (const [id] of models)
      assert.equal(
        replay.entities.find((entity) => entity.entityId === id)?.outcome,
        "noop",
      );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
