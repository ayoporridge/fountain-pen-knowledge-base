import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase589Options,
  applyPhase589PineiderClassicTempiModerniContent,
} from "../../scripts/apply-phase589-pineider-classic-tempi-moderni-content";
import {
  PHASE589_IDS,
  PHASE589_PINEIDER_BRAND_ID,
  PHASE589_SLUGS,
  phase589PineiderPacks,
} from "../../scripts/data/phase589-pineider-classic-tempi-moderni";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE589_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE589_SOURCE_DATABASE)
  : REAL;
const TARGETS = [
  {
    id: PHASE589_IDS.classic,
    slug: PHASE589_SLUGS.classic,
    markers: ["PP5801", "144 mm", "活塞", "Rose Gold", "cartridge/converter"],
  },
  {
    id: PHASE589_IDS.tempi,
    slug: PHASE589_SLUGS.tempi,
    markers: ["PP6001", "155 mm", "UltraResin", "活塞", "1.32:1"],
  },
] as const;

async function rows(client: Client, sql: string, args: unknown[] = []) {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function createOwnedCopy(prefix: string) {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  return { ownedRoot, databasePath: copy.destinationPath };
}

function options(
  ownedRoot: string,
  databasePath: string,
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
): ApplyPhase589Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase589-pineider-classic-tempi-moderni-test",
    databasePath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
}

