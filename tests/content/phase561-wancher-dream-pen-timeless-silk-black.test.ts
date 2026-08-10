import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase561Options,
  applyPhase561WancherDreamPenTimelessSilkBlack,
} from "../../scripts/apply-phase561-wancher-dream-pen-timeless-silk-black";
import {
  PHASE561_TIMELESS_ID,
  PHASE561_TIMELESS_SLUG,
  PHASE561_WANCHER_BRAND_ID,
  phase561WancherDreamPenTimelessSilkBlackPacks,
} from "../../scripts/data/phase561-wancher-dream-pen-timeless-silk-black";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

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

test("Phase 561 publishes Wancher Dream Pen Timeless Silk Black on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase561-wancher-timeless-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase561Options = {
    workspaceRoot: ROOT,
    reviewer: "phase561-wancher-timeless-silk-black-test",
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
    const modelPack = phase561WancherDreamPenTimelessSilkBlackPacks.find(
      (pack) => pack.entityId === PHASE561_TIMELESS_ID,
    );
    assert.ok(modelPack);
    assert.equal(modelPack.expectedSlug, PHASE561_TIMELESS_SLUG);
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
        .size >= 7,
    );
    assert.ok(
      modelPack.sources.some(
        (source) => source.tier === "professional_secondary",
      ),
    );
    assert.deepEqual(
      modelPack.variants?.map((variant) => variant.productCode),
      ["WF-EB-DREAM-SKBK-JR-F", "WF-EB-DREAM-SKBK-JR-M"],
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
              PHASE561_TIMELESS_ID,
              PHASE561_TIMELESS_SLUG,
              modelPack.canonicalName,
            ],
          )
        )[0]?.n,
      ),
      0,
    );
    await assert.rejects(
      applyPhase561WancherDreamPenTimelessSilkBlack(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );

    const first = await applyPhase561WancherDreamPenTimelessSilkBlack(
      client,
      options,
    );
    assert.equal(
      first.entities.find((entity) => entity.entityId === PHASE561_TIMELESS_ID)
        ?.outcome,
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
        [PHASE561_TIMELESS_ID],
      )
    )[0];
    assert.equal(state?.type, "pen");
    assert.equal(state?.slug, PHASE561_TIMELESS_SLUG);
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
      "Timeless",
      "Silk Black",
      "#5",
      "WF-EB-DREAM-SKBK-JR-F",
      "WF-EB-DREAM-SKBK-JR-M",
      "135 mm",
      "16 g",
      "Mini Converter",
      "True Ebonite Silk Black",
      "维护",
      "购买前",
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
            [PHASE561_TIMELESS_ID],
          )
        )[0]?.n,
      ),
      2,
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id=?",
            [PHASE561_TIMELESS_ID, PHASE561_WANCHER_BRAND_ID],
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
            [PHASE561_WANCHER_BRAND_ID, PHASE561_TIMELESS_ID],
          )
        )[0]?.n,
      ),
      1,
    );
    const replay = await applyPhase561WancherDreamPenTimelessSilkBlack(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((entity) => entity.entityId === PHASE561_TIMELESS_ID)
        ?.outcome,
      "noop",
    );
    assert.equal(
      replay.entities.find((entity) => entity.entityId === PHASE561_TIMELESS_ID)
        ?.contentHash,
      first.entities.find((entity) => entity.entityId === PHASE561_TIMELESS_ID)
        ?.contentHash,
    );
    assert.equal(sha256(REAL), protectedHash);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
