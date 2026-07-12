import { buildTagFilterSql, getTagFilterGroups } from "@/lib/browse-data";
import { queryAll } from "@/lib/db";
import { publicEntityFilter } from "@/lib/public-visibility";

export interface SearchIntent {
  filters: Record<string, string>;
  browseHref: string | null;
  terms: string[];
  modelNumbers: string[];
}

export interface PublicSearchResult {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  name_highlight: string;
  summary_highlight: string;
  body_highlight: string;
  rank: number;
}

export interface PublicSearchResponse {
  intent: SearchIntent;
  results: PublicSearchResult[];
  total: number;
  page: number;
  limit: number;
  query: string;
}

const STOP_PHRASES = [
  "有哪些选择",
  "有什么选择",
  "怎么选择",
  "怎么选",
  "推荐一下",
  "推荐",
  "到底",
  "一支笔",
  "钢笔",
  "预算",
];

const STOP_TOKENS = new Set([
  "的",
  "和",
  "与",
  "或",
  "是",
  "有",
  "有哪些",
  "什么",
  "选择",
  "以内",
  "以下",
  "元",
  "请问",
  "一下",
  "and",
  "or",
  "not",
]);

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
}

export function parseSearchIntent(rawQuery: string): SearchIntent {
  const normalized = normalize(rawQuery).slice(0, 100);
  const filters: Record<string, string> = {};
  let searchable = normalized;

  if (/(日系|日本(?:产|品牌|钢笔)?)/.test(searchable)) {
    filters.origin = "origin-japan";
    searchable = searchable.replace(/日系|日本(?:产|品牌|钢笔)?/g, " ");
  }
  if (/金尖|金笔尖/.test(searchable)) {
    filters.nib_material = "gold";
    searchable = searchable.replace(/金笔尖|金尖/g, " ");
  }

  const budgetMatch =
    searchable.match(
      /(?:预算\s*)?(\d{2,5})\s*(?:元)?\s*(?:以内|以下|之内|内)/,
    ) || searchable.match(/预算\s*(\d{2,5})/);
  if (budgetMatch) {
    const maxPrice = Number.parseInt(budgetMatch[1], 10);
    if (maxPrice > 0 && maxPrice <= 500) {
      filters.max_price = String(maxPrice);
      searchable = searchable.replace(budgetMatch[0], " ");
    }
  }

  for (const phrase of STOP_PHRASES)
    searchable = searchable.replaceAll(phrase, " ");
  const terms = searchable
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0 && !STOP_TOKENS.has(term))
    .slice(0, 10);
  const modelNumbers = terms.filter((term) => /^\d{2,6}[a-z]?$/i.test(term));

  if (filters.origin || filters.nib_material || filters.max_price) {
    filters.type = "pen";
  }
  const browseParams = new URLSearchParams();
  for (const key of ["type", "origin", "nib_material", "max_price"]) {
    if (filters[key]) browseParams.set(key, filters[key]);
  }

  return {
    filters,
    browseHref:
      browseParams.size > 0 ? `/browse?${browseParams.toString()}` : null,
    terms,
    modelNumbers,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(value: string, terms: string[]): string {
  const safe = escapeHtml(value);
  if (terms.length === 0) return safe;
  const pattern = terms.map(escapeRegExp).filter(Boolean).join("|");
  return pattern
    ? safe.replace(new RegExp(`(${pattern})`, "gi"), "<mark>$1</mark>")
    : safe;
}

function excerpt(value: string, terms: string[]): string {
  if (!value || terms.length === 0) return "";
  const normalized = normalize(value);
  const offsets = terms
    .map((term) => normalized.indexOf(term))
    .filter((offset) => offset >= 0);
  if (offsets.length === 0) return "";
  const start = Math.max(Math.min(...offsets) - 36, 0);
  const text = value.slice(start, start + 120).replace(/\s+/g, " ");
  return `${start > 0 ? "…" : ""}${highlight(text, terms)}${
    start + 120 < value.length ? "…" : ""
  }`;
}

function ftsQuery(terms: string[]): string {
  return terms.map((term) => `"${term.replaceAll('"', '""')}"`).join(" OR ");
}

function errorChainContainsMissingFtsTable(error: unknown): boolean {
  let current: unknown = error;
  const visited = new Set<unknown>();

  while (current && !visited.has(current)) {
    visited.add(current);
    if (
      current instanceof Error &&
      /(?:SQLite error:\s*)?no such table:\s*entities_fts\b/i.test(
        current.message,
      )
    ) {
      return true;
    }
    if (typeof current !== "object") return false;
    current = "cause" in current ? current.cause : undefined;
  }

  return false;
}

/**
 * Older Turso databases may not have the optional local FTS table. Only that
 * exact schema gap may use the parameterized LIKE fallback; all other database
 * failures remain visible to callers and production monitoring.
 */
export async function withEntitiesFtsFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    if (!errorChainContainsMissingFtsTable(error)) throw error;
    return fallback();
  }
}

