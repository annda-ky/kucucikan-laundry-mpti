"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  WashingMachine,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowRight,
  PieChart,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { reportService } from "@/services/report.service";
import { machineService } from "@/services/machine.service";
import { orderService } from "@/services/order.service";
import { RevenueBarChart } from "@/components/ui/charts/bar-chart";
import { ServicePieChart } from "@/components/ui/charts/pie-chart";
import type { DashboardSummary, Machine, Order } from "@/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [revenueData, setRevenueData] = useState<
    { name: string; value: number }[]
  >([]);
  const [serviceData, setServiceData] = useState<
    { name: string; value: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.username || "Admin");
      } catch {}
    }

    const fetchData = async () => {
      try {
        const [summaryData, machinesData, ordersData] = await Promise.all([
          reportService.getDashboard().catch(() => null),
          machineService.getAll().catch(() => []),
          orderService.getAll().catch(() => []),
        ]);
        if (summaryData) setSummary(summaryData);
        setMachines(machinesData);

        // Process Orders for Charts
        // 1. Weekly Revenue (Last 7 days)
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

        // 2. Service Distribution
        const serviceStats: Record<string, number> = {};
        ordersData.forEach((o) => {
          o.orderItems?.forEach((item) => {
            const name = item.serviceNameSnapshot;
            serviceStats[name] = (serviceStats[name] || 0) + 1; // Count based
          });
        });

        const serviceChartData = Object.entries(serviceStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5
        setServiceData(serviceChartData);

        setRecentOrders(ordersData.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const activeMachines = machines.filter((m) => m.status === "WASHING").length;
  const idleMachines = machines.filter((m) => m.status === "IDLE").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-[#C5A059]" />
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#C5A059] uppercase">
            {getGreeting()}
          </span>
        </div>
        <h2 className="text-3xl font-light tracking-tight text-[#1A1A1A]">
          Halo,{" "}
          <span className="font-medium italic capitalize">{userName}</span>
        </h2>
        <p className="text-[#A19E95] text-sm tracking-wide font-light max-w-md">
          Ringkasan operasional Kucucikan untuk hari ini.
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="group p-8 bg-white border border-[#F0EDE4] rounded-sm transition-all duration-500 hover:border-[#C5A059] hover:shadow-lg">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A19E95]">
                Pendapatan Hari Ini
              </p>
              <TrendingUp
                size={16}
                strokeWidth={1.2}
                className="text-[#C5A059]"
              />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-light text-[#1A1A1A] tracking-tight">
                {summary
                  ? reportService.formatRevenue(summary.totalRevenue)
                  : "Rp 0"}
              </p>
              <p className="text-[9px] font-bold text-[#A19E95] tracking-widest uppercase">
                {summary?.totalTransactions || 0} Transaksi
              </p>
            </div>
          </div>
        </div>

        {/* Active Machines */}
        <div className="group p-8 bg-white border border-[#F0EDE4] rounded-sm transition-all duration-500 hover:border-[#C5A059] hover:shadow-lg">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A19E95]">
                Mesin Aktif
              </p>
              <WashingMachine
                size={16}
                strokeWidth={1.2}
                className="text-[#C5A059]"
              />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-light text-[#1A1A1A] tracking-tight">
                {activeMachines}{" "}
                <span className="text-lg text-[#A19E95]">
                  / {machines.length}
                </span>
              </p>
              <p className="text-[9px] font-bold text-[#A19E95] tracking-widest uppercase">
                {idleMachines} Tersedia
              </p>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="group p-8 bg-white border border-[#F0EDE4] rounded-sm transition-all duration-500 hover:border-[#C5A059] hover:shadow-lg">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A19E95]">
                Order Selesai
              </p>
              <CheckCircle2
                size={16}
                strokeWidth={1.2}
                className="text-[#C5A059]"
              />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-light text-[#1A1A1A] tracking-tight">
                {summary?.completedOrders || 0}
              </p>
              <p className="text-[9px] font-bold text-[#A19E95] tracking-widest uppercase">
                Ready untuk pickup
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Machine Grid Preview */}
      <div className="p-8 bg-white border border-[#F0EDE4] rounded-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#1A1A1A] uppercase">
              Status Mesin
            </h3>
            <p className="text-[10px] text-[#A19E95] mt-1">
              Overview semua mesin cuci
            </p>
          </div>
          <Link
            href="/dashboard/machines"
            className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#C5A059] hover:text-[#1A1A1A] transition-colors"
          >
            LIHAT SEMUA
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {machines.slice(0, 6).map((machine) => (
            <div
              key={machine.id}
              className={`p-4 rounded-sm border text-center transition-all ${
                machine.status === "IDLE"
                  ? "border-emerald-200 bg-emerald-50"
                  : machine.status === "WASHING"
                    ? "border-amber-200 bg-amber-50"
                    : machine.status === "OVERDUE"
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-gray-50"
              }`}
            >
              <WashingMachine
                size={24}
                strokeWidth={1}
                className={`mx-auto mb-2 ${machineService.getStatusColor(machine.status)}`}
              />
              <p className="text-[10px] font-bold text-[#1A1A1A]">
                {machine.name}
              </p>
              <p
                className={`text-[9px] font-medium mt-1 ${machineService.getStatusColor(machine.status)}`}
              >
                {machineService.getStatusLabel(machine.status)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-8 bg-white border border-[#F0EDE4] rounded-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#1A1A1A] uppercase">
              Transaksi Terbaru
            </h3>
            <p className="text-[10px] text-[#A19E95] mt-1">
              5 transaksi terakhir
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#C5A059] hover:text-[#1A1A1A] transition-colors"
          >
            LIHAT SEMUA
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-[#FAF9F6] rounded-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-[#F0EDE4]">
                    <Clock size={16} className="text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#1A1A1A]">
                      {order.invoiceNumber}
                    </p>
                    <p className="text-[10px] text-[#A19E95]">
                      {order.customer?.name || "Customer"} •{" "}
                      {order.customer?.phone || "-"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-medium text-[#1A1A1A]">
                    {reportService.formatRevenue(order.totalAmount)}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${orderService.getPaymentStatusColor(
                      order.statusPayment,
                    )}`}
                  >
                    {orderService.getPaymentStatusLabel(order.statusPayment)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#A19E95]">
            <Clock
              size={32}
              strokeWidth={1}
              className="mx-auto mb-3 opacity-50"
            />
            <p className="text-sm">Belum ada transaksi hari ini</p>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueBarChart
          data={revenueData}
          title="Pendapatan 7 Hari Terakhir"
        />
        <ServicePieChart data={serviceData} title="Layanan Terpopuler" />
      </div>
    </div>
  );
}
