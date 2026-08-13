import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildDirectoryRow,
  type CaptureMeta,
  type CaptureRow,
  type CoverageLedgerRow,
  runPhase611Audit,
} from "../../scripts/audit-phase611-external-retailer-coverage";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = process.cwd();
const SOURCE = path.join(
  ROOT,
  ".planning/quick/260813-hhf-740-manifest/checkpoint-final/catalog.db",
);
const REAL = path.join(ROOT, "data/fpkg.db");

function cleanSourceCopy(): { path: string; dispose: () => void } {
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase611-source-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(root, "catalog.db"),
    root,
    { expectedSourceSnapshot: snapshotCatalogFiles(SOURCE) },
  );
  return {
    path: copy.destinationPath,
    dispose: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

function sha256(buffer: Buffer | string): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeNdjson(filePath: string, rows: readonly unknown[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`,
  );
}

function captureRow(retailer: CaptureRow["retailer"]): CaptureRow {
  return {
    raw_row_id: `${retailer}-page-001-row-0001`,
    retailer,
    row_kind: retailer === "atlas" ? "pen_product" : "brand",
    raw_brand_text: retailer === "atlas" ? "Pilot" : "Pilot",
    raw_model_text: retailer === "atlas" ? "Pilot Custom 823 Fountain Pen" : "",
    href:
      retailer === "atlas"
        ? "/products/pilot-custom-823-fountain-pen"
        : "/collections/pilot",
    locator: {
      page: 1,
      kind: "dom",
      selector: ".card",
      index: 0,
      text: retailer === "atlas" ? "Pilot Custom 823 Fountain Pen" : "Pilot",
    },
    snapshot_path: `${retailer}/page-001.html`,
    snapshot_sha256: "",
  };
}

function buildCapture(
  evidenceRoot: string,
  retailer: "goldspot" | "goulet" | "atlas" | "penchalet",
  overrides: Partial<CaptureMeta> = {},
): void {
  const rawDir = path.join(evidenceRoot, "raw", retailer);
  fs.mkdirSync(rawDir, { recursive: true });
  const row = captureRow(retailer);
  const html = `<!doctype html><html><head><script id="captcha-bootstrap">window.shopifyCaptcha = true;</script></head><body><main><h1>Fountain Pen Brands</h1><a href="${row.href}">${row.locator.text}</a></main></body></html>`;
  const htmlPath = path.join(rawDir, "page-001.html");
  fs.writeFileSync(htmlPath, html);
  const textPath = path.join(rawDir, "page-001.txt");
  fs.writeFileSync(textPath, `Fountain Pen Brands\n${row.locator.text}\n`);
  row.snapshot_sha256 = sha256(html);
  writeNdjson(path.join(rawDir, "page-001.rows.ndjson"), [row]);
  const files = ["page-001.html", "page-001.txt", "page-001.rows.ndjson"].map(
    (name) => {
      const bytes = fs.readFileSync(path.join(rawDir, name));
      return {
        path: `${retailer}/${name}`,
        bytes: bytes.length,
        sha256: sha256(bytes),
      };
    },
  );
  const startUrl =
    retailer === "penchalet"
      ? "https://www.penchalet.com/brand.aspx"
      : `https://${retailer}.example/collections/fountain-pens`;
  const meta: CaptureMeta = {
    retailer,
    status: "success",
    method:
      retailer === "penchalet" ? "verified_plain_get" : "iab_rendered_dom",
    captured_at: "2026-08-13T06:00:00.000Z",
    start_url: startUrl,
    final_url: startUrl,
    http_status: retailer === "penchalet" ? 200 : null,
    challenge_detected: false,
    expected_marker: "Fountain Pen Brands",
    expected_marker_found: true,
    directory_row_count: 1,
    pagination: {
      kind: "single_page",
      expected_pages: 1,
      captured_pages: 1,
      exhaustion_marker: "No next link or load-more control in rendered DOM",
    },
    files,
    ...overrides,
  };
  writeJson(path.join(rawDir, "meta.json"), meta);
}

function fixture(mutate?: (root: string) => void): {
  root: string;
  dispose: () => void;
} {
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase611-")),
  );
  for (const retailer of [
    "goldspot",
    "goulet",
    "atlas",
    "penchalet",
  ] as const) {
    buildCapture(root, retailer);
  }
  mutate?.(root);
  return {
    root,
    dispose: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

test("Phase 611 capture contract fails closed on challenge and wrong method", () => {
  const challenge = fixture((root) => {
    const metaPath = path.join(root, "raw/goldspot/meta.json");
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as CaptureMeta;
    meta.challenge_detected = true;
    writeJson(metaPath, meta);
  });
  try {
    assert.throws(
      () =>
        runPhase611Audit(
          "verify-capture",
          "/no/sqlite/opened.db",
          challenge.root,
        ),
      /challenge/i,
    );
  } finally {
    challenge.dispose();
  }

  const hiddenChallenge = fixture((root) => {
    const rawDir = path.join(root, "raw/goldspot");
    const htmlPath = path.join(rawDir, "page-001.html");
    const rowsPath = path.join(rawDir, "page-001.rows.ndjson");
    const metaPath = path.join(rawDir, "meta.json");
    const html = "Your connection needs to be verified before you can proceed";
    fs.writeFileSync(htmlPath, html);
    const rows = fs
      .readFileSync(rowsPath, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as CaptureRow);
    rows[0].snapshot_sha256 = sha256(html);
    writeNdjson(rowsPath, rows);
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as CaptureMeta;
    meta.files = [htmlPath, rowsPath].map((filePath) => {
      const bytes = fs.readFileSync(filePath);
      return {
        path: `goldspot/${path.basename(filePath)}`,
        bytes: bytes.length,
        sha256: sha256(bytes),
      };
    });
    writeJson(metaPath, meta);
  });
  try {
    assert.throws(
      () =>
        runPhase611Audit(
          "verify-capture",
          "/no/sqlite/opened.db",
          hiddenChallenge.root,
        ),
      /challenge signal/i,
    );
  } finally {
    hiddenChallenge.dispose();
  }

  const plainGet = fixture((root) => {
    const metaPath = path.join(root, "raw/goulet/meta.json");
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as CaptureMeta;
    meta.method = "verified_plain_get";
    meta.http_status = 200;
    writeJson(metaPath, meta);
  });
  try {
    assert.throws(
      () =>
        runPhase611Audit(
          "verify-capture",
          "/no/sqlite/opened.db",
          plainGet.root,
        ),
      /iab_rendered_dom/i,
    );
  } finally {
    plainGet.dispose();
  }
});

test("Phase 611 accepts the narrow Pen Chalet GET exception", () => {
  const valid = fixture();
  const source = cleanSourceCopy();
  try {
    const result = runPhase611Audit("verify-capture", source.path, valid.root);
    assert.equal(result.captureCount, 4);
    assert.equal(result.directoryRowCount, 4);
  } finally {
    valid.dispose();
    source.dispose();
  }

  const empty = fixture((root) => {
    const metaPath = path.join(root, "raw/penchalet/meta.json");
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as CaptureMeta;
    meta.http_status = 204;
    writeJson(metaPath, meta);
  });
  const emptySource = cleanSourceCopy();
  try {
    assert.throws(
      () => runPhase611Audit("verify-capture", emptySource.path, empty.root),
      /HTTP 200/i,
    );
  } finally {
    empty.dispose();
    emptySource.dispose();
  }
});

test("Phase 611 row ids are deterministic and retain raw locator evidence", () => {
  const raw = captureRow("atlas");
  raw.snapshot_sha256 = "a".repeat(64);
  const first = buildDirectoryRow(raw);
  const second = buildDirectoryRow({ ...raw });
  assert.deepEqual(first, second);
  assert.match(first.row_id, /^dir-[a-f0-9]{32}$/);
  assert.equal(first.raw_model_text, "Pilot Custom 823 Fountain Pen");
  assert.equal(first.locator.text, "Pilot Custom 823 Fountain Pen");
  assert.equal(first.snapshot_sha256, "a".repeat(64));
});

test("Phase 611 capture rows replay marker, pagination, text, and href", () => {
  for (const [label, mutate, expected] of [
    [
      "marker",
      (root: string) => {
        const metaPath = path.join(root, "raw/goldspot/meta.json");
        const meta = JSON.parse(
          fs.readFileSync(metaPath, "utf8"),
        ) as CaptureMeta;
        meta.expected_marker = "Missing visible marker";
        writeJson(metaPath, meta);
      },
      /expected marker.*visible raw surface/i,
    ],
    [
      "pagination",
      (root: string) => {
        const metaPath = path.join(root, "raw/atlas/meta.json");
        const meta = JSON.parse(
          fs.readFileSync(metaPath, "utf8"),
        ) as CaptureMeta;
        meta.pagination.expected_pages = 2;
        meta.pagination.captured_pages = 2;
        writeJson(metaPath, meta);
      },
      /page files.*every captured page/i,
    ],
    [
      "locator",
      (root: string) => {
        const rowsPath = path.join(root, "raw/goulet/page-001.rows.ndjson");
        const rows = fs
          .readFileSync(rowsPath, "utf8")
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line) as CaptureRow);
        rows[0].locator.text = "Unreplayable brand locator";
        writeNdjson(rowsPath, rows);
        const metaPath = path.join(root, "raw/goulet/meta.json");
        const meta = JSON.parse(
          fs.readFileSync(metaPath, "utf8"),
        ) as CaptureMeta;
        const file = meta.files.find((item) =>
          item.path.endsWith("rows.ndjson"),
        );
        assert.ok(file);
        const bytes = fs.readFileSync(rowsPath);
        Object.assign(file, { bytes: bytes.length, sha256: sha256(bytes) });
        writeJson(metaPath, meta);
      },
      /locator text.*not replayable/i,
    ],
    [
      "href",
      (root: string) => {
        const rowsPath = path.join(root, "raw/penchalet/page-001.rows.ndjson");
        const rows = fs
          .readFileSync(rowsPath, "utf8")
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line) as CaptureRow);
        rows[0].href = "https://www.penchalet.com/not-in-snapshot";
        writeNdjson(rowsPath, rows);
        const metaPath = path.join(root, "raw/penchalet/meta.json");
        const meta = JSON.parse(
          fs.readFileSync(metaPath, "utf8"),
        ) as CaptureMeta;
        const file = meta.files.find((item) =>
          item.path.endsWith("rows.ndjson"),
        );
        assert.ok(file);
        const bytes = fs.readFileSync(rowsPath);
        Object.assign(file, { bytes: bytes.length, sha256: sha256(bytes) });
        writeJson(metaPath, meta);
      },
      /href.*not replayable/i,
    ],
  ] as const) {
    const invalid = fixture(mutate);
    const source = cleanSourceCopy();
    try {
      assert.throws(
        () => runPhase611Audit("verify-capture", source.path, invalid.root),
        expected,
        label,
      );
    } finally {
      invalid.dispose();
      source.dispose();
    }
  }
});

