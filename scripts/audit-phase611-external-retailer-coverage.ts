import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";

export const PHASE611_RETAILERS = [
  "goldspot",
  "goulet",
  "atlas",
  "penchalet",
] as const;
export type Retailer = (typeof PHASE611_RETAILERS)[number];
export type CaptureMethod = "iab_rendered_dom" | "verified_plain_get";
export type RowKind = "brand" | "pen_product" | "non_pen";
export type CoverageDisposition =
  | "covered_exact"
  | "covered_alias"
  | "covered_family_or_variant"
  | "blocking_gap"
  | "deferred"
  | "rejected";

export type CaptureFile = {
  path: string;
  bytes: number;
  sha256: string;
};

export type CaptureMeta = {
  retailer: Retailer;
  status: "success" | "blocked";
  method: CaptureMethod;
  captured_at: string;
  start_url: string;
  final_url: string;
  http_status: number | null;
  challenge_detected: boolean;
  expected_marker: string;
  expected_marker_found: boolean;
  directory_row_count: number;
  pagination: {
    kind: "single_page" | "numbered" | "load_more" | "infinite_scroll";
    expected_pages: number;
    captured_pages: number;
    exhaustion_marker: string;
  };
  files: CaptureFile[];
};

export type CaptureRow = {
  raw_row_id: string;
  retailer: string;
  row_kind: RowKind;
  raw_brand_text: string;
  raw_model_text: string;
  href: string;
  locator: {
    page: number;
    kind: "dom" | "text";
    selector: string;
    index: number;
    text: string;
  };
  snapshot_path: string;
  snapshot_sha256: string;
};

export type DirectoryRow = CaptureRow & {
  row_id: string;
  normalized_brand: string;
  normalized_model: string;
};

export type IdentityRow = {
  entity_id: string;
  entity_type: "brand" | "pen";
  slug: string;
  canonical_name: string;
  aliases: Array<{
    alias: string;
    kind: string;
    market: string | null;
  }>;
  maker: null | {
    entity_id: string;
    slug: string;
    name: string;
  };
  variants: Array<{
    name: string;
    kind: string;
    product_code: string | null;
    market: string | null;
  }>;
};

export type CoverageLedgerRow = {
  row_id: string;
  disposition: CoverageDisposition;
  matched_entity_id: string | null;
  matched_entity_slug: string | null;
  maker_entity_id: string | null;
  family_or_variant_evidence: string | null;
  cross_retailer_evidence: string[];
  reason: string;
  reviewer: string;
  reviewed_at: string;
};

export type AuditResult = {
  captureCount: number;
  directoryRowCount: number;
  identityCounts: { brand: number; pen: number };
  identityTables: string[];
  pending: number;
  dispositions: Record<CoverageDisposition, number>;
};

const DISPOSITIONS: CoverageDisposition[] = [
  "covered_exact",
  "covered_alias",
  "covered_family_or_variant",
  "blocking_gap",
  "deferred",
  "rejected",
];
const IDENTITY_TABLES = [
  "entities",
  "entity_aliases",
  "entity_links",
  "model_variants",
  "public_entities",
] as const;
const REMOTE_SELECTOR = /^[a-z][a-z\d+.-]*:\/\//i;
const SHA256 = /^[a-f0-9]{64}$/;
const CHALLENGE_SIGNAL =
  /captcha|cloudflare|verify (?:you are|that you are|your browser)|access denied|security challenge|just a moment/i;

function invariant(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`Phase 611: ${message}`);
}

