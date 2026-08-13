import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = "/Users/xz/Documents/fountain-pen-graph";

const FILES = [
  "phase140/delta/delta.svg",
  "phase140/delta/dolcevita-mid-size-current.svg",
  "phase140/omas/omas.svg",
  "phase140/omas/ogiva-current.svg",
  "phase140/pineider/pineider.svg",
  "phase140/pineider/avatar-ur.svg",
  "phase140/santini/santini.svg",
  "phase140/santini/libra.svg",
  "phase140/scribo/scribo.svg",
  "phase140/scribo/feel.svg",
  "phase140/stipula/stipula.svg",
  "phase140/stipula/etruria-magnifica.svg",
  "phase140/visconti/divina-elegance.svg",
  "phase140/visconti/mirage-original.svg",
  "phase141/ystudio/brand.svg",
  "phase141/ystudio/classic-revolve.svg",
];

test("Phase 140 and 141 legacy primary SVGs use recognizable pens and Chinese explanations", () => {
  for (const relativePath of FILES) {
    const file = path.join(
      ROOT,
      "public/images/library/site-original",
      relativePath,
    );
    const svg = fs.readFileSync(file, "utf8");
    assert.match(svg, /width="1600"/);
    assert.match(svg, /height="900"/);
    assert.match(svg, /[\u3400-\u9fff]/);
    assert.match(svg, /non-photo|非产品实拍/);
    assert.doesNotMatch(svg, /<circle cx="250" cy="450" r="140"/);
    assert.doesNotMatch(svg, /M170 500l260-150 260 150/);
    assert.doesNotMatch(svg, /M180 430l500-110 500 110/);
  }
});
