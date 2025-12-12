import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm, SmokeyBackground } from "./login-form";

describe("LoginForm", () => {
  test("submits email + password when not loading", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByText(/^Sign In$/));

    expect(onSubmit).toHaveBeenCalledWith("a@b.com", "secret123");
  });

  test("does not submit when loading", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginForm onSubmit={onSubmit} loading />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByText(/signing in\.\.\./i));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("google login sets window.location.href", async () => {
    const user = userEvent.setup();
    const oldLocation = window.location;
    // Make location writable for this test (jsdom allows redefining in most cases).
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://example.com" },
    });

    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: /sign in with google/i }));

    expect(window.location.href).toBe("http://localhost:5000/api/auth/google");
    Object.defineProperty(window, "location", { configurable: true, value: oldLocation });
  });
});

describe("SmokeyBackground", () => {
  test("renders even when WebGL is not supported", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const oldGetContext = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error test stub
    HTMLCanvasElement.prototype.getContext = () => null;

    render(<SmokeyBackground />);
    expect(spy).toHaveBeenCalled();

    HTMLCanvasElement.prototype.getContext = oldGetContext;
    spy.mockRestore();
  });

  test("initializes WebGL and cleans up listeners on unmount", async () => {
    const oldGetContext = HTMLCanvasElement.prototype.getContext;
    const oldRaf = window.requestAnimationFrame;
    const oldCancel = window.cancelAnimationFrame;

    const gl = {
      VERTEX_SHADER: 0x8b31,
      FRAGMENT_SHADER: 0x8b30,
      COMPILE_STATUS: 0x8b81,
      LINK_STATUS: 0x8b82,
      ARRAY_BUFFER: 0x8892,
      STATIC_DRAW: 0x88e4,
      FLOAT: 0x1406,
      TRIANGLES: 0x0004,
      createShader: vi.fn(() => ({})),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn(() => true),
      getShaderInfoLog: vi.fn(() => ""),
      deleteShader: vi.fn(),
      createProgram: vi.fn(() => ({})),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn(() => true),
      getProgramInfoLog: vi.fn(() => ""),
      useProgram: vi.fn(),
      createBuffer: vi.fn(() => ({})),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      getUniformLocation: vi.fn(() => ({})),
      uniform3f: vi.fn(),
      uniform2f: vi.fn(),
      uniform1f: vi.fn(),
      viewport: vi.fn(),
      drawArrays: vi.fn(),
    };

    // @ts-expect-error test stub
    HTMLCanvasElement.prototype.getContext = () => gl;
    window.requestAnimationFrame = vi.fn(() => 1);
    window.cancelAnimationFrame = vi.fn();

    const { unmount } = render(<SmokeyBackground />);
    // trigger mouse move to cover handler
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    canvas.getBoundingClientRect = () => ({ left: 10, top: 20, right: 0, bottom: 0, width: 100, height: 100, x: 10, y: 20, toJSON: () => {} });
    canvas.dispatchEvent(new MouseEvent("mousemove", { clientX: 15, clientY: 25 }));
    // unmount triggers cleanup removing listeners + cancelAnimationFrame
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();

    HTMLCanvasElement.prototype.getContext = oldGetContext;
    window.requestAnimationFrame = oldRaf;
    window.cancelAnimationFrame = oldCancel;
  });

  test("handles shader compilation errors", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const oldGetContext = HTMLCanvasElement.prototype.getContext;

    const gl = {
      VERTEX_SHADER: 0x8b31,
      FRAGMENT_SHADER: 0x8b30,
      COMPILE_STATUS: 0x8b81,
      LINK_STATUS: 0x8b82,
      createShader: vi.fn(() => ({})),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn(() => false),
      getShaderInfoLog: vi.fn(() => "bad shader"),
      deleteShader: vi.fn(),
    };

    // @ts-expect-error test stub
    HTMLCanvasElement.prototype.getContext = () => gl;
    render(<SmokeyBackground />);

    expect(spy).toHaveBeenCalled();
    HTMLCanvasElement.prototype.getContext = oldGetContext;
    spy.mockRestore();
  });

  test("handles program link errors", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const oldGetContext = HTMLCanvasElement.prototype.getContext;

    const gl = {
      VERTEX_SHADER: 0x8b31,
      FRAGMENT_SHADER: 0x8b30,
      COMPILE_STATUS: 0x8b81,
      LINK_STATUS: 0x8b82,
      ARRAY_BUFFER: 0x8892,
      STATIC_DRAW: 0x88e4,
      FLOAT: 0x1406,
      TRIANGLES: 0x0004,
      createShader: vi.fn(() => ({})),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn(() => true),
      getShaderInfoLog: vi.fn(() => ""),
      deleteShader: vi.fn(),
      createProgram: vi.fn(() => ({})),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn(() => false),
      getProgramInfoLog: vi.fn(() => "bad link"),
      useProgram: vi.fn(),
      createBuffer: vi.fn(() => ({})),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      getUniformLocation: vi.fn(() => ({})),
      uniform3f: vi.fn(),
    };

    // @ts-expect-error test stub
    HTMLCanvasElement.prototype.getContext = () => gl;
    render(<SmokeyBackground />);

    expect(spy).toHaveBeenCalled();
    HTMLCanvasElement.prototype.getContext = oldGetContext;
    spy.mockRestore();
  });
});


