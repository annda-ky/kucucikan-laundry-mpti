"use client";

import {
  WashingMachine,
  Clock,
  AlertTriangle,
  Timer,
  CheckCircle,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import type { Order, Machine, StatusLaundry } from "@/types";

interface OperationCardProps {
  order: Order;
  machine?: Machine;
  onOpenModal: (type: "timer" | "finish" | "status") => void;
}

export function OperationCard({
  order,
  machine,
  onOpenModal,
}: OperationCardProps) {
  // Calculate remaining time
  const getRemainingTime = (): { minutes: number; isOverdue: boolean } => {
    if (!order.washingStartedAt || !order.actualDurationMinutes) {
      return { minutes: 0, isOverdue: false };
    }
    const startTime = new Date(order.washingStartedAt).getTime();
    const endTime = startTime + order.actualDurationMinutes * 60000;
    const now = Date.now();
    const remainingMs = endTime - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return {
      minutes: Math.abs(remainingMinutes),
      isOverdue: remainingMinutes < 0,
    };
  };

  const { minutes, isOverdue } = getRemainingTime();
  const hasTimer = order.washingStartedAt && order.actualDurationMinutes;

  return (
    <div
      className={`bg-white border rounded-sm p-5 transition-all ${
        isOverdue
          ? "border-red-300 bg-red-50"
          : "border-[#F0EDE4] hover:shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-[#A19E95] uppercase tracking-[0.1em]">
            {order.invoiceNumber}
          </p>
          <p className="text-sm font-medium text-[#1A1A1A]">
            {order.customer?.name || "Pelanggan"}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-[9px] font-bold uppercase rounded ${orderService.getLaundryStatusColor(
            order.statusLaundry as StatusLaundry,
          )} bg-opacity-10`}
        >
          {orderService.getLaundryStatusLabel(
            order.statusLaundry as StatusLaundry,
          )}
        </span>
      </div>

      {/* Machine & Timer */}
      {machine && (
        <div className="flex items-center gap-2 mb-3 text-[11px] text-[#A19E95]">
          <WashingMachine size={14} />
          <span>{machine.name}</span>
        </div>
      )}

      {/* Timer Display */}
      {hasTimer && (
        <div
          className={`flex items-center gap-2 p-3 rounded-sm mb-4 ${
            isOverdue ? "bg-red-100" : "bg-amber-50"
          }`}
        >
          {isOverdue ? (
            <AlertTriangle size={18} className="text-red-500" />
          ) : (
            <Timer size={18} className="text-amber-500" />
          )}
          <div className="flex-1">
            <p
              className={`text-lg font-bold ${
                isOverdue ? "text-red-600" : "text-amber-600"
              }`}
            >
              {isOverdue ? `+${minutes}` : minutes} menit
            </p>
            <p className="text-[10px] text-[#A19E95]">
              {isOverdue ? "Melewati waktu!" : "Sisa waktu"}
            </p>
          </div>
          <button
            onClick={() => onOpenModal("timer")}
            className="p-2 hover:bg-white rounded transition-colors"
            title="Atur ulang timer"
          >
            <Clock size={16} className="text-[#A19E95]" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onOpenModal("status")}
          className="flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.1em] border border-[#F0EDE4] rounded-sm hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
        >
          Ubah Status
        </button>
        {order.statusLaundry !== "PENDING" && (
          <button
            onClick={() => onOpenModal("finish")}
            className="flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.1em] bg-emerald-500 text-white rounded-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
          >
            <CheckCircle size={12} />
            Selesai
          </button>
        )}
      </div>
    </div>
  );
}