test("Phase 611 accepts HTML-encoded and percent-encoded row links", () => {
  const encoded = fixture((root) => {
    const htmlPath = path.join(root, "raw/atlas/page-001.html");
    const rowsPath = path.join(root, "raw/atlas/page-001.rows.ndjson");
    const metaPath = path.join(root, "raw/atlas/meta.json");
    const rows = fs
      .readFileSync(rowsPath, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as CaptureRow);
    rows[0].href =
      "https://atlas.example/products/pilot%20custom?color=black&nib=fine";
    const html = `<!doctype html><body><h1>Fountain Pen Brands</h1><a href="/products/pilot custom?color=black&amp;nib=fine">${rows[0].locator.text}</a></body>`;
    fs.writeFileSync(htmlPath, html);
    rows[0].snapshot_sha256 = sha256(html);
    writeNdjson(rowsPath, rows);
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as CaptureMeta;
    for (const item of meta.files) {
      if (
        !item.path.endsWith("page-001.html") &&
        !item.path.endsWith("rows.ndjson")
      ) {
        continue;
      }
      const filePath = item.path.endsWith("page-001.html")
        ? htmlPath
        : rowsPath;
      const bytes = fs.readFileSync(filePath);
      Object.assign(item, { bytes: bytes.length, sha256: sha256(bytes) });
    }
    writeJson(metaPath, meta);
  });
  const source = cleanSourceCopy();
  try {
    assert.doesNotThrow(() =>
      runPhase611Audit("verify-capture", source.path, encoded.root),
    );
  } finally {
    encoded.dispose();
    source.dispose();
  }
});

