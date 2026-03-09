import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "@/app/login/page";

// Mock the child component to isolate the test
vi.mock("@/components/features/auth/pin-form", () => ({
  PinForm: () => <div data-testid="pin-form-mock">PinForm Component</div>,
}));

describe("LoginPage", () => {
  it("renders correctly", () => {
    render(<LoginPage />);

    // Check if the main wrapper exists
    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeDefined();

    // Check if the child component is rendered
    expect(screen.getByTestId("pin-form-mock")).toBeDefined();
  });
});
