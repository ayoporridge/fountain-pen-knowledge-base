import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase559Options,
  applyPhase559WancherDreamPenAluminumClassic,
} from "../../scripts/apply-phase559-wancher-dream-pen-aluminum-classic";
import {
  PHASE559_ALUMINUM_CLASSIC_ID,
  PHASE559_ALUMINUM_CLASSIC_SLUG,
  PHASE559_WANCHER_BRAND_ID,
  phase559WancherDreamPenAluminumClassicPacks,
} from "../../scripts/data/phase559-wancher-dream-pen-aluminum-classic";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

test("Phase 559 publishes Wancher Dream Pen Aluminum Classic on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase559-wancher-aluminum-classic-"),
    ),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase559Options = {
    workspaceRoot: ROOT,
    reviewer: "phase559-wancher-aluminum-classic-test",
    databasePath: copy.destinationPath,
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
  try {
    await migrateDatabase(client);
    const modelPack = phase559WancherDreamPenAluminumClassicPacks.find(
      (pack) => pack.entityId === PHASE559_ALUMINUM_CLASSIC_ID,
    );
    assert.ok(modelPack);
    assert.equal(modelPack.expectedSlug, PHASE559_ALUMINUM_CLASSIC_SLUG);
    const markdown = fs.readFileSync(
      path.join(ROOT, modelPack.markdownFile),
      "utf8",
    );
    assert.ok(Array.from(markdown).length >= 5_000);
    assert.ok(markdown.includes("## body_md"));
    assert.ok(markdown.includes("## 来源"));
    assert.ok(modelPack.sources.length >= 8);
    assert.ok(
      new Set(modelPack.sources.map((source) => source.independenceGroup))
        .size >= 6,
    );
    assert.ok(
      modelPack.sources.some(
        (source) => source.tier === "professional_secondary",
      ),
    );
    assert.equal(modelPack.variants?.length, 4);
    assert.deepEqual(
      modelPack.variants?.map((variant) => variant.productCode),
      [
        "WF-DREAM-ALU-GL-EF",
        "WF-DREAM-ALU-GL-F",
        "WF-DREAM-ALU-GL-M",
        "WF-DREAM-ALU-GL-B",
      ],
    );
    assert.ok((modelPack.spec?.evidence.length ?? 0) >= 11);
    const media = modelPack.media[0];
    assert.ok(media?.localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", media.localPath.replace(/^\//, "")),
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

    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entities WHERE id=? OR slug=? OR lower(name)=lower(?)",
            [
              PHASE559_ALUMINUM_CLASSIC_ID,
              PHASE559_ALUMINUM_CLASSIC_SLUG,
              modelPack.canonicalName,
            ],
          )
        )[0]?.n,
      ),
      0,
    );

    await assert.rejects(
      applyPhase559WancherDreamPenAluminumClassic(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );

    const first = await applyPhase559WancherDreamPenAluminumClassic(
      client,
      options,
    );
    assert.equal(
      first.entities.find(
        (entity) => entity.entityId === PHASE559_ALUMINUM_CLASSIC_ID,
      )?.outcome,
      "published",
    );

    const state = (
      await rows(
        client,
        `SELECT e.type,e.slug,e.name,e.body_md,p.status,p.content_revision,
                p.reviewed_content_revision,p.reviewed_contract_version,p.approved_content_hash,
                r.publishable,r.blocker_count,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
         FROM entities e JOIN entity_publications p ON p.entity_id=e.id
         LEFT JOIN public_entity_readiness r ON r.entity_id=e.id AND r.contract_version=3
         LEFT JOIN public_entities public ON public.id=e.id WHERE e.id=?`,
        [PHASE559_ALUMINUM_CLASSIC_ID],
      )
    )[0];
    assert.equal(state?.type, "pen");
    assert.equal(state?.slug, PHASE559_ALUMINUM_CLASSIC_SLUG);
    assert.equal(state?.status, "published");
    assert.equal(Number(state?.reviewed_contract_version), 3);
    assert.equal(
      Number(state?.reviewed_content_revision),
      Number(state?.content_revision),
    );
    assert.equal(Number(state?.publishable), 1);
    assert.equal(Number(state?.blocker_count), 0);
    assert.equal(Number(state?.is_public), 1);
    const body = String(state?.body_md ?? "");
    for (const phrase of [
      "Aluminum Classic",
      "铝制",
      "#6 JoWo",
      "WF-DREAM-ALU-GL-EF",
      "152.5 mm",
      "15.3 mm",
      "41 g",
      "Contemporary",
      "维护",
      "选购",
      "Sold out",
    ]) {
      assert.match(
        body,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }
    assert.doesNotMatch(body, /made_by|数据库|仓库|canonical/i);

    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            [PHASE559_ALUMINUM_CLASSIC_ID],
          )
        )[0]?.n,
      ),
      4,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entity_references WHERE entity_id=? AND review_status='approved'",
            [PHASE559_ALUMINUM_CLASSIC_ID],
          )
        )[0]?.n,
      ),
      modelPack.sources.length,
    );
    assert.ok(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
            [PHASE559_ALUMINUM_CLASSIC_ID],
          )
        )[0]?.n,
      ) >= 11,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved'",
            [PHASE559_ALUMINUM_CLASSIC_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            [PHASE559_ALUMINUM_CLASSIC_ID, PHASE559_WANCHER_BRAND_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            [PHASE559_WANCHER_BRAND_ID, PHASE559_ALUMINUM_CLASSIC_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE559_ALUMINUM_CLASSIC_ID,
    );
    assert.equal(String(state?.approved_content_hash), hash);
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          [PHASE559_ALUMINUM_CLASSIC_ID, hash],
        )
      ).map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );

    const replay = await applyPhase559WancherDreamPenAluminumClassic(
      client,
      options,
    );
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    assert.equal(
      (await rows(client, "PRAGMA integrity_check"))[0]?.integrity_check,
      "ok",
    );
    assert.equal((await rows(client, "PRAGMA foreign_key_check")).length, 0);
    assert.equal(sha256(REAL), protectedHash);
    assertCatalogSnapshotUnchanged(
      protectedSnapshot,
      snapshotCatalogFiles(REAL),
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.equal(sha256(REAL), protectedHash);
  assertCatalogSnapshotUnchanged(protectedSnapshot, snapshotCatalogFiles(REAL));
});
