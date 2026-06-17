import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

/**
 * TD-1 — doc list + Studio deep-links (DocListView).
 *
 * Posts/projects/settings are edited in the embedded Sanity Studio (decision
 * D2). The admin list builds Studio deep-links via the exported pure helpers
 * `studioEditHref` / `studioListHref`; we assert their URL scheme directly.
 *
 * We also render `DocListView type="post"` with `listDocs` mocked → [] to check
 * the empty state. `listDocs` is mocked so the render doesn't hit the network.
 */

vi.mock("@/lib/sanityAdmin", () => ({
  listDocs: () => Promise.resolve([]),
}));

afterEach(cleanup);

describe("TD-1: Studio deep-link helpers", () => {
  it("studioEditHref(type, id) → /studio/structure/<type>;<id>", async () => {
    const { studioEditHref } = await import("@/app/admin/DocListView");
    expect(studioEditHref("post", "abc123")).toBe(
      "/studio/structure/post;abc123",
    );
    expect(studioEditHref("project", "p-9")).toBe(
      "/studio/structure/project;p-9",
    );
  });

  it("studioListHref(type) → /studio/structure/<type>", async () => {
    const { studioListHref } = await import("@/app/admin/DocListView");
    expect(studioListHref("post")).toBe("/studio/structure/post");
    expect(studioListHref("siteSettings")).toBe(
      "/studio/structure/siteSettings",
    );
  });
});

describe("TD-1: DocListView render (empty)", () => {
  it("shows the empty state when listDocs returns []", async () => {
    const { DocListView } = await import("@/app/admin/DocListView");

    render(
      <DocListView type="post" title="Aktualno" newLabel="Nova objava" />,
    );

    expect(
      await screen.findByText(/Ni še nobenega vnosa/),
    ).toBeInTheDocument();
    // Heading renders too.
    expect(screen.getByText("Aktualno")).toBeInTheDocument();
  });
});