function sha256(value: Buffer | string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeIdentity(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function relativeFile(root: string, filePath: string): string {
  const relative = path.relative(root, filePath);
  invariant(
    relative !== "" &&
      !relative.startsWith("..") &&
      !path.isAbsolute(relative),
    "evidence file escaped its declared root",
  );
  return relative.split(path.sep).join("/");
}

function ensureLocalFileSelector(databasePath: string): string {
  invariant(databasePath.trim() !== "", "--database must not be empty");
  invariant(
    !REMOTE_SELECTOR.test(databasePath),
    "database must be an explicit local filesystem path; remote selectors are forbidden",
  );
  return fs.realpathSync.native(path.resolve(databasePath));
}

function rejectRemoteEnvironment(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ]) {
    invariant(
      !env[key]?.trim(),
      `${key} is forbidden for the external coverage audit`,
    );
  }
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function readNdjson<T>(filePath: string): T[] {
  invariant(fs.existsSync(filePath), `missing NDJSON file: ${filePath}`);
  const text = fs.readFileSync(filePath, "utf8").trim();
  invariant(text !== "", `empty NDJSON file: ${filePath}`);
  return text.split("\n").map((line, index) => {
    try {
      return JSON.parse(line) as T;
    } catch {
      throw new Error(
        `Phase 611: invalid NDJSON at ${filePath}:${index + 1}`,
      );
    }
  });
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeNdjson(filePath: string, rows: readonly unknown[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    rows.map((row) => JSON.stringify(row)).join("\n") + "\n",
  );
}

function validateUtc(value: string, label: string): void {
  invariant(
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value) &&
      !Number.isNaN(Date.parse(value)),
    `${label} must be an ISO-8601 UTC timestamp`,
  );
}

function validateCaptureMeta(
  evidenceRoot: string,
  retailer: Retailer,
  meta: CaptureMeta,
): void {
  invariant(meta.retailer === retailer, `${retailer} capture retailer mismatch`);
  invariant(meta.status === "success", `${retailer} capture is not successful`);
  validateUtc(meta.captured_at, `${retailer} captured_at`);
  for (const [label, value] of [
    ["start_url", meta.start_url],
    ["final_url", meta.final_url],
  ]) {
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      throw new Error(`Phase 611: ${retailer} ${label} is not a URL`);
    }
    invariant(
      parsed.protocol === "https:" || parsed.protocol === "http:",
      `${retailer} ${label} must use HTTP(S)`,
    );
  }
  invariant(
    meta.challenge_detected === false,
    `${retailer} capture contains a challenge or verification page`,
  );
  invariant(
    meta.expected_marker.trim() !== "" && meta.expected_marker_found === true,
    `${retailer} capture is missing its expected directory marker`,
  );
  invariant(
    Number.isSafeInteger(meta.directory_row_count) &&
      meta.directory_row_count > 0,
    `${retailer} capture has no visible directory rows`,
  );
  invariant(
    Number.isSafeInteger(meta.pagination.expected_pages) &&
      meta.pagination.expected_pages > 0 &&
      meta.pagination.captured_pages === meta.pagination.expected_pages &&
      meta.pagination.exhaustion_marker.trim() !== "",
    `${retailer} capture lacks complete pagination or exhaustion proof`,
  );
  if (retailer === "penchalet" && meta.method === "verified_plain_get") {
    invariant(
      meta.http_status === 200,
      "Pen Chalet verified_plain_get requires HTTP 200",
    );
  } else {
    invariant(
      meta.method === "iab_rendered_dom",
      `${retailer} success only accepts method iab_rendered_dom`,
    );
  }
  invariant(meta.files.length > 0, `${retailer} capture has no file manifest`);
  for (const file of meta.files) {
    invariant(
      file.path.startsWith(`${retailer}/`) && !file.path.includes(".."),
      `${retailer} capture file path is invalid`,
    );
    invariant(SHA256.test(file.sha256), `${retailer} file hash is invalid`);
    const filePath = path.join(evidenceRoot, "raw", file.path);
    invariant(fs.existsSync(filePath), `${retailer} raw file is missing: ${file.path}`);
    const bytes = fs.readFileSync(filePath);
    invariant(bytes.length === file.bytes, `${retailer} raw file byte count changed`);
    invariant(sha256(bytes) === file.sha256, `${retailer} raw file hash changed`);
    if (/\.(?:html|txt)$/i.test(file.path)) {
      const text = bytes.toString("utf8");
      invariant(
        !CHALLENGE_SIGNAL.test(text),
        `${retailer} raw file contains a challenge signal: ${file.path}`,
      );
    }
  }
}

