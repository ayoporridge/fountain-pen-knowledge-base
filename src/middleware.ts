import { type NextRequest, NextResponse } from "next/server";
import {
  getCanonicalEntityPath,
  getReclassifiedArticlePath,
} from "@/lib/entity-redirects";
import { getPublicEntityBySlug } from "@/lib/public-visibility";

const HIDDEN_PUBLIC_PATHS = new Set([
  "/api/chat",
  "/api/search",
  "/by/price",
  "/by/size",
  "/by/usage",
]);

const ALLOWED_TWO_SEGMENT_NAMESPACES = new Set([
  "api",
  "article",
  "brand",
  "by",
  "concept",
  "exhibits",
  "fill_system",
  "library",
  "material",
  "nib",
  "pen",
]);

const PUBLIC_BY_DIMENSIONS = new Set([
  "brand",
  "fill",
  "material",
  "nib",
  "origin",
]);

const ENTITY_NAMESPACES = new Set([
  "article",
  "brand",
  "concept",
  "fill_system",
  "material",
  "nib",
  "pen",
]);

function normalizePathname(pathname: string) {
  const withoutTrailingSlash =
    pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  try {
    return decodeURIComponent(withoutTrailingSlash);
  } catch {
    return withoutTrailingSlash;
  }
}

function hardNotFound() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "content-type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const reclassifiedArticlePath =
    segments.length === 2
      ? getReclassifiedArticlePath(segments[0], segments[1])
      : null;
  const canonicalEntityPath =
    segments.length === 2
      ? getCanonicalEntityPath(segments[0], segments[1])
      : null;
  const hasInvalidTwoSegmentNamespace =
    segments.length === 2 && !ALLOWED_TWO_SEGMENT_NAMESPACES.has(segments[0]);
  const hasInvalidDimension =
    segments.length === 2 &&
    segments[0] === "by" &&
    !PUBLIC_BY_DIMENSIONS.has(segments[1]);

  if (reclassifiedArticlePath) {
    return NextResponse.redirect(
      new URL(reclassifiedArticlePath, request.url),
      308,
    );
  }

  if (canonicalEntityPath) {
    return NextResponse.redirect(
      new URL(canonicalEntityPath, request.url),
      308,
    );
  }

  if (
    normalizedPathname === "/new" ||
    HIDDEN_PUBLIC_PATHS.has(normalizedPathname) ||
    hasInvalidTwoSegmentNamespace ||
    hasInvalidDimension ||
    /^\/[^/]+\/[^/]+\/edit\/?$/.test(normalizedPathname)
  ) {
    return hardNotFound();
  }

  if (segments.length === 2 && ENTITY_NAMESPACES.has(segments[0])) {
    const entity = await getPublicEntityBySlug(segments[0], segments[1]);
    if (!entity) return hardNotFound();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/new", "/:type/:slug", "/:type/:slug/edit"],
  runtime: "nodejs",
};
