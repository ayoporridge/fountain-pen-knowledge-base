import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase320PlatinumIzumoPiz150000cChikuringunkozuContent,
  PHASE320_CHIKURINGUNKOZU_ID,
  PHASE320_CHIKURINGUNKOZU_SLUG,
  PHASE320_PLATINUM_BRAND_ID,
} from "../../scripts/apply-phase320-platinum-izumo-piz-150000c-chikuringunkozu-content";
import { phase320PlatinumIzumoPiz150000cChikuringunkozuPacks } from "../../scripts/data/phase320-platinum-izumo-piz-150000c-chikuringunkozu";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 320 publishes Platinum Izumo PIZ-150000C Chikuringunkozu on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase320-chikuringunkozu-")),
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
    reviewer: "phase320-chikuringunkozu-test",
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
    const pack = phase320PlatinumIzumoPiz150000cChikuringunkozuPacks.find(
      (candidate) => candidate.entityId === PHASE320_CHIKURINGUNKOZU_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        3_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 3,
    );
    const svg = fs.readFileSync(
      path.join(
        ROOT,
        "public/images/library/site-original/phase320/platinum/izumo-piz-150000c-chikuringunkozu.svg",
      ),
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
      applyPhase320PlatinumIzumoPiz150000cChikuringunkozuContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first =
      await applyPhase320PlatinumIzumoPiz150000cChikuringunkozuContent(
        client,
        options,
      );
    assert.equal(first.entities.length, 2);
    assert.ok(
      first.entities.some(
        (item) => item.entityId === PHASE320_PLATINUM_BRAND_ID,
      ),
    );
    assert.ok(
      first.entities.some(
        (item) => item.entityId === PHASE320_CHIKURINGUNKOZU_ID,
      ),
    );
    assert.equal(
      first.entities.find(
        (item) => item.entityId === PHASE320_CHIKURINGUNKOZU_ID,
      )?.outcome,
      "published",
    );
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE320_CHIKURINGUNKOZU_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE320_CHIKURINGUNKOZU_ID,
        "pen",
        PHASE320_CHIKURINGUNKOZU_SLUG,
        "Platinum Izumo PIZ-150000C 漆黑竹林群虎图",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /PIZ-150000C/,
      /Chikuringunkozu/i,
      /竹林群虎图/,
      /炭粉高蒔绘/,
      /18K/,
      /154 mm/,
      /33\.8 g/,
      /选购/,
      /PIZ-100000/,
      /PIZ-160000/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        args: [PHASE320_CHIKURINGUNKOZU_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE320_PLATINUM_BRAND_ID);
    assert.match(String(spec?.nib), /18K/);
    assert.match(String(spec?.fill_system), /转换器/);
    assert.match(String(spec?.material), /炭粉/);
    assert.match(String(spec?.dimensions), /154/);
    assert.match(String(spec?.weight), /33\.8/);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE320_CHIKURINGUNKOZU_ID],
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
            args: [PHASE320_CHIKURINGUNKOZU_ID],
          })
        ).rows[0]?.n,
      ),
      7,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE320_CHIKURINGUNKOZU_ID, PHASE320_PLATINUM_BRAND_ID],
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
            args: [PHASE320_PLATINUM_BRAND_ID, PHASE320_CHIKURINGUNKOZU_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE320_CHIKURINGUNKOZU_ID],
      })
    ).rows[0];
    assert.equal(
      String(media?.local_path),
      "/images/library/site-original/phase320/platinum/izumo-piz-150000c-chikuringunkozu.svg",
    );
    assert.equal(
      String(media?.source_url),
      "/images/library/site-original/phase320/platinum/izumo-piz-150000c-chikuringunkozu.svg",
    );
    assert.equal(String(media?.usage_status), "primary");
    const replay =
      await applyPhase320PlatinumIzumoPiz150000cChikuringunkozuContent(
        client,
        options,
      );
    assert.equal(
      replay.entities.find(
        (item) => item.entityId === PHASE320_CHIKURINGUNKOZU_ID,
      )?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