test("Phase 611 exports only the 121 brand/740 pen identity surface", () => {
  const sourceBefore = snapshotCatalogFiles(SOURCE);
  const realBefore = snapshotCatalogFiles(REAL);
  const valid = fixture();
  const source = cleanSourceCopy();
  try {
    const result = runPhase611Audit("verify-capture", source.path, valid.root);
    assert.deepEqual(result.identityCounts, { brand: 121, pen: 740 });
    assert.deepEqual(result.identityTables, [
      "entities",
      "entity_aliases",
      "entity_links",
      "model_variants",
      "public_entities",
    ]);
    const identityText = fs.readFileSync(
      path.join(valid.root, "normalized/current-public-identities.ndjson"),
      "utf8",
    );
    for (const banned of [
      "stories",
      "entity_references",
      "model_specs",
      "media_assets",
      "entity_content_reviews",
      "public_entity_readiness",
    ]) {
      assert.doesNotMatch(identityText, new RegExp(`\\"${banned}\\"`));
    }
  } finally {
    valid.dispose();
    source.dispose();
  }
  assertCatalogSnapshotUnchanged(sourceBefore, snapshotCatalogFiles(SOURCE));
  assertCatalogSnapshotUnchanged(realBefore, snapshotCatalogFiles(REAL));
});

