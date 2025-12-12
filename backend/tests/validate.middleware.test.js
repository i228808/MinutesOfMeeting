jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

const { validationResult } = require("express-validator");
const { validate, validators } = require("../src/middleware/validate.middleware");

function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("backend/src/middleware/validate.middleware", () => {
  test("validate returns 400 with mapped details when errors exist", () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { path: "email", msg: "Invalid", value: "nope" },
        { path: "password", msg: "Too short", value: "x" },
      ],
    });

    const req = {};
    const res = makeRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Validation failed",
      details: [
        { field: "email", message: "Invalid", value: "nope" },
        { field: "password", message: "Too short", value: "x" },
      ],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("validate calls next when no errors", () => {
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });

    const req = {};
    const res = makeRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("validators.isObjectId matches 24-hex strings", () => {
    expect(validators.isObjectId("507f1f77bcf86cd799439011")).toBe(true);
    expect(validators.isObjectId("not-an-id")).toBe(false);
  });

  test("validators.isFutureDate detects future dates", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(validators.isFutureDate(future)).toBe(true);
    expect(validators.isFutureDate(past)).toBe(false);
  });

  test("validators.isInEnum checks membership", () => {
    expect(validators.isInEnum("A", ["A", "B"])).toBe(true);
    expect(validators.isInEnum("C", ["A", "B"])).toBe(false);
  });
});


