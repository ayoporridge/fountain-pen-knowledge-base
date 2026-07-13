import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { Readable } from "node:stream";
import { checkServerIdentity } from "node:tls";

export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
export const MEDIA_FETCH_TIMEOUT_MS = 8_000;
export const MAX_MEDIA_REDIRECTS = 3;

const RICHARDS_PENS_HOSTS = new Set([
  "richardspens.com",
  "www.richardspens.com",
]);

export type PublicMediaReference = {
  id?: string | null;
  localPath?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
};

export class MediaFetchError extends Error {
  constructor(
    message: string,
    readonly status = 502,
    readonly finalUrl?: string,
  ) {
    super(message);
    this.name = "MediaFetchError";
  }
}

function normalizeOnSitePath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("public/")) return `/${value.slice("public/".length)}`;
  return null;
}

export function getPublicMediaUrl(media: PublicMediaReference): string | null {
  for (const value of [media.localPath, media.thumbnailUrl, media.imageUrl]) {
    const onSitePath = normalizeOnSitePath(value);
    if (onSitePath) return onSitePath;
  }
  return media.id
    ? `/api/image-proxy?id=${encodeURIComponent(media.id)}`
    : null;
}

export function pickExternalMediaUrl(
  media: PublicMediaReference,
): string | null {
  for (const value of [media.imageUrl, media.thumbnailUrl]) {
    if (!value) continue;
    try {
      const parsed = new URL(value);
      if (parsed.protocol === "https:") return parsed.toString();
    } catch {
      // Keep looking for another approved URL on this media row.
    }
  }
  return null;
}

export function isRichardsPensUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      !parsed.port &&
      RICHARDS_PENS_HOSTS.has(parsed.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

function ipv4Number(address: string): number | null {
  const parts = address.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null;
  }
  return (
    (((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3]) >>> 0
  );
}

function inIpv4Cidr(value: number, base: string, bits: number): boolean {
  const baseValue = ipv4Number(base);
  if (baseValue === null) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (value & mask) === (baseValue & mask);
}

export function isBlockedIp(address: string): boolean {
  const normalized = address.toLowerCase().split("%")[0];
  const version = isIP(normalized);

  if (version === 4) {
    const value = ipv4Number(normalized);
    if (value === null) return true;
    return [
      ["0.0.0.0", 8],
      ["10.0.0.0", 8],
      ["100.64.0.0", 10],
      ["127.0.0.0", 8],
      ["169.254.0.0", 16],
      ["172.16.0.0", 12],
      ["192.0.0.0", 24],
      ["192.0.2.0", 24],
      ["192.168.0.0", 16],
      ["198.18.0.0", 15],
      ["198.51.100.0", 24],
      ["203.0.113.0", 24],
      ["224.0.0.0", 4],
      ["240.0.0.0", 4],
    ].some(([base, bits]) => inIpv4Cidr(value, String(base), Number(bits)));
  }

  if (version !== 6) return true;

  const mappedV4 = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (mappedV4) return isBlockedIp(mappedV4);

  const first = Number.parseInt(normalized.split(":")[0] || "0", 16);
  return (
    normalized === "::" ||
    normalized === "::1" ||
    (first >= 0xfc00 && first <= 0xfdff) ||
    (first >= 0xfe80 && first <= 0xfebf) ||
    (first >= 0xff00 && first <= 0xffff) ||
    normalized.startsWith("2001:db8:") ||
    normalized.startsWith("2001:10:") ||
    normalized.startsWith("2001:20:") ||
    normalized.startsWith("2001:0:") ||
    normalized.startsWith("64:ff9b:1:")
  );
}

export type MediaHostResolver = (
  hostname: string,
) => Promise<Array<{ address: string; family: number }>>;

export type MediaFetchTarget = {
  url: URL;
  hostname: string;
  address: string;
  family: number;
  headers: Record<string, string>;
  signal: AbortSignal;
};

export type MediaTransportResult = {
  response: Response;
  connectedAddress: string;
};

export type MediaFetcher = (
  target: MediaFetchTarget,
) => Promise<MediaTransportResult>;

const defaultResolver: MediaHostResolver = (hostname) =>
  lookup(hostname, { all: true, verbatim: true });

async function resolvePublicHostname(
  hostname: string,
  resolver: MediaHostResolver,
): Promise<Array<{ address: string; family: number }>> {
  if (isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new MediaFetchError(
        "Private or reserved address is not allowed",
        403,
      );
    }
    return [{ address: hostname, family: isIP(hostname) }];
  }

  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await resolver(hostname);
  } catch {
    throw new MediaFetchError("Media hostname could not be resolved", 502);
  }
  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isBlockedIp(address))
  ) {
    throw new MediaFetchError(
      "Media hostname resolved to a private or reserved address",
      403,
    );
  }
  return addresses;
}

function comparableIp(address: string): string {
  const normalized = address.toLowerCase().split("%")[0];
  return normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1] || normalized;
}

function sameIp(left: string, right: string): boolean {
  return comparableIp(left) === comparableIp(right);
}