test("Phase 611 rejects every remote selector before opening SQLite", () => {
  const valid = fixture();
  const source = cleanSourceCopy();
  try {
    for (const key of [
      "TURSO_DATABASE_URL",
      "TURSO_AUTH_TOKEN",
      "FPKG_DATABASE_URL",
    ]) {
      assert.throws(
        () =>
          runPhase611Audit("verify-capture", SOURCE, valid.root, {
            ...process.env,
            TURSO_DATABASE_URL: "",
            TURSO_AUTH_TOKEN: "",
            FPKG_DATABASE_URL: "",
            [key]: "libsql://forbidden.example",
          }),
        new RegExp(key),
      );
    }
    assert.throws(
      () =>
        runPhase611Audit(
          "verify-capture",
          "https://example/catalog.db",
          valid.root,
        ),
      /remote|local filesystem/i,
    );
  } finally {
    valid.dispose();
    source.dispose();
  }
});

test("Phase 611 final ledger is a strict bijection with a lossless gap projection", async () => {
  const valid = fixture();
  const source = cleanSourceCopy();
  try {
    runPhase611Audit("verify-capture", source.path, valid.root);
    const rows = fs
      .readFileSync(
        path.join(valid.root, "normalized/directory-rows.ndjson"),
        "utf8",
      )
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as ReturnType<typeof buildDirectoryRow>);
    const atlas = rows.find((row) => row.retailer === "atlas");
    const goulet = rows.find((row) => row.retailer === "goulet");
    assert.ok(atlas && goulet);
    const ledger: CoverageLedgerRow[] = rows.map((row) => ({
      row_id: row.row_id,
      disposition:
        row.row_id === atlas.row_id
          ? "blocking_gap"
          : row.row_kind === "brand"
            ? "covered_alias"
            : "deferred",
      matched_entity_id: row.row_kind === "brand" ? "Zt-PbXkE7UHM" : null,
      matched_entity_slug: row.row_kind === "brand" ? "pilot" : null,
      maker_entity_id: null,
      family_or_variant_evidence: null,
      cross_retailer_evidence:
        row.row_id === atlas.row_id
          ? [
              `row:${atlas.row_id}`,
              `row:${goulet.row_id}`,
              "url:https://pilotpen.com/products/custom-823",
            ]
          : [],
      reason: "Human-reviewed fixture decision",
      reviewer: "phase611-human-review",
      reviewed_at: "2026-08-13T07:00:00.000Z",
    }));
    writeNdjson(
      path.join(valid.root, "decisions/coverage-ledger.ndjson"),
      ledger,
    );
    writeNdjson(
      path.join(valid.root, "decisions/blocking-gaps.ndjson"),
      ledger.filter((row) => row.disposition === "blocking_gap"),
    );
    const manifest = {
      schema_version: 1,
      generated_at: "2026-08-13T07:00:00.000Z",
      artifacts: [] as unknown[],
    };
    writeJson(path.join(valid.root, "artifact-manifest.json"), manifest);
    assert.throws(
      () => runPhase611Audit("verify-final", source.path, valid.root),
      /artifact manifest/i,
    );
    fs.rmSync(path.join(valid.root, "artifact-manifest.json"));
    const result = runPhase611Audit("verify-final", source.path, valid.root);
    assert.equal(result.pending, 0);
    assert.equal(result.dispositions.blocking_gap, 1);
    assert.ok(fs.existsSync(path.join(valid.root, "artifact-manifest.json")));

    fs.appendFileSync(
      path.join(valid.root, "raw/goldspot/page-001.html"),
      "<!-- tampered after freeze -->",
    );
    assert.throws(
      () => runPhase611Audit("verify-final", source.path, valid.root),
      /byte count changed|hash changed|artifact manifest/i,
    );
    fs.writeFileSync(
      path.join(valid.root, "raw/goldspot/page-001.html"),
      fs
        .readFileSync(
          path.join(valid.root, "raw/goldspot/page-001.html"),
          "utf8",
        )
        .replace("<!-- tampered after freeze -->", ""),
    );

    writeNdjson(
      path.join(valid.root, "decisions/coverage-ledger.ndjson"),
      ledger.slice(1),
    );
    assert.throws(
      () => runPhase611Audit("verify-final", source.path, valid.root),
      /bijection|row_id/i,
    );
  } finally {
    valid.dispose();
    source.dispose();
  }
});

