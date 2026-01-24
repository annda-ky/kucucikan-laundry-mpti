"use client";

import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Wallet,
  Play,
  Square,
  Clock,
  DollarSign,
  Plus,
  Loader2,
  X,
  Receipt,
  Printer,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { shiftService } from "@/services/shift.service";
import { expenseService, EXPENSE_ICONS } from "@/services/expense.service";
import { authService } from "@/services/auth.service";
import { PrintableShiftSummary } from "@/components/PrintableShiftSummary";
import type {
  Shift,
  CreateShiftDto,
  CreateExpenseDto,
  ExpenseCategory,
  Expense,
  User,
} from "@/types";

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
      const shifts = await shiftService.getAll();
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
      <div
        className={`p-8 rounded-sm border-2 ${
          currentShift
            ? "border-emerald-200 bg-emerald-50"
            : "border-[#F0EDE4] bg-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentShift ? "bg-emerald-500" : "bg-[#E5E2D9]"
              }`}
            >
              {currentShift ? (
                <Clock size={20} className="text-white" />
              ) : (
                <Wallet size={20} className="text-[#A19E95]" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#1A1A1A]">
                {currentShift ? "Shift Aktif" : "Belum Ada Shift Aktif"}
              </h3>
              {currentShift && (
                <p className="text-sm text-[#A19E95]">
                  Mulai:{" "}
                  {new Date(currentShift.startTime).toLocaleTimeString("id-ID")}{" "}
                  • Durasi:{" "}
                  {shiftService.calculateDuration(currentShift.startTime)}
                </p>
              )}
            </div>
          </div>

          {currentShift ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-3 bg-[#FAF9F6] text-[#1A1A1A] text-[11px] font-bold tracking-[0.15em] rounded-sm hover:bg-[#C5A059] hover:text-white transition-colors border border-[#F0EDE4]"
              >
                <Printer size={14} />
                CETAK RINGKASAN
              </button>
              {currentShift.cashierId === user?.id ? (
                <button
                  onClick={() => setShowEndModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white text-[11px] font-bold tracking-[0.15em] rounded-sm hover:bg-red-600 transition-colors"
                >
                  <Square size={14} />
                  AKHIRI SHIFT
                </button>
              ) : user?.role === "ADMIN" || user?.role === "OWNER" ? (
                <button
                  onClick={() => setShowEndModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white text-[11px] font-bold tracking-[0.15em] rounded-sm hover:bg-orange-600 transition-colors"
                >
                  <Square size={14} />
                  FORCE CLOSE ({currentShift.cashier?.username})
                </button>
              ) : (
                <div className="px-6 py-3 bg-gray-100 text-gray-400 text-[11px] font-bold tracking-[0.15em] rounded-sm border border-gray-200">
                  SHIFT: {currentShift.cashier?.username || "LAIN"}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowStartModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white text-[11px] font-bold tracking-[0.15em] rounded-sm hover:bg-emerald-600 transition-colors"
            >
              <Play size={14} />
              MULAI SHIFT
            </button>
          )}
        </div>

        {currentShift && (
          <div className="mt-6 pt-6 border-t border-emerald-200 grid grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] mb-1">
                Modal Awal
              </p>
              <p className="text-xl font-light text-[#1A1A1A]">
                {shiftService.formatCurrency(currentShift.startCash)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] mb-1">
                Total Pengeluaran
              </p>
              <p className="text-xl font-light text-red-600">
                -{shiftService.formatCurrency(totalExpenses)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] mb-1">
                Jumlah Transaksi
              </p>
              <p className="text-xl font-light text-[#1A1A1A]">
                {expenses.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expenses Section */}
      {currentShift && (
        <div className="bg-white border border-[#F0EDE4] rounded-sm">
          <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              Pengeluaran Shift
            </h3>
            <button
              onClick={() => setShowExpenseModal(true)}
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
                        {new Date(expense.createdAt).toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
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

// Start Shift Modal
function StartShiftModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [startCash, setStartCash] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await shiftService.start({ startCash });
      toast.success("Shift berhasil dimulai");
      onSuccess();
    } catch (error) {
      console.error("Error starting shift:", error);
      toast.error("Gagal memulai shift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
          <h3 className="text-lg font-light text-[#1A1A1A]">Mulai Shift</h3>
          <button
            onClick={onClose}
            className="text-[#A19E95] hover:text-[#1A1A1A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-3">
              Modal Awal (FR-CSH-01)
            </label>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {shiftService.PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setStartCash(amount)}
                  className={`py-2.5 text-[11px] font-bold rounded-sm transition-all ${
                    startCash === amount
                      ? "bg-[#C5A059] text-white"
                      : "bg-[#FAF9F6] text-[#1A1A1A] hover:bg-[#C5A059]/20"
                  }`}
                >
                  {shiftService.formatShortCurrency(amount)}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <DollarSign
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
              />
              <input
                type="number"
                value={startCash || ""}
                onChange={(e) => setStartCash(Number(e.target.value))}
                placeholder="Atau masukkan jumlah..."
                className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || startCash <= 0}
            className="w-full py-3.5 bg-emerald-500 text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mx-auto" />
            ) : (
              "MULAI SHIFT"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// End Shift Modal (Blind Closing - FR-CSH-03)
function EndShiftModal({
  shift,
  onClose,
  onSuccess,
}: {
  shift: Shift;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [actualCash, setActualCash] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const currentUser = authService.getCurrentUser();

      // If current user is NOT the shift owner, use forceEnd
      if (currentUser && currentUser.id !== shift.cashierId) {
        await shiftService.forceEnd(shift.id, {
          actualCashClosing: actualCash,
        });
      } else {
        await shiftService.end({ actualCashClosing: actualCash });
      }

      toast.success("Shift berhasil diakhiri");
      onSuccess();
    } catch (error) {
      console.error("Error ending shift:", error);
      toast.error("Gagal mengakhiri shift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
          <h3 className="text-lg font-light text-[#1A1A1A]">Akhiri Shift</h3>
          <button
            onClick={onClose}
            className="text-[#A19E95] hover:text-[#1A1A1A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm">
            <p className="text-[11px] text-amber-700">
              <strong>Blind Closing:</strong> Masukkan jumlah uang fisik di
              laci. Sistem akan menyembunyikan selisih dari Admin.
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-3">
              Jumlah Uang Fisik
            </label>
            <div className="relative">
              <DollarSign
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
              />
              <input
                type="number"
                value={actualCash || ""}
                onChange={(e) => setActualCash(Number(e.target.value))}
                placeholder="Hitung dan masukkan..."
                className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || actualCash <= 0}
            className="w-full py-3.5 bg-red-500 text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mx-auto" />
            ) : (
              "AKHIRI SHIFT"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Expense Modal (FR-CSH-02)
function ExpenseModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<CreateExpenseDto>({
    category: "OTHER",
    amount: 0,
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const categories = expenseService.getCategories();

  const handleSubmit = async () => {
    if (formData.amount <= 0) return;

    setLoading(true);
    try {
      await expenseService.create(formData);
      toast.success("Pengeluaran berhasil dicatat");
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal mencatat pengeluaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
          <h3 className="text-lg font-light text-[#1A1A1A]">
            Tambah Pengeluaran
          </h3>
          <button
            onClick={onClose}
            className="text-[#A19E95] hover:text-[#1A1A1A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Category Selection with Icons */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-3">
              Kategori
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() =>
                    setFormData({ ...formData, category: cat.value })
                  }
                  className={`flex flex-col items-center p-3 rounded-sm border transition-all ${
                    formData.category === cat.value
                      ? "border-[#C5A059] bg-[#C5A059]/10"
                      : "border-[#F0EDE4] hover:border-[#C5A059]/50"
                  }`}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span className="text-[9px] font-bold text-[#1A1A1A]">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
              Jumlah
            </label>
            <div className="relative">
              <DollarSign
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
              />
              <input
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
              Catatan
            </label>
            <input
              type="text"
              value={formData.note || ""}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="Opsional..."
              className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || formData.amount <= 0}
            className="w-full py-3.5 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mx-auto" />
            ) : (
              "SIMPAN"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
