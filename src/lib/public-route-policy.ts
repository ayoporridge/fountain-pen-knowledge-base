/**
 * Imported routes kept for editorial recovery but never exposed as public
 * pages. This module is deliberately data-only so middleware can enforce the
 * HTTP boundary without importing the database layer.
 */
export const HIDDEN_ARTICLE_SLUGS = [
  "about-us",
  "contact-us",
  "demonstrator-pens",
  "hommel-s-meteor-fountain-pen-and-its-descendants",
  "how-to-disassemble-and-reassemble-a-parker-51",
  "parker-ivorine-pastel-and-moire-oh-my",
  "personalized-pens-the-malarkey-pen",
  "pilot-iroshizuku-ink-guide",
  "preserving-your-pens-dos-and-don-ts",
  "privacy-policy",
  "readme",
  "soviet-pens",
  "tribute-pens-and-reboots",
  "world-war-ii-and-the-fountain-pen",
  "万特佳",
  "公爵-duke",
  "半句",
  "永续",
  "犀飞利-sheaffer-品牌泛称",
  "灵感提炼",
] as const;

export const HIDDEN_CONCEPT_SLUGS = [
  "italic-nib",
  "music-nib",
  "rotary-filler",
] as const;
