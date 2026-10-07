import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3000";

export default defineConfig({
  testDir: "./src/tests/e2e",
  outputDir: "./src/test-results/playwright",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    [process.env.CI ? "github" : "list"],
    ["html", { outputFolder: "./src/test-results/playwright-report", open: "never" }],
  ],
  use: { baseURL, trace: "on-first-retry" },
  webServer: {
    command: "npx serve out -l 3000 --no-clipboard",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true },
    },
    { name: "no-js", use: { ...devices["Desktop Chrome"], javaScriptEnabled: false } },
  ],
});
