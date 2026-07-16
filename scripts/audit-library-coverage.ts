import path from "node:path";
import type { InventoryAuditRow } from "../src/lib/audit/readiness-audit";
import { runReadinessAuditOnOwnedCopy } from "./audit-readiness-v2";

const TYPE_LABELS: Record<string, string> = {
  brand: "brands",
  pen: "models",
};

function option(name: string): string | undefined {
  const exactIndex = process.argv.indexOf(name);
  if (exactIndex >= 0) return process.argv[exactIndex + 1];
  return process.argv.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
}

function parseLimit(): number {
  const value = option("--limit") ?? "12";
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

function pct(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function reviewsComplete(row: InventoryAuditRow): boolean {
  return [
    row.fact_review,
    row.language_review,
    row.media_review,
    row.publication_review,
  ].every((state) => state === "approved_current");
}

function coverageScore(row: InventoryAuditRow): number {
  const checks = [
    row.published_story_count > 0,
    row.qualified_core_claim_count > 0,
    row.qualified_source_item_count > 0,
    row.qualified_primary_media_count > 0,
    reviewsComplete(row),
  ];
  if (row.entity_type === "pen") {
    checks.push(
      row.required_spec_field_count > 0 && row.missing_spec_field_count === 0,
    );
  }
  return Math.round(
    (checks.filter(Boolean).length / Math.max(checks.length, 1)) * 100,
  );
}

function coverageRow(row: InventoryAuditRow) {
  const score = coverageScore(row);
  const qualifiesAsReady = row.content_ready && row.is_public;
  return {
    id: row.entity_id,
    type: row.entity_type,
    slug: row.slug,
    name: row.name,
    story_count: row.published_story_count,
    claim_count: row.qualified_core_claim_count,
    reference_count: row.qualified_source_item_count,
    media_count: row.qualified_primary_media_count,
    model_spec_count:
      row.required_spec_field_count > 0 && row.missing_spec_field_count === 0
        ? 1
        : 0,
    current_review_count: [
      row.fact_review,
      row.language_review,
      row.media_review,
      row.publication_review,
    ].filter((state) => state === "approved_current").length,
    blocker_count: row.blocker_count,
    blocker_codes: row.blocker_codes,
    is_public: row.is_public,
    coverage_score: score,
    coverage_status: qualifiesAsReady
      ? ("ready" as const)
      : score >= 45
        ? ("starter" as const)
        : ("gap" as const),
    missing_items: qualifiesAsReady
      ? []
      : row.blocker_codes.length > 0
        ? row.blocker_codes
        : [`publication_status:${row.publication_status}`],
  };
}

type CoverageRow = ReturnType<typeof coverageRow>;

function summarize(type: "brand" | "pen", rows: readonly CoverageRow[]) {
  const typed = rows.filter((row) => row.type === type);
  const count = (predicate: (row: CoverageRow) => boolean) =>
    typed.filter(predicate).length;
  return {
    type,
    total: typed.length,
    ready: count((row) => row.coverage_status === "ready"),
    starter: count((row) => row.coverage_status === "starter"),
    gap: count((row) => row.coverage_status === "gap"),
    average_score:
      typed.length === 0
        ? 0
        : Math.round(
            typed.reduce((sum, row) => sum + row.coverage_score, 0) /
              typed.length,
          ),
    with_stories: count((row) => row.story_count > 0),
    with_claims: count((row) => row.claim_count > 0),
    with_references: count((row) => row.reference_count > 0),
    with_media: count((row) => row.media_count > 0),
    with_model_specs: count((row) => row.model_spec_count > 0),
    with_current_reviews: count((row) => row.current_review_count === 4),
  };
}

async function main(): Promise<void> {
  const limit = parseLimit();
  const jsonOutput = process.argv.includes("--json");
  const result = await runReadinessAuditOnOwnedCopy(explicitDatabasePath(), {
    signalProbeReport: option("--signal-probe-report"),
  });
  const rows = result.rows.map(coverageRow);
  const byPriority = (left: CoverageRow, right: CoverageRow) =>
    left.coverage_score - right.coverage_score ||
    right.blocker_count - left.blocker_count ||
    left.name.localeCompare(right.name);
  const report = {
    summaries: [summarize("brand", rows), summarize("pen", rows)],
    priorityBrands: rows
      .filter((row) => row.type === "brand")
      .sort(byPriority),
    priorityPens: rows.filter((row) => row.type === "pen").sort(byPriority),
    summary: result.summary,
    provenance: result.provenance,
    rows: result.rows,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(report));
  } else {
    console.log("Library coverage summary:");
    for (const summary of report.summaries) {
      console.log(
        `  ${TYPE_LABELS[summary.type] ?? summary.type}: ${summary.average_score}/100 diagnostic average, ${summary.ready} ready, ${summary.gap} gap, total ${summary.total}`,
      );
      console.log(
        `    stories ${summary.with_stories}/${summary.total} (${pct(summary.with_stories, summary.total)}), core claims ${summary.with_claims}/${summary.total} (${pct(summary.with_claims, summary.total)}), qualified sources ${summary.with_references}/${summary.total} (${pct(summary.with_references, summary.total)})`,
      );
      console.log(
        `    reusable primary media ${summary.with_media}/${summary.total} (${pct(summary.with_media, summary.total)}), current reviews ${summary.with_current_reviews}/${summary.total} (${pct(summary.with_current_reviews, summary.total)})`,
      );
    }
    console.log("\nPriority brand gaps:");
    for (const entity of report.priorityBrands.slice(0, limit)) {
      console.log(
        `  - ${entity.name} (${entity.slug}) score ${entity.coverage_score}: blockers ${entity.missing_items.join(", ") || "none"}`,
      );
    }
    console.log("\nPriority model gaps:");
    for (const entity of report.priorityPens.slice(0, limit)) {
      console.log(
        `  - ${entity.name} (${entity.slug}) score ${entity.coverage_score}: blockers ${entity.missing_items.join(", ") || "none"}`,
      );
    }
  }
  process.exitCode = rows.every((row) => row.coverage_status === "ready")
    ? 0
    : 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
