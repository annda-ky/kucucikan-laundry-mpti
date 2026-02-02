import { apiClient } from "@/lib/api-client";
import type {
  InventoryItem,
  CreateInventoryItemDto,
  UpdateStockDto,
  InventoryLog,
} from "@/types";

export const inventoryService = {
  /**
   * Get all inventory items
   */
  getAll: async (): Promise<InventoryItem[]> => {
    const response = await apiClient.get<InventoryItem[]>("/inventory");
    return response.data;
  },

  /**
   * Get inventory item by ID
   */
  getById: async (id: number): Promise<InventoryItem> => {
    const response = await apiClient.get<InventoryItem>(`/inventory/${id}`);
    return response.data;
  },

  /**
   * Create new inventory item (FR-INV-01)
   */
  create: async (data: CreateInventoryItemDto): Promise<InventoryItem> => {
    const response = await apiClient.post<InventoryItem>("/inventory", data);
    return response.data;
  },

  /**
   * Update stock quantity (FR-INV-02, FR-INV-03)
   */
  updateStock: async (
    id: number,
    data: UpdateStockDto,
  ): Promise<InventoryItem> => {
    const response = await apiClient.patch<InventoryItem>(
      `/inventory/${id}/stock`,
      data,
    );
    return response.data;
  },

  /**
   * Delete inventory item
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/${id}`);
  },

  /**
   * Get inventory logs (History)
   */
  getLogs: async (id: number): Promise<InventoryLog[]> => {
    const response = await apiClient.get<InventoryLog[]>(
      `/inventory/${id}/logs`,
    );
    return response.data;
  },

  /**
   * Check if item is low stock
   */
  isLowStock: (item: InventoryItem): boolean => {
    return item.stockQuantity <= item.minStockAlert;
  },

  /**
   * Get items with low stock
   */
  getLowStockItems: (items: InventoryItem[]): InventoryItem[] => {
    return items.filter(inventoryService.isLowStock);
  },

  /**
   * Get stock status
   */
  getStockStatus: (item: InventoryItem): { label: string; color: string } => {
    if (item.stockQuantity === 0) {
      return { label: "Habis", color: "text-red-600 bg-red-50" };
    }
    if (item.stockQuantity <= item.minStockAlert) {
      return { label: "Hampir Habis", color: "text-amber-600 bg-amber-50" };
    }
    return { label: "Tersedia", color: "text-emerald-600 bg-emerald-50" };
  },

  /**
   * Format stock with unit
   */
  formatStock: (item: InventoryItem): string => {
    return `${item.stockQuantity} ${item.unit}`;
  },
};
