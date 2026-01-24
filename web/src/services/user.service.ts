import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";

export interface CreateUserDto {
  username: string;
  pin: string;
  role: "ADMIN" | "OWNER";
}

export interface UpdateUserDto {
  username?: string;
  pin?: string;
  isActive?: boolean;
}

export const userService = {
  /**
   * Get all users (Owner only)
   */
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  },

  /**
   * Create new user
   */
  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>("/users", data);
    return response.data;
  },

  /**
   * Update user (e.g. deactivate/activate)
   */
  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<User> => {
    const response = await apiClient.delete<User>(`/users/${id}`);
    return response.data;
  },
};
