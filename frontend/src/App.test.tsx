import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

function mockOkJson(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: async () => body,
  } as Response);
}

describe("App routing", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(() => mockOkJson({ data: [] })) as any);
  });

  test("renders AuthPage at /", () => {
    window.history.pushState({}, "", "/");
    render(<App />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test("private route redirects to / when no token", () => {
    window.history.pushState({}, "", "/dashboard/meetings");
    render(<App />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test("with token, renders meetings page route", async () => {
    localStorage.setItem("token", "t");
    localStorage.setItem("user", JSON.stringify({ name: "U", email: "u@e.com", subscription_tier: "FREE" }));
    // MeetingsPage fetch
    (globalThis.fetch as any) = vi.fn(() => mockOkJson({ data: [{ _id: "1", title: "M1", status: "COMPLETED", created_at: new Date().toISOString() }] }));

    window.history.pushState({}, "", "/dashboard/meetings");
    render(<App />);
    expect(await screen.findByText("M1")).toBeInTheDocument();
  });

  test("oauth callback stores token and redirects", async () => {
    (globalThis.fetch as any) = vi.fn(() => mockOkJson({ user: { id: "u1" } }));
    window.history.pushState({}, "", "/auth/callback?token=tok");
    render(<App />);
    // allow promises to resolve
    await new Promise((r) => setTimeout(r, 0));
    expect(localStorage.getItem("token")).toBe("tok");
  });
});


