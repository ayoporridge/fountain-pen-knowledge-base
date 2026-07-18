import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type PrimaryAction =
  | "create"
  | "merge"
  | "split"
  | "rename"
  | "alias"
  | "retire";
export type ExecutionState = "apply" | "gated" | "defer";
export type TaxonomyReconciliationScope = "non_split" | "locked_split" | "full";
export type VariantDisposition =
  | "none"
  | "alias_only"
  | "attach_as_variant"
  | "attach_as_edition"
  | "identity_pending";

export interface CanonicalIdentity {
  entityId: string;
  type: "pen";
  slug: string;
  name: string;
  makerId: string;
}

export interface AtomicIdentityAction {
  kind:
    | "split_retain_as"
    | "split_create"
    | "retire_mixed"
    | "retire_generic"
    | "create_from_research";
  sourceId: string | null;
  targetId: string | null;
  targetType: "pen";
  targetSlug: string | null;
}

export interface TaxonomyDecision {
  sourceRowKey: string;
  title: string;
  region: string;
  era: string;
  status: "A" | "BM" | "BM/A" | "G/M" | "M" | "S" | "S/M";
  priority: "P0" | "P1" | "P2" | "P3";
  primaryAction: PrimaryAction;
  executionState: ExecutionState;
  blocker: string | null;
  canonical: CanonicalIdentity | null;
  variantDisposition: VariantDisposition;
  evidenceRefs: string[];
  atomicActions: AtomicIdentityAction[];
}

export interface OutOfMatrixAction {
  key: string;
  title: string;
  brand: string;
  priority: "P0" | "P1" | "P2";
  primaryAction: PrimaryAction;
  executionState: "gated" | "defer";
  blocker: string;
  canonical: null;
  evidenceRefs: string[];
}

export interface PayloadAssignment {
  donorId: string;
  surface:
    | "story"
    | "spec"
    | "claim"
    | "citation"
    | "source"
    | "media"
    | "tag"
    | "relation"
    | "reference"
    | "variant"
    | "review";
  ordinal: number;
  itemId: string | null;
  slotKey: string | null;
  evidenceChecksum: string;
  requiresOwnedCopyResolution: boolean;
  disposition: "supported_output" | "retired_source" | "pending_conflict";
  targetId: string | null;
}

interface EntitySets {
  brandIds: string[];
  penIds: string[];
  pageIds: string[];
}

export interface TaxonomyPlan {
  schemaVersion: "1.0";
  source: {
    matrixPath: string;
    matrixSha256: string;
    addendumPath: string;
    addendumSha256: string;
    inventorySnapshotChecksum: string;
  };
  matrixChecksum: string;
  matrix: TaxonomyDecision[];
  outOfMatrixActions: OutOfMatrixAction[];
  stableSets: { before: EntitySets; after: EntitySets };
  payloadAssignments: PayloadAssignment[];
  lockedRoutes: Array<{
    sourcePath: string;
    policy: "redirect_if_target_public" | "always_404";
    targetPath: string | null;
  }>;
}

export interface TaxonomyReconciliation {
  scope: TaxonomyReconciliationScope;
  sourceRowKeys: string[];
  priorityCounts: Record<"P0" | "P1" | "P2" | "P3", number>;
  statusCounts: Record<"A" | "BM" | "BM/A" | "G/M" | "M" | "S" | "S/M", number>;
  primaryActionCounts: Record<PrimaryAction, number>;
  executionStateCounts: Record<ExecutionState, number>;
  net: { brand: number; pen: number; page: number };
  declaredNet: { brand: number; pen: number; page: number };
  unresolvedPayloadSlots: number;
}

