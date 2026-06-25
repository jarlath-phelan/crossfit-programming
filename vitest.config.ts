import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "out", "site", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // The engine is the critical, fully-deterministic core: hold it to a high bar.
      include: ["library/**/*.ts"],
      exclude: ["library/**/*.{test,spec}.ts", "library/**/index.ts", "**/*.d.ts"],
      thresholds: {
        "library/autoregulation/**": {
          statements: 95,
          branches: 90,
          functions: 100,
          lines: 95,
        },
      },
    },
  },
});
