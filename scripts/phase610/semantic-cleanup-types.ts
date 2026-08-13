export type Phase610Dimension = "introduction" | "maintenance";

export interface Phase610TextReplacement {
  readonly oldText: string;
  readonly newText: string;
  readonly evidenceLocators: readonly string[];
  readonly researchUrls?: readonly string[];
}

export interface Phase610SemanticPatch {
  readonly manifestIndex: number;
  readonly entityId: string;
  readonly brandEntityId: string;
  readonly slug: string;
  readonly expectedName: string;
  readonly nextName?: string;
  readonly expectedStoryTitle: string;
  readonly nextStoryTitle?: string;
  readonly expectedSourceMarker: string;
  readonly expectedBodySha256: string;
  readonly dimensions: readonly Phase610Dimension[];
  readonly defectCodes: readonly string[];
  readonly replacements: readonly Phase610TextReplacement[];
}