function validateCaptureRow(row: CaptureRow, retailer: Retailer): void {
  invariant(row.retailer === retailer, `${retailer} raw row retailer mismatch`);
  invariant(
    ["brand", "pen_product", "non_pen"].includes(row.row_kind),
    `${retailer} raw row has an invalid row_kind`,
  );
  invariant(row.raw_row_id.trim() !== "", `${retailer} raw row lacks raw_row_id`);
  invariant(
    row.raw_brand_text.trim() !== "" || row.raw_model_text.trim() !== "",
    `${retailer} raw row has no visible identity text`,
  );
  invariant(row.href.trim() !== "", `${retailer} raw row lacks href`);
  invariant(
    Number.isSafeInteger(row.locator.page) && row.locator.page > 0,
    `${retailer} raw row locator page is invalid`,
  );
  invariant(row.locator.text.trim() !== "", `${retailer} raw row locator is empty`);
  invariant(
    row.snapshot_path.startsWith(`${retailer}/`) &&
      !row.snapshot_path.includes(".."),
    `${retailer} raw row snapshot path is invalid`,
  );
  invariant(
    SHA256.test(row.snapshot_sha256),
    `${retailer} raw row snapshot hash is invalid`,
  );
}

export function buildDirectoryRow(row: CaptureRow): DirectoryRow {
  const identity = JSON.stringify({
    retailer: row.retailer,
    raw_row_id: row.raw_row_id,
    row_kind: row.row_kind,
    raw_brand_text: row.raw_brand_text,
    raw_model_text: row.raw_model_text,
    href: row.href,
    locator: row.locator,
    snapshot_path: row.snapshot_path,
    snapshot_sha256: row.snapshot_sha256,
  });
  return {
    ...row,
    row_id: `dir-${sha256(identity).slice(0, 32)}`,
    normalized_brand: normalizeIdentity(row.raw_brand_text),
    normalized_model: normalizeIdentity(row.raw_model_text),
  };
}

function readCaptureRows(
  evidenceRoot: string,
  retailer: Retailer,
): CaptureRow[] {
  const captureDir = path.join(evidenceRoot, "raw", retailer);
  const files = fs
    .readdirSync(captureDir)
    .filter((name) => /^page-\d+\.rows\.ndjson$/.test(name))
    .sort();
  invariant(files.length > 0, `${retailer} capture has no row files`);
  return files.flatMap((name) =>
    readNdjson<CaptureRow>(path.join(captureDir, name)),
  );
}

function loadAndValidateCaptures(evidenceRoot: string): {
  captures: CaptureMeta[];
  rows: DirectoryRow[];
} {
  const captures: CaptureMeta[] = [];
  const rows: DirectoryRow[] = [];
  const rawRowIds = new Set<string>();
  const rowIds = new Set<string>();
  for (const retailer of PHASE611_RETAILERS) {
    const metaPath = path.join(evidenceRoot, "raw", retailer, "meta.json");
    invariant(fs.existsSync(metaPath), `${retailer} capture metadata is missing`);
    const meta = readJson<CaptureMeta>(metaPath);
    validateCaptureMeta(evidenceRoot, retailer, meta);
    const captureRows = readCaptureRows(evidenceRoot, retailer);
    invariant(
      captureRows.length === meta.directory_row_count,
      `${retailer} directory row count does not match capture metadata`,
    );
    for (const raw of captureRows) {
      validateCaptureRow(raw, retailer);
      invariant(
        !rawRowIds.has(raw.raw_row_id),
        `duplicate raw_row_id: ${raw.raw_row_id}`,
      );
      rawRowIds.add(raw.raw_row_id);
      const snapshotFile = path.join(evidenceRoot, "raw", raw.snapshot_path);
      invariant(
        fs.existsSync(snapshotFile),
        `raw row snapshot is missing: ${raw.snapshot_path}`,
      );
      invariant(
        sha256(fs.readFileSync(snapshotFile)) === raw.snapshot_sha256,
        `raw row snapshot hash changed: ${raw.snapshot_path}`,
      );
      const normalized = buildDirectoryRow(raw);
      invariant(!rowIds.has(normalized.row_id), `duplicate row_id: ${normalized.row_id}`);
      rowIds.add(normalized.row_id);
      rows.push(normalized);
    }
    captures.push(meta);
  }
  return {
    captures,
    rows: rows.sort(
      (left, right) =>
        left.retailer.localeCompare(right.retailer) ||
        left.raw_row_id.localeCompare(right.raw_row_id),
    ),
  };
}

