"use client";

import {
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import { AmFinanceChart } from "@/components/ui/charts/AmFinanceChart";
import { reportService } from "@/services/report.service";
import { FinanceSummary } from "@/types";

interface FinancialOverviewProps {
  finance: FinanceSummary | null;
}

export function FinancialOverview({ finance }: FinancialOverviewProps) {
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
      <AmFinanceChart
        data={chartData}
        title="Analisis Keuangan"
        isDark
        className="w-full"
      />

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
