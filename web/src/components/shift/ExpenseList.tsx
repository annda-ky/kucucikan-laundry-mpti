"use client";

import { Plus, Receipt } from "lucide-react";
import { expenseService } from "@/services/expense.service";
import { shiftService } from "@/services/shift.service";
import type { Expense } from "@/types";

interface ExpenseListProps {
  expenses: Expense[];
  onAddExpense: () => void;
}

export function ExpenseList({ expenses, onAddExpense }: ExpenseListProps) {
  return (
    <div className="bg-white border border-[#F0EDE4] rounded-sm">
      <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
          Pengeluaran Shift
        </h3>
        <button
          onClick={onAddExpense}
          className="flex items-center gap-2 px-4 py-2 bg-[#FAF9F6] text-[#1A1A1A] text-[10px] font-bold tracking-[0.15em] rounded-sm hover:bg-[#C5A059] hover:text-white transition-colors"
        >
          <Plus size={14} />
          TAMBAH
        </button>
      </div>

      {expenses.length > 0 ? (
        <div className="divide-y divide-[#F0EDE4]">
          {expenses.map((expense) => {
            const categoryInfo = expenseService.getCategoryInfo(
              expense.category,
            );
            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-sm flex items-center justify-center text-lg ${categoryInfo.color}`}
                  >
                    {categoryInfo.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {categoryInfo.label}
                    </p>
                    {expense.note && (
                      <p className="text-[11px] text-[#A19E95]">
                        {expense.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">
                    -{shiftService.formatCurrency(expense.amount)}
                  </p>
                  <p className="text-[10px] text-[#A19E95]">
                    {new Date(expense.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-[#A19E95]">
          <Receipt
            size={32}
            strokeWidth={1}
            className="mx-auto mb-3 opacity-50"
          />
          <p className="text-sm">Belum ada pengeluaran</p>
        </div>
      )}
    </div>
  );
}
