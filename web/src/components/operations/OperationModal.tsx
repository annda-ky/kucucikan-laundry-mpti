"use client";

import { useState, useEffect } from "react";
import { Loader2, X, MapPin, CheckCircle, Play } from "lucide-react";
import { orderService } from "@/services/order.service";
import type { Order, StatusLaundry } from "@/types";

interface OperationModalProps {
  order: Order;
  type: "timer" | "finish" | "status";
  onClose: () => void;
  onSuccess: () => void;
}

const TIMER_PRESETS = [15, 30, 45, 60, 90, 120];

export function OperationModal({
  order,
  type,
  onClose,
  onSuccess,
}: OperationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [customTimer, setCustomTimer] = useState(30);
  const [rackLocation, setRackLocation] = useState("");

  useEffect(() => {
    if (order) {
      setCustomTimer(order.actualDurationMinutes || 30);
      setRackLocation(order.rackLocation || "");
    }
  }, [order]);

  const handleAdjustTimer = async (minutes: number) => {
    setSubmitting(true);
    try {
      await orderService.updateStatus(order.id, {
        status: order.statusLaundry as StatusLaundry,
        durationMinutes: minutes,
      });
      onSuccess();
    } catch (error) {
      console.error("Error adjusting timer:", error);
      alert("Gagal mengatur timer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishOrder = async () => {
    setSubmitting(true);
    try {
      await orderService.updateStatus(order.id, {
        status: "DONE",
        rackLocation: rackLocation || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error("Error finishing order:", error);
      alert("Gagal menyelesaikan order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: StatusLaundry) => {
    setSubmitting(true);
    try {
      await orderService.updateStatus(order.id, { status });
      onSuccess();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengubah status");
    } finally {
      setSubmitting(false);
    }
  };

  const getNextStatusOptions = (
    currentStatus: StatusLaundry,
  ): StatusLaundry[] => {
    switch (currentStatus) {
      case "PENDING":
        return ["WASHING"];
      case "WASHING":
        return ["DRYING", "IRONING", "DONE"];
      case "DRYING":
        return ["IRONING", "DONE"];
      case "IRONING":
        return ["DONE"];
      case "DONE":
        return ["PICKED_UP"];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-sm shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[#F0EDE4]">
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              {type === "timer"
                ? "Atur Timer"
                : type === "finish"
                  ? "Selesaikan Order"
                  : "Ubah Status"}
            </h3>
            <p className="text-[10px] text-[#A19E95]">{order.invoiceNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A19E95] hover:text-[#1A1A1A]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Timer Adjust */}
          {type === "timer" && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                Pilih Durasi (menit)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TIMER_PRESETS.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleAdjustTimer(mins)}
                    disabled={submitting}
                    className="py-3 text-sm font-bold border border-[#F0EDE4] rounded-sm hover:border-[#C5A059] hover:text-[#C5A059] transition-colors disabled:opacity-50"
                  >
                    {mins}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <input
                  type="number"
                  min="1"
                  value={customTimer}
                  onChange={(e) => setCustomTimer(Number(e.target.value))}
                  className="flex-1 px-4 py-3 border border-[#F0EDE4] rounded-sm text-center text-sm outline-none focus:border-[#C5A059]"
                />
                <button
                  onClick={() => handleAdjustTimer(customTimer)}
                  disabled={submitting || customTimer < 1}
                  className="px-6 py-3 bg-[#C5A059] text-white text-[11px] font-bold uppercase rounded-sm hover:bg-[#B08D4A] disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Set"
                  )}
                </button>
              </div>
            </>
          )}

          {/* Finish Order */}
          {type === "finish" && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] flex items-center gap-2">
                  <MapPin size={12} />
                  Lokasi Rak (FR-OPS-05)
                </label>
                <input
                  type="text"
                  value={rackLocation}
                  onChange={(e) => setRackLocation(e.target.value)}
                  placeholder="Contoh: Rak A-2, Gantungan 5..."
                  className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
                />
                <p className="text-[10px] text-[#A19E95]">
                  Masukkan lokasi penyimpanan cucian yang sudah selesai
                </p>
              </div>
              <button
                onClick={handleFinishOrder}
                disabled={submitting}
                className="w-full py-3.5 bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Tandai Selesai
                  </>
                )}
              </button>
            </>
          )}

          {/* Status Change */}
          {type === "status" && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                Status Saat Ini:{" "}
                <span
                  className={orderService.getLaundryStatusColor(
                    order.statusLaundry as StatusLaundry,
                  )}
                >
                  {orderService.getLaundryStatusLabel(
                    order.statusLaundry as StatusLaundry,
                  )}
                </span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                Pilih Status Baru
              </p>
              <div className="space-y-2">
                {getNextStatusOptions(order.statusLaundry as StatusLaundry).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      disabled={submitting}
                      className={`w-full py-3 text-sm font-bold border border-[#F0EDE4] rounded-sm hover:border-[#C5A059] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${orderService.getLaundryStatusColor(status)}`}
                    >
                      <Play size={14} />
                      {orderService.getLaundryStatusLabel(status)}
                    </button>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
