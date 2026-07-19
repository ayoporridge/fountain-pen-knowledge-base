import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase68LamySafariAlstarContent } from "../../scripts/apply-phase68-lamy-safari-alstar-content";
import {
  PHASE68_ALSTAR_RAW_SLUG,
  PHASE68_ALSTAR_SLUG,
  PHASE68_LAMY_BRAND_ID,
  PHASE68_SAFARI_RAW_SLUG,
  PHASE68_SAFARI_SLUG,
} from "../../scripts/data/phase68-lamy-safari-alstar";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 68 canonicalizes the separately verified LAMY Safari and AL-star raw pages on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase68-lamy-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase68-lamy-safari-alstar",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL_CATALOG,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    for (const slug of [PHASE68_SAFARI_RAW_SLUG, PHASE68_ALSTAR_RAW_SLUG]) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entities WHERE slug = ? AND type = 'pen'",
          [slug],
        ),
        1,
        `checkpoint must provide exactly one verified raw pen for ${slug}`,
      );
    }
    const first = await applyPhase68LamySafariAlstarContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );
    const rows = await client.execute({
      sql: "SELECT id, slug, summary, body_md FROM public_entities WHERE slug IN (?, ?) ORDER BY slug",
      args: [PHASE68_SAFARI_SLUG, PHASE68_ALSTAR_SLUG],
    });
    assert.equal(rows.rows.length, 2);
    const bySlug = new Map(rows.rows.map((row) => [String(row.slug), row]));
    for (const [slug, expectedImage] of [
      [PHASE68_SAFARI_SLUG, "lamy-safari.svg"],
      [PHASE68_ALSTAR_SLUG, "lamy-alstar.svg"],
    ] as const) {
      const row = bySlug.get(slug);
      assert.ok(row);
      assert.ok(
        String(row?.summary ?? "").length >= 60 &&
          String(row?.summary ?? "").length <= 160,
      );
      assert.ok(String(row?.body_md ?? "").length >= 2_000);
      assert.match(String(row?.body_md), /示意图，非产品照片/);
      assert.doesNotMatch(
        String(row?.body_md),
        /数据库|仓库|canonical|made_by/i,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [String(row?.id), PHASE68_LAMY_BRAND_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
          [PHASE68_LAMY_BRAND_ID, String(row?.id)],
        ),
        1,
      );
      const media = await client.execute({
        sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
        args: [String(row?.id)],
      });
      assert.equal(media.rows.length, 1);
      assert.match(
        String(media.rows[0]?.local_path),
        new RegExp(expectedImage.replace(".", "\\.")),
      );
      assert.match(
        fs.readFileSync(
          path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
          "utf8",
        ),
        /示意图，非产品照片/,
      );
    }
    assert.match(
      String(bySlug.get(PHASE68_SAFARI_SLUG)?.body_md),
      /ASA 塑料[\s\S]*16 g[\s\S]*AL-star 的笔身是阳极氧化铝/,
    );
    assert.match(
      String(bySlug.get(PHASE68_ALSTAR_SLUG)?.body_md),
      /阳极氧化铝[\s\S]*透明握位[\s\S]*24 g[\s\S]*Safari 的 ASA 塑料/,
    );
    const redirects = await client.execute({
      sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path IN (?, ?) ORDER BY source_path",
      args: [
        `/pen/${PHASE68_SAFARI_RAW_SLUG}`,
        `/pen/${PHASE68_ALSTAR_RAW_SLUG}`,
      ],
    });
    assert.deepEqual(
      redirects.rows.map((row) => ({
        source_path: String(row.source_path),
        target_path: String(row.target_path),
        redirect_kind: String(row.redirect_kind),
      })),
      [
        {
          source_path: `/pen/${PHASE68_ALSTAR_RAW_SLUG}`,
          target_path: `/pen/${PHASE68_ALSTAR_SLUG}`,
          redirect_kind: "permanent",
        },
        {
          source_path: `/pen/${PHASE68_SAFARI_RAW_SLUG}`,
          target_path: `/pen/${PHASE68_SAFARI_SLUG}`,
          redirect_kind: "permanent",
        },
      ],
    );
    const replay = await applyPhase68LamySafariAlstarContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
