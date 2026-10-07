import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src/", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/tests/unit/**/*.test.ts?(x)"],
    setupFiles: ["src/tests/unit/setup.ts"],
    css: false,
  },
});
