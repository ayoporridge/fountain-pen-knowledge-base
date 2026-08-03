import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase422WancherDreamPenTsugaruContent } from "../../scripts/apply-phase422-wancher-dream-pen-tsugaru-refresh";
import {
  PHASE422_TARGETS,
  PHASE422_WANCHER_BRAND_ID,
  phase422WancherDreamPenTsugaruRefreshPacks,
} from "../../scripts/data/phase422-wancher-dream-pen-tsugaru-refresh";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGETS = Object.values(PHASE422_TARGETS);

test("Phase 422 deepens the three Wancher Tsugaru Urushi SKUs on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase422-wancher-tsugaru-")),
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
    reviewer: "phase422-wancher-tsugaru-test",
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
    const packs = phase422WancherDreamPenTsugaruRefreshPacks;
    assert.equal(packs.length, 4);
    for (const pack of packs) {
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          (pack.expectedType === "brand" ? 1_800 : 6_500),
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          (pack.expectedType === "brand" ? 5 : 11),
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
      applyPhase422WancherDreamPenTsugaruContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase422WancherDreamPenTsugaruContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE422_WANCHER_BRAND_ID, ...TARGETS.map((target) => target.id)],
    );
    for (const target of TARGETS) {
      assert.equal(
        first.entities.find((item) => item.entityId === target.id)?.outcome,
        "published",
      );
    }

    const bodyPatterns: Record<string, RegExp[]> = {
      [PHASE422_TARGETS.nanako.id]: [
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
      [PHASE422_TARGETS.raden.id]: [
        /螺鈿|raden/i,
        /緑上げ|Midori-age/i,
        /Kara-nuri/i,
        /薄漆|工具痕迹/,
        /Shogun|将军/i,
        /C\/C|cartridge\/converter/i,
        /维护/,
      ],
      [PHASE422_TARGETS.shiro.id]: [
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
      assert.ok(Array.from(body).length >= 5_500);
      for (const pattern of bodyPatterns[target.id] ?? [])
        assert.match(body, pattern);
      assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

      const spec = (
        await client.execute({
          sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
          args: [target.id],
        })
      ).rows[0];
      assert.equal(String(spec?.brand_entity_id), PHASE422_WANCHER_BRAND_ID);
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
              args: [target.id, PHASE422_WANCHER_BRAND_ID],
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
              args: [PHASE422_WANCHER_BRAND_ID, target.id],
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

    const replay = await applyPhase422WancherDreamPenTsugaruContent(
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
