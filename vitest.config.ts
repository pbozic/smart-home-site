import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  // `@vitejs/plugin-react` resolves a newer Vite than vitest 2.1.8's bundled
  // Vite, so the two `Plugin` types are nominally different. The plugin works
  // fine at runtime; the cast just reconciles the duplicate Vite type identities.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react()] as any,
  resolve: {
    alias: [
      // Mirror tsconfig paths. `@/sanity/*` -> ./sanity/* must be matched
      // before the catch-all `@/*` -> ./src/*, so it's listed first.
      { find: /^@\/sanity\//, replacement: path.resolve(__dirname, "sanity") + "/" },
      { find: /^@\//, replacement: path.resolve(__dirname, "src") + "/" },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Don't process/transform CSS — EditorCanvas imports "@measured/puck/puck.css".
    // With css:false, vitest stubs CSS modules so the import is a no-op.
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
