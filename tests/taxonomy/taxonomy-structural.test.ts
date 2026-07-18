import assert from "node:assert/strict";
import test from "node:test";
import type { Client } from "@libsql/client";
import {
  cleanupTaxonomyFixture,
  createTaxonomyFixture,
  type TaxonomyFixture,
} from "../../scripts/lib/taxonomy-fixture";
import {
  applyTaxonomyPlan,
  resolveLockedSplitTaxonomyPlan,
} from "../../src/lib/taxonomy/apply-taxonomy";
import {
  loadTaxonomyPlan,
  type PayloadAssignment,
  type TaxonomyPlan,
} from "../../src/lib/taxonomy/identity-plan";
import { validateVariantHierarchy } from "../../src/lib/taxonomy/reference-migration";

const LOCKED = {
  brands: {
    waterman: "zkAu9PePDdqJ",
    opus: "I6tjleAZx9RU",
    leonardo: "g5r4udSOYhI5",
    aurora: "CJXe8UpnkHLJ",
  },
  donors: {
    waterman: "gwKClNnwt3V3",
    opus: "dTCUDu03vrI6",
    leonardo: "s0HAxT1gsHxh",
    aurora: "G9ptvLpfyzNQ",
  },
  outputs: {
    hemisphere: "gwKClNnwt3V3",
    charleston: "4dcEbeUCjxH-",
    demo: "CqFpmT3l4Mtm",
    koloro: "0CNmbxM54-GA",
    furore: "ixul2gTcJ06B",
    momento: "UE5otlwKUfp9",
    aurora88: "5CcEDOz9jiUg",
    optima: "5waoVLPHU2Pt",
  },
} as const;

function assignment(
  donorId: string,
  surface: PayloadAssignment["surface"],
  itemId: string,
  disposition: PayloadAssignment["disposition"],
  targetId: string | null,
  ordinal: number,
): PayloadAssignment {
  return {
    donorId,
    surface,
    ordinal,
    itemId,
    slotKey: null,
    evidenceChecksum: `sha256:${String(ordinal).padStart(64, "a")}`,
    requiresOwnedCopyResolution: false,
    disposition,
    targetId,
  };
}

function exactStructuralPlan(): TaxonomyPlan {
  const plan = structuredClone(loadTaxonomyPlan());
  plan.payloadAssignments = [
    assignment(
      LOCKED.donors.opus,
      "story",
      "locked-story-opus",
      "supported_output",
      LOCKED.outputs.demo,
      1,
    ),
    assignment(
      LOCKED.donors.opus,
      "media",
      "locked-media-opus",
      "pending_conflict",
      null,
      2,
    ),
    assignment(
      LOCKED.donors.opus,
      "review",
      "locked-review-opus",
      "retired_source",
      null,
      3,
    ),
  ];
  return plan;
}

async function insert(
  db: Client,
  sql: string,
  args: Array<string | number | null> = [],
): Promise<void> {
  await db.execute({ sql, args });
}

async function scalar(
  db: Client,
  sql: string,
  args: string[] = [],
): Promise<string> {
  const result = await db.execute({ sql, args });
  assert.equal(result.rows.length, 1);
  return String(Object.values(result.rows[0] ?? {})[0]);
}

async function seedLockedFixture(fixture: TaxonomyFixture): Promise<void> {
  const db = fixture.client;
  const donors = [
    [
      LOCKED.donors.waterman,
      "威迪文-waterman-查尔斯顿-hemisphere",
      "威迪文 Waterman 查尔斯顿 Hemisphere",
      LOCKED.brands.waterman,
    ],
    [
      LOCKED.donors.opus,
      "opus-88-demo-kolora",
      "Opus 88 Demo/Kolora",
      LOCKED.brands.opus,
    ],
    [
      LOCKED.donors.leonardo,
      "leonardo-furore-momento-magico",
      "Leonardo Furore / Momento Magico",
      LOCKED.brands.leonardo,
    ],
    [
      LOCKED.donors.aurora,
      "奥罗拉-aurora",
      "奥罗拉 Aurora —",
      LOCKED.brands.aurora,
    ],
  ] as const;
  for (const [id, slug, name, makerId] of donors) {
    await insert(
      db,
      "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)",
      [id, slug, name],
    );
    await insert(
      db,
      "INSERT INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, 'made_by')",
      [`locked-maker-${id}`, id, makerId],
    );
  }
  await db.execute(
    `UPDATE entity_publications
        SET status = 'in_review', blockers_json = '[]'
      WHERE entity_id IN (?, ?, ?, ?, ?, ?, ?, ?)`,
    [...Object.values(LOCKED.brands), ...Object.values(LOCKED.donors)],
  );
  await insert(
    db,
    `INSERT INTO stories (id, entity_id, title, body_md, status)
     VALUES ('locked-story-opus', ?, 'Demo only', 'Demo sentinel', 'draft')`,
    [LOCKED.donors.opus],
  );
  await insert(
    db,
    `INSERT INTO media_assets
      (id, entity_id, title, image_url, review_status, usage_status)
     VALUES ('locked-media-opus', ?, 'Ambiguous mixed hero',
       'https://example.test/mixed.jpg', 'needs_license', 'candidate')`,
    [LOCKED.donors.opus],
  );
  await insert(
    db,
    `INSERT INTO entity_content_reviews
      (id, entity_id, review_kind, content_hash, status, reviewer, reviewed_at)
     VALUES ('locked-review-opus', ?, 'fact', ?, 'approved', 'fixture', '2026-07-19')`,
    [LOCKED.donors.opus, `sha256:v3:${"a".repeat(64)}`],
  );
}

