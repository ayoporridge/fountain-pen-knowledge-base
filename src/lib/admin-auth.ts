import { type NextRequest, NextResponse } from "next/server";

/**
 * Verify the X-Admin-Token header against ADMIN_TOKEN env var.
 * Returns null if authorized, or a 403 NextResponse if not.
 */
export function verifyAdminToken(request: NextRequest): NextResponse | null {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN not configured" },
      { status: 403 },
    );
  }

  const token = request.headers.get("X-Admin-Token");
  if (token !== adminToken) {
    return NextResponse.json(
      { error: "Invalid or missing X-Admin-Token" },
      { status: 403 },
    );
  }

  return null; // authorized
}