function exportIdentities(databasePath: string, env: NodeJS.ProcessEnv): {
  identities: IdentityRow[];
  counts: { brand: number; pen: number };
} {
  rejectRemoteEnvironment(env);
  const sourcePath = ensureLocalFileSelector(databasePath);
  const snapshotBefore = snapshotCatalogFiles(sourcePath);
  invariant(
    !snapshotBefore.wal.exists && !snapshotBefore.shm.exists,
    "protected identity checkpoint must be a checkpointed main file with no WAL/SHM sidecars",
  );
  const previousSqliteUriFlag = process.env.SQLITE_USE_URI;
  process.env.SQLITE_USE_URI = "1";
  const immutableUri = `file:${encodeURI(sourcePath)}?mode=ro&immutable=1`;
  const database = new Database(immutableUri, {
    readonly: true,
    fileMustExist: true,
  });
  try {
    database.pragma("query_only = ON");
    invariant(
      database.readonly && Number(database.pragma("query_only", { simple: true })) === 1,
      "identity checkpoint did not enter readonly/query_only mode",
    );
    const all = <Row extends object>(sql: string): Row[] => {
      const statement = database.prepare(sql);
      invariant(
        statement.reader && statement.readonly,
        "identity export attempted a non-readonly SQL statement",
      );
      return statement.all() as Row[];
    };
    const publicRows = all<{
      id: string;
      type: "brand" | "pen";
      slug: string;
      name: string;
    }>(
      "SELECT id,type,slug,name FROM public_entities WHERE type IN ('brand','pen') ORDER BY type,slug,id",
    );
    const aliases = all<{
      entity_id: string;
      alias: string;
      alias_kind: string;
      market: string | null;
    }>(
      `SELECT alias.entity_id,alias.alias,alias.alias_kind,alias.market
       FROM entity_aliases alias
       JOIN public_entities entity ON entity.id=alias.entity_id
       WHERE entity.type IN ('brand','pen') AND alias.review_status='approved'
       ORDER BY alias.entity_id,alias.alias_kind,alias.alias`,
    );
    const makers = all<{
      pen_id: string;
      brand_id: string;
      brand_slug: string;
      brand_name: string;
    }>(
      `SELECT pen.id AS pen_id,brand.id AS brand_id,brand.slug AS brand_slug,brand.name AS brand_name
       FROM public_entities pen
       JOIN entity_links link ON link.source_id=pen.id AND link.link_type='made_by'
       JOIN public_entities brand ON brand.id=link.target_id AND brand.type='brand'
       WHERE pen.type='pen'
       ORDER BY pen.id,brand.id`,
    );
    const variants = all<{
      model_entity_id: string;
      variant_name: string;
      variant_kind: string;
      product_code: string | null;
      market: string | null;
    }>(
      `SELECT variant.model_entity_id,variant.variant_name,variant.variant_kind,
              variant.product_code,variant.market
       FROM model_variants variant
       JOIN public_entities entity ON entity.id=variant.model_entity_id AND entity.type='pen'
       WHERE variant.review_status='approved'
       ORDER BY variant.model_entity_id,variant.variant_kind,variant.variant_name`,
    );
    const aliasMap = new Map<string, IdentityRow["aliases"]>();
    for (const row of aliases) {
      const values = aliasMap.get(row.entity_id) ?? [];
      values.push({
        alias: row.alias,
        kind: row.alias_kind,
        market: row.market,
      });
      aliasMap.set(row.entity_id, values);
    }
    const makerMap = new Map<string, IdentityRow["maker"]>();
    const makerDuplicates = new Set<string>();
    for (const row of makers) {
      if (makerMap.has(row.pen_id)) makerDuplicates.add(row.pen_id);
      makerMap.set(row.pen_id, {
        entity_id: row.brand_id,
        slug: row.brand_slug,
        name: row.brand_name,
      });
    }
    invariant(
      makerDuplicates.size === 0,
      "public identity surface contains pens with multiple made_by links",
    );
    const variantMap = new Map<string, IdentityRow["variants"]>();
    for (const row of variants) {
      const values = variantMap.get(row.model_entity_id) ?? [];
      values.push({
        name: row.variant_name,
        kind: row.variant_kind,
        product_code: row.product_code,
        market: row.market,
      });
      variantMap.set(row.model_entity_id, values);
    }
    const identities = publicRows.map((row): IdentityRow => ({
      entity_id: row.id,
      entity_type: row.type,
      slug: row.slug,
      canonical_name: row.name,
      aliases: aliasMap.get(row.id) ?? [],
      maker: row.type === "pen" ? (makerMap.get(row.id) ?? null) : null,
      variants: row.type === "pen" ? (variantMap.get(row.id) ?? []) : [],
    }));
    const counts = {
      brand: identities.filter((row) => row.entity_type === "brand").length,
      pen: identities.filter((row) => row.entity_type === "pen").length,
    };
    invariant(
      counts.brand === 121 && counts.pen === 740,
      `current public identity count mismatch: ${JSON.stringify(counts)}`,
    );
    return { identities, counts };
  } finally {
    database.close();
    if (previousSqliteUriFlag === undefined) delete process.env.SQLITE_USE_URI;
    else process.env.SQLITE_USE_URI = previousSqliteUriFlag;
    assertCatalogSnapshotUnchanged(snapshotBefore, snapshotCatalogFiles(sourcePath));
  }
}

