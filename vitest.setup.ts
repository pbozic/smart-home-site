import "@testing-library/jest-dom";

// Puck's <Render> pulls in @dnd-kit, which references ResizeObserver — not
// implemented in jsdom. Provide a no-op stub so section-rendering tests work.
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}
