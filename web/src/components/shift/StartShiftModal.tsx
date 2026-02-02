"use client";

import { useState } from "react";
import { Loader2, X, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { shiftService } from "@/services/shift.service";

interface StartShiftModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function StartShiftModal({ onClose, onSuccess }: StartShiftModalProps) {
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
