import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import type { Client } from "@libsql/client";
import {
  cleanupTaxonomyFixture,
  createTaxonomyFixture,
  type TaxonomyFixture,
} from "../../scripts/lib/taxonomy-fixture";
import {
  applyTaxonomyPlan,
  resolveTaxonomyPlan,
} from "../../src/lib/taxonomy/apply-taxonomy";
import {
  loadTaxonomyPlan,
  type AtomicIdentityAction,
  type TaxonomyDecision,
  type TaxonomyPlan,
} from "../../src/lib/taxonomy/identity-plan";

const MANIFEST_PATH = path.join(
  process.cwd(),
  "data",
  "taxonomy",
  "v1.2-phase21.json",
);
const IDS = {
  pilotBrand: "pilotbrand01",
  majohnBrand: "majohnbrand1",
  asvineBrand: "asvinebrand1",
  wrongBrand: "wrongbrand01",
  wingSungBrand: "wingsungbr01",
  junLaiBrand: "junlaibrand1",
  pilotMr: "pilotmr00001",
  elabo: "elabopen0001",
  majohnA1: "majohna10001",
  moonmanA1: "moonmana10001",
  asvineP36: "asvinep36001",
  skb: "skbpen000001",
} as const;

const SOURCE_URLS = {
  rename: "https://example.test/pilot-mr",
  alias: "https://example.test/elabo-falcon",
  merge: "https://example.test/majohn-a1",
  reassign: "https://example.test/asvine-p36",
  retire: "https://example.test/skb-gate",
} as const;

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function matrixChecksum(matrix: unknown): string {
  return `sha256:${createHash("sha256").update(stableJson(matrix)).digest("hex")}`;
}

function atomic(
  kind: AtomicIdentityAction["kind"],
  sourceId: string | null,
  targetId: string | null,
  targetSlug: string | null,
): AtomicIdentityAction {
  return { kind, sourceId, targetId, targetType: "pen", targetSlug };
}

function replaceDecision(
  plan: TaxonomyPlan,
  index: number,
  replacement: Partial<TaxonomyDecision> &
    Pick<
      TaxonomyDecision,
      | "sourceRowKey"
      | "title"
      | "region"
      | "primaryAction"
      | "executionState"
      | "canonical"
      | "atomicActions"
    >,
): void {
  plan.matrix[index] = {
    ...plan.matrix[index],
    blocker: null,
    variantDisposition: "none",
    evidenceRefs: [],
    ...replacement,
  };
}

