export type EntityQualityInput = {
  type: string;
  slug: string;
  name: string;
  source_file?: string | null;
  source_url?: string | null;
};

export function normalizeEntityName(value: string) {
  return value
    .toLowerCase()
    .replace(/[“”"‘’'`]/g, "")
    .replace(/[()[\]{}（）【】]/g, "")
    .replace(/[·•.,，。:：;；!?！？\s/_-]+/g, "")
    .trim();
}

export function getArticleLikeReasons(entity: EntityQualityInput) {
  if (entity.type !== "pen") return [];

  const reasons: string[] = [];
  const name = entity.name;
  const lower = name.toLowerCase();
  const sourceFile = entity.source_file || "";
  const sourceUrl = entity.source_url || "";

  if (/^[ivx]+[:：]\s/i.test(name)) {
    reasons.push("roman_number_article_series");
  }
  if (/^[a-z][.:：]\s/i.test(name)) {
    reasons.push("lettered_article_series");
  }
  if (name.includes(":") || name.includes("：")) {
    reasons.push("colon_title");
  }
  if (name.length >= 54) {
    reasons.push("long_title");
  }
  if (
    /\b(brands|pens|company|history|guide|review|profile|really|invent)\b/i.test(
      name,
    )
  ) {
    reasons.push("article_words");
  }
  if (/\b(who were they|oh my|what happened|what followed)\b/i.test(lower)) {
    reasons.push("essay_phrase");
  }
  if (/06-|crypt|articles?/i.test(`${sourceFile} ${sourceUrl}`)) {
    reasons.push("article_source_path");
  }

  return [...new Set(reasons)];
}

export function shouldReclassifyPenArticle(entity: EntityQualityInput) {
  const reasons = getArticleLikeReasons(entity);
  if (reasons.length === 0) return false;

  const sourceFile = entity.source_file || "";
  const sourceUrl = entity.source_url || "";
  const fromRichardPensProfile =
    /richardspens\.com\/ref\/profiles\//i.test(sourceUrl) ||
    /07-经典型号档案\//i.test(sourceFile);
  const fromRichardPensArticle =
    reasons.includes("article_source_path") ||
    /richardspens\.com\/ref\/crypt\//i.test(sourceUrl) ||
    /06-考古发掘\//i.test(sourceFile);

  if (fromRichardPensArticle && reasons.length >= 2) return true;
  if (
    fromRichardPensProfile &&
    reasons.some((reason) => reason !== "article_source_path")
  ) {
    return true;
  }

  return reasons.length >= 3;
}
