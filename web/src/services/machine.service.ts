import { apiClient } from "@/lib/api-client";
import type { Machine, CreateMachineDto, UpdateMachineDto } from "@/types";

export const machineService = {
  /**
   * Get all machines
   */
  getAll: async (): Promise<Machine[]> => {
    const response = await apiClient.get<Machine[]>("/machines");
    return response.data;
  },

  /**
   * Get machine grid view with status indicators
   */
  getGrid: async (): Promise<Machine[]> => {
    const response = await apiClient.get<Machine[]>("/machines/grid");
    return response.data;
  },

  /**
   * Get single machine by ID
   */
  getById: async (id: number): Promise<Machine> => {
    const response = await apiClient.get<Machine>(`/machines/${id}`);
    return response.data;
  },

  /**
   * Create new machine (Owner only)
   */
  create: async (data: CreateMachineDto): Promise<Machine> => {
    const response = await apiClient.post<Machine>("/machines", data);
    return response.data;
  },

  /**
   * Update machine
   */
  update: async (id: number, data: UpdateMachineDto): Promise<Machine> => {
    const response = await apiClient.patch<Machine>(`/machines/${id}`, data);
    return response.data;
  },

  /**
   * Delete machine
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/machines/${id}`);
  },

  /**
   * Get status color based on machine status
   */
  getStatusColor: (status: Machine["status"]): string => {
    switch (status) {
      case "IDLE":
        return "text-emerald-500"; // Green - available
      case "WASHING":
        return "text-amber-500"; // Yellow/Orange - in use
      case "OVERDUE":
        return "text-red-500"; // Red - needs attention
      case "BROKEN":
        return "text-gray-500"; // Gray - out of service
      default:
        return "text-gray-400";
    }
  },

  /**
   * Get status background color
   */
  getStatusBgColor: (status: Machine["status"]): string => {
    switch (status) {
      case "IDLE":
        return "bg-emerald-500";
      case "WASHING":
        return "bg-amber-500";
      case "OVERDUE":
        return "bg-red-500";
      case "BROKEN":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  },

  /**
   * Get status label in Indonesian
   */
  getStatusLabel: (status: Machine["status"]): string => {
    switch (status) {
      case "IDLE":
        return "Tersedia";
      case "WASHING":
        return "Sedang Cuci";
      case "OVERDUE":
        return "Melewati Waktu";
      case "BROKEN":
        return "Rusak";
      default:
        return status;
    }
  },
};
