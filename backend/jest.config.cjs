/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  collectCoverageFrom: [
    "src/app.js",
    "src/middleware/**/*.js",
    "src/utils/**/*.js",
    "src/services/limit.service.js",
    "src/controllers/{auth,reminder}.controller.js",
    "src/routes/**/*.js",
    "src/models/{User,Subscription,Reminder,CalendarEvent,MeetingTranscript,Contract}.js",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
};


