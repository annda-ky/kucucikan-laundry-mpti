import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import POSPage from "@/app/dashboard/pos/page";
import { serviceService } from "@/services/service.service";
import { machineService } from "@/services/machine.service";
import { orderService } from "@/services/order.service";
import type { Service, Machine } from "@/types";

// Mock Services
vi.mock("@/services/service.service");
vi.mock("@/services/machine.service");
vi.mock("@/services/order.service");
// Mock Toast with correct default export structure if necessary, or just named exports
vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Child Components to test flow only
vi.mock("@/components/pos/CustomerStep", () => ({
  CustomerStep: ({ onNext, onSelectCustomer }: any) => (
    <div data-testid="customer-step">
      <button
        onClick={() => {
          onSelectCustomer({ id: "cust-1", name: "John Doe" });
          onNext();
        }}
      >
        Select Customer & Next
      </button>
    </div>
  ),
}));

vi.mock("@/components/pos/ServiceStep", () => ({
  ServiceStep: ({ onNext, onUpdateCart }: any) => (
    <div data-testid="service-step">
      <button
        onClick={() => {
          onUpdateCart({ id: 1, name: "Wash", price: 10000 }, 1);
          onNext();
        }}
      >
        Add Service & Next
      </button>
    </div>
  ),
}));

vi.mock("@/components/pos/MachineStep", () => ({
  MachineStep: ({ onNext, onSelectMachine }: any) => (
    <div data-testid="machine-step">
      <button
        onClick={() => {
          onSelectMachine({ id: 101, name: "Machine 1" });
          onNext();
        }}
      >
        Select Machine & Next
      </button>
    </div>
  ),
}));

vi.mock("@/components/pos/ConfirmStep", () => ({
  ConfirmStep: ({ onSubmit }: any) => (
    <div data-testid="confirm-step">
      <button onClick={onSubmit}>Submit Order</button>
    </div>
  ),
}));

vi.mock("@/components/pos/CartSummary", () => ({
  CartSummary: () => <div data-testid="cart-summary">Cart Summary</div>,
}));

// Test Data
const mockServices: Service[] = [
  {
    id: 1,
    name: "Cuci Komplit",
    price: 35000,
    unitType: "KG",
    defaultDuration: 60,
    isActive: true,
  },
];

const mockMachines: Machine[] = [{ id: 101, name: "Mesin A", status: "IDLE" }];

describe("POS Page Integration Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (serviceService.getActive as any).mockResolvedValue(mockServices);
    (machineService.getAll as any).mockResolvedValue(mockMachines);
  });

  it("renders loading initially then resolves to Customer Step", async () => {
    render(<POSPage />);

    // Expect Customer Step to appear
    await waitFor(() => {
      expect(screen.getByTestId("customer-step")).toBeDefined();
    });
  });

  it("completes the full order flow", async () => {
    render(<POSPage />);

    // 1. Wait for loading to finish and Customer Step
    await waitFor(() =>
      expect(screen.getByTestId("customer-step")).toBeDefined(),
    );

    // 2. Customer Step -> Service Step
    fireEvent.click(screen.getByText("Select Customer & Next"));
    await waitFor(() =>
      expect(screen.getByTestId("service-step")).toBeDefined(),
    );

    // 3. Service Step -> Machine Step
    fireEvent.click(screen.getByText("Add Service & Next"));
    await waitFor(() =>
      expect(screen.getByTestId("machine-step")).toBeDefined(),
    );

    // 4. Machine Step -> Confirm Step
    fireEvent.click(screen.getByText("Select Machine & Next"));
    await waitFor(() =>
      expect(screen.getByTestId("confirm-step")).toBeDefined(),
    );

    // 5. Submit Order
    (orderService.create as any).mockResolvedValue({ id: "order-123" });
    fireEvent.click(screen.getByText("Submit Order"));

    await waitFor(() => {
      expect(orderService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: "cust-1",
          machineId: 101,
          items: [{ serviceId: 1, quantity: 1 }],
        }),
      );
    });
  });
});
