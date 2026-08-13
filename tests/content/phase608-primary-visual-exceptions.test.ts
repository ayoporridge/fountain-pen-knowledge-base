import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import type Database from "better-sqlite3";
import sharp from "sharp";

const ROOT = process.cwd();
const CANDIDATE = path.join(
  ROOT,
  ".planning/quick/260813-emg-aurora-ipsilon-demo-colors-sheaffer-impe/checkpoint-final/catalog.db",
);
const REAL_CATALOG = path.join(ROOT, "data/fpkg.db");

const EXCEPTION_PATHS = [
  "/images/library/site-original/phase152/articles/alan-turing-pens.svg",
  "/images/library/site-original/phase184/sailor-1911-profit.svg",
  "/images/library/site-original/phase500/danitrio/brand.svg",
  "/images/library/site-original/phase500/david-oscarson/brand.svg",
  "/images/library/site-original/phase499/ensso/brand.svg",
  "/images/library/site-original/phase499/fpr/brand.svg",
  "/images/library/site-original/phase500/gioia/brand.svg",
  "/images/library/site-original/phase497/gravitas/brand.svg",
  "/images/library/site-original/phase497/kanwrite/brand.svg",
  "/images/library/site-original/phase499/kilk/brand.svg",
  "/images/library/site-original/phase498/lotus/brand.svg",
  "/images/library/site-original/phase498/magna-carta/brand.svg",
  "/images/library/site-original/phase498/ranga/brand.svg",
  "/images/library/site-original/phase499/schon-dsgn/brand.svg",
  "/images/library/site-original/phase497/st-dupont/brand.svg",
  "/images/library/site-original/phase498/taccia/brand.svg",
  "/images/library/site-original/phase147/aurora/talentum.svg",
  "/images/library/site-original/phase137/conklin/conklin-all-american.svg",
  "/images/library/site-original/phase136/conklin/conklin-duragraph.svg",
  "/images/library/site-original/phase267/edison/collier.svg",
  "/images/library/site-original/phase291/esterbrook/model-j.svg",
  "/images/library/site-original/kaweco-perkeo/kaweco-perkeo-all-black-facts.svg",
  "/images/library/site-original/phase111/pilot/pilot-custom-ns.svg",
  "/images/library/site-original/phase110/pilot/pilot-grance.svg",
  "/images/library/site-original/phase110/pilot/pilot-silvern.svg",
  "/images/library/site-original/phase138/wancher/wancher-aizu-ao.svg",
  "/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg",
  "/images/library/site-original/phase134/wancher/dream-pen-true-ebonite-silk-black.svg",
  "/images/library/site-original/phase597/nahvalur/nahvalur-pen-of-year-snake-2025.svg",
  "/images/library/site-original/phase597/nahvalur/nahvalur-triad.svg",
  "/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg",
] as const;

const INTERNAL_REVIEW_TERMS =
  /\b(?:review(?:ed)?|accepted|rejected|audit|candidate|disposition|qualified|publication|canonical|identity|scope|evidence)\b|内部审核|审核|档案证据线|证据边界|证据层级|发布边界|身份冲突|来源层级|编辑判断|temporal conflict/iu;
const DISCLAIMER =
  /本站原创事实示意图，非产品照片|本站原创非产品照片示意图|非产品照片|原创非照片|not a product photo(?:graph)?|non-photo/iu;

function sha256(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function familySnapshot(databasePath: string): Record<string, string | null> {
  return Object.fromEntries(
    [databasePath, `${databasePath}-wal`, `${databasePath}-shm`].map(
      (filePath) => [
        filePath,
        fs.existsSync(filePath) ? sha256(filePath) : null,
      ],
    ),
  );
}

function visibleText(svg: string): string {
  return [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/giu)]
    .map((match) => match[1].replace(/<[^>]+>/gu, " "))
    .join(" ");
}

test("Phase 608 keeps the 31 repaired primary visuals bound, readable, and free of internal review language", async () => {
  assert.equal(EXCEPTION_PATHS.length, 31);
  assert.equal(new Set(EXCEPTION_PATHS).size, 31);

  const candidateBefore = familySnapshot(CANDIDATE);
  const realBefore = familySnapshot(REAL_CATALOG);

  for (const publicPath of EXCEPTION_PATHS) {
    const filePath = path.join(ROOT, "public", publicPath);
    assert.ok(fs.existsSync(filePath), `missing repaired SVG: ${publicPath}`);
    execFileSync("xmllint", ["--noout", filePath], { stdio: "pipe" });
    const svg = fs.readFileSync(filePath, "utf8");
    assert.match(svg, DISCLAIMER, `${publicPath} needs a non-photo boundary`);
    assert.doesNotMatch(
      visibleText(svg),
      INTERNAL_REVIEW_TERMS,
      `${publicPath} exposes internal review language`,
    );

    const metadata = await sharp(filePath, { failOn: "error" }).metadata();
    assert.equal(metadata.format, "svg", `${publicPath} must decode as SVG`);
    assert.ok(
      metadata.width && metadata.height,
      `${publicPath} needs intrinsic dimensions`,
    );
  }

  process.env.SQLITE_USE_URI = "1";
  const load = createRequire(import.meta.url);
  const BetterSqlite3 = load("better-sqlite3") as typeof Database;
  const databaseUri = `file:${encodeURI(CANDIDATE)}?mode=ro&immutable=1`;
  const database = new BetterSqlite3(databaseUri, {
    readonly: true,
    fileMustExist: true,
  });
  try {
    const placeholders = EXCEPTION_PATHS.map(() => "?").join(",");
    const rows = database
      .prepare<string[], { local_path: string }>(
        `SELECT media.local_path
           FROM public_entities AS public_entity
           JOIN publication_v2_qualified_primary_media AS qualified
             ON qualified.entity_id = public_entity.id
           JOIN media_assets AS media
             ON media.id = qualified.media_id
            AND media.entity_id = qualified.entity_id
          WHERE media.local_path IN (${placeholders})
          ORDER BY media.local_path`,
      )
      .all(...EXCEPTION_PATHS);
    assert.equal(rows.length, EXCEPTION_PATHS.length);
    assert.deepEqual(
      new Set(rows.map((row) => row.local_path)),
      new Set(EXCEPTION_PATHS),
    );
  } finally {
    database.close();
  }

  assert.deepEqual(familySnapshot(CANDIDATE), candidateBefore);
  assert.deepEqual(familySnapshot(REAL_CATALOG), realBefore);
});
