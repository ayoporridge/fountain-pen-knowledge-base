import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const CHROMIUM_PATH = path.join(
  process.env.HOME || "",
  "Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
);

const externalBaseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const baseURL = externalBaseUrl || "http://127.0.0.1:3107";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: {
    baseURL,
    headless: true,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          executablePath: CHROMIUM_PATH,
        },
      },
    },
    {
      name: "mobile",
      testMatch: /site-quality\.spec\.ts/,
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        userAgent: devices["iPhone 13"].userAgent,
        launchOptions: {
          executablePath: CHROMIUM_PATH,
        },
      },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "TURSO_DATABASE_URL= TURSO_AUTH_TOKEN= pnpm start -p 3107",
        url: "http://127.0.0.1:3107",
        reuseExistingServer: false,
        timeout: 60000,
      },
});
