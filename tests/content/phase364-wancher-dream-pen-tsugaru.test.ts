import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase364WancherDreamPenTsugaruContent } from "../../scripts/apply-phase364-wancher-dream-pen-tsugaru-content";
import {
  PHASE364_TARGETS,
  PHASE364_WANCHER_BRAND_ID,
  phase364WancherDreamPenTsugaruPacks,
} from "../../scripts/data/phase364-wancher-dream-pen-tsugaru";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGETS = Object.values(PHASE364_TARGETS);

test("Phase 364 publishes the three Wancher Tsugaru Urushi SKUs on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase364-wancher-tsugaru-")),
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
    reviewer: "phase364-wancher-tsugaru-test",
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
    const packs = phase364WancherDreamPenTsugaruPacks;
    assert.equal(packs.length, 4);
    for (const pack of packs) {
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          (pack.expectedType === "brand" ? 1_800 : 2_500),
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          (pack.expectedType === "brand" ? 5 : 5),
      );
    }
    for (const pack of packs.filter(
      (candidate) => candidate.expectedType === "pen",
    )) {
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
      ]) {
        assert.match(svg, marker);
      }
    }
    await assert.rejects(
      applyPhase364WancherDreamPenTsugaruContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase364WancherDreamPenTsugaruContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE364_WANCHER_BRAND_ID, ...TARGETS.map((target) => target.id)],
    );
    for (const target of TARGETS) {
      assert.equal(
        first.entities.find((item) => item.entityId === target.id)?.outcome,
        "published",
      );
    }

    const brand = (
      await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [PHASE364_WANCHER_BRAND_ID],
      })
    ).rows[0];
    const brandBody = String(brand?.body_md ?? "");
    for (const pattern of [/Nanako/i, /Raden|螺鈿/i, /Shiro|白上げ/i]) {
      assert.match(brandBody, pattern);
    }

    const bodyPatterns: Record<string, RegExp[]> = {
      [PHASE364_TARGETS.nanako.id]: [
        /Nanako/i,
        /ななこ|Nanako-nuri/,
        /菜种|菜の花/,
        /ebonite/i,
        /urushi/i,
        /European C\/C|cartridge\/converter/i,
        /JoWo/i,
        /18K/,
        /feed/i,
        /维护/,
        /选购/,
      ],
      [PHASE364_TARGETS.raden.id]: [
        /螺鈿|raden/i,
        /緑上げ|Midori-age/i,
        /Kara-nuri/i,
        /薄漆|工具痕迹/,
        /Shogun|将军/i,
        /C\/C|cartridge\/converter/i,
        /维护/,
      ],
      [PHASE364_TARGETS.shiro.id]: [
        /白上げ|Shiro-age/i,
        /Kara-nuri/i,
        /白漆/,
        /ebonite/i,
        /JoWo/i,
        /18K/,
        /维护/,
      ],
    };
    for (const target of TARGETS) {
      const entity = (
        await client.execute({
          sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
          args: [target.id],
        })
      ).rows[0];
      assert.deepEqual(
        [entity?.id, entity?.type, entity?.slug, entity?.name],
        [target.id, "pen", target.slug, target.name],
      );
      const body = String(entity?.body_md ?? "");
      for (const pattern of bodyPatterns[target.id] ?? [])
        assert.match(body, pattern);
      assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

      const spec = (
        await client.execute({
          sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
          args: [target.id],
        })
      ).rows[0];
      assert.equal(String(spec?.brand_entity_id), PHASE364_WANCHER_BRAND_ID);
      assert.match(String(spec?.nib), /JoWo|18K/i);
      assert.match(String(spec?.fill_system), /cartridge\/converter|C\/C/i);
      assert.match(String(spec?.material), /ebonite|urushi/i);
      assert.match(String(spec?.dimensions), /no numeric|未单列|not inherit/i);
      assert.match(String(spec?.weight), /no net-weight|未单列|not inherit/i);
      assert.match(String(spec?.status), /Exact Wancher|mutable|listing/i);

      assert.ok(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
              args: [target.id],
            })
          ).rows[0]?.n,
        ) >= 5,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              args: [target.id, PHASE364_WANCHER_BRAND_ID],
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
              args: [PHASE364_WANCHER_BRAND_ID, target.id],
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
              args: [target.id],
            })
          ).rows[0]?.n,
        ) >= 6,
      );
      assert.ok(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=?",
              args: [target.id],
            })
          ).rows[0]?.n,
        ) >= 10,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary'",
              args: [target.id],
            })
          ).rows[0]?.n,
        ),
        1,
      );
      const hash = await computePublicationContentHash(client, target.id);
      assert.deepEqual(
        (
          await client.execute({
            sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            args: [target.id, hash],
          })
        ).rows.map((row) => [String(row.review_kind), String(row.status)]),
        [
          ["fact", "approved"],
          ["language", "approved"],
          ["media", "approved"],
          ["publication", "approved"],
        ],
      );
    }

    const replay = await applyPhase364WancherDreamPenTsugaruContent(
      client,
      options,
    );
    for (const target of TARGETS) {
      assert.equal(
        replay.entities.find((item) => item.entityId === target.id)?.outcome,
        "noop",
      );
    }
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
