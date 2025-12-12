import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "./register-form";

describe("RegisterForm", () => {
  test("shows error on password mismatch", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("John Doe"), "Jane");
    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
    await user.type(screen.getAllByPlaceholderText("••••••••")[0], "password1");
    await user.type(screen.getAllByPlaceholderText("••••••••")[1], "password2");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("shows error on short password", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("John Doe"), "Jane");
    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
    await user.type(screen.getAllByPlaceholderText("••••••••")[0], "short");
    await user.type(screen.getAllByPlaceholderText("••••••••")[1], "short");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("submits when valid and not loading", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("John Doe"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
    await user.type(screen.getAllByPlaceholderText("••••••••")[0], "password1");
    await user.type(screen.getAllByPlaceholderText("••••••••")[1], "password1");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(onSubmit).toHaveBeenCalledWith("Jane Doe", "a@b.com", "password1");
  });

  test("google signup sets window.location.href", async () => {
    const user = userEvent.setup();
    const oldLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://example.com" },
    });

    render(<RegisterForm />);
    await user.click(screen.getByRole("button", { name: /sign up with google/i }));
    expect(window.location.href).toBe("http://localhost:5000/api/auth/google");
    Object.defineProperty(window, "location", { configurable: true, value: oldLocation });
  });

  test("loading state disables submission and shows loading text", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} loading />);

    await user.type(screen.getByPlaceholderText("John Doe"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
    await user.type(screen.getAllByPlaceholderText("••••••••")[0], "password1");
    await user.type(screen.getAllByPlaceholderText("••••••••")[1], "password1");

    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /creating account/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});