function syntheticResolvedPlan(): TaxonomyPlan {
  const plan = structuredClone(loadTaxonomyPlan());
  replaceDecision(plan, 0, {
    sourceRowKey: "测试::Pilot MR rename",
    title: "Pilot MR rename",
    region: "测试",
    primaryAction: "rename",
    executionState: "apply",
    canonical: {
      entityId: IDS.pilotMr,
      type: "pen",
      slug: "pilot-mr-metropolitan-cocoon",
      name: "百乐 Pilot MR／Metropolitan（日本名 Cocoon）",
      makerId: IDS.pilotBrand,
    },
    evidenceRefs: [SOURCE_URLS.rename],
    atomicActions: [
      atomic(
        "split_retain_as",
        IDS.pilotMr,
        IDS.pilotMr,
        "百乐-pilot-贵妃-cocoon",
      ),
    ],
  });
  replaceDecision(plan, 1, {
    sourceRowKey: "测试::Falcon",
    title: "Falcon",
    region: "海外",
    primaryAction: "alias",
    executionState: "apply",
    canonical: {
      entityId: IDS.elabo,
      type: "pen",
      slug: "pilot-elabo",
      name: "百乐 Pilot Elabo",
      makerId: IDS.pilotBrand,
    },
    variantDisposition: "alias_only",
    evidenceRefs: [SOURCE_URLS.alias],
    atomicActions: [
      atomic("split_retain_as", IDS.elabo, IDS.elabo, "pilot-elabo"),
    ],
  });
  replaceDecision(plan, 2, {
    sourceRowKey: "测试::Moonman A1 merge",
    title: "Moonman A1 merge",
    region: "历史品牌",
    primaryAction: "merge",
    executionState: "apply",
    canonical: {
      entityId: IDS.majohnA1,
      type: "pen",
      slug: "majohn-a1",
      name: "末匠 Majohn A1 按动钢笔",
      makerId: IDS.majohnBrand,
    },
    evidenceRefs: [SOURCE_URLS.merge],
    atomicActions: [
      atomic("retire_mixed", IDS.moonmanA1, null, "moonman-a1"),
      atomic(
        "split_retain_as",
        IDS.majohnA1,
        IDS.majohnA1,
        "majohn-a1",
      ),
    ],
  });
  replaceDecision(plan, 3, {
    sourceRowKey: "测试::Asvine P36 rename",
    title: "Asvine P36 rename",
    region: "中国大陆",
    primaryAction: "rename",
    executionState: "apply",
    canonical: {
      entityId: IDS.asvineP36,
      type: "pen",
      slug: "asvine-p36",
      name: "Asvine P36",
      makerId: IDS.asvineBrand,
    },
    evidenceRefs: [SOURCE_URLS.reassign],
    atomicActions: [
      atomic(
        "split_retain_as",
        IDS.asvineP36,
        IDS.asvineP36,
        "意斯华-p36",
      ),
    ],
  });
  replaceDecision(plan, 4, {
    sourceRowKey: "测试::SKB identity gate retire",
    title: "SKB identity gate retire",
    region: "台湾",
    primaryAction: "retire",
    executionState: "apply",
    canonical: {
      entityId: IDS.skb,
      type: "pen",
      slug: "skb-rs-301n",
      name: "SKB RS-301N（身份待核）",
      makerId: IDS.wingSungBrand,
    },
    evidenceRefs: [SOURCE_URLS.retire],
    atomicActions: [
      atomic("retire_generic", IDS.skb, null, "skb-rs-301n"),
    ],
  });

  const extraBrands = [
    IDS.pilotBrand,
    IDS.majohnBrand,
    IDS.asvineBrand,
    IDS.wrongBrand,
    IDS.wingSungBrand,
    IDS.junLaiBrand,
  ];
  const extraPens = [
    IDS.pilotMr,
    IDS.elabo,
    IDS.majohnA1,
    IDS.moonmanA1,
    IDS.asvineP36,
    IDS.skb,
  ];
  plan.stableSets.before.brandIds.push(...extraBrands);
  plan.stableSets.before.penIds.push(...extraPens);
  plan.stableSets.before.pageIds.push(...extraBrands, ...extraPens);
  plan.stableSets.after.brandIds.push(...extraBrands);
  plan.stableSets.after.penIds.push(
    IDS.pilotMr,
    IDS.elabo,
    IDS.majohnA1,
    IDS.asvineP36,
  );
  plan.stableSets.after.pageIds.push(
    ...extraBrands,
    IDS.pilotMr,
    IDS.elabo,
    IDS.majohnA1,
    IDS.asvineP36,
  );
  plan.matrixChecksum = matrixChecksum(plan.matrix);
  return plan;
}

async function insert(
  db: Client,
  sql: string,
  args: Array<string | number | null> = [],
): Promise<void> {
  await db.execute({ sql, args });
}

