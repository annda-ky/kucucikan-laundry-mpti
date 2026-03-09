import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InventoryPage from "@/app/dashboard/inventory/page";
import { inventoryService } from "@/services/inventory.service";
import type { InventoryItem } from "@/types";

// Mock Data
const mockItems: InventoryItem[] = [
  {
    id: 1,
    name: "Deterjen Cair",
    unit: "LITER",
    stockQuantity: 10,
    minStockAlert: 5,
  },
  {
    id: 2,
    name: "Parfum Lavender",
    unit: "LITER",
    stockQuantity: 2,
    minStockAlert: 5, // Low stock
  },
];

// Auto Mock
vi.mock("@/services/inventory.service");

// Mock Modals
vi.mock("@/components/inventory/AddItemModal", () => ({
  AddItemModal: ({ onClose }: any) => (
    <div data-testid="add-modal">
      Add Modal <button onClick={onClose}>Close</button>
    </div>
  ),
}));
vi.mock("@/components/inventory/UpdateStockModal", () => ({
  UpdateStockModal: ({ onClose }: any) => (
    <div data-testid="update-stock-modal">
      Update Stock Modal <button onClick={onClose}>Close</button>
    </div>
  ),
}));
vi.mock("@/components/inventory/StockHistoryModal", () => ({
  StockHistoryModal: ({ onClose }: any) => (
    <div data-testid="history-modal">
      History Modal <button onClick={onClose}>Close</button>
    </div>
  ),
}));
vi.mock("@/components/ui/ConfirmModal", () => ({
  ConfirmModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="confirm-modal">Confirm Modal</div> : null,
}));

describe("Inventory Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Service Mocks
    (inventoryService.getAll as any).mockResolvedValue(mockItems);

    // CRITICAL: Prevent crash on initial render (items is undefined/empty)
    (inventoryService.getLowStockItems as any).mockImplementation(
      (items: InventoryItem[]) => {
        if (!items) return [];
        return items.filter((i) => i.stockQuantity <= i.minStockAlert);
      },
    );

    // Mock getStockStatus
    (inventoryService.getStockStatus as any).mockImplementation(
      (item: any) => ({
        label:
          item.stockQuantity <= item.minStockAlert ? "Low Stock" : "In Stock",
        color:
          item.stockQuantity <= item.minStockAlert
            ? "bg-red-100"
            : "bg-green-100",
      }),
    );
  });

  it("renders items and low stock alert", async () => {
    render(<InventoryPage />);

    // Expect loading to disapper and item to show
    const item1 = await screen.findByText("Deterjen Cair");
    expect(item1).toBeDefined();

    // Check second item (Low Stock) - appears in Grid AND Alert
    const parfumItems = screen.getAllByText("Parfum Lavender");
    expect(parfumItems.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText(/10 LITER/i)).toBeDefined();

    // Check Low Stock Alert
    expect(screen.getByText(/1 item hampir habis/i)).toBeDefined();
  });

  it("filters items when searching", async () => {
    render(<InventoryPage />);
    await screen.findByText("Deterjen Cair");

    // Search for "Parfum"
    const searchInput = screen.getByPlaceholderText("Cari item...");
    fireEvent.change(searchInput, { target: { value: "Parfum" } });

    // Expect "Deterjen" to disappear
    await waitFor(() => {
      expect(screen.queryByText("Deterjen Cair")).toBeNull();
    });

    // Parfum Lavender should still be visible
    const parfumItems = screen.getAllByText("Parfum Lavender");
    expect(parfumItems.length).toBeGreaterThanOrEqual(1);
  });

  it("opens Add Item modal", async () => {
    render(<InventoryPage />);
    await screen.findByText("Deterjen Cair");

    fireEvent.click(screen.getByText("TAMBAH ITEM"));
    expect(screen.getByTestId("add-modal")).toBeDefined();
  });
});
