import { apiClient } from "@/lib/api-client";

export const settingsService = {
  getAll: async () => {
    const response =
      await apiClient.get<Record<string, string>>("/store-settings");
    return response.data;
  },

  updateBulk: async (settings: Record<string, string>) => {
    const response = await apiClient.post<void>(
      "/store-settings/bulk",
      settings,
    );
    return response.data;
  },
};
