import { createHash } from "node:crypto";
import type { Client, InArgs, ResultSet, Transaction } from "@libsql/client";
import {
  type PayloadAssignment,
  type PrimaryAction,
  reconcileTaxonomyPlan,
  type TaxonomyDecision,
  type TaxonomyPlan,
} from "./identity-plan";
import {
  type ReferenceAssignmentResolution,
  type ReferenceInventoryItem,
  resolveReferenceAssignments,
} from "./reference-migration";

const SCOPE = "non_split" as const;
const SOURCE_KEY = "taxonomy:v1.2:non_split";
const LOCKED_SPLIT_SOURCE_KEY = "taxonomy:v1.2:locked_split";
const LOCKED_ENTITY_IDS = new Set([
  "gwKClNnwt3V3",
  "dTCUDu03vrI6",
  "s0HAxT1gsHxh",
  "G9ptvLpfyzNQ",
  "4dcEbeUCjxH-",
  "CqFpmT3l4Mtm",
  "0CNmbxM54-GA",
  "ixul2gTcJ06B",
  "UE5otlwKUfp9",
  "5CcEDOz9jiUg",
  "5waoVLPHU2Pt",
]);

const LOCKED_SPLIT_DONORS = [
  {
    id: "gwKClNnwt3V3",
    slug: "威迪文-waterman-查尔斯顿-hemisphere",
    makerId: "zkAu9PePDdqJ",
    retire: false,
  },
  {
    id: "dTCUDu03vrI6",
    slug: "opus-88-demo-kolora",
    makerId: "I6tjleAZx9RU",
    retire: true,
  },
  {
    id: "s0HAxT1gsHxh",
    slug: "leonardo-furore-momento-magico",
    makerId: "g5r4udSOYhI5",
    retire: true,
  },
  {
    id: "G9ptvLpfyzNQ",
    slug: "奥罗拉-aurora",
    makerId: "CJXe8UpnkHLJ",
    retire: true,
  },
] as const;

const LOCKED_SPLIT_OUTPUTS = [
  {
    id: "gwKClNnwt3V3",
    slug: "waterman-hemisphere",
    name: "威迪文 Waterman Hémisphère",
    makerId: "zkAu9PePDdqJ",
    donorId: "gwKClNnwt3V3",
    sourceRowKey: "法国、英国与美国::Waterman Hémisphère",
  },
  {
    id: "4dcEbeUCjxH-",
    slug: "waterman-charleston",
    name: "威迪文 Waterman Charleston",
    makerId: "zkAu9PePDdqJ",
    donorId: "gwKClNnwt3V3",
    sourceRowKey: "法国、英国与美国::Waterman Charleston",
  },
  {
    id: "CqFpmT3l4Mtm",
    slug: "opus-88-demo",
    name: "Opus 88 Demo",
    makerId: "I6tjleAZx9RU",
    donorId: "dTCUDu03vrI6",
    sourceRowKey: "台湾::Opus 88 Demo",
  },
  {
    id: "0CNmbxM54-GA",
    slug: "opus-88-koloro",
    name: "Opus 88 Koloro",
    makerId: "I6tjleAZx9RU",
    donorId: "dTCUDu03vrI6",
    sourceRowKey: "台湾::Opus 88 Koloro",
  },
  {
    id: "ixul2gTcJ06B",
    slug: "leonardo-furore",
    name: "Leonardo Furore",
    makerId: "g5r4udSOYhI5",
    donorId: "s0HAxT1gsHxh",
    sourceRowKey: "意大利::Leonardo Furore",
  },
  {
    id: "UE5otlwKUfp9",
    slug: "leonardo-momento-magico",
    name: "Leonardo Momento Magico",
    makerId: "g5r4udSOYhI5",
    donorId: "s0HAxT1gsHxh",
    sourceRowKey: "意大利::Leonardo Momento Magico",
  },
  {
    id: "5CcEDOz9jiUg",
    slug: "aurora-88",
    name: "奥罗拉 Aurora 88",
    makerId: "CJXe8UpnkHLJ",
    donorId: "G9ptvLpfyzNQ",
    sourceRowKey: "意大利::Aurora 88",
  },
  {
    id: "5waoVLPHU2Pt",
    slug: "aurora-optima",
    name: "奥罗拉 Aurora Optima",
    makerId: "CJXe8UpnkHLJ",
    donorId: "G9ptvLpfyzNQ",
    sourceRowKey: "意大利::Aurora Optima",
  },
] as const;

type CanonicalActionKind = Extract<
  PrimaryAction,
  "alias" | "rename" | "merge" | "retire"
>;

interface Queryable {
  execute(statement: { sql: string; args: InArgs }): Promise<ResultSet>;
}

interface EntitySnapshot {
  id: string;
  type: "pen" | "brand";
  slug: string;
  name: string;
  makerId: string | null;
  publicationStatus: string;
}

interface AliasInsert {
  alias: string;
  language: string;
  aliasKind:
    | "alias"
    | "regional_name"
    | "former_name"
    | "licensed_name"
    | "producer_name";
  market: string | null;
  sourceId: string;
  sourceItemId: string;
  reviewStatus: "approved" | "pending" | "rejected";
}

interface MergeCopies {
  attributes: Array<{ id: string; key: string; value: string | null }>;
  tags: Array<{ id: string; tagId: string }>;
  references: Array<{
    id: string;
    sourceItemId: string;
    relationType: string;
    note: string | null;
    reviewStatus: string;
  }>;
  externalIds: Array<{
    id: string;
    provider: string;
    externalId: string;
    url: string | null;
    metadataJson: string | null;
  }>;
  aliases: Array<AliasInsert & { id: string }>;
  donorReviewIds: string[];
}

export interface TaxonomyBlocker {
  code: string;
  sourceRowKey: string | null;
  message: string;
}

export interface ResolvedTaxonomyAction {
  actionId: string;
  actionChecksum: string;
  actionKind: CanonicalActionKind;
  sourceRowKey: string;
  source: EntitySnapshot;
  target: EntitySnapshot | null;
  canonicalName: string | null;
  canonicalSlug: string | null;
  canonicalMakerId: string | null;
  sourceItemId: string;
  sourceRegistryId: string;
  aliases: AliasInsert[];
  mergeCopies: MergeCopies | null;
}

export interface ResolvedTaxonomyPlan {
  scope: typeof SCOPE;
  sourceKey: typeof SOURCE_KEY;
  sourceChecksum: string;
  batchId: string;
  sourceRowCount: number;
  actions: ResolvedTaxonomyAction[];
  skipped: Array<{
    sourceRowKey: string;
    state: "gated" | "defer";
    reason: string;
  }>;
  delegated: string[];
  blockers: TaxonomyBlocker[];
  replay: "none" | "noop";
}

export interface ApplyTaxonomyResult {
  applied: boolean;
  replay: "applied" | "noop";
  batchId: string;
  sourceChecksum: string;
  actionCounts: Record<CanonicalActionKind, number>;
  splitCount?: number;
  outputCount?: number;
}

