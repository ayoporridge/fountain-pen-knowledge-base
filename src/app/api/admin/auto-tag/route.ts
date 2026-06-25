import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { execute, queryAll } from "@/lib/db";

export async function POST(request: NextRequest) {
  const deny = verifyAdminToken(request);
  if (deny) return deny;
  try {
    console.log("=== Auto-tagging entities (keyword-based) ===\n");

    // Get all entities with their attributes
    const entities = (await queryAll(`
      SELECT e.id, e.slug, e.name, ea.key, ea.value
      FROM entities e
      LEFT JOIN entity_attributes ea ON e.id = ea.entity_id
      WHERE e.type = 'pen'
    `)) as Array<{
      id: string;
      slug: string;
      name: string;
      key: string | null;
      value: string | null;
    }>;

    console.log(`Found ${entities.length} pen entities with attributes\n`);

    // Group by entity
    const entityMap = new Map<
      string,
      { id: string; slug: string; name: string; attrs: Record<string, string> }
    >();
    for (const row of entities) {
      if (!entityMap.has(row.id)) {
        entityMap.set(row.id, {
          id: row.id,
          slug: row.slug,
          name: row.name,
          attrs: {},
        });
      }
      if (row.key && row.value) {
        const entity = entityMap.get(row.id);
        if (entity) {
          entity.attrs[row.key] = row.value;
        }
      }
    }

    console.log(`Unique pen entities: ${entityMap.size}\n`);

    let totalInserted = 0;
    const stats: Record<string, number> = {};

    // Helper function to match keywords
    function matchKeyword(value: string, keywords: string[]): boolean {
      const lowerValue = value.toLowerCase();
      return keywords.some((kw) => lowerValue.includes(kw.toLowerCase()));
    }

    // Process each entity
    for (const [entityId, entity] of entityMap) {
      const { attrs } = entity;

      // === body_material ===
      if (attrs.body_material) {
        const v = attrs.body_material;
        let tagSlug: string | null = null;

        if (matchKeyword(v, ["pmma", "亚克力", "透明树脂"]))
          tagSlug = "mat-pmma";
        else if (matchKeyword(v, ["赛璐璐"])) tagSlug = "mat-celluloid";
        else if (matchKeyword(v, ["漆艺", "莳绘", "漆器", "生漆"]))
          tagSlug = "mat-lacquer";
        else if (matchKeyword(v, ["碳纤维"])) tagSlug = "mat-carbon-fiber";
        else if (matchKeyword(v, ["木", "实木"])) tagSlug = "mat-wood";
        else if (matchKeyword(v, ["黄铜", "铜"])) tagSlug = "mat-brass";
        else if (matchKeyword(v, ["铝"])) tagSlug = "mat-aluminum";
        else if (matchKeyword(v, ["钛"])) tagSlug = "mat-titanium";
        else if (matchKeyword(v, ["金属", "不锈钢", "钢"]))
          tagSlug = "mat-steel";
        else if (matchKeyword(v, ["树脂", "塑料"])) tagSlug = "mat-resin";

        if (tagSlug) {
          const id = randomUUID();
          await execute(
            `INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id)
             SELECT ?, ?, id FROM tags WHERE slug = ?`,
            [id, entityId, tagSlug],
          );
          stats.body_material = (stats.body_material || 0) + 1;
          totalInserted++;
        }
      }

      // === price_range ===
      if (attrs.price_range && attrs.price_range !== "—") {
        const v = attrs.price_range;
        let tagSlug: string | null = null;

        const match = v.match(/(\d+)-(\d+)/);
        if (match) {
          const low = parseInt(match[1], 10);
          const high = parseInt(match[2], 10);
          const avg = (low + high) / 2;

          if (avg <= 200) tagSlug = "price-entry";
          else if (avg <= 500) tagSlug = "price-mid";
          else if (avg <= 1000) tagSlug = "price-upper-mid";
          else if (avg <= 2000) tagSlug = "price-high";
          else if (avg <= 5000) tagSlug = "price-flagship";
          else tagSlug = "price-ultra";
        }

        if (tagSlug) {
          const id = randomUUID();
          await execute(
            `INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id)
             SELECT ?, ?, id FROM tags WHERE slug = ?`,
            [id, entityId, tagSlug],
          );
          stats.price = (stats.price || 0) + 1;
          totalInserted++;
        }
      }

      // === writing_style → nib_type ===
      if (attrs.writing_style) {
        const v = attrs.writing_style;
        let tagSlug: string | null = null;

        if (matchKeyword(v, ["长刀研"])) tagSlug = "nib-naginata";
        else if (matchKeyword(v, ["弹性尖", "超弹性"])) tagSlug = "nib-flex";
        else if (matchKeyword(v, ["手磨"])) tagSlug = "nib-custom-ground";
        else if (matchKeyword(v, ["斜尖"])) tagSlug = "nib-italic";
        else if (matchKeyword(v, ["音乐"])) tagSlug = "nib-music";
        else if (matchKeyword(v, ["暗尖"])) tagSlug = "nib-round";
        else if (matchKeyword(v, ["钢尖", "金尖", "活塞"]))
          tagSlug = "nib-standard";

        if (tagSlug) {
          const id = randomUUID();
          await execute(
            `INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id)
             SELECT ?, ?, id FROM tags WHERE slug = ?`,
            [id, entityId, tagSlug],
          );
          stats.nib_type = (stats.nib_type || 0) + 1;
          totalInserted++;
        }
      }

      // === nib_size → size ===
      if (attrs.nib_size) {
        const v = attrs.nib_size;
        let tagSlug: string | null = null;

        if (matchKeyword(v, ["暗尖", "5号", "小"])) tagSlug = "size-compact";
        else if (matchKeyword(v, ["10号", "标准"])) tagSlug = "size-standard";
        else if (matchKeyword(v, ["15号", "大"])) tagSlug = "size-large";
        else if (matchKeyword(v, ["20号", "超大"])) tagSlug = "size-oversize";

        if (tagSlug) {
          const id = randomUUID();
          await execute(
            `INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id)
             SELECT ?, ?, id FROM tags WHERE slug = ?`,
            [id, entityId, tagSlug],
          );
          stats.size = (stats.size || 0) + 1;
          totalInserted++;
        }
      }

      // === origin_country → origin ===
      if (attrs.origin_country) {
        const v = attrs.origin_country;
        let tagSlug: string | null = null;

        if (matchKeyword(v, ["中国"])) tagSlug = "origin-china";
        else if (matchKeyword(v, ["日本"])) tagSlug = "origin-japan";
        else if (matchKeyword(v, ["德国"])) tagSlug = "origin-germany";
        else if (matchKeyword(v, ["美国"])) tagSlug = "origin-usa";
        else if (matchKeyword(v, ["台湾"])) tagSlug = "origin-taiwan";
        else if (matchKeyword(v, ["意大利"])) tagSlug = "origin-italy";
        else if (matchKeyword(v, ["法国"])) tagSlug = "origin-france";
        else if (matchKeyword(v, ["英国"])) tagSlug = "origin-uk";

        if (tagSlug) {
          const id = randomUUID();
          await execute(
            `INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id)
             SELECT ?, ?, id FROM tags WHERE slug = ?`,
            [id, entityId, tagSlug],
          );
          stats.origin = (stats.origin || 0) + 1;
          totalInserted++;
        }
      }
    }

    console.log("=== Results ===");
    console.log(`Total new entity_tags inserted: ${totalInserted}`);
    console.log("\nBy dimension:");
    for (const [dim, count] of Object.entries(stats).sort(
      (a, b) => b[1] - a[1],
    )) {
      console.log(`  ${dim}: ${count} entities`);
    }

    // Verify final counts
    console.log("\n=== Final entity_tags counts by dimension ===");
    const finalCounts = await queryAll(`
      SELECT t.dimension, COUNT(DISTINCT et.entity_id) as entity_count
      FROM entity_tags et
      JOIN tags t ON et.tag_id = t.id
      GROUP BY t.dimension
      ORDER BY t.dimension
    `);

    for (const row of finalCounts as Array<{
      dimension: string;
      entity_count: number;
    }>) {
      console.log(`  ${row.dimension}: ${row.entity_count} entities`);
    }

    return NextResponse.json({
      success: true,
      inserted: totalInserted,
      stats,
      finalCounts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Auto-tagging failed:", error);
    return NextResponse.json(
      { error: "Auto-tagging failed", details: message },
      { status: 500 },
    );
  }
}
