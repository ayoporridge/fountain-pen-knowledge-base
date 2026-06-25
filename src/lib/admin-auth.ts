import { type NextRequest, NextResponse } from "next/server";

function requestToken(request: NextRequest) {
  const bearer = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i);
  return bearer?.[1] || request.headers.get("X-Admin-Token");
}

/**
 * Content writes are disabled by default.
 * To enable local/admin maintenance, set CONTENT_WRITE_ENABLED=true and provide
 * CONTENT_WRITE_TOKEN or ADMIN_TOKEN through environment variables.
 */
export function verifyWriteAccess(request: NextRequest): NextResponse | null {
  if (process.env.CONTENT_WRITE_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Content editing is disabled" },
      { status: 403 },
    );
  }

  const expectedToken =
    process.env.CONTENT_WRITE_TOKEN || process.env.ADMIN_TOKEN;
  if (!expectedToken) {
    return NextResponse.json(
      { error: "Content write token is not configured" },
      { status: 403 },
    );
  }

  if (requestToken(request) !== expectedToken) {
    return NextResponse.json(
      { error: "Invalid or missing write token" },
      { status: 403 },
    );
  }

  return null;
}

export function verifyAdminToken(request: NextRequest): NextResponse | null {
  return verifyWriteAccess(request);
}
