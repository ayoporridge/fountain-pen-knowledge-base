/**
 * Markdown rendering verification script.
 * Usage: npx tsx scripts/verify-markdown.ts
 */

import { createClient } from "@libsql/client";
import { renderMarkdown } from "../src/lib/markdown";

const db = createClient({ url: "file:data/fpkg.db" });

interface Issue {
  slug: string;
  type: string;
  name: string;
  issue: string;
  detail: string;
}

function isInsideTag(html: string, pos: number, tag: string): boolean {
  const before = html.lastIndexOf(`<${tag}`, pos);
  const after = html.indexOf(`</${tag}>`, pos);
  const close = html.lastIndexOf(`</${tag}>`, pos);
  return before > close && after > pos;
}

async function main() {
  const result = await db.execute(`
    SELECT type, slug, name, body_md
    FROM entities
    WHERE body_md IS NOT NULL AND body_md != ''
    ORDER BY LENGTH(body_md) DESC
    LIMIT 80
  `);

  const issues: Issue[] = [];
  let checked = 0;
  let rendered = 0;

  for (const r of result.rows) {
      const md = String(r.body_md || "");
      const slug = String(r.slug);
      const type = String(r.type);
      const name = String(r.name);
      checked++;

      try {
        const html = await renderMarkdown(md);

        if (!html || html.trim().length === 0) {
          issues.push({ slug, type, name, issue: "empty output", detail: `Input ${md.length} chars` });
          continue;
        }
        rendered++;

        // Check 1: Unrendered markdown syntax (excluding content inside <code>/<pre>/<table>)
        const checks: Array<{ regex: RegExp; name: string }> = [
          { regex: /(?<![`\w>])\*\*(?!\s*\*)[^*\n]+(?<!\s)\*\*(?![`\w<])/g, name: "bold **" },
          { regex: /\[\[([^\]]+)\]\]/g, name: "wiki-link" },
        ];

        for (const { regex, name: patternName } of checks) {
          const matches = html.match(regex);
          if (matches) {
            const realMatches = matches.filter((m) => {
              const idx = html.indexOf(m);
              return !isInsideTag(html, idx, "code") &&
                     !isInsideTag(html, idx, "pre") &&
                     !isInsideTag(html, idx, "table");
            });
            if (realMatches.length > 0) {
              issues.push({
                slug, type, name,
                issue: `unrendered ${patternName}`,
                detail: realMatches.slice(0, 3).join(", "),
              });
            }
          }
        }

        // Check 2: Image src issues
        const imgRegex = /<img[^>]+src="([^"]*)"[^>]*>/g;
        let imgMatch;
        while ((imgMatch = imgRegex.exec(html)) !== null) {
          const src = imgMatch[1];
          if (src.endsWith(".md")) {
            issues.push({ slug, type, name, issue: "image src ends with .md", detail: src });
          }
          if (src.startsWith("javascript:")) {
            issues.push({ slug, type, name, issue: "image with javascript: src", detail: src.substring(0, 80) });
          }
        }

        // Check 3: Link href issues (only outside tables)
        const allLinkMatches = [...html.matchAll(/<a[^>]+href="([^"]*)"[^>]*>/g)];
        for (const lm of allLinkMatches) {
          const href = lm[1];
          const idx = lm.index!;
          if (isInsideTag(html, idx, "table")) continue;
          if (href.endsWith(".md") || href.endsWith(".mdx")) {
            issues.push({ slug, type, name, issue: "link href ends with .md", detail: href });
          }
          if (href.startsWith("javascript:")) {
            issues.push({ slug, type, name, issue: "javascript: link", detail: href.substring(0, 80) });
          }
        }

        // Check 4: Pipe characters near img OUTSIDE tables
        const pipeImgMatches = [...html.matchAll(/\|\s*<img/g)];
        for (const pm of pipeImgMatches) {
          if (!isInsideTag(html, pm.index!, "table")) {
            issues.push({ slug, type, name, issue: "pipe-separated images (non-table)", detail: html.substring(Math.max(0, pm.index! - 50), pm.index! + 80) });
            break; // One per page
          }
        }

        // Check 5: Empty headings
        if (/<h[1-6][^>]*>\s*<\/h[1-6]>/g.test(html)) {
          issues.push({ slug, type, name, issue: "empty heading tags", detail: "" });
        }

        // Check 6: Inline event handlers should never be emitted from markdown
        const eventAttrMatch = html.match(/\son[a-z]+\s*=/i);
        if (eventAttrMatch) {
          issues.push({
            slug, type, name,
            issue: "inline event handler",
            detail: eventAttrMatch[0],
          });
        }

        // Check 7: Heading level skips (check if our normalizer fixed them)
        const headingMatch = html.match(/<h([1-6])[^>]*>/g);
        if (headingMatch) {
          const levels = headingMatch.map((h) => parseInt(h.charAt(2)));
          for (let i = 1; i < levels.length; i++) {
            if (levels[i] - levels[i - 1] > 1) {
              issues.push({
                slug, type, name,
                issue: "heading level skip",
                detail: `h${levels[i - 1]} → h${levels[i]}`,
              });
              break;
            }
          }
        }

      } catch (err: any) {
        issues.push({ slug, type, name, issue: "render error", detail: err.message?.substring(0, 100) || String(err) });
      }
    }

    // Report
    console.log(`\n=== Markdown Verification Report ===`);
    console.log(`Checked: ${checked} | Rendered: ${rendered} | Pages with issues: ${new Set(issues.map((i) => i.slug)).size} | Total issues: ${issues.length}\n`);

    if (issues.length > 0) {
      const byType: Record<string, Issue[]> = {};
      for (const issue of issues) {
        (byType[issue.issue] ??= []).push(issue);
      }
      for (const [issueType, items] of Object.entries(byType)) {
        console.log(`\n## ${issueType} (${items.length})`);
        for (const item of items.slice(0, 8)) {
          console.log(`  [${item.type}] ${item.name} (${item.slug})`);
          console.log(`    ${item.detail.substring(0, 120)}`);
        }
        if (items.length > 8) console.log(`  ... and ${items.length - 8} more`);
      }
    } else {
      console.log("No issues found!");
    }

  console.log(`\nDone. ${issues.length} issues found.`);
  return issues.length;
}

main()
  .then((count) => process.exit(count > 0 ? 1 : 0))
  .catch((err: any) => {
    console.error("Script error:", err);
    process.exit(2);
  });
