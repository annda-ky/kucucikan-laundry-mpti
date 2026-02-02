"use client";

import { History, AlertTriangle } from "lucide-react";
import { reportService } from "@/services/report.service";
import { Shift } from "@/types";

interface ShiftAuditViewProps {
  shifts: Shift[];
  meta: any;
  onPageChange: (page: number) => void;
}

export function ShiftAuditView({
  shifts,
  meta,
  onPageChange,
}: ShiftAuditViewProps) {
  // Filter only closed shifts
  const closedShifts = shifts;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <History size={16} className="text-[#C5A059]" />
            Riwayat Penutupan Shift (Audit)
          </h3>
        </div>

        {closedShifts.length > 0 ? (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#0F0F0F]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                    Waktu Shift
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                    Kasir
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080] text-right">
                    Sistem (Est. Laci)
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080] text-right">
                    Aktual (Fisik Laci)
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080] text-right">
                    Selisih
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {closedShifts.map((shift) => {
                  const diff = Number(shift.difference || 0);
                  const isNegative = diff < 0;
                  const isMatch = diff === 0;

                  return (
                    <tr
                      key={shift.id}
                      className="hover:bg-[#C5A059]/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-white bg-[#2A2A2A] px-2 py-0.5 rounded w-fit mb-1">
                            {new Date(shift.startTime).toLocaleDateString(
                              "id-ID",
                            )}
                          </span>
                          <span className="text-[10px] text-[#808080]">
                            {new Date(shift.startTime).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" },
                            )}{" "}
                            -
                            {shift.endTime
                              ? new Date(shift.endTime).toLocaleTimeString(
                                  "id-ID",
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white font-medium">
                          {shift.cashier?.username || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-[#808080]">
                          {reportService.formatRevenue(
                            shift.systemExpectedCash || 0,
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-white font-medium">
                          {reportService.formatRevenue(
                            shift.actualCashClosing || 0,
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div
                          className={`flex items-center justify-end gap-2 ${
                            isMatch
                              ? "text-emerald-500"
                              : isNegative
                                ? "text-red-500"
                                : "text-emerald-400"
                          }`}
                        >
                          {!isMatch && <AlertTriangle size={14} />}
                          <span className="text-sm font-bold">
                            {diff > 0 ? "+" : ""}
                            {reportService.formatRevenue(diff)}
                          </span>
                        </div>
                        <p className="text-[9px] text-[#808080] mt-0.5">
                          {isMatch
                            ? "Sesuai"
                            : isNegative
                              ? "Kurang Setor"
                              : "Lebih Setor"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#808080]">
            Belum ada rekam jejak shift yang selesai.
          </div>
        )}

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-[#2A2A2A] flex items-center justify-between">
          <span className="text-xs text-[#808080]">
            Page {meta.page} of {meta.totalPages} ({meta.total} records)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, meta.page - 1))}
              disabled={meta.page === 1}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#2A2A2A] rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3A3A3A] transition-colors"
            >
              PREV
            </button>
            <button
              onClick={() =>
                onPageChange(Math.min(meta.totalPages, meta.page + 1))
              }
              disabled={meta.page >= meta.totalPages}
              className="px-3 py-1.5 text-xs font-bold text-[#0F0F0F] bg-[#C5A059] rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D5B069] transition-colors"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
