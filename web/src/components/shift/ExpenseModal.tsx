"use client";

import { useState } from "react";
import { Loader2, X, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { expenseService } from "@/services/expense.service";
import type { CreateExpenseDto } from "@/types";

interface ExpenseModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ExpenseModal({ onClose, onSuccess }: ExpenseModalProps) {
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
