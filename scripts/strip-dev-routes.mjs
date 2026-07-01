/**
 * Post-build script: removes dev-only routes from the static export output.
 * Run automatically via: "build": "next build && node scripts/strip-dev-routes.mjs"
 *
 * Any route listed here is available in `pnpm dev` but never ships to production.
 */

import { rmSync, existsSync } from "fs";

const DEV_ROUTES = ["out/calculator", "out/calculator2"];

for (const route of DEV_ROUTES) {
  if (existsSync(route)) {
    rmSync(route, { recursive: true, force: true });
    console.log(`stripped dev route: ${route}`);
  }
}
