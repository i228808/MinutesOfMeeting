describe("backend/src/services/limit.service", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("getLimits falls back to FREE", () => {
    jest.doMock("../src/models/User", () => ({}));
    const LimitService = require("../src/services/limit.service");
    expect(LimitService.getLimits("DOES_NOT_EXIST")).toEqual(LimitService.LIMITS.FREE);
  });

  test("canPerformAction returns not found when user missing", async () => {
    const findById = jest.fn(async () => null);
    jest.doMock("../src/models/User", () => ({ findById }));
    const LimitService = require("../src/services/limit.service");
    const out = await LimitService.canPerformAction("u1", "upload");
    expect(out.allowed).toBe(false);
    expect(out.reason).toBe("User not found");
  });

  test("canPerformAction handles unknown action", async () => {
    const user = { subscription_tier: "FREE", usage_reset_date: new Date(), save: jest.fn(async () => {}) };
    const findById = jest.fn(async () => user);
    jest.doMock("../src/models/User", () => ({ findById }));
    const LimitService = require("../src/services/limit.service");
    const out = await LimitService.canPerformAction("u1", "nope");
    expect(out.allowed).toBe(false);
    expect(out.reason).toBe("Unknown action");
  });

  test("canPerformAction enforces upload limit", async () => {
    const user = {
      subscription_tier: "FREE",
      monthly_uploads: 5,
      monthly_audio_minutes: 0,
      monthly_contracts: 0,
      usage_reset_date: new Date(),
      save: jest.fn(async () => {}),
    };
    const findById = jest.fn(async () => user);
    jest.doMock("../src/models/User", () => ({ findById }));
    const LimitService = require("../src/services/limit.service");
    const out = await LimitService.canPerformAction("u1", "upload");
    expect(out.allowed).toBe(false);
    expect(out.reason).toMatch(/upload limit/i);
  });

  test("canPerformAction allows extension for BASIC", async () => {
    const user = {
      subscription_tier: "BASIC",
      monthly_uploads: 0,
      monthly_audio_minutes: 0,
      monthly_contracts: 0,
      usage_reset_date: new Date(),
      save: jest.fn(async () => {}),
    };
    const findById = jest.fn(async () => user);
    jest.doMock("../src/models/User", () => ({ findById }));
    const LimitService = require("../src/services/limit.service");
    const out = await LimitService.canPerformAction("u1", "extension");
    expect(out.allowed).toBe(true);
  });

  test("getUsageStats returns computed remaining", async () => {
    const user = {
      subscription_tier: "FREE",
      monthly_uploads: 1,
      monthly_audio_minutes: 2,
      monthly_contracts: 1,
      usage_reset_date: new Date(),
      save: jest.fn(async () => {}),
    };
    const findById = jest.fn(async () => user);
    jest.doMock("../src/models/User", () => ({ findById }));
    const LimitService = require("../src/services/limit.service");
    const stats = await LimitService.getUsageStats("u1");
    expect(stats.usage.uploads.remaining).toBe(4);
  });

  test("getUpgradeRecommendation recommends when over 80%", async () => {
    const user = { subscription_tier: "FREE" };
    const findById = jest.fn(async () => user);
    jest.doMock("../src/models/User", () => ({ findById }));
    const LimitService = require("../src/services/limit.service");
    // mock getUsageStats to simulate high usage
    jest.spyOn(LimitService, "getUsageStats").mockResolvedValue({
      tier: "FREE",
      usage: {
        uploads: { used: 5, limit: 5 },
        audio_minutes: { used: 0, limit: 10 },
        contracts: { used: 0, limit: 3 },
      },
      features: { can_use_extension: false, priority_processing: false },
      reset_date: new Date(),
    });
    const rec = await LimitService.getUpgradeRecommendation("u1");
    expect(rec.recommend_upgrade).toBe(true);
  });

  test("checkAndResetUsage resets usage on new month", async () => {
    jest.doMock("../src/models/User", () => ({}));
    const LimitService = require("../src/services/limit.service");
    const user = {
      monthly_uploads: 5,
      monthly_audio_minutes: 10,
      monthly_contracts: 3,
      usage_reset_date: new Date("2020-01-01T00:00:00Z"),
      save: jest.fn(async () => {}),
    };
    await LimitService.checkAndResetUsage(user);
    expect(user.monthly_uploads).toBe(0);
    expect(user.save).toHaveBeenCalled();
  });

  test("incrementUsage updates counters", async () => {
    const user = { monthly_uploads: 0, monthly_audio_minutes: 0, monthly_contracts: 0, save: jest.fn(async () => {}) };
    const findById = jest.fn(async () => user);
    jest.doMock("../src/models/User", () => ({ findById }));
    const LimitService = require("../src/services/limit.service");

    expect(await LimitService.incrementUsage("u1", "upload", 2)).toBe(true);
    expect(user.monthly_uploads).toBe(2);
    expect(await LimitService.incrementUsage("u1", "audio", 3)).toBe(true);
    expect(user.monthly_audio_minutes).toBe(3);
    expect(await LimitService.incrementUsage("u1", "contract", 1)).toBe(true);
    expect(user.monthly_contracts).toBe(1);
  });

  test("getUsageStats returns null if user missing", async () => {
    const findById = jest.fn(async () => null);
    jest.doMock("../src/models/User", () => ({ findById }));
    const LimitService = require("../src/services/limit.service");
    expect(await LimitService.getUsageStats("u1")).toBeNull();
  });

  test("getUpgradeRecommendation returns null for ULTRA", async () => {
    const user = { subscription_tier: "ULTRA" };
    const findById = jest.fn(async () => user);
    jest.doMock("../src/models/User", () => ({ findById }));
    const LimitService = require("../src/services/limit.service");
    expect(await LimitService.getUpgradeRecommendation("u1")).toBeNull();
  });
});


