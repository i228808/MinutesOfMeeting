const { APIError, errorHandler, asyncHandler, notFoundHandler } = require("../src/middleware/error.middleware");

function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("backend/src/middleware/error.middleware", () => {
  const prevEnv = process.env;

  beforeEach(() => {
    process.env = { ...prevEnv };
  });

  afterAll(() => {
    process.env = prevEnv;
  });

  test("APIError sets fields", () => {
    const err = new APIError("nope", 418, { a: 1 });
    expect(err.message).toBe("nope");
    expect(err.statusCode).toBe(418);
    expect(err.details).toEqual({ a: 1 });
    expect(err.isOperational).toBe(true);
  });

  test("APIError uses defaults for statusCode/details when omitted", () => {
    const err = new APIError("msg");
    expect(err.statusCode).toBe(500);
    expect(err.details).toBeNull();
  });

  test("notFoundHandler returns 404 payload", () => {
    const req = { method: "GET", originalUrl: "/missing" };
    const res = makeRes();
    notFoundHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Not Found",
      message: "Cannot GET /missing",
    });
  });

  test("asyncHandler forwards rejection to next", async () => {
    const fn = async () => {
      throw new Error("boom");
    };
    const wrapped = asyncHandler(fn);
    const next = jest.fn();
    wrapped({}, {}, next);
    // allow Promise.resolve(...).catch(next) to run
    await new Promise((r) => setImmediate(r));
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].message).toBe("boom");
  });

  test("errorHandler handles generic error (production)", () => {
    process.env.NODE_ENV = "production";
    const err = new Error("x");
    const req = {};
    const res = makeRes();
    errorHandler(err, req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "x" });
  });

  test("errorHandler falls back to Internal Server Error when message is falsy", () => {
    process.env.NODE_ENV = "production";
    const err = new Error("");
    const res = makeRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });

  test("errorHandler includes stack in development", () => {
    process.env.NODE_ENV = "development";
    const err = new Error("x");
    err.stack = "STACK";
    const res = makeRes();
    errorHandler(err, {}, res, () => {});
    expect(res.json.mock.calls[0][0]).toMatchObject({ error: "x", stack: "STACK" });
  });

  test("errorHandler handles ValidationError", () => {
    const err = new Error("bad");
    err.name = "ValidationError";
    err.errors = {
      email: { path: "email", message: "invalid" },
      password: { path: "password", message: "weak" },
    };
    const res = makeRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Validation Error",
      details: [
        { field: "email", message: "invalid" },
        { field: "password", message: "weak" },
      ],
    });
  });

  test("errorHandler handles CastError", () => {
    const err = new Error("cast");
    err.name = "CastError";
    err.path = "id";
    err.value = "nope";
    const res = makeRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid id: nope" });
  });

  test("errorHandler handles duplicate key", () => {
    const err = new Error("dup");
    err.code = 11000;
    err.keyValue = { email: "a@b.com" };
    const res = makeRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Duplicate entry",
      details: { field: "email", value: "a@b.com" },
    });
  });

  test("errorHandler handles jwt errors", () => {
    const res1 = makeRes();
    const e1 = new Error("jwt");
    e1.name = "JsonWebTokenError";
    errorHandler(e1, {}, res1, () => {});
    expect(res1.status).toHaveBeenCalledWith(401);
    expect(res1.json).toHaveBeenCalledWith({ error: "Invalid token" });

    const res2 = makeRes();
    const e2 = new Error("exp");
    e2.name = "TokenExpiredError";
    errorHandler(e2, {}, res2, () => {});
    expect(res2.status).toHaveBeenCalledWith(401);
    expect(res2.json).toHaveBeenCalledWith({ error: "Token expired" });
  });

  test("errorHandler handles multer errors", () => {
    const e1 = new Error("file");
    e1.code = "LIMIT_FILE_SIZE";
    const res1 = makeRes();
    errorHandler(e1, {}, res1, () => {});
    expect(res1.status).toHaveBeenCalledWith(400);
    expect(res1.json).toHaveBeenCalledWith({ error: "File too large" });

    const e2 = new Error("file2");
    e2.code = "LIMIT_UNEXPECTED_FILE";
    const res2 = makeRes();
    errorHandler(e2, {}, res2, () => {});
    expect(res2.status).toHaveBeenCalledWith(400);
    expect(res2.json).toHaveBeenCalledWith({ error: "Unexpected file field" });
  });
});


