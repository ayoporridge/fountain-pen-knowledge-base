import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase23MajohnContent } from "../../scripts/apply-phase23-majohn-content";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const MAJOHN_ID = "TfXerdAZ5iWg";
const A1_ID = "34paI0Z4d-Q6";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 23 publishes Majohn and A1 from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase23-majohn-")),
  );
  const databasePath = path.join(ownedRoot, "catalog.db");
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    databasePath,
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    const applyOptions = {
      workspaceRoot: ROOT,
      reviewer: "phase23-majohn-curated-content",
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

    const first = await applyPhase23MajohnContent(client, applyOptions);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [MAJOHN_ID, "published"],
        [A1_ID, "published"],
      ],
    );

    const publicRows = await client.execute({
      sql: `SELECT id, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?)
             ORDER BY CASE id WHEN ? THEN 0 ELSE 1 END`,
      args: [MAJOHN_ID, A1_ID, MAJOHN_ID],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => String(row.id)),
      [MAJOHN_ID, A1_ID],
    );
    assert.ok(Number(publicRows.rows[0]?.body_length) >= 1_200);
    assert.ok(Number(publicRows.rows[1]?.body_length) >= 2_000);
    for (const row of publicRows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.summary_length) <= 160);
    }
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /不是 Majohn 的官方保修条款/,
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND link_type = 'made_by'`,
        [A1_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
        [A1_ID, MAJOHN_ID],
      ),
      1,
    );
    const publicModels = await client.execute({
      sql: `SELECT pen.id
              FROM entity_links link
              JOIN public_entities pen ON pen.id = link.source_id
              JOIN public_entities brand ON brand.id = link.target_id
             WHERE link.target_id = ? AND link.link_type = 'made_by'
             ORDER BY pen.id`,
      args: [MAJOHN_ID],
    });
    assert.deepEqual(
      publicModels.rows.map((row) => String(row.id)),
      [A1_ID],
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_aliases
          WHERE entity_id = ? AND lower(alias) = 'moonman'
            AND alias_kind = 'former_name'`,
        [MAJOHN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_aliases
          WHERE entity_id = ? AND lower(alias) = 'moonman a1'
            AND alias_kind = 'former_name'`,
        [A1_ID],
      ),
      1,
    );
    const variants = await client.execute({
      sql: `SELECT variant_name, variant_kind
              FROM model_variants
             WHERE model_entity_id = ?
             ORDER BY variant_name`,
      args: [A1_ID],
    });
    assert.deepEqual(
      variants.rows.map((row) => [
        String(row.variant_name),
        String(row.variant_kind),
      ]),
      [
        ["EF 钢尖", "nib"],
        ["F 钢尖", "nib"],
        ["带笔夹笔身", "variant"],
        ["无笔夹笔身", "variant"],
      ],
    );

    const media = await client.execute({
      sql: `SELECT entity_id, local_path, license, attribution_text, source_url
              FROM media_assets
             WHERE entity_id IN (?, ?) AND usage_status = 'primary'
             ORDER BY CASE entity_id WHEN ? THEN 0 ELSE 1 END`,
      args: [MAJOHN_ID, A1_ID, MAJOHN_ID],
    });
    assert.equal(media.rows.length, 2);
    const mediaPaths = media.rows.map((row) => String(row.local_path));
    assert.notEqual(mediaPaths[0], mediaPaths[1]);
    for (const row of media.rows) {
      assert.equal(String(row.license), "site-original");
      assert.match(String(row.attribution_text), /本站原创编辑插画/);
      assert.match(String(row.attribution_text), /AI 辅助制作/);
      assert.match(String(row.attribution_text), /非.*产品实拍/);
      assert.match(String(row.attribution_text), /不代表任何具体/);
      assert.ok(
        fs
          .statSync(path.join(ROOT, "public", String(row.local_path).slice(1)))
          .isFile(),
      );
    }
    assert.equal(
      fs
        .readFileSync(path.join(ROOT, "public", mediaPaths[0]?.slice(1) ?? ""))
        .equals(
          fs.readFileSync(
            path.join(ROOT, "public", mediaPaths[1]?.slice(1) ?? ""),
          ),
        ),
      false,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM media_assets media
           JOIN source_items source ON source.id = media.source_item_id
          WHERE media.entity_id = ? AND media.usage_status = 'primary'
            AND lower(coalesce(source.url, '') || ' ' ||
                      coalesce(media.source_url, '') || ' ' ||
                      coalesce(media.image_url, '')) LIKE '%ttpen%'`,
        [A1_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [MAJOHN_ID, A1_ID],
      ),
      0,
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [MAJOHN_ID, A1_ID],
    });
    const replay = await applyPhase23MajohnContent(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [MAJOHN_ID, A1_ID],
    });
    assert.deepEqual(
      revisionsAfterReplay.rows.map((row) => ({ ...row })),
      revisionsBeforeReplay.rows.map((row) => ({ ...row })),
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  }
});