test("Phase 611 rejects unreplayable identity and cross-source claims", () => {
  const valid = fixture();
  const source = cleanSourceCopy();
  try {
    runPhase611Audit("verify-capture", source.path, valid.root);
    const rows = fs
      .readFileSync(
        path.join(valid.root, "normalized/directory-rows.ndjson"),
        "utf8",
      )
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as ReturnType<typeof buildDirectoryRow>);
    const base = rows.map(
      (row): CoverageLedgerRow => ({
        row_id: row.row_id,
        disposition: "deferred",
        matched_entity_id: null,
        matched_entity_slug: null,
        maker_entity_id: null,
        family_or_variant_evidence: null,
        cross_retailer_evidence: [],
        reason: "Needs more identity evidence",
        reviewer: "phase611-human-review",
        reviewed_at: "2026-08-13T07:00:00.000Z",
      }),
    );
    const writeLedger = (ledger: CoverageLedgerRow[]) => {
      writeNdjson(
        path.join(valid.root, "decisions/coverage-ledger.ndjson"),
        ledger,
      );
      writeNdjson(
        path.join(valid.root, "decisions/blocking-gaps.ndjson"),
        ledger.filter((row) => row.disposition === "blocking_gap"),
      );
    };
    const brand = rows.find((row) => row.row_kind === "brand");
    const pen = rows.find((row) => row.row_kind === "pen_product");
    assert.ok(brand && pen);

    const falseAlias = structuredClone(base);
    const falseAliasRow = falseAlias.find((row) => row.row_id === brand.row_id);
    assert.ok(falseAliasRow);
    Object.assign(falseAliasRow, {
      disposition: "covered_alias",
      matched_entity_id: "CJXe8UpnkHLJ",
      matched_entity_slug: "aurora",
    });
    writeLedger(falseAlias);
    assert.throws(
      () => runPhase611Audit("verify-final", source.path, valid.root),
      /canonical\/alias surface/i,
    );

    const wrongMaker = structuredClone(base);
    const wrongMakerRow = wrongMaker.find((row) => row.row_id === pen.row_id);
    assert.ok(wrongMakerRow);
    Object.assign(wrongMakerRow, {
      disposition: "covered_family_or_variant",
      matched_entity_id: "oJyaQy9bEc8V",
      matched_entity_slug: "pilot-custom-823",
      maker_entity_id: "CJXe8UpnkHLJ",
      family_or_variant_evidence: "Pilot Custom 823 family",
    });
    writeLedger(wrongMaker);
    assert.throws(
      () => runPhase611Audit("verify-final", source.path, valid.root),
      /maker.*made_by/i,
    );

    const sameSource = structuredClone(base);
    const sameSourceRow = sameSource.find((row) => row.row_id === pen.row_id);
    assert.ok(sameSourceRow);
    Object.assign(sameSourceRow, {
      disposition: "blocking_gap",
      cross_retailer_evidence: [
        `row:${pen.row_id}`,
        "url:https://atlas.example/products/another-listing",
      ],
    });
    writeLedger(sameSource);
    assert.throws(
      () => runPhase611Audit("verify-final", source.path, valid.root),
      /duplicates a referenced retailer source/i,
    );

    sameSourceRow.cross_retailer_evidence.reverse();
    writeLedger(sameSource);
    assert.throws(
      () => runPhase611Audit("verify-final", source.path, valid.root),
      /duplicates a referenced retailer source/i,
    );

    const staleDeferred = structuredClone(base);
    staleDeferred[0].matched_entity_id = "Zt-PbXkE7UHM";
    writeLedger(staleDeferred);
    assert.throws(
      () => runPhase611Audit("verify-final", source.path, valid.root),
      /stale match\/evidence/i,
    );

    const candidatesPath = path.join(
      valid.root,
      "normalized/match-candidates.ndjson",
    );
    fs.appendFileSync(candidatesPath, "{}\n");
    writeLedger(base);
    assert.throws(
      () => runPhase611Audit("verify-final", source.path, valid.root),
      /match candidates/i,
    );
  } finally {
    valid.dispose();
    source.dispose();
  }
});