async function seedCanonicalFixture(fixture: TaxonomyFixture): Promise<void> {
  const db = fixture.client;
  const brands = [
    [IDS.pilotBrand, "pilot", "Pilot"],
    [IDS.majohnBrand, "majohn", "末匠 Majohn"],
    [IDS.asvineBrand, "asvine", "Asvine"],
    [IDS.wrongBrand, "wrong-brand", "错误品牌"],
    [IDS.wingSungBrand, "wing-sung", "永生 Wing Sung"],
    [IDS.junLaiBrand, "junlai", "君来 JunLai"],
  ] as const;
  const pens = [
    [IDS.pilotMr, "百乐-pilot-贵妃-cocoon", "百乐 Pilot 贵妃 Cocoon", IDS.pilotBrand],
    [IDS.elabo, "pilot-elabo", "百乐 Pilot Elabo", IDS.pilotBrand],
    [IDS.majohnA1, "majohn-a1", "末匠 Majohn A1", IDS.majohnBrand],
    [IDS.moonmanA1, "moonman-a1", "Moonman A1", IDS.majohnBrand],
    [IDS.asvineP36, "意斯华-p36", "意斯华 P36", IDS.wrongBrand],
    [IDS.skb, "skb-rs-301n", "SKB RS-301N", IDS.wingSungBrand],
  ] as const;

  for (const [id, slug, name] of brands) {
    await insert(db, "INSERT INTO entities (id, type, slug, name) VALUES (?, 'brand', ?, ?)", [id, slug, name]);
  }
  for (const [id, slug, name, makerId] of pens) {
    await insert(db, "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", [id, slug, name]);
    await insert(db, "INSERT INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, 'made_by')", [`link-${id}`, id, makerId]);
  }
  await db.execute(
    "UPDATE entity_publications SET status = 'in_review', blockers_json = '[]' WHERE entity_id LIKE '%brand%' OR entity_id IN (?, ?, ?, ?, ?, ?)",
    [IDS.pilotMr, IDS.elabo, IDS.majohnA1, IDS.moonmanA1, IDS.asvineP36, IDS.skb],
  );

  await insert(db, `INSERT INTO source_registry
    (id, name, source_type, allowed_use, reliability)
    VALUES ('taxsource001', 'Taxonomy fixture sources', 'official', 'metadata_only', 'high_for_basic_facts')`);
  for (const [index, url] of Object.values(SOURCE_URLS).entries()) {
    await insert(db, `INSERT INTO source_items
      (id, source_id, title, url, allowed_use, review_status, source_tier,
       independence_group, retrieved_at)
      VALUES (?, 'taxsource001', ?, ?, 'metadata_only', 'approved', 'primary', ?, '2026-07-18')`, [
      `sourceitem0${index + 1}`,
      `Taxonomy source ${index + 1}`,
      url,
      `taxonomy-source-${index + 1}`,
    ]);
  }

  await insert(db, "INSERT INTO tags (id, name, slug, dimension, level) VALUES ('taxtag000001', 'Taxonomy sentinel', 'taxonomy-sentinel', 'usage', 'atom')");
  await insert(db, "INSERT INTO entity_tags (id, entity_id, tag_id) VALUES ('donortag0001', ?, 'taxtag000001')", [IDS.moonmanA1]);
  await insert(db, "INSERT INTO entity_attributes (id, entity_id, key, value) VALUES ('donorattr001', ?, 'taxonomy_sentinel', 'compatible')", [IDS.moonmanA1]);
  await insert(db, `INSERT INTO entity_references
    (id, entity_id, source_item_id, relation_type, note, review_status)
    VALUES ('donorref0001', ?, 'sourceitem03', 'official', 'A1 identity', 'approved')`, [IDS.moonmanA1]);
  await insert(db, `INSERT INTO external_ids
    (id, entity_id, provider, external_id, url)
    VALUES ('donorext0001', ?, 'fixture', 'moonman-a1', 'https://example.test/id/moonman-a1')`, [IDS.moonmanA1]);
  await insert(db, `INSERT INTO entity_aliases
    (id, entity_id, alias, language, source_id, alias_kind, source_item_id, review_status)
    VALUES ('donoralias01', ?, 'Moonman A1', 'en', 'taxsource001', 'former_name', 'sourceitem03', 'approved')`, [IDS.moonmanA1]);
  await insert(db, `INSERT INTO entity_content_reviews
    (id, entity_id, review_kind, content_hash, status, reviewer, reviewed_at)
    VALUES ('donorreview1', ?, 'fact', ?, 'approved', 'fixture-reviewer', '2026-07-18')`, [
    IDS.moonmanA1,
    `sha256:v3:${"a".repeat(64)}`,
  ]);
}

async function withCanonicalFixture(
  run: (fixture: TaxonomyFixture) => Promise<void>,
): Promise<void> {
  const fixture = await createTaxonomyFixture({
    NODE_ENV: "test",
    TAXONOMY_FIXTURE: "1",
  });
  try {
    await seedCanonicalFixture(fixture);
    await run(fixture);
  } finally {
    await cleanupTaxonomyFixture(fixture);
  }
}

async function scalar(db: Client, sql: string, args: string[] = []): Promise<string> {
  const result = await db.execute({ sql, args });
  assert.equal(result.rows.length, 1);
  return String(Object.values(result.rows[0] ?? {})[0]);
}

