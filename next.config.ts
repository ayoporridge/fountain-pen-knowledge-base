import type { NextConfig } from "next";

const isVercelBuild = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  ...(isVercelBuild ? {} : { output: "standalone" as const }),
  serverExternalPackages: [
    "better-sqlite3",
    "@libsql/client",
    "@libsql/core",
    "@libsql/hrana-client",
    "libsql",
    "js-base64",
    "@libsql/isomorphic-ws",
    "promise-limit",
  ],
  outputFileTracingIncludes: {
    "/*": [
      "./migrations/**/*.sql",
      ...(isVercelBuild
        ? []
        : ["./node_modules/.pnpm/@libsql+*/node_modules/@libsql/**/*"]),
    ],
  },
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
};

export default nextConfig;
