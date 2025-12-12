import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthPage from "./AuthPage";

function mockResponse(ok: boolean, body: any) {
  return Promise.resolve({
    ok,
    json: async () => body,
  } as Response);
}

describe("AuthPage", () => {
  beforeEach(() => {
    localStorage.clear();
    // make location writable
    Object.defineProperty(window, "location", { configurable: true, value: { href: "" } });
  });

  test("login success stores token and redirects", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(() => mockResponse(true, { token: "t", user: { id: "1" } })) as any);

    render(<AuthPage />);
    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByText(/^Sign In$/));

    expect(localStorage.getItem("token")).toBe("t");
    expect(window.location.href).toBe("/dashboard");
  });

  test("register switches to OTP when need_verification", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => mockResponse(true, { need_verification: true, email: "a@b.com" })) as any
    );

    render(<AuthPage />);
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    await user.type(screen.getByPlaceholderText("John Doe"), "Jane");
    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
    const pwInputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(pwInputs[0], "password123");
    await user.type(pwInputs[1], "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/verify your email/i)).toBeInTheDocument();
  });
});


