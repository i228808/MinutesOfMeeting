import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom provides getContext but throws "Not implemented"; override to a safe stub.
HTMLCanvasElement.prototype.getContext = () => null;

afterEach(() => {
  cleanup();
});