test("Phase 589 publishes Pineider Classic Palladium and Tempi Moderni on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);

  const collisionCopy = createOwnedCopy("fpkg-phase589-collision-");
  const collisionClient = createClient({
    url: `file:${collisionCopy.databasePath}`,
  });
  try {
    await migrateDatabase(collisionClient);
    const existing = await rows(
      collisionClient,
      "SELECT id FROM entities WHERE id=? OR slug=?",
      [PHASE589_IDS.classic, PHASE589_SLUGS.classic],
    );
    if (existing.length === 0) {
      await collisionClient.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          "phase589-collision-classic",
          PHASE589_SLUGS.classic,
          "Phase 589 collision",
        ],
      });
    } else {
      await collisionClient.execute({
        sql: "UPDATE entities SET name='Phase 589 collision' WHERE id=?",
        args: [PHASE589_IDS.classic],
      });
    }
    await assert.rejects(
      applyPhase589PineiderClassicTempiModerniContent(
        collisionClient,
        options(
          collisionCopy.ownedRoot,
          collisionCopy.databasePath,
          protectedSnapshot,
        ),
      ),
      /collision/,
    );
  } finally {
    collisionClient.close();
  }

  const owned = createOwnedCopy("fpkg-phase589-pineider-classic-tempi-");
  const client = createClient({ url: `file:${owned.databasePath}` });
  const applyOptions = options(
    owned.ownedRoot,
    owned.databasePath,
    protectedSnapshot,
  );
  try {
    await migrateDatabase(client);

    const modelPacks = phase589PineiderPacks.filter(
      (pack) => pack.expectedType === "pen",
    );
    assert.equal(modelPacks.length, 2);
    assert.equal(new Set(modelPacks.map((pack) => pack.entityId)).size, 2);

    for (const pack of modelPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(Array.from(markdown).length >= 2_000);
      assert.match(markdown, /## body_md/);
      assert.match(markdown, /## 来源/);
      assert.doesNotMatch(markdown, /## model_specs/i);
      assert.doesNotMatch(markdown, /made_by|CuratedEntityPack|数据库字段/i);
      assert.ok(
        pack.sources.some((source) => source.sourceType === "official"),
      );
      assert.ok(
        pack.sources.some((source) => source.tier === "professional_secondary"),
      );
      assert.ok(
        new Set(
          pack.sources
            .filter((source) => source.itemType !== "image")
            .map((source) => source.independenceGroup),
        ).size >= 2,
      );
      const primary = pack.media.filter(
        (media) => media.usageStatus === "primary",
      );
      assert.equal(primary.length, 1);
      const svgPath = path.join(
        ROOT,
        "public",
        String(primary[0]?.localPath).replace(/^\//, ""),
      );
      const svg = fs.readFileSync(svgPath, "utf8");
      assert.match(svg, /本站原创示意图/);
      assert.match(svg, /非产品照片/);
      assert.match(svg, /1600/);
      assert.match(svg, /900/);
    }

    const primaryPaths = modelPacks.map(
      (pack) =>
        pack.media.find((media) => media.usageStatus === "primary")?.localPath,
    );
    assert.equal(new Set(primaryPaths).size, 2);
    assert.equal(
      new Set(
        primaryPaths.map((localPath) =>
          sha256(
            path.join(ROOT, "public", String(localPath).replace(/^\//, "")),
          ),
        ),
      ).size,
      2,
    );

    const before = await rows(
      client,
      "SELECT id FROM entities WHERE id IN (?,?)",
      TARGETS.map((target) => target.id),
    );
    const beforeIds = new Set(before.map((row) => String(row.id)));
    const missingBefore = 2 - beforeIds.size;
    const brandPensBefore = Number(
      (
        await rows(
          client,
          `SELECT count(DISTINCT pen.id) AS n
             FROM public_entities pen
             JOIN entity_links maker
               ON maker.source_id=pen.id AND maker.link_type='made_by'
             WHERE pen.type='pen' AND maker.target_id=?`,
          [PHASE589_PINEIDER_BRAND_ID],
        )
      )[0]?.n,
    );

    const ownedHashBeforeRemoteRejection = sha256(owned.databasePath);
    await assert.rejects(
      applyPhase589PineiderClassicTempiModerniContent(client, {
        ...applyOptions,
        env: {
          ...applyOptions.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );
    assert.equal(sha256(owned.databasePath), ownedHashBeforeRemoteRejection);

    const first = await applyPhase589PineiderClassicTempiModerniContent(
      client,
      applyOptions,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      phase589PineiderPacks.map((pack) => pack.entityId),
    );
    assert.ok(["published", "noop"].includes(first.entities[0]?.outcome ?? ""));
    for (const target of TARGETS) {
      const result = first.entities.find(
        (entity) => entity.entityId === target.id,
      );
      assert.equal(
        result?.outcome,
        beforeIds.has(target.id) ? "noop" : "published",
      );
    }

    for (const target of TARGETS) {
      const state = (
        await rows(
          client,
          `SELECT entity.type,entity.slug,entity.name,entity.body_md,
                    publication.status,publication.approved_content_hash,
                    publication.content_revision,
                    publication.reviewed_content_revision,
                    publication.reviewed_contract_version,
                    readiness.publishable,readiness.blocker_count,
                    CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
             FROM entities entity
             JOIN entity_publications publication
               ON publication.entity_id=entity.id
             LEFT JOIN public_entity_readiness readiness
               ON readiness.entity_id=entity.id AND readiness.contract_version=3
             LEFT JOIN public_entities public ON public.id=entity.id
             WHERE entity.id=?`,
          [target.id],
        )
      )[0];
      assert.equal(state?.type, "pen");
      assert.equal(state?.slug, target.slug);
      assert.equal(state?.status, "published");
      assert.equal(
        Number(state?.content_revision),
        Number(state?.reviewed_content_revision),
      );
      assert.equal(Number(state?.reviewed_contract_version), 3);
      assert.equal(Number(state?.publishable), 1);
      assert.equal(Number(state?.blocker_count), 0);
      assert.equal(Number(state?.is_public), 1);
      const body = String(state?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2_000);
      for (const marker of target.markers) {
        assert.match(
          body,
          new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        );
      }
      assert.doesNotMatch(body, /## model_specs|made_by|CuratedEntityPack/i);

      const topology = await rows(
        client,
        `SELECT
             (SELECT count(*) FROM entity_links
              WHERE source_id=? AND link_type='made_by' AND target_id=?) AS maker,
             (SELECT count(*) FROM entity_links
              WHERE source_id=? AND target_id=? AND link_type='reverse') AS reverse,
             (SELECT count(*) FROM model_specs WHERE entity_id=?) AS specs,
             (SELECT count(*) FROM media_assets
              WHERE entity_id=? AND usage_status='primary') AS primary_media`,
        [
          target.id,
          PHASE589_PINEIDER_BRAND_ID,
          PHASE589_PINEIDER_BRAND_ID,
          target.id,
          target.id,
          target.id,
        ],
      );
      assert.deepEqual(
        [
          Number(topology[0]?.maker),
          Number(topology[0]?.reverse),
          Number(topology[0]?.specs),
          Number(topology[0]?.primary_media),
        ],
        [1, 1, 1, 1],
      );
      const reviews = await rows(
        client,
        `SELECT review_kind,status FROM entity_content_reviews
           WHERE entity_id=? AND content_hash=? ORDER BY review_kind`,
        [target.id, state?.approved_content_hash],
      );
      assert.deepEqual(
        reviews,
        ["fact", "language", "media", "publication"].map((reviewKind) => ({
          review_kind: reviewKind,
          status: "approved",
        })),
      );
    }

    const specs = await rows(
      client,
      `SELECT entity_id,nib,fill_system,material,dimensions,weight,status
         FROM model_specs WHERE entity_id IN (?,?) ORDER BY entity_id`,
      TARGETS.map((target) => target.id),
    );
    assert.equal(specs.length, 2);
    const byId = new Map(specs.map((spec) => [String(spec.entity_id), spec]));
    assert.match(
      String(byId.get(PHASE589_IDS.classic)?.fill_system),
      /piston/i,
    );
    assert.match(String(byId.get(PHASE589_IDS.classic)?.dimensions), /144 mm/);
    assert.match(
      String(byId.get(PHASE589_IDS.classic)?.material),
      /palladium/i,
    );
    assert.match(String(byId.get(PHASE589_IDS.tempi)?.nib), /steel/i);
    assert.match(String(byId.get(PHASE589_IDS.tempi)?.fill_system), /piston/i);
    assert.match(String(byId.get(PHASE589_IDS.tempi)?.material), /UltraResin/);

    const classicConflict = await rows(
      client,
      `SELECT conflict.id,conflict.status,conflict.resolution_note,
                count(member.id) AS member_count
         FROM fact_conflicts conflict
         LEFT JOIN fact_conflict_members member
           ON member.conflict_id=conflict.id
         WHERE conflict.entity_id=? AND conflict.field_key='fill_system'
         GROUP BY conflict.id,conflict.status,conflict.resolution_note`,
      [PHASE589_IDS.classic],
    );
    assert.equal(classicConflict.length, 1);
    assert.equal(classicConflict[0]?.status, "resolved");
    assert.equal(Number(classicConflict[0]?.member_count), 2);
    assert.match(String(classicConflict[0]?.resolution_note), /piston/i);
    assert.match(
      String(classicConflict[0]?.resolution_note),
      /cartridge\/converter/i,
    );

    const rejectedConverter = await rows(
      client,
      `SELECT evidence.review_status,source.url
         FROM spec_field_evidence evidence
         JOIN model_specs spec ON spec.id=evidence.model_spec_id
         JOIN citations citation ON citation.id=evidence.citation_id
         JOIN source_items source ON source.id=citation.source_item_id
         WHERE spec.entity_id=? AND evidence.field_key='fill_system'
           AND source.url=?`,
      [
        PHASE589_IDS.classic,
        "https://pensavings.com/products/pineider-classic-fp-red",
      ],
    );
    assert.equal(rejectedConverter.length, 1);
    assert.equal(rejectedConverter[0]?.review_status, "rejected");

    const brand = (
      await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
        PHASE589_PINEIDER_BRAND_ID,
      ])
    )[0];
    const brandBody = String(brand?.body_md ?? "");
    assert.match(brandBody, /\[\[Pineider Classic Palladium Fountain Pen\]\]/);
    assert.match(brandBody, /\[\[Pineider Tempi Moderni Fountain Pen\]\]/);

    const brandPensAfter = Number(
      (
        await rows(
          client,
          `SELECT count(DISTINCT pen.id) AS n
             FROM public_entities pen
             JOIN entity_links maker
               ON maker.source_id=pen.id AND maker.link_type='made_by'
             WHERE pen.type='pen' AND maker.target_id=?`,
          [PHASE589_PINEIDER_BRAND_ID],
        )
      )[0]?.n,
    );
    assert.equal(brandPensAfter, brandPensBefore + missingBefore);

    const replay = await applyPhase589PineiderClassicTempiModerniContent(
      client,
      applyOptions,
    );
    assert.equal(
      replay.entities.every((entity) => entity.outcome === "noop"),
      true,
    );
    assert.deepEqual(
      replay.entities.map((entity) => entity.contentHash),
      first.entities.map((entity) => entity.contentHash),
    );
    assert.equal(sha256(REAL), protectedHash);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
