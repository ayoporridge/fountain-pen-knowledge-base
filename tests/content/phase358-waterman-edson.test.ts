import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase358WatermanEdsonContent } from "../../scripts/apply-phase358-waterman-edson-content";
import {
  PHASE358_TARGET_ID,
  PHASE358_TARGET_SLUG,
  PHASE358_WATERMAN_BRAND_ID,
  phase358WatermanEdsonPacks,
} from "../../scripts/data/phase358-waterman-edson";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 358 publishes Waterman Edson on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase358-waterman-edson-")),
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
    reviewer: "phase358-waterman-edson-test",
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
    const pack = phase358WatermanEdsonPacks.find(
      (candidate) => candidate.entityId === PHASE358_TARGET_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        4_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 7,
    );
    const mediaPack = pack.media[0];
    assert.ok(mediaPack?.localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", mediaPack.localPath.replace(/^\//, "")),
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
      applyPhase358WatermanEdsonContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase358WatermanEdsonContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE358_WATERMAN_BRAND_ID, PHASE358_TARGET_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE358_TARGET_ID)
        ?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE358_TARGET_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE358_TARGET_ID,
        "pen",
        PHASE358_TARGET_SLUG,
        "威迪文 Waterman Edson",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /Waterman Edson/,
      /1990.?92/,
      /Expert/,
      /椭圆/,
      /twin-shell|双层树脂/i,
      /18K/,
      /rhodium-plated|铑镀/i,
      /cartridge\/converter/,
      /Diamond Black/,
      /Sapphire/,
      /Ruby/,
      /Emerald/,
      /155 mm/,
      /15 mm/,
      /43 g/,
      /维护/,
      /选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const brand = (
      await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [PHASE358_WATERMAN_BRAND_ID],
      })
    ).rows[0];
    assert.match(String(brand?.body_md ?? ""), /Edson/);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,status FROM model_specs WHERE entity_id=?",
        args: [PHASE358_TARGET_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE358_WATERMAN_BRAND_ID);
    assert.match(String(spec?.nib), /18K|rhodium/i);
    assert.match(String(spec?.fill_system), /cartridge\/converter/);
    assert.match(String(spec?.material), /resin|SAN/i);
    assert.match(String(spec?.dimensions), /155/);
    assert.match(String(spec?.status), /historical|vary/i);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE358_TARGET_ID],
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
            args: [PHASE358_TARGET_ID, PHASE358_WATERMAN_BRAND_ID],
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
            args: [PHASE358_WATERMAN_BRAND_ID, PHASE358_TARGET_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    assert.ok(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE358_TARGET_ID],
          })
        ).rows[0]?.n,
      ) >= 8,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE358_TARGET_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE358_TARGET_ID, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    const replay = await applyPhase358WatermanEdsonContent(client, options);
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE358_TARGET_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
