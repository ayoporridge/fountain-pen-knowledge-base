import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import type { Client } from "@libsql/client";
import {
  assertRendererFixtureEnvironment,
  cleanupRendererFixture,
  createRendererFixture,
  type RendererFixture,
  type RendererFixtureSeed,
  seedRendererFixture,
} from "../../scripts/lib/renderer-fixture";

const ROOT = process.cwd();
const SAFE_ENV: NodeJS.ProcessEnv = {
  ...process.env,
  TURSO_DATABASE_URL: "",
  TURSO_AUTH_TOKEN: "",
  FPKG_DATABASE_URL: "",
  PUBLICATION_GATE_FIXTURE: "",
  RENDERER_FIXTURE: "1",
  E2E_BASE_URL: "",
};

let fixture: RendererFixture;
let seed: RendererFixtureSeed;

function tempRoots(): string[] {
  return fs
    .readdirSync(os.tmpdir())
    .filter((entry) => entry.startsWith("fpkg-renderer-"))
    .sort();
}

async function scalarNumber(
  client: Client,
  sql: string,
  args: readonly (string | number)[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args: [...args] });
  return Number(result.rows[0]?.value ?? result.rows[0]?.count ?? 0);
}

async function withPermissivePublicRoot<T>(run: () => Promise<T>): Promise<T> {
  const schema = await fixture.client.execute({
    sql: "SELECT sql FROM sqlite_schema WHERE type = 'view' AND name = 'public_entities'",
    args: [],
  });
  const canonicalView = schema.rows[0]?.sql;
  assert.equal(typeof canonicalView, "string");

  await fixture.client.execute("DROP VIEW public_entities");
  await fixture.client.execute(`
    CREATE VIEW public_entities AS
    SELECT id, type, slug, name, summary, body_md, source, created_at,
           updated_at, source_url, source_file, imported_at
    FROM entities
    WHERE type IN ('brand', 'pen')
  `);
  try {
    return await run();
  } finally {
    await fixture.client.execute("DROP VIEW public_entities");
    await fixture.client.execute(canonicalView as string);
  }
}

before(async () => {
  assertRendererFixtureEnvironment(SAFE_ENV);
  fixture = await createRendererFixture(SAFE_ENV);
  seed = await seedRendererFixture(fixture);
});

after(async () => {
  if (fixture) await cleanupRendererFixture(fixture);
});

describe("fixture boot", () => {
  it("migrates and seeds only the owned renderer database", async () => {
    assert.ok(fs.existsSync(fixture.databasePath));
    assert.ok(
      fixture.databasePath.startsWith(`${fixture.tempRoot}${path.sep}`),
    );
    assert.equal(fixture.databaseUrl, `file:${fixture.databasePath}`);

    const publicBrands = await scalarNumber(
      fixture.client,
      "SELECT count(*) AS value FROM public_entities WHERE type = 'brand' AND id LIKE 'renderer-%'",
    );
    const publicModels = await scalarNumber(
      fixture.client,
      "SELECT count(*) AS value FROM public_entities WHERE type = 'pen' AND id LIKE 'renderer-model-%'",
    );
    assert.equal(publicBrands, 1);
    assert.equal(publicModels, 15);
  });

  it("owns fifteen stable model links, one canonical brand, and all PAGE-06 topics", async () => {
    const brandModels = await scalarNumber(
      fixture.client,
      `SELECT count(DISTINCT public_pen.id) AS value
       FROM public_entities public_brand
       JOIN entity_links relation
         ON relation.target_id = public_brand.id AND relation.link_type = 'made_by'
       JOIN public_entities public_pen
         ON public_pen.id = relation.source_id AND public_pen.type = 'pen'
       WHERE public_brand.id = ?`,
      [seed.brandId],
    );
    const modelBrands = await scalarNumber(
      fixture.client,
      `SELECT count(DISTINCT public_brand.id) AS value
       FROM public_entities public_pen
       JOIN entity_links relation
         ON relation.source_id = public_pen.id AND relation.link_type = 'made_by'
       JOIN public_entities public_brand
         ON public_brand.id = relation.target_id AND public_brand.type = 'brand'
       WHERE public_pen.id = ?`,
      [seed.modelId],
    );
    assert.equal(brandModels, 15);
    assert.equal(modelBrands, 1);

    const story = await fixture.client.execute({
      sql: `SELECT body_md FROM stories
            WHERE entity_id = ? AND story_type = 'model_story' AND status = 'published'`,
      args: [seed.modelId],
    });
    const body = String(story.rows[0]?.body_md ?? "");
    for (const sentinel of seed.topicSentinels)
      assert.ok(body.includes(sentinel));
  });
});

