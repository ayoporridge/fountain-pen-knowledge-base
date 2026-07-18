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
const MONTBLANC_146_ID = "91c7e6azUmK8";
const MONTBLANC_144_ID = "Eh5c49pldpwk";
const MONTBLANC_NO_22_ID = "nOIr_Up5WcyJ";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 22 publishes sourced Montblanc models and preserves media-blocked drafts", async () => {
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
        [MONTBLANC_146_ID, "published"],
        [MONTBLANC_144_ID, "blocked"],
        [MONTBLANC_NO_22_ID, "blocked"],
      ],
    );

    const publicRows = await client.execute({
      sql: `
        SELECT id, type, length(body_md) AS body_length
        FROM public_entities
        WHERE id IN (?, ?, ?, ?, ?)
        ORDER BY CASE id
          WHEN ? THEN 0
          WHEN ? THEN 1
          WHEN ? THEN 2
          WHEN ? THEN 3
          ELSE 4
        END
      `,
      args: [
        MONTBLANC_ID,
        MONTBLANC_149_ID,
        MONTBLANC_146_ID,
        MONTBLANC_144_ID,
        MONTBLANC_NO_22_ID,
        MONTBLANC_ID,
        MONTBLANC_149_ID,
        MONTBLANC_146_ID,
        MONTBLANC_144_ID,
      ],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => String(row.id)),
      [MONTBLANC_ID, MONTBLANC_149_ID, MONTBLANC_146_ID],
    );
    assert.ok(Number(publicRows.rows[0]?.body_length) >= 1_200);
    assert.ok(Number(publicRows.rows[1]?.body_length) >= 2_000);
    assert.ok(Number(publicRows.rows[2]?.body_length) >= 2_000);

    for (const entityId of [MONTBLANC_ID, MONTBLANC_149_ID, MONTBLANC_146_ID]) {
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

    for (const entityId of [MONTBLANC_144_ID, MONTBLANC_NO_22_ID]) {
      const draft = await client.execute({
        sql: `
          SELECT publication.status, publication.blockers_json,
                 publication.published_at,
                 length(entity.body_md) AS body_length,
                 CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          JOIN entity_publications publication ON publication.entity_id = entity.id
          LEFT JOIN public_entities public ON public.id = entity.id
          WHERE entity.id = ?
        `,
        args: [entityId],
      });
      assert.equal(String(draft.rows[0]?.status), "draft");
      assert.equal(draft.rows[0]?.published_at, null);
      assert.equal(Number(draft.rows[0]?.is_public), 0);
      assert.ok(Number(draft.rows[0]?.body_length) >= 2_000);
      assert.ok(
        (
          JSON.parse(String(draft.rows[0]?.blockers_json ?? "[]")) as string[]
        ).includes("missing_approved_primary_media"),
      );
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value
             FROM media_assets
            WHERE entity_id = ? AND usage_status = 'primary'`,
          [entityId],
        ),
        0,
      );
      assert.ok(
        (await scalar(
          client,
          `SELECT count(*) AS value
             FROM entity_references
            WHERE entity_id = ? AND review_status = 'approved'`,
          [entityId],
        )) >= 2,
      );
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value
             FROM publication_blockers
            WHERE entity_id = ? AND contract_version = 3
              AND blocker_code = 'missing_approved_primary_media'`,
          [entityId],
        ),
        1,
      );
    }

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_aliases
          WHERE entity_id = ? AND lower(alias) = 'student 22'`,
        [MONTBLANC_NO_22_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_aliases alias
           JOIN source_items source ON source.id = alias.source_item_id
          WHERE alias.entity_id = ? AND alias.alias = '学生龙 22'
            AND alias.alias_kind = 'regional_name'
            AND source.url = '/evidence/snapshots/montblanc/144-22-sources-2026-07-19.v1.json'`,
        [MONTBLANC_NO_22_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM spec_field_evidence evidence
           JOIN model_specs spec ON spec.id = evidence.model_spec_id
           JOIN citations citation ON citation.id = evidence.citation_id
           JOIN source_items source ON source.id = citation.source_item_id
          WHERE spec.entity_id = ? AND evidence.field_key = 'fill_system'
            AND source.url = 'https://lenskiy.org/2023/10/montblanc-meisterstuck-144-gen-2/'`,
        [MONTBLANC_144_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM fact_conflicts
          WHERE entity_id = ? AND field_key = 'release_year'
            AND conflict_kind = 'field' AND status = 'resolved'`,
        [MONTBLANC_146_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM spec_field_evidence evidence
           JOIN model_specs spec ON spec.id = evidence.model_spec_id
           JOIN citations citation ON citation.id = evidence.citation_id
           JOIN source_items source ON source.id = citation.source_item_id
          WHERE spec.entity_id = ? AND evidence.field_key = 'release_year'
            AND evidence.review_status = 'rejected'
            AND source.url = 'https://www.handoverthatpen.com/2017/03/10/review-montblanc-legrand-146/'`,
        [MONTBLANC_146_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?, ?, ?, ?)
            AND source.archive_url LIKE '.planning/%'`,
        [
          MONTBLANC_ID,
          MONTBLANC_149_ID,
          MONTBLANC_146_ID,
          MONTBLANC_144_ID,
          MONTBLANC_NO_22_ID,
        ],
      ),
      0,
    );

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
            AND review_status = 'approved' AND lower(license) = 'cc-by-2.0'
            AND local_path = '/images/entities/montblanc/montblanc-146-platinum-trim.jpg'`,
        [MONTBLANC_146_ID],
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
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links link
           JOIN public_entities public_pen ON public_pen.id = link.source_id
           JOIN public_entities public_brand ON public_brand.id = link.target_id
          WHERE link.source_id IN (?, ?)
            AND link.target_id = ? AND link.link_type = 'made_by'`,
        [MONTBLANC_149_ID, MONTBLANC_146_ID, MONTBLANC_ID],
      ),
      2,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links link
           JOIN public_entities public_pen ON public_pen.id = link.source_id
           JOIN public_entities public_brand ON public_brand.id = link.target_id
          WHERE link.source_id IN (?, ?)
            AND link.target_id = ? AND link.link_type = 'made_by'`,
        [MONTBLANC_144_ID, MONTBLANC_NO_22_ID, MONTBLANC_ID],
      ),
      0,
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [
        MONTBLANC_ID,
        MONTBLANC_149_ID,
        MONTBLANC_146_ID,
        MONTBLANC_144_ID,
        MONTBLANC_NO_22_ID,
      ],
    });
    const replay = await applyPhase22MontblancContent(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [
        MONTBLANC_ID,
        MONTBLANC_149_ID,
        MONTBLANC_146_ID,
        MONTBLANC_144_ID,
        MONTBLANC_NO_22_ID,
      ],
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
