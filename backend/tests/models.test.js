const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function runPreSaveHooks(Model, doc) {
  const pres = Model.schema.s?.hooks?._pres?.get?.("save") || [];
  for (const pre of pres) {
    await new Promise((resolve, reject) => {
      try {
        // callback-style middleware
        if (pre.fn.length >= 1) {
          pre.fn.call(doc, (err) => (err ? reject(err) : resolve()));
          return;
        }
        // promise-style middleware
        Promise.resolve(pre.fn.call(doc)).then(resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }
}

describe("backend/src/models smoke", () => {
  test("models can be required and instantiated without DB", () => {
    const User = require("../src/models/User");
    const Subscription = require("../src/models/Subscription");
    const Reminder = require("../src/models/Reminder");
    const CalendarEvent = require("../src/models/CalendarEvent");
    const Contract = require("../src/models/Contract");
    const MeetingTranscript = require("../src/models/MeetingTranscript");

    const u = new User({ name: "A", email: "a@b.com", subscription_tier: "FREE" });
    expect(u.name).toBe("A");
    expect(u.checkLimit("uploads")).toBe(true);
    expect(u.checkLimit("audio")).toBe(true);
    expect(u.checkLimit("contracts")).toBe(true);

    const s = new Subscription({ user_id: new mongoose.Types.ObjectId(), tier: "FREE", status: "ACTIVE" });
    expect(s.tier).toBe("FREE");

    const r = new Reminder({ user_id: new mongoose.Types.ObjectId(), task: "t", remind_at: new Date() });
    expect(r.task).toBe("t");

    const e = new CalendarEvent({ user_id: new mongoose.Types.ObjectId(), title: "x", start_time: new Date(), end_time: new Date() });
    expect(e.title).toBe("x");

    const c = new Contract({ user_id: new mongoose.Types.ObjectId(), title: "c" });
    expect(c.title).toBe("c");

    const m = new MeetingTranscript({ user_id: new mongoose.Types.ObjectId(), title: "m" });
    expect(m.title).toBe("m");
  });

  test("Subscription pre-save hook sets limits when tier modified", async () => {
    const Subscription = require("../src/models/Subscription");
    const s = new Subscription({ user_id: new mongoose.Types.ObjectId(), tier: "FREE" });
    // simulate tier modification
    s.isModified = () => true;

    s.tier = "BASIC";
    s.isModified = () => true;
    await runPreSaveHooks(Subscription, s);

    expect(s.limits.upload_limit).toBe(20);
  });

  test("User pre-save hook hashes password when modified", async () => {
    const User = require("../src/models/User");
    const u = new User({ name: "A", email: "a@b.com", password: "plain" });
    u.isModified = () => true;
    await runPreSaveHooks(User, u);

    expect(u.password).not.toBe("plain");
    expect(await bcrypt.compare("plain", u.password)).toBe(true);
  });

  test("User comparePassword returns false when no password", async () => {
    const User = require("../src/models/User");
    const u = new User({ name: "A", email: "a@b.com", password: null });
    expect(await u.comparePassword("x")).toBe(false);
  });

  test("User incrementUsage and resetMonthlyUsage use save()", async () => {
    const User = require("../src/models/User");
    const u = new User({ name: "A", email: "a@b.com" });
    u.save = jest.fn(async () => u);
    await u.incrementUsage("uploads", 2);
    expect(u.monthly_uploads).toBe(2);
    await u.resetMonthlyUsage();
    expect(u.monthly_uploads).toBe(0);
    expect(u.save).toHaveBeenCalled();
  });
});


