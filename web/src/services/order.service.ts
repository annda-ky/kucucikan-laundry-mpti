import { apiClient } from "@/lib/api-client";
import type {
  Order,
  CreateOrderDto,
  PayOrderDto,
  VoidOrderDto,
  StatusLaundry,
  PaymentStatus,
} from "@/types";

export const orderService = {
  /**
   * Get all orders
   */
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>("/orders");
    return response.data;
  },

  /**
   * Get single order by ID
   */
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Create new order
   */
  create: async (data: CreateOrderDto): Promise<Order> => {
    const response = await apiClient.post<Order>("/orders", data);
    return response.data;
  },

  /**
   * Pay for an order (full or partial)
   */
  pay: async (id: string, data: PayOrderDto): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${id}/pay`, data);
    return response.data;
  },

  /**
   * Void an order (requires Owner PIN)
   */
  void: async (id: string, data: VoidOrderDto): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${id}/void`, data);
    return response.data;
  },

  /**
   * Update laundry status (FR-OPS-02/03/04/05)
   * - status: new laundry status
   * - durationMinutes: optional timer for WASHING/DRYING
   * - rackLocation: optional rack location for DONE/PICKED_UP
   */
  updateStatus: async (
    id: string,
    data: {
      status: StatusLaundry;
      durationMinutes?: number;
      rackLocation?: string;
    },
  ): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, data);
    return response.data;
  },

  /**
   * Get laundry status color for UI
   */
  getLaundryStatusColor: (status: StatusLaundry): string => {
    switch (status) {
      case "PENDING":
        return "text-gray-500";
      case "WASHING":
        return "text-blue-500";
      case "DRYING":
        return "text-amber-500";
      case "IRONING":
        return "text-purple-500";
      case "DONE":
        return "text-emerald-500";
      case "PICKED_UP":
        return "text-green-600";
      case "VOID":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  },

  /**
   * Get laundry status label in Indonesian
   */
  getLaundryStatusLabel: (status: StatusLaundry): string => {
    switch (status) {
      case "PENDING":
        return "Menunggu";
      case "WASHING":
        return "Cuci";
      case "DRYING":
        return "Keringkan";
      case "IRONING":
        return "Setrika";
      case "DONE":
        return "Selesai";
      case "PICKED_UP":
        return "Diambil";
      case "VOID":
        return "Batal";
      default:
        return status;
    }
  },

  /**
   * Get payment status color for UI (FR-POS-05)
   */
  getPaymentStatusColor: (status: PaymentStatus): string => {
    switch (status) {
      case "PAID":
        return "text-emerald-600 bg-emerald-50"; // LUNAS - Green
      case "UNPAID":
        return "text-red-600 bg-red-50"; // BELUM LUNAS - Red
      case "DP":
        return "text-amber-600 bg-amber-50"; // DP - Orange
      case "VOID":
        return "text-gray-500 bg-gray-50";
      default:
        return "text-gray-400";
    }
  },

  /**
   * Get payment status label
   */
  getPaymentStatusLabel: (status: PaymentStatus): string => {
    switch (status) {
      case "PAID":
        return "LUNAS";
      case "UNPAID":
        return "BELUM LUNAS";
      case "DP":
        return "DP";
      case "VOID":
        return "BATAL";
      default:
        return status;
    }
  },
};
