import { type NextRequest, NextResponse } from "next/server";

/**
 * Image proxy: fetches external images and serves them with caching.
 * Usage: /api/image-proxy?url=https://www.richardspens.com/images/...
 *
 * This avoids hotlink protection issues with external image hosts.
 * Images are cached at the CDN/browser level via Cache-Control headers.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "url parameter required" },
      { status: 400 },
    );
  }

  // Only allow specific domains for security
  const allowed = ["richardspens.com", "www.richardspens.com"];
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!allowed.includes(parsed.hostname)) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; fpkg/1.0)",
        Referer: "https://fountain-pen-graph.vercel.app/",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=2592000, stale-while-revalidate=86400", // 30 days
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
