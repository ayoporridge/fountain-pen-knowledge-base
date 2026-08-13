import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import type Database from "better-sqlite3";

const ROOT = process.cwd();
const CANDIDATE = path.join(
  ROOT,
  ".planning/quick/260813-emg-aurora-ipsilon-demo-colors-sheaffer-impe/checkpoint-final/catalog.db",
);
const REAL_CATALOG = path.join(ROOT, "data/fpkg.db");

const SVG_PATHS = [
  "public/images/library/site-original/phase605/penlux/brand.svg",
  "public/images/library/site-original/phase604/banju/brand.svg",
  "public/images/library/site-original/sheaffer-p0/sheaffer-brand.svg",
  "public/images/library/site-original/phase123/platinum/platinum-izumo-family.svg",
  "public/images/library/site-original/phase115/aurora/aurora-ipsilon-resin-b11-n.svg",
  "public/images/library/site-original/phase114/aurora/aurora-ottantotto-resina-800.svg",
  "public/images/library/site-original/phase116/montegrappa/montegrappa-zero.svg",
  "public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg",
  "public/images/library/site-original/phase121/platinum/platinum-procyon-pns-5000.svg",
  "public/images/library/site-original/phase135/wancher/dream-pen-true-ebonite-marble-green.svg",
  "public/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg",
  "public/images/library/site-original/phase119/wancher/wancher-puchico.svg",
  "public/images/library/site-original/phase120/wancher/wancher-shizuku-glass-nib.svg",
  "public/images/library/site-original/phase600/ystudio/portable.svg",
  "public/images/library/site-original/phase600/ystudio/desk.svg",
  "public/images/library/site-original/phase600/ystudio/resin.svg",
  "public/images/library/site-original/phase590/pineider/pineider-grande-bellezza-forged-carbon.svg",
  "public/images/library/site-original/phase590/pineider/pineider-mystery-fast-filler.svg",
  "public/images/library/site-original/phase591/pineider/pineider-millenium.svg",
  "public/images/library/site-original/phase591/pineider/pineider-psycho.svg",
  "public/images/library/site-original/phase592/pineider/pineider-alba-classic.svg",
  "public/images/library/site-original/phase593/pineider/pineider-avatar-ur-mini.svg",
  "public/images/library/site-original/phase594/pineider/pineider-egosphere.svg",
  "public/images/library/site-original/phase595/pineider/pineider-avatar-ur-demo-metal.svg",
  "public/images/library/site-original/phase595/pineider/pineider-avatar-ur-glossy.svg",
] as const;

const PUBLIC_MEDIA_PATHS = SVG_PATHS.map((filePath) =>
  filePath.replace(/^public/, ""),
);

const INTERNAL_EDITORIAL_TERMS =
  /\b(?:phase|evidence|qualified|rejected|publication|canonical|scope|identity|audit|review|candidate|disposition)\b|审核|证据(?:边界|层级)?|发布边界|身份冲突|来源层级|编辑判断/iu;
const UNSAFE_SVG_ELEMENTS =
  /<(?:script|image|foreignObject|use)\b|\b(?:href|xlink:href)\s*=|data:image|https?:\/\/(?!www\.w3\.org\/2000\/svg\b)/iu;
const CHINESE_TEXT = /[\u3400-\u9fff]/u;
const DISCLAIMER = "本站原创事实示意图，非产品照片";

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

test("Phase 607 keeps 25 public primary SVGs readable, unique, and bound to candidate media paths", () => {
  assert.equal(SVG_PATHS.length, 25);
  assert.equal(new Set(SVG_PATHS).size, 25);
  assert.equal(new Set(PUBLIC_MEDIA_PATHS).size, 25);

  const candidateBefore = familySnapshot(CANDIDATE);
  const realBefore = familySnapshot(REAL_CATALOG);
  const hashes = new Set<string>();

  for (const relativePath of SVG_PATHS) {
    const absolutePath = path.join(ROOT, relativePath);
    assert.ok(fs.existsSync(absolutePath), `missing SVG: ${relativePath}`);
    execFileSync("xmllint", ["--noout", absolutePath], { stdio: "pipe" });

    const svg = fs.readFileSync(absolutePath, "utf8");
    assert.match(svg, /<svg\b[^>]*\bwidth="1600"[^>]*\bheight="900"/u);
    assert.match(svg, /\bviewBox="0 0 1600 900"/u);
    assert.match(svg, /\brole="img"/u);
    assert.match(svg, /\baria-labelledby="title desc"/u);
    assert.match(svg, /<title\b[^>]*\bid="title"[^>]*>[^<]+<\/title>/u);
    assert.match(svg, /<desc\b[^>]*\bid="desc"[^>]*>[^<]+<\/desc>/u);
    assert.match(svg, CHINESE_TEXT);
    assert.ok(svg.includes(DISCLAIMER), `${relativePath} lacks disclaimer`);
    assert.doesNotMatch(svg, INTERNAL_EDITORIAL_TERMS);
    assert.doesNotMatch(svg, UNSAFE_SVG_ELEMENTS);
    hashes.add(sha256(absolutePath));
  }

  assert.equal(hashes.size, SVG_PATHS.length, "every SVG needs a unique hash");

  process.env.SQLITE_USE_URI = "1";
  const load = createRequire(import.meta.url);
  const BetterSqlite3 = load("better-sqlite3") as typeof Database;
  const databaseUri = `file:${encodeURI(CANDIDATE)}?mode=ro&immutable=1`;
  const database = new BetterSqlite3(databaseUri, {
    readonly: true,
    fileMustExist: true,
  });

  try {
    const placeholders = PUBLIC_MEDIA_PATHS.map(() => "?").join(",");
    const rows = database
      .prepare<string[], { local_path: string }>(
        `SELECT local_path
           FROM media_assets
          WHERE review_status = 'approved'
            AND usage_status = 'primary'
            AND local_path IN (${placeholders})
          ORDER BY local_path`,
      )
      .all(...PUBLIC_MEDIA_PATHS);
    const boundPaths = rows.map((row) => row.local_path);
    assert.equal(rows.length, SVG_PATHS.length);
    assert.deepEqual(
      new Set(boundPaths),
      new Set(PUBLIC_MEDIA_PATHS),
      "candidate primary media must keep all 25 public paths",
    );
  } finally {
    database.close();
  }

  assert.deepEqual(familySnapshot(CANDIDATE), candidateBefore);
  assert.deepEqual(familySnapshot(REAL_CATALOG), realBefore);
});