export interface ResolvedLockedSplitPlan {
  scope: "locked_split";
  sourceKey: typeof LOCKED_SPLIT_SOURCE_KEY;
  sourceChecksum: string;
  batchId: string;
  sourceRowCount: 8;
  outputs: Array<(typeof LOCKED_SPLIT_OUTPUTS)[number]>;
  donors: Array<
    (typeof LOCKED_SPLIT_DONORS)[number] & { snapshot: EntitySnapshot }
  >;
  assignments: ReferenceAssignmentResolution;
  blockers: TaxonomyBlocker[];
  replay: "none" | "noop";
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

function sha256(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function stableId(prefix: string, value: unknown): string {
  return `${prefix}-${sha256(value).slice(0, 24)}`;
}

function normalizedAlias(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en");
}

function rowString(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected non-empty ${key}.`);
  }
  return value;
}

function nullableRowString(
  row: Record<string, unknown>,
  key: string,
): string | null {
  const value = row[key];
  return value === null || value === undefined ? null : String(value);
}

async function rows(
  db: Queryable,
  sql: string,
  args: InArgs = [],
): Promise<Array<Record<string, unknown>>> {
  const result = await db.execute({ sql, args });
  return result.rows as Array<Record<string, unknown>>;
}

async function entitySnapshot(
  db: Queryable,
  entityId: string,
): Promise<EntitySnapshot | null> {
  const entityRows = await rows(
    db,
    `SELECT entity.id, entity.type, entity.slug, entity.name,
            publication.status AS publication_status
       FROM entities entity
       JOIN entity_publications publication ON publication.entity_id = entity.id
      WHERE entity.id = ?`,
    [entityId],
  );
  if (entityRows.length !== 1) return null;
  const row = entityRows[0];
  const type = rowString(row, "type");
  if (type !== "pen" && type !== "brand") return null;
  let makerId: string | null = null;
  if (type === "pen") {
    const makers = await rows(
      db,
      `SELECT target_id
         FROM entity_links
        WHERE source_id = ? AND link_type = 'made_by'
        ORDER BY target_id`,
      [entityId],
    );
    if (makers.length === 1) makerId = rowString(makers[0], "target_id");
    else if (makers.length > 1) makerId = `!ambiguous:${makers.length}`;
  }
  return {
    id: rowString(row, "id"),
    type,
    slug: rowString(row, "slug"),
    name: rowString(row, "name"),
    makerId,
    publicationStatus: rowString(row, "publication_status"),
  };
}

function blocker(
  blockers: TaxonomyBlocker[],
  code: string,
  sourceRowKey: string | null,
  message: string,
): void {
  blockers.push({ code, sourceRowKey, message });
}

function exactRetain(decision: TaxonomyDecision) {
  return decision.atomicActions.filter(
    (item) => item.kind === "split_retain_as",
  );
}

function exactRetire(decision: TaxonomyDecision) {
  return decision.atomicActions.filter(
    (item) => item.kind === "retire_mixed" || item.kind === "retire_generic",
  );
}

async function exactSourceItem(
  db: Queryable,
  decision: TaxonomyDecision,
  blockers: TaxonomyBlocker[],
): Promise<{ sourceItemId: string; sourceRegistryId: string } | null> {
  const url = decision.evidenceRefs[0];
  if (!url) {
    blocker(
      blockers,
      "missing_source_provenance",
      decision.sourceRowKey,
      "Executable taxonomy action requires one exact evidence URL.",
    );
    return null;
  }
  const matches = await rows(
    db,
    `SELECT id, source_id FROM source_items WHERE url = ? ORDER BY id`,
    [url],
  );
  if (matches.length !== 1) {
    blocker(
      blockers,
      "source_item_cardinality",
      decision.sourceRowKey,
      `Expected exactly one source item for ${url}; found ${matches.length}.`,
    );
    return null;
  }
  return {
    sourceItemId: rowString(matches[0], "id"),
    sourceRegistryId: rowString(matches[0], "source_id"),
  };
}

async function assertSlugAvailable(
  db: Queryable,
  decision: TaxonomyDecision,
  entityId: string,
  slug: string,
  blockers: TaxonomyBlocker[],
): Promise<void> {
  const matches = await rows(
    db,
    "SELECT id FROM entities WHERE slug = ? AND id != ? ORDER BY id",
    [slug, entityId],
  );
  if (matches.length > 0) {
    blocker(
      blockers,
      "duplicate_target_slug",
      decision.sourceRowKey,
      `Canonical slug ${slug} is already owned by another entity.`,
    );
  }
}

async function aliasAvailable(
  db: Queryable,
  entityId: string,
  alias: string,
  language: string,
  allowedOwnerIds: ReadonlySet<string>,
): Promise<boolean> {
  const existing = await rows(
    db,
    `SELECT entity_id, alias, language
       FROM entity_aliases
      ORDER BY entity_id, alias, language`,
  );
  const normalized = normalizedAlias(alias);
  return !existing.some(
    (row) =>
      normalizedAlias(rowString(row, "alias")) === normalized &&
      rowString(row, "language") === language &&
      (!allowedOwnerIds.has(rowString(row, "entity_id")) ||
        rowString(row, "entity_id") === entityId),
  );
}

async function mergeCopies(
  db: Queryable,
  decision: TaxonomyDecision,
  donorId: string,
  targetId: string,
  blockers: TaxonomyBlocker[],
): Promise<MergeCopies> {
  const attributes: MergeCopies["attributes"] = [];
  const donorAttributes = await rows(
    db,
    "SELECT id, key, value FROM entity_attributes WHERE entity_id = ? ORDER BY key, id",
    [donorId],
  );
  const targetAttributes = await rows(
    db,
    "SELECT key, value FROM entity_attributes WHERE entity_id = ? ORDER BY key",
    [targetId],
  );
  const targetAttributeMap = new Map(
    targetAttributes.map((row) => [
      rowString(row, "key"),
      nullableRowString(row, "value"),
    ]),
  );
  for (const row of donorAttributes) {
    const key = rowString(row, "key");
    const value = nullableRowString(row, "value");
    if (!targetAttributeMap.has(key)) {
      attributes.push({
        id: stableId("taxonomy-attr", {
          decision: decision.sourceRowKey,
          donorRow: rowString(row, "id"),
        }),
        key,
        value,
      });
    } else if (targetAttributeMap.get(key) !== value) {
      blocker(
        blockers,
        "merge_attribute_conflict",
        decision.sourceRowKey,
        `Attribute ${key} differs between donor and target.`,
      );
    }
  }

  const targetTags = new Set(
    (
      await rows(
        db,
        "SELECT tag_id FROM entity_tags WHERE entity_id = ? ORDER BY tag_id",
        [targetId],
      )
    ).map((row) => rowString(row, "tag_id")),
  );
  const tags = (
    await rows(
      db,
      "SELECT id, tag_id FROM entity_tags WHERE entity_id = ? ORDER BY tag_id, id",
      [donorId],
    )
  )
    .filter((row) => !targetTags.has(rowString(row, "tag_id")))
    .map((row) => ({
      id: stableId("taxonomy-tag", {
        decision: decision.sourceRowKey,
        donorRow: rowString(row, "id"),
      }),
      tagId: rowString(row, "tag_id"),
    }));

  const targetReferences = new Map(
    (
      await rows(
        db,
        `SELECT source_item_id, relation_type, note, review_status
           FROM entity_references WHERE entity_id = ?
          ORDER BY source_item_id, relation_type`,
        [targetId],
      )
    ).map((row) => [
      `${rowString(row, "source_item_id")}\0${rowString(row, "relation_type")}`,
      `${nullableRowString(row, "note")}\0${rowString(row, "review_status")}`,
    ]),
  );
  const references: MergeCopies["references"] = [];
  for (const row of await rows(
    db,
    `SELECT id, source_item_id, relation_type, note, review_status
       FROM entity_references WHERE entity_id = ?
      ORDER BY source_item_id, relation_type, id`,
    [donorId],
  )) {
    const sourceItemId = rowString(row, "source_item_id");
    const relationType = rowString(row, "relation_type");
    const note = nullableRowString(row, "note");
    const reviewStatus = rowString(row, "review_status");
    const key = `${sourceItemId}\0${relationType}`;
    const value = `${note}\0${reviewStatus}`;
    if (!targetReferences.has(key)) {
      references.push({
        id: stableId("taxonomy-ref", {
          decision: decision.sourceRowKey,
          donorRow: rowString(row, "id"),
        }),
        sourceItemId,
        relationType,
        note,
        reviewStatus,
      });
    } else if (targetReferences.get(key) !== value) {
      blocker(
        blockers,
        "merge_reference_conflict",
        decision.sourceRowKey,
        `Reference ${key} differs between donor and target.`,
      );
    }
  }

  const targetExternalIds = new Map(
    (
      await rows(
        db,
        `SELECT provider, external_id, url, metadata_json
           FROM external_ids WHERE entity_id = ?
          ORDER BY provider, external_id`,
        [targetId],
      )
    ).map((row) => [
      `${rowString(row, "provider")}\0${rowString(row, "external_id")}`,
      `${nullableRowString(row, "url")}\0${nullableRowString(row, "metadata_json")}`,
    ]),
  );
  const externalIds: MergeCopies["externalIds"] = [];
  for (const row of await rows(
    db,
    `SELECT id, provider, external_id, url, metadata_json
       FROM external_ids WHERE entity_id = ?
      ORDER BY provider, external_id, id`,
    [donorId],
  )) {
    const provider = rowString(row, "provider");
    const externalId = rowString(row, "external_id");
    const url = nullableRowString(row, "url");
    const metadataJson = nullableRowString(row, "metadata_json");
    const key = `${provider}\0${externalId}`;
    const value = `${url}\0${metadataJson}`;
    if (!targetExternalIds.has(key)) {
      externalIds.push({
        id: stableId("taxonomy-ext", {
          decision: decision.sourceRowKey,
          donorRow: rowString(row, "id"),
        }),
        provider,
        externalId,
        url,
        metadataJson,
      });
    } else if (targetExternalIds.get(key) !== value) {
      blocker(
        blockers,
        "merge_external_id_conflict",
        decision.sourceRowKey,
        `External ID ${key} differs between donor and target.`,
      );
    }
  }

  const aliases: MergeCopies["aliases"] = [];
  for (const row of await rows(
    db,
    `SELECT id, alias, language, alias_kind, market, source_id,
            source_item_id, review_status
       FROM entity_aliases WHERE entity_id = ?
      ORDER BY alias, language, id`,
    [donorId],
  )) {
    const sourceId = nullableRowString(row, "source_id");
    const sourceItemId = nullableRowString(row, "source_item_id");
    if (!sourceId || !sourceItemId) continue;
    const alias = rowString(row, "alias");
    const language = rowString(row, "language");
    if (
      await aliasAvailable(db, targetId, alias, language, new Set([donorId]))
    ) {
      aliases.push({
        id: stableId("taxonomy-alias", {
          decision: decision.sourceRowKey,
          donorRow: rowString(row, "id"),
        }),
        alias,
        language,
        aliasKind: rowString(row, "alias_kind") as AliasInsert["aliasKind"],
        market: nullableRowString(row, "market"),
        sourceId,
        sourceItemId,
        reviewStatus: rowString(
          row,
          "review_status",
        ) as AliasInsert["reviewStatus"],
      });
    }
  }

  const donorReviewIds = (
    await rows(
      db,
      "SELECT id FROM entity_content_reviews WHERE entity_id = ? ORDER BY id",
      [donorId],
    )
  ).map((row) => rowString(row, "id"));

  return { attributes, tags, references, externalIds, aliases, donorReviewIds };
}

async function resolveAction(
  db: Queryable,
  decision: TaxonomyDecision,
  blockers: TaxonomyBlocker[],
): Promise<ResolvedTaxonomyAction | null> {
  if (
    decision.primaryAction !== "alias" &&
    decision.primaryAction !== "rename" &&
    decision.primaryAction !== "merge" &&
    decision.primaryAction !== "retire"
  ) {
    blocker(
      blockers,
      "unsupported_non_split_action",
      decision.sourceRowKey,
      `Plan 21-03 cannot apply ${decision.primaryAction}; branching/create work belongs to a later atomic unit.`,
    );
    return null;
  }

  const touchedIds = decision.atomicActions.flatMap((item) =>
    [item.sourceId, item.targetId].filter((id): id is string => Boolean(id)),
  );
  if (touchedIds.some((id) => LOCKED_ENTITY_IDS.has(id))) {
    blocker(
      blockers,
      "locked_split_delegated",
      decision.sourceRowKey,
      "This action touches the locked split unit and is delegated atomically to Plan 21-04.",
    );
    return null;
  }

  const canonical = decision.canonical;
  if (!canonical) {
    blocker(
      blockers,
      "missing_canonical_identity",
      decision.sourceRowKey,
      "Executable action has no exact canonical identity.",
    );
    return null;
  }

  const retain = exactRetain(decision);
  const retiring = exactRetire(decision);
  let sourceId: string | null = null;
  let targetId: string | null = canonical.entityId;
  let expectedSourceSlug: string | null = null;
  if (decision.primaryAction === "merge") {
    if (retiring.length !== 1 || retain.length !== 1) {
      blocker(
        blockers,
        "merge_action_cardinality",
        decision.sourceRowKey,
        "Merge requires one exact donor retire and one exact survivor retain action.",
      );
      return null;
    }
    sourceId = retiring[0].sourceId;
    expectedSourceSlug = retiring[0].targetSlug;
    if (retain[0].targetId !== canonical.entityId) targetId = null;
  } else if (decision.primaryAction === "retire") {
    if (retiring.length !== 1 || retain.length !== 0) {
      blocker(
        blockers,
        "retire_action_cardinality",
        decision.sourceRowKey,
        "Retire requires one exact source action and no successor.",
      );
      return null;
    }
    sourceId = retiring[0].sourceId;
    expectedSourceSlug = retiring[0].targetSlug;
    targetId = null;
  } else {
    if (retain.length !== 1 || retiring.length !== 0) {
      blocker(
        blockers,
        "retain_action_cardinality",
        decision.sourceRowKey,
        `${decision.primaryAction} requires one exact stable-ID retain action.`,
      );
      return null;
    }
    sourceId = retain[0].sourceId;
    targetId = retain[0].targetId;
    expectedSourceSlug = retain[0].targetSlug;
  }
  if (
    !sourceId ||
    !expectedSourceSlug ||
    (targetId && targetId !== canonical.entityId)
  ) {
    blocker(
      blockers,
      "exact_identity_mismatch",
      decision.sourceRowKey,
      "Action IDs/slugs do not match the exact canonical tuple.",
    );
    return null;
  }

  const source = await entitySnapshot(db, sourceId);
  const target = targetId ? await entitySnapshot(db, targetId) : null;
  if (!source || source.type !== "pen" || source.slug !== expectedSourceSlug) {
    blocker(
      blockers,
      "source_before_state_mismatch",
      decision.sourceRowKey,
      `Expected pen ${sourceId} at slug ${expectedSourceSlug}.`,
    );
    return null;
  }
  if (source.makerId?.startsWith("!ambiguous:") || source.makerId === null) {
    blocker(
      blockers,
      "source_maker_cardinality",
      decision.sourceRowKey,
      `Expected exactly one current maker for ${sourceId}.`,
    );
    return null;
  }
  if (targetId && (!target || target.type !== "pen")) {
    blocker(
      blockers,
      "target_before_state_mismatch",
      decision.sourceRowKey,
      `Expected exact target pen ${targetId}.`,
    );
    return null;
  }
  if (decision.primaryAction === "alias" && target?.slug !== canonical.slug) {
    blocker(
      blockers,
      "alias_target_slug_mismatch",
      decision.sourceRowKey,
      `Alias target ${targetId} is not at ${canonical.slug}.`,
    );
    return null;
  }
  if (decision.primaryAction === "merge" && target?.slug !== canonical.slug) {
    blocker(
      blockers,
      "merge_target_slug_mismatch",
      decision.sourceRowKey,
      `Merge target ${targetId} is not at ${canonical.slug}.`,
    );
    return null;
  }
  if (
    target?.makerId?.startsWith("!ambiguous:") ||
    (target && target.makerId === null)
  ) {
    blocker(
      blockers,
      "target_maker_cardinality",
      decision.sourceRowKey,
      `Expected exactly one current maker for ${targetId}.`,
    );
    return null;
  }
  const maker = await entitySnapshot(db, canonical.makerId);
  if (!maker || maker.type !== "brand") {
    blocker(
      blockers,
      "canonical_maker_mismatch",
      decision.sourceRowKey,
      `Canonical maker ${canonical.makerId} is not one exact brand.`,
    );
    return null;
  }
  await assertSlugAvailable(
    db,
    decision,
    canonical.entityId,
    canonical.slug,
    blockers,
  );
  const provenance = await exactSourceItem(db, decision, blockers);
  if (!provenance) return null;

  const aliases: AliasInsert[] = [];
  if (decision.primaryAction === "alias") {
    aliases.push({
      alias: decision.title,
      language: "und",
      aliasKind: "regional_name",
      market: decision.region,
      sourceId: provenance.sourceRegistryId,
      sourceItemId: provenance.sourceItemId,
      reviewStatus: "approved",
    });
  } else if (
    decision.primaryAction === "merge" ||
    (decision.primaryAction === "rename" &&
      !(source.name.includes("贵妃") && !canonical.name.includes("贵妃")))
  ) {
    aliases.push({
      alias: source.name,
      language: "und",
      aliasKind: "former_name",
      market: null,
      sourceId: provenance.sourceRegistryId,
      sourceItemId: provenance.sourceItemId,
      reviewStatus: "approved",
    });
  }
  for (const alias of aliases) {
    if (
      !(await aliasAvailable(
        db,
        canonical.entityId,
        alias.alias,
        alias.language,
        new Set(),
      ))
    ) {
      blocker(
        blockers,
        "alias_collision",
        decision.sourceRowKey,
        `Alias ${alias.alias} collides after normalization.`,
      );
    }
  }

  const copies =
    decision.primaryAction === "merge" && target
      ? await mergeCopies(db, decision, source.id, target.id, blockers)
      : null;
  const actionPayload = {
    actionKind: decision.primaryAction,
    sourceRowKey: decision.sourceRowKey,
    source,
    target,
    canonical,
    provenance,
    aliases,
    copies,
  };
  const actionChecksum = sha256(actionPayload);
  return {
    actionId: stableId("taxonomy-action", actionPayload),
    actionChecksum,
    actionKind: decision.primaryAction,
    sourceRowKey: decision.sourceRowKey,
    source,
    target,
    canonicalName: decision.primaryAction === "retire" ? null : canonical.name,
    canonicalSlug: decision.primaryAction === "retire" ? null : canonical.slug,
    canonicalMakerId:
      decision.primaryAction === "retire" ? null : canonical.makerId,
    sourceItemId: provenance.sourceItemId,
    sourceRegistryId: provenance.sourceRegistryId,
    aliases,
    mergeCopies: copies,
  };
}

export async function resolveTaxonomyPlan(
  db: Pick<Client, "execute">,
  plan: TaxonomyPlan,
): Promise<ResolvedTaxonomyPlan> {
  const reconciliation = reconcileTaxonomyPlan(plan, { scope: SCOPE });
  const sourceChecksum = sha256(plan);
  const batchId = stableId("taxonomy-batch", {
    sourceKey: SOURCE_KEY,
    sourceChecksum,
  });
  const blockers: TaxonomyBlocker[] = [];
  if (reconciliation.sourceRowKeys.length !== 101) {
    blocker(
      blockers,
      "non_split_cardinality",
      null,
      `Expected exactly 101 non-split rows; found ${reconciliation.sourceRowKeys.length}.`,
    );
  }
  const sourceKeys = new Set(reconciliation.sourceRowKeys);
  const delegated = plan.matrix
    .filter((decision) => !sourceKeys.has(decision.sourceRowKey))
    .map((decision) => decision.sourceRowKey)
    .sort();
  if (delegated.length !== 8) {
    blocker(
      blockers,
      "locked_split_cardinality",
      null,
      `Expected exactly 8 delegated locked rows; found ${delegated.length}.`,
    );
  }

  const previous = await rows(
    db,
    "SELECT source_checksum, status FROM taxonomy_batches WHERE source_key = ?",
    [SOURCE_KEY],
  );
  if (previous.length > 1) {
    blocker(
      blockers,
      "batch_key_cardinality",
      null,
      "Taxonomy batch key resolved to multiple rows.",
    );
  } else if (previous.length === 1) {
    const previousChecksum = rowString(previous[0], "source_checksum");
    if (previousChecksum !== sourceChecksum) {
      blocker(
        blockers,
        "batch_checksum_conflict",
        null,
        "The taxonomy batch key was already used by a different payload checksum.",
      );
    } else if (rowString(previous[0], "status") === "applied") {
      return {
        scope: SCOPE,
        sourceKey: SOURCE_KEY,
        sourceChecksum,
        batchId,
        sourceRowCount: reconciliation.sourceRowKeys.length,
        actions: [],
        skipped: [],
        delegated,
        blockers,
        replay: "noop",
      };
    } else {
      blocker(
        blockers,
        "incomplete_batch_replay",
        null,
        "The taxonomy batch key exists without an applied terminal state.",
      );
    }
  }

  const actions: ResolvedTaxonomyAction[] = [];
  const skipped: ResolvedTaxonomyPlan["skipped"] = [];
  const plannedAliasKeys = new Set<string>();
  for (const decision of plan.matrix.filter((item) =>
    sourceKeys.has(item.sourceRowKey),
  )) {
    if (decision.executionState !== "apply") {
      skipped.push({
        sourceRowKey: decision.sourceRowKey,
        state: decision.executionState,
        reason: decision.blocker ?? "not executable",
      });
      continue;
    }
    const action = await resolveAction(db, decision, blockers);
    if (!action) continue;
    let collision = false;
    for (const alias of action.aliases) {
      const key = `${action.target?.id ?? action.source.id}\0${normalizedAlias(alias.alias)}\0${alias.language}\0${alias.market ?? ""}`;
      if (plannedAliasKeys.has(key)) {
        blocker(
          blockers,
          "planned_alias_collision",
          decision.sourceRowKey,
          `Alias ${alias.alias} is duplicated in the resolved batch.`,
        );
        collision = true;
      }
      plannedAliasKeys.add(key);
    }
    if (!collision) actions.push(action);
  }
  actions.sort((left, right) =>
    left.sourceRowKey.localeCompare(right.sourceRowKey),
  );
  skipped.sort((left, right) =>
    left.sourceRowKey.localeCompare(right.sourceRowKey),
  );
  blockers.sort((left, right) =>
    `${left.sourceRowKey ?? ""}:${left.code}`.localeCompare(
      `${right.sourceRowKey ?? ""}:${right.code}`,
    ),
  );
  return {
    scope: SCOPE,
    sourceKey: SOURCE_KEY,
    sourceChecksum,
    batchId,
    sourceRowCount: reconciliation.sourceRowKeys.length,
    actions,
    skipped,
    delegated,
    blockers,
    replay: "none",
  };
}

async function lockedSplitInventory(
  db: Queryable,
): Promise<ReferenceInventoryItem[]> {
  const donorIds = LOCKED_SPLIT_DONORS.map((item) => item.id);
  const placeholders = donorIds.map(() => "?").join(", ");
  const inventory: ReferenceInventoryItem[] = [];
  const addOwnedRows = async (
    surface: PayloadAssignment["surface"],
    sql: string,
    itemColumn = "id",
    rowColumn = "id",
  ): Promise<void> => {
    for (const row of await rows(db, sql, donorIds)) {
      inventory.push({
        donorId: rowString(row, "entity_id"),
        surface,
        itemId: rowString(row, itemColumn),
        rowId: rowString(row, rowColumn),
      });
    }
  };

  await addOwnedRows(
    "story",
    `SELECT id, entity_id FROM stories WHERE entity_id IN (${placeholders})`,
  );
  await addOwnedRows(
    "spec",
    `SELECT id, entity_id FROM model_specs WHERE entity_id IN (${placeholders})`,
  );
  await addOwnedRows(
    "media",
    `SELECT id, entity_id FROM media_assets WHERE entity_id IN (${placeholders})`,
  );
  await addOwnedRows(
    "tag",
    `SELECT id, entity_id, tag_id FROM entity_tags WHERE entity_id IN (${placeholders})`,
    "tag_id",
  );
  await addOwnedRows(
    "relation",
    `SELECT id, source_id AS entity_id
       FROM entity_links
      WHERE source_id IN (${placeholders})
        AND link_type NOT IN ('made_by', 'reverse')`,
  );
  await addOwnedRows(
    "reference",
    `SELECT id, entity_id FROM entity_references WHERE entity_id IN (${placeholders})`,
  );
  await addOwnedRows(
    "variant",
    `SELECT id, model_entity_id AS entity_id
       FROM model_variants WHERE model_entity_id IN (${placeholders})`,
  );
  await addOwnedRows(
    "review",
    `SELECT id, entity_id
       FROM entity_content_reviews WHERE entity_id IN (${placeholders})`,
  );

  for (const row of await rows(
    db,
    `SELECT id, subject_entity_id, object_entity_id
       FROM claims
      WHERE subject_entity_id IN (${placeholders})
         OR object_entity_id IN (${placeholders})`,
    [...donorIds, ...donorIds],
  )) {
    const subject = nullableRowString(row, "subject_entity_id");
    const object = nullableRowString(row, "object_entity_id");
    const owners = [subject, object].filter(
      (id): id is string => id !== null && donorIds.includes(id as never),
    );
    for (const donorId of new Set(owners)) {
      inventory.push({
        donorId,
        surface: "claim",
        itemId: rowString(row, "id"),
        rowId: rowString(row, "id"),
      });
    }
  }
  for (const row of await rows(
    db,
    `SELECT id, target_id AS entity_id
       FROM citations
      WHERE target_type = 'entity' AND target_id IN (${placeholders})`,
    donorIds,
  )) {
    inventory.push({
      donorId: rowString(row, "entity_id"),
      surface: "citation",
      itemId: rowString(row, "id"),
      rowId: rowString(row, "id"),
    });
  }
  inventory.sort((left, right) =>
    `${left.donorId}:${left.surface}:${left.itemId}`.localeCompare(
      `${right.donorId}:${right.surface}:${right.itemId}`,
    ),
  );
  return inventory;
}

export async function resolveLockedSplitTaxonomyPlan(
  db: Pick<Client, "execute">,
  plan: TaxonomyPlan,
): Promise<ResolvedLockedSplitPlan> {
  const blockers: TaxonomyBlocker[] = [];
  let sourceRowCount = 0;
  try {
    const reconciliation = reconcileTaxonomyPlan(plan, {
      scope: "locked_split",
    });
    sourceRowCount = reconciliation.sourceRowKeys.length;
  } catch (error) {
    blocker(
      blockers,
      "unresolved_locked_split_manifest",
      null,
      error instanceof Error ? error.message : String(error),
    );
  }
  if (sourceRowCount !== 0 && sourceRowCount !== 8) {
    blocker(
      blockers,
      "locked_split_cardinality",
      null,
      `Expected exactly 8 locked split rows; found ${sourceRowCount}.`,
    );
  }

  const decisions = new Map(
    plan.matrix.map((decision) => [decision.sourceRowKey, decision]),
  );
  for (const output of LOCKED_SPLIT_OUTPUTS) {
    const decision = decisions.get(output.sourceRowKey);
    if (
      !decision ||
      decision.executionState !== "apply" ||
      decision.canonical?.entityId !== output.id ||
      decision.canonical.slug !== output.slug ||
      decision.canonical.name !== output.name ||
      decision.canonical.makerId !== output.makerId
    ) {
      blocker(
        blockers,
        "locked_output_contract_mismatch",
        output.sourceRowKey,
        `Locked output ${output.id}/${output.slug} does not match the manifest.`,
      );
    }
  }

  const donors: ResolvedLockedSplitPlan["donors"] = [];
  for (const donor of LOCKED_SPLIT_DONORS) {
    const snapshot = await entitySnapshot(db, donor.id);
    if (
      !snapshot ||
      snapshot.type !== "pen" ||
      snapshot.slug !== donor.slug ||
      snapshot.makerId !== donor.makerId
    ) {
      blocker(
        blockers,
        "locked_donor_before_state_mismatch",
        null,
        `Expected exact donor ${donor.id}/${donor.slug}/${donor.makerId}.`,
      );
    } else {
      donors.push({ ...donor, snapshot });
    }
    const maker = await entitySnapshot(db, donor.makerId);
    if (!maker || maker.type !== "brand") {
      blocker(
        blockers,
        "locked_maker_before_state_mismatch",
        null,
        `Expected exact brand ${donor.makerId}.`,
      );
    }
  }

  for (const output of LOCKED_SPLIT_OUTPUTS) {
    if (output.id === LOCKED_SPLIT_DONORS[0].id) continue;
    if (await entitySnapshot(db, output.id)) {
      blocker(
        blockers,
        "locked_output_id_collision",
        output.sourceRowKey,
        `Locked output ID ${output.id} already exists.`,
      );
    }
    const slugRows = await rows(db, "SELECT id FROM entities WHERE slug = ?", [
      output.slug,
    ]);
    if (slugRows.length > 0) {
      blocker(
        blockers,
        "locked_output_slug_collision",
        output.sourceRowKey,
        `Locked output slug ${output.slug} already exists.`,
      );
    }
  }

  const donorIds: ReadonlySet<string> = new Set(
    LOCKED_SPLIT_DONORS.map((item) => item.id),
  );
  const assignments = resolveReferenceAssignments(
    plan.payloadAssignments.filter((item) => donorIds.has(item.donorId)),
    await lockedSplitInventory(db),
    new Set(LOCKED_SPLIT_OUTPUTS.map((item) => item.id)),
  );
  for (const issue of assignments.blockers) {
    blocker(
      blockers,
      issue.code,
      null,
      `${issue.donorId ?? "unknown"}: ${issue.message}`,
    );
  }
  for (const item of [...assignments.retained, ...assignments.pending]) {
    if (item.donorId === LOCKED_SPLIT_DONORS[0].id) {
      blocker(
        blockers,
        "retained_donor_ambiguous_payload",
        null,
        `Waterman continuity winner cannot retain ambiguous ${item.surface} ${item.itemId}.`,
      );
    }
  }

  const sourceChecksum = sha256(plan);
  const batchId = stableId("taxonomy-batch", {
    sourceKey: LOCKED_SPLIT_SOURCE_KEY,
    sourceChecksum,
  });
  let replay: ResolvedLockedSplitPlan["replay"] = "none";
  const previous = await rows(
    db,
    "SELECT source_checksum, status FROM taxonomy_batches WHERE source_key = ?",
    [LOCKED_SPLIT_SOURCE_KEY],
  );
  if (previous.length > 1) {
    blocker(
      blockers,
      "batch_key_cardinality",
      null,
      "Locked split batch key is not unique.",
    );
  } else if (previous.length === 1) {
    if (rowString(previous[0], "source_checksum") !== sourceChecksum) {
      blocker(
        blockers,
        "batch_checksum_conflict",
        null,
        "Locked split batch checksum changed.",
      );
    } else if (rowString(previous[0], "status") === "applied") {
      replay = "noop";
    } else {
      blocker(
        blockers,
        "incomplete_batch_replay",
        null,
        "Locked split batch is not terminal.",
      );
    }
  }
  blockers.sort((left, right) =>
    `${left.sourceRowKey ?? ""}:${left.code}`.localeCompare(
      `${right.sourceRowKey ?? ""}:${right.code}`,
    ),
  );
  return {
    scope: "locked_split",
    sourceKey: LOCKED_SPLIT_SOURCE_KEY,
    sourceChecksum,
    batchId,
    sourceRowCount: 8,
    outputs: [...LOCKED_SPLIT_OUTPUTS],
    donors,
    assignments,
    blockers,
    replay,
  };
}

async function expectOne(result: ResultSet, label: string): Promise<void> {
  if (result.rowsAffected !== 1) {
    throw new Error(
      `${label} expected exactly one affected row; got ${result.rowsAffected}.`,
    );
  }
}

async function assertSnapshot(
  transaction: Transaction,
  snapshot: EntitySnapshot,
): Promise<void> {
  const current = await entitySnapshot(transaction, snapshot.id);
  if (
    !current ||
    current.type !== snapshot.type ||
    current.slug !== snapshot.slug ||
    current.name !== snapshot.name ||
    current.makerId !== snapshot.makerId ||
    current.publicationStatus !== snapshot.publicationStatus
  ) {
    throw new Error(`Taxonomy before-state changed for ${snapshot.id}.`);
  }
}

async function demote(
  transaction: Transaction,
  entityId: string,
): Promise<void> {
  await expectOne(
    await transaction.execute({
      sql: `UPDATE entity_publications
               SET status = 'draft',
                   blockers_json = '["taxonomy_review_required"]',
                   approved_content_hash = NULL,
                   content_revision = content_revision + 1,
                   reviewed_content_revision = NULL,
                   reviewed_contract_version = NULL,
                   reviewed_by = NULL,
                   reviewed_at = NULL,
                   published_at = NULL,
                   review_notes = NULL,
                   updated_at = datetime('now')
             WHERE entity_id = ?`,
      args: [entityId],
    }),
    `demote ${entityId}`,
  );
}

async function insertAlias(
  transaction: Transaction,
  action: ResolvedTaxonomyAction,
  entityId: string,
  alias: AliasInsert,
  ordinal: number,
): Promise<void> {
  await expectOne(
    await transaction.execute({
      sql: `INSERT INTO entity_aliases (
              id, entity_id, alias, language, source_id, alias_kind, market,
              source_item_id, review_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        stableId("taxonomy-alias", {
          action: action.actionChecksum,
          alias,
          ordinal,
        }),
        entityId,
        alias.alias,
        alias.language,
        alias.sourceId,
        alias.aliasKind,
        alias.market,
        alias.sourceItemId,
        alias.reviewStatus,
      ],
    }),
    `insert alias ${alias.alias}`,
  );
}

