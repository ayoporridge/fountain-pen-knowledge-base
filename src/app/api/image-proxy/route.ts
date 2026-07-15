import { type NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import {
  fetchExternalImage,
  getPublicMediaUrl,
  isRichardsPensUrl,
  MediaFetchError,
  pickExternalMediaUrl,
} from "@/lib/media-url";
import { publicMediaFilter } from "@/lib/public-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      `SELECT media.id, media.image_url, media.thumbnail_url, media.local_path
       FROM media_assets media
       JOIN public_entities public_owner ON public_owner.id = media.entity_id
       WHERE media.id = ?
         AND ${publicMediaFilter("media")}`,
      [id],
    )) as
      | {
          id: string;
          image_url: string | null;
          thumbnail_url: string | null;
          local_path: string | null;
        }
      | undefined;

    if (!media) return errorResponse("Approved media not found", 404);
    const localUrl = getPublicMediaUrl({
      id: media.id,
      localPath: media.local_path,
      imageUrl: media.image_url,
      thumbnailUrl: media.thumbnail_url,
    });
    if (localUrl && !localUrl.startsWith("/api/image-proxy")) {
      const response = NextResponse.redirect(
        new URL(localUrl, request.url),
        307,
      );
      response.headers.set("Cache-Control", "no-store");
      return response;
    }
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
    const body = image.body;
    const contentType = image.contentType;
    const responseBody = body.buffer.slice(
      body.byteOffset,
      body.byteOffset + body.byteLength,
    ) as ArrayBuffer;
    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "no-store",
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
