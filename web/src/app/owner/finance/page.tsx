"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Loader2,
  AlertTriangle,
  History,
} from "lucide-react";
import { reportService } from "@/services/report.service";
import { shiftService } from "@/services/shift.service";
import type { FinanceSummary, Shift } from "@/types";

export default function OwnerFinancePage() {
  const [activeTab, setActiveTab] = useState<"DAILY" | "AUDIT">("DAILY");
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [financeData, shiftsData] = await Promise.all([
          reportService.getFinanceSummary(),
          shiftService.getAll(),
        ]);
        setSummary(financeData);
        setShifts(shiftsData);
      } catch (error) {
        console.error("Error fetching finance data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Laporan{" "}
            <span className="text-[#C5A059] font-medium italic">Keuangan</span>
          </h1>
          <p className="text-[#808080] text-sm">
            {activeTab === "DAILY"
              ? `Arus kas dan profitabilitas • ${summary?.period || "Period"}`
              : "Audit selisih tutup kasir (Blind Closing)"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#1A1A1A] p-1 rounded-sm border border-[#2A2A2A]">
          <button
            onClick={() => setActiveTab("DAILY")}
            className={`px-4 py-2 text-[10px] font-bold tracking-wider rounded-sm transition-all ${
              activeTab === "DAILY"
                ? "bg-[#C5A059] text-[#0F0F0F]"
                : "text-[#808080] hover:text-white"
            }`}
          >
            DAILY REPORT
          </button>
          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`px-4 py-2 text-[10px] font-bold tracking-wider rounded-sm transition-all ${
              activeTab === "AUDIT"
                ? "bg-[#C5A059] text-[#0F0F0F]"
                : "text-[#808080] hover:text-white"
            }`}
          >
            SHIFT AUDIT
          </button>
        </div>
      </div>

      {activeTab === "DAILY" ? (
        <DailyReportView summary={summary} />
      ) : (
        <ShiftAuditView shifts={shifts} />
      )}
    </div>
  );
}

function DailyReportView({ summary }: { summary: FinanceSummary | null }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income */}
        <div className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-sm text-emerald-500">
              <TrendingUp size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#808080]">
              Pemasukan
            </p>
          </div>
          <h2 className="text-2xl font-medium text-white">
            {reportService.formatRevenue(summary?.income)}
          </h2>
          <p className="text-xs text-[#808080] mt-1">Bulan ini</p>

          {/* Payment Method Breakdown */}
          {summary?.breakdown && (
            <div className="mt-4 pt-4 border-t border-[#2A2A2A] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#808080]">Tunai</span>
                <span className="text-white font-medium">
                  {reportService.formatRevenue(summary.breakdown.cash)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#808080]">Digital</span>
                <span className="text-white font-medium">
                  {reportService.formatRevenue(summary.breakdown.digital)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Expenses */}
        <div className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-sm text-red-500">
              <TrendingDown size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#808080]">
              Pengeluaran
            </p>
          </div>
          <h2 className="text-2xl font-medium text-white">
            {reportService.formatRevenue(summary?.expense)}
          </h2>
          <p className="text-xs text-[#808080] mt-1">Bulan ini</p>
        </div>

        {/* Net Profit */}
        <div className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#C5A059]/10 rounded-sm text-[#C5A059]">
              <Wallet size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#808080]">
              Net Profit
            </p>
          </div>
          <h2 className="text-2xl font-medium text-white">
            {reportService.formatRevenue(summary?.netProfit)}
          </h2>
          <p className="text-xs text-[#808080] mt-1">Bulan ini</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <DollarSign size={16} className="text-[#C5A059]" />
            Cash Flow Detail
          </h3>
        </div>

        {summary?.details && summary.details.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#0F0F0F]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                    Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                    Description
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                    Category
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080] text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {summary.details.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#C5A059]/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#808080]">
                        {new Date(item.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white">
                        {item.description}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-[#2A2A2A] text-[#808080]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-sm font-medium ${
                          item.type === "INCOMING"
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        {item.type === "INCOMING" ? "+" : "-"}{" "}
                        {reportService.formatRevenue(item.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#808080]">
            Belum ada transaksi bulan ini.
          </div>
        )}
      </div>
    </div>
  );
}

function ShiftAuditView({ shifts }: { shifts: Shift[] }) {
  // Filter only closed shifts
  const closedShifts = shifts.filter((s) => s.endTime);

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
          <div className="overflow-x-auto">
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
      </div>
    </div>
  );
}
