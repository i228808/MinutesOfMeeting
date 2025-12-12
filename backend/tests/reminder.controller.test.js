function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("backend/src/controllers/reminder.controller", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("createReminder validates required fields", async () => {
    jest.doMock("../src/models/Reminder", () => ({ create: jest.fn() }));
    const { createReminder } = require("../src/controllers/reminder.controller");
    const req = { body: {}, user: { _id: "u1" } };
    const res = makeRes();
    const next = jest.fn();
    await createReminder(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createReminder creates reminder when valid", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00Z"));
    const created = { _id: "r1", task: "t", remind_at: new Date("2025-01-02T00:00:00Z"), status: "PENDING" };
    const create = jest.fn(async () => created);
    jest.doMock("../src/models/Reminder", () => ({ create }));
    const { createReminder } = require("../src/controllers/reminder.controller");
    const req = { body: { task: "t", remind_at: "tomorrow" }, user: { _id: "u1" } };
    const res = makeRes();
    const next = jest.fn();
    await createReminder(req, res, next);
    expect(create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    jest.useRealTimers();
  });

  test("getReminder returns 404 when not found", async () => {
    const findOne = jest.fn(() => ({ populate: jest.fn(async () => null) }));
    jest.doMock("../src/models/Reminder", () => ({ findOne }));
    const { getReminder } = require("../src/controllers/reminder.controller");
    const req = { params: { id: "x" }, user: { _id: "u1" } };
    const res = makeRes();
    const next = jest.fn();
    getReminder(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("cancelReminder sets status when pending", async () => {
    const reminder = { status: "PENDING", save: jest.fn(async () => {}) };
    const findOne = jest.fn(async () => reminder);
    jest.doMock("../src/models/Reminder", () => ({ findOne }));
    const { cancelReminder } = require("../src/controllers/reminder.controller");
    const req = { params: { id: "x" }, user: { _id: "u1" } };
    const res = makeRes();
    const next = jest.fn();
    cancelReminder(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(reminder.status).toBe("CANCELLED");
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Reminder cancelled" });
  });
});


