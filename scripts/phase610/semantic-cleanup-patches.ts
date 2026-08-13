import { createHash } from "node:crypto";
import { phase610GroupAPatches } from "./semantic-cleanup-group-a";
import { phase610GroupBPatches } from "./semantic-cleanup-group-b";
import { phase610GroupCPatches } from "./semantic-cleanup-group-c";
import { phase610TerminalBodySha256ByEntityId } from "./semantic-cleanup-terminal-hashes";
import type {
  Phase610SemanticPatch,
  Phase610TextReplacement,
} from "./semantic-cleanup-types";

export const PHASE610_TARGET_COUNT = 126;

const CONSTRUCTION_PATTERNS = [
  /\bPhase\s*\d+/i,
  /\bmade_by\b/,
  /\bmodel_specs\b/,
  /\bcontent pack\b/i,
  /\bpayload\b/i,
  /我们|让我们|我长期使用|本文没有第一人称|本页没有第一人称/,
  /本文|本页/,
  /(?<!日)本站/,
] as const;

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

export function sha256Text(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function applyPhase610TextReplacements(
  body: string,
  replacements: readonly Phase610TextReplacement[],
): string {
  let next = body;
  for (const item of replacements) {
    const occurrences = count(next, item.oldText);
    if (occurrences !== 1) {
      throw new Error(
        `Phase 610 expected one exact old-text match, found ${occurrences}.`,
      );
    }
    if (!item.oldText.trim() || !item.newText.trim() || item.oldText === item.newText) {
      throw new Error("Phase 610 refuses an empty or unchanged text replacement.");
    }
    next = next.replace(item.oldText, item.newText);
  }
  return next;
}

function validatePatchSet(
  patches: readonly Phase610SemanticPatch[],
): readonly Phase610SemanticPatch[] {
  if (patches.length !== PHASE610_TARGET_COUNT) {
    throw new Error(
      `Phase 610 requires ${PHASE610_TARGET_COUNT} frozen targets, got ${patches.length}.`,
    );
  }
  const indices = new Set<number>();
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const nextNames = new Map<string, string>();
  for (const patch of patches) {
    if (
      indices.has(patch.manifestIndex) ||
      ids.has(patch.entityId) ||
      slugs.has(patch.slug)
    ) {
      throw new Error(`Phase 610 duplicate target: ${patch.entityId}.`);
    }
    indices.add(patch.manifestIndex);
    ids.add(patch.entityId);
    slugs.add(patch.slug);
    if (
      !patch.expectedBodySha256.match(/^[0-9a-f]{64}$/) ||
      !phase610TerminalBodySha256ByEntityId[patch.entityId]?.match(
        /^[0-9a-f]{64}$/,
      ) ||
      !patch.expectedSourceMarker.startsWith("curated-content:") ||
      patch.replacements.length === 0 ||
      patch.dimensions.length === 0 ||
      patch.defectCodes.length === 0
    ) {
      throw new Error(`Phase 610 invalid patch metadata: ${patch.entityId}.`);
    }
    const replacementTexts = new Set<string>();
    for (const item of patch.replacements) {
      if (
        !item.evidenceLocators.length ||
        replacementTexts.has(item.oldText) ||
        CONSTRUCTION_PATTERNS.some((pattern) => pattern.test(item.newText))
      ) {
        throw new Error(`Phase 610 invalid replacement: ${patch.entityId}.`);
      }
      replacementTexts.add(item.oldText);
    }
    const finalName = patch.nextName ?? patch.expectedName;
    const owner = nextNames.get(finalName.toLocaleLowerCase("zh-CN"));
    if (owner && owner !== patch.entityId) {
      throw new Error(`Phase 610 next-name collision: ${finalName}.`);
    }
    nextNames.set(finalName.toLocaleLowerCase("zh-CN"), patch.entityId);
    if (Boolean(patch.nextName) !== Boolean(patch.nextStoryTitle)) {
      throw new Error(`Phase 610 name/title patch must be paired: ${patch.entityId}.`);
    }
  }
  if (
    Object.keys(phase610TerminalBodySha256ByEntityId).length !==
    PHASE610_TARGET_COUNT
  ) {
    throw new Error("Phase 610 terminal body hash map must match the frozen scope.");
  }
  return patches;
}

export const phase610SemanticCleanupPatches = validatePatchSet(
  [
    ...phase610GroupAPatches,
    ...phase610GroupBPatches,
    ...phase610GroupCPatches,
  ].sort((left, right) => left.manifestIndex - right.manifestIndex),
);
