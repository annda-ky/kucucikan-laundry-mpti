"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  History,
  AlertTriangle,
} from "lucide-react";
import { reportService } from "@/services/report.service";
import { shiftService } from "@/services/shift.service";
import { FinanceSummary, Shift } from "@/types";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function OwnerReportsPage() {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "AUDIT">("OVERVIEW");
  const [isLoading, setIsLoading] = useState(true);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0].slice(0, 7) + "-01", // First day of current month
    endDate: new Date().toISOString().split("T")[0], // Today
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]); // Refetch when dates change

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Only fetch finance with dates when in OVERVIEW mode
      const [financeData, shiftsData] = await Promise.all([
        reportService.getFinanceSummary(dateRange.startDate, dateRange.endDate),
        shiftService.getAll(),
      ]);
      setFinance(financeData);
      setShifts(shiftsData);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      toast.error("Gagal memuat laporan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await reportService.downloadExport(
        undefined,
        dateRange.startDate,
        dateRange.endDate,
      );
      toast.success("Laporan berhasil diexport!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Gagal export laporan.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !finance) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Laporan{" "}
            <span className="text-[#C5A059] font-medium italic">Bisnis</span>
          </h1>
          <p className="text-[#808080] text-sm">
            {activeTab === "OVERVIEW"
              ? `Laporan Keuangan: ${finance?.period || "Loading..."}`
              : "Audit selisih tutup kasir (Blind Closing)"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === "OVERVIEW" && (
            <div className="flex items-center gap-2 bg-[#1A1A1A] p-1 rounded-sm border border-[#2A2A2A]">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="bg-transparent text-white text-xs px-2 py-1 outline-none [&::-webkit-calendar-picker-indicator]:invert"
              />
              <span className="text-[#808080] text-xs">-</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="bg-transparent text-white text-xs px-2 py-1 outline-none [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex bg-[#1A1A1A] p-1 rounded-sm border border-[#2A2A2A]">
            <button
              onClick={() => setActiveTab("OVERVIEW")}
              className={`px-4 py-2 text-[10px] font-bold tracking-wider rounded-sm transition-all ${
                activeTab === "OVERVIEW"
                  ? "bg-[#C5A059] text-[#0F0F0F]"
                  : "text-[#808080] hover:text-white"
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab("AUDIT")}
              className={`px-4 py-2 text-[10px] font-bold tracking-wider rounded-sm transition-all ${
                activeTab === "AUDIT"
                  ? "bg-[#C5A059] text-[#0F0F0F]"
                  : "text-[#808080] hover:text-white"
              }`}
            >
              AUDIT
            </button>
          </div>

          {activeTab === "OVERVIEW" && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm text-xs font-bold text-white hover:border-[#C5A059] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {isExporting ? "EXPORTING..." : "CSV"}
            </button>
          )}
        </div>
      </div>

      {activeTab === "OVERVIEW" ? (
        <FinancialOverview finance={finance} />
      ) : (
        <ShiftAuditView shifts={shifts} />
      )}
    </div>
  );
}

function FinancialOverview({ finance }: { finance: FinanceSummary | null }) {
  // Prepare chart data
  const chartData = finance
    ? [
        {
          name: "Total",
          income: finance.income,
          expense: finance.expense,
          profit: finance.netProfit,
        },
        {
          name: "Cash",
          income: finance.breakdown?.cash || 0,
          expense: 0,
          profit: 0,
        },
        {
          name: "Digital",
          income: finance.breakdown?.digital || 0,
          expense: 0,
          profit: 0,
        },
      ]
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-sm">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-sm flex items-center gap-1">
              <ArrowUpRight size={12} /> Income
            </span>
          </div>
          <div>
            <p className="text-[#808080] text-xs uppercase tracking-wider mb-1">
              Total Pendapatan
            </p>
            <h3 className="text-2xl font-medium text-white">
              {reportService.formatRevenue(finance?.income)}
            </h3>
            <div className="flex gap-4 mt-2 text-xs text-[#808080]">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#C5A059]"></div>
                Cash: {reportService.formatRevenue(finance?.breakdown?.cash)}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Digital:{" "}
                {reportService.formatRevenue(finance?.breakdown?.digital)}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-red-500/10 rounded-sm">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <span className="bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded-sm flex items-center gap-1">
              <ArrowDownRight size={12} /> Expense
            </span>
          </div>
          <div>
            <p className="text-[#808080] text-xs uppercase tracking-wider mb-1">
              Total Pengeluaran
            </p>
            <h3 className="text-2xl font-medium text-white">
              {reportService.formatRevenue(finance?.expense)}
            </h3>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-[#C5A059]/10 rounded-sm">
              <Wallet className="w-5 h-5 text-[#C5A059]" />
            </div>
            <span className="bg-[#C5A059]/10 text-[#C5A059] text-xs px-2 py-1 rounded-sm">
              Net Profit
            </span>
          </div>
          <div>
            <p className="text-[#808080] text-xs uppercase tracking-wider mb-1">
              Keuntungan Bersih
            </p>
            <h3 className="text-2xl font-medium text-white">
              {reportService.formatRevenue(finance?.netProfit)}
            </h3>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-sm">
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#C5A059]" />
          Analisis Keuangan
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2A2A2A"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#808080"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#808080"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  borderColor: "#2A2A2A",
                  color: "#fff",
                }}
                formatter={(value: any) => [
                  `Rp ${(value || 0).toLocaleString("id-ID")}`,
                  "",
                ]}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                name="Pemasukan"
                dataKey="income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
              <Bar
                name="Pengeluaran"
                dataKey="expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A]">
          <h3 className="text-lg font-medium text-white">
            Riwayat Transaksi & Pengeluaran
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#111] text-[#808080] uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium">Tipe</th>
                <th className="px-6 py-3 font-medium">Kategori</th>
                <th className="px-6 py-3 font-medium">Deskripsi</th>
                <th className="px-6 py-3 font-medium text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {finance?.details?.map((item) => (
                <tr key={item.id} className="hover:bg-[#222] transition-colors">
                  <td className="px-6 py-4 text-white">
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type === "INCOMING"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {item.type === "INCOMING" ? "PEMASUKAN" : "PENGELUARAN"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#808080]">{item.category}</td>
                  <td className="px-6 py-4 text-white max-w-[200px] truncate">
                    {item.description}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-medium ${
                      item.type === "INCOMING"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {item.type === "INCOMING" ? "+" : "-"}
                    {reportService.formatRevenue(item.amount)}
                  </td>
                </tr>
              ))}
              {(!finance?.details || finance.details.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-[#808080]"
                  >
                    Belum ada data transaksi bulan ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
