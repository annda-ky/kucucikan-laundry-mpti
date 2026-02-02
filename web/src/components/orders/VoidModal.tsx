"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { orderService } from "@/services/order.service";
import type { Order } from "@/types";

interface VoidModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

export function VoidModal({ order, onClose, onSuccess }: VoidModalProps) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!pin) return;
    setLoading(true);
    setError("");

    try {
      await orderService.void(order.id, { ownerPin: pin });
      toast.success("Transaksi berhasil dibatalkan (VOID)");
      onSuccess();
    } catch (err: any) {
      console.error("Error voiding order:", err);
      const msg =
        err.response?.data?.message || "PIN Salah atau terjadi kesalahan";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4] bg-red-50">
          <h3 className="text-lg font-light text-red-600">Void Transaksi</h3>
          <button onClick={onClose} className="text-red-400 hover:text-red-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-[#1A1A1A]">
              Anda akan membatalkan order:
            </p>
            <p className="text-xl font-bold text-[#1A1A1A]">
              {order.invoiceNumber}
            </p>
            <p className="text-xs text-[#A19E95]">
              Perlu PIN Owner untuk melanjutkan. Tindakan ini tidak dapat
              dibatalkan.
            </p>
          </div>

          <div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Masukkan PIN Owner"
              className="w-full px-4 py-3 text-center tracking-widest text-lg border border-[#F0EDE4] rounded-sm outline-none focus:border-red-500"
              maxLength={6}
            />
            {error && (
              <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || pin.length < 4}
            className="w-full py-3.5 bg-red-600 text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "KONFIRMASI VOID"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
