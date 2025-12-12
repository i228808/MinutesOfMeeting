const request = require("supertest");

describe("backend/src/app", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("GET /health returns ok", async () => {
    jest.doMock("../src/config/passport", () => ({}));
    jest.doMock("swagger-ui-express", () => ({ serve: (req, res, next) => next(), setup: () => (req, res, next) => next() }));
    jest.doMock("../src/config/swagger", () => ({}));
    // Stripe webhook handler import + route modules (avoid wiring full controllers here)
    jest.doMock("../src/controllers/subscription.controller", () => ({
      handleStripeWebhook: (req, res) => res.status(200).json({ ok: true }),
    }));
    const express = require("express");
    jest.doMock("../src/routes/auth.routes", () => express.Router());
    jest.doMock("../src/routes/subscription.routes", () => express.Router());
    jest.doMock("../src/routes/meeting.routes", () => express.Router());
    jest.doMock("../src/routes/contract.routes", () => express.Router());
    jest.doMock("../src/routes/google.routes", () => express.Router());
    jest.doMock("../src/routes/reminder.routes", () => express.Router());
    jest.doMock("../src/routes/stream.routes", () => express.Router());
    jest.doMock("../src/routes/calendar.routes", () => express.Router());

    const app = require("../src/app");
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toEqual(expect.any(String));
  });

  test("unknown route returns 404 JSON", async () => {
    jest.doMock("../src/config/passport", () => ({}));
    jest.doMock("swagger-ui-express", () => ({ serve: (req, res, next) => next(), setup: () => (req, res, next) => next() }));
    jest.doMock("../src/config/swagger", () => ({}));
    jest.doMock("../src/controllers/subscription.controller", () => ({
      handleStripeWebhook: (req, res) => res.status(200).json({ ok: true }),
    }));
    const express = require("express");
    jest.doMock("../src/routes/auth.routes", () => express.Router());
    jest.doMock("../src/routes/subscription.routes", () => express.Router());
    jest.doMock("../src/routes/meeting.routes", () => express.Router());
    jest.doMock("../src/routes/contract.routes", () => express.Router());
    jest.doMock("../src/routes/google.routes", () => express.Router());
    jest.doMock("../src/routes/reminder.routes", () => express.Router());
    jest.doMock("../src/routes/stream.routes", () => express.Router());
    jest.doMock("../src/routes/calendar.routes", () => express.Router());

    const app = require("../src/app");
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Route not found" });
  });
});


