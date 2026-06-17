import { describe, it, expect } from "vitest";

import {
  listDocs,
  getPage,
  createPage,
  deleteDoc,
  listRevisions,
  getRevision,
  restoreRevision,
} from "@/lib/sanityAdmin";

/**
 * TA-2 — admin data layer (offline-safe fallbacks).
 *
 * No Sanity env is configured in the test environment (`sanityConfigured` is
 * false). Every helper in `sanityAdmin.ts` — reads, CRUD, and revision history
 * (E-1) — must degrade to a graceful empty/`null`/`{ ok:false }` and NEVER
 * throw, so the public static build keeps working with local fallback content.
 *
 * (This also covers TE-1's offline behavior for the history helpers.)
 */

describe("TA-2: admin data layer (no Sanity env)", () => {
  it("listDocs('page') resolves to [] ", async () => {
    await expect(listDocs("page")).resolves.toEqual([]);
  });

  it("getPage('home') resolves to null", async () => {
    await expect(getPage("home")).resolves.toBeNull();
  });

  it("createPage('x','X') resolves to { ok: false }", async () => {
    const res = await createPage("x", "X");
    expect(res.ok).toBe(false);
  });

  it("deleteDoc('id') resolves to { ok: false }", async () => {
    const res = await deleteDoc("id");
    expect(res.ok).toBe(false);
  });

  it("listRevisions('id') resolves to [] (TE-1 offline)", async () => {
    await expect(listRevisions("id")).resolves.toEqual([]);
  });

  it("getRevision('id','r') resolves to null (TE-1 offline)", async () => {
    await expect(getRevision("id", "r")).resolves.toBeNull();
  });

  it("restoreRevision('id','r') resolves to { ok: false } (TE-1 offline)", async () => {
    const res = await restoreRevision("id", "r");
    expect(res.ok).toBe(false);
  });

  it("none of the helpers throw when Sanity isn't configured", async () => {
    await expect(
      Promise.all([
        listDocs("page"),
        getPage("home"),
        createPage("x", "X"),
        deleteDoc("id"),
        listRevisions("id"),
        getRevision("id", "r"),
        restoreRevision("id", "r"),
      ]),
    ).resolves.toBeTruthy();
  });
});
