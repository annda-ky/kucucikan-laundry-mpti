import { apiClient } from "@/lib/api-client";
import type {
  Shift,
  CreateShiftDto,
  UpdateShiftDto,
  PaginatedResponse,
} from "@/types";

export const shiftService = {
  /**
   * Get all shifts
   */
  getAll: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Shift>> => {
    const response = await apiClient.get<PaginatedResponse<Shift>>(
      `/shifts?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  /**
   * Get shift by ID
   */
  getById: async (id: string): Promise<Shift> => {
    const response = await apiClient.get<Shift>(`/shifts/${id}`);
    return response.data;
  },

  /**
   * Start new shift (FR-CSH-01)
   */
  start: async (data: CreateShiftDto): Promise<Shift> => {
    const response = await apiClient.post<Shift>("/shifts/start", data);
    return response.data;
  },

  /**
   * End current shift with closing cash (FR-CSH-03 - Blind Closing)
   */
  end: async (data: UpdateShiftDto): Promise<Shift> => {
    const response = await apiClient.patch<Shift>("/shifts/end", data);
    return response.data;
  },

  forceEnd: async (id: string, data: UpdateShiftDto): Promise<Shift> => {
    const response = await apiClient.patch<Shift>(`/shifts/${id}/end`, data);
    return response.data;
  },

  /**
   * Preset modal amounts (FR-CSH-01)
   */
  PRESET_AMOUNTS: [100000, 200000, 300000, 500000],

  /**
   * Format currency
   */
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Format short currency (e.g., 100rb)
   */
  formatShortCurrency: (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}jt`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}rb`;
    }
    return amount.toString();
  },

  /**
   * Calculate shift duration
   */
  calculateDuration: (startTime: string, endTime?: string): string => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
  },
};
