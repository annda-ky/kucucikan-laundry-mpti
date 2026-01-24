import { apiClient } from "@/lib/api-client";
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from "@/types";

export const customerService = {
  /**
   * Get all customers
   */
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>("/customers");
    return response.data;
  },

  /**
   * Get customer by ID
   */
  getById: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  /**
   * Search customer by phone (4 digit search - FR-POS-03)
   */
  searchByPhone: async (phone: string): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>(`/customers/lookup`, {
      params: { phone },
    });
    return response.data;
  },

  /**
   * Get customer leaderboard (FR-MKT-01)
   */
  getLeaderboard: async (
    sort: "totalSpend" | "totalVisits" = "totalSpend",
  ): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>("/customers/leaderboard", {
      params: { sort },
    });
    return response.data;
  },

  /**
   * Get passive customers (>30 days - FR-MKT-03)
   */
  getPassive: async (): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>("/customers/passive");
    return response.data;
  },

  /**
   * Create new customer
   */
  create: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await apiClient.post<Customer>("/customers", data);
    return response.data;
  },

  /**
   * Update customer
   */
  update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await apiClient.patch<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  /**
   * Delete customer (Owner only)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },

  /**
   * Format phone number for display
   */
  formatPhone: (phone: string): string => {
    // Format: 0812-3456-7890
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length >= 10) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    return phone;
  },
};
