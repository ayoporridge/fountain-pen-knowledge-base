import path from "node:path";
import { normalizeEntityName } from "../src/lib/entity-quality";
import type { InventoryAuditRow } from "../src/lib/audit/readiness-audit";
import { runReadinessAuditOnOwnedCopy } from "./audit-readiness-v2";

type DuplicateGroup = {
  key: string;
  entities: InventoryAuditRow[];
};

type SuspiciousEntity = {
  entity: InventoryAuditRow;
  reasons: string[];
};

function option(name: string): string | undefined {
  const exactIndex = process.argv.indexOf(name);
  if (exactIndex >= 0) return process.argv[exactIndex + 1];
  return process.argv.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
}

function parseLimit(): number {
  const value = option("--limit") ?? "20";
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error("--limit must be a positive decimal integer.");
  }
  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit > 1_000_000) {
    throw new Error("--limit must be a positive decimal integer.");
  }
  return limit;
}

function explicitDatabasePath(): string {
  const value = option("--database-path");
  if (!value) throw new Error("--database-path is required for the contract-v2 audit.");
  if (!path.isAbsolute(value)) throw new Error("--database-path must be absolute.");
  return value;
}

function findDuplicateGroups(rows: readonly InventoryAuditRow[]): DuplicateGroup[] {
  const groups = new Map<string, InventoryAuditRow[]>();
  for (const row of rows) {
    const key = `${row.entity_type}:${normalizeEntityName(row.name)}`;
    if (!key.endsWith(":")) groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.entries()]
    .filter(([, entities]) => entities.length > 1)
    .map(([key, entities]) => ({ key, entities }))
    .sort(
      (left, right) =>
        right.entities.length - left.entities.length ||
        left.key.localeCompare(right.key),
    );
}

async function main(): Promise<void> {
  const limit = parseLimit();
  const jsonOutput = process.argv.includes("--json");
  const result = await runReadinessAuditOnOwnedCopy(explicitDatabasePath(), {
    signalProbeReport: option("--signal-probe-report"),
  });
  const duplicateGroups = findDuplicateGroups(result.rows);
  const suspiciousPenArticles: SuspiciousEntity[] = result.rows
    .filter(
      (row) =>
        row.entity_type === "pen" &&
        row.blocker_codes.some((code) =>
          [
            "missing_published_story",
            "multiple_published_stories",
            "deprecated_story_present",
          ].includes(code),
        ),
    )
    .map((entity) => ({
      entity,
      reasons: entity.blocker_codes.filter((code) => code.includes("story")),
    }));
  const thinEntities: SuspiciousEntity[] = result.rows
    .filter((row) => !row.content_ready || !row.is_public)
    .map((entity) => ({
      entity,
      reasons: entity.content_ready
        ? [`publication_status:${entity.publication_status}`]
        : [...entity.blocker_codes],
    }));
  const relationshipBlockers = result.rows.filter(
    (row) => row.entity_type === "pen" && row.made_by_status !== "exactly_one",
  ).length;
  const report = {
    counts: {
      entities: result.summary.inventory_audited,
      duplicateGroups: duplicateGroups.length,
      suspiciousPenArticles: suspiciousPenArticles.length,
      thinEntities: thinEntities.length,
      brokenLinks: relationshipBlockers,
    },
    summary: result.summary,
    provenance: result.provenance,
    duplicateGroups,
    suspiciousPenArticles,
    thinEntities,
    rows: result.rows,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(report));
  } else {
    console.log("Entity quality audit:");
    console.log(`  entities: ${report.counts.entities}`);
    console.log(`  duplicate name groups: ${report.counts.duplicateGroups}`);
    console.log(`  suspicious pen articles: ${report.counts.suspiciousPenArticles}`);
    console.log(`  thin brand/model entities: ${report.counts.thinEntities}`);
    console.log(`  made_by relationship blockers: ${report.counts.brokenLinks}`);

    console.log("\nSuspicious pen articles:");
    for (const item of suspiciousPenArticles.slice(0, limit)) {
      console.log(
        `  - ${item.entity.name} (${item.entity.slug}) [${item.reasons.join(", ")}]`,
      );
    }
    console.log("\nDuplicate name groups:");
    for (const group of duplicateGroups.slice(0, limit)) {
      console.log(`  - ${group.key}:`);
      for (const entity of group.entities) {
        console.log(`      ${entity.entity_type}/${entity.slug} ${entity.name}`);
      }
    }
    console.log("\nThin brand/model entities:");
    for (const item of thinEntities.slice(0, limit)) {
      console.log(
        `  - ${item.entity.entity_type}/${item.entity.slug} ${item.entity.name} [${item.reasons.join(", ")}]`,
      );
    }
  }
  process.exitCode = thinEntities.length === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
