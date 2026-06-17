import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount React trees after every test to keep them isolated.
afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia; provide a minimal stub for theme/install code.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// pdf.js and Radix reference browser APIs that jsdom lacks. Provide tiny stubs.
class FakeDOMMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  multiplySelf() {
    return this;
  }
  scaleSelf() {
    return this;
  }
  translateSelf() {
    return this;
  }
}

class FakeResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const g = globalThis as unknown as Record<string, unknown>;
if (!g.DOMMatrix) g.DOMMatrix = FakeDOMMatrix;
if (!g.Path2D) g.Path2D = class {};
if (!g.ResizeObserver) g.ResizeObserver = FakeResizeObserver;
