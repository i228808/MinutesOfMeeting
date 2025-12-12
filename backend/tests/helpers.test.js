const {
  generateRandomString,
  generateSessionId,
  parseDate,
  formatDate,
  getDurationMinutes,
  sanitizeFilename,
  paginate,
  paginateResponse,
  getFileExtension,
  isValidEmail,
} = require("../src/utils/helpers");

describe("backend/src/utils/helpers", () => {
  test("generateRandomString returns hex string of expected length", () => {
    const s = generateRandomString(8);
    expect(typeof s).toBe("string");
    // 8 bytes -> 16 hex chars
    expect(s).toHaveLength(16);
    expect(s).toMatch(/^[0-9a-f]+$/);
  });

  test("generateRandomString default length", () => {
    const s = generateRandomString();
    // 32 bytes -> 64 hex chars
    expect(s).toHaveLength(64);
  });

  test("generateSessionId includes prefix and timestamp", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T12:00:00Z"));
    const id = generateSessionId();
    expect(id.startsWith("session_")).toBe(true);
    expect(id).toContain(String(Date.now()));
    jest.useRealTimers();
  });

  test("parseDate parses ISO-like strings", () => {
    const d = parseDate("2024-01-15");
    expect(d).toBeInstanceOf(Date);
    expect(Number.isNaN(d.getTime())).toBe(false);
  });

  test("parseDate handles today/tomorrow and weekday names", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T12:00:00Z")); // Wed

    const today = new Date();
    expect(parseDate("today").toDateString()).toBe(today.toDateString());

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(parseDate("tomorrow").toDateString()).toBe(tomorrow.toDateString());

    const nextMonday = parseDate("next monday");
    expect(nextMonday).toBeInstanceOf(Date);
    expect(nextMonday.getTime()).toBeGreaterThan(today.getTime());

    const nextFriday = parseDate("friday");
    expect(nextFriday).toBeInstanceOf(Date);
    expect(nextFriday.getTime()).toBeGreaterThan(today.getTime());

    jest.useRealTimers();
  });

  test("parseDate handles next week/next month and invalid inputs", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T12:00:00Z"));

    const base = new Date();
    const nextWeek = parseDate("next week");
    expect(nextWeek.getTime()).toBeGreaterThan(base.getTime());

    const nextMonth = parseDate("next month");
    expect(nextMonth.getTime()).toBeGreaterThan(base.getTime());

    expect(parseDate("not a date")).toBeNull();
    expect(parseDate("")).toBeNull();

    jest.useRealTimers();
  });

  test("formatDate returns strings for known formats", () => {
    const d = new Date("2025-01-01T00:00:00Z");
    expect(formatDate(d, "short")).toEqual(expect.any(String));
    expect(formatDate(d, "long")).toEqual(expect.any(String));
    expect(formatDate(d, "iso")).toEqual(expect.any(String));
    expect(formatDate(d, "time")).toEqual(expect.any(String));
    expect(formatDate(null)).toBe("N/A");
    // default format branch
    expect(formatDate(d, "unknown")).toEqual(expect.any(String));
  });

  test("getDurationMinutes returns rounded minutes", () => {
    const start = new Date("2025-01-01T00:00:00Z");
    const end = new Date("2025-01-01T01:30:00Z");
    expect(getDurationMinutes(start, end)).toBe(90);
  });

  test("sanitizeFilename removes unsafe chars and lowercases", () => {
    expect(sanitizeFilename("My File (Final)!!.PDF")).toBe("my_file_final_.pdf");
    expect(sanitizeFilename("a__b---c.txt")).toBe("a_b---c.txt");
  });

  test("paginate enforces bounds", () => {
    expect(paginate(-1, 0)).toEqual({ skip: 0, limit: 1, page: 1 });
    expect(paginate("2", "10")).toEqual({ skip: 10, limit: 10, page: 2 });
    expect(paginate(1, 1000).limit).toBe(100);
  });

  test("paginate uses defaults", () => {
    expect(paginate()).toEqual({ skip: 0, limit: 10, page: 1 });
  });

  test("paginateResponse computes pages and navigation", () => {
    const out = paginateResponse([{ id: 1 }], 21, 2, 10);
    expect(out.pagination.pages).toBe(3);
    expect(out.pagination.hasPrev).toBe(true);
    expect(out.pagination.hasNext).toBe(true);
  });

  test("getFileExtension returns last segment lowercased", () => {
    expect(getFileExtension("report.PDF")).toBe("pdf");
    expect(getFileExtension("a.b.c.txt")).toBe("txt");
  });

  test("isValidEmail validates simple emails", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });
});