const DEFAULT_MANIFEST_PATH = path.join(
  process.cwd(),
  "data",
  "taxonomy",
  "v1.2-phase21.json",
);
const ENTITY_ID = /^[A-Za-z0-9_-]{12}$/;
const HASH = /^sha256:[a-f0-9]{64}$/;
const PRIORITIES = ["P0", "P1", "P2", "P3"] as const;
const STATUSES = ["A", "BM", "BM/A", "G/M", "M", "S", "S/M"] as const;
const ACTIONS = [
  "create",
  "merge",
  "split",
  "rename",
  "alias",
  "retire",
] as const;
const EXECUTION_STATES = ["apply", "gated", "defer"] as const;
const VARIANT_DISPOSITIONS = [
  "none",
  "alias_only",
  "attach_as_variant",
  "attach_as_edition",
  "identity_pending",
] as const;
const ATOMIC_KINDS = [
  "split_retain_as",
  "split_create",
  "retire_mixed",
  "retire_generic",
  "create_from_research",
] as const;
const PAYLOAD_SURFACES = [
  "story",
  "spec",
  "claim",
  "citation",
  "source",
  "media",
  "tag",
  "relation",
  "reference",
  "variant",
  "review",
] as const;
const PAYLOAD_DISPOSITIONS = [
  "supported_output",
  "retired_source",
  "pending_conflict",
] as const;
const LOCKED_OUTPUTS = new Map([
  [
    "法国、英国与美国::Waterman Hémisphère",
    ["gwKClNnwt3V3", "waterman-hemisphere", "zkAu9PePDdqJ"],
  ],
  [
    "法国、英国与美国::Waterman Charleston",
    ["4dcEbeUCjxH-", "waterman-charleston", "zkAu9PePDdqJ"],
  ],
  ["台湾::Opus 88 Demo", ["CqFpmT3l4Mtm", "opus-88-demo", "I6tjleAZx9RU"]],
  ["台湾::Opus 88 Koloro", ["0CNmbxM54-GA", "opus-88-koloro", "I6tjleAZx9RU"]],
  [
    "意大利::Leonardo Furore",
    ["ixul2gTcJ06B", "leonardo-furore", "g5r4udSOYhI5"],
  ],
  [
    "意大利::Leonardo Momento Magico",
    ["UE5otlwKUfp9", "leonardo-momento-magico", "g5r4udSOYhI5"],
  ],
  ["意大利::Aurora 88", ["5CcEDOz9jiUg", "aurora-88", "CJXe8UpnkHLJ"]],
  ["意大利::Aurora Optima", ["5waoVLPHU2Pt", "aurora-optima", "CJXe8UpnkHLJ"]],
] as const);
const LOCKED_SPLIT_SOURCE_ROW_KEYS: ReadonlySet<string> = new Set(
  LOCKED_OUTPUTS.keys(),
);
const LOCKED_SPLIT_DONOR_IDS = new Set([
  "gwKClNnwt3V3",
  "dTCUDu03vrI6",
  "s0HAxT1gsHxh",
  "G9ptvLpfyzNQ",
]);
const LOCKED_ROUTES: TaxonomyPlan["lockedRoutes"] = [
  {
    sourcePath: "/pen/威迪文-waterman-查尔斯顿-hemisphere",
    policy: "redirect_if_target_public",
    targetPath: "/pen/waterman-hemisphere",
  },
  {
    sourcePath: "/pen/opus-88-demo-kolora",
    policy: "always_404",
    targetPath: null,
  },
  {
    sourcePath: "/pen/leonardo-furore-momento-magico",
    policy: "always_404",
    targetPath: null,
  },
  {
    sourcePath: "/pen/奥罗拉-aurora",
    policy: "redirect_if_target_public",
    targetPath: "/brand/aurora",
  },
];

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

function checksum(value: unknown): string {
  return `sha256:${createHash("sha256").update(stableJson(value)).digest("hex")}`;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string,
): void {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  const missing = allowed.filter((key) => !(key in value));
  if (unknown.length || missing.length) {
    throw new Error(
      `${label} keys invalid; unknown=[${unknown.join(",")}], missing=[${missing.join(",")}]`,
    );
  }
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  return value === null ? null : stringValue(value, label);
}

function enumValue<const T extends readonly string[]>(
  value: unknown,
  values: T,
  label: string,
): T[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    throw new Error(`${label} has unknown value ${String(value)}`);
  }
  return value as T[number];
}

function arrayValue(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value;
}

function stringArray(value: unknown, label: string): string[] {
  return arrayValue(value, label).map((item, index) =>
    stringValue(item, `${label}[${index}]`),
  );
}

