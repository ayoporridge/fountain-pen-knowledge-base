import { defineConfig } from "@playwright/test";
import path from "node:path";

const CHROMIUM_PATH = path.join(
  process.env.HOME || "",
  "Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        launchOptions: {
          executablePath: CHROMIUM_PATH,
        },
      },
    },
  ],
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
