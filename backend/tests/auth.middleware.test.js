function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("backend/src/middleware/auth.middleware", () => {
  const prevEnv = process.env;

  beforeEach(() => {
    process.env = { ...prevEnv, JWT_SECRET: "test-secret" };
  });

  afterAll(() => {
    process.env = prevEnv;
  });

  test("authenticate returns 401 when no token present", async () => {
    jest.isolateModules(async () => {
      jest.doMock("jsonwebtoken", () => ({ verify: jest.fn() }));
      jest.doMock("../src/models/User", () => ({ findById: jest.fn() }));

      const { authenticate } = require("../src/middleware/auth.middleware");
      const req = { headers: {}, cookies: {} };
      const res = makeRes();
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("authenticate returns 401 when token invalid", async () => {
    jest.isolateModules(async () => {
      const verify = jest.fn(() => {
        const err = new Error("bad");
        err.name = "JsonWebTokenError";
        throw err;
      });
      jest.doMock("jsonwebtoken", () => ({ verify }));
      jest.doMock("../src/models/User", () => ({ findById: jest.fn() }));

      const { authenticate } = require("../src/middleware/auth.middleware");
      const req = { headers: { authorization: "Bearer x" }, cookies: {} };
      const res = makeRes();
      const next = jest.fn();

      await authenticate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid token",
        message: "Your session is invalid. Please log in again.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("authenticate returns 401 when token expired", async () => {
    jest.isolateModules(async () => {
      const verify = jest.fn(() => {
        const err = new Error("expired");
        err.name = "TokenExpiredError";
        throw err;
      });
      jest.doMock("jsonwebtoken", () => ({ verify }));
      jest.doMock("../src/models/User", () => ({ findById: jest.fn() }));

      const { authenticate } = require("../src/middleware/auth.middleware");
      const req = { headers: { authorization: "Bearer x" }, cookies: {} };
      const res = makeRes();
      const next = jest.fn();

      await authenticate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token expired",
        message: "Your session has expired. Please log in again.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("authenticate returns 500 on unexpected errors", async () => {
    jest.isolateModules(async () => {
      const verify = jest.fn(() => {
        throw new Error("boom");
      });
      jest.doMock("jsonwebtoken", () => ({ verify }));
      jest.doMock("../src/models/User", () => ({ findById: jest.fn() }));

      const { authenticate } = require("../src/middleware/auth.middleware");
      const req = { headers: { authorization: "Bearer x" }, cookies: {} };
      const res = makeRes();
      const next = jest.fn();

      await authenticate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Authentication error",
        message: "An error occurred during authentication",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("optionalAuth attaches user when valid token present", async () => {
    jest.isolateModules(async () => {
      const verify = jest.fn(() => ({ id: "u1" }));
      const user = { _id: "u1" };
      const findById = jest.fn(async () => user);
      jest.doMock("jsonwebtoken", () => ({ verify }));
      jest.doMock("../src/models/User", () => ({ findById }));

      const { optionalAuth } = require("../src/middleware/auth.middleware");
      const req = { headers: { authorization: "Bearer token" }, cookies: {} };
      const res = makeRes();
      const next = jest.fn();

      await optionalAuth(req, res, next);
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });
  });

  test("optionalAuth does nothing when no token present", async () => {
    jest.isolateModules(async () => {
      jest.doMock("jsonwebtoken", () => ({ verify: jest.fn() }));
      jest.doMock("../src/models/User", () => ({ findById: jest.fn() }));

      const { optionalAuth } = require("../src/middleware/auth.middleware");
      const req = { headers: {}, cookies: {} };
      const res = makeRes();
      const next = jest.fn();

      await optionalAuth(req, res, next);
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  test("optionalAuth ignores invalid token", async () => {
    jest.isolateModules(async () => {
      const verify = jest.fn(() => {
        throw new Error("bad token");
      });
      jest.doMock("jsonwebtoken", () => ({ verify }));
      jest.doMock("../src/models/User", () => ({ findById: jest.fn() }));

      const { optionalAuth } = require("../src/middleware/auth.middleware");
      const req = { headers: { authorization: "Bearer x" }, cookies: {} };
      const res = makeRes();
      const next = jest.fn();

      await optionalAuth(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  test("authenticate returns 401 when user not found", async () => {
    jest.isolateModules(async () => {
      const verify = jest.fn(() => ({ id: "u1" }));
      const findById = jest.fn(async () => null);
      jest.doMock("jsonwebtoken", () => ({ verify }));
      jest.doMock("../src/models/User", () => ({ findById }));

      const { authenticate } = require("../src/middleware/auth.middleware");
      const req = { headers: { authorization: "Bearer token" }, cookies: {} };
      const res = makeRes();
      const next = jest.fn();

      await authenticate(req, res, next);
      expect(findById).toHaveBeenCalledWith("u1");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("authenticate attaches user and calls next when valid", async () => {
    jest.isolateModules(async () => {
      const verify = jest.fn(() => ({ id: "u1" }));
      const user = { _id: "u1", email: "a@b.com" };
      const findById = jest.fn(async () => user);
      jest.doMock("jsonwebtoken", () => ({ verify }));
      jest.doMock("../src/models/User", () => ({ findById }));

      const { authenticate } = require("../src/middleware/auth.middleware");
      const req = { headers: { authorization: "Bearer token" }, cookies: {} };
      const res = makeRes();
      const next = jest.fn();

      await authenticate(req, res, next);
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });
  });

  test("authenticate reads token from cookies when no Authorization header", async () => {
    jest.isolateModules(async () => {
      const verify = jest.fn(() => ({ id: "u1" }));
      const user = { _id: "u1" };
      const findById = jest.fn(async () => user);
      jest.doMock("jsonwebtoken", () => ({ verify }));
      jest.doMock("../src/models/User", () => ({ findById }));

      const { authenticate } = require("../src/middleware/auth.middleware");
      const req = { headers: {}, cookies: { token: "cookie-token" } };
      const res = makeRes();
      const next = jest.fn();

      await authenticate(req, res, next);
      expect(verify).toHaveBeenCalledWith("cookie-token", "test-secret");
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });
  });

  test("optionalAuth reads token from cookies and does not attach when user missing", async () => {
    jest.isolateModules(async () => {
      const verify = jest.fn(() => ({ id: "u1" }));
      const findById = jest.fn(async () => null);
      jest.doMock("jsonwebtoken", () => ({ verify }));
      jest.doMock("../src/models/User", () => ({ findById }));

      const { optionalAuth } = require("../src/middleware/auth.middleware");
      const req = { headers: {}, cookies: { token: "cookie-token" } };
      const res = makeRes();
      const next = jest.fn();

      await optionalAuth(req, res, next);
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});


