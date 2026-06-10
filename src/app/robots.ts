import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/new"],
    },
    sitemap: "https://fountain-pen-graph.fly.dev/sitemap.xml",
  };
}
