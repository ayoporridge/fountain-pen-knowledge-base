import path from "node:path";
import { expect, test } from "@playwright/test";
import Database from "better-sqlite3";
import {
  HIDDEN_CONCEPT_SLUGS,
  HIDDEN_DUPLICATE_ENTITY_SLUGS,
} from "../../src/lib/public-visibility";

type MatchRow = {
  concept_slug: string;
  pen_slug: string;
  pen_type: string;
  conditions: string;
};

function readConceptContract() {
  const database = new Database(path.join(process.cwd(), "data/fpkg.db"), {
    readonly: true,
  });
  try {
    const matches = database
      .prepare(
        `SELECT cr.slug AS concept_slug, e.slug AS pen_slug,
                e.type AS pen_type, cr.conditions
         FROM concept_matches cm
         JOIN concept_rules cr ON cr.id = cm.concept_id
         JOIN entities e ON e.id = cm.entity_id
         ORDER BY cr.slug, e.slug`,
      )
      .all() as MatchRow[];
    const visibleConceptsWithoutRules = database
      .prepare(
        `SELECT e.slug
         FROM entities e
         LEFT JOIN concept_rules cr ON cr.slug = e.slug
         WHERE e.type = 'concept'
           AND e.slug NOT IN (${HIDDEN_CONCEPT_SLUGS.map(() => "?").join(", ")})
           AND cr.id IS NULL
         ORDER BY e.slug`,
      )
      .all(...HIDDEN_CONCEPT_SLUGS) as Array<{ slug: string }>;
    const invalidRules = database
      .prepare(
        `SELECT slug, conditions FROM concept_rules
         WHERE conditions LIKE '%"nib-gold"%'
            OR conditions LIKE '%"nib-steel"%'
            OR conditions LIKE '%"nib-titanium"%'
            OR conditions LIKE '%fill-worm%'`,
      )
      .all() as Array<{ slug: string; conditions: string }>;
    const unsourcedVisibleConcepts = database
      .prepare(
        `SELECT e.slug
         FROM entities e
         WHERE e.type = 'concept'
           AND e.slug NOT IN (${HIDDEN_CONCEPT_SLUGS.map(() => "?").join(", ")})
           AND NOT EXISTS (
             SELECT 1
             FROM entity_references er
             JOIN source_items si ON si.id = er.source_item_id
             WHERE er.entity_id = e.id
               AND er.review_status = 'approved'
               AND si.review_status = 'approved'
           )
         ORDER BY e.slug`,
      )
      .all(...HIDDEN_CONCEPT_SLUGS) as Array<{ slug: string }>;
    const tagPairs = new Set(
      (
        database
          .prepare(
            `SELECT et.entity_id, t.dimension, t.slug
             FROM entity_tags et
             JOIN tags t ON t.id = et.tag_id`,
          )
          .all() as Array<{
          entity_id: string;
          dimension: string;
          slug: string;
        }>
      ).map((row) => `${row.entity_id}:${row.dimension}:${row.slug}`),
    );
    const entityIds = new Map(
      (
        database.prepare("SELECT id, slug FROM entities").all() as Array<{
          id: string;
          slug: string;
        }>
      ).map((row) => [row.slug, row.id]),
    );
    return {
      matches,
      visibleConceptsWithoutRules,
      invalidRules,
      unsourcedVisibleConcepts,
      tagPairs,
      entityIds,
    };
  } finally {
    database.close();
  }
}

test.describe("Public concept contract", () => {
  test("full match cache contains only visible pens that satisfy every rule", () => {
    const contract = readConceptContract();
    expect(contract.matches.length).toBeGreaterThan(0);

    const violations: string[] = [];
    for (const match of contract.matches) {
      if (match.pen_type !== "pen") {
        violations.push(`${match.concept_slug}: non-pen ${match.pen_slug}`);
      }
      if (
        (HIDDEN_DUPLICATE_ENTITY_SLUGS as readonly string[]).includes(
          match.pen_slug,
        )
      ) {
        violations.push(`${match.concept_slug}: hidden ${match.pen_slug}`);
      }
      const penId = contract.entityIds.get(match.pen_slug);
      const conditions = JSON.parse(match.conditions) as Array<{
        dimension: string;
        tag_slug: string;
      }>;
      for (const condition of conditions) {
        if (
          !penId ||
          !contract.tagPairs.has(
            `${penId}:${condition.dimension}:${condition.tag_slug}`,
          )
        ) {
          violations.push(
            `${match.concept_slug}: ${match.pen_slug} misses ${condition.dimension}:${condition.tag_slug}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
    expect(contract.visibleConceptsWithoutRules).toEqual([]);
    expect(contract.invalidRules).toEqual([]);
    expect(contract.unsourcedVisibleConcepts).toEqual([]);
  });

  test("internal concept and tag schemas are retired from anonymous GET", async ({
    request,
  }) => {
    for (const path of [
      "/api/concepts",
      "/api/tags?level=atom",
      "/api/entities/pilot/tags",
    ]) {
      const response = await request.get(path);
      expect(response.status()).toBe(410);
      const payload = await response.json();
      expect(Object.keys(payload)).toEqual(["error"]);
      expect(JSON.stringify(payload)).not.toMatch(
        /\b(?:id|slug|dimension|conditions)\b/,
      );
    }
  });

  test("unreliable concept drafts are absent from public routes", async ({
    request,
  }) => {
    for (const slug of HIDDEN_CONCEPT_SLUGS) {
      expect((await request.get(`/concept/${slug}`)).status()).toBe(404);
    }
  });

  test("material and filling rules render as natural-language classifications", async ({
    page,
  }) => {
    await page.goto("/concept/gold-nib", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("金尖");
    await expect(page.getByText("（笔尖材质）", { exact: true })).toBeVisible();
    await expect(page.locator('a[href^="/pen/"]').first()).toBeVisible();

    await page.goto("/concept/piston-filler", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "活塞上墨",
    );
    await expect(page.getByText("（上墨方式）", { exact: true })).toBeVisible();
    await expect(page.locator('a[href^="/pen/"]').first()).toBeVisible();
  });
});
