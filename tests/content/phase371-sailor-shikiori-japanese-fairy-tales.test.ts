import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase371SailorShikioriJapaneseFairyTalesContent } from "../../scripts/apply-phase371-sailor-shikiori-japanese-fairy-tales-content";
import {
  PHASE371_FAIRY_TALES_ID,
  PHASE371_FAIRY_TALES_SLUG,
  PHASE371_SAILOR_BRAND_ID,
  phase371SailorShikioriJapaneseFairyTalesPacks,
} from "../../scripts/data/phase371-sailor-shikiori-japanese-fairy-tales";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 371 publishes Sailor SHIKIORI Japanese Fairy Tales 11-1227 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase371-sailor-fairy-tales-")),
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
    reviewer: "phase371-sailor-fairy-tales-test",
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
    const modelPack = phase371SailorShikioriJapaneseFairyTalesPacks[0];
    assert.ok(modelPack);
    const localPath = modelPack.media[0]?.localPath;
    assert.ok(localPath);
    assert.ok(modelPack.media[0]?.sourceUrl);
    assert.ok(
      fs.readFileSync(path.join(ROOT, modelPack.markdownFile), "utf8").length >=
        4_000,
    );
    assert.ok(
      new Set(modelPack.sources.map((source) => source.independenceGroup))
        .size >= 6,
    );
    const svg = fs.readFileSync(
      path.join(ROOT, "public", localPath.replace(/^\//, "")),
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
      applyPhase371SailorShikioriJapaneseFairyTalesContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase371SailorShikioriJapaneseFairyTalesContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE371_SAILOR_BRAND_ID, PHASE371_FAIRY_TALES_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE371_FAIRY_TALES_ID)
        ?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE371_FAIRY_TALES_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE371_FAIRY_TALES_ID,
        "pen",
        PHASE371_FAIRY_TALES_SLUG,
        "写乐 Sailor SHIKIORI おとぎばなし（11-1227）",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /11-1227-301/,
      /11-1227-304/,
      /14K 金/,
      /中型 MF/,
      /墨囊／转换器/,
      /PMMA/,
      /Gold IP/,
      /φ17/,
      /124 mm/,
      /16\.8 g/,
      /おとぎばなし/,
      /维护/,
      /选购/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
        args: [PHASE371_FAIRY_TALES_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE371_SAILOR_BRAND_ID);
    assert.match(String(spec?.nib), /14K/);
    assert.match(String(spec?.fill_system), /墨囊／转换器/);
    assert.match(String(spec?.material), /PMMA/);
    assert.match(String(spec?.dimensions), /124/);
    assert.equal(String(spec?.weight), "16.8 g");
    assert.match(String(spec?.status), /11-1227/);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE371_FAIRY_TALES_ID],
          })
        ).rows[0]?.n,
      ),
      4,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE371_FAIRY_TALES_ID],
          })
        ).rows[0]?.n,
      ),
      8,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE371_FAIRY_TALES_ID, PHASE371_SAILOR_BRAND_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE371_SAILOR_BRAND_ID, PHASE371_FAIRY_TALES_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE371_FAIRY_TALES_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), modelPack.media[0]?.localPath);
    assert.equal(String(media?.source_url), modelPack.media[0]?.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");

    const replay = await applyPhase371SailorShikioriJapaneseFairyTalesContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE371_FAIRY_TALES_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
