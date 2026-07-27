import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
      "./node_modules/.pnpm/@libsql+*/node_modules/@libsql/**/*",
    ],
  },
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
};

export default nextConfig;
