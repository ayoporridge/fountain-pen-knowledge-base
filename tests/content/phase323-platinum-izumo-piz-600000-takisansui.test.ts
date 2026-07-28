import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase323PlatinumIzumoPiz600000TakisansuiContent,
  PHASE323_PLATINUM_BRAND_ID,
  PHASE323_TAKISANSUI_ID,
  PHASE323_TAKISANSUI_SLUG,
} from "../../scripts/apply-phase323-platinum-izumo-piz-600000-takisansui-content";
import { phase323PlatinumIzumoPiz600000TakisansuiPacks } from "../../scripts/data/phase323-platinum-izumo-piz-600000-takisansui";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 323 publishes Platinum Izumo PIZ-600000 #56 Takisansui on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase323-takisansui-")),
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
    reviewer: "phase323-takisansui-test",
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
    const pack = phase323PlatinumIzumoPiz600000TakisansuiPacks.find(
      (candidate) => candidate.entityId === PHASE323_TAKISANSUI_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        3_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    const svg = fs.readFileSync(
      path.join(
        ROOT,
        "public/images/library/site-original/phase323/platinum/izumo-piz-600000-takisansui.svg",
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
      applyPhase323PlatinumIzumoPiz600000TakisansuiContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase323PlatinumIzumoPiz600000TakisansuiContent(
      client,
      options,
    );
    assert.equal(first.entities.length, 2);
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE323_TAKISANSUI_ID)
        ?.outcome,
      "published",
    );
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE323_TAKISANSUI_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE323_TAKISANSUI_ID,
        "pen",
        PHASE323_TAKISANSUI_SLUG,
        "Platinum Izumo PIZ-600000 #56 瀑水 Takisansui",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /PIZ-600000/,
      /Takisansui/i,
      /瀑水/,
      /高蒔绘/,
      /18K/,
      /154 mm/,
      /34\.9 g/,
      /34\.5 g/,
      /PIZ-500000/,
      /PIZ-300000/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        args: [PHASE323_TAKISANSUI_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE323_PLATINUM_BRAND_ID);
    assert.match(String(spec?.nib), /18K/);
    assert.match(String(spec?.fill_system), /转换器/);
    assert.match(String(spec?.material), /ebonite/);
    assert.match(String(spec?.dimensions), /154/);
    assert.match(String(spec?.weight), /34\.9/);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE323_TAKISANSUI_ID],
          })
        ).rows[0]?.n,
      ),
      2,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE323_TAKISANSUI_ID],
          })
        ).rows[0]?.n,
      ),
      6,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE323_TAKISANSUI_ID, PHASE323_PLATINUM_BRAND_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE323_TAKISANSUI_ID],
      })
    ).rows[0];
    assert.equal(
      String(media?.local_path),
      "/images/library/site-original/phase323/platinum/izumo-piz-600000-takisansui.svg",
    );
    assert.equal(
      String(media?.source_url),
      "/images/library/site-original/phase323/platinum/izumo-piz-600000-takisansui.svg",
    );
    assert.equal(String(media?.usage_status), "primary");
    const replay = await applyPhase323PlatinumIzumoPiz600000TakisansuiContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE323_TAKISANSUI_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