function validateLedger(
  rows: readonly DirectoryRow[],
  identities: readonly IdentityRow[],
  evidenceRoot: string,
): {
  ledger: CoverageLedgerRow[];
  dispositions: Record<CoverageDisposition, number>;
} {
  const ledgerPath = path.join(
    evidenceRoot,
    "decisions/coverage-ledger.ndjson",
  );
  const ledger = readNdjson<CoverageLedgerRow>(ledgerPath);
  const rowIds = rows.map((row) => row.row_id).sort();
  const ledgerIds = ledger.map((row) => row.row_id).sort();
  invariant(
    new Set(ledgerIds).size === ledgerIds.length &&
      JSON.stringify(rowIds) === JSON.stringify(ledgerIds),
    "coverage ledger row_id set is not a strict bijection with directory rows",
  );
  const identityById = new Map(identities.map((row) => [row.entity_id, row]));
  const dispositions = Object.fromEntries(
    DISPOSITIONS.map((disposition) => [disposition, 0]),
  ) as Record<CoverageDisposition, number>;
  for (const row of ledger) {
    invariant(
      DISPOSITIONS.includes(row.disposition),
      `invalid coverage disposition for ${row.row_id}`,
    );
    dispositions[row.disposition] += 1;
    invariant(row.reason.trim() !== "", `missing review reason for ${row.row_id}`);
    invariant(row.reviewer.trim() !== "", `missing reviewer for ${row.row_id}`);
    validateUtc(row.reviewed_at, `${row.row_id} reviewed_at`);
    if (row.disposition === "covered_exact" || row.disposition === "covered_alias") {
      invariant(
        row.matched_entity_id !== null && row.matched_entity_slug !== null,
        `${row.row_id} covered disposition lacks matched public identity`,
      );
      const identity = identityById.get(row.matched_entity_id);
      invariant(identity, `${row.row_id} matched entity is not public`);
      invariant(
        identity.slug === row.matched_entity_slug,
        `${row.row_id} matched public slug changed`,
      );
    }
    if (row.disposition === "covered_family_or_variant") {
      invariant(
        row.matched_entity_id !== null &&
          row.maker_entity_id !== null &&
          Boolean(row.family_or_variant_evidence?.trim()),
        `${row.row_id} family/variant disposition lacks maker and exact evidence`,
      );
      invariant(
        identityById.has(row.matched_entity_id),
        `${row.row_id} family/variant parent is not public`,
      );
    }
    if (row.disposition === "blocking_gap") {
      invariant(
        row.cross_retailer_evidence.length > 0,
        `${row.row_id} blocking gap lacks independent cross-source evidence`,
      );
    }
  }
  const gaps = ledger.filter((row) => row.disposition === "blocking_gap");
  const gapPath = path.join(evidenceRoot, "decisions/blocking-gaps.ndjson");
  const projection = readNdjson<CoverageLedgerRow>(gapPath);
  invariant(
    JSON.stringify(projection) === JSON.stringify(gaps),
    "blocking-gap projection is not a lossless ordered filter of the ledger",
  );
  return { ledger, dispositions };
}

