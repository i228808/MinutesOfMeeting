import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

describe("DashboardLayout", () => {
  test("shows live recorder button for paid tiers", () => {
    localStorage.setItem("user", JSON.stringify({ subscription_tier: "BASIC", name: "U", email: "u@e.com" }));
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <DashboardLayout>
          <div>child</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    expect(screen.getByText(/install live recorder/i)).toBeInTheDocument();
  });
});


