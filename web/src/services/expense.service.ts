import { apiClient } from "@/lib/api-client";
import type { Expense, CreateExpenseDto, ExpenseCategory } from "@/types";

// Expense category icons (FR-CSH-02)
export const EXPENSE_ICONS: Record<
  ExpenseCategory,
  { icon: string; label: string; color: string }
> = {
  FOOD: {
    icon: "🍔",
    label: "Makanan",
    color: "bg-orange-100 text-orange-600",
  },
  SOAP: {
    icon: "🧴",
    label: "Sabun/Deterjen",
    color: "bg-blue-100 text-blue-600",
  },
  FUEL: { icon: "⛽", label: "BBM", color: "bg-red-100 text-red-600" },
  OTHER: { icon: "📦", label: "Lainnya", color: "bg-gray-100 text-gray-600" },
};

export const expenseService = {
  /**
   * Get all expenses
   */
  getAll: async (): Promise<Expense[]> => {
    const response = await apiClient.get<Expense[]>("/expenses");
    return response.data;
  },

  /**
   * Get expense by ID
   */
  getById: async (id: string): Promise<Expense> => {
    const response = await apiClient.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  /**
   * Create new expense (FR-CSH-02)
   */
  create: async (data: CreateExpenseDto): Promise<Expense> => {
    const response = await apiClient.post<Expense>("/expenses", data);
    return response.data;
  },

  /**
   * Delete expense
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  /**
   * Get category info
   */
  getCategoryInfo: (category: ExpenseCategory) => {
    return EXPENSE_ICONS[category] || EXPENSE_ICONS.OTHER;
  },

  /**
   * Get all categories for dropdown
   */
  getCategories: (): Array<{
    value: ExpenseCategory;
    label: string;
    icon: string;
  }> => {
    return Object.entries(EXPENSE_ICONS).map(([value, info]) => ({
      value: value as ExpenseCategory,
      label: info.label,
      icon: info.icon,
    }));
  },

  /**
   * Format currency
   */
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  },
};
