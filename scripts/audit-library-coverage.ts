import { getLibraryCoverageReport } from "../src/lib/library";

const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : 12;
const JSON_OUTPUT = process.argv.includes("--json");

const TYPE_LABELS: Record<string, string> = {
  brand: "brands",
  pen: "models",
};

function pct(value: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

async function main() {
  const report = await getLibraryCoverageReport(
    Number.isFinite(LIMIT) && LIMIT > 0 ? LIMIT : 12,
  );

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("Library coverage summary:");
  for (const summary of report.summaries) {
    console.log(
      `  ${TYPE_LABELS[summary.type] || summary.type}: ${summary.average_score}/100 average, ${summary.ready} ready, ${summary.gap} gap, total ${summary.total}`,
    );
    console.log(
      `    stories ${summary.with_stories}/${summary.total} (${pct(summary.with_stories, summary.total)}), claims ${summary.with_claims}/${summary.total} (${pct(summary.with_claims, summary.total)}), sources ${summary.with_references}/${summary.total} (${pct(summary.with_references, summary.total)})`,
    );
    console.log(
      `    media ${summary.with_media}/${summary.total} (${pct(summary.with_media, summary.total)}), diagrams ${summary.with_diagrams}/${summary.total} (${pct(summary.with_diagrams, summary.total)}), timelines ${summary.with_events}/${summary.total} (${pct(summary.with_events, summary.total)})`,
    );
  }

  console.log("\nPriority brand gaps:");
  for (const entity of report.priorityBrands) {
    console.log(
      `  - ${entity.name} (${entity.slug}) score ${entity.coverage_score}: missing ${entity.missing_items.join(", ") || "none"}`,
    );
  }

  console.log("\nPriority model gaps:");
  for (const entity of report.priorityPens) {
    console.log(
      `  - ${entity.name} (${entity.slug}) score ${entity.coverage_score}: missing ${entity.missing_items.join(", ") || "none"}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