async function ensureMaker(
  transaction: Transaction,
  action: ResolvedTaxonomyAction,
  entityId: string,
  currentMakerId: string,
  canonicalMakerId: string,
): Promise<void> {
  if (currentMakerId === canonicalMakerId) return;
  await expectOne(
    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
      args: [entityId, currentMakerId],
    }),
    `remove maker ${entityId}`,
  );
  await expectOne(
    await transaction.execute({
      sql: "INSERT INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, 'made_by')",
      args: [
        stableId("taxonomy-link", {
          action: action.actionChecksum,
          entityId,
          canonicalMakerId,
        }),
        entityId,
        canonicalMakerId,
      ],
    }),
    `insert maker ${entityId}`,
  );
}

async function copyMergeMetadata(
  transaction: Transaction,
  action: ResolvedTaxonomyAction,
  targetId: string,
): Promise<void> {
  const copies = action.mergeCopies;
  if (!copies) return;
  for (const item of copies.attributes) {
    await expectOne(
      await transaction.execute({
        sql: "INSERT INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)",
        args: [item.id, targetId, item.key, item.value],
      }),
      `copy attribute ${item.key}`,
    );
  }
  for (const item of copies.tags) {
    await expectOne(
      await transaction.execute({
        sql: "INSERT INTO entity_tags (id, entity_id, tag_id) VALUES (?, ?, ?)",
        args: [item.id, targetId, item.tagId],
      }),
      `copy tag ${item.tagId}`,
    );
  }
  for (const item of copies.references) {
    await expectOne(
      await transaction.execute({
        sql: `INSERT INTO entity_references
              (id, entity_id, source_item_id, relation_type, note, review_status)
            VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          item.id,
          targetId,
          item.sourceItemId,
          item.relationType,
          item.note,
          item.reviewStatus,
        ],
      }),
      `copy reference ${item.id}`,
    );
  }
  for (const item of copies.externalIds) {
    await expectOne(
      await transaction.execute({
        sql: `INSERT INTO external_ids
              (id, entity_id, provider, external_id, url, metadata_json)
            VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          item.id,
          targetId,
          item.provider,
          item.externalId,
          item.url,
          item.metadataJson,
        ],
      }),
      `copy external ID ${item.id}`,
    );
  }
  for (const [index, item] of copies.aliases.entries()) {
    await expectOne(
      await transaction.execute({
        sql: `INSERT INTO entity_aliases (
              id, entity_id, alias, language, source_id, alias_kind, market,
              source_item_id, review_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.id,
          targetId,
          item.alias,
          item.language,
          item.sourceId,
          item.aliasKind,
          item.market,
          item.sourceItemId,
          item.reviewStatus,
        ],
      }),
      `copy donor alias ${index}`,
    );
  }
}

async function applyAction(
  transaction: Transaction,
  resolved: ResolvedTaxonomyPlan,
  action: ResolvedTaxonomyAction,
): Promise<void> {
  const targetId = action.target?.id ?? action.source.id;
  if (action.actionKind === "alias") {
    for (const [index, alias] of action.aliases.entries()) {
      await insertAlias(transaction, action, targetId, alias, index);
    }
  } else if (action.actionKind === "rename") {
    await expectOne(
      await transaction.execute({
        sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ? AND slug = ?",
        args: [
          action.canonicalSlug,
          action.canonicalName,
          action.source.id,
          action.source.slug,
        ],
      }),
      `rename ${action.source.id}`,
    );
    if (!action.canonicalMakerId || !action.source.makerId)
      throw new Error("Rename lost exact maker ownership.");
    await ensureMaker(
      transaction,
      action,
      action.source.id,
      action.source.makerId,
      action.canonicalMakerId,
    );
    for (const [index, alias] of action.aliases.entries()) {
      await insertAlias(transaction, action, action.source.id, alias, index);
    }
    await expectOne(
      await transaction.execute({
        sql: `INSERT INTO entity_redirects (
                id, batch_id, action_id, source_path, target_path,
                redirect_kind, fallback_reason
              ) VALUES (?, ?, ?, ?, ?, 'permanent', NULL)`,
        args: [
          stableId("taxonomy-redirect", action.actionChecksum),
          resolved.batchId,
          action.actionId,
          `/pen/${action.source.slug}`,
          `/pen/${action.canonicalSlug}`,
        ],
      }),
      `rename redirect ${action.source.id}`,
    );
  } else if (action.actionKind === "merge") {
    if (!action.target || !action.canonicalMakerId || !action.target.makerId)
      throw new Error("Merge lost exact survivor ownership.");
    await copyMergeMetadata(transaction, action, action.target.id);
    for (const [index, alias] of action.aliases.entries()) {
      await insertAlias(transaction, action, action.target.id, alias, index);
    }
    await ensureMaker(
      transaction,
      action,
      action.target.id,
      action.target.makerId,
      action.canonicalMakerId,
    );
    await expectOne(
      await transaction.execute({
        sql: "DELETE FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        args: [action.source.id, action.source.makerId],
      }),
      `remove donor maker ${action.source.id}`,
    );
    await expectOne(
      await transaction.execute({
        sql: `UPDATE entity_publications
               SET status = 'retired', blockers_json = '["taxonomy_merged"]',
                   approved_content_hash = NULL, reviewed_content_revision = NULL,
                   reviewed_contract_version = NULL, reviewed_by = NULL,
                   reviewed_at = NULL, published_at = NULL, updated_at = datetime('now')
             WHERE entity_id = ?`,
        args: [action.source.id],
      }),
      `retire merge donor ${action.source.id}`,
    );
    await expectOne(
      await transaction.execute({
        sql: `INSERT INTO entity_lineage (
              id, batch_id, action_id, source_entity_id, target_entity_id,
              lineage_kind, fallback_reason
            ) VALUES (?, ?, ?, ?, ?, 'merge', NULL)`,
        args: [
          stableId("taxonomy-lineage", action.actionChecksum),
          resolved.batchId,
          action.actionId,
          action.source.id,
          action.target.id,
        ],
      }),
      `merge lineage ${action.source.id}`,
    );
    await expectOne(
      await transaction.execute({
        sql: `INSERT INTO entity_redirects (
              id, batch_id, action_id, source_path, target_path,
              redirect_kind, fallback_reason
            ) VALUES (?, ?, ?, ?, ?, 'permanent', NULL)`,
        args: [
          stableId("taxonomy-redirect", action.actionChecksum),
          resolved.batchId,
          action.actionId,
          `/pen/${action.source.slug}`,
          `/pen/${action.target.slug}`,
        ],
      }),
      `merge redirect ${action.source.id}`,
    );
  } else {
    if (!action.source.makerId)
      throw new Error("Retire lost exact maker ownership.");
    await expectOne(
      await transaction.execute({
        sql: "DELETE FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        args: [action.source.id, action.source.makerId],
      }),
      `remove retired maker ${action.source.id}`,
    );
    await expectOne(
      await transaction.execute({
        sql: `UPDATE entity_publications
               SET status = 'retired', blockers_json = '["taxonomy_identity_unresolved"]',
                   approved_content_hash = NULL, reviewed_content_revision = NULL,
                   reviewed_contract_version = NULL, reviewed_by = NULL,
                   reviewed_at = NULL, published_at = NULL, updated_at = datetime('now')
             WHERE entity_id = ?`,
        args: [action.source.id],
      }),
      `retire ${action.source.id}`,
    );
    await expectOne(
      await transaction.execute({
        sql: `INSERT INTO entity_redirects (
              id, batch_id, action_id, source_path, target_path,
              redirect_kind, fallback_reason
            ) VALUES (?, ?, ?, ?, NULL, 'hard_404', 'identity unresolved; no reviewed successor')`,
        args: [
          stableId("taxonomy-redirect", action.actionChecksum),
          resolved.batchId,
          action.actionId,
          `/pen/${action.source.slug}`,
        ],
      }),
      `retire redirect ${action.source.id}`,
    );
  }
}

async function rollbackQuietly(transaction: Transaction): Promise<void> {
  if (transaction.closed) return;
  try {
    await transaction.rollback();
  } catch {
    // Preserve the taxonomy failure that caused the rollback.
  }
}

function emptyActionCounts(): Record<CanonicalActionKind, number> {
  return { alias: 0, merge: 0, rename: 0, retire: 0 };
}

async function applyNonSplitTaxonomyPlan(
  db: Pick<Client, "transaction">,
  resolved: ResolvedTaxonomyPlan,
): Promise<ApplyTaxonomyResult> {
  if (resolved.scope !== SCOPE || resolved.sourceRowCount !== 101) {
    throw new Error(
      "Taxonomy apply requires the exact 101-row non_split scope.",
    );
  }
  if (resolved.blockers.length > 0) {
    throw new Error(
      `Taxonomy apply refused ${resolved.blockers.length} preflight blocker(s).`,
    );
  }
  if (resolved.replay === "noop") {
    return {
      applied: false,
      replay: "noop",
      batchId: resolved.batchId,
      sourceChecksum: resolved.sourceChecksum,
      actionCounts: emptyActionCounts(),
    };
  }

  const transaction = await db.transaction("write");
  try {
    for (const action of resolved.actions) {
      await assertSnapshot(transaction, action.source);
      if (action.target && action.target.id !== action.source.id) {
        await assertSnapshot(transaction, action.target);
      }
    }
    await expectOne(
      await transaction.execute({
        sql: `INSERT INTO taxonomy_batches
              (id, source_key, source_checksum, status, note)
            VALUES (?, ?, ?, 'staged', 'Plan 21-03 non_split exact apply')`,
        args: [resolved.batchId, resolved.sourceKey, resolved.sourceChecksum],
      }),
      "insert taxonomy batch",
    );
    for (const action of resolved.actions) {
      await expectOne(
        await transaction.execute({
          sql: `INSERT INTO taxonomy_actions (
                id, batch_id, source_row_key, action_kind, action_checksum,
                source_entity_id, target_entity_id, status, note
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'staged', 'exact non_split action')`,
          args: [
            action.actionId,
            resolved.batchId,
            action.sourceRowKey,
            action.actionKind,
            action.actionChecksum,
            action.source.id,
            action.target?.id ?? null,
          ],
        }),
        `insert action ${action.sourceRowKey}`,
      );
    }

    const affected = new Set<string>();
    for (const action of resolved.actions) {
      affected.add(action.source.id);
      if (action.target) affected.add(action.target.id);
      if (action.source.makerId) affected.add(action.source.makerId);
      if (action.target?.makerId) affected.add(action.target.makerId);
      if (action.canonicalMakerId) affected.add(action.canonicalMakerId);
    }
    for (const entityId of [...affected].sort())
      await demote(transaction, entityId);

    for (const action of resolved.actions) {
      await applyAction(transaction, resolved, action);
      await expectOne(
        await transaction.execute({
          sql: "UPDATE taxonomy_actions SET status = 'applied', updated_at = datetime('now') WHERE id = ? AND status = 'staged'",
          args: [action.actionId],
        }),
        `complete action ${action.sourceRowKey}`,
      );
    }

    for (const action of resolved.actions) {
      for (const reviewId of action.mergeCopies?.donorReviewIds ?? []) {
        const owner = await rows(
          transaction,
          "SELECT entity_id FROM entity_content_reviews WHERE id = ?",
          [reviewId],
        );
        if (
          owner.length !== 1 ||
          rowString(owner[0], "entity_id") !== action.source.id
        ) {
          throw new Error(
            `Taxonomy merge attempted to copy or move review ${reviewId}.`,
          );
        }
      }
    }
    if (affected.size > 0) {
      const ids = [...affected].sort();
      const placeholders = ids.map(() => "?").join(", ");
      const publicRows = await rows(
        transaction,
        `SELECT id FROM public_entities WHERE id IN (${placeholders})`,
        ids,
      );
      if (publicRows.length !== 0) {
        throw new Error(
          "Affected taxonomy entities remained publicly authorized.",
        );
      }
    }
    await expectOne(
      await transaction.execute({
        sql: "UPDATE taxonomy_batches SET status = 'applied', updated_at = datetime('now') WHERE id = ? AND status = 'staged'",
        args: [resolved.batchId],
      }),
      "complete taxonomy batch",
    );
    await transaction.commit();

    const actionCounts = emptyActionCounts();
    for (const action of resolved.actions) actionCounts[action.actionKind] += 1;
    return {
      applied: true,
      replay: "applied",
      batchId: resolved.batchId,
      sourceChecksum: resolved.sourceChecksum,
      actionCounts,
    };
  } catch (error) {
    await rollbackQuietly(transaction);
    throw error;
  }
}

function lockedActionId(
  resolved: ResolvedLockedSplitPlan,
  output: (typeof LOCKED_SPLIT_OUTPUTS)[number],
): string {
  return stableId("taxonomy-action", {
    batchId: resolved.batchId,
    sourceRowKey: output.sourceRowKey,
    donorId: output.donorId,
    outputId: output.id,
  });
}

async function moveLockedAssignment(
  transaction: Transaction,
  assignment: ReferenceAssignmentResolution["moves"][number],
): Promise<void> {
  if (!assignment.targetId) throw new Error("Locked payload move lost target.");
  const targetId = assignment.targetId;
  if (assignment.surface === "story") {
    await expectOne(
      await transaction.execute({
        sql: "UPDATE stories SET entity_id = ?, status = 'draft', updated_at = datetime('now') WHERE id = ? AND entity_id = ?",
        args: [targetId, assignment.rowId, assignment.donorId],
      }),
      `move story ${assignment.itemId}`,
    );
    return;
  }
  if (assignment.surface === "spec") {
    await expectOne(
      await transaction.execute({
        sql: "UPDATE model_specs SET entity_id = ?, brand_entity_id = NULL, review_status = 'pending', updated_at = datetime('now') WHERE id = ? AND entity_id = ?",
        args: [targetId, assignment.rowId, assignment.donorId],
      }),
      `move spec ${assignment.itemId}`,
    );
    return;
  }
  if (assignment.surface === "claim") {
    const result = await transaction.execute({
      sql: `UPDATE claims
               SET subject_entity_id = CASE WHEN subject_entity_id = ? THEN ? ELSE subject_entity_id END,
                   object_entity_id = CASE WHEN object_entity_id = ? THEN ? ELSE object_entity_id END,
                   review_status = 'needs_source', updated_at = datetime('now')
             WHERE id = ? AND (subject_entity_id = ? OR object_entity_id = ?)`,
      args: [
        assignment.donorId,
        targetId,
        assignment.donorId,
        targetId,
        assignment.rowId,
        assignment.donorId,
        assignment.donorId,
      ],
    });
    await expectOne(result, `move claim ${assignment.itemId}`);
    return;
  }
  if (assignment.surface === "citation") {
    await expectOne(
      await transaction.execute({
        sql: "UPDATE citations SET target_id = ?, review_status = 'needs_review' WHERE id = ? AND target_type = 'entity' AND target_id = ?",
        args: [targetId, assignment.rowId, assignment.donorId],
      }),
      `move citation ${assignment.itemId}`,
    );
    return;
  }
  if (assignment.surface === "media") {
    await expectOne(
      await transaction.execute({
        sql: "UPDATE media_assets SET entity_id = ?, review_status = 'pending', usage_status = 'candidate', updated_at = datetime('now') WHERE id = ? AND entity_id = ?",
        args: [targetId, assignment.rowId, assignment.donorId],
      }),
      `move media ${assignment.itemId}`,
    );
    return;
  }
  if (assignment.surface === "tag") {
    await expectOne(
      await transaction.execute({
        sql: "UPDATE entity_tags SET entity_id = ? WHERE id = ? AND entity_id = ?",
        args: [targetId, assignment.rowId, assignment.donorId],
      }),
      `move tag ${assignment.itemId}`,
    );
    return;
  }
  if (assignment.surface === "reference") {
    await expectOne(
      await transaction.execute({
        sql: "UPDATE entity_references SET entity_id = ?, review_status = 'pending' WHERE id = ? AND entity_id = ?",
        args: [targetId, assignment.rowId, assignment.donorId],
      }),
      `move reference ${assignment.itemId}`,
    );
    return;
  }
  if (assignment.surface === "variant") {
    await expectOne(
      await transaction.execute({
        sql: "UPDATE model_variants SET model_entity_id = ?, review_status = 'pending' WHERE id = ? AND model_entity_id = ?",
        args: [targetId, assignment.rowId, assignment.donorId],
      }),
      `move variant ${assignment.itemId}`,
    );
    return;
  }
  if (assignment.surface === "relation") {
    const relationRows = await rows(
      transaction,
      `SELECT id, source_id, target_id, link_type, reason
         FROM entity_links
        WHERE id = ? AND source_id = ? AND link_type NOT IN ('made_by', 'reverse')`,
      [assignment.rowId, assignment.donorId],
    );
    if (relationRows.length !== 1)
      throw new Error(`Relation ${assignment.itemId} lost exact ownership.`);
    const relation = relationRows[0];
    await expectOne(
      await transaction.execute({
        sql: "DELETE FROM entity_links WHERE id = ?",
        args: [assignment.rowId],
      }),
      `remove relation ${assignment.itemId}`,
    );
    await expectOne(
      await transaction.execute({
        sql: "INSERT INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, ?, ?)",
        args: [
          assignment.rowId,
          targetId,
          rowString(relation, "target_id"),
          rowString(relation, "link_type"),
          nullableRowString(relation, "reason"),
        ],
      }),
      `rebuild relation ${assignment.itemId}`,
    );
    return;
  }
  if (assignment.surface === "source") return;
  throw new Error(`Review payload ${assignment.itemId} cannot be inherited.`);
}

async function applyLockedSplitTaxonomyPlan(
  db: Pick<Client, "transaction">,
  resolved: ResolvedLockedSplitPlan,
): Promise<ApplyTaxonomyResult> {
  if (resolved.blockers.length > 0) {
    throw new Error(
      `Taxonomy apply refused ${resolved.blockers.length} locked split blocker(s).`,
    );
  }
  if (resolved.replay === "noop") {
    return {
      applied: false,
      replay: "noop",
      batchId: resolved.batchId,
      sourceChecksum: resolved.sourceChecksum,
      actionCounts: emptyActionCounts(),
      splitCount: 0,
      outputCount: 0,
    };
  }
  if (resolved.outputs.length !== 8 || resolved.donors.length !== 4) {
    throw new Error(
      "Locked split apply requires exactly four donors and eight outputs.",
    );
  }

  const transaction = await db.transaction("write");
  try {
    for (const donor of resolved.donors)
      await assertSnapshot(transaction, donor.snapshot);
    await expectOne(
      await transaction.execute({
        sql: `INSERT INTO taxonomy_batches
              (id, source_key, source_checksum, status, note)
            VALUES (?, ?, ?, 'staged', 'Plan 21-04 exact locked split')`,
        args: [resolved.batchId, resolved.sourceKey, resolved.sourceChecksum],
      }),
      "insert locked split batch",
    );

    for (const donor of resolved.donors) {
      await demote(transaction, donor.id);
      await demote(transaction, donor.makerId);
    }
    for (const output of resolved.outputs) {
      if (output.id === LOCKED_SPLIT_DONORS[0].id) {
        await expectOne(
          await transaction.execute({
            sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ? AND slug = ?",
            args: [
              output.slug,
              output.name,
              output.id,
              LOCKED_SPLIT_DONORS[0].slug,
            ],
          }),
          "retain Waterman Hémisphère",
        );
      } else {
        await expectOne(
          await transaction.execute({
            sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)",
            args: [output.id, output.slug, output.name],
          }),
          `create locked output ${output.id}`,
        );
        await demote(transaction, output.id);
        await expectOne(
          await transaction.execute({
            sql: "INSERT INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, 'made_by')",
            args: [
              stableId("taxonomy-link", {
                batchId: resolved.batchId,
                outputId: output.id,
                makerId: output.makerId,
              }),
              output.id,
              output.makerId,
            ],
          }),
          `insert locked maker ${output.id}`,
        );
      }
    }

    for (const output of resolved.outputs) {
      const actionId = lockedActionId(resolved, output);
      const actionChecksum = sha256({
        sourceRowKey: output.sourceRowKey,
        donorId: output.donorId,
        outputId: output.id,
        outputSlug: output.slug,
      });
      await expectOne(
        await transaction.execute({
          sql: `INSERT INTO taxonomy_actions (
                  id, batch_id, source_row_key, action_kind, action_checksum,
                  source_entity_id, target_entity_id, status, note
                ) VALUES (?, ?, ?, 'split', ?, ?, ?, 'staged', 'exact locked output')`,
          args: [
            actionId,
            resolved.batchId,
            output.sourceRowKey,
            actionChecksum,
            output.donorId,
            output.id,
          ],
        }),
        `insert locked action ${output.sourceRowKey}`,
      );
      if (output.id !== output.donorId) {
        await expectOne(
          await transaction.execute({
            sql: `INSERT INTO entity_lineage (
                    id, batch_id, action_id, source_entity_id, target_entity_id,
                    lineage_kind, fallback_reason
                  ) VALUES (?, ?, ?, ?, ?, 'split', 'exact locked payload assignment')`,
            args: [
              stableId("taxonomy-lineage", {
                batchId: resolved.batchId,
                donorId: output.donorId,
                outputId: output.id,
              }),
              resolved.batchId,
              actionId,
              output.donorId,
              output.id,
            ],
          }),
          `insert locked lineage ${output.id}`,
        );
      }
    }

    for (const assignment of resolved.assignments.moves) {
      await moveLockedAssignment(transaction, assignment);
    }

    for (const donor of resolved.donors.filter((item) => item.retire)) {
      await expectOne(
        await transaction.execute({
          sql: "DELETE FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          args: [donor.id, donor.makerId],
        }),
        `remove retired donor maker ${donor.id}`,
      );
      await expectOne(
        await transaction.execute({
          sql: `UPDATE entity_publications
                   SET status = 'retired', blockers_json = '["taxonomy_split_source"]',
                       approved_content_hash = NULL, reviewed_content_revision = NULL,
                       reviewed_contract_version = NULL, reviewed_by = NULL,
                       reviewed_at = NULL, published_at = NULL, updated_at = datetime('now')
                 WHERE entity_id = ?`,
          args: [donor.id],
        }),
        `retire locked donor ${donor.id}`,
      );
    }

    const routeRows = [
      {
        output: resolved.outputs[0],
        sourcePath: "/pen/威迪文-waterman-查尔斯顿-hemisphere",
        targetPath: "/pen/waterman-hemisphere",
      },
      {
        output: resolved.outputs[6],
        sourcePath: "/pen/奥罗拉-aurora",
        targetPath: "/brand/aurora",
      },
    ];
    for (const route of routeRows) {
      await expectOne(
        await transaction.execute({
          sql: `INSERT INTO entity_redirects (
                  id, batch_id, action_id, source_path, target_path,
                  redirect_kind, fallback_reason
                ) VALUES (?, ?, ?, ?, ?, 'permanent', 'activate only when target is public')`,
          args: [
            stableId("taxonomy-redirect", {
              batchId: resolved.batchId,
              sourcePath: route.sourcePath,
            }),
            resolved.batchId,
            lockedActionId(resolved, route.output),
            route.sourcePath,
            route.targetPath,
          ],
        }),
        `insert locked redirect ${route.sourcePath}`,
      );
    }

    for (const output of resolved.outputs) {
      const makers = await rows(
        transaction,
        "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [output.id],
      );
      if (
        makers.length !== 1 ||
        rowString(makers[0], "target_id") !== output.makerId
      ) {
        throw new Error(
          `Locked output ${output.id} lost canonical maker parity.`,
        );
      }
      const reviews = await rows(
        transaction,
        "SELECT id FROM entity_content_reviews WHERE entity_id = ?",
        [output.id],
      );
      if (output.id !== LOCKED_SPLIT_DONORS[0].id && reviews.length !== 0) {
        throw new Error(`Locked output ${output.id} inherited donor reviews.`);
      }
      await expectOne(
        await transaction.execute({
          sql: "UPDATE taxonomy_actions SET status = 'applied', updated_at = datetime('now') WHERE id = ? AND status = 'staged'",
          args: [lockedActionId(resolved, output)],
        }),
        `complete locked action ${output.sourceRowKey}`,
      );
    }

    const outputIds = resolved.outputs.map((item) => item.id);
    const placeholders = outputIds.map(() => "?").join(", ");
    if (
      (
        await rows(
          transaction,
          `SELECT id FROM public_entities WHERE id IN (${placeholders})`,
          outputIds,
        )
      ).length !== 0
    ) {
      throw new Error(
        "Locked split output became public without fresh review.",
      );
    }
    const foreignKeyErrors = await rows(
      transaction,
      "PRAGMA foreign_key_check",
    );
    if (foreignKeyErrors.length !== 0)
      throw new Error("Locked split produced a foreign-key orphan.");
    await expectOne(
      await transaction.execute({
        sql: "UPDATE taxonomy_batches SET status = 'applied', updated_at = datetime('now') WHERE id = ? AND status = 'staged'",
        args: [resolved.batchId],
      }),
      "complete locked split batch",
    );
    await transaction.commit();
    return {
      applied: true,
      replay: "applied",
      batchId: resolved.batchId,
      sourceChecksum: resolved.sourceChecksum,
      actionCounts: emptyActionCounts(),
      splitCount: 4,
      outputCount: 8,
    };
  } catch (error) {
    await rollbackQuietly(transaction);
    throw error;
  }
}

export function applyTaxonomyPlan(
  db: Pick<Client, "transaction">,
  resolved: ResolvedTaxonomyPlan,
): Promise<ApplyTaxonomyResult>;
export function applyTaxonomyPlan(
  db: Pick<Client, "transaction">,
  resolved: ResolvedLockedSplitPlan,
): Promise<ApplyTaxonomyResult>;
export function applyTaxonomyPlan(
  db: Pick<Client, "transaction">,
  resolved: ResolvedTaxonomyPlan | ResolvedLockedSplitPlan,
): Promise<ApplyTaxonomyResult> {
  return resolved.scope === "locked_split"
    ? applyLockedSplitTaxonomyPlan(db, resolved)
    : applyNonSplitTaxonomyPlan(db, resolved);
}
