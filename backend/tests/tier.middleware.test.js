function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("backend/src/middleware/tier.middleware", () => {
  test("requireTier returns 401 when no user", () => {
    jest.isolateModules(() => {
      jest.doMock("../src/services/limit.service", () => ({}));
      const { requireTier } = require("../src/middleware/tier.middleware");
      const mw = requireTier("BASIC");
      const req = {};
      const res = makeRes();
      const next = jest.fn();

      mw(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("requireTier returns 403 when tier not allowed", () => {
    jest.isolateModules(() => {
      jest.doMock("../src/services/limit.service", () => ({}));
      const { requireTier } = require("../src/middleware/tier.middleware");
      const mw = requireTier("BASIC", "ULTRA");
      const req = { user: { subscription_tier: "FREE" } };
      const res = makeRes();
      const next = jest.fn();

      mw(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json.mock.calls[0][0]).toMatchObject({
        error: "Upgrade required",
        current_tier: "FREE",
        required_tiers: ["BASIC", "ULTRA"],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("requireTier calls next when tier allowed", () => {
    jest.isolateModules(() => {
      jest.doMock("../src/services/limit.service", () => ({}));
      const { requireTier } = require("../src/middleware/tier.middleware");
      const mw = requireTier("FREE", "BASIC");
      const req = { user: { subscription_tier: "FREE" } };
      const res = makeRes();
      const next = jest.fn();

      mw(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  test("checkLimit returns 401 when no user", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("../src/services/limit.service", () => ({
        canPerformAction: jest.fn(),
      }));
      const { checkLimit } = require("../src/middleware/tier.middleware");
      const mw = checkLimit("uploads");
      const req = {};
      const res = makeRes();
      const next = jest.fn();

      await mw(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("checkLimit returns 429 when not allowed", async () => {
    await jest.isolateModulesAsync(async () => {
      const canPerformAction = jest.fn(async () => ({
        allowed: false,
        reason: "nope",
        current: 5,
        limit: 5,
        upgrade_prompt: "upgrade",
      }));
      jest.doMock("../src/services/limit.service", () => ({ canPerformAction }));
      const { checkLimit } = require("../src/middleware/tier.middleware");
      const mw = checkLimit("uploads");
      const req = { user: { _id: "u1" } };
      const res = makeRes();
      const next = jest.fn();

      await mw(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("checkLimit attaches limitCheck and calls next when allowed", async () => {
    await jest.isolateModulesAsync(async () => {
      const result = { allowed: true, current: 1, limit: 10 };
      const canPerformAction = jest.fn(async () => result);
      jest.doMock("../src/services/limit.service", () => ({ canPerformAction }));
      const { checkLimit } = require("../src/middleware/tier.middleware");
      const mw = checkLimit("uploads");
      const req = { user: { _id: "u1" } };
      const res = makeRes();
      const next = jest.fn();

      await mw(req, res, next);
      expect(req.limitCheck).toEqual(result);
      expect(next).toHaveBeenCalled();
    });
  });

  test("checkLimit passes errors to next", async () => {
    await jest.isolateModulesAsync(async () => {
      const canPerformAction = jest.fn(async () => {
        throw new Error("boom");
      });
      jest.doMock("../src/services/limit.service", () => ({ canPerformAction }));
      const { checkLimit } = require("../src/middleware/tier.middleware");
      const mw = checkLimit("uploads");
      const req = { user: { _id: "u1" } };
      const res = makeRes();
      const next = jest.fn();

      await mw(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].message).toBe("boom");
    });
  });

  test("requireExtensionAccess returns 401 when no user", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("../src/services/limit.service", () => ({ getLimits: jest.fn() }));
      const { requireExtensionAccess } = require("../src/middleware/tier.middleware");
      const req = {};
      const res = makeRes();
      const next = jest.fn();
      await requireExtensionAccess(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("requireExtensionAccess returns 403 when feature not available", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("../src/services/limit.service", () => ({
        getLimits: jest.fn(() => ({ can_use_extension: false })),
      }));
      const { requireExtensionAccess } = require("../src/middleware/tier.middleware");
      const req = { user: { subscription_tier: "FREE" } };
      const res = makeRes();
      const next = jest.fn();
      await requireExtensionAccess(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  test("requireExtensionAccess calls next when allowed", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("../src/services/limit.service", () => ({
        getLimits: jest.fn(() => ({ can_use_extension: true })),
      }));
      const { requireExtensionAccess } = require("../src/middleware/tier.middleware");
      const req = { user: { subscription_tier: "BASIC" } };
      const res = makeRes();
      const next = jest.fn();
      await requireExtensionAccess(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  test("attachUsageStats sets stats when user present", async () => {
    await jest.isolateModulesAsync(async () => {
      const getUsageStats = jest.fn(async () => ({ uploads: 1 }));
      jest.doMock("../src/services/limit.service", () => ({ getUsageStats }));
      const { attachUsageStats } = require("../src/middleware/tier.middleware");
      const req = { user: { _id: "u1" } };
      const res = makeRes();
      const next = jest.fn();
      await attachUsageStats(req, res, next);
      expect(req.usageStats).toEqual({ uploads: 1 });
      expect(next).toHaveBeenCalled();
    });
  });

  test("attachUsageStats ignores errors and still calls next", async () => {
    await jest.isolateModulesAsync(async () => {
      const getUsageStats = jest.fn(async () => {
        throw new Error("boom");
      });
      jest.doMock("../src/services/limit.service", () => ({ getUsageStats }));
      const { attachUsageStats } = require("../src/middleware/tier.middleware");
      const req = { user: { _id: "u1" } };
      const res = makeRes();
      const next = jest.fn();
      await attachUsageStats(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  test("attachUsageStats does nothing when no user", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("../src/services/limit.service", () => ({ getUsageStats: jest.fn() }));
      const { attachUsageStats } = require("../src/middleware/tier.middleware");
      const req = {};
      const res = makeRes();
      const next = jest.fn();
      await attachUsageStats(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});


