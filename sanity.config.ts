import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

/**
 * Sanity Studio configuration, mounted by the app at `/studio` (route owned by
 * the Frontend agent, which imports this config).
 *
 * `projectId`/`dataset` come from the public env vars. They fall back to
 * "placeholder"/"production" so typecheck + build stay green with NO Sanity
 * project configured — mirroring the local fallback in `src/lib/sanity.ts`.
 */
export default defineConfig({
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
