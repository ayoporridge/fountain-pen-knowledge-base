import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase424FaberCastellRefresh } from "../../scripts/apply-phase424-faber-castell-refresh";
import {
  PHASE424_FABER_BRAND_ID,
  PHASE424_TARGETS,
  phase424FaberCastellRefreshPacks,
} from "../../scripts/data/phase424-faber-castell-refresh";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGETS = Object.values(PHASE424_TARGETS);

test("Phase 424 deepens five Faber-Castell Fine Writing models on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase424-faber-castell-")),
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
    reviewer: "phase424-faber-castell-test",
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
    const packs = phase424FaberCastellRefreshPacks;
    assert.equal(packs.length, 6);
    for (const pack of packs) {
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          (pack.expectedType === "brand" ? 1_800 : 5_500),
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          (pack.expectedType === "brand" ? 8 : 8),
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
        /非产品照片|not a product photograph/i,
        /真实比例|not to scale/i,
        /Logo|SKU|库存|涂层/i,
        /示意图|factual diagram/i,
      ]) {
        assert.match(svg, marker);
      }
    }
    await assert.rejects(
      applyPhase424FaberCastellRefresh(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase424FaberCastellRefresh(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE424_FABER_BRAND_ID, ...TARGETS.map((target) => target.id)],
    );
    for (const target of TARGETS) {
      assert.equal(
        first.entities.find((item) => item.entityId === target.id)?.outcome,
        "published",
      );
    }

    const bodyPatterns: Record<string, RegExp[]> = {
      [PHASE424_TARGETS.ambition.id]: [
        /Ambition/i,
        /不锈钢|stainless/i,
        /细长|直筒/,
        /EF\/F\/M\/B|EF|F|M|B/,
        /cartridge.*converter/i,
        /维护|清洗/,
        /选购/,
      ],
      [PHASE424_TARGETS.emotion.id]: [
        /e-motion/i,
        /bulbous|粗壮|雪茄/i,
        /梨木|pear|Pure Black/i,
        /EF\/F\/M\/B|EF|F|M|B/,
        /cartridge.*converter/i,
        /维护|清洗/,
      ],
      [PHASE424_TARGETS.ondoro.id]: [
        /Ondoro/i,
        /六角|hexagonal/i,
        /graphite|烟熏|smoked oak/i,
        /EF\/F\/M\/B|EF|F|M|B/,
        /cartridge.*converter/i,
        /维护|清洗/,
      ],
      [PHASE424_TARGETS.neoSlim.id]: [
        /NEO Slim/i,
        /细身|slim/i,
        /铝|aluminium|metal/i,
        /EF\/F\/M\/B|EF|F|M|B/,
        /cartridge.*converter/i,
        /维护|清洗/,
      ],
      [PHASE424_TARGETS.loom.id]: [
        /LOOM/i,
        /Metallic|Gunmetal/i,
        /金属|metal/i,
        /EF\/F\/M\/B|EF|F|M|B/,
        /cartridge.*converter/i,
        /维护|清洗/,
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
      assert.ok(Array.from(body).length >= 5_000);
      for (const pattern of bodyPatterns[target.id] ?? [])
        assert.match(body, pattern);
      assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

      const spec = (
        await client.execute({
          sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
          args: [target.id],
        })
      ).rows[0];
      assert.equal(String(spec?.brand_entity_id), PHASE424_FABER_BRAND_ID);
      assert.match(String(spec?.nib), /EF|F|M|B|不锈钢/i);
      assert.match(String(spec?.fill_system), /cartridge.*converter|C\/C/i);
      assert.match(
        String(spec?.material),
        /stainless|metal|resin|wood|树脂|金属|木|铝/i,
      );
      assert.ok(String(spec?.dimensions).trim().length > 0);
      assert.match(
        String(spec?.status),
        /catalogue|目录|mutable|reviewed|库存/i,
      );

      assert.ok(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
              args: [target.id],
            })
          ).rows[0]?.n,
        ) >= 3,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              args: [target.id, PHASE424_FABER_BRAND_ID],
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
              args: [PHASE424_FABER_BRAND_ID, target.id],
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
        ) >= 8,
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
      const publication = (
        await client.execute({
          sql: "SELECT status,content_revision,reviewed_content_revision,reviewed_contract_version,approved_content_hash FROM entity_publications WHERE entity_id=?",
          args: [target.id],
        })
      ).rows[0];
      assert.equal(String(publication?.status), "published");
      assert.equal(
        Number(publication?.content_revision),
        Number(publication?.reviewed_content_revision),
      );
      assert.equal(Number(publication?.reviewed_contract_version), 3);
      assert.equal(String(publication?.approved_content_hash), hash);
      const readiness = (
        await client.execute({
          sql: "SELECT publishable,blocker_count FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
          args: [target.id],
        })
      ).rows[0];
      assert.equal(Number(readiness?.publishable), 1);
      assert.equal(Number(readiness?.blocker_count), 0);
    }

    const replay = await applyPhase424FaberCastellRefresh(client, options);
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
