import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase370SailorShikioriNoyamaNoUtaContent } from "../../scripts/apply-phase370-sailor-shikiori-noyama-no-uta-content";
import {
  PHASE370_NOYAMA_ID,
  PHASE370_NOYAMA_SLUG,
  PHASE370_SAILOR_BRAND_ID,
  phase370SailorShikioriNoyamaNoUtaPacks,
} from "../../scripts/data/phase370-sailor-shikiori-noyama-no-uta";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 370 publishes Sailor SHIKIORI Noyama no Uta 11-1231 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase370-sailor-noyama-")),
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
    reviewer: "phase370-sailor-shikiori-noyama-test",
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
    const modelPack = phase370SailorShikioriNoyamaNoUtaPacks[0];
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
      applyPhase370SailorShikioriNoyamaNoUtaContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase370SailorShikioriNoyamaNoUtaContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE370_SAILOR_BRAND_ID, PHASE370_NOYAMA_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE370_NOYAMA_ID)
        ?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE370_NOYAMA_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE370_NOYAMA_ID,
        "pen",
        PHASE370_NOYAMA_SLUG,
        "写乐 Sailor SHIKIORI 野山の唄（11-1231）",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /11-1231-301/,
      /11-1231-304/,
      /14K 金/,
      /中型 MF/,
      /墨囊／转换器/,
      /PMMA/,
      /金色 IP/,
      /φ17/,
      /124 mm/,
      /16\.8 g/,
      /七十二候/,
      /维护/,
      /选购/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
        args: [PHASE370_NOYAMA_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE370_SAILOR_BRAND_ID);
    assert.match(String(spec?.nib), /14K/);
    assert.match(String(spec?.fill_system), /墨囊／转换器/);
    assert.match(String(spec?.material), /PMMA/);
    assert.match(String(spec?.dimensions), /124/);
    assert.equal(String(spec?.weight), "16.8 g");
    assert.match(String(spec?.status), /11-1231/);

    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE370_NOYAMA_ID],
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
            args: [PHASE370_NOYAMA_ID],
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
            args: [PHASE370_NOYAMA_ID, PHASE370_SAILOR_BRAND_ID],
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
            args: [PHASE370_SAILOR_BRAND_ID, PHASE370_NOYAMA_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE370_NOYAMA_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), modelPack.media[0]?.localPath);
    assert.equal(String(media?.source_url), modelPack.media[0]?.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");

    const replay = await applyPhase370SailorShikioriNoyamaNoUtaContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE370_NOYAMA_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
