import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import { reportService } from "@/services/report.service";
import { machineService } from "@/services/machine.service";
import { orderService } from "@/services/order.service";

// Mock Services
vi.mock("@/services/report.service");
vi.mock("@/services/machine.service");
vi.mock("@/services/order.service");

// Mock Charts (Canvas is hard to test)
vi.mock("@/components/ui/charts/AmRevenueChart", () => ({
  AmRevenueChart: () => <div data-testid="revenue-chart">Revenue Chart</div>,
}));
vi.mock("@/components/ui/charts/AmPieChart", () => ({
  AmPieChart: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

// Mock Data
const mockSummary = {
  totalRevenue: 5000000,
  totalTransactions: 50,
  activeMachines: 2,
  totalMachines: 4,
  completedOrders: 10,
  pendingOrders: 5,
};

const mockMachines = [
  { id: 1, name: "Mesin 1", status: "IDLE" },
  { id: 2, name: "Mesin 2", status: "WASHING" },
];

const mockOrders = [
  {
    id: "ord-1",
    invoiceNumber: "INV-001",
    customer: { name: "Budi", phone: "08123" },
    totalAmount: 100000,
    statusPayment: "PAID",
    createdAt: new Date().toISOString(),
  },
];

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (reportService.getDashboard as any).mockResolvedValue(mockSummary);
    (reportService.formatRevenue as any).mockImplementation(
      (val: number) => `Rp ${val}`,
    );

    (machineService.getAll as any).mockResolvedValue(mockMachines);
    (machineService.getStatusLabel as any).mockImplementation((s: string) => s);
    (machineService.getStatusColor as any).mockReturnValue("text-black");

    (orderService.getAll as any).mockResolvedValue({ data: mockOrders });
    (orderService.getPaymentStatusLabel as any).mockReturnValue("LUNAS");
    (orderService.getPaymentStatusColor as any).mockReturnValue("bg-green-100");
  });

  it("renders dashboard stats correctly", async () => {
    render(<DashboardPage />);

    // Wait for Revenue (Primary indicator of data loaded)
    await screen.findByText("Rp 5000000");

    // Transactions count - Loose match
    expect(screen.getByText(/50 Transaksi/i)).toBeDefined();

    // Active Machines
    // Logic: Machines prop is mocked as mockMachines (2 items).
    // Active (WASHING) = 1.
    // Total = 2.
    // Text: "1 / 2" (might be split in spans)
    // We check for "1" and "2" existence in the machine widget area or loosely
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("/ 2")).toBeDefined();
  });

  it("renders machine status grid", async () => {
    render(<DashboardPage />);

    // Wait for first machine
    await screen.findByText("Mesin 1");
    expect(screen.getByText("Mesin 2")).toBeDefined();
  });

  it("renders recent orders", async () => {
    render(<DashboardPage />);

    // Wait for Invoice
    await screen.findByText("INV-001");

    // Check Customer - "Budi" might be inside "Budi • 08123"
    // Use regex to match parts of it
    expect(screen.getByText(/Budi/)).toBeDefined();
    expect(screen.getByText(/08123/)).toBeDefined();

    expect(screen.getByText("Rp 100000")).toBeDefined();
  });

  it("renders charts mocks", async () => {
    render(<DashboardPage />);

    expect(await screen.findByTestId("revenue-chart")).toBeDefined();
    expect(screen.getByTestId("pie-chart")).toBeDefined();
  });
});
