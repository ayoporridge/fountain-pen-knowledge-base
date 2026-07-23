import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase84PlatinumPilotP0V3Content } from "../../scripts/apply-phase84-platinum-pilot-p0-v3-content";
import { PHASE43_CAPLESS_ID } from "../../scripts/data/phase43-pilot-capless";
import {
  PHASE44_PLAISIR_ID,
  PHASE44_PREFOUNTE_ID,
  PHASE44_PREPPY_ID,
} from "../../scripts/data/phase44-platinum-low-price";
import { PHASE47_PILOT_823_ID } from "../../scripts/data/phase47-pilot-custom-823";
import { PHASE52_PLATINUM_3776_ID } from "../../scripts/data/phase52-lamy-platinum-core";
import { PHASE60_CUSTOM_912_ID } from "../../scripts/data/phase60-pilot-p0";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const TARGETS = [
  [PHASE52_PLATINUM_3776_ID, "platinum", /PNB-15000[\s\S]*Converter-800A/],
  [PHASE44_PREPPY_ID, "platinum", /PSQ-400[\s\S]*PSQC-400/],
  [PHASE44_PREFOUNTE_ID, "platinum", /PPF-800[\s\S]*金属夹/],
  [PHASE44_PLAISIR_ID, "platinum", /PGB-1500[\s\S]*PGB-1000/],
  [PHASE43_CAPLESS_ID, "pilot", /FC-18SR[\s\S]*Vanishing Point/],
  [PHASE47_PILOT_823_ID, "pilot", /FKK-3MRP[\s\S]*真空[\s\S]*墨囊/],
  [PHASE60_CUSTOM_912_ID, "pilot", /FKVH-2MR[\s\S]*十五种尖型/],
] as const;

async function seedExactPrerequisites(client: ReturnType<typeof createClient>) {
  for (const [id, slug, name] of [
    ["e51tJpejEkXY", "platinum", "Platinum"],
    ["Zt-PbXkE7UHM", "pilot", "Pilot"],
  ] as const) {
    await client.execute({
      sql: "INSERT OR IGNORE INTO entities (id, type, slug, name) VALUES (?, 'brand', ?, ?)",
      args: [id, slug, name],
    });
  }
  const slugs: Record<string, string> = {
    [PHASE52_PLATINUM_3776_ID]: "platinum-3776-century",
    [PHASE44_PREPPY_ID]: "platinum-preppy",
    [PHASE44_PREFOUNTE_ID]: "platinum-prefounte",
    [PHASE44_PLAISIR_ID]: "platinum-plaisir",
    [PHASE43_CAPLESS_ID]: "pilot-capless",
    [PHASE47_PILOT_823_ID]: "pilot-custom-823",
    [PHASE60_CUSTOM_912_ID]: "pilot-custom-heritage-912",
  };
  for (const [id, brandSlug] of TARGETS) {
    const brandId = brandSlug === "platinum" ? "e51tJpejEkXY" : "Zt-PbXkE7UHM";
    await client.execute({
      sql: "INSERT OR IGNORE INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)",
      args: [id, slugs[id], id],
    });
    await client.execute({
      sql: "UPDATE entities SET type = 'pen', slug = ?, name = ? WHERE id = ?",
      args: [slugs[id], id, id],
    });
    await client.execute({
      sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
      args: [id],
    });
    await client.execute({
      sql: "INSERT INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', 'phase84 fixture exact prerequisite')",
      args: [`phase84-fixture-${id}`, id, brandId],
    });
  }
}

test("Phase 84 upgrades existing Platinum/Pilot pages without creating duplicate identities", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase84-platinum-pilot-")),
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
    reviewer: "phase84-platinum-pilot-p0-v3",
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
    await seedExactPrerequisites(client);
    const first = await applyPhase84PlatinumPilotP0V3Content(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      Array(7).fill("published"),
    );
    for (const [id, brandSlug, requiredText] of TARGETS) {
      const entity = await client.execute({
        sql: "SELECT slug, summary, body_md FROM entities WHERE id = ?",
        args: [id],
      });
      assert.equal(entity.rows.length, 1);
      assert.ok(String(entity.rows[0]?.summary).length >= 60);
      assert.ok(String(entity.rows[0]?.body_md).length >= 2_000);
      assert.match(String(entity.rows[0]?.body_md), requiredText);
      const makers = await client.execute({
        sql: "SELECT b.slug FROM entity_links l JOIN entities b ON b.id = l.target_id WHERE l.source_id = ? AND l.link_type = 'made_by'",
        args: [id],
      });
      assert.deepEqual(makers.rows, [{ slug: brandSlug }]);
      const media = await client.execute({
        sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.match(
        fs.readFileSync(
          path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
          "utf8",
        ),
        /示意图，非产品照片/,
      );
    }
    const publicationStates = await client.execute({
      sql: "SELECT entity_id, status FROM entity_publications WHERE entity_id IN (?, ?, ?, ?, ?, ?, ?) ORDER BY entity_id",
      args: TARGETS.map(([id]) => id),
    });
    assert.ok(
      publicationStates.rows.every((row) => String(row.status) === "published"),
    );
    const platinumBrand = await client.execute({
      sql: "SELECT source FROM entities WHERE id = ?",
      args: ["e51tJpejEkXY"],
    });
    assert.equal(platinumBrand.rows.length, 1);
    assert.match(
      String(platinumBrand.rows[0]?.source),
      /^curated-content:phase78-platinum-brand-v1:/,
    );
    const duplicateIds = await client.execute({
      sql: "SELECT id, count(*) AS total FROM entities WHERE id IN (?, ?, ?, ?, ?, ?, ?) GROUP BY id",
      args: TARGETS.map(([id]) => id),
    });
    assert.equal(duplicateIds.rows.length, TARGETS.length);
    const replay = await applyPhase84PlatinumPilotP0V3Content(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
