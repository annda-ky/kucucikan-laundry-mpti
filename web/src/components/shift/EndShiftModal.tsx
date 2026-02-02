"use client";

import { useState } from "react";
import { Loader2, X, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { shiftService } from "@/services/shift.service";
import { authService } from "@/services/auth.service";
import type { Shift } from "@/types";

interface EndShiftModalProps {
  shift: Shift;
  onClose: () => void;
  onSuccess: () => void;
}

export function EndShiftModal({
  shift,
  onClose,
  onSuccess,
}: EndShiftModalProps) {
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
