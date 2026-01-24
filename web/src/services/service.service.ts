import { apiClient } from "@/lib/api-client";
import type {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  UnitType,
} from "@/types";

// Service icons mapping (FR-POS-02)
export const SERVICE_ICONS: Record<string, string> = {
  default: "📦",
  wash: "🧺",
  dry: "☀️",
  iron: "👔",
  full: "✨",
  express: "⚡",
  blanket: "🛏️",
  shoes: "👟",
  bag: "👜",
  carpet: "🧹",
};

export const serviceService = {
  /**
   * Get all services
   */
  getAll: async (): Promise<Service[]> => {
    const response = await apiClient.get<Service[]>("/services");
    return response.data;
  },

  /**
   * Get active services only
   */
  getActive: async (): Promise<Service[]> => {
    const services = await serviceService.getAll();
    return services.filter((s) => s.isActive);
  },

  /**
   * Get service by ID
   */
  getById: async (id: number): Promise<Service> => {
    const response = await apiClient.get<Service>(`/services/${id}`);
    return response.data;
  },

  /**
   * Create new service (Owner only)
   */
  create: async (data: CreateServiceDto): Promise<Service> => {
    const response = await apiClient.post<Service>("/services", data);
    return response.data;
  },

  /**
   * Update service (Owner only)
   */
  update: async (id: number, data: UpdateServiceDto): Promise<Service> => {
    const response = await apiClient.patch<Service>(`/services/${id}`, data);
    return response.data;
  },

  /**
   * Delete service (Owner only)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },

  /**
   * Get unit type label
   */
  getUnitTypeLabel: (unitType: UnitType): string => {
    switch (unitType) {
      case "KG":
        return "Kilogram";
      case "PCS":
        return "Satuan";
      case "LOAD":
        return "Per-Cuci";
      default:
        return unitType;
    }
  },

  /**
   * Get unit type short label
   */
  getUnitTypeShort: (unitType: UnitType): string => {
    switch (unitType) {
      case "KG":
        return "kg";
      case "PCS":
        return "pcs";
      case "LOAD":
        return "cuci";
      default:
        return unitType;
    }
  },

  /**
   * Get icon for service
   */
  getIcon: (serviceName: string): string => {
    const name = serviceName.toLowerCase();
    if (name.includes("cuci") || name.includes("wash"))
      return SERVICE_ICONS.wash;
    if (name.includes("kering") || name.includes("dry"))
      return SERVICE_ICONS.dry;
    if (name.includes("setrika") || name.includes("iron"))
      return SERVICE_ICONS.iron;
    if (name.includes("lengkap") || name.includes("full"))
      return SERVICE_ICONS.full;
    if (name.includes("express") || name.includes("kilat"))
      return SERVICE_ICONS.express;
    if (name.includes("selimut") || name.includes("blanket"))
      return SERVICE_ICONS.blanket;
    if (name.includes("sepatu") || name.includes("shoe"))
      return SERVICE_ICONS.shoes;
    if (name.includes("tas") || name.includes("bag")) return SERVICE_ICONS.bag;
    if (name.includes("karpet") || name.includes("carpet"))
      return SERVICE_ICONS.carpet;
    return SERVICE_ICONS.default;
  },

  /**
   * Format price to IDR
   */
  formatPrice: (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  },
};
