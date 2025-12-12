import { describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OTPForm } from "./otp-form";

describe("OTPForm", () => {
  test("verify button disabled until all digits filled", async () => {
    const user = userEvent.setup();
    const onVerify = vi.fn(async () => {});
    const onResend = vi.fn(async () => {});

    render(<OTPForm email="a@b.com" onVerify={onVerify} onResend={onResend} />);

    const verifyBtn = screen.getByRole("button", { name: /verify code/i });
    expect(verifyBtn).toBeDisabled();

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "1");
    await user.type(inputs[1], "2");
    await user.type(inputs[2], "3");
    await user.type(inputs[3], "4");
    await user.type(inputs[4], "5");
    await user.type(inputs[5], "6");

    expect(verifyBtn).not.toBeDisabled();
  });

  test("pasting 6 digits triggers onVerify", async () => {
    const onVerify = vi.fn(async () => {});
    const onResend = vi.fn(async () => {});

    render(<OTPForm email="a@b.com" onVerify={onVerify} onResend={onResend} />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: (type: string) => (type === "text" ? "123456" : ""),
      },
    });

    expect(onVerify).toHaveBeenCalledWith("123456");
  });

  test("backspace on empty input focuses previous input", async () => {
    const user = userEvent.setup();
    const onVerify = vi.fn(async () => {});
    const onResend = vi.fn(async () => {});

    render(<OTPForm email="a@b.com" onVerify={onVerify} onResend={onResend} />);
    const inputs = screen.getAllByRole("textbox");

    await user.type(inputs[0], "1");
    inputs[1].focus();
    await user.keyboard("{Backspace}");

    expect(document.activeElement).toBe(inputs[0]);
  });

  test("pasting fewer than 6 digits focuses next input", async () => {
    const onVerify = vi.fn(async () => {});
    const onResend = vi.fn(async () => {});

    render(<OTPForm email="a@b.com" onVerify={onVerify} onResend={onResend} />);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: (type: string) => (type === "text" ? "12" : ""),
      },
    });
    expect(onVerify).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(inputs[2]);
  });

  test("ignores non-numeric input", async () => {
    const user = userEvent.setup();
    const onVerify = vi.fn(async () => {});
    const onResend = vi.fn(async () => {});

    render(<OTPForm email="a@b.com" onVerify={onVerify} onResend={onResend} />);
    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "a");
    expect((inputs[0] as HTMLInputElement).value).toBe("");
  });

  test("ignores non-numeric paste data", async () => {
    const onVerify = vi.fn(async () => {});
    const onResend = vi.fn(async () => {});

    render(<OTPForm email="a@b.com" onVerify={onVerify} onResend={onResend} />);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: (type: string) => (type === "text" ? "abc" : ""),
      },
    });
    expect(onVerify).not.toHaveBeenCalled();
    expect((inputs[0] as HTMLInputElement).value).toBe("");
  });

  test("shows spinner when loading", () => {
    const onVerify = vi.fn(async () => {});
    const onResend = vi.fn(async () => {});

    const { container } = render(<OTPForm email="a@b.com" onVerify={onVerify} onResend={onResend} loading />);
    expect(screen.queryByText("Verify Code")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  test("renders error message when provided", () => {
    const onVerify = vi.fn(async () => {});
    const onResend = vi.fn(async () => {});

    render(<OTPForm email="a@b.com" onVerify={onVerify} onResend={onResend} error="Bad code" />);
    expect(screen.getByText("Bad code")).toBeInTheDocument();
  });

  test("resend calls onResend and resets timer", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const onVerify = vi.fn(async () => {});
    const onResend = vi.fn(async () => {});

    render(<OTPForm email="a@b.com" onVerify={onVerify} onResend={onResend} initialResendTimer={1} />);

    // Wait for timer to reach 0
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    const resendBtn = screen.getByRole("button", { name: /resend code/i });
    expect(resendBtn).not.toBeDisabled();
    await act(async () => {
      fireEvent.click(resendBtn);
      // allow async onClick to progress
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onResend).toHaveBeenCalled();
    // After click it resets to initialResendTimer=1s, so countdown should appear again.
    expect(screen.getByRole("button", { name: /resend \(1s\)/i })).toBeInTheDocument();

    vi.useRealTimers();
  });
});


