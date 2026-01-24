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
import { RevenueBarChart } from "@/components/ui/charts/bar-chart";
import { ServicePieChart } from "@/components/ui/charts/pie-chart";
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
  const [revenueChange, setRevenueChange] = useState({
    value: 0,
    isPositive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, machinesData, ordersData, leaderboardData] =
          await Promise.all([
            reportService.getDashboard(),
            machineService.getAll(),
            orderService.getAll(),
            customerService.getLeaderboard("totalSpend"),
          ]);
        setSummary(summaryData);
        setMachines(machinesData);
        setTopCustomers(leaderboardData.slice(0, 5));

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const todayStr = today.toISOString().split("T")[0];
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const todayRevenue = ordersData
          .filter(
            (o) =>
              o.createdAt.startsWith(todayStr) && o.statusPayment === "PAID",
          )
          .reduce((sum, o) => sum + Number(o.totalAmount), 0);

        const yesterdayRevenue = ordersData
          .filter(
            (o) =>
              o.createdAt.startsWith(yesterdayStr) &&
              o.statusPayment === "PAID",
          )
          .reduce((sum, o) => sum + Number(o.totalAmount), 0);

        const change = reportService.getPercentageChange(
          todayRevenue,
          yesterdayRevenue,
        );
        setRevenueChange(change);

        const last7Days = [...Array(7)]
          .map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split("T")[0];
          })
          .reverse();

        const dailyRevenue = last7Days.map((date) => {
          const dayTotal = ordersData
            .filter(
              (o) => o.createdAt.startsWith(date) && o.statusPayment === "PAID",
            )
            .reduce((sum, o) => sum + Number(o.totalAmount), 0);

          return {
            name: new Date(date).toLocaleDateString("id-ID", {
              weekday: "short",
            }),
            value: dayTotal,
          };
        });
        setRevenueData(dailyRevenue);

        const serviceStats: Record<string, number> = {};
        ordersData.forEach((o) => {
          o.orderItems?.forEach((item) => {
            const name = item.serviceNameSnapshot;
            serviceStats[name] = (serviceStats[name] || 0) + 1;
          });
        });

        const serviceChartData = Object.entries(serviceStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        setServiceData(serviceChartData);

        let cashRevenue = 0;
        let digitalRevenue = 0;

        ordersData.forEach((o) => {
          if (o.statusPayment === "PAID") {
            const method = o.paymentMethod || "CASH";
            const amount = Number(o.totalAmount);

            if (method === "CASH") {
              cashRevenue += amount;
            } else {
              digitalRevenue += amount;
            }
          }
        });

        const paymentChartData = [
          { name: "Tunai", value: cashRevenue },
          { name: "Digital", value: digitalRevenue },
        ].filter((item) => item.value > 0);
        setPaymentData(paymentChartData);

        setRecentOrders(ordersData.slice(0, 5));
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueBarChart
          data={revenueData}
          title="Pendapatan Minggu Ini"
          isDark
        />
        <ServicePieChart data={serviceData} title="Top Layanan" isDark />
        <ServicePieChart
          data={paymentData}
          title="Metode Pembayaran (Revenue)"
          isDark
        />

        <div className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-white uppercase">
              Top Pelanggan Sultan
            </h3>
            <Users size={16} className="text-[#C5A059]" />
          </div>
          <div className="space-y-4 flex-1">
            {topCustomers.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      index === 0
                        ? "bg-[#C5A059] text-[#1A1A1A]"
                        : index === 1
                          ? "bg-[#E5E2D9] text-[#1A1A1A]"
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
              <div className="text-center text-[#808080] text-xs py-8">
                Belum ada data pelanggan.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-white uppercase">
              Status Mesin
            </h2>
            <WashingMachine size={16} className="text-[#C5A059]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {machines.slice(0, 8).map((machine) => (
              <div
                key={machine.id}
                className={`p-3 rounded-sm border ${
                  machine.status === "IDLE"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : machine.status === "WASHING"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : machine.status === "OVERDUE"
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-[#2A2A2A]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white">
                    {machine.name}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${machineService.getStatusBgColor(
                      machine.status,
                    )}`}
                  />
                </div>
                <p className="text-[9px] text-[#808080] mt-1">
                  {machineService.getStatusLabel(machine.status)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-white uppercase">
              Transaksi Terbaru
            </h2>
            <Users size={16} className="text-[#C5A059]" />
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 p-3 bg-[#0F0F0F] rounded-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-white truncate">
                      {order.invoiceNumber}
                    </p>
                    <p className="text-[9px] text-[#808080] truncate">
                      {order.customer?.name || "Customer"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-medium text-[#C5A059]">
                      {reportService.formatRevenue(order.totalAmount)}
                    </p>
                    <p
                      className={`text-[9px] font-bold ${orderService.getPaymentStatusColor(
                        order.statusPayment,
                      )}`}
                    >
                      {orderService.getPaymentStatusLabel(order.statusPayment)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-[#808080] text-sm py-8">
                Belum ada transaksi
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-[#C5A059]/10 to-transparent border border-[#C5A059]/20 rounded-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#C5A059] uppercase mb-1">
              Export Laporan
            </h3>
            <p className="text-[#808080] text-sm">
              Download laporan transaksi dalam format CSV
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
