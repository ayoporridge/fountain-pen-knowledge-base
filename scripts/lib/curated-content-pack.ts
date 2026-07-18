import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type SourceTier =
  | "primary"
  | "contemporary_archive"
  | "professional_secondary"
  | "retailer"
  | "community"
  | "search";

export type SourceType =
  | "official"
  | "wikimedia"
  | "book"
  | "patent"
  | "blog"
  | "forum"
  | "reddit"
  | "retailer"
  | "user_submission";

export interface CuratedSource {
  key: string;
  registryKey: string;
  registryName: string;
  sourceType: SourceType;
  tier: SourceTier;
  independenceGroup: string;
  title: string;
  url: string;
  homepageUrl: string;
  itemType?: string;
  author?: string | null;
  publishedAt?: string | null;
  retrievedAt: string;
  summary: string;
  allowedUse: "store_full" | "store_excerpt" | "summary_only" | "metadata_only" | "link_only";
  license?: string | null;
  archiveUrl?: string | null;
  archiveLocator?: string | null;
}

export interface CuratedScope {
  key: string;
  scopeKey: string;
  variantKey?: string | null;
  market?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  productionState?: "current" | "historical" | "prototype" | "unknown" | null;
  nibScope?: string | null;
  materialScope?: string | null;
  editionScope?: string | null;
}

export interface CuratedClaimEvidence {
  key: string;
  sourceKey: string;
  locator: string;
  scopeKey: string;
  note?: string;
}

export interface CuratedClaim {
  key: string;
  predicate: string;
  objectText: string;
  factClass: "core" | "editorial";
  confidence: number;
  sourceKey: string;
  locator: string;
  evidence: CuratedClaimEvidence[];
}

export type SpecFieldKey =
  | "brand_entity_id"
  | "series_name"
  | "release_year"
  | "origin_country"
  | "nib"
  | "fill_system"
  | "material"
  | "dimensions"
  | "weight"
  | "price_range"
  | "status";

export interface CuratedSpecEvidence {
  key: string;
  fieldKey: SpecFieldKey;
  sourceKey: string;
  scopeKey: string;
  locator: string;
  qualifies?: boolean;
  note?: string;
}

export interface CuratedVariant {
  key: string;
  name: string;
  releaseYear?: string | null;
  notes: string;
  sourceKey: string;
  variantKind?: "variant" | "edition_group" | "color" | "material" | "nib" | "market_sku";
  parentVariantKey?: string | null;
  productCode?: string | null;
  market?: string | null;
}

export interface CuratedMedia {
  key: string;
  title: string;
  sourceKey: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  localPath?: string | null;
  author: string;
  license: string;
  attributionText: string;
  sourceUrl: string;
  usageStatus: "primary" | "gallery";
}

export interface CuratedTimelineEvent {
  key: string;
  title: string;
  eventType:
    | "brand_founded"
    | "model_released"
    | "patent_filed"
    | "acquisition"
    | "discontinued"
    | "revival"
    | "design_milestone"
    | "community_event";
  startDate: string;
  circa: boolean;
  description: string;
  sourceKey: string;
}

export interface CuratedConflict {
  key: string;
  fieldKey: string;
  scopeKey: string;
  conflictKind: "field" | "identity" | "made_by";
  status: "resolved" | "dismissed";
  resolutionNote: string;
  members: Array<{ citationKey: string; assertedValue: string }>;
}

export interface CuratedEntityPack {
  key: string;
  entityId: string;
  expectedType: "brand" | "pen";
  expectedSlug: string;
  canonicalName: string;
  markdownFile: string;
  storyTitle: string;
  primarySourceKey: string;
  depthTier: "A" | "B" | "C";
  aliases: Array<{
    alias: string;
    language: string;
    kind?: "alias" | "regional_name" | "former_name" | "licensed_name" | "producer_name";
    sourceKey: string;
    market?: string | null;
  }>;
  sources: CuratedSource[];
  scopes: CuratedScope[];
  claims: CuratedClaim[];
  variants?: CuratedVariant[];
  spec?: {
    brandEntityId: string;
    values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
    evidence: CuratedSpecEvidence[];
  };
  media: CuratedMedia[];
  timeline?: CuratedTimelineEvent[];
  conflicts?: CuratedConflict[];
}

export interface LoadedCuratedEntityPack extends CuratedEntityPack {
  summary: string;
  bodyMd: string;
  markdownSpecs: Record<string, unknown> | null;
  digest: string;
  sourceMarker: string;
}

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

function section(markdown: string, heading: string): string {
  const startPattern = new RegExp(`^## ${heading}\\s*$`, "m");
  const match = startPattern.exec(markdown);
  if (!match) throw new Error(`Missing ## ${heading} section.`);
  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/^## /m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim();
}

function bodySection(markdown: string): string {
  const heading = "## body_md";
  const start = markdown.indexOf(heading);
  if (start === -1) throw new Error("Missing ## body_md section.");
  const bodyStart = start + heading.length;
  const rest = markdown.slice(bodyStart);
  const sourcesHeading = rest.search(/^## 来源\s*$/m);
  return (sourcesHeading === -1 ? rest : rest.slice(0, sourcesHeading)).trim();
}

export function loadCuratedEntityPack(
  workspaceRoot: string,
  pack: CuratedEntityPack,
): LoadedCuratedEntityPack {
  const markdownPath = path.resolve(workspaceRoot, pack.markdownFile);
  if (!markdownPath.startsWith(`${path.resolve(workspaceRoot)}${path.sep}`)) {
    throw new Error(`Content pack path escapes workspace: ${pack.markdownFile}`);
  }
  const markdown = fs.readFileSync(markdownPath, "utf8").replace(/\r\n?/g, "\n");
  const summary = section(markdown, "summary");
  const bodyMd = bodySection(markdown);
  let markdownSpecs: Record<string, unknown> | null = null;
  const specsMatch = markdown.match(/^## model_specs\s*\n+```json\s*\n([\s\S]*?)\n```/m);
  if (specsMatch?.[1]) {
    markdownSpecs = JSON.parse(specsMatch[1]) as Record<string, unknown>;
  }
  if (!summary || !bodyMd) {
    throw new Error(`Empty reviewed copy in ${pack.markdownFile}.`);
  }
  const digest = createHash("sha256")
    .update(stableJson({ ...pack, summary, bodyMd, markdownSpecs }))
    .digest("hex");
  return {
    ...pack,
    summary,
    bodyMd,
    markdownSpecs,
    digest,
    sourceMarker: `curated-content:${pack.key}:${digest}`,
  };
}

export function packId(pack: CuratedEntityPack, surface: string, key: string): string {
  const digest = createHash("sha256")
    .update(`${pack.key}\0${surface}\0${key}`)
    .digest("hex")
    .slice(0, 24);
  return `curated-${surface}-${digest}`;
}

export function curatedId(surface: string, key: string): string {
  const digest = createHash("sha256")
    .update(`${surface}\0${key}`)
    .digest("hex")
    .slice(0, 24);
  return `curated-${surface}-${digest}`;
}
