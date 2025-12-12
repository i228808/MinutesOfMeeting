const express = require("express");

describe("backend/src/routes smoke (with mocked controllers)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("routes modules can be imported", () => {
    const noop = (req, res) => res.json({ ok: true });
    jest.doMock("../src/controllers/auth.controller", () => ({
      register: noop,
      login: noop,
      verifyEmail: noop,
      resendOTP: noop,
      googleAuth: noop,
      googleCallback: [noop, noop],
      getCurrentUser: noop,
      logout: noop,
      refreshToken: noop,
      updateProfile: noop,
      deleteAccount: noop,
    }));
    jest.doMock("../src/controllers/subscription.controller", () => ({
      getSubscriptionInfo: noop,
      createSubscription: noop,
      verifySubscription: noop,
      changePlan: noop,
      changeTier: noop,
      createPortalSession: noop,
      handleStripeWebhook: noop,
      cancelSubscription: noop,
      reactivateSubscription: noop,
      getCustomerPortal: noop,
      verifySession: noop,
    }));
    jest.doMock("../src/controllers/meeting.controller", () => ({
      uploadTranscript: noop,
      analyzeOnly: noop,
      confirmMeeting: noop,
      processTranscript: noop,
      listMeetings: noop,
      getMeeting: noop,
      updateMeeting: noop,
      deleteMeeting: noop,
      exportToSheets: noop,
      createCalendarEvents: noop,
    }));
    jest.doMock("../src/controllers/contract.controller", () => ({
      draftContract: noop,
      listContracts: noop,
      getContract: noop,
      updateContract: noop,
      deleteContract: noop,
      exportToDocs: noop,
      finalizeContract: noop,
      getRevisionHistory: noop,
      generateFromAnalysis: noop,
    }));
    jest.doMock("../src/controllers/google.controller", () => ({
      createSpreadsheet: noop,
      createSheetRow: noop,
      createCalendarEvent: noop,
      listCalendarEvents: noop,
      updateCalendarEvent: noop,
      deleteCalendarEvent: noop,
    }));
    jest.doMock("../src/controllers/reminder.controller", () => ({
      createReminder: noop,
      getReminders: noop,
      getReminder: noop,
      updateReminder: noop,
      deleteReminder: noop,
      cancelReminder: noop,
    }));
    jest.doMock("../src/controllers/stream.controller", () => ({
      startSession: noop,
      processChunk: noop,
      endSession: noop,
      getSessionStatus: noop,
      listSessions: noop,
    }));
    jest.doMock("../src/controllers/calendar.controller", () => ({
      getEvents: noop,
      createEvent: noop,
      getEvent: noop,
      updateEvent: noop,
      deleteEvent: noop,
      importFromMeeting: noop,
      getUpcoming: noop,
    }));
    jest.doMock("../src/middleware/auth.middleware", () => ({ authenticate: (req, res, next) => next(), optionalAuth: (req, res, next) => next() }));
    jest.doMock("../src/middleware/tier.middleware", () => ({ requireTier: () => (req, res, next) => next(), checkLimit: () => (req, res, next) => next(), requireExtensionAccess: (req, res, next) => next(), attachUsageStats: (req, res, next) => next() }));
    jest.doMock("../src/middleware/validate.middleware", () => ({ validate: (req, res, next) => next(), validators: {} }));

    // Import all route modules
    expect(() => require("../src/routes/auth.routes")).not.toThrow();
    expect(() => require("../src/routes/subscription.routes")).not.toThrow();
    expect(() => require("../src/routes/meeting.routes")).not.toThrow();
    expect(() => require("../src/routes/contract.routes")).not.toThrow();
    expect(() => require("../src/routes/google.routes")).not.toThrow();
    expect(() => require("../src/routes/reminder.routes")).not.toThrow();
    expect(() => require("../src/routes/stream.routes")).not.toThrow();
    expect(() => require("../src/routes/calendar.routes")).not.toThrow();
  });
});