async function withLockedFixture(
  run: (fixture: TaxonomyFixture) => Promise<void>,
): Promise<void> {
  const fixture = await createTaxonomyFixture({
    NODE_ENV: "test",
    TAXONOMY_FIXTURE: "1",
  });
  try {
    await seedLockedFixture(fixture);
    await run(fixture);
  } finally {
    await cleanupTaxonomyFixture(fixture);
  }
}

test("mixed split applies exact locked outputs and ambiguous payload stays retired", async () => {
  await withLockedFixture(async ({ client }) => {
    const resolved = await resolveLockedSplitTaxonomyPlan(
      client,
      exactStructuralPlan(),
    );
    assert.deepEqual(resolved.blockers, []);
    assert.equal(resolved.outputs.length, 8);

    const result = await applyTaxonomyPlan(client, resolved);
    assert.equal(result.applied, true);
    assert.equal(
      await scalar(
        client,
        "SELECT COUNT(*) FROM entities WHERE id IN (?, ?, ?, ?, ?, ?, ?, ?)",
        [...Object.values(LOCKED.outputs)],
      ),
      "8",
    );
    assert.equal(
      await scalar(client, "SELECT slug FROM entities WHERE id = ?", [
        LOCKED.outputs.hemisphere,
      ]),
      "waterman-hemisphere",
    );
    assert.equal(
      await scalar(
        client,
        "SELECT entity_id FROM stories WHERE id = 'locked-story-opus'",
      ),
      LOCKED.outputs.demo,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT entity_id FROM media_assets WHERE id = 'locked-media-opus'",
      ),
      LOCKED.donors.opus,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT COUNT(*) FROM public_entities WHERE id IN (?, ?, ?, ?, ?, ?, ?, ?)",
        [...Object.values(LOCKED.outputs)],
      ),
      "0",
    );
  });
});

test("variant hierarchy adds no pen entity and ambiguous payload blocks", async () => {
  const variants = validateVariantHierarchy([
    {
      id: "pgs-shikiori",
      modelEntityId: "pgs-model001",
      kind: "edition_group",
      parentId: null,
    },
    {
      id: "pgs-spring-rain",
      modelEntityId: "pgs-model001",
      kind: "color",
      parentId: "pgs-shikiori",
    },
    {
      id: "pgs-mf-nib",
      modelEntityId: "pgs-model001",
      kind: "nib",
      parentId: "pgs-shikiori",
    },
  ]);
  assert.equal(variants.modelEntityIds.size, 1);
  assert.equal(variants.variantIds.size, 3);

  await withLockedFixture(async ({ client }) => {
    const plan = exactStructuralPlan();
    plan.payloadAssignments.push(
      assignment(
        LOCKED.donors.opus,
        "story",
        "locked-story-opus",
        "supported_output",
        LOCKED.outputs.koloro,
        4,
      ),
    );
    const resolved = await resolveLockedSplitTaxonomyPlan(client, plan);
    assert.equal(
      resolved.blockers.some(
        (item) => item.code === "ambiguous_payload_assignment",
      ),
      true,
    );
    await assert.rejects(() => applyTaxonomyPlan(client, resolved), /blocker/);
    assert.equal(
      await scalar(client, "SELECT COUNT(*) FROM entities WHERE id = ?", [
        LOCKED.outputs.demo,
      ]),
      "0",
    );
  });
});
