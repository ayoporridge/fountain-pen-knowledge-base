import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Get the D1 database binding from the Cloudflare context.
 * Works in both production (Cloudflare Pages) and local dev (wrangler pages dev).
 */
export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}
