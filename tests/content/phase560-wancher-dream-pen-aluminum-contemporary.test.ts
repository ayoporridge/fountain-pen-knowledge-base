import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase560Options,
  applyPhase560WancherDreamPenAluminumContemporary,
} from "../../scripts/apply-phase560-wancher-dream-pen-aluminum-contemporary";
import {
  PHASE560_ALUMINUM_CONTEMPORARY_ID,
  PHASE560_ALUMINUM_CONTEMPORARY_SLUG,
  PHASE560_WANCHER_BRAND_ID,
  phase560WancherDreamPenAluminumContemporaryPacks,
} from "../../scripts/data/phase560-wancher-dream-pen-aluminum-contemporary";
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

test("Phase 560 publishes Wancher Dream Pen Aluminum Contemporary on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase560-wancher-aluminum-contemporary-"),
    ),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase560Options = {
    workspaceRoot: ROOT,
    reviewer: "phase560-wancher-aluminum-contemporary-test",
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
    const modelPack = phase560WancherDreamPenAluminumContemporaryPacks.find(
      (pack) => pack.entityId === PHASE560_ALUMINUM_CONTEMPORARY_ID,
    );
    assert.ok(modelPack);
    assert.equal(modelPack.expectedSlug, PHASE560_ALUMINUM_CONTEMPORARY_SLUG);
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
    assert.deepEqual(
      modelPack.variants?.map((variant) => variant.productCode),
      [
        "WF-DREAM-ALU-RG-EF",
        "WF-DREAM-ALU-RG-F",
        "WF-DREAM-ALU-RG-M",
        "WF-DREAM-ALU-RG-B",
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
              PHASE560_ALUMINUM_CONTEMPORARY_ID,
              PHASE560_ALUMINUM_CONTEMPORARY_SLUG,
              modelPack.canonicalName,
            ],
          )
        )[0]?.n,
      ),
      0,
    );

    await assert.rejects(
      applyPhase560WancherDreamPenAluminumContemporary(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );

    const first = await applyPhase560WancherDreamPenAluminumContemporary(
      client,
      options,
    );
    assert.equal(
      first.entities.find(
        (entity) => entity.entityId === PHASE560_ALUMINUM_CONTEMPORARY_ID,
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
        [PHASE560_ALUMINUM_CONTEMPORARY_ID],
      )
    )[0];
    assert.equal(state?.type, "pen");
    assert.equal(state?.slug, PHASE560_ALUMINUM_CONTEMPORARY_SLUG);
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
      "Aluminum Contemporary",
      "玫瑰金",
      "#6 Jowo",
      "WF-DREAM-ALU-RG-EF",
      "152.5 mm",
      "15.3 mm",
      "41 g",
      "Classic",
      "维护",
      "购买前",
      "Sold out",
    ]) {
      assert.match(
        body,
        new RegExp(phrase.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")),
      );
    }
    assert.doesNotMatch(body, /made_by|数据库|仓库|canonical/i);
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            [PHASE560_ALUMINUM_CONTEMPORARY_ID],
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
            "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id=?",
            [PHASE560_ALUMINUM_CONTEMPORARY_ID, PHASE560_WANCHER_BRAND_ID],
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
            [PHASE560_WANCHER_BRAND_ID, PHASE560_ALUMINUM_CONTEMPORARY_ID],
          )
        )[0]?.n,
      ),
      1,
    );

    const replay = await applyPhase560WancherDreamPenAluminumContemporary(
      client,
      options,
    );
    assert.equal(
      replay.entities.find(
        (entity) => entity.entityId === PHASE560_ALUMINUM_CONTEMPORARY_ID,
      )?.outcome,
      "noop",
    );
    assert.equal(
      replay.entities.find(
        (entity) => entity.entityId === PHASE560_ALUMINUM_CONTEMPORARY_ID,
      )?.contentHash,
      first.entities.find(
        (entity) => entity.entityId === PHASE560_ALUMINUM_CONTEMPORARY_ID,
      )?.contentHash,
    );
    assert.equal(sha256(REAL), protectedHash);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
