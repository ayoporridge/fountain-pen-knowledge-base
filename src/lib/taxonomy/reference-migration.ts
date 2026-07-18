import type { PayloadAssignment } from "./identity-plan";

export interface ReferenceInventoryItem {
  donorId: string;
  surface: PayloadAssignment["surface"];
  itemId: string;
  rowId: string;
}

export interface ReferenceAssignmentBlocker {
  code: string;
  donorId: string | null;
  itemId: string | null;
  message: string;
}

export interface ResolvedReferenceAssignment extends ReferenceInventoryItem {
  disposition: PayloadAssignment["disposition"];
  targetId: string | null;
  evidenceChecksum: string;
}

export interface ReferenceAssignmentResolution {
  moves: ResolvedReferenceAssignment[];
  retained: ResolvedReferenceAssignment[];
  pending: ResolvedReferenceAssignment[];
  blockers: ReferenceAssignmentBlocker[];
}

export interface VariantHierarchyRow {
  id: string;
  modelEntityId: string;
  kind:
    | "variant"
    | "edition_group"
    | "color"
    | "material"
    | "nib"
    | "market_sku";
  parentId: string | null;
}

export interface ValidatedVariantHierarchy {
  modelEntityIds: Set<string>;
  variantIds: Set<string>;
}

function assignmentKey(
  value: Pick<ReferenceInventoryItem, "donorId" | "surface" | "itemId">,
): string {
  return `${value.donorId}\0${value.surface}\0${value.itemId}`;
}

function compareAssignments(
  left: ResolvedReferenceAssignment,
  right: ResolvedReferenceAssignment,
): number {
  return assignmentKey(left).localeCompare(assignmentKey(right));
}

export function resolveReferenceAssignments(
  assignments: readonly PayloadAssignment[],
  inventory: readonly ReferenceInventoryItem[],
  allowedTargetIds: ReadonlySet<string>,
): ReferenceAssignmentResolution {
  const blockers: ReferenceAssignmentBlocker[] = [];
  const inventoryByKey = new Map<string, ReferenceInventoryItem>();
  for (const item of inventory) {
    const key = assignmentKey(item);
    if (inventoryByKey.has(key)) {
      blockers.push({
        code: "ambiguous_payload_inventory",
        donorId: item.donorId,
        itemId: item.itemId,
        message: `Payload inventory contains duplicate ${item.surface} ${item.itemId}.`,
      });
    } else {
      inventoryByKey.set(key, item);
    }
  }

  const assignmentByKey = new Map<string, PayloadAssignment>();
  for (const assignment of assignments) {
    if (
      assignment.requiresOwnedCopyResolution ||
      assignment.itemId === null ||
      assignment.slotKey !== null
    ) {
      blockers.push({
        code: "unresolved_payload_slot",
        donorId: assignment.donorId,
        itemId: assignment.itemId,
        message: `Payload ${assignment.surface} slot requires an exact owned-copy ID.`,
      });
      continue;
    }
    const key = assignmentKey({
      donorId: assignment.donorId,
      surface: assignment.surface,
      itemId: assignment.itemId,
    });
    if (assignmentByKey.has(key)) {
      blockers.push({
        code: "ambiguous_payload_assignment",
        donorId: assignment.donorId,
        itemId: assignment.itemId,
        message: `Payload ${assignment.surface} ${assignment.itemId} is assigned more than once.`,
      });
      continue;
    }
    assignmentByKey.set(key, assignment);
  }

  const moves: ResolvedReferenceAssignment[] = [];
  const retained: ResolvedReferenceAssignment[] = [];
  const pending: ResolvedReferenceAssignment[] = [];
  for (const [key, item] of inventoryByKey) {
    const assignment = assignmentByKey.get(key);
    if (!assignment) {
      blockers.push({
        code: "unassigned_payload_item",
        donorId: item.donorId,
        itemId: item.itemId,
        message: `Payload ${item.surface} ${item.itemId} has no exact assignment.`,
      });
      continue;
    }
    if (
      assignment.disposition === "supported_output" &&
      (!assignment.targetId || !allowedTargetIds.has(assignment.targetId))
    ) {
      blockers.push({
        code: "unknown_payload_target",
        donorId: item.donorId,
        itemId: item.itemId,
        message: `Payload ${item.itemId} targets an unlocked output.`,
      });
      continue;
    }
    if (
      assignment.disposition !== "supported_output" &&
      assignment.targetId !== null
    ) {
      blockers.push({
        code: "ambiguous_payload_target",
        donorId: item.donorId,
        itemId: item.itemId,
        message: `Non-moving payload ${item.itemId} cannot declare a target.`,
      });
      continue;
    }
    if (
      item.surface === "review" &&
      assignment.disposition === "supported_output"
    ) {
      blockers.push({
        code: "review_inheritance_forbidden",
        donorId: item.donorId,
        itemId: item.itemId,
        message: `Review ${item.itemId} cannot move to a split output.`,
      });
      continue;
    }
    const resolved = {
      ...item,
      disposition: assignment.disposition,
      targetId: assignment.targetId,
      evidenceChecksum: assignment.evidenceChecksum,
    };
    if (assignment.disposition === "supported_output") moves.push(resolved);
    else if (assignment.disposition === "retired_source")
      retained.push(resolved);
    else pending.push(resolved);
  }

  for (const [key, assignment] of assignmentByKey) {
    if (inventoryByKey.has(key)) continue;
    blockers.push({
      code: "payload_item_not_found",
      donorId: assignment.donorId,
      itemId: assignment.itemId,
      message: `Assigned ${assignment.surface} ${assignment.itemId} is absent from the exact donor inventory.`,
    });
  }

  moves.sort(compareAssignments);
  retained.sort(compareAssignments);
  pending.sort(compareAssignments);
  blockers.sort((left, right) =>
    `${left.donorId ?? ""}:${left.itemId ?? ""}:${left.code}`.localeCompare(
      `${right.donorId ?? ""}:${right.itemId ?? ""}:${right.code}`,
    ),
  );
  return { moves, retained, pending, blockers };
}

export function validateVariantHierarchy(
  rows: readonly VariantHierarchyRow[],
): ValidatedVariantHierarchy {
  const byId = new Map<string, VariantHierarchyRow>();
  for (const row of rows) {
    if (byId.has(row.id)) throw new Error(`Duplicate variant ID ${row.id}.`);
    byId.set(row.id, row);
  }
  for (const row of rows) {
    if (!row.parentId) continue;
    const parent = byId.get(row.parentId);
    if (!parent) throw new Error(`Unknown variant parent ${row.parentId}.`);
    if (parent.modelEntityId !== row.modelEntityId) {
      throw new Error(`Variant ${row.id} crosses canonical model ownership.`);
    }
    if (parent.kind !== "edition_group") {
      throw new Error(`Variant ${row.id} parent must be an edition group.`);
    }
    if (
      !(["color", "material", "nib", "market_sku"] as const).includes(
        row.kind as "color" | "material" | "nib" | "market_sku",
      )
    ) {
      throw new Error(`Variant ${row.id} cannot be nested.`);
    }
  }
  return {
    modelEntityIds: new Set(rows.map((row) => row.modelEntityId)),
    variantIds: new Set(rows.map((row) => row.id)),
  };
}
