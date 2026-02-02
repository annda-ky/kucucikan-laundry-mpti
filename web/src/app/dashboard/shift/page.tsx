"use client";

import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Loader2 } from "lucide-react";
import { shiftService } from "@/services/shift.service";
import { expenseService } from "@/services/expense.service";
import { authService } from "@/services/auth.service";
import { PrintableShiftSummary } from "@/components/PrintableShiftSummary";
import { StartShiftModal } from "@/components/shift/StartShiftModal";
import { EndShiftModal } from "@/components/shift/EndShiftModal";
import { ExpenseModal } from "@/components/shift/ExpenseModal";
import { ShiftStatusCard } from "@/components/shift/ShiftStatusCard";
import { ExpenseList } from "@/components/shift/ExpenseList";
import type { Shift, Expense, User } from "@/types";

export default function ShiftPage() {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Shift-${currentShift?.id.slice(0, 8)}-${new Date().toISOString().split("T")[0]}`,
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const fetchShiftData = async () => {
    try {
      const response = await shiftService.getAll();
      const shifts = response.data;
      // Find active shift (no endTime)
      const active = shifts.find((s) => !s.endTime);
      setCurrentShift(active || null);

      if (active) {
        const allExpenses = await expenseService.getAll();
        setExpenses(allExpenses.filter((e) => e.shiftId === active.id));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftData();
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-[#C5A059]" />
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#C5A059] uppercase">
            Cash Management
          </span>
        </div>
        <h2 className="text-3xl font-light tracking-tight text-[#1A1A1A]">
          Management{" "}
          <span className="font-medium italic text-[#C5A059]">Shift</span>
        </h2>
        <p className="text-[#A19E95] text-sm tracking-wide font-light">
          Kelola shift kasir dan pengeluaran harian.
        </p>
      </header>

      {/* Shift Status Card */}
      <ShiftStatusCard
        currentShift={currentShift}
        totalExpenses={totalExpenses}
        expensesCount={expenses.length}
        user={user}
        onPrint={handlePrint}
        onStartShift={() => setShowStartModal(true)}
        onEndShift={() => setShowEndModal(true)}
      />

      {/* Expenses Section */}
      {currentShift && (
        <ExpenseList
          expenses={expenses}
          onAddExpense={() => setShowExpenseModal(true)}
        />
      )}

      {/* Start Shift Modal */}
      {showStartModal && (
        <StartShiftModal
          onClose={() => setShowStartModal(false)}
          onSuccess={() => {
            setShowStartModal(false);
            fetchShiftData();
          }}
        />
      )}

      {/* End Shift Modal */}
      {showEndModal && currentShift && (
        <EndShiftModal
          shift={currentShift}
          onClose={() => setShowEndModal(false)}
          onSuccess={() => {
            setShowEndModal(false);
            fetchShiftData();
          }}
        />
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSuccess={() => {
            setShowExpenseModal(false);
            fetchShiftData();
          }}
        />
      )}

      <div className="hidden">
        {currentShift && (
          <PrintableShiftSummary
            ref={printRef}
            shift={currentShift}
            expenses={expenses}
            user={user}
          />
        )}
      </div>
    </div>
  );
}
