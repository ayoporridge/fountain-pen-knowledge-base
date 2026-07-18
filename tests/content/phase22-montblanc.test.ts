import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase22MontblancContent } from "../../scripts/apply-phase22-content";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const MONTBLANC_ID = "CJM8uLY0LmIX";
const MONTBLANC_149_ID = "1fojl5ZRSeua";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 22 publishes sourced Montblanc brand then 149 on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase22-")),
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
      reviewer: "phase22-curated-content",
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
    const first = await applyPhase22MontblancContent(client, applyOptions);

    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [MONTBLANC_ID, "published"],
        [MONTBLANC_149_ID, "published"],
      ],
    );

    const publicRows = await client.execute({
      sql: `
        SELECT id, type, length(body_md) AS body_length
        FROM public_entities
        WHERE id IN (?, ?)
        ORDER BY CASE id WHEN ? THEN 0 ELSE 1 END
      `,
      args: [MONTBLANC_ID, MONTBLANC_149_ID, MONTBLANC_ID],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => String(row.id)),
      [MONTBLANC_ID, MONTBLANC_149_ID],
    );
    assert.ok(Number(publicRows.rows[0]?.body_length) >= 1_200);
    assert.ok(Number(publicRows.rows[1]?.body_length) >= 2_000);

    for (const entityId of [MONTBLANC_ID, MONTBLANC_149_ID]) {
      assert.equal(
        await scalar(
          client,
          `SELECT blocker_count AS value
             FROM public_entity_readiness
            WHERE entity_id = ? AND contract_version = 3`,
          [entityId],
        ),
        0,
      );
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value
             FROM publication_v2_current_reviews review
            WHERE review.entity_id = ?
              AND review.review_kind IN ('fact', 'language', 'media', 'publication')`,
          [entityId],
        ),
        4,
      );
    }

    assert.equal(
      await scalar(
        client,
        `SELECT count(DISTINCT evidence.field_key) AS value
           FROM spec_field_evidence evidence
           JOIN model_specs spec ON spec.id = evidence.model_spec_id
          WHERE spec.entity_id = ? AND evidence.review_status = 'approved'`,
        [MONTBLANC_149_ID],
      ),
      10,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM publication_v2_source_group_counts
          WHERE entity_id = ?
            AND primary_archive_group_count >= 1
            AND professional_secondary_group_count >= 1`,
        [MONTBLANC_149_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM media_assets
          WHERE entity_id = ? AND usage_status = 'primary'
            AND review_status = 'approved' AND lower(license) = 'cc-by-2.0'`,
        [MONTBLANC_149_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
        [MONTBLANC_149_ID, MONTBLANC_ID],
      ),
      1,
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [MONTBLANC_ID, MONTBLANC_149_ID],
    });
    const replay = await applyPhase22MontblancContent(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [MONTBLANC_ID, MONTBLANC_149_ID],
    });
    assert.deepEqual(
      revisionsAfterReplay.rows.map((row) => ({ ...row })),
      revisionsBeforeReplay.rows.map((row) => ({ ...row })),
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }

  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
