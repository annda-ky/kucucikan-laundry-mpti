import { apiClient } from "@/lib/api-client";
import type { DashboardSummary } from "@/types";

export const reportService = {
  /**
   * Get dashboard summary stats
   */
  getDashboard: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<{
      summary: DashboardSummary;
      date: string;
      lowStockItems: any[];
    }>("/reports/dashboard");
    return response.data.summary;
  },

  getFinanceSummary: async (): Promise<any> => {
    const response = await apiClient.get<any>("/reports/finance");
    return response.data;
  },

  /**
   * Export transactions to CSV (FR-REP-03)
   */
  exportCsv: async (): Promise<Blob> => {
    const response = await apiClient.get("/reports/export", {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Download exported file
   */
  downloadExport: async (filename?: string): Promise<void> => {
    const blob = await reportService.exportCsv();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      filename ||
      `laporan_laundry_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Format large numbers for dashboard
   */
  formatLargeNumber: (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  },

  /**
   * Format currency for dashboard
   */
  formatRevenue: (amount: number | null | undefined): string => {
    const safeAmount = amount ?? 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  },

  /**
   * Get percentage change
   */
  getPercentageChange: (
    current: number,
    previous: number,
  ): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0,
    };
  },
};