describe("fixture safety", () => {
  it("rejects every hostile environment before creating a temp root", async () => {
    const protectedCatalog = path.join(ROOT, "data", "fpkg.db");
    const hostile: Array<[string, NodeJS.ProcessEnv, RegExp]> = [
      [
        "missing flag",
        { ...SAFE_ENV, RENDERER_FIXTURE: "" },
        /RENDERER_FIXTURE=1/,
      ],
      [
        "remote URL",
        { ...SAFE_ENV, TURSO_DATABASE_URL: "libsql://remote.invalid" },
        /remote database/,
      ],
      [
        "remote token",
        { ...SAFE_ENV, TURSO_AUTH_TOKEN: "secret" },
        /remote database/,
      ],
      [
        "external E2E",
        { ...SAFE_ENV, E2E_BASE_URL: "https://renderer.invalid" },
        /external E2E_BASE_URL/,
      ],
      [
        "protected catalog",
        { ...SAFE_ENV, FPKG_DATABASE_URL: `file:${protectedCatalog}` },
        /protected/,
      ],
      [
        "protected alias",
        {
          ...SAFE_ENV,
          FPKG_DATABASE_URL: `file:${path.join(ROOT, "data", "..", "data", "fpkg.db")}`,
        },
        /protected/,
      ],
    ];

    for (const [label, env, expected] of hostile) {
      const beforeRoots = tempRoots();
      await assert.rejects(createRendererFixture(env), expected, label);
      assert.deepEqual(
        tempRoots(),
        beforeRoots,
        `${label} created a fixture root`,
      );
    }
  });

  it("accepts loopback intent and removes only its owned root", async () => {
    assert.doesNotThrow(() =>
      assertRendererFixtureEnvironment({
        ...SAFE_ENV,
        E2E_BASE_URL: "http://127.0.0.1:3107",
      }),
    );
    const sibling = fs.mkdtempSync(path.join(os.tmpdir(), "renderer-sibling-"));
    const disposable = await createRendererFixture(SAFE_ENV);
    const ownedRoot = disposable.tempRoot;
    await cleanupRendererFixture(disposable);
    assert.equal(fs.existsSync(ownedRoot), false);
    assert.equal(fs.existsSync(sibling), true);
    fs.rmSync(sibling, { recursive: true, force: true });
  });
});

