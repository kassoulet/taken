import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom", // Use happy-dom environment instead of jsdom
    setupFiles: ["./tests/setup.ts"], // Setup file for test utilities
    globals: true, // Enable vitest globals (describe, it, expect, etc.)
    testTimeout: 10000,
    css: true,
    include: ["tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
