import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase423WancherWorldTreeRefresh } from "../../scripts/apply-phase423-wancher-world-tree-refresh";
import {
  PHASE423_TARGETS,
  PHASE423_WANCHER_BRAND_ID,
  phase423WancherWorldTreeRefreshPacks,
} from "../../scripts/data/phase423-wancher-world-tree-refresh";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGETS = Object.values(PHASE423_TARGETS);

test("Phase 423 deepens five Wancher World Tree and Sekai wood SKUs on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase423-wancher-world-tree-")),
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
    reviewer: "phase423-wancher-world-tree-test",
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
    const packs = phase423WancherWorldTreeRefreshPacks;
    assert.equal(packs.length, 6);
    for (const pack of packs) {
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          (pack.expectedType === "brand" ? 1_800 : 5_500),
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          (pack.expectedType === "brand" ? 5 : 10),
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
      applyPhase423WancherWorldTreeRefresh(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase423WancherWorldTreeRefresh(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE423_WANCHER_BRAND_ID, ...TARGETS.map((target) => target.id)],
    );
    for (const target of TARGETS) {
      assert.equal(
        first.entities.find((item) => item.entityId === target.id)?.outcome,
        "published",
      );
    }

    const bodyPatterns: Record<string, RegExp[]> = {
      [PHASE423_TARGETS.ebony.id]: [
        /World Tree.*Ebony|Ebony.*World Tree/i,
        /乌木|ebony/i,
        /13\.2|140\.1|164\.4/,
        /925/,
        /JoWo/i,
        /Keiyu|Kodachi/i,
        /C\/C|converter/i,
        /维护|护理/,
        /选购/,
      ],
      [PHASE423_TARGETS.ai.id]: [
        /Sekai Ai/i,
        /Olive|橄榄/i,
        /Aizome|蓝染/i,
        /Dove|鸽|象嵌/i,
        /JoWo|18K/i,
        /C\/C|converter/i,
        /维护|护理/,
      ],
      [PHASE423_TARGETS.teak.id]: [
        /World Tree.*Teak|Teak.*World Tree/i,
        /柚木|teak/i,
        /变深|颜色|纹理/,
        /925/,
        /C\/C|converter/i,
        /维护|护理/,
      ],
      [PHASE423_TARGETS.verawood.id]: [
        /Verawood/i,
        /绿檀|verawood/i,
        /木材|天然/,
        /925/,
        /C\/C|converter/i,
        /维护|护理/,
      ],
      [PHASE423_TARGETS.sandalwood.id]: [
        /Sandalwood/i,
        /檀木|sandalwood/i,
        /天然|纹理/,
        /925/,
        /C\/C|converter/i,
        /维护|护理/,
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
      assert.equal(String(spec?.brand_entity_id), PHASE423_WANCHER_BRAND_ID);
      assert.match(String(spec?.nib), /JoWo|18K|Keiyu|Kodachi/i);
      assert.match(String(spec?.fill_system), /cartridge.*converter|C\/C/i);
      assert.match(
        String(spec?.material),
        /wood|木|ebony|teak|verawood|sandalwood|olive/i,
      );
      assert.match(String(spec?.dimensions), /13\.2|140\.1|164\.4/);
      assert.match(String(spec?.weight), /27|21/);
      assert.match(String(spec?.status), /World Tree|Sekai|mutable|reviewed/i);

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
              args: [target.id, PHASE423_WANCHER_BRAND_ID],
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
              args: [PHASE423_WANCHER_BRAND_ID, target.id],
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
        ) >= 10,
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

    const replay = await applyPhase423WancherWorldTreeRefresh(client, options);
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