const defaultFetcher: MediaFetcher = (target) =>
  new Promise((resolve, reject) => {
    let connectedAddress = "";
    const request = httpsRequest(
      target.url,
      {
        method: "GET",
        agent: false,
        family: target.family,
        servername: isIP(target.hostname) ? undefined : target.hostname,
        checkServerIdentity: (_hostname, certificate) =>
          checkServerIdentity(target.hostname, certificate),
        headers: {
          ...target.headers,
          Host: target.url.host,
        },
        lookup: (_hostname, _options, callback) =>
          callback(null, target.address, target.family === 6 ? 6 : 4),
        signal: target.signal,
      },
      (incoming) => {
        if (
          !connectedAddress ||
          isBlockedIp(connectedAddress) ||
          !sameIp(connectedAddress, target.address)
        ) {
          incoming.destroy();
          reject(
            new MediaFetchError(
              "Pinned media connection address could not be verified",
              403,
              target.url.toString(),
            ),
          );
          return;
        }

        const responseHeaders = new Headers();
        for (const [name, value] of Object.entries(incoming.headers)) {
          if (Array.isArray(value)) {
            for (const item of value) responseHeaders.append(name, item);
          } else if (value !== undefined) {
            responseHeaders.set(name, value);
          }
        }
        resolve({
          response: new Response(
            Readable.toWeb(incoming) as ReadableStream<Uint8Array>,
            {
              status: incoming.statusCode || 502,
              statusText: incoming.statusMessage,
              headers: responseHeaders,
            },
          ),
          connectedAddress,
        });
      },
    );

    request.once("socket", (socket) => {
      socket.once("secureConnect", () => {
        connectedAddress = socket.remoteAddress || "";
        if (
          !connectedAddress ||
          isBlockedIp(connectedAddress) ||
          !sameIp(connectedAddress, target.address)
        ) {
          request.destroy(
            new MediaFetchError(
              "Pinned media connection address did not match DNS validation",
              403,
              target.url.toString(),
            ),
          );
        }
      });
    });
    request.once("error", reject);
    request.end();
  });

function validateExternalUrl(
  value: string,
  allowedHostnames?: ReadonlySet<string>,
): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new MediaFetchError("Invalid media URL", 400);
  }
  const hostname = parsed.hostname.toLowerCase();
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.port
  ) {
    throw new MediaFetchError(
      "Only credential-free HTTPS media URLs are allowed",
      403,
    );
  }
  if (allowedHostnames && !allowedHostnames.has(hostname)) {
    throw new MediaFetchError("Media hostname is not allowed", 403);
  }
  return parsed;
}

export type MediaFetchResult = {
  body: Uint8Array;
  contentType: string;
  finalUrl: string;
  status: number;
};

export async function fetchExternalImage(
  initialUrl: string,
  options: {
    richardsPensOnly?: boolean;
    resolver?: MediaHostResolver;
    fetcher?: MediaFetcher;
  } = {},
): Promise<MediaFetchResult> {
  const allowedHostnames = options.richardsPensOnly
    ? RICHARDS_PENS_HOSTS
    : undefined;
  let current = validateExternalUrl(initialUrl, allowedHostnames);
  const resolver = options.resolver || defaultResolver;
  const fetcher = options.fetcher || defaultFetcher;

  for (let redirects = 0; redirects <= MAX_MEDIA_REDIRECTS; redirects += 1) {
    const addresses = await resolvePublicHostname(current.hostname, resolver);
    const pinned = addresses.find(({ family }) => family === 4) || addresses[0];

    let response: Response;
    try {
      const transport = await fetcher({
        url: new URL(current),
        hostname: current.hostname,
        address: pinned.address,
        family: pinned.family,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FountainPenGraph/1.0)",
          Accept: "image/avif,image/webp,image/*,*/*;q=0.5",
        },
        signal: AbortSignal.timeout(MEDIA_FETCH_TIMEOUT_MS),
      });
      if (
        isBlockedIp(transport.connectedAddress) ||
        !sameIp(transport.connectedAddress, pinned.address)
      ) {
        throw new MediaFetchError(
          "Media connection did not use the validated public address",
          403,
          current.toString(),
        );
      }
      response = transport.response;
    } catch (error) {
      if (error instanceof MediaFetchError) throw error;
      const message =
        error instanceof Error ? error.message : "Media fetch failed";
      throw new MediaFetchError(message, 502, current.toString());
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new MediaFetchError(
          "Redirect has no location",
          502,
          current.toString(),
        );
      }
      if (redirects === MAX_MEDIA_REDIRECTS) {
        throw new MediaFetchError(
          "Too many media redirects",
          508,
          current.toString(),
        );
      }
      await response.body?.cancel();
      current = validateExternalUrl(
        new URL(location, current).toString(),
        allowedHostnames,
      );
      continue;
    }

    if (!response.ok) {
      throw new MediaFetchError(
        `Media origin returned ${response.status}`,
        response.status,
        current.toString(),
      );
    }

    const contentType = (response.headers.get("content-type") || "")
      .split(";", 1)[0]
      .trim()
      .toLowerCase();
    if (!contentType.startsWith("image/")) {
      throw new MediaFetchError(
        "Media response is not an image",
        415,
        current.toString(),
      );
    }

    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_MEDIA_BYTES) {
      throw new MediaFetchError(
        "Media response exceeds 8 MiB",
        413,
        current.toString(),
      );
    }

    if (!response.body) {
      throw new MediaFetchError(
        "Media response has no body",
        502,
        current.toString(),
      );
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (received > MAX_MEDIA_BYTES) {
          await reader.cancel();
          throw new MediaFetchError(
            "Media stream exceeds 8 MiB",
            413,
            current.toString(),
          );
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const body = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return {
      body,
      contentType,
      finalUrl: current.toString(),
      status: response.status,
    };
  }

  throw new MediaFetchError(
    "Too many media redirects",
    508,
    current.toString(),
  );
}
