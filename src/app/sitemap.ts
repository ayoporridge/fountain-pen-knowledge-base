import type { MetadataRoute } from "next";
import { queryAll } from "@/lib/db";
import { PUBLIC_ENTITY_FILTER_SQL } from "@/lib/public-visibility";

const BASE_URL = "https://fountain-pen-graph.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${BASE_URL}/library`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/library/sources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/library/media`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/library/diagrams`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/library/community`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/browse`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/timeline`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/exhibits`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Dynamic entity pages
  try {
    const entities = (await queryAll(
      `SELECT type, slug, updated_at
       FROM entities e
       WHERE ${PUBLIC_ENTITY_FILTER_SQL}
       ORDER BY updated_at DESC`,
    )) as Array<{ type: string; slug: string; updated_at: string }>;

    const entityPages: MetadataRoute.Sitemap = entities.map((e) => ({
      url: `${BASE_URL}/${e.type}/${e.slug}`,
      lastModified: new Date(e.updated_at),
      changeFrequency: "weekly" as const,
      priority: e.type === "pen" ? 0.9 : e.type === "brand" ? 0.7 : 0.5,
    }));

    return [...staticPages, ...entityPages];
  } catch {
    return staticPages;
  }
}