export async function searchPublicEntities({
  query,
  page = 1,
  limit = 20,
  queryRunner = queryAll,
}: {
  query: string;
  page?: number;
  limit?: number;
  queryRunner?: typeof queryAll;
}): Promise<PublicSearchResponse> {
  const safeQuery = query.trim().slice(0, 100);
  const safePage = Math.max(page || 1, 1);
  const safeLimit = Math.min(Math.max(limit || 20, 1), 50);
  const intent = parseSearchIntent(safeQuery);
  const offset = (safePage - 1) * safeLimit;

  if (!safeQuery || (intent.terms.length === 0 && !intent.browseHref)) {
    return {
      intent,
      results: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
      query: safeQuery,
    };
  }

  const baseConditions = [publicEntityFilter("e")];
  const baseParams: unknown[] = [];
  if (intent.filters.type) {
    baseConditions.push("e.type = ?");
    baseParams.push(intent.filters.type);
  }
  const tagFilters = buildTagFilterSql(getTagFilterGroups(intent.filters), "e");
  baseConditions.push(...tagFilters.sql);
  baseParams.push(...tagFilters.params);

  const queryRows = async (includeFts: boolean) => {
    const conditions = [...baseConditions];
    const params = [...baseParams];
    if (intent.terms.length > 0) {
      const termClauses: string[] = [];
      for (const term of intent.terms) {
        const like = `%${term}%`;
        termClauses.push(`(
          lower(e.name) LIKE ?
          OR lower(e.slug) LIKE ?
          OR lower(COALESCE(e.summary, '')) LIKE ?
          OR lower(COALESCE(e.body_md, '')) LIKE ?
          OR EXISTS (
            SELECT 1 FROM entity_aliases search_ea
            WHERE search_ea.entity_id = e.id AND lower(search_ea.alias) LIKE ?
          )
        )`);
        params.push(like, like, like, like, like);
      }
      if (includeFts) {
        termClauses.push(
          "e.rowid IN (SELECT rowid FROM entities_fts WHERE entities_fts MATCH ?)",
        );
        params.push(ftsQuery(intent.terms));
      }
      conditions.push(`(${termClauses.join(" OR ")})`);
    }

    return (await queryRunner(
      `SELECT e.id, e.type, e.slug, e.name, e.summary, e.body_md, e.source,
            COUNT(*) OVER() as total_count,
            (SELECT GROUP_CONCAT(search_alias.alias, '||')
             FROM entity_aliases search_alias
             WHERE search_alias.entity_id = e.id) as aliases,
            (SELECT COUNT(*) FROM entity_tags search_et WHERE search_et.entity_id = e.id) as tag_count
     FROM entities e
     WHERE ${conditions.join(" AND ")}
     LIMIT 500`,
      params,
    )) as Array<{
      id: string;
      type: string;
      slug: string;
      name: string;
      summary: string | null;
      body_md: string | null;
      source: string | null;
      aliases: string | null;
      tag_count: number;
      total_count: number;
    }>;
  };

  const rows = await withEntitiesFtsFallback(
    () => queryRows(true),
    () => queryRows(false),
  );

  const fullQuery = normalize(safeQuery);
  const scored = rows
    .map((row) => {
      const name = normalize(String(row.name));
      const slug = normalize(String(row.slug));
      const summary = normalize(String(row.summary || ""));
      const body = normalize(String(row.body_md || ""));
      const aliases = String(row.aliases || "")
        .split("||")
        .filter(Boolean)
        .map(normalize);
      let score = 0;
      if (
        name === fullQuery ||
        slug === fullQuery ||
        aliases.includes(fullQuery)
      ) {
        score += 2_000;
      }
      for (const term of intent.terms) {
        if (name === term) score += 450;
        else if (name.includes(term)) score += 180;
        if (aliases.some((alias) => alias === term)) score += 360;
        else if (aliases.some((alias) => alias.includes(term))) score += 140;
        if (slug.includes(term)) score += 100;
        if (summary.includes(term)) score += 25;
        if (body.includes(term)) score += 5;
      }
      score += Math.min(Number(row.tag_count || 0), 20) * 2;
      if (row.source) score += 8;
      if (row.summary) score += 4;
      return { row, score };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        String(left.row.name).localeCompare(String(right.row.name), "zh-CN") ||
        String(left.row.id).localeCompare(String(right.row.id)),
    );

  const results = scored
    .slice(offset, offset + safeLimit)
    .map(({ row, score }) => ({
      id: String(row.id),
      type: String(row.type),
      slug: String(row.slug),
      name: String(row.name),
      summary: row.summary ? String(row.summary) : null,
      name_highlight: highlight(String(row.name), intent.terms),
      summary_highlight: row.summary
        ? highlight(String(row.summary), intent.terms)
        : "",
      body_highlight: excerpt(String(row.body_md || ""), intent.terms),
      rank: score,
    }));

  return {
    intent,
    results,
    total: Number(rows[0]?.total_count || 0),
    page: safePage,
    limit: safeLimit,
    query: safeQuery,
  };
}
