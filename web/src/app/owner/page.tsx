"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  WashingMachine,
  CheckCircle2,
  Clock,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Loader2,
} from "lucide-react";
import { reportService } from "@/services/report.service";
import { machineService } from "@/services/machine.service";
import { orderService } from "@/services/order.service";
import { AmRevenueChart } from "@/components/ui/charts/AmRevenueChart";
import { AmPieChart } from "@/components/ui/charts/AmPieChart";
import { customerService } from "@/services/customer.service";
import type { DashboardSummary, Machine, Order, Customer } from "@/types";

export default function OwnerDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [revenueData, setRevenueData] = useState<
    { name: string; value: number }[]
  >([]);
  const [serviceData, setServiceData] = useState<
    { name: string; value: number }[]
  >([]);
  const [paymentData, setPaymentData] = useState<
    { name: string; value: number }[]
  >([]);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueChange, setRevenueChange] = useState<{
    value: number;
    isPositive: boolean;
  }>({
    value: 0,
    isPositive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, machinesData, chartData, leaderboardData] =
          await Promise.all([
            reportService.getDashboard(),
            machineService.getAll(),
            reportService.getChartData(),
            customerService.getLeaderboard("totalSpend"),
          ]);

        setSummary(summaryData);
        setMachines(machinesData);

        if (chartData && chartData.revenueChart.length >= 2) {
          setRevenueData(chartData.revenueChart);
          setServiceData(chartData.serviceChart);
          setPaymentData(chartData.paymentChart);

          const todayRevenue =
            chartData.revenueChart[chartData.revenueChart.length - 1].value;
          const yesterdayRevenue =
            chartData.revenueChart[chartData.revenueChart.length - 2].value;

          const change = reportService.getPercentageChange(
            todayRevenue,
            yesterdayRevenue,
          );
          setRevenueChange(change);
        } else {
          setRevenueChange({ value: 0, isPositive: true });
        }

        setTopCustomers(leaderboardData.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#C5A059]" />
      </div>
    );
  }

  const stats = [
    {
      label: "Revenue Today",
      value: summary
        ? reportService.formatRevenue(summary.totalRevenue)
        : "Rp 0",
      icon: DollarSign,
      change: `${revenueChange.isPositive ? "+" : "-"}${revenueChange.value}%`,
      positive: revenueChange.isPositive,
    },
    {
      label: "Active Machines",
      value: `${machines.filter((m) => m.status === "WASHING").length}/${machines.length}`,
      icon: WashingMachine,
      subtitle: "Operational",
    },
    {
      label: "Completed Orders",
      value: summary?.completedOrders || 0,
      icon: CheckCircle2,
      subtitle: "Today",
    },
    {
      label: "Pending Orders",
      value: summary?.pendingOrders || 0,
      icon: Clock,
      subtitle: "In Progress",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Crown size={16} className="text-[#C5A059]" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#C5A059] uppercase">
            Executive Summary
          </span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-white">
          Selamat Datang,{" "}
          <span className="font-medium italic text-[#C5A059]">Owner</span>
        </h1>
        <p className="text-[#808080] text-sm font-light">
          Overview bisnis Kucucikan Laundry hari ini
        </p>
      </header>

      {/* 1. KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm hover:border-[#C5A059]/30 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                  {stat.label}
                </p>
                <IconComponent size={16} className="text-[#C5A059]" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-light text-white tracking-tight">
                  {stat.value}
                </p>
                {stat.change && (
                  <div className="flex items-center gap-1">
                    {stat.positive ? (
                      <ArrowUpRight size={12} className="text-emerald-500" />
                    ) : (
                      <ArrowDownRight size={12} className="text-red-500" />
                    )}
                    <span
                      className={`text-[10px] font-bold ${
                        stat.positive ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {stat.change} vs kemarin
                    </span>
                  </div>
                )}
                {stat.subtitle && (
                  <p className="text-[10px] font-medium text-[#808080] tracking-wider uppercase">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Main Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (Takes 2/3) */}
        <div className="lg:col-span-2">
          <AmRevenueChart
            data={revenueData}
            title="Trend Pendapatan (7 Hari)"
            isDark
          />
        </div>

        {/* Top Customers (Takes 1/3) */}
        <div className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-white uppercase">
              Top Pelanggan
            </h3>
            <Users size={16} className="text-[#C5A059]" />
          </div>
          <div className="space-y-4 flex-1">
            {topCustomers.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform group-hover:scale-110 ${
                      index === 0
                        ? "bg-gradient-to-br from-[#C5A059] to-[#8C7036] text-[#1A1A1A]"
                        : index === 1
                          ? "bg-[#E5E2D9] text-[#1A1A1A]"
                          : index === 2
                            ? "bg-[#A19E95] text-[#1A1A1A]"
                            : "bg-[#2A2A2A] text-[#808080]"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white truncate max-w-[120px]">
                      {customer.name}
                    </p>
                    <p className="text-[9px] text-[#808080]">
                      {customer.totalVisits} kunjungan
                    </p>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-[#C5A059]">
                  {reportService.formatRevenue(customer.totalSpend)}
                </p>
              </div>
            ))}
            {topCustomers.length === 0 && (
              <div className="text-center text-[#808080] text-xs py-12 flex flex-col items-center">
                <Users size={24} className="mb-2 opacity-20" />
                Belum ada data pelanggan VIP.
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
            <p className="text-[9px] text-[#808080] text-center">
              *Berdasarkan total pembelanjaan all-time
            </p>
          </div>
        </div>
      </div>

      {/* 3. Secondary Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AmPieChart data={serviceData} title="Distribusi Layanan" isDark />
        <AmPieChart data={paymentData} title="Metode Pembayaran" isDark />
      </div>

      {/* 4. Actions */}
      <div className="p-6 bg-gradient-to-r from-[#C5A059]/10 to-transparent border border-[#C5A059]/20 rounded-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#C5A059] uppercase mb-1">
              Export Laporan
            </h3>
            <p className="text-[#808080] text-sm">
              Unduh laporan transaksi dalam format CSV
            </p>
          </div>
          <button
            onClick={() => reportService.downloadExport()}
            className="px-6 py-3 bg-[#C5A059] text-[#0F0F0F] text-[10px] font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[#D4AF6A] transition-colors"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
