"use client";

import { Clock, Wallet, Printer, Square, Play } from "lucide-react";
import { shiftService } from "@/services/shift.service";
import type { Shift, User } from "@/types";

interface ShiftStatusCardProps {
  currentShift: Shift | null;
  totalExpenses: number;
  expensesCount: number;
  user: User | null;
  onPrint: () => void;
  onStartShift: () => void;
  onEndShift: () => void;
}

export function ShiftStatusCard({
  currentShift,
  totalExpenses,
  expensesCount,
  user,
  onPrint,
  onStartShift,
  onEndShift,
}: ShiftStatusCardProps) {
  return (
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
                {new Date(currentShift.startTime).toLocaleTimeString("id-ID")} •
                Durasi: {shiftService.calculateDuration(currentShift.startTime)}
              </p>
            )}
          </div>
        </div>

        {currentShift ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-4 py-3 bg-[#FAF9F6] text-[#1A1A1A] text-[11px] font-bold tracking-[0.15em] rounded-sm hover:bg-[#C5A059] hover:text-white transition-colors border border-[#F0EDE4]"
            >
              <Printer size={14} />
              CETAK RINGKASAN
            </button>
            {currentShift.cashierId === user?.id ? (
              <button
                onClick={onEndShift}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white text-[11px] font-bold tracking-[0.15em] rounded-sm hover:bg-red-600 transition-colors"
              >
                <Square size={14} />
                AKHIRI SHIFT
              </button>
            ) : user?.role === "ADMIN" || user?.role === "OWNER" ? (
              <button
                onClick={onEndShift}
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
            onClick={onStartShift}
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
            <p className="text-xl font-light text-[#1A1A1A]">{expensesCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
