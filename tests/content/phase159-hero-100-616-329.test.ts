import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase159HeroContent } from "../../scripts/apply-phase159-hero-100-616-329-content";
import {
  PHASE159_HERO_BRAND_ID,
  PHASE159_IDS,
  PHASE159_OLD_SLUGS,
} from "../../scripts/data/phase159-hero-100-616-329";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGETS = [
  { id: PHASE159_IDS.hero100, slug: "hero-100", marker: /14K|14Ｋ/ },
  {
    id: PHASE159_IDS.hero616,
    slug: "hero-616",
    marker: /挤压囊|squeeze filler/i,
  },
  { id: PHASE159_IDS.hero329, slug: "hero-329", marker: /slip cap|139/ },
] as const;

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 159 canonicalizes and publishes Hero 100, 616 and 329 on an owned copy", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase159-hero-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(root, "catalog.db"),
    root,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase159-hero-test",
    databasePath: copy.destinationPath,
    ownedRoot: root,
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
    await assert.rejects(
      applyPhase159HeroContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase159HeroContent(client, options);
    assert.equal(first.entities.length, 4);
    for (const target of TARGETS) {
      const item = first.entities.find(
        (candidate) => candidate.entityId === target.id,
      );
      assert.equal(item?.outcome, "published");
      const entity = await client.execute({
        sql: "SELECT slug,name FROM entities WHERE id=?",
        args: [target.id],
      });
      assert.deepEqual(entity.rows[0], {
        slug: target.slug,
        name:
          target.slug === "hero-100"
            ? "英雄 Hero 100"
            : target.slug === "hero-616"
              ? "英雄 Hero 616"
              : "英雄 Hero 329",
      });
      const oldSlug = Object.values(PHASE159_OLD_SLUGS).find(
        (value) => value.replace("英雄-hero-", "hero-") === target.slug,
      );
      assert.ok(oldSlug);
      const redirect = await client.execute({
        sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
        args: [`/pen/${oldSlug}`],
      });
      assert.deepEqual(redirect.rows[0], {
        target_path: `/pen/${target.slug}`,
        redirect_kind: "permanent",
      });
      const publicRow = await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [target.id],
      });
      assert.equal(publicRow.rows.length, 1);
      const body = String(publicRow.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2_000);
      assert.match(body, target.marker);
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          [target.id, PHASE159_HERO_BRAND_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          [PHASE159_HERO_BRAND_ID, target.id],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          [target.id],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE entity_id=?",
          [target.id],
        ),
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT status FROM entity_publications WHERE entity_id=?",
            args: [target.id],
          })
        ).rows[0]?.status,
        "published",
      );
    }
    const second = await applyPhase159HeroContent(client, options);
    assert.ok(second.entities.every((item) => item.outcome === "noop"));
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
