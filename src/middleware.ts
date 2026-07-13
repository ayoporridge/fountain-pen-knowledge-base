import { type NextRequest, NextResponse } from "next/server";
import { HIDDEN_ARTICLE_SLUGS } from "@/lib/public-visibility";

const HIDDEN_PUBLIC_PATHS = new Set([
  "/api/chat",
  "/api/search",
  "/brand/banju",
  "/brand/saier",
  "/brand/shanghai",
  "/brand/yongxu",
  "/article/万特佳",
  "/article/公爵-duke",
  "/article/半句",
  "/article/永续",
  "/article/犀飞利-sheaffer-品牌泛称",
  ...HIDDEN_ARTICLE_SLUGS.map((slug) => `/article/${slug}`),
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

function normalizePathname(pathname: string) {
  const withoutTrailingSlash =
    pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  try {
    return decodeURIComponent(withoutTrailingSlash);
  } catch {
    return withoutTrailingSlash;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const hasInvalidTwoSegmentNamespace =
    segments.length === 2 && !ALLOWED_TWO_SEGMENT_NAMESPACES.has(segments[0]);

  if (
    normalizedPathname === "/new" ||
    HIDDEN_PUBLIC_PATHS.has(normalizedPathname) ||
    hasInvalidTwoSegmentNamespace ||
    /^\/[^/]+\/[^/]+\/edit\/?$/.test(normalizedPathname)
  ) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/new", "/:type/:slug", "/:type/:slug/edit"],
};
