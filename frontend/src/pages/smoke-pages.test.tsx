import { describe, expect, test, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import AuthPage from "./AuthPage";
import MeetingsPage from "./MeetingsPage";
import ContractsPage from "./ContractsPage";
import CalendarPage from "./CalendarPage";
import RemindersPage from "./RemindersPage";
import SettingsPage from "./SettingsPage";
import SubscriptionPage from "./SubscriptionPage";
import UploadPage from "./UploadPage";
import DashboardLayout from "../layouts/DashboardLayout";

function mockOkJson(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: async () => body,
  } as Response);
}

describe("pages smoke", () => {
  beforeEach(() => {
    localStorage.setItem("token", "t");
    localStorage.setItem("user", JSON.stringify({ name: "User", email: "u@e.com", subscription_tier: "FREE" }));
    vi.stubGlobal("fetch", vi.fn(() => mockOkJson({ data: [], events: [] })) as any);
    // confirm/alert used in some pages/layout
    vi.stubGlobal("confirm", vi.fn(() => true));
    vi.stubGlobal("alert", vi.fn());
  });

  test("AuthPage renders", () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );
  });

  test("DashboardLayout renders wrapper", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <DashboardLayout>
          <div>child</div>
        </DashboardLayout>
      </MemoryRouter>
    );
  });

  test("MeetingsPage renders", () => {
    render(
      <MemoryRouter>
        <MeetingsPage />
      </MemoryRouter>
    );
  });

  test("ContractsPage renders", () => {
    render(
      <MemoryRouter>
        <ContractsPage />
      </MemoryRouter>
    );
  });

  test("CalendarPage renders", () => {
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>
    );
  });

  test("RemindersPage renders", () => {
    render(
      <MemoryRouter>
        <RemindersPage />
      </MemoryRouter>
    );
  });

  test("SettingsPage renders", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
  });

  test("SubscriptionPage renders", () => {
    render(
      <MemoryRouter>
        <SubscriptionPage />
      </MemoryRouter>
    );
  });

  test("UploadPage renders", () => {
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );
  });

  // NOTE: MeetingDetailPage/ContractEditorPage include lots of async effects and editor logic;
  // they should be covered with dedicated tests (mocking fetch + timers) to keep suite stable.
});


