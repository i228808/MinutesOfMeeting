function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.redirect = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  return res;
}

describe("backend/src/controllers/auth.controller", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.CLIENT_URL = "http://localhost:5173";
    process.env.JWT_EXPIRES_IN = "7d";
  });

  test("register sends error via next when missing fields", async () => {
    jest.doMock("passport", () => ({ authenticate: () => (req, res, next) => next() }));
    jest.doMock("../src/models/User", () => ({ findOne: jest.fn(), create: jest.fn() }));
    jest.doMock("../src/models/Subscription", () => ({ create: jest.fn(), findOne: jest.fn(), deleteOne: jest.fn() }));
    jest.doMock("../src/utils/jwt", () => ({ generateToken: jest.fn(() => "t") }));
    jest.doMock("../src/services/notification.service", () => ({ sendOTP: jest.fn(async () => {}) }));

    const c = require("../src/controllers/auth.controller");
    const req = { body: { email: "a@b.com" } };
    const res = makeRes();
    const next = jest.fn();
    c.register(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  test("login returns token when password matches", async () => {
    jest.doMock("passport", () => ({ authenticate: () => (req, res, next) => next() }));
    const user = {
      _id: "u1",
      name: "A",
      email: "a@b.com",
      profile_image: null,
      subscription_tier: "FREE",
      auth_provider: "local",
      password: "hash",
      comparePassword: jest.fn(async () => true),
    };
    const findOne = jest.fn(() => ({ select: jest.fn(async () => user) }));
    jest.doMock("../src/models/User", () => ({ findOne }));
    jest.doMock("../src/models/Subscription", () => ({ create: jest.fn() }));
    jest.doMock("../src/utils/jwt", () => ({ generateToken: jest.fn(() => "jwt") }));

    const c = require("../src/controllers/auth.controller");
    const req = { body: { email: "A@B.COM", password: "pw" } };
    const res = makeRes();
    const next = jest.fn();
    c.login(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, token: "jwt" })
    );
  });

  test("logout clears cookie", async () => {
    jest.doMock("passport", () => ({ authenticate: () => (req, res, next) => next() }));
    jest.doMock("../src/models/User", () => ({}));
    jest.doMock("../src/models/Subscription", () => ({}));
    jest.doMock("../src/utils/jwt", () => ({ generateToken: jest.fn(() => "t") }));

    const c = require("../src/controllers/auth.controller");
    const req = {};
    const res = makeRes();
    const next = jest.fn();
    c.logout(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(res.clearCookie).toHaveBeenCalledWith("token");
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Logged out successfully" });
  });

  test("verifyEmail returns 400 on missing fields", async () => {
    jest.doMock("passport", () => ({ authenticate: () => (req, res, next) => next() }));
    jest.doMock("../src/models/User", () => ({ findOne: jest.fn() }));
    jest.doMock("../src/models/Subscription", () => ({ findOne: jest.fn() }));
    jest.doMock("../src/utils/jwt", () => ({ generateToken: jest.fn(() => "t") }));

    const c = require("../src/controllers/auth.controller");
    const req = { body: { email: "a@b.com" } };
    const res = makeRes();
    const next = jest.fn();
    c.verifyEmail(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  test("refreshToken returns new token", async () => {
    jest.doMock("passport", () => ({ authenticate: () => (req, res, next) => next() }));
    jest.doMock("../src/models/User", () => ({}));
    jest.doMock("../src/models/Subscription", () => ({}));
    jest.doMock("../src/utils/jwt", () => ({ generateToken: jest.fn(() => "newtok") }));

    const c = require("../src/controllers/auth.controller");
    const req = { user: { _id: "u1" } };
    const res = makeRes();
    const next = jest.fn();
    c.refreshToken(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "newtok" }));
  });

  test("resendOTP returns 400 when email missing", async () => {
    jest.doMock("passport", () => ({ authenticate: () => (req, res, next) => next() }));
    jest.doMock("../src/models/User", () => ({ findOne: jest.fn() }));
    jest.doMock("../src/models/Subscription", () => ({}));
    jest.doMock("../src/utils/jwt", () => ({ generateToken: jest.fn(() => "t") }));

    const c = require("../src/controllers/auth.controller");
    const req = { body: {} };
    const res = makeRes();
    const next = jest.fn();
    c.resendOTP(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});