function candidateMatches(
  rows: readonly DirectoryRow[],
  identities: readonly IdentityRow[],
): Array<{
  row_id: string;
  candidates: Array<{
    entity_id: string;
    slug: string;
    kind: "canonical" | "alias" | "variant";
    matched_text: string;
  }>;
}> {
  const surface: Array<{
    entity: IdentityRow;
    kind: "canonical" | "alias" | "variant";
    text: string;
  }> = [];
  for (const identity of identities) {
    surface.push({ entity: identity, kind: "canonical", text: identity.canonical_name });
    for (const alias of identity.aliases) {
      surface.push({ entity: identity, kind: "alias", text: alias.alias });
    }
    for (const variant of identity.variants) {
      surface.push({ entity: identity, kind: "variant", text: variant.name });
      if (variant.product_code) {
        surface.push({ entity: identity, kind: "variant", text: variant.product_code });
      }
    }
  }
  return rows.map((row) => {
    const targets = new Set(
      [row.normalized_brand, row.normalized_model].filter(Boolean),
    );
    const seen = new Set<string>();
    const candidates = surface
      .filter(({ text }) => targets.has(normalizeIdentity(text)))
      .map(({ entity, kind, text }) => ({
        entity_id: entity.entity_id,
        slug: entity.slug,
        kind,
        matched_text: text,
      }))
      .filter((candidate) => {
        const key = `${candidate.entity_id}:${candidate.kind}:${candidate.matched_text}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    return { row_id: row.row_id, candidates };
  });
}

function fileLineCount(filePath: string): number | null {
  if (!/\.(?:ndjson|txt|md|json|html)$/i.test(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8");
  return text === "" ? 0 : text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
}

function createArtifactManifest(
  evidenceRoot: string,
  excludes: readonly string[] = [],
): Array<{ path: string; bytes: number; lines: number | null; sha256: string }> {
  const excluded = new Set(excludes);
  const walk = (directory: string): string[] =>
    fs
      .readdirSync(directory, { withFileTypes: true })
      .flatMap((entry) => {
        const candidate = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(candidate) : [candidate];
      });
  return walk(evidenceRoot)
    .filter((filePath) => {
      const relative = relativeFile(evidenceRoot, filePath);
      return !excluded.has(relative);
    })
    .map((filePath) => {
      const buffer = fs.readFileSync(filePath);
      return {
        path: relativeFile(evidenceRoot, filePath),
        bytes: buffer.length,
        lines: fileLineCount(filePath),
        sha256: sha256(buffer),
      };
    })
    .sort((left, right) => left.path.localeCompare(right.path));
}

export function writePhase611ArtifactManifest(evidenceRootInput: string): void {
  const evidenceRoot = path.resolve(evidenceRootInput);
  const artifacts = createArtifactManifest(evidenceRoot, [
    "artifact-manifest.json",
  ]);
  writeJson(path.join(evidenceRoot, "artifact-manifest.json"), {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    artifacts,
  });
}

function writeCaptureManifest(
  evidenceRoot: string,
  captures: readonly CaptureMeta[],
): void {
  writeJson(path.join(evidenceRoot, "raw/capture-manifest.json"), {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    retailers: captures,
    counts: {
      retailers: captures.length,
      successful: captures.filter((capture) => capture.status === "success").length,
      blocked: captures.filter((capture) => capture.status !== "success").length,
      raw_files: captures.reduce((sum, capture) => sum + capture.files.length, 0),
      directory_rows: captures.reduce(
        (sum, capture) => sum + capture.directory_row_count,
        0,
      ),
    },
  });
}

function validateExistingArtifactManifest(evidenceRoot: string): void {
  const manifestPath = path.join(evidenceRoot, "artifact-manifest.json");
  invariant(fs.existsSync(manifestPath), "artifact-manifest.json is missing");
  const expected = readJson<{
    schema_version: number;
    artifacts: ReturnType<typeof createArtifactManifest>;
  }>(manifestPath);
  invariant(expected.schema_version === 1, "artifact manifest schema changed");
  const actual = createArtifactManifest(evidenceRoot, ["artifact-manifest.json"]);
  invariant(
    JSON.stringify(expected.artifacts) === JSON.stringify(actual),
    "artifact manifest does not match current evidence files",
  );
}

export function runPhase611Audit(
  mode: "verify-capture" | "verify-final",
  databasePath: string,
  evidenceRootInput: string,
  env: NodeJS.ProcessEnv = process.env,
): AuditResult {
  invariant(
    mode === "verify-capture" || mode === "verify-final",
    "mode must be verify-capture or verify-final",
  );
  rejectRemoteEnvironment(env);
  const evidenceRoot = path.resolve(evidenceRootInput);
  invariant(
    fs.existsSync(evidenceRoot) && fs.statSync(evidenceRoot).isDirectory(),
    "evidence root does not exist",
  );
  const { captures, rows } = loadAndValidateCaptures(evidenceRoot);
  const sourcePath = ensureLocalFileSelector(databasePath);
  const sourceBefore = snapshotCatalogFiles(sourcePath);
  invariant(
    !sourceBefore.wal.exists && !sourceBefore.shm.exists,
    "source checkpoint must have no WAL/SHM sidecars before audit",
  );
  const realPath = path.resolve(process.cwd(), "data/fpkg.db");
  const realBefore = snapshotCatalogFiles(realPath);
  try {
    const { identities, counts } = exportIdentities(sourcePath, env);
    const captureManifestPath = path.join(
      evidenceRoot,
      "raw/capture-manifest.json",
    );
    const directoryRowsPath = path.join(
      evidenceRoot,
      "normalized/directory-rows.ndjson",
    );
    const identitiesPath = path.join(
      evidenceRoot,
      "normalized/current-public-identities.ndjson",
    );
    const candidatesPath = path.join(
      evidenceRoot,
      "normalized/match-candidates.ndjson",
    );
    if (mode === "verify-capture") {
      writeCaptureManifest(evidenceRoot, captures);
      writeNdjson(directoryRowsPath, rows);
      writeNdjson(identitiesPath, identities);
      writeNdjson(candidatesPath, candidateMatches(rows, identities));
    } else {
      invariant(
        fs.existsSync(captureManifestPath) &&
          fs.existsSync(directoryRowsPath) &&
          fs.existsSync(identitiesPath) &&
          fs.existsSync(candidatesPath),
        "verify-final requires frozen capture and normalized artifacts",
      );
      invariant(
        JSON.stringify(readNdjson<DirectoryRow>(directoryRowsPath)) ===
          JSON.stringify(rows),
        "frozen directory rows do not match the raw capture",
      );
      invariant(
        JSON.stringify(readNdjson<IdentityRow>(identitiesPath)) ===
          JSON.stringify(identities),
        "frozen public identity surface does not match the checkpoint",
      );
    }
    let pending = rows.length;
    let dispositions = Object.fromEntries(
      DISPOSITIONS.map((disposition) => [disposition, 0]),
    ) as Record<CoverageDisposition, number>;
    if (mode === "verify-final") {
      const validated = validateLedger(rows, identities, evidenceRoot);
      dispositions = validated.dispositions;
      pending = 0;
      validateExistingArtifactManifest(evidenceRoot);
    }
    return {
      captureCount: captures.length,
      directoryRowCount: rows.length,
      identityCounts: counts,
      identityTables: [...IDENTITY_TABLES],
      pending,
      dispositions,
    };
  } finally {
    assertCatalogSnapshotUnchanged(sourceBefore, snapshotCatalogFiles(sourcePath));
    assertCatalogSnapshotUnchanged(realBefore, snapshotCatalogFiles(realPath));
  }
}

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index >= 0) return process.argv[index + 1];
  return process.argv
    .find((value) => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function main(): void {
  const mode = process.argv[2];
  invariant(
    mode === "verify-capture" || mode === "verify-final",
    "first argument must be verify-capture or verify-final",
  );
  const database = option("--database");
  const evidenceRoot = option("--evidence-root");
  invariant(database, "--database is required");
  invariant(evidenceRoot, "--evidence-root is required");
  const result = runPhase611Audit(mode, database, evidenceRoot);
  if (mode === "verify-final") {
    writePhase611ArtifactManifest(evidenceRoot);
  }
  console.log(JSON.stringify(result, null, 2));
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