describe("page loader", () => {
  it("uses current public_entities authorization and bound type/slug inputs", async () => {
    const { getPublishedEntityPage } = await import(
      "../../src/lib/entity-page"
    );

    assert.equal(await getPublishedEntityPage("pen", seed.nonPublicSlug), null);
    assert.equal(
      await getPublishedEntityPage("pen", `${seed.modelSlug}' OR 1=1 --`),
      null,
    );
    assert.equal(
      await getPublishedEntityPage(
        "brand' OR 1=1 --" as "brand",
        seed.brandSlug,
      ),
      null,
    );
  });

  it("returns all fifteen brand models and one canonical model brand", async () => {
    const { getPublishedEntityPage } = await import(
      "../../src/lib/entity-page"
    );
    const brand = await getPublishedEntityPage("brand", seed.brandSlug);
    const model = await getPublishedEntityPage("pen", seed.modelSlug);

    assert.ok(brand && brand.type === "brand");
    assert.ok(model && model.type === "pen");
    assert.equal(brand.models.length, 15);
    assert.deepEqual(
      brand.models.map((item) => item.slug),
      [...seed.modelSlugs].sort(),
    );
    assert.equal(model.canonicalBrand.slug, seed.brandSlug);
  });

  it("fails closed for missing or duplicate expected stories and invalid summaries", async () => {
    const { getPublishedEntityPage, PublishedPageInvariantError } =
      await import("../../src/lib/entity-page");
    await withPermissivePublicRoot(async () => {
      await assert.rejects(
        getPublishedEntityPage("brand", seed.missingStorySlug),
        (error) =>
          error instanceof PublishedPageInvariantError &&
          /story/i.test(error.message),
      );
      await assert.rejects(
        getPublishedEntityPage("brand", seed.duplicateStorySlug),
        (error) =>
          error instanceof PublishedPageInvariantError &&
          /story/i.test(error.message),
      );
      await assert.rejects(
        getPublishedEntityPage("brand", seed.shortSummarySlug),
        (error) =>
          error instanceof PublishedPageInvariantError &&
          /summary/i.test(error.message),
      );
    });
  });

  it("rejects zero or multiple public model-brand candidates", async () => {
    const { getPublishedEntityPage, PublishedPageInvariantError } =
      await import("../../src/lib/entity-page");
    await withPermissivePublicRoot(async () => {
      await assert.rejects(
        getPublishedEntityPage("pen", seed.noBrandSlug),
        (error) =>
          error instanceof PublishedPageInvariantError &&
          /brand/i.test(error.message),
      );
      await assert.rejects(
        getPublishedEntityPage("pen", seed.duplicateBrandSlug),
        (error) =>
          error instanceof PublishedPageInvariantError &&
          /brand/i.test(error.message),
      );
    });
  });
});

describe("qualified content", () => {
  it("returns the complete story, qualified modules, exact media, and zero values", async () => {
    const { getPublishedEntityPage } = await import(
      "../../src/lib/entity-page"
    );
    const model = await getPublishedEntityPage("pen", seed.modelSlug);
    assert.ok(model && model.type === "pen");

    for (const sentinel of seed.topicSentinels) {
      assert.ok(model.story.bodyMd.includes(sentinel), sentinel);
    }
    assert.equal(model.sources.length, 2);
    assert.ok(
      model.specs.some(
        (spec) => spec.key === "weight" && String(spec.value) === "0",
      ),
    );
    assert.equal(model.variants.length, 1);
    assert.match(model.primaryMedia.imageUrl, /^\/renderer\//);
    assert.equal(model.primaryMedia.license, "CC0");
    assert.match(model.primaryMedia.attribution, /Renderer fixture/);
  });

  it("never returns legacy, deprecated, unqualified, gallery, or weak-media sentinels", async () => {
    const { getPublishedEntityPage } = await import(
      "../../src/lib/entity-page"
    );
    const brand = await getPublishedEntityPage("brand", seed.brandSlug);
    const model = await getPublishedEntityPage("pen", seed.modelSlug);
    assert.ok(brand && model);

    const payload = JSON.stringify({ brand, model });
    for (const sentinel of seed.forbiddenSentinels) {
      assert.equal(payload.includes(sentinel), false, sentinel);
    }
  });

  it("keeps two qualified sourced timeline nodes in stable order", async () => {
    const { getPublishedEntityPage } = await import(
      "../../src/lib/entity-page"
    );
    const brand = await getPublishedEntityPage("brand", seed.brandSlug);
    assert.ok(brand && brand.type === "brand");
    assert.equal(brand.timeline.length, 2);
    assert.deepEqual(
      brand.timeline.map((event) => event.startDate),
      ["2010-01-01", "2020-01-01"],
    );
    assert.ok(
      brand.timeline.every((event) => event.source.url.startsWith("https://")),
    );
  });
});
