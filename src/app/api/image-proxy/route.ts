import { type NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import {
  fetchExternalImage,
  isRichardsPensUrl,
  MediaFetchError,
  pickExternalMediaUrl,
} from "@/lib/media-url";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")?.trim();
  const legacyUrl = request.nextUrl.searchParams.get("url")?.trim();

  if ((!id && !legacyUrl) || (id && legacyUrl)) {
    return errorResponse("Provide exactly one media id or legacy URL", 400);
  }

  let sourceUrl: string;
  let richardsPensOnly = false;

  if (id) {
    const media = (await queryOne(
      `SELECT id, image_url, thumbnail_url
       FROM media_assets
       WHERE id = ?
         AND asset_type = 'image'
         AND review_status = 'approved'
         AND usage_status IN ('primary', 'gallery')`,
      [id],
    )) as
      | { id: string; image_url: string | null; thumbnail_url: string | null }
      | undefined;

    if (!media) return errorResponse("Approved media not found", 404);
    const externalUrl = pickExternalMediaUrl({
      imageUrl: media.image_url,
      thumbnailUrl: media.thumbnail_url,
    });
    if (!externalUrl) {
      return errorResponse("Approved media has no proxyable HTTPS image", 404);
    }
    sourceUrl = externalUrl;
  } else {
    sourceUrl = legacyUrl || "";
    if (!isRichardsPensUrl(sourceUrl)) {
      return errorResponse("Legacy media URL is not allowed", 403);
    }
    richardsPensOnly = true;
  }

  try {
    const image = await fetchExternalImage(sourceUrl, { richardsPensOnly });
    return new NextResponse(image.body.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": String(image.body.byteLength),
        "Cache-Control":
          "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof MediaFetchError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Media fetch failed", 502);
  }
}
