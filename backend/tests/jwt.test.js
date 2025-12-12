const { generateToken, verifyToken, decodeToken } = require("../src/utils/jwt");

describe("backend/src/utils/jwt", () => {
  const prevEnv = process.env;

  beforeEach(() => {
    process.env = { ...prevEnv, JWT_SECRET: "test-secret", JWT_EXPIRES_IN: "1h" };
  });

  afterAll(() => {
    process.env = prevEnv;
  });

  test("generateToken -> verifyToken roundtrip", () => {
    const token = generateToken("user123");
    const decoded = verifyToken(token);
    expect(decoded).toHaveProperty("id", "user123");
    expect(decoded).toHaveProperty("iat");
    expect(decoded).toHaveProperty("exp");
  });

  test("generateToken uses default expiresIn when env var not set", () => {
    delete process.env.JWT_EXPIRES_IN;
    const token = generateToken("u1");
    expect(verifyToken(token)).toHaveProperty("id", "u1");
  });

  test("decodeToken decodes without verification", () => {
    const token = generateToken("abc");
    const decoded = decodeToken(token);
    expect(decoded).toHaveProperty("id", "abc");
  });

  test("verifyToken throws on invalid token", () => {
    expect(() => verifyToken("not-a-jwt")).toThrow();
  });
});


