import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  applyPhase327DiplomatViperCobraContent,
  PHASE327_COBRA_ID,
  PHASE327_COBRA_SLUG,
  PHASE327_DIPLOMAT_BRAND_ID,
  PHASE327_VIPER_ID,
  PHASE327_VIPER_SLUG,
} from "../../scripts/apply-phase327-diplomat-viper-cobra-content";
import { phase327DiplomatViperCobraPacks } from "../../scripts/data/phase327-diplomat-viper-cobra";
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

test("Phase 327 publishes Diplomat Viper and Cobra on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase327-diplomat-viper-cobra-"),
    ),
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
    reviewer: "phase327-diplomat-viper-cobra-test",
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
    for (const pack of phase327DiplomatViperCobraPacks.filter(
      (item) =>
        item.entityId === PHASE327_VIPER_ID ||
        item.entityId === PHASE327_COBRA_ID,
    )) {
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          2_000,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          4,
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
      applyPhase327DiplomatViperCobraContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase327DiplomatViperCobraContent(client, options);
    assert.equal(first.entities.length, 3);
    for (const [id, slug, name] of [
      [PHASE327_VIPER_ID, PHASE327_VIPER_SLUG, "Diplomat Viper"],
      [PHASE327_COBRA_ID, PHASE327_COBRA_SLUG, "Diplomat Cobra"],
    ] as const) {
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
      assert.match(String(entity?.body_md ?? ""), /磁吸帽/);
      assert.match(String(entity?.body_md ?? ""), /转换器/);
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
        phase327DiplomatViperCobraPacks.find((pack) => pack.entityId === id)
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
          sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range FROM model_specs WHERE entity_id=?",
          args: [id],
        })
      ).rows[0];
      assert.equal(String(spec?.brand_entity_id), PHASE327_DIPLOMAT_BRAND_ID);
      assert.match(String(spec?.nib), /不锈钢/);
      assert.match(String(spec?.fill_system), /converter|转换器/i);
      assert.match(String(spec?.dimensions), /14[02]/);
      assert.match(String(spec?.weight), /3[09]/);
      assert.match(String(spec?.price_range), /94|149/);
      const media = (
        await client.execute({
          sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
          args: [id],
        })
      ).rows[0];
      assert.equal(String(media?.usage_status), "primary");
      assert.match(
        String(media?.local_path),
        /phase327\/diplomat\/(viper|cobra)\.svg/,
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE327_VIPER_ID, PHASE327_DIPLOMAT_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE327_COBRA_ID, PHASE327_DIPLOMAT_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id IN (?,?) AND link_type='reverse'",
        [PHASE327_DIPLOMAT_BRAND_ID, PHASE327_VIPER_ID, PHASE327_COBRA_ID],
      ),
      2,
    );
    const replay = await applyPhase327DiplomatViperCobraContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((entity) => entity.entityId === PHASE327_VIPER_ID)
        ?.outcome,
      "noop",
    );
    assert.equal(
      replay.entities.find((entity) => entity.entityId === PHASE327_COBRA_ID)
        ?.outcome,
      "noop",
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
