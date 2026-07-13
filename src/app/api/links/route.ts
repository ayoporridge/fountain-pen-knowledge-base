import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { verifyWriteAccess } from "@/lib/admin-auth";
import { execute, queryAll, queryOne } from "@/lib/db";
import { publicEntityFilter } from "@/lib/public-visibility";

const PUBLIC_LINK_SELECT = `
  source_entity.type || ':' || source_entity.slug as source_key,
  source_entity.slug as source_slug,
  source_entity.name as source_name,
  source_entity.type as source_type,
  target_entity.type || ':' || target_entity.slug as target_key,
  target_entity.slug as target_slug,
  target_entity.name as target_name,
  target_entity.type as target_type,
  el.link_type,
  el.reason`;

// Public graph reads use stable type/slug keys. Database ids and audit
// timestamps stay server-side.
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const depth = Math.min(
    Number(request.nextUrl.searchParams.get("depth")) || 1,
    2,
  );

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const center = (await queryOne(
    `SELECT e.id FROM entities e
     WHERE e.slug = ? AND ${publicEntityFilter("e")}`,
    [slug],
  )) as { id: string } | undefined;
  if (!center) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const forward = await queryAll(
    `SELECT ${PUBLIC_LINK_SELECT}
     FROM entity_links el
     JOIN entities source_entity ON source_entity.id = el.source_id
     JOIN entities target_entity ON target_entity.id = el.target_id
     WHERE el.source_id = ?
       AND el.link_type != 'reverse'
       AND ${publicEntityFilter("source_entity")}
       AND ${publicEntityFilter("target_entity")}
     ORDER BY target_entity.name, el.link_type`,
    [center.id],
  );

  const backlinks = await queryAll(
    `SELECT ${PUBLIC_LINK_SELECT}
     FROM entity_links el
     JOIN entities source_entity ON source_entity.id = el.source_id
     JOIN entities target_entity ON target_entity.id = el.target_id
     WHERE el.target_id = ?
       AND el.link_type != 'reverse'
       AND ${publicEntityFilter("source_entity")}
       AND ${publicEntityFilter("target_entity")}
     ORDER BY source_entity.name, el.link_type`,
    [center.id],
  );

  let secondHopForward: unknown[] = [];
  let secondHopBacklinks: unknown[] = [];

  if (depth >= 2) {
    const neighborRows = (await queryAll(
      `SELECT DISTINCT
         CASE WHEN el.source_id = ? THEN el.target_id ELSE el.source_id END as neighbor_id
       FROM entity_links el
       JOIN entities neighbor ON neighbor.id =
         CASE WHEN el.source_id = ? THEN el.target_id ELSE el.source_id END
       WHERE (el.source_id = ? OR el.target_id = ?)
         AND el.link_type != 'reverse'
         AND ${publicEntityFilter("neighbor")}
       ORDER BY neighbor.name
       LIMIT 10`,
      [center.id, center.id, center.id, center.id],
    )) as Array<{ neighbor_id: string }>;
    const neighbors = neighborRows.map((row) => row.neighbor_id);

    if (neighbors.length > 0) {
      const placeholders = neighbors.map(() => "?").join(",");
      secondHopForward = await queryAll(
        `SELECT ${PUBLIC_LINK_SELECT}
         FROM entity_links el
         JOIN entities source_entity ON source_entity.id = el.source_id
         JOIN entities target_entity ON target_entity.id = el.target_id
         WHERE el.source_id IN (${placeholders})
           AND el.link_type != 'reverse'
           AND ${publicEntityFilter("source_entity")}
           AND ${publicEntityFilter("target_entity")}
         ORDER BY source_entity.name, target_entity.name, el.link_type`,
        neighbors,
      );
      secondHopBacklinks = await queryAll(
        `SELECT ${PUBLIC_LINK_SELECT}
         FROM entity_links el
         JOIN entities source_entity ON source_entity.id = el.source_id
         JOIN entities target_entity ON target_entity.id = el.target_id
         WHERE el.target_id IN (${placeholders})
           AND el.link_type != 'reverse'
           AND ${publicEntityFilter("source_entity")}
           AND ${publicEntityFilter("target_entity")}
         ORDER BY target_entity.name, source_entity.name, el.link_type`,
        neighbors,
      );
    }
  }

  return NextResponse.json({
    forward,
    backlinks,
    ...(depth >= 2 ? { secondHopForward, secondHopBacklinks } : {}),
  });
}

// POST /api/links — create a link
export async function POST(request: NextRequest) {
  const deny = verifyWriteAccess(request);
  if (deny) return deny;

  const body = await request.json();
  const { source_id, target_id, link_type } = body;

  if (!source_id || !target_id) {
    return NextResponse.json(
      { error: "source_id and target_id are required" },
      { status: 400 },
    );
  }

  if (source_id === target_id) {
    return NextResponse.json(
      { error: "Cannot create self-link" },
      { status: 400 },
    );
  }

  // Verify both entities exist
  const source = await queryOne("SELECT id FROM entities WHERE id = ?", [
    source_id,
  ]);
  const target = await queryOne("SELECT id FROM entities WHERE id = ?", [
    target_id,
  ]);

  if (!source || !target) {
    return NextResponse.json(
      { error: "Source or target entity not found" },
      { status: 404 },
    );
  }

  const id = nanoid(12);

  try {
    await execute(
      "INSERT INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, ?)",
      [id, source_id, target_id, link_type || "related"],
    );

    const link = await queryOne("SELECT * FROM entity_links WHERE id = ?", [
      id,
    ]);
    return NextResponse.json(link, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "Link already exists" },
        { status: 409 },
      );
    }
    if (message.includes("Cannot create self-link")) {
      return NextResponse.json(
        { error: "Cannot create self-link" },
        { status: 400 },
      );
    }
    throw err;
  }
}

// DELETE /api/links?id=xxx — delete a link
export async function DELETE(request: NextRequest) {
  const deny = verifyWriteAccess(request);
  if (deny) return deny;

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Check if link exists
  const link = await queryOne("SELECT id FROM entity_links WHERE id = ?", [id]);
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  await execute("DELETE FROM entity_links WHERE id = ?", [id]);
  return NextResponse.json({ success: true });
}
