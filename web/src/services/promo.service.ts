import { apiClient } from "@/lib/api-client";
import type { Promo, CreatePromoDto } from "@/types";

export const promoService = {
  getAll: async (activeOnly = false): Promise<Promo[]> => {
    const response = await apiClient.get<Promo[]>("/promos", {
      params: { active: activeOnly },
    });
    return response.data;
  },

  create: async (data: CreatePromoDto): Promise<Promo> => {
    const response = await apiClient.post<Promo>("/promos", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreatePromoDto> & { isActive?: boolean },
  ): Promise<Promo> => {
    const response = await apiClient.patch<Promo>(`/promos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/promos/${id}`);
  },

  apply: async (orderId: string, code: string) => {
    const response = await apiClient.post(`/orders/${orderId}/promo`, { code });
    return response.data;
  },
};