function unique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} contains duplicate values`);
  }
}

function evidenceRefs(value: unknown, label: string): string[] {
  const refs = stringArray(value, label);
  if (refs.length === 0 || refs.some((ref) => !/^https:\/\//.test(ref))) {
    throw new Error(`${label} must contain direct HTTPS evidence references`);
  }
  unique(refs, label);
  return refs;
}

function canonicalIdentity(
  value: unknown,
  label: string,
): CanonicalIdentity | null {
  if (value === null) return null;
  const item = record(value, label);
  exactKeys(item, ["entityId", "type", "slug", "name", "makerId"], label);
  const entityId = stringValue(item.entityId, `${label}.entityId`);
  const makerId = stringValue(item.makerId, `${label}.makerId`);
  if (!ENTITY_ID.test(entityId) || !ENTITY_ID.test(makerId)) {
    throw new Error(`${label} contains an unknown ID`);
  }
  if (item.type !== "pen") throw new Error(`${label}.type must be pen`);
  return {
    entityId,
    type: "pen",
    slug: stringValue(item.slug, `${label}.slug`),
    name: stringValue(item.name, `${label}.name`),
    makerId,
  };
}

function atomicAction(value: unknown, label: string): AtomicIdentityAction {
  const item = record(value, label);
  exactKeys(
    item,
    ["kind", "sourceId", "targetId", "targetType", "targetSlug"],
    label,
  );
  const sourceId = nullableString(item.sourceId, `${label}.sourceId`);
  const targetId = nullableString(item.targetId, `${label}.targetId`);
  if (sourceId && !ENTITY_ID.test(sourceId))
    throw new Error(`${label} has unknown source ID`);
  if (targetId && !ENTITY_ID.test(targetId))
    throw new Error(`${label} has unknown target ID`);
  if (item.targetType !== "pen")
    throw new Error(`${label}.targetType must be pen`);
  return {
    kind: enumValue(item.kind, ATOMIC_KINDS, `${label}.kind`),
    sourceId,
    targetId,
    targetType: "pen",
    targetSlug: nullableString(item.targetSlug, `${label}.targetSlug`),
  };
}

function decision(value: unknown, index: number): TaxonomyDecision {
  const label = `matrix[${index}]`;
  const item = record(value, label);
  exactKeys(
    item,
    [
      "sourceRowKey",
      "title",
      "region",
      "era",
      "status",
      "priority",
      "primaryAction",
      "executionState",
      "blocker",
      "canonical",
      "variantDisposition",
      "evidenceRefs",
      "atomicActions",
    ],
    label,
  );
  const title = stringValue(item.title, `${label}.title`);
  const region = stringValue(item.region, `${label}.region`);
  const sourceRowKey = stringValue(item.sourceRowKey, `${label}.sourceRowKey`);
  if (sourceRowKey !== `${region}::${title}`) {
    throw new Error(`${label} sourceRowKey does not match region/title`);
  }
  const executionState = enumValue(
    item.executionState,
    EXECUTION_STATES,
    `${label}.executionState`,
  );
  const blocker = nullableString(item.blocker, `${label}.blocker`);
  const canonical = canonicalIdentity(item.canonical, `${label}.canonical`);
  const atomicActions = arrayValue(
    item.atomicActions,
    `${label}.atomicActions`,
  ).map((action, actionIndex) =>
    atomicAction(action, `${label}.atomicActions[${actionIndex}]`),
  );
  if (executionState === "apply") {
    if (!canonical || blocker !== null || atomicActions.length === 0) {
      throw new Error(
        `${label} apply decision requires canonical identity and atomic actions`,
      );
    }
  } else if (!blocker || canonical !== null || atomicActions.length !== 0) {
    throw new Error(
      `${label} gated/defer decision must be blocked and non-mutating`,
    );
  }
  return {
    sourceRowKey,
    title,
    region,
    era: stringValue(item.era, `${label}.era`),
    status: enumValue(item.status, STATUSES, `${label}.status`),
    priority: enumValue(item.priority, PRIORITIES, `${label}.priority`),
    primaryAction: enumValue(
      item.primaryAction,
      ACTIONS,
      `${label}.primaryAction`,
    ),
    executionState,
    blocker,
    canonical,
    variantDisposition: enumValue(
      item.variantDisposition,
      VARIANT_DISPOSITIONS,
      `${label}.variantDisposition`,
    ),
    evidenceRefs: evidenceRefs(item.evidenceRefs, `${label}.evidenceRefs`),
    atomicActions,
  };
}

function addendumAction(value: unknown, index: number): OutOfMatrixAction {
  const label = `outOfMatrixActions[${index}]`;
  const item = record(value, label);
  exactKeys(
    item,
    [
      "key",
      "title",
      "brand",
      "priority",
      "primaryAction",
      "executionState",
      "blocker",
      "canonical",
      "evidenceRefs",
    ],
    label,
  );
  if (item.canonical !== null)
    throw new Error(`${label}.canonical must remain unresolved`);
  return {
    key: stringValue(item.key, `${label}.key`),
    title: stringValue(item.title, `${label}.title`),
    brand: stringValue(item.brand, `${label}.brand`),
    priority: enumValue(
      item.priority,
      ["P0", "P1", "P2"] as const,
      `${label}.priority`,
    ),
    primaryAction: enumValue(
      item.primaryAction,
      ACTIONS,
      `${label}.primaryAction`,
    ),
    executionState: enumValue(
      item.executionState,
      ["gated", "defer"] as const,
      `${label}.executionState`,
    ),
    blocker: stringValue(item.blocker, `${label}.blocker`),
    canonical: null,
    evidenceRefs: evidenceRefs(item.evidenceRefs, `${label}.evidenceRefs`),
  };
}

function entitySets(value: unknown, label: string): EntitySets {
  const item = record(value, label);
  exactKeys(item, ["brandIds", "penIds", "pageIds"], label);
  const brandIds = stringArray(item.brandIds, `${label}.brandIds`);
  const penIds = stringArray(item.penIds, `${label}.penIds`);
  const pageIds = stringArray(item.pageIds, `${label}.pageIds`);
  for (const [name, ids] of Object.entries({ brandIds, penIds, pageIds })) {
    unique(ids, `${label}.${name}`);
    if (ids.some((id) => !ENTITY_ID.test(id)))
      throw new Error(`${label}.${name} has unknown ID`);
  }
  const expectedPages = [...brandIds, ...penIds];
  if (!sameSet(pageIds, expectedPages))
    throw new Error(`${label}.pageIds do not reconcile`);
  return { brandIds, penIds, pageIds };
}

function payloadAssignment(value: unknown, index: number): PayloadAssignment {
  const label = `payloadAssignments[${index}]`;
  const item = record(value, label);
  exactKeys(
    item,
    [
      "donorId",
      "surface",
      "ordinal",
      "itemId",
      "slotKey",
      "evidenceChecksum",
      "requiresOwnedCopyResolution",
      "disposition",
      "targetId",
    ],
    label,
  );
  const donorId = stringValue(item.donorId, `${label}.donorId`);
  if (!ENTITY_ID.test(donorId))
    throw new Error(`${label}.donorId has unknown ID`);
  const ordinal = item.ordinal;
  if (!Number.isSafeInteger(ordinal) || (ordinal as number) < 1) {
    throw new Error(`${label}.ordinal must be a positive integer`);
  }
  const itemId = nullableString(item.itemId, `${label}.itemId`);
  const slotKey = nullableString(item.slotKey, `${label}.slotKey`);
  const requiresOwnedCopyResolution = item.requiresOwnedCopyResolution;
  if (typeof requiresOwnedCopyResolution !== "boolean") {
    throw new Error(`${label}.requiresOwnedCopyResolution must be boolean`);
  }
  const disposition = enumValue(
    item.disposition,
    PAYLOAD_DISPOSITIONS,
    `${label}.disposition`,
  );
  const targetId = nullableString(item.targetId, `${label}.targetId`);
  if (targetId && !ENTITY_ID.test(targetId))
    throw new Error(`${label}.targetId has unknown ID`);
  if (
    !HASH.test(stringValue(item.evidenceChecksum, `${label}.evidenceChecksum`))
  ) {
    throw new Error(`${label}.evidenceChecksum is invalid`);
  }
  if (itemId && slotKey)
    throw new Error(`${label} cannot have both itemId and slotKey`);
  if (!itemId && !slotKey)
    throw new Error(`${label} requires itemId or an unresolved slotKey`);
  if (slotKey) {
    const expectedPrefix = `phase19-slot:${donorId}:`;
    if (
      !slotKey.startsWith(expectedPrefix) ||
      disposition !== "pending_conflict" ||
      targetId !== null ||
      requiresOwnedCopyResolution !== true
    ) {
      throw new Error(
        `${label} unresolved payload slot violates owned-copy boundary`,
      );
    }
  } else if (requiresOwnedCopyResolution) {
    throw new Error(
      `${label} exact item ID cannot require owned-copy resolution`,
    );
  }
  if (disposition === "supported_output" && targetId === null) {
    throw new Error(`${label} supported output requires a target ID`);
  }
  if (disposition !== "supported_output" && targetId !== null) {
    throw new Error(`${label} non-output disposition cannot have a target ID`);
  }
  return {
    donorId,
    surface: enumValue(item.surface, PAYLOAD_SURFACES, `${label}.surface`),
    ordinal: ordinal as number,
    itemId,
    slotKey,
    evidenceChecksum: item.evidenceChecksum as string,
    requiresOwnedCopyResolution,
    disposition,
    targetId,
  };
}

function route(
  value: unknown,
  index: number,
): TaxonomyPlan["lockedRoutes"][number] {
  const label = `lockedRoutes[${index}]`;
  const item = record(value, label);
  exactKeys(item, ["sourcePath", "policy", "targetPath"], label);
  return {
    sourcePath: stringValue(item.sourcePath, `${label}.sourcePath`),
    policy: enumValue(
      item.policy,
      ["redirect_if_target_public", "always_404"] as const,
      `${label}.policy`,
    ),
    targetPath: nullableString(item.targetPath, `${label}.targetPath`),
  };
}

function sourceMetadata(value: unknown): TaxonomyPlan["source"] {
  const item = record(value, "source");
  exactKeys(
    item,
    [
      "matrixPath",
      "matrixSha256",
      "addendumPath",
      "addendumSha256",
      "inventorySnapshotChecksum",
    ],
    "source",
  );
  const result = {
    matrixPath: stringValue(item.matrixPath, "source.matrixPath"),
    matrixSha256: stringValue(item.matrixSha256, "source.matrixSha256"),
    addendumPath: stringValue(item.addendumPath, "source.addendumPath"),
    addendumSha256: stringValue(item.addendumSha256, "source.addendumSha256"),
    inventorySnapshotChecksum: stringValue(
      item.inventorySnapshotChecksum,
      "source.inventorySnapshotChecksum",
    ),
  };
  if (
    ![
      result.matrixSha256,
      result.addendumSha256,
      result.inventorySnapshotChecksum,
    ].every((hash) => HASH.test(hash))
  ) {
    throw new Error("source checksum is invalid");
  }
  return result;
}

function sameSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((item) => rightSet.has(item));
}

function assertExactCounts(plan: TaxonomyPlan): void {
  const priorities = countValues(
    plan.matrix.map((item) => item.priority),
    PRIORITIES,
  );
  const statuses = countValues(
    plan.matrix.map((item) => item.status),
    STATUSES,
  );
  if (
    JSON.stringify(priorities) !==
    JSON.stringify({ P0: 13, P1: 54, P2: 40, P3: 2 })
  ) {
    throw new Error(
      "matrix priority totals do not match the reviewed denominator",
    );
  }
  if (
    JSON.stringify(statuses) !==
    JSON.stringify({ A: 1, BM: 42, "BM/A": 1, "G/M": 1, M: 55, S: 5, "S/M": 4 })
  ) {
    throw new Error(
      "matrix status totals do not match the reviewed denominator",
    );
  }
}

function countValues<const T extends readonly string[]>(
  values: readonly string[],
  keys: T,
): Record<T[number], number> {
  return Object.fromEntries(
    keys.map((key) => [key, values.filter((value) => value === key).length]),
  ) as Record<T[number], number>;
}

function assertLockedContract(plan: TaxonomyPlan): void {
  for (const [sourceRowKey, [entityId, slug, makerId]] of LOCKED_OUTPUTS) {
    const item = plan.matrix.find(
      (candidate) => candidate.sourceRowKey === sourceRowKey,
    );
    if (
      !item ||
      item.executionState !== "apply" ||
      item.canonical?.entityId !== entityId ||
      item.canonical.slug !== slug ||
      item.canonical.makerId !== makerId
    ) {
      throw new Error(`locked identity mismatch for ${sourceRowKey}`);
    }
    if (entityId !== "gwKClNnwt3V3") {
      const derivedId = createHash("sha256")
        .update(`phase21:pen:${slug}`)
        .digest("base64url")
        .slice(0, 12);
      if (derivedId !== entityId)
        throw new Error(`locked derived ID mismatch for ${slug}`);
    }
  }
  if (stableJson(plan.lockedRoutes) !== stableJson(LOCKED_ROUTES)) {
    throw new Error("locked route contract mismatch");
  }
}

function parsePlan(raw: unknown): TaxonomyPlan {
  const root = record(raw, "taxonomy plan");
  exactKeys(
    root,
    [
      "schemaVersion",
      "source",
      "matrixChecksum",
      "matrix",
      "outOfMatrixActions",
      "stableSets",
      "payloadAssignments",
      "lockedRoutes",
    ],
    "taxonomy plan",
  );
  if (root.schemaVersion !== "1.0")
    throw new Error("unsupported taxonomy schemaVersion");
  const matrixChecksum = stringValue(root.matrixChecksum, "matrixChecksum");
  const computedChecksum = checksum(root.matrix);
  if (matrixChecksum !== computedChecksum) {
    throw new Error(
      `matrix checksum mismatch: expected ${matrixChecksum}, got ${computedChecksum}`,
    );
  }
  const matrix = arrayValue(root.matrix, "matrix").map(decision);
  unique(
    matrix.map((item) => item.sourceRowKey),
    "matrix sourceRowKey",
  );
  if (matrix.length !== 109)
    throw new Error(
      `matrix must contain exactly 109 rows, got ${matrix.length}`,
    );
  const outOfMatrixActions = arrayValue(
    root.outOfMatrixActions,
    "outOfMatrixActions",
  ).map(addendumAction);
  unique(
    outOfMatrixActions.map((item) => item.key),
    "outOfMatrixActions key",
  );
  const stableSetRoot = record(root.stableSets, "stableSets");
  exactKeys(stableSetRoot, ["before", "after"], "stableSets");
  const stableSets = {
    before: entitySets(stableSetRoot.before, "stableSets.before"),
    after: entitySets(stableSetRoot.after, "stableSets.after"),
  };
  const payloadAssignments = arrayValue(
    root.payloadAssignments,
    "payloadAssignments",
  ).map(payloadAssignment);
  const assignmentKeys = payloadAssignments.map(
    (item) => item.itemId ?? item.slotKey ?? "",
  );
  if (new Set(assignmentKeys).size !== assignmentKeys.length) {
    throw new Error("payload assignment duplicate item or slot key");
  }
  const outputIds = new Set(stableSets.after.penIds);
  if (
    payloadAssignments.some(
      (item) =>
        item.disposition === "supported_output" &&
        !outputIds.has(item.targetId ?? ""),
    )
  ) {
    throw new Error("payload assignment references an unknown output ID");
  }
  const plan: TaxonomyPlan = {
    schemaVersion: "1.0",
    source: sourceMetadata(root.source),
    matrixChecksum,
    matrix,
    outOfMatrixActions,
    stableSets,
    payloadAssignments,
    lockedRoutes: arrayValue(root.lockedRoutes, "lockedRoutes").map(route),
  };
  assertExactCounts(plan);
  assertLockedContract(plan);
  return plan;
}

export function loadTaxonomyPlan(raw?: unknown): TaxonomyPlan {
  const input =
    raw ?? JSON.parse(fs.readFileSync(DEFAULT_MANIFEST_PATH, "utf8"));
  return parsePlan(input);
}

function applyAtomicActions(
  plan: TaxonomyPlan,
  decisions: readonly TaxonomyDecision[],
): string[] {
  const penIds = new Set(plan.stableSets.before.penIds);
  for (const decision of decisions) {
    for (const action of decision.atomicActions) {
      if (action.kind === "split_retain_as") {
        if (
          !action.sourceId ||
          action.sourceId !== action.targetId ||
          !penIds.has(action.sourceId)
        ) {
          throw new Error(
            `ambiguous split retain action in ${decision.sourceRowKey}`,
          );
        }
        continue;
      }
      if (action.kind === "retire_mixed" || action.kind === "retire_generic") {
        if (
          !action.sourceId ||
          action.targetId !== null ||
          !penIds.delete(action.sourceId)
        ) {
          throw new Error(`invalid retire action in ${decision.sourceRowKey}`);
        }
        continue;
      }
      if (
        !action.targetId ||
        action.sourceId !== null ||
        penIds.has(action.targetId)
      ) {
        throw new Error(`invalid create action in ${decision.sourceRowKey}`);
      }
      penIds.add(action.targetId);
    }
  }
  return [...penIds];
}

function decisionsForScope(
  plan: TaxonomyPlan,
  scope: TaxonomyReconciliationScope,
): TaxonomyDecision[] {
  if (scope === "full") return plan.matrix;
  return plan.matrix.filter((decision) =>
    scope === "locked_split"
      ? LOCKED_SPLIT_SOURCE_ROW_KEYS.has(decision.sourceRowKey)
      : !LOCKED_SPLIT_SOURCE_ROW_KEYS.has(decision.sourceRowKey),
  );
}

function payloadAssignmentsForScope(
  plan: TaxonomyPlan,
  scope: TaxonomyReconciliationScope,
): PayloadAssignment[] {
  if (scope === "full") return plan.payloadAssignments;
  return plan.payloadAssignments.filter((assignment) =>
    scope === "locked_split"
      ? LOCKED_SPLIT_DONOR_IDS.has(assignment.donorId)
      : !LOCKED_SPLIT_DONOR_IDS.has(assignment.donorId),
  );
}

export function reconcileTaxonomyPlan(
  plan: TaxonomyPlan,
  options: { scope?: TaxonomyReconciliationScope } = {},
): TaxonomyReconciliation {
  const scope = options.scope ?? "full";
  if (!(["non_split", "locked_split", "full"] as const).includes(scope)) {
    throw new Error(`unknown taxonomy reconciliation scope: ${String(scope)}`);
  }
  const decisions = decisionsForScope(plan, scope);
  const unresolvedPayloadSlots = payloadAssignmentsForScope(plan, scope).filter(
    (item) => item.slotKey && item.requiresOwnedCopyResolution,
  ).length;
  if (unresolvedPayloadSlots > 0) {
    throw new Error(
      `${unresolvedPayloadSlots} payload slots are unresolved in ${scope} scope; resolve exact IDs from the Phase 21 owned copy before apply`,
    );
  }
  const fullDeclaredAfterPens = applyAtomicActions(plan, plan.matrix);
  if (!sameSet(fullDeclaredAfterPens, plan.stableSets.after.penIds)) {
    throw new Error(
      "atomic actions do not reconcile with stable after pen IDs",
    );
  }
  if (
    !sameSet(plan.stableSets.before.brandIds, plan.stableSets.after.brandIds)
  ) {
    throw new Error(
      "brand stable sets changed without an explicit atomic action",
    );
  }
  const declaredAfterPens =
    scope === "full"
      ? fullDeclaredAfterPens
      : applyAtomicActions(plan, decisions);
  const declaredNet = {
    brand: 0,
    pen: declaredAfterPens.length - plan.stableSets.before.penIds.length,
    page:
      plan.stableSets.before.brandIds.length +
      declaredAfterPens.length -
      plan.stableSets.before.pageIds.length,
  };
  const net =
    scope === "full"
      ? {
          brand:
            plan.stableSets.after.brandIds.length -
            plan.stableSets.before.brandIds.length,
          pen:
            plan.stableSets.after.penIds.length -
            plan.stableSets.before.penIds.length,
          page:
            plan.stableSets.after.pageIds.length -
            plan.stableSets.before.pageIds.length,
        }
      : declaredNet;
  if (stableJson(net) !== stableJson(declaredNet)) {
    throw new Error("declared atomic net does not match stable-set net");
  }
  return {
    scope,
    sourceRowKeys: decisions.map((decision) => decision.sourceRowKey),
    priorityCounts: countValues(
      decisions.map((item) => item.priority),
      PRIORITIES,
    ),
    statusCounts: countValues(
      decisions.map((item) => item.status),
      STATUSES,
    ),
    primaryActionCounts: countValues(
      decisions.map((item) => item.primaryAction),
      ACTIONS,
    ),
    executionStateCounts: countValues(
      decisions.map((item) => item.executionState),
      EXECUTION_STATES,
    ),
    net,
    declaredNet,
    unresolvedPayloadSlots,
  };
}