test("rename alias merge retire and identity gate are lifecycle-safe", async () => {
  await withCanonicalFixture(async ({ client }) => {
    const resolved = await resolveTaxonomyPlan(client, syntheticResolvedPlan());
    assert.equal(resolved.scope, "non_split");
    assert.equal(resolved.sourceRowCount, 101);
    assert.equal(resolved.delegated.length, 8);
    assert.equal(resolved.actions.length, 5);
    assert.deepEqual(resolved.blockers, []);

    const result = await applyTaxonomyPlan(client, resolved);
    assert.equal(result.applied, true);
    assert.deepEqual(result.actionCounts, {
      alias: 1,
      merge: 1,
      rename: 2,
      retire: 1,
    });

    assert.equal(
      await scalar(client, "SELECT slug FROM entities WHERE id = ?", [IDS.pilotMr]),
      "pilot-mr-metropolitan-cocoon",
    );
    assert.equal(
      await scalar(client, "SELECT COUNT(*) FROM entity_aliases WHERE entity_id = ? AND alias = 'Falcon' AND market = '海外' AND review_status = 'approved'", [IDS.elabo]),
      "1",
    );
    assert.equal(
      await scalar(client, "SELECT COUNT(*) FROM entity_aliases WHERE entity_id = ? AND alias LIKE '%贵妃%'", [IDS.pilotMr]),
      "0",
    );
    assert.equal(
      await scalar(client, "SELECT status FROM entity_publications WHERE entity_id = ?", [IDS.moonmanA1]),
      "retired",
    );
    assert.equal(
      await scalar(client, "SELECT COUNT(*) FROM entities WHERE id = ?", [IDS.moonmanA1]),
      "1",
    );
    for (const table of ["entity_attributes", "entity_tags", "entity_references", "external_ids"] as const) {
      assert.equal(
        await scalar(client, `SELECT COUNT(*) FROM ${table} WHERE entity_id = ?`, [IDS.majohnA1]),
        "1",
      );
      assert.equal(
        await scalar(client, `SELECT COUNT(*) FROM ${table} WHERE entity_id = ?`, [IDS.moonmanA1]),
        "1",
      );
    }
    assert.equal(
      await scalar(client, "SELECT COUNT(*) FROM entity_content_reviews WHERE entity_id = ?", [IDS.majohnA1]),
      "0",
    );
    assert.equal(
      await scalar(client, "SELECT entity_id FROM entity_content_reviews WHERE id = 'donorreview1'"),
      IDS.moonmanA1,
    );
    assert.equal(
      await scalar(client, "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", [IDS.asvineP36]),
      IDS.asvineBrand,
    );
    assert.equal(
      await scalar(client, "SELECT COUNT(*) FROM entities WHERE id IN (?, ?) AND type = 'brand'", [IDS.wingSungBrand, IDS.junLaiBrand]),
      "2",
    );
    assert.equal(
      await scalar(client, "SELECT COUNT(*) FROM public_entities WHERE id IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", Object.values(IDS)),
      "0",
    );
    assert.equal(
      await scalar(client, "SELECT redirect_kind FROM entity_redirects WHERE source_path = '/pen/skb-rs-301n'"),
      "hard_404",
    );
  });
});

test("locked split identity action is delegated with zero writes", async () => {
  await withCanonicalFixture(async ({ client }) => {
    const plan = syntheticResolvedPlan();
    const decision = plan.matrix.find((row) => row.sourceRowKey === "测试::Falcon");
    assert.ok(decision);
    decision.atomicActions = [
      atomic("split_retain_as", "dTCUDu03vrI6", "dTCUDu03vrI6", "opus-88-demo-kolora"),
    ];
    decision.canonical = {
      entityId: "dTCUDu03vrI6",
      type: "pen",
      slug: "opus-88-demo-kolora",
      name: "forbidden lock donor",
      makerId: "I6tjleAZx9RU",
    };
    plan.matrixChecksum = matrixChecksum(plan.matrix);

    const before = await scalar(client, "SELECT COUNT(*) FROM taxonomy_batches");
    const resolved = await resolveTaxonomyPlan(client, plan);
    assert.match(resolved.blockers.map((item) => item.code).join(","), /locked_split_delegated/);
    await assert.rejects(() => applyTaxonomyPlan(client, resolved), /blocker/i);
    assert.equal(await scalar(client, "SELECT COUNT(*) FROM taxonomy_batches"), before);
  });
});

test("transaction rollback leaves no batch marker or partial rename", async () => {
  await withCanonicalFixture(async ({ client }) => {
    const resolved = await resolveTaxonomyPlan(client, syntheticResolvedPlan());
    assert.deepEqual(resolved.blockers, []);
    await client.execute(`CREATE TRIGGER taxonomy_fixture_injected_failure
      BEFORE INSERT ON taxonomy_actions
      WHEN NEW.source_row_key = '测试::Moonman A1 merge'
      BEGIN
        SELECT RAISE(ABORT, 'taxonomy fixture injected failure');
      END`);

    await assert.rejects(() => applyTaxonomyPlan(client, resolved), /injected failure/i);
    assert.equal(await scalar(client, "SELECT COUNT(*) FROM taxonomy_batches"), "0");
    assert.equal(await scalar(client, "SELECT COUNT(*) FROM taxonomy_actions"), "0");
    assert.equal(
      await scalar(client, "SELECT slug FROM entities WHERE id = ?", [IDS.pilotMr]),
      "百乐-pilot-贵妃-cocoon",
    );
  });
});

